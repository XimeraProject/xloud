import { Configuration } from "webpack";
import { merge } from 'webpack-merge';
import common from './webpack.common';

export default merge<Configuration>(common, {
  mode: 'production',
  devtool: 'source-map'
});

