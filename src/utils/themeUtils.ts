export interface AppTheme {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  palette: [string, string, string]; // Preview swatch circles [primary, accent, light]
  colors: {
    primary: string;
    primaryHover: string;
    light: string;
    border: string;
    surface: string;
    bg: string;
    accent: string;
    textAccent: string;
    ring: string;
    confetti: string[];
  };
}

export const APP_THEMES: AppTheme[] = [
  {
    id: 'romantic-rose',
    name: 'Romantic Rose',
    tagline: 'Classic blush pink, rose petals & sweet love',
    badge: 'Blush & Petals',
    palette: ['#fb6f92', '#ff8fab', '#ffe5ec'],
    colors: {
      primary: '#fb6f92',
      primaryHover: '#e8557b',
      light: '#ffe5ec',
      border: '#ffc2d1',
      surface: '#fff5f7',
      bg: '#fff9fa',
      accent: '#ff8fab',
      textAccent: '#c93b61',
      ring: 'rgba(251, 111, 146, 0.25)',
      confetti: ['#fb6f92', '#ff8fab', '#ffb3c6', '#ffc2d1', '#ffe5ec'],
    },
  },
  {
    id: 'sunset-romance',
    name: 'Sunset Romance',
    tagline: 'Golden sunset glow, warm peach & candlelight',
    badge: 'Sunset & Amber',
    palette: ['#f95738', '#fb923c', '#ffedd5'],
    colors: {
      primary: '#f95738',
      primaryHover: '#e03a1b',
      light: '#ffedd5',
      border: '#fed7aa',
      surface: '#fff7ed',
      bg: '#fffaf5',
      accent: '#fb923c',
      textAccent: '#c2410c',
      ring: 'rgba(249, 87, 56, 0.25)',
      confetti: ['#f95738', '#fb923c', '#f59e0b', '#fed7aa', '#ffedd5'],
    },
  },
  {
    id: 'lavender-dream',
    name: 'Lavender Dream',
    tagline: 'Enchanted lilac, soft amethyst & fairy-tale magic',
    badge: 'Lilac & Violet',
    palette: ['#9333ea', '#c084fc', '#f3e8ff'],
    colors: {
      primary: '#9333ea',
      primaryHover: '#7e22ce',
      light: '#f3e8ff',
      border: '#e9d5ff',
      surface: '#faf5ff',
      bg: '#fcfaff',
      accent: '#c084fc',
      textAccent: '#6b21a8',
      ring: 'rgba(147, 51, 234, 0.25)',
      confetti: ['#9333ea', '#a855f7', '#c084fc', '#e9d5ff', '#f3e8ff'],
    },
  },
  {
    id: 'ocean-starlight',
    name: 'Ocean Starlight',
    tagline: 'Midnight sapphire, coastal cyan & infinite stars',
    badge: 'Sapphire & Cyan',
    palette: ['#0284c7', '#38bdf8', '#e0f2fe'],
    colors: {
      primary: '#0284c7',
      primaryHover: '#0369a1',
      light: '#e0f2fe',
      border: '#bae6fd',
      surface: '#f0f9ff',
      bg: '#f8fcff',
      accent: '#38bdf8',
      textAccent: '#0369a1',
      ring: 'rgba(2, 132, 199, 0.25)',
      confetti: ['#0284c7', '#38bdf8', '#7dd3fc', '#bae6fd', '#e0f2fe'],
    },
  },
  {
    id: 'sage-garden',
    name: 'Sage Garden',
    tagline: 'Eucalyptus tranquility, emerald devotion & peace',
    badge: 'Emerald & Mint',
    palette: ['#059669', '#34d399', '#d1fae5'],
    colors: {
      primary: '#059669',
      primaryHover: '#047857',
      light: '#d1fae5',
      border: '#a7f3d0',
      surface: '#ecfdf5',
      bg: '#f6fef9',
      accent: '#34d399',
      textAccent: '#065f46',
      ring: 'rgba(5, 150, 105, 0.25)',
      confetti: ['#059669', '#10b981', '#34d399', '#a7f3d0', '#d1fae5'],
    },
  },
];

export function getTheme(themeId?: string): AppTheme {
  const match = APP_THEMES.find((t) => t.id === themeId);
  return match || APP_THEMES[0];
}

export function applyTheme(themeId?: string) {
  const theme = getTheme(themeId);
  const root = document.documentElement;

  // Set data-theme attribute
  root.setAttribute('data-theme', theme.id);

  // Set CSS Custom Properties for immediate reactive rendering
  root.style.setProperty('--theme-primary', theme.colors.primary);
  root.style.setProperty('--theme-primary-hover', theme.colors.primaryHover);
  root.style.setProperty('--theme-light', theme.colors.light);
  root.style.setProperty('--theme-border', theme.colors.border);
  root.style.setProperty('--theme-surface', theme.colors.surface);
  root.style.setProperty('--theme-bg', theme.colors.bg);
  root.style.setProperty('--theme-accent', theme.colors.accent);
  root.style.setProperty('--theme-text-accent', theme.colors.textAccent);
  root.style.setProperty('--theme-ring', theme.colors.ring);

  // Update body background
  document.body.style.backgroundColor = theme.colors.bg;

  // Update mobile browser address bar theme-color
  let metaTheme = document.querySelector('meta[name="theme-color"]');
  if (!metaTheme) {
    metaTheme = document.createElement('meta');
    metaTheme.setAttribute('name', 'theme-color');
    document.head.appendChild(metaTheme);
  }
  metaTheme.setAttribute('content', theme.colors.primary);

  // Cache in localStorage
  localStorage.setItem('oct26_active_theme', theme.id);

  return theme;
}
