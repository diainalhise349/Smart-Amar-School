import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  CreditCard, Printer, Download, Sparkles, Filter, 
  RotateCw, Eye, CheckSquare, Square, Search, Settings2,
  ShieldCheck, ExternalLink, Copy, Check, Users, School,
  Layers, Sliders, ChevronDown, CheckCircle2, UserCheck,
  FileSpreadsheet, ArrowRight, Grid, LayoutGrid
} from 'lucide-react';
import { Student } from '../types';
import { getStoredStudents, subscribeToStudents } from '../utils/studentStorage';
import { StudentIDCard, IDCardTheme } from './StudentIDCard';
import { Button, Card, Badge, Modal, useToast } from './UIComponents';
import { getStudentVerificationUrl } from '../utils/studentVerification';

export interface StudentIDCardGeneratorProps {
  initialStudentId?: string;
  isModal?: boolean;
  onClose?: () => void;
}

export const StudentIDCardGenerator: React.FC<StudentIDCardGeneratorProps> = ({
  initialStudentId,
  isModal = false,
  onClose
}) => {
  const { addToast } = useToast();

  // Student directory state
  const [students, setStudents] = useState<Student[]>(() => getStoredStudents());
  useEffect(() => {
    const unsub = subscribeToStudents((updated) => setStudents(updated));
    return () => unsub();
  }, []);

  // Filter state
  const [selectedClass, setSelectedClass] = useState<string>('All Classes');
  const [selectedSection, setSelectedSection] = useState<string>('All Sections');
  const [selectedStatus, setSelectedStatus] = useState<string>('Active');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected student IDs for batch actions
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());

  // Currently focused student in Single Card Inspector
  const [focusedStudentId, setFocusedStudentId] = useState<string>(initialStudentId || '');

  // View mode: 'studio' (single inspector) vs 'batch_grid' (A4 print sheet)
  const [viewMode, setViewMode] = useState<'studio' | 'batch_grid'>('studio');

  // Customization settings
  const [theme, setTheme] = useState<IDCardTheme>('navy');
  const [expiryDate, setExpiryDate] = useState<string>('31 Dec 2025');
  const [issueDate, setIssueDate] = useState<string>('01 Jan 2024');
  const [schoolName, setSchoolName] = useState<string>('SMART AMAR SCHOOL & COLLEGE');
  const [eiinCode, setEiinCode] = useState<string>('EIIN: 134209 • Code: 2041');
  const [showSignature, setShowSignature] = useState<boolean>(true);
  const [showBloodGroup, setShowBloodGroup] = useState<boolean>(true);
  const [showEmergencyPhone, setShowEmergencyPhone] = useState<boolean>(true);
  const [printLayout, setPrintLayout] = useState<'front_only' | 'front_and_back'>('front_and_back');

  // Settings drawer toggle
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Derive unique classes & sections
  const availableClasses = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      if (s.class) set.add(s.class);
    });
    return ['All Classes', ...Array.from(set).sort()];
  }, [students]);

  const availableSections = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      if (s.section) set.add(s.section);
    });
    return ['All Sections', ...Array.from(set).sort()];
  }, [students]);

  // Filtered student list
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (selectedClass !== 'All Classes' && s.class !== selectedClass) return false;
      if (selectedSection !== 'All Sections' && s.section !== selectedSection) return false;
      if (selectedStatus !== 'All' && s.status !== selectedStatus) return false;

      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const name = (s.name || '').toLowerCase();
        const id = (s.id || '').toLowerCase();
        const roll = (s.rollNo || '').toString().toLowerCase();
        const guardian = (s.guardian || '').toLowerCase();

        return name.includes(q) || id.includes(q) || roll.includes(q) || guardian.includes(q);
      }

      return true;
    });
  }, [students, selectedClass, selectedSection, selectedStatus, searchQuery]);

  // Ensure focusedStudentId is valid
  useEffect(() => {
    if (!focusedStudentId && filteredStudents.length > 0) {
      setFocusedStudentId(filteredStudents[0].id);
    }
  }, [filteredStudents, focusedStudentId]);

  // Current focused student object
  const focusedStudent = useMemo(() => {
    return students.find((s) => s.id === focusedStudentId) || filteredStudents[0] || students[0];
  }, [students, focusedStudentId, filteredStudents]);

  // Handle select all / deselect all
  const handleToggleSelectAll = () => {
    if (selectedStudentIds.size === filteredStudents.length) {
      setSelectedStudentIds(new Set());
    } else {
      setSelectedStudentIds(new Set(filteredStudents.map((s) => s.id)));
    }
  };

  const handleToggleStudentSelection = (id: string) => {
    const next = new Set(selectedStudentIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedStudentIds(next);
  };

  // Direct Browser Native Print Action
  const handlePrintCards = () => {
    // Switch to batch grid view for printing if in studio mode
    if (viewMode === 'studio') {
      setViewMode('batch_grid');
    }
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Students to display in batch print sheet
  const studentsToPrint = useMemo(() => {
    if (selectedStudentIds.size > 0) {
      return students.filter((s) => selectedStudentIds.has(s.id));
    }
    return filteredStudents;
  }, [students, selectedStudentIds, filteredStudents]);

  return (
    <div className={`space-y-6 ${isModal ? 'p-1' : ''}`}>
      
      {/* --------------------------------------------------------------------- */}
      {/* 1. TOP HEADER & EXECUTIVE ACTION BAR (HIDDEN IN PRINT) */}
      {/* --------------------------------------------------------------------- */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-indigo-900/60 print:hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-400/30 flex items-center justify-center font-bold">
              <CreditCard size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                  Digital Student ID Card Generator
                </h2>
                <span className="text-[10px] font-mono font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-400/40 px-2.5 py-0.5 rounded-full">
                  Dynamic QR Verification
                </span>
                <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full">
                  CR80 PVC Standard
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-1 max-w-2xl">
                Produce authentic identity cards featuring cryptographic scannable QR codes linking to the real-time student verification portal.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-800/80 p-1 rounded-2xl border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('studio')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'studio'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye size={14} />
                <span>Single Inspector</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('batch_grid')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'batch_grid'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Grid size={14} />
                <span>Batch Sheet ({studentsToPrint.length})</span>
              </button>
            </div>

            {/* Customization Settings Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 text-xs font-bold flex items-center gap-1.5"
            >
              <Settings2 size={14} />
              <span>Card Settings</span>
            </Button>

            {/* Print Action */}
            <Button
              size="sm"
              onClick={handlePrintCards}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Printer size={14} />
              <span>Print {studentsToPrint.length} Card(s)</span>
            </Button>

            {isModal && onClose && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 text-xs"
              >
                Close
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 2. CARD CUSTOMIZATION SETTINGS DRAWER (COLLAPSIBLE, HIDDEN IN PRINT) */}
      {/* --------------------------------------------------------------------- */}
      {isSettingsOpen && (
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4 print:hidden animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Sliders size={18} className="text-indigo-600" />
              <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                ID Card Layout & Visual Customization
              </h3>
            </div>
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              Dismiss
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {/* Theme Selector */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                Visual Theme Preset
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'navy', label: 'Royal Navy', color: 'bg-indigo-900' },
                  { id: 'crimson', label: 'Crimson', color: 'bg-rose-900' },
                  { id: 'emerald', label: 'Emerald', color: 'bg-emerald-900' },
                  { id: 'slate', label: 'Tech Slate', color: 'bg-slate-900' }
                ].map((th) => (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => setTheme(th.id as any)}
                    className={`flex items-center gap-1.5 p-2 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                      theme === th.id
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full ${th.color} shrink-0`} />
                    <span className="truncate">{th.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Validity Dates */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                Dates Configuration
              </label>
              <div className="space-y-2">
                <div>
                  <span className="text-[10px] text-slate-400 block">Card Expiry Date</span>
                  <input
                    type="text"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full text-xs font-mono font-bold p-1.5 rounded-lg border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Issue Date</span>
                  <input
                    type="text"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full text-xs font-mono font-bold p-1.5 rounded-lg border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>
            </div>

            {/* Institution Overrides */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                Institutional Header
              </label>
              <div className="space-y-2">
                <div>
                  <span className="text-[10px] text-slate-400 block">School Name</span>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="w-full text-xs font-bold p-1.5 rounded-lg border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">EIIN & Registration</span>
                  <input
                    type="text"
                    value={eiinCode}
                    onChange={(e) => setEiinCode(e.target.value)}
                    className="w-full text-xs font-mono p-1.5 rounded-lg border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>
            </div>

            {/* Print Options & Toggles */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                Field Toggles
              </label>
              <div className="space-y-1.5 pt-0.5">
                <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showBloodGroup}
                    onChange={(e) => setShowBloodGroup(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                  />
                  <span>Show Blood Group</span>
                </label>
                <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showEmergencyPhone}
                    onChange={(e) => setShowEmergencyPhone(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                  />
                  <span>Show Emergency Contact</span>
                </label>
                <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showSignature}
                    onChange={(e) => setShowSignature(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                  />
                  <span>Show Principal Signature</span>
                </label>

                <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-500">Batch Print:</span>
                  <select
                    value={printLayout}
                    onChange={(e) => setPrintLayout(e.target.value as any)}
                    className="text-xs font-bold border border-slate-200 rounded p-1 bg-slate-50"
                  >
                    <option value="front_and_back">Front + Back Paired</option>
                    <option value="front_only">Front Side Only</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* 3. FILTER & STUDENT COHORT CONTROLS (HIDDEN IN PRINT) */}
      {/* --------------------------------------------------------------------- */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs print:hidden">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Class Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-500 uppercase text-[10px]">Class:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 font-bold text-slate-800 outline-none focus:ring-1 ring-indigo-500 cursor-pointer"
            >
              {availableClasses.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          {/* Section Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-500 uppercase text-[10px]">Section:</span>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 font-bold text-slate-800 outline-none focus:ring-1 ring-indigo-500 cursor-pointer"
            >
              {availableSections.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-500 uppercase text-[10px]">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 font-bold text-slate-800 outline-none focus:ring-1 ring-indigo-500 cursor-pointer"
            >
              <option value="Active">Active Only</option>
              <option value="All">All Statuses</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          {/* Select All Toggle */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleToggleSelectAll}
            className="text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            {selectedStudentIds.size === filteredStudents.length && filteredStudents.length > 0 ? (
              <>
                <CheckSquare size={14} className="text-indigo-600" />
                <span>Deselect All</span>
              </>
            ) : (
              <>
                <Square size={14} className="text-slate-400" />
                <span>Select All ({filteredStudents.length})</span>
              </>
            )}
          </Button>

          {selectedStudentIds.size > 0 && (
            <span className="font-mono text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-1 rounded-lg font-bold">
              {selectedStudentIds.size} student(s) selected
            </span>
          )}
        </div>

        {/* Search */}
        <div className="w-full sm:w-56">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student or roll..."
            className="w-full text-xs font-medium border border-slate-200 rounded-xl px-3 py-1.5 bg-slate-50 text-slate-800 outline-none focus:ring-2 ring-indigo-500"
          />
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 4. MAIN CONTENT AREA: SINGLE STUDIO OR BATCH SHEET */}
      {/* ===================================================================== */}
      
      {/* VIEW A: INTERACTIVE SINGLE CARD STUDIO */}
      {viewMode === 'studio' && focusedStudent && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start print:hidden">
          
          {/* Left Student Selector List */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="font-black text-xs uppercase text-slate-600 tracking-wider">
                Select Student ({filteredStudents.length})
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Click to inspect
              </span>
            </div>

            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {filteredStudents.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs italic">
                  No students match the current filter.
                </div>
              ) : (
                filteredStudents.map((st) => {
                  const isSelected = selectedStudentIds.has(st.id);
                  const isFocused = st.id === focusedStudentId;

                  return (
                    <div
                      key={st.id}
                      onClick={() => setFocusedStudentId(st.id)}
                      className={`p-3 transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                        isFocused
                          ? 'bg-indigo-50/80 border-l-4 border-indigo-600'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStudentSelection(st.id);
                          }}
                          className="text-slate-400 hover:text-indigo-600 cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare size={16} className="text-indigo-600" />
                          ) : (
                            <Square size={16} />
                          )}
                        </button>

                        <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center font-bold text-xs text-slate-500">
                          {st.imageUrl ? (
                            <img src={st.imageUrl} alt={st.name} className="w-full h-full object-cover" />
                          ) : (
                            <span>{(st.name || 'S').charAt(0)}</span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <span className="font-bold text-xs text-slate-900 block truncate">
                            {st.name}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {st.id} • Roll {st.rollNo} • {st.class}-{st.section}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          st.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {st.status}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Center / Right Single Card Inspector Canvas */}
          <div className="lg:col-span-8 bg-slate-100 rounded-3xl border border-slate-200 p-6 flex flex-col items-center justify-center min-h-[550px] relative shadow-inner">
            <div className="text-center mb-4">
              <span className="text-xs font-mono font-bold text-indigo-700 uppercase tracking-widest block">
                Official Identity Card Preview
              </span>
              <h3 className="text-base font-black text-slate-900 mt-0.5">
                {focusedStudent.name} ({focusedStudent.id})
              </h3>
              <p className="text-[11px] text-slate-500">
                Click anywhere on the card to flip between Front and Back views.
              </p>
            </div>

            {/* Digital Student ID Card */}
            <div className="my-2">
              <StudentIDCard
                student={focusedStudent}
                theme={theme}
                expiryDate={expiryDate}
                issueDate={issueDate}
                institutionName={schoolName}
                eiinNumber={eiinCode}
                showSignature={showSignature}
                showBloodGroup={showBloodGroup}
                showEmergencyPhone={showEmergencyPhone}
              />
            </div>

            {/* Quick Actions Bar */}
            <div className="mt-6 flex items-center gap-3 flex-wrap justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const url = getStudentVerificationUrl(focusedStudent.id);
                  window.open(url, '_blank');
                }}
                className="bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50 font-bold text-xs flex items-center gap-1.5"
              >
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>Test Verification Portal</span>
                <ExternalLink size={12} />
              </Button>

              <Button
                size="sm"
                onClick={() => {
                  // Print just this single student card
                  setSelectedStudentIds(new Set([focusedStudent.id]));
                  setViewMode('batch_grid');
                  setTimeout(() => window.print(), 200);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Printer size={14} />
                <span>Print Single Card</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* VIEW B: BATCH SHEET (PRINT READY A4 SHEET WITH CROP MARKS) */}
      {/* ===================================================================== */}
      {viewMode === 'batch_grid' && (
        <div className="space-y-4">
          {/* Print Banner Notice (Hidden in Print) */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-900 print:hidden">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <div>
                <strong>Batch Print Sheet Ready:</strong> Showing {studentsToPrint.length} student identity card(s). Standard CR80 layout optimized for A4 paper and PVC blank card printers.
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => window.print()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
              >
                <Printer size={14} />
                <span>Send to Printer</span>
              </Button>
            </div>
          </div>

          {/* 
            Print Grid Canvas:
            Optimized for browser printing via @media print.
          */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm print:p-0 print:border-none print:shadow-none">
            
            {studentsToPrint.length === 0 ? (
              <div className="p-12 text-center text-slate-400 italic">
                No students selected for printing. Please select students from the list above.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center print:grid-cols-2 print:gap-4 print:p-2">
                {studentsToPrint.map((st) => (
                  <div key={st.id} className="flex flex-col items-center gap-3 page-break-inside-avoid print:break-inside-avoid">
                    {/* Front Card */}
                    <StudentIDCard
                      student={st}
                      theme={theme}
                      showBack={false}
                      expiryDate={expiryDate}
                      issueDate={issueDate}
                      institutionName={schoolName}
                      eiinNumber={eiinCode}
                      showSignature={showSignature}
                      showBloodGroup={showBloodGroup}
                      showEmergencyPhone={showEmergencyPhone}
                    />

                    {/* Back Card (If enabled in settings) */}
                    {printLayout === 'front_and_back' && (
                      <StudentIDCard
                        student={st}
                        theme={theme}
                        showBack={true}
                        expiryDate={expiryDate}
                        issueDate={issueDate}
                        institutionName={schoolName}
                        eiinNumber={eiinCode}
                        showSignature={showSignature}
                        showBloodGroup={showBloodGroup}
                        showEmergencyPhone={showEmergencyPhone}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
