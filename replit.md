# LoveCoach AI - Dating Conversation Assistant

## Overview

LoveCoach AI is a comprehensive dating conversation assistant that helps users improve their dating app interactions through AI-powered coaching, conversation analysis, and automated SMS workflows. The application provides real-time conversation insights, coaching tips, and automated follow-up suggestions to enhance dating success rates.

## System Architecture

The application follows a full-stack TypeScript architecture with clear separation between client and server layers:

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development/building
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and responsive design
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Management**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Session Management**: Express sessions with PostgreSQL store
- **API Design**: RESTful endpoints with typed request/response interfaces

## Key Components

### Database Schema
The application uses a PostgreSQL database with the following core entities:
- **Users**: User profiles with authentication and SMS preferences
- **Conversations**: Dating app conversation tracking with engagement metrics
- **Messages**: Individual messages within conversations with AI suggestion flags
- **Coaching Tips**: Personalized coaching insights and recommendations
- **SMS Logs**: Automated SMS workflow tracking and delivery status
- **Workflows**: Automated coaching and reminder workflows
- **Stats**: User performance metrics and success tracking

### AI Integration Layer
- **Langflow Integration**: External AI workflow service for conversation analysis and coaching
- **Services**: Conversation analysis, profile optimization, and response suggestions
- **Fallback Strategy**: Mock responses when AI services are unavailable

### SMS Automation
- **Twilio Integration**: SMS delivery for coaching tips and reminders
- **Workflow Engine**: Automated daily tips, response reminders, and emergency help
- **Fallback Strategy**: Graceful degradation when SMS services are unavailable

### UI Components
- **Dashboard**: Comprehensive overview with stats, recent conversations, and quick actions
- **Love CRM**: Advanced conversation pipeline management with engagement tracking
- **Coaching Insights**: AI-powered tips and workflow management
- **Conversation Modal**: Detailed conversation view with AI response suggestions

## Data Flow

1. **User Interaction**: Users interact with the React frontend through shadcn/ui components
2. **API Communication**: Frontend communicates with Express backend via RESTful APIs
3. **Database Operations**: Drizzle ORM handles all database interactions with PostgreSQL
4. **AI Processing**: Langflow workflows provide conversation analysis and coaching insights
5. **SMS Delivery**: Twilio handles automated SMS notifications and reminders
6. **Real-time Updates**: TanStack Query manages cache invalidation and real-time data updates

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives
- **tailwindcss**: Utility-first CSS framework

### Third-party Integrations
- **Langflow**: AI workflow engine for conversation analysis (optional)
- **Twilio**: SMS delivery service (optional)
- **Neon Database**: PostgreSQL hosting (configurable)

### Development Tools
- **Vite**: Frontend build tool and development server
- **ESBuild**: Backend bundling for production
- **TypeScript**: Type safety across the entire stack

## Deployment Strategy

### Development Environment
- **Replit Integration**: Configured for Replit development environment
- **Hot Module Replacement**: Vite HMR for rapid frontend development
- **File Watching**: tsx for backend development with auto-restart

### Production Build
- **Frontend**: Vite builds optimized React bundle to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Static Assets**: Express serves frontend assets in production mode

### Environment Configuration
- **Database**: `DATABASE_URL` for PostgreSQL connection
- **AI Services**: `LANGFLOW_API_URL` and `LANGFLOW_API_KEY` for AI integration
- **SMS Services**: Twilio credentials for SMS functionality
- **Development**: Auto-detection of Replit environment for development features

### Scaling Considerations
- **Autoscale Deployment**: Configured for Replit's autoscale deployment target
- **Session Storage**: PostgreSQL-backed sessions for horizontal scaling
- **Stateless Design**: Server designed to be stateless for easy scaling

## Changelog

```
Changelog:
- June 20, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```