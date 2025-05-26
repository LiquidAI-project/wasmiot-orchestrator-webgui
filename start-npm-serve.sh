#!/bin/bash
set -e

# Get non-root user
if [ "$SUDO_USER" ]; then
    USERNAME="$SUDO_USER"
else
    echo "Error: This script must be run with sudo."
    exit 1
fi

# Build the webgui as non root
sudo -u "$USERNAME" ./build-npm.sh
cd frontend
npm install -g serve

# Run the webgui as root (for some reason this seemed to need root privilege to work...)
sudo -u "$USERNAME" serve -s build