import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    navLinks: Array<{ path: string; label: string }>;
    isActive: (path: string) => boolean;
    onLogout: () => void;
}

export function MobileMenu({ isOpen, onClose, navLinks, isActive, onLogout }: MobileMenuProps) {
    const { user } = useAuth();

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop with blur */}
            <div
                className="fixed inset-0 bg-base-950/80 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Menu Panel */}
            <div className="fixed inset-y-0 right-0 w-full max-w-sm glass-strong border-l-2 border-primary-300/20 z-50 md:hidden transform transition-transform duration-300 ease-out">
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex justify-between items-center p-6 border-b-2 border-gray-700/50">
                        <h2 className="text-2xl font-display font-black gradient-text-primary">MENU</h2>
                        <button
                            onClick={onClose}
                            className="p-2 text-primary-300 hover:text-primary-200 transition-colors hover:scale-110 transition-transform duration-250"
                            aria-label="Close menu"
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
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* User Info */}
                    <div className="p-6 border-b-2 border-gray-700/50 bg-gradient-to-r from-base-900/50 to-transparent">
                        <p className="text-xs font-display font-bold text-gray-500 uppercase tracking-wider mb-1">Signed in as</p>
                        <p className="font-body text-gray-200 truncate">{user?.email}</p>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex-1 overflow-y-auto p-6">
                        <div className="space-y-3">
                            {navLinks.map((link, index) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={onClose}
                                    className={`block px-5 py-4 rounded-xl font-display font-bold text-lg uppercase tracking-wide transition-all duration-250 ${isActive(link.path)
                                            ? 'glass border-2 border-primary-300/30 text-primary-300 neon-border-primary'
                                            : 'text-gray-400 hover:text-gray-200 hover:glass hover:border-2 hover:border-gray-600/30'
                                        }`}
                                    style={{
                                        animationDelay: `${index * 50}ms`
                                    }}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </nav>

                    {/* Logout Button */}
                    <div className="p-6 border-t-2 border-gray-700/50">
                        <button
                            onClick={() => {
                                onLogout();
                                onClose();
                            }}
                            className="w-full px-5 py-4 glass border-2 border-accent-300/30 text-accent-300 rounded-xl font-display font-bold text-lg uppercase tracking-wide hover-glow-accent transition-all duration-250"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
