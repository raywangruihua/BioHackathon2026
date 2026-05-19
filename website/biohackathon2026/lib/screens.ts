// lib/screens.ts
// Route + nav metadata. The `id` matches the URL slug (with 'landing' → '/').

export type ScreenId =
  | 'landing'
  | 'assessment'
  | 'results'
  | 'tracker'
  | 'booking'
  | 'doctor';

export type ViewKind = 'patient' | 'doctor';

export type Screen = {
  id: ScreenId;
  path: string;
  label: string;
  icon: string;
  view: ViewKind;
};

export const SCREENS: Screen[] = [
  { id: 'landing',    path: '/',            label: 'Home',       icon: 'flower',   view: 'patient' },
  { id: 'assessment', path: '/assessment',  label: 'Assessment', icon: 'check',    view: 'patient' },
  { id: 'results',    path: '/results',     label: 'My report',  icon: 'chart',    view: 'patient' },
  { id: 'tracker',    path: '/tracker',     label: 'Tracker',    icon: 'calendar', view: 'patient' },
  { id: 'booking',    path: '/booking',     label: 'Doctors',    icon: 'chat',     view: 'patient' },
  { id: 'doctor',     path: '/doctor',      label: 'Dashboard',  icon: 'chart',    view: 'doctor'  },
];

export function pathForId(id: ScreenId): string {
  return SCREENS.find((s) => s.id === id)?.path ?? '/';
}

export function idForPath(pathname: string): ScreenId {
  // Match longest prefix so nested routes still resolve to their top-level id.
  const match = SCREENS
    .filter((s) => pathname === s.path || pathname.startsWith(s.path + '/'))
    .sort((a, b) => b.path.length - a.path.length)[0];
  return match?.id ?? 'landing';
}

export type GoFn = (id: ScreenId) => void;
