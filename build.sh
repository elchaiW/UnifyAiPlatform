#!/bin/bash
# Next.js build script for deployment

echo "🚀 Building Next.js application for deployment..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build Next.js application
echo "🔨 Building Next.js application..."
npx next build

echo "✅ Build completed successfully!"
echo "🎯 Application ready for deployment"