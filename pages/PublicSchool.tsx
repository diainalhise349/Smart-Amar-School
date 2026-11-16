import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, Phone, Mail, Calendar, ArrowRight, User, Download, Smartphone, 
  Search, BookOpen, GraduationCap, X, Users, Image as ImageIcon, ShieldCheck,
  Lock, CheckCircle, AlertCircle, ArrowLeft, School, Building2, Check,
  Clock, Award, ExternalLink, Sparkles, LogIn, ChevronRight, Hash
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input } from '../components/UIComponents';
import { StudentAdmissionForm } from '../components/StudentAdmissionForm';
import { MOCK_EVENTS, MOCK_RESULTS, MOCK_BOOKS, MOCK_STAFF } from '../constants';
import { getStoredStudents } from '../utils/studentStorage';
import { getTenantBySubdomain, getStoredTenants, getInstitutionLoginUrl } from '../utils/tenantStorage';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { SonarBanglaSchoolWebsite, SchoolPageTab } from '../components/SonarBanglaSchoolWebsite';
import { AlAminMadrasaWebsite, MadrasaPageTab } from '../components/AlAminMadrasaWebsite';
import { CollegeWebsite, CollegePageTab } from '../components/CollegeWebsite';
import { UniversityWebsite, UniversityPageTab } from '../components/UniversityWebsite';

/**
 * Public Institution Website Component
 * Dedicated website for each institution accessible via /institution/:subdomain
 * Guarantees strict institutional isolation:
 * - School: only school options & data
 * - Madrasa: only madrasa options & data
 * - College: only college options & data
 * - University: only university options & data
 */
export const PublicSchoolWebsite = ({ defaultTab }: { defaultTab?: SchoolPageTab }) => {
  const { subdomain, tab } = useParams<{ subdomain: string; tab?: string }>();
  const navigate = useNavigate();

  // Retrieve institution by subdomain or fallback to first
  const tenant = getTenantBySubdomain(subdomain);
  const institutionType = tenant.type;

  // 1. Madrasa (Strictly Madrasa curriculum, options, and faculty)
  if (institutionType === 'Madrasa' || tenant.id === 'al-amin' || tenant.subdomain.includes('madrasa')) {
    return <AlAminMadrasaWebsite tenant={tenant} initialTab={(tab as MadrasaPageTab) || 'home'} showSwitcher={false} />;
  }

  // 2. College (Strictly College HSC/Degree/Honours, practical labs, and college faculty)
  if (institutionType === 'College' || tenant.id === 'dcc' || tenant.subdomain.includes('college')) {
    return <CollegeWebsite tenant={tenant} initialTab={(tab as CollegePageTab) || 'home'} showSwitcher={false} />;
  }

  // 3. University (Strictly University faculties, credit programs, CGPA, research, and VC message)
  if (institutionType === 'University' || tenant.id === 'diu' || tenant.subdomain.includes('university') || tenant.subdomain.includes('diu')) {
    return <UniversityWebsite tenant={tenant} initialTab={(tab as UniversityPageTab) || 'home'} showSwitcher={false} />;
  }

  // 4. School (Strictly School Play-Class 10, SSC, school clubs, and headmaster message)
  return <SonarBanglaSchoolWebsite tenant={tenant} initialTab={defaultTab || (tab as SchoolPageTab) || 'home'} showSwitcher={false} />;

  // Institution staff
  const institutionStaff = MOCK_STAFF.filter(
    s => !s.tenantSubdomain || s.tenantSubdomain.toLowerCase() === activeSubdomain.toLowerCase()
  );

  // Dynamic Theme Colors based on Institution Type
  const isCollege = institutionType === 'College';
  const isMadrasa = institutionType === 'Madrasa';
  
  const primaryBg = isCollege 
    ? 'bg-blue-700' 
    : isMadrasa 
    ? 'bg-emerald-800' 
    : 'bg-indigo-700';
  
  const primaryHoverBg = isCollege 
    ? 'hover:bg-blue-800' 
    : isMadrasa 
    ? 'hover:bg-emerald-900' 
    : 'hover:bg-indigo-800';

  const accentText = isCollege 
    ? 'text-blue-700' 
    : isMadrasa 
    ? 'text-emerald-800' 
    : 'text-indigo-700';

  const handleResultSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const result = MOCK_RESULTS.find(r => r.rollNo === resultQuery.roll);
    setFoundResult(result || 'not_found');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Top Institutional Bar */}
      <div className={`${primaryBg} text-white py-2 px-4 shadow-sm`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center text-xs gap-2">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1 font-medium">
              <Phone size={13}/> {tenant.contactPhone || '+880 1712 345 678'}
            </span>
            <span className="flex items-center gap-1 font-medium">
              <Mail size={13}/> {tenant.contactEmail || `info@${activeSubdomain}.edu.bd`}
            </span>
            {tenant.eiin && (
              <span className="bg-white/15 px-2 py-0.5 rounded text-[11px] font-mono font-bold tracking-wide">
                EIIN: {tenant.eiin}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsResultModalOpen(true)} 
              className="hover:underline flex items-center gap-1 font-bold text-amber-300"
            >
              <Search size={13}/> ফলাফল অনুসন্ধান (Results)
            </button>
            <span className="text-white/40">|</span>
            <Link 
              to={`/institution/${activeSubdomain}/login`}
              className="bg-white text-slate-900 px-3 py-1 rounded-full font-bold text-xs hover:bg-amber-300 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <LogIn size={13} className="text-indigo-600"/> 
              <span>স্টুডেন্ট / টিচার লগইন</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header / Navigation */}
      <header className="bg-white shadow-sm sticky top-0 z-40 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl ${!logoUrl ? primaryBg : 'bg-white'} flex items-center justify-center text-white font-black text-xl overflow-hidden shadow-md ring-1 ring-slate-200 shrink-0`}>
              {logoUrl ? <img src={logoUrl} alt={schoolName} className="w-full h-full object-cover"/> : (schoolName || 'S').charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className={`text-xl sm:text-2xl font-black ${accentText} leading-tight`}>{schoolName}</h1>
                <Badge color={isMadrasa ? 'green' : isCollege ? 'blue' : 'purple'}>{institutionType}</Badge>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {tenant.address || 'Dhaka, Bangladesh'} • Estd. {tenant.establishedYear || '1995'}
              </p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-700">
            <a href="#about" className="hover:text-indigo-600 transition-colors">আমাদের পরিচিতি</a>
            <a href="#faculty" className="hover:text-indigo-600 transition-colors">শিক্ষকমণ্ডলী</a>
            <button onClick={() => setIsLibraryModalOpen(true)} className="hover:text-indigo-600 transition-colors">লাইব্রেরি</button>
            <button onClick={() => setIsAdmissionModalOpen(true)} className="hover:text-indigo-600 transition-colors text-indigo-600 font-bold">অনলাইন ভর্তি</button>
            <a href="#contact" className="hover:text-indigo-600 transition-colors">যোগাযোগ</a>
            <Link 
              to={`/institution/${activeSubdomain}/login`}
              className={`px-4 py-2 rounded-xl text-white font-bold text-xs shadow-md ${primaryBg} ${primaryHoverBg} transition-all flex items-center gap-1.5`}
            >
              <LogIn size={14}/> 
              <span>লগইন পোর্টাল</span>
            </Link>
          </nav>

          <Link 
            to={`/institution/${activeSubdomain}/login`}
            className={`md:hidden px-3 py-1.5 rounded-lg text-white font-bold text-xs ${primaryBg}`}
          >
            লগইন
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[460px] flex items-center justify-center text-center text-white overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/75 to-slate-950/85 z-10"></div>
        <img 
          src={isCollege 
            ? "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1600&auto=format&fit=crop" 
            : isMadrasa 
            ? "https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=1600&auto=format&fit=crop"
            : "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600&auto=format&fit=crop"} 
          className="absolute inset-0 w-full h-full object-cover" 
          alt={schoolName} 
        />
        
        <div className="relative z-20 max-w-4xl px-6 py-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-bold mb-4 border border-white/20">
            <Sparkles size={14} />
            <span>আধুনিক ডিজিটাল শিক্ষা ব্যবস্থাপনা প্ল্যাটফর্ম</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black mb-4 tracking-tight leading-tight">
            স্বাগতম — {schoolName}
          </h2>
          <p className="text-base sm:text-lg mb-8 text-slate-200 max-w-2xl mx-auto leading-relaxed">
            জ্ঞান, নৈতিকতা ও আধুনিক শিক্ষার সমন্বয়ে আগামী দিনের আলোকিত মানুষ গড়ার প্রত্যয়ে আমাদের প্রাতিষ্ঠানিক যাত্রা।
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              to={`/institution/${activeSubdomain}/login`}
              className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-400/20 transition-all flex items-center gap-2 scale-105"
            >
              <LogIn size={16} />
              <span>স্টুডেন্ট, অভিভাবক ও শিক্ষক লগইন</span>
            </Link>
            <Button 
              onClick={() => setIsAdmissionModalOpen(true)} 
              className={`${primaryBg} ${primaryHoverBg} border-none text-white font-bold px-6 py-3 text-sm`}
            >
              অনলাইন ভর্তি ফরম
            </Button>
          </div>

          {/* Quick Notice Banner on Hero */}
          <div className="mt-8 p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl max-w-2xl mx-auto text-xs text-slate-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge color="yellow">বিজ্ঞপ্তি</Badge>
              <span className="truncate">২০২৪ শিক্ষাবর্ষে সকল শ্রেণীতে শিক্ষার্থী ভর্তি কার্যক্রম চলছে।</span>
            </div>
            <button 
              onClick={() => setIsAdmissionModalOpen(true)}
              className="shrink-0 text-amber-300 font-bold hover:underline"
            >
              আবেদন করুন &rarr;
            </button>
          </div>
        </div>
      </section>

      {/* Institutional Login Callout Bar */}
      <section className="bg-amber-50 border-y border-amber-200 py-6">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-sm">
              <Lock size={22} />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-base">
                {schoolName} শিক্ষার্থী, অভিভাবক ও শিক্ষক লগইন পোর্টাল
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                শুধুমাত্র এই প্রতিষ্ঠানের ছাত্র-ছাত্রী, সম্মানিত অভিভাবক ও শিক্ষকগণ তাদের ডিজিটাল আইডি, রুটিন, নোটিশ ও অ্যাকাউন্টে প্রবেশের জন্য লগইন করুন।
              </p>
            </div>
          </div>
          <Link 
            to={`/institution/${activeSubdomain}/login`}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 shrink-0"
          >
            <span>লগইন একাউন্টে প্রবেশ করুন</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* Institutional Overview / Message from Head */}
      <section className="py-16 px-4 max-w-7xl mx-auto" id="about">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2">
            <Badge color="blue">আমাদের পরিচিতি</Badge>
            <h3 className="text-3xl font-black text-slate-900 mt-2 mb-4">
              শিক্ষার আলো ও নৈতিক মূল্যবোধের আদর্শ অঙ্গন
            </h3>
            <p className="text-slate-600 leading-relaxed text-sm mb-4">
              {schoolName} {tenant.establishedYear ? `${tenant.establishedYear} সাল থেকে` : ''} শিক্ষা বিস্তারে এক অনন্য দৃষ্টান্ত স্থাপন করে চলেছে। আমাদের প্রতিষ্ঠানে রয়েছে অভিজ্ঞ শিক্ষকমণ্ডলী, সুসজ্জিত বিজ্ঞানাগার, সমৃদ্ধ পাঠাগার এবং মাল্টিমিডিয়া ক্লাসরুম।
            </p>
            <p className="text-slate-600 leading-relaxed text-sm mb-6">
              আমরা স্মার্ট আমার স্কুল সিস্টেমের মাধ্যমে ডিজিটাল হাজিরা, অনলাইন পরীক্ষার ফলাফল, এসএমএস নোটিফিকেশন এবং অভিভাবক ট্র্যাকিং পোর্টাল সার্বক্ষণিকভাবে চালু রেখেছি।
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-200">
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm text-center">
                <h4 className="text-2xl font-black text-indigo-600">{tenant.studentsCount}+</h4>
                <p className="text-xs text-slate-500 font-bold mt-1">শিক্ষার্থী</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm text-center">
                <h4 className="text-2xl font-black text-emerald-600">{institutionStaff.length}+</h4>
                <p className="text-xs text-slate-500 font-bold mt-1">শিক্ষক ও স্টাফ</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm text-center">
                <h4 className="text-2xl font-black text-purple-600">১০০%</h4>
                <p className="text-xs text-slate-500 font-bold mt-1">ডিজিটাল রেজাল্ট</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm text-center">
                <h4 className="text-2xl font-black text-amber-600">{tenant.establishedYear || '১৯৯৫'}</h4>
                <p className="text-xs text-slate-500 font-bold mt-1">প্রতিষ্ঠিত</p>
              </div>
            </div>
          </div>

          {/* Principal Card */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 text-center">
            <div className="w-28 h-28 mx-auto rounded-2xl overflow-hidden bg-slate-100 mb-4 ring-4 ring-indigo-50 shadow-md">
              <img 
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&fit=crop" 
                alt="Principal" 
                className="w-full h-full object-cover"
              />
            </div>
            <h4 className="text-lg font-black text-slate-800">{tenant.principalName || 'অধ্যক্ষ / প্রতিষ্ঠান প্রধান'}</h4>
            <p className="text-xs text-indigo-600 font-bold mt-0.5">অধ্যক্ষ ও প্রধান শিক্ষক</p>
            <p className="text-xs text-slate-500 mt-3 italic leading-relaxed">
              "জ্ঞানই শক্তি, নৈতিকতাই জীবন। আমাদের লক্ষ্য প্রতিটি শিক্ষার্থীকে সৎ, দেশপ্রেমিক ও আধুনিক জ্ঞানসম্পন্ন নাগরিকে পরিণত করা।"
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-center">
              <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
                EIIN: {tenant.eiin || '134209'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Faculty Section */}
      <section className="py-16 bg-white border-t border-slate-200" id="faculty">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-xl mx-auto mb-12">
            <Badge color="blue">আমাদের শিক্ষকমণ্ডলী</Badge>
            <h3 className={`text-3xl font-black mt-2 text-slate-900`}>নিবেদিতপ্রাণ শিক্ষকবৃন্দ</h3>
            <p className="text-xs text-slate-500 mt-2">
              অভিজ্ঞ ও প্রশিক্ষিত শিক্ষকগণের নিবিড় তত্ত্বাবধানে পাঠদান পরিচালিত হয়।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {institutionStaff.map(staff => (
              <div key={staff.id} className="bg-slate-50 rounded-2xl border border-slate-200/80 overflow-hidden text-center hover:shadow-lg transition-all group">
                <div className="h-44 bg-slate-200 overflow-hidden relative">
                  <img 
                    src={staff.imageUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400'} 
                    alt={staff.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/90 text-slate-700 shadow-sm">
                      {staff.role}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{staff.name}</h4>
                  <p className="text-xs text-indigo-600 font-medium mt-0.5">{staff.designation}</p>
                  <p className="text-[11px] text-slate-400 font-mono mt-2 flex items-center justify-center gap-1">
                    <Phone size={11} /> {staff.phone}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Events & Notice Section */}
      <section className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
            <div>
              <Badge color="red">একাডেমিক ক্যালেন্ডার</Badge>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">আসন্ন ইভেন্ট ও নোটিশ</h3>
            </div>
            <button 
              onClick={() => setIsResultModalOpen(true)}
              className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
            >
              পরীক্ষার ফলাফল চেক করুন &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MOCK_EVENTS.map((evt) => (
              <Card key={evt.id} className="hover:shadow-md transition-shadow bg-white border border-slate-200/80">
                <div className="flex items-start gap-4">
                  <div className={`w-16 h-16 rounded-2xl ${primaryBg} text-white flex flex-col items-center justify-center shrink-0 shadow-md`}>
                    <span className="text-xl font-black leading-none">{evt.date.split('-')[2]}</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider mt-1">{new Date(evt.date).toLocaleString('default', { month: 'short' })}</span>
                  </div>
                  <div>
                    <Badge color={evt.type === 'Holiday' ? 'red' : 'blue'}>{evt.type}</Badge>
                    <h4 className="font-bold text-slate-800 text-sm mt-1">{evt.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{evt.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-14" id="contact">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-bold text-slate-900 text-lg overflow-hidden shadow">
                {logoUrl ? <img src={logoUrl} alt={schoolName} className="w-full h-full object-cover"/> : (schoolName || 'S').charAt(0)}
              </div>
              <h2 className="text-white text-xl font-black">{schoolName}</h2>
            </div>
            <p className="max-w-md text-xs text-slate-400 leading-relaxed mb-4">
              মানসম্মত শিক্ষা ও সৎ চরিত্র গঠনে অঙ্গীকারাবদ্ধ শিক্ষা প্রতিষ্ঠান। শিক্ষা বোর্ড ও শিক্ষা মন্ত্রণালয় কর্তৃক স্বীকৃত।
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">EIIN: {tenant.eiin || '134209'}</span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400">সাবডোমেন: {tenant.subdomain}.smartamarschool.com</span>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-4">প্রয়োজনীয় লিংক</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to={`/institution/${activeSubdomain}/login`} className="text-amber-400 font-bold hover:underline flex items-center gap-1">
                  <LogIn size={12}/> স্টুডেন্ট ও অভিভাবক লগইন
                </Link>
              </li>
              <li><button onClick={() => setIsAdmissionModalOpen(true)} className="hover:text-white">অনলাইন ভর্তি ফরম</button></li>
              <li><button onClick={() => setIsResultModalOpen(true)} className="hover:text-white">ফলাফল অনুসন্ধান</button></li>
              <li><button onClick={() => setIsLibraryModalOpen(true)} className="hover:text-white">লাইব্রেরি ক্যাটালগ</button></li>
              <li><Link to="/login" className="text-slate-400 hover:text-white">Smart Amar School প্রধান পোর্টাল</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-4">যোগাযোগ</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2"><MapPin size={14} className="text-indigo-400 shrink-0"/> {tenant.address || 'ঢাকা, বাংলাদেশ'}</li>
              <li className="flex items-center gap-2"><Phone size={14} className="text-indigo-400 shrink-0"/> {tenant.contactPhone || '+880 1712 345 678'}</li>
              <li className="flex items-center gap-2"><Mail size={14} className="text-indigo-400 shrink-0"/> {tenant.contactEmail || `info@${activeSubdomain}.edu.bd`}</li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© 2024 {schoolName}. All rights reserved.</p>
          <p>
            Powered by <Link to="/" className="text-indigo-400 font-bold hover:underline">Smart Amar School SaaS</Link>
          </p>
        </div>
      </footer>

      {/* Online Admission Modal */}
      <Modal 
        isOpen={isAdmissionModalOpen} 
        onClose={() => setIsAdmissionModalOpen(false)} 
        title={`অনলাইন ভর্তি ফরম • ${schoolName}`} 
        size="xl"
      >
        <div className="max-h-[80vh] overflow-y-auto p-1">
          <StudentAdmissionForm 
            customSchoolName={schoolName}
            customSchoolAddress={`${tenant.address || 'Dhaka, Bangladesh'} • Contact: ${tenant.contactPhone || '+880 1712-345678'}`}
            customSchoolSubTitle={`অফিসিয়াল ভর্তি আবেদন ফরম (${institutionType.toUpperCase()})`}
            customLogoBadgeText={schoolName}
            isPublicMode={true}
            onSuccessSubmit={() => {
              setTimeout(() => setIsAdmissionModalOpen(false), 2500);
            }}
          />
        </div>
      </Modal>

      {/* Public Result Search Modal */}
      <Modal 
        isOpen={isResultModalOpen} 
        onClose={() => { setIsResultModalOpen(false); setFoundResult(null); }} 
        title={`ফলাফল অনুসন্ধান • ${schoolName}`}
      >
        <form className="space-y-4" onSubmit={handleResultSearch}>
          <Input 
            label="শিক্ষার্থী রোল নম্বর (Roll No)" 
            value={resultQuery.roll} 
            onChange={(e) => setResultQuery({...resultQuery, roll: e.target.value})} 
            placeholder="উদাহরণ: 101 বা 102" 
            required 
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">পরীক্ষা</label>
              <select className="w-full px-3 py-2 border rounded-xl text-sm bg-white">
                <option>First Term Exam 2024</option>
                <option>Half Yearly Exam 2024</option>
                <option>Annual Exam 2024</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">শিক্ষাবর্ষ</label>
              <select className="w-full px-3 py-2 border rounded-xl text-sm bg-white">
                <option>2024</option>
                <option>2023</option>
              </select>
            </div>
          </div>
          <Button type="submit" className="w-full">অনুসন্ধান করুন</Button>
        </form>

        {foundResult && foundResult !== 'not_found' && (
          <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-emerald-800 text-sm">{foundResult.studentName}</span>
              <Badge color="green">Grade: {foundResult.grade}</Badge>
            </div>
            <p className="text-xs text-emerald-700 font-mono">Roll: {foundResult.rollNo} • Total Marks: {foundResult.marks?.total}</p>
          </div>
        )}

        {foundResult === 'not_found' && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 text-center font-bold">
            কোন ফলাফল পাওয়া যায়নি! রোল নম্বরটি সঠিকভাবে দিন (যেমন: 101)।
          </div>
        )}
      </Modal>

      {/* Library Catalog Modal */}
      <Modal isOpen={isLibraryModalOpen} onClose={() => setIsLibraryModalOpen(false)} title={`পাবলিক পাঠাগার ক্যাটালগ • ${schoolName}`}>
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {MOCK_BOOKS.map(book => (
            <div key={book.id} className="flex justify-between items-center p-3 border border-slate-100 rounded-xl hover:bg-slate-50">
              <div>
                <h4 className="font-bold text-slate-800 text-xs">{book.title}</h4>
                <p className="text-[11px] text-slate-500">{book.author}</p>
              </div>
              <Badge color={book.status === 'Available' ? 'green' : 'red'}>{book.status}</Badge>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

/**
 * Dedicated Institution Login Page Component
 * Allows ONLY Students, Parents, and Teachers of THIS institution to log in!
 * URL: /institution/:subdomain/login
 */
export const InstitutionLogin = () => {
  const { subdomain } = useParams<{ subdomain: string }>();
  const navigate = useNavigate();
  const { loginAsStudent, loginAsParent, loginAsTeacher } = useAuth();

  const tenant = getTenantBySubdomain(subdomain);
  const activeSubdomain = tenant.subdomain;
  const schoolName = tenant.name;

  const [role, setRole] = useState<'student' | 'parent' | 'teacher'>('student');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('123456');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [wrongInstitutionRedirect, setWrongInstitutionRedirect] = useState<{ name: string; subdomain: string } | null>(null);

  // Retrieve students registered for THIS institution for quick demo fills
  const storedStudents = getStoredStudents();
  const institutionStudents = storedStudents.filter(
    s => (s.tenantSubdomain || '').toLowerCase() === activeSubdomain.toLowerCase()
  );

  // If none explicitly matched, take sample students and tag them
  const sampleStudents = institutionStudents.length > 0 
    ? institutionStudents.slice(0, 3) 
    : storedStudents.slice(0, 3);

  // Staff registered for THIS institution
  const institutionStaff = MOCK_STAFF.filter(
    s => !s.tenantSubdomain || s.tenantSubdomain.toLowerCase() === activeSubdomain.toLowerCase()
  );

  const handleRoleChange = (newRole: typeof role) => {
    setRole(newRole);
    setErrorMessage('');
    setSuccessMessage('');
    setWrongInstitutionRedirect(null);
    if (newRole === 'student') {
      setIdentifier(sampleStudents[0]?.id || '101');
      setPassword('123456');
    } else if (newRole === 'parent') {
      setIdentifier(sampleStudents[0]?.phone || '01711111111');
      setPassword('123456');
    } else if (newRole === 'teacher') {
      setIdentifier(institutionStaff[0]?.email || 'abdul@school.edu');
      setPassword('123456');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setWrongInstitutionRedirect(null);
    setIsLoading(true);

    setTimeout(() => {
      if (role === 'student') {
        const result = loginAsStudent(identifier, password, activeSubdomain);
        if (result.success) {
          setSuccessMessage(result.message);
          setTimeout(() => navigate('/student/dashboard'), 400);
        } else {
          setErrorMessage(result.message);
          setIsLoading(false);
        }
      } else if (role === 'parent') {
        const result = loginAsParent(identifier, password, activeSubdomain);
        if (result.success) {
          setSuccessMessage(result.message);
          setTimeout(() => navigate('/parent/dashboard'), 400);
        } else {
          setErrorMessage(result.message);
          setIsLoading(false);
        }
      } else if (role === 'teacher') {
        const result = loginAsTeacher(identifier, password, activeSubdomain);
        if (result.success) {
          setSuccessMessage(result.message);
          setTimeout(() => navigate('/teacher/dashboard'), 400);
        } else {
          setErrorMessage(result.message);
          setIsLoading(false);
        }
      }
    }, 350);
  };

  const quickFillStudent = (stId: string) => {
    setIdentifier(stId);
    setPassword('123456');
    setErrorMessage('');
    setWrongInstitutionRedirect(null);
    const result = loginAsStudent(stId, '123456', activeSubdomain);
    if (result.success) {
      setSuccessMessage(result.message);
      setTimeout(() => navigate('/student/dashboard'), 300);
    }
  };

  const quickFillParent = (phoneOrId: string) => {
    setIdentifier(phoneOrId);
    setPassword('123456');
    setErrorMessage('');
    setWrongInstitutionRedirect(null);
    const result = loginAsParent(phoneOrId, '123456', activeSubdomain);
    if (result.success) {
      setSuccessMessage(result.message);
      setTimeout(() => navigate('/parent/dashboard'), 300);
    }
  };

  const quickFillTeacher = (email: string) => {
    setIdentifier(email);
    setPassword('123456');
    setErrorMessage('');
    setWrongInstitutionRedirect(null);
    const result = loginAsTeacher(email, '123456', activeSubdomain);
    if (result.success) {
      setSuccessMessage(result.message);
      setTimeout(() => navigate('/teacher/dashboard'), 300);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between font-sans">
      {/* Top Header with Back to School Link */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link 
            to={`/institution/${activeSubdomain}`}
            className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>প্রতিষ্ঠানের ওয়েবসাইটে ফিরে যান ({schoolName})</span>
          </Link>

          <Link 
            to="/login"
            className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1.5"
          >
            <School size={14} />
            <span>Smart Amar School সেন্ট্রাল লগইন</span>
          </Link>
        </div>
      </header>

      {/* Main Login Card Area */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8">
          
          {/* Institutional Branding Header */}
          <div className="text-center mb-6 pb-6 border-b border-slate-100">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 mx-auto flex items-center justify-center shadow-md overflow-hidden mb-3">
              {tenant.logoUrl ? (
                <img src={tenant.logoUrl} alt={schoolName} className="w-full h-full object-cover" />
              ) : (
                <span className="font-black text-2xl text-indigo-700">{(schoolName || 'S').charAt(0)}</span>
              )}
            </div>
            <div className="flex items-center justify-center gap-2 mb-1">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{schoolName}</h2>
              <Badge color="blue">{tenant.type}</Badge>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              শিক্ষার্থী, অভিভাবক ও শিক্ষক লগইন পোর্টাল • EIIN: {tenant.eiin || '134209'}
            </p>

            {/* Strict Notice */}
            <div className="mt-3 p-2.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-[11px] text-indigo-900 flex items-center justify-center gap-2">
              <ShieldCheck size={14} className="text-indigo-600 shrink-0" />
              <span>এই পোর্টালে শুধুমাত্র <strong>{schoolName}</strong>-এর শিক্ষার্থী, অভিভাবক ও শিক্ষকগণ লগইন করতে পারবেন।</span>
            </div>
          </div>

          {/* Role Tabs */}
          <div className="flex p-1.5 bg-slate-100 rounded-2xl mb-6 border border-slate-200/80 gap-1.5">
            {[
              { id: 'student', label: '🎓 Student / শিক্ষার্থী' },
              { id: 'parent', label: '👨‍👩‍👧 Parent / অভিভাবক' },
              { id: 'teacher', label: '👨‍🏫 Teacher / শিক্ষক' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleRoleChange(tab.id as typeof role)}
                className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-bold transition-all text-center ${
                  role === tab.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="mb-5 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold">প্রবেশাধিকার ব্যর্থ হয়েছে (Access Denied)</p>
                  <p className="mt-1 leading-relaxed text-rose-700">{errorMessage}</p>
                </div>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-800 animate-in fade-in">
              <CheckCircle size={16} className="text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">সফলভাবে প্রবেশ করা হয়েছে!</p>
                <p className="text-emerald-700">{successMessage}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form className="space-y-4" onSubmit={handleLoginSubmit}>
            {role === 'student' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Student ID or Roll No / শিক্ষার্থী আইডি বা রোল নম্বর
                  </label>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. ST-2024-001 or 101"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Security PIN / Password / পিন কোড
                    </label>
                    <button
                      type="button"
                      onClick={() => setPassword('123456')}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
                    >
                      Default PIN (123456)
                    </button>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter 6-digit PIN"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 font-mono"
                  />
                </div>

                {/* Quick 1-Click Fill for Students of this institution */}
                <div className="pt-2">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    ⚡ {schoolName}-এর পরীক্ষামূলক শিক্ষার্থী আইডি:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {sampleStudents.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => quickFillStudent(s.id)}
                        className="p-2.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl text-left transition-all group cursor-pointer"
                      >
                        <div className="font-bold text-xs text-slate-800 group-hover:text-indigo-700 truncate">
                          {s.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {s.class} • Roll {s.rollNo}
                        </div>
                        <div className="text-[9px] text-indigo-600 font-mono font-bold mt-1">
                          {s.id}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {role === 'parent' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Guardian Mobile or Student ID / অভিভাবক মোবাইল বা শিক্ষার্থী আইডি
                  </label>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. 01711111111 or ST-2024-001"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Security PIN / Password / পিন কোড
                    </label>
                    <button
                      type="button"
                      onClick={() => setPassword('123456')}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
                    >
                      Default PIN (123456)
                    </button>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter guardian PIN"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 font-mono"
                  />
                </div>

                {/* Quick 1-Click Fill for Parents of this institution */}
                <div className="pt-2">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    ⚡ {schoolName}-এর পরীক্ষামূলক অভিভাবক একাউন্ট:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {sampleStudents.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => quickFillParent(s.phone || s.id)}
                        className="p-2.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl text-left transition-all group cursor-pointer"
                      >
                        <div className="font-bold text-xs text-slate-800 group-hover:text-indigo-700 truncate">
                          {s.guardian || `Parent of ${s.name}`}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate mt-0.5">
                          সন্তান: {s.name}
                        </div>
                        <div className="text-[9px] text-indigo-600 font-mono font-bold mt-1">
                          {s.phone || s.id}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {role === 'teacher' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Teacher Email or Teacher ID / শিক্ষক ইমেইল বা আইডি
                  </label>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. abdul@school.edu or EMP-001"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Password / পাসওয়ার্ড
                    </label>
                    <button
                      type="button"
                      onClick={() => setPassword('123456')}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
                    >
                      Default: 123456
                    </button>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 font-mono"
                  />
                </div>

                {/* Quick 1-Click Fill for Teachers of this institution */}
                <div className="pt-2">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    ⚡ {schoolName}-এর শিক্ষক একাউন্ট:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {institutionStaff.slice(0, 2).map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => quickFillTeacher(st.email || st.id)}
                        className="p-2.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl text-left transition-all group cursor-pointer"
                      >
                        <div className="font-bold text-xs text-slate-800 group-hover:text-indigo-700 truncate">
                          {st.name}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate mt-0.5">
                          {st.designation}
                        </div>
                        <div className="text-[9px] text-indigo-600 font-mono font-bold mt-1">
                          {st.email || st.id}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-base font-bold shadow-lg shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-700 text-white mt-4 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>যাচাইকরণ চলছে...</span>
              ) : (
                <>
                  <span>
                    {role === 'student' && `${schoolName} স্টুডেন্ট পোর্টালে প্রবেশ`}
                    {role === 'parent' && `${schoolName} অভিভাবক পোর্টালে প্রবেশ`}
                    {role === 'teacher' && `${schoolName} শিক্ষক পোর্টালে প্রবেশ`}
                  </span>
                  <ArrowRight size={18} />
                </>
              )}
            </Button>
          </form>

          {/* School Admin Notice at Footer */}
          <div className="mt-6 pt-5 border-t border-slate-100 bg-slate-50 -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 p-4 rounded-b-3xl text-center">
            <p className="text-xs text-slate-600">
              🏫 আপনি কি এই প্রতিষ্ঠানের <strong>School Admin (প্রধান শিক্ষক / অধ্যক্ষ)</strong>?
            </p>
            <Link 
              to="/login"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline mt-1 inline-block"
            >
              Smart Amar School কেন্দ্রীয় লগইন পেজে যান &rarr;
            </Link>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400 py-4">
        <span>© 2024 {schoolName} • Powered by Smart Amar School SaaS</span>
      </footer>
    </div>
  );
};

/**
 * Institutions Directory Page
 * Allows visitors to view all institutions and jump to their site or login link
 */
export const InstitutionsDirectoryPage = () => {
  const tenants = getStoredTenants();

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-white border-b border-slate-200 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-md">S</div>
            <span className="text-lg font-bold text-slate-900">Smart<span className="text-indigo-600">Amar</span>School</span>
          </Link>
          <Link to="/login" className="text-xs font-bold text-indigo-600 hover:underline">
            School Admin Login &rarr;
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <Badge color="green">প্রতিষ্ঠান ডিরেক্টরি ও লাইভ ডেমো</Badge>
          <h1 className="text-3xl font-black text-slate-900 mt-2 mb-3">সকল শিক্ষা প্রতিষ্ঠানের তালিকা</h1>
          <p className="text-sm text-slate-600">
            শিক্ষার্থী, অভিভাবক ও শিক্ষকগণ আপনার নির্দিষ্ট শিক্ষা প্রতিষ্ঠান নির্বাচন করে ওয়েবসাইট ভিজিট করুন অথবা সরাসরি লগইন করুন।
          </p>
        </div>

        {/* Featured Showcase 1: Al-Amin Islamiya Madrasa (Matching User Madrasa Design Collage) */}
        <div className="mb-8 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl ring-2 ring-emerald-500/50 border-t-4 border-amber-400">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-800/80 border border-emerald-600/50 rounded-full text-xs font-bold text-amber-300">
                <Sparkles size={14} />
                <span>মাদরাসার UI/UX ডিজাইন কোলাজ অনুযায়ী সম্পূর্ণ প্রস্তুতকৃত ওয়েবসাইট (৮টি পেজ)</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3 justify-center lg:justify-start">
                <span>আল-আমিন ইসলামিয়া মাদ্রাসা</span>
                <span className="text-xs bg-amber-400 text-slate-950 font-black px-2.5 py-0.5 rounded-full">মাদ্রাসা</span>
              </h2>
              <p className="text-emerald-100 text-sm leading-relaxed">
                "ইসলামি শিক্ষা, নৈতিকতা ও মানবতার বিকাশ" — হোম পেজ, আমাদের সম্পর্কে, ভর্তি নির্দেশিকা, একাডেমিক ও কিতাবসমূহ, পরীক্ষার ফলাফল ও মার্কশিট, ফটো গ্যালারি, শিক্ষক তালিকা, যোগাযোগ, অ্যাডমিন ও শিক্ষার্থী পোর্টাল।
              </p>
              <div className="flex flex-wrap gap-2 pt-2 justify-center lg:justify-start">
                <span className="text-[11px] bg-emerald-900/80 border border-emerald-600/40 px-2.5 py-1 rounded-md font-mono text-amber-300">EIIN: 138765</span>
                <span className="text-[11px] bg-emerald-900/80 border border-emerald-600/40 px-2.5 py-1 rounded-md">স্থাপিত: ১৯৯৮</span>
                <span className="text-[11px] bg-emerald-900/80 border border-emerald-600/40 px-2.5 py-1 rounded-md">শিক্ষার্থী: ৫০০+</span>
                <span className="text-[11px] bg-emerald-900/80 border border-emerald-600/40 px-2.5 py-1 rounded-md">মাধবপুর, হবিগঞ্জ</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 w-full sm:w-auto">
              <Link
                to="/madrasa"
                className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl shadow-lg transition-all text-center flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <span>মাদ্রাসা সাইটটি সরাসরি দেখুন</span>
                <ArrowRight size={16} />
              </Link>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/madrasa?tab=admin-login"
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg text-center border border-white/20 transition-colors"
                >
                  মাদ্রাসা অ্যাডমিন
                </Link>
                <Link
                  to="/madrasa?tab=portal"
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg text-center border border-white/20 transition-colors"
                >
                  ছাত্র পোর্টাল
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Showcase 2: Sonar Bangla Ideal High School (Matching User School Design Collage) */}
        <div className="mb-12 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl ring-1 ring-indigo-500/30">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-bold text-indigo-300">
                <Sparkles size={14} />
                <span>স্কুল UI ডিজাইন অনুযায়ী প্রস্তুতকৃত ওয়েবসাইট (১১টি পেজ)</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                সোনার বাংলা আদর্শ উচ্চ বিদ্যালয়
              </h2>
              <p className="text-slate-200 text-sm leading-relaxed">
                "জ্ঞানই শক্তি, শিক্ষাই উন্নতি" — আধুনিক শিক্ষা, অনলাইন ভর্তি, ফলাফল অনুসন্ধান, শিক্ষক ও শিক্ষার্থীদের সম্পূর্ণ পোর্টাল।
              </p>
              <div className="flex flex-wrap gap-2 pt-2 justify-center lg:justify-start">
                <span className="text-[11px] bg-slate-800/80 border border-slate-600/40 px-2.5 py-1 rounded-md font-mono">EIIN: 134567</span>
                <span className="text-[11px] bg-slate-800/80 border border-slate-600/40 px-2.5 py-1 rounded-md">স্থাপিত: ১৯৮৫</span>
                <span className="text-[11px] bg-slate-800/80 border border-slate-600/40 px-2.5 py-1 rounded-md">শিক্ষার্থী: ১০০০+</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 w-full sm:w-auto">
              <Link
                to="/sonar-bangla"
                className="px-6 py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl shadow-lg transition-all text-center flex items-center justify-center gap-2 text-sm"
              >
                <span>স্কুল সাইটটি দেখুন</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tenants.map(t => (
            <Card key={t.id} className="hover:shadow-xl transition-all border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-black text-indigo-700 text-lg overflow-hidden shrink-0 shadow-sm">
                    {t.logoUrl ? <img src={t.logoUrl} alt={t.name} className="w-full h-full object-cover" /> : (t.name || 'S').charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base leading-tight">{t.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge color={t.type === 'Madrasa' ? 'green' : t.type === 'College' ? 'blue' : t.type === 'University' ? 'red' : 'purple'}>{t.type}</Badge>
                      {t.eiin && <span className="text-[10px] font-mono text-slate-500 font-bold">EIIN: {t.eiin}</span>}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-500 mb-4 line-clamp-2">
                  {t.address || 'Dhaka, Bangladesh'} • Subdomain: <span className="font-mono text-indigo-600">{t.subdomain}.smartamarschool.com</span>
                </p>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-100">
                <Link
                  to={`/institution/${t.subdomain}`}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-600 text-xs font-bold flex items-center justify-center gap-2 transition-all bg-slate-50 hover:bg-indigo-50/50"
                >
                  <ExternalLink size={14} />
                  <span>ওয়েবসাইট ভিজিট করুন</span>
                </Link>
                <Link
                  to={`/institution/${t.subdomain}/login`}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 transition-all"
                >
                  <LogIn size={14} />
                  <span>স্টুডেন্ট / টিচার লগইন পোর্টাল</span>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};
