import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Copy,
  Check,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Languages,
  CheckCircle2,
  Clock,
  Layers,
  Zap,
  Info,
  ChevronRight,
  BookmarkPlus,
  Send,
  X
} from 'lucide-react';
import { Card, Button, Badge, Modal, useToast } from './UIComponents';
import { useAuth } from '../context/AuthContext';
import {
  SMSCategory,
  SMSTemplatePreset,
  getSMSTemplates,
  saveSMSTemplate,
  deleteSMSTemplate,
  resetSMSTemplatesToDefaults,
  calculateSMSMeta,
  interpolateSMSText,
  SMS_TEMPLATES_EVENT
} from '../utils/smsBroadcastService';

interface SMSTemplateManagerProps {
  onSelectTemplate?: (template: SMSTemplatePreset) => void;
  isOpenAsModal?: boolean;
  onCloseModal?: () => void;
}

export const SMSTemplateManager: React.FC<SMSTemplateManagerProps> = ({
  onSelectTemplate,
  isOpenAsModal = false,
  onCloseModal
}) => {
  const { activeTenant } = useAuth();
  const { addToast } = useToast();

  const [templates, setTemplates] = useState<SMSTemplatePreset[]>(() => getSMSTemplates(activeTenant?.id));
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | SMSCategory>('ALL');
  const [languageFilter, setLanguageFilter] = useState<'ALL' | 'bn' | 'en'>('ALL');

  // Modal editor states
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<SMSTemplatePreset | null>(null);

  // Editor Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<SMSCategory>('announcement');
  const [formIsUrgent, setFormIsUrgent] = useState(false);
  const [formLanguage, setFormLanguage] = useState<'bn' | 'en'>('bn');
  const [formContent, setFormContent] = useState('');

  // Delete Confirmation State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Sync templates on window event
  useEffect(() => {
    const handleUpdate = () => {
      setTemplates(getSMSTemplates(activeTenant?.id));
    };

    window.addEventListener(SMS_TEMPLATES_EVENT, handleUpdate);
    return () => window.removeEventListener(SMS_TEMPLATES_EVENT, handleUpdate);
  }, [activeTenant?.id]);

  // Filtered list
  const filteredTemplates = useMemo(() => {
    return templates.filter(tmpl => {
      const matchCat = categoryFilter === 'ALL' || tmpl.category === categoryFilter;
      const matchLang = languageFilter === 'ALL' || tmpl.language === languageFilter;
      const matchSearch = !searchQuery.trim() || 
        tmpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tmpl.content.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCat && matchLang && matchSearch;
    });
  }, [templates, categoryFilter, languageFilter, searchQuery]);

  // Meta for editor content
  const editorMeta = useMemo(() => {
    return calculateSMSMeta(formContent);
  }, [formContent]);

  // Live resolved sample for editor preview
  const editorResolvedPreview = useMemo(() => {
    return interpolateSMSText(formContent, {
      studentName: 'SADIA SULTANA',
      guardianName: 'DR. KAMRUL HASAN',
      className: 'Class 10',
      rollNo: '04',
      schoolName: activeTenant?.name || 'Sonar Bangla High School'
    });
  }, [formContent, activeTenant]);

  // Open Create New
  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setFormTitle('');
    setFormCategory('announcement');
    setFormIsUrgent(false);
    setFormLanguage('bn');
    setFormContent('');
    setIsEditorOpen(true);
  };

  // Open Edit
  const handleOpenEdit = (tmpl: SMSTemplatePreset) => {
    setEditingTemplate(tmpl);
    setFormTitle(tmpl.title);
    setFormCategory(tmpl.category);
    setFormIsUrgent(tmpl.isUrgent);
    setFormLanguage(tmpl.language);
    setFormContent(tmpl.content);
    setIsEditorOpen(true);
  };

  // Duplicate Template
  const handleDuplicate = (tmpl: SMSTemplatePreset) => {
    try {
      const duplicated = saveSMSTemplate({
        title: `${tmpl.title} (Copy)`,
        category: tmpl.category,
        isUrgent: tmpl.isUrgent,
        language: tmpl.language,
        content: tmpl.content,
        tenantId: activeTenant?.id
      });
      addToast(`Template '${duplicated.title}' created as duplicate!`, 'success');
      setTemplates(getSMSTemplates(activeTenant?.id));
    } catch (err) {
      addToast('Failed to duplicate template', 'error');
    }
  };

  // Insert Tag into Editor
  const handleInsertTagInEditor = (tag: string) => {
    setFormContent(prev => prev + ` ${tag} `);
  };

  // Save or Update
  const handleSaveTemplateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitle.trim()) {
      addToast('Please provide a descriptive template title.', 'error');
      return;
    }

    if (!formContent.trim()) {
      addToast('Template content cannot be empty.', 'error');
      return;
    }

    try {
      const saved = saveSMSTemplate({
        id: editingTemplate ? editingTemplate.id : undefined,
        title: formTitle.trim(),
        category: formCategory,
        isUrgent: formIsUrgent,
        language: formLanguage,
        content: formContent.trim(),
        tenantId: activeTenant?.id
      });

      addToast(
        editingTemplate
          ? `Template '${saved.title}' updated successfully!`
          : `New template '${saved.title}' saved to library!`,
        'success'
      );

      setIsEditorOpen(false);
      setTemplates(getSMSTemplates(activeTenant?.id));
    } catch (err) {
      addToast('Error saving template. Please try again.', 'error');
    }
  };

  // Delete
  const handleConfirmDelete = (id: string) => {
    const success = deleteSMSTemplate(id);
    if (success) {
      addToast('Template removed from library', 'info');
      setTemplates(getSMSTemplates(activeTenant?.id));
      setDeleteConfirmId(null);
    } else {
      addToast('Failed to delete template', 'error');
    }
  };

  // Reset to defaults
  const handleResetDefaults = () => {
    if (window.confirm('Are you sure you want to restore default official SMS templates? Custom templates will be reset.')) {
      const defaults = resetSMSTemplatesToDefaults();
      setTemplates(defaults);
      addToast('Default official templates restored!', 'success');
    }
  };

  // Use Template in composer
  const handleUseTemplate = (tmpl: SMSTemplatePreset) => {
    if (onSelectTemplate) {
      onSelectTemplate(tmpl);
    }
    if (onCloseModal) {
      onCloseModal();
    }
  };

  const content = (
    <div className="space-y-6">
      {/* Header and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <FileText size={20} />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>SMS Template Library & Manager</span>
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                  {templates.length} Saved
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Save, customize, and rapidly reuse standard school notices and emergency alerts.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={RotateCcw}
            onClick={handleResetDefaults}
            className="text-xs font-bold text-slate-600 hover:text-slate-900"
            title="Restore official default templates"
          >
            Reset Defaults
          </Button>

          <Button
            id="create-new-template-btn"
            type="button"
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={handleOpenCreate}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-md shadow-indigo-100 text-xs"
          >
            Create New Template
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search query */}
          <div className="sm:col-span-5 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates by keyword, title, or body..."
              className="w-full pl-9 pr-3 py-2 text-xs font-medium border border-slate-200 rounded-xl bg-white focus:ring-2 ring-indigo-500 outline-none"
            />
          </div>

          {/* Category filter */}
          <div className="sm:col-span-4">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl bg-white focus:ring-2 ring-indigo-500 outline-none"
            >
              <option value="ALL">All Categories ({templates.length})</option>
              <option value="urgent">🚨 Urgent Alerts</option>
              <option value="announcement">📢 Announcements</option>
              <option value="exam">📝 Exams & Results</option>
              <option value="fee">💳 Fee Reminders</option>
              <option value="general">📄 General Notices</option>
            </select>
          </div>

          {/* Language filter */}
          <div className="sm:col-span-3">
            <div className="grid grid-cols-3 gap-1 bg-white p-1 rounded-xl border border-slate-200 text-[11px] font-bold text-center">
              <button
                type="button"
                onClick={() => setLanguageFilter('ALL')}
                className={`py-1 rounded-lg transition-all ${
                  languageFilter === 'ALL' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setLanguageFilter('bn')}
                className={`py-1 rounded-lg transition-all ${
                  languageFilter === 'bn' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                বাংলা
              </button>
              <button
                type="button"
                onClick={() => setLanguageFilter('en')}
                className={`py-1 rounded-lg transition-all ${
                  languageFilter === 'en' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                English
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12 px-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
          <FileText size={36} className="mx-auto text-slate-300 mb-2" />
          <h4 className="text-sm font-black text-slate-700">No matching SMS templates found</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search keywords or category filters, or click "Create New Template" to add one.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={Plus}
            onClick={handleOpenCreate}
            className="mt-4 text-xs font-bold"
          >
            Create First Template
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTemplates.map((tmpl) => {
            const meta = calculateSMSMeta(tmpl.content);
            const isDeleting = deleteConfirmId === tmpl.id;

            return (
              <div
                key={tmpl.id}
                className={`rounded-2xl border transition-all p-4 flex flex-col justify-between bg-white relative ${
                  tmpl.isUrgent
                    ? 'border-rose-200 hover:border-rose-300 hover:shadow-md hover:shadow-rose-50/50'
                    : 'border-slate-200 hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-50/50'
                }`}
              >
                <div>
                  {/* Top Bar of Card */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {tmpl.isUrgent && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1">
                          <AlertTriangle size={10} />
                          Urgent
                        </span>
                      )}

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black capitalize ${
                        tmpl.category === 'urgent'
                          ? 'bg-rose-50 text-rose-700'
                          : tmpl.category === 'exam'
                          ? 'bg-blue-50 text-blue-700'
                          : tmpl.category === 'fee'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-indigo-50 text-indigo-700'
                      }`}>
                        {tmpl.category}
                      </span>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        tmpl.language === 'bn'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {tmpl.language === 'bn' ? 'বাংলা' : 'English'}
                      </span>

                      {tmpl.isCustom && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Custom
                        </span>
                      )}
                    </div>

                    {/* Quick Action Icons */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleDuplicate(tmpl)}
                        title="Duplicate template"
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Copy size={13} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEdit(tmpl)}
                        title="Edit template"
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit2 size={13} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(isDeleting ? null : tmpl.id)}
                        title="Delete template"
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isDeleting ? 'bg-rose-100 text-rose-700' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                        }`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Template Title */}
                  <h4 className="text-sm font-bold text-slate-900 mb-2 leading-snug">
                    {tmpl.title}
                  </h4>

                  {/* Delete Confirmation Drawer inside card */}
                  {isDeleting && (
                    <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs flex items-center justify-between gap-2 animate-fadeIn">
                      <span className="text-rose-900 font-bold">Confirm delete template?</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2 py-1 text-[11px] font-bold text-slate-600 hover:bg-rose-100 rounded"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleConfirmDelete(tmpl.id)}
                          className="px-2 py-1 text-[11px] font-black text-white bg-rose-600 hover:bg-rose-700 rounded shadow-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Template Body */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs text-slate-700 leading-relaxed font-normal whitespace-pre-wrap">
                    {tmpl.content}
                  </div>
                </div>

                {/* Card Footer / Metrics and Use Button */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                    <span className="font-mono">{meta.charCount} chars</span>
                    <span>•</span>
                    <span className="font-mono text-indigo-700 font-bold">{meta.smsParts} SMS {meta.smsParts > 1 ? 'parts' : 'part'}</span>
                    <span>•</span>
                    <span className="text-slate-400">{meta.isUnicode ? 'Unicode' : 'GSM 7-bit'}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleUseTemplate(tmpl)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
                  >
                    <span>Use in Broadcast</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: CREATE OR EDIT TEMPLATE */}
      <Modal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        title={editingTemplate ? "Edit SMS Message Template" : "Create New SMS Message Template"}
        size="lg"
      >
        <form onSubmit={handleSaveTemplateSubmit} className="space-y-4">
          <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-900 leading-relaxed">
            Configure reusable templates with standard text and dynamic variables. Variables will dynamically resolve to individual student names, rolls, and guardians during broadcast.
          </div>

          <div className="space-y-3">
            {/* Title */}
            <div>
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">
                Template Name / Title *
              </label>
              <input
                type="text"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. বার্ষিক অভিভাবক সমাবেশ ও প্রগ্রেস রিপোর্ট বিতরণ"
                className="w-full px-3 py-2.5 text-xs font-bold border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 ring-indigo-500 outline-none"
              />
            </div>

            {/* Category & Language & Urgent */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">
                  Category
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => {
                    const cat = e.target.value as SMSCategory;
                    setFormCategory(cat);
                    if (cat === 'urgent') setFormIsUrgent(true);
                  }}
                  className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 ring-indigo-500 outline-none"
                >
                  <option value="announcement">📢 Announcement</option>
                  <option value="urgent">🚨 Urgent Alert</option>
                  <option value="exam">📝 Exam & Routine</option>
                  <option value="fee">💳 Fee Reminder</option>
                  <option value="general">📄 General Notice</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">
                  Language
                </label>
                <select
                  value={formLanguage}
                  onChange={(e) => setFormLanguage(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 ring-indigo-500 outline-none"
                >
                  <option value="bn">বাংলা (Bangla)</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">
                  Urgent Priority
                </label>
                <button
                  type="button"
                  onClick={() => setFormIsUrgent(!formIsUrgent)}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                    formIsUrgent
                      ? 'bg-rose-50 border-rose-300 text-rose-700 ring-1 ring-rose-300'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <AlertTriangle size={13} className={formIsUrgent ? 'text-rose-600' : 'text-slate-400'} />
                  <span>{formIsUrgent ? '🚨 Urgent Alert: ON' : 'Normal Priority'}</span>
                </button>
              </div>
            </div>

            {/* Dynamic Tags Toolbar */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Template Content *
                </label>
                <span className="text-[11px] text-slate-400 font-medium">Click to insert dynamic variables:</span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                {[
                  { tag: '[StudentName]', label: '+ Student Name' },
                  { tag: '[GuardianName]', label: '+ Guardian' },
                  { tag: '[Class]', label: '+ Class' },
                  { tag: '[Roll]', label: '+ Roll No' },
                  { tag: '[SchoolName]', label: '+ School Name' },
                  { tag: '[Date]', label: '+ Today Date' },
                ].map(item => (
                  <button
                    key={item.tag}
                    type="button"
                    onClick={() => handleInsertTagInEditor(item.tag)}
                    className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] border border-indigo-200 transition-colors cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <textarea
                rows={4}
                required
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="Type SMS message template content. Use dynamic tags like [StudentName], [Class], [SchoolName] for personalized messaging..."
                className="w-full text-xs font-medium p-3.5 border border-slate-300 rounded-xl focus:ring-2 ring-indigo-500 outline-none bg-slate-50 focus:bg-white leading-relaxed resize-y"
              />

              {/* Character and GSM calculation strip */}
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-700">
                    Characters: <strong className="text-indigo-600 font-mono">{editorMeta.charCount}</strong>
                  </span>
                  <span>•</span>
                  <span className="font-bold text-slate-700">
                    SMS Parts: <strong className="text-emerald-700 font-mono">{editorMeta.smsParts} part(s)</strong>
                  </span>
                  <span>•</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    editorMeta.isUnicode ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {editorMeta.isUnicode ? 'Bangla / Unicode (70 chars/part)' : 'GSM 7-Bit (160 chars/part)'}
                  </span>
                </div>

                <div className="text-[11px] font-mono text-slate-400">
                  {editorMeta.charsRemainingInCurrentPart} chars left in part
                </div>
              </div>
            </div>

            {/* Resolved Sample Preview Box */}
            {formContent.trim() && (
              <div className="p-3 bg-slate-900 rounded-xl text-white space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={12} className="text-amber-400" />
                  Sample Recipient Preview Resolution:
                </div>
                <p className="text-xs text-slate-200 font-medium leading-relaxed">
                  "{editorResolvedPreview}"
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditorOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              icon={Check}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-md shadow-indigo-100"
            >
              {editingTemplate ? "Save Changes" : "Save to Library"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );

  if (isOpenAsModal) {
    return (
      <Modal
        isOpen={true}
        onClose={onCloseModal || (() => {})}
        title="SMS Message Template Library"
        size="xl"
      >
        {content}
      </Modal>
    );
  }

  return content;
};
