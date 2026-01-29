import React, { useState, FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Get the intended destination from location state, or default to /dashboard
    const from = (location.state as any)?.from?.pathname || '/dashboard';

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(email, password);
            // Redirect to intended destination after successful login
            navigate(from, { replace: true });
        } catch (err) {
            setError('Invalid email or password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center animated-gradient px-4 py-8">
            <div className="max-w-md w-full">
                {/* Glassmorphic Login Card */}
                <div className="glass-strong rounded-2xl shadow-2xl p-8 border-2 border-primary-300/20">
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
                            Welcome Back
                        </h2>
                        <p className="text-gray-400 font-body">
                            Sign in to continue your fitness journey
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-accent-900/30 border-2 border-accent-400 rounded-lg neon-border-accent">
                            <p className="text-sm text-accent-200 font-medium">{error}</p>
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
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
                                name="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-base-800/50 border-2 border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 font-body focus:outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-300/50 transition-all duration-250"
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
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-base-800/50 border-2 border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 font-body focus:outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-300/50 transition-all duration-250"
                                placeholder="••••••••"
                                disabled={isLoading}
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-primary-400 to-primary-500 text-base-950 py-4 px-6 rounded-lg font-display font-bold text-lg uppercase tracking-wide hover-glow-primary focus:outline-none focus:ring-4 focus:ring-primary-300/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-250 shadow-lg"
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    {/* Signup Link */}
                    <p className="mt-8 text-center text-sm text-gray-400 font-body">
                        Don't have an account?{' '}
                        <Link
                            to="/signup"
                            className="font-display font-bold text-secondary-300 hover:text-secondary-200 transition-colors underline decoration-2 underline-offset-4"
                        >
                            Sign up
                        </Link>
                    </p>
                </div>

                {/* Decorative Elements */}
                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-600 font-body">
                        Powered by cutting-edge fitness technology
                    </p>
                </div>
            </div>
        </div>
    );
}
