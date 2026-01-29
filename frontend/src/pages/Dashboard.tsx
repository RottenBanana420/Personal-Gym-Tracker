import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Dashboard() {
    const { user } = useAuth();

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Welcome back, {user?.email?.split('@')[0]}!
                </h1>
                <p className="text-gray-600">
                    Here's your fitness overview for today
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">
                        Total Workouts
                    </h3>
                    <p className="text-3xl font-bold text-primary-600">0</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">
                        This Week
                    </h3>
                    <p className="text-3xl font-bold text-primary-600">0</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">
                        Current Streak
                    </h3>
                    <p className="text-3xl font-bold text-primary-600">0 days</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Quick Actions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link
                        to="/workouts/new"
                        className="flex items-center justify-center px-6 py-4 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                    >
                        Start New Workout
                    </Link>
                    <Link
                        to="/exercises"
                        className="flex items-center justify-center px-6 py-4 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                        Manage Exercises
                    </Link>
                </div>
            </div>

            {/* Recent Activity Placeholder */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Recent Activity
                </h2>
                <p className="text-gray-600 text-center py-8">
                    No recent workouts. Start your first workout to see your activity here!
                </p>
            </div>
        </div>
    );
}
