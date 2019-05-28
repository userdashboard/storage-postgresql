const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/postgres'
const configParse = require('pg-connection-string').parse
const connectionConfig = configParse(connectionString)
const pg = require('pg')
const pool = new pg.Pool()
const Storage = require('./storage.js')
const util = require('util')

module.exports = {
  add: util.promisify(add),
  count: util.promisify(count),
  exists: util.promisify(exists),
  list: util.promisify(list),
  listAll: util.promisify(listAll),
  remove
}

function exists(path, itemid, callback) {
  return pool.connect(connectionConfig, (error, client, done) => {
    if(error){
      if (process.env.DEBUG_ERRORS){ 
          console.log('postgres.storage', error)
      }
      return callback(error)
    } 
    return client.query('SELECT * FROM objects WHERE path=$1 AND itemid=$2', [path, itemid], (error, result) => {
      done()
      return callback(error, result.count === 1)
    })
  })
}

function add(path, itemid, callback) {
  return exists(path, itemid, (error, existing) => {
    if (error) {
      return callback(error)
    }
    if (existing) {
      return callback()
    }
    return pool.connect(connectionConfig, (error, client, done) => {
      if (error) {
        if (process.env.DEBUG_ERRORS) {
          console.log('postgres.storage', error)
        }
        return callback(error)
      }
      return client.query('INSERT INTO lists(path, objectid) VALUES ($1, $2)', [path, itemid], (error, result) => {
        done()
        return callback(error, result)
      })
    })
  })
}

function count(path, callback) {
  return pool.connect(connectionConfig, (error, client, done) => {
    if (error) {
      if (process.env.DEBUG_ERRORS) {
        console.log('postgres.storage', error)
      }
      return callback(error)
    }
    return client.query('SELECT COUNT(*) FROM lists WHERE path=$1', [path], (error, result) => {
      done()
      return callback(error, result.count)
    })
  })
}

function listAll(path, callback) {
  return pool.connect(connectionConfig, (error, client, done) => {
    if (error) {
      if (process.env.DEBUG_ERRORS) {
        console.log('postgres.storage', error)
      }
      return callback(error)
    }
    return client.query('SELECT * FROM lists WHERE path=$1 ORDER BY created DESC', [path], (error, result) => {
      done()
      return callback(error, result.rows)
    })
  })
}

function list(path, offset, pageSize, callback) {
  offset = offset || 0
  if (pageSize === null || pageSize === undefined) {
    pageSize = global.pageSize
  }
  if (offset < 0) {
    throw new Error('invalid-offset')
  }
  if (offset && offset >= pageSize) {
    throw new Error('invalid-offset')
  }
  return pool.connect(connectionConfig, (error, client, done) => {
    if (error) {
      if (process.env.DEBUG_ERRORS) {
        console.log('postgres.storage', error)
      }
      return callback(error)
    }
    return client.query(`SELECT * FROM lists WHERE path=$1 ORDER BY created DESC LIMIT ${pageSize} OFFSET ${offset}`, [path], (error, result) => {
      done()
      return callback(error, result.rows)
    })
  })
}

function remove(path, itemid, callback) {
  return Storage.client.lrem(path, 1, itemid, callback)
}
