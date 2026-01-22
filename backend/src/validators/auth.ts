/**
 * Authentication validation schemas using Zod
 */

import { z } from 'zod';
import { PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH } from '../utils/password';

/**
 * Email validation schema with preprocessing
 * RFC 5322 compliant email validation with automatic trim and lowercase
 */
export const emailSchema = z
    .string()
    .min(1, 'Email is required')
    .transform((val) => val.trim().toLowerCase()) // Preprocess before validation
    .pipe(z.string().email('Invalid email format'));

/**
 * Password validation schema
 * Following NIST 2024 guidelines: 8-64 characters, no complexity requirements
 */
export const passwordSchema = z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
    .max(PASSWORD_MAX_LENGTH, `Password must not exceed ${PASSWORD_MAX_LENGTH} characters`);

/**
 * Signup request validation schema
 */
export const signupSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
});

/**
 * Login request validation schema
 */
export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
});

/**
 * Refresh token request validation schema
 */
export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
});

/**
 * Type exports for TypeScript
 */
export type SignupRequest = z.infer<typeof signupSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type RefreshTokenRequest = z.infer<typeof refreshTokenSchema>;
