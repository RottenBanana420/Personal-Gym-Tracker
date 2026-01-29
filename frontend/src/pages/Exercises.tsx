import React from 'react';

export function Exercises() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Exercises</h1>
                <button className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors">
                    Add Exercise
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                        <option value="">All Muscle Groups</option>
                        <option value="chest">Chest</option>
                        <option value="back">Back</option>
                        <option value="legs">Legs</option>
                        <option value="shoulders">Shoulders</option>
                        <option value="arms">Arms</option>
                        <option value="core">Core</option>
                    </select>
                    <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                        <option value="">All Equipment</option>
                        <option value="barbell">Barbell</option>
                        <option value="dumbbell">Dumbbell</option>
                        <option value="machine">Machine</option>
                        <option value="bodyweight">Bodyweight</option>
                        <option value="cable">Cable</option>
                    </select>
                    <button className="px-4 py-2 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                        Apply Filters
                    </button>
                </div>
            </div>

            {/* Exercises List */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-600 text-center py-12">
                    No exercises yet. Click "Add Exercise" to create your first exercise!
                </p>
            </div>
        </div>
    );
}
