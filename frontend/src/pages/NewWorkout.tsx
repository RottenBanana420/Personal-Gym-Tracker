import React from 'react';
import { useNavigate } from 'react-router-dom';

export function NewWorkout() {
    const navigate = useNavigate();

    const handleCancel = () => {
        navigate('/workouts');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">New Workout</h1>
                <button
                    onClick={handleCancel}
                    className="px-6 py-3 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                    Cancel
                </button>
            </div>

            {/* Workout Form Placeholder */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <form className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Workout Date
                        </label>
                        <input
                            type="date"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notes (Optional)
                        </label>
                        <textarea
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="How did you feel during this workout?"
                        />
                    </div>

                    <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Exercises
                        </h3>
                        <p className="text-gray-600 text-center py-8">
                            Exercise selection and set tracking will be implemented here
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                        >
                            Save Workout
                        </button>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-6 py-3 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
