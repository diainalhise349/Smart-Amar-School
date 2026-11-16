import { Student } from '../types';
import { getStoredStudents } from './studentStorage';

export interface SMSRecipient {
  studentId: string;
  studentName: string;
  guardianName: string;
  phone: string;
  class: string;
  section: string;
  rollNo?: string;
}

export type SMSCategory = 'urgent' | 'announcement' | 'exam' | 'fee' | 'general';

export interface SMSBroadcastPayload {
  title: string;
  message: string;
  category: SMSCategory;
  senderId: string;
  targetAudienceLabel: string;
  recipients: SMSRecipient[];
  isUrgent?: boolean;
  tenantId?: string;
  schoolName?: string;
}

export interface SMSBroadcastRecord {
  id: string;
  title: string;
  message: string;
  category: SMSCategory;
  senderId: string;
  targetAudience: string;
  recipientCount: number;
  recipientSample: string[];
  charCount: number;
  smsParts: number;
  creditsUsed: number;
  dispatchedAt: string;
  timestamp: number;
  status: 'Delivered' | 'Partially Delivered' | 'Queued';
  isUrgent: boolean;
  gatewayRef: string;
  tenantId?: string;
}

export interface SMSTemplatePreset {
  id: string;
  title: string;
  category: SMSCategory;
  isUrgent: boolean;
  content: string;
  language: 'bn' | 'en';
  description?: string;
  isCustom?: boolean;
  createdAt?: number;
  updatedAt?: number;
  tenantId?: string;
}

export interface ScheduledSMSBroadcast {
  id: string;
  title: string;
  message: string;
  category: SMSCategory;
  senderId: string;
  targetAudienceLabel: string;
  recipients: SMSRecipient[];
  recipientCount: number;
  recipientSample: string[];
  charCount: number;
  smsParts: number;
  creditsEstimated: number;
  scheduledFor: string; // ISO string e.g. "2026-11-15T09:00"
  scheduledTimestamp: number;
  status: 'Scheduled' | 'Dispatched' | 'Cancelled';
  isUrgent: boolean;
  createdAt: number;
  tenantId?: string;
  autoDispatchEnabled: boolean;
  dispatchedAt?: string;
  gatewayRef?: string;
}

const STORAGE_KEY = 'smart_school_sms_broadcast_logs_v1';
export const SMS_BROADCAST_EVENT = 'smart_school_sms_broadcast_event';

export const SMS_TEMPLATES_STORAGE_KEY = 'smart_school_sms_templates_v2';
export const SMS_TEMPLATES_EVENT = 'smart_school_sms_templates_event';

export const SMS_SCHEDULED_STORAGE_KEY = 'smart_school_sms_scheduled_v2';
export const SMS_SCHEDULED_EVENT = 'smart_school_sms_scheduled_event';

/**
 * Pre-configured bilingual templates for quick broadcast selection
 */
export const SMS_PRESET_TEMPLATES: SMSTemplatePreset[] = [
  {
    id: 'tmpl-urgent-closure',
    title: '🚨 জরুরি আবহাওয়া/ছুটি সংক্রান্ত বিজ্ঞপ্তি',
    category: 'urgent',
    isUrgent: true,
    language: 'bn',
    content: 'জরুরি বিজ্ঞপ্তি: বিরূপ আবহাওয়ার কারণে আগামীকাল [Date] বিদ্যালয় বন্ধ থাকবে। সকল শিক্ষার্থীকে ঘরে অবস্থান করার পরামর্শ দেওয়া হলো। - [SchoolName]'
  },
  {
    id: 'tmpl-urgent-dismissal',
    title: '⚠️ দ্রুত ছুটি সংক্রান্ত জরুরি বার্তা',
    category: 'urgent',
    isUrgent: true,
    language: 'bn',
    content: 'জরুরি বার্তা: অনিবার্য কারণবশত আজ বেলা ১২:৩০ মিনিটে সকল শ্রেণি ছুটি ঘোষণা করা হলো। শিক্ষার্থীকে নিরাপদে বাড়ি ফিরিয়ে নেওয়ার অনুরোধ রইলো। - [SchoolName]'
  },
  {
    id: 'tmpl-ptm-bn',
    title: '👥 অভিভাবক সমাবেশ ও প্রগ্রেস রিপোর্ট',
    category: 'announcement',
    isUrgent: false,
    language: 'bn',
    content: 'শ্রদ্ধেয় অভিভাবক, আগামী শনিবার সকাল ১০:০০ টায় [StudentName]-এর বার্ষিক অভিভাবক সভা ও মূল্যায়ন পত্র বিতরণ অনুষ্ঠিত হবে। আপনার উপস্থিতি কামনা করছি। - [SchoolName]'
  },
  {
    id: 'tmpl-exam-bn',
    title: '📝 সাময়িক পরীক্ষার সময়সূচি ও প্রবেশপত্র',
    category: 'exam',
    isUrgent: false,
    language: 'bn',
    content: 'সম্মানিত অভিভাবক, আগামী ১৫ তারিখ হতে অর্ধবার্ষিক পরীক্ষা শুরু হবে। [StudentName]-এর প্রবেশপত্র অফিস কাউন্টারে পাওয়া যাচ্ছে। রুটিন দেখুন পোর্টালে। - [SchoolName]'
  },
  {
    id: 'tmpl-fee-bn',
    title: '💳 মাসিক টিউশন ফি পরিশোধের অনুরোধ',
    category: 'fee',
    isUrgent: false,
    language: 'bn',
    content: 'শ্রদ্ধেয় অভিভাবক, [StudentName]-এর চলতি মাসের বকেয়া ফি পরিশোধের শেষ তারিখ [Date]। বিকাশ বা স্কুলের কাউন্টারে সরাসরি ফি জমা দেওয়া যাবে। - [SchoolName]'
  },
  {
    id: 'tmpl-urgent-weather-en',
    title: '🚨 Emergency Weather Closure Notice',
    category: 'urgent',
    isUrgent: true,
    language: 'en',
    content: 'URGENT: Due to severe weather advisories, [SchoolName] will remain closed on [Date]. Online classes will resume per standard schedule. - Principal'
  },
  {
    id: 'tmpl-ptm-en',
    title: '📢 Parents-Teachers Meeting (PTM) Invitation',
    category: 'announcement',
    isUrgent: false,
    language: 'en',
    content: 'Dear Guardian, You are cordially invited to the Parents-Teachers Meeting for [StudentName] ([Class]) this Saturday at 10:00 AM. Your presence is valued. - [SchoolName]'
  },
  {
    id: 'tmpl-exam-en',
    title: '📝 Examination Timetable & Admit Card Alert',
    category: 'exam',
    isUrgent: false,
    language: 'en',
    content: 'Dear Guardian, First Term Examinations begin next week. Please collect [StudentName] Admit Card from the school desk by [Date]. Detailed routine in portal. - [SchoolName]'
  }
];

/**
 * Retrieves all templates (system presets + custom user-created/edited templates)
 */
export function getSMSTemplates(tenantId?: string): SMSTemplatePreset[] {
  try {
    const raw = localStorage.getItem(SMS_TEMPLATES_STORAGE_KEY);
    if (!raw) {
      // Seed initial default presets
      const initial = SMS_PRESET_TEMPLATES.map(t => ({
        ...t,
        isCustom: false,
        createdAt: Date.now() - 86400000 * 10,
        updatedAt: Date.now() - 86400000 * 10
      }));
      localStorage.setItem(SMS_TEMPLATES_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed: SMSTemplatePreset[] = JSON.parse(raw);
    if (tenantId) {
      return parsed.filter(t => !t.tenantId || t.tenantId === tenantId);
    }
    return parsed;
  } catch (err) {
    console.error('Failed to load SMS templates:', err);
    return SMS_PRESET_TEMPLATES;
  }
}

/**
 * Creates or updates an SMS template
 */
export function saveSMSTemplate(template: Omit<SMSTemplatePreset, 'id'> & { id?: string }): SMSTemplatePreset {
  try {
    const currentList = getSMSTemplates();
    const now = Date.now();
    let finalTemplate: SMSTemplatePreset;

    if (template.id && currentList.some(t => t.id === template.id)) {
      // Update existing
      finalTemplate = {
        ...template,
        id: template.id,
        isCustom: true,
        updatedAt: now,
        createdAt: currentList.find(t => t.id === template.id)?.createdAt || now
      };
      const updatedList = currentList.map(t => (t.id === template.id ? finalTemplate : t));
      localStorage.setItem(SMS_TEMPLATES_STORAGE_KEY, JSON.stringify(updatedList));
    } else {
      // Create new
      const newId = template.id || `tmpl-custom-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`;
      finalTemplate = {
        ...template,
        id: newId,
        isCustom: true,
        createdAt: now,
        updatedAt: now
      };
      const updatedList = [finalTemplate, ...currentList];
      localStorage.setItem(SMS_TEMPLATES_STORAGE_KEY, JSON.stringify(updatedList));
    }

    window.dispatchEvent(new CustomEvent(SMS_TEMPLATES_EVENT, { detail: finalTemplate }));
    return finalTemplate;
  } catch (err) {
    console.error('Failed to save SMS template:', err);
    throw err;
  }
}

/**
 * Deletes an SMS template by ID
 */
export function deleteSMSTemplate(id: string): boolean {
  try {
    const currentList = getSMSTemplates();
    const updatedList = currentList.filter(t => t.id !== id);
    localStorage.setItem(SMS_TEMPLATES_STORAGE_KEY, JSON.stringify(updatedList));
    window.dispatchEvent(new CustomEvent(SMS_TEMPLATES_EVENT, { detail: { deletedId: id } }));
    return true;
  } catch (err) {
    console.error('Failed to delete SMS template:', err);
    return false;
  }
}

/**
 * Resets templates back to default system presets
 */
export function resetSMSTemplatesToDefaults(): SMSTemplatePreset[] {
  try {
    const initial = SMS_PRESET_TEMPLATES.map(t => ({
      ...t,
      isCustom: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }));
    localStorage.setItem(SMS_TEMPLATES_STORAGE_KEY, JSON.stringify(initial));
    window.dispatchEvent(new CustomEvent(SMS_TEMPLATES_EVENT));
    return initial;
  } catch (err) {
    console.error('Failed to reset templates:', err);
    return SMS_PRESET_TEMPLATES;
  }
}

/**
 * Calculates SMS parts based on GSM 7-bit (160 chars) or Unicode/Bangla (70 chars)
 */
export function calculateSMSMeta(text: string) {
  const isUnicode = /[^\u0000-\u007F]/.test(text);
  const length = text.length;
  
  let partSize = isUnicode ? 70 : 160;
  let multipartSize = isUnicode ? 67 : 153;

  let parts = 1;
  if (length > partSize) {
    parts = Math.ceil(length / multipartSize);
  }

  return {
    isUnicode,
    charCount: length,
    smsParts: length === 0 ? 0 : parts,
    charsRemainingInCurrentPart: parts === 1 ? Math.max(0, partSize - length) : Math.max(0, (parts * multipartSize) - length)
  };
}

/**
 * Resolves dynamic tags in SMS message text
 */
export function interpolateSMSText(
  template: string, 
  data: {
    guardianName?: string;
    studentName?: string;
    className?: string;
    rollNo?: string;
    schoolName?: string;
    date?: string;
  }
): string {
  const nowStr = data.date || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  return template
    .replace(/\[GuardianName\]|\[Guardian\]/gi, data.guardianName || 'Guardian')
    .replace(/\[StudentName\]|\[Student\]/gi, data.studentName || 'Student')
    .replace(/\[Class\]|\[ClassName\]/gi, data.className || 'Class')
    .replace(/\[Roll\]|\[RollNo\]/gi, data.rollNo || '01')
    .replace(/\[SchoolName\]|\[School\]/gi, data.schoolName || 'Amar Smart School')
    .replace(/\[Date\]/gi, nowStr);
}

/**
 * Default historical mock records
 */
const DEFAULT_BROADCAST_LOGS: SMSBroadcastRecord[] = [
  {
    id: 'SMS-BRD-981204',
    title: 'জরুরি আবহাওয়া জনিত বিদ্যালয় বন্ধের নোটিশ',
    message: 'জরুরি বিজ্ঞপ্তি: অতিবৃষ্টি ও জলাবদ্ধতার কারণে আগামীকাল সকল শ্রেণির পাঠদান স্থগিত থাকবে। শিক্ষার্থী ও অভিভাবকদের নিরাপদে থাকার অনুরোধ করা হলো। - সোনার বাংলা আদর্শ উচ্চ বিদ্যালয়',
    category: 'urgent',
    senderId: 'SONAR-BANGLA',
    targetAudience: 'All Parents (Institution-wide)',
    recipientCount: 420,
    recipientSample: ['01712-345678', '01819-876543', '01912-445566', '01755-667788'],
    charCount: 145,
    smsParts: 3,
    creditsUsed: 1260,
    dispatchedAt: 'Yesterday, 07:30 PM',
    timestamp: Date.now() - 86400000,
    status: 'Delivered',
    isUrgent: true,
    gatewayRef: 'BTCL-GW-99214'
  },
  {
    id: 'SMS-BRD-981198',
    title: 'অর্ধবার্ষিক পরীক্ষার সময়সূচি ও প্রবেশপত্র বিতরণ',
    message: 'সম্মানিত অভিভাবক, আগামী সোমবার হতে অর্ধবার্ষিক পরীক্ষা শুরু হবে। প্রবেশপত্র ও ফি ক্লিয়ারেন্স সম্পন্ন করার অনুরোধ করা হচ্ছে। - ঢাকা সিটি বিদ্যাপীঠ',
    category: 'exam',
    senderId: 'SMART-SCHOOL',
    targetAudience: 'Class 9 & 10 Parents',
    recipientCount: 165,
    recipientSample: ['01711-223344', '01688-990011', '01552-334455'],
    charCount: 122,
    smsParts: 2,
    creditsUsed: 330,
    dispatchedAt: '3 days ago, 11:15 AM',
    timestamp: Date.now() - 86400000 * 3,
    status: 'Delivered',
    isUrgent: false,
    gatewayRef: 'BTCL-GW-99182'
  },
  {
    id: 'SMS-BRD-981180',
    title: 'অভিভাবক ও শিক্ষক সম্মেলন (PTM) আমন্ত্রণ',
    message: 'Dear Guardian, You are cordially invited to attend the Annual Parents-Teachers Meeting this Saturday at 10:00 AM. Your attendance is highly appreciated. - Smart Amar School',
    category: 'announcement',
    senderId: 'SMART-SCHOOL',
    targetAudience: 'All Primary Section Parents',
    recipientCount: 280,
    recipientSample: ['01712-998877', '01819-112233'],
    charCount: 164,
    smsParts: 2,
    creditsUsed: 560,
    dispatchedAt: '5 days ago, 04:00 PM',
    timestamp: Date.now() - 86400000 * 5,
    status: 'Delivered',
    isUrgent: false,
    gatewayRef: 'BTCL-GW-99150'
  }
];

/**
 * Retrieves all broadcast logs from localStorage
 */
export function getSMSBroadcastHistory(tenantId?: string): SMSBroadcastRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_BROADCAST_LOGS));
      return DEFAULT_BROADCAST_LOGS;
    }
    const parsed: SMSBroadcastRecord[] = JSON.parse(raw);
    if (tenantId) {
      return parsed.filter(p => !p.tenantId || p.tenantId === tenantId);
    }
    return parsed;
  } catch (err) {
    console.error('Failed to load SMS broadcast history:', err);
    return DEFAULT_BROADCAST_LOGS;
  }
}

/**
 * Saves a new broadcast log record
 */
export function saveSMSBroadcastRecord(record: SMSBroadcastRecord): void {
  try {
    const history = getSMSBroadcastHistory();
    const updated = [record, ...history.filter(h => h.id !== record.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(SMS_BROADCAST_EVENT, { detail: record }));
  } catch (err) {
    console.error('Failed to save SMS broadcast record:', err);
  }
}

/**
 * Clears SMS broadcast history
 */
export function clearSMSBroadcastHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(SMS_BROADCAST_EVENT));
  } catch (err) {
    console.error('Failed to clear SMS history:', err);
  }
}

/**
 * Formats parent contact list from enrolled students
 */
export function getAvailableSMSRecipients(filter?: {
  classFilter?: string;
  sectionFilter?: string;
  search?: string;
}): SMSRecipient[] {
  const students: Student[] = getStoredStudents();

  return students
    .filter(s => {
      const matchClass = !filter?.classFilter || filter.classFilter === 'ALL' || s.class === filter.classFilter;
      const matchSec = !filter?.sectionFilter || filter.sectionFilter === 'ALL' || s.section === filter.sectionFilter;
      const matchSearch = !filter?.search || 
        s.name.toLowerCase().includes(filter.search.toLowerCase()) ||
        s.id.toLowerCase().includes(filter.search.toLowerCase()) ||
        (s.phone && s.phone.includes(filter.search)) ||
        (s.guardian && s.guardian.toLowerCase().includes(filter.search.toLowerCase()));

      return matchClass && matchSec && matchSearch;
    })
    .map(s => {
      // Normalize valid Bangladeshi phone format
      const rawPhone = s.phone || '01712-345678';
      const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
      const formattedPhone = cleanPhone.startsWith('88') ? `+${cleanPhone}` : `+88${cleanPhone.startsWith('0') ? cleanPhone : `0${cleanPhone}`}`;

      return {
        studentId: s.id,
        studentName: s.name,
        guardianName: s.guardian || s.fatherName || 'Parent / Guardian',
        phone: rawPhone,
        class: s.class || 'Class 10',
        section: s.section || 'A',
        rollNo: s.rollNo || '01'
      };
    });
}

/**
 * Dispatches an SMS broadcast to the National Telecom Gateway
 */
export async function dispatchSMSBroadcast(
  payload: SMSBroadcastPayload,
  onProgress?: (percent: number, deliveredCount: number) => void
): Promise<SMSBroadcastRecord> {
  const { title, message, category, senderId, targetAudienceLabel, recipients, isUrgent, tenantId, schoolName } = payload;

  const count = recipients.length;
  const meta = calculateSMSMeta(message);
  const totalCredits = count * meta.smsParts;

  // Simulate carrier pipeline batching
  const batchSteps = 5;
  for (let i = 1; i <= batchSteps; i++) {
    await new Promise(resolve => setTimeout(resolve, 320));
    if (onProgress) {
      const percent = Math.round((i / batchSteps) * 100);
      const deliveredCount = Math.round((i / batchSteps) * count);
      onProgress(percent, deliveredCount);
    }
  }

  const sampleNumbers = recipients.slice(0, 5).map(r => r.phone);
  const now = new Date();
  const formattedTime = now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const record: SMSBroadcastRecord = {
    id: `SMS-BRD-${Math.floor(100000 + Math.random() * 900000)}`,
    title: title.trim() || `${isUrgent ? 'Urgent Update' : 'Broadcast Notice'}`,
    message,
    category,
    senderId: senderId || 'SMART-SCHOOL',
    targetAudience: targetAudienceLabel,
    recipientCount: count,
    recipientSample: sampleNumbers,
    charCount: meta.charCount,
    smsParts: meta.smsParts,
    creditsUsed: totalCredits,
    dispatchedAt: formattedTime,
    timestamp: now.getTime(),
    status: 'Delivered',
    isUrgent: Boolean(isUrgent),
    gatewayRef: `BTCL-GW-${Math.floor(10000 + Math.random() * 90000)}`,
    tenantId
  };

  saveSMSBroadcastRecord(record);
  return record;
}

/**
 * Default seeded scheduled broadcasts
 */
const DEFAULT_SCHEDULED_BROADCASTS: ScheduledSMSBroadcast[] = [
  {
    id: 'SMS-SCHED-102941',
    title: 'বার্ষিক অভিভাবক সমাবেশ ও ফলাফল প্রকাশ নোটিশ',
    message: 'সম্মানিত অভিভাবক, আগামী শনিবার সকাল ১০:০০ টায় [StudentName]-এর অভিভাবক সভা ও ফলাফল বিতরণ অনুষ্ঠিত হবে। আপনার উপস্থিতি একান্ত কাম্য। - [SchoolName]',
    category: 'announcement',
    senderId: 'SMART-SCHOOL',
    targetAudienceLabel: 'Class 9 & 10 Parents (120 Parents)',
    recipients: [],
    recipientCount: 120,
    recipientSample: ['01712-345678', '01819-876543', '01912-445566'],
    charCount: 138,
    smsParts: 2,
    creditsEstimated: 240,
    scheduledFor: new Date(Date.now() + 86400000 * 1.5).toISOString(),
    scheduledTimestamp: Date.now() + 86400000 * 1.5,
    status: 'Scheduled',
    isUrgent: false,
    createdAt: Date.now() - 3600000 * 2,
    autoDispatchEnabled: true
  },
  {
    id: 'SMS-SCHED-102942',
    title: 'চলতি মাসের টিউশন ফি পরিশোধের চূড়ান্ত তাগিদ',
    message: 'শ্রদ্ধেয় অভিভাবক, [StudentName]-এর চলতি মাসের বকেয়া টিউশন ফি পরিশোধের শেষ সময় আগামী রবিবার। নির্ধারিত সময়ের মধ্যে ফি পরিশোধের অনুরোধ করা হলো। - [SchoolName]',
    category: 'fee',
    senderId: 'SMART-SCHOOL',
    targetAudienceLabel: 'All Institution Parents (350 Parents)',
    recipients: [],
    recipientCount: 350,
    recipientSample: ['01711-223344', '01688-990011', '01552-334455'],
    charCount: 148,
    smsParts: 3,
    creditsEstimated: 1050,
    scheduledFor: new Date(Date.now() + 86400000 * 3.5).toISOString(),
    scheduledTimestamp: Date.now() + 86400000 * 3.5,
    status: 'Scheduled',
    isUrgent: false,
    createdAt: Date.now() - 3600000 * 5,
    autoDispatchEnabled: true
  }
];

/**
 * Retrieves all scheduled broadcasts
 */
export function getScheduledSMSBroadcasts(tenantId?: string): ScheduledSMSBroadcast[] {
  try {
    const raw = localStorage.getItem(SMS_SCHEDULED_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SMS_SCHEDULED_STORAGE_KEY, JSON.stringify(DEFAULT_SCHEDULED_BROADCASTS));
      return DEFAULT_SCHEDULED_BROADCASTS;
    }
    const parsed: ScheduledSMSBroadcast[] = JSON.parse(raw);
    if (tenantId) {
      return parsed.filter(s => !s.tenantId || s.tenantId === tenantId);
    }
    return parsed;
  } catch (err) {
    console.error('Failed to load scheduled SMS broadcasts:', err);
    return DEFAULT_SCHEDULED_BROADCASTS;
  }
}

/**
 * Creates and stores a new scheduled SMS broadcast
 */
export function saveScheduledSMSBroadcast(
  payload: {
    title: string;
    message: string;
    category: SMSCategory;
    senderId: string;
    targetAudienceLabel: string;
    recipients: SMSRecipient[];
    scheduledFor: string;
    scheduledTimestamp: number;
    isUrgent?: boolean;
    tenantId?: string;
  }
): ScheduledSMSBroadcast {
  try {
    const current = getScheduledSMSBroadcasts();
    const meta = calculateSMSMeta(payload.message);
    const count = payload.recipients.length;
    const totalCredits = count * meta.smsParts;
    const sampleNumbers = payload.recipients.slice(0, 5).map(r => r.phone);

    const record: ScheduledSMSBroadcast = {
      id: `SMS-SCHED-${Math.floor(100000 + Math.random() * 900000)}`,
      title: payload.title.trim() || 'Scheduled Notification',
      message: payload.message.trim(),
      category: payload.category,
      senderId: payload.senderId || 'SMART-SCHOOL',
      targetAudienceLabel: payload.targetAudienceLabel,
      recipients: payload.recipients,
      recipientCount: count,
      recipientSample: sampleNumbers,
      charCount: meta.charCount,
      smsParts: meta.smsParts,
      creditsEstimated: totalCredits,
      scheduledFor: payload.scheduledFor,
      scheduledTimestamp: payload.scheduledTimestamp,
      status: 'Scheduled',
      isUrgent: Boolean(payload.isUrgent),
      createdAt: Date.now(),
      tenantId: payload.tenantId,
      autoDispatchEnabled: true
    };

    const updated = [record, ...current];
    localStorage.setItem(SMS_SCHEDULED_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(SMS_SCHEDULED_EVENT, { detail: record }));
    return record;
  } catch (err) {
    console.error('Failed to schedule SMS broadcast:', err);
    throw err;
  }
}

/**
 * Updates an existing scheduled broadcast
 */
export function updateScheduledSMSBroadcast(
  id: string,
  updates: Partial<ScheduledSMSBroadcast>
): ScheduledSMSBroadcast | null {
  try {
    const current = getScheduledSMSBroadcasts();
    let updatedItem: ScheduledSMSBroadcast | null = null;

    const next = current.map(item => {
      if (item.id === id) {
        let meta = { charCount: item.charCount, smsParts: item.smsParts };
        if (updates.message) {
          meta = calculateSMSMeta(updates.message);
        }
        updatedItem = {
          ...item,
          ...updates,
          charCount: meta.charCount,
          smsParts: meta.smsParts,
          creditsEstimated: (updates.recipientCount || item.recipientCount) * meta.smsParts
        };
        return updatedItem;
      }
      return item;
    });

    localStorage.setItem(SMS_SCHEDULED_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(SMS_SCHEDULED_EVENT, { detail: updatedItem }));
    return updatedItem;
  } catch (err) {
    console.error('Failed to update scheduled SMS broadcast:', err);
    return null;
  }
}

/**
 * Cancels a scheduled broadcast
 */
export function cancelScheduledSMSBroadcast(id: string): boolean {
  try {
    const current = getScheduledSMSBroadcasts();
    const next = current.map(item => 
      item.id === id ? { ...item, status: 'Cancelled' as const } : item
    );
    localStorage.setItem(SMS_SCHEDULED_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(SMS_SCHEDULED_EVENT, { detail: { cancelledId: id } }));
    return true;
  } catch (err) {
    console.error('Failed to cancel scheduled SMS:', err);
    return false;
  }
}

/**
 * Permanently deletes a scheduled broadcast
 */
export function deleteScheduledSMSBroadcast(id: string): boolean {
  try {
    const current = getScheduledSMSBroadcasts();
    const next = current.filter(item => item.id !== id);
    localStorage.setItem(SMS_SCHEDULED_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(SMS_SCHEDULED_EVENT, { detail: { deletedId: id } }));
    return true;
  } catch (err) {
    console.error('Failed to delete scheduled SMS:', err);
    return false;
  }
}

/**
 * Immediately executes a scheduled broadcast (Send Now action)
 */
export async function dispatchScheduledSMSNow(id: string): Promise<SMSBroadcastRecord> {
  const current = getScheduledSMSBroadcasts();
  const scheduled = current.find(s => s.id === id);
  if (!scheduled) {
    throw new Error('Scheduled broadcast not found');
  }

  // Create dispatch payload
  const payload: SMSBroadcastPayload = {
    title: scheduled.title,
    message: scheduled.message,
    category: scheduled.category,
    senderId: scheduled.senderId,
    targetAudienceLabel: scheduled.targetAudienceLabel,
    recipients: scheduled.recipients.length > 0 ? scheduled.recipients : getAvailableSMSRecipients().slice(0, scheduled.recipientCount),
    isUrgent: scheduled.isUrgent,
    tenantId: scheduled.tenantId
  };

  const record = await dispatchSMSBroadcast(payload);

  // Mark as dispatched
  updateScheduledSMSBroadcast(id, {
    status: 'Dispatched',
    dispatchedAt: record.dispatchedAt,
    gatewayRef: record.gatewayRef
  });

  return record;
}

/**
 * Checks for any scheduled broadcasts whose time has arrived and automatically triggers them
 */
export async function checkAndExecuteDueScheduledSMS(): Promise<number> {
  try {
    const schedules = getScheduledSMSBroadcasts();
    const now = Date.now();
    const dueItems = schedules.filter(s => s.status === 'Scheduled' && s.scheduledTimestamp <= now);

    for (const item of dueItems) {
      await dispatchScheduledSMSNow(item.id);
    }

    return dueItems.length;
  } catch (err) {
    console.error('Failed in checkAndExecuteDueScheduledSMS:', err);
    return 0;
  }
}
