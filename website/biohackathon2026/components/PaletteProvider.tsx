'use client';

// components/PaletteProvider.tsx
// Applies a color palette (CSS variables) on mount and on subsequent changes.
// Exposes a context so anywhere in the tree can switch palettes via `useTheme()`.

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { applyPalette, PALETTES, type Palette, type PaletteKey } from '@/lib/palettes';

type ThemeContextValue = {
  palette: PaletteKey;
  setPalette: (k: PaletteKey) => void;
  palettes: Record<PaletteKey, Palette>;
};

const ThemeCtx = createContext<ThemeContextValue>({
  palette: 'rose',
  setPalette: () => {},
  palettes: PALETTES,
});

export const useTheme = (): ThemeContextValue => useContext(ThemeCtx);

export type PaletteProviderProps = {
  initial?: PaletteKey;
  children: ReactNode;
};

export default function PaletteProvider({
  initial = 'rose',
  children,
}: PaletteProviderProps) {
  const [palette, setPalette] = useState<PaletteKey>(initial);

  useEffect(() => {
    applyPalette(palette);
  }, [palette]);

  return (
    <ThemeCtx.Provider value={{ palette, setPalette, palettes: PALETTES }}>
      {children}
    </ThemeCtx.Provider>
  );
}
