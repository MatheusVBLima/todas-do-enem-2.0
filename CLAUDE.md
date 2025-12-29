# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Todas do ENEM 2.0** is a SaaS platform for Brazilian students to study ENEM exam questions (1998-present). Features include question filtering, study groups, PDF export, and AI-powered explanations/essay correction using Google Gemini.

## Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19
- **Database**: Supabase (PostgreSQL) with supabase-js client
- **UI**: shadcn/ui (New York) + Tailwind CSS 4 + Framer Motion
- **State**: TanStack Query v5 + nuqs (URL state)
- **AI**: Google Gemini Flash (Vercel AI SDK)
- **Type Safety**: TypeScript 5 + Zod validation

## Development Commands

```bash
bun run dev          # Start dev server (localhost:3000)
bun run build        # Production build
```

## Supabase Access

- **Dashboard**: https://supabase.com/dashboard/project/hmauacrtvesutfbmogyo
- **SQL Editor**: For running queries and managing database
- **Table Editor**: Visual interface for data management

## Architecture Patterns

### 1. Server Actions ("use server")

All data mutations and queries use Next.js Server Actions in `src/server/actions/`:

```typescript
// Pattern: Return { success, data?, error? }
export async function getQuestions(filters: QuestionFilters)
export async function createGroup(input: CreateGroupInput)
```

Always use `revalidatePath()` after mutations for cache invalidation.

### 2. TanStack Query Configuration

**Query Keys** (`src/lib/query-keys.ts`):
```typescript
queryKeys.questions.list(filters)  // Hierarchical structure
queryKeys.questions.detail(id)
queryKeys.groups.list(userId)
```

**Global Config**:
- `staleTime`: 5 minutes (data fresh period)
- `gcTime`: 10 minutes (garbage collection)
- `refetchOnWindowFocus`: false
- `refetchOnMount`: false (prevents duplicate fetches)

### 3. Server-Side Prefetching Pattern

Used in all pages for optimal performance:

```typescript
export default async function Page() {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: queryKeys.questions.list(filters),
    queryFn: () => getQuestions(filters),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ClientComponent />
    </HydrationBoundary>
  )
}
```

Benefits: No waterfall requests, data ready on first render.

**Note**: All pages now share the same root layout with sidebar/header (moved from `(main)/layout.tsx` to `app/layout.tsx`).

### 4. URL State Management (nuqs)

`src/hooks/use-question-filters.ts` syncs filter state to URL:
- Enables shareable URLs with exact filter state
- Browser back/forward compatibility
- SEO-friendly query parameters

Pattern:
```typescript
const [anos, setAnos] = useQueryState('anos', parseAsArrayOf(parseAsInteger))
```

### 5. Database Access

**Supabase Client** (`src/lib/supabase/server.ts`):
```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// Singleton pattern - reuse connection in serverless
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Bypasses RLS
  { auth: { persistSession: false } }
)
```

**Re-exported as `db`** for backwards compatibility (`src/lib/db.ts`):
```typescript
export { supabase as db } from './supabase/server'
```

### 6. RPC Functions (Stored Procedures)

Complex queries and transactions use PostgreSQL functions:

1. **get_questions_with_filters** - Paginated questions with filters and ORDER BY exam.year
2. **submit_essay_for_correction** - Atomic: DELETE old correction + UPDATE status to SUBMITTED
3. **save_essay_correction** - Atomic: INSERT correction + UPDATE status to CORRECTED

## Database Schema

**Key Tables** (7 total):

1. **Question** - ENEM exam questions
   - Stored in **lowercase** for case-insensitive search
   - Use `capitalizeSentences()` from `src/lib/text-utils.ts` for display
   - Indexes: knowledgeArea, subject, examId, full-text search (Portuguese)
   - `supportingMaterials` is JSONB (native JSON, not string)

2. **QuestionGroup** - User's study groups
   - Many-to-many with Question via `QuestionsOnGroups`
   - `savedFilters` is JSONB (native JSON, not string)

3. **User** - Student accounts
   - `plan`: TENTANDO_A_SORTE (free) or RUMO_A_APROVACAO (paid)
   - `email` uses CITEXT for case-insensitive uniqueness

4. **Essay + EssayCorrection** - AI essay evaluation
   - 5 competencies (0-200 points each)
   - One-to-one relationship (essayId unique constraint)

## Directory Structure

```
src/
├── app/
│   ├── layout.tsx       # Root layout with sidebar + header (all pages)
│   ├── page.tsx         # Questions list (root route "/")
│   ├── [id]/            # Question detail pages ("/{id}")
│   ├── grupos/          # Study groups management
│   │   ├── page.tsx     # Groups list
│   │   └── [id]/        # Group detail
│   ├── redacao/         # Essay writing
│   ├── conta/           # User account settings
│   ├── api/             # API routes
│   │   └── chat/        # AI streaming endpoint
│   └── dashboard/       # Dashboard (legacy, not used)
├── components/
│   ├── ui/              # shadcn/ui components (30+ installed)
│   ├── questions/       # Question-specific components
│   ├── groups/          # Group management components
│   ├── layout/          # Header, Sidebar, Breadcrumb
│   ├── search/          # Global search (Cmd+K)
│   └── export/          # PDF export components
├── server/actions/      # Server actions ("use server")
├── hooks/               # Custom hooks (filters, prefetch)
├── lib/
│   ├── db.ts            # Re-exports Supabase client
│   ├── supabase/        # Supabase configuration
│   │   ├── server.ts    # Server client (SERVICE_ROLE_KEY)
│   │   ├── client.ts    # Browser client (PUBLISHABLE_KEY)
│   │   ├── database.types.ts  # Generated types
│   │   └── types.ts     # Manual type exports
│   ├── query-keys.ts    # TanStack Query keys
│   ├── ai.ts            # Gemini model config
│   ├── constants.ts     # ENEM areas, subjects, plans
│   └── text-utils.ts    # capitalizeSentences() for display
└── types/index.ts       # Shared TypeScript types
```

## Key Implementation Details

### Case-Insensitive Search (PostgreSQL)

**Database**: All text fields stored in **lowercase**
```typescript
// Stored lowercase in database
context: "...",  // lowercase
statement: "...", // lowercase
```

**Display**: Use capitalization helper
```typescript
import { capitalizeSentences } from "@/lib/text-utils"
<p>{capitalizeSentences(question.context)}</p>
```

**Search**: Use PostgreSQL ILIKE operator
```typescript
// In RPC function (scripts/supabase-functions.sql)
WHERE statement ILIKE '%' || p_busca || '%'
   OR context ILIKE '%' || p_busca || '%'
```

### JSONB vs JSON Strings

**Supabase uses JSONB** (native JSON type):
```typescript
// NO need for JSON.parse() - already an object!
const materials = question.supportingMaterials  // Already array
const filters = group.savedFilters  // Already object

// But handle legacy string data defensively:
const materials = Array.isArray(question.supportingMaterials)
  ? question.supportingMaterials
  : typeof question.supportingMaterials === 'string'
    ? JSON.parse(question.supportingMaterials)
    : []
```

### AI Integration

**Question Explanations** (`src/server/actions/ai.ts`):
```typescript
// Streaming response for real-time UI
const result = streamText({
  model: geminiFlashModel,
  prompt: `Explique a questão: ${question.statement}`,
  temperature: 0.7,
})
return createStreamableValue(result.textStream).value
```

**Essay Correction**:
```typescript
// Structured output with Zod schema
const result = await generateObject({
  model: geminiFlashModel,
  schema: essayFeedbackSchema, // 5 competencies + totalScore
  temperature: 0.5,
})
```

### Breadcrumb Component

Automatically fetches real names for CUIDs:
- `/{cuid}` → "Q15 - 2024" (question detail at root)
- `/grupos/{cuid}` → "Grupos" → "Nome do Grupo"

Uses TanStack Query to fetch question/group data when needed.

**Important**: Uses `isCUID()` regex to detect Prisma CUIDs (25 chars, starts with 'c'), not UUIDs.

### Global Search (Cmd+K)

`src/components/search/global-search.tsx`:
- Debounced search (300ms)
- Bypasses cmdk filtering (server-side search)
- Responsive: Icon-only on tablets, full width on desktop

### Sidebar & Header

**Sticky Header**: `sticky top-0 z-50 backdrop-blur-md bg-background/80`
- Blur effect for visual depth
- Breadcrumb hidden on mobile (`hidden sm:block`)

**Sidebar**: Collapsible with icon-only mode
- `collapsible="icon"` on `<Sidebar>`
- Logo text hides: `group-data-[collapsible=icon]:hidden`
- Link "Questões" points to `/` (root route)

**Theme Switcher**: Inside user dropdown menu (not sidebar footer)

**Layout Structure**: Sidebar + header are in root `app/layout.tsx`, applied to all pages globally.

## Common Workflows

### Adding a New Filter

1. Add to `QuestionFilters` in `src/types/index.ts`
2. Update `useQuestionFilters` hook for URL state
3. Add filter logic in `getQuestions` server action
4. Add UI in `QuestionFilters` component
5. Query key auto-updates via `queryKeys.questions.list(filters)`

### Creating a New Server Action

1. Add to `src/server/actions/[feature].ts`
2. Use consistent `ActionResponse<T>` return type:
   ```typescript
   return { success: true, data: result }
   // or
   return { success: false, error: "Error message" }
   ```
3. Call `revalidatePath()` after mutations
4. Handle errors with try-catch

### Adding AI Features

1. Define Zod schema for structured output
2. Create server action in `src/server/actions/ai.ts`
3. Use `generateObject` (JSON) or `streamText` (streaming)
4. Handle in UI with `useChat` or `readStreamableValue`

## Constants & Configuration

**Location**: `src/lib/constants.ts`

- **KNOWLEDGE_AREAS**: 4 ENEM areas with colors
- **SUBJECTS**: 13 subjects across areas
- **SUBSCRIPTION_PLANS**: Feature matrix (free vs paid)
- **GROUP_COLORS**: 11 predefined colors
- **PAGINATION.DEFAULT_PAGE_SIZE**: 20 items

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://hmauacrtvesutfbmogyo.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY="..."  # Public key
SUPABASE_SERVICE_ROLE_KEY="..."                      # Secret key (bypasses RLS)

# AI
GOOGLE_GENERATIVE_AI_API_KEY="..."

# Future
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
# POLAR_API_KEY
```

**Important**: `SUPABASE_SERVICE_ROLE_KEY` is used in server actions to bypass Row Level Security (RLS)

## Performance Optimizations

1. **Server-Side Prefetching**: Data loaded on server, hydrated to client
2. **Query Caching**: 5-minute stale time prevents refetches
3. **Prefetch Hooks**: `usePrefetchQuestions`, `usePrefetchGroups`
4. **Database Indexes**: On knowledgeArea, subject, examId, full-text search
5. **Debounced Search**: 300ms delay reduces API calls
6. **RPC Functions**: Complex queries run in database for better performance
7. **JSONB Storage**: Native PostgreSQL JSON for fast queries without parsing

## Type System

```typescript
// Question types
type QuestionWithExam = Question & { exam: Exam }
type QuestionFull = Question & { exam: Exam; groups: ... }

// Pagination
interface PaginatedResponse<T> {
  data: T[]
  pagination: { page, pageSize, total, totalPages, hasMore }
}

// Server actions
interface ActionResponse<T = void> {
  success: boolean
  data?: T
  error?: string
}
```

## Important Notes

1. **Server Actions**: All DB operations use "use server" pattern
2. **Error Handling**: Wrap in try-catch, return ActionResponse
3. **Cache Invalidation**: Always call `revalidatePath()` after mutations
4. **Loading States**: Use Suspense boundaries with skeleton components
5. **Mobile**: Responsive with sidebar collapsing, breadcrumb hidden
6. **Dark Mode**: System preference detection via next-themes
7. **Streaming AI**: Use `createStreamableValue` for real-time responses
8. **Supabase Client**: Use SERVICE_ROLE_KEY in server actions to bypass RLS
9. **Text Display**: Always capitalize lowercase DB text with `capitalizeSentences()`
10. **Search**: Use ILIKE operator for case-insensitive PostgreSQL search
11. **JSONB Fields**: No need for JSON.parse() - already native objects
12. **Relations**: When using `.single()`, relations come as objects (not arrays)
13. **Transactions**: Use RPC functions for atomic multi-step operations

## Deployment Considerations

- **Database**: Already using Supabase PostgreSQL ✅
- **Authentication**: Future Clerk integration (env vars ready)
- **AI**: Set GOOGLE_GENERATIVE_AI_API_KEY in production
- **Payments**: Future Polar integration (POLAR_API_KEY)
- **RLS Policies**: Currently bypassed via SERVICE_ROLE_KEY (consider enabling for client-side queries)
