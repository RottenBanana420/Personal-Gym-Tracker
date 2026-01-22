import { describe, it, expect } from 'vitest';
import app from '../src/index';

describe('Health Endpoint', () => {
    it('should return 200 OK with health status', async () => {
        const req = new Request('http://localhost:3000/health');
        const res = await app.fetch(req);

        expect(res.status).toBe(200);

        const data = await res.json();
        expect(data).toHaveProperty('status', 'ok');
        expect(data).toHaveProperty('timestamp');
        expect(data).toHaveProperty('uptime');
    });

    it('should return valid timestamp', async () => {
        const req = new Request('http://localhost:3000/health');
        const res = await app.fetch(req);
        const data = await res.json();

        const timestamp = new Date(data.timestamp);
        expect(timestamp).toBeInstanceOf(Date);
        expect(timestamp.getTime()).toBeGreaterThan(0);
    });

    it('should return uptime as a number', async () => {
        const req = new Request('http://localhost:3000/health');
        const res = await app.fetch(req);
        const data = await res.json();

        expect(typeof data.uptime).toBe('number');
        expect(data.uptime).toBeGreaterThanOrEqual(0);
    });
});

describe('Root Endpoint', () => {
    it('should return API information', async () => {
        const req = new Request('http://localhost:3000/');
        const res = await app.fetch(req);

        expect(res.status).toBe(200);

        const data = await res.json();
        expect(data).toHaveProperty('message', 'Personal Gym Tracker API');
        expect(data).toHaveProperty('version', '1.0.0');
        expect(data).toHaveProperty('endpoints');
    });
});
