// src/pages/GeneratorPage.tsx
import { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
                userStory: userStory.trim(),
                appName,
                complexity,
                outputFormat,
            });
            setResult(res.data.data);
        } catch (err: unknown) {
            let errorMessage = 'An unknown error occurred.';

            if (err instanceof Error) {
                errorMessage = err.message;
            } else if (axios.isAxiosError(err)) {
                errorMessage = err.response?.data?.error || err.message || 'Network error';
            }

            alert('Error: ' + errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            <h2 className="text-3xl font-bold text-gray-800 mb-10 text-center lg:text-left">
                Generate Test Cases  {/* or "Admin Panel: Manage Applications" */}
            </h2>

            <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12 space-y-10 w-full">
                {/* Application Selector */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Application
                    </label>
                    <select
                        value={appName}
                        onChange={(e) => setAppName(e.target.value)}
                        className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-transparent transition text-base"
                    >
                        <option value="">-- Select an Application --</option>
                        {apps.map((app) => (
                            <option key={app} value={app}>
                                {app}
                            </option>
                        ))}
                    </select>
                </div>

                {/* User Story Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        User Story / Change Request
                    </label>
                    <textarea
                        value={userStory}
                        onChange={(e) => setUserStory(e.target.value)}
                        rows={8}
                        placeholder="As a user, I want to..."
                        className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-transparent resize-none font-sans text-base leading-relaxed"
                    />
                </div>

                {/* Complexity & Format */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Model Complexity
                        </label>
                        <select
                            value={complexity}
                            onChange={(e) => setComplexity(e.target.value as 'low' | 'medium' | 'high')}
                            className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500 text-base"
                        >
                            <option value="low">Low (Fastest)</option>
                            <option value="medium">Medium (Balanced)</option>
                            <option value="high">High (Most Accurate)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Output Format
                        </label>
                        <select
                            value={outputFormat}
                            onChange={(e) => setOutputFormat(e.target.value as 'text' | 'excel' | 'pdf')}
                            className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500 text-base"
                        >
                            <option value="text">Plain Text</option>
                            <option value="excel">Excel (.xlsx)</option>
                            <option value="pdf">PDF</option>
                        </select>
                    </div>
                </div>

                {/* Generate Button */}
                <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-bold py-5 rounded-xl transition-all transform hover:scale-[1.01] active:scale-100 shadow-lg text-lg"
                >
                    {loading ? 'Generating Test Cases...' : 'Generate Test Cases'}
                </button>

                {/* Loading Spinner */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="relative">
                            <div className="w-32 h-32 border-8 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
                            <div className="absolute inset-0 w-32 h-32 border-8 border-transparent border-t-cyan-400 rounded-full animate-spin" style={{ animationDelay: '-0.75s' }}></div>
                        </div>
                        <p className="mt-12 text-3xl font-semibold text-gray-700">
                            Generating detailed test cases...
                        </p>
                        <p className="mt-4 text-xl text-gray-500">
                            This may take 30–90 seconds
                        </p>
                    </div>
                )}

                {/* Generated Result */}
                {result && (
                    <div className="mt-16">
                        <h3 className="text-3xl font-bold text-gray-800 mb-8 text-center lg:text-left">
                            Generated Test Cases
                        </h3>
                        <div className="bg-gradient-to-b from-gray-50 to-white border-2 border-gray-200 rounded-2xl shadow-2xl p-8 lg:p-12 prose prose-xl max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {result}
                            </ReactMarkdown>
                        </div>

                        <div className="mt-10 flex justify-center">
                            <button
                                onClick={() => navigator.clipboard.writeText(result)}
                                className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-xl transition-all transform hover:scale-110 text-lg"
                            >
                                📋 Copy to Clipboard
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}