#!/bin/bash

# Next.js production build script
echo "🚀 Starting Next.js production build..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the application
echo "🔨 Building Next.js application..."
next build

# Verify build completed
if [ -d ".next" ]; then
    echo "✅ Build completed successfully!"
    echo "📁 Build output:"
    ls -la .next/
else
    echo "❌ Build failed - .next directory not found"
    exit 1
fi

echo "🎉 Ready for deployment!"