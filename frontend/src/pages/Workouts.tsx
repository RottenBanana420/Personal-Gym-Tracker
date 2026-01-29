import React from 'react';
import { Link } from 'react-router-dom';

export function Workouts() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Workouts</h1>
                <Link
                    to="/workouts/new"
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                >
                    New Workout
                </Link>
            </div>

            {/* Filters Placeholder */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                        type="date"
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Start Date"
                    />
                    <input
                        type="date"
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="End Date"
                    />
                    <button className="px-4 py-2 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                        Apply Filters
                    </button>
                </div>
            </div>

            {/* Workouts List Placeholder */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-600 text-center py-12">
                    No workouts yet. Click "New Workout" to get started!
                </p>
            </div>
        </div>
    );
}
