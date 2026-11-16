import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  School,
  GraduationCap,
  Building2,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Smartphone,
  CreditCard,
  Fingerprint,
  FileSpreadsheet,
  MessageSquare,
  CalendarCheck,
  ShieldCheck,
  Users,
  Award,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Clock,
  Check,
  DollarSign,
  Calculator,
  Quote,
  Star
} from 'lucide-react';
import { Button, Card, Badge, Modal, useToast } from './UIComponents';
import { PublicLayout } from './Layout';

export const HomeView: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  // Savings Calculator State
  const [studentCount, setStudentCount] = useState<number>(800);

  // Free Demo Request Modal State
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [demoForm, setDemoForm] = useState({
    institutionName: '',
    principalName: '',
    phone: '',
    district: 'ঢাকা',
    type: 'School',
    approxStudents: '500-1000'
  });

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoForm.institutionName || !demoForm.phone) {
      addToast('অনুগ্রহ করে প্রতিষ্ঠানের নাম ও মোবাইল নম্বর প্রদান করুন।', 'error');
      return;
    }
    addToast(`ধন্যবাদ! ${demoForm.institutionName}-এর ডেমো ও প্রস্তাবনা অনুরোধ গ্রহণ করা হয়েছে। আমাদের প্রতিনিধি দ্রুত যোগাযোগ করবেন।`, 'success');
    setIsDemoModalOpen(false);
    setDemoForm({
      institutionName: '',
      principalName: '',
      phone: '',
      district: 'ঢাকা',
      type: 'School',
      approxStudents: '500-1000'
    });
  };

  // Derived ROI Savings
  const yearlyPaperSavings = Math.round(studentCount * 175);
  const yearlyStaffHours = Math.round(studentCount * 1.15);
  const feeRecoveryIncrease = Math.round(studentCount * 280);

  return (
    <PublicLayout>
      <div className="relative isolate pt-4 dark:bg-gray-900 overflow-hidden font-sans">
        
        {/* ========================================================================= */}
        {/* HERO SECTION */}
        {/* ========================================================================= */}
        <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/70 via-white to-slate-50/50 pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-slate-200">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-r from-indigo-400/15 via-purple-400/15 to-emerald-400/15 blur-3xl rounded-full pointer-events-none" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-4xl mx-auto space-y-6">
              
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-indigo-100 shadow-sm text-xs font-bold text-slate-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>🇧🇩 স্মার্ট বাংলাদেশ এডুকেশন প্ল্যাটফর্ম</span>
                <span className="text-indigo-600 hidden sm:inline">• মাল্টি-টেন্যান্ট স্কুল, মাদ্রাসা ও কলেজ ম্যানেজমেন্ট</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
                শিক্ষা প্রতিষ্ঠানের জন্য{' '}
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  স্মার্ট অল-ইন-ওয়ান
                </span>{' '}
                ডিজিটাল ম্যানেজমেন্ট
              </h1>

              {/* Subheading */}
              <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
                প্রতিটি স্কুল, মাদ্রাসা ও কলেজের জন্য আলাদা স্বয়ংক্রিয় ওয়েবসাইট, অনলাইন ফি কালেকশন, 
                বায়োমেট্রিক ও রিয়েল-টাইম SMS হাজিরা, নতুন কারিকুলাম ও জিপিএ রেজাল্ট প্রস্তুতকারী আধুনিক ক্লাউড সফটওয়্যার।
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                <Button
                  id="hero-request-demo-btn"
                  variant="primary"
                  size="lg"
                  icon={Sparkles}
                  onClick={() => setIsDemoModalOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 shadow-lg shadow-indigo-600/25"
                >
                  ফ্রি ডেমো বুক করুন
                </Button>
                <a
                  href="#institutions"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm shadow-sm transition"
                >
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  প্রতিষ্ঠানসমূহ দেখুন
                </a>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition"
                >
                  সরাসরি লগইন
                  <ArrowRight className="w-4 h-4 text-slate-300" />
                </Link>
              </div>

              {/* Quick Metrics Ribbon */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 border-t border-slate-200/80 max-w-4xl mx-auto">
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-200/80 shadow-xs text-center">
                  <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600 font-mono">৫০০+</div>
                  <div className="text-xs font-medium text-slate-600 mt-1">সফল শিক্ষা প্রতিষ্ঠান</div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-200/80 shadow-xs text-center">
                  <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono">৯৯.৯%</div>
                  <div className="text-xs font-medium text-slate-600 mt-1">আপটাইম ও ক্লাউড ব্যাকআপ</div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-200/80 shadow-xs text-center">
                  <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 font-mono">৩টি</div>
                  <div className="text-xs font-medium text-slate-600 mt-1">স্পেশালাইজড এডিশন</div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-200/80 shadow-xs text-center">
                  <div className="text-2xl sm:text-3xl font-extrabold text-purple-600 font-mono">৫০,০০০+</div>
                  <div className="text-xs font-medium text-slate-600 mt-1">শিক্ষার্থী ও অভিভাবক</div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* LIVE INSTITUTION PORTALS SHOWCASE */}
        {/* ========================================================================= */}
        <section id="institutions" className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <Badge variant="primary" className="mb-2">স্বতন্ত্র প্রাতিষ্ঠানিক সমাধান</Badge>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                আপনার প্রতিষ্ঠানের ধরন অনুযায়ী প্রস্তুত এডিশন
              </h2>
              <p className="mt-3 text-slate-600 text-sm sm:text-base">
                স্কুল, মাদ্রাসা ও কলেজের ভিন্ন কারিকুলাম ও প্রশাসনিক নিয়মের জন্য রয়েছে সম্পূর্ণ কাস্টমাইজড মডিউল। 
                প্রতিটি প্রতিষ্ঠানের লাইভ ওয়েবসাইট ও ড্যাশবোর্ড সরাসরি ভিজিট করুন:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* 1. School Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group">
                <div className="h-3 bg-indigo-600" />
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <span className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                      <School className="w-6 h-6" />
                    </span>
                    <span className="text-xs font-bold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                      স্কুল এডিশন
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-1">সোনার বাংলা হাই স্কুল</h3>
                  <p className="text-xs text-slate-500 mb-4 font-mono">ইআইআইএন: ১২৩৪৫৬ | প্রতিষ্ঠিত: ১৯৯৫</p>
                  
                  <p className="text-sm text-slate-600 mb-6 flex-1">
                    নতুন শিক্ষাক্রমের যোগ্যতাভিত্তিক মূল্যায়ন (PI/BI), অনলাইন ভর্তি, মাসিক বেতন ও ডিজিটাল হাজিরা ব্যবস্থাপনা।
                  </p>

                  <div className="space-y-2.5 mb-6 text-xs text-slate-700 border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>নতুন কারিকুলাম PI & BI শিট প্রস্তুতকরণ</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>বিকাশ/নগদ অটো ফি কালেকশন ও রসিদ</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>অভিভাবকের মোবাইলে প্রবেশ/প্রস্থান SMS</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Link
                      to="/sonar-bangla"
                      className="flex-1 text-center py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <span>লাইভ ওয়েবসাইট</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      to="/login"
                      className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition"
                    >
                      লগইন
                    </Link>
                  </div>
                </div>
              </div>

              {/* 2. Madrasa Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group">
                <div className="h-3 bg-emerald-600" />
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <span className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                      <BookOpen className="w-6 h-6" />
                    </span>
                    <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                      মাদ্রাসা এডিশন
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-1">দারুল উলুম কামিল মাদ্রাসা</h3>
                  <p className="text-xs text-slate-500 mb-4 font-mono">কোড: ৯৮৭৬৫৪ | হিফজ, কিতাব ও আলিয়া</p>
                  
                  <p className="text-sm text-slate-600 mb-6 flex-1">
                    কোরআনুল কারিম হিফজ ট্র্যাকার (পারা/রুকু/পৃষ্ঠা), লিল্লাহ বোর্ডিং ফান্ড অনুদান ও কিতাব বিভাগের বিশেষ রেজাল্ট।
                  </p>

                  <div className="space-y-2.5 mb-6 text-xs text-slate-700 border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>দৈনিক হিফজ ও সবক প্রগ্রেস মনিটরিং</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>এতিমখানা ও লিল্লাহ ফান্ড কালেকশন ট্র্যাকিং</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>আরবি কারিকুলাম ও বোর্ড পরীক্ষার গ্রেডিং</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Link
                      to="/madrasa"
                      className="flex-1 text-center py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <span>লাইভ ওয়েবসাইট</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      to="/login"
                      className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition"
                    >
                      লগইন
                    </Link>
                  </div>
                </div>
              </div>

              {/* 3. College Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group">
                <div className="h-3 bg-purple-600" />
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <span className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                      <GraduationCap className="w-6 h-6" />
                    </span>
                    <span className="text-xs font-bold px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full border border-purple-100">
                      কলেজ এডিশন
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-1">আইডিয়াল কলেজ ঢাকা</h3>
                  <p className="text-xs text-slate-500 mb-4 font-mono">কোড: ৪৫৬৭৮৯ | একাদশ-দ্বাদশ ও অনার্স</p>
                  
                  <p className="text-sm text-slate-600 mb-6 flex-1">
                    বিজ্ঞান, মানবিক ও ব্যবসায় শাখাভিত্তিক গ্রুপ নির্বাচন, ল্যাব ও সেমিনার ফি, মডেল টেস্ট এবং এইচএসসি গ্রেডিং।
                  </p>

                  <div className="space-y-2.5 mb-6 text-xs text-slate-700 border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>শাখা ও ঐচ্ছিক বিষয় চয়েস সিস্টেম</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>প্র্যাকটিক্যাল ল্যাব ও সেমিস্টার ফি অটোমেশন</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>এইচএসসি বোর্ড স্ট্যান্ডার্ড জিপিএ রেজাল্ট শিট</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Link
                      to="/college"
                      className="flex-1 text-center py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <span>লাইভ ওয়েবসাইট</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      to="/login"
                      className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition"
                    >
                      লগইন
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* ROLE PORTALS SECTION */}
        {/* ========================================================================= */}
        <section className="py-16 sm:py-24 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <Badge variant="secondary" className="mb-2">নিরাপদ অ্যাক্সেস কন্ট্রোল</Badge>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                ৪টি সমন্বিত রোল-ভিত্তিক পোর্টাল
              </h2>
              <p className="mt-3 text-slate-600 text-sm sm:text-base">
                কর্তৃপক্ষ, শিক্ষক, হিসাবরক্ষক ও অভিভাবক—সবার জন্য রয়েছে আলাদা ডেডিকেটেড ড্যাশবোর্ড ও নির্দিষ্ট প্রিভিলেজ।
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Super Admin */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-indigo-300 transition-all flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1">সুপার অ্যাডমিন ও কমিটি</h3>
                <p className="text-xs text-slate-600 mb-4 flex-1">
                  প্রতিষ্ঠানের পূর্ণ নিয়ন্ত্রণ, ফি কনফিগারেশন, স্টাফ বেতন অনুমোদন, সার্বিক আয়-ব্যয় অডিট এবং নতুন শাখা খোলা।
                </p>
                <Link
                  to="/login"
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-auto"
                >
                  <span>অ্যাডমিন ড্যাশবোর্ড</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Teacher Portal */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-300 transition-all flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1">অধ্যক্ষ ও শিক্ষক প্যানেল</h3>
                <p className="text-xs text-slate-600 mb-4 flex-1">
                  মোবাইল বা ল্যাপটপ থেকে দ্রুত হাজিরা গ্রহণ, পরীক্ষার মার্কস এন্ট্রি, ক্লাস রুটিন ও জরুরি নোটিশ পাঠানো।
                </p>
                <Link
                  to="/login"
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 mt-auto"
                >
                  <span>শিক্ষক পোর্টাল</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Accountant */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-amber-300 transition-all flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1">হিসাব শাখা ও ক্যাশিয়ার</h3>
                <p className="text-xs text-slate-600 mb-4 flex-1">
                  কাউন্টার ফি রসিদ প্রিন্ট, bKash/Nagad গেটওয়ে রিকনসিলিয়েশন, বকেয়া ফি তালিকা এবং এক ক্লিকে ব্যাংক রিপোর্ট।
                </p>
                <Link
                  to="/login"
                  className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 mt-auto"
                >
                  <span>অ্যাকাউন্টস প্যানেল</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Parent & Student */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-purple-300 transition-all flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1">শিক্ষার্থী ও অভিভাবক অ্যাপ</h3>
                <p className="text-xs text-slate-600 mb-4 flex-1">
                  মোবাইল থেকে সন্তানের উপস্থিতির খবর, পরীক্ষার রেজাল্ট কার্ড ডাউনলোড এবং ঘরে বসেই বেতন পরিশোধ।
                </p>
                <Link
                  to="/login"
                  className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 mt-auto"
                >
                  <span>অভিভাবক পোর্টাল</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* CORE FEATURES (6-GRID) */}
        {/* ========================================================================= */}
        <section className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge variant="primary" className="mb-2">শক্তিশালী মডিউলসমূহ</Badge>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                ডিজিটাল স্কুল পরিচালনার সম্পূর্ণ ইকোসিস্টেম
              </h2>
              <p className="mt-3 text-slate-600 text-sm sm:text-base">
                কাগজের ফাইল ও খাতার ঝামেলা দূর করে আধুনিক প্রযুক্তির মাধ্যমে আপনার প্রতিষ্ঠানের মান বৃদ্ধি করুন।
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              
              {/* Feature 1: Online Admission */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-md transition">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">১. অনলাইন ভর্তি ও ডিজিটাল ফর্ম</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  অভিভাবকরা অনলাইনে ফর্ম পূরণ করে আবেদন ফি জমা দিতে পারেন। স্বয়ংক্রিয় রোল জেনারেশন, অ্যাডমিট কার্ড ও মেধা তালিকা তৈরি।
                </p>
              </div>

              {/* Feature 2: Digital Fees */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-md transition">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">২. ডিজিটাল ফি ও bKash ইন্টিগ্রেশন</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  বিকাশ, নগদ ও রকেটের মাধ্যমে ফি গ্রহণ। পেমেন্ট হওয়া মাত্রই অভিভাবকের কাছে স্বয়ংক্রিয় SMS রসিদ ও ড্যাশবোর্ডে রিকনসিল।
                </p>
              </div>

              {/* Feature 3: Biometric & SMS Attendance */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-purple-300 hover:shadow-md transition">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-5">
                  <Fingerprint className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">৩. বায়োমেট্রিক ও ইনস্ট্যান্ট SMS হাজিরা</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  RFID কার্ড বা ফিঙ্গারপ্রিন্ট মেশিনে শিক্ষার্থী বা শিক্ষক পাঞ্চ করলেই তৎক্ষণাৎ অভিভাবকের ফোনে উপস্থিতির SMS পৌঁছে যায়।
                </p>
              </div>

              {/* Feature 4: Results & Grading */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-300 hover:shadow-md transition">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">৪. রেজাল্ট ও স্বয়ংক্রিয় গ্রেডিং শিট</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  নতুন শিক্ষাক্রমের PI/BI ত্রিভুজ-বৃত্ত-চতুর্ভুজ শিট, ঐতিহ্যবাহী জিপিএ গ্রেডিং এবং প্রফেশনাল মার্কশিট ১-ক্লিকে প্রিন্ট।
                </p>
              </div>

              {/* Feature 5: Bulk SMS & Scheduling */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-rose-300 hover:shadow-md transition">
                <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-5">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">৫. বাল্ক এসএমএস ও শিডিউলিং সেন্টার</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  সব অভিভাবক বা নির্দিষ্ট শ্রেণির জন্য এক ক্লিকে নোটিশ পাঠানো। ভবিষ্যতের যেকোনো তারিখ ও সময়ের জন্য এসএমএস শিডিউলিং।
                </p>
              </div>

              {/* Feature 6: Routine & Notice Board */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-cyan-300 hover:shadow-md transition">
                <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-5">
                  <CalendarCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">৬. ক্লাস রুটিন ও ডিজিটাল নোটিশ</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  শিক্ষক ও ক্লাসভিত্তিক রুটিন তৈরি, পরীক্ষার সূচি প্রকাশ এবং প্রাতিষ্ঠানিক নোটিশ ওয়েবসাইটের স্ক্রলে রিয়েল-টাইমে প্রদর্শন।
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* INTERACTIVE ROI / SAVINGS CALCULATOR */}
        {/* ========================================================================= */}
        <section className="py-16 sm:py-24 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="max-w-3xl mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold mb-3 border border-indigo-400/30">
                  <Calculator className="w-3.5 h-3.5" />
                  <span>বিনিয়োগের কার্যকারিতা ক্যালকুলেটর</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                  ডিজিটাল সফটওয়্যারে আপনার প্রতিষ্ঠানের লাভ কত?
                </h2>
                <p className="text-indigo-200 text-sm mt-2">
                  শিক্ষার্থী সংখ্যা নির্বাচন করে দেখুন বাৎসরিক কত টাকা ও সময় সাশ্রয় হবে:
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Slider Input */}
                <div className="lg:col-span-5 bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-medium text-indigo-200">শিক্ষার্থী সংখ্যা:</span>
                    <span className="text-2xl font-black text-white font-mono bg-indigo-600/50 px-3 py-1 rounded-lg border border-indigo-400/30">
                      {studentCount.toLocaleString('bn-BD')} জন
                    </span>
                  </div>
                  <input
                    type="range"
                    min="150"
                    max="2500"
                    step="50"
                    value={studentCount}
                    onChange={(e) => setStudentCount(Number(e.target.value))}
                    className="w-full h-2.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                  />
                  <div className="flex justify-between text-xs text-indigo-300 mt-2 font-mono">
                    <span>১৫০ জন</span>
                    <span>১,৩০০ জন</span>
                    <span>২,৫০০ জন</span>
                  </div>

                  <div className="mt-6 pt-5 border-t border-white/10 text-xs text-indigo-200/90 leading-relaxed">
                    💡 হিসাব অনুযায়ী ম্যানুয়াল খাতা ও রশিদ প্রিন্টিং বন্ধ হলে প্রথম মাস থেকেই উল্লেখযোগ্য ব্যয় হ্রাস পায়।
                  </div>
                </div>

                {/* Savings Stats */}
                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl bg-white/10 border border-white/10 text-center">
                    <div className="text-xs text-indigo-200 mb-1">বাৎসরিক কাগজ ও প্রিন্টিং সেভ</div>
                    <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                      ৳ {yearlyPaperSavings.toLocaleString('bn-BD')}
                    </div>
                    <div className="text-[11px] text-slate-300 mt-1">খাতা, ভাউচার ও নোটিশ বাবদ</div>
                  </div>

                  <div className="p-5 rounded-2xl bg-white/10 border border-white/10 text-center">
                    <div className="text-xs text-indigo-200 mb-1">স্টাফ কর্মঘণ্টা সাশ্রয়</div>
                    <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                      {yearlyStaffHours.toLocaleString('bn-BD')} ঘণ্টা
                    </div>
                    <div className="text-[11px] text-slate-300 mt-1">অটো রেজাল্ট ও ফি ট্র্যাকিংয়ে</div>
                  </div>

                  <div className="p-5 rounded-2xl bg-white/10 border border-white/10 text-center">
                    <div className="text-xs text-indigo-200 mb-1">বকেয়া ফি আদায় বৃদ্ধি</div>
                    <div className="text-2xl sm:text-3xl font-black text-indigo-300 font-mono">
                      ৳ {feeRecoveryIncrease.toLocaleString('bn-BD')}
                    </div>
                    <div className="text-[11px] text-slate-300 mt-1">রিমাইন্ডার SMS এর কারণে</div>
                  </div>
                </div>

              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                <span className="text-xs text-indigo-200">
                  সরাসরি আপনার প্রতিষ্ঠানের প্রয়োজন অনুযায়ী প্যাকেজ ও কোটেশন দেখুন:
                </span>
                <Link
                  to="/pricing"
                  className="px-5 py-2.5 rounded-xl bg-white text-indigo-900 font-bold text-xs hover:bg-indigo-50 transition shadow-sm inline-flex items-center gap-1.5"
                >
                  <span>মূল্য তালিকা ও প্যাকেজ দেখুন</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* TESTIMONIALS SECTION */}
        {/* ========================================================================= */}
        <section className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge variant="primary" className="mb-2">বিশ্বস্ততা ও অভিজ্ঞতা</Badge>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                শিক্ষা প্রতিষ্ঠান প্রধানদের সন্তুষ্টি
              </h2>
              <p className="mt-3 text-slate-600 text-sm sm:text-base">
                বাংলাদেশের বিভিন্ন জেলার স্কুল, মাদ্রাসা ও কলেজ প্রধানরা কীভাবে উপকৃত হয়েছেন:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col">
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-700 italic flex-1 mb-6 leading-relaxed">
                  "আগে পরীক্ষার রেজাল্ট শিট তৈরিতে শিক্ষকদের টানা ১০ দিন খাটতে হতো। এখন ১ ক্লিকেই গ্রেড শিট ও মার্কশিট বের হয়ে যায়। অনলাইন ফিতে কালেকশন বেড়ে গেছে দ্বিগুণ।"
                </p>
                <div className="border-t border-slate-100 pt-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                    মো
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">মোঃ রফিকুল ইসলাম</div>
                    <div className="text-xs text-slate-500">প্রধান শিক্ষক, সোনার বাংলা হাই স্কুল</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col">
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-700 italic flex-1 mb-6 leading-relaxed">
                  "মাদ্রাসার হিফজ বিভাগ ও লিল্লাহ বোর্ডিংয়ের কালেকশন ম্যানেজ করা অনেক কঠিন ছিল। এই সফটওয়্যারে সহজে প্রতিটি ছাত্রের সবক ও অনুদান ট্র্যাক করা যাচ্ছে।"
                </p>
                <div className="border-t border-slate-100 pt-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm">
                    মা
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">মাওলানা মাহমুদুল হাসান</div>
                    <div className="text-xs text-slate-500">মুহতামিম, দারুল উলুম কামিল মাদ্রাসা</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col">
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-700 italic flex-1 mb-6 leading-relaxed">
                  "কলেজের বিজ্ঞান ও বাণিজ্য শাখার আলাদা ফি ও প্র্যাকটিক্যাল ল্যাব সমন্বয় করা এখন একদম সহজ। বিকাশ পেমেন্টের কারণে কাউন্টারে শিক্ষার্থীদের লম্বা লাইন লাগে না।"
                </p>
                <div className="border-t border-slate-100 pt-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm">
                    প্র
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">প্রফেসর ড. আনিসুর রহমান</div>
                    <div className="text-xs text-slate-500">অধ্যক্ষ, আইডিয়াল কলেজ ঢাকা</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* BOTTOM CTA BANNER */}
        {/* ========================================================================= */}
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              আপনার প্রতিষ্ঠানেও শুরু হোক ডিজিটাল স্মার্ট পরিবর্তন
            </h2>
            <p className="mt-3 text-slate-600 text-sm max-w-2xl mx-auto">
              আমাদের টিম আপনার প্রতিষ্ঠানে এসে সরাসরি ডাটা মাইগ্রেশন ও স্টাফ ট্রেনিং বিনামূল্যে প্রদান করবে। 
              কোনো জটিলতা ছাড়াই মাত্র ২৪ ঘণ্টায় লাইভ হোন।
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="primary"
                size="lg"
                icon={Sparkles}
                onClick={() => setIsDemoModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 shadow-md"
              >
                বিনামূল্যে ডেমো অনুরোধ করুন
              </Button>
              <Link
                to="/pricing"
                className="px-5 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm shadow-xs transition"
              >
                প্যাকেজ ও তুলনা দেখুন
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* FREE DEMO REQUEST MODAL */}
        {/* ========================================================================= */}
        <Modal
          isOpen={isDemoModalOpen}
          onClose={() => setIsDemoModalOpen(false)}
          title="ফ্রি ডেমো ও প্রস্তাবনা অনুরোধ"
        >
          <form onSubmit={handleDemoSubmit} className="space-y-4 pt-2">
            <p className="text-xs text-slate-600 leading-relaxed">
              আপনার প্রতিষ্ঠানের নাম ও মোবাইল নম্বর প্রদান করুন। আমাদের প্রতিনিধি আপনার সাথে যোগাযোগ করে ডেমো প্রদর্শন ও প্রস্তাবনা পাঠাবেন।
            </p>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">প্রতিষ্ঠানের নাম *</label>
              <input
                type="text"
                required
                placeholder="যেমন: সোনার বাংলা হাই স্কুল"
                value={demoForm.institutionName}
                onChange={(e) => setDemoForm({ ...demoForm, institutionName: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 ring-indigo-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">প্রধানের নাম</label>
                <input
                  type="text"
                  placeholder="যেমন: মোঃ রফিকুল ইসলাম"
                  value={demoForm.principalName}
                  onChange={(e) => setDemoForm({ ...demoForm, principalName: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">মোবাইল নম্বর *</label>
                <input
                  type="tel"
                  required
                  placeholder="017XXXXXXXX"
                  value={demoForm.phone}
                  onChange={(e) => setDemoForm({ ...demoForm, phone: e.target.value })}
                  className="w-full text-xs font-mono p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">প্রতিষ্ঠানের ধরন</label>
                <select
                  value={demoForm.type}
                  onChange={(e) => setDemoForm({ ...demoForm, type: e.target.value })}
                  className="w-full text-xs font-bold p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none"
                >
                  <option value="School">স্কুল / হাইস্কুল</option>
                  <option value="Madrasa">কওমি / আলিয়া মাদ্রাসা</option>
                  <option value="College">কলেজ / উচ্চ মাধ্যমিক</option>
                  <option value="Kindergarten">কিন্ডারগার্টেন / কোচিং</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">শিক্ষার্থী সংখ্যা</label>
                <select
                  value={demoForm.approxStudents}
                  onChange={(e) => setDemoForm({ ...demoForm, approxStudents: e.target.value })}
                  className="w-full text-xs font-bold p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none"
                >
                  <option value="Under 300">৩০০ জনের কম</option>
                  <option value="300-800">৩০০ - ৮০০ জন</option>
                  <option value="800-1500">৮০০ - ১,৫০০ জন</option>
                  <option value="Above 1500">১,৫০০ জনের বেশি</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsDemoModalOpen(false)}
              >
                বাতিল
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                icon={Check}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
              >
                অনুরোধ পাঠান
              </Button>
            </div>
          </form>
        </Modal>

      </div>
    </PublicLayout>
  );
};
