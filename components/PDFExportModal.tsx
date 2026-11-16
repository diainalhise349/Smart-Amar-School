import React from 'react';
import { PrintExportUtilityModal } from './PrintExportUtility';

export interface PDFExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  defaultSubtitle?: string;
  moduleType: 'students' | 'performance' | 'seatplan' | 'fees' | 'library_catalog' | 'library_borrows' | 'library_overdue' | 'student_progress' | 'general';
  data: any[];
  availableClasses?: string[];
  filterContext?: Record<string, string>;
  institutionInfo?: any;
}

export const PDFExportModal: React.FC<PDFExportModalProps> = (props) => {
  return <PrintExportUtilityModal {...props} />;
};

export default PDFExportModal;
