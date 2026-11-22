import React from 'react';
import { Budget } from '../../types';
import { AlertTriangle, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

interface BudgetCardProps {
  budget: Budget;
  onDelete: (budgetId: string) => void;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({ budget, onDelete }) => {
  const { formatCurrency } = useCurrency();

  const getProgressColor = () => {
    if (budget.status === 'EXCEEDED') return 'bg-rose-500';
    if (budget.status === 'WARNING') return 'bg-amber-500';
    return 'bg-indigo-600 dark:bg-indigo-500';
  };

  const getStatusBadge = () => {
    if (budget.status === 'EXCEEDED') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/70 px-2.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-800/60">
          <AlertCircle className="w-3 h-3" />
          Over Budget ({budget.percentage}%)
        </span>
      );
    }
    if (budget.status === 'WARNING') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/70 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/60">
          <AlertTriangle className="w-3 h-3" />
          Near Limit ({budget.percentage}%)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
        <CheckCircle className="w-3 h-3" />
        On Track ({budget.percentage}%)
      </span>
    );
  };

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-500/40 transition-all duration-300 relative group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-xs"
            style={{ backgroundColor: budget.categoryColor }}
          >
            {budget.categoryName.charAt(0)}
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{budget.categoryName}</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Limit: {formatCurrency(budget.amountLimit)} / month
            </p>
          </div>
        </div>

        <button
          onClick={() => onDelete(budget.id)}
          className="text-slate-300 dark:text-slate-600 hover:text-rose-600 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors opacity-80 group-hover:opacity-100"
          title="Remove Budget"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {formatCurrency(budget.spent)}{' '}
            <span className="text-slate-400 dark:text-slate-500 font-normal">spent</span>
          </span>
          <span className="text-slate-500 dark:text-slate-400">
            {budget.remaining >= 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                {formatCurrency(budget.remaining)} left
              </span>
            ) : (
              <span className="text-rose-600 dark:text-rose-400 font-semibold">
                {formatCurrency(Math.abs(budget.remaining))} over
              </span>
            )}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${getProgressColor()}`}
            style={{ width: `${Math.min(100, budget.percentage)}%` }}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
        {getStatusBadge()}
        <span className="text-[11px] text-slate-400 dark:text-slate-500">
          Alert threshold: {budget.alertThreshold}%
        </span>
      </div>
    </div>
  );
};
