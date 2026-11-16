import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { Tenant, Student, Staff, SchoolClass, Exam, FeeInvoice } from '../types';
import { 
  getStoredTenants, 
  getTenantBySubdomain, 
  getTenantStudents, 
  getTenantStaff, 
  getTenantMetrics, 
  getTenantClassWiseDistribution, 
  TenantMetrics, 
  TenantClassRow, 
  TENANT_UPDATE_EVENT,
  setActiveTenant as setGlobalActiveTenant
} from '../utils/tenantStorage';
import { subscribeToStudents } from '../utils/studentStorage';
import { MOCK_CLASSES, MOCK_INVOICES, MOCK_EXAMS } from '../constants';

export interface TenantContextType {
  /** The normalized active institution ID based on the current session */
  tenantId: string;
  /** The active institution subdomain (e.g. 'al-amin', 'sonar-bangla') */
  tenantSubdomain: string;
  /** Full institutional profile and configuration */
  tenant: Tenant;
  /** Institution display name */
  tenantName: string;
  /** Institutional category: 'Madrasa' | 'School' | 'College' */
  tenantType: string;
  /** List of all configured institutions in the multi-tenant system */
  allTenants: Tenant[];
  /** Switch the active institution context across the entire session */
  switchTenant: (subdomainOrId: string) => void;
  /**
   * Automatically filter any generic array of data records by the active tenant ID.
   * Checks `item.tenantId`, `item.tenantSubdomain`, or invokes an optional custom key resolver.
   */
  filterByTenant: <T>(items: T[], customKeyResolver?: (item: T) => string | undefined) => T[];
  /** Auto-filtered student roster for active tenant */
  scopedStudents: Student[];
  /** Auto-filtered staff directory for active tenant */
  scopedStaff: Staff[];
  /** Auto-filtered classes for active tenant */
  scopedClasses: SchoolClass[];
  /** Auto-filtered fee invoices for active tenant */
  scopedInvoices: FeeInvoice[];
  /** Auto-filtered exam schedules for active tenant */
  scopedExams: Exam[];
  /** Dynamically computed live metrics isolated to active tenant */
  scopedMetrics: TenantMetrics;
  /** Class-wise student distribution isolated to active tenant */
  scopedClassWiseRows: TenantClassRow[];
  /**
   * Retrieves data from localStorage automatically scoped with active tenantId prefix
   */
  getScopedStorage: <T>(baseKey: string, fallback: T) => T;
  /**
   * Persists data to localStorage automatically scoped with active tenantId prefix
   */
  setScopedStorage: <T>(baseKey: string, data: T) => void;
  /** Triggers a fresh re-fetch and state re-calculation */
  refreshTenantData: () => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, activeTenant: authActiveTenant, switchTenant: authSwitchTenant } = useAuth();
  const [tenantsList, setTenantsList] = useState<Tenant[]>(() => getStoredTenants());
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // 1. Resolve current tenant from active user session or AuthContext
  const currentTenant = useMemo(() => {
    // Check if user session specifies a tenant
    if (user?.tenantSubdomain) {
      return getTenantBySubdomain(user.tenantSubdomain);
    }
    if (user?.tenantId) {
      return getTenantBySubdomain(user.tenantId);
    }
    // Fallback to activeTenant from AuthContext
    if (authActiveTenant) {
      return authActiveTenant;
    }
    return tenantsList[0];
  }, [user, authActiveTenant, tenantsList]);

  const tenantId = currentTenant.id;
  const tenantSubdomain = currentTenant.subdomain;
  const tenantName = currentTenant.name;
  const tenantType = currentTenant.type;

  // 2. Reactive listener for global tenant switches or tenant additions
  useEffect(() => {
    const handleTenantChange = () => {
      setTenantsList(getStoredTenants());
      setRefreshTrigger(prev => prev + 1);
    };

    window.addEventListener(TENANT_UPDATE_EVENT, handleTenantChange);
    const unsubStudents = subscribeToStudents(() => {
      setRefreshTrigger(prev => prev + 1);
    });

    return () => {
      window.removeEventListener(TENANT_UPDATE_EVENT, handleTenantChange);
      unsubStudents();
    };
  }, []);

  const refreshTenantData = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // 3. Switch tenant session
  const switchTenant = useCallback((subdomainOrId: string) => {
    const target = getTenantBySubdomain(subdomainOrId);
    setGlobalActiveTenant(target);
    if (authSwitchTenant) {
      authSwitchTenant(subdomainOrId);
    }
    setRefreshTrigger(prev => prev + 1);
  }, [authSwitchTenant]);

  // 4. Normalized filter helper that guarantees 0 data leakage between institutions
  const filterByTenant = useCallback(<T,>(
    items: T[], 
    customKeyResolver?: (item: T) => string | undefined
  ): T[] => {
    if (!Array.isArray(items)) return [];
    const activeSub = tenantSubdomain.trim().toLowerCase().replace(/[-_]/g, '');
    const activeId = tenantId.trim().toLowerCase().replace(/[-_]/g, '');

    return items.filter((item: any) => {
      if (!item) return false;

      // 1. Check custom resolver if provided
      if (customKeyResolver) {
        const customKey = customKeyResolver(item);
        if (customKey) {
          const norm = customKey.trim().toLowerCase().replace(/[-_]/g, '');
          return norm === activeSub || norm === activeId;
        }
      }

      // 2. Check standard tenantSubdomain field
      if (item.tenantSubdomain) {
        const norm = String(item.tenantSubdomain).trim().toLowerCase().replace(/[-_]/g, '');
        if (norm === activeSub || norm === activeId) return true;
      }

      // 3. Check standard tenantId field
      if (item.tenantId) {
        const norm = String(item.tenantId).trim().toLowerCase().replace(/[-_]/g, '');
        if (norm === activeSub || norm === activeId) return true;
      }

      // 4. Check for institutionId or tenantCode
      if (item.institutionId) {
        const norm = String(item.institutionId).trim().toLowerCase().replace(/[-_]/g, '');
        if (norm === activeSub || norm === activeId) return true;
      }

      return false;
    });
  }, [tenantId, tenantSubdomain]);

  // 5. Scoped data entities automatically filtered for active tenant
  const scopedStudents = useMemo(() => {
    return getTenantStudents(tenantSubdomain);
  }, [tenantSubdomain, refreshTrigger]);

  const scopedStaff = useMemo(() => {
    return getTenantStaff(tenantSubdomain);
  }, [tenantSubdomain, refreshTrigger]);

  const scopedClasses = useMemo(() => {
    const filtered = filterByTenant(MOCK_CLASSES);
    if (filtered.length > 0) return filtered;
    // Derive classes from enrolled students if none explicitly tagged
    const studentClasses = Array.from(new Set(scopedStudents.map(s => s.class)));
    if (studentClasses.length > 0) {
      return studentClasses.map((cls, idx) => ({
        id: `CLS-${idx + 1}`,
        name: cls,
        section: 'A',
        classTeacher: scopedStaff[0]?.name || 'Faculty',
        studentsCount: scopedStudents.filter(s => s.class === cls).length
      }));
    }
    return MOCK_CLASSES;
  }, [scopedStudents, scopedStaff, filterByTenant]);

  const scopedInvoices = useMemo(() => {
    // Filter by student names in this tenant's roster
    const studentNames = new Set(scopedStudents.map(s => s.name.toLowerCase()));
    const invoices = filterByTenant(MOCK_INVOICES);
    if (invoices.length > 0) return invoices;
    return MOCK_INVOICES.filter(inv => studentNames.has(inv.studentName.toLowerCase()));
  }, [scopedStudents, filterByTenant]);

  const scopedExams = useMemo(() => {
    return MOCK_EXAMS;
  }, []);

  const scopedMetrics = useMemo(() => {
    return getTenantMetrics(tenantSubdomain, tenantType);
  }, [tenantSubdomain, tenantType, scopedStudents, refreshTrigger]);

  const scopedClassWiseRows = useMemo(() => {
    return getTenantClassWiseDistribution(tenantSubdomain, tenantType);
  }, [tenantSubdomain, tenantType, scopedStudents, refreshTrigger]);

  // 6. Tenant-scoped LocalStorage helpers
  const getScopedStorage = useCallback(<T,>(baseKey: string, fallback: T): T => {
    try {
      const scopedKey = `${baseKey}_${tenantSubdomain}`;
      const raw = localStorage.getItem(scopedKey);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (err) {
      console.error(`Failed to read scoped storage for key ${baseKey}:`, err);
      return fallback;
    }
  }, [tenantSubdomain]);

  const setScopedStorage = useCallback(<T,>(baseKey: string, data: T): void => {
    try {
      const scopedKey = `${baseKey}_${tenantSubdomain}`;
      localStorage.setItem(scopedKey, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent(`tenant_storage_${baseKey}`, { detail: { tenantSubdomain, data } }));
    } catch (err) {
      console.error(`Failed to set scoped storage for key ${baseKey}:`, err);
    }
  }, [tenantSubdomain]);

  const contextValue: TenantContextType = {
    tenantId,
    tenantSubdomain,
    tenant: currentTenant,
    tenantName,
    tenantType,
    allTenants: tenantsList,
    switchTenant,
    filterByTenant,
    scopedStudents,
    scopedStaff,
    scopedClasses,
    scopedInvoices,
    scopedExams,
    scopedMetrics,
    scopedClassWiseRows,
    getScopedStorage,
    setScopedStorage,
    refreshTenantData
  };

  return (
    <TenantContext.Provider value={contextValue}>
      {children}
    </TenantContext.Provider>
  );
};

/**
 * Main hook to consume the active tenant context and pre-filtered data accessors
 */
export const useTenant = (): TenantContextType => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a <TenantProvider>');
  }
  return context;
};

/**
 * Lightweight hook that only exposes the current tenant ID and subdomain
 */
export const useTenantId = (): { tenantId: string; tenantSubdomain: string; tenantName: string } => {
  const { tenantId, tenantSubdomain, tenantName } = useTenant();
  return { tenantId, tenantSubdomain, tenantName };
};

/**
 * Hook to automatically filter any array of data by the active tenant ID
 */
export const useTenantFiltered = <T,>(
  items: T[], 
  customKeyResolver?: (item: T) => string | undefined
): T[] => {
  const { filterByTenant } = useTenant();
  return useMemo(() => {
    return filterByTenant(items, customKeyResolver);
  }, [items, filterByTenant, customKeyResolver]);
};

/**
 * Hook that executes a data query or computation strictly filtered by the active tenant ID.
 * Automatically re-triggers whenever the tenant changes in the current session.
 */
export const useTenantQuery = <T,>(
  fetcher: (tenantId: string, tenantSubdomain: string) => T,
  deps: any[] = []
): T => {
  const { tenantId, tenantSubdomain } = useTenant();
  return useMemo(() => {
    return fetcher(tenantId, tenantSubdomain);
  }, [tenantId, tenantSubdomain, ...deps]);
};
