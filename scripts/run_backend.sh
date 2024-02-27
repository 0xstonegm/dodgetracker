#!/usr/bin/env bash
set -e

PROJECT_ROOT_DIR=$(realpath "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)/../")

cd "$PROJECT_ROOT_DIR"

echo "Building backend..."
node "build-backend.js"
echo "Build completed."

echo "Starting backend..."
node "lambda/updateDatabase/dist/main.js"
echo "Backend finished running."

cd -
