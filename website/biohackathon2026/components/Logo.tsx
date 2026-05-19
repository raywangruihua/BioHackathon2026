// components/Logo.tsx — Pearl wordmark + soft-gradient pearl glyph.

export type LogoProps = {
  size?: number;
  withText?: boolean;
};

export default function Logo({ size = 28, withText = true }: LogoProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
        <defs>
          <radialGradient id="pearlG" cx=".35" cy=".35" r=".75">
            <stop offset="0%" stopColor="#FFF" />
            <stop offset="60%" stopColor="#FFE5EC" />
            <stop offset="100%" stopColor="var(--primary)" />
          </radialGradient>
        </defs>
        <circle cx="16" cy="16" r="13" fill="url(#pearlG)" />
        <circle cx="11.5" cy="11.5" r="3.6" fill="#fff" opacity=".7" />
        <circle cx="16" cy="16" r="13" fill="none" stroke="var(--primary-deep)" strokeOpacity=".18" />
      </svg>
      {withText && (
        <span
          className="serif"
          style={{ fontSize: 22, letterSpacing: '-.02em', fontWeight: 600 }}
        >
          Pearl
        </span>
      )}
    </div>
  );
}
