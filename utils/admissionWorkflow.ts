/**
 * Admission Workflow Automation Service
 * 
 * Manages automated event triggers, notifications, and communication dispatch
 * whenever a student admission form reaches 'Pending Approval' status.
 */

export interface AdmissionWorkflowNotification {
  id: string;
  applicationId: string;
  studentName: string;
  studentNameNative?: string;
  appliedClass: string;
  group?: string;
  guardianName: string;
  guardianMobile: string;
  triggerEvent: 'status_changed_to_pending_approval' | 'new_form_submitted';
  status: 'Pending Approval' | 'Approved' | 'Rejected' | 'Under Review';
  channel: 'Communication Center' | 'In-App Alert' | 'SMS Dispatched' | 'Email Digest';
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'High' | 'Medium' | 'Urgent';
  smsDelivered: boolean;
  smsReceiptId?: string;
}

export interface WorkflowAutomationRule {
  id: string;
  name: string;
  description: string;
  triggerCondition: string;
  targetRole: string;
  actionSummary: string;
  enabled: boolean;
  smsTemplate: string;
  autoSmsGuardian: boolean;
  priorityBadge: boolean;
  soundAlert: boolean;
}

const STORAGE_KEY_NOTIFICATIONS = 'admission_workflow_notifications_v1';
const STORAGE_KEY_RULES = 'admission_workflow_rules_v1';
export const ADMISSION_WORKFLOW_EVENT = 'admission-workflow-notification-event';

// Initial seed notifications representing recent automated triggers
const SEED_NOTIFICATIONS: AdmissionWorkflowNotification[] = [
  {
    id: 'AWN-2026-001',
    applicationId: 'ADM-2026-9841',
    studentName: 'MD. AL-AMIN HOSSAIN',
    studentNameNative: 'মোঃ আল-আমিন হোসেন',
    appliedClass: 'Class 6',
    group: 'General',
    guardianName: 'MD. RAFIQUL ISLAM',
    guardianMobile: '01712345678',
    triggerEvent: 'status_changed_to_pending_approval',
    status: 'Pending Approval',
    channel: 'Communication Center',
    message: 'New admission application for MD. AL-AMIN HOSSAIN has completed all required fields and reached Pending Approval status. Awaiting School Admin audit.',
    timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(), // 12 mins ago
    read: false,
    priority: 'Urgent',
    smsDelivered: true,
    smsReceiptId: 'SMS-BD-991204'
  },
  {
    id: 'AWN-2026-002',
    applicationId: 'ADM-2026-9842',
    studentName: 'NUSRAT JAHAN MIM',
    studentNameNative: 'নুসরাত জাহান মীম',
    appliedClass: 'Class 9',
    group: 'Science',
    guardianName: 'MD. AZIZUL HAQUE',
    guardianMobile: '01819234567',
    triggerEvent: 'status_changed_to_pending_approval',
    status: 'Pending Approval',
    channel: 'Communication Center',
    message: 'Digital application submitted with parent signature for NUSRAT JAHAN MIM (Class 9 Science). Status transitioned to Pending Approval.',
    timestamp: new Date(Date.now() - 48 * 60 * 1000).toISOString(), // 48 mins ago
    read: false,
    priority: 'Urgent',
    smsDelivered: true,
    smsReceiptId: 'SMS-BD-991205'
  },
  {
    id: 'AWN-2026-003',
    applicationId: 'ADM-2026-9839',
    studentName: 'TAHMID HASAN TANVIR',
    studentNameNative: 'তাহমিদ হাসান তানভীর',
    appliedClass: 'Class 7',
    group: 'General',
    guardianName: 'KABIR HOSSAIN',
    guardianMobile: '01911456789',
    triggerEvent: 'status_changed_to_pending_approval',
    status: 'Approved',
    channel: 'Communication Center',
    message: 'Admission request for TAHMID HASAN TANVIR verified and approved by School Admin. Enrollment packet dispatched.',
    timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(), // 3 hours ago
    read: true,
    priority: 'High',
    smsDelivered: true,
    smsReceiptId: 'SMS-BD-991198'
  },
  {
    id: 'AWN-2026-004',
    applicationId: 'ADM-2026-9835',
    studentName: 'FARHANA AKTER RUNA',
    studentNameNative: 'ফারহানা আক্তার রুনা',
    appliedClass: 'Class 10',
    group: 'Commerce',
    guardianName: 'ANISUR RAHMAN',
    guardianMobile: '01678123456',
    triggerEvent: 'status_changed_to_pending_approval',
    status: 'Pending Approval',
    channel: 'Communication Center',
    message: 'New admission application for FARHANA AKTER RUNA submitted online with guardian authorization. Verification pending.',
    timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(), // 5 hours ago
    read: true,
    priority: 'High',
    smsDelivered: true,
    smsReceiptId: 'SMS-BD-991180'
  }
];

export const DEFAULT_WORKFLOW_RULE: WorkflowAutomationRule = {
  id: 'RULE-ADM-001',
  name: 'Student Admission Pending Approval Alert',
  description: 'Triggers automated notification to School Admin via Communication Center whenever an admission form status reaches Pending Approval.',
  triggerCondition: "Form Status == 'Pending Approval'",
  targetRole: 'School Admin',
  actionSummary: 'Dispatch Communication Center alert + Send SMS receipt to Guardian',
  enabled: true,
  smsTemplate: 'Dear [Guardian], admission form for [Student] (Class: [Class]) is received and under Pending Approval review. Reference: [AppID]. - Smart Amar School',
  autoSmsGuardian: true,
  priorityBadge: true,
  soundAlert: true
};

/**
 * Retrieve all workflow notifications from browser storage (with fallback to seed data)
 */
export function getAdmissionWorkflowNotifications(): AdmissionWorkflowNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load admission notifications:', e);
  }
  // Initialize with seed data
  saveAdmissionWorkflowNotifications(SEED_NOTIFICATIONS);
  return SEED_NOTIFICATIONS;
}

/**
 * Save workflow notifications to browser storage and notify listeners
 */
export function saveAdmissionWorkflowNotifications(notifications: AdmissionWorkflowNotification[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(notifications));
    // Dispatch custom event for real-time reactivity across components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(ADMISSION_WORKFLOW_EVENT, { detail: notifications }));
    }
  } catch (e) {
    console.error('Failed to save admission notifications:', e);
  }
}

/**
 * Trigger the automated workflow when an admission form reaches 'Pending Approval'
 */
export function triggerPendingApprovalWorkflow(params: {
  studentName: string;
  studentNameNative?: string;
  appliedClass: string;
  group?: string;
  guardianName: string;
  guardianMobile: string;
  applicationId?: string;
  customMessage?: string;
}): AdmissionWorkflowNotification {
  const currentList = getAdmissionWorkflowNotifications();
  const rule = getWorkflowRule();

  const appId = params.applicationId || `ADM-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const smsReceipt = `SMS-BD-${Math.floor(900000 + Math.random() * 99999)}`;

  const newNotification: AdmissionWorkflowNotification = {
    id: `AWN-${Date.now()}`,
    applicationId: appId,
    studentName: params.studentName.toUpperCase(),
    studentNameNative: params.studentNameNative || '',
    appliedClass: params.appliedClass || 'Class 6',
    group: params.group || 'General',
    guardianName: params.guardianName || 'Guardian',
    guardianMobile: params.guardianMobile || '01700000000',
    triggerEvent: 'status_changed_to_pending_approval',
    status: 'Pending Approval',
    channel: 'Communication Center',
    message: params.customMessage || 
      `Automated Workflow Triggered: Student admission form for ${params.studentName.toUpperCase()} (${params.appliedClass}) has reached 'Pending Approval' status. School Admin notification dispatched.`,
    timestamp: new Date().toISOString(),
    read: false,
    priority: 'Urgent',
    smsDelivered: rule.autoSmsGuardian,
    smsReceiptId: smsReceipt
  };

  // Prepend to top of list
  const updatedList = [newNotification, ...currentList];
  saveAdmissionWorkflowNotifications(updatedList);

  // Play subtle audio alert if sound is enabled
  if (rule.soundAlert && typeof window !== 'undefined') {
    playNotificationChime();
  }

  return newNotification;
}

/**
 * Mark a single notification as read
 */
export function markWorkflowNotificationAsRead(id: string): void {
  const list = getAdmissionWorkflowNotifications();
  const updated = list.map(item => item.id === id ? { ...item, read: true } : item);
  saveAdmissionWorkflowNotifications(updated);
}

/**
 * Mark all notifications as read
 */
export function markAllWorkflowNotificationsAsRead(): void {
  const list = getAdmissionWorkflowNotifications();
  const updated = list.map(item => ({ ...item, read: true }));
  saveAdmissionWorkflowNotifications(updated);
}

/**
 * Update the status of an admission notification (e.g. Approved or Rejected)
 */
export function updateWorkflowNotificationStatus(
  id: string, 
  newStatus: 'Pending Approval' | 'Approved' | 'Rejected' | 'Under Review'
): void {
  const list = getAdmissionWorkflowNotifications();
  const updated = list.map(item => {
    if (item.id === id) {
      return {
        ...item,
        status: newStatus,
        read: true,
        message: newStatus === 'Approved' 
          ? `Application ${item.applicationId} for ${item.studentName} was APPROVED by School Admin. Confirmation SMS dispatched.`
          : newStatus === 'Rejected'
          ? `Application ${item.applicationId} for ${item.studentName} was rejected or returned for corrections.`
          : item.message
      };
    }
    return item;
  });
  saveAdmissionWorkflowNotifications(updated);
}

/**
 * Get active workflow rule configuration
 */
export function getWorkflowRule(): WorkflowAutomationRule {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RULES);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load workflow rule:', e);
  }
  return DEFAULT_WORKFLOW_RULE;
}

/**
 * Save workflow rule configuration
 */
export function saveWorkflowRule(rule: WorkflowAutomationRule): void {
  try {
    localStorage.setItem(STORAGE_KEY_RULES, JSON.stringify(rule));
  } catch (e) {
    console.error('Failed to save workflow rule:', e);
  }
}

/**
 * Synthetic browser audio chime using Web Audio API (no external mp3 asset required)
 */
function playNotificationChime(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.36);
  } catch (e) {
    // Non-blocking if audio context is restricted
  }
}
