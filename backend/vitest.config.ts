import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        // Test environment
        globals: true,
        environment: 'node',
        env: {
            PORT: '3000',
            NODE_ENV: 'test',
            SUPABASE_URL: 'https://test.supabase.co',
            SUPABASE_ANON_KEY: 'test-anon-key',
            SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
            ALLOWED_ORIGINS: 'http://localhost:5173',
        },

        // Performance optimizations
        pool: 'threads',
        poolOptions: {
            threads: {
                singleThread: false,
                isolate: true,
            },
        },

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
                branches: 80,
                statements: 80,
            },
        },

        // Test behavior
        clearMocks: true,
        mockReset: true,
        restoreMocks: true,

        // Timeouts
        testTimeout: 10000,
        hookTimeout: 10000,

        // Watch mode
        watch: false,

        // Reporters
        reporters: ['verbose'],
    },
});
