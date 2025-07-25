# Next.js Deployment Configuration

This is a **Next.js 15 application** with App Router architecture.

## Application Type
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Build System**: Next.js built-in bundler
- **API**: Next.js API Routes (not Express)

## Build Commands
```bash
# Development
npx next dev

# Production Build
npx next build

# Production Start
npx next start
```

## Deployment Structure
```
app/                 # Next.js App Router pages
├── page.tsx        # Home page
├── dashboard/      # Dashboard pages
└── globals.css     # Global styles

api/                # Next.js API Routes
├── requests/       # Request handling APIs
├── analytics/      # Analytics APIs
└── transcribe.ts   # Voice transcription API

components/         # React components
lib/               # Utility libraries
public/            # Static assets
```

## Environment Variables Required
- `OPENAI_API_KEY` - OpenAI API access
- `CLAUDE_API_KEY` - Anthropic Claude API access  
- `GEMINI_API_KEY` - Google Gemini API access
- `GROK_API_KEY` - xAI Grok API access
- `DATABASE_URL` - PostgreSQL database connection

## Deployment Platforms
- ✅ Replit Deployments (configured)
- ✅ Vercel (Next.js native)
- ✅ Docker (Dockerfile included)
- ✅ AWS/Google Cloud/Azure (any Node.js platform)

## Port Configuration
- Development: Port 3000 (Next.js default) or 5000 (current Replit config)
- Production: Uses Next.js automatic port detection

This is NOT an Express application - it's a modern Next.js application with built-in API routes.