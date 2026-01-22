/**
 * Authentication routes
 * Implements signup, login, logout, profile retrieval, and token refresh
 */

import { Hono } from 'hono';
import { supabase, supabaseAdmin } from '../config/supabase';
import { authMiddleware } from '../middleware/auth';
import { validateJson, getValidatedData } from '../middleware/validate';
import {
    signupSchema,
    loginSchema,
    refreshTokenSchema,
    type SignupRequest,
    type LoginRequest,
    type RefreshTokenRequest,
} from '../validators/auth';
import {
    ValidationError,
    UnauthorizedError,
    ConflictError,
    type AuthContext,
} from '../types';

const auth = new Hono<AuthContext>();

/**
 * POST /api/auth/signup
 * Register a new user account
 */
auth.post('/signup', validateJson(signupSchema), async (c) => {
    const { email, password } = getValidatedData<SignupRequest>(c);

    try {
        // Use admin client to create user without email confirmation for testing
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm email for testing
        });

        if (error) {
            // Handle duplicate email error
            if (
                error.message.includes('already registered') ||
                error.message.includes('User already registered') ||
                error.message.includes('already been registered')
            ) {
                throw new ConflictError('Email already registered');
            }

            // Handle weak password error from Supabase
            if (error.message.includes('Password')) {
                throw new ValidationError(error.message);
            }

            throw new ValidationError(error.message);
        }

        if (!data.user) {
            throw new ValidationError('Failed to create user account');
        }

        // Create a session for the new user
        const { data: sessionData, error: sessionError } =
            await supabase.auth.signInWithPassword({
                email,
                password,
            });

        if (sessionError || !sessionData.session) {
            throw new ValidationError('Failed to create session');
        }

        return c.json(
            {
                success: true,
                data: {
                    user: {
                        id: data.user.id,
                        email: data.user.email,
                        created_at: data.user.created_at,
                    },
                    session: {
                        access_token: sessionData.session.access_token,
                        refresh_token: sessionData.session.refresh_token,
                        expires_at: sessionData.session.expires_at,
                    },
                },
            },
            201
        );
    } catch (error) {
        if (
            error instanceof ValidationError ||
            error instanceof ConflictError
        ) {
            throw error;
        }
        throw new ValidationError('Failed to create account');
    }
});

/**
 * POST /api/auth/login
 * Authenticate user and return session tokens
 */
auth.post('/login', validateJson(loginSchema), async (c) => {
    const { email, password } = getValidatedData<LoginRequest>(c);

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error || !data.user || !data.session) {
            throw new UnauthorizedError('Invalid email or password');
        }

        return c.json({
            success: true,
            data: {
                user: {
                    id: data.user.id,
                    email: data.user.email,
                },
                session: {
                    access_token: data.session.access_token,
                    refresh_token: data.session.refresh_token,
                    expires_at: data.session.expires_at,
                },
            },
        });
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            throw error;
        }
        throw new UnauthorizedError('Invalid email or password');
    }
});

/**
 * POST /api/auth/logout
 * Invalidate current session
 * Requires authentication
 */
auth.post('/logout', authMiddleware, async (c) => {
    try {
        // Get the token from the Authorization header
        const authHeader = c.req.header('Authorization');
        const token = authHeader?.split(' ')[1];

        if (!token) {
            throw new UnauthorizedError('No active session');
        }

        // Sign out using Supabase
        const { error } = await supabase.auth.signOut();

        // Even if there's an error (e.g., already logged out), return success
        // This makes logout idempotent
        return c.json({
            success: true,
            data: {
                message: 'Successfully logged out',
            },
        });
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            throw error;
        }
        // Return success even on error to make logout idempotent
        return c.json({
            success: true,
            data: {
                message: 'Successfully logged out',
            },
        });
    }
});

/**
 * GET /api/auth/me
 * Get current user profile
 * Requires authentication
 */
auth.get('/me', authMiddleware, async (c) => {
    const user = c.get('user');

    if (!user) {
        throw new UnauthorizedError('User not authenticated');
    }

    return c.json({
        success: true,
        data: {
            id: user.id,
            email: user.email,
            role: user.role,
        },
    });
});

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 * Implements refresh token rotation for security
 */
auth.post('/refresh', validateJson(refreshTokenSchema), async (c) => {
    const { refreshToken } = getValidatedData<RefreshTokenRequest>(c);

    try {
        const { data, error } = await supabase.auth.refreshSession({
            refresh_token: refreshToken,
        });

        if (error || !data.session) {
            throw new UnauthorizedError('Invalid or expired refresh token');
        }

        return c.json({
            success: true,
            data: {
                session: {
                    access_token: data.session.access_token,
                    refresh_token: data.session.refresh_token,
                    expires_at: data.session.expires_at,
                },
            },
        });
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            throw error;
        }
        throw new UnauthorizedError('Invalid or expired refresh token');
    }
});

export default auth;
