import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull
} from 'graphql';

var dbConfig = require('./arangodb_config')[process.env.NODE_ENV]
  , db = require('arangojs')(dbConfig)

module.exports.schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Root',
    fields: {
      hello: {
        type: GraphQLString,
        resolve: (source, args, root, ast) => {
          return db.query('FOR v IN vertices RETURN v')
          .then((cursor) => { return cursor.next()})
          .then(doc => {return doc.hello})
        }
      },
      test: {
        type: GraphQLString,
        args: {
          who: {
            type: GraphQLString
          }
        },
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
});

