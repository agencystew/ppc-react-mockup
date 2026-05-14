// v2 Caveat primitive
//
// Caveat 600 at 32px in red-orange. Optional curved-arrow SVG next to the
// text in one of four directions. Singleton-by-discipline: ≤ 1 instance per
// page (Discipline Rule #4 in the v2 plan).

import { clsx } from 'clsx';

export type CaveatArrow =
  | 'down-left'
  | 'down-right'
  | 'up-left'
  | 'up-right'
  | 'none';

type CaveatProps = {
  text: string;
  arrow?: CaveatArrow;
  className?: string;
};

/**
 * Inline curved arrow. ~60px long, red-orange 2px stroke. Direction set by
 * the SVG path — four pre-drawn paths cover the four diagonals.
 */
function ArrowSvg({ direction }: { direction: Exclude<CaveatArrow, 'none'> }) {
  // Each path starts from the Caveat text edge and curves out toward the
  // referenced element. Stroke 2px. End cap = arrowhead (two short tails).
  const paths: Record<Exclude<CaveatArrow, 'none'>, { d: string; head: string }> = {
    'down-left': {
      d: 'M 56 6 C 40 18, 22 30, 8 52',
      head: 'M 8 52 L 16 46 M 8 52 L 14 58',
    },
    'down-right': {
      d: 'M 8 6 C 24 18, 42 30, 56 52',
      head: 'M 56 52 L 48 46 M 56 52 L 50 58',
    },
    'up-left': {
      d: 'M 56 54 C 40 42, 22 30, 8 8',
      head: 'M 8 8 L 16 14 M 8 8 L 14 2',
    },
    'up-right': {
      d: 'M 8 54 C 24 42, 42 30, 56 8',
      head: 'M 56 8 L 48 14 M 56 8 L 50 2',
    },
  };

  const { d, head } = paths[direction];

  return (
    <svg
      width="64"
      height="60"
      viewBox="0 0 64 60"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d={d}
        stroke="#F24A2E"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path d={head} stroke="#F24A2E" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Caveat({ text, arrow = 'none', className }: CaveatProps) {
  const showArrowBefore = arrow === 'up-left' || arrow === 'down-left';
  const showArrowAfter = arrow === 'up-right' || arrow === 'down-right';

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-2 font-hand',
        className,
      )}
      style={{
        fontWeight: 600,
        fontSize: '32px',
        lineHeight: 1,
        color: '#F24A2E',
      }}
    >
      {showArrowBefore && <ArrowSvg direction={arrow} />}
      <span>{text}</span>
      {showArrowAfter && <ArrowSvg direction={arrow} />}
    </span>
  );
}
