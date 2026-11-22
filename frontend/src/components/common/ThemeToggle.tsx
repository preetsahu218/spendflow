import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Sparkles } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  variant?: 'pill' | 'compact';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  variant = 'pill',
}) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  if (variant === 'compact') {
    return (
      <button
        onClick={toggleTheme}
        type="button"
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
        className={`relative inline-flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 hover:scale-105 active:scale-95 ${
          isDark
            ? 'bg-slate-900/90 text-amber-300 border-slate-700/80 hover:bg-slate-800 shadow-lg shadow-amber-500/10'
            : 'bg-white text-indigo-600 border-slate-200/90 hover:bg-slate-50 shadow-md shadow-indigo-500/10'
        } ${className}`}
      >
        <div className="relative w-5 h-5 flex items-center justify-center">
          <Sun
            className={`w-4 h-4 absolute transition-all duration-500 ${
              isDark
                ? 'rotate-0 scale-100 opacity-100 text-amber-300'
                : 'rotate-90 scale-0 opacity-0'
            }`}
          />
          <Moon
            className={`w-4 h-4 absolute transition-all duration-500 ${
              !isDark
                ? 'rotate-0 scale-100 opacity-100 text-indigo-600'
                : '-rotate-90 scale-0 opacity-0'
            }`}
          />
        </div>
      </button>
    );
  }

  // Modern Dual-Pill Segmented Switcher for Top Bar
  return (
    <div
      role="radiogroup"
      aria-label="Theme mode selector"
      className={`relative inline-flex items-center p-1 rounded-2xl bg-slate-200/70 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-300/60 dark:border-slate-700/70 shadow-inner transition-all duration-300 ${className}`}
    >
      {/* Sliding highlight indicator */}
      <div
        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl transition-all duration-300 ease-out shadow-sm pointer-events-none ${
          !isDark
            ? 'left-1 bg-white text-indigo-600 shadow-indigo-500/15 border border-slate-200/80'
            : 'left-[calc(50%+2px)] bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-indigo-600/30 border border-indigo-500/40'
        }`}
      />

      {/* Light Option Button */}
      <button
        type="button"
        onClick={() => {
          if (isDark) toggleTheme();
        }}
        aria-checked={!isDark}
        role="radio"
        className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 select-none ${
          !isDark
            ? 'text-indigo-900 font-bold scale-[1.02]'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
        }`}
      >
        <Sun
          className={`w-3.5 h-3.5 transition-transform duration-300 ${
            !isDark ? 'text-amber-500 rotate-12 scale-110' : 'text-slate-400'
          }`}
        />
        <span className="hidden sm:inline">Light</span>
      </button>

      {/* Dark Option Button */}
      <button
        type="button"
        onClick={() => {
          if (!isDark) toggleTheme();
        }}
        aria-checked={isDark}
        role="radio"
        className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 select-none ${
          isDark
            ? 'text-white font-bold scale-[1.02]'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <Moon
          className={`w-3.5 h-3.5 transition-transform duration-300 ${
            isDark ? 'text-amber-300 -rotate-12 scale-110' : 'text-slate-400'
          }`}
        />
        <span className="hidden sm:inline">Dark</span>
      </button>
    </div>
  );
};
