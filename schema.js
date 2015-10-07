import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLFloat,
  GraphQLInt,
  GraphQLNonNull
} from 'graphql';

var dbConfig = require('./arangodb_config')[process.env.NODE_ENV]
  , db = require('arangojs')(dbConfig)

var location = new GraphQLObjectType({
  name: 'Location',
  description: 'A physical location on the planet that an organisation is operating out of.',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLInt),
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
          type: new GraphQLNonNull(GraphQLInt)
        }
      },
      resolve: (source, args, root, ast) => {
        let aql = "FOR v IN vertices FILTER TO_STRING(v._key) == TO_STRING(@_key) RETURN v"
        let bindvars = { "_key": args.id };
        return db.query(aql, bindvars )
        .then( cursor => { return cursor.next() })
      },
    },
    locations: {
      type: new GraphQLList(location),
      resolve: (source, args, root, ast) => {
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
      resolve: (source, args, root, ast) => {
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

//{
//    "_id" : "vertices/2871010213",
//    "_key" : "2871010213",
//    "_rev" : "71405719014",
//    "lat" : 45.2392009,
//    "lng" : -75.9095241,
//    "type" : "location",
//    "address" : "11 Brads Court, Stittsville, ON K2S 1V2, Canada",
//    "children" : [
//      {
//        "_id" : "vertices/2870223781",
//        "_key" : "2870223781",
//        "_rev" : "71405587942",
//        "type" : "office",
//        "children" : [
//          {
//            "_id" : "vertices/2870027173",
//            "_rev" : "71405456870",
//            "_key" : "2870027173",
//            "founding_year" : null,
//            "type" : "organization",
//            "name" : "FaveQuest",
//            "url" : "http://favequest.com/"
//          }
//        ]
//      }
//    ]
//  }
