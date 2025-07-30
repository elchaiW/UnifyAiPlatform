# GitHub Codespaces Deployment Guide

## Quick Setup

1. **Clone your repository to GitHub Codespaces**
2. **Create environment file**:
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env` file with your API keys**:
   ```bash
   nano .env
   ```
   Add your actual API keys:
   ```
   OPENAI_API_KEY=sk-your-actual-openai-key
   ANTHROPIC_API_KEY=sk-ant-your-actual-anthropic-key
   GEMINI_API_KEY=your-actual-gemini-key
   XAI_API_KEY=xai-your-actual-xai-key
   DATABASE_URL=your-database-url
   ```

4. **Install dependencies**:
   ```bash
   npm install
   ```

5. **Check environment setup**:
   ```bash
   node check-env.js
   ```

6. **Build and run**:
   ```bash
   npm run build
   npm start
   ```

## API Key Sources

- **OpenAI**: https://platform.openai.com/api-keys
- **Anthropic**: https://console.anthropic.com/
- **Google Gemini**: https://aistudio.google.com/app/apikey  
- **xAI (Grok)**: https://console.x.ai/ (optional)

## Database Setup

For **Supabase** (recommended):
1. Create project at https://supabase.com/dashboard
2. Go to Settings → Database
3. Copy "Connection string" under "Transaction pooler"
4. Replace `[YOUR-PASSWORD]` with your database password

## Troubleshooting

### Missing Environment Variables
If you see: `The OPENAI_API_KEY environment variable is missing`

1. Run environment checker:
   ```bash
   node check-env.js
   ```

2. Verify your `.env` file exists and has correct values
3. Restart the application: `npm start`

### Port Issues
GitHub Codespaces should automatically expose port 5000. If not accessible:
1. Go to "Ports" tab in VS Code
2. Add port 5000 as public
3. Access via the provided URL

## Production Mode

The application runs in production mode on Codespaces:
- Environment variables loaded from `.env`
- Optimized build for performance
- Health check endpoint at `/health`

## Success Indicators

✅ All API keys loaded correctly  
✅ Database connection established  
✅ Server running on port 5000  
✅ Health check returns `{"status":"healthy"}`  

## Need Help?

1. Check environment with: `node check-env.js`
2. View server logs for detailed error messages
3. Ensure all API keys are valid and have sufficient credits