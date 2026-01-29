/**
 * Statistics and analytics routes
 * Implements PRs, progress tracking, volume analytics, and summary statistics
 */

import { Hono } from 'hono';
import { createAuthenticatedClient, supabaseAdmin } from '../config/supabase';
import { authMiddleware } from '../middleware/auth';
import {
    progressQuerySchema,
    volumeQuerySchema,
    type ProgressQueryParams,
    type VolumeQueryParams,
} from '../validators/stats';
import {
    ValidationError,
    NotFoundError,
    ForbiddenError,
    type AuthContext,
} from '../types';

const stats = new Hono<AuthContext>();

/**
 * GET /api/stats/prs
 * Get all personal records for the authenticated user
 */
stats.get('/prs', authMiddleware, async (c) => {
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
        // Query to get all sets for user's workouts with exercise info
        const { data: setsData, error: setsError } = await supabase
            .from('sets')
            .select(
                `
                id,
                weight_kg,
                reps,
                workout_exercises!inner(
                    id,
                    exercise_id,
                    workouts!inner(
                        id,
                        user_id,
                        started_at
                    )
                )
            `
            )
            .eq('workout_exercises.workouts.user_id', user.id);

        if (setsError) {
            throw new ValidationError('Failed to fetch personal records');
        }

        if (!setsData || setsData.length === 0) {
            return c.json({
                success: true,
                data: [],
            });
        }

        // Get unique exercise IDs
        const exerciseIds = [
            ...new Set(
                setsData.map((set: any) => set.workout_exercises.exercise_id)
            ),
        ];

        // Fetch exercise details
        const { data: exercises, error: exercisesError } = await supabase
            .from('exercises')
            .select('id, name')
            .in('id', exerciseIds);

        if (exercisesError) {
            throw new ValidationError('Failed to fetch exercise details');
        }

        // Calculate PRs for each exercise
        const prsMap = new Map();

        for (const set of setsData) {
            const exerciseId = set.workout_exercises.exercise_id;
            const workoutDate = set.workout_exercises.workouts.started_at;
            const weight = set.weight_kg;
            const reps = set.reps;
            const volume = weight * reps;

            if (!prsMap.has(exerciseId)) {
                prsMap.set(exerciseId, {
                    exercise_id: exerciseId,
                    max_weight: { value: weight, reps, date: workoutDate },
                    max_reps: { value: reps, weight, date: workoutDate },
                    max_volume: { value: volume, date: workoutDate },
                });
            } else {
                const current = prsMap.get(exerciseId);

                // Update max weight
                if (weight > current.max_weight.value) {
                    current.max_weight = { value: weight, reps, date: workoutDate };
                }

                // Update max reps
                if (reps > current.max_reps.value) {
                    current.max_reps = { value: reps, weight, date: workoutDate };
                }

                // Update max volume
                if (volume > current.max_volume.value) {
                    current.max_volume = { value: volume, date: workoutDate };
                }
            }
        }

        // Add exercise names to PRs
        const prs = Array.from(prsMap.values()).map((pr) => {
            const exercise = exercises?.find((ex) => ex.id === pr.exercise_id);
            return {
                ...pr,
                exercise_name: exercise?.name || 'Unknown',
            };
        });

        return c.json({
            success: true,
            data: prs,
        });
    } catch (error) {
        if (error instanceof ValidationError) {
            throw error;
        }
        throw new ValidationError('Failed to fetch personal records');
    }
});

/**
 * GET /api/stats/progress/:exerciseId
 * Get historical progress data for a specific exercise
 */
stats.get('/progress/:exerciseId', authMiddleware, async (c) => {
    const user = c.get('user');
    const exerciseId = c.req.param('exerciseId');

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
        const validatedQuery = progressQuerySchema.parse(queryParams);

        // First, check if exercise exists using service role
        const { data: existingExercise, error: fetchError } =
            await supabaseAdmin
                .from('exercises')
                .select('*')
                .eq('id', exerciseId)
                .single();

        if (fetchError || !existingExercise) {
            throw new NotFoundError('Exercise not found');
        }

        // Check authorization - verify exercise belongs to user
        if (existingExercise.user_id !== user.id) {
            throw new ForbiddenError(
                'Forbidden: You do not have permission to view this exercise'
            );
        }

        // Calculate date filter based on period
        let startDate: string | undefined;
        const now = new Date();

        switch (validatedQuery.period) {
            case '4weeks':
                startDate = new Date(
                    now.getTime() - 28 * 24 * 60 * 60 * 1000
                ).toISOString();
                break;
            case '12weeks':
                startDate = new Date(
                    now.getTime() - 84 * 24 * 60 * 60 * 1000
                ).toISOString();
                break;
            case '6months':
                startDate = new Date(
                    now.getTime() - 180 * 24 * 60 * 60 * 1000
                ).toISOString();
                break;
            case 'all':
            default:
                startDate = undefined;
                break;
        }

        // Query sets for this exercise
        let query = supabase
            .from('sets')
            .select(
                `
                id,
                weight_kg,
                reps,
                workout_exercises!inner(
                    id,
                    exercise_id,
                    workouts!inner(
                        id,
                        user_id,
                        started_at
                    )
                )
            `
            )
            .eq('workout_exercises.exercise_id', exerciseId)
            .eq('workout_exercises.workouts.user_id', user.id);

        if (startDate) {
            query = query.gte('workout_exercises.workouts.started_at', startDate);
        }

        const { data: setsData, error: setsError } = await query;

        if (setsError) {
            throw new ValidationError('Failed to fetch progress data');
        }

        if (!setsData || setsData.length === 0) {
            return c.json({
                success: true,
                data: [],
            });
        }

        // Group sets by workout date
        const workoutMap = new Map();

        for (const set of setsData) {
            const workoutDate = set.workout_exercises.workouts.started_at;
            const weight = set.weight_kg;
            const reps = set.reps;
            const volume = weight * reps;

            if (!workoutMap.has(workoutDate)) {
                workoutMap.set(workoutDate, {
                    date: workoutDate,
                    weights: [],
                    total_reps: 0,
                    total_volume: 0,
                    max_weight: weight,
                });
            }

            const workout = workoutMap.get(workoutDate);
            workout.weights.push(weight);
            workout.total_reps += reps;
            workout.total_volume += volume;
            workout.max_weight = Math.max(workout.max_weight, weight);
        }

        // Calculate averages and format data
        const progressData = Array.from(workoutMap.values())
            .map((workout) => ({
                date: workout.date,
                avg_weight:
                    Math.round(
                        (workout.weights.reduce((a: number, b: number) => a + b, 0) /
                            workout.weights.length) *
                        100
                    ) / 100,
                max_weight: workout.max_weight,
                total_reps: workout.total_reps,
                total_volume: Math.round(workout.total_volume),
            }))
            .sort(
                (a, b) =>
                    new Date(a.date).getTime() - new Date(b.date).getTime()
            );

        return c.json({
            success: true,
            data: progressData,
        });
    } catch (error) {
        if (
            error instanceof ValidationError ||
            error instanceof NotFoundError ||
            error instanceof ForbiddenError
        ) {
            throw error;
        }
        throw new ValidationError('Failed to fetch progress data');
    }
});

/**
 * GET /api/stats/volume
 * Get training volume statistics grouped by time period
 */
stats.get('/volume', authMiddleware, async (c) => {
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
        const validatedQuery = volumeQuerySchema.parse(queryParams);

        // Calculate date filter based on period
        let startDate: string | undefined;
        const now = new Date();

        switch (validatedQuery.period) {
            case '4weeks':
                startDate = new Date(
                    now.getTime() - 28 * 24 * 60 * 60 * 1000
                ).toISOString();
                break;
            case '12weeks':
                startDate = new Date(
                    now.getTime() - 84 * 24 * 60 * 60 * 1000
                ).toISOString();
                break;
            case '6months':
                startDate = new Date(
                    now.getTime() - 180 * 24 * 60 * 60 * 1000
                ).toISOString();
                break;
            case 'all':
            default:
                startDate = undefined;
                break;
        }

        // Query all sets for user's workouts
        let query = supabase
            .from('sets')
            .select(
                `
                id,
                weight_kg,
                reps,
                workout_exercises!inner(
                    id,
                    exercise_id,
                    workouts!inner(
                        id,
                        user_id,
                        started_at
                    )
                )
            `
            )
            .eq('workout_exercises.workouts.user_id', user.id);

        if (startDate) {
            query = query.gte('workout_exercises.workouts.started_at', startDate);
        }

        const { data: setsData, error: setsError } = await query;

        if (setsError) {
            throw new ValidationError('Failed to fetch volume data');
        }

        if (!setsData || setsData.length === 0) {
            return c.json({
                success: true,
                data: [],
            });
        }

        // Get exercise details for muscle groups
        const exerciseIds = [
            ...new Set(
                setsData.map((set: any) => set.workout_exercises.exercise_id)
            ),
        ];

        const { data: exercises, error: exercisesError } = await supabase
            .from('exercises')
            .select('id, muscle_groups')
            .in('id', exerciseIds);

        if (exercisesError) {
            throw new ValidationError('Failed to fetch exercise details');
        }

        // Create exercise map
        const exerciseMap = new Map();
        exercises?.forEach((ex) => {
            exerciseMap.set(ex.id, ex.muscle_groups?.[0] || 'Unknown');
        });

        // Group by time period
        const periodMap = new Map();

        for (const set of setsData) {
            const workoutDate = new Date(
                set.workout_exercises.workouts.started_at
            );
            const exerciseId = set.workout_exercises.exercise_id;
            const muscleGroup = exerciseMap.get(exerciseId) || 'Unknown';
            const volume = set.weight_kg * set.reps;

            // Calculate period key based on groupBy
            let periodKey: string;
            if (validatedQuery.groupBy === 'month') {
                periodKey = `${workoutDate.getFullYear()}-${String(workoutDate.getMonth() + 1).padStart(2, '0')}`;
            } else {
                // Week grouping
                const weekStart = new Date(workoutDate);
                weekStart.setDate(
                    workoutDate.getDate() - workoutDate.getDay()
                );
                periodKey = weekStart.toISOString().split('T')[0];
            }

            if (!periodMap.has(periodKey)) {
                periodMap.set(periodKey, {
                    period: periodKey,
                    total_volume: 0,
                    by_muscle_group: new Map(),
                });
            }

            const period = periodMap.get(periodKey);
            period.total_volume += volume;

            if (!period.by_muscle_group.has(muscleGroup)) {
                period.by_muscle_group.set(muscleGroup, 0);
            }
            period.by_muscle_group.set(
                muscleGroup,
                period.by_muscle_group.get(muscleGroup) + volume
            );
        }

        // Format data
        const volumeData = Array.from(periodMap.values())
            .map((period) => ({
                period: period.period,
                total_volume: Math.round(period.total_volume),
                by_muscle_group: Array.from(period.by_muscle_group.entries())
                    .map(([muscle_group, volume]) => ({
                        muscle_group,
                        volume: Math.round(volume),
                    }))
                    .sort((a, b) => b.volume - a.volume),
            }))
            .sort((a, b) => b.period.localeCompare(a.period));

        return c.json({
            success: true,
            data: volumeData,
        });
    } catch (error) {
        if (error instanceof ValidationError) {
            throw error;
        }
        throw new ValidationError('Failed to fetch volume data');
    }
});

/**
 * GET /api/stats/summary
 * Get aggregate summary statistics for the authenticated user
 */
stats.get('/summary', authMiddleware, async (c) => {
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
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const twelveWeeksAgo = new Date(
            now.getTime() - 84 * 24 * 60 * 60 * 1000
        );

        // Get all workouts
        const { data: allWorkouts, error: allWorkoutsError } = await supabase
            .from('workouts')
            .select('id, started_at')
            .eq('user_id', user.id);

        if (allWorkoutsError) {
            throw new ValidationError('Failed to fetch workout data');
        }

        const totalWorkouts = allWorkouts?.length || 0;

        // Count workouts this month
        const workoutsThisMonth =
            allWorkouts?.filter(
                (w) => new Date(w.started_at) >= startOfMonth
            ).length || 0;

        // Count workouts this week
        const workoutsThisWeek =
            allWorkouts?.filter(
                (w) => new Date(w.started_at) >= startOfWeek
            ).length || 0;

        // Get sets for this week and month
        const workoutIds = allWorkouts?.map((w) => w.id) || [];

        let totalSetsThisWeek = 0;
        let totalSetsThisMonth = 0;

        if (workoutIds.length > 0) {
            // Get workout_exercises
            const { data: workoutExercises } = await supabase
                .from('workout_exercises')
                .select('id, workout_id, workouts!inner(started_at)')
                .in('workout_id', workoutIds);

            if (workoutExercises) {
                const weThisWeek = workoutExercises.filter(
                    (we: any) =>
                        new Date(we.workouts.started_at) >= startOfWeek
                );
                const weThisMonth = workoutExercises.filter(
                    (we: any) =>
                        new Date(we.workouts.started_at) >= startOfMonth
                );

                if (weThisWeek.length > 0) {
                    const { count: setsWeekCount } = await supabase
                        .from('sets')
                        .select('*', { count: 'exact', head: true })
                        .in(
                            'workout_exercise_id',
                            weThisWeek.map((we: any) => we.id)
                        );
                    totalSetsThisWeek = setsWeekCount || 0;
                }

                if (weThisMonth.length > 0) {
                    const { count: setsMonthCount } = await supabase
                        .from('sets')
                        .select('*', { count: 'exact', head: true })
                        .in(
                            'workout_exercise_id',
                            weThisMonth.map((we: any) => we.id)
                        );
                    totalSetsThisMonth = setsMonthCount || 0;
                }
            }
        }

        // Calculate most trained muscle group (by volume)
        let mostTrainedMuscleGroup = null;

        if (workoutIds.length > 0) {
            const { data: setsData } = await supabase
                .from('sets')
                .select(
                    `
                    weight_kg,
                    reps,
                    workout_exercises!inner(
                        exercise_id,
                        workout_id
                    )
                `
                )
                .in('workout_exercises.workout_id', workoutIds);

            if (setsData && setsData.length > 0) {
                const exerciseIds = [
                    ...new Set(
                        setsData.map(
                            (set: any) => set.workout_exercises.exercise_id
                        )
                    ),
                ];

                const { data: exercises } = await supabase
                    .from('exercises')
                    .select('id, muscle_groups')
                    .in('id', exerciseIds);

                const muscleGroupVolumes = new Map();

                for (const set of setsData) {
                    const exercise = exercises?.find(
                        (ex) => ex.id === set.workout_exercises.exercise_id
                    );
                    const muscleGroup = exercise?.muscle_groups?.[0] || 'Unknown';
                    const volume = set.weight_kg * set.reps;

                    muscleGroupVolumes.set(
                        muscleGroup,
                        (muscleGroupVolumes.get(muscleGroup) || 0) + volume
                    );
                }

                if (muscleGroupVolumes.size > 0) {
                    mostTrainedMuscleGroup = Array.from(
                        muscleGroupVolumes.entries()
                    ).sort((a, b) => b[1] - a[1])[0][0];
                }
            }
        }

        // Calculate workout streak
        let currentStreak = 0;

        if (allWorkouts && allWorkouts.length > 0) {
            const workoutDates = allWorkouts
                .map((w) => new Date(w.started_at).toISOString().split('T')[0])
                .sort()
                .reverse();

            const uniqueDates = [...new Set(workoutDates)];

            // Check if there's a workout today or yesterday
            const today = now.toISOString().split('T')[0];
            const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0];

            if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
                currentStreak = 1;

                for (let i = 1; i < uniqueDates.length; i++) {
                    const prevDate = new Date(uniqueDates[i - 1]);
                    const currDate = new Date(uniqueDates[i]);
                    const diffDays = Math.floor(
                        (prevDate.getTime() - currDate.getTime()) /
                        (24 * 60 * 60 * 1000)
                    );

                    if (diffDays <= 1) {
                        currentStreak++;
                    } else {
                        break;
                    }
                }
            }
        }

        // Calculate average workouts per week (last 12 weeks)
        const workoutsLast12Weeks =
            allWorkouts?.filter(
                (w) => new Date(w.started_at) >= twelveWeeksAgo
            ).length || 0;

        const avgWorkoutsPerWeek =
            Math.round((workoutsLast12Weeks / 12) * 10) / 10;

        // Get total exercises count
        const { count: totalExercises } = await supabase
            .from('exercises')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

        return c.json({
            success: true,
            data: {
                total_workouts: totalWorkouts,
                total_exercises: totalExercises || 0,
                total_workouts_this_month: workoutsThisMonth,
                total_workouts_this_week: workoutsThisWeek,
                total_sets_this_week: totalSetsThisWeek,
                total_sets_this_month: totalSetsThisMonth,
                most_trained_muscle_group: mostTrainedMuscleGroup,
                current_streak: currentStreak,
                avg_workouts_per_week: avgWorkoutsPerWeek,
            },
        });
    } catch (error) {
        if (error instanceof ValidationError) {
            throw error;
        }
        throw new ValidationError('Failed to fetch summary statistics');
    }
});

export default stats;
