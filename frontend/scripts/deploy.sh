#! /usr/bin/env sh

THIS_PATH="$(dirname "$(realpath "$0")")"

[ "$TRACE" ] && set -o xtrace
set -o errexit -o nounset

echo Preparing to deploy to $ENV

OUT_PATH=$THIS_PATH/../.out

rm -rf $OUT_PATH
yarn build

echo Building done, starting deployment...

S3_PATH=s3://${S3_BUCKET_NAME}

aws s3 cp $OUT_PATH/index.html ${S3_PATH}/index.html --cache-control max-age=0
aws s3 sync $OUT_PATH/ ${S3_PATH}