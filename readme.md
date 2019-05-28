# Redis Storage for Dashboard

Install this module to use [PostgreSQL](https://postgresql.org) for data storage.

You will need to launch with additional configuration variables:

  STORAGE_ENGINE=@userappstore/storage-postgresql
  DATABASE_URL=postgres://localhost:5432/database

To test this module use [Dashboard](https://github.com/userappstore/dashboard)'s test suite configured with this storage engine.
