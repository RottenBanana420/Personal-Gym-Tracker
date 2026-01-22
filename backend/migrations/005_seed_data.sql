-- Migration 005: Seed Data
-- Description: Inserts system exercises and workout routines
-- Author: Database Schema Implementation
-- Date: 2026-01-21
-- ============================================================================
-- SYSTEM EXERCISES - STRENGTH TRAINING
-- ============================================================================
INSERT INTO exercises (
        user_id,
        name,
        description,
        category,
        equipment_required,
        muscle_groups,
        is_public
    )
VALUES -- Barbell Exercises
    (
        NULL,
        'Barbell Back Squat',
        'Compound lower body exercise targeting quads, glutes, and hamstrings',
        'strength',
        ARRAY ['barbell', 'squat rack'],
        ARRAY ['quadriceps', 'glutes', 'hamstrings', 'core'],
        TRUE
    ),
    (
        NULL,
        'Barbell Bench Press',
        'Compound upper body exercise targeting chest, shoulders, and triceps',
        'strength',
        ARRAY ['barbell', 'bench'],
        ARRAY ['chest', 'shoulders', 'triceps'],
        TRUE
    ),
    (
        NULL,
        'Barbell Deadlift',
        'Compound full-body exercise targeting posterior chain',
        'strength',
        ARRAY ['barbell'],
        ARRAY ['hamstrings', 'glutes', 'lower back', 'traps', 'forearms'],
        TRUE
    ),
    (
        NULL,
        'Barbell Overhead Press',
        'Compound shoulder exercise',
        'strength',
        ARRAY ['barbell'],
        ARRAY ['shoulders', 'triceps', 'core'],
        TRUE
    ),
    (
        NULL,
        'Barbell Row',
        'Compound back exercise',
        'strength',
        ARRAY ['barbell'],
        ARRAY ['lats', 'rhomboids', 'traps', 'biceps'],
        TRUE
    ),
    (
        NULL,
        'Barbell Front Squat',
        'Quad-dominant squat variation',
        'strength',
        ARRAY ['barbell', 'squat rack'],
        ARRAY ['quadriceps', 'core', 'upper back'],
        TRUE
    ),
    (
        NULL,
        'Barbell Romanian Deadlift',
        'Hamstring and glute focused deadlift variation',
        'strength',
        ARRAY ['barbell'],
        ARRAY ['hamstrings', 'glutes', 'lower back'],
        TRUE
    ),
    -- Dumbbell Exercises
    (
        NULL,
        'Dumbbell Bench Press',
        'Chest exercise with greater range of motion than barbell',
        'strength',
        ARRAY ['dumbbells', 'bench'],
        ARRAY ['chest', 'shoulders', 'triceps'],
        TRUE
    ),
    (
        NULL,
        'Dumbbell Shoulder Press',
        'Shoulder exercise allowing independent arm movement',
        'strength',
        ARRAY ['dumbbells'],
        ARRAY ['shoulders', 'triceps'],
        TRUE
    ),
    (
        NULL,
        'Dumbbell Row',
        'Unilateral back exercise',
        'strength',
        ARRAY ['dumbbells', 'bench'],
        ARRAY ['lats', 'rhomboids', 'biceps'],
        TRUE
    ),
    (
        NULL,
        'Dumbbell Goblet Squat',
        'Beginner-friendly squat variation',
        'strength',
        ARRAY ['dumbbell'],
        ARRAY ['quadriceps', 'glutes', 'core'],
        TRUE
    ),
    (
        NULL,
        'Dumbbell Lunges',
        'Unilateral leg exercise',
        'strength',
        ARRAY ['dumbbells'],
        ARRAY ['quadriceps', 'glutes', 'hamstrings'],
        TRUE
    ),
    (
        NULL,
        'Dumbbell Bicep Curl',
        'Isolation exercise for biceps',
        'strength',
        ARRAY ['dumbbells'],
        ARRAY ['biceps'],
        TRUE
    ),
    (
        NULL,
        'Dumbbell Lateral Raise',
        'Isolation exercise for side delts',
        'strength',
        ARRAY ['dumbbells'],
        ARRAY ['shoulders'],
        TRUE
    ),
    -- Bodyweight Exercises
    (
        NULL,
        'Pull-ups',
        'Bodyweight back and bicep exercise',
        'bodyweight',
        ARRAY ['pull-up bar'],
        ARRAY ['lats', 'biceps', 'core'],
        TRUE
    ),
    (
        NULL,
        'Push-ups',
        'Bodyweight chest and tricep exercise',
        'bodyweight',
        ARRAY [],
        ARRAY ['chest', 'triceps', 'shoulders', 'core'],
        TRUE
    ),
    (
        NULL,
        'Dips',
        'Bodyweight tricep and chest exercise',
        'bodyweight',
        ARRAY ['dip bars'],
        ARRAY ['triceps', 'chest', 'shoulders'],
        TRUE
    ),
    (
        NULL,
        'Bodyweight Squats',
        'Basic bodyweight leg exercise',
        'bodyweight',
        ARRAY [],
        ARRAY ['quadriceps', 'glutes', 'hamstrings'],
        TRUE
    ),
    (
        NULL,
        'Plank',
        'Isometric core exercise',
        'bodyweight',
        ARRAY [],
        ARRAY ['core', 'shoulders'],
        TRUE
    ),
    (
        NULL,
        'Hanging Leg Raises',
        'Advanced core exercise',
        'bodyweight',
        ARRAY ['pull-up bar'],
        ARRAY ['core', 'hip flexors'],
        TRUE
    );
-- ============================================================================
-- SYSTEM EXERCISES - CARDIO
-- ============================================================================
INSERT INTO exercises (
        user_id,
        name,
        description,
        category,
        equipment_required,
        muscle_groups,
        is_public
    )
VALUES (
        NULL,
        'Running',
        'Outdoor or treadmill running',
        'cardio',
        ARRAY [],
        ARRAY ['legs', 'cardiovascular'],
        TRUE
    ),
    (
        NULL,
        'Cycling',
        'Outdoor or stationary bike cycling',
        'cardio',
        ARRAY ['bike'],
        ARRAY ['legs', 'cardiovascular'],
        TRUE
    ),
    (
        NULL,
        'Rowing',
        'Full-body cardio on rowing machine',
        'cardio',
        ARRAY ['rowing machine'],
        ARRAY ['legs', 'back', 'arms', 'cardiovascular'],
        TRUE
    ),
    (
        NULL,
        'Jump Rope',
        'High-intensity cardio exercise',
        'cardio',
        ARRAY ['jump rope'],
        ARRAY ['calves', 'cardiovascular'],
        TRUE
    ),
    (
        NULL,
        'Swimming',
        'Full-body low-impact cardio',
        'cardio',
        ARRAY [],
        ARRAY ['full body', 'cardiovascular'],
        TRUE
    ),
    (
        NULL,
        'Elliptical',
        'Low-impact cardio machine',
        'cardio',
        ARRAY ['elliptical'],
        ARRAY ['legs', 'cardiovascular'],
        TRUE
    );
-- ============================================================================
-- SYSTEM EXERCISES - OLYMPIC LIFTS
-- ============================================================================
INSERT INTO exercises (
        user_id,
        name,
        description,
        category,
        equipment_required,
        muscle_groups,
        is_public
    )
VALUES (
        NULL,
        'Clean and Jerk',
        'Olympic weightlifting movement',
        'olympic',
        ARRAY ['barbell'],
        ARRAY ['full body', 'explosive power'],
        TRUE
    ),
    (
        NULL,
        'Snatch',
        'Olympic weightlifting movement',
        'olympic',
        ARRAY ['barbell'],
        ARRAY ['full body', 'explosive power'],
        TRUE
    ),
    (
        NULL,
        'Power Clean',
        'Explosive pulling exercise',
        'olympic',
        ARRAY ['barbell'],
        ARRAY ['legs', 'back', 'traps', 'explosive power'],
        TRUE
    );
-- ============================================================================
-- SYSTEM EXERCISES - FLEXIBILITY
-- ============================================================================
INSERT INTO exercises (
        user_id,
        name,
        description,
        category,
        equipment_required,
        muscle_groups,
        is_public
    )
VALUES (
        NULL,
        'Yoga Flow',
        'Dynamic yoga sequence',
        'flexibility',
        ARRAY ['yoga mat'],
        ARRAY ['full body', 'flexibility'],
        TRUE
    ),
    (
        NULL,
        'Static Stretching',
        'Hold stretches for flexibility',
        'flexibility',
        ARRAY [],
        ARRAY ['full body', 'flexibility'],
        TRUE
    ),
    (
        NULL,
        'Foam Rolling',
        'Self-myofascial release',
        'flexibility',
        ARRAY ['foam roller'],
        ARRAY ['full body', 'recovery'],
        TRUE
    );
-- ============================================================================
-- SYSTEM WORKOUT ROUTINES - BEGINNER
-- ============================================================================
INSERT INTO workout_routines (
        user_id,
        name,
        description,
        difficulty_level,
        estimated_duration_minutes,
        is_public
    )
VALUES (
        NULL,
        'Beginner Full Body A',
        'Full body workout for beginners focusing on compound movements',
        'beginner',
        45,
        TRUE
    ),
    (
        NULL,
        'Beginner Full Body B',
        'Alternate full body workout for beginners',
        'beginner',
        45,
        TRUE
    ),
    (
        NULL,
        'Beginner Cardio',
        'Low-impact cardio routine for beginners',
        'beginner',
        30,
        TRUE
    );
-- Get the routine IDs for inserting exercises
DO $$
DECLARE routine_full_body_a_id UUID;
routine_full_body_b_id UUID;
routine_cardio_id UUID;
exercise_squat_id UUID;
exercise_bench_id UUID;
exercise_row_id UUID;
exercise_ohp_id UUID;
exercise_deadlift_id UUID;
exercise_pullup_id UUID;
exercise_pushup_id UUID;
exercise_plank_id UUID;
exercise_cycling_id UUID;
exercise_rowing_id UUID;
BEGIN -- Get routine IDs
SELECT id INTO routine_full_body_a_id
FROM workout_routines
WHERE name = 'Beginner Full Body A'
    AND user_id IS NULL;
SELECT id INTO routine_full_body_b_id
FROM workout_routines
WHERE name = 'Beginner Full Body B'
    AND user_id IS NULL;
SELECT id INTO routine_cardio_id
FROM workout_routines
WHERE name = 'Beginner Cardio'
    AND user_id IS NULL;
-- Get exercise IDs
SELECT id INTO exercise_squat_id
FROM exercises
WHERE name = 'Barbell Back Squat'
    AND user_id IS NULL;
SELECT id INTO exercise_bench_id
FROM exercises
WHERE name = 'Barbell Bench Press'
    AND user_id IS NULL;
SELECT id INTO exercise_row_id
FROM exercises
WHERE name = 'Barbell Row'
    AND user_id IS NULL;
SELECT id INTO exercise_ohp_id
FROM exercises
WHERE name = 'Barbell Overhead Press'
    AND user_id IS NULL;
SELECT id INTO exercise_deadlift_id
FROM exercises
WHERE name = 'Barbell Deadlift'
    AND user_id IS NULL;
SELECT id INTO exercise_pullup_id
FROM exercises
WHERE name = 'Pull-ups'
    AND user_id IS NULL;
SELECT id INTO exercise_pushup_id
FROM exercises
WHERE name = 'Push-ups'
    AND user_id IS NULL;
SELECT id INTO exercise_plank_id
FROM exercises
WHERE name = 'Plank'
    AND user_id IS NULL;
SELECT id INTO exercise_cycling_id
FROM exercises
WHERE name = 'Cycling'
    AND user_id IS NULL;
SELECT id INTO exercise_rowing_id
FROM exercises
WHERE name = 'Rowing'
    AND user_id IS NULL;
-- Full Body A routine exercises
INSERT INTO routine_exercises (
        routine_id,
        exercise_id,
        order_in_routine,
        suggested_sets,
        suggested_reps,
        notes
    )
VALUES (
        routine_full_body_a_id,
        exercise_squat_id,
        1,
        3,
        8,
        'Focus on form, start with light weight'
    ),
    (
        routine_full_body_a_id,
        exercise_bench_id,
        2,
        3,
        8,
        'Control the descent, explosive push'
    ),
    (
        routine_full_body_a_id,
        exercise_row_id,
        3,
        3,
        8,
        'Pull to lower chest, squeeze shoulder blades'
    ),
    (
        routine_full_body_a_id,
        exercise_plank_id,
        4,
        3,
        NULL,
        '30-60 seconds hold'
    );
-- Full Body B routine exercises
INSERT INTO routine_exercises (
        routine_id,
        exercise_id,
        order_in_routine,
        suggested_sets,
        suggested_reps,
        notes
    )
VALUES (
        routine_full_body_b_id,
        exercise_deadlift_id,
        1,
        3,
        5,
        'Keep back straight, drive through heels'
    ),
    (
        routine_full_body_b_id,
        exercise_ohp_id,
        2,
        3,
        8,
        'Press straight up, engage core'
    ),
    (
        routine_full_body_b_id,
        exercise_pullup_id,
        3,
        3,
        5,
        'Use assistance if needed'
    ),
    (
        routine_full_body_b_id,
        exercise_pushup_id,
        4,
        3,
        12,
        'Full range of motion'
    );
-- Cardio routine exercises
INSERT INTO routine_exercises (
        routine_id,
        exercise_id,
        order_in_routine,
        suggested_duration_seconds,
        notes
    )
VALUES (
        routine_cardio_id,
        exercise_cycling_id,
        1,
        600,
        '10 minutes warm-up at moderate pace'
    ),
    (
        routine_cardio_id,
        exercise_rowing_id,
        2,
        900,
        '15 minutes steady state'
    );
END $$;
-- ============================================================================
-- ROLLBACK INSTRUCTIONS
-- ============================================================================
-- To rollback this migration, run:
-- DELETE FROM routine_exercises WHERE routine_id IN (SELECT id FROM workout_routines WHERE user_id IS NULL);
-- DELETE FROM workout_routines WHERE user_id IS NULL;
-- DELETE FROM exercises WHERE user_id IS NULL;