#!/bin/bash
set -e

# Starts the development server. Assumes the files are built before this.
./build-npm-dev.sh

cd frontend
npm start