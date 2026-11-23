-- name: Lists :many
SELECT id,kind,label FROM managed_lists WHERE active=true ORDER BY kind,label;

-- name: AdminList :one
SELECT m.*,(SELECT count(*) FROM jobs j WHERE j.location_id=m.id OR j.category_id=m.id)::bigint AS job_count FROM managed_lists m WHERE m.id=$1;

-- name: CreateManagedList :one
INSERT INTO managed_lists(id,kind,label,updated_at) VALUES($1,$2,$3,$4) RETURNING id;

-- name: EditManagedList :one
UPDATE managed_lists SET label=$2,active=$3,version=version+1,updated_at=$4 WHERE id=$1 AND version=$5 RETURNING id;

-- name: FindAccount :one
SELECT * FROM accounts WHERE email=$1 FOR UPDATE;

-- name: LockAccount :one
SELECT * FROM accounts WHERE id=$1 FOR UPDATE;

-- name: LockSession :one
SELECT * FROM sessions WHERE token_hash=$1 FOR UPDATE;

-- name: ReadSession :one
SELECT * FROM sessions WHERE token_hash=$1;

-- name: DeleteSession :exec
DELETE FROM sessions WHERE token_hash=$1;

-- name: InsertSession :exec
INSERT INTO sessions(token_hash,csrf,account_id,phase,expires_at,touched_at) VALUES($1,$2,$3,$4,$5,$6);

-- name: CompanyByID :one
SELECT * FROM companies WHERE id=$1;

-- name: CreateCompany :one
INSERT INTO companies(id,name,employer_type) VALUES($1,$2,$3) RETURNING *;

-- name: EditCompany :one
UPDATE companies SET name=$2,employer_type=$3,version=version+1,updated_at=now() WHERE id=$1 AND version=$4 RETURNING *;

-- name: PublicJob :one
SELECT j.*,c.name AS employer,c.employer_type,l.label AS location,g.label AS category
FROM jobs j JOIN companies c ON c.id=j.company_id JOIN managed_lists l ON l.id=j.location_id AND l.kind='location' JOIN managed_lists g ON g.id=j.category_id AND g.kind='category'
WHERE j.slug=$1 AND j.status='published' AND j.closes_at>$2;

-- name: AdminJob :one
SELECT j.*,c.name AS employer,c.employer_type,l.label AS location,g.label AS category
FROM jobs j JOIN companies c ON c.id=j.company_id JOIN managed_lists l ON l.id=j.location_id AND l.kind='location' JOIN managed_lists g ON g.id=j.category_id AND g.kind='category'
WHERE j.id=$1;

-- name: CreateJob :one
INSERT INTO jobs(id,company_id,slug,title,description,location_id,category_id,job_type,arrangement,application_method,destination,posted_at,closes_at,updated_at)
VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$12) RETURNING id;

-- name: EditJob :one
UPDATE jobs SET title=$2,description=$3,location_id=$4,category_id=$5,job_type=$6,arrangement=$7,application_method=$8,destination=$9,closes_at=$10,status=$11,
posted_at=CASE WHEN first_published_at IS NULL AND $11='published' THEN $12 ELSE posted_at END,
first_published_at=CASE WHEN first_published_at IS NULL AND $11='published' THEN $12 ELSE first_published_at END,
updated_at=$12,version=version+1 WHERE id=$1 AND version=$13 AND company_id=$14 RETURNING id;
