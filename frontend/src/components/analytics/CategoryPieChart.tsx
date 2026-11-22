import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { CategoryBreakdownItem } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';
import { PieChart as PieIcon } from 'lucide-react';

interface CategoryPieChartProps {
  categories: CategoryBreakdownItem[];
  totalExpense: number;
}

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({
  categories,
  totalExpense,
}) => {
  const { theme } = useTheme();
  const { formatCurrency } = useCurrency();
  const isDark = theme === 'dark';

  if (categories.length === 0) {
    return (
      <div className="card-glow bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm text-center py-12">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          No expense data recorded for this period
        </p>
      </div>
    );
  }

  return (
    <div className="card-glow bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4 transition-colors duration-300">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400">
          <PieIcon className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Category Spending Breakdown
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Proportional distribution and weighting across budget categories
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center pt-2">
        {/* Donut Chart */}
        <div className="h-64 w-full relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categories}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={88}
                paddingAngle={4}
                dataKey="total"
              >
                {categories.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color || '#6366f1'}
                    stroke={isDark ? '#0f172a' : '#ffffff'}
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => [formatCurrency(parseFloat(value)), undefined]}
                contentStyle={{
                  backgroundColor: isDark ? '#0f172a' : '#ffffff',
                  borderColor: isDark ? '#1e293b' : '#e2e8f0',
                  color: isDark ? '#f8fafc' : '#0f172a',
                  borderRadius: '16px',
                  boxShadow: isDark
                    ? '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
                    : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute text-center pointer-events-none">
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
              Total Outlay
            </span>
            <p className="text-base font-extrabold text-slate-900 dark:text-white">
              {formatCurrency(totalExpense, { decimals: 0 })}
            </p>
          </div>
        </div>

        {/* Legend List with Progress bars */}
        <div className="space-y-2.5 max-h-64 overflow-y-auto pr-2">
          {categories.map((cat) => (
            <div
              key={cat.categoryId}
              className="p-2.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                    {cat.name}
                  </span>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {formatCurrency(cat.total)}
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 text-[10px] ml-1.5 font-semibold">
                    ({cat.percentage}%)
                  </span>
                </div>
              </div>
              <div className="w-full bg-slate-200/80 dark:bg-slate-700/80 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${cat.percentage}%`,
                    backgroundColor: cat.color || '#6366f1',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
