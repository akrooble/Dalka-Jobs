//go:build integration

package httpapi

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"sort"
	"strings"
	"sync"
	"sync/atomic"
	"testing"

	"github.com/akrooble/Dalka-Jobs/api/internal/auth"
)

type capturedApplicantSender struct {
	mu       sync.Mutex
	messages map[string]auth.ApplicantMessage
	fail     bool
}

func (s *capturedApplicantSender) Send(_ context.Context, m auth.ApplicantMessage) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.fail {
		return errors.New("synthetic delivery failure")
	}
	s.messages[m.Challenge] = m
	return nil
}
func (s *capturedApplicantSender) code(id string) string {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.messages[id].Code
}

// Invoked only inside the original owner-opted-in empty check DB harness, under
// its advisory lock and fixture cleanup. No second database configuration path.
func runApplicantAuthChecks(t *testing.T, app *App, client func() *http.Client, request func(*http.Client, string, string, string, any) (int, map[string]any), expect func(int, int), clock *atomic.Int64) {
	t.Helper()
	sender := &capturedApplicantSender{messages: map[string]auth.ApplicantMessage{}}
	app.ApplicantSender = sender
	anonymous := func(c *http.Client) string {
		status, v := request(c, "GET", "/session", "", nil)
		expect(status, 200)
		return v["csrfToken"].(string)
	}
	send := func(c *http.Client, csrf, email string) (int, map[string]any) {
		return request(c, "POST", "/auth/applicant/request", csrf, map[string]any{"email": email, "privacyVersion": auth.SyntheticPrivacyVersion, "accepted": true})
	}
	verify := func(c *http.Client, csrf, id, code string) (int, map[string]any) {
		return request(c, "POST", "/auth/applicant/verify", csrf, map[string]string{"challengeId": id, "code": code})
	}
	c := client()
	csrf := anonymous(c)
	status, _ := send(c, csrf, "real@example.com")
	expect(status, 422)
	status, _ = request(c, "POST", "/auth/applicant/request", csrf, map[string]any{"email": "a@example.invalid", "privacyVersion": auth.SyntheticPrivacyVersion, "accepted": false})
	expect(status, 422)
	// Same email as privileged owner still creates only a separate applicant.
	status, v := send(c, csrf, "owner@example.invalid")
	expect(status, 202)
	id := v["challengeId"].(string)
	if _, exists := v["code"]; exists {
		t.Fatal("response leaked code")
	}
	other := client()
	otherCSRF := anonymous(other)
	status, _ = verify(other, otherCSRF, id, sender.code(id))
	expect(status, 401)
	status, _ = verify(c, csrf, id, "00000x")
	expect(status, 401)
	status, v = verify(c, csrf, id, sender.code(id))
	expect(status, 200)
	if v["state"] != "applicant" || v["subject"] != "applicant" || v["role"] != nil {
		t.Fatal("applicant identity acquired team authority")
	}
	applicantCSRF := v["csrfToken"].(string)
	if applicantCSRF == csrf {
		t.Fatal("CSRF did not rotate")
	}
	for _, path := range []string{"/admin/companies", "/admin/jobs", "/admin/lists"} {
		status, _ = request(c, "GET", path, "", nil)
		expect(status, 403)
	}
	status, _ = request(c, "POST", "/auth/password", applicantCSRF, map[string]string{"email": "owner@example.invalid", "password": "synthetic integration password only"})
	expect(status, 403)
	status, v = request(c, "GET", "/session", "", nil)
	expect(status, 200)
	if v["state"] != "applicant" {
		t.Fatal("reload lost applicant session")
	}
	status, _ = request(c, "POST", "/auth/logout", "wrong", map[string]string{})
	expect(status, 403)
	status, _ = request(c, "POST", "/auth/logout", applicantCSRF, map[string]string{})
	expect(status, 200)
	csrf = anonymous(c)
	status, _ = verify(c, csrf, id, sender.code(id))
	expect(status, 401)
	// Resends across different browsers invalidate earlier codes and obey floor.
	status, v = send(c, csrf, "resend@example.invalid")
	expect(status, 202)
	first := v["challengeId"].(string)
	status, _ = send(other, otherCSRF, "resend@example.invalid")
	expect(status, 429)
	clock.Add(60)
	status, v = send(other, otherCSRF, "resend@example.invalid")
	expect(status, 202)
	second := v["challengeId"].(string)
	status, _ = verify(c, csrf, first, sender.code(first))
	expect(status, 401)
	// Concurrent attempts consume one code once; the loser cannot sign in.
	start := make(chan struct{})
	out := make(chan int, 2)
	for i := 0; i < 2; i++ {
		go func() { <-start; s, _ := verify(other, otherCSRF, second, sender.code(second)); out <- s }()
	}
	close(start)
	successes := 0
	for i := 0; i < 2; i++ {
		s := <-out
		if s == 200 {
			successes++
		} else if s != 403 {
			t.Fatal("unexpected concurrent verification outcome")
		}
	}
	if successes != 1 {
		t.Fatal("one-use verification failed")
	}
	// Wrong-code budget is durable and a later correct code cannot bypass it.
	locked := client()
	lockedCSRF := anonymous(locked)
	status, v = send(locked, lockedCSRF, "locked@example.invalid")
	expect(status, 202)
	lockedID := v["challengeId"].(string)
	wrong := "000000"
	if sender.code(lockedID) == wrong {
		wrong = "111111"
	}
	for i := 0; i < 5; i++ {
		status, _ = verify(locked, lockedCSRF, lockedID, wrong)
		expect(status, 401)
	}
	status, _ = verify(locked, lockedCSRF, lockedID, sender.code(lockedID))
	expect(status, 429)
	// The anonymous session survives beyond five minutes, but exact code expiry
	// at ten minutes fails. Refresh creates no implicit authenticated identity.
	clock.Add(3601) // reset peer verification/send windows without touching DB.
	expiring := client()
	expiringCSRF := anonymous(expiring)
	status, v = send(expiring, expiringCSRF, "expiry@example.invalid")
	expect(status, 202)
	expiresID := v["challengeId"].(string)
	clock.Add(301)
	status, _ = verify(expiring, expiringCSRF, expiresID, "bad000")
	expect(status, 401)
	clock.Add(299)
	status, _ = verify(expiring, expiringCSRF, expiresID, sender.code(expiresID))
	expect(status, 403)
	// Delivery failure returns no usable ID and preserves persisted throttling.
	failed := client()
	failedCSRF := anonymous(failed)
	sender.fail = true
	status, v = send(failed, failedCSRF, "delivery@example.invalid")
	expect(status, 503)
	if v["challengeId"] != nil || strings.Contains(v["error"].(map[string]any)["message"].(string), "synthetic delivery failure") {
		t.Fatal("delivery failure leaked details")
	}
	sender.fail = false
	status, _ = send(failed, failedCSRF, "delivery@example.invalid")
	expect(status, 429)

	t.Run("own profile and purpose-bound deletion", func(t *testing.T) {
		clock.Add(3601)
		a := client()
		aCSRF := anonymous(a)
		status, v := send(a, aCSRF, "owner@example.invalid")
		expect(status, 202)
		challenge := v["challengeId"].(string)
		signInCode := sender.code(challenge)
		status, v = verify(a, aCSRF, challenge, signInCode)
		expect(status, 200)
		aCSRF = v["csrfToken"].(string)
		status, p := request(a, "GET", "/applicant/profile", "", nil)
		expect(status, 200)
		if p["loginEmail"] != "owner@example.invalid" {
			t.Fatal("own profile identity mismatch")
		}
		body := map[string]any{"name": "Fictional Applicant", "contactEmail": "contact@example.invalid", "phone": "", "locationId": "loc-mogadishu", "bio": "Fictional experience only.", "version": p["version"]}
		status, p = request(a, "PATCH", "/applicant/profile", aCSRF, body)
		expect(status, 200)
		if p["name"] != "Fictional Applicant" || p["loginEmail"] != "owner@example.invalid" {
			t.Fatal("profile save or immutable identity failed")
		}
		status, _ = request(a, "PATCH", "/applicant/profile", aCSRF, body)
		expect(status, 409)
		body["applicantId"] = strings.Repeat("a", 32)
		status, _ = request(a, "PATCH", "/applicant/profile", aCSRF, body)
		expect(status, 422)
		status, _ = request(a, "GET", "/applicant/profile?applicantId="+strings.Repeat("a", 32), "", nil)
		expect(status, 422)
		status, _ = request(a, "GET", "/applicant/cv", "", nil)
		expect(status, 503)
		b := client()
		bCSRF := anonymous(b)
		status, v = send(b, bCSRF, "other@example.invalid")
		expect(status, 202)
		otherID := v["challengeId"].(string)
		status, v = verify(b, bCSRF, otherID, sender.code(otherID))
		expect(status, 200)
		bCSRF = v["csrfToken"].(string)
		status, p = request(b, "GET", "/applicant/profile", "", nil)
		expect(status, 200)
		if p["name"] == "Fictional Applicant" || p["loginEmail"] != "other@example.invalid" {
			t.Fatal("cross-applicant profile leak")
		}
		status, v = request(a, "POST", "/applicant/deletion/request", aCSRF, map[string]any{})
		expect(status, 202)
		deletionID := v["challengeId"].(string)
		confirm := func(c *http.Client, csrf, id, code string) (int, map[string]any) {
			return request(c, "POST", "/applicant/deletion/confirm", csrf, map[string]any{"challengeId": id, "code": code, "confirmed": true})
		}
		status, _ = confirm(b, bCSRF, deletionID, sender.code(deletionID))
		expect(status, 401)
		status, _ = confirm(a, aCSRF, challenge, signInCode)
		expect(status, 401)
		status, v = confirm(a, aCSRF, deletionID, sender.code(deletionID))
		expect(status, 200)
		if v["state"] != "deleted" {
			t.Fatal("deletion not confirmed")
		}
		status, _ = request(a, "GET", "/applicant/profile", "", nil)
		expect(status, 403)
		aCSRF = anonymous(a)
		status, _ = request(a, "POST", "/auth/password", aCSRF, map[string]string{"email": "owner@example.invalid", "password": "synthetic integration password only"})
		expect(status, 200)
		status, _ = request(b, "GET", "/applicant/profile", "", nil)
		expect(status, 200)
	})
	t.Run("persisted hourly identity budgets", func(t *testing.T) {
		clock.Add(3601)
		c := client()
		csrf := anonymous(c)
		for i := 0; i < 5; i++ {
			status, v := send(c, csrf, "budget@example.invalid")
			expect(status, 202)
			id := v["challengeId"].(string)
			if i < 4 {
				wrong := "000000"
				if sender.code(id) == wrong {
					wrong = "111111"
				}
				for j := 0; j < 5; j++ {
					status, _ = verify(c, csrf, id, wrong)
					expect(status, 401)
				}
			} else {
				status, _ = verify(c, csrf, id, sender.code(id))
				expect(status, 429)
			}
			clock.Add(60)
		}
		status, _ := send(c, csrf, "budget@example.invalid")
		expect(status, 429)
		clock.Add(3601)
		csrf = anonymous(c)
		status, _ = send(c, csrf, "budget@example.invalid")
		expect(status, 202)
	})
	t.Run("peer budgets persist across browsers and concurrent sends", func(t *testing.T) {
		clock.Add(3601)
		for i := 0; i < 20; i++ {
			c := client()
			csrf := anonymous(c)
			status, _ := send(c, csrf, fmt.Sprintf("peer-%d@example.invalid", i))
			expect(status, 202)
		}
		c := client()
		csrf := anonymous(c)
		status, _ := send(c, csrf, "peer-blocked@example.invalid")
		expect(status, 429)
		for i := 0; i < 20; i++ {
			status, _ = verify(c, csrf, strings.Repeat("f", 32), "123456")
			expect(status, 401)
		}
		status, _ = verify(c, csrf, strings.Repeat("f", 32), "123456")
		expect(status, 429)
		clock.Add(3601)
		first, second := client(), client()
		firstCSRF, secondCSRF := anonymous(first), anonymous(second)
		start := make(chan struct{})
		out := make(chan int, 2)
		for _, v := range []struct {
			c    *http.Client
			csrf string
		}{{first, firstCSRF}, {second, secondCSRF}} {
			go func() { <-start; s, _ := send(v.c, v.csrf, "concurrent-send@example.invalid"); out <- s }()
		}
		close(start)
		statuses := []int{<-out, <-out}
		sort.Ints(statuses)
		if statuses[0] != 202 || statuses[1] != 429 {
			t.Fatal("concurrent resend bypassed persisted floor")
		}
	})
}
