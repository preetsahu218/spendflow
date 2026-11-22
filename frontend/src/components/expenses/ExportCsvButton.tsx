import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

export const ExportCsvButton: React.FC<{ startDate?: string; endDate?: string }> = ({
  startDate,
  endDate,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const { showSuccess, showError } = useNotification();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await api.get('/expenses/export/csv', {
        params: { startDate, endDate },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `SpendFlow_Expenses_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showSuccess('CSV export generated successfully');
    } catch (error) {
      console.error('Failed to export CSV:', error);
      showError('Failed to export transactions to CSV');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
    >
      {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
      Export CSV
    </button>
  );
};
