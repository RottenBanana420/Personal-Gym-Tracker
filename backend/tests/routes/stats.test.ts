/**
 * Comprehensive statistics endpoint tests
 * Following TDD: These tests are written FIRST and should initially fail
 * Tests cover: PRs, Progress, Volume, Summary endpoints with authorization and calculations
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { supabaseAdmin } from '../../src/config/supabase';

const API_URL = 'http://localhost:3000';

// Test user credentials
const testUser1 = {
    email: 'stats-test-user-1@example.com',
    password: 'SecurePassword123',
};

const testUser2 = {
    email: 'stats-test-user-2@example.com',
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
    const response = await apiRequest('/api/workouts', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(workoutData),
    });

    return response;
}

describe('Statistics Endpoints', () => {
    let user1Token: string;
    let user2Token: string;
    let user1Exercise1Id: string;
    let user1Exercise2Id: string;
    let user2ExerciseId: string;

    beforeAll(async () => {
        // Clean up any existing test users
        await cleanupTestUsers();

        // Create test users
        user1Token = await createTestUser(testUser1);
        user2Token = await createTestUser(testUser2);

        // Create test exercises for user1
        user1Exercise1Id = await createExercise(user1Token, {
            name: 'Bench Press Stats',
            muscle_group: 'Chest',
            equipment_type: 'Barbell',
        });

        user1Exercise2Id = await createExercise(user1Token, {
            name: 'Squat Stats',
            muscle_group: 'Legs',
            equipment_type: 'Barbell',
        });

        // Create test exercise for user2
        user2ExerciseId = await createExercise(user2Token, {
            name: 'Deadlift Stats',
            muscle_group: 'Back',
            equipment_type: 'Barbell',
        });

        // Create workout data for user1 with known PRs
        // Workout 1: Bench Press - 100kg x 10 reps (volume: 1000)
        await createWorkout(user1Token, {
            workout_date: '2026-01-01T10:00:00Z',
            sets: [
                {
                    exercise_id: user1Exercise1Id,
                    set_number: 1,
                    weight_kg: 100,
                    reps: 10,
                },
                {
                    exercise_id: user1Exercise1Id,
                    set_number: 2,
                    weight_kg: 100,
                    reps: 8,
                },
            ],
        });

        // Workout 2: Bench Press - 120kg x 5 reps (volume: 600) - MAX WEIGHT PR
        await createWorkout(user1Token, {
            workout_date: '2026-01-08T10:00:00Z',
            sets: [
                {
                    exercise_id: user1Exercise1Id,
                    set_number: 1,
                    weight_kg: 120,
                    reps: 5,
                },
            ],
        });

        // Workout 3: Bench Press - 80kg x 15 reps (volume: 1200) - MAX VOLUME PR and MAX REPS PR
        await createWorkout(user1Token, {
            workout_date: '2026-01-15T10:00:00Z',
            sets: [
                {
                    exercise_id: user1Exercise1Id,
                    set_number: 1,
                    weight_kg: 80,
                    reps: 15,
                },
            ],
        });

        // Workout 4: Squat - 150kg x 8 reps
        await createWorkout(user1Token, {
            workout_date: '2026-01-10T10:00:00Z',
            sets: [
                {
                    exercise_id: user1Exercise2Id,
                    set_number: 1,
                    weight_kg: 150,
                    reps: 8,
                },
                {
                    exercise_id: user1Exercise2Id,
                    set_number: 2,
                    weight_kg: 150,
                    reps: 6,
                },
            ],
        });

        // Create workout for user2
        await createWorkout(user2Token, {
            workout_date: '2026-01-20T10:00:00Z',
            sets: [
                {
                    exercise_id: user2ExerciseId,
                    set_number: 1,
                    weight_kg: 200,
                    reps: 5,
                },
            ],
        });
    });

    afterAll(async () => {
        // Clean up test users after all tests
        await cleanupTestUsers();
    });

    describe('GET /api/stats/prs', () => {
        describe('Success Cases', () => {
            it('should return personal records for all exercises', async () => {
                const response = await apiRequest('/api/stats/prs', {
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

                // Verify structure
                data.data.forEach((pr: any) => {
                    expect(pr).toHaveProperty('exercise_id');
                    expect(pr).toHaveProperty('exercise_name');
                    expect(pr).toHaveProperty('max_weight');
                    expect(pr).toHaveProperty('max_reps');
                    expect(pr).toHaveProperty('max_volume');
                });
            });

            it('should calculate max weight PR correctly', async () => {
                const response = await apiRequest('/api/stats/prs', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${user1Token}`,
                    },
                });

                const data = await response.json();
                const benchPressPR = data.data.find(
                    (pr: any) => pr.exercise_id === user1Exercise1Id
                );

                expect(benchPressPR).toBeDefined();
                expect(benchPressPR.max_weight.value).toBe(120);
                expect(benchPressPR.max_weight.reps).toBe(5);
                expect(benchPressPR.max_weight.date).toBeDefined();
            });

            it('should calculate max reps PR correctly', async () => {
                const response = await apiRequest('/api/stats/prs', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${user1Token}`,
                    },
                });

                const data = await response.json();
                const benchPressPR = data.data.find(
                    (pr: any) => pr.exercise_id === user1Exercise1Id
                );

                expect(benchPressPR).toBeDefined();
                expect(benchPressPR.max_reps.value).toBe(15);
                expect(benchPressPR.max_reps.weight).toBe(80);
                expect(benchPressPR.max_reps.date).toBeDefined();
            });

            it('should calculate max volume PR correctly', async () => {
                const response = await apiRequest('/api/stats/prs', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${user1Token}`,
                    },
                });

                const data = await response.json();
                const benchPressPR = data.data.find(
                    (pr: any) => pr.exercise_id === user1Exercise1Id
                );

                expect(benchPressPR).toBeDefined();
                // Max volume should be 80kg x 15 reps = 1200
                expect(benchPressPR.max_volume.value).toBe(1200);
                expect(benchPressPR.max_volume.date).toBeDefined();
            });

            it('should return empty array for user with no workouts', async () => {
                // Create a new user with no workouts
                const newUser = {
                    email: 'stats-no-workouts@example.com',
                    password: 'SecurePassword123',
                };
                const newUserToken = await createTestUser(newUser);

                const response = await apiRequest('/api/stats/prs', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${newUserToken}`,
                    },
                });

                expect(response.status).toBe(200);
                const data = await response.json();
                expect(data.success).toBe(true);
                expect(data.data).toEqual([]);

                // Cleanup
                const { data: users } = await supabaseAdmin.auth.admin.listUsers();
                const userToDelete = users?.users.find(u => u.email === newUser.email);
                if (userToDelete) {
                    await supabaseAdmin.auth.admin.deleteUser(userToDelete.id);
                }
            });
        });

        describe('Authorization', () => {
            it('should only return PRs for authenticated user', async () => {
                const response = await apiRequest('/api/stats/prs', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${user1Token}`,
                    },
                });

                const data = await response.json();
                
                // User1 should not see user2's exercise PRs
                const user2ExercisePR = data.data.find(
                    (pr: any) => pr.exercise_id === user2ExerciseId
                );
                expect(user2ExercisePR).toBeUndefined();
            });

            it('should reject unauthenticated requests', async () => {
                const response = await apiRequest('/api/stats/prs', {
                    method: 'GET',
                });

                expect(response.status).toBe(401);
                const data = await response.json();
                expect(data.success).toBe(false);
            });
        });
    });

    describe('GET /api/stats/progress/:exerciseId', () => {
        describe('Success Cases', () => {
            it('should return historical progress data for exercise', async () => {
                const response = await apiRequest(
                    `/api/stats/progress/${user1Exercise1Id}`,
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
                expect(data.data.length).toBeGreaterThanOrEqual(3);

                // Verify structure
                data.data.forEach((point: any) => {
                    expect(point).toHaveProperty('date');
                    expect(point).toHaveProperty('avg_weight');
                    expect(point).toHaveProperty('max_weight');
                    expect(point).toHaveProperty('total_reps');
                    expect(point).toHaveProperty('total_volume');
                });
            });

            it('should return data in chronological order', async () => {
                const response = await apiRequest(
                    `/api/stats/progress/${user1Exercise1Id}`,
                    {
                        method: 'GET',
                        headers: {
                            Authorization: `Bearer ${user1Token}`,
                        },
                    }
                );

                const data = await response.json();
                
                // Verify chronological order
                for (let i = 1; i < data.data.length; i++) {
                    const prevDate = new Date(data.data[i - 1].date);
                    const currDate = new Date(data.data[i].date);
                    expect(prevDate.getTime()).toBeLessThanOrEqual(currDate.getTime());
                }
            });

            it('should filter by 4weeks period', async () => {
                const response = await apiRequest(
                    `/api/stats/progress/${user1Exercise1Id}?period=4weeks`,
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

                // All data points should be within last 4 weeks
                const fourWeeksAgo = new Date();
                fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

                data.data.forEach((point: any) => {
                    const pointDate = new Date(point.date);
                    expect(pointDate.getTime()).toBeGreaterThanOrEqual(fourWeeksAgo.getTime());
                });
            });

            it('should return empty array for exercise with no workouts', async () => {
                // Create exercise with no workouts
                const emptyExerciseId = await createExercise(user1Token, {
                    name: 'Empty Exercise Stats',
                    muscle_group: 'Arms',
                    equipment_type: 'Dumbbell',
                });

                const response = await apiRequest(
                    `/api/stats/progress/${emptyExerciseId}`,
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
                expect(data.data).toEqual([]);
            });
        });

        describe('Authorization', () => {
            it('should reject access to another users exercise', async () => {
                const response = await apiRequest(
                    `/api/stats/progress/${user2ExerciseId}`,
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

            it('should return 404 for non-existent exercise', async () => {
                const fakeExerciseId = '00000000-0000-0000-0000-000000000000';
                const response = await apiRequest(
                    `/api/stats/progress/${fakeExerciseId}`,
                    {
                        method: 'GET',
                        headers: {
                            Authorization: `Bearer ${user1Token}`,
                        },
                    }
                );

                expect(response.status).toBe(404);
                const data = await response.json();
                expect(data.success).toBe(false);
            });

            it('should reject unauthenticated requests', async () => {
                const response = await apiRequest(
                    `/api/stats/progress/${user1Exercise1Id}`,
                    {
                        method: 'GET',
                    }
                );

                expect(response.status).toBe(401);
                const data = await response.json();
                expect(data.success).toBe(false);
            });
        });
    });

    describe('GET /api/stats/volume', () => {
        describe('Success Cases', () => {
            it('should return volume data grouped by week', async () => {
                const response = await apiRequest('/api/stats/volume?groupBy=week', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${user1Token}`,
                    },
                });

                expect(response.status).toBe(200);

                const data = await response.json();
                expect(data.success).toBe(true);
                expect(Array.isArray(data.data)).toBe(true);

                // Verify structure
                data.data.forEach((point: any) => {
                    expect(point).toHaveProperty('period');
                    expect(point).toHaveProperty('total_volume');
                    expect(point).toHaveProperty('by_muscle_group');
                    expect(Array.isArray(point.by_muscle_group)).toBe(true);
                });
            });

            it('should calculate total volume correctly', async () => {
                const response = await apiRequest('/api/stats/volume', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${user1Token}`,
                    },
                });

                const data = await response.json();
                
                // Verify volume calculations (weight × reps)
                data.data.forEach((point: any) => {
                    expect(point.total_volume).toBeGreaterThan(0);
                    
                    // Sum of muscle group volumes should equal total
                    const sumByMuscleGroup = point.by_muscle_group.reduce(
                        (sum: number, mg: any) => sum + mg.volume,
                        0
                    );
                    expect(Math.abs(sumByMuscleGroup - point.total_volume)).toBeLessThan(1);
                });
            });

            it('should handle decimal weights correctly', async () => {
                // Create workout with decimal weight
                const decimalExerciseId = await createExercise(user1Token, {
                    name: 'Decimal Weight Exercise',
                    muscle_group: 'Arms',
                    equipment_type: 'Dumbbell',
                });

                await createWorkout(user1Token, {
                    workout_date: '2026-01-22T10:00:00Z',
                    sets: [
                        {
                            exercise_id: decimalExerciseId,
                            set_number: 1,
                            weight_kg: 22.5,
                            reps: 12,
                        },
                    ],
                });

                const response = await apiRequest('/api/stats/volume', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${user1Token}`,
                    },
                });

                expect(response.status).toBe(200);
                const data = await response.json();
                expect(data.success).toBe(true);
            });

            it('should group by month correctly', async () => {
                const response = await apiRequest('/api/stats/volume?groupBy=month', {
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
        });

        describe('Authorization', () => {
            it('should only return volume for authenticated user', async () => {
                const response = await apiRequest('/api/stats/volume', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${user1Token}`,
                    },
                });

                expect(response.status).toBe(200);
                const data = await response.json();
                
                // Should not include user2's data
                expect(data.success).toBe(true);
            });

            it('should reject unauthenticated requests', async () => {
                const response = await apiRequest('/api/stats/volume', {
                    method: 'GET',
                });

                expect(response.status).toBe(401);
                const data = await response.json();
                expect(data.success).toBe(false);
            });
        });
    });

    describe('GET /api/stats/summary', () => {
        describe('Success Cases', () => {
            it('should return comprehensive summary statistics', async () => {
                const response = await apiRequest('/api/stats/summary', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${user1Token}`,
                    },
                });

                expect(response.status).toBe(200);

                const data = await response.json();
                expect(data.success).toBe(true);
                expect(data.data).toHaveProperty('total_workouts');
                expect(data.data).toHaveProperty('total_workouts_this_month');
                expect(data.data).toHaveProperty('total_workouts_this_week');
                expect(data.data).toHaveProperty('total_sets_this_week');
                expect(data.data).toHaveProperty('total_sets_this_month');
                expect(data.data).toHaveProperty('most_trained_muscle_group');
                expect(data.data).toHaveProperty('current_streak');
                expect(data.data).toHaveProperty('avg_workouts_per_week');
            });

            it('should count total workouts correctly', async () => {
                const response = await apiRequest('/api/stats/summary', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${user1Token}`,
                    },
                });

                const data = await response.json();
                
                // User1 has 4+ workouts
                expect(data.data.total_workouts).toBeGreaterThanOrEqual(4);
                expect(typeof data.data.total_workouts).toBe('number');
            });

            it('should identify most trained muscle group correctly', async () => {
                const response = await apiRequest('/api/stats/summary', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${user1Token}`,
                    },
                });

                const data = await response.json();
                
                // Should have a most trained muscle group
                expect(data.data.most_trained_muscle_group).toBeDefined();
                expect(typeof data.data.most_trained_muscle_group).toBe('string');
            });

            it('should calculate workout streak correctly', async () => {
                const response = await apiRequest('/api/stats/summary', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${user1Token}`,
                    },
                });

                const data = await response.json();
                
                expect(typeof data.data.current_streak).toBe('number');
                expect(data.data.current_streak).toBeGreaterThanOrEqual(0);
            });

            it('should return zero stats for user with no workouts', async () => {
                const newUser = {
                    email: 'stats-no-data@example.com',
                    password: 'SecurePassword123',
                };
                const newUserToken = await createTestUser(newUser);

                const response = await apiRequest('/api/stats/summary', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${newUserToken}`,
                    },
                });

                expect(response.status).toBe(200);
                const data = await response.json();
                expect(data.data.total_workouts).toBe(0);
                expect(data.data.total_workouts_this_month).toBe(0);
                expect(data.data.total_workouts_this_week).toBe(0);
                expect(data.data.current_streak).toBe(0);

                // Cleanup
                const { data: users } = await supabaseAdmin.auth.admin.listUsers();
                const userToDelete = users?.users.find(u => u.email === newUser.email);
                if (userToDelete) {
                    await supabaseAdmin.auth.admin.deleteUser(userToDelete.id);
                }
            });
        });

        describe('Authorization', () => {
            it('should only return summary for authenticated user', async () => {
                const user1Response = await apiRequest('/api/stats/summary', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${user1Token}`,
                    },
                });

                const user2Response = await apiRequest('/api/stats/summary', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${user2Token}`,
                    },
                });

                const user1Data = await user1Response.json();
                const user2Data = await user2Response.json();

                // Different users should have different stats
                expect(user1Data.data.total_workouts).not.toBe(
                    user2Data.data.total_workouts
                );
            });

            it('should reject unauthenticated requests', async () => {
                const response = await apiRequest('/api/stats/summary', {
                    method: 'GET',
                });

                expect(response.status).toBe(401);
                const data = await response.json();
                expect(data.success).toBe(false);
            });
        });
    });
});
