create table lists (
  listid varchar(1000) primary key,
  path varchar(1000),
  objectid varchar(1000),
  created timestamp with time zone default now()  
)

create table objects (
  path varchar(1000),
  objectid varchar(1000) primary key,
  blob bytea
)

create index on lists(path, objectid)