import validUrl from 'valid-url'
import { GraphQLScalarType } from 'graphql'

import { GraphQLError } from 'graphql/error'
import { Kind } from 'graphql/language'

var UrlType = new GraphQLScalarType({
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

export default UrlType
