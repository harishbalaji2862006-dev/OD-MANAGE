import React from 'react';
import { UserProfile } from '../types';
import { 
  LayoutDashboard, BookOpen, Award, BarChart3, 
  LogOut, GraduationCap 
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userProfile: UserProfile;
  onSignOut: () => void;
  isDemoMode: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  userProfile,
  onSignOut,
  isDemoMode
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'attendance', label: 'Attendance', icon: BookOpen },
    { id: 'od', label: 'OD Requests', icon: Award },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <>
      {/* 1. DESKTOP SIDEBAR - Hidden on mobile, sticky on md+ */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-100 h-screen fixed left-0 top-0 p-6 justify-between shadow-sm z-30">
        <div className="space-y-8">
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-light text-brand-cozy rounded-2xl shadow-sm">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-extrabold text-slate-800 text-sm font-display tracking-tight leading-none">OD & Attendance</h1>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 block">RKMVC Companion</span>
            </div>
          </div>

          {/* User Mini Profile Card */}
          <div className="bg-slate-50 p-4 rounded-cozy-xl border border-slate-100 relative overflow-hidden">
            <div className="absolute right-[-10px] bottom-[-10px] opacity-10 text-brand-cozy">
              <GraduationCap className="w-16 h-16" />
            </div>
            <div className="relative z-10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-cozy text-white font-extrabold flex items-center justify-center font-display text-sm">
                {userProfile.name.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <h4 className="font-bold text-slate-700 text-xs truncate leading-normal">{userProfile.name}</h4>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide truncate">{userProfile.department}</p>
              </div>
            </div>

            {isDemoMode && (
              <div className="mt-2 text-[9px] font-bold text-brand-cozy bg-white/70 px-2 py-0.5 rounded border border-brand-cozy/10 w-fit">
                Demo Workspace
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-cozy-lg text-xs font-bold transition-all border ${
                    isActive 
                      ? 'bg-brand-light border-brand-cozy/20 text-brand-dark shadow-sm' 
                      : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-cozy' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <button
          onClick={onSignOut}
          className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-cozy-peach-dark hover:bg-cozy-peach/50 rounded-cozy-lg transition-all text-xs font-bold border border-transparent"
        >
          <LogOut className="w-4 h-4 text-slate-400" />
          <span>Sign Out</span>
        </button>
      </aside>

      {/* 2. MOBILE HEADER - Sticky top, hidden on md+ */}
      <header className="md:hidden sticky top-0 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between shadow-sm z-30">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-brand-light text-brand-cozy rounded-xl">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-slate-800 text-xs font-display tracking-tight">OD & Attendance</h1>
            {isDemoMode && <span className="text-[8px] font-bold text-brand-cozy bg-brand-light/50 px-1 rounded">Demo</span>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-cozy text-white font-extrabold flex items-center justify-center font-display text-xs">
            {userProfile.name.charAt(0).toUpperCase()}
          </div>
          <button 
            onClick={onSignOut} 
            className="p-2 text-slate-400 hover:text-cozy-peach-dark transition-all rounded-lg"
            title="Sign Out"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </header>

      {/* 3. MOBILE BOTTOM NAV - Sticky bottom, hidden on md+ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex justify-around p-2.5 shadow-lg z-30">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                isActive ? 'text-brand-cozy font-bold' : 'text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[9px] tracking-wide">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
