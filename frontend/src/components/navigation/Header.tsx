import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { MobileMenu } from './MobileMenu';

export function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const isActive = (path: string) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    const navLinks = [
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/workouts', label: 'Workouts' },
        { path: '/exercises', label: 'Exercises' },
        { path: '/stats', label: 'Stats' },
    ];

    return (
        <>
            <header className="bg-white shadow-md sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo/App Name */}
                        <Link
                            to="/dashboard"
                            className="flex items-center gap-2 text-xl font-bold text-primary-600 hover:text-primary-700 transition-colors"
                        >
                            <span className="text-2xl">💪</span>
                            <span className="hidden sm:inline">Gym Tracker</span>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`font-medium transition-colors ${isActive(link.path)
                                            ? 'text-primary-600 border-b-2 border-primary-600'
                                            : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                        {/* User Actions */}
                        <div className="flex items-center gap-4">
                            {/* User Email (Desktop) */}
                            <span className="hidden lg:inline text-sm text-gray-600">
                                {user?.email}
                            </span>

                            {/* Logout Button (Desktop) */}
                            <button
                                onClick={handleLogout}
                                className="hidden md:block px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                            >
                                Logout
                            </button>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
                                aria-label="Open menu"
                            >
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Menu */}
            <MobileMenu
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                navLinks={navLinks}
                isActive={isActive}
                onLogout={handleLogout}
            />
        </>
    );
}
