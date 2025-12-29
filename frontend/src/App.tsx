// src/App.tsx
import { useContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { AuthProvider } from './AuthContext';
import LoginPage from './pages/LoginPage';
import GeneratorPage from './pages/GeneratorPage';
import AdminPage from './pages/AdminPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useContext(AuthContext);
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

function AppContent() {
  const { token, logout } = useContext(AuthContext);
  const [apps, setApps] = useState<string[]>([]);

  // State for logout confirmation modal
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Fetch user's apps when logged in
  useEffect(() => {
    if (!token) {
      setApps([]);
      return;
    }

    const fetchApps = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/apps', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed to fetch apps');
        const data = await res.json();
        setApps(data);
      } catch (err) {
        console.error('Error fetching apps:', err);
        setApps([]);
      }
    };

    fetchApps();
  }, [token]);

  const handleLogout = () => {
    logout();
    setIsLogoutModalOpen(false);
  };

  const openLogoutModal = () => {
    setIsLogoutModalOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md sticky top-0 z-10 border-b border-gray-200">
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 tracking-tight">
              TestCase Generator
            </h1>

            {token ? (
              <div className="flex items-center space-x-6 sm:space-x-10">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `font-semibold text-base sm:text-lg pb-1 border-b-2 transition-colors ${isActive
                      ? 'text-blue-600 border-blue-600'
                      : 'text-gray-700 border-transparent hover:text-blue-600 hover:border-blue-400'
                    }`
                  }
                >
                  Generator
                </NavLink>
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `font-semibold text-base sm:text-lg pb-1 border-b-2 transition-colors ${isActive
                      ? 'text-blue-600 border-blue-600'
                      : 'text-gray-700 border-transparent hover:text-blue-600 hover:border-blue-400'
                    }`
                  }
                >
                  Admin Panel
                </NavLink>
                <button
                  onClick={openLogoutModal}
                  className="text-red-600 hover:text-red-700 font-medium text-base sm:text-lg transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="text-gray-600 text-sm sm:text-base">
                Please log in to continue
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-12 xl:px-20 py-8">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <GeneratorPage apps={apps} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPage apps={apps} setApps={setApps} />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to={token ? '/' : '/login'} replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-5">
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 text-center text-sm text-gray-500">
          © 2025 TestCase Generator • Built with ❤️ for better QA
        </div>
      </footer>

      {/* Custom Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center">
            <div className="mb-8">
              <div className="mx-auto w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-16 h-16 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Log out?</h3>
            <p className="text-gray-700 text-lg leading-relaxed mb-8">
              Are you sure you want to log out of your account?
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl shadow-md transition"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg transition transform hover:scale-105"
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}