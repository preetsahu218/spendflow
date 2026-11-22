import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Wallet, ShieldCheck, Sparkles } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { CurrencyToggle } from './CurrencyToggle';
import { useCurrency } from '../../context/CurrencyContext';

export const Navbar: React.FC<{ onToggleSidebar?: () => void }> = () => {
  const { user, logout } = useAuth();
  const { currency, currencySymbol } = useCurrency();

  return (
    <header className="h-16 bg-white/80 dark:bg-[#090d16]/85 backdrop-blur-2xl border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40 transition-colors duration-300">
      {/* Brand & Project Metadata */}
      <div className="flex items-center gap-4">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-600 to-emerald-500 rounded-xl blur-xs opacity-70 group-hover:opacity-100 transition duration-300 animate-pulse-subtle"></div>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                SpendFlow
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-200/80 dark:border-indigo-800/60 shadow-xs">
                <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
                CS Major Project
              </span>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 hidden md:block">
              Algorithmic Cash Flow & Expense Ledger
            </span>
          </div>
        </Link>
      </div>

      {/* Center Live Status Badge (Hidden on mobile) */}
      <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-[11px] font-medium text-slate-600 dark:text-slate-300">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span>Min-Cash-Flow Engine Active</span>
        <span className="text-slate-300 dark:text-slate-600">|</span>
        <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
        <span>Ledger Synced</span>
      </div>

      {/* Right Controls: Currency Toggle, Theme Toggle & Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Dynamic Currency Switcher Dropdown */}
        <div className="flex items-center" title="Toggle active currency">
          <CurrencyToggle />
        </div>

        {/* Prominent Light & Dark Theme Toggle Button on Top */}
        <div className="flex items-center" title="Toggle Light / Dark Mode">
          <ThemeToggle variant="pill" />
        </div>

        {user && (
          <div className="flex items-center gap-2 sm:gap-3 pl-1 sm:pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2.5 bg-slate-100/90 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-slate-200/70 dark:border-slate-700/70 px-3 py-1.5 rounded-2xl transition-all duration-200 shadow-xs">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-indigo-500/40"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="text-left hidden md:block">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
                  {user.name}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight font-mono">
                  {currencySymbol} {currency}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              aria-label="Sign Out"
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-all duration-200 border border-transparent hover:border-rose-200/60 dark:hover:border-rose-900/40 hover:scale-105 active:scale-95"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
