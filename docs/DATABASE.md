# Database Schema Documentation

This document provides comprehensive information about the Personal Gym Tracker database schema.

## Overview

The database uses PostgreSQL (via Supabase) with a fully normalized schema designed for:

- **Multi-user support** with complete data isolation
- **High performance** through strategic indexing
- **Data integrity** via constraints and triggers
- **Security** through Row Level Security (RLS) policies

## Schema Architecture

### Multi-Tenancy Model

The application uses a **shared schema** approach where:

- All users share the same tables
- Data isolation is enforced through RLS policies at the database level
- Each user-specific table has a `user_id` column
- System resources (exercises, routines) have `user_id = NULL` and `is_public = TRUE`

### Tables

#### 1. `profiles`

User profile information extending Supabase Auth.

**Key Fields:**

- `id` (UUID, PK) - References `auth.users(id)`
- `email` (TEXT, UNIQUE)
- `full_name`, `date_of_birth`, `gender`, `height_cm`

**Relationships:**

- CASCADE delete when auth user is deleted
- Referenced by all user-specific tables

#### 2. `user_metrics`

Historical biometric data tracking.

**Key Fields:**

- `user_id` (UUID, FK → profiles)
- `weight_kg`, `body_fat_percentage`, `muscle_mass_kg`
- `recorded_at` (TIMESTAMPTZ)

**Indexes:**

- `(user_id, recorded_at DESC)` - Chronological metrics

#### 3. `exercises`

Master exercise library (system + user-created).

**Key Fields:**

- `user_id` (UUID, FK → profiles, NULLABLE)
- `name`, `description`, `category`
- `equipment_required` (TEXT[])
- `muscle_groups` (TEXT[])
- `is_public` (BOOLEAN)

**Constraints:**

- System exercises: `user_id IS NULL AND is_public = TRUE`
- User exercises: `user_id IS NOT NULL`

**Indexes:**

- GIN index on `equipment_required` and `muscle_groups` for array searches
- Partial index on `is_public = TRUE` for system exercises

#### 4. `workouts`

Individual workout sessions.

**Key Fields:**

- `user_id` (UUID, FK → profiles)
- `name`, `notes`
- `started_at`, `completed_at` (TIMESTAMPTZ)
- `duration_minutes` (auto-calculated)

**Indexes:**

- `(user_id, started_at DESC)` - Recent workouts
- Partial index on incomplete workouts

#### 5. `workout_exercises`

Links exercises to workouts.

**Key Fields:**

- `workout_id` (UUID, FK → workouts)
- `exercise_id` (UUID, FK → exercises)
- `order_in_workout` (INTEGER)

**Cascade:**

- Deleted when workout is deleted

#### 6. `sets`

Detailed set data.

**Key Fields:**

- `workout_exercise_id` (UUID, FK → workout_exercises)
- `set_number`, `reps`, `weight_kg`
- `duration_seconds`, `distance_meters`
- `rpe` (Rate of Perceived Exertion, 1-10)

**Constraints:**

- At least one of: `reps`, `duration_seconds`, or `distance_meters` must be set

**Triggers:**

- Automatically creates/updates personal records when new PRs achieved

#### 7. `personal_records`

User personal bests (auto-tracked).

**Key Fields:**

- `user_id` (UUID, FK → profiles)
- `exercise_id` (UUID, FK → exercises)
- `record_type` (max_weight, max_reps, max_distance, longest_duration)
- `value`, `unit`
- `achieved_at` (TIMESTAMPTZ)

**Constraints:**

- UNIQUE `(user_id, exercise_id, record_type)`

**Auto-tracking:**

- Trigger automatically updates when sets are inserted/updated

#### 8. `workout_routines`

Pre-defined workout templates.

**Key Fields:**

- `user_id` (UUID, FK → profiles, NULLABLE)
- `name`, `description`
- `difficulty_level` (beginner, intermediate, advanced, expert)
- `is_public` (BOOLEAN)

**System Routines:**

- 3 beginner routines included in seed data

#### 9. `routine_exercises`

Links exercises to routines.

**Key Fields:**

- `routine_id` (UUID, FK → workout_routines)
- `exercise_id` (UUID, FK → exercises)
- `order_in_routine`, `suggested_sets`, `suggested_reps`

#### 10. `goals`

User fitness goals and progress tracking.

**Key Fields:**

- `user_id` (UUID, FK → profiles)
- `title`, `description`, `goal_type`
- `start_date`, `target_date`, `completed_at`
- `status` (active, completed, abandoned, paused)

## Security (Row Level Security)

### RLS Policies

All tables have RLS enabled with comprehensive policies:

**Direct User Ownership:**

```sql
-- Example: workouts table
CREATE POLICY "Users can view own workouts" ON workouts
  FOR SELECT USING (auth.uid() = user_id);
```

**Public Resource Access:**

```sql
-- Example: exercises table
CREATE POLICY "Users can view public or own exercises" ON exercises
  FOR SELECT USING (is_public = TRUE OR auth.uid() = user_id);
```

**Nested Resource Security:**

```sql
-- Example: sets table (secured through workout ownership)
CREATE POLICY "Users can view own sets" ON sets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workout_exercises we
      JOIN workouts w ON w.id = we.workout_id
      WHERE we.id = sets.workout_exercise_id
      AND w.user_id = auth.uid()
    )
  );
```

### Policy Coverage

- ✅ 40+ RLS policies across all tables
- ✅ Policies for SELECT, INSERT, UPDATE, DELETE
- ✅ 26 security tests verifying complete data isolation
- ✅ Zero cross-user data leakage

## Performance

### Indexing Strategy

**Composite Indexes** (user_id as leading column):

```sql
CREATE INDEX idx_workouts_user_time ON workouts(user_id, started_at DESC);
CREATE INDEX idx_personal_records_user_exercise_type ON personal_records(user_id, exercise_id, record_type);
```

**Partial Indexes** (for filtered queries):

```sql
CREATE INDEX idx_workouts_incomplete ON workouts(user_id, started_at DESC) WHERE completed_at IS NULL;
CREATE INDEX idx_exercises_public ON exercises(id, name, category) WHERE is_public = TRUE;
```

**GIN Indexes** (for array searches):

```sql
CREATE INDEX idx_exercises_equipment ON exercises USING GIN(equipment_required);
CREATE INDEX idx_exercises_muscle_groups ON exercises USING GIN(muscle_groups);
```

### Expected Performance

- Fetch user's recent workouts: **<50ms**
- Fetch workout with exercises and sets: **<100ms**
- Fetch personal records: **<50ms**
- Search exercises by equipment: **<100ms**

## Triggers and Automation

### 1. Timestamp Updates

Automatically updates `updated_at` on all tables:

```sql
CREATE TRIGGER update_workouts_updated_at
  BEFORE UPDATE ON workouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 2. Workout Duration Calculation

Auto-calculates duration when workout is completed:

```sql
CREATE TRIGGER calculate_workout_duration_trigger
  BEFORE UPDATE ON workouts
  FOR EACH ROW EXECUTE FUNCTION calculate_workout_duration();
```

### 3. Personal Record Tracking

Automatically creates/updates personal records when new PRs achieved:

```sql
CREATE TRIGGER update_personal_record_trigger
  AFTER INSERT OR UPDATE ON sets
  FOR EACH ROW EXECUTE FUNCTION update_personal_record_on_set();
```

### 4. Profile Creation

Auto-creates profile when user signs up (if permissions allow):

```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_profile_for_user();
```

## Migrations

### Migration Files

Located in `backend/migrations/`:

1. **001_core_schema.sql** - All 10 tables with constraints
2. **002_indexes.sql** - 40+ performance indexes
3. **003_rls_policies.sql** - Row Level Security policies
4. **004_triggers.sql** - Automatic triggers and functions
5. **005_seed_data.sql** - 32 system exercises + 3 routines

### Applying Migrations

Migrations have been applied using the Supabase MCP server:

```bash
# Via Supabase MCP
mcp_supabase-mcp-server_apply_migration(project_id, name, query)
```

### Rollback

Each migration includes rollback instructions in comments:

```sql
-- To rollback this migration, run:
-- DROP TABLE IF EXISTS table_name CASCADE;
```

## Seed Data

### System Exercises (32 total)

**Strength Training (14):**

- Barbell: Back Squat, Bench Press, Deadlift, Overhead Press, Row, Front Squat, Romanian Deadlift
- Dumbbell: Bench Press, Shoulder Press, Row, Goblet Squat, Lunges, Bicep Curl, Lateral Raise

**Bodyweight (6):**

- Pull-ups, Push-ups, Dips, Bodyweight Squats, Plank, Hanging Leg Raises

**Cardio (6):**

- Running, Cycling, Rowing, Jump Rope, Swimming, Elliptical

**Olympic Lifts (3):**

- Clean and Jerk, Snatch, Power Clean

**Flexibility (3):**

- Yoga Flow, Static Stretching, Foam Rolling

### System Routines (3)

1. **Beginner Full Body A** - Squat, Bench, Row, Plank
2. **Beginner Full Body B** - Deadlift, OHP, Pull-ups, Push-ups
3. **Beginner Cardio** - Cycling + Rowing

## Testing

### Security Tests

26 comprehensive tests verify RLS policies:

**Test Coverage:**

- ✅ Profiles table (2 tests)
- ✅ User metrics table (5 tests)
- ✅ Exercises table (4 tests)
- ✅ Workouts table (4 tests)
- ✅ Nested resources - Sets (4 tests)
- ✅ Personal records (4 tests)
- ✅ Goals (4 tests)

**Test Strategy:**

1. Create two test users (User A and User B)
2. User A creates data
3. User B attempts to access/modify User A's data
4. All attempts should return empty arrays or null

**Critical:** These tests are designed to **FAIL** if RLS is broken!

### Running Tests

```bash
cd backend
bun run test tests/database/security.test.ts
```

Expected output:

```
Test Files  1 passed (1)
Tests  26 passed (26)
```

## Best Practices

### For Developers

1. **Never modify test files** - Tests are immutable, fix the schema/policies instead
2. **Always use migrations** - Don't make manual schema changes
3. **Test RLS policies** - Run security tests after any schema changes
4. **Use indexes wisely** - Profile queries before adding indexes
5. **Leverage triggers** - Automate repetitive tasks (timestamps, PRs)

### For Queries

1. **Always filter by user_id** - Leverage composite indexes
2. **Use prepared statements** - Prevent SQL injection
3. **Limit result sets** - Use LIMIT and pagination
4. **Explain analyze** - Profile slow queries
5. **Batch operations** - Use transactions for multiple inserts

## Troubleshooting

### Common Issues

**Issue:** Tests failing with "supabaseUrl is required"
**Solution:** Ensure `.env.test` has correct Supabase credentials

**Issue:** User creation fails with "Database error"
**Solution:** Check profile creation trigger has proper permissions

**Issue:** RLS blocking legitimate queries
**Solution:** Verify `auth.uid()` matches `user_id` in policies

**Issue:** Slow queries
**Solution:** Run `EXPLAIN ANALYZE` and check index usage

## Future Enhancements

Potential schema improvements:

- [ ] Add `workout_templates` for saving custom workout structures
- [ ] Add `exercise_history` for tracking exercise progression
- [ ] Add `body_measurements` for detailed body composition tracking
- [ ] Add `nutrition_logs` for diet tracking
- [ ] Add `workout_sharing` for social features
- [ ] Add `exercise_videos` for form guidance
- [ ] Add `workout_analytics` materialized views for performance

## References

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Indexing Best Practices](https://www.postgresql.org/docs/current/indexes.html)
- [Database Normalization](https://en.wikipedia.org/wiki/Database_normalization)
