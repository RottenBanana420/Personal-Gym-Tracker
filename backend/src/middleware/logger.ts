import type { Context, Next } from 'hono';
import { env } from '../config/env';

/**
 * Generate a unique request ID
 */
function generateRequestId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Format timestamp for logging
 */
function formatTimestamp(): string {
    return new Date().toISOString();
}

/**
 * Get color code for status
 */
function getStatusColor(status: number): string {
    if (env.NODE_ENV !== 'development') return '';

    if (status >= 500) return '\x1b[31m'; // Red
    if (status >= 400) return '\x1b[33m'; // Yellow
    if (status >= 300) return '\x1b[36m'; // Cyan
    if (status >= 200) return '\x1b[32m'; // Green
    return '\x1b[0m'; // Reset
}

/**
 * Request logging middleware
 * Logs structured information about each request
 */
export async function logger(c: Context, next: Next) {
    const start = Date.now();
    const requestId = generateRequestId();
    const method = c.req.method;
    const path = c.req.path;
    const timestamp = formatTimestamp();
    const userAgent = c.req.header('User-Agent') || 'Unknown';

    // Attach request ID to context for use in other middleware
    c.set('requestId', requestId);

    await next();

    const elapsed = Date.now() - start;
    const status = c.res.status;
    const statusColor = getStatusColor(status);
    const resetColor = env.NODE_ENV === 'development' ? '\x1b[0m' : '';

    // Structured log format
    const logMessage = `[${timestamp}] [${requestId}] ${statusColor}${method} ${path} ${status}${resetColor} - ${elapsed}ms - ${userAgent}`;

    console.info(logMessage);
}

