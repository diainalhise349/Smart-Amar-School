import React, { useState, useRef, useEffect } from 'react';
import { Languages, Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { LanguageCode } from '../types';

export interface LanguageToggleProps {
  variant?: 'switch' | 'buttons' | 'pill' | 'select' | 'compact';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showIcon?: boolean;
  showLabel?: boolean;
  showDropdownForOthers?: boolean;
}

const ALL_LANGUAGES: { code: LanguageCode; label: string; nativeName: string; flag: string }[] = [
  { code: 'bn', label: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩' },
  { code: 'en', label: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'ar', label: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ur', label: 'Urdu', nativeName: 'اردو', flag: '🇵🇰' },
];

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  variant = 'switch',
  size = 'md',
  className = '',
  showIcon = true,
  showLabel = false,
  showDropdownForOthers = true
}) => {
  const { language, setLanguage, toggleLanguage, isBengali, isRTL, t } = useLanguage();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [dropdownOpen]);

  const handleSelectLang = (code: LanguageCode) => {
    setLanguage(code);
    setDropdownOpen(false);
  };

  // 1. Dual Button / Segmented switch variant
  if (variant === 'buttons') {
    return (
      <div className={`inline-flex items-center rounded-xl border border-slate-200/90 bg-slate-100/90 p-0.5 text-xs font-semibold shadow-xs ${className}`}>
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
            language === 'en'
              ? 'bg-white text-indigo-700 shadow-xs font-bold ring-1 ring-slate-200/50'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          title="Switch to English"
        >
          {showIcon && <span className="text-xs">🇺🇸</span>}
          <span>English</span>
        </button>
        <button
          type="button"
          onClick={() => setLanguage('bn')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
            isBengali
              ? 'bg-emerald-600 text-white shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          title="বাংলায় পরিবর্তন করুন"
        >
          {showIcon && <span className="text-xs">🇧🇩</span>}
          <span>বাংলা</span>
        </button>
      </div>
    );
  }

  // 2. Select dropdown variant
  if (variant === 'select') {
    return (
      <div className={`relative inline-flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 font-medium ${className}`}>
        {showIcon && <Globe size={14} className="text-emerald-700 shrink-0" />}
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as LanguageCode)}
          className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer pr-1 text-xs"
          aria-label="Select language"
        >
          {ALL_LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.flag} {l.nativeName} ({l.code.toUpperCase()})
            </option>
          ))}
        </select>
      </div>
    );
  }

  // 3. Compact pill variant
  if (variant === 'compact' || variant === 'pill') {
    return (
      <button
        type="button"
        onClick={toggleLanguage}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer shadow-2xs ${
          isBengali
            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
        } ${className}`}
        title={isBengali ? 'Click to switch to English' : 'বাংলা ভাষায় পরিবর্তন করতে ক্লিক করুন'}
        aria-label="Toggle language between Bengali and English"
      >
        {showIcon && (
          <span className="text-xs">{isBengali ? '🇧🇩' : '🇺🇸'}</span>
        )}
        <span className="font-mono text-[10px] uppercase font-bold text-slate-400">
          {isBengali ? 'BN' : 'EN'}
        </span>
        <span className="border-l border-slate-200 pl-1.5 font-sans">
          {isBengali ? 'বাংলা' : 'English'}
        </span>
      </button>
    );
  }

  // 4. Default: Modern Bilingual Sliding Toggle Switch with optional dropdown companion
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  return (
    <div
      ref={dropdownRef}
      className={`relative inline-flex items-center gap-1.5 ${className}`}
    >
      {/* Interactive Toggle Switch Button */}
      <button
        type="button"
        role="switch"
        aria-checked={isBengali}
        onClick={toggleLanguage}
        className={`group relative inline-flex items-center bg-slate-100 hover:bg-slate-200 border border-slate-300/80 rounded-full p-0.5 cursor-pointer transition-all duration-200 select-none shadow-inner focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
          isSm ? 'h-7' : isLg ? 'h-9' : 'h-8'
        }`}
        title={
          isBengali
            ? 'Switch to English / ইংরেজিতে পরিবর্তন করুন'
            : 'বাংলায় দেখুন / Switch to Bengali interface'
        }
        aria-label="Toggle language between Bengali and English"
      >
        {/* Left Label: English */}
        <span
          className={`flex items-center justify-center gap-1 transition-colors duration-200 font-bold z-10 ${
            isSm ? 'px-2 text-[10px]' : isLg ? 'px-3 text-xs' : 'px-2.5 text-[11px]'
          } ${
            !isBengali
              ? 'text-slate-900 font-extrabold'
              : 'text-slate-400 group-hover:text-slate-600'
          }`}
        >
          {showIcon && <span className="text-[10px] leading-none">🇺🇸</span>}
          <span>EN</span>
        </span>

        {/* Right Label: Bengali */}
        <span
          className={`flex items-center justify-center gap-1 transition-colors duration-200 font-bold z-10 ${
            isSm ? 'px-2 text-[10px]' : isLg ? 'px-3 text-xs' : 'px-2.5 text-[11px]'
          } ${
            isBengali
              ? 'text-emerald-950 font-extrabold'
              : 'text-slate-400 group-hover:text-slate-600'
          }`}
        >
          {showIcon && <span className="text-[10px] leading-none">🇧🇩</span>}
          <span>বাংলা</span>
        </span>

        {/* Sliding Indicator Pill */}
        <span
          className={`absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-full transition-transform duration-250 ease-out shadow-xs border ${
            isBengali
              ? 'translate-x-[calc(100%+2px)] bg-emerald-500 border-emerald-600 text-white'
              : 'translate-x-0 bg-white border-slate-300 text-slate-800'
          }`}
        />
      </button>

      {/* Optional Label beside switch */}
      {showLabel && (
        <span className="hidden md:inline-block text-xs font-semibold text-slate-600 select-none">
          {isBengali ? 'বাংলা' : 'English'}
        </span>
      )}

      {/* Optional Dropdown Trigger for other languages (Arabic, Urdu, Hindi) */}
      {showDropdownForOthers && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200 ${
              dropdownOpen ? 'bg-slate-100 text-slate-800' : ''
            }`}
            title="All Languages / অন্যান্য ভাষা"
            aria-expanded={dropdownOpen}
            aria-label="Select from all available languages"
          >
            <ChevronDown size={13} className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div
              className={`absolute ${
                isRTL ? 'left-0' : 'right-0'
              } mt-1.5 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95`}
            >
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                Select Interface Language
              </div>
              {ALL_LANGUAGES.map((l) => {
                const isSelected = language === l.code;
                return (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => handleSelectLang(l.code)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-xs transition-colors cursor-pointer text-left ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-800 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-sm">{l.flag}</span>
                      <span>{l.nativeName}</span>
                      <span className="text-[10px] text-slate-400">({l.label})</span>
                    </span>
                    {isSelected && <Check size={13} className="text-emerald-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const LanguageToggleSwitch = LanguageToggle;
export default LanguageToggle;
