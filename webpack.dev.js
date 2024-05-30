const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
const fs = require('fs');

const certPath = path.join(__dirname, 'ssl/cert.pem');
const keyPath = path.join(__dirname, 'ssl/key.pem');

module.exports = merge({
  mode: 'development',
  devtool: 'inline-source-map',
  entry: {
    main: './src/index.ts',      // Main application entry point
    host: './demo/host.ts'    // Iframe script entry point
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      filename: 'index.html',
      chunks: ['main']
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'demo/host.css', to: 'host.css' }
      ]
    }),
    new HtmlWebpackPlugin({
      template: 'demo/index.html',
      filename: 'host.html',
      chunks: ['host']
    })
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 8443,
    server: {
      type: 'https',
      options: {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      }
    }
  }
});