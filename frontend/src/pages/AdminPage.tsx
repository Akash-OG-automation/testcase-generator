/* eslint-disable @typescript-eslint/no-unused-vars */
// src/pages/AdminPage.tsx
import { useState } from 'react';
import api from '../api';

interface Props {
  apps: string[];
  setApps: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function AdminPage({ apps, setApps }: Props) {
  const [newAppName, setNewAppName] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [editingApp, setEditingApp] = useState<string | null>(null);
  const [editingPrompt, setEditingPrompt] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [appToDelete, setAppToDelete] = useState<string | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [loadingPrompt, setLoadingPrompt] = useState(false);

  const handleSavePrompt = async () => {
    if (!newAppName.trim() || !systemPrompt.trim()) {
      alert('Please enter both an application name and system prompt.');
      return;
    }

    try {
      await api.post('http://localhost:4000/api/admin/prompt', {
        appName: newAppName.trim(),
        systemPrompt: systemPrompt.trim(),
      });

      setSuccessMessage(`"${newAppName.trim()}" has been successfully added!`);
      setIsSuccessModalOpen(true);

      setApps([...apps, newAppName.trim()]);
      setNewAppName('');
      setSystemPrompt('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      alert('Error saving prompt: ' + message);
    }
  };

  const handleEdit = async (app: string) => {
    setEditingApp(app);
    setLoadingPrompt(true);
    setIsEditModalOpen(true);

    try {
      const res = await api.get(`http://localhost:4000/api/admin/prompt/${app}`);
      setEditingPrompt(res.data.systemPrompt || '');
    } catch (err) {
      alert('Could not load prompt. It may be empty.');
      setEditingPrompt('');
    } finally {
      setLoadingPrompt(false);
    }
  };

  const handleUpdatePrompt = async () => {
    if (!editingApp || !editingPrompt.trim()) {
      alert('Please enter a system prompt.');
      return;
    }

    try {
      await api.put('http://localhost:4000/api/admin/prompt', {
        appName: editingApp,
        systemPrompt: editingPrompt.trim(),
      });

      setSuccessMessage(`System prompt for "${editingApp}" has been updated successfully!`);
      setIsSuccessModalOpen(true);

      setIsEditModalOpen(false);
      setEditingApp(null);
      setEditingPrompt('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      alert('Error updating prompt: ' + message);
    }
  };

  const openDeleteModal = (app: string) => {
    setAppToDelete(app);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!appToDelete) return;

    try {
      await api.delete('http://localhost:4000/api/admin/prompt', { data: { appName: appToDelete } });

      setSuccessMessage(`"${appToDelete}" has been permanently deleted.`);
      setIsSuccessModalOpen(true);

      setApps(apps.filter((a) => a !== appToDelete));
      setIsDeleteModalOpen(false);
      setAppToDelete(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      alert('Error deleting app: ' + message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-12 xl:px-24">
      <div className="w-full">
        <h2 className="text-3xl font-bold text-gray-800 mb-10 text-center lg:text-left">
          Admin Panel: Manage Applications
        </h2>

        {/* Add New App Form */}
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
              rows={12}
              placeholder="Describe your application in detail: key features, user roles, workflows, compliance requirements, technology stack, etc. This helps the AI generate accurate, relevant, and high-quality test cases."
              className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500 resize-none font-mono text-sm leading-relaxed shadow-sm"
            />
          </div>

          <button
            onClick={handleSavePrompt}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-5 rounded-xl transition-all transform hover:scale-[1.01] active:scale-100 shadow-lg text-lg"
          >
            Save Prompt & Add Application
          </button>
        </div>

        {/* Existing Applications */}
        <div className="mt-16">
          <h3 className="text-3xl font-bold text-gray-800 mb-8 text-center lg:text-left">
            Existing Applications ({apps.length})
          </h3>

          <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12 w-full">
            {apps.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-600 text-2xl font-medium">No applications added yet</p>
                <p className="text-gray-500 text-lg mt-4">Start by adding your first one above!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {apps.map((app) => (
                  <div
                    key={app}
                    className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl px-8 py-6 text-center hover:shadow-xl hover:scale-105 transition-all duration-300 flex flex-col justify-between"
                  >
                    <span className="text-indigo-800 font-bold text-xl tracking-wide">{app}</span>
                    <div className="mt-6 flex justify-center space-x-3">
                      <button
                        onClick={() => handleEdit(app)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
                      >
                        Edit Prompt
                      </button>
                      <button
                        onClick={() => openDeleteModal(app)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Edit Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Edit System Prompt for <span className="text-blue-600">{editingApp}</span>
              </h3>
              {loadingPrompt ? (
                <p className="text-center text-gray-600 text-lg">Loading existing prompt...</p>
              ) : (
                <textarea
                  value={editingPrompt}
                  onChange={(e) => setEditingPrompt(e.target.value)}
                  rows={14}
                  className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500 resize-none font-mono text-sm leading-relaxed shadow-sm"
                  placeholder="Update the system prompt..."
                />
              )}
              <div className="mt-8 flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingApp(null);
                    setEditingPrompt('');
                  }}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium text-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePrompt}
                  disabled={loadingPrompt}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-xl font-medium transition"
                >
                  Update Prompt
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Warning Modal */}
        {isDeleteModalOpen && appToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center">
              <div className="mb-6">
                <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Delete Application?</h3>
              <p className="text-gray-600 mb-2">Are you sure you want to delete</p>
              <p className="text-lg font-semibold text-red-600 mb-8">"{appToDelete}"</p>
              <p className="text-sm text-gray-500 mb-8">
                This action cannot be undone. All associated prompts will be permanently removed.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setAppToDelete(null);
                  }}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium text-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition shadow-md"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Success Modal */}
        {isSuccessModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center">
              <div className="mb-8">
                <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Success!</h3>
              <p className="text-gray-700 text-lg leading-relaxed mb-8">{successMessage}</p>
              <button
                onClick={() => setIsSuccessModalOpen(false)}
                className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition transform hover:scale-105"
              >
                Great!
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}