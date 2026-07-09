import React, { useState } from 'react';
import { AttendanceRecord } from '../types';
import { BunkCalculator } from './BunkCalculator';
import { 
  BookOpen, PlusCircle, Trash2, Sparkles 
} from 'lucide-react';

interface AttendanceViewProps {
  attendanceData: AttendanceRecord[];
  onAddSubject: (subject: string, attended: number, total: number) => Promise<boolean>;
  onUpdateAttendance: (id: string, attended: number, total: number) => Promise<boolean>;
  onDeleteSubject: (id: string) => Promise<boolean>;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  attendanceData,
  onAddSubject,
  onUpdateAttendance,
  onDeleteSubject
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newAttended, setNewAttended] = useState(0);
  const [newTotal, setNewTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || newTotal < 0 || newAttended < 0 || newAttended > newTotal) {
      setError('Invalid attendance quantities. Attended classes cannot exceed total.');
      return;
    }

    setError(null);
    setLoading(true);

    const success = await onAddSubject(newSubject.trim(), Number(newAttended), Number(newTotal));
    if (success) {
      setNewSubject('');
      setNewAttended(0);
      setNewTotal(0);
      setShowAddForm(false);
    } else {
      setError('Could not add subject. Make sure subject name is unique.');
    }
    setLoading(false);
  };

  const handleQuickIncrement = async (record: AttendanceRecord, type: 'attended' | 'missed') => {
    let newAtt = record.attended_classes;
    let newTot = record.total_classes + 1;
    
    if (type === 'attended') {
      newAtt += 1;
    }

    await onUpdateAttendance(record.id, newAtt, newTot);
  };

  const handleQuickDecrement = async (record: AttendanceRecord, type: 'attended' | 'total') => {
    let newAtt = record.attended_classes;
    let newTot = record.total_classes;

    if (type === 'attended') {
      if (newAtt > 0) {
        newAtt -= 1;
        newTot -= 1; // Decrementing attended implies removing a class they went to
      }
    } else {
      if (newTot > 0 && newTot > newAtt) {
        newTot -= 1; // Decrementing missed classes only
      }
    }

    if (newTot >= 0 && newAtt <= newTot) {
      await onUpdateAttendance(record.id, newAtt, newTot);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      
      {/* Subject list columns */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex justify-between items-center mb-1">
          <div>
            <h2 className="text-xl font-bold font-display text-slate-800">Track Course Attendance</h2>
            <p className="text-xs text-slate-400 mt-0.5">Quick update classes attended or missed as lectures occur</p>
          </div>
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setError(null);
            }}
            className="px-4 py-2 bg-brand-cozy hover:bg-brand-dark text-white font-bold font-display rounded-cozy-lg transition-all text-xs flex items-center gap-1.5 shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Subject</span>
          </button>
        </div>

        {/* Add Subject Modal/Form inline */}
        {showAddForm && (
          <div className="bg-brand-light/40 border border-brand-cozy/10 p-5 rounded-cozy-xl space-y-4 animate-slide-up">
            <h4 className="font-bold text-sm text-brand-dark flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Create New Subject Tracking</span>
            </h4>
            
            {error && (
              <p className="text-xs font-semibold text-cozy-peach-dark bg-cozy-peach border border-cozy-peach-dark/10 p-2.5 rounded-lg">{error}</p>
            )}

            <form onSubmit={handleAddSubjectSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div className="sm:col-span-1">
                <label className="block text-[10px] font-bold text-slate-500 mb-1 ml-0.5 uppercase tracking-wider">Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mathematics"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-brand-cozy outline-none rounded-cozy-lg text-sm text-slate-700 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1 ml-0.5 uppercase tracking-wider">Attended Classes</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={newAttended}
                  onChange={(e) => setNewAttended(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-brand-cozy outline-none rounded-cozy-lg text-sm text-slate-700 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1 ml-0.5 uppercase tracking-wider">Total Conducted</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={newTotal}
                  onChange={(e) => setNewTotal(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-brand-cozy outline-none rounded-cozy-lg text-sm text-slate-700 font-semibold"
                />
              </div>

              <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 text-xs font-bold rounded-cozy-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-brand-cozy hover:bg-brand-dark text-white text-xs font-bold rounded-cozy-lg shadow-sm transition-all"
                >
                  {loading ? 'Adding...' : 'Add Course'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Subjects List */}
        <div className="space-y-3">
          {attendanceData.length === 0 ? (
            <div className="bg-white rounded-cozy-xl p-10 text-center border border-slate-100 shadow-cozy">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h4 className="font-bold text-slate-600">No Course Tracking Setup</h4>
              <p className="text-xs text-slate-400 mt-1">Configure classes manually or import your portal dashboard records using Sync portal.</p>
            </div>
          ) : (
            attendanceData.map(record => (
              <div 
                key={record.id} 
                className="bg-white rounded-cozy-xl p-5 border border-slate-100 shadow-cozy hover:shadow-cozy-hover transition-all flex flex-col sm:flex-row justify-between sm:items-center gap-4 relative overflow-hidden"
              >
                {/* Visual side highlights */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                  record.attendance_percentage >= 75 ? 'bg-cozy-green-dark' : 'bg-cozy-peach-dark'
                }`} />

                <div className="flex-1 space-y-1 pl-1">
                  <h4 className="font-bold text-slate-700 font-display text-sm sm:text-base">{record.subject}</h4>
                  
                  {record.teacher && (
                    <p className="text-[11px] text-slate-400 font-medium">
                      👨‍🏫 {record.teacher}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                      record.attendance_percentage >= 75 ? 'bg-cozy-green text-cozy-green-dark' : 'bg-cozy-peach text-cozy-peach-dark'
                    }`}>
                      {record.attendance_percentage}%
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">
                      ({record.attended_classes} of {record.total_classes} classes)
                    </span>
                  </div>

                  {/* Extra portal stats row */}
                  {(record.class_hours != null || record.hours_attended != null) && (
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
                      <span className="text-[10px] text-slate-400 font-semibold">
                        📘 Total Hrs: <strong className="text-slate-600">{record.class_hours?.toFixed(2)}</strong>
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        ✅ Attended Hrs: <strong className="text-slate-600">{record.hours_attended?.toFixed(2)}</strong>
                      </span>
                    </div>
                  )}

                  {/* Visual Progress Bar */}
                  <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden border border-slate-50">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        record.attendance_percentage >= 75 ? 'bg-cozy-green-dark' : 'bg-cozy-peach-dark'
                      }`}
                      style={{ width: `${Math.min(100, record.attendance_percentage)}%` }}
                    />
                  </div>
                </div>

                {/* Updating Controls & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
                  {/* Attendance modifiers */}
                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 p-1.5 rounded-cozy-lg shadow-sm">
                    <div className="flex flex-col items-center">
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 px-2">Attended</span>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => handleQuickDecrement(record, 'attended')}
                          className="w-7 h-7 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center text-slate-500 font-bold transition-all text-xs"
                          title="-1 Attended & Total"
                        >
                          -
                        </button>
                        <button 
                          onClick={() => handleQuickIncrement(record, 'attended')}
                          className="px-2.5 py-1.5 bg-cozy-green hover:bg-cozy-green-dark/20 text-cozy-green-dark font-extrabold rounded-lg flex items-center justify-center transition-all text-xs gap-0.5"
                          title="+1 Attended & Total"
                        >
                          <span>+</span>
                        </button>
                      </div>
                    </div>

                    <div className="h-6 w-[1px] bg-slate-200 self-end mb-1" />

                    <div className="flex flex-col items-center">
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 px-2">Missed</span>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => handleQuickDecrement(record, 'total')}
                          className="w-7 h-7 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center text-slate-500 font-bold transition-all text-xs"
                          title="-1 Missed Class"
                        >
                          -
                        </button>
                        <button 
                          onClick={() => handleQuickIncrement(record, 'missed')}
                          className="px-2.5 py-1.5 bg-cozy-peach hover:bg-cozy-peach-dark/20 text-cozy-peach-dark font-extrabold rounded-lg flex items-center justify-center transition-all text-xs gap-0.5"
                          title="+1 Missed Class"
                        >
                          <span>+</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => {
                      if (confirm(`Remove "${record.subject}" from tracker?`)) {
                        onDeleteSubject(record.id);
                      }
                    }}
                    className="p-2.5 text-slate-400 hover:text-cozy-peach-dark hover:bg-cozy-peach rounded-cozy-lg border border-transparent hover:border-cozy-peach-dark/10 transition-all shadow-sm bg-white"
                    title="Delete Subject"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Column: Bunk Calculator Advice panel */}
      <div className="lg:col-span-1">
        <BunkCalculator attendanceData={attendanceData} />
      </div>

    </div>
  );
};
