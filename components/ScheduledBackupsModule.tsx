import React, { useState, useEffect, useMemo } from 'react';
import {
  CalendarClock,
  Plus,
  Play,
  HardDrive,
  Trash2,
  Download,
  Eye,
  Clock,
  CheckCircle2,
  Database,
  RefreshCw,
  Edit,
  Building2,
  Layers,
  CheckSquare,
  Square,
  ShieldCheck,
  AlertTriangle,
  Power,
  FileJson,
  FileSpreadsheet,
  Sparkles,
  Search,
  FileCheck2
} from 'lucide-react';
import { Button, Card, Badge, Modal, Input, useToast } from './UIComponents';
import { Tenant } from '../types';
import { getStoredTenants, TENANT_UPDATE_EVENT } from '../utils/tenantStorage';
import {
  BACKUP_MODULES,
  BackupModuleKey,
  BackupHealthCheckReport,
  ScheduleFrequency,
  ScheduledFormat,
  ScheduledStorageTarget,
  ScheduledBackupRule,
  LocalStorageBackupEntry,
  LocalStorageQuotaStats,
  computeNextTriggerDate,
  getScheduledBackupRules,
  saveScheduledBackupRule,
  toggleScheduledBackupRule,
  deleteScheduledBackupRule,
  executeScheduledBackupRule,
  processDueScheduledBackups,
  getLocalStorageSnapshots,
  readLocalStorageSnapshotPayload,
  deleteLocalStorageSnapshot,
  clearAllLocalStorageSnapshots,
  downloadLocalStorageSnapshot,
  getLocalStorageQuotaStats,
  runHealthCheckOnStoredSnapshot,
  runBatchBackupHealthAudit,
  SCHEDULED_BACKUP_EVENT
} from '../utils/tenantBackupExport';
import { BackupHealthCheckModal } from './BackupHealthCheckModal';

const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

export const ScheduledBackupsModule: React.FC = () => {
  const { addToast } = useToast();

  const [tenants, setTenants] = useState<Tenant[]>(() => getStoredTenants());
  const [rules, setRules] = useState<ScheduledBackupRule[]>(() => getScheduledBackupRules());
  const [snapshots, setSnapshots] = useState<LocalStorageBackupEntry[]>(() =>
    getLocalStorageSnapshots()
  );
  const [quotaStats, setQuotaStats] = useState<LocalStorageQuotaStats>(() =>
    getLocalStorageQuotaStats()
  );

  // Filters for Local Storage Vault
  const [vaultSearch, setVaultSearch] = useState('');
  const [vaultFreqFilter, setVaultFreqFilter] = useState<'ALL' | ScheduleFrequency>('ALL');

  // Create / Edit Schedule Modal
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [ruleName, setRuleName] = useState('');
  const [targetScope, setTargetScope] = useState<string>('ALL_TENANTS');
  const [frequency, setFrequency] = useState<ScheduleFrequency>('Daily');
  const [triggerTime, setTriggerTime] = useState('02:00');
  const [dayOfWeek, setDayOfWeek] = useState<number>(5);
  const [dayOfMonth, setDayOfMonth] = useState<number>(1);
  const [format, setFormat] = useState<ScheduledFormat>('JSON');
  const [storageTarget, setStorageTarget] = useState<ScheduledStorageTarget>('LOCAL_STORAGE');
  const [maxRetainedSnapshots, setMaxRetainedSnapshots] = useState<number>(5);
  const [modules, setModules] = useState<BackupModuleKey[]>(BACKUP_MODULES.map(m => m.key));

  // Snapshot Payload Inspector Modal
  const [inspectingEntry, setInspectingEntry] = useState<LocalStorageBackupEntry | null>(null);
  const [inspectPayload, setInspectPayload] = useState<string>('');
  const [activeHealthReport, setActiveHealthReport] = useState<BackupHealthCheckReport | null>(null);

  const refreshState = () => {
    setTenants(getStoredTenants());
    setRules(getScheduledBackupRules());
    setSnapshots(getLocalStorageSnapshots());
    setQuotaStats(getLocalStorageQuotaStats());
  };

  useEffect(() => {
    window.addEventListener(SCHEDULED_BACKUP_EVENT, refreshState);
    window.addEventListener(TENANT_UPDATE_EVENT, refreshState);
    return () => {
      window.removeEventListener(SCHEDULED_BACKUP_EVENT, refreshState);
      window.removeEventListener(TENANT_UPDATE_EVENT, refreshState);
    };
  }, []);

  const previewNextRun = useMemo(() => {
    return computeNextTriggerDate(frequency, triggerTime, dayOfWeek, dayOfMonth);
  }, [frequency, triggerTime, dayOfWeek, dayOfMonth]);

  const openCreateModal = () => {
    setEditingRuleId(null);
    setRuleName('');
    setTargetScope('ALL_TENANTS');
    setFrequency('Daily');
    setTriggerTime('02:00');
    setDayOfWeek(5);
    setDayOfMonth(1);
    setFormat('JSON');
    setStorageTarget('LOCAL_STORAGE');
    setMaxRetainedSnapshots(5);
    setModules(BACKUP_MODULES.map(m => m.key));
    setIsRuleModalOpen(true);
  };

  const openEditModal = (rule: ScheduledBackupRule) => {
    setEditingRuleId(rule.id);
    setRuleName(rule.name);
    setTargetScope(rule.targetScope);
    setFrequency(rule.frequency);
    setTriggerTime(rule.triggerTime);
    setDayOfWeek(rule.dayOfWeek ?? 5);
    setDayOfMonth(rule.dayOfMonth ?? 1);
    setFormat(rule.format);
    setStorageTarget(rule.storageTarget);
    setMaxRetainedSnapshots(rule.maxRetainedSnapshots);
    setModules(rule.modules);
    setIsRuleModalOpen(true);
  };

  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (modules.length === 0) {
      addToast('Select at least one database module for the schedule.', 'error');
      return;
    }

    const scopeLabel =
      targetScope === 'ALL_TENANTS'
        ? 'All Tenants'
        : tenants.find(t => t.subdomain === targetScope)?.name || targetScope;

    const finalName =
      ruleName.trim() || `${frequency} ${scopeLabel} Database Export`;

    const saved = saveScheduledBackupRule({
      id: editingRuleId || undefined,
      name: finalName,
      targetScope,
      frequency,
      triggerTime,
      dayOfWeek: frequency === 'Weekly' ? dayOfWeek : undefined,
      dayOfMonth: frequency === 'Monthly' ? dayOfMonth : undefined,
      format,
      storageTarget,
      modules,
      maxRetainedSnapshots,
      isActive: true
    });

    setIsRuleModalOpen(false);
    refreshState();
    addToast(
      `Scheduled backup rule "${saved.name}" saved. Next automatic trigger: ${new Date(
        saved.nextRunAt
      ).toLocaleString()}`,
      'success'
    );
  };

  const handleToggleRule = (ruleId: string) => {
    const updated = toggleScheduledBackupRule(ruleId);
    refreshState();
    if (updated) {
      addToast(
        `Schedule "${updated.name}" is now ${updated.isActive ? 'Active' : 'Paused'}.`,
        'info'
      );
    }
  };

  const handleDeleteRule = (rule: ScheduledBackupRule) => {
    deleteScheduledBackupRule(rule.id);
    refreshState();
    addToast(`Removed scheduled rule "${rule.name}".`, 'info');
  };

  const handleRunRuleNow = (rule: ScheduledBackupRule) => {
    const { entries } = executeScheduledBackupRule(rule.id, 'Manual Trigger');
    refreshState();
    const totalSize = entries.reduce((sum, e) => sum + e.sizeBytes, 0);
    addToast(
      `Captured ${entries.length} snapshot(s) directly to browser Local Storage (${(
        totalSize / 1024
      ).toFixed(1)} KB).`,
      'success'
    );
  };

  const handleCheckDueTriggers = () => {
    const executed = processDueScheduledBackups();
    refreshState();
    if (executed.length > 0) {
      addToast(
        `Executed ${executed.length} due scheduled export(s) to Local Storage!`,
        'success'
      );
    } else {
      addToast('All active schedules are up to date — no overdue triggers pending.', 'info');
    }
  };

  const handleInspectSnapshot = (entry: LocalStorageBackupEntry) => {
    const raw = readLocalStorageSnapshotPayload(entry.storageKey);
    if (!raw) {
      addToast('Snapshot payload not found in localStorage.', 'error');
      return;
    }
    setInspectingEntry(entry);
    if (entry.format === 'JSON') {
      try {
        setInspectPayload(JSON.stringify(JSON.parse(raw), null, 2).slice(0, 10000));
      } catch {
        setInspectPayload(raw.slice(0, 10000));
      }
    } else {
      setInspectPayload(raw.slice(0, 10000));
    }
  };

  const handleDownloadFromVault = (entry: LocalStorageBackupEntry) => {
    const ok = downloadLocalStorageSnapshot(entry);
    if (ok) {
      addToast(`Exported snapshot ${entry.id} (${entry.format}) from Local Storage.`, 'success');
    } else {
      addToast('Unable to read snapshot payload from localStorage.', 'error');
    }
  };

  const handleDeleteSnapshot = (entry: LocalStorageBackupEntry) => {
    deleteLocalStorageSnapshot(entry.id);
    refreshState();
    addToast(`Snapshot ${entry.id} removed from Local Storage.`, 'info');
  };

  const handleClearVault = () => {
    clearAllLocalStorageSnapshots();
    refreshState();
    addToast('Cleared all cached scheduled snapshots from Local Storage.', 'info');
  };

  const handleAuditSnapshot = (entry: LocalStorageBackupEntry) => {
    const report = runHealthCheckOnStoredSnapshot(entry.id);
    refreshState();
    if (report) {
      setActiveHealthReport(report);
      addToast(
        report.passed
          ? `Snapshot ${entry.id} passed integrity & checksum verification!`
          : `Snapshot ${entry.id} failed health verification!`,
        report.passed ? 'success' : 'error'
      );
    }
  };

  const handleAuditAllVault = () => {
    const res = runBatchBackupHealthAudit();
    refreshState();
    if (res.total === 0) {
      addToast('No snapshots stored in Local Storage to audit.', 'info');
      return;
    }
    addToast(
      `Vault Health Audit complete: ${res.passed}/${res.total} snapshots verified (${res.failed} failed).`,
      res.failed === 0 ? 'success' : 'error'
    );
    if (res.reports[0]) {
      setActiveHealthReport(res.reports[0]);
    }
  };

  const toggleFormModule = (key: BackupModuleKey) => {
    setModules(prev => (prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]));
  };

  const activeRulesCount = rules.filter(r => r.isActive).length;
  const dailyCount = rules.filter(r => r.frequency === 'Daily').length;
  const weeklyCount = rules.filter(r => r.frequency === 'Weekly').length;
  const monthlyCount = rules.filter(r => r.frequency === 'Monthly').length;

  const filteredSnapshots = useMemo(() => {
    return snapshots.filter(item => {
      const freqOk = vaultFreqFilter === 'ALL' || item.frequency === vaultFreqFilter;
      const q = vaultSearch.trim().toLowerCase();
      const searchOk =
        !q ||
        item.ruleName.toLowerCase().includes(q) ||
        item.tenantName.toLowerCase().includes(q) ||
        item.tenantSubdomain.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.storageKey.toLowerCase().includes(q);
      return freqOk && searchOk;
    });
  }, [snapshots, vaultFreqFilter, vaultSearch]);

  const formatTriggerTiming = (rule: ScheduledBackupRule): string => {
    if (rule.frequency === 'Daily') return `Every day at ${rule.triggerTime}`;
    if (rule.frequency === 'Weekly') {
      const dow = WEEKDAYS[rule.dayOfWeek ?? 5] || 'Friday';
      return `Every ${dow} at ${rule.triggerTime}`;
    }
    const dom = rule.dayOfMonth ?? 1;
    const domText = dom >= 29 ? 'Last day of month' : `Day ${dom} of month`;
    return `${domText} at ${rule.triggerTime}`;
  };

  return (
    <div className="space-y-6 font-sans">
      {/* HEADER */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shrink-0">
            <CalendarClock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Scheduled Backups (Local Storage Automation)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Configure automatic Daily, Weekly, or Monthly trigger points to snapshot tenant databases directly into browser Local Storage.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={handleCheckDueTriggers}
          >
            Check Due Triggers
          </Button>
          <Button
            id="create-scheduled-backup-btn"
            type="button"
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={openCreateModal}
          >
            New Trigger Schedule
          </Button>
        </div>
      </div>

      {/* KPI & QUOTA CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-indigo-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Active Trigger Rules
              </p>
              <h3 className="text-2xl font-black text-slate-900 mt-1 font-mono">
                {activeRulesCount} / {rules.length}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Auto-trigger daemon polling</p>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-emerald-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Frequency Cadence Mix
              </p>
              <div className="flex items-center gap-2 mt-1.5 font-mono text-xs font-bold">
                <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {dailyCount} Daily
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                  {weeklyCount} Weekly
                </span>
                <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100">
                  {monthlyCount} Monthly
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Automated trigger intervals</p>
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Stored Local Snapshots
              </p>
              <h3 className="text-2xl font-black text-slate-900 mt-1 font-mono">
                {snapshots.length}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Vault footprint: {quotaStats.vaultUsedFormatted}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
              <Database className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-amber-500">
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                LocalStorage Quota
              </p>
              <span className="text-xs font-mono font-bold text-slate-700">
                {quotaStats.usagePercentage}%
              </span>
            </div>
            <h3 className="text-lg font-black text-slate-900 font-mono">
              {quotaStats.totalUsedFormatted}{' '}
              <span className="text-xs font-normal text-slate-400">/ 5.0 MB</span>
            </h3>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-2">
              <div
                className={`h-full transition-all ${
                  quotaStats.usagePercentage > 80
                    ? 'bg-rose-500'
                    : quotaStats.usagePercentage > 50
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.max(4, quotaStats.usagePercentage)}%` }}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* SCHEDULED TRIGGER RULES LIST */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-indigo-600" />
              <span>Configured Automatic Backup Triggers</span>
            </h3>
            <p className="text-xs text-slate-500">
              Rules automatically execute when their scheduled Daily, Weekly, or Monthly trigger timestamp is reached, or can be triggered immediately for testing.
            </p>
          </div>
          <Button type="button" size="sm" variant="outline" icon={Plus} onClick={openCreateModal}>
            Add Rule
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rules.map(rule => {
            const targetLabel =
              rule.targetScope === 'ALL_TENANTS'
                ? `All Tenants (${tenants.length} institutions)`
                : tenants.find(t => t.subdomain === rule.targetScope)?.name || rule.targetScope;

            return (
              <div
                key={rule.id}
                className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                  rule.isActive
                    ? 'bg-white border-slate-200 shadow-xs hover:border-indigo-300'
                    : 'bg-slate-50/80 border-slate-200/70 opacity-75'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge
                        color={
                          rule.frequency === 'Daily'
                            ? 'blue'
                            : rule.frequency === 'Weekly'
                            ? 'green'
                            : 'purple'
                        }
                      >
                        {rule.frequency}
                      </Badge>
                      <Badge color={rule.format === 'CSV' ? 'green' : rule.format === 'BOTH' ? 'yellow' : 'gray'}>
                        {rule.format}
                      </Badge>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleRule(rule.id)}
                      className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                        rule.isActive ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                      title={rule.isActive ? 'Pause automatic schedule' : 'Activate automatic schedule'}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${
                          rule.isActive ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm mb-1">{rule.name}</h4>
                  <p className="text-xs text-indigo-600 font-medium flex items-center gap-1.5 mb-3">
                    <Building2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{targetLabel}</span>
                  </p>

                  <div className="space-y-1.5 text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Trigger Point:</span>
                      <span className="font-bold text-slate-800">{formatTriggerTiming(rule)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Destination:</span>
                      <span className="font-mono font-bold text-slate-700">
                        {rule.storageTarget === 'LOCAL_STORAGE_AND_DOWNLOAD'
                          ? 'localStorage + Disk'
                          : 'localStorage Vault'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Next Run:</span>
                      <span className="font-mono text-emerald-700 font-bold">
                        {new Date(rule.nextRunAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Last Run:</span>
                      <span className="font-mono text-slate-600">
                        {rule.lastRunAt ? new Date(rule.lastRunAt).toLocaleString() : 'Never yet'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Retention:</span>
                      <span className="font-mono text-slate-700">
                        Keep last {rule.maxRetainedSnapshots} snapshots ({rule.modules.length} tables)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    icon={Play}
                    onClick={() => handleRunRuleNow(rule)}
                    className="flex-1 text-xs"
                  >
                    Trigger to LocalStorage
                  </Button>
                  <button
                    type="button"
                    onClick={() => openEditModal(rule)}
                    className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                    title="Edit Schedule"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteRule(rule)}
                    className="p-2 rounded-lg border border-slate-200 text-rose-500 hover:bg-rose-50 cursor-pointer"
                    title="Delete Schedule"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* LOCAL STORAGE SNAPSHOT VAULT */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-purple-600" />
              <span>Local Storage Snapshot Vault (`window.localStorage`)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Inspect, verify, or export serialized tenant database archives stored locally in browser `localStorage`.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search vault snapshots..."
                value={vaultSearch}
                onChange={e => setVaultSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none w-48"
              />
            </div>

            <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-0.5 text-xs font-bold">
              {(['ALL', 'Daily', 'Weekly', 'Monthly'] as const).map(freq => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => setVaultFreqFilter(freq)}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    vaultFreqFilter === freq
                      ? 'bg-white text-indigo-600 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {freq}
                </button>
              ))}
            </div>

            {snapshots.length > 0 && (
              <>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  icon={FileCheck2}
                  onClick={handleAuditAllVault}
                  className="text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                >
                  Audit Vault Health
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  icon={Trash2}
                  onClick={handleClearVault}
                  className="text-rose-600 border-rose-200 hover:bg-rose-50"
                >
                  Clear Vault
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
                <th className="py-3 px-3">Snapshot ID & Key</th>
                <th className="py-3 px-3">Schedule Rule</th>
                <th className="py-3 px-3">Tenant</th>
                <th className="py-3 px-3">Format / Health</th>
                <th className="py-3 px-3">Size / Rows</th>
                <th className="py-3 px-3">Captured At</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSnapshots.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <HardDrive className="w-8 h-8 text-slate-300" />
                      <p className="font-medium text-slate-500">
                        No snapshots stored in Local Storage yet.
                      </p>
                      <p className="text-[11px]">
                        Click <strong>"Trigger to LocalStorage"</strong> on any schedule card above to capture your first local snapshot immediately.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSnapshots.map(entry => (
                  <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-mono font-bold text-slate-800">{entry.id}</div>
                      <div className="text-[10px] font-mono text-slate-400 truncate max-w-[200px]">
                        {entry.storageKey}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-800">{entry.ruleName}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge
                          color={
                            entry.frequency === 'Daily'
                              ? 'blue'
                              : entry.frequency === 'Weekly'
                              ? 'green'
                              : 'purple'
                          }
                        >
                          {entry.frequency}
                        </Badge>
                        <span className="text-[10px] text-slate-400">{entry.triggerMode}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{entry.tenantName}</div>
                      <div className="text-[10px] font-mono text-slate-400">{entry.tenantSubdomain}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge color={entry.format === 'JSON' ? 'purple' : 'green'}>
                          {entry.format}
                        </Badge>
                        {entry.healthStatus && (
                          <Badge color={entry.healthStatus === 'Verified' ? 'green' : 'red'}>
                            {entry.healthStatus}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono">
                      <span className="font-bold text-slate-800">{entry.sizeFormatted}</span>
                      <span className="text-slate-400"> • {entry.totalRecords} rows</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                      {new Date(entry.capturedAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleAuditSnapshot(entry)}
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 cursor-pointer"
                          title="Run Backup Health Check"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInspectSnapshot(entry)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                          title="Inspect Stored Payload"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadFromVault(entry)}
                          className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 cursor-pointer"
                          title="Download Snapshot File"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSnapshot(entry)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer"
                          title="Delete from LocalStorage"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* CREATE / EDIT SCHEDULE MODAL */}
      <Modal
        isOpen={isRuleModalOpen}
        onClose={() => setIsRuleModalOpen(false)}
        title={editingRuleId ? 'Edit Scheduled Backup Trigger' : 'Create Scheduled Backup Trigger'}
      >
        <form onSubmit={handleSaveRule} className="space-y-4 pt-2 max-h-[75vh] overflow-y-auto pr-1">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Schedule Name</label>
            <input
              type="text"
              placeholder="e.g. Nightly School DB Local Snapshot"
              value={ruleName}
              onChange={e => setRuleName(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Target Institution Scope</label>
              <select
                value={targetScope}
                onChange={e => setTargetScope(e.target.value)}
                className="w-full text-xs font-bold p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none"
              >
                <option value="ALL_TENANTS">ALL TENANTS ({tenants.length} Schools)</option>
                {tenants.map(t => (
                  <option key={t.id} value={t.subdomain}>
                    {t.name} ({t.subdomain})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Export Format</label>
              <select
                value={format}
                onChange={e => setFormat(e.target.value as ScheduledFormat)}
                className="w-full text-xs font-bold p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none"
              >
                <option value="JSON">JSON (Full Relational Snapshot)</option>
                <option value="CSV">CSV (Consolidated Spreadsheet)</option>
                <option value="BOTH">BOTH (JSON + CSV)</option>
              </select>
            </div>
          </div>

          {/* Automatic Trigger Frequency */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Automatic Trigger Cadence
            </label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {(['Daily', 'Weekly', 'Monthly'] as ScheduleFrequency[]).map(freq => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => setFrequency(freq)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    frequency === freq
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {freq}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
              {frequency === 'Weekly' && (
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Day of Week</label>
                  <select
                    value={dayOfWeek}
                    onChange={e => setDayOfWeek(Number(e.target.value))}
                    className="w-full text-xs font-bold p-2 border border-slate-200 rounded-lg bg-white outline-none"
                  >
                    {WEEKDAYS.map((day, idx) => (
                      <option key={day} value={idx}>
                        Every {day}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {frequency === 'Monthly' && (
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Day of Month</label>
                  <select
                    value={dayOfMonth}
                    onChange={e => setDayOfMonth(Number(e.target.value))}
                    className="w-full text-xs font-bold p-2 border border-slate-200 rounded-lg bg-white outline-none"
                  >
                    {Array.from({ length: 28 }, (_, i) => i + 1).map(d => (
                      <option key={d} value={d}>
                        Day {d} of every month
                      </option>
                    ))}
                    <option value={31}>Last day of every month</option>
                  </select>
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Trigger Time</label>
                <input
                  type="time"
                  value={triggerTime}
                  onChange={e => setTriggerTime(e.target.value)}
                  className="w-full text-xs font-mono font-bold p-2 border border-slate-200 rounded-lg bg-white outline-none"
                />
              </div>

              <div className="sm:col-span-2 text-[11px] text-indigo-700 font-medium pt-1">
                Next automatic trigger: <strong className="font-mono">{new Date(previewNextRun).toLocaleString()}</strong>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Storage Target</label>
              <select
                value={storageTarget}
                onChange={e => setStorageTarget(e.target.value as ScheduledStorageTarget)}
                className="w-full text-xs font-bold p-2.5 border border-slate-200 rounded-xl bg-slate-50 outline-none"
              >
                <option value="LOCAL_STORAGE">Local Storage Vault Only</option>
                <option value="LOCAL_STORAGE_AND_DOWNLOAD">Local Storage + Auto Download File</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Snapshot Retention Cap</label>
              <select
                value={maxRetainedSnapshots}
                onChange={e => setMaxRetainedSnapshots(Number(e.target.value))}
                className="w-full text-xs font-bold p-2.5 border border-slate-200 rounded-xl bg-slate-50 outline-none"
              >
                <option value={3}>Keep last 3 snapshots</option>
                <option value={5}>Keep last 5 snapshots</option>
                <option value={10}>Keep last 10 snapshots</option>
                <option value={20}>Keep last 20 snapshots</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Included Modules ({modules.length}/{BACKUP_MODULES.length})
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {BACKUP_MODULES.map(m => {
                const active = modules.includes(m.key);
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => toggleFormModule(m.key)}
                    className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-medium text-left flex items-center gap-1.5 cursor-pointer ${
                      active
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-800'
                        : 'bg-white border-slate-200 text-slate-500'
                    }`}
                  >
                    {active ? (
                      <CheckSquare className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                    <span className="truncate">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsRuleModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" icon={CheckCircle2}>
              {editingRuleId ? 'Update Schedule' : 'Activate Schedule'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* INSPECT LOCALSTORAGE PAYLOAD MODAL */}
      <Modal
        isOpen={!!inspectingEntry}
        onClose={() => setInspectingEntry(null)}
        title={`LocalStorage Payload — ${inspectingEntry?.id || ''}`}
      >
        {inspectingEntry && (
          <div className="space-y-3 pt-2">
            <div className="text-xs bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 font-mono">
              <div>
                Key: <strong className="text-indigo-700">{inspectingEntry.storageKey}</strong>
              </div>
              <div>
                Checksum: <strong>{inspectingEntry.checksum}</strong> • Size:{' '}
                <strong>{inspectingEntry.sizeFormatted}</strong>
              </div>
            </div>
            <pre className="bg-slate-900 text-emerald-300 font-mono text-[11px] p-4 rounded-xl max-h-96 overflow-auto leading-relaxed">
              {inspectPayload}
            </pre>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setInspectingEntry(null)}>
                Close
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                icon={Download}
                onClick={() => handleDownloadFromVault(inspectingEntry)}
              >
                Export to File ({inspectingEntry.format})
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <BackupHealthCheckModal
        report={activeHealthReport}
        onClose={() => setActiveHealthReport(null)}
      />
    </div>
  );
};
