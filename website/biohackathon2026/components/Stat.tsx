// components/Stat.tsx — large serif value with caption underneath.

import type { ReactNode } from 'react';

export type StatProps = {
  value: ReactNode;
  label: ReactNode;
  color?: string;
};

export default function Stat({ value, label, color = 'var(--primary)' }: StatProps) {
  return (
    <div>
      <div
        className="serif"
        style={{ fontSize: 44, lineHeight: 1, color, fontWeight: 500 }}
      >
        {value}
      </div>
      <div style={{ marginTop: 6, fontSize: 13, color: 'var(--ink-2)' }}>
        {label}
      </div>
    </div>
  );
}
