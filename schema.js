import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
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
      resolve: (root, { id }) => {
        return db.query('FOR v IN vertices FILTER TO_STRING(v._key) == TO_STRING(@_key) RETURN v',{ "_key": id })
        .then((cursor) => {
          return cursor.next()
        })
        .then(record => {
          return {
            id: record._key,
            address: record.address,
            lat: record.lat,
            lng: record.lng
          }
        })
      },
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
//          },
//          {
//            "_id" : "vertices/2815959973",
//            "_rev" : "71397985766",
//            "_key" : "2815959973",
//            "name" : "java",
//            "type" : "technology"
//          },
//          {
//            "_id" : "vertices/2783716261",
//            "_rev" : "71393332710",
//            "_key" : "2783716261",
//            "type" : "technology",
//            "name" : "android"
//          },
//          {
//            "_id" : "vertices/2821596069",
//            "_rev" : "71398772198",
//            "_key" : "2821596069",
//            "name" : "php",
//            "type" : "technology"
//          },
//          {
//            "_id" : "vertices/2872386469",
//            "_rev" : "71405850086",
//            "_key" : "2872386469",
//            "type" : "technology",
//            "name" : "blackberry"
//          },
//          {
//            "_id" : "vertices/2868913061",
//            "_rev" : "71405325798",
//            "_key" : "2868913061",
//            "name" : "ios",
//            "type" : "technology"
//          }
//        ]
//      }
//    ]
//  }
