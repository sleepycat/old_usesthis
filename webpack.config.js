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
  resolve: {
    extensions: ['', '.js', '.jsx'],
    alias: {
      webworkify: 'webworkify-webpack'
    }
  },
  plugins:[
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    new webpack.DefinePlugin({
      'process.env':{
        'NODE_ENV': JSON.stringify('production')
      }
    })
  ],
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
        include: path.resolve(__dirname, 'node_modules/webworkify/index.js'),
        loader: 'worker'
      },
      {
        test: /mapbox-gl.+\.js$/,
        loader: 'transform/cacheable?brfs'
      },
      {
        test: require.resolve("mapbox-gl-geocoder"),
        loader: "imports?mapboxgl=mapbox-gl"
      },
      {
        test: require.resolve("mapbox-gl-flash"),
        loader: "imports?mapboxgl=mapbox-gl"
      }
    ]
  },
};
