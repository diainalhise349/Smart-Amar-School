import { Student } from '../types';
import { MOCK_STUDENTS } from '../constants';

export const STUDENT_STORAGE_KEY = 'smart_school_students_nominal_roll_v1';
export const STUDENT_UPDATE_EVENT = 'smart-school-students-nominal-roll-event';

/**
 * Retrieves the full list of enrolled students from localStorage.
 * If empty or first run, seeds with MOCK_STUDENTS.
 */
export const getStoredStudents = (): Student[] => {
  try {
    const raw = localStorage.getItem(STUDENT_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STUDENT_STORAGE_KEY, JSON.stringify(MOCK_STUDENTS));
      return [...MOCK_STUDENTS];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Ensure all students have tenant metadata and merge any new default mock students
      const existingIds = new Set(parsed.map((s: Student) => s.id));
      const missingMocks = MOCK_STUDENTS.filter(m => !existingIds.has(m.id));
      const enriched = parsed.map((s: Student) => {
        if (!s.tenantSubdomain) {
          const matchMock = MOCK_STUDENTS.find(m => m.id === s.id);
          if (matchMock) {
            return { ...s, tenantId: matchMock.tenantId, tenantSubdomain: matchMock.tenantSubdomain, tenantName: matchMock.tenantName };
          }
          return { ...s, tenantId: '1', tenantSubdomain: 'dcc', tenantName: 'Dhaka City College' };
        }
        return s;
      });
      const combined = [...enriched, ...missingMocks];
      if (missingMocks.length > 0 || enriched.some((s, idx) => s !== parsed[idx])) {
        localStorage.setItem(STUDENT_STORAGE_KEY, JSON.stringify(combined));
      }
      return combined;
    }
    localStorage.setItem(STUDENT_STORAGE_KEY, JSON.stringify(MOCK_STUDENTS));
    return [...MOCK_STUDENTS];
  } catch (err) {
    console.error('Failed to parse stored students:', err);
    return [...MOCK_STUDENTS];
  }
};

/**
 * Saves the entire student list and broadcasts an update event.
 */
export const setStoredStudents = (students: Student[]): void => {
  try {
    localStorage.setItem(STUDENT_STORAGE_KEY, JSON.stringify(students));
    window.dispatchEvent(new CustomEvent(STUDENT_UPDATE_EVENT, { detail: students }));
  } catch (err) {
    console.error('Failed to save students to localStorage:', err);
  }
};

/**
 * Subscribes to changes in the student nominal roll across tabs or components.
 */
export const subscribeToStudents = (callback: (students: Student[]) => void): (() => void) => {
  const handler = (event: Event) => {
    const custom = event as CustomEvent<Student[]>;
    if (custom.detail) {
      callback(custom.detail);
    } else {
      callback(getStoredStudents());
    }
  };

  const storageHandler = (event: StorageEvent) => {
    if (event.key === STUDENT_STORAGE_KEY) {
      callback(getStoredStudents());
    }
  };

  window.addEventListener(STUDENT_UPDATE_EVENT, handler);
  window.addEventListener('storage', storageHandler);

  return () => {
    window.removeEventListener(STUDENT_UPDATE_EVENT, handler);
    window.removeEventListener('storage', storageHandler);
  };
};

/**
 * Generates the next sequential Student ID.
 * Follows the standard pattern: ST-2024-XXX or ST-YEAR-SEQ.
 */
export const generateNextStudentId = (currentStudents?: Student[]): string => {
  const students = currentStudents || getStoredStudents();
  const year = new Date().getFullYear();
  let maxSeq = 0;

  students.forEach((st) => {
    const match = st.id.match(/ST-\d{4}-(\d+)/i) || st.id.match(/\d+$/);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    }
  });

  const nextSeq = maxSeq + 1;
  const padded = nextSeq.toString().padStart(3, '0');
  return `ST-${year}-${padded}`;
};

/**
 * Adds or updates a single student.
 */
export const saveStudent = (student: Student): Student[] => {
  const students = getStoredStudents();
  const index = students.findIndex((s) => s.id === student.id);

  let updatedList: Student[];
  if (index >= 0) {
    updatedList = [...students];
    updatedList[index] = { ...updatedList[index], ...student };
  } else {
    updatedList = [student, ...students];
  }

  setStoredStudents(updatedList);
  return updatedList;
};

/**
 * Deletes a student by ID.
 */
export const deleteStudent = (id: string): Student[] => {
  const students = getStoredStudents();
  const updated = students.filter((s) => s.id !== id);
  setStoredStudents(updated);
  return updated;
};

/**
 * Bulk adds or updates an array of students using a specified collision resolution strategy.
 */
export const bulkAddStudents = (
  newStudents: Student[],
  strategy: 'skip_existing' | 'update_existing' | 'add_all' = 'update_existing'
): {
  addedCount: number;
  updatedCount: number;
  skippedCount: number;
  students: Student[];
} => {
  const existingList = getStoredStudents();
  let workingList = [...existingList];

  let addedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  newStudents.forEach((newStudent) => {
    // Check if duplicate exists by ID or by (class + section + rollNo)
    const existingIndex = workingList.findIndex(
      (s) =>
        s.id.toLowerCase() === newStudent.id.toLowerCase() ||
        (s.class.toLowerCase() === newStudent.class.toLowerCase() &&
          s.section.toLowerCase() === newStudent.section.toLowerCase() &&
          s.rollNo.toString().trim() === newStudent.rollNo.toString().trim())
    );

    if (existingIndex >= 0) {
      if (strategy === 'skip_existing') {
        skippedCount++;
      } else if (strategy === 'update_existing') {
        workingList[existingIndex] = {
          ...workingList[existingIndex],
          ...newStudent,
          id: workingList[existingIndex].id // keep original ID
        };
        updatedCount++;
      } else if (strategy === 'add_all') {
        // Generate new ID and append
        const newId = generateNextStudentId(workingList);
        workingList.unshift({
          ...newStudent,
          id: newId
        });
        addedCount++;
      }
    } else {
      // Brand new student
      workingList.unshift(newStudent);
      addedCount++;
    }
  });

  setStoredStudents(workingList);

  return {
    addedCount,
    updatedCount,
    skippedCount,
    students: workingList
  };
};

/**
 * Resets student nominal roll back to original demo seed students.
 */
export const resetToSeedStudents = (): Student[] => {
  setStoredStudents([...MOCK_STUDENTS]);
  return [...MOCK_STUDENTS];
};
