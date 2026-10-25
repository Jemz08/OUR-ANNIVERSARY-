import React, { useState } from 'react';
import { Gift, Image as ImageIcon, HeartHandshake, Sparkles, X } from 'lucide-react';
import { GalleryPhoto, LoveStoryContent } from '../data/loveStoryData';
import { RomanticImage } from './RomanticImage';

interface DigitalGiftsSectionProps {
  gifts: LoveStoryContent['digitalGifts'];
  mainPhoto?: GalleryPhoto;
  isGiftMode?: boolean;
  onUpdateGifts?: (
    updater: (
      prev: LoveStoryContent['digitalGifts']
    ) => LoveStoryContent['digitalGifts']
  ) => void;
}

export const DigitalGiftsSection: React.FC<DigitalGiftsSectionProps> = ({
  gifts,
  mainPhoto,
}) => {
  const [openedGifts, setOpenedGifts] = useState<{
    gift1Lightbox: boolean;
    gift2Open: boolean;
    gift3Open: boolean;
  }>({
    gift1Lightbox: false,
    gift2Open: false,
    gift3Open: false,
  });

  return (
    <section
      id="digital-gifts"
      aria-labelledby="digital-gifts-heading"
      className="py-20 md:py-28 px-6 max-w-6xl mx-auto border-t border-[#D8B16D]/20"
    >
      <div className="text-center max-w-2xl mx-auto mb-14">
        <p className="text-xs tracking-[0.25em] uppercase text-[#D8B16D] mb-2">
          Section Nine · Three Keepsake Presents
        </p>
        <h2
          id="digital-gifts-heading"
          className="font-serif-editorial text-4xl sm:text-5xl text-[#FFF7F0] mb-3"
          style={{ textWrap: 'balance' }}
        >
          A Little Digital Gift for You, Baby
        </h2>
        <p className="text-sm sm:text-base text-[#F1D6DC]/85 leading-relaxed">
          Three small keepsakes to carry with you after reading my letter—a
          memory to keep, a promise to remember, and a wish for our next
          chapter.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* GIFT ONE: A MEMORY TO KEEP */}
        <article className="rounded-2xl p-7 bg-[#4A1025]/45 border border-[#D8B16D]/40 flex flex-col justify-between shadow-[0_16px_40px_rgba(0,0,0,0.4)]">
          <div>
            <div className="flex items-center justify-between gap-2 text-xs uppercase tracking-widest text-[#D8B16D] mb-4">
              <span>Gift One</span>
              <ImageIcon className="w-4 h-4" />
            </div>
            <h3 className="font-serif-editorial text-3xl text-[#FFF7F0] mb-2">
              A Memory to Keep
            </h3>
            <p className="text-sm text-[#F1D6DC]/85 leading-relaxed mb-5">
              Our selected favorite photo together, framed in a full-screen
              keepsake view with a personal note (From Me to You).
            </p>

            {mainPhoto && (
              <div className="rounded-xl overflow-hidden aspect-[4/3] border border-[#D8B16D]/50 mb-4 bg-[#270812]">
                <RomanticImage
                  src={mainPhoto.imageUrl}
                  alt={mainPhoto.caption}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="mb-4">
              <p className="font-serif-editorial italic text-base text-[#FFF7F0]/90">
                “{gifts.memoryToKeepCaption}”
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setOpenedGifts((prev) => ({ ...prev, gift1Lightbox: true }))
            }
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#D8B16D] hover:bg-[#E5C17E] text-[#270812] text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
          >
            <Gift className="w-4 h-4" />
            <span>Open Full-Screen Keepsake ♥</span>
          </button>
        </article>

        {/* GIFT TWO: A PROMISE TO REMEMBER */}
        <article className="rounded-2xl p-7 bg-[#4A1025]/45 border border-[#D8B16D]/40 flex flex-col justify-between shadow-[0_16px_40px_rgba(0,0,0,0.4)]">
          <div>
            <div className="flex items-center justify-between gap-2 text-xs uppercase tracking-widest text-[#D8B16D] mb-4">
              <span>Gift Two</span>
              <HeartHandshake className="w-4 h-4" />
            </div>
            <h3 className="font-serif-editorial text-3xl text-[#FFF7F0] mb-2">
              A Promise to Remember
            </h3>
            <p className="text-sm text-[#F1D6DC]/85 leading-relaxed mb-5">
              A grounded, honest commitment to continue listening,
              communicating, appreciating one another, and making time for us.
            </p>

            {openedGifts.gift2Open && (
              <div className="p-5 rounded-xl ivory-paper border border-[#D8B16D] mb-5">
                <p className="font-serif-editorial italic text-xl text-[#270812] leading-relaxed">
                  “{gifts.promiseToRememberMessage}”
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              setOpenedGifts((prev) => ({
                ...prev,
                gift2Open: !prev.gift2Open,
              }))
            }
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#D8B16D] hover:bg-[#E5C17E] text-[#270812] text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
          >
            <Gift className="w-4 h-4" />
            <span>
              {openedGifts.gift2Open
                ? 'Hide Promise Card'
                : 'Reveal My Promise ♥'}
            </span>
          </button>
        </article>

        {/* GIFT THREE: A WISH FOR OUR NEXT CHAPTER */}
        <article className="rounded-2xl p-7 bg-[#4A1025]/45 border border-[#D8B16D]/40 flex flex-col justify-between shadow-[0_16px_40px_rgba(0,0,0,0.4)]">
          <div>
            <div className="flex items-center justify-between gap-2 text-xs uppercase tracking-widest text-[#D8B16D] mb-4">
              <span>Gift Three</span>
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-serif-editorial text-3xl text-[#FFF7F0] mb-2">
              A Wish for Our Next Chapter
            </h3>
            <p className="text-sm text-[#F1D6DC]/85 leading-relaxed mb-5">
              A warm wish for our future together, and a dream I cannot wait to
              share with you next.
            </p>

            {openedGifts.gift3Open && (
              <div className="p-5 rounded-xl ivory-paper border border-[#D8B16D] mb-5 space-y-3">
                <p className="font-serif-editorial text-lg text-[#270812] leading-relaxed">
                  {gifts.wishForNextChapterIntro}
                </p>

                <div className="p-3.5 rounded-lg bg-[#4A1025]/[0.07] border border-[#4A1025]/25">
                  <p className="font-serif-editorial italic text-lg text-[#4A1025] font-semibold">
                    “{gifts.wishForNextChapterPlaceholder}”
                  </p>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              setOpenedGifts((prev) => ({
                ...prev,
                gift3Open: !prev.gift3Open,
              }))
            }
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#D8B16D] hover:bg-[#E5C17E] text-[#270812] text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
          >
            <Gift className="w-4 h-4" />
            <span>
              {openedGifts.gift3Open
                ? 'Hide Future Wish'
                : 'Unwrap Future Wish ♥'}
            </span>
          </button>
        </article>
      </div>

      {openedGifts.gift1Lightbox && mainPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Gift One: A Memory to Keep Full-Screen Lightbox"
          className="fixed inset-0 z-50 bg-[#140309]/95 backdrop-blur-md flex flex-col justify-between p-6 sm:p-10"
        >
          <div className="flex items-center justify-between max-w-5xl w-full mx-auto">
            <span className="text-xs uppercase tracking-[0.25em] text-[#D8B16D]">
              Gift One · A Memory to Keep Forever
            </span>
            <button
              type="button"
              onClick={() =>
                setOpenedGifts((prev) => ({ ...prev, gift1Lightbox: false }))
              }
              aria-label="Close Gift One lightbox"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#4A1025] border border-[#D8B16D] text-xs text-[#FFF7F0] cursor-pointer"
            >
              <span>Close</span>
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="my-auto max-w-4xl w-full mx-auto text-center space-y-6">
            <div className="p-3 sm:p-5 rounded-2xl bg-[#270812] border-2 border-[#D8B16D] inline-block shadow-[0_25px_70px_rgba(0,0,0,0.85)]">
              <RomanticImage
                src={mainPhoto.imageUrl}
                alt={mainPhoto.caption}
                className="max-h-[60vh] w-auto rounded-xl object-contain"
              />
            </div>
            <p className="font-serif-editorial italic text-2xl sm:text-3xl text-[#FFF7F0] max-w-2xl mx-auto leading-relaxed">
              “{gifts.memoryToKeepCaption}”
            </p>
          </div>

          <div className="text-center text-xs text-[#D8B16D]/80">
            October 26, 2022 — October 26, 2026 · James &amp; Loraine
          </div>
        </div>
      )}
    </section>
  );
};
