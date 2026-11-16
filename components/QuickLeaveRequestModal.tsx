import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Coffee,
  Calendar,
  CalendarRange,
  Clock,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  Send,
  FileText,
  Sparkles,
  ShieldCheck,
  HeartPulse,
  Award,
  ChevronRight,
  Info,
  Check
} from 'lucide-react';
import { useToast } from './UIComponents';
import { MOCK_STAFF } from '../constants';
import {
  submitLeaveApplication,
  calculateDaysCount,
  getTeacherLeaveQuota,
  LeaveQuota,
  getLeavePolicies
} from '../utils/leaveWorkflow';
import { LeaveApplication, LeavePolicy } from '../types';

interface QuickLeaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherId?: string;
  teacherName?: string;
  onSuccess?: (leave: LeaveApplication) => void;
}

export const QuickLeaveRequestModal: React.FC<QuickLeaveRequestModalProps> = ({
  isOpen,
  onClose,
  teacherId = 'EMP-001',
  teacherName = 'Abdul Jabbar',
  onSuccess
}) => {
  const { showToast } = useToast();

  const [policies, setPolicies] = useState<LeavePolicy[]>(() => getLeavePolicies().filter(p => p.isActive));

  // Find active teacher profile
  const teacher = useMemo(() => {
    return MOCK_STAFF.find(s => s.id === teacherId) || {
      id: teacherId,
      name: teacherName,
      designation: 'Senior Teacher (Mathematics & Physics)',
      phone: '01700-000001',
      imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop'
    };
  }, [teacherId, teacherName]);

  // Tomorrow as default start
  const getTomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const getTodayStr = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Form State
  const [leaveType, setLeaveType] = useState<string>('Casual');
  const [startDate, setStartDate] = useState<string>(getTomorrowStr());
  const [endDate, setEndDate] = useState<string>(getTomorrowStr());
  const [reason, setReason] = useState<string>('');
  const [backupTeacher, setBackupTeacher] = useState<string>('Nasreen Akter (Senior Science Faculty)');
  const [emergencyContact, setEmergencyContact] = useState<string>(teacher.phone || '01700-000001');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [quota, setQuota] = useState<LeaveQuota | null>(null);

  // Sync quota and policies on open or teacher change
  useEffect(() => {
    if (isOpen && teacherId) {
      setQuota(getTeacherLeaveQuota(teacherId));
      const active = getLeavePolicies().filter(p => p.isActive);
      setPolicies(active);
      if (active.length > 0 && !active.some(p => p.name === leaveType || p.name.includes(leaveType))) {
        setLeaveType(active[0].name);
      }
    }
  }, [isOpen, teacherId]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Calculate duration
  const daysCount = useMemo(() => {
    if (!startDate || !endDate) return 1;
    return calculateDaysCount(startDate, endDate);
  }, [startDate, endDate]);

  // Check validity
  const isDateInvalid = Boolean(startDate && endDate && startDate > endDate);

  // Quick preset helper
  const handleDatePreset = (preset: 'today' | 'tomorrow' | 'two_days' | 'next_week') => {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    if (preset === 'today') {
      start = today;
      end = today;
    } else if (preset === 'tomorrow') {
      start.setDate(today.getDate() + 1);
      end.setDate(today.getDate() + 1);
    } else if (preset === 'two_days') {
      start.setDate(today.getDate() + 1);
      end.setDate(today.getDate() + 2);
    } else if (preset === 'next_week') {
      // Find next Monday
      const day = today.getDay();
      const diffToMonday = (8 - day) % 7 || 7;
      start.setDate(today.getDate() + diffToMonday);
      end.setDate(today.getDate() + diffToMonday + 2); // 3 days
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  // Preset reasons
  const reasonPresets = [
    'Attending medical appointment and doctor-advised rest',
    'Urgent family obligation requiring immediate personal attendance',
    'Selected for Official BISE Examination Moderation Duty',
    'Participating in National STEM Teacher Development Workshop',
    'Personal domestic emergency requiring out-of-station transit'
  ];

  // Leave category definitions - dynamically built from active Leave Policies
  const leaveOptions = useMemo(() => {
    if (policies.length === 0) {
      return [
        {
          id: 'Casual',
          title: 'Casual Leave (CL)',
          description: 'Short unplanned personal absence',
          badge: quota ? `${quota.casual.remaining} left` : '14 left',
          color: 'border-amber-400 bg-amber-50 text-amber-900',
          colorHex: '#f59e0b',
          icon: Coffee
        }
      ];
    }

    return policies.map(p => {
      const balance = quota?.balances?.find(b => b.policyId === p.id);
      const remaining = balance !== undefined ? balance.remainingDays : p.annualDays;
      let IconComp = Coffee;
      const lower = p.name.toLowerCase();
      if (lower.includes('sick') || lower.includes('medical')) IconComp = HeartPulse;
      else if (lower.includes('duty') || lower.includes('academic')) IconComp = Award;
      else if (lower.includes('emergency')) IconComp = AlertCircle;
      else if (lower.includes('earned')) IconComp = CalendarRange;
      else if (lower.includes('maternity')) IconComp = HeartPulse;

      return {
        id: p.name,
        title: `${p.name} (${p.code})`,
        description: p.description,
        badge: `${remaining} left`,
        color: 'border-indigo-400 bg-indigo-50 text-indigo-900',
        colorHex: p.color,
        icon: IconComp
      };
    });
  }, [policies, quota]);

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim()) {
      showToast('Please provide a specific reason for your leave request.', 'error');
      return;
    }

    if (!startDate || !endDate) {
      showToast('Please select valid start and end dates.', 'error');
      return;
    }

    if (startDate > endDate) {
      showToast('End date cannot be prior to start date.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = submitLeaveApplication({
        applicantName: teacher.name,
        applicantId: teacher.id,
        applicantDesignation: teacher.designation,
        applicantDepartment: 'Science & Mathematics',
        applicantPhone: teacher.phone,
        applicantAvatar: teacher.imageUrl,
        role: 'Teacher',
        type: leaveType,
        startDate,
        endDate,
        reason: reason.trim(),
        backupTeacher: backupTeacher || 'Nasreen Akter',
        emergencyContact: emergencyContact || teacher.phone
      });

      if (result.success) {
        showToast(result.message || 'Leave request submitted successfully!', 'success');
        if (onSuccess) {
          onSuccess(result.leave);
        }
        // Reset form
        setReason('');
        setStartDate(getTomorrowStr());
        setEndDate(getTomorrowStr());
        onClose();
      } else {
        showToast('Failed to submit leave request.', 'error');
      }
    } catch (err: any) {
      console.error('Error submitting leave:', err);
      showToast(err.message || 'Something went wrong while submitting.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <CalendarRange size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-tight text-white">Quick Leave Request</h3>
                <span className="text-[10px] font-mono bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-bold uppercase">
                  Direct Dispatch
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Applying on behalf of <strong className="text-white">{teacher.name}</strong> ({teacher.id})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Close Modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          
          {/* ======================================================== */}
          {/* 1. LEAVE TYPE SELECTION */}
          {/* ======================================================== */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Coffee size={14} className="text-amber-500" />
                <span>Select Leave Category</span>
              </label>
              <span className="text-[11px] text-slate-500">Official Institutional Quota</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {leaveOptions.map((opt) => {
                const isSelected = leaveType.toLowerCase() === opt.id.toLowerCase();
                const IconComponent = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setLeaveType(opt.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? `${opt.color} shadow-xs ring-2 ring-indigo-500/30 font-bold`
                        : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-white/80' : 'bg-white shadow-2xs'}`}>
                        <IconComponent size={15} />
                      </div>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md font-bold ${
                        isSelected ? 'bg-black/10 text-slate-900' : 'bg-slate-200/80 text-slate-600'
                      }`}>
                        {opt.badge}
                      </span>
                    </div>
                    <div>
                      <div className="text-xs font-black leading-tight text-slate-900">{opt.title}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 leading-snug line-clamp-1">{opt.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ======================================================== */}
          {/* 2. DATES & DURATION */}
          {/* ======================================================== */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar size={14} className="text-indigo-600" />
                <span>Absence Dates</span>
              </label>

              {/* Quick Presets */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleDatePreset('today')}
                  className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => handleDatePreset('tomorrow')}
                  className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => handleDatePreset('two_days')}
                  className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  Next 2 Days
                </button>
                <button
                  type="button"
                  onClick={() => handleDatePreset('next_week')}
                  className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors hidden sm:inline-block"
                >
                  Next Week
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] font-bold text-slate-600 block mb-1">Start Date</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                  required
                />
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-600 block mb-1">End Date (Inclusive)</span>
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                  required
                />
              </div>
            </div>

            {/* Live Duration Calculation Pill */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <Clock size={13} className="text-slate-400" />
                <span className="text-xs text-slate-600">
                  Calculated Duration:
                </span>
                <span className="font-mono text-xs font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                  {daysCount} {daysCount === 1 ? 'Working Day' : 'Working Days'}
                </span>
              </div>

              {isDateInvalid && (
                <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                  <AlertCircle size={13} />
                  <span>Invalid Date Sequence</span>
                </span>
              )}
            </div>
          </div>

          {/* ======================================================== */}
          {/* 3. REASON FOR LEAVE */}
          {/* ======================================================== */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <FileText size={14} className="text-indigo-600" />
                <span>Reason for Absence</span>
                <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                {reason.length} chars
              </span>
            </div>

            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Clearly state the reason for absence for administrative review and classroom substitute assignment..."
              rows={3}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none shadow-2xs"
              required
            />

            {/* Quick Reason Suggestion Chips */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="text-[10.5px] font-bold text-slate-500 self-center mr-1">
                Quick Select:
              </span>
              {reasonPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setReason(preset)}
                  className="px-2 py-1 text-[10.5px] rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200/80 text-slate-600 cursor-pointer transition-colors text-left"
                >
                  + {preset.length > 36 ? `${preset.substring(0, 36)}...` : preset}
                </button>
              ))}
            </div>
          </div>

          {/* ======================================================== */}
          {/* 4. SUBSTITUTE TEACHER & EMERGENCY CONTACT */}
          {/* ======================================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1 flex items-center gap-1">
                <UserCheck size={13} className="text-emerald-600" />
                <span>Peer Substitute Teacher</span>
              </label>
              <select
                value={backupTeacher}
                onChange={(e) => setBackupTeacher(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs cursor-pointer"
              >
                <option value="Nasreen Akter (Senior Science Faculty)">Nasreen Akter (Chemistry & Bio)</option>
                <option value="Salma Khatun (Senior English Faculty)">Salma Khatun (English)</option>
                <option value="Md. Faruk Hossain (Senior Social Science)">Md. Faruk Hossain (Social Studies)</option>
                <option value="Dr. Shah Alam (Dean / Admin)">Dr. Shah Alam (Dean)</option>
              </select>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Colleague will oversee routine periods during your absence.
              </span>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1 flex items-center gap-1">
                <ShieldCheck size={13} className="text-indigo-600" />
                <span>Emergency Contact Phone</span>
              </label>
              <input
                type="text"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="e.g. 01700-000001"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Reachable contact number during absence days.
              </span>
            </div>
          </div>

          {/* ======================================================== */}
          {/* MODAL ACTION BUTTONS */}
          {/* ======================================================== */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-500 shrink-0" />
              <span>Instantly queued to Headmaster Sanction Desk.</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || isDateInvalid || !reason.trim()}
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Transmitting...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Submit Petition</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
