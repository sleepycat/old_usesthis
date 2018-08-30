const validUrl = require('valid-url')
const { GraphQLScalarType } = require('graphql')
const { GraphQLError } = require('graphql/error')

const UrlType = new GraphQLScalarType({
  name: 'URL',
  serialize: value => {
    return value
  },
  parseValue: value => {
    return value
  },
  parseLiteral: ast => {
    if (!validUrl.isUri(ast.value)) {
      throw new GraphQLError('Query error: Not a valid URL', [ast])
    }

    return ast.value
  },
})

module.exports.UrlType = UrlType
