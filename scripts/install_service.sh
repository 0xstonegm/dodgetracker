#!/usr/bin/env bash
set -e

PROJECT_ROOT_DIR=$(realpath "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)/../")

cd "$PROJECT_ROOT_DIR"

echo "Installing service..."
sudo cp -r "$PROJECT_ROOT_DIR/lambda/updateDatabase/service/dodgetracker.service" /etc/systemd/system/
echo "Service installed."

cd - >/dev/null

echo "Service can now be started with 'sudo systemctl start dodgetracker' and stopped with 'sudo systemctl stop dodgetracker'."
