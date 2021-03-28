#!/bin/sh
THIS_PATH="$(dirname "$(realpath "$0")")"

echo "Preping..."
npm ci
echo "Testing..."
npm run check-all
echo "Building..."
$THIS_PATH/with_env.js $THIS_PATH/build.sh
echo "Packaging..."
$THIS_PATH/package_to_out.sh
echo "Resetting npm..."
npm ci
echo "Deploying..."
$THIS_PATH/with_env.js $THIS_PATH/terraform_deploy.sh
echo "Env testing"
npm run test:environment