# GitHub Codespaces iOS Development Guide for Luminadoc

## Overview
Complete guide to develop, build, and test your Luminadoc iOS app using GitHub Codespaces with React Native.

## Prerequisites Setup in GitHub Codespaces

### 1. Create GitHub Repository
```bash
# Create new repository on GitHub
# Name: luminadoc-ios
# Initialize with README
```

### 2. Open in Codespaces
1. Go to your GitHub repository
2. Click "Code" → "Codespaces" → "Create codespace on main"
3. Wait for Codespaces to initialize

### 3. Initial Environment Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+ (required for React Native)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install essential build tools
sudo apt-get install -y build-essential git curl watchman

# Install React Native CLI
npm install -g react-native-cli @react-native-community/cli

# Install Expo CLI (alternative approach)
npm install -g @expo/cli
```

## Project Creation and Setup

### 4. Create React Native Project
```bash
# Method 1: React Native CLI (Native approach)
npx react-native init LuminadocApp --template react-native-template-typescript
cd LuminadocApp

# Method 2: Expo (Easier for beginners)
npx create-expo-app LuminadocApp --template typescript
cd LuminadocApp
```

### 5. Install Dependencies
```bash
# Core dependencies
npm install @react-navigation/native @react-navigation/stack
npm install react-native-screens react-native-safe-area-context
npm install react-native-gesture-handler

# Supabase & Authentication
npm install @supabase/supabase-js
npm install @react-native-async-storage/async-storage
npm install react-native-url-polyfill

# AI Services
npm install @anthropic-ai/sdk @google/generative-ai openai

# UI Components
npm install react-native-paper react-native-vector-icons
npm install react-native-elements react-native-vector-icons

# For Expo projects, install Expo-compatible versions
expo install @react-navigation/native @react-navigation/stack
expo install react-native-screens react-native-safe-area-context
```

### 6. Project Structure Setup
```bash
# Create project directories
mkdir -p src/{components,screens,services,types,utils}
mkdir -p src/screens/{Auth,Chat,Dashboard}
mkdir -p src/services/{api,supabase,ai}
```

## Development Environment Configuration

### 7. Configure Codespaces for iOS Development
Create `.devcontainer/devcontainer.json`:
```json
{
  "name": "Luminadoc iOS Development",
  "image": "mcr.microsoft.com/devcontainers/javascript-node:18",
  "features": {
    "ghcr.io/devcontainers/features/git:1": {},
    "ghcr.io/devcontainers/features/github-cli:1": {}
  },
  "customizations": {
    "vscode": {
      "extensions": [
        "ms-vscode.vscode-typescript-next",
        "bradlc.vscode-tailwindcss",
        "esbenp.prettier-vscode",
        "ms-vscode.vscode-json"
      ]
    }
  },
  "postCreateCommand": "npm install -g @react-native-community/cli @expo/cli",
  "forwardPorts": [8081, 19000, 19001, 19002],
  "portsAttributes": {
    "8081": {
      "label": "React Native Metro",
      "onAutoForward": "notify"
    },
    "19000": {
      "label": "Expo Dev Server",
      "onAutoForward": "notify"
    }
  }
}
```

### 8. Environment Variables Setup
Create `.env` file:
```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://koxnemiudjbditxuojxw.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtveG5lbWl1ZGpiZGl0eHVvanh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNDczMDIsImV4cCI6MjA2ODkyMzMwMn0.OxaHUwgkNjn51PQ8mrw_LR0Em0pBEXiQ6OaeMlt2Qds

# AI Service API Keys (add your keys)
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_key
EXPO_PUBLIC_ANTHROPIC_API_KEY=your_anthropic_key
EXPO_PUBLIC_GOOGLE_AI_API_KEY=your_google_key

# API Endpoint (your current backend)
EXPO_PUBLIC_API_BASE_URL=https://your-luminadoc-api.replit.app
```

## Core App Development

### 9. Copy Components from Web Version
Use the React Native components I created in `ios-components/` folder as your starting point:

```bash
# Copy the components I created
cp ../ios-components/AuthScreen.tsx src/screens/Auth/
cp ../ios-components/ChatScreen.tsx src/screens/Chat/
cp ../ios-components/App.tsx src/
```

### 10. Update App.tsx for Navigation
```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AuthScreen from './src/screens/Auth/AuthScreen';
import ChatScreen from './src/screens/Chat/ChatScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### 11. Configure Supabase Service
Create `src/services/supabase/client.ts`:
```typescript
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

## Testing and Development

### 12. Start Development Server
```bash
# For Expo projects (Recommended for Codespaces)
npx expo start

# For React Native CLI projects
npx react-native start
```

### 13. Testing Options in Codespaces

**Option A: Expo Go App (Easiest)**
1. Install Expo Go on your iPhone/iPad
2. Scan QR code from terminal
3. Test app directly on device

**Option B: iOS Simulator (Requires macOS)**
- Not available in Codespaces (Linux environment)
- Need local macOS machine or GitHub Actions

**Option C: Web Preview (Development)**
```bash
# Run Expo web version for initial testing
npx expo start --web
```

### 14. Device Testing Setup
```bash
# Generate development build for physical device
npx expo install expo-dev-client

# Create development build
eas build --platform ios --profile development

# Install on device using TestFlight or direct install
```

## Building for Production

### 15. Configure EAS Build (Expo Application Services)
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Initialize EAS in project
eas build:configure

# Configure app.json/app.config.js
```

### 16. App Configuration
Update `app.json`:
```json
{
  "expo": {
    "name": "Luminadoc",
    "slug": "luminadoc",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "dark",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#0f172a"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourdomain.luminadoc",
      "buildNumber": "1"
    },
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

### 17. Build and Deploy
```bash
# Build for App Store
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

## GitHub Actions CI/CD

### 18. Automated Building
Create `.github/workflows/ios-build.yml`:
```yaml
name: iOS Build

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          
      - name: Install dependencies
        run: npm install
        
      - name: Setup Expo
        uses: expo/expo-github-action@v7
        with:
          expo-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
          
      - name: Build iOS app
        run: eas build --platform ios --non-interactive
```

## Testing Strategy

### 19. Development Testing
```bash
# Unit tests
npm test

# Integration tests with Detox
npm install -g detox-cli
detox build --configuration ios.sim.debug
detox test --configuration ios.sim.debug
```

### 20. Beta Testing
```bash
# Create beta build
eas build --platform ios --profile preview

# Distribute via TestFlight
eas submit --platform ios --latest
```

## Deployment Checklist

### 21. Pre-Submission Requirements
- [ ] App icons (all sizes)
- [ ] Launch screen
- [ ] Privacy policy
- [ ] Terms of service
- [ ] App Store screenshots
- [ ] App description
- [ ] Keywords for App Store

### 22. App Store Submission
```bash
# Final production build
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios --latest
```

## Development Timeline

**Week 1: Setup & Basic App**
- Day 1-2: Codespaces setup and project creation
- Day 3-4: Basic navigation and authentication
- Day 5-7: Chat interface implementation

**Week 2: Features & Integration**
- Day 1-3: AI services integration
- Day 4-5: Supabase backend connection
- Day 6-7: Testing and debugging

**Week 3: Polish & Deployment**
- Day 1-3: UI polish and iOS-specific features
- Day 4-5: Beta testing and fixes
- Day 6-7: App Store submission

## Troubleshooting Common Issues

### Metro Bundle Issues
```bash
# Clear Metro cache
npx react-native start --reset-cache
# or for Expo
npx expo start --clear
```

### iOS Build Errors
```bash
# Clean iOS build
cd ios && xcodebuild clean && cd ..
# Reinstall pods
cd ios && pod install && cd ..
```

### Dependency Conflicts
```bash
# Reset node modules
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

1. **Start with Expo** (recommended for Codespaces)
2. **Copy the React Native components** I created
3. **Test with Expo Go** on your device
4. **Set up EAS Build** for production builds
5. **Submit to App Store** when ready

This guide provides everything you need to develop your Luminadoc iOS app entirely in GitHub Codespaces!