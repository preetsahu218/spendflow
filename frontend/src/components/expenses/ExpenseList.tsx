import React from 'react';
import { Expense } from '../../types';
import { Badge } from '../common/Badge';
import { Edit2, Trash2, Repeat, CreditCard, Banknote, Landmark, Smartphone } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (expenseId: string) => void;
  currency?: string;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  onEdit,
  onDelete,
}) => {
  const { formatCurrency } = useCurrency();
  if (expenses.length === 0) {
    return (
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-12 text-center shadow-sm">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto mb-3 text-lg">
          💳
        </div>
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No transactions recorded</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          Start tracking your personal financial cash-flow by recording your first income or expense entry above.
        </p>
      </div>
    );
  }

  const renderPaymentIcon = (method: string) => {
    switch (method) {
      case 'CARD':
        return <span title="Card"><CreditCard className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /></span>;
      case 'CASH':
        return <span title="Cash"><Banknote className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /></span>;
      case 'BANK_TRANSFER':
        return <span title="Bank Transfer"><Landmark className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /></span>;
      case 'UPI':
        return <span title="Digital / UPI"><Smartphone className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /></span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden transition-colors">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50/75 dark:bg-slate-800/60 border-b border-slate-200/70 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4">Description</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Payment</th>
              <th className="py-3.5 px-4 text-right">Amount</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
            {expenses.map((expense) => {
              const isIncome = expense.type === 'INCOME';
              const formattedDate = new Date(expense.date).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <tr key={expense.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group">
                  <td className="py-3.5 px-4 font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {formattedDate}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white">{expense.description}</span>
                      {expense.isRecurring && (
                        <span
                          className="inline-flex items-center gap-0.5 text-[10px] bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-800/60"
                          title={`Recurring: ${expense.recurrenceInterval}`}
                        >
                          <Repeat className="w-2.5 h-2.5" />
                          {expense.recurrenceInterval?.toLowerCase()}
                        </span>
                      )}
                    </div>
                    {expense.notes && (
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate max-w-xs">
                        {expense.notes}
                      </p>
                    )}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <Badge
                      variant="slate"
                      className="font-medium"
                      style={{
                        backgroundColor: `${expense.category.color}15`,
                        color: expense.category.color,
                        borderColor: `${expense.category.color}35`,
                      }}
                    >
                      {expense.category.name}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      {renderPaymentIcon(expense.paymentMethod)}
                      <span className="capitalize">{expense.paymentMethod.replace('_', ' ').toLowerCase()}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap font-bold">
                    <span className={isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}>
                      {isIncome ? '+' : '-'}{formatCurrency(expense.amount)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1 opacity-75 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEdit(expense)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(expense.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
