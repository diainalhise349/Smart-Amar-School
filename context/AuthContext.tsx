import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, Student, Tenant, Staff } from '../types';
import { getStoredStudents } from '../utils/studentStorage';
import { 
  getActiveTenant, 
  setActiveTenant as setStoredActiveTenant, 
  getTenantBySubdomain, 
  DEFAULT_TENANTS,
  TENANT_UPDATE_EVENT 
} from '../utils/tenantStorage';
import { MOCK_STAFF } from '../constants';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  studentId?: string;
  studentData?: Student;
  guardianName?: string;
  guardianPhone?: string;
  studentClass?: string;
  studentSection?: string;
  studentRoll?: string;
  activeChildId?: string;
  allChildren?: Student[];
  tenantId?: string;
  tenantName?: string;
  tenantSubdomain?: string;
  institutionType?: string;
}

export interface AuthContextType {
  user: User | null;
  activeTenant: Tenant;
  switchTenant: (subdomainOrId: string) => void;
  login: (roleKey: string, customData?: Partial<User>) => void;
  loginAsStudent: (identifier: string, passwordOrPin?: string, expectedSubdomain?: string) => { success: boolean; message: string; user?: User };
  loginAsParent: (phoneOrStudentId: string, passwordOrPin?: string, expectedSubdomain?: string) => { success: boolean; message: string; user?: User };
  loginAsTeacher: (emailOrId: string, password?: string, expectedSubdomain?: string) => { success: boolean; message: string; user?: User };
  loginAsSchoolAdmin: (tenantSubdomainOrId?: string, customData?: Partial<User>) => { success: boolean; message: string; user?: User };
  switchActiveChild: (childStudentId: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTenant, setActiveTenantState] = useState<Tenant>(() => getActiveTenant());

  // Listen for tenant updates
  useEffect(() => {
    const handleTenantChange = (e: Event) => {
      const custom = e as CustomEvent<Tenant>;
      if (custom.detail) {
        setActiveTenantState(custom.detail);
      }
    };
    window.addEventListener(TENANT_UPDATE_EVENT, handleTenantChange);
    return () => window.removeEventListener(TENANT_UPDATE_EVENT, handleTenantChange);
  }, []);

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('saas_user');
      if (storedUser) {
        const parsed: User = JSON.parse(storedUser);
        
        // Refresh studentData if user is a student or parent to stay in sync with nominal roll
        if (parsed.role === UserRole.STUDENT && parsed.studentId) {
          const freshStudents = getStoredStudents();
          const fresh = freshStudents.find(s => s.id === parsed.studentId);
          if (fresh) {
            parsed.studentData = fresh;
            parsed.name = fresh.name;
            parsed.tenantId = fresh.tenantId;
            parsed.tenantSubdomain = fresh.tenantSubdomain;
            parsed.tenantName = fresh.tenantName;
          }
        } else if (parsed.role === UserRole.PARENT && (parsed.activeChildId || parsed.studentId)) {
          const freshStudents = getStoredStudents();
          const targetId = parsed.activeChildId || parsed.studentId;
          const fresh = freshStudents.find(s => s.id === targetId);
          if (fresh) {
            parsed.studentData = fresh;
            parsed.allChildren = freshStudents.filter(
              s => (parsed.phone && s.phone === parsed.phone) || 
                   (parsed.guardianName && s.guardian === parsed.guardianName) || 
                   s.id === targetId
            );
            parsed.tenantId = fresh.tenantId;
            parsed.tenantSubdomain = fresh.tenantSubdomain;
            parsed.tenantName = fresh.tenantName;
          }
        }
        setUser(parsed);

        // Sync active tenant if user belongs to a specific institution
        if (parsed.tenantSubdomain) {
          const t = getTenantBySubdomain(parsed.tenantSubdomain);
          setActiveTenantState(t);
          setStoredActiveTenant(t);
        }
      }
    } catch (err) {
      console.error('Error loading stored user:', err);
    }
  }, []);

  const switchTenant = (subdomainOrId: string) => {
    const t = getTenantBySubdomain(subdomainOrId);
    setActiveTenantState(t);
    setStoredActiveTenant(t);

    // If logged in as school admin, update user's tenant info too
    if (user && user.role === UserRole.SCHOOL_ADMIN) {
      const updated: User = {
        ...user,
        tenantId: t.id,
        tenantName: t.name,
        tenantSubdomain: t.subdomain,
        institutionType: t.type,
        name: t.principalName || user.name,
        email: t.contactEmail || `principal@${t.subdomain}.edu.bd`
      };
      setUser(updated);
      localStorage.setItem('saas_user', JSON.stringify(updated));
    }
  };

  /**
   * School Admin login handler for Smart Amar School login portal
   */
  const loginAsSchoolAdmin = (tenantSubdomainOrId?: string, customData?: Partial<User>) => {
    const tenant = tenantSubdomainOrId ? getTenantBySubdomain(tenantSubdomainOrId) : activeTenant;
    setActiveTenantState(tenant);
    setStoredActiveTenant(tenant);

    const adminUser: User = {
      id: `SCH-${tenant.id}`,
      name: tenant.principalName || `Principal (${tenant.name})`,
      email: tenant.contactEmail || `principal@${tenant.subdomain}.edu.bd`,
      role: UserRole.SCHOOL_ADMIN,
      tenantId: tenant.id,
      tenantName: tenant.name,
      tenantSubdomain: tenant.subdomain,
      institutionType: tenant.type,
      ...customData
    };

    setUser(adminUser);
    localStorage.setItem('saas_user', JSON.stringify(adminUser));
    return {
      success: true,
      message: `স্বাগতম! আপনি ${tenant.name}-এর প্রতিষ্ঠান প্রধান (School Admin) হিসেবে লগইন করেছেন।`,
      user: adminUser
    };
  };

  /**
   * General login fallback (Super Admin or School Admin)
   */
  const login = (roleKey: string, customData?: Partial<User>) => {
    let mockUser: User | null = null;
    const tenant = activeTenant || DEFAULT_TENANTS[0];

    switch (roleKey.toLowerCase()) {
      case 'superadmin':
        mockUser = { 
          id: 'ADM-001', 
          name: 'Super Admin', 
          email: 'admin@demo.com', 
          role: UserRole.SUPER_ADMIN 
        };
        break;
      case 'schooladmin':
        mockUser = { 
          id: `SCH-${tenant.id}`, 
          name: tenant.principalName || 'Principal Rafiq', 
          email: tenant.contactEmail || 'principal@school.edu', 
          role: UserRole.SCHOOL_ADMIN,
          tenantId: tenant.id,
          tenantName: tenant.name,
          tenantSubdomain: tenant.subdomain,
          institutionType: tenant.type
        };
        break;
      case 'teacher':
        mockUser = { 
          id: 'EMP-001', 
          name: 'Abdul Jabbar', 
          email: 'abdul@school.edu', 
          role: UserRole.TEACHER,
          tenantId: tenant.id,
          tenantName: tenant.name,
          tenantSubdomain: tenant.subdomain
        };
        break;
      default:
        mockUser = null;
    }

    if (customData) {
      mockUser = { ...mockUser, ...customData } as User;
    }

    if (mockUser) {
      setUser(mockUser);
      localStorage.setItem('saas_user', JSON.stringify(mockUser));
    }
  };

  /**
   * Authenticates a student using Student ID, Roll No, or Email
   * Strictly enforces that student belongs to expectedSubdomain!
   */
  const loginAsStudent = (identifier: string, passwordOrPin?: string, expectedSubdomain?: string) => {
    // If called without expectedSubdomain, student cannot log in from central page
    if (!expectedSubdomain) {
      return { 
        success: false, 
        message: 'সেন্ট্রাল Smart Amar School পেজ থেকে শিক্ষার্থী লগইন অনুমোদিত নয়। অনুগ্রহ করে আপনার প্রতিষ্ঠানের ওয়েবসাইট লিংক থেকে লগইন করুন।' 
      };
    }

    const cleanId = (identifier || '').trim().toLowerCase();
    if (!cleanId) {
      return { success: false, message: 'Please enter your Student ID or Roll Number' };
    }

    const students = getStoredStudents();
    const currentTenant = getTenantBySubdomain(expectedSubdomain);

    // Fuzzy matching against ID, Roll, Email, or Name
    const found = students.find(s => 
      s.id.toLowerCase() === cleanId ||
      s.id.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanId.replace(/[^a-z0-9]/g, '') ||
      s.rollNo.toString().toLowerCase() === cleanId ||
      (s.email && s.email.toLowerCase() === cleanId) ||
      (s.phone && s.phone.replace(/[^0-9]/g, '').endsWith(cleanId.replace(/[^0-9]/g, '')))
    );

    if (!found) {
      return { 
        success: false, 
        message: `No student found matching "${identifier}" in ${currentTenant.name}. Please check ID or Roll number.` 
      };
    }

    // STRICT CHECK: Does student belong to this institution?
    const studentSubdomain = (found.tenantSubdomain || '').toLowerCase();
    const targetSubdomain = expectedSubdomain.toLowerCase();

    if (studentSubdomain && studentSubdomain !== targetSubdomain) {
      const studentTenant = getTenantBySubdomain(studentSubdomain);
      return {
        success: false,
        message: `এই শিক্ষার্থী "${studentTenant.name}" প্রতিষ্ঠানের অন্তর্ভুক্ত! আপনি "${currentTenant.name}" থেকে লগইন করতে পারবেন না। অনুগ্রহ করে "${studentTenant.name}" এর নিজস্ব ওয়েবসাইট থেকে লগইন করুন।`
      };
    }

    if (found.status === 'Suspended') {
      return {
        success: false,
        message: 'Account is temporarily suspended. Please contact the school administrative office.'
      };
    }

    const studentUser: User = {
      id: found.id,
      name: found.name,
      email: found.email || `${found.name.toLowerCase().replace(/\s+/g, '')}@student.${currentTenant.subdomain}.edu.bd`,
      role: UserRole.STUDENT,
      avatar: found.imageUrl,
      phone: found.phone,
      studentId: found.id,
      studentData: found,
      guardianName: found.guardian,
      guardianPhone: found.phone,
      studentClass: found.class,
      studentSection: found.section,
      studentRoll: found.rollNo,
      tenantId: currentTenant.id,
      tenantName: currentTenant.name,
      tenantSubdomain: currentTenant.subdomain,
      institutionType: currentTenant.type
    };

    setActiveTenantState(currentTenant);
    setStoredActiveTenant(currentTenant);
    setUser(studentUser);
    localStorage.setItem('saas_user', JSON.stringify(studentUser));
    return { success: true, message: `Welcome back, ${found.name}! (${currentTenant.name})`, user: studentUser };
  };

  /**
   * Authenticates a parent using Guardian Phone Number or Student ID
   * Strictly enforces that parent belongs to expectedSubdomain!
   */
  const loginAsParent = (phoneOrStudentId: string, passwordOrPin?: string, expectedSubdomain?: string) => {
    if (!expectedSubdomain) {
      return { 
        success: false, 
        message: 'সেন্ট্রাল Smart Amar School পেজ থেকে অভিভাবক লগইন অনুমোদিত নয়। অনুগ্রহ করে আপনার প্রতিষ্ঠানের ওয়েবসাইট লিংক থেকে লগইন করুন।' 
      };
    }

    const cleanInput = (phoneOrStudentId || '').trim().toLowerCase();
    if (!cleanInput) {
      return { success: false, message: 'Please enter registered Guardian Mobile or Student ID' };
    }

    const currentTenant = getTenantBySubdomain(expectedSubdomain);
    const targetSubdomain = expectedSubdomain.toLowerCase();
    const students = getStoredStudents();
    const cleanDigits = cleanInput.replace(/[^0-9]/g, '');

    // Check if input is a guardian phone number or matches a child
    let matchedChildren = students.filter(s => {
      const sDigits = (s.phone || '').replace(/[^0-9]/g, '');
      const isPhoneMatch = cleanDigits.length >= 7 && (sDigits.includes(cleanDigits) || cleanDigits.includes(sDigits));
      const isIdMatch = s.id.toLowerCase() === cleanInput || s.id.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanInput;
      return isPhoneMatch || isIdMatch;
    });

    if (matchedChildren.length === 0) {
      matchedChildren = students.filter(s => (s.guardian || '').toLowerCase().includes(cleanInput));
    }

    if (matchedChildren.length === 0) {
      return {
        success: false,
        message: `No student records found linked to "${phoneOrStudentId}". Please verify your registered number.`
      };
    }

    // STRICT CHECK: Filter children belonging to THIS institution
    const institutionChildren = matchedChildren.filter(
      c => (c.tenantSubdomain || '').toLowerCase() === targetSubdomain
    );

    if (institutionChildren.length === 0) {
      const otherTenant = getTenantBySubdomain(matchedChildren[0].tenantSubdomain);
      return {
        success: false,
        message: `এই অভিভাবক অ্যাকাউন্টটি "${otherTenant.name}" প্রতিষ্ঠানের অন্তর্ভুক্ত! আপনি "${currentTenant.name}" থেকে লগইন করতে পারবেন না। অনুগ্রহ করে "${otherTenant.name}" এর নিজস্ব পোর্টাল লিংক থেকে লগইন করুন।`
      };
    }

    const primaryChild = institutionChildren[0];
    const guardianName = primaryChild.guardian || `Parent of ${primaryChild.name}`;

    const parentUser: User = {
      id: `PAR-${primaryChild.id}`,
      name: guardianName,
      email: `guardian.${primaryChild.name.toLowerCase().replace(/\s+/g, '')}@parent.${currentTenant.subdomain}.edu.bd`,
      role: UserRole.PARENT,
      avatar: primaryChild.guardianImageUrl,
      phone: primaryChild.phone || phoneOrStudentId,
      guardianName: guardianName,
      guardianPhone: primaryChild.phone,
      studentId: primaryChild.id,
      activeChildId: primaryChild.id,
      studentData: primaryChild,
      allChildren: institutionChildren,
      tenantId: currentTenant.id,
      tenantName: currentTenant.name,
      tenantSubdomain: currentTenant.subdomain,
      institutionType: currentTenant.type
    };

    setActiveTenantState(currentTenant);
    setStoredActiveTenant(currentTenant);
    setUser(parentUser);
    localStorage.setItem('saas_user', JSON.stringify(parentUser));
    return { 
      success: true, 
      message: `Welcome, ${guardianName}! (${currentTenant.name})`, 
      user: parentUser 
    };
  };

  /**
   * Authenticates a teacher using Email, Phone or Teacher ID
   * Strictly enforces that teacher belongs to expectedSubdomain!
   */
  const loginAsTeacher = (emailOrId: string, password?: string, expectedSubdomain?: string) => {
    if (!expectedSubdomain) {
      return { 
        success: false, 
        message: 'সেন্ট্রাল Smart Amar School পেজ থেকে শিক্ষক লগইন অনুমোদিত নয়। অনুগ্রহ করে আপনার প্রতিষ্ঠানের ওয়েবসাইট লিংক থেকে লগইন করুন।' 
      };
    }

    const cleanInput = (emailOrId || '').trim().toLowerCase();
    if (!cleanInput) {
      return { success: false, message: 'Please enter your Teacher Email or ID' };
    }

    const currentTenant = getTenantBySubdomain(expectedSubdomain);
    const targetSubdomain = expectedSubdomain.toLowerCase();

    // Find teacher in MOCK_STAFF
    const foundStaff = MOCK_STAFF.find(
      s => s.id.toLowerCase() === cleanInput ||
           (s.email && s.email.toLowerCase() === cleanInput) ||
           s.name.toLowerCase().includes(cleanInput) ||
           s.phone.replace(/[^0-9]/g, '').endsWith(cleanInput.replace(/[^0-9]/g, ''))
    );

    if (!foundStaff) {
      return {
        success: false,
        message: `No teacher record found matching "${emailOrId}" in ${currentTenant.name}.`
      };
    }

    // STRICT CHECK: Does teacher belong to this institution?
    const staffSubdomain = (foundStaff.tenantSubdomain || '').toLowerCase();
    if (staffSubdomain && staffSubdomain !== targetSubdomain) {
      const otherTenant = getTenantBySubdomain(staffSubdomain);
      return {
        success: false,
        message: `এই শিক্ষক অ্যাকাউন্টটি "${otherTenant.name}" প্রতিষ্ঠানের অন্তর্ভুক্ত! আপনি "${currentTenant.name}" থেকে লগইন করতে পারবেন না। অনুগ্রহ করে "${otherTenant.name}" এর নিজস্ব পোর্টাল থেকে লগইন করুন।`
      };
    }

    const teacherUser: User = {
      id: foundStaff.id,
      name: foundStaff.name,
      email: foundStaff.email || `${foundStaff.name.toLowerCase().replace(/\s+/g, '')}@${currentTenant.subdomain}.edu.bd`,
      role: UserRole.TEACHER,
      avatar: foundStaff.imageUrl,
      phone: foundStaff.phone,
      tenantId: currentTenant.id,
      tenantName: currentTenant.name,
      tenantSubdomain: currentTenant.subdomain,
      institutionType: currentTenant.type
    };

    setActiveTenantState(currentTenant);
    setStoredActiveTenant(currentTenant);
    setUser(teacherUser);
    localStorage.setItem('saas_user', JSON.stringify(teacherUser));
    return {
      success: true,
      message: `Welcome, ${foundStaff.name}! (${currentTenant.name})`,
      user: teacherUser
    };
  };

  /**
   * Switches the active student being viewed by a parent with multiple children
   */
  const switchActiveChild = (childStudentId: string) => {
    if (!user || user.role !== UserRole.PARENT) return;

    const students = getStoredStudents();
    const newChild = students.find(s => s.id === childStudentId);
    if (!newChild) return;

    const updatedUser: User = {
      ...user,
      studentId: newChild.id,
      activeChildId: newChild.id,
      studentData: newChild
    };

    setUser(updatedUser);
    localStorage.setItem('saas_user', JSON.stringify(updatedUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('saas_user');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      activeTenant,
      switchTenant,
      login, 
      loginAsStudent, 
      loginAsParent, 
      loginAsTeacher,
      loginAsSchoolAdmin,
      switchActiveChild, 
      logout, 
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
