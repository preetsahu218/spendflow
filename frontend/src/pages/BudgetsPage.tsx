import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { Budget, Category } from '../types';
import { BudgetCard } from '../components/budgets/BudgetCard';
import { BudgetFormModal } from '../components/budgets/BudgetFormModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useNotification } from '../context/NotificationContext';
import { useCurrency } from '../context/CurrencyContext';
import {
  Plus,
  Calendar,
  PieChart,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Sparkles,
} from 'lucide-react';

export const BudgetsPage: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const { formatCurrency } = useCurrency();
  const now = new Date();
  const [month, setMonth] = useState(now.getUTCMonth() + 1);
  const [year, setYear] = useState(now.getUTCFullYear());
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const [budRes, catRes] = await Promise.all([
        api.get('/budgets', { params: { month, year } }),
        api.get('/categories'),
      ]);
      setBudgets(budRes.data.data);
      setCategories(catRes.data.data);
    } catch (error) {
      console.error('Failed to load budgets:', error);
      showError('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [month, year]);

  const handleDeleteBudget = async (budgetId: string) => {
    if (!window.confirm('Delete this category budget?')) return;
    try {
      await api.delete(`/budgets/${budgetId}`);
      showSuccess('Budget limit removed');
      fetchBudgets();
    } catch (error) {
      showError('Failed to delete budget');
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // Compute aggregate budget stats
  const { totalLimit, totalSpent, overallPercentage } = useMemo(() => {
    const limit = budgets.reduce((acc, b) => acc + b.amountLimit, 0);
    const spent = budgets.reduce((acc, b) => acc + b.spent, 0);
    const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0;
    return { totalLimit: limit, totalSpent: spent, overallPercentage: pct };
  }, [budgets]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 px-2.5 py-0.5 rounded-full border border-indigo-200/80 dark:border-indigo-800/60">
              <PieChart className="w-3 h-3" /> Spending Ceilings
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Category Budgets
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Set spending ceilings and monitor real-time threshold warnings for {monthNames[month - 1]} {year}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Month Selector */}
          <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl px-3 py-2 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs text-xs font-semibold text-slate-700 dark:text-slate-200">
            <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value, 10))}
              className="bg-transparent focus:outline-none cursor-pointer font-bold text-slate-900 dark:text-white"
            >
              {monthNames.map((name, idx) => (
                <option key={idx + 1} value={idx + 1} className="dark:bg-slate-900">
                  {name}
                </option>
              ))}
            </select>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value, 10))}
              className="bg-transparent focus:outline-none cursor-pointer font-bold text-slate-900 dark:text-white"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y} className="dark:bg-slate-900">
                  {y}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 rounded-2xl transition-all shadow-md shadow-indigo-600/25 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Set Budget Limit
          </button>
        </div>
      </div>

      {/* Aggregate Overview Card */}
      {budgets.length > 0 && (
        <div className="card-glow bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Monthly Aggregate Ceiling
              </p>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                {formatCurrency(totalSpent)}{' '}
                <span className="text-sm font-semibold text-slate-400 dark:text-slate-500">
                  of {formatCurrency(totalLimit)} allocated limit
                </span>
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  overallPercentage > 100
                    ? 'bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60'
                    : overallPercentage > 85
                    ? 'bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60'
                    : 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60'
                }`}
              >
                {overallPercentage}% Total Consumed
              </span>
            </div>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-full h-3 overflow-hidden shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                overallPercentage > 100
                  ? 'bg-rose-500 progress-animated-stripe'
                  : overallPercentage > 85
                  ? 'bg-amber-500 progress-animated-stripe'
                  : 'bg-gradient-to-r from-indigo-500 via-indigo-600 to-emerald-500'
              }`}
              style={{ width: `${Math.min(100, overallPercentage)}%` }}
            />
          </div>
        </div>
      )}

      {/* Grid or Empty State */}
      {loading ? (
        <div className="py-24 text-center">
          <LoadingSpinner size="md" />
        </div>
      ) : budgets.length === 0 ? (
        <div className="card-glow bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-12 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <PieChart className="w-7 h-7" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            No budgets configured for {monthNames[month - 1]} {year}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto mb-5">
            Set spending limits for key categories like Groceries, Dining, and Housing to receive live velocity alerts.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 rounded-2xl transition-all shadow-md shadow-indigo-600/25"
          >
            <Plus className="w-4 h-4" />
            Create Your First Budget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {budgets.map((b) => (
            <BudgetCard key={b.id} budget={b} onDelete={handleDeleteBudget} />
          ))}
        </div>
      )}

      {/* Modal */}
      <BudgetFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchBudgets}
        categories={categories}
        currentMonth={month}
        currentYear={year}
      />
    </div>
  );
};
