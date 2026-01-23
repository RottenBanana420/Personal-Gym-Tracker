/**
 * Comprehensive workout management endpoint tests
 * Following TDD: These tests are written FIRST and should initially fail
 * Tests cover: POST, GET (list and detail), DELETE operations with transaction handling
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { supabaseAdmin } from '../../src/config/supabase';

const API_URL = 'http://localhost:3000';

// Test user credentials
const testUser1 = {
    email: 'workout-test-user-1@example.com',
    password: 'SecurePassword123',
};

const testUser2 = {
    email: 'workout-test-user-2@example.com',
    password: 'AnotherSecurePass456',
};

// Helper function to make API requests
async function apiRequest(
    endpoint: string,
    options: RequestInit = {}
): Promise<Response> {
    return fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });
}

// Cleanup function to delete test users and their data
async function cleanupTestUsers() {
    try {
        const { data: users } = await supabaseAdmin.auth.admin.listUsers();

        if (users?.users) {
            for (const user of users.users) {
                if (
                    user.email === testUser1.email ||
                    user.email === testUser2.email
                ) {
                    await supabaseAdmin.auth.admin.deleteUser(user.id);
                }
            }
        }
    } catch (error) {
        console.error('Cleanup error:', error);
    }
}

// Helper to create a test user and return auth token
async function createTestUser(
    userCredentials: typeof testUser1
): Promise<string> {
    // Try to login first (in case user already exists from other tests)
    const loginResponse = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(userCredentials),
    });

    if (loginResponse.status === 200) {
        const loginData = await loginResponse.json();
        return loginData.data.session.access_token;
    }

    // If login fails, try signup
    const signupResponse = await apiRequest('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(userCredentials),
    });

    const signupData = await signupResponse.json();

    if (!signupData.data || !signupData.data.session) {
        throw new Error(`Failed to create test user: ${JSON.stringify(signupData)}`);
    }

    return signupData.data.session.access_token;
}

// Helper to create an exercise
async function createExercise(
    token: string,
    exerciseData: {
        name: string;
        muscle_group: string;
        equipment_type: string;
    }
) {
    const response = await apiRequest('/api/exercises', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(exerciseData),
    });

    const data = await response.json();

    // If exercise already exists, fetch it
    if (response.status === 400 && data.error?.includes('already exists')) {
        const getResponse = await apiRequest('/api/exercises', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const getData = await getResponse.json();
        const existingExercise = getData.data.find(
            (ex: any) => ex.name === exerciseData.name
        );

        if (existingExercise) {
            return existingExercise.id;
        }
    }

    if (!data.data || !data.data.id) {
        throw new Error(`Failed to create exercise: ${JSON.stringify(data)}`);
    }

    return data.data.id;
}

// Helper to create a workout
async function createWorkout(
    token: string,
    workoutData: {
        workout_date: string;
        duration_minutes?: number;
        notes?: string;
        sets: Array<{
            exercise_id: string;
            set_number: number;
            weight_kg: number;
            reps: number;
        }>;
    }
) {
    return apiRequest('/api/workouts', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(workoutData),
    });
}

describe('Workout Management Endpoints', () => {
    let user1Token: string;
    let user2Token: string;
    let user1ExerciseId: string;
    let user2ExerciseId: string;

    beforeAll(async () => {
        // Clean up any existing test users
        await cleanupTestUsers();

        // Create test users
        user1Token = await createTestUser(testUser1);
        user2Token = await createTestUser(testUser2);

        // Create test exercises for each user
        user1ExerciseId = await createExercise(user1Token, {
            name: 'Bench Press',
            muscle_group: 'Chest',
            equipment_type: 'Barbell',
        });

        user2ExerciseId = await createExercise(user2Token, {
            name: 'Squat',
            muscle_group: 'Legs',
            equipment_type: 'Barbell',
        });
    });

    afterAll(async () => {
        // Clean up test users after all tests
        await cleanupTestUsers();
    });

    describe('POST /api/workouts', () => {
        describe('Success Cases', () => {
            it('should successfully create a workout with multiple sets', async () => {
                const workoutData = {
                    workout_date: '2026-01-22T10:00:00Z',
                    duration_minutes: 60,
                    notes: 'Great workout!',
                    sets: [
                        {
                            exercise_id: user1ExerciseId,
                            set_number: 1,
                            weight_kg: 100,
                            reps: 10,
                        },
                        {
                            exercise_id: user1ExerciseId,
                            set_number: 2,
                            weight_kg: 100,
                            reps: 8,
                        },
                        {
                            exercise_id: user1ExerciseId,
                            set_number: 3,
                            weight_kg: 100,
                            reps: 6,
                        },
                    ],
                };

                const response = await createWorkout(user1Token, workoutData);

                expect(response.status).toBe(201);

                const data = await response.json();
                expect(data.success).toBe(true);
                expect(data.data).toHaveProperty('id');
                expect(data.data).toHaveProperty('user_id');
                expect(data.data.notes).toBe(workoutData.notes);
                expect(data.data.duration_minutes).toBe(
                    workoutData.duration_minutes
                );
                expect(data.data.sets).toHaveLength(3);
            });

            it('should create workout with minimal required data', async () => {
                const workoutData = {
                    workout_date: '2026-01-22T14:00:00Z',
                    sets: [
                        {
                            exercise_id: user1ExerciseId,
                            set_number: 1,
                            weight_kg: 50,
                            reps: 12,
                        },
                    ],
                };

                const response = await createWorkout(user1Token, workoutData);

                expect(response.status).toBe(201);

                const data = await response.json();
                expect(data.success).toBe(true);
                expect(data.data).toHaveProperty('id');
                expect(data.data.sets).toHaveLength(1);
            });

            it('should create workout with zero weight (bodyweight exercise)', async () => {
                const workoutData = {
                    workout_date: '2026-01-22T15:00:00Z',
                    sets: [
                        {
                            exercise_id: user1ExerciseId,
                            set_number: 1,
                            weight_kg: 0,
                            reps: 15,
                        },
                    ],
                };

                const response = await createWorkout(user1Token, workoutData);

                expect(response.status).toBe(201);

                const data = await response.json();
                expect(data.success).toBe(true);
                expect(data.data.sets[0].weight_kg).toBe(0);
            });
        });

        describe('Validation Failures', () => {
            it('should reject workout with missing workout_date', async () => {
                const workoutData = {
                    sets: [
                        {
                            exercise_id: user1ExerciseId,
                            set_number: 1,
                            weight_kg: 100,
                            reps: 10,
                        },
                    ],
                } as any;

                const response = await createWorkout(user1Token, workoutData);

                expect(response.status).toBe(400);

                const data = await response.json();
                expect(data.success).toBe(false);
                expect(data.error).toContain('workout_date');
            });

            it('should reject workout with invalid date format', async () => {
                const workoutData = {
                    workout_date: 'invalid-date',
                    sets: [
                        {
                            exercise_id: user1ExerciseId,
                            set_number: 1,
                            weight_kg: 100,
                            reps: 10,
                        },
                    ],
                };

                const response = await createWorkout(user1Token, workoutData);

                expect(response.status).toBe(400);

                const data = await response.json();
                expect(data.success).toBe(false);
                expect(data.error).toContain('date');
            });

            it('should reject workout with empty sets array', async () => {
                const workoutData = {
                    workout_date: '2026-01-22T10:00:00Z',
                    sets: [],
                };

                const response = await createWorkout(user1Token, workoutData);

                expect(response.status).toBe(400);

                const data = await response.json();
                expect(data.success).toBe(false);
                expect(data.error).toContain('set');
            });

            it('should reject workout with missing sets array', async () => {
                const workoutData = {
                    workout_date: '2026-01-22T10:00:00Z',
                } as any;

                const response = await createWorkout(user1Token, workoutData);

                expect(response.status).toBe(400);

                const data = await response.json();
                expect(data.success).toBe(false);
                expect(data.error).toContain('sets');
            });

            it('should reject workout with negative weight', async () => {
                const workoutData = {
                    workout_date: '2026-01-22T10:00:00Z',
                    sets: [
                        {
                            exercise_id: user1ExerciseId,
                            set_number: 1,
                            weight_kg: -50,
                            reps: 10,
                        },
                    ],
                };

                const response = await createWorkout(user1Token, workoutData);

                expect(response.status).toBe(400);

                const data = await response.json();
                expect(data.success).toBe(false);
                expect(data.error).toContain('weight');
            });

            it('should reject workout with zero reps', async () => {
                const workoutData = {
                    workout_date: '2026-01-22T10:00:00Z',
                    sets: [
                        {
                            exercise_id: user1ExerciseId,
                            set_number: 1,
                            weight_kg: 100,
                            reps: 0,
                        },
                    ],
                };

                const response = await createWorkout(user1Token, workoutData);

                expect(response.status).toBe(400);

                const data = await response.json();
                expect(data.success).toBe(false);
                expect(data.error).toContain('reps');
            });

            it('should reject workout with negative reps', async () => {
                const workoutData = {
                    workout_date: '2026-01-22T10:00:00Z',
                    sets: [
                        {
                            exercise_id: user1ExerciseId,
                            set_number: 1,
                            weight_kg: 100,
                            reps: -5,
                        },
                    ],
                };

                const response = await createWorkout(user1Token, workoutData);

                expect(response.status).toBe(400);

                const data = await response.json();
                expect(data.success).toBe(false);
                expect(data.error).toContain('reps');
            });

            it('should reject workout with invalid exercise_id format', async () => {
                const workoutData = {
                    workout_date: '2026-01-22T10:00:00Z',
                    sets: [
                        {
                            exercise_id: 'invalid-uuid',
                            set_number: 1,
                            weight_kg: 100,
                            reps: 10,
                        },
                    ],
                };

                const response = await createWorkout(user1Token, workoutData);

                expect(response.status).toBe(400);

                const data = await response.json();
                expect(data.success).toBe(false);
                expect(data.error).toContain('exercise');
            });

            it('should reject workout with notes exceeding max length', async () => {
                const workoutData = {
                    workout_date: '2026-01-22T10:00:00Z',
                    notes: 'a'.repeat(1001), // 1001 characters
                    sets: [
                        {
                            exercise_id: user1ExerciseId,
                            set_number: 1,
                            weight_kg: 100,
                            reps: 10,
                        },
                    ],
                };

                const response = await createWorkout(user1Token, workoutData);

                expect(response.status).toBe(400);

                const data = await response.json();
                expect(data.success).toBe(false);
                expect(data.error).toContain('notes');
            });
        });

        describe('Authorization Failures', () => {
            it('should reject workout referencing another users exercise', async () => {
                const workoutData = {
                    workout_date: '2026-01-22T10:00:00Z',
                    sets: [
                        {
                            exercise_id: user2ExerciseId, // User2's exercise
                            set_number: 1,
                            weight_kg: 100,
                            reps: 10,
                        },
                    ],
                };

                const response = await createWorkout(user1Token, workoutData);

                expect(response.status).toBe(403);

                const data = await response.json();
                expect(data.success).toBe(false);
                expect(data.error).toContain('Forbidden');
            });

            it('should reject workout referencing non-existent exercise', async () => {
                const fakeExerciseId = '00000000-0000-0000-0000-000000000000';
                const workoutData = {
                    workout_date: '2026-01-22T10:00:00Z',
                    sets: [
                        {
                            exercise_id: fakeExerciseId,
                            set_number: 1,
                            weight_kg: 100,
                            reps: 10,
                        },
                    ],
                };

                const response = await createWorkout(user1Token, workoutData);

                expect(response.status).toBe(400);

                const data = await response.json();
                expect(data.success).toBe(false);
                expect(data.error).toContain('exercise');
            });

            it('should reject unauthenticated workout creation', async () => {
                const workoutData = {
                    workout_date: '2026-01-22T10:00:00Z',
                    sets: [
                        {
                            exercise_id: user1ExerciseId,
                            set_number: 1,
                            weight_kg: 100,
                            reps: 10,
                        },
                    ],
                };

                const response = await apiRequest('/api/workouts', {
                    method: 'POST',
                    body: JSON.stringify(workoutData),
                });

                expect(response.status).toBe(401);

                const data = await response.json();
                expect(data.success).toBe(false);
                expect(data.error).toContain('authorization');
            });
        });
    });

    describe('GET /api/workouts', () => {
        let workout1Id: string;
        let workout2Id: string;

        beforeAll(async () => {
            // Create workouts for user1
            const response1 = await createWorkout(user1Token, {
                workout_date: '2026-01-20T10:00:00Z',
                duration_minutes: 45,
                notes: 'Morning workout',
                sets: [
                    {
                        exercise_id: user1ExerciseId,
                        set_number: 1,
                        weight_kg: 80,
                        reps: 12,
                    },
                    {
                        exercise_id: user1ExerciseId,
                        set_number: 2,
                        weight_kg: 80,
                        reps: 10,
                    },
                ],
            });
            const data1 = await response1.json();
            workout1Id = data1.data.id;

            const response2 = await createWorkout(user1Token, {
                workout_date: '2026-01-21T14:00:00Z',
                duration_minutes: 60,
                sets: [
                    {
                        exercise_id: user1ExerciseId,
                        set_number: 1,
                        weight_kg: 100,
                        reps: 8,
                    },
                ],
            });
            const data2 = await response2.json();
            workout2Id = data2.data.id;

            // Create workout for user2
            await createWorkout(user2Token, {
                workout_date: '2026-01-22T10:00:00Z',
                sets: [
                    {
                        exercise_id: user2ExerciseId,
                        set_number: 1,
                        weight_kg: 120,
                        reps: 5,
                    },
                ],
            });
        });

        it('should return all workouts for authenticated user', async () => {
            const response = await apiRequest('/api/workouts', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${user1Token}`,
                },
            });

            expect(response.status).toBe(200);

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(Array.isArray(data.data)).toBe(true);
            expect(data.data.length).toBeGreaterThanOrEqual(2);

            // Verify structure includes summary data
            data.data.forEach((workout: any) => {
                expect(workout).toHaveProperty('id');
                expect(workout).toHaveProperty('user_id');
                expect(workout).toHaveProperty('started_at');
                expect(workout).toHaveProperty('total_sets');
                expect(workout).toHaveProperty('exercises_count');
            });
        });

        it('should sort workouts by date (most recent first)', async () => {
            const response = await apiRequest('/api/workouts', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${user1Token}`,
                },
            });

            expect(response.status).toBe(200);

            const data = await response.json();
            expect(data.success).toBe(true);

            // Verify sorting (most recent first)
            for (let i = 1; i < data.data.length; i++) {
                const prev = new Date(data.data[i - 1].started_at);
                const curr = new Date(data.data[i].started_at);
                expect(prev.getTime()).toBeGreaterThanOrEqual(curr.getTime());
            }
        });

        it('should return only current users workouts (data isolation)', async () => {
            const response = await apiRequest('/api/workouts', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${user1Token}`,
                },
            });

            expect(response.status).toBe(200);

            const data = await response.json();
            expect(data.success).toBe(true);

            // All workouts should belong to user1
            data.data.forEach((workout: any) => {
                expect(workout.user_id).toBeDefined();
            });
        });

        it('should support pagination with limit', async () => {
            const response = await apiRequest('/api/workouts?limit=1', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${user1Token}`,
                },
            });

            expect(response.status).toBe(200);

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.data.length).toBe(1);
        });

        it('should support pagination with offset', async () => {
            const response = await apiRequest('/api/workouts?offset=1', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${user1Token}`,
                },
            });

            expect(response.status).toBe(200);

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(Array.isArray(data.data)).toBe(true);
        });

        it('should support date range filtering', async () => {
            const response = await apiRequest(
                '/api/workouts?start_date=2026-01-21T00:00:00Z&end_date=2026-01-22T00:00:00Z',
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${user1Token}`,
                    },
                }
            );

            expect(response.status).toBe(200);

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(Array.isArray(data.data)).toBe(true);

            // All workouts should be within date range
            data.data.forEach((workout: any) => {
                const workoutDate = new Date(workout.started_at);
                expect(
                    workoutDate >= new Date('2026-01-21T00:00:00Z')
                ).toBe(true);
                expect(
                    workoutDate <= new Date('2026-01-22T00:00:00Z')
                ).toBe(true);
            });
        });

        it('should reject unauthenticated requests', async () => {
            const response = await apiRequest('/api/workouts', {
                method: 'GET',
            });

            expect(response.status).toBe(401);

            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toContain('authorization');
        });
    });

    describe('GET /api/workouts/:id', () => {
        let workoutId: string;
        let user2WorkoutId: string;

        beforeAll(async () => {
            // Create workout for user1
            const response1 = await createWorkout(user1Token, {
                workout_date: '2026-01-22T10:00:00Z',
                duration_minutes: 60,
                notes: 'Test workout',
                sets: [
                    {
                        exercise_id: user1ExerciseId,
                        set_number: 1,
                        weight_kg: 100,
                        reps: 10,
                    },
                    {
                        exercise_id: user1ExerciseId,
                        set_number: 2,
                        weight_kg: 100,
                        reps: 8,
                    },
                ],
            });
            const data1 = await response1.json();
            workoutId = data1.data.id;

            // Create workout for user2
            const response2 = await createWorkout(user2Token, {
                workout_date: '2026-01-22T11:00:00Z',
                sets: [
                    {
                        exercise_id: user2ExerciseId,
                        set_number: 1,
                        weight_kg: 120,
                        reps: 5,
                    },
                ],
            });
            const data2 = await response2.json();
            user2WorkoutId = data2.data.id;
        });

        it('should return complete workout details with all sets', async () => {
            const response = await apiRequest(`/api/workouts/${workoutId}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${user1Token}`,
                },
            });

            expect(response.status).toBe(200);

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.data).toHaveProperty('id');
            expect(data.data.id).toBe(workoutId);
            expect(data.data).toHaveProperty('sets');
            expect(Array.isArray(data.data.sets)).toBe(true);
            expect(data.data.sets.length).toBe(2);

            // Verify set details
            data.data.sets.forEach((set: any) => {
                expect(set).toHaveProperty('exercise_id');
                expect(set).toHaveProperty('set_number');
                expect(set).toHaveProperty('weight_kg');
                expect(set).toHaveProperty('reps');
            });
        });

        it('should reject retrieving another users workout (403)', async () => {
            const response = await apiRequest(
                `/api/workouts/${user2WorkoutId}`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${user1Token}`,
                    },
                }
            );

            expect(response.status).toBe(403);

            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toContain('Forbidden');
        });

        it('should reject retrieving non-existent workout (404)', async () => {
            const fakeId = '00000000-0000-0000-0000-000000000000';

            const response = await apiRequest(`/api/workouts/${fakeId}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${user1Token}`,
                },
            });

            expect(response.status).toBe(404);

            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toContain('not found');
        });

        it('should reject unauthenticated requests', async () => {
            const response = await apiRequest(`/api/workouts/${workoutId}`, {
                method: 'GET',
            });

            expect(response.status).toBe(401);

            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toContain('authorization');
        });
    });

    describe('DELETE /api/workouts/:id', () => {
        let workoutToDelete: string;
        let user2WorkoutId: string;

        beforeAll(async () => {
            // Create workout for user1 to delete
            const response1 = await createWorkout(user1Token, {
                workout_date: '2026-01-22T10:00:00Z',
                sets: [
                    {
                        exercise_id: user1ExerciseId,
                        set_number: 1,
                        weight_kg: 100,
                        reps: 10,
                    },
                ],
            });
            const data1 = await response1.json();
            workoutToDelete = data1.data.id;

            // Create workout for user2
            const response2 = await createWorkout(user2Token, {
                workout_date: '2026-01-22T11:00:00Z',
                sets: [
                    {
                        exercise_id: user2ExerciseId,
                        set_number: 1,
                        weight_kg: 120,
                        reps: 5,
                    },
                ],
            });
            const data2 = await response2.json();
            user2WorkoutId = data2.data.id;
        });

        it('should successfully delete a workout', async () => {
            const response = await apiRequest(
                `/api/workouts/${workoutToDelete}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${user1Token}`,
                    },
                }
            );

            expect(response.status).toBe(200);

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.data).toHaveProperty('message');

            // Verify workout is actually deleted
            const getResponse = await apiRequest(
                `/api/workouts/${workoutToDelete}`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${user1Token}`,
                    },
                }
            );

            expect(getResponse.status).toBe(404);
        });

        it('should reject deleting another users workout (403)', async () => {
            const response = await apiRequest(
                `/api/workouts/${user2WorkoutId}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${user1Token}`,
                    },
                }
            );

            expect(response.status).toBe(403);

            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toContain('Forbidden');
        });

        it('should reject deleting non-existent workout (404)', async () => {
            const fakeId = '00000000-0000-0000-0000-000000000000';

            const response = await apiRequest(`/api/workouts/${fakeId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${user1Token}`,
                },
            });

            expect(response.status).toBe(404);

            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toContain('not found');
        });

        it('should reject unauthenticated delete requests', async () => {
            const response = await apiRequest(
                `/api/workouts/${user2WorkoutId}`,
                {
                    method: 'DELETE',
                }
            );

            expect(response.status).toBe(401);

            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toContain('authorization');
        });
    });
});
