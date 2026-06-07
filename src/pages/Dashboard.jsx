import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Parse "42 Hours" → milliseconds
function parseDurationToMs(durationStr) {
    const match = durationStr?.match(/(\d+(\.\d+)?)/);
    const hours = match ? parseFloat(match[1]) : 1;
    return hours * 60 * 60 * 1000;
}

function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

function sendBrowserNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/favicon.ico' });
    }
}

function useCourseTimer(course, username, isEnrolled, completedLessonIds) {
    const [timeLeft, setTimeLeft] = useState(null);
    const [notified, setNotified] = useState(false);
    const [expired, setExpired] = useState(false);
    const [showBanner, setShowBanner] = useState(false);
    const [bannerMsg, setBannerMsg] = useState('');

    const allDone = course && course.lessons.every(l => completedLessonIds.includes(l.id));

    useEffect(() => {
        if (!course || !isEnrolled || allDone) return;

        const key = `course_deadline_${username}_${course.id}`;
        let deadline = localStorage.getItem(key);

        if (!deadline) {
            const ms = parseDurationToMs(course.duration);
            deadline = Date.now() + ms;
            localStorage.setItem(key, deadline);
        } else {
            deadline = parseInt(deadline);
        }

        const interval = setInterval(() => {
            const remaining = deadline - Date.now();

            if (remaining <= 0) {
                setTimeLeft(0);
                setExpired(true);
                clearInterval(interval);
                setBannerMsg(`⏰ Time's up for "${course.title}"! Please complete it.`);
                setShowBanner(true);
                sendBrowserNotification('Course Deadline Passed!', `You didn't complete "${course.title}" in time.`);
                return;
            }

            setTimeLeft(remaining);

            // Notify at 30 min mark
            const thirtyMin = 30 * 60 * 1000;
            if (!notified && remaining <= thirtyMin) {
                setNotified(true);
                const mins = Math.ceil(remaining / 60000);
                setBannerMsg(`⚠️ Only ${mins} minutes left to complete "${course.title}"!`);
                setShowBanner(true);
                sendBrowserNotification(
                    '⚠️ Course Deadline Soon!',
                    `Only ${mins} min left to finish "${course.title}". Hurry up!`
                );
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [course?.id, isEnrolled, allDone]);

    return { timeLeft, expired, showBanner, setShowBanner, bannerMsg };
}
function CourseTimerBadge({ timeLeft, expired }) {
    if (timeLeft === null || expired === undefined) return null;

    const formatTime = (ms) => {
        const totalSecs = Math.floor(ms / 1000);
        const h = Math.floor(totalSecs / 3600);
        const m = Math.floor((totalSecs % 3600) / 60);
        const s = totalSecs % 60;
        return `${h}h ${m}m ${s}s`;
    };

    if (expired) {
        return (
            <span className="inline-flex items-center gap-1 bg-red-100 text-red-600 text-[10px] font-black px-2 py-1 rounded-full border border-red-200">
                ⏰ EXPIRED
            </span>
        );
    }

    const isUrgent = timeLeft <= 30 * 60 * 1000;
    return (
        <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full border
            ${isUrgent
                ? 'bg-red-50 text-red-600 border-red-200 animate-pulse'
                : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
            ⏱ {formatTime(timeLeft)}
        </span>
    );
}

function NotificationBanner({ message, onClose }) {
    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[999] w-[92%] max-w-lg bg-gray-900 text-white px-5 py-4 rounded-2xl shadow-2xl border border-gray-700 flex items-start gap-3"
            style={{ animation: 'fadeInDown 0.3s ease forwards' }}>
            <span className="text-xl flex-shrink-0">🔔</span>
            <p className="text-sm font-semibold flex-1">{message}</p>
            <button onClick={onClose} className="text-gray-400 hover:text-white font-bold text-lg leading-none">✕</button>
        </div>
    );
}

const MOCK_COURSES = [
    {
        id: 1,
        title: "Introduction to HTML5 & CSS3 Essentials",
        description: "Learn the absolute baseline structural blocks of modern web engineering. Design layouts using Flexbox and CSS Grid.",
        category: "Development", level: "Beginner", duration: "4 Hours", price: 0,
        thumbnail: "https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&w=800&q=80",
        lessons: [
            { id: 101, title: "01. Introduction to HTML5 & Web Structure", duration: "08:12", videoId: "qz0aGYrrlhU" },
            { id: 102, title: "02. CSS3 Flexbox & Grid Layouts", duration: "12:45", videoId: "phWxA89Dy94" }
        ]
    },
    {
        id: 2,
        title: "Ultimate Full-Stack Web Development Masterclass",
        description: "Master React, Node.js, and MongoDB by building 10 production-grade applications from scratch.",
        category: "Development", level: "Advanced", duration: "42 Hours", price: 94.99,
        thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80",
        lessons: [
            { id: 201, title: "01. Introduction to Full-Stack Architecture", duration: "12:45", videoId: "ysEN5RaKOlA" },
            { id: 202, title: "02. React Components and State Mechanics", duration: "25:10", videoId: "SqcY0GlETPk" }
        ]
    },
    {
        id: 3,
        title: "Command Line Basics & Shell Scripting 101",
        description: "Get comfortable utilizing shell command utilities. Navigate servers and automate processes.",
        category: "IT Operations", level: "Beginner", duration: "3 Hours", price: 0,
        thumbnail: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=800&q=80",
        lessons: [
            { id: 301, title: "01. Navigating Directories with Shell Commands", duration: "06:30", videoId: "oxuRxtrO2Ag" }
        ]
    },
    {
        id: 4,
        title: "Artificial Intelligence & Practical Machine Learning",
        description: "Dive deep into Python, Neural Networks, Deep Learning, and TensorFlow. Build predictive data models.",
        category: "Data Science", level: "Intermediate", duration: "38 Hours", price: 129.99,
        thumbnail: "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80",
        lessons: [
            { id: 401, title: "01. Foundations of Python for Data Science", duration: "14:30", videoId: "LHBE6uPpyH0" }
        ]
    },
    {
        id: 5,
        title: "JavaScript Algorithms & Complex Data Structures",
        description: "Master recursion, sorting algorithms, linked lists, hash tables, and advanced programming logic.",
        category: "Development", level: "Intermediate", duration: "15 Hours", price: 0,
        thumbnail: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?auto=format&fit=crop&w=800&q=80",
        lessons: [
            { id: 501, title: "01. Understanding Time Complexity and Big O", duration: "19:15", videoId: "8hly31xKli0" }
        ]
    },
    {
        id: 6,
        title: "UI/UX Advanced Design Systems in Figma",
        description: "Learn to build comprehensive UI design frameworks, components, auto-layouts, and design assets.",
        category: "Design", level: "All Levels", duration: "18 Hours", price: 49.99,
        thumbnail: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&w=800&q=80",
        lessons: [
            { id: 601, title: "01. Visual Hierarchy & Grid Systems in Figma", duration: "11:20", videoId: "FTFaQWZBqQ8" }
        ]
    },
    {
        id: 7,
        title: "Python Automation & Scripting Bootcamp",
        description: "Write custom scripts to web scrape, automate file data processes, modify spreadsheets, and save time.",
        category: "Development", level: "Beginner", duration: "9 Hours", price: 0,
        thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
        lessons: [
            { id: 701, title: "01. Python Setup & First Automation Script", duration: "10:05", videoId: "_uQrJ0TkZlc" }
        ]
    },
    {
        id: 8,
        title: "Cyber Security Defensive Operations Protocols",
        description: "Protect cloud systems from vulnerabilities. Master ethical hacking setups and network firewalls.",
        category: "Security", level: "Advanced", duration: "52 Hours", price: 149.99,
        thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80",
        lessons: [
            { id: 801, title: "01. Security Lab Framework Configuration", duration: "15:30", videoId: "3Kq1MIfTWCE" }
        ]
    },
    {
        id: 9,
        title: "Git & GitHub Professional Version Control Workflow",
        description: "Master branching pipelines, handling merge conflicts, pull requests, and multi-developer systems.",
        category: "IT Operations", level: "Beginner", duration: "5 Hours", price: 0,
        thumbnail: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&w=800&q=80",
        lessons: [
            { id: 901, title: "01. Git Init, Commits, and Branching Logic", duration: "14:12", videoId: "RGOj5yH7evk" }
        ]
    },
    {
        id: 10,
        title: "Cloud Native Systems Deployment with AWS & Docker",
        description: "Scale applications globally. Learn AWS EC2 setups, container engines, and automated CI/CD.",
        category: "Cloud", level: "Intermediate", duration: "30 Hours", price: 119.99,
        thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
        lessons: [
            { id: 1001, title: "01. Writing Custom Multi-Stage Dockerfiles", duration: "22:40", videoId: "pTFZFxd5m9s" }
        ]
    }
];

const CATEGORY_THUMBNAILS = {
    Development: [
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=800&q=80',
    ],
    'Data Science': [
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?auto=format&fit=crop&w=800&q=80',
    ],
    Design: [
        'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?auto=format&fit=crop&w=800&q=80',
    ],
    'IT Operations': [
        'https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1600267175161-cfaa711b4a81?auto=format&fit=crop&w=800&q=80',
    ],
    Security: [
        'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=800&q=80',
    ],
    Cloud: [
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1603322327561-7b8c1489f78f?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1569428034239-f9565e32e224?auto=format&fit=crop&w=800&q=80',
    ],
};

const CATEGORIES = Object.keys(CATEGORY_THUMBNAILS);
const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];
const WIZARD_STEPS = ['Course Info', 'Thumbnail', 'First Lesson', 'Review'];

// ─── Wizard Step Indicator ────────────────────────────────────────────────────
function StepIndicator({ current }) {
    return (
        <div className="flex items-center justify-center gap-0 mb-8">
            {WIZARD_STEPS.map((label, i) => (
                <React.Fragment key={label}>
                    <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300
                            ${i < current  ? 'bg-emerald-500 text-white' :
                              i === current ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' :
                                             'bg-gray-100 text-gray-400'}`}>
                            {i < current ? '✓' : i + 1}
                        </div>
                        <span className={`text-[10px] font-bold mt-1 whitespace-nowrap ${i === current ? 'text-indigo-600' : 'text-gray-400'}`}>
                            {label}
                        </span>
                    </div>
                    {i < WIZARD_STEPS.length - 1 && (
                        <div className={`w-10 h-0.5 mb-4 mx-1 transition-all duration-500 ${i < current ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}

// ─── Create Course Modal (Admin Only) ─────────────────────────────────────────
function CreateCourseModal({ onClose, onCourseCreated }) {
    const [step, setStep] = useState(0);
    const [published, setPublished] = useState(false);
    const [form, setForm] = useState({
        title: '', description: '', category: 'Development', level: 'Beginner',
        duration: '', price: '', thumbnail: CATEGORY_THUMBNAILS['Development'][0],
        customThumbnail: '', lessonTitle: '', lessonDuration: '', lessonVideoId: '',
    });

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
    const activeThumbnail = form.customThumbnail || form.thumbnail;
    // Request notification permission on load
useEffect(() => { requestNotificationPermission(); }, []);

    useEffect(() => {
        setForm(f => ({ ...f, thumbnail: CATEGORY_THUMBNAILS[f.category][0], customThumbnail: '' }));
    }, [form.category]);

    const handlePublish = () => {
        const newCourse = {
            id: Date.now(),
            title: form.title.trim(),
            description: form.description.trim(),
            category: form.category,
            level: form.level,
            duration: form.duration || '1 Hour',
            price: parseFloat(form.price) || 0,
            thumbnail: activeThumbnail,
            lessons: [{
                id: Date.now() + 1,
                title: form.lessonTitle.trim() || '01. Introduction',
                duration: form.lessonDuration || '10:00',
                videoId: form.lessonVideoId.trim() || 'dQw4w9WgXcQ',
            }],
            adminCreated: true,
        };
        const existing = JSON.parse(localStorage.getItem('admin_courses') || '[]');
        existing.push(newCourse);
        localStorage.setItem('admin_courses', JSON.stringify(existing));
        onCourseCreated(newCourse);
        setPublished(true);
        setTimeout(() => onClose(), 2000);
    };

    if (published) {
        return (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-sm w-full text-center">
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5 text-4xl">🚀</div>
                    <h2 className="text-2xl font-black text-gray-900">Course Published!</h2>
                    <p className="text-gray-400 mt-2 text-sm">
                        <span className="font-bold text-gray-700">"{form.title}"</span> is now live in the dashboard.
                    </p>
                    <div className="mt-5 flex justify-center gap-1">
                        {[0,1,2].map(i => (
                            <div key={i} className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                <div className="sticky top-0 bg-white z-10 px-8 pt-7 pb-4 border-b border-gray-100 rounded-t-3xl">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-gray-900 leading-tight">Create New Course</h2>
                                <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">Admin Panel</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-lg transition">✕</button>
                    </div>
                    <StepIndicator current={step} />
                </div>

                <div className="px-8 py-6">
                    {/* Step 0: Course Info */}
                    {step === 0 && (
                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Course Title *</label>
                                <input
                                    type="text" value={form.title} onChange={e => set('title', e.target.value)}
                                    placeholder="e.g. Advanced TypeScript Mastery"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-semibold"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Description</label>
                                <textarea
                                    rows={3} value={form.description} onChange={e => set('description', e.target.value)}
                                    placeholder="What will students learn? Keep it compelling and specific..."
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Category</label>
                                    <select value={form.category} onChange={e => set('category', e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Level</label>
                                    <select value={form.level} onChange={e => set('level', e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                                        {LEVELS.map(l => <option key={l}>{l}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Duration</label>
                                    <input type="text" value={form.duration} onChange={e => set('duration', e.target.value)}
                                        placeholder="e.g. 12 Hours"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Price (0 = Free)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">$</span>
                                        <input type="number" min="0" step="0.01" value={form.price} onChange={e => set('price', e.target.value)}
                                            placeholder="0.00"
                                            className="w-full pl-7 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => { if (form.title.trim()) setStep(1); }}
                                disabled={!form.title.trim()}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3.5 rounded-xl text-sm transition shadow-lg shadow-indigo-100"
                            >
                                Next: Choose Thumbnail →
                            </button>
                        </div>
                    )}

                    {/* Step 1: Thumbnail */}
                    {step === 1 && (
                        <div className="space-y-5">
                            <div>
                                <h3 className="text-sm font-black text-gray-700 mb-1">
                                    Suggested for <span className="text-indigo-600">{form.category}</span>
                                </h3>
                                <p className="text-xs text-gray-400 mb-4">Click a thumbnail to select it, or paste your own URL below.</p>
                                <div className="grid grid-cols-2 gap-3">
                                    {CATEGORY_THUMBNAILS[form.category].map((url, i) => (
                                        <button
                                            key={i}
                                            onClick={() => { set('thumbnail', url); set('customThumbnail', ''); }}
                                            className={`relative rounded-2xl overflow-hidden h-32 transition-all duration-200
                                                ${form.thumbnail === url && !form.customThumbnail
                                                    ? 'ring-4 ring-indigo-600 ring-offset-2 scale-[1.02] shadow-xl'
                                                    : 'hover:scale-[1.01] hover:shadow-lg opacity-75 hover:opacity-100'}`}
                                        >
                                            <img src={url} alt="" className="w-full h-full object-cover" />
                                            {form.thumbnail === url && !form.customThumbnail && (
                                                <div className="absolute inset-0 bg-indigo-600/20 flex items-center justify-center">
                                                    <div className="bg-indigo-600 text-white w-9 h-9 rounded-full flex items-center justify-center font-black text-base shadow-lg">✓</div>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Or Use Custom URL</label>
                                <input type="url" value={form.customThumbnail} onChange={e => set('customThumbnail', e.target.value)}
                                    placeholder="https://images.unsplash.com/..."
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-md">
                                <div className="relative h-40">
                                    <img src={activeThumbnail} alt="Preview" className="w-full h-full object-cover" onError={e => { e.target.src = CATEGORY_THUMBNAILS[form.category][0]; }} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <div className="absolute bottom-3 left-3 right-3">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/80 bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded">{form.category}</span>
                                        <p className="text-white font-bold text-sm mt-1 line-clamp-1">{form.title || 'Course Title Preview'}</p>
                                    </div>
                                    <div className="absolute top-3 right-3 bg-white/90 px-2 py-0.5 rounded-full text-[10px] font-bold text-indigo-600 uppercase">{form.level}</div>
                                    <div className="absolute top-3 left-3 bg-indigo-600 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase">Admin Created</div>
                                </div>
                                <div className="bg-white px-4 py-2.5">
                                    <p className="text-xs text-gray-400 italic">Live card preview</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setStep(0)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl text-sm transition">← Back</button>
                                <button onClick={() => setStep(2)} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-sm transition shadow-lg shadow-indigo-100">Next: Add Lesson →</button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: First Lesson */}
                    {step === 2 && (
                        <div className="space-y-5">
                            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
                                <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">First Lesson Details</p>
                                <p className="text-xs text-gray-400 mt-0.5">You can add more lessons after publishing.</p>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Lesson Title *</label>
                                <input type="text" value={form.lessonTitle} onChange={e => set('lessonTitle', e.target.value)}
                                    placeholder="e.g. 01. Introduction & Setup"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-semibold" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Duration (MM:SS)</label>
                                    <input type="text" value={form.lessonDuration} onChange={e => set('lessonDuration', e.target.value)}
                                        placeholder="12:30"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">YouTube Video ID</label>
                                    <input type="text" value={form.lessonVideoId} onChange={e => set('lessonVideoId', e.target.value)}
                                        placeholder="e.g. dQw4w9WgXcQ"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-mono" />
                                </div>
                            </div>
                            {form.lessonVideoId && (
                                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-xs text-gray-500 flex items-center gap-2">
                                    <span className="text-red-500 text-base">▶</span>
                                    Video ID: <span className="font-mono font-bold text-gray-700">{form.lessonVideoId}</span>
                                    <span className="text-gray-300 mx-1">·</span>
                                    <a href={`https://youtube.com/watch?v=${form.lessonVideoId}`} target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline">Preview on YouTube ↗</a>
                                </div>
                            )}
                            <div className="flex gap-3">
                                <button onClick={() => setStep(1)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl text-sm transition">← Back</button>
                                <button onClick={() => setStep(3)} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-sm transition shadow-lg shadow-indigo-100">Next: Review →</button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Review & Publish */}
                    {step === 3 && (
                        <div className="space-y-5">
                            <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                                <div className="relative h-44">
                                    <img src={activeThumbnail} alt="" className="w-full h-full object-cover" onError={e => { e.target.src = CATEGORY_THUMBNAILS[form.category][0]; }} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                    <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-bold text-indigo-600 uppercase">{form.level}</span>
                                    <span className="absolute top-3 left-3 bg-indigo-600 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase">Admin Created</span>
                                </div>
                                <div className="p-5">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">{form.category}</span>
                                    <h3 className="text-lg font-bold text-gray-900 mt-2">{form.title}</h3>
                                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">{form.description || 'No description provided.'}</p>
                                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-50">
                                        <span className={`text-xl font-black ${parseFloat(form.price) > 0 ? 'text-gray-900' : 'text-emerald-600'}`}>
                                            {parseFloat(form.price) > 0 ? `$${parseFloat(form.price).toFixed(2)}` : 'FREE'}
                                        </span>
                                        <span className="text-xs font-semibold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">{form.duration || '1 Hour'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">First Lesson</p>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-black flex items-center justify-center">1</span>
                                        <span className="text-sm font-semibold text-gray-700">{form.lessonTitle || '01. Introduction'}</span>
                                    </div>
                                    <span className="text-xs font-mono text-gray-400">{form.lessonDuration || '10:00'}</span>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setStep(2)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl text-sm transition">← Back</button>
                                <button
                                    onClick={handlePublish}
                                    className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold py-3 rounded-xl text-sm transition shadow-xl shadow-indigo-200 flex items-center justify-center gap-2"
                                >
                                    🚀 Publish Course
                                </button>
                            </div>
                            <p className="text-center text-xs text-gray-400">Course appears instantly in the dashboard for all users.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── YouTube Player ───────────────────────────────────────────────────────────
function VideoPlayer({ lesson }) {
    const embedUrl = `https://www.youtube.com/embed/${lesson.videoId}?autoplay=1&rel=0&modestbranding=1`;
    return (
        <iframe
            key={lesson.id}
            src={embedUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={lesson.title}
            style={{ border: 'none' }}
        />
    );
}

// ─── QR Code SVG ─────────────────────────────────────────────────────────────
function QRCodeSVG({ size = 180 }) {
    const cells = [];
    const pattern = [
        [1,1,1,1,1,1,1,0,1,0,1,1,0,0,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,1,0,0,1,0,1,0,0,1,0,0,0,0,0,1],
        [1,0,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,1,1,0,1],
        [1,0,1,1,1,0,1,0,0,1,1,1,0,0,1,0,1,1,1,0,1],
        [1,0,1,1,1,0,1,0,1,0,0,0,1,0,1,0,1,1,1,0,1],
        [1,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1],
        [0,0,0,0,0,0,0,0,1,1,0,1,1,0,0,0,0,0,0,0,0],
        [1,1,0,1,1,0,1,1,0,1,0,0,1,1,1,0,1,1,0,1,0],
        [0,1,0,0,1,1,0,1,1,0,1,1,0,0,0,1,0,1,1,0,1],
        [1,0,1,1,0,1,1,0,1,0,1,0,1,1,1,0,1,0,1,1,0],
        [0,1,1,0,0,0,0,1,0,1,1,0,0,1,0,1,1,0,0,1,1],
        [1,0,0,1,1,0,1,0,1,1,0,1,0,0,1,1,0,1,0,0,1],
        [0,0,0,0,0,0,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0],
        [1,1,1,1,1,1,1,0,0,1,1,0,1,0,1,0,0,1,1,0,1],
        [1,0,0,0,0,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,0],
        [1,0,1,1,1,0,1,0,0,1,1,0,1,0,1,0,1,0,1,1,1],
        [1,0,1,1,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,0,1],
        [1,0,1,1,1,0,1,0,0,1,1,0,1,0,1,0,1,1,1,0,0],
        [1,0,0,0,0,0,1,0,1,1,0,1,0,1,0,1,0,0,0,1,0],
        [1,1,1,1,1,1,1,0,0,0,1,0,1,0,1,0,1,0,1,0,1],
    ];
    const cellSize = size / 21;
    pattern.forEach((row, r) => {
        row.forEach((cell, c) => {
            if (cell) cells.push(<rect key={`${r}-${c}`} x={c * cellSize} y={r * cellSize} width={cellSize} height={cellSize} fill="#1e1b4b" />);
        });
    });
    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
            <rect width={size} height={size} fill="white" rx="4" />
            {cells}
        </svg>
    );
}

// ─── QR Payment Screen ────────────────────────────────────────────────────────
function QRPaymentScreen({ course, onSuccess, onBack }) {
    const [countdown, setCountdown] = useState(null);
    const [paid, setPaid] = useState(false);
    const [scanning, setScanning] = useState(false);

    const handleConfirmPayment = () => { setScanning(true); setCountdown(3); };

    useEffect(() => {
        if (countdown === null) return;
        if (countdown === 0) { setPaid(true); setScanning(false); setTimeout(() => onSuccess(), 1500); return; }
        const t = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [countdown]);

    if (paid) {
        return (
            <div className="max-w-md mx-auto mt-20 text-center">
                <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl p-10">
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">✅</div>
                    <h2 className="text-2xl font-black text-gray-900">Payment Successful!</h2>
                    <p className="text-gray-500 mt-2">Enrolling you in the course...</p>
                    <div className="mt-4 flex justify-center gap-1">
                        {[0,1,2].map(i => <div key={i} className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto mt-8">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden">
                <div className="bg-indigo-900 p-6 text-white text-center">
                    <button onClick={onBack} className="text-indigo-300 text-xs font-semibold hover:text-white mb-3 block text-left">← Back</button>
                    <div className="text-xs uppercase tracking-widest text-indigo-300 font-bold mb-1">Scan & Pay via UPI</div>
                    <h2 className="text-2xl font-black">Complete Payment</h2>
                </div>
                <div className="flex justify-center mt-6 mb-2">
                    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-6 py-3 text-center">
                        <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider">Amount to Pay</p>
                        <p className="text-3xl font-black text-indigo-700 mt-1">${course.price}</p>
                        <p className="text-xs text-gray-400 mt-1">{course.title.slice(0, 30)}...</p>
                    </div>
                </div>
                <div className="flex flex-col items-center px-8 pb-6">
                    <div className={`relative mt-4 p-4 rounded-2xl border-2 transition-all duration-300 ${scanning ? 'border-indigo-500 shadow-lg shadow-indigo-100' : 'border-gray-200'}`}>
                        {scanning && (
                            <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                                <div className="absolute left-0 right-0 h-1 bg-indigo-500/60" style={{ animation: 'scanLine 1s linear infinite' }} />
                            </div>
                        )}
                        <QRCodeSVG size={190} />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="bg-white rounded-lg p-1.5 shadow-md border border-gray-100">
                                <div className="w-8 h-8 bg-indigo-600 rounded-md flex items-center justify-center text-white font-black text-xs">LMS</div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 bg-gray-50 rounded-xl px-4 py-2 flex items-center gap-2 border border-gray-100">
                        <span className="text-xs text-gray-400 font-medium">UPI ID:</span>
                        <span className="text-xs font-bold text-gray-700 font-mono">lms.openacademy@upi</span>
                        <button onClick={() => navigator.clipboard?.writeText('lms.openacademy@upi')} className="text-indigo-500 text-xs font-bold hover:text-indigo-700 ml-1">Copy</button>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                        <span className="text-xs text-gray-400">Pay via:</span>
                        {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map(app => (
                            <span key={app} className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{app}</span>
                        ))}
                    </div>
                    <ol className="mt-5 w-full space-y-2">
                        {["Open any UPI app on your phone", "Scan the QR code above", `Pay exactly $${course.price}`, "Click \"I've Paid\" below to confirm"].map((step, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                                {step}
                            </li>
                        ))}
                    </ol>
                    <button onClick={handleConfirmPayment} disabled={scanning} className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold py-4 rounded-xl text-base transition shadow-lg shadow-emerald-100">
                        {scanning ? `Verifying Payment... (${countdown})` : "✅ I've Paid — Verify Now"}
                    </button>
                    <p className="text-xs text-gray-400 mt-3 text-center">🔒 Payments are secure and encrypted</p>
                </div>
            </div>
            <style>{`@keyframes scanLine { 0% { top: 0%; } 100% { top: 100%; } }`}</style>
        </div>
    );
}

// ─── Certificate Modal ────────────────────────────────────────────────────────
function CertificateModal({ course, username, onClose }) {
    const defaultName = username ||
        localStorage.getItem("username") || localStorage.getItem("user_name") ||
        localStorage.getItem("name") || localStorage.getItem("full_name") ||
        localStorage.getItem("fullName") || localStorage.getItem("user") ||
        localStorage.getItem("email") || "Student";

    const [studentName, setStudentName] = useState(defaultName);
    const [editingName, setEditingName] = useState(false);
    const [tempName, setTempName] = useState(defaultName);
    const [confirmed, setConfirmed] = useState(false);

    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const certId = `LMS-${course.id}-${Date.now().toString(36).toUpperCase()}`;

    const handleDownload = () => {
        const svg = document.getElementById('certificate-svg');
        if (!svg) return;
        const serializer = new XMLSerializer();
        const svgStr = serializer.serializeToString(svg);
        const blob = new Blob([svgStr], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Certificate_${course.title.replace(/\s+/g, '_')}.svg`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // ── Name Confirmation Screen ──────────────────────────────────────────
    if (!confirmed) {
        return (
            <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
                <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden" onClick={e => e.stopPropagation()}>
                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 text-white text-center">
                        <div className="text-4xl mb-2">🎓</div>
                        <h2 className="text-xl font-black">Almost There!</h2>
                        <p className="text-indigo-200 text-sm mt-1">Your certificate is ready to generate</p>
                    </div>

                    <div className="p-6 space-y-5">
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
                            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Certificate will be issued to</p>
                            <p className="text-2xl font-black text-gray-900 italic">{studentName}</p>
                        </div>

                        {!editingName ? (
                            <button
                                onClick={() => { setEditingName(true); setTempName(studentName); }}
                                className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl text-sm transition border border-gray-200"
                            >
                                ✏️ Edit Name
                            </button>
                        ) : (
                            <div className="space-y-3">
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-wider">Enter your name</label>
                                <input
                                    type="text"
                                    value={tempName}
                                    onChange={e => setTempName(e.target.value)}
                                    autoFocus
                                    placeholder="Your full name"
                                    className="w-full px-4 py-3 rounded-xl border border-indigo-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-center text-lg"
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setEditingName(false)}
                                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-2.5 rounded-xl text-sm transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => { if (tempName.trim()) { setStudentName(tempName.trim()); setEditingName(false); } }}
                                        disabled={!tempName.trim()}
                                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-2.5 rounded-xl text-sm transition"
                                    >
                                        ✓ Save Name
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="pt-2 border-t border-gray-100 space-y-2">
                            <button
                                onClick={() => setConfirmed(true)}
                                disabled={editingName}
                                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 text-white font-black py-3.5 rounded-xl text-sm transition shadow-lg shadow-amber-200 flex items-center justify-center gap-2"
                            >
                                🏆 Generate My Certificate
                            </button>
                            <button onClick={onClose} className="w-full bg-gray-50 hover:bg-gray-100 text-gray-500 font-semibold py-2.5 rounded-xl text-sm transition">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── Certificate View ──────────────────────────────────────────────────
    return (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="p-6 bg-gradient-to-br from-indigo-50 to-amber-50">
                    <svg id="certificate-svg" viewBox="0 0 800 560" xmlns="http://www.w3.org/2000/svg" className="w-full rounded-xl border border-amber-200 shadow-lg">
                        <rect width="800" height="560" fill="#fffbf0" />
                        <rect x="12" y="12" width="776" height="536" rx="12" fill="none" stroke="#c7a948" strokeWidth="3" />
                        <rect x="20" y="20" width="760" height="520" rx="10" fill="none" stroke="#e8d48a" strokeWidth="1.5" />
                        {[[30,30],[770,30],[30,530],[770,530]].map(([cx,cy], i) => (
                            <g key={i}>
                                <circle cx={cx} cy={cy} r="10" fill="#c7a948" opacity="0.4" />
                                <circle cx={cx} cy={cy} r="5" fill="#c7a948" opacity="0.8" />
                            </g>
                        ))}
                        <rect x="0" y="0" width="800" height="8" rx="4" fill="#4338ca" />
                        <rect x="0" y="552" width="800" height="8" rx="4" fill="#4338ca" />
                        <circle cx="400" cy="76" r="38" fill="#4338ca" opacity="0.12" />
                        <circle cx="400" cy="76" r="28" fill="#4338ca" />
                        <text x="400" y="83" textAnchor="middle" fill="white" fontFamily="Georgia, serif" fontSize="14" fontWeight="bold">LMS</text>
                        <text x="400" y="145" textAnchor="middle" fontFamily="Georgia, serif" fontSize="13" fill="#6b5c1e" letterSpacing="5">CERTIFICATE OF COMPLETION</text>
                        <line x1="200" y1="160" x2="600" y2="160" stroke="#c7a948" strokeWidth="1.5" />
                        <circle cx="400" cy="160" r="4" fill="#c7a948" />
                        <text x="400" y="200" textAnchor="middle" fontFamily="Georgia, serif" fontSize="14" fill="#7c6e3a">This is to certify that</text>
                        <text x="400" y="248" textAnchor="middle" fontFamily="Georgia, serif" fontSize={studentName.length > 24 ? "24" : studentName.length > 16 ? "28" : "34"} fill="#1e1b4b" fontStyle="italic">{studentName}</text>
                        <line x1="180" y1="262" x2="620" y2="262" stroke="#c7a948" strokeWidth="1" strokeDasharray="4 2" />
                        <text x="400" y="294" textAnchor="middle" fontFamily="Georgia, serif" fontSize="14" fill="#7c6e3a">has successfully completed the course</text>
                        <text x="400" y="335" textAnchor="middle" fontFamily="Georgia, serif" fontSize="19" fill="#1e1b4b" fontWeight="bold">{course.title.length > 52 ? course.title.slice(0, 52) + '…' : course.title}</text>
                        <text x="400" y="365" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="11" fill="#9c8a4a">{course.category} · {course.level} · {course.duration}</text>
                        <line x1="180" y1="388" x2="620" y2="388" stroke="#e8d48a" strokeWidth="1" />
                        <text x="240" y="415" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="11" fill="#7c6e3a">Date of Completion</text>
                        <text x="240" y="434" textAnchor="middle" fontFamily="Georgia, serif" fontSize="13" fill="#1e1b4b" fontWeight="bold">{today}</text>
                        <text x="560" y="415" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="11" fill="#7c6e3a">Certificate ID</text>
                        <text x="560" y="434" textAnchor="middle" fontFamily="Georgia, serif" fontSize="12" fill="#1e1b4b" fontWeight="bold">{certId}</text>
                        <line x1="300" y1="490" x2="500" y2="490" stroke="#c7a948" strokeWidth="1.5" />
                        <text x="400" y="505" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="11" fill="#7c6e3a">Authorized Signature — Open Academy LMS</text>
                        {[-1,0,1].map((offset, i) => (
                            <text key={i} x={400 + offset * 30} y="472" textAnchor="middle" fontSize="16" fill="#c7a948">★</text>
                        ))}
                    </svg>
                </div>
                <div className="px-6 pb-6 pt-4 flex items-center justify-between bg-white">
                    <div>
                        <p className="text-lg font-black text-gray-900">🎓 Course Completed!</p>
                        <p className="text-sm text-gray-400">Issued to: <span className="font-bold text-indigo-600">{studentName}</span></p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setConfirmed(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2.5 rounded-xl text-sm transition">
                            ✏️ Edit Name
                        </button>
                        <button onClick={handleDownload} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition shadow-lg shadow-indigo-100">⬇ Download</button>
                        <button onClick={onClose} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-5 py-2.5 rounded-xl text-sm transition">Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Enrolled Course Card ─────────────────────────────────────────────────────
function EnrolledCourseCard({ course, completedLessonIds, onResume, onViewCertificate, username }) {
    const total = course.lessons.length;
    const done = course.lessons.filter(l => completedLessonIds.includes(l.id)).length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    const isCompleted = pct === 100;

    const { timeLeft, expired, showBanner, setShowBanner, bannerMsg } =
        useCourseTimer(course, username, true, completedLessonIds);

    return (
        <>
            {showBanner && (
                <NotificationBanner message={bannerMsg} onClose={() => setShowBanner(false)} />
            )}
            <div className={`bg-white rounded-2xl border shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col
                ${isCompleted ? 'border-emerald-200 ring-1 ring-emerald-100' :
                  expired ? 'border-red-200 ring-1 ring-red-100' : 'border-gray-100'}`}>
                <div className="relative h-40 rounded-t-2xl overflow-hidden flex-shrink-0">
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    {isCompleted && (
                        <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider">✓ Completed</div>
                    )}
                    {expired && !isCompleted && (
                        <div className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider animate-pulse">⏰ Expired</div>
                    )}
                    <div className="absolute bottom-3 left-3 right-3">
                        <div className="flex justify-between text-white text-xs font-semibold mb-1">
                            <span>{done}/{total} lessons</span>
                            <span>{pct}%</span>
                        </div>
                        <div className="w-full bg-white/30 rounded-full h-1.5">
                            <div className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-emerald-400' : expired ? 'bg-red-400' : 'bg-indigo-400'}`}
                                style={{ width: `${pct}%` }} />
                        </div>
                    </div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{course.category}</span>
                        {!isCompleted && <CourseTimerBadge timeLeft={timeLeft} expired={expired} />}
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 mt-2 line-clamp-2 flex-1">{course.title}</h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                        <span>{course.level}</span><span>·</span><span>{course.duration}</span>
                    </div>
                    {isCompleted ? (
                        <div className="mt-4 flex flex-col gap-2">
                            <button onClick={() => onViewCertificate(course)}
                                className="w-full py-3 rounded-xl font-bold text-sm transition bg-amber-500 hover:bg-amber-400 active:scale-95 text-white flex items-center justify-center gap-2"
                                style={{ boxShadow: '0 4px 14px rgba(245,158,11,0.35)' }}>
                                🏆 View Certificate
                            </button>
                            <button onClick={() => onResume(course)}
                                className="w-full py-2.5 rounded-xl font-bold text-sm transition bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100">
                                🎓 Review Course
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => onResume(course)}
                            className={`mt-4 w-full py-2.5 rounded-xl font-bold text-sm transition shadow-md
                                ${expired ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-100' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100'}`}>
                            {expired ? '⚠️ Resume (Overdue)' : pct === 0 ? '▶ Start Learning' : '▶ Continue Learning'}
                        </button>
                    )}
                </div>
            </div>
        </>
    );
}

// ─── Main Dashboard Component ─────────────────────────────────────────────────
function Dashboard() {
    const [activeTab, setActiveTab] = useState('explore');
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [activeLesson, setActiveLesson] = useState(null);
    const [paymentCourse, setPaymentCourse] = useState(null);
    const [showQR, setShowQR] = useState(false);
    const [certificateCourse, setCertificateCourse] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAdminDenied, setShowAdminDenied] = useState(false);

    const username = (
        localStorage.getItem('username') || localStorage.getItem('user_name') ||
        localStorage.getItem('name') || localStorage.getItem('full_name') ||
        localStorage.getItem('fullName') || localStorage.getItem('user') ||
        localStorage.getItem('email') || 'Student'
    );

    const isAdmin = true;

    const [enrolledCourseIds, setEnrolledCourseIds] = useState(() => {
        const saved = localStorage.getItem(`enrolled_${username}`);
        return saved ? JSON.parse(saved) : [];
    });
    const [purchasedCourseIds, setPurchasedCourseIds] = useState(() => {
        const saved = localStorage.getItem(`purchased_${username}`);
        return saved ? JSON.parse(saved) : [];
    });
    const [completedLessonIds, setCompletedLessonIds] = useState(() => {
        const saved = localStorage.getItem(`completed_${username}`);
        return saved ? JSON.parse(saved) : [];
    });
    const [adminCourses, setAdminCourses] = useState(() => {
        const saved = localStorage.getItem('admin_courses');
        return saved ? JSON.parse(saved) : [];
    });

    const ALL_COURSES = [...MOCK_COURSES, ...adminCourses];
    localStorage.setItem('all_courses_cache', JSON.stringify(ALL_COURSES));
    const navigate = useNavigate();

    useEffect(() => { localStorage.setItem(`enrolled_${username}`, JSON.stringify(enrolledCourseIds)); }, [enrolledCourseIds]);
    useEffect(() => { localStorage.setItem(`purchased_${username}`, JSON.stringify(purchasedCourseIds)); }, [purchasedCourseIds]);
    useEffect(() => { localStorage.setItem(`completed_${username}`, JSON.stringify(completedLessonIds)); }, [completedLessonIds]);

    const isAuthenticated = !!localStorage.getItem('access_token');
    const enrolledCourses = ALL_COURSES.filter(c => enrolledCourseIds.includes(c.id));

    const handleEnrollFree = (course) => {
        if (!enrolledCourseIds.includes(course.id)) setEnrolledCourseIds(prev => [...prev, course.id]);
        setSelectedCourse(course);
        setActiveLesson(course.lessons[0]);
    };
    const handlePaymentSuccess = (course) => {
        setPurchasedCourseIds(prev => [...prev, course.id]);
        setEnrolledCourseIds(prev => prev.includes(course.id) ? prev : [...prev, course.id]);
        setSelectedCourse(course);
        setActiveLesson(course.lessons[0]);
        setPaymentCourse(null);
        setShowQR(false);
    };
    const handleResume = (course) => {
        setSelectedCourse(course);
        setActiveLesson(course.lessons[0]);
    };
    const toggleLessonCompletion = (lessonId) => {
        setCompletedLessonIds(prev =>
            prev.includes(lessonId) ? prev.filter(id => id !== lessonId) : [...prev, lessonId]
        );
    };

    useEffect(() => {
        if (!selectedCourse || certificateCourse) return;
        const allDone = selectedCourse.lessons.every(l => completedLessonIds.includes(l.id));
        if (allDone && selectedCourse.lessons.length > 0) {
            const certKey = `cert_shown_${username}_${selectedCourse.id}`;
            if (!sessionStorage.getItem(certKey)) {
                sessionStorage.setItem(certKey, '1');
                setCertificateCourse(selectedCourse);
            }
        }
    }, [completedLessonIds, selectedCourse]);

    useEffect(() => {
        const certId = localStorage.getItem('open_cert');
        if (certId) {
            localStorage.removeItem('open_cert');
            const course = ALL_COURSES.find(c => String(c.id) === certId);
            if (course) setCertificateCourse(course);
        }
    }, [ALL_COURSES]);

    const handleAdminCourseCreated = (course) => {
        setAdminCourses(prev => [...prev, course]);
    };

    useEffect(() => {
        const handleNewCourse = () => {
            const saved = localStorage.getItem('admin_courses');
            setAdminCourses(saved ? JSON.parse(saved) : []);
        };
        window.addEventListener('admin_course_created', handleNewCourse);
        return () => window.removeEventListener('admin_course_created', handleNewCourse);
    }, []);

    const handleCreateCourseClick = () => {
        if (!isAuthenticated) { navigate('/login'); return; }
        if (!isAdmin) {
            setShowAdminDenied(true);
            setTimeout(() => setShowAdminDenied(false), 3000);
            return;
        }
        setShowCreateModal(true);
    };

    // ── QR Payment Screen ─────────────────────────────────────────────────────
    if (paymentCourse && showQR) {
        return <QRPaymentScreen course={paymentCourse} onBack={() => setShowQR(false)} onSuccess={() => handlePaymentSuccess(paymentCourse)} />;
    }

    // ── Checkout Screen ───────────────────────────────────────────────────────
    if (paymentCourse) {
        return (
            <div className="max-w-2xl mx-auto mt-12 bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden">
                <div className="bg-indigo-900 p-8 text-white">
                    <button onClick={() => setPaymentCourse(null)} className="text-indigo-200 text-sm font-semibold hover:text-white mb-4 block">← Cancel Order</button>
                    <span className="text-xs uppercase font-bold tracking-widest text-indigo-300">Secure Checkout Gateway</span>
                    <h2 className="text-3xl font-black mt-1">Complete Your Enrollment</h2>
                </div>
                <div className="p-8 space-y-6">
                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div>
                            <p className="font-bold text-gray-900 text-lg">{paymentCourse.title}</p>
                            <p className="text-sm text-gray-400">{paymentCourse.duration} Core Modules</p>
                        </div>
                        <span className="text-2xl font-black text-indigo-600">${paymentCourse.price}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center">1</div>
                            <span className="text-sm font-bold text-indigo-600">Card Details</span>
                        </div>
                        <div className="flex-1 h-px bg-gray-200 mx-2" />
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-400 text-xs font-black flex items-center justify-center">2</div>
                            <span className="text-sm font-bold text-gray-400">Scan & Pay</span>
                        </div>
                    </div>
                    <form onSubmit={(e) => { e.preventDefault(); setShowQR(true); }} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Credit Card Number</label>
                            <input type="text" placeholder="4242 •••• •••• 4242" className="w-full px-4 py-3 rounded-xl border border-gray-200 font-mono text-lg focus:ring-2 focus:ring-indigo-500 outline-none" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Expiration Date</label>
                                <input type="text" placeholder="MM / YY" className="w-full px-4 py-3 rounded-xl border border-gray-200 font-mono text-center focus:ring-2 focus:ring-indigo-500 outline-none" required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">CVC Security Code</label>
                                <input type="text" placeholder="123" className="w-full px-4 py-3 rounded-xl border border-gray-200 font-mono text-center focus:ring-2 focus:ring-indigo-500 outline-none" required />
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl text-lg mt-4 shadow-lg shadow-indigo-100 transition">
                            Continue to Scan & Pay →
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // ── Video Classroom ───────────────────────────────────────────────────────
    if (selectedCourse) {
        const totalLessonsCount = selectedCourse.lessons.length;
        const finishedInThisCourse = selectedCourse.lessons.filter(l => completedLessonIds.includes(l.id)).length;
        const progressPercentage = totalLessonsCount > 0 ? Math.round((finishedInThisCourse / totalLessonsCount) * 100) : 0;
        const remainingAvailableCourses = ALL_COURSES.filter(c => c.id !== selectedCourse.id);
        const remainingAvailableLessons = selectedCourse.lessons.filter(l => l.id !== activeLesson?.id);
        const activeLessonCompleted = completedLessonIds.includes(activeLesson?.id);
        const courseFullyCompleted = progressPercentage === 100;

        return (
            <>
                {certificateCourse && (
                    <CertificateModal course={certificateCourse} username={username} onClose={() => setCertificateCourse(null)} />
                )}
                <div className="bg-gray-950 min-h-screen -m-6 p-6 text-white">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-b-gray-800">
                        <button onClick={() => { setSelectedCourse(null); setActiveLesson(null); }}
                            className="flex items-center gap-2 bg-gray-900 border border-gray-800 text-gray-300 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-800 transition">
                            ← Exit Classroom
                        </button>
                        <div className="flex items-center gap-3">
                            {courseFullyCompleted && (
                                <button onClick={() => setCertificateCourse(selectedCourse)}
                                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-bold px-4 py-2 rounded-xl text-sm transition shadow-lg shadow-amber-900/40">
                                    🎓 View Certificate
                                </button>
                            )}
                            <span className="bg-indigo-600/20 text-indigo-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{selectedCourse.category}</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-black rounded-2xl overflow-hidden border border-gray-800 aspect-video relative shadow-2xl">
                                {activeLesson ? <VideoPlayer key={activeLesson.id} lesson={activeLesson} /> : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-500">Select a lesson to begin</div>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-900/60 p-5 rounded-2xl border border-gray-800/80">
                                <div>
                                    <h4 className="text-xs uppercase tracking-wider font-bold text-indigo-400">Student Progress Matrix</h4>
                                    <div className="mt-3 flex justify-between items-center text-sm">
                                        <span className="text-gray-300 font-medium">Course Completion</span>
                                        <span className="font-mono text-emerald-400 font-bold">{progressPercentage}%</span>
                                    </div>
                                    <div className="w-full bg-gray-800 h-2.5 rounded-full mt-1.5 overflow-hidden">
                                        <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2">
                                        Completed <span className="text-white font-semibold">{finishedInThisCourse}</span> out of <span className="text-white font-semibold">{totalLessonsCount}</span> framework videos.
                                    </p>
                                    <div className="mt-4 pt-3 border-t border-gray-800">
                                        <button
                                            onClick={() => activeLesson && toggleLessonCompletion(activeLesson.id)}
                                            disabled={!activeLesson}
                                            className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                                                activeLessonCompleted
                                                    ? 'bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-600/30'
                                                    : 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white'
                                            }`}>
                                            {activeLessonCompleted ? (
                                                <><span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-black flex-shrink-0">✓</span><span>Lesson Completed</span></>
                                            ) : (
                                                <><span className="w-5 h-5 rounded-full border-2 border-gray-500 flex items-center justify-center flex-shrink-0" /><span>Mark as Completed</span></>
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-xs uppercase tracking-wider font-bold text-indigo-400">Remaining Available Catalogs ({remainingAvailableCourses.length})</h4>
                                    <div className="mt-2.5 max-h-[105px] overflow-y-auto space-y-1.5 pr-1">
                                        {remainingAvailableCourses.map(item => (
                                            <div key={item.id} onClick={() => { setSelectedCourse(item); setActiveLesson(item.lessons[0]); }}
                                                className="text-xs bg-gray-950/80 hover:bg-gray-800 p-2 rounded-lg border border-gray-800/50 flex items-center justify-between cursor-pointer transition">
                                                <span className="truncate font-medium text-gray-200 pr-2">{item.title}</span>
                                                <span className="text-[10px] shrink-0 font-bold bg-indigo-950 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-900/40">{item.duration}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-gray-100">{activeLesson?.title}</h2>
                                <p className="text-gray-400 mt-2 text-sm leading-relaxed">{selectedCourse.description}</p>
                            </div>
                            <div className="bg-gray-900/40 p-5 rounded-2xl border border-gray-800/60">
                                <h3 className="font-bold text-base text-gray-200 mb-3 flex items-center gap-2">
                                    <span>📋</span> Remaining Available Lessons ({remainingAvailableLessons.length})
                                </h3>
                                {remainingAvailableLessons.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {remainingAvailableLessons.map(lesson => (
                                            <div key={lesson.id} onClick={() => setActiveLesson(lesson)}
                                                className="p-3 rounded-xl bg-gray-950/40 hover:bg-gray-900 border border-gray-800/40 hover:border-gray-700 cursor-pointer flex items-center justify-between group transition">
                                                <div className="flex items-center gap-3 truncate">
                                                    <span className="text-xs text-gray-500 font-bold group-hover:text-indigo-400">▶</span>
                                                    <span className="text-xs font-medium text-gray-300 group-hover:text-white truncate">{lesson.title}</span>
                                                </div>
                                                <span className="text-[11px] font-mono text-gray-500 bg-gray-950 px-2 py-0.5 rounded border border-gray-800 shrink-0 ml-2">{lesson.duration}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-500 italic">No remaining lessons. You are viewing the final module.</p>
                                )}
                            </div>
                        </div>
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 h-[calc(100vh-140px)] overflow-y-auto">
                            <h3 className="font-extrabold text-lg text-gray-200 border-b border-gray-800 pb-3 mb-3">Course Curriculum</h3>
                            <div className="space-y-2">
                                {selectedCourse.lessons.map((lesson) => {
                                    const isActive = activeLesson?.id === lesson.id;
                                    const isChecked = completedLessonIds.includes(lesson.id);
                                    return (
                                        <button key={lesson.id} onClick={() => setActiveLesson(lesson)}
                                            className={`w-full text-left p-4 rounded-xl flex items-center justify-between transition-all ${
                                                isActive ? 'bg-indigo-600 border border-indigo-500 text-white shadow-lg' : 'bg-gray-950/60 text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                                            }`}>
                                            <div className="flex items-center gap-2.5 truncate pr-2">
                                                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 ${
                                                    isChecked ? 'bg-emerald-500 text-white' : isActive ? 'bg-white/20 text-white' : 'border border-gray-600 text-gray-600'
                                                }`}>{isChecked ? '✓' : ''}</span>
                                                <span className="text-sm font-semibold truncate">{lesson.title}</span>
                                            </div>
                                            <span className="text-xs shrink-0 font-mono opacity-80">{lesson.duration}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // ── Main Catalog / My Courses View ────────────────────────────────────────
    return (
        <>
            {certificateCourse && (
                <CertificateModal course={certificateCourse} username={username} onClose={() => setCertificateCourse(null)} />
            )}

            {showCreateModal && (
                <CreateCourseModal
                    onClose={() => setShowCreateModal(false)}
                    onCourseCreated={handleAdminCourseCreated}
                />
            )}

            <div className="max-w-7xl mx-auto py-4 px-4 md:px-6 w-full">
                {/* Top bar */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Learning Portal</h1>
                            {isAdmin && (
                                <span className="bg-indigo-600 text-white text-xs font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">Admin</span>
                            )}
                        </div>
                        <p className="text-gray-500 mt-1 text-base">Explore courses or pick up where you left off.</p>
                    </div>

                    {/* Create Course Button */}
                    <div className="relative flex-shrink-0">
                        <button
                            onClick={handleCreateCourseClick}
                            className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 shadow-md
                                ${isAdmin
                                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 hover:scale-105 active:scale-95'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-500'
                                }`}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            Create Course
                            {isAdmin && (
                                <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
                            )}
                        </button>

                        {showAdminDenied && (
                            <div className="absolute top-12 right-0 w-64 bg-gray-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl border border-gray-700 z-50"
                                style={{ animation: 'fadeInDown 0.2s ease forwards' }}>
                                <div className="flex items-center gap-2">
                                    <span className="text-red-400 text-base">🔒</span>
                                    <div>
                                        <p className="font-bold text-white">Admin Access Only</p>
                                        <p className="text-gray-400 mt-0.5">Only superusers can create courses.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 mb-8 border-b border-gray-200 pb-0">
                    <button onClick={() => setActiveTab('explore')}
                        className={`px-5 py-3 text-sm font-bold rounded-t-xl transition border-b-2 -mb-px ${
                            activeTab === 'explore' ? 'border-indigo-600 text-indigo-600 bg-indigo-50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}>
                        🌐 Explore Courses
                    </button>
                    <button onClick={() => setActiveTab('my-courses')}
                        className={`px-5 py-3 text-sm font-bold rounded-t-xl transition border-b-2 -mb-px flex items-center gap-2 ${
                            activeTab === 'my-courses' ? 'border-indigo-600 text-indigo-600 bg-indigo-50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}>
                        🎓 My Courses
                        {enrolledCourses.length > 0 && (
                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${activeTab === 'my-courses' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                {enrolledCourses.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* My Courses Tab */}
                {activeTab === 'my-courses' && (
                    <div>
                        {enrolledCourses.length === 0 ? (
                            <div className="text-center py-24 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                <div className="text-5xl mb-4">📚</div>
                                <h3 className="text-xl font-black text-gray-700">No courses yet</h3>
                                <p className="text-gray-400 mt-2 mb-6">Enroll in a free course or purchase a premium one to get started.</p>
                                <button onClick={() => setActiveTab('explore')}
                                    className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100">
                                    Browse Courses →
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                    {[
                                        { label: 'Enrolled', value: enrolledCourses.length, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                                        { label: 'In Progress', value: enrolledCourses.filter(c => {
                                            const done = c.lessons.filter(l => completedLessonIds.includes(l.id)).length;
                                            return done > 0 && done < c.lessons.length;
                                        }).length, color: 'text-amber-600', bg: 'bg-amber-50' },
                                        { label: 'Completed', value: enrolledCourses.filter(c => c.lessons.every(l => completedLessonIds.includes(l.id))).length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                        { label: 'Lessons Done', value: completedLessonIds.length, color: 'text-purple-600', bg: 'bg-purple-50' },
                                    ].map(stat => (
                                        <div key={stat.label} className={`${stat.bg} rounded-xl p-4 border border-white shadow-sm`}>
                                            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                                            <p className="text-xs text-gray-500 font-semibold mt-0.5">{stat.label}</p>
                                        </div>
                                    ))}
                                </div>

                                {enrolledCourses.some(c => c.lessons.every(l => completedLessonIds.includes(l.id))) && (
                                    <div className="mb-8 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-5">
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="text-xl">🏆</span>
                                            <h3 className="font-black text-gray-900 text-base">My Certificates</h3>
                                            <span className="text-xs font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full">
                                                {enrolledCourses.filter(c => c.lessons.every(l => completedLessonIds.includes(l.id))).length}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            {enrolledCourses.filter(c => c.lessons.every(l => completedLessonIds.includes(l.id))).map(c => (
                                                <button key={c.id} onClick={() => setCertificateCourse(c)}
                                                    className="flex items-center gap-2.5 bg-white hover:bg-amber-50 border border-amber-200 hover:border-amber-400 text-gray-800 font-semibold text-sm px-4 py-2.5 rounded-xl transition shadow-sm hover:shadow-md active:scale-95">
                                                    <span className="text-base">📜</span>
                                                    <span className="max-w-[180px] truncate">{c.title}</span>
                                                    <span className="text-amber-500 font-black text-xs ml-1">View →</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {enrolledCourses.map(course => (
                                        <EnrolledCourseCard key={course.id} course={course} completedLessonIds={completedLessonIds}
                                            onResume={handleResume} onViewCertificate={(c) => setCertificateCourse(c)} username={username} />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Explore Tab */}
                {activeTab === 'explore' && (
                    <div>
                        {/* Hero Banner */}
<div className="relative rounded-2xl overflow-hidden mb-8"
    style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4f46e5 100%)' }}>
    <div className="absolute inset-0 opacity-20"
        style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        }}
    />
    <div className="relative z-10 px-10 py-12 max-w-xl">
        <h2 className="text-3xl font-black text-white leading-tight mb-3">
            Skills that start careers
        </h2>
        <p className="text-indigo-200 text-sm mb-6 leading-relaxed">
            Learn from expert instructors, earn certificates, and advance your career with our world-class courses.
        </p>
        <button
    onClick={() => document.getElementById('course-grid').scrollIntoView({ behavior: 'smooth' })}
    className="bg-white text-indigo-700 font-black px-6 py-3 rounded-xl text-sm hover:bg-indigo-50 transition shadow-lg">
    Explore All Career Accelerators →
</button>
    </div>
</div>
                        

                        {/* Course Grid */}
                        <div id="course-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {ALL_COURSES.map((course) => {
                                const isPaid = course.price > 0;
                                const isPurchased = purchasedCourseIds.includes(course.id);
                                const isEnrolled = enrolledCourseIds.includes(course.id);
                                return (
                                    <div key={course.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all border border-gray-100 flex flex-col justify-between">
                                        <div className="h-48 bg-gray-100 relative">
                                            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                                            <span className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-indigo-600 uppercase tracking-widest border border-gray-100">
                                                {course.level}
                                            </span>
                                            {isEnrolled && (
                                                <span className="absolute top-4 left-4 bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider">✓ Enrolled</span>
                                            )}
                                            {course.adminCreated && (
                                                <span className="absolute bottom-3 left-3 bg-indigo-600 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider">Admin Created</span>
                                            )}
                                        </div>
                                        <div className="p-6 flex-1 flex flex-col justify-between">
                                            <div>
                                                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">{course.category}</span>
                                                <h3 className="text-xl font-bold text-gray-900 mt-3 line-clamp-2 min-h-[56px]">{course.title}</h3>
                                                <p className="text-gray-500 text-sm mt-2 line-clamp-3">{course.description}</p>
                                            </div>
                                            <div className="mt-6 pt-4 border-t border-gray-50">
                                                <div className="flex justify-between items-center mb-4">
                                                    {!isPaid ? (
                                                        <span className="text-2xl font-black text-emerald-600 tracking-tight">FREE</span>
                                                    ) : isPurchased ? (
                                                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">Purchased ✓</span>
                                                    ) : (
                                                        <span className="text-2xl font-black text-gray-900">${course.price}</span>
                                                    )}
                                                    <span className="text-xs font-semibold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">{course.duration}</span>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        if (!isAuthenticated) { navigate('/login'); return; }
                                                        if (isEnrolled) { setSelectedCourse(course); setActiveLesson(course.lessons[0]); }
                                                        else if (isPaid && !isPurchased) { setPaymentCourse(course); }
                                                        else { handleEnrollFree(course); }
                                                    }}
                                                    className={`w-full text-center py-3 rounded-xl font-bold transition shadow-md ${
                                                        isEnrolled ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100'
                                                    }`}>
                                                    {isEnrolled ? '▶ Continue Learning' : isPaid && !isPurchased ? 'Unlock Premium Course 💳' : 'Enroll Free & Start →'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes fadeInDown {
                    from { opacity: 0; transform: translateY(-6px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </>
    );
}

export default Dashboard;
