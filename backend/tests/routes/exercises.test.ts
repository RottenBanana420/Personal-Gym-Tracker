/**
 * Comprehensive exercise CRUD endpoint tests
 * Following TDD: These tests are written FIRST and should initially fail
 * Tests cover: GET, POST, PUT, DELETE operations with full authorization checks
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { supabaseAdmin } from '../../src/config/supabase';

const API_URL = 'http://localhost:3000';

// Test user credentials
const testUser1 = {
    email: 'exercise-test-user-1@example.com',
    password: 'SecurePassword123',
};

const testUser2 = {
    email: 'exercise-test-user-2@example.com',
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
    const signupResponse = await apiRequest('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(userCredentials),
    });

    const signupData = await signupResponse.json();
    return signupData.data.session.access_token;
}

// Helper to create an exercise
async function createExercise(
    token: string,
    exerciseData: {
        name: string;
        muscle_group: string;
        equipment_type: string;
        description?: string;
    }
) {
    const response = await apiRequest('/api/exercises', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(exerciseData),
    });

    return response;
}

describe('Exercise CRUD Endpoints', () => {
    let user1Token: string;
    let user2Token: string;

    beforeAll(async () => {
        // Clean up any existing test users
        await cleanupTestUsers();

        // Create test users
        user1Token = await createTestUser(testUser1);
        user2Token = await createTestUser(testUser2);
    });

    afterAll(async () => {
        // Clean up test users after all tests
        await cleanupTestUsers();
    });

    describe('POST /api/exercises', () => {
        it('should successfully create an exercise with valid data', async () => {
            const exerciseData = {
                name: 'Bench Press',
                muscle_group: 'Chest',
                equipment_type: 'Barbell',
                description: 'Classic chest exercise',
            };

            const response = await createExercise(user1Token, exerciseData);

            expect(response.status).toBe(201);

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.data).toHaveProperty('id');
            expect(data.data.name).toBe(exerciseData.name);
            expect(data.data.muscle_group).toBe(exerciseData.muscle_group);
            expect(data.data.equipment_type).toBe(exerciseData.equipment_type);
            expect(data.data.description).toBe(exerciseData.description);
            expect(data.data).toHaveProperty('created_at');
        });

        it('should reject exercise creation without authentication', async () => {
            const exerciseData = {
                name: 'Squat',
                muscle_group: 'Legs',
                equipment_type: 'Barbell',
            };

            const response = await apiRequest('/api/exercises', {
                method: 'POST',
                body: JSON.stringify(exerciseData),
            });

            expect(response.status).toBe(401);

            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toContain('authorization');
        });

        it('should reject exercise with missing name', async () => {
            const exerciseData = {
                muscle_group: 'Back',
                equipment_type: 'Cable',
            };

            const response = await apiRequest('/api/exercises', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${user1Token}`,
                },
                body: JSON.stringify(exerciseData),
            });

            expect(response.status).toBe(400);

            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toContain('name');
        });

        it('should reject exercise with missing muscle_group', async () => {
            const exerciseData = {
                name: 'Deadlift',
                equipment_type: 'Barbell',
            };

            const response = await apiRequest('/api/exercises', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${user1Token}`,
                },
                body: JSON.stringify(exerciseData),
            });

            expect(response.status).toBe(400);

            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toContain('muscle_group');
        });

        it('should reject exercise with missing equipment_type', async () => {
            const exerciseData = {
                name: 'Pull-ups',
                muscle_group: 'Back',
            };

            const response = await apiRequest('/api/exercises', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${user1Token}`,
                },
                body: JSON.stringify(exerciseData),
            });

            expect(response.status).toBe(400);

            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toContain('equipment_type');
        });

        it('should reject exercise with invalid muscle_group', async () => {
            const exerciseData = {
                name: 'Invalid Exercise',
                muscle_group: 'InvalidMuscle',
                equipment_type: 'Barbell',
            };

            const response = await apiRequest('/api/exercises', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${user1Token}`,
                },
                body: JSON.stringify(exerciseData),
            });

            expect(response.status).toBe(400);

            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toContain('muscle_group');
        });

        it('should reject exercise with invalid equipment_type', async () => {
            const exerciseData = {
                name: 'Invalid Exercise',
                muscle_group: 'Chest',
                equipment_type: 'InvalidEquipment',
            };

            const response = await apiRequest('/api/exercises', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${user1Token}`,
                },
                body: JSON.stringify(exerciseData),
            });

            expect(response.status).toBe(400);

            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toContain('equipment_type');
        });

        it('should reject exercise with name too long', async () => {
            const exerciseData = {
                name: 'a'.repeat(101), // 101 characters
                muscle_group: 'Chest',
                equipment_type: 'Barbell',
            };

            const response = await apiRequest('/api/exercises', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${user1Token}`,
                },
                body: JSON.stringify(exerciseData),
            });

            expect(response.status).toBe(400);

            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toContain('name');
        });

        it('should automatically set user_id from authenticated user', async () => {
            const exerciseData = {
                name: 'User ID Test Exercise',
                muscle_group: 'Arms',
                equipment_type: 'Dumbbell',
            };

            const response = await createExercise(user1Token, exerciseData);

            expect(response.status).toBe(201);

            const data = await response.json();
            expect(data.data).toHaveProperty('user_id');
            // The user_id should be set server-side, not from request
        });
    });

    describe('GET /api/exercises', () => {
        beforeAll(async () => {
            // Create some test exercises for user1
            await createExercise(user1Token, {
                name: 'Barbell Squat',
                muscle_group: 'Legs',
                equipment_type: 'Barbell',
            });

            await createExercise(user1Token, {
                name: 'Dumbbell Curl',
                muscle_group: 'Arms',
                equipment_type: 'Dumbbell',
            });

            await createExercise(user1Token, {
                name: 'Cable Row',
                muscle_group: 'Back',
                equipment_type: 'Cable',
            });

            // Create exercise for user2
            await createExercise(user2Token, {
                name: 'User2 Exercise',
                muscle_group: 'Chest',
                equipment_type: 'Machine',
            });
        });

        it('should return all exercises for authenticated user', async () => {
            const response = await apiRequest('/api/exercises', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${user1Token}`,
                },
            });

            expect(response.status).toBe(200);

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(Array.isArray(data.data)).toBe(true);
            expect(data.data.length).toBeGreaterThan(0);

            // Verify all exercises belong to user1
            data.data.forEach((exercise: any) => {
                expect(exercise).toHaveProperty('id');
                expect(exercise).toHaveProperty('name');
                expect(exercise).toHaveProperty('muscle_group');
                expect(exercise).toHaveProperty('equipment_type');
            });
        });

        it('should return empty array when user has no exercises', async () => {
            // Create a new user with no exercises
            const newUser = {
                email: 'no-exercises@example.com',
                password: 'TestPassword123',
            };
            const newUserToken = await createTestUser(newUser);

            const response = await apiRequest('/api/exercises', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${newUserToken}`,
                },
            });

            expect(response.status).toBe(200);

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(Array.isArray(data.data)).toBe(true);
            expect(data.data.length).toBe(0);

            // Cleanup
            const { data: users } = await supabaseAdmin.auth.admin.listUsers();
            const userToDelete = users?.users.find(
                (u) => u.email === newUser.email
            );
            if (userToDelete) {
                await supabaseAdmin.auth.admin.deleteUser(userToDelete.id);
            }
        });

        it('should filter exercises by muscle_group', async () => {
            const response = await apiRequest(
                '/api/exercises?muscle_group=Legs',
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

            // All returned exercises should have muscle_group = 'Legs'
            data.data.forEach((exercise: any) => {
                expect(exercise.muscle_group).toBe('Legs');
            });
        });

        it('should filter exercises by equipment_type', async () => {
            const response = await apiRequest(
                '/api/exercises?equipment_type=Dumbbell',
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

            // All returned exercises should have equipment_type = 'Dumbbell'
            data.data.forEach((exercise: any) => {
                expect(exercise.equipment_type).toBe('Dumbbell');
            });
        });

        it('should sort exercises by name ascending', async () => {
            const response = await apiRequest('/api/exercises?sort=name_asc', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${user1Token}`,
                },
            });

            expect(response.status).toBe(200);

            const data = await response.json();
            expect(data.success).toBe(true);

            // Verify sorting
            for (let i = 1; i < data.data.length; i++) {
                expect(
                    data.data[i - 1].name.localeCompare(data.data[i].name)
                ).toBeLessThanOrEqual(0);
            }
        });

        it('should sort exercises by name descending', async () => {
            const response = await apiRequest('/api/exercises?sort=name_desc', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${user1Token}`,
                },
            });

            expect(response.status).toBe(200);

            const data = await response.json();
            expect(data.success).toBe(true);

            // Verify sorting
            for (let i = 1; i < data.data.length; i++) {
                expect(
                    data.data[i - 1].name.localeCompare(data.data[i].name)
                ).toBeGreaterThanOrEqual(0);
            }
        });

        it('should return only current users exercises (data isolation)', async () => {
            const response = await apiRequest('/api/exercises', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${user1Token}`,
                },
            });

            expect(response.status).toBe(200);

            const data = await response.json();
            expect(data.success).toBe(true);

            // Should not contain user2's exercises
            const user2Exercise = data.data.find(
                (ex: any) => ex.name === 'User2 Exercise'
            );
            expect(user2Exercise).toBeUndefined();
        });

        it('should reject unauthenticated requests', async () => {
            const response = await apiRequest('/api/exercises', {
                method: 'GET',
            });

            expect(response.status).toBe(401);

            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toContain('authorization');
        });
    });

    describe('PUT /api/exercises/:id', () => {
        let exerciseId: string;
        let user2ExerciseId: string;

        beforeAll(async () => {
            // Create exercise for user1
            const response1 = await createExercise(user1Token, {
                name: 'Exercise to Update',
                muscle_group: 'Chest',
                equipment_type: 'Barbell',
            });
            const data1 = await response1.json();
            exerciseId = data1.data.id;

            // Create exercise for user2
            const response2 = await createExercise(user2Token, {
                name: 'User2 Exercise to Protect',
                muscle_group: 'Back',
                equipment_type: 'Cable',
            });
            const data2 = await response2.json();
            user2ExerciseId = data2.data.id;
        });

        it('should successfully update an exercise', async () => {
            const updateData = {
                name: 'Updated Exercise Name',
                muscle_group: 'Shoulders',
                equipment_type: 'Dumbbell',
                description: 'Updated description',
            };

            const response = await apiRequest(`/api/exercises/${exerciseId}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${user1Token}`,
                },
                body: JSON.stringify(updateData),
            });

            expect(response.status).toBe(200);

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.data.id).toBe(exerciseId);
            expect(data.data.name).toBe(updateData.name);
            expect(data.data.muscle_group).toBe(updateData.muscle_group);
            expect(data.data.equipment_type).toBe(updateData.equipment_type);
            expect(data.data.description).toBe(updateData.description);
        });

        it('should support partial updates', async () => {
            const updateData = {
                name: 'Partially Updated Name',
            };

            const response = await apiRequest(`/api/exercises/${exerciseId}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${user1Token}`,
                },
                body: JSON.stringify(updateData),
            });

            expect(response.status).toBe(200);

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.data.name).toBe(updateData.name);
            // Other fields should remain unchanged
            expect(data.data.muscle_group).toBeDefined();
            expect(data.data.equipment_type).toBeDefined();
        });

        it('should reject updating another users exercise (403)', async () => {
            const updateData = {
                name: 'Trying to Update User2 Exercise',
            };

            const response = await apiRequest(
                `/api/exercises/${user2ExerciseId}`,
                {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${user1Token}`,
                    },
                    body: JSON.stringify(updateData),
                }
            );

            expect(response.status).toBe(403);

            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toContain('Forbidden');
        });

        it('should reject updating non-existent exercise (404)', async () => {
            const fakeId = '00000000-0000-0000-0000-000000000000';
            const updateData = {
                name: 'Updated Name',
            };

            const response = await apiRequest(`/api/exercises/${fakeId}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${user1Token}`,
                },
                body: JSON.stringify(updateData),
            });

            expect(response.status).toBe(404);

            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toContain('not found');
        });

        it('should reject update with invalid data', async () => {
            const updateData = {
                muscle_group: 'InvalidMuscleGroup',
            };

            const response = await apiRequest(`/api/exercises/${exerciseId}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${user1Token}`,
                },
                body: JSON.stringify(updateData),
            });

            expect(response.status).toBe(400);

            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toContain('muscle_group');
        });

        it('should reject unauthenticated update requests', async () => {
            const updateData = {
                name: 'Updated Name',
            };

            const response = await apiRequest(`/api/exercises/${exerciseId}`, {
                method: 'PUT',
                body: JSON.stringify(updateData),
            });

            expect(response.status).toBe(401);

            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toContain('authorization');
        });
    });

    describe('DELETE /api/exercises/:id', () => {
        let exerciseToDelete: string;
        let user2ExerciseId: string;

        beforeAll(async () => {
            // Create exercise for user1 to delete
            const response1 = await createExercise(user1Token, {
                name: 'Exercise to Delete',
                muscle_group: 'Legs',
                equipment_type: 'Bodyweight',
            });
            const data1 = await response1.json();
            exerciseToDelete = data1.data.id;

            // Create exercise for user2
            const response2 = await createExercise(user2Token, {
                name: 'User2 Protected Exercise',
                muscle_group: 'Core',
                equipment_type: 'Bodyweight',
            });
            const data2 = await response2.json();
            user2ExerciseId = data2.data.id;
        });

        it('should successfully delete an exercise', async () => {
            const response = await apiRequest(
                `/api/exercises/${exerciseToDelete}`,
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

            // Verify exercise is actually deleted
            const getResponse = await apiRequest('/api/exercises', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${user1Token}`,
                },
            });

            const getData = await getResponse.json();
            const deletedExercise = getData.data.find(
                (ex: any) => ex.id === exerciseToDelete
            );
            expect(deletedExercise).toBeUndefined();
        });

        it('should reject deleting another users exercise (403)', async () => {
            const response = await apiRequest(
                `/api/exercises/${user2ExerciseId}`,
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

        it('should reject deleting non-existent exercise (404)', async () => {
            const fakeId = '00000000-0000-0000-0000-000000000000';

            const response = await apiRequest(`/api/exercises/${fakeId}`, {
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
                `/api/exercises/${user2ExerciseId}`,
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
