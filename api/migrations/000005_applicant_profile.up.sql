CREATE TABLE applicant_profiles (
 applicant_id text PRIMARY KEY REFERENCES applicants(id) ON DELETE CASCADE,
 name text NOT NULL DEFAULT '' CHECK (char_length(name)<=100),
 contact_email text, phone text NOT NULL DEFAULT '' CHECK (char_length(phone)<=32),
 location_id text REFERENCES managed_lists(id), bio text NOT NULL DEFAULT '' CHECK (char_length(bio)<=2000),
 version bigint NOT NULL DEFAULT 1 CHECK(version>0), updated_at timestamptz NOT NULL,
 CHECK (contact_email IS NULL OR octet_length(contact_email)<=254)
);
INSERT INTO applicant_profiles(applicant_id,contact_email,updated_at)
 SELECT id,email,created_at FROM applicants WHERE deleted_at IS NULL;
-- Only IDs/times are retained for deletion reconciliation. No profile, address,
-- document contents or note body can enter a deletion receipt.
CREATE TABLE applicant_deletions (
 applicant_id text PRIMARY KEY REFERENCES applicants(id),
 requested_at timestamptz NOT NULL, completed_at timestamptz
);
