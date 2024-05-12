#!/usr/bin/env bash

PROJECT_ROOT_DIR=$(realpath "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)/../")

if [ "$HOSTNAME" = "HP" ]; then
    NODE_BIN="/usr/bin/node"
else
    NODE_BIN="/home/isak102/.nvm/versions/node/v21.6.2/bin/node"
fi

cd "$PROJECT_ROOT_DIR" || exit

source .env

echo "Building backend..."
tsc -p lambda/updateDatabase/tsconfig.json
echo "Build completed."

echo "Starting backend..."
while true; do
    "$NODE_BIN" lambda/updateDatabase/dist/lambda/updateDatabase/main.js
done
echo "Backend finished running."

cd - || exit
