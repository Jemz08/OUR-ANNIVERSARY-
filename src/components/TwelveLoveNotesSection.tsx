import React, { useState } from 'react';
import { Mail, MailOpen, RotateCcw, Heart } from 'lucide-react';
import { LoveNote } from '../data/loveStoryData';
import { toggleOpenedNoteIds } from '../utils/storyLogic';

interface TwelveLoveNotesSectionProps {
  notes: LoveNote[];
  openedNoteIds: number[];
  isGiftMode?: boolean;
  onRecordOpenedNote: (nextOpenedIds: number[]) => void;
  onUpdateNoteMessage?: (noteId: number, newMessage: string) => void;
}

export const TwelveLoveNotesSection: React.FC<TwelveLoveNotesSectionProps> = ({
  notes,
  openedNoteIds,
  onRecordOpenedNote,
}) => {
  const [activeNoteIds, setActiveNoteIds] = useState<number[]>([]);

  const handleOpenNote = (noteId: number) => {
    if (!activeNoteIds.includes(noteId)) {
      setActiveNoteIds((prev) => [...prev, noteId]);
    }
    onRecordOpenedNote(toggleOpenedNoteIds(openedNoteIds, noteId));
  };

  const handleFoldNote = (noteId: number) => {
    setActiveNoteIds((prev) => prev.filter((id) => id !== noteId));
  };

  return (
    <section
      id="twelve-love-notes"
      aria-labelledby="twelve-notes-heading"
      className="py-20 md:py-28 px-6 max-w-6xl mx-auto border-t border-[#D8B16D]/20"
    >
      <div className="text-center max-w-3xl mx-auto mb-14">
        <p className="text-xs tracking-[0.25em] uppercase text-[#D8B16D] mb-2">
          Section Seven · Twelve Little Love Notes
        </p>
        <h2
          id="twelve-notes-heading"
          className="font-serif-editorial text-4xl sm:text-5xl text-[#FFF7F0] mb-4"
          style={{ textWrap: 'balance' }}
        >
          Baby, Here Are a Few Things I Never Want You to Forget
        </h2>
        <p className="text-sm sm:text-base text-[#F1D6DC]/85 leading-relaxed mb-4">
          Twelve folded envelopes, each holding a reminder of how much you mean
          to me. Open them in any order whenever you want a piece of my heart.
        </p>
        <div className="inline-flex items-center gap-2 text-xs text-[#D8B16D] font-mono-tabular">
          <Heart className="w-3.5 h-3.5" />
          <span>
            {openedNoteIds.length} of {notes.length} Love Notes Opened
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map((note) => {
          const isOpen = activeNoteIds.includes(note.id);
          const hasBeenRead = openedNoteIds.includes(note.id);

          return (
            <article
              key={note.id}
              className={`rounded-2xl border transition-all duration-200 flex flex-col justify-between p-6 ${
                isOpen
                  ? 'ivory-paper border-[#D8B16D] shadow-[0_18px_45px_rgba(0,0,0,0.45)]'
                  : 'bg-[#4A1025]/45 hover:bg-[#4A1025]/65 border-[#D8B16D]/35 shadow-[0_10px_28px_rgba(0,0,0,0.3)]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span
                    className={`font-mono-tabular text-xs tracking-widest uppercase ${
                      isOpen ? 'text-[#4A1025]' : 'text-[#D8B16D]'
                    }`}
                  >
                    Note {String(note.id).padStart(2, '0')}
                  </span>

                  <div className="flex items-center gap-1.5 text-xs">
                    {isOpen ? (
                      <span className="inline-flex items-center gap-1 text-[#4A1025] font-medium">
                        <MailOpen className="w-3.5 h-3.5" />
                        <span>Opened</span>
                      </span>
                    ) : hasBeenRead ? (
                      <span className="inline-flex items-center gap-1 text-[#D8B16D]">
                        <MailOpen className="w-3.5 h-3.5" />
                        <span>Read</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[#F1D6DC]/75">
                        <Mail className="w-3.5 h-3.5 text-[#D8B16D]" />
                        <span>Sealed</span>
                      </span>
                    )}
                  </div>
                </div>

                <h3
                  className={`font-serif-editorial text-2xl leading-snug mb-4 ${
                    isOpen ? 'text-[#270812] font-semibold' : 'text-[#FFF7F0]'
                  }`}
                >
                  {note.theme}
                </h3>

                {isOpen ? (
                  <div className="mt-3 pt-4 border-t border-[#4A1025]/15">
                    <p className="font-serif-editorial italic text-lg sm:text-xl text-[#270812] leading-relaxed">
                      “{note.message}”
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-[#F1D6DC]/75 italic">
                    {hasBeenRead
                      ? 'You have read this note. Click below whenever you want to read it again, Baby.'
                      : 'A sealed note (From Me to You), waiting to be opened.'}
                  </p>
                )}
              </div>

              <div className="mt-6 pt-3 border-t border-[#D8B16D]/20 flex items-center justify-between gap-2">
                {isOpen ? (
                  <>
                    <span className="text-xs text-[#4A1025]/70 italic">
                      With love, James <span className="font-sans">♥</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleFoldNote(note.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#4A1025]/10 hover:bg-[#4A1025]/20 text-xs text-[#4A1025] font-medium cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Fold Note</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleOpenNote(note.id)}
                    aria-label={
                      hasBeenRead
                        ? `Read Again Note ${note.id}: ${note.theme}`
                        : `Open Love Note ${note.id}: ${note.theme}`
                    }
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#270812]/80 hover:bg-[#D8B16D] text-[#FFF7F0] hover:text-[#270812] border border-[#D8B16D]/50 text-xs font-medium transition-colors cursor-pointer"
                  >
                    <MailOpen className="w-3.5 h-3.5" />
                    <span>
                      {hasBeenRead ? 'Read Again ♥' : 'Open Love Note ♥'}
                    </span>
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
