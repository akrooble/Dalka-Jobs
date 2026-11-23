-- Preserve canonical labels, identifiers and all job references.
ALTER TABLE managed_lists ADD COLUMN active boolean NOT NULL DEFAULT true;
ALTER TABLE managed_lists ADD COLUMN version bigint NOT NULL DEFAULT 1 CHECK(version > 0);
ALTER TABLE managed_lists ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
CREATE UNIQUE INDEX managed_lists_kind_label_folded ON managed_lists(kind,lower(label));
CREATE INDEX jobs_location_reference ON jobs(location_id);
CREATE INDEX jobs_category_reference ON jobs(category_id);
