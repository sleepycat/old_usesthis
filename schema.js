import turf from 'turf'
import {
  technologiesForOrganization,
  orgsAndTechnologiesForLocation,
  orgsForLocation,
  organizationByName,
  locationByID,
  locationsWithinBounds
} from './data/database'

import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLID,
  GraphQLFloat,
  GraphQLInt,
  GraphQLNonNull
} from 'graphql';

var env = process.env.NODE_ENV || "development"
var dbConfig = require('./arangodb_config')[env]
    , db = require('arangojs')(dbConfig)
    , aqlQuery = require('arangojs').aqlQuery;

let technology = new GraphQLObjectType({
  name: 'Technology',
  description: 'A technology of some kind: A database, a library, a tool.',
  fields: () => ({
    name: {
    type: GraphQLString,
    description: 'The name by which the technology is commonly known.',
    }
  })

});

// {"founding_year":2004,"type":"organization","name":"Shopify","url":"http://www.shopify.com"}
var organization = new GraphQLObjectType({
  name: 'Organization',
  description: 'An organization of some kind: a company, NGO, etc.',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The unique identifier of the organization.',
      resolve: (organization) => { return organization._key }
    },
    founding_year: {
      type: GraphQLInt,
      description: 'The year the organization was founded',
    },
    name: {
      type: GraphQLString,
      description: 'The name of the organization.',
    },
    url: {
      type: GraphQLString,
      description: 'The URL of the organization.',
    },
    technologies: {
      type: new GraphQLList(technology),
      description: 'An array of the technologies at use by this organization.',
      resolve: (source, args, ast) => {
        // Technologies may have been added in a single query in the
        // resolve function under location.organizations.
        if(typeof source.technologies === 'undefined'){
        return technologiesForOrganization(source._id)
        } else {
          return source.technologies
        }
      }
    }
  }),
});

var location = new GraphQLObjectType({
  name: 'Location',
  description: 'A physical location on the planet that an organisation is operating out of.',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The unique identifier of the location.',
      resolve: (location) => { return location._key }
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
      type: new GraphQLList(organization),
      description: 'An array of organizations associated with that location.',
      resolve: (source, args, ast) => {

        let requestedFields = ast.fieldASTs[0].selectionSet.selections.map((obj)=> { return obj.name.value });

        //TODO: is it actually faster to do organizations and
        //technologies in a single query? Test this assumption.
        if(requestedFields.includes('technologies')) {
          return orgsAndTechnologiesForLocation(source._id)
        } else {
          return orgsForLocation(source._id)
        }
      }
    }
  }),
});


var query = new GraphQLObjectType({
  name: 'Root',
  fields: {
    location: {
      type: location,
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
      type: organization,
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
      type: new GraphQLList(location),
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
      resolve: (source, args, ast) => {

	// Check the incoming request bounds
        // If they are to big return an error.
	var bbox = [args.sw_lng, args.sw_lat, args.ne_lng, args.ne_lat];
	var poly = turf.bboxPolygon(bbox);
	var area = turf.area(poly);
	if(area > 12427311001.261375) throw new Error(`The requested area is too large.`)

        return locationsWithinBounds(args.sw_lat, args.sw_lng, args.ne_lat, args.ne_lng)
      }
    }
  }
})

var technologyInput = new GraphQLInputObjectType({
  name: 'technology',
  fields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    category: { type: new GraphQLNonNull(GraphQLString) }
  }
});

var locationInput = new GraphQLInputObjectType({
  name: 'location',
  fields: {
    lat: { type: new GraphQLNonNull(GraphQLFloat) },
    lng: { type: new GraphQLNonNull(GraphQLFloat) },
    address: { type: new GraphQLNonNull(GraphQLString) }
  }
});

const mutation = new GraphQLObjectType({
  name: "AddOrganization",
  description: "Add an organization",
  fields: () => ({
    createOrganization: {
      type: organization,
      args: {
	name: { type: new GraphQLNonNull(GraphQLString) },
	founding_year: { type: GraphQLInt },
	url: { type: new GraphQLNonNull(GraphQLString) },
	locations: { type: new GraphQLList(locationInput) },
	technologies: { type: new GraphQLList(technologyInput) }
      },
      resolve: async (source, args) => {
        if(args.technologies.length === 0){
	  throw new Error('You must supply at least 1 technology.');
        }
        if(args.locations.length === 0){
	  throw new Error('You must supply at least 1 location.');
        }


        //This is a function that will be stringified and sent to Arango
        //to be run in a transaction.
        var action = String(function (args) {
          var db = require('org/arangodb').db;
          var orgData = args[0];

          // find or create an organization
          var unsavedOrganization = {"founding_year": orgData.founding_year,"type":"organization","name": orgData.name, "url": orgData.url}
          var organizationQuery = `
            UPSERT @unsavedOrganization INSERT @unsavedOrganization UPDATE {} IN vertices RETURN NEW
          `
          var organization = db._query(organizationQuery, {unsavedOrganization}).toArray()[0]

          orgData.locations.map(function(unsavedLocation){

            var latLng = {lat: unsavedLocation.lat, lng: unsavedLocation.lng}
            var locationQuery = `
              UPSERT @latLng INSERT MERGE(@unsavedLocation, {type: "location"}) UPDATE {} IN vertices RETURN NEW
            `;
            var location = db._query(locationQuery, {latLng, unsavedLocation}).toArray()[0]

            // Is there an office that connects the org to the location?
            //org ---works_in ---> office ---located_at---> location
            // Does this org already have an office at this location?
            var hasOffice = `
            LET path = (RETURN GRAPH_SHORTEST_PATH("usesthis", @organization_id, @location_id, {stopAtFirstMatch: true, direction: "outbound", edgeExamples: [{type: "works_in"}, {type: "located_at"}], includeData: true})[0]) RETURN path[0].vertices[1]
            `
            var office = db._query(hasOffice, {organization_id: organization._id, location_id: location._id}).toArray()[0]


            if(office === null){
              office = db._query('INSERT {type: "office"} IN vertices RETURN NEW').toArray()[0]
              // link the org to the office
              var orgOfficeEdgeQuery = `
              INSERT {_to: @office_id, _from: @organization_id, type: "works_in"} IN edges RETURN NEW
              `
              var orgOfficeEdge =  db._query(orgOfficeEdgeQuery, {office_id: office._id, organization_id: organization._id}).toArray()[0]

              //and finally link the location and the office
              var locOfficeEdgeQuery = `
                INSERT {_to: @location_id, _from: @office_id, type: "located_at"} IN edges RETURN NEW
              `
              var locOfficeEdge = db._query(locOfficeEdgeQuery, {location_id: location._id, office_id: office._id}).toArray()[0]
            }

             orgData.technologies.map(function(unsavedTechnology) {
               var technologyQuery = `
                 UPSERT @unsavedTechnology INSERT MERGE(@unsavedTechnology, {type: "technology"}) UPDATE {} IN vertices RETURN NEW
               `;
               var technology = db._query(technologyQuery, {unsavedTechnology: unsavedTechnology}).toArray()[0]

               var technologyEdgeQuery = `
                 INSERT {_to: @technology_id, _from: @office_id, type: "uses"} IN edges RETURN NEW
               `;
               var technologyEdge = db._query(technologyEdgeQuery, {technology_id: technology._id, office_id: office._id}).toArray()[0]
             })
          })

          return organization
        });

        return  db.transaction({write: ['vertices', 'edges']}, action, [args])
      }
    }
  })
});

module.exports.schema = new GraphQLSchema({ query, mutation});
