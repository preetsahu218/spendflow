import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import api from '../services/api';
import { DashboardSummary, Budget, Category } from '../types';
import { StatCard } from '../components/common/StatCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ExpenseFormModal } from '../components/expenses/ExpenseFormModal';
import { SpendingVelocityCard } from '../components/analytics/SpendingVelocityCard';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Users,
  Plus,
  ArrowRight,
  Receipt,
  PieChart,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Calendar,
  CreditCard,
  ArrowUpRight,
  Zap,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { currencySymbol, formatCurrency } = useCurrency();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [initialType, setInitialType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [transactionFilter, setTransactionFilter] = useState<'ALL' | 'EXPENSE' | 'INCOME'>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [sumRes, budRes, catRes] = await Promise.all([
        api.get('/analytics/dashboard'),
        api.get('/budgets'),
        api.get('/categories'),
      ]);

      setSummary(sumRes.data.data);
      setBudgets(budRes.data.data);
      setCategories(catRes.data.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardData();
  };

  const openAddTransaction = (type: 'EXPENSE' | 'INCOME') => {
    setInitialType(type);
    setIsExpenseModalOpen(true);
  };

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading || !summary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-xs text-slate-400 animate-pulse font-medium">
          Synthesizing financial metrics &amp; ledger balances...
        </p>
      </div>
    );
  }

  // Filtered recent transactions
  const filteredRecentExpenses = summary.recentExpenses.filter((exp) => {
    if (transactionFilter === 'ALL') return true;
    return exp.type === transactionFilter;
  });

  // Calculate a dynamic health score based on savings rate & budget health
  const healthScore = Math.min(
    100,
    Math.max(40, Math.round(50 + summary.savingsRate * 0.45 + (summary.totalBalance > 0 ? 15 : 0)))
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Welcome Banner & Quick Actions with Glassmorphic Gradient */}
      <div className="card-glow bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm transition-all duration-300">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 px-3 py-1 rounded-full border border-indigo-200/80 dark:border-indigo-800/60 shadow-xs">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                Live Financial Intelligence
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-200/60 dark:border-slate-700/60">
                <Calendar className="w-3 h-3 text-slate-400" />
                {new Date().toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {getGreeting()}, <span className="text-gradient-brand">{user?.name.split(' ')[0]}</span> 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Track multi-account liquid cash flow, monitor real-time monthly budget velocity, and settle shared debts seamlessly.
            </p>
          </div>

          {/* Interactive Quick Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => openAddTransaction('EXPENSE')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 rounded-2xl transition-all shadow-md shadow-indigo-600/25 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              Add Expense
            </button>
            <button
              onClick={() => openAddTransaction('INCOME')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-2xl transition-all border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs hover:scale-[1.02] active:scale-[0.98]"
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Record Income
            </button>
            <Link
              to="/groups"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl transition-all border border-slate-200/60 dark:border-slate-700/60 shadow-xs hover:scale-[1.02] active:scale-[0.98]"
            >
              <Users className="w-3.5 h-3.5 text-indigo-500" />
              Shared Groups
            </Link>
            <button
              onClick={handleRefresh}
              title="Refresh ledger data"
              aria-label="Refresh ledger data"
              className="p-2.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl transition-all border border-slate-200/60 dark:border-slate-700/60 shadow-xs hover:scale-105 active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Financial Health Score & Mini Summary Strip */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-extrabold text-sm shadow-xs">
              {healthScore}
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Financial Health Index
              </p>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                {healthScore >= 80 ? 'Excellent Balance' : 'Stable Trajectory'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm shadow-xs">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Monthly Savings Rate
              </p>
              <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {summary.savingsRate}% of income preserved
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/70 border border-purple-200/60 dark:border-purple-800/60 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-sm shadow-xs">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Shared Group Settlement
              </p>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {summary.sharedBalances.net >= 0 ? 'Net Receivable' : 'Net Payable'} ({formatCurrency(Math.abs(summary.sharedBalances.net))})
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Primary KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Net Cash Balance"
          value={formatCurrency(summary.totalBalance)}
          icon={<Wallet className="w-5 h-5" />}
          subtitle="All-time personal cash-flow"
          accentColor="indigo"
          trend={{
            value: summary.totalBalance >= 0 ? '+Positive Asset' : '-Net Deficit',
            isPositive: summary.totalBalance >= 0,
          }}
        />
        <StatCard
          title="Monthly Income"
          value={formatCurrency(summary.monthlyIncome)}
          icon={<TrendingUp className="w-5 h-5" />}
          subtitle="Current calendar month"
          accentColor="emerald"
          trend={{ value: `${summary.savingsRate}% Saved`, isPositive: true }}
        />
        <StatCard
          title="Monthly Expenses"
          value={formatCurrency(summary.monthlyExpense)}
          icon={<TrendingDown className="w-5 h-5" />}
          subtitle={`Burn rate ~${formatCurrency(summary.spendingVelocity.dailyRate, { decimals: 1 })}/day`}
          accentColor="rose"
        />
        <StatCard
          title="Shared Group Net"
          value={`${summary.sharedBalances.net >= 0 ? '+' : ''}${formatCurrency(summary.sharedBalances.net)}`}
          icon={<Users className="w-5 h-5" />}
          subtitle={`Owed: ${formatCurrency(summary.sharedBalances.owedToMe)} | You owe: ${formatCurrency(summary.sharedBalances.iOwe)}`}
          accentColor="purple"
          trend={{
            value: summary.sharedBalances.net >= 0 ? 'Owed to you' : 'You owe',
            isPositive: summary.sharedBalances.net >= 0,
          }}
        />
      </div>

      {/* Spending Velocity Forecast Card */}
      <SpendingVelocityCard velocity={summary.spendingVelocity} />

      {/* Two Column Grid: Budget Pacing & Interactive Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Active Budgets Preview */}
        <div className="card-glow bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4 transition-colors duration-300">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400">
                <PieChart className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Monthly Budget Pacing
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  Real-time category spending vs limits
                </p>
              </div>
            </div>
            <Link
              to="/budgets"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors hover:translate-x-0.5"
            >
              Manage <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {budgets.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <p className="text-xs text-slate-400 dark:text-slate-500">
                No active budget limits configured for this month.
              </p>
              <Link
                to="/budgets"
                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Set a category budget limit <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4 pt-1">
              {budgets.slice(0, 4).map((b) => {
                const isExceeded = b.status === 'EXCEEDED';
                const isWarning = b.status === 'WARNING';
                return (
                  <div key={b.id} className="space-y-1.5 group">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: b.categoryColor }}
                        />
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {b.categoryName}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-slate-900 dark:text-white">
                          {formatCurrency(b.spent)}
                        </span>
                        <span className="text-slate-400 dark:text-slate-500 text-[11px] ml-1">
                          / {formatCurrency(b.amountLimit)} ({b.percentage}%)
                        </span>
                      </div>
                    </div>

                    {/* Animated Progress Bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-full h-2.5 overflow-hidden shadow-inner">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          isExceeded
                            ? 'bg-rose-500 progress-animated-stripe'
                            : isWarning
                            ? 'bg-amber-500 progress-animated-stripe'
                            : 'bg-gradient-to-r from-indigo-500 to-indigo-600'
                        }`}
                        style={{ width: `${Math.min(100, b.percentage)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Transactions with Interactive Filter Chips */}
        <div className="card-glow bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4 transition-colors duration-300">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800/80 flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400">
                <Receipt className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Recent Ledger Activity
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  Latest inflows &amp; disbursements
                </p>
              </div>
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-1 bg-slate-100/90 dark:bg-slate-800/80 p-1 rounded-xl text-[11px] font-semibold border border-slate-200/60 dark:border-slate-700/60">
              <button
                type="button"
                onClick={() => setTransactionFilter('ALL')}
                className={`px-2 py-0.5 rounded-lg transition-all ${
                  transactionFilter === 'ALL'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setTransactionFilter('EXPENSE')}
                className={`px-2 py-0.5 rounded-lg transition-all ${
                  transactionFilter === 'EXPENSE'
                    ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                Expenses
              </button>
              <button
                type="button"
                onClick={() => setTransactionFilter('INCOME')}
                className={`px-2 py-0.5 rounded-lg transition-all ${
                  transactionFilter === 'INCOME'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                Income
              </button>
            </div>
          </div>

          {filteredRecentExpenses.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <p className="text-xs text-slate-400 dark:text-slate-500">
                No transactions match the selected filter.
              </p>
              <button
                onClick={() => openAddTransaction('EXPENSE')}
                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Record your first transaction <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="space-y-2 pt-1 max-h-72 overflow-y-auto pr-1">
              {filteredRecentExpenses.map((exp) => {
                const isIncome = exp.type === 'INCOME';
                return (
                  <div
                    key={exp.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100/90 dark:border-slate-800/80 hover:border-indigo-200 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800/90 transition-all duration-200 shadow-2xs group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-xs group-hover:scale-105 transition-transform"
                        style={{ backgroundColor: exp.category.color }}
                      >
                        {exp.category.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {exp.description}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">
                          {new Date(exp.date).toLocaleDateString()} &bull; {exp.category.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-xs font-extrabold ${
                          isIncome
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {isIncome ? '+' : '-'}{formatCurrency(exp.amount)}
                      </span>
                      <p className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold">
                        {exp.paymentMethod}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="pt-2 text-center">
            <Link
              to="/expenses"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
            >
              Explore Full Expense Ledger <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Expense Modal */}
      <ExpenseFormModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSuccess={fetchDashboardData}
        categories={categories}
        initialType={initialType}
      />
    </div>
  );
};
