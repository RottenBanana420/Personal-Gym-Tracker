import { describe, it, expect, vi } from 'vitest';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { errorHandler } from '../../src/middleware/error';
import {
    ValidationError,
    UnauthorizedError,
    NotFoundError,
    ConflictError,
    InternalServerError,
} from '../../src/types';

describe('Error Middleware - Standardized Responses', () => {
    describe('HTTPException handling', () => {
        it('should handle HTTPException with custom status and message', async () => {
            const app = new Hono();

            app.get('/test', (c) => {
                throw new HTTPException(404, { message: 'Resource not found' });
            });

            app.onError(errorHandler);

            const req = new Request('http://localhost:3000/test');
            const res = await app.fetch(req);

            expect(res.status).toBe(404);
            const body = await res.json();
            expect(body).toEqual({
                success: false,
                error: 'Resource not found',
            });
        });

        it('should handle HTTPException with 400 Bad Request', async () => {
            const app = new Hono();

            app.post('/test', (c) => {
                throw new HTTPException(400, { message: 'Invalid request data' });
            });

            app.onError(errorHandler);

            const req = new Request('http://localhost:3000/test', {
                method: 'POST',
            });
            const res = await app.fetch(req);

            expect(res.status).toBe(400);
            const body = await res.json();
            expect(body).toEqual({
                success: false,
                error: 'Invalid request data',
            });
        });

        it('should handle HTTPException with 401 Unauthorized', async () => {
            const app = new Hono();

            app.get('/test', (c) => {
                throw new HTTPException(401, { message: 'Unauthorized access' });
            });

            app.onError(errorHandler);

            const req = new Request('http://localhost:3000/test');
            const res = await app.fetch(req);

            expect(res.status).toBe(401);
            const body = await res.json();
            expect(body).toEqual({
                success: false,
                error: 'Unauthorized access',
            });
        });
    });

    describe('Custom error classes handling', () => {
        it('should handle ValidationError (400)', async () => {
            const app = new Hono();

            app.post('/test', (c) => {
                throw new ValidationError('Email is required');
            });

            app.onError(errorHandler);

            const req = new Request('http://localhost:3000/test', {
                method: 'POST',
            });
            const res = await app.fetch(req);

            expect(res.status).toBe(400);
            const body = await res.json();
            expect(body).toEqual({
                success: false,
                error: 'Email is required',
            });
        });

        it('should handle UnauthorizedError (401)', async () => {
            const app = new Hono();

            app.get('/test', (c) => {
                throw new UnauthorizedError('Invalid credentials');
            });

            app.onError(errorHandler);

            const req = new Request('http://localhost:3000/test');
            const res = await app.fetch(req);

            expect(res.status).toBe(401);
            const body = await res.json();
            expect(body).toEqual({
                success: false,
                error: 'Invalid credentials',
            });
        });

        it('should handle NotFoundError (404)', async () => {
            const app = new Hono();

            app.get('/test', (c) => {
                throw new NotFoundError('User not found');
            });

            app.onError(errorHandler);

            const req = new Request('http://localhost:3000/test');
            const res = await app.fetch(req);

            expect(res.status).toBe(404);
            const body = await res.json();
            expect(body).toEqual({
                success: false,
                error: 'User not found',
            });
        });

        it('should handle ConflictError (409)', async () => {
            const app = new Hono();

            app.post('/test', (c) => {
                throw new ConflictError('Email already exists');
            });

            app.onError(errorHandler);

            const req = new Request('http://localhost:3000/test', {
                method: 'POST',
            });
            const res = await app.fetch(req);

            expect(res.status).toBe(409);
            const body = await res.json();
            expect(body).toEqual({
                success: false,
                error: 'Email already exists',
            });
        });

        it('should handle InternalServerError (500)', async () => {
            const app = new Hono();

            app.get('/test', (c) => {
                throw new InternalServerError('Database connection failed');
            });

            app.onError(errorHandler);

            const req = new Request('http://localhost:3000/test');
            const res = await app.fetch(req);

            expect(res.status).toBe(500);
            const body = await res.json();
            expect(body).toEqual({
                success: false,
                error: 'Database connection failed',
            });
        });
    });

    describe('Generic error handling', () => {
        it('should handle generic Error as 500 Internal Server Error', async () => {
            const app = new Hono();

            app.get('/test', (c) => {
                throw new Error('Something went wrong');
            });

            app.onError(errorHandler);

            const req = new Request('http://localhost:3000/test');
            const res = await app.fetch(req);

            expect(res.status).toBe(500);
            const body = await res.json();
            expect(body).toEqual({
                success: false,
                error: 'Internal server error',
            });
        });

        it('should handle TypeError as 500 Internal Server Error', async () => {
            const app = new Hono();

            app.get('/test', (c) => {
                // Simulate a TypeError
                const obj: any = null;
                obj.property.access; // This will throw TypeError
                return c.json({ success: true });
            });

            app.onError(errorHandler);

            const req = new Request('http://localhost:3000/test');
            const res = await app.fetch(req);

            expect(res.status).toBe(500);
            const body = await res.json();
            expect(body).toEqual({
                success: false,
                error: 'Internal server error',
            });
        });

        it('should handle ReferenceError as 500 Internal Server Error', async () => {
            const app = new Hono();

            app.get('/test', (c) => {
                // Simulate a ReferenceError
                // @ts-expect-error - intentionally accessing undefined variable
                return c.json({ value: undefinedVariable });
            });

            app.onError(errorHandler);

            const req = new Request('http://localhost:3000/test');
            const res = await app.fetch(req);

            expect(res.status).toBe(500);
            const body = await res.json();
            expect(body).toEqual({
                success: false,
                error: 'Internal server error',
            });
        });
    });

    describe('Error logging', () => {
        it('should log unhandled errors to console', async () => {
            const app = new Hono();
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

            app.get('/test', (c) => {
                throw new Error('Test error for logging');
            });

            app.onError(errorHandler);

            const req = new Request('http://localhost:3000/test');
            await app.fetch(req);

            expect(consoleErrorSpy).toHaveBeenCalled();
            const logArgs = consoleErrorSpy.mock.calls[0];
            expect(logArgs[0]).toContain('Error');

            consoleErrorSpy.mockRestore();
        });

        it('should not log HTTPException errors to console', async () => {
            const app = new Hono();
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

            app.get('/test', (c) => {
                throw new HTTPException(404, { message: 'Not found' });
            });

            app.onError(errorHandler);

            const req = new Request('http://localhost:3000/test');
            await app.fetch(req);

            expect(consoleErrorSpy).not.toHaveBeenCalled();

            consoleErrorSpy.mockRestore();
        });

        it('should log stack trace in development mode', async () => {
            const app = new Hono();
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'development';

            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

            app.get('/test', (c) => {
                throw new Error('Test error with stack');
            });

            app.onError(errorHandler);

            const req = new Request('http://localhost:3000/test');
            await app.fetch(req);

            expect(consoleErrorSpy).toHaveBeenCalled();

            consoleErrorSpy.mockRestore();
            process.env.NODE_ENV = originalEnv;
        });
    });

    describe('Security - No sensitive data leakage', () => {
        it('should not expose stack traces in production', async () => {
            const app = new Hono();
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'production';

            app.get('/test', (c) => {
                throw new Error('Internal error with sensitive data');
            });

            app.onError(errorHandler);

            const req = new Request('http://localhost:3000/test');
            const res = await app.fetch(req);

            const body = await res.json();
            expect(body.error).toBe('Internal server error');
            expect(body).not.toHaveProperty('stack');
            expect(body).not.toHaveProperty('message');

            process.env.NODE_ENV = originalEnv;
        });
    });
});
