const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/postgres'
const configParse = require('pg-connection-string').parse
const connectionConfig = configParse(connectionString)
const pg = require('pg')
const pool = new pg.Pool(connectionConfig)

module.exports = {
  exists,
  read,
  readMany,
  readImage,
  write,
  writeImage,
  deleteFile
}

if (process.env.NODE_ENV === 'testing') {
  module.exports.flush = async () => {
    console.log('flush1')
    await pool.query('DROP TABLE IF EXISTS objects')
    console.log('flush2')
    await pool.query('DROP TABLE IF EXISTS lists')
    console.log('flush3')
    const fs = require('fs')
    const path = require('path')
    let setupSQLFile = path.join(__dirname, 'setup.sql')
    if (!fs.existsSync(setupSQLFile)) {
      setupSQLFile = path.join(global.rootPath, 'node_modules/@userdashboard/storage-postgresql/setup.sql')
    }
    setupSQLFile = fs.readFileSync(setupSQLFile).toString()
    console.log('flush4', setupSQLFile)
    await pool.query(setupSQLFile)
  }
}

async function exists (path) {
  if (!path) {
    throw new Error('invalid-file')
  }
  if (path.indexOf('/') === path.length - 1) {
    throw new Error('invalid-file')
  }
  const result = await pool.query('SELECT EXISTS(SELECT 1 FROM objects WHERE fullpath=$1)', [path])
  return result && result.rows && result.rows.length ? result.rows[0].exists : null
}

async function deleteFile (path) {
  if (!path) {
    throw new Error('invalid-file')
  }
  if (path.indexOf('/') === path.length - 1) {
    throw new Error('invalid-file')
  }
  const result = await pool.query('DELETE FROM objects WHERE fullpath=$1', [path])
  return result ? result.count === 1 : null
}

async function write (file, contents) {
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
  await pool.query('INSERT INTO objects(fullpath, blob) VALUES($1, $2) ON CONFLICT(fullpath) DO UPDATE SET blob=$2', [file, contents])
}

async function writeImage (file, buffer) {
  if (!file) {
    throw new Error('invalid-file')
  }
  if (!buffer || !buffer.length) {
    throw new Error('invalid-buffer')
  }
  const result = await pool.query('INSERT INTO objects(fullpath, blob) VALUES($1, $2) ON CONFLICT(fullpath) DO UPDATE SET blob=$2', [file, buffer])
  return result ? result.count === 1 : null
}

async function read (file) {
  if (!file) {
    throw new Error('invalid-file')
  }
  const result = await pool.query('SELECT * FROM objects WHERE fullpath=$1', [file])
  let data
  if (result && result.rows && result.rows.length && result.rows[0].blob) {
    data = result.rows[0].blob.toString()
  }
  return data
}

async function readMany (path, files) {
  if (!files || !files.length) {
    throw new Error('invalid-files')
  }
  const fullPaths = []
  for (const file of files) {
    fullPaths.push(`${path}/${file}`)
  }
  const result = await pool.query('SELECT * FROM objects WHERE fullpath=ANY($1)', [fullPaths])
  const data = {}
  if (result && result.rows && result.rows.length) {
    for (const row of result.rows) {
      for (const file of files) {
        if (row.fullpath === `${path}/${file}`) {
          data[file] = row.blob.toString()
          break
        }
      }
    }
  }
  return data
}

async function readImage (file) {
  if (!file) {
    throw new Error('invalid-file')
  }
  if (!file) {
    throw new Error('invalid-file')
  }
  const result = await pool.query('SELECT * FROM objects WHERE fullpath=$1', [file])
  return result ? result.rows[0] : null
}
