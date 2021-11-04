const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const RobotstxtPlugin = require("robotstxt-webpack-plugin");

const prod = process.env.ENV === "prod";

const config = {
  entry: ["./src/index.tsx"],
  devtool: prod ? "source-map" : "eval-source-map",
  mode: prod ? "production" : "development",
  devServer: {
    historyApiFallback: true,
    host: "0.0.0.0",
    hot: true,
  },
  output: {
    path: path.resolve(__dirname, ".out"),
    filename: "bundle-[chunkhash].js",
    publicPath: "/",
  },
  module: {
    rules: [
      {
        test: /\.js(x)?$/,
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
        test: /\.html$/i,
        loader: "html-loader",
      },
      {
        test: /\.jpg$/,
        use: "file-loader",
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: "@svgr/webpack",
            options: {
              // babel: false,
              icon: true,
            },
          },
        ],
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
      lang: "en",
      favicon: "./assets/favicon.ico",
      filename: "index.html",
      template: "./src/index.ejs",
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
    new RobotstxtPlugin({
      policy: [
        {
          userAgent: "*",
          allow: "/",
        },
      ],
      // sitemap: "https://thesocialwatcher.com/sitemap.xml",
    }),
  ]
    .concat(process.env.ANALYZE ? [new BundleAnalyzerPlugin()] : [])
    .concat(prod ? [new CleanWebpackPlugin()] : []), // clean up dist folder before build
};

module.exports = config;
