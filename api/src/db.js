require('dotenv-safe').config()

const { Database } = require('arangojs')

const {
  USESTHIS_DB_USER: user,
  USESTHIS_DB_URL: url,
  USESTHIS_DB_NAME: databaseName,
  USESTHIS_DB_PASSWORD: password,
} = process.env

const db = new Database({
  url,
})
db.useDatabase(databaseName)
db.useBasicAuth(user, password)

module.exports.db = db
