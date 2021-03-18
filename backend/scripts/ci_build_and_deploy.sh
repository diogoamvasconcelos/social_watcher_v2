#!/bin/sh
THIS_PATH="$(dirname "$(realpath "$0")")"

echo "Building..."
$THIS_PATH/with_env_vars.sh $THIS_PATH/build.sh
echo "Packaging..."
$THIS_PATH/package_to_out.sh
echo "Deploying..."
$THIS_PATH/with_env_vars.sh $THIS_PATH/terraform_deploy.sh

echo "Resetting..."
cd $THIS_PATH/..
npm ci