// src/pages/GeneratorPage.tsx
import { useState } from 'react';
import axios from 'axios';

interface Props {
    apps: string[];
}

export default function GeneratorPage({ apps }: Props) {
    const [appName, setAppName] = useState<string>('');
    const [userStory, setUserStory] = useState<string>('');
    const [complexity, setComplexity] = useState<'low' | 'medium' | 'high'>('medium');
    const [outputFormat, setOutputFormat] = useState<'text' | 'excel' | 'pdf'>('text');
    const [result, setResult] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        if (!appName || !userStory.trim()) {
            alert('Please select an application and enter a user story.');
            return;
        }

        setLoading(true);
        setResult('');

        try {
            const res = await axios.post('http://localhost:4000/api/generate', {
                userStory,
                appName,
                complexity,
                outputFormat,
            });
            setResult(res.data.data);
        } catch (err: unknown) {  // ← Change 'any' to 'unknown'
            // Now, to safely access err.message or err.response:
            let errorMessage = 'An unknown error occurred.';

            if (err instanceof Error) {
                errorMessage = err.message;
            } else if (typeof err === 'string') {
                errorMessage = err;
            } else if (axios.isAxiosError(err)) {  // Special check for Axios errors
                errorMessage = err.response?.data?.error || err.message || 'Network error';
            }

            alert('Error: ' + errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Generate Test Cases</h2>

            <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Application</label>
                    <select
                        value={appName}
                        onChange={(e) => setAppName(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">-- Select an Application --</option>
                        {apps.map((app) => (
                            <option key={app} value={app}>{app}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">User Story / Change Request</label>
                    <textarea
                        value={userStory}
                        onChange={(e) => setUserStory(e.target.value)}
                        rows={8}
                        placeholder="As a user, I want to..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Model Complexity</label>
                        <select
                            value={complexity}
                            onChange={(e) => setComplexity(e.target.value as 'low' | 'medium' | 'high')}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                        >
                            <option value="low">Low (Fastest)</option>
                            <option value="medium">Medium (Balanced)</option>
                            <option value="high">High (Most Accurate)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Output Format</label>
                        <select
                            value={outputFormat}
                            onChange={(e) => setOutputFormat(e.target.value as 'text' | 'excel' | 'pdf')}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                        >
                            <option value="text">Plain Text</option>
                            <option value="excel">Excel (.xlsx)</option>
                            <option value="pdf">PDF</option>
                        </select>
                    </div>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white font-bold py-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                >
                    {loading ? 'Generating... (this may take 10-60s)' : 'Generate Test Cases'}
                </button>

                {result && (
                    <div className="mt-8">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Generated Test Cases</h3>
                        <pre className="bg-gray-100 p-6 rounded-lg overflow-x-auto text-sm whitespace-pre-wrap">
                            {result}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
}