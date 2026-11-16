import { formatBytes } from './documentStorage';
import {
  getDriveAccessToken,
  getDriveSignedInUser,
  ensureDriveBackupFolder,
  uploadBackupToGoogleDrive
} from './googleDriveAuth';

export type ExternalProviderType = 'GOOGLE_DRIVE' | 'AWS_S3' | 'S3_COMPATIBLE';

export interface ExternalStorageConnection {
  id: string;
  provider: ExternalProviderType;
  name: string;
  status: 'Connected' | 'Disconnected' | 'Auth Required' | 'Error';
  autoSyncEnabled: boolean;
  syncOnManualExport: boolean;
  syncOnScheduledBackup: boolean;
  targetScope: 'ALL_TENANTS' | string;
  // Google Drive settings
  driveAccountEmail?: string;
  driveFolderName?: string;
  driveFolderId?: string;
  // AWS S3 / S3-compatible settings
  s3Bucket?: string;
  s3Region?: string;
  s3Endpoint?: string;
  s3Prefix?: string;
  s3AccessKeyId?: string;
  lastSyncedAt?: string;
  totalSyncedFiles: number;
  totalSyncedBytes: number;
  lastError?: string;
  createdAt: string;
}

export interface ExternalSyncRecord {
  id: string;
  connectionId: string;
  connectionName: string;
  provider: ExternalProviderType;
  backupId: string;
  tenantSubdomain: string;
  tenantName: string;
  fileName: string;
  format: 'JSON' | 'CSV';
  sizeBytes: number;
  sizeFormatted: string;
  checksum: string;
  triggerSource: 'Auto-Sync (Manual Export)' | 'Auto-Sync (Scheduled Backup)' | 'Manual Push';
  remotePathOrId: string;
  remoteUrl?: string;
  status: 'Synced' | 'Failed' | 'Queued (Auth Required)';
  errorMessage?: string;
  syncedAt: string;
}

const CONNECTIONS_KEY = 'smart_amar_school_external_storage_connections_v1';
const SYNC_LEDGER_KEY = 'smart_amar_school_external_sync_ledger_v1';
export const EXTERNAL_STORAGE_EVENT = 'smart-amar-school-external-storage-updated';

// Keep AWS S3 Secret Access Keys strictly in memory during session
const s3SecretKeyMemoryMap = new Map<string, string>();

export const setS3SecretKeyInMemory = (connectionId: string, secretKey: string): void => {
  const trimmed = secretKey.trim();
  if (trimmed) {
    s3SecretKeyMemoryMap.set(connectionId, trimmed);
  } else {
    s3SecretKeyMemoryMap.delete(connectionId);
  }
  window.dispatchEvent(new CustomEvent(EXTERNAL_STORAGE_EVENT));
};

export const hasS3SecretKeyInMemory = (connectionId: string): boolean => {
  return Boolean(s3SecretKeyMemoryMap.get(connectionId));
};

export const getS3SecretKeyFromMemory = (connectionId: string): string | undefined => {
  return s3SecretKeyMemoryMap.get(connectionId);
};

const createSeedConnections = (): ExternalStorageConnection[] => {
  const now = new Date().toISOString();
  return [
    {
      id: 'EXT-GDRIVE-PRIMARY',
      provider: 'GOOGLE_DRIVE',
      name: 'Google Drive Institutional Vault',
      status: getDriveAccessToken() ? 'Connected' : 'Auth Required',
      autoSyncEnabled: false,
      syncOnManualExport: true,
      syncOnScheduledBackup: true,
      targetScope: 'ALL_TENANTS',
      driveFolderName: 'SmartAmarSchool-Backups',
      totalSyncedFiles: 0,
      totalSyncedBytes: 0,
      createdAt: now
    },
    {
      id: 'EXT-S3-ARCHIVE',
      provider: 'AWS_S3',
      name: 'AWS S3 Disaster Recovery Bucket',
      status: 'Disconnected',
      autoSyncEnabled: false,
      syncOnManualExport: true,
      syncOnScheduledBackup: true,
      targetScope: 'ALL_TENANTS',
      s3Bucket: 'smart-amar-school-dr-backups',
      s3Region: 'ap-southeast-1',
      s3Prefix: 'tenants/',
      s3AccessKeyId: '',
      totalSyncedFiles: 0,
      totalSyncedBytes: 0,
      createdAt: now
    }
  ];
};

export const getExternalStorageConnections = (): ExternalStorageConnection[] => {
  try {
    const raw = localStorage.getItem(CONNECTIONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Reflect live in-memory Drive & S3 auth state accurately
        const driveToken = getDriveAccessToken();
        const driveUser = getDriveSignedInUser();
        return parsed.map((conn: ExternalStorageConnection) => {
          if (conn.provider === 'GOOGLE_DRIVE') {
            return {
              ...conn,
              driveAccountEmail: driveUser?.email || conn.driveAccountEmail,
              status: driveToken ? 'Connected' : 'Auth Required'
            };
          }
          return conn;
        });
      }
    }
    const seeded = createSeedConnections();
    localStorage.setItem(CONNECTIONS_KEY, JSON.stringify(seeded));
    return seeded;
  } catch {
    return [];
  }
};

export const saveExternalStorageConnection = (
  input: Omit<ExternalStorageConnection, 'id' | 'createdAt' | 'totalSyncedFiles' | 'totalSyncedBytes'> & {
    id?: string;
  },
  s3SecretKey?: string
): ExternalStorageConnection => {
  const existing = getExternalStorageConnections();
  let saved: ExternalStorageConnection;

  if (input.id) {
    const idx = existing.findIndex(c => c.id === input.id);
    if (idx !== -1) {
      saved = {
        ...existing[idx],
        ...input,
        id: input.id
      };
      existing[idx] = saved;
      localStorage.setItem(CONNECTIONS_KEY, JSON.stringify(existing));
      if (s3SecretKey !== undefined) setS3SecretKeyInMemory(saved.id, s3SecretKey);
      window.dispatchEvent(new CustomEvent(EXTERNAL_STORAGE_EVENT, { detail: saved }));
      return saved;
    }
  }

  saved = {
    ...input,
    id: `EXT-${input.provider === 'GOOGLE_DRIVE' ? 'GD' : 'S3'}-${Date.now().toString(36).toUpperCase()}`,
    totalSyncedFiles: 0,
    totalSyncedBytes: 0,
    createdAt: new Date().toISOString()
  };

  const next = [...existing, saved];
  localStorage.setItem(CONNECTIONS_KEY, JSON.stringify(next));
  if (s3SecretKey !== undefined) setS3SecretKeyInMemory(saved.id, s3SecretKey);
  window.dispatchEvent(new CustomEvent(EXTERNAL_STORAGE_EVENT, { detail: saved }));
  return saved;
};

export const updateExternalStorageConnection = (
  id: string,
  updates: Partial<ExternalStorageConnection>
): ExternalStorageConnection | null => {
  const current = getExternalStorageConnections();
  const idx = current.findIndex(c => c.id === id);
  if (idx === -1) return null;
  const updated: ExternalStorageConnection = { ...current[idx], ...updates };
  current[idx] = updated;
  localStorage.setItem(CONNECTIONS_KEY, JSON.stringify(current));
  window.dispatchEvent(new CustomEvent(EXTERNAL_STORAGE_EVENT, { detail: updated }));
  return updated;
};

export const deleteExternalStorageConnection = (id: string): void => {
  const remaining = getExternalStorageConnections().filter(c => c.id !== id);
  s3SecretKeyMemoryMap.delete(id);
  localStorage.setItem(CONNECTIONS_KEY, JSON.stringify(remaining));
  window.dispatchEvent(new CustomEvent(EXTERNAL_STORAGE_EVENT));
};

export const getExternalSyncLedger = (): ExternalSyncRecord[] => {
  try {
    const raw = localStorage.getItem(SYNC_LEDGER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
    return [];
  } catch {
    return [];
  }
};

const saveSyncRecord = (record: ExternalSyncRecord): void => {
  try {
    const current = getExternalSyncLedger();
    const updated = [record, ...current].slice(0, 80);
    localStorage.setItem(SYNC_LEDGER_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(EXTERNAL_STORAGE_EVENT, { detail: updated }));
  } catch (err) {
    console.error('Failed to persist external sync record:', err);
  }
};

export const clearExternalSyncLedger = (): void => {
  localStorage.setItem(SYNC_LEDGER_KEY, JSON.stringify([]));
  window.dispatchEvent(new CustomEvent(EXTERNAL_STORAGE_EVENT));
};

// ============================================================================
// AWS SIGNATURE V4 (WEB CRYPTO API) UPLOAD & CONNECTION VERIFICATION
// ============================================================================

const toHex = (buffer: ArrayBuffer): string =>
  Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

const sha256Hex = async (data: string): Promise<string> => {
  const encoded = new TextEncoder().encode(data);
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return toHex(digest);
};

const hmacSha256 = async (key: Uint8Array | ArrayBuffer, data: string): Promise<ArrayBuffer> => {
  const keyBytes = key instanceof Uint8Array ? key : new Uint8Array(key);
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes.buffer as ArrayBuffer,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  return crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(data));
};

const getSigV4SigningKey = async (
  secretKey: string,
  dateStamp: string,
  region: string,
  service: string
): Promise<ArrayBuffer> => {
  const kSecret = new TextEncoder().encode(`AWS4${secretKey}`);
  const kDate = await hmacSha256(kSecret, dateStamp);
  const kRegion = await hmacSha256(kDate, region);
  const kService = await hmacSha256(kRegion, service);
  return hmacSha256(kService, 'aws4_request');
};

const buildS3TargetUrl = (
  conn: ExternalStorageConnection,
  objectKey: string
): { url: string; host: string; canonicalUri: string } => {
  const bucket = (conn.s3Bucket || '').trim();
  const region = (conn.s3Region || 'us-east-1').trim();
  const cleanKey = objectKey.replace(/^\/+/, '');
  const encodedKey = cleanKey
    .split('/')
    .map(seg => encodeURIComponent(seg))
    .join('/');

  if (conn.s3Endpoint && conn.s3Endpoint.trim()) {
    const base = conn.s3Endpoint.trim().replace(/\/+$/, '');
    const parsed = new URL(base);
    const pathPrefix = parsed.pathname.replace(/\/+$/, '');
    const canonicalUri = `${pathPrefix}/${encodeURIComponent(bucket)}/${encodedKey}`;
    return {
      url: `${parsed.origin}${canonicalUri}`,
      host: parsed.host,
      canonicalUri
    };
  }

  const host = `${bucket}.s3.${region}.amazonaws.com`;
  const canonicalUri = `/${encodedKey}`;
  return {
    url: `https://${host}${canonicalUri}`,
    host,
    canonicalUri
  };
};

export const signAndExecuteS3Request = async (params: {
  connection: ExternalStorageConnection;
  secretAccessKey: string;
  method: 'PUT' | 'GET' | 'HEAD';
  objectKey: string;
  queryString?: string;
  payload?: string;
  contentType?: string;
  metadataChecksum?: string;
}): Promise<{ ok: boolean; status: number; url: string; etag?: string; error?: string }> => {
  const accessKeyId = (params.connection.s3AccessKeyId || '').trim();
  const secret = params.secretAccessKey.trim();
  const region = (params.connection.s3Region || 'us-east-1').trim();

  if (!params.connection.s3Bucket || !accessKeyId || !secret) {
    throw new Error('AWS S3 Bucket, Access Key ID, and Secret Access Key are required.');
  }

  const { url, host, canonicalUri } = buildS3TargetUrl(params.connection, params.objectKey);
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);

  const bodyStr = params.payload || '';
  const payloadHash = await sha256Hex(bodyStr);

  const headerPairs: Array<[string, string]> = [
    ['host', host],
    ['x-amz-content-sha256', payloadHash],
    ['x-amz-date', amzDate]
  ];
  if (params.metadataChecksum) {
    headerPairs.push(['x-amz-meta-backup-checksum', params.metadataChecksum]);
  }
  headerPairs.sort((a, b) => a[0].localeCompare(b[0]));

  const canonicalHeaders = headerPairs.map(([k, v]) => `${k}:${v}\n`).join('');
  const signedHeaders = headerPairs.map(([k]) => k).join(';');
  const canonicalQuery = params.queryString || '';

  const canonicalRequest = [
    params.method,
    canonicalUri,
    canonicalQuery,
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join('\n');

  const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    await sha256Hex(canonicalRequest)
  ].join('\n');

  const signingKey = await getSigV4SigningKey(secret, dateStamp, region, 's3');
  const signature = toHex(await hmacSha256(signingKey, stringToSign));

  const authorizationHeader = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const headers: Record<string, string> = {
    Authorization: authorizationHeader,
    'x-amz-date': amzDate,
    'x-amz-content-sha256': payloadHash
  };
  if (params.contentType) {
    headers['Content-Type'] = params.contentType;
  }
  if (params.metadataChecksum) {
    headers['x-amz-meta-backup-checksum'] = params.metadataChecksum;
  }

  const fullUrl = canonicalQuery ? `${url}?${canonicalQuery}` : url;
  const response = await fetch(fullUrl, {
    method: params.method,
    headers,
    body: params.method === 'PUT' ? bodyStr : undefined
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    return {
      ok: false,
      status: response.status,
      url: fullUrl,
      error: errBody || `HTTP ${response.status} ${response.statusText}`
    };
  }

  return {
    ok: true,
    status: response.status,
    url: fullUrl,
    etag: response.headers.get('etag') || undefined
  };
};

export const testS3Connection = async (
  connection: ExternalStorageConnection,
  secretAccessKey: string
): Promise<{ ok: boolean; message: string; endpointUrl: string }> => {
  const bucket = (connection.s3Bucket || '').trim();
  const region = (connection.s3Region || 'us-east-1').trim();
  const { url } = buildS3TargetUrl(connection, '');

  try {
    const res = await signAndExecuteS3Request({
      connection,
      secretAccessKey,
      method: 'GET',
      objectKey: '',
      queryString: 'list-type=2&max-keys=1'
    });

    if (res.ok) {
      updateExternalStorageConnection(connection.id, { status: 'Connected', lastError: undefined });
      return {
        ok: true,
        message: `Verified AWS SigV4 handshake against bucket "${bucket}" (${region}).`,
        endpointUrl: url
      };
    }

    updateExternalStorageConnection(connection.id, { status: 'Error', lastError: res.error });
    return {
      ok: false,
      message: res.error || `S3 returned HTTP ${res.status}`,
      endpointUrl: url
    };
  } catch (err: any) {
    const msg = err?.message || 'Network/CORS blocked direct browser probe.';
    updateExternalStorageConnection(connection.id, { status: 'Error', lastError: msg });
    return {
      ok: false,
      message: `${msg} Ensure your S3 bucket CORS policy allows PUT/GET from ${window.location.origin}.`,
      endpointUrl: url
    };
  }
};

// ============================================================================
// SYNC DISPATCHER (MANUAL & AUTOMATIC ON EXPORT / SCHEDULE)
// ============================================================================

export const syncBackupToConnection = async (params: {
  connectionId: string;
  backupId: string;
  tenantSubdomain: string;
  tenantName: string;
  fileName: string;
  format: 'JSON' | 'CSV';
  content: string;
  checksum: string;
  triggerSource: ExternalSyncRecord['triggerSource'];
}): Promise<ExternalSyncRecord> => {
  const conn = getExternalStorageConnections().find(c => c.id === params.connectionId);
  if (!conn) {
    throw new Error('External storage provider connection not found.');
  }

  const sizeBytes = new Blob([params.content]).size;
  const mimeType =
    params.format === 'JSON' ? 'application/json;charset=utf-8;' : 'text/csv;charset=utf-8;';

  if (conn.provider === 'GOOGLE_DRIVE') {
    const token = getDriveAccessToken();
    if (!token) {
      const queued: ExternalSyncRecord = {
        id: `SYN-${Date.now().toString(36).toUpperCase()}`,
        connectionId: conn.id,
        connectionName: conn.name,
        provider: conn.provider,
        backupId: params.backupId,
        tenantSubdomain: params.tenantSubdomain,
        tenantName: params.tenantName,
        fileName: params.fileName,
        format: params.format,
        sizeBytes,
        sizeFormatted: formatBytes(sizeBytes),
        checksum: params.checksum,
        triggerSource: params.triggerSource,
        remotePathOrId: 'Pending Google Sign-In',
        status: 'Queued (Auth Required)',
        errorMessage: 'Sign in with Google to authorize Drive upload.',
        syncedAt: new Date().toISOString()
      };
      saveSyncRecord(queued);
      updateExternalStorageConnection(conn.id, {
        status: 'Auth Required',
        lastError: queued.errorMessage
      });
      return queued;
    }

    try {
      const folder = await ensureDriveBackupFolder(
        conn.driveFolderName || 'SmartAmarSchool-Backups'
      );
      const uploaded = await uploadBackupToGoogleDrive({
        fileName: params.fileName,
        content: params.content,
        mimeType,
        folderId: folder.id,
        description: `Smart Amar School Tenant Backup (${params.tenantName}) • Checksum: ${params.checksum}`
      });

      const rec: ExternalSyncRecord = {
        id: `SYN-${Date.now().toString(36).toUpperCase()}`,
        connectionId: conn.id,
        connectionName: conn.name,
        provider: conn.provider,
        backupId: params.backupId,
        tenantSubdomain: params.tenantSubdomain,
        tenantName: params.tenantName,
        fileName: params.fileName,
        format: params.format,
        sizeBytes,
        sizeFormatted: formatBytes(sizeBytes),
        checksum: params.checksum,
        triggerSource: params.triggerSource,
        remotePathOrId: `${folder.name}/${uploaded.name} (${uploaded.id})`,
        remoteUrl: uploaded.webViewLink,
        status: 'Synced',
        syncedAt: new Date().toISOString()
      };

      saveSyncRecord(rec);
      updateExternalStorageConnection(conn.id, {
        status: 'Connected',
        driveFolderId: folder.id,
        driveAccountEmail: getDriveSignedInUser()?.email || conn.driveAccountEmail,
        lastSyncedAt: rec.syncedAt,
        totalSyncedFiles: (conn.totalSyncedFiles || 0) + 1,
        totalSyncedBytes: (conn.totalSyncedBytes || 0) + sizeBytes,
        lastError: undefined
      });
      return rec;
    } catch (err: any) {
      const rec: ExternalSyncRecord = {
        id: `SYN-${Date.now().toString(36).toUpperCase()}`,
        connectionId: conn.id,
        connectionName: conn.name,
        provider: conn.provider,
        backupId: params.backupId,
        tenantSubdomain: params.tenantSubdomain,
        tenantName: params.tenantName,
        fileName: params.fileName,
        format: params.format,
        sizeBytes,
        sizeFormatted: formatBytes(sizeBytes),
        checksum: params.checksum,
        triggerSource: params.triggerSource,
        remotePathOrId: 'Google Drive Upload Failed',
        status: 'Failed',
        errorMessage: err?.message || 'Google Drive upload error',
        syncedAt: new Date().toISOString()
      };
      saveSyncRecord(rec);
      updateExternalStorageConnection(conn.id, {
        status: 'Error',
        lastError: rec.errorMessage
      });
      return rec;
    }
  }

  // AWS S3 or S3-Compatible Target
  const secretKey = getS3SecretKeyFromMemory(conn.id);
  const prefix = (conn.s3Prefix || 'backups/').replace(/^\/+|\/+$/g, '');
  const objectKey = `${prefix ? `${prefix}/` : ''}${params.tenantSubdomain}/${params.fileName}`;

  if (!secretKey || !conn.s3AccessKeyId || !conn.s3Bucket) {
    const failedRec: ExternalSyncRecord = {
      id: `SYN-${Date.now().toString(36).toUpperCase()}`,
      connectionId: conn.id,
      connectionName: conn.name,
      provider: conn.provider,
      backupId: params.backupId,
      tenantSubdomain: params.tenantSubdomain,
      tenantName: params.tenantName,
      fileName: params.fileName,
      format: params.format,
      sizeBytes,
      sizeFormatted: formatBytes(sizeBytes),
      checksum: params.checksum,
      triggerSource: params.triggerSource,
      remotePathOrId: `s3://${conn.s3Bucket || 'unconfigured'}/${objectKey}`,
      status: 'Queued (Auth Required)',
      errorMessage: 'AWS S3 Access Key or Secret Key is not loaded in active session.',
      syncedAt: new Date().toISOString()
    };
    saveSyncRecord(failedRec);
    updateExternalStorageConnection(conn.id, {
      status: 'Auth Required',
      lastError: failedRec.errorMessage
    });
    return failedRec;
  }

  try {
    const res = await signAndExecuteS3Request({
      connection: conn,
      secretAccessKey: secretKey,
      method: 'PUT',
      objectKey,
      payload: params.content,
      contentType: mimeType.split(';')[0],
      metadataChecksum: params.checksum
    });

    if (res.ok) {
      const rec: ExternalSyncRecord = {
        id: `SYN-${Date.now().toString(36).toUpperCase()}`,
        connectionId: conn.id,
        connectionName: conn.name,
        provider: conn.provider,
        backupId: params.backupId,
        tenantSubdomain: params.tenantSubdomain,
        tenantName: params.tenantName,
        fileName: params.fileName,
        format: params.format,
        sizeBytes,
        sizeFormatted: formatBytes(sizeBytes),
        checksum: params.checksum,
        triggerSource: params.triggerSource,
        remotePathOrId: `s3://${conn.s3Bucket}/${objectKey}`,
        remoteUrl: res.url,
        status: 'Synced',
        syncedAt: new Date().toISOString()
      };
      saveSyncRecord(rec);
      updateExternalStorageConnection(conn.id, {
        status: 'Connected',
        lastSyncedAt: rec.syncedAt,
        totalSyncedFiles: (conn.totalSyncedFiles || 0) + 1,
        totalSyncedBytes: (conn.totalSyncedBytes || 0) + sizeBytes,
        lastError: undefined
      });
      return rec;
    }

    throw new Error(res.error || `S3 upload failed with HTTP ${res.status}`);
  } catch (err: any) {
    const rec: ExternalSyncRecord = {
      id: `SYN-${Date.now().toString(36).toUpperCase()}`,
      connectionId: conn.id,
      connectionName: conn.name,
      provider: conn.provider,
      backupId: params.backupId,
      tenantSubdomain: params.tenantSubdomain,
      tenantName: params.tenantName,
      fileName: params.fileName,
      format: params.format,
      sizeBytes,
      sizeFormatted: formatBytes(sizeBytes),
      checksum: params.checksum,
      triggerSource: params.triggerSource,
      remotePathOrId: `s3://${conn.s3Bucket}/${objectKey}`,
      status: 'Failed',
      errorMessage: `${err?.message || 'S3 upload failed'} (verify bucket credentials and CORS PUT access).`,
      syncedAt: new Date().toISOString()
    };
    saveSyncRecord(rec);
    updateExternalStorageConnection(conn.id, {
      status: 'Error',
      lastError: rec.errorMessage
    });
    return rec;
  }
};

/**
 * Automatically dispatches a verified backup payload to every armed External Storage connection
 * matching the export trigger and tenant scope.
 */
export const triggerAutoSyncForBackup = async (params: {
  backupId: string;
  tenantSubdomain: string;
  tenantName: string;
  fileName: string;
  format: 'JSON' | 'CSV';
  content: string;
  checksum: string;
  triggerType: 'manual' | 'scheduled';
}): Promise<ExternalSyncRecord[]> => {
  const connections = getExternalStorageConnections();
  const matching = connections.filter(conn => {
    if (!conn.autoSyncEnabled) return false;
    if (params.triggerType === 'manual' && !conn.syncOnManualExport) return false;
    if (params.triggerType === 'scheduled' && !conn.syncOnScheduledBackup) return false;
    if (
      conn.targetScope !== 'ALL_TENANTS' &&
      conn.targetScope.toLowerCase() !== params.tenantSubdomain.toLowerCase()
    ) {
      return false;
    }
    return true;
  });

  if (matching.length === 0) return [];

  const triggerSource: ExternalSyncRecord['triggerSource'] =
    params.triggerType === 'scheduled'
      ? 'Auto-Sync (Scheduled Backup)'
      : 'Auto-Sync (Manual Export)';

  const results = await Promise.all(
    matching.map(conn =>
      syncBackupToConnection({
        connectionId: conn.id,
        backupId: params.backupId,
        tenantSubdomain: params.tenantSubdomain,
        tenantName: params.tenantName,
        fileName: params.fileName,
        format: params.format,
        content: params.content,
        checksum: params.checksum,
        triggerSource
      })
    )
  );

  return results;
};
