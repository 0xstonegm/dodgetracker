#!/usr/bin/env bash
set -e

PROJECT_ROOT_DIR=$(realpath "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)/../")

if [ "$HOSTNAME" = "HP" ]; then
    NODE_BIN="/usr/bin/node"
else
    NODE_BIN="/home/isak102/.nvm/versions/node/v21.6.2/bin/node"
fi

cd "$PROJECT_ROOT_DIR"

source .env

echo "Building backend..."
"$NODE_BIN" "build-backend.js"
echo "Build completed."

echo "Starting backend..."
"$NODE_BIN" "lambda/updateDatabase/dist/main.js"
echo "Backend finished running."

cd -
