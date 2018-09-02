import { GraphQLInputObjectType, GraphQLString, GraphQLNonNull } from 'graphql'
import Latitude from './Latitude'
import Longitude from './Longitude'

let LocationInput = new GraphQLInputObjectType({
  name: 'location',
  fields: {
    lat: { type: new GraphQLNonNull(Latitude) },
    lng: { type: new GraphQLNonNull(Longitude) },
    address: { type: new GraphQLNonNull(GraphQLString) },
  },
})

export default LocationInput
