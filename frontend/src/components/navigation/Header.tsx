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
            <header className="glass-strong sticky top-0 z-40 border-b-2 border-primary-300/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo/App Name */}
                        <Link
                            to="/dashboard"
                            className="flex items-center gap-3 group transition-all duration-250"
                            data-testid="header-branding"
                        >
                            <span className="text-4xl group-hover:scale-110 transition-transform duration-250">💪</span>
                            <div className="flex flex-col">
                                <span className="text-2xl font-display font-black gradient-text-primary hidden sm:inline">
                                    GYM TRACKER
                                </span>
                                <span className="text-xs text-gray-500 font-body hidden lg:inline">
                                    Power Athletics
                                </span>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`relative font-display font-bold text-sm uppercase tracking-wide transition-all duration-250 ${isActive(link.path)
                                        ? 'text-primary-300'
                                        : 'text-gray-400 hover:text-gray-200'
                                        }`}
                                >
                                    {link.label}
                                    {isActive(link.path) && (
                                        <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-300 to-secondary-300 rounded-full shadow-[0_0_8px_rgba(192,255,0,0.6)]"></span>
                                    )}
                                </Link>
                            ))}
                        </nav>

                        {/* User Actions */}
                        <div className="flex items-center gap-4">
                            {/* User Email (Desktop) */}
                            <div className="hidden lg:flex flex-col items-end">
                                <span className="text-sm text-gray-400 font-body">
                                    {user?.email}
                                </span>
                            </div>

                            {/* Logout Button (Desktop) */}
                            <button
                                onClick={handleLogout}
                                className="hidden md:block px-5 py-2.5 glass border-2 border-accent-300/30 text-accent-300 rounded-lg font-display font-bold text-sm uppercase tracking-wide hover-glow-accent transition-all duration-250"
                            >
                                Logout
                            </button>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="md:hidden p-2 text-primary-300 hover:text-primary-200 transition-colors"
                                aria-label="Open menu"
                            >
                                <svg
                                    className="w-7 h-7"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2.5}
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
