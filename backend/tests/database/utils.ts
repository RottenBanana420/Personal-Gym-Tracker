import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

/**
 * Database Test Utilities
 * 
 * Provides helper functions for database testing including:
 * - Test user creation and cleanup
 * - Supabase client management
 * - Test data generation
 */

export interface TestUser {
  id: string;
  email: string;
  password: string;
  client: SupabaseClient;
}

/**
 * Creates a test user and returns an authenticated Supabase client
 */
export async function createTestUser(
  email: string,
  password: string = 'TestPassword123!'
): Promise<TestUser> {
  const supabaseUrl = process.env.SUPABASE_URL!;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  // Create admin client with service role for user creation
  const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Create user using admin API (bypasses email confirmation)
  const { data: userData, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm email
  });

  if (createError) {
    throw new Error(`Failed to create test user: ${createError.message}`);
  }

  if (!userData.user) {
    throw new Error('No user returned from createUser');
  }

  // Sign in the user to get a session
  const userClient = createClient(supabaseUrl, supabaseAnonKey);
  const { data: signInData, error: signInError } = await userClient.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    // Clean up the created user if sign-in fails
    await adminClient.auth.admin.deleteUser(userData.user.id);
    throw new Error(`Failed to sign in test user: ${signInError.message}`);
  }

  if (!signInData.session) {
    await adminClient.auth.admin.deleteUser(userData.user.id);
    throw new Error('No session returned from sign in');
  }

  return {
    id: userData.user.id,
    email,
    password,
    client: userClient,
  };
}

/**
 * Deletes a test user and all associated data
 */
export async function deleteTestUser(userId: string): Promise<void> {
  const supabaseUrl = process.env.SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const adminClient = createClient(supabaseUrl, supabaseServiceKey);

  // Delete the user (this will cascade to profile and all related data)
  const { error } = await adminClient.auth.admin.deleteUser(userId);

  if (error) {
    console.warn(`Failed to delete test user ${userId}: ${error.message}`);
  }
}

/**
 * Generates a unique email for testing
 */
export function generateTestEmail(prefix: string = 'test'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `${prefix}-${timestamp}-${random}@test.com`;
}

/**
 * Creates test workout data
 */
export async function createTestWorkout(
  client: SupabaseClient,
  userId: string,
  name: string = 'Test Workout'
) {
  const { data, error } = await client
    .from('workouts')
    .insert({
      user_id: userId,
      name,
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Creates test exercise data
 */
export async function createTestExercise(
  client: SupabaseClient,
  userId: string,
  name: string = 'Test Exercise'
) {
  const { data, error } = await client
    .from('exercises')
    .insert({
      user_id: userId,
      name,
      category: 'strength',
      is_public: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Creates test user metrics
 */
export async function createTestMetrics(
  client: SupabaseClient,
  userId: string,
  weightKg: number = 75.0
) {
  const { data, error } = await client
    .from('user_metrics')
    .insert({
      user_id: userId,
      weight_kg: weightKg,
      recorded_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Waits for a specified amount of time
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retries a function until it succeeds or max attempts is reached
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxAttempts) {
        await wait(delayMs);
      }
    }
  }

  throw lastError;
}
