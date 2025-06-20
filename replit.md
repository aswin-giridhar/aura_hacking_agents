# LoveCoach AI Dating Assistant

## Overview

LoveCoach AI is a full-stack dating assistant application that helps users improve their dating conversations through AI-powered coaching, conversation analysis, and personalized tips. The application provides real-time feedback on dating conversations, suggests responses, and offers actionable insights to help users build better connections.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom design tokens
- **Build Tool**: Vite with custom configuration for development and production

### Backend Architecture
- **Runtime**: Node.js 20 with Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based (infrastructure in place)
- **API Design**: RESTful API with structured error handling
- **Development**: Hot reload with Vite middleware integration

### Database Schema
The application uses PostgreSQL with the following core entities:
- **Users**: Basic user information and SMS preferences
- **Conversations**: Dating conversations with engagement tracking
- **Messages**: Individual messages within conversations
- **Coaching Tips**: AI-generated coaching advice
- **SMS Logs**: SMS communication tracking
- **Workflows**: Automated coaching workflows
- **Stats**: User performance metrics

## Key Components

### Dashboard System
- **Stats Overview**: Real-time metrics display (active conversations, response rates, coaching tips, success scores)
- **Recent Conversations**: List view with engagement levels and quick actions
- **Coaching Insights**: AI-generated tips categorized by type (conversation starters, response patterns, date suggestions)
- **Quick Actions**: One-click access to common features (new chat, analyze conversations, plan dates, emergency help)

### Conversation Management
- **Conversation Modal**: Full conversation view with message history
- **AI Response Suggestions**: Context-aware response recommendations
- **Engagement Tracking**: Automatic conversation health monitoring
- **Message Threading**: Chronological message display with sender identification

### AI Integration Layer
- **Langflow Integration**: External AI workflow engine for conversation analysis and coaching
- **Response Generation**: Context-aware AI response suggestions
- **Profile Analysis**: AI-powered dating profile feedback
- **Conversation Analysis**: Engagement level assessment and topic extraction

### SMS Integration
- **Twilio Integration**: SMS sending capabilities for coaching tips and reminders
- **SMS Logging**: Complete SMS interaction tracking
- **Preference Management**: User-controlled SMS notification settings

## Data Flow

1. **User Interaction**: User views dashboard with real-time stats and conversations
2. **Conversation Selection**: User clicks on conversation to view details in modal
3. **AI Analysis**: System analyzes conversation context and generates suggestions
4. **Response Generation**: AI provides contextual response recommendations
5. **Coaching Tips**: System generates and displays personalized coaching advice
6. **SMS Notifications**: Optional SMS delivery of coaching tips and reminders
7. **Analytics Update**: User actions update engagement metrics and success scores

## External Dependencies

### AI Services
- **Langflow**: AI workflow engine for conversation analysis and coaching
- **Custom AI Endpoints**: Response suggestion and profile analysis services

### Communication Services
- **Twilio**: SMS messaging platform for coaching tips and notifications
- **Neon Database**: PostgreSQL hosting service

### Development Tools
- **Replit**: Development environment with integrated PostgreSQL
- **Drizzle Kit**: Database schema management and migrations
- **ESBuild**: Production build optimization

## Deployment Strategy

### Development Environment
- **Platform**: Replit with integrated PostgreSQL and Node.js
- **Hot Reload**: Vite development server with Express middleware
- **Database**: Local PostgreSQL instance with Drizzle migrations
- **Port Configuration**: Frontend (5000) with automatic port forwarding

### Production Build
- **Frontend**: Vite build to `dist/public` directory
- **Backend**: ESBuild bundle to `dist/index.js`
- **Static Assets**: Served by Express in production mode
- **Database**: Production PostgreSQL with environment-based configuration

### Environment Configuration
- **Database**: `DATABASE_URL` for PostgreSQL connection
- **AI Services**: `LANGFLOW_API_URL` and `LANGFLOW_API_KEY` for AI integration
- **SMS**: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_PHONE_NUMBER` for messaging
- **Development**: Automatic fallback to mock services when external APIs unavailable

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- June 20, 2025. Initial setup