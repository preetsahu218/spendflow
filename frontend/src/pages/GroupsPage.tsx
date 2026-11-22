import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Group } from '../types';
import { AddGroupModal } from '../components/groups/AddGroupModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useNotification } from '../context/NotificationContext';
import { Users, Plus, ArrowRight, Copy, Check, Sparkles, ShieldCheck } from 'lucide-react';

export const GroupsPage: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { showSuccess } = useNotification();
  const navigate = useNavigate();

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await api.get('/groups');
      setGroups(res.data.data);
    } catch (error) {
      console.error('Failed to load groups:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const copyInviteCode = (e: React.MouseEvent, code: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showSuccess(`Invite code ${code} copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 px-2.5 py-0.5 rounded-full border border-indigo-200/80 dark:border-indigo-800/60">
              <Users className="w-3 h-3" /> Shared Ledger Engine
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Shared Expense Groups
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Collaborative expense splitting powered by Greedy Minimum Cash Flow debt simplification
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 rounded-2xl transition-all shadow-md shadow-indigo-600/25 hover:scale-[1.02] active:scale-[0.98] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create or Join Group
        </button>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <LoadingSpinner size="md" />
        </div>
      ) : groups.length === 0 ? (
        <div className="card-glow bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-12 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            No shared groups yet
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto mb-5">
            Create a group for your apartment, road trip, or team lunch, or join one using an invite code.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 rounded-2xl transition-all shadow-md shadow-indigo-600/25"
          >
            <Plus className="w-4 h-4" />
            Create or Join Group
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <Link
              key={group.id}
              to={`/groups/${group.id}`}
              className="card-glow bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-900/40 dark:to-purple-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/60 flex items-center justify-center font-bold text-sm shadow-xs group-hover:scale-105 transition-transform">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {group.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500">
                        {group.members.length} member{group.members.length !== 1 ? 's' : ''} &bull; {group._count?.expenses || 0} expenses
                      </p>
                    </div>
                  </div>

                  {/* Invite Code Badge with Copy */}
                  <button
                    onClick={(e) => copyInviteCode(e, group.inviteCode)}
                    title="Copy group invite code"
                    className="flex items-center gap-1.5 text-[10px] font-mono font-bold bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80 transition-colors shadow-2xs"
                  >
                    <span>{group.inviteCode}</span>
                    {copiedCode === group.inviteCode ? (
                      <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                    )}
                  </button>
                </div>

                {group.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-3.5 line-clamp-2 leading-relaxed">
                    {group.description}
                  </p>
                )}

                {/* Member Avatars */}
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex -space-x-2 overflow-hidden">
                    {group.members.slice(0, 4).map((m) => (
                      <div
                        key={m.userId}
                        className="inline-block h-7 w-7 rounded-full ring-2 ring-white dark:ring-slate-900 bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-[10px] flex items-center justify-center uppercase shadow-xs"
                        title={m.user.name}
                      >
                        {m.user.name.charAt(0)}
                      </div>
                    ))}
                  </div>
                  {group.members.length > 4 && (
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                      +{group.members.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
                <span>View Ledger &amp; Simplification</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Add / Join Modal */}
      <AddGroupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(newId) => {
          fetchGroups();
          if (newId) navigate(`/groups/${newId}`);
        }}
      />
    </div>
  );
};
