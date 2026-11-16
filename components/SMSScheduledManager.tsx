import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Send,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  MessageSquare,
  FileText,
  RotateCcw,
  Sparkles,
  Flame,
  Check,
  CalendarDays
} from 'lucide-react';
import { Card, Button, Badge, Modal, useToast } from './UIComponents';
import { useAuth } from '../context/AuthContext';
import {
  ScheduledSMSBroadcast,
  getScheduledSMSBroadcasts,
  updateScheduledSMSBroadcast,
  cancelScheduledSMSBroadcast,
  deleteScheduledSMSBroadcast,
  dispatchScheduledSMSNow,
  SMS_SCHEDULED_EVENT
} from '../utils/smsBroadcastService';

interface SMSScheduledManagerProps {
  onScheduleNew?: () => void;
}

export const SMSScheduledManager: React.FC<SMSScheduledManagerProps> = ({
  onScheduleNew
}) => {
  const { activeTenant } = useAuth();
  const { addToast } = useToast();

  const [schedules, setSchedules] = useState<ScheduledSMSBroadcast[]>(() => 
    getScheduledSMSBroadcasts(activeTenant?.id)
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Scheduled' | 'Dispatched' | 'Cancelled'>('ALL');
  const [isProcessing, setIsProcessing] = useState(false);

  // Edit / Reschedule Modal state
  const [editingSchedule, setEditingSchedule] = useState<ScheduledSMSBroadcast | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editMessage, setEditMessage] = useState('');

  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Sync schedules on window event
  useEffect(() => {
    const handleUpdate = () => {
      setSchedules(getScheduledSMSBroadcasts(activeTenant?.id));
    };

    window.addEventListener(SMS_SCHEDULED_EVENT, handleUpdate);
    return () => window.removeEventListener(SMS_SCHEDULED_EVENT, handleUpdate);
  }, [activeTenant?.id]);

  // Filtered schedules
  const filteredSchedules = useMemo(() => {
    return schedules.filter(item => {
      const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
      const matchSearch = !searchQuery.trim() ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.targetAudienceLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase());

      return matchStatus && matchSearch;
    });
  }, [schedules, statusFilter, searchQuery]);

  const activeScheduledCount = useMemo(() => {
    return schedules.filter(s => s.status === 'Scheduled').length;
  }, [schedules]);

  // Format remaining time
  const formatTimeRemaining = (timestamp: number) => {
    const diff = timestamp - Date.now();
    if (diff <= 0) return 'Due now / Processing';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `In ${days}d ${remHours}h`;
    }
    if (hours > 0) {
      return `In ${hours}h ${minutes}m`;
    }
    return `In ${minutes} minutes`;
  };

  // Immediate Send Now
  const handleSendNow = async (item: ScheduledSMSBroadcast) => {
    if (!window.confirm(`Trigger automated dispatch now for '${item.title}' to ${item.recipientCount} parents?`)) {
      return;
    }

    try {
      setIsProcessing(true);
      addToast(`Connecting to telecom gateway to dispatch '${item.title}'...`, 'info');
      const result = await dispatchScheduledSMSNow(item.id);
      addToast(`Successfully dispatched scheduled broadcast to ${result.recipientCount} parents!`, 'success');
      setSchedules(getScheduledSMSBroadcasts(activeTenant?.id));
    } catch (err) {
      addToast('Failed to dispatch scheduled broadcast', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (item: ScheduledSMSBroadcast) => {
    setEditingSchedule(item);
    setEditTitle(item.title);
    setEditMessage(item.message);

    const d = new Date(item.scheduledTimestamp);
    const dateStr = d.toISOString().split('T')[0];
    const timeStr = d.toTimeString().slice(0, 5);
    setEditDate(dateStr);
    setEditTime(timeStr);
  };

  // Save Edit / Reschedule
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSchedule) return;

    if (!editDate || !editTime) {
      addToast('Please select valid future date and time', 'error');
      return;
    }

    const scheduledDateObj = new Date(`${editDate}T${editTime}`);
    const newTimestamp = scheduledDateObj.getTime();

    if (newTimestamp <= Date.now()) {
      addToast('Scheduled time must be in the future', 'error');
      return;
    }

    try {
      updateScheduledSMSBroadcast(editingSchedule.id, {
        title: editTitle.trim(),
        message: editMessage.trim(),
        scheduledFor: scheduledDateObj.toISOString(),
        scheduledTimestamp: newTimestamp,
        status: 'Scheduled'
      });

      addToast(`Schedule for '${editTitle}' updated successfully!`, 'success');
      setEditingSchedule(null);
      setSchedules(getScheduledSMSBroadcasts(activeTenant?.id));
    } catch (err) {
      addToast('Failed to update schedule', 'error');
    }
  };

  // Cancel Schedule
  const handleCancelSchedule = (id: string) => {
    if (window.confirm('Cancel this scheduled broadcast? It will not be sent automatically.')) {
      cancelScheduledSMSBroadcast(id);
      addToast('Scheduled broadcast cancelled.', 'info');
      setSchedules(getScheduledSMSBroadcasts(activeTenant?.id));
    }
  };

  // Delete Schedule
  const handleDeleteSchedule = (id: string) => {
    deleteScheduledSMSBroadcast(id);
    addToast('Scheduled broadcast removed.', 'info');
    setDeleteConfirmId(null);
    setSchedules(getScheduledSMSBroadcasts(activeTenant?.id));
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <CalendarDays size={20} />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>Automated Scheduled SMS Queue</span>
                <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-bold">
                  {activeScheduledCount} Active Pending
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Set future dates and times for automated parent announcements, exam timetable releases, and fee reminders.
              </p>
            </div>
          </div>
        </div>

        {onScheduleNew && (
          <Button
            type="button"
            variant="primary"
            size="sm"
            icon={Calendar}
            onClick={onScheduleNew}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-md shadow-indigo-100 text-xs self-start sm:self-auto"
          >
            Schedule New Broadcast
          </Button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scheduled broadcasts by title, audience, or message..."
              className="w-full pl-9 pr-3 py-2 text-xs font-medium border border-slate-200 rounded-xl bg-white focus:ring-2 ring-indigo-500 outline-none"
            />
          </div>

          <div className="sm:col-span-4">
            <div className="grid grid-cols-4 gap-1 bg-white p-1 rounded-xl border border-slate-200 text-[11px] font-bold text-center">
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                className={`py-1 rounded-lg transition-all ${
                  statusFilter === 'ALL' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('Scheduled')}
                className={`py-1 rounded-lg transition-all ${
                  statusFilter === 'Scheduled' ? 'bg-amber-500 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('Dispatched')}
                className={`py-1 rounded-lg transition-all ${
                  statusFilter === 'Dispatched' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sent
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('Cancelled')}
                className={`py-1 rounded-lg transition-all ${
                  statusFilter === 'Cancelled' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Void
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Schedules List */}
      {filteredSchedules.length === 0 ? (
        <div className="text-center py-12 px-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
          <Calendar size={36} className="mx-auto text-slate-300 mb-2" />
          <h4 className="text-sm font-black text-slate-700">No scheduled SMS broadcasts found</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Schedule future automated broadcasts by selecting "Schedule for Later" in the SMS composer.
          </p>
          {onScheduleNew && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={Calendar}
              onClick={onScheduleNew}
              className="mt-4 text-xs font-bold"
            >
              Schedule an Announcement
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredSchedules.map((item) => {
            const isDeleting = deleteConfirmId === item.id;
            const scheduledDate = new Date(item.scheduledTimestamp);
            const formattedDate = scheduledDate.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });
            const formattedTime = scheduledDate.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            });
            const isPastDue = item.status === 'Scheduled' && item.scheduledTimestamp <= Date.now();

            return (
              <div
                key={item.id}
                className={`rounded-2xl border transition-all p-4.5 bg-white ${
                  item.status === 'Scheduled'
                    ? 'border-amber-200 shadow-xs hover:border-amber-300 hover:shadow-md'
                    : item.status === 'Dispatched'
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-slate-200 opacity-80'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column: Scheduled Timing & Badge */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Status Badge */}
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1 ${
                        item.status === 'Scheduled'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : item.status === 'Dispatched'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-100 text-slate-700 border border-slate-300'
                      }`}>
                        {item.status === 'Scheduled' ? (
                          <>
                            <Clock size={11} className="text-amber-600 animate-spin" />
                            <span>{formatTimeRemaining(item.scheduledTimestamp)}</span>
                          </>
                        ) : item.status === 'Dispatched' ? (
                          <>
                            <CheckCircle2 size={11} className="text-emerald-600" />
                            <span>Dispatched</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={11} className="text-slate-500" />
                            <span>Cancelled</span>
                          </>
                        )}
                      </span>

                      {/* Scheduled Date/Time Badge */}
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                        <Calendar size={12} className="text-indigo-600" />
                        <span>{formattedDate} at {formattedTime}</span>
                      </div>

                      {item.isUrgent && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1">
                          <Flame size={10} />
                          Urgent
                        </span>
                      )}

                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black capitalize bg-indigo-50 text-indigo-700">
                        {item.category}
                      </span>

                      <span className="text-[10px] font-mono text-slate-400">
                        ID: {item.id}
                      </span>
                    </div>

                    {/* Campaign Title */}
                    <h4 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                      {item.title}
                    </h4>

                    {/* Message Preview */}
                    <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 font-normal leading-relaxed">
                      {item.message}
                    </p>

                    {/* Target Audience & Metrics Row */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                      <span className="font-bold text-slate-700 flex items-center gap-1">
                        <Users size={13} className="text-indigo-600" />
                        {item.targetAudienceLabel} ({item.recipientCount} Parents)
                      </span>
                      <span>•</span>
                      <span>{item.charCount} chars ({item.smsParts} part)</span>
                      <span>•</span>
                      <span className="font-bold text-indigo-700">Est. {item.creditsEstimated} Credits</span>
                      {item.dispatchedAt && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-700 font-bold">Sent at: {item.dispatchedAt}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex flex-wrap lg:flex-col items-center lg:items-end justify-end gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    {item.status === 'Scheduled' && (
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        icon={Send}
                        disabled={isProcessing}
                        onClick={() => handleSendNow(item)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-xs"
                      >
                        Send Now
                      </Button>
                    )}

                    <div className="flex items-center gap-1">
                      {item.status === 'Scheduled' && (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            icon={Edit2}
                            onClick={() => handleOpenEdit(item)}
                            className="text-xs font-bold text-slate-700 hover:text-indigo-600"
                          >
                            Reschedule
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelSchedule(item.id)}
                            className="text-xs font-bold text-amber-700 hover:bg-amber-50 border-amber-200"
                          >
                            Cancel
                          </Button>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(isDeleting ? null : item.id)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isDeleting ? 'bg-rose-100 text-rose-700' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                        }`}
                        title="Delete schedule record"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {isDeleting && (
                      <div className="w-full mt-2 p-2 bg-rose-50 border border-rose-200 rounded-xl text-xs flex items-center justify-between gap-2">
                        <span className="text-rose-900 font-bold">Delete?</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2 py-0.5 text-[11px] font-bold text-slate-600 hover:bg-rose-100 rounded"
                          >
                            No
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSchedule(item.id)}
                            className="px-2 py-0.5 text-[11px] font-black text-white bg-rose-600 rounded"
                          >
                            Yes
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: RESCHEDULE / EDIT */}
      <Modal
        isOpen={Boolean(editingSchedule)}
        onClose={() => setEditingSchedule(null)}
        title="Reschedule / Edit Scheduled SMS Broadcast"
        size="md"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
            Update the dispatch timestamp or message content. The automated dispatch engine will fire this broadcast once the configured time is reached.
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">
                Campaign Title
              </label>
              <input
                type="text"
                required
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 ring-indigo-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">
                  Scheduled Date *
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">
                  Scheduled Time *
                </label>
                <input
                  type="time"
                  required
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">
                Message Content
              </label>
              <textarea
                rows={3}
                required
                value={editMessage}
                onChange={(e) => setEditMessage(e.target.value)}
                className="w-full text-xs font-medium p-3 border border-slate-200 rounded-xl focus:ring-2 ring-indigo-500 outline-none bg-slate-50 focus:bg-white leading-relaxed resize-y"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditingSchedule(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              icon={Check}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-md shadow-indigo-100"
            >
              Save Schedule
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
