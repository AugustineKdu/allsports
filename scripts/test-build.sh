#!/bin/bash

echo "🧹 Cleaning build cache..."
rm -rf .next

echo "🔨 Running production build test..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful! Ready for deployment"

    echo "🚀 Testing production server locally..."
    echo "Starting server on http://localhost:3000"
    npm start
else
    echo "❌ Build failed! Please fix errors before deployment"
    exit 1
fi