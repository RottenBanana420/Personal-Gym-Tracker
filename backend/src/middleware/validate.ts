/**
 * Custom validation middleware for Hono
 * Provides better error formatting than default zValidator
 */

import type { Context, MiddlewareHandler } from 'hono';
import type { ZodSchema } from 'zod';

/**
 * Custom validator middleware that formats Zod errors properly
 */
export function validateJson<T>(schema: ZodSchema<T>): MiddlewareHandler {
    return async (c: Context, next) => {
        let body: any;

        try {
            // Try to get already parsed body first
            body = await c.req.json().catch(() => null);

            // If that fails, the body might already be consumed
            if (body === null) {
                return c.json(
                    {
                        success: false,
                        error: 'Invalid JSON in request body',
                    },
                    400
                );
            }
        } catch (error) {
            return c.json(
                {
                    success: false,
                    error: 'Invalid JSON in request body',
                },
                400
            );
        }

        // Validate with Zod
        const result = schema.safeParse(body);

        if (!result.success) {
            // Format validation errors into user-friendly messages
            // Zod errors have an 'issues' property
            const issues = result.error.issues || [];

            if (Array.isArray(issues) && issues.length > 0) {
                const errors = issues
                    .map((err: any) => {
                        // Format field name to be more user-friendly
                        let field = err.path?.join('.') || 'unknown';

                        // Convert camelCase to space-separated words
                        field = field.replace(/([A-Z])/g, ' $1').trim().toLowerCase();

                        return `${field}: ${err.message}`;
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

            // Fallback if error structure is unexpected
            return c.json(
                {
                    success: false,
                    error: 'Validation failed',
                },
                400
            );
        }

        // Store validated data in context
        c.set('validatedData', result.data);

        await next();
    };
}

/**
 * Helper to get validated data from context
 */
export function getValidatedData<T>(c: Context): T {
    return c.get('validatedData') as T;
}
