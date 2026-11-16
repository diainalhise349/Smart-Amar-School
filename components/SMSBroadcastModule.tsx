import React, { useState, useEffect, useMemo } from 'react';
import {
  Smartphone,
  Send,
  Radio,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Users,
  Search,
  RefreshCw,
  Sparkles,
  Filter,
  ChevronRight,
  Copy,
  Check,
  Info,
  Trash2,
  ArrowRight,
  Clock,
  Plus,
  PhoneCall,
  Zap,
  Flame,
  ExternalLink,
  Hash,
  Loader2,
  FileText,
  BadgeAlert,
  BookmarkPlus,
  Layers,
  Settings2,
  Calendar,
  CalendarDays,
  AlarmClock
} from 'lucide-react';
import { Card, Button, Badge, Modal, useToast } from './UIComponents';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  SMSRecipient,
  SMSCategory,
  SMSBroadcastRecord,
  SMSTemplatePreset,
  ScheduledSMSBroadcast,
  SMS_PRESET_TEMPLATES,
  getAvailableSMSRecipients,
  getSMSBroadcastHistory,
  clearSMSBroadcastHistory,
  getSMSTemplates,
  saveSMSTemplate,
  getScheduledSMSBroadcasts,
  saveScheduledSMSBroadcast,
  checkAndExecuteDueScheduledSMS,
  calculateSMSMeta,
  interpolateSMSText,
  dispatchSMSBroadcast,
  SMS_BROADCAST_EVENT,
  SMS_TEMPLATES_EVENT,
  SMS_SCHEDULED_EVENT
} from '../utils/smsBroadcastService';
import { SMSTemplateManager } from './SMSTemplateManager';
import { SMSScheduledManager } from './SMSScheduledManager';

export const SMSBroadcastModule: React.FC = () => {
  const { activeTenant } = useAuth();
  const { t } = useLanguage();
  const { addToast } = useToast();

  // All available parent recipients loaded from nominal roll
  const [allRecipients, setAllRecipients] = useState<SMSRecipient[]>(() => getAvailableSMSRecipients());
  
  // Filtering states
  const [classFilter, setClassFilter] = useState('ALL');
  const [sectionFilter, setSectionFilter] = useState('ALL');
  const [recipientSearch, setRecipientSearch] = useState('');
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<Set<string>>(() => 
    new Set(getAvailableSMSRecipients().map(r => r.studentId))
  );

  // Form states
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [category, setCategory] = useState<SMSCategory>('urgent');
  const [isUrgent, setIsUrgent] = useState(true);
  const [senderMask, setSenderMask] = useState(
    activeTenant?.name ? activeTenant.name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 11).toUpperCase() : 'SMART-SCHOOL'
  );
  const [messageBody, setMessageBody] = useState(
    'জরুরি বিজ্ঞপ্তি: প্রতিকূল আবহাওয়ার কারণে আগামীকাল [Date] তারিখে সকল ক্লাস স্থগিত থাকবে। সকল শিক্ষার্থীকে নিরাপদে ঘরে থাকার অনুরোধ রইল। - [SchoolName]'
  );
  
  // Custom manual numbers input
  const [manualPhoneInput, setManualPhoneInput] = useState('');
  const [includeCustomNumbers, setIncludeCustomNumbers] = useState(false);

  // Progress modal & Sending state
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [sentCount, setSentCount] = useState(0);

  // History & Log state
  const [broadcastLogs, setBroadcastLogs] = useState<SMSBroadcastRecord[]>(() => 
    getSMSBroadcastHistory(activeTenant?.id)
  );
  const [historySearch, setHistorySearch] = useState('');

  // Active view toggle between Composer, Scheduled Queue, Template Library, and Logs
  const [activeView, setActiveView] = useState<'composer' | 'scheduled' | 'templates' | 'history'>('composer');

  // Scheduling Form States
  const [sendMode, setSendMode] = useState<'now' | 'schedule'>('now');
  const [scheduledDate, setScheduledDate] = useState(() => {
    const d = new Date(Date.now() + 86400000);
    return d.toISOString().split('T')[0];
  });
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [scheduledList, setScheduledList] = useState<ScheduledSMSBroadcast[]>(() => 
    getScheduledSMSBroadcasts(activeTenant?.id)
  );

  // Templates list loaded from storage
  const [templatesList, setTemplatesList] = useState<SMSTemplatePreset[]>(() => 
    getSMSTemplates(activeTenant?.id)
  );

  // Quick "Save Current as Template" modal states
  const [isSaveTemplateModalOpen, setIsSaveTemplateModalOpen] = useState(false);
  const [saveTemplateTitle, setSaveTemplateTitle] = useState('');
  const [saveTemplateLang, setSaveTemplateLang] = useState<'bn' | 'en'>('bn');

  // Selected preset tab
  const [presetLang, setPresetLang] = useState<'bn' | 'en'>('bn');

  // Real-time listener for dispatched broadcasts
  useEffect(() => {
    const handleUpdate = () => {
      setBroadcastLogs(getSMSBroadcastHistory(activeTenant?.id));
    };
    window.addEventListener(SMS_BROADCAST_EVENT, handleUpdate);
    return () => window.removeEventListener(SMS_BROADCAST_EVENT, handleUpdate);
  }, [activeTenant?.id]);

  // Real-time listener for templates updates
  useEffect(() => {
    const handleTemplatesUpdate = () => {
      setTemplatesList(getSMSTemplates(activeTenant?.id));
    };
    window.addEventListener(SMS_TEMPLATES_EVENT, handleTemplatesUpdate);
    return () => window.removeEventListener(SMS_TEMPLATES_EVENT, handleTemplatesUpdate);
  }, [activeTenant?.id]);

  // Real-time listener for scheduled broadcasts
  useEffect(() => {
    const handleScheduledUpdate = () => {
      setScheduledList(getScheduledSMSBroadcasts(activeTenant?.id));
    };
    window.addEventListener(SMS_SCHEDULED_EVENT, handleScheduledUpdate);
    return () => window.removeEventListener(SMS_SCHEDULED_EVENT, handleScheduledUpdate);
  }, [activeTenant?.id]);

  // Periodic runner to check for due scheduled broadcasts
  useEffect(() => {
    const interval = setInterval(async () => {
      const executedCount = await checkAndExecuteDueScheduledSMS();
      if (executedCount > 0) {
        setScheduledList(getScheduledSMSBroadcasts(activeTenant?.id));
        setBroadcastLogs(getSMSBroadcastHistory(activeTenant?.id));
        addToast(`Automated Dispatch: Successfully sent ${executedCount} scheduled broadcast(s)!`, 'success');
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [activeTenant?.id, addToast]);

  // Derived filtered recipients list
  const filteredRecipients = useMemo(() => {
    return allRecipients.filter(r => {
      const matchClass = classFilter === 'ALL' || r.class === classFilter;
      const matchSec = sectionFilter === 'ALL' || r.section === sectionFilter;
      const matchSearch = !recipientSearch ||
        r.studentName.toLowerCase().includes(recipientSearch.toLowerCase()) ||
        r.guardianName.toLowerCase().includes(recipientSearch.toLowerCase()) ||
        r.phone.includes(recipientSearch) ||
        r.studentId.toLowerCase().includes(recipientSearch.toLowerCase());

      return matchClass && matchSec && matchSearch;
    });
  }, [allRecipients, classFilter, sectionFilter, recipientSearch]);

  // List of distinct classes for filter dropdown
  const distinctClasses = useMemo(() => {
    const classes = Array.from(new Set(allRecipients.map(r => r.class)));
    return classes.sort((a, b) => {
      const numA = parseInt(a.replace(/[^0-9]/g, '')) || 0;
      const numB = parseInt(b.replace(/[^0-9]/g, '')) || 0;
      return numA - numB;
    });
  }, [allRecipients]);

  // Target count
  const effectiveRecipientCount = useMemo(() => {
    const selectedFromList = filteredRecipients.filter(r => selectedRecipientIds.has(r.studentId)).length;
    let manualCount = 0;
    if (includeCustomNumbers && manualPhoneInput.trim()) {
      manualCount = manualPhoneInput.split(/[,\n]+/).map(p => p.trim()).filter(p => p.length >= 10).length;
    }
    return selectedFromList + manualCount;
  }, [filteredRecipients, selectedRecipientIds, includeCustomNumbers, manualPhoneInput]);

  // SMS Text Metainfo (GSM 7-bit vs Unicode/Bangla, parts, character count)
  const smsMeta = useMemo(() => {
    return calculateSMSMeta(messageBody);
  }, [messageBody]);

  // Estimated credits
  const totalEstimatedCredits = useMemo(() => {
    return effectiveRecipientCount * smsMeta.smsParts;
  }, [effectiveRecipientCount, smsMeta.smsParts]);

  // Sample resolved preview text
  const previewSampleRecipient = useMemo(() => {
    return filteredRecipients[0] || {
      studentName: 'RAHIM AHMED',
      guardianName: 'MR. ABDUR RAHIM',
      class: 'Class 10',
      section: 'A',
      rollNo: '01',
      phone: '01712-345678'
    };
  }, [filteredRecipients]);

  const resolvedPreviewText = useMemo(() => {
    return interpolateSMSText(messageBody, {
      guardianName: previewSampleRecipient.guardianName,
      studentName: previewSampleRecipient.studentName,
      className: previewSampleRecipient.class,
      rollNo: previewSampleRecipient.rollNo,
      schoolName: activeTenant?.name || 'Sonar Bangla High School'
    });
  }, [messageBody, previewSampleRecipient, activeTenant]);

  // Toggle selection
  const handleToggleSelectAll = () => {
    if (selectedRecipientIds.size === filteredRecipients.length) {
      setSelectedRecipientIds(new Set());
    } else {
      setSelectedRecipientIds(new Set(filteredRecipients.map(r => r.studentId)));
    }
  };

  const handleToggleRecipient = (id: string) => {
    setSelectedRecipientIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Insert Dynamic Tag
  const handleInsertTag = (tag: string) => {
    setMessageBody(prev => prev + ` ${tag} `);
  };

  // Apply Preset Template from Quick Bar or Library
  const handleApplyPreset = (template: SMSTemplatePreset) => {
    setMessageBody(template.content);
    setCategory(template.category);
    setIsUrgent(template.isUrgent);
    setBroadcastTitle(template.title.replace(/[^a-zA-Z0-9\u0980-\u09FF\s]/g, '').trim());
    setActiveView('composer');
    addToast(`Template '${template.title}' loaded into composer!`, 'info');
  };

  // Open Save Current Message as Template Modal
  const handleOpenSaveAsTemplate = () => {
    if (!messageBody.trim()) {
      addToast('Please type an SMS message body first before saving as a template.', 'error');
      return;
    }
    const isUnicode = /[^\u0000-\u007F]/.test(messageBody);
    setSaveTemplateTitle(broadcastTitle.trim() || (isUnicode ? 'কাস্টম নোটিশ টেমপ্লেট' : 'Custom Broadcast Template'));
    setSaveTemplateLang(isUnicode ? 'bn' : 'en');
    setIsSaveTemplateModalOpen(true);
  };

  // Confirm Save Current Message as Template
  const handleSaveCurrentAsTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveTemplateTitle.trim()) {
      addToast('Please provide a template title.', 'error');
      return;
    }

    try {
      const saved = saveSMSTemplate({
        title: saveTemplateTitle.trim(),
        category,
        isUrgent,
        language: saveTemplateLang,
        content: messageBody.trim(),
        tenantId: activeTenant?.id
      });

      addToast(`Template '${saved.title}' saved to library successfully!`, 'success');
      setIsSaveTemplateModalOpen(false);
      setTemplatesList(getSMSTemplates(activeTenant?.id));
    } catch (err) {
      addToast('Failed to save template', 'error');
    }
  };

  // Trigger Broadcast
  const handleBroadcastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageBody.trim()) {
      addToast('Please write your broadcast message before sending.', 'error');
      return;
    }

    if (effectiveRecipientCount === 0) {
      addToast('No parent recipients selected! Please select at least one contact.', 'error');
      return;
    }

    // Build recipient list
    const selectedRecipients = filteredRecipients.filter(r => selectedRecipientIds.has(r.studentId));
    
    // Add custom numbers if specified
    if (includeCustomNumbers && manualPhoneInput.trim()) {
      const manualNumbers = manualPhoneInput
        .split(/[,\n]+/)
        .map(p => p.trim())
        .filter(p => p.length >= 10);

      manualNumbers.forEach((phone, idx) => {
        selectedRecipients.push({
          studentId: `MANUAL-${idx + 1}`,
          studentName: 'Manual Entry',
          guardianName: 'Guardian',
          phone,
          class: classFilter !== 'ALL' ? classFilter : 'Custom Broadcast',
          section: 'All'
        });
      });
    }

    const audienceLabel = classFilter === 'ALL' 
      ? `All Parents (${effectiveRecipientCount} Recipients)`
      : `${classFilter} Parents (${effectiveRecipientCount} Recipients)`;

    // Check if scheduling for later
    if (sendMode === 'schedule') {
      if (!scheduledDate || !scheduledTime) {
        addToast('Please select a valid future date and time for the schedule.', 'error');
        return;
      }

      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
      const targetTimestamp = scheduledDateTime.getTime();

      if (targetTimestamp <= Date.now()) {
        addToast('Scheduled time must be in the future.', 'error');
        return;
      }

      try {
        const scheduledRecord = saveScheduledSMSBroadcast({
          title: broadcastTitle.trim() || (isUrgent ? 'Urgent Alert Broadcast' : 'School Announcement'),
          message: messageBody.trim(),
          category,
          senderId: senderMask,
          targetAudienceLabel: audienceLabel,
          recipients: selectedRecipients,
          scheduledFor: scheduledDateTime.toISOString(),
          scheduledTimestamp: targetTimestamp,
          isUrgent,
          tenantId: activeTenant?.id
        });

        const formattedTarget = scheduledDateTime.toLocaleString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        addToast(`Broadcast scheduled for ${formattedTarget}! Auto-dispatch armed for ${scheduledRecord.recipientCount} parents.`, 'success');
        setScheduledList(getScheduledSMSBroadcasts(activeTenant?.id));
        setActiveView('scheduled');
        return;
      } catch (err) {
        addToast('Failed to schedule SMS broadcast', 'error');
        return;
      }
    }

    try {
      setIsSending(true);
      setSendProgress(0);
      setSentCount(0);

      const record = await dispatchSMSBroadcast(
        {
          title: broadcastTitle || (isUrgent ? 'Urgent Alert Broadcast' : 'School Announcement'),
          message: messageBody,
          category,
          senderId: senderMask,
          targetAudienceLabel: audienceLabel,
          recipients: selectedRecipients,
          isUrgent,
          tenantId: activeTenant?.id,
          schoolName: activeTenant?.name
        },
        (percent, delivered) => {
          setSendProgress(percent);
          setSentCount(delivered);
        }
      );

      addToast(`Broadcast dispatched! ${record.recipientCount} SMS sent successfully via ${record.senderId}.`, 'success');
      
      // Reset composer on successful send
      setTimeout(() => {
        setIsSending(false);
      }, 700);
    } catch (err) {
      console.error('Failed to dispatch broadcast:', err);
      addToast('SMS Gateway error: Failed to dispatch broadcast.', 'error');
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top SMS Gateway Telemetry Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-none shadow-sm bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">SMS Gateway Status</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Radio size={18} className="animate-pulse" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-xl font-black text-emerald-600">BTCL Alpha Route</h3>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium flex items-center gap-1">
            <CheckCircle2 size={12} className="text-emerald-500" />
            Masking: <strong className="font-mono text-slate-800">{senderMask}</strong>
          </p>
        </Card>

        <Card className="p-4 border-none shadow-sm bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Available SMS Balance</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Zap size={18} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-2xl font-black text-slate-900">12,450</h3>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
              Credits
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            Postpaid institutional enterprise pool
          </p>
        </Card>

        <Card className="p-4 border-none shadow-sm bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Enrolled Parents</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-2xl font-black text-slate-900">{allRecipients.length}</h3>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
              Verified Mobiles
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            BD 11-digit mobile nominal records
          </p>
        </Card>

        <Card className="p-4 border-none shadow-sm bg-slate-900 text-white">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Telecom SLA</span>
            <div className="p-2 rounded-xl bg-white/10 text-emerald-400">
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-2xl font-black text-emerald-400">99.8%</h3>
            <span className="text-xs font-bold text-emerald-200">Delivery</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">
            GP, Robi, Banglalink, Teletalk DLR
          </p>
        </Card>
      </div>

      {/* Sub-View Navigation Tabs (Composer vs Template Library vs Audit Logs) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            id="view-composer-btn"
            onClick={() => setActiveView('composer')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeView === 'composer'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Send size={15} />
            <span>Broadcast Composer</span>
          </button>

          <button
            type="button"
            id="view-scheduled-btn"
            onClick={() => setActiveView('scheduled')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeView === 'scheduled'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-200 ring-2 ring-amber-300'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calendar size={15} />
            <span>Scheduled Queue</span>
            {scheduledList.filter(s => s.status === 'Scheduled').length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
                activeView === 'scheduled' ? 'bg-white text-amber-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {scheduledList.filter(s => s.status === 'Scheduled').length}
              </span>
            )}
          </button>

          <button
            type="button"
            id="view-templates-btn"
            onClick={() => setActiveView('templates')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeView === 'templates'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText size={15} />
            <span>Template Library & Manager</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
              activeView === 'templates' ? 'bg-white text-indigo-700' : 'bg-indigo-100 text-indigo-700'
            }`}>
              {templatesList.length}
            </span>
          </button>

          <button
            type="button"
            id="view-history-btn"
            onClick={() => setActiveView('history')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeView === 'history'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Clock size={15} />
            <span>Broadcast Audit Logs</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
              activeView === 'history' ? 'bg-white text-indigo-700' : 'bg-slate-200 text-slate-700'
            }`}>
              {broadcastLogs.length}
            </span>
          </button>
        </div>

        {activeView === 'composer' && (
          <button
            type="button"
            onClick={handleOpenSaveAsTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all cursor-pointer self-start sm:self-auto shadow-2xs"
          >
            <BookmarkPlus size={14} />
            <span>Save Message as Template</span>
          </button>
        )}
      </div>

      {/* VIEW: SCHEDULED QUEUE & MANAGER */}
      {activeView === 'scheduled' && (
        <Card className="p-6 border-slate-200 bg-white shadow-xs">
          <SMSScheduledManager onScheduleNew={() => {
            setSendMode('schedule');
            setActiveView('composer');
          }} />
        </Card>
      )}

      {/* VIEW: TEMPLATE LIBRARY & MANAGER */}
      {activeView === 'templates' && (
        <Card className="p-6 border-slate-200 bg-white shadow-xs">
          <SMSTemplateManager onSelectTemplate={handleApplyPreset} />
        </Card>
      )}

      {/* VIEW: COMPOSER OR HISTORY */}
      {activeView !== 'templates' && activeView !== 'scheduled' && (
        <>
          {activeView === 'composer' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* LEFT / CENTER: COMPOSER (8 cols) */}
              <div className="lg:col-span-8 space-y-6">
                <Card className="p-6 border-slate-200 bg-white shadow-xs space-y-6">
            
            {/* Header Title with Urgent Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                    <Radio size={20} className="text-rose-600" />
                    Bulk SMS Broadcast Composer
                  </h3>
                  {isUrgent && (
                    <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-rose-300 flex items-center gap-1 animate-pulse">
                      <Flame size={12} /> High Priority Alert
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Send immediate institutional updates, weather emergency announcements, or fee reminders directly to parent phones.
                </p>
              </div>

              {/* Priority Toggle Button */}
              <button
                type="button"
                onClick={() => setIsUrgent(!isUrgent)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isUrgent
                    ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-200'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <AlertTriangle size={14} className={isUrgent ? 'text-amber-300' : 'text-slate-500'} />
                <span>{isUrgent ? '🚨 Urgent Alert: ON' : 'Normal Priority'}</span>
              </button>
            </div>

            {/* Category Selector Buttons */}
            <div>
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-2">
                Broadcast Category & Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'urgent' as SMSCategory, label: 'Urgent Alert', icon: AlertTriangle, color: 'hover:border-rose-300 text-rose-700' },
                  { id: 'announcement' as SMSCategory, label: 'Announcement', icon: MessageSquare, color: 'hover:border-indigo-300 text-indigo-700' },
                  { id: 'exam' as SMSCategory, label: 'Exam & Results', icon: FileText, color: 'hover:border-blue-300 text-blue-700' },
                  { id: 'fee' as SMSCategory, label: 'Fee Reminder', icon: Zap, color: 'hover:border-emerald-300 text-emerald-700' },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = category === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setCategory(item.id);
                        if (item.id === 'urgent') setIsUrgent(true);
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-xs ring-1 ring-indigo-400'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Icon size={14} className={isSelected ? 'text-indigo-600' : 'text-slate-400'} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Broadcast Title & Sender Mask */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">
                  Internal Campaign Title
                </label>
                <input
                  type="text"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="e.g. Inclement Weather Holiday Notice (July 2026)"
                  className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">
                  Sender Masking ID (Alpha)
                </label>
                <input
                  type="text"
                  maxLength={11}
                  value={senderMask}
                  onChange={(e) => setSenderMask(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 ring-indigo-500 outline-none uppercase"
                />
              </div>
            </div>

            {/* Quick Template Presets Bar */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-slate-700 uppercase tracking-wider">
                  <Sparkles size={14} className="text-amber-500" />
                  <span>One-Click Reusable Presets</span>
                </div>
                
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setActiveView('templates')}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Manage Library ({templatesList.length})</span>
                    <ArrowRight size={11} />
                  </button>

                  {/* Language switch for templates */}
                  <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setPresetLang('bn')}
                      className={`px-2 py-0.5 rounded transition-colors ${presetLang === 'bn' ? 'bg-emerald-600 text-white font-black' : 'text-slate-600'}`}
                    >
                      বাংলা
                    </button>
                    <button
                      type="button"
                      onClick={() => setPresetLang('en')}
                      className={`px-2 py-0.5 rounded transition-colors ${presetLang === 'en' ? 'bg-indigo-600 text-white font-black' : 'text-slate-600'}`}
                    >
                      English
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid of templates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {templatesList.filter(t => t.language === presetLang).slice(0, 4).map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => handleApplyPreset(tmpl)}
                    className="p-2.5 text-left rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-xs transition-all text-xs group cursor-pointer"
                  >
                    <div className="font-bold text-slate-800 group-hover:text-indigo-600 flex items-center justify-between">
                      <span className="truncate">{tmpl.title}</span>
                      <ChevronRight size={12} className="text-slate-300 group-hover:text-indigo-600 shrink-0" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                      {tmpl.content}
                    </p>
                  </button>
                ))}
              </div>

              {templatesList.filter(t => t.language === presetLang).length > 4 && (
                <div className="text-right pt-1">
                  <button
                    type="button"
                    onClick={() => setActiveView('templates')}
                    className="text-[11px] font-bold text-indigo-600 hover:underline inline-flex items-center gap-1"
                  >
                    <span>View all {templatesList.filter(t => t.language === presetLang).length} templates in library</span>
                    <ArrowRight size={11} />
                  </button>
                </div>
              )}
            </div>

            {/* Dynamic Tag Injector Strip */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  SMS Message Body *
                </label>
                <span className="text-[11px] text-slate-400 font-medium">Click to insert dynamic variables:</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                {[
                  { tag: '[StudentName]', label: '+ Student Name' },
                  { tag: '[GuardianName]', label: '+ Guardian' },
                  { tag: '[Class]', label: '+ Class' },
                  { tag: '[Roll]', label: '+ Roll No' },
                  { tag: '[SchoolName]', label: '+ School Name' },
                  { tag: '[Date]', label: '+ Today Date' },
                ].map(item => (
                  <button
                    key={item.tag}
                    type="button"
                    onClick={() => handleInsertTag(item.tag)}
                    className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] border border-indigo-200 transition-colors cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Message Textarea */}
              <textarea
                rows={4}
                required
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                placeholder="Type your announcement message here. Dynamic tags will be replaced with specific student and parent values..."
                className="w-full text-xs font-medium p-3.5 border border-slate-300 rounded-xl focus:ring-2 ring-indigo-500 outline-none bg-slate-50 focus:bg-white leading-relaxed resize-y"
              />

              {/* Character and GSM SMS parts ticker */}
              <div className="mt-2 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-700">
                    Characters: <strong className="text-indigo-600 font-mono">{smsMeta.charCount}</strong>
                  </span>
                  <span>•</span>
                  <span className="font-bold text-slate-700">
                    SMS Parts: <strong className="text-emerald-700 font-mono">{smsMeta.smsParts} part(s)</strong>
                  </span>
                  <span>•</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    smsMeta.isUnicode ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {smsMeta.isUnicode ? 'Bangla / Unicode (70 chars/part)' : 'Standard GSM 7-Bit (160 chars/part)'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenSaveAsTemplate}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-indigo-50 hover:border-indigo-300 text-slate-700 hover:text-indigo-600 text-[11px] font-bold transition-all cursor-pointer shadow-2xs"
                  >
                    <BookmarkPlus size={13} className="text-indigo-600" />
                    <span>Save as Template</span>
                  </button>
                  <div className="text-right text-[11px] font-mono text-slate-400">
                    {smsMeta.charsRemainingInCurrentPart} chars left in part
                  </div>
                </div>
              </div>
            </div>

            {/* AUDIENCE TARGETING & RECIPIENT SELECTOR */}
            <div className="pt-4 border-t border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                    <Users size={16} className="text-indigo-600" />
                    Target Parent Audience & Contact Filter
                  </h4>
                  <p className="text-xs text-slate-500">
                    Filter by class, section, or search specific guardians.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Selected:</span>
                  <span className="bg-indigo-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-xs">
                    {effectiveRecipientCount} Parents
                  </span>
                </div>
              </div>

              {/* Filter controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Class selector */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase mb-1 block">Class Filter</label>
                  <select
                    value={classFilter}
                    onChange={(e) => setClassFilter(e.target.value)}
                    className="w-full text-xs font-bold border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white outline-none focus:ring-2 ring-indigo-500"
                  >
                    <option value="ALL">All Classes (Full Institution)</option>
                    {distinctClasses.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Section filter */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase mb-1 block">Section</label>
                  <select
                    value={sectionFilter}
                    onChange={(e) => setSectionFilter(e.target.value)}
                    className="w-full text-xs font-bold border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white outline-none focus:ring-2 ring-indigo-500"
                  >
                    <option value="ALL">All Sections (A, B, General)</option>
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="Science">Science</option>
                    <option value="Commerce">Commerce</option>
                  </select>
                </div>

                {/* Search */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase mb-1 block">Search Guardian / Student</label>
                  <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Name, phone, or roll..."
                      value={recipientSearch}
                      onChange={(e) => setRecipientSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none focus:ring-2 ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Recipient Selection Table Strip */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <div className="bg-slate-50 p-2.5 border-b border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleToggleSelectAll}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedRecipientIds.size > 0 && selectedRecipientIds.size === filteredRecipients.length}
                        onChange={handleToggleSelectAll}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span>Select All ({filteredRecipients.length})</span>
                    </button>
                  </div>

                  <span className="text-[11px] text-slate-400">
                    Showing {filteredRecipients.length} of {allRecipients.length} parents
                  </span>
                </div>

                <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 text-xs">
                  {filteredRecipients.map((rec) => {
                    const isChecked = selectedRecipientIds.has(rec.studentId);
                    return (
                      <div
                        key={rec.studentId}
                        onClick={() => handleToggleRecipient(rec.studentId)}
                        className={`p-2.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors ${
                          isChecked ? 'bg-indigo-50/30' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleRecipient(rec.studentId)}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div>
                            <span className="font-bold text-slate-800 uppercase">{rec.studentName}</span>
                            <span className="text-slate-400 text-[10px] ml-2">
                              {rec.class} ({rec.section}) • Roll: {rec.rollNo}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-slate-500 text-[11px] hidden sm:inline">{rec.guardianName}</span>
                          <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[11px]">
                            {rec.phone}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Optional Custom Additional Phone Numbers Drawer */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={includeCustomNumbers}
                    onChange={(e) => setIncludeCustomNumbers(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Add Custom / External Mobile Numbers</span>
                </label>

                {includeCustomNumbers && (
                  <div className="pt-1 space-y-1">
                    <textarea
                      rows={2}
                      value={manualPhoneInput}
                      onChange={(e) => setManualPhoneInput(e.target.value)}
                      placeholder="Paste mobile numbers separated by commas or new lines (e.g. 01712345678, 01819876543, 01912445566)..."
                      className="w-full text-xs font-mono p-2 border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 ring-indigo-500"
                    />
                    <span className="text-[10px] text-slate-400 block">
                      Useful for sending to managing committee members, guest parents, or external coordinators.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* DISPATCH TIMING & SCHEDULING MODE */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock size={14} className="text-indigo-600" />
                  Dispatch Timing & Scheduling
                </label>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setSendMode('now')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      sendMode === 'now'
                        ? 'bg-indigo-600 text-white shadow-xs font-black'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Send size={13} />
                    <span>Send Immediately</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSendMode('schedule')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      sendMode === 'schedule'
                        ? 'bg-amber-500 text-white shadow-xs font-black'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Calendar size={13} />
                    <span>Schedule for Later</span>
                  </button>
                </div>
              </div>

              {/* Schedule Date & Time Selectors */}
              {sendMode === 'schedule' && (
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                      <AlarmClock size={16} className="text-amber-600" />
                      <span>Set Future Date & Time for Automated Dispatch:</span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                      Automated Scheduler
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                        Dispatch Date *
                      </label>
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="w-full text-xs font-bold p-2.5 border border-amber-200 rounded-xl bg-white outline-none focus:ring-2 ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                        Dispatch Time (Local Time) *
                      </label>
                      <input
                        type="time"
                        required
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="w-full text-xs font-bold p-2.5 border border-amber-200 rounded-xl bg-white outline-none focus:ring-2 ring-amber-500"
                      />
                    </div>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider mr-1">Quick Presets:</span>
                    {[
                      {
                        label: 'Today 06:00 PM',
                        getDate: () => new Date().toISOString().split('T')[0],
                        time: '18:00'
                      },
                      {
                        label: 'Tomorrow 09:00 AM',
                        getDate: () => new Date(Date.now() + 86400000).toISOString().split('T')[0],
                        time: '09:00'
                      },
                      {
                        label: 'Tomorrow 06:30 PM',
                        getDate: () => new Date(Date.now() + 86400000).toISOString().split('T')[0],
                        time: '18:30'
                      },
                      {
                        label: 'In 2 Hours',
                        getDate: () => new Date(Date.now() + 7200000).toISOString().split('T')[0],
                        time: new Date(Date.now() + 7200000).toTimeString().slice(0, 5)
                      }
                    ].map(preset => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setScheduledDate(preset.getDate());
                          setScheduledTime(preset.time);
                        }}
                        className="text-[11px] font-bold px-2 py-1 rounded-lg bg-white border border-amber-200 text-amber-900 hover:bg-amber-100 transition-colors cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  <div className="p-2.5 bg-white/80 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-center gap-2">
                    <Clock size={13} className="text-amber-600 shrink-0" />
                    <span>
                      The system will automatically queue and broadcast this SMS on <strong>{new Date(`${scheduledDate}T${scheduledTime}`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {scheduledTime}</strong> to all selected recipients without requiring manual admin intervention.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* BROADCAST DISPATCH BUTTON */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500">
                <span className="block font-bold text-slate-700">Estimated Credit Usage:</span>
                <span className="text-[11px] text-slate-500">
                  {effectiveRecipientCount} Recipients × {smsMeta.smsParts} Parts = <strong className="text-indigo-600 font-mono font-black">{totalEstimatedCredits} SMS Credits</strong>
                </span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => {
                    setMessageBody('');
                    setBroadcastTitle('');
                  }}
                  className="text-xs font-bold"
                >
                  Clear Form
                </Button>

                <Button
                  id="dispatch-bulk-sms-btn"
                  type="button"
                  onClick={handleBroadcastSubmit}
                  disabled={isSending || effectiveRecipientCount === 0 || !messageBody.trim()}
                  className={`text-xs font-black px-6 py-2.5 text-white shadow-md transition-all flex items-center gap-2 cursor-pointer ${
                    sendMode === 'schedule'
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-amber-200'
                      : isUrgent
                      ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 shadow-rose-200'
                      : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                  }`}
                  icon={isSending ? Loader2 : sendMode === 'schedule' ? Calendar : Send}
                >
                  {isSending
                    ? 'Dispatching...'
                    : sendMode === 'schedule'
                    ? `Schedule Broadcast for ${new Date(`${scheduledDate}T${scheduledTime}`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} (${effectiveRecipientCount} Parents)`
                    : `Broadcast to ${effectiveRecipientCount} Parents`}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT: LIVE SMARTPHONE SMS MOCKUP PREVIEW (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-4 border-slate-200 bg-slate-900 text-white shadow-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Smartphone size={16} className="text-indigo-400" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                  Parent Device Live Preview
                </span>
              </div>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                Live Simulator
              </span>
            </div>

            {/* Smartphone Outer Shell */}
            <div className="w-full max-w-[280px] mx-auto bg-slate-950 rounded-[32px] p-3 shadow-2xl border-4 border-slate-800 relative">
              {/* Speaker & Camera Notch */}
              <div className="w-20 h-4 bg-slate-800 rounded-full mx-auto mb-2 flex items-center justify-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-900"></div>
                <div className="w-8 h-1 rounded-full bg-slate-700"></div>
              </div>

              {/* Screen Area */}
              <div className="bg-slate-100 text-slate-900 rounded-[22px] p-3 min-h-[380px] flex flex-col justify-between text-xs overflow-hidden">
                {/* Phone Header Bar */}
                <div className="text-center border-b border-slate-200 pb-2">
                  <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center mx-auto mb-1 shadow-xs">
                    {senderMask.substring(0, 2)}
                  </div>
                  <div className="font-black text-xs text-slate-900 uppercase tracking-tight">{senderMask}</div>
                  <div className="text-[9px] text-slate-400 font-medium">Official Verified SMS Sender</div>
                </div>

                {/* Date bubble */}
                <div className="my-3 text-center">
                  <span className="bg-slate-200 text-slate-600 text-[9px] font-bold px-2 py-0.5 rounded-full">
                    Today • 10:15 AM
                  </span>
                </div>

                {/* Incoming SMS Bubble */}
                <div className="space-y-1 flex-1">
                  <div className={`p-3 rounded-2xl text-[11px] leading-relaxed shadow-xs relative ${
                    isUrgent
                      ? 'bg-rose-50 border border-rose-200 text-slate-900 rounded-tl-xs'
                      : 'bg-white border border-slate-200 text-slate-900 rounded-tl-xs'
                  }`}>
                    {isUrgent && (
                      <div className="text-[10px] font-black text-rose-600 uppercase mb-1 flex items-center gap-1">
                        <AlertTriangle size={11} /> High Priority Alert
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{resolvedPreviewText || 'Your announcement message will appear here...'}</p>
                    
                    <div className="mt-2 pt-1 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400 font-mono">
                      <span>Ref: #{senderMask}-SMS</span>
                      <span>Now ✓✓</span>
                    </div>
                  </div>
                </div>

                {/* Simulated Quick Action footer */}
                <div className="mt-3 pt-2 border-t border-slate-200 text-center">
                  <span className="text-[9px] text-slate-400 block font-medium">
                    Delivered to: {previewSampleRecipient.phone}
                  </span>
                  <span className="text-[8.5px] text-indigo-600 font-bold">
                    Recipient: {previewSampleRecipient.guardianName}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-white/5 rounded-xl text-[11px] text-slate-300 space-y-1 border border-white/5">
              <div className="font-bold text-white flex items-center gap-1">
                <Info size={13} className="text-indigo-400" /> Dynamic Tag Resolution
              </div>
              <p className="text-[10px] text-slate-400">
                Sample preview shown above for student <strong>{previewSampleRecipient.studentName}</strong> ({previewSampleRecipient.class}).
              </p>
            </div>
          </Card>
        </div>
      </div>
      )}

      {/* HISTORICAL BROADCAST AUDIT LEDGER */}
      {(activeView === 'history' || activeView === 'composer') && (
        <Card className="p-0 border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="text-base font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
              <MessageSquare size={18} className="text-indigo-600" />
              Past SMS Broadcast Deliveries & Audit Ledger
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Complete dispatch history of mass announcements sent to parent contacts with telecom gateway receipt references.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search past broadcasts..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (window.confirm('Clear all historical broadcast logs?')) {
                  clearSMSBroadcastHistory();
                  setBroadcastLogs([]);
                  addToast('SMS broadcast history cleared.', 'info');
                }
              }}
              className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
            >
              Clear Logs
            </Button>
          </div>
        </div>

        {broadcastLogs.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-xs">
            No historical broadcasts recorded yet. Use the composer above to broadcast updates.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase font-black tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">Broadcast ID</th>
                  <th className="px-5 py-3.5">Campaign Title & Content</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Target Audience</th>
                  <th className="px-5 py-3.5 text-center">Parents Reached</th>
                  <th className="px-5 py-3.5 text-center">SMS Parts / Credits</th>
                  <th className="px-5 py-3.5 text-center">Delivery Status</th>
                  <th className="px-5 py-3.5">Dispatched At</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {broadcastLogs
                  .filter(b => {
                    const q = historySearch.toLowerCase();
                    return (
                      b.title.toLowerCase().includes(q) ||
                      b.message.toLowerCase().includes(q) ||
                      b.targetAudience.toLowerCase().includes(q) ||
                      b.id.toLowerCase().includes(q)
                    );
                  })
                  .map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold text-indigo-700">
                        {log.id}
                        <div className="text-[10px] text-slate-400 font-mono">{log.gatewayRef}</div>
                      </td>

                      <td className="px-5 py-3.5 max-w-xs">
                        <div className="font-bold text-slate-800 flex items-center gap-1.5 truncate">
                          {log.isUrgent && <AlertTriangle size={12} className="text-rose-600 shrink-0" />}
                          <span className="truncate">{log.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5" title={log.message}>
                          {log.message}
                        </p>
                      </td>

                      <td className="px-5 py-3.5">
                        <Badge color={
                          log.category === 'urgent' ? 'red' :
                          log.category === 'exam' ? 'blue' :
                          log.category === 'fee' ? 'green' : 'indigo'
                        }>
                          {log.category.toUpperCase()}
                        </Badge>
                      </td>

                      <td className="px-5 py-3.5 text-slate-700 font-medium">
                        {log.targetAudience}
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        <span className="font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-full text-xs">
                          {log.recipientCount} Parents
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        <span className="font-mono text-xs font-bold text-slate-700">
                          {log.smsParts} part ({log.creditsUsed} cr)
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        <Badge color="green">
                          <span className="flex items-center gap-1">
                            <Check size={11} /> {log.status}
                          </span>
                        </Badge>
                      </td>

                      <td className="px-5 py-3.5 text-slate-500 font-mono text-[11px]">
                        {log.dispatchedAt}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setMessageBody(log.message);
                            setBroadcastTitle(`Copy of ${log.title}`);
                            setCategory(log.category);
                            setIsUrgent(log.isUrgent);
                            addToast(`Loaded '${log.title}' into composer!`, 'info');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="px-2.5 py-1 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors cursor-pointer"
                        >
                          Duplicate
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      )}
      </>
      )}

      {/* DISPATCH PROGRESS MODAL */}
      <Modal
        isOpen={isSending}
        onClose={() => {}}
        title="Telecom Gateway SMS Broadcast in Progress"
        size="md"
      >
        <div className="py-6 text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-inner animate-pulse">
            <Radio size={36} />
          </div>

          <div className="space-y-1">
            <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">
              Broadcasting Messages to Telecom Carriers
            </h4>
            <p className="text-xs text-slate-500">
              Connecting to National DLR Gateway via BTCL Alpha Masking: <strong>{senderMask}</strong>
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2 max-w-sm mx-auto">
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div
                className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
                style={{ width: `${sendProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs font-bold text-slate-500">
              <span>{sendProgress}% Completed</span>
              <span className="font-mono text-indigo-700">{sentCount} / {effectiveRecipientCount} Delivered</span>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center justify-center gap-2">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span>Encrypted Carrier Batching Active • Delivery reports generating...</span>
          </div>
        </div>
      </Modal>

      {/* QUICK MODAL: SAVE CURRENT MESSAGE AS TEMPLATE */}
      <Modal
        isOpen={isSaveTemplateModalOpen}
        onClose={() => setIsSaveTemplateModalOpen(false)}
        title="Save Message as Reusable SMS Template"
        size="md"
      >
        <form onSubmit={handleSaveCurrentAsTemplate} className="space-y-4">
          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900 leading-relaxed">
            Save this broadcast message as a reusable template in your school's template library. You can rapidly reuse and modify it for future notifications.
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">
                Template Name / Label *
              </label>
              <input
                type="text"
                required
                value={saveTemplateTitle}
                onChange={(e) => setSaveTemplateTitle(e.target.value)}
                placeholder="e.g. বার্ষিক মূল্যায়ন ও অভিভাবক সমাবেশ"
                className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 ring-indigo-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">
                  Category
                </label>
                <div className="px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl bg-slate-100 text-slate-700 capitalize flex items-center justify-between">
                  <span>{category}</span>
                  {isUrgent && <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded font-black">Urgent</span>}
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">
                  Language
                </label>
                <select
                  value={saveTemplateLang}
                  onChange={(e) => setSaveTemplateLang(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 ring-indigo-500 outline-none"
                >
                  <option value="bn">বাংলা (Bangla)</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">
                Message Content Preview
              </label>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 max-h-36 overflow-y-auto leading-relaxed whitespace-pre-wrap">
                {messageBody}
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>{smsMeta.charCount} chars • {smsMeta.smsParts} SMS {smsMeta.smsParts > 1 ? 'parts' : 'part'}</span>
                <span className="font-mono text-indigo-700">{smsMeta.isUnicode ? 'Bangla / Unicode' : 'GSM 7-bit'}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsSaveTemplateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              id="confirm-save-template-btn"
              type="submit"
              variant="primary"
              size="sm"
              icon={Check}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-md shadow-indigo-100"
            >
              Save Template
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
