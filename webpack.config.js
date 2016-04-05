const path = require('path')
const webpack = require('webpack')

const TerserPlugin = require('terser-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')


const SRC_DIR = path.resolve(__dirname, 'src/Resources/assets')
const BUILD_DIR = path.resolve(__dirname, 'src/Resources/public')


module.exports = (env = {}, argv) => {

  const prod = argv.mode === 'production'

  return {
    mode: argv.mode,
    entry: {
      main: [
        path.join(SRC_DIR, 'css/main.css'),
        path.join(SRC_DIR, 'js/main.js')
      ],
    },
    output: {
      path: BUILD_DIR,
      filename: '[name].js',
    },
    externals: {
      jquery: 'jQuery',
    },
    resolve: {
      extensions: ['.js', '.json'],
      alias: {
        sonata: path.join(SRC_DIR, 'js/sonata'),
      },
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: [/node_modules/],
          loader: 'babel-loader',
        },
        {
          test: /\.css$/,
          use: [
            {loader: MiniCssExtractPlugin.loader},
            {loader: 'css-loader', options: {
              url: true,
              sourceMap: true,
            }},
            {loader: 'postcss-loader', options: {
              sourceMap: true,
            }},
          ],
        },
        {
          test: /\.html$/,
          loader: 'raw-loader',
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(prod ? 'production' : 'development'),
      }),
      new MiniCssExtractPlugin({
        filename: '[name].css',
      }),
    ],
    optimization: {
      minimizer: [
        new TerserPlugin({
          sourceMap: true,
          parallel: true,
          terserOptions: {
            toplevel: true,
            mangle: {
              module: true,
              reserved: ['Sonata'],
            },
          },
        }),
        new OptimizeCssAssetsPlugin({
          cssProcessorOptions: {map: {inline: false, annotations: true}},
        }),
      ],
    },
  }
}
