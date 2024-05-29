const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'production',
  output: {
    filename: 'gc-screen-rec.bundle.[contenthash].js',
    path: common.output.path,
    clean: true,
  }
});