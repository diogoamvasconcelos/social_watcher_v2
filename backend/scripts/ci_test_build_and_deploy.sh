#!/bin/sh

# exit if any fails
set -e

THIS_PATH="$(dirname "$(realpath "$0")")"

echo "Preping..."
yarn install --frozen-lockfile
echo "Testing..."
yarn check-all
echo "Building dev..."
$THIS_PATH/with_env.js "yarn build" --env dev
echo "Deploying dev..."
$THIS_PATH/with_env.js $THIS_PATH/terraform_deploy.sh --env dev
echo "Env testing dev"
yarn run test:environment

if [[ $@ == *--prod* ]]; then
	echo "Building prod..."
	$THIS_PATH/with_env.js "yarn build" --env prod
	echo "Deploying prod..."
	$THIS_PATH/with_env.js $THIS_PATH/terraform_deploy.sh --env prod
fi

echo "Prep types for FE"
yarn compile-ts4fe