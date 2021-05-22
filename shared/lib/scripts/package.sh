#!/bin/sh

rm -rf .build
rm -rf dist

echo "testing and building..."
yarn check-all && yarn build

echo "creating dist..."

mkdir -p dist

cp -r .build/src/* dist
cp package.json dist
cp README.md dist

echo "done!"