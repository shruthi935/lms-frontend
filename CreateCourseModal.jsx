import React, { useState, useEffect } from 'react';

// ── Curated high-quality Unsplash thumbnails per category ─────────────────────
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

const STEPS = ['Course Info', 'Thumbnail', 'First Lesson', 'Review'];

function StepIndicator({ current }) {
    return (
        <div className="flex items-center justify-center gap-0 mb-8">
            {STEPS.map((label, i) => (
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
                    {i < STEPS.length - 1 && (
                        <div className={`w-12 h-0.5 mb-4 mx-1 transition-all duration-500 ${i < current ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}

function CreateCourseModal({ onClose }) {
    const [step, setStep] = useState(0);
    const [published, setPublished] = useState(false);

    const [form, setForm] = useState({
        title: '',
        description: '',
        category: 'Development',
        level: 'Beginner',
        duration: '',
        price: '',
        thumbnail: '',
        customThumbnail: '',
        lessonTitle: '',
        lessonDuration: '',
        lessonVideoId: '',
    });

    // Auto-select first thumbnail when category changes
    useEffect(() => {
        setForm(f => ({ ...f, thumbnail: CATEGORY_THUMBNAILS[f.category][0] }));
    }, [form.category]);

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const activeThumbnail = form.customThumbnail || form.thumbnail;

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

        // Dispatch a storage event so Dashboard re-reads without page reload
        window.dispatchEvent(new Event('admin_course_created'));

        setPublished(true);
        setTimeout(() => onClose(), 2200);
    };

    // ── Success Screen ────────────────────────────────────────────────────────
    if (published) {
        return (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-sm w-full text-center">
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5 text-4xl animate-bounce">
                        🚀
                    </div>
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
                {/* Header */}
                <div className="sticky top-0 bg-white z-10 px-8 pt-7 pb-4 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-gray-900 leading-tight">Create New Course</h2>
                                <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">Admin Panel</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition text-lg font-bold">
                            ✕
                        </button>
                    </div>
                    <StepIndicator current={step} />
                </div>

                <div className="px-8 py-6">

                    {/* ── STEP 0: Course Info ─────────────────────────────── */}
                    {step === 0 && (
                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Course Title *</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={e => set('title', e.target.value)}
                                    placeholder="e.g. Advanced TypeScript Mastery"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-semibold"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Description</label>
                                <textarea
                                    rows={3}
                                    value={form.description}
                                    onChange={e => set('description', e.target.value)}
                                    placeholder="What will students learn? Keep it compelling and specific..."
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Category</label>
                                    <select
                                        value={form.category}
                                        onChange={e => set('category', e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                    >
                                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Level</label>
                                    <select
                                        value={form.level}
                                        onChange={e => set('level', e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                    >
                                        {LEVELS.map(l => <option key={l}>{l}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Duration</label>
                                    <input
                                        type="text"
                                        value={form.duration}
                                        onChange={e => set('duration', e.target.value)}
                                        placeholder="e.g. 12 Hours"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Price (0 = Free)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">$</span>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={form.price}
                                            onChange={e => set('price', e.target.value)}
                                            placeholder="0.00"
                                            className="w-full pl-7 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => { if (form.title.trim()) setStep(1); }}
                                disabled={!form.title.trim()}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3.5 rounded-xl text-sm transition shadow-lg shadow-indigo-100 mt-2"
                            >
                                Next: Choose Thumbnail →
                            </button>
                        </div>
                    )}

                    {/* ── STEP 1: Thumbnail ───────────────────────────────── */}
                    {step === 1 && (
                        <div className="space-y-5">
                            <div>
                                <h3 className="text-sm font-black text-gray-700 mb-1">Suggested for <span className="text-indigo-600">{form.category}</span></h3>
                                <p className="text-xs text-gray-400 mb-4">Click a thumbnail to select it, or paste your own URL below.</p>

                                <div className="grid grid-cols-2 gap-3">
                                    {CATEGORY_THUMBNAILS[form.category].map((url, i) => (
                                        <button
                                            key={i}
                                            onClick={() => { set('thumbnail', url); set('customThumbnail', ''); }}
                                            className={`relative rounded-2xl overflow-hidden h-32 transition-all duration-200 group
                                                ${form.thumbnail === url && !form.customThumbnail
                                                    ? 'ring-3 ring-indigo-600 ring-offset-2 scale-[1.02] shadow-xl'
                                                    : 'hover:scale-[1.01] hover:shadow-lg opacity-80 hover:opacity-100'}`}
                                        >
                                            <img src={url} alt="" className="w-full h-full object-cover" />
                                            {form.thumbnail === url && !form.customThumbnail && (
                                                <div className="absolute inset-0 bg-indigo-600/20 flex items-center justify-center">
                                                    <div className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shadow-lg">✓</div>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Custom URL */}
                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Or Use Custom URL</label>
                                <input
                                    type="url"
                                    value={form.customThumbnail}
                                    onChange={e => set('customThumbnail', e.target.value)}
                                    placeholder="https://images.unsplash.com/..."
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>

                            {/* Live preview */}
                            {activeThumbnail && (
                                <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-md">
                                    <div className="relative h-40">
                                        <img src={activeThumbnail} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                        <div className="absolute bottom-3 left-3 right-3">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-white/80 bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded">{form.category}</span>
                                            <p className="text-white font-bold text-sm mt-1 line-clamp-1">{form.title || 'Course Title'}</p>
                                        </div>
                                        <div className="absolute top-3 right-3 bg-white/90 px-2 py-0.5 rounded-full text-[10px] font-bold text-indigo-600 uppercase">{form.level}</div>
                                    </div>
                                    <div className="bg-white px-4 py-3">
                                        <p className="text-xs text-gray-500 italic">Live card preview</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button onClick={() => setStep(0)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl text-sm transition">
                                    ← Back
                                </button>
                                <button
                                    onClick={() => setStep(2)}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-sm transition shadow-lg shadow-indigo-100"
                                >
                                    Next: Add Lesson →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 2: First Lesson ────────────────────────────── */}
                    {step === 2 && (
                        <div className="space-y-5">
                            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
                                <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">First Lesson Details</p>
                                <p className="text-xs text-gray-400 mt-0.5">You can add more lessons after publishing from the course editor.</p>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Lesson Title *</label>
                                <input
                                    type="text"
                                    value={form.lessonTitle}
                                    onChange={e => set('lessonTitle', e.target.value)}
                                    placeholder="e.g. 01. Introduction & Setup"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-semibold"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Duration (MM:SS)</label>
                                    <input
                                        type="text"
                                        value={form.lessonDuration}
                                        onChange={e => set('lessonDuration', e.target.value)}
                                        placeholder="12:30"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">YouTube Video ID</label>
                                    <input
                                        type="text"
                                        value={form.lessonVideoId}
                                        onChange={e => set('lessonVideoId', e.target.value)}
                                        placeholder="e.g. dQw4w9WgXcQ"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                                    />
                                </div>
                            </div>

                            {form.lessonVideoId && (
                                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-xs text-gray-500 flex items-center gap-2">
                                    <span className="text-red-500 text-base">▶</span>
                                    Video ID: <span className="font-mono font-bold text-gray-700">{form.lessonVideoId}</span>
                                    <span className="text-gray-300">→</span>
                                    <a href={`https://youtube.com/watch?v=${form.lessonVideoId}`} target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline">Preview on YouTube ↗</a>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button onClick={() => setStep(1)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl text-sm transition">
                                    ← Back
                                </button>
                                <button
                                    onClick={() => setStep(3)}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-sm transition shadow-lg shadow-indigo-100"
                                >
                                    Next: Review →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 3: Review & Publish ────────────────────────── */}
                    {step === 3 && (
                        <div className="space-y-5">
                            {/* Course card preview */}
                            <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                                <div className="relative h-44">
                                    <img src={activeThumbnail} alt="" className="w-full h-full object-cover" />
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

                            {/* Lesson summary */}
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
                                <button onClick={() => setStep(2)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl text-sm transition">
                                    ← Back
                                </button>
                                <button
                                    onClick={handlePublish}
                                    className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold py-3 rounded-xl text-sm transition shadow-xl shadow-indigo-200 flex items-center justify-center gap-2"
                                >
                                    🚀 Publish Course
                                </button>
                            </div>

                            <p className="text-center text-xs text-gray-400">Course will appear immediately in the dashboard for all users.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CreateCourseModal;
