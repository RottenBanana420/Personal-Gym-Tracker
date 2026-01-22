import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { ApiError } from '../types';
import { env } from '../config/env';

/**
 * Global error handler middleware
 * Standardizes error responses and logs errors appropriately
 */
export async function errorHandler(err: Error, c: Context) {
    // Handle HTTPException from Hono
    if (err instanceof HTTPException) {
        return c.json(
            {
                success: false,
                error: err.message,
            },
            err.status
        );
    }

    // Handle custom API errors
    if (err instanceof ApiError) {
        return c.json(
            {
                success: false,
                error: err.message,
            },
            err.statusCode
        );
    }

    // Log unexpected errors
    if (env.NODE_ENV === 'development') {
        console.error('[Error Handler] Unexpected error:', err);
        console.error('[Error Handler] Stack trace:', err.stack);
    } else {
        console.error('[Error Handler] Unexpected error:', err.message);
    }

    // Return generic error for unexpected errors (don't leak sensitive info)
    return c.json(
        {
            success: false,
            error: 'Internal server error',
        },
        500
    );
}
