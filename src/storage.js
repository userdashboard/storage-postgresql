const pg = require('pg')
const connectionString = require('pg-connection-string')

module.exports = {
  setup: async (moduleName) => {
    const databaseURL = process.env[`${moduleName}_DATABASE_URL`] || process.env.DATABASE_URL || 'postgres://localhost:5432/postgres'
    const connectionConfig = connectionString.parse(databaseURL)
    const pool = new pg.Pool(connectionConfig)
    const configuration = {
      exists: async (file) => {
        if (!file) {
          throw new Error('invalid-file')
        }
        const result = await pool.query('SELECT EXISTS(SELECT 1 FROM objects WHERE path=$1)', [file])
        return result && result.rows && result.rows.length ? result.rows[0].exists : null
      },
      read: async (file) => {
        if (!file) {
          throw new Error('invalid-file')
        }
        const result = await pool.query('SELECT * FROM objects WHERE path=$1', [file])
        let data
        if (result && result.rows && result.rows.length && result.rows[0].contents) {
          data = result.rows[0].contents.toString()
        }
        return data
      },
      readMany: async (path, files) => {
        if (!files || !files.length) {
          throw new Error('invalid-files')
        }
        const paths = []
        for (const file of files) {
          paths.push(`${path}/${file}`)
        }
        const result = await pool.query('SELECT * FROM objects WHERE path=ANY($1)', [paths])
        const data = {}
        if (result && result.rows && result.rows.length) {
          for (const row of result.rows) {
            for (const file of files) {
              if (row.path === `${path}/${file}`) {
                data[file] = row.contents.toString()
                break
              }
            }
          }
        }
        return data
      },
      readBinary: async (file) => {
        if (!file) {
          throw new Error('invalid-file')
        }
        if (!file) {
          throw new Error('invalid-file')
        }
        const result = await pool.query('SELECT * FROM objects WHERE path=$1', [file])
        return result ? result.rows[0] : null
      },
      write: async (file, contents) => {
        if (!file) {
          throw new Error('invalid-file')
        }
        if (!contents && contents !== '') {
          throw new Error('invalid-contents')
        }
        if (typeof (contents) !== 'number' && typeof (contents) !== 'string') {
          contents = JSON.stringify(contents)
        }
        contents = Buffer.isBuffer(contents) ? contents : Buffer.from(contents)
        contents = `\\x${contents.toString('hex')}`
        await pool.query('INSERT INTO objects(path, contents) VALUES($1, $2) ON CONFLICT(path) DO UPDATE SET contents=$2', [file, contents])
      },
      writeBinary: async (file, buffer) => {
        if (!file) {
          throw new Error('invalid-file')
        }
        if (!buffer || !buffer.length) {
          throw new Error('invalid-buffer')
        }
        const result = await pool.query('INSERT INTO objects(path, contents) VALUES($1, $2) ON CONFLICT(path) DO UPDATE SET contents=$2', [file, buffer])
        return result ? result.count === 1 : null
      },
      delete: async (file) => {
        if (!file) {
          throw new Error('invalid-file')
        }
        const result = await pool.query('DELETE FROM objects WHERE path=$1', [file])
        return result ? result.count === 1 : null
      }
    }
    if (process.env.NODE_ENV === 'testing') {
      configuration.flush = async () => {
        await pool.query('DROP TABLE IF EXISTS objects')
        await pool.query('DROP TABLE IF EXISTS lists')
        const fs = require('fs')
        const path = require('path')
        let setupSQLFile = path.join(__dirname, 'setup.sql')
        if (!fs.existsSync(setupSQLFile)) {
          setupSQLFile = path.join(global.applicationPath, 'node_modules/@userdashboard/storage-postgresql/setup.sql')
        }
        setupSQLFile = fs.readFileSync(setupSQLFile).toString()
        await pool.query(setupSQLFile)
      }
    }
    return configuration
  }
}
