#! /usr/bin/env sh

[ "$TRACE" ] && set -o xtrace
set -o errexit -o nounset

THIS_PATH="$(dirname "$(realpath "$0")")"

cd $THIS_PATH/..


rm -rf .build

yarn install --frozen-lockfile # required to compile with ts
yarn build:lambdas
yarn --prod # prune node_modules dev packages