#!/bin/sh
THIS_PATH="$(dirname "$(realpath "$0")")"

echo "Preping..."
yarn install --frozen-lockfile
echo "Testing..."
yarn check-all
echo "Building..."
$THIS_PATH/with_env.js $THIS_PATH/build.sh --env dev
echo "Packaging..."
$THIS_PATH/package_to_out.sh
echo "Resetting node_modules..."
yarn install --frozen-lockfile
echo "Deploying..."
$THIS_PATH/with_env.js $THIS_PATH/terraform_deploy.sh --env dev
echo "Env testing"
yarn run test:environment
echo "Reverting yarn"
yarn
yarn compile-ts4fe