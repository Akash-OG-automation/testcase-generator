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

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navigation */}
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
                  onClick={logout}
                  className="text-gray-700 hover:text-red-600 font-medium text-base sm:text-lg transition"
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