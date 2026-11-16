import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Palette,
  Building2,
  Globe,
  Save,
  Check,
  ShieldCheck,
  School,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  Hash,
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Button, Input, Card, Badge, useToast } from './UIComponents';
import { SchoolThemeCustomizer } from './SchoolThemeCustomizer';
import { useTenant } from '../context/TenantContext';
import { updateTenant, updateTenantTheme } from '../utils/tenantStorage';

interface SchoolSettingsContentProps {
  initialTab?: 'theme' | 'general' | 'domain';
}

export const SchoolSettingsContent: React.FC<SchoolSettingsContentProps> = ({ initialTab }) => {
  const location = useLocation();
  const { tenant, tenantSubdomain } = useTenant();
  const { addToast } = useToast();

  // Determine active tab from URL or prop
  const getInitialTab = (): 'theme' | 'general' | 'domain' => {
    if (initialTab) return initialTab;
    if (location.pathname.includes('/theme')) return 'theme';
    if (location.pathname.includes('/profile') || location.pathname.includes('/general')) return 'general';
    return 'theme';
  };

  const [activeTab, setActiveTab] = useState<'theme' | 'general' | 'domain'>(getInitialTab);

  useEffect(() => {
    if (location.pathname.includes('/theme')) setActiveTab('theme');
    else if (location.pathname.includes('/general') || location.pathname.includes('/profile')) setActiveTab('general');
  }, [location.pathname]);

  // General Institutional form state
  const [formData, setFormData] = useState({
    name: tenant?.name || '',
    type: tenant?.type || 'School',
    eiin: tenant?.eiin || '',
    code: tenant?.code || '',
    principalName: tenant?.principalName || '',
    contactPhone: tenant?.contactPhone || '',
    contactEmail: tenant?.contactEmail || '',
    address: tenant?.address || '',
    establishedYear: tenant?.establishedYear || '',
    customDomain: tenant?.customDomain || ''
  });

  const [isSavingGeneral, setIsSavingGeneral] = useState(false);

  useEffect(() => {
    if (tenant) {
      setFormData({
        name: tenant.name || '',
        type: tenant.type || 'School',
        eiin: tenant.eiin || '',
        code: tenant.code || '',
        principalName: tenant.principalName || '',
        contactPhone: tenant.contactPhone || '',
        contactEmail: tenant.contactEmail || '',
        address: tenant.address || '',
        establishedYear: tenant.establishedYear || '',
        customDomain: tenant.customDomain || ''
      });
    }
  }, [tenant]);

  const handleGeneralSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingGeneral(true);
    try {
      const targetSub = tenantSubdomain || tenant?.id || 'sonar-bangla';
      updateTenant(targetSub, formData);
      setTimeout(() => {
        setIsSavingGeneral(false);
        addToast('প্রতিষ্ঠানের সাধারণ তথ্য সফলভাবে আপডেট করা হয়েছে।', 'success');
      }, 300);
    } catch (err) {
      setIsSavingGeneral(false);
      console.error(err);
      addToast('তথ্য সংরক্ষণে সমস্যা হয়েছে।', 'error');
    }
  };

  const brandColor = tenant?.primaryColor || '#4F46E5';

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Tabs Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: brandColor }}
              />
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                প্রতিষ্ঠান সেটিংস ও কনফিগারেশন (School Admin Settings)
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              লোগো, প্রাইমারি ব্র্যান্ড কালার, প্রাতিষ্ঠানিক পরিচিতি ও পাবলিক ওয়েবসাইটের সেটিংস পরিচালনা করুন।
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-3 py-1 bg-slate-100 text-slate-700 rounded-lg border border-slate-200 font-bold">
              {tenant?.subdomain}.smartamar.school
            </span>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 pt-4 overflow-x-auto custom-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('theme')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'theme'
                ? 'text-white shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            style={activeTab === 'theme' ? { backgroundColor: brandColor } : undefined}
          >
            <Palette className="w-4 h-4" />
            <span>থিম ও ব্র্যান্ডিং (Theme & Logo)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-white/20 text-white uppercase">
              Live
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'general'
                ? 'text-white shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            style={activeTab === 'general' ? { backgroundColor: brandColor } : undefined}
          >
            <Building2 className="w-4 h-4" />
            <span>প্রাতিষ্ঠানিক তথ্য (General Info)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('domain')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'domain'
                ? 'text-white shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            style={activeTab === 'domain' ? { backgroundColor: brandColor } : undefined}
          >
            <Globe className="w-4 h-4" />
            <span>কাস্টম ডোমেন (Domains & CMS)</span>
          </button>
        </div>
      </div>

      {/* TAB 1: THEME & BRAND CUSTOMIZATION */}
      {activeTab === 'theme' && (
        <div className="animate-in fade-in duration-200">
          <SchoolThemeCustomizer />
        </div>
      )}

      {/* TAB 2: GENERAL INSTITUTIONAL INFO */}
      {activeTab === 'general' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs animate-in fade-in duration-200">
          <div className="max-w-4xl">
            <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-slate-700" />
              <span>প্রাতিষ্ঠানিক পরিচিতি ও তথ্যাবলী</span>
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              এখানে পরিবর্তিত নাম ও পরিচিতি প্রত্যয়নপত্র, বেতন রসিদ এবং সরকারি প্রতিবেদনে মুদ্রিত হবে।
            </p>

            <form onSubmit={handleGeneralSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">প্রতিষ্ঠানের পূর্ণ নাম *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-xs font-bold p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">প্রতিষ্ঠানের ধরন</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full text-xs font-bold p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none"
                  >
                    <option value="School">স্কুল / উচ্চ বিদ্যালয় (School)</option>
                    <option value="Madrasa">মাদ্রাসা (হিফজ ও কিতাব বিভাগ)</option>
                    <option value="College">কলেজ (উচ্চ মাধ্যমিক ও স্নাতক)</option>
                    <option value="University">বিশ্ববিদ্যালয় / একাডেমি</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">EIIN নম্বর</label>
                  <input
                    type="text"
                    value={formData.eiin}
                    onChange={(e) => setFormData({ ...formData, eiin: e.target.value })}
                    placeholder="যেমন: ১২৩৪৫৬"
                    className="w-full text-xs font-mono font-bold p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">প্রতিষ্ঠান কোড</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="যেমন: SBIHS-1985"
                    className="w-full text-xs font-mono font-bold p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">প্রতিষ্ঠান প্রধান / অধ্যক্ষের নাম</label>
                  <input
                    type="text"
                    value={formData.principalName}
                    onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
                    placeholder="যেমন: মোঃ রফিকুল ইসলাম"
                    className="w-full text-xs font-bold p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">প্রতিষ্ঠার সাল</label>
                  <input
                    type="text"
                    value={formData.establishedYear}
                    onChange={(e) => setFormData({ ...formData, establishedYear: e.target.value })}
                    placeholder="যেমন: ১৯৮৫"
                    className="w-full text-xs font-mono font-bold p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">অফিসিয়াল মোবাইল / হটলাইন</label>
                  <input
                    type="text"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    placeholder="০১৭XXXXXXXX"
                    className="w-full text-xs font-mono p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">অফিসিয়াল ইমেইল এড্রেস</label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="info@school.edu.bd"
                    className="w-full text-xs font-mono p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">প্রতিষ্ঠানের পূর্ণ ঠিকানা</label>
                  <textarea
                    rows={2}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="যেমন: রোড #০৫, ব্লক-বি, সোনার বাংলা রোড, ঢাকা-১২১৬, বাংলাদেশ"
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  icon={Save}
                  disabled={isSavingGeneral}
                  style={{ backgroundColor: brandColor }}
                  className="font-bold text-xs text-white shadow-xs"
                >
                  {isSavingGeneral ? 'সংরক্ষণ হচ্ছে...' : 'তথ্য সংরক্ষণ করুন'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: CUSTOM DOMAIN & CMS PREVIEW */}
      {activeTab === 'domain' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs animate-in fade-in duration-200 space-y-6">
          <div className="max-w-3xl">
            <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Globe className="w-5 h-5 text-slate-700" />
              <span>কাস্টম ডোমেন ও পাবলিক ওয়েবসাইট কনফিগারেশন</span>
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              আপনার প্রতিষ্ঠানের নিজস্ব ডোমেন (যেমন: <code className="text-indigo-600 font-mono">sonarbangla.edu.bd</code>) সংযুক্ত করুন।
            </p>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">বিনামূল্যে ক্লাউড সাবডোমেন:</div>
                  <div className="text-sm font-mono font-bold text-indigo-600 mt-0.5">
                    {tenant?.subdomain}.smartamar.school
                  </div>
                </div>
                <Badge variant="primary" className="text-xs">
                  Active SSL
                </Badge>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <label className="text-xs font-bold text-slate-700 block">
                প্রতিষ্ঠানের নিজস্ব ডোমেন (Custom Domain):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="যেমন: mycollege.edu.bd"
                  value={formData.customDomain}
                  onChange={(e) => setFormData({ ...formData, customDomain: e.target.value })}
                  className="flex-1 text-xs font-mono p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none"
                />
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    updateTenant(tenantSubdomain || tenant?.id || 'sonar-bangla', { customDomain: formData.customDomain });
                    addToast('কাস্টম ডোমেন কনফিগারেশন সংরক্ষিত হয়েছে।', 'success');
                  }}
                  style={{ backgroundColor: brandColor }}
                  className="text-xs font-bold text-white shrink-0"
                >
                  ডোমেন সেভ করুন
                </Button>
              </div>
              <p className="text-[11px] text-slate-500">
                ডোমেন কানেক্ট করতে আপনার DNS প্রোভাইডারে CNAME রেকর্ড হিসেবে <code className="font-mono text-slate-700">cname.smartamar.school</code> পয়েন্ট করুন।
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-800">পাবলিক ফ্রন্ট ওয়েবসাইট প্রিভিউ</div>
                <div className="text-[11px] text-slate-500">অনলাইন ভর্তি ও নোটিশের জন্য উন্মুক্ত পেজ</div>
              </div>
              <Link
                to={tenantSubdomain ? `#/institution/${tenantSubdomain}` : '/sonar-bangla'}
                target="_blank"
                className="px-4 py-2 rounded-xl text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm"
                style={{ backgroundColor: brandColor }}
              >
                <span>ওয়েবসাইট খুলুন</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
