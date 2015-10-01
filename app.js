var express = require('express')
  , path = require('path')
  , favicon = require('serve-favicon')
  , logger = require('morgan')
  , cookieParser = require('cookie-parser')
  , bodyParser = require('body-parser')
  , routes = require('./routes/index')
  , users = require('./routes/users')
  , app = express()
  , dbConfig = require('./arangodb_config')[process.env.NODE_ENV]
  , db = require('arangojs')(dbConfig)
  , graphqlHTTP = require('express-graphql');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull
} from 'graphql';

var schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Root',
    fields: {
      hello: {
        type: GraphQLString,
        resolve: (source, args, root, ast)=>{
          return db.query('FOR v IN vertices  RETURN v')
          .then((cursor)=>{ return cursor.next()})
          .then(doc=>{return doc.hello})
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

app.use('/graphql', graphqlHTTP(req => {
  return { schema: schema , pretty: true}
}));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
