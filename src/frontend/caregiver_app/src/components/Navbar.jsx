import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { SettingsDropdown } from './SettingsDropdown';
import { IconButton } from './IconButton';
import {
  HeartHandshake,
  Sun,
  Moon,
  Settings,
} from 'lucide-react';

export const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Analytics', path: '/analytics' },
    { name: 'Care Plan', path: '/care-plan' },
  ];

  const linkRefs = useRef({});
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });

  const updateIndicator = () => {
    const currentPath = location.pathname;
    const activeLink = navLinks.find((l) => l.path === currentPath);
    const activeEl = activeLink ? linkRefs.current[activeLink.path] : null;

    if (activeEl) {
      setIndicatorStyle({
        left: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
        opacity: 1,
      });
    } else {
      setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
    }
  };

  useEffect(() => {
    updateIndicator();
    const timer = setTimeout(updateIndicator, 50);
    window.addEventListener('resize', updateIndicator);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateIndicator);
    };
  }, [location.pathname]);

  return (
    <header className="sticky top-3 sm:top-5 z-40 w-full max-w-5xl mx-auto px-3 sm:px-6">
      <nav className="w-full bg-surface/90 dark:bg-ink/90 backdrop-blur-md border border-border dark:border-ink-soft/40 rounded-full px-3 py-2 sm:px-5 sm:py-2.5 shadow-md flex items-center justify-between transition-colors">
        {/* Brand Logo & Name: Smriti Setu */}
        <Link
          to="/dashboard"
          className="flex items-center gap-2.5 text-ink dark:text-cream hover:opacity-90 transition-opacity shrink-0"
        >
          <div className="w-8 h-8 rounded-full bg-cream/70 dark:bg-ink-soft/20 border border-border/80 dark:border-ink-soft/40 flex items-center justify-center text-terracotta shadow-xs">
            <HeartHandshake className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xs sm:text-sm tracking-tight text-ink dark:text-cream leading-tight">
              Smriti Setu
            </span>
            <span className="text-[10px] text-ink-soft dark:text-cream/60 leading-none hidden sm:inline">
              Caregiver Portal
            </span>
          </div>
        </Link>

        {/* Center Nav Links with Animated Sliding Indicator */}
        <div className="relative flex items-center p-1 bg-cream/70 dark:bg-ink-soft/20 border border-border/70 dark:border-ink-soft/30 rounded-full">
          {/* Sliding Indicator Element */}
          <div
            className="absolute top-1 bottom-1 left-0 rounded-full bg-terracotta shadow-sm pointer-events-none transition-all duration-300 ease-out z-0"
            style={{
              transform: `translateX(${indicatorStyle.left}px)`,
              width: `${indicatorStyle.width}px`,
              opacity: indicatorStyle.opacity,
            }}
          />

          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                ref={(el) => (linkRefs.current[link.path] = el)}
                className={`relative z-10 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? 'text-surface font-semibold'
                    : 'text-ink-soft dark:text-cream/70 hover:text-ink dark:hover:text-cream'
                }`}
              >
                {link.name}
              </NavLink>
            );
          })}
        </div>

        {/* Right Controls: Unified IconButtons for Theme Toggle & Settings */}
        <div className="flex items-center gap-1.5 relative">
          {/* Theme Toggle Button */}
          <IconButton
            onClick={toggleTheme}
            ariaLabel={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-gold animate-in spin-in-90 duration-200" />
            ) : (
              <Moon className="w-4 h-4 animate-in spin-in-90 duration-200" />
            )}
          </IconButton>

          {/* Settings Trigger */}
          <div className="relative">
            <IconButton
              onClick={() => setIsSettingsOpen((prev) => !prev)}
              ariaLabel="Settings menu"
              ariaExpanded={isSettingsOpen}
              isActive={isSettingsOpen}
            >
              <Settings className="w-4 h-4" />
            </IconButton>

            {/* Dropdown Menu */}
            <SettingsDropdown
              isOpen={isSettingsOpen}
              onClose={() => setIsSettingsOpen(false)}
            />
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
