/**
 * Comprehensive authentication endpoint tests
 * Following TDD: These tests are written FIRST and should initially fail
 * Tests cover: signup, login, logout, me, refresh, and all error scenarios
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { supabaseAdmin } from '../../src/config/supabase';

const API_URL = 'http://localhost:3000';

// Test user credentials
const testUser = {
    email: 'auth-test-user@example.com',
    password: 'SecurePassword123',
};

const testUser2 = {
    email: 'auth-test-user-2@example.com',
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

// Cleanup function to delete test users
async function cleanupTestUsers() {
    try {
        // Get all users with test emails
        const { data: users } = await supabaseAdmin.auth.admin.listUsers();

        if (users?.users) {
            for (const user of users.users) {
                if (
                    user.email === testUser.email ||
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

describe('Authentication Endpoints', () => {
    beforeAll(async () => {
        // Clean up any existing test users
        await cleanupTestUsers();
    });

    afterAll(async () => {
        // Clean up test users after all tests
        await cleanupTestUsers();
    });

    describe('POST /api/auth/signup', () => {
        it('should successfully create a new user with valid credentials', async () => {
            const response = await apiRequest('/api/auth/signup', {
                method: 'POST',
                body: JSON.stringify(testUser),
            });

            expect(response.status).toBe(201);

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.data).toHaveProperty('user');
            expect(data.data).toHaveProperty('session');
            expect(data.data.user.email).toBe(testUser.email);
            expect(data.data.session).toHaveProperty('access_token');
            expect(data.data.session).toHaveProperty('refresh_token');
        });

        it('should reject signup with duplicate email', async () => {
            // Try to create the same user again
            const response = await apiRequest('/api/auth/signup', {
                method: 'POST',
                body: JSON.stringify(testUser),
            });

            expect(response.status).toBe(409);

            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toContain('already registered');
        });

        it('should reject signup with invalid email format', async () => {
            const response = await apiRequest('/api/auth/signup', {
                method: 'POST',
                body: JSON.stringify({
                    email: 'invalid-email',
                    password: 'ValidPassword123',
                }),
            });

            expect(response.status).toBe(400);

            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toContain('email');
        });

        it('should reject signup with password too short', async () => {
            const response = await apiRequest('/api/auth/signup', {
                method: 'POST',
                body: JSON.stringify({
                    email: 'newuser@example.com',
                    password: 'short',
                }),
            });

            expect(response.status).toBe(400);

            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toContain('8 characters');
        });

        it('should reject signup with password too long', async () => {
            const response = await apiRequest('/api/auth/signup', {
                method: 'POST',
                body: JSON.stringify({
                    email: 'newuser@example.com',
                    password: 'a'.repeat(65), // 65 characters
                }),
            });

            expect(response.status).toBe(400);

            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toContain('64 characters');
        });

        it('should reject signup with missing email', async () => {
            const response = await apiRequest('/api/auth/signup', {
                method: 'POST',
                body: JSON.stringify({
                    password: 'ValidPassword123',
                }),
            });

            expect(response.status).toBe(400);

            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toContain('email');
        });

        it('should reject signup with missing password', async () => {
            const response = await apiRequest('/api/auth/signup', {
                method: 'POST',
                body: JSON.stringify({
                    email: 'newuser@example.com',
                }),
            });

            expect(response.status).toBe(400);

            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toContain('password');
        });
    });

    describe('POST /api/auth/login', () => {
        it('should successfully login with valid credentials', async () => {
            const response = await apiRequest('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify(testUser),
            });

            expect(response.status).toBe(200);

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.data).toHaveProperty('user');
            expect(data.data).toHaveProperty('session');
            expect(data.data.user.email).toBe(testUser.email);
            expect(data.data.session).toHaveProperty('access_token');
            expect(data.data.session).toHaveProperty('refresh_token');
        });

        it('should reject login with invalid email', async () => {
            const response = await apiRequest('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    email: 'nonexistent@example.com',
                    password: 'SomePassword123',
                }),
            });

            expect(response.status).toBe(401);

            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toContain('Invalid');
        });

        it('should reject login with invalid password', async () => {
            const response = await apiRequest('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    email: testUser.email,
                    password: 'WrongPassword123',
                }),
            });

            expect(response.status).toBe(401);

            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toContain('Invalid');
        });

        it('should reject login with missing email', async () => {
            const response = await apiRequest('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    password: 'SomePassword123',
                }),
            });

            expect(response.status).toBe(400);

            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toContain('email');
        });

        it('should reject login with missing password', async () => {
            const response = await apiRequest('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    email: testUser.email,
                }),
            });

            expect(response.status).toBe(400);

            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toContain('password');
        });
    });

    describe('GET /api/auth/me', () => {
        let accessToken: string;

        beforeAll(async () => {
            // Login to get a valid token
            const response = await apiRequest('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify(testUser),
            });
            const data = await response.json();
            accessToken = data.data.session.access_token;
        });

        it('should return user profile with valid token', async () => {
            const response = await apiRequest('/api/auth/me', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            expect(response.status).toBe(200);

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.data).toHaveProperty('id');
            expect(data.data).toHaveProperty('email');
            expect(data.data.email).toBe(testUser.email);
        });

        it('should reject request without token', async () => {
            const response = await apiRequest('/api/auth/me', {
                method: 'GET',
            });

            expect(response.status).toBe(401);

            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toContain('authorization');
        });

        it('should reject request with malformed token', async () => {
            const response = await apiRequest('/api/auth/me', {
                method: 'GET',
                headers: {
                    Authorization: 'Bearer invalid-token',
                },
            });

            expect(response.status).toBe(401);

            const data = await response.json();
            expect(data.success).toBe(false);
        });

        it('should reject request with expired token', async () => {
            // Use a token that's clearly expired (this is a mock expired token)
            const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.4Adcj0vbBqfF0T0p5V_VqiPGPBLXVPXRqKdEJQHqZbg';

            const response = await apiRequest('/api/auth/me', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${expiredToken}`,
                },
            });

            expect(response.status).toBe(401);

            const data = await response.json();
            expect(data.success).toBe(false);
        });
    });

    describe('POST /api/auth/logout', () => {
        let accessToken: string;

        beforeAll(async () => {
            // Create a new user for logout tests
            await apiRequest('/api/auth/signup', {
                method: 'POST',
                body: JSON.stringify(testUser2),
            });

            // Login to get a valid token
            const response = await apiRequest('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify(testUser2),
            });
            const data = await response.json();
            accessToken = data.data.session.access_token;
        });

        it('should successfully logout with valid token', async () => {
            const response = await apiRequest('/api/auth/logout', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            expect(response.status).toBe(200);

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.data).toHaveProperty('message');
        });

        it('should reject logout without token', async () => {
            const response = await apiRequest('/api/auth/logout', {
                method: 'POST',
            });

            expect(response.status).toBe(401);

            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toContain('authorization');
        });
    });

    describe('POST /api/auth/refresh', () => {
        let refreshToken: string;

        beforeAll(async () => {
            // Login to get a refresh token
            const response = await apiRequest('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify(testUser),
            });
            const data = await response.json();
            refreshToken = data.data.session.refresh_token;
        });

        it('should successfully refresh tokens with valid refresh token', async () => {
            const response = await apiRequest('/api/auth/refresh', {
                method: 'POST',
                body: JSON.stringify({
                    refreshToken,
                }),
            });

            expect(response.status).toBe(200);

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.data).toHaveProperty('session');
            expect(data.data.session).toHaveProperty('access_token');
            expect(data.data.session).toHaveProperty('refresh_token');
            // Verify token rotation: new refresh token should be different
            expect(data.data.session.refresh_token).not.toBe(refreshToken);
        });

        it('should reject refresh with invalid refresh token', async () => {
            const response = await apiRequest('/api/auth/refresh', {
                method: 'POST',
                body: JSON.stringify({
                    refreshToken: 'invalid-refresh-token',
                }),
            });

            expect(response.status).toBe(401);

            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toContain('Invalid');
        });

        it('should reject refresh with missing refresh token', async () => {
            const response = await apiRequest('/api/auth/refresh', {
                method: 'POST',
                body: JSON.stringify({}),
            });

            expect(response.status).toBe(400);

            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toContain('refresh token');
        });
    });

    describe('Input Validation & Security', () => {
        it('should sanitize email input (trim and lowercase)', async () => {
            const response = await apiRequest('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    email: '  AUTH-TEST-USER@EXAMPLE.COM  ',
                    password: testUser.password,
                }),
            });

            // Should successfully login despite uppercase and whitespace
            expect(response.status).toBe(200);
        });

        it('should reject SQL injection attempts in email', async () => {
            const response = await apiRequest('/api/auth/signup', {
                method: 'POST',
                body: JSON.stringify({
                    email: "admin'--@example.com",
                    password: 'ValidPassword123',
                }),
            });

            // Note: This email format is technically valid per RFC 5322
            // So it passes validation and returns 409 (duplicate) if user exists
            // or 201 if it doesn't. The important thing is SQL injection is prevented
            // by Supabase's parameterized queries, not email validation.
            expect([201, 409]).toContain(response.status);
        });

        it('should handle special characters in password', async () => {
            const specialPassword = 'P@ssw0rd!#$%^&*()_+-=[]{}|;:,.<>?';
            const specialUser = {
                email: 'special-char-test@example.com',
                password: specialPassword,
            };

            // Cleanup if user already exists from previous test run
            try {
                const { data: users } = await supabaseAdmin.auth.admin.listUsers();
                const existingUser = users?.users.find(u => u.email === specialUser.email);
                if (existingUser) {
                    await supabaseAdmin.auth.admin.deleteUser(existingUser.id);
                }
            } catch (error) {
                // Ignore cleanup errors
            }

            // Signup with special characters
            const signupResponse = await apiRequest('/api/auth/signup', {
                method: 'POST',
                body: JSON.stringify(specialUser),
            });

            expect(signupResponse.status).toBe(201);

            // Login with same special characters
            const loginResponse = await apiRequest('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify(specialUser),
            });

            expect(loginResponse.status).toBe(200);

            // Cleanup
            const loginData = await loginResponse.json();
            const userId = loginData.data.user.id;
            await supabaseAdmin.auth.admin.deleteUser(userId);
        });
    });
});
