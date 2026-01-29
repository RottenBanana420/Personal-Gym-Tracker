# Architecture Guide - Personal Gym Tracker

This document provides an overview of the project architecture, design decisions, and best practices.

## Project Structure

```plaintext
Personal-Gym-Tracker/
├── backend/                    # Bun + Hono API Server
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   │   ├── env.ts         # Environment validation (Zod)
│   │   │   └── supabase.ts    # Supabase client setup
│   │   ├── middleware/        # Custom middleware
│   │   │   ├── auth.ts        # JWT Authentication
│   │   │   ├── logger.ts      # Structured Request logging
│   │   │   ├── error.ts       # Centralized Error handling
│   │   │   └── validate.ts    # Custom Zod validation
│   │   ├── routes/            # API routes
│   │   │   ├── auth.ts        # Authentication endpoints
│   │   │   ├── exercises.ts   # Exercise CRUD endpoints
│   │   │   ├── workouts.ts    # Workout CRUD endpoints
│   │   │   ├── stats.ts       # Statistics endpoints
│   │   │   └── health.ts      # Health check endpoint
│   │   ├── validators/        # Validation schemas
│   │   │   ├── auth.ts        # Authentication schemas
│   │   │   ├── exercise.ts    # Exercise validation schemas
│   │   │   ├── workout.ts     # Workout validation schemas
│   │   │   └── stats.ts       # Statistics validation schemas
│   │   ├── utils/             # Utility functions
│   │   │   └── password.ts    # Password validation
│   │   ├── index.ts           # Application entry point
│   │   └── types.ts           # API type definitions
│   ├── migrations/            # Database migrations
│   │   ├── 001_core_schema.sql
│   │   ├── 002_indexes.sql
│   │   ├── 003_rls_policies.sql
│   │   ├── 004_triggers.sql
│   │   └── 005_seed_data.sql
│   ├── tests/                 # Test files
│   │   ├── config/            # Configuration tests
│   │   │   └── env.test.ts
│   │   ├── database/          # Database security tests
│   │   │   └── security.test.ts
│   │   ├── middleware/        # Middleware tests
│   │   │   ├── auth.test.ts
│   │   │   ├── error.test.ts
│   │   │   └── logger.test.ts
│   │   ├── routes/            # Route tests
│   │   │   ├── auth.test.ts
│   │   │   ├── exercises.test.ts
│   │   │   ├── workouts.test.ts
│   │   │   └── stats.test.ts
│   │   └── health.test.ts     # API health tests
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
    ├── ENV_GUIDE.md           # Environment setup guide
    ├── API.md                 # API documentation
    ├── TESTING.md             # Testing guide
    ├── ARCHITECTURE.md        # This file
    └── DATABASE.md            # Database schema
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
  if (err instanceof ApiError) {
    return c.json({ success: false, error: err.message }, err.statusCode);
  }
  return c.json({ success: false, error: 'Internal Server Error' }, 500);
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

```plaintext
Request → RequestId Gen → Logger → CORS → Auth Middleware → Route Handler → Response
                                                                  ↓
                                                            Error Handler
```

### Frontend Data Flow

```plaintext
Component → Auth Hook → Custom Hook → Supabase Client → Database
                 ↓
             State Update
                 ↓
             Re-render
```

## Security Best Practices

### Backend Security

1. **JWT Verification**: Always verify tokens via Supabase Auth middleware
2. **Environment Validation**: Zod schema ensures required vars exist
3. **CORS Configuration**: Whitelist allowed origins
4. **Error Handling**: Standardized responses, no internal leaks.
5. **Service Role Key**: Only use server-side, never in frontend

### Frontend Security

1. **Anon Key Only**: Never use service role key in frontend
2. **Row Level Security**: Rely on Supabase RLS policies
3. **Input Validation**: Validate all user inputs
4. **XSS Prevention**: React escapes by default

## Performance Optimizations

### Backend Performance

1. **Bun Runtime**: 3x faster than Node.js
2. **Hono Framework**: Minimal overhead
3. **Connection Pooling**: Supabase handles automatically

### Frontend Performance

1. **TailwindCSS v4**: 5x faster builds, 100x faster incremental
2. **Vite**: Fast HMR, optimized builds
3. **React 19**: Automatic memoization with React Compiler
4. **Code Splitting**: Vite handles automatically

### Testing Performance

1. **Parallel Execution**: Tests run concurrently
2. **Watch Mode**: Only re-runs affected tests
3. **Coverage Caching**: Faster subsequent runs

## Deployment Considerations

### Backend Deployment

- **Platform**: Fly.io, Railway, or any Bun-compatible host
- **Environment**: Set all `.env` variables
- **Database**: Supabase handles scaling
- **Monitoring**: Add logging service (e.g., Sentry)

### Frontend Deployment

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
