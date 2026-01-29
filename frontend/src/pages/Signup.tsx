import React, { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setIsLoading(true);

        try {
            await signup(email, password);
            navigate('/dashboard', { replace: true });
        } catch (err) {
            setError('Failed to create account');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center animated-gradient px-4 py-8">
            <div className="max-w-md w-full">
                {/* Glassmorphic Signup Card */}
                <div className="glass-strong rounded-2xl shadow-2xl p-8 border-2 border-secondary-300/20">
                    {/* Header with Kinetic Typography */}
                    <div className="text-center mb-8">
                        {/* Logo/Brand */}
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <span className="text-5xl">💪</span>
                            <h1 className="text-4xl font-display font-black gradient-text-primary">
                                <span>GYM</span> <span>TRACKER</span>
                            </h1>
                        </div>

                        <h2 className="text-3xl font-display font-bold text-gray-50 mb-2 text-kinetic">
                            Create Account
                        </h2>
                        <p className="text-gray-400 font-body">
                            Start tracking your fitness journey today
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-accent-900/30 border-2 border-accent-400 rounded-lg neon-border-accent">
                            <p className="text-sm text-accent-200 font-medium">{error}</p>
                        </div>
                    )}

                    {/* Signup Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email Field */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-display font-semibold text-gray-200 mb-2 uppercase tracking-wide"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-base-800/50 border-2 border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 font-body focus:outline-none focus:border-secondary-300 focus:ring-2 focus:ring-secondary-300/50 transition-all duration-250"
                                placeholder="you@example.com"
                                disabled={isLoading}
                            />
                        </div>

                        {/* Password Field */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-display font-semibold text-gray-200 mb-2 uppercase tracking-wide"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-base-800/50 border-2 border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 font-body focus:outline-none focus:border-secondary-300 focus:ring-2 focus:ring-secondary-300/50 transition-all duration-250"
                                placeholder="••••••••"
                                disabled={isLoading}
                            />
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="block text-sm font-display font-semibold text-gray-200 mb-2 uppercase tracking-wide"
                            >
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-base-800/50 border-2 border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 font-body focus:outline-none focus:border-secondary-300 focus:ring-2 focus:ring-secondary-300/50 transition-all duration-250"
                                placeholder="••••••••"
                                disabled={isLoading}
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-secondary-400 to-secondary-500 text-base-950 py-4 px-6 rounded-lg font-display font-bold text-lg uppercase tracking-wide hover-glow-secondary focus:outline-none focus:ring-4 focus:ring-secondary-300/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-250 shadow-lg"
                        >
                            {isLoading ? 'Creating account...' : 'Sign Up'}
                        </button>
                    </form>

                    {/* Login Link */}
                    <p className="mt-8 text-center text-sm text-gray-400 font-body">
                        Already have an account?{' '}
                        <Link
                            to="/login"
                            className="font-display font-bold text-primary-300 hover:text-primary-200 transition-colors underline decoration-2 underline-offset-4"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>

                {/* Decorative Elements */}
                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-600 font-body">
                        Join thousands of athletes tracking their progress
                    </p>
                </div>
            </div>
        </div>
    );
}
