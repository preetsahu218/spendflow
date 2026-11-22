import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { CurrencyToggle } from '../components/common/CurrencyToggle';
import { FintechBackground } from '../components/common/FintechBackground';
import {
  Wallet,
  Loader2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  PieChart,
  CheckCircle2,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showError, showSuccess } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      showSuccess('Welcome back to SpendFlow!');
      navigate('/dashboard');
    } catch (err: any) {
      showError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail: string, name: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    showSuccess(`Filled demo credentials for ${name}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col justify-between relative overflow-hidden transition-colors duration-300">
      {/* Relevant Interactive Fintech Background */}
      <FintechBackground />

      {/* Top Header Bar with Prominent Theme Toggle */}
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

        {/* Standout Currency Toggle & Light & Dark Theme Toggle Button on Top */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <CurrencyToggle />
          <ThemeToggle variant="pill" />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full max-w-md sm:max-w-lg">
          {/* Main Card */}
          <div className="card-glow bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-200/80 dark:border-slate-800/80 transition-all duration-300">
            {/* Header Inside Card */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-indigo-500/10 via-purple-500/10 to-emerald-500/10 dark:from-indigo-900/30 dark:to-emerald-900/20 border border-indigo-100 dark:border-indigo-800/50 mb-3 shadow-inner">
                <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Welcome to SpendFlow
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                Sign in to access your personal cash-flow and shared group balances
              </p>
            </div>

            {/* Login Form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@capstone.edu"
                  className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white/80 dark:bg-slate-800/70 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                    Default: Password123!
                  </span>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white/80 dark:bg-slate-800/70 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-600/30 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 select-none"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Sign In to Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Credentials */}
            <div className="mt-8 pt-6 border-t border-slate-200/70 dark:border-slate-800/80">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  1-Click Seeded Demo Users
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
                  Ready to test
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => fillDemoAccount('alex@capstone.edu', 'Alex (Lead)')}
                  className="p-2.5 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-all duration-200 border border-indigo-200/80 dark:border-indigo-800/80 text-center hover:scale-105 active:scale-95 shadow-xs"
                >
                  <p className="font-bold truncate">Alex (Lead)</p>
                  <p className="text-[10px] text-indigo-500/80 dark:text-indigo-400/80 mt-0.5">Preloaded data</p>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoAccount('bob@capstone.edu', 'Bob')}
                  className="p-2.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 border border-slate-200 dark:border-slate-700 text-center hover:scale-105 active:scale-95 shadow-xs"
                >
                  <p className="font-bold truncate">Bob</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Group debtor</p>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoAccount('clara@capstone.edu', 'Clara')}
                  className="p-2.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 border border-slate-200 dark:border-slate-700 text-center hover:scale-105 active:scale-95 shadow-xs"
                >
                  <p className="font-bold truncate">Clara</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Group creditor</p>
                </button>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 underline decoration-indigo-300 dark:decoration-indigo-700 transition-colors"
                >
                  Register here
                </Link>
              </p>
            </div>
          </div>

          {/* Feature Highlights beneath */}
          <div className="mt-6 grid grid-cols-3 gap-3 text-center text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex flex-col items-center gap-1 p-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>JWT + bcrypt</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-2">
              <Zap className="w-4 h-4 text-indigo-500" />
              <span>Min-Cash-Flow</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-2">
              <PieChart className="w-4 h-4 text-purple-500" />
              <span>Budget Alerts</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-[11px] text-slate-400 dark:text-slate-600">
        SpendFlow &copy; Computer Science Major Project &bull; Built with React &amp; TypeScript
      </footer>
    </div>
  );
};
