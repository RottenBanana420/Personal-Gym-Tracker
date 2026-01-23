/**
 * Validation schemas for statistics endpoints
 */

import { z } from 'zod';

/**
 * Query parameters for progress endpoint
 */
export const progressQuerySchema = z.object({
    period: z
        .enum(['4weeks', '12weeks', '6months', 'all'])
        .default('12weeks')
        .optional(),
});

export type ProgressQueryParams = z.infer<typeof progressQuerySchema>;

/**
 * Query parameters for volume endpoint
 */
export const volumeQuerySchema = z.object({
    groupBy: z.enum(['week', 'month']).default('week').optional(),
    period: z
        .enum(['4weeks', '12weeks', '6months', 'all'])
        .default('12weeks')
        .optional(),
});

export type VolumeQueryParams = z.infer<typeof volumeQuerySchema>;
