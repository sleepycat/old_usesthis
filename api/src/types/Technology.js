const { GraphQLObjectType, GraphQLString } = require('graphql')

let Technology = new GraphQLObjectType({
  name: 'Technology',
  description: 'A technology of some kind: A database, a library, a tool.',
  fields: () => ({
    name: {
      type: GraphQLString,
      description: 'The name by which the technology is commonly known.',
    },
  }),
})

module.exports.Technology = Technology
