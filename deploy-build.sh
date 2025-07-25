#!/bin/bash
# Next.js Production Build Script for Deployment

echo "🚀 Starting Next.js production build..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build Next.js application
echo "🏗️ Building Next.js application..."
npx next build

# Verify build output
echo "✅ Verifying build output..."
if [ -d ".next" ]; then
    echo "✅ Build successful! .next directory created"
    ls -la .next/
else
    echo "❌ Build failed! .next directory not found"
    exit 1
fi

echo "🎉 Production build completed successfully!"