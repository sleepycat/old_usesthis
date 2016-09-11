import {
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLFloat,
  GraphQLNonNull
} from 'graphql';
import LatitudeType from '../latitudeType'
import LongitudeType from '../longitudeType'

let LocationInput = new GraphQLInputObjectType({
  name: 'location',
  fields: {
    lat: { type: new GraphQLNonNull(LatitudeType) },
    lng: { type: new GraphQLNonNull(LongitudeType) },
    address: { type: new GraphQLNonNull(GraphQLString) }
  }
});

export default LocationInput
