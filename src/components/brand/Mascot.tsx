// v2 Mascot primitive
//
// Four poses, one per file in src/assets/mascots/*.png. The `pose` prop is
// a strict union — any other value fails at compile time.
// Discipline Rule #3: mascots appear on FIVE pages only and once per page.
// That cap is enforced by composition in each page, not by this primitive.

import wave from '../../assets/mascots/wave.png';
import rocket from '../../assets/mascots/rocket.png';
import receipt from '../../assets/mascots/receipt.png';
import peek from '../../assets/mascots/peek.png';

export type MascotPose = 'wave' | 'rocket' | 'receipt' | 'peek';

type MascotProps = {
  pose: MascotPose;
  /** Pixel height. Default 200. Width is auto. */
  size?: number;
  className?: string;
};

const SRC: Record<MascotPose, string> = {
  wave,
  rocket,
  receipt,
  peek,
};

const ALT: Record<MascotPose, string> = {
  wave: 'Page mascot waving',
  rocket: 'Page mascot launching upward',
  receipt: 'Page mascot holding a proof receipt',
  peek: 'Page mascot peeking around the corner',
};

export function Mascot({ pose, size = 200, className }: MascotProps) {
  return (
    <img
      src={SRC[pose]}
      alt={ALT[pose]}
      style={{ height: size, width: 'auto' }}
      className={className}
      draggable={false}
    />
  );
}
