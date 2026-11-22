import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Users,
  LineChart,
  Sparkles,
  Zap,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { name: 'Expenses & Income', to: '/expenses', icon: Receipt },
    { name: 'Budgets & Limits', to: '/budgets', icon: PieChart },
    { name: 'Shared Groups', to: '/groups', icon: Users },
    { name: 'Visual Analytics', to: '/analytics', icon: LineChart },
  ];

  return (
    <aside className="w-64 bg-white/75 dark:bg-[#090d16]/75 backdrop-blur-2xl border-r border-slate-200/80 dark:border-slate-800/80 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0 transition-colors duration-300">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-3 py-1 mb-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Platform Menu
          </p>
          <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500" />
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-semibold text-sm transition-all duration-200 select-none ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/25 translate-x-1'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:translate-x-1'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                      isActive ? 'scale-110' : 'group-hover:scale-110 text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                    }`}
                  />
                  <span>{item.name}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Algorithmic Engine Feature Box with Glass Glow */}
      <div className="card-glow bg-gradient-to-br from-indigo-50/90 via-purple-50/40 to-slate-50/80 dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-slate-900/50 border border-indigo-200/80 dark:border-indigo-800/40 rounded-2xl p-4 text-xs shadow-sm mt-4">
        <div className="flex items-center gap-2 font-bold text-indigo-950 dark:text-indigo-200 mb-1.5">
          <div className="p-1 rounded-lg bg-indigo-600 text-white shadow-xs">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <span className="tracking-tight">Min-Cash-Flow Graph</span>
        </div>
        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
          Greedy net-balance partitioning algorithm optimizes shared debts to at most <span className="font-mono text-indigo-600 dark:text-indigo-300 font-bold">V - 1</span> transactions.
        </p>
        <div className="mt-2.5 pt-2 border-t border-indigo-100 dark:border-indigo-900/60 flex items-center justify-between text-[10px] text-indigo-700 dark:text-indigo-300 font-semibold">
          <span>Algorithmic Core</span>
          <span className="font-mono">O(V log V)</span>
        </div>
      </div>
    </aside>
  );
};
