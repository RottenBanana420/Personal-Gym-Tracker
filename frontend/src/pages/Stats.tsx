import React from 'react';

export function Stats() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Statistics</h1>

            {/* Time Period Selector */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium">
                        4 Weeks
                    </button>
                    <button className="px-4 py-2 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                        12 Weeks
                    </button>
                    <button className="px-4 py-2 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                        6 Months
                    </button>
                    <button className="px-4 py-2 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                        All Time
                    </button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">
                        Total Workouts
                    </h3>
                    <p className="text-3xl font-bold text-primary-600">0</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">
                        Total Volume
                    </h3>
                    <p className="text-3xl font-bold text-primary-600">0 lbs</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">
                        Avg per Week
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

            {/* Charts Placeholder */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Progress Over Time
                </h2>
                <p className="text-gray-600 text-center py-12">
                    Charts will be displayed here using Recharts
                </p>
            </div>

            {/* Personal Records */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Personal Records
                </h2>
                <p className="text-gray-600 text-center py-12">
                    Your personal bests will appear here
                </p>
            </div>
        </div>
    );
}
