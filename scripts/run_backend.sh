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

cd "$PROJECT_ROOT_DIR" || exit

source .env

export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh" || {
    echo "Failed to load nvm"
    exit 1
}
nvm use || exit 1

echo "Building backend..."
npx tsc -p src/backend/tsconfig.json
echo "Build completed."

if "$RUN"; then
    echo "Starting backend..."
    while true; do
        node src/backend/dist/backend/main.js
    done
    echo "Backend finished running."
fi

cd - >/dev/null || exit
