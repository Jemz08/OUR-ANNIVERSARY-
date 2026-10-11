import React, { useState } from 'react';
import { Heart, Trash2, Send } from 'lucide-react';
import { LoveNote, CoupleConfig } from '../types';
import { formatDatePretty } from '../utils/dateCalculations';

interface LoveNotesBoardProps {
  config: CoupleConfig;
  currentUserName?: string;
  notes: LoveNote[];
  onAddNote: (note: { author: string; text: string }) => Promise<void>;
  onDeleteNote: (id: string) => Promise<void>;
}

export const LoveNotesBoard: React.FC<LoveNotesBoardProps> = ({
  config,
  currentUserName,
  notes,
  onAddNote,
  onDeleteNote,
}) => {
  const [author, setAuthor] = useState<string>(currentUserName || config.partner1);
  const [text, setText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  React.useEffect(() => {
    if (currentUserName) {
      setAuthor(currentUserName);
    }
  }, [currentUserName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddNote({
        author,
        text: text.trim(),
      });
      setText('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-4 sm:py-8 md:py-10 max-w-4xl mx-auto px-3 sm:px-6 md:px-8">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-6 sm:mb-8">
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#fb6f92] uppercase tracking-widest mb-1 sm:mb-1.5">
          <span>Sweet Little Reminders</span>
          <span aria-hidden="true" className="text-[#ffc2d1]">·</span>
          <span>Shared Notes</span>
        </div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-stone-900 tracking-tight">
          Love Notes &amp; Forever Promises
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Leave a sweet note for {config.partner2} or {config.partner1} to find when they open the app.
        </p>
      </div>

      {/* Note Composer Box */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[#ffc2d1] shadow-xs mb-6 sm:mb-8">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center justify-between text-xs font-medium text-stone-700">
            <label className="flex items-center gap-1.5">
              <span>Writing as:</span>
              <select
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="bg-[#fff9fa] border border-[#ffc2d1] rounded-lg px-2.5 py-1 text-xs text-stone-900 font-semibold focus:outline-none focus:border-[#fb6f92] cursor-pointer"
              >
                {currentUserName && currentUserName !== config.partner1 && currentUserName !== config.partner2 && (
                  <option value={currentUserName}>{currentUserName} (You)</option>
                )}
                <option value={config.partner1}>{config.partner1}</option>
                <option value={config.partner2}>{config.partner2}</option>
              </select>
            </label>
            <span className="text-[11px] text-[#fb6f92] font-medium">Syncs immediately</span>
          </div>

          <textarea
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Write something sweet for ${author === config.partner1 ? config.partner2 : config.partner1}...`}
            required
            className="w-full p-3 sm:p-3.5 bg-[#fff9fa] border border-[#ffc2d1] rounded-xl sm:rounded-2xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#ff8fab]/20 focus:border-[#fb6f92] transition-all resize-none"
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !text.trim()}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#fb6f92] hover:bg-[#e8557b] text-white text-xs font-semibold shadow-sm shadow-[#fb6f92]/20 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Posting...' : 'Leave Love Note'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Notes Grid: 1 col on mobile, 2 cols on md+ */}
      {notes.length === 0 ? (
        <div className="text-center py-10 sm:py-12 bg-white rounded-2xl sm:rounded-3xl border border-[#ffc2d1] p-6 sm:p-8">
          <Heart className="w-8 h-8 text-[#ffb3c6] mx-auto mb-2" />
          <h3 className="font-serif text-lg font-bold text-stone-900">
            No love notes yet
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            Be the first to leave a sweet note above!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {notes.map((note) => {
            const isJames = note.author === config.partner1;

            return (
              <div
                key={note.id}
                className={`relative rounded-2xl p-4 sm:p-5 border shadow-xs flex flex-col justify-between transition-all hover:shadow-md ${
                  isJames
                    ? 'bg-[#fff5f7] border-[#ffc2d1]'
                    : 'bg-[#ffe5ec]/40 border-[#ffb3c6]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                    <span className="font-serif font-bold text-stone-900 flex items-center gap-1.5">
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          isJames ? 'fill-[#fb6f92] text-[#fb6f92]' : 'fill-[#ff8fab] text-[#ff8fab]'
                        }`}
                      />
                      <span>From {note.author}</span>
                    </span>
                    <button
                      onClick={() => onDeleteNote(note.id)}
                      className="text-stone-300 hover:text-[#fb6f92] transition-colors p-1 cursor-pointer"
                      title="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed whitespace-pre-wrap font-serif italic py-1 sm:py-2">
                    &ldquo;{note.text}&rdquo;
                  </p>
                </div>

                <div className="pt-2.5 sm:pt-3 border-t border-[#ffc2d1]/50 text-[11px] text-stone-400 text-right">
                  {formatDatePretty(note.date)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
