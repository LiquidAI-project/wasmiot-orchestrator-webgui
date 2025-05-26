#!/bin/bash
set -e

# Read in env variables
export $(grep -v '^#' .env | xargs)

echo "Building rust server for webgui"
cd frontend-server
cargo build --release
cd ..