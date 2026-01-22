# Personal Gym Tracker

A full-stack gym tracking application built with modern technologies and best practices.

## 🎯 Project Status

- ✅ **Backend API**: Configured with Bun + Hono
- ✅ **Database Schema**: Complete with 10 normalized tables, RLS policies, and triggers
- ✅ **Security Tests**: 26 passing tests verifying complete data isolation
- ✅ **Frontend**: Configured with React + Vite + TailwindCSS v4
- 🚧 **API Integration**: In progress
- 🚧 **UI Components**: In progress

## Tech Stack

### Backend

- **Runtime**: Bun v1.3+ (fast JavaScript runtime)
- **Framework**: Hono (ultrafast web framework)
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Testing**: Vitest (fast, parallel test execution)
- **Language**: TypeScript (strict mode)

### Frontend

- **Framework**: React 19.2
- **Build Tool**: Vite
- **Styling**: TailwindCSS v4 (CSS-first configuration)
- **Charts**: Recharts 3.6
- **Testing**: Vitest + React Testing Library
- **Language**: TypeScript (strict mode)

## Prerequisites

1. **Bun** - Install from [bun.sh](https://bun.sh)

   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

2. **Supabase Account** - Sign up at [supabase.com](https://supabase.com)

## Quick Start

> **📖 For detailed setup instructions**, see the [Setup Guide](./docs/SETUP.md)

### 1. Clone and Install

```bash
git clone <repository-url>
cd Personal-Gym-Tracker
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your Supabase credentials (see Setup Guide)
bun install
bun run dev
```

Backend will run on `http://localhost:3000`

### 3. Frontend Setup

```bash
cd frontend
cp .env.example .env
# Edit .env with your Supabase credentials (see Setup Guide)
bun install
bun run dev
```

Frontend will run on `http://localhost:5173`

## Database Schema

The application uses a fully normalized PostgreSQL schema with comprehensive security and performance optimizations.

### Core Tables

- **`profiles`** - User profile information (extends Supabase Auth)
- **`user_metrics`** - Historical biometric data (weight, body fat, muscle mass)
- **`exercises`** - Master exercise library (system + user-created)
- **`workouts`** - Individual workout sessions
- **`workout_exercises`** - Links exercises to workouts
- **`sets`** - Detailed set data (reps, weight, duration)
- **`personal_records`** - User personal bests (auto-tracked)
- **`workout_routines`** - Pre-defined workout templates
- **`routine_exercises`** - Links exercises to routines
- **`goals`** - User fitness goals and progress tracking

### Security Features

- ✅ **Row Level Security (RLS)** enabled on all tables
- ✅ **Complete data isolation** between users
- ✅ **40+ security policies** preventing unauthorized access
- ✅ **26 security tests** verifying RLS implementation
- ✅ **Automatic profile creation** on user signup

### Performance Optimizations

- ✅ **40+ strategic indexes** (composite, partial, GIN)
- ✅ **Optimized for common query patterns**
- ✅ **Expected query times**: <50-100ms
- ✅ **Automatic triggers** for timestamps and personal records

### Migrations

Database migrations are located in `backend/migrations/`:

```bash
001_core_schema.sql      # All 10 tables with constraints
002_indexes.sql          # Performance indexes
003_rls_policies.sql     # Row Level Security policies
004_triggers.sql         # Automatic triggers
005_seed_data.sql        # 32 system exercises + 3 routines
```

All migrations have been applied to the production Supabase database.

## Development Workflow

### Running Tests

```bash
# Backend tests
cd backend
bun run test                # Run all tests
bun run test:watch          # Watch mode
bun run test:coverage       # With coverage

# Frontend tests
cd frontend
bun run test                # Run all tests
bun run test:watch          # Watch mode
bun run test:coverage       # With coverage
```

> **⚠️ Important**: Always use `bun run test` (not `bun test`) to ensure Vitest is used. See [Testing Guide](./docs/TESTING.md) for details.

### Code Quality

```bash
# Linting
cd backend && bun run lint
cd frontend && bun run lint

# Formatting
cd backend && bun run format
cd frontend && bun run format

# Type checking
cd backend && bun run type-check
cd frontend && bun run type-check
```

## Project Structure

```
Personal-Gym-Tracker/
├── backend/                 # Bun + Hono API
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   └── index.ts        # Entry point
│   ├── migrations/         # Database migrations
│   │   ├── 001_core_schema.sql
│   │   ├── 002_indexes.sql
│   │   ├── 003_rls_policies.sql
│   │   ├── 004_triggers.sql
│   │   ├── 005_seed_data.sql
│   │   └── README.md
│   ├── tests/
│   │   ├── database/       # Database security tests
│   │   └── health.test.ts  # API health tests
│   └── package.json
├── frontend/               # React + Vite app
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── config/         # Configuration
│   │   ├── pages/          # Page components
│   │   └── main.tsx        # Entry point
│   ├── tests/              # Test files
│   └── package.json
└── docs/                   # Documentation
    ├── SETUP.md
    ├── ENV_SETUP.md
    ├── TESTING.md
    └── ARCHITECTURE.md
```

## Testing Philosophy

This project follows **Test-Driven Development (TDD)** principles:

- ✅ Tests are written FIRST, before implementation
- ✅ Tests are IMMUTABLE - never modify tests to pass code
- ✅ Code is modified to pass tests
- ✅ High coverage thresholds enforced (80%+)
- ✅ Parallel test execution for speed
- ✅ Strict type checking catches errors early

## Environment Isolation

Each workspace (backend/frontend) has:

- Separate `node_modules` directories
- Independent dependency management
- Isolated configuration files
- Separate environment variables

This ensures no interference between environments and easy replication.

## Documentation

Comprehensive guides are available in the `docs/` directory:

- **[Setup Guide](./docs/SETUP.md)** - Complete setup instructions with troubleshooting
- **[Database Schema](./docs/DATABASE.md)** - Complete database schema documentation with security and performance details
- **[Environment Setup](./docs/ENV_SETUP.md)** - Detailed environment variable configuration
- **[Testing Guide](./docs/TESTING.md)** - Testing strategies, TDD workflow, and best practices
- **[Architecture](./docs/ARCHITECTURE.md)** - Project architecture and design decisions

## License

See [LICENSE](./LICENSE) file for details.
