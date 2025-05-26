#!/bin/bash
set -e

echo "Building orchestrator frontend..."

# Read in env variables for the react build
export $(grep -v '^#' .env | xargs)

cd frontend
npm install
npm run build
cd ..

echo "Build complete."
