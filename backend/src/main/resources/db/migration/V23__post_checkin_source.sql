ALTER TABLE post ADD COLUMN source_type VARCHAR(32) NULL;
ALTER TABLE post ADD COLUMN source_id BIGINT NULL;
CREATE UNIQUE INDEX uq_post_source ON post (source_type, source_id);
