-- Owner-reviewed recovery only: loses applicant identities/challenges/sessions.
DELETE FROM sessions WHERE phase='applicant';
DROP TABLE applicant_challenges;
ALTER TABLE sessions DROP CONSTRAINT sessions_subject_check;
ALTER TABLE sessions DROP CONSTRAINT sessions_phase_check;
ALTER TABLE sessions DROP COLUMN applicant_id;
ALTER TABLE sessions ADD CONSTRAINT sessions_phase_check CHECK (phase IN ('anonymous','pending','full'));
ALTER TABLE sessions ADD CONSTRAINT sessions_check CHECK ((phase='anonymous' AND account_id IS NULL) OR (phase<>'anonymous' AND account_id IS NOT NULL));
DROP TABLE applicants;
