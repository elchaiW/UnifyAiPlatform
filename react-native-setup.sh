#!/bin/bash

# React Native iOS Setup Script for Luminadoc
echo "🚀 Setting up React Native iOS project for Luminadoc..."

# Create React Native project
echo "📱 Creating React Native project..."
npx react-native init LuminadocApp --template react-native-template-typescript

cd LuminadocApp

# Install essential dependencies
echo "📦 Installing dependencies..."
npm install @react-native-async-storage/async-storage
npm install @react-native-community/netinfo
npm install react-native-vector-icons
npm install @react-navigation/native
npm install @react-navigation/stack
npm install react-native-screens
npm install react-native-safe-area-context
npm install react-native-gesture-handler

# Supabase and authentication
npm install @supabase/supabase-js
npm install react-native-url-polyfill

# AI and API dependencies
npm install @anthropic-ai/sdk
npm install @google/generative-ai
npm install openai

# UI components
npm install react-native-paper
npm install react-native-vector-icons

# Install iOS pods
echo "🍎 Installing iOS dependencies..."
cd ios && pod install && cd ..

echo "✅ React Native setup complete!"
echo ""
echo "Next steps:"
echo "1. cd LuminadocApp"
echo "2. npx react-native run-ios"
echo "3. Start converting components from the web app"