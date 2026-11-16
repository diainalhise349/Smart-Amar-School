import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { School, Compass, LayoutDashboard, Globe, ChevronRight, Sparkles } from 'lucide-react';
import { GlobalLanguageSwitcher } from './Header';

export interface InstitutionTopSwitcherProps {
  currentInstitution?: 'school' | 'madrasa' | 'admin';
  activePageTab?: string;
  onPageSelect?: (tab: string) => void;
}

export const InstitutionTopSwitcher: React.FC<InstitutionTopSwitcherProps> = ({
  currentInstitution,
  activePageTab,
  onPageSelect
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isMadrasa = currentInstitution === 'madrasa' || location.pathname.includes('madrasa') || location.pathname.includes('al-amin');
  const isSchool = currentInstitution === 'school' || location.pathname.includes('sonar') || location.pathname.includes('school-website');
  const isAdmin = currentInstitution === 'admin' || location.pathname.startsWith('/school/') || location.pathname === '/school' || location.pathname.startsWith('/super-admin');

  return (
    <div className="bg-slate-950 text-white border-b border-slate-800 text-xs sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col md:flex-row items-center justify-between gap-2.5">
        
        {/* Left: Institution Selector Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline-flex items-center gap-1">
            <Sparkles size={12} className="text-amber-400" />
            <span>ডিজাইন প্রিভিউ:</span>
          </span>

          {/* School Button (Image 1) */}
          <button
            type="button"
            onClick={() => navigate('/sonar-bangla')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              isSchool && !isMadrasa && !isAdmin
                ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400 font-black'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <School size={14} className={isSchool ? 'text-amber-300' : 'text-slate-400'} />
            <span>সোনার বাংলা স্কুল (ছবি ১)</span>
          </button>

          {/* Madrasa Button (Image 2) */}
          <button
            type="button"
            onClick={() => navigate('/madrasa')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              isMadrasa
                ? 'bg-teal-700 text-white shadow-sm ring-1 ring-amber-400 font-black'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Compass size={14} className={isMadrasa ? 'text-amber-300' : 'text-slate-400'} />
            <span>আল-আমিন মাদ্রাসা (ছবি ২)</span>
          </button>

          {/* School Admin ERP */}
          <button
            type="button"
            onClick={() => navigate('/school')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              isAdmin
                ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400 font-black'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LayoutDashboard size={14} className="text-indigo-300" />
            <span>অ্যাডমিন ইআরপি প্যানেল</span>
          </button>
        </div>

        {/* Right: Quick Jump Info & Global Language Switcher */}
        <div className="flex items-center gap-3 text-[11px] text-slate-300">
          <span className="hidden lg:inline text-slate-400">
            {isSchool ? '✓ সোনার বাংলা আদর্শ উচ্চ বিদ্যালয় UI (১১টি পেজ)' : isMadrasa ? '✓ আল-আমিন ইসলামিয়া মাদ্রাসা UI (৮টি পেজ)' : '✓ স্মার্ট স্কুল অ্যাডমিন ম্যানেজমেন্ট'}
          </span>
          <span className="hidden sm:inline text-slate-700">|</span>
          <button
            onClick={() => {
              if (isSchool) navigate('/madrasa');
              else navigate('/sonar-bangla');
            }}
            className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer inline-flex items-center gap-1"
          >
            <span>{isSchool ? 'মাদ্রাসা সাইট দেখুন ➔' : 'স্কুল সাইট দেখুন ➔'}</span>
          </button>
          
          <div className="pl-1 border-l border-slate-700">
            <GlobalLanguageSwitcher variant="segmented" size="sm" showLabels={true} className="bg-slate-900 border-slate-700 text-slate-200" />
          </div>
        </div>

      </div>
    </div>
  );
};
