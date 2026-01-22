import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

const sampleData = [
    { name: 'Mon', weight: 180, reps: 12 },
    { name: 'Tue', weight: 185, reps: 10 },
    { name: 'Wed', weight: 190, reps: 11 },
    { name: 'Thu', weight: 195, reps: 9 },
    { name: 'Fri', weight: 200, reps: 10 },
    { name: 'Sat', weight: 205, reps: 8 },
    { name: 'Sun', weight: 210, reps: 9 },
];

export function ExampleChart() {
    return (
        <div className="w-full h-96 p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
                Weekly Progress
            </h2>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={sampleData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="weight"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                    />
                    <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="reps"
                        stroke="#10b981"
                        strokeWidth={2}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
