import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';

// Import the schema for testing (we'll recreate it here for testing purposes)
const envSchema = z.object({
    PORT: z.string().default('3000'),
    NODE_ENV: z
        .enum(['development', 'production', 'test'])
        .default('development'),
    SUPABASE_URL: z.string().url(),
    SUPABASE_ANON_KEY: z.string().min(1),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    ALLOWED_ORIGINS: z.string().default('http://localhost:5173'),
});

describe('Environment Configuration', () => {
    describe('Valid environment variables', () => {
        it('should validate complete environment variables successfully', () => {
            const testEnv = {
                PORT: '3000',
                NODE_ENV: 'test',
                SUPABASE_URL: 'https://test.supabase.co',
                SUPABASE_ANON_KEY: 'test-anon-key',
                SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
                ALLOWED_ORIGINS: 'http://localhost:5173',
            };

            const result = envSchema.safeParse(testEnv);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.PORT).toBe('3000');
                expect(result.data.NODE_ENV).toBe('test');
                expect(result.data.SUPABASE_URL).toBe('https://test.supabase.co');
                expect(result.data.SUPABASE_ANON_KEY).toBe('test-anon-key');
                expect(result.data.SUPABASE_SERVICE_ROLE_KEY).toBe('test-service-role-key');
                expect(result.data.ALLOWED_ORIGINS).toBe('http://localhost:5173');
            }
        });

        it('should use default values for optional variables', () => {
            const testEnv = {
                SUPABASE_URL: 'https://test.supabase.co',
                SUPABASE_ANON_KEY: 'test-anon-key',
                SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
            };

            const result = envSchema.safeParse(testEnv);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.PORT).toBe('3000'); // default
                expect(result.data.NODE_ENV).toBe('development'); // default
                expect(result.data.ALLOWED_ORIGINS).toBe('http://localhost:5173'); // default
            }
        });

        it('should accept production environment', () => {
            const testEnv = {
                NODE_ENV: 'production',
                SUPABASE_URL: 'https://prod.supabase.co',
                SUPABASE_ANON_KEY: 'prod-anon-key',
                SUPABASE_SERVICE_ROLE_KEY: 'prod-service-role-key',
            };

            const result = envSchema.safeParse(testEnv);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.NODE_ENV).toBe('production');
            }
        });

        it('should accept development environment', () => {
            const testEnv = {
                NODE_ENV: 'development',
                SUPABASE_URL: 'https://dev.supabase.co',
                SUPABASE_ANON_KEY: 'dev-anon-key',
                SUPABASE_SERVICE_ROLE_KEY: 'dev-service-role-key',
            };

            const result = envSchema.safeParse(testEnv);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.NODE_ENV).toBe('development');
            }
        });

        it('should accept custom PORT value', () => {
            const testEnv = {
                PORT: '8080',
                SUPABASE_URL: 'https://test.supabase.co',
                SUPABASE_ANON_KEY: 'test-anon-key',
                SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
            };

            const result = envSchema.safeParse(testEnv);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.PORT).toBe('8080');
            }
        });

        it('should accept custom ALLOWED_ORIGINS value', () => {
            const testEnv = {
                SUPABASE_URL: 'https://test.supabase.co',
                SUPABASE_ANON_KEY: 'test-anon-key',
                SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
                ALLOWED_ORIGINS: 'https://example.com,https://app.example.com',
            };

            const result = envSchema.safeParse(testEnv);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.ALLOWED_ORIGINS).toBe('https://example.com,https://app.example.com');
            }
        });
    });

    describe('Invalid environment variables', () => {
        it('should fail when SUPABASE_URL is missing', () => {
            const testEnv = {
                SUPABASE_ANON_KEY: 'test-anon-key',
                SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
            };

            const result = envSchema.safeParse(testEnv);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({
                            path: ['SUPABASE_URL'],
                            code: 'invalid_type',
                        }),
                    ])
                );
            }
        });

        it('should fail when SUPABASE_URL is not a valid URL', () => {
            const testEnv = {
                SUPABASE_URL: 'not-a-valid-url',
                SUPABASE_ANON_KEY: 'test-anon-key',
                SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
            };

            const result = envSchema.safeParse(testEnv);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({
                            path: ['SUPABASE_URL'],
                            code: 'invalid_format',
                        }),
                    ])
                );
            }
        });

        it('should fail when SUPABASE_ANON_KEY is missing', () => {
            const testEnv = {
                SUPABASE_URL: 'https://test.supabase.co',
                SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
            };

            const result = envSchema.safeParse(testEnv);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({
                            path: ['SUPABASE_ANON_KEY'],
                            code: 'invalid_type',
                        }),
                    ])
                );
            }
        });

        it('should fail when SUPABASE_ANON_KEY is empty', () => {
            const testEnv = {
                SUPABASE_URL: 'https://test.supabase.co',
                SUPABASE_ANON_KEY: '',
                SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
            };

            const result = envSchema.safeParse(testEnv);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({
                            path: ['SUPABASE_ANON_KEY'],
                            code: 'too_small',
                        }),
                    ])
                );
            }
        });

        it('should fail when SUPABASE_SERVICE_ROLE_KEY is missing', () => {
            const testEnv = {
                SUPABASE_URL: 'https://test.supabase.co',
                SUPABASE_ANON_KEY: 'test-anon-key',
            };

            const result = envSchema.safeParse(testEnv);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({
                            path: ['SUPABASE_SERVICE_ROLE_KEY'],
                            code: 'invalid_type',
                        }),
                    ])
                );
            }
        });

        it('should fail when SUPABASE_SERVICE_ROLE_KEY is empty', () => {
            const testEnv = {
                SUPABASE_URL: 'https://test.supabase.co',
                SUPABASE_ANON_KEY: 'test-anon-key',
                SUPABASE_SERVICE_ROLE_KEY: '',
            };

            const result = envSchema.safeParse(testEnv);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({
                            path: ['SUPABASE_SERVICE_ROLE_KEY'],
                            code: 'too_small',
                        }),
                    ])
                );
            }
        });

        it('should fail when NODE_ENV has invalid value', () => {
            const testEnv = {
                NODE_ENV: 'invalid-env',
                SUPABASE_URL: 'https://test.supabase.co',
                SUPABASE_ANON_KEY: 'test-anon-key',
                SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
            };

            const result = envSchema.safeParse(testEnv);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({
                            path: ['NODE_ENV'],
                            code: 'invalid_value',
                        }),
                    ])
                );
            }
        });
    });
});
