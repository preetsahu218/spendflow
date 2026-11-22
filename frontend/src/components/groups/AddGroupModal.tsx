import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import api from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { useCurrency } from '../../context/CurrencyContext';
import { Loader2, PlusCircle, KeyRound } from 'lucide-react';

interface AddGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newGroupId?: string) => void;
}

export const AddGroupModal: React.FC<AddGroupModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showSuccess, showError } = useNotification();
  const { currency: currentAppCurrency } = useCurrency();
  const [mode, setMode] = useState<'CREATE' | 'JOIN'>('CREATE');
  const [loading, setLoading] = useState(false);

  // Create state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState(currentAppCurrency || 'INR');

  useEffect(() => {
    if (isOpen) {
      setCurrency(currentAppCurrency || 'INR');
    }
  }, [isOpen, currentAppCurrency]);

  // Join state
  const [inviteCode, setInviteCode] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showError('Group name is required');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/groups', {
        name: name.trim(),
        description: description.trim() ? description : undefined,
        currency,
      });

      showSuccess(`Group "${name}" created with invite code ${res.data.data.inviteCode}!`);
      setName('');
      setDescription('');
      onSuccess(res.data.data.id);
      onClose();
    } catch (error: any) {
      console.error('Failed to create group:', error);
      showError(error.response?.data?.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      showError('Please enter an invite code');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/groups/join', {
        inviteCode: inviteCode.trim().toUpperCase(),
      });

      showSuccess(`Joined group "${res.data.data.name}" successfully!`);
      setInviteCode('');
      onSuccess(res.data.data.id);
      onClose();
    } catch (error: any) {
      console.error('Failed to join group:', error);
      showError(error.response?.data?.message || 'Invalid or expired invite code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'CREATE' ? 'Create New Group' : 'Join Existing Group'}
      description="Track shared flatmate expenses, road trips, or project budgets"
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Toggle between Create & Join */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setMode('CREATE')}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'CREATE'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Create Group
          </button>
          <button
            type="button"
            onClick={() => setMode('JOIN')}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'JOIN'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            Join with Code
          </button>
        </div>

        {mode === 'CREATE' ? (
          <form onSubmit={handleCreate} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Group Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Apartment 402, Hawaii Vacation"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description (Optional)</label>
              <textarea
                rows={2}
                placeholder="What is this group for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
                <option value="CAD">CAD ($)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm disabled:opacity-50"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Create Group
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleJoin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Group Invite Code</label>
              <input
                type="text"
                required
                placeholder="e.g. APT402"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase tracking-widest font-mono font-bold"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Enter the 6-character alphanumeric code provided by your group admin.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm disabled:opacity-50"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Join Group
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
