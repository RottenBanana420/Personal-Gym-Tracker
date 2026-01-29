/**
 * Integration test helper functions
 * Utilities for creating test users, exercises, workouts, and measuring performance
 */

import { supabaseAdmin } from '../../src/config/supabase';

const API_URL = 'http://localhost:3000';

export interface TestUser {
    email: string;
    password: string;
    id?: string;
    accessToken?: string;
    refreshToken?: string;
}

export interface TestExercise {
    id?: string;
    name: string;
    muscle_group: string;
    equipment_type: string;
    description?: string;
    category?: string;
}

export interface TestWorkout {
    id?: string;
    workout_date: string;
    duration_minutes: number;
    notes?: string;
    sets: Array<{
        exercise_id: string;
        set_number: number;
        weight_kg: number;
        reps: number;
    }>;
}

/**
 * Make an API request with proper headers
 */
export async function apiRequest(
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

/**
 * Create and authenticate a test user
 */
export async function createTestUser(
    email: string,
    password: string
): Promise<TestUser> {
    const user: TestUser = { email, password };

    // Signup
    const signupResponse = await apiRequest('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });

    if (!signupResponse.ok) {
        throw new Error(
            `Failed to create test user: ${signupResponse.status} ${await signupResponse.text()}`
        );
    }

    const signupData = await signupResponse.json();
    user.id = signupData.data.user.id;
    user.accessToken = signupData.data.session.access_token;
    user.refreshToken = signupData.data.session.refresh_token;

    return user;
}

/**
 * Delete a test user and all associated data
 */
export async function cleanupTestUser(userId: string): Promise<void> {
    try {
        await supabaseAdmin.auth.admin.deleteUser(userId);
    } catch (error) {
        console.error(`Failed to cleanup test user ${userId}:`, error);
    }
}

/**
 * Create a test exercise
 */
export async function createTestExercise(
    token: string,
    exercise: Partial<TestExercise>
): Promise<TestExercise> {
    const exerciseData = {
        name: exercise.name || 'Test Exercise',
        muscle_group: exercise.muscle_group || 'Chest',
        equipment_type: exercise.equipment_type || 'Barbell',
        description: exercise.description || 'Test exercise description',
        category: exercise.category || 'strength',
    };

    const response = await apiRequest('/api/exercises', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(exerciseData),
    });

    if (!response.ok) {
        throw new Error(
            `Failed to create test exercise: ${response.status} ${await response.text()}`
        );
    }

    const data = await response.json();
    return data.data;
}

/**
 * Create a test workout
 */
export async function createTestWorkout(
    token: string,
    workout: Partial<TestWorkout>
): Promise<TestWorkout> {
    const workoutData = {
        workout_date:
            workout.workout_date || new Date().toISOString(),
        duration_minutes: workout.duration_minutes || 60,
        notes: workout.notes || 'Test workout',
        sets: workout.sets || [],
    };

    const response = await apiRequest('/api/workouts', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(workoutData),
    });

    if (!response.ok) {
        throw new Error(
            `Failed to create test workout: ${response.status} ${await response.text()}`
        );
    }

    const data = await response.json();
    return data.data;
}

/**
 * Measure response time of an async function
 */
export async function measureResponseTime<T>(
    fn: () => Promise<T>
): Promise<{ result: T; duration: number }> {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    return { result, duration };
}

/**
 * Execute multiple promises concurrently and return results
 */
export async function waitForConcurrent<T>(
    promises: Promise<T>[]
): Promise<T[]> {
    return Promise.all(promises);
}

/**
 * Sleep for a specified number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate a unique email for testing
 */
export function generateTestEmail(prefix: string = 'test'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    return `${prefix}-${timestamp}-${random}@example.com`;
}

/**
 * Cleanup multiple test users
 */
export async function cleanupTestUsers(userIds: string[]): Promise<void> {
    await Promise.all(userIds.map((id) => cleanupTestUser(id)));
}
