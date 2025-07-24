# Quick Vercel Deployment (5 Minutes)

## Prerequisites
- Vercel account (free)
- Database provider (Neon recommended - free tier)
- AI API keys (you already have these)

## Step 1: Database Setup (2 minutes)

### Option A: Neon (Recommended - Free)
1. Go to https://neon.tech
2. Click "Sign up" → "Continue with GitHub"
3. Create new project → Copy the DATABASE_URL

### Option B: Supabase (Free alternative)
1. Go to https://supabase.com
2. New project → Copy DATABASE_URL from Settings → Database

## Step 2: Deploy to Vercel (2 minutes)

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Deploy (run from your project root)
vercel

# Follow prompts:
# - Link to existing project? N
# - Project name: multi-ai-platform (or your choice)
# - Directory: ./
# - Framework: Other
```

## Step 3: Add Environment Variables (1 minute)

In Vercel Dashboard or CLI:

```bash
# Add your API keys
vercel env add ANTHROPIC_API_KEY
vercel env add OPENAI_API_KEY
vercel env add GEMINI_API_KEY  
vercel env add XAI_API_KEY
vercel env add DATABASE_URL

# Then redeploy
vercel --prod
```

## Step 4: Initialize Database

```bash
# Run this once to create tables
npm run db:push
```

## That's it! 🎉

Your multi-AI platform is now live at `https://your-project.vercel.app`

## Alternative: One-Click Railway Deploy

Even simpler option:

```bash
npx @railway/cli deploy
```

Railway includes database automatically ($5/month total).

## Cost Comparison

- **Vercel + Neon**: $0/month (free tiers)
- **Railway**: $5/month (all included)
- **Current AWS setup**: $30-45/month

Both options are significantly cheaper than AWS and require zero server management!