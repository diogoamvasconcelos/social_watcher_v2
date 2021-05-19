#! /usr/bin/env sh

[ "$TRACE" ] && set -o xtrace
set -o errexit -o nounset

THIS_PATH="$(dirname "$(realpath "$0")")"
OUT_DIR=$THIS_PATH/../.out

cd $THIS_PATH/..

# Copy config to build
cp -r config .build

mkdir -p "$OUT_DIR/"
zip -Xqr "$OUT_DIR/lambda_artifact.zip" \
  .build/src \
  .build/config \
  node_modules 