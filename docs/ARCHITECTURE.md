# Architecture Guide - Personal Gym Tracker

This document provides an overview of the project architecture, design decisions, and best practices.

## Project Structure

```
Personal-Gym-Tracker/
├── backend/                    # Bun + Hono API Server
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   │   ├── env.ts         # Environment validation (Zod)
│   │   │   └── supabase.ts    # Supabase client setup
│   │   ├── middleware/        # Custom middleware
│   │   │   ├── logger.ts      # Request logging
│   │   │   └── error.ts       # Error handling
│   │   ├── routes/            # API routes
│   │   │   └── health.ts      # Health check endpoint
│   │   └── index.ts           # Application entry point
│   ├── tests/                 # Test files
│   │   └── health.test.ts     # Example tests
│   ├── package.json           # Dependencies & scripts
│   ├── tsconfig.json          # TypeScript config (strict)
│   ├── vitest.config.ts       # Vitest config
│   ├── eslint.config.js       # ESLint config
│   └── .env.example           # Environment template
│
├── frontend/                   # React + Vite Application
│   ├── src/
│   │   ├── components/        # React components
│   │   │   └── ExampleChart.tsx
│   │   ├── config/            # Configuration
│   │   │   └── supabase.ts    # Supabase client
│   │   ├── App.tsx            # Main app component
│   │   ├── main.tsx           # Entry point
│   │   ├── index.css          # TailwindCSS v4 config
│   │   └── vite-env.d.ts      # Type definitions
│   ├── tests/                 # Test files
│   │   ├── setup.ts           # Test setup
│   │   └── App.test.tsx       # Example tests
│   ├── package.json           # Dependencies & scripts
│   ├── tsconfig.json          # TypeScript config (strict)
│   ├── vite.config.ts         # Vite config
│   ├── vitest.config.ts       # Vitest config
│   ├── eslint.config.js       # ESLint config
│   └── .env.example           # Environment template
│
└── docs/                       # Documentation
    ├── SETUP.md               # Setup instructions
    ├── TESTING.md             # Testing guide
    └── ARCHITECTURE.md        # This file
```

## Technology Stack

### Backend

#### Bun Runtime

- **Why**: 3x faster than Node.js, built-in TypeScript support
- **Features**: Native test runner, package manager, bundler
- **Version**: 1.3+

#### Hono Framework

- **Why**: Ultrafast, lightweight, built on Web Standards
- **Features**:
  - Type-safe routing
  - Middleware support
  - Multi-runtime compatible
  - Zero dependencies

#### Supabase

- **Why**: Open-source Firebase alternative
- **Features**:
  - PostgreSQL database
  - Real-time subscriptions
  - Authentication
  - Row Level Security (RLS)
  - Storage

### Frontend

#### React 19

- **Why**: Latest features, better performance
- **New Features**:
  - Server Components (RSC)
  - Actions for forms
  - `use` API for async data
  - Ref as prop (no forwardRef)

#### TailwindCSS v4

- **Why**: CSS-first configuration, 5x faster builds
- **Breaking Changes**:
  - No `tailwind.config.js`
  - Configuration in CSS using `@theme`
  - Uses `@import "tailwindcss"`
  - Modern browser targets only

#### Recharts

- **Why**: Composable, declarative charts for React
- **Features**:
  - Built with React and D3
  - Responsive by default
  - Highly customizable

### Testing

#### Vitest

- **Why**: 100x faster than Jest, native ESM
- **Features**:
  - Parallel execution
  - Watch mode with HMR
  - Jest-compatible API
  - Built-in coverage

## Design Patterns

### Backend Patterns

#### 1. Modular Route Structure

```typescript
// routes/health.ts
import { Hono } from 'hono';

const health = new Hono();
health.get('/', (c) => c.json({ status: 'ok' }));

export default health;

// index.ts
app.route('/health', health);
```

#### 2. Environment Validation

```typescript
// config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string().default('3000'),
  SUPABASE_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);
```

#### 3. Error Handling Middleware

```typescript
// middleware/error.ts
export async function errorHandler(err: Error, c: Context) {
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status);
  }
  return c.json({ error: 'Internal Server Error' }, 500);
}
```

### Frontend Patterns

#### 1. Component Composition

```typescript
// Prefer composition over props drilling
<Dashboard>
  <Header />
  <Sidebar />
  <MainContent>
    <WorkoutList />
    <ProgressChart />
  </MainContent>
</Dashboard>
```

#### 2. Custom Hooks

```typescript
// hooks/useWorkouts.ts
export function useWorkouts() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch workouts
  }, []);
  
  return { workouts, loading };
}
```

#### 3. Type-Safe Supabase Queries

```typescript
// Generate types: bun run supabase gen types typescript
import type { Database } from './types/supabase';

const { data } = await supabase
  .from('workouts')
  .select('*')
  .returns<Database['public']['Tables']['workouts']['Row'][]>();
```

## Environment Isolation

### Separate Workspaces

- **Backend**: Independent `node_modules`, configuration
- **Frontend**: Independent `node_modules`, configuration
- **No shared dependencies**: Prevents version conflicts

### Environment Variables

- **Backend**: Uses `process.env` directly
- **Frontend**: Uses `import.meta.env` with `VITE_` prefix
- **Templates**: `.env.example` files for both
- **Security**: Never commit `.env` files

### Dependency Management

```bash
# Backend dependencies
cd backend && bun install

# Frontend dependencies
cd frontend && bun install

# No root-level dependencies
```

## Data Flow

### Backend Request Flow

```
Request → CORS Middleware → Logger Middleware → Route Handler → Response
                                                      ↓
                                                Error Handler
```

### Frontend Data Flow

```
Component → Custom Hook → Supabase Client → Database
                ↓
            State Update
                ↓
            Re-render
```

## Security Best Practices

### Backend

1. **Environment Validation**: Zod schema ensures required vars exist
2. **CORS Configuration**: Whitelist allowed origins
3. **Error Handling**: Never expose internal errors to client
4. **Service Role Key**: Only use server-side, never in frontend

### Frontend

1. **Anon Key Only**: Never use service role key in frontend
2. **Row Level Security**: Rely on Supabase RLS policies
3. **Input Validation**: Validate all user inputs
4. **XSS Prevention**: React escapes by default

## Performance Optimizations

### Backend

1. **Bun Runtime**: 3x faster than Node.js
2. **Hono Framework**: Minimal overhead
3. **Connection Pooling**: Supabase handles automatically

### Frontend

1. **TailwindCSS v4**: 5x faster builds, 100x faster incremental
2. **Vite**: Fast HMR, optimized builds
3. **React 19**: Automatic memoization with React Compiler
4. **Code Splitting**: Vite handles automatically

### Testing

1. **Parallel Execution**: Tests run concurrently
2. **Watch Mode**: Only re-runs affected tests
3. **Coverage Caching**: Faster subsequent runs

## Deployment Considerations

### Backend

- **Platform**: Fly.io, Railway, or any Bun-compatible host
- **Environment**: Set all `.env` variables
- **Database**: Supabase handles scaling
- **Monitoring**: Add logging service (e.g., Sentry)

### Frontend

- **Platform**: Vercel, Netlify, or Cloudflare Pages
- **Build Command**: `bun run build`
- **Output**: `dist/` directory
- **Environment**: Set `VITE_*` variables

## Future Enhancements

### Planned Features

1. **Authentication**: Supabase Auth integration
2. **Real-time Updates**: Supabase Realtime subscriptions
3. **File Uploads**: Supabase Storage for images
4. **API Versioning**: `/api/v1/` routes
5. **Rate Limiting**: Protect endpoints
6. **Caching**: Redis for frequently accessed data

### Scalability

1. **Database Indexes**: Add as data grows
2. **CDN**: For static assets
3. **Load Balancing**: Multiple backend instances
4. **Monitoring**: Performance tracking

## Contributing

When adding new features:

1. ✅ Write tests FIRST (TDD)
2. ✅ Follow existing patterns
3. ✅ Update documentation
4. ✅ Run linting and formatting
5. ✅ Ensure 80%+ test coverage
6. ✅ Test in isolation (separate terminal)

## Resources

- [Bun Documentation](https://bun.sh/docs)
- [Hono Documentation](https://hono.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [React 19 Documentation](https://react.dev)
- [TailwindCSS v4 Documentation](https://tailwindcss.com)
- [Vitest Documentation](https://vitest.dev)
