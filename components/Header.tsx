import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Globe, Languages, Check, ChevronDown, Bell, Search, 
  Settings, Menu, X, Sparkles, User, Palette, ChevronRight,
  ShieldCheck, LogOut
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { HeaderGlobalSearchBar } from './HeaderGlobalSearchBar';
import { LanguageCode, UserRole } from '../types';

export interface GlobalLanguageSwitcherProps {
  variant?: 'segmented' | 'toggle' | 'pill' | 'dropdown';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showFlag?: boolean;
  showLabels?: boolean;
}

/**
 * Global Language Switcher Component
 * Utilizes the existing LanguageProvider via useLanguage() to seamlessly toggle
 * the entire application interface between English and Bangla (with optional other locales).
 */
export const GlobalLanguageSwitcher: React.FC<GlobalLanguageSwitcherProps> = ({
  variant = 'segmented',
  size = 'sm',
  className = '',
  showFlag = true,
  showLabels = true
}) => {
  const { language, setLanguage, toggleLanguage, isBengali, t } = useLanguage();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [dropdownOpen]);

  // Variant 1: Segmented Bilingual Selector (Default for Clean Modern Headers)
  if (variant === 'segmented') {
    return (
      <div 
        className={`inline-flex items-center rounded-xl border border-slate-200/90 bg-slate-100/90 p-0.5 text-xs shadow-2xs select-none transition-all ${className}`}
        role="group"
        aria-label="Language selector"
      >
        {/* English Button */}
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer font-bold ${
            language === 'en'
              ? 'bg-white text-indigo-700 shadow-xs ring-1 ring-slate-200/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
          title="Switch to English interface"
          aria-pressed={language === 'en'}
        >
          {showFlag && <span className="text-xs leading-none">🇺🇸</span>}
          {showLabels && <span>English</span>}
          {!showLabels && <span>EN</span>}
        </button>

        {/* Bangla Button */}
        <button
          type="button"
          onClick={() => setLanguage('bn')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer font-bold ${
            isBengali
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
          title="বাংলায় পরিবর্তন করুন"
          aria-pressed={isBengali}
        >
          {showFlag && <span className="text-xs leading-none">🇧🇩</span>}
          {showLabels && <span>বাংলা</span>}
          {!showLabels && <span>BN</span>}
        </button>
      </div>
    );
  }

  // Variant 2: Sliding Pill Toggle
  if (variant === 'toggle') {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={isBengali}
        onClick={toggleLanguage}
        className={`group relative inline-flex items-center bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-full p-0.5 cursor-pointer transition-all duration-200 select-none shadow-inner focus:outline-none focus:ring-2 focus:ring-emerald-500/40 h-8 ${className}`}
        title={isBengali ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}
        aria-label="Toggle language between English and Bangla"
      >
        <span className={`px-2.5 text-xs font-bold transition-colors z-10 flex items-center gap-1 ${!isBengali ? 'text-slate-900 font-extrabold' : 'text-slate-400'}`}>
          {showFlag && <span>🇺🇸</span>}
          <span>EN</span>
        </span>
        <span className={`px-2.5 text-xs font-bold transition-colors z-10 flex items-center gap-1 ${isBengali ? 'text-emerald-950 font-extrabold' : 'text-slate-400'}`}>
          {showFlag && <span>🇧🇩</span>}
          <span>বাংলা</span>
        </span>
        <span
          className={`absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-full transition-transform duration-200 ease-out shadow-xs border ${
            isBengali
              ? 'translate-x-[calc(100%+2px)] bg-emerald-500 border-emerald-600'
              : 'translate-x-0 bg-white border-slate-300'
          }`}
        />
      </button>
    );
  }

  // Variant 3: Compact Pill Button
  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={toggleLanguage}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer shadow-2xs ${
          isBengali
            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
        } ${className}`}
        title={isBengali ? 'Click for English' : 'বাংলায় দেখতে ক্লিক করুন'}
      >
        <Globe size={14} className={isBengali ? 'text-emerald-600' : 'text-slate-500'} />
        <span>{isBengali ? '🇧🇩 বাংলা' : '🇺🇸 English'}</span>
      </button>
    );
  }

  // Variant 4: Dropdown with all locales
  return (
    <div ref={dropdownRef} className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-2xs"
        aria-expanded={dropdownOpen}
      >
        <Globe size={14} className="text-indigo-600" />
        <span>{isBengali ? '🇧🇩 বাংলা' : '🇺🇸 English'}</span>
        <ChevronDown size={12} className={`text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95">
          <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
            Interface Language / ভাষা
          </div>
          <button
            type="button"
            onClick={() => { setLanguage('en'); setDropdownOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left cursor-pointer ${
              language === 'en' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <span>🇺🇸</span>
              <span>English (US)</span>
            </span>
            {language === 'en' && <Check size={13} className="text-indigo-600" />}
          </button>
          <button
            type="button"
            onClick={() => { setLanguage('bn'); setDropdownOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left cursor-pointer ${
              isBengali ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <span>🇧🇩</span>
              <span>বাংলা (Bengali)</span>
            </span>
            {isBengali && <Check size={13} className="text-emerald-600" />}
          </button>
        </div>
      )}
    </div>
  );
};

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
  showLanguageSwitcher?: boolean;
  showYearSelector?: boolean;
  showThemeColor?: boolean;
  showNotifications?: boolean;
  showUserProfile?: boolean;
  onMobileMenuToggle?: () => void;
  className?: string;
  role?: UserRole;
}

/**
 * Universal Header Component
 * Encapsulates the global language switcher, header global search bar,
 * notifications, year selector, and user profile.
 */
export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showSearch = true,
  showLanguageSwitcher = true,
  showYearSelector = true,
  showThemeColor = false,
  showNotifications = true,
  showUserProfile = true,
  onMobileMenuToggle,
  className = '',
  role
}) => {
  const { user, logout, activeTenant } = useAuth();
  const { t, isBengali, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    if (profileDropdownOpen) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [profileDropdownOpen]);

  return (
    <header className={`h-16 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-20 shadow-2xs ${className}`}>
      {/* Left: Mobile Toggle & Page / Institution Title */}
      <div className="flex items-center gap-3">
        {onMobileMenuToggle && (
          <button 
            type="button"
            onClick={onMobileMenuToggle} 
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
            aria-label="Toggle mobile navigation"
          >
            <Menu size={20} />
          </button>
        )}

        {title ? (
          <div>
            <h1 className="text-base font-black text-slate-800 leading-tight uppercase tracking-tight">
              {title}
            </h1>
            {subtitle && <p className="text-[11px] text-slate-400">{subtitle}</p>}
          </div>
        ) : (
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-black flex items-center justify-center text-sm shadow-sm">
              S
            </div>
            <div className="hidden sm:block">
              <span className="font-black text-slate-900 tracking-tight text-sm">
                {activeTenant?.name || 'Smart Amar School'}
              </span>
              <span className="block text-[10px] text-slate-400 font-bold uppercase">
                {activeTenant?.type || 'National ERP'}
              </span>
            </div>
          </Link>
        )}
      </div>

      {/* Middle: Header Global Search Bar */}
      {showSearch && (
        <div className="hidden lg:block flex-1 max-w-md mx-6">
          <HeaderGlobalSearchBar />
        </div>
      )}

      {/* Right: Controls & Language Switcher */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* GLOBAL LANGUAGE SWITCHER */}
        {showLanguageSwitcher && (
          <div className="flex items-center">
            <GlobalLanguageSwitcher variant="segmented" size="sm" showLabels={true} />
          </div>
        )}

        {/* Year Selector */}
        {showYearSelector && (
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-900 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold border border-slate-700 shadow-xs">
            <span className="text-slate-400">Year:</span>
            <select 
              defaultValue="2026"
              className="bg-transparent text-emerald-400 font-mono font-bold outline-none cursor-pointer text-xs pr-1"
            >
              <option value="2026" className="bg-slate-900 text-white">2026</option>
              <option value="2025" className="bg-slate-900 text-white">2025</option>
              <option value="2024" className="bg-slate-900 text-white">2024</option>
            </select>
          </div>
        )}

        {/* Notifications */}
        {showNotifications && (
          <Link
            to="/school/communication"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative"
            title="Communication & Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"></span>
          </Link>
        )}

        {/* Settings */}
        <Link 
          to="/school/settings/general"
          className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          title="Settings"
        >
          <Settings size={14} className="text-slate-600" />
          <span>Setting</span>
        </Link>

        {/* User Profile Avatar & Dropdown */}
        {showUserProfile && user && (
          <div ref={profileRef} className="relative">
            <button
              type="button"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm ring-2 ring-indigo-100 cursor-pointer overflow-hidden"
              aria-label="User profile menu"
            >
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name.substring(0, 2).toUpperCase()
              )}
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-4 py-2 border-b border-slate-100">
                  <div className="font-bold text-xs text-slate-900 truncate">{user.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">{user.email}</div>
                  <span className="mt-1 inline-block text-[9px] bg-indigo-100 text-indigo-800 font-black px-2 py-0.5 rounded-full uppercase">
                    {user.role}
                  </span>
                </div>

                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      navigate('/school/settings/general');
                    }}
                    className="w-full px-4 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Settings size={14} className="text-slate-500" />
                    <span>Profile Settings</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                      navigate('/login');
                    }}
                    className="w-full px-4 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer font-bold border-t border-slate-100 mt-1 pt-2"
                  >
                    <LogOut size={14} />
                    <span>{t('logout', 'Logout')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
