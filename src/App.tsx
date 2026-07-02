import { useState, useEffect } from 'react';
import { dbAuth, dbAttendance, dbOd, dbLogs } from './services/db';
import { UserProfile, AttendanceRecord, OdRecord, SyncLog } from './types';
import { AuthView } from './components/AuthView';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { AttendanceView } from './components/AttendanceView';
import { OdView } from './components/OdView';
import { AnalyticsView } from './components/AnalyticsView';
import { Sparkles } from 'lucide-react';

function App() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [appLoading, setAppLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Core Data States
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [odRecords, setOdRecords] = useState<OdRecord[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);

  // 1. Initial Check for active user session
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { profile } = await dbAuth.getCurrentUser();
        if (profile) {
          setUserProfile(profile);
          setIsDemo(dbAuth.isDemoMode);
          await loadUserData(profile.id);
        }
      } catch (err) {
        console.error('Session retrieval failed:', err);
      } finally {
        setAppLoading(false);
      }
    };
    checkUser();
  }, []);

  // 2. Load related records for a user
  const loadUserData = async (userId: string) => {
    try {
      const [attRes, odRes, logRes] = await Promise.all([
        dbAttendance.getAttendance(userId),
        dbOd.getOds(userId),
        dbLogs.getLogs(userId),
      ]);

      if (attRes.data) setAttendanceData(attRes.data);
      if (odRes.data) setOdRecords(odRes.data);
      if (logRes.data) setSyncLogs(logRes.data);
    } catch (err) {
      console.error('Failed to load user records:', err);
    }
  };

  // 3. Auth callbacks
  const handleAuthSuccess = async (profile: UserProfile, isDemoMode: boolean) => {
    setUserProfile(profile);
    setIsDemo(isDemoMode);
    setAppLoading(true);
    await loadUserData(profile.id);
    setAppLoading(false);
    setActiveTab('dashboard');
  };

  const handleSignOut = async () => {
    await dbAuth.signOut();
    setUserProfile(null);
    setAttendanceData([]);
    setOdRecords([]);
    setSyncLogs([]);
    setActiveTab('dashboard');
  };

  // 4. Attendance Actions
  const handleAddSubject = async (subject: string, attended: number, total: number) => {
    if (!userProfile) return false;
    const { data, error } = await dbAttendance.addSubject(userProfile.id, subject, attended, total);
    if (error) return false;
    if (data) {
      setAttendanceData(prev => [...prev, data].sort((a,b) => a.subject.localeCompare(b.subject)));
      return true;
    }
    return false;
  };

  const handleUpdateAttendance = async (id: string, attended: number, total: number) => {
    const { data, error } = await dbAttendance.updateAttendance(id, attended, total);
    if (error) return false;
    if (data) {
      setAttendanceData(prev => prev.map(item => item.id === id ? data : item));
      return true;
    }
    return false;
  };

  const handleDeleteSubject = async (id: string) => {
    const { error } = await dbAttendance.deleteSubject(id);
    if (error) return false;
    setAttendanceData(prev => prev.filter(item => item.id !== id));
    return true;
  };

  // 5. OD Actions
  const handleAddOd = async (record: Omit<OdRecord, 'id' | 'user_id' | 'status' | 'created_at'>) => {
    if (!userProfile) return false;
    const { data, error } = await dbOd.addOd(userProfile.id, record);
    if (error) return false;
    if (data) {
      setOdRecords(prev => [data, ...prev]);
      return true;
    }
    return false;
  };

  const handleUpdateOd = async (id: string, updates: Partial<OdRecord>) => {
    const { data, error } = await dbOd.updateOd(id, updates);
    if (error) return false;
    if (data) {
      setOdRecords(prev => prev.map(item => item.id === id ? data : item));
      return true;
    }
    return false;
  };

  const handleApproveMockOd = (id: string, status: 'Approved' | 'Rejected') => {
    handleUpdateOd(id, { status });
  };

  const handleDeleteOd = async (id: string) => {
    const { error } = await dbOd.deleteOd(id);
    if (error) return false;
    setOdRecords(prev => prev.filter(item => item.id !== id));
    return true;
  };

  // Triggered after Portal Sync completes
  const handleSyncComplete = async () => {
    if (userProfile) {
      await loadUserData(userProfile.id);
    }
  };

  // 6. Loader View
  if (appLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cozy-cream">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-slate-100 border-t-brand-cozy rounded-full animate-spin" />
        </div>
        <p className="text-xs font-semibold text-slate-500 font-display mt-4 animate-pulse">
          Loading student dashboard...
        </p>
      </div>
    );
  }

  // 7. Non-authenticated state
  if (!userProfile) {
    return <AuthView onAuthSuccess={handleAuthSuccess} />;
  }

  // 8. Authenticated views router
  return (
    <div className="min-h-screen bg-cozy-cream font-sans relative overflow-x-hidden">
      
      {/* Decorative grids */}
      <div className="absolute inset-0 grid-bg pointer-events-none z-0" />
      
      {/* Left side fixed bar / Bottom bar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userProfile={userProfile}
        onSignOut={handleSignOut}
        isDemoMode={isDemo}
      />

      {/* Main Core View Area */}
      <main className="relative z-10 md:pl-72 p-4 sm:p-6 md:p-8 pb-24 md:pb-8 min-h-screen flex flex-col justify-between">
        
        <div className="max-w-6xl mx-auto w-full">
          {/* Global Demo Banner */}
          {isDemo && (
            <div className="mb-6 flex items-center justify-between gap-3 p-3 bg-brand-light/50 border border-brand-cozy/10 rounded-cozy-lg text-[10px] sm:text-xs font-semibold text-brand-dark shadow-sm">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-brand-cozy animate-pulse" />
                <span>Running in offline Demo Workspace mode. Wire your Supabase URL in `.env` to connect live databases.</span>
              </span>
            </div>
          )}

          {/* Active View Render */}
          {activeTab === 'dashboard' && (
            <DashboardView
              userProfile={userProfile}
              attendanceData={attendanceData}
              odRecords={odRecords}
              syncLogs={syncLogs}
              onSyncComplete={handleSyncComplete}
              onNavigate={setActiveTab}
              onApproveMockOd={handleApproveMockOd}
              isDemoMode={isDemo}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendanceView
              attendanceData={attendanceData}
              onAddSubject={handleAddSubject}
              onUpdateAttendance={handleUpdateAttendance}
              onDeleteSubject={handleDeleteSubject}
            />
          )}

          {activeTab === 'od' && (
            <OdView
              odRecords={odRecords}
              onAddOd={handleAddOd}
              onUpdateOd={handleUpdateOd}
              onDeleteOd={handleDeleteOd}
              isDemoMode={isDemo}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              attendanceData={attendanceData}
              odRecords={odRecords}
            />
          )}
        </div>

        {/* Footer info */}
        <footer className="text-center text-[10px] text-slate-400 font-semibold mt-12 pb-4 max-w-6xl mx-auto w-full">
          College OD & Attendance Manager © {new Date().getFullYear()} • Designed with a Cozy student vibe.
        </footer>
      </main>
    </div>
  );
}

export default App;
export { App };
