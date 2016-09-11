import {
  GraphQLScalarType,
} from 'graphql';

import { GraphQLError } from 'graphql/error';
import { Kind } from 'graphql/language';

var LatitudeType = new GraphQLScalarType({
    name: 'Latitude',
    serialize: Number,
    parseValue: Number,
    parseLiteral: ast => {

      let value = Number(Number(ast.value).toFixed(8))

      //Make sure this is a Float
      if (ast.kind !== Kind.FLOAT) {
	throw new GraphQLError(`Query error: Must be an float. Got a ${ ast.kind }`, [ast]);
      }

      //Must be within range
      if(!(value >= -90.000 && value <= 90.0000)) {
        throw new GraphQLError('Query error: A valid latitude is between +90 and -90', [ast]);
      }

      return value
    }
});

export default LatitudeType
