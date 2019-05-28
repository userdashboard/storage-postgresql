create table lists (
  listid varchar(1000) primary key,
  path varchar(1000),
  objectid varchar(1000),
  created timestamp with time zone default now()  
)

create table objects (
  objectid varchar(1000) primary key,
  blob binary
)

create index lists_path on lists(path, objectid)