/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/LoginPage.tsx
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isRegister ? '/api/register' : '/api/login';
      const response = await axios.post(`http://localhost:4000${endpoint}`, {
        username: username.trim(),
        password,
      });

      if (isRegister) {
        setError('');
        alert('Registration successful! You can now log in.');
        setIsRegister(false);
        setPassword('');
      } else {
        login(response.data.token);
        navigate('/'); // Redirect to Generator page after login
      }
    } catch (err: any) {
      const message =
        err.response?.data?.error ||
        (isRegister ? 'Registration failed' : 'Invalid username or password');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-10 bg-white p-10 rounded-2xl shadow-2xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-700 mb-2">TestCase Generator</h1>
          <h2 className="text-2xl font-semibold text-gray-800">
            {isRegister ? 'Create Your Account' : 'Welcome Back'}
          </h2>
          <p className="mt-2 text-gray-600">
            {isRegister ? 'Register to start generating test cases' : 'Log in to access your applications'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-transparent transition shadow-sm text-base"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-transparent transition shadow-sm text-base"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-5 rounded-xl transition-all transform hover:scale-[1.01] shadow-lg text-lg"
          >
            {loading ? 'Processing...' : isRegister ? 'Register' : 'Login'}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="ml-2 text-blue-600 hover:text-blue-700 font-medium underline"
            >
              {isRegister ? 'Log in' : 'Register now'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}