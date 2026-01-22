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
        // If HTTPException has a custom response, return it
        if (err.res) {
            return err.res;
        }

        // Check if err.message is actually an object (ZodError from zValidator)
        const message = err.message as any;

        // Debug logging
        if (env.NODE_ENV === 'development' || env.NODE_ENV === 'test') {
            console.log('[Error Handler] Message type:', typeof message);
            console.log('[Error Handler] Message:', message);
            if (typeof message === 'object' && message) {
                console.log('[Error Handler] Message.name:', message.name);
            }
        }

        // Check if this is a ZodError object
        if (message && typeof message === 'object') {
            // ZodError has a 'name' property set to 'ZodError'
            if (message.name === 'ZodError' && message.message) {
                try {
                    // The ZodError object has a message field containing JSON string of issues
                    const issuesJson = message.message;
                    if (typeof issuesJson === 'string') {
                        const issues = JSON.parse(issuesJson);

                        // Format the validation errors into user-friendly messages
                        if (Array.isArray(issues)) {
                            const errors = issues
                                .map((issue: any) => {
                                    const field = issue.path?.join('.') || 'unknown';
                                    return `${field}: ${issue.message}`;
                                })
                                .join(', ');

                            console.log('[Error Handler] Returning formatted errors:', errors);

                            return c.json(
                                {
                                    success: false,
                                    error: errors,
                                },
                                400
                            );
                        }
                    }
                } catch (e) {
                    console.log('[Error Handler] Failed to parse ZodError:', e);
                    // If parsing fails, return generic validation error
                    return c.json(
                        {
                            success: false,
                            error: 'Validation error',
                        },
                        400
                    );
                }
            }

            // If it's any other object, convert to string
            console.log('[Error Handler] Returning stringified object');
            return c.json(
                {
                    success: false,
                    error: JSON.stringify(message),
                },
                err.status
            );
        }

        // If message is a string, try to parse it as JSON (alternative format)
        if (typeof message === 'string') {
            try {
                const parsed = JSON.parse(message);

                if (Array.isArray(parsed)) {
                    const errors = parsed
                        .map((issue: any) => {
                            const field = issue.path?.join('.') || 'unknown';
                            return `${field}: ${issue.message}`;
                        })
                        .join(', ');

                    return c.json(
                        {
                            success: false,
                            error: errors,
                        },
                        400
                    );
                }
            } catch (e) {
                // Not JSON, use as-is
            }

            // Return string message as-is
            return c.json(
                {
                    success: false,
                    error: message,
                },
                err.status
            );
        }

        // Fallback
        console.log('[Error Handler] Fallback path');
        return c.json(
            {
                success: false,
                error: 'Validation error',
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
