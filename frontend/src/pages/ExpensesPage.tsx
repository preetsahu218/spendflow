import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { Expense, Category } from '../types';
import { ExpenseList } from '../components/expenses/ExpenseList';
import { ExpenseFilter } from '../components/expenses/ExpenseFilter';
import { ExpenseFormModal } from '../components/expenses/ExpenseFormModal';
import { ExportCsvButton } from '../components/expenses/ExportCsvButton';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useNotification } from '../context/NotificationContext';
import { useCurrency } from '../context/CurrencyContext';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Receipt,
  TrendingUp,
  TrendingDown,
  Scale,
  Sparkles,
} from 'lucide-react';

export const ExpensesPage: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const { currency, formatCurrency } = useCurrency();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [type, setType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: 15,
        sortBy: 'date',
        sortOrder: 'desc',
      };
      if (search) params.search = search;
      if (categoryId) params.categoryId = categoryId;
      if (type) params.type = type;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await api.get('/expenses', { params });
      setExpenses(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
      setTotalCount(res.data.pagination.totalCount);
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
      showError('Failed to load transaction data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [page, search, categoryId, type, startDate, endDate]);

  const handleResetFilters = () => {
    setSearch('');
    setCategoryId('');
    setType('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const handleEdit = (expense: Expense) => {
    setExpenseToEdit(expense);
    setIsModalOpen(true);
  };

  const handleDelete = async (expenseId: string) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await api.delete(`/expenses/${expenseId}`);
      showSuccess('Transaction deleted');
      fetchExpenses();
    } catch (error) {
      showError('Failed to delete transaction');
    }
  };

  const openNewModal = () => {
    setExpenseToEdit(null);
    setIsModalOpen(true);
  };

  // Compute live view metrics
  const { viewInflow, viewOutflow, viewNet } = useMemo(() => {
    let inflow = 0;
    let outflow = 0;
    for (const item of expenses) {
      if (item.type === 'INCOME') inflow += item.amount;
      else outflow += item.amount;
    }
    return {
      viewInflow: inflow,
      viewOutflow: outflow,
      viewNet: inflow - outflow,
    };
  }, [expenses]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 px-2.5 py-0.5 rounded-full border border-indigo-200/80 dark:border-indigo-800/60">
              <Receipt className="w-3 h-3" /> Financial Ledger
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Expenses &amp; Incomes
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Detailed ledger of all financial entries ({totalCount} total entries recorded)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <ExportCsvButton startDate={startDate} endDate={endDate} />
          <button
            onClick={openNewModal}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 rounded-2xl transition-all shadow-md shadow-indigo-600/25 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Record Transaction
          </button>
        </div>
      </div>

      {/* Quick In-View Ledger Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="card-glow bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              In-View Inflow
            </p>
            <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
              +{formatCurrency(viewInflow)}
            </p>
          </div>
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="card-glow bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              In-View Outflow
            </p>
            <p className="text-lg font-extrabold text-rose-600 dark:text-rose-400">
              -{formatCurrency(viewOutflow)}
            </p>
          </div>
          <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>

        <div className="card-glow bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              In-View Net Delta
            </p>
            <p
              className={`text-lg font-extrabold ${
                viewNet >= 0
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              {(viewNet >= 0 ? '+' : '') + formatCurrency(viewNet)}
            </p>
          </div>
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400">
            <Scale className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <ExpenseFilter
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        categoryId={categoryId}
        onCategoryChange={(v) => {
          setCategoryId(v);
          setPage(1);
        }}
        type={type}
        onTypeChange={(v) => {
          setType(v);
          setPage(1);
        }}
        startDate={startDate}
        onStartDateChange={(v) => {
          setStartDate(v);
          setPage(1);
        }}
        endDate={endDate}
        onEndDateChange={(v) => {
          setEndDate(v);
          setPage(1);
        }}
        categories={categories}
        onReset={handleResetFilters}
      />

      {/* Table Content */}
      {loading ? (
        <div className="py-24 text-center">
          <LoadingSpinner size="md" />
        </div>
      ) : (
        <div className="space-y-4">
          <ExpenseList
            expenses={expenses}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl px-5 py-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs text-xs transition-colors">
              <span className="text-slate-500 dark:text-slate-400">
                Page <span className="font-bold text-slate-900 dark:text-white">{page}</span> of{' '}
                <span className="font-bold text-slate-900 dark:text-white">{totalPages}</span>
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Expense Modal */}
      <ExpenseFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchExpenses}
        categories={categories}
        expenseToEdit={expenseToEdit}
      />
    </div>
  );
};
