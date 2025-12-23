// src/pages/AdminPage.tsx
import { useState } from 'react';
import axios from 'axios';

interface Props {
  apps: string[];
  setApps: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function AdminPage({ apps, setApps }: Props) {
  const [newAppName, setNewAppName] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');

  const handleSavePrompt = async () => {
    if (!newAppName.trim() || !systemPrompt.trim()) {
      alert('Please enter both an application name and system prompt.');
      return;
    }

    try {
      await axios.post('http://localhost:4000/api/admin/prompt', {
        appName: newAppName.trim(),
        systemPrompt: systemPrompt.trim(),
      });
      alert('Prompt saved successfully!');
      setApps([...apps, newAppName.trim()]);
      setNewAppName('');
      setSystemPrompt('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      alert('Error saving prompt: ' + message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-12 xl:px-24">
      {/* Full-width container */}
      <div className="w-full">
        <h2 className="text-3xl font-bold text-gray-800 mb-10 text-center lg:text-left">
          Admin Panel: Manage Applications
        </h2>

        {/* Form Card - Full width */}
        <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12 space-y-10 w-full">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Application Name
            </label>
            <input
              type="text"
              value={newAppName}
              onChange={(e) => setNewAppName(e.target.value)}
              placeholder="e.g., BankingApp, ECommerceApp, CRMApp"
              className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-transparent transition shadow-sm text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              System Prompt
            </label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={14}
              placeholder="Describe your application in detail: key features, user roles, workflows, compliance requirements, technology stack, etc. This helps the AI generate accurate, relevant, and high-quality test cases."
              className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm leading-relaxed shadow-sm"
            />
          </div>

          <button
            onClick={handleSavePrompt}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-5 rounded-xl transition-all transform hover:scale-[1.01] active:scale-100 shadow-lg text-lg"
          >
            Save Prompt & Add Application
          </button>
        </div>

        {/* Existing Applications Section */}
        <div className="mt-16">
          <h3 className="text-3xl font-bold text-gray-800 mb-8 text-center lg:text-left">
            Existing Applications ({apps.length})
          </h3>

          <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12 w-full">
            {apps.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-600 text-2xl font-medium">
                  No applications added yet
                </p>
                <p className="text-gray-500 text-lg mt-4">
                  Start by adding your first application using the form above!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {apps.map((app) => (
                  <div
                    key={app}
                    className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl px-8 py-6 text-center hover:shadow-xl hover:scale-105 transition-all duration-300"
                  >
                    <span className="text-indigo-800 font-bold text-xl tracking-wide">
                      {app}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}