import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { CashFlowData } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';
import { TrendingUp, BarChart3 } from 'lucide-react';

interface CashFlowChartProps {
  data: CashFlowData[];
}

export const CashFlowChart: React.FC<CashFlowChartProps> = ({ data }) => {
  const { theme } = useTheme();
  const { currencySymbol, formatCurrency } = useCurrency();
  const isDark = theme === 'dark';

  return (
    <div className="card-glow bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4 transition-colors duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Cash Flow Velocity &amp; Monthly Trends
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Monthly comparison of gross income inflows vs operational expenditures
            </p>
          </div>
        </div>
      </div>

      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.06)'}
            />
            <XAxis
              dataKey="monthName"
              tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(val) => `${currencySymbol}${val}`}
            />
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
            <Legend
              wrapperStyle={{
                fontSize: '12px',
                paddingTop: '12px',
                color: isDark ? '#cbd5e1' : '#475569',
              }}
            />
            <Bar dataKey="income" name="Gross Income" fill="#10b981" radius={[8, 8, 0, 0]} />
            <Bar dataKey="expense" name="Expenditures" fill="#f43f5e" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
