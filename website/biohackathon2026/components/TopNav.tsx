'use client';

// components/TopNav.tsx
// Sticky glass header with logo, primary nav, patient/doctor view toggle,
// and right-side CTAs. Active state is derived from the current pathname.

import { usePathname, useRouter } from 'next/navigation';
import { useMemo } from 'react';
import Logo from './Logo';
import Icon from './Icon';
import Avatar from './Avatar';
import {
  SCREENS,
  idForPath,
  pathForId,
  type ScreenId,
  type ViewKind,
} from '@/lib/screens';

export default function TopNav() {
  const pathname = usePathname() ?? '/';
  const router = useRouter();

  const activeId = idForPath(pathname);
  const view: ViewKind = useMemo(() => {
    const found = SCREENS.find((s) => s.id === activeId);
    return found?.view ?? 'patient';
  }, [activeId]);

  const items = SCREENS.filter((s) => s.view === view);

  const go = (id: ScreenId) => {
    router.push(pathForId(id));
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  const switchView = (v: ViewKind) => {
    if (v === 'doctor') router.push(pathForId('doctor'));
    else router.push(pathForId('landing'));
  };

  return (
    <header
      className="nav-glass"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        height: 80,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <button onClick={() => go('landing')}>
          <Logo />
        </button>

        <nav style={{ display: 'flex', gap: 4, marginLeft: 32 }}>
          {items.map((s) => {
            const active = activeId === s.id;
            return (
              <button
                key={s.id}
                onClick={() => go(s.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  height: 38,
                  padding: '0 14px',
                  borderRadius: 999,
                  fontSize: 13.5,
                  fontWeight: active ? 600 : 500,
                  background: active ? 'var(--ink)' : 'transparent',
                  color: active ? '#fff' : 'var(--ink-2)',
                  transition: 'all .15s',
                }}
              >
                <Icon name={s.icon as any} size={14} /> {s.label}
              </button>
            );
          })}
        </nav>

        <div style={{ flex: 1 }} />

        {/* View toggle pill */}
        <div
          style={{
            display: 'flex',
            padding: 4,
            borderRadius: 999,
            background: 'var(--bg-tint)',
            border: '1px solid var(--line)',
            fontSize: 12.5,
            fontWeight: 600,
          }}
        >
          {(['patient', 'doctor'] as const).map((v) => (
            <button
              key={v}
              onClick={() => switchView(v)}
              style={{
                height: 30,
                padding: '0 14px',
                borderRadius: 999,
                background: view === v ? '#fff' : 'transparent',
                color: view === v ? 'var(--ink)' : 'var(--ink-2)',
                boxShadow: view === v ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
                transition: 'all .15s',
              }}
            >
              {v === 'patient' ? 'Patient' : 'Doctor'}
            </button>
          ))}
        </div>

        {view === 'patient' ? (
          <>
            <button className="btn btn-ghost btn-sm">Sign in</button>
            <button className="btn btn-rose btn-sm" onClick={() => go('assessment')}>
              Get started
            </button>
          </>
        ) : (
          <>
            <button className="btn btn-ghost btn-sm" style={{ width: 38, padding: 0 }}>
              <Icon name="bell" size={16} />
            </button>
            <Avatar name="Mira Chandra" tone="sage" size={36} />
          </>
        )}
      </div>
    </header>
  );
}
