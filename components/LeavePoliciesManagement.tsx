import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, Plus, Edit, Trash2, CheckCircle2, XCircle, AlertCircle, 
  RotateCcw, ShieldCheck, Clock, Calendar, Users, HelpCircle, Eye, 
  Search, Filter, Sparkles, SlidersHorizontal, ArrowRight, Check, X,
  BadgeAlert, BookOpen, AlertTriangle, Info, Layers, RefreshCw, FileCheck
} from 'lucide-react';
import { LeavePolicy } from '../types';
import { 
  getLeavePolicies, 
  saveLeavePolicy, 
  deleteLeavePolicy, 
  toggleLeavePolicyStatus, 
  resetLeavePolicies, 
  subscribeToPolicyUpdates 
} from '../utils/leaveWorkflow';
import { useToast, Modal, Button } from './UIComponents';

interface LeavePoliciesManagementProps {
  onPolicyUpdated?: () => void;
}

export const LeavePoliciesManagement: React.FC<LeavePoliciesManagementProps> = ({ onPolicyUpdated }) => {
  const { showToast } = useToast();

  const [policies, setPolicies] = useState<LeavePolicy[]>(() => getLeavePolicies());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  
  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<LeavePolicy | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewingPolicy, setPreviewingPolicy] = useState<LeavePolicy | null>(null);

  // Form State for Create/Edit
  const [formData, setFormData] = useState<Omit<LeavePolicy, 'updatedAt' | 'updatedBy'>>({
    id: '',
    name: '',
    code: '',
    category: 'Paid',
    color: '#f59e0b',
    description: '',
    annualDays: 14,
    accrualMethod: 'Annual Upfront',
    accrualRatePerMonth: 1.16,
    allowCarryForward: false,
    maxCarryForwardDays: 0,
    encashable: false,
    minServiceMonths: 0,
    applicableRoles: ['All'],
    genderEligibility: 'All',
    minAdvanceNoticeDays: 1,
    maxConsecutiveDays: 3,
    requiresSubstituteTeacher: true,
    requiresDocumentProof: false,
    documentProofNotice: '',
    isActive: true
  });

  // Color preset options
  const colorOptions = [
    { label: 'Amber', hex: '#f59e0b', bg: 'bg-amber-500' },
    { label: 'Emerald', hex: '#10b981', bg: 'bg-emerald-500' },
    { label: 'Indigo', hex: '#6366f1', bg: 'bg-indigo-500' },
    { label: 'Violet', hex: '#8b5cf6', bg: 'bg-violet-500' },
    { label: 'Rose', hex: '#f43f5e', bg: 'bg-rose-500' },
    { label: 'Cyan', hex: '#06b6d4', bg: 'bg-cyan-500' },
    { label: 'Pink', hex: '#ec4899', bg: 'bg-pink-500' },
    { label: 'Blue', hex: '#3b82f6', bg: 'bg-blue-500' }
  ];

  // Refresh policies from storage
  const refreshPolicies = () => {
    const list = getLeavePolicies();
    setPolicies([...list]);
    if (onPolicyUpdated) onPolicyUpdated();
  };

  useEffect(() => {
    refreshPolicies();
    const unsub = subscribeToPolicyUpdates(refreshPolicies);
    return () => unsub();
  }, []);

  // Filtered policies list
  const filteredPolicies = useMemo(() => {
    return policies.filter(p => {
      // Category filter
      if (selectedCategory !== 'all' && p.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      // Status filter
      if (statusFilter === 'active' && !p.isActive) return false;
      if (statusFilter === 'inactive' && p.isActive) return false;
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesCode = p.code.toLowerCase().includes(query);
        const matchesDesc = p.description.toLowerCase().includes(query);
        if (!matchesName && !matchesCode && !matchesDesc) return false;
      }
      return true;
    });
  }, [policies, selectedCategory, statusFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = policies.length;
    const active = policies.filter(p => p.isActive).length;
    const totalAnnualPaidDays = policies
      .filter(p => p.isActive && p.category === 'Paid')
      .reduce((sum, p) => sum + (p.annualDays || 0), 0);
    const carryForwardCount = policies.filter(p => p.isActive && p.allowCarryForward).length;
    return { total, active, totalAnnualPaidDays, carryForwardCount };
  }, [policies]);

  // Handle open create modal
  const handleOpenCreateModal = () => {
    const newId = `POL-CUSTOM-${Date.now().toString().slice(-4)}`;
    setEditingPolicy(null);
    setFormData({
      id: newId,
      name: '',
      code: '',
      category: 'Paid',
      color: '#f59e0b',
      description: '',
      annualDays: 12,
      accrualMethod: 'Annual Upfront',
      accrualRatePerMonth: 1.0,
      allowCarryForward: false,
      maxCarryForwardDays: 0,
      encashable: false,
      minServiceMonths: 0,
      applicableRoles: ['All'],
      genderEligibility: 'All',
      minAdvanceNoticeDays: 1,
      maxConsecutiveDays: 3,
      requiresSubstituteTeacher: true,
      requiresDocumentProof: false,
      documentProofNotice: '',
      isActive: true
    });
    setIsEditModalOpen(true);
  };

  // Handle open edit modal
  const handleOpenEditModal = (policy: LeavePolicy) => {
    setEditingPolicy(policy);
    setFormData({
      id: policy.id,
      name: policy.name,
      code: policy.code,
      category: policy.category,
      color: policy.color,
      description: policy.description,
      annualDays: policy.annualDays,
      accrualMethod: policy.accrualMethod,
      accrualRatePerMonth: policy.accrualRatePerMonth,
      allowCarryForward: policy.allowCarryForward,
      maxCarryForwardDays: policy.maxCarryForwardDays,
      encashable: policy.encashable,
      minServiceMonths: policy.minServiceMonths,
      applicableRoles: [...policy.applicableRoles],
      genderEligibility: policy.genderEligibility,
      minAdvanceNoticeDays: policy.minAdvanceNoticeDays,
      maxConsecutiveDays: policy.maxConsecutiveDays,
      requiresSubstituteTeacher: policy.requiresSubstituteTeacher,
      requiresDocumentProof: policy.requiresDocumentProof,
      documentProofNotice: policy.documentProofNotice || '',
      isActive: policy.isActive
    });
    setIsEditModalOpen(true);
  };

  // Auto calculate monthly accrual rate when annual days changes
  const handleAnnualDaysChange = (days: number) => {
    const safeDays = Math.max(0, days);
    const calculatedRate = parseFloat((safeDays / 12).toFixed(2));
    setFormData(prev => ({
      ...prev,
      annualDays: safeDays,
      accrualRatePerMonth: calculatedRate
    }));
  };

  // Save policy
  const handleSavePolicySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Please enter a valid Leave Policy Name.', 'error');
      return;
    }
    if (!formData.code.trim()) {
      showToast('Please provide a Short Policy Code (e.g., CL, SL, PL).', 'error');
      return;
    }

    const policyToSave: LeavePolicy = {
      ...formData,
      name: formData.name.trim(),
      code: formData.code.trim().toUpperCase(),
      description: formData.description.trim() || `Institutional ${formData.name} policy entitlement.`,
      updatedAt: new Date().toISOString(),
      updatedBy: 'School Administration'
    };

    const res = saveLeavePolicy(policyToSave);
    if (res.success) {
      showToast(res.message, 'success');
      setIsEditModalOpen(false);
      refreshPolicies();
    } else {
      showToast(res.message, 'error');
    }
  };

  // Toggle active/inactive
  const handleToggleStatus = (policyId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const res = toggleLeavePolicyStatus(policyId);
    if (res.success) {
      showToast(res.message, res.isActive ? 'success' : 'info');
      refreshPolicies();
    } else {
      showToast(res.message, 'error');
    }
  };

  // Delete policy
  const handleDeletePolicy = (policy: LeavePolicy, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete leave policy "${policy.name}" (${policy.code})? Teachers will no longer see this policy or its quota.`)) {
      const res = deleteLeavePolicy(policy.id);
      if (res.success) {
        showToast(res.message, 'info');
        refreshPolicies();
      } else {
        showToast(res.message, 'error');
      }
    }
  };

  // Reset to default seed policies
  const handleResetDefaults = () => {
    if (window.confirm('Reset leave policies back to institutional standards (Bangladesh Ministry / CBSE / International defaults)? Any custom modifications will be restored.')) {
      resetLeavePolicies();
      refreshPolicies();
      showToast('Institutional leave policies restored to default configuration.', 'info');
    }
  };

  // Open Preview Modal
  const handleOpenPreview = (policy: LeavePolicy) => {
    setPreviewingPolicy(policy);
    setIsPreviewModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header & Overview Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
                <SlidersHorizontal size={20} />
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Faculty Leave Policies & Eligibility Governance
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
              Define and manage institutional leave categories, annual day quotas, monthly accrual rates, rollover rules, and eligibility constraints. All active policies automatically synchronize with teacher leave balances, application forms, and real-time guidance in the Teacher Portal.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={refreshPolicies}
              className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
              title="Refresh policies from repository"
            >
              <RefreshCw size={14} />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleResetDefaults}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
              title="Restore standard institutional seed policies"
            >
              <RotateCcw size={14} />
              <span>Restore Defaults</span>
            </button>
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Plus size={16} />
              <span>Define New Leave Policy</span>
            </button>
          </div>
        </div>

        {/* Real-time sync indicator and stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Policies
            </div>
            <div className="text-xl font-black text-slate-800 mt-1 flex items-baseline gap-2">
              <span>{stats.total} Defined</span>
              <span className="text-xs font-bold text-emerald-600">({stats.active} Active)</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Annual Paid Entitlement
            </div>
            <div className="text-xl font-black text-slate-800 mt-1 flex items-baseline gap-1.5">
              <span>{stats.totalAnnualPaidDays}</span>
              <span className="text-xs font-normal text-slate-500">Days / Faculty Member</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Rollover Permitted
            </div>
            <div className="text-xl font-black text-slate-800 mt-1 flex items-baseline gap-1.5">
              <span>{stats.carryForwardCount}</span>
              <span className="text-xs font-normal text-slate-500">Policies Allow Carry-Forward</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                <span>Portal Live Sync</span>
              </div>
              <div className="text-xs font-black text-emerald-950 mt-1">
                Reflected in Teacher Portal
              </div>
            </div>
            <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Categories' },
            { id: 'Paid', label: 'Paid Leave' },
            { id: 'Half-Pay', label: 'Half-Pay' },
            { id: 'Special', label: 'Special / Statutory' },
            { id: 'Unpaid', label: 'Unpaid' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === tab.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right side: Search & Status Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search policy name, code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs font-bold border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Policy Cards Grid */}
      {filteredPolicies.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          <SlidersHorizontal size={36} className="mx-auto text-slate-300 mb-2" />
          <p className="font-bold text-slate-700 text-sm">No leave policies match your search filters.</p>
          <p className="text-xs text-slate-400 mt-1">Try resetting the search terms or create a new leave policy.</p>
          <Button variant="secondary" className="mt-4 text-xs" onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setStatusFilter('all'); }}>
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredPolicies.map(policy => {
            const isPolicyActive = policy.isActive;

            return (
              <div
                key={policy.id}
                className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                  isPolicyActive ? 'border-slate-200' : 'border-slate-200 opacity-60 bg-slate-50/50'
                }`}
              >
                <div>
                  {/* Top Bar with Color Indicator, Code & Status */}
                  <div className="p-4 pb-3 border-b border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3.5 h-3.5 rounded-md shrink-0 shadow-xs"
                        style={{ backgroundColor: policy.color }}
                      />
                      <span className="font-mono font-black text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-800">
                        {policy.code}
                      </span>
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        policy.category === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        policy.category === 'Half-Pay' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        policy.category === 'Special' ? 'bg-pink-50 text-pink-700 border border-pink-200' :
                        'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {policy.category}
                      </span>
                    </div>

                    {/* Active toggle button */}
                    <button
                      onClick={(e) => handleToggleStatus(policy.id, e)}
                      className={`text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 transition-colors cursor-pointer ${
                        isPolicyActive 
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                          : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      }`}
                      title={isPolicyActive ? 'Click to deactivate policy' : 'Click to activate policy'}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isPolicyActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      <span>{isPolicyActive ? 'Active' : 'Inactive'}</span>
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3.5">
                    <div>
                      <h3 className="text-base font-black text-slate-900 flex items-center justify-between">
                        <span>{policy.name}</span>
                        <span className="text-lg font-black text-indigo-700">
                          {policy.annualDays} <span className="text-xs font-normal text-slate-400">days/yr</span>
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {policy.description}
                      </p>
                    </div>

                    {/* Accrual Rate & Timing Box */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Accrual Method:</span>
                        <span className="font-bold text-slate-800">{policy.accrualMethod}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Accrual Rate:</span>
                        <span className="font-mono font-bold text-indigo-600">
                          {policy.accrualRatePerMonth > 0 ? `${policy.accrualRatePerMonth} days/mo` : 'Annual Upfront'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Rollover (Carry-Forward):</span>
                        <span className="font-bold text-slate-800">
                          {policy.allowCarryForward ? `Yes (Max ${policy.maxCarryForwardDays} days)` : 'No (Forfeit)'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Cash Encashment:</span>
                        <span className="font-bold text-slate-800">
                          {policy.encashable ? 'Eligible' : 'Non-encashable'}
                        </span>
                      </div>
                    </div>

                    {/* Eligibility Rules Box */}
                    <div className="p-3 bg-indigo-50/40 rounded-xl border border-indigo-100/70 space-y-1.5 text-xs">
                      <div className="text-[10px] font-black uppercase tracking-wider text-indigo-900 mb-1 flex items-center gap-1">
                        <ShieldCheck size={12} className="text-indigo-600" />
                        <span>Eligibility & Application Rules</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 font-medium">Min Service Required:</span>
                        <span className="font-bold text-slate-800">
                          {policy.minServiceMonths === 0 ? 'Immediate (0 months)' : `${policy.minServiceMonths} Months`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 font-medium">Advance Notice:</span>
                        <span className="font-bold text-slate-800">
                          {policy.minAdvanceNoticeDays === 0 ? 'Same-day (0 days)' : `≥ ${policy.minAdvanceNoticeDays} day(s)`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 font-medium">Max Consecutive Days:</span>
                        <span className="font-bold text-slate-800">
                          {policy.maxConsecutiveDays} days max
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 font-medium">Substitute Teacher:</span>
                        <span className={`font-bold ${policy.requiresSubstituteTeacher ? 'text-amber-700' : 'text-slate-600'}`}>
                          {policy.requiresSubstituteTeacher ? 'Compulsory' : 'Optional'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 font-medium">Proof / Prescription:</span>
                        <span className={`font-bold ${policy.requiresDocumentProof ? 'text-rose-700' : 'text-slate-600'}`}>
                          {policy.requiresDocumentProof ? 'Required' : 'Self-declaration'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 font-medium">Staff Eligibility:</span>
                        <span className="font-bold text-slate-800">
                          {policy.genderEligibility === 'All' ? 'All Faculty' : policy.genderEligibility}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenPreview(policy)}
                    className="px-2.5 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-50 rounded-lg flex items-center gap-1 transition-colors"
                    title="See how teachers view this policy in their portal"
                  >
                    <Eye size={13} />
                    <span>Teacher View</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(policy)}
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1 shadow-xs transition-colors"
                      title="Edit this policy"
                    >
                      <Edit size={13} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={(e) => handleDeletePolicy(policy, e)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete this policy"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* CREATE / EDIT POLICY MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={editingPolicy ? `Edit Leave Policy: ${editingPolicy.name}` : 'Define New Institutional Leave Policy'}
      >
        <form onSubmit={handleSavePolicySubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
          {/* Section 1: Basic Identity */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase text-indigo-900 tracking-wider flex items-center gap-1.5 border-b border-indigo-100 pb-1.5">
              <FileCheck size={14} className="text-indigo-600" />
              <span>1. Policy Identity & Classification</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Policy Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Casual Leave, Paternity Leave"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Code (2-4 Letters) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={5}
                  placeholder="e.g., CL, SL, PL"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 text-xs font-mono font-black border border-slate-300 rounded-xl bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="Paid">Paid Leave (Full Pay)</option>
                  <option value="Half-Pay">Half-Pay Leave</option>
                  <option value="Special">Special / Statutory Entitlement</option>
                  <option value="Unpaid">Unpaid Leave (Leave Without Pay)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Theme Color Badge
                </label>
                <div className="flex items-center gap-1.5 pt-1">
                  {colorOptions.map(c => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: c.hex })}
                      className={`w-6 h-6 rounded-full transition-all cursor-pointer ${c.bg} ${
                        formData.color === c.hex ? 'ring-2 ring-indigo-600 ring-offset-2 scale-110' : 'opacity-70 hover:opacity-100'
                      }`}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Faculty-Facing Description & Purpose
              </label>
              <textarea
                rows={2}
                placeholder="Briefly describe what this leave is intended for..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Section 2: Accrual Rates & Entitlement */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-black uppercase text-indigo-900 tracking-wider flex items-center gap-1.5 border-b border-indigo-100 pb-1.5">
              <Calendar size={14} className="text-indigo-600" />
              <span>2. Day Quotas, Accrual Rates & Rollover</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Annual Days Quota <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    min={0}
                    max={365}
                    value={formData.annualDays}
                    onChange={(e) => handleAnnualDaysChange(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs font-black border border-slate-300 rounded-xl bg-white text-indigo-950 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Total credit for 1 calendar year</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Accrual Method
                </label>
                <select
                  value={formData.accrualMethod}
                  onChange={(e) => setFormData({ ...formData, accrualMethod: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="Annual Upfront">Annual Upfront (Lump-sum Jan 1)</option>
                  <option value="Monthly Accrual">Monthly Accrual (Prorated per month)</option>
                  <option value="Quarterly Accrual">Quarterly Accrual</option>
                  <option value="Tenure-Based">Tenure-Based (Service Year Increment)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Monthly Rate (Days)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  value={formData.accrualRatePerMonth}
                  onChange={(e) => setFormData({ ...formData, accrualRatePerMonth: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-xl bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Rate earned per active month</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allowCarryForward}
                    onChange={(e) => setFormData({ ...formData, allowCarryForward: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span className="text-xs font-bold text-slate-800">Allow Rollover to Next Year</span>
                </label>
                {formData.allowCarryForward && (
                  <div className="mt-2 pl-6">
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Max Carry-Forward Days:</label>
                    <input
                      type="number"
                      min={1}
                      max={120}
                      value={formData.maxCarryForwardDays}
                      onChange={(e) => setFormData({ ...formData, maxCarryForwardDays: parseInt(e.target.value) || 0 })}
                      className="w-24 px-2 py-1 text-xs border border-slate-300 rounded-lg bg-white font-bold"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.encashable}
                    onChange={(e) => setFormData({ ...formData, encashable: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span className="text-xs font-bold text-slate-800">Encashable upon Resignation/Retirement</span>
                </label>
                <span className="text-[10.5px] text-slate-400 pl-6 block mt-1">
                  Permits financial settlement for unutilized leave balance.
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Eligibility & Constraints */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-black uppercase text-indigo-900 tracking-wider flex items-center gap-1.5 border-b border-indigo-100 pb-1.5">
              <ShieldCheck size={14} className="text-indigo-600" />
              <span>3. Eligibility Rules & Application Constraints</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Min Service Period
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={0}
                    max={60}
                    value={formData.minServiceMonths}
                    onChange={(e) => setFormData({ ...formData, minServiceMonths: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <span className="text-xs text-slate-500 font-bold shrink-0">Months</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">0 = Eligible from Day 1</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Advance Notice Period
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={0}
                    max={90}
                    value={formData.minAdvanceNoticeDays}
                    onChange={(e) => setFormData({ ...formData, minAdvanceNoticeDays: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <span className="text-xs text-slate-500 font-bold shrink-0">Days</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">0 = Same-day/emergency</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Max Consecutive Days
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={formData.maxConsecutiveDays}
                    onChange={(e) => setFormData({ ...formData, maxConsecutiveDays: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <span className="text-xs text-slate-500 font-bold shrink-0">Days</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Limit per single application</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Gender Eligibility
                </label>
                <select
                  value={formData.genderEligibility}
                  onChange={(e) => setFormData({ ...formData, genderEligibility: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="All">All Faculty & Staff</option>
                  <option value="Female Only">Female Educators Only (e.g. Maternity)</option>
                  <option value="Male Only">Male Educators Only (e.g. Paternity)</option>
                </select>
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.requiresSubstituteTeacher}
                    onChange={(e) => setFormData({ ...formData, requiresSubstituteTeacher: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span className="text-xs font-bold text-slate-800">Substitute Teacher Required</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.requiresDocumentProof}
                    onChange={(e) => setFormData({ ...formData, requiresDocumentProof: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span className="text-xs font-bold text-slate-800">Mandatory Verification Document / Slip</span>
                </label>
              </div>
            </div>

            {formData.requiresDocumentProof && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Document Instructions for Teacher
                </label>
                <input
                  type="text"
                  placeholder="e.g., Medical fitness certificate or hospital prescription required within 48h"
                  value={formData.documentProofNotice}
                  onChange={(e) => setFormData({ ...formData, documentProofNotice: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Section 4: Live Status */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <span className="text-xs font-bold text-slate-800">Set this Leave Policy to Active (Visible to Teachers)</span>
            </label>

            <div className="flex items-center gap-2">
              <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {editingPolicy ? 'Update Leave Policy' : 'Create Leave Policy'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* TEACHER PERSPECTIVE PREVIEW MODAL */}
      {/* ========================================================================= */}
      {previewingPolicy && (
        <Modal
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          title={`Teacher Perspective Preview: ${previewingPolicy.name}`}
        >
          <div className="space-y-4">
            <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl text-xs text-indigo-900 flex items-start gap-2">
              <Info size={16} className="text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Live Simulation Preview:</strong>
                This is exactly how teachers view this leave policy in their Faculty Leave Portal, balance cards, and application forms.
              </div>
            </div>

            {/* Simulated Balance Quota Card */}
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                1. Faculty Quota Balance Card
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs max-w-sm">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: previewingPolicy.color }} />
                    <span className="text-slate-800 font-bold">{previewingPolicy.name}</span>
                  </span>
                  <span className="p-1 rounded bg-slate-100 font-mono text-[10px] text-slate-700">
                    {previewingPolicy.code}
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-800 mt-2">
                  {previewingPolicy.annualDays}{' '}
                  <span className="text-xs font-normal text-slate-400">/ {previewingPolicy.annualDays} days</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div
                    className="h-1.5 rounded-full"
                    style={{ backgroundColor: previewingPolicy.color, width: '100%' }}
                  />
                </div>
                <div className="text-[10.5px] text-slate-500 mt-1.5 flex justify-between">
                  <span>0 days used this year</span>
                  <span className="font-bold text-indigo-600">{previewingPolicy.accrualMethod}</span>
                </div>
              </div>
            </div>

            {/* Simulated Guidance Callout during application */}
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                2. Real-time Application Guidance Banner (Seen when teacher selects this category)
              </div>
              <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-black text-indigo-950 flex items-center gap-1.5">
                    <FileCheck size={14} className="text-indigo-600" />
                    <span>{previewingPolicy.name} ({previewingPolicy.category})</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                    Max {previewingPolicy.maxConsecutiveDays} Consecutive Days
                  </span>
                </div>

                <p className="text-slate-600 italic">
                  "{previewingPolicy.description}"
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-indigo-100 text-[11px]">
                  <div>
                    <span className="text-slate-500">Notice Required:</span>{' '}
                    <strong className="text-slate-800">
                      {previewingPolicy.minAdvanceNoticeDays === 0 ? 'Same-day allowed' : `${previewingPolicy.minAdvanceNoticeDays} day(s) prior`}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Substitute Coverage:</span>{' '}
                    <strong className="text-slate-800">
                      {previewingPolicy.requiresSubstituteTeacher ? 'Compulsory' : 'Optional'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Service Eligibility:</span>{' '}
                    <strong className="text-slate-800">
                      {previewingPolicy.minServiceMonths === 0 ? 'Immediate' : `${previewingPolicy.minServiceMonths} mos service`}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Rollover:</span>{' '}
                    <strong className="text-slate-800">
                      {previewingPolicy.allowCarryForward ? `Max ${previewingPolicy.maxCarryForwardDays} days` : 'No'}
                    </strong>
                  </div>
                </div>

                {previewingPolicy.documentProofNotice && (
                  <div className="p-2 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-[11px] flex items-center gap-1.5">
                    <AlertCircle size={13} className="text-amber-600 shrink-0" />
                    <span><strong>Required Document:</strong> {previewingPolicy.documentProofNotice}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setIsPreviewModalOpen(false)}>
                Close Preview
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
