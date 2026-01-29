# Personal Gym Tracker

A full-stack gym tracking application built with modern technologies and best practices.

## 🎯 Project Status

- ✅ **Backend API**: Production-ready Hono API with 17 endpoints
- ✅ **Database Schema**: Complete with 10 normalized tables, RLS policies, and triggers
- ✅ **Authentication System**: Complete JWT-based auth with 5 endpoints (signup, login, logout, me, refresh)
- ✅ **Exercise Management**: Complete CRUD endpoints with filtering, sorting, and authorization
- ✅ **Workout Management**: Complete CRUD endpoints with nested sets, transactions, and filtering
- ✅ **Statistics API**: Complete analytics endpoints (PRs, progress, volume, summary)
- ✅ **Test Infrastructure**: Vitest 4 with comprehensive test coverage
- ✅ **Frontend**: Configured with React + Vite + TailwindCSS v4
- 🚧 **API Integration**: In progress
- 🚧 **UI Components**: In progress

> **Note**: Some integration tests may require the backend server to be running. See the [Testing Guide](./docs/TESTING.md) for details.

## Tech Stack

### Backend

- **Runtime**: Bun v1.3+ (fast JavaScript runtime)
- **Framework**: Hono (ultrafast web framework)
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Auth with JWT tokens
- **Validation**: Custom Zod-based validation middleware
- **Testing**: Vitest (fast, parallel test execution)
- **Language**: TypeScript (strict mode)
- **Endpoints**: 17 production-ready API endpoints

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

### Environment Prerequisites

1. **Bun** - Install from [bun.sh](https://bun.sh)
2. **Supabase Account** - Sign up at [supabase.com](https://supabase.com)

### Setup Steps

1. **Clone and Install**

   ```bash
   git clone <repository-url>
   cd Personal-Gym-Tracker
   ```

2. **Configure Environment Variables**

   Create `.env` files for both backend and frontend:

   ```bash
   # Backend
   cd backend
   cp .env.example .env
   # Edit .env with your Supabase credentials
   
   # Frontend
   cd ../frontend
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

   See the [Setup Guide](./docs/SETUP.md) for detailed instructions on obtaining Supabase credentials.

3. **Install Dependencies and Run**

   ```bash
   # Backend (Terminal 1)
   cd backend
   bun install
   bun run dev  # Runs on http://localhost:3000
   
   # Frontend (Terminal 2)
   cd frontend
   bun install
   bun run dev  # Runs on http://localhost:5173
   ```

4. **Verify Setup**

   ```bash
   # Test backend health
   curl http://localhost:3000/health
   
   # Run tests
   cd backend && bun run test
   cd frontend && bun run test
   ```

## Recent Improvements

### Statistics API Implementation (January 2026)

- ✅ **Complete Analytics Endpoints**: Implemented 4 production-ready statistics endpoints
  - `GET /api/stats/prs` - Personal records for all exercises
  - `GET /api/stats/progress/:exerciseId` - Historical progress tracking with time periods
  - `GET /api/stats/volume` - Training volume analytics grouped by week/month
  - `GET /api/stats/summary` - Comprehensive summary statistics and streaks
- ✅ **Advanced Analytics Features**: Complex SQL queries with aggregations
  - Personal record tracking (max weight, max reps, max volume)
  - Exercise progression over time (4 weeks, 12 weeks, 6 months, all time)
  - Volume breakdown by muscle group
  - Workout streak calculation
  - Average workouts per week
- ✅ **Comprehensive Authorization**: Multi-layer security for all analytics
  - RLS enforcement at database level
  - User-specific data isolation
  - Exercise ownership verification for progress tracking
- ✅ **Complete Test Coverage**: 27 statistics endpoint tests covering all scenarios
  - Personal record calculations (weight, reps, volume)
  - Progress tracking with various time periods
  - Volume analytics with grouping options
  - Summary statistics and streak calculations
  - Authorization and data isolation
  - Edge cases (no workouts, empty data)
- ✅ **100% Test Pass Rate**: All 186 backend tests passing (159 existing + 27 new)

### Workout Management System Implementation (January 2026)

- ✅ **Complete Workout CRUD Endpoints**: Implemented 4 production-ready endpoints
  - `GET /api/workouts` - Retrieve workouts with filtering and pagination
  - `POST /api/workouts` - Create workouts with nested sets (atomic transactions)
  - `GET /api/workouts/:id` - Retrieve complete workout details with all sets
  - `DELETE /api/workouts/:id` - Delete workouts with cascade deletion
- ✅ **Advanced Features**: Complex nested data handling
  - Atomic transactions for workout + sets creation
  - Date range filtering (start_date, end_date)
  - Pagination support (limit, offset)
  - Automatic workout naming and metadata calculation
  - Cascade deletion of associated sets
- ✅ **Comprehensive Authorization**: Multi-layer security implementation
  - Exercise ownership verification (can't use other users' exercises)
  - Workout ownership verification for updates/deletes
  - Service role checks for proper 403 vs 404 responses
- ✅ **Input Validation**: Zod schemas for all workout operations
  - Nested set validation (exercise_id, set_number, weight, reps)
  - Date validation (workout_date, start_date, end_date)
  - Pagination constraints (max limit: 100)
  - Transaction rollback on validation failures
- ✅ **Complete Test Coverage**: 30 workout endpoint tests covering all scenarios
  - All CRUD operations with success and failure cases
  - Nested set creation and retrieval
  - Authorization checks (exercise ownership, workout ownership)
  - Input validation (missing fields, invalid formats)
  - Transaction rollback scenarios
  - Date filtering and pagination
- ✅ **100% Test Pass Rate**: All 159 backend tests passing (129 existing + 30 new)

### Exercise Management System Implementation (January 2026)

- ✅ **Complete Exercise CRUD Endpoints**: Implemented 4 production-ready endpoints
  - `GET /api/exercises` - Retrieve user's exercises with filtering and sorting
  - `POST /api/exercises` - Create new exercises with validation
  - `PUT /api/exercises/:id` - Update existing exercises (partial updates supported)
  - `DELETE /api/exercises/:id` - Delete exercises with cascade protection
- ✅ **Advanced Filtering & Sorting**: Query exercises by muscle group and equipment type
  - Sort by name (ascending/descending) or creation date
  - Efficient database queries with proper indexing
- ✅ **Comprehensive Authorization**: Multi-layer security implementation
  - Row Level Security (RLS) enforcement at database level
  - Service role checks to distinguish 403 (Forbidden) vs 404 (Not Found)
  - Authenticated Supabase client per request with JWT context
- ✅ **Input Validation**: Zod schemas for all exercise operations
  - Muscle groups: Chest, Back, Legs, Shoulders, Arms, Core, Full Body
  - Equipment types: Barbell, Dumbbell, Machine, Bodyweight, Cable, Resistance Band, Other
  - Name length constraints (1-100 characters)
  - Optional description (max 500 characters)
- ✅ **Complete Test Coverage**: 27 exercise endpoint tests covering all scenarios
  - All CRUD operations with success and failure cases
  - Authentication and authorization checks
  - Input validation (missing fields, invalid values, length constraints)
  - Data isolation between users
  - Filtering and sorting functionality
- ✅ **100% Test Pass Rate**: All 129 backend tests passing (102 existing + 27 new)

### Authentication System Implementation (January 2026)

- ✅ **Complete Authentication Endpoints**: Implemented 5 production-ready endpoints
  - `POST /api/auth/signup` - User registration with email auto-confirmation
  - `POST /api/auth/login` - User authentication with session tokens
  - `POST /api/auth/logout` - Session invalidation (idempotent)
  - `GET /api/auth/me` - Current user profile retrieval
  - `POST /api/auth/refresh` - Token refresh with rotation
- ✅ **Custom Validation Middleware**: Built custom Zod validator for better error messages
  - User-friendly error formatting (e.g., "email: Invalid email format")
  - Automatic camelCase to space-separated field name conversion
  - Email preprocessing (trim and lowercase before validation)
- ✅ **Password Security**: NIST 2024 compliant password validation
  - 8-64 character length requirement (prioritizing length over complexity)
  - Password strength validation utilities
- ✅ **Comprehensive Test Coverage**: 24 authentication tests covering all scenarios
  - Valid/invalid credentials
  - Missing fields and validation errors
  - Email sanitization (trim/lowercase)
  - Special characters in passwords
  - Token expiration and refresh
  - Protected endpoint access control
- ✅ **100% Test Pass Rate**: All 102 backend tests passing

### Core API Foundation Implementation (January 2026)

- ✅ **Authentication Middleware**: Implemented JWT-based authentication using Supabase Auth
  - Supports both required and optional authentication modes
  - Standardized user context available in all route handlers
- ✅ **Structured Logging**: Enhanced logging with unique Request IDs, ISO timestamps, and user-agent tracking
  - Color-coded output for development
  - Sensitive data protection (sanitizes passwords and tokens from logs)
- ✅ **Enhanced Error Handling**: Centralized error middleware with standardized JSON responses
  - Consistent format: `{ success: false, error: "message" }`
  - Custom API error classes (ValidationError, UnauthorizedError, ConflictError, etc.)
  - Proper Zod validation error formatting
- ✅ **Production-Ready Foundation**: All middleware built following TDD principles with 100% logic coverage

### Test Infrastructure Upgrade (January 2026)

- ✅ **Vitest 4 Migration**: Updated to latest Vitest with modern pool configuration
- ✅ **Expanded Test Coverage**: Grew from 26 to 186 backend tests
  - 30 workout endpoint tests
  - 27 statistics endpoint tests
  - 27 exercise endpoint tests
  - 26 database security/RLS tests
  - 24 authentication endpoint tests
  - 17 error handling tests
  - 13 environment validation tests
  - 9 authentication middleware tests
  - 9 structured logging tests
  - 4 health check tests
- ✅ **Zero Warnings**: Eliminated all test warnings
  - Fixed Recharts dimension warnings with enhanced ResizeObserver mock
  - Suppressed expected JSDOM-related warnings
- ✅ **100% Pass Rate**: All tests passing with comprehensive coverage

## API Endpoints

The application provides **17 production-ready REST API endpoints** across 4 main categories:

- **Authentication** (5 endpoints): signup, login, logout, profile, token refresh
- **Exercise Management** (4 endpoints): CRUD operations with filtering and sorting
- **Workout Management** (4 endpoints): CRUD with nested sets and transactions
- **Statistics** (4 endpoints): PRs, progress tracking, volume analysis, summary stats

> **📖 For complete API documentation**, see the [API Reference](./docs/API.md)

### Quick API Overview

All endpoints return standardized JSON responses:

```json
// Success
{ "success": true, "data": { ... } }

// Error
{ "success": false, "error": "Error message" }
```

**Authentication**: All protected endpoints require a JWT token in the `Authorization: Bearer <token>` header.

**Example Usage**:

```bash
# Health check
curl http://localhost:3000/health

# Sign up
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePass123"}'

# Get exercises (requires auth)
curl http://localhost:3000/api/exercises \
  -H "Authorization: Bearer <your-token>"
```

For detailed request/response schemas, validation rules, and error codes, see the [API Reference](./docs/API.md).

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
- ✅ **JWT Authentication** verified by Supabase Auth
- ✅ **30 workout endpoint tests** for CRUD authorization and transactions
- ✅ **27 exercise endpoint tests** for CRUD authorization
- ✅ **27 statistics endpoint tests** for analytics authorization
- ✅ **26 security tests** verifying RLS implementation
- ✅ **24 authentication tests** for endpoint security
- ✅ **17 error handling tests** for middleware robustness
- ✅ **13 environment validation tests** for configuration security
- ✅ **9 authentication middleware tests** for JWT security
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

### Test Execution Commands

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

```plaintext
Personal-Gym-Tracker/
├── backend/                 # Bun + Hono API
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   │   ├── env.ts      # Environment validation (Zod)
│   │   │   └── supabase.ts # Supabase client configuration
│   │   ├── routes/         # API routes
│   │   │   ├── auth.ts     # Authentication endpoints
│   │   │   ├── exercises.ts # Exercise CRUD endpoints
│   │   │   ├── workouts.ts # Workout CRUD endpoints
│   │   │   ├── stats.ts    # Statistics endpoints
│   │   │   └── health.ts   # Health check endpoint
│   │   ├── middleware/     # Custom middleware
│   │   │   ├── auth.ts     # JWT Authentication
│   │   │   ├── error.ts    # Error handling
│   │   │   ├── logger.ts   # Request logging
│   │   │   └── validate.ts # Custom Zod validation
│   │   ├── validators/     # Validation schemas
│   │   │   ├── auth.ts     # Authentication schemas
│   │   │   ├── exercise.ts # Exercise validation schemas
│   │   │   ├── workout.ts  # Workout validation schemas
│   │   │   └── stats.ts    # Statistics validation schemas
│   │   ├── utils/          # Utility functions
│   │   │   └── password.ts # Password validation
│   │   ├── index.ts        # Entry point
│   │   └── types.ts        # API type definitions
│   ├── migrations/         # Database migrations
│   │   ├── 001_core_schema.sql
│   │   ├── 002_indexes.sql
│   │   ├── 003_rls_policies.sql
│   │   ├── 004_triggers.sql
│   │   ├── 005_seed_data.sql
│   │   └── README.md
│   ├── tests/
│   │   ├── config/         # Configuration tests
│   │   │   └── env.test.ts # Environment validation tests
│   │   ├── database/       # Database security tests
│   │   │   └── security.test.ts # RLS policy tests
│   │   ├── middleware/     # Middleware tests
│   │   │   ├── auth.test.ts # Authentication tests
│   │   │   ├── error.test.ts # Error handling tests
│   │   │   └── logger.test.ts # Logging tests
│   │   ├── routes/         # Route tests
│   │   │   ├── auth.test.ts # Authentication endpoint tests
│   │   │   ├── exercises.test.ts # Exercise CRUD endpoint tests
│   │   │   ├── workouts.test.ts # Workout CRUD endpoint tests
│   │   │   └── stats.test.ts # Statistics endpoint tests
│   │   └── health.test.ts  # API health tests
│   └── package.json
├── frontend/               # React + Vite app
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── config/         # Configuration
│   │   ├── pages/          # Page components
│   │   └── main.tsx        # Entry point
│   ├── tests/              # Test files
│   │   ├── setup.ts        # Test configuration (ResizeObserver mock)
│   │   └── App.test.tsx    # Component tests
│   └── package.json
└── docs/                   # Documentation
    ├── SETUP.md
    ├── ENV_SETUP.md
    ├── TESTING.md
    ├── ARCHITECTURE.md
    └── DATABASE.md
```

## Testing Philosophy

This project follows **Test-Driven Development (TDD)** principles:

- ✅ Tests are written FIRST, before implementation
- ✅ Tests are IMMUTABLE - never modify tests to pass code
- ✅ Code is modified to pass tests
- ✅ High coverage thresholds enforced (80%+)
- ✅ Parallel test execution for speed
- ✅ Strict type checking catches errors early

### Quick Test Reference

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

> **⚠️ Important**:
>
> - Always use `bun run test` (not `bun test`) to ensure Vitest is used
> - Some integration tests require the backend server to be running
> - See [Testing Guide](./docs/TESTING.md) for comprehensive testing documentation

### Test Suite Overview

**Backend**: Comprehensive test coverage across multiple categories:

- ✅ **Authentication Tests** (24 tests): Signup, login, logout, token refresh, profile
- ✅ **Exercise Management Tests** (27 tests): CRUD operations, filtering, authorization
- ✅ **Workout Management Tests** (30 tests): CRUD with nested sets, transactions
- ✅ **Statistics Tests** (27 tests): PRs, progress tracking, volume analysis
- ✅ **Database Security Tests** (26 tests): RLS policies, data isolation
- ✅ **Middleware Tests** (35 tests): Auth, error handling, logging, validation
- ✅ **Configuration Tests** (13 tests): Environment validation
- ✅ **Health Check Tests** (4 tests): API health endpoints

**Frontend**: Component and integration tests

- ✅ **Component Tests** (5 tests): React component rendering and behavior
- ✅ **Zero Warnings**: Clean test output with proper mocking

All tests pass with comprehensive error handling and proper isolation.

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
- **[API Reference](./docs/API.md)** - Complete API documentation with examples
- **[Database Schema](./docs/DATABASE.md)** - Complete database schema documentation with security and performance details
- **[Testing Guide](./docs/TESTING.md)** - Testing strategies, TDD workflow, and best practices
- **[Architecture](./docs/ARCHITECTURE.md)** - Project architecture and design decisions

## License

See [LICENSE](./LICENSE) file for details.
