import React, { useState, useRef, useEffect } from 'react';
import { useCurrency, SUPPORTED_CURRENCIES } from '../../context/CurrencyContext';
import { ChevronDown, Check, Coins } from 'lucide-react';

interface CurrencyToggleProps {
  className?: string;
  variant?: 'pill' | 'compact';
}

export const CurrencyToggle: React.FC<CurrencyToggleProps> = ({
  className = '',
  variant = 'pill',
}) => {
  const { currency, setCurrency, currencySymbol } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = async (code: string) => {
    await setCurrency(code);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        title="Toggle active currency"
        className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-200/70 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-300/60 dark:border-slate-700/70 text-slate-800 dark:text-slate-100 hover:border-indigo-400 dark:hover:border-indigo-500/50 shadow-inner transition-all duration-200 select-none text-xs font-bold hover:scale-[1.02] active:scale-[0.98]"
      >
        <span className="flex items-center justify-center w-5 h-5 rounded-lg bg-indigo-600 text-white font-mono text-[11px] shadow-xs">
          {currencySymbol}
        </span>
        <span className="font-mono tracking-tight">{currency}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-indigo-500' : ''
          }`}
        />
      </button>

      {/* Glassmorphic Currency Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-2xl shadow-indigo-500/10 p-1.5 z-50 animate-slide-up transition-all duration-200">
          <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800/80 mb-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            <span>Select Currency</span>
            <Coins className="w-3 h-3 text-indigo-500" />
          </div>

          <div className="space-y-0.5 max-h-56 overflow-y-auto pr-1">
            {Object.values(SUPPORTED_CURRENCIES).map((curr) => {
              const isSelected = curr.code === currency;
              return (
                <button
                  key={curr.code}
                  type="button"
                  onClick={() => handleSelect(curr.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 text-left ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200/70 dark:border-indigo-800/60 shadow-xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono font-bold text-xs flex items-center justify-center border border-slate-200/60 dark:border-slate-700/60 shadow-xs">
                      {curr.symbol}
                    </span>
                    <div>
                      <p className="leading-tight font-bold">{curr.code}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">
                        {curr.name}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
