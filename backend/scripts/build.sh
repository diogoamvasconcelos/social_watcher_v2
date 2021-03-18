#! /usr/bin/env sh

[ "$TRACE" ] && set -o xtrace
set -o errexit -o nounset

THIS_PATH="$(dirname "$(realpath "$0")")"

cd $THIS_PATH/..

mkdir -p .build

npm ci # required to compile with ts
npx tsc --project tsconfig.build.json
npm ci --only=prod # prune node_modules dev packages