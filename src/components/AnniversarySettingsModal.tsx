import React, { useState } from 'react';
import { X, Heart, Smartphone, Save, RotateCcw, Check, Share2, Palette } from 'lucide-react';
import { CoupleConfig } from '../types';
import { APP_THEMES, applyTheme } from '../utils/themeUtils';

interface AnniversarySettingsModalProps {
  config: CoupleConfig;
  isOpen: boolean;
  onClose: () => void;
  onSaveConfig: (updated: Partial<CoupleConfig>) => Promise<void>;
  onResetDemo: () => Promise<void>;
}

export const AnniversarySettingsModal: React.FC<AnniversarySettingsModalProps> = ({
  config,
  isOpen,
  onClose,
  onSaveConfig,
  onResetDemo,
}) => {
  const [partner1, setPartner1] = useState(config.partner1);
  const [partner2, setPartner2] = useState(config.partner2);
  const [metDate, setMetDate] = useState(config.metDate);
  const [officialDate, setOfficialDate] = useState(config.officialDate);
  const [loveQuote, setLoveQuote] = useState(config.loveQuote);
  const [theme, setTheme] = useState<string>(config.theme || 'romantic-rose');
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedMsg, setShowSavedMsg] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  // Synchronize form state with latest config whenever the modal opens
  React.useEffect(() => {
    if (isOpen) {
      setPartner1(config.partner1);
      setPartner2(config.partner2);
      setMetDate(config.metDate);
      setOfficialDate(config.officialDate);
      setLoveQuote(config.loveQuote);
      setTheme(config.theme || localStorage.getItem('oct26_active_theme') || 'romantic-rose');
      setShowSavedMsg(false);
      setConfirmReset(false);
      setCopiedLink(false);
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  const handleSelectTheme = (themeId: string) => {
    setTheme(themeId);
    applyTheme(themeId);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveConfig({
        partner1: partner1.trim() || 'James',
        partner2: partner2.trim() || 'Loraine',
        metDate,
        officialDate,
        loveQuote: loveQuote.trim() || 'Every love story is beautiful, but ours is my favorite.',
        theme,
      });
      applyTheme(theme);
      setShowSavedMsg(true);
      setTimeout(() => setShowSavedMsg(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const copyAppUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full max-h-[92dvh] overflow-y-auto shadow-2xl border border-[#ffc2d1] my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#ffe5ec] sticky top-0 bg-white/95 backdrop-blur-xs z-10">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-[#ffe5ec] text-[#fb6f92] flex items-center justify-center border border-[#ffc2d1]">
              <Heart className="w-4 h-4 fill-[#fb6f92]" />
            </span>
            <h2 className="font-serif text-lg font-bold text-stone-900">
              Anniversary &amp; Couple Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-[#ffe5ec]/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-5">
          {showSavedMsg && (
            <div className="p-3 rounded-xl bg-[#ffe5ec] text-[#5c182b] border border-[#ffc2d1] text-xs flex items-center gap-2 animate-fade-scale">
              <Check className="w-4 h-4 text-[#fb6f92]" />
              <span>Settings and theme successfully updated and saved!</span>
            </div>
          )}

          {/* Theme Color Picker Section (New Feature) */}
          <div className="p-4 rounded-2xl bg-[#fff9fa] border border-[#ffc2d1]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                <Palette className="w-4 h-4 text-[#fb6f92]" />
                <span>App Theme Colors &amp; Mood</span>
              </div>
              <span className="text-[11px] font-semibold text-[#fb6f92]">
                5 Romance Themes
              </span>
            </div>
            <p className="text-[11px] text-stone-500 mb-3">
              Choose your favorite couple palette. Changes apply live to all buttons, borders, hearts, and highlights!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {APP_THEMES.map((t) => {
                const isSelected = theme === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => handleSelectTheme(t.id)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-white border-[#fb6f92] shadow-sm ring-2 ring-[#fb6f92]/25'
                        : 'bg-white/80 border-stone-200 hover:border-[#ffc2d1] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-stone-900">
                        {t.name}
                      </span>
                      {isSelected ? (
                        <span className="w-4 h-4 rounded-full bg-[#fb6f92] text-white flex items-center justify-center text-[10px]">
                          ✓
                        </span>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-1.5 mb-2">
                      {t.palette.map((color, idx) => (
                        <span
                          key={idx}
                          className="w-4 h-4 rounded-full border border-black/10 shadow-2xs"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                      <span className="text-[10px] text-stone-400 ml-1 font-medium">
                        {t.badge}
                      </span>
                    </div>

                    <p className="text-[10px] text-stone-500 leading-tight">
                      {t.tagline}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Partner Names */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={partner1}
                onChange={(e) => setPartner1(e.target.value)}
                placeholder="James"
                required
                className="w-full px-3.5 py-2 bg-[#fff9fa] border border-[#ffc2d1] rounded-xl text-xs md:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#ff8fab]/20 focus:border-[#fb6f92]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Her Name / Nickname
              </label>
              <input
                type="text"
                value={partner2}
                onChange={(e) => setPartner2(e.target.value)}
                placeholder="Loraine"
                required
                className="w-full px-3.5 py-2 bg-[#fff9fa] border border-[#ffc2d1] rounded-xl text-xs md:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#ff8fab]/20 focus:border-[#fb6f92]"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Date You Met
              </label>
              <input
                type="date"
                value={metDate}
                onChange={(e) => setMetDate(e.target.value)}
                required
                className="w-full px-3 py-2 bg-[#fff9fa] border border-[#ffc2d1] rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#ff8fab]/20 focus:border-[#fb6f92]"
              />
              <span className="text-[10px] text-stone-400 mt-0.5 block">June 15, 2016</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Official Anniversary
              </label>
              <input
                type="date"
                value={officialDate}
                onChange={(e) => setOfficialDate(e.target.value)}
                required
                className="w-full px-3 py-2 bg-[#fff9fa] border border-[#ffc2d1] rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#ff8fab]/20 focus:border-[#fb6f92]"
              />
              <span className="text-[10px] text-stone-400 mt-0.5 block">Oct 26 (Every year)</span>
            </div>
          </div>

          {/* Quote */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Home Page Love Quote
            </label>
            <textarea
              rows={2}
              value={loveQuote}
              onChange={(e) => setLoveQuote(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#fff9fa] border border-[#ffc2d1] rounded-xl text-xs md:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#ff8fab]/20 focus:border-[#fb6f92]"
            />
          </div>

          {/* Mobile Sharing & Add to Home Screen Instructions */}
          <div className="p-4 rounded-2xl bg-[#ffe5ec]/40 border border-[#ffc2d1] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                <Smartphone className="w-4 h-4 text-[#fb6f92]" />
                <span>Mobile Access &amp; Home Screen App</span>
              </div>
              <button
                type="button"
                onClick={copyAppUrl}
                className="text-xs text-[#fb6f92] hover:text-[#e8557b] font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
            {copiedLink && (
              <p className="text-[11px] font-medium text-[#fb6f92] animate-fade-in">
                Link copied to clipboard! Send it to her so she can open it on her phone ❤️
              </p>
            )}
            <p className="text-[11px] text-stone-600 leading-relaxed">
              To use this like a native app on mobile:
              <br />
              • <strong>iPhone / Safari:</strong> Tap Share (<span className="text-stone-700">⎋</span>) → select <strong>&quot;Add to Home Screen&quot;</strong>.
              <br />
              • <strong>Android / Chrome:</strong> Tap (⋮) → select <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home Screen&quot;</strong>.
            </p>
          </div>

          {/* Reset Demo Option */}
          <div className="pt-2 flex items-center justify-between gap-2">
            {confirmReset ? (
              <div className="flex items-center gap-1.5 animate-fade-in">
                <button
                  type="button"
                  onClick={async () => {
                    await onResetDemo();
                    setConfirmReset(false);
                    onClose();
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-[#fb6f92] text-white text-[11px] font-bold cursor-pointer"
                >
                  Confirm Reset?
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-2 py-1.5 rounded-lg bg-stone-100 text-stone-600 text-[11px] cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="text-xs text-stone-400 hover:text-stone-700 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset empty gallery</span>
              </button>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-full bg-[#fb6f92] hover:bg-[#e8557b] active:scale-95 text-white text-xs font-bold shadow-sm shadow-[#fb6f92]/20 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
