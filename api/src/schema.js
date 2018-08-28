const resolvers = require('./resolvers.js').default
const { GraphQLSchema, GraphQLObjectType, GraphQLString } = require('graphql')

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      hello: {
        type: GraphQLString,
        description: 'A simple type for getting started!',
        resolve: resolvers.hello,
      },
    },
  }),
})

module.exports.default = schema
