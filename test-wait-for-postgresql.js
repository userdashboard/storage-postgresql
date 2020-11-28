/*
 * This script is to help test suites wait for
 * a dockerized postgresql to become active
 */

const connectionString = require('pg-connection-string')
const pg = require('pg')

setTimeout(() => {
  process.exit(1)
}, 5000)

const databaseURL = process.env.DATABASE_URL || 'postgres://localhost:5432/postgres'
const connectionConfig = connectionString.parse(databaseURL)
const pool = new pg.Pool(connectionConfig)
pool.connect((error, client) => {
  if (client && client.release) {
    client.release(true)
  }
  return process.exit(error ? 1 : 0)
})
