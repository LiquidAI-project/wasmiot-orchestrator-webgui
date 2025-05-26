#!/bin/bash
set -e

# Build and start the rust version of the webgui.

echo "Starting orchestrator webgui..."

./build-npm.sh

./build-rust.sh

./frontend-server/target/release/frontend-server
