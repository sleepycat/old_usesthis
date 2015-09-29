module.exports = {
  "production" : {
    "databaseName": process.env.USESTHIS_PROD_DB_NAME,
    "url": process.env.USESTHIS_PROD_DB_HOST,
  },
  "development" : {
    "databaseName": "usesthis_development",
    "url": "http://127.0.0.1:8529",
  },
  "test" : {
    "databaseName": "usesthis_test",
    "url": "http://127.0.0.1:8529",
  },
}
