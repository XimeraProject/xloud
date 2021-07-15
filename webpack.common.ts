import { Configuration } from "webpack";

import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import Dotenv from 'dotenv-webpack';
import webpack from 'webpack';
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";

const config : Configuration = {
  plugins: [
    new Dotenv(),
    new HtmlWebpackPlugin({title: "Ximera",
                           template: 'src/index.html',
                           minify: {
                             collapseWhitespace: true,
                             removeComments: true
                           }
                          }),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    })    
  ],
  entry: {
    bundle: './src/index.tsx',
  },  
  resolve: {
    fallback: {
      "https": require.resolve("https-browserify"),
      "path": require.resolve("path-browserify"),
      "http": require.resolve("stream-http"),
      "buffer": require.resolve("buffer/")
    },
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  output: {
    filename: 'main.[chunkhash].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            //transpileOnly: true,
            experimentalWatchApi: true,
          }
        },
        exclude: /node_modules/,
      },      
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.svg$/,
        loader: 'svg-url-loader'
      },
      {
        test: /\.png$/,
        loader: 'file-loader'
      },      
      {
        test: /\.(wasm)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
      {
        test: /\.(dump.gz)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
      {
        test: /\.worker\.js$/,
        use: { loader: 'worker-loader' }
      },
      {
        test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[hash].[ext]',
              outputPath: 'fonts/',
              publicPath: url => `fonts/${url}`
            }
          }
        ]
      },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      }
    ],
  },
  optimization: {
    minimizer: [
      new CssMinimizerPlugin(),
    ],
  },
};

export default config;


