// src/App.tsx
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import GeneratorPage from './pages/GeneratorPage';
import AdminPage from './pages/AdminPage';

function App() {
  const [apps, setApps] = useState<string[]>([]);

  useEffect(() => {
    fetch('http://localhost:4000/api/apps')
      .then((res) => res.json())
      .then((data) => setApps(data))
      .catch((err) => {
        console.error('Failed to fetch apps:', err);
        setApps([]);
      });
  }, []);

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50">
        {/* Navigation - Full Width */}
        <nav className="bg-white shadow-md sticky top-0 z-10">
          <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-2xl sm:text-3xl font-bold text-blue-700">
                TestCase Generator
              </h1>
              <div className="flex items-center space-x-6 sm:space-x-10">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `font-semibold text-base sm:text-lg pb-1 border-b-2 transition-colors ${
                      isActive
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
                    `font-semibold text-base sm:text-lg pb-1 border-b-2 transition-colors ${
                      isActive
                        ? 'text-blue-600 border-blue-600'
                        : 'text-gray-700 border-transparent hover:text-blue-600 hover:border-blue-400'
                    }`
                  }
                >
                  Admin Panel
                </NavLink>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content - Full Width with Responsive Padding */}
        <main className="flex-1 w-full px-4 sm:px-6 lg:px-12 xl:px-20 py-8">
          <Routes>
            <Route path="/" element={<GeneratorPage apps={apps} />} />
            <Route path="/admin" element={<AdminPage apps={apps} setApps={setApps} />} />
          </Routes>
        </main>

        {/* Footer - Full Width */}
        <footer className="bg-white border-t border-gray-200 py-4">
          <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 text-center text-sm text-gray-500">
            © 2025 TestCase Generator • Built with ❤️ for better testing
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;