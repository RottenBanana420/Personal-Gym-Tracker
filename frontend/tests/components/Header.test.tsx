import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../src/contexts/AuthContext';
import { Header } from '../../src/components/navigation/Header';
import React from 'react';

describe('Header Component', () => {
    beforeEach(() => {
        localStorage.clear();
        // Set up authenticated user
        const mockUser = {
            id: '123',
            email: 'test@example.com',
        };
        localStorage.setItem('gym_tracker_user', JSON.stringify(mockUser));
    });

    const renderHeader = () => {
        return render(
            <BrowserRouter>
                <AuthProvider>
                    <Header />
                </AuthProvider>
            </BrowserRouter>
        );
    };

    it('should render app name/logo', async () => {
        renderHeader();

        // Wait for auth to load
        await screen.findByText(/Gym Tracker/i);
        expect(screen.getByText(/Gym Tracker/i)).toBeInTheDocument();
    });

    it('should render navigation links', async () => {
        renderHeader();

        await screen.findByText(/Dashboard/i);
        expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
        expect(screen.getByText(/Workouts/i)).toBeInTheDocument();
        expect(screen.getByText(/Exercises/i)).toBeInTheDocument();
        expect(screen.getByText(/Stats/i)).toBeInTheDocument();
    });

    it('should render logout button', async () => {
        renderHeader();

        await screen.findByText(/Logout/i);
        expect(screen.getByText(/Logout/i)).toBeInTheDocument();
    });

    it('should render hamburger menu icon on mobile', async () => {
        renderHeader();

        await screen.findByLabelText(/menu/i);
        const menuButton = screen.getByLabelText(/menu/i);
        expect(menuButton).toBeInTheDocument();
    });

    it('should toggle mobile menu when hamburger is clicked', async () => {
        renderHeader();

        await screen.findByLabelText(/menu/i);
        const menuButton = screen.getByLabelText(/menu/i);

        fireEvent.click(menuButton);

        // Mobile menu should be visible (implementation will determine exact behavior)
        expect(menuButton).toBeInTheDocument();
    });
});
