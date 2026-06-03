import React, { useState, useEffect } from 'react';
import axios from 'react';
import { ArrowLeft, CheckCircle2, PlayCircle, BookOpen, Award, CheckCircle } from 'lucide-react';

function LessonViewer({ course, onBack }) {
  const [lessons, setLessons] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Track array of completed lesson IDs
  const [completedLessons, setCompletedLessons] = useState([]);

  useEffect(() => {
    axios.get(`http://127.0.0.1:8000/api/lessons/?course=${course.id}`)
      .then(res => {
        setLessons(res.data);
        if (res.data.length > 0) {
          setActiveLesson(res.data[0]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [course.id]);

  // Handler to toggle lesson completion
  const toggleComplete = (lessonId) => {
    if (completedLessons.includes(lessonId)) {
      setCompletedLessons(completedLessons.filter(id => id !== lessonId));
    } else {
      setCompletedLessons([...completedLessons, lessonId]);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );

  // Dynamic calculations for the progress indicators
  const totalLessons = lessons.length;
  const totalCompleted = completedLessons.length;
  const progressPercent = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

  return (
    <div className="py-2">
      {/* Navigation Line */}
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 transition mb-6 group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition" /> Back to Dashboard
      </button>

      {/* Hero Banner with Live Dynamic Progress Meter */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-8 text-white mb-8 shadow-xl relative border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="max-w-xl">
            <span className="bg-indigo-500/20 text-indigo-300 text-xs font-semibold px-3 py-1 rounded-full border border-indigo-500/30">
              Course In Progress
            </span>
            <h1 className="text-3xl font-bold mt-3 tracking-tight">{course.title}</h1>
            <p className="text-slate-300 text-sm mt-2 leading-relaxed">{course.description || "No customized description metadata mapped to this course module."}</p>
          </div>
          
          {/* Dynamic Progress Circular/Stat Card */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 min-w-[220px] space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-400">YOUR PROGRESS</span>
              <span className="text-indigo-400">{progressPercent}% Done</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
              <Award size={14} className="text-amber-400" /> {totalCompleted} of {totalLessons} modules cleared
            </p>
          </div>
        </div>
      </div>

      {lessons.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed border-gray-200 rounded-2xl max-w-xl mx-auto p-6 shadow-sm">
          <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mx-auto mb-4">
            <BookOpen size={24} />
          </div>
          <h3 className="text-base font-bold text-gray-900">No lessons uploaded yet</h3>
          <p className="text-gray-500 text-sm mt-1">This course is waiting for content rows in Django Admin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Video Stream Player Frame Console */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden shadow-md aspect-video flex flex-col justify-center items-center text-slate-400 relative group cursor-pointer">
              <PlayCircle size={56} className="text-indigo-500 group-hover:scale-110 transition duration-300" />
              <span className="mt-3 text-xs font-medium text-slate-400 tracking-wide">Streaming Content Engine Active</span>
            </div>
            
            {/* Context Card with Interactive Checkpoint Trigger */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-2 max-w-lg">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <BookOpen size={18} className="text-indigo-600" /> {activeLesson?.title}
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {activeLesson?.content || "No secondary notes provided for this snippet environment configuration module."}
                </p>
              </div>

              {/* Functional Interactive Complete Button */}
              <button 
                onClick={() => toggleComplete(activeLesson?.id)}
                className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm border ${
                  completedLessons.includes(activeLesson?.id)
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <CheckCircle2 size={16} className={completedLessons.includes(activeLesson?.id) ? 'text-emerald-600 fill-emerald-100' : 'text-gray-400'} />
                {completedLessons.includes(activeLesson?.id) ? 'Completed!' : 'Mark Complete'}
              </button>
            </div>
          </div>

          {/* Sidebar Modules List Drawer */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm h-fit">
            <h3 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-3 mb-4">
              Course Content ({totalLessons} chapters)
            </h3>
            <div className="space-y-2">
              {lessons.map((lesson, idx) => {
                const isCurrent = activeLesson?.id === lesson.id;
                const isFinished = completedLessons.includes(lesson.id);
                
                return (
                  <div 
                    key={lesson.id}
                    onClick={() => setActiveLesson(lesson)}
                    className={`p-3 rounded-xl border flex items-start justify-between gap-3 transition cursor-pointer ${
                      isCurrent 
                        ? 'border-indigo-600 bg-indigo-50/30 font-medium' 
                        : 'border-gray-100 hover:bg-gray-50/80'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <PlayCircle size={16} className={`shrink-0 mt-0.5 ${isCurrent ? 'text-indigo-600' : 'text-gray-400'}`} />
                      <h4 className={`text-xs leading-tight ${isCurrent ? 'text-indigo-950 font-bold' : 'text-gray-700'} ${isFinished ? 'line-through text-gray-400' : ''}`}>
                        {idx + 1}. {lesson.title}
                      </h4>
                    </div>
                    
                    {/* Visual Checkmark indicator inside list menu row */}
                    {isFinished && (
                      <CheckCircle size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LessonViewer;