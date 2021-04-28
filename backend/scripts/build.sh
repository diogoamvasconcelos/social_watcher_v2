#! /usr/bin/env sh

[ "$TRACE" ] && set -o xtrace
set -o errexit -o nounset

THIS_PATH="$(dirname "$(realpath "$0")")"

cd $THIS_PATH/..

mkdir -p .build

yarn install --frozen-lockfile # required to compile with ts
yarn tsc --project $THIS_PATH/../tsconfig.json
yarn --prod # prune node_modules dev packages