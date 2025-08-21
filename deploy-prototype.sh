#!/bin/bash

# Quick deployment script for prototypes
# Usage: ./deploy-prototype.sh [prototype-name]

cd "$(dirname "$0")/prototype-manager"

if [ -z "$1" ]; then
    echo "Interactive deployment mode..."
    npm run deploy
else
    echo "Deploying $1..."
    npm run deploy "$1"
fi