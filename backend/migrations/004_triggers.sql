-- Migration 004: Triggers and Functions
-- Description: Creates triggers for automatic timestamp updates and data validation
-- Author: Database Schema Implementation
-- Date: 2026-01-21
-- ============================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================================
-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
COMMENT ON FUNCTION update_updated_at_column() IS 'Automatically updates updated_at column on row update';
-- ============================================================================
-- APPLY UPDATED_AT TRIGGERS TO TABLES
-- ============================================================================
CREATE TRIGGER update_profiles_updated_at BEFORE
UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exercises_updated_at BEFORE
UPDATE ON exercises FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workouts_updated_at BEFORE
UPDATE ON workouts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_personal_records_updated_at BEFORE
UPDATE ON personal_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workout_routines_updated_at BEFORE
UPDATE ON workout_routines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_goals_updated_at BEFORE
UPDATE ON goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- ============================================================================
-- WORKOUT DURATION CALCULATION FUNCTION
-- ============================================================================
-- Function to automatically calculate workout duration when completed
CREATE OR REPLACE FUNCTION calculate_workout_duration() RETURNS TRIGGER AS $$ BEGIN -- If workout is being completed and duration is not set, calculate it
    IF NEW.completed_at IS NOT NULL
    AND OLD.completed_at IS NULL
    AND NEW.duration_minutes IS NULL THEN NEW.duration_minutes = EXTRACT(
        EPOCH
        FROM (NEW.completed_at - NEW.started_at)
    ) / 60;
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
COMMENT ON FUNCTION calculate_workout_duration() IS 'Automatically calculates workout duration when completed';
CREATE TRIGGER calculate_workout_duration_trigger BEFORE
UPDATE ON workouts FOR EACH ROW EXECUTE FUNCTION calculate_workout_duration();
-- ============================================================================
-- PERSONAL RECORD AUTO-UPDATE FUNCTION
-- ============================================================================
-- Function to automatically update or create personal records when a new PR is achieved
CREATE OR REPLACE FUNCTION update_personal_record_on_set() RETURNS TRIGGER AS $$
DECLARE v_user_id UUID;
v_exercise_id UUID;
v_workout_id UUID;
v_existing_record RECORD;
BEGIN -- Get user_id and exercise_id from the set
SELECT w.user_id,
    we.exercise_id,
    we.workout_id INTO v_user_id,
    v_exercise_id,
    v_workout_id
FROM workout_exercises we
    JOIN workouts w ON w.id = we.workout_id
WHERE we.id = NEW.workout_exercise_id;
-- Check and update max weight record
IF NEW.weight_kg IS NOT NULL THEN
SELECT * INTO v_existing_record
FROM personal_records
WHERE user_id = v_user_id
    AND exercise_id = v_exercise_id
    AND record_type = 'max_weight';
IF v_existing_record IS NULL
OR NEW.weight_kg > v_existing_record.value THEN
INSERT INTO personal_records (
        user_id,
        exercise_id,
        record_type,
        value,
        unit,
        achieved_at,
        set_id
    )
VALUES (
        v_user_id,
        v_exercise_id,
        'max_weight',
        NEW.weight_kg,
        'kg',
        NOW(),
        NEW.id
    ) ON CONFLICT (user_id, exercise_id, record_type) DO
UPDATE
SET value = EXCLUDED.value,
    achieved_at = EXCLUDED.achieved_at,
    set_id = EXCLUDED.set_id,
    updated_at = NOW();
END IF;
END IF;
-- Check and update max reps record
IF NEW.reps IS NOT NULL THEN
SELECT * INTO v_existing_record
FROM personal_records
WHERE user_id = v_user_id
    AND exercise_id = v_exercise_id
    AND record_type = 'max_reps';
IF v_existing_record IS NULL
OR NEW.reps > v_existing_record.value THEN
INSERT INTO personal_records (
        user_id,
        exercise_id,
        record_type,
        value,
        unit,
        achieved_at,
        set_id
    )
VALUES (
        v_user_id,
        v_exercise_id,
        'max_reps',
        NEW.reps,
        'reps',
        NOW(),
        NEW.id
    ) ON CONFLICT (user_id, exercise_id, record_type) DO
UPDATE
SET value = EXCLUDED.value,
    achieved_at = EXCLUDED.achieved_at,
    set_id = EXCLUDED.set_id,
    updated_at = NOW();
END IF;
END IF;
-- Check and update max distance record
IF NEW.distance_meters IS NOT NULL THEN
SELECT * INTO v_existing_record
FROM personal_records
WHERE user_id = v_user_id
    AND exercise_id = v_exercise_id
    AND record_type = 'max_distance';
IF v_existing_record IS NULL
OR NEW.distance_meters > v_existing_record.value THEN
INSERT INTO personal_records (
        user_id,
        exercise_id,
        record_type,
        value,
        unit,
        achieved_at,
        set_id
    )
VALUES (
        v_user_id,
        v_exercise_id,
        'max_distance',
        NEW.distance_meters,
        'meters',
        NOW(),
        NEW.id
    ) ON CONFLICT (user_id, exercise_id, record_type) DO
UPDATE
SET value = EXCLUDED.value,
    achieved_at = EXCLUDED.achieved_at,
    set_id = EXCLUDED.set_id,
    updated_at = NOW();
END IF;
END IF;
-- Check and update longest duration record
IF NEW.duration_seconds IS NOT NULL THEN
SELECT * INTO v_existing_record
FROM personal_records
WHERE user_id = v_user_id
    AND exercise_id = v_exercise_id
    AND record_type = 'longest_duration';
IF v_existing_record IS NULL
OR NEW.duration_seconds > v_existing_record.value THEN
INSERT INTO personal_records (
        user_id,
        exercise_id,
        record_type,
        value,
        unit,
        achieved_at,
        set_id
    )
VALUES (
        v_user_id,
        v_exercise_id,
        'longest_duration',
        NEW.duration_seconds,
        'seconds',
        NOW(),
        NEW.id
    ) ON CONFLICT (user_id, exercise_id, record_type) DO
UPDATE
SET value = EXCLUDED.value,
    achieved_at = EXCLUDED.achieved_at,
    set_id = EXCLUDED.set_id,
    updated_at = NOW();
END IF;
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
COMMENT ON FUNCTION update_personal_record_on_set() IS 'Automatically updates personal records when a new PR is achieved in a set';
CREATE TRIGGER update_personal_record_trigger
AFTER
INSERT
    OR
UPDATE ON sets FOR EACH ROW EXECUTE FUNCTION update_personal_record_on_set();
-- ============================================================================
-- PROFILE CREATION TRIGGER
-- ============================================================================
-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION create_profile_for_user() RETURNS TRIGGER AS $$ BEGIN
INSERT INTO profiles (id, email, created_at, updated_at)
VALUES (NEW.id, NEW.email, NOW(), NOW()) ON CONFLICT (id) DO NOTHING;
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
COMMENT ON FUNCTION create_profile_for_user() IS 'Automatically creates a profile when a new user signs up';
-- Create trigger on auth.users table (if we have permission)
-- Note: This may require superuser permissions, so we'll handle it gracefully
DO $$ BEGIN CREATE TRIGGER on_auth_user_created
AFTER
INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION create_profile_for_user();
EXCEPTION
WHEN insufficient_privilege THEN RAISE NOTICE 'Insufficient privileges to create trigger on auth.users. Profile creation will need to be handled in application code.';
WHEN OTHERS THEN RAISE NOTICE 'Could not create trigger on auth.users: %. Profile creation will need to be handled in application code.',
SQLERRM;
END $$;
-- ============================================================================
-- ROLLBACK INSTRUCTIONS
-- ============================================================================
-- To rollback this migration, run:
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- DROP TRIGGER IF EXISTS update_personal_record_trigger ON sets;
-- DROP TRIGGER IF EXISTS calculate_workout_duration_trigger ON workouts;
-- DROP TRIGGER IF EXISTS update_goals_updated_at ON goals;
-- DROP TRIGGER IF EXISTS update_workout_routines_updated_at ON workout_routines;
-- DROP TRIGGER IF EXISTS update_personal_records_updated_at ON personal_records;
-- DROP TRIGGER IF EXISTS update_workouts_updated_at ON workouts;
-- DROP TRIGGER IF EXISTS update_exercises_updated_at ON exercises;
-- DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
-- DROP FUNCTION IF EXISTS create_profile_for_user();
-- DROP FUNCTION IF EXISTS update_personal_record_on_set();
-- DROP FUNCTION IF EXISTS calculate_workout_duration();
-- DROP FUNCTION IF EXISTS update_updated_at_column();