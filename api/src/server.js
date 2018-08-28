const schema = require('./schema').default

const express = require('express')
var bodyParser = require('body-parser')

const { ApolloServer } = require('apollo-server-express')

const Server = () => {
  const server = new ApolloServer({ schema })
  const app = express()

  app.use(bodyParser.json())
  server.applyMiddleware({ app })
  return app
}

module.exports.default = Server
