import React, { useState, useEffect, useMemo } from 'react';
import {
  Cloud,
  CloudUpload,
  Folder,
  KeyRound,
  Plus,
  RefreshCw,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Send,
  Settings2,
  LogOut,
  Building2,
  HardDrive,
  Search,
  Lock,
  Loader2,
  FileJson,
  FileSpreadsheet,
  DatabaseBackup
} from 'lucide-react';
import { Button, Card, Badge, Modal, useToast } from './UIComponents';
import { Tenant } from '../types';
import { getStoredTenants, TENANT_UPDATE_EVENT } from '../utils/tenantStorage';
import { formatBytes } from '../utils/documentStorage';
import {
  BACKUP_MODULES,
  BackupFormat,
  collectTenantDatabase,
  convertSnapshotToCsv,
  verifyGeneratedBackupIntegrity,
  computeArchiveChecksum
} from '../utils/tenantBackupExport';
import {
  initDriveAuth,
  signInWithGoogleDrive,
  disconnectGoogleDriveAuth,
  getDriveAccessToken,
  getDriveSignedInUser,
  ensureDriveBackupFolder,
  listDriveBackupFiles,
  deleteDriveBackupFile,
  DriveFileItem
} from '../utils/googleDriveAuth';
import {
  ExternalProviderType,
  ExternalStorageConnection,
  ExternalSyncRecord,
  getExternalStorageConnections,
  saveExternalStorageConnection,
  updateExternalStorageConnection,
  deleteExternalStorageConnection,
  setS3SecretKeyInMemory,
  hasS3SecretKeyInMemory,
  getS3SecretKeyFromMemory,
  testS3Connection,
  syncBackupToConnection,
  getExternalSyncLedger,
  clearExternalSyncLedger,
  EXTERNAL_STORAGE_EVENT
} from '../utils/externalStorageSync';

interface ConfirmActionState {
  title: string;
  description: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => Promise<void> | void;
}

export const CloudStorageSyncModule: React.FC = () => {
  const { addToast } = useToast();

  const [tenants, setTenants] = useState<Tenant[]>(() => getStoredTenants());
  const [connections, setConnections] = useState<ExternalStorageConnection[]>(() =>
    getExternalStorageConnections()
  );
  const [syncLedger, setSyncLedger] = useState<ExternalSyncRecord[]>(() =>
    getExternalSyncLedger()
  );

  // Google Drive Auth state (access token cached strictly in memory)
  const [needsDriveAuth, setNeedsDriveAuth] = useState<boolean>(() => !getDriveAccessToken());
  const [driveUserEmail, setDriveUserEmail] = useState<string>(
    () => getDriveSignedInUser()?.email || ''
  );
  const [isConnectingDrive, setIsConnectingDrive] = useState(false);

  // Google Drive Explorer modal state
  const [driveFilesModalConn, setDriveFilesModalConn] = useState<ExternalStorageConnection | null>(null);
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [isLoadingDriveFiles, setIsLoadingDriveFiles] = useState(false);

  // Add/Edit Connection modal state (AWS S3 / S3-Compatible / Drive Folder)
  const [isConnModalOpen, setIsConnModalOpen] = useState(false);
  const [editingConnId, setEditingConnId] = useState<string | null>(null);
  const [formProvider, setFormProvider] = useState<ExternalProviderType>('AWS_S3');
  const [formName, setFormName] = useState('');
  const [formScope, setFormScope] = useState<string>('ALL_TENANTS');
  const [formSyncManual, setFormSyncManual] = useState(true);
  const [formSyncScheduled, setFormSyncScheduled] = useState(true);
  // Google Drive fields
  const [formDriveFolder, setFormDriveFolder] = useState('SmartAmarSchool-Backups');
  // S3 fields
  const [formS3Bucket, setFormS3Bucket] = useState('');
  const [formS3Region, setFormS3Region] = useState('ap-southeast-1');
  const [formS3Endpoint, setFormS3Endpoint] = useState('');
  const [formS3Prefix, setFormS3Prefix] = useState('backups/');
  const [formS3AccessKey, setFormS3AccessKey] = useState('');
  const [formS3SecretKey, setFormS3SecretKey] = useState('');

  // Quick Manual Cloud Push Bar
  const [pushTenantSubdomain, setPushTenantSubdomain] = useState<string>(
    () => getStoredTenants()[0]?.subdomain || 'sonar-bangla'
  );
  const [pushFormat, setPushFormat] = useState<BackupFormat>('JSON');
  const [pushConnId, setPushConnId] = useState<string>(
    () => getExternalStorageConnections()[0]?.id || ''
  );
  const [isPushing, setIsPushing] = useState(false);
  const [testingConnId, setTestingConnId] = useState<string | null>(null);

  // Sync Ledger filters
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerProviderFilter, setLedgerProviderFilter] = useState<'ALL' | ExternalProviderType>('ALL');

  // Mandatory explicit user confirmation modal state (used for mutating/deleting Drive files or toggling cloud auto-write)
  const [confirmAction, setConfirmAction] = useState<ConfirmActionState | null>(null);
  const [isConfirmBusy, setIsConfirmBusy] = useState(false);

  const refreshState = () => {
    setTenants(getStoredTenants());
    setConnections(getExternalStorageConnections());
    setSyncLedger(getExternalSyncLedger());
    setNeedsDriveAuth(!getDriveAccessToken());
    setDriveUserEmail(getDriveSignedInUser()?.email || '');
  };

  useEffect(() => {
    const unsub = initDriveAuth(
      user => {
        setNeedsDriveAuth(false);
        setDriveUserEmail(user.email || '');
        refreshState();
      },
      () => {
        setNeedsDriveAuth(true);
        setDriveUserEmail('');
        refreshState();
      }
    );

    window.addEventListener(EXTERNAL_STORAGE_EVENT, refreshState);
    window.addEventListener(TENANT_UPDATE_EVENT, refreshState);

    return () => {
      unsub();
      window.removeEventListener(EXTERNAL_STORAGE_EVENT, refreshState);
      window.removeEventListener(TENANT_UPDATE_EVENT, refreshState);
    };
  }, []);

  const handleGoogleSignIn = async () => {
    setIsConnectingDrive(true);
    try {
      const { user } = await signInWithGoogleDrive();
      const driveConns = getExternalStorageConnections().filter(
        c => c.provider === 'GOOGLE_DRIVE'
      );

      let folderId: string | undefined;
      try {
        const folder = await ensureDriveBackupFolder(
          driveConns[0]?.driveFolderName || 'SmartAmarSchool-Backups'
        );
        folderId = folder.id;
      } catch {
        // Folder creation can also occur on first sync
      }

      driveConns.forEach(c => {
        updateExternalStorageConnection(c.id, {
          status: 'Connected',
          driveAccountEmail: user.email || '',
          driveFolderId: folderId || c.driveFolderId,
          lastError: undefined
        });
      });

      refreshState();
      addToast(`Connected Google Drive as ${user.email || 'Google Account'}.`, 'success');
    } catch (err: any) {
      addToast(err?.message || 'Google Drive sign-in cancelled or failed.', 'error');
    } finally {
      setIsConnectingDrive(false);
    }
  };

  const handleGoogleDisconnect = async () => {
    await disconnectGoogleDriveAuth();
    getExternalStorageConnections()
      .filter(c => c.provider === 'GOOGLE_DRIVE')
      .forEach(c =>
        updateExternalStorageConnection(c.id, {
          status: 'Auth Required',
          autoSyncEnabled: false
        })
      );
    refreshState();
    addToast('Disconnected Google Drive session.', 'info');
  };

  const openAddS3Modal = () => {
    setEditingConnId(null);
    setFormProvider('AWS_S3');
    setFormName('AWS S3 Production Backups');
    setFormScope('ALL_TENANTS');
    setFormSyncManual(true);
    setFormSyncScheduled(true);
    setFormDriveFolder('SmartAmarSchool-Backups');
    setFormS3Bucket('');
    setFormS3Region('ap-southeast-1');
    setFormS3Endpoint('');
    setFormS3Prefix('smart-amar-school/backups/');
    setFormS3AccessKey('');
    setFormS3SecretKey('');
    setIsConnModalOpen(true);
  };

  const openEditConnModal = (conn: ExternalStorageConnection) => {
    setEditingConnId(conn.id);
    setFormProvider(conn.provider);
    setFormName(conn.name);
    setFormScope(conn.targetScope);
    setFormSyncManual(conn.syncOnManualExport);
    setFormSyncScheduled(conn.syncOnScheduledBackup);
    setFormDriveFolder(conn.driveFolderName || 'SmartAmarSchool-Backups');
    setFormS3Bucket(conn.s3Bucket || '');
    setFormS3Region(conn.s3Region || 'ap-southeast-1');
    setFormS3Endpoint(conn.s3Endpoint || '');
    setFormS3Prefix(conn.s3Prefix || 'backups/');
    setFormS3AccessKey(conn.s3AccessKeyId || '');
    setFormS3SecretKey(getS3SecretKeyFromMemory(conn.id) || '');
    setIsConnModalOpen(true);
  };

  const handleSaveConnection = (e: React.FormEvent) => {
    e.preventDefault();
    if (formProvider !== 'GOOGLE_DRIVE' && (!formS3Bucket.trim() || !formS3AccessKey.trim())) {
      addToast('Please provide an S3 Bucket name and Access Key ID.', 'error');
      return;
    }

    const existingConn = editingConnId
      ? connections.find(c => c.id === editingConnId)
      : undefined;

    const secretToStore =
      formProvider !== 'GOOGLE_DRIVE' ? formS3SecretKey.trim() : undefined;
    const hasSecret =
      formProvider === 'GOOGLE_DRIVE'
        ? Boolean(getDriveAccessToken())
        : Boolean(secretToStore || (editingConnId && hasS3SecretKeyInMemory(editingConnId)));

    const saved = saveExternalStorageConnection(
      {
        id: editingConnId || undefined,
        provider: formProvider,
        name:
          formName.trim() ||
          (formProvider === 'GOOGLE_DRIVE'
            ? 'Google Drive Institutional Vault'
            : `${formS3Bucket.trim()} (${formS3Region})`),
        status: hasSecret ? 'Connected' : formProvider === 'GOOGLE_DRIVE' ? 'Auth Required' : 'Disconnected',
        autoSyncEnabled: existingConn?.autoSyncEnabled ?? false,
        syncOnManualExport: formSyncManual,
        syncOnScheduledBackup: formSyncScheduled,
        targetScope: formScope,
        driveFolderName: formProvider === 'GOOGLE_DRIVE' ? formDriveFolder.trim() || 'SmartAmarSchool-Backups' : undefined,
        driveAccountEmail: formProvider === 'GOOGLE_DRIVE' ? driveUserEmail || existingConn?.driveAccountEmail : undefined,
        s3Bucket: formProvider !== 'GOOGLE_DRIVE' ? formS3Bucket.trim() : undefined,
        s3Region: formProvider !== 'GOOGLE_DRIVE' ? formS3Region.trim() || 'ap-southeast-1' : undefined,
        s3Endpoint: formProvider === 'S3_COMPATIBLE' ? formS3Endpoint.trim() : undefined,
        s3Prefix: formProvider !== 'GOOGLE_DRIVE' ? formS3Prefix.trim() : undefined,
        s3AccessKeyId: formProvider !== 'GOOGLE_DRIVE' ? formS3AccessKey.trim() : undefined
      },
      formProvider !== 'GOOGLE_DRIVE' && formS3SecretKey.trim() ? formS3SecretKey.trim() : undefined
    );

    if (!pushConnId) setPushConnId(saved.id);
    setIsConnModalOpen(false);
    refreshState();
    addToast(`Saved storage provider "${saved.name}".`, 'success');
  };

  const handleToggleAutoSync = (conn: ExternalStorageConnection) => {
    if (!conn.autoSyncEnabled && conn.provider === 'GOOGLE_DRIVE') {
      if (!getDriveAccessToken()) {
        addToast('Sign in with Google first before activating Google Drive auto-sync.', 'error');
        return;
      }
      setConfirmAction({
        title: 'Enable Automatic Google Drive Backup Sync?',
        description: `When enabled, verified tenant database archives will be automatically uploaded and stored inside your Google Drive folder "${conn.driveFolderName || 'SmartAmarSchool-Backups'}" (${driveUserEmail || 'connected account'}) whenever backups run.`,
        confirmLabel: 'Confirm & Enable Auto-Sync',
        onConfirm: () => {
          updateExternalStorageConnection(conn.id, { autoSyncEnabled: true });
          refreshState();
          addToast(`Auto-Sync activated for "${conn.name}".`, 'success');
        }
      });
      return;
    }

    const next = !conn.autoSyncEnabled;
    updateExternalStorageConnection(conn.id, { autoSyncEnabled: next });
    refreshState();
    addToast(
      `Auto-Sync for "${conn.name}" is now ${next ? 'Active' : 'Paused'}.`,
      next ? 'success' : 'info'
    );
  };

  const handleTestS3 = async (conn: ExternalStorageConnection) => {
    const secret = getS3SecretKeyFromMemory(conn.id);
    if (!secret) {
      openEditConnModal(conn);
      addToast('Enter your AWS Secret Access Key to verify S3 connection.', 'info');
      return;
    }
    setTestingConnId(conn.id);
    const res = await testS3Connection(conn, secret);
    setTestingConnId(null);
    refreshState();
    addToast(res.message, res.ok ? 'success' : 'error');
  };

  const handleOpenDriveBrowser = async (conn: ExternalStorageConnection) => {
    if (!getDriveAccessToken()) {
      addToast('Please sign in with Google first to browse Drive backup files.', 'error');
      return;
    }
    setDriveFilesModalConn(conn);
    setIsLoadingDriveFiles(true);
    try {
      const folder = await ensureDriveBackupFolder(
        conn.driveFolderName || 'SmartAmarSchool-Backups'
      );
      updateExternalStorageConnection(conn.id, { driveFolderId: folder.id });
      const files = await listDriveBackupFiles(folder.id);
      setDriveFiles(files);
    } catch (err: any) {
      addToast(err?.message || 'Unable to list Google Drive files.', 'error');
    } finally {
      setIsLoadingDriveFiles(false);
    }
  };

  const requestDeleteDriveFile = (file: DriveFileItem) => {
    setConfirmAction({
      title: 'Delete Backup File from Google Drive?',
      description: `Are you sure you want to permanently delete "${file.name}" (Drive File ID: ${file.id}) from Google Drive? This cannot be undone.`,
      confirmLabel: 'Confirm Delete from Drive',
      danger: true,
      onConfirm: async () => {
        await deleteDriveBackupFile(file.id);
        setDriveFiles(prev => prev.filter(f => f.id !== file.id));
        addToast(`Deleted "${file.name}" from Google Drive.`, 'info');
      }
    });
  };

  const executeManualPush = async (targetConnId: string, tenantSub: string, fmt: BackupFormat) => {
    const conn = connections.find(c => c.id === targetConnId);
    if (!conn) {
      addToast('Please select a target external storage provider.', 'error');
      return;
    }

    if (conn.provider === 'GOOGLE_DRIVE' && !getDriveAccessToken()) {
      addToast('Sign in with Google first to upload backups to Google Drive.', 'error');
      return;
    }

    if (conn.provider !== 'GOOGLE_DRIVE' && !hasS3SecretKeyInMemory(conn.id)) {
      openEditConnModal(conn);
      addToast('Please load your S3 Secret Access Key in connection settings first.', 'info');
      return;
    }

    setIsPushing(true);
    try {
      const modules = BACKUP_MODULES.map(m => m.key);
      const snapshot = collectTenantDatabase(tenantSub, modules);
      const content =
        fmt === 'JSON' ? JSON.stringify(snapshot, null, 2) : convertSnapshotToCsv(snapshot);
      const dateTag = new Date().toISOString().slice(0, 10);
      const fileName = `${snapshot.metadata.tenantSubdomain}_cloud_backup_${dateTag}.${fmt.toLowerCase()}`;

      // Run Backup Health Check gatekeeper before pushing off-site
      const health = verifyGeneratedBackupIntegrity({
        content,
        format: fmt,
        snapshot,
        fileName,
        expectedModules: modules,
        expectedPayloadHash: computeArchiveChecksum(content),
        source: 'Pre-Export Pipeline'
      });

      if (!health.passed) {
        addToast(`Backup Health Check failed (${health.failureReason}). Cloud push aborted.`, 'error');
        return;
      }

      const rec = await syncBackupToConnection({
        connectionId: conn.id,
        backupId: `CLD-${Date.now().toString(36).toUpperCase()}`,
        tenantSubdomain: snapshot.metadata.tenantSubdomain,
        tenantName: snapshot.metadata.tenantName,
        fileName,
        format: fmt,
        content,
        checksum: snapshot.metadata.checksum,
        triggerSource: 'Manual Push'
      });

      refreshState();
      if (rec.status === 'Synced') {
        addToast(`Health Verified & synced "${fileName}" to ${conn.name}.`, 'success');
      } else {
        addToast(rec.errorMessage || `Sync returned status: ${rec.status}`, 'error');
      }
    } finally {
      setIsPushing(false);
    }
  };

  const handleConfirmPushToDriveOrS3 = (conn: ExternalStorageConnection) => {
    if (conn.provider === 'GOOGLE_DRIVE') {
      const tenantName =
        tenants.find(t => t.subdomain === pushTenantSubdomain)?.name || pushTenantSubdomain;
      setConfirmAction({
        title: 'Upload Tenant Backup to Google Drive?',
        description: `Generate a verified ${pushFormat} database backup for "${tenantName}" and upload it to your Google Drive folder "${conn.driveFolderName || 'SmartAmarSchool-Backups'}"?`,
        confirmLabel: 'Confirm & Upload to Drive',
        onConfirm: () => executeManualPush(conn.id, pushTenantSubdomain, pushFormat)
      });
      return;
    }
    void executeManualPush(conn.id, pushTenantSubdomain, pushFormat);
  };

  const connectedCount = connections.filter(c => c.status === 'Connected').length;
  const armedCount = connections.filter(c => c.autoSyncEnabled).length;
  const syncedRecordsCount = syncLedger.filter(r => r.status === 'Synced').length;
  const totalSyncedVolume = syncLedger
    .filter(r => r.status === 'Synced')
    .reduce((sum, r) => sum + r.sizeBytes, 0);

  const filteredLedger = useMemo(() => {
    return syncLedger.filter(item => {
      const provOk =
        ledgerProviderFilter === 'ALL' || item.provider === ledgerProviderFilter;
      const q = ledgerSearch.trim().toLowerCase();
      const searchOk =
        !q ||
        item.tenantName.toLowerCase().includes(q) ||
        item.fileName.toLowerCase().includes(q) ||
        item.connectionName.toLowerCase().includes(q) ||
        item.remotePathOrId.toLowerCase().includes(q);
      return provOk && searchOk;
    });
  }, [syncLedger, ledgerProviderFilter, ledgerSearch]);

  return (
    <div className="space-y-6 font-sans">
      {/* HEADER */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shrink-0">
            <CloudUpload className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              External Cloud Storage & Auto-Sync
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Connect Google Drive or AWS S3 / S3-compatible buckets to automatically replicate verified tenant database backups off-site whenever exports or schedules run.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {needsDriveAuth ? (
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isConnectingDrive}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-60"
            >
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                className="w-4 h-4 shrink-0"
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </svg>
              <span>{isConnectingDrive ? 'Connecting Google...' : 'Sign in with Google'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="max-w-[180px] truncate">{driveUserEmail || 'Google Drive Active'}</span>
              <button
                type="button"
                onClick={handleGoogleDisconnect}
                className="ml-1 text-emerald-700 hover:text-rose-600 cursor-pointer"
                title="Sign out Google Drive session"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <Button
            type="button"
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={openAddS3Modal}
          >
            Connect AWS S3 / Bucket
          </Button>
        </div>
      </div>

      {/* KPI SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-indigo-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Connected Providers
              </p>
              <h3 className="text-2xl font-black text-slate-900 mt-1 font-mono">
                {connectedCount} / {connections.length}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Google Drive & AWS S3</p>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <Cloud className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-emerald-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Auto-Sync Pipelines
              </p>
              <h3 className="text-2xl font-black text-slate-900 mt-1 font-mono">{armedCount}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Armed on verified exports</p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <RefreshCw className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Off-Site Backups Synced
              </p>
              <h3 className="text-2xl font-black text-slate-900 mt-1 font-mono">
                {syncedRecordsCount}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Health-checked before push</p>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Remote Replicated Size
              </p>
              <h3 className="text-2xl font-black text-slate-900 mt-1 font-mono">
                {formatBytes(totalSyncedVolume)}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">JSON & CSV archives</p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <HardDrive className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* MANUAL CLOUD BACKUP PUSH BAR */}
      <Card>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
              <DatabaseBackup className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Push Verified Tenant Backup to External Cloud Storage
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Generates a full database snapshot, passes Backup Health Check verification, and uploads directly to the selected remote destination.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <select
              value={pushTenantSubdomain}
              onChange={e => setPushTenantSubdomain(e.target.value)}
              className="text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 outline-none"
            >
              {tenants.map(t => (
                <option key={t.id} value={t.subdomain}>
                  {t.name} ({t.subdomain})
                </option>
              ))}
            </select>

            <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-0.5 text-xs font-bold">
              {(['JSON', 'CSV'] as BackupFormat[]).map(fmt => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setPushFormat(fmt)}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer ${
                    pushFormat === fmt ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  {fmt === 'JSON' ? (
                    <FileJson className="w-3.5 h-3.5" />
                  ) : (
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                  )}
                  <span>{fmt}</span>
                </button>
              ))}
            </div>

            <select
              value={pushConnId}
              onChange={e => setPushConnId(e.target.value)}
              className="text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 outline-none max-w-[200px]"
            >
              {connections.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <Button
              type="button"
              variant="primary"
              size="sm"
              icon={isPushing ? Loader2 : Send}
              disabled={isPushing || !pushConnId}
              onClick={() => {
                const target = connections.find(c => c.id === pushConnId);
                if (target) handleConfirmPushToDriveOrS3(target);
              }}
            >
              {isPushing ? 'Syncing...' : 'Sync Backup Now'}
            </Button>
          </div>
        </div>
      </Card>

      {/* CONFIGURED EXTERNAL STORAGE PROVIDERS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {connections.map(conn => {
          const isDrive = conn.provider === 'GOOGLE_DRIVE';
          const secretLoaded = !isDrive && hasS3SecretKeyInMemory(conn.id);
          const scopeLabel =
            conn.targetScope === 'ALL_TENANTS'
              ? `All Tenants (${tenants.length} institutions)`
              : tenants.find(t => t.subdomain === conn.targetScope)?.name || conn.targetScope;

          return (
            <Card key={conn.id} className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isDrive
                          ? 'bg-blue-50 text-blue-600 border border-blue-200'
                          : 'bg-amber-50 text-amber-600 border border-amber-200'
                      }`}
                    >
                      {isDrive ? <Folder className="w-5 h-5" /> : <Cloud className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-slate-900">{conn.name}</h3>
                        <Badge
                          color={
                            conn.status === 'Connected'
                              ? 'green'
                              : conn.status === 'Error'
                              ? 'red'
                              : 'yellow'
                          }
                        >
                          {conn.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>Scope: {scopeLabel}</span>
                      </p>
                    </div>
                  </div>

                  {/* Auto-Sync Toggle */}
                  <div className="flex flex-col items-end gap-1">
                    <button
                      type="button"
                      onClick={() => handleToggleAutoSync(conn)}
                      className={`w-11 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                        conn.autoSyncEnabled ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                      title="Toggle Automatic Sync on Backup Exports"
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${
                          conn.autoSyncEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className="text-[10px] font-bold text-slate-500">
                      {conn.autoSyncEnabled ? 'Auto-Sync ON' : 'Auto-Sync OFF'}
                    </span>
                  </div>
                </div>

                {/* Provider Details Box */}
                <div className="bg-slate-50 rounded-xl border border-slate-200/80 p-3.5 space-y-2 text-xs">
                  {isDrive ? (
                    <>
                      <div className="flex justify-between gap-2">
                        <span className="text-slate-500">Google Account:</span>
                        <span className="font-mono font-bold text-slate-800">
                          {driveUserEmail || 'Not signed in (click Sign in with Google)'}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-slate-500">Target Drive Folder:</span>
                        <span className="font-mono font-bold text-indigo-700">
                          /{conn.driveFolderName || 'SmartAmarSchool-Backups'}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-slate-500">Token Storage Security:</span>
                        <span className="font-mono text-emerald-700 font-bold">
                          In-Memory OAuth (drive.file)
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between gap-2">
                        <span className="text-slate-500">S3 Bucket & Region:</span>
                        <span className="font-mono font-bold text-slate-800">
                          {conn.s3Bucket || 'Unconfigured'} ({conn.s3Region || 'ap-southeast-1'})
                        </span>
                      </div>
                      {conn.s3Endpoint && (
                        <div className="flex justify-between gap-2">
                          <span className="text-slate-500">Custom Endpoint:</span>
                          <span className="font-mono text-slate-700 truncate max-w-[240px]">
                            {conn.s3Endpoint}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between gap-2">
                        <span className="text-slate-500">Key Prefix / Access ID:</span>
                        <span className="font-mono text-slate-700">
                          {conn.s3Prefix || '/'} • {conn.s3AccessKeyId || 'Not set'}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-slate-500">Session Secret Key:</span>
                        <span
                          className={`font-mono font-bold flex items-center gap-1 ${
                            secretLoaded ? 'text-emerald-700' : 'text-amber-600'
                          }`}
                        >
                          <Lock className="w-3 h-3" />
                          {secretLoaded ? 'Loaded in Session Memory' : 'Enter Secret in Configure'}
                        </span>
                      </div>
                    </>
                  )}

                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      Triggers:{' '}
                      <strong className="text-slate-700">
                        {[
                          conn.syncOnManualExport && 'Manual Exports',
                          conn.syncOnScheduledBackup && 'Scheduled Runs'
                        ]
                          .filter(Boolean)
                          .join(' + ') || 'Manual Push Only'}
                      </strong>
                    </span>
                    <span className="font-mono">
                      {conn.totalSyncedFiles} synced ({formatBytes(conn.totalSyncedBytes)})
                    </span>
                  </div>
                </div>

                {conn.lastError && (
                  <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[11px] flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{conn.lastError}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                {isDrive ? (
                  needsDriveAuth ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="primary"
                      icon={KeyRound}
                      onClick={handleGoogleSignIn}
                      disabled={isConnectingDrive}
                    >
                      Sign in with Google
                    </Button>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        icon={CloudUpload}
                        disabled={isPushing}
                        onClick={() => handleConfirmPushToDriveOrS3(conn)}
                      >
                        Upload Now
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        icon={Folder}
                        onClick={() => handleOpenDriveBrowser(conn)}
                      >
                        Browse Drive Files
                      </Button>
                    </div>
                  )
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      icon={CloudUpload}
                      disabled={isPushing}
                      onClick={() => handleConfirmPushToDriveOrS3(conn)}
                    >
                      Push to S3
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      icon={testingConnId === conn.id ? Loader2 : ShieldCheck}
                      disabled={testingConnId === conn.id}
                      onClick={() => handleTestS3(conn)}
                    >
                      {testingConnId === conn.id ? 'Testing...' : 'Test SigV4'}
                    </Button>
                  </div>
                )}

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEditConnModal(conn)}
                    className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                    title="Configure Provider Settings"
                  >
                    <Settings2 className="w-4 h-4" />
                  </button>
                  {connections.length > 1 && conn.id !== 'EXT-GDRIVE-PRIMARY' && (
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmAction({
                          title: 'Remove External Storage Connection?',
                          description: `Remove "${conn.name}" from configured external backup providers? Existing files stored in the remote bucket will remain untouched.`,
                          confirmLabel: 'Remove Provider',
                          danger: true,
                          onConfirm: () => {
                            deleteExternalStorageConnection(conn.id);
                            refreshState();
                            addToast(`Removed provider "${conn.name}".`, 'info');
                          }
                        });
                      }}
                      className="p-2 rounded-lg border border-slate-200 text-rose-500 hover:bg-rose-50 cursor-pointer"
                      title="Remove Connection"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* REMOTE SYNC AUDIT LEDGER */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              External Cloud Replication & Sync Ledger
            </h3>
            <p className="text-xs text-slate-500">
              Real-time log of school database backups synced automatically or manually to Google Drive and AWS S3.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search file, tenant, S3 key..."
                value={ledgerSearch}
                onChange={e => setLedgerSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none w-52"
              />
            </div>

            <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-0.5 text-xs font-bold">
              {(
                [
                  { id: 'ALL', label: 'All' },
                  { id: 'GOOGLE_DRIVE', label: 'Google Drive' },
                  { id: 'AWS_S3', label: 'AWS S3' }
                ] as const
              ).map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setLedgerProviderFilter(tab.id)}
                  className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                    ledgerProviderFilter === tab.id
                      ? 'bg-white text-indigo-600 shadow-2xs'
                      : 'text-slate-500'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {syncLedger.length > 0 && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                icon={Trash2}
                onClick={() => {
                  clearExternalSyncLedger();
                  refreshState();
                }}
              >
                Clear Log
              </Button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
                <th className="py-3 px-3">Provider Target</th>
                <th className="py-3 px-3">Tenant & Archive File</th>
                <th className="py-3 px-3">Trigger Source</th>
                <th className="py-3 px-3">Remote Key / Drive ID</th>
                <th className="py-3 px-3">Status & Size</th>
                <th className="py-3 px-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLedger.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No cloud backup transfers logged yet. Sign in with Google or connect an AWS S3 bucket and click <strong>Sync Backup Now</strong>.
                  </td>
                </tr>
              ) : (
                filteredLedger.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{rec.connectionName}</div>
                      <Badge color={rec.provider === 'GOOGLE_DRIVE' ? 'blue' : 'yellow'}>
                        {rec.provider === 'GOOGLE_DRIVE' ? 'Google Drive' : 'AWS S3'}
                      </Badge>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-800">{rec.tenantName}</div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {rec.fileName} • {rec.checksum}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-medium">
                      {rec.triggerSource}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-mono text-[11px] text-slate-600 max-w-[240px] truncate">
                        {rec.remotePathOrId}
                      </div>
                      {rec.remoteUrl && (
                        <a
                          href={rec.remoteUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-indigo-600 hover:underline font-bold mt-0.5"
                        >
                          <span>Open Remote Object</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {rec.errorMessage && (
                        <div className="text-[10px] text-rose-600 mt-0.5 max-w-[260px]">
                          {rec.errorMessage}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <Badge
                        color={
                          rec.status === 'Synced'
                            ? 'green'
                            : rec.status === 'Failed'
                            ? 'red'
                            : 'yellow'
                        }
                      >
                        {rec.status}
                      </Badge>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                        {rec.sizeFormatted}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                      {new Date(rec.syncedAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ADD / EDIT STORAGE PROVIDER MODAL */}
      <Modal
        isOpen={isConnModalOpen}
        onClose={() => setIsConnModalOpen(false)}
        title={editingConnId ? 'Configure Cloud Storage Provider' : 'Connect External Storage Provider'}
      >
        <form onSubmit={handleSaveConnection} className="space-y-4 pt-2 max-h-[75vh] overflow-y-auto pr-1">
          {!editingConnId && (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Provider Type</label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'AWS_S3', label: 'AWS S3' },
                    { id: 'S3_COMPATIBLE', label: 'S3-Compatible' },
                    { id: 'GOOGLE_DRIVE', label: 'Google Drive' }
                  ] as const
                ).map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFormProvider(opt.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border cursor-pointer ${
                      formProvider === opt.id
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Connection Name</label>
              <input
                type="text"
                value={formName}
                onChange={e => setFormName(e.target.value)}
                placeholder="e.g. AWS S3 Production DR"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Tenant Sync Scope</label>
              <select
                value={formScope}
                onChange={e => setFormScope(e.target.value)}
                className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none"
              >
                <option value="ALL_TENANTS">ALL TENANTS ({tenants.length} Schools)</option>
                {tenants.map(t => (
                  <option key={t.id} value={t.subdomain}>
                    {t.name} ({t.subdomain})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {formProvider === 'GOOGLE_DRIVE' ? (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Google Drive Destination Folder Name
              </label>
              <input
                type="text"
                value={formDriveFolder}
                onChange={e => setFormDriveFolder(e.target.value)}
                placeholder="SmartAmarSchool-Backups"
                className="w-full text-xs font-mono p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none"
              />
            </div>
          ) : (
            <div className="space-y-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    S3 Bucket Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formS3Bucket}
                    onChange={e => setFormS3Bucket(e.target.value)}
                    placeholder="my-school-backups-bucket"
                    className="w-full text-xs font-mono p-2 rounded-lg border border-slate-200 bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    AWS Region *
                  </label>
                  <input
                    type="text"
                    required
                    value={formS3Region}
                    onChange={e => setFormS3Region(e.target.value)}
                    placeholder="ap-southeast-1"
                    className="w-full text-xs font-mono p-2 rounded-lg border border-slate-200 bg-white outline-none"
                  />
                </div>
              </div>

              {formProvider === 'S3_COMPATIBLE' && (
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Custom S3-Compatible Endpoint URL (Cloudflare R2 / MinIO / Spaces)
                  </label>
                  <input
                    type="url"
                    value={formS3Endpoint}
                    onChange={e => setFormS3Endpoint(e.target.value)}
                    placeholder="https://<accountid>.r2.cloudflarestorage.com"
                    className="w-full text-xs font-mono p-2 rounded-lg border border-slate-200 bg-white outline-none"
                  />
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Object Key Prefix
                </label>
                <input
                  type="text"
                  value={formS3Prefix}
                  onChange={e => setFormS3Prefix(e.target.value)}
                  placeholder="smart-amar-school/backups/"
                  className="w-full text-xs font-mono p-2 rounded-lg border border-slate-200 bg-white outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    AWS Access Key ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={formS3AccessKey}
                    onChange={e => setFormS3AccessKey(e.target.value)}
                    placeholder="AKIAIOSFODNN7EXAMPLE"
                    className="w-full text-xs font-mono p-2 rounded-lg border border-slate-200 bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    AWS Secret Access Key (Session Memory Only)
                  </label>
                  <input
                    type="password"
                    value={formS3SecretKey}
                    onChange={e => setFormS3SecretKey(e.target.value)}
                    placeholder="wJalrXUtnFEMI/K7MDENG/..."
                    className="w-full text-xs font-mono p-2 rounded-lg border border-slate-200 bg-white outline-none"
                  />
                </div>
              </div>
              <p className="text-[10px] text-slate-500">
                Requests are signed client-side via AWS Signature V4 (HMAC-SHA256). Secret Access Keys stay strictly in browser RAM during your session.
              </p>
            </div>
          )}

          <div className="space-y-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="font-bold text-slate-700">Automatic Sync Triggers</div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formSyncManual}
                onChange={e => setFormSyncManual(e.target.checked)}
              />
              <span>Auto-sync whenever a Manual or School Admin verified backup is exported</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formSyncScheduled}
                onChange={e => setFormSyncScheduled(e.target.checked)}
              />
              <span>Auto-sync whenever Scheduled Backups capture a verified snapshot</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsConnModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" icon={CheckCircle2}>
              {editingConnId ? 'Update Connection' : 'Save Provider'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* GOOGLE DRIVE BACKUP FILES BROWSER MODAL */}
      <Modal
        isOpen={!!driveFilesModalConn}
        onClose={() => setDriveFilesModalConn(null)}
        title={`Google Drive Vault — /${driveFilesModalConn?.driveFolderName || 'SmartAmarSchool-Backups'}`}
      >
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span>
              Account: <strong>{driveUserEmail}</strong>
            </span>
            <span className="font-mono">{driveFiles.length} app-created backup(s)</span>
          </div>

          {isLoadingDriveFiles ? (
            <div className="py-10 flex items-center justify-center gap-2 text-xs text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span>Fetching backup files from Google Drive...</span>
            </div>
          ) : driveFiles.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No backup archives uploaded to this Google Drive folder yet.
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {driveFiles.map(file => (
                <div
                  key={file.id}
                  className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-slate-900 truncate">{file.name}</div>
                    <div className="text-[10px] font-mono text-slate-400">
                      ID: {file.id} • {file.size ? formatBytes(Number(file.size)) : 'N/A'} •{' '}
                      {file.createdTime ? new Date(file.createdTime).toLocaleString() : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {file.webViewLink && (
                      <a
                        href={file.webViewLink}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                        title="Open in Google Drive"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => requestDeleteDriveFile(file)}
                      className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer"
                      title="Delete from Google Drive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setDriveFilesModalConn(null)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* EXPLICIT USER CONFIRMATION DIALOG FOR MUTATING/DELETING DRIVE OR PROVIDER DATA */}
      <Modal
        isOpen={!!confirmAction}
        onClose={() => !isConfirmBusy && setConfirmAction(null)}
        title={confirmAction?.title || 'Confirm Action'}
      >
        {confirmAction && (
          <div className="space-y-4 pt-2">
            <div
              className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                confirmAction.danger
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-indigo-50 border-indigo-200 text-indigo-900'
              }`}
            >
              {confirmAction.description}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isConfirmBusy}
                onClick={() => setConfirmAction(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant={confirmAction.danger ? 'danger' : 'primary'}
                size="sm"
                disabled={isConfirmBusy}
                onClick={async () => {
                  setIsConfirmBusy(true);
                  try {
                    await confirmAction.onConfirm();
                    setConfirmAction(null);
                  } catch (err: any) {
                    addToast(err?.message || 'Operation failed.', 'error');
                  } finally {
                    setIsConfirmBusy(false);
                  }
                }}
              >
                {isConfirmBusy ? 'Processing...' : confirmAction.confirmLabel}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
