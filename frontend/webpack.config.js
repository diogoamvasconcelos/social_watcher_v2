const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

const env = process.env.ENV;
const prod = env === "prod";

const config = {
  entry: ["./src/index.tsx"],
  devtool: prod ? "" : "eval-source-map",
  mode: prod ? "production" : "development",
  devServer: {
    host: "0.0.0.0",
    hot: true,
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle-[chunkhash].js",
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: "babel-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.ts(x)?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
        options: {
          projectReferences: true,
        },
      },
      // https://github.com/graphql/graphql-js/issues/2721#issuecomment-723008284
      {
        test: /\.m?js/,
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.png$/,
        use: [
          {
            loader: "url-loader",
            options: {
              mimetype: "image/png",
            },
          },
        ],
      },
      {
        test: /\.(svg|jpg)$/,
        use: "file-loader",
      },
    ],
  },
  resolve: {
    extensions: [".mjs", ".js", ".tsx", ".ts", ".json", ".yaml"],
    plugins: [new TsconfigPathsPlugin()],
    fallback: {
      stream: false,
      crypto: require.resolve("crypto-browserify"),
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "the Social Watcher",
      favicon: "./assets/favicon.ico",
      filename: "index.html",
    }),
    new webpack.EnvironmentPlugin([
      "ENV",
      "AWS_REGION",
      "COGNITO_CLIENT_ID",
      "COGNITO_USER_POOL_ID",
      "COGNITO_CLIENT_DOMAIN",
      "API_ENDPOINT",
      "APP_URL",
    ]),
  ].concat(process.env.ANALYZE ? [new BundleAnalyzerPlugin()] : []),
};

module.exports = config;
