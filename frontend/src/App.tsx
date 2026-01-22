import { ExampleChart } from './components/ExampleChart';

function App() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <header className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Personal Gym Tracker
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Track your fitness journey with precision
                    </p>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid gap-6">
                    <section className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                            Welcome to Your Fitness Dashboard
                        </h2>
                        <p className="text-gray-600 mb-4">
                            This is a modern, isolated development environment built with:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                            <li>React 19 - Latest React features</li>
                            <li>TailwindCSS v4 - CSS-first configuration</li>
                            <li>Recharts - Beautiful data visualization</li>
                            <li>Supabase - Backend as a Service</li>
                            <li>Vitest - Fast, parallel testing</li>
                            <li>TypeScript - Strict type safety</li>
                        </ul>
                    </section>

                    <section>
                        <ExampleChart />
                    </section>

                    <section className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                            Quick Start
                        </h2>
                        <div className="space-y-3 text-gray-700">
                            <p>
                                <strong>Backend:</strong> Running on{' '}
                                <code className="bg-gray-100 px-2 py-1 rounded">
                                    http://localhost:3000
                                </code>
                            </p>
                            <p>
                                <strong>Frontend:</strong> Running on{' '}
                                <code className="bg-gray-100 px-2 py-1 rounded">
                                    http://localhost:5173
                                </code>
                            </p>
                            <p>
                                <strong>Tests:</strong> Run{' '}
                                <code className="bg-gray-100 px-2 py-1 rounded">
                                    bun test
                                </code>{' '}
                                in either directory
                            </p>
                        </div>
                    </section>
                </div>
            </main>

            <footer className="mt-12 bg-white border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <p className="text-center text-gray-600">
                        Built with modern best practices and industry standards
                    </p>
                </div>
            </footer>
        </div>
    );
}

export default App;
