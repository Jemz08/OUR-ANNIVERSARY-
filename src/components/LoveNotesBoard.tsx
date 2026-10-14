import React, { useState, useEffect } from 'react';
import { Heart, Trash2, Send, Sparkles, Check, Smile, User } from 'lucide-react';
import { LoveNote, CoupleConfig } from '../types';
import { formatDatePretty } from '../utils/dateCalculations';

interface LoveNotesBoardProps {
  config: CoupleConfig;
  currentUserName?: string;
  notes: LoveNote[];
  onAddNote: (note: { author: string; text: string }) => Promise<void>;
  onDeleteNote: (id: string) => Promise<void>;
}

const QUICK_ROMANTIC_PROMPTS = [
  'I love you so much, more than words can say! ❤️',
  'Counting down every single second to October 26! 🥂',
  'You make my whole world brighter every single day ✨',
  'Thank you for loving me so gently and making me laugh 🥰',
  'You are my favorite person, forever and always ♾️',
  'Can’t wait for our next date together! 🌹',
];

export const LoveNotesBoard: React.FC<LoveNotesBoardProps> = ({
  config,
  currentUserName,
  notes,
  onAddNote,
  onDeleteNote,
}) => {
  const [authorMode, setAuthorMode] = useState<'p1' | 'p2' | 'custom'>('p1');
  const [customAuthor, setCustomAuthor] = useState<string>('');
  const [author, setAuthor] = useState<string>(currentUserName || config.partner1 || 'James');
  const [text, setText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Sync author when currentUserName or config changes
  useEffect(() => {
    if (currentUserName) {
      if (currentUserName === config.partner2) {
        setAuthorMode('p2');
        setAuthor(config.partner2);
      } else if (currentUserName === config.partner1) {
        setAuthorMode('p1');
        setAuthor(config.partner1);
      } else {
        setAuthorMode('custom');
        setCustomAuthor(currentUserName);
        setAuthor(currentUserName);
      }
    } else {
      setAuthor(config.partner1 || 'James');
    }
  }, [currentUserName, config.partner1, config.partner2]);

  const handleSelectMode = (mode: 'p1' | 'p2' | 'custom') => {
    setAuthorMode(mode);
    if (mode === 'p1') {
      setAuthor(config.partner1 || 'James');
    } else if (mode === 'p2') {
      setAuthor(config.partner2 || 'Loraine');
    } else {
      setAuthor(customAuthor.trim() || 'Secret Admirer');
    }
  };

  const handleCustomAuthorChange = (val: string) => {
    setCustomAuthor(val);
    setAuthor(val.trim() || 'My Love');
  };

  const handleInsertPrompt = (prompt: string) => {
    setText((prev) => (prev ? `${prev} ${prompt}` : prompt));
    setErrorMsg('');
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) {
      setErrorMsg('Please write a little note first 💕');
      return;
    }

    const finalAuthor =
      authorMode === 'custom'
        ? customAuthor.trim() || 'My Love'
        : authorMode === 'p2'
        ? config.partner2 || 'Loraine'
        : config.partner1 || 'James';

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await onAddNote({
        author: finalAuthor,
        text: trimmed,
      });
      setText('');
      setSuccessToast(`Note posted for ${finalAuthor === config.partner1 ? config.partner2 : config.partner1}! 💌`);
      setTimeout(() => setSuccessToast(''), 3500);
    } catch (err) {
      console.error('Error posting note:', err);
      setErrorMsg('Could not save note. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDeleteNote(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="py-4 sm:py-8 md:py-10 max-w-4xl mx-auto px-3 sm:px-6 md:px-8">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-6 sm:mb-8">
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#fb6f92] uppercase tracking-widest mb-1 sm:mb-1.5">
          <Heart className="w-3.5 h-3.5 fill-[#fb6f92]" />
          <span>Sweet Little Reminders</span>
          <span aria-hidden="true" className="text-[#ffc2d1]">·</span>
          <span>Shared Love Board</span>
        </div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-stone-900 tracking-tight">
          Love Notes &amp; Forever Promises
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-md mx-auto">
          Leave a sweet note for {config.partner2} or {config.partner1} to discover anytime they visit.
        </p>
      </div>

      {/* Note Composer Box */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[#ffc2d1] shadow-xs mb-6 sm:mb-8 transition-all hover:shadow-md">
        {successToast && (
          <div className="mb-4 p-3 rounded-xl bg-[#ffe5ec] border border-[#ffc2d1] text-xs font-semibold text-[#5c182b] flex items-center justify-between animate-fade-scale">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#fb6f92]" />
              <span>{successToast}</span>
            </div>
            <button
              onClick={() => setSuccessToast('')}
              className="text-stone-400 hover:text-stone-700 text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Author Selector Chips */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#fb6f92]" />
                <span>Writing as:</span>
              </label>
              <span className="text-[11px] text-[#fb6f92] font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Syncs immediately</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleSelectMode('p1')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer active:scale-95 ${
                  authorMode === 'p1'
                    ? 'bg-[#fb6f92] text-white shadow-xs shadow-[#fb6f92]/30 ring-2 ring-[#fb6f92]/20'
                    : 'bg-[#fff5f7] text-stone-700 border border-[#ffc2d1] hover:bg-[#ffe5ec]'
                }`}
              >
                {config.partner1 || 'James'}
              </button>

              <button
                type="button"
                onClick={() => handleSelectMode('p2')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer active:scale-95 ${
                  authorMode === 'p2'
                    ? 'bg-[#fb6f92] text-white shadow-xs shadow-[#fb6f92]/30 ring-2 ring-[#fb6f92]/20'
                    : 'bg-[#fff5f7] text-stone-700 border border-[#ffc2d1] hover:bg-[#ffe5ec]'
                }`}
              >
                {config.partner2 || 'Loraine'}
              </button>

              <button
                type="button"
                onClick={() => handleSelectMode('custom')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer active:scale-95 ${
                  authorMode === 'custom'
                    ? 'bg-[#fb6f92] text-white shadow-xs shadow-[#fb6f92]/30 ring-2 ring-[#fb6f92]/20'
                    : 'bg-[#fff5f7] text-stone-700 border border-[#ffc2d1] hover:bg-[#ffe5ec]'
                }`}
              >
                Custom Nickname...
              </button>
            </div>

            {authorMode === 'custom' && (
              <div className="mt-2.5">
                <input
                  type="text"
                  placeholder="Enter your nickname (e.g. Babe, My Love, Hubby)..."
                  value={customAuthor}
                  onChange={(e) => handleCustomAuthorChange(e.target.value)}
                  className="w-full sm:max-w-xs px-3 py-1.5 text-xs bg-[#fff9fa] border border-[#ffc2d1] rounded-xl text-stone-900 focus:outline-none focus:border-[#fb6f92] focus:ring-2 focus:ring-[#ff8fab]/20"
                />
              </div>
            )}
          </div>

          {/* Quick Note Inspo Chips */}
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-stone-500 mb-1.5">
              <Smile className="w-3 h-3 text-[#fb6f92]" />
              <span>Tap to add quick romantic thoughts:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_ROMANTIC_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleInsertPrompt(prompt)}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-[#fff5f7] hover:bg-[#ffe5ec] border border-[#ffc2d1] text-stone-700 hover:text-stone-900 transition-all cursor-pointer active:scale-95"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Message Textarea */}
          <div className="relative">
            <textarea
              rows={3}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              onKeyDown={handleKeyDown}
              placeholder={`Write something sweet for ${author === config.partner1 ? config.partner2 : config.partner1}...`}
              className="w-full p-3 sm:p-3.5 bg-[#fff9fa] border border-[#ffc2d1] rounded-xl sm:rounded-2xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#ff8fab]/20 focus:border-[#fb6f92] transition-all resize-none font-sans"
            />
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1">
            <span className="text-[11px] text-stone-400 hidden sm:inline">
              Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-stone-100 border text-[10px] text-stone-600 font-mono">Ctrl + Enter</kbd> to quickly post
            </span>

            <button
              type="submit"
              disabled={isSubmitting || !text.trim()}
              className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#fb6f92] hover:bg-[#e8557b] active:scale-95 text-white text-xs font-bold shadow-sm shadow-[#fb6f92]/20 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Posting Note...' : 'Leave Love Note'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Notes Grid */}
      {notes.length === 0 ? (
        <div className="text-center py-10 sm:py-14 bg-white rounded-2xl sm:rounded-3xl border border-[#ffc2d1] p-6 sm:p-8 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-[#ffe5ec] text-[#fb6f92] flex items-center justify-center mx-auto mb-3">
            <Heart className="w-6 h-6 fill-[#fb6f92]" />
          </div>
          <h3 className="font-serif text-lg font-bold text-stone-900">
            No love notes posted yet
          </h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Write the very first romantic note above for {config.partner2} or {config.partner1} to see!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4.5">
          {notes.map((note) => {
            const isJames = note.author === config.partner1;
            const isDeleting = deletingId === note.id;

            return (
              <div
                key={note.id}
                className={`relative rounded-2xl p-4 sm:p-5 border shadow-xs flex flex-col justify-between transition-all hover:shadow-md animate-fade-scale ${
                  isJames
                    ? 'bg-[#fff5f7] border-[#ffc2d1]'
                    : 'bg-[#ffe5ec]/40 border-[#ffb3c6]'
                } ${isDeleting ? 'opacity-40 pointer-events-none' : ''}`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-stone-500 mb-2.5">
                    <span className="font-serif font-bold text-stone-900 flex items-center gap-1.5">
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          isJames ? 'fill-[#fb6f92] text-[#fb6f92]' : 'fill-[#ff8fab] text-[#ff8fab]'
                        }`}
                      />
                      <span>From {note.author}</span>
                    </span>

                    <button
                      onClick={() => handleDelete(note.id)}
                      disabled={isDeleting}
                      className="text-stone-300 hover:text-rose-500 p-1.5 rounded-lg hover:bg-white transition-all cursor-pointer active:scale-90"
                      title="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-800 leading-relaxed whitespace-pre-wrap font-serif italic py-1 sm:py-2">
                    &ldquo;{note.text}&rdquo;
                  </p>
                </div>

                <div className="pt-2.5 sm:pt-3 border-t border-[#ffc2d1]/50 flex items-center justify-between text-[11px] text-stone-400">
                  <span className="font-handwritten text-sm text-[#fb6f92]">With all my love</span>
                  <span>{formatDatePretty(note.date)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
