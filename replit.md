# replit.md

## Overview

This is a multi-AI integrated platform inspired by UnifyGTM's modern design aesthetic. The application allows users to submit prompts or upload documents and automatically routes requests to the most appropriate AI model (Claude, ChatGPT, Gemini, or Grok) based on intelligent classification. The system features a sophisticated routing algorithm, real-time analytics, and a beautiful gradient-based UI that provides seamless multi-AI processing capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## Design & UI Updates

### UnifyGTM-Inspired Design Elements
- **Modern Navigation**: Glass-morphism navigation with gradient logo and smooth hover transitions
- **Hero Section**: Bold gradient background (purple to blue) with floating elements and statistics cards
- **Color Scheme**: Updated to use purple/blue gradient palette matching UnifyGTM aesthetic
- **Typography**: Large, bold headlines with gradient text effects
- **Interactive Elements**: Hover animations, backdrop blur effects, and modern rounded corners
- **Responsive Design**: Mobile-first approach with sophisticated spacing and layout

### Key Visual Improvements (January 21, 2025)
- Replaced basic hero section with dynamic gradient background
- Enhanced navigation with backdrop blur and modern button styling
- Updated color variables to match UnifyGTM's purple/blue theme
- Added floating decorative elements and animated pulse indicators
- Improved card designs with subtle shadows and hover effects

### AI Classification System Enhancement (January 21, 2025)
- **Upgraded from keyword detection to AI-powered content understanding**
- **GPT-4o Integration**: Primary classifier reads and understands document context and intent
- **3-Tier Fallback System**: GPT-4o → Gemini AI → Keyword detection
- **High Accuracy**: 90-98% confidence scores with detailed reasoning
- **Download & View Features**: Added response viewing and download functionality
- **Successful Testing**: Verified with legal (Claude), marketing (Gemini), and general (ChatGPT) content

### Complete Interface Redesign (January 21, 2025)
- **ChatGPT/Perplexity-Style Interface**: Converted to modern conversational UI with message bubbles
- **Comprehensive Dashboard**: Added sidebar navigation with Chat, Analytics, and History views
- **Responsive Design**: Fixed layout issues and optimized for all screen sizes
- **Analytics Dashboard**: Real-time performance metrics, model usage stats, and success tracking
- **History Management**: Advanced search, filtering, and bulk export functionality
- **File Upload Fix**: Resolved document upload issues with proper field naming
- **Mobile Optimization**: Improved responsive breakpoints and touch-friendly interactions

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **Build Tool**: Vite for development and building

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **API Design**: RESTful API with JSON responses
- **File Processing**: Multer for handling file uploads
- **Error Handling**: Centralized error middleware

### Database Architecture
- **ORM**: Drizzle ORM with PostgreSQL
- **Database**: Supabase PostgreSQL (instead of AWS/Neon)
- **Migrations**: Drizzle Kit for schema management
- **Storage Implementation**: In-memory storage for development with interface for production database migration
- **Real-time Features**: Supabase real-time subscriptions for live analytics updates

## Key Components

### AI Model Integration
- **Claude**: Legal documents, compliance, regulatory analysis (using claude-sonnet-4-20250514)
- **ChatGPT**: General knowledge, content creation, summaries (using gpt-4o)
- **Gemini**: Marketing strategies, social media, business development (using gemini-2.5-pro)
- **Grok**: Coding, debugging, technical analysis (using grok-2-1212)

### Classification System
- Intelligent request routing using OpenAI's classification
- Categorizes requests into: legal, marketing, coding, general
- Automatically selects optimal AI model based on content analysis

### Document Processing
- File upload support with 10MB limit
- Text extraction from TXT files (PDF/DOCX extraction placeholders included)
- File validation and metadata collection

### Analytics Engine
- Request tracking and performance metrics
- Model usage statistics and success rates
- Processing time analysis
- User-specific analytics dashboard

## Data Flow

1. **Input Processing**: User submits prompt or uploads document
2. **Classification**: AI classifier analyzes content and selects optimal model
3. **Request Creation**: System creates request record with metadata
4. **AI Processing**: Content is sent to selected AI model for processing
5. **Response Handling**: AI response is processed and stored
6. **Analytics Recording**: Performance metrics are recorded
7. **Result Delivery**: Structured response is returned to user

## External Dependencies

### AI Services
- **Anthropic API**: Claude model integration
- **OpenAI API**: GPT-4o model and classification service
- **Google Gemini API**: Gemini model integration
- **xAI API**: Grok model integration

### Database & Infrastructure
- **Supabase**: PostgreSQL hosting with real-time capabilities
- **Environment Variables**: API keys and database URL configuration
- **Authentication**: Ready for Supabase Auth integration
- **File Storage**: Extensible for Supabase Storage integration

### Development Tools
- **Replit Integration**: Development environment support
- **Vite Plugins**: Runtime error overlay and cartographer for Replit

## Deployment Strategy

### Development
- Local development with Vite dev server
- Hot module replacement for React components
- In-memory storage for rapid development
- Environment-specific configurations

### Production Build
- Vite build for optimized frontend bundle
- esbuild for server-side bundling
- Static file serving from Express
- Database migration with Drizzle

### Environment Configuration
- API keys managed through environment variables
- Database URL configuration for production
- Conditional development vs production behaviors

### File Structure
- `client/`: Frontend React application
- `server/`: Backend Express API
- `shared/`: Shared TypeScript schemas and types
- `migrations/`: Database migration files
- Configuration files in root directory

The application implements a clean separation between frontend and backend, with shared TypeScript interfaces ensuring type safety across the full stack. The intelligent routing system provides users with optimal AI model selection while maintaining detailed analytics for performance optimization.