const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const pkg = require('./package.json');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = function webpackConfig(options) {
  const production = options.production || false;

  const config = {
    entry: {
      vendors: Object.keys(pkg.dependencies),
      app: [path.join(__dirname, 'js', 'index.js')]
    },
    resolve: {
      extensions: ['', '.js', '.jsx'],
    },
    output: {
      path: path.join(__dirname, '__build__'),
      filename: 'bundle-[chunkhash:6].js',
      publicPath: options.CDN || '/',
    },
    stats: {
      colors: true,
      reasons: !production,
    },
    debug: !production,
    devtool: !production ? 'eval-cheap-module-source-map' : false,
    module: {
      loaders: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          query: {
            presets: ['es2015', 'react'],
          },
        },
        {
          test: /\.json$/,
          loader: 'json',
        },
        {
          test: /\.csv$/,
          loader: 'dsv',
        },
        {
          test: /\.svg$/,
          loader: 'svg-sprite',
        },
        {
            test: /\.(css|scss)$/,
            loader: ExtractTextPlugin.extract('css!sass')
        }
      ],
    },
    plugins: (() => {
      const p = [];

      if (production) {
        p.push(new webpack.optimize.OccurenceOrderPlugin());
        p.push(new webpack.optimize.UglifyJsPlugin({
          compressor: {
            warnings: false,
            screw_ie8: true,
          },
        }));
        p.push(new webpack.optimize.DedupePlugin());
      }

      if (!production) {
        p.push(new webpack.HotModuleReplacementPlugin());
        p.push(new webpack.NoErrorsPlugin());
      }

      p.push(new webpack.optimize.CommonsChunkPlugin('vendors', 'vendors-[hash:6].js'));

      p.push(new webpack.ProvidePlugin({
        Promise: 'exports?global.Promise!es6-promise',
        fetch: 'exports?self.fetch!whatwg-fetch',
      }));

      p.push(new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      }));

      p.push(new ExtractTextPlugin('style.css', {
          allChunks: true
      }));

      p.push(new HtmlWebpackPlugin({
          inject: false,
          template: './index.html'
      }));

      return p;
    })(),
  };
  return config;
};
