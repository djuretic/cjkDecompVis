const path = require("path");
const webpack = require("webpack");
var production = process.env.NODE_ENV === 'production';

var plugins = [];

if(production) {
  plugins = plugins.concat([
    new webpack.optimize.UglifyJsPlugin({
      mangle:   true,
      compress: {
        warnings: false,
      },
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
  ]);
}

module.exports = {
  debug: !production,
  devtool: production ? false : 'eval',
  plugins: plugins,
  entry: path.resolve(".", "src", "main.ts"),
  output: {
    path: 'dist',
    filename: 'app.bundle.js',
    publicPath: '/dist/'
  },
  resolve: {
    extensions: ["", ".js", ".ts"],
  },
  module: {
    loaders: [
      {
        test: /\.html/,
        loader: 'raw'
      },
      {
        test: /\.ts/,
        exclude: /node_modules/,
        loader: 'ts'
      }
    ]
  }
};