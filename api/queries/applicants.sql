-- name: LockApplicant :one
SELECT * FROM applicants WHERE id=$1 FOR UPDATE;

-- name: FindApplicant :one
SELECT * FROM applicants WHERE email=$1 FOR UPDATE;

-- name: CreateApplicant :one
INSERT INTO applicants(id,email,privacy_version,acknowledged_at,created_at)
VALUES($1,$2,$3,$4,$4) RETURNING *;

-- name: CreateApplicantSession :exec
INSERT INTO sessions(token_hash,csrf,applicant_id,phase,expires_at,touched_at)
VALUES($1,$2,$3,'applicant',$4,$5);

-- name: ApplicantChallenge :one
SELECT * FROM applicant_challenges WHERE id=$1 FOR UPDATE;

-- name: CreateApplicantChallenge :exec
INSERT INTO applicant_challenges(id,session_hash,identity_hash,email,purpose,code_hash,privacy_version,created_at,expires_at)
VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9);
