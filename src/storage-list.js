const pg = require('pg')
const connectionString = require('pg-connection-string')

module.exports = {
  setup: async (storage, moduleName) => {
    const databaseURL = process.env[`${moduleName}_DATABASE_URL`] || process.env.DATABASE_URL || 'postgres://localhost:5432/postgres'
    const connectionConfig = connectionString.parse(databaseURL)
    const pool = new pg.Pool(connectionConfig)
    const container = {
      add: async (path, objectid) => {
        const result = await pool.query('SELECT EXISTS(SELECT 1 FROM lists WHERE path=$1 AND objectid=$2)', [path, objectid])
        const existing = result && result.rows && result.rows.length ? result.rows[0].exists : false
        if (existing) {
          return
        }
        await pool.query('INSERT INTO lists(path, objectid) VALUES ($1, $2)', [path, objectid])
      },
      count: async (path) => {
        const result = await pool.query('SELECT COUNT(*) FROM lists WHERE path=$1', [path])
        return result && result.rows && result.rows.length ? parseInt(result.rows[0].count, 10) : 0
      },
      exists: async (path, objectid) => {
        const result = await pool.query('SELECT EXISTS(SELECT 1 FROM lists WHERE path=$1 AND objectid=$2)', [path, objectid])
        return result && result.rows && result.rows.length ? result.rows[0].exists : false
      },
      list: async (path, offset, pageSize) => {
        offset = offset || 0
        if (pageSize === null || pageSize === undefined) {
          pageSize = global.pageSize
        }
        if (offset < 0) {
          throw new Error('invalid-offset')
        }
        const result = await pool.query(`SELECT objectid FROM lists WHERE path=$1 ORDER BY created DESC LIMIT ${pageSize} OFFSET ${offset}`, [path])
        if (!result.rows || !result.rows.length) {
          return
        }
        const data = []
        for (const row of result.rows) {
          data.push(row.objectid)
        }
        return data
      },
      listAll: async (path) => {
        const result = await pool.query('SELECT objectid FROM lists WHERE path=$1 ORDER BY created DESC', [path])
        if (!result || !result.rows || !result.rows.length) {
          return
        }
        const data = []
        for (const row of result.rows) {
          data.push(row.objectid)
        }
        return data
      },
      remove: async (path, objectid) => {
        objectid = objectid.toString()
        await pool.query('DELETE FROM lists WHERE objectid=$1', [objectid])
      }
    }
    return container
  }
}
