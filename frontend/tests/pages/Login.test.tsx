import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../src/contexts/AuthContext';
import { Login } from '../../src/pages/Login';
import React from 'react';

describe('Login Page', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    const renderLogin = () => {
        return render(
            <BrowserRouter>
                <AuthProvider>
                    <Login />
                </AuthProvider>
            </BrowserRouter>
        );
    };

    it('should render login form', () => {
        renderLogin();

        expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should have link to signup page', () => {
        renderLogin();

        const signupLink = screen.getByRole('link', { name: /sign up/i });
        expect(signupLink).toBeInTheDocument();
        expect(signupLink).toHaveAttribute('href', '/signup');
    });

    it('should handle form submission', async () => {
        renderLogin();

        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        // Form should be submitted (button disabled during submission)
        await waitFor(() => {
            expect(submitButton).toBeDisabled();
        }, { timeout: 100 });
    });

    it('should validate email format', async () => {
        renderLogin();

        const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
        expect(emailInput.type).toBe('email');
    });

    it('should validate password is required', async () => {
        renderLogin();

        const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
        expect(passwordInput.required).toBe(true);
    });
});
