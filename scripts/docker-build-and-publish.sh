#!/bin/bash

# Exit on error
set -e

# --- Input ---
VERSION="$1"

if [ -z "$VERSION" ]; then
  echo "❌ Usage: npm run docker:build <version>"
  exit 1
fi


docker build -t ghcr.io/carmentis/dev/operator/front:dev -f dockerfiles/workspace.Dockerfile .
docker build -t ghcr.io/carmentis/dev/operator/back:dev -f dockerfiles/operator.Dockerfile .
