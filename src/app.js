import express from 'express'
import path from 'path'
import favicon from 'serve-favicon'
import logger from 'morgan'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import exphbs from 'express-handlebars'
import graphqlHTTP from 'express-graphql'
import routes from './routes/index'
import { schema } from './schema'
import { Database } from 'arangojs'
import dbinit from './data/database'

export default async function App (db) {

  let dbfunctions = await dbinit(db)

  const app = express()
  //Webpack hot reloading for dev.
  if(app.get('env') == 'development') {

    let webpack = require('webpack')
    let webpackDevMiddleware = require('webpack-dev-middleware')
    let webpackHotMiddleware = require('webpack-hot-middleware')
    let config = require('../webpack.dev.config')

    let compiler = webpack(config)

    app.use(webpackDevMiddleware(compiler, {
      publicPath: config.output.publicPath,
      stats: {colors: true}
    }))

    app.use(webpackHotMiddleware(compiler, {
      log: console.log
    }))

  }


  // view engine setup
  app.set('views', path.join(__dirname, 'views'));

  app.engine('.hbs', exphbs({defaultLayout: 'application', layoutsDir: "src/views/layouts/", extname: '.hbs'}));
  app.set('view engine', '.hbs');

  // uncomment after placing your favicon in /public
  //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
  app.use(logger('dev'));
  app.use('/graphql', graphqlHTTP(req => {
    return {
      schema,
      pretty: true,
      graphiql: true,
      context: { db: dbfunctions }
    }
  }));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, '../public')));

  app.use('/', routes);

  // error handlers

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    let err = new Error('Not Found')
    err.status = 404;
    next(err);
  });

  // development error handler
  // will print stacktrace
  if (app.get('env') === 'development' || app.get('env') === 'test') {
    app.use(function(err, req, res, next) {
      console.log(` XXX: ${err.message}`)
      res.status(err.status || 500)
      res.render('error', {
        message: err.message,
        error: err
      })
    })
  }

  // production error handler
  // no stacktraces leaked to user
  app.use(function(err, req, res, next) {
    res.status(err.status || 500)
    res.render('error', {
      message: err.message,
      error: {}
    })
  })

  return app
}
