import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from './middleware/logger';
import { errorHandler } from './middleware/error';
import { env } from './config/env';
import health from './routes/health';
import auth from './routes/auth';

const app = new Hono();

// Middleware
app.use('*', cors({
    origin: env.ALLOWED_ORIGINS.split(','),
    credentials: true,
}));
app.use('*', logger);

// Routes
app.route('/health', health);
app.route('/api/auth', auth);

// Root endpoint
app.get('/', (c) => {
    return c.json({
        message: 'Personal Gym Tracker API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            auth: '/api/auth',
        },
    });
});

// Error handling
app.onError(errorHandler);

// Start server
const port = parseInt(env.PORT);
console.info(`🚀 Server running on http://localhost:${port}`);

export default {
    port,
    fetch: app.fetch,
};
