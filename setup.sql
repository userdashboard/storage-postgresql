CREATE TABLE IF NOT EXISTS lists (
  listid BIGSERIAL PRIMARY KEY,
  path VARCHAR(1000),
  objectid VARCHAR(1000),
  created TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS objects (
  fullpath varchar(1000) PRIMARY KEY,
  blob BYTEA,
  created TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS index_lists_path ON lists(path);
CREATE INDEX IF NOT EXISTS index_lists_objectid ON lists(objectid);