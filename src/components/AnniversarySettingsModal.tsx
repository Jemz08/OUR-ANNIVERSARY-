import React, { useState } from 'react';
import { X, Heart, Smartphone, Save, RotateCcw, Check, Share2 } from 'lucide-react';
import { CoupleConfig } from '../types';

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
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedMsg, setShowSavedMsg] = useState(false);

  if (!isOpen) return null;

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
      });
      setShowSavedMsg(true);
      setTimeout(() => setShowSavedMsg(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const [copiedLink, setCopiedLink] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const copyAppUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full max-h-[92dvh] overflow-y-auto shadow-2xl border border-[#ffc2d1] my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#ffe5ec]">
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
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {showSavedMsg && (
            <div className="p-3 rounded-xl bg-[#ffe5ec] text-[#5c182b] border border-[#ffc2d1] text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-[#fb6f92]" />
              <span>Settings successfully updated and saved!</span>
            </div>
          )}

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
                placeholder="My Love / Her Name"
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

          {/* Hosting Guide for Vercel & Cloudflare */}
          <div className="p-4 rounded-2xl bg-[#fff9fa] border border-[#ffc2d1]/80 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#ffe5ec] text-[#fb6f92] flex items-center justify-center text-[10px] font-bold">
                ☁
              </span>
              <span className="text-xs font-bold text-stone-800">
                Hosting on Vercel or Cloudflare
              </span>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Pre-configured for both platforms!
              <br />
              • <strong>Vercel:</strong> Import repository. Build Command: <code className="bg-[#ffe5ec] text-[#5c182b] px-1 py-0.5 rounded text-[10px]">npm run build</code>, Output Directory: <code className="bg-[#ffe5ec] text-[#5c182b] px-1 py-0.5 rounded text-[10px]">dist</code> (<code className="text-stone-500">vercel.json</code> is ready).
              <br />
              • <strong>Cloudflare Pages:</strong> Connect git repo. Framework preset: <strong>Vite</strong>, Build Command: <code className="bg-[#ffe5ec] text-[#5c182b] px-1 py-0.5 rounded text-[10px]">npm run build</code>, Build Output: <code className="bg-[#ffe5ec] text-[#5c182b] px-1 py-0.5 rounded text-[10px]">dist</code> (<code className="text-stone-500">public/_redirects</code> is ready).
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
              className="px-6 py-2.5 rounded-full bg-[#fb6f92] hover:bg-[#e8557b] text-white text-xs font-semibold shadow-sm shadow-[#fb6f92]/20 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
