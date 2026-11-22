import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { CashFlowData, CategoryBreakdownItem } from '../types';
import { CashFlowChart } from '../components/analytics/CashFlowChart';
import { CategoryPieChart } from '../components/analytics/CategoryPieChart';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useCurrency } from '../context/CurrencyContext';
import { LineChart, BarChart3, PieChart, Sparkles } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { formatCurrency } = useCurrency();
  const [cashFlowData, setCashFlowData] = useState<CashFlowData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryBreakdownItem[]>([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [cfRes, catRes] = await Promise.all([
          api.get('/analytics/cashflow', { params: { months: 6 } }),
          api.get('/analytics/categories'),
        ]);

        setCashFlowData(cfRes.data.data);
        setCategoryData(catRes.data.data.categories);
        setTotalExpense(catRes.data.data.totalExpense);
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 px-2.5 py-0.5 rounded-full border border-indigo-200/80 dark:border-indigo-800/60">
            <LineChart className="w-3 h-3" /> Data Intelligence
          </span>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Visual Financial Analytics
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Deep data visualization of historical cash flows, spending velocity, and category dispersion
        </p>
      </div>

      {/* Cash Flow Trends */}
      <CashFlowChart data={cashFlowData} />

      {/* Category Pie Chart & Proportions */}
      <CategoryPieChart categories={categoryData} totalExpense={totalExpense} />

      {/* Category Breakdown Table with Full Dark Mode & Glassmorphism */}
      <div className="card-glow bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4 transition-colors duration-300">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Category Expenditure Matrix
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Detailed breakdown of spend volumes and proportional weight
            </p>
          </div>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 px-3 py-1 rounded-full border border-indigo-200/60 dark:border-indigo-800/60">
            {categoryData.length} Categories Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Transaction Count</th>
                <th className="py-3 px-4 text-right">Total Outlay</th>
                <th className="py-3 px-4 text-right">Share of Budget</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
              {categoryData.map((item) => (
                <tr
                  key={item.categoryId}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3 px-4 flex items-center gap-2.5">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-bold text-slate-800 dark:text-slate-100">{item.name}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{item.count} items</td>
                  <td className="py-3 px-4 text-right font-extrabold text-slate-900 dark:text-white">
                    {formatCurrency(item.total)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 px-2.5 py-1 rounded-xl border border-indigo-200/60 dark:border-indigo-800/60 shadow-xs">
                      {item.percentage}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
