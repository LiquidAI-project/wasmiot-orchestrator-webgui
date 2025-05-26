#!/bin/bash
set -e

echo "Building orchestrator frontend for dev server..."

cd frontend
npm install
npm run build
cd ..

echo "Build complete."
