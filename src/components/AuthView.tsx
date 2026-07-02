import React, { useState } from 'react';
import { dbAuth } from '../services/db';
import { UserProfile } from '../types';
import { Sparkles, GraduationCap, Lock, Mail, User, BookOpen, Layers, Award, AlertCircle } from 'lucide-react';

interface AuthViewProps {
  onAuthSuccess: (profile: UserProfile, isDemo: boolean) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Register fields
  const [name, setName] = useState('');
  const [registerNumber, setRegisterNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [semester, setSemester] = useState(1);
  const [section, setSection] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const { profile, error: err } = await dbAuth.signIn(email, password);
        if (err) throw err;
        if (profile) onAuthSuccess(profile, dbAuth.isDemoMode);
      } else {
        const details: Partial<UserProfile> = {
          register_number: registerNumber,
          department,
          semester: Number(semester),
          section,
        };
        const { profile, error: err } = await dbAuth.signUp(email, password, name, details);
        if (err) throw err;
        if (profile) onAuthSuccess(profile, dbAuth.isDemoMode);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-cozy-cream relative overflow-hidden font-sans">
      {/* Decorative Pastel Background Glows */}
      <div className="absolute top-[-10%] left-[-15%] w-[40vw] h-[40vw] rounded-full bg-brand-light blur-[120px] opacity-70" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-cozy-blue blur-[140px] opacity-60" />
      <div className="absolute top-[30%] right-[10%] w-[30vw] h-[30vw] rounded-full bg-cozy-peach blur-[120px] opacity-50" />

      {/* Main Container Card */}
      <div className="w-full max-w-lg glass-dark rounded-cozy-xl p-8 shadow-cozy relative z-10 animate-slide-up border border-white/60">
        
        {/* Mock Mode Alert Banner */}
        {dbAuth.isDemoMode && (
          <div className="mb-6 flex items-center gap-2 p-3 bg-brand-light/70 text-brand-dark rounded-cozy-lg text-xs font-semibold border border-brand-cozy/20 animate-pulse">
            <Sparkles className="w-4 h-4 text-brand-cozy flex-shrink-0" />
            <span>Running in Demo Mode: Offline localStorage database will be used.</span>
          </div>
        )}

        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-brand-light rounded-2xl text-brand-cozy mb-3 shadow-sm">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold font-display text-slate-800 tracking-tight">
            College OD & Attendance
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isLogin ? 'Welcome back! Let\'s check your analytics.' : 'Create an account to start tracking.'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 flex items-center gap-2 p-3 bg-cozy-peach text-cozy-peach-dark rounded-cozy-lg text-sm border border-cozy-peach-dark/10">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-2.5 bg-white/70 border border-slate-200 focus:border-brand-cozy focus:ring-1 focus:ring-brand-cozy outline-none rounded-cozy-lg transition-all text-slate-700 placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Student Details Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Register Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1 uppercase tracking-wider">Register No.</label>
                  <div className="relative">
                    <Award className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={registerNumber}
                      onChange={(e) => setRegisterNumber(e.target.value)}
                      placeholder="e.g. 23MCS012"
                      className="w-full pl-10 pr-4 py-2.5 bg-white/70 border border-slate-200 focus:border-brand-cozy focus:ring-1 focus:ring-brand-cozy outline-none rounded-cozy-lg transition-all text-slate-700 placeholder-slate-400"
                    />
                  </div>
                </div>

                {/* Department */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1 uppercase tracking-wider">Department</label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Comp. Science"
                      className="w-full pl-10 pr-4 py-2.5 bg-white/70 border border-slate-200 focus:border-brand-cozy focus:ring-1 focus:ring-brand-cozy outline-none rounded-cozy-lg transition-all text-slate-700 placeholder-slate-400"
                    />
                  </div>
                </div>

                {/* Semester */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1 uppercase tracking-wider">Semester</label>
                  <div className="relative">
                    <Layers className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <select
                      value={semester}
                      onChange={(e) => setSemester(Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-2.5 bg-white/70 border border-slate-200 focus:border-brand-cozy focus:ring-1 focus:ring-brand-cozy outline-none rounded-cozy-lg transition-all text-slate-700"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                        <option key={sem} value={sem}>Semester {sem}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Section */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1 uppercase tracking-wider">Section</label>
                  <div className="relative">
                    <Layers className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                      placeholder="e.g. A or B"
                      className="w-full pl-10 pr-4 py-2.5 bg-white/70 border border-slate-200 focus:border-brand-cozy focus:ring-1 focus:ring-brand-cozy outline-none rounded-cozy-lg transition-all text-slate-700 placeholder-slate-400"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@college.edu"
                className="w-full pl-10 pr-4 py-2.5 bg-white/70 border border-slate-200 focus:border-brand-cozy focus:ring-1 focus:ring-brand-cozy outline-none rounded-cozy-lg transition-all text-slate-700 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-white/70 border border-slate-200 focus:border-brand-cozy focus:ring-1 focus:ring-brand-cozy outline-none rounded-cozy-lg transition-all text-slate-700 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-cozy text-white font-semibold font-display rounded-cozy-lg shadow-md hover:bg-brand-dark transition-all duration-200 mt-2 hover:shadow-cozy-hover flex items-center justify-center gap-2 disabled:opacity-75"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
            )}
          </button>
        </form>

        {/* Toggle Login/Signup Toggler */}
        <div className="text-center mt-6">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="text-sm font-semibold text-brand-cozy hover:text-brand-dark hover:underline transition-all"
          >
            {isLogin ? 'Don\'t have an account? Sign Up' : 'Already have an account? Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
};
