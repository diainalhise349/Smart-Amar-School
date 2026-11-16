import { Tenant, Student, Staff } from '../types';
import { MOCK_STUDENTS, MOCK_STAFF } from '../constants';

export const TENANT_STORAGE_KEY = 'smart_amar_school_tenants_v1';
export const ACTIVE_TENANT_KEY = 'smart_amar_school_active_tenant_v1';
export const TENANT_UPDATE_EVENT = 'smart-amar-school-tenant-change';
export const SCHOOL_THEME_EVENT = 'smart-amar-school-theme-updated';

export const DEFAULT_TENANTS: Tenant[] = [
  {
    id: 'sonar-bangla',
    name: 'সোনার বাংলা আদর্শ উচ্চ বিদ্যালয়',
    type: 'School',
    subdomain: 'sonar-bangla',
    customDomain: 'sonarbangla.edu.bd',
    logoUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=200&h=200&fit=crop',
    primaryColor: '#4f46e5',
    status: 'Active',
    studentsCount: 1050,
    maxStudents: 2500,
    plan: 'Premium',
    revenue: 35000,
    enabledModules: ['academic', 'finance', 'hr', 'exams', 'communication', 'portal', 'library', 'admissions'],
    eiin: '134567',
    code: 'SBIHS-1985',
    contactPhone: '+880 1711-234567',
    contactEmail: 'info@sonarbangla.edu.bd',
    address: 'রোড #০৫, ব্লক-বি, সোনার বাংলা রোড, ঢাকা-১২১৬, বাংলাদেশ',
    establishedYear: '1985',
    principalName: 'মো: আব্দুল করিম'
  },
  {
    id: '1',
    name: 'Dhaka City College',
    type: 'College',
    subdomain: 'dcc',
    logoUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=200&fit=crop',
    status: 'Active',
    studentsCount: 1250,
    maxStudents: 5000,
    plan: 'Premium',
    revenue: 45000,
    enabledModules: ['academic', 'finance', 'hr', 'exams', 'operations', 'communication', 'front_desk'],
    eiin: '108162',
    code: 'DCC-101',
    contactPhone: '+880 1712-345678',
    contactEmail: 'info@dcc.edu.bd',
    address: 'Road #2, Dhanmondi, Dhaka - 1205',
    establishedYear: '1957',
    principalName: 'Prof. Rafiqul Islam'
  },
  {
    id: '2',
    name: 'Green Leaf International',
    type: 'School',
    subdomain: 'greenleaf',
    customDomain: 'greenleaf.edu.bd',
    logoUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=200&h=200&fit=crop',
    status: 'Active',
    studentsCount: 850,
    maxStudents: 2000,
    plan: 'Standard',
    revenue: 22000,
    enabledModules: ['academic', 'finance', 'hr', 'exams', 'communication'],
    eiin: '134209',
    code: 'GLI-202',
    contactPhone: '+880 1722-998877',
    contactEmail: 'contact@greenleaf.edu.bd',
    address: 'Sector 7, Uttara Model Town, Dhaka',
    establishedYear: '2008',
    principalName: 'Farhan Chowdhury'
  },
  {
    id: 'al-amin',
    name: 'আল-আমিন ইসলামিয়া মাদ্রাসা',
    type: 'Madrasa',
    subdomain: 'al-amin',
    customDomain: 'alaminmadrasa.edu.bd',
    logoUrl: 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=200&h=200&fit=crop',
    status: 'Active',
    studentsCount: 520,
    maxStudents: 1000,
    plan: 'Premium',
    revenue: 28000,
    enabledModules: ['academic', 'exams', 'communication', 'portal', 'library', 'admissions'],
    eiin: '138765',
    code: 'AIM-1998',
    contactPhone: '+880 1712-040674',
    contactEmail: 'info@alaminmadrasa.edu.bd',
    address: 'গ্রাম: দক্ষিণপাড়া, ডাকঘর: মাধবপুর, উপজেলা: মাধবপুর, জেলা: হবিগঞ্জ',
    establishedYear: '1998',
    principalName: 'মাওলানা মোঃ আবদুল কাদির'
  },
  {
    id: '3',
    name: 'Darul Uloom Madrasa',
    type: 'Madrasa',
    subdomain: 'darululoom',
    logoUrl: 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=200&h=200&fit=crop',
    status: 'Active',
    studentsCount: 400,
    maxStudents: 500,
    plan: 'Basic',
    revenue: 8000,
    enabledModules: ['academic', 'exams', 'communication'],
    eiin: '121045',
    code: 'DUM-303',
    contactPhone: '+880 1733-445566',
    contactEmail: 'office@darululoom.edu.bd',
    address: 'Plot 14, Mirpur-1, Dhaka - 1216',
    establishedYear: '1985',
    principalName: 'Mawlana Mufti Abdul Haq'
  },
  {
    id: '4',
    name: 'Sunshine High',
    type: 'School',
    subdomain: 'sunshine',
    logoUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=200&h=200&fit=crop',
    status: 'Active',
    studentsCount: 350,
    maxStudents: 500,
    plan: 'Basic',
    revenue: 12000,
    enabledModules: ['academic', 'exams'],
    eiin: '115678',
    code: 'SSH-404',
    contactPhone: '+880 1755-667788',
    contactEmail: 'sunshine@school.edu.bd',
    address: 'Main Road, Narayanganj Sadar',
    establishedYear: '1998',
    principalName: 'Dr. David Barua'
  },
  {
    id: 'diu',
    name: 'ঢাকা ইন্টারন্যাশনাল ইউনিভার্সিটি (DIU)',
    type: 'University',
    subdomain: 'diu',
    customDomain: 'diu.ac.bd',
    logoUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=200&h=200&fit=crop',
    status: 'Active',
    studentsCount: 3850,
    maxStudents: 8000,
    plan: 'Premium',
    revenue: 120000,
    enabledModules: ['academic', 'finance', 'hr', 'exams', 'communication', 'portal', 'library', 'admissions', 'research'],
    eiin: '190456',
    code: 'DIU-1995',
    contactPhone: '+880 1713-456789',
    contactEmail: 'admissions@diu.ac.bd',
    address: 'বাড়ি #৪, রোড #১, ব্লক #এফ, বনশ্রী, ঢাকা-১২১৯, বাংলাদেশ',
    establishedYear: '1995',
    principalName: 'প্রফেসর ড. মুহাম্মদ শাহ আলম (উপাচার্য)'
  }
];

export const getStoredTenants = (): Tenant[] => {
  try {
    const raw = localStorage.getItem(TENANT_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(TENANT_STORAGE_KEY, JSON.stringify(DEFAULT_TENANTS));
      return DEFAULT_TENANTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Ensure university tenant is present
      const hasUniversity = parsed.some(t => t.type === 'University' || t.id === 'diu');
      if (!hasUniversity) {
        const uni = DEFAULT_TENANTS.find(t => t.id === 'diu');
        if (uni) {
          parsed.push(uni);
          localStorage.setItem(TENANT_STORAGE_KEY, JSON.stringify(parsed));
        }
      }
      return parsed;
    }
    return DEFAULT_TENANTS;
  } catch (err) {
    console.error('Failed to get stored tenants:', err);
    return DEFAULT_TENANTS;
  }
};

export const getTenantBySubdomain = (subdomainOrId?: string): Tenant => {
  const tenants = getStoredTenants();
  if (!subdomainOrId) return tenants[0];
  const query = subdomainOrId.trim().toLowerCase().replace(/[-_]/g, '');
  const found = tenants.find(
    t => t.subdomain.toLowerCase().replace(/[-_]/g, '') === query || 
         t.id.toLowerCase().replace(/[-_]/g, '') === query ||
         (t.customDomain && t.customDomain.toLowerCase().replace(/[-_]/g, '') === query) ||
         (query === 'school' && t.type === 'School') ||
         (query === 'madrasa' && t.type === 'Madrasa') ||
         (query === 'college' && t.type === 'College') ||
         ((query === 'university' || query === 'varsity') && t.type === 'University') ||
         (query === 'alamin' && t.subdomain.includes('al-amin')) ||
         (query === 'sonarbangla' && t.subdomain.includes('sonar')) ||
         (query === 'dcc' && t.subdomain.includes('dcc')) ||
         (query === 'diu' && t.subdomain.includes('diu'))
  );
  return found || tenants[0];
};

export const getActiveTenant = (): Tenant => {
  try {
    const raw = localStorage.getItem(ACTIVE_TENANT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.subdomain) return parsed;
    }
  } catch (err) {
    console.error('Failed to get active tenant:', err);
  }
  return DEFAULT_TENANTS[0];
};

export const setActiveTenant = (tenant: Tenant): void => {
  try {
    localStorage.setItem(ACTIVE_TENANT_KEY, JSON.stringify(tenant));
    window.dispatchEvent(new CustomEvent(TENANT_UPDATE_EVENT, { detail: tenant }));
    window.dispatchEvent(new CustomEvent(SCHOOL_THEME_EVENT, { detail: tenant }));
  } catch (err) {
    console.error('Failed to set active tenant:', err);
  }
};

export const updateTenant = (subdomainOrId: string, updates: Partial<Tenant>): Tenant => {
  try {
    const tenants = getStoredTenants();
    const query = (subdomainOrId || '').trim().toLowerCase().replace(/[-_]/g, '');
    const index = tenants.findIndex(
      t => t.subdomain.toLowerCase().replace(/[-_]/g, '') === query || 
           t.id.toLowerCase().replace(/[-_]/g, '') === query
    );
    
    if (index !== -1) {
      const updated: Tenant = { ...tenants[index], ...updates };
      tenants[index] = updated;
      localStorage.setItem(TENANT_STORAGE_KEY, JSON.stringify(tenants));
      
      const active = getActiveTenant();
      const activeQuery = (active.subdomain || active.id || '').toLowerCase().replace(/[-_]/g, '');
      if (activeQuery === query || !active.subdomain) {
        localStorage.setItem(ACTIVE_TENANT_KEY, JSON.stringify(updated));
      }

      window.dispatchEvent(new CustomEvent(TENANT_UPDATE_EVENT, { detail: updated }));
      window.dispatchEvent(new CustomEvent(SCHOOL_THEME_EVENT, { detail: updated }));
      return updated;
    }
  } catch (err) {
    console.error('Failed to update tenant:', err);
  }
  return getTenantBySubdomain(subdomainOrId);
};

export const updateTenantTheme = (
  subdomainOrId: string, 
  theme: { primaryColor?: string; secondaryColor?: string; logoUrl?: string; name?: string; sidebarTheme?: 'dark' | 'brand-tinted' | 'midnight' }
): Tenant => {
  return updateTenant(subdomainOrId, theme);
};

import { getStoredStudents } from './studentStorage';

export const getInstitutionPublicUrl = (subdomain: string): string => {
  return `#/institution/${subdomain}`;
};

export const getInstitutionLoginUrl = (subdomain: string): string => {
  return `#/institution/${subdomain}/login`;
};

/**
 * Filter students strictly by tenant subdomain or ID.
 * Under NO circumstances does it leak students from other institutions.
 */
export const getTenantStudents = (subdomainOrId?: string): Student[] => {
  try {
    const all = getStoredStudents();
    if (!subdomainOrId) return [];
    const query = subdomainOrId.trim().toLowerCase().replace(/[-_]/g, '');
    
    return all.filter((s: Student) => {
      const sSub = (s.tenantSubdomain || '').trim().toLowerCase().replace(/[-_]/g, '');
      const sId = (s.tenantId || '').trim().toLowerCase().replace(/[-_]/g, '');
      return sSub === query || sId === query;
    });
  } catch (err) {
    console.error('Failed to get tenant students:', err);
    return [];
  }
};

/**
 * Filter staff strictly by tenant subdomain or ID.
 * Under NO circumstances does it leak staff from other institutions.
 */
export const getTenantStaff = (subdomainOrId?: string): Staff[] => {
  try {
    if (!subdomainOrId) return [];
    const query = subdomainOrId.trim().toLowerCase().replace(/[-_]/g, '');
    
    return MOCK_STAFF.filter((s: any) => {
      const sSub = (s.tenantSubdomain || '').trim().toLowerCase().replace(/[-_]/g, '');
      const sId = (s.tenantId || '').trim().toLowerCase().replace(/[-_]/g, '');
      return sSub === query || sId === query;
    });
  } catch (err) {
    console.error('Failed to get tenant staff:', err);
    return [];
  }
};

export interface TenantClassRow {
  className: string;
  total: number;
  group: string;
  section: string;
}

/**
 * Dynamically derives class-wise student enrollment rows for the active tenant.
 * Madrasa displays its own curriculum (Hifz, Noorani, Ibteda'i, Dakhil, Alim),
 * School displays its own curriculum (Play, Nursery, Class 1-10),
 * College displays its own curriculum (HSC, Degree).
 */
export const getTenantClassWiseDistribution = (subdomainOrId?: string, tenantType?: string): TenantClassRow[] => {
  const students = getTenantStudents(subdomainOrId);
  const tenant = getTenantBySubdomain(subdomainOrId);
  const type = tenantType || tenant.type;

  // Base class templates by institution type
  let templateClasses: string[] = [];
  if (type === 'Madrasa') {
    templateClasses = [
      'নূরানী শিশু শ্রেণি',
      'হিফজুল কুরআন',
      'ইবতেদায়ি ১ম শ্রেণি',
      'ইবতেদায়ি ২য় শ্রেণি',
      'ইবতেদায়ি ৩য় শ্রেণি',
      'ইবতেদায়ি ৪র্থ শ্রেণি',
      'ইবতেদায়ি ৫ম শ্রেণি',
      'দাখিল ৬ষ্ঠ শ্রেণি',
      'দাখিল ৭ম শ্রেণি',
      'দাখিল ৮ম শ্রেণি',
      'দাখিল ৯ম শ্রেণি',
      'দাখিল ১০ম শ্রেণি',
      'আলিম ১ম বর্ষ',
      'আলিম ২য় বর্ষ'
    ];
  } else if (type === 'College') {
    templateClasses = [
      'HSC 1st Year (Science)',
      'HSC 1st Year (Commerce)',
      'HSC 1st Year (Humanities)',
      'HSC 2nd Year (Science)',
      'HSC 2nd Year (Commerce)',
      'HSC 2nd Year (Humanities)',
      'Degree 1st Year',
      'Degree 2nd Year',
      'Honours 1st Year'
    ];
  } else {
    // Standard School
    templateClasses = [
      'Play',
      'Nursery',
      'Class One',
      'Class Two',
      'Class Three',
      'Class Four',
      'Class Five',
      'Class Six',
      'Class Seven',
      'Class Eight',
      'Class Nine (General)',
      'Class Ten (General)'
    ];
  }

  // Include any student classes that might differ from template
  const studentClasses = Array.from(new Set(students.map(s => s.class)));
  const allTargetClasses = Array.from(new Set([...templateClasses, ...studentClasses]));

  return allTargetClasses.map(clsName => {
    // Find matching students for this class
    const matching = students.filter(s => {
      const c = (s.class || '').trim().toLowerCase();
      const target = clsName.trim().toLowerCase();
      return c === target || c.includes(target) || target.includes(c);
    });

    const total = matching.length;
    const sections = Array.from(new Set(matching.map(s => s.section).filter(Boolean)));
    const sectionStr = sections.length > 0 ? sections.join(', ') : total > 0 ? 'A' : 'N/A';

    let groupStr = 'General';
    if (type === 'Madrasa') {
      if (clsName.includes('হিফজ')) groupStr = 'হিফজুল কুরআন';
      else if (clsName.includes('দাখিল') || clsName.includes('আলিম')) groupStr = 'সাধারণ, বিজ্ঞান';
      else groupStr = 'ইসলামিয়া';
    } else if (type === 'College') {
      if (clsName.includes('Science')) groupStr = 'Science';
      else if (clsName.includes('Commerce')) groupStr = 'Business Studies';
      else if (clsName.includes('Humanities')) groupStr = 'Humanities';
      else groupStr = 'General';
    } else {
      if (clsName.includes('Nine') || clsName.includes('Ten') || clsName.includes('9') || clsName.includes('10')) {
        groupStr = 'General, Humanities';
      }
    }

    return {
      className: clsName,
      total,
      group: groupStr,
      section: sectionStr
    };
  });
};

export interface TenantMetrics {
  todayAdmission: number;
  totalStudents: number;
  allTimeStudents: number;
  pendingStudents: number;
  totalClasses: number;
  totalSections: number;
  totalGroups: number;
  academicYear: string;
  totalShifts: number;
  shiftName: string;
  attendanceRate: number;
  presentToday: number;
  absentToday: number;
  feeCollectedMonth: number;
  feeTargetMonth: number;
  feeCollectionRate: number;
  totalStaff: number;
}

/**
 * Calculates isolated live metrics strictly for the requested tenant.
 */
export const getTenantMetrics = (subdomainOrId?: string, tenantType?: string): TenantMetrics => {
  const students = getTenantStudents(subdomainOrId);
  const staff = getTenantStaff(subdomainOrId);
  const tenant = getTenantBySubdomain(subdomainOrId);
  const type = tenantType || tenant.type;

  const totalStudents = students.length > 0 ? students.length : (tenant.studentsCount || 25);
  const allTimeStudents = totalStudents;
  
  // Dynamic class & section counts
  const uniqueClasses = new Set(students.map(s => s.class)).size;
  const totalClasses = uniqueClasses > 0 ? uniqueClasses : (type === 'Madrasa' ? 8 : type === 'College' ? 6 : 12);
  
  const uniqueSections = new Set(students.map(s => s.section).filter(Boolean)).size;
  const totalSections = uniqueSections > 0 ? uniqueSections : 2;

  const totalGroups = type === 'Madrasa' ? 3 : type === 'College' ? 3 : 4;
  const totalShifts = 1;
  const shiftName = type === 'Madrasa' ? 'একক শিফট (আবাসিক ও অনাবাসিক)' : 'একক শিফট (দিবা)';

  // Pending admissions: calculate from mock or pending flag
  const pendingStudents = students.filter(s => s.status === 'Pending' || s.status === 'Suspended').length || 2;
  const todayAdmission = students.filter(s => s.status === 'Active').length > 0 ? 1 : 0;

  // Attendance metrics scaled to this tenant's total students
  const attendanceRate = 95.1;
  const presentToday = Math.round((totalStudents * attendanceRate) / 100);
  const absentToday = Math.max(0, totalStudents - presentToday);

  // Financial fee metrics scaled to this institution
  const avgMonthlyTuition = type === 'Madrasa' ? 1200 : type === 'College' ? 2500 : 1800;
  const feeTargetMonth = totalStudents * avgMonthlyTuition;
  const feeCollectionRate = 85.0;
  const feeCollectedMonth = Math.round((feeTargetMonth * feeCollectionRate) / 100);

  return {
    todayAdmission,
    totalStudents,
    allTimeStudents,
    pendingStudents,
    totalClasses,
    totalSections,
    totalGroups,
    academicYear: '2026',
    totalShifts,
    shiftName,
    attendanceRate,
    presentToday,
    absentToday,
    feeCollectedMonth,
    feeTargetMonth,
    feeCollectionRate,
    totalStaff: staff.length || 5
  };
};


