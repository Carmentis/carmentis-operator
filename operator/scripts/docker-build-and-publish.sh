#!/bin/bash

# Exit on error
set -e

# --- Input ---
COMMAND="$1"
VERSION="$2"
IMAGE_NAME="ghcr.io/carmentis/operator/back"

# Vérifications
if [ -z "$COMMAND" ] || [ -z "$VERSION" ]; then
  echo "❌ Usage: $0 <build|publish> <version>"
  exit 1
fi

# Build de l'image Docker
if [ "$COMMAND" == "build" ]; then
  echo "🔨 Building Docker image $IMAGE_NAME:$VERSION ..."
  docker build -t $IMAGE_NAME:${VERSION} -t $IMAGE_NAME:latest .
  echo "✅ Build terminé !"

# Publish (push) de l'image Docker
elif [ "$COMMAND" == "publish" ]; then
  echo "🚀 Publishing Docker image $IMAGE_NAME:$VERSION ..."
  docker push $IMAGE_NAME:${VERSION}
  docker push $IMAGE_NAME:latest
  echo "✅ Publish terminé !"

else
  echo "❌ Commande inconnue : $COMMAND"
  echo "Usage: $0 <build|publish> <version>"
  exit 1
fi
