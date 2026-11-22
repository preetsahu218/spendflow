import React from 'react';
import { MemberBalance, DebtTransaction } from '../../types';
import { ArrowRight, CheckCheck, Sparkles, TrendingUp, TrendingDown, Users } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

interface DebtSimplificationGraphProps {
  memberBalances: MemberBalance[];
  simplifiedTransactions: DebtTransaction[];
  onSettleClick: (transaction: DebtTransaction) => void;
  currency?: string;
}

export const DebtSimplificationGraph: React.FC<DebtSimplificationGraphProps> = ({
  memberBalances,
  simplifiedTransactions,
  onSettleClick,
}) => {
  const { formatCurrency } = useCurrency();
  return (
    <div className="space-y-6">
      {/* Algorithmic Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-950 rounded-2xl p-6 text-white shadow-xl border border-indigo-800/30 relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-start justify-between relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse-subtle" />
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                CS Algorithmic Debt Optimization
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-white">
              Minimum Cash Flow Simplification Engine
            </h3>
            <p className="text-xs text-indigo-200/90 mt-1.5 max-w-xl leading-relaxed">
              Eliminates cyclic pairwise debts by partitioning net balances and matching maximum debtors
              with maximum creditors greedily. Minimizes overall transactions across the group to at most{' '}
              <span className="font-mono font-bold text-amber-300">V - 1</span> steps.
            </p>
          </div>
          <div className="hidden sm:block text-right">
            <span className="text-[11px] font-mono bg-indigo-950/90 px-3 py-1.5 rounded-xl border border-indigo-700/60 text-indigo-300 shadow-sm">
              O(V log V) Time
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Member Net Balances Matrix */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Participant Net Ledgers
              </h4>
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">Total Net Balances</span>
          </div>

          <div className="space-y-3">
            {memberBalances.map((m) => {
              const isCreditor = m.netBalance > 0.01;
              const isDebtor = m.netBalance < -0.01;

              return (
                <div
                  key={m.userId}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60 hover:border-slate-200 dark:hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ring-1 ring-black/5 dark:ring-white/10 ${
                        isCreditor
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : isDebtor
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {m.userName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{m.userName}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">
                        Paid: {formatCurrency(m.totalPaid)} | Share: {formatCurrency(m.totalOwed)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`flex items-center gap-1 font-bold text-xs justify-end ${
                        isCreditor
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : isDebtor
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {isCreditor && <TrendingUp className="w-3.5 h-3.5" />}
                      {isDebtor && <TrendingDown className="w-3.5 h-3.5" />}
                      <span>
                        {(isCreditor ? '+' : '') + formatCurrency(m.netBalance)}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                      {isCreditor ? 'Gets back' : isDebtor ? 'Owes group' : 'Settled up'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Optimized Direct Settlements (Algorithm Results) */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <CheckCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Optimal Debt Resolution Graph
              </h4>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
              {simplifiedTransactions.length} Minimal Step{simplifiedTransactions.length !== 1 ? 's' : ''}
            </span>
          </div>

          {simplifiedTransactions.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2 text-lg">
                <CheckCheck className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">All debts are fully settled!</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                No outstanding payments needed among participants.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {simplifiedTransactions.map((tx, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/40 dark:bg-indigo-950/30 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/50 transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">{tx.fromUserName}</span>
                    <div className="flex items-center text-slate-400 dark:text-slate-500">
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-500 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white">{tx.toUserName}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-sm text-indigo-900 dark:text-indigo-200">
                      {formatCurrency(tx.amount)}
                    </span>
                    <button
                      onClick={() => onSettleClick(tx)}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg transition-all shadow-xs hover:scale-105 active:scale-95"
                    >
                      Settle Up
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
