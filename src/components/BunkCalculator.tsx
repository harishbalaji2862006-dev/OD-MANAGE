import React, { useState } from 'react';
import { AttendanceRecord } from '../types';
import { Sliders, HelpCircle, Award, AlertTriangle, BookOpen } from 'lucide-react';

interface BunkCalculatorProps {
  attendanceData: AttendanceRecord[];
}

export const BunkCalculator: React.FC<BunkCalculatorProps> = ({ attendanceData }) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('overall');
  const [targetPercentage, setTargetPercentage] = useState<number>(75);

  // Compute stats based on selection
  let attended = 0;
  let total = 0;

  if (selectedSubjectId === 'overall') {
    attended = attendanceData.reduce((sum, item) => sum + item.attended_classes, 0);
    total = attendanceData.reduce((sum, item) => sum + item.total_classes, 0);
  } else {
    const record = attendanceData.find(a => a.id === selectedSubjectId);
    if (record) {
      attended = record.attended_classes;
      total = record.total_classes;
    }
  }

  const currentPercentage = total === 0 ? 100 : Math.round((attended / total) * 10000) / 100;
  const targetFraction = targetPercentage / 100;

  // Calculate bunk metrics
  let canBunk = 0;
  let mustAttend = 0;
  let isAboveTarget = currentPercentage >= targetPercentage;

  if (total > 0) {
    if (isAboveTarget) {
      // B = floor((Attended - (TargetFraction * Total)) / TargetFraction)
      canBunk = Math.floor((attended - (targetFraction * total)) / targetFraction);
      if (canBunk < 0) canBunk = 0;
    } else {
      // C = ceil(((TargetFraction * Total) - Attended) / (1 - TargetFraction))
      const numerator = (targetFraction * total) - attended;
      const denominator = 1 - targetFraction;
      mustAttend = denominator === 0 ? 0 : Math.ceil(numerator / denominator);
      if (mustAttend < 0) mustAttend = 0;
    }
  }

  return (
    <div className="bg-white rounded-cozy-xl p-6 shadow-cozy border border-slate-100 h-full flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold font-display text-slate-800 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-brand-cozy" />
            <span>Smart Bunk Advisor</span>
          </h3>
          <div className="group relative">
            <HelpCircle className="w-4 h-4 text-slate-400 cursor-help" />
            <div className="absolute right-0 top-6 hidden group-hover:block bg-slate-800 text-white text-[10px] p-2.5 rounded-lg w-52 z-30 leading-normal shadow-md font-sans">
              Calculates how many classes you can skip safely, or how many you must attend consecutively to hit your goal.
            </div>
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-4 mb-6">
          {/* Subject selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1 ml-0.5 uppercase tracking-wider">Calculate For</label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-brand-cozy focus:ring-1 focus:ring-brand-cozy outline-none rounded-cozy-lg text-sm text-slate-700 font-semibold"
              >
                <option value="overall">📚 Overall Combined Attendance</option>
                {attendanceData.map(item => (
                  <option key={item.id} value={item.id}>
                    📖 {item.subject} ({item.attendance_percentage}%)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Target Percentage Selector (75, 80, 85, Custom Slider) */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1.5 ml-0.5 uppercase tracking-wider">
              <span>Target Attendance</span>
              <span className="text-brand-cozy font-bold">{targetPercentage}%</span>
            </div>
            
            {/* Quick buttons */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              {[75, 80, 85].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setTargetPercentage(val)}
                  className={`py-1.5 rounded-cozy-lg text-xs font-bold transition-all border ${
                    targetPercentage === val 
                      ? 'bg-brand-light border-brand-cozy/30 text-brand-dark shadow-sm' 
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {val}%
                </button>
              ))}
              <button
                type="button"
                onClick={() => setTargetPercentage(90)}
                className={`py-1.5 rounded-cozy-lg text-xs font-bold transition-all border ${
                  targetPercentage === 90 
                    ? 'bg-brand-light border-brand-cozy/30 text-brand-dark shadow-sm' 
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                }`}
              >
                90%
              </button>
            </div>

            {/* Custom Slider */}
            <input
              type="range"
              min="50"
              max="98"
              value={targetPercentage}
              onChange={(e) => setTargetPercentage(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-cozy"
            />
          </div>
        </div>
      </div>

      {/* Result Metrics */}
      <div className="bg-slate-50 rounded-cozy-lg p-5 border border-slate-100">
        <div className="text-center mb-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Current {selectedSubjectId === 'overall' ? 'Overall' : 'Subject'} Level</span>
          <span className={`text-3xl font-extrabold font-display mt-1 block ${currentPercentage < targetPercentage ? 'text-cozy-peach-dark' : 'text-cozy-green-dark'}`}>
            {currentPercentage}%
          </span>
          <span className="text-[10px] text-slate-400">({attended} of {total} classes attended)</span>
        </div>

        {total === 0 ? (
          <div className="text-center py-2 text-xs text-slate-400 font-semibold">
            No class data recorded yet.
          </div>
        ) : isAboveTarget ? (
          <div className="flex items-center gap-3 bg-cozy-green border border-cozy-green-dark/10 p-4 rounded-cozy-lg">
            <div className="p-2 bg-cozy-green-dark/10 text-cozy-green-dark rounded-xl flex-shrink-0 animate-bounce">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 leading-normal">
                You are safe! You can bunk up to:
              </p>
              <h4 className="text-lg font-bold text-cozy-green-dark mt-0.5">
                {canBunk} classes
              </h4>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 bg-cozy-peach border border-cozy-peach-dark/10 p-4 rounded-cozy-lg">
            <div className="p-2 bg-cozy-peach-dark/10 text-cozy-peach-dark rounded-xl flex-shrink-0 animate-pulse">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 leading-normal">
                Attendance low! You must attend next:
              </p>
              <h4 className="text-lg font-bold text-cozy-peach-dark mt-0.5">
                {mustAttend} classes consecutively
              </h4>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
