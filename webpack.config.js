const path = require("path");
const webpack = require("webpack");
const envify = require("process-envify");
const env = require("./env");
// const pkg = require('./package');

const SOURCE_ROOT = path.join(__dirname, "src");
const DISTRIBUTION_ROOT = path.join(__dirname, "public");

module.exports = ({ prod = false } = {}) => ({
  target: 'node',
  mode: prod ? "production" : "development",
  context: SOURCE_ROOT,
  entry: "./extension.js",
  output: {
    path: DISTRIBUTION_ROOT,
    // filename: "main.js",
    // filename: prod ? "[name].[hash].js" : "[name].js",
    // chunkFilename: prod ? "[id].[chunkhash].js" : "[name].js",
    publicPath: "/",
    filename: 'extension.js',
    // libraryTarget: "commonjs2",
    devtoolModuleFilenameTemplate: "../[resource-path]",
  },
  devtool: 'source-map',
  externals: {
    vscode: "commonjs vscode" // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [{
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }]
      },

    ].filter(Boolean)
  },
  resolve: {
    extensions: [".mjs", ".js", ".svelte"],
    alias: {
      "~": SOURCE_ROOT
    }
  },
  plugins: [

    new webpack.DefinePlugin(envify(env)),

  ].filter(Boolean),
  optimization: {
    splitChunks: {
      cacheGroups: {
        common: {
          name: "common",
          chunks: "initial",
          minChunks: 2
        },
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendor",
          chunks: "all"
        }
      }
    },
    runtimeChunk: {
      name: "manifest"
    }
  },
  devServer: {
    contentBase: DISTRIBUTION_ROOT,
    historyApiFallback: true,
    host: env.HOST_NAME,
    hot: true,
    inline: true,
    overlay: true,
    port: env.SITE_PORT
  },
  devtool: prod ? "hidden-source-map" : "cheap-module-eval-source-map"
});
