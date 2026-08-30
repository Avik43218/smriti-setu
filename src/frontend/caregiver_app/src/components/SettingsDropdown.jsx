import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Globe,
  Shield,
  FileText,
  LogOut,
  X,
  ExternalLink,
  ChevronDown,
  Check,
} from 'lucide-react';

const LANGUAGE_OPTIONS = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'as', label: 'Assamese', native: 'অসমীয়া' },
];

const APP_VERSION = 'v0.1.0';

export const SettingsDropdown = ({ isOpen, onClose }) => {
  const dropdownRef = useRef(null);
  const langMenuRef = useRef(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    try {
      return localStorage.getItem('caregiver_language') || 'en';
    } catch {
      return 'en';
    }
  });

  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'privacy' | 'terms' | null

  // Handle outside clicks to close dropdown or inner language sub-menu
  useEffect(() => {
    const handleOutsideClick = (e) => {
      // If clicking the settings toggle trigger button, let the button's own click handler toggle it
      const isClickOnTrigger = e.target.closest && e.target.closest('button[aria-label="Settings menu"]');
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) && !isClickOnTrigger) {
        onClose();
        setIsLangMenuOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, onClose]);

  const handleLanguageSelect = (langCode) => {
    setSelectedLanguage(langCode);
    setIsLangMenuOpen(false);
    try {
      localStorage.setItem('caregiver_language', langCode);
    } catch (err) {
      console.error('Failed to save language preference:', err);
    }
  };

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate('/login', { replace: true });
  };

  const currentLanguageObj =
    LANGUAGE_OPTIONS.find((l) => l.code === selectedLanguage) || LANGUAGE_OPTIONS[0];

  if (!isOpen && !activeModal) return null;

  return (
    <>
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-full mt-3 w-64 bg-surface dark:bg-ink border border-border dark:border-ink-soft/40 rounded-card shadow-xl p-3 z-50 transition-all font-sans animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header Title */}
          <div className="px-2.5 pt-1 pb-2 flex items-center justify-between border-b border-border/60 dark:border-ink-soft/30 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-ink dark:text-cream">
              Preferences
            </span>
            <span className="text-[10px] text-ink-soft dark:text-cream/50 font-medium">
              Smriti Setu
            </span>
          </div>

          {/* 1. Custom Language Dropdown Section */}
          <div className="px-1 py-1" ref={langMenuRef}>
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-ink-soft dark:text-cream/70 mb-1.5 px-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-terracotta" />
              <span>Language</span>
            </span>

            {/* Custom Dropdown Trigger Button */}
            <button
              type="button"
              onClick={() => setIsLangMenuOpen((prev) => !prev)}
              aria-expanded={isLangMenuOpen}
              className="w-full px-3 py-2 bg-cream dark:bg-ink-soft/20 hover:bg-cream/80 dark:hover:bg-ink-soft/30 border border-border dark:border-ink-soft/40 rounded-lg text-xs font-medium text-ink dark:text-cream flex items-center justify-between transition-colors focus:outline-none focus:ring-1 focus:ring-terracotta"
            >
              <span className="flex items-center gap-2">
                <span>{currentLanguageObj.label}</span>
                <span className="text-ink-soft dark:text-cream/50 text-[11px]">
                  ({currentLanguageObj.native})
                </span>
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-ink-soft dark:text-cream/60 transition-transform duration-200 ${
                  isLangMenuOpen ? 'rotate-180 text-terracotta' : ''
                }`}
              />
            </button>

            {/* Custom Floating Submenu for Language Options */}
            {isLangMenuOpen && (
              <div className="mt-1.5 p-1 bg-surface dark:bg-ink border border-border dark:border-ink-soft/40 rounded-lg shadow-md space-y-0.5 animate-in fade-in zoom-in-95 duration-150">
                {LANGUAGE_OPTIONS.map((lang) => {
                  const isSelected = selectedLanguage === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleLanguageSelect(lang.code)}
                      className={`w-full px-2.5 py-1.5 rounded-md text-xs flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'bg-terracotta/10 dark:bg-terracotta/20 text-terracotta font-semibold'
                          : 'text-ink dark:text-cream hover:bg-cream dark:hover:bg-ink-soft/20 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{lang.label}</span>
                        <span className="text-[11px] opacity-70">({lang.native})</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-terracotta" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. Divider */}
          <div className="my-2 border-t border-border dark:border-ink-soft/30" />

          {/* 3. Privacy Policy Link */}
          <button
            type="button"
            onClick={() => {
              onClose();
              setActiveModal('privacy');
            }}
            className="w-full text-left px-2.5 py-2 rounded-lg text-xs sm:text-sm text-ink dark:text-cream hover:bg-cream dark:hover:bg-ink-soft/20 flex items-center justify-between transition-colors group"
          >
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-ink-soft dark:text-cream/70 group-hover:text-terracotta transition-colors" />
              <span>Privacy Policy</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-ink-soft/50 dark:text-cream/40" />
          </button>

          {/* 4. Terms of Service Link */}
          <button
            type="button"
            onClick={() => {
              onClose();
              setActiveModal('terms');
            }}
            className="w-full text-left px-2.5 py-2 rounded-lg text-xs sm:text-sm text-ink dark:text-cream hover:bg-cream dark:hover:bg-ink-soft/20 flex items-center justify-between transition-colors group"
          >
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-ink-soft dark:text-cream/70 group-hover:text-terracotta transition-colors" />
              <span>Terms of Service</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-ink-soft/50 dark:text-cream/40" />
          </button>

          {/* 5. Version Info */}
          <div className="px-2.5 py-1.5 flex items-center justify-between text-xs text-ink-soft dark:text-cream/50">
            <span>App Version</span>
            <span className="font-mono text-xs">{APP_VERSION}</span>
          </div>

          {/* 6. Divider */}
          <div className="my-2 border-t border-border dark:border-ink-soft/30" />

          {/* 7. Log Out */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full text-left px-2.5 py-2 rounded-lg text-xs sm:text-sm text-terracotta hover:bg-cream dark:hover:bg-ink-soft/20 font-medium flex items-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4 text-terracotta" />
            <span>Sign Out</span>
          </button>
        </div>
      )}

      {/* Modal Dialog for Privacy Policy / Terms of Service */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 dark:bg-ink/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-surface dark:bg-ink border border-border dark:border-ink-soft/40 rounded-card p-6 shadow-xl relative animate-in fade-in zoom-in duration-150 font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-border dark:border-ink-soft/30">
              <div>
                <h2 className="text-lg font-bold text-ink dark:text-cream">
                  {activeModal === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
                </h2>
                <p className="text-xs text-ink-soft dark:text-cream/60">
                  Smriti Setu • Cognitive Assist Platform
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-full text-ink-soft dark:text-cream hover:bg-cream dark:hover:bg-ink-soft/20 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-5 text-sm text-ink-soft dark:text-cream/80 space-y-3 leading-relaxed">
              <p>
                {activeModal === 'privacy'
                  ? 'The Smriti Setu Privacy Policy outlines how caregiver profiles, patient metrics, and longitudinal clinical data are secured using strict role-based access control and encrypted storage.'
                  : 'The Smriti Setu Terms of Service govern clinical oversight, device pairing protocols, emergency alert responsibilities, and caregiver delegation.'}
              </p>
              <div className="p-3 bg-cream dark:bg-ink-soft/20 border border-border dark:border-ink-soft/30 rounded-lg text-xs">
                <span className="font-semibold text-ink dark:text-cream">Note:</span> Full clinical and legal compliance documentation is active for v0.1.
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-terracotta hover:bg-terracotta-dark text-surface text-xs sm:text-sm font-medium rounded-lg transition-colors shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SettingsDropdown;
