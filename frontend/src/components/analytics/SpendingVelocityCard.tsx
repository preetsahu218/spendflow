import React from 'react';
import { Flame, Calendar, Activity } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

interface SpendingVelocityCardProps {
  velocity: {
    dailyRate: number;
    daysElapsed: number;
    daysInMonth: number;
    projectedMonthEnd: number;
  };
}

export const SpendingVelocityCard: React.FC<SpendingVelocityCardProps> = ({ velocity }) => {
  const { formatCurrency } = useCurrency();
  const daysRemaining = Math.max(0, velocity.daysInMonth - velocity.daysElapsed);

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all duration-300 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/70 text-amber-500 border border-amber-200/50 dark:border-amber-800/50">
              <Flame className="w-4 h-4" />
            </span>
            Spending Velocity & Burn Rate
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pacing forecast based on daily consumption</p>
        </div>
        <span className="text-xs font-bold bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800/60 shadow-xs">
          {formatCurrency(velocity.dailyRate)} / day
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-1">
        <div className="bg-slate-50/90 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/60">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] mb-1">
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            <span>Month Progress</span>
          </div>
          <p className="text-base font-extrabold text-slate-900 dark:text-white">
            Day {velocity.daysElapsed} of {velocity.daysInMonth}
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{daysRemaining} days remaining</p>
        </div>

        <div className="bg-slate-50/90 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/60">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] mb-1">
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            <span>Projected Month End</span>
          </div>
          <p className="text-base font-extrabold text-slate-900 dark:text-white">
            {formatCurrency(velocity.projectedMonthEnd)}
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Estimated total outlays</p>
        </div>
      </div>
    </div>
  );
};
