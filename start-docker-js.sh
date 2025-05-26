#!/bin/bash

echo "Starting wasmiot orchestrator webgui in docker"

docker compose -f compose-js.yml up --build
