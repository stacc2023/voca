const path = require('path');
const path_components = path.resolve(__dirname, 'src');
const path_styles = path.resolve(__dirname, 'src');
 
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
 
module.exports = {
  entry: [
    '@babel/polyfill', 
    path_components + '/index.js',
    path_styles + '/index.scss'
  ],
  output: {
    path: path.resolve(__dirname, 'static'),
    filename: 'index.js'
  },
  plugins: [
    new MiniCssExtractPlugin({ filename: 'index.css' }),
  ],
  devServer: {
    contentBase: path.join(__dirname, 'dist'), 
    compress: false, 
    port: 9000
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', ["@babel/preset-react", {"runtime": "automatic"}]],
            plugins: ['@babel/plugin-proposal-class-properties']
          }
        }
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader'
        ],
        exclude: /node_modules/
      }
    ]
  },
  mode: 'development'
};