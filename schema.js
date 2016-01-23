import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLID,
  GraphQLFloat,
  GraphQLInt,
  GraphQLNonNull
} from 'graphql';

var dbConfig = require('./arangodb_config')[process.env.NODE_ENV]
  , db = require('arangojs')(dbConfig)

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
    uri: {
      type: GraphQLString,
      description: 'The URI of the organization.',
    },
    technologies: {
      type: new GraphQLList(technology),
      description: 'An array of the technologies at use by this organization.'
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

        if(requestedFields.includes('technologies')) {
          let aql = `
            LET organizations = (RETURN GRAPH_NEIGHBORS(@graph, @example, { maxDepth: 2, includeData: true, neighborExamples: [{type: "organization"}], uniqueness:{vertices: "global", edges: "global"} }))
           FOR org IN FLATTEN(organizations)
             LET technologies = (RETURN GRAPH_NEIGHBORS(@graph, org, { maxDepth: 2, includeData: true, neighborExamples: [{type: "technology"}], uniqueness:{vertices: "global", edges: "global"} }))
             RETURN MERGE(org, {technologies: FLATTEN(technologies)})
          `
          let bindvars = { "example": source, graph: "usesthis" };
          return db.query(aql, bindvars )
          .then( cursor => { return cursor.all() })
          .then( result => { return result })
        } else {
          let aql = "RETURN GRAPH_NEIGHBORS(@graph, @example, {includeData: true, maxDepth: 2, neighborExamples: [{type: 'organization'}]})"
          let bindvars = { "example": source, graph: "usesthis" };
          return db.query(aql, bindvars )
          .then( cursor => { return cursor.all() })
          .then( result => { return result[0] })
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
        let aql = "FOR v IN vertices FILTER TO_STRING(v._key) == TO_STRING(@_key) RETURN v"
        let bindvars = { "_key": args.id };
        return db.query(aql, bindvars )
        .then( cursor => { return cursor.next() })
      },
    },
    locations: {
      type: new GraphQLList(location),
      resolve: (source, args, ast) => {
        return db.query('FOR v IN vertices FILTER v.type == "location" RETURN v',{})
        .then((cursor) => {
          return cursor.all()
        })
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
        let aql = `RETURN WITHIN_RECTANGLE(vertices, @sw_lat, @sw_lng, @ne_lat, @ne_lng)`
        let bindvars = {sw_lat: args.sw_lat, sw_lng: args.sw_lng, ne_lat: args.ne_lat, ne_lng: args.ne_lng}
        return db.query(aql,bindvars)
        .then((cursor) => {
          return cursor.all()
        })
        .then(arr => { return arr[0] })
      }
    },
    hello: {
      type: GraphQLString,
      resolve: (source, args, root, ast) => {
        return 'Hello World'
      }
    },
    thrower: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: () => { throw new Error('Throws!'); }
    }
  }
})

module.exports.schema = new GraphQLSchema({ query });
