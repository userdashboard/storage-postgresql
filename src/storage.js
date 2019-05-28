const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/postgres'
const pg = require("pg")
const Storage = require('./storage.js')
const util = require('util')

module.exports = {
  exists: util.promisify(exists),
  read: util.promisify(read),
  readMany: util.promisify(readMany),
  readImage: util.promisify(readImage),
  write: util.promisify(write),
  writeImage: util.promisify(writeImage),
  deleteFile: util.promisify(deleteFile)
}

function exists (path, callback) {
  if (!path) {
    throw new Error('invalid-file')
  }
  if (path.indexOf('/') === path.length - 1) {
    throw new Error('invalid-file')
  }
  return pg.connect(connectionString, (error, client, done) => {
    if (error) {
      if (process.env.DEBUG_ERRORS) {
        console.log('postgres.storage', error)
      }
      return callback(error)
    }
    const pathParts = path.split('/')
    const objectid = pathParts.pop()
    const truncatedPath = pathParts.join('/')
    return client.query('SELECT exists FROM objects WHERE path=$1 AND objectid=$2', [truncatedPath, objectid], (error, result) => {
      done()
      return callback(error, result ? result.count === 1 : null)
    })
  })
}

function deleteFile(path, callback) {
  if (!path) {
    throw new Error('invalid-file')
  }
  if (path.indexOf('/') === path.length - 1) {
    throw new Error('invalid-file')
  }
  return pg.connect(connectionString, (error, client, done) => {
    if (error) {
      if (process.env.DEBUG_ERRORS) {
        console.log('postgres.storage', error)
      }
      return callback(error)
    }
    const pathParts = path.split('/')
    const objectid = pathParts.pop()
    const truncatedPath = pathParts.join('/')
    return client.query('DELETE FROM objects WHERE path=$1 AND objectid=$2', [truncatedPath, objectid], (error, result) => {
      done()
      return callback(error, result ? result.count === 1 : null)
    })
  })
}

function write(file, contents, callback) {
  if (!file) {
    throw new Error('invalid-file')
  }
  if (!contents && contents !== '') {
    throw new Error('invalid-contents')
  }
  return pg.connect(connectionString, (error, client, done) => {
    if (error) {
      if (process.env.DEBUG_ERRORS) {
        console.log('postgres.storage', error)
      }
      return callback(error)
    }
    const pathParts = path.split('/')
    const objectid = pathParts.pop()
    const truncatedPath = pathParts.join('/')
    return client.query('INSERT INTO objects(path, objectid, blob) VALUES($1, $2, $3) ON CONFLICT(objectid) DO UPDATE SET blob=$3', 
      [truncatedPath, objectid, contents], (error, result) => {
      done()
      return callback(error, result ? result.count === 1 : null)
    })
  })
}

function writeImage(file, buffer, callback) {
  if (!file) {
    throw new Error('invalid-file')
  }
  if (!buffer || !buffer.length) {
    throw new Error('invalid-buffer')
  } 
  return pg.connect(connectionString, (error, client, done) => {
    if (error) {
      if (process.env.DEBUG_ERRORS) {
        console.log('postgres.storage', error)
      }
      return callback(error)
    }
    const pathParts = path.split('/')
    const objectid = pathParts.pop()
    const truncatedPath = pathParts.join('/')
    return client.query('INSERT INTO objects(path, objectid, blob) VALUES($1, $2, $3) ON CONFLICT(objectid) DO UPDATE SET blob=$3',
      [truncatedPath, objectid, buffer], (error, result) => {
        done()
        return callback(error, result ? result.count === 1 : null)
      })
  })
}

function read(file, callback) {
  if (!file) {
    throw new Error('invalid-file')
  }
  return pg.connect(connectionString, (error, client, done) => {
    if (error) {
      if (process.env.DEBUG_ERRORS) {
        console.log('postgres.storage', error)
      }
      return callback(error)
    }
    const objectid = path.substring(path.lastIndexOf('/') + 1)
    return client.query('SELECT * FROM objects WHERE objectid=$1', [objectid], (error, result) => {
      done()
      return callback(error, result ? result.rows[0] : null)
    })
  })
}

function readMany(files, callback) {
  if (!files || !files.length) {
    throw new Error('invalid-files')
  }
  const objectids = []
  for (const path of files) {
    const objectid = path.substring(path.lastIndexOf('/') + 1)
    objectids.push(objectid)
  }
  return client.query('SELECT * FROM objects WHERE objectid IN $1', [objectids], (error, result) => {
    done()
    if (error) {
      if (process.env.DEBUG_ERRORS) {
        console.log('postgres.storage', error)
      }
      return callback(error)
    }
    const data = {}
    if (result && result.rows && result.rows.length) {
      for (const i in result.rows) {
        data[files[i]] = array[i]
      }
    }
    return callback(null, data)
  })
}

function readImage(file, callback) {
  if (!file) {
    throw new Error('invalid-file')
  }
  if (!file) {
    throw new Error('invalid-file')
  }
  return pg.connect(connectionString, (error, client, done) => {
    if (error) {
      if (process.env.DEBUG_ERRORS) {
        console.log('postgres.storage', error)
      }
      return callback(error)
    }
    const objectid = path.substring(path.lastIndexOf('/') + 1)
    return client.query('SELECT * FROM objects WHERE objectid=$1', [objectid], (error, result) => {
      done()
      return callback(error, result ? result.rows[0] : null)
    })
  })
}
