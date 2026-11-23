-- Owner-authorised disposable recovery only. Loses state/version metadata;
-- deactivated values would become publicly selectable again. Never automatic.
DROP INDEX jobs_category_reference;
DROP INDEX jobs_location_reference;
DROP INDEX managed_lists_kind_label_folded;
ALTER TABLE managed_lists DROP COLUMN updated_at;
ALTER TABLE managed_lists DROP COLUMN version;
ALTER TABLE managed_lists DROP COLUMN active;
