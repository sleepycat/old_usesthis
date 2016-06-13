var webpack = require('webpack')
var path = require('path')

module.exports = {
  entry: './public/javascripts/main.js',
  output: { path: "public/javascripts", filename: 'bundle.js' },
  node: {
    console: true,
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['', '.js', '.jsx'],
    alias: {
      webworkify: 'webworkify-webpack',
      'mapbox-gl': path.resolve('./node_modules/mapbox-gl/dist/mapbox-gl.js')
    }
  },
  module: {
    noParse: /node_modules\/json-schema\/lib\/validate\.js/,
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel',
        exclude: /node_modules/,
        query: {
          presets: ['es2015', 'stage-0', 'react']
        }
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
