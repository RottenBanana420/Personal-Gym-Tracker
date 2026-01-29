import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export function WorkoutDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const handleBack = () => {
        navigate('/workouts');
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this workout?')) {
            // TODO: Implement delete functionality
            navigate('/workouts');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <button
                        onClick={handleBack}
                        className="text-primary-600 hover:text-primary-700 mb-2 flex items-center gap-2"
                    >
                        ← Back to Workouts
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Workout Details
                    </h1>
                </div>
                <button
                    onClick={handleDelete}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                    Delete
                </button>
            </div>

            {/* Workout Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="mb-4">
                    <p className="text-sm text-gray-600">Workout ID</p>
                    <p className="text-lg font-semibold text-gray-900">{id}</p>
                </div>
                <div className="mb-4">
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="text-lg font-semibold text-gray-900">
                        {new Date().toLocaleDateString()}
                    </p>
                </div>
            </div>

            {/* Exercises and Sets */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Exercises
                </h2>
                <p className="text-gray-600 text-center py-8">
                    Workout details will be loaded from the API
                </p>
            </div>
        </div>
    );
}
