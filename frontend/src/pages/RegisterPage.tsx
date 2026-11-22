import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { CurrencyToggle } from '../components/common/CurrencyToggle';
import { FintechBackground } from '../components/common/FintechBackground';
import { useCurrency } from '../context/CurrencyContext';
import {
  Wallet,
  Loader2,
  ArrowRight,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { currency: globalCurrency, setCurrency: setGlobalCurrency } = useCurrency();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currency, setCurrencyState] = useState(globalCurrency || 'INR');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { showError, showSuccess } = useNotification();
  const navigate = useNavigate();

  const handleCurrencyChange = (newVal: string) => {
    setCurrencyState(newVal);
    setGlobalCurrency(newVal);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      showError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password, currency);
      await setGlobalCurrency(currency);
      showSuccess('Account created successfully! Welcome to SpendFlow.');
      navigate('/dashboard');
    } catch (err: any) {
      showError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col justify-between relative overflow-hidden transition-colors duration-300">
      {/* Relevant Interactive Fintech Background */}
      <FintechBackground />

      {/* Top Header with Brand & Prominent Theme & Currency Toggle */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur-xs opacity-75"></div>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-md">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
              SpendFlow
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-200/80 dark:border-indigo-800/60">
              CS Major Project
            </span>
          </div>
        </div>

        {/* Prominent Currency & Theme Toggle Buttons on Top */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <CurrencyToggle />
          <ThemeToggle variant="pill" />
        </div>
      </header>

      {/* Main Registration Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full max-w-md sm:max-w-lg">
          <div className="card-glow bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-200/80 dark:border-slate-800/80 transition-all duration-300">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-indigo-500/10 via-purple-500/10 to-emerald-500/10 dark:from-indigo-900/30 dark:to-emerald-900/20 border border-indigo-100 dark:border-indigo-800/50 mb-3 shadow-inner">
                <UserPlus className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Create Your Account
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                Join SpendFlow to track expenses, set budget limits, and split group balances
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Morgan"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white/80 dark:bg-slate-800/70 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@university.edu"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white/80 dark:bg-slate-800/70 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    Min. 6 characters
                  </span>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white/80 dark:bg-slate-800/70 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Preferred Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white/80 dark:bg-slate-800/70 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 cursor-pointer"
                >
                  <option value="USD">USD ($) - US Dollar</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                  <option value="INR">INR (₹) - Indian Rupee</option>
                  <option value="CAD">CAD ($) - Canadian Dollar</option>
                  <option value="AUD">AUD ($) - Australian Dollar</option>
                  <option value="JPY">JPY (¥) - Japanese Yen</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-600/30 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 select-none mt-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Already registered?{' '}
                <Link
                  to="/login"
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 underline decoration-indigo-300 dark:decoration-indigo-700 transition-colors"
                >
                  Sign In here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-[11px] text-slate-400 dark:text-slate-600">
        SpendFlow &bull; Personal &amp; Shared Expense Platform
      </footer>
    </div>
  );
};
