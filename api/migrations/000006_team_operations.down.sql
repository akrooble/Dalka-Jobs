-- Owner-only reviewed recovery; destroys new assignment/audit state. Not run.
DROP TABLE activity_events;
DROP TABLE recruiter_assignments;
ALTER TABLE accounts DROP COLUMN version;
