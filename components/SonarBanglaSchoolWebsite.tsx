import React, { useState, useEffect } from 'react';
import { 
  Phone, Mail, MapPin, Calendar, Clock, Search, BookOpen, Award, 
  Users, Image as ImageIcon, ChevronRight, Download, CheckCircle2, 
  Check, ArrowRight, ShieldCheck, UserCheck, Star, FileText, 
  ExternalLink, LogIn, Menu, X, Filter, GraduationCap, School, 
  Send, Sparkles, Building2, Bell, AlertCircle, Eye, Printer, User,
  Globe, ChevronDown, HelpCircle, Lock, BookMarked, Compass, HeartHandshake
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { StudentAdmissionForm } from './StudentAdmissionForm';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { InstitutionTopSwitcher } from './InstitutionTopSwitcher';

export type SchoolPageTab = 
  | 'home' 
  | 'about' 
  | 'academics' 
  | 'admission' 
  | 'results' 
  | 'gallery' 
  | 'teachers' 
  | 'notices' 
  | 'contact' 
  | 'admin-login' 
  | 'portal';

import { Tenant } from '../types';

interface SonarBanglaSchoolWebsiteProps {
  initialTab?: SchoolPageTab;
  tenant?: Tenant;
  showSwitcher?: boolean;
}

export const SonarBanglaSchoolWebsite: React.FC<SonarBanglaSchoolWebsiteProps> = ({ 
  initialTab = 'home',
  tenant,
  showSwitcher = false
}) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState<SchoolPageTab>(initialTab);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lang, setLang] = useState<'bn' | 'en'>('bn');

  // Modals & Interactive States
  const [isAdmissionModalOpen, setIsAdmissionModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any | null>(null);

  const currentTenant: Tenant = tenant || {
    id: 'sonar-bangla',
    name: 'সোনার বাংলা আদর্শ উচ্চ বিদ্যালয়',
    type: 'School',
    subdomain: 'sonar-bangla',
    customDomain: 'sonarbangla.edu.bd',
    logoUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=200&h=200&fit=crop',
    status: 'Active',
    studentsCount: 1050,
    maxStudents: 2500,
    plan: 'Premium',
    revenue: 35000,
    enabledModules: ['academic', 'finance', 'hr', 'exams', 'communication', 'portal', 'library', 'admissions'],
    eiin: '134567',
    code: 'SBIHS-1985',
    contactPhone: '+880 1711-234567',
    contactEmail: 'info@sonarbangla.edu.bd',
    address: 'রোড #০৫, ব্লক-বি, সোনার বাংলা রোড, ঢাকা-১২১৬, বাংলাদেশ',
    establishedYear: '1985',
    principalName: 'মো: আব্দুল করিম'
  };
  const [selectedNotice, setSelectedNotice] = useState<any | null>(null);
  const [selectedImage, setSelectedImage] = useState<any | null>(null);

  // Search & Filters
  const [teacherSearch, setTeacherSearch] = useState('');
  const [teacherDept, setTeacherDept] = useState('All');
  const [galleryCategory, setGalleryCategory] = useState('All');
  const [noticeCategory, setNoticeCategory] = useState('All');
  const [academicLevel, setAcademicLevel] = useState<'primary' | 'secondary' | 'higher'>('secondary');
  const [expandedCurriculum, setExpandedCurriculum] = useState<string>('bangla');

  // Results Tab States
  const [examType, setExamType] = useState<'ssc' | 'hsc' | 'annual'>('ssc');
  const [resultYear, setResultYear] = useState('2024');
  const [resultClass, setResultClass] = useState('10');
  const [rollSearchQuery, setRollSearchQuery] = useState('');
  const [searchedStudentResult, setSearchedStudentResult] = useState<any | null>(null);

  // Contact Form
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [contactSuccess, setContactSuccess] = useState(false);

  // Admin Login Form
  const [adminUsername, setAdminUsername] = useState('admin@sonarbangla.edu.bd');
  const [adminPassword, setAdminPassword] = useState('admin123');

  // Student / Parent Portal Form
  const [studentId, setStudentId] = useState('ST-2024-001');
  const [studentPassword, setStudentPassword] = useState('student123');
  const [parentMobile, setParentMobile] = useState('01712345678');
  const [parentPassword, setParentPassword] = useState('parent123');

  // Sync tab if prop changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Scroll to top on tab change
  const handleTabChange = (tab: SchoolPageTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Mock Result Records (matches collage Page 5)
  const MERIT_RESULTS = [
    { roll: '101', name: 'মো: আহসানুল ইসলাম', group: 'বিজ্ঞান', gpa: '5.00', status: 'Golden A+', marks: { bangla: 92, english: 88, math: 98, science: 96 } },
    { roll: '102', name: 'সাদিদা আক্তার', group: 'বিজ্ঞান', gpa: '5.00', status: 'A+', marks: { bangla: 86, english: 85, math: 95, science: 91 } },
    { roll: '103', name: 'তানভীর রহমান', group: 'মানবিক', gpa: '4.92', status: 'A+', marks: { bangla: 88, english: 82, math: 86, science: 85 } },
    { roll: '104', name: 'ফারহানা আক্তার', group: 'মানবিক', gpa: '4.88', status: 'A+', marks: { bangla: 84, english: 80, math: 85, science: 82 } },
    { roll: '105', name: 'আব্দুল্লাহ আল নোমান', group: 'ব্যবসায় শিক্ষা', gpa: '4.85', status: 'A+', marks: { bangla: 82, english: 78, math: 90, science: 80 } },
    { roll: '106', name: 'জান্নাতুল মাওয়া', group: 'বিজ্ঞান', gpa: '4.80', status: 'A', marks: { bangla: 80, english: 75, math: 88, science: 84 } },
    { roll: '107', name: 'সাব্বির হোসেন', group: 'ব্যবসায় শিক্ষা', gpa: '4.75', status: 'A', marks: { bangla: 78, english: 76, math: 84, science: 78 } }
  ];

  // Mock Teachers (matches collage Page 7)
  const TEACHERS_LIST = [
    {
      id: 't1',
      name: 'মো: আব্দুল করিম',
      designation: 'প্রধান শিক্ষক',
      dept: 'প্রশাসন ও গণিত',
      qualification: 'এম.এসসি (গণিত), বি.এড (১ম শ্রেণি)',
      experience: '২২ বছরের শিক্ষকতা ও প্রশাসনিক অভিজ্ঞতা',
      phone: '+880 1711-234567',
      email: 'headmaster@sonarbangla.edu.bd',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face'
    },
    {
      id: 't2',
      name: 'ফারহানা আক্তার',
      designation: 'সহকারী প্রধান শিক্ষক',
      dept: 'ইংরেজি বিভাগ',
      qualification: 'এম.এ (ইংরেজি সাহিত্য), বি.এড',
      experience: '১৬ বছরের অভিজ্ঞ শিক্ষিকা',
      phone: '+880 1722-334455',
      email: 'farhana@sonarbangla.edu.bd',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face'
    },
    {
      id: 't3',
      name: 'মো: সাইফুল ইসলাম',
      designation: 'সিনিয়র শিক্ষক',
      dept: 'বিজ্ঞান বিভাগ',
      qualification: 'এম.এসসি (পদার্থবিজ্ঞান), ঢাকা বিশ্ববিদ্যালয়',
      experience: '১২ বছরের পাঠদান অভিজ্ঞতা',
      phone: '+880 1733-445566',
      email: 'saiful@sonarbangla.edu.bd',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face'
    },
    {
      id: 't4',
      name: 'রোকসানা বেগম',
      designation: 'সহকারী শিক্ষক',
      dept: 'বাংলা বিভাগ',
      qualification: 'এম.এ (বাংলা ভাষা ও সাহিত্য)',
      experience: '১০ বছরের শিক্ষকতা অভিজ্ঞতা',
      phone: '+880 1744-556677',
      email: 'roksana@sonarbangla.edu.bd',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face'
    },
    {
      id: 't5',
      name: 'মাহমুদা আক্তার',
      designation: 'সহকারী শিক্ষক',
      dept: 'ইংরেজি বিভাগ',
      qualification: 'এম.এ (ইংরেজি)',
      experience: '৮ বছরের শিক্ষকতা অভিজ্ঞতা',
      phone: '+880 1755-667788',
      email: 'mahmuda@sonarbangla.edu.bd',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face'
    },
    {
      id: 't6',
      name: 'আরিফুর রহমান',
      designation: 'সহকারী শিক্ষক',
      dept: 'গণিত বিভাগ',
      qualification: 'এম.এসসি (ফলিত গণিত)',
      experience: '৭ বছরের শিক্ষকতা অভিজ্ঞতা',
      phone: '+880 1766-778899',
      email: 'arifur@sonarbangla.edu.bd',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face'
    }
  ];

  // Mock Gallery (matches collage Page 6)
  const GALLERY_ITEMS = [
    {
      id: 'g1',
      title: 'বার্ষিক ক্রীড়া প্রতিযোগিতা',
      category: 'খেলাধুলা',
      image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=600&fit=crop',
      desc: 'বিদ্যালয়ের বার্ষিক ক্রীড়া প্রতিযোগিতায় শিক্ষার্থীদের স্বতঃস্ফূর্ত দৌড় ও ট্র্যাক ইভেন্ট'
    },
    {
      id: 'g2',
      title: 'ক্লাস রুম কার্যক্রম',
      category: 'শিক্ষা কার্যক্রম',
      image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=600&fit=crop',
      desc: 'স্মার্ট ক্লাসরুমে মাল্টিমিডিয়া প্রজেক্টরের মাধ্যমে আধুনিক পদ্ধতিতে পাঠদান'
    },
    {
      id: 'g3',
      title: 'সকালের সমাবেশ ও শৃঙ্খলা',
      category: 'অনুষ্ঠান',
      image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&h=600&fit=crop',
      desc: 'বিদ্যালয় প্রাঙ্গণে জাতীয় সঙ্গীত ও সুশৃঙ্খল প্রাত্যহিক পিটি সমাবেশ'
    },
    {
      id: 'g4',
      title: 'সাংস্কৃতিক অনুষ্ঠান',
      category: 'অনুষ্ঠান',
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop',
      desc: 'মহান বিজয় দিবস ও আন্তর্জাতিক মাতৃভাষা দিবস উপলক্ষে বর্ণাঢ্য সাংস্কৃতিক পরিবেশনা'
    },
    {
      id: 'g5',
      title: 'পুরস্কার বিতরণী অনুষ্ঠান',
      category: 'অনুষ্ঠান',
      image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=600&fit=crop',
      desc: 'মেধাবী ও কৃতি শিক্ষার্থীদের মাঝে প্রধান অতিথি কর্তৃক ক্রেস্ট ও সনদপত্র বিতরণ'
    },
    {
      id: 'g6',
      title: 'শিক্ষা সফর ও এক্সকারশন',
      category: 'ভ্রমণ',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=600&fit=crop',
      desc: 'সুন্দরবন ও বাগেরহাটের ঐতিহাসিক স্থাপনায় বার্ষিক শিক্ষামূলক শিক্ষাসফর'
    }
  ];

  // Mock Notices (matches collage Page 8)
  const NOTICES_LIST = [
    {
      id: 'n1',
      title: 'এসএসসি পরীক্ষার্থীদের জন্য বিশেষ নির্দেশনা ও প্রবেশপত্র বিতরণ',
      category: 'নোটিশ',
      day: '১৯',
      month: 'মার্চ',
      year: '২০২৪',
      summary: '২০২৪ সালের এসএসসি পরীক্ষায় অংশগ্রহণকারী সকল নিয়মিত ও অনিয়মিত পরীক্ষার্থীদের অবগতির জন্য জানানো যাচ্ছে...',
      details: 'আগামী ২৫ মার্চ ২০২৪ তারিখ থেকে বিদ্যালয়ের অফিস কক্ষ হতে সকাল ১০টা থেকে দুপুর ২টা পর্যন্ত প্রবেশপত্র বিতরণ করা হবে। সকল শিক্ষার্থীকে নির্ধারিত ফি পরিশোধ সাপেক্ষে প্রবেশপত্র সংগ্রহের জন্য নির্দেশ প্রদান করা হলো।'
    },
    {
      id: 'n2',
      title: 'বিদ্যালয়ের বার্ষিক ক্রীড়া প্রতিযোগিতা অনুষ্ঠিত ও ফলাফল ঘোষণা',
      category: 'ইভেন্ট',
      day: '১০',
      month: 'মার্চ',
      year: '২০২৪',
      summary: 'অত্যন্ত আনন্দঘন ও উৎসবমুখর পরিবেশে বিদ্যালয়ের ৪০তম বার্ষিক ক্রীড়া প্রতিযোগিতা উদযাপিত হয়েছে...',
      details: 'অনুষ্ঠানে প্রধান অতিথি হিসেবে উপস্থিত ছিলেন স্থানীয় উপজেলা নির্বাহী কর্মকর্তা এবং বিশিষ্ট শিক্ষানুরাগীবৃন্দ। বিজয়ী শিক্ষার্থীদের মাঝে আকর্ষণীয় পুরস্কার বিতরণ করা হয়।'
    },
    {
      id: 'n3',
      title: 'শিক্ষা সফরে সুন্দরবন ও ষাটগম্বুজ মসজিদ এক্সকারশন',
      category: 'ইভেন্ট',
      day: '০৬',
      month: 'মার্চ',
      year: '২০২৪',
      summary: '৬ষ্ঠ থেকে ১০ম শ্রেণির শিক্ষার্থীদের জন্য আগামী ১৫ই এপ্রিল তিন দিনব্যাপী ঐতিহাসিক শিক্ষা সফরের আয়োজন...',
      details: 'শিক্ষা সফরে অংশগ্রহণকারী শিক্ষার্থীদের আগামী ৩০ মার্চের মধ্যে অভিভাবকের লিখিত সম্মতিপত্র ও নির্ধারিত ফি সহ শ্রেণি শিক্ষকের সাথে যোগাযোগ করার অনুরোধ জানানো হচ্ছে।'
    },
    {
      id: 'n4',
      title: 'পবিত্র মাহে রমজান ও শবে বরাত উপলক্ষে দোয়া মাহফিল ও ছুটির বিজ্ঞপ্তি',
      category: 'নোটিশ',
      day: '২৬',
      month: 'ফেব্রুয়ারি',
      year: '২০২৪',
      summary: 'পবিত্র রমজানুল মোবারক উপলক্ষে আগামী ১২ই মার্চ হতে বিদ্যালয় বন্ধ থাকবে এবং অনলাইন ক্লাস চালু থাকবে...',
      details: 'বিদ্যালয়ের শিক্ষক-শিক্ষার্থী ও অভিভাবকদের উপস্থিতিতে বিশেষ দোয়া ও মোনাজাত অনুষ্ঠিত হবে। মাহে রমজানের পবিত্রতা রক্ষায় সবার সহযোগিতা কাম্য।'
    }
  ];

  // Handle Result Search
  const handleSearchRoll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rollSearchQuery.trim()) return;
    const found = MERIT_RESULTS.find(r => r.roll === rollSearchQuery.trim());
    if (found) {
      setSearchedStudentResult(found);
    } else {
      setSearchedStudentResult('not_found');
    }
  };

  // Handle Admin Login submission
  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(adminUsername, adminPassword, UserRole.SCHOOL_ADMIN);
    navigate('/school');
  };

  // Handle Student / Parent Portal submission
  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login('student@sonarbangla.edu.bd', studentPassword, UserRole.STUDENT);
    navigate('/student/dashboard');
  };

  const handleParentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login('parent@sonarbangla.edu.bd', parentPassword, UserRole.PARENT);
    navigate('/parent/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased selection:bg-emerald-600 selection:text-white">
      
      {/* 0. PERSISTENT TOP INSTITUTION SWITCHER (DISABLED ON ISOLATED INSTITUTION WEBSITES) */}
      {showSwitcher && (
        <InstitutionTopSwitcher 
          currentInstitution="school" 
          activePageTab={activeTab} 
          onPageSelect={(tab) => handleTabChange(tab as SchoolPageTab)} 
        />
      )}

      {/* 1. TOP UTILITY HEADER BAR (MATCHES IMAGE 1) */}
      <div className="bg-[#093c32] text-emerald-100 text-xs py-2 px-4 border-b border-emerald-800/80">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex flex-wrap items-center gap-4 text-[11px] font-medium">
            <span className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Mail size={13} className="text-amber-300" /> info@sonarbangla.edu.bd
            </span>
            <span className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Phone size={13} className="text-amber-300" /> +৮৮০ ১৭১১-২৩৪৫৬৭
            </span>
            <span className="bg-[#062c24] text-emerald-300 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold border border-emerald-800">
              EIIN: ১২৩৪৫৬ • কোড: ১০১২
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Bilingual Switcher */}
            <div className="inline-flex items-center bg-[#062c24] p-0.5 rounded-lg border border-emerald-700/60 text-[10px] font-bold">
              <button 
                onClick={() => setLang('bn')} 
                className={`px-2.5 py-0.5 rounded transition-all cursor-pointer ${lang === 'bn' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-300 hover:text-white'}`}
              >
                বাংলা
              </button>
              <button 
                onClick={() => setLang('en')} 
                className={`px-2.5 py-0.5 rounded transition-all cursor-pointer ${lang === 'en' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-300 hover:text-white'}`}
              >
                English
              </button>
            </div>

            <span className="text-emerald-700">|</span>

            {/* Quick Access to Portals */}
            <button 
              onClick={() => handleTabChange('portal')}
              className="hover:text-amber-300 transition-colors font-bold text-[11px] flex items-center gap-1 text-emerald-200 cursor-pointer"
            >
              <User size={13} className="text-amber-300" />
              <span>{lang === 'bn' ? 'শিক্ষার্থী / অভিভাবক পোর্টাল' : 'Student/Parent Portal'}</span>
            </button>
            
            <button 
              onClick={() => handleTabChange('admin-login')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-md font-bold text-[11px] transition-all flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <Lock size={12} />
              <span>{lang === 'bn' ? 'অ্যাডমিন লগইন' : 'Admin Login'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN BRAND HEADER (MATCHES IMAGE 1) */}
      <header className="bg-white border-b border-slate-200/90 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex justify-between items-center gap-4">
          
          {/* Logo & School Identity with circular wreath crest */}
          <div 
            onClick={() => handleTabChange('home')}
            className="flex items-center gap-3.5 cursor-pointer group select-none"
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-800 via-emerald-600 to-teal-600 p-0.5 shadow-md group-hover:scale-105 transition-transform shrink-0 flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center p-1 border-2 border-amber-400">
                <School size={22} className="text-emerald-700" />
                <span className="text-[7.5px] font-black text-amber-600 tracking-tighter leading-none mt-0.5">১৯৯৫</span>
              </div>
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-black text-emerald-900 leading-tight tracking-tight group-hover:text-emerald-700 transition-colors">
                সোনার বাংলা আদর্শ উচ্চ বিদ্যালয়
              </h1>
              <p className="text-xs sm:text-sm font-bold text-slate-600 tracking-wide font-sans">
                Sonar Bangla Ideal High School
              </p>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                স্থাপিত: ১৯৯৫ | কোড: ১০১২ | ঢাকা, বাংলাদেশ
              </p>
            </div>
          </div>

          {/* Quick Actions & Search */}
          <div className="hidden lg:flex items-center gap-3">
            <button 
              onClick={() => handleTabChange('results')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-emerald-700 transition-colors cursor-pointer"
            >
              <Search size={14} className="text-emerald-600" />
              <span>ফলাফল অনুসন্ধান</span>
            </button>

            <button 
              onClick={() => setIsAdmissionModalOpen(true)}
              className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-emerald-700/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles size={14} className="text-amber-300" />
              <span>অনলাইন ভর্তি ফরম</span>
            </button>
          </div>

          {/* Mobile menu trigger */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* 3. PRIMARY NAVIGATION BAR (SOLID DARK TEAL GREEN MATCHING IMAGE 1) */}
        <div className="bg-[#0b5e52] border-t border-emerald-900/40 shadow-inner">
          <div className="max-w-7xl mx-auto px-4">
            <nav className="hidden lg:flex items-center justify-between text-xs font-bold text-white">
              <div className="flex items-center space-x-0.5">
                {[
                  { id: 'home', label: 'হোম', enLabel: 'Home' },
                  { id: 'about', label: 'আমাদের সম্পর্কে', enLabel: 'About Us' },
                  { id: 'admission', label: 'ভর্তি', enLabel: 'Admission' },
                  { id: 'academics', label: 'একাডেমিক', enLabel: 'Academics' },
                  { id: 'results', label: 'ফলাফল', enLabel: 'Results' },
                  { id: 'gallery', label: 'গ্যালারি', enLabel: 'Gallery' },
                  { id: 'teachers', label: 'শিক্ষকবৃন্দ', enLabel: 'Teachers' },
                  { id: 'notices', label: 'নোটিশ', enLabel: 'Notice' },
                  { id: 'contact', label: 'যোগাযোগ', enLabel: 'Contact' }
                ].map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id as SchoolPageTab)}
                      className={`px-3.5 py-2.5 transition-all cursor-pointer relative ${
                        isActive
                          ? 'text-white bg-[#074238] shadow-inner font-black'
                          : 'text-emerald-100 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <span>{lang === 'bn' ? item.label : item.enLabel}</span>
                      {isActive && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 py-1">
                <button
                  onClick={() => handleTabChange('admin-login')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'admin-login'
                      ? 'bg-amber-400 text-slate-950 font-black'
                      : 'text-emerald-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  অ্যাডমিন লগইন
                </button>
                <button
                  onClick={() => handleTabChange('portal')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'portal'
                      ? 'bg-amber-400 text-slate-950 font-black'
                      : 'text-emerald-950 bg-amber-400 hover:bg-amber-300 font-black'
                  }`}
                >
                  পোর্টাল
                </button>
                <button
                  onClick={() => handleTabChange('results')}
                  className="p-2 text-emerald-200 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
                  title="Search / অনুসন্ধান"
                >
                  <Search size={15} />
                </button>
              </div>
            </nav>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-1 shadow-lg animate-in slide-in-from-top-2">
            {[
              { id: 'home', label: 'হোম' },
              { id: 'about', label: 'আমাদের সম্পর্কে' },
              { id: 'academics', label: 'একাডেমিক' },
              { id: 'admission', label: 'ভর্তি' },
              { id: 'results', label: 'ফলাফল' },
              { id: 'gallery', label: 'গ্যালারি' },
              { id: 'teachers', label: 'শিক্ষকবৃন্দ' },
              { id: 'notices', label: 'নোটিশ ও ইভেন্ট' },
              { id: 'contact', label: 'যোগাযোগ' },
              { id: 'admin-login', label: 'অ্যাডমিন লগইন' },
              { id: 'portal', label: 'শিক্ষার্থী / অভিভাবক পোর্টাল' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id as SchoolPageTab)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold flex items-center justify-between ${
                  activeTab === item.id 
                    ? 'bg-emerald-50 text-emerald-700 font-black' 
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{item.label}</span>
                <ChevronRight size={15} className="text-slate-400" />
              </button>
            ))}
          </div>
        )}
      </header>

      {/* 4. MAIN BODY CONTAINER (PAGES 1 to 11) */}
      <main className="min-h-[70vh]">

        {/* ========================================================= */}
        {/* PAGE 1: HOME PAGE (হোম পেজ)                              */}
        {/* ========================================================= */}
        {activeTab === 'home' && (
          <div className="space-y-10 pb-16">
            
            {/* HERO SECTION WITH LUSH BANNER */}
            <section className="relative min-h-[460px] md:min-h-[500px] flex items-center justify-center text-white overflow-hidden bg-slate-900">
              <img 
                src="https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=1600&h=900&fit=crop" 
                alt="School Campus Banner"
                className="absolute inset-0 w-full h-full object-cover opacity-35 transform scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-emerald-900/80 to-slate-950/90" />
              
              <div className="relative z-10 max-w-4xl mx-auto px-4 text-center space-y-5 animate-in fade-in duration-500">
                <span className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs uppercase px-3 py-1 rounded-full font-bold backdrop-blur-xs">
                  <Sparkles size={14} className="text-amber-400" />
                  ঐতিহ্যবাহী বিদ্যাপীঠ • প্রতিষ্ঠিত ১৯৮৫
                </span>

                <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                  জ্ঞানই শক্তি, শিক্ষাই উন্নতি
                </h2>

                <p className="text-base sm:text-xl font-medium text-emerald-100/90 max-w-2xl mx-auto leading-relaxed">
                  Better Education • Brighter Future
                </p>

                <div className="pt-3 flex flex-wrap items-center justify-center gap-3.5">
                  <button 
                    onClick={() => handleTabChange('admission')}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold px-6 py-3 rounded-xl text-sm shadow-lg shadow-emerald-900/40 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
                  >
                    <span>ভর্তি তথ্য দেখুন</span>
                    <ArrowRight size={16} />
                  </button>

                  <button 
                    onClick={() => setIsAdmissionModalOpen(true)}
                    className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold px-6 py-3 rounded-xl text-sm backdrop-blur-xs transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>অনলাইনে আবেদন করুন</span>
                  </button>
                </div>
              </div>
            </section>

            {/* QUICK ACTION CARDS (FROM COLLAGE PAGE 1) */}
            <section className="max-w-7xl mx-auto px-4 -mt-10 relative z-20">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { id: 'admission', label: 'ভর্তি আবেদন', sub: 'Admission Online', icon: BookOpen, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
                  { id: 'results', label: 'ফলাফল', sub: 'Exam Results', icon: Award, color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200' },
                  { id: 'gallery', label: 'গ্যালারি', sub: 'Photo Gallery', icon: ImageIcon, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
                  { id: 'teachers', label: 'শিক্ষকবৃন্দ', sub: 'Faculty Members', icon: Users, color: 'text-teal-700', bg: 'bg-teal-50 border-teal-200' }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id as SchoolPageTab)}
                      className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:border-emerald-500 transition-all group text-left cursor-pointer flex flex-col justify-between"
                    >
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${item.bg} border`}>
                        <Icon size={22} className={item.color} />
                      </div>
                      <div>
                        <h4 className="text-base font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {item.label}
                        </h4>
                        <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                          {item.sub}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* NOTICE RUNNING TICKER */}
            <section className="max-w-7xl mx-auto px-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center gap-3 overflow-hidden shadow-xs">
                <span className="bg-emerald-700 text-white text-[11px] font-black uppercase px-2.5 py-1 rounded-md shrink-0 flex items-center gap-1">
                  <Bell size={12} />
                  <span>জরুরি নোটিশ</span>
                </span>
                <div className="text-xs font-semibold text-slate-700 truncate cursor-pointer hover:text-emerald-800" onClick={() => handleTabChange('notices')}>
                  ২০২৪ শিক্ষাবর্ষের ৬ষ্ঠ থেকে ৯ম শ্রেণির ভর্তি ফরম বিতরণ চলছে • এসএসসি পরীক্ষার্থীদের বিশেষ প্রস্তুতিমূলক ক্লাস আগামী রবিবার থেকে শুরু...
                </div>
              </div>
            </section>

            {/* WELCOME SECTION (COLLAGE PAGE 1) */}
            <section className="max-w-7xl mx-auto px-4 py-6">
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-lg grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left Photo of Students */}
                <div className="lg:col-span-5 relative">
                  <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-4/3 border-4 border-white">
                    <img 
                      src="https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=600&fit=crop" 
                      alt="Students in uniform"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="absolute -bottom-4 -right-4 bg-emerald-700 text-white p-3.5 rounded-2xl shadow-lg text-center font-bold">
                    <div className="text-2xl font-black leading-none">৩৯+</div>
                    <div className="text-[10px] text-emerald-200 uppercase mt-0.5">বছরের সাফল্য</div>
                  </div>
                </div>

                {/* Right Welcome Description */}
                <div className="lg:col-span-7 space-y-4">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-600">
                    সোনার বাংলা আদর্শ উচ্চ বিদ্যালয়
                  </span>
                  
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 leading-snug">
                    স্বাগতম সোনার বাংলা আদর্শ উচ্চ বিদ্যালয়ে
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    সোনার বাংলা আদর্শ উচ্চ বিদ্যালয় ১৯৮৫ সাল থেকে মানসম্মত শিক্ষা, শৃঙ্খলা ও মানবিক মূল্যবোধের এক উজ্জ্বল প্রতীক হিসেবে পরিচিত। দক্ষ ও অভিজ্ঞ শিক্ষক মণ্ডলীর তত্ত্বাবধানে শিক্ষার্থীদের মেধা বিকাশ, আধুনিক বিজ্ঞানাগার ও ডিজিটাল ক্লাসরুমের মাধ্যমে আমরা প্রতিটি সন্তানকে আগামী দিনের যোগ্য ও দায়িত্বশীল সুনাগরিক হিসেবে গড়ে তুলছি।
                  </p>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                      <span>অভিজ্ঞ ও নিবেদিতপ্রাণ শিক্ষক</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                      <span>মাল্টিমিডিয়া ডিজিটাল ক্লাসরুম</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                      <span>সমৃদ্ধ বিজ্ঞান ও কম্পিউটার ল্যাব</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                      <span>শতভাগ পাস ও মেধাভিত্তিক ফলাফল</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button 
                      onClick={() => handleTabChange('about')}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
                    >
                      <span>আরও জানুন</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ========================================================= */}
        {/* PAGE 2: ABOUT US (আমাদের সম্পর্কে)                        */}
        {/* ========================================================= */}
        {activeTab === 'about' && (
          <div className="max-w-7xl mx-auto px-4 py-8 space-y-10 animate-in fade-in duration-300">
            {/* Page Title */}
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-3xl font-black text-emerald-800">আমাদের সম্পর্কে</h2>
              <p className="text-xs font-semibold text-slate-400 mt-1">About Us • সোনার বাংলা আদর্শ উচ্চ বিদ্যালয়</p>
            </div>

            {/* Story & Campus Photo */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="lg:col-span-5 rounded-2xl overflow-hidden shadow-md">
                <img 
                  src="https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=800&h=600&fit=crop" 
                  alt="School Campus"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="lg:col-span-7 space-y-4">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  ঐতিহ্য, শৃঙ্খলা ও আধুনিক শিক্ষার মেলবন্ধন
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  সোনার বাংলা আদর্শ উচ্চ বিদ্যালয় এলাকার গণ্যমান্য শিক্ষানুরাগীদের মহৎ উদ্যোগে ১৯৮৫ সালে প্রতিষ্ঠিত হয়। প্রতিষ্ঠার পর থেকেই প্রতিষ্ঠানটি এই অঞ্চলের ছেলেমেয়েদের মাঝে শিক্ষার আলো ছড়িয়ে দিয়ে আসছে। আমাদের মূল লক্ষ্য শিক্ষার্থীদের শুধু পরীক্ষায় পাস করানো নয়, বরং তাদেরকে আলোকিত ও দায়িত্বশীল মানুষ হিসেবে গড়ে তোলা।
                </p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  সুবিশাল খেলার মাঠ, উন্মুক্ত সবুজ প্রাঙ্গণ, আধুনিক বিজ্ঞানাগার, ও আইসিটি ল্যাবের মাধ্যমে প্রতিটি শিক্ষার্থী বাস্তবমুখী জ্ঞান অর্জন করার সুযোগ পায়।
                </p>
              </div>
            </div>

            {/* 4 STATS ROW (FROM COLLAGE PAGE 2) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { number: '১৯৮৫', label: 'প্রতিষ্ঠিত সাল', sub: 'Estd. Year', icon: School },
                { number: '১০০০+', label: 'মোট শিক্ষার্থী', sub: 'Total Students', icon: GraduationCap },
                { number: '৫০+', label: 'শিক্ষক/শিক্ষিকা', sub: 'Faculty Members', icon: Users },
                { number: '৪', label: 'শ্রেণি ও শিফট', sub: 'Shifts & Branches', icon: Building2 }
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                      <Icon size={24} />
                    </div>
                    <div className="text-3xl font-black text-emerald-800 font-mono tracking-tight">{stat.number}</div>
                    <div className="text-sm font-bold text-slate-800 mt-1">{stat.label}</div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">{stat.sub}</div>
                  </div>
                );
              })}
            </div>

            {/* GOALS & OBJECTIVES WITH PHOTO */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="lg:col-span-7 space-y-4">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  আমাদের লক্ষ্য ও উদ্দেশ্য
                </h3>
                <div className="space-y-3 pt-2">
                  {[
                    'নৈতিক চরিত্র গঠন ও দেশপ্রেমিক আদর্শ সুনাগরিক গড়ে তোলা',
                    'আধুনিক তথ্যপ্রযুক্তি নির্ভর বাস্তবমুখী বিজ্ঞানসম্মত শিক্ষা প্রদান',
                    'খেলাধুলা, বিতর্ক প্রতিযোগিতা ও সাংস্কৃতিক কর্মকাণ্ডে সার্বিক উৎসাহ প্রদান',
                    'মেধাবী অথচ অসচ্ছল শিক্ষার্থীদের সম্পূর্ণ বিনামূল্যে পড়ার সুযোগ ও উপবৃত্তি'
                  ].map((text, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={13} className="stroke-[3]" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700 leading-snug">{text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5 rounded-2xl overflow-hidden shadow-md">
                <img 
                  src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=600&fit=crop" 
                  alt="School Building Entrance"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PAGE 3: ADMISSION (ভর্তি)                                  */}
        {/* ========================================================= */}
        {activeTab === 'admission' && (
          <div className="max-w-7xl mx-auto px-4 py-8 space-y-10 animate-in fade-in duration-300">
            {/* Page Header */}
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-3xl font-black text-emerald-800">ভর্তি তথ্য</h2>
              <p className="text-xs font-semibold text-slate-400 mt-1">Admission Information • ২০২৪-২০২৫ শিক্ষাবর্ষ</p>
            </div>

            {/* HERO ADMISSION CALLOUT (FROM COLLAGE PAGE 3) */}
            <div className="bg-gradient-to-r from-emerald-900 to-emerald-700 rounded-3xl p-6 sm:p-10 text-white shadow-xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-7 space-y-4">
                <span className="bg-amber-400 text-slate-900 text-xs font-black uppercase px-3 py-1 rounded-full shadow-xs">
                  ভর্তি চলছে
                </span>
                <h3 className="text-2xl sm:text-4xl font-black leading-tight">
                  নতুন শিক্ষার্থীর ভর্তির জন্য আবেদন করুন
                </h3>
                <p className="text-sm text-emerald-100 leading-relaxed max-w-xl">
                  ২০২৪ শিক্ষাবর্ষে ৬ষ্ঠ থেকে ৯ম শ্রেণিতে সীমিত সংখ্যক আসনে শিক্ষার্থী ভর্তি চলছে। মেধা যাচাই পরীক্ষার মাধ্যমে যোগ্য প্রার্থীদের নির্বাচন করা হবে।
                </p>
                <div className="pt-2">
                  <button 
                    onClick={() => setIsAdmissionModalOpen(true)}
                    className="bg-white text-emerald-800 hover:bg-amber-300 font-extrabold px-6 py-3 rounded-xl text-sm shadow-lg transition-all inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles size={16} />
                    <span>অনলাইনে আবেদন করুন</span>
                  </button>
                </div>
              </div>

              <div className="md:col-span-5 rounded-2xl overflow-hidden shadow-lg border-2 border-emerald-400/40">
                <img 
                  src="https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&h=600&fit=crop" 
                  alt="Students Studying"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* 4 DETAIL CARDS (FROM COLLAGE PAGE 3) */}
            <div>
              <h3 className="text-xl font-black text-slate-800 mb-5">ভর্তি সংক্রান্ত তথ্য</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  {
                    title: 'ভর্তি যোগ্যতা',
                    icon: GraduationCap,
                    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
                    desc: 'পূর্ববর্তী শ্রেণিতে উত্তীর্ণের সনদপত্র ও বয়সসীমা সরকারি নীতিমালা অনুযায়ী প্রযোজ্য হবে।'
                  },
                  {
                    title: 'আবেদন প্রক্রিয়া',
                    icon: BookOpen,
                    color: 'text-blue-700 bg-blue-50 border-blue-200',
                    desc: 'অনলাইন পোর্টালের মাধ্যমে ফরম পূরণ করে প্রিন্ট কপি সহ নির্ধারিত ফি অফিসে জমা দিন।'
                  },
                  {
                    title: 'প্রয়োজনীয় কাগজপত্র',
                    icon: FileText,
                    color: 'text-amber-700 bg-amber-50 border-amber-200',
                    desc: 'ডিজিটাল জন্ম নিবন্ধন সনদ, ৩ কপি পাসপোর্ট ছবি ও পিতা-মাতার এনআইডি কার্ডের কপি।'
                  },
                  {
                    title: 'ভর্তি পরীক্ষার সময়সূচি',
                    icon: Clock,
                    color: 'text-purple-700 bg-purple-50 border-purple-200',
                    desc: 'লিখিত পরীক্ষা অনুষ্ঠিত হবে সকাল ১০:০০ টায়। বিষয়: বাংলা, ইংরেজি ও গণিত।'
                  }
                ].map((card, i) => {
                  const Icon = card.icon;
                  return (
                    <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${card.color}`}>
                        <Icon size={24} />
                      </div>
                      <h4 className="text-base font-black text-slate-800">{card.title}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">{card.desc}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 text-center">
                <button 
                  onClick={() => setIsAdmissionModalOpen(true)}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold px-8 py-3 rounded-xl text-sm shadow-md transition-all cursor-pointer"
                >
                  বিস্তারিত ভর্তি ফরম পূরণ করুন
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PAGE 4: ACADEMICS (একাডেমিক)                                */}
        {/* ========================================================= */}
        {activeTab === 'academics' && (
          <div className="max-w-7xl mx-auto px-4 py-8 space-y-10 animate-in fade-in duration-300">
            {/* Page Header */}
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-3xl font-black text-emerald-800">একাডেমিক কার্যক্রম</h2>
              <p className="text-xs font-semibold text-slate-400 mt-1">Academic Programs & Curriculum</p>
            </div>

            {/* HERO BANNER */}
            <div className="rounded-3xl overflow-hidden shadow-lg relative h-64 sm:h-72">
              <img 
                src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1600&h=600&fit=crop" 
                alt="Academics Banner" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/40 to-transparent flex items-end p-6 sm:p-10">
                <div className="text-white">
                  <h3 className="text-2xl sm:text-3xl font-black">আধুনিক পাঠ্যক্রম ও নৈতিক শিক্ষা</h3>
                  <p className="text-xs sm:text-sm text-emerald-200 mt-1">জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড (NCTB) অনুমোদিত পাঠ্যসূচি</p>
                </div>
              </div>
            </div>

            {/* LEVEL SELECTOR TABS */}
            <div className="flex gap-2 border-b border-slate-200 pb-2">
              {[
                { id: 'primary', label: 'প্রাথমিক (১ম - ৫ম শ্রেণি)' },
                { id: 'secondary', label: 'মাধ্যমিক (৬ষ্ঠ - ৮ম শ্রেণি)' },
                { id: 'higher', label: 'উচ্চমাধ্যমিক / এসএসসি (৯ম - ১০ম শ্রেণি)' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setAcademicLevel(tab.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    academicLevel === tab.id
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ACCORDION & QUOTE SIDEBAR (FROM COLLAGE PAGE 4) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Subjects Accordion */}
              <div className="lg:col-span-8 space-y-3">
                {[
                  { id: 'bangla', name: 'বাংলা (প্রথম ও দ্বিতীয় পত্র)', code: '১০১, ১০২', desc: 'বাংলা সাহিত্য, ব্যাকরণ, রচনা ও সৃজনশীল লিখন দক্ষতা বৃদ্ধি।' },
                  { id: 'english', name: 'ইংরেজি (English 1st & 2nd)', code: '১০৭, ১০৮', desc: 'English for Today, Grammar in Context, Writing Skills & Spoken English.' },
                  { id: 'math', name: 'সাধারণ গণিত', code: '১০৯', desc: 'পাটিগণিত, বীজগণিত, জ্যামিতি, পরিমিতি ও ত্রিকোণমিতি।' },
                  { id: 'science', name: 'সাধারণ বিজ্ঞান / পদার্থ, রসায়ন, জীববিজ্ঞান', code: '১১২', desc: 'তত্ত্বীয় পাঠদান এবং আধুনিক বিজ্ঞানাগারে হাতে-কলমে প্র্যাকটিক্যাল শিক্ষা।' },
                  { id: 'social', name: 'বাংলাদেশ ও বিশ্বপরিচয়', code: '১৫০', desc: 'ইতিহাস, ঐতিহ্য, সংবিধান, ভূগোল ও নাগরিক অধিকার সম্পর্কিত ধারণা।' },
                  { id: 'religion', name: 'ধর্ম ও নৈতিক শিক্ষা', code: '১১১', desc: 'ইসলাম ও নৈতিক শিক্ষা / হিন্দুধর্ম ও নৈতিক শিক্ষা।' },
                  { id: 'ict', name: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)', code: '১৫৪', desc: 'কম্পিউটার অপারেটিং, অফিস প্রোগ্রাম, ইন্টারনেট নিরাপত্তা ও ডিজিটাল লিটারেসি।' },
                  { id: 'work', name: 'কর্ম ও জীবনমুখী শিক্ষা', code: '১৩৩', desc: 'ব্যবহারিক জীবন দক্ষতা, সৃজনশীল কাজ ও আত্মকর্মসংস্থান।' }
                ].map((sub) => {
                  const isExp = expandedCurriculum === sub.id;
                  return (
                    <div key={sub.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                      <button
                        onClick={() => setExpandedCurriculum(isExp ? '' : sub.id)}
                        className="w-full flex items-center justify-between p-4 text-left font-bold text-sm text-slate-800 hover:bg-emerald-50/50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                            <BookOpen size={16} />
                          </div>
                          <span>{sub.name}</span>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">কোড: {sub.code}</span>
                        </div>
                        <ChevronDown size={18} className={`text-slate-400 transition-transform ${isExp ? 'rotate-180 text-emerald-600' : ''}`} />
                      </button>

                      {isExp && (
                        <div className="p-4 pt-0 text-xs text-slate-600 border-t border-slate-100 bg-slate-50/50 space-y-2">
                          <p className="leading-relaxed">{sub.desc}</p>
                          <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-700">
                            <CheckCircle2 size={13} />
                            <span>সাপ্তাহিক ক্লাস সংখ্যা: ৪ টি • পূর্ণমান: ১০০</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Right Quote & Syllabus Card */}
              <div className="lg:col-span-4 space-y-5">
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <BookMarked size={32} />
                  </div>
                  
                  <blockquote className="text-sm font-semibold text-slate-700 italic leading-relaxed">
                    "শিক্ষা মানুষকে সত্যের সন্ধান দেয়, চরিত্রবান ও আদর্শ নাগরিক হিসেবে গড়ে তোলে।"
                  </blockquote>

                  <p className="text-xs font-bold text-emerald-800">— ড. মুহম্মদ শহীদুল্লাহ</p>

                  <div className="pt-2">
                    <button 
                      onClick={() => alert('সিলেবাস ডাউনলোড শুরু হয়েছে (PDF)...')}
                      className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Download size={14} />
                      <span>সিলেবাস ডাউনলোড</span>
                    </button>
                  </div>
                </div>

                <div className="bg-emerald-800 text-white rounded-3xl p-6 shadow-sm space-y-3">
                  <h4 className="font-black text-sm uppercase tracking-wider text-emerald-200">ক্লাস রুটিন ও পরীক্ষার সূচি</h4>
                  <p className="text-xs text-emerald-100/90 leading-relaxed">
                    চলতি শিক্ষাবর্ষের সকল শ্রেণির ক্লাস রুটিন ও সাময়িক পরীক্ষার সময়সূচি অনলাইন থেকে সংগ্রহ করুন।
                  </p>
                  <button 
                    onClick={() => handleTabChange('results')}
                    className="bg-white text-emerald-900 font-bold px-4 py-2 rounded-xl text-xs hover:bg-amber-300 transition-colors"
                  >
                    রুটিন ও ফলাফল দেখুন
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PAGE 5: RESULTS (ফলাফল)                                    */}
        {/* ========================================================= */}
        {activeTab === 'results' && (
          <div className="max-w-7xl mx-auto px-4 py-8 space-y-10 animate-in fade-in duration-300">
            {/* Page Header */}
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-3xl font-black text-emerald-800">ফলাফল</h2>
              <p className="text-xs font-semibold text-slate-400 mt-1">Examination Results & Merit Registry</p>
            </div>

            {/* EXAM TYPE TABS */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'ssc', label: 'এসএসসি (SSC)' },
                { id: 'hsc', label: 'এইচএসসি (HSC)' },
                { id: 'annual', label: 'বার্ষিক পরীক্ষা' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setExamType(tab.id as any)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    examType === tab.id
                      ? 'bg-emerald-700 text-white shadow-md'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* FILTER SEARCH TOOLBAR (FROM COLLAGE PAGE 5) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <form onSubmit={handleSearchRoll} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">বছর নির্বাচন করুন</label>
                  <select 
                    value={resultYear} 
                    onChange={e => setResultYear(e.target.value)}
                    className="w-full text-xs font-bold border border-slate-200 rounded-xl p-2.5 bg-slate-50 outline-none"
                  >
                    <option value="2024">২০২৪ (2024)</option>
                    <option value="2023">২০২৩ (2023)</option>
                    <option value="2022">২০২২ (2022)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">শ্রেণি নির্বাচন করুন</label>
                  <select 
                    value={resultClass} 
                    onChange={e => setResultClass(e.target.value)}
                    className="w-full text-xs font-bold border border-slate-200 rounded-xl p-2.5 bg-slate-50 outline-none"
                  >
                    <option value="10">১০ম শ্রেণি (SSC)</option>
                    <option value="9">৯ম শ্রেণি</option>
                    <option value="8">৮ম শ্রেণি</option>
                    <option value="7">৭ম শ্রেণি</option>
                    <option value="6">৬ষ্ঠ শ্রেণি</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">রোল নং দিয়ে খুঁজুন</label>
                  <input 
                    type="text" 
                    placeholder="রোল নং (উদা: 101)" 
                    value={rollSearchQuery}
                    onChange={e => setRollSearchQuery(e.target.value)}
                    className="w-full text-xs font-bold border border-slate-200 rounded-xl p-2.5 bg-slate-50 outline-none focus:ring-2 ring-emerald-500"
                  />
                </div>

                <div>
                  <button 
                    type="submit"
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold h-10 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Search size={14} />
                    <span>খুঁজুন</span>
                  </button>
                </div>
              </form>
            </div>

            {/* SEARCHED STUDENT RESULT CARD POPUP IF FOUND */}
            {searchedStudentResult && searchedStudentResult !== 'not_found' && (
              <div className="bg-emerald-50 border-2 border-emerald-500 rounded-3xl p-6 shadow-md animate-in slide-in-from-top-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">ব্যক্তিগত ফলাফল</span>
                    <h4 className="text-xl font-black text-emerald-900 mt-1">{searchedStudentResult.name}</h4>
                    <p className="text-xs text-slate-600">রোল: {searchedStudentResult.roll} • বিভাগ: {searchedStudentResult.group}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-emerald-700 font-mono">GPA {searchedStudentResult.gpa}</div>
                    <span className="text-xs font-bold text-amber-700">{searchedStudentResult.status}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-emerald-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
                    <span className="text-[10px] text-slate-400 block">বাংলা</span>
                    <span className="font-bold font-mono text-sm">{searchedStudentResult.marks?.bangla || 85}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
                    <span className="text-[10px] text-slate-400 block">ইংরেজি</span>
                    <span className="font-bold font-mono text-sm">{searchedStudentResult.marks?.english || 82}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
                    <span className="text-[10px] text-slate-400 block">গণিত</span>
                    <span className="font-bold font-mono text-sm">{searchedStudentResult.marks?.math || 95}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
                    <span className="text-[10px] text-slate-400 block">বিজ্ঞান</span>
                    <span className="font-bold font-mono text-sm">{searchedStudentResult.marks?.science || 90}</span>
                  </div>
                </div>
              </div>
            )}

            {searchedStudentResult === 'not_found' && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-xs font-bold text-center">
                দুঃখিত! এই রোল নম্বরে কোনো ফলাফল খুঁজে পাওয়া যায়নি। রোল নম্বরটি সঠিক কিনা পরীক্ষা করুন।
              </div>
            )}

            {/* MERIT TABLE (FROM COLLAGE PAGE 5) */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-4 bg-emerald-800 text-white flex justify-between items-center">
                <span className="font-bold text-sm">মেধা তালিকা • {examType.toUpperCase()} ২০২৪</span>
                <span className="text-xs text-emerald-200 font-mono">মোট পরীক্ষার্থী: ৭ জন প্রদর্শিত</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                    <tr>
                      <th className="p-3.5 pl-6">রোল নং</th>
                      <th className="p-3.5">নাম</th>
                      <th className="p-3.5">বিভাগ</th>
                      <th className="p-3.5 pr-6 text-right">ফলাফল</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {MERIT_RESULTS.map((row, idx) => (
                      <tr key={idx} className="hover:bg-emerald-50/40 transition-colors">
                        <td className="p-3.5 pl-6 font-mono font-bold text-slate-800">{row.roll}</td>
                        <td className="p-3.5 font-bold text-slate-900">{row.name}</td>
                        <td className="p-3.5 text-slate-600">
                          <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                            {row.group}
                          </span>
                        </td>
                        <td className="p-3.5 pr-6 text-right font-mono font-black text-emerald-700">
                          GPA {row.gpa}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="text-center">
              <button 
                onClick={() => alert('সম্পূর্ণ ফলাফল তালিকা পিডিএফ ডাউনলোড হচ্ছে...')}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <Download size={14} />
                <span>সম্পূর্ণ ফলাফল দেখুন (PDF)</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PAGE 6: GALLERY (গ্যালারি)                                  */}
        {/* ========================================================= */}
        {activeTab === 'gallery' && (
          <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
            {/* Page Header */}
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-3xl font-black text-emerald-800">গ্যালারি</h2>
              <p className="text-xs font-semibold text-slate-400 mt-1">Our Gallery • বিদ্যালয়ের স্মরণীয় মুহূর্তসমূহ</p>
            </div>

            {/* CATEGORY FILTER PILLS */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'All', label: 'সকল' },
                { id: 'অনুষ্ঠান', label: 'অনুষ্ঠান' },
                { id: 'শিক্ষা কার্যক্রম', label: 'শিক্ষা কার্যক্রম' },
                { id: 'খেলাধুলা', label: 'খেলাধুলা' },
                { id: 'ভ্রমণ', label: 'ভ্রমণ' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setGalleryCategory(cat.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    galleryCategory === cat.id
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* PHOTO GRID (FROM COLLAGE PAGE 6) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {GALLERY_ITEMS
                .filter(item => galleryCategory === 'All' || item.category === galleryCategory)
                .map(item => (
                  <div 
                    key={item.id}
                    onClick={() => setSelectedImage(item)}
                    className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all group cursor-pointer"
                  >
                    <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
                      <img 
                        src={item.image} 
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-3 left-3 bg-slate-900/70 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-xs">
                        {item.category}
                      </span>
                    </div>

                    <div className="p-4 space-y-1">
                      <h4 className="text-sm font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PAGE 7: TEACHERS (শিক্ষকবৃন্দ)                            */}
        {/* ========================================================= */}
        {activeTab === 'teachers' && (
          <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
            {/* Page Header */}
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-3xl font-black text-emerald-800">শিক্ষকবৃন্দ</h2>
              <p className="text-xs font-semibold text-slate-400 mt-1">Our Teachers & Dedicated Faculty</p>
            </div>

            {/* SEARCH & FILTER BAR (FROM COLLAGE PAGE 7) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-3 text-slate-400" size={15} />
                <input 
                  type="text" 
                  placeholder="শিক্ষকের নাম দিয়ে খুঁজুন..." 
                  value={teacherSearch}
                  onChange={e => setTeacherSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-bold border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-2 ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-bold text-slate-500 shrink-0">বিভাগ:</span>
                <select 
                  value={teacherDept}
                  onChange={e => setTeacherDept(e.target.value)}
                  className="text-xs font-bold border border-slate-200 rounded-xl p-2 bg-slate-50 outline-none w-full sm:w-48"
                >
                  <option value="All">সকল বিভাগ (All)</option>
                  <option value="প্রশাসন">প্রশাসন (Admin)</option>
                  <option value="বিজ্ঞান">বিজ্ঞান বিভাগ (Science)</option>
                  <option value="বাংলা">বাংলা বিভাগ (Bangla)</option>
                  <option value="ইংরেজি">ইংরেজি বিভাগ (English)</option>
                  <option value="গণিত">গণিত বিভাগ (Math)</option>
                </select>
              </div>
            </div>

            {/* TEACHER CARDS GRID (MATCHES COLLAGE PAGE 7) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {TEACHERS_LIST
                .filter(t => teacherDept === 'All' || t.dept.includes(teacherDept))
                .filter(t => !teacherSearch || t.name.toLowerCase().includes(teacherSearch.toLowerCase()) || t.designation.toLowerCase().includes(teacherSearch.toLowerCase()))
                .map(teacher => (
                  <div 
                    key={teacher.id}
                    className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-xl transition-all text-center space-y-4 group"
                  >
                    <div className="w-28 h-28 mx-auto rounded-2xl overflow-hidden shadow-md ring-4 ring-emerald-100 group-hover:scale-105 transition-transform">
                      <img src={teacher.image} alt={teacher.name} className="w-full h-full object-cover" />
                    </div>

                    <div>
                      <h4 className="text-base font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {teacher.name}
                      </h4>
                      <span className="inline-block bg-emerald-50 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full mt-1">
                        {teacher.designation}
                      </span>
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        {teacher.dept}
                      </p>
                    </div>

                    <div className="pt-2">
                      <button 
                        onClick={() => setSelectedTeacher(teacher)}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-xs transition-all w-full cursor-pointer"
                      >
                        বিস্তারিত
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PAGE 8: NEWS & EVENTS (নোটিশ ও ইভেন্ট)                     */}
        {/* ========================================================= */}
        {activeTab === 'notices' && (
          <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
            {/* Page Header */}
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-3xl font-black text-emerald-800">নোটিশ ও ইভেন্ট</h2>
              <p className="text-xs font-semibold text-slate-400 mt-1">News & Events • সর্বশেষ সকল প্রাতিষ্ঠানিক সংবাদ</p>
            </div>

            {/* FILTER TABS */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'All', label: 'সকল' },
                { id: 'নোটিশ', label: 'নোটিশ' },
                { id: 'ইভেন্ট', label: 'ইভেন্ট' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setNoticeCategory(cat.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    noticeCategory === cat.id
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* NOTICES LIST (FROM COLLAGE PAGE 8) */}
            <div className="space-y-4">
              {NOTICES_LIST
                .filter(n => noticeCategory === 'All' || n.category === noticeCategory)
                .map(notice => (
                  <div 
                    key={notice.id}
                    onClick={() => setSelectedNotice(notice)}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-emerald-500 transition-all flex flex-col sm:flex-row items-start sm:items-center gap-5 cursor-pointer group"
                  >
                    {/* Left Date Block */}
                    <div className="w-16 h-16 rounded-xl bg-emerald-800 text-white flex flex-col items-center justify-center shrink-0 text-center font-bold">
                      <span className="text-xl font-black font-mono leading-none">{notice.day}</span>
                      <span className="text-[10px] text-emerald-200 uppercase mt-0.5">{notice.month}</span>
                    </div>

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                          {notice.category}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{notice.year}</span>
                      </div>
                      <h4 className="text-base font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {notice.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-1">
                        {notice.summary}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-emerald-700 group-hover:underline inline-flex items-center gap-1">
                        <span>বিস্তারিত...</span>
                        <ChevronRight size={14} />
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PAGE 9: CONTACT (যোগাযোগ)                                  */}
        {/* ========================================================= */}
        {activeTab === 'contact' && (
          <div className="max-w-7xl mx-auto px-4 py-8 space-y-10 animate-in fade-in duration-300">
            {/* Page Header */}
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-3xl font-black text-emerald-800">যোগাযোগ</h2>
              <p className="text-xs font-semibold text-slate-400 mt-1">Contact Us • আপনার যেকোনো প্রশ্ন বা তথ্যের জন্য যোগাযোগ করুন</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Contact Information Cards (Collage Page 9) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                  <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">আমাদের কার্যালয়</h3>
                  
                  <div className="space-y-4 text-xs">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                        <MapPin size={18} />
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 block text-sm">ঠিকানা</span>
                        <p className="text-slate-500 leading-relaxed mt-0.5">
                          রোড #০৫, ব্লক-বি, সোনার বাংলা রোড, ঢাকা-১২১৬, বাংলাদেশ
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                        <Phone size={18} />
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 block text-sm">ফোন</span>
                        <p className="text-slate-500 font-mono mt-0.5">+880 1711-234567, +880 2-9876543</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                        <Mail size={18} />
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 block text-sm">ইমেইল</span>
                        <p className="text-slate-500 font-mono mt-0.5">info@sonarbangla.edu.bd</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                        <Globe size={18} />
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 block text-sm">ওয়েবসাইট</span>
                        <p className="text-slate-500 font-mono mt-0.5">www.sonarbangla.edu.bd</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Simulated Google Map Preview */}
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm h-48 relative">
                  <img 
                    src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=400&fit=crop" 
                    alt="Map Preview"
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-emerald-950/20 flex items-center justify-center">
                    <span className="bg-white text-emerald-800 px-3 py-1.5 rounded-full text-xs font-bold shadow-md flex items-center gap-1.5">
                      <MapPin size={14} className="text-red-500" />
                      <span>সোনার বাংলা আদর্শ উচ্চ বিদ্যালয় প্রাঙ্গণ</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Contact Form (Collage Page 9) */}
              <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
                <h3 className="text-xl font-black text-slate-900 border-b border-slate-100 pb-3">
                  আমাদের সাথে যোগাযোগ করুন
                </h3>

                {contactSuccess ? (
                  <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-6 rounded-2xl text-center space-y-2">
                    <CheckCircle2 size={36} className="mx-auto text-emerald-600" />
                    <h4 className="text-base font-black">আপনার বার্তা সফলভাবে পাঠানো হয়েছে!</h4>
                    <p className="text-xs text-slate-600">আমাদের অফিস থেকে শীঘ্রই আপনার সাথে যোগাযোগ করা হবে। ধন্যবাদ।</p>
                    <button 
                      onClick={() => setContactSuccess(false)}
                      className="mt-3 bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold"
                    >
                      আরেকটি বার্তা পাঠান
                    </button>
                  </div>
                ) : (
                  <form 
                    onSubmit={e => {
                      e.preventDefault();
                      setContactSuccess(true);
                    }}
                    className="space-y-4"
                  >
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">আপনার নাম *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="আপনার পুরো নাম লিখুন" 
                        value={contactForm.name}
                        onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                        className="w-full p-2.5 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-2 ring-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">ইমেইল *</label>
                        <input 
                          type="email" 
                          required
                          placeholder="example@mail.com" 
                          value={contactForm.email}
                          onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                          className="w-full p-2.5 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-2 ring-emerald-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">বিষয় *</label>
                        <input 
                          type="text" 
                          required
                          placeholder="যোগাযোগের বিষয়" 
                          value={contactForm.subject}
                          onChange={e => setContactForm({ ...contactForm, subject: e.target.value })}
                          className="w-full p-2.5 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-2 ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">বার্তা *</label>
                      <textarea 
                        rows={4}
                        required
                        placeholder="আপনার বার্তা বিস্তারিত লিখুন..." 
                        value={contactForm.message}
                        onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                        className="w-full p-2.5 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-2 ring-emerald-500"
                      />
                    </div>

                    <button 
                      type="submit"
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold px-6 py-3 rounded-xl text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Send size={14} />
                      <span>বার্তা পাঠান</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PAGE 10: ADMIN LOGIN (অ্যাডমিন লগইন)                        */}
        {/* ========================================================= */}
        {activeTab === 'admin-login' && (
          <div className="relative min-h-[75vh] flex items-center justify-center p-4">
            <img 
              src="https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=1600&h=900&fit=crop" 
              alt="School Background"
              className="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-xs"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950/70 via-slate-900/60 to-emerald-900/60" />

            {/* Centered Admin Login Card (Matches Collage Page 10) */}
            <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-8 space-y-6 text-center">
              {/* Logo & School Header */}
              <div className="space-y-2">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 border-2 border-emerald-600 flex items-center justify-center shadow-md">
                  <School size={28} className="text-emerald-700" />
                </div>
                <h3 className="text-lg font-black text-emerald-800 leading-tight">
                  সোনার বাংলা আদর্শ উচ্চ বিদ্যালয়
                </h3>
                <p className="text-xs text-slate-400 font-semibold">Sonar Bangla Ideal High School</p>
                <div className="pt-2">
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-black uppercase px-3 py-1 rounded-full">
                    অ্যাডমিন লগইন (Admin Login)
                  </span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleAdminLoginSubmit} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">ইউজারনেম (Username)</label>
                  <input 
                    type="text" 
                    required
                    value={adminUsername}
                    onChange={e => setAdminUsername(e.target.value)}
                    placeholder="Enter username" 
                    className="w-full p-2.5 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-2 ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">পাসওয়ার্ড (Password)</label>
                  <input 
                    type="password" 
                    required
                    value={adminPassword}
                    onChange={e => setAdminPassword(e.target.value)}
                    placeholder="Enter password" 
                    className="w-full p-2.5 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-2 ring-emerald-500"
                  />
                </div>

                <div className="flex justify-between items-center text-[11px]">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-500 font-semibold">
                    <input type="checkbox" defaultChecked className="rounded text-emerald-600" />
                    <span>মনে রাখুন</span>
                  </label>
                  <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('পাসওয়ার্ড পুনরুদ্ধারের জন্য প্রধান শিক্ষকের কার্যালয়ে যোগাযোগ করুন।'); }} className="text-emerald-700 hover:underline font-bold">
                    পাসওয়ার্ড ভুলে গেছেন?
                  </a>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-black py-3 rounded-xl text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <LogIn size={16} />
                  <span>লগইন করুন</span>
                </button>
              </form>

              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                © 2024 Sonar Bangla Ideal High School. All rights reserved.
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PAGE 11: STUDENT / PARENT PORTAL (শিক্ষার্থী/অভিভাবক)     */}
        {/* ========================================================= */}
        {activeTab === 'portal' && (
          <div className="max-w-7xl mx-auto px-4 py-8 space-y-10 animate-in fade-in duration-300">
            {/* Page Header */}
            <div className="text-center space-y-2 border-b border-slate-200 pb-5">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-600">
                সোনার বাংলা আদর্শ উচ্চ বিদ্যালয়
              </span>
              <h2 className="text-3xl font-black text-slate-900">
                শিক্ষার্থী / অভিভাবক পোর্টাল
              </h2>
              <p className="text-xs text-slate-500 font-semibold">
                Student & Parent Integrated Digital Portal
              </p>
            </div>

            {/* DUAL LOGIN CARDS (MATCHES COLLAGE PAGE 11) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Card 1: Student Login */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <GraduationCap size={22} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">শিক্ষার্থী লগইন</h3>
                    <p className="text-[11px] text-slate-400 font-medium">Student Digital Access</p>
                  </div>
                </div>

                <form onSubmit={handleStudentLogin} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">রোল নং / শিক্ষার্থী আইডি</label>
                    <input 
                      type="text" 
                      required
                      value={studentId}
                      onChange={e => setStudentId(e.target.value)}
                      placeholder="উদা: ST-2024-001" 
                      className="w-full p-2.5 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-2 ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">পাসওয়ার্ড</label>
                    <input 
                      type="password" 
                      required
                      value={studentPassword}
                      onChange={e => setStudentPassword(e.target.value)}
                      placeholder="পাসওয়ার্ড লিখুন" 
                      className="w-full p-2.5 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-2 ring-emerald-500"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <LogIn size={14} />
                    <span>লগইন</span>
                  </button>
                </form>

                <div className="text-center text-[11px] text-slate-400">
                  <a href="#help" onClick={(e) => { e.preventDefault(); alert('শ্রেণি শিক্ষকের সাথে যোগাযোগ করে পাসওয়ার্ড সংগ্রহ করুন।'); }} className="text-emerald-700 hover:underline font-bold">
                    পাসওয়ার্ড ভুলে গেছেন?
                  </a>
                </div>
              </div>

              {/* Card 2: Parent Login */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="w-11 h-11 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center">
                    <Users size={22} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">অভিভাবক লগইন</h3>
                    <p className="text-[11px] text-slate-400 font-medium">Guardian Portal Access</p>
                  </div>
                </div>

                <form onSubmit={handleParentLogin} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">অভিভাবক মোবাইল নম্বর</label>
                    <input 
                      type="text" 
                      required
                      value={parentMobile}
                      onChange={e => setParentMobile(e.target.value)}
                      placeholder="উদা: 01712345678" 
                      className="w-full p-2.5 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-2 ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">পাসওয়ার্ড</label>
                    <input 
                      type="password" 
                      required
                      value={parentPassword}
                      onChange={e => setParentPassword(e.target.value)}
                      placeholder="পাসওয়ার্ড লিখুন" 
                      className="w-full p-2.5 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-2 ring-emerald-500"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <LogIn size={14} />
                    <span>লগইন</span>
                  </button>
                </form>

                <div className="text-center text-[11px] text-slate-400">
                  <a href="#help" onClick={(e) => { e.preventDefault(); alert('আপনার নিবন্ধিত মোবাইল নম্বরে ওটিপি পাঠানো হবে।'); }} className="text-teal-700 hover:underline font-bold">
                    পাসওয়ার্ড ভুলে গেছেন?
                  </a>
                </div>
              </div>
            </div>

            {/* QUICK UTILITY ACTION BAR (COLLAGE PAGE 11) */}
            <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <button 
                  onClick={() => handleTabChange('results')} 
                  className="p-3 rounded-xl hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 transition-colors flex items-center justify-center gap-2 text-xs font-bold"
                >
                  <Award size={16} className="text-emerald-600" />
                  <span>ফলাফল</span>
                </button>

                <button 
                  onClick={() => handleTabChange('academics')} 
                  className="p-3 rounded-xl hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 transition-colors flex items-center justify-center gap-2 text-xs font-bold"
                >
                  <Calendar size={16} className="text-emerald-600" />
                  <span>রুটিন</span>
                </button>

                <button 
                  onClick={() => handleTabChange('notices')} 
                  className="p-3 rounded-xl hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 transition-colors flex items-center justify-center gap-2 text-xs font-bold"
                >
                  <Bell size={16} className="text-emerald-600" />
                  <span>নোটিশ</span>
                </button>

                <button 
                  onClick={() => navigate('/student/fees')} 
                  className="p-3 rounded-xl hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 transition-colors flex items-center justify-center gap-2 text-xs font-bold"
                >
                  <Sparkles size={16} className="text-amber-600" />
                  <span>ফি পেমেন্ট</span>
                </button>
              </div>
            </div>

            {/* INSPIRATIONAL FOOTER BANNER (COLLAGE PAGE 11) */}
            <div className="max-w-4xl mx-auto bg-gradient-to-r from-emerald-900 to-teal-800 rounded-3xl p-6 text-white text-center space-y-2 shadow-md">
              <div className="w-10 h-10 mx-auto rounded-full bg-white/10 flex items-center justify-center">
                <HeartHandshake size={20} className="text-amber-300" />
              </div>
              <h4 className="text-lg font-black tracking-wide">
                “শিক্ষার মাধ্যমে গড়ে উঠুক সুন্দর আগামী”
              </h4>
              <p className="text-xs text-emerald-200">
                অভিভাবক ও শিক্ষকদের সম্মিলিত প্রচেষ্টায় শিক্ষার্থীদের ভবিষ্যৎ হোক উজ্জ্বল ও সাফল্যমণ্ডিত।
              </p>
            </div>
          </div>
        )}

      </main>

      {/* 5. FOOTER FEATURES & COPYRIGHT (MATCHES COLLAGE FOOTER) */}
      <footer className="bg-slate-900 text-white mt-16 border-t border-slate-800">
        {/* Collage Footer Feature Bar */}
        <div className="bg-slate-950 py-4 border-b border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center text-xs">
              <div className="flex flex-col items-center justify-center p-2">
                <School size={20} className="text-emerald-400 mb-1" />
                <span className="font-bold text-slate-200">আধুনিক ও সহজে ডিজাইন</span>
                <span className="text-[10px] text-slate-500">Modern & Clean Design</span>
              </div>
              <div className="flex flex-col items-center justify-center p-2">
                <Compass size={20} className="text-blue-400 mb-1" />
                <span className="font-bold text-slate-200">সকল ডিভাইসে পারফেক্ট</span>
                <span className="text-[10px] text-slate-500">Responsive (Mobile, Tab, PC)</span>
              </div>
              <div className="flex flex-col items-center justify-center p-2">
                <ShieldCheck size={20} className="text-teal-400 mb-1" />
                <span className="font-bold text-slate-200">নিরাপদ ও নির্ভরযোগ্য</span>
                <span className="text-[10px] text-slate-500">Secure & Reliable</span>
              </div>
              <div className="flex flex-col items-center justify-center p-2">
                <Sparkles size={20} className="text-amber-400 mb-1" />
                <span className="font-bold text-slate-200">সহজে কাস্টমাইজেবল</span>
                <span className="text-[10px] text-slate-500">Easy to Manage Panel</span>
              </div>
              <div className="flex flex-col items-center justify-center p-2 col-span-2 md:col-span-1">
                <HeartHandshake size={20} className="text-pink-400 mb-1" />
                <span className="font-bold text-slate-200">বাংলাদেশি স্কুলের উপযোগী</span>
                <span className="text-[10px] text-slate-500">BD Education Focused</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Links & Credits */}
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <div>
            <p className="font-bold text-slate-300">সোনার বাংলা আদর্শ উচ্চ বিদ্যালয় • Sonar Bangla Ideal High School</p>
            <p className="text-[11px] text-slate-500">রোড #০৫, ব্লক-বি, ঢাকা-১২১৬ • EIIN: 134567 • ইমেইল: info@sonarbangla.edu.bd</p>
          </div>

          <div className="text-center sm:text-right">
            <p>© 2024 Sonar Bangla Ideal High School. All rights reserved.</p>
            <p className="text-[10px] text-slate-500">Powered by Smart Amar School Management System</p>
          </div>
        </div>
      </footer>

      {/* 6. MODALS (ADMISSION FORM, TEACHER PROFILE, NOTICE READER, LIGHTBOX) */}

      {/* Online Admission Application Modal */}
      {isAdmissionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-4 sm:p-6 my-8 max-h-[92vh] overflow-y-auto">
            <button 
              onClick={() => setIsAdmissionModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-500 z-10 cursor-pointer"
            >
              <X size={20} />
            </button>
            <StudentAdmissionForm 
              tenant={currentTenant}
              institutionType="School"
              onClose={() => setIsAdmissionModalOpen(false)}
              onComplete={() => setIsAdmissionModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Teacher Profile Modal */}
      {selectedTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 text-center space-y-4">
            <button 
              onClick={() => setSelectedTeacher(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
            >
              <X size={18} />
            </button>
            <div className="w-24 h-24 mx-auto rounded-2xl overflow-hidden shadow-lg ring-4 ring-emerald-100">
              <img src={selectedTeacher.image} alt={selectedTeacher.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">{selectedTeacher.name}</h3>
              <p className="text-xs font-bold text-emerald-700">{selectedTeacher.designation}</p>
              <p className="text-xs text-slate-500">{selectedTeacher.dept}</p>
            </div>
            <div className="text-left bg-slate-50 p-4 rounded-2xl text-xs space-y-2 border border-slate-100">
              <div>
                <span className="font-bold text-slate-400 block text-[10px] uppercase">শিক্ষাগত যোগ্যতা:</span>
                <span className="text-slate-700 font-semibold">{selectedTeacher.qualification}</span>
              </div>
              <div>
                <span className="font-bold text-slate-400 block text-[10px] uppercase">অভিজ্ঞতা:</span>
                <span className="text-slate-700 font-semibold">{selectedTeacher.experience}</span>
              </div>
              <div>
                <span className="font-bold text-slate-400 block text-[10px] uppercase">ইমেইল:</span>
                <span className="text-slate-700 font-mono font-semibold">{selectedTeacher.email}</span>
              </div>
            </div>
            <button 
              onClick={() => setSelectedTeacher(null)}
              className="w-full bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}

      {/* Notice Detail Reader Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 space-y-4">
            <button 
              onClick={() => setSelectedNotice(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
            >
              <X size={18} />
            </button>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                {selectedNotice.category}
              </span>
              <span className="text-xs text-slate-400">তারিখ: {selectedNotice.day} {selectedNotice.month} {selectedNotice.year}</span>
            </div>
            <h3 className="text-lg font-black text-slate-900 leading-snug">{selectedNotice.title}</h3>
            <div className="bg-slate-50 p-4 rounded-2xl text-xs text-slate-700 leading-relaxed border border-slate-100">
              {selectedNotice.details || selectedNotice.summary}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button 
                onClick={() => alert('নোটিশটি ডাউনলোড করা হয়েছে (PDF)...')}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Download size={13} />
                <span>ডাউনলোড নোটিশ (PDF)</span>
              </button>
              <button 
                onClick={() => setSelectedNotice(null)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-xs cursor-pointer"
        >
          <div className="max-w-3xl max-h-[90vh] bg-transparent text-center space-y-3" onClick={e => e.stopPropagation()}>
            <img src={selectedImage.image} alt={selectedImage.title} className="rounded-2xl max-h-[75vh] mx-auto shadow-2xl object-contain" />
            <div className="bg-slate-900/80 p-3 rounded-xl text-white inline-block">
              <h4 className="font-bold text-sm">{selectedImage.title}</h4>
              <p className="text-xs text-slate-300">{selectedImage.desc}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default SonarBanglaSchoolWebsite;
