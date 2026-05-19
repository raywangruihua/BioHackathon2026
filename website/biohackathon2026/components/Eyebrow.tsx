// components/Eyebrow.tsx — small uppercase section label with leading rule.

import type { ReactNode } from 'react';

export type EyebrowProps = {
  children: ReactNode;
  color?: string;
};

export default function Eyebrow({ children, color = 'var(--primary)' }: EyebrowProps) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        color,
        fontSize: 12.5,
        fontWeight: 600,
        letterSpacing: '.1em',
        textTransform: 'uppercase',
      }}
    >
      <span style={{ width: 18, height: 1, background: color, opacity: 0.55 }} />
      {children}
    </div>
  );
}
