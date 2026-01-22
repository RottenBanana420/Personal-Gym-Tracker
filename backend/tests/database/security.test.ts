import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
    createTestUser,
    deleteTestUser,
    generateTestEmail,
    createTestWorkout,
    createTestExercise,
    createTestMetrics,
    type TestUser,
} from './utils';

/**
 * CRITICAL SECURITY TESTS
 * 
 * These tests MUST FAIL if Row Level Security (RLS) policies are not correctly implemented.
 * They verify complete data isolation between users.
 * 
 * Test Strategy:
 * 1. Create two test users (User A and User B)
 * 2. User A creates data
 * 3. User B attempts to access/modify User A's data
 * 4. All attempts should return 0 rows or throw errors
 * 
 * IF THESE TESTS PASS WHEN THEY SHOULDN'T, THE RLS POLICIES ARE BROKEN!
 */

describe('Database Security - RLS Policies', () => {
    let userA: TestUser;
    let userB: TestUser;

    beforeAll(async () => {
        // Create two test users
        userA = await createTestUser(generateTestEmail('security-user-a'));
        userB = await createTestUser(generateTestEmail('security-user-b'));

        // Wait for users to be fully created
        await new Promise((resolve) => setTimeout(resolve, 1000));
    });

    afterAll(async () => {
        // Cleanup test users
        await deleteTestUser(userA.id);
        await deleteTestUser(userB.id);
    });

    describe('Profiles Table Security', () => {
        it('should prevent User B from viewing User A profile', async () => {
            const { data, error } = await userB.client
                .from('profiles')
                .select('*')
                .eq('id', userA.id);

            // Should return empty array (no access)
            expect(data).toEqual([]);
            expect(data?.length).toBe(0);
        });

        it('should prevent User B from updating User A profile', async () => {
            const { data, error } = await userB.client
                .from('profiles')
                .update({ full_name: 'Hacked Name' })
                .eq('id', userA.id)
                .select();

            // Should return empty array (no rows updated)
            expect(data).toEqual([]);
            expect(data?.length).toBe(0);
        });
    });

    describe('User Metrics Table Security', () => {
        let userAMetrics: any;

        beforeAll(async () => {
            // User A creates metrics
            userAMetrics = await createTestMetrics(userA.client, userA.id, 80.5);
        });

        it('should prevent User B from viewing User A metrics', async () => {
            const { data } = await userB.client
                .from('user_metrics')
                .select('*')
                .eq('user_id', userA.id);

            expect(data).toEqual([]);
            expect(data?.length).toBe(0);
        });

        it('should prevent User B from inserting metrics with User A user_id', async () => {
            const { data, error } = await userB.client
                .from('user_metrics')
                .insert({
                    user_id: userA.id, // Attempting to insert with User A's ID
                    weight_kg: 100.0,
                    recorded_at: new Date().toISOString(),
                })
                .select();

            // Should fail or return empty/null (RLS blocks INSERT)
            expect(data === null || data?.length === 0).toBe(true);
        });

        it('should prevent User B from updating User A metrics', async () => {
            const { data } = await userB.client
                .from('user_metrics')
                .update({ weight_kg: 999.9 })
                .eq('id', userAMetrics.id)
                .select();

            expect(data).toEqual([]);
            expect(data?.length).toBe(0);
        });

        it('should prevent User B from deleting User A metrics', async () => {
            const { data } = await userB.client
                .from('user_metrics')
                .delete()
                .eq('id', userAMetrics.id)
                .select();

            expect(data).toEqual([]);
            expect(data?.length).toBe(0);
        });
    });

    describe('Exercises Table Security', () => {
        let userAExercise: any;

        beforeAll(async () => {
            // User A creates a private exercise
            userAExercise = await createTestExercise(userA.client, userA.id, 'User A Private Exercise');
        });

        it('should prevent User B from viewing User A private exercises', async () => {
            const { data } = await userB.client
                .from('exercises')
                .select('*')
                .eq('id', userAExercise.id);

            expect(data).toEqual([]);
            expect(data?.length).toBe(0);
        });

        it('should allow User B to view public system exercises', async () => {
            const { data } = await userB.client
                .from('exercises')
                .select('*')
                .eq('is_public', true)
                .limit(1);

            // Should be able to see public exercises
            expect(data).toBeDefined();
            expect(data!.length).toBeGreaterThan(0);
        });

        it('should prevent User B from updating User A exercises', async () => {
            const { data } = await userB.client
                .from('exercises')
                .update({ name: 'Hacked Exercise' })
                .eq('id', userAExercise.id)
                .select();

            expect(data).toEqual([]);
            expect(data?.length).toBe(0);
        });

        it('should prevent User B from deleting User A exercises', async () => {
            const { data } = await userB.client
                .from('exercises')
                .delete()
                .eq('id', userAExercise.id)
                .select();

            expect(data).toEqual([]);
            expect(data?.length).toBe(0);
        });
    });

    describe('Workouts Table Security', () => {
        let userAWorkout: any;

        beforeAll(async () => {
            // User A creates a workout
            userAWorkout = await createTestWorkout(userA.client, userA.id, 'User A Workout');
        });

        it('should prevent User B from viewing User A workouts', async () => {
            const { data } = await userB.client
                .from('workouts')
                .select('*')
                .eq('id', userAWorkout.id);

            expect(data).toEqual([]);
            expect(data?.length).toBe(0);
        });

        it('should prevent User B from inserting workouts with User A user_id', async () => {
            const { data } = await userB.client
                .from('workouts')
                .insert({
                    user_id: userA.id, // Attempting to insert with User A's ID
                    name: 'Malicious Workout',
                    started_at: new Date().toISOString(),
                })
                .select();

            // Should fail or return empty/null (RLS blocks INSERT)
            expect(data === null || data?.length === 0).toBe(true);
        });

        it('should prevent User B from updating User A workouts', async () => {
            const { data } = await userB.client
                .from('workouts')
                .update({ name: 'Hacked Workout' })
                .eq('id', userAWorkout.id)
                .select();

            expect(data).toEqual([]);
            expect(data?.length).toBe(0);
        });

        it('should prevent User B from deleting User A workouts', async () => {
            const { data } = await userB.client
                .from('workouts')
                .delete()
                .eq('id', userAWorkout.id)
                .select();

            expect(data).toEqual([]);
            expect(data?.length).toBe(0);
        });
    });

    describe('Nested Resource Security (Sets)', () => {
        let userAWorkout: any;
        let userAExercise: any;
        let userAWorkoutExercise: any;
        let userASet: any;

        beforeAll(async () => {
            // Create a complete workout structure for User A
            userAWorkout = await createTestWorkout(userA.client, userA.id);

            // Get a public exercise
            const { data: publicExercises } = await userA.client
                .from('exercises')
                .select('*')
                .eq('is_public', true)
                .limit(1);

            userAExercise = publicExercises![0];

            // Add exercise to workout
            const { data: workoutExercise } = await userA.client
                .from('workout_exercises')
                .insert({
                    workout_id: userAWorkout.id,
                    exercise_id: userAExercise.id,
                    order_in_workout: 1,
                })
                .select()
                .single();

            userAWorkoutExercise = workoutExercise;

            // Add a set
            const { data: set } = await userA.client
                .from('sets')
                .insert({
                    workout_exercise_id: userAWorkoutExercise.id,
                    set_number: 1,
                    reps: 10,
                    weight_kg: 100.0,
                })
                .select()
                .single();

            userASet = set;
        });

        it('should prevent User B from viewing User A sets', async () => {
            const { data } = await userB.client
                .from('sets')
                .select('*')
                .eq('id', userASet.id);

            expect(data).toEqual([]);
            expect(data?.length).toBe(0);
        });

        it('should prevent User B from inserting sets into User A workout exercises', async () => {
            const { data } = await userB.client
                .from('sets')
                .insert({
                    workout_exercise_id: userAWorkoutExercise.id,
                    set_number: 2,
                    reps: 999,
                    weight_kg: 999.0,
                })
                .select();

            // Should fail or return empty/null (RLS blocks INSERT)
            expect(data === null || data?.length === 0).toBe(true);
        });

        it('should prevent User B from updating User A sets', async () => {
            const { data } = await userB.client
                .from('sets')
                .update({ reps: 999 })
                .eq('id', userASet.id)
                .select();

            expect(data).toEqual([]);
            expect(data?.length).toBe(0);
        });

        it('should prevent User B from deleting User A sets', async () => {
            const { data } = await userB.client
                .from('sets')
                .delete()
                .eq('id', userASet.id)
                .select();

            expect(data).toEqual([]);
            expect(data?.length).toBe(0);
        });
    });

    describe('Personal Records Table Security', () => {
        let userARecord: any;
        let userAWorkout: any;
        let userAExercise: any;

        beforeAll(async () => {
            // Create a workout for User A
            userAWorkout = await createTestWorkout(userA.client, userA.id);

            // Get a public exercise
            const { data: publicExercises } = await userA.client
                .from('exercises')
                .select('*')
                .eq('is_public', true)
                .limit(1);

            userAExercise = publicExercises![0];

            // Add exercise to workout
            const { data: workoutExercise } = await userA.client
                .from('workout_exercises')
                .insert({
                    workout_id: userAWorkout.id,
                    exercise_id: userAExercise.id,
                    order_in_workout: 1,
                })
                .select()
                .single();

            // Create a set - this will automatically create a personal record via trigger
            await userA.client
                .from('sets')
                .insert({
                    workout_exercise_id: workoutExercise!.id,
                    set_number: 1,
                    reps: 10,
                    weight_kg: 150.0,
                })
                .select()
                .single();

            // Wait for trigger to create personal record
            await new Promise((resolve) => setTimeout(resolve, 500));

            // Fetch the auto-created personal record
            const { data: records } = await userA.client
                .from('personal_records')
                .select('*')
                .eq('user_id', userA.id)
                .eq('exercise_id', userAExercise.id)
                .eq('record_type', 'max_weight')
                .limit(1);

            if (!records || records.length === 0) {
                throw new Error('Personal record was not auto-created by trigger');
            }

            userARecord = records[0];
        });

        it('should prevent User B from viewing User A personal records', async () => {
            const { data } = await userB.client
                .from('personal_records')
                .select('*')
                .eq('id', userARecord?.id);

            expect(data).toEqual([]);
            expect(data?.length).toBe(0);
        });

        it('should prevent User B from inserting records with User A user_id', async () => {
            const { data } = await userB.client
                .from('personal_records')
                .insert({
                    user_id: userA.id,
                    exercise_id: userARecord?.exercise_id,
                    record_type: 'max_reps',
                    value: 999,
                    unit: 'reps',
                    achieved_at: new Date().toISOString(),
                })
                .select();

            // Should fail or return empty/null (RLS blocks INSERT)
            expect(data === null || data?.length === 0).toBe(true);
        });

        it('should prevent User B from updating User A personal records', async () => {
            const { data } = await userB.client
                .from('personal_records')
                .update({ value: 999.9 })
                .eq('id', userARecord?.id)
                .select();

            expect(data).toEqual([]);
            expect(data?.length).toBe(0);
        });

        it('should prevent User B from deleting User A personal records', async () => {
            const { data } = await userB.client
                .from('personal_records')
                .delete()
                .eq('id', userARecord?.id)
                .select();

            expect(data).toEqual([]);
            expect(data?.length).toBe(0);
        });
    });

    describe('Goals Table Security', () => {
        let userAGoal: any;

        beforeAll(async () => {
            // User A creates a goal
            const { data: goal } = await userA.client
                .from('goals')
                .insert({
                    user_id: userA.id,
                    title: 'User A Goal',
                    goal_type: 'strength',
                    start_date: new Date().toISOString().split('T')[0],
                })
                .select()
                .single();

            userAGoal = goal;
        });

        it('should prevent User B from viewing User A goals', async () => {
            const { data } = await userB.client
                .from('goals')
                .select('*')
                .eq('id', userAGoal.id);

            expect(data).toEqual([]);
            expect(data?.length).toBe(0);
        });

        it('should prevent User B from inserting goals with User A user_id', async () => {
            const { data } = await userB.client
                .from('goals')
                .insert({
                    user_id: userA.id,
                    title: 'Malicious Goal',
                    goal_type: 'strength',
                    start_date: new Date().toISOString().split('T')[0],
                })
                .select();

            // Should fail or return empty/null (RLS blocks INSERT)
            expect(data === null || data?.length === 0).toBe(true);
        });

        it('should prevent User B from updating User A goals', async () => {
            const { data } = await userB.client
                .from('goals')
                .update({ title: 'Hacked Goal' })
                .eq('id', userAGoal.id)
                .select();

            expect(data).toEqual([]);
            expect(data?.length).toBe(0);
        });

        it('should prevent User B from deleting User A goals', async () => {
            const { data } = await userB.client
                .from('goals')
                .delete()
                .eq('id', userAGoal.id)
                .select();

            expect(data).toEqual([]);
            expect(data?.length).toBe(0);
        });
    });
});
