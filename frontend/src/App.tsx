// src/App.tsx
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import GeneratorPage from './pages/GeneratorPage';
import AdminPage from './pages/AdminPage';

function App() {
  const [apps, setApps] = useState<string[]>([]);

  useEffect(() => {
    // Fetch available apps on load
    fetch('http://localhost:4000/api/apps')
      .then(res => res.json())
      .then(data => setApps(data))
      .catch(() => setApps([]));
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation Bar */}
        <nav className="bg-white shadow-lg">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-2xl font-bold text-blue-700">TestCase Generator</h1>
              <div className="space-x-8">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `font-medium ${isActive ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-700 hover:text-blue-600'} pb-1`
                  }
                >
                  Generator
                </NavLink>
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `font-medium ${isActive ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-700 hover:text-blue-600'} pb-1`
                  }
                >
                  Admin Panel
                </NavLink>
              </div>
            </div>
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<GeneratorPage apps={apps} />} />
          <Route path="/admin" element={<AdminPage apps={apps} setApps={setApps} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;