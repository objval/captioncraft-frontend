# CaptionCraft Technical Breakdown

## Project Overview

CaptionCraft (branded as "Kalil") is a professional AI-powered video transcription and caption burning platform. The application enables content creators, educators, and businesses to automatically generate accurate transcriptions for their videos and burn captions directly into the video files.

## Core Features

### 1. Video Processing Pipeline
- **Upload**: Users upload videos which are stored in Cloudinary
- **Transcription**: AI-powered transcription service generates accurate transcripts with timestamps
- **Editing**: Interactive editor for refining transcripts with real-time preview
- **Caption Burning**: Final video generation with customizable caption styles burned into the video

### 2. Credit-Based System
- Users purchase credits in packs (various sizes available)
- Each video processing operation consumes credits
- New users receive 50 welcome credits upon registration
- Credit transactions are fully audited

### 3. Payment Integration
- **Hypay Payment Gateway**: Israeli payment processor supporting NIS transactions
- **Idempotency Protection**: Prevents duplicate payments and ensures transaction reliability
- **Automatic Invoice Generation**: EzCount integration for Israeli tax compliance
- **Test Mode Support**: Sandbox environment for development and testing

## Technology Stack

### Frontend
- **Framework**: Next.js 15.2.4 (App Router)
- **UI Library**: React 19 with TypeScript
- **Styling**: Tailwind CSS with custom animations and gradients
- **Component Library**: Radix UI primitives with shadcn/ui components
- **State Management**: React Context (AuthProvider)
- **Real-time Updates**: Supabase subscriptions for video status updates

### Backend & Database
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with custom profile extensions
- **Storage**: Cloudinary for video storage and processing
- **API**: Next.js API routes with server actions
- **Security**: Row Level Security (RLS) policies on all user data

### Key Libraries
- **Form Handling**: react-hook-form with zod validation
- **Date Handling**: date-fns
- **Notifications**: react-hot-toast and sonner
- **Charts**: recharts for analytics
- **File Upload**: react-dropzone

## Database Schema

### Core Tables

#### 1. **profiles**
- Extends Supabase auth.users with billing information
- Stores user credits, contact details, and billing address
- RLS enabled for user privacy

#### 2. **videos**
- Tracks video processing lifecycle
- States: uploading → processing → ready → burning_in → complete/failed
- Stores Cloudinary IDs, thumbnails, and caption styles
- Links to transcripts table

#### 3. **transcripts**
- Stores original AI-generated transcripts
- Supports edited versions for user modifications
- JSONB format for flexible transcript data structure

#### 4. **credit_packs**
- Defines available credit packages
- Configurable pricing in NIS
- Active/inactive status for pack management

#### 5. **payments**
- Transaction records with Hypay integration
- Tracks payment status, URLs, and provider responses
- Includes idempotency key for duplicate prevention

#### 6. **credit_transactions**
- Audit trail for all credit movements
- Tracks balance changes with reasons
- Links to payment records when applicable

#### 7. **invoices**
- Invoice generation tracking
- Stores invoice numbers and URLs
- Links to payment records

#### 8. **idempotency_keys**
- Prevents duplicate API calls and payments
- Stores request hashes and response data
- Automatic cleanup after expiration

## Security Features

### Authentication & Authorization
- Supabase Auth with email/password
- RLS policies enforce data isolation
- Service role client for admin operations

### Payment Security
- Idempotency keys prevent duplicate charges
- Transaction validation with Hypay signatures
- Test mode isolation for development
- IP whitelisting ready for callbacks

### Data Protection
- All user data protected by RLS
- Secure file uploads through Cloudinary
- No credit card data stored locally
- Encrypted communication with payment providers

## Key User Flows

### 1. Registration Flow
1. User signs up with email/password
2. Profile created with billing information
3. 50 welcome credits automatically assigned
4. Credit transaction logged for audit

### 2. Video Processing Flow
1. User uploads video file
2. Video sent to Cloudinary
3. AI transcription service processes video
4. User can edit transcript in real-time editor
5. Caption burning job initiated
6. Final video with captions delivered

### 3. Payment Flow
1. User selects credit pack
2. Secure payment URL generated with Hypay
3. User redirected to Hypay payment page
4. Success/failure callback processed
5. Credits added on successful payment
6. Invoice automatically generated

## Development Features

### Environment Configuration
- Automatic test/production mode switching
- Environment-specific API endpoints
- Debug endpoints for testing (/api/debug/*)

### Monitoring & Logging
- Comprehensive payment logging system
- Video processing status tracking
- Error handling with user-friendly messages
- Admin dashboard for system monitoring

### Developer Tools
- TypeScript for type safety
- ESLint and build error bypassing for rapid development
- Hot reload with Next.js dev server
- Supabase local development support

## API Structure

### Server Actions
- `/app/actions/payments.ts`: Payment processing
- `/app/auth/actions.ts`: Authentication flows

### API Routes
- `/api/payments/hypay/*`: Payment callbacks
- `/api/admin/*`: Administrative functions
- `/api/debug/*`: Development testing endpoints

### Real-time Subscriptions
- Video status updates
- Credit balance changes
- Payment notifications

## Performance Optimizations

### Frontend
- Image optimization disabled for video thumbnails
- Lazy loading for video gallery
- Skeleton loaders for better UX
- Optimistic UI updates

### Backend
- Database indexes on frequently queried fields
- Efficient RLS policies
- Connection pooling through Supabase
- Caching strategies for static data

## Deployment Considerations

### Production Requirements
- SSL certificate for secure communications
- Hypay production credentials
- Cloudinary production account
- Database backups configured

### Scaling Considerations
- Video processing queue management
- Credit pack caching
- Payment webhook reliability
- Database connection limits

## Future Enhancements (from CLAUDE.md)

### Pending Security Features
- CVV parameter support (no storage)
- Signature verification middleware
- Rate limiting on payment endpoints
- IP whitelist validation
- Monitoring/alerting system

### Planned Features
- Multiple language support
- Batch video processing
- Advanced caption styling options
- API for third-party integrations
- Mobile application

## Maintenance Notes

### Regular Tasks
- Idempotency key cleanup (hourly cron)
- Failed payment reconciliation
- Credit balance audits
- Video storage cleanup

### Monitoring Points
- Payment success rates
- Video processing times
- Credit usage patterns
- System error rates

This technical breakdown provides a comprehensive understanding of the CaptionCraft platform architecture, making it easier to maintain, extend, and troubleshoot the system.