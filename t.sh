#!/usr/bin/env bash

node ./r.js
npm run transpile
npm publish --access public

cd ../hawthorn/platform
npm install --save se-react-data-list
