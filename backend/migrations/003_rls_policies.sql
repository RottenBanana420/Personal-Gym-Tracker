-- Migration 003: Row Level Security (RLS) Policies
-- Description: Enables RLS and creates policies for complete data isolation
-- Author: Database Schema Implementation
-- Date: 2026-01-21
-- ============================================================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
-- ============================================================================
-- PROFILES TABLE POLICIES
-- ============================================================================
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR
SELECT USING (auth.uid() = id);
-- Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile" ON profiles FOR
INSERT WITH CHECK (auth.uid() = id);
-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles FOR
UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
-- No DELETE policy - profiles are managed through auth system
-- ============================================================================
-- USER METRICS TABLE POLICIES
-- ============================================================================
-- Users can view their own metrics
CREATE POLICY "Users can view own metrics" ON user_metrics FOR
SELECT USING (auth.uid() = user_id);
-- Users can insert their own metrics
CREATE POLICY "Users can insert own metrics" ON user_metrics FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- Users can update their own metrics
CREATE POLICY "Users can update own metrics" ON user_metrics FOR
UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
-- Users can delete their own metrics
CREATE POLICY "Users can delete own metrics" ON user_metrics FOR DELETE USING (auth.uid() = user_id);
-- ============================================================================
-- EXERCISES TABLE POLICIES
-- ============================================================================
-- Users can view public exercises or their own exercises
CREATE POLICY "Users can view public or own exercises" ON exercises FOR
SELECT USING (
        is_public = TRUE
        OR auth.uid() = user_id
    );
-- Users can insert their own exercises
CREATE POLICY "Users can insert own exercises" ON exercises FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- Users can update their own exercises only
CREATE POLICY "Users can update own exercises" ON exercises FOR
UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
-- Users can delete their own exercises only
CREATE POLICY "Users can delete own exercises" ON exercises FOR DELETE USING (auth.uid() = user_id);
-- ============================================================================
-- WORKOUTS TABLE POLICIES
-- ============================================================================
-- Users can view their own workouts
CREATE POLICY "Users can view own workouts" ON workouts FOR
SELECT USING (auth.uid() = user_id);
-- Users can insert their own workouts
CREATE POLICY "Users can insert own workouts" ON workouts FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- Users can update their own workouts
CREATE POLICY "Users can update own workouts" ON workouts FOR
UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
-- Users can delete their own workouts
CREATE POLICY "Users can delete own workouts" ON workouts FOR DELETE USING (auth.uid() = user_id);
-- ============================================================================
-- WORKOUT EXERCISES TABLE POLICIES
-- ============================================================================
-- Users can view workout_exercises for their own workouts
CREATE POLICY "Users can view own workout exercises" ON workout_exercises FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM workouts
            WHERE workouts.id = workout_exercises.workout_id
                AND workouts.user_id = auth.uid()
        )
    );
-- Users can insert workout_exercises for their own workouts
CREATE POLICY "Users can insert own workout exercises" ON workout_exercises FOR
INSERT WITH CHECK (
        EXISTS (
            SELECT 1
            FROM workouts
            WHERE workouts.id = workout_exercises.workout_id
                AND workouts.user_id = auth.uid()
        )
    );
-- Users can update workout_exercises for their own workouts
CREATE POLICY "Users can update own workout exercises" ON workout_exercises FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM workouts
            WHERE workouts.id = workout_exercises.workout_id
                AND workouts.user_id = auth.uid()
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1
            FROM workouts
            WHERE workouts.id = workout_exercises.workout_id
                AND workouts.user_id = auth.uid()
        )
    );
-- Users can delete workout_exercises for their own workouts
CREATE POLICY "Users can delete own workout exercises" ON workout_exercises FOR DELETE USING (
    EXISTS (
        SELECT 1
        FROM workouts
        WHERE workouts.id = workout_exercises.workout_id
            AND workouts.user_id = auth.uid()
    )
);
-- ============================================================================
-- SETS TABLE POLICIES
-- ============================================================================
-- Users can view sets for their own workout exercises
CREATE POLICY "Users can view own sets" ON sets FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM workout_exercises we
                JOIN workouts w ON w.id = we.workout_id
            WHERE we.id = sets.workout_exercise_id
                AND w.user_id = auth.uid()
        )
    );
-- Users can insert sets for their own workout exercises
CREATE POLICY "Users can insert own sets" ON sets FOR
INSERT WITH CHECK (
        EXISTS (
            SELECT 1
            FROM workout_exercises we
                JOIN workouts w ON w.id = we.workout_id
            WHERE we.id = sets.workout_exercise_id
                AND w.user_id = auth.uid()
        )
    );
-- Users can update sets for their own workout exercises
CREATE POLICY "Users can update own sets" ON sets FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM workout_exercises we
                JOIN workouts w ON w.id = we.workout_id
            WHERE we.id = sets.workout_exercise_id
                AND w.user_id = auth.uid()
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1
            FROM workout_exercises we
                JOIN workouts w ON w.id = we.workout_id
            WHERE we.id = sets.workout_exercise_id
                AND w.user_id = auth.uid()
        )
    );
-- Users can delete sets for their own workout exercises
CREATE POLICY "Users can delete own sets" ON sets FOR DELETE USING (
    EXISTS (
        SELECT 1
        FROM workout_exercises we
            JOIN workouts w ON w.id = we.workout_id
        WHERE we.id = sets.workout_exercise_id
            AND w.user_id = auth.uid()
    )
);
-- ============================================================================
-- PERSONAL RECORDS TABLE POLICIES
-- ============================================================================
-- Users can view their own personal records
CREATE POLICY "Users can view own personal records" ON personal_records FOR
SELECT USING (auth.uid() = user_id);
-- Users can insert their own personal records
CREATE POLICY "Users can insert own personal records" ON personal_records FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- Users can update their own personal records
CREATE POLICY "Users can update own personal records" ON personal_records FOR
UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
-- Users can delete their own personal records
CREATE POLICY "Users can delete own personal records" ON personal_records FOR DELETE USING (auth.uid() = user_id);
-- ============================================================================
-- WORKOUT ROUTINES TABLE POLICIES
-- ============================================================================
-- Users can view public routines or their own routines
CREATE POLICY "Users can view public or own routines" ON workout_routines FOR
SELECT USING (
        is_public = TRUE
        OR auth.uid() = user_id
    );
-- Users can insert their own routines
CREATE POLICY "Users can insert own routines" ON workout_routines FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- Users can update their own routines only
CREATE POLICY "Users can update own routines" ON workout_routines FOR
UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
-- Users can delete their own routines only
CREATE POLICY "Users can delete own routines" ON workout_routines FOR DELETE USING (auth.uid() = user_id);
-- ============================================================================
-- ROUTINE EXERCISES TABLE POLICIES
-- ============================================================================
-- Users can view routine_exercises for public routines or their own routines
CREATE POLICY "Users can view public or own routine exercises" ON routine_exercises FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM workout_routines
            WHERE workout_routines.id = routine_exercises.routine_id
                AND (
                    workout_routines.is_public = TRUE
                    OR workout_routines.user_id = auth.uid()
                )
        )
    );
-- Users can insert routine_exercises for their own routines
CREATE POLICY "Users can insert own routine exercises" ON routine_exercises FOR
INSERT WITH CHECK (
        EXISTS (
            SELECT 1
            FROM workout_routines
            WHERE workout_routines.id = routine_exercises.routine_id
                AND workout_routines.user_id = auth.uid()
        )
    );
-- Users can update routine_exercises for their own routines
CREATE POLICY "Users can update own routine exercises" ON routine_exercises FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM workout_routines
            WHERE workout_routines.id = routine_exercises.routine_id
                AND workout_routines.user_id = auth.uid()
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1
            FROM workout_routines
            WHERE workout_routines.id = routine_exercises.routine_id
                AND workout_routines.user_id = auth.uid()
        )
    );
-- Users can delete routine_exercises for their own routines
CREATE POLICY "Users can delete own routine exercises" ON routine_exercises FOR DELETE USING (
    EXISTS (
        SELECT 1
        FROM workout_routines
        WHERE workout_routines.id = routine_exercises.routine_id
            AND workout_routines.user_id = auth.uid()
    )
);
-- ============================================================================
-- GOALS TABLE POLICIES
-- ============================================================================
-- Users can view their own goals
CREATE POLICY "Users can view own goals" ON goals FOR
SELECT USING (auth.uid() = user_id);
-- Users can insert their own goals
CREATE POLICY "Users can insert own goals" ON goals FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- Users can update their own goals
CREATE POLICY "Users can update own goals" ON goals FOR
UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
-- Users can delete their own goals
CREATE POLICY "Users can delete own goals" ON goals FOR DELETE USING (auth.uid() = user_id);
-- ============================================================================
-- ROLLBACK INSTRUCTIONS
-- ============================================================================
-- To rollback this migration, run:
-- DROP POLICY IF EXISTS "Users can delete own goals" ON goals;
-- DROP POLICY IF EXISTS "Users can update own goals" ON goals;
-- DROP POLICY IF EXISTS "Users can insert own goals" ON goals;
-- DROP POLICY IF EXISTS "Users can view own goals" ON goals;
-- DROP POLICY IF EXISTS "Users can delete own routine exercises" ON routine_exercises;
-- DROP POLICY IF EXISTS "Users can update own routine exercises" ON routine_exercises;
-- DROP POLICY IF EXISTS "Users can insert own routine exercises" ON routine_exercises;
-- DROP POLICY IF EXISTS "Users can view public or own routine exercises" ON routine_exercises;
-- DROP POLICY IF EXISTS "Users can delete own routines" ON workout_routines;
-- DROP POLICY IF EXISTS "Users can update own routines" ON workout_routines;
-- DROP POLICY IF EXISTS "Users can insert own routines" ON workout_routines;
-- DROP POLICY IF EXISTS "Users can view public or own routines" ON workout_routines;
-- DROP POLICY IF EXISTS "Users can delete own personal records" ON personal_records;
-- DROP POLICY IF EXISTS "Users can update own personal records" ON personal_records;
-- DROP POLICY IF EXISTS "Users can insert own personal records" ON personal_records;
-- DROP POLICY IF EXISTS "Users can view own personal records" ON personal_records;
-- DROP POLICY IF EXISTS "Users can delete own sets" ON sets;
-- DROP POLICY IF EXISTS "Users can update own sets" ON sets;
-- DROP POLICY IF EXISTS "Users can insert own sets" ON sets;
-- DROP POLICY IF EXISTS "Users can view own sets" ON sets;
-- DROP POLICY IF EXISTS "Users can delete own workout exercises" ON workout_exercises;
-- DROP POLICY IF EXISTS "Users can update own workout exercises" ON workout_exercises;
-- DROP POLICY IF EXISTS "Users can insert own workout exercises" ON workout_exercises;
-- DROP POLICY IF EXISTS "Users can view own workout exercises" ON workout_exercises;
-- DROP POLICY IF EXISTS "Users can delete own workouts" ON workouts;
-- DROP POLICY IF EXISTS "Users can update own workouts" ON workouts;
-- DROP POLICY IF EXISTS "Users can insert own workouts" ON workouts;
-- DROP POLICY IF EXISTS "Users can view own workouts" ON workouts;
-- DROP POLICY IF EXISTS "Users can delete own exercises" ON exercises;
-- DROP POLICY IF EXISTS "Users can update own exercises" ON exercises;
-- DROP POLICY IF EXISTS "Users can insert own exercises" ON exercises;
-- DROP POLICY IF EXISTS "Users can view public or own exercises" ON exercises;
-- DROP POLICY IF EXISTS "Users can delete own metrics" ON user_metrics;
-- DROP POLICY IF EXISTS "Users can update own metrics" ON user_metrics;
-- DROP POLICY IF EXISTS "Users can insert own metrics" ON user_metrics;
-- DROP POLICY IF EXISTS "Users can view own metrics" ON user_metrics;
-- DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
-- DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
-- DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
-- 
-- ALTER TABLE goals DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE routine_exercises DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE workout_routines DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE personal_records DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE sets DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE workout_exercises DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE workouts DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE exercises DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_metrics DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;