#!/usr/bin/env bash

RUN=true

while getopts b flag; do
    case $flag in
        b) RUN=false ;; # Use -b to only build and not run
        *)
            echo "Invalid option"
            exit 1
            ;;
    esac
done

PROJECT_ROOT_DIR=$(realpath "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)/../")

if [ "$HOSTNAME" = "HP" ]; then
    NODE_BIN="/usr/bin/node"
else
    NODE_BIN="/home/isak102/.nvm/versions/node/v21.6.2/bin/node"
fi

cd "$PROJECT_ROOT_DIR" || exit

source .env

echo "Building backend..."
npx tsc -p src/backend/tsconfig.json
echo "Build completed."

if "$RUN"; then
    echo "Starting backend..."
    while true; do
        "$NODE_BIN" src/backend/dist/backend/main.js
    done
    echo "Backend finished running."
fi

cd - >/dev/null || exit
