module.exports = {
  "production" : {
    "databaseName": process.env.USESTHIS_PRODUCTION_DB_NAME,
    "url": process.env.USESTHIS_PRODUCTION_DB_URL,
    "graph": "usesthis",
    "arangoVersion": 30000
  },
  "development" : {
    "databaseName": process.env.USESTHIS_DEVELOPMENT_DB_NAME,
    "url": process.env.USESTHIS_DEVELOPMENT_DB_URL,
    "graph": "usesthis",
    "arangoVersion": 30000
  },
  "test" : {
    "databaseName": "usesthis_test",
    "url": process.env.USESTHIS_TEST_DB_URL,
    "graph": "test",
    "arangoVersion": 30000
  },
}
