const area = require('@turf/area')
const bbox = require('@turf/bbox')
const bboxPolygon = require('@turf/bbox-polygon')
const { featureCollection, point } = require('@turf/helpers')
const { UrlType } = require('./types/UrlType')
const { YearType } = require('./types/YearType')
const { Location } = require('./types/Location')
const { Organization } = require('./types/Organization')
const { TechnologyInput } = require('./types/input/TechnologyInput')
const { LocationInput } = require('./types/input/LocationInput')

const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLID,
  GraphQLFloat,
  GraphQLNonNull,
} = require('graphql')

const query = new GraphQLObjectType({
  name: 'Query',
  fields: {
    location: {
      type: Location,
      args: {
        id: {
          description: 'id of the location',
          type: new GraphQLNonNull(GraphQLID),
        },
      },
      resolve: (_source, args, { db }, _info) => {
        return db.locationByID(args.id)
      },
    },
    organization: {
      type: Organization,
      args: {
        name: {
          description: 'the name of the organization',
          type: new GraphQLNonNull(GraphQLString),
        },
      },
      resolve: async (_source, args, { db }, _info) => {
        return db.organizationByName(args.name)
      },
    },
    locations_within_bounds: {
      type: new GraphQLList(Location),
      args: {
        sw_lat: {
          type: GraphQLFloat,
          description:
            'The latitude of the southwest corner of the bounding box.',
        },
        sw_lng: {
          type: GraphQLFloat,
          description:
            'The longitude of the southwest corner of the bounding box.',
        },
        ne_lat: {
          type: GraphQLFloat,
          description:
            'The latitude of the northeast corner of the bounding box.',
        },
        ne_lng: {
          type: GraphQLFloat,
          description:
            'The longitude of the northeast corner of the bounding box.',
        },
      },
      resolve(_source, args, { db }, _info) {
        // Check the incoming request bounds
        // If they are to big return an error.
        let feature = featureCollection([
          point([args.sw_lng, args.sw_lat]),
          point([args.ne_lng, args.ne_lat]),
        ])
        var requestedArea = area(bboxPolygon(bbox(feature)))

        if (requestedArea > 12427311001.261375)
          throw new Error(`The requested area is too large.`)

        return db.locationsWithinBounds(
          args.sw_lat,
          args.sw_lng,
          args.ne_lat,
          args.ne_lng,
        )
      },
    },
  },
})

const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    createOrganization: {
      type: Organization,
      description: 'Add an organization',
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        founding_year: { type: YearType },
        url: { type: new GraphQLNonNull(UrlType) },
        code: { type: UrlType },
        locations: { type: new GraphQLList(LocationInput) },
        technologies: { type: new GraphQLList(TechnologyInput) },
      },
      resolve(_source, args, { db }) {
        if (args.technologies.length === 0) {
          throw new Error('You must supply at least 1 technology.')
        }
        if (args.locations.length === 0) {
          throw new Error('You must supply at least 1 location.')
        }

        if (typeof args.founding_year !== 'undefined') {
          // 1600 till today is a reasonable range.
          let currentYear = new Date(Date.now()).getFullYear()
          if (
            !(args.founding_year > 1600 && args.founding_year <= currentYear)
          ) {
            throw new Error(
              `Year should be somewhere between 1600 and the current year.`,
            )
          }
        }

        return db.addOrganization(args)
      },
    },
  }),
})

module.exports.default = new GraphQLSchema({ query, mutation })
