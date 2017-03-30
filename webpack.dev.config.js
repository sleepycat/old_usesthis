var webpack = require('webpack')
var path = require('path')

module.exports = {
  entry:    [
    'webpack/hot/dev-server',
    'webpack-hot-middleware/client',
    './public/javascripts/main.js'
  ],
  output: {
    path: '/',
    publicPath: "/javascripts/",
    filename: 'bundle.js'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  ],
  node: {
    console: true,
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  },
  watchOptions: {
    aggregateTimeout: 300,
    poll: true
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      webworkify: 'webworkify-webpack'
    }
  },
  module: {
    noParse: /node_modules\/json-schema\/lib\/validate\.js/,
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: [['es2015', { "modules": false }], 'stage-0', 'react']
        }
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      {
        test: /\.js$/,
        include: path.resolve(__dirname, 'node_modules/webworkify/index.js'),
        loader: 'worker'
      },
      {
        test: /mapbox-gl.+\.js$/,
        loader: 'transform-loader/cacheable?brfs'
      },
      {
        test: require.resolve("mapbox-gl-geocoder"),
        loader: "imports-loader?mapboxgl=mapbox-gl"
      },
      {
        test: require.resolve("mapbox-gl-flash"),
        loader: "imports-loader?mapboxgl=mapbox-gl"
      }
    ]
  },
};
