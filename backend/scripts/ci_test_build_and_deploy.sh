#!/bin/sh
THIS_PATH="$(dirname "$(realpath "$0")")"

echo "Preping..."
yarn install --frozen-lockfile
echo "Testing..."
yarn check-all
echo "Building..."
$THIS_PATH/with_env.js "yarn build" --env dev
echo "Deploying..."
$THIS_PATH/with_env.js $THIS_PATH/terraform_deploy.sh --env dev
echo "Env testing"
yarn run test:environment
echo "Prep types for FE"
yarn compile-ts4fe