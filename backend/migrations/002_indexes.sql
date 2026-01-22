-- Migration 002: Performance Indexes
-- Description: Creates all indexes for optimal query performance
-- Author: Database Schema Implementation
-- Date: 2026-01-21
-- ============================================================================
-- PROFILES TABLE INDEXES
-- ============================================================================
-- Primary key index is created automatically
-- Unique index on email is created automatically by UNIQUE constraint
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);
COMMENT ON INDEX idx_profiles_created_at IS 'For sorting users by registration date';
-- ============================================================================
-- USER METRICS TABLE INDEXES
-- ============================================================================
-- Composite index with user_id as leading column for time-series queries
CREATE INDEX IF NOT EXISTS idx_user_metrics_user_time ON user_metrics(user_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_metrics_user_id ON user_metrics(user_id);
COMMENT ON INDEX idx_user_metrics_user_time IS 'Primary index for fetching user metrics over time';
COMMENT ON INDEX idx_user_metrics_user_id IS 'For filtering metrics by user';
-- ============================================================================
-- EXERCISES TABLE INDEXES
-- ============================================================================
-- Composite index for user-created exercises
CREATE INDEX IF NOT EXISTS idx_exercises_user_id ON exercises(user_id)
WHERE user_id IS NOT NULL;
-- Index for filtering by category
CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises(category);
-- Partial index for public exercises (system and user-shared)
CREATE INDEX IF NOT EXISTS idx_exercises_public ON exercises(id, name, category)
WHERE is_public = TRUE;
-- Composite index for user exercise lookups
CREATE INDEX IF NOT EXISTS idx_exercises_user_name ON exercises(user_id, name);
-- GIN index for array searches (equipment and muscle groups)
CREATE INDEX IF NOT EXISTS idx_exercises_equipment ON exercises USING GIN(equipment_required);
CREATE INDEX IF NOT EXISTS idx_exercises_muscle_groups ON exercises USING GIN(muscle_groups);
COMMENT ON INDEX idx_exercises_user_id IS 'For filtering user-created exercises';
COMMENT ON INDEX idx_exercises_category IS 'For filtering exercises by category';
COMMENT ON INDEX idx_exercises_public IS 'Optimized for public exercise lookups';
COMMENT ON INDEX idx_exercises_equipment IS 'For searching exercises by equipment';
COMMENT ON INDEX idx_exercises_muscle_groups IS 'For searching exercises by muscle group';
-- ============================================================================
-- WORKOUTS TABLE INDEXES
-- ============================================================================
-- Composite index with user_id as leading column for time-series queries
CREATE INDEX IF NOT EXISTS idx_workouts_user_time ON workouts(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts(user_id);
-- Index for finding incomplete workouts
CREATE INDEX IF NOT EXISTS idx_workouts_incomplete ON workouts(user_id, started_at DESC)
WHERE completed_at IS NULL;
-- Index for completed workouts
CREATE INDEX IF NOT EXISTS idx_workouts_completed ON workouts(user_id, completed_at DESC)
WHERE completed_at IS NOT NULL;
COMMENT ON INDEX idx_workouts_user_time IS 'Primary index for fetching user workouts chronologically';
COMMENT ON INDEX idx_workouts_incomplete IS 'For finding in-progress workouts';
COMMENT ON INDEX idx_workouts_completed IS 'For fetching completed workout history';
-- ============================================================================
-- WORKOUT EXERCISES TABLE INDEXES
-- ============================================================================
-- Composite index for ordering exercises within a workout
CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout_order ON workout_exercises(workout_id, order_in_workout);
-- Index for reverse lookups (which workouts used this exercise)
CREATE INDEX IF NOT EXISTS idx_workout_exercises_exercise_id ON workout_exercises(exercise_id);
-- Index for workout_id (for JOIN operations)
CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout_id ON workout_exercises(workout_id);
COMMENT ON INDEX idx_workout_exercises_workout_order IS 'For fetching exercises in workout order';
COMMENT ON INDEX idx_workout_exercises_exercise_id IS 'For finding workouts that used a specific exercise';
-- ============================================================================
-- SETS TABLE INDEXES
-- ============================================================================
-- Composite index for ordering sets within a workout exercise
CREATE INDEX IF NOT EXISTS idx_sets_workout_exercise_order ON sets(workout_exercise_id, set_number);
-- Index for workout_exercise_id (for JOIN operations)
CREATE INDEX IF NOT EXISTS idx_sets_workout_exercise_id ON sets(workout_exercise_id);
-- Index for finding personal records (max weight, max reps, etc.)
CREATE INDEX IF NOT EXISTS idx_sets_weight ON sets(workout_exercise_id, weight_kg DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_sets_reps ON sets(workout_exercise_id, reps DESC NULLS LAST);
COMMENT ON INDEX idx_sets_workout_exercise_order IS 'For fetching sets in order';
COMMENT ON INDEX idx_sets_weight IS 'For finding max weight sets';
COMMENT ON INDEX idx_sets_reps IS 'For finding max rep sets';
-- ============================================================================
-- PERSONAL RECORDS TABLE INDEXES
-- ============================================================================
-- Composite index for user + exercise + record type lookups
CREATE INDEX IF NOT EXISTS idx_personal_records_user_exercise_type ON personal_records(user_id, exercise_id, record_type);
-- Index for user_id
CREATE INDEX IF NOT EXISTS idx_personal_records_user_id ON personal_records(user_id);
-- Index for exercise_id (reverse lookups)
CREATE INDEX IF NOT EXISTS idx_personal_records_exercise_id ON personal_records(exercise_id);
-- Index for finding recent records
CREATE INDEX IF NOT EXISTS idx_personal_records_user_achieved ON personal_records(user_id, achieved_at DESC);
COMMENT ON INDEX idx_personal_records_user_exercise_type IS 'Primary index for fetching specific records';
COMMENT ON INDEX idx_personal_records_user_achieved IS 'For fetching recent personal records';
-- ============================================================================
-- WORKOUT ROUTINES TABLE INDEXES
-- ============================================================================
-- Index for user-created routines
CREATE INDEX IF NOT EXISTS idx_workout_routines_user_id ON workout_routines(user_id)
WHERE user_id IS NOT NULL;
-- Partial index for public routines
CREATE INDEX IF NOT EXISTS idx_workout_routines_public ON workout_routines(id, name, difficulty_level)
WHERE is_public = TRUE;
-- Index for filtering by difficulty
CREATE INDEX IF NOT EXISTS idx_workout_routines_difficulty ON workout_routines(difficulty_level);
COMMENT ON INDEX idx_workout_routines_user_id IS 'For filtering user-created routines';
COMMENT ON INDEX idx_workout_routines_public IS 'Optimized for public routine lookups';
-- ============================================================================
-- ROUTINE EXERCISES TABLE INDEXES
-- ============================================================================
-- Composite index for ordering exercises within a routine
CREATE INDEX IF NOT EXISTS idx_routine_exercises_routine_order ON routine_exercises(routine_id, order_in_routine);
-- Index for reverse lookups (which routines use this exercise)
CREATE INDEX IF NOT EXISTS idx_routine_exercises_exercise_id ON routine_exercises(exercise_id);
-- Index for routine_id (for JOIN operations)
CREATE INDEX IF NOT EXISTS idx_routine_exercises_routine_id ON routine_exercises(routine_id);
COMMENT ON INDEX idx_routine_exercises_routine_order IS 'For fetching exercises in routine order';
COMMENT ON INDEX idx_routine_exercises_exercise_id IS 'For finding routines that use a specific exercise';
-- ============================================================================
-- GOALS TABLE INDEXES
-- ============================================================================
-- Composite index for user + status + target date
CREATE INDEX IF NOT EXISTS idx_goals_user_status_target ON goals(user_id, status, target_date);
-- Index for user_id
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
-- Partial index for active goals
CREATE INDEX IF NOT EXISTS idx_goals_active ON goals(user_id, target_date)
WHERE status = 'active';
-- Index for completed goals
CREATE INDEX IF NOT EXISTS idx_goals_completed ON goals(user_id, completed_at DESC)
WHERE status = 'completed';
COMMENT ON INDEX idx_goals_user_status_target IS 'Primary index for fetching goals by status';
COMMENT ON INDEX idx_goals_active IS 'Optimized for fetching active goals';
COMMENT ON INDEX idx_goals_completed IS 'For fetching completed goals chronologically';
-- ============================================================================
-- ANALYZE TABLES
-- ============================================================================
-- Update statistics for query planner
ANALYZE profiles;
ANALYZE user_metrics;
ANALYZE exercises;
ANALYZE workouts;
ANALYZE workout_exercises;
ANALYZE sets;
ANALYZE personal_records;
ANALYZE workout_routines;
ANALYZE routine_exercises;
ANALYZE goals;
-- ============================================================================
-- ROLLBACK INSTRUCTIONS
-- ============================================================================
-- To rollback this migration, run:
-- DROP INDEX IF EXISTS idx_goals_completed;
-- DROP INDEX IF EXISTS idx_goals_active;
-- DROP INDEX IF EXISTS idx_goals_user_id;
-- DROP INDEX IF EXISTS idx_goals_user_status_target;
-- DROP INDEX IF EXISTS idx_routine_exercises_routine_id;
-- DROP INDEX IF EXISTS idx_routine_exercises_exercise_id;
-- DROP INDEX IF EXISTS idx_routine_exercises_routine_order;
-- DROP INDEX IF EXISTS idx_workout_routines_difficulty;
-- DROP INDEX IF EXISTS idx_workout_routines_public;
-- DROP INDEX IF EXISTS idx_workout_routines_user_id;
-- DROP INDEX IF EXISTS idx_personal_records_user_achieved;
-- DROP INDEX IF EXISTS idx_personal_records_exercise_id;
-- DROP INDEX IF EXISTS idx_personal_records_user_id;
-- DROP INDEX IF EXISTS idx_personal_records_user_exercise_type;
-- DROP INDEX IF EXISTS idx_sets_reps;
-- DROP INDEX IF EXISTS idx_sets_weight;
-- DROP INDEX IF EXISTS idx_sets_workout_exercise_id;
-- DROP INDEX IF EXISTS idx_sets_workout_exercise_order;
-- DROP INDEX IF EXISTS idx_workout_exercises_workout_id;
-- DROP INDEX IF EXISTS idx_workout_exercises_exercise_id;
-- DROP INDEX IF EXISTS idx_workout_exercises_workout_order;
-- DROP INDEX IF EXISTS idx_workouts_completed;
-- DROP INDEX IF EXISTS idx_workouts_incomplete;
-- DROP INDEX IF EXISTS idx_workouts_user_id;
-- DROP INDEX IF EXISTS idx_workouts_user_time;
-- DROP INDEX IF EXISTS idx_exercises_muscle_groups;
-- DROP INDEX IF EXISTS idx_exercises_equipment;
-- DROP INDEX IF EXISTS idx_exercises_user_name;
-- DROP INDEX IF EXISTS idx_exercises_public;
-- DROP INDEX IF EXISTS idx_exercises_category;
-- DROP INDEX IF EXISTS idx_exercises_user_id;
-- DROP INDEX IF EXISTS idx_user_metrics_user_id;
-- DROP INDEX IF EXISTS idx_user_metrics_user_time;
-- DROP INDEX IF EXISTS idx_profiles_created_at;