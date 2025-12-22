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
    if (!newAppName || !systemPrompt.trim()) {
      alert('Please enter an application name and system prompt.');
      return;
    }

    try {
      await axios.post('http://localhost:4000/api/admin/prompt', {
        appName: newAppName,
        systemPrompt,
      });
      alert('Prompt saved successfully!');
      setApps([...apps, newAppName]); // Update app list
      setNewAppName('');
      setSystemPrompt('');
    } catch (err: unknown) {
      alert('Error saving prompt: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">Admin Panel: Manage Applications</h2>

      <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Application Name</label>
          <input
            type="text"
            value={newAppName}
            onChange={(e) => setNewAppName(e.target.value)}
            placeholder="e.g., BankingApp"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">System Prompt</label>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            rows={10}
            placeholder="Describe your application: features, rules, compliance, etc. This helps the AI generate accurate test cases."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        <button
          onClick={handleSavePrompt}
          className="w-full bg-green-600 text-white font-bold py-4 rounded-lg hover:bg-green-700 transition"
        >
          Save Prompt & Add Application
        </button>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Existing Applications</h3>
        <ul className="list-disc pl-6 space-y-2">
          {apps.length === 0 ? (
            <p className="text-gray-500">No applications yet. Add one above!</p>
          ) : (
            apps.map((app) => (
              <li key={app} className="text-blue-600">{app}</li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}