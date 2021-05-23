#!/bin/sh

rm -rf .build
rm -rf dist

echo "testing and building..."
yarn check-all && yarn build

echo "creating dist..."

mkdir -p dist

# flatten the src to dist, and copied the package and README so that the npm package can be publish from dist
# which results in a cleaner package (no nested /dist/src folders)
cp -r .build/src/* dist
cp package.json dist
cp README.md dist

echo "done!"