import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Hono } from 'hono';
import { logger } from '../../src/middleware/logger';

describe('Logger Middleware', () => {
    let consoleInfoSpy: any;

    beforeEach(() => {
        consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => { });
    });

    afterEach(() => {
        consoleInfoSpy.mockRestore();
    });

    describe('Request Logging', () => {
        it('should log HTTP method and path', async () => {
            const app = new Hono();
            app.use('*', logger);
            app.get('/test', (c) => c.json({ success: true }));

            const req = new Request('http://localhost:3000/test');
            await app.fetch(req);

            expect(consoleInfoSpy).toHaveBeenCalled();
            const logCall = consoleInfoSpy.mock.calls[0][0];
            expect(logCall).toContain('GET');
            expect(logCall).toContain('/test');
        });

        it('should log response status code', async () => {
            const app = new Hono();
            app.use('*', logger);
            app.get('/test', (c) => c.json({ success: true }));

            const req = new Request('http://localhost:3000/test');
            await app.fetch(req);

            const logCall = consoleInfoSpy.mock.calls[0][0];
            expect(logCall).toContain('200');
        });

        it('should log request duration in milliseconds', async () => {
            const app = new Hono();
            app.use('*', logger);
            app.get('/test', (c) => c.json({ success: true }));

            const req = new Request('http://localhost:3000/test');
            await app.fetch(req);

            const logCall = consoleInfoSpy.mock.calls[0][0];
            expect(logCall).toMatch(/\d+ms/);
        });

        it('should log different HTTP methods correctly', async () => {
            const app = new Hono();
            app.use('*', logger);
            app.post('/test', (c) => c.json({ success: true }));

            const req = new Request('http://localhost:3000/test', {
                method: 'POST',
            });
            await app.fetch(req);

            const logCall = consoleInfoSpy.mock.calls[0][0];
            expect(logCall).toContain('POST');
        });

        it('should log error status codes', async () => {
            const app = new Hono();
            app.use('*', logger);
            app.get('/test', (c) => c.json({ error: 'Not found' }, 404));

            const req = new Request('http://localhost:3000/test');
            await app.fetch(req);

            const logCall = consoleInfoSpy.mock.calls[0][0];
            expect(logCall).toContain('404');
        });
    });

    describe('Structured Logging Format', () => {
        it('should include timestamp in log output', async () => {
            const app = new Hono();
            app.use('*', logger);
            app.get('/test', (c) => c.json({ success: true }));

            const req = new Request('http://localhost:3000/test');
            await app.fetch(req);

            const logCall = consoleInfoSpy.mock.calls[0][0];
            // Should contain ISO timestamp or similar format
            expect(logCall).toMatch(/\d{4}-\d{2}-\d{2}|\d{2}:\d{2}:\d{2}/);
        });

        it('should include request ID in log output', async () => {
            const app = new Hono();
            app.use('*', logger);
            app.get('/test', (c) => c.json({ success: true }));

            const req = new Request('http://localhost:3000/test');
            await app.fetch(req);

            const logCall = consoleInfoSpy.mock.calls[0][0];
            // Should contain a request ID (UUID or similar)
            expect(logCall).toMatch(/[a-f0-9-]{36}|req-[a-z0-9]+/i);
        });
    });

    describe('Sensitive Data Protection', () => {
        it('should not log Authorization header', async () => {
            const app = new Hono();
            app.use('*', logger);
            app.get('/test', (c) => c.json({ success: true }));

            const req = new Request('http://localhost:3000/test', {
                headers: {
                    Authorization: 'Bearer secret_token_12345',
                },
            });
            await app.fetch(req);

            const logCall = consoleInfoSpy.mock.calls[0][0];
            expect(logCall).not.toContain('secret_token_12345');
            expect(logCall).not.toContain('Bearer');
        });

        it('should not log password fields from request body', async () => {
            const app = new Hono();
            app.use('*', logger);
            app.post('/test', (c) => c.json({ success: true }));

            const req = new Request('http://localhost:3000/test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: 'testuser',
                    password: 'super_secret_password',
                }),
            });
            await app.fetch(req);

            const logCall = consoleInfoSpy.mock.calls[0][0];
            expect(logCall).not.toContain('super_secret_password');
        });
    });

    describe('Performance', () => {
        it('should measure request duration accurately', async () => {
            const app = new Hono();
            app.use('*', logger);
            app.get('/test', async (c) => {
                // Simulate some processing time
                await new Promise((resolve) => setTimeout(resolve, 10));
                return c.json({ success: true });
            });

            const req = new Request('http://localhost:3000/test');
            await app.fetch(req);

            const logCall = consoleInfoSpy.mock.calls[0][0];
            const durationMatch = logCall.match(/(\d+)ms/);
            expect(durationMatch).toBeTruthy();
            const duration = parseInt(durationMatch[1]);
            expect(duration).toBeGreaterThanOrEqual(10);
        });
    });

    describe('User Agent Logging', () => {
        it('should log user agent when provided', async () => {
            const app = new Hono();
            app.use('*', logger);
            app.get('/test', (c) => c.json({ success: true }));

            const req = new Request('http://localhost:3000/test', {
                headers: {
                    'User-Agent': 'Mozilla/5.0 Test Browser',
                },
            });
            await app.fetch(req);

            const logCall = consoleInfoSpy.mock.calls[0][0];
            expect(logCall).toContain('Mozilla/5.0 Test Browser');
        });
    });
});
