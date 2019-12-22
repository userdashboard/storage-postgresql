module.exports = {
  Storage: require('./src/storage.js'),
  StorageList: require('./src/storage-list.js')
}

const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/postgres'
const configParse = require('pg-connection-string').parse
const connectionConfig = configParse(connectionString)
const fs = require('fs')
const path = require('path')
const pg = require('pg')
const pool = new pg.Pool(connectionConfig)
pool.query(fs.readFileSync(path.join(__dirname, 'setup.sql')))
