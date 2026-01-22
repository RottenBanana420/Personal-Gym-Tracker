/**
 * Password validation utilities
 * Following NIST 2024 guidelines: prioritize length over complexity
 */

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 64;

export interface PasswordValidationResult {
    valid: boolean;
    feedback?: string;
}

/**
 * Validate password strength based on NIST 2024 guidelines
 * - Minimum 8 characters
 * - Maximum 64 characters
 * - No mandatory complexity requirements (length is prioritized)
 */
export function validatePasswordStrength(password: string): PasswordValidationResult {
    if (!password) {
        return {
            valid: false,
            feedback: 'Password is required',
        };
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
        return {
            valid: false,
            feedback: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`,
        };
    }

    if (password.length > PASSWORD_MAX_LENGTH) {
        return {
            valid: false,
            feedback: `Password must not exceed ${PASSWORD_MAX_LENGTH} characters`,
        };
    }

    return {
        valid: true,
    };
}

/**
 * Get user-friendly feedback for password strength
 * Encourages longer passwords over complex ones
 */
export function getPasswordStrengthFeedback(password: string): string {
    const length = password.length;

    if (length < PASSWORD_MIN_LENGTH) {
        return `Too short. Add ${PASSWORD_MIN_LENGTH - length} more character${PASSWORD_MIN_LENGTH - length === 1 ? '' : 's'}.`;
    }

    if (length >= PASSWORD_MIN_LENGTH && length < 12) {
        return 'Acceptable. Consider using a longer password for better security.';
    }

    if (length >= 12 && length < 16) {
        return 'Good. Your password is reasonably secure.';
    }

    if (length >= 16) {
        return 'Excellent! Your password is very secure.';
    }

    return 'Password strength unknown';
}
