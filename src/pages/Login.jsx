import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

function Login() {
    const [isRegister, setIsRegister] = useState(false);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const setupUserSession = (uname, isAdminUser) => {
        localStorage.setItem('username', uname);
        localStorage.setItem('role', isAdminUser ? 'admin' : 'student');
        // DO NOT clear completed_, enrolled_, purchased_ — progress is preserved across logins
        // Only clear session popups so certificate popup doesn't re-show automatically
        sessionStorage.clear();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            if (isRegister) {
                try {
                    await API.post('register/', { username, email, password });
                    setSuccess('Account registered! You can now log in.');
               } catch (apiErr) {
    // Save user locally since backend is down
    const registeredUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
    const userExists = registeredUsers.find(u => u.username === username);
    if (userExists) {
        setError('Username already exists. Please login.');
        return;
    }
    registeredUsers.push({ username, email, password });
    localStorage.setItem('registered_users', JSON.stringify(registeredUsers));
    setSuccess('Account created! You can now log in.');
}
                setIsRegister(false);
                setPassword('');
            } else {
                try {
                    const response = await API.post('token/', { username, password });
                    localStorage.setItem('access_token', response.data.access);
                    localStorage.setItem('refresh_token', response.data.refresh);
                    setupUserSession(username, username === 'admin');
                    navigate('/');
                    } catch (loginErr) {
    // Backend down - use sandbox mode but check if user registered
    const registeredUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
    const userExists = registeredUsers.find(u => u.username === username && u.password === password);
    if (userExists) {
        localStorage.setItem('access_token', 'mock-sandbox-token-xyz-123');
        setupUserSession(username, username === 'admin');
        navigate('/');
    } else {
        setError('Invalid username or password. Please register first.');
    }
}
         
                }
            }
         catch (err) {
            setError('Something went wrong. Please try again.');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-16 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2 text-center">
                {isRegister ? 'Create an Account' : 'Welcome Back'}
            </h2>
            <p className="text-sm text-gray-400 text-center mb-6">
                {isRegister ? 'Join our learning platform today' : 'Sign in to access your course curriculum'}
            </p>

            {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg mb-4">{error}</p>}
            {success && <p className="text-sm text-green-600 bg-green-50 p-3 rounded-lg mb-4">{success}</p>}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                    />
                </div>

                {isRegister && (
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                    </div>
                )}

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
                >
                    {isRegister ? 'Sign Up' : 'Sign In'}
                </button>
            </form>

            <div className="mt-6 text-center border-t border-gray-100 pt-4">
                <button
                    type="button"
                    onClick={() => { setIsRegister(!isRegister); setError(''); setSuccess(''); }}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                    {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register Here"}
                </button>
            </div>
        </div>
    );
}

export default Login;
