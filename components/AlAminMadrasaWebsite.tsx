import React, { useState, useEffect } from 'react';
import { 
  Phone, Mail, MapPin, Calendar, Clock, Search, BookOpen, Award, 
  Users, ChevronRight, CheckCircle2, Check, ArrowRight, ShieldCheck, 
  Star, FileText, Menu, X, Printer, User, Globe, Lock, BookMarked, 
  Compass, HeartHandshake, Sparkles, Building2, Bell, AlertCircle, Send
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StudentAdmissionForm } from './StudentAdmissionForm';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { InstitutionTopSwitcher } from './InstitutionTopSwitcher';

export type MadrasaPageTab = 
  | 'home' 
  | 'about' 
  | 'academic' 
  | 'admission' 
  | 'results' 
  | 'gallery' 
  | 'teachers' 
  | 'contact' 
  | 'admin-login' 
  | 'portal';

import { Tenant } from '../types';

interface AlAminMadrasaWebsiteProps {
  initialTab?: MadrasaPageTab;
  tenant?: Tenant;
  showSwitcher?: boolean;
}

export const AlAminMadrasaWebsite: React.FC<AlAminMadrasaWebsiteProps> = ({ 
  initialTab = 'home',
  tenant,
  showSwitcher = false
}) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState<MadrasaPageTab>(initialTab);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lang, setLang] = useState<'bn' | 'en'>('bn');

  // Modals & Interactive States
  const [isAdmissionModalOpen, setIsAdmissionModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any | null>(null);

  const currentTenant: Tenant = tenant || {
    id: 'al-amin',
    name: 'আল-আমিন ইসলামিয়া মাদ্রাসা',
    type: 'Madrasa',
    subdomain: 'al-amin',
    customDomain: 'alaminmadrasa.edu.bd',
    logoUrl: 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=200&h=200&fit=crop',
    status: 'Active',
    studentsCount: 520,
    maxStudents: 1000,
    plan: 'Premium',
    revenue: 28000,
    enabledModules: ['academic', 'exams', 'communication', 'portal', 'library', 'admissions'],
    eiin: '138765',
    code: 'AIM-1998',
    contactPhone: '+880 1712-040674',
    contactEmail: 'info@alaminmadrasa.edu.bd',
    address: 'গ্রাম: দক্ষিণপাড়া, ডাকঘর: মাধবপুর, উপজেলা: মাধবপুর, জেলা: হবিগঞ্জ',
    establishedYear: '1998',
    principalName: 'মাওলানা মোঃ আবদুল কাদির'
  };
  const [selectedNotice, setSelectedNotice] = useState<any | null>(null);
  const [selectedImage, setSelectedImage] = useState<any | null>(null);
  const [founderModalOpen, setFounderModalOpen] = useState(false);
  const [governingBodyModalOpen, setGoverningBodyModalOpen] = useState(false);
  const [achievementsModalOpen, setAchievementsModalOpen] = useState(false);

  // Search & Filters
  const [teacherSearch, setTeacherSearch] = useState('');
  const [teacherDept, setTeacherDept] = useState('All');
  const [galleryCategory, setGalleryCategory] = useState('সকল');
  const [academicSidebarTab, setAcademicSidebarTab] = useState<string>('kitab');
  const [kitabFilter, setKitabFilter] = useState<'all' | 'primary' | 'hadith' | 'fiqh' | 'arabic' | 'english'>('all');

  // Results Tab States
  const [resultExamType, setResultExamType] = useState('annual');
  const [resultYear, setResultYear] = useState('2024-2025');
  const [resultClass, setResultClass] = useState('alim');
  const [rollQuery, setRollQuery] = useState('১০১');
  const [foundStudentResult, setFoundStudentResult] = useState<any | null>({
    name: 'মোঃ তামিম উদ্দিন',
    class: 'আলিম',
    roll: '১০১',
    exam: 'বার্ষিক পরীক্ষা ২০২৪-২০২৫',
    totalMarks: '৫০০ নম্বরের মধ্যে ৪৪৮',
    subjects: [
      { name: 'কুরআন মাজীদ', full: 100, obtained: 95, grade: 'A+' },
      { name: 'হাদিস', full: 100, obtained: 92, grade: 'A+' },
      { name: 'ফিকহ', full: 100, obtained: 93, grade: 'A+' },
      { name: 'আরবি', full: 100, obtained: 90, grade: 'A-' },
      { name: 'ইংরেজি', full: 100, obtained: 78, grade: 'B+' },
    ],
    totalFull: 500,
    totalObtained: 448,
    gpa: '4.90',
    finalGrade: 'A',
    status: 'উত্তীর্ণ'
  });

  // Contact Form
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [contactSuccess, setContactSuccess] = useState(false);

  // Admin & Portal Login
  const [adminUsername, setAdminUsername] = useState('admin@alaminmadrasa.edu.bd');
  const [adminPassword, setAdminPassword] = useState('admin123');

  // Sync tab if prop changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleTabChange = (tab: MadrasaPageTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Mock Results Database (Tamim Uddin roll 101 matches screen 5)
  const MADRASA_RESULTS: Record<string, any> = {
    '101': {
      name: 'মোঃ তামিম উদ্দিন',
      class: 'আলিম',
      roll: '১০১',
      exam: 'বার্ষিক পরীক্ষা ২০২৪-২০২৫',
      totalMarks: '৫০০ নম্বরের মধ্যে ৪৪৮',
      subjects: [
        { name: 'কুরআন মাজীদ', full: 100, obtained: 95, grade: 'A+' },
        { name: 'হাদিস', full: 100, obtained: 92, grade: 'A+' },
        { name: 'ফিকহ', full: 100, obtained: 93, grade: 'A+' },
        { name: 'আরবি', full: 100, obtained: 90, grade: 'A-' },
        { name: 'ইংরেজি', full: 100, obtained: 78, grade: 'B+' },
      ],
      totalFull: 500,
      totalObtained: 448,
      gpa: '4.90',
      finalGrade: 'A',
      status: 'উত্তীর্ণ'
    },
    '102': {
      name: 'মোঃ আবদুল্লাহ আল মামুন',
      class: 'আলিম',
      roll: '১০২',
      exam: 'বার্ষিক পরীক্ষা ২০২৪-২০২৫',
      totalMarks: '৫০০ নম্বরের মধ্যে ৪৬৬',
      subjects: [
        { name: 'কুরআন মাজীদ', full: 100, obtained: 98, grade: 'A+' },
        { name: 'হাদিস', full: 100, obtained: 96, grade: 'A+' },
        { name: 'ফিকহ', full: 100, obtained: 95, grade: 'A+' },
        { name: 'আরবি', full: 100, obtained: 92, grade: 'A+' },
        { name: 'ইংরেজি', full: 100, obtained: 85, grade: 'A' },
      ],
      totalFull: 500,
      totalObtained: 466,
      gpa: '5.00',
      finalGrade: 'A+',
      status: 'উত্তীর্ণ (১ম স্থান)'
    }
  };

  const handleResultSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = rollQuery.trim().replace(/[০-৯]/g, d => '০১২৩৪৫৬৭৮৯'.indexOf(d).toString());
    const res = MADRASA_RESULTS[clean] || (rollQuery.includes('১০১') ? MADRASA_RESULTS['101'] : (rollQuery.includes('১০২') ? MADRASA_RESULTS['102'] : null));
    if (res) {
      setFoundStudentResult(res);
    } else {
      setFoundStudentResult('not_found');
    }
  };

  // 6 Teachers matching Screen 7
  const TEACHERS_LIST = [
    {
      id: 't1',
      name: 'মাওলানা আবদুল কাদির',
      designation: 'প্রধান শিক্ষক',
      dept: 'প্রশাসন ও হাদিস',
      photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&crop=faces',
      qualification: 'দাওরায়ে হাদিস (১ম শ্রেণি), কামিল (হাদিস)',
      experience: '২২ বছরের শিক্ষকতা ও দ্বীনি শিক্ষা পরিচালনা'
    },
    {
      id: 't2',
      name: 'মাওলানা শহীদুল ইসলাম',
      designation: 'সহকারী প্রধান শিক্ষক',
      dept: 'ফিকহ ও আরবি',
      photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&crop=faces',
      qualification: 'দাওরায়ে হাদিস, এম.এ (ইসলামিক স্টাডিজ)',
      experience: '১৮ বছরের পাঠদান ও একাডেমিক অভিজ্ঞতা'
    },
    {
      id: 't3',
      name: 'মাওলানা সাইদুর রহমান',
      designation: 'আরবি বিভাগ',
      dept: 'আরবি ভাষা ও ব্যাকরণ',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=faces',
      qualification: 'উস্তাদুল লুগাহ, ডিপ্লোমা ইন অ্যারাবিক',
      experience: '১৫ বছরের পাঠদান অভিজ্ঞতা'
    },
    {
      id: 't4',
      name: 'মাওলানা নূরুল ইসলাম',
      designation: 'হাদিস বিভাগ',
      dept: 'হাদিস বিভাগ',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=faces',
      qualification: 'দাওরায়ে হাদিস, ইফতা (মুফতি)',
      experience: '১২ বছরের পাঠদান অভিজ্ঞতা'
    },
    {
      id: 't5',
      name: 'মাওলানা রাশেদুল হক',
      designation: 'ফিকহ বিভাগ',
      dept: 'ফিকহ বিভাগ',
      photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&h=300&fit=crop&crop=faces',
      qualification: 'কামিল (ফিকহ ও উসুল)',
      experience: '১০ বছরের শিক্ষকতা'
    },
    {
      id: 't6',
      name: 'মোহা: আমেনা খাতুন',
      designation: 'ইংরেজি বিভাগ',
      dept: 'ইংরেজি বিভাগ',
      photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=faces',
      qualification: 'বি.এ (অনার্স), এম.এ (ইংরেজি)',
      experience: '৮ বছরের জেনারেল শিক্ষা পাঠদান'
    }
  ];

  // 6 Photos matching Screen 6
  const GALLERY_PHOTOS = [
    {
      id: 'g1',
      title: 'বার্ষিক ক্রীড়া প্রতিযোগিতা',
      category: 'ক্রীড়া',
      url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&h=400&fit=crop',
      desc: 'মাদ্রাসার মাঠ প্রাঙ্গণে ছাত্রদের বার্ষিক দৌড় ও শরীরচর্চা প্রদর্শনী।'
    },
    {
      id: 'g2',
      title: 'পুরস্কার বিতরণী অনুষ্ঠান',
      category: 'অনুষ্ঠান',
      url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=400&fit=crop',
      desc: 'মেধাবী শিক্ষার্থীদের মাঝে সম্মাননা স্মারক ও কিতাব বিতরণ।'
    },
    {
      id: 'g3',
      title: 'হিফজুল কুরআন প্রতিযোগিতা',
      category: 'হিফজ কার্যক্রম',
      url: 'https://images.unsplash.com/photo-1585036156171-384164a8c675?w=600&h=400&fit=crop',
      desc: 'হিফজ বিভাগের ছাত্রদের বার্ষিক হিফজ প্রতিযোগিতা ও পাগড়ি প্রদান।'
    },
    {
      id: 'g4',
      title: 'ছাত্রদের পাঠদান',
      category: 'অন্যান্য',
      url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600&h=400&fit=crop',
      desc: 'শ্রেণিকক্ষে কিতাব অধ্যয়ন ও শিক্ষকের প্রত্যক্ষ তত্ত্বাবধান।'
    },
    {
      id: 'g5',
      title: 'ক্লাস রুম',
      category: 'অন্যান্য',
      url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&h=400&fit=crop',
      desc: 'মনোরম ও শান্ত পরিবেশে শিক্ষার্থীদের গ্রুপ স্টাডি ও কিতাব মুতালাআ।'
    },
    {
      id: 'g6',
      title: 'শিক্ষক সভা',
      category: 'অনুষ্ঠান',
      url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=600&h=400&fit=crop',
      desc: 'গুণগত পাঠদান ও ছাত্র শৃঙ্খলা বিষয়ক শিক্ষকদের মাসিক পরামর্শ সভা।'
    }
  ];

  // 7 Kitabs matching Screen 4
  const KITAB_LIST = [
    { id: 1, num: '১', name: 'কুরআন মাজীদ', category: 'primary' },
    { id: 2, num: '২', name: 'সহিহ বুখারী', category: 'hadith' },
    { id: 3, num: '৩', name: 'সহিহ মুসলিম', category: 'hadith' },
    { id: 4, num: '৪', name: 'তাফসীরে ইবনে কাসীর', category: 'hadith' },
    { id: 5, num: '৫', name: 'আরবি ব্যাকরণ (নাহু-সরফ)', category: 'arabic' },
    { id: 6, num: '৬', name: 'ইসলামী আকিদা', category: 'fiqh' },
    { id: 7, num: '৭', name: 'ফিকহুল ইসলাম', category: 'fiqh' }
  ];

  // 3 Notices matching Screen 1
  const NOTICES_LIST = [
    {
      id: 'n1',
      title: 'হিফজুল কুরআন প্রতিযোগিতা ২০২৫',
      date: '১০ জানুয়ারি ২০২৫',
      desc: 'আগামী ২০ জানুয়ারি থেকে জাতীয় হিফজুল কুরআন প্রতিযোগিতা শুরু হবে।'
    },
    {
      id: 'n2',
      title: 'নূরানী ও নাজেরা ভর্তি পরীক্ষা ২০২৫',
      date: '১৫ জানুয়ারি ২০২৫',
      desc: '২০২৫ শিক্ষাবর্ষে শিশু শ্রেণি থেকে আলিম পর্যন্ত ভর্তি পরীক্ষা অনুষ্ঠিত হবে।'
    },
    {
      id: 'n3',
      title: 'রমজান মাসের বিশেষ সময়সূচি',
      date: '০১ ফেব্রুয়ারি ২০২৫',
      desc: 'পবিত্র রমজানুল মোবারক উপলক্ষে ক্লাস সময়সূচি ও খতমে তারাবীর রুটিন।'
    }
  ];

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(UserRole.SCHOOL_ADMIN, {
      name: 'মাওলানা মোঃ আবদুল কাদির',
      email: adminUsername,
      role: UserRole.SCHOOL_ADMIN,
      tenantName: 'আল-আমিন ইসলামিয়া মাদ্রাসা',
      tenantId: 'al-amin',
      tenantSubdomain: 'al-amin'
    });
    navigate('/school');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased selection:bg-[#07442f] selection:text-white">
      
      {/* 0. DISCREET INSTITUTION SWITCHER (DISABLED ON ISOLATED INSTITUTION WEBSITES) */}
      {showSwitcher && (
        <InstitutionTopSwitcher 
          currentInstitution="madrasa" 
          activePageTab={activeTab} 
          onPageSelect={(tab) => handleTabChange(tab as MadrasaPageTab)} 
        />
      )}

      {/* 1. MAIN HEADER (MATCHES MOCKUP BOARD EXACTLY: CLEAN WHITE HEADER WITH INLINE NAV & BILINGUAL TOGGLE) */}
      <header className="bg-white border-b border-slate-200/90 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          {/* Top small language switch line matching mockup */}
          <div className="flex justify-end pt-1.5 pb-0.5">
            <button 
              onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
              className="text-[11px] font-bold text-slate-500 hover:text-[#07442f] transition-colors cursor-pointer"
            >
              বাংলা | English
            </button>
          </div>

          <div className="py-2.5 flex justify-between items-center gap-4">
            
            {/* Logo & Madrasa Title */}
            <div 
              onClick={() => handleTabChange('home')}
              className="flex items-center gap-3 cursor-pointer group select-none"
            >
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-[#052e1f] via-[#07442f] to-[#0c6b4b] text-amber-300 flex items-center justify-center font-black text-2xl shadow-md border-2 border-emerald-600 shrink-0 group-hover:scale-105 transition-transform">
                <Compass size={28} className="text-amber-300" />
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl font-black text-[#07442f] tracking-tight leading-tight group-hover:text-emerald-700 transition-colors">
                  আল-আমিন ইসলামিয়া মাদ্রাসা
                </h1>
                <p className="text-xs font-bold text-slate-600 tracking-wide font-sans">
                  Al-Amin Islamiya Madrasa
                </p>
                <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                  স্থাপিত ১৯৯৮ ইং | মাধবপুর, হবিগঞ্জ
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links Inline in White Header */}
            <nav className="hidden lg:flex items-center gap-5 text-xs font-bold">
              {[
                { id: 'home', label: 'হোম' },
                { id: 'about', label: 'আমাদের সম্পর্কে' },
                { id: 'academic', label: 'একাডেমিক' },
                { id: 'admission', label: 'ভর্তি' },
                { id: 'results', label: 'ফলাফল' },
                { id: 'gallery', label: 'গ্যালারি' },
                { id: 'teachers', label: 'শিক্ষকবৃন্দ' },
                { id: 'contact', label: 'যোগাযোগ' }
              ].map(item => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id as MadrasaPageTab)}
                    className={`transition-colors cursor-pointer py-1 relative ${
                      isActive 
                        ? 'text-[#07442f] font-black' 
                        : 'text-slate-700 hover:text-[#07442f]'
                    }`}
                  >
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#07442f] rounded-full" />
                    )}
                  </button>
                );
              })}

              {/* Search Icon */}
              <button
                onClick={() => handleTabChange('results')}
                className="text-slate-700 hover:text-[#07442f] p-1 cursor-pointer transition-colors"
                title="ফলাফল অনুসন্ধান"
              >
                <Search size={16} />
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-slate-200 px-4 py-3 space-y-1 shadow-lg animate-in slide-in-from-top-2">
            {[
              { id: 'home', label: 'হোম' },
              { id: 'about', label: 'আমাদের সম্পর্কে' },
              { id: 'academic', label: 'একাডেমিক' },
              { id: 'admission', label: 'ভর্তি' },
              { id: 'results', label: 'ফলাফল' },
              { id: 'gallery', label: 'গ্যালারি' },
              { id: 'teachers', label: 'শিক্ষকবৃন্দ' },
              { id: 'contact', label: 'যোগাযোগ' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id as MadrasaPageTab)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === item.id
                    ? 'bg-[#07442f] text-white font-black'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* 2. MAIN BODY (MATCHES 8 PAGES IN MOCKUP BOARD) */}
      <main className="min-h-[70vh]">

        {/* ========================================================= */}
        {/* PANEL 1: HOME (হোম পেজ)                                   */}
        {/* ========================================================= */}
        {activeTab === 'home' && (
          <div>
            {/* HERO BANNER (MATCHES PANEL 1) */}
            <section className="relative bg-[#07442f] text-white py-14 sm:py-20 px-4 overflow-hidden border-b-4 border-amber-500">
              {/* Islamic Pattern Overlay */}
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

              <div className="max-w-7xl mx-auto relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
                
                {/* Left Text */}
                <div className="max-w-2xl text-center lg:text-left space-y-4">
                  <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
                    আল-আমিন ইসলামিয়া মাদ্রাসা
                  </h2>
                  <h3 className="text-lg sm:text-2xl font-bold text-amber-300">
                    ইসলামি শিক্ষা, নৈতিকতা ও মানবতার বিকাশ
                  </h3>
                  <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
                    দ্বীনি ও দুনিয়াবি শিক্ষায় গড়ে উঠুক সুন্দর আগামী। কুরআন ও সুন্নাহর আলোকে সুনাগরিক গড়ার বিশ্বস্ত প্রতিষ্ঠান।
                  </p>

                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-3">
                    <button
                      onClick={() => handleTabChange('admission')}
                      className="px-6 py-3 bg-[#0a573d] hover:bg-[#0d694a] text-white font-extrabold rounded-xl border border-emerald-400/40 shadow-md transition-all text-xs sm:text-sm cursor-pointer"
                    >
                      ভর্তি সম্পর্কে জানুন
                    </button>
                    <button
                      onClick={() => handleTabChange('about')}
                      className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/30 backdrop-blur-xs transition-all text-xs sm:text-sm cursor-pointer"
                    >
                      আমাদের সম্পর্কে
                    </button>
                  </div>
                </div>

                {/* Right Image: Students Reading Quran */}
                <div className="w-full max-w-md lg:max-w-lg">
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-emerald-600/40 ring-4 ring-amber-400/20">
                    <img 
                      src="https://images.unsplash.com/photo-1585036156171-384164a8c675?w=800&h=540&fit=crop" 
                      alt="Students reading Quran with mosque minaret"
                      className="w-full h-72 sm:h-80 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#07442f]/80 via-transparent to-transparent" />
                  </div>
                </div>

              </div>
            </section>

            {/* 4 FEATURE CARDS (MATCHES PANEL 1) */}
            <section className="max-w-7xl mx-auto px-4 -mt-8 relative z-20">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { title: 'আধুনিক শিক্ষা ব্যবস্থা', icon: BookOpen },
                  { title: 'দক্ষ শিক্ষক মণ্ডলী', icon: Users },
                  { title: 'নিরাপদ পরিবেশ', icon: ShieldCheck },
                  { title: 'আবাসিক ব্যবস্থা', icon: Building2 }
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div 
                      key={idx}
                      className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-md hover:shadow-xl transition-all text-center flex flex-col items-center justify-center group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#07442f] flex items-center justify-center mb-3 group-hover:bg-[#07442f] group-hover:text-white transition-colors">
                        <Icon size={24} />
                      </div>
                      <h4 className="font-black text-slate-900 text-sm">{item.title}</h4>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* TWO COLUMNS: PRINCIPAL MESSAGE & RECENT NOTICES (MATCHES PANEL 1) */}
            <section className="max-w-7xl mx-auto px-4 py-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                
                {/* Left: প্রধান শিক্ষকের বার্তা */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-black text-[#07442f] mb-5 border-b border-slate-100 pb-3">
                      প্রধান শিক্ষকের বার্তা
                    </h3>

                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-5">
                      <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-emerald-600 shadow-md shrink-0">
                        <img 
                          src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=faces" 
                          alt="মাওলানা মোঃ আবদুল কাদির"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-1 text-center sm:text-left">
                        <h4 className="text-base font-black text-slate-900">মাওলানা মোঃ আবদুল কাদির</h4>
                        <p className="text-xs font-bold text-emerald-800">প্রধান শিক্ষক</p>
                        <p className="text-[11px] text-slate-400">আল-আমিন ইসলামিয়া মাদ্রাসা</p>
                      </div>
                    </div>

                    <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100 text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                      “শিক্ষা মানুষকে আলোকিত করে, আর ইসলামি শিক্ষা মানুষকে আল্লাহ অভিমুখী করে। আমাদের প্রধান লক্ষ্য শিক্ষার্থীদের এমনভাবে গড়ে তোলা, যাতে তারা দ্বীন ও দুনিয়ায় কল্যাণের কাজে আসতে পারে।”
                    </div>
                  </div>
                </div>

                {/* Right: সাম্প্রতিক নোটিস */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-black text-[#07442f] mb-5 border-b border-slate-100 pb-3">
                      সাম্প্রতিক নোটিস
                    </h3>

                    <div className="space-y-3">
                      {NOTICES_LIST.map((notice) => (
                        <div 
                          key={notice.id}
                          onClick={() => setSelectedNotice(notice)}
                          className="p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 transition-all flex items-center justify-between cursor-pointer group"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-[#07442f] shrink-0" />
                            <div>
                              <h5 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#07442f]">
                                {notice.title}
                              </h5>
                              <p className="text-[10px] text-slate-400 mt-0.5">{notice.date}</p>
                            </div>
                          </div>
                          <ChevronRight size={15} className="text-slate-400 group-hover:text-[#07442f]" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-5 text-right">
                    <button
                      onClick={() => handleTabChange('admission')}
                      className="px-5 py-2.5 bg-[#07442f] hover:bg-[#09573c] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      সব নোটিশ দেখুন
                    </button>
                  </div>
                </div>

              </div>
            </section>

            {/* 4 STATS ROW (MATCHES PANEL 1) */}
            <section className="bg-[#07442f] text-white py-10 px-4 border-y-4 border-amber-500">
              <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                {[
                  { number: '৫০০+', label: 'শিক্ষার্থী', icon: Users },
                  { number: '২০+', label: 'শিক্ষক', icon: Award },
                  { number: '১০', label: 'শ্রেণি', icon: BookOpen },
                  { number: '১৯৯৮', label: 'প্রতিষ্ঠিত বছর', icon: Calendar }
                ].map((stat, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-[#053223]/50 border border-emerald-700/50">
                    <div className="text-3xl sm:text-4xl font-black text-amber-300 font-mono">{stat.number}</div>
                    <div className="text-xs text-emerald-100 font-bold mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ========================================================= */}
        {/* PANEL 2: ABOUT US (আমাদের সম্পর্কে)                       */}
        {/* ========================================================= */}
        {activeTab === 'about' && (
          <div className="pb-16 animate-in fade-in duration-300">
            {/* Top Banner (Matches Panel 2) */}
            <div className="bg-[#07442f] text-white py-12 px-4 border-b-4 border-amber-500 relative overflow-hidden">
              <div className="max-w-7xl mx-auto flex justify-between items-center relative z-10">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black">আমাদের সম্পর্কে</h2>
                  <p className="text-xs text-emerald-200 mt-1 font-semibold">হোম &gt; আমাদের সম্পর্কে</p>
                </div>

                {/* Arabic Calligraphy Emblem on right matching panel 2 */}
                <div className="hidden sm:flex items-center justify-center w-20 h-20 rounded-full border-2 border-amber-400/80 bg-amber-400/10 text-amber-300 font-serif text-3xl font-bold">
                  الله
                </div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">
              
              {/* প্রতিষ্ঠানের ইতিহাস (Matches Panel 2) */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div className="space-y-4">
                    <h3 className="text-2xl font-black text-[#07442f]">প্রতিষ্ঠানের ইতিহাস</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      আল-আমিন ইসলামিয়া মাদ্রাসা ১৯৯৮ সালে হবিগঞ্জের মাধবপুরে এলাকার বিশিষ্ট ওলামায়ে কেরাম ও শিক্ষানুরাগী ব্যক্তিবর্গের ঐকান্তিক প্রচেষ্টায় প্রতিষ্ঠিত হয়। 
                    </p>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      প্রতিষ্ঠালগ্ন থেকেই প্রতিষ্ঠানটি দ্বীনি শিক্ষার বিশুদ্ধ ধারা বজায় রাখার পাশাপাশি শিক্ষার্থীদের বাস্তবমুখী সাধারণ শিক্ষা, নৈতিক চরিত্র গঠন ও মানবকল্যাণে অগ্রণী ভূমিকা পালন করে আসছে।
                    </p>
                  </div>

                  <div className="rounded-2xl overflow-hidden shadow-md border border-slate-200">
                    <img 
                      src="https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=800&h=500&fit=crop" 
                      alt="Madrasa Campus Building with minaret"
                      className="w-full h-72 object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* 4 Cards Grid (2x2) Matching Panel 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. আমাদের লক্ষ্য ও উদ্দেশ্য */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <h4 className="text-lg font-black text-[#07442f]">আমাদের লক্ষ্য ও উদ্দেশ্য</h4>
                  <div className="space-y-2.5 text-xs text-slate-700">
                    {[
                      'সহিহভাবে কুরআন মাজীদ তিলাওয়াত ও হিফজ সম্পন্ন করা।',
                      'হাদিস ও সুন্নাহর আলোকে উন্নত চরিত্র ও খোদাভীতি অর্জন।',
                      'দ্বীনি শিক্ষার সাথে আধুনিক সাধারণ শিক্ষার সমন্বয়।',
                      'মানবকল্যাণে নিবেদিত আদর্শ নাগরিক হিসেবে গড়ে তোলা।'
                    ].map((t, idx) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <CheckCircle2 size={16} className="text-[#07442f] shrink-0 mt-0.5" />
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. প্রতিষ্ঠাতার পরিচিতি */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
                  <div>
                    <h4 className="text-lg font-black text-[#07442f]">প্রতিষ্ঠাতার পরিচিতি</h4>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-emerald-600 shrink-0">
                        <img 
                          src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop" 
                          alt="মাওলানা মুফতি শফিউল্লাহ"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h5 className="font-black text-sm text-slate-900">মাওলানা মুফতি শফিউল্লাহ</h5>
                        <p className="text-xs text-emerald-800 font-bold">প্রতিষ্ঠাতা ও প্রধান উপদেষ্টা</p>
                        <p className="text-[11px] text-slate-400">বিশিষ্ট ইসলামিক স্কলার ও শিক্ষাবিদ</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-right pt-2">
                    <button 
                      onClick={() => setFounderModalOpen(true)}
                      className="px-4 py-2 bg-[#07442f] hover:bg-[#09573c] text-white font-bold text-xs rounded-xl cursor-pointer"
                    >
                      বিস্তারিত পড়ুন
                    </button>
                  </div>
                </div>

                {/* 3. পরিচালনা পর্ষদ */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
                  <div>
                    <h4 className="text-lg font-black text-[#07442f]">পরিচালনা পর্ষদ</h4>
                    <p className="text-xs text-slate-600 leading-relaxed mt-2">
                      অভিজ্ঞ ওলামায়ে কেরাম, এলাকার গণ্যমান্য মুরুব্বিয়ান ও শিক্ষানুরাগী বিশিষ্টজনদের সমন্বয়ে গঠিত শুরা কমিটি দ্বারা প্রতিষ্ঠানটি সুষ্ঠুভাবে পরিচালিত হয়।
                    </p>
                  </div>

                  <div className="text-right pt-2">
                    <button 
                      onClick={() => setGoverningBodyModalOpen(true)}
                      className="px-4 py-2 bg-[#07442f] hover:bg-[#09573c] text-white font-bold text-xs rounded-xl cursor-pointer"
                    >
                      বিস্তারিত দেখুন
                    </button>
                  </div>
                </div>

                {/* 4. প্রতিষ্ঠানের সাফল্য */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
                  <div>
                    <h4 className="text-lg font-black text-[#07442f]">প্রতিষ্ঠানের সাফল্য</h4>
                    <ul className="space-y-2 text-xs text-slate-700 mt-2">
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                        <span>জাতীয় হিফজ প্রতিযোগিতায় জেলা ও বিভাগীয় পর্যায়ে সাফল্য।</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                        <span>মাদ্রাসা শিক্ষা বোর্ডে শতভাগ পাস ও গোল্ডেন ফলাফল।</span>
                      </li>
                    </ul>
                  </div>

                  <div className="text-right pt-2">
                    <button 
                      onClick={() => setAchievementsModalOpen(true)}
                      className="px-4 py-2 bg-[#07442f] hover:bg-[#09573c] text-white font-bold text-xs rounded-xl cursor-pointer"
                    >
                      সব সাফল্য দেখুন
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PANEL 3: ADMISSION (ভর্তি)                                 */}
        {/* ========================================================= */}
        {activeTab === 'admission' && (
          <div className="pb-16 animate-in fade-in duration-300">
            {/* Top Banner (Matches Panel 3) */}
            <div className="bg-[#07442f] text-white py-12 px-4 border-b-4 border-amber-500 relative overflow-hidden">
              <div className="max-w-7xl mx-auto flex justify-between items-center relative z-10">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black">ভর্তি তথ্য</h2>
                  <p className="text-xs text-emerald-200 mt-1 font-semibold">হোম &gt; ভর্তি</p>
                </div>
                <div className="w-28 h-20 rounded-xl overflow-hidden border border-emerald-500/50 hidden sm:block">
                  <img src="https://images.unsplash.com/photo-1577896851231-70ef18881754?w=300&h=200&fit=crop" alt="Students" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
              
              {/* ভর্তি বিজ্ঞপ্তি ২০২৫ (Matches Panel 3) */}
              <div className="bg-[#07442f] text-white p-6 sm:p-8 rounded-3xl border-2 border-amber-400 shadow-lg space-y-4">
                <span className="bg-amber-400 text-slate-950 font-black text-xs px-3 py-1 rounded-full uppercase">
                  ভর্তি বিজ্ঞপ্তি ২০২৫
                </span>
                <h3 className="text-xl sm:text-2xl font-black">
                  সকল বিভাগে ছাত্র-ছাত্রী ভর্তি কার্যক্রম চলছে; নির্দিষ্ট সময়সীমার মধ্যে আবেদন করুন।
                </h3>
                <div>
                  <button 
                    onClick={() => setIsAdmissionModalOpen(true)}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer border border-emerald-400"
                  >
                    আবেদন করুন
                  </button>
                </div>
              </div>

              {/* Two Columns: ভর্তির যোগ্যতা & আবশ্যকীয় কাগজপত্র */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* ভর্তির যোগ্যতা */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <h4 className="text-base font-black text-[#07442f]">ভর্তির যোগ্যতা</h4>
                  <div className="space-y-3 text-xs text-slate-700">
                    {[
                      'মক্তব ও নূরানী: ৫ বছর বা তদূর্ধ্ব',
                      'আলিম: ৮ম শ্রেণি উত্তীর্ণ বা সমমান',
                      'কাফিল / হিফজ: নির্ধারিত পরীক্ষায় উত্তীর্ণ',
                      'বিশেষ শ্রেণি: নির্ধারিত নিয়ম অনুযায়ী'
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <CheckCircle2 size={16} className="text-[#07442f] shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* আবশ্যকীয় কাগজপত্র */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <h4 className="text-base font-black text-[#07442f]">আবশ্যকীয় কাগজপত্র</h4>
                  <div className="space-y-3 text-xs text-slate-700">
                    {[
                      'জন্ম নিবন্ধন সনদ (ফটোকপি)',
                      'পাসপোর্ট সাইজ ছবি (২ কপি)',
                      'পূর্ববর্তী পরীক্ষার সনদ (যদি থাকে)',
                      'অভিভাবকের জাতীয় পরিচয়পত্র (ফটোকপি)'
                    ].map((doc, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <FileText size={16} className="text-[#07442f] shrink-0" />
                        <span>{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* অনলাইনে আবেদন করুন Button (Wide button matching panel 3) */}
              <div>
                <button
                  onClick={() => setIsAdmissionModalOpen(true)}
                  className="w-full py-3.5 bg-[#07442f] hover:bg-[#09573c] text-white font-black text-sm rounded-2xl shadow-md transition-all cursor-pointer text-center"
                >
                  অনলাইনে আবেদন করুন
                </button>
              </div>

              {/* আবেদন প্রক্রিয়া (4 Steps Matching Panel 3) */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
                <h4 className="text-base font-black text-[#07442f] text-center">আবেদন প্রক্রিয়া</h4>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  {[
                    { step: '১', title: 'আবেদন ফরম পূরণ' },
                    { step: '২', title: 'কাগজপত্র আপলোড' },
                    { step: '৩', title: 'বাছাই' },
                    { step: '৪', title: 'নিশ্চিতকরণ' }
                  ].map((s, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center">
                      <div className="w-9 h-9 rounded-full bg-[#07442f] text-white font-bold text-sm flex items-center justify-center mb-2">
                        {s.step}
                      </div>
                      <span className="font-bold text-xs text-slate-800">{s.title}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PANEL 4: ACADEMIC (একাডেমিক)                                */}
        {/* ========================================================= */}
        {activeTab === 'academic' && (
          <div className="pb-16 animate-in fade-in duration-300">
            {/* Top Banner (Matches Panel 4) */}
            <div className="bg-[#07442f] text-white py-12 px-4 border-b-4 border-amber-500 relative overflow-hidden">
              <div className="max-w-7xl mx-auto flex justify-between items-center relative z-10">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black">একাডেমিক কার্যক্রম</h2>
                  <p className="text-xs text-emerald-200 mt-1 font-semibold">হোম &gt; একাডেমিক</p>
                </div>
                <div className="w-28 h-20 rounded-xl overflow-hidden border border-emerald-500/50 hidden sm:block">
                  <img src="https://images.unsplash.com/photo-1577896851231-70ef18881754?w=300&h=200&fit=crop" alt="Classroom" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-10">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* Left Sidebar (Solid green buttons matching panel 4) */}
                <div className="lg:col-span-1 space-y-2">
                  {[
                    { id: 'kitab', label: 'কিতাবসমূহ' },
                    { id: 'sections', label: 'শ্রেণি বিভাগ' },
                    { id: 'calendar', label: 'একাডেমিক ক্যালেন্ডার' },
                    { id: 'routine', label: 'ক্লাস রুটিন' },
                    { id: 'exam', label: 'পরীক্ষা পদ্ধতি' },
                    { id: 'discipline', label: 'শৃঙ্খলা পদ্ধতি' },
                    { id: 'facilities', label: 'সুবিধাসমূহ' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setAcademicSidebarTab(tab.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                        academicSidebarTab === tab.id
                          ? 'bg-[#07442f] text-white font-black shadow-md'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <ChevronRight size={14} className={academicSidebarTab === tab.id ? 'text-amber-300' : 'text-slate-400'} />
                    </button>
                  ))}
                </div>

                {/* Right Content Area (Matches Panel 4) */}
                <div className="lg:col-span-3 space-y-6">
                  
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    
                    {/* Kitab Filter Pills */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <h3 className="text-xl font-black text-[#07442f]">কিতাবসমূহ</h3>
                      
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { id: 'all', label: 'প্রারম্ভিক' },
                          { id: 'hadith', label: 'হাদিস' },
                          { id: 'fiqh', label: 'ফিকহ' },
                          { id: 'arabic', label: 'আরবি' },
                          { id: 'english', label: 'ইংরেজি' }
                        ].map(f => (
                          <button
                            key={f.id}
                            onClick={() => setKitabFilter(f.id as any)}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                              kitabFilter === f.id
                                ? 'bg-[#07442f] text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* প্রধান কিতাবসমূহ List & Photo (Matches Panel 4) */}
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 mb-4">প্রধান কিতাবসমূহ</h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        {/* 7 Kitabs list */}
                        <div className="space-y-3">
                          {KITAB_LIST.map((k) => (
                            <div key={k.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                              <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#07442f] flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                                {k.num}
                              </span>
                              <span className="text-xs sm:text-sm font-bold text-slate-800">{k.name}</span>
                            </div>
                          ))}
                        </div>

                        {/* Stack of Quran Books Photo */}
                        <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200 max-h-72">
                          <img 
                            src="https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=600&h=500&fit=crop" 
                            alt="Stack of Holy Quran and Hadith Books" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Bottom Hadith Quote Box (Matches Panel 4) */}
                  <div className="bg-[#07442f] p-6 rounded-3xl text-white text-center shadow-md space-y-1">
                    <p className="text-base sm:text-lg font-black text-white">
                      "জ্ঞান অর্জন করা প্রত্যেক মুসলিমের উপর ফরজ"
                    </p>
                    <p className="text-xs text-amber-300 font-semibold">— হাদিস শরীফ</p>
                  </div>

                </div>

              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PANEL 5: RESULTS (ফলাফল)                                   */}
        {/* ========================================================= */}
        {activeTab === 'results' && (
          <div className="pb-16 animate-in fade-in duration-300">
            {/* Top Banner (Matches Panel 5) */}
            <div className="bg-[#07442f] text-white py-12 px-4 border-b-4 border-amber-500 relative overflow-hidden">
              <div className="max-w-7xl mx-auto flex justify-between items-center relative z-10">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black">ফলাফল দেখুন</h2>
                  <p className="text-xs text-emerald-200 mt-1 font-semibold">হোম &gt; ফলাফল</p>
                </div>
                <div className="w-28 h-20 rounded-xl overflow-hidden border border-emerald-500/50 hidden sm:block">
                  <img src="https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=300&h=200&fit=crop" alt="Students in Exam" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
              
              {/* ফলাফল অনুসন্ধান Form (Matches Panel 5) */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-lg font-black text-[#07442f]">ফলাফল অনুসন্ধান</h3>

                <form onSubmit={handleResultSearch} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">পরীক্ষার ধরন</label>
                      <select 
                        value={resultExamType}
                        onChange={(e) => setResultExamType(e.target.value)}
                        className="w-full text-xs font-bold border border-slate-200 rounded-xl p-2.5 bg-slate-50 outline-none"
                      >
                        <option value="annual">বার্ষিক পরীক্ষা</option>
                        <option value="half-yearly">অর্ধবার্ষিক পরীক্ষা</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">শিক্ষাবর্ষ</label>
                      <select 
                        value={resultYear}
                        onChange={(e) => setResultYear(e.target.value)}
                        className="w-full text-xs font-bold border border-slate-200 rounded-xl p-2.5 bg-slate-50 outline-none"
                      >
                        <option value="2024-2025">২০২৪-২০২৫</option>
                        <option value="2023-2024">২০২৩-২০২৪</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">শ্রেণি</label>
                      <select 
                        value={resultClass}
                        onChange={(e) => setResultClass(e.target.value)}
                        className="w-full text-xs font-bold border border-slate-200 rounded-xl p-2.5 bg-slate-50 outline-none"
                      >
                        <option value="alim">আলিম</option>
                        <option value="dakhil">দাখিল</option>
                        <option value="hifz">হিফজ</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <div className="flex-1 space-y-1">
                      <label className="text-xs font-bold text-slate-700">রোল নম্বর / শিক্ষার্থী আইডি</label>
                      <input 
                        type="text" 
                        value={rollQuery}
                        onChange={(e) => setRollQuery(e.target.value)}
                        placeholder="রোল নম্বর লিখুন (উদা: ১০১)"
                        className="w-full text-xs font-bold border border-slate-200 rounded-xl p-2.5 bg-slate-50 outline-none focus:ring-2 ring-emerald-500"
                      />
                    </div>
                    <div className="flex items-end">
                      <button 
                        type="submit"
                        className="w-full sm:w-auto px-6 py-2.5 bg-[#07442f] hover:bg-[#09573c] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer h-10"
                      >
                        ফলাফল দেখুন
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Marksheet Card (Matches Tamim Uddin mark sheet in Panel 5) */}
              {foundStudentResult && foundStudentResult !== 'not_found' && (
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
                  <div className="border-b border-slate-100 pb-3">
                    <h4 className="text-lg font-black text-[#07442f]">ফলাফল</h4>
                  </div>

                  {/* Student Info */}
                  <div className="space-y-1 text-xs text-slate-700">
                    <p><span className="font-bold text-slate-900">নাম:</span> {foundStudentResult.name}</p>
                    <p><span className="font-bold text-slate-900">শ্রেণি:</span> {foundStudentResult.class}</p>
                    <p><span className="font-bold text-slate-900">রোল:</span> {foundStudentResult.roll}</p>
                    <p><span className="font-bold text-slate-900">পরীক্ষার ধরন:</span> {foundStudentResult.exam}</p>
                    <p><span className="font-bold text-slate-900">প্রাপ্ত নম্বর:</span> {foundStudentResult.totalMarks}</p>
                  </div>

                  {/* Marksheet Table */}
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#07442f] text-white font-bold">
                        <tr>
                          <th className="p-3">বিষয়</th>
                          <th className="p-3 text-center">পূর্ণ নম্বর</th>
                          <th className="p-3 text-center">প্রাপ্ত নম্বর</th>
                          <th className="p-3 text-center">গ্রেড</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {foundStudentResult.subjects.map((sub: any, i: number) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="p-3 font-bold text-slate-800">{sub.name}</td>
                            <td className="p-3 text-center font-mono">{sub.full}</td>
                            <td className="p-3 text-center font-mono font-bold text-[#07442f]">{sub.obtained}</td>
                            <td className="p-3 text-center font-mono font-bold">{sub.grade}</td>
                          </tr>
                        ))}
                        <tr className="bg-emerald-50/80 font-black text-slate-900">
                          <td className="p-3">মোট নম্বর</td>
                          <td className="p-3 text-center font-mono">{foundStudentResult.totalFull}</td>
                          <td className="p-3 text-center font-mono text-[#07442f]">{foundStudentResult.totalObtained}</td>
                          <td className="p-3 text-center font-mono text-[#07442f]">GPA: {foundStudentResult.gpa}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Print Button */}
                  <div className="pt-2">
                    <button 
                      onClick={() => window.print()}
                      className="px-5 py-2.5 bg-[#07442f] hover:bg-[#09573c] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Printer size={14} />
                      <span>প্রিন্ট করুন</span>
                    </button>
                  </div>
                </div>
              )}

              {foundStudentResult === 'not_found' && (
                <div className="p-6 bg-red-50 text-red-700 rounded-2xl border border-red-200 text-xs font-bold text-center">
                  দুঃখিত, কোনো ফলাফল খুঁজে পাওয়া যায়নি। রোল নম্বর সঠিক কিনা যাচাই করুন।
                </div>
              )}

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PANEL 6: GALLERY (গ্যালারি)                                */}
        {/* ========================================================= */}
        {activeTab === 'gallery' && (
          <div className="pb-16 animate-in fade-in duration-300">
            {/* Top Banner (Matches Panel 6) */}
            <div className="bg-[#07442f] text-white py-12 px-4 border-b-4 border-amber-500 relative overflow-hidden">
              <div className="max-w-7xl mx-auto flex justify-between items-center relative z-10">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black">ফটো ও ভিডিও গ্যালারি</h2>
                  <p className="text-xs text-emerald-200 mt-1 font-semibold">হোম &gt; গ্যালারি</p>
                </div>
                <div className="w-28 h-20 rounded-xl overflow-hidden border border-emerald-500/50 hidden sm:block">
                  <img src="https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=300&h=200&fit=crop" alt="Campus" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
              
              {/* Category Filters matching Panel 6 */}
              <div className="flex flex-wrap gap-2 justify-center">
                {['সকল', 'অনুষ্ঠান', 'হিফজ কার্যক্রম', 'ক্রীড়া', 'অন্যান্য'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setGalleryCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      galleryCategory === cat
                        ? 'bg-[#07442f] text-white shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* 6 Photo Cards Grid (2 rows of 3) matching Panel 6 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {GALLERY_PHOTOS
                  .filter(img => galleryCategory === 'সকল' || img.category === galleryCategory)
                  .map(img => (
                    <div 
                      key={img.id}
                      onClick={() => setSelectedImage(img)}
                      className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all cursor-pointer group"
                    >
                      <div className="h-52 overflow-hidden bg-slate-100">
                        <img 
                          src={img.url} 
                          alt={img.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-4">
                        <h4 className="font-bold text-sm text-slate-900 group-hover:text-[#07442f] transition-colors">
                          {img.title}
                        </h4>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Pagination matching Panel 6: [ 1 ] [ 2 ] [ 3 ] [ > ] */}
              <div className="flex justify-center items-center gap-2 pt-4">
                <button className="w-8 h-8 rounded-lg bg-[#07442f] text-white font-bold text-xs flex items-center justify-center">1</button>
                <button className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs flex items-center justify-center">2</button>
                <button className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs flex items-center justify-center">3</button>
                <button className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs flex items-center justify-center">&gt;</button>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PANEL 7: TEACHERS (শিক্ষকবৃন্দ)                            */}
        {/* ========================================================= */}
        {activeTab === 'teachers' && (
          <div className="pb-16 animate-in fade-in duration-300">
            {/* Top Banner (Matches Panel 7) */}
            <div className="bg-[#07442f] text-white py-12 px-4 border-b-4 border-amber-500 relative overflow-hidden">
              <div className="max-w-7xl mx-auto flex justify-between items-center relative z-10">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black">শিক্ষকবৃন্দ</h2>
                  <p className="text-xs text-emerald-200 mt-1 font-semibold">হোম &gt; শিক্ষকবৃন্দ</p>
                </div>
                <div className="w-28 h-20 rounded-xl overflow-hidden border border-emerald-500/50 hidden sm:block">
                  <img src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=300&h=200&fit=crop" alt="Teachers" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
              
              {/* Search & Filter bar matching Panel 7 */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <input 
                    type="text" 
                    value={teacherSearch}
                    onChange={(e) => setTeacherSearch(e.target.value)}
                    placeholder="শিক্ষকের নাম লিখুন..." 
                    className="w-full text-xs font-bold border border-slate-200 rounded-xl p-2.5 bg-slate-50 outline-none"
                  />
                </div>
                <div className="sm:w-48">
                  <select 
                    value={teacherDept}
                    onChange={(e) => setTeacherDept(e.target.value)}
                    className="w-full text-xs font-bold border border-slate-200 rounded-xl p-2.5 bg-slate-50 outline-none"
                  >
                    <option value="All">সব বিভাগ</option>
                    <option value="প্রশাসন">প্রশাসন</option>
                    <option value="হাদিস">হাদিস বিভাগ</option>
                    <option value="ফিকহ">ফিকহ বিভাগ</option>
                    <option value="আরবি">আরবি বিভাগ</option>
                    <option value="ইংরেজি">ইংরেজি বিভাগ</option>
                  </select>
                </div>
              </div>

              {/* 6 Teacher Cards (2 rows of 3) matching Panel 7 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {TEACHERS_LIST
                  .filter(t => teacherDept === 'All' || t.dept.includes(teacherDept))
                  .filter(t => !teacherSearch || t.name.toLowerCase().includes(teacherSearch.toLowerCase()))
                  .map(teacher => (
                    <div 
                      key={teacher.id}
                      className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all text-center space-y-4 group flex flex-col justify-between"
                    >
                      <div>
                        <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-emerald-100 shadow-md group-hover:border-[#07442f] transition-colors mb-3">
                          <img src={teacher.photo} alt={teacher.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </div>
                        <h4 className="text-base font-black text-slate-900 group-hover:text-[#07442f] transition-colors">
                          {teacher.name}
                        </h4>
                        <p className="text-xs font-bold text-emerald-800 mt-0.5">{teacher.designation}</p>
                      </div>

                      <div className="pt-2">
                        <button 
                          onClick={() => setSelectedTeacher(teacher)}
                          className="w-full py-2 bg-[#07442f] hover:bg-[#09573c] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                        >
                          বিস্তারিত
                        </button>
                      </div>
                    </div>
                  ))}
              </div>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PANEL 8: CONTACT US (যোগাযোগ)                             */}
        {/* ========================================================= */}
        {activeTab === 'contact' && (
          <div className="pb-16 animate-in fade-in duration-300">
            {/* Top Banner (Matches Panel 8) */}
            <div className="bg-[#07442f] text-white py-12 px-4 border-b-4 border-amber-500 relative overflow-hidden">
              <div className="max-w-7xl mx-auto flex justify-between items-center relative z-10">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black">যোগাযোগ করুন</h2>
                  <p className="text-xs text-emerald-200 mt-1 font-semibold">হোম &gt; যোগাযোগ</p>
                </div>
                <div className="w-28 h-20 rounded-xl overflow-hidden border border-emerald-500/50 hidden sm:block">
                  <img src="https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=300&h=200&fit=crop" alt="Campus Building" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                
                {/* Left: যোগাযোগের তথ্য (Matches Panel 8) */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
                  <h3 className="text-xl font-black text-[#07442f] border-b border-slate-100 pb-3">
                    যোগাযোগের তথ্য
                  </h3>

                  <div className="space-y-4 text-xs">
                    <div className="flex items-start gap-3">
                      <MapPin size={18} className="text-[#07442f] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-800">গ্রাম: দক্ষিণপাড়া, ডাকঘর: মাধবপুর,</span>
                        <p className="text-slate-600 mt-0.5">উপজেলা: মাধবপুর, জেলা: হবিগঞ্জ</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone size={18} className="text-[#07442f] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-800 font-mono">০১৭১২-০৪০৬৭৪</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Mail size={18} className="text-[#07442f] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-800 font-mono">info@alaminmadrasa.edu.bd</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock size={18} className="text-[#07442f] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-800">সকাল ৮:০০ - বিকাল ৪:০০ (শুক্রবার বাদে)</span>
                      </div>
                    </div>
                  </div>

                  {/* Map Preview Box matching Panel 8 */}
                  <div className="rounded-2xl overflow-hidden border border-slate-200 h-48 bg-slate-100 relative">
                    <img 
                      src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=400&fit=crop" 
                      alt="Madrasa Location Map"
                      className="w-full h-full object-cover opacity-75"
                    />
                    <div className="absolute inset-0 bg-[#07442f]/20 flex items-center justify-center">
                      <span className="bg-white text-[#07442f] px-3.5 py-1.5 rounded-full text-xs font-bold shadow-md flex items-center gap-1.5">
                        <MapPin size={14} className="text-red-500" />
                        <span>আল-আমিন ইসলামিয়া মাদ্রাসা</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: বার্তা পাঠান Form (Matches Panel 8) */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-xl font-black text-[#07442f] border-b border-slate-100 pb-3">
                    বার্তা পাঠান
                  </h3>

                  {contactSuccess ? (
                    <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-6 rounded-2xl text-center space-y-2">
                      <CheckCircle2 size={36} className="mx-auto text-emerald-600" />
                      <h4 className="text-base font-black">আপনার বার্তা সফলভাবে পাঠানো হয়েছে!</h4>
                      <p className="text-xs text-slate-600">মাদ্রাসা কর্তৃপক্ষ শীঘ্রই আপনার সাথে যোগাযোগ করবে।</p>
                    </div>
                  ) : (
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        setContactSuccess(true);
                      }}
                      className="space-y-4 text-xs"
                    >
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">নাম *</label>
                        <input 
                          type="text" 
                          required
                          value={contactForm.name}
                          onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                          className="w-full p-2.5 font-semibold border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-2 ring-emerald-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">ইমেইল *</label>
                        <input 
                          type="email" 
                          required
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                          className="w-full p-2.5 font-semibold border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-2 ring-emerald-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">মোবাইল নম্বর</label>
                        <input 
                          type="text" 
                          value={contactForm.phone}
                          onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                          className="w-full p-2.5 font-semibold border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-2 ring-emerald-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">বিষয়</label>
                        <input 
                          type="text" 
                          value={contactForm.subject}
                          onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                          className="w-full p-2.5 font-semibold border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-2 ring-emerald-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">আপনার বার্তা *</label>
                        <textarea 
                          rows={4}
                          required
                          value={contactForm.message}
                          onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                          className="w-full p-2.5 font-semibold border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-2 ring-emerald-500"
                        />
                      </div>

                      <button 
                        type="submit"
                        className="w-full py-3 bg-[#07442f] hover:bg-[#09573c] text-white font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Send size={14} />
                        <span>বার্তা পাঠান</span>
                      </button>
                    </form>
                  )}
                </div>

            </div>
          </div>
        </div>
        )}

        {/* ========================================================= */}
        {/* PANEL 9: ADMIN LOGIN (মাদ্রাসা অ্যাডমিন লগইন)               */}
        {/* ========================================================= */}
        {activeTab === 'admin-login' && (
          <div className="relative min-h-[75vh] flex items-center justify-center p-4">
            <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-8 space-y-6 text-center">
              <div className="space-y-2">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 border-2 border-[#07442f] flex items-center justify-center shadow-md">
                  <Compass size={28} className="text-[#07442f]" />
                </div>
                <h3 className="text-lg font-black text-[#07442f] leading-tight">
                  আল-আমিন ইসলামিয়া মাদ্রাসা
                </h3>
                <p className="text-xs text-slate-400 font-semibold">Al-Amin Islamiya Madrasa</p>
                <div className="pt-2">
                  <span className="bg-emerald-100 text-[#07442f] text-xs font-black uppercase px-3 py-1 rounded-full">
                    মাদ্রাসা অ্যাডমিন লগইন
                  </span>
                </div>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">ইউজারনেম / ইমেইল</label>
                  <input 
                    type="text" 
                    required
                    value={adminUsername}
                    onChange={e => setAdminUsername(e.target.value)}
                    placeholder="admin@alaminmadrasa.edu.bd" 
                    className="w-full p-2.5 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-2 ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">পাসওয়ার্ড</label>
                  <input 
                    type="password" 
                    required
                    value={adminPassword}
                    onChange={e => setAdminPassword(e.target.value)}
                    placeholder="পাসওয়ার্ড দিন" 
                    className="w-full p-2.5 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-2 ring-emerald-500"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-[#07442f] hover:bg-[#09573c] text-white font-black py-3 rounded-xl text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Lock size={15} />
                  <span>লগইন করুন</span>
                </button>
              </form>

              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                © ২০২৪ আল-আমিন ইসলামিয়া মাদ্রাসা. সর্বস্বত্ব সংরক্ষিত।
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PANEL 10: PORTAL (শিক্ষার্থী ও অভিভাবক পোর্টাল)             */}
        {/* ========================================================= */}
        {activeTab === 'portal' && (
          <div className="max-w-4xl mx-auto px-4 py-12 space-y-8 animate-in fade-in duration-300">
            <div className="text-center space-y-2 border-b border-slate-200 pb-5">
              <span className="text-xs font-black uppercase tracking-wider text-[#07442f]">
                আল-আমিন ইসলামিয়া মাদ্রাসা
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                শিক্ষার্থী ও অভিভাবক ডিজিটাল পোর্টাল
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Student Login */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#07442f] flex items-center justify-center">
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">শিক্ষার্থী লগইন</h3>
                    <p className="text-[11px] text-slate-400">হিফজ ও কিতাব বিভাগ</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">রোল নং / আইডি</label>
                    <input 
                      type="text" 
                      defaultValue="১০১"
                      className="w-full p-2.5 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">পাসওয়ার্ড</label>
                    <input 
                      type="password" 
                      defaultValue="student123"
                      className="w-full p-2.5 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50 outline-none"
                    />
                  </div>
                  <button 
                    onClick={() => {
                      login(UserRole.STUDENT, {
                        name: 'মোঃ তামিম উদ্দিন',
                        studentRoll: '১০১',
                        studentClass: 'আলিম',
                        role: UserRole.STUDENT,
                        tenantName: 'আল-আমিন ইসলামিয়া মাদ্রাসা',
                        tenantId: 'al-amin',
                        tenantSubdomain: 'al-amin'
                      });
                      navigate('/student');
                    }}
                    className="w-full bg-[#07442f] hover:bg-[#09573c] text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition-all cursor-pointer"
                  >
                    লগইন
                  </button>
                </div>
              </div>

              {/* Parent Login */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                    <Users size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">অভিভাবক লগইন</h3>
                    <p className="text-[11px] text-slate-400">অভিভাবক মনিটরিং পোর্টাল</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">মোবাইল নম্বর</label>
                    <input 
                      type="text" 
                      defaultValue="01712345678"
                      className="w-full p-2.5 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">পাসওয়ার্ড</label>
                    <input 
                      type="password" 
                      defaultValue="parent123"
                      className="w-full p-2.5 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50 outline-none"
                    />
                  </div>
                  <button 
                    onClick={() => {
                      login(UserRole.PARENT, {
                        name: 'মোঃ শামসুল হক (অভিভাবক)',
                        role: UserRole.PARENT,
                        guardianName: 'মোঃ শামসুল হক',
                        tenantName: 'আল-আমিন ইসলামিয়া মাদ্রাসা',
                        tenantId: 'al-amin',
                        tenantSubdomain: 'al-amin'
                      });
                      navigate('/parent');
                    }}
                    className="w-full bg-teal-800 hover:bg-teal-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition-all cursor-pointer"
                  >
                    লগইন
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* 3. FOOTER (MATCHES MOCKUP BOARD EXACTLY: DEEP GREEN WITH LOGO, ADDRESS, IMPORTANT LINKS, COPYRIGHT & SCROLL ARROW) */}
      <footer className="bg-[#07442f] text-white border-t border-emerald-800/80 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-between">
            
            {/* Left: Logo + Address */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-800 text-amber-300 flex items-center justify-center font-bold text-lg border border-emerald-600">
                  <Compass size={20} />
                </div>
                <div>
                  <h4 className="font-black text-base text-white">আল-আমিন ইসলামিয়া মাদ্রাসা</h4>
                  <p className="text-[11px] text-emerald-200">Al-Amin Islamiya Madrasa</p>
                </div>
              </div>
              <p className="text-xs text-emerald-100/80 leading-relaxed pt-1">
                গ্রাম: দক্ষিণপাড়া, ডাকঘর: মাধবপুর, উপজেলা: মাধবপুর, জেলা: হবিগঞ্জ
              </p>
            </div>

            {/* Right: গুরুত্বপূর্ণ লিঙ্ক */}
            <div className="md:text-right space-y-2">
              <h5 className="font-black text-xs uppercase tracking-wider text-amber-300">গুরুত্বপূর্ণ লিঙ্ক</h5>
              <div className="flex flex-wrap md:justify-end gap-4 text-xs font-bold text-emerald-100">
                <button onClick={() => handleTabChange('admission')} className="hover:text-amber-300 transition-colors">🔗 ভর্তি</button>
                <button onClick={() => handleTabChange('results')} className="hover:text-amber-300 transition-colors">🔗 ফলাফল</button>
                <button onClick={() => handleTabChange('home')} className="hover:text-amber-300 transition-colors">🔗 নোটিশ</button>
                <button onClick={() => handleTabChange('contact')} className="hover:text-amber-300 transition-colors">🔗 যোগাযোগ</button>
              </div>
            </div>

          </div>

          {/* Bottom Copyright Bar with Up Arrow */}
          <div className="border-t border-emerald-800/60 mt-8 pt-4 flex justify-between items-center text-[11px] text-emerald-200">
            <span>© ২০২৪ আল-আমিন ইসলামিয়া মাদ্রাসা. সর্বস্বত্ব সংরক্ষিত।</span>
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-8 h-8 rounded-full bg-emerald-800 hover:bg-emerald-700 text-white flex items-center justify-center border border-emerald-600 cursor-pointer shadow-xs"
              title="উপরে যান"
            >
              ^
            </button>
          </div>
        </div>
      </footer>

      {/* ONLINE ADMISSION MODAL */}
      {isAdmissionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto p-4 sm:p-6 relative shadow-2xl">
            <button 
              onClick={() => setIsAdmissionModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-500 z-10 cursor-pointer"
            >
              <X size={20} />
            </button>
            <StudentAdmissionForm 
              tenant={currentTenant}
              institutionType="Madrasa"
              onClose={() => setIsAdmissionModalOpen(false)}
              onComplete={() => setIsAdmissionModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* TEACHER DETAIL MODAL */}
      {selectedTeacher && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 relative text-center space-y-4">
            <button 
              onClick={() => setSelectedTeacher(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-500"
            >
              <X size={20} />
            </button>
            <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-emerald-600 shadow-md">
              <img src={selectedTeacher.photo} alt={selectedTeacher.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h4 className="text-lg font-black text-slate-900">{selectedTeacher.name}</h4>
              <p className="text-xs font-bold text-emerald-800">{selectedTeacher.designation}</p>
              <p className="text-xs text-slate-500 mt-1">{selectedTeacher.dept}</p>
            </div>
            <div className="text-left bg-slate-50 p-4 rounded-2xl text-xs space-y-1.5 border border-slate-200">
              <p><span className="font-bold text-slate-800">শিক্ষাগত যোগ্যতা:</span> {selectedTeacher.qualification}</p>
              <p><span className="font-bold text-slate-800">অভিজ্ঞতা:</span> {selectedTeacher.experience}</p>
            </div>
          </div>
        </div>
      )}

      {/* NOTICE DETAIL MODAL */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 relative space-y-3">
            <button 
              onClick={() => setSelectedNotice(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-500"
            >
              <X size={20} />
            </button>
            <span className="text-[10px] bg-emerald-100 text-[#07442f] px-2.5 py-0.5 rounded-full font-bold">নোটিশ</span>
            <h4 className="text-base font-black text-slate-900">{selectedNotice.title}</h4>
            <p className="text-xs text-slate-500 font-mono">তারিখ: {selectedNotice.date}</p>
            <p className="text-xs text-slate-700 leading-relaxed pt-2 border-t border-slate-100">{selectedNotice.desc}</p>
          </div>
        </div>
      )}

      {/* PHOTO PREVIEW MODAL */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-4 relative space-y-3">
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              <X size={18} />
            </button>
            <div className="rounded-2xl overflow-hidden max-h-[70vh]">
              <img src={selectedImage.url} alt={selectedImage.title} className="w-full h-full object-contain" />
            </div>
            <div className="p-2">
              <h4 className="font-black text-sm text-slate-900">{selectedImage.title}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{selectedImage.desc}</p>
            </div>
          </div>
        </div>
      )}

      {/* FOUNDER MODAL */}
      {founderModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 relative space-y-4 text-center">
            <button onClick={() => setFounderModalOpen(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-500">
              <X size={20} />
            </button>
            <h4 className="text-lg font-black text-[#07442f]">প্রতিষ্ঠাতার পরিচিতি</h4>
            <div className="w-20 h-20 mx-auto rounded-xl overflow-hidden border-2 border-emerald-600">
              <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop" alt="Founder" className="w-full h-full object-cover" />
            </div>
            <h5 className="font-bold text-sm">মাওলানা মুফতি শফিউল্লাহ</h5>
            <p className="text-xs text-slate-600 leading-relaxed text-left">
              মাওলানা মুফতি শফিউল্লাহ ১৯৯৮ সালে এই দ্বীনি প্রতিষ্ঠান গড়ে তোলেন। তাঁর ঐকান্তিক শ্রম ও ধর্মীয় মূল্যবোধের ভিত্তিতে প্রতিষ্ঠানটি আজ এই অঞ্চলের অন্যতম প্রধান মাদ্রাসা হিসেবে স্বীকৃত।
            </p>
          </div>
        </div>
      )}

      {/* GOVERNING BODY MODAL */}
      {governingBodyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 relative space-y-4">
            <button onClick={() => setGoverningBodyModalOpen(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-500">
              <X size={20} />
            </button>
            <h4 className="text-lg font-black text-[#07442f]">পরিচালনা পর্ষদ</h4>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block">সভাপতি: আলহাজ্ব নূরুল হক সাহেব</span>
                <span className="text-[11px] text-slate-500">বিশিষ্ট শিক্ষানুরাগী ও সমাজসেবক</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block">সাধারণ সম্পাদক: মোঃ জহিরুল ইসলাম</span>
                <span className="text-[11px] text-slate-500">মাদ্রাসার প্রশাসনিক সমন্বয়ক</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ACHIEVEMENTS MODAL */}
      {achievementsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 relative space-y-4">
            <button onClick={() => setAchievementsModalOpen(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-500">
              <X size={20} />
            </button>
            <h4 className="text-lg font-black text-[#07442f]">প্রতিষ্ঠানের সাফল্য</h4>
            <div className="space-y-2.5 text-xs text-slate-700">
              <p>✓ জাতীয় হিফজুল কুরআন প্রতিযোগিতায় জেলা ও বিভাগীয় পর্যায়ে প্রথম স্থান।</p>
              <p>✓ বাংলাদেশ মাদ্রাসা শিক্ষা বোর্ডে শতভাগ পাসের গৌরব ও গোল্ডেন জিপিএ-৫।</p>
              <p>✓ দরিদ্র ও এতিম শিক্ষার্থীদের ১০০% ফ্রি স্কলারশিপ ও লিল্লাহ খাদ্য সহায়তা।</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
