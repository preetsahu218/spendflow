import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  locale: string;
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyConfig> = {
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
  CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', locale: 'en-CA' },
  AUD: { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar', locale: 'en-AU' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
};

interface CurrencyContextType {
  currency: string;
  currencySymbol: string;
  currencyConfig: CurrencyConfig;
  setCurrency: (code: string) => Promise<void>;
  formatCurrency: (amount: number, options?: { showSign?: boolean; decimals?: number }) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, updateUser } = useAuth();

  const [currency, setCurrencyState] = useState<string>(() => {
    const saved = localStorage.getItem('spendflow_currency');
    if (saved && SUPPORTED_CURRENCIES[saved]) return saved;
    if (user?.currency && SUPPORTED_CURRENCIES[user.currency]) return user.currency;
    return 'INR'; // Default to INR based on user preference
  });

  // Sync when user object loads or updates
  useEffect(() => {
    const saved = localStorage.getItem('spendflow_currency');
    if (saved && SUPPORTED_CURRENCIES[saved]) {
      // User has chosen a currency (e.g. on login page or via toggle)
      setCurrencyState(saved);
      if (user && user.currency !== saved) {
        updateUser({ currency: saved });
        api.put('/auth/me', { currency: saved }).catch(() => {});
      }
    } else if (user?.currency && SUPPORTED_CURRENCIES[user.currency]) {
      setCurrencyState(user.currency);
      localStorage.setItem('spendflow_currency', user.currency);
    }
  }, [user?.id, updateUser]);

  const currencyConfig = SUPPORTED_CURRENCIES[currency] || SUPPORTED_CURRENCIES.INR;
  const currencySymbol = currencyConfig.symbol;

  const setCurrency = useCallback(
    async (code: string) => {
      const upper = code.toUpperCase();
      if (!SUPPORTED_CURRENCIES[upper]) return;

      setCurrencyState(upper);
      localStorage.setItem('spendflow_currency', upper);

      // If authenticated, also persist to backend user profile and AuthContext
      if (user) {
        updateUser({ currency: upper });
        try {
          await api.put('/auth/me', { currency: upper });
        } catch (err) {
          console.warn('Could not persist currency preference to backend:', err);
        }
      }
    },
    [user, updateUser]
  );

  const formatCurrency = useCallback(
    (amount: number, options?: { showSign?: boolean; decimals?: number }) => {
      const decimals = options?.decimals ?? 2;
      const val = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
      const isNegative = val < 0;
      const absVal = Math.abs(val);

      const formattedNumber = absVal.toLocaleString(currencyConfig.locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });

      if (options?.showSign) {
        const sign = isNegative ? '-' : '+';
        return `${sign}${currencySymbol}${formattedNumber}`;
      }

      return `${isNegative ? '-' : ''}${currencySymbol}${formattedNumber}`;
    },
    [currencyConfig, currencySymbol]
  );

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        currencySymbol,
        currencyConfig,
        setCurrency,
        formatCurrency,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
