import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkle,
  MagnifyingGlass, ArrowRight, X, Info,
  Funnel, CaretDown,
  ArrowsClockwise, BookmarkSimple, Archive,
  TrendUp, Wrench, CalendarBlank, UsersThree, Target,
  Briefcase, ClockCounterClockwise, Brain, Plugs,
  Lightbulb,
} from '@phosphor-icons/react';
import { PATTERNS, type Pattern } from '../mock/patterns';

/* /patterns — dark editorial hero + light "Patterns Surfaced" table.
 *
 * Page anatomy:
 *   1. DarkHero        — full-bleed black canvas, starfield + perspective
 *                        grid, utility strip at top, big headline + gradient
 *                        italic accent, stats row, hero illustration on right
 *   2. LightTable      — rounded-top white panel sitting under the hero with
 *                        filter pills, search, and the "Patterns Surfaced"
 *                        row list — click any row to expand inline detail
 *
 * Hero illustration loads from /patterns-hero.png (drop the file in /public).
 * If absent, a CSS-only glowing-orb fallback renders in the same slot. */

// ─── Page ────────────────────────────────────────────────────────────────

export function Patterns() {
  return (
    <div className="min-h-screen bg-ppc-canvas px-3 pb-6 pt-3 lg:px-5 lg:pb-8 lg:pt-5">
      <DarkHero />
      <LightTable />
    </div>
  );
}

// ─── Dark hero ───────────────────────────────────────────────────────────

function DarkHero() {
  return (
    <section className="relative isolate overflow-hidden rounded-[28px] border border-white/[0.06] bg-[#070512] text-white shadow-[0_30px_80px_-32px_rgba(15,10,30,0.45)]">
      <StarField />
      <PerspectiveGrid />
      <BloomGlow />

      <div className="relative z-[2] px-6 pb-7 pt-7 lg:px-12 lg:pb-9 lg:pt-9">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12">
          <HeroCopy />
          <HeroIllustration />
        </div>
        <SignalFlowPanel />
      </div>
    </section>
  );
}

function StarField() {
  // Hand-placed dots — deterministic, varied opacities + sizes. Avoids
  // generative randomness so layout is stable across re-renders.
  const stars: Array<[number, number, number, number]> = [
    [4, 12, 1, 0.45], [12, 28, 1, 0.35], [22, 8, 1.5, 0.6],
    [33, 22, 1, 0.4], [40, 6, 1, 0.5], [48, 18, 1, 0.35],
    [58, 12, 1.5, 0.55], [66, 30, 1, 0.4], [74, 6, 1, 0.45],
    [82, 22, 1, 0.5], [88, 14, 1.5, 0.6], [94, 28, 1, 0.4],
    [16, 42, 1, 0.3], [28, 50, 1, 0.35], [44, 44, 1, 0.4],
    [62, 48, 1.5, 0.5], [78, 40, 1, 0.35], [90, 52, 1, 0.45],
    [6, 64, 1, 0.3], [20, 70, 1, 0.4], [36, 62, 1, 0.35],
    [54, 70, 1.5, 0.5], [70, 64, 1, 0.4], [86, 72, 1, 0.45],
  ];
  return (
    <div className="pointer-events-none absolute inset-0 z-[1]">
      {stars.map(([x, y, r, o], i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: `${r}px`,
            height: `${r}px`,
            opacity: o,
            boxShadow: r > 1 ? '0 0 6px rgba(255,255,255,0.4)' : undefined,
          }}
        />
      ))}
    </div>
  );
}

function PerspectiveGrid() {
  // Perspective floor at the bottom of the hero — purple grid lines
  // fading upward via a mask gradient. Pure SVG for crispness at retina.
  return (
    <svg
      aria-hidden
      viewBox="0 0 1480 480"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[60%] w-full"
      style={{
        maskImage: 'linear-gradient(to top, black 0%, black 30%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to top, black 0%, black 30%, transparent 100%)',
      }}
    >
      {/* horizontal grid lines (converging slightly toward horizon) */}
      {Array.from({ length: 10 }, (_, i) => {
        const y = 480 - i * (480 / 9);
        const opacity = 0.06 + (i / 10) * 0.05;
        return (
          <line
            key={`h-${i}`}
            x1="0" y1={y} x2="1480" y2={y}
            stroke="#7F5AF0" strokeOpacity={opacity} strokeWidth="1"
          />
        );
      })}
      {/* vertical perspective lines converging at center horizon */}
      {Array.from({ length: 21 }, (_, i) => {
        const xBottom = (i / 20) * 1480;
        const xTop = 740 + (xBottom - 740) * 0.15;
        return (
          <line
            key={`v-${i}`}
            x1={xBottom} y1="480" x2={xTop} y2="60"
            stroke="#7F5AF0" strokeOpacity="0.08" strokeWidth="1"
          />
        );
      })}
    </svg>
  );
}

function BloomGlow() {
  // Soft purple bloom in upper-right behind the hero illustration.
  return (
    <div
      className="pointer-events-none absolute right-[-10%] top-[-30%] z-[1] h-[700px] w-[700px] rounded-full opacity-70"
      style={{
        background: 'radial-gradient(circle, rgba(127,90,240,0.45) 0%, rgba(127,90,240,0.15) 30%, transparent 70%)',
      }}
    />
  );
}

function HeroCopy() {
  const [infoOpen, setInfoOpen] = useState(false);
  const popRef = useRef<HTMLDivElement | null>(null);

  // Click-outside close.
  useEffect(() => {
    if (!infoOpen) return;
    const onClick = (e: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) {
        setInfoOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setInfoOpen(false); };
    window.addEventListener('mousedown', onClick);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onClick);
      window.removeEventListener('keydown', onKey);
    };
  }, [infoOpen]);

  return (
    <div>
      <h1 className="font-display text-[72px] font-black leading-[0.96] -tracking-[0.03em] text-white xl:text-[88px]">
        Patterns
        <br />
        <span
          className="bg-clip-text font-medium italic text-transparent"
          style={{
            backgroundImage:
              'linear-gradient(92deg, #FF9A52 0%, #EC5BB7 38%, #B987F7 72%, #8B6BF0 100%)',
          }}
        >
          Across Your Agency.
        </span>
      </h1>

      <div className="mt-5 flex max-w-[540px] items-start gap-2.5">
        <p className="text-[16px] leading-[1.5] text-white/65">
          Experimental reads PPC.io found across accounts, agents, and source data.
        </p>
        <div ref={popRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setInfoOpen((v) => !v)}
            className="grid h-7 w-7 place-items-center rounded-full bg-white/[0.06] text-ppc-purple-400 ring-1 ring-white/10 transition hover:bg-white/[0.10] hover:text-ppc-purple-300"
            aria-label="What is Patterns?"
            aria-expanded={infoOpen}
          >
            <Sparkle size={13} weight="fill" />
          </button>
          {infoOpen && <InfoPopover onClose={() => setInfoOpen(false)} />}
        </div>
      </div>

      <RunSweepLauncher />
    </div>
  );
}

function RunSweepLauncher() {
  const [open, setOpen] = useState(false);
  const [freq, setFreq] = useState<'weekly' | 'monthly' | 'custom'>('weekly');
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('mousedown', onDoc);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onDoc);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative mt-6 inline-flex">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-full bg-grad-cta px-5 py-2.5 text-[14px] font-semibold text-white shadow-[0_10px_28px_rgba(127,90,240,0.45)] transition-shadow hover:shadow-[0_14px_36px_rgba(127,90,240,0.55)]"
      >
        <Sparkle size={14} weight="fill" />
        Run Pattern Sweep
        <CaretDown
          size={12}
          weight="bold"
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && <RunSweepPopover freq={freq} onFreqChange={setFreq} onClose={() => setOpen(false)} />}
    </div>
  );
}

interface RunSweepPopoverProps {
  freq: 'weekly' | 'monthly' | 'custom';
  onFreqChange: (f: 'weekly' | 'monthly' | 'custom') => void;
  onClose: () => void;
}

function RunSweepPopover({ freq, onFreqChange, onClose }: RunSweepPopoverProps) {
  const freqLabel = freq === 'weekly' ? 'week' : freq === 'monthly' ? 'month' : 'cadence';
  return (
    <div
      role="dialog"
      className="absolute left-0 top-[calc(100%+10px)] z-[20] w-[380px] rounded-[16px] border border-white/10 bg-[#0F0A22]/95 p-5 shadow-[0_30px_70px_rgba(0,0,0,0.55)] backdrop-blur-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="inline-flex items-center gap-2 text-white">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-ppc-purple-500/20 text-ppc-purple-300">
            <Sparkle size={13} weight="fill" />
          </span>
          <h4 className="text-[14px] font-semibold">Run Pattern Sweep</h4>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-white/50 hover:text-white"
          aria-label="Close"
        >
          <X size={14} weight="bold" />
        </button>
      </div>

      <p className="mt-3 text-[12.5px] leading-[1.55] text-white/65">
        Every <span className="font-semibold text-white">{freqLabel}</span> PPC.io
        sifts through your accounts, agent runs, and history to surface new strategic
        patterns worth your attention.
      </p>

      <div className="mt-4">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-white/40">
          Cadence
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {(['weekly', 'monthly', 'custom'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => onFreqChange(f)}
              className={`rounded-full px-3 py-2 text-[12.5px] font-semibold capitalize transition-colors ${
                freq === f
                  ? 'bg-white text-ppc-purple-700 ring-1 ring-white/30'
                  : 'bg-white/[0.04] text-white/70 ring-1 ring-white/10 hover:bg-white/[0.08]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          className="flex-1 rounded-full bg-grad-cta px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_4px_16px_rgba(127,90,240,0.4)] hover:opacity-95"
        >
          Schedule sweep
        </button>
        <button
          type="button"
          className="rounded-full border border-white/15 bg-white/[0.04] px-4 py-2.5 text-[13px] font-medium text-white/85 hover:bg-white/[0.08]"
        >
          Run once now
        </button>
      </div>
    </div>
  );
}

function InfoPopover({ onClose }: { onClose: () => void }) {
  return (
    <div
      role="dialog"
      className="absolute left-1/2 top-[calc(100%+10px)] z-[20] w-[320px] -translate-x-1/2 rounded-[14px] border border-white/10 bg-[#0F0A22]/95 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="inline-flex items-center gap-2 text-white">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-ppc-purple-500/20 text-ppc-purple-300">
            <Info size={13} weight="fill" />
          </span>
          <span className="text-[13.5px] font-semibold">What is Patterns?</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-white/50 hover:text-white"
          aria-label="Close"
        >
          <X size={14} weight="bold" />
        </button>
      </div>
      <p className="mt-3 text-[12.5px] leading-[1.55] text-white/70">
        Patterns surfaces themes PPC.io spots across your accounts, agents, and
        source data — the things showing up in more than one place. This is an
        experimental feature; treat surfaced ideas as starting points and bring
        your own judgement.
      </p>
      <p className="mt-2 text-[12.5px] font-medium leading-[1.55] text-ppc-purple-300">
        Strong human judgement required.
      </p>
      <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-l border-t border-white/10 bg-[#0F0A22]/95" />
    </div>
  );
}

// ─── Signal Flow visualization ───────────────────────────────────────────
// Replaces the old three-card "Scan / Group / Surface" row. The idea is
// to *show* PPC.io connecting dots — six live sources stream signals into
// a clustered cloud, the cloud collapses into the AI lens at the centre,
// and three named patterns emerge on the right. Conveys "this thing is
// digging" without needing a single explainer word.

interface SignalSource {
  icon: typeof MagnifyingGlass;
  label: string;
  age: string;
  tint: string;        // text-color class for the icon
}

const SOURCES: SignalSource[] = [
  { icon: Briefcase,             label: 'Business Context',    age: '2h ago',  tint: 'text-[#7BD6A8]' },
  { icon: Brain,                 label: 'Agent Memory',        age: '1h ago',  tint: 'text-[#B7A8EC]' },
  { icon: ClockCounterClockwise, label: 'History',             age: '45m ago', tint: 'text-[#93C2F8]' },
  { icon: Plugs,                 label: 'Connected Accounts',  age: '30m ago', tint: 'text-[#F4A871]' },
];

function SignalFlowPanel() {
  return (
    <div className="mt-9 overflow-hidden rounded-[18px] border border-white/[0.07] bg-white/[0.025] p-5 backdrop-blur-sm lg:mt-10 lg:p-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,200px)_minmax(0,1fr)_minmax(0,300px)] lg:items-stretch lg:gap-6">
        <SourceColumn />
        <FlowCanvas />
        <OutputColumn />
      </div>
    </div>
  );
}

function SourceColumn() {
  return (
    <ul className="flex flex-col justify-between gap-2.5 self-stretch py-1">
      {SOURCES.map(({ icon: Icon, label, age, tint }) => (
        <li key={label} className="flex items-center gap-2.5">
          <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/[0.04] ring-1 ring-white/10 ${tint}`}>
            <Icon size={13} weight="duotone" />
          </span>
          <div className="min-w-0 leading-tight">
            <div className="text-[12.5px] font-semibold text-white">{label}</div>
            <div className="text-[10.5px] text-white/40">· {age}</div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function OutputColumn() {
  return (
    <div className="flex h-full items-center">
      <StrategicPatternCard />
    </div>
  );
}

function StrategicPatternCard() {
  return (
    <div className="relative w-full overflow-hidden rounded-[18px] border border-white/[0.12] bg-white/[0.05] p-5 backdrop-blur-sm">
      {/* corner bloom */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-ppc-purple-500/20 blur-3xl" />

      <div className="relative flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] font-medium text-white/80 ring-1 ring-white/10">
          <span aria-hidden>💡</span> Insight
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] font-medium text-white/80 ring-1 ring-white/10">
          <span aria-hidden>💲</span> Revenue lift
        </span>
      </div>

      <div className="relative mt-3 flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-ppc-purple-500/35 to-ppc-purple-500/[0.06] text-white shadow-[inset_0_0_0_1px_rgba(168,140,255,0.40)]">
          <Lightbulb size={20} weight="duotone" />
        </span>
        <div className="min-w-0">
          <h4 className="text-[19px] font-bold leading-tight text-white">
            Strategic Pattern
          </h4>
          <p className="mt-1.5 text-[12.5px] leading-[1.5] text-white/55">
            The dot-connecting moment — where account-level signals add up to one move worth making.
          </p>
        </div>
      </div>
    </div>
  );
}

/* The dot cloud SVG.
 *
 * 6 source paths curve from the left edge through a scatter of coloured
 * dots into the AI lens at ~ (370, 120). 3 output paths leave the lens
 * and curve to the right edge at the y-positions of the three pattern
 * rows. Dots are hand-placed for visual rhythm — denser nearer the lens,
 * sparser at the edges. */

type DotColor = 'purple' | 'blue' | 'green' | 'orange' | 'gray' | 'bright';

const DOT_FILL: Record<DotColor, string> = {
  purple: '#B7A8EC',
  blue:   '#93C2F8',
  green:  '#7BD6A8',
  orange: '#F4A871',
  gray:   '#7E7995',
  bright: '#A88CFF',
};

// Each dot: [x, y, r, color]. Coordinates inside the 520×240 viewBox.
const DOTS: Array<[number, number, number, DotColor]> = [
  // top band — green + purple (Business context + Google Ads streams)
  [40,  28, 3,   'gray'],   [78,  18, 3.5, 'green'],  [108, 32, 3,   'purple'],
  [148, 22, 4,   'green'],  [188, 28, 3.5, 'purple'], [228, 18, 3,   'bright'],
  [85,  46, 3.5, 'gray'],   [128, 50, 3,   'green'],  [168, 50, 4,   'purple'],

  // upper-mid — blues (Google Ads + Search)
  [55,  72, 3.5, 'blue'],   [98,  68, 4,   'blue'],   [142, 76, 3,   'blue'],
  [186, 70, 3.5, 'gray'],   [228, 78, 4,   'purple'], [262, 70, 3,   'blue'],

  // mid — mixed cluster heading toward the lens
  [70,  100, 3,   'orange'], [115, 108, 3.5, 'purple'], [158, 100, 4,   'blue'],
  [200, 110, 3,   'green'],  [240, 104, 3.5, 'orange'], [278, 112, 4,   'bright'],
  [310, 118, 3,   'bright'],

  // lower-mid — orange (Audit runs) + gray
  [60,  138, 3,   'orange'], [100, 144, 3.5, 'gray'],   [145, 138, 4,   'orange'],
  [188, 148, 3,   'purple'], [228, 142, 3.5, 'orange'], [262, 148, 3,   'gray'],

  // bottom band — purples + blues (Landing pages + History)
  [50,  178, 3,   'purple'], [92,  186, 3.5, 'bright'], [136, 178, 4,   'purple'],
  [180, 188, 3,   'blue'],   [222, 178, 3.5, 'purple'], [50,  218, 3,   'blue'],
  [88,  226, 3,   'gray'],   [134, 220, 4,   'purple'], [180, 230, 3,   'blue'],
  [224, 220, 3.5, 'green'],
];

// Source row y-positions in viewBox space — match the SourceColumn rhythm.
// 4 rows distributed evenly across the 248 viewBox.
const SOURCE_Y = [34, 100, 166, 226];
// One output centred vertically — the Strategic Pattern card.
const OUTPUT_Y = [124];

function FlowCanvas() {
  const LENS_CX = 370;
  const LENS_CY = 120;
  return (
    <div className="relative mx-auto h-full min-h-[220px] w-full">
      <svg
        viewBox="0 0 520 248"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Signal flow from six live sources into three surfaced patterns"
      >
        <defs>
          <radialGradient id="lensCore" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.85" />
            <stop offset="35%"  stopColor="#D6CBFA" stopOpacity="0.65" />
            <stop offset="65%"  stopColor="#7F5AF0" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#7F5AF0" stopOpacity="0"    />
          </radialGradient>
          <linearGradient id="lineIn" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#7F5AF0" stopOpacity="0"    />
            <stop offset="100%" stopColor="#7F5AF0" stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id="lineOut" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#7F5AF0" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#7F5AF0" stopOpacity="0"    />
          </linearGradient>
        </defs>

        {/* source → lens curves */}
        {SOURCE_Y.map((y, i) => (
          <path
            key={`in-${i}`}
            d={`M -4 ${y} C 140 ${y}, 260 ${LENS_CY}, ${LENS_CX - 22} ${LENS_CY}`}
            stroke="url(#lineIn)"
            strokeWidth="1"
            fill="none"
          />
        ))}

        {/* lens → output curves */}
        {OUTPUT_Y.map((y, i) => (
          <path
            key={`out-${i}`}
            d={`M ${LENS_CX + 22} ${LENS_CY} C 440 ${LENS_CY}, 480 ${y}, 524 ${y}`}
            stroke="url(#lineOut)"
            strokeWidth="1"
            fill="none"
          />
        ))}

        {/* lens — soft glow + ring + sparkle marks */}
        <circle cx={LENS_CX} cy={LENS_CY} r={48} fill="url(#lensCore)" />
        <circle
          cx={LENS_CX}
          cy={LENS_CY}
          r={28}
          fill="none"
          stroke="#A88CFF"
          strokeOpacity={0.4}
          strokeWidth={1}
        />
        <circle
          cx={LENS_CX}
          cy={LENS_CY}
          r={42}
          fill="none"
          stroke="#A88CFF"
          strokeOpacity={0.18}
          strokeWidth={1}
          strokeDasharray="2 3"
        />
        {/* sparkle glyph in the lens */}
        <path
          d={`M ${LENS_CX} ${LENS_CY - 14} L ${LENS_CX + 3} ${LENS_CY - 3} L ${LENS_CX + 14} ${LENS_CY} L ${LENS_CX + 3} ${LENS_CY + 3} L ${LENS_CX} ${LENS_CY + 14} L ${LENS_CX - 3} ${LENS_CY + 3} L ${LENS_CX - 14} ${LENS_CY} L ${LENS_CX - 3} ${LENS_CY - 3} Z`}
          fill="#FFFFFF"
          opacity={0.95}
        />
        <path
          d={`M ${LENS_CX + 12} ${LENS_CY - 12} L ${LENS_CX + 14} ${LENS_CY - 8} L ${LENS_CX + 18} ${LENS_CY - 6} L ${LENS_CX + 14} ${LENS_CY - 4} L ${LENS_CX + 12} ${LENS_CY} L ${LENS_CX + 10} ${LENS_CY - 4} L ${LENS_CX + 6} ${LENS_CY - 6} L ${LENS_CX + 10} ${LENS_CY - 8} Z`}
          fill="#FFFFFF"
          opacity={0.75}
        />
        <path
          d={`M ${LENS_CX - 14} ${LENS_CY + 14} L ${LENS_CX - 12} ${LENS_CY + 17} L ${LENS_CX - 9} ${LENS_CY + 19} L ${LENS_CX - 12} ${LENS_CY + 21} L ${LENS_CX - 14} ${LENS_CY + 24} L ${LENS_CX - 16} ${LENS_CY + 21} L ${LENS_CX - 19} ${LENS_CY + 19} L ${LENS_CX - 16} ${LENS_CY + 17} Z`}
          fill="#FFFFFF"
          opacity={0.6}
        />

        {/* the dot cloud */}
        {DOTS.map(([x, y, r, color], i) => (
          <circle
            key={`d-${i}`}
            cx={x}
            cy={y}
            r={r}
            fill={DOT_FILL[color]}
            opacity={color === 'gray' ? 0.5 : 0.85}
          />
        ))}
      </svg>
    </div>
  );
}

function HeroIllustration() {
  return (
    <div className="relative mx-auto w-full max-w-[760px]">
      <img
        src="/patterns-hero.png"
        alt="A purple brain mascot at the PPC.io pattern desk, with New, Seen again, and Saved trays of cards on the left and Leaky landing pages, Budget drift, and Tracking gaps patterns surfacing on the right."
        width={1819}
        height={865}
        className="h-auto w-full select-none drop-shadow-[0_36px_60px_rgba(127,90,240,0.38)]"
        draggable={false}
      />
    </div>
  );
}

// ─── Light table section ─────────────────────────────────────────────────

type FilterKey = 'new' | 'seen-again' | 'saved' | 'archived';

function LightTable() {
  const [filter, setFilter] = useState<FilterKey>('new');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const rows = PATTERNS.slice(0, 5).filter((p) =>
    !query
      ? true
      : p.headline.toLowerCase().includes(query.toLowerCase()) ||
        p.whatWeFound.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <section className="relative mt-5 rounded-[28px] border border-ppc-card-border bg-white">
      <div className="px-6 pb-10 pt-9 lg:px-10 lg:pb-12 lg:pt-10">
        <FilterBar filter={filter} onChange={setFilter} query={query} onQuery={setQuery} />

        <div className="mt-8 overflow-hidden rounded-[18px] border border-ppc-card-border bg-white">
          <ul className="divide-y divide-[#EDE8F5]">
            {rows.map((pattern, idx) => (
              <PatternRow
                key={pattern.id}
                pattern={pattern}
                index={idx + 1}
                expanded={expandedId === pattern.id}
                onToggle={() =>
                  setExpandedId(expandedId === pattern.id ? null : pattern.id)
                }
              />
            ))}
          </ul>
        </div>

        <p className="mt-5 inline-flex items-center gap-2 text-[12.5px] text-ppc-text-muted">
          <Info size={14} weight="duotone" className="text-ppc-text-faint" />
          Patterns are experimental. Validate before acting.
        </p>
      </div>
    </section>
  );
}

interface FilterBarProps {
  filter: FilterKey;
  onChange: (k: FilterKey) => void;
  query: string;
  onQuery: (q: string) => void;
}

function FilterBar({ filter, onChange, query, onQuery }: FilterBarProps) {
  const pills: Array<{ key: FilterKey; label: string; icon: typeof Sparkle }> = [
    { key: 'new',        label: 'New',        icon: Sparkle },
    { key: 'seen-again', label: 'Seen again', icon: ArrowsClockwise },
    { key: 'saved',      label: 'Saved',      icon: BookmarkSimple },
    { key: 'archived',   label: 'Archived',   icon: Archive },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2.5">
        {pills.map((p) => {
          const active = filter === p.key;
          const Icon = p.icon;
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => onChange(p.key)}
              className={`inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-[13.5px] font-semibold transition-colors ${
                active
                  ? 'border-ppc-purple-400 text-ppc-purple-700 shadow-[0_0_0_1px_rgba(127,90,240,0.18)]'
                  : 'border-ppc-card-border text-ppc-ink hover:border-ppc-purple-300'
              }`}
            >
              <Icon
                size={14}
                weight={active ? 'fill' : 'regular'}
                className={active ? 'text-ppc-purple-500' : 'text-ppc-text-muted'}
              />
              {p.label}
              {active && (
                <span className="h-1.5 w-1.5 rounded-full bg-ppc-purple-500" />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex w-[280px] items-center gap-2 rounded-full border border-ppc-card-border bg-white px-3.5 py-2 lg:w-[340px]">
          <MagnifyingGlass size={15} weight="bold" className="text-ppc-text-faint" />
          <input
            type="text"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search patterns..."
            className="min-w-0 flex-1 bg-transparent text-[13.5px] text-ppc-ink placeholder:text-ppc-text-faint focus:outline-none"
          />
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full border border-ppc-card-border bg-white px-4 py-2 text-[13.5px] font-medium text-ppc-ink hover:bg-[#FAF8FE]"
        >
          <Funnel size={14} weight="bold" className="text-ppc-text-muted" />
          Filters
        </button>
      </div>
    </div>
  );
}

// Topic icon per pattern — matches the editorial intent of each row.
const PATTERN_ICONS: Record<string, typeof MagnifyingGlass> = {
  'p-01': MagnifyingGlass,
  'p-02': CalendarBlank,
  'p-03': Wrench,
  'p-04': UsersThree,
  'p-05': TrendUp,
};

type RowStatus = 'New' | 'Seen again';

const ROW_STATUS: Record<string, RowStatus> = {
  'p-01': 'New',
  'p-02': 'New',
  'p-03': 'New',
  'p-04': 'Seen again',
  'p-05': 'New',
};

interface PatternRowProps {
  pattern: Pattern;
  index: number;
  expanded: boolean;
  onToggle: () => void;
}

function PatternRow({ pattern, index, expanded, onToggle }: PatternRowProps) {
  const Icon = PATTERN_ICONS[pattern.id] ?? Target;
  const status = ROW_STATUS[pattern.id] ?? 'New';
  const receipts =
    pattern.drivenBy.reduce((sum, d) => sum + d.findingsCount, 0) + 1;

  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        className={`group flex w-full items-center gap-5 px-6 py-5 text-left transition-colors hover:bg-[#FAF8FE] ${
          expanded ? 'bg-[#FAF8FE]' : ''
        }`}
      >
        <span className="w-[28px] shrink-0 text-[14px] font-medium tabular-nums text-ppc-text-faint">
          {String(index).padStart(2, '0')}
        </span>

        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#F4F0FB] text-ppc-purple-700">
          <Icon size={20} weight="duotone" />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block text-[15.5px] font-semibold leading-snug text-ppc-ink">
            {pattern.headline}
          </span>
          <span className="mt-0.5 line-clamp-1 block text-[13px] leading-snug text-ppc-text-muted">
            {pattern.whatWeFound}
          </span>
        </span>

        <span className="hidden shrink-0 items-center gap-3 text-[13px] text-ppc-text-muted md:flex">
          <span>
            <span className="font-semibold text-ppc-ink">
              {pattern.affected.length}
            </span>{' '}
            accounts
          </span>
          <span className="text-ppc-text-faint">·</span>
          <span>
            <span className="font-semibold text-ppc-ink">{receipts}</span>{' '}
            receipts
          </span>
        </span>

        <span className="hidden w-[90px] shrink-0 justify-center md:flex">
          <StatusPill status={status} />
        </span>

        <span className="inline-flex shrink-0 items-center gap-1 text-[13px] font-semibold text-ppc-purple-700 transition-transform group-hover:translate-x-0.5">
          {expanded ? (
            <>
              Close <X size={13} weight="bold" />
            </>
          ) : (
            <>
              Open <ArrowRight size={13} weight="bold" />
            </>
          )}
        </span>
      </button>

      {expanded && (
        <div className="border-t border-[#EDE8F5] bg-[#FBFAFE] px-6 py-6 lg:px-12">
          <ExpandedDetail pattern={pattern} />
        </div>
      )}
    </li>
  );
}

function StatusPill({ status }: { status: RowStatus }) {
  return (
    <span className="inline-flex items-center rounded-md bg-[#EFE9FB] px-2 py-1 text-[11.5px] font-semibold text-ppc-purple-700">
      {status}
    </span>
  );
}

function ExpandedDetail({ pattern }: { pattern: Pattern }) {
  // Discreet preview — a single read paragraph plus two CTAs. The full
  // breakdown lives on /patterns/:id; the inline drop just nudges users
  // toward it without unloading the entire detail into the list view.
  return (
    <div className="max-w-[680px]">
      <p className="text-[13.5px] leading-[1.6] text-ppc-text-muted">
        {pattern.whyItMatters}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Link
          to={`/patterns/${pattern.id}`}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 rounded-full bg-grad-cta px-4 py-2 text-[13px] font-semibold text-white shadow-[0_2px_10px_rgba(83,74,183,0.30)] hover:opacity-95"
        >
          See full breakdown
          <ArrowRight size={13} weight="bold" />
        </Link>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 rounded-full border border-ppc-card-border bg-white px-4 py-2 text-[13px] font-medium text-ppc-ink hover:bg-white hover:border-ppc-purple-300"
        >
          <Sparkle size={13} weight="fill" className="text-ppc-purple-500" />
          Ask follow-up
        </button>
      </div>
    </div>
  );
}

