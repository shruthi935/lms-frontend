import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';


function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();

    
    const [showCertMenu, setShowCertMenu] = useState(false);
    

    const isAuthenticated = !!localStorage.getItem('access_token');
    const isOnLoginPage = location.pathname === '/login';

    const role = localStorage.getItem('role');
    const isAdmin = role === 'admin' || role === 'superuser' || role === 'Admin';

    const username =
        localStorage.getItem('username') ||
        localStorage.getItem('user_name') ||
        localStorage.getItem('name') ||
        'User';

    // Get completed courses for certificate button in navbar
    const getCompletedCourses = () => {
        try {
            const completedLessonIds = JSON.parse(localStorage.getItem(`completed_${username}`) || '[]');
            const enrolledIds = JSON.parse(localStorage.getItem(`enrolled_${username}`) || '[]');
            const allCourses = JSON.parse(localStorage.getItem('all_courses_cache') || '[]');
            return allCourses.filter(c =>
                enrolledIds.includes(c.id) &&
                c.lessons.length > 0 &&
                c.lessons.every(l => completedLessonIds.includes(l.id))
            );
        } catch {
            return [];
        }
    };

    const [completedCourses, setCompletedCourses] = useState([]);

useEffect(() => {
    const update = () => setCompletedCourses(isAuthenticated ? getCompletedCourses() : []);
    update();
    const interval = setInterval(update, 2000);
    return () => clearInterval(interval);
}, [isAuthenticated, username]);

    const handleLogout = () => {
        // Only clear auth tokens — keep completed_, enrolled_, purchased_ so progress is saved
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        navigate('/login');
    };


    return (
        <>
            <nav className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">

                        {/* Logo */}
                        <div
                            onClick={() => navigate(isAuthenticated ? '/' : '/login')}
                            className="flex items-center gap-3 cursor-pointer group"
                        >
                            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                                <span className="text-white font-black text-sm">LMS</span>
                            </div>
                            <span className="text-lg font-black text-gray-900 hidden sm:block">
                                Open<span className="text-indigo-600">Academy</span>
                            </span>
                        </div>

                        {/* Right Side */}
                        <div className="flex items-center gap-3">

                            {/* Certificate button — only shown when logged in and has completed courses */}
                            {isAuthenticated && completedCourses.length > 0 && (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowCertMenu(!showCertMenu)}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-400 text-white transition shadow-md"
                                    >
                                        🏆 Certificates
                                        <span className="bg-white text-amber-600 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                                            {completedCourses.length}
                                        </span>
                                    </button>
                                    {showCertMenu && (
                                        <div className="absolute top-12 right-0 w-72 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 p-3">
                                            <p className="text-xs font-black text-gray-400 uppercase tracking-wider px-2 mb-2">Your Certificates</p>
                                            {completedCourses.map(c => (
                                                <button
                                                    key={c.id}
                                                    onClick={() => {
                                                        setShowCertMenu(false);
                                                        localStorage.setItem('open_cert', String(c.id));
                                                        navigate('/');
                                                    }}
                                                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-amber-50 flex items-center gap-2 transition"
                                                >
                                                    <span>📜</span>
                                                    <span className="text-sm font-semibold text-gray-700 truncate">{c.title}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* User Section */}
                            {isAuthenticated ? (
                                <div className="flex items-center gap-2">
                                    <div className="hidden md:flex flex-col items-end">
                                        <span className="text-xs font-bold text-gray-800">{username}</span>
                                        {isAdmin && (
                                            <span className="text-[10px] font-black text-indigo-600 uppercase">Admin</span>
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
                                /* Hide Sign In button when already on the login page */
                                !isOnLoginPage && (
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2 rounded-xl"
                                    >
                                        Sign In
                                    </button>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
}

export default Navbar;
