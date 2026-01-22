import { defineConfig } from 'vitest/config';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.test file for test environment
dotenv.config({ path: path.resolve(__dirname, '.env.test') });

export default defineConfig({
    test: {
        // Test environment
        globals: true,
        environment: 'node',

        // Performance optimizations
        pool: 'threads',

        // Coverage configuration
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html', 'lcov'],
            exclude: [
                'node_modules/',
                'tests/',
                '**/*.test.ts',
                '**/*.spec.ts',
                '**/index.ts',
            ],
            thresholds: {
                lines: 80,
                functions: 80,
                branches: 75, // Slightly lower due to env validation error paths
                statements: 80,
            },
        },

        // Test behavior
        clearMocks: true,
        mockReset: true,
        restoreMocks: true,

        // Timeouts (increased for database operations)
        testTimeout: 30000,
        hookTimeout: 30000,

        // Watch mode
        watch: false,

        // Reporters
        reporters: ['verbose'],
    },
});
