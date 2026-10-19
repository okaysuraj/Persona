import React, { useState } from 'react';
import { api } from '../../services/api';
import { Sparkle, LockKey, EnvelopeSimple, User, ArrowRight, ShieldCheck, X } from '@phosphor-icons/react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: { id: string; email: string; display_name: string }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (mode === 'login') {
        const res = await api.login(email.trim(), password);
        onSuccess(res.user);
        onClose();
      } else {
        if (!displayName.trim()) {
          setErrorMessage('Display name is required');
          setIsLoading(false);
          return;
        }
        const res = await api.register(displayName.trim(), email.trim(), password);
        onSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.login('alex@companion.ai', 'password123');
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-zinc-950/95 border border-white/10 shadow-2xl p-6 md:p-8 text-zinc-100 flex flex-col gap-5">
        {/* Header & Close Button */}
        <div className="flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium tracking-wide uppercase mb-2">
              <ShieldCheck size={14} weight="bold" />
              Encrypted Sanctuary
            </div>
            <h2 className="text-2xl font-serif tracking-tight text-white">
              {mode === 'login' ? 'Welcome Back' : 'Create Your Space'}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              {mode === 'login'
                ? 'Sign in to access your companion memory vault & conversations.'
                : 'Join Persona AI to begin building long-term emotional presence.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            aria-label="Close"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Mode Toggle Pills */}
        <div className="flex rounded-xl bg-zinc-900 p-1 border border-white/5">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              mode === 'login'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMessage(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              mode === 'register'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Your Name / Alias</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-rose-500/50 transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Email Address</label>
            <div className="relative">
              <EnvelopeSimple size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-rose-500/50 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Password</label>
            <div className="relative">
              <LockKey size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-rose-500/50 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-600 hover:to-amber-700 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-950/40 transition disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight size={16} weight="bold" />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Demo Login */}
        <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="w-full py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white text-xs font-medium flex items-center justify-center gap-2 transition"
          >
            <Sparkle size={14} weight="fill" className="text-amber-400" />
            <span>1-Click Demo Account (Alex)</span>
          </button>
          <p className="text-[10px] text-zinc-500 text-center">
            Synchronizes with mobile app state & seeded companions.
          </p>
        </div>
      </div>
    </div>
  );
};
