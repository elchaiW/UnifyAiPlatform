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

## Recent Changes: Latest modifications with dates

### Delete Functionality Added (January 21, 2025)
- **Individual Message Deletion**: Users can delete specific chat messages
- **Clear All History**: Button to delete entire chat history with confirmation
- **API Endpoints**: Added DELETE routes for single requests and bulk deletion
- **UI Integration**: Red delete buttons with confirmation dialogs
- **Analytics Cleanup**: Automatic deletion of related analytics when requests are deleted

### AWS Deployment Ready (January 21, 2025)
- **Cloud-Ready Architecture**: Application structured for AWS deployment
- **Multiple Deployment Options**: App Runner, EC2, Elastic Beanstalk support
- **Environment Variable Configuration**: All secrets properly externalized
- **Production Build Process**: Optimized build pipeline for cloud deployment
- **Cost-Effective Options**: $32-45/month estimated AWS hosting costs

### Enhanced Claude-Powered Document Analysis (January 21, 2025)
- **Claude Deep Analysis**: Primary classifier now uses Claude-sonnet-4-20250514 for complete document understanding
- **Comprehensive Document Understanding**: Reads entire documents instead of keyword matching
- **Rich Classification Data**: Extracts document type, key topics, complexity level, and detailed reasoning
- **3-Tier Classification System**: Claude → GPT-4o → Gemini → Keyword fallback for maximum reliability
- **Enhanced UI Display**: Shows document type badges, key topics as tags, and detailed analysis reasoning
- **Higher Accuracy**: 90-98% confidence with sophisticated content analysis and intent understanding

### AWS Deployment Complete Setup (January 21, 2025)
- **Production-Ready Build**: Dockerfile, health endpoints, and deployment configs created
- **AWS App Runner Support**: Ready for immediate deployment with automatic scaling
- **Multiple AWS Options**: App Runner, Elastic Beanstalk, and EC2 deployment guides
- **Health Monitoring**: Added `/health` endpoint for AWS load balancer checks
- **Cost-Effective Hosting**: Estimated $30-45/month for full AWS deployment
- **Zero-Downtime Deployment**: Modern containerized architecture for seamless updates

### Mobile Responsiveness Enhancement (January 22, 2025)
- **Mobile-First Design**: Hidden sidebar on mobile with top navigation bar
- **Responsive Layout**: Optimized spacing and touch targets for mobile devices
- **Improved Input Area**: Mobile-friendly message input with proper sizing
- **Touch-Optimized**: 44px minimum touch targets for better accessibility
- **Safe Area Support**: Proper handling of mobile device notches and safe areas
- **iOS Input Fix**: 16px font size to prevent unwanted zoom on text inputs

### ChatGPT-Style Mobile UI & API Fix (January 22, 2025)
- **ChatGPT-Style Navigation**: Hamburger menu with centered app name for mobile
- **Slide-Out Sidebar**: Smooth mobile navigation with overlay and transitions
- **Fixed Message Processing**: Resolved API routing mismatch between frontend and backend
- **Unified API Endpoints**: Combined `/api/requests/prompt` and `/api/requests` for consistency
- **Enhanced Input Area**: Fixed placeholder text cutoff with proper 48px height
- **Desktop Spacing Fix**: Consistent header spacing across all tabs and components

### Interactive UX Enhancements (January 22, 2025)
- **Instant Message Clearing**: Message input now clears immediately upon send for better responsiveness
- **ChatGPT-Style Typing Animation**: Added realistic typing animation with blinking cursor during processing
- **Improved Mobile Spacing**: Fixed top message spacing with proper safe area handling
- **Enhanced Loading States**: Replaced static loading with interactive typing animation
- **Better Visual Feedback**: Immediate UI feedback for all user interactions

### Perplexity-Style UI Redesign (January 22, 2025)
- **Modern Color Palette**: Updated to clean blue/gray scheme matching Perplexity's aesthetic
- **Satoshi Font Integration**: Added premium Satoshi font via Fontshare CDN with optimized letter spacing
- **Refined Typography**: Medium font weights, improved spacing, and better text hierarchy
- **Clean Input Design**: Perplexity-style rounded input with inline action buttons
- **Minimalist Cards**: Updated suggestion cards with centered icons and subtle hover effects
- **Professional Layout**: Increased padding, improved spacing, and cleaner visual hierarchy

### Custom AI Model Icons Integration (January 22, 2025)
- **Custom Model Images**: Replaced colored letter icons with authentic AI model images
- **Professional Branding**: Updated Claude, ChatGPT, Gemini, and Grok with official brand assets
- **Consistent Styling**: Applied proper image sizing and hover effects across all model cards
- **Enhanced Visual Identity**: Improved brand recognition with authentic model representations
- **Better User Experience**: Clear visual identification of AI models in both suggestions and responses

### Replit-Style Typography Implementation (January 23, 2025)
- **Inter Font Integration**: Implemented Inter font throughout entire interface matching Replit's design system
- **JetBrains Mono Addition**: Added JetBrains Mono for code and monospace elements
- **Replit UI Consistency**: Aligned typography with official Replit platform design language
- **Enhanced Readability**: Optimized letter spacing, line height, and font features for better text rendering
- **Professional Branding**: Applied Replit's trusted typography standards across all components

### Clean Text Formatting Implementation (January 23, 2025)
- **Markdown Cleanup**: Created text formatter utility to remove unwanted markdown symbols (###, **, *)
- **Plain Text Responses**: Updated all AI services to provide clean, readable responses without formatting symbols
- **Enhanced User Experience**: Eliminated distracting markdown formatting from AI model responses
- **Consistent Output**: Applied text cleaning across Claude, ChatGPT, Gemini, and Grok services
- **Professional Presentation**: Responses now display as clean, properly formatted plain text

### Dark/Light Mode Theme System (January 23, 2025)
- **Custom Color Scheme**: Implemented user-specified colors (#1E1E1E for dark mode, #E4E5E2 for light mode)
- **Dark Mode Default**: Set dark mode as the default theme with automatic initialization
- **Compact Mobile Toggle**: Created responsive theme toggle (5x9px) that fits perfectly in mobile navigation
- **Desktop Integration**: Added theme toggle to bottom of desktop sidebar with proper labeling
- **Mobile Optimization**: Fixed mobile header layout with centered title and properly positioned toggle
- **Complete Theme Support**: All components now properly support both dark and light mode variants
- **Smooth Transitions**: Added smooth animations and visual feedback for theme switching