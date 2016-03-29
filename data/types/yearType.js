import {
  GraphQLScalarType,
} from 'graphql';

import { GraphQLError } from 'graphql/error';
import { Kind } from 'graphql/language';

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
	throw new GraphQLError('Query error: Can only be an integer. Got a: ' + ast.kind, [ast]);
      }
      // 1600 till today is a reasonable range.
      var currentYear = new Date(Date.now()).getFullYear()
      if(!(ast.value > 1600 && ast.value <= currentYear)) {
	throw new GraphQLError(`Query error: Year should be somewhere between 1600 and the current year.`);
      }

      return ast.value;
    }
});

export default YearType
