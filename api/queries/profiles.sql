-- name: ApplicantProfile :one
SELECT * FROM applicant_profiles WHERE applicant_id=$1;

-- name: CreateApplicantProfile :exec
INSERT INTO applicant_profiles(applicant_id,contact_email,updated_at) VALUES($1,$2,$3);

-- name: EditApplicantProfile :one
UPDATE applicant_profiles SET name=$2,contact_email=$3,phone=$4,location_id=$5,bio=$6,version=version+1,updated_at=$7
WHERE applicant_id=$1 AND version=$8 RETURNING *;
