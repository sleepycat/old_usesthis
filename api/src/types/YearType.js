const { GraphQLScalarType } = require('graphql')
const { GraphQLError } = require('graphql/error')
const { Kind } = require('graphql/language')

// TODO: test this like Lat/Lng types are tested.
const YearType = new GraphQLScalarType({
  name: 'Year',
  serialize: value => {
    return value
  },
  parseValue: value => {
    return parseInt(value, 10)
  },
  parseLiteral: ast => {
    let val = parseInt(ast.value, 10)

    if (ast.kind !== Kind.INT) {
      throw new GraphQLError(
        `Query error: Must be an integer. Got a ${ast.kind}`,
        [ast],
      )
    }

    if (!/^\d{4}$/.test(val)) {
      throw new GraphQLError(
        `Query error: Must have 4 digits. Got: ${ast.kind}`,
        [ast],
      )
    }

    return val
  },
})

module.exports.YearType = YearType
