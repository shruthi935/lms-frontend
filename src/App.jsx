import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Navbar from './Navbar';

function PrivateRoute({ children }) {
    const isAuthenticated = !!localStorage.getItem('access_token');
    return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-gray-50 font-sans">
                <Navbar />
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
