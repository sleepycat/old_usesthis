module.exports = {
  entry: './public/javascripts/main.js',
  output: { path: "public/javascripts", filename: 'bundle.js' },
  node: {
    console: true
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel',
        exclude: /node_modules/,
        query: {
          presets: ['es2015', 'react']
        }
      }
    ]
  },
};
