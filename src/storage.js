const connectionString = require('pg-connection-string')
const fs = require('fs')
const pg = require('pg')
pg.defaults.poolIdleTimeout = 1000
const util = require('util')

module.exports = {
  setup: util.promisify((moduleName, callback) => {
    if (!callback) {
      callback = moduleName
      moduleName = null
    }
    const databaseURL = process.env[`${moduleName}_DATABASE_URL`] || process.env.DATABASE_URL || 'postgres://localhost:5432/postgres'
    const connectionConfig = connectionString.parse(databaseURL)
    const pool = new pg.Pool(connectionConfig)
    const Log = require('@userdashboard/dashboard/src/log.js')('postgresql')
    const setupSQLFile = fs.readFileSync('./setup.qsl').toString()
    return pool.connect((error, client) => {
      console.log(error)
      if (error) {
        Log.error('error connecting', error)
        return callback(new Error('unknown-error'))
      }
      return client.query(setupSQLFile, () => {
        client.release(true)
        const configuration = {
          exists: util.promisify((file, callback) => {
            if (!file) {
              return callback(new Error('invalid-file'))
            }
            return pool.query('SELECT EXISTS(SELECT 1 FROM objects WHERE path=$1)', [file], (error, result) => {
              if (error) {
                Log.error('error checking exist', error)
                return callback(new Error('unknown-error'))
              }
              if (result && result.rows && result.rows.length) {
                return callback(null, result.rows[0].exists)
              }
              return callback()
            })
          }),
          read: util.promisify((file, callback) => {
            if (!file) {
              return callback(new Error('invalid-file'))
            }
            return pool.query('SELECT * FROM objects WHERE path=$1', [file], (error, result) => {
              if (error) {
                Log.error('error reading', error)
                return callback(new Error('unknown-error'))
              }
              if (result && result.rows && result.rows.length && result.rows[0].contents) {
                const data = result.rows[0].contents.toString()
                callback(null, data)
              }
              return callback()
            })
          }),
          readMany: util.promisify((path, files, callback) => {
            if (!files || !files.length) {
              return callback(new Error('invalid-files'))
            }
            const paths = []
            for (const file of files) {
              paths.push(`${path}/${file}`)
            }
            return pool.query('SELECT * FROM objects WHERE path=ANY($1)', [paths], (error, result) => {
              if (error) {
                Log.error('error reading many', error)
                return callback(new Error('unknown-error'))
              }
              if (result && result.rows && result.rows.length) {
                const data = {}
                for (const row of result.rows) {
                  for (const file of files) {
                    if (row.path === `${path}/${file}`) {
                      data[file] = row.contents.toString()
                      break
                    }
                  }
                }
                return callback(null, data)
              }
              return callback()
            })
          }),
          readBinary: util.promisify((file, callback) => {
            if (!file) {
              return callback(new Error('invalid-file'))
            }
            return pool.query('SELECT * FROM objects WHERE path=$1', [file], (error, result) => {
              if (error) {
                Log.error('error reading binary', error)
                return callback(new Error('unknown-error'))
              }
              if (result && result.rows.length) {
                return callback(null, result.rows[0])
              }
              return callback()
            })
          }),
          write: util.promisify((file, contents, callback) => {
            if (!file) {
              return callback(new Error('invalid-file'))
            }
            if (!contents && contents !== '') {
              return callback(new Error('invalid-contents'))
            }
            if (typeof (contents) !== 'number' && typeof (contents) !== 'string') {
              contents = JSON.stringify(contents)
            }
            contents = Buffer.isBuffer(contents) ? contents : Buffer.from(contents)
            contents = `\\x${contents.toString('hex')}`
            return pool.query('INSERT INTO objects(path, contents) VALUES($1, $2) ON CONFLICT(path) DO UPDATE SET contents=$2', [file, contents], (error) => {
              if (error) {
                Log.error('error inserting', error)
                return callback(new Error('unknown-error'))
              }
              return callback()
            })
          }),
          writeBinary: util.promisify((file, buffer, callback) => {
            if (!file) {
              return callback(new Error('invalid-file'))
            }
            if (!buffer || !buffer.length) {
              return callback(new Error('invalid-buffer'))
            }
            return pool.query('INSERT INTO objects(path, contents) VALUES($1, $2) ON CONFLICT(path) DO UPDATE SET contents=$2', [file, buffer], (error, result) => {
              if (error) {
                Log.error('error inserting binary', error)
                return callback(new Error('unknown-error'))
              }
              return callback(null, result.count === 1)
            })
          }),
          delete: util.promisify((file, callback) => {
            if (!file) {
              return callback(new Error('invalid-file'))
            }
            return pool.query('DELETE FROM objects WHERE path=$1', [file], (error, result) => {
              if (error) {
                Log.error('error deleting', error)
                return callback(new Error('unknown-error'))
              }
              return callback(null, result.count === 1)
            })
          })
        }
        if (process.env.NODE_ENV === 'testing') {
          configuration.flush = util.promisify((callback) => {
            if (!pool) {
              return callback()
            }
            return pool.connect((error, client) => {
              if (error) {
                Log.error('error connecting', error)
                return callback(new Error('unknown-error'))
              }
              return client.query('DROP TABLE IF EXISTS objects; DROP TABLE IF EXISTS lists; ' + setupSQLFile, (error) => {
                client.release(true)
                if (error) {
                  Log.error('error flushing', error)
                  return callback(new Error('unknown-error'))
                }
                return callback()
              })
            })
          })
        }
        return callback(null, configuration)
      })
    })
  })
}
