import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { DebtTransaction } from '../../types';
import api from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { useCurrency } from '../../context/CurrencyContext';
import { Loader2 } from 'lucide-react';

interface SettleDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  groupId: string;
  transaction?: DebtTransaction | null;
}

export const SettleDebtModal: React.FC<SettleDebtModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  groupId,
  transaction,
}) => {
  const { showSuccess, showError } = useNotification();
  const { currencySymbol } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (transaction) {
      setAmount(transaction.amount.toString());
      setNotes(`Settlement payment from ${transaction.fromUserName} to ${transaction.toUserName}`);
    } else {
      setAmount('');
      setNotes('');
    }
  }, [transaction, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      showError('Please enter a valid settlement amount');
      return;
    }
    if (!transaction) return;

    setLoading(true);
    try {
      await api.post(`/groups/${groupId}/settle`, {
        payeeId: transaction.toUserId,
        amount: parseFloat(amount),
        date,
        notes: notes.trim() ? notes : undefined,
      });

      showSuccess(`Settlement of $${parseFloat(amount).toFixed(2)} recorded successfully`);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to record settlement:', error);
      showError(error.response?.data?.message || 'Failed to record settlement');
    } finally {
      setLoading(false);
    }
  };

  if (!transaction) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Payment Settlement"
      description={`Record transfer between group members to clear balance`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
          <p className="text-slate-500">Payer: <span className="font-bold text-slate-900">{transaction.fromUserName}</span></p>
          <p className="text-slate-500 mt-1">Payee: <span className="font-bold text-slate-900">{transaction.toUserName}</span></p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Settlement Amount ({currencySymbol})</label>
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Transaction Reference</label>
          <input
            type="text"
            placeholder="e.g. Paid via Venmo, Cash, Zelle"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
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
            Confirm Payment
          </button>
        </div>
      </form>
    </Modal>
  );
};
