import React, { useState, useEffect } from 'react';
import { 
  Phone, Mail, MapPin, Calendar, Clock, Search, BookOpen, Award, 
  Users, ChevronRight, CheckCircle2, Check, ArrowRight, ShieldCheck, 
  Star, FileText, Menu, X, Printer, User, Globe, Lock, BookMarked, 
  Compass, HeartHandshake, Sparkles, Building2, Bell, AlertCircle, Send,
  GraduationCap, Download, Layers, FlaskConical, Laptop, School
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole, Tenant } from '../types';
import { StudentAdmissionForm } from './StudentAdmissionForm';

export type CollegePageTab = 
  | 'home' 
  | 'about' 
  | 'academics' 
  | 'admission' 
  | 'results' 
  | 'facilities' 
  | 'faculty' 
  | 'notices' 
  | 'contact' 
  | 'portal';

interface CollegeWebsiteProps {
  initialTab?: CollegePageTab;
  tenant?: Tenant;
  showSwitcher?: boolean;
}

export const CollegeWebsite: React.FC<CollegeWebsiteProps> = ({ 
  initialTab = 'home',
  tenant,
  showSwitcher = false
}) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState<CollegePageTab>(initialTab);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lang, setLang] = useState<'bn' | 'en'>('bn');

  // Modals & Interactive States
  const [isAdmissionModalOpen, setIsAdmissionModalOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<any | null>(null);
  const [selectedNotice, setSelectedNotice] = useState<any | null>(null);

  // College-specific data filters
  const [facultyDept, setFacultyDept] = useState('All');
  const [academicStream, setAcademicStream] = useState<'hsc' | 'degree' | 'honours'>('hsc');

  // Results Tab States
  const [resultExamType, setResultExamType] = useState('hsc_pretest');
  const [resultYear, setResultYear] = useState('2024');
  const [resultStream, setResultStream] = useState('science');
  const [rollQuery, setRollQuery] = useState('১০১');
  const [foundStudentResult, setFoundStudentResult] = useState<any | null>({
    roll: '১০১',
    reg: '১৫১০৯৮৭৬',
    name: 'ফারহান মাহমুদ চৌধুরী',
    stream: 'উচ্চ মাধ্যমিক (বিজ্ঞান শাখা)',
    session: '২০২৩-২০২৪',
    gpa: '৫.০০',
    grade: 'A+',
    subjects: [
      { code: '101', name: 'বাংলা', full: 100, marks: 88, grade: 'A+' },
      { code: '107', name: 'ইংরেজি', full: 100, marks: 85, grade: 'A+' },
      { code: '174', name: 'পদার্থবিজ্ঞান', full: 100, marks: 94, grade: 'A+' },
      { code: '176', name: 'রসায়ন', full: 100, marks: 91, grade: 'A+' },
      { code: '178', name: 'উচ্চতর গণিত', full: 100, marks: 96, grade: 'A+' },
      { code: '179', name: 'জীববিজ্ঞান', full: 100, marks: 89, grade: 'A+' },
      { code: '275', name: 'তথ্য ও যোগাযোগ প্রযুক্তি', full: 50, marks: 48, grade: 'A+' }
    ]
  });

  // College Portal Login Form
  const [portalRoll, setPortalRoll] = useState('HSC-2024-101');
  const [portalPassword, setPortalPassword] = useState('college123');

  // Contact Form
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Institution Metadata (Derived directly from tenant or default Dhaka City College)
  const currentTenant: Tenant = tenant || {
    id: 'dcc',
    name: 'ঢাকা সিটি কলেজ (Dhaka City College)',
    type: 'College',
    subdomain: 'dcc',
    customDomain: 'dcc.edu.bd',
    logoUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=200&fit=crop',
    status: 'Active',
    studentsCount: 1250,
    maxStudents: 5000,
    plan: 'Premium',
    revenue: 45000,
    enabledModules: ['academic', 'finance', 'hr', 'exams', 'portal', 'library', 'admissions'],
    eiin: '108162',
    code: 'DCC-101',
    contactPhone: '+880 1712-345678',
    contactEmail: 'info@dcc.edu.bd',
    address: 'রোড #২, ধানমন্ডি আ/এ, ঢাকা-১২০৫, বাংলাদেশ',
    establishedYear: '1957',
    principalName: 'প্রফেসর মোঃ রফিকুল ইসলাম'
  };

  const collegeName = currentTenant.name;
  const collegeEIIN = currentTenant.eiin || '১০৮১৬২';
  const collegeCode = currentTenant.code || 'DCC-101';
  const collegePhone = currentTenant.contactPhone || '+৮৮০ ১৭১২-৩৪৫৬৭৮';
  const collegeEmail = currentTenant.contactEmail || 'info@dcc.edu.bd';
  const collegeAddress = currentTenant.address || 'রোড #২, ধানমন্ডি আ/এ, ঢাকা-১২০৫, বাংলাদেশ';
  const establishedYear = currentTenant.establishedYear || '১৯৫৭';
  const principalName = currentTenant.principalName || 'প্রফেসর মোঃ রফিকুল ইসলাম';

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleTabChange = (tab: CollegePageTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResultSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (rollQuery.trim() === '১০১' || rollQuery.trim() === '101') {
      setFoundStudentResult({
        roll: '১০১',
        reg: '১৫১০৯৮৭৬',
        name: 'ফারহান মাহমুদ চৌধুরী',
        stream: resultStream === 'science' ? 'উচ্চ মাধ্যমিক (বিজ্ঞান শাখা)' : resultStream === 'business' ? 'উচ্চ মাধ্যমিক (ব্যবসায় শিক্ষা)' : 'উচ্চ মাধ্যমিক (মানবিক শাখা)',
        session: '২০২৩-২০২৪',
        gpa: '৫.০০',
        grade: 'A+',
        subjects: [
          { code: '101', name: 'বাংলা', full: 100, marks: 88, grade: 'A+' },
          { code: '107', name: 'ইংরেজি', full: 100, marks: 85, grade: 'A+' },
          { code: '174', name: 'পদার্থবিজ্ঞান', full: 100, marks: 94, grade: 'A+' },
          { code: '176', name: 'রসায়ন', full: 100, marks: 91, grade: 'A+' },
          { code: '178', name: 'উচ্চতর গণিত', full: 100, marks: 96, grade: 'A+' },
          { code: '179', name: 'জীববিজ্ঞান', full: 100, marks: 89, grade: 'A+' },
          { code: '275', name: 'তথ্য ও যোগাযোগ প্রযুক্তি', full: 50, marks: 48, grade: 'A+' }
        ]
      });
    } else {
      setFoundStudentResult('not_found');
    }
  };

  const handlePortalLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(portalRoll, portalPassword, UserRole.STUDENT);
    navigate('/student/dashboard');
  };

  // College Faculty Members
  const COLLEGE_FACULTY = [
    {
      id: 'f1',
      name: 'প্রফেসর মোঃ রফিকুল ইসলাম',
      designation: 'অধ্যক্ষ (Principal)',
      dept: 'রসায়ন বিভাগ',
      qualification: 'এম.এসসি (ফার্স্ট ক্লাস, ঢাবি), বি.এড',
      experience: '২৮ বছরের কলেজ অধ্যাপনা ও প্রশাসনিক অভিজ্ঞতা',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=faces'
    },
    {
      id: 'f2',
      name: 'ড. নাজমুল হাসান',
      designation: 'সহকারী অধ্যাপক ও বিভাগীয় প্রধান',
      dept: 'পদার্থবিজ্ঞান বিভাগ',
      qualification: 'পিএইচডি (পদার্থবিজ্ঞান), বুয়েট ফেলো',
      experience: '১৮ বছরের কলেজ পাঠদান ও ব্যবহারিক ল্যাব তত্ত্বাবধান',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=faces'
    },
    {
      id: 'f3',
      name: 'অধ্যাপিকা শামসুন্নাহার বেগম',
      designation: 'সহযোগী অধ্যাপক',
      dept: 'হিসাববিজ্ঞান বিভাগ',
      qualification: 'এম.কম (হিসাববিজ্ঞান, রাবি), সিএ (ইন্টারমিডিয়েট)',
      experience: '১৫ বছরের অনার্স ও এইচএসসি হিসাববিজ্ঞান নির্দেশনা',
      photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=faces'
    },
    {
      id: 'f4',
      name: 'আশরাফুল হক',
      designation: 'প্রভাষক',
      dept: 'আইসিটি ও কম্পিউটার বিভাগ',
      qualification: 'বি.এসসি (সিএসই), এম.এসসি',
      experience: '৮ বছরের কম্পিউটার ল্যাব ও প্রোগ্রামিং প্রশিক্ষণ',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=faces'
    },
    {
      id: 'f5',
      name: 'সৈয়দা মরিয়ম আক্তার',
      designation: 'প্রভাষক',
      dept: 'ইংরেজি বিভাগ',
      qualification: 'বি.এ (অনার্স), এম.এ (ইংরেজি সাহিত্য, ঢাবি)',
      experience: '১০ বছরের এইচএসসি ইংরেজি ও স্পোকেন নির্দেশনা',
      photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop&crop=faces'
    },
    {
      id: 'f6',
      name: 'মো: আব্দুল্লাহ আল মামুন',
      designation: 'সহকারী অধ্যাপক',
      dept: 'জীববিজ্ঞান বিভাগ',
      qualification: 'এম.এসসি (উদ্ভিদবিজ্ঞান, ঢাবি)',
      experience: '১২ বছরের প্র্যাকটিক্যাল ল্যাব ও বোটানি পাঠদান',
      photo: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&h=300&fit=crop&crop=faces'
    }
  ];

  // College Notices
  const COLLEGE_NOTICES = [
    {
      id: 'cn1',
      title: '২০২৪-২০২৫ শিক্ষাবর্ষে একাদশ শ্রেণিতে (HSC) চূড়ান্ত ভর্তি বিজ্ঞপ্তি',
      date: '১২ জুলাই ২০২৪',
      category: 'ভর্তি',
      desc: 'ঢাকা শিক্ষা বোর্ডের অনলাইন সেন্ট্রাল নিশ্চায়ন শেষে নির্বাচিত শিক্ষার্থীদের মূল মার্কশিট ও প্রয়োজনীয় কাগজপত্র সহ কলেজে সশরীরে উপস্থিত হয়ে ভর্তি সম্পন্ন করার নির্দেশ দেওয়া হচ্ছে।'
    },
    {
      id: 'cn2',
      title: 'এইচএসসি ২০২৪ পরীক্ষার্থীদের টেস্ট (নির্বাচনী) পরীক্ষার রুটিন প্রকাশ',
      date: '০৮ সেপ্টেম্বর ২০২৪',
      category: 'পরীক্ষা',
      desc: 'সকল বিভাগের (বিজ্ঞান, মানবিক, ব্যবসায় শিক্ষা) নির্বাচনী পরীক্ষা আগামী ১৫ সেপ্টেম্বর থেকে শুরু হবে। ব্যবহারিক পরীক্ষার সময়সূচি সংশ্লিষ্ট ল্যাবে টাঙিয়ে দেওয়া হয়েছে।'
    },
    {
      id: 'cn3',
      title: 'জাতীয় বিশ্ববিদ্যালয়ের অধীনে স্নাতক (সম্মান) ১ম বর্ষে রেজিস্ট্রেশন সংক্রান্ত',
      date: '১৮ অক্টোবর ২০২৪',
      category: 'অনার্স',
      desc: 'হিসাববিজ্ঞান, ব্যবস্থাপনা, ইংরেজি ও রাষ্ট্রবিজ্ঞান বিভাগের ১ম বর্ষের নিয়মিত শিক্ষার্থীদের এনইউ পোর্টাল থেকে রেজিস্ট্রেশন কার্ড সংগ্রহ করার নির্দেশ দেওয়া হলো।'
    },
    {
      id: 'cn4',
      title: 'মেধাবী ও অসচ্ছল শিক্ষার্থীদের জন্য কলেজ অভ্যন্তরীণ উপবৃত্তি আবেদন',
      date: '০২ নভেম্বর ২০২৪',
      category: 'উপবৃত্তি',
      desc: 'অধ্যক্ষের কার্যালয় থেকে উপবৃত্তি আবেদন ফরম সংগ্রহ করে প্রয়োজনীয় প্রমাণাদিসহ আগামী ১০ নভেম্বরের মধ্যে জমা দিতে হবে।'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased selection:bg-blue-700 selection:text-white">
      
      {/* 1. TOP COLLEGE UTILITY BAR (STRICTLY COLLEGE DATA) */}
      <div className="bg-slate-900 text-slate-200 text-xs py-2 px-4 border-b border-blue-900/60 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex flex-wrap items-center gap-4 text-[11px] font-medium">
            <span className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Phone size={13} className="text-amber-400" /> {collegePhone}
            </span>
            <span className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Mail size={13} className="text-amber-400" /> {collegeEmail}
            </span>
            <span className="bg-blue-950 text-blue-300 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold border border-blue-800">
              EIIN: {collegeEIIN} • কলেজ কোড: {collegeCode}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleTabChange('results')} 
              className="hover:underline flex items-center gap-1 font-bold text-amber-300 cursor-pointer"
            >
              <Search size={13}/> এইচএসসি ও টেস্ট ফলাফল
            </button>
            <span className="text-slate-700">|</span>
            <button 
              onClick={() => handleTabChange('portal')}
              className="bg-blue-600 text-white px-3 py-1 rounded-full font-bold text-[11px] hover:bg-blue-500 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Lock size={12}/> 
              <span>শিক্ষার্থী / শিক্ষক পোর্টাল</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN COLLEGE HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="py-3.5 flex justify-between items-center gap-4">
            
            {/* Logo & College Info */}
            <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => handleTabChange('home')}>
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-900 flex items-center justify-center text-white shadow-md border-2 border-blue-100 shrink-0">
                <GraduationCap size={28} className="text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-blue-950 tracking-tight leading-tight">
                    {collegeName}
                  </h1>
                  <span className="hidden sm:inline-block bg-blue-100 text-blue-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    কলেজ শাখা
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                  <MapPin size={12} className="text-slate-400" />
                  {collegeAddress} • স্থাপিত: {establishedYear}
                </p>
              </div>
            </div>

            {/* Desktop Navigation (STRICTLY COLLEGE OPTIONS) */}
            <nav className="hidden lg:flex items-center gap-1 text-xs font-bold text-slate-700">
              {[
                { id: 'home', label: 'হোম' },
                { id: 'about', label: 'আমাদের সম্পর্কে' },
                { id: 'academics', label: 'একাডেমিক ও বিভাগ' },
                { id: 'admission', label: 'ভর্তি তথ্য' },
                { id: 'results', label: 'ফলাফল' },
                { id: 'facilities', label: 'ল্যাব ও সুবিধা' },
                { id: 'faculty', label: 'শিক্ষকমণ্ডলী' },
                { id: 'notices', label: 'নোটিশ বোর্ড' },
                { id: 'contact', label: 'যোগাযোগ' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id as CollegePageTab)}
                  className={`px-3 py-2 rounded-lg transition-all cursor-pointer ${
                    activeTab === item.id 
                      ? 'bg-blue-700 text-white font-black shadow-xs' 
                      : 'hover:bg-blue-50 text-slate-700 hover:text-blue-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => handleTabChange('portal')}
                className="ml-2 bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-3.5 py-2 rounded-lg font-bold shadow-xs hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Lock size={12} className="text-amber-300" />
                <span>পোর্টাল</span>
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
              { id: 'about', label: 'আমাদের সম্পর্কে' },
              { id: 'academics', label: 'একাডেমিক ও বিভাগ' },
              { id: 'admission', label: 'ভর্তি তথ্য' },
              { id: 'results', label: 'ফলাফল' },
              { id: 'facilities', label: 'ল্যাব ও সুবিধা' },
              { id: 'faculty', label: 'শিক্ষকমণ্ডলী' },
              { id: 'notices', label: 'নোটিশ বোর্ড' },
              { id: 'contact', label: 'যোগাযোগ' },
              { id: 'portal', label: 'কলেজ পোর্টাল লগইন' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id as CollegePageTab)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold ${
                  activeTab === item.id ? 'bg-blue-700 text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* 3. CONTENT RENDER BASED ON ACTIVE TAB */}
      <main>
        {/* TAB: HOME */}
        {activeTab === 'home' && (
          <div className="space-y-12 pb-16">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 text-white overflow-hidden py-16 sm:py-24">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#93c5fd_1px,transparent_1px)] [background-size:16px_16px]"></div>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                  <div className="lg:col-span-7 space-y-5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
                      <Sparkles size={14} className="text-amber-400" />
                      জাতীয় শিক্ষাক্রম ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড অধিভুক্ত শ্রেষ্ঠ বিদ্যাপীঠ
                    </span>
                    <h2 className="text-3xl sm:text-5xl font-black leading-tight tracking-tight text-white">
                      আধুনিক বিজ্ঞান ও উচ্চ শিক্ষার আলোকবর্তিকা
                    </h2>
                    <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                      উচ্চ মাধ্যমিক (বিজ্ঞান, মানবিক ও ব্যবসায় শিক্ষা), ডিগ্রি এবং স্নাতক (অনার্স) পর্যায়ে যুগোপযোগী শিক্ষা ও ব্যবহারিক গবেষণার মাধ্যমে দক্ষ ও দেশপ্রেমিক ভবিষ্যৎ প্রজন্ম গড়াই আমাদের মূল অঙ্গীকার।
                    </p>
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button 
                        onClick={() => setIsAdmissionModalOpen(true)}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm shadow-lg shadow-blue-900/40 flex items-center gap-2 cursor-pointer transition-all"
                      >
                        <FileText size={16} />
                        <span>একাদশ শ্রেণিতে ভর্তি আবেদন করুন</span>
                        <ArrowRight size={16} />
                      </button>
                      <button 
                        onClick={() => handleTabChange('academics')}
                        className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 flex items-center gap-2 cursor-pointer transition-all"
                      >
                        <BookOpen size={16} />
                        <span>বিভাগসমূহ ও পাঠ্যসূচি</span>
                      </button>
                    </div>
                  </div>

                  {/* Hero Right: Stats & Key Highlights Card */}
                  <div className="lg:col-span-5">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-white shadow-2xl space-y-6">
                      <div className="flex items-center justify-between border-b border-white/10 pb-4">
                        <div>
                          <div className="text-xs uppercase font-bold tracking-wider text-blue-300">কলেজ পরিচিতি</div>
                          <div className="text-lg font-black text-white">{collegeName}</div>
                        </div>
                        <span className="bg-amber-400/20 text-amber-300 text-xs px-2.5 py-1 rounded-full font-bold border border-amber-400/40">
                          স্থাপিত {establishedYear}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-900/60 p-3.5 rounded-xl border border-white/10">
                          <div className="text-2xl font-black text-amber-400">৯৫.৮%</div>
                          <div className="text-xs text-slate-300 font-semibold mt-0.5">এইচএসসি পাসের হার</div>
                        </div>
                        <div className="bg-slate-900/60 p-3.5 rounded-xl border border-white/10">
                          <div className="text-2xl font-black text-emerald-400">৩২০+</div>
                          <div className="text-xs text-slate-300 font-semibold mt-0.5">জিপিএ-৫ (A+) অর্জন</div>
                        </div>
                        <div className="bg-slate-900/60 p-3.5 rounded-xl border border-white/10">
                          <div className="text-2xl font-black text-blue-300">৪টি</div>
                          <div className="text-xs text-slate-300 font-semibold mt-0.5">আধুনিক বিজ্ঞান ল্যাব</div>
                        </div>
                        <div className="bg-slate-900/60 p-3.5 rounded-xl border border-white/10">
                          <div className="text-2xl font-black text-purple-300">৬৫+</div>
                          <div className="text-xs text-slate-300 font-semibold mt-0.5">অভিজ্ঞ প্রভাষক ও শিক্ষক</div>
                        </div>
                      </div>
                      <div className="bg-blue-900/40 p-3 rounded-xl border border-blue-400/30 text-xs flex items-center gap-2">
                        <Bell size={16} className="text-amber-400 shrink-0" />
                        <span className="line-clamp-1">এইচএসসি ২০২৪ টেস্ট পরীক্ষার রুটিন প্রকাশ হয়েছে।</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 4 Feature Cards (College Pillars) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { icon: BookOpen, title: 'উচ্চ মাধ্যমিক (HSC)', desc: 'বিজ্ঞান, ব্যবসায় শিক্ষা ও মানবিক শাখায় অভিজ্ঞ শিক্ষকদের পাঠদান।' },
                  { icon: FlaskConical, title: 'ব্যবহারিক বিজ্ঞান ল্যাব', desc: 'পদার্থ, রসায়ন, জীববিজ্ঞান ও মাল্টিমিডিয়া কম্পিউটার ল্যাব।' },
                  { icon: Layers, title: 'ডিগ্রি ও স্নাতক (অনার্স)', desc: 'জাতীয় বিশ্ববিদ্যালয়ের অধীনে হিসাববিজ্ঞান, ব্যবস্থাপনা ও ইংরেজি।' },
                  { icon: Award, title: 'সহ-শিক্ষা ও ক্লাব', desc: 'বিতর্ক পরিষদ, বিজ্ঞান ক্লাব, রোভার স্কাউট ও সাংস্কৃতিক দল।' }
                ].map((feat, i) => (
                  <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
                      <feat.icon size={20} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mb-1">{feat.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{feat.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Principal's Message & Notice Board */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Principal's Message */}
                <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider">
                    <Award size={15} />
                    <span>অধ্যক্ষের বাণী (Message from Principal)</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                    "জ্ঞান, শৃঙ্খলা ও নৈতিকতায় আদর্শ নাগরিক গঠন"
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-5 items-start">
                    <img 
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=faces" 
                      alt="Principal" 
                      className="w-24 h-28 rounded-xl object-cover shadow-sm border border-slate-200 shrink-0" 
                    />
                    <div className="space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                      <p>
                        প্রিয় শিক্ষার্থী ও সুধীজন, {collegeName} দীর্ঘ কয়েক দশক ধরে সাফল্যের সাথে উচ্চ মাধ্যমিক ও উচ্চ শিক্ষায় মেধার স্বাক্ষর রেখে চলেছে। আমাদের লক্ষ্য শুধুমাত্র পুঁথিগত বিদ্যা অর্জন নয়, বরং ব্যবহারিক জ্ঞান ও নৈতিক মূল্যবোধে সমৃদ্ধ আধুনিক নেতৃত্ব তৈরি করা।
                      </p>
                      <p>
                        নিয়মিত ইনকোর্স মূল্যায়ন, সুসজ্জিত বিজ্ঞানাগার এবং নিবেদিতপ্রাণ শিক্ষকমণ্ডলীর তত্ত্বাবধানে আমাদের শিক্ষার্থীরা দেশের খ্যাতনামা বিশ্ববিদ্যালয় ও মেডিকেল-বুয়েটে মেধার স্থান করে নিচ্ছে।
                      </p>
                      <div className="pt-2">
                        <div className="font-black text-slate-900 text-sm">{principalName}</div>
                        <div className="text-xs text-blue-700 font-semibold">অধ্যক্ষ, {collegeName}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* College Notices */}
                <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase">
                      <Bell size={15} className="text-amber-500" />
                      <span>কলেজ নোটিশ বোর্ড</span>
                    </div>
                    <button 
                      onClick={() => handleTabChange('notices')} 
                      className="text-xs text-blue-700 font-bold hover:underline"
                    >
                      সকল নোটিশ →
                    </button>
                  </div>
                  <div className="space-y-3">
                    {COLLEGE_NOTICES.slice(0, 3).map((notice) => (
                      <div 
                        key={notice.id} 
                        onClick={() => setSelectedNotice(notice)}
                        className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200/80 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                          <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded text-[10px]">
                            {notice.category}
                          </span>
                          <span>{notice.date}</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-2">
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-10">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">আমাদের পরিচিতি ও ঐতিহ্য</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">{collegeName} এর ইতিহাস</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {collegeName} {establishedYear} সালে উচ্চ শিক্ষার বিস্তার ও তরুণ প্রজন্মকে দক্ষ জনশক্তিতে রূপান্তরের মহান ব্রত নিয়ে প্রতিষ্ঠিত হয়। ঢাকা শিক্ষা বোর্ড এবং জাতীয় বিশ্ববিদ্যালয়ের অধীনে পরিচালিত এই প্রতিষ্ঠানটি রাজধানী ও আশেপাশের এলাকার শিক্ষার্থীদের প্রথম পছন্দের কলেজ হিসেবে সুপরিচিত।
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                  <h3 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
                    <TargetIcon className="w-4 h-4 text-blue-600" /> লক্ষ্য ও উদ্দেশ্য
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    সৃজনশীল পাঠদান, গবেষণা ও বাস্তবমুখী ল্যাব প্রশিক্ষণের মাধ্যমে প্রত্যেক শিক্ষার্থীকে যোগ্য মানবসম্পদে রূপান্তর করা।
                  </p>
                </div>
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                  <h3 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> শৃঙ্খলা ও পরিবেশ
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    ধূমপানমুক্ত ও রাজনীতিমুক্ত সুশৃঙ্খল ক্যাম্পাস। সিসিটিভি ক্যামেরায় সার্বক্ষণিক নিরাপত্তাবেষ্টনী।
                  </p>
                </div>
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                  <h3 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-600" /> বোর্ড ও এনইউ অর্জন
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    ধারাবাহিকভাবে ঢাকা বোর্ডে শতভাগ পাসের হার ও জাতীয় বিশ্ববিদ্যালয় অনার্স পরীক্ষায় প্রথম শ্রেণি অর্জন।
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: ACADEMICS & DEPARTMENTS */}
        {activeTab === 'academics' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">কলেজ পাঠ্যক্রম ও বিষয়সমূহ</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">একাডেমিক বিভাগ ও শাখাসমূহ</h2>
              <p className="text-xs sm:text-sm text-slate-600">
                উচ্চ মাধ্যমিক (একাদশ-দ্বাদশ শ্রেণি) ও জাতীয় বিশ্ববিদ্যালয় অধিভুক্ত ডিগ্রি এবং অনার্স কোর্সসমূহ।
              </p>
            </div>

            {/* Stream Selector */}
            <div className="flex justify-center gap-2">
              {[
                { id: 'hsc', label: 'উচ্চ মাধ্যমিক (HSC)' },
                { id: 'honours', label: 'স্নাতক (অনার্স)' },
                { id: 'degree', label: 'ডিগ্রি (পাস)' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setAcademicStream(tab.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    academicStream === tab.id 
                      ? 'bg-blue-700 text-white shadow-md' 
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* HSC Stream Cards */}
            {academicStream === 'hsc' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-black">
                    ১
                  </div>
                  <h3 className="text-base font-bold text-slate-900">বিজ্ঞান শাখা (Science)</h3>
                  <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
                    <li>পদার্থবিজ্ঞান (১ম ও ২য় পত্র)</li>
                    <li>রসায়ন (১ম ও ২য় পত্র)</li>
                    <li>উচ্চতর গণিত / জীববিজ্ঞান</li>
                    <li>তথ্য ও যোগাযোগ প্রযুক্তি (ICT)</li>
                    <li>বাংলা ও ইংরেজি (আবশ্যিক)</li>
                  </ul>
                  <div className="text-[11px] font-bold text-blue-700 bg-blue-50 p-2 rounded-lg">
                    ব্যবহারিক ক্লাস: সপ্তাহে ৪ দিন ল্যাব সেশন
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black">
                    ২
                  </div>
                  <h3 className="text-base font-bold text-slate-900">ব্যবসায় শিক্ষা শাখা (Commerce)</h3>
                  <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
                    <li>হিসাববিজ্ঞান (১ম ও ২য় পত্র)</li>
                    <li>ব্যবসায় সংগঠন ও ব্যবস্থাপনা</li>
                    <li>ফিন্যান্স, ব্যাংকিং ও বিমা / অর্থনীতি</li>
                    <li>উৎপাদন ব্যবস্থাপনা ও বিপণন</li>
                    <li>তথ্য ও যোগাযোগ প্রযুক্তি (ICT)</li>
                  </ul>
                  <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 p-2 rounded-lg">
                    স্পেশাল কেয়ার: প্র্যাকটিক্যাল একাউন্টিং ওয়ার্কশপ
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-black">
                    ৩
                  </div>
                  <h3 className="text-base font-bold text-slate-900">মানবিক শাখা (Humanities)</h3>
                  <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
                    <li>পৌরনীতি ও সুশাসন</li>
                    <li>সমাজকর্ম / অর্থনীতি</li>
                    <li>ইসলামের ইতিহাস ও সংস্কৃতি / যুক্তিবিদ্যা</li>
                    <li>ভূগোল / সমাজবিজ্ঞান</li>
                    <li>তথ্য ও যোগাযোগ প্রযুক্তি (ICT)</li>
                  </ul>
                  <div className="text-[11px] font-bold text-amber-700 bg-amber-50 p-2 rounded-lg">
                    নিয়মিত বিতর্ক ও সাধারণ জ্ঞান সেশন
                  </div>
                </div>
              </div>
            )}

            {/* Honours Streams */}
            {academicStream === 'honours' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { dept: 'হিসাববিজ্ঞান (Accounting)', seats: '১২০টি আসন', dur: '৪ বছর মেয়াদি অনার্স' },
                  { dept: 'ব্যবস্থাপনা (Management)', seats: '১২০টি আসন', dur: '৪ বছর মেয়াদি অনার্স' },
                  { dept: 'ইংরেজি সাহিত্য (English)', seats: '৮০টি আসন', dur: '৪ বছর মেয়াদি অনার্স' },
                  { dept: 'সিএসই প্রফেশনাল (B.Sc in CSE)', seats: '৬০টি আসন', dur: '৪ বছর (৮ সেমিস্টার)' }
                ].map((item, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                    <div className="text-xs font-bold text-blue-700 uppercase">জাতীয় বিশ্ববিদ্যালয়</div>
                    <h3 className="text-sm font-bold text-slate-900">{item.dept}</h3>
                    <p className="text-xs text-slate-500">{item.dur} • {item.seats}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Degree Streams */}
            {academicStream === 'degree' && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900">ডিগ্রি (পাস) কোর্সসমূহ - ৩ বছর মেয়াদি</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="font-bold text-slate-900 mb-1">বি.এ (পাস)</div>
                    <p>বাংলা, ইংরেজি, রাষ্ট্রবিজ্ঞান, ইতিহাস ও সমাজবিজ্ঞান বিষয় সমন্বয়।</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="font-bold text-slate-900 mb-1">বি.এস.এস (পাস)</div>
                    <p>সমাজবিজ্ঞান, রাষ্ট্রবিজ্ঞান, অর্থনীতি ও সামাজিক বিষয়াদি।</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="font-bold text-slate-900 mb-1">বি.বি.এস (পাস)</div>
                    <p>হিসাববিজ্ঞান, ব্যবস্থাপনা, ব্যবসায় সংগঠন ও ফিন্যান্স।</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: ADMISSION */}
        {activeTab === 'admission' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider">
                <Calendar size={15} />
                <span>২০২৪-২০২৫ শিক্ষাবর্ষে একাদশ শ্রেণি ভর্তি প্রক্রিয়া</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900">একাদশ শ্রেণি ও ডিগ্রিতে ভর্তির যোগ্যতা ও নির্দেশিকা</h2>
              
              <div className="space-y-4 text-xs sm:text-sm text-slate-600">
                <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-900">
                  <div className="font-bold mb-1">অনলাইন কেন্দ্রীয় আবেদন লিংক (ঢাকা বোর্ড):</div>
                  <p>ঢাকা শিক্ষা বোর্ডের নির্ধারিত ওয়েবসাইটে (www.xiclassadmission.gov.bd) প্রথম পছন্দ হিসেবে <strong>{collegeName} (EIIN: {collegeEIIN})</strong> নির্বাচন করুন।</p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900">ন্যূনতম জিপিএ যোগ্যতা (HSC Eligibility):</h4>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600">
                    <li>বিজ্ঞান শাখা: ন্যূনতম জিপিএ ৪.০০ (গণিত ও বিজ্ঞানে ৩.৫০ সহ)</li>
                    <li>ব্যবসায় শিক্ষা শাখা: ন্যূনতম জিপিএ ৩.০০</li>
                    <li>মানবিক শাখা: ন্যূনতম জিপিএ ২.৫০</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900">ভর্তির সময় প্রয়োজনীয় কাগজপত্র:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600">
                    <li>এসএসসি মূল মার্কশিট/ট্রান্সক্রিপ্ট ও ২টি ফটোকপি</li>
                    <li>এসএসসি মূল প্রশংসাপত্র (Testimonial)</li>
                    <li>শিক্ষার্থীর পাসপোর্ট সাইজ ছবি (৪ কপি)</li>
                    <li>পিতা/মাতার জাতীয় পরিচয়পত্রের ফটোকপি</li>
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
                <button 
                  onClick={() => setIsAdmissionModalOpen(true)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <FileText size={16} />
                  <span>অনলাইন একাদশ শ্রেণি ভর্তি আবেদন ফরম</span>
                </button>
                <button 
                  onClick={() => alert('ভর্তি হেল্পডেস্ক ফোন: ' + collegePhone)}
                  className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
                >
                  ভর্তি হেল্পডেস্কে যোগাযোগ করুন
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB: RESULTS */}
        {activeTab === 'results' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="text-center space-y-2">
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">অনলাইন ফলাফল অনুসন্ধান</span>
                <h2 className="text-2xl font-black text-slate-900">কলেজ অভ্যন্তরীণ ও বোর্ড ফলাফল</h2>
                <p className="text-xs text-slate-500">এইচএসসি টেস্ট, প্রাক-নির্বাচনী ও মডেল টেস্টের ফলাফল যাচাই করুন</p>
              </div>

              <form onSubmit={handleResultSearch} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">পরীক্ষার নাম</label>
                  <select 
                    value={resultExamType} 
                    onChange={(e) => setResultExamType(e.target.value)} 
                    className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg p-2"
                  >
                    <option value="hsc_pretest">এইচএসসি নির্বাচনী (Test)</option>
                    <option value="hsc_annual">একাদশ শ্রেণি বার্ষিক পরীক্ষা</option>
                    <option value="model_test">বোর্ড ফাইনাল মডেল টেস্ট</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">বিভাগ / শাখা</label>
                  <select 
                    value={resultStream} 
                    onChange={(e) => setResultStream(e.target.value)} 
                    className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg p-2"
                  >
                    <option value="science">বিজ্ঞান শাখা</option>
                    <option value="business">ব্যবসায় শিক্ষা</option>
                    <option value="humanities">মানবিক শাখা</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">কলেজ রোল নম্বর</label>
                  <input 
                    type="text" 
                    value={rollQuery} 
                    onChange={(e) => setRollQuery(e.target.value)}
                    placeholder="যেমন: ১০১" 
                    className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div className="flex items-end">
                  <button 
                    type="submit" 
                    className="w-full bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs py-2 rounded-lg transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Search size={14}/>
                    <span>ফলাফল দেখুন</span>
                  </button>
                </div>
              </form>

              {/* Result Display */}
              {foundStudentResult && foundStudentResult !== 'not_found' && (
                <div className="border border-blue-200 rounded-2xl p-6 bg-blue-50/30 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-blue-200 gap-2">
                    <div>
                      <div className="text-base font-black text-slate-900">{foundStudentResult.name}</div>
                      <div className="text-xs text-slate-600">রোল: {foundStudentResult.roll} • রেজি: {foundStudentResult.reg} • {foundStudentResult.stream}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500 font-bold">প্রাপ্ত জিপিএ (GPA)</div>
                      <div className="text-2xl font-black text-blue-700">{foundStudentResult.gpa} ({foundStudentResult.grade})</div>
                    </div>
                  </div>

                  {/* Marks Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-blue-100/70 text-blue-900 font-bold">
                        <tr>
                          <th className="p-2.5 rounded-l-lg">বিষয় কোড ও নাম</th>
                          <th className="p-2.5 text-center">পূর্ণমান</th>
                          <th className="p-2.5 text-center">প্রাপ্ত নম্বর</th>
                          <th className="p-2.5 rounded-r-lg text-center">গ্রেড</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-blue-100">
                        {foundStudentResult.subjects.map((sub: any, i: number) => (
                          <tr key={i} className="hover:bg-blue-50/50">
                            <td className="p-2.5 font-medium text-slate-800">{sub.name} ({sub.code})</td>
                            <td className="p-2.5 text-center text-slate-600">{sub.full}</td>
                            <td className="p-2.5 text-center font-bold text-slate-900">{sub.marks}</td>
                            <td className="p-2.5 text-center font-black text-emerald-600">{sub.grade}</td>
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
                      <Printer size={13}/> মার্কশিট প্রিন্ট করুন
                    </button>
                  </div>
                </div>
              )}

              {foundStudentResult === 'not_found' && (
                <div className="p-6 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-center text-xs space-y-1">
                  <div className="font-bold text-sm">কোনো ফলাফল পাওয়া যায়নি!</div>
                  <p>অনুগ্রহ করে সঠিক রোল নম্বর ও পরীক্ষার নাম নির্বাচন করে আবার চেষ্টা করুন। (টেস্ট করতে রোল ১০১ লিখুন)</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: FACILITIES & LABS */}
        {activeTab === 'facilities' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">ক্যাম্পাস সুযোগ-সুবিধা</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">আধুনিক ল্যাব ও অবকাঠামো</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'পদার্থ ও রসায়ন ল্যাব', desc: 'উচ্চ মাধ্যমিক বিজ্ঞান বিভাগের জন্য আধুনিক ডিজিটাল মাইক্রোস্কোপ, স্পেকট্রোমিটার ও কেমিক্যাল অ্যাপারেটাস সজ্জিত নিরাপদ ল্যাব।' },
                { title: 'মাল্টিমিডিয়া কম্পিউটার ল্যাব', desc: 'আইসিটি ক্লাস ও সিএসই শিক্ষার্থীদের জন্য উচ্চগতির ব্রডব্যান্ড ইন্টারনেট এবং ৫০+ কোর আই-৭ কম্পিউটার বিশিষ্ট অত্যাধুনিক ল্যাব।' },
                { title: 'কেন্দ্রীয় কলেজ লাইব্রেরি', desc: '২০,০০০+ রেফারেন্স বই, জার্নাল, জাতীয় দৈনিক এবং নিরিবিলি শীতাতপ নিয়ন্ত্রিত রিডিং রুমের সুবিধা।' },
                { title: 'জীববিজ্ঞান ও উদ্ভিদ ল্যাব', desc: 'ব্যবহারিক ক্লাসের জন্য প্রিজার্ভড স্পেসিমেন ও আধুনিক কাঁচের যন্ত্রপাতি সজ্জিত জীববিদ্যা ল্যাব।' },
                { title: 'অডিটোরিয়াম ও সেমিনার হল', desc: '৫০০ আসন বিশিষ্ট কেন্দ্রীয় অডিটোরিয়াম যেখানে বিতর্ক প্রতিযোগিতা, জাতীয় দিবস ও সাংস্কৃতিক অনুষ্ঠান অনুষ্ঠিত হয়।' },
                { title: 'ক্যাফেটেরিয়া ও কমন রুম', desc: 'শিক্ষার্থীদের জন্য স্বাস্থ্যসম্মত খাবার, ইনডোর গেমস (টেবিল টেনিস, দাবা) ও প্রাথমিক চিকিৎসা কেন্দ্র।' }
              ].map((f, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                    <FlaskConical size={20} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{f.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: FACULTY */}
        {activeTab === 'faculty' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">কলেজ অনুষদ পরিষদ</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">সম্মানিত শিক্ষকমণ্ডলী</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {COLLEGE_FACULTY.map((faculty) => (
                <div key={faculty.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
                  <img 
                    src={faculty.photo} 
                    alt={faculty.name} 
                    className="w-18 h-18 rounded-xl object-cover border border-slate-200 shrink-0" 
                  />
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">{faculty.name}</h3>
                    <div className="text-xs font-bold text-blue-700">{faculty.designation}</div>
                    <div className="text-[11px] text-slate-500 font-medium">{faculty.dept}</div>
                    <p className="text-[11px] text-slate-600 pt-1 line-clamp-2">{faculty.qualification}</p>
                  </div>
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
                  <h2 className="text-2xl font-black text-slate-900">কলেজ নোটিশ বোর্ড</h2>
                  <p className="text-xs text-slate-500 mt-1">এইচএসসি, ডিগ্রি ও অনার্স পর্যায়ের সকল প্রাতিষ্ঠানিক বিজ্ঞপ্তি</p>
                </div>
              </div>

              <div className="space-y-4">
                {COLLEGE_NOTICES.map((notice) => (
                  <div key={notice.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
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
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">আমাদের সাথে যোগাযোগ</span>
              <h2 className="text-2xl font-black text-slate-900">{collegeName} ক্যাম্পাস</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4 text-xs sm:text-sm text-slate-600">
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-blue-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900">ক্যাম্পাস ঠিকানা:</div>
                      <div>{collegeAddress}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone size={18} className="text-blue-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900">টেলিফোন / হেল্পলাইন:</div>
                      <div>{collegePhone}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail size={18} className="text-blue-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900">ই-মেইল:</div>
                      <div>{collegeEmail}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock size={18} className="text-blue-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900">অফিস সময়:</div>
                      <div>সকাল ৮:০০ - বিকাল ৪:০০ (শুক্রবার বন্ধ)</div>
                    </div>
                  </div>
                </div>

                {/* Quick Message Form */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    setContactSubmitted(true);
                  }}
                  className="space-y-3 bg-slate-50 p-5 rounded-xl border border-slate-200"
                >
                  <h4 className="text-xs font-bold text-slate-900">বার্তা পাঠান</h4>
                  {contactSubmitted ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg">
                      ধন্যবাদ! আপনার বার্তা কলেজ অফিসে সফলভাবে পাঠানো হয়েছে।
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
                        placeholder="আপনার বার্তা..." 
                        className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
                      ></textarea>
                      <button 
                        type="submit" 
                        className="w-full bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs py-2 rounded-lg cursor-pointer"
                      >
                        বার্তা প্রেরণ করুন
                      </button>
                    </>
                  )}
                </form>
              </div>
            </div>
          </div>
        )}

        {/* TAB: PORTAL LOGIN */}
        {activeTab === 'portal' && (
          <div className="max-w-md mx-auto px-4 py-16">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-lg space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto">
                  <Lock size={22} />
                </div>
                <h2 className="text-xl font-black text-slate-900">কলেজ শিক্ষার্থী ও শিক্ষক পোর্টাল</h2>
                <p className="text-xs text-slate-500">আপনার কলেজ রোল ও পাসওয়ার্ড দিয়ে ড্যাশবোর্ডে প্রবেশ করুন</p>
              </div>

              <form onSubmit={handlePortalLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">কলেজ আইডি / রোল নম্বর</label>
                  <input 
                    type="text" 
                    value={portalRoll}
                    onChange={(e) => setPortalRoll(e.target.value)}
                    required 
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">পাসওয়ার্ড</label>
                  <input 
                    type="password" 
                    value={portalPassword}
                    onChange={(e) => setPortalPassword(e.target.value)}
                    required 
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs py-2.5 rounded-lg shadow-sm transition-all cursor-pointer"
                >
                  লগইন করুন
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* 4. FOOTER (STRICTLY COLLEGE) */}
      <footer className="bg-slate-900 text-slate-300 text-xs py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="font-black text-base text-white">{collegeName}</div>
            <p className="text-slate-400 text-xs leading-relaxed">
              উচ্চ মাধ্যমিক, ডিগ্রি ও স্নাতক পর্যায়ে আধুনিক শিক্ষা, নিয়মানুবর্তিতা ও গবেষণার আদর্শ বিদ্যাপীঠ।
            </p>
            <div className="text-[11px] font-mono text-blue-400">
              EIIN: {collegeEIIN} • কোড: {collegeCode}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs mb-3 uppercase tracking-wider">জরুরি লিংক</h4>
            <ul className="space-y-2 text-slate-400 text-xs">
              <li><button onClick={() => handleTabChange('admission')} className="hover:text-white">একাদশ শ্রেণি ভর্তি</button></li>
              <li><button onClick={() => handleTabChange('results')} className="hover:text-white">এইচএসসি ফলাফল</button></li>
              <li><button onClick={() => handleTabChange('academics')} className="hover:text-white">বিভাগ ও বিষয়সমূহ</button></li>
              <li><button onClick={() => handleTabChange('notices')} className="hover:text-white">নোটিশ বোর্ড</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs mb-3 uppercase tracking-wider">অধিভুক্ত বোর্ড ও বিশ্ববিদ্যালয়</h4>
            <ul className="space-y-2 text-slate-400 text-xs">
              <li>মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড, ঢাকা</li>
              <li>জাতীয় বিশ্ববিদ্যালয় (National University)</li>
              <li>শিক্ষা মন্ত্রণালয়, গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs mb-3 uppercase tracking-wider">ক্যাম্পাস যোগাযোগ</h4>
            <p className="text-slate-400 text-xs">{collegeAddress}</p>
            <p className="text-slate-400 text-xs">ফোন: {collegePhone}</p>
            <p className="text-slate-400 text-xs">ই-মেইল: {collegeEmail}</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 mt-8 border-t border-slate-800 text-center text-slate-500 text-[11px]">
          © {new Date().getFullYear()} {collegeName}। সর্বস্বত্ব সংরক্ষিত।
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
              institutionType="College"
              onClose={() => setIsAdmissionModalOpen(false)}
              onComplete={() => setIsAdmissionModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const TargetIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <circle cx="12" cy="12" r="10" strokeWidth="2"/>
    <circle cx="12" cy="12" r="6" strokeWidth="2"/>
    <circle cx="12" cy="12" r="2" strokeWidth="2"/>
  </svg>
);
