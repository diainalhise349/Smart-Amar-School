import { LeaveApplication, LeavePolicy, DynamicTeacherLeaveBalance } from '../types';

export const LEAVE_STORAGE_KEY = 'smart_school_teacher_leaves_v2';
export const LEAVE_WORKFLOW_EVENT = 'smart-school-leave-workflow-event';
export const TEACHER_LEAVE_NOTIFICATIONS_KEY = 'smart_school_teacher_leave_notifications_v2';
export const TEACHER_LEAVE_NOTIFICATION_EVENT = 'smart-school-teacher-leave-notification-event';
export const LEAVE_POLICIES_STORAGE_KEY = 'smart_school_leave_policies_v2';
export const LEAVE_POLICY_EVENT = 'smart-school-leave-policy-event';

export const SEED_LEAVE_POLICIES: LeavePolicy[] = [
  {
    id: 'POL-CASUAL',
    name: 'Casual Leave',
    code: 'CL',
    category: 'Paid',
    color: '#f59e0b',
    description: 'Routine personal leave for unavoidable domestic affairs, urgent errands, or family social ceremonies.',
    annualDays: 14,
    accrualMethod: 'Annual Upfront',
    accrualRatePerMonth: 1.16,
    allowCarryForward: false,
    maxCarryForwardDays: 0,
    encashable: false,
    minServiceMonths: 0,
    applicableRoles: ['All'],
    genderEligibility: 'All',
    minAdvanceNoticeDays: 1,
    maxConsecutiveDays: 3,
    requiresSubstituteTeacher: true,
    requiresDocumentProof: false,
    documentProofNotice: 'Not required for routine applications up to 3 days.',
    isActive: true,
    updatedAt: '2026-09-01T00:00:00.000Z',
    updatedBy: 'School Administration'
  },
  {
    id: 'POL-SICK',
    name: 'Sick / Medical Leave',
    code: 'SL',
    category: 'Paid',
    color: '#10b981',
    description: 'Absence due to acute personal illness, surgery, contagious infections, or physical injury.',
    annualDays: 10,
    accrualMethod: 'Annual Upfront',
    accrualRatePerMonth: 0.83,
    allowCarryForward: true,
    maxCarryForwardDays: 5,
    encashable: false,
    minServiceMonths: 0,
    applicableRoles: ['All'],
    genderEligibility: 'All',
    minAdvanceNoticeDays: 0,
    maxConsecutiveDays: 14,
    requiresSubstituteTeacher: true,
    requiresDocumentProof: true,
    documentProofNotice: 'Registered physician prescription or medical fitness slip mandatory for absences exceeding 2 days.',
    isActive: true,
    updatedAt: '2026-09-01T00:00:00.000Z',
    updatedBy: 'School Administration'
  },
  {
    id: 'POL-DUTY',
    name: 'Academic Duty / Conference',
    code: 'DL',
    category: 'Paid',
    color: '#6366f1',
    description: 'Official academic duty including Board Exam invigilation, script evaluation, national symposiums, or pedagogy workshops.',
    annualDays: 7,
    accrualMethod: 'Annual Upfront',
    accrualRatePerMonth: 0.58,
    allowCarryForward: false,
    maxCarryForwardDays: 0,
    encashable: false,
    minServiceMonths: 0,
    applicableRoles: ['All'],
    genderEligibility: 'All',
    minAdvanceNoticeDays: 3,
    maxConsecutiveDays: 5,
    requiresSubstituteTeacher: true,
    requiresDocumentProof: true,
    documentProofNotice: 'Official appointment letter, BISE order, or conference keynote invitation required.',
    isActive: true,
    updatedAt: '2026-09-01T00:00:00.000Z',
    updatedBy: 'School Administration'
  },
  {
    id: 'POL-EARNED',
    name: 'Earned / Privilege Leave',
    code: 'EL',
    category: 'Paid',
    color: '#8b5cf6',
    description: 'Accumulated privilege leave earned proportionally to active teaching service days. May be carried forward or encashed.',
    annualDays: 15,
    accrualMethod: 'Monthly Accrual',
    accrualRatePerMonth: 1.25,
    allowCarryForward: true,
    maxCarryForwardDays: 30,
    encashable: true,
    minServiceMonths: 6,
    applicableRoles: ['Senior Teacher', 'Assistant Teacher', 'Lecturer', 'Head of Department'],
    genderEligibility: 'All',
    minAdvanceNoticeDays: 7,
    maxConsecutiveDays: 20,
    requiresSubstituteTeacher: true,
    requiresDocumentProof: false,
    documentProofNotice: 'Requires Department Head counter-endorsement prior to administrative submission.',
    isActive: true,
    updatedAt: '2026-09-01T00:00:00.000Z',
    updatedBy: 'School Administration'
  },
  {
    id: 'POL-EMERGENCY',
    name: 'Emergency / Compassionate Leave',
    code: 'ECL',
    category: 'Paid',
    color: '#f43f5e',
    description: 'Immediate relief for sudden family crisis, severe domestic bereavement, or urgent natural calamities.',
    annualDays: 5,
    accrualMethod: 'Annual Upfront',
    accrualRatePerMonth: 0.42,
    allowCarryForward: false,
    maxCarryForwardDays: 0,
    encashable: false,
    minServiceMonths: 0,
    applicableRoles: ['All'],
    genderEligibility: 'All',
    minAdvanceNoticeDays: 0,
    maxConsecutiveDays: 3,
    requiresSubstituteTeacher: false,
    requiresDocumentProof: false,
    documentProofNotice: 'Can be reported retroactively within 24 hours of incident.',
    isActive: true,
    updatedAt: '2026-09-01T00:00:00.000Z',
    updatedBy: 'School Administration'
  },
  {
    id: 'POL-MATERNITY',
    name: 'Maternity / Parental Leave',
    code: 'ML',
    category: 'Special',
    color: '#ec4899',
    description: 'Statutory maternity entitlement per Ministry of Education service rules for female educators.',
    annualDays: 90,
    accrualMethod: 'Annual Upfront',
    accrualRatePerMonth: 7.5,
    allowCarryForward: false,
    maxCarryForwardDays: 0,
    encashable: false,
    minServiceMonths: 6,
    applicableRoles: ['All'],
    genderEligibility: 'Female Only',
    minAdvanceNoticeDays: 14,
    maxConsecutiveDays: 90,
    requiresSubstituteTeacher: true,
    requiresDocumentProof: true,
    documentProofNotice: 'Certified clinical obstetrician report and expected date of delivery certificate.',
    isActive: true,
    updatedAt: '2026-09-01T00:00:00.000Z',
    updatedBy: 'School Administration'
  },
  {
    id: 'POL-SABBATICAL',
    name: 'Study / Sabbatical Leave',
    code: 'STL',
    category: 'Half-Pay',
    color: '#06b6d4',
    description: 'Long-term research, higher degree completion (M.Phil / Ph.D), or international fellowship in educational pedagogy.',
    annualDays: 30,
    accrualMethod: 'Tenure-Based',
    accrualRatePerMonth: 2.5,
    allowCarryForward: false,
    maxCarryForwardDays: 0,
    encashable: false,
    minServiceMonths: 24,
    applicableRoles: ['Senior Teacher', 'Lecturer', 'Head of Department'],
    genderEligibility: 'All',
    minAdvanceNoticeDays: 30,
    maxConsecutiveDays: 30,
    requiresSubstituteTeacher: true,
    requiresDocumentProof: true,
    documentProofNotice: 'University admission acceptance letter, syllabus prospectus, and Academic Council recommendation.',
    isActive: true,
    updatedAt: '2026-09-01T00:00:00.000Z',
    updatedBy: 'School Administration'
  }
];

export interface TeacherLeaveNotification {
  id: string;
  leaveId: string;
  applicantId: string;
  applicantName: string;
  applicantAvatar?: string;
  previousStatus: 'Pending' | 'Approved' | 'Rejected';
  newStatus: 'Approved' | 'Rejected';
  leaveType: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason?: string;
  adminComment: string;
  reviewedBy: string;
  reviewedAt: string;
  createdAt: string;
  read: boolean;
}

// Initial realistic seed notifications for teachers
const SEED_TEACHER_NOTIFICATIONS: TeacherLeaveNotification[] = [
  {
    id: 'TLN-2026-001',
    leaveId: 'LV-2026-104',
    applicantId: 'EMP-001',
    applicantName: 'Abdul Jabbar',
    applicantAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop',
    previousStatus: 'Pending',
    newStatus: 'Approved',
    leaveType: 'Casual',
    startDate: '2026-09-08',
    endDate: '2026-09-08',
    daysCount: 1,
    reason: 'Urgent municipal land registration and biometric verification appointment at Sub-Registry Office.',
    adminComment: 'Approved. Swapped Period 2 Calculus with Period 5 English session. Make sure morning register is updated.',
    reviewedBy: 'School Admin Office',
    reviewedAt: '2026-09-06T16:00:00.000Z',
    createdAt: '2026-09-06T16:00:00.000Z',
    read: false
  },
  {
    id: 'TLN-2026-002',
    leaveId: 'LV-2026-105',
    applicantId: 'EMP-002',
    applicantName: 'Salma Khatun',
    applicantAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop',
    previousStatus: 'Pending',
    newStatus: 'Rejected',
    leaveType: 'Casual',
    startDate: '2026-08-14',
    endDate: '2026-08-18',
    daysCount: 5,
    reason: 'Vacation trip during National Independence Week festivities.',
    adminComment: 'Application declined. Routine vacations cannot be sanctioned during pre-scheduled Inter-School Debate Championship and Board Trial invigilations.',
    reviewedBy: 'Dr. Shah Alam (Vice Principal / Academic Dean)',
    reviewedAt: '2026-08-11T14:10:00.000Z',
    createdAt: '2026-08-11T14:10:00.000Z',
    read: false
  },
  {
    id: 'TLN-2026-003',
    leaveId: 'LV-2026-061',
    applicantId: 'EMP-001',
    applicantName: 'Abdul Jabbar',
    applicantAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop',
    previousStatus: 'Pending',
    newStatus: 'Approved',
    leaveType: 'Duty',
    startDate: '2026-06-20',
    endDate: '2026-06-22',
    daysCount: 3,
    reason: 'Appointed as Chief Head Examiner for Secondary School Certificate (SSC) Higher Math scripts moderation.',
    adminComment: 'Duty leave sanctioned in public interest per BISE appointment letter.',
    reviewedBy: 'Academic Council',
    reviewedAt: '2026-06-13T11:00:00.000Z',
    createdAt: '2026-06-13T11:00:00.000Z',
    read: true
  }
];

// Initial high-fidelity seed data showcasing active workflow statuses
const SEED_LEAVE_APPLICATIONS: LeaveApplication[] = [
  {
    id: 'LV-2026-101',
    applicantName: 'Abdul Jabbar',
    applicantId: 'EMP-001',
    applicantDesignation: 'Senior Teacher (Mathematics & Physics)',
    applicantDepartment: 'Science & Mathematics',
    applicantPhone: '01700-000001',
    applicantAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop',
    role: 'Teacher',
    type: 'Sick',
    startDate: '2026-09-24',
    endDate: '2026-09-25',
    daysCount: 2,
    reason: 'Severe viral fever and physician recommended 48-hour bed rest. Medical prescription attached with office.',
    backupTeacher: 'Nasreen Akter (Senior Science Faculty)',
    emergencyContact: '01711-223399 (Spouse)',
    appliedOn: '2026-09-23T08:15:00.000Z',
    status: 'Pending',
    statusTimeline: [
      {
        status: 'Pending',
        timestamp: '2026-09-23T08:15:00.000Z',
        actor: 'Abdul Jabbar (Applicant)',
        comment: 'Application submitted through Teacher Portal for emergency medical rest.'
      }
    ]
  },
  {
    id: 'LV-2026-102',
    applicantName: 'Salma Khatun',
    applicantId: 'EMP-002',
    applicantDesignation: 'Assistant Teacher (English Literature)',
    applicantDepartment: 'Humanities & Languages',
    applicantPhone: '01700-000002',
    applicantAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop',
    role: 'Teacher',
    type: 'Casual',
    startDate: '2026-09-28',
    endDate: '2026-09-30',
    daysCount: 3,
    reason: 'Attending younger sister\'s wedding ceremony and family reception in Sylhet Sadar.',
    backupTeacher: 'Abdul Jabbar (Class Teacher Grade 10)',
    emergencyContact: '01819-554433 (Brother)',
    appliedOn: '2026-09-22T14:30:00.000Z',
    status: 'Pending',
    statusTimeline: [
      {
        status: 'Pending',
        timestamp: '2026-09-22T14:30:00.000Z',
        actor: 'Salma Khatun (Applicant)',
        comment: 'Applied 1 week in advance. Class 9 and 10 English lessons rescheduled.'
      }
    ]
  },
  {
    id: 'LV-2026-103',
    applicantName: 'Nasreen Akter',
    applicantId: 'EMP-004',
    applicantDesignation: 'Senior Faculty (Chemistry & Biology)',
    applicantDepartment: 'Science',
    applicantPhone: '01700-000004',
    applicantAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop',
    role: 'Teacher',
    type: 'Duty',
    startDate: '2026-09-18',
    endDate: '2026-09-19',
    daysCount: 2,
    reason: 'Selected as Keynote Paper Presenter at National STEM Educators Symposium at University of Dhaka.',
    backupTeacher: 'Abdul Jabbar (Senior Teacher)',
    emergencyContact: '01700-000004',
    appliedOn: '2026-09-12T10:00:00.000Z',
    status: 'Approved',
    adminComment: 'Approved with official commendation. Practical Chemistry laboratory duties delegated to Lab Demonstrator. Safe travels.',
    reviewedBy: 'Dr. M. Rahman (Headmaster / School Admin)',
    reviewedAt: '2026-09-13T11:45:00.000Z',
    statusTimeline: [
      {
        status: 'Pending',
        timestamp: '2026-09-12T10:00:00.000Z',
        actor: 'Nasreen Akter (Applicant)',
        comment: 'Submitted conference invitation letter.'
      },
      {
        status: 'Approved',
        timestamp: '2026-09-13T11:45:00.000Z',
        actor: 'Dr. M. Rahman (School Admin)',
        comment: 'Approved with official commendation. Practical Chemistry laboratory duties delegated to Lab Demonstrator. Safe travels.'
      }
    ]
  },
  {
    id: 'LV-2026-104',
    applicantName: 'Abdul Jabbar',
    applicantId: 'EMP-001',
    applicantDesignation: 'Senior Teacher (Mathematics & Physics)',
    applicantDepartment: 'Science & Mathematics',
    applicantPhone: '01700-000001',
    applicantAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop',
    role: 'Teacher',
    type: 'Casual',
    startDate: '2026-09-08',
    endDate: '2026-09-08',
    daysCount: 1,
    reason: 'Urgent municipal land registration and biometric verification appointment at Sub-Registry Office.',
    backupTeacher: 'Salma Khatun',
    emergencyContact: '01700-000001',
    appliedOn: '2026-09-06T09:20:00.000Z',
    status: 'Approved',
    adminComment: 'Approved. Swapped Period 2 Calculus with Period 5 English session. Make sure morning register is updated.',
    reviewedBy: 'School Admin Office',
    reviewedAt: '2026-09-06T16:00:00.000Z',
    statusTimeline: [
      {
        status: 'Pending',
        timestamp: '2026-09-06T09:20:00.000Z',
        actor: 'Abdul Jabbar (Applicant)',
        comment: 'Official appointment token uploaded.'
      },
      {
        status: 'Approved',
        timestamp: '2026-09-06T16:00:00.000Z',
        actor: 'School Admin Office',
        comment: 'Approved. Swapped Period 2 Calculus with Period 5 English session. Make sure morning register is updated.'
      }
    ]
  },
  {
    id: 'LV-2026-105',
    applicantName: 'Salma Khatun',
    applicantId: 'EMP-002',
    applicantDesignation: 'Assistant Teacher (English Literature)',
    applicantDepartment: 'Humanities & Languages',
    applicantPhone: '01700-000002',
    applicantAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop',
    role: 'Teacher',
    type: 'Casual',
    startDate: '2026-08-14',
    endDate: '2026-08-18',
    daysCount: 5,
    reason: 'Vacation trip during National Independence Week festivities.',
    backupTeacher: 'Unassigned',
    emergencyContact: '01700-000002',
    appliedOn: '2026-08-10T11:00:00.000Z',
    status: 'Rejected',
    adminComment: 'Application declined. Routine vacations cannot be sanctioned during pre-scheduled Inter-School Debate Championship and Board Trial invigilations.',
    reviewedBy: 'Dr. Shah Alam (Vice Principal / Academic Dean)',
    reviewedAt: '2026-08-11T14:10:00.000Z',
    statusTimeline: [
      {
        status: 'Pending',
        timestamp: '2026-08-10T11:00:00.000Z',
        actor: 'Salma Khatun (Applicant)',
        comment: 'Applied for 5 continuous casual leave days.'
      },
      {
        status: 'Rejected',
        timestamp: '2026-08-11T14:10:00.000Z',
        actor: 'Dr. Shah Alam (Vice Principal)',
        comment: 'Application declined. Routine vacations cannot be sanctioned during pre-scheduled Inter-School Debate Championship and Board Trial invigilations.'
      }
    ]
  },
  {
    id: 'LV-2026-081',
    applicantName: 'M. Kabir Hossain',
    applicantId: 'EMP-003',
    applicantDesignation: 'Senior Faculty (Mathematics)',
    applicantDepartment: 'Science & Mathematics',
    applicantPhone: '01700-000003',
    applicantAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    role: 'Teacher',
    type: 'Sick',
    startDate: '2026-08-03',
    endDate: '2026-08-05',
    daysCount: 3,
    reason: 'Acute seasonal broncho-respiratory infection and prescribed antibiotic regimen.',
    backupTeacher: 'Abdul Jabbar',
    emergencyContact: '01700-000003',
    appliedOn: '2026-08-02T08:00:00.000Z',
    status: 'Approved',
    adminComment: 'Sanctioned. Medical fitness certificate verified upon resumption of duty.',
    reviewedBy: 'School Admin Office',
    reviewedAt: '2026-08-02T12:00:00.000Z',
    statusTimeline: [
      { status: 'Pending', timestamp: '2026-08-02T08:00:00.000Z', actor: 'M. Kabir Hossain', comment: 'Submitted clinical slip.' },
      { status: 'Approved', timestamp: '2026-08-02T12:00:00.000Z', actor: 'School Admin', comment: 'Sanctioned.' }
    ]
  },
  {
    id: 'LV-2026-071',
    applicantName: 'Farhana Yasmin',
    applicantId: 'EMP-005',
    applicantDesignation: 'Assistant Teacher (Social Studies)',
    applicantDepartment: 'Humanities & Languages',
    applicantPhone: '01700-000005',
    applicantAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop',
    role: 'Teacher',
    type: 'Earned',
    startDate: '2026-07-15',
    endDate: '2026-07-18',
    daysCount: 4,
    reason: 'Family relocation and admission procedures for children in high school.',
    backupTeacher: 'Salma Khatun',
    emergencyContact: '01700-000005',
    appliedOn: '2026-07-08T10:30:00.000Z',
    status: 'Approved',
    adminComment: 'Earned leave sanctioned against accumulated service quota balance.',
    reviewedBy: 'Headmaster',
    reviewedAt: '2026-07-09T14:00:00.000Z'
  },
  {
    id: 'LV-2026-061',
    applicantName: 'Abdul Jabbar',
    applicantId: 'EMP-001',
    applicantDesignation: 'Senior Teacher (Mathematics)',
    applicantDepartment: 'Science & Mathematics',
    applicantPhone: '01700-000001',
    applicantAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop',
    role: 'Teacher',
    type: 'Duty',
    startDate: '2026-06-20',
    endDate: '2026-06-22',
    daysCount: 3,
    reason: 'Appointed as Chief Head Examiner for Secondary School Certificate (SSC) Higher Math scripts moderation.',
    backupTeacher: 'Nasreen Akter',
    emergencyContact: '01700-000001',
    appliedOn: '2026-06-12T09:00:00.000Z',
    status: 'Approved',
    adminComment: 'Duty leave sanctioned in public interest per BISE appointment letter.',
    reviewedBy: 'Academic Council',
    reviewedAt: '2026-06-13T11:00:00.000Z'
  },
  {
    id: 'LV-2026-051',
    applicantName: 'Salma Khatun',
    applicantId: 'EMP-002',
    applicantDesignation: 'Assistant Teacher (English)',
    applicantDepartment: 'Humanities & Languages',
    applicantPhone: '01700-000002',
    applicantAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop',
    role: 'Teacher',
    type: 'Casual',
    startDate: '2026-05-11',
    endDate: '2026-05-12',
    daysCount: 2,
    reason: 'Urgent domestic obligation and elderly parent physician follow-up in medical center.',
    backupTeacher: 'M. Kabir Hossain',
    emergencyContact: '01700-000002',
    appliedOn: '2026-05-09T15:00:00.000Z',
    status: 'Approved',
    adminComment: 'Sanctioned with substitute arrangement in place.',
    reviewedBy: 'School Admin',
    reviewedAt: '2026-05-10T09:30:00.000Z'
  },
  {
    id: 'LV-2026-041',
    applicantName: 'Tariqul Islam',
    applicantId: 'EMP-006',
    applicantDesignation: 'Lecturer (Physics)',
    applicantDepartment: 'Science & Mathematics',
    applicantPhone: '01700-000006',
    role: 'Teacher',
    type: 'Sick',
    startDate: '2026-04-18',
    endDate: '2026-04-20',
    daysCount: 3,
    reason: 'Eye surgery recovery and post-op medical restriction on screen work.',
    backupTeacher: 'Abdul Jabbar',
    emergencyContact: '01700-000006',
    appliedOn: '2026-04-15T11:00:00.000Z',
    status: 'Approved',
    adminComment: 'Approved. Relieved from evening tutorial supervision.',
    reviewedBy: 'Headmaster',
    reviewedAt: '2026-04-16T10:00:00.000Z'
  },
  {
    id: 'LV-2026-031',
    applicantName: 'Tahmina Begum',
    applicantId: 'EMP-007',
    applicantDesignation: 'Assistant Teacher (Bangla)',
    applicantDepartment: 'Humanities & Languages',
    applicantPhone: '01700-000007',
    role: 'Teacher',
    type: 'Maternity',
    startDate: '2026-03-01',
    endDate: '2026-05-30',
    daysCount: 90,
    reason: 'Statutory maternity leave entitlement per Ministry of Education service rules.',
    backupTeacher: 'Salma Khatun & Guest Faculty',
    emergencyContact: '01700-000007',
    appliedOn: '2026-02-15T10:00:00.000Z',
    status: 'Approved',
    adminComment: 'Full statutory maternity leave approved with full pay and substitute guest lecturer rostered.',
    reviewedBy: 'Managing Committee & Principal',
    reviewedAt: '2026-02-18T16:00:00.000Z'
  },
  {
    id: 'LV-2026-021',
    applicantName: 'Nasreen Akter',
    applicantId: 'EMP-004',
    applicantDesignation: 'Senior Faculty (Chemistry)',
    applicantDepartment: 'Science',
    applicantPhone: '01700-000004',
    applicantAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop',
    role: 'Teacher',
    type: 'Casual',
    startDate: '2026-02-23',
    endDate: '2026-02-24',
    daysCount: 2,
    reason: 'Family ceremony attendance out of town.',
    backupTeacher: 'Abdul Jabbar',
    emergencyContact: '01700-000004',
    appliedOn: '2026-02-20T08:30:00.000Z',
    status: 'Approved',
    adminComment: 'Sanctioned.',
    reviewedBy: 'School Admin',
    reviewedAt: '2026-02-21T09:00:00.000Z'
  },
  {
    id: 'LV-2026-011',
    applicantName: 'Abdul Jabbar',
    applicantId: 'EMP-001',
    applicantDesignation: 'Senior Teacher (Mathematics)',
    applicantDepartment: 'Science & Mathematics',
    applicantPhone: '01700-000001',
    applicantAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop',
    role: 'Teacher',
    type: 'Sick',
    startDate: '2026-01-12',
    endDate: '2026-01-13',
    daysCount: 2,
    reason: 'Seasonal influenza and acute throat infection.',
    backupTeacher: 'M. Kabir Hossain',
    emergencyContact: '01700-000001',
    appliedOn: '2026-01-11T19:00:00.000Z',
    status: 'Approved',
    adminComment: 'Approved. Get well soon.',
    reviewedBy: 'School Admin',
    reviewedAt: '2026-01-12T07:30:00.000Z'
  },
  {
    id: 'LV-2026-012',
    applicantName: 'Kamal Hossain',
    applicantId: 'EMP-008',
    applicantDesignation: 'Physical Education Instructor',
    applicantDepartment: 'Physical Education & Sports',
    applicantPhone: '01700-000008',
    role: 'Teacher',
    type: 'Casual',
    startDate: '2026-01-26',
    endDate: '2026-01-26',
    daysCount: 1,
    reason: 'Personal financial banking work and passport renewal interview.',
    backupTeacher: 'Unassigned',
    emergencyContact: '01700-000008',
    appliedOn: '2026-01-25T14:00:00.000Z',
    status: 'Rejected',
    adminComment: 'Declined due to mandatory Annual Sports Day preparation rehearsals on that morning.',
    reviewedBy: 'Vice Principal',
    reviewedAt: '2026-01-25T18:00:00.000Z'
  }
];

export const calculateDaysCount = (startDate: string, endDate: string): number => {
  if (!startDate || !endDate) return 1;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays > 0 ? diffDays : 1;
};

/**
 * Retrieves all stored leave applications or initializes from seeds.
 */
export const getLeaveApplications = (): LeaveApplication[] => {
  try {
    const raw = localStorage.getItem(LEAVE_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LEAVE_STORAGE_KEY, JSON.stringify(SEED_LEAVE_APPLICATIONS));
      return SEED_LEAVE_APPLICATIONS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // If stored array is small from early testing, merge seed applications that don't exist
      if (parsed.length < SEED_LEAVE_APPLICATIONS.length) {
        const existingIds = new Set(parsed.map((p: LeaveApplication) => p.id));
        const merged = [...parsed];
        SEED_LEAVE_APPLICATIONS.forEach(seed => {
          if (!existingIds.has(seed.id)) {
            merged.push(seed);
          }
        });
        localStorage.setItem(LEAVE_STORAGE_KEY, JSON.stringify(merged));
        return merged;
      }
      return parsed;
    }
    localStorage.setItem(LEAVE_STORAGE_KEY, JSON.stringify(SEED_LEAVE_APPLICATIONS));
    return SEED_LEAVE_APPLICATIONS;
  } catch (err) {
    console.error('Error reading leave applications from localStorage:', err);
    return SEED_LEAVE_APPLICATIONS;
  }
};

export interface LeaveTypeDistributionItem {
  type: string;
  name: string;
  count: number;
  totalDays: number;
  percentage: number;
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
  color: string;
  quotaDays: number;
}

export interface MonthlyLeaveTrendItem {
  month: string;
  fullMonth: string;
  monthIndex: number;
  totalApplications: number;
  approved: number;
  pending: number;
  rejected: number;
  totalDays: number;
  approvedDays: number;
  casualCount: number;
  sickCount: number;
  dutyCount: number;
  otherCount: number;
}

const LEAVE_TYPE_COLORS: Record<string, string> = {
  'Casual': '#f59e0b', // Amber
  'Sick': '#10b981',   // Emerald
  'Duty': '#6366f1',   // Indigo
  'Earned': '#8b5cf6', // Violet
  'Maternity': '#ec4899', // Pink
  'Unpaid': '#06b6d4', // Cyan
  'Emergency': '#f43f5e' // Rose
};

const LEAVE_TYPE_QUOTAS: Record<string, number> = {
  'Casual': 15,
  'Sick': 14,
  'Duty': 10,
  'Earned': 20,
  'Maternity': 180,
  'Unpaid': 0,
  'Emergency': 5
};

/**
 * Computes distribution of leave types for Recharts Pie Chart
 */
export const getLeaveTypeDistribution = (applications: LeaveApplication[]): LeaveTypeDistributionItem[] => {
  const typeMap = new Map<string, {
    count: number;
    totalDays: number;
    approvedCount: number;
    pendingCount: number;
    rejectedCount: number;
  }>();

  applications.forEach(app => {
    const rawType = (app.type || 'Casual').trim();
    // Normalize type string
    const normalizedType = rawType.charAt(0).toUpperCase() + rawType.slice(1).toLowerCase();
    
    if (!typeMap.has(normalizedType)) {
      typeMap.set(normalizedType, {
        count: 0,
        totalDays: 0,
        approvedCount: 0,
        pendingCount: 0,
        rejectedCount: 0
      });
    }

    const current = typeMap.get(normalizedType)!;
    current.count += 1;
    current.totalDays += app.daysCount || 1;
    if (app.status === 'Approved') current.approvedCount += 1;
    else if (app.status === 'Pending') current.pendingCount += 1;
    else if (app.status === 'Rejected') current.rejectedCount += 1;
  });

  const totalAllApps = applications.length || 1;

  // Make sure major standard types appear even if count is 0 for smooth UI
  const standardTypes = ['Casual', 'Sick', 'Duty', 'Earned', 'Maternity'];
  standardTypes.forEach(st => {
    if (!typeMap.has(st)) {
      typeMap.set(st, {
        count: 0,
        totalDays: 0,
        approvedCount: 0,
        pendingCount: 0,
        rejectedCount: 0
      });
    }
  });

  const result: LeaveTypeDistributionItem[] = [];
  typeMap.forEach((val, type) => {
    // Only omit 0-count items if total types > 5
    if (val.count > 0 || standardTypes.includes(type)) {
      result.push({
        type,
        name: `${type} Leave`,
        count: val.count,
        totalDays: val.totalDays,
        percentage: totalAllApps > 0 ? Math.round((val.count / totalAllApps) * 100) : 0,
        approvedCount: val.approvedCount,
        pendingCount: val.pendingCount,
        rejectedCount: val.rejectedCount,
        color: LEAVE_TYPE_COLORS[type] || '#64748b',
        quotaDays: LEAVE_TYPE_QUOTAS[type] || 15
      });
    }
  });

  // Sort by count descending
  return result.sort((a, b) => b.count - a.count);
};

/**
 * Computes monthly leave trends for Recharts Bar Chart across Jan - Dec
 */
export const getMonthlyLeaveTrends = (applications: LeaveApplication[], targetYear: string = '2026'): MonthlyLeaveTrendItem[] => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fullMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthData: MonthlyLeaveTrendItem[] = months.map((m, idx) => ({
    month: m,
    fullMonth: fullMonths[idx],
    monthIndex: idx,
    totalApplications: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    totalDays: 0,
    approvedDays: 0,
    casualCount: 0,
    sickCount: 0,
    dutyCount: 0,
    otherCount: 0
  }));

  applications.forEach(app => {
    const dateStr = app.startDate || app.appliedOn;
    if (!dateStr) return;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return;
    
    // Check year
    const appYear = d.getFullYear().toString();
    if (targetYear && targetYear !== 'All' && appYear !== targetYear) return;

    const mIdx = d.getMonth();
    if (mIdx >= 0 && mIdx < 12) {
      const bucket = monthData[mIdx];
      bucket.totalApplications += 1;
      const days = app.daysCount || 1;
      bucket.totalDays += days;

      if (app.status === 'Approved') {
        bucket.approved += 1;
        bucket.approvedDays += days;
      } else if (app.status === 'Pending') {
        bucket.pending += 1;
      } else if (app.status === 'Rejected') {
        bucket.rejected += 1;
      }

      const t = (app.type || '').toLowerCase();
      if (t.includes('casual')) bucket.casualCount += 1;
      else if (t.includes('sick')) bucket.sickCount += 1;
      else if (t.includes('duty')) bucket.dutyCount += 1;
      else bucket.otherCount += 1;
    }
  });

  return monthData;
};

/**
 * Saves applications and dispatches cross-component event
 */
const saveLeaveApplications = (applications: LeaveApplication[]) => {
  try {
    localStorage.setItem(LEAVE_STORAGE_KEY, JSON.stringify(applications));
    window.dispatchEvent(new CustomEvent(LEAVE_WORKFLOW_EVENT, { detail: { count: applications.length } }));
  } catch (err) {
    console.error('Error saving leave applications:', err);
  }
};

/**
 * Returns leave applications for a specific teacher/employee ID
 */
export const getTeacherLeaves = (applicantId: string): LeaveApplication[] => {
  const all = getLeaveApplications();
  return all.filter(l => l.applicantId === applicantId);
};

/**
 * Returns the count of pending leave applications awaiting admin review
 */
export const getPendingLeaveCount = (): number => {
  const all = getLeaveApplications();
  return all.filter(l => l.status === 'Pending').length;
};

/**
 * Retrieves all stored leave policies or initializes from seeds.
 */
export const getLeavePolicies = (): LeavePolicy[] => {
  try {
    const raw = localStorage.getItem(LEAVE_POLICIES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LEAVE_POLICIES_STORAGE_KEY, JSON.stringify(SEED_LEAVE_POLICIES));
      return SEED_LEAVE_POLICIES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    localStorage.setItem(LEAVE_POLICIES_STORAGE_KEY, JSON.stringify(SEED_LEAVE_POLICIES));
    return SEED_LEAVE_POLICIES;
  } catch (err) {
    console.error('Error reading leave policies:', err);
    return SEED_LEAVE_POLICIES;
  }
};

/**
 * Saves a new or edited leave policy and notifies listeners
 */
export const saveLeavePolicy = (policy: LeavePolicy): { success: boolean; message: string; policy: LeavePolicy } => {
  try {
    const policies = getLeavePolicies();
    const existingIndex = policies.findIndex(p => p.id === policy.id);
    let updatedList: LeavePolicy[];

    const finalPolicy: LeavePolicy = {
      ...policy,
      updatedAt: new Date().toISOString(),
      updatedBy: policy.updatedBy || 'School Administration'
    };

    if (existingIndex >= 0) {
      updatedList = [...policies];
      updatedList[existingIndex] = finalPolicy;
    } else {
      updatedList = [finalPolicy, ...policies];
    }

    localStorage.setItem(LEAVE_POLICIES_STORAGE_KEY, JSON.stringify(updatedList));
    window.dispatchEvent(new CustomEvent(LEAVE_POLICY_EVENT, { detail: { action: 'save', policy: finalPolicy } }));
    window.dispatchEvent(new CustomEvent(LEAVE_WORKFLOW_EVENT, { detail: { updated: true } }));

    return {
      success: true,
      message: `Leave policy "${finalPolicy.name}" (${finalPolicy.code}) successfully saved.`,
      policy: finalPolicy
    };
  } catch (err: any) {
    console.error('Error saving leave policy:', err);
    return {
      success: false,
      message: 'Failed to save leave policy. ' + (err?.message || ''),
      policy
    };
  }
};

/**
 * Deletes a leave policy
 */
export const deleteLeavePolicy = (policyId: string): { success: boolean; message: string } => {
  try {
    const policies = getLeavePolicies();
    const target = policies.find(p => p.id === policyId);
    if (!target) {
      return { success: false, message: 'Policy not found.' };
    }
    const filtered = policies.filter(p => p.id !== policyId);
    localStorage.setItem(LEAVE_POLICIES_STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent(LEAVE_POLICY_EVENT, { detail: { action: 'delete', policyId } }));
    window.dispatchEvent(new CustomEvent(LEAVE_WORKFLOW_EVENT, { detail: { updated: true } }));
    return { success: true, message: `Leave policy "${target.name}" has been deleted.` };
  } catch (err: any) {
    console.error('Error deleting leave policy:', err);
    return { success: false, message: 'Failed to delete leave policy.' };
  }
};

/**
 * Toggles a policy's active/inactive status
 */
export const toggleLeavePolicyStatus = (policyId: string): { success: boolean; message: string; isActive: boolean } => {
  try {
    const policies = getLeavePolicies();
    const target = policies.find(p => p.id === policyId);
    if (!target) {
      return { success: false, message: 'Policy not found.', isActive: false };
    }
    const nextStatus = !target.isActive;
    const updated = policies.map(p => p.id === policyId ? { ...p, isActive: nextStatus, updatedAt: new Date().toISOString() } : p);
    localStorage.setItem(LEAVE_POLICIES_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(LEAVE_POLICY_EVENT, { detail: { action: 'toggle', policyId, isActive: nextStatus } }));
    window.dispatchEvent(new CustomEvent(LEAVE_WORKFLOW_EVENT, { detail: { updated: true } }));
    return {
      success: true,
      message: `Policy "${target.name}" is now ${nextStatus ? 'Active' : 'Deactivated'}.`,
      isActive: nextStatus
    };
  } catch (err: any) {
    console.error('Error toggling leave policy:', err);
    return { success: false, message: 'Failed to toggle policy status.', isActive: false };
  }
};

/**
 * Resets leave policies to standard institutional seeds
 */
export const resetLeavePolicies = (): LeavePolicy[] => {
  try {
    localStorage.setItem(LEAVE_POLICIES_STORAGE_KEY, JSON.stringify(SEED_LEAVE_POLICIES));
    window.dispatchEvent(new CustomEvent(LEAVE_POLICY_EVENT, { detail: { action: 'reset' } }));
    window.dispatchEvent(new CustomEvent(LEAVE_WORKFLOW_EVENT, { detail: { updated: true } }));
    return SEED_LEAVE_POLICIES;
  } catch (err) {
    console.error('Error resetting leave policies:', err);
    return SEED_LEAVE_POLICIES;
  }
};

/**
 * Subscribes to leave policy updates
 */
export const subscribeToPolicyUpdates = (callback: () => void): (() => void) => {
  const handler = () => callback();
  window.addEventListener(LEAVE_POLICY_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(LEAVE_POLICY_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
};

/**
 * Returns dynamic balance data for all active leave policies for a given teacher
 */
export const getTeacherDynamicLeaveBalances = (applicantId: string): DynamicTeacherLeaveBalance[] => {
  const policies = getLeavePolicies().filter(p => p.isActive);
  const teacherLeaves = getTeacherLeaves(applicantId);
  const approvedLeaves = teacherLeaves.filter(l => l.status === 'Approved');
  const pendingLeaves = teacherLeaves.filter(l => l.status === 'Pending');

  return policies.map(policy => {
    const policyNameLower = policy.name.toLowerCase();
    const policyCodeLower = policy.code.toLowerCase();

    // Check if an application matches this policy
    const matchesPolicy = (app: LeaveApplication) => {
      const t = (app.type || '').toLowerCase();
      return (
        t === policyNameLower ||
        t.includes(policyNameLower) ||
        policyNameLower.includes(t) ||
        t === policyCodeLower
      );
    };

    const usedDays = approvedLeaves
      .filter(matchesPolicy)
      .reduce((sum, item) => sum + (item.daysCount || 1), 0);

    const pendingDays = pendingLeaves
      .filter(matchesPolicy)
      .reduce((sum, item) => sum + (item.daysCount || 1), 0);

    const annualEntitlement = policy.annualDays || 0;
    const remainingDays = Math.max(0, annualEntitlement - usedDays);

    return {
      policyId: policy.id,
      policyCode: policy.code,
      policyName: policy.name,
      category: policy.category,
      color: policy.color,
      annualEntitlement,
      accrualMethod: policy.accrualMethod,
      accrualRatePerMonth: policy.accrualRatePerMonth,
      usedDays,
      pendingDays,
      remainingDays,
      allowCarryForward: policy.allowCarryForward,
      maxCarryForwardDays: policy.maxCarryForwardDays,
      minAdvanceNoticeDays: policy.minAdvanceNoticeDays,
      maxConsecutiveDays: policy.maxConsecutiveDays,
      requiresSubstituteTeacher: policy.requiresSubstituteTeacher,
      requiresDocumentProof: policy.requiresDocumentProof,
      documentProofNotice: policy.documentProofNotice,
      minServiceMonths: policy.minServiceMonths,
      genderEligibility: policy.genderEligibility,
      description: policy.description,
      isActive: policy.isActive
    };
  });
};

/**
 * Finds a single application by ID
 */
export const getLeaveById = (id: string): LeaveApplication | undefined => {
  const all = getLeaveApplications();
  return all.find(l => l.id === id);
};

/**
 * Calculates teacher's leave balance quotas and utilization, dynamically honoring defined leave policies
 */
export interface LeaveQuota {
  casual: { total: number; used: number; remaining: number };
  sick: { total: number; used: number; remaining: number };
  duty: { total: number; used: number; remaining: number };
  emergency: { total: number; used: number; remaining: number };
  balances?: DynamicTeacherLeaveBalance[];
  policies?: LeavePolicy[];
}

export const getTeacherLeaveQuota = (applicantId: string): LeaveQuota => {
  const policies = getLeavePolicies();
  const balances = getTeacherDynamicLeaveBalances(applicantId);

  // Helper to find annual quota defined by policy or fallback
  const getPolicyAnnualDays = (keyword: string, fallback: number) => {
    const found = policies.find(p => p.name.toLowerCase().includes(keyword.toLowerCase()));
    return found ? found.annualDays : fallback;
  };

  const teacherLeaves = getTeacherLeaves(applicantId);
  const approvedLeaves = teacherLeaves.filter(l => l.status === 'Approved');

  const countForType = (typeName: string) => {
    return approvedLeaves
      .filter(l => l.type.toLowerCase().includes(typeName.toLowerCase()))
      .reduce((sum, item) => sum + (item.daysCount || 1), 0);
  };

  const casualUsed = countForType('casual');
  const sickUsed = countForType('sick');
  const dutyUsed = countForType('duty');
  const emergencyUsed = countForType('emergency');

  const CASUAL_MAX = getPolicyAnnualDays('casual', 14);
  const SICK_MAX = getPolicyAnnualDays('sick', 10);
  const DUTY_MAX = getPolicyAnnualDays('duty', 7);
  const EMERGENCY_MAX = getPolicyAnnualDays('emergency', 5);

  return {
    casual: {
      total: CASUAL_MAX,
      used: casualUsed,
      remaining: Math.max(0, CASUAL_MAX - casualUsed)
    },
    sick: {
      total: SICK_MAX,
      used: sickUsed,
      remaining: Math.max(0, SICK_MAX - sickUsed)
    },
    duty: {
      total: DUTY_MAX,
      used: dutyUsed,
      remaining: Math.max(0, DUTY_MAX - dutyUsed)
    },
    emergency: {
      total: EMERGENCY_MAX,
      used: emergencyUsed,
      remaining: Math.max(0, EMERGENCY_MAX - emergencyUsed)
    },
    balances,
    policies
  };
};

/**
 * Submits a new leave request from Teacher Portal
 */
export const submitLeaveApplication = (payload: {
  applicantName: string;
  applicantId: string;
  applicantDesignation?: string;
  applicantDepartment?: string;
  applicantPhone?: string;
  applicantAvatar?: string;
  role?: 'Teacher' | 'Staff';
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  backupTeacher?: string;
  emergencyContact?: string;
}): { success: boolean; leave: LeaveApplication; message: string } => {
  const current = getLeaveApplications();
  const nextNumber = 100 + current.length + 1;
  const newId = `LV-2026-${nextNumber}`;
  const days = calculateDaysCount(payload.startDate, payload.endDate);
  const now = new Date().toISOString();

  const newRecord: LeaveApplication = {
    id: newId,
    applicantName: payload.applicantName,
    applicantId: payload.applicantId,
    applicantDesignation: payload.applicantDesignation || 'Assistant Teacher',
    applicantDepartment: payload.applicantDepartment || 'Faculty Department',
    applicantPhone: payload.applicantPhone || '01700-000000',
    applicantAvatar: payload.applicantAvatar,
    role: payload.role || 'Teacher',
    type: payload.type,
    startDate: payload.startDate,
    endDate: payload.endDate,
    daysCount: days,
    reason: payload.reason,
    backupTeacher: payload.backupTeacher || 'Self-arranged / To be nominated',
    emergencyContact: payload.emergencyContact || payload.applicantPhone || 'Not provided',
    appliedOn: now,
    status: 'Pending',
    statusTimeline: [
      {
        status: 'Pending',
        timestamp: now,
        actor: `${payload.applicantName} (Teacher)`,
        comment: `Applied for ${days} day(s) of ${payload.type} leave.`
      }
    ]
  };

  const updated = [newRecord, ...current];
  saveLeaveApplications(updated);

  return {
    success: true,
    leave: newRecord,
    message: `Leave application ${newId} submitted successfully. It is now awaiting School Admin approval.`
  };
};

/**
 * Notification Management Functions for Teacher Portal
 */
export const getTeacherLeaveNotifications = (teacherId?: string): TeacherLeaveNotification[] => {
  try {
    const raw = localStorage.getItem(TEACHER_LEAVE_NOTIFICATIONS_KEY);
    let items: TeacherLeaveNotification[] = [];
    if (!raw) {
      items = SEED_TEACHER_NOTIFICATIONS;
      localStorage.setItem(TEACHER_LEAVE_NOTIFICATIONS_KEY, JSON.stringify(items));
    } else {
      items = JSON.parse(raw);
    }
    if (teacherId) {
      return items.filter(n => n.applicantId === teacherId);
    }
    return items;
  } catch (err) {
    console.error('Error fetching teacher leave notifications:', err);
    return [];
  }
};

export const saveTeacherLeaveNotifications = (notifications: TeacherLeaveNotification[]) => {
  try {
    localStorage.setItem(TEACHER_LEAVE_NOTIFICATIONS_KEY, JSON.stringify(notifications));
    window.dispatchEvent(
      new CustomEvent(TEACHER_LEAVE_NOTIFICATION_EVENT, { detail: { count: notifications.length } })
    );
  } catch (err) {
    console.error('Error saving teacher notifications:', err);
  }
};

export const createTeacherLeaveNotification = (
  data: Omit<TeacherLeaveNotification, 'id' | 'createdAt' | 'read'>
): TeacherLeaveNotification => {
  const current = getTeacherLeaveNotifications();
  const nextId = `TLN-2026-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 90 + 10)}`;
  const newNotification: TeacherLeaveNotification = {
    ...data,
    id: nextId,
    createdAt: new Date().toISOString(),
    read: false
  };
  const updated = [newNotification, ...current];
  saveTeacherLeaveNotifications(updated);
  return newNotification;
};

export const markTeacherLeaveNotificationAsRead = (id: string): void => {
  const current = getTeacherLeaveNotifications();
  const updated = current.map(item => (item.id === id ? { ...item, read: true } : item));
  saveTeacherLeaveNotifications(updated);
};

export const markAllTeacherLeaveNotificationsAsRead = (teacherId?: string): void => {
  const current = getTeacherLeaveNotifications();
  const updated = current.map(item => {
    if (!teacherId || item.applicantId === teacherId) {
      return { ...item, read: true };
    }
    return item;
  });
  saveTeacherLeaveNotifications(updated);
};

export const deleteTeacherLeaveNotification = (id: string): void => {
  const current = getTeacherLeaveNotifications();
  const updated = current.filter(item => item.id !== id);
  saveTeacherLeaveNotifications(updated);
};

export const getUnreadTeacherLeaveCount = (teacherId?: string): number => {
  const list = getTeacherLeaveNotifications(teacherId);
  return list.filter(n => !n.read).length;
};

export const subscribeToTeacherLeaveNotifications = (callback: () => void): (() => void) => {
  const handler = () => callback();
  const storageHandler = (e: StorageEvent) => {
    if (e.key === TEACHER_LEAVE_NOTIFICATIONS_KEY) {
      callback();
    }
  };
  window.addEventListener(TEACHER_LEAVE_NOTIFICATION_EVENT, handler);
  window.addEventListener('storage', storageHandler);
  return () => {
    window.removeEventListener(TEACHER_LEAVE_NOTIFICATION_EVENT, handler);
    window.removeEventListener('storage', storageHandler);
  };
};

/**
 * Reviews a leave application (School Admin: Approve or Reject with custom comment)
 */
export const reviewLeaveApplication = (
  id: string,
  decision: 'Approved' | 'Rejected',
  customComment: string,
  reviewerName: string = 'Dr. M. Rahman (School Admin / Principal)'
): { success: boolean; leave?: LeaveApplication; message: string } => {
  const current = getLeaveApplications();
  const index = current.findIndex(l => l.id === id);

  if (index === -1) {
    return { success: false, message: `Application ${id} not found.` };
  }

  const existing = current[index];
  const now = new Date().toISOString();
  const cleanComment = customComment.trim() || (decision === 'Approved' ? 'Leave sanctioned as per institutional policies.' : 'Declined per administrative review.');

  const updatedTimeline = [
    ...(existing.statusTimeline || []),
    {
      status: decision,
      timestamp: now,
      actor: reviewerName,
      comment: cleanComment
    }
  ];

  const updatedLeave: LeaveApplication = {
    ...existing,
    status: decision,
    adminComment: cleanComment,
    reviewedBy: reviewerName,
    reviewedAt: now,
    statusTimeline: updatedTimeline
  };

  current[index] = updatedLeave;
  saveLeaveApplications(current);

  // Automatically dispatch notification alert to the teacher if status transitioned
  if (existing.status === 'Pending' && (decision === 'Approved' || decision === 'Rejected')) {
    createTeacherLeaveNotification({
      leaveId: existing.id,
      applicantId: existing.applicantId,
      applicantName: existing.applicantName,
      applicantAvatar: existing.applicantAvatar,
      previousStatus: 'Pending',
      newStatus: decision,
      leaveType: existing.type,
      startDate: existing.startDate,
      endDate: existing.endDate,
      daysCount: existing.daysCount,
      reason: existing.reason,
      adminComment: cleanComment,
      reviewedBy: reviewerName,
      reviewedAt: now
    });
  }

  return {
    success: true,
    leave: updatedLeave,
    message: `Application ${id} has been ${decision.toLowerCase()} successfully with your administrative comment.`
  };
};

/**
 * Batch approval or rejection
 */
export const batchReviewLeaves = (
  ids: string[],
  decision: 'Approved' | 'Rejected',
  commonComment: string,
  reviewerName: string = 'School Admin'
): { success: boolean; count: number; message: string } => {
  const current = getLeaveApplications();
  const now = new Date().toISOString();
  let updatedCount = 0;
  const reviewedApplications: LeaveApplication[] = [];

  const updated = current.map(item => {
    if (ids.includes(item.id) && item.status === 'Pending') {
      updatedCount++;
      const reviewed = {
        ...item,
        status: decision,
        adminComment: commonComment,
        reviewedBy: reviewerName,
        reviewedAt: now,
        statusTimeline: [
          ...(item.statusTimeline || []),
          {
            status: decision,
            timestamp: now,
            actor: reviewerName,
            comment: commonComment
          }
        ]
      };
      reviewedApplications.push(reviewed);
      return reviewed;
    }
    return item;
  });

  saveLeaveApplications(updated);

  // Create notifications for each reviewed application
  reviewedApplications.forEach(item => {
    createTeacherLeaveNotification({
      leaveId: item.id,
      applicantId: item.applicantId,
      applicantName: item.applicantName,
      applicantAvatar: item.applicantAvatar,
      previousStatus: 'Pending',
      newStatus: decision,
      leaveType: item.type,
      startDate: item.startDate,
      endDate: item.endDate,
      daysCount: item.daysCount,
      reason: item.reason,
      adminComment: commonComment,
      reviewedBy: reviewerName,
      reviewedAt: now
    });
  });

  return {
    success: true,
    count: updatedCount,
    message: `${updatedCount} leave application(s) have been ${decision.toLowerCase()}.`
  };
};

/**
 * Helper to simulate admin decision on teacher's leave (for quick testing in UI)
 */
export const simulateTeacherLeaveStatusChange = (
  teacherId: string = 'EMP-001',
  targetDecision: 'Approved' | 'Rejected' = 'Approved'
): { success: boolean; notification?: TeacherLeaveNotification; message: string } => {
  const leaves = getLeaveApplications();
  let pendingLeave = leaves.find(l => l.applicantId === teacherId && l.status === 'Pending');

  if (!pendingLeave) {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const submitResult = submitLeaveApplication({
      applicantName: teacherId === 'EMP-001' ? 'Abdul Jabbar' : 'Salma Khatun',
      applicantId: teacherId,
      applicantDesignation: 'Senior Faculty',
      type: targetDecision === 'Approved' ? 'Casual' : 'Emergency',
      startDate: today,
      endDate: tomorrow,
      reason: 'Urgent institutional leave application created for verifying status notification bell.',
      backupTeacher: 'Department Substitute Faculty'
    });
    pendingLeave = submitResult.leave;
  }

  const comment = targetDecision === 'Approved'
    ? 'Official approval granted by School Administration. Lesson substitution has been verified.'
    : 'Declined due to concurrent departmental assessment duties and lack of substitute coverage.';

  const reviewResult = reviewLeaveApplication(
    pendingLeave.id,
    targetDecision,
    comment,
    'Dr. M. Rahman (School Admin / Principal)'
  );

  const notifications = getTeacherLeaveNotifications(teacherId);
  const latest = notifications[0];

  return {
    success: true,
    notification: latest,
    message: `Leave ${pendingLeave.id} status changed to ${targetDecision}. Notification alert generated!`
  };
};

/**
 * Allows a teacher to withdraw an un-reviewed pending application
 */
export const withdrawLeaveApplication = (id: string): { success: boolean; message: string } => {
  const current = getLeaveApplications();
  const index = current.findIndex(l => l.id === id);

  if (index === -1) {
    return { success: false, message: 'Application not found.' };
  }

  if (current[index].status !== 'Pending') {
    return { success: false, message: 'Only pending applications can be withdrawn.' };
  }

  const updated = current.filter(l => l.id !== id);
  saveLeaveApplications(updated);

  return {
    success: true,
    message: `Leave application ${id} has been withdrawn.`
  };
};

/**
 * Resets storage back to clean seed data
 */
export const resetLeaveData = () => {
  localStorage.setItem(LEAVE_STORAGE_KEY, JSON.stringify(SEED_LEAVE_APPLICATIONS));
  window.dispatchEvent(new CustomEvent(LEAVE_WORKFLOW_EVENT, { detail: { count: SEED_LEAVE_APPLICATIONS.length } }));
};

/**
 * React hook or helper to subscribe to leave updates across tabs/components
 */
export const subscribeToLeaveUpdates = (callback: () => void): (() => void) => {
  const handler = () => {
    callback();
  };

  const storageHandler = (e: StorageEvent) => {
    if (e.key === LEAVE_STORAGE_KEY) {
      callback();
    }
  };

  window.addEventListener(LEAVE_WORKFLOW_EVENT, handler);
  window.addEventListener('storage', storageHandler);

  return () => {
    window.removeEventListener(LEAVE_WORKFLOW_EVENT, handler);
    window.removeEventListener('storage', storageHandler);
  };
};

export interface LeaveQuickStatusData {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  pendingDays: number;
  approvedDays: number;
  rejectedDays: number;
  totalDays: number;
  approvalRate: number;
  pendingRate: number;
  rejectionRate: number;
  pendingUrgentCount: number;
}

/**
 * Calculates live quick status metrics for School Admin dashboard
 */
export const getLeaveQuickStatusCounts = (
  appsList?: LeaveApplication[],
  horizon: 'all' | 'year' | 'month' = 'all'
): LeaveQuickStatusData => {
  const source = appsList || getLeaveApplications();
  const now = new Date();
  const currentYearStr = now.getFullYear().toString();
  const currentMonth = now.getMonth(); // 0-indexed

  const filtered = source.filter(app => {
    if (horizon === 'all') return true;
    const dateStr = app.startDate || app.appliedOn;
    if (!dateStr) return true;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return true;
    if (horizon === 'year') {
      return d.getFullYear().toString() === currentYearStr;
    }
    if (horizon === 'month') {
      return d.getFullYear().toString() === currentYearStr && d.getMonth() === currentMonth;
    }
    return true;
  });

  const total = filtered.length;
  let pending = 0;
  let approved = 0;
  let rejected = 0;
  let pendingDays = 0;
  let approvedDays = 0;
  let rejectedDays = 0;
  let totalDays = 0;
  let pendingUrgentCount = 0;

  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  filtered.forEach(app => {
    const days = app.daysCount || 1;
    totalDays += days;

    if (app.status === 'Pending') {
      pending++;
      pendingDays += days;
      if (app.startDate) {
        const start = new Date(app.startDate);
        if (!isNaN(start.getTime()) && start <= threeDaysFromNow) {
          pendingUrgentCount++;
        }
      }
    } else if (app.status === 'Approved') {
      approved++;
      approvedDays += days;
    } else if (app.status === 'Rejected') {
      rejected++;
      rejectedDays += days;
    }
  });

  const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;
  const pendingRate = total > 0 ? Math.round((pending / total) * 100) : 0;
  const rejectionRate = total > 0 ? Math.round((rejected / total) * 100) : 0;

  return {
    total,
    pending,
    approved,
    rejected,
    pendingDays,
    approvedDays,
    rejectedDays,
    totalDays,
    approvalRate,
    pendingRate,
    rejectionRate,
    pendingUrgentCount
  };
};
