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
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                onClick={onClose}
            />

            {/* Menu Panel */}
            <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl z-50 md:hidden transform transition-transform duration-300 ease-in-out">
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex justify-between items-center p-6 border-b">
                        <h2 className="text-xl font-bold text-gray-900">Menu</h2>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                            aria-label="Close menu"
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
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* User Info */}
                    <div className="p-6 border-b bg-gray-50">
                        <p className="text-sm text-gray-600">Signed in as</p>
                        <p className="font-medium text-gray-900">{user?.email}</p>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex-1 overflow-y-auto p-6">
                        <div className="space-y-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={onClose}
                                    className={`block px-4 py-3 rounded-lg font-medium transition-colors ${isActive(link.path)
                                            ? 'bg-primary-50 text-primary-600'
                                            : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </nav>

                    {/* Logout Button */}
                    <div className="p-6 border-t">
                        <button
                            onClick={() => {
                                onLogout();
                                onClose();
                            }}
                            className="w-full px-4 py-3 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
