-- Migration 001: Core Schema - Tables and Constraints
-- Description: Creates all core tables for the gym tracking application
-- Author: Database Schema Implementation
-- Date: 2026-01-21
-- ============================================================================
-- PROFILES TABLE
-- ============================================================================
-- User profile information extending Supabase Auth users
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (
        gender IN (
            'male',
            'female',
            'non-binary',
            'prefer-not-to-say',
            'other'
        )
    ),
    height_cm DECIMAL(5, 2) CHECK (
        height_cm > 0
        AND height_cm < 300
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE profiles IS 'User profile information extending Supabase Auth users';
COMMENT ON COLUMN profiles.id IS 'References auth.users(id), CASCADE delete when user is deleted';
COMMENT ON COLUMN profiles.height_cm IS 'Height in centimeters, must be between 0 and 300';
-- ============================================================================
-- USER METRICS TABLE
-- ============================================================================
-- Historical tracking of user biometric data
CREATE TABLE IF NOT EXISTS user_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    weight_kg DECIMAL(6, 2) CHECK (
        weight_kg > 0
        AND weight_kg < 1000
    ),
    body_fat_percentage DECIMAL(4, 2) CHECK (
        body_fat_percentage >= 0
        AND body_fat_percentage <= 100
    ),
    muscle_mass_kg DECIMAL(6, 2) CHECK (
        muscle_mass_kg > 0
        AND muscle_mass_kg < 1000
    ),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE user_metrics IS 'Historical tracking of user biometric data (weight, body fat, muscle mass)';
COMMENT ON COLUMN user_metrics.recorded_at IS 'When the measurement was taken';
-- ============================================================================
-- EXERCISES TABLE
-- ============================================================================
-- Master list of all available exercises (system and user-created)
CREATE TABLE IF NOT EXISTS exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (
        category IN (
            'strength',
            'cardio',
            'flexibility',
            'balance',
            'plyometric',
            'olympic',
            'powerlifting',
            'bodyweight',
            'other'
        )
    ),
    equipment_required TEXT [] DEFAULT '{}',
    muscle_groups TEXT [] DEFAULT '{}',
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT user_exercise_unique UNIQUE (user_id, name),
    CONSTRAINT system_exercise_check CHECK (
        (
            user_id IS NULL
            AND is_public = TRUE
        )
        OR (user_id IS NOT NULL)
    )
);
COMMENT ON TABLE exercises IS 'Master list of exercises (both system-defined and user-created)';
COMMENT ON COLUMN exercises.user_id IS 'NULL for system exercises, UUID for user-created exercises';
COMMENT ON COLUMN exercises.is_public IS 'System exercises are always public, user exercises can be made public';
COMMENT ON CONSTRAINT system_exercise_check ON exercises IS 'System exercises (user_id IS NULL) must be public';
-- ============================================================================
-- WORKOUTS TABLE
-- ============================================================================
-- Individual workout sessions logged by users
CREATE TABLE IF NOT EXISTS workouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    notes TEXT,
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    duration_minutes INTEGER CHECK (duration_minutes > 0),
    calories_burned INTEGER CHECK (calories_burned >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT workout_time_check CHECK (
        completed_at IS NULL
        OR completed_at >= started_at
    )
);
COMMENT ON TABLE workouts IS 'Individual workout sessions logged by users';
COMMENT ON COLUMN workouts.completed_at IS 'NULL if workout is in progress';
COMMENT ON CONSTRAINT workout_time_check ON workouts IS 'Completed time must be after start time';
-- ============================================================================
-- WORKOUT EXERCISES TABLE
-- ============================================================================
-- Linking table connecting workouts to exercises
CREATE TABLE IF NOT EXISTS workout_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE RESTRICT,
    order_in_workout INTEGER NOT NULL CHECK (order_in_workout > 0),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT workout_exercise_order_unique UNIQUE (workout_id, order_in_workout)
);
COMMENT ON TABLE workout_exercises IS 'Links workouts to exercises, represents which exercises were performed';
COMMENT ON COLUMN workout_exercises.order_in_workout IS 'Order of exercise in the workout (1-indexed)';
COMMENT ON CONSTRAINT workout_exercise_order_unique ON workout_exercises IS 'Each order position must be unique within a workout';
-- ============================================================================
-- SETS TABLE
-- ============================================================================
-- Individual sets performed within a workout exercise
CREATE TABLE IF NOT EXISTS sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_exercise_id UUID NOT NULL REFERENCES workout_exercises(id) ON DELETE CASCADE,
    set_number INTEGER NOT NULL CHECK (set_number > 0),
    reps INTEGER CHECK (reps > 0),
    weight_kg DECIMAL(6, 2) CHECK (weight_kg >= 0),
    duration_seconds INTEGER CHECK (duration_seconds > 0),
    distance_meters DECIMAL(8, 2) CHECK (distance_meters > 0),
    rpe INTEGER CHECK (
        rpe >= 1
        AND rpe <= 10
    ),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT set_order_unique UNIQUE (workout_exercise_id, set_number),
    CONSTRAINT set_data_check CHECK (
        reps IS NOT NULL
        OR duration_seconds IS NOT NULL
        OR distance_meters IS NOT NULL
    )
);
COMMENT ON TABLE sets IS 'Individual sets performed within a workout exercise';
COMMENT ON COLUMN sets.rpe IS 'Rate of Perceived Exertion (1-10 scale)';
COMMENT ON CONSTRAINT set_data_check ON sets IS 'At least one of reps, duration, or distance must be provided';
-- ============================================================================
-- PERSONAL RECORDS TABLE
-- ============================================================================
-- Tracks user's best performances for various exercises
CREATE TABLE IF NOT EXISTS personal_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE RESTRICT,
    record_type TEXT NOT NULL CHECK (
        record_type IN (
            'max_weight',
            'max_reps',
            'max_distance',
            'fastest_time',
            'max_volume',
            'longest_duration'
        )
    ),
    value DECIMAL(10, 2) NOT NULL CHECK (value > 0),
    unit TEXT NOT NULL CHECK (
        unit IN (
            'kg',
            'lbs',
            'reps',
            'meters',
            'km',
            'miles',
            'seconds',
            'minutes'
        )
    ),
    achieved_at TIMESTAMPTZ NOT NULL,
    set_id UUID REFERENCES sets(id) ON DELETE
    SET NULL,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT user_exercise_record_unique UNIQUE (user_id, exercise_id, record_type)
);
COMMENT ON TABLE personal_records IS 'Tracks user personal records for exercises';
COMMENT ON COLUMN personal_records.set_id IS 'Optional reference to the set that achieved this record';
COMMENT ON CONSTRAINT user_exercise_record_unique ON personal_records IS 'One record type per exercise per user';
-- ============================================================================
-- WORKOUT ROUTINES TABLE
-- ============================================================================
-- Pre-defined workout templates (system and user-created)
CREATE TABLE IF NOT EXISTS workout_routines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    difficulty_level TEXT CHECK (
        difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')
    ),
    estimated_duration_minutes INTEGER CHECK (estimated_duration_minutes > 0),
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT system_routine_check CHECK (
        (
            user_id IS NULL
            AND is_public = TRUE
        )
        OR (user_id IS NOT NULL)
    )
);
COMMENT ON TABLE workout_routines IS 'Pre-defined workout templates (both system and user-created)';
COMMENT ON COLUMN workout_routines.user_id IS 'NULL for system routines, UUID for user-created routines';
COMMENT ON CONSTRAINT system_routine_check ON workout_routines IS 'System routines (user_id IS NULL) must be public';
-- ============================================================================
-- ROUTINE EXERCISES TABLE
-- ============================================================================
-- Linking table defining which exercises are part of a routine
CREATE TABLE IF NOT EXISTS routine_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    routine_id UUID NOT NULL REFERENCES workout_routines(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE RESTRICT,
    order_in_routine INTEGER NOT NULL CHECK (order_in_routine > 0),
    suggested_sets INTEGER CHECK (suggested_sets > 0),
    suggested_reps INTEGER CHECK (suggested_reps > 0),
    suggested_weight_kg DECIMAL(6, 2) CHECK (suggested_weight_kg >= 0),
    suggested_duration_seconds INTEGER CHECK (suggested_duration_seconds > 0),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT routine_exercise_order_unique UNIQUE (routine_id, order_in_routine)
);
COMMENT ON TABLE routine_exercises IS 'Defines which exercises are part of a routine with suggested parameters';
COMMENT ON COLUMN routine_exercises.order_in_routine IS 'Order of exercise in the routine (1-indexed)';
-- ============================================================================
-- GOALS TABLE
-- ============================================================================
-- User fitness goals and progress tracking
CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    goal_type TEXT NOT NULL CHECK (
        goal_type IN (
            'weight_loss',
            'weight_gain',
            'muscle_gain',
            'strength',
            'endurance',
            'flexibility',
            'body_composition',
            'performance',
            'habit',
            'other'
        )
    ),
    target_value DECIMAL(10, 2),
    target_unit TEXT,
    current_value DECIMAL(10, 2),
    start_date DATE NOT NULL,
    target_date DATE,
    completed_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'active' CHECK (
        status IN ('active', 'completed', 'abandoned', 'paused')
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT goal_date_check CHECK (
        target_date IS NULL
        OR target_date >= start_date
    )
);
COMMENT ON TABLE goals IS 'User fitness goals and progress tracking';
COMMENT ON COLUMN goals.status IS 'Current status of the goal';
COMMENT ON CONSTRAINT goal_date_check ON goals IS 'Target date must be after start date';
-- ============================================================================
-- ROLLBACK INSTRUCTIONS
-- ============================================================================
-- To rollback this migration, run:
-- DROP TABLE IF EXISTS goals CASCADE;
-- DROP TABLE IF EXISTS routine_exercises CASCADE;
-- DROP TABLE IF EXISTS workout_routines CASCADE;
-- DROP TABLE IF EXISTS personal_records CASCADE;
-- DROP TABLE IF EXISTS sets CASCADE;
-- DROP TABLE IF EXISTS workout_exercises CASCADE;
-- DROP TABLE IF EXISTS workouts CASCADE;
-- DROP TABLE IF EXISTS exercises CASCADE;
-- DROP TABLE IF EXISTS user_metrics CASCADE;
-- DROP TABLE IF EXISTS profiles CASCADE;