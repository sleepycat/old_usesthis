const {
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLNonNull,
} = require('graphql')
const { Latitude } = require('./Latitude')
const { Longitude } = require('./Longitude')

let LocationInput = new GraphQLInputObjectType({
  name: 'location',
  fields: {
    lat: { type: new GraphQLNonNull(Latitude) },
    lng: { type: new GraphQLNonNull(Longitude) },
    address: { type: new GraphQLNonNull(GraphQLString) },
  },
})

module.exports.LocationInput = LocationInput
