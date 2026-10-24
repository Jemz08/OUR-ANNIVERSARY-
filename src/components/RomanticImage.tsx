import React, { useState } from 'react';
import { Heart } from 'lucide-react';

interface RomanticImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
  fallbackSubtitle?: string;
}

export const RomanticImage: React.FC<RomanticImageProps> = ({
  src,
  alt,
  className = '',
  fallbackTitle = 'Cherished Keepsake',
  fallbackSubtitle = 'James & Loraine · 2022 – 2026',
}) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center bg-gradient-to-br from-[#4A1025] via-[#270812] to-[#1A050B] border border-[#D8B16D]/35 p-6 text-center overflow-hidden ${className}`}
        role="img"
        aria-label={alt}
      >
        <div className="w-12 h-12 rounded-full border border-[#D8B16D]/50 flex items-center justify-center mb-3 bg-[#D8B16D]/10">
          <Heart className="w-5 h-5 text-[#D8B16D]" />
        </div>
        <p className="font-serif-editorial text-lg text-[#FFF7F0] tracking-wide">
          {fallbackTitle}
        </p>
        <p className="text-xs text-[#D8B16D] mt-1 tracking-widest uppercase">
          {fallbackSubtitle}
        </p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
};
