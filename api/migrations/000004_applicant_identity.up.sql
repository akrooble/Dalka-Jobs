-- Additive applicant identity; privileged password/TOTP accounts remain separate.
CREATE TABLE applicants (
 id text PRIMARY KEY CHECK (id ~ '^[a-f0-9]{32}$'),
 email text UNIQUE CHECK (email IS NULL OR (email = lower(email) AND octet_length(email) <= 254)),
 privacy_version text NOT NULL, acknowledged_at timestamptz NOT NULL,
 deleted_at timestamptz, created_at timestamptz NOT NULL,
 CHECK ((deleted_at IS NULL AND email IS NOT NULL) OR (deleted_at IS NOT NULL AND email IS NULL))
);
ALTER TABLE sessions ADD COLUMN applicant_id text REFERENCES applicants(id) ON DELETE CASCADE;
ALTER TABLE sessions DROP CONSTRAINT sessions_phase_check;
ALTER TABLE sessions DROP CONSTRAINT sessions_check;
ALTER TABLE sessions ADD CONSTRAINT sessions_phase_check CHECK (phase IN ('anonymous','pending','full','applicant'));
ALTER TABLE sessions ADD CONSTRAINT sessions_subject_check CHECK (
 (phase='anonymous' AND account_id IS NULL AND applicant_id IS NULL) OR
 (phase IN ('pending','full') AND account_id IS NOT NULL AND applicant_id IS NULL) OR
 (phase='applicant' AND account_id IS NULL AND applicant_id IS NOT NULL)
);
CREATE INDEX sessions_applicant ON sessions(applicant_id) WHERE applicant_id IS NOT NULL;
CREATE TABLE applicant_challenges (
 id text PRIMARY KEY CHECK (id ~ '^[a-f0-9]{32}$'),
 session_hash bytea NOT NULL REFERENCES sessions(token_hash) ON DELETE CASCADE,
 identity_hash bytea NOT NULL CHECK (octet_length(identity_hash)=32),
 email text NOT NULL, purpose text NOT NULL CHECK (purpose IN ('sign_in','delete_account')),
 code_hash bytea NOT NULL CHECK (octet_length(code_hash)=32), privacy_version text NOT NULL,
 created_at timestamptz NOT NULL, expires_at timestamptz NOT NULL,
 attempts integer NOT NULL DEFAULT 0 CHECK (attempts BETWEEN 0 AND 5),
 invalidated boolean NOT NULL DEFAULT false,
 CHECK (expires_at > created_at)
);
CREATE INDEX applicant_challenges_identity ON applicant_challenges(identity_hash,purpose,created_at DESC);
CREATE INDEX applicant_challenges_expiry ON applicant_challenges(expires_at);
