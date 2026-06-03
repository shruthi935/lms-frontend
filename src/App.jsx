// frontend/src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

function App() {
    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    return (
        <Router>
            <div className="min-h-screen bg-gray-50 font-sans">
                {/* Navigation Bar */}
                <nav className="bg-white shadow-sm border-b border-gray-100 px-8 py-4 flex justify-between items-center">
                    <Link to="/" className="text-xl font-bold text-indigo-600 tracking-tight">LMS OpenAcademy</Link>
                    <div className="space-x-6 flex items-center">
                        <Link to="/" className="text-gray-600 hover:text-indigo-600 font-medium">Courses</Link>
                        {localStorage.getItem('access_token') ? (
                            <button onClick={handleLogout} className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition">Logout</button>
                        ) : (
                            <Link to="/login" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition">Login</Link>
                        )}
                    </div>
                </nav>

                {/* View Container */}
                <main className="max-w-7xl mx-auto p-8">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/login" element={<Login />} />
                    </Routes>
                </main>
            </div>
        </Router>
        
    );
}




export default App;