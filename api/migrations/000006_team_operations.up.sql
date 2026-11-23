ALTER TABLE accounts ADD COLUMN version bigint NOT NULL DEFAULT 1 CHECK(version>0);
CREATE TABLE recruiter_assignments (
 id text PRIMARY KEY CHECK(id ~ '^[a-f0-9]{32}$'),
 job_id text NOT NULL REFERENCES jobs(id), account_id text NOT NULL REFERENCES accounts(id),
 active boolean NOT NULL DEFAULT true, version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 updated_at timestamptz NOT NULL, UNIQUE(job_id,account_id)
);
CREATE INDEX recruiter_assignments_account ON recruiter_assignments(account_id,job_id) WHERE active=true;
CREATE TABLE activity_events (
 id text PRIMARY KEY CHECK(id ~ '^[a-f0-9]{32}$'), actor_id text NOT NULL,
 record_id text NOT NULL, action text NOT NULL CHECK(action IN ('account_state','assignment_state')),
 occurred_at timestamptz NOT NULL, expires_at timestamptz NOT NULL CHECK(expires_at>occurred_at)
);
CREATE INDEX activity_events_recent ON activity_events(occurred_at DESC,id DESC);
