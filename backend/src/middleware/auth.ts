import type { Context, Next } from 'hono';
import { supabase } from '../config/supabase';
import { UnauthorizedError } from '../types';
import type { AuthContext } from '../types';

/**
 * Extract JWT token from Authorization header
 * Returns: token string if valid format, empty string if malformed, null if missing
 */
function extractToken(authHeader: string | undefined): string | null | '' {
    if (!authHeader) {
        return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return ''; // Malformed format
    }

    return parts[1];
}

/**
 * Required authentication middleware
 * Validates JWT token and attaches user to context
 * Throws UnauthorizedError if token is missing or invalid
 */
export async function authMiddleware(c: Context<AuthContext>, next: Next) {
    const authHeader = c.req.header('Authorization');
    const token = extractToken(authHeader);

    if (token === null) {
        throw new UnauthorizedError('Missing authorization token');
    }

    if (token === '') {
        throw new UnauthorizedError('Invalid authorization format');
    }

    // Extract token format validation
    if (token.split('.').length !== 3) {
        throw new UnauthorizedError('Invalid authorization format');
    }

    try {
        // Verify token with Supabase
        const { data, error } = await supabase.auth.getUser(token);

        if (error || !data.user) {
            throw new UnauthorizedError('Invalid or expired token');
        }

        // Attach user to context
        c.set('user', {
            id: data.user.id,
            email: data.user.email || '',
            role: data.user.role,
            ...data.user.user_metadata,
        });

        await next();
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            throw error;
        }
        throw new UnauthorizedError('Invalid or expired token');
    }
}

/**
 * Optional authentication middleware
 * Validates JWT token if present, but allows request to continue if not
 * Attaches user to context if token is valid
 */
export async function optionalAuthMiddleware(c: Context<AuthContext>, next: Next) {
    const authHeader = c.req.header('Authorization');
    const token = extractToken(authHeader);

    // If no token, just continue without authentication
    if (!token) {
        await next();
        return;
    }

    // If token format is invalid, ignore it and continue
    if (token.split('.').length !== 3) {
        await next();
        return;
    }

    try {
        // Verify token with Supabase
        const { data, error } = await supabase.auth.getUser(token);

        if (!error && data.user) {
            // Attach user to context if valid
            c.set('user', {
                id: data.user.id,
                email: data.user.email || '',
                role: data.user.role,
                ...data.user.user_metadata,
            });
        }
    } catch (error) {
        // Silently ignore errors for optional auth
    }

    await next();
}
