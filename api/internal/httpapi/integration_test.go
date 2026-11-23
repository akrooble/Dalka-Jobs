//go:build integration

package httpapi

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/cookiejar"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"sync/atomic"
	"testing"
	"time"

	"github.com/akrooble/Dalka-Jobs/api/internal/auth"
	"github.com/akrooble/Dalka-Jobs/api/internal/localdb"
	"github.com/jackc/pgx/v5"
)

// Owner-run only. Requires explicit opt-in and an empty, migrated check database.
// Never runs setup/migrations/down/drop or targets the development database.
func TestFirstFiveDatabaseIntegration(t *testing.T) {
	if os.Getenv("DALKA_INTEGRATION") != "dalka_jobs_check" {
		t.Skip("owner-run integration requires DALKA_INTEGRATION=dalka_jobs_check")
	}
	password, err := localdb.ReadAppEnv(filepath.Join("..", "..", "..", ".env"))
	if err != nil {
		t.Fatal("local setup prerequisite missing")
	}
	connect := func(ctx context.Context) (*pgx.Conn, error) {
		return localdb.Connect(ctx, "dalka_dev", "dalka_jobs_check", password)
	}
	ctx := context.Background()
	db, err := connect(ctx)
	if err != nil {
		t.Fatal("cannot reach check database")
	}
	// Testing cleanups are LIFO and run after function defers. Keep this
	// connection and the advisory lock alive until fixture cleanup completes.
	t.Cleanup(func() { _ = db.Close(ctx) })
	if localdb.CheckServer(ctx, db) != nil {
		t.Fatal("unsafe check server")
	}
	var locked bool
	if db.QueryRow(ctx, "SELECT pg_try_advisory_lock(482100106)").Scan(&locked) != nil || !locked {
		t.Fatal("another integration run owns the check database")
	}
	t.Cleanup(func() {
		if _, err := db.Exec(ctx, "SELECT pg_advisory_unlock(482100106)"); err != nil {
			t.Error("check advisory unlock failed; connection close will release lock")
		}
	})
	var database string
	var existing int
	if db.QueryRow(ctx, "SELECT current_database()").Scan(&database) != nil || database != "dalka_jobs_check" {
		t.Fatal("wrong database")
	}
	if db.QueryRow(ctx, "SELECT (SELECT count(*) FROM accounts)+(SELECT count(*) FROM companies)+(SELECT count(*) FROM jobs)+(SELECT count(*) FROM sessions)+(SELECT count(*) FROM auth_limits)+(SELECT count(*) FROM applicants)+(SELECT count(*) FROM applicant_challenges)+(SELECT count(*) FROM recruiter_assignments)+(SELECT count(*) FROM activity_events)").Scan(&existing) != nil || existing != 0 {
		t.Fatal("check database must be migrated and empty of test/account/company/job/session/limiter data")
	}
	owner, company, recruiter, companyAdmin, jobID := auth.RandomHex(16), auth.RandomHex(16), auth.RandomHex(16), auth.RandomHex(16), auth.RandomHex(16)
	credential := "synthetic integration password only"
	hash, _ := auth.PasswordHash(credential)
	key := bytes.Repeat([]byte{1}, 32)
	var managedIDs []string
	// Register only after safety/emptiness checks, but before the first insert
	// so a partially failed fixture setup is cleaned while exclusively locked.
	t.Cleanup(func() {
		_, e := db.Exec(ctx, "DELETE FROM activity_events; DELETE FROM recruiter_assignments; DELETE FROM jobs; DELETE FROM recovery_codes; DELETE FROM sessions; DELETE FROM auth_limits; DELETE FROM applicant_deletions; DELETE FROM applicants; DELETE FROM accounts; DELETE FROM companies")
		if e != nil {
			t.Error("check fixture cleanup failed; preserve state for inspection")
		}
		if len(managedIDs) > 0 {
			if _, e = db.Exec(ctx, "DELETE FROM managed_lists WHERE id=ANY($1::text[])", managedIDs); e != nil {
				t.Error("managed fixture cleanup failed; preserve state")
			}
		}
	})
	if _, err = db.Exec(ctx, "INSERT INTO companies(id,name,employer_type) VALUES($1,'Integration company','NGO')", company); err != nil {
		t.Fatal("company fixture")
	}
	for _, u := range []struct {
		id, email, role string
		company         any
	}{{owner, "owner@example.invalid", "super_admin", nil}, {recruiter, "recruiter@example.invalid", "recruiter", nil}, {companyAdmin, "company@example.invalid", "company_admin", company}} {
		if _, err = db.Exec(ctx, "INSERT INTO accounts(id,email,password_hash,role,company_id) VALUES($1,$2,$3,$4,$5)", u.id, u.email, hash, u.role, u.company); err != nil {
			t.Fatal("account fixture")
		}
	}
	var clock atomic.Int64
	clock.Store(time.Date(2026, 11, 4, 9, 0, 0, 0, time.UTC).Unix())
	app := New(connect, "http://127.0.0.1:3000", key)
	app.Now = func() time.Time { return time.Unix(clock.Load(), 0) }
	server := httptest.NewServer(app.Handler())
	defer server.Close()
	client := func() *http.Client {
		jar, _ := cookiejar.New(nil)
		return &http.Client{Jar: jar, Timeout: 15 * time.Second}
	}
	request := func(c *http.Client, method, path, csrf string, body any) (int, map[string]any) {
		var data []byte
		if body != nil {
			data, _ = json.Marshal(body)
		}
		r, e := http.NewRequest(method, server.URL+"/api/v1"+path, bytes.NewReader(data))
		if e != nil {
			t.Fatal("request")
		}
		r.Header.Set("Origin", app.Origin)
		r.Header.Set("Content-Type", "application/json")
		r.Header.Set("X-CSRF-Token", csrf)
		response, e := c.Do(r)
		if e != nil {
			return 0, nil
		}
		defer response.Body.Close()
		var value map[string]any
		_ = json.NewDecoder(response.Body).Decode(&value)
		if response.Header.Get("Cache-Control") != "no-store" {
			t.Error("private response cache policy")
		}
		return response.StatusCode, value
	}
	expect := func(got, want int) {
		t.Helper()
		if got != want {
			t.Fatalf("unexpected HTTP status %d; wanted %d (body omitted to protect credentials)", got, want)
		}
	}
	pending := func(c *http.Client, email string) string {
		status, s := request(c, "GET", "/session", "", nil)
		expect(status, 200)
		status, s = request(c, "POST", "/auth/password", s["csrfToken"].(string), map[string]string{"email": email, "password": credential})
		expect(status, 200)
		if s["state"] != "pending" {
			t.Fatal("password bypassed MFA")
		}
		return s["csrfToken"].(string)
	}
	enroll := func(c *http.Client, email string) (string, string, []any) {
		csrf := pending(c, email)
		status, v := request(c, "GET", "/admin/companies", "", nil)
		expect(status, 403)
		status, _ = request(c, "GET", "/admin/jobs", "", nil)
		expect(status, 403)
		status, _ = request(c, "POST", "/admin/jobs", csrf, validJobInput())
		expect(status, 403)
		status, _ = request(c, "GET", "/admin/lists", "", nil)
		expect(status, 403)
		status, v = request(c, "POST", "/auth/totp/enrollment", csrf, map[string]string{})
		expect(status, 200)
		secret := v["secret"].(string)
		code, _ := auth.Code(secret, clock.Load()/30, 6)
		status, v = request(c, "POST", "/auth/totp/confirm", csrf, map[string]string{"code": code})
		expect(status, 200)
		return v["csrfToken"].(string), secret, v["recoveryCodes"].([]any)
	}
	adminClient := client()
	csrf, ownerSecret, codes := enroll(adminClient, "owner@example.invalid")
	status, _ := request(adminClient, "POST", "/admin/companies", "wrong-token", map[string]string{"name": "Blocked", "employerType": "NGO"})
	expect(status, 403)
	status, created := request(adminClient, "POST", "/admin/companies", csrf, map[string]string{"name": "Created company", "employerType": "Private company"})
	expect(status, 201)
	status, _ = request(adminClient, "POST", "/admin/companies", csrf, map[string]string{"name": "created company", "employerType": "NGO"})
	expect(status, 409)
	id := created["id"].(string)
	status, edited := request(adminClient, "PATCH", "/admin/companies/"+id, csrf, map[string]any{"name": "Edited company", "employerType": "Government", "version": 1})
	expect(status, 200)
	if edited["version"].(float64) != 2 {
		t.Fatal("company version")
	}
	status, _ = request(adminClient, "PATCH", "/admin/companies/"+id, csrf, map[string]any{"name": "Stale overwrite", "employerType": "NGO", "version": 1})
	expect(status, 409)
	status, _ = request(client(), "GET", "/admin/lists", "", nil)
	expect(status, 403)
	status, _ = request(adminClient, "POST", "/admin/lists", "wrong", map[string]any{"kind": "category", "label": "Blocked"})
	expect(status, 403)
	status, newList := request(adminClient, "POST", "/admin/lists", csrf, map[string]any{"kind": "category", "label": "Integration category " + auth.RandomHex(4)})
	expect(status, 201)
	listID := newList["id"].(string)
	managedIDs = append(managedIDs, listID)
	listName := newList["label"].(string)
	status, _ = request(adminClient, "POST", "/admin/lists", csrf, map[string]any{"kind": "category", "label": strings.ToLower(listName)})
	expect(status, 409)
	status, _ = request(adminClient, "PATCH", "/admin/lists/"+listID, csrf, map[string]any{"label": listName, "active": false, "version": 1})
	expect(status, 200)
	status, _ = request(adminClient, "PATCH", "/admin/lists/"+listID, csrf, map[string]any{"label": listName, "active": true, "version": 1})
	expect(status, 409)
	status, publicLists := request(client(), "GET", "/public/lists", "", nil)
	expect(status, 200)
	for _, entry := range publicLists["items"].([]any) {
		if entry.(map[string]any)["id"] == listID {
			t.Fatal("inactive list leaked publicly")
		}
	}
	inactiveJob := validJobInput()
	inactiveJob.CompanyID = company
	inactiveJob.CategoryID = listID
	status, _ = request(adminClient, "POST", "/admin/jobs", csrf, inactiveJob)
	expect(status, 422)
	status, _ = request(adminClient, "GET", "/public/jobs?categoryId="+listID, "", nil)
	expect(status, 422)
	status, _ = request(adminClient, "PATCH", "/admin/lists/"+listID, csrf, map[string]any{"label": listName, "active": true, "version": 2})
	expect(status, 200)
	// Authoring uses real API writes; draft/archived records never leak publicly.
	draft := validJobInput()
	draft.CompanyID = company
	draft.CategoryID = listID
	status, _ = request(client(), "GET", "/admin/jobs", "", nil)
	expect(status, 403)
	status, _ = request(adminClient, "POST", "/admin/jobs", "wrong", draft)
	expect(status, 403)
	status, authored := request(adminClient, "POST", "/admin/jobs", csrf, draft)
	expect(status, 201)
	authoredID, slug := authored["id"].(string), authored["slug"].(string)
	if authored["status"] != "draft" || authored["version"] != float64(1) {
		t.Fatal("draft creation")
	}
	status, _ = request(client(), "GET", "/public/jobs/"+slug, "", nil)
	expect(status, 404)
	status, persisted := request(adminClient, "GET", "/admin/jobs/"+authoredID, "", nil)
	expect(status, 200)
	if persisted["title"] != draft.Title {
		t.Fatal("draft persistence")
	}
	status, _ = request(adminClient, "PATCH", "/admin/lists/"+listID, csrf, map[string]any{"label": listName, "active": false, "version": 3})
	expect(status, 409)
	status, renamedList := request(adminClient, "PATCH", "/admin/lists/"+listID, csrf, map[string]any{"label": listName + " renamed", "active": true, "version": 3})
	expect(status, 200)
	if renamedList["jobCount"] != float64(1) {
		t.Fatal("referenced draft count")
	}
	status, persisted = request(adminClient, "GET", "/admin/jobs/"+authoredID, "", nil)
	expect(status, 200)
	if persisted["category"] != listName+" renamed" {
		t.Fatal("rename lost job reference")
	}
	draft.Version = 1
	invalidReference := draft
	invalidReference.CategoryID = "loc-mogadishu"
	status, _ = request(adminClient, "PATCH", "/admin/jobs/"+authoredID, csrf, invalidReference)
	expect(status, 422)
	wrongCompany := draft
	wrongCompany.CompanyID = id
	status, _ = request(adminClient, "PATCH", "/admin/jobs/"+authoredID, csrf, wrongCompany)
	expect(status, 422)
	onsite := draft
	onsite.ApplicationMethod = "Dalka recruitment"
	onsite.Destination = ""
	onsite.Status = "published"
	status, _ = request(adminClient, "PATCH", "/admin/jobs/"+authoredID, csrf, onsite)
	expect(status, 422)
	// Concurrent version-1 edits must produce exactly one winner.
	editResults := make(chan int, 2)
	var edits sync.WaitGroup
	for range 2 {
		edits.Add(1)
		go func() {
			defer edits.Done()
			s, _ := request(adminClient, "PATCH", "/admin/jobs/"+authoredID, csrf, draft)
			editResults <- s
		}()
	}
	edits.Wait()
	close(editResults)
	winners, conflicts := 0, 0
	for s := range editResults {
		if s == 200 {
			winners++
		} else if s == 409 {
			conflicts++
		} else {
			t.Fatalf("concurrent job edit %d", s)
		}
	}
	if winners != 1 || conflicts != 1 {
		t.Fatal("job edit lost update")
	}
	draft.Version = 2
	draft.Status = "published"
	clock.Add(60)
	status, published := request(adminClient, "PATCH", "/admin/jobs/"+authoredID, csrf, draft)
	expect(status, 200)
	firstPosted := published["postedAt"]
	if firstPosted != app.Now().UTC().Format(time.RFC3339) {
		t.Fatal("first publication timestamp")
	}
	status, _ = request(client(), "GET", "/public/jobs/"+slug, "", nil)
	expect(status, 200)
	draft.Version = 3
	draft.Title = "Edited public title"
	clock.Add(60)
	status, updated := request(adminClient, "PATCH", "/admin/jobs/"+authoredID, csrf, draft)
	expect(status, 200)
	if updated["slug"] != slug || updated["postedAt"] != firstPosted {
		t.Fatal("public URL or publication order changed")
	}
	draft.Version = 4
	draft.Status = "archived"
	status, _ = request(adminClient, "PATCH", "/admin/jobs/"+authoredID, csrf, draft)
	expect(status, 200)
	status, _ = request(client(), "GET", "/public/jobs/"+slug, "", nil)
	expect(status, 404)
	status, filtered := request(adminClient, "GET", "/admin/jobs?status=archived&q=Edited%20public&pageSize=1", "", nil)
	expect(status, 200)
	if filtered["total"] != float64(1) {
		t.Fatal("job filter")
	}
	status, _ = request(adminClient, "GET", "/admin/jobs?status=deleted", "", nil)
	expect(status, 422)
	// Concurrent API deactivation/authoring must never leave an inactive reference.
	status, raceList := request(adminClient, "POST", "/admin/lists", csrf, map[string]any{"kind": "category", "label": "Race category " + auth.RandomHex(4)})
	expect(status, 201)
	raceID := raceList["id"].(string)
	managedIDs = append(managedIDs, raceID)
	raceJob := validJobInput()
	raceJob.CompanyID = company
	raceJob.CategoryID = raceID
	raceStart := make(chan struct{})
	raceResults := make(chan struct {
		kind   string
		status int
	}, 2)
	go func() {
		<-raceStart
		s, _ := request(adminClient, "POST", "/admin/jobs", csrf, raceJob)
		raceResults <- struct {
			kind   string
			status int
		}{"job", s}
	}()
	go func() {
		<-raceStart
		s, _ := request(adminClient, "PATCH", "/admin/lists/"+raceID, csrf, map[string]any{"label": raceList["label"], "active": false, "version": 1})
		raceResults <- struct {
			kind   string
			status int
		}{"list", s}
	}()
	close(raceStart)
	raceStatus := map[string]int{}
	for range 2 {
		out := <-raceResults
		raceStatus[out.kind] = out.status
	}
	if !(raceStatus["job"] == 201 && raceStatus["list"] == 409 || raceStatus["job"] == 422 && raceStatus["list"] == 200) {
		t.Fatalf("unsafe race outcomes: %v", raceStatus)
	}
	status, raceState := request(adminClient, "GET", "/admin/lists/"+raceID, "", nil)
	expect(status, 200)
	if raceState["active"] == false && raceState["jobCount"].(float64) > 0 {
		t.Fatal("inactive reference after concurrent writes")
	}
	for _, email := range []string{"recruiter@example.invalid", "company@example.invalid"} {
		c := client()
		token, _, _ := enroll(c, email)
		for _, path := range []string{"/admin/users", "/admin/assignments", "/admin/activity", "/admin/overview"} {
			status, _ = request(c, "GET", path, "", nil)
			expect(status, 403)
		}
		if email == "recruiter@example.invalid" {
			status, scope := request(c, "GET", "/recruiter/jobs", "", nil)
			expect(status, 200)
			if scope["total"] != float64(0) {
				t.Fatal("unassigned job leaked")
			}
			status, _ = request(c, "GET", "/company/jobs", "", nil)
			expect(status, 403)
			status, assignment := request(adminClient, "POST", "/admin/assignments", csrf, map[string]string{"jobId": authoredID, "accountId": recruiter})
			expect(status, 201)
			assignmentID := assignment["id"].(string)
			status, _ = request(adminClient, "POST", "/admin/assignments", csrf, map[string]string{"jobId": authoredID, "accountId": recruiter})
			expect(status, 409)
			status, scope = request(c, "GET", "/recruiter/jobs?jobId="+authoredID, "", nil)
			expect(status, 200)
			if scope["total"] != float64(1) {
				t.Fatal("assigned job unavailable")
			}
			status, _ = request(adminClient, "PATCH", "/admin/assignments/"+assignmentID, csrf, map[string]any{"active": false, "version": 1})
			expect(status, 200)
			status, _ = request(c, "GET", "/recruiter/jobs?jobId="+authoredID, "", nil)
			expect(status, 404)
			status, _ = request(adminClient, "PATCH", "/admin/assignments/"+assignmentID, csrf, map[string]any{"active": true, "version": 1})
			expect(status, 409)
			status, _ = request(adminClient, "PATCH", "/admin/assignments/"+assignmentID, csrf, map[string]any{"active": true, "version": 2})
			expect(status, 200)
			status, _ = request(adminClient, "PATCH", "/admin/users/"+recruiter, csrf, map[string]any{"active": false, "version": 1})
			expect(status, 200)
			status, _ = request(c, "GET", "/recruiter/jobs", "", nil)
			expect(status, 403)
			status, _ = request(adminClient, "PATCH", "/admin/users/"+recruiter, csrf, map[string]any{"active": true, "version": 2})
			expect(status, 200)
			status, _ = request(c, "GET", "/recruiter/jobs", "", nil)
			expect(status, 403)
			status, _ = request(adminClient, "PATCH", "/admin/users/"+owner, csrf, map[string]any{"active": false, "version": 1})
			expect(status, 403)
		} else {
			status, scope := request(c, "GET", "/company/jobs?jobId="+authoredID, "", nil)
			expect(status, 200)
			if scope["total"] != float64(1) {
				t.Fatal("own company job unavailable")
			}
			foreignDraft := validJobInput()
			foreignDraft.CompanyID = id
			status, foreign := request(adminClient, "POST", "/admin/jobs", csrf, foreignDraft)
			expect(status, 201)
			status, _ = request(c, "GET", "/company/jobs?jobId="+foreign["id"].(string), "", nil)
			expect(status, 404)
			status, _ = request(c, "GET", "/company/jobs?jobId="+strings.Repeat("f", 32), "", nil)
			expect(status, 404)
			status, _ = request(c, "GET", "/recruiter/jobs", "", nil)
			expect(status, 403)
		}
		status, _ = request(c, "GET", "/admin/companies", "", nil)
		expect(status, 403)
		status, _ = request(c, "POST", "/admin/companies", token, map[string]string{"name": "Forged write", "employerType": "NGO"})
		expect(status, 403)
		for _, path := range []string{"/admin/jobs", "/admin/jobs/" + authoredID} {
			status, _ = request(c, "GET", path, "", nil)
			expect(status, 403)
		}
		status, _ = request(c, "POST", "/admin/jobs", token, draft)
		expect(status, 403)
		status, _ = request(c, "PATCH", "/admin/jobs/"+authoredID, token, draft)
		expect(status, 403)
		for _, path := range []string{"/admin/lists", "/admin/lists/" + listID} {
			status, _ = request(c, "GET", path, "", nil)
			expect(status, 403)
		}
		status, _ = request(c, "POST", "/admin/lists", token, map[string]any{"kind": "location", "label": "Forbidden"})
		expect(status, 403)
		status, _ = request(c, "PATCH", "/admin/lists/"+listID, token, map[string]any{"label": "Forbidden", "active": true, "version": 4})
		expect(status, 403)
	}
	if _, err = db.Exec(ctx, "INSERT INTO jobs(id,company_id,slug,title,description,location_id,category_id,job_type,arrangement,status,application_method,destination,posted_at,closes_at) VALUES($1,$2,'integration-job','Integration vacancy','Synthetic disposable fixture only','loc-mogadishu','cat-ict','Full-time','On-site','published','Company website','https://example.invalid/apply',$3,$4)", jobID, company, app.Now(), app.Now().Add(time.Minute)); err != nil {
		t.Fatal("job fixture")
	}
	anonymous := client()
	status, listed := request(anonymous, "GET", "/public/jobs?closingSoon=true", "", nil)
	expect(status, 200)
	if listed["total"].(float64) != 1 {
		t.Fatal("public published job missing")
	}
	status, _ = request(anonymous, "GET", "/public/jobs/integration-job", "", nil)
	expect(status, 200)
	clock.Add(120)
	status, _ = request(anonymous, "GET", "/public/jobs/integration-job", "", nil)
	expect(status, 404)
	status, listed = request(anonymous, "GET", "/public/jobs", "", nil)
	expect(status, 200)
	if listed["total"].(float64) != 0 {
		t.Fatal("expired job returned")
	}
	// Two pending sessions contend on the same account: recovery must not deadlock
	// against MFA confirmation and all pre-recovery sessions must be revoked.
	first, second := client(), client()
	firstCSRF := pending(first, "owner@example.invalid")
	secondCSRF := pending(second, "owner@example.invalid")
	code, _ := auth.Code(ownerSecret, clock.Load()/30, 6)
	start := make(chan struct{})
	results := make(chan int, 2)
	var group sync.WaitGroup
	group.Add(2)
	go func() {
		defer group.Done()
		<-start
		s, _ := request(first, "POST", "/auth/recovery", firstCSRF, map[string]string{"code": codes[0].(string)})
		results <- s
	}()
	go func() {
		defer group.Done()
		<-start
		s, _ := request(second, "POST", "/auth/totp/confirm", secondCSRF, map[string]string{"code": code})
		results <- s
	}()
	close(start)
	group.Wait()
	close(results)
	successes := 0
	for s := range results {
		if s != 200 && s != 403 {
			t.Fatalf("concurrent recovery/MFA status %d", s)
		}
		if s == 200 {
			successes++
		}
	}
	if successes == 0 {
		t.Fatal("recovery did not progress")
	}
	status, _ = request(adminClient, "GET", "/admin/companies", "", nil)
	expect(status, 403)
	// Expired pending logout must clear its cookie, but a live session must still reject a wrong CSRF token.
	expiring := client()
	expiredToken := pending(expiring, "owner@example.invalid")
	status, _ = request(expiring, "POST", "/auth/logout", "incorrect", map[string]string{})
	expect(status, 403)
	clock.Add(301)
	status, _ = request(expiring, "POST", "/auth/logout", expiredToken, map[string]string{})
	expect(status, 200)
	status, fresh := request(expiring, "GET", "/session", "", nil)
	expect(status, 200)
	if fresh["state"] != "anonymous" {
		t.Fatal("expired logout left privileged state")
	}
	runApplicantAuthChecks(t, app, client, request, expect, &clock)
}
