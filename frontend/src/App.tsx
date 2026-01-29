import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Header } from './components/navigation/Header';
import { MobileNav } from './components/navigation/MobileNav';

// Page imports
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { Workouts } from './pages/Workouts';
import { NewWorkout } from './pages/NewWorkout';
import { WorkoutDetail } from './pages/WorkoutDetail';
import { Exercises } from './pages/Exercises';
import { Stats } from './pages/Stats';

/**
 * Root component that handles routing
 */
function App() {
    const { user, loading } = useAuth();

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center animated-gradient">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-primary-300/20 border-t-primary-300"></div>
                    <p className="mt-6 text-xl text-gray-400 font-body">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Show navigation only for authenticated users */}
            {user && (
                <>
                    <Header />
                    <MobileNav />
                </>
            )}

            {/* Main content area */}
            <main className={`${user ? 'pb-24 md:pb-8' : ''}`}>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />

                    {/* Root redirect */}
                    <Route
                        path="/"
                        element={
                            user ? (
                                <Navigate to="/dashboard" replace />
                            ) : (
                                <Navigate to="/login" replace />
                            )
                        }
                    />

                    {/* Protected Routes */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/workouts"
                        element={
                            <ProtectedRoute>
                                <Workouts />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/workouts/new"
                        element={
                            <ProtectedRoute>
                                <NewWorkout />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/workouts/:id"
                        element={
                            <ProtectedRoute>
                                <WorkoutDetail />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/exercises"
                        element={
                            <ProtectedRoute>
                                <Exercises />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/stats"
                        element={
                            <ProtectedRoute>
                                <Stats />
                            </ProtectedRoute>
                        }
                    />

                    {/* 404 - Redirect to home */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;
