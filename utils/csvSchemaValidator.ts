import { Student, StudentSchemaField, StudentFieldDefinition, ValidatedStudentRow, CsvValidationIssue } from '../types';

export const STUDENT_SCHEMA_DEFINITIONS: StudentFieldDefinition[] = [
  {
    key: 'name',
    label: 'Student Full Name',
    required: true,
    type: 'string',
    description: 'Full official name of the student as per birth certificate / prior school record',
    example: 'Rahim Ahmed',
    aliases: [
      'student name', 'student_name', 'name', 'full name', 'fullname', 'student', 
      'candidate name', 'student fullname', 'naam', 'নাম', 'শিক্ষার্থীর নাম', 'ছাত্র/ছাত্রীর নাম'
    ]
  },
  {
    key: 'rollNo',
    label: 'Class Roll Number',
    required: true,
    type: 'string',
    description: 'Unique roll number or class registration index within the specified class & section',
    example: '101',
    aliases: [
      'roll no', 'roll number', 'rollno', 'roll', 'class roll', 'roll_no', 'class_roll',
      'id number', 'student roll', 'রোল', 'রোল নং', 'শ্রেণি রোল'
    ]
  },
  {
    key: 'class',
    label: 'Class / Grade',
    required: true,
    type: 'string',
    description: 'Class or standard in which the student is enrolled (e.g. Class 10, Class 9, KG)',
    example: 'Class 10',
    aliases: [
      'class', 'grade', 'standard', 'class name', 'current class', 'enrolled class', 
      'student class', 'শ্রেণী', 'শ্রেণি', 'ক্লাস'
    ]
  },
  {
    key: 'section',
    label: 'Section',
    required: true,
    type: 'string',
    description: 'Designated classroom division or section (e.g. A, B, C, Morning, Day)',
    example: 'A',
    aliases: [
      'section', 'sec', 'class section', 'section name', 'sec name', 'শাখা', 'সেকশন'
    ]
  },
  {
    key: 'guardian',
    label: 'Guardian / Father Name',
    required: true,
    type: 'string',
    description: 'Primary legal guardian or parent name for correspondence and emergency',
    example: 'Karim Ahmed',
    aliases: [
      'guardian', 'guardian name', 'father name', "father's name", 'parent', 'parent name',
      'father', 'mother name', 'legal guardian', 'অভিভাবক', 'পিতা', 'পিতার নাম', 'অভিভাবকের নাম'
    ]
  },
  {
    key: 'phone',
    label: 'Guardian Mobile / Phone',
    required: false,
    type: 'phone',
    description: 'Primary contact phone number for SMS notifications, emergencies and attendance alerts',
    example: '01711223344',
    aliases: [
      'phone', 'mobile', 'mobile no', 'phone number', 'contact', 'contact no', 'guardian phone',
      'guardian mobile', 'telephone', 'cell', 'মোবাইল', 'ফোন', 'মোবাইল নম্বর', 'যোগাযোগ'
    ]
  },
  {
    key: 'bloodGroup',
    label: 'Blood Group',
    required: false,
    type: 'enum',
    enumValues: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    description: 'Blood group for medical emergency health profile (A+, B+, O+, AB+, etc.)',
    example: 'B+',
    aliases: [
      'blood group', 'blood', 'bg', 'bloodgroup', 'blood_group', 'রক্তের গ্রুপ', 'রক্তের দল'
    ]
  },
  {
    key: 'gender',
    label: 'Gender',
    required: false,
    type: 'enum',
    enumValues: ['Male', 'Female', 'Other'],
    description: 'Biological gender or sex of the student',
    example: 'Male',
    aliases: ['gender', 'sex', 'লিঙ্গ']
  },
  {
    key: 'feesDue',
    label: 'Outstanding Fees Due (৳)',
    required: false,
    type: 'number',
    description: 'Initial outstanding balance or overdue tuition fee amount in BDT (defaults to 0)',
    example: '1500',
    aliases: [
      'fees due', 'feesdue', 'due', 'due amount', 'balance', 'outstanding', 'fee due',
      'fees', 'tuition due', 'বকেয়া', 'বকেয়া ফি', 'বকেয়া'
    ]
  },
  {
    key: 'status',
    label: 'Enrollment Status',
    required: false,
    type: 'enum',
    enumValues: ['Active', 'Suspended'],
    description: 'Current academic standing (Active or Suspended, default: Active)',
    example: 'Active',
    aliases: ['status', 'enrollment status', 'student status', 'state', 'অবস্থা']
  },
  {
    key: 'dob',
    label: 'Date of Birth',
    required: false,
    type: 'date',
    description: 'Birth date in standard YYYY-MM-DD or DD/MM/YYYY format',
    example: '2008-05-14',
    aliases: ['dob', 'date of birth', 'birth date', 'birthdate', 'bdate', 'জন্ম তারিখ']
  },
  {
    key: 'email',
    label: 'Email Address',
    required: false,
    type: 'email',
    description: 'Official student or guardian email address for reports and receipts',
    example: 'student@example.com',
    aliases: ['email', 'email address', 'e-mail', 'mail', 'ইমেইল']
  },
  {
    key: 'address',
    label: 'Residential Address',
    required: false,
    type: 'string',
    description: 'Present residential address / village / post / thana',
    example: 'Mirpur-10, Dhaka',
    aliases: ['address', 'present address', 'residence', 'location', 'ঠিকানা', 'বর্তমান ঠিকানা']
  },
  {
    key: 'group',
    label: 'Academic Group',
    required: false,
    type: 'string',
    description: 'Specialization stream (Science, Commerce, Arts, General, Vocational)',
    example: 'Science',
    aliases: ['group', 'stream', 'discipline', 'বিভাগ', 'গ্রুপ']
  },
  {
    key: 'id',
    label: 'Student ID (Optional)',
    required: false,
    type: 'string',
    description: 'Unique institutional student ID. If left unmapped or blank, auto-generated automatically.',
    example: 'ST-2024-001',
    aliases: [
      'student id', 'id', 'student_id', 'reg no', 'registration no', 'admission no', 
      'admission id', 'স্টুডেন্ট আইডি', 'আইডি'
    ]
  }
];

/**
 * Normalizes text for header comparison (removes symbols, extra spaces, lowercase).
 */
export const normalizeHeaderString = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/["'_.-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Intelligent Auto-Detection Engine:
 * Maps uploaded CSV column headers to our database schema fields using semantic alias matching.
 */
export const autoDetectColumnMapping = (
  csvHeaders: string[]
): Record<string, StudentSchemaField | ''> => {
  const mapping: Record<string, StudentSchemaField | ''> = {};
  const assignedSchemaKeys = new Set<StudentSchemaField>();

  // Initialize all CSV headers as unmapped
  csvHeaders.forEach((header) => {
    mapping[header] = '';
  });

  // Step 1: Exact and alias matching prioritized by schema definition order
  STUDENT_SCHEMA_DEFINITIONS.forEach((def) => {
    if (assignedSchemaKeys.has(def.key)) return;

    for (const header of csvHeaders) {
      if (mapping[header] !== '') continue; // already mapped

      const normalized = normalizeHeaderString(header);

      // Direct key match
      if (normalized === def.key.toLowerCase()) {
        mapping[header] = def.key;
        assignedSchemaKeys.add(def.key);
        break;
      }

      // Check against defined aliases
      const matchFound = def.aliases.some((alias) => {
        const normAlias = normalizeHeaderString(alias);
        return normalized === normAlias || normalized.startsWith(normAlias) || normAlias.startsWith(normalized);
      });

      if (matchFound) {
        mapping[header] = def.key;
        assignedSchemaKeys.add(def.key);
        break;
      }
    }
  });

  return mapping;
};

/**
 * Robust RFC 4180 compliant CSV parser.
 * Handles quoted fields with embedded commas, double quotes, trimmed BOMs, and varied line breaks.
 */
export const parseCsvText = (
  csvText: string
): { headers: string[]; rows: Record<string, string>[]; rawRowsCount: number } => {
  // Strip UTF-8 BOM if present
  let cleanText = csvText.replace(/^\uFEFF/, '').trim();
  if (!cleanText) {
    return { headers: [], rows: [], rawRowsCount: 0 };
  }

  const lines: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        // Escaped quote
        currentField += '"';
        i++; // skip next quote
      } else if (char === '"') {
        // Closing quote
        inQuotes = false;
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentField.trim());
        currentField = '';
      } else if (char === '\r' && nextChar === '\n') {
        currentRow.push(currentField.trim());
        lines.push(currentRow);
        currentRow = [];
        currentField = '';
        i++; // skip \n
      } else if (char === '\n' || char === '\r') {
        currentRow.push(currentField.trim());
        lines.push(currentRow);
        currentRow = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
  }

  // Push last field & row if not empty
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    lines.push(currentRow);
  }

  if (lines.length === 0) {
    return { headers: [], rows: [], rawRowsCount: 0 };
  }

  // First row is headers
  const headers = lines[0].map((h, idx) => (h && h.trim().length > 0 ? h.trim() : `Column_${idx + 1}`));
  const dataLines = lines.slice(1);

  // Map each data line to an object based on headers
  const rows: Record<string, string>[] = [];
  dataLines.forEach((line) => {
    // Skip empty lines
    const isEmpty = line.every((val) => !val || val.trim().length === 0);
    if (isEmpty) return;

    const rowObj: Record<string, string> = {};
    headers.forEach((hdr, colIdx) => {
      rowObj[hdr] = line[colIdx] !== undefined ? line[colIdx].trim() : '';
    });
    rows.push(rowObj);
  });

  return {
    headers,
    rows,
    rawRowsCount: dataLines.length
  };
};

/**
 * Validates a blood group value (case-insensitive, trims extra spaces).
 */
export const normalizeBloodGroup = (val: string): string | null => {
  if (!val) return null;
  const cleaned = val.toUpperCase().replace(/\s+/g, '');
  const validGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  if (validGroups.includes(cleaned)) return cleaned;
  // Common typo fixes
  if (cleaned === 'OPOSITIVE' || cleaned === 'O POS') return 'O+';
  if (cleaned === 'ONEGATIVE' || cleaned === 'O NEG') return 'O-';
  if (cleaned === 'APOSITIVE' || cleaned === 'A POS') return 'A+';
  if (cleaned === 'BPOSITIVE' || cleaned === 'B POS') return 'B+';
  return null;
};

/**
 * Validates and normalizes phone numbers.
 */
export const normalizePhoneNumber = (val: string): { clean: string; isValid: boolean } => {
  if (!val) return { clean: '', isValid: true };
  const stripped = val.replace(/[\s\-_()]/g, '');
  // Allows Bangladeshi 11 digits (e.g. 01711223344) or international +8801711223344 or 10-15 digits
  const isValid = /^(\+?\d{9,15})$/.test(stripped);
  return { clean: stripped, isValid };
};

/**
 * Real-Time Row-by-Row Validator:
 * Validates mapped student data against database schema rules, type constraints,
 * in-file duplicates, and existing database duplicates.
 */
export const validateStudentRow = (
  rawRow: Record<string, string>,
  mapping: Record<string, StudentSchemaField | ''>,
  rowIndex: number,
  allMappedRows: Record<string, string>[],
  existingStudents: Student[]
): ValidatedStudentRow => {
  const issues: CsvValidationIssue[] = [];
  const mappedStudent: Partial<Student> = {};

  // Invert mapping: schemaKey -> csvHeader
  const schemaToHeader: Partial<Record<StudentSchemaField, string>> = {};
  Object.entries(mapping).forEach(([csvHeader, schemaKey]) => {
    if (schemaKey) {
      schemaToHeader[schemaKey] = csvHeader;
    }
  });

  // Extract mapped values
  STUDENT_SCHEMA_DEFINITIONS.forEach((def) => {
    const csvHdr = schemaToHeader[def.key];
    const rawVal = csvHdr && rawRow[csvHdr] !== undefined ? rawRow[csvHdr].trim() : '';

    if (def.key === 'feesDue') {
      const numVal = rawVal ? parseFloat(rawVal) : 0;
      if (isNaN(numVal) || numVal < 0) {
        issues.push({
          field: 'feesDue',
          severity: 'error',
          message: 'Fees Due must be a non-negative number'
        });
        mappedStudent.feesDue = 0;
      } else {
        mappedStudent.feesDue = numVal;
      }
    } else if (def.key === 'status') {
      const normalizedStatus = rawVal.toLowerCase() === 'suspended' ? 'Suspended' : 'Active';
      mappedStudent.status = normalizedStatus;
    } else if (def.key === 'bloodGroup') {
      if (rawVal) {
        const bg = normalizeBloodGroup(rawVal);
        if (!bg) {
          issues.push({
            field: 'bloodGroup',
            severity: 'warning',
            message: `Unrecognized blood group "${rawVal}". Expected format: A+, A-, B+, B-, AB+, AB-, O+, O-`
          });
          mappedStudent.bloodGroup = rawVal;
        } else {
          mappedStudent.bloodGroup = bg;
        }
      }
    } else if (def.key === 'phone') {
      if (rawVal) {
        const { clean, isValid } = normalizePhoneNumber(rawVal);
        mappedStudent.phone = clean;
        if (!isValid) {
          issues.push({
            field: 'phone',
            severity: 'warning',
            message: `Phone number "${rawVal}" may be formatted incorrectly (expected 10-15 digits)`
          });
        }
      }
    } else if (def.key === 'email') {
      if (rawVal) {
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawVal);
        mappedStudent.email = rawVal;
        if (!isEmail) {
          issues.push({
            field: 'email',
            severity: 'warning',
            message: `Invalid email address format "${rawVal}"`
          });
        }
      }
    } else if (def.key === 'gender') {
      if (rawVal) {
        const lower = rawVal.toLowerCase();
        if (lower.startsWith('m')) mappedStudent.gender = 'Male';
        else if (lower.startsWith('f')) mappedStudent.gender = 'Female';
        else mappedStudent.gender = 'Other';
      }
    } else {
      // String fields: name, rollNo, class, section, guardian, etc.
      (mappedStudent as any)[def.key] = rawVal;
    }
  });

  // Default values for mandatory fields if not present
  if (!mappedStudent.status) mappedStudent.status = 'Active';
  if (mappedStudent.feesDue === undefined) mappedStudent.feesDue = 0;

  // Validation Check 1: Mandatory Fields
  if (!mappedStudent.name || mappedStudent.name.trim().length === 0) {
    issues.push({
      field: 'name',
      severity: 'error',
      message: 'Student Name is required'
    });
  } else if (mappedStudent.name.trim().length < 2) {
    issues.push({
      field: 'name',
      severity: 'error',
      message: 'Student Name must be at least 2 characters long'
    });
  }

  if (!mappedStudent.rollNo || mappedStudent.rollNo.toString().trim().length === 0) {
    issues.push({
      field: 'rollNo',
      severity: 'error',
      message: 'Class Roll Number is required'
    });
  }

  if (!mappedStudent.class || mappedStudent.class.trim().length === 0) {
    issues.push({
      field: 'class',
      severity: 'error',
      message: 'Class / Grade is required'
    });
  }

  if (!mappedStudent.section || mappedStudent.section.trim().length === 0) {
    issues.push({
      field: 'section',
      severity: 'error',
      message: 'Class Section is required'
    });
  }

  if (!mappedStudent.guardian || mappedStudent.guardian.trim().length === 0) {
    issues.push({
      field: 'guardian',
      severity: 'error',
      message: 'Guardian / Father Name is required'
    });
  }

  // Validation Check 2: In-File Duplicate Detection (same Class + Section + RollNo)
  let isDuplicateInFile = false;
  if (mappedStudent.class && mappedStudent.section && mappedStudent.rollNo) {
    const classHdr = schemaToHeader['class'];
    const secHdr = schemaToHeader['section'];
    const rollHdr = schemaToHeader['rollNo'];

    if (classHdr && secHdr && rollHdr) {
      const matchIndex = allMappedRows.findIndex((otherRow, oIdx) => {
        if (oIdx === rowIndex) return false;
        const otherClass = (otherRow[classHdr] || '').trim().toLowerCase();
        const otherSec = (otherRow[secHdr] || '').trim().toLowerCase();
        const otherRoll = (otherRow[rollHdr] || '').trim().toLowerCase();

        return (
          otherClass === mappedStudent.class?.trim().toLowerCase() &&
          otherSec === mappedStudent.section?.trim().toLowerCase() &&
          otherRoll === mappedStudent.rollNo?.toString().trim().toLowerCase()
        );
      });

      if (matchIndex >= 0) {
        isDuplicateInFile = true;
        issues.push({
          field: 'rollNo',
          severity: 'error',
          message: `Duplicate Roll "${mappedStudent.rollNo}" in ${mappedStudent.class}-${mappedStudent.section} (conflicts with row ${matchIndex + 1})`
        });
      }
    }
  }

  // Validation Check 3: Database Duplicate Detection
  let isDuplicateInDb = false;
  let dbConflictId: string | undefined;

  if (mappedStudent.id) {
    const existingById = existingStudents.find(
      (s) => s.id.toLowerCase() === mappedStudent.id?.toLowerCase()
    );
    if (existingById) {
      isDuplicateInDb = true;
      dbConflictId = existingById.id;
      issues.push({
        field: 'id',
        severity: 'warning',
        message: `Student ID "${mappedStudent.id}" already exists in system for student "${existingById.name}"`
      });
    }
  }

  if (!isDuplicateInDb && mappedStudent.class && mappedStudent.section && mappedStudent.rollNo) {
    const existingByRoll = existingStudents.find(
      (s) =>
        s.class.toLowerCase() === mappedStudent.class?.toLowerCase() &&
        s.section.toLowerCase() === mappedStudent.section?.toLowerCase() &&
        s.rollNo.toString().trim() === mappedStudent.rollNo?.toString().trim()
    );
    if (existingByRoll) {
      isDuplicateInDb = true;
      dbConflictId = existingByRoll.id;
      issues.push({
        field: 'rollNo',
        severity: 'warning',
        message: `Roll ${mappedStudent.rollNo} in ${mappedStudent.class}-${mappedStudent.section} matches registered student "${existingByRoll.name}" (${existingByRoll.id})`
      });
    }
  }

  const hasErrors = issues.some((i) => i.severity === 'error');
  const hasWarnings = issues.some((i) => i.severity === 'warning');

  return {
    rowIndex,
    rawRow,
    mappedStudent,
    issues,
    isValid: !hasErrors,
    hasWarnings,
    isDuplicateInFile,
    isDuplicateInDb,
    dbConflictId
  };
};

/**
 * Generates sample CSV template content with standard realistic student records.
 */
export const generateSampleCsvContent = (): string => {
  const headers = [
    'Student Name',
    'Roll No',
    'Class',
    'Section',
    'Guardian Name',
    'Mobile Number',
    'Blood Group',
    'Gender',
    'Fees Due',
    'Status',
    'Date of Birth',
    'Email Address',
    'Address',
    'Group'
  ];

  const sampleRows = [
    ['Tanzim Hasan', '107', 'Class 10', 'A', 'Mizanur Rahman', '01711998822', 'A+', 'Male', '1200', 'Active', '2008-03-12', 'tanzim.hasan@example.com', 'Dhanmondi, Dhaka', 'Science'],
    ['Sumaiya Akter', '108', 'Class 10', 'A', 'Rafiqul Islam', '01822334455', 'O+', 'Female', '0', 'Active', '2008-07-25', 'sumaiya.akter@example.com', 'Mirpur-2, Dhaka', 'Science'],
    ['Jubayer Ahmed', '109', 'Class 9', 'B', 'Monirul Islam', '01933445566', 'B+', 'Male', '2500', 'Active', '2009-01-18', 'jubayer.ahmed@example.com', 'Uttara, Sector 4, Dhaka', 'Commerce'],
    ['Anika Tabassum', '110', 'Class 9', 'B', 'Shah Alam', '01744556677', 'AB+', 'Female', '0', 'Active', '2009-11-04', 'anika.tabassum@example.com', 'Gulshan, Dhaka', 'Commerce'],
    ['Mahir Faysal', '111', 'Class 8', 'A', 'Faruk Hossain', '01855667788', 'B-', 'Male', '800', 'Active', '2010-06-30', 'mahir.faysal@example.com', 'Mohammadpur, Dhaka', 'General'],
    ['Nabila Sultana', '112', 'Class 8', 'B', 'Delwar Hossain', '01766778899', 'O-', 'Female', '0', 'Active', '2010-09-15', 'nabila.sultana@example.com', 'Badda, Dhaka', 'General']
  ];

  const csvRows = [
    headers.join(','),
    ...sampleRows.map((r) => r.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
  ];

  return csvRows.join('\r\n');
};

/**
 * Triggers a browser download of the sample CSV template.
 */
export const downloadSampleCsvFile = (filename = 'SmartSchool_Student_Bulk_Upload_Template.csv'): void => {
  const content = generateSampleCsvContent();
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
