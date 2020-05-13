const databaseURL = process.env.DATABASE_URL || 'postgres://localhost:5432/postgres'
const connectionString = require('pg-connection-string')
const connectionConfig = connectionString.parse(databaseURL)
const fs = require('fs')
const path = require('path')
const pg = require('pg')
let setupSQLFile = path.join(__dirname, 'setup.sql')
if (!fs.existsSync(setupSQLFile)) {
  setupSQLFile = path.join(global.applicationPath, 'node_modules/@userdashboard/storage-postgresql/setup.sql')
}
setupSQLFile = fs.readFileSync(setupSQLFile).toString()
try {
  const pool = new pg.Pool(connectionConfig)
  pool.query(setupSQLFile, () => {
    pool.end()
  })
} catch (error) {
}

module.exports = {
  Storage: require('./src/storage.js'),
  StorageList: require('./src/storage-list.js')
}