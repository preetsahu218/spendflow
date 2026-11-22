import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  accentColor?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'purple' | 'cyan';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  subtitle,
  trend,
  accentColor = 'indigo',
}) => {
  const iconBackgrounds = {
    indigo: 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/50 shadow-indigo-500/10',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50 shadow-emerald-500/10',
    amber: 'bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800/50 shadow-amber-500/10',
    rose: 'bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800/50 shadow-rose-500/10',
    purple: 'bg-purple-50 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800/50 shadow-purple-500/10',
    cyan: 'bg-cyan-50 dark:bg-cyan-950/70 text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-800/50 shadow-cyan-500/10',
  };

  return (
    <div className="card-glow bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </p>
        <div
          className={`p-2.5 rounded-2xl transition-transform duration-300 group-hover:scale-110 shadow-xs ${iconBackgrounds[accentColor]}`}
        >
          {icon}
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <h4 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {value}
        </h4>
        {trend && (
          <span
            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs ${
              trend.isPositive
                ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60'
                : 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
          {subtitle}
        </p>
      )}
    </div>
  );
};
