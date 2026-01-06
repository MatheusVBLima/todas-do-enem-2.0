# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Todas do ENEM 2.0 is a Next.js 16 web application for ENEM (Brazilian standardized test) preparation. It provides access to all ENEM questions since 1998, AI-powered explanations (Google Gemini 2.5 Flash), essay corrections, and exam simulations.

**Tech Stack:** Next.js 16, React 19, TypeScript, Supabase (PostgreSQL + Auth), Stripe, Tailwind CSS v4, Radix UI

## Commands

```bash
bun run dev          # Start development server (http://localhost:3000)
bun run build        # Production build
bun run start        # Start production server

# Database (Supabase via Prisma CLI)
bun run db:push      # Push schema changes
bun run db:generate  # Generate Prisma client
bun run db:seed      # Seed database
bun run db:studio    # Open Prisma Studio

# Stripe webhook testing (separate terminal)
stripe listen --forward-to http://localhost:3000/api/stripe/webhook
```

## Architecture

### Directory Structure

- `src/app/` - Next.js App Router pages and API routes
- `src/components/` - React components (UI library in `ui/`)
- `src/server/actions/` - Server actions for data operations
- `src/lib/` - Utilities, Supabase clients, AI config
- `src/hooks/` - Custom React hooks
- `src/stores/` - Zustand state stores
- `src/providers/` - React context providers

### Key Patterns

**Server Actions:** All data operations use React Server Actions in `src/server/actions/`. Use `'use server'` directive.

**Authentication:** Supabase Auth with two client types:
- `src/lib/supabase/server.ts` - Service role client (bypasses RLS)
- `src/lib/auth/server.ts` - `getCurrentUser()`, `requireAuth()` for auth checks

**Route Protection:** `src/proxy.ts` middleware protects `/conta`, `/redacao`, `/grupos`, `/simulados` routes.

**State Management:**
- React Query for server state (keys in `src/lib/query-keys.ts`)
- Zustand for client state (`src/stores/`)
- nuqs for URL state (filter persistence)

### Subscription Plans

- `TENTANDO_A_SORTE` (Free): Questions, grouping, PDF export
- `RUMO_A_APROVACAO` (Paid): Everything + AI explanations (900/mo) + essay corrections (20/mo)

Permission checks: `canAccessAIExplanations()`, `canAccessEssayCorrection()` in `src/lib/auth/permissions.ts`

### AI Integration

Model configured in `src/lib/ai.ts` using Google Gemini 2.5 Flash. AI endpoint at `/api/chat/route.ts` handles explanations with quota tracking.

### API Routes

- `POST /api/chat` - AI explanations (requires auth + quota)
- `POST /api/stripe/checkout` - Create Stripe checkout session
- `POST /api/stripe/webhook` - Stripe payment webhooks

## Environment Variables

Required:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_ID_PRO
GOOGLE_GENERATIVE_AI_API_KEY
NEXT_PUBLIC_APP_URL
ADMIN_EMAIL
```

## Stripe Testing

Test card: `4242 4242 4242 4242` (any future date, any 3-digit CVC)

See `docs/stripe-development-guide.md` for complete testing instructions.
