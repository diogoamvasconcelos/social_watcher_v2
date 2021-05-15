#! /usr/bin/env sh

[ "$TRACE" ] && set -o xtrace
set -o errexit -o nounset

echo Preparing to deploy to $ENV
echo Building...

rm -rf ./build
yarn build

echo Building done, starting deployment...

DEPLOYMENT_S3_PATH=s3://${DEPLOYMENT_S3_BUCKET}

echo Deploying to ${DEPLOYMENT_S3_PATH}

aws s3 cp ./.build/prod/index.html ${DEPLOYMENT_S3_PATH}/index.html --cache-control max-age=0
aws s3 sync ./.build/prod ${DEPLOYMENT_S3_PATH}

echo Deployment done!