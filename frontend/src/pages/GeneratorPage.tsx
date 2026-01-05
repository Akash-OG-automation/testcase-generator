/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/GeneratorPage.tsx
import { useState } from 'react';
import api from '../api';  // ← Uses our authenticated API instance
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
  const [isCopySuccessModalOpen, setIsCopySuccessModalOpen] = useState(false);

  // Validation modal
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');

  const handleGenerate = async () => {
    if (!appName) {
      setValidationMessage('Please select an application from the dropdown.');
      setIsValidationModalOpen(true);
      return;
    }

    if (!userStory.trim()) {
      setValidationMessage('Please enter a user story or change request.');
      setIsValidationModalOpen(true);
      return;
    }

    setLoading(true);
    setResult('');

    try {
      const res = await api.post('/api/generate', {
        userStory: userStory.trim(),
        appName,
        complexity,
        outputFormat,
      });

      setResult(res.data.data);
    } catch (err: any) {
      let errorMessage = 'An unknown error occurred.';

      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setValidationMessage(`Generation failed: ${errorMessage}`);
      setIsValidationModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-12 xl:px-24">
      <div className="w-full">
        <h2 className="text-3xl font-bold text-gray-800 mb-10 text-center lg:text-left">
          Generate Test Cases
        </h2>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12 space-y-10 w-full">
          {/* Application Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Application
            </label>
            <select
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-transparent transition shadow-sm text-base"
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
              className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-transparent resize-none font-sans text-base leading-relaxed shadow-sm"
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
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-5 rounded-xl transition-all transform hover:scale-[1.01] active:scale-100 shadow-lg text-lg"
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
                  onClick={() => {
                    navigator.clipboard.writeText(result);
                    // Trigger success modal
                    setIsCopySuccessModalOpen(true);
                  }}
                  className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-xl transition-all transform hover:scale-110 text-lg relative overflow-hidden"
                >
                  <span className="relative z-10">📋 Copy to Clipboard</span>
                  {/* Optional: add a flash effect on click */}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Validation Modal */}
      {isValidationModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center">
            <div className="mb-8">
              <div className="mx-auto w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-16 h-16 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Missing Information</h3>
            <p className="text-gray-700 text-lg leading-relaxed mb-8">
              {validationMessage}
            </p>
            <button
              onClick={() => setIsValidationModalOpen(false)}
              className="px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-lg transition transform hover:scale-105"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Copy Success Modal */}
      {isCopySuccessModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center">
            <div className="mb-8">
              <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Copied!</h3>
            <p className="text-gray-700 text-lg mb-8">
              Test cases have been copied to your clipboard.
            </p>
            <button
              onClick={() => setIsCopySuccessModalOpen(false)}
              className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition transform hover:scale-105"
            >
              Great!
            </button>
          </div>
        </div>
      )}

    </div>
  );
}