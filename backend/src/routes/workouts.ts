/**
 * Workout management routes
 * Implements POST, GET (list and detail), DELETE operations with transaction handling
 */

import { Hono } from 'hono';
import { createAuthenticatedClient, supabaseAdmin } from '../config/supabase';
import { authMiddleware } from '../middleware/auth';
import { validateJson, getValidatedData } from '../middleware/validate';
import {
    createWorkoutSchema,
    workoutQuerySchema,
    type CreateWorkoutRequest,
    type WorkoutQueryParams,
} from '../validators/workout';
import {
    ValidationError,
    NotFoundError,
    ForbiddenError,
    type AuthContext,
} from '../types';

const workouts = new Hono<AuthContext>();

/**
 * GET /api/workouts
 * Get all workouts for the authenticated user with optional filtering and pagination
 */
workouts.get('/', authMiddleware, async (c) => {
    const user = c.get('user');

    if (!user) {
        throw new ValidationError('User not authenticated');
    }

    // Get access token from Authorization header
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
        throw new ValidationError('Missing authentication token');
    }

    // Create authenticated Supabase client
    const supabase = createAuthenticatedClient(token);

    try {
        // Parse and validate query parameters
        const queryParams = c.req.query();
        const validatedQuery = workoutQuerySchema.parse(queryParams);

        // Build query for workouts
        let query = supabase
            .from('workouts')
            .select(
                `
                id,
                user_id,
                name,
                notes,
                started_at,
                completed_at,
                duration_minutes,
                created_at,
                updated_at
            `
            )
            .eq('user_id', user.id);

        // Apply date range filters
        if (validatedQuery.start_date) {
            query = query.gte('started_at', validatedQuery.start_date);
        }

        if (validatedQuery.end_date) {
            query = query.lte('started_at', validatedQuery.end_date);
        }

        // Apply sorting (most recent first)
        query = query.order('started_at', { ascending: false });

        // Apply pagination
        query = query.range(
            validatedQuery.offset,
            validatedQuery.offset + validatedQuery.limit - 1
        );

        const { data: workoutsData, error } = await query;

        if (error) {
            throw new ValidationError('Failed to fetch workouts');
        }

        // For each workout, get summary data (total sets and exercises count)
        const workoutsWithSummary = await Promise.all(
            (workoutsData || []).map(async (workout) => {
                // Get workout_exercises for this workout
                const { data: workoutExercises } = await supabase
                    .from('workout_exercises')
                    .select('id, exercise_id')
                    .eq('workout_id', workout.id);

                // Get sets count
                const workoutExerciseIds =
                    workoutExercises?.map((we) => we.id) || [];

                let totalSets = 0;
                if (workoutExerciseIds.length > 0) {
                    const { count } = await supabase
                        .from('sets')
                        .select('*', { count: 'exact', head: true })
                        .in('workout_exercise_id', workoutExerciseIds);

                    totalSets = count || 0;
                }

                // Get unique exercises count
                const uniqueExercises = new Set(
                    workoutExercises?.map((we) => we.exercise_id) || []
                );

                return {
                    ...workout,
                    total_sets: totalSets,
                    exercises_count: uniqueExercises.size,
                };
            })
        );

        return c.json({
            success: true,
            data: workoutsWithSummary,
        });
    } catch (error) {
        if (error instanceof ValidationError) {
            throw error;
        }
        throw new ValidationError('Invalid query parameters');
    }
});

/**
 * POST /api/workouts
 * Create a new workout with multiple sets
 * Uses database transaction for atomicity
 */
workouts.post(
    '/',
    authMiddleware,
    validateJson(createWorkoutSchema),
    async (c) => {
        const user = c.get('user');

        if (!user) {
            throw new ValidationError('User not authenticated');
        }

        // Get access token from Authorization header
        const authHeader = c.req.header('Authorization');
        const token = authHeader?.split(' ')[1];

        if (!token) {
            throw new ValidationError('Missing authentication token');
        }

        // Create authenticated Supabase client
        const supabase = createAuthenticatedClient(token);

        const workoutData = getValidatedData<CreateWorkoutRequest>(c);

        try {
            // Extract unique exercise IDs from sets
            const exerciseIds = [
                ...new Set(workoutData.sets.map((set) => set.exercise_id)),
            ];

            // Verify all exercises exist and belong to the user
            const { data: exercises, error: exercisesError } =
                await supabaseAdmin
                    .from('exercises')
                    .select('id, user_id')
                    .in('id', exerciseIds);

            if (exercisesError || !exercises || exercises.length === 0) {
                throw new ValidationError(
                    'One or more exercises do not exist'
                );
            }

            // Check if all exercises belong to the user
            const unauthorizedExercises = exercises.filter(
                (ex) => ex.user_id !== user.id
            );

            if (unauthorizedExercises.length > 0) {
                throw new ForbiddenError(
                    'Forbidden: You do not have permission to use these exercises'
                );
            }

            // Check if all requested exercises were found
            if (exercises.length !== exerciseIds.length) {
                throw new ValidationError(
                    'One or more exercises do not exist'
                );
            }

            // Create workout
            const { data: workout, error: workoutError } = await supabase
                .from('workouts')
                .insert({
                    user_id: user.id,
                    name: `Workout ${new Date(workoutData.workout_date).toLocaleDateString()}`,
                    notes: workoutData.notes || null,
                    started_at: workoutData.workout_date,
                    completed_at: workoutData.workout_date, // Mark as completed
                    duration_minutes: workoutData.duration_minutes || null,
                })
                .select()
                .single();

            if (workoutError || !workout) {
                throw new ValidationError(
                    `Failed to create workout: ${workoutError?.message || 'Unknown error'}`
                );
            }

            // Group sets by exercise_id
            const setsByExercise = workoutData.sets.reduce(
                (acc, set) => {
                    if (!acc[set.exercise_id]) {
                        acc[set.exercise_id] = [];
                    }
                    acc[set.exercise_id].push(set);
                    return acc;
                },
                {} as Record<string, typeof workoutData.sets>
            );

            // Create workout_exercises and sets
            const allSets: any[] = [];
            let orderInWorkout = 1;

            for (const [exerciseId, sets] of Object.entries(setsByExercise)) {
                // Create workout_exercise
                const { data: workoutExercise, error: workoutExerciseError } =
                    await supabase
                        .from('workout_exercises')
                        .insert({
                            workout_id: workout.id,
                            exercise_id: exerciseId,
                            order_in_workout: orderInWorkout++,
                        })
                        .select()
                        .single();

                if (workoutExerciseError || !workoutExercise) {
                    // Rollback: delete the workout
                    await supabase
                        .from('workouts')
                        .delete()
                        .eq('id', workout.id);

                    throw new ValidationError(
                        `Failed to create workout exercise: ${workoutExerciseError?.message || 'Unknown error'}`
                    );
                }

                // Create sets for this exercise
                for (const set of sets) {
                    const { data: createdSet, error: setError } =
                        await supabase
                            .from('sets')
                            .insert({
                                workout_exercise_id: workoutExercise.id,
                                set_number: set.set_number,
                                weight_kg: set.weight_kg,
                                reps: set.reps,
                            })
                            .select()
                            .single();

                    if (setError || !createdSet) {
                        // Rollback: delete the workout (cascade will handle the rest)
                        await supabase
                            .from('workouts')
                            .delete()
                            .eq('id', workout.id);

                        throw new ValidationError(
                            `Failed to create set: ${setError?.message || 'Unknown error'}`
                        );
                    }

                    allSets.push({
                        ...createdSet,
                        exercise_id: exerciseId,
                    });
                }
            }

            // Return created workout with all sets
            return c.json(
                {
                    success: true,
                    data: {
                        ...workout,
                        sets: allSets,
                    },
                },
                201
            );
        } catch (error) {
            if (
                error instanceof ValidationError ||
                error instanceof ForbiddenError
            ) {
                throw error;
            }
            throw new ValidationError('Failed to create workout');
        }
    }
);

/**
 * GET /api/workouts/:id
 * Get complete workout details including all sets
 */
workouts.get('/:id', authMiddleware, async (c) => {
    const user = c.get('user');
    const workoutId = c.req.param('id');

    if (!user) {
        throw new ValidationError('User not authenticated');
    }

    // Get access token from Authorization header
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
        throw new ValidationError('Missing authentication token');
    }

    // Create authenticated Supabase client
    const supabase = createAuthenticatedClient(token);

    try {
        // First, check if workout exists using service role (bypasses RLS)
        const { data: existingWorkout, error: fetchError } =
            await supabaseAdmin
                .from('workouts')
                .select('*')
                .eq('id', workoutId)
                .single();

        if (fetchError || !existingWorkout) {
            throw new NotFoundError('Workout not found');
        }

        // Check authorization - verify workout belongs to user
        if (existingWorkout.user_id !== user.id) {
            throw new ForbiddenError(
                'Forbidden: You do not have permission to view this workout'
            );
        }

        // Fetch workout with all related data
        const { data: workout, error: workoutError } = await supabase
            .from('workouts')
            .select('*')
            .eq('id', workoutId)
            .single();

        if (workoutError || !workout) {
            throw new NotFoundError('Workout not found');
        }

        // Fetch workout_exercises
        const { data: workoutExercises, error: workoutExercisesError } =
            await supabase
                .from('workout_exercises')
                .select('id, exercise_id, order_in_workout')
                .eq('workout_id', workoutId)
                .order('order_in_workout', { ascending: true });

        if (workoutExercisesError) {
            throw new ValidationError('Failed to fetch workout exercises');
        }

        // Fetch all sets
        const allSets: any[] = [];

        if (workoutExercises && workoutExercises.length > 0) {
            const workoutExerciseIds = workoutExercises.map((we) => we.id);

            const { data: sets, error: setsError } = await supabase
                .from('sets')
                .select('*')
                .in('workout_exercise_id', workoutExerciseIds)
                .order('set_number', { ascending: true });

            if (setsError) {
                throw new ValidationError('Failed to fetch sets');
            }

            // Map sets to include exercise_id
            for (const set of sets || []) {
                const workoutExercise = workoutExercises.find(
                    (we) => we.id === set.workout_exercise_id
                );

                if (workoutExercise) {
                    allSets.push({
                        ...set,
                        exercise_id: workoutExercise.exercise_id,
                    });
                }
            }
        }

        return c.json({
            success: true,
            data: {
                ...workout,
                sets: allSets,
            },
        });
    } catch (error) {
        if (
            error instanceof NotFoundError ||
            error instanceof ForbiddenError ||
            error instanceof ValidationError
        ) {
            throw error;
        }
        throw new ValidationError('Failed to fetch workout');
    }
});

/**
 * DELETE /api/workouts/:id
 * Delete a workout (cascade will delete workout_exercises and sets)
 */
workouts.delete('/:id', authMiddleware, async (c) => {
    const user = c.get('user');
    const workoutId = c.req.param('id');

    if (!user) {
        throw new ValidationError('User not authenticated');
    }

    // Get access token from Authorization header
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
        throw new ValidationError('Missing authentication token');
    }

    // Create authenticated Supabase client
    const supabase = createAuthenticatedClient(token);

    try {
        // First, check if workout exists using service role (bypasses RLS)
        const { data: existingWorkout, error: fetchError } =
            await supabaseAdmin
                .from('workouts')
                .select('*')
                .eq('id', workoutId)
                .single();

        if (fetchError || !existingWorkout) {
            throw new NotFoundError('Workout not found');
        }

        // Check authorization - verify workout belongs to user
        if (existingWorkout.user_id !== user.id) {
            throw new ForbiddenError(
                'Forbidden: You do not have permission to delete this workout'
            );
        }

        // Delete workout (cascade will handle workout_exercises and sets)
        const { error } = await supabase
            .from('workouts')
            .delete()
            .eq('id', workoutId)
            .eq('user_id', user.id); // Double-check authorization at DB level

        if (error) {
            throw new ValidationError('Failed to delete workout');
        }

        return c.json({
            success: true,
            data: {
                message: 'Workout deleted successfully',
            },
        });
    } catch (error) {
        if (
            error instanceof NotFoundError ||
            error instanceof ForbiddenError ||
            error instanceof ValidationError
        ) {
            throw error;
        }
        throw new ValidationError('Failed to delete workout');
    }
});

export default workouts;
