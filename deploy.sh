#!/bin/bash

# Build the project
echo "Building project..."
npm run build:production

# Copy files while preserving git
echo "Deploying to server directory..."
rsync -av --delete --exclude='.git' --exclude='.gitignore' dist/ /Users/navil/Github/bilregistret-server/

echo "Deployment complete!"
echo "Don't forget to commit and push your changes in the server directory." 