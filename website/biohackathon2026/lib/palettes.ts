// lib/palettes.ts
// Color-theme presets. Each palette is curated to feel cohesive end-to-end.
// Applied at runtime by writing CSS custom properties on :root.

export type PaletteKey = 'rose' | 'sky' | 'sage';

export type Palette = {
  name: string;
  bg: string;
  'bg-tint': string;
  card: string;
  ink: string;
  'ink-2': string;
  muted: string;
  line: string;
  primary: string;
  'primary-deep': string;
  'primary-soft': string;
  accent: string;
  'accent-soft': string;
  sage: string;
  'sage-soft': string;
  warn: string;
  'warn-soft': string;
};

export const PALETTES: Record<PaletteKey, Palette> = {
  rose: {
    name: 'Soft Rose',
    bg: '#FAF4EF', 'bg-tint': '#F2E6DC', card: '#FFFFFF',
    ink: '#2A1F25', 'ink-2': '#5B4A52', muted: '#9C8A91', line: 'rgba(42,31,37,.08)',
    primary: '#D9627E', 'primary-deep': '#A8425E', 'primary-soft': '#F7DAE2',
    accent: '#6E5BB8', 'accent-soft': '#E6E1F4',
    sage: '#7DA690', 'sage-soft': '#D9E8DF',
    warn: '#D8884E', 'warn-soft': '#F4E0D0',
  },
  sky: {
    name: 'Figma Sky',
    bg: '#EAF4FB', 'bg-tint': '#D9EBF5', card: '#FFFFFF',
    ink: '#111111', 'ink-2': '#3E3947', muted: '#A2A3A4', line: 'rgba(17,17,17,.08)',
    primary: '#F62088', 'primary-deep': '#C8166A', 'primary-soft': '#FDD3E5',
    accent: '#3E36B0', 'accent-soft': '#D9D9FF',
    sage: '#128983', 'sage-soft': '#C4E3E1',
    warn: '#F9A135', 'warn-soft': '#FCE0C2',
  },
  sage: {
    name: 'Sage & Terracotta',
    bg: '#F4F1EA', 'bg-tint': '#E8E2D4', card: '#FFFFFF',
    ink: '#2A2A26', 'ink-2': '#55554F', muted: '#9D9C92', line: 'rgba(42,42,38,.08)',
    primary: '#6B9B8A', 'primary-deep': '#4E7969', 'primary-soft': '#D6E5DD',
    accent: '#C97A5A', 'accent-soft': '#F2DCD0',
    sage: '#7DA690', 'sage-soft': '#D9E8DF',
    warn: '#D9A23E', 'warn-soft': '#F2E1C0',
  },
};

export function applyPalette(key: PaletteKey): void {
  const p = PALETTES[key];
  if (!p || typeof document === 'undefined') return;
  const root = document.documentElement;
  (Object.entries(p) as Array<[keyof Palette, string]>).forEach(([k, v]) => {
    if (k === 'name') return;
    root.style.setProperty('--' + k, v);
  });
}
