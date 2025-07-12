#!/bin/bash
echo "🚀 Deploying beta.bilregistret.ai..."

# Pull latest code
git pull origin main

# Generate fresh SSG data
echo "📊 Generating fresh SSG data..."
npm run generate-ssg:real -- --force

# Build static export
echo "🏗️ Building static export..."
npm run export:static

# Deploy static files
sudo rm -rf /var/www/beta.bilregistret.ai/*
sudo cp -r deploy/static/* /var/www/beta.bilregistret.ai/
sudo chown -R www-data:www-data /var/www/beta.bilregistret.ai
sudo chmod -R 755 /var/www/beta.bilregistret.ai

# Restart nginx
sudo nginx -t && sudo systemctl reload nginx

echo "✅ Deployment complete with fresh SSG data!"
echo "🌐 Visit: https://beta.bilregistret.ai"