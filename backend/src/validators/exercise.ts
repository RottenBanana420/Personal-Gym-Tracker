/**
 * Exercise validation schemas using Zod
 */

import { z } from 'zod';

/**
 * Valid muscle groups for exercises
 */
export const muscleGroupEnum = z.enum([
    'Chest',
    'Back',
    'Legs',
    'Shoulders',
    'Arms',
    'Core',
    'Full Body',
]);

/**
 * Valid equipment types for exercises
 */
export const equipmentTypeEnum = z.enum([
    'Barbell',
    'Dumbbell',
    'Machine',
    'Bodyweight',
    'Cable',
    'Resistance Band',
    'Other',
]);

/**
 * Valid exercise categories (maps to database enum)
 */
export const categoryEnum = z.enum([
    'strength',
    'cardio',
    'flexibility',
    'balance',
    'plyometric',
    'olympic',
    'powerlifting',
    'bodyweight',
    'other',
]);

/**
 * Valid sort options for exercise queries
 */
export const sortEnum = z.enum([
    'name_asc',
    'name_desc',
    'created_asc',
    'created_desc',
]);

/**
 * Exercise name validation
 * Must be 1-100 characters
 */
export const exerciseNameSchema = z
    .string()
    .min(1, 'Exercise name is required')
    .max(100, 'Exercise name must not exceed 100 characters')
    .trim();

/**
 * Exercise description validation
 * Optional, max 500 characters
 */
export const exerciseDescriptionSchema = z
    .string()
    .max(500, 'Description must not exceed 500 characters')
    .trim()
    .nullish()
    .transform((val) => val || undefined);

/**
 * Create exercise request validation schema
 */
export const createExerciseSchema = z.object({
    name: exerciseNameSchema,
    muscle_group: muscleGroupEnum,
    equipment_type: equipmentTypeEnum,
    description: z
        .string()
        .max(500, 'Description must not exceed 500 characters')
        .trim()
        .optional(),
    category: categoryEnum.optional().default('strength'),
});

/**
 * Update exercise request validation schema
 * All fields are optional for partial updates
 */
export const updateExerciseSchema = z.object({
    name: exerciseNameSchema.optional(),
    muscle_group: muscleGroupEnum.optional(),
    equipment_type: equipmentTypeEnum.optional(),
    description: z
        .string()
        .max(500, 'Description must not exceed 500 characters')
        .trim()
        .optional(),
    category: categoryEnum.optional(),
});

/**
 * Query parameters validation schema for GET /api/exercises
 */
export const exerciseQuerySchema = z.object({
    muscle_group: muscleGroupEnum.optional(),
    equipment_type: equipmentTypeEnum.optional(),
    sort: sortEnum.optional(),
});

/**
 * Type exports for TypeScript
 */
export type CreateExerciseRequest = z.infer<typeof createExerciseSchema>;
export type UpdateExerciseRequest = z.infer<typeof updateExerciseSchema>;
export type ExerciseQueryParams = z.infer<typeof exerciseQuerySchema>;
export type MuscleGroup = z.infer<typeof muscleGroupEnum>;
export type EquipmentType = z.infer<typeof equipmentTypeEnum>;
export type ExerciseCategory = z.infer<typeof categoryEnum>;
