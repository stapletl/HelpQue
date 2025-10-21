# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HelpQue is a digital queue management application built with Convex (serverless backend) and TanStack Start (React framework). The tech stack uses Bun as the runtime/package manager, TypeScript throughout, and Tailwind CSS for styling.

## Development Commands

### Package Management

- Use `bun install` to install dependencies (NOT npm/yarn)
- Use `bun` commands for all package operations

### Running the Application

```bash
# Development mode (runs both frontend and Convex backend)
bun run dev

# Run only the web frontend
bun run dev:web

# Run only Convex backend
bun run dev:convex
# or
bunx convex dev

# TypeScript watch mode
bun run dev:ts
```

### Building and Deployment

```bash
# Build frontend for production
bun run build

# Deploy Convex backend
bunx convex deploy

# Format code
bun run format
```

## Architecture

### Convex Backend (convex/)

**Function Syntax**: Always use the new function syntax with explicit args, returns, and handler:

```typescript
import { query } from './_generated/server'
import { v } from 'convex/values'

export const myQuery = query({
    args: { someArg: v.string() },
    returns: v.array(
        v.object({
            /* ... */
        }),
    ),
    handler: async (ctx, args) => {
        // Implementation
    },
})
```

**Critical Rules**:

- ALWAYS include both `args` and `returns` validators for all functions
- Use `returns: v.null()` if function doesn't return anything
- Use `query` for reads, `mutation` for writes, `action` for external APIs
- Use `internalQuery`, `internalMutation`, `internalAction` for private functions
- Call functions using `api` or `internal` objects from `_generated/api`
- When calling functions in the same file, add type annotations to work around TypeScript circularity

**Database Queries**:

- DO NOT use `.filter()` - instead define indexes and use `.withIndex()`
- Use `.unique()` to get a single document (throws if multiple matches)
- Default ordering is ascending `_creationTime`
- Queries support `.order('asc')` or `.order('desc')`
- For deletion, use `.collect()` then iterate with `ctx.db.delete(row._id)`

**Schema Design** (convex/schema.ts):

- Index naming: include all fields (e.g., "by_field1_and_field2")
- System fields `_id` and `_creationTime` are auto-added to all documents
- Use `v.id(tableName)` for document IDs
- Use TypeScript helper type `Id<'tableName'>` from `_generated/dataModel`

**Function References**:

- File-based routing: `convex/example.ts` exports `f` → `api.example.f`
- Nested files: `convex/messages/access.ts` exports `h` → `api.messages.access.h`

### Frontend (src/)

**Routing**: File-based in `src/routes/`

- `__root.tsx` - Root layout component
- `index.tsx` - Home page (/)
- Route params follow TanStack Router conventions

**Convex Integration**:

```typescript
// Queries (read data with real-time updates)
const { data } = useSuspenseQuery(
    convexQuery(api.myFunctions.listNumbers, { count: 10 }),
)

// Mutations (write data)
const addNumber = useMutation(api.myFunctions.addNumber)
await addNumber({ value: 42 })
```

**Important**: This project uses `@convex-dev/react-query` which integrates Convex with TanStack Query. Use `useSuspenseQuery` with `convexQuery` wrapper for data fetching, not the standard Convex React hooks.

**Router Setup** (src/router.tsx):

- ConvexQueryClient initialized with `VITE_CONVEX_URL` environment variable
- Router wrapped with ConvexProvider for Convex mutations
- QueryClient configured with Convex-specific queryFn and hashFn

**Styling**:

- Tailwind CSS v4 configured via `@tailwindcss/vite` plugin
- Use utility classes for all styling
- Dark mode support with `dark:` prefix

## Key Patterns

### Type Safety

- Import generated types from `convex/_generated/api` and `convex/_generated/dataModel`
- Use `Id<'tableName'>` instead of `string` for document IDs
- Use `as const` for string literals in discriminated unions
- Define arrays as `const array: Array<T> = [...]`
- Define records as `const record: Record<K, V> = {...}`

### Validators

- Arrays: `v.array(v.union(v.string(), v.number()))`
- Records: `v.record(v.id('users'), v.string())`
- Use `v.int64()` not deprecated `v.bigint()`
- Discriminated unions: use `v.union()` with `v.object()` containing `kind: v.literal()`

### Actions

- Add `"use node";` to top of files using Node.js built-in modules
- Never use `ctx.db` in actions (actions can't access database directly)
- Add `@types/node` to package.json when using Node built-ins

## Important Notes from Cursor Rules

These rules from `.cursor/rules/convex_rules.mdc` are critical:

1. **Pagination**: Use `paginationOptsValidator` from `convex/server` for paginated queries
2. **HTTP Endpoints**: Define in `convex/http.ts` using `httpAction` from `_generated/server`
3. **File Storage**: Query `_storage` system table for metadata, don't use deprecated `ctx.storage.getMetadata()`
4. **Cron Jobs**: Use `crons.interval` or `crons.cron` methods (not `.hourly`, `.daily`, `.weekly` helpers)
5. **Scheduling**: Pass FunctionReferences to scheduler, not functions directly

## Configuration Files

- `tsconfig.json`: Strict TypeScript with bundler module resolution
- `vite.config.ts`: TanStack Start + Tailwind + React plugins, runs on port 3000
- Environment: `VITE_CONVEX_URL` in `.env.local` for Convex backend URL
