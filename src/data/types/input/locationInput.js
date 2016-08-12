import {
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLFloat,
  GraphQLNonNull
} from 'graphql';

let LocationInput = new GraphQLInputObjectType({
  name: 'location',
  fields: {
    lat: { type: new GraphQLNonNull(GraphQLFloat) },
    lng: { type: new GraphQLNonNull(GraphQLFloat) },
    address: { type: new GraphQLNonNull(GraphQLString) }
  }
});

export default LocationInput
