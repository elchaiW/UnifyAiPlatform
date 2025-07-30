#!/bin/bash

# GitHub Codespaces Setup Script for Luminadoc
echo "🚀 Setting up Luminadoc development environment in GitHub Codespaces..."

# Update package manager
echo "📦 Updating package manager..."
npm update -g npm

# Install global development tools
echo "🔧 Installing global development tools..."
npm install -g typescript
npm install -g @types/node
npm install -g prettier
npm install -g eslint

# Install project dependencies
echo "📋 Installing project dependencies..."
npm install

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating environment file..."
    cp .env.example .env
    echo "⚠️  Please update .env file with your actual API keys"
fi

# Set up git configuration for better performance
echo "⚙️  Configuring git for optimal performance..."
git config --global core.preloadindex true
git config --global core.fscache true
git config --global gc.auto 256

# Create useful aliases
echo "🔗 Setting up helpful aliases..."
echo 'alias ll="ls -la"' >> ~/.bashrc
echo 'alias dev="npm run dev"' >> ~/.bashrc
echo 'alias build="npm run build"' >> ~/.bashrc
echo 'alias lint="npm run lint"' >> ~/.bashrc

# Source the updated bashrc
source ~/.bashrc

echo "✅ Codespace setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env file with your API keys"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Open http://localhost:5000 to see your application"
echo ""
echo "Useful commands:"
echo "- dev: Start development server"
echo "- build: Build for production"
echo "- lint: Run ESLint"
echo "- npm run db:push: Push database schema changes"