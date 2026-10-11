import React, { useState } from 'react';
import { Heart, Sparkles, User, Check, ArrowRight } from 'lucide-react';
import { CoupleConfig } from '../types';

interface UserGateModalProps {
  config: CoupleConfig;
  isOpen: boolean;
  currentUserName: string;
  onConfirmUser: (name: string, remember: boolean) => void;
  onClose?: () => void;
  canDismiss?: boolean;
}

export const UserGateModal: React.FC<UserGateModalProps> = ({
  config,
  isOpen,
  currentUserName,
  onConfirmUser,
  onClose,
  canDismiss = false,
}) => {
  const [name, setName] = useState<string>(currentUserName || '');
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');

  React.useEffect(() => {
    if (isOpen) {
      setName(currentUserName || '');
      setErrorMsg('');
    }
  }, [isOpen, currentUserName]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setErrorMsg('Please enter your name or nickname to continue');
      return;
    }
    setErrorMsg('');
    onConfirmUser(cleanName, rememberMe);
  };

  const selectQuickName = (selected: string) => {
    setName(selected);
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-[#ffc2d1] shadow-2xl text-center relative my-auto">
        {/* Decorative Romantic Header */}
        <div className="w-16 h-16 rounded-full bg-[#ffe5ec] border border-[#ffc2d1] text-[#fb6f92] flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Heart className="w-8 h-8 fill-[#fb6f92] animate-pulse" />
        </div>

        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#fb6f92] uppercase tracking-widest mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Private Couple Space</span>
          <Sparkles className="w-3.5 h-3.5" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
          US AND FOREVER
        </h2>

        <p className="text-xs sm:text-sm text-stone-600 mt-2 mb-6 leading-relaxed">
          Welcome to our shared memory album and anniversary space. Who is visiting today?
        </p>

        {/* Quick Selection Buttons */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <button
            type="button"
            onClick={() => selectQuickName(config.partner1 || 'James')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
              name === (config.partner1 || 'James')
                ? 'bg-[#fb6f92] text-white border-[#fb6f92] shadow-xs'
                : 'bg-[#ffe5ec]/50 text-stone-700 border-[#ffc2d1] hover:bg-[#ffe5ec]'
            }`}
          >
            I am {config.partner1 || 'James'}
          </button>
          <button
            type="button"
            onClick={() => selectQuickName(config.partner2 || 'Loraine')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
              name === (config.partner2 || 'Loraine')
                ? 'bg-[#fb6f92] text-white border-[#fb6f92] shadow-xs'
                : 'bg-[#ffe5ec]/50 text-stone-700 border-[#ffc2d1] hover:bg-[#ffe5ec]'
            }`}
          >
            I am {config.partner2 || 'Loraine'}
          </button>
        </div>

        {/* Name Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {errorMsg && (
            <p className="text-xs text-rose-600 text-center font-medium bg-rose-50 py-1.5 px-3 rounded-xl border border-rose-200">
              {errorMsg}
            </p>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Your Name or Nickname
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. James, Loraine, Babe..."
                autoFocus
                className="w-full pl-10 pr-4 py-2.5 bg-[#fff9fa] border border-[#ffc2d1] rounded-2xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff8fab]/25 focus:border-[#fb6f92] transition-all"
              />
            </div>
          </div>

          {/* Remember Me Checkbox */}
          <div className="p-3 rounded-2xl bg-[#ffe5ec]/40 border border-[#ffc2d1]/60">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-[#fb6f92] focus:ring-[#ff8fab] accent-[#fb6f92] cursor-pointer"
              />
              <div className="text-xs">
                <span className="font-semibold text-stone-800 block">
                  Remember me on this device
                </span>
                <span className="text-stone-500 text-[11px] leading-tight block mt-0.5">
                  Every time you open this website, it will automatically recognize you.
                </span>
              </div>
            </label>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            {canDismiss && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-medium text-stone-500 hover:text-stone-800 cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="w-full py-3 rounded-full bg-[#fb6f92] hover:bg-[#e8557b] text-white text-xs sm:text-sm font-semibold shadow-md shadow-[#fb6f92]/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Enter Our Love Space</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
