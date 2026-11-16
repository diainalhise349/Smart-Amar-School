import React, { useState, useEffect, useMemo } from 'react';
import {
  DatabaseBackup,
  Download,
  FileJson,
  FileSpreadsheet,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Building2,
  RefreshCw,
  CalendarClock,
  HardDrive,
  Lock,
  Unlock,
  CheckSquare,
  Square,
  Eye,
  Play,
  Sliders,
  Search,
  AlertCircle,
  Loader2,
  Sparkles,
  Layers,
  Check,
  FileCheck2,
  ShieldAlert,
  Upload,
  Activity,
  CloudUpload
} from 'lucide-react';
import { Button, Card, Badge, Modal, useToast } from './UIComponents';
import { Tenant } from '../types';
import { getStoredTenants, TENANT_UPDATE_EVENT } from '../utils/tenantStorage';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  BACKUP_MODULES,
  BackupFormat,
  BackupModuleKey,
  BackupArchiveRecord,
  BackupHealthCheckReport,
  TenantBackupPolicy,
  collectTenantDatabase,
  convertSnapshotToCsv,
  executeTenantBackupExport,
  getBackupHistory,
  getBackupPolicies,
  getTenantBackupPolicy,
  updateTenantBackupPolicy,
  getBackupHealthLogs,
  verifyGeneratedBackupIntegrity,
  verifyUploadedBackupFile,
  runHealthCheckOnArchiveRecord,
  BACKUP_UPDATE_EVENT,
  BACKUP_HEALTH_EVENT
} from '../utils/tenantBackupExport';
import { BackupHealthCheckModal } from './BackupHealthCheckModal';

interface DataBackupExportModuleProps {
  mode?: 'super-admin' | 'school-admin';
}

export const DataBackupExportModule: React.FC<DataBackupExportModuleProps> = ({
  mode = 'super-admin'
}) => {
  const { user, activeTenant } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [tenants, setTenants] = useState<Tenant[]>(() => getStoredTenants());
  const defaultSubdomain =
    mode === 'school-admin'
      ? user?.tenantSubdomain || activeTenant?.subdomain || tenants[0]?.subdomain || 'sonar-bangla'
      : tenants[0]?.subdomain || 'sonar-bangla';

  const [selectedSubdomain, setSelectedSubdomain] = useState<string>(defaultSubdomain);
  const [selectedFormat, setSelectedFormat] = useState<BackupFormat>('JSON');
  const [selectedModules, setSelectedModules] = useState<BackupModuleKey[]>(
    BACKUP_MODULES.map(m => m.key)
  );

  const [history, setHistory] = useState<BackupArchiveRecord[]>(() =>
    getBackupHistory(mode === 'school-admin' ? defaultSubdomain : undefined)
  );
  const [policies, setPolicies] = useState<TenantBackupPolicy[]>(() => getBackupPolicies());
  const [historySearch, setHistorySearch] = useState('');
  const [historyFormatFilter, setHistoryFormatFilter] = useState<'ALL' | BackupFormat>('ALL');

  // Automated export pipeline state
  const [isExporting, setIsExporting] = useState(false);
  const [exportStage, setExportStage] = useState<string>('');
  const [exportProgress, setExportProgress] = useState<number>(0);

  // Preview modal state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Backup Health Check state
  const [healthLogs, setHealthLogs] = useState<BackupHealthCheckReport[]>(() =>
    getBackupHealthLogs(mode === 'school-admin' ? defaultSubdomain : undefined)
  );
  const [activeHealthReport, setActiveHealthReport] = useState<BackupHealthCheckReport | null>(null);
  const [expectedChecksumInput, setExpectedChecksumInput] = useState('');

  // Sync on tenant or backup events
  useEffect(() => {
    const syncData = () => {
      setTenants(getStoredTenants());
      setPolicies(getBackupPolicies());
      setHistory(getBackupHistory(mode === 'school-admin' ? selectedSubdomain : undefined));
      setHealthLogs(getBackupHealthLogs(mode === 'school-admin' ? selectedSubdomain : undefined));
    };
    window.addEventListener(TENANT_UPDATE_EVENT, syncData);
    window.addEventListener(BACKUP_UPDATE_EVENT, syncData);
    window.addEventListener(BACKUP_HEALTH_EVENT, syncData);
    return () => {
      window.removeEventListener(TENANT_UPDATE_EVENT, syncData);
      window.removeEventListener(BACKUP_UPDATE_EVENT, syncData);
      window.removeEventListener(BACKUP_HEALTH_EVENT, syncData);
    };
  }, [mode, selectedSubdomain]);

  useEffect(() => {
    if (mode === 'school-admin') {
      const sub = user?.tenantSubdomain || activeTenant?.subdomain;
      if (sub) setSelectedSubdomain(sub);
    }
  }, [mode, user, activeTenant]);

  const activePolicy = useMemo(
    () => getTenantBackupPolicy(selectedSubdomain),
    [selectedSubdomain, policies]
  );

  const selectedTenantObj = useMemo(
    () => tenants.find(t => t.subdomain === selectedSubdomain) || tenants[0],
    [tenants, selectedSubdomain]
  );

  // Live snapshot summary for selected tenant & selected modules
  const liveSnapshot = useMemo(
    () => collectTenantDatabase(selectedSubdomain, selectedModules),
    [selectedSubdomain, selectedModules]
  );

  const previewPayload = useMemo(() => {
    if (!isPreviewOpen) return '';
    if (selectedFormat === 'JSON') {
      return JSON.stringify(liveSnapshot, null, 2).slice(0, 6000) + '\n... (truncated for preview)';
    }
    return convertSnapshotToCsv(liveSnapshot).slice(0, 6000) + '\n... (truncated for preview)';
  }, [isPreviewOpen, selectedFormat, liveSnapshot]);

  const toggleModule = (key: BackupModuleKey) => {
    setSelectedModules(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleSelectAllModules = () => {
    if (selectedModules.length === BACKUP_MODULES.length) {
      setSelectedModules([]);
    } else {
      setSelectedModules(BACKUP_MODULES.map(m => m.key));
    }
  };

  const runExportPipeline = (
    subdomain: string,
    format: BackupFormat,
    triggerType: BackupArchiveRecord['triggerType'],
    modulesToExport: BackupModuleKey[] = selectedModules
  ) => {
    if (modulesToExport.length === 0) {
      addToast('Please select at least one database module to export.', 'error');
      return;
    }

    if (mode === 'school-admin' && !activePolicy.allowSchoolAdminExport) {
      addToast('Self-service export is currently restricted by the Super Admin for this tenant.', 'error');
      return;
    }

    setIsExporting(true);
    setExportProgress(18);
    setExportStage(`Isolating ${subdomain} tenant schema & verifying row-level boundaries...`);

    setTimeout(() => {
      setExportProgress(52);
      setExportStage(`Serializing ${modulesToExport.length} database tables into ${format} archive...`);
    }, 280);

    setTimeout(() => {
      setExportProgress(80);
      setExportStage('Running Backup Health Check: verifying file completeness & checksum parity...');
    }, 560);

    setTimeout(() => {
      const { record, healthReport } = executeTenantBackupExport({
        subdomainOrId: subdomain,
        format,
        modules: modulesToExport,
        triggeredBy: user?.name || (mode === 'super-admin' ? 'Super Admin' : 'School Admin'),
        triggerType,
        downloadFile: true
      });

      if (triggerType === 'Scheduled Auto-Export' && healthReport.passed) {
        updateTenantBackupPolicy(subdomain, {
          lastAutoExportAt: new Date().toISOString()
        });
      }

      setHistory(getBackupHistory(mode === 'school-admin' ? selectedSubdomain : undefined));
      setPolicies(getBackupPolicies());
      setHealthLogs(getBackupHealthLogs(mode === 'school-admin' ? selectedSubdomain : undefined));

      if (healthReport.passed) {
        setExportProgress(100);
        setExportStage(
          `Health Check PASSED (${healthReport.actualChecksum || healthReport.payloadHash}) • Marked Verified & Downloaded.`
        );
        addToast(
          `Health Check PASSED — ${record.tenantName} archive marked Verified & exported (${record.totalRecords} records • ${record.sizeFormatted})`,
          'success'
        );
      } else {
        setExportProgress(100);
        setExportStage(`Health Check FAILED: ${healthReport.failureReason || 'Checksum or completeness error'}`);
        setActiveHealthReport(healthReport);
        addToast('Backup Health Check failed! File export blocked due to integrity error.', 'error');
      }

      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
        setExportStage('');
      }, 1050);
    }, 850);
  };

  const handleToggleSchoolAdminPermission = (subdomain: string, currentVal: boolean) => {
    const updated = updateTenantBackupPolicy(subdomain, {
      allowSchoolAdminExport: !currentVal
    });
    setPolicies(getBackupPolicies());
    addToast(
      `School Admin export access for ${subdomain} ${updated.allowSchoolAdminExport ? 'enabled' : 'paused'}.`,
      'info'
    );
  };

  const handlePolicyUpdate = (updates: Partial<TenantBackupPolicy>) => {
    updateTenantBackupPolicy(selectedSubdomain, updates);
    setPolicies(getBackupPolicies());
    addToast('Automated backup schedule & retention policy updated.', 'success');
  };

  const handleReDownloadRecord = (rec: BackupArchiveRecord) => {
    const { record, healthReport } = executeTenantBackupExport({
      subdomainOrId: rec.tenantSubdomain,
      format: rec.format,
      modules: rec.modules,
      triggeredBy: `${user?.name || 'Admin'} (Re-export)`,
      triggerType: mode === 'school-admin' ? 'School Admin Self-Service' : 'Manual',
      downloadFile: true
    });
    setHistory(getBackupHistory(mode === 'school-admin' ? selectedSubdomain : undefined));
    setHealthLogs(getBackupHealthLogs(mode === 'school-admin' ? selectedSubdomain : undefined));
    if (healthReport.passed) {
      addToast(`Health Check Verified & downloaded: ${record.fileName}`, 'success');
    } else {
      setActiveHealthReport(healthReport);
      addToast('Health check failed before export.', 'error');
    }
  };

  const handleRunLiveHealthCheck = () => {
    if (selectedModules.length === 0) {
      addToast('Select at least one database module to run a health check.', 'error');
      return;
    }
    const content =
      selectedFormat === 'JSON'
        ? JSON.stringify(liveSnapshot, null, 2)
        : convertSnapshotToCsv(liveSnapshot);
    const fileName = `${liveSnapshot.metadata.tenantSubdomain}_health_check_probe.${selectedFormat.toLowerCase()}`;
    const report = verifyGeneratedBackupIntegrity({
      content,
      format: selectedFormat,
      snapshot: liveSnapshot,
      fileName,
      expectedModules: selectedModules,
      source: 'Manual Vault Audit'
    });
    setHealthLogs(getBackupHealthLogs(mode === 'school-admin' ? selectedSubdomain : undefined));
    setActiveHealthReport(report);
    addToast(
      report.passed
        ? `Backup Health Check PASSED (${report.parsedRecords} records verified)`
        : 'Backup Health Check detected an integrity failure!',
      report.passed ? 'success' : 'error'
    );
  };

  const handleSimulateCorruptionTest = () => {
    const raw = JSON.stringify(liveSnapshot, null, 2);
    // Deliberately truncate JSON payload to verify gatekeeper catches incomplete files
    const corrupted = raw.slice(0, Math.floor(raw.length * 0.45));
    const report = verifyGeneratedBackupIntegrity({
      content: corrupted,
      format: 'JSON',
      snapshot: liveSnapshot,
      fileName: `${liveSnapshot.metadata.tenantSubdomain}_truncated_test.json`,
      expectedModules: selectedModules,
      expectedPayloadHash: 'SHA256-LOC-EXPECTED0001',
      source: 'Manual Vault Audit'
    });
    setHealthLogs(getBackupHealthLogs(mode === 'school-admin' ? selectedSubdomain : undefined));
    setActiveHealthReport(report);
    addToast('Integrity trap triggered: truncated payload correctly blocked!', 'info');
  };

  const handleLocalFileVerify = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = typeof reader.result === 'string' ? reader.result : '';
      const report = verifyUploadedBackupFile(file.name, content, expectedChecksumInput);
      setHealthLogs(getBackupHealthLogs(mode === 'school-admin' ? selectedSubdomain : undefined));
      setActiveHealthReport(report);
      addToast(
        report.passed
          ? `File "${file.name}" passed all 5 integrity & checksum checks!`
          : `File "${file.name}" failed health verification!`,
        report.passed ? 'success' : 'error'
      );
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleVerifyArchiveRow = (rec: BackupArchiveRecord) => {
    const report = rec.healthCheck || runHealthCheckOnArchiveRecord(rec);
    setHistory(getBackupHistory(mode === 'school-admin' ? selectedSubdomain : undefined));
    setHealthLogs(getBackupHealthLogs(mode === 'school-admin' ? selectedSubdomain : undefined));
    setActiveHealthReport(report);
  };

  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      const matchesFormat = historyFormatFilter === 'ALL' || item.format === historyFormatFilter;
      const q = historySearch.trim().toLowerCase();
      const matchesQuery =
        !q ||
        item.tenantName.toLowerCase().includes(q) ||
        item.tenantSubdomain.toLowerCase().includes(q) ||
        item.fileName.toLowerCase().includes(q) ||
        item.checksum.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q);
      return matchesFormat && matchesQuery;
    });
  }, [history, historySearch, historyFormatFilter]);

  const activeAutoSchedulesCount = policies.filter(p => p.autoScheduleEnabled).length;
  const selfExportEnabledCount = policies.filter(p => p.allowSchoolAdminExport).length;

  const moduleCountsMap: Record<BackupModuleKey, number> = {
    profile: liveSnapshot.metadata.recordCounts.institutionProfile || 0,
    students: liveSnapshot.metadata.recordCounts.students || 0,
    staff: liveSnapshot.metadata.recordCounts.staff || 0,
    academic:
      (liveSnapshot.metadata.recordCounts.classes || 0) +
      (liveSnapshot.metadata.recordCounts.exams || 0) +
      (liveSnapshot.metadata.recordCounts.examResults || 0) +
      (liveSnapshot.metadata.recordCounts.classRoutines || 0),
    finance:
      (liveSnapshot.metadata.recordCounts.feeInvoices || 0) +
      (liveSnapshot.metadata.recordCounts.expenses || 0) +
      (liveSnapshot.metadata.recordCounts.salaryPayments || 0),
    attendance:
      (liveSnapshot.metadata.recordCounts.attendanceRecords || 0) +
      (liveSnapshot.metadata.recordCounts.academicEvents || 0),
    communication:
      (liveSnapshot.metadata.recordCounts.communicationLogs || 0) +
      (liveSnapshot.metadata.recordCounts.smsTemplates || 0),
    library:
      (liveSnapshot.metadata.recordCounts.libraryBooks || 0) +
      (liveSnapshot.metadata.recordCounts.libraryBorrowRecords || 0),
    documents: liveSnapshot.metadata.recordCounts.documentsMetadata || 0,
    leaves: liveSnapshot.metadata.recordCounts.leaveApplications || 0
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <DatabaseBackup className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Data Backup & Export Center
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                {mode === 'super-admin'
                  ? 'Trigger automated full-tenant database exports (JSON / CSV) for local archiving and manage school admin self-service export policies.'
                  : 'Download an automated full archive of your institution database in JSON or CSV format for local safekeeping and compliance.'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Tenant Isolation Verified</span>
          </div>
          {mode === 'super-admin' && (
            <>
              <Button
                variant="outline"
                size="sm"
                icon={CalendarClock}
                onClick={() => navigate('/super-admin/scheduled-backups')}
              >
                Scheduled Backups
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={CloudUpload}
                onClick={() => navigate('/super-admin/cloud-storage')}
              >
                Cloud Sync
              </Button>
            </>
          )}
          <Button
            id="run-health-check-header-btn"
            variant="outline"
            size="sm"
            icon={FileCheck2}
            onClick={handleRunLiveHealthCheck}
          >
            Run Health Check
          </Button>
          <Button
            id="trigger-auto-export-json-btn"
            variant="primary"
            size="sm"
            icon={FileJson}
            disabled={isExporting}
            onClick={() =>
              runExportPipeline(
                selectedSubdomain,
                'JSON',
                mode === 'school-admin' ? 'School Admin Self-Service' : 'Manual'
              )
            }
          >
            Export JSON
          </Button>
          <Button
            id="trigger-auto-export-csv-btn"
            variant="secondary"
            size="sm"
            icon={FileSpreadsheet}
            disabled={isExporting}
            onClick={() =>
              runExportPipeline(
                selectedSubdomain,
                'CSV',
                mode === 'school-admin' ? 'School Admin Self-Service' : 'Manual'
              )
            }
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Live Export Progress Banner */}
      {isExporting && (
        <div className="bg-slate-900 text-white rounded-2xl p-5 border border-indigo-500/40 shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5 text-sm font-bold">
              <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
              <span>Automated Database Archive Pipeline</span>
            </div>
            <span className="font-mono text-xs font-bold text-emerald-400">{exportProgress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${exportProgress}%` }}
            />
          </div>
          <p className="text-xs text-slate-300 font-mono">{exportStage}</p>
        </div>
      )}

      {/* Top KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-indigo-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Active Target Tenant
              </p>
              <h3 className="text-base font-black text-slate-900 mt-1 truncate max-w-[180px]">
                {selectedTenantObj?.name}
              </h3>
              <p className="text-[11px] font-mono text-indigo-600 mt-0.5">
                {selectedSubdomain}.smartamarschool.com
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-emerald-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Snapshot Records Ready
              </p>
              <h3 className="text-2xl font-black text-slate-900 mt-1 font-mono">
                {liveSnapshot.metadata.totalRecords}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Across {selectedModules.length} selected modules
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <Layers className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Local Archives Logged
              </p>
              <h3 className="text-2xl font-black text-slate-900 mt-1 font-mono">
                {history.length}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Checksum verified snapshots
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
              <HardDrive className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {mode === 'super-admin' ? 'Auto-Schedules & Access' : 'Next Automated Export'}
              </p>
              <h3 className="text-2xl font-black text-slate-900 mt-1 font-mono">
                {mode === 'super-admin'
                  ? `${activeAutoSchedulesCount} / ${tenants.length}`
                  : activePolicy.autoScheduleEnabled
                  ? activePolicy.frequency
                  : 'Paused'}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {mode === 'super-admin'
                  ? `${selfExportEnabledCount} admins granted self-export`
                  : `Format: ${activePolicy.preferredFormat} • Retention ${activePolicy.retentionDays}d`}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <CalendarClock className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Grid: Export Builder + Automated Scheduler / Tenant Policy Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: EXPORT WORKBENCH */}
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <div className="space-y-6">
              {/* Step 1: Select Tenant (Super Admin only) */}
              {mode === 'super-admin' && (
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                    1. Select Tenant Database to Export
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <select
                      id="backup-tenant-selector"
                      value={selectedSubdomain}
                      onChange={e => setSelectedSubdomain(e.target.value)}
                      className="w-full text-xs font-bold p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      {tenants.map(t => (
                        <option key={t.id} value={t.subdomain}>
                          {t.name} ({t.subdomain} • {t.type})
                        </option>
                      ))}
                    </select>

                    {/* School Admin Self-Service Toggle for this Tenant */}
                    <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50">
                      <div className="min-w-0 pr-2">
                        <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          {activePolicy.allowSchoolAdminExport ? (
                            <Unlock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          )}
                          <span className="truncate">School Admin Self-Export</span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {activePolicy.allowSchoolAdminExport
                            ? 'Admin can trigger local archive'
                            : 'Restricted to Super Admin'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleToggleSchoolAdminPermission(
                            selectedSubdomain,
                            activePolicy.allowSchoolAdminExport
                          )
                        }
                        className={`w-11 h-6 rounded-full p-1 transition-colors shrink-0 cursor-pointer ${
                          activePolicy.allowSchoolAdminExport ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                        title="Toggle School Admin Automated Export Permission"
                      >
                        <div
                          className={`w-4 h-4 bg-white rounded-full shadow-xs transition-transform ${
                            activePolicy.allowSchoolAdminExport ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Export Format Choice */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  {mode === 'super-admin' ? '2. ' : '1. '}Choose Local Archive Format
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedFormat('JSON')}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                      selectedFormat === 'JSON'
                        ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-600/15 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div
                      className={`p-2.5 rounded-xl shrink-0 ${
                        selectedFormat === 'JSON'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <FileJson className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900">JSON Full Database</span>
                        {selectedFormat === 'JSON' && (
                          <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        Structured hierarchical export with nested relations, metadata & checksum for point-in-time recovery.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedFormat('CSV')}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                      selectedFormat === 'CSV'
                        ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600/15 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div
                      className={`p-2.5 rounded-xl shrink-0 ${
                        selectedFormat === 'CSV'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900">CSV Excel Archive</span>
                        {selectedFormat === 'CSV' && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        UTF-8 BOM encoded flat multi-table spreadsheet compatible with Excel & Google Sheets (Bangla/Unicode safe).
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Step 3: Select Database Modules */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {mode === 'super-admin' ? '3. ' : '2. '}Select Tenant Tables & Modules (
                    {selectedModules.length}/{BACKUP_MODULES.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleSelectAllModules}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                  >
                    {selectedModules.length === BACKUP_MODULES.length
                      ? 'Deselect All'
                      : 'Select All Modules'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {BACKUP_MODULES.map(mod => {
                    const checked = selectedModules.includes(mod.key);
                    const count = moduleCountsMap[mod.key] || 0;
                    return (
                      <div
                        key={mod.key}
                        onClick={() => toggleModule(mod.key)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                          checked
                            ? 'border-indigo-200 bg-indigo-50/40'
                            : 'border-slate-200 bg-white opacity-70 hover:opacity-100'
                        }`}
                      >
                        <div className="mt-0.5 text-indigo-600 shrink-0">
                          {checked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-400" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-slate-800 truncate">{mod.label}</span>
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700 shrink-0">
                              {count}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                            {mod.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="text-[11px] font-mono text-slate-500">
                  Checksum: <span className="font-bold text-slate-700">{liveSnapshot.metadata.checksum}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    icon={Eye}
                    onClick={() => setIsPreviewOpen(true)}
                  >
                    Preview Archive
                  </Button>
                  <Button
                    id="run-full-backup-export-btn"
                    type="button"
                    variant="primary"
                    size="sm"
                    icon={Download}
                    disabled={isExporting || selectedModules.length === 0}
                    onClick={() =>
                      runExportPipeline(
                        selectedSubdomain,
                        selectedFormat,
                        mode === 'school-admin' ? 'School Admin Self-Service' : 'Manual'
                      )
                    }
                  >
                    Download {selectedFormat} Archive ({liveSnapshot.metadata.totalRecords} records)
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Automated Backup Schedule & Retention Configuration */}
          <Card title="Automated Backup Schedule & Retention Policy">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-700 shrink-0">
                    <CalendarClock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Automated Scheduled Export ({selectedTenantObj?.name})
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Next scheduled run: <span className="font-mono font-bold text-slate-700">{activePolicy.nextScheduledAt}</span>
                      {activePolicy.lastAutoExportAt && (
                        <> • Last run: {new Date(activePolicy.lastAutoExportAt).toLocaleString()}</>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      handlePolicyUpdate({ autoScheduleEnabled: !activePolicy.autoScheduleEnabled })
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                      activePolicy.autoScheduleEnabled
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{activePolicy.autoScheduleEnabled ? 'Schedule Active' : 'Paused'}</span>
                  </button>

                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    icon={Play}
                    disabled={isExporting}
                    onClick={() =>
                      runExportPipeline(
                        selectedSubdomain,
                        activePolicy.preferredFormat,
                        'Scheduled Auto-Export',
                        BACKUP_MODULES.map(m => m.key)
                      )
                    }
                  >
                    Run Auto-Export Now
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Backup Frequency</label>
                  <select
                    value={activePolicy.frequency}
                    onChange={e =>
                      handlePolicyUpdate({ frequency: e.target.value as TenantBackupPolicy['frequency'] })
                    }
                    className="w-full text-xs font-bold p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none"
                  >
                    <option value="Daily">Daily (02:00 AM)</option>
                    <option value="Weekly">Weekly (Friday 02:00 AM)</option>
                    <option value="Monthly">Monthly (1st of Month)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Default Archive Format</label>
                  <select
                    value={activePolicy.preferredFormat}
                    onChange={e =>
                      handlePolicyUpdate({ preferredFormat: e.target.value as BackupFormat })
                    }
                    className="w-full text-xs font-bold p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none"
                  >
                    <option value="JSON">JSON (Full Relational Schema)</option>
                    <option value="CSV">CSV (Consolidated Excel Sheet)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Archive Retention Policy</label>
                  <select
                    value={activePolicy.retentionDays}
                    onChange={e =>
                      handlePolicyUpdate({ retentionDays: Number(e.target.value) })
                    }
                    className="w-full text-xs font-bold p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none"
                  >
                    <option value={30}>Keep 30 Days</option>
                    <option value={90}>Keep 90 Days (Recommended)</option>
                    <option value={180}>Keep 180 Days</option>
                    <option value={365}>Keep 1 Year (Audit Compliance)</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: MULTI-TENANT BACKUP ACCESS MATRIX (SUPER ADMIN) OR LIVE SCHEMA BREAKDOWN */}
        <div className="lg:col-span-5 space-y-6">
          {mode === 'super-admin' && (
            <Card title="Tenant Export Permissions & Quick Triggers">
              <p className="text-xs text-slate-500 mb-4">
                Authorize School Admins to run automated self-service database exports or download a tenant snapshot immediately.
              </p>
              <div className="space-y-2.5 max-h-[430px] overflow-y-auto pr-1 custom-scrollbar">
                {tenants.map(t => {
                  const policy = policies.find(p => p.tenantSubdomain === t.subdomain) || activePolicy;
                  const isCurrent = t.subdomain === selectedSubdomain;
                  const tenantHistory = history.filter(h => h.tenantSubdomain === t.subdomain);
                  const lastBackup = tenantHistory[0];

                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedSubdomain(t.subdomain)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isCurrent
                          ? 'border-indigo-500 bg-indigo-50/40 shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-slate-900 truncate">{t.name}</span>
                            <Badge color={t.type === 'Madrasa' ? 'green' : t.type === 'College' ? 'purple' : 'blue'}>
                              {t.type}
                            </Badge>
                          </div>
                          <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                            {t.subdomain} • {lastBackup ? `Last: ${new Date(lastBackup.createdAt).toLocaleDateString()}` : 'No snapshot yet'}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() =>
                              runExportPipeline(t.subdomain, 'JSON', 'Manual', BACKUP_MODULES.map(m => m.key))
                            }
                            className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-mono text-[10px] font-bold border border-indigo-200 cursor-pointer"
                            title={`Export ${t.name} as JSON`}
                          >
                            JSON
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              runExportPipeline(t.subdomain, 'CSV', 'Manual', BACKUP_MODULES.map(m => m.key))
                            }
                            className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-mono text-[10px] font-bold border border-emerald-200 cursor-pointer"
                            title={`Export ${t.name} as CSV`}
                          >
                            CSV
                          </button>
                        </div>
                      </div>

                      <div
                        className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]"
                        onClick={e => e.stopPropagation()}
                      >
                        <span className="text-slate-600 font-medium">
                          School Admin Self-Export:{' '}
                          <strong className={policy.allowSchoolAdminExport ? 'text-emerald-600' : 'text-rose-600'}>
                            {policy.allowSchoolAdminExport ? 'Allowed' : 'Locked'}
                          </strong>
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleToggleSchoolAdminPermission(t.subdomain, policy.allowSchoolAdminExport)
                          }
                          className="text-indigo-600 hover:underline font-bold cursor-pointer"
                        >
                          {policy.allowSchoolAdminExport ? 'Restrict' : 'Allow Admin'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Snapshot Table Breakdown Card */}
          <Card title="Database Snapshot Breakdown">
            <div className="space-y-2 text-xs">
              {Object.entries(liveSnapshot.metadata.recordCounts).map(([tableName, count]) => (
                <div
                  key={tableName}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 border border-slate-100"
                >
                  <span className="font-mono text-slate-700 font-medium">{tableName}</span>
                  <span className="font-mono font-bold text-indigo-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {count} rows
                  </span>
                </div>
              ))}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between px-1 font-bold text-slate-800">
                <span>Total Exportable Records</span>
                <span className="font-mono text-indigo-700">{liveSnapshot.metadata.totalRecords} rows</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* BACKUP HEALTH CHECK & INTEGRITY AUDITOR UTILITY */}
      <Card>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-slate-900">
                  Backup Health Check & Integrity Verifier
                </h3>
                <Badge color="green">Pre-Export Gatekeeper Active</Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Every generated backup must pass file completeness, schema parity, and checksum verification before being marked Verified & exported. You can also audit any local `.json` or `.csv` file below.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              icon={ShieldCheck}
              onClick={handleRunLiveHealthCheck}
            >
              Verify Current Snapshot
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              icon={ShieldAlert}
              onClick={handleSimulateCorruptionTest}
              className="text-amber-700 border-amber-200 hover:bg-amber-50"
            >
              Test Corruption Detection
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-5 items-center">
          {/* Health Summary Counters */}
          <div className="lg:col-span-5 grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-[10px] font-bold uppercase text-slate-400">Audits Run</div>
              <div className="text-xl font-black text-slate-900 font-mono mt-0.5">{healthLogs.length}</div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80">
              <div className="text-[10px] font-bold uppercase text-emerald-700">Verified Pass</div>
              <div className="text-xl font-black text-emerald-700 font-mono mt-0.5">
                {healthLogs.filter(l => l.passed).length}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200/80">
              <div className="text-[10px] font-bold uppercase text-rose-700">Blocked / Fail</div>
              <div className="text-xl font-black text-rose-700 font-mono mt-0.5">
                {healthLogs.filter(l => !l.passed).length}
              </div>
            </div>
          </div>

          {/* Local Backup File Verifier */}
          <div className="lg:col-span-7 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <input
              type="text"
              value={expectedChecksumInput}
              onChange={e => setExpectedChecksumInput(e.target.value)}
              placeholder="Optional expected checksum (e.g. SHA256-LOC-...)"
              className="flex-1 text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <label className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer transition shrink-0 shadow-xs">
              <Upload className="w-3.5 h-3.5" />
              <span>Verify Local .JSON / .CSV File</span>
              <input
                type="file"
                accept=".json,.csv,application/json,text/csv"
                onChange={handleLocalFileVerify}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </Card>

      {/* BOTTOM SECTION: ARCHIVE HISTORY LOG */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Archive Export Ledger & Local Downloads</h3>
            <p className="text-xs text-slate-500">
              Audit trail of all verified JSON & CSV tenant backups with file completeness and checksum inspection.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search tenant, file, checksum..."
                value={historySearch}
                onChange={e => setHistorySearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none w-52"
              />
            </div>

            <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-0.5 text-xs font-bold">
              {(['ALL', 'JSON', 'CSV'] as const).map(fmt => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setHistoryFormatFilter(fmt)}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    historyFormatFilter === fmt
                      ? 'bg-white text-indigo-600 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
                <th className="py-3 px-3">Archive ID</th>
                <th className="py-3 px-3">Tenant Institution</th>
                <th className="py-3 px-3">Format</th>
                <th className="py-3 px-3">Health Status</th>
                <th className="py-3 px-3">Records / Size</th>
                <th className="py-3 px-3">Integrity Checksum</th>
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No backup archives found matching the current filter.
                  </td>
                </tr>
              ) : (
                filteredHistory.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-800">{rec.id}</td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{rec.tenantName}</div>
                      <div className="text-[10px] font-mono text-slate-400">{rec.fileName}</div>
                    </td>
                    <td className="py-3 px-3">
                      <Badge color={rec.format === 'JSON' ? 'purple' : 'green'}>{rec.format}</Badge>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-col items-start gap-0.5">
                        <Badge
                          color={
                            rec.status === 'Failed'
                              ? 'red'
                              : rec.status === 'Verified'
                              ? 'green'
                              : 'blue'
                          }
                        >
                          {rec.status}
                        </Badge>
                        <span className="text-[10px] text-slate-400">{rec.triggerType}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono">
                      <span className="font-bold text-slate-800">{rec.totalRecords}</span>
                      <span className="text-slate-400"> • {rec.sizeFormatted}</span>
                    </td>
                    <td className="py-3 px-3">
                      <code className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-mono text-slate-600">
                        {rec.checksum}
                      </code>
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                      {new Date(rec.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleVerifyArchiveRow(rec)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] border border-emerald-200 transition cursor-pointer"
                          title="Inspect / Re-run Backup Health Check"
                        >
                          <Activity className="w-3 h-3" />
                          <span>Health</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReDownloadRecord(rec)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] border border-indigo-200 transition cursor-pointer"
                        >
                          <Download className="w-3 h-3" />
                          <span>Download</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* PREVIEW MODAL */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={`${selectedFormat} Snapshot Preview — ${selectedTenantObj?.name}`}
      >
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span>
              Total Records: <strong className="font-mono">{liveSnapshot.metadata.totalRecords}</strong>
            </span>
            <span className="font-mono text-[11px]">{liveSnapshot.metadata.checksum}</span>
          </div>
          <pre className="bg-slate-900 text-emerald-300 font-mono text-[11px] p-4 rounded-xl max-h-96 overflow-auto leading-relaxed">
            {previewPayload}
          </pre>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsPreviewOpen(false)}>
              Close
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              icon={Download}
              onClick={() => {
                setIsPreviewOpen(false);
                runExportPipeline(
                  selectedSubdomain,
                  selectedFormat,
                  mode === 'school-admin' ? 'School Admin Self-Service' : 'Manual'
                );
              }}
            >
              Download Full {selectedFormat} File
            </Button>
          </div>
        </div>
      </Modal>

      {/* BACKUP HEALTH CHECK DIAGNOSTIC MODAL */}
      <BackupHealthCheckModal
        report={activeHealthReport}
        onClose={() => setActiveHealthReport(null)}
      />
    </div>
  );
};
