# Setup Guide - Personal Gym Tracker

This guide will walk you through setting up the Personal Gym Tracker development environment from scratch.

## Prerequisites

### 1. Install Bun

Bun is a fast JavaScript runtime that we use for both backend and frontend development.

**macOS/Linux:**

```bash
curl -fsSL https://bun.sh/install | bash
```

**Verify installation:**

```bash
bun --version
# Should output: 1.3.6 or higher
```

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in project details:
   - Name: `personal-gym-tracker`
   - Database Password: (save this securely)
   - Region: (choose closest to you)
5. Wait for project to be created (~2 minutes)
6. Go to Project Settings → API
7. Copy the following values:
   - Project URL
   - `anon` public key
   - `service_role` secret key (keep this secure!)

## Environment Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd Personal-Gym-Tracker
```

### 2. Configure Environment Variables

Both backend and frontend require environment variables to connect to Supabase.

**Quick Setup:**

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

> **📖 For detailed environment setup instructions**, including how to obtain Supabase credentials and troubleshooting, see the [Environment Setup Guide](./ENV_GUIDE.md).

**Required Credentials:**

- Supabase Project URL
- Supabase Anon Key (for both backend and frontend)
- Supabase Service Role Key (backend only)

### 3. Frontend Environment

```bash
cd ../frontend
cp .env.example .env
```

Edit `frontend/.env` with your values:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_API_URL=http://localhost:3000
```

## Installing Dependencies

### Backend

```bash
cd backend
bun install
```

This installs:

- Hono (web framework)
- Supabase client
- Zod (validation)
- Vitest (testing)
- ESLint & Prettier (code quality)

### Frontend

```bash
cd frontend
bun install
```

This installs:

- React 19
- TailwindCSS v4
- Recharts
- Supabase client
- Vitest & React Testing Library
- ESLint & Prettier

## Running the Application

### Start Backend (Terminal 1)

```bash
cd backend
bun run dev
```

You should see:

```
🚀 Server running on http://localhost:3000
```

**Test it:**

```bash
curl http://localhost:3000/health
# Should return: {"status":"ok","timestamp":"...","uptime":...}
```

### Start Frontend (Terminal 2)

```bash
cd frontend
bun run dev
```

You should see:

```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

**Open in browser:** <http://localhost:5173>

You should see the Personal Gym Tracker dashboard with an example chart.

## Running Tests

### Backend Tests

```bash
cd backend
bun run test                # Run all tests
bun run test:watch          # Watch mode
bun run test:coverage       # With coverage report
```

### Frontend Tests

```bash
cd frontend
bun run test                # Run all tests
bun run test:watch          # Watch mode
bun run test:coverage       # With coverage report
```

> **⚠️ Important**: Always use `bun run test` (not `bun test`) to ensure Vitest is used with proper configuration. See the [Testing Guide](./TESTING.md) for more details.

## Code Quality

### Linting

```bash
# Backend
cd backend && bun run lint

# Frontend
cd frontend && bun run lint
```

### Formatting

```bash
# Backend
cd backend && bun run format

# Frontend
cd frontend && bun run format
```

### Type Checking

```bash
# Backend
cd backend && bun run type-check

# Frontend
cd frontend && bun run type-check
```

## Troubleshooting

### Port Already in Use

If port 3000 or 5173 is already in use:

**Backend:**
Edit `backend/.env` and change `PORT=3000` to another port.

**Frontend:**
Edit `frontend/vite.config.ts` and change the port in `server.port`.

### Environment Variables Not Loading

Make sure:

1. `.env` files exist (not just `.env.example`)
2. No typos in variable names
3. No quotes around values in `.env` files
4. Restart the dev server after changing `.env`

### TypeScript Errors

Run type checking to see all errors:

```bash
bun run type-check
```

Common fixes:

- Make sure all dependencies are installed
- Delete `node_modules` and reinstall: `rm -rf node_modules && bun install`

### Test Failures

If tests fail:

1. Make sure both backend and frontend dependencies are installed
2. Check that `.env` files are configured
3. Run tests with verbose output: `bun test --reporter=verbose`

## Next Steps

1. ✅ Environment is set up
2. ✅ Backend and frontend are running
3. ✅ Tests are passing

Now you can:

- Start building features
- Write tests first (TDD approach)
- Explore the codebase structure
- Read the [Testing Guide](./TESTING.md)
- Read the [Architecture Guide](./ARCHITECTURE.md)
