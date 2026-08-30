import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { SettingsDropdown } from './SettingsDropdown';
import { Sun, Moon, Settings } from 'lucide-react';

/**
 * TopControls Component
 * 
 * Persistent top-right floating control group housing theme toggle
 * and settings popover. Uses focus-visible and active press styling
 * to prevent sticky persistent borders after mouse clicks.
 */
export const TopControls = ({ showSettings = true }) => {
  const { theme, toggleTheme } = useTheme();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const baseButtonClasses =
    'inline-flex items-center justify-center w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full bg-cream/70 dark:bg-ink-soft/20 border transition-all duration-200 outline-none select-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:border-terracotta focus-visible:ring-2 focus-visible:ring-terracotta/30 active:border-terracotta/60 active:scale-95';

  return (
    <aside
      aria-label="App controls"
      className="fixed top-3.5 right-3.5 sm:top-5 sm:right-6 z-50 flex items-center gap-1.5 p-1 bg-surface/90 dark:bg-ink/90 backdrop-blur-md border border-border/80 dark:border-ink-soft/40 rounded-full shadow-md transition-colors"
    >
      {/* Theme Toggle Button */}
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        className={`${baseButtonClasses} border-border/80 dark:border-ink-soft/40 text-ink-soft dark:text-cream/80 hover:text-ink dark:hover:text-cream hover:bg-cream dark:hover:bg-ink-soft/35 hover:border-border dark:hover:border-ink-soft/60 shadow-xs`}
      >
        {theme === 'dark' ? (
          <Sun className="w-4 h-4 text-gold animate-in spin-in-90 duration-200" />
        ) : (
          <Moon className="w-4 h-4 animate-in spin-in-90 duration-200" />
        )}
      </button>

      {/* Optional Settings Trigger (hidden on login page) */}
      {showSettings && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsSettingsOpen((prev) => !prev)}
            aria-label="Settings menu"
            aria-expanded={isSettingsOpen}
            className={`${baseButtonClasses} shadow-xs ${
              isSettingsOpen
                ? 'bg-cream dark:bg-ink-soft/40 border-terracotta/50 dark:border-terracotta/50 text-terracotta'
                : 'border-border/80 dark:border-ink-soft/40 text-ink-soft dark:text-cream/80 hover:text-ink dark:hover:text-cream hover:bg-cream dark:hover:bg-ink-soft/35 hover:border-border dark:hover:border-ink-soft/60'
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Settings Dropdown Popover */}
          <SettingsDropdown
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
          />
        </div>
      )}
    </aside>
  );
};

export default TopControls;
