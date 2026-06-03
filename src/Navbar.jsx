import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateCourseModal from './CreateCourseModal';

function Navbar() {
    const navigate = useNavigate();

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAdminDenied, setShowAdminDenied] = useState(false);

    const isAuthenticated = !!localStorage.getItem('access_token');
    
    const role = localStorage.getItem('role');

const isAdmin =
    role === 'admin' ||
    role === 'superuser' ||
    role === 'Admin';

    const username =
        localStorage.getItem('username') ||
        localStorage.getItem('user_name') ||
        localStorage.getItem('name') ||
        'User';

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const handleCreateCourseClick = () => {
        // Not logged in
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        // Logged in but not admin
        if (!isAdmin) {
            setShowAdminDenied(true);

            setTimeout(() => {
                setShowAdminDenied(false);
            }, 3000);

            return;
        }

        // Admin
        setShowCreateModal(true);
    };

    return (
        <>
            <nav className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">

                        {/* Logo */}
                        <div
                            onClick={() => navigate('/')}
                            className="flex items-center gap-3 cursor-pointer group"
                        >
                            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                                <span className="text-white font-black text-sm">
                                    LMS
                                </span>
                            </div>

                            <span className="text-lg font-black text-gray-900 hidden sm:block">
                                Open<span className="text-indigo-600">Academy</span>
                            </span>
                        </div>

                        {/* Right Side */}
                        <div className="flex items-center gap-3">

                            {/* Create Course Button - Visible for Everyone */}
                            <div className="relative">
                                <button
                                    onClick={handleCreateCourseClick}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 shadow-md
                                        ${
                                            isAdmin
                                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                        }`}
                                >
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2.5}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M12 4v16m8-8H4"
                                        />
                                    </svg>

                                    <span>Create Course</span>

                                    {isAdmin && (
                                        <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
                                    )}
                                </button>

                                {/* Admin Access Toast */}
                                {showAdminDenied && (
                                    <div className="absolute top-12 right-0 w-64 bg-gray-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl border border-gray-700 z-50">
                                        <div className="flex items-center gap-2">
                                            <span className="text-red-400 text-base">
                                                🔒
                                            </span>

                                            <div>
                                                <p className="font-bold">
                                                    Admin Access Only
                                                </p>

                                                <p className="text-gray-400">
                                                    Only admins can create courses.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* User Section */}
                            {isAuthenticated ? (
                                <div className="flex items-center gap-2">
                                    <div className="hidden md:flex flex-col items-end">
                                        <span className="text-xs font-bold text-gray-800">
                                            {username}
                                        </span>

                                        {isAdmin && (
                                            <span className="text-[10px] font-black text-indigo-600 uppercase">
                                                Admin
                                            </span>
                                        )}
                                    </div>

                                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-black">
                                        {username.charAt(0).toUpperCase()}
                                    </div>

                                    <button
                                        onClick={handleLogout}
                                        className="text-xs font-bold text-gray-400 hover:text-red-500 px-3 py-2 rounded-lg hover:bg-red-50"
                                    >
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => navigate('/login')}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2 rounded-xl"
                                >
                                    Sign In
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Modal opens only for admin */}
            {showCreateModal && (
                <CreateCourseModal
                    onClose={() => setShowCreateModal(false)}
                />
            )}
        </>
    );
}

export default Navbar;