/**
 * Workout validation schemas
 * Implements validation for workout operations including nested sets data
 */

import { z } from 'zod';

/**
 * Individual set validation schema
 * Each set must reference an exercise and include performance data
 */
export const workoutSetSchema = z.object({
    exercise_id: z.string().uuid('Invalid exercise ID format'),
    set_number: z.number().int().positive('Set number must be a positive integer'),
    weight_kg: z.number().nonnegative('Weight must be non-negative'),
    reps: z.number().int().positive('Reps must be a positive integer'),
});

/**
 * Workout creation request schema
 * Validates workout-level data and nested sets array
 */
export const createWorkoutSchema = z.object({
    workout_date: z.string().datetime('Invalid date format, expected ISO 8601 datetime'),
    duration_minutes: z.number().int().positive('Duration must be a positive integer').optional(),
    notes: z.string().max(1000, 'Notes must be 1000 characters or less').optional(),
    sets: z.array(workoutSetSchema).min(1, 'At least one set is required'),
});

/**
 * Workout query parameters schema
 * Supports date range filtering and pagination
 */
export const workoutQuerySchema = z.object({
    start_date: z.string().datetime('Invalid start date format').optional(),
    end_date: z.string().datetime('Invalid end date format').optional(),
    limit: z.coerce.number().int().positive().max(100).optional().default(50),
    offset: z.coerce.number().int().nonnegative().optional().default(0),
});

/**
 * TypeScript types exported from schemas
 */
export type WorkoutSet = z.infer<typeof workoutSetSchema>;
export type CreateWorkoutRequest = z.infer<typeof createWorkoutSchema>;
export type WorkoutQueryParams = z.infer<typeof workoutQuerySchema>;
