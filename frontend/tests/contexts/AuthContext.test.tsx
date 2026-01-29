import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../src/contexts/AuthContext';
import React from 'react';

describe('AuthContext', () => {
    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
        vi.clearAllMocks();
    });

    describe('AuthProvider', () => {
        it('should provide auth context to children', () => {
            const TestComponent = () => {
                const auth = useAuth();
                return <div>Auth Context Available: {auth ? 'Yes' : 'No'}</div>;
            };

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            expect(screen.getByText(/Auth Context Available: Yes/i)).toBeInTheDocument();
        });

        it('should initialize with loading state', () => {
            const TestComponent = () => {
                const { loading } = useAuth();
                return <div>Loading: {loading ? 'Yes' : 'No'}</div>;
            };

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            expect(screen.getByText(/Loading: Yes/i)).toBeInTheDocument();
        });

        it('should initialize with no user', async () => {
            const { result } = renderHook(() => useAuth(), {
                wrapper: AuthProvider,
            });

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.user).toBeNull();
        });
    });

    describe('useAuth hook', () => {
        it('should throw error when used outside AuthProvider', () => {
            // Suppress console.error for this test
            const originalError = console.error;
            console.error = vi.fn();

            expect(() => {
                renderHook(() => useAuth());
            }).toThrow('useAuth must be used within an AuthProvider');

            console.error = originalError;
        });

        it('should provide login function', async () => {
            const { result } = renderHook(() => useAuth(), {
                wrapper: AuthProvider,
            });

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(typeof result.current.login).toBe('function');
        });

        it('should provide logout function', async () => {
            const { result } = renderHook(() => useAuth(), {
                wrapper: AuthProvider,
            });

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(typeof result.current.logout).toBe('function');
        });

        it('should provide signup function', async () => {
            const { result } = renderHook(() => useAuth(), {
                wrapper: AuthProvider,
            });

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(typeof result.current.signup).toBe('function');
        });
    });

    describe('Authentication flow', () => {
        it('should login user successfully', async () => {
            const { result } = renderHook(() => useAuth(), {
                wrapper: AuthProvider,
            });

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            await act(async () => {
                await result.current.login('test@example.com', 'password123');
            });

            expect(result.current.user).not.toBeNull();
            expect(result.current.user?.email).toBe('test@example.com');
        });

        it('should signup user successfully', async () => {
            const { result } = renderHook(() => useAuth(), {
                wrapper: AuthProvider,
            });

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            await act(async () => {
                await result.current.signup('newuser@example.com', 'password123');
            });

            expect(result.current.user).not.toBeNull();
            expect(result.current.user?.email).toBe('newuser@example.com');
        });

        it('should logout user successfully', async () => {
            const { result } = renderHook(() => useAuth(), {
                wrapper: AuthProvider,
            });

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            // First login
            await act(async () => {
                await result.current.login('test@example.com', 'password123');
            });

            expect(result.current.user).not.toBeNull();

            // Then logout
            await act(async () => {
                await result.current.logout();
            });

            expect(result.current.user).toBeNull();
        });

        it('should persist user session in localStorage', async () => {
            const { result } = renderHook(() => useAuth(), {
                wrapper: AuthProvider,
            });

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            await act(async () => {
                await result.current.login('test@example.com', 'password123');
            });

            const storedUser = localStorage.getItem('gym_tracker_user');
            expect(storedUser).not.toBeNull();

            const parsedUser = JSON.parse(storedUser!);
            expect(parsedUser.email).toBe('test@example.com');
        });

        it('should restore user session from localStorage on mount', async () => {
            // Set up localStorage with a user
            const mockUser = {
                id: '123',
                email: 'stored@example.com',
            };
            localStorage.setItem('gym_tracker_user', JSON.stringify(mockUser));

            const { result } = renderHook(() => useAuth(), {
                wrapper: AuthProvider,
            });

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.user).not.toBeNull();
            expect(result.current.user?.email).toBe('stored@example.com');
        });

        it('should clear localStorage on logout', async () => {
            const { result } = renderHook(() => useAuth(), {
                wrapper: AuthProvider,
            });

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            await act(async () => {
                await result.current.login('test@example.com', 'password123');
            });

            expect(localStorage.getItem('gym_tracker_user')).not.toBeNull();

            await act(async () => {
                await result.current.logout();
            });

            expect(localStorage.getItem('gym_tracker_user')).toBeNull();
        });
    });
});
