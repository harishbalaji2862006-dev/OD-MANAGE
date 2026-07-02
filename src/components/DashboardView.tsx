import React from 'react';
import { UserProfile, AttendanceRecord, OdRecord, SyncLog } from '../types';
import { SyncStatus } from './SyncStatus';
import { 
  GraduationCap, Calendar, CheckSquare, Award, Clock, 
  AlertTriangle, ArrowRight, UserCheck 
} from 'lucide-react';

interface DashboardViewProps {
  userProfile: UserProfile;
  attendanceData: AttendanceRecord[];
  odRecords: OdRecord[];
  syncLogs: SyncLog[];
  onSyncComplete: () => void;
  onNavigate: (view: string) => void;
  onApproveMockOd: (id: string, status: 'Approved' | 'Rejected') => void;
  isDemoMode: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  userProfile,
  attendanceData,
  odRecords,
  syncLogs,
  onSyncComplete,
  onNavigate,
  onApproveMockOd,
  isDemoMode
}) => {
  // 1. Calculations
  const totalConducted = attendanceData.reduce((sum, item) => sum + item.total_classes, 0);
  const totalAttended = attendanceData.reduce((sum, item) => sum + item.attended_classes, 0);
  const overallPercentage = totalConducted === 0 ? 100 : Math.round((totalAttended / totalConducted) * 10000) / 100;

  // OD computations
  const maxOdLimit = 15;
  const approvedOdCount = odRecords.filter(r => r.status === 'Approved').length;
  const pendingOdCount = odRecords.filter(r => r.status === 'Pending').length;
  const remainingOd = Math.max(0, maxOdLimit - approvedOdCount);

  // Bunk prediction (using 75% as default minimum safety target)
  const targetFraction = 0.75;
  const overallCanBunk = totalConducted > 0 && overallPercentage >= 75
    ? Math.floor((totalAttended - (targetFraction * totalConducted)) / targetFraction)
    : 0;

  // Subjects requiring attention (attendance < 75%)
  const warningSubjects = attendanceData.filter(s => s.attendance_percentage < 75);
  const showWarning = warningSubjects.length > 0 || overallPercentage < 75;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-cozy to-brand-dark rounded-cozy-xl p-6 text-white shadow-cozy relative overflow-hidden">
        {/* Decorative circle */}
        <div className="absolute right-[-10%] top-[-20%] w-48 h-48 rounded-full bg-white/10 blur-xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-bold w-fit mb-2.5">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>{userProfile.department} • Semester {userProfile.semester} • Sec {userProfile.section}</span>
            </div>
            <h2 className="text-2xl font-extrabold font-display leading-tight">
              Hello, {userProfile.name}! 👋
            </h2>
            <p className="text-brand-light/95 text-xs font-semibold mt-1">
              Register No: <span className="font-mono">{userProfile.register_number || 'N/A'}</span> | Keep your attendance above 75% to stay clear of semester restrictions.
            </p>
          </div>
          
          <div className="text-left md:text-right">
            <span className="text-[10px] uppercase font-bold tracking-wider text-brand-light block">Combined Attendance</span>
            <span className="text-4xl font-extrabold font-display block mt-0.5">{overallPercentage}%</span>
            <span className="text-xs text-brand-light/80 block mt-0.5">({totalAttended} / {totalConducted} classes)</span>
          </div>
        </div>
      </div>

      {/* Sync Status Banner */}
      <SyncStatus userId={userProfile.id} lastSyncTime={syncLogs[0]?.sync_time || null} onSyncComplete={onSyncComplete} />

      {/* Warning Notice Panel */}
      {showWarning && (
        <div className="bg-cozy-peach border border-cozy-peach-dark/15 rounded-cozy-xl p-5 flex items-start gap-4">
          <div className="p-2.5 bg-cozy-peach-dark/10 text-cozy-peach-dark rounded-xl flex-shrink-0 animate-pulse">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-slate-800 text-sm">Attendance Shortage Warning!</h4>
            <p className="text-xs text-slate-500 leading-normal">
              {overallPercentage < 75 
                ? `Your overall attendance (${overallPercentage}%) is below the college's mandatory 75% limit. You must attend more classes immediately.`
                : `You have ${warningSubjects.length} subject(s) falling below 75%: ${warningSubjects.map(s => `${s.subject} (${s.attendance_percentage}%)`).join(', ')}. Calculate safe skips to recover.`}
            </p>
          </div>
        </div>
      )}

      {/* Key Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Attendance card */}
        <div className="bg-white p-5 rounded-cozy-xl shadow-cozy border border-slate-100 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Level</span>
            <div className="p-2 bg-cozy-blue text-cozy-blue-dark rounded-xl">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-extrabold text-slate-800 font-display">{overallPercentage}%</h3>
            <p className="text-xs text-slate-400 mt-1">Goal target: 75%</p>
          </div>
        </div>

        {/* Conducted/Attended card */}
        <div className="bg-white p-5 rounded-cozy-xl shadow-cozy border border-slate-100 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Classes</span>
            <div className="p-2 bg-cozy-green text-cozy-green-dark rounded-xl">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-extrabold text-slate-800 font-display">{totalAttended} <span className="text-sm font-normal text-slate-400">/ {totalConducted}</span></h3>
            <p className="text-xs text-slate-400 mt-1">Attended classes</p>
          </div>
        </div>

        {/* OD Used/Remaining card */}
        <div className="bg-white p-5 rounded-cozy-xl shadow-cozy border border-slate-100 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">OD Ledger</span>
            <div className="p-2 bg-cozy-lavender text-cozy-lavender-dark rounded-xl">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-extrabold text-slate-800 font-display">
              {approvedOdCount} <span className="text-xs text-slate-400 font-bold bg-slate-100 px-1.5 py-0.5 rounded-md ml-1">{pendingOdCount} Pend</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">{remainingOd} remaining of {maxOdLimit} limit</p>
          </div>
        </div>

        {/* Slack / Bunk Days card */}
        <div className="bg-white p-5 rounded-cozy-xl shadow-cozy border border-slate-100 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bunks Allowed</span>
            <div className="p-2 bg-cozy-peach text-cozy-peach-dark rounded-xl">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className={`text-2xl font-extrabold font-display ${overallCanBunk > 0 ? 'text-cozy-green-dark' : 'text-slate-700'}`}>
              {overallCanBunk} <span className="text-xs font-normal text-slate-400">classes</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">To stay above 75% limit</p>
          </div>
        </div>
      </div>

      {/* Mid Section split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Recent OD requests with mock Approval Simulator */}
        <div className="bg-white p-6 rounded-cozy-xl shadow-cozy border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800 font-display flex items-center gap-2">
              <Award className="w-5 h-5 text-brand-cozy" />
              <span>Recent OD Log</span>
            </h3>
            <button
              onClick={() => onNavigate('od')}
              className="text-xs font-bold text-brand-cozy hover:underline flex items-center gap-1"
            >
              <span>Manage ODs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {odRecords.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 font-semibold">
                No OD requests submitted.
              </div>
            ) : (
              odRecords.slice(0, 3).map(od => (
                <div key={od.id} className="p-3 bg-slate-50 rounded-cozy-lg border border-slate-100 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <h5 className="font-bold text-slate-700">{od.event}</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">{od.subject} • {od.date}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Status Badge */}
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      od.status === 'Approved' ? 'bg-cozy-green text-cozy-green-dark' :
                      od.status === 'Rejected' ? 'bg-cozy-peach text-cozy-peach-dark' :
                      'bg-cozy-lavender text-cozy-lavender-dark'
                    }`}>
                      {od.status}
                    </span>

                    {/* Mock Approval trigger if in demo mode */}
                    {isDemoMode && od.status === 'Pending' && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => onApproveMockOd(od.id, 'Approved')}
                          className="px-2 py-1 bg-cozy-green hover:bg-cozy-green-dark/20 text-cozy-green-dark font-bold rounded-lg text-[10px]"
                          title="Simulate Approval"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => onApproveMockOd(od.id, 'Rejected')}
                          className="px-2 py-1 bg-cozy-peach hover:bg-cozy-peach-dark/20 text-cozy-peach-dark font-bold rounded-lg text-[10px]"
                          title="Simulate Rejection"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sync logs timeline */}
        <div className="bg-white p-6 rounded-cozy-xl shadow-cozy border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800 font-display flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand-cozy" />
              <span>Sync Activity Log</span>
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Recent actions</span>
          </div>

          <div className="space-y-3">
            {syncLogs.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 font-semibold">
                No sync operations performed yet.
              </div>
            ) : (
              syncLogs.slice(0, 4).map(log => (
                <div key={log.id} className="flex gap-3 text-xs leading-normal">
                  <div className="mt-1">
                    {log.status === 'Success' 
                      ? <CheckSquare className="w-4 h-4 text-cozy-green-dark" />
                      : <AlertTriangle className="w-4 h-4 text-cozy-peach-dark" />}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-600">{log.message}</p>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                      {new Date(log.sync_time).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
