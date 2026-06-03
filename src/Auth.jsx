import React, { useState } from 'react';
import { BookOpen, Mail, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';

function Auth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // For now, we will simulate a successful login to let you test the dashboard flow
    onLoginSuccess({ name: name || 'Shruthi', email });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-stretch">
      {/* Left Side: Eye-Catching Visual Panel (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-12 flex-col justify-between text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent)] pointer-events-none" />
        
        {/* Brand Logo */}
        <div className="flex items-center gap-2 relative z-10">
          <div className="bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/20">
            <BookOpen size={24} />
          </div>
          <span className="font-bold text-xl tracking-wide">EduStream</span>
        </div>

        {/* Big Marketing Hook */}
        <div className="space-y-4 relative z-10 max-w-md">
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
            Master your skills with interactive streaming.
          </h1>
          <p className="text-indigo-100 text-sm leading-relaxed">
            Access thousands of micro-lessons, track your learning checkpoints, and build real-world experience through connected database projects.
          </p>
        </div>

        {/* Bottom trust footer */}
        <div className="flex items-center gap-2 text-xs text-indigo-100 relative z-10">
          <ShieldCheck size={16} /> Fully compliant secure learning workspace ecosystem.
        </div>
      </div>

      {/* Right Side: Interactive Dynamic Form Container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              {isLogin ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              {isLogin ? 'Glad to have you back! Access your dashboard path.' : 'Get started by configuring your portal path.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 tracking-wide block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="John Doe" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 tracking-wide block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="email" 
                  placeholder="name@domain.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 tracking-wide block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition"
                />
              </div>
            </div>

            {isLogin && (
              <div className="text-right">
                <button type="button" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition">
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm py-2.5 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 group mt-2">
              {isLogin ? 'Sign In' : 'Register Account'} 
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition" />
            </button>
          </form>

          {/* Toggle Links */}
          <div className="text-center text-sm text-gray-500 pt-2 border-t border-gray-100">
            {isLogin ? "Don't have an account yet? " : "Already configured an account? "}
            <button 
              type="button" 
              onClick={() => setIsLogin(!isLogin)}
              className="font-semibold text-indigo-600 hover:text-indigo-700 transition"
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;