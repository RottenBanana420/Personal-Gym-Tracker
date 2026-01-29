# Environment Setup Guide

This guide provides detailed instructions for setting up environment variables for the Personal Gym Tracker application.

## Overview

The application requires environment variables for both backend and frontend:

- **Backend** (`.env`): Server configuration and Supabase credentials
- **Frontend** (`.env`): Supabase public credentials and API URL

## Prerequisites

Before setting up environment variables, you need:

1. ✅ A Supabase account ([sign up here](https://supabase.com))
2. ✅ A Supabase project created
3. ✅ Your Supabase credentials (URL and API keys)

## Getting Supabase Credentials

### Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click **"New Project"**
4. Fill in the details:
   - **Name**: `personal-gym-tracker` (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the closest region to you
   - **Pricing Plan**: Free tier works for development
5. Click **"Create new project"**
6. Wait 2-3 minutes for initialization

### Step 2: Get Your API Credentials

Once your project is ready:

1. Go to **Project Settings** (gear icon in the sidebar)
2. Click on the **API** tab
3. You'll see:
   - **Project URL** (e.g., `https://xxxxxxxxxxxxx.supabase.co`)
   - **API Keys**:
     - `anon` `public` key (safe for frontend)
     - `service_role` `secret` key (**NEVER** expose in frontend!)

**Copy these values** - you'll need them in the next steps.

## Backend Environment Setup

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Create .env File

```bash
cp .env.example .env
```

### 3. Edit .env File

Open `backend/.env` in your editor and fill in the values:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

**Replace**:

- `https://your-project-id.supabase.co` → Your **Project URL**
- First `eyJhbG...` → Your **anon public key**
- Second `eyJhbG...` → Your **service_role secret key**

### 4. Verify Backend Configuration

Test that your backend can connect to Supabase:

```bash
bun run dev
```

You should see:

```
🚀 Server running on http://localhost:3000
```

Test the health endpoint:

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{"status":"ok","timestamp":"...","uptime":...}
```

## Frontend Environment Setup

### 1. Navigate to Frontend Directory

```bash
cd frontend
```

### 2. Create .env File

```bash
cp .env.example .env
```

### 3. Edit .env File

Open `frontend/.env` in your editor:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# API Configuration
VITE_API_URL=http://localhost:3000
```

**Replace**:

- `https://your-project-id.supabase.co` → Your **Project URL** (same as backend)
- `eyJhbG...` → Your **anon public key** (same as backend)

> **⚠️ SECURITY WARNING**:
>
> - Only use the `anon` key in frontend (NOT the service_role key!)
> - All frontend environment variables MUST start with `VITE_`
> - Never commit `.env` files to version control

### 4. Verify Frontend Configuration

Start the frontend development server:

```bash
bun run dev
```

You should see:

```
VITE v7.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Environment Variables Reference

### Backend Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `PORT` | No | Server port | `3000` |
| `NODE_ENV` | No | Environment | `development` |
| `SUPABASE_URL` | **Yes** | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_ANON_KEY` | **Yes** | Supabase anon key | `eyJhbG...` |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes** | Supabase service role key | `eyJhbG...` |
| `ALLOWED_ORIGINS` | No | CORS allowed origins | `http://localhost:5173` |

### Frontend Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_SUPABASE_URL` | **Yes** | Supabase project URL | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | **Yes** | Supabase anon key | `eyJhbG...` |
| `VITE_API_URL` | **Yes** | Backend API URL | `http://localhost:3000` |

## Troubleshooting

### Issue: "Invalid environment variables"

**Cause**: Missing or incorrect values in `.env` file

**Solution**:

1. Verify `.env` file exists (not just `.env.example`)
2. Check all required variables are filled in
3. Ensure no quotes around values
4. Restart the dev server after changing `.env`

### Issue: "SUPABASE_URL is not a valid URL"

**Cause**: Incorrect URL format

**Solution**:

- URL must start with `https://`
- URL must end with `.supabase.co`
- No trailing slashes
- Example: `https://abcdefghijklmnop.supabase.co`

### Issue: "Cannot connect to Supabase"

**Cause**: Incorrect credentials or network issues

**Solution**:

1. Verify credentials in Supabase dashboard
2. Check that your Supabase project is active (not paused)
3. Test connection:

   ```bash
   curl https://your-project.supabase.co/rest/v1/
   ```

### Issue: "Port 3000 already in use"

**Cause**: Another process is using port 3000

**Solution**:

1. Find and kill the process: `lsof -ti:3000 | xargs kill -9`
2. Or change the port in `backend/.env`: `PORT=3001`

### Issue: Environment variables not loading

**Cause**: Variables not properly configured or server not restarted

**Solution**:

1. Ensure `.env` files are in the correct directories
2. Restart both backend and frontend servers
3. Check for typos in variable names
4. Verify no extra spaces or quotes

## Security Best Practices

- ✅ `.env` files are already in `.gitignore`
- ✅ Never commit `.env` files to version control
- ✅ Only use `anon` key in frontend code
- ✅ Keep `service_role` key secret (backend only)
- ✅ Use different credentials for production
- ✅ Rotate keys if accidentally exposed
- ✅ Enable Row Level Security (RLS) in Supabase

## Testing Your Setup

Once both `.env` files are configured:

```bash
# Test backend
cd backend
bun run test

# Test frontend
cd frontend
bun run test
```

All tests should pass if environment variables are correctly configured.

## Next Steps

After setting up environment variables:

1. ✅ Run database migrations (see [Database Guide](./DATABASE.md))
2. ✅ Start both backend and frontend servers
3. ✅ Run tests to verify everything works
4. ✅ Begin development!

For more information, see:

- [Setup Guide](./SETUP.md) - Complete setup instructions
- [Testing Guide](./TESTING.md) - Testing documentation
- [API Reference](./API.md) - API documentation
