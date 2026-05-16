// v5 Investigation Hero — entry card that showcases the agent's depth.
//
// Lives ABOVE the tabs (shared by AI Summary + Deep Report).
//
// Anatomy:
//   1. Eyebrow byline (small, top-left)
//   2. BIG completion line (Completed · 7m 12s · 7-day window)
//   3. Figtree 900 headline + purple period
//   4. Three lavender power-stat boxes (icon + number + label) — depth, not findings
//   5. Mascot (right, calm and forward-looking)
//
// The hero is the "look how much work happened" moment. Specific findings
// + action bullets live in the Strategy Verdict directly below.

import {
  Check,
  Path,
  Lightning,
  Clock,
  MagnifyingGlass,
  Target,
  PuzzlePiece,
  Database,
  Stack,
} from '@phosphor-icons/react';
import { SpyMascot } from '../../components/SpyMascot';
import type { InvestigationHeroData, PowerStat, PowerStatIcon } from './data';

export function InvestigationHero({ data }: { data: InvestigationHeroData }) {
  return (
    <section
      className="relative overflow-hidden rounded-[24px] text-white"
      style={{
        background: 'linear-gradient(180deg, #0F0A1E 0%, #07050D 100%)',
        boxShadow:
          '0 1px 0 rgba(255,255,255,0.06) inset, 0 30px 60px -30px rgba(15,10,30,0.55)',
      }}
    >
      {/* Top-right purple bloom */}
      <span
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          top: '-160px',
          right: '-120px',
          width: '520px',
          height: '380px',
          background:
            'radial-gradient(ellipse, rgba(127,90,240,0.30) 0%, transparent 60%)',
        }}
      />
      {/* Subtle dot grid */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative px-12 py-10">
        {/* Eyebrow byline */}
        <header className="mb-7">
          <span className="inline-flex items-center gap-[10px] text-[14px]">
            <span
              className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-[6px] text-[12px] font-bold text-white"
              style={{ background: data.projectAvatarBg }}
              aria-hidden
            >
              {data.projectAvatarLetter}
            </span>
            <span className="font-semibold text-white">{data.agentName}</span>
            <span style={{ color: 'rgba(184,174,218,0.5)' }}>·</span>
            <span style={{ color: 'rgba(184,174,218,0.85)' }}>
              {data.projectName}
            </span>
          </span>
        </header>

        {/* Big completion line */}
        <BigCompletionLine duration={data.duration} window={data.window} />

        {/* Two-column: headline + power stats (left) | mascot (right) */}
        <div className="mt-6 flex items-start justify-between gap-10">
          <div className="flex-1" style={{ maxWidth: '780px' }}>
            <h1
              className="font-display font-black text-white"
              style={{
                fontSize: 'clamp(44px, 5.4vw, 64px)',
                letterSpacing: '-0.035em',
                lineHeight: '0.96',
              }}
            >
              {data.headline.replace(/\.$/, '')}
              <span style={{ color: '#7F5AF0' }}>.</span>
            </h1>

            {/* Power-stat boxes */}
            <div className="mt-9 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {data.powerStats.map((s) => (
                <PowerStatBox key={s.label} stat={s} />
              ))}
            </div>
          </div>

          {/* Mascot */}
          <div
            className="relative hidden shrink-0 lg:block"
            style={{ width: '220px', height: '220px' }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute"
              style={{
                top: '50%',
                left: '50%',
                width: '280px',
                height: '280px',
                transform: 'translate(-50%, -50%)',
                background:
                  'radial-gradient(circle, rgba(127,90,240,0.30) 0%, transparent 65%)',
              }}
            />
            <div className="relative flex h-full w-full items-center justify-center">
              <SpyMascot size={200} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Big completion line ─────────────────────────────────────────────────

function BigCompletionLine({
  duration,
  window,
}: {
  duration: string;
  window: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-[18px]">
      <span
        className="inline-flex items-center gap-[10px] rounded-[14px] px-[14px] py-[8px]"
        style={{
          background: 'rgba(93,202,165,0.14)',
          boxShadow: 'inset 0 0 0 1px rgba(93,202,165,0.32)',
        }}
      >
        <span
          aria-hidden
          className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full"
          style={{ background: '#5DCAA5' }}
        >
          <Check size={11} weight="bold" style={{ color: '#0F0A1E' }} />
        </span>
        <span
          className="text-[15px] font-bold uppercase"
          style={{ color: '#9CE5C5', letterSpacing: '0.04em' }}
        >
          Completed
        </span>
      </span>

      <span
        aria-hidden
        className="inline-block h-[6px] w-[6px] rounded-full"
        style={{ background: 'rgba(184,174,218,0.4)' }}
      />

      <span
        className="font-display tabular-nums text-white"
        style={{
          fontSize: '22px',
          fontWeight: 700,
          letterSpacing: '-0.012em',
        }}
      >
        {duration}
      </span>

      <span
        aria-hidden
        className="inline-block h-[6px] w-[6px] rounded-full"
        style={{ background: 'rgba(184,174,218,0.4)' }}
      />

      <span
        className="text-[18px] font-semibold"
        style={{ color: 'rgba(255,255,255,0.85)', letterSpacing: '-0.005em' }}
      >
        {window}
      </span>
    </div>
  );
}

// ─── Power stat box ──────────────────────────────────────────────────────

function PowerStatBox({ stat }: { stat: PowerStat }) {
  return (
    <div
      className="rounded-[16px] px-6 py-5"
      style={{
        background: 'rgba(127,90,240,0.10)',
        boxShadow: 'inset 0 0 0 1px rgba(168,140,255,0.22)',
      }}
    >
      <div className="mb-4 flex items-center gap-[10px]">
        <span
          aria-hidden
          className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[10px]"
          style={{
            background: 'rgba(127,90,240,0.18)',
            color: '#C9B5FF',
          }}
        >
          {iconFor(stat.iconId)}
        </span>
      </div>
      <div
        className="font-display tabular-nums text-white"
        style={{
          fontSize: '36px',
          fontWeight: 700,
          letterSpacing: '-0.025em',
          lineHeight: 1,
        }}
      >
        {stat.value}
      </div>
      <div
        className="mt-2 text-[13.5px] leading-[1.4]"
        style={{ color: 'rgba(184,174,218,0.85)' }}
      >
        {stat.label}
      </div>
    </div>
  );
}

function iconFor(id: PowerStatIcon) {
  const size = 16;
  const weight = 'bold' as const;
  switch (id) {
    case 'path':              return <Path size={size} weight={weight} />;
    case 'lightning':         return <Lightning size={size} weight="fill" />;
    case 'clock':             return <Clock size={size} weight={weight} />;
    case 'magnifying-glass':  return <MagnifyingGlass size={size} weight={weight} />;
    case 'target':            return <Target size={size} weight={weight} />;
    case 'puzzle':            return <PuzzlePiece size={size} weight="fill" />;
    case 'database':          return <Database size={size} weight={weight} />;
    case 'stack':             return <Stack size={size} weight={weight} />;
  }
}
