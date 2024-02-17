#!/usr/bin/env bash
set -e

# Script to update the RiotAPI key in github secrets and the Lambda function configuration

api_key=$1
[ "$api_key" = "" ] && echo "Usage: $0 <api_key>" && exit 1

ENV_VARS_FILE="../.env.txt"
[ ! -f "$ENV_VARS_FILE" ] && echo "File not found: $(realpath "$ENV_VARS_FILE")" && exit 1

sed -i "s/^RIOT_API_KEY=.*/RIOT_API_KEY=$api_key/" "$ENV_VARS_FILE"

LAMBDA_FUNCTION_NAME="dodgetracker-UpdatePlayersAndDodges-v0GzQQD5rILI"

# Construct the environment variables string in the required format
ENV_VARS_STRING=$(awk -F'=' '{print $1"="$2}' "$ENV_VARS_FILE" | paste -sd ',' -)

# Update the Lambda function configuration with the new environment variables
aws lambda update-function-configuration --function-name "$LAMBDA_FUNCTION_NAME" --environment "Variables={$ENV_VARS_STRING}"

gh secret set RIOT_API_KEY --body "$api_key" -R isak102/dodgetracker

# TODO: update netlify env vars
# FIXME: remove .env.txt and only use .env file if possible
