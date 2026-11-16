
import React from 'react';

export type LanguageCode = 'en' | 'bn' | 'ar' | 'hi' | 'ur';

export enum UserRole {
  GUEST = 'GUEST',
  SUPER_ADMIN = 'SUPER_ADMIN',
  SCHOOL_ADMIN = 'SCHOOL_ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  PARENT = 'PARENT'
}

export interface Tenant {
  id: string;
  name: string;
  type: 'School' | 'College' | 'Madrasa' | 'University';
  subdomain: string;
  customDomain?: string;
  logoUrl?: string;
  status: 'Active' | 'Inactive' | 'Pending';
  studentsCount: number;
  maxStudents: number;
  plan: 'Basic' | 'Standard' | 'Premium';
  revenue: number;
  enabledModules?: string[];
  eiin?: string;
  code?: string;
  contactPhone?: string;
  contactEmail?: string;
  address?: string;
  establishedYear?: string;
  principalName?: string;
  primaryColor?: string;
  secondaryColor?: string;
  sidebarTheme?: 'dark' | 'brand-tinted' | 'midnight';
}

export interface CustomDomain {
  id: string;
  tenantId: string;
  tenantName: string;
  domain: string;
  status: 'Pending' | 'Verified' | 'Failed' | 'Propagating';
  dnsRecordType: 'CNAME' | 'A';
  dnsTarget: string;
  verificationToken?: string;
  lastChecked?: string;
  addedAt: string;
}

export interface Student {
  id: string;
  name: string;
  rollNo: string;
  class: string;
  section: string;
  guardian: string;
  phone?: string;
  bloodGroup?: string;
  imageUrl?: string;
  guardianImageUrl?: string;
  status: 'Active' | 'Suspended';
  feesDue: number;
  gender?: 'Male' | 'Female' | 'Other' | string;
  email?: string;
  dob?: string;
  address?: string;
  group?: string;
  tenantId?: string;
  tenantSubdomain?: string;
  tenantName?: string;
}

export type StudentSchemaField = 
  | 'id' 
  | 'name' 
  | 'rollNo' 
  | 'class' 
  | 'section' 
  | 'guardian' 
  | 'phone' 
  | 'bloodGroup' 
  | 'gender' 
  | 'status' 
  | 'feesDue' 
  | 'dob' 
  | 'email' 
  | 'address'
  | 'group';

export interface StudentFieldDefinition {
  key: StudentSchemaField;
  label: string;
  required: boolean;
  type: 'string' | 'number' | 'enum' | 'phone' | 'email' | 'date';
  description: string;
  example: string;
  enumValues?: string[];
  aliases: string[];
}

export interface CsvValidationIssue {
  field: StudentSchemaField;
  severity: 'error' | 'warning';
  message: string;
}

export interface ValidatedStudentRow {
  rowIndex: number;
  rawRow: Record<string, string>;
  mappedStudent: Partial<Student>;
  issues: CsvValidationIssue[];
  isValid: boolean;
  hasWarnings: boolean;
  isDuplicateInFile: boolean;
  isDuplicateInDb: boolean;
  dbConflictId?: string;
}

export interface CsvBulkUploadResult {
  totalRows: number;
  addedCount: number;
  updatedCount: number;
  skippedCount: number;
  importedStudents: Student[];
}

export interface Staff {
  id: string;
  name: string;
  designation: string;
  phone: string;
  joinDate: string;
  salary: number;
  role: 'Teacher' | 'Accountant' | 'Staff';
  bloodGroup?: string;
  address?: string;
  imageUrl?: string;
  email?: string;
  tenantId?: string;
  tenantSubdomain?: string;
  tenantName?: string;
}

export interface SchoolClass {
  id: string;
  name: string;
  section: string;
  classTeacher: string;
  studentsCount: number;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  type: 'Theory' | 'Practical' | 'Both';
  classId: string;
  teacherId?: string;
}

export interface Exam {
  id: string;
  name: string;
  startDate: string;
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Published';
}

export interface GradingRule {
  id: string;
  grade: string;
  min: number;
  max: number;
  point: number;
}

export interface ExamResult {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  subjectId: string;
  marks: {
    theory?: number;
    mcq?: number;
    practical?: number;
    total: number;
  };
  grade: string;
}

export interface FeeInvoice {
  id: string;
  studentName: string;
  amount: number;
  dueDate: string;
  status: 'Paid' | 'Unpaid' | 'Overdue';
  type: 'Tuition' | 'Exam' | 'Transport';
}

export interface Expense {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  status: 'Paid' | 'Pending';
  paymentMethod: 'Cash' | 'Bank' | 'Mobile' | 'Check';
}

export interface CertificateTemplate {
  id: string;
  name: string;
  type: 'Character' | 'Transfer' | 'Merit' | 'Completion';
  previewUrl: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billingCycle: 'Monthly' | 'Yearly';
  features: string[];
  maxStudentsLimit: number;
  allowedModules: string[];
  activeTenants: number;
}

export interface AttendanceRecord {
  id: string;
  personName: string;
  personId: string;
  type: 'Student' | 'Staff';
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Leave';
  checkInTime?: string;
}

export interface SalaryPayment {
  id: string;
  staffName: string;
  amount: number;
  month: string;
  status: 'Paid' | 'Pending';
  paymentDate?: string;
}

export interface CommunicationLog {
  id: string;
  recipient: string;
  message: string;
  type: 'SMS' | 'Email';
  sentAt: string;
  status: 'Delivered' | 'Failed';
}

export interface ActivityLog {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
  ipAddress: string;
  severity: 'Info' | 'Warning' | 'Critical';
}

export interface SystemModule {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'Beta' | 'Disabled';
  requiredPlan: 'Basic' | 'Standard' | 'Premium';
}

export interface Role {
  id: string;
  name: string;
  usersCount: number;
  permissions: string[];
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  publisher?: string;
  edition?: string;
  shelfLocation?: string;
  totalCopies: number;
  availableCopies: number;
  condition?: 'New' | 'Good' | 'Fair' | 'Worn' | 'Damaged';
  price?: number;
  callNumber?: string;
  coverUrl?: string;
  status: 'Available' | 'Issued' | 'Low Stock' | 'Out of Stock' | 'Lost';
}

export interface BookBorrowRecord {
  id: string;
  bookId: string;
  bookTitle: string;
  bookIsbn: string;
  studentId: string;
  studentName: string;
  studentRoll: string;
  studentClass: string;
  studentSection: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'Issued' | 'Returned' | 'Overdue' | 'Lost';
  issuedBy: string;
  conditionAtIssue: 'New' | 'Good' | 'Fair';
  conditionAtReturn?: 'Good' | 'Fair' | 'Damaged' | 'Lost';
  daysOverdue: number;
  calculatedFine: number;
  finePaid: number;
  fineStatus: 'None' | 'Pending' | 'Paid' | 'Waived';
  fineWaivedReason?: string;
  notes?: string;
}

export interface LibraryRuleConfig {
  dailyFineAmount: number;
  maxBorrowDays: number;
  maxBooksPerStudent: number;
  gracePeriodDays: number;
  lostBookMultiplier: number;
  damageFineFlat: number;
}

export interface TransportRoute {
  id: string;
  routeName: string;
  vehicleNumber: string;
  driverName: string;
  fare: number;
  capacity: number;
  studentsAssigned: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  lastUpdated: string;
}

export interface ClassRoutine {
  id: string;
  classId: string;
  day: 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday';
  period: string;
  subjectName: string;
  teacherName: string;
  roomNo: string;
}

export interface SchoolEvent {
  id: string;
  title: string;
  date: string;
  type: 'Academic' | 'Holiday' | 'Sports' | 'Cultural' | 'Exam';
  description: string;
}

export interface LeavePolicy {
  id: string;
  name: string;
  code: string;
  category: 'Paid' | 'Half-Pay' | 'Unpaid' | 'Special';
  color: string;
  description: string;
  annualDays: number;
  accrualMethod: 'Annual Upfront' | 'Monthly Accrual' | 'Quarterly Accrual' | 'Tenure-Based';
  accrualRatePerMonth: number;
  allowCarryForward: boolean;
  maxCarryForwardDays: number;
  encashable: boolean;
  minServiceMonths: number;
  applicableRoles: string[];
  genderEligibility: 'All' | 'Female Only' | 'Male Only';
  minAdvanceNoticeDays: number;
  maxConsecutiveDays: number;
  requiresSubstituteTeacher: boolean;
  requiresDocumentProof: boolean;
  documentProofNotice?: string;
  isActive: boolean;
  updatedAt?: string;
  updatedBy?: string;
}

export interface DynamicTeacherLeaveBalance {
  policyId: string;
  policyCode: string;
  policyName: string;
  category: string;
  color: string;
  annualEntitlement: number;
  accrualMethod: string;
  accrualRatePerMonth: number;
  usedDays: number;
  pendingDays: number;
  remainingDays: number;
  allowCarryForward: boolean;
  maxCarryForwardDays: number;
  minAdvanceNoticeDays: number;
  maxConsecutiveDays: number;
  requiresSubstituteTeacher: boolean;
  requiresDocumentProof: boolean;
  documentProofNotice?: string;
  minServiceMonths: number;
  genderEligibility: 'All' | 'Female Only' | 'Male Only';
  description: string;
  isActive: boolean;
}

export interface LeaveApplication {
  id: string;
  applicantName: string;
  applicantId: string;
  role: 'Teacher' | 'Staff' | 'Student';
  type: 'Sick' | 'Casual' | 'Unpaid' | 'Maternity' | 'Emergency' | 'Earned' | 'Duty' | string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  applicantDesignation?: string;
  applicantDepartment?: string;
  applicantPhone?: string;
  applicantAvatar?: string;
  daysCount?: number;
  appliedOn?: string;
  adminComment?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  backupTeacher?: string;
  emergencyContact?: string;
  statusTimeline?: Array<{
    status: 'Pending' | 'Approved' | 'Rejected' | 'Withdrawn';
    timestamp: string;
    actor: string;
    comment?: string;
  }>;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface ChatThread {
  id: string;
  user: string;
  role: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'me' | 'other';
  text: string;
  time: string;
}

export interface HostelRoom {
  id: string;
  roomNumber: string;
  type: 'Boys' | 'Girls' | 'Staff';
  capacity: number;
  occupied: number;
  costPerMonth: number;
  warden: string;
}

export interface Alumni {
  id: string;
  name: string;
  batch: string;
  profession: string;
  company?: string;
  email: string;
  phone: string;
  status: 'Approved' | 'Pending';
}

export interface Semester {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Upcoming' | 'Completed';
  totalCredits: number;
}

export interface MadrasaBoardResult {
  id: string;
  studentName: string;
  registrationNo: string;
  board: 'Befaq' | 'Al-Haiatul Ulya';
  marhala: 'Takmil' | 'Fazilat' | 'Sanwiyya';
  grade: string;
  passingYear: string;
}

export interface SupportTicket {
  id: string;
  tenantId: string;
  tenantName: string;
  subject: string;
  message: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  priority: 'Low' | 'Medium' | 'High';
  createdAt: string;
}

export interface NavItem {
  label: string;
  path?: string;
  icon: React.ElementType;
  children?: NavItem[];
  moduleKey?: string;
  allowedTypes?: Array<'School' | 'College' | 'Madrasa'>;
}

export type DocumentCategory = 
  | 'academic'
  | 'medical'
  | 'legal'
  | 'administrative'
  | 'student-records' 
  | 'fee-receipts' 
  | 'academic-certificates';

export type DocumentSecurityLevel = 'Standard' | 'Confidential' | 'Restricted';

export interface SchoolDocument {
  id: string;
  title: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  category: DocumentCategory;
  folder: string; // e.g. 'documents/academic', 'documents/medical', 'documents/legal', etc.
  studentId?: string;
  studentName?: string;
  studentRoll?: string;
  studentClass?: string;
  amount?: number;
  transactionId?: string;
  certificateType?: string;
  issueDate?: string;
  expiryDate: string; // Mandatory metadata field: ISO date (e.g. '2026-12-31') or 'Permanent'
  issuingAuthority: string; // Mandatory metadata field: e.g. 'Ministry of Education', 'Civil Surgeon Office', 'Notary Public'
  documentCategory?: string; // Optional secondary or custom classification label
  uploadedBy: {
    id: string;
    name: string;
    role: string;
  };
  uploadedAt: string;
  securityLevel: DocumentSecurityLevel;
  fileHash: string;
  verificationStatus: 'Verified' | 'Pending Audit' | 'Tamper Detected';
  contentUrl?: string;
  tags: string[];
  notes?: string;
  accessRoles?: UserRole[];
}

export interface DocumentFolder {
  id: string;
  path: string;
  name: string;
  category?: DocumentCategory;
  parentPath: string | null;
  createdAt: string;
  description?: string;
}
