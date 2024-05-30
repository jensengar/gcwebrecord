const { merge } = require('webpack-merge');

module.exports = merge({
  mode: 'production',
  entry: './src/index.ts',
  output: {
    filename: 'gc-screen-rec.bundle.[contenthash].js',
    path: common.output.path,
    clean: true,
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
    extensions: ['.ts', '.js']
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.html'
    })
  ]
});