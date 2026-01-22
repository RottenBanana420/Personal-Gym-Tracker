/**
 * Type definitions for the Personal Gym Tracker API
 */

import type { User } from '@supabase/supabase-js';

/**
 * Standard success response format
 * @template T - The type of data being returned
 */
export interface SuccessResponse<T = unknown> {
    success: true;
    data: T;
}

/**
 * Standard error response format
 */
export interface ErrorResponse {
    success: false;
    error: string;
}

/**
 * Union type for all API responses
 */
export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

/**
 * User information attached to authenticated requests
 */
export interface AuthUser {
    id: string;
    email: string;
    role?: string;
    [key: string]: unknown;
}

/**
 * Hono context variables for authenticated requests
 */
export interface ContextVariables {
    user?: AuthUser;
    requestId: string;
}

/**
 * Hono context type with authentication
 */
export interface AuthContext {
    Variables: ContextVariables;
}

/**
 * Custom error classes for better error handling
 */

/**
 * Base API error class
 */
export class ApiError extends Error {
    constructor(
        message: string,
        public statusCode: number = 500
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

/**
 * Validation error (400)
 */
export class ValidationError extends ApiError {
    constructor(message: string) {
        super(message, 400);
        this.name = 'ValidationError';
    }
}

/**
 * Unauthorized error (401)
 */
export class UnauthorizedError extends ApiError {
    constructor(message: string = 'Unauthorized') {
        super(message, 401);
        this.name = 'UnauthorizedError';
    }
}

/**
 * Forbidden error (403)
 */
export class ForbiddenError extends ApiError {
    constructor(message: string = 'Forbidden') {
        super(message, 403);
        this.name = 'ForbiddenError';
    }
}

/**
 * Not found error (404)
 */
export class NotFoundError extends ApiError {
    constructor(message: string = 'Resource not found') {
        super(message, 404);
        this.name = 'NotFoundError';
    }
}

/**
 * Conflict error (409)
 */
export class ConflictError extends ApiError {
    constructor(message: string) {
        super(message, 409);
        this.name = 'ConflictError';
    }
}

/**
 * Internal server error (500)
 */
export class InternalServerError extends ApiError {
    constructor(message: string = 'Internal server error') {
        super(message, 500);
        this.name = 'InternalServerError';
    }
}
