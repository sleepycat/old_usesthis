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
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ],
  node: {
    console: true,
    fs: "empty"
  },
  watchOptions: {
    aggregateTimeout: 300,
    poll: true
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['', '.js', '.jsx'],
    alias: {
      webworkify: 'webworkify-webpack'
    }
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
	loaders: ['react-hot', 'babel-loader?presets[]=es2015,presets[]=stage-0,presets[]=react'],
	exclude: /node_modules/
      },
      {
	test: /\.json$/,
	loader: 'json-loader'
      },
      {
	test: /\.js$/,
	include: path.resolve(__dirname, 'node_modules/mapbox-gl/js/render/shaders.js'),
	loader: 'transform/cacheable?brfs'
      },
      {
	test: /\.js$/,
	include: path.resolve(__dirname, 'node_modules/webworkify/index.js'),
	loader: 'worker'
      },
      {
	test: /\.js$/,
	include: path.resolve(__dirname, 'node_modules/mapbox-gl/js/render/painter/use_program.js'),
	loader: 'transform/cacheable?brfs'
      }
    ]
  },
};
