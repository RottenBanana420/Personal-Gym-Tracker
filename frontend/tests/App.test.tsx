import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('App Component', () => {
    it('should render the main heading', () => {
        render(<App />);
        const heading = screen.getByText('Personal Gym Tracker');
        expect(heading).toBeInTheDocument();
    });

    it('should render the welcome section', () => {
        render(<App />);
        const welcomeText = screen.getByText(/Welcome to Your Fitness Dashboard/i);
        expect(welcomeText).toBeInTheDocument();
    });

    it('should display technology stack information', () => {
        render(<App />);
        expect(screen.getByText(/React 19/i)).toBeInTheDocument();
        expect(screen.getByText(/TailwindCSS v4/i)).toBeInTheDocument();
        expect(screen.getByText(/Recharts/i)).toBeInTheDocument();
        expect(screen.getByText(/Supabase/i)).toBeInTheDocument();
        expect(screen.getByText(/Vitest/i)).toBeInTheDocument();
    });

    it('should render the example chart component', () => {
        render(<App />);
        const chartHeading = screen.getByText('Weekly Progress');
        expect(chartHeading).toBeInTheDocument();
    });

    it('should display quick start information', () => {
        render(<App />);
        expect(screen.getByText(/http:\/\/localhost:3000/i)).toBeInTheDocument();
        expect(screen.getByText(/http:\/\/localhost:5173/i)).toBeInTheDocument();
    });
});
