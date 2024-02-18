#!/usr/bin/env bash
# shellcheck disable=SC1090
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
env_vars_file="$(realpath "$SCRIPT_DIR/../.env")"
[ ! -f "$env_vars_file" ] && echo "File not found: $(realpath "$env_vars_file")" && exit 1
source "$env_vars_file"

echo "Current API key: $RIOT_API_KEY"

read -p "Are you sure you want to deploy the new API key? [y/N] " -r
if ! [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "API key deployment cancelled."
    exit 0
fi

echo "Continuing..."

echo "Deploying new API key to AWS Lambda..."
aws lambda update-function-configuration \
    --function-name "$LAMBDA_FUNCTION_NAME" \
    --environment "Variables={DB_HOST=$DB_HOST,DB_USER=$DB_USER,DB_PASS=$DB_PASS,DB_PORT=$DB_PORT,RIOT_API_KEY=$RIOT_API_KEY}"
echo "API key deployed to AWS Lambda."

echo "Deploying new API key to GitHub..."
gh secret set RIOT_API_KEY --body "$RIOT_API_KEY" -R isak102/dodgetracker

echo "API key deployed to GitHub."
echo "API key deployment complete."

# TODO: deploy key to netlify
