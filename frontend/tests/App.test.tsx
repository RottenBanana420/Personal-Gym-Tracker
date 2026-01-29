import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../src/contexts/AuthContext';
import App from '../src/App';
import React from 'react';

describe('App Component', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('should show loading state initially', () => {
        render(
            <MemoryRouter initialEntries={['/']}>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </MemoryRouter>
        );

        // Loading state should be visible initially
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('should redirect to login when not authenticated', async () => {
        render(
            <MemoryRouter initialEntries={['/']}>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </MemoryRouter>
        );

        // Wait for loading to complete and redirect to login
        await waitFor(() => {
            expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
        });
    });

    it('should redirect to dashboard when authenticated', async () => {
        // Set up authenticated user
        const mockUser = {
            id: '123',
            email: 'test@example.com',
        };
        localStorage.setItem('gym_tracker_user', JSON.stringify(mockUser));

        render(
            <MemoryRouter initialEntries={['/']}>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </MemoryRouter>
        );

        // Wait for loading to complete and redirect to dashboard
        await waitFor(() => {
            expect(screen.getByText(/welcome back, test/i)).toBeInTheDocument();
        });
    });

    it('should show header and navigation when authenticated', async () => {
        // Set up authenticated user
        const mockUser = {
            id: '123',
            email: 'test@example.com',
        };
        localStorage.setItem('gym_tracker_user', JSON.stringify(mockUser));

        render(
            <MemoryRouter initialEntries={['/dashboard']}>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </MemoryRouter>
        );

        // Wait for loading to complete
        await waitFor(() => {
            expect(screen.getByText(/gym tracker/i)).toBeInTheDocument();
        });

        // Check navigation links (they appear in both header and mobile nav)
        expect(screen.getAllByText(/dashboard/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/workouts/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/exercises/i).length).toBeGreaterThan(0);
    });

    it('should not show header when not authenticated', async () => {
        render(
            <MemoryRouter initialEntries={['/login']}>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </MemoryRouter>
        );

        // Wait for loading to complete
        await waitFor(() => {
            expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
        });

        // Header should not be visible on login page
        expect(screen.queryByText(/gym tracker/i)).not.toBeInTheDocument();
    });
});
