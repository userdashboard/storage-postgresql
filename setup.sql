CREATE TABLE lists (
  listid BIGSERIAL PRIMARY KEY,
  path VARCHAR(1000),
  objectid VARCHAR(1000),
  created TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE objects (
  fullpath varchar(1000) PRIMARY KEY,
  blob BYTEA,
  created TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX ON lists(path);
CREATE INDEX ON lists(objectid);