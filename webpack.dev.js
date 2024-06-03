const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const CspHtmlWebpackPlugin = require('csp-html-webpack-plugin');

function generateNonce() {
  return crypto.randomBytes(16).toString('base64');
}

// Generate nonce at build time (not per request)
const nonce = generateNonce();
console.log('nonce', nonce);

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
      chunks: ['main'],
      nonce,
    }),
    new HtmlWebpackPlugin({
      template: 'demo/index.html',
      filename: 'host.html',
      chunks: ['host']
    }),
    new CspHtmlWebpackPlugin({
      'default-src': "'self'",
      'script-src': [`'nonce-${nonce}'`, "'strict-dynamic'"],
      'style-src': ["'self'", "'unsafe-inline'", 'https://trusted.cdn.com'],
      'img-src': ["'self'", 'data:', 'https://trusted.cdn.com'],
      'connect-src': ["'self'", 'wss://streaming.mypurecloud.com', 'https://api.mypurecloud.com'],
      'font-src': ["'self'", 'https://trusted.cdn.com'],
      'object-src': "'none'",
      'base-uri': "'self'",
    }, {
      enabledHtmlFiles: ['index.html'], // Only apply CSP to index.html
      nonceEnabled: {
        'script-src': true,
        'style-src': false,
      },
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'demo/host.css', to: 'host.css' }
      ]
    })
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    // headers: () => {
    //   return {'Content-Security-Policy': `default-src 'self'; script-src 'nonce-${nonce}' 'strict-dynamic' 'self'; object-src 'none'; base-uri 'self';`};
    // },
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