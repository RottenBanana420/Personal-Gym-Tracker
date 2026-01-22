# Personal Gym Tracker

A full-stack gym tracking application built with modern technologies and best practices.

## Tech Stack

### Backend

- **Runtime**: Bun v1.3+ (fast JavaScript runtime)
- **Framework**: Hono (ultrafast web framework)
- **Database**: Supabase (PostgreSQL)
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
│   ├── tests/              # Test files
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
- **[Environment Setup](./docs/ENV_SETUP.md)** - Detailed environment variable configuration
- **[Testing Guide](./docs/TESTING.md)** - Testing strategies, TDD workflow, and best practices
- **[Architecture](./docs/ARCHITECTURE.md)** - Project architecture and design decisions

## License

See [LICENSE](./LICENSE) file for details.
