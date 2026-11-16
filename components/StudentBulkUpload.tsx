import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, AlertCircle, 
  XCircle, ArrowRight, ArrowLeft, Download, RefreshCw, Trash2, 
  Edit3, Check, X, Users, Sparkles, Filter, Database, 
  HelpCircle, ShieldCheck, ChevronDown, CheckCheck, FileText, Plus
} from 'lucide-react';
import { Button, Card, Badge, Modal, useToast } from './UIComponents';
import { 
  Student, 
  StudentSchemaField, 
  ValidatedStudentRow, 
  CsvBulkUploadResult,
  StudentFieldDefinition 
} from '../types';
import { 
  STUDENT_SCHEMA_DEFINITIONS, 
  autoDetectColumnMapping, 
  parseCsvText, 
  validateStudentRow, 
  downloadSampleCsvFile,
  generateSampleCsvContent 
} from '../utils/csvSchemaValidator';
import { 
  getStoredStudents, 
  bulkAddStudents, 
  generateNextStudentId 
} from '../utils/studentStorage';

interface StudentBulkUploadProps {
  onSuccess?: (result: CsvBulkUploadResult) => void;
  onCancel?: () => void;
  isModal?: boolean;
}

export const StudentBulkUpload: React.FC<StudentBulkUploadProps> = ({
  onSuccess,
  onCancel,
  isModal = false
}) => {
  const { addToast } = useToast();

  // Wizard Step: 1 = Upload, 2 = Mapping, 3 = Validation & Preview, 4 = Result
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Raw file state
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<number>(0);
  const [csvRawText, setCsvRawText] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [isPasteModeOpen, setIsPasteModeOpen] = useState<boolean>(false);

  // Parsed headers and rows
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<Record<string, string>[]>([]);

  // Column mapping: csvHeader -> schemaKey
  const [columnMapping, setColumnMapping] = useState<Record<string, StudentSchemaField | ''>>({});

  // Duplicate resolution strategy
  const [duplicateStrategy, setDuplicateStrategy] = useState<'update_existing' | 'skip_existing' | 'add_all'>('update_existing');
  const [skipInvalidRows, setSkipInvalidRows] = useState<boolean>(false);

  // Table filter state in Step 3
  const [validationFilter, setValidationFilter] = useState<'all' | 'errors' | 'warnings' | 'valid'>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Editing a specific row inline in Step 3
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [editingRowValues, setEditingRowValues] = useState<Record<string, string>>({});

  // Import execution state
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importResult, setImportResult] = useState<CsvBulkUploadResult | null>(null);

  // Existing database students
  const [existingStudents, setExistingStudents] = useState<Student[]>(() => getStoredStudents());

  useEffect(() => {
    setExistingStudents(getStoredStudents());
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Process raw CSV string into headers and rows
  const processCsvContent = (content: string, name = 'uploaded_students.csv', size = 0) => {
    try {
      const parsed = parseCsvText(content);
      if (parsed.headers.length === 0 || parsed.rows.length === 0) {
        addToast('The uploaded CSV file is empty or does not contain valid data rows.', 'error');
        return;
      }

      setFileName(name);
      setFileSize(size || new Blob([content]).size);
      setCsvRawText(content);
      setCsvHeaders(parsed.headers);
      setCsvRows(parsed.rows);

      // Auto-detect mappings
      const detected = autoDetectColumnMapping(parsed.headers);
      setColumnMapping(detected);

      setCurrentStep(2);
      addToast(`Loaded ${parsed.rows.length} rows with ${parsed.headers.length} columns.`, 'info');
    } catch (err: any) {
      console.error(err);
      addToast('Failed to parse CSV file: ' + (err.message || 'Malformed format'), 'error');
    }
  };

  // Handle file drop
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleSelectedFile(files[0]);
    }
  };

  // Handle selected file
  const handleSelectedFile = (file: File) => {
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv' && !file.name.endsWith('.txt')) {
      addToast('Please upload a valid .csv file.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        processCsvContent(text, file.name, file.size);
      }
    };
    reader.onerror = () => {
      addToast('Error reading the selected file.', 'error');
    };
    reader.readAsText(file);
  };

  // Load sample demo data
  const handleLoadDemoData = () => {
    const demo = generateSampleCsvContent();
    processCsvContent(demo, 'demo_student_admissions.csv', new Blob([demo]).size);
    addToast('Demo students dataset loaded.', 'success');
  };

  // Check mandatory fields mapping status
  const mappingValidation = useMemo(() => {
    const mappedValues = Object.values(columnMapping);
    const requiredDefs = STUDENT_SCHEMA_DEFINITIONS.filter((d) => d.required);
    const missingRequired = requiredDefs.filter((d) => !mappedValues.includes(d.key));
    const allRequiredMapped = missingRequired.length === 0;

    return {
      allRequiredMapped,
      missingRequired,
      mappedCount: mappedValues.filter(Boolean).length
    };
  }, [columnMapping]);

  // Real-time validation of all parsed rows using current column mapping
  const validatedRows: ValidatedStudentRow[] = useMemo(() => {
    if (csvRows.length === 0 || Object.keys(columnMapping).length === 0) {
      return [];
    }

    return csvRows.map((rawRow, idx) => {
      return validateStudentRow(rawRow, columnMapping, idx, csvRows, existingStudents);
    });
  }, [csvRows, columnMapping, existingStudents]);

  // Aggregate validation metrics
  const validationStats = useMemo(() => {
    const total = validatedRows.length;
    let errorsCount = 0;
    let warningsCount = 0;
    let validCount = 0;
    let fileDuplicatesCount = 0;
    let dbDuplicatesCount = 0;

    validatedRows.forEach((row) => {
      if (!row.isValid) {
        errorsCount++;
      } else {
        validCount++;
      }
      if (row.hasWarnings) warningsCount++;
      if (row.isDuplicateInFile) fileDuplicatesCount++;
      if (row.isDuplicateInDb) dbDuplicatesCount++;
    });

    return {
      total,
      errorsCount,
      warningsCount,
      validCount,
      fileDuplicatesCount,
      dbDuplicatesCount
    };
  }, [validatedRows]);

  // Filtered rows for Step 3 table view
  const displayRows = useMemo(() => {
    return validatedRows.filter((row) => {
      // Step 1: Filter by category
      if (validationFilter === 'errors' && row.isValid) return false;
      if (validationFilter === 'warnings' && (!row.hasWarnings || !row.isValid)) return false;
      if (validationFilter === 'valid' && !row.isValid) return false;

      // Step 2: Search filter
      if (searchFilter.trim().length > 0) {
        const query = searchFilter.toLowerCase();
        const name = (row.mappedStudent.name || '').toLowerCase();
        const roll = (row.mappedStudent.rollNo || '').toString().toLowerCase();
        const cls = (row.mappedStudent.class || '').toLowerCase();
        const sec = (row.mappedStudent.section || '').toLowerCase();
        const guardian = (row.mappedStudent.guardian || '').toLowerCase();
        const phone = (row.mappedStudent.phone || '').toLowerCase();

        return (
          name.includes(query) ||
          roll.includes(query) ||
          cls.includes(query) ||
          sec.includes(query) ||
          guardian.includes(query) ||
          phone.includes(query)
        );
      }

      return true;
    });
  }, [validatedRows, validationFilter, searchFilter]);

  // Invert mapping: schemaKey -> csvHeader
  const schemaToHeader = useMemo(() => {
    const map: Partial<Record<StudentSchemaField, string>> = {};
    Object.entries(columnMapping).forEach(([hdr, key]) => {
      if (key) map[key] = hdr;
    });
    return map;
  }, [columnMapping]);

  // Handle single cell edit directly
  const handleCellEdit = (rowIndex: number, csvHeader: string, newValue: string) => {
    setCsvRows((prev) => {
      const updated = [...prev];
      updated[rowIndex] = {
        ...updated[rowIndex],
        [csvHeader]: newValue
      };
      return updated;
    });
  };

  // Handle row deletion
  const handleDeleteRow = (rowIndex: number) => {
    setCsvRows((prev) => prev.filter((_, idx) => idx !== rowIndex));
    addToast(`Row ${rowIndex + 1} deleted.`, 'info');
  };

  // Open inline row edit modal
  const handleStartEditRow = (row: ValidatedStudentRow) => {
    setEditingRowIndex(row.rowIndex);
    setEditingRowValues({ ...row.rawRow });
  };

  const handleSaveRowEdit = () => {
    if (editingRowIndex === null) return;
    setCsvRows((prev) => {
      const updated = [...prev];
      updated[editingRowIndex] = { ...editingRowValues };
      return updated;
    });
    setEditingRowIndex(null);
    setEditingRowValues({});
    addToast('Row values updated and revalidated.', 'success');
  };

  // Execute bulk import
  const handleExecuteImport = () => {
    // Filter rows to import
    const rowsToImport = skipInvalidRows
      ? validatedRows.filter((r) => r.isValid)
      : validatedRows;

    if (rowsToImport.length === 0) {
      addToast('No valid rows available to import.', 'error');
      return;
    }

    if (!skipInvalidRows && validationStats.errorsCount > 0) {
      addToast(
        `Cannot import: ${validationStats.errorsCount} row(s) contain blocking validation errors. Please fix them or check "Skip invalid rows".`,
        'error'
      );
      return;
    }

    setIsImporting(true);

    try {
      // Map to full Student objects
      const currentList = getStoredStudents();
      const studentsToInsert: Student[] = rowsToImport.map((r) => {
        const s = r.mappedStudent;
        const autoId = s.id && s.id.trim().length > 0 ? s.id.trim() : generateNextStudentId(currentList);

        return {
          id: autoId,
          name: (s.name || 'Unnamed Student').trim(),
          rollNo: (s.rollNo || '0').toString().trim(),
          class: (s.class || 'Class 10').trim(),
          section: (s.section || 'A').trim(),
          guardian: (s.guardian || 'Guardian').trim(),
          phone: s.phone || '',
          bloodGroup: s.bloodGroup || '',
          imageUrl: s.imageUrl || '',
          status: s.status === 'Suspended' ? 'Suspended' : 'Active',
          feesDue: Number(s.feesDue) || 0,
          gender: s.gender || 'Male',
          dob: s.dob || '',
          email: s.email || '',
          address: s.address || '',
          group: s.group || ''
        };
      });

      // Commit to persistent storage
      const result = bulkAddStudents(studentsToInsert, duplicateStrategy);

      const bulkResult: CsvBulkUploadResult = {
        totalRows: rowsToImport.length,
        addedCount: result.addedCount,
        updatedCount: result.updatedCount,
        skippedCount: result.skippedCount,
        importedStudents: studentsToInsert
      };

      setImportResult(bulkResult);
      setCurrentStep(4);
      addToast(
        `Import completed! Added: ${result.addedCount}, Updated: ${result.updatedCount}, Skipped: ${result.skippedCount}`,
        'success'
      );

      if (onSuccess) {
        onSuccess(bulkResult);
      }
    } catch (err: any) {
      console.error(err);
      addToast('Import failed: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className={`space-y-6 ${isModal ? 'p-1' : ''}`}>
      {/* Wizard Progress Stepper */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          {[
            { step: 1, label: 'Upload CSV', icon: Upload },
            { step: 2, label: 'Schema Mapping', icon: Database },
            { step: 3, label: 'Real-time Validation', icon: ShieldCheck },
            { step: 4, label: 'Import Complete', icon: CheckCheck }
          ].map((item, idx) => {
            const isCompleted = currentStep > item.step;
            const isCurrent = currentStep === item.step;
            const StepIcon = item.icon;

            return (
              <React.Fragment key={item.step}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs transition-all shadow-xs ${
                      isCompleted
                        ? 'bg-emerald-500 text-white'
                        : isCurrent
                        ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isCompleted ? <Check size={18} /> : <StepIcon size={18} />}
                  </div>
                  <span
                    className={`text-[11px] font-bold mt-1.5 transition-colors text-center ${
                      isCurrent
                        ? 'text-indigo-600'
                        : isCompleted
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
                {idx < 3 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 rounded-full transition-colors ${
                      currentStep > item.step ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STEP 1: CSV FILE SELECTION & UPLOAD */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Header Action Card */}
          <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-sm border border-indigo-950">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                    <FileSpreadsheet size={24} />
                  </span>
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight">
                      Bulk Student CSV Admission Engine
                    </h3>
                    <p className="text-xs text-indigo-200 mt-0.5">
                      Batch enroll hundreds of students instantly with intelligent column mapping and real-time schema validation.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="outline"
                  onClick={() => downloadSampleCsvFile()}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download size={14} />
                  <span>Download Sample CSV</span>
                </Button>
                <Button
                  onClick={handleLoadDemoData}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Sparkles size={14} />
                  <span>Load Demo Data</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Drag & Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-4 ${
              isDragOver
                ? 'border-indigo-500 bg-indigo-50/70 scale-[0.99]'
                : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50/80 bg-white'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv,text/csv,text/plain"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleSelectedFile(e.target.files[0]);
                }
              }}
            />

            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
              <Upload size={32} />
            </div>

            <div>
              <h4 className="text-base font-black text-slate-800">
                Drag and drop your student CSV file here
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Supports standard comma-separated (<code className="font-mono text-indigo-600">.csv</code>) files exported from Excel, Google Sheets, or legacy SIS platforms.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xs">
                Browse CSV File
              </span>
              <span className="text-xs text-slate-400">or use sample template</span>
            </div>
          </div>

          {/* Quick Paste Raw Text Alternative */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <button
              onClick={() => setIsPasteModeOpen(!isPasteModeOpen)}
              className="w-full flex items-center justify-between text-xs font-bold text-slate-700 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <FileText size={16} className="text-slate-400" />
                <span>Or Paste Raw CSV Data Directly</span>
              </span>
              <ChevronDown
                size={16}
                className={`transition-transform ${isPasteModeOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isPasteModeOpen && (
              <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
                <p className="text-xs text-slate-500">
                  Paste comma-separated rows with header line directly below:
                </p>
                <textarea
                  rows={6}
                  value={csvRawText}
                  onChange={(e) => setCsvRawText(e.target.value)}
                  placeholder={`Student Name,Roll No,Class,Section,Guardian Name,Mobile Number,Blood Group\nRahim Ahmed,101,Class 10,A,Karim Ahmed,01711111111,A+\nFatima Begum,102,Class 10,A,Abdul Malik,01722222222,B+`}
                  className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 ring-indigo-500"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    onClick={() => {
                      if (!csvRawText.trim()) {
                        addToast('Please paste CSV text first.', 'error');
                        return;
                      }
                      processCsvContent(csvRawText, 'pasted_students.csv');
                    }}
                    className="bg-indigo-600 text-white font-bold text-xs"
                  >
                    Parse Pasted Text
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: COLUMN SCHEMA MAPPING ENGINE */}
      {/* ========================================================================= */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* File Meta Banner */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-700">
                <FileSpreadsheet size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-sm text-slate-900">{fileName}</h4>
                  <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md">
                    {csvRows.length} Rows • {csvHeaders.length} Columns
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verify or adjust how your CSV headers map to the Amar Smart School Student Schema.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const detected = autoDetectColumnMapping(csvHeaders);
                  setColumnMapping(detected);
                  addToast('Re-applied auto mapping logic.', 'info');
                }}
                className="text-xs font-bold text-slate-600 flex items-center gap-1"
              >
                <RefreshCw size={12} />
                <span>Re-detect Columns</span>
              </Button>
            </div>
          </div>

          {/* Validation Notice Banner */}
          {!mappingValidation.allRequiredMapped ? (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5 text-xs text-amber-800">
              <AlertTriangle size={18} className="text-amber-600 shrink-0" />
              <div>
                <strong className="font-bold">Missing Required Fields:</strong> Please map{' '}
                {mappingValidation.missingRequired.map((d) => d.label).join(', ')} to proceed.
              </div>
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>
                <strong>All mandatory fields successfully mapped!</strong> {mappingValidation.mappedCount} of {csvHeaders.length} CSV columns mapped.
              </span>
            </div>
          )}

          {/* Mapping Grid */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-500">
                Column Mapping Configuration ({csvHeaders.length} Columns)
              </span>
              <span className="text-xs text-slate-400">
                * Indicates mandatory database schema field
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {csvHeaders.map((header) => {
                const currentMappedKey = columnMapping[header] || '';
                const mappedDef = STUDENT_SCHEMA_DEFINITIONS.find((d) => d.key === currentMappedKey);
                const sampleValues = csvRows.slice(0, 3).map((r) => r[header] || '(blank)');

                return (
                  <div
                    key={header}
                    className="p-4 hover:bg-slate-50/60 transition-colors grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
                  >
                    {/* CSV Header Name & Samples */}
                    <div className="md:col-span-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                          {header}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 truncate" title={sampleValues.join(', ')}>
                        Sample: <span className="font-mono text-slate-600">{sampleValues.join(' • ')}</span>
                      </div>
                    </div>

                    {/* Mapping Arrow Indicator */}
                    <div className="hidden md:flex md:col-span-1 justify-center text-slate-400">
                      <ArrowRight size={16} />
                    </div>

                    {/* Target Schema Selector Dropdown */}
                    <div className="md:col-span-5">
                      <select
                        value={currentMappedKey}
                        onChange={(e) => {
                          const newKey = e.target.value as StudentSchemaField | '';
                          setColumnMapping((prev) => ({
                            ...prev,
                            [header]: newKey
                          }));
                        }}
                        className={`w-full text-xs font-bold p-2.5 rounded-xl border outline-none transition-all cursor-pointer ${
                          mappedDef?.required
                            ? 'bg-indigo-50/50 border-indigo-300 text-indigo-950 focus:ring-2 ring-indigo-500'
                            : currentMappedKey
                            ? 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-2 ring-indigo-500'
                            : 'bg-white border-dashed border-slate-300 text-slate-400'
                        }`}
                      >
                        <option value="">[ Ignore / Do Not Map This Column ]</option>
                        <optgroup label="Mandatory Student Fields">
                          {STUDENT_SCHEMA_DEFINITIONS.filter((d) => d.required).map((def) => (
                            <option key={def.key} value={def.key}>
                              ★ {def.label} ({def.key}) - REQUIRED
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="Optional Extended Profile Fields">
                          {STUDENT_SCHEMA_DEFINITIONS.filter((d) => !d.required).map((def) => (
                            <option key={def.key} value={def.key}>
                              {def.label} ({def.key})
                            </option>
                          ))}
                        </optgroup>
                      </select>
                    </div>

                    {/* Field Requirement & Type Badge */}
                    <div className="md:col-span-2 flex items-center justify-end">
                      {mappedDef ? (
                        <div className="text-right">
                          <span
                            className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              mappedDef.required
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {mappedDef.required ? 'Mandatory' : 'Optional'}
                          </span>
                          <span className="block text-[10px] font-mono text-slate-400 mt-0.5 uppercase">
                            {mappedDef.type}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Ignored</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(1)}
              className="text-xs font-bold text-slate-600 flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Back to Upload</span>
            </Button>
            <Button
              onClick={() => {
                if (!mappingValidation.allRequiredMapped) {
                  addToast(
                    'Cannot proceed: Please map all mandatory fields (*).',
                    'error'
                  );
                  return;
                }
                setCurrentStep(3);
                addToast('Running real-time schema validation...', 'info');
              }}
              disabled={!mappingValidation.allRequiredMapped}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span>Validate Data & Preview</span>
              <ArrowRight size={14} />
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: REAL-TIME VALIDATION & INTERACTIVE DATA PREVIEW */}
      {/* ========================================================================= */}
      {currentStep === 3 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Real-time KPI Metric Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div
              onClick={() => setValidationFilter('all')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                validationFilter === 'all'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold mb-1 opacity-80">
                <span>Total Records</span>
                <Users size={14} />
              </div>
              <div className="text-2xl font-black font-mono">{validationStats.total}</div>
              <div className="text-[10px] opacity-70 mt-0.5">Parsed from CSV</div>
            </div>

            <div
              onClick={() => setValidationFilter('valid')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                validationFilter === 'valid'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-emerald-50/50 text-emerald-950 border-emerald-200 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold mb-1 text-emerald-700">
                <span className={validationFilter === 'valid' ? 'text-white' : ''}>Ready to Import</span>
                <CheckCircle2 size={14} />
              </div>
              <div className="text-2xl font-black font-mono text-emerald-700">
                <span className={validationFilter === 'valid' ? 'text-white' : ''}>
                  {validationStats.validCount}
                </span>
              </div>
              <div className={`text-[10px] mt-0.5 ${validationFilter === 'valid' ? 'text-emerald-100' : 'text-emerald-600'}`}>
                100% Validated
              </div>
            </div>

            <div
              onClick={() => setValidationFilter('errors')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                validationFilter === 'errors'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                  : 'bg-rose-50/50 text-rose-950 border-rose-200 hover:border-rose-300'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold mb-1 text-rose-700">
                <span className={validationFilter === 'errors' ? 'text-white' : ''}>Errors (Blocking)</span>
                <XCircle size={14} />
              </div>
              <div className="text-2xl font-black font-mono text-rose-700">
                <span className={validationFilter === 'errors' ? 'text-white' : ''}>
                  {validationStats.errorsCount}
                </span>
              </div>
              <div className={`text-[10px] mt-0.5 ${validationFilter === 'errors' ? 'text-rose-100' : 'text-rose-600'}`}>
                Requires inline correction
              </div>
            </div>

            <div
              onClick={() => setValidationFilter('warnings')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                validationFilter === 'warnings'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                  : 'bg-amber-50/50 text-amber-950 border-amber-200 hover:border-amber-300'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold mb-1 text-amber-700">
                <span className={validationFilter === 'warnings' ? 'text-white' : ''}>Warnings / Duplicates</span>
                <AlertTriangle size={14} />
              </div>
              <div className="text-2xl font-black font-mono text-amber-700">
                <span className={validationFilter === 'warnings' ? 'text-white' : ''}>
                  {validationStats.warningsCount}
                </span>
              </div>
              <div className={`text-[10px] mt-0.5 ${validationFilter === 'warnings' ? 'text-amber-100' : 'text-amber-600'}`}>
                {validationStats.dbDuplicatesCount} system match(es)
              </div>
            </div>
          </div>

          {/* Import Strategy and Settings Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-bold text-slate-700">Duplicate Handling Strategy:</span>
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'update_existing', label: 'Merge / Update Existing' },
                  { id: 'skip_existing', label: 'Skip Existing Records' },
                  { id: 'add_all', label: 'Add As New (New IDs)' }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setDuplicateStrategy(s.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      duplicateStrategy === s.id
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={skipInvalidRows}
                  onChange={(e) => setSkipInvalidRows(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
                <span>Skip invalid rows during import</span>
              </label>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-500">Filter View:</span>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                {[
                  { id: 'all', label: `All (${validationStats.total})` },
                  { id: 'errors', label: `Errors (${validationStats.errorsCount})` },
                  { id: 'warnings', label: `Warnings (${validationStats.warningsCount})` },
                  { id: 'valid', label: `Valid (${validationStats.validCount})` }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setValidationFilter(tab.id as any)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      validationFilter === tab.id
                        ? 'bg-white text-indigo-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full sm:w-64">
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search student or roll..."
                className="w-full text-xs font-medium border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-800 outline-none focus:ring-2 ring-indigo-500"
              />
            </div>
          </div>

          {/* Live Interactive Validation Table with Inline Editing */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-100/80 sticky top-0 z-10 border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-3 font-black text-slate-500 w-12 text-center">Row</th>
                    <th className="px-3 py-3 font-black text-slate-500 w-28 text-center">Status</th>
                    <th className="px-3 py-3 font-black text-slate-500">Student Name</th>
                    <th className="px-3 py-3 font-black text-slate-500 text-center">Roll No</th>
                    <th className="px-3 py-3 font-black text-slate-500 text-center">Class</th>
                    <th className="px-3 py-3 font-black text-slate-500 text-center">Section</th>
                    <th className="px-3 py-3 font-black text-slate-500">Guardian Name</th>
                    <th className="px-3 py-3 font-black text-slate-500">Mobile Phone</th>
                    <th className="px-3 py-3 font-black text-slate-500 text-center">Blood</th>
                    <th className="px-3 py-3 font-black text-slate-500 text-right">Fees Due</th>
                    <th className="px-3 py-3 font-black text-slate-500 text-right w-20">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {displayRows.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-12 text-center text-slate-400">
                        No rows found matching current filter.
                      </td>
                    </tr>
                  ) : (
                    displayRows.map((row) => {
                      const student = row.mappedStudent;
                      const hasNameError = row.issues.some((i) => i.field === 'name' && i.severity === 'error');
                      const hasRollError = row.issues.some((i) => i.field === 'rollNo' && i.severity === 'error');
                      const hasClassError = row.issues.some((i) => i.field === 'class' && i.severity === 'error');
                      const hasSecError = row.issues.some((i) => i.field === 'section' && i.severity === 'error');
                      const hasGuardianError = row.issues.some((i) => i.field === 'guardian' && i.severity === 'error');
                      const hasPhoneWarn = row.issues.some((i) => i.field === 'phone');
                      const hasBloodWarn = row.issues.some((i) => i.field === 'bloodGroup');

                      const nameHdr = schemaToHeader['name'];
                      const rollHdr = schemaToHeader['rollNo'];
                      const classHdr = schemaToHeader['class'];
                      const secHdr = schemaToHeader['section'];
                      const guardianHdr = schemaToHeader['guardian'];
                      const phoneHdr = schemaToHeader['phone'];
                      const bloodHdr = schemaToHeader['bloodGroup'];
                      const feesHdr = schemaToHeader['feesDue'];

                      return (
                        <tr
                          key={row.rowIndex}
                          className={`hover:bg-slate-50/70 transition-colors ${
                            !row.isValid ? 'bg-rose-50/20' : row.hasWarnings ? 'bg-amber-50/20' : ''
                          }`}
                        >
                          {/* Row Number */}
                          <td className="px-3 py-2.5 text-center font-mono text-[11px] text-slate-400 font-bold">
                            {row.rowIndex + 1}
                          </td>

                          {/* Status Badge & Issues Popover Tooltip */}
                          <td className="px-3 py-2.5 text-center">
                            {row.isValid ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 size={11} />
                                <span>Valid</span>
                              </span>
                            ) : (
                              <span
                                className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 cursor-help"
                                title={row.issues.map((i) => i.message).join(' | ')}
                              >
                                <XCircle size={11} />
                                <span>Error</span>
                              </span>
                            )}
                          </td>

                          {/* Student Name (Inline editable) */}
                          <td className="px-3 py-2.5">
                            {nameHdr ? (
                              <input
                                type="text"
                                value={row.rawRow[nameHdr] || ''}
                                onChange={(e) => handleCellEdit(row.rowIndex, nameHdr, e.target.value)}
                                className={`font-bold text-xs px-2 py-1 rounded border outline-none w-44 transition-all ${
                                  hasNameError
                                    ? 'bg-rose-50 border-rose-400 text-rose-900 focus:ring-1 ring-rose-500'
                                    : 'bg-transparent border-transparent hover:border-slate-200 focus:bg-white focus:border-indigo-400 text-slate-900'
                                }`}
                              />
                            ) : (
                              <span className="text-slate-400 italic">Unmapped</span>
                            )}
                          </td>

                          {/* Roll No */}
                          <td className="px-3 py-2.5 text-center">
                            {rollHdr ? (
                              <input
                                type="text"
                                value={row.rawRow[rollHdr] || ''}
                                onChange={(e) => handleCellEdit(row.rowIndex, rollHdr, e.target.value)}
                                className={`font-mono font-bold text-xs px-1.5 py-1 text-center rounded border outline-none w-16 transition-all ${
                                  hasRollError
                                    ? 'bg-rose-50 border-rose-400 text-rose-900 focus:ring-1 ring-rose-500'
                                    : 'bg-transparent border-transparent hover:border-slate-200 focus:bg-white focus:border-indigo-400 text-slate-900'
                                }`}
                              />
                            ) : (
                              <span className="text-slate-400 italic">--</span>
                            )}
                          </td>

                          {/* Class */}
                          <td className="px-3 py-2.5 text-center">
                            {classHdr ? (
                              <input
                                type="text"
                                value={row.rawRow[classHdr] || ''}
                                onChange={(e) => handleCellEdit(row.rowIndex, classHdr, e.target.value)}
                                className={`font-bold text-xs px-1.5 py-1 text-center rounded border outline-none w-20 transition-all ${
                                  hasClassError
                                    ? 'bg-rose-50 border-rose-400 text-rose-900'
                                    : 'bg-transparent border-transparent hover:border-slate-200 focus:bg-white focus:border-indigo-400'
                                }`}
                              />
                            ) : (
                              <span className="text-slate-400 italic">--</span>
                            )}
                          </td>

                          {/* Section */}
                          <td className="px-3 py-2.5 text-center">
                            {secHdr ? (
                              <input
                                type="text"
                                value={row.rawRow[secHdr] || ''}
                                onChange={(e) => handleCellEdit(row.rowIndex, secHdr, e.target.value)}
                                className={`font-bold text-xs px-1 py-1 text-center rounded border outline-none w-12 transition-all ${
                                  hasSecError
                                    ? 'bg-rose-50 border-rose-400 text-rose-900'
                                    : 'bg-transparent border-transparent hover:border-slate-200 focus:bg-white focus:border-indigo-400'
                                }`}
                              />
                            ) : (
                              <span className="text-slate-400 italic">--</span>
                            )}
                          </td>

                          {/* Guardian */}
                          <td className="px-3 py-2.5">
                            {guardianHdr ? (
                              <input
                                type="text"
                                value={row.rawRow[guardianHdr] || ''}
                                onChange={(e) => handleCellEdit(row.rowIndex, guardianHdr, e.target.value)}
                                className={`text-xs px-2 py-1 rounded border outline-none w-40 transition-all ${
                                  hasGuardianError
                                    ? 'bg-rose-50 border-rose-400 text-rose-900'
                                    : 'bg-transparent border-transparent hover:border-slate-200 focus:bg-white focus:border-indigo-400 text-slate-700'
                                }`}
                              />
                            ) : (
                              <span className="text-slate-400 italic">--</span>
                            )}
                          </td>

                          {/* Mobile Phone */}
                          <td className="px-3 py-2.5">
                            {phoneHdr ? (
                              <input
                                type="text"
                                value={row.rawRow[phoneHdr] || ''}
                                onChange={(e) => handleCellEdit(row.rowIndex, phoneHdr, e.target.value)}
                                className={`font-mono text-xs px-2 py-1 rounded border outline-none w-32 transition-all ${
                                  hasPhoneWarn
                                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                                    : 'bg-transparent border-transparent hover:border-slate-200 focus:bg-white focus:border-indigo-400 text-slate-700'
                                }`}
                              />
                            ) : (
                              <span className="text-slate-400 italic">--</span>
                            )}
                          </td>

                          {/* Blood Group */}
                          <td className="px-3 py-2.5 text-center">
                            {bloodHdr ? (
                              <input
                                type="text"
                                value={row.rawRow[bloodHdr] || ''}
                                onChange={(e) => handleCellEdit(row.rowIndex, bloodHdr, e.target.value)}
                                className={`font-mono font-bold text-xs px-1 py-1 text-center rounded border outline-none w-14 transition-all ${
                                  hasBloodWarn
                                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                                    : 'bg-transparent border-transparent hover:border-slate-200 focus:bg-white focus:border-indigo-400 text-slate-700'
                                }`}
                              />
                            ) : (
                              <span className="text-slate-400 italic">--</span>
                            )}
                          </td>

                          {/* Fees Due */}
                          <td className="px-3 py-2.5 text-right font-mono font-bold text-slate-700">
                            {feesHdr ? (
                              <input
                                type="number"
                                value={row.rawRow[feesHdr] || '0'}
                                onChange={(e) => handleCellEdit(row.rowIndex, feesHdr, e.target.value)}
                                className="font-mono font-bold text-xs px-1 py-1 text-right rounded border border-transparent hover:border-slate-200 focus:bg-white focus:border-indigo-400 w-20 outline-none text-slate-800"
                              />
                            ) : (
                              '৳0'
                            )}
                          </td>

                          {/* Row Actions */}
                          <td className="px-3 py-2.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleStartEditRow(row)}
                                className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                                title="Expand and edit full row fields"
                              >
                                <Edit3 size={13} />
                              </button>
                              <button
                                onClick={() => handleDeleteRow(row.rowIndex)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                                title="Delete row"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Validation Notice Bar */}
            {validationStats.errorsCount > 0 && !skipInvalidRows && (
              <div className="p-3 bg-rose-50 border-t border-rose-200 flex items-center justify-between text-xs text-rose-800">
                <span className="flex items-center gap-1.5 font-bold">
                  <AlertCircle size={15} className="text-rose-600" />
                  <span>
                    {validationStats.errorsCount} row(s) contain blocking errors. Click on red cells to edit inline or check "Skip invalid rows".
                  </span>
                </span>
                <button
                  onClick={() => setSkipInvalidRows(true)}
                  className="font-bold underline hover:text-rose-950 cursor-pointer"
                >
                  Enable Skip Invalid Rows
                </button>
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(2)}
              className="text-xs font-bold text-slate-600 flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Back to Mapping</span>
            </Button>
            <Button
              onClick={handleExecuteImport}
              disabled={isImporting || (!skipInvalidRows && validationStats.errorsCount > 0)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <CheckCheck size={16} />
              <span>
                {isImporting
                  ? 'Importing...'
                  : `Commit Import (${
                      skipInvalidRows ? validationStats.validCount : validationStats.total
                    } Students)`}
              </span>
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: IMPORT EXECUTION REPORT & NOMINAL ROLL VERIFICATION */}
      {/* ========================================================================= */}
      {currentStep === 4 && importResult && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCheck size={36} />
            </div>

            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                Student Batch Import Successful!
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                The enrolled student nominal roll has been updated and synchronized in persistent storage across the institutional portal.
              </p>
            </div>

            {/* Metric Scorecard */}
            <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto py-2">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] uppercase font-bold text-emerald-700 block">Newly Enrolled</span>
                <span className="text-2xl font-black font-mono text-emerald-800">{importResult.addedCount}</span>
              </div>
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200">
                <span className="text-[10px] uppercase font-bold text-indigo-700 block">Updated / Merged</span>
                <span className="text-2xl font-black font-mono text-indigo-800">{importResult.updatedCount}</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Skipped Records</span>
                <span className="text-2xl font-black font-mono text-slate-700">{importResult.skippedCount}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-center gap-3 pt-4 flex-wrap">
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentStep(1);
                  setCsvRows([]);
                  setCsvHeaders([]);
                  setImportResult(null);
                }}
                className="text-xs font-bold text-slate-700"
              >
                Upload Another File
              </Button>
              {onCancel && (
                <Button
                  onClick={onCancel}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                >
                  Done / View Student Directory
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Row Edit Modal for detailed editing */}
      {editingRowIndex !== null && (
        <Modal
          isOpen={true}
          onClose={() => setEditingRowIndex(null)}
          title={`Edit CSV Row #${editingRowIndex + 1}`}
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-500">
              Update the raw cell values for this record. Changes will be validated in real time.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto p-1">
              {csvHeaders.map((header) => {
                const schemaKey = columnMapping[header];
                const def = STUDENT_SCHEMA_DEFINITIONS.find((d) => d.key === schemaKey);

                return (
                  <div key={header} className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700 flex items-center justify-between">
                      <span>{header}</span>
                      {def?.required && (
                        <span className="text-[9px] text-rose-600 font-bold uppercase">* Required</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={editingRowValues[header] || ''}
                      onChange={(e) =>
                        setEditingRowValues((prev) => ({
                          ...prev,
                          [header]: e.target.value
                        }))
                      }
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 ring-indigo-500 bg-white"
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="ghost" onClick={() => setEditingRowIndex(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveRowEdit} className="bg-indigo-600 text-white font-bold">
                Save & Revalidate Row
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
