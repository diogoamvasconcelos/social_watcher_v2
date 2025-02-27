const webpack = require("webpack");
const path = require("path");
const glob = require("glob");
const child_process = require("child_process");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

const outputPath = path.resolve(__dirname, ".out");

const handlersPaths = glob.sync("src/handlers/**/*Handler.ts");
const entryMap = handlersPaths.reduce((acc, handlerPath) => {
  const handlerName = path.basename(handlerPath).split(".")[0];
  return {
    ...acc,
    [handlerName]: handlerPath,
  };
}, {});

const handlersZipPlugin = {
  apply: (compiler) => {
    compiler.hooks.done.tap("HandlersZipPlugin", (..._args) => {
      Object.keys(entryMap).forEach((handlerName) => {
        child_process.execSync(
          `zip -Xj ${outputPath}/${handlerName}.zip -r ${outputPath}/${handlerName}/*.js ${outputPath}/${handlerName}/*.map`
        );
      });
    });
  },
};

const config = {
  target: "node14",
  mode: "development",
  entry: entryMap,
  output: {
    path: outputPath,
    filename: "[name]/index.js",
    libraryTarget: "commonjs", // important for aws lambda context
  },
  module: {
    rules: [
      {
        enforce: "pre",
        test: /\.js$/,
        loader: "source-map-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.(ts|js)$/,
        use: "babel-loader",
        exclude: /node_modules/,
      },
      {
        // mjml imports html-minifier that does not work witb es6 (but it's not used so okay to remove)
        test: path.resolve(__dirname, "node_modules/html-minifier/src"),
        use: "null-loader",
      },
    ],
  },
  resolve: {
    extensions: [".js", ".ts", ".json", ".yaml"],
    plugins: [new TsconfigPathsPlugin()],
  },
  plugins: [
    new CleanWebpackPlugin({}), // clean up dist folder before build
    handlersZipPlugin,
  ],
  externals: [
    "pino-pretty", // exclude this pino dep
  ],
  devtool: "source-map",
};

module.exports = config;
