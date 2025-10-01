#!/bin/bash

# Exit on error
set -e

# --- Input ---
VERSION="$1"

if [ -z "$VERSION" ]; then
  echo "❌ Usage: npm run version:bump <version>"
  exit 1
fi



NO_TAG_OPTIONS="--no-git-tag-version --allow-same-version --no-commit-hooks"
npm version $NO_TAG_OPTIONS $VERSION
npm version $NO_TAG_OPTIONS --ws $VERSION
echo "✅ All package.json bumped to version ${VERSION}"