
import { Tenant, Student, FeeInvoice, Staff, SchoolClass, Exam, CertificateTemplate, SubscriptionPlan, AttendanceRecord, SalaryPayment, CommunicationLog, ActivityLog, Subject, Expense, ExamResult, SystemModule, Role, Book, TransportRoute, InventoryItem, ClassRoutine, SchoolEvent, LeaveApplication, AppNotification, ChatThread, ChatMessage, HostelRoom, Alumni, GradingRule, CustomDomain, SupportTicket } from './types';

export const MOCK_TENANTS: Tenant[] = [
  { id: '1', name: 'Dhaka City College', type: 'College', subdomain: 'dcc', logoUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=200&fit=crop', status: 'Active', studentsCount: 1250, maxStudents: 5000, plan: 'Premium', revenue: 45000, enabledModules: ['academic', 'finance', 'hr', 'exams', 'operations', 'communication', 'front_desk'], eiin: '108162', code: 'DCC-101', contactPhone: '+880 1712-345678', contactEmail: 'info@dcc.edu.bd', address: 'Road #2, Dhanmondi, Dhaka - 1205', establishedYear: '1957', principalName: 'Prof. Rafiqul Islam' },
  { id: '2', name: 'Green Leaf International', type: 'School', subdomain: 'greenleaf', logoUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=200&h=200&fit=crop', customDomain: 'greenleaf.edu.bd', status: 'Active', studentsCount: 850, maxStudents: 2000, plan: 'Standard', revenue: 22000, enabledModules: ['academic', 'finance', 'hr', 'exams', 'communication'], eiin: '134209', code: 'GLI-202', contactPhone: '+880 1722-998877', contactEmail: 'contact@greenleaf.edu.bd', address: 'Sector 7, Uttara Model Town, Dhaka', establishedYear: '2008', principalName: 'Farhan Chowdhury' },
  { id: '3', name: 'Darul Uloom Madrasa', type: 'Madrasa', subdomain: 'darululoom', logoUrl: 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=200&h=200&fit=crop', status: 'Active', studentsCount: 400, maxStudents: 500, plan: 'Basic', revenue: 8000, enabledModules: ['academic', 'exams', 'communication'], eiin: '121045', code: 'DUM-303', contactPhone: '+880 1733-445566', contactEmail: 'office@darululoom.edu.bd', address: 'Plot 14, Mirpur-1, Dhaka - 1216', establishedYear: '1985', principalName: 'Mawlana Mufti Abdul Haq' },
  { id: '4', name: 'Sunshine High', type: 'School', subdomain: 'sunshine', logoUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=200&h=200&fit=crop', status: 'Active', studentsCount: 350, maxStudents: 500, plan: 'Basic', revenue: 12000, enabledModules: ['academic', 'exams'], eiin: '115678', code: 'SSH-404', contactPhone: '+880 1755-667788', contactEmail: 'sunshine@school.edu.bd', address: 'Main Road, Narayanganj Sadar', establishedYear: '1998', principalName: 'Dr. David Barua' },
];

export const MOCK_DOMAINS: CustomDomain[] = [
  { id: 'DOM-001', tenantId: '2', tenantName: 'Green Leaf International', domain: 'greenleaf.edu.bd', status: 'Verified', dnsRecordType: 'CNAME', dnsTarget: 'proxy.amarsmartschool.com', verificationToken: 'verify_a1b2c3d4', addedAt: '2024-01-15' },
  { id: 'DOM-002', tenantId: '1', tenantName: 'Dhaka City College', domain: 'www.dcc.edu.bd', status: 'Pending', dnsRecordType: 'CNAME', dnsTarget: 'proxy.amarsmartschool.com', verificationToken: 'verify_x9y8z7', addedAt: '2024-05-20' },
  { id: 'DOM-003', tenantId: '5', tenantName: 'Future Scholars', domain: 'futurescholars.com', status: 'Failed', dnsRecordType: 'A', dnsTarget: '128.199.10.1', verificationToken: 'verify_f5g6h7', addedAt: '2024-05-18' },
];

export const MOCK_STUDENTS: Student[] = [
  // Dhaka City College Students
  { id: 'ST-2024-001', name: 'Rahim Ahmed', rollNo: '101', class: 'Class 10', section: 'A', guardian: 'Karim Ahmed', phone: '01711111111', bloodGroup: 'A+', imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&h=200&fit=crop', guardianImageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop', status: 'Active', feesDue: 0, tenantId: '1', tenantSubdomain: 'dcc', tenantName: 'Dhaka City College' },
  { id: 'ST-2024-002', name: 'Fatima Begum', rollNo: '102', class: 'Class 10', section: 'A', guardian: 'Abdul Malik', phone: '01722222222', bloodGroup: 'B+', imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop', guardianImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop', status: 'Active', feesDue: 1500, tenantId: '1', tenantSubdomain: 'dcc', tenantName: 'Dhaka City College' },
  { id: 'ST-2024-003', name: 'Karim Ullah', rollNo: '103', class: 'Class 10', section: 'A', guardian: 'Rafiq Ullah', phone: '01711223344', bloodGroup: 'O+', imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop', status: 'Active', feesDue: 2400, tenantId: '1', tenantSubdomain: 'dcc', tenantName: 'Dhaka City College' },

  // Green Leaf International Students
  { id: 'ST-GL-001', name: 'Nusrat Jahan', rollNo: '101', class: 'Class 9', section: 'B', guardian: 'Kamal Hossain', phone: '01922334455', bloodGroup: 'AB+', imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop', guardianImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop', status: 'Active', feesDue: 0, tenantId: '2', tenantSubdomain: 'greenleaf', tenantName: 'Green Leaf International' },
  { id: 'ST-GL-002', name: 'Tariq Islam', rollNo: '102', class: 'Class 9', section: 'B', guardian: 'Aminul Islam', phone: '01811998877', bloodGroup: 'A-', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop', status: 'Active', feesDue: 800, tenantId: '2', tenantSubdomain: 'greenleaf', tenantName: 'Green Leaf International' },
  { id: 'ST-GL-003', name: 'Tahmid Khan', rollNo: '103', class: 'Class 8', section: 'A', guardian: 'Rezaul Khan', phone: '01799881122', bloodGroup: 'B+', imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&h=200&fit=crop', status: 'Active', feesDue: 0, tenantId: '2', tenantSubdomain: 'greenleaf', tenantName: 'Green Leaf International' },

  // Darul Uloom Madrasa Students
  { id: 'ST-DU-001', name: 'Hafiz Zubair Ahmed', rollNo: '101', class: 'Alim 1st Year', section: 'A', guardian: 'Mawlana Qasim', phone: '01733445566', bloodGroup: 'O+', imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop', guardianImageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop', status: 'Active', feesDue: 0, tenantId: '3', tenantSubdomain: 'darululoom', tenantName: 'Darul Uloom Madrasa' },
  { id: 'ST-DU-002', name: 'Abdullah Al Mahmud', rollNo: '102', class: 'Fazil 2nd Year', section: 'A', guardian: 'Mahmudur Rahman', phone: '01744556677', bloodGroup: 'A+', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop', status: 'Active', feesDue: 500, tenantId: '3', tenantSubdomain: 'darululoom', tenantName: 'Darul Uloom Madrasa' },

  // Al-Amin Islamia Madrasa Students (Dedicated Tenant Records)
  { id: 'ST-AA-001', name: 'হাফেজ যোবায়ের বিন কাদির', rollNo: '01', class: 'দাখিল ১০ম', section: 'ক', guardian: 'মাওলানা মোঃ আবদুল কাদির', phone: '01712-040674', bloodGroup: 'A+', imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&h=200&fit=crop', status: 'Active', feesDue: 0, tenantId: 'al-amin', tenantSubdomain: 'al-amin', tenantName: 'আল-আমিন ইসলামিয়া মাদ্রাসা' },
  { id: 'ST-AA-002', name: 'মুহাম্মদ উসমান গণি', rollNo: '02', class: 'হিফজুল কুরআন', section: 'হিফজ-১', guardian: 'মাওলানা শহীদুল ইসলাম', phone: '01722-334455', bloodGroup: 'O+', imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop', status: 'Active', feesDue: 500, tenantId: 'al-amin', tenantSubdomain: 'al-amin', tenantName: 'আল-আমিন ইসলামিয়া মাদ্রাসা' },
  { id: 'ST-AA-003', name: 'মারিয়া বিনতে রফিক', rollNo: '03', class: 'ইবতেদায়ি ৫ম', section: 'মহিলা শাখা', guardian: 'রফিকুল ইসলাম', phone: '01811-223344', bloodGroup: 'B+', imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop', status: 'Active', feesDue: 0, tenantId: 'al-amin', tenantSubdomain: 'al-amin', tenantName: 'আল-আমিন ইসলামিয়া মাদ্রাসা' },
  { id: 'ST-AA-004', name: 'আব্দুল্লাহ আল কাফী', rollNo: '04', class: 'আলিম ১ম বর্ষ', section: 'সাধারণ', guardian: 'মুফতি এনামুল হক', phone: '01755-667788', bloodGroup: 'AB+', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop', status: 'Active', feesDue: 1200, tenantId: 'al-amin', tenantSubdomain: 'al-amin', tenantName: 'আল-আমিন ইসলামিয়া মাদ্রাসা' },
  { id: 'ST-AA-005', name: 'মাহমুদা আক্তার', rollNo: '05', class: 'নূরানী শিশু শ্রেণি', section: 'ক', guardian: 'আবুল কালাম', phone: '01933-445566', bloodGroup: 'O-', imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop', status: 'Active', feesDue: 0, tenantId: 'al-amin', tenantSubdomain: 'al-amin', tenantName: 'আল-আমিন ইসলামিয়া মাদ্রাসা' },
  { id: 'ST-AA-006', name: 'আহমদ উল্লাহ', rollNo: '06', class: 'হিফজুল কুরআন', section: 'হিফজ-২', guardian: 'মাওলানা কামরুল হাসান', phone: '01677-889900', bloodGroup: 'B-', imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&h=200&fit=crop', status: 'Active', feesDue: 0, tenantId: 'al-amin', tenantSubdomain: 'al-amin', tenantName: 'আল-আমিন ইসলামিয়া মাদ্রাসা' },
  { id: 'ST-AA-007', name: 'হাসান আল বশীর', rollNo: '07', class: 'দাখিল ৯ম', section: 'ক', guardian: 'বশীর আহমেদ', phone: '01799-887766', bloodGroup: 'A-', imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop', status: 'Active', feesDue: 0, tenantId: 'al-amin', tenantSubdomain: 'al-amin', tenantName: 'আল-আমিন ইসলামিয়া মাদ্রাসা' },
  { id: 'ST-AA-008', name: 'সুমাইয়া বিনতে আনাস', rollNo: '08', class: 'দাখিল ১০ম', section: 'মহিলা শাখা', guardian: 'মুহাম্মদ আনাস', phone: '01855-664433', bloodGroup: 'O+', imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop', status: 'Active', feesDue: 450, tenantId: 'al-amin', tenantSubdomain: 'al-amin', tenantName: 'আল-আমিন ইসলামিয়া মাদ্রাসা' },
  { id: 'ST-AA-009', name: 'তরিকুল ইসলাম তাওহীদ', rollNo: '09', class: 'ইবতেদায়ি ১ম', section: 'ক', guardian: 'তৌহিদুল ইসলাম', phone: '01711-223344', bloodGroup: 'B+', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop', status: 'Active', feesDue: 0, tenantId: 'al-amin', tenantSubdomain: 'al-amin', tenantName: 'আল-আমিন ইসলামিয়া মাদ্রাসা' },
  { id: 'ST-AA-010', name: 'ফাতিমা তুয যোহরা', rollNo: '10', class: 'আলিম ১ম বর্ষ', section: 'মহিলা শাখা', guardian: 'মাওলানা মুজাম্মেল হক', phone: '01911-447722', bloodGroup: 'A+', imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop', status: 'Active', feesDue: 0, tenantId: 'al-amin', tenantSubdomain: 'al-amin', tenantName: 'আল-আমিন ইসলামিয়া মাদ্রাসা' },

  // Sonar Bangla Adarsha High School Students (Dedicated Tenant Records)
  { id: 'ST-SB-001', name: 'সাকিব হাসান', rollNo: '101', class: 'Class 10', section: 'A', guardian: 'মো: জহিরুল ইসলাম', phone: '01711-234567', bloodGroup: 'A+', imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&h=200&fit=crop', status: 'Active', feesDue: 0, tenantId: 'sonar-bangla', tenantSubdomain: 'sonar-bangla', tenantName: 'সোনার বাংলা আদর্শ উচ্চ বিদ্যালয়' },
  { id: 'ST-SB-002', name: 'আনিকা তাবাসসুম', rollNo: '102', class: 'Class 9', section: 'A', guardian: 'তারেক মাহমুদ', phone: '01722-345678', bloodGroup: 'O+', imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop', status: 'Active', feesDue: 1200, tenantId: 'sonar-bangla', tenantSubdomain: 'sonar-bangla', tenantName: 'সোনার বাংলা আদর্শ উচ্চ বিদ্যালয়' },
  { id: 'ST-SB-003', name: 'মাহিন চৌধুরী', rollNo: '103', class: 'Class 5', section: 'B', guardian: 'কবীর চৌধুরী', phone: '01733-456789', bloodGroup: 'B+', imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop', status: 'Active', feesDue: 0, tenantId: 'sonar-bangla', tenantSubdomain: 'sonar-bangla', tenantName: 'সোনার বাংলা আদর্শ উচ্চ বিদ্যালয়' },
  { id: 'ST-SB-004', name: 'নাফিসা রহমান', rollNo: '104', class: 'Class 3', section: 'A', guardian: 'মোখলেসুর রহমান', phone: '01744-567890', bloodGroup: 'AB+', imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop', status: 'Active', feesDue: 0, tenantId: 'sonar-bangla', tenantSubdomain: 'sonar-bangla', tenantName: 'সোনার বাংলা আদর্শ উচ্চ বিদ্যালয়' },
  { id: 'ST-SB-005', name: 'আদিয়ান রহমান', rollNo: '105', class: 'Play', section: 'A', guardian: 'লুৎফর রহমান', phone: '01755-678901', bloodGroup: 'O-', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop', status: 'Active', feesDue: 800, tenantId: 'sonar-bangla', tenantSubdomain: 'sonar-bangla', tenantName: 'সোনার বাংলা আদর্শ উচ্চ বিদ্যালয়' },
  { id: 'ST-SB-006', name: 'আরিয়ান কবির', rollNo: '106', class: 'Class 9', section: 'B', guardian: 'হুমায়ুন কবির', phone: '01766-789012', bloodGroup: 'A-', imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&h=200&fit=crop', status: 'Active', feesDue: 0, tenantId: 'sonar-bangla', tenantSubdomain: 'sonar-bangla', tenantName: 'সোনার বাংলা আদর্শ উচ্চ বিদ্যালয়' },
  { id: 'ST-SB-007', name: 'তানজিনা আক্তার', rollNo: '107', class: 'Class 10', section: 'B', guardian: 'আকতারুজ্জামান', phone: '01777-890123', bloodGroup: 'B-', imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop', status: 'Active', feesDue: 0, tenantId: 'sonar-bangla', tenantSubdomain: 'sonar-bangla', tenantName: 'সোনার বাংলা আদর্শ উচ্চ বিদ্যালয়' },

  // Sunshine High Students
  { id: 'ST-SH-001', name: 'Sadia Rahman', rollNo: '101', class: 'Class 8', section: 'A', guardian: 'Farid Rahman', phone: '01755667788', bloodGroup: 'B-', imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop', status: 'Active', feesDue: 0, tenantId: '4', tenantSubdomain: 'sunshine', tenantName: 'Sunshine High' },
  { id: 'ST-SH-002', name: 'John Doe', rollNo: '05', class: 'Class 8', section: 'B', guardian: 'Peter Doe', phone: '01733333333', bloodGroup: 'O+', status: 'Suspended', feesDue: 5000, tenantId: '4', tenantSubdomain: 'sunshine', tenantName: 'Sunshine High' },
];

export const MOCK_STAFF: Staff[] = [
  // Al-Amin Islamia Madrasa Staff
  { id: 'EMP-AA-001', name: 'মাওলানা মোঃ আবদুল কাদির', designation: 'মুহতামিম ও প্রধান শিক্ষক', phone: '+880 1712-040674', email: 'principal@alaminmadrasa.edu.bd', joinDate: '1998-01-01', salary: 45000, role: 'Administrator', bloodGroup: 'O+', address: 'মাধবপুর, হবিগঞ্জ', imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop', tenantId: 'al-amin', tenantSubdomain: 'al-amin', tenantName: 'আল-আমিন ইসলামিয়া মাদ্রাসা' },
  { id: 'EMP-AA-002', name: 'মাওলানা শহীদুল ইসলাম', designation: 'সহকারী প্রধান শিক্ষক ও মুহাদ্দিস', phone: '+880 1722-112233', email: 'shahidul@alaminmadrasa.edu.bd', joinDate: '2005-06-15', salary: 35000, role: 'Teacher', bloodGroup: 'A+', address: 'মাধবপুর, হবিগঞ্জ', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop', tenantId: 'al-amin', tenantSubdomain: 'al-amin', tenantName: 'আল-আমিন ইসলামিয়া মাদ্রাসা' },
  { id: 'EMP-AA-003', name: 'হাফেজ মাওলানা মোজাম্মেল হক', designation: 'হিফজ বিভাগীয় প্রধান (উস্তাদুল হুফফাজ)', phone: '+880 1733-445566', email: 'hifz@alaminmadrasa.edu.bd', joinDate: '2010-02-10', salary: 32000, role: 'Teacher', bloodGroup: 'B+', address: 'মাধবপুর, হবিগঞ্জ', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop', tenantId: 'al-amin', tenantSubdomain: 'al-amin', tenantName: 'আল-আমিন ইসলামিয়া মাদ্রাসা' },
  { id: 'EMP-AA-004', name: 'ক্বারী সাইদুল ইসলাম', designation: 'ক্বারী ও কিরাত শিক্ষক', phone: '+880 1744-778899', email: 'qari@alaminmadrasa.edu.bd', joinDate: '2015-08-01', salary: 28000, role: 'Teacher', bloodGroup: 'AB+', address: 'মাধবপুর, হবিগঞ্জ', imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop', tenantId: 'al-amin', tenantSubdomain: 'al-amin', tenantName: 'আল-আমিন ইসলামিয়া মাদ্রাসা' },
  { id: 'EMP-AA-005', name: 'মাও: মুফতি আব্দুল্লাহ', designation: 'হিসাবরক্ষক ও কোষাধ্যক্ষ', phone: '+880 1755-990011', email: 'accounts@alaminmadrasa.edu.bd', joinDate: '2012-03-20', salary: 26000, role: 'Accountant', bloodGroup: 'O+', address: 'মাধবপুর, হবিগঞ্জ', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop', tenantId: 'al-amin', tenantSubdomain: 'al-amin', tenantName: 'আল-আমিন ইসলামিয়া মাদ্রাসা' },

  // Sonar Bangla Adarsha High School Staff
  { id: 'EMP-SB-001', name: 'মো: আব্দুল করিম', designation: 'প্রধান শিক্ষক', phone: '+880 1711-234567', email: 'headmaster@sonarbangla.edu.bd', joinDate: '1985-03-01', salary: 52000, role: 'Administrator', bloodGroup: 'A+', address: 'মিরপুর, ঢাকা', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop', tenantId: 'sonar-bangla', tenantSubdomain: 'sonar-bangla', tenantName: 'সোনার বাংলা আদর্শ উচ্চ বিদ্যালয়' },
  { id: 'EMP-SB-002', name: 'রোকেয়া খাতুন', designation: 'সহকারী প্রধান শিক্ষক', phone: '+880 1722-345678', email: 'rokeya@sonarbangla.edu.bd', joinDate: '1995-07-15', salary: 42000, role: 'Teacher', bloodGroup: 'O+', address: 'মিরপুর, ঢাকা', imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop', tenantId: 'sonar-bangla', tenantSubdomain: 'sonar-bangla', tenantName: 'সোনার বাংলা আদর্শ উচ্চ বিদ্যালয়' },
  { id: 'EMP-SB-003', name: 'শফিকুল ইসলাম', designation: 'সিনিয়র শিক্ষক (গণিত ও বিজ্ঞান)', phone: '+880 1733-456789', email: 'shafiq@sonarbangla.edu.bd', joinDate: '2008-01-10', salary: 36000, role: 'Teacher', bloodGroup: 'B+', address: 'পল্লবী, ঢাকা', imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop', tenantId: 'sonar-bangla', tenantSubdomain: 'sonar-bangla', tenantName: 'সোনার বাংলা আদর্শ উচ্চ বিদ্যালয়' },
  { id: 'EMP-SB-004', name: 'ফারহানা পারভীন', designation: 'সহকারী শিক্ষক (ইংরেজি)', phone: '+880 1744-567890', email: 'farhana@sonarbangla.edu.bd', joinDate: '2016-04-01', salary: 30000, role: 'Teacher', bloodGroup: 'AB+', address: 'মিরপুর, ঢাকা', imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop', tenantId: 'sonar-bangla', tenantSubdomain: 'sonar-bangla', tenantName: 'সোনার বাংলা আদর্শ উচ্চ বিদ্যালয়' },
  { id: 'EMP-SB-005', name: 'খন্দকার রেজাউল করিম', designation: 'হিসাবরক্ষক কর্মকর্তা', phone: '+880 1755-678901', email: 'accounts@sonarbangla.edu.bd', joinDate: '2011-09-01', salary: 28000, role: 'Accountant', bloodGroup: 'O+', address: 'ঢাকা', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop', tenantId: 'sonar-bangla', tenantSubdomain: 'sonar-bangla', tenantName: 'সোনার বাংলা আদর্শ উচ্চ বিদ্যালয়' },

  // Dhaka City College Staff
  { id: 'EMP-001', name: 'Abdul Jabbar', designation: 'Senior Teacher (Math & Physics)', phone: '01700000001', email: 'abdul@school.edu', joinDate: '2015-01-10', salary: 35000, role: 'Teacher', bloodGroup: 'B+', address: 'Mirpur, Dhaka', imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop', tenantId: '1', tenantSubdomain: 'dcc', tenantName: 'Dhaka City College' },
  { id: 'EMP-002', name: 'Salma Khatun', designation: 'Assistant Teacher (English)', phone: '01700000002', email: 'salma@dcc.edu.bd', joinDate: '2018-03-15', salary: 28000, role: 'Teacher', bloodGroup: 'A-', address: 'Dhanmondi, Dhaka', imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop', tenantId: '1', tenantSubdomain: 'dcc', tenantName: 'Dhaka City College' },
  { id: 'EMP-003', name: 'Mofizur Rahman', designation: 'Accountant & Finance Lead', phone: '01900000001', email: 'mofizur@dcc.edu.bd', joinDate: '2020-06-01', salary: 22000, role: 'Accountant', bloodGroup: 'O+', address: 'Uttara, Dhaka', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop', tenantId: '1', tenantSubdomain: 'dcc', tenantName: 'Dhaka City College' },

  // Green Leaf International Staff
  { id: 'EMP-GL-001', name: 'Nasreen Akter', designation: 'Senior Faculty (Chemistry & Biology)', phone: '01700000004', email: 'nasreen@greenleaf.edu.bd', joinDate: '2016-08-20', salary: 32000, role: 'Teacher', bloodGroup: 'O-', address: 'Banani, Dhaka', imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop', tenantId: '2', tenantSubdomain: 'greenleaf', tenantName: 'Green Leaf International' },
  { id: 'EMP-GL-002', name: 'Dr. Shah Alam', designation: 'Vice Principal & Academic Dean', phone: '01700000005', email: 'shahalam@greenleaf.edu.bd', joinDate: '2012-04-01', salary: 55000, role: 'Administrator', bloodGroup: 'A+', address: 'Gulshan, Dhaka', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop', tenantId: '2', tenantSubdomain: 'greenleaf', tenantName: 'Green Leaf International' },

  // Darul Uloom Madrasa Staff
  { id: 'EMP-DU-001', name: 'Mawlana Ibrahim', designation: 'Senior Ustadh (Hadith & Arabic)', phone: '01700000006', email: 'ibrahim@darululoom.edu.bd', joinDate: '2014-02-01', salary: 30000, role: 'Teacher', bloodGroup: 'A+', address: 'Mirpur, Dhaka', imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop', tenantId: '3', tenantSubdomain: 'darululoom', tenantName: 'Darul Uloom Madrasa' },

  // Sunshine High Staff
  { id: 'EMP-SH-001', name: 'Robert Smith', designation: 'Head Teacher (English)', phone: '01700000007', email: 'robert@sunshine.edu.bd', joinDate: '2019-05-12', salary: 34000, role: 'Teacher', bloodGroup: 'O+', address: 'Narayanganj', imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop', tenantId: '4', tenantSubdomain: 'sunshine', tenantName: 'Sunshine High' },
];

export const MOCK_CLASSES: SchoolClass[] = [
  { id: 'CLS-10-A', name: 'Class 10', section: 'A', classTeacher: 'Abdul Jabbar', studentsCount: 45 },
  { id: 'CLS-10-B', name: 'Class 10', section: 'B', classTeacher: 'Salma Khatun', studentsCount: 42 },
  { id: 'CLS-09-A', name: 'Class 9', section: 'A', classTeacher: 'Nasreen Akter', studentsCount: 50 },
  { id: 'CLS-09-B', name: 'Class 9', section: 'B', classTeacher: 'Abdul Jabbar', studentsCount: 40 },
  { id: 'CLS-08-A', name: 'Class 8', section: 'A', classTeacher: 'Salma Khatun', studentsCount: 38 },
];

export const MOCK_SUBJECTS: Subject[] = [
  { id: 'SUB-001', name: 'Mathematics', code: 'MATH101', type: 'Theory', classId: 'CLS-10-A', teacherId: 'EMP-001' },
  { id: 'SUB-002', name: 'English 1st Paper', code: 'ENG101', type: 'Theory', classId: 'CLS-10-A', teacherId: 'EMP-002' },
  { id: 'SUB-003', name: 'Physics', code: 'PHY101', type: 'Both', classId: 'CLS-10-A' },
  { id: 'SUB-004', name: 'General Science', code: 'SCI201', type: 'Theory', classId: 'CLS-09-A', teacherId: 'EMP-001' },
];

export const MOCK_EXAMS: Exam[] = [
  { id: 'EX-2024-01', name: 'First Term Examination 2024', startDate: '2024-04-10', status: 'Completed' },
  { id: 'EX-2024-02', name: 'Half Yearly Examination 2024', startDate: '2024-08-15', status: 'Published' },
  { id: 'EX-2024-03', name: 'Annual Examination 2024', startDate: '2024-12-01', status: 'Upcoming' },
];

export const MOCK_GRADING_RULES: GradingRule[] = [
  { id: '1', grade: 'A+', min: 80, max: 100, point: 5.0 },
  { id: '2', grade: 'A', min: 70, max: 79, point: 4.0 },
  { id: '3', grade: 'A-', min: 60, max: 69, point: 3.5 },
  { id: '4', grade: 'B', min: 50, max: 59, point: 3.0 },
  { id: '5', grade: 'C', min: 40, max: 49, point: 2.0 },
  { id: '6', grade: 'D', min: 33, max: 39, point: 1.0 },
  { id: '7', grade: 'F', min: 0, max: 32, point: 0.0 },
];

export const MOCK_RESULTS: ExamResult[] = [
  { id: 'RES-001', examId: 'EX-2024-01', studentId: 'ST-2024-001', studentName: 'Rahim Ahmed', rollNo: '101', subjectId: 'SUB-001', marks: { theory: 75, mcq: 15, total: 90 }, grade: 'A+' },
  { id: 'RES-002', examId: 'EX-2024-01', studentId: 'ST-2024-002', studentName: 'Fatima Begum', rollNo: '102', subjectId: 'SUB-001', marks: { theory: 60, mcq: 12, total: 72 }, grade: 'A' },
  { id: 'RES-003', examId: 'EX-2024-01', studentId: 'ST-2024-001', studentName: 'Rahim Ahmed', rollNo: '101', subjectId: 'SUB-002', marks: { theory: 65, total: 65 }, grade: 'A-' },
  { id: 'RES-004', examId: 'EX-2024-01', studentId: 'ST-2024-001', studentName: 'Rahim Ahmed', rollNo: '101', subjectId: 'SUB-003', marks: { theory: 78, total: 78 }, grade: 'A' },
];

export const MOCK_INVOICES: FeeInvoice[] = [
  { id: 'INV-001', studentName: 'Rahim Ahmed', amount: 2500, dueDate: '2024-05-10', status: 'Paid', type: 'Tuition' },
  { id: 'INV-002', studentName: 'Fatima Begum', amount: 1500, dueDate: '2024-05-15', status: 'Unpaid', type: 'Tuition' },
  { id: 'INV-003', studentName: 'Sujon Khan', amount: 500, dueDate: '2024-05-01', status: 'Overdue', type: 'Exam' },
  { id: 'INV-004', studentName: 'Abir Hasan', amount: 3000, dueDate: '2024-06-10', status: 'Unpaid', type: 'Tuition' },
];

export const MOCK_EXPENSES: Expense[] = [
  { id: 'EXP-001', title: 'Electricity Bill - April', category: 'Utility', amount: 12000, date: '2024-05-05', status: 'Paid', paymentMethod: 'Bank' },
  { id: 'EXP-002', title: 'Whiteboard Markers', category: 'Supplies', amount: 500, date: '2024-05-10', status: 'Paid', paymentMethod: 'Cash' },
  { id: 'EXP-003', title: 'Building Paint', category: 'Maintenance', amount: 50000, date: '2024-05-01', status: 'Pending', paymentMethod: 'Check' },
];

export const MOCK_CERTIFICATES: CertificateTemplate[] = [
  { id: 'CERT-001', name: 'Character Certificate', type: 'Character', previewUrl: 'https://via.placeholder.com/150?text=Character' },
  { id: 'CERT-002', name: 'Transfer Certificate (TC)', type: 'Transfer', previewUrl: 'https://via.placeholder.com/150?text=TC' },
  { id: 'CERT-003', name: 'Academic Merit', type: 'Merit', previewUrl: 'https://via.placeholder.com/150?text=Merit' },
];

export const MOCK_PLANS: SubscriptionPlan[] = [
  { 
    id: 'PLAN-B', 
    name: 'Basic Starter', 
    price: 20, 
    billingCycle: 'Monthly', 
    activeTenants: 45, 
    features: ['Up to 500 Students', 'Core Modules', 'Email Support'],
    maxStudentsLimit: 500,
    allowedModules: ['academic', 'exams', 'communication'] 
  },
  { 
    id: 'PLAN-S', 
    name: 'Standard Growth', 
    price: 50, 
    billingCycle: 'Monthly', 
    activeTenants: 60, 
    features: ['Up to 2000 Students', 'Accounts & Fees', 'SMS Gateway', 'Biometric Support'],
    maxStudentsLimit: 2000,
    allowedModules: ['academic', 'exams', 'hr', 'finance', 'communication', 'front_desk']
  },
  { 
    id: 'PLAN-P', 
    name: 'Premium Enterprise', 
    price: 100, 
    billingCycle: 'Monthly', 
    activeTenants: 19, 
    features: ['Unlimited Students', 'Custom Domain', 'White-label App', 'Priority Support'],
    maxStudentsLimit: 5000,
    allowedModules: ['academic', 'exams', 'hr', 'finance', 'operations', 'communication', 'front_desk', 'admin']
  },
];

export const MOCK_ATTENDANCE: AttendanceRecord[] = [
  { id: 'ATT-001', personName: 'Rahim Ahmed', personId: '101', type: 'Student', date: '2024-05-20', status: 'Present', checkInTime: '08:15 AM' },
  { id: 'ATT-002', personName: 'Fatima Begum', personId: '102', type: 'Student', date: '2024-05-20', status: 'Late', checkInTime: '09:05 AM' },
  { id: 'ATT-003', personName: 'Abdul Jabbar', personId: 'EMP-001', type: 'Staff', date: '2024-05-20', status: 'Present', checkInTime: '07:55 AM' },
];

export const MOCK_SALARIES: SalaryPayment[] = [
  { id: 'SAL-001', staffName: 'Abdul Jabbar', amount: 35000, month: 'April 2024', status: 'Paid', paymentDate: '2024-05-02' },
  { id: 'SAL-002', staffName: 'Salma Khatun', amount: 28000, month: 'April 2024', status: 'Pending' },
  { id: 'SAL-003', staffName: 'Mofizur Rahman', amount: 22000, month: 'April 2024', status: 'Paid', paymentDate: '2024-05-01' },
];

export const MOCK_COMMUNICATIONS: CommunicationLog[] = [
  { id: 'MSG-001', recipient: 'Class 10 Parents', message: 'School will remain closed tomorrow due to rain.', type: 'SMS', sentAt: '2024-05-20 10:00 AM', status: 'Delivered' },
  { id: 'MSG-002', recipient: 'Rahim Ahmed', message: 'Your fee is overdue. Please pay ASAP.', type: 'SMS', sentAt: '2024-05-18 09:30 AM', status: 'Delivered' },
  { id: 'MSG-003', recipient: 'All Staff', message: 'Meeting at 2 PM in the conference room.', type: 'Email', sentAt: '2024-05-19 08:00 AM', status: 'Delivered' },
];

export const MOCK_ACTIVITY_LOGS: ActivityLog[] = [
  { id: 'LOG-001', actor: 'Super Admin', action: 'Created Tenant: Dhaka City College', target: 'Tenant DB', timestamp: '2024-05-20 14:30:00', ipAddress: '192.168.1.1', severity: 'Info' },
  { id: 'LOG-002', actor: 'System', action: 'Failed Login Attempt', target: 'Super Admin Panel', timestamp: '2024-05-20 12:15:00', ipAddress: '45.32.11.10', severity: 'Warning' },
  { id: 'LOG-003', actor: 'Dhaka City College', action: 'Subscription Payment Failed', target: 'Stripe Gateway', timestamp: '2024-05-19 09:00:00', ipAddress: '10.0.0.5', severity: 'Critical' },
  { id: 'LOG-004', actor: 'Green Leaf Int', action: 'SMS Bulk Sent', target: 'SMS Gateway', timestamp: '2024-05-18 16:20:00', ipAddress: '10.0.0.8', severity: 'Info' },
];

export const MOCK_MODULES: SystemModule[] = [
  { id: 'academic', name: 'Academic', description: 'Students, Classes, Subjects', status: 'Active', requiredPlan: 'Basic' },
  { id: 'finance', name: 'Finance & Accounts', description: 'Fees, Invoices, Expenses', status: 'Active', requiredPlan: 'Standard' },
  { id: 'hr', name: 'HR & Payroll', description: 'Staff, Attendance, Salary', status: 'Active', requiredPlan: 'Standard' },
  { id: 'exams', name: 'Examinations', description: 'Exams, Marks, Results', status: 'Active', requiredPlan: 'Basic' },
  { id: 'operations', name: 'Operations', description: 'Library, Transport, Hostel, Inventory', status: 'Active', requiredPlan: 'Premium' },
  { id: 'communication', name: 'Communication', description: 'SMS, Events, Notices', status: 'Active', requiredPlan: 'Standard' },
  { id: 'front_desk', name: 'Front Desk', description: 'Visitors, Complaints', status: 'Active', requiredPlan: 'Standard' },
  { id: 'admin', name: 'Administration', description: 'Roles, Settings, Reports', status: 'Active', requiredPlan: 'Basic' },
];

export const MOCK_ROLES: Role[] = [
  { id: 'ROLE-ADM', name: 'Administrator', usersCount: 2, permissions: ['all'] },
  { id: 'ROLE-TCH', name: 'Teacher', usersCount: 24, permissions: ['student_view', 'attendance_mark', 'exam_mark'] },
  { id: 'ROLE-ACC', name: 'Accountant', usersCount: 1, permissions: ['fee_manage', 'expense_manage', 'salary_view'] },
  { id: 'ROLE-REC', name: 'Receptionist', usersCount: 1, permissions: ['student_view', 'visitor_log'] },
];

export const MOCK_BOOKS: Book[] = [
  { 
    id: 'BK-1001', 
    title: 'Concepts of Physics (Vol 1 & 2)', 
    author: 'Dr. H.C. Verma', 
    isbn: '978-81-7709-187-8', 
    category: 'Science', 
    publisher: 'Bharati Bhawan', 
    edition: '2022 Revised', 
    shelfLocation: 'Rack S-01 (Shelf A)', 
    totalCopies: 15, 
    availableCopies: 9, 
    condition: 'Good', 
    price: 650, 
    callNumber: '530.1 VER',
    coverUrl: 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd7?w=300',
    status: 'Available' 
  },
  { 
    id: 'BK-1002', 
    title: 'The Tragedy of Hamlet, Prince of Denmark', 
    author: 'William Shakespeare', 
    isbn: '978-01-4139-650-7', 
    category: 'Literature', 
    publisher: 'Penguin Classics', 
    edition: 'Annotated Ed.', 
    shelfLocation: 'Rack L-03 (Shelf C)', 
    totalCopies: 10, 
    availableCopies: 3, 
    condition: 'Good', 
    price: 380, 
    callNumber: '822.33 SHA',
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300',
    status: 'Available' 
  },
  { 
    id: 'BK-1003', 
    title: 'Higher Secondary Mathematics & Calculus', 
    author: 'S.U. Ahamed & M.A. Jabbar', 
    isbn: '978-98-4338-921-2', 
    category: 'Mathematics', 
    publisher: 'Aksharpatra Prokashani', 
    edition: '12th Edition', 
    shelfLocation: 'Rack M-02 (Shelf B)', 
    totalCopies: 20, 
    availableCopies: 14, 
    condition: 'New', 
    price: 520, 
    callNumber: '515 AHA',
    coverUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=300',
    status: 'Available' 
  },
  { 
    id: 'BK-1004', 
    title: 'Modern Organic Chemistry with Mechanisms', 
    author: 'Dr. Gazi Md. Ahsanul Kabir', 
    isbn: '978-98-4901-432-6', 
    category: 'Science', 
    publisher: 'Hasan Book House', 
    edition: '2023 Edition', 
    shelfLocation: 'Rack S-02 (Shelf D)', 
    totalCopies: 12, 
    availableCopies: 2, 
    condition: 'Good', 
    price: 580, 
    callNumber: '547 KAB',
    coverUrl: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=300',
    status: 'Low Stock' 
  },
  { 
    id: 'BK-1005', 
    title: 'History of Bangladesh and World Civilization', 
    author: 'NCTB Board Panel', 
    isbn: '978-98-4444-102-1', 
    category: 'Social Studies', 
    publisher: 'National Curriculum & Textbook Board', 
    edition: 'Class 9-10 Edition', 
    shelfLocation: 'Rack H-01 (Shelf A)', 
    totalCopies: 25, 
    availableCopies: 18, 
    condition: 'Good', 
    price: 240, 
    callNumber: '954.92 NCT',
    coverUrl: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=300',
    status: 'Available' 
  },
  { 
    id: 'BK-1006', 
    title: 'Computer Science: Algorithms & Python Programming', 
    author: 'Dr. M. Kaykobad', 
    isbn: '978-98-4923-881-4', 
    category: 'Computer Science', 
    publisher: 'Tamrolipi Publications', 
    edition: '3rd Edition', 
    shelfLocation: 'Rack CS-01 (Shelf B)', 
    totalCopies: 8, 
    availableCopies: 0, 
    condition: 'Fair', 
    price: 490, 
    callNumber: '005.1 KAY',
    coverUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300',
    status: 'Out of Stock' 
  },
  { 
    id: 'BK-1007', 
    title: 'Oxford Advanced Learner\'s Dictionary (10th Ed)', 
    author: 'A.S. Hornby & Diana Lea', 
    isbn: '978-01-9479-848-8', 
    category: 'Reference', 
    publisher: 'Oxford University Press', 
    edition: '10th Hardcover', 
    shelfLocation: 'Reference Desk R-01', 
    totalCopies: 5, 
    availableCopies: 4, 
    condition: 'New', 
    price: 1400, 
    callNumber: '423 HOR',
    coverUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=300',
    status: 'Available' 
  },
  { 
    id: 'BK-1008', 
    title: 'Gitanjali (Song Offerings)', 
    author: 'Rabindranath Tagore', 
    isbn: '978-98-4500-112-9', 
    category: 'Literature', 
    publisher: 'Sahitya Prakash', 
    edition: 'Centenary Edition', 
    shelfLocation: 'Rack L-01 (Shelf A)', 
    totalCopies: 14, 
    availableCopies: 11, 
    condition: 'Good', 
    price: 320, 
    callNumber: '891.44 TAG',
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300',
    status: 'Available' 
  }
];

export const MOCK_BORROW_RECORDS: BookBorrowRecord[] = [
  {
    id: 'BOR-2024-001',
    bookId: 'BK-1001',
    bookTitle: 'Concepts of Physics (Vol 1 & 2)',
    bookIsbn: '978-81-7709-187-8',
    studentId: 'ST-2024-001',
    studentName: 'Rahim Ahmed',
    studentRoll: '101',
    studentClass: 'Class 10',
    studentSection: 'A',
    borrowDate: '2024-05-02',
    dueDate: '2024-05-16',
    status: 'Overdue',
    issuedBy: 'Mrs. Selina (Librarian)',
    conditionAtIssue: 'Good',
    daysOverdue: 6,
    calculatedFine: 60,
    finePaid: 0,
    fineStatus: 'Pending',
    notes: 'Requested extension due to term exams'
  },
  {
    id: 'BOR-2024-002',
    bookId: 'BK-1002',
    bookTitle: 'The Tragedy of Hamlet, Prince of Denmark',
    bookIsbn: '978-01-4139-650-7',
    studentId: 'ST-2024-002',
    studentName: 'Fatima Begum',
    studentRoll: '102',
    studentClass: 'Class 10',
    studentSection: 'A',
    borrowDate: '2024-05-10',
    dueDate: '2024-05-24',
    status: 'Issued',
    issuedBy: 'Mrs. Selina (Librarian)',
    conditionAtIssue: 'Good',
    daysOverdue: 0,
    calculatedFine: 0,
    finePaid: 0,
    fineStatus: 'None'
  },
  {
    id: 'BOR-2024-003',
    bookId: 'BK-1006',
    bookTitle: 'Computer Science: Algorithms & Python Programming',
    bookIsbn: '978-98-4923-881-4',
    studentId: 'ST-2024-003',
    studentName: 'Karim Ullah',
    studentRoll: '103',
    studentClass: 'Class 10',
    studentSection: 'B',
    borrowDate: '2024-04-20',
    dueDate: '2024-05-04',
    returnDate: '2024-05-08',
    status: 'Returned',
    issuedBy: 'Mrs. Selina (Librarian)',
    conditionAtIssue: 'Fair',
    conditionAtReturn: 'Fair',
    daysOverdue: 4,
    calculatedFine: 40,
    finePaid: 40,
    fineStatus: 'Paid',
    notes: 'Paid late fine via cash counter'
  },
  {
    id: 'BOR-2024-004',
    bookId: 'BK-1004',
    bookTitle: 'Modern Organic Chemistry with Mechanisms',
    bookIsbn: '978-98-4901-432-6',
    studentId: 'ST-2024-004',
    studentName: 'Nusrat Jahan',
    studentRoll: '104',
    studentClass: 'Class 9',
    studentSection: 'A',
    borrowDate: '2024-04-25',
    dueDate: '2024-05-09',
    status: 'Overdue',
    issuedBy: 'Mr. Rafiq (Assistant Librarian)',
    conditionAtIssue: 'Good',
    daysOverdue: 13,
    calculatedFine: 130,
    finePaid: 0,
    fineStatus: 'Pending',
    notes: '1st automated SMS notice sent to guardian'
  },
  {
    id: 'BOR-2024-005',
    bookId: 'BK-1003',
    bookTitle: 'Higher Secondary Mathematics & Calculus',
    bookIsbn: '978-98-4338-921-2',
    studentId: 'ST-2024-005',
    studentName: 'Tanvir Hossain',
    studentRoll: '105',
    studentClass: 'Class 10',
    studentSection: 'A',
    borrowDate: '2024-05-15',
    dueDate: '2024-05-29',
    status: 'Issued',
    issuedBy: 'Mrs. Selina (Librarian)',
    conditionAtIssue: 'New',
    daysOverdue: 0,
    calculatedFine: 0,
    finePaid: 0,
    fineStatus: 'None'
  },
  {
    id: 'BOR-2024-006',
    bookId: 'BK-1008',
    bookTitle: 'Gitanjali (Song Offerings)',
    bookIsbn: '978-98-4500-112-9',
    studentId: 'ST-2024-001',
    studentName: 'Rahim Ahmed',
    studentRoll: '101',
    studentClass: 'Class 10',
    studentSection: 'A',
    borrowDate: '2024-04-10',
    dueDate: '2024-04-24',
    returnDate: '2024-04-24',
    status: 'Returned',
    issuedBy: 'Mrs. Selina (Librarian)',
    conditionAtIssue: 'Good',
    conditionAtReturn: 'Good',
    daysOverdue: 0,
    calculatedFine: 0,
    finePaid: 0,
    fineStatus: 'None'
  }
];

export const MOCK_LIBRARY_CONFIG: LibraryRuleConfig = {
  dailyFineAmount: 10, // 10 currency units per day
  maxBorrowDays: 14,
  maxBooksPerStudent: 3,
  gracePeriodDays: 1,
  lostBookMultiplier: 1.5,
  damageFineFlat: 100
};

export const MOCK_TRANSPORTS: TransportRoute[] = [
  { id: 'RT-01', routeName: 'Mirpur - Dhanmondi', vehicleNumber: 'DHAKA-METRO-GA-1234', driverName: 'Abdul Karim', fare: 1500, capacity: 40, studentsAssigned: 32 },
  { id: 'RT-02', routeName: 'Uttara - Banani', vehicleNumber: 'DHAKA-METRO-GA-5678', driverName: 'Rahim Uddin', fare: 2000, capacity: 30, studentsAssigned: 28 },
];

export const MOCK_INVENTORY: InventoryItem[] = [
  { id: 'INV-001', name: 'A4 Paper Bundle', category: 'Stationery', quantity: 50, unit: 'Pack', status: 'In Stock', lastUpdated: '2024-05-15' },
  { id: 'INV-002', name: 'Whiteboard Markers', category: 'Stationery', quantity: 12, unit: 'Box', status: 'Low Stock', lastUpdated: '2024-05-20' },
  { id: 'INV-003', name: 'Student Desk', category: 'Furniture', quantity: 120, unit: 'Pcs', status: 'In Stock', lastUpdated: '2024-01-10' },
  { id: 'INV-004', name: 'Desktop Computer', category: 'Electronics', quantity: 25, unit: 'Set', status: 'In Stock', lastUpdated: '2023-11-05' },
];

export const MOCK_ROUTINES: ClassRoutine[] = [
  { id: 'RTN-001', classId: 'CLS-10-A', day: 'Sunday', period: '1st Period (09:00 - 09:45)', subjectName: 'Mathematics', teacherName: 'Abdul Jabbar', roomNo: '201' },
  { id: 'RTN-002', classId: 'CLS-10-A', day: 'Sunday', period: '2nd Period (09:45 - 10:30)', subjectName: 'English', teacherName: 'Salma Khatun', roomNo: '201' },
  { id: 'RTN-003', classId: 'CLS-10-A', day: 'Monday', period: '1st Period (09:00 - 09:45)', subjectName: 'Physics', teacherName: 'Nasreen Akter', roomNo: 'Lab-A' },
  { id: 'RTN-004', classId: 'CLS-10-A', day: 'Monday', period: '2nd Period (09:45 - 10:30)', subjectName: 'Chemistry', teacherName: 'Anisul Hoque', roomNo: '201' },
  { id: 'RTN-005', classId: 'CLS-10-A', day: 'Sunday', period: '3rd Period (10:30 - 11:15)', subjectName: 'Physics', teacherName: 'Nasreen Akter', roomNo: 'Lab-A' },
];

export const MOCK_EVENTS: SchoolEvent[] = [
  { id: 'EVT-001', title: 'Annual Sports Day', date: '2024-02-15', type: 'Sports', description: 'All students must wear sports uniform.' },
  { id: 'EVT-002', title: 'Victory Day', date: '2024-12-16', type: 'Holiday', description: 'School closed.' },
  { id: 'EVT-003', title: 'Parents Meeting', date: '2024-06-10', type: 'Academic', description: 'Discussion on half-yearly results.' },
];

export const MOCK_LEAVES: LeaveApplication[] = [
  { id: 'LV-001', applicantName: 'Abdul Jabbar', applicantId: 'EMP-001', role: 'Teacher', type: 'Sick', startDate: '2024-05-22', endDate: '2024-05-23', reason: 'Fever', status: 'Pending' },
  { id: 'LV-002', applicantName: 'Rahim Ahmed', applicantId: 'ST-2024-001', role: 'Student', type: 'Casual', startDate: '2024-06-01', endDate: '2024-06-05', reason: 'Family Wedding', status: 'Approved' },
];

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  { id: 'NOT-001', title: 'New Admission Request', message: 'Karim Ahmed submitted an application.', time: '10 mins ago', read: false, type: 'info' },
  { id: 'NOT-002', title: 'Server Maintenance', message: 'Scheduled downtime at 12:00 AM.', time: '1 hour ago', read: false, type: 'warning' },
  { id: 'NOT-003', title: 'Payment Failed', message: 'Transaction ID #9988 failed.', time: '3 hours ago', read: true, type: 'error' },
];

export const MOCK_CHATS: ChatThread[] = [
  { id: 'CHAT-001', user: 'Abdul Jabbar', role: 'Teacher', lastMessage: 'Can you approve my leave request?', time: '10:30 AM', unread: 2, avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100' },
  { id: 'CHAT-002', user: 'Rahim Ahmed', role: 'Student', lastMessage: 'Sir, when will the results be published?', time: 'Yesterday', unread: 0, avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=100' },
  { id: 'CHAT-003', user: 'Mrs. Salma', role: 'Parent', lastMessage: 'I need to discuss Rahim\'s progress.', time: '2 days ago', unread: 0, avatar: '' },
];

export const MOCK_MESSAGES: ChatMessage[] = [
  { id: 'MSG-101', sender: 'other', text: 'Hello Sir, good morning.', time: '10:28 AM' },
  { id: 'MSG-102', sender: 'other', text: 'Can you approve my leave request?', time: '10:30 AM' },
  { id: 'MSG-103', sender: 'me', text: 'I will check and update you shortly.', time: '10:32 AM' },
];

export const MOCK_HOSTEL: HostelRoom[] = [
  { id: 'RM-101', roomNumber: '101', type: 'Boys', capacity: 4, occupied: 3, costPerMonth: 2000, warden: 'Mr. Hassan' },
  { id: 'RM-102', roomNumber: '102', type: 'Boys', capacity: 4, occupied: 4, costPerMonth: 2000, warden: 'Mr. Hassan' },
  { id: 'RM-201', roomNumber: '201', type: 'Girls', capacity: 3, occupied: 2, costPerMonth: 2500, warden: 'Mrs. Fatema' },
];

export const MOCK_ALUMNI: Alumni[] = [
  { id: 'AL-001', name: 'Tanvir Ahmed', batch: 'SSC 2015', profession: 'Software Engineer', company: 'Google', email: 'tanvir@google.com', phone: '01711...', status: 'Approved' },
  { id: 'AL-002', name: 'Nusrat Jahan', batch: 'SSC 2016', profession: 'Doctor', company: 'DMC Hospital', email: 'nusrat@dmc.com', phone: '01911...', status: 'Approved' },
  { id: 'AL-003', name: 'Karim Ullah', batch: 'SSC 2018', profession: 'Student', company: 'BUET', email: 'karim@buet.ac.bd', phone: '01555...', status: 'Pending' },
];

export const MOCK_TICKETS: SupportTicket[] = [
  { id: 'TKT-001', tenantId: '2', tenantName: 'Green Leaf International', subject: 'SMS Gateway Issue', message: 'OTP not being delivered to parents.', status: 'Open', priority: 'High', createdAt: '2024-05-21' },
  { id: 'TKT-002', tenantId: '1', tenantName: 'Dhaka City College', subject: 'Plan Upgrade Request', message: 'We want to move to Premium plan.', status: 'In Progress', priority: 'Medium', createdAt: '2024-05-20' },
  { id: 'TKT-003', tenantId: '3', tenantName: 'Darul Uloom Madrasa', subject: 'Feature Request', message: 'Need additional field in student admission form.', status: 'Resolved', priority: 'Low', createdAt: '2024-05-18' },
];

// ... (Rest of constants remain unchanged) ...
export const BLUEPRINT_API_DOCS = `
# Amar Smart School - API Reference v1.0
...
`;
export const BLUEPRINT_DB_SCHEMA = `...`;
export const BLUEPRINT_DEV_GUIDE = `...`;
export const GOOGLE_STUDIO_PROMPT = `...`;
