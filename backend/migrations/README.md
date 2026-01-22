# Database Migrations

This directory contains all database migrations for the Personal Gym Tracker application.

## Migration Files

| File | Description | Status |
|------|-------------|--------|
| `001_core_schema.sql` | Creates all 10 core tables with constraints | ✅ Applied |
| `002_indexes.sql` | Creates 40+ performance indexes | ✅ Applied |
| `003_rls_policies.sql` | Enables RLS and creates 40+ security policies | ✅ Applied |
| `004_triggers.sql` | Creates automatic triggers for updates and PRs | ✅ Applied |
| `005_seed_data.sql` | Seeds 32 exercises and 3 workout routines | ✅ Applied |

## Applying Migrations

Migrations have been applied to the Supabase project using the Supabase MCP server.

To apply migrations manually:

```bash
# Using Supabase CLI
supabase db push

# Or apply individual migrations
psql $DATABASE_URL < migrations/001_core_schema.sql
```

## Rollback Instructions

Each migration file includes rollback instructions in comments at the bottom of the file.

## Database Schema

### Core Tables

1. **profiles** - User profile information
2. **user_metrics** - Historical biometric data
3. **exercises** - Master exercise list
4. **workouts** - Workout sessions
5. **workout_exercises** - Workout-exercise linking
6. **sets** - Individual sets
7. **personal_records** - Personal records
8. **workout_routines** - Workout templates
9. **routine_exercises** - Routine-exercise linking
10. **goals** - Fitness goals

### Security

All tables have Row Level Security (RLS) enabled with comprehensive policies ensuring:

- Users can only access their own data
- Public resources (system exercises/routines) are accessible to all
- Nested resources are secured through JOIN-based policies

### Performance

Strategic indexing includes:

- Composite indexes with `user_id` as leading column
- Partial indexes for common filters
- GIN indexes for array searches
- Time-series indexes with DESC ordering

## Testing

See `backend/tests/database/` for comprehensive test suite including:

- Security tests (RLS verification)
- Data integrity tests
- Performance tests

Run tests:

```bash
cd backend
bun run test
```

## Documentation

See the [Database Documentation](../../docs/DATABASE.md) for complete schema and security details.
