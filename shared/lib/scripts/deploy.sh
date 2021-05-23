#!/bin/sh

yarn package
cd dist
# needs -f because dist is gitignored
yarn publish -f
