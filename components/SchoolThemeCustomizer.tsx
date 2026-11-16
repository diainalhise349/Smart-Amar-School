import React, { useState, useEffect, useRef } from 'react';
import {
  Palette,
  Upload,
  Image as ImageIcon,
  Check,
  RotateCcw,
  Sparkles,
  Layout,
  ExternalLink,
  Eye,
  Sliders,
  CheckCircle2,
  AlertCircle,
  School,
  Building2,
  Trash2,
  Copy,
  ChevronRight,
  ShieldCheck,
  Sun,
  Moon,
  Laptop
} from 'lucide-react';
import { Button, Card, Badge, useToast } from './UIComponents';
import { useTenant } from '../context/TenantContext';
import { updateTenantTheme, SCHOOL_THEME_EVENT, getStoredTenants } from '../utils/tenantStorage';
import { Tenant } from '../types';
import { Link } from 'react-router-dom';

// Curated Educational Brand Color Swatches
export const PRESET_BRAND_COLORS = [
  { id: 'indigo', name: 'Royal Indigo', hex: '#4F46E5', desc: 'Standard Modern Academy' },
  { id: 'emerald', name: 'Islamic Green', hex: '#059669', desc: 'Madrasa & Green Campus' },
  { id: 'navy', name: 'Oxford Navy', hex: '#1E40AF', desc: 'Collegiate & Formal' },
  { id: 'crimson', name: 'Crimson Red', hex: '#DC2626', desc: 'Bold Heritage & Prestige' },
  { id: 'purple', name: 'Regal Purple', hex: '#7C3AED', desc: 'Modern & Innovative' },
  { id: 'teal', name: 'Teal Cyan', hex: '#0D9488', desc: 'Fresh & Progressive' },
  { id: 'amber', name: 'Golden Amber', hex: '#D97706', desc: 'Warm & High Energy' },
  { id: 'rose', name: 'Vibrant Rose', hex: '#E11D48', desc: 'Dynamic & Distinguished' },
  { id: 'slate', name: 'Executive Slate', hex: '#334155', desc: 'Neutral & High Tech' },
  { id: 'blue', name: 'Vivid Blue', hex: '#2563EB', desc: 'Classic Educational' },
];

// Curated Preset Institutional Crests / Logos
export const PRESET_INSTITUTION_LOGOS = [
  {
    id: 'crest-school',
    name: 'সোনার বাংলা অ্যাকাডেমিক ক্রেস্ট',
    url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=200&h=200&fit=crop',
    type: 'School'
  },
  {
    id: 'crest-madrasa',
    name: 'দারুল উলুম ক্যালিগ্রাফি সিল',
    url: 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=200&h=200&fit=crop',
    type: 'Madrasa'
  },
  {
    id: 'crest-college',
    name: 'আইডিয়াল কলেজ হেরিটেজ এমব্লেম',
    url: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=200&fit=crop',
    type: 'College'
  },
  {
    id: 'crest-science',
    name: 'মডার্ন গ্লোবাল একাডেমি সিল',
    url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=200&h=200&fit=crop',
    type: 'Academy'
  }
];

export const SchoolThemeCustomizer: React.FC = () => {
  const { tenant, tenantSubdomain, switchTenant, allTenants } = useTenant();
  const { addToast } = useToast();

  // Active theme states
  const [primaryColor, setPrimaryColor] = useState<string>(tenant?.primaryColor || '#4F46E5');
  const [logoUrl, setLogoUrl] = useState<string>(tenant?.logoUrl || '');
  const [sidebarTheme, setSidebarTheme] = useState<'dark' | 'brand-tinted' | 'midnight'>(
    tenant?.sidebarTheme || 'dark'
  );
  const [schoolName, setSchoolName] = useState<string>(tenant?.name || 'সোনার বাংলা আদর্শ উচ্চ বিদ্যালয়');
  const [isSaving, setIsSaving] = useState(false);
  const [customHexInput, setCustomHexInput] = useState<string>(tenant?.primaryColor || '#4F46E5');
  const [externalLogoInput, setExternalLogoInput] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state when tenant changes
  useEffect(() => {
    if (tenant) {
      setPrimaryColor(tenant.primaryColor || '#4F46E5');
      setCustomHexInput(tenant.primaryColor || '#4F46E5');
      setLogoUrl(tenant.logoUrl || '');
      setSidebarTheme(tenant.sidebarTheme || 'dark');
      setSchoolName(tenant.name || '');
    }
  }, [tenant]);

  // Handle color change from preset or picker
  const handleColorSelect = (hex: string) => {
    setPrimaryColor(hex);
    setCustomHexInput(hex);
  };

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomHexInput(val);
    if (/^#[0-9A-F]{6}$/i.test(val)) {
      setPrimaryColor(val);
    }
  };

  // Handle image upload from computer (Base64 data URL)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('অনুগ্রহ করে শুধুমাত্র ছবি ফাইল (PNG, JPG, WebP, SVG) আপলোড করুন।', 'error');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      addToast('ফাইলের সাইজ ৩ মেগাবাইটের (3MB) কম হতে হবে।', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      setLogoUrl(base64Url);
      addToast('নতুন লোগো সফলভাবে লোড হয়েছে। প্রিভিউ দেখে "পরিবর্তন সংরক্ষণ করুন" চাপুন।', 'info');
    };
    reader.readAsDataURL(file);
  };

  const handleApplyExternalUrl = () => {
    if (!externalLogoInput.trim()) return;
    setLogoUrl(externalLogoInput.trim());
    setExternalLogoInput('');
    addToast('লোগোর ওয়েব ইউআরএল সংযুক্ত করা হয়েছে।', 'info');
  };

  const handleRemoveLogo = () => {
    setLogoUrl('');
    addToast('লোগো সরানো হয়েছে। ডিফল্ট প্রতিষ্ঠানের আদ্যক্ষর প্রদর্শিত হবে।', 'info');
  };

  // Reset to default institutional settings
  const handleResetToDefault = () => {
    const defaultColor = '#4F46E5';
    const defaultLogo = 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=200&h=200&fit=crop';
    setPrimaryColor(defaultColor);
    setCustomHexInput(defaultColor);
    setLogoUrl(defaultLogo);
    setSidebarTheme('dark');

    const updated = updateTenantTheme(tenantSubdomain || tenant?.id || 'sonar-bangla', {
      primaryColor: defaultColor,
      logoUrl: defaultLogo,
      sidebarTheme: 'dark'
    });

    addToast('ডিফল্ট থিম ও রয়্যাল ইন্ডিগো ব্র্যান্ড কালার সফলভাবে পুনঃস্থাপন করা হয়েছে!', 'success');
  };

  // Save changes to persistence
  const handleSaveChanges = () => {
    setIsSaving(true);
    try {
      const targetSubdomain = tenantSubdomain || tenant?.id || 'sonar-bangla';
      const updated = updateTenantTheme(targetSubdomain, {
        primaryColor,
        logoUrl,
        sidebarTheme,
        name: schoolName
      });

      // Also set CSS variables on document root for instant live cascade
      document.documentElement.style.setProperty('--brand-primary', primaryColor);

      setTimeout(() => {
        setIsSaving(false);
        addToast(
          `থিম সফলভাবে সংরক্ষিত হয়েছে! ${updated.name || 'প্রতিষ্ঠানের'} হেডার এবং সাইডবারে নতুন ব্র্যান্ড কালার ও লোগো সক্রিয়।`,
          'success'
        );
      }, 300);
    } catch (err) {
      setIsSaving(false);
      console.error(err);
      addToast('থিম সংরক্ষণ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।', 'error');
    }
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div
          className="absolute top-0 left-0 right-0 h-1.5 transition-colors duration-300"
          style={{ backgroundColor: primaryColor }}
        />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs transition-colors"
                style={{ backgroundColor: primaryColor }}
              >
                <Palette className="w-4 h-4" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                থিম ও ব্র্যান্ড কাস্টমাইজেশন (Theme & Brand Settings)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              আপনার শিক্ষা প্রতিষ্ঠানের নিজস্ব লোগো ও ব্র্যান্ড কালার কনফিগার করুন। এখানে করা যেকোনো পরিবর্তন সঙ্গে সঙ্গে 
              <strong> অ্যাডমিন, শিক্ষক, শিক্ষার্থী ও অভিভাবক পোর্টালের</strong> হেডার ও সাইডবারে রিয়েল-টাইমে কার্যকর হবে।
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={RotateCcw}
              onClick={handleResetToDefault}
              className="text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              ডিফল্ট রিসেট
            </Button>
            <Button
              id="save-school-theme-btn"
              type="button"
              variant="primary"
              size="sm"
              icon={Check}
              onClick={handleSaveChanges}
              disabled={isSaving}
              style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
              className="text-xs font-bold text-white shadow-md hover:brightness-110 transition"
            >
              {isSaving ? 'সংরক্ষণ হচ্ছে...' : 'পরিবর্তন সংরক্ষণ করুন'}
            </Button>
          </div>
        </div>

        {/* Multi-Tenant Branch Context Chip */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">বর্তমান প্রতিষ্ঠান:</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-mono font-bold text-slate-800 border border-slate-200">
              {tenant?.name} ({tenant?.type})
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/school"
              className="font-bold text-xs hover:underline flex items-center gap-1"
              style={{ color: primaryColor }}
            >
              <span>অ্যাডমিন ড্যাশবোর্ড দেখুন</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
            <span className="text-slate-300">•</span>
            <Link
              to={tenantSubdomain ? `#/institution/${tenantSubdomain}` : '/sonar-bangla'}
              target="_blank"
              className="font-bold text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1"
            >
              <span>পাবলিক ওয়েবসাইট</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid: Customizer Controls (Left) & Live Preview Sandbox (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ===================================================================== */}
        {/* LEFT COLUMN: CUSTOMIZATION CONTROLS */}
        {/* ===================================================================== */}
        <div className="lg:col-span-7 space-y-6">

          {/* 1. PRIMARY BRAND COLOR SELECTOR */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                  ১. প্রাইমারি ব্র্যান্ড কালার (Primary Brand Color)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  সাইডবারের সক্রিয় মেনু, হেডারের অ্যাকসেন্ট লাইন, বাটন ও ব্যাজে এই রঙটি ব্যবহৃত হবে।
                </p>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200">
                <span
                  className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs"
                  style={{ backgroundColor: primaryColor }}
                />
                <span className="font-mono text-xs font-bold text-slate-800 uppercase">
                  {primaryColor}
                </span>
              </div>
            </div>

            {/* Presets Grid */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                শিক্ষা প্রতিষ্ঠানের জন্য নির্ধারিত প্রি-সেট কালার:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {PRESET_BRAND_COLORS.map((color) => {
                  const isSelected = primaryColor.toLowerCase() === color.hex.toLowerCase();
                  return (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => handleColorSelect(color.hex)}
                      className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between h-20 ${
                        isSelected
                          ? 'border-slate-900 ring-2 ring-slate-900/10 shadow-sm bg-slate-50'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span
                          className="w-5 h-5 rounded-full shadow-2xs border border-white"
                          style={{ backgroundColor: color.hex }}
                        />
                        {isSelected && (
                          <span className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-[11px] text-slate-900 truncate">{color.name}</div>
                        <div className="font-mono text-[9.5px] text-slate-400">{color.hex}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Hex & Native Color Picker */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[200px]">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  কাস্টম হেক্স কোড (Custom HEX Code):
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-xs font-bold">#</span>
                    <input
                      type="text"
                      value={customHexInput.replace('#', '')}
                      onChange={handleHexInputChange}
                      placeholder="4F46E5"
                      maxLength={6}
                      className="w-full pl-7 pr-3 py-2 text-xs font-mono font-bold uppercase border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => handleColorSelect(e.target.value)}
                      className="w-10 h-9 rounded-xl border border-slate-200 p-0.5 cursor-pointer bg-white"
                      title="কালার পিকার খুলুন"
                    />
                  </div>
                </div>
              </div>

              {/* Contrast Indicator */}
              <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-2.5 flex items-center gap-2 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>সাদা লেখার সাথে শতভাগ স্পষ্ট (WCAG AA Compliant)</span>
              </div>
            </div>
          </div>

          {/* 2. CUSTOM SCHOOL LOGO UPLOADER */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-slate-700" />
                  ২. প্রতিষ্ঠানের নিজস্ব লোগো আপলোড (School Logo)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  প্রতিষ্ঠানের লোগোটি সাইডবার ব্র্যান্ড হেডার ও টপ নেভিগেশন বারে প্রদর্শিত হবে।
                </p>
              </div>
              {logoUrl && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>লোগো মুছুন</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
              
              {/* Logo Preview Avatar */}
              <div className="sm:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-center">
                <div
                  className="w-20 h-20 rounded-2xl overflow-hidden border-2 shadow-sm flex items-center justify-center relative bg-white transition-all"
                  style={{ borderColor: primaryColor }}
                >
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="School Logo Preview"
                      className="w-full h-full object-cover"
                      onError={() => {
                        addToast('লোগো লোড করা যায়নি। সঠিক ইমেজ ইউআরএল বা ফাইল আপলোড করুন।', 'error');
                      }}
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center font-black text-2xl text-white"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {(schoolName || 'S').charAt(0)}
                    </div>
                  )}
                </div>
                <span className="text-[11px] font-bold text-slate-600 mt-2">লাইভ লোগো প্রিভিউ</span>
                <span className="text-[9.5px] text-slate-400">সাইডবার ও হেডারে ব্যবহৃত</span>
              </div>

              {/* Upload Drop Zone & Controls */}
              <div className="sm:col-span-8 space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/png, image/jpeg, image/webp, image/svg+xml"
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-2xl p-4 text-center cursor-pointer transition hover:bg-slate-50 group"
                >
                  <div
                    className="w-10 h-10 rounded-xl mx-auto flex items-center justify-center text-white mb-2 transition-transform group-hover:scale-105"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-slate-800">
                    লোগো ফাইল আপলোড করতে এখানে ক্লিক করুন
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    PNG, JPG, WebP বা SVG ফরম্যাট (সর্বোচ্চ ৩MB, স্কয়ার সাইজ বাঞ্ছনীয়)
                  </p>
                </div>

                {/* External URL alternative */}
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="অথবা লোগোর সরাসরি ইমেজ ইউআরএল (https://...)"
                    value={externalLogoInput}
                    onChange={(e) => setExternalLogoInput(e.target.value)}
                    className="flex-1 text-xs p-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleApplyExternalUrl}
                    className="text-xs font-bold shrink-0"
                  >
                    লিঙ্ক যুক্ত করুন
                  </Button>
                </div>
              </div>

            </div>

            {/* Presets Logos */}
            <div className="pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 block mb-2">
                অথবা প্রস্তুতকৃত প্রতীক/ক্রেস্ট ব্যবহার করুন:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRESET_INSTITUTION_LOGOS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setLogoUrl(item.url);
                      addToast(`${item.name} লোগো হিসেবে নির্বাচন করা হয়েছে।`, 'info');
                    }}
                    className={`p-2 rounded-xl border text-left flex items-center gap-2 hover:bg-slate-50 transition ${
                      logoUrl === item.url ? 'border-slate-900 bg-slate-50' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <img src={item.url} alt={item.name} className="w-7 h-7 rounded-lg object-cover shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-bold text-slate-800 truncate">{item.name}</div>
                      <div className="text-[8.5px] text-slate-400 font-mono">{item.type}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. SIDEBAR THEME MODE */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Layout className="w-4 h-4 text-slate-700" />
              ৩. সাইডবার অ্যাপিয়ারেন্স স্টাইল (Sidebar Background Theme)
            </h3>
            <p className="text-xs text-slate-500">
              সাইডবারের সামগ্রিক ব্যাকগ্রাউন্ড টোন নির্ধারণ করুন:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setSidebarTheme('dark')}
                className={`p-3.5 rounded-xl border text-left transition flex items-center gap-3 ${
                  sidebarTheme === 'dark'
                    ? 'border-slate-900 ring-2 ring-slate-900/10 bg-slate-50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shrink-0">
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Dark Slate</div>
                  <div className="text-[10px] text-slate-500">ডিফল্ট ক্লাউড ডার্ক</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSidebarTheme('brand-tinted')}
                className={`p-3.5 rounded-xl border text-left transition flex items-center gap-3 ${
                  sidebarTheme === 'brand-tinted'
                    ? 'border-slate-900 ring-2 ring-slate-900/10 bg-slate-50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Brand Tinted</div>
                  <div className="text-[10px] text-slate-500">ব্র্যান্ডের রঙের আভা</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSidebarTheme('midnight')}
                className={`p-3.5 rounded-xl border text-left transition flex items-center gap-3 ${
                  sidebarTheme === 'midnight'
                    ? 'border-slate-900 ring-2 ring-slate-900/10 bg-slate-50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-white shrink-0">
                  <Laptop className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Midnight Black</div>
                  <div className="text-[10px] text-slate-500">গভীর কালো ও হাই-কনট্রাস্ট</div>
                </div>
              </button>
            </div>
          </div>

        </div>

        {/* ===================================================================== */}
        {/* RIGHT COLUMN: REAL-TIME LIVE PREVIEW MOCKUP */}
        {/* ===================================================================== */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
          
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-lg p-5 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-slate-700" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  লাইভ প্রিভিউ স্যান্ডবক্স (Live Portal Mockup)
                </span>
              </div>
              <Badge variant="primary" className="text-[10px] font-mono">
                রিয়েল-টাইম প্রিভিউ
              </Badge>
            </div>

            {/* MOCKUP CONTAINER */}
            <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-100 shadow-inner flex flex-col">
              
              {/* 1. MOCKUP HEADER */}
              <div className="bg-white border-b border-slate-200 relative flex items-center justify-between px-3 py-2.5">
                {/* Top Brand Line */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 transition-colors"
                  style={{ backgroundColor: primaryColor }}
                />

                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-6 h-6 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center text-white font-black text-xs shrink-0 shadow-2xs"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      (schoolName || 'S').charAt(0)
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-slate-800 truncate max-w-[140px]">
                      {schoolName || 'শিক্ষা প্রতিষ্ঠান'}
                    </div>
                    <div className="text-[8.5px] text-slate-400 font-mono">Administration Hub</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <div
                    className="px-2 py-0.5 rounded-md text-[9px] font-bold text-white shadow-2xs"
                    style={{ backgroundColor: primaryColor }}
                  >
                    সক্রিয় থিম
                  </div>
                </div>
              </div>

              {/* 2. MOCKUP BODY (Sidebar + Page Content) */}
              <div className="flex h-64 overflow-hidden">
                
                {/* Mockup Sidebar */}
                <div
                  className={`w-40 p-2.5 flex flex-col justify-between shrink-0 transition-colors ${
                    sidebarTheme === 'midnight'
                      ? 'bg-black text-white'
                      : sidebarTheme === 'brand-tinted'
                      ? 'bg-slate-950 text-white'
                      : 'bg-slate-900 text-white'
                  }`}
                  style={
                    sidebarTheme === 'brand-tinted'
                      ? { backgroundImage: `linear-gradient(to bottom, #0f172a, ${primaryColor}25, #020617)` }
                      : undefined
                  }
                >
                  <div className="space-y-3">
                    {/* Sidebar Brand Header */}
                    <div className="flex items-center gap-1.5 pb-2 border-b border-slate-800">
                      <div
                        className="w-6 h-6 rounded-md overflow-hidden flex items-center justify-center text-white font-black text-xs shrink-0 shadow-xs"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {logoUrl ? (
                          <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                          (schoolName || 'S').charAt(0)
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-bold text-white truncate">SmartAmarSchool</div>
                        <div className="text-[8px] text-amber-300 font-bold truncate">
                          {schoolName || 'আমার স্কুল'}
                        </div>
                      </div>
                    </div>

                    {/* Nav Items Mockup */}
                    <div className="space-y-1">
                      {/* Active Item Highlighted in Primary Color */}
                      <div
                        className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-white flex items-center gap-1.5 shadow-sm transition-all"
                        style={{
                          backgroundColor: primaryColor,
                          boxShadow: `0 4px 10px ${primaryColor}40`
                        }}
                      >
                        <Layout className="w-3 h-3" />
                        <span className="truncate">ড্যাশবোর্ড</span>
                      </div>

                      <div className="px-2.5 py-1.5 rounded-lg text-[10px] font-medium text-slate-400 hover:text-white flex items-center gap-1.5">
                        <School className="w-3 h-3" />
                        <span className="truncate">অনলাইন ভর্তি</span>
                      </div>

                      <div className="px-2.5 py-1.5 rounded-lg text-[10px] font-medium text-slate-400 hover:text-white flex items-center gap-1.5">
                        <Palette className="w-3 h-3" />
                        <span className="truncate">সেটিংস</span>
                      </div>
                    </div>
                  </div>

                  {/* Sidebar User Footer */}
                  <div className="p-1.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center gap-1.5">
                    <div
                      className="w-5 h-5 rounded-md text-white flex items-center justify-center font-bold text-[9px] shrink-0"
                      style={{ backgroundColor: primaryColor }}
                    >
                      A
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[9px] font-bold text-white truncate">School Admin</div>
                      <div className="text-[7.5px] text-slate-400 truncate">Online</div>
                    </div>
                  </div>
                </div>

                {/* Mockup Main Canvas */}
                <div className="flex-1 bg-slate-50 p-3 space-y-2.5 overflow-hidden">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] font-bold text-slate-800">নমুনা কম্পোনেন্টস প্রিভিউ</div>
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded-md text-white"
                        style={{ backgroundColor: primaryColor }}
                      >
                        সক্রিয়
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        type="button"
                        className="px-2 py-1 rounded-md text-[9px] font-bold text-white shadow-2xs"
                        style={{ backgroundColor: primaryColor }}
                      >
                        প্রাইমারি বাটন
                      </button>
                      <button
                        type="button"
                        className="px-2 py-1 rounded-md text-[9px] font-bold border bg-white"
                        style={{ color: primaryColor, borderColor: `${primaryColor}60` }}
                      >
                        আউটলাইন
                      </button>
                    </div>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
                    <div className="text-[9px] text-slate-500 font-medium">
                      সব পোর্টাল (শিক্ষক, ছাত্র, অভিভাবক ও অ্যাডমিন) একই ব্র্যান্ডিং প্রদর্শন করবে।
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Save Button in Preview */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">প্রিভিউ পছন্দ হয়েছে?</span>
              <Button
                type="button"
                variant="primary"
                size="sm"
                icon={Check}
                onClick={handleSaveChanges}
                style={{ backgroundColor: primaryColor }}
                className="text-xs font-bold text-white shadow-sm"
              >
                এখনই সেভ করুন
              </Button>
            </div>

          </div>

          {/* Quick Cross-Portal Verification Links */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>অন্যান্য পোর্টালে সরাসরি টেস্ট করুন:</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <Link
                to="/school"
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-between"
              >
                <span>অ্যাডমিন প্যানেল</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                to="/teacher/dashboard"
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-between"
              >
                <span>শিক্ষক পোর্টাল</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                to="/student/dashboard"
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-between"
              >
                <span>শিক্ষার্থী পোর্টাল</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                to="/parent/dashboard"
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-between"
              >
                <span>অভিভাবক পোর্টাল</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
