import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Category } from '../../types';
import api from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { useCurrency } from '../../context/CurrencyContext';
import { Loader2 } from 'lucide-react';

interface BudgetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: Category[];
  currentMonth: number;
  currentYear: number;
}

export const BudgetFormModal: React.FC<BudgetFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  categories,
  currentMonth,
  currentYear,
}) => {
  const { showSuccess, showError } = useNotification();
  const { currencySymbol } = useCurrency();
  const [loading, setLoading] = useState(false);

  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE');
  const [categoryId, setCategoryId] = useState(expenseCategories[0]?.id || '');
  const [amountLimit, setAmountLimit] = useState('');
  const [alertThreshold, setAlertThreshold] = useState('80');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountLimit || isNaN(parseFloat(amountLimit)) || parseFloat(amountLimit) <= 0) {
      showError('Please enter a valid positive budget amount');
      return;
    }

    setLoading(true);
    try {
      await api.post('/budgets', {
        categoryId,
        month: currentMonth,
        year: currentYear,
        amountLimit: parseFloat(amountLimit),
        alertThreshold: parseFloat(alertThreshold),
      });

      showSuccess('Category budget configured successfully');
      setAmountLimit('');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to set budget:', error);
      showError(error.response?.data?.message || 'Failed to set budget');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Set Monthly Category Budget"
      description={`Allocate spending targets for ${new Date(Date.UTC(currentYear, currentMonth - 1, 1)).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Expense Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            {expenseCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Limit ({currencySymbol})</label>
          <input
            type="number"
            step="0.01"
            required
            placeholder="e.g. 500.00"
            value={amountLimit}
            onChange={(e) => setAmountLimit(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-slate-700">
              Warning Alert Threshold ({alertThreshold}%)
            </label>
            <span className="text-[11px] text-slate-400">Trigger amber warning</span>
          </div>
          <input
            type="range"
            min="50"
            max="100"
            step="5"
            value={alertThreshold}
            onChange={(e) => setAlertThreshold(e.target.value)}
            className="w-full accent-indigo-600 cursor-pointer"
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
            Save Budget
          </button>
        </div>
      </form>
    </Modal>
  );
};
