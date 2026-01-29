/**
 * Comprehensive Integration Tests
 * Tests complete user workflows, multi-user isolation, error handling,
 * concurrent operations, and performance benchmarks
 *
 * CRITICAL: These tests define the API contract and should NOT be modified
 * unless the API contract itself changes. They represent what the frontend
 * can expect from the backend.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
    createTestUser,
    cleanupTestUsers,
    createTestExercise,
    createTestWorkout,
    apiRequest,
    measureResponseTime,
    waitForConcurrent,
    generateTestEmail,
    sleep,
    type TestUser,
    type TestExercise,
} from './test-helpers';

describe('Integration Tests', () => {
    const testUsers: TestUser[] = [];

    afterAll(async () => {
        // Cleanup all test users
        const userIds = testUsers
            .filter((u) => u.id)
            .map((u) => u.id as string);
        await cleanupTestUsers(userIds);
    });

    describe('Complete User Journey', () => {
        let user: TestUser;
        let exercises: TestExercise[] = [];
        let workoutId: string;

        it('should complete full user journey: signup → exercises → workouts → stats → logout', async () => {
            // Step 1: Signup
            const email = generateTestEmail('journey');
            const password = 'SecurePassword123';

            user = await createTestUser(email, password);
            testUsers.push(user);

            expect(user.id).toBeDefined();
            expect(user.accessToken).toBeDefined();
            expect(user.refreshToken).toBeDefined();

            // Step 2: Create multiple exercises (different muscle groups)
            const exerciseData = [
                {
                    name: 'Bench Press',
                    muscle_group: 'Chest',
                    equipment_type: 'Barbell',
                },
                {
                    name: 'Squat',
                    muscle_group: 'Legs',
                    equipment_type: 'Barbell',
                },
                {
                    name: 'Deadlift',
                    muscle_group: 'Back',
                    equipment_type: 'Barbell',
                },
                {
                    name: 'Overhead Press',
                    muscle_group: 'Shoulders',
                    equipment_type: 'Barbell',
                },
                {
                    name: 'Bicep Curl',
                    muscle_group: 'Arms',
                    equipment_type: 'Dumbbell',
                },
            ];

            for (const data of exerciseData) {
                const exercise = await createTestExercise(
                    user.accessToken!,
                    data
                );
                exercises.push(exercise);
                expect(exercise.id).toBeDefined();
                expect(exercise.name).toBe(data.name);
            }

            expect(exercises.length).toBe(5);

            // Step 3: Create workout with sets referencing exercises
            const workout = await createTestWorkout(user.accessToken!, {
                workout_date: new Date().toISOString(),
                duration_minutes: 90,
                notes: 'Full body workout',
                sets: [
                    {
                        exercise_id: exercises[0].id!,
                        set_number: 1,
                        weight_kg: 100,
                        reps: 10,
                    },
                    {
                        exercise_id: exercises[0].id!,
                        set_number: 2,
                        weight_kg: 100,
                        reps: 8,
                    },
                    {
                        exercise_id: exercises[1].id!,
                        set_number: 1,
                        weight_kg: 140,
                        reps: 5,
                    },
                    {
                        exercise_id: exercises[2].id!,
                        set_number: 1,
                        weight_kg: 180,
                        reps: 5,
                    },
                ],
            });

            workoutId = workout.id!;
            expect(workoutId).toBeDefined();
            expect(workout.sets).toBeDefined();
            expect(workout.sets!.length).toBe(4);

            // Step 4: Retrieve workout history
            const historyResponse = await apiRequest('/api/workouts', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${user.accessToken}`,
                },
            });

            expect(historyResponse.status).toBe(200);
            const historyData = await historyResponse.json();
            expect(historyData.success).toBe(true);
            expect(historyData.data.length).toBeGreaterThan(0);
            expect(
                historyData.data.some((w: any) => w.id === workoutId)
            ).toBe(true);

            // Step 5: Retrieve statistics - PRs
            const prsResponse = await apiRequest('/api/stats/prs', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${user.accessToken}`,
                },
            });

            expect(prsResponse.status).toBe(200);
            const prsData = await prsResponse.json();
            expect(prsData.success).toBe(true);
            expect(prsData.data.length).toBeGreaterThan(0);

            // Step 6: Retrieve statistics - Progress for specific exercise
            const progressResponse = await apiRequest(
                `/api/stats/progress/${exercises[0].id}?period=4weeks`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${user.accessToken}`,
                    },
                }
            );

            expect(progressResponse.status).toBe(200);
            const progressData = await progressResponse.json();
            expect(progressData.success).toBe(true);

            // Step 7: Retrieve statistics - Volume
            const volumeResponse = await apiRequest(
                '/api/stats/volume?groupBy=week&period=4weeks',
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${user.accessToken}`,
                    },
                }
            );

            expect(volumeResponse.status).toBe(200);
            const volumeData = await volumeResponse.json();
            expect(volumeData.success).toBe(true);

            // Step 8: Retrieve statistics - Summary
            const summaryResponse = await apiRequest('/api/stats/summary', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${user.accessToken}`,
                },
            });

            expect(summaryResponse.status).toBe(200);
            const summaryData = await summaryResponse.json();
            expect(summaryData.success).toBe(true);
            expect(summaryData.data).toHaveProperty('total_workouts');
            expect(summaryData.data).toHaveProperty('total_exercises');

            // Step 9: Update an exercise
            const updateResponse = await apiRequest(
                `/api/exercises/${exercises[0].id}`,
                {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${user.accessToken}`,
                    },
                    body: JSON.stringify({
                        name: 'Bench Press - Updated',
                        description: 'Updated description',
                    }),
                }
            );

            expect(updateResponse.status).toBe(200);
            const updateData = await updateResponse.json();
            expect(updateData.success).toBe(true);
            expect(updateData.data.name).toBe('Bench Press - Updated');

            // Step 10: Delete a workout
            const deleteResponse = await apiRequest(
                `/api/workouts/${workoutId}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${user.accessToken}`,
                    },
                }
            );

            expect(deleteResponse.status).toBe(200);
            const deleteData = await deleteResponse.json();
            expect(deleteData.success).toBe(true);

            // Verify workout is deleted
            const verifyResponse = await apiRequest(
                `/api/workouts/${workoutId}`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${user.accessToken}`,
                    },
                }
            );

            expect(verifyResponse.status).toBe(404);

            // Step 11: Logout
            const logoutResponse = await apiRequest('/api/auth/logout', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${user.accessToken}`,
                },
            });

            expect(logoutResponse.status).toBe(200);
            const logoutData = await logoutResponse.json();
            expect(logoutData.success).toBe(true);
        });
    });

    describe('Multi-User Isolation (CRITICAL)', () => {
        let userA: TestUser;
        let userB: TestUser;
        let userAExercises: TestExercise[] = [];
        let userBExercises: TestExercise[] = [];
        let userAWorkoutId: string;
        let userBWorkoutId: string;

        beforeAll(async () => {
            // Create two separate users
            userA = await createTestUser(
                generateTestEmail('userA'),
                'PasswordA123'
            );
            userB = await createTestUser(
                generateTestEmail('userB'),
                'PasswordB123'
            );

            testUsers.push(userA, userB);

            // User A creates exercises and workouts
            const exerciseA1 = await createTestExercise(userA.accessToken!, {
                name: 'User A Exercise 1',
                muscle_group: 'Chest',
                equipment_type: 'Barbell',
            });
            const exerciseA2 = await createTestExercise(userA.accessToken!, {
                name: 'User A Exercise 2',
                muscle_group: 'Back',
                equipment_type: 'Dumbbell',
            });
            userAExercises.push(exerciseA1, exerciseA2);

            const workoutA = await createTestWorkout(userA.accessToken!, {
                sets: [
                    {
                        exercise_id: exerciseA1.id!,
                        set_number: 1,
                        weight_kg: 100,
                        reps: 10,
                    },
                ],
            });
            userAWorkoutId = workoutA.id!;

            // User B creates exercises and workouts
            const exerciseB1 = await createTestExercise(userB.accessToken!, {
                name: 'User B Exercise 1',
                muscle_group: 'Legs',
                equipment_type: 'Barbell',
            });
            const exerciseB2 = await createTestExercise(userB.accessToken!, {
                name: 'User B Exercise 2',
                muscle_group: 'Shoulders',
                equipment_type: 'Dumbbell',
            });
            userBExercises.push(exerciseB1, exerciseB2);

            const workoutB = await createTestWorkout(userB.accessToken!, {
                sets: [
                    {
                        exercise_id: exerciseB1.id!,
                        set_number: 1,
                        weight_kg: 120,
                        reps: 8,
                    },
                ],
            });
            userBWorkoutId = workoutB.id!;
        });

        it('should prevent User A from accessing User B exercises', async () => {
            // Try to get User B's exercise
            const response = await apiRequest(
                `/api/exercises/${userBExercises[0].id}`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${userA.accessToken}`,
                    },
                }
            );

            // Should return 403 or 404 (depending on RLS implementation)
            expect([403, 404]).toContain(response.status);
        });

        it('should prevent User A from updating User B exercises', async () => {
            const response = await apiRequest(
                `/api/exercises/${userBExercises[0].id}`,
                {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${userA.accessToken}`,
                    },
                    body: JSON.stringify({
                        name: 'Hacked Exercise',
                    }),
                }
            );

            expect([403, 404]).toContain(response.status);
        });

        it('should prevent User A from deleting User B exercises', async () => {
            const response = await apiRequest(
                `/api/exercises/${userBExercises[1].id}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${userA.accessToken}`,
                    },
                }
            );

            expect([403, 404]).toContain(response.status);
        });

        it('should prevent User A from accessing User B workouts', async () => {
            const response = await apiRequest(
                `/api/workouts/${userBWorkoutId}`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${userA.accessToken}`,
                    },
                }
            );

            expect([403, 404]).toContain(response.status);
        });

        it('should prevent User A from deleting User B workouts', async () => {
            const response = await apiRequest(
                `/api/workouts/${userBWorkoutId}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${userA.accessToken}`,
                    },
                }
            );

            expect([403, 404]).toContain(response.status);
        });

        it('should prevent User B from accessing User A exercises', async () => {
            const response = await apiRequest(
                `/api/exercises/${userAExercises[0].id}`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${userB.accessToken}`,
                    },
                }
            );

            expect([403, 404]).toContain(response.status);
        });

        it('should prevent User B from accessing User A workouts', async () => {
            const response = await apiRequest(
                `/api/workouts/${userAWorkoutId}`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${userB.accessToken}`,
                    },
                }
            );

            expect([403, 404]).toContain(response.status);
        });

        it('should show only User A exercises in User A list', async () => {
            const response = await apiRequest('/api/exercises', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${userA.accessToken}`,
                },
            });

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.success).toBe(true);

            // Should only contain User A's exercises
            const exerciseIds = data.data.map((e: any) => e.id);
            expect(
                exerciseIds.includes(userAExercises[0].id)
            ).toBe(true);
            expect(
                exerciseIds.includes(userBExercises[0].id)
            ).toBe(false);
        });

        it('should show only User B exercises in User B list', async () => {
            const response = await apiRequest('/api/exercises', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${userB.accessToken}`,
                },
            });

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.success).toBe(true);

            // Should only contain User B's exercises
            const exerciseIds = data.data.map((e: any) => e.id);
            expect(
                exerciseIds.includes(userBExercises[0].id)
            ).toBe(true);
            expect(
                exerciseIds.includes(userAExercises[0].id)
            ).toBe(false);
        });

        it('should show only User A workouts in User A list', async () => {
            const response = await apiRequest('/api/workouts', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${userA.accessToken}`,
                },
            });

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.success).toBe(true);

            // Should only contain User A's workouts
            const workoutIds = data.data.map((w: any) => w.id);
            expect(workoutIds.includes(userAWorkoutId)).toBe(true);
            expect(workoutIds.includes(userBWorkoutId)).toBe(false);
        });

        it('should prevent User A from using User B exercises in workouts', async () => {
            const response = await apiRequest('/api/workouts', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${userA.accessToken}`,
                },
                body: JSON.stringify({
                    workout_date: new Date().toISOString(),
                    duration_minutes: 60,
                    sets: [
                        {
                            exercise_id: userBExercises[0].id,
                            set_number: 1,
                            weight_kg: 100,
                            reps: 10,
                        },
                    ],
                }),
            });

            // Should fail with 403 (forbidden to use another user's exercise)
            expect(response.status).toBe(403);
        });

        it('should prevent User A from accessing User B statistics', async () => {
            const progressResponse = await apiRequest(
                `/api/stats/progress/${userBExercises[0].id}`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${userA.accessToken}`,
                    },
                }
            );

            expect([403, 404]).toContain(progressResponse.status);
        });
    });

    describe('Error Handling', () => {
        let user: TestUser;
        let exercise: TestExercise;

        beforeAll(async () => {
            user = await createTestUser(
                generateTestEmail('error'),
                'ErrorTest123'
            );
            testUsers.push(user);

            exercise = await createTestExercise(user.accessToken!, {
                name: 'Test Exercise',
                muscle_group: 'Chest',
                equipment_type: 'Barbell',
            });
        });

        it('should reject malformed JSON', async () => {
            const response = await fetch(`${process.env.API_URL || 'http://localhost:3000'}/api/exercises`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.accessToken}`,
                },
                body: 'invalid json{',
            });

            expect(response.status).toBe(400);
        });

        it('should reject missing authentication on protected endpoints', async () => {
            const response = await apiRequest('/api/exercises', {
                method: 'GET',
            });

            expect(response.status).toBe(401);
            const data = await response.json();
            expect(data.success).toBe(false);
        });

        it('should reject malformed JWT token', async () => {
            const response = await apiRequest('/api/exercises', {
                method: 'GET',
                headers: {
                    Authorization: 'Bearer invalid-token',
                },
            });

            expect(response.status).toBe(401);
            const data = await response.json();
            expect(data.success).toBe(false);
        });

        it('should reject invalid input types', async () => {
            const response = await apiRequest('/api/exercises', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${user.accessToken}`,
                },
                body: JSON.stringify({
                    name: 123, // Should be string
                    muscle_group: 'Chest',
                    equipment_type: 'Barbell',
                }),
            });

            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data.success).toBe(false);
        });

        it('should reject missing required fields', async () => {
            const response = await apiRequest('/api/exercises', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${user.accessToken}`,
                },
                body: JSON.stringify({
                    name: 'Test',
                    // Missing muscle_group and equipment_type
                }),
            });

            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data.success).toBe(false);
        });

        it('should return consistent error format', async () => {
            const response = await apiRequest('/api/exercises', {
                method: 'GET',
            });

            const data = await response.json();
            expect(data).toHaveProperty('success');
            expect(data).toHaveProperty('error');
            expect(data.success).toBe(false);
            expect(typeof data.error).toBe('string');
        });

        it('should return 404 for non-existent resources', async () => {
            const fakeId = '00000000-0000-0000-0000-000000000000';
            const response = await apiRequest(`/api/exercises/${fakeId}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${user.accessToken}`,
                },
            });

            expect(response.status).toBe(404);
        });
    });

    describe('Concurrent Operations', () => {
        let user: TestUser;
        let exercise: TestExercise;

        beforeAll(async () => {
            user = await createTestUser(
                generateTestEmail('concurrent'),
                'Concurrent123'
            );
            testUsers.push(user);

            exercise = await createTestExercise(user.accessToken!, {
                name: 'Concurrent Test Exercise',
                muscle_group: 'Chest',
                equipment_type: 'Barbell',
            });
        });

        it('should handle multiple simultaneous workout creations', async () => {
            const workoutPromises = Array.from({ length: 5 }, (_, i) =>
                createTestWorkout(user.accessToken!, {
                    workout_date: new Date(
                        Date.now() - i * 24 * 60 * 60 * 1000
                    ).toISOString(),
                    duration_minutes: 60,
                    notes: `Concurrent workout ${i}`,
                    sets: [
                        {
                            exercise_id: exercise.id!,
                            set_number: 1,
                            weight_kg: 100 + i * 5,
                            reps: 10,
                        },
                    ],
                })
            );

            const workouts = await waitForConcurrent(workoutPromises);

            expect(workouts.length).toBe(5);
            workouts.forEach((workout) => {
                expect(workout.id).toBeDefined();
            });

            // Verify all workouts were created
            const response = await apiRequest('/api/workouts', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${user.accessToken}`,
                },
            });

            const data = await response.json();
            expect(data.data.length).toBeGreaterThanOrEqual(5);
        });

        it('should handle concurrent exercise updates', async () => {
            const exercises = await Promise.all(
                Array.from({ length: 3 }, (_, i) =>
                    createTestExercise(user.accessToken!, {
                        name: `Exercise ${i}`,
                        muscle_group: 'Chest',
                        equipment_type: 'Barbell',
                    })
                )
            );

            const updatePromises = exercises.map((ex, i) =>
                apiRequest(`/api/exercises/${ex.id}`, {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${user.accessToken}`,
                    },
                    body: JSON.stringify({
                        name: `Updated Exercise ${i}`,
                    }),
                })
            );

            const responses = await waitForConcurrent(updatePromises);

            responses.forEach((response) => {
                expect(response.status).toBe(200);
            });
        });

        it('should handle parallel statistics requests', async () => {
            const statsPromises = [
                apiRequest('/api/stats/prs', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${user.accessToken}`,
                    },
                }),
                apiRequest('/api/stats/volume', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${user.accessToken}`,
                    },
                }),
                apiRequest('/api/stats/summary', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${user.accessToken}`,
                    },
                }),
            ];

            const responses = await waitForConcurrent(statsPromises);

            responses.forEach((response) => {
                expect(response.status).toBe(200);
            });
        });
    });

    describe('Performance Benchmarks', () => {
        let user: TestUser;
        let exercises: TestExercise[] = [];

        beforeAll(async () => {
            user = await createTestUser(
                generateTestEmail('perf'),
                'Performance123'
            );
            testUsers.push(user);

            // Create 15 exercises
            for (let i = 0; i < 15; i++) {
                const exercise = await createTestExercise(user.accessToken!, {
                    name: `Performance Exercise ${i}`,
                    muscle_group: ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms'][i % 5],
                    equipment_type: 'Barbell',
                });
                exercises.push(exercise);
            }

            // Create 30 workouts (reduced from 50 to avoid timeout)
            for (let i = 0; i < 30; i++) {
                await createTestWorkout(user.accessToken!, {
                    workout_date: new Date(
                        Date.now() - i * 24 * 60 * 60 * 1000
                    ).toISOString(),
                    duration_minutes: 60,
                    sets: [
                        {
                            exercise_id: exercises[i % exercises.length].id!,
                            set_number: 1,
                            weight_kg: 100,
                            reps: 10,
                        },
                        {
                            exercise_id: exercises[i % exercises.length].id!,
                            set_number: 2,
                            weight_kg: 100,
                            reps: 8,
                        },
                    ],
                });
            }
        }, 30000); // Increase timeout for beforeAll

        it('should retrieve exercises list within acceptable time', async () => {
            const { result, duration } = await measureResponseTime(() =>
                apiRequest('/api/exercises', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${user.accessToken}`,
                    },
                })
            );

            expect(result.status).toBe(200);
            expect(duration).toBeLessThan(500); // Should be under 500ms
            console.log(`GET /api/exercises: ${duration.toFixed(2)}ms`);
        });

        it('should retrieve workouts list within acceptable time', async () => {
            const { result, duration } = await measureResponseTime(() =>
                apiRequest('/api/workouts?limit=30', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${user.accessToken}`,
                    },
                })
            );

            expect(result.status).toBe(200);
            expect(duration).toBeLessThan(1000); // Should be under 1s
            console.log(`GET /api/workouts: ${duration.toFixed(2)}ms`);
        });

        it('should retrieve personal records within acceptable time', async () => {
            const { result, duration } = await measureResponseTime(() =>
                apiRequest('/api/stats/prs', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${user.accessToken}`,
                    },
                })
            );

            expect(result.status).toBe(200);
            expect(duration).toBeLessThan(2000); // Complex query, allow up to 2s
            console.log(`GET /api/stats/prs: ${duration.toFixed(2)}ms`);
        });

        it('should retrieve volume statistics within acceptable time', async () => {
            const { result, duration } = await measureResponseTime(() =>
                apiRequest('/api/stats/volume?groupBy=week&period=12weeks', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${user.accessToken}`,
                    },
                })
            );

            expect(result.status).toBe(200);
            expect(duration).toBeLessThan(2000); // Complex aggregation, allow up to 2s
            console.log(`GET /api/stats/volume: ${duration.toFixed(2)}ms`);
        });

        it('should retrieve summary statistics within acceptable time', async () => {
            const { result, duration } = await measureResponseTime(() =>
                apiRequest('/api/stats/summary', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${user.accessToken}`,
                    },
                })
            );

            expect(result.status).toBe(200);
            expect(duration).toBeLessThan(2000); // Complex query, allow up to 2s
            console.log(`GET /api/stats/summary: ${duration.toFixed(2)}ms`);
        });

        it('should create workout within acceptable time', async () => {
            const { result, duration } = await measureResponseTime(() =>
                apiRequest('/api/workouts', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${user.accessToken}`,
                    },
                    body: JSON.stringify({
                        workout_date: new Date().toISOString(),
                        duration_minutes: 60,
                        sets: [
                            {
                                exercise_id: exercises[0].id!,
                                set_number: 1,
                                weight_kg: 100,
                                reps: 10,
                            },
                        ],
                    }),
                })
            );

            expect(result.status).toBe(201);
            expect(duration).toBeLessThan(1000); // Should be under 1s
            console.log(`POST /api/workouts: ${duration.toFixed(2)}ms`);
        });
    });
});
