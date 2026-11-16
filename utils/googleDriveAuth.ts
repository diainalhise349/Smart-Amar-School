import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

// Synchronized with configured OAuth scopes in Google Cloud project
export const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
SCOPES.forEach(scope => provider.addScope(scope));

// Strictly in-memory token cache (never persisted to localStorage or sessionStorage)
let isSigningIn = false;
let cachedAccessToken: string | null = null;
let cachedUser: User | null = null;

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime?: string;
  webViewLink?: string;
}

export const initDriveAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, (user: User | null) => {
    cachedUser = user;
    if (user && cachedAccessToken) {
      onAuthSuccess?.(user, cachedAccessToken);
    } else if (!user) {
      cachedAccessToken = null;
      onAuthFailure?.();
    } else if (!isSigningIn && !cachedAccessToken) {
      onAuthFailure?.();
    }
  });
};

export const signInWithGoogleDrive = async (): Promise<{
  user: User;
  accessToken: string;
}> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Google Drive access permission was not granted by the popup flow.');
    }
    cachedAccessToken = credential.accessToken;
    cachedUser = result.user;
    return { user: result.user, accessToken: cachedAccessToken };
  } finally {
    isSigningIn = false;
  }
};

export const getDriveAccessToken = (): string | null => cachedAccessToken;
export const getDriveSignedInUser = (): User | null => cachedUser || auth.currentUser;

export const disconnectGoogleDriveAuth = async (): Promise<void> => {
  cachedAccessToken = null;
  cachedUser = null;
  if (auth.currentUser) {
    await auth.signOut();
  }
};

/**
 * Finds or creates an app-owned backup folder in Google Drive under drive.file scope
 */
export const ensureDriveBackupFolder = async (
  folderName: string = 'SmartAmarSchool-Backups'
): Promise<{ id: string; name: string }> => {
  const token = getDriveAccessToken();
  if (!token) throw new Error('Google Drive session is not authenticated.');

  const safeName = folderName.replace(/'/g, "\\'");
  const q = encodeURIComponent(
    `mimeType='application/vnd.google-apps.folder' and name='${safeName}' and trashed=false`
  );
  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)&spaces=drive`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  if (!searchRes.ok) {
    const errText = await searchRes.text();
    throw new Error(`Google Drive folder lookup failed (${searchRes.status}): ${errText}`);
  }

  const searchJson = await searchRes.json();
  if (Array.isArray(searchJson.files) && searchJson.files.length > 0) {
    return { id: searchJson.files[0].id, name: searchJson.files[0].name };
  }

  const createRes = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder'
    })
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Google Drive folder creation failed (${createRes.status}): ${errText}`);
  }

  const created = await createRes.json();
  return { id: created.id, name: created.name };
};

/**
 * Uploads a verified school database backup file to Google Drive via multipart upload
 */
export const uploadBackupToGoogleDrive = async (params: {
  fileName: string;
  content: string;
  mimeType: string;
  folderId?: string;
  description?: string;
}): Promise<DriveFileItem> => {
  const token = getDriveAccessToken();
  if (!token) {
    throw new Error('Google Drive authentication token missing. Please click "Sign in with Google" first.');
  }

  const metadata: Record<string, unknown> = {
    name: params.fileName,
    mimeType: params.mimeType.split(';')[0],
    description: params.description || 'Smart Amar School Automated Tenant Database Backup'
  };
  if (params.folderId) {
    metadata.parents = [params.folderId];
  }

  const boundary = `-------smartamarschool_${Date.now().toString(36)}`;
  const multipartBody =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: ${params.mimeType.split(';')[0]}\r\n\r\n` +
    `${params.content}\r\n` +
    `--${boundary}--`;

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,createdTime,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: multipartBody
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google Drive upload failed (${res.status}): ${errText}`);
  }

  return (await res.json()) as DriveFileItem;
};

/**
 * Lists backup files created by the app inside Google Drive
 */
export const listDriveBackupFiles = async (folderId?: string): Promise<DriveFileItem[]> => {
  const token = getDriveAccessToken();
  if (!token) {
    throw new Error('Please sign in with Google to view your Google Drive backup files.');
  }

  const baseQuery = folderId
    ? `'${folderId}' in parents and trashed=false`
    : `mimeType!='application/vnd.google-apps.folder' and trashed=false`;
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
    baseQuery
  )}&orderBy=createdTime desc&pageSize=25&fields=files(id,name,mimeType,size,createdTime,webViewLink)`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Unable to list Google Drive backups (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return Array.isArray(data.files) ? data.files : [];
};

/**
 * Deletes an app-created backup file from Google Drive (requires prior explicit user confirmation)
 */
export const deleteDriveBackupFile = async (fileId: string): Promise<void> => {
  const token = getDriveAccessToken();
  if (!token) {
    throw new Error('Please sign in with Google before deleting files from Google Drive.');
  }

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok && res.status !== 204) {
    const errText = await res.text();
    throw new Error(`Failed to delete Google Drive file (${res.status}): ${errText}`);
  }
};
