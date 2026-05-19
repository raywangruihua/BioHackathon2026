// components/Icon.tsx — inline SVG icon set used across the app.

import type { CSSProperties, ReactNode } from 'react';

export type IconName =
  | 'sparkle' | 'flower' | 'drop' | 'heart' | 'moon' | 'sun' | 'leaf'
  | 'calendar' | 'user' | 'chart' | 'chat' | 'plus' | 'check' | 'arrow'
  | 'arrowL' | 'settings' | 'bell' | 'search' | 'star' | 'shield' | 'lock'
  | 'play' | 'download' | 'info' | 'waves' | 'pearl' | 'dot' | 'menu'
  | 'close' | 'book' | 'activity' | 'pill';

export type IconProps = {
  name: IconName;
  size?: number;
  stroke?: number;
  style?: CSSProperties;
};

export default function Icon({ name, size = 18, stroke = 1.6, style }: IconProps) {
  const paths: Record<IconName, ReactNode> = {
    sparkle: <><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></>,
    flower:  <><circle cx="12" cy="12" r="2.4"/><path d="M12 4c2 2 2 4 0 6-2-2-2-4 0-6ZM12 20c-2-2-2-4 0-6 2 2 2 4 0 6ZM4 12c2-2 4-2 6 0-2 2-4 2-6 0ZM20 12c-2 2-4 2-6 0 2-2 4-2 6 0Z"/></>,
    drop:    <><path d="M12 3.5c4 5 6 8 6 11a6 6 0 1 1-12 0c0-3 2-6 6-11Z"/></>,
    heart:   <><path d="M12 20s-7-4.6-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.4-7 10-7 10Z"/></>,
    moon:    <><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z"/></>,
    sun:     <><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/></>,
    leaf:    <><path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14ZM5 19l8-8"/></>,
    calendar:<><rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/></>,
    user:    <><circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/></>,
    chart:   <><path d="M4 19h16M7 16V9M12 16V5M17 16v-7"/></>,
    chat:    <><path d="M21 12a8 8 0 1 1-3-6.2L21 5l-.6 3.4A8 8 0 0 1 21 12Z"/></>,
    plus:    <><path d="M12 5v14M5 12h14"/></>,
    check:   <><path d="m5 12 5 5 9-11"/></>,
    arrow:   <><path d="M5 12h14M13 6l6 6-6 6"/></>,
    arrowL:  <><path d="M19 12H5M11 6l-6 6 6 6"/></>,
    settings:<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.9 2.9l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.9-2.9l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.9-2.9l.1.1a1.6 1.6 0 0 0 1.8.3 1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.9 2.9l-.1.1a1.6 1.6 0 0 0-.3 1.8c.3.6.9 1 1.5 1H21a2 2 0 1 1 0 4h-.1c-.6 0-1.2.4-1.5 1Z"/></>,
    bell:    <><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15L6 16ZM10 20a2 2 0 0 0 4 0"/></>,
    search:  <><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4-4"/></>,
    star:    <><path d="m12 3 2.7 5.5 6 .9-4.3 4.2 1 6L12 16.8 6.6 19.6l1-6L3.3 9.4l6-.9L12 3Z"/></>,
    shield:  <><path d="M12 3 4 6v5c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-3Z"/></>,
    lock:    <><rect x="4" y="11" width="16" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 1 1 8 0v3"/></>,
    play:    <><path d="M8 5v14l11-7L8 5Z"/></>,
    download:<><path d="M12 4v12M7 11l5 5 5-5M4 20h16"/></>,
    info:    <><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 8v.5"/></>,
    waves:   <><path d="M3 8c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2M3 14c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2"/></>,
    pearl:   <><circle cx="12" cy="12" r="7"/><circle cx="10" cy="10" r="2" fill="currentColor" stroke="none" opacity=".4"/></>,
    dot:     <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/>,
    menu:    <><path d="M4 7h16M4 12h16M4 17h16"/></>,
    close:   <><path d="m6 6 12 12M18 6 6 18"/></>,
    book:    <><path d="M4 5a2 2 0 0 1 2-2h12v17H6a2 2 0 0 0-2 2V5ZM4 5v15M8 8h6M8 12h6"/></>,
    activity:<><path d="M3 12h4l3-8 4 16 3-8h4"/></>,
    pill:    <><rect x="3" y="9" width="18" height="6" rx="3" transform="rotate(-30 12 12)"/><path d="m8.5 8.5 7 7"/></>,
  };
  return (
    <svg
      className="ico"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      {paths[name]}
    </svg>
  );
}
