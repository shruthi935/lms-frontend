import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Play, Clock, ArrowRight, BookOpen } from 'lucide-react';

function CourseList({ onSelectCourse }) {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('https://lms-backend-l0kr.onrender.com')
            .then(res => { 
                setCourses(res.data); 
                setLoading(false); 
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome back, Shruthi!</h1>
                    <p className="text-gray-500 text-sm mt-1">Explore your enrolled classes and pick up where you left off.</p>
                </div>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-4 py-2.5 rounded-xl transition flex items-center gap-2 shadow-sm shadow-indigo-100">
                    Explore All <ArrowRight size={16} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.length === 0 ? (
                    <div className="col-span-full text-center py-12 bg-white border border-dashed border-gray-200 rounded-2xl">
                        <p className="text-gray-500">No courses found. Go to Django admin to add some!</p>
                    </div>
                ) : (
                    courses.map(course => (
                        <div 
                            key={course.id} 
                            onClick={() => onSelectCourse(course)}
                            className="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300 cursor-pointer"
                        >
                            {/* Fake thumbnail overlay */}
                            <div className="h-44 bg-gradient-to-br from-indigo-500 to-purple-600 relative p-6 flex flex-col justify-between text-white">
                                <span className="bg-white/20 backdrop-blur-md text-xs font-semibold px-2.5 py-1 rounded-md self-start">
                                    {course.category || "Programming"}
                                </span>
                                <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition duration-300">
                                    <Play size={20} className="fill-white translate-x-0.5" />
                                </div>
                            </div>

                            {/* Details */}
                            <div className="p-5">
                                <h3 className="font-bold text-gray-900 text-lg group-hover:text-indigo-600 transition truncate">
                                    {course.title}
                                </h3>
                                <p className="text-gray-500 text-sm mt-1.5 line-clamp-2 h-10">
                                    {course.description || "No description provided for this specific learning pathway."}
                                </p>

                                <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-between text-xs font-medium text-gray-500">
                                    <span className="flex items-center gap-1"><Clock size={14} /> 8 Weeks</span>
                                    <span className="flex items-center gap-1"><BookOpen size={14} /> 12 Lessons</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default CourseList;