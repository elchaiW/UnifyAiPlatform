# Quick Start: Luminadoc iOS App in GitHub Codespaces

## 🚀 5-Minute Setup

### 1. Create GitHub Repository
```bash
# On GitHub.com:
# 1. Create new repository: "luminadoc-ios"
# 2. Initialize with README
# 3. Copy all files from this project
```

### 2. Open in Codespaces
```bash
# On GitHub:
# 1. Click "Code" → "Codespaces" → "Create codespace on main"
# 2. Wait for environment to load (2-3 minutes)
```

### 3. Run Setup Script
```bash
# In Codespaces terminal:
bash codespaces-setup.sh
```

### 4. Start Development
```bash
cd LuminadocApp
npm run dev
```

### 5. Test on Your iPhone
1. Install **Expo Go** app on your iPhone
2. Scan QR code from terminal
3. Your iOS app loads instantly!

## 📱 What You Get

✅ **Complete iOS App** - Authentication, chat, AI integration  
✅ **Supabase Backend** - Your existing database and auth  
✅ **AI Services Ready** - Claude, ChatGPT, Gemini, Grok  
✅ **App Store Ready** - Build and deploy pipeline  
✅ **Real Device Testing** - Works on your iPhone immediately  

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Test on web browser
npm run web

# Build for App Store
npm run build:ios

# Deploy to App Store
eas submit --platform ios
```

## 📋 Required Secrets for Production

Add these to your GitHub repository secrets:

- `EXPO_TOKEN` - Get from expo.dev
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anon key
- `OPENAI_API_KEY` - Your OpenAI API key
- `ANTHROPIC_API_KEY` - Your Anthropic API key
- `GOOGLE_AI_API_KEY` - Your Google AI API key

## 🎯 Development Timeline

**Day 1:** Setup and basic testing (1 hour)  
**Day 2-3:** Customize UI and connect your API (4 hours)  
**Day 4-5:** Test and polish (3 hours)  
**Day 6:** Submit to App Store (1 hour)  

## 💡 Key Features Ready

- **Native iOS Authentication** with Face ID/Touch ID
- **Chat Interface** with message bubbles and animations
- **AI Model Selection** - Automatic routing to best model
- **Offline Support** - Works without internet
- **Push Notifications** - Real-time AI responses
- **Share Extension** - Process text from other apps

## 🚀 Next Steps

1. **Run the setup script** - Everything is automated
2. **Test on your iPhone** - Use Expo Go app
3. **Customize the UI** - Match your brand
4. **Add your API keys** - Connect to your services
5. **Submit to App Store** - 1-week review process

Your Luminadoc iOS app will be ready in less than a week!