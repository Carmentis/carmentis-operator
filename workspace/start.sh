#!/bin/bash
# generate the .env file
printenv | grep WORKSPACE > .env
npm install
npm run build
npm run start