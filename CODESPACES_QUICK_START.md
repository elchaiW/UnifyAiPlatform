# 🚀 Quick Start: Luminadoc in GitHub Codespaces

## 1-Minute Setup

### Push to GitHub
```bash
git add .
git commit -m "Luminadoc project setup"
git push origin main
```

### Launch Codespace
1. GitHub repo → **Code** button → **Codespaces** → **Create codespace**
2. Wait 2-3 minutes for automatic setup
3. Your app will start automatically on port 5000

### Add Your API Keys
```bash
# Edit environment file
code .env

# Add your keys:
NEXT_PUBLIC_SUPABASE_URL=https://koxnemiudjbditxuojxw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
GOOGLE_API_KEY=your_key_here
```

### Start Coding! 
```bash
npm run dev    # Development server
npm run build  # Production build
npm run lint   # Check code quality
```

## What's Pre-configured

✅ **Development Environment**
- Node.js 20
- TypeScript & React support
- Tailwind CSS IntelliSense
- Auto-formatting with Prettier
- ESLint for code quality

✅ **VS Code Extensions**
- GitHub Copilot (AI assistance)
- TypeScript enhanced support
- Auto tag renaming
- Path auto-completion

✅ **Port Forwarding**
- Port 5000: Development server
- Port 3000: Production server
- Automatic HTTPS forwarding

✅ **Database Integration**
- Supabase (pre-configured)
- PostgreSQL (optional local setup)
- Database push/pull commands

## Development Workflow

### Daily Development
```bash
# Start your day
git pull origin main
npm run dev

# Make changes
# VS Code will auto-format and lint

# Commit changes
git add .
git commit -m "Feature: description"
git push origin main
```

### Database Changes
```bash
# Update schema in shared/schema.ts
# Push changes to database
npm run db:push

# View database
npm run db:studio
```

### Build & Deploy
```bash
# Test production build
npm run build
npm start

# Deploy to Vercel
vercel --prod

# Or deploy to Replit
git push origin main
# Then import from GitHub in Replit
```

## iOS Development in Codespaces

### React Native Setup
```bash
# Copy iOS components to new React Native project
cp -r ios-components/ ../LuminadocApp/src/

# Follow iOS_DEPLOYMENT_STEPS.md for full conversion
```

### Web to iOS Testing
- Test responsive design with browser dev tools
- Use iOS simulator (if available)
- Deploy to TestFlight for real device testing

## Collaboration

### Team Development
- Share Codespace link with team members
- Real-time collaborative editing
- Shared terminal sessions
- Live port forwarding for demos

### Code Reviews
- Create pull requests directly from Codespace
- Review changes in GitHub
- Merge and auto-deploy

## Performance Tips

### Fast Development
```bash
# Use aliases (pre-configured)
dev      # npm run dev
build    # npm run build
lint     # npm run lint
```

### Resource Management
- Codespace auto-sleeps after 30 minutes of inactivity
- Restart with one click from GitHub
- Rebuild if needed (rare)

## Troubleshooting

### Common Issues
```bash
# Port already in use
kill -9 $(lsof -t -i:5000)
npm run dev

# Dependencies issues
rm -rf node_modules package-lock.json
npm install

# Environment variables not loading
source .env
printenv | grep SUPABASE
```

### Getting Help
- GitHub Copilot Chat in VS Code
- Terminal: `npm run help`
- Documentation: Check all `.md` files in project

## Ready to Code!

Your Luminadoc development environment is now running in the cloud with:
- ⚡ Fast cloud computing
- 🔧 All tools pre-configured  
- 🤝 Team collaboration ready
- 📱 iOS conversion prepared
- 🚀 One-click deployment

Happy coding! 🎉