const schema = require('./schema').default
const dbinit = require('./database').default

const express = require('express')
var bodyParser = require('body-parser')

const { ApolloServer } = require('apollo-server-express')

const Server = async db => {
  const server = new ApolloServer({ schema, context: { db: await dbinit(db) } })
  const app = express()

  app.use(bodyParser.json())
  server.applyMiddleware({ app })
  return app
}

module.exports.default = Server
