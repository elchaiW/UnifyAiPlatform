#!/bin/bash
# Next.js Production Start Script for Deployment

echo "🚀 Starting Next.js application in production mode..."

# Set production environment
export NODE_ENV=production
export PORT=${PORT:-3000}

echo "🌍 Environment: $NODE_ENV"
echo "🔌 Port: $PORT"

# Start Next.js application
echo "▲ Starting Next.js server..."
npx next start -p $PORT