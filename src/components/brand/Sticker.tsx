// v2 Sticker primitive
//
// The signature geometry: 2.5px ink border + 6px hard offset shadow.
// Two variants only — `default` (white fill) and `mint` (mint fill).
// One Sticker per page may set `tilt` (degrees) — the page's single tilted
// element. Every other Sticker stays square (Discipline Rule #2 in the v2 plan).
//
// CSS recipe lifted from after-click/aurora.html .hero-sticker, adapted to
// React + Tailwind + the v2 short tokens.

import { clsx } from 'clsx';
import type { CSSProperties, ReactNode } from 'react';

type StickerProps = {
  variant?: 'default' | 'mint';
  /** Degrees of CSS rotation. Page uses this on AT MOST one sticker. */
  tilt?: number;
  className?: string;
  children: ReactNode;
};

export function Sticker({
  variant = 'default',
  tilt,
  className,
  children,
}: StickerProps) {
  const style: CSSProperties | undefined =
    typeof tilt === 'number' ? { transform: `rotate(${tilt}deg)` } : undefined;

  return (
    <div
      style={style}
      className={clsx(
        // 2.5px ink border requires arbitrary value — Tailwind's border-2/border
        // utilities don't hit 2.5px. boxShadow.sticker comes from tailwind.config.
        'relative inline-block rounded-2xl border-[2.5px] border-ink shadow-sticker',
        variant === 'mint' ? 'bg-mint' : 'bg-white',
        'text-ink',
        className,
      )}
    >
      {children}
    </div>
  );
}
