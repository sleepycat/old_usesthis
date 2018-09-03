import { stringify } from 'querystring'
import { GraphQLSchema, GraphQLObjectType, GraphQLString } from 'graphql'
import express from 'express'
import request from 'supertest'
import graphqlHTTP from 'express-graphql'

const app = express()

function urlString(urlParams) {
  var string = '/graphql'
  if (urlParams) {
    string += '?' + stringify(urlParams)
  }
  return string
}

describe('Using graphql middleware', () => {
  beforeEach(() => {
    var testSchema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Root',
        fields: {
          test: {
            type: GraphQLString,
            resolve: (source, args, root, ast) => {
              return 'Hello World'
            },
          },
        },
      }),
    })

    app.use('/graphql', graphqlHTTP({ schema: testSchema }))
  })

  it('can hit the graphql endpoint', done => {
    request(app)
      .get(urlString({ query: '{test}' }))
      .expect(200)
      .end(done)
  })

  it('it responds to nonsense with a 400', done => {
    request(app)
      .get(urlString({ query: '{asdf}' }))
      .expect(400)
      .end(done)
  })
})
