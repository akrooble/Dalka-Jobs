-- Owner-authorised disposable recovery testing only; loses authoring metadata.
-- Never run automatically or against real data.
ALTER TABLE jobs DROP COLUMN first_published_at;
ALTER TABLE jobs DROP COLUMN updated_at;
ALTER TABLE jobs DROP COLUMN version;
