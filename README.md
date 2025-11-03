# New Portal - Enterprise Next.js Application

A robust, scalable Next.js application built with enterprise-level architecture.

## Tech Stack

- **Framework**: Next.js 15.5.4 (App Router)
- **Database**: MongoDB with Prisma ORM
- **Authentication**: Better Auth
- **Caching**: Redis (ioredis)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Validation**: Zod

## Features

- ✅ TypeScript with strict mode
- ✅ Prisma ORM with MongoDB
- ✅ Better Auth authentication
- ✅ Redis caching
- ✅ Enterprise-level folder structure
- ✅ Error handling and logging
- ✅ API route handlers
- ✅ Middleware for route protection
- ✅ Environment variable validation

## Getting Started

### Prerequisites

- Node.js 20+ 
- MongoDB instance
- Redis instance

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
   - `DATABASE_URL`: Your MongoDB connection string
   - `REDIS_URL`: Your Redis connection string
   - `BETTER_AUTH_SECRET`: Generate a secure secret (minimum 32 characters)
   - `NEXT_PUBLIC_APP_URL`: Your application URL

4. Generate Prisma client:
```bash
npm run db:generate
```

5. Push database schema (for development):
```bash
npm run db:push
```

6. Run the development server:
```bash
npm run dev
```

## Project Structure

```
new-portal/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── api/               # API routes
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # React components
│   ├── config/                # Configuration files
│   ├── lib/                   # Core libraries
│   │   ├── auth.ts           # Better Auth setup
│   │   ├── auth-client.ts    # Client-side auth
│   │   ├── prisma.ts         # Prisma client
│   │   └── redis.ts          # Redis client
│   ├── middleware.ts          # Next.js middleware
│   ├── types/                 # TypeScript types
│   └── utils/                 # Utility functions
│       ├── api-response.ts   # API response helpers
│       ├── cn.ts             # Class name utility
│       ├── error-handler.ts  # Error handling
│       └── logger.ts         # Logging utility
├── .env.example               # Environment variables template
└── package.json
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript type checking
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

## Environment Variables

See `.env.example` for all required environment variables.

## Architecture Decisions

- **Scalability**: Modular folder structure for easy scaling
- **Type Safety**: Full TypeScript with strict mode
- **Error Handling**: Centralized error handling with custom error classes
- **Caching**: Redis for performance optimization
- **Authentication**: Better Auth for secure, flexible auth system
- **Database**: Prisma ORM for type-safe database access

## License

Private - All rights reserved

