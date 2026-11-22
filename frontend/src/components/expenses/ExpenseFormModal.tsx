import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Category, Expense } from '../../types';
import api from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { useCurrency } from '../../context/CurrencyContext';
import { Loader2 } from 'lucide-react';

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: Category[];
  expenseToEdit?: Expense | null;
  initialType?: 'EXPENSE' | 'INCOME';
}

export const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  categories,
  expenseToEdit,
  initialType = 'EXPENSE',
}) => {
  const { showSuccess, showError } = useNotification();
  const { currencySymbol } = useCurrency();
  const [loading, setLoading] = useState(false);

  const [type, setType] = useState<'EXPENSE' | 'INCOME'>(initialType);
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'UPI' | 'BANK_TRANSFER' | 'OTHER'>('CARD');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceInterval, setRecurrenceInterval] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [notes, setNotes] = useState('');

  // Sync state when editing
  useEffect(() => {
    if (expenseToEdit) {
      setType(expenseToEdit.type);
      setAmount(expenseToEdit.amount.toString());
      setCategoryId(expenseToEdit.categoryId);
      setDescription(expenseToEdit.description);
      setDate(new Date(expenseToEdit.date).toISOString().split('T')[0]);
      setPaymentMethod(expenseToEdit.paymentMethod);
      setIsRecurring(expenseToEdit.isRecurring);
      setRecurrenceInterval((expenseToEdit.recurrenceInterval as any) || 'MONTHLY');
      setNotes(expenseToEdit.notes || '');
    } else {
      const activeType = initialType || 'EXPENSE';
      setType(activeType);
      const filtered = categories.filter((c) => c.type === activeType);
      if (filtered.length > 0) setCategoryId(filtered[0].id);
      setAmount('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setIsRecurring(false);
    }
  }, [expenseToEdit, isOpen, categories, initialType]);

  // When type changes, default category to first of that type
  const handleTypeChange = (newType: 'EXPENSE' | 'INCOME') => {
    setType(newType);
    const filtered = categories.filter((c) => c.type === newType);
    if (filtered.length > 0) {
      setCategoryId(filtered[0].id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      showError('Please enter a valid positive amount');
      return;
    }
    if (!categoryId) {
      showError('Please select a category');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        type,
        amount: parseFloat(amount),
        categoryId,
        description,
        date,
        paymentMethod,
        isRecurring,
        recurrenceInterval: isRecurring ? recurrenceInterval : null,
        notes: notes.trim() ? notes : null,
      };

      if (expenseToEdit) {
        await api.put(`/expenses/${expenseToEdit.id}`, payload);
        showSuccess('Transaction updated successfully');
      } else {
        await api.post('/expenses', payload);
        showSuccess('Transaction added successfully');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to save expense:', error);
      showError(error.response?.data?.message || 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter((c) => c.type === type);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={expenseToEdit ? 'Edit Transaction' : 'Record Transaction'}
      description="Track personal expenditures, income, and recurring commitments"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type toggle: Expense vs Income */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => handleTypeChange('EXPENSE')}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              type === 'EXPENSE'
                ? 'bg-white text-rose-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('INCOME')}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              type === 'INCOME'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Income
          </button>
        </div>

        {/* Amount & Date */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Amount ({currencySymbol})</label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
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

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
          <input
            type="text"
            required
            placeholder="e.g. Trader Joe's groceries, Rent share"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Category & Payment Method */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="CARD">Credit / Debit Card</option>
              <option value="CASH">Cash</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="UPI">UPI / Digital</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        {/* Recurring Toggle */}
        <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <div>
            <p className="text-xs font-bold text-slate-800">Recurring Transaction</p>
            <p className="text-[11px] text-slate-500">Auto-budgeted recurring commitment</p>
          </div>
          <input
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300 cursor-pointer"
          />
        </div>

        {isRecurring && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Frequency</label>
            <select
              value={recurrenceInterval}
              onChange={(e) => setRecurrenceInterval(e.target.value as any)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
              <option value="YEARLY">Yearly</option>
            </select>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Notes (Optional)</label>
          <textarea
            rows={2}
            placeholder="Add extra context or receipt details..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
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
            {expenseToEdit ? 'Save Changes' : 'Record Transaction'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
