import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { authMiddleware, optionalAuthMiddleware } from '../../src/middleware/auth';
import { errorHandler } from '../../src/middleware/error';
import type { AuthContext } from '../../src/types';

// Mock the Supabase client
vi.mock('../../src/config/supabase', () => {
    const mockGetUser = vi.fn();

    return {
        supabase: {
            auth: {
                getUser: mockGetUser,
            },
        },
        supabaseAdmin: {
            auth: {
                getUser: mockGetUser,
            },
        },
    };
});

// Import the mocked supabase after mocking
import { supabase } from '../../src/config/supabase';

describe('Authentication Middleware', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('authMiddleware - Required Authentication', () => {
        it('should reject requests without Authorization header', async () => {
            const app = new Hono<AuthContext>();

            app.get('/protected', authMiddleware, (c) => {
                return c.json({ success: true, data: { message: 'Protected resource' } });
            });

            app.onError(errorHandler);

            const req = new Request('http://localhost:3000/protected');
            const res = await app.fetch(req);

            expect(res.status).toBe(401);
            const body = await res.json();
            expect(body).toEqual({
                success: false,
                error: 'Missing authorization token',
            });
        });

        it('should reject requests with malformed Authorization header', async () => {
            const app = new Hono<AuthContext>();

            app.get('/protected', authMiddleware, (c) => {
                return c.json({ success: true, data: { message: 'Protected resource' } });
            });

            app.onError(errorHandler);

            const req = new Request('http://localhost:3000/protected', {
                headers: {
                    Authorization: 'InvalidFormat token123',
                },
            });
            const res = await app.fetch(req);

            expect(res.status).toBe(401);
            const body = await res.json();
            expect(body).toEqual({
                success: false,
                error: 'Invalid authorization format',
            });
        });

        it('should reject requests with invalid JWT token', async () => {
            const app = new Hono<AuthContext>();

            // Mock Supabase to return error for invalid token
            vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({
                data: { user: null },
                error: { message: 'Invalid token', name: 'AuthError', status: 401 },
            } as any);

            app.get('/protected', authMiddleware, (c) => {
                return c.json({ success: true, data: { message: 'Protected resource' } });
            });

            app.onError(errorHandler);

            const req = new Request('http://localhost:3000/protected', {
                headers: {
                    Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.token',
                },
            });
            const res = await app.fetch(req);

            expect(res.status).toBe(401);
            const body = await res.json();
            expect(body).toEqual({
                success: false,
                error: 'Invalid or expired token',
            });
        });

        it('should reject requests with expired JWT token', async () => {
            const app = new Hono<AuthContext>();

            // Mock Supabase to return error for expired token
            vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({
                data: { user: null },
                error: { message: 'Token expired', name: 'AuthError', status: 401 },
            } as any);

            app.get('/protected', authMiddleware, (c) => {
                return c.json({ success: true, data: { message: 'Protected resource' } });
            });

            app.onError(errorHandler);

            const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.4Adcj0vdYo5T7rN_MkVfR5gEhPXhZ8lTz1z1z1z1z1z';

            const req = new Request('http://localhost:3000/protected', {
                headers: {
                    Authorization: `Bearer ${expiredToken}`,
                },
            });
            const res = await app.fetch(req);

            expect(res.status).toBe(401);
            const body = await res.json();
            expect(body).toEqual({
                success: false,
                error: 'Invalid or expired token',
            });
        });

        it('should attach user to context with valid token', async () => {
            const app = new Hono<AuthContext>();

            // Mock Supabase to return valid user
            const mockUser = {
                id: 'user-123',
                email: 'test@example.com',
                role: 'authenticated',
                user_metadata: { name: 'Test User' },
            };

            vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({
                data: { user: mockUser },
                error: null,
            } as any);

            app.get('/protected', authMiddleware, (c) => {
                const user = c.get('user');
                expect(user).toBeDefined();
                expect(user).toHaveProperty('id');
                expect(user).toHaveProperty('email');
                return c.json({ success: true, data: { userId: user.id } });
            });

            app.onError(errorHandler);

            const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyJ9.signature';

            const req = new Request('http://localhost:3000/protected', {
                headers: {
                    Authorization: `Bearer ${validToken}`,
                },
            });
            const res = await app.fetch(req);

            expect(res.status).toBe(200);
            const body = await res.json();
            expect(body).toHaveProperty('success', true);
            expect(body.data).toHaveProperty('userId', 'user-123');
        });

        it('should attach requestId to context', async () => {
            const app = new Hono<AuthContext>();

            // Mock Supabase to return valid user
            const mockUser = {
                id: 'user-123',
                email: 'test@example.com',
                role: 'authenticated',
                user_metadata: {},
            };

            vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({
                data: { user: mockUser },
                error: null,
            } as any);

            // Add logger middleware to set requestId
            app.use('*', async (c, next) => {
                c.set('requestId', 'test-request-id');
                await next();
            });

            app.get('/protected', authMiddleware, (c) => {
                const requestId = c.get('requestId');
                expect(requestId).toBeDefined();
                expect(typeof requestId).toBe('string');
                expect(requestId.length).toBeGreaterThan(0);
                return c.json({ success: true, data: { requestId } });
            });

            app.onError(errorHandler);

            const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyJ9.signature';

            const req = new Request('http://localhost:3000/protected', {
                headers: {
                    Authorization: `Bearer ${validToken}`,
                },
            });
            const res = await app.fetch(req);

            expect(res.status).toBe(200);
            const body = await res.json();
            expect(body.data).toHaveProperty('requestId');
        });
    });

    describe('optionalAuthMiddleware - Optional Authentication', () => {
        it('should allow requests without Authorization header', async () => {
            const app = new Hono<AuthContext>();

            app.get('/public', optionalAuthMiddleware, (c) => {
                const user = c.get('user');
                return c.json({
                    success: true,
                    data: { authenticated: !!user },
                });
            });

            const req = new Request('http://localhost:3000/public');
            const res = await app.fetch(req);

            expect(res.status).toBe(200);
            const body = await res.json();
            expect(body).toEqual({
                success: true,
                data: { authenticated: false },
            });
        });

        it('should attach user if valid token provided', async () => {
            const app = new Hono<AuthContext>();

            // Mock Supabase to return valid user
            const mockUser = {
                id: 'user-456',
                email: 'optional@example.com',
                role: 'authenticated',
                user_metadata: {},
            };

            vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({
                data: { user: mockUser },
                error: null,
            } as any);

            app.get('/public', optionalAuthMiddleware, (c) => {
                const user = c.get('user');
                return c.json({
                    success: true,
                    data: { authenticated: !!user, userId: user?.id },
                });
            });

            const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTQ1NiJ9.signature';

            const req = new Request('http://localhost:3000/public', {
                headers: {
                    Authorization: `Bearer ${validToken}`,
                },
            });
            const res = await app.fetch(req);

            expect(res.status).toBe(200);
            const body = await res.json();
            expect(body.data.authenticated).toBe(true);
            expect(body.data).toHaveProperty('userId', 'user-456');
        });

        it('should ignore invalid tokens and continue', async () => {
            const app = new Hono<AuthContext>();

            // Mock Supabase to return error for invalid token
            vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({
                data: { user: null },
                error: { message: 'Invalid token', name: 'AuthError', status: 401 },
            } as any);

            app.get('/public', optionalAuthMiddleware, (c) => {
                const user = c.get('user');
                return c.json({
                    success: true,
                    data: { authenticated: !!user },
                });
            });

            const req = new Request('http://localhost:3000/public', {
                headers: {
                    Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.token',
                },
            });
            const res = await app.fetch(req);

            expect(res.status).toBe(200);
            const body = await res.json();
            expect(body.data.authenticated).toBe(false);
        });
    });
});
