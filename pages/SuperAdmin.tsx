
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { Building2, DollarSign, Users, Globe, Plus, Trash2, Edit, Check, Copy, Save, Server, Shield, Activity, Package, FileText, Sparkles, CreditCard, Settings, Search, Download, X, LogIn, ExternalLink, Database, Code, Cpu, Wand2, AlertTriangle, CheckCircle, RefreshCw, Lock, ToggleLeft, ToggleRight, MoreHorizontal, Terminal, Eye, AlertCircle as AlertIcon, Power, ArrowRightCircle, Square, CheckSquare, MessageSquare, Headphones, Filter, ChevronRight, Play } from 'lucide-react';
import { DashboardLayout } from '../components/Layout';
import { Card, Button, Input, Badge, Modal, ImageUpload, SmartDataTable, useToast } from '../components/UIComponents';
import { MOCK_TENANTS, BLUEPRINT_API_DOCS, BLUEPRINT_DB_SCHEMA, BLUEPRINT_DEV_GUIDE, MOCK_PLANS, GOOGLE_STUDIO_PROMPT, MOCK_ACTIVITY_LOGS, MOCK_MODULES, MOCK_DOMAINS, MOCK_TICKETS } from '../constants';
import { UserRole, Tenant, SubscriptionPlan, SystemModule, CustomDomain, ActivityLog, SupportTicket } from '../types';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { DataBackupExportModule } from '../components/DataBackupExportModule';
import { ScheduledBackupsModule } from '../components/ScheduledBackupsModule';
import { CloudStorageSyncModule } from '../components/CloudStorageSyncModule';

// --- Super Admin Dashboard ---
export const SuperAdminDashboard = () => { 
  const { t, formatNumber } = useLanguage();
  return (
    <DashboardLayout role={UserRole.SUPER_ADMIN}>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">{t('super_admin_overview', 'Super Admin Overview')}</h2>
        <p className="text-slate-500">{t('global_system_health', 'Global system health and performance monitoring.')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-indigo-500 hover:shadow-md transition-all">
           <div className="flex items-center">
              <div className="p-3 bg-indigo-100 rounded-lg"><Building2 className="w-6 h-6 text-indigo-600"/></div>
              <div className="ml-4">
                 <p className="text-sm font-medium text-slate-500">{t('total_tenants', 'Total Tenants')}</p>
                 <h3 className="text-2xl font-bold text-slate-800">{formatNumber(MOCK_TENANTS.length)}</h3>
              </div>
           </div>
        </Card>
        <Card className="border-l-4 border-green-500 hover:shadow-md transition-all">
           <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg"><DollarSign className="w-6 h-6 text-green-600"/></div>
              <div className="ml-4">
                 <p className="text-sm font-medium text-slate-500">{t('mrr_revenue', 'MRR (Revenue)')}</p>
                 <h3 className="text-2xl font-bold text-slate-800">${formatNumber('75,200')}</h3>
              </div>
           </div>
        </Card>
        <Card className="border-l-4 border-purple-500 hover:shadow-md transition-all">
           <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg"><Users className="w-6 h-6 text-purple-600"/></div>
              <div className="ml-4">
                 <p className="text-sm font-medium text-slate-500">{t('total_students', 'Total Students')}</p>
                 <h3 className="text-2xl font-bold text-slate-800">{formatNumber('2,500')}+</h3>
              </div>
           </div>
        </Card>
        <Card className="border-l-4 border-orange-500 hover:shadow-md transition-all">
           <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg"><Activity className="w-6 h-6 text-orange-600"/></div>
              <div className="ml-4">
                 <p className="text-sm font-medium text-slate-500">{t('system_health', 'System Health')}</p>
                 <h3 className="text-2xl font-bold text-slate-800">{formatNumber('99.9')}%</h3>
              </div>
           </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
              <Card title={t('revenue_growth', 'Revenue Growth (Last 6 Months)')}>
                  <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={[
                              {name: 'Jan', uv: 40000}, {name: 'Feb', uv: 45000}, {name: 'Mar', uv: 55000},
                              {name: 'Apr', uv: 60000}, {name: 'May', uv: 75200}, {name: 'Jun', uv: 82000}
                          ]}>
                              <defs>
                                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <XAxis dataKey="name" />
                              <YAxis />
                              <CartesianGrid strokeDasharray="3 3" vertical={false} />
                              <Tooltip />
                              <Area type="monotone" dataKey="uv" stroke="#6366f1" fillOpacity={1} fill="url(#colorUv)" />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
              </Card>
          </div>
          <div>
              <Card title={t('tenant_distribution', 'Tenant Distribution')}>
                  <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                              <Pie data={[
                                  {name: 'School', value: 60}, {name: 'College', value: 25}, {name: 'Madrasa', value: 15}
                              ]} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                  <Cell fill="#4f46e5" />
                                  <Cell fill="#ec4899" />
                                  <Cell fill="#22c55e" />
                              </Pie>
                              <Tooltip />
                              <Legend verticalAlign="bottom" height={36}/>
                          </PieChart>
                      </ResponsiveContainer>
                  </div>
              </Card>
          </div>
      </div>
    </DashboardLayout>
  );
};

// --- Tenant Management ---
export const TenantManagement = () => {
    const { addToast } = useToast();
    const navigate = useNavigate();
    const { loginAsSchoolAdmin } = useAuth();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

    const handleLoginAs = (tenant: Tenant) => {
        loginAsSchoolAdmin(tenant.subdomain);
        addToast(`Logged in as Admin for ${tenant.name}`, 'success');
        navigate('/school');
    };

    return (
        <DashboardLayout role={UserRole.SUPER_ADMIN}>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Tenant Management</h2>
                    <p className="text-slate-500">Manage all registered institutions.</p>
                </div>
                <Button icon={Plus} onClick={() => setIsAddOpen(true)}>Create Tenant</Button>
            </div>

            <Card className="p-0 border-0 shadow-none bg-transparent">
                <SmartDataTable 
                    columns={[
                        { field: 'name', headerName: 'Institution Name', width: '250px', renderCell: (row: Tenant) => (
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                                    {row.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800">{row.name}</p>
                                    <p className="text-xs text-slate-500">{row.subdomain}.smartamarschool.com</p>
                                </div>
                            </div>
                        )},
                        { field: 'type', headerName: 'Type', width: '120px', renderCell: (row: Tenant) => <Badge color="blue">{row.type}</Badge> },
                        { field: 'plan', headerName: 'Plan', width: '120px', renderCell: (row: Tenant) => <Badge color={row.plan === 'Premium' ? 'purple' : row.plan === 'Standard' ? 'green' : 'gray'}>{row.plan}</Badge> },
                        { field: 'studentsCount', headerName: 'Students', width: '120px' },
                        { field: 'status', headerName: 'Status', width: '120px', renderCell: (row: Tenant) => <Badge color={row.status === 'Active' ? 'green' : 'red'}>{row.status}</Badge> },
                        { field: 'revenue', headerName: 'MRR', width: '120px', renderCell: (row: Tenant) => <span className="font-bold text-slate-700">${row.revenue}</span> },
                    ]} 
                    data={MOCK_TENANTS} 
                    actions={(row) => (
                        <div className="flex items-center gap-2 justify-end">
                            <a 
                                href={`#/institution/${row.subdomain}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-300 text-xs font-bold text-slate-700 hover:text-indigo-600 flex items-center gap-1 bg-white hover:bg-slate-50"
                                title="পাবলিক ওয়েবসাইট দেখুন"
                            >
                                <Globe size={13} />
                                <span>Website</span>
                            </a>
                            <Button size="sm" variant="secondary" icon={LogIn} onClick={() => handleLoginAs(row)}>Access ERP</Button>
                            <Button size="sm" variant="ghost" icon={Edit} onClick={() => setSelectedTenant(row)}/>
                        </div>
                    )}
                />
            </Card>

            <Modal isOpen={isAddOpen || !!selectedTenant} onClose={() => { setIsAddOpen(false); setSelectedTenant(null); }} title={selectedTenant ? "Edit Tenant" : "Create New Tenant"}>
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); addToast(selectedTenant ? 'Tenant Updated' : 'Tenant Created', 'success'); setIsAddOpen(false); setSelectedTenant(null); }}>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Institution Name" defaultValue={selectedTenant?.name} required />
                        <Input label="Subdomain" prefix="https://" suffix=".smartamarschool.com" defaultValue={selectedTenant?.subdomain} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Institution Type</label>
                            <select className="w-full px-3 py-2 border rounded-lg" defaultValue={selectedTenant?.type}>
                                <option>School</option>
                                <option>College</option>
                                <option>Madrasa</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Subscription Plan</label>
                            <select className="w-full px-3 py-2 border rounded-lg" defaultValue={selectedTenant?.plan}>
                                <option>Basic</option>
                                <option>Standard</option>
                                <option>Premium</option>
                            </select>
                        </div>
                    </div>
                    <Input label="Admin Email" type="email" placeholder="admin@school.edu" />
                    <div className="flex justify-end pt-4 gap-2">
                        <Button type="button" variant="secondary" onClick={() => { setIsAddOpen(false); setSelectedTenant(null); }}>Cancel</Button>
                        <Button type="submit">Save Changes</Button>
                    </div>
                </form>
            </Modal>
        </DashboardLayout>
    );
};

// --- Domain Manager ---
export const DomainManager = () => {
    const { addToast } = useToast();
    const [domains, setDomains] = useState<CustomDomain[]>(MOCK_DOMAINS);

    const verifyDomain = (id: string) => {
        addToast('Verifying DNS records...', 'info');
        setTimeout(() => {
            setDomains(prev => prev.map(d => d.id === id ? { ...d, status: 'Verified' } : d));
            addToast('Domain Verified Successfully', 'success');
        }, 2000);
    };

    return (
        <DashboardLayout role={UserRole.SUPER_ADMIN}>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Domain Manager</h2>
                    <p className="text-slate-500">Custom domain mapping and SSL provisioning.</p>
                </div>
                <Button icon={RefreshCw}>Refresh Status</Button>
            </div>

            <Card className="p-0 border-0 shadow-none bg-transparent">
                <SmartDataTable 
                    columns={[
                        { field: 'domain', headerName: 'Domain Name', width: '250px', renderCell: (row: CustomDomain) => <a href={`https://${row.domain}`} target="_blank" className="text-indigo-600 hover:underline flex items-center gap-1">{row.domain} <ExternalLink size={12}/></a> },
                        { field: 'tenantName', headerName: 'Tenant', width: '200px' },
                        { field: 'dnsRecordType', headerName: 'Record Type', width: '100px' },
                        { field: 'dnsTarget', headerName: 'Target Value', width: '250px', renderCell: (row: CustomDomain) => <code className="bg-slate-100 px-2 py-1 rounded text-xs">{row.dnsTarget}</code> },
                        { field: 'status', headerName: 'Status', width: '120px', renderCell: (row: CustomDomain) => <Badge color={row.status === 'Verified' ? 'green' : row.status === 'Pending' ? 'yellow' : 'red'}>{row.status}</Badge> },
                    ]} 
                    data={domains} 
                    actions={(row) => (
                        row.status !== 'Verified' && <Button size="sm" variant="secondary" onClick={() => verifyDomain(row.id)}>Verify</Button>
                    )}
                />
            </Card>
        </DashboardLayout>
    );
};

// --- Module Management ---
export const ModuleManagement = () => {
    const { addToast } = useToast();
    const [modules, setModules] = useState<SystemModule[]>(MOCK_MODULES);

    const toggleModule = (id: string) => {
        setModules(prev => prev.map(m => m.id === id ? { ...m, status: m.status === 'Active' ? 'Disabled' : 'Active' } : m));
        addToast('Module status updated', 'success');
    };

    return (
        <DashboardLayout role={UserRole.SUPER_ADMIN}>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Core Modules</h2>
                    <p className="text-slate-500">Enable or disable system-wide features.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map(mod => (
                    <Card key={mod.id} className="relative overflow-hidden">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                                <Package size={24}/>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold ${mod.status === 'Active' ? 'text-green-600' : 'text-slate-400'}`}>{mod.status}</span>
                                <button 
                                    onClick={() => toggleModule(mod.id)}
                                    className={`w-10 h-5 rounded-full p-1 transition-colors ${mod.status === 'Active' ? 'bg-green-500' : 'bg-slate-300'}`}
                                >
                                    <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${mod.status === 'Active' ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                </button>
                            </div>
                        </div>
                        <h3 className="font-bold text-lg text-slate-800 mb-1">{mod.name}</h3>
                        <p className="text-sm text-slate-500 mb-4 h-10">{mod.description}</p>
                        <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                            <Badge color="blue">{mod.requiredPlan}+</Badge>
                            <Button size="sm" variant="ghost" icon={Settings}/>
                        </div>
                    </Card>
                ))}
            </div>
        </DashboardLayout>
    );
};

// --- Subscription Management ---
export const SubscriptionManagement = () => {
    const { addToast } = useToast();

    return (
        <DashboardLayout role={UserRole.SUPER_ADMIN}>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Subscription Plans</h2>
                    <p className="text-slate-500">Manage pricing and limits.</p>
                </div>
                <Button icon={Plus}>Add Plan</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {MOCK_PLANS.map(plan => (
                    <Card key={plan.id} className={`relative ${plan.id === 'PLAN-S' ? 'border-indigo-500 ring-1 ring-indigo-500' : ''}`}>
                        {plan.id === 'PLAN-S' && <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs px-2 py-1 rounded-bl-lg font-bold">Popular</div>}
                        <h3 className="font-bold text-xl text-slate-800 mb-1">{plan.name}</h3>
                        <div className="flex items-baseline gap-1 mb-4">
                            <span className="text-3xl font-bold text-slate-900">${plan.price}</span>
                            <span className="text-sm text-slate-500">/mo</span>
                        </div>
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Active Tenants</span>
                                <span className="font-bold">{plan.activeTenants}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Student Limit</span>
                                <span className="font-bold">{plan.maxStudentsLimit}</span>
                            </div>
                        </div>
                        <ul className="space-y-2 mb-6">
                            {plan.features.slice(0, 3).map((feat, i) => (
                                <li key={i} className="flex items-center gap-2 text-xs text-slate-600">
                                    <CheckCircle size={14} className="text-green-500"/> {feat}
                                </li>
                            ))}
                        </ul>
                        <Button className="w-full" variant="outline" icon={Edit}>Edit Plan</Button>
                    </Card>
                ))}
            </div>
        </DashboardLayout>
    );
};

// --- Global Reports ---
export const GlobalReports = () => {
    return (
        <DashboardLayout role={UserRole.SUPER_ADMIN}>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Global Analytics</h2>
                    <p className="text-slate-500">System-wide performance metrics.</p>
                </div>
                <Button icon={Download}>Export Report</Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card title="Tenant Growth">
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={[
                                { month: 'Jan', schools: 10, revenue: 5000 },
                                { month: 'Feb', schools: 15, revenue: 8000 },
                                { month: 'Mar', schools: 22, revenue: 15000 },
                                { month: 'Apr', schools: 30, revenue: 22000 },
                                { month: 'May', schools: 45, revenue: 35000 },
                                { month: 'Jun', schools: 60, revenue: 50000 },
                            ]}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" />
                                <YAxis yAxisId="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip />
                                <Legend />
                                <Line yAxisId="left" type="monotone" dataKey="schools" stroke="#4f46e5" strokeWidth={2} />
                                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
                <Card title="Server Load (CPU/Memory)">
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={[
                                { time: '00:00', cpu: 20, ram: 40 },
                                { time: '04:00', cpu: 15, ram: 35 },
                                { time: '08:00', cpu: 45, ram: 60 },
                                { time: '12:00', cpu: 70, ram: 75 },
                                { time: '16:00', cpu: 60, ram: 65 },
                                { time: '20:00', cpu: 30, ram: 50 },
                            ]}>
                                <defs>
                                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="time" />
                                <YAxis />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <Tooltip />
                                <Area type="monotone" dataKey="cpu" stroke="#ef4444" fillOpacity={1} fill="url(#colorCpu)" />
                                <Area type="monotone" dataKey="ram" stroke="#3b82f6" fillOpacity={0.3} fill="#3b82f6" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
};

// --- Activity Logs ---
export const ActivityLogs = () => {
    return (
        <DashboardLayout role={UserRole.SUPER_ADMIN}>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Audit Logs</h2>
                    <p className="text-slate-500">Track system-wide activities and security events.</p>
                </div>
                <Button variant="secondary" icon={Filter}>Filter Logs</Button>
            </div>

            <Card className="p-0 border-0 shadow-none bg-transparent">
                <SmartDataTable 
                    columns={[
                        { field: 'timestamp', headerName: 'Timestamp', width: '180px' },
                        { field: 'actor', headerName: 'Actor', width: '150px' },
                        { field: 'action', headerName: 'Action', width: '250px' },
                        { field: 'target', headerName: 'Target', width: '150px' },
                        { field: 'ipAddress', headerName: 'IP Address', width: '150px', renderCell: (row: ActivityLog) => <code className="text-xs bg-slate-100 px-2 py-1 rounded">{row.ipAddress}</code> },
                        { field: 'severity', headerName: 'Severity', width: '100px', renderCell: (row: ActivityLog) => <Badge color={row.severity === 'Critical' ? 'red' : row.severity === 'Warning' ? 'yellow' : 'blue'}>{row.severity}</Badge> },
                    ]} 
                    data={MOCK_ACTIVITY_LOGS} 
                />
            </Card>
        </DashboardLayout>
    );
};

// --- Blueprint Documentation ---
export const BlueprintDocs = () => {
    const [activeDoc, setActiveDoc] = useState<'api' | 'db' | 'guide'>('api');

    return (
        <DashboardLayout role={UserRole.SUPER_ADMIN}>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">System Blueprint</h2>
                    <p className="text-slate-500">Technical documentation for developers.</p>
                </div>
            </div>

            <div className="flex gap-6 h-[calc(100vh-180px)]">
                <Card className="w-64 flex-shrink-0 p-2 h-full">
                    <nav className="space-y-1">
                        <button onClick={() => setActiveDoc('api')} className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 ${activeDoc === 'api' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                            <Server size={16}/> API Reference
                        </button>
                        <button onClick={() => setActiveDoc('db')} className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 ${activeDoc === 'db' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                            <Database size={16}/> DB Schema
                        </button>
                        <button onClick={() => setActiveDoc('guide')} className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 ${activeDoc === 'guide' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                            <Code size={16}/> Dev Guide
                        </button>
                    </nav>
                </Card>
                <Card className="flex-1 h-full overflow-hidden flex flex-col">
                    <div className="flex-1 overflow-y-auto p-6 bg-slate-900 text-slate-300 font-mono text-sm rounded-lg">
                        <pre className="whitespace-pre-wrap">
                            {activeDoc === 'api' && BLUEPRINT_API_DOCS}
                            {activeDoc === 'db' && BLUEPRINT_DB_SCHEMA}
                            {activeDoc === 'guide' && BLUEPRINT_DEV_GUIDE}
                        </pre>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
};

// --- Google Studio Prompt Generator ---
export const GoogleStudioPrompt = () => {
    const { addToast } = useToast();
    const handleCopy = () => {
        navigator.clipboard.writeText(GOOGLE_STUDIO_PROMPT);
        addToast('Prompt copied to clipboard!', 'success');
    };

    return (
        <DashboardLayout role={UserRole.SUPER_ADMIN}>
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white">
                        <Sparkles size={32} />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900">AI Prompt Generator</h2>
                    <p className="text-slate-500 mt-2">Generate the master prompt to replicate this SaaS in Google AI Studio.</p>
                </div>

                <Card className="relative">
                    <div className="absolute top-4 right-4">
                        <Button size="sm" icon={Copy} onClick={handleCopy}>Copy Prompt</Button>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 max-h-[500px] overflow-y-auto font-mono text-xs text-slate-700 leading-relaxed">
                        {GOOGLE_STUDIO_PROMPT}
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
};

// --- Super Admin Settings ---
export const SuperAdminSettings = () => {
    const { addToast } = useToast();
    return (
        <DashboardLayout role={UserRole.SUPER_ADMIN}>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Global Settings</h2>
                <p className="text-slate-500">Configure system-wide parameters.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="General Configuration">
                    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); addToast('Settings Saved', 'success'); }}>
                        <Input label="Application Name" defaultValue="Smart Amar School" />
                        <Input label="Support Email" defaultValue="support@smartamarschool.com" />
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Maintenance Mode</label>
                            <div className="flex items-center gap-3">
                                <button type="button" className="w-12 h-6 bg-slate-300 rounded-full p-1 transition-colors"><div className="w-4 h-4 bg-white rounded-full shadow-sm"></div></button>
                                <span className="text-sm text-slate-600">Disabled</span>
                            </div>
                        </div>
                        <Button className="mt-4">Save Changes</Button>
                    </form>
                </Card>
                <Card title="Payment Gateways">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                            <span className="font-bold text-slate-700">Stripe</span>
                            <Badge color="green">Connected</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                            <span className="font-bold text-slate-700">bKash API</span>
                            <Badge color="green">Connected</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                            <span className="font-bold text-slate-700">Nagad API</span>
                            <Badge color="yellow">Pending</Badge>
                        </div>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
};

// --- Support Helpdesk ---
export const SupportHelpdesk = () => {
    const [tickets, setTickets] = useState<SupportTicket[]>(MOCK_TICKETS);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const { addToast } = useToast();

    const handleStatusUpdate = (ticket: SupportTicket, newStatus: 'Open' | 'In Progress' | 'Resolved') => {
        setTickets(tickets.map(t => t.id === ticket.id ? { ...t, status: newStatus } : t));
        setSelectedTicket({ ...ticket, status: newStatus });
        addToast(`Ticket marked as ${newStatus}`, 'success');
    };

    return (
        <DashboardLayout role={UserRole.SUPER_ADMIN}>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Helpdesk & Support</h2>
                    <p className="text-slate-500">Manage support requests from tenants.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" icon={Filter}>Filter</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card className="p-0 border-0 shadow-none bg-transparent">
                        <SmartDataTable 
                            columns={[
                                { field: 'subject', headerName: 'Subject', width: '200px', renderCell: (row: SupportTicket) => <span className="font-medium text-slate-800">{row.subject}</span> },
                                { field: 'tenantName', headerName: 'Tenant', width: '150px' },
                                { field: 'priority', headerName: 'Priority', width: '100px', renderCell: (row: SupportTicket) => <Badge color={row.priority === 'High' ? 'red' : row.priority === 'Medium' ? 'yellow' : 'blue'}>{row.priority}</Badge> },
                                { field: 'status', headerName: 'Status', width: '100px', renderCell: (row: SupportTicket) => <Badge color={row.status === 'Resolved' ? 'green' : row.status === 'Open' ? 'red' : 'yellow'}>{row.status}</Badge> },
                                { field: 'createdAt', headerName: 'Date', width: '120px' },
                            ]} 
                            data={tickets} 
                            actions={(row) => (
                                <Button size="sm" variant="secondary" onClick={() => setSelectedTicket(row)}>View</Button>
                            )}
                        />
                    </Card>
                </div>

                <div>
                    {selectedTicket ? (
                        <Card title="Ticket Details" className="h-full sticky top-4">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">{selectedTicket.subject}</h3>
                                    <p className="text-xs text-slate-500">ID: {selectedTicket.id} • {selectedTicket.createdAt}</p>
                                </div>
                                
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                    <p className="text-sm text-slate-600">{selectedTicket.message}</p>
                                </div>

                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">Tenant Info</p>
                                    <div className="flex items-center gap-2">
                                        <Building2 size={16} className="text-indigo-600"/>
                                        <span className="text-sm font-medium">{selectedTicket.tenantName}</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100">
                                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">Update Status</p>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleStatusUpdate(selectedTicket, 'In Progress')}
                                            className={`px-3 py-1 rounded-full text-xs font-medium border ${selectedTicket.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                                        >
                                            In Progress
                                        </button>
                                        <button 
                                            onClick={() => handleStatusUpdate(selectedTicket, 'Resolved')}
                                            className={`px-3 py-1 rounded-full text-xs font-medium border ${selectedTicket.status === 'Resolved' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                                        >
                                            Resolve
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Reply</label>
                                    <textarea className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm h-24 resize-none" placeholder="Type your response..."></textarea>
                                    <Button className="w-full mt-2" size="sm">Send Reply</Button>
                                </div>
                            </div>
                        </Card>
                    ) : (
                        <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-center p-6">
                            <div>
                                <MessageSquare size={32} className="mx-auto mb-2"/>
                                <p className="text-sm">Select a ticket to view details</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

// --- Data Backup & Export ---
export const DataBackupExport = () => (
    <DashboardLayout role={UserRole.SUPER_ADMIN}>
        <DataBackupExportModule mode="super-admin" />
    </DashboardLayout>
);

// --- Scheduled Backups ---
export const ScheduledBackups = () => (
    <DashboardLayout role={UserRole.SUPER_ADMIN}>
        <ScheduledBackupsModule />
    </DashboardLayout>
);

// --- External Cloud Storage & Auto-Sync ---
export const ExternalStorageSync = () => (
    <DashboardLayout role={UserRole.SUPER_ADMIN}>
        <CloudStorageSyncModule />
    </DashboardLayout>
);