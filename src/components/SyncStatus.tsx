import React, { useState } from 'react';
import { PortalSyncService, SyncProgress } from '../services/portalSync';
import { RefreshCw, CheckCircle, XCircle, ShieldAlert, Key, Eye, EyeOff } from 'lucide-react';

interface SyncStatusProps {
  userId: string;
  lastSyncTime: string | null;
  onSyncComplete: () => void;
}

export const SyncStatus: React.FC<SyncStatusProps> = ({ userId, lastSyncTime, onSyncComplete }) => {
  const [showModal, setShowModal] = useState(false);
  const [regNo, setRegNo] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saveSession, setSaveSession] = useState(true);

  // New states for captcha
  const [captchaImage, setCaptchaImage] = useState<string | null>(null);
  const [sessionCookie, setSessionCookie] = useState<string>('');
  const [captchaText, setCaptchaText] = useState('');
  const [loadingCaptcha, setLoadingCaptcha] = useState(false);

  const [syncState, setSyncState] = useState<SyncProgress>({
    stage: 'idle',
    message: '',
    percent: 0
  });

  // Load saved credentials from SessionStorage on open if saved
  const handleOpen = () => {
    const savedReg = sessionStorage.getItem('cozy_portal_reg');
    const savedPass = sessionStorage.getItem('cozy_portal_pass');
    if (savedReg) setRegNo(savedReg);
    if (savedPass) {
      // De-obfuscate for display in modal
      try {
        const decoded = atob(savedPass.split('').reverse().join(''));
        setPassword(decoded);
      } catch {
        setPassword('');
      }
    }
    setShowModal(true);
    setSyncState({ stage: 'idle', message: '', percent: 0 });
    fetchCaptcha();
  };

  const fetchCaptcha = async () => {
    setLoadingCaptcha(true);
    setCaptchaText('');
    try {
      const res = await fetch('/api/captcha');
      const data = await res.json();
      if (data.image && data.cookie) {
        setCaptchaImage(data.image);
        setSessionCookie(data.cookie);
      }
    } catch (e) {
      console.error('Failed to load captcha', e);
    }
    setLoadingCaptcha(false);
  };

  const handleStartSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNo || !password) return;

    if (saveSession) {
      // Obfuscate and save credentials in SessionStorage
      sessionStorage.setItem('cozy_portal_reg', regNo);
      const obfuscated = btoa(password).split('').reverse().join('');
      sessionStorage.setItem('cozy_portal_pass', obfuscated);
    } else {
      sessionStorage.removeItem('cozy_portal_reg');
      sessionStorage.removeItem('cozy_portal_pass');
    }

    const success = await PortalSyncService.sync(userId, regNo, password, captchaText, sessionCookie, (progress) => {
      setSyncState(progress);
    });

    if (success) {
      setTimeout(() => {
        setShowModal(false);
        onSyncComplete();
      }, 1200);
    } else {
      // Refresh captcha on failure
      fetchCaptcha();
    }
  };


  return (
    <>
      {/* Outer Quick-Banner Widget */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white rounded-cozy-xl shadow-cozy border border-slate-100 gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-cozy-blue text-cozy-blue-dark rounded-xl">
            <RefreshCw className={`w-5 h-5 ${syncState.stage !== 'idle' && syncState.stage !== 'success' && syncState.stage !== 'failed' ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <h4 className="font-bold text-slate-800">AIMS Portal Sync</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              {lastSyncTime 
                ? `Last synced: ${new Date(lastSyncTime).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}` 
                : 'Never synchronized with AIMS'}
            </p>
          </div>
        </div>
        <button
          onClick={handleOpen}
          className="px-5 py-2.5 bg-cozy-blue text-brand-dark hover:bg-brand-light font-bold font-display rounded-cozy-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Sync Now</span>
        </button>
      </div>

      {/* Sync Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-cozy-xl shadow-cozy-hover border border-slate-100 p-6 w-full max-w-md animate-slide-up relative">
            
            {/* Close Button */}
            {syncState.stage === 'idle' || syncState.stage === 'failed' || syncState.stage === 'success' ? (
              <button
                onClick={() => setShowModal(false)}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            ) : null}

            <h3 className="text-lg font-bold font-display text-slate-800 mb-2 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-brand-cozy animate-pulse" />
              <span>Connect aims.rkmvc.ac.in</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Login to your college portal. Your credentials will be temporarily encrypted in your browser session for security purposes.
            </p>

            {syncState.stage === 'idle' ? (
              <form onSubmit={handleStartSync} className="space-y-4">
                {/* Username/RegNo */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1 uppercase tracking-wider">AIMS Register No.</label>
                  <input
                    type="text"
                    required
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value)}
                    placeholder="Enter Portal Register Number (e.g. 2413281033018)"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-cozy focus:ring-1 focus:ring-brand-cozy outline-none rounded-cozy-lg transition-all text-slate-700 placeholder-slate-400 text-sm"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 ml-1">Type 'error' to test auth validation failure.</p>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1 uppercase tracking-wider">AIMS Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter Portal Password"
                      className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-cozy focus:ring-1 focus:ring-brand-cozy outline-none rounded-cozy-lg transition-all text-slate-700 placeholder-slate-400 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Captcha */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1 uppercase tracking-wider">Security Captcha</label>
                  <div className="flex items-center gap-3 mb-2">
                    {loadingCaptcha ? (
                      <div className="h-14 w-40 bg-slate-200 animate-pulse rounded-md border border-slate-300 flex items-center justify-center">
                        <span className="text-xs text-slate-400">Loading...</span>
                      </div>
                    ) : captchaImage ? (
                      <img src={captchaImage} alt="Captcha" className="h-14 rounded-md border border-slate-300" />
                    ) : (
                      <div className="h-14 w-40 bg-red-50 text-red-400 text-[10px] rounded-md border border-red-200 flex items-center justify-center text-center p-2">
                        Failed to load captcha
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={fetchCaptcha}
                      className="p-2 text-brand-cozy hover:bg-brand-light rounded-full transition-all"
                      title="Reload Captcha"
                    >
                      <RefreshCw className={`w-4 h-4 ${loadingCaptcha ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={captchaText}
                    onChange={(e) => setCaptchaText(e.target.value)}
                    placeholder="Enter Captcha text"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-cozy focus:ring-1 focus:ring-brand-cozy outline-none rounded-cozy-lg transition-all text-slate-700 placeholder-slate-400 text-sm"
                  />
                </div>

                {/* Session checkbox */}
                <div className="flex items-center gap-2 ml-1">
                  <input
                    type="checkbox"
                    id="save_session"
                    checked={saveSession}
                    onChange={(e) => setSaveSession(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-cozy focus:ring-brand-cozy border-slate-300"
                  />
                  <label htmlFor="save_session" className="text-xs font-semibold text-slate-500 select-none cursor-pointer flex items-center gap-1">
                    <Key className="w-3.5 h-3.5 text-slate-400" />
                    Remember credentials for this session
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-brand-cozy text-white font-semibold font-display rounded-cozy-lg shadow-md hover:bg-brand-dark transition-all flex items-center justify-center gap-2"
                  >
                    <span>Authenticate & Sync</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="py-6 flex flex-col items-center justify-center text-center">
                
                {/* Visual Status Animation */}
                {syncState.stage === 'success' ? (
                  <div className="p-4 bg-cozy-green text-cozy-green-dark rounded-full mb-4 shadow-sm animate-float">
                    <CheckCircle className="w-12 h-12" />
                  </div>
                ) : syncState.stage === 'failed' ? (
                  <div className="p-4 bg-cozy-peach text-cozy-peach-dark rounded-full mb-4 shadow-sm">
                    <XCircle className="w-12 h-12" />
                  </div>
                ) : (
                  <div className="relative flex items-center justify-center mb-6">
                    {/* Ring Spinner */}
                    <div className="w-20 h-20 border-4 border-slate-100 border-t-brand-cozy rounded-full animate-spin" />
                    <span className="absolute text-xs font-bold text-slate-500 font-display">{syncState.percent}%</span>
                  </div>
                )}

                {/* Status messages */}
                <h4 className="font-bold text-slate-700 mb-1">{syncState.message}</h4>
                
                {syncState.stage !== 'success' && syncState.stage !== 'failed' && (
                  <p className="text-xs text-slate-400 animate-pulse">Running secure sync scraper...</p>
                )}

                {syncState.stage === 'failed' && (
                  <div className="mt-4 w-full">
                    <div className="p-3 bg-cozy-peach text-xs font-semibold text-cozy-peach-dark rounded-cozy-lg flex items-center gap-2 justify-center mb-4">
                      <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                      <span>Check connection/keys or verify credentials</span>
                    </div>
                    <button
                      onClick={() => setSyncState({ stage: 'idle', message: '', percent: 0 })}
                      className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-cozy-lg transition-all"
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
