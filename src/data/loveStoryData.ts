export type GalleryCategory =
  | 'My Favorite Memories of Us'
  | 'Your Smile, My Favorite View'
  | 'Little Moments, Big Feelings'
  | 'My Favorite Picture of You'
  | 'My Favorite Picture of Us';

export const GALLERY_CATEGORIES: GalleryCategory[] = [
  'My Favorite Memories of Us',
  'Your Smile, My Favorite View',
  'Little Moments, Big Feelings',
  'My Favorite Picture of You',
  'My Favorite Picture of Us',
];

export interface GalleryPhoto {
  id: string;
  category: GalleryCategory;
  imageUrl: string;
  caption: string;
  date?: string;
  memory?: string;
  isMainAnniversaryPhoto?: boolean;
  isPlaceholder?: boolean;
  rotationDeg: number;
}

export interface ChapterThreeMemory {
  id: string;
  label: string;
  title: string;
  date: string;
  story: string;
  imageUrl: string;
  isPlaceholder?: boolean;
}

export interface LoveNote {
  id: number;
  theme: string;
  message: string;
}

export interface DigitalGift {
  id: string;
  numberLabel: string;
  title: string;
  subtitle: string;
  content: string;
  customPlaceholder?: string;
}

export interface LoveStoryContent {
  groomName: string;
  brideName: string;
  nickname: string;
  firstMetDateText: string;
  officialAnniversaryDateText: string;
  fourthAnniversaryDateText: string;
  mainEmotionalMessage: string;
  chapterOne: {
    date: string;
    heading: string;
    quote: string;
    paragraphs: string[];
    imageUrl: string;
    imageCaption: string;
  };
  chapterTwo: {
    date: string;
    largeDateDisplay: string;
    heading: string;
    paragraphs: string[];
    imageUrl: string;
    imageCaption: string;
  };
  chapterThree: {
    heading: string;
    subtitle: string;
    memories: ChapterThreeMemory[];
  };
  chapterFour: {
    date: string;
    heading: string;
    paragraphs: string[];
    imageUrl: string;
    imageCaption: string;
  };
  chapterFive: {
    heading: string;
    paragraphs: string[];
    personalWishPlaceholder: string;
    closingLine: string;
  };
  galleryPhotos: GalleryPhoto[];
  thingsIMayNotSayEnoughLetter: {
    heading: string;
    salutation: string;
    requiredPassage: string;
    paragraphs: string[];
    customDetailPlaceholder: string;
    closingLines: string[];
    signature: string;
  };
  twelveLoveNotes: LoveNote[];
  sealedSurpriseLetter: {
    preRevealIntro: string;
    preRevealSubtext: string;
    buttonLabel: string;
    salutation: string;
    paragraphs: string[];
    closingHeadline: string;
    closingSubheadline: string;
    closingGratitudeLines: string[];
    closingSignOff: string;
    closingSignature: string;
    personalMessagePlaceholder: string;
  };
  digitalGifts: {
    memoryToKeepCaption: string;
    promiseToRememberMessage: string;
    wishForNextChapterIntro: string;
    wishForNextChapterPlaceholder: string;
  };
}

/**
 * Generates bespoke, high-resolution SVG romantic still-life artwork data URIs.
 */
function createRomanticArtworkDataUri(options: {
  title: string;
  subtitle: string;
  motif: 'teacups' | 'champagne' | 'letter' | 'lanterns' | 'locket' | 'constellation' | 'roses' | 'sunrise';
  bgStart?: string;
  bgEnd?: string;
}): string {
  const bgStart = options.bgStart || '#3B0C1D';
  const bgEnd = options.bgEnd || '#1B050C';

  let motifSvg = '';
  switch (options.motif) {
    case 'teacups':
      motifSvg = `
        <circle cx="400" cy="245" r="105" fill="none" stroke="#D8B16D" stroke-width="1" stroke-dasharray="4 6" opacity="0.45"/>
        <path d="M320 270 C320 300, 370 300, 370 270 L365 235 L325 235 Z" fill="none" stroke="#D8B16D" stroke-width="2"/>
        <path d="M370 245 C382 245, 382 262, 370 262" fill="none" stroke="#D8B16D" stroke-width="1.8"/>
        <path d="M425 270 C425 300, 475 300, 475 270 L470 235 L430 235 Z" fill="none" stroke="#F1D6DC" stroke-width="2"/>
        <path d="M475 245 C487 245, 487 262, 475 262" fill="none" stroke="#F1D6DC" stroke-width="1.8"/>
        <path d="M342 222 Q348 205 342 192" fill="none" stroke="#D8B16D" stroke-width="1.3" opacity="0.7"/>
        <path d="M448 222 Q454 205 448 192" fill="none" stroke="#F1D6DC" stroke-width="1.3" opacity="0.7"/>
        <path d="M398 208 C398 200, 386 196, 386 205 C386 213, 398 220, 398 225 C398 220, 410 213, 410 205 C410 196, 398 200, 398 208 Z" fill="#D8B16D" opacity="0.85"/>
      `;
      break;
    case 'champagne':
      motifSvg = `
        <circle cx="400" cy="240" r="112" fill="none" stroke="#D8B16D" stroke-width="1.2" opacity="0.4"/>
        <path d="M362 180 L372 245 C374 260, 350 260, 352 245 L362 180 Z" fill="none" stroke="#D8B16D" stroke-width="1.8"/>
        <line x1="362" y1="256" x2="362" y2="305" stroke="#D8B16D" stroke-width="1.8"/>
        <line x1="346" y1="305" x2="378" y2="305" stroke="#D8B16D" stroke-width="1.8"/>
        <path d="M438 180 L448 245 C450 260, 426 260, 428 245 L438 180 Z" fill="none" stroke="#F1D6DC" stroke-width="1.8"/>
        <line x1="438" y1="256" x2="438" y2="305" stroke="#F1D6DC" stroke-width="1.8"/>
        <line x1="422" y1="305" x2="454" y2="305" stroke="#F1D6DC" stroke-width="1.8"/>
        <circle cx="400" cy="195" r="4" fill="#D8B16D" opacity="0.9"/>
        <circle cx="390" cy="212" r="2.5" fill="#F1D6DC" opacity="0.7"/>
        <circle cx="412" cy="215" r="2.5" fill="#D8B16D" opacity="0.7"/>
      `;
      break;
    case 'letter':
      motifSvg = `
        <rect x="305" y="185" width="190" height="125" rx="6" fill="#FFF7F0" fill-opacity="0.08" stroke="#D8B16D" stroke-width="1.8"/>
        <path d="M305 188 L400 258 L495 188" fill="none" stroke="#D8B16D" stroke-width="1.6"/>
        <circle cx="400" cy="252" r="18" fill="#8C1D40" stroke="#D8B16D" stroke-width="1.5"/>
        <path d="M400 247 C400 242, 392 240, 392 246 C392 251, 400 256, 400 260 C400 256, 408 251, 408 246 C408 240, 400 242, 400 247 Z" fill="#D8B16D"/>
      `;
      break;
    case 'lanterns':
      motifSvg = `
        <circle cx="350" cy="235" r="42" fill="#D8B16D" fill-opacity="0.14"/>
        <circle cx="455" cy="220" r="52" fill="#D8B16D" fill-opacity="0.18"/>
        <rect x="336" y="210" width="28" height="46" rx="5" fill="none" stroke="#D8B16D" stroke-width="1.8"/>
        <rect x="439" y="192" width="32" height="52" rx="6" fill="none" stroke="#F1D6DC" stroke-width="1.8"/>
        <circle cx="350" cy="233" r="6" fill="#FFF7F0" opacity="0.9"/>
        <circle cx="455" cy="218" r="8" fill="#FFF7F0" opacity="0.95"/>
        <path d="M270 310 Q400 275 530 310" fill="none" stroke="#D8B16D" stroke-width="1.2" opacity="0.5"/>
      `;
      break;
    case 'locket':
      motifSvg = `
        <path d="M400 175 C400 150, 345 142, 345 185 C345 225, 400 255, 400 282 C400 255, 455 225, 455 185 C455 142, 400 150, 400 175 Z" fill="#D8B16D" fill-opacity="0.12" stroke="#D8B16D" stroke-width="2.2"/>
        <path d="M400 185 C400 165, 358 159, 358 191 C358 221, 400 245, 400 267 C400 245, 442 221, 442 191 C442 159, 400 165, 400 185 Z" fill="none" stroke="#FFF7F0" stroke-width="1" stroke-dasharray="3 3" opacity="0.65"/>
        <circle cx="400" cy="135" r="8" fill="none" stroke="#D8B16D" stroke-width="1.8"/>
      `;
      break;
    case 'constellation':
      motifSvg = `
        <polyline points="310,260 355,210 410,235 465,185 505,230" fill="none" stroke="#D8B16D" stroke-width="1.2" stroke-dasharray="4 4" opacity="0.75"/>
        <circle cx="310" cy="260" r="4" fill="#FFF7F0"/>
        <circle cx="355" cy="210" r="5" fill="#D8B16D"/>
        <circle cx="410" cy="235" r="4" fill="#F1D6DC"/>
        <circle cx="465" cy="185" r="6" fill="#FFF7F0"/>
        <circle cx="505" cy="230" r="4" fill="#D8B16D"/>
        <circle cx="385" cy="175" r="2.5" fill="#FFF7F0" opacity="0.6"/>
        <circle cx="440" cy="268" r="2.5" fill="#D8B16D" opacity="0.6"/>
      `;
      break;
    case 'roses':
      motifSvg = `
        <circle cx="375" cy="235" r="36" fill="#8C1D40" fill-opacity="0.45" stroke="#D8B16D" stroke-width="1.6"/>
        <path d="M360 235 C365 218, 388 218, 390 235 C392 250, 368 252, 368 238" fill="none" stroke="#F1D6DC" stroke-width="1.5"/>
        <circle cx="432" cy="245" r="30" fill="#68132F" fill-opacity="0.55" stroke="#F1D6DC" stroke-width="1.5"/>
        <path d="M420 245 C425 232, 442 232, 444 245 C445 256, 426 258, 426 247" fill="none" stroke="#D8B16D" stroke-width="1.4"/>
        <path d="M350 288 Q400 265 455 292" fill="none" stroke="#D8B16D" stroke-width="1.5"/>
      `;
      break;
    case 'sunrise':
      motifSvg = `
        <path d="M280 285 L520 285" stroke="#D8B16D" stroke-width="1.6" opacity="0.7"/>
        <path d="M325 285 A75 75 0 0 1 475 285" fill="#D8B16D" fill-opacity="0.18" stroke="#D8B16D" stroke-width="1.8"/>
        <line x1="400" y1="165" x2="400" y2="190" stroke="#D8B16D" stroke-width="1.5" opacity="0.75"/>
        <line x1="330" y1="190" x2="346" y2="208" stroke="#D8B16D" stroke-width="1.5" opacity="0.6"/>
        <line x1="470" y1="190" x2="454" y2="208" stroke="#D8B16D" stroke-width="1.5" opacity="0.6"/>
        <path d="M340 305 L460 305" stroke="#F1D6DC" stroke-width="1" opacity="0.45"/>
      `;
      break;
  }

  const safeTitle = options.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeSub = options.subtitle.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
    <defs>
      <radialGradient id="glow" cx="50%" cy="42%" r="65%">
        <stop offset="0%" stop-color="${bgStart}" />
        <stop offset="60%" stop-color="#270812" />
        <stop offset="100%" stop-color="${bgEnd}" />
      </radialGradient>
      <linearGradient id="goldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#D8B16D" stop-opacity="0.8" />
        <stop offset="50%" stop-color="#FFF7F0" stop-opacity="0.35" />
        <stop offset="100%" stop-color="#D8B16D" stop-opacity="0.8" />
      </linearGradient>
    </defs>
    <rect width="800" height="600" fill="url(#glow)" />
    <rect x="28" y="28" width="744" height="544" rx="12" fill="none" stroke="url(#goldBorder)" stroke-width="1.5" />
    <rect x="38" y="38" width="724" height="524" rx="8" fill="none" stroke="#D8B16D" stroke-opacity="0.22" stroke-width="1" />
    <circle cx="140" cy="110" r="1.8" fill="#D8B16D" opacity="0.55" />
    <circle cx="670" cy="135" r="2.2" fill="#FFF7F0" opacity="0.45" />
    <circle cx="640" cy="460" r="1.8" fill="#D8B16D" opacity="0.5" />
    <circle cx="165" cy="440" r="2.0" fill="#F1D6DC" opacity="0.4" />
    ${motifSvg}
    <text x="400" y="405" text-anchor="middle" fill="#FFF7F0" font-family="Georgia, serif" font-size="28" letter-spacing="1">${safeTitle}</text>
    <text x="400" y="445" text-anchor="middle" fill="#D8B16D" font-family="sans-serif" font-size="13" letter-spacing="3">${safeSub.toUpperCase()}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const INITIAL_LOVE_STORY_CONTENT: LoveStoryContent = {
  groomName: 'James',
  brideName: 'Loraine',
  nickname: 'Baby',
  firstMetDateText: 'June 15–20, 2016',
  officialAnniversaryDateText: 'October 26, 2022',
  fourthAnniversaryDateText: 'October 26, 2026',
  mainEmotionalMessage:
    'Loraine, Baby, I am so grateful that life gave me the chance to know you, love you, and share this part of my life with you. This website is a little piece of my heart, made especially for you.',

  chapterOne: {
    date: 'June 15–20, 2016',
    heading: 'Before We Knew What Our Story Would Become',
    quote:
      'Some beginnings don’t announce how important they will become. Sometimes, life simply lets two people meet, and only time reveals how much that moment will mean.',
    paragraphs: [
      'Around June 15–20, 2016, our paths crossed for the very first time. Back then, it was simply a quiet moment in time—two lives intersecting without knowing what the future held.',
      'We did not know then what our story would eventually become, and there was no grand script telling us where the years would lead. Yet looking back today, I feel a quiet gratitude that life allowed us to meet when we did, planting the earliest seed of a connection that time would later turn into something deeply meaningful.',
    ],
    imageUrl: createRomanticArtworkDataUri({
      title: 'Where Our Paths First Crossed',
      subtitle: 'June 15–20, 2016 · The Beginning',
      motif: 'teacups',
    }),
    imageCaption: 'Where our paths first crossed — June 15–20, 2016.',
  },

  chapterTwo: {
    date: 'October 26, 2022',
    largeDateDisplay: '10.26.2022',
    heading: 'The Day You Became My Baby',
    paragraphs: [
      'Years after we first met, October 26, 2022 became the day our relationship officially began—the day "you and I" truly became "us," and the day you became my Baby.',
      'Having someone to share life with—someone whose presence brings warmth, honesty, and comfort to ordinary days—is one of life’s greatest gifts. Starting this official chapter with you gave new meaning to every season that followed.',
    ],
    imageUrl: createRomanticArtworkDataUri({
      title: 'The Day We Became Us',
      subtitle: 'October 26, 2022 · Official Beginning',
      motif: 'champagne',
    }),
    imageCaption: 'The beginning of a chapter I will always be grateful for.',
  },

  chapterThree: {
    heading: 'Every Little Moment Matters',
    subtitle:
      'A love story is not only built on milestone dates; it lives inside the quiet conversations, shared laughter, and everyday moments we choose to treasure.',
    memories: [
      {
        id: 'mem-1',
        label: 'Our Favorite Photo Together',
        title: 'Right Where I Belong',
        date: 'James & Loraine',
        story:
          'Every time I look at us together, Baby, I feel a quiet sense of peace knowing that out of everyone in this world, I get to walk beside you.',
        imageUrl: createRomanticArtworkDataUri({
          title: 'Our Favorite Photo Together',
          subtitle: 'James & Loraine',
          motif: 'locket',
        }),
        isPlaceholder: false,
      },
      {
        id: 'mem-2',
        label: 'A Moment That Made Us Laugh',
        title: 'The Sound of Our Laughter',
        date: 'Joyful Moments',
        story:
          'Being able to laugh with you—effortlessly and genuinely—is one of my favorite parts of loving you. You make even the simplest days feel light.',
        imageUrl: createRomanticArtworkDataUri({
          title: 'Shared Laughter & Joy',
          subtitle: 'A Moment That Made Us Laugh',
          motif: 'lanterns',
        }),
        isPlaceholder: false,
      },
      {
        id: 'mem-3',
        label: 'A Photo of Loraine Smiling',
        title: 'The Warmth of Your Smile',
        date: 'My Favorite View',
        story:
          'Seeing you happy and smiling, Baby, has a way of making everything around us feel brighter, calmer, and warmer.',
        imageUrl: createRomanticArtworkDataUri({
          title: 'Your Smile, My Favorite View',
          subtitle: 'Baby Loraine Smiling',
          motif: 'roses',
        }),
        isPlaceholder: false,
      },
      {
        id: 'mem-4',
        label: 'A Special Day We Shared',
        title: 'Time Spent Side by Side',
        date: 'Cherished Together',
        story:
          'What makes any day special to me is never just where we are—it is the simple truth that I am sharing that time with you.',
        imageUrl: createRomanticArtworkDataUri({
          title: 'A Special Day Together',
          subtitle: 'Cherished Memory',
          motif: 'champagne',
        }),
        isPlaceholder: false,
      },
      {
        id: 'mem-5',
        label: 'An Ordinary Moment That Means a Lot to Me',
        title: 'Quiet Everyday Magic',
        date: 'Little Moments, Big Feelings',
        story:
          'Sometimes the quietest, most ordinary moments with you are the ones that stay in my heart the longest.',
        imageUrl: createRomanticArtworkDataUri({
          title: 'Quiet Everyday Magic',
          subtitle: 'An Ordinary Moment That Means Everything',
          motif: 'teacups',
        }),
        isPlaceholder: false,
      },
      {
        id: 'mem-6',
        label: 'A Memory I Never Want to Forget',
        title: 'Held Forever in My Heart',
        date: '2022 – 2026',
        story:
          'Every memory that brought us closer and taught us how to care for each other better is a treasure I want to keep forever.',
        imageUrl: createRomanticArtworkDataUri({
          title: 'Held Forever in My Heart',
          subtitle: 'A Memory I Never Want to Forget',
          motif: 'constellation',
        }),
        isPlaceholder: false,
      },
    ],
  },

  chapterFour: {
    date: 'October 26, 2026',
    heading: 'Four Years of Loving You, Baby',
    paragraphs: [
      'Today, on October 26, 2026, we celebrate four official years of being together—and more than a decade since life first let our paths cross in June 2016.',
      'Real love is not meaningful because everything is effortless or perfect. It is meaningful because two people choose to keep learning, communicating, growing, and appreciating one another through every season. Thank you for every conversation, every bit of patience, every shared smile, and every day we have chosen to care for each other.',
    ],
    imageUrl: createRomanticArtworkDataUri({
      title: 'Four Years of Us · 2022 – 2026',
      subtitle: 'October 26, 2026 · Fourth Anniversary',
      motif: 'locket',
    }),
    imageCaption: 'Four years of choosing, appreciating, and loving you, Baby.',
  },

  chapterFive: {
    heading: 'My Favorite Chapters Are Still Ahead',
    paragraphs: [
      'As grateful as I am for the memories behind us, my heart feels even warmer when I think about the days still ahead—the quiet mornings, the shared laughter, the new places we will see, and the gentle comfort of continuing to grow side by side.',
    ],
    personalWishPlaceholder:
      'My wish for our future, Baby, is that we keep choosing each other with patience, kindness, and gratitude—building a life full of peaceful days, honest conversations, warm laughter, and memories we will still be smiling about years from now.',
    closingLine:
      'Baby, thank you for being part of my story. I look forward to discovering the next chapters with you.',
  },

  galleryPhotos: [
    {
      id: 'gal-1',
      category: 'My Favorite Picture of Us',
      imageUrl: createRomanticArtworkDataUri({
        title: 'Our Main Anniversary Portrait',
        subtitle: 'My Favorite Picture of Us · Main Keepsake',
        motif: 'locket',
      }),
      caption: 'Four years of us, Baby — my favorite place will always be right beside you.',
      date: 'October 26, 2026',
      memory: 'Celebrating four official years of loving, learning, and growing together.',
      isMainAnniversaryPhoto: true,
      isPlaceholder: false,
      rotationDeg: -1.5,
    },
    {
      id: 'gal-2',
      category: 'My Favorite Memories of Us',
      imageUrl: createRomanticArtworkDataUri({
        title: 'Cherished Time Together',
        subtitle: 'My Favorite Memories of Us',
        motif: 'lanterns',
      }),
      caption: 'A favorite memory of the time we have shared together.',
      date: '2022 – 2026',
      memory: 'Every moment spent with you becomes a memory I am grateful to keep.',
      isMainAnniversaryPhoto: false,
      isPlaceholder: false,
      rotationDeg: 1.8,
    },
    {
      id: 'gal-3',
      category: 'Your Smile, My Favorite View',
      imageUrl: createRomanticArtworkDataUri({
        title: 'The Warmth of Your Smile',
        subtitle: 'Your Smile, My Favorite View',
        motif: 'roses',
      }),
      caption: 'Seeing you smile, Baby, still makes my whole day brighter.',
      date: 'My Favorite View',
      memory: 'Your smile is always the warmth I look forward to most.',
      isMainAnniversaryPhoto: false,
      isPlaceholder: false,
      rotationDeg: -1.2,
    },
    {
      id: 'gal-4',
      category: 'Little Moments, Big Feelings',
      imageUrl: createRomanticArtworkDataUri({
        title: 'Simple Moments With You',
        subtitle: 'Little Moments, Big Feelings',
        motif: 'teacups',
      }),
      caption: 'Even the simplest, quietest moments feel special when I share them with you.',
      date: 'Everyday Magic',
      memory: 'It is the little moments with you that mean everything to my heart.',
      isMainAnniversaryPhoto: false,
      isPlaceholder: false,
      rotationDeg: 1.4,
    },
    {
      id: 'gal-5',
      category: 'My Favorite Picture of You',
      imageUrl: createRomanticArtworkDataUri({
        title: 'My Beautiful Baby, Loraine',
        subtitle: 'My Favorite Picture of You',
        motif: 'constellation',
      }),
      caption: 'A picture of you that reminds me how lucky I am to call you my Baby.',
      date: 'For My Baby, Loraine',
      memory: 'Thankful every single day that life brought you into my world.',
      isMainAnniversaryPhoto: false,
      isPlaceholder: false,
      rotationDeg: -2.0,
    },
    {
      id: 'gal-6',
      category: 'My Favorite Memories of Us',
      imageUrl: createRomanticArtworkDataUri({
        title: 'Since October 26, 2022',
        subtitle: 'My Favorite Memories of Us',
        motif: 'champagne',
      }),
      caption: 'Every season with you has given me new reasons to be thankful.',
      date: 'October 26, 2022 – 2026',
      memory: 'Four years of being us, and so many beautiful chapters still ahead.',
      isMainAnniversaryPhoto: false,
      isPlaceholder: false,
      rotationDeg: 1.1,
    },
  ],

  thingsIMayNotSayEnoughLetter: {
    heading: 'To My Baby, Loraine',
    salutation: 'My dearest Baby,',
    requiredPassage:
      'Baby, sometimes I wonder if I tell you enough how grateful I am for you. Maybe I don\'t always find the perfect words, and maybe there are moments when I could express it better. But I hope you never forget that your presence in my life means so much to me. I appreciate the person you are, the moments we share, and the chance to keep building this story together.',
    paragraphs: [
      'When life gets busy and days move quickly, it is easy to assume that the person beside us already knows what is in our heart. Today, I wanted to slow down and put these feelings into words so you never have to guess how deeply I value you.',
      'I am so thankful that our paths first crossed back in June 2016, and even more thankful that on October 26, 2022, we began our official journey as a couple. Over these four years together, the little things—our conversations, your kindness, your effort, and the comfort of simply being near you—have meant more to me than I often say out loud.',
      'I know that no relationship is perfect, and neither of us has to be flawless for our love to be deeply real. What matters to me is the care we bring to one another, the patience we practice, and the way we keep choosing to listen, understand, and grow together.',
      'More than anything, I always want you to feel appreciated, respected, safe, and cherished with me. I never want you to feel that your love, your time, or your presence in my life is something I take for granted.',
    ],
    customDetailPlaceholder:
      'Whether we are talking about our day, sharing a quiet laugh, or simply resting in the comfort of each other’s company, being with you feels like home to me, Baby.',
    closingLines: [
      'Thank you for being you, Baby. Thank you for being part of my life, and thank you for giving me so many reasons to be grateful for our story.',
      'Happy fourth anniversary, my love.',
    ],
    signature: 'With all my love,\nJames ♥',
  },

  twelveLoveNotes: [
    {
      id: 1,
      theme: 'One Thing I Will Always Appreciate About You',
      message:
        'Baby, I will always appreciate the sincerity, warmth, and genuine heart you bring into my life. You make my world softer and brighter just by being in it.',
    },
    {
      id: 2,
      theme: 'Something About Your Smile',
      message:
        'Whenever you smile, Baby, it has a way of softening even the heaviest day. Your smile is still one of my favorite sights in the whole world.',
    },
    {
      id: 3,
      theme: 'A Little Thing That Makes Me Happy',
      message:
        'It doesn’t take a grand occasion for me to feel happy with you. Simply sharing quiet time together, talking with you, and knowing you are by my side brings so much peace to my heart.',
    },
    {
      id: 4,
      theme: 'A Memory That Makes Me Smile',
      message:
        'Whenever my mind wanders back to the moments we have laughed and talked together without a care in the world, I find myself smiling all over again. Thank you for giving me memories that feel like home.',
    },
    {
      id: 5,
      theme: 'What I Admire About You',
      message:
        'I deeply admire the person you are, Loraine—your strength, your kindness, and the care you show to the people who matter to you. Walking beside you makes me so grateful.',
    },
    {
      id: 6,
      theme: 'For the Days You Feel Tired',
      message:
        'On the days when you feel exhausted or overwhelmed, Baby, please remember you don’t have to carry everything alone. I am always here to listen, to hold space for you, and to remind you how much you are loved.',
    },
    {
      id: 7,
      theme: 'Why I Am Proud of You',
      message:
        'I am so proud of the effort you put into your life and the grace you show through every season. Seeing you keep moving forward inspires me more than you know.',
    },
    {
      id: 8,
      theme: 'Something I Want to Thank You For',
      message:
        'Thank you for your patience, your care, and the effort you give to us. Most of all, thank you for choosing to share your heart and your time with me. I never take it for granted.',
    },
    {
      id: 9,
      theme: 'Something I Hope You Never Doubt',
      message:
        'Even on quiet days or imperfect moments, I hope you never doubt that you matter deeply to me, that I respect and cherish you, and that I am genuinely grateful you are my Baby.',
    },
    {
      id: 10,
      theme: 'A Wish for Us',
      message:
        'My wish for us is that we continue to protect our peace, laugh often, communicate openly, and keep making time for the moments that bring us closer.',
    },
    {
      id: 11,
      theme: 'Something I Want Us to Keep Doing',
      message:
        'No matter how many years pass, I want us to keep appreciating the small moments, checking in on each other’s hearts, and never losing the warmth that makes us who we are.',
    },
    {
      id: 12,
      theme: 'One Last Secret, Baby',
      message:
        'Here is one last truth from my heart, Baby: creating this little world for our fourth anniversary made me fall in love with our story all over again. I love you so much, Loraine.',
    },
  ],

  sealedSurpriseLetter: {
    preRevealIntro:
      'Baby, before you leave this little world I made for you, there is one more thing I want you to read.',
    preRevealSubtext:
      'I saved these words for you, because some feelings deserve a special place.',
    buttonLabel: 'Open Your Letter, Baby ♥',
    salutation: 'My Dearest Baby, Loraine,',
    paragraphs: [
      'If you are reading this, you have walked through the little world I built for you. I wanted to create a quiet space away from everything else—not to show off or make something flashy, but simply because you are worth the time, the thought, and the care it took to put my heart into something you can hold onto.',
      'When I look back at our timeline, it still amazes me how life works. We first crossed paths around June 15–20, 2016, long before either of us knew what we would eventually mean to each other. Then came October 26, 2022—the day our relationship officially began—and now here we are on October 26, 2026, celebrating four years of being us.',
      'If I could return to the beginning of our story, knowing what I know today, I would still be grateful for the chance to meet you, to know you, and to discover the love we would share.',
      'Through these four years, I have learned that the most treasured parts of love are rarely the loudest ones. They live in the quiet comfort of knowing someone cares about your day, the warmth of a familiar smile, and the gratitude that deepens with time when we choose not to take each other for granted.',
      'Baby, I don\'t want this anniversary to be only about counting the years. I want it to remind you that there is someone who is thankful for you, who values the moments you share, and who wants to keep making space for more beautiful memories with you.',
      'Thank you for being gentle with my heart, for sharing your life with me, and for every honest effort that has brought us to our fourth anniversary. You are deeply loved, Loraine—today and in all the chapters we have yet to write.',
    ],
    closingHeadline: 'Happy 4th Anniversary, My Baby.',
    closingSubheadline: 'Four years of being us. A lifetime of memories still waiting to be made.',
    closingGratitudeLines: [
      'Loraine, thank you for being part of my life.',
      'Thank you for the memories we have made.',
      'Thank you for the chance to keep writing our story together.',
      'I am so grateful for you, Baby.',
    ],
    closingSignOff: 'Forever grateful for this chapter of us,',
    closingSignature: 'James ♥',
    personalMessagePlaceholder:
      'Baby, thank you for four wonderful years of being my love, my comfort, and my favorite person. Every day since October 26, 2022 has been a gift because I get to share it with you. I love you always, Loraine.',
  },

  digitalGifts: {
    memoryToKeepCaption:
      'Every time I look at this memory of us, Baby, I am reminded how fortunate I am to share this life with you. — James ♥',
    promiseToRememberMessage:
      'Baby, I know that love grows strongest when it is cared for intentionally. My sincere promise to you is to keep listening with an open heart, communicating honestly even when life is busy, appreciating the little things you do, and always making real time for us.',
    wishForNextChapterIntro:
      'As we step into our fifth year together, my wish is for more peaceful mornings, deeper understanding, and joyful new experiences side by side:',
    wishForNextChapterPlaceholder:
      'More unhurried dates together, new places to explore hand in hand, cozy nights filled with laughter, and another year of loving and appreciating each other deeper every day.',
  },
};
