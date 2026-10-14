import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, Lock, Key, Sparkles, Heart, Volume2, VolumeX, RotateCcw, 
  Wine, Edit3, Check, Calendar, Clock, MapPin, Eye, ShieldCheck, ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CoupleConfig, SecretLetter } from '../types';
import { 
  getSaskatoonTimeInfo, 
  validatePreviewPassword, 
  isPreviewUnlocked, 
  setPreviewUnlocked, 
  SaskatoonTimeInfo,
  SECRET_PREVIEW_PASSWORD
} from '../utils/saskatoonTime';
import { romanticAudio } from '../utils/romanticAudio';

interface SkyLanternSurpriseProps {
  config: CoupleConfig;
  isOpen: boolean;
  onClose: () => void;
  onSaveConfig: (updated: Partial<CoupleConfig>) => Promise<void>;
  onTriggerConfetti: () => void;
}

export const SkyLanternSurprise: React.FC<SkyLanternSurpriseProps> = ({
  config,
  isOpen,
  onClose,
  onSaveConfig,
  onTriggerConfetti,
}) => {
  const [saskatoonInfo, setSaskatoonInfo] = useState<SaskatoonTimeInfo>(() => getSaskatoonTimeInfo());
  const [isPreview, setIsPreview] = useState<boolean>(() => isPreviewUnlocked());
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  
  // Lantern stages: 'idle' (waiting to be released), 'releasing' (ascending with sparkles), 'letter' (parchment unrolled)
  const [lanternStage, setLanternStage] = useState<'idle' | 'releasing' | 'letter'>('idle');
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Letter editing state
  const [isEditingLetter, setIsEditingLetter] = useState<boolean>(false);
  const [letterTitle, setLetterTitle] = useState<string>('');
  const [letterBody, setLetterBody] = useState<string>('');
  const [isSavingLetter, setIsSavingLetter] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Distant background lanterns
  const [backgroundLanterns, setBackgroundLanterns] = useState<Array<{ id: number; left: number; delay: number; size: number; duration: number }>>([]);

  const defaultLetter: SecretLetter = {
    title: `To My Dearest ${config.partner2 || 'Loraine'}, Happy Anniversary!`,
    message: `From the very first moment we met on June 15, 2016, you brought a warmth and light into my life that nothing could ever dim. Making our love official on October 26, 2022 was the greatest blessing of my life.\n\nEvery day with you is a gift—your gentle laughter, your kindness, your presence, and every single memory we share in this album. Just like this sky lantern soaring into the living skies of Saskatchewan, my love and devotion to you will only keep rising.\n\nThank you for loving me, for inspiring me, and for choosing me every single day. Here is to our forever, my love. Happy Anniversary!\n\nForever yours,\n${config.partner1 || 'James'} ♥`,
    sender: config.partner1 || 'James',
    recipient: config.partner2 || 'Loraine',
  };

  // Synchronize letter fields from config
  useEffect(() => {
    const existing = config.secretLetter;
    setLetterTitle(existing?.title || defaultLetter.title || '');
    setLetterBody(existing?.message || defaultLetter.message || '');
  }, [config.secretLetter, config.partner1, config.partner2]);

  // Live timer tick for Saskatoon Canada countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setSaskatoonInfo(getSaskatoonTimeInfo());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Generate gentle background lanterns for festival feel
  useEffect(() => {
    const lanterns = Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      left: Math.random() * 94 + 3,
      delay: Math.random() * 8,
      size: Math.random() * 16 + 10,
      duration: Math.random() * 10 + 14,
    }));
    setBackgroundLanterns(lanterns);
  }, []);

  // When modal closes, pause audio
  useEffect(() => {
    if (!isOpen) {
      romanticAudio.stopMelody();
      setLanternStage('idle');
      setShowPasswordModal(false);
      setPasswordError('');
      setPasswordInput('');
    }
  }, [isOpen]);

  // Determine whether surprise is unlocked:
  // Unlocked if Saskatoon calendar date is on or after Oct 26, OR if James activated preview mode
  const isTimeUnlocked = saskatoonInfo.isPastOrOnOct26;
  const isSurpriseUnlocked = isTimeUnlocked || isPreview;

  // Handle password unlock for James
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validatePreviewPassword(passwordInput)) {
      setPreviewUnlocked(true);
      setIsPreview(true);
      setShowPasswordModal(false);
      setPasswordError('');
      setPasswordInput('');
      onTriggerConfetti();
    } else {
      setPasswordError('Incorrect secret password. Only James has the secret key!');
    }
  };

  const handleExitPreview = () => {
    setPreviewUnlocked(false);
    setIsPreview(false);
    setLanternStage('idle');
    romanticAudio.stopMelody();
  };

  // Release lantern animation & sound
  const handleReleaseLantern = useCallback(() => {
    romanticAudio.playRibbonUntieSparkle();
    setLanternStage('releasing');

    // Trigger golden sparkles
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#fde047', '#fbbf24', '#f59e0b', '#fb7185', '#ffffff'],
      });
    } catch (e) {
      // ignore
    }

    // Play romantic arpeggio melody
    if (!isMuted) {
      setTimeout(() => {
        romanticAudio.startMelody();
      }, 700);
    }

    // Show parchment letter after lantern ascends into starlight
    setTimeout(() => {
      setLanternStage('letter');
    }, 2800);
  }, [isMuted]);

  // Relight & Reset lantern flight
  const handleRelightLantern = () => {
    romanticAudio.stopMelody();
    setLanternStage('idle');
    setIsEditingLetter(false);
  };

  // Toggle sound
  const handleToggleSound = () => {
    const muted = romanticAudio.toggleMute();
    setIsMuted(muted);
  };

  // Toast celebration
  const handleToast = () => {
    romanticAudio.playToastChime();
    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#ffd700', '#ffb703', '#fb6f92', '#ffffff', '#ffccd5'],
      });
    } catch (e) {
      // ignore
    }
  };

  // Save customized letter
  const handleSaveCustomLetter = async () => {
    setIsSavingLetter(true);
    try {
      await onSaveConfig({
        secretLetter: {
          title: letterTitle.trim() || defaultLetter.title,
          message: letterBody.trim() || defaultLetter.message,
          sender: config.partner1 || 'James',
          recipient: config.partner2 || 'Loraine',
          lastUpdated: new Date().toISOString(),
        },
      });
      setSaveSuccess(true);
      setIsEditingLetter(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save letter', err);
    } finally {
      setIsSavingLetter(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 md:p-6 animate-fade-in">
      {/* Background Starfield & Living Skies Aurora */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Soft living skies aurora waves */}
        <div className="absolute -top-40 left-0 right-0 h-[500px] bg-gradient-to-b from-emerald-600/15 via-teal-500/10 to-transparent blur-3xl animate-pulse" />
        <div className="absolute top-1/4 -left-40 w-[600px] h-[600px] bg-purple-700/15 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-rose-600/15 rounded-full blur-3xl" />

        {/* Twinkling star particles */}
        <div className="absolute inset-0 opacity-70 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />

        {/* Distant drifting mini lanterns if released or unlocked */}
        {lanternStage !== 'idle' &&
          backgroundLanterns.map((l) => (
            <div
              key={l.id}
              style={{
                left: `${l.left}%`,
                width: `${l.size}px`,
                height: `${l.size * 1.3}px`,
                animationDelay: `${l.delay}s`,
                animationDuration: `${l.duration}s`,
              }}
              className="absolute bottom-0 rounded-sm bg-gradient-to-t from-amber-500/80 via-orange-400/90 to-yellow-200 shadow-[0_0_12px_rgba(251,191,36,0.8)] opacity-70 animate-float-up pointer-events-none"
            />
          ))}
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-2xl bg-gradient-to-b from-stone-900 via-stone-900/95 to-stone-950 border border-amber-500/30 rounded-3xl shadow-2xl text-stone-100 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-amber-500/20 bg-stone-900/80">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 text-sm shadow-[0_0_12px_rgba(245,158,11,0.3)]">
              🏮
            </span>
            <div>
              <h2 className="font-serif text-sm sm:text-base font-bold text-amber-100 flex items-center gap-1.5">
                <span>The Sky Lantern Surprise</span>
                {isPreview && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-semibold">
                    Preview Mode
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-amber-200/60">
                Oct 26 Anniversary · Canada / Saskatoon Time
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {lanternStage !== 'idle' && (
              <button
                onClick={handleToggleSound}
                title={isMuted ? 'Turn Sound On' : 'Mute Music'}
                className="w-8 h-8 rounded-full bg-stone-800/80 hover:bg-stone-700 text-amber-300 flex items-center justify-center border border-amber-500/30 active:scale-95 transition-all cursor-pointer"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            )}

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center border border-stone-700 active:scale-95 transition-all cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Preview Status Banner (For James) */}
        {isPreview && (
          <div className="bg-amber-950/60 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between text-xs text-amber-200">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>James&apos;s Secret Preview Active</strong> (Password Verified)
              </span>
            </div>
            <button
              onClick={handleExitPreview}
              className="text-[11px] underline text-amber-300 hover:text-white cursor-pointer ml-2"
            >
              Exit Preview (Test Lock)
            </button>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6 flex-1">
          {/* ======================================================== */}
          {/* SCENARIO 1: LOCKED STATE (Before Oct 26 & Not in Preview) */}
          {/* ======================================================== */}
          {!isSurpriseUnlocked ? (
            <div className="text-center space-y-5 py-2 sm:py-4">
              {/* Sealed Lantern Visual Representation */}
              <div className="relative w-44 h-56 mx-auto flex items-center justify-center">
                {/* Lantern Body */}
                <div className="w-36 h-48 rounded-2xl bg-gradient-to-b from-amber-200 via-orange-300 to-amber-600 p-1 shadow-[0_0_35px_rgba(245,158,11,0.5)] border-2 border-amber-400 relative overflow-hidden flex flex-col justify-between items-center text-center animate-pulse">
                  {/* Paper Lantern Ribs / Texture */}
                  <div className="absolute inset-0 opacity-25 bg-[repeating-linear-gradient(0deg,transparent,transparent_14px,rgba(0,0,0,0.3)_15px)] pointer-events-none" />
                  
                  {/* Top Rim */}
                  <div className="w-20 h-2 bg-amber-800 rounded-full mt-1.5 shadow-inner" />

                  {/* Inner Warm Flame Glow */}
                  <div className="w-12 h-16 rounded-full bg-yellow-100 shadow-[0_0_25px_#fef08a] blur-[2px] animate-bounce" />

                  {/* Bottom Rim */}
                  <div className="w-20 h-2 bg-amber-800 rounded-full mb-1.5 shadow-inner" />
                </div>

                {/* Satin Silk Red Ribbon & Wax Padlock Seal */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {/* Horizontal ribbon band */}
                  <div className="absolute w-44 h-7 bg-gradient-to-r from-rose-700 via-rose-600 to-rose-700 shadow-md border-y border-rose-400 flex items-center justify-center" />
                  
                  {/* Wax Seal Badge with Lock */}
                  <div className="relative z-10 w-14 h-14 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 border-2 border-amber-200 shadow-xl flex items-center justify-center text-stone-900">
                    <Lock className="w-6 h-6 stroke-[2.5]" />
                  </div>
                </div>

                {/* Hanging Tag */}
                <div className="absolute -bottom-4 bg-stone-900/90 border border-amber-400/50 rounded-lg px-2.5 py-1 text-[11px] font-serif text-amber-200 shadow-lg whitespace-nowrap">
                  For {config.partner2 || 'Loraine'} ♥
                </div>
              </div>

              {/* Title & Romantic Teaser */}
              <div className="max-w-md mx-auto space-y-1.5 pt-2">
                <span className="text-xs uppercase tracking-widest font-semibold text-amber-400 flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Sealed Anniversary Surprise</span>
                  <Sparkles className="w-3.5 h-3.5" />
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-amber-100">
                  Ready to Ascend on October 26
                </h3>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                  A sky lantern is floating peacefully, waiting for your official anniversary day to arrive in Saskatoon, Canada. Once the clock strikes October 26, the ribbon will untie and reveal James&apos;s special secret letter.
                </p>
              </div>

              {/* Real-time Countdown Box (Saskatoon America/Regina time) */}
              <div className="bg-stone-900/80 border border-amber-500/30 rounded-2xl p-4 sm:p-5 max-w-lg mx-auto shadow-inner">
                <div className="flex items-center justify-between text-xs text-amber-300/80 mb-3 border-b border-stone-800 pb-2">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Countdown to October 26</span>
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[11px] text-amber-200/90">
                    <MapPin className="w-3 h-3 text-red-400" />
                    <span>Saskatoon, SK (CST)</span>
                  </span>
                </div>

                {/* 4 Digital Timer Blocks */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-stone-950/70 border border-amber-500/20 rounded-xl p-2 sm:p-2.5">
                    <div className="text-2xl sm:text-3xl font-serif font-bold text-amber-100 tabular-nums">
                      {saskatoonInfo.daysRemaining}
                    </div>
                    <div className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold mt-0.5">
                      Days
                    </div>
                  </div>

                  <div className="bg-stone-950/70 border border-amber-500/20 rounded-xl p-2 sm:p-2.5">
                    <div className="text-2xl sm:text-3xl font-serif font-bold text-amber-100 tabular-nums">
                      {String(saskatoonInfo.hoursRemaining).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold mt-0.5">
                      Hours
                    </div>
                  </div>

                  <div className="bg-stone-950/70 border border-amber-500/20 rounded-xl p-2 sm:p-2.5">
                    <div className="text-2xl sm:text-3xl font-serif font-bold text-amber-100 tabular-nums">
                      {String(saskatoonInfo.minutesRemaining).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold mt-0.5">
                      Mins
                    </div>
                  </div>

                  <div className="bg-stone-950/70 border border-amber-500/20 rounded-xl p-2 sm:p-2.5">
                    <div className="text-2xl sm:text-3xl font-serif font-bold text-amber-400 tabular-nums">
                      {String(saskatoonInfo.secondsRemaining).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] text-amber-400/80 uppercase tracking-wider font-semibold mt-0.5">
                      Secs
                    </div>
                  </div>
                </div>

                {/* Live Saskatoon Local Time Pill */}
                <div className="mt-3 pt-2 text-[11px] text-stone-400 flex items-center justify-center gap-1.5 flex-wrap">
                  <span>Current Saskatoon Local Time:</span>
                  <span className="font-mono text-amber-300 font-semibold">
                    {saskatoonInfo.formattedSaskatoonTime}
                  </span>
                </div>
              </div>

              {/* James Secret Password Prompt Access */}
              <div className="pt-3 border-t border-stone-800 max-w-sm mx-auto">
                {!showPasswordModal ? (
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="inline-flex items-center gap-2 text-xs text-amber-300/80 hover:text-amber-200 transition-colors p-2 rounded-xl hover:bg-stone-800/50 cursor-pointer"
                  >
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    <span>Are you James? Enter password to preview &rarr;</span>
                  </button>
                ) : (
                  <form onSubmit={handlePasswordSubmit} className="space-y-2.5 text-left bg-stone-950/90 border border-amber-500/40 p-3.5 rounded-2xl shadow-xl">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-amber-200 flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-amber-400" />
                        <span>James&apos;s Secret Password</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setShowPasswordModal(false);
                          setPasswordError('');
                        }}
                        className="text-stone-400 hover:text-stone-200 text-xs"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type="password"
                        placeholder="Enter password..."
                        value={passwordInput}
                        onChange={(e) => {
                          setPasswordInput(e.target.value);
                          if (passwordError) setPasswordError('');
                        }}
                        className="w-full px-3 py-2 bg-stone-900 border border-amber-500/30 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
                        autoFocus
                      />
                    </div>

                    {passwordError && (
                      <p className="text-[11px] text-rose-400 font-medium">
                        {passwordError}
                      </p>
                    )}

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="submit"
                        className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer"
                      >
                        Unlock James&apos;s Preview
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          ) : (
            /* ======================================================== */
            /* SCENARIO 2: UNLOCKED / PREVIEW MODE                     */
            /* ======================================================== */
            <div className="space-y-6">
              {/* STAGE A: LANTERN READY TO BE RELEASED */}
              {lanternStage === 'idle' && (
                <div className="text-center space-y-6 py-4">
                  {/* Tangled Yi Peng Glowing Floating Lantern Visual */}
                  <div className="relative w-52 h-64 mx-auto flex items-center justify-center">
                    {/* Pulsing Aura */}
                    <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-2xl animate-pulse" />

                    {/* The 3D-styled Lantern */}
                    <div 
                      onClick={handleReleaseLantern}
                      className="group cursor-pointer w-40 h-56 rounded-2xl bg-gradient-to-b from-amber-100 via-amber-300 to-orange-500 p-1.5 shadow-[0_0_50px_rgba(251,191,36,0.7)] border-2 border-amber-300 relative overflow-hidden flex flex-col justify-between items-center text-center transition-transform hover:scale-105 active:scale-95 duration-300"
                    >
                      {/* Paper Texture Lines */}
                      <div className="absolute inset-0 opacity-25 bg-[repeating-linear-gradient(0deg,transparent,transparent_16px,rgba(0,0,0,0.25)_17px)] pointer-events-none" />

                      {/* Top Bamboo Rim */}
                      <div className="w-24 h-2.5 bg-amber-900 rounded-full mt-2 shadow-inner" />

                      {/* Dancing Warm Hearth Flame */}
                      <div className="relative flex flex-col items-center">
                        <div className="w-16 h-20 rounded-full bg-gradient-to-t from-yellow-200 via-amber-100 to-white shadow-[0_0_30px_#fef08a] blur-[2px] animate-pulse" />
                        <span className="font-serif text-[11px] font-bold text-stone-900 mt-2 tracking-wide px-2 py-0.5 rounded-full bg-white/70 shadow-xs">
                          {config.partner1 || 'James'} ♥ {config.partner2 || 'Loraine'}
                        </span>
                      </div>

                      {/* Bottom Bamboo Rim */}
                      <div className="w-24 h-2.5 bg-amber-900 rounded-full mb-2 shadow-inner" />
                    </div>

                    {/* Untie Ribbon Tag */}
                    <div 
                      onClick={handleReleaseLantern}
                      className="absolute -bottom-3 z-20 cursor-pointer bg-gradient-to-r from-rose-600 to-rose-500 text-white font-serif text-xs font-semibold px-4 py-1.5 rounded-full shadow-lg border border-rose-300 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Tap to Untie &amp; Release</span>
                    </div>
                  </div>

                  {/* Header & Launch Instructions */}
                  <div className="max-w-md mx-auto space-y-2">
                    <h3 className="text-2xl sm:text-3xl font-serif font-bold text-amber-100">
                      Release Our Anniversary Lantern
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                      Lighting the sky for <strong className="text-amber-200">{config.partner2 || 'Loraine'}</strong>. Tap the lantern or the button below to untie the ribbon and let it soar into the living skies of Saskatchewan.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleReleaseLantern}
                      className="px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-stone-950 text-sm font-bold shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 active:scale-95 transition-all cursor-pointer inline-flex items-center gap-2"
                    >
                      <span>🏮 Release Lantern Into The Living Skies</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STAGE B: LANTERN RELEASING & ASCENDING ANIMATION */}
              {lanternStage === 'releasing' && (
                <div className="text-center py-16 space-y-6 animate-fade-in">
                  <div className="relative w-44 h-56 mx-auto flex items-center justify-center">
                    {/* Ascending Lantern */}
                    <div className="w-32 h-44 rounded-2xl bg-gradient-to-b from-amber-100 via-amber-300 to-orange-500 p-1 shadow-[0_0_60px_rgba(251,191,36,0.9)] border-2 border-amber-300 flex flex-col justify-between items-center text-center animate-lantern-ascend">
                      <div className="w-20 h-2 bg-amber-900 rounded-full mt-2" />
                      <div className="w-14 h-16 rounded-full bg-yellow-100 shadow-[0_0_25px_#fef08a] blur-[2px] animate-ping" />
                      <div className="w-20 h-2 bg-amber-900 rounded-full mb-2" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="font-serif text-lg text-amber-200 animate-pulse">
                      The lantern is taking flight into the starlight...
                    </p>
                    <p className="text-xs text-amber-300/70 font-mono">
                      Carrying our heartfelt memories from 2016 to forever
                    </p>
                  </div>
                </div>
              )}

              {/* STAGE C: PARCHMENT LOVE LETTER UNROLLED IN STARLIGHT */}
              {lanternStage === 'letter' && (
                <div className="space-y-5 animate-fade-in">
                  {/* Top celebration indicator */}
                  <div className="flex items-center justify-between text-xs text-amber-300/90 border-b border-amber-500/20 pb-2">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Anniversary Sky Lantern Unlocked</span>
                    </span>
                    <button
                      onClick={handleRelightLantern}
                      className="flex items-center gap-1 text-[11px] text-amber-300 hover:text-white underline cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Relight Lantern</span>
                    </button>
                  </div>

                  {/* Sacred Unrolled Parchment Scroll */}
                  <div className="relative rounded-3xl bg-gradient-to-b from-[#fbf4e6] via-[#faf0dc] to-[#f4e4c1] text-stone-900 p-6 sm:p-8 md:p-10 shadow-2xl border-4 border-[#d4af37]/60 overflow-hidden">
                    {/* Antique scroll corner accents */}
                    <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-[#b8860b]" />
                    <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-[#b8860b]" />
                    <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-[#b8860b]" />
                    <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-[#b8860b]" />

                    {/* Scroll Content */}
                    {!isEditingLetter ? (
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="text-center border-b border-[#d4af37]/40 pb-4">
                          <span className="text-[10px] sm:text-xs font-serif uppercase tracking-widest text-[#8b5a2b] font-bold block mb-1">
                            ✦ Our Official Anniversary · October 26 ✦
                          </span>
                          <h3 className="text-xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
                            {letterTitle || `To My Dearest ${config.partner2}, Happy Anniversary!`}
                          </h3>
                          <div className="flex items-center justify-center gap-2 text-xs text-[#8b5a2b] mt-1.5 font-serif italic">
                            <span>Met: June 15, 2016</span>
                            <span>•</span>
                            <span>Official: October 26, 2022</span>
                            <span>•</span>
                            <span>Forever &amp; Always</span>
                          </div>
                        </div>

                        {/* Letter Body */}
                        <div className="text-stone-800 font-serif text-sm sm:text-base leading-relaxed sm:leading-loose whitespace-pre-line py-2">
                          {letterBody || defaultLetter.message}
                        </div>

                        {/* Wax Seal Stamp */}
                        <div className="flex items-center justify-between pt-4 border-t border-[#d4af37]/40 text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-800 to-rose-600 text-amber-200 border-2 border-amber-300 shadow-md flex items-center justify-center font-serif font-bold text-sm">
                              ♥
                            </div>
                            <div>
                              <span className="font-serif font-bold block text-stone-900">
                                Sealed with Eternal Love
                              </span>
                              <span className="text-[11px] text-[#8b5a2b] block">
                                Canada / Saskatoon · Oct 26
                              </span>
                            </div>
                          </div>

                          {isPreview && (
                            <button
                              onClick={() => setIsEditingLetter(true)}
                              className="px-3 py-1.5 rounded-full bg-[#ebd7af] hover:bg-[#dfc495] text-stone-900 text-xs font-semibold flex items-center gap-1.5 border border-[#c4a05a] cursor-pointer transition-all active:scale-95"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit My Letter</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Inline Letter Editor for James */
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-[#d4af37]/40 pb-2">
                          <h4 className="font-serif font-bold text-base text-stone-900 flex items-center gap-1.5">
                            <Edit3 className="w-4 h-4 text-[#8b5a2b]" />
                            <span>Edit Your Anniversary Letter to {config.partner2}</span>
                          </h4>
                          <button
                            onClick={() => setIsEditingLetter(false)}
                            className="text-xs text-stone-600 hover:text-stone-900 underline"
                          >
                            Cancel
                          </button>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                              Letter Title / Salutation
                            </label>
                            <input
                              type="text"
                              value={letterTitle}
                              onChange={(e) => setLetterTitle(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-white/90 border border-[#c4a05a] text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#8b5a2b]"
                              placeholder={`To My Dearest ${config.partner2}...`}
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                              Your Personal Message &amp; Vows
                            </label>
                            <textarea
                              rows={8}
                              value={letterBody}
                              onChange={(e) => setLetterBody(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-white/90 border border-[#c4a05a] text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#8b5a2b] font-serif leading-relaxed"
                              placeholder="Write your personal anniversary message..."
                            />
                          </div>

                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setIsEditingLetter(false)}
                              className="px-4 py-2 rounded-xl border border-stone-400 text-stone-700 text-xs font-semibold hover:bg-stone-200 transition-colors"
                            >
                              Discard
                            </button>
                            <button
                              type="button"
                              onClick={handleSaveCustomLetter}
                              disabled={isSavingLetter}
                              className="px-5 py-2 rounded-xl bg-[#8b5a2b] hover:bg-[#6e4620] text-white text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                            >
                              {isSavingLetter ? 'Saving...' : 'Save Letter'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {saveSuccess && (
                    <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs flex items-center justify-center gap-1.5 animate-fade-in">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Letter saved permanently for our October 26 anniversary!</span>
                    </div>
                  )}

                  {/* Romantic Interactive Actions */}
                  <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 pt-2">
                    <button
                      onClick={handleToast}
                      className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-xs font-bold shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Wine className="w-4 h-4" />
                      <span>Anniversary Toast 🥂</span>
                    </button>

                    <button
                      onClick={handleRelightLantern}
                      className="px-5 py-2.5 rounded-full bg-stone-800 hover:bg-stone-700 text-amber-200 border border-amber-500/30 text-xs font-semibold active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Relight Lantern 🏮</span>
                    </button>

                    <button
                      onClick={onClose}
                      className="px-5 py-2.5 rounded-full bg-stone-800/60 hover:bg-stone-800 text-stone-300 text-xs font-semibold border border-stone-700 active:scale-95 transition-all cursor-pointer"
                    >
                      <span>Close to Album</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
