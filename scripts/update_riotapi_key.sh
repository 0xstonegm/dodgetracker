#!/usr/bin/env bash
set -e

# Script to update the RiotAPI key in github secrets and the Lambda function configuration
api_key=$1
[ "$api_key" = "" ] && echo "Usage: $0 <api_key>" && exit 1

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"

env_vars_file="$(realpath "$SCRIPT_DIR/../.env.txt")"
[ ! -f "$env_vars_file" ] && echo "File not found: $(realpath "$env_vars_file")" && exit 1

sed -i "s/^RIOT_API_KEY=.*/RIOT_API_KEY=$api_key/" "$env_vars_file"

# Ask for confirmation that you want to deploy the new API key
read -p "Are you sure you want to deploy the new API key? [y/N] " -n 1 -r
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "\nContinuing..."
else
    echo "API key deployment cancelled."
    exit 0
fi

LAMBDA_FUNCTION_NAME="dodgetracker-UpdatePlayersAndDodges-v0GzQQD5rILI" # FIXME: break out into .env file

# Construct the environment variables string in the required format
ENV_VARS_STRING=$(awk -F'=' '{print $1"="$2}' "$env_vars_file" | paste -sd ',' -)

# Update the Lambda function configuration with the new environment variables
aws lambda update-function-configuration --function-name "$LAMBDA_FUNCTION_NAME" --environment "Variables={$ENV_VARS_STRING}"

gh secret set RIOT_API_KEY --body "$api_key" -R isak102/dodgetracker

# TODO: update netlify env vars
# FIXME: remove .env.txt and only use .env file if possible
