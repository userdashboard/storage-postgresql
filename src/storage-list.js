const fs = require('fs')
const path = require('path')
const pg = require('pg')
const connectionString = require('pg-connection-string')
const util = require('util')

module.exports = {
  setup: util.promisify((storage, moduleName, callback) => {
    const databaseURL = process.env[`${moduleName}_DATABASE_URL`] || process.env.DATABASE_URL || 'postgres://localhost:5432/postgres'
    const connectionConfig = connectionString.parse(databaseURL)
    const pool = new pg.Pool(connectionConfig)
    const dashboardPath1 = path.join(global.applicationPath, 'node_modules/@userdashboard/dashboard/src/log.js')
    let Log
    if (fs.existsSync(dashboardPath1)) {
      Log = require(dashboardPath1)('postgresql-list')
    } else {
      const dashboardPath2 = path.join(global.applicationPath, 'src/log.js')
      Log = require(dashboardPath2)('postgresql-list')
    }
    const container = {
      add: util.promisify((path, objectid, callback) => {
        return pool.query('INSERT INTO lists(path, objectid) VALUES ($1, $2)', [path, objectid], (error) => {
          if (error) {
            Log.error('error adding', error)
            return callback(new Error('unknown-error'))
          }
          return callback()
        })
      }),
      addMany: util.promisify((items, callback) => {
        const commands = []
        const values = []
        for (const path in items) {
          const n = commands.length + 1
          commands.push('INSERT INTO lists(path, objectid) VALUES ($' + n + ', $' + n + 1 + ')')
          values.push(path, items[path])
        }
        return pool.query(commands.join('; '), values, (error) => {
          if (error) {
            Log.error('error adding many', error)
            return callback(new Error('unknown-error'))
          }
          return callback()
        })
      }),
      count: util.promisify((path, callback) => {
        return pool.query('SELECT COUNT(*) FROM lists WHERE path=$1', [path], (error, result) => {
          if (error) {
            Log.error('error counting', error)
            return callback(new Error('unknown-error'))
          }
          if (result && result.rows && result.rows.length) {
            return callback(null, parseInt(result.rows[0].count, 10))
          }
          return callback(null, 0)
        })
      }),
      exists: util.promisify((path, objectid, callback) => {
        return pool.query('SELECT EXISTS(SELECT 1 FROM lists WHERE path=$1 AND objectid=$2)', [path, objectid], (error, result) => {
          if (error) {
            Log.error('error checking exist', error)
            return callback(new Error('unknown-error'))
          }
          if (result && result.rows && result.rows.length) {
            return callback(null, result.rows[0].exists)
          }
          return callback(null, false)
        })
      }),
      list: util.promisify((path, offset, pageSize, callback) => {
        offset = offset || 0
        if (pageSize === null || pageSize === undefined) {
          pageSize = global.pageSize
        }
        if (offset < 0) {
          throw new Error('invalid-offset')
        }
        return pool.query(`SELECT objectid FROM lists WHERE path=$1 ORDER BY created DESC LIMIT ${pageSize} OFFSET ${offset}`, [path], (error, result) => {
          if (error) {
            Log.error('error listing', error)
            return callback(new Error('unknown-error'))
          }
          if (!result.rows || !result.rows.length) {
            return callback()
          }
          const data = []
          for (const row of result.rows) {
            data.push(row.objectid)
          }
          return callback(null, data)
        })
      }),
      listAll: util.promisify((path, callback) => {
        return pool.query('SELECT objectid FROM lists WHERE path=$1 ORDER BY created DESC', [path], (error, result) => {
          if (error) {
            Log.error('error listing all', error)
            return callback(new Error('unknown-error'))
          }
          if (!result || !result.rows || !result.rows.length) {
            return callback()
          }
          const data = []
          for (const row of result.rows) {
            data.push(row.objectid)
          }
          return callback(null, data)
        })
      }),
      remove: util.promisify((path, objectid, callback) => {
        objectid = objectid.toString()
        return pool.query('DELETE FROM lists WHERE objectid=$1', [objectid], (error) => {
          if (error) {
            Log.error('error removing', error)
            return callback(new Error('unknown-error'))
          }
          return callback()
        })
      })
    }
    return callback(null, container)
  })
}
