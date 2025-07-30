# GitHub Codespaces Setup for Luminadoc

## Quick Start with GitHub Codespaces

### 1. Create Repository on GitHub
```bash
# Push your current code to GitHub
git init
git add .
git commit -m "Initial Luminadoc commit"
git branch -M main
git remote add origin https://github.com/yourusername/luminadoc.git
git push -u origin main
```

### 2. Launch Codespace
1. Go to your GitHub repository
2. Click the green "Code" button
3. Select "Codespaces" tab
4. Click "Create codespace on main"

### 3. Automatic Setup
The Codespace will automatically:
- Install Node.js 20
- Run `npm install` to install all dependencies
- Start the development server on port 5000
- Configure VS Code with helpful extensions

### 4. Configure Environment Variables
In the Codespace terminal, set up your environment:

```bash
# Copy environment template
cp .env.example .env

# Edit with your actual values
code .env
```

Add your API keys:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://koxnemiudjbditxuojxw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=your_database_url

# AI API Keys
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_API_KEY=your_google_key
XAI_API_KEY=your_xai_key

# AssemblyAI for voice features
ASSEMBLYAI_API_KEY=your_assemblyai_key
```

### 5. Available Ports
- **Port 5000**: Development server (auto-forwarded)
- **Port 3000**: Production build server

### 6. Development Commands
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database operations
npm run db:push    # Push schema changes
npm run db:studio  # Open database studio

# Linting and formatting
npm run lint       # ESLint
npm run lint:fix   # Fix ESLint issues
```

## Pre-configured VS Code Extensions

The Codespace includes these helpful extensions:
- **TypeScript**: Enhanced TypeScript support
- **Tailwind CSS**: IntelliSense for Tailwind classes
- **Prettier**: Code formatting
- **ESLint**: Code linting
- **Auto Rename Tag**: Automatically rename paired HTML/JSX tags
- **Path Intellisense**: Autocomplete filenames
- **GitHub Copilot**: AI-powered code completion

## Database Setup in Codespaces

### Option 1: Continue with Supabase (Recommended)
Your existing Supabase configuration will work seamlessly in Codespaces.

### Option 2: Local PostgreSQL for Development
```bash
# Install PostgreSQL in Codespace
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo service postgresql start

# Create database user
sudo -u postgres createuser --interactive

# Create database
sudo -u postgres createdb luminadoc

# Update DATABASE_URL in .env
DATABASE_URL="postgresql://username:password@localhost:5432/luminadoc"
```

## Collaboration Features

### Live Share
- Multiple developers can work on the same codebase simultaneously
- Real-time editing and debugging
- Shared terminal access

### Port Forwarding
- Automatically forwards development server ports
- Share running application with team members
- Private or public port access

## Performance Optimization

### Codespace Configuration
```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "files.watcherExclude": {
    "**/.git/objects/**": true,
    "**/.git/subtree-cache/**": true,
    "**/node_modules/**": true,
    "**/.next/**": true
  }
}
```

### Git Configuration
```bash
# Configure git for better performance
git config --global core.preloadindex true
git config --global core.fscache true
git config --global gc.auto 256
```

## Deployment from Codespaces

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Login and deploy
vercel login
vercel --prod
```

### Deploy to Replit
```bash
# Push changes to GitHub
git add .
git commit -m "Update from Codespaces"
git push

# Import to Replit from GitHub repository
```

### Deploy to Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login and deploy
netlify login
netlify deploy --prod
```

## Troubleshooting

### Port Issues
If the development server doesn't start:
```bash
# Check if port is in use
lsof -i :5000

# Kill process if needed
kill -9 $(lsof -t -i:5000)

# Restart development server
npm run dev
```

### Node Modules Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Environment Variables
```bash
# Check if environment variables are loaded
printenv | grep SUPABASE
printenv | grep OPENAI
```

## Benefits of Codespaces Development

### Instant Setup
- No local environment configuration needed
- Consistent development environment for all team members
- Pre-configured with all necessary tools and extensions

### Cloud Resources
- Powerful cloud-based computing
- No impact on local machine performance
- Access from any device with a web browser

### Integrated Workflow
- Direct GitHub integration
- Built-in terminal and VS Code
- Seamless commit and push workflow

### Team Collaboration
- Share Codespace with team members
- Real-time collaborative editing
- Consistent environment across team

## Next Steps

1. **Push code to GitHub** and create a Codespace
2. **Configure environment variables** with your API keys
3. **Start development** with `npm run dev`
4. **Begin iOS conversion** using the React Native components in `ios-components/`

The Codespace environment is perfect for both web development and preparing the iOS app conversion!