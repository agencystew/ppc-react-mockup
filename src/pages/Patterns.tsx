import { useState, useEffect, useRef, type ReactNode } from 'react';
import {
  Sparkle, Cube, Stack, ArrowsClockwise,
  MagnifyingGlass, ArrowRight, X, Info,
  ClockCounterClockwise, Funnel, CaretDown,
  TrendUp, Wrench, CalendarBlank, UsersThree, Target,
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
    <div className="flex min-h-screen flex-col">
      <DarkHero />
      <LightTable />
    </div>
  );
}

// ─── Dark hero ───────────────────────────────────────────────────────────

function DarkHero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#070512] text-white">
      <StarField />
      <PerspectiveGrid />
      <BloomGlow />

      <div className="relative z-[2] mx-auto w-full max-w-[1480px] px-6 pb-16 pt-6 lg:px-12 lg:pb-20 lg:pt-7">
        <UtilityStrip />
        <div className="mt-10 grid grid-cols-1 items-center gap-10 lg:mt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-14">
          <HeroCopy />
          <HeroIllustration />
        </div>
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

function UtilityStrip() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 backdrop-blur-sm">
      <div className="inline-flex items-center gap-3 text-[13px] text-white/80">
        <span className="grid h-5 w-5 place-items-center text-ppc-purple-400">
          <Sparkle size={14} weight="fill" />
        </span>
        <span className="font-medium text-white">Sweep complete</span>
        <span className="text-white/30">·</span>
        <span>5 ideas ready</span>
        <span className="text-white/30">·</span>
        <span className="text-white/55">2h ago</span>
      </div>
      <div className="inline-flex items-center gap-3">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full bg-ppc-purple-500 px-4 py-1.5 text-[13px] font-medium text-white shadow-[0_6px_22px_rgba(127,90,240,0.45)] transition-shadow hover:shadow-[0_8px_28px_rgba(127,90,240,0.6)]"
        >
          <Lightning size={13} weight="fill" />
          Run sweep
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] text-white/80 transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          <ClockCounterClockwise size={13} weight="bold" />
          Sweep history
        </button>
      </div>
    </div>
  );
}

function Lightning(props: { size: number; weight: 'fill' | 'bold' }) {
  // Inline mini bolt — kept self-contained so the utility strip doesn't
  // reach for another phosphor icon for a single 13px glyph.
  return (
    <svg viewBox="0 0 24 24" width={props.size} height={props.size} fill="currentColor">
      <path d="M13 2L4.5 13.5h6L9 22l9.5-12.5h-6L13 2z" />
    </svg>
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

      <div className="mt-7 flex max-w-[540px] items-start gap-2.5">
        <p className="text-[16.5px] leading-[1.5] text-white/65">
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

      <StatsRow />
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

interface Stat { icon: ReactNode; value: string; label: string; }

function StatsRow() {
  const stats: Stat[] = [
    { icon: <Cube size={20} weight="duotone" />,         value: '102', label: 'projects scanned' },
    { icon: <Stack size={20} weight="duotone" />,        value: '416', label: 'agent runs' },
    { icon: <Sparkle size={20} weight="duotone" />,      value: '5',   label: 'ideas held' },
    { icon: <ArrowsClockwise size={20} weight="bold" />, value: '3',   label: 'seen again' },
  ];
  return (
    <div className="mt-10 grid max-w-[560px] grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4 sm:gap-x-4">
      {stats.map((s) => (
        <div key={s.label} className="min-w-0">
          <span className="text-ppc-purple-300">{s.icon}</span>
          <div className="mt-3 text-[34px] font-bold leading-none text-white">{s.value}</div>
          <div className="mt-2 text-[12px] leading-tight text-white/55">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

function HeroIllustration() {
  const [imgOk, setImgOk] = useState(true);
  return (
    <div className="relative mx-auto h-[420px] w-full max-w-[640px] lg:h-[460px]">
      {imgOk ? (
        <img
          src="/patterns-hero.png"
          alt="PPC.io's pattern machine printing surfaced themes"
          onError={() => setImgOk(false)}
          className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_30px_60px_rgba(127,90,240,0.35)]"
        />
      ) : (
        <FallbackOrb />
      )}
    </div>
  );
}

function FallbackOrb() {
  // Until /patterns-hero.png is dropped into public/, this CSS-art stands in.
  // It hints at the printer + brain + cards composition without trying to be
  // a literal copy of the 3D render.
  return (
    <div className="relative h-full w-full">
      {/* glow */}
      <div
        className="absolute left-1/2 top-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(192,162,255,0.55) 0%, rgba(127,90,240,0.35) 35%, transparent 70%)',
        }}
      />
      {/* orb */}
      <div
        className="absolute left-1/2 top-1/2 h-[180px] w-[180px] -translate-x-1/2 -translate-y-1/2 rounded-full ring-1 ring-white/20"
        style={{
          background:
            'radial-gradient(circle at 35% 30%, #C5A8FF 0%, #7F5AF0 45%, #281A57 100%)',
        }}
      />
      {/* faux cards stack */}
      <div className="absolute bottom-12 right-8 flex flex-col items-end gap-2">
        {['Research intent leakage', 'Trust proof gap', 'Tracking fix recurrence'].map((t, i) => (
          <div
            key={t}
            className="rounded-[10px] border border-white/10 bg-white/[0.08] px-3 py-1.5 text-[11.5px] font-medium text-white/85 backdrop-blur-md"
            style={{ transform: `translateX(${i * -8}px)` }}
          >
            {t}
          </div>
        ))}
      </div>
      <p className="absolute bottom-2 left-2 text-[10px] uppercase tracking-wide text-white/30">
        Drop public/patterns-hero.png to swap this in
      </p>
    </div>
  );
}

// ─── Light table section ─────────────────────────────────────────────────

type FilterKey = 'new' | 'saved' | 'archived';

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
    <section className="relative -mt-3 flex-1 rounded-t-[32px] bg-white">
      <div className="mx-auto w-full max-w-[1480px] px-6 pb-16 pt-10 lg:px-12 lg:pb-20 lg:pt-12">
        <FilterBar filter={filter} onChange={setFilter} query={query} onQuery={setQuery} />

        <div className="mt-10">
          <div className="flex items-center gap-2.5">
            <h2 className="font-display text-[24px] font-bold leading-none tracking-h2 text-ppc-ink">
              Patterns Surfaced
            </h2>
            <span className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-full bg-[#EFE9FB] px-2 text-[12px] font-semibold text-ppc-purple-700">
              {rows.length}
            </span>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {rows.map((pattern, idx) => (
              <PatternCard
                key={pattern.id}
                pattern={pattern}
                index={idx + 1}
                expanded={expandedId === pattern.id}
                onToggle={() =>
                  setExpandedId(expandedId === pattern.id ? null : pattern.id)
                }
              />
            ))}
          </div>

          <p className="mt-6 text-center text-[12.5px] text-ppc-text-faint">
            Showing {rows.length} of {PATTERNS.length} patterns
          </p>
        </div>
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
  const pills: Array<{ key: FilterKey; label: string }> = [
    { key: 'new',      label: 'New'      },
    { key: 'saved',    label: 'Saved'    },
    { key: 'archived', label: 'Archived' },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="inline-flex items-center gap-1 rounded-full bg-[#F4F1FA] p-1">
        {pills.map((p) => {
          const active = filter === p.key;
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => onChange(p.key)}
              className={`inline-flex items-center rounded-full px-4 py-2 text-[13.5px] font-semibold transition-colors ${
                active
                  ? 'bg-white text-ppc-purple-700 shadow-[0_1px_3px_rgba(15,10,30,0.06)]'
                  : 'text-ppc-text-muted hover:text-ppc-ink'
              }`}
            >
              {p.label}
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
          <CaretDown size={12} weight="bold" className="text-ppc-text-faint" />
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

type RowStatus = 'New' | 'Needs review';

const ROW_STATUS: Record<string, RowStatus> = {
  'p-01': 'New',
  'p-02': 'New',
  'p-03': 'New',
  'p-04': 'Needs review',
  'p-05': 'New',
};

const STATUS_STYLES: Record<RowStatus, string> = {
  'New':          'text-ppc-purple-700',
  'Needs review': 'text-[#A06B19]',
};

interface PatternCardProps {
  pattern: Pattern;
  index: number;
  expanded: boolean;
  onToggle: () => void;
}

function PatternCard({ pattern, index, expanded, onToggle }: PatternCardProps) {
  const Icon = PATTERN_ICONS[pattern.id] ?? Target;
  const status = ROW_STATUS[pattern.id] ?? 'New';
  const receipts =
    pattern.drivenBy.reduce((sum, d) => sum + d.findingsCount, 0) + 1;

  return (
    <article
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle();
        }
      }}
      role="button"
      tabIndex={0}
      className={`group cursor-pointer rounded-[18px] border bg-white p-6 transition-all hover:border-ppc-purple-300 ${
        expanded
          ? 'border-ppc-purple-400 shadow-[0_2px_28px_rgba(127,90,240,0.10)] lg:col-span-2'
          : 'border-ppc-card-border'
      }`}
    >
      <div className="flex items-start gap-5">
        <span className="w-[34px] shrink-0 pt-1.5 text-[28px] font-medium leading-none tabular-nums text-ppc-text-faint">
          {String(index).padStart(2, '0')}
        </span>

        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#F4F0FB] text-ppc-purple-700">
          <Icon size={22} weight="duotone" />
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="text-[16.5px] font-bold leading-snug text-ppc-ink">
            {pattern.headline}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-[13.5px] leading-[1.5] text-ppc-text-muted">
            {pattern.whatWeFound}
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="text-[13px] text-ppc-text-muted">
              <span className="font-semibold text-ppc-ink">
                {pattern.affected.length}
              </span>{' '}
              accounts
              <span className="mx-1.5 text-ppc-text-faint">·</span>
              <span className="font-semibold text-ppc-ink">{receipts}</span>{' '}
              receipts
              <span className="mx-1.5 text-ppc-text-faint">·</span>
              <span className={`font-semibold ${STATUS_STYLES[status]}`}>
                {status}
              </span>
            </div>
            <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-ppc-purple-700 transition-transform group-hover:translate-x-0.5">
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
          </div>
        </div>
      </div>

      {expanded && (
        <div className="mt-5 border-t border-[#EDE8F5] pt-5">
          <ExpandedDetail pattern={pattern} />
        </div>
      )}
    </article>
  );
}

function ExpandedDetail({ pattern }: { pattern: Pattern }) {
  return (
    <div className="grid grid-cols-1 gap-x-10 gap-y-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div>
        <SectionLabel>Why it matters</SectionLabel>
        <p className="mt-1.5 text-[14px] leading-[1.55] text-ppc-ink/85">
          {pattern.whyItMatters}
        </p>

        <SectionLabel className="mt-5">Recommended action</SectionLabel>
        <p className="mt-1.5 text-[14px] leading-[1.55] text-ppc-ink/85">
          {pattern.recommendedAction}
        </p>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-grad-cta px-4 py-2 text-[13px] font-medium text-white shadow-[0_2px_10px_rgba(83,74,183,0.30)] hover:opacity-95"
        >
          {pattern.recommendedActionCta}
          <ArrowRight size={13} weight="bold" />
        </button>
      </div>

      <div className="space-y-5">
        <div>
          <SectionLabel>Affected accounts</SectionLabel>
          <ul className="mt-2 space-y-1.5">
            {pattern.affected.map((a) => (
              <li
                key={a.id}
                className="flex items-center gap-2 text-[13px] text-ppc-ink"
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-[#F4F0FB] text-[10px] font-semibold text-ppc-purple-800">
                  {initialsOf(a.name)}
                </span>
                {a.name}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <SectionLabel>Driven by</SectionLabel>
          <ul className="mt-2 space-y-1.5">
            {pattern.drivenBy.map((d) => (
              <li
                key={d.agentName}
                className="flex items-center gap-2 text-[13px] text-ppc-ink"
              >
                <span className="text-[14px]">{d.agentEmoji}</span>
                <span className="font-medium">{d.agentName}</span>
                <span className="text-ppc-text-muted">
                  · {d.findingsCount} finding{d.findingsCount === 1 ? '' : 's'}
                </span>
                {d.modifier && (
                  <span className="text-ppc-text-faint">· {d.modifier}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`text-[11px] font-semibold tracking-wide text-ppc-text-faint ${className}`}>
      {children}
    </div>
  );
}

function initialsOf(name: string): string {
  return name
    .replace(/[—–-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();
}
