import React from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCheck2,
  Hash,
  Clock,
  Layers
} from 'lucide-react';
import { Modal, Button, Badge } from './UIComponents';
import { BackupHealthCheckReport } from '../utils/tenantBackupExport';
import { formatBytes } from '../utils/documentStorage';

interface BackupHealthCheckModalProps {
  report: BackupHealthCheckReport | null;
  onClose: () => void;
}

export const BackupHealthCheckModal: React.FC<BackupHealthCheckModalProps> = ({
  report,
  onClose
}) => {
  return (
    <Modal
      isOpen={!!report}
      onClose={onClose}
      title={
        report?.passed
          ? `Backup Health Check PASSED — ${report.fileName}`
          : `Backup Health Check FAILED — ${report?.fileName || ''}`
      }
    >
      {report && (
        <div className="space-y-4 pt-2">
          {/* Top Verdict Banner */}
          <div
            className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
              report.passed
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-xl shrink-0 ${
                  report.passed ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                }`}
              >
                {report.passed ? (
                  <ShieldCheck className="w-5 h-5" />
                ) : (
                  <ShieldAlert className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-sm">
                    {report.passed
                      ? 'Integrity Verified & Approved for Export'
                      : 'Integrity Verification Failed — Export Blocked'}
                  </span>
                  <Badge color={report.passed ? 'green' : 'red'}>
                    {report.overallStatus}
                  </Badge>
                </div>
                <p className="text-xs opacity-80 mt-0.5">
                  Source: <strong>{report.source}</strong> • Checked in{' '}
                  <span className="font-mono font-bold">{report.durationMs}ms</span> at{' '}
                  {new Date(report.checkedAt).toLocaleString()}
                </p>
                {report.failureReason && (
                  <p className="text-xs font-bold text-rose-700 mt-1">
                    Failure Reason: {report.failureReason}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Summary Telemetry Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                <FileCheck2 className="w-3 h-3" /> Format & Size
              </div>
              <div className="font-mono font-bold text-slate-800 mt-0.5">
                {report.format} • {formatBytes(report.byteSize)}
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                <Layers className="w-3 h-3" /> Record Parity
              </div>
              <div className="font-mono font-bold text-slate-800 mt-0.5">
                {report.parsedRecords} / {report.expectedRecords} rows
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 col-span-2">
              <div className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                <Hash className="w-3 h-3" /> Serialized Payload Digest
              </div>
              <div className="font-mono font-bold text-indigo-700 mt-0.5 truncate">
                {report.payloadHash}
              </div>
            </div>
          </div>

          {/* Checksum Comparison Box */}
          <div className="p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-400">Expected Snapshot Checksum:</span>
              <span className="text-emerald-400 font-bold">{report.expectedChecksum}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-400">Recomputed Header Checksum:</span>
              <span
                className={`font-bold ${
                  report.actualChecksum === report.expectedChecksum
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                }`}
              >
                {report.actualChecksum}
              </span>
            </div>
          </div>

          {/* 5-Point Verification Checklist */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>5-Point Integrity Verification Checklist</span>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {report.checks.map(chk => (
                <div
                  key={chk.key}
                  className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                    chk.status === 'PASS'
                      ? 'bg-emerald-50/50 border-emerald-200/80'
                      : chk.status === 'WARN'
                      ? 'bg-amber-50/50 border-amber-200/80'
                      : 'bg-rose-50/60 border-rose-200'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {chk.status === 'PASS' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : chk.status === 'WARN' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900">{chk.label}</span>
                      <span
                        className={`text-[10px] font-mono font-black px-1.5 py-0.5 rounded ${
                          chk.status === 'PASS'
                            ? 'bg-emerald-100 text-emerald-700'
                            : chk.status === 'WARN'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {chk.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">{chk.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <Button type="button" variant="primary" size="sm" onClick={onClose}>
              Close Diagnostic Report
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
