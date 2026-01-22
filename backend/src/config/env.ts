import { z } from 'zod';

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

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
    const parsed = envSchema.safeParse(process.env);

    if (!parsed.success) {
        console.error('❌ Invalid environment variables:', parsed.error.format());
        throw new Error('Invalid environment variables');
    }

    return parsed.data;
}

export const env = validateEnv();
