import React, { useState, useEffect } from 'react';
import { dbAuth } from '../services/db';
import { UserProfile } from '../types';
import { Lock, Award, Sparkles, AlertCircle, Eye, EyeOff, BookOpen, Layers, User } from 'lucide-react';

interface AuthViewProps {
  onAuthSuccess: (profile: UserProfile, isDemo: boolean) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [registerNumber, setRegisterNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaText, setCaptchaText] = useState('');
  const [captchaImg, setCaptchaImg] = useState('');
  const [cookie, setCookie] = useState('');
  const [loadingCaptcha, setLoadingCaptcha] = useState(false);

  const fetchCaptcha = async () => {
    setLoadingCaptcha(true);
    try {
      const res = await fetch('/api/captcha');
      const data = await res.json();
      if (data.image) {
        setCaptchaImg(data.image);
        setCookie(data.cookie);
      }
    } catch (e) {
      console.error('Failed to load captcha', e);
    } finally {
      setLoadingCaptcha(false);
    }
  };

  useEffect(() => {
    if (isLogin) {
      fetchCaptcha();
    }
  }, [isLogin]);

  // Register-only fields
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [semester, setSemester] = useState(1);
  const [section, setSection] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!registerNumber.trim()) {
      setError('Please enter your Student Registration Number.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    if (isLogin && !captchaText) {
      setError('Please enter the captcha.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const { profile, error: err } = await dbAuth.signIn(registerNumber, password, captchaText, cookie);
        if (err) throw err;
        if (profile) onAuthSuccess(profile, dbAuth.isDemoMode);
      } else {
        if (!name.trim()) { setError('Please enter your full name.'); setLoading(false); return; }
        if (!department.trim()) { setError('Please enter your department.'); setLoading(false); return; }
        if (!section.trim()) { setError('Please enter your section.'); setLoading(false); return; }

        const { profile, error: err } = await dbAuth.signUp(
          registerNumber,
          password,
          name,
          { department, semester: Number(semester), section }
        );
        if (err) throw err;
        if (profile) onAuthSuccess(profile, dbAuth.isDemoMode);
      }
    } catch (err: any) {
      const msg: string = err?.message || err?.error_description || JSON.stringify(err) || '';
      // Friendly override for known errors
      if (msg.includes('already registered') || msg.includes('already exists')) {
        setError('This registration number is already registered. Try signing in instead.');
      } else if (msg.includes('Invalid login credentials')) {
        setError('Incorrect registration number or password. Please check and try again.');
      } else if (msg.includes('Email not confirmed') || msg.includes('Confirm email')) {
        setError('⚠️ Account not yet activated. Please contact your administrator.');
      } else if (msg.toLowerCase().includes('rate limit')) {
        setError('⚠️ Too many attempts. Please wait a moment and try again.');
      } else {
        setError(msg || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-cozy-cream relative overflow-hidden font-sans">
      {/* Soft pastel glow orbs */}
      <div className="absolute top-[-15%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-brand-light blur-[140px] opacity-60 pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-cozy-blue blur-[160px] opacity-50 pointer-events-none" />
      <div className="absolute top-[35%] right-[5%] w-[35vw] h-[35vw] rounded-full bg-cozy-peach blur-[130px] opacity-40 pointer-events-none" />

      <div className="w-full max-w-md animate-slide-up relative z-10">

        {/* College Header Card */}
        <div className="text-center mb-6">
          {/* RKMVC Crest placeholder */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-brand-cozy to-brand-dark shadow-cozy-hover mb-3 border-4 border-white">
            <span className="text-3xl">🎓</span>
          </div>
          <h1 className="text-xl font-extrabold font-display text-slate-800 tracking-tight">RKMVC – AIMS</h1>
          <p className="text-sm font-semibold text-brand-cozy mt-0.5">OD & Attendance Manager</p>
          <p className="text-[10px] text-slate-400 mt-1">Sri Ramakrishna Mission Vidyalaya College of Arts &amp; Science</p>
        </div>

        {/* Main Card */}
        <div className="glass-dark rounded-cozy-xl p-7 shadow-cozy-hover border border-white/60">

          {/* Demo mode banner */}
          {dbAuth.isDemoMode && (
            <div className="mb-5 flex items-center gap-2 p-3 bg-brand-light/80 text-brand-dark rounded-cozy-lg text-xs font-semibold border border-brand-cozy/15 animate-pulse">
              <Sparkles className="w-4 h-4 text-brand-cozy flex-shrink-0" />
              <span>Demo Mode: offline localStorage database active. Supabase keys not configured.</span>
            </div>
          )}

          {/* Tab Switcher */}
          <div className="flex bg-slate-100 rounded-cozy-lg p-1 mb-6">
            <button
              onClick={() => { setIsLogin(true); setError(null); }}
              className={`flex-1 py-2 rounded-[14px] text-xs font-bold transition-all ${
                isLogin ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(null); }}
              className={`flex-1 py-2 rounded-[14px] text-xs font-bold transition-all ${
                !isLogin ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 flex items-center gap-2.5 p-3 bg-cozy-peach text-cozy-peach-dark rounded-cozy-lg text-xs font-semibold border border-cozy-peach-dark/10 animate-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Registration Number — always shown */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">
                Student Registration Number
              </label>
              <div className="relative">
                <Award className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  id="reg_number_input"
                  name="username"
                  autoComplete="username"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                  value={registerNumber}
                  onChange={(e) => setRegisterNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 2413281033018"
                  maxLength={20}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/80 border border-slate-200 focus:border-brand-cozy focus:ring-1 focus:ring-brand-cozy outline-none rounded-cozy-lg transition-all text-slate-700 font-bold tracking-wider placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 text-sm"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1 ml-1">
                Numbers only — same as your AIMS portal registration number
              </p>
            </div>

            {/* Extra fields for sign-up */}
            {!isLogin && (
              <>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full pl-10 pr-4 py-2.5 bg-white/80 border border-slate-200 focus:border-brand-cozy focus:ring-1 focus:ring-brand-cozy outline-none rounded-cozy-lg transition-all text-slate-700 placeholder-slate-400 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">Department</label>
                    <div className="relative">
                      <BookOpen className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder="e.g. MCS"
                        className="w-full pl-10 pr-3 py-2.5 bg-white/80 border border-slate-200 focus:border-brand-cozy focus:ring-1 focus:ring-brand-cozy outline-none rounded-cozy-lg transition-all text-slate-700 placeholder-slate-400 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">Section</label>
                    <div className="relative">
                      <Layers className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={section}
                        onChange={(e) => setSection(e.target.value.toUpperCase())}
                        placeholder="e.g. A"
                        className="w-full pl-10 pr-3 py-2.5 bg-white/80 border border-slate-200 focus:border-brand-cozy focus:ring-1 focus:ring-brand-cozy outline-none rounded-cozy-lg transition-all text-slate-700 placeholder-slate-400 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">Semester</label>
                  <div className="relative">
                    <Layers className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <select
                      value={semester}
                      onChange={(e) => setSemester(Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-2.5 bg-white/80 border border-slate-200 focus:border-brand-cozy focus:ring-1 focus:ring-brand-cozy outline-none rounded-cozy-lg transition-all text-slate-700 text-sm"
                    >
                      {[1,2,3,4,5,6,7,8].map(s => (
                        <option key={s} value={s}>Semester {s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Password */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  id="password_input"
                  name="password"
                  autoComplete="current-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your portal password"
                  className="w-full pl-10 pr-10 py-2.5 bg-white/80 border border-slate-200 focus:border-brand-cozy focus:ring-1 focus:ring-brand-cozy outline-none rounded-cozy-lg transition-all text-slate-700 placeholder-slate-400 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {isLogin && (
                <p className="text-[10px] text-slate-400 mt-1 ml-1">Use the same password as your AIMS portal</p>
              )}
            </div>

            {/* Captcha */}
            {isLogin && (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">Captcha</label>
                <div className="flex gap-3 mb-2">
                  <div className="flex-1 bg-white/50 rounded-cozy-lg border border-slate-200 overflow-hidden flex items-center justify-center min-h-[50px]">
                    {loadingCaptcha ? (
                      <span className="w-5 h-5 border-2 border-brand-cozy border-t-transparent rounded-full animate-spin" />
                    ) : captchaImg ? (
                      <img src={captchaImg} alt="captcha" className="h-full object-contain mix-blend-multiply" />
                    ) : (
                      <span className="text-xs text-slate-400">Failed to load</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={fetchCaptcha}
                    className="px-3 py-2 bg-slate-100 text-slate-600 rounded-cozy-lg hover:bg-slate-200 transition-colors text-xs font-bold"
                  >
                    Refresh
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={captchaText}
                  onChange={(e) => setCaptchaText(e.target.value)}
                  placeholder="Enter captcha text"
                  className="w-full px-4 py-2.5 bg-white/80 border border-slate-200 focus:border-brand-cozy focus:ring-1 focus:ring-brand-cozy outline-none rounded-cozy-lg transition-all text-slate-700 placeholder-slate-400 text-sm"
                />
              </div>
            )}

            {/* Submit */}
            <button
              id="auth_submit_btn"
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-brand-cozy to-brand-dark text-white font-bold font-display rounded-cozy-lg shadow-md hover:shadow-cozy-hover transition-all duration-200 mt-2 flex items-center justify-center gap-2 disabled:opacity-70 text-sm"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>{isLogin ? '→ Sign In' : 'Create Account'}</span>
              )}
            </button>
          </form>

          {/* Info note */}
          <div className="mt-5 p-3 bg-cozy-blue/50 rounded-cozy-lg border border-cozy-blue-dark/10 text-[10px] text-slate-500 leading-relaxed font-semibold">
            💡 Your credentials are <strong>never stored in plain text</strong>. Authentication is handled securely via Supabase. Your AIMS portal credentials are only used for the optional attendance sync feature.
          </div>
        </div>

        <p className="text-center text-[10px] text-slate-400 mt-4">
          College OD & Attendance Manager • RKMVC © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};
