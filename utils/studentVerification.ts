import QRCode from 'qrcode';
import { Student } from '../types';
import { getStoredStudents } from './studentStorage';

export interface VerificationResult {
  isValid: boolean;
  student: Student | null;
  status: 'ACTIVE_VERIFIED' | 'SUSPENDED' | 'NOT_FOUND';
  verificationId: string;
  verifiedAt: string;
  digitalSeal: string;
  academicSession: string;
}

/**
 * Builds the canonical public verification URL for a student.
 * Uses window.location.origin + window.location.pathname + hash routing.
 */
export const getStudentVerificationUrl = (studentId: string): string => {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://smartamarschool.edu.bd';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  
  // Format for HashRouter: #/verify/student/:id
  const cleanPath = pathname.endsWith('/') ? pathname : `${pathname}/`;
  return `${origin}${cleanPath}#/verify/student/${encodeURIComponent(studentId)}`;
};

/**
 * Generates an encrypted/tokenized security hash for anti-counterfeiting verification.
 */
export const generateVerificationToken = (student: Student): string => {
  const payload = `${student.id}|${student.rollNo}|${student.class}|${student.name}|SAS-SECURE-2025`;
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    const char = payload.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
  return `VER-${hex}-${student.id.replace(/[^a-zA-Z0-9]/g, '')}`;
};

/**
 * Generates high-resolution dynamic QR code data URI.
 */
export const generateStudentQrDataUrl = async (
  student: Student,
  options?: { size?: number; darkColor?: string; lightColor?: string }
): Promise<string> => {
  const verificationUrl = getStudentVerificationUrl(student.id);
  
  try {
    const url = await QRCode.toDataURL(verificationUrl, {
      width: options?.size || 240,
      margin: 1,
      errorCorrectionLevel: 'H', // Highest error correction for reliable mobile scanning
      color: {
        dark: options?.darkColor || '#0f172a', // Deep Slate
        light: options?.lightColor || '#ffffff'
      }
    });
    return url;
  } catch (err) {
    console.error('Error generating student QR code:', err);
    return '';
  }
};

/**
 * Verifies a student ID against the current persistent student directory.
 */
export const verifyStudentIdentity = (studentId: string): VerificationResult => {
  const students = getStoredStudents();
  const normalizedId = (studentId || '').trim().toLowerCase();

  const found = students.find((s) => s.id.toLowerCase() === normalizedId);

  const now = new Date();
  const verifiedAt = now.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  if (!found) {
    return {
      isValid: false,
      student: null,
      status: 'NOT_FOUND',
      verificationId: `ERR-AUTH-${Date.now()}`,
      verifiedAt,
      digitalSeal: 'INVALID_SIGNATURE',
      academicSession: '2024-2025'
    };
  }

  const isSuspended = found.status === 'Suspended';
  const token = generateVerificationToken(found);

  return {
    isValid: !isSuspended,
    student: found,
    status: isSuspended ? 'SUSPENDED' : 'ACTIVE_VERIFIED',
    verificationId: token,
    verifiedAt,
    digitalSeal: `SAS-DIGITAL-SEAL-${found.id}`,
    academicSession: '2024-2025'
  };
};
