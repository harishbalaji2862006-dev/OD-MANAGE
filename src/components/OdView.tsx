import React, { useState } from 'react';
import { OdRecord } from '../types';
import { 
  Award, Calendar, User, Send, Trash2, 
  CheckCircle, Clock, XCircle, PlusCircle, Paperclip 
} from 'lucide-react';

interface OdViewProps {
  odRecords: OdRecord[];
  onAddOd: (record: Omit<OdRecord, 'id' | 'user_id' | 'status' | 'created_at'>) => Promise<boolean>;
  onUpdateOd: (id: string, updates: Partial<OdRecord>) => Promise<boolean>;
  onDeleteOd: (id: string) => Promise<boolean>;
  isDemoMode: boolean;
}

export const OdView: React.FC<OdViewProps> = ({
  odRecords,
  onAddOd,
  onUpdateOd,
  onDeleteOd,
  isDemoMode
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [reason, setReason] = useState('');
  const [faculty, setFaculty] = useState('');
  const [event, setEvent] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [proofUrl, setProofUrl] = useState('');

  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !reason || !faculty || !event || !date) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    setError(null);
    setLoading(true);

    const success = await onAddOd({
      date,
      subject,
      reason,
      faculty,
      event,
      proof_url: proofUrl || undefined
    });

    if (success) {
      setSubject('');
      setReason('');
      setFaculty('');
      setEvent('');
      setDate(new Date().toISOString().split('T')[0]);
      setProofUrl('');
      setShowAddForm(false);
    } else {
      setError('Could not submit OD. Try again.');
    }
    setLoading(false);
  };

  // Calculations
  const totalLimit = 15;
  const approvedCount = odRecords.filter(r => r.status === 'Approved').length;
  const pendingCount = odRecords.filter(r => r.status === 'Pending').length;
  const rejectedCount = odRecords.filter(r => r.status === 'Rejected').length;
  const remainingLimit = Math.max(0, totalLimit - approvedCount);

  // Filtering
  const filteredRecords = odRecords.filter(r => {
    if (filterStatus === 'All') return true;
    return r.status === filterStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* OD Stats overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        
        {/* Total Allowed */}
        <div className="bg-white p-5 rounded-cozy-xl shadow-cozy border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-brand-light text-brand-dark rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Semester Cap</span>
            <span className="text-xl font-extrabold text-slate-700 font-display">{totalLimit} OD Days</span>
          </div>
        </div>

        {/* Used OD */}
        <div className="bg-white p-5 rounded-cozy-xl shadow-cozy border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-cozy-green text-cozy-green-dark rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Approved / Used</span>
            <span className="text-xl font-extrabold text-slate-700 font-display">{approvedCount} Days</span>
          </div>
        </div>

        {/* Pending OD */}
        <div className="bg-white p-5 rounded-cozy-xl shadow-cozy border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-cozy-lavender text-cozy-lavender-dark rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pending Approval</span>
            <span className="text-xl font-extrabold text-slate-700 font-display">{pendingCount} Days</span>
          </div>
        </div>

        {/* Remaining OD */}
        <div className="bg-white p-5 rounded-cozy-xl shadow-cozy border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-cozy-blue text-cozy-blue-dark rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Remaining Allowable</span>
            <span className="text-xl font-extrabold text-slate-700 font-display">{remainingLimit} Days</span>
          </div>
        </div>

      </div>

      {/* Main OD layout split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Form and Toggles */}
        <div className="lg:col-span-1 space-y-4">
          
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full py-3 bg-brand-cozy hover:bg-brand-dark text-white font-bold font-display rounded-cozy-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Apply for New OD</span>
          </button>

          {showAddForm && (
            <div className="bg-white p-6 rounded-cozy-xl border border-slate-100 shadow-cozy animate-slide-up space-y-4">
              <h3 className="text-base font-bold font-display text-slate-800 flex items-center gap-2">
                <Send className="w-4 h-4 text-brand-cozy" />
                <span>On-Duty Request</span>
              </h3>

              {error && (
                <p className="text-xs font-semibold text-cozy-peach-dark bg-cozy-peach border border-cozy-peach-dark/10 p-2.5 rounded-lg">{error}</p>
              )}

              <form onSubmit={handleSubmit} className="space-y-3 text-xs font-semibold text-slate-500">
                {/* Date */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 ml-0.5">Event Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-brand-cozy outline-none rounded-cozy-lg text-slate-700"
                  />
                </div>

                {/* Event Name */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 ml-0.5">Event/Competition Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Smart India Hackathon"
                    value={event}
                    onChange={(e) => setEvent(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-brand-cozy outline-none rounded-cozy-lg text-slate-700 placeholder-slate-400"
                  />
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 ml-0.5">Subject To Claim OD For</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Operating Systems"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-brand-cozy outline-none rounded-cozy-lg text-slate-700 placeholder-slate-400"
                  />
                </div>

                {/* Faculty Name */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 ml-0.5">Subject Faculty In-Charge</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Sarah Smith"
                    value={faculty}
                    onChange={(e) => setFaculty(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-brand-cozy outline-none rounded-cozy-lg text-slate-700 placeholder-slate-400"
                  />
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 ml-0.5">Detailed Reason</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe your role and event details..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-brand-cozy outline-none rounded-cozy-lg text-slate-700 placeholder-slate-400 leading-normal"
                  />
                </div>

                {/* Proof URL Mockup */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 ml-0.5 flex items-center gap-1">
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>Proof Document URL (Optional)</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/certificate.pdf"
                    value={proofUrl}
                    onChange={(e) => setProofUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-brand-cozy outline-none rounded-cozy-lg text-slate-700 placeholder-slate-400"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold rounded-cozy-lg transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2 bg-brand-cozy hover:bg-brand-dark text-white font-bold rounded-cozy-lg shadow-sm transition-all"
                  >
                    {loading ? 'Submitting...' : 'Apply Request'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Filtering Toggles */}
          <div className="bg-white p-4 rounded-cozy-xl border border-slate-100 shadow-cozy space-y-2">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-0.5">Filter Status</span>
            
            <div className="flex flex-col gap-1.5 font-semibold text-xs">
              {(['All', 'Pending', 'Approved', 'Rejected'] as const).map(status => {
                const count = status === 'All' ? odRecords.length :
                              status === 'Approved' ? approvedCount :
                              status === 'Pending' ? pendingCount : rejectedCount;

                return (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`flex justify-between items-center px-3 py-2.5 rounded-cozy-lg border transition-all text-slate-600 ${
                      filterStatus === status 
                        ? 'bg-brand-light border-brand-cozy/30 text-brand-dark font-bold'
                        : 'bg-slate-50/50 border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {status === 'Approved' && <CheckCircle className="w-3.5 h-3.5 text-cozy-green-dark" />}
                      {status === 'Pending' && <Clock className="w-3.5 h-3.5 text-cozy-lavender-dark" />}
                      {status === 'Rejected' && <XCircle className="w-3.5 h-3.5 text-cozy-peach-dark" />}
                      {status === 'All' && <Award className="w-3.5 h-3.5 text-brand-cozy" />}
                      <span>{status} Requests</span>
                    </span>
                    <span className="bg-white/80 px-2 py-0.5 rounded-md border border-slate-100 text-[10px]">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* OD Records List Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center mb-1">
            <div>
              <h2 className="text-xl font-bold font-display text-slate-800">OD History & Logs</h2>
              <p className="text-xs text-slate-400 mt-0.5">Manage and check status details for submitted On-Duty vouchers</p>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              {filteredRecords.length} records
            </span>
          </div>

          <div className="space-y-4">
            {filteredRecords.length === 0 ? (
              <div className="bg-white rounded-cozy-xl p-10 text-center border border-slate-100 shadow-cozy">
                <Award className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h4 className="font-bold text-slate-600">No OD records found</h4>
                <p className="text-xs text-slate-400 mt-1">Submit new On-Duty requests using the application form.</p>
              </div>
            ) : (
              filteredRecords.map(od => (
                <div 
                  key={od.id} 
                  className="bg-white rounded-cozy-xl p-5 border border-slate-100 shadow-cozy hover:shadow-cozy-hover transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden"
                >
                  <div className="flex-1 space-y-2">
                    {/* Title Banner */}
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                        od.status === 'Approved' ? 'bg-cozy-green text-cozy-green-dark' :
                        od.status === 'Rejected' ? 'bg-cozy-peach text-cozy-peach-dark' :
                        'bg-cozy-lavender text-cozy-lavender-dark'
                      }`}>
                        {od.status === 'Approved' && <CheckCircle className="w-3 h-3" />}
                        {od.status === 'Pending' && <Clock className="w-3 h-3" />}
                        {od.status === 'Rejected' && <XCircle className="w-3 h-3" />}
                        <span>{od.status}</span>
                      </span>
                      <h4 className="font-bold text-slate-800 text-sm sm:text-base font-display">{od.event}</h4>
                    </div>

                    {/* Metadata details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-400 font-semibold pt-1">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-400" /> {od.date}</span>
                      <span className="flex items-center gap-1 font-bold text-slate-500">Subject: {od.subject}</span>
                      <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-slate-400" /> {od.faculty}</span>
                      {od.proof_url && (
                        <a 
                          href={od.proof_url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="flex items-center gap-1 text-brand-cozy hover:underline hover:text-brand-dark"
                        >
                          <Paperclip className="w-3.5 h-3.5 text-brand-cozy" />
                          <span>Proof Doc</span>
                        </a>
                      )}
                    </div>

                    {/* Reason details */}
                    <p className="text-xs text-slate-500 leading-normal border-t border-slate-50 pt-2 bg-slate-50/50 p-2.5 rounded-lg italic">
                      "{od.reason}"
                    </p>
                  </div>

                  {/* Actions & Simulator controls */}
                  <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto border-t md:border-t-0 border-slate-100 pt-3 md:pt-0 gap-3">
                    
                    {/* Approval Simulator Panel (Exclusive to Demo Mode) */}
                    {isDemoMode && od.status === 'Pending' && (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => onUpdateOd(od.id, { status: 'Approved' })}
                          className="px-2.5 py-1.5 bg-cozy-green hover:bg-cozy-green-dark/20 text-cozy-green-dark font-extrabold rounded-cozy-lg text-[10px] shadow-sm transition-all"
                          title="Set status to Approved"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => onUpdateOd(od.id, { status: 'Rejected' })}
                          className="px-2.5 py-1.5 bg-cozy-peach hover:bg-cozy-peach-dark/20 text-cozy-peach-dark font-extrabold rounded-cozy-lg text-[10px] shadow-sm transition-all"
                          title="Set status to Rejected"
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    {/* Delete handler */}
                    <button
                      onClick={() => {
                        if (confirm('Delete this On-Duty request record?')) {
                          onDeleteOd(od.id);
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-cozy-peach-dark hover:bg-cozy-peach rounded-cozy-lg border border-transparent hover:border-cozy-peach-dark/10 transition-all ml-auto md:ml-0 shadow-sm bg-slate-50 hover:bg-white"
                      title="Delete request record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
