import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserRole } from '../types';

export type NotificationCategory = 'homework' | 'exam_result' | 'announcement';
export type NotificationTargetRole = 'student' | 'parent' | 'teacher' | 'school_admin';
export type NotificationPriority = 'normal' | 'high' | 'urgent';

export interface ReadReceipt {
  readerId?: string;
  readerName: string;
  readerRole: string; // 'student' | 'parent' | 'teacher' | 'school_admin'
  readerClass?: string;
  readAt: string; // ISO timestamp
}

export interface CentralNotification {
  id: string;
  type: NotificationCategory;
  title: string;
  titleBn?: string;
  message: string;
  messageBn?: string;
  timestamp: string; // ISO date string
  targetRoles: NotificationTargetRole[];
  targetClass?: string; // e.g., 'Class 10', 'Class 9', 'All'
  targetStudentId?: string;
  subject?: string;
  authorName: string;
  authorRole: string;
  priority: NotificationPriority;
  readBy: string[]; // List of user IDs or roles who read it
  readReceipts?: ReadReceipt[]; // Timestamped read audit receipts
  actionUrl?: string;
  actionLabel?: string;
  actionLabelBn?: string;
  metadata?: {
    homeworkId?: string | number;
    dueDate?: string;
    examName?: string;
    totalMarks?: number;
    gpa?: string;
    grade?: string;
    attachmentName?: string;
    room?: string;
  };
}

const STORAGE_KEY = 'app_central_notifications_v1';
export const CENTRAL_NOTIFICATION_EVENT = 'app_central_notification_update';
const DESKTOP_ALERTS_KEY = 'app_desktop_alerts_enabled_v1';
const SOUND_ALERTS_KEY = 'app_sound_alerts_enabled_v1';

// Rich default seed notifications
const DEFAULT_NOTIFICATIONS: CentralNotification[] = [
  {
    id: 'notif-hw-001',
    type: 'homework',
    title: 'New Math Homework: Chapter 5 Quadratic Equations',
    titleBn: 'নতুন গণিত হোমওয়ার্ক: ৫ম অধ্যায় দ্বিঘাত সমীকরণ ও সমাধান',
    message: 'Please complete exercises 5.1 and 5.2 from Page 84-86. Submit neat handwritten solutions before tomorrow afternoon.',
    messageBn: 'অনুশীলনী ৫.১ ও ৫.২ এর ১ থেকে ১০ নম্বর অঙ্কসমূহ খাতায় সমাধান করে আগামীকালের মধ্যে সাবমিট করুন।',
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(), // 35 mins ago
    targetRoles: ['student', 'parent'],
    targetClass: 'Class 10',
    subject: 'Mathematics',
    authorName: 'Abdul Jabbar',
    authorRole: 'Senior Mathematics Teacher',
    priority: 'high',
    readBy: [],
    actionUrl: '/student/homework',
    actionLabel: 'View Assignment',
    actionLabelBn: 'হোমওয়ার্ক দেখুন',
    metadata: {
      dueDate: 'Tomorrow, 5:00 PM',
      totalMarks: 20
    }
  },
  {
    id: 'notif-res-001',
    type: 'exam_result',
    title: 'First Term Examination 2024 Results Published',
    titleBn: '১ম সাময়িক পরীক্ষা ২০২৪ এর অফিসিয়াল ফলাফল ও মার্কশিট প্রকাশিত',
    message: 'First Term Examination 2024 academic transcripts and subject-wise scorecards have been finalized and published. View your report card.',
    messageBn: '১ম সাময়িক পরীক্ষা ২০২৪ এর নম্বরপত্র ও জিপিএ মূল্যায়ন সম্পন্ন হয়েছে। আপনার মার্কশিট এবং গ্রেড পয়েন্ট এখনই যাচাই করুন।',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
    targetRoles: ['student', 'parent'],
    targetClass: 'Class 10',
    subject: 'All Subjects',
    authorName: 'Academic Examination Controller',
    authorRole: 'Exam Board',
    priority: 'urgent',
    readBy: [],
    actionUrl: '/student/results',
    actionLabel: 'View Report Card',
    actionLabelBn: 'মার্কশিট দেখুন',
    metadata: {
      examName: 'First Term Examination 2024',
      gpa: '5.00',
      grade: 'A+'
    }
  },
  {
    id: 'notif-ann-001',
    type: 'announcement',
    title: 'Annual Sports Competition & Cultural Week 2025',
    titleBn: 'বার্ষিক ক্রীড়া প্রতিযোগিতা ও সাংস্কৃতিক সপ্তাহ ২০২৫ এর সময়সূচি',
    message: 'The Annual Sports Week starts on Monday. Students can register for track & field, recitation, and science exhibition with class teachers.',
    messageBn: 'আগামী সোমবার থেকে বার্ষিক ক্রীড়া ও সাংস্কৃতিক প্রতিযোগিতা শুরু হবে। নির্ধারিত ইভেন্টে অংশগ্রহণের জন্য শ্রেণি শিক্ষকের নিকট নাম নিবন্ধন করুন।',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(), // 18 hours ago
    targetRoles: ['student', 'parent', 'teacher'],
    targetClass: 'All',
    authorName: 'Principal Office',
    authorRole: 'Headmaster',
    priority: 'normal',
    readBy: ['parent', 'teacher'],
    readReceipts: [
      {
        readerId: 'par-1002',
        readerName: 'Jahangir Alam (Parent)',
        readerRole: 'parent',
        readAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
      },
      {
        readerId: 'tch-201',
        readerName: 'Mawlana Nazrul Islam',
        readerRole: 'teacher',
        readAt: new Date(Date.now() - 1000 * 60 * 60 * 15).toISOString()
      }
    ],
    actionUrl: '/school/academic-calendar',
    actionLabel: 'Event Schedule',
    actionLabelBn: 'সময়সূচি দেখুন',
    metadata: {
      room: 'Main Playground & Auditorium'
    }
  },
  {
    id: 'notif-hw-002',
    type: 'homework',
    title: 'Physics Lab Report: Verification of Ohm’s Law',
    titleBn: 'পদার্থবিজ্ঞান ল্যাব রিপোর্ট: ওহমের সূত্রের ব্যবহারিক প্রতিবেদন',
    message: 'Submit your completed circuit diagrams and calculation tables for the Ohm’s law experiment conducted this week.',
    messageBn: 'চলতি সপ্তাহে সম্পন্নকৃত ওহমের সূত্রের ব্যবহারিক পরীক্ষার গ্রাফ ও গণনা ছক আগামী বৃহস্পতিবারের মধ্যে জমা দিন।',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(), // Yesterday
    targetRoles: ['student', 'parent'],
    targetClass: 'Class 9',
    subject: 'Physics',
    authorName: 'Abdul Jabbar',
    authorRole: 'Physics Faculty',
    priority: 'normal',
    readBy: ['student'],
    readReceipts: [
      {
        readerId: 'std-1002',
        readerName: 'Tariqul Islam',
        readerRole: 'student',
        readerClass: 'Class 9',
        readAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString()
      }
    ],
    actionUrl: '/student/homework',
    actionLabel: 'Submit Report',
    actionLabelBn: 'রিপোর্ট জমা দিন',
    metadata: {
      dueDate: 'Thursday, 3:00 PM',
      totalMarks: 25
    }
  },
  {
    id: 'notif-res-002',
    type: 'exam_result',
    title: 'Islamic Studies & Arabic Oral Exam Grades Finalized',
    titleBn: 'ইসলাম শিক্ষা ও আরবি মৌখিক পরীক্ষার ফলাফল চূড়ান্ত',
    message: 'Oral exam grading for Tajweed, Quran Recitation, and Arabic Grammar has been verified and synced with student portals.',
    messageBn: 'কুরআন তিলাওয়াত, তাজবীদ ও আরবি ব্যাকরণ মৌখিক পরীক্ষার গ্রেডশিট যাচাইপূর্বক প্রকাশ করা হয়েছে।',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    targetRoles: ['student', 'parent'],
    targetClass: 'All',
    subject: 'Islamic Studies',
    authorName: 'Mawlana Nazrul Islam',
    authorRole: 'Head of Arabic Department',
    priority: 'normal',
    readBy: ['student', 'parent'],
    readReceipts: [
      {
        readerId: 'std-1001',
        readerName: 'Abdullah Al Mamun',
        readerRole: 'student',
        readerClass: 'Class 10',
        readAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString()
      },
      {
        readerId: 'par-1001',
        readerName: 'Mohammad Rafiqul Islam (Parent)',
        readerRole: 'parent',
        readAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString()
      }
    ],
    actionUrl: '/parent/results',
    actionLabel: 'Check Grades',
    actionLabelBn: 'গ্রেড দেখুন',
    metadata: {
      examName: 'Mid-Term Oral Assessment'
    }
  },
  {
    id: 'notif-ann-002',
    type: 'announcement',
    title: 'Parent-Teacher Meeting (PTM) This Saturday',
    titleBn: 'অভিভাবক-শিক্ষক মতবিনিময় সভা (PTM) আগামী শনিবার',
    message: 'All parents are cordially invited to attend the quarterly parent-teacher meeting on Saturday at 10:00 AM in their child’s respective classroom.',
    messageBn: 'শিক্ষার্থীদের সার্বিক অগ্রগতি পর্যালোচনায় আগামী শনিবার সকাল ১০:০০ টায় নির্ধারিত শ্রেণিকক্ষে অভিভাবক সমাবেশ অনুষ্ঠিত হবে।',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    targetRoles: ['parent', 'teacher'],
    targetClass: 'All',
    authorName: 'Academic Council',
    authorRole: 'Vice Principal',
    priority: 'high',
    readBy: ['parent'],
    readReceipts: [
      {
        readerId: 'par-1003',
        readerName: 'Mrs. Rokeya Begum (Mother of Fatima)',
        readerRole: 'parent',
        readAt: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString()
      }
    ],
    actionUrl: '/parent/portal',
    actionLabel: 'Meeting Details',
    actionLabelBn: 'বিস্তারিত দেখুন'
  },
  {
    id: 'notif-tch-001',
    type: 'homework',
    title: 'Homework Submissions Received: Class 10-A Math',
    titleBn: '১০ম শ্রেণির গণিত হোমওয়ার্ক জমা পড়েছে: ৩২ জন শিক্ষার্থী',
    message: '32 out of 45 students have submitted their Algebra solutions online. Submissions are ready for review and grading.',
    messageBn: 'বীজগণিত অনুশীলনী ১-এ মোট ৪৫ জনের মধ্যে ৩২ জন সমাধান সাবমিট করেছে। খাতা মূল্যায়নের জন্য প্রস্তুত।',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    targetRoles: ['teacher'],
    targetClass: 'Class 10',
    subject: 'Mathematics',
    authorName: 'Portal Auto-Tracker',
    authorRole: 'LMS System',
    priority: 'normal',
    readBy: ['teacher'],
    readReceipts: [
      {
        readerId: 'tch-101',
        readerName: 'Abdul Jabbar',
        readerRole: 'teacher',
        readAt: new Date(Date.now() - 1000 * 60 * 20).toISOString()
      }
    ],
    actionUrl: '/teacher/homework',
    actionLabel: 'Grade Submissions',
    actionLabelBn: 'খাতা মূল্যায়ন করুন',
    metadata: {
      homeworkId: 1
    }
  },
  {
    id: 'notif-tch-002',
    type: 'exam_result',
    title: 'Marks Award Entry Deadline: First Term Exam',
    titleBn: '১ম সাময়িক পরীক্ষার নম্বর এন্ট্রির চূড়ান্ত সময়সীমা স্মরণিকা',
    message: 'Faculty members are requested to complete all pending marks entries and practical scores in the teacher portal by 6:00 PM.',
    messageBn: 'সকল সম্মানিত শিক্ষকবৃন্দকে ১ম সাময়িক পরীক্ষার বিষয়ভিত্তিক প্রাপ্ত নম্বর আজ সন্ধ্যা ৬:০০ টার মধ্যে পোর্টালে এন্ট্রি সম্পন্ন করার অনুরোধ করা হচ্ছে।',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    targetRoles: ['teacher'],
    targetClass: 'All',
    authorName: 'Exam Controller Desk',
    authorRole: 'Academic Admin',
    priority: 'high',
    readBy: [],
    actionUrl: '/teacher/marks',
    actionLabel: 'Open Marks Portal',
    actionLabelBn: 'নম্বর এন্ট্রি করুন'
  }
];

// Helper to play subtle pleasant audio chime when an alert is fired
export const playNotificationChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Two-tone friendly chime
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (err) {
    // Ignore audio autoplay restrictions
  }
};

export interface NotificationContextType {
  notifications: CentralNotification[];
  desktopPermission: NotificationPermission | 'unsupported';
  desktopAlertsEnabled: boolean;
  soundAlertsEnabled: boolean;
  requestDesktopPermission: () => Promise<NotificationPermission | 'unsupported'>;
  toggleDesktopAlerts: (enabled: boolean) => void;
  toggleSoundAlerts: (enabled: boolean) => void;
  sendDesktopNotification: (payload: {
    title: string;
    titleBn?: string;
    body: string;
    bodyBn?: string;
    icon?: string;
    tag?: string;
    actionUrl?: string;
    critical?: boolean;
  }) => void;
  testDesktopNotification: (type?: NotificationCategory) => void;
  getNotificationsForRole: (role: UserRole | string, studentClass?: string) => CentralNotification[];
  getUnreadCountForRole: (role: UserRole | string, studentClass?: string) => number;
  markAsRead: (
    notificationId: string, 
    roleOrUserId?: string,
    readerDetails?: {
      readerName?: string;
      readerRole?: string;
      readerId?: string;
      readerClass?: string;
    }
  ) => void;
  markAllAsRead: (
    role: UserRole | string,
    readerDetails?: {
      readerName?: string;
      readerRole?: string;
      readerId?: string;
      readerClass?: string;
    }
  ) => void;
  getNotificationReadReceipts: (notificationId: string) => ReadReceipt[];
  deleteNotification: (notificationId: string) => void;
  broadcastAnnouncement: (payload: {
    title: string;
    titleBn?: string;
    message: string;
    messageBn?: string;
    targetRoles: NotificationTargetRole[];
    targetClass?: string;
    priority?: NotificationPriority;
    authorName?: string;
    authorRole?: string;
    actionUrl?: string;
  }) => CentralNotification;
  publishHomeworkAlert: (payload: {
    title: string;
    titleBn?: string;
    subject: string;
    className: string;
    dueDate: string;
    instructions: string;
    teacherName?: string;
  }) => CentralNotification;
  publishExamResultAlert: (payload: {
    examName: string;
    className: string;
    subject?: string;
    authorName?: string;
    gpa?: string;
  }) => CentralNotification;
  triggerTestAlert: (type: NotificationCategory, targetRole?: NotificationTargetRole) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<CentralNotification[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse notifications from localStorage', e);
    }
    return DEFAULT_NOTIFICATIONS;
  });

  const [desktopPermission, setDesktopPermission] = useState<NotificationPermission | 'unsupported'>(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  });

  const [desktopAlertsEnabled, setDesktopAlertsEnabled] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(DESKTOP_ALERTS_KEY);
      if (stored !== null) return stored === 'true';
    } catch (_) {}
    return true;
  });

  const [soundAlertsEnabled, setSoundAlertsEnabled] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(SOUND_ALERTS_KEY);
      if (stored !== null) return stored === 'true';
    } catch (_) {}
    return true;
  });

  // Verify and sync permission status if changed outside or on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setDesktopPermission(Notification.permission);
    }
  }, []);

  const saveAndBroadcast = useCallback((updated: CentralNotification[]) => {
    setNotifications(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent(CENTRAL_NOTIFICATION_EVENT, { detail: updated }));
    } catch (e) {
      console.error('Failed to save notifications to localStorage', e);
    }
  }, []);

  const toggleDesktopAlerts = useCallback((enabled: boolean) => {
    setDesktopAlertsEnabled(enabled);
    try {
      localStorage.setItem(DESKTOP_ALERTS_KEY, String(enabled));
    } catch (_) {}
  }, []);

  const toggleSoundAlerts = useCallback((enabled: boolean) => {
    setSoundAlertsEnabled(enabled);
    try {
      localStorage.setItem(SOUND_ALERTS_KEY, String(enabled));
    } catch (_) {}
  }, []);

  // Browser desktop notification dispatcher
  const sendDesktopNotification = useCallback((payload: {
    title: string;
    titleBn?: string;
    body: string;
    bodyBn?: string;
    icon?: string;
    tag?: string;
    actionUrl?: string;
    critical?: boolean;
  }) => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }
    if (Notification.permission !== 'granted' || !desktopAlertsEnabled) {
      return;
    }

    try {
      const lang = localStorage.getItem('language') || localStorage.getItem('app_language') || 'bn';
      const isBn = lang === 'bn';
      const title = (isBn && payload.titleBn) ? payload.titleBn : payload.title;
      const body = (isBn && payload.bodyBn) ? payload.bodyBn : payload.body;

      const notif = new Notification(title, {
        body,
        icon: payload.icon || '/assets/aistudio/Al-Amin_Madrasa_Website_Mockup_Board_742f8594.png',
        badge: '/favicon.ico',
        tag: payload.tag || `madrasa-alert-${Date.now()}`,
        requireInteraction: payload.critical ?? true,
      });

      notif.onclick = (e) => {
        e.preventDefault();
        window.focus();
        if (payload.actionUrl) {
          window.location.hash = payload.actionUrl;
          window.dispatchEvent(new CustomEvent('app_navigate_to', { detail: payload.actionUrl }));
        }
        notif.close();
      };
    } catch (err) {
      console.warn('Native desktop notification dispatch failed (may be constrained by container/iframe):', err);
    }
  }, [desktopAlertsEnabled]);

  const requestDesktopPermission = useCallback(async (): Promise<NotificationPermission | 'unsupported'> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setDesktopPermission('unsupported');
      return 'unsupported';
    }

    try {
      const perm = await Notification.requestPermission();
      setDesktopPermission(perm);
      if (perm === 'granted') {
        setDesktopAlertsEnabled(true);
        try {
          localStorage.setItem(DESKTOP_ALERTS_KEY, 'true');
        } catch (_) {}

        // Send a confirmation desktop notification to welcome user and test alert channel
        sendDesktopNotification({
          title: 'Desktop Alerts Activated - Al-Amin Madrasa',
          titleBn: 'ডেস্কটপ নোটিফিকেশন চালু হয়েছে - আল-আমিন মাদরাসা',
          body: 'You will now receive instant desktop alerts for exam results, assignment deadlines, and critical notices.',
          bodyBn: 'পরীক্ষার ফলাফল প্রকাশ, নতুন হোমওয়ার্ক এবং জরুরি নোটিশের সাথে সাথে আপনার কম্পিউটারে লাইভ নোটিফিকেশন পাবেন।',
          tag: 'welcome-desktop-alert',
          actionUrl: '/school/academic-calendar',
          critical: true
        });
      }
      return perm;
    } catch (error) {
      console.warn('Error requesting notification permission:', error);
      return 'denied';
    }
  }, [sendDesktopNotification]);

  const testDesktopNotification = useCallback((type: NotificationCategory = 'exam_result') => {
    if (soundAlertsEnabled) {
      playNotificationChime();
    }
    if (type === 'exam_result') {
      sendDesktopNotification({
        title: 'Exam Alert: Model Test 2025 Final Results Published',
        titleBn: 'পরীক্ষার ফলাফল সতর্কতা: মডেল টেস্ট ২০২৫ এর চূড়ান্ত ফলাফল ও মার্কশিট প্রকাশিত',
        body: 'Final results and GPA ranking have been published. Click to view student scorecard.',
        bodyBn: 'সকল বিষয়ের নম্বরপত্র ও জিপিএ প্রস্তুত হয়েছে। ফলাফল ও গ্রেড পয়েন্ট এখনই যাচাই করুন।',
        tag: `exam-test-${Date.now()}`,
        actionUrl: '/student/results',
        critical: true
      });
    } else if (type === 'homework') {
      sendDesktopNotification({
        title: 'New Homework: Mathematics Chapter 5 Solutions',
        titleBn: 'নতুন হোমওয়ার্ক: গণিত ৫ম অধ্যায় অনুশীলনী ৫.১ ও ৫.২',
        body: 'Complete exercises and submit before tomorrow 5:00 PM.',
        bodyBn: 'আগামীকাল বিকেল ৫:০০ টার মধ্যে সমাধান খাতা জমা দিন।',
        tag: `hw-test-${Date.now()}`,
        actionUrl: '/student/homework',
        critical: false
      });
    } else {
      sendDesktopNotification({
        title: 'Urgent Madrasa Notice: Class Timing Update',
        titleBn: 'জরুরি মাদরাসা বিজ্ঞপ্তি: ক্লাস সময়সূচি পরিবর্তন',
        body: 'Morning shift classes will start at 9:00 AM due to cold weather.',
        bodyBn: 'শীতকালীন আবহাওয়ার কারণে সকালের শিফটের ক্লাস সকাল ৯:০০ টায় শুরু হবে।',
        tag: `ann-test-${Date.now()}`,
        actionUrl: '/school/academic-calendar',
        critical: true
      });
    }
  }, [sendDesktopNotification, soundAlertsEnabled]);

  // Listen to cross-window or inter-component updates
  useEffect(() => {
    const handleSync = (e: Event) => {
      const custom = e as CustomEvent<CentralNotification[]>;
      if (custom.detail) {
        setNotifications(custom.detail);
      } else {
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) setNotifications(JSON.parse(stored));
        } catch (_) {}
      }
    };

    window.addEventListener(CENTRAL_NOTIFICATION_EVENT, handleSync);
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setNotifications(JSON.parse(e.newValue));
        } catch (_) {}
      }
    });

    return () => {
      window.removeEventListener(CENTRAL_NOTIFICATION_EVENT, handleSync);
    };
  }, []);

  // Helper to map UserRole enum to NotificationTargetRole
  const normalizeRole = (role: UserRole | string): NotificationTargetRole => {
    const r = String(role).toLowerCase();
    if (r.includes('student')) return 'student';
    if (r.includes('parent')) return 'parent';
    if (r.includes('teacher')) return 'teacher';
    return 'school_admin';
  };

  const getNotificationsForRole = useCallback(
    (role: UserRole | string, studentClass?: string): CentralNotification[] => {
      const targetRole = normalizeRole(role);
      return notifications.filter(item => {
        // Check if role is in target roles or if user is school admin (admin can see all)
        const roleMatches = targetRole === 'school_admin' || item.targetRoles.includes(targetRole);
        if (!roleMatches) return false;

        // If targetClass is specified on notification (and not 'All'), check against student's class
        if (studentClass && item.targetClass && item.targetClass !== 'All') {
          const cleanStudentClass = studentClass.toLowerCase();
          const cleanItemClass = item.targetClass.toLowerCase();
          // Allow match if either string contains the other (e.g. "Class 10" in "Class 10 - A")
          if (!cleanStudentClass.includes(cleanItemClass) && !cleanItemClass.includes(cleanStudentClass)) {
            // If it's a teacher, teachers teach multiple classes so show them
            if (targetRole !== 'teacher' && targetRole !== 'school_admin') {
              return false;
            }
          }
        }
        return true;
      });
    },
    [notifications]
  );

  const getUnreadCountForRole = useCallback(
    (role: UserRole | string, studentClass?: string): number => {
      const list = getNotificationsForRole(role, studentClass);
      const roleKey = normalizeRole(role);
      return list.filter(item => !item.readBy.includes(roleKey) && !item.readBy.includes('read_all')).length;
    },
    [getNotificationsForRole]
  );

  const markAsRead = useCallback(
    (
      notificationId: string, 
      roleOrUserId?: string,
      readerDetails?: {
        readerName?: string;
        readerRole?: string;
        readerId?: string;
        readerClass?: string;
      }
    ) => {
      const readerKey = roleOrUserId ? normalizeRole(roleOrUserId) : 'user';
      const readAt = new Date().toISOString();
      const roleDisplayName = readerKey === 'student' ? 'Student' : readerKey === 'parent' ? 'Parent / Guardian' : readerKey === 'teacher' ? 'Faculty Member' : 'Admin';
      const finalReaderName = readerDetails?.readerName || roleDisplayName;
      const finalReaderRole = readerDetails?.readerRole ? normalizeRole(readerDetails.readerRole) : readerKey;

      const updated = notifications.map(item => {
        if (item.id === notificationId) {
          const newReadBy = item.readBy.includes(readerKey) ? item.readBy : [...item.readBy, readerKey];
          const existingReceipts = item.readReceipts ? [...item.readReceipts] : [];
          
          // Check if this specific reader has already recorded a receipt
          const alreadyRecorded = existingReceipts.some(r => 
            (readerDetails?.readerId && r.readerId === readerDetails.readerId) ||
            (!readerDetails?.readerId && r.readerRole === finalReaderRole && r.readerName === finalReaderName)
          );

          if (!alreadyRecorded) {
            existingReceipts.push({
              readerId: readerDetails?.readerId,
              readerName: finalReaderName,
              readerRole: finalReaderRole,
              readerClass: readerDetails?.readerClass,
              readAt: readAt
            });
          }

          return { 
            ...item, 
            readBy: newReadBy,
            readReceipts: existingReceipts
          };
        }
        return item;
      });
      saveAndBroadcast(updated);
    },
    [notifications, saveAndBroadcast]
  );

  const markAllAsRead = useCallback(
    (
      role: UserRole | string,
      readerDetails?: {
        readerName?: string;
        readerRole?: string;
        readerId?: string;
        readerClass?: string;
      }
    ) => {
      const targetRole = normalizeRole(role);
      const readAt = new Date().toISOString();
      const roleDisplayName = targetRole === 'student' ? 'Student' : targetRole === 'parent' ? 'Parent / Guardian' : targetRole === 'teacher' ? 'Faculty Member' : 'Admin';
      const finalReaderName = readerDetails?.readerName || roleDisplayName;

      const updated = notifications.map(item => {
        const roleMatches = targetRole === 'school_admin' || item.targetRoles.includes(targetRole);
        if (roleMatches) {
          const newReadBy = item.readBy.includes(targetRole) ? item.readBy : [...item.readBy, targetRole];
          const existingReceipts = item.readReceipts ? [...item.readReceipts] : [];
          
          const alreadyRecorded = existingReceipts.some(r => 
            (readerDetails?.readerId && r.readerId === readerDetails.readerId) ||
            (!readerDetails?.readerId && r.readerRole === targetRole && r.readerName === finalReaderName)
          );

          if (!alreadyRecorded) {
            existingReceipts.push({
              readerId: readerDetails?.readerId,
              readerName: finalReaderName,
              readerRole: targetRole,
              readerClass: readerDetails?.readerClass,
              readAt: readAt
            });
          }

          return { 
            ...item, 
            readBy: newReadBy,
            readReceipts: existingReceipts
          };
        }
        return item;
      });
      saveAndBroadcast(updated);
    },
    [notifications, saveAndBroadcast]
  );

  const getNotificationReadReceipts = useCallback(
    (notificationId: string): ReadReceipt[] => {
      const item = notifications.find(n => n.id === notificationId);
      return item?.readReceipts || [];
    },
    [notifications]
  );

  const deleteNotification = useCallback(
    (notificationId: string) => {
      const updated = notifications.filter(n => n.id !== notificationId);
      saveAndBroadcast(updated);
    },
    [notifications, saveAndBroadcast]
  );

  const broadcastAnnouncement = useCallback(
    (payload: {
      title: string;
      titleBn?: string;
      message: string;
      messageBn?: string;
      targetRoles: NotificationTargetRole[];
      targetClass?: string;
      priority?: NotificationPriority;
      authorName?: string;
      authorRole?: string;
      actionUrl?: string;
    }): CentralNotification => {
      const newNotif: CentralNotification = {
        id: `ann-${Date.now()}`,
        type: 'announcement',
        title: payload.title,
        titleBn: payload.titleBn || payload.title,
        message: payload.message,
        messageBn: payload.messageBn || payload.message,
        timestamp: new Date().toISOString(),
        targetRoles: payload.targetRoles.length > 0 ? payload.targetRoles : ['student', 'parent', 'teacher'],
        targetClass: payload.targetClass || 'All',
        priority: payload.priority || 'normal',
        authorName: payload.authorName || 'Institution Admin',
        authorRole: payload.authorRole || 'Authority',
        readBy: [],
        actionUrl: payload.actionUrl || '/school/academic-calendar',
        actionLabel: 'View Details',
        actionLabelBn: 'বিস্তারিত দেখুন'
      };

      const updated = [newNotif, ...notifications];
      saveAndBroadcast(updated);
      if (soundAlertsEnabled) {
        playNotificationChime();
      }
      // If urgent, high priority, or exam announcement, trigger desktop alert
      const isCritical = payload.priority === 'urgent' || payload.priority === 'high' || 
                         payload.title.toLowerCase().includes('exam') || 
                         (payload.titleBn && payload.titleBn.includes('পরীক্ষা'));
      if (isCritical) {
        sendDesktopNotification({
          title: `Announcement: ${payload.title}`,
          titleBn: `জরুরি ঘোষণা: ${payload.titleBn || payload.title}`,
          body: payload.message,
          bodyBn: payload.messageBn || payload.message,
          tag: newNotif.id,
          actionUrl: newNotif.actionUrl,
          critical: payload.priority === 'urgent'
        });
      }
      return newNotif;
    },
    [notifications, saveAndBroadcast, sendDesktopNotification, soundAlertsEnabled]
  );

  const publishHomeworkAlert = useCallback(
    (payload: {
      title: string;
      titleBn?: string;
      subject: string;
      className: string;
      dueDate: string;
      instructions: string;
      teacherName?: string;
    }): CentralNotification => {
      const newNotif: CentralNotification = {
        id: `hw-${Date.now()}`,
        type: 'homework',
        title: `New Assignment: ${payload.title}`,
        titleBn: `নতুন হোমওয়ার্ক: ${payload.titleBn || payload.title}`,
        message: payload.instructions || `New homework assigned for ${payload.subject}. Please submit before ${payload.dueDate}.`,
        messageBn: `${payload.subject} বিষয়ের নতুন হোমওয়ার্ক অ্যাসাইন করা হয়েছে। জমা দেওয়ার শেষ সময়: ${payload.dueDate}।`,
        timestamp: new Date().toISOString(),
        targetRoles: ['student', 'parent', 'teacher'],
        targetClass: payload.className || 'All',
        subject: payload.subject,
        authorName: payload.teacherName || 'Faculty Teacher',
        authorRole: 'Subject Teacher',
        priority: 'high',
        readBy: [],
        actionUrl: '/student/homework',
        actionLabel: 'Open Homework',
        actionLabelBn: 'হোমওয়ার্ক দেখুন',
        metadata: {
          dueDate: payload.dueDate
        }
      };

      const updated = [newNotif, ...notifications];
      saveAndBroadcast(updated);
      if (soundAlertsEnabled) {
        playNotificationChime();
      }
      sendDesktopNotification({
        title: `New Assignment: ${payload.subject} (${payload.className})`,
        titleBn: `নতুন হোমওয়ার্ক: ${payload.subject} (${payload.className})`,
        body: `${payload.title} - Due: ${payload.dueDate}`,
        bodyBn: `${payload.titleBn || payload.title} - জমা দেওয়ার শেষ সময়: ${payload.dueDate}`,
        tag: newNotif.id,
        actionUrl: '/student/homework',
        critical: false
      });
      return newNotif;
    },
    [notifications, saveAndBroadcast, sendDesktopNotification, soundAlertsEnabled]
  );

  const publishExamResultAlert = useCallback(
    (payload: {
      examName: string;
      className: string;
      subject?: string;
      authorName?: string;
      gpa?: string;
    }): CentralNotification => {
      const newNotif: CentralNotification = {
        id: `res-${Date.now()}`,
        type: 'exam_result',
        title: `Exam Results Published: ${payload.examName}`,
        titleBn: `পরীক্ষার ফলাফল প্রকাশিত: ${payload.examName}`,
        message: `Official scorecards and transcripts for ${payload.className} have been verified and published to student and parent accounts.`,
        messageBn: `${payload.className}-এর অফিসিয়াল ফলাফল ও মার্কশিট পোর্টালে প্রকাশ করা হয়েছে। রিপোর্ট কার্ড দেখুন।`,
        timestamp: new Date().toISOString(),
        targetRoles: ['student', 'parent', 'teacher'],
        targetClass: payload.className || 'All',
        subject: payload.subject || 'All Subjects',
        authorName: payload.authorName || 'Exam Controller Committee',
        authorRole: 'Examination Board',
        priority: 'urgent',
        readBy: [],
        actionUrl: '/student/results',
        actionLabel: 'View Results',
        actionLabelBn: 'ফলাফল দেখুন',
        metadata: {
          examName: payload.examName,
          gpa: payload.gpa || '4.85'
        }
      };

      const updated = [newNotif, ...notifications];
      saveAndBroadcast(updated);
      if (soundAlertsEnabled) {
        playNotificationChime();
      }
      // Critical event: Trigger desktop alert for exam result publication!
      sendDesktopNotification({
        title: `CRITICAL ALERT: Exam Results Published!`,
        titleBn: `জরুরি নোটিশ: পরীক্ষার ফলাফল প্রকাশিত হয়েছে!`,
        body: `${payload.examName} (${payload.className}) transcripts are live. Tap to review grades and scorecard.`,
        bodyBn: `${payload.examName} (${payload.className})-এর পূর্ণাঙ্গ মার্কশিট প্রকাশিত হয়েছে। ফলাফল দেখতে ক্লিক করুন।`,
        tag: newNotif.id,
        actionUrl: '/student/results',
        critical: true
      });
      return newNotif;
    },
    [notifications, saveAndBroadcast, sendDesktopNotification, soundAlertsEnabled]
  );

  const triggerTestAlert = useCallback(
    (type: NotificationCategory, targetRole: NotificationTargetRole = 'student') => {
      if (type === 'homework') {
        publishHomeworkAlert({
          title: 'English Essay: Importance of Tree Plantation',
          titleBn: 'ইংরেজি রচনা: বৃক্ষরোপণ অভিযানের গুরুত্ব ও ভূমিকা',
          subject: 'English',
          className: 'Class 10',
          dueDate: 'Next Monday 10:00 AM',
          instructions: 'Write a 250-word structured essay with proper headings and vocabulary. Upload PDF in student portal.',
          teacherName: 'Salma Khatun'
        });
      } else if (type === 'exam_result') {
        publishExamResultAlert({
          examName: 'Second Term Model Test 2025',
          className: 'Class 10',
          subject: 'Combined Subjects',
          gpa: '5.00'
        });
      } else {
        broadcastAnnouncement({
          title: 'Emergency Weather Notice: Morning Shift Delayed by 1 Hour',
          titleBn: 'জরুরি আবহাওয়া বিজ্ঞপ্তি: সকালের ক্লাস ১ ঘণ্টা দেরিতে শুরু হবে',
          message: 'Due to severe fog and rainfall, tomorrow morning classes will commence from 9:00 AM instead of 8:00 AM.',
          messageBn: 'ভারী কুয়াশা ও বৃষ্টির কারণে আগামীকালের সকালের শিফটের ক্লাস ৮:০০ টার পরিবর্তে ৯:০০ টা থেকে শুরু হবে।',
          targetRoles: [targetRole, 'parent', 'teacher'],
          targetClass: 'All',
          priority: 'urgent',
          authorName: 'Principal Office',
          authorRole: 'Administration'
        });
      }
    },
    [broadcastAnnouncement, publishExamResultAlert, publishHomeworkAlert]
  );

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        desktopPermission,
        desktopAlertsEnabled,
        soundAlertsEnabled,
        requestDesktopPermission,
        toggleDesktopAlerts,
        toggleSoundAlerts,
        sendDesktopNotification,
        testDesktopNotification,
        getNotificationsForRole,
        getUnreadCountForRole,
        markAsRead,
        markAllAsRead,
        getNotificationReadReceipts,
        deleteNotification,
        broadcastAnnouncement,
        publishHomeworkAlert,
        publishExamResultAlert,
        triggerTestAlert
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
