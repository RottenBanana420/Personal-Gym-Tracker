/**
 * Exercise CRUD routes
 * Implements GET, POST, PUT, DELETE operations with proper authorization
 */

import { Hono } from 'hono';
import { createAuthenticatedClient, supabaseAdmin } from '../config/supabase';
import { authMiddleware } from '../middleware/auth';
import { validateJson, getValidatedData } from '../middleware/validate';
import {
    createExerciseSchema,
    updateExerciseSchema,
    exerciseQuerySchema,
    type CreateExerciseRequest,
    type UpdateExerciseRequest,
    type ExerciseQueryParams,
} from '../validators/exercise';
import {
    ValidationError,
    NotFoundError,
    ForbiddenError,
    type AuthContext,
} from '../types';

const exercises = new Hono<AuthContext>();

/**
 * GET /api/exercises
 * Get all exercises for the authenticated user
 * Supports filtering by muscle_group, equipment_type and sorting
 */
exercises.get('/', authMiddleware, async (c) => {
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
        const validatedQuery = exerciseQuerySchema.parse(queryParams);

        // Build query
        let query = supabase
            .from('exercises')
            .select('*')
            .eq('user_id', user.id);

        // Apply filters
        if (validatedQuery.muscle_group) {
            // Query the muscle_groups array for the specific muscle group
            query = query.contains('muscle_groups', [
                validatedQuery.muscle_group,
            ]);
        }

        if (validatedQuery.equipment_type) {
            // Query the equipment_required array for the specific equipment
            query = query.contains('equipment_required', [
                validatedQuery.equipment_type,
            ]);
        }

        // Apply sorting
        if (validatedQuery.sort) {
            switch (validatedQuery.sort) {
                case 'name_asc':
                    query = query.order('name', { ascending: true });
                    break;
                case 'name_desc':
                    query = query.order('name', { ascending: false });
                    break;
                case 'created_asc':
                    query = query.order('created_at', { ascending: true });
                    break;
                case 'created_desc':
                    query = query.order('created_at', { ascending: false });
                    break;
            }
        } else {
            // Default sort by created_at descending
            query = query.order('created_at', { ascending: false });
        }

        const { data, error } = await query;

        if (error) {
            throw new ValidationError('Failed to fetch exercises');
        }

        // Transform data to match expected format (extract first element from arrays)
        const transformedData = (data || []).map((exercise) => ({
            id: exercise.id,
            user_id: exercise.user_id,
            name: exercise.name,
            description: exercise.description,
            category: exercise.category,
            muscle_group: exercise.muscle_groups?.[0] || null,
            equipment_type: exercise.equipment_required?.[0] || null,
            created_at: exercise.created_at,
            updated_at: exercise.updated_at,
        }));

        return c.json({
            success: true,
            data: transformedData,
        });
    } catch (error) {
        if (error instanceof ValidationError) {
            throw error;
        }
        throw new ValidationError('Invalid query parameters');
    }
});

/**
 * POST /api/exercises
 * Create a new exercise for the authenticated user
 */
exercises.post('/', authMiddleware, validateJson(createExerciseSchema), async (c) => {
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

    const exerciseData = getValidatedData<CreateExerciseRequest>(c);

    try {
        // Insert exercise with user_id from authenticated user
        // Map singular muscle_group and equipment_type to arrays
        const insertPayload = {
            user_id: user.id,
            name: exerciseData.name,
            description: exerciseData.description || null,
            category: exerciseData.category || 'strength',
            muscle_groups: [exerciseData.muscle_group],
            equipment_required: [exerciseData.equipment_type],
            is_public: false,
        };

        const { data, error } = await supabase
            .from('exercises')
            .insert(insertPayload)
            .select()
            .single();

        if (error) {
            // Handle unique constraint violation
            if (error.code === '23505') {
                throw new ValidationError(
                    'An exercise with this name already exists'
                );
            }
            throw new ValidationError(`Failed to create exercise: ${error.message}`);
        }

        // Transform response to match expected format
        const transformedData = {
            id: data.id,
            user_id: data.user_id,
            name: data.name,
            description: data.description,
            category: data.category,
            muscle_group: data.muscle_groups?.[0] || null,
            equipment_type: data.equipment_required?.[0] || null,
            created_at: data.created_at,
            updated_at: data.updated_at,
        };

        return c.json(
            {
                success: true,
                data: transformedData,
            },
            201
        );
    } catch (error) {
        if (error instanceof ValidationError) {
            throw error;
        }
        throw new ValidationError('Failed to create exercise');
    }
});

/**
 * PUT /api/exercises/:id
 * Update an existing exercise
 * Only the owner can update their exercise
 */
exercises.put(
    '/:id',
    authMiddleware,
    validateJson(updateExerciseSchema),
    async (c) => {
        const user = c.get('user');
        const exerciseId = c.req.param('id');

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

        const updateData = getValidatedData<UpdateExerciseRequest>(c);

        try {
            // First, check if exercise exists using service role (bypasses RLS)
            // This allows us to distinguish between "not found" and "forbidden"
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
                    'Forbidden: You do not have permission to update this exercise'
                );
            }

            // Build update object, mapping singular fields to arrays if provided
            const updateObject: any = {};

            if (updateData.name !== undefined) {
                updateObject.name = updateData.name;
            }
            if (updateData.description !== undefined) {
                updateObject.description = updateData.description;
            }
            if (updateData.category !== undefined) {
                updateObject.category = updateData.category;
            }
            if (updateData.muscle_group !== undefined) {
                updateObject.muscle_groups = [updateData.muscle_group];
            }
            if (updateData.equipment_type !== undefined) {
                updateObject.equipment_required = [updateData.equipment_type];
            }

            // Update exercise
            const { data, error } = await supabase
                .from('exercises')
                .update(updateObject)
                .eq('id', exerciseId)
                .eq('user_id', user.id) // Double-check authorization at DB level
                .select()
                .single();

            if (error) {
                throw new ValidationError('Failed to update exercise');
            }

            if (!data) {
                throw new NotFoundError('Exercise not found');
            }

            // Transform response
            const transformedData = {
                id: data.id,
                user_id: data.user_id,
                name: data.name,
                description: data.description,
                category: data.category,
                muscle_group: data.muscle_groups?.[0] || null,
                equipment_type: data.equipment_required?.[0] || null,
                created_at: data.created_at,
                updated_at: data.updated_at,
            };

            return c.json({
                success: true,
                data: transformedData,
            });
        } catch (error) {
            if (
                error instanceof NotFoundError ||
                error instanceof ForbiddenError ||
                error instanceof ValidationError
            ) {
                throw error;
            }
            throw new ValidationError('Failed to update exercise');
        }
    }
);

/**
 * DELETE /api/exercises/:id
 * Delete an exercise
 * Only the owner can delete their exercise
 */
exercises.delete('/:id', authMiddleware, async (c) => {
    const user = c.get('user');
    const exerciseId = c.req.param('id');

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
        // First, check if exercise exists using service role (bypasses RLS)
        // This allows us to distinguish between "not found" and "forbidden"
        const { data: existingExercise, error: fetchError } = await supabaseAdmin
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
                'Forbidden: You do not have permission to delete this exercise'
            );
        }

        // Delete exercise
        const { error } = await supabase
            .from('exercises')
            .delete()
            .eq('id', exerciseId)
            .eq('user_id', user.id); // Double-check authorization at DB level

        if (error) {
            // Handle foreign key constraint violation
            if (error.code === '23503') {
                throw new ValidationError(
                    'Cannot delete exercise that is being used in workouts or routines'
                );
            }
            throw new ValidationError('Failed to delete exercise');
        }

        return c.json({
            success: true,
            data: {
                message: 'Exercise deleted successfully',
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
        throw new ValidationError('Failed to delete exercise');
    }
});

export default exercises;
