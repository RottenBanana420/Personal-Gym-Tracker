# Environment Setup Guide - Manual Steps Required

## Overview

Before you can run the application, you need to:

1. Create a Supabase project
2. Create `.env` files with your actual credentials
3. Verify the setup

## Step 1: Create Supabase Project

### 1.1 Sign Up / Log In

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" or "Sign in"
3. Sign up with GitHub, Google, or email

### 1.2 Create New Project

1. Click "New Project" button
2. Fill in the details:
   - **Name**: `personal-gym-tracker` (or any name you prefer)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your location
   - **Pricing Plan**: Free tier is fine for development
3. Click "Create new project"
4. Wait 2-3 minutes for project initialization

### 1.3 Get Your Credentials

Once your project is ready:

1. Go to **Project Settings** (gear icon in sidebar)
2. Click on **API** tab
3. You'll see:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **API Keys** section with:
     - `anon` `public` key (safe to use in frontend)
     - `service_role` `secret` key (NEVER expose in frontend!)

**Copy these values - you'll need them in the next step!**

## Step 2: Create Backend .env File

### 2.1 Navigate to Backend Directory

```bash
cd /Users/kusaihajuri/Projects/Personal-Gym-Tracker/backend
```

### 2.2 Create .env File

```bash
cp .env.example .env
```

### 2.3 Edit .env File

Open `backend/.env` in your editor and replace the placeholder values:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

**Replace:**

- `https://xxxxxxxxxxxxx.supabase.co` with your **Project URL**
- First `eyJhbG...` with your **anon public key**
- Second `eyJhbG...` with your **service_role secret key**

### 2.4 Verify Backend .env

Your `backend/.env` should look like:

```env
PORT=3000
NODE_ENV=development
SUPABASE_URL=https://abcdefghijklmnop.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MjQyMjQwMCwiZXhwIjoxOTU3OTk4NDAwfQ.abcdefghijklmnopqrstuvwxyz1234567890
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjQyNDIyNDAwLCJleHAiOjE5NTc5OTg0MDB9.abcdefghijklmnopqrstuvwxyz0987654321
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

## Step 3: Create Frontend .env File

### 3.1 Navigate to Frontend Directory

```bash
cd /Users/kusaihajuri/Projects/Personal-Gym-Tracker/frontend
```

### 3.2 Create .env File

```bash
cp .env.example .env
```

### 3.3 Edit .env File

Open `frontend/.env` in your editor:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# API Configuration
VITE_API_URL=http://localhost:3000
```

**Replace:**

- `https://xxxxxxxxxxxxx.supabase.co` with your **Project URL**
- `eyJhbG...` with your **anon public key** (same as backend)

**⚠️ IMPORTANT**:

- Only use the `anon` key in frontend (NOT the service_role key!)
- All frontend env vars must start with `VITE_`

### 3.4 Verify Frontend .env

Your `frontend/.env` should look like:

```env
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MjQyMjQwMCwiZXhwIjoxOTU3OTk4NDAwfQ.abcdefghijklmnopqrstuvwxyz1234567890
VITE_API_URL=http://localhost:3000
```

## Step 4: Verify Setup

### 4.1 Test Backend

```bash
cd /Users/kusaihajuri/Projects/Personal-Gym-Tracker/backend
bun run dev
```

You should see:

```
🚀 Server running on http://localhost:3000
```

**Test the health endpoint:**

```bash
# In a new terminal
curl http://localhost:3000/health
```

Expected response:

```json
{"status":"ok","timestamp":"2026-01-21T...","uptime":0.123}
```

### 4.2 Test Frontend

```bash
cd /Users/kusaihajuri/Projects/Personal-Gym-Tracker/frontend
bun run dev
```

You should see:

```
VITE v7.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

**Open in browser:** [http://localhost:5173](http://localhost:5173)

You should see the Personal Gym Tracker dashboard.

### 4.3 Run Tests

**Backend tests:**

```bash
cd /Users/kusaihajuri/Projects/Personal-Gym-Tracker/backend
bun run test
```

Expected: 4/4 tests passing

**Frontend tests:**

```bash
cd /Users/kusaihajuri/Projects/Personal-Gym-Tracker/frontend
bun run test
```

Expected: 5/5 tests passing

> **⚠️ Important**: Use `bun run test` (not `bun test`) to ensure Vitest runs correctly.

## Troubleshooting

### Issue: "Invalid environment variables"

**Cause**: Missing or incorrect values in `.env` file

**Solution**:

1. Check that `.env` file exists (not just `.env.example`)
2. Verify all values are filled in (no placeholder text)
3. Ensure no quotes around values
4. Restart the dev server after changing `.env`

### Issue: "SUPABASE_URL is not a valid URL"

**Cause**: Incorrect URL format

**Solution**:

- URL must start with `https://`
- URL must end with `.supabase.co`
- No trailing slashes
- Example: `https://abcdefghijklmnop.supabase.co`

### Issue: Frontend tests fail with "document is not defined"

**Cause**: Using Bun's native test runner instead of Vitest

**Solution**:

- Always use `bun run test` (which calls `bunx vitest run`)
- The package.json scripts are configured to use Vitest automatically
- See the [Testing Guide](./TESTING.md) for detailed explanation

### Issue: "Port 3000 already in use"

**Cause**: Another process is using port 3000

**Solution**:

1. Find and kill the process: `lsof -ti:3000 | xargs kill -9`
2. Or change the port in `backend/.env`: `PORT=3001`

### Issue: Can't connect to Supabase

**Cause**: Incorrect credentials or network issues

**Solution**:

1. Verify credentials are correct in Supabase dashboard
2. Check that your Supabase project is active (not paused)
3. Test connection manually:

   ```bash
   curl https://your-project.supabase.co/rest/v1/
   ```

## Security Checklist

- ✅ `.env` files are in `.gitignore` (already configured)
- ✅ Never commit `.env` files to git
- ✅ Only use `anon` key in frontend
- ✅ Keep `service_role` key secret (backend only)
- ✅ Use different credentials for production

## Quick Reference

### File Locations

- Backend env: `/Users/kusaihajuri/Projects/Personal-Gym-Tracker/backend/.env`
- Frontend env: `/Users/kusaihajuri/Projects/Personal-Gym-Tracker/frontend/.env`

### Commands

```bash
# Start backend
cd backend && bun run dev

# Start frontend  
cd frontend && bun run dev

# Run tests
cd backend && bun run test
cd frontend && bun run test
```

### Supabase Dashboard

- URL: [https://supabase.com/dashboard/project/YOUR_PROJECT_ID](https://supabase.com/dashboard/project/YOUR_PROJECT_ID)
- Settings → API (to get credentials)
- Table Editor (to create tables)
- SQL Editor (to run queries)

## Next Steps

Once your `.env` files are set up:

1. ✅ Backend and frontend should start without errors
2. ✅ Tests should pass
3. ✅ You can start building features!

For database schema setup, see the Supabase documentation or create tables through the Supabase dashboard.
