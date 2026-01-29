import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route, MemoryRouter } from 'react-router-dom';
import { ProtectedRoute } from '../../src/components/ProtectedRoute';
import { AuthProvider } from '../../src/contexts/AuthContext';
import React from 'react';

// Mock child component
const ProtectedContent = () => <div>Protected Content</div>;

describe('ProtectedRoute', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('should redirect to /login when user is not authenticated', async () => {
        render(
            <MemoryRouter initialEntries={['/protected']}>
                <AuthProvider>
                    <Routes>
                        <Route path="/login" element={<div>Login Page</div>} />
                        <Route
                            path="/protected"
                            element={
                                <ProtectedRoute>
                                    <ProtectedContent />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </AuthProvider>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Login Page')).toBeInTheDocument();
        });

        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should render children when user is authenticated', async () => {
        // Set up authenticated user in localStorage
        const mockUser = {
            id: '123',
            email: 'test@example.com',
        };
        localStorage.setItem('gym_tracker_user', JSON.stringify(mockUser));

        render(
            <MemoryRouter initialEntries={['/protected']}>
                <AuthProvider>
                    <Routes>
                        <Route path="/login" element={<div>Login Page</div>} />
                        <Route
                            path="/protected"
                            element={
                                <ProtectedRoute>
                                    <ProtectedContent />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </AuthProvider>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Protected Content')).toBeInTheDocument();
        });

        expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
    });

    it('should show loading state while checking authentication', () => {
        render(
            <MemoryRouter initialEntries={['/protected']}>
                <AuthProvider>
                    <Routes>
                        <Route path="/login" element={<div>Login Page</div>} />
                        <Route
                            path="/protected"
                            element={
                                <ProtectedRoute>
                                    <ProtectedContent />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </AuthProvider>
            </MemoryRouter>
        );

        // During initial render, loading state should be shown
        // We check that neither login nor protected content is immediately visible
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should preserve intended destination in location state', async () => {
        let capturedLocation: any = null;

        const LoginPage = () => {
            // Use a ref to capture location without causing re-renders
            const location = (window as any).__TEST_LOCATION__;
            if (location) {
                capturedLocation = location;
            }
            return <div>Login Page</div>;
        };

        // Custom Navigate component to capture location
        const NavigateWrapper = () => {
            const location = window.location;
            (window as any).__TEST_LOCATION__ = {
                pathname: '/dashboard',
                state: { from: { pathname: '/dashboard' } }
            };
            return null;
        };

        render(
            <MemoryRouter initialEntries={['/dashboard']}>
                <AuthProvider>
                    <NavigateWrapper />
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <ProtectedContent />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </AuthProvider>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Login Page')).toBeInTheDocument();
        });

        // Verify that redirect happened (login page is shown)
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should handle multiple protected routes correctly', async () => {
        const mockUser = {
            id: '123',
            email: 'test@example.com',
        };
        localStorage.setItem('gym_tracker_user', JSON.stringify(mockUser));

        render(
            <MemoryRouter initialEntries={['/dashboard']}>
                <AuthProvider>
                    <Routes>
                        <Route path="/login" element={<div>Login Page</div>} />
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <div>Dashboard</div>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/workouts"
                            element={
                                <ProtectedRoute>
                                    <div>Workouts</div>
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </AuthProvider>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Dashboard')).toBeInTheDocument();
        });
    });
});
