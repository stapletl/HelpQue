# HelpQue Project Guide

## Project Overview

HelpQue is a digital queue management application that allows people to join and manage queues for help or assistance.

## Tech Stack

### Runtime & Package Manager
- **Bun**: JavaScript runtime and package manager
  - Fast, all-in-one toolkit for JavaScript and TypeScript
  - Used for package management, running scripts, and development

### Backend
- **Convex**: Serverless backend platform
  - Real-time database with reactive queries
  - Built-in authentication and file storage
  - TypeScript-first with automatic type generation
  - Functions located in `convex/` directory

### Frontend Framework
- **TanStack Start**: Modern React framework
  - File-based routing
  - Server-side rendering (SSR) and streaming
  - Built on TanStack Router for type-safe routing

### Languages
- **TypeScript**: Primary language for both frontend and backend
  - Strict type checking enabled
  - Use proper types, avoid `any` when possible

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework
  - Custom configuration in `tailwind.config.ts`
  - Use Tailwind utilities for all styling
- **shadcn/ui**: Accessible component library
  - Components in `components/ui/`
  - Customizable, copy-paste components
- **Magic UI**: Additional animated and beautiful components
  - Enhanced UI components for modern interfaces
- **Tailwind UI**: Premium Tailwind CSS components
  - Pre-built component patterns

## Project Structure

```
/
├── app/                    # TanStack Start application code
│   ├── routes/            # File-based routing
│   ├── components/        # React components
│   └── utils/             # Utility functions
├── convex/                # Convex backend functions
│   ├── schema.ts          # Database schema definitions
│   ├── *.ts               # Query, mutation, and action functions
│   └── _generated/        # Auto-generated types (do not edit)
├── components/
│   └── ui/                # shadcn/ui components
├── public/                # Static assets
├── convex.json            # Convex configuration
├── package.json           # Dependencies and scripts
└── tsconfig.json          # TypeScript configuration
```

## Development Guidelines

### Backend (Convex)

#### Schema Definition
- Define schemas in `convex/schema.ts` using Convex's schema builder
- Always use proper validators for data types
- Example:
  ```typescript
  import { defineSchema, defineTable } from "convex/server";
  import { v } from "convex/values";

  export default defineSchema({
    queues: defineTable({
      name: v.string(),
      description: v.optional(v.string()),
      isActive: v.boolean(),
      createdAt: v.number(),
    }),
    queueEntries: defineTable({
      queueId: v.id("queues"),
      userId: v.string(),
      position: v.number(),
      status: v.union(v.literal("waiting"), v.literal("helped"), v.literal("cancelled")),
      joinedAt: v.number(),
    }).index("by_queue", ["queueId"]),
  });
  ```

#### Functions
- **Queries**: Read-only operations (use `query`)
- **Mutations**: Write operations (use `mutation`)
- **Actions**: External API calls, non-deterministic operations (use `action`)
- Always validate inputs using `v` validators
- Export functions for use in frontend
- Example:
  ```typescript
  import { query, mutation } from "./_generated/server";
  import { v } from "convex/values";

  export const listQueues = query({
    args: {},
    handler: async (ctx) => {
      return await ctx.db.query("queues").collect();
    },
  });

  export const joinQueue = mutation({
    args: { queueId: v.id("queues") },
    handler: async (ctx, args) => {
      // Implementation
    },
  });
  ```

### Frontend (TanStack Start)

#### Routing
- File-based routing in `app/routes/`
- Use TanStack Router conventions
- Example route file: `app/routes/queues.$queueId.tsx`

#### Convex Integration
- Use `useQuery`, `useMutation`, and `useAction` hooks from Convex
- Import from `convex/react`
- Example:
  ```typescript
  import { useQuery, useMutation } from "convex/react";
  import { api } from "../../convex/_generated/api";

  function QueueList() {
    const queues = useQuery(api.queues.listQueues);
    const joinQueue = useMutation(api.queues.joinQueue);
    
    // Component implementation
  }
  ```

#### Components
- Create reusable components in `app/components/`
- Use shadcn/ui components from `components/ui/`
- Follow composition pattern for complex components
- Use TypeScript interfaces for props

#### Styling
- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Use shadcn/ui for complex interactive components
- Leverage Magic UI for enhanced animations and effects
- Example:
  ```typescript
  <div className="flex flex-col gap-4 p-6 bg-background rounded-lg shadow-md">
    <h2 className="text-2xl font-bold text-foreground">Queue Name</h2>
    <Button variant="default" size="lg">Join Queue</Button>
  </div>
  ```

### State Management
- Use Convex reactive queries for server state
- Convex automatically handles real-time updates
- Use React hooks (useState, useReducer) for local UI state
- Avoid prop drilling with Context API when needed

### Type Safety
- Leverage Convex's automatic type generation
- Import types from `convex/_generated/api`
- Define proper TypeScript interfaces for components and utilities
- Use discriminated unions for variant types (e.g., queue status)

## Running the Project

### Development
```bash
# Install dependencies
bun install

# Run Convex backend
bunx convex dev

# Run frontend (in separate terminal)
bun run dev
```

### Building for Production
```bash
# Build frontend
bun run build

# Deploy Convex backend
bunx convex deploy
```

## Key Features to Implement

### Queue Management
- Create new queues with name and description
- Mark queues as active/inactive
- View all available queues

### Queue Entry
- Join a queue and receive position
- View current position in queue
- Receive real-time updates when position changes
- Leave queue (cancel entry)

### Queue Administration
- Call next person in queue
- Mark person as helped
- Remove entries from queue
- View queue statistics

### Real-time Updates
- Leverage Convex's reactive queries
- Auto-update UI when queue changes
- Show live position updates
- Notify users when it's their turn

## Best Practices

### Performance
- Keep Convex queries focused and specific
- Use indexes for frequently queried fields
- Implement pagination for large lists
- Optimize component re-renders with React.memo when needed

### Security
- Validate all inputs in Convex functions
- Implement proper authentication with Convex Auth
- Use Convex's built-in authorization patterns
- Never trust client-side data

### Code Quality
- Write descriptive variable and function names
- Add comments for complex logic
- Keep functions small and focused
- Use early returns to reduce nesting

### Testing
- Test Convex functions with the Convex testing framework
- Write unit tests for utility functions
- Test component behavior with user interactions

## Common Patterns

### Loading States
```typescript
const queues = useQuery(api.queues.listQueues);

if (queues === undefined) {
  return <div>Loading...</div>;
}

return <QueueList queues={queues} />;
```

### Error Handling
```typescript
const joinQueue = useMutation(api.queues.joinQueue);

try {
  await joinQueue({ queueId: queue._id });
} catch (error) {
  console.error("Failed to join queue:", error);
  // Show error toast or message
}
```

### Real-time Subscriptions
Convex queries automatically subscribe to changes:
```typescript
// This will automatically update when the queue changes
const queue = useQuery(api.queues.getQueue, { queueId });
```

## Resources

- [Convex Documentation](https://docs.convex.dev/)
- [TanStack Start Documentation](https://tanstack.com/start)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Bun Documentation](https://bun.sh/docs)

## Notes for AI Assistants

When working on this project:
1. Always use Bun commands instead of npm/yarn
2. Backend logic goes in Convex functions, not in React components
3. Use Convex's reactive queries for all data fetching
4. Maintain type safety throughout the application
5. Follow the established file structure
6. Use shadcn/ui components before building custom UI components
7. Implement proper loading and error states for all async operations
8. Leverage Convex's real-time capabilities for live updates