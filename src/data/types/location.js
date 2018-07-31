import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLID,
  GraphQLFloat,
  GraphQLNonNull,
} from 'graphql'

import Organization from './organization'

var Location = new GraphQLObjectType({
  name: 'Location',
  description:
    'A physical location on the planet that an organisation is operating out of.',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The unique identifier of the location.',
      resolve: location => {
        return location._key
      },
    },
    address: {
      type: GraphQLString,
      description: 'The street address of this location.',
    },
    lat: {
      type: GraphQLFloat,
      description: 'The latitude of this location.',
    },
    lng: {
      type: GraphQLFloat,
      description: 'The longitude of this location.',
    },
    organizations: {
      type: new GraphQLList(Organization),
      description: 'An array of organizations associated with that location.',
      resolve(root, args, { db }, info) {
        let requestedFields = info.fieldNodes[0].selectionSet.selections.map(
          obj => {
            return obj.name.value
          },
        )

        //TODO: is it actually faster to do organizations and
        //technologies in a single query? Test this assumption.
        if (requestedFields.includes('technologies')) {
          return db.orgsAndTechnologiesForLocation(root._id)
        } else {
          return db.orgsForLocation(root._id)
        }
      },
    },
  }),
})

export default Location
