import { GraphQLScalarType } from 'graphql'
import { GraphQLError } from 'graphql/error'
import { Kind } from 'graphql/language'

var YearType = new GraphQLScalarType({
    name: 'Year',
    serialize: value => {
      return value;
    },
    parseValue: value => {
      return value;
    },
    parseLiteral: ast => {

      if (ast.kind !== Kind.INT) {
	throw new GraphQLError(`Query error: Must be an integer. Got a ${ ast.kind }`, [ast]);
      }

      if (!(/\d{4}/.test(ast.value))) {
	throw new GraphQLError(`Query error: Must have 4 digits. Got: ${ ast.kind }`, [ast]);
      }

      return ast.value;
    }
})

export default YearType
