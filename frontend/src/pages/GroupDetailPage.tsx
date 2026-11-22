import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Group, MemberBalance, DebtTransaction } from '../types';
import { DebtSimplificationGraph } from '../components/groups/DebtSimplificationGraph';
import { SharedExpenseModal } from '../components/groups/SharedExpenseModal';
import { SettleDebtModal } from '../components/groups/SettleDebtModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Badge } from '../components/common/Badge';
import { useNotification } from '../context/NotificationContext';
import { useCurrency } from '../context/CurrencyContext';
import {
  ArrowLeft,
  Plus,
  Copy,
  Check,
  Receipt,
  Scale,
  History,
  Activity,
  Calendar,
} from 'lucide-react';

export const GroupDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const { formatCurrency } = useCurrency();

  const [group, setGroup] = useState<Group | null>(null);
  const [memberBalances, setMemberBalances] = useState<MemberBalance[]>([]);
  const [simplifiedTransactions, setSimplifiedTransactions] = useState<DebtTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Tabs: 'BALANCES' | 'EXPENSES' | 'SETTLEMENTS' | 'ACTIVITY'
  const [activeTab, setActiveTab] = useState<'BALANCES' | 'EXPENSES' | 'SETTLEMENTS' | 'ACTIVITY'>('BALANCES');

  // Modals
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [selectedTransactionForSettle, setSelectedTransactionForSettle] = useState<DebtTransaction | null>(null);

  const [copiedCode, setCopiedCode] = useState(false);

  const fetchGroupDetails = async () => {
    if (!id) return;
    try {
      const [grpRes, balRes] = await Promise.all([
        api.get(`/groups/${id}`),
        api.get(`/groups/${id}/balances`),
      ]);

      setGroup(grpRes.data.data);
      setMemberBalances(balRes.data.data.memberBalances);
      setSimplifiedTransactions(balRes.data.data.simplifiedTransactions);
    } catch (error: any) {
      console.error('Failed to load group details:', error);
      showError(error.response?.data?.message || 'Failed to load group details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupDetails();
  }, [id]);

  const handleCopyCode = () => {
    if (!group) return;
    navigator.clipboard.writeText(group.inviteCode);
    setCopiedCode(true);
    showSuccess('Invite code copied to clipboard!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleOpenSettle = (tx: DebtTransaction) => {
    setSelectedTransactionForSettle(tx);
    setIsSettleModalOpen(true);
  };

  if (loading || !group) {
    return (
      <div className="py-24 text-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button & Breadcrumb */}
      <div>
        <Link
          to="/groups"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Groups
        </Link>
      </div>

      {/* Group Header Hero with Glassmorphism */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">{group.name}</h2>
            <button
              onClick={handleCopyCode}
              title="Click to copy invite code"
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg border border-indigo-200 dark:border-indigo-800/60 transition-colors"
            >
              <span>Code: {group.inviteCode}</span>
              {copiedCode ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
          {group.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">{group.description}</p>
          )}

          {/* Members Pill List */}
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">Members ({group.members.length}):</span>
            {group.members.map((m) => (
              <span
                key={m.userId}
                className="inline-flex items-center gap-1 text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded-full font-medium border border-slate-200/50 dark:border-slate-700/50"
              >
                {m.user.name} {m.userId === user?.id ? '(You)' : ''}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-xl transition-all shadow-md shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" />
            Split Expense
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-bold gap-6 transition-colors">
        <button
          onClick={() => setActiveTab('BALANCES')}
          className={`pb-3 flex items-center gap-2 transition-all relative ${
            activeTab === 'BALANCES'
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Debt Simplification & Balances</span>
          {activeTab === 'BALANCES' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('EXPENSES')}
          className={`pb-3 flex items-center gap-2 transition-all relative ${
            activeTab === 'EXPENSES'
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Shared Expenses ({group.expenses?.length || 0})</span>
          {activeTab === 'EXPENSES' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('SETTLEMENTS')}
          className={`pb-3 flex items-center gap-2 transition-all relative ${
            activeTab === 'SETTLEMENTS'
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Payment History ({group.settlements?.length || 0})</span>
          {activeTab === 'SETTLEMENTS' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('ACTIVITY')}
          className={`pb-3 flex items-center gap-2 transition-all relative ${
            activeTab === 'ACTIVITY'
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Audit Log</span>
          {activeTab === 'ACTIVITY' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
          )}
        </button>
      </div>

      {/* Tab 1: Debt Simplification & Balances */}
      {activeTab === 'BALANCES' && (
        <DebtSimplificationGraph
          memberBalances={memberBalances}
          simplifiedTransactions={simplifiedTransactions}
          onSettleClick={handleOpenSettle}
          currency={group.currency}
        />
      )}

      {/* Tab 2: Shared Expenses List */}
      {activeTab === 'EXPENSES' && (
        <div className="space-y-3">
          {(!group.expenses || group.expenses.length === 0) ? (
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-12 text-center shadow-sm">
              <p className="text-xs text-slate-500 dark:text-slate-400">No shared expenses recorded yet in this group.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {group.expenses.map((exp) => (
                <div
                  key={exp.id}
                  className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-4.5 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{exp.description}</span>
                      <Badge variant="purple" size="sm">
                        {exp.splitType} Split
                      </Badge>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                        {exp.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>
                        Paid by <strong className="text-slate-700 dark:text-slate-200">{exp.paidBy.name}</strong>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-[11px]">
                        <Calendar className="w-3 h-3 text-indigo-500" />
                        {new Date(exp.date).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Member split breakdown list */}
                    <div className="pt-2 flex flex-wrap gap-2">
                      {exp.splits.map((s) => (
                        <span
                          key={s.id}
                          className="text-[11px] bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/60 px-2 py-0.5 rounded-lg text-slate-600 dark:text-slate-300"
                        >
                          {s.user.name}: <strong className="text-slate-800 dark:text-white">{formatCurrency(s.amountOwed)}</strong>
                          {s.percentage && ` (${s.percentage}%)`}
                          {s.shares && ` (${s.shares} sh)`}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-right sm:self-center shrink-0">
                    <p className="text-base font-black text-slate-900 dark:text-white">{formatCurrency(exp.amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Payment History */}
      {activeTab === 'SETTLEMENTS' && (
        <div className="space-y-3">
          {(!group.settlements || group.settlements.length === 0) ? (
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-12 text-center shadow-sm">
              <p className="text-xs text-slate-500 dark:text-slate-400">No payment settlements recorded yet.</p>
            </div>
          ) : (
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
              {group.settlements.map((s) => (
                <div key={s.id} className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      {s.payer.name} paid {s.payee.name}
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                      {new Date(s.date).toLocaleDateString()} {s.notes && `• ${s.notes}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(s.amount)}
                    </span>
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold uppercase">Settled</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Audit Activity Log */}
      {activeTab === 'ACTIVITY' && (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
          {(!group.activities || group.activities.length === 0) ? (
            <div className="p-12 text-center text-xs text-slate-500 dark:text-slate-400">No audit logs available.</div>
          ) : (
            group.activities.map((act) => (
              <div key={act.id} className="p-4 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{act.details}</span>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                    Triggered by {act.user.name}
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  {new Date(act.createdAt).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Shared Expense Modal */}
      <SharedExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSuccess={fetchGroupDetails}
        groupId={group.id}
        members={group.members}
        currentUserId={user?.id || ''}
        currency={group.currency}
      />

      {/* Settle Debt Modal */}
      <SettleDebtModal
        isOpen={isSettleModalOpen}
        onClose={() => {
          setIsSettleModalOpen(false);
          setSelectedTransactionForSettle(null);
        }}
        onSuccess={fetchGroupDetails}
        groupId={group.id}
        transaction={selectedTransactionForSettle}
      />
    </div>
  );
};
