const webpack = require("webpack");
const path = require("path");
const glob = require("glob");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

const handlersPaths = glob.sync("src/handlers/**/*Handler.ts");
const entryMap = handlersPaths.reduce((acc, handlerPath) => {
  const handler = path.basename(handlerPath).split(".")[0];
  return {
    ...acc,
    [handler]: handlerPath,
  };
}, {});

const config = {
  target: "node14",
  mode: "production",
  entry: entryMap,
  output: {
    path: path.resolve(__dirname, ".out"),
    filename: "[name]/index.js",
    libraryTarget: "commonjs", // important for aws lambda context
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
      },
    ],
  },
  resolve: {
    extensions: [".js", ".ts", ".json", ".yaml"],
    plugins: [new TsconfigPathsPlugin()],
  },
  plugins: [
    new CleanWebpackPlugin(), // clean up dist folder before build
  ],
  externals: ["pino-pretty"], // exclude this pino dep
};

module.exports = config;
