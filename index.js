module.exports = {
  Storage: require('./src/storage.js'),
  StorageList: require('./src/storage-list.js')
}

const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/postgres'
const configParse = require('pg-connection-string').parse
const connectionConfig = configParse(connectionString)
const pg = require('pg')
const pool = new pg.Pool(connectionConfig)
pool.query(require('./setup.sql').toString())
