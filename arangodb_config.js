module.exports = {
  "production" : {
    "databaseName": process.env.USESTHIS_PRODUCTION_DB_NAME,
    "url": process.env.USESTHIS_PRODUCTION_DB_URL,
  },
  "development" : {
    "databaseName": process.env.USESTHIS_DEVELOPMENT_DB_NAME,
    "url": process.env.USESTHIS_DEVELOPMENT_DB_URL
  },
  "test" : {
    "databaseName": "usesthis_test",
    "url": "http://127.0.0.1:8529",
  },
}
