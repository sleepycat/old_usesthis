const { CategoryType } = require('../CategoryType')

const {
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLNonNull,
} = require('graphql')

const TechnologyInput = new GraphQLInputObjectType({
  name: 'technology',
  fields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    category: { type: CategoryType },
  },
})

module.exports.TechnologyInput = TechnologyInput
