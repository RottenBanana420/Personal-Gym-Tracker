import { describe, it, expect, vi } from 'vitest';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { errorHandler } from '../../src/middleware/error';

describe('Error Middleware', () => {
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
                error: 'Resource not found',
                status: 404,
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
                error: 'Invalid request data',
                status: 400,
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
                error: 'Unauthorized access',
                status: 401,
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
                error: 'Internal Server Error',
                status: 500,
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
                error: 'Internal Server Error',
                status: 500,
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
                error: 'Internal Server Error',
                status: 500,
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

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Unhandled error:',
                expect.any(Error)
            );

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
    });
});
