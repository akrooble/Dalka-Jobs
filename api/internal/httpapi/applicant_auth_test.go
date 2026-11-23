package httpapi

import (
	"testing"
	"time"

	"github.com/akrooble/Dalka-Jobs/api/internal/store"
	"github.com/jackc/pgx/v5/pgtype"
)

func TestSessionSubjectCannotCrossPrivilegeBoundary(t *testing.T) {
	id := pgtype.Text{String: "synthetic", Valid: true}
	for _, v := range []struct {
		phase              string
		account, applicant pgtype.Text
		valid              bool
	}{{"anonymous", pgtype.Text{}, pgtype.Text{}, true}, {"pending", id, pgtype.Text{}, true}, {"full", id, pgtype.Text{}, true}, {"applicant", pgtype.Text{}, id, true}, {"full", pgtype.Text{}, id, false}, {"applicant", id, id, false}, {"anonymous", id, pgtype.Text{}, false}, {"unknown", pgtype.Text{}, pgtype.Text{}, false}} {
		if validSessionSubject(store.Session{Phase: v.phase, AccountID: v.account, ApplicantID: v.applicant}) != v.valid {
			t.Fatalf("subject constraint failed for %s", v.phase)
		}
	}
}
func TestSessionAbsoluteAndIdleBoundaries(t *testing.T) {
	now := time.Date(2026, 11, 23, 9, 0, 0, 0, time.UTC)
	for _, v := range []struct {
		phase   string
		idle    time.Duration
		expired bool
	}{{"full", 30 * time.Minute, true}, {"full", 30*time.Minute - time.Nanosecond, false}, {"applicant", 24 * time.Hour, true}, {"applicant", 24*time.Hour - time.Nanosecond, false}, {"anonymous", time.Hour, false}} {
		s := store.Session{Phase: v.phase, ExpiresAt: ts(now.Add(time.Hour)), TouchedAt: ts(now.Add(-v.idle))}
		if sessionExpired(s, now) != v.expired {
			t.Fatalf("idle boundary for %s", v.phase)
		}
		s.ExpiresAt = ts(now)
		if !sessionExpired(s, now) {
			t.Fatal("exact absolute boundary accepted")
		}
	}
}
