const storage = require('./src/storage.js')

beforeEach((callback) => {
  return storage.client.flushdb(callback)
})

before((callback) => {
  return storage.client.flushdb(callback)
})

after(() => {
  storage.client.quit()
})