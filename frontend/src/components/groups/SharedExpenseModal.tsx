import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { GroupMember } from '../../types';
import api from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { useCurrency } from '../../context/CurrencyContext';
import { Loader2, Calculator } from 'lucide-react';

interface SharedExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  groupId: string;
  members: GroupMember[];
  currentUserId: string;
  currency?: string;
}

export const SharedExpenseModal: React.FC<SharedExpenseModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  groupId,
  members,
  currentUserId,
  currency = 'USD',
}) => {
  const { showSuccess, showError } = useNotification();
  const { currencySymbol } = useCurrency();
  const [loading, setLoading] = useState(false);

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Groceries');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paidById, setPaidById] = useState(currentUserId);
  const [splitType, setSplitType] = useState<'EQUAL' | 'EXACT' | 'PERCENTAGE' | 'SHARES'>('EQUAL');

  // Split states per member
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(members.map((m) => m.userId));
  const [exactAmounts, setExactAmounts] = useState<Record<string, string>>({});
  const [percentages, setPercentages] = useState<Record<string, string>>({});
  const [shares, setShares] = useState<Record<string, string>>({});

  const toggleMemberSelection = (userId: string) => {
    if (selectedMemberIds.includes(userId)) {
      if (selectedMemberIds.length === 1) {
        showError('At least one member must participate in the split');
        return;
      }
      setSelectedMemberIds(selectedMemberIds.filter((id) => id !== userId));
    } else {
      setSelectedMemberIds([...selectedMemberIds, userId]);
    }
  };

  const calculateSplitData = () => {
    const total = parseFloat(amount);

    if (splitType === 'EQUAL') {
      return selectedMemberIds.map((userId) => ({ userId }));
    }

    if (splitType === 'EXACT') {
      return selectedMemberIds.map((userId) => ({
        userId,
        amountOwed: parseFloat(exactAmounts[userId] || '0'),
      }));
    }

    if (splitType === 'PERCENTAGE') {
      return selectedMemberIds.map((userId) => ({
        userId,
        percentage: parseFloat(percentages[userId] || '0'),
      }));
    }

    if (splitType === 'SHARES') {
      return selectedMemberIds.map((userId) => ({
        userId,
        shares: parseFloat(shares[userId] || '1'),
      }));
    }

    return [];
  };

  const validateSplits = (): boolean => {
    const total = parseFloat(amount);
    if (!amount || isNaN(total) || total <= 0) {
      showError('Please enter a valid positive amount');
      return false;
    }

    if (selectedMemberIds.length === 0) {
      showError('Please select at least one participant');
      return false;
    }

    if (splitType === 'EXACT') {
      const sumExact = selectedMemberIds.reduce((sum, id) => sum + (parseFloat(exactAmounts[id]) || 0), 0);
      if (Math.abs(sumExact - total) > 0.05) {
        showError(`Exact amounts sum to $${sumExact.toFixed(2)}, but total bill is $${total.toFixed(2)}`);
        return false;
      }
    }

    if (splitType === 'PERCENTAGE') {
      const sumPct = selectedMemberIds.reduce((sum, id) => sum + (parseFloat(percentages[id]) || 0), 0);
      if (Math.abs(sumPct - 100) > 0.1) {
        showError(`Percentages sum to ${sumPct.toFixed(1)}%. It must equal exactly 100%`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSplits()) return;

    setLoading(true);
    try {
      const splits = calculateSplitData();
      await api.post(`/groups/${groupId}/expenses`, {
        amount: parseFloat(amount),
        description: description.trim(),
        category,
        date,
        paidById,
        splitType,
        splits,
      });

      showSuccess('Shared expense recorded and balances updated');
      setDescription('');
      setAmount('');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to add shared expense:', error);
      showError(error.response?.data?.message || 'Failed to record shared expense');
    } finally {
      setLoading(false);
    }
  };

  const totalNumber = parseFloat(amount) || 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Group Shared Expense"
      description="Split costs among roommates or group members with flexible strategies"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Description & Amount */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <input
              type="text"
              required
              placeholder="e.g. Costco grocery haul, Electricity bill"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Total Bill Amount ({currencySymbol})</label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
            />
          </div>
        </div>

        {/* Category, Date & Payer */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="Groceries">Groceries & Food</option>
              <option value="Rent">Rent & Housing</option>
              <option value="Utilities">Utilities & WiFi</option>
              <option value="Entertainment">Entertainment & Outing</option>
              <option value="Travel">Travel & Fuel</option>
              <option value="General">General / Other</option>
            </select>
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
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Paid By</label>
            <select
              value={paidById}
              onChange={(e) => setPaidById(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {members.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.user.name} {m.userId === currentUserId ? '(You)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Split Strategy Tabs */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
            <span>Split Methodology</span>
            <span className="text-[11px] font-normal text-indigo-600 flex items-center gap-1">
              <Calculator className="w-3 h-3" />
              Penny precision guaranteed
            </span>
          </label>
          <div className="grid grid-cols-4 p-1 bg-slate-100 rounded-xl text-center">
            {(['EQUAL', 'EXACT', 'PERCENTAGE', 'SHARES'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSplitType(type)}
                className={`py-2 text-xs font-bold rounded-lg transition-all capitalize ${
                  splitType === type
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {type.toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Member Allocation Inputs */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
          <p className="text-xs font-bold text-slate-700">Participating Members & Shares</p>
          <div className="space-y-2">
            {members.map((m) => {
              const isSelected = selectedMemberIds.includes(m.userId);

              return (
                <div
                  key={m.userId}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-white border-slate-200 shadow-xs'
                      : 'bg-slate-100/60 border-transparent opacity-60'
                  }`}
                >
                  <label className="flex items-center gap-2.5 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleMemberSelection(m.userId)}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300"
                    />
                    <span className="text-xs font-bold text-slate-900">{m.user.name}</span>
                  </label>

                  {/* Contextual Input depending on split type */}
                  {isSelected && (
                    <div className="w-36 flex items-center justify-end">
                      {splitType === 'EQUAL' && (
                        <span className="text-xs font-bold text-slate-700">
                          {currencySymbol}{(totalNumber / Math.max(1, selectedMemberIds.length)).toFixed(2)}
                        </span>
                      )}

                      {splitType === 'EXACT' && (
                        <div className="relative">
                          <span className="absolute left-2.5 top-1.5 text-xs text-slate-400">{currencySymbol}</span>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={exactAmounts[m.userId] || ''}
                            onChange={(e) =>
                              setExactAmounts({ ...exactAmounts, [m.userId]: e.target.value })
                            }
                            className="w-24 pl-6 pr-2 py-1 text-xs rounded-lg border border-slate-200 font-semibold"
                          />
                        </div>
                      )}

                      {splitType === 'PERCENTAGE' && (
                        <div className="relative">
                          <input
                            type="number"
                            step="1"
                            placeholder="0"
                            value={percentages[m.userId] || ''}
                            onChange={(e) =>
                              setPercentages({ ...percentages, [m.userId]: e.target.value })
                            }
                            className="w-20 pr-6 pl-2 py-1 text-xs rounded-lg border border-slate-200 font-semibold text-right"
                          />
                          <span className="absolute right-2 top-1 text-xs text-slate-400">%</span>
                        </div>
                      )}

                      {splitType === 'SHARES' && (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="1"
                            step="1"
                            placeholder="1"
                            value={shares[m.userId] || '1'}
                            onChange={(e) => setShares({ ...shares, [m.userId]: e.target.value })}
                            className="w-16 px-2 py-1 text-xs rounded-lg border border-slate-200 font-semibold text-center"
                          />
                          <span className="text-[11px] text-slate-400">shares</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Buttons */}
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
            Save & Split Bill
          </button>
        </div>
      </form>
    </Modal>
  );
};
