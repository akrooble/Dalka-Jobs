-- Additive authoring metadata. Existing public URLs and content are preserved.
ALTER TABLE jobs ADD COLUMN version bigint NOT NULL DEFAULT 1 CHECK (version > 0);
ALTER TABLE jobs ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE jobs ADD COLUMN first_published_at timestamptz;
UPDATE jobs SET first_published_at=posted_at WHERE status IN ('published','archived');
