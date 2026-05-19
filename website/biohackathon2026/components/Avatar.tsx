// components/Avatar.tsx — circular avatar with initials fallback.

export type AvatarTone = 'rose' | 'sage' | 'accent' | 'warn' | 'ink';

export type AvatarProps = {
  name?: string;
  size?: number;
  tone?: AvatarTone;
  src?: string;
};

const TONES: Record<AvatarTone, { bg: string; fg: string }> = {
  rose:   { bg: 'var(--primary-soft)', fg: 'var(--primary-deep)' },
  sage:   { bg: 'var(--sage-soft)',    fg: '#476158' },
  accent: { bg: 'var(--accent-soft)',  fg: '#4D3FA8' },
  warn:   { bg: 'var(--warn-soft)',    fg: '#8A4F1F' },
  ink:    { bg: 'var(--ink)',          fg: '#fff' },
};

export default function Avatar({
  name = 'AB',
  size = 40,
  tone = 'rose',
  src,
}: AvatarProps) {
  const t = TONES[tone] || TONES.rose;
  const initials = name.split(' ').map((s) => s[0]).slice(0, 2).join('');
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: src ? `url(${src}) center/cover` : t.bg,
        color: t.fg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 600,
        fontSize: Math.max(11, size * 0.36),
        flex: 'none',
      }}
    >
      {!src && initials}
    </div>
  );
}
