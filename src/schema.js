import area from '@turf/area'
import bbox from '@turf/bbox'
import bboxPolygon from '@turf/bbox-polygon'
import { featureCollection, point } from '@turf/helpers'

import {
  organizationByName,
  locationByID,
  locationsWithinBounds,
  addOrganization
} from './data/database'

import UrlType from './data/types/urlType'
import YearType from './data/types/yearType'
import Location from './data/types/location'
import Organization from './data/types/organization'
import TechnologyInput from './data/types/input/technologyInput'
import LocationInput from './data/types/input/locationInput'

import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLID,
  GraphQLFloat,
  GraphQLInt,
  GraphQLNonNull
} from 'graphql';

var query = new GraphQLObjectType({
  name: 'Root',
  fields: {
    location: {
      type: Location,
      args: {
        id: {
          description: 'id of the location',
          type: new GraphQLNonNull(GraphQLID)
        }
      },
      resolve: (source, args, ast) => {
        return locationByID(args.id)
      },
    },
    organization: {
      type: Organization,
      args: {
        name: {
          description: 'the name of the organization',
          type: new GraphQLNonNull(GraphQLString)
        }
      },
      resolve: async (source, args, ast) => {
         return organizationByName(args.name)
      }
    },
    locations_within_bounds: {
      type: new GraphQLList(Location),
      args: {
        sw_lat: {
          type: GraphQLFloat,
          description: 'The latitude of the southwest corner of the bounding box.',
        },
        sw_lng: {
          type: GraphQLFloat,
          description: 'The longitude of the southwest corner of the bounding box.',
        },
        ne_lat: {
          type: GraphQLFloat,
          description: 'The latitude of the northeast corner of the bounding box.',
        },
        ne_lng: {
          type: GraphQLFloat,
          description: 'The longitude of the northeast corner of the bounding box.',
        },
      },
      resolve (source, args, ast) {

	// Check the incoming request bounds
        // If they are to big return an error.
        let feature = featureCollection([point([args.sw_lng, args.sw_lat]), point([args.ne_lng, args.ne_lat])])
	var requestedArea = area(bboxPolygon(bbox(feature)))

	if(requestedArea > 12427311001.261375) throw new Error(`The requested area is too large.`)

	return locationsWithinBounds(args.sw_lat, args.sw_lng, args.ne_lat, args.ne_lng)
      }
    }
  }
})



const mutation = new GraphQLObjectType({
  name: "AddOrganization",
  description: "Add an organization",
  fields: () => ({
    createOrganization: {
      type: Organization,
      args: {
	name: { type: new GraphQLNonNull(GraphQLString) },
	founding_year: { type: YearType },
	url: { type: new GraphQLNonNull(UrlType) },
	code: { type: UrlType },
	locations: { type: new GraphQLList(LocationInput) },
	technologies: { type: new GraphQLList(TechnologyInput) }
      },
      resolve: async (source, args) => {
        if(args.technologies.length === 0){
	  throw new Error('You must supply at least 1 technology.');
        }
        if(args.locations.length === 0){
	  throw new Error('You must supply at least 1 location.');
        }

        if(typeof args.founding_year !== 'undefined'){
          // 1600 till today is a reasonable range.
          let currentYear = new Date(Date.now()).getFullYear()
          if(!(args.founding_year > 1600 && args.founding_year <= currentYear)) {
            throw new Error(`Year should be somewhere between 1600 and the current year.`);
          }
        }


        return  await addOrganization(args)
      }
    }
  })
});

module.exports.schema = new GraphQLSchema({ query, mutation});
