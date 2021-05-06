#! /usr/bin/env sh

[ "$TRACE" ] && set -o xtrace
set -o errexit -o nounset

THIS_PATH="$(dirname "$(realpath "$0")")"
OUT_DIR=$THIS_PATH/../.out

cd $THIS_PATH/..

# Copy config to backend so it keeps the relative paths
cp -r config .build/backend

mkdir -p "$OUT_DIR/"
zip -Xqr "$OUT_DIR/lambda_artifact.zip" \
  .build/backend/src \
  .build/backend/config \
  .build/shared \
  node_modules 