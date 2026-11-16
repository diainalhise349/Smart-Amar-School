import React, { useState, useEffect } from 'react';
import { 
  Phone, Mail, MapPin, Calendar, Clock, Search, BookOpen, Award, 
  Users, ChevronRight, CheckCircle2, Check, ArrowRight, ShieldCheck, 
  Star, FileText, Menu, X, Printer, User, Globe, Lock, BookMarked, 
  Compass, HeartHandshake, Sparkles, Building2, Bell, AlertCircle, Send,
  GraduationCap, Download, Layers, FlaskConical, Laptop, School,
  ExternalLink, Library, Microscope
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole, Tenant } from '../types';
import { StudentAdmissionForm } from './StudentAdmissionForm';

export type UniversityPageTab = 
  | 'home' 
  | 'about' 
  | 'faculties' 
  | 'admissions' 
  | 'results' 
  | 'research' 
  | 'faculty' 
  | 'campus' 
  | 'notices' 
  | 'contact' 
  | 'portal';

interface UniversityWebsiteProps {
  initialTab?: UniversityPageTab;
  tenant?: Tenant;
  showSwitcher?: boolean;
}

export const UniversityWebsite: React.FC<UniversityWebsiteProps> = ({ 
  initialTab = 'home',
  tenant,
  showSwitcher = false
}) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState<UniversityPageTab>(initialTab);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lang, setLang] = useState<'bn' | 'en'>('bn');

  // Modals & Interactive States
  const [isAdmissionModalOpen, setIsAdmissionModalOpen] = useState(false);
  const [selectedFacultyMember, setSelectedFacultyMember] = useState<any | null>(null);
  const [selectedNotice, setSelectedNotice] = useState<any | null>(null);

  // University Filter States
  const [activeFacultyFilter, setActiveFacultyFilter] = useState<'all' | 'engineering' | 'business' | 'law' | 'arts'>('all');
  const [semesterFilter, setSemesterFilter] = useState('Spring 2024');

  // University CGPA Result Search
  const [studentIdQuery, setStudentIdQuery] = useState('DIU-211-15-401');
  const [foundUniResult, setFoundUniResult] = useState<any | null>({
    studentId: 'DIU-211-15-401',
    name: 'তানভীর আহমেদ নিলয়',
    program: 'B.Sc. in Computer Science & Engineering (CSE)',
    faculty: 'Faculty of Science & Engineering',
    semester: '8th Semester (Final)',
    cgpa: '৩.৮৮',
    creditsEarned: '১৪৪/১৪৪',
    status: 'Graduated with Distinction',
    courses: [
      { code: 'CSE-411', title: 'Artificial Intelligence & Neural Networks', credit: 3.0, grade: 'A+', gpa: '4.00' },
      { code: 'CSE-412', title: 'Distributed Systems & Cloud Computing', credit: 3.0, grade: 'A', gpa: '3.75' },
      { code: 'CSE-413', title: 'Software Engineering & Design Patterns', credit: 3.0, grade: 'A+', gpa: '4.00' },
      { code: 'CSE-499', title: 'Senior Capstone Project & Defense', credit: 6.0, grade: 'A+', gpa: '4.00' }
    ]
  });

  // University ERP Login Form
  const [erpId, setErpId] = useState('DIU-STUDENT-2024');
  const [erpPassword, setErpPassword] = useState('uni123');

  // Contact Form
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Tenant / University Metadata
  const currentTenant: Tenant = tenant || {
    id: 'diu',
    name: 'ঢাকা ইন্টারন্যাশনাল ইউনিভার্সিটি (DIU)',
    type: 'University',
    subdomain: 'diu',
    customDomain: 'diu.ac.bd',
    logoUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=200&h=200&fit=crop',
    status: 'Active',
    studentsCount: 3850,
    maxStudents: 8000,
    plan: 'Premium',
    revenue: 120000,
    enabledModules: ['academic', 'finance', 'hr', 'exams', 'portal', 'library', 'admissions', 'research'],
    eiin: '190456',
    code: 'DIU-1995',
    contactPhone: '+880 1713-456789',
    contactEmail: 'admissions@diu.ac.bd',
    address: 'স্থায়ী ক্যাম্পাস: বাড়ি #৪, রোড #১, ব্লক #এফ, বনশ্রী, ঢাকা-১২১৯, বাংলাদেশ',
    establishedYear: '1995',
    principalName: 'প্রফেসর ড. মুহাম্মদ শাহ আলম (উপাচার্য)'
  };

  const uniName = currentTenant.name;
  const uniPhone = currentTenant.contactPhone || '+৮৮০ ১৭১৩-৪৫৬৭৮৯';
  const uniEmail = currentTenant.contactEmail || 'admissions@diu.ac.bd';
  const uniAddress = currentTenant.address || 'স্থায়ী ক্যাম্পাস: বাড়ি #৪, রোড #১, ব্লক #এফ, বনশ্রী, ঢাকা-১২১৯, বাংলাদেশ';
  const establishedYear = currentTenant.establishedYear || '১৯৯৫';
  const vcName = currentTenant.principalName || 'প্রফেসর ড. মুহাম্মদ শাহ আলম (উপাচার্য)';
  const uniCode = currentTenant.code || 'DIU-1995';

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleTabChange = (tab: UniversityPageTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCgpaSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentIdQuery.trim().toUpperCase().includes('DIU') || studentIdQuery.trim().includes('401') || studentIdQuery.trim().length > 3) {
      setFoundUniResult({
        studentId: studentIdQuery.trim().toUpperCase(),
        name: 'তানভীর আহমেদ নিলয়',
        program: 'B.Sc. in Computer Science & Engineering (CSE)',
        faculty: 'Faculty of Science & Engineering',
        semester: '8th Semester (Final)',
        cgpa: '৩.৮৮',
        creditsEarned: '১৪৪/১৪৪',
        status: 'Active Student (Regular)',
        courses: [
          { code: 'CSE-411', title: 'Artificial Intelligence & Neural Networks', credit: 3.0, grade: 'A+', gpa: '4.00' },
          { code: 'CSE-412', title: 'Distributed Systems & Cloud Computing', credit: 3.0, grade: 'A', gpa: '3.75' },
          { code: 'CSE-413', title: 'Software Engineering & Design Patterns', credit: 3.0, grade: 'A+', gpa: '4.00' },
          { code: 'CSE-499', title: 'Senior Capstone Project & Defense', credit: 6.0, grade: 'A+', gpa: '4.00' }
        ]
      });
    } else {
      setFoundUniResult('not_found');
    }
  };

  const handleErpLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(erpId, erpPassword, UserRole.STUDENT);
    navigate('/student/dashboard');
  };

  // University Faculties & Programs
  const FACULTIES_DATA = [
    {
      id: 'engineering',
      facultyName: 'Faculty of Science & Engineering',
      dean: 'প্রফেসর ড. এ.টি.এম. মাহবুবুর রহমান',
      desc: 'আইইবি (IEB) অ্যাক্রিডিটেড আধুনিক ল্যাব, রোবোটিক্স সেন্টার ও ইন্ডাস্ট্রিয়াল ট্রেনিং সুবিধা।',
      programs: [
        { name: 'B.Sc. in Computer Science & Engineering (CSE)', credit: '144 Credits', duration: '4 Years (8 Semesters)' },
        { name: 'B.Sc. in Electrical & Electronic Engineering (EEE)', credit: '144 Credits', duration: '4 Years (8 Semesters)' },
        { name: 'B.Sc. in Civil Engineering (CE)', credit: '150 Credits', duration: '4 Years (8 Semesters)' },
        { name: 'Bachelor of Pharmacy (B.Pharm - Professional)', credit: '160 Credits', duration: '4 Years (PCB Approved)' }
      ]
    },
    {
      id: 'business',
      facultyName: 'Faculty of Business Studies',
      dean: 'প্রফেসর এম. এ. জলিল খান',
      desc: 'করপোরেট ক্যারিয়ার গঠন ও গ্লোবাল বিজনেসের জন্য প্র্যাকটিক্যাল কেস স্টাডি ভিত্তিক শিক্ষা।',
      programs: [
        { name: 'Bachelor of Business Administration (BBA)', credit: '126 Credits', duration: '4 Years (Major: Finance, HRM, Marketing)' },
        { name: 'Master of Business Administration (MBA - Regular & Executive)', credit: '60/36 Credits', duration: '1-2 Years' }
      ]
    },
    {
      id: 'law',
      facultyName: 'Faculty of Law',
      dean: 'প্রফেসর ড. রফিকুল আলম মজুমদার',
      desc: 'বার কাউন্সিল সনদপ্রাপ্ত বাংলাদেশ ও আন্তর্জাতিক আইনের শীর্ষ অনুষদ এবং মুট কোর্ট চর্চা কেন্দ্র।',
      programs: [
        { name: 'Bachelor of Laws (LL.B Hons)', credit: '136 Credits', duration: '4 Years' },
        { name: 'Master of Laws (LL.M)', credit: '36 Credits', duration: '1 Year' }
      ]
    },
    {
      id: 'arts',
      facultyName: 'Faculty of Arts & Social Sciences',
      dean: 'ড. ফারহানা হক',
      desc: 'ভাষা সাহিত্য, সমাজতত্ত্ব ও মানবিক মূল্যবোধ বিকাশের আধুনিক উচ্চশিক্ষা অনুষদ।',
      programs: [
        { name: 'B.A. (Hons) in English Literature & Linguistics', credit: '124 Credits', duration: '4 Years' },
        { name: 'M.A. in English', credit: '36 Credits', duration: '1 Year' },
        { name: 'Bachelor of Social Science in Sociology', credit: '120 Credits', duration: '4 Years' }
      ]
    }
  ];

  // University Professors & Faculty
  const UNIVERSITY_PROFESSORS = [
    {
      id: 'up1',
      name: 'প্রফেসর ড. মুহাম্মদ শাহ আলম',
      title: 'উপাচার্য (Vice-Chancellor)',
      dept: 'University Administration & Law',
      education: 'Ph.D in Law (UK), Post-Doc Fellow (Harvard Law)',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=faces'
    },
    {
      id: 'up2',
      name: 'প্রফেসর ড. এ.টি.এম. মাহবুবুর রহমান',
      title: 'ডিন ও অধ্যাপক',
      dept: 'Computer Science & Engineering',
      education: 'Ph.D (Computer Vision, Tokyo University), IEEE Senior Member',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=faces'
    },
    {
      id: 'up3',
      name: 'ড. নিশাত তামান্না',
      title: 'সহযোগী অধ্যাপক',
      dept: 'Electrical & Electronic Engineering',
      education: 'Ph.D in Renewable Energy (NUS Singapore)',
      photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=faces'
    },
    {
      id: 'up4',
      name: 'প্রফেসর ড. রফিকুল আলম মজুমদার',
      title: 'ডিন ও সিনিয়র অধ্যাপক',
      dept: 'Faculty of Law',
      education: 'Ph.D in International Jurisprudence, Advocate Supreme Court',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=faces'
    }
  ];

  // University Notices
  const UNIVERSITY_NOTICES = [
    {
      id: 'un1',
      title: 'Spring 2025 সেমিস্টারে আন্ডারগ্র্যাজুয়েট ও পোস্টগ্র্যাজুয়েট ভর্তি বিজ্ঞপ্তি',
      date: '০৫ নভেম্বর ২০২৪',
      category: 'অ্যাডমিশন',
      desc: 'সকল অনুষদে এসএসসি ও এইচএসসি ফলাফলের ভিত্তিতে ২০% থেকে ১০০% পর্যন্ত মেধাভিত্তিক টিউশন ফি স্কলারশিপসহ আবেদন গ্রহণ চলছে।'
    },
    {
      id: 'un2',
      title: 'Fall 2024 সেমিস্টার ফাইনাল পরীক্ষার চূড়ান্ত সময়সূচি প্রকাশ',
      date: '১২ অক্টোবর ২০২৪',
      category: 'পরীক্ষা',
      desc: 'কন্ট্রোলার অব এক্সামিনেশনস কার্যালয় থেকে সকল ডিপার্টমেন্টের সেমিস্টার ফাইনাল পরীক্ষার রুটিন প্রকাশ করা হয়েছে। প্রবেশপত্র পোর্টাল থেকে ডাউনলোড করা যাবে।'
    },
    {
      id: 'un3',
      title: 'International Conference on Computing and Smart Technologies (ICCST-2025)',
      date: '২৪ সেপ্টেম্বর ২০২৪',
      category: 'গবেষণা',
      desc: 'সিএসই অনুষদের উদ্যোগে আয়োজিত আন্তর্জাতিক গবেষণা সম্মেলনে পেপার সাবমিশনের শেষ তারিখ আগামী ১৫ ডিসেম্বর ২০২৪।'
    },
    {
      id: 'un4',
      title: '৬ষ্ঠ সমাবর্তন (6th Convocation) রেজিস্ট্রেশন বিজ্ঞপ্তি',
      date: '১০ সেপ্টেম্বর ২০২৪',
      category: 'সমাবর্তন',
      desc: '২০২০ থেকে ২০২৪ শিক্ষাবর্ষে ডিগ্রিপ্রাপ্ত গ্র্যাজুয়েটদের সমাবর্তন নিবন্ধনের শেষ তারিখ ৩১ ডিসেম্বর।'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased selection:bg-rose-900 selection:text-white">
      
      {/* 1. TOP UNIVERSITY GLOBAL BAR */}
      <div className="bg-rose-950 text-rose-100 text-xs py-2 px-4 border-b border-rose-900 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex flex-wrap items-center gap-4 text-[11px] font-medium">
            <span className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Phone size={13} className="text-amber-400" /> {uniPhone}
            </span>
            <span className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Mail size={13} className="text-amber-400" /> {uniEmail}
            </span>
            <span className="bg-rose-900/90 text-rose-200 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold border border-rose-800">
              UGC & Govt. Approved • Code: {uniCode}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleTabChange('results')} 
              className="hover:underline flex items-center gap-1 font-bold text-amber-300 cursor-pointer"
            >
              <Search size={13}/> সেমিস্টার সিজিপিএ (CGPA) রেজাল্ট
            </button>
            <span className="text-rose-800">|</span>
            <button 
              onClick={() => handleTabChange('portal')}
              className="bg-amber-400 text-slate-900 px-3 py-1 rounded-full font-black text-[11px] hover:bg-amber-300 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Lock size={12} className="text-rose-950"/> 
              <span>ইউনিভার্সিটি ইআরপি লগইন</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN UNIVERSITY HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="py-3.5 flex justify-between items-center gap-4">
            
            {/* Logo & University Name */}
            <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => handleTabChange('home')}>
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-rose-900 to-rose-950 flex items-center justify-center text-white shadow-md border-2 border-rose-100 shrink-0">
                <School size={28} className="text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                    {uniName}
                  </h1>
                  <span className="hidden sm:inline-block bg-rose-100 text-rose-900 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    বিশ্ববিদ্যালয়
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                  <MapPin size={12} className="text-slate-400" />
                  {uniAddress} • স্থাপিত {establishedYear}
                </p>
              </div>
            </div>

            {/* Desktop Navigation (STRICTLY UNIVERSITY OPTIONS) */}
            <nav className="hidden lg:flex items-center gap-1 text-xs font-bold text-slate-700">
              {[
                { id: 'home', label: 'হোম' },
                { id: 'about', label: 'বিশ্ববিদ্যালয় পরিচিতি' },
                { id: 'faculties', label: 'অনুষদ ও বিভাগ' },
                { id: 'admissions', label: 'ভর্তি ও ওয়েভার' },
                { id: 'results', label: 'সিজিপিএ রেজাল্ট' },
                { id: 'research', label: 'গবেষণা ও জার্নাল' },
                { id: 'faculty', label: 'প্রফেসর ও ফ্যাকাল্টি' },
                { id: 'campus', label: 'ক্যাম্পাস ও লাইব্রেরি' },
                { id: 'notices', label: 'বিজ্ঞপ্তি' },
                { id: 'contact', label: 'যোগাযোগ' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id as UniversityPageTab)}
                  className={`px-2.5 py-2 rounded-lg transition-all cursor-pointer ${
                    activeTab === item.id 
                      ? 'bg-rose-900 text-white font-black shadow-xs' 
                      : 'hover:bg-rose-50 text-slate-700 hover:text-rose-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => handleTabChange('portal')}
                className="ml-2 bg-gradient-to-r from-rose-900 to-rose-950 text-white px-3.5 py-2 rounded-lg font-bold shadow-xs hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Lock size={12} className="text-amber-400" />
                <span>ইআরপি</span>
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X size={24}/> : <Menu size={24}/>}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-slate-200 px-4 py-3 space-y-1">
            {[
              { id: 'home', label: 'হোম' },
              { id: 'about', label: 'বিশ্ববিদ্যালয় পরিচিতি' },
              { id: 'faculties', label: 'অনুষদ ও বিভাগ' },
              { id: 'admissions', label: 'ভর্তি ও ওয়েভার' },
              { id: 'results', label: 'সিজিপিএ রেজাল্ট' },
              { id: 'research', label: 'গবেষণা ও জার্নাল' },
              { id: 'faculty', label: 'প্রফেসর ও ফ্যাকাল্টি' },
              { id: 'campus', label: 'ক্যাম্পাস ও লাইব্রেরি' },
              { id: 'notices', label: 'বিজ্ঞপ্তি' },
              { id: 'contact', label: 'যোগাযোগ' },
              { id: 'portal', label: 'ইউনিভার্সিটি ইআরপি লগইন' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id as UniversityPageTab)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold ${
                  activeTab === item.id ? 'bg-rose-900 text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* 3. UNIVERSITY MAIN CONTENT */}
      <main>
        {/* TAB: HOME */}
        {activeTab === 'home' && (
          <div className="space-y-12 pb-16">
            {/* University Hero Section */}
            <section className="relative bg-gradient-to-br from-rose-950 via-slate-900 to-slate-950 text-white overflow-hidden py-16 sm:py-24">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f43f5e_1px,transparent_1px)] [background-size:16px_16px]"></div>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                  <div className="lg:col-span-7 space-y-5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-400/30">
                      <Sparkles size={14} className="text-amber-400" />
                      ইউজিসি স্থায়ী সনদপ্রাপ্ত ও আন্তর্জাতিক মানসম্পন্ন বিশ্ববিদ্যালয়
                    </span>
                    <h2 className="text-3xl sm:text-5xl font-black leading-tight tracking-tight text-white">
                      গবেষণা, উদ্ভাবন ও বিশ্বমানের উচ্চশিক্ষা
                    </h2>
                    <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                      ইঞ্জিনিয়ারিং, বিজনেস, আইন ও কলা অনুষদের অধীনে অত্যাধুনিক গবেষণাগার, আন্তর্জাতিক শিক্ষক প্যানেল এবং ইন্ডাস্ট্রিয়াল ইন্টার্নশিপের মাধ্যমে বিশ্বমঞ্চে প্রতিষ্ঠিত হোন।
                    </p>
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button 
                        onClick={() => setIsAdmissionModalOpen(true)}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-700 to-rose-900 hover:from-rose-600 hover:to-rose-800 text-white font-black text-sm shadow-lg shadow-rose-950/50 flex items-center gap-2 cursor-pointer transition-all"
                      >
                        <FileText size={16} />
                        <span>অনলাইন ভর্তি আবেদন</span>
                        <ArrowRight size={16} />
                      </button>
                      <button 
                        onClick={() => handleTabChange('faculties')}
                        className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 flex items-center gap-2 cursor-pointer transition-all"
                      >
                        <BookOpen size={16} />
                        <span>ডিগ্রি প্রোগ্রামসমূহ</span>
                      </button>
                    </div>
                  </div>

                  {/* University Stats Card */}
                  <div className="lg:col-span-5">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-white shadow-2xl space-y-6">
                      <div className="flex items-center justify-between border-b border-white/10 pb-4">
                        <div>
                          <div className="text-xs uppercase font-bold tracking-wider text-rose-300">বিশ্ববিদ্যালয় পরিচিতি</div>
                          <div className="text-lg font-black text-white">{uniName}</div>
                        </div>
                        <span className="bg-amber-400/20 text-amber-300 text-xs px-2.5 py-1 rounded-full font-bold border border-amber-400/40">
                          স্থায়ী সনদপ্রাপ্ত
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-900/60 p-3.5 rounded-xl border border-white/10">
                          <div className="text-2xl font-black text-amber-400">৪টি</div>
                          <div className="text-xs text-slate-300 font-semibold mt-0.5">মূল অনুষদ (Faculties)</div>
                        </div>
                        <div className="bg-slate-900/60 p-3.5 rounded-xl border border-white/10">
                          <div className="text-2xl font-black text-emerald-400">১৫+</div>
                          <div className="text-xs text-slate-300 font-semibold mt-0.5">স্নাতক ও স্নাতকোত্তর ডিগ্রি</div>
                        </div>
                        <div className="bg-slate-900/60 p-3.5 rounded-xl border border-white/10">
                          <div className="text-2xl font-black text-rose-300">১০০%</div>
                          <div className="text-xs text-slate-300 font-semibold mt-0.5">পর্যন্ত মেধাভিত্তিক স্কলারশিপ</div>
                        </div>
                        <div className="bg-slate-900/60 p-3.5 rounded-xl border border-white/10">
                          <div className="text-2xl font-black text-blue-300">১২,০০০+</div>
                          <div className="text-xs text-slate-300 font-semibold mt-0.5">গ্লোবাল অ্যালামনাই নেটওয়ার্ক</div>
                        </div>
                      </div>
                      <div className="bg-rose-950/60 p-3 rounded-xl border border-rose-500/30 text-xs flex items-center gap-2">
                        <Bell size={16} className="text-amber-400 shrink-0" />
                        <span className="line-clamp-1">Spring 2025 সেমিস্টারে সরাসরি ভর্তি চলছে।</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* University 4 Pillars */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { icon: Microscope, title: 'গবেষণা ও প্রকাশনা', desc: 'স্কোপাস ইনডেক্সড জার্নাল ও গবেষণা ল্যাব।' },
                  { icon: Laptop, title: 'স্মার্ট ক্যাম্পাস ও ইআরপি', desc: 'সম্পূর্ণ অটোমেটেড স্টুডেন্ট পোর্টাল ও কোর্স রেজিস্ট্রেশন।' },
                  { icon: Library, title: 'কেন্দ্রীয় ডিজিটাল লাইব্রেরি', desc: '৫০,০০০+ ই-বুক, আন্তর্জাতিক জার্নাল ও ডাটাবেজ।' },
                  { icon: Award, title: 'ইন্টারন্যাশনাল অ্যাফিলিয়েশন', desc: 'যুক্তরাজ্য, মালয়েশিয়া ও জাপানের বিশ্ববিদ্যালয়ের সাথে ক্রেডিট ট্রান্সফার।' }
                ].map((item, i) => (
                  <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-900 flex items-center justify-center mb-3">
                      <item.icon size={20} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mb-1">{item.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* VC's Message Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-900 uppercase tracking-wider">
                    <Award size={15} />
                    <span>উপাচার্যের বাণী (Message from Vice-Chancellor)</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                    "চতুর্থ শিল্পবিপ্লবের চ্যালেঞ্জ মোকাবিলায় স্মার্ট নাগরিক গঠন"
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-5 items-start">
                    <img 
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=faces" 
                      alt="Vice-Chancellor" 
                      className="w-24 h-28 rounded-xl object-cover shadow-sm border border-slate-200 shrink-0" 
                    />
                    <div className="space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                      <p>
                        সম্মানিত শিক্ষক, শিক্ষার্থীবৃন্দ ও সুধীজন, {uniName} প্রতিষ্ঠার শুরু থেকেই উচ্চশিক্ষার মানোন্নয়ন ও গবেষণাধর্মী শিক্ষা বিস্তারে অবিচল। বৈশ্বিক প্রতিযোগিতায় টিকে থাকতে আমাদের শিক্ষার্থীরা যাতে কারিগরি দক্ষতা ও মানবিক গুণে সমৃদ্ধ হতে পারে, সেজন্য আমরা আধুনিক কারিকুলাম অনুসরণ করছি।
                      </p>
                      <p>
                        আমাদের নিজস্ব স্থায়ী ক্যাম্পাসে আধুনিক ল্যাব, কেন্দ্রীয় লাইব্রেরি ও বিশ্বমানের ফ্যাকাল্টির সহায়তায় আমরা এক নতুন সম্ভাবনার বাংলাদেশ নির্মাণ করছি।
                      </p>
                      <div className="pt-2">
                        <div className="font-black text-slate-900 text-sm">{vcName}</div>
                        <div className="text-xs text-rose-900 font-semibold">{uniName}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* University Notices */}
                <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase">
                      <Bell size={15} className="text-amber-500" />
                      <span>বিশ্ববিদ্যালয় নোটিশ বোর্ড</span>
                    </div>
                    <button 
                      onClick={() => handleTabChange('notices')} 
                      className="text-xs text-rose-900 font-bold hover:underline"
                    >
                      সকল নোটিশ →
                    </button>
                  </div>
                  <div className="space-y-3">
                    {UNIVERSITY_NOTICES.slice(0, 3).map((notice) => (
                      <div 
                        key={notice.id} 
                        onClick={() => setSelectedNotice(notice)}
                        className="p-3 rounded-xl bg-slate-50 hover:bg-rose-50/70 border border-slate-200/80 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                          <span className="bg-rose-100 text-rose-900 font-bold px-2 py-0.5 rounded text-[10px]">
                            {notice.category}
                          </span>
                          <span>{notice.date}</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-rose-900 transition-colors line-clamp-2">
                          {notice.title}
                        </h4>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* TAB: ABOUT US */}
        {activeTab === 'about' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <span className="text-xs font-bold text-rose-900 uppercase tracking-wider">বিশ্ববিদ্যালয় পরিচিতি ও সনদ</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">{uniName} এর ঐতিহ্য</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {uniName} গণপ্রজাতন্ত্রী বাংলাদেশ সরকারের বেসরকারি বিশ্ববিদ্যালয় আইন অনুযায়ী {establishedYear} সালে প্রতিষ্ঠিত এবং বিশ্ববিদ্যালয় মঞ্জুরি কমিশন (UGC) কর্তৃক স্থায়ী সনদপ্রাপ্ত শীর্ষস্থানীয় উচ্চশিক্ষা প্রতিষ্ঠান। আন্তর্জাতিক মানের শিক্ষা প্রদান, উদ্ভাবন এবং সমাজ পরিবর্তনকারী গবেষণার ক্ষেত্রে প্রতিষ্ঠানটি অনন্য অবদান রাখছে।
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                  <h3 className="font-bold text-slate-900 text-sm mb-2">গবেষণা ও উদ্ভাবন</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    আইওটি, এআই, সাইবার সিকিউরিটি ও বায়োমেডিক্যাল ক্ষেত্রে আন্তর্জাতিক মানের নিজস্ব গবেষণা ল্যাব।
                  </p>
                </div>
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                  <h3 className="font-bold text-slate-900 text-sm mb-2">ইউজিসি স্থায়ী সনদ</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    বাংলাদেশ বিশ্ববিদ্যালয় মঞ্জুরি কমিশন (UGC) এবং শিক্ষা মন্ত্রণালয় কর্তৃক পূর্ণ স্থায়ী অনুমোদনপ্রাপ্ত।
                  </p>
                </div>
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                  <h3 className="font-bold text-slate-900 text-sm mb-2">করপোরেট প্লেসমেন্ট সেল</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    দেশের শীর্ষস্থানীয় বহুজাতিক ও প্রযুক্তি কোম্পানিতে ইন্টার্নশিপ ও চাকরি সংস্থানের বিশেষ ব্যবস্থা।
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: FACULTIES & PROGRAMS */}
        {activeTab === 'faculties' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold text-rose-900 uppercase tracking-wider">অনুষদ ও ডিগ্রি প্রোগ্রামসমূহ</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">একাডেমিক অনুষদ ও বিভাগ</h2>
              <p className="text-xs sm:text-sm text-slate-600">
                আমেরিকান ও আন্তর্জাতিক সেমিস্টার ক্রেডিট সিস্টেম অনুযায়ী ৪ বছর মেয়াদি স্নাতক ও স্নাতকোত্তর ডিগ্রি।
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {FACULTIES_DATA.map((faculty) => (
                <div key={faculty.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <span className="text-[11px] font-bold text-rose-900 uppercase">অনুষদ</span>
                    <h3 className="text-lg font-black text-slate-900">{faculty.facultyName}</h3>
                    <div className="text-xs text-slate-500 font-medium">ডিন: {faculty.dean}</div>
                  </div>
                  <p className="text-xs text-slate-600">{faculty.desc}</p>
                  <div className="space-y-2 pt-2">
                    <div className="text-xs font-bold text-slate-800">অফারকৃত ডিগ্রি প্রোগ্রামসমূহ:</div>
                    {faculty.programs.map((prog, pIdx) => (
                      <div key={pIdx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex justify-between items-center text-xs">
                        <div>
                          <div className="font-bold text-slate-900">{prog.name}</div>
                          <div className="text-[11px] text-slate-500">{prog.duration}</div>
                        </div>
                        <span className="bg-rose-100 text-rose-900 px-2 py-0.5 rounded text-[10px] font-bold shrink-0">
                          {prog.credit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: ADMISSIONS */}
        {activeTab === 'admissions' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <span className="text-xs font-bold text-rose-900 uppercase tracking-wider">ভর্তি নির্দেশিকা ও ওয়েভার</span>
              <h2 className="text-2xl font-black text-slate-900">আন্ডারগ্র্যাজুয়েট ও পোস্টগ্র্যাজুয়েট ভর্তি</h2>

              <div className="space-y-4 text-xs sm:text-sm text-slate-600">
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-950">
                  <div className="font-bold mb-1">মেধাভিত্তিক বিশেষ টিউশন ফি ওয়েভার (Scholarship):</div>
                  <ul className="list-disc pl-5 space-y-1 text-xs">
                    <li>এসএসসি ও এইচএসসি উভয় পরীক্ষায় Golden GPA 5.00 প্রাপ্তদের ১০০% টিউশন ফি ওয়েভার</li>
                    <li>উভয় পরীক্ষায় GPA 5.00 প্রাপ্তদের ৫০% টিউশন ফি ওয়েভার</li>
                    <li>মহিলা শিক্ষার্থী, সহোদর/সহোদরা ও আদিবাসী শিক্ষার্থীদের জন্য বিশেষ ১০-১৫% ছাড়</li>
                    <li>মুক্তিযোদ্ধার সন্তান কোটায় ১০০% সম্পূর্ণ বিনামূল্যে পড়াশোনার সুযোগ</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900">ভর্তির ন্যূনতম যোগ্যতা:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600">
                    <li>ইঞ্জিনিয়ারিং প্রোগ্রাম (CSE/EEE/Civil): এসএসসি ও এইচএসসিতে ন্যূনতম মোট জিপিএ ৬.৫০ (উচ্চতর গণিত ও পদার্থবিজ্ঞান বাধ্যতামূলক)</li>
                    <li>বিবিএ ও এলএলবি: উভয় পরীক্ষায় ন্যূনতম জিপিএ ২.৫০ অথবা সম্মিলিত জিপিএ ৬.০০</li>
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-3">
                <button 
                  onClick={() => setIsAdmissionModalOpen(true)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-800 to-rose-950 hover:from-rose-700 hover:to-rose-900 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <FileText size={16} />
                  <span>অনলাইন ভর্তি আবেদন শুরু করুন</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB: RESULTS / CGPA SEARCH */}
        {activeTab === 'results' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="text-center space-y-2">
                <span className="text-xs font-bold text-rose-900 uppercase tracking-wider">কন্ট্রোলার অব এক্সামিনেশনস পোর্টাল</span>
                <h2 className="text-2xl font-black text-slate-900">সেমিস্টার সিজিপিএ (CGPA) রেজাল্ট যাচাই</h2>
                <p className="text-xs text-slate-500">আপনার স্টুডেন্ট আইডি ও সেমিস্টার নির্বাচন করে অফিসিয়াল গ্রেডশিট দেখুন</p>
              </div>

              <form onSubmit={handleCgpaSearch} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">সেমিস্টার</label>
                  <select 
                    value={semesterFilter} 
                    onChange={(e) => setSemesterFilter(e.target.value)}
                    className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg p-2"
                  >
                    <option value="Spring 2024">Spring 2024</option>
                    <option value="Summer 2024">Summer 2024</option>
                    <option value="Fall 2024">Fall 2024</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">স্টুডেন্ট আইডি (Student ID)</label>
                  <input 
                    type="text" 
                    value={studentIdQuery} 
                    onChange={(e) => setStudentIdQuery(e.target.value)}
                    placeholder="DIU-211-15-401" 
                    className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div className="flex items-end">
                  <button 
                    type="submit" 
                    className="w-full bg-rose-900 hover:bg-rose-800 text-white font-bold text-xs py-2 rounded-lg transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Search size={14}/>
                    <span>গ্রেডশিট দেখুন</span>
                  </button>
                </div>
              </form>

              {foundUniResult && foundUniResult !== 'not_found' && (
                <div className="border border-rose-200 rounded-2xl p-6 bg-rose-50/20 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-rose-200 gap-2">
                    <div>
                      <div className="text-base font-black text-slate-900">{foundUniResult.name}</div>
                      <div className="text-xs text-slate-600">ID: {foundUniResult.studentId} • {foundUniResult.program}</div>
                      <div className="text-[11px] text-slate-500">{foundUniResult.faculty}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500 font-bold">Cumulative GPA (CGPA)</div>
                      <div className="text-2xl font-black text-rose-900">{foundUniResult.cgpa} / ৪.০০</div>
                      <div className="text-[10px] text-emerald-700 font-bold">অর্জিত ক্রেডিট: {foundUniResult.creditsEarned}</div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-rose-100 text-rose-950 font-bold">
                        <tr>
                          <th className="p-2.5 rounded-l-lg">কোর্স কোড ও শিরোনাম</th>
                          <th className="p-2.5 text-center">ক্রেডিট</th>
                          <th className="p-2.5 text-center">লেটার গ্রেড</th>
                          <th className="p-2.5 rounded-r-lg text-center">গ্রেড পয়েন্ট</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-rose-100">
                        {foundUniResult.courses.map((course: any, i: number) => (
                          <tr key={i} className="hover:bg-rose-50/50">
                            <td className="p-2.5 font-medium text-slate-800">{course.title} ({course.code})</td>
                            <td className="p-2.5 text-center text-slate-600">{course.credit.toFixed(1)}</td>
                            <td className="p-2.5 text-center font-bold text-slate-900">{course.grade}</td>
                            <td className="p-2.5 text-center font-black text-rose-900">{course.gpa}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button 
                      onClick={() => window.print()}
                      className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Printer size={13}/> অফিশিয়াল ট্রান্সক্রিপ্ট প্রিন্ট
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: RESEARCH */}
        {activeTab === 'research' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold text-rose-900 uppercase tracking-wider">গবেষণা ও প্রকাশনা কেন্দ্র</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">ইউনিভার্সিটি রিসার্চ সেল ও জার্নাল</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'সেন্টার ফর এআই অ্যান্ড ডেটা সায়েন্স', desc: 'মেশিন লার্নিং, ন্যাচারাল ল্যাঙ্গুয়েজ প্রসেসিং ও সাইবার নিরাপত্তা বিষয়ক উচ্চতর গবেষণা প্রকল্প।' },
                { title: 'ইউনিভার্সিটি জার্নাল অব বিজনেস অ্যান্ড ল', desc: 'প্রতি ৬ মাসে প্রকাশিত পিয়ার-রিভিউড জার্নাল যেখানে শিক্ষক ও গবেষকদের গবেষণা নিবন্ধ প্রকাশিত হয়।' },
                { title: 'রিনিউয়েবল এনার্জি অ্যান্ড রোবোটিক্স ল্যাব', desc: 'সৌরশক্তি প্রযুক্তি ও ইন্ডাস্ট্রিয়াল অটোমেশন নিয়ে শিক্ষার্থী ও শিক্ষকদের উদ্ভাবনী প্রজেক্ট।' }
              ].map((res, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-900 flex items-center justify-center font-bold">
                    <Microscope size={20} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{res.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{res.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: FACULTY DIRECTORY */}
        {activeTab === 'faculty' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold text-rose-900 uppercase tracking-wider">ফ্যাকাল্টি ডিরেক্টরি</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">সম্মানিত প্রফেসর ও অনুষদ সদস্যবৃন্দ</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {UNIVERSITY_PROFESSORS.map((prof) => (
                <div key={prof.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center space-y-3">
                  <img 
                    src={prof.photo} 
                    alt={prof.name} 
                    className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-rose-100 shadow-sm" 
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">{prof.name}</h3>
                    <div className="text-xs font-bold text-rose-900 mt-0.5">{prof.title}</div>
                    <div className="text-[11px] text-slate-500">{prof.dept}</div>
                  </div>
                  <p className="text-[11px] text-slate-600 border-t border-slate-100 pt-2 line-clamp-2">{prof.education}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: CAMPUS & FACILITIES */}
        {activeTab === 'campus' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold text-rose-900 uppercase tracking-wider">ক্যাম্পাস অবকাঠামো</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">স্থায়ী সবুজ ক্যাম্পাস ও সুযোগ-সুবিধা</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'সেন্ট্রাল ডিজিটাল লাইব্রেরি', desc: '৫০ হাজার রেফারেন্স বই ও ই-রিসোর্সেস সংবলিত শীতাতপ নিয়ন্ত্রিত আধুনিক রিডিং জোন।' },
                { title: 'হাই-টেক কম্পিউটার ও এআই ল্যাব', desc: 'গিগাবিট ইন্টারনেট সংযোগসহ অত্যাধুনিক ওয়ার্কস্টেশন সজ্জিত গবেষণা ল্যাব।' },
                { title: 'নিরাপদ ছাত্র ও ছাত্রী হোস্টেল', desc: 'ক্যাম্পাসের সন্নিকটে সার্বক্ষণিক ওয়াইফাই, মিল ও নিরাপত্তাবেষ্টিত আধুনিক আবাসিক হোস্টেল।' },
                { title: 'ক্যাম্পাস ট্রান্সপোর্ট সুবিধা', desc: 'ঢাকা শহরের প্রধান প্রধান রুট থেকে শিক্ষার্থীদের জন্য নিজস্ব বাস সার্ভিস।' },
                { title: 'ক্যাফেটেরিয়া ও ফুড কোর্ট', desc: 'স্বাস্থ্যসম্মত সুস্বাদু খাবার পরিবেশনের আধুনিক ক্যাফেটেরিয়া।' },
                { title: 'ইনডোর ও আউটডোর স্পোর্টস জোন', desc: 'ক্রিকেট, ফুটবল, টেবিল টেনিস ও ব্যাডমিন্টন খেলার সুব্যবস্থা।' }
              ].map((c, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <h3 className="text-base font-bold text-slate-900">{c.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: NOTICES */}
        {activeTab === 'notices' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-6">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">বিশ্ববিদ্যালয় নোটিশ বোর্ড</h2>
                  <p className="text-xs text-slate-500 mt-1">সেমিস্টার ফাইনাল, রেজাল্ট, সমাবর্তন ও প্রাতিষ্ঠানিক বিজ্ঞপ্তি</p>
                </div>
              </div>

              <div className="space-y-4">
                {UNIVERSITY_NOTICES.map((notice) => (
                  <div key={notice.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="bg-rose-100 text-rose-900 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                        {notice.category}
                      </span>
                      <span>{notice.date}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{notice.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{notice.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: CONTACT */}
        {activeTab === 'contact' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <span className="text-xs font-bold text-rose-900 uppercase tracking-wider">ক্যাম্পাস যোগাযোগ ও তথ্য</span>
              <h2 className="text-2xl font-black text-slate-900">{uniName} অ্যাডমিশন অফিস</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4 text-xs sm:text-sm text-slate-600">
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-rose-900 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900">স্থায়ী ক্যাম্পাস:</div>
                      <div>{uniAddress}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone size={18} className="text-rose-900 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900">অ্যাডমিশন হটলাইন:</div>
                      <div>{uniPhone}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail size={18} className="text-rose-900 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900">ই-মেইল:</div>
                      <div>{uniEmail}</div>
                    </div>
                  </div>
                </div>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    setContactSubmitted(true);
                  }}
                  className="space-y-3 bg-slate-50 p-5 rounded-xl border border-slate-200"
                >
                  <h4 className="text-xs font-bold text-slate-900">তথ্য জানতে লিখুন</h4>
                  {contactSubmitted ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg">
                      ধন্যবাদ! আপনার অনুসন্ধান অ্যাডমিশন টিমের কাছে পৌঁছেছে।
                    </div>
                  ) : (
                    <>
                      <input 
                        type="text" 
                        required 
                        placeholder="আপনার নাম" 
                        className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg" 
                      />
                      <input 
                        type="tel" 
                        required 
                        placeholder="মোবাইল নম্বর" 
                        className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg" 
                      />
                      <textarea 
                        rows={3} 
                        required 
                        placeholder="কাঙ্ক্ষিত প্রোগ্রাম ও প্রশ্ন..." 
                        className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
                      ></textarea>
                      <button 
                        type="submit" 
                        className="w-full bg-rose-900 hover:bg-rose-800 text-white font-bold text-xs py-2 rounded-lg cursor-pointer"
                      >
                        পাঠিয়ে দিন
                      </button>
                    </>
                  )}
                </form>
              </div>
            </div>
          </div>
        )}

        {/* TAB: ERP PORTAL */}
        {activeTab === 'portal' && (
          <div className="max-w-md mx-auto px-4 py-16">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-lg space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-900 flex items-center justify-center mx-auto">
                  <Lock size={22} />
                </div>
                <h2 className="text-xl font-black text-slate-900">ইউনিভার্সিটি ইআরপি পোর্টাল</h2>
                <p className="text-xs text-slate-500">কোর্স রেজিস্ট্রেশন, ফি পরিশোধ ও ফলাফল দেখতে লগইন করুন</p>
              </div>

              <form onSubmit={handleErpLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">স্টুডেন্ট / ফ্যাকাল্টি আইডি</label>
                  <input 
                    type="text" 
                    value={erpId}
                    onChange={(e) => setErpId(e.target.value)}
                    required 
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">পাসওয়ার্ড</label>
                  <input 
                    type="password" 
                    value={erpPassword}
                    onChange={(e) => setErpPassword(e.target.value)}
                    required 
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-rose-900 hover:bg-rose-800 text-white font-bold text-xs py-2.5 rounded-lg shadow-sm transition-all cursor-pointer"
                >
                  ইআরপি পোর্টালে প্রবেশ করুন
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* 4. FOOTER (STRICTLY UNIVERSITY) */}
      <footer className="bg-slate-950 text-slate-300 text-xs py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="font-black text-base text-white">{uniName}</div>
            <p className="text-slate-400 text-xs leading-relaxed">
              আন্তর্জাতিক মানের উচ্চশিক্ষা, স্কোপাস ইনডেক্সড গবেষণা ও আধুনিক প্রযুক্তিনির্ভর মানবসম্পদ তৈরির অগ্রদূত।
            </p>
            <div className="text-[11px] font-mono text-rose-400">
              UGC Accredited • Code: {uniCode}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs mb-3 uppercase tracking-wider">জরুরি লিংক</h4>
            <ul className="space-y-2 text-slate-400 text-xs">
              <li><button onClick={() => handleTabChange('admissions')} className="hover:text-white">অনলাইন অ্যাডমিশন</button></li>
              <li><button onClick={() => handleTabChange('results')} className="hover:text-white">সিজিপিএ ফলাফল</button></li>
              <li><button onClick={() => handleTabChange('faculties')} className="hover:text-white">ডিগ্রি প্রোগ্রামসমূহ</button></li>
              <li><button onClick={() => handleTabChange('research')} className="hover:text-white">রিসার্চ সেল ও জার্নাল</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs mb-3 uppercase tracking-wider">অনুমোদন ও কাউন্সিল</h4>
            <ul className="space-y-2 text-slate-400 text-xs">
              <li>বিশ্ববিদ্যালয় মঞ্জুরি কমিশন (UGC)</li>
              <li>শিক্ষা মন্ত্রণালয়, গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</li>
              <li>ফার্মেসি কাউন্সিল অব বাংলাদেশ (PCB)</li>
              <li>বাংলাদেশ বার কাউন্সিল (Bar Council)</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs mb-3 uppercase tracking-wider">ক্যাম্পাস যোগাযোগ</h4>
            <p className="text-slate-400 text-xs">{uniAddress}</p>
            <p className="text-slate-400 text-xs">হটলাইন: {uniPhone}</p>
            <p className="text-slate-400 text-xs">ই-মেইল: {uniEmail}</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 mt-8 border-t border-slate-800 text-center text-slate-500 text-[11px]">
          © {new Date().getFullYear()} {uniName}। সর্বস্বত্ব সংরক্ষিত।
        </div>
      </footer>

      {/* ONLINE ADMISSION APPLICATION MODAL */}
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
              institutionType="University"
              onClose={() => setIsAdmissionModalOpen(false)}
              onComplete={() => setIsAdmissionModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
