import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './tests/setup.ts',
        css: true,
        env: {
            VITE_SUPABASE_URL: 'https://test.supabase.co',
            VITE_SUPABASE_ANON_KEY: 'test-anon-key',
            VITE_API_URL: 'http://localhost:3000',
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
                '**/*.test.tsx',
                '**/*.spec.ts',
                '**/*.spec.tsx',
                '**/main.tsx',
                '**/vite-env.d.ts',
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
