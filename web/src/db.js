const env = process.env.NODE_ENV || 'development'
const { Database } = require('arangojs')

// The env is coming from the environment not the user.
// eslint-disable-next-line security/detect-object-injection
const { databaseName, url, user, password } = require('../arangodb_config')[env]

const db = new Database({
  url,
})
db.useDatabase(databaseName)
db.useBasicAuth(user, password)

module.exports.db = db
