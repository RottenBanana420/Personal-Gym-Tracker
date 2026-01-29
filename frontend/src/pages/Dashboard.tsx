import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Dashboard() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-gradient-to-br from-base-950 via-base-900 to-base-850 px-4 py-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Welcome Section */}
                <div className="glass rounded-2xl p-8 border-2 border-primary-300/10 hover-glow-primary">
                    <h1 className="text-5xl font-display font-black mb-3 text-kinetic">
                        <span className="gradient-text-primary">
                            Welcome back, {user?.email?.split('@')[0]}!
                        </span>
                    </h1>
                    <p className="text-xl text-gray-400 font-body">
                        Here's your fitness overview for today
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Total Workouts */}
                    <div className="glass rounded-xl p-6 border-2 border-primary-300/20 hover-scale hover-glow-primary">
                        <h3 className="text-sm font-display font-bold text-primary-300 mb-3 uppercase tracking-wider">
                            Total Workouts
                        </h3>
                        <p className="text-6xl font-display font-black gradient-text-primary mb-2">
                            0
                        </p>
                        <div className="h-1 w-20 bg-gradient-to-r from-primary-300 to-transparent rounded-full"></div>
                    </div>

                    {/* This Week */}
                    <div className="glass rounded-xl p-6 border-2 border-secondary-300/20 hover-scale hover-glow-secondary">
                        <h3 className="text-sm font-display font-bold text-secondary-300 mb-3 uppercase tracking-wider">
                            This Week
                        </h3>
                        <p className="text-6xl font-display font-black gradient-text-primary mb-2">
                            0
                        </p>
                        <div className="h-1 w-20 bg-gradient-to-r from-secondary-300 to-transparent rounded-full"></div>
                    </div>

                    {/* Current Streak */}
                    <div className="glass rounded-xl p-6 border-2 border-accent-300/20 hover-scale hover-glow-accent">
                        <h3 className="text-sm font-display font-bold text-accent-300 mb-3 uppercase tracking-wider">
                            Current Streak
                        </h3>
                        <p className="text-6xl font-display font-black gradient-text-accent mb-2">
                            0
                        </p>
                        <p className="text-lg text-gray-400 font-body">days</p>
                        <div className="h-1 w-20 bg-gradient-to-r from-accent-300 to-transparent rounded-full"></div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="glass rounded-2xl p-8 border-2 border-gray-700/50">
                    <h2 className="text-3xl font-display font-bold text-gray-50 mb-6 text-kinetic">
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link
                            to="/workouts/new"
                            className="group relative overflow-hidden flex items-center justify-center px-8 py-6 bg-gradient-to-r from-primary-400 to-primary-500 text-base-950 rounded-xl font-display font-bold text-xl uppercase tracking-wide hover-glow-primary transition-all duration-250 shadow-lg"
                        >
                            <span className="relative z-10">🏋️ Start New Workout</span>
                        </Link>
                        <Link
                            to="/exercises"
                            className="group relative overflow-hidden flex items-center justify-center px-8 py-6 glass border-2 border-secondary-300/30 text-secondary-300 rounded-xl font-display font-bold text-xl uppercase tracking-wide hover-glow-secondary transition-all duration-250"
                        >
                            <span className="relative z-10">💪 Manage Exercises</span>
                        </Link>
                    </div>
                </div>

                {/* Recent Activity Placeholder */}
                <div className="glass rounded-2xl p-8 border-2 border-gray-700/50">
                    <h2 className="text-3xl font-display font-bold text-gray-50 mb-6 text-kinetic">
                        Recent Activity
                    </h2>
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📊</div>
                        <p className="text-xl text-gray-400 font-body mb-2">
                            No recent workouts
                        </p>
                        <p className="text-gray-500 font-body">
                            Start your first workout to see your activity here!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
