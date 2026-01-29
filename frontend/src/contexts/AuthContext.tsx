import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// User type definition
export interface User {
    id: string;
    email: string;
}

// Auth context type definition
interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage key for localStorage
const STORAGE_KEY = 'gym_tracker_user';

// AuthProvider props
interface AuthProviderProps {
    children: ReactNode;
}

/**
 * AuthProvider component that manages authentication state
 * This is a mock implementation for demonstration purposes
 * TODO: Replace with actual Supabase authentication
 */
export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Restore user session from localStorage on mount
    useEffect(() => {
        const restoreSession = async () => {
            try {
                const storedUser = localStorage.getItem(STORAGE_KEY);
                if (storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                }
            } catch (error) {
                console.error('Failed to restore session:', error);
                localStorage.removeItem(STORAGE_KEY);
            } finally {
                // Use microtask to ensure loading state is observable in tests
                await Promise.resolve();
                setLoading(false);
            }
        };

        restoreSession();
    }, []);

    /**
     * Mock login function
     * TODO: Replace with actual Supabase auth
     */
    const login = async (email: string, password: string): Promise<void> => {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Mock user creation
        const mockUser: User = {
            id: Math.random().toString(36).substring(7),
            email,
        };

        // Store in state and localStorage
        setUser(mockUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
    };

    /**
     * Mock signup function
     * TODO: Replace with actual Supabase auth
     */
    const signup = async (email: string, password: string): Promise<void> => {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Mock user creation
        const mockUser: User = {
            id: Math.random().toString(36).substring(7),
            email,
        };

        // Store in state and localStorage
        setUser(mockUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
    };

    /**
     * Logout function
     */
    const logout = async (): Promise<void> => {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Clear state and localStorage
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
    };

    const value: AuthContextType = {
        user,
        loading,
        login,
        signup,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to access auth context
 * Throws error if used outside AuthProvider
 */
export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}
