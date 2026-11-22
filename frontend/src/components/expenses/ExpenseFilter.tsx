import React from 'react';
import { Search, Filter, RefreshCw } from 'lucide-react';
import { Category } from '../../types';

interface ExpenseFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  categoryId: string;
  onCategoryChange: (value: string) => void;
  type: string;
  onTypeChange: (value: string) => void;
  startDate: string;
  onStartDateChange: (value: string) => void;
  endDate: string;
  onEndDateChange: (value: string) => void;
  categories: Category[];
  onReset: () => void;
}

export const ExpenseFilter: React.FC<ExpenseFilterProps> = ({
  search,
  onSearchChange,
  categoryId,
  onCategoryChange,
  type,
  onTypeChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  categories,
  onReset,
}) => {
  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4 transition-colors">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
          <Filter className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Filters & Search</span>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          Reset Filters
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search notes or items..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/70 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        {/* Type Filter */}
        <div>
          <select
            value={type}
            onChange={(e) => onTypeChange(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/70 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100"
          >
            <option value="">All Types (Income & Expense)</option>
            <option value="EXPENSE">Expenses Only</option>
            <option value="INCOME">Income Only</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={categoryId}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/70 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Start Date */}
        <div>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            placeholder="Start Date"
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/70 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100"
          />
        </div>

        {/* End Date */}
        <div>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            placeholder="End Date"
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/70 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100"
          />
        </div>
      </div>
    </div>
  );
};
