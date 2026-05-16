// v5 Deep Report tab — the agent journey, horizontal sticky strip edition.
//
// Page structure:
//   1. Journey strip (DARK, sticky)          — 7-tile horizontal nav
//   2. Phase cards stacked vertically (light) — full content, no accordion
//   3. Context cross-check card (light)
//   4. Strategy synthesis (dark climax)
//
// Replaces the previous left rail + accordion. Strip is sticky so the
// user always knows what stage they're on. IntersectionObserver tracks
// scroll position → active tile updates → click any tile to scroll-jump.
//
// Design doc: docs/plans/2026-05-16-agent-results-v5-design.md (Chunk 3)

import { useState, useEffect, useRef, useMemo } from 'react';
import {
  ArrowUp,
  ArrowDown,
  CaretDown,
  CaretRight,
  Check,
  DownloadSimple,
  MagnifyingGlass,
  ChartBar,
  TextAa,
  Browser,
  CurrencyDollar,
  PuzzlePiece,
  ShieldCheck,
  Sparkle,
  Stack,
  Warning,
  Path,
  Database,
  Target,
} from '@phosphor-icons/react';

import { COMPETITOR_SPY_V5 } from './data';
import type {
  ContextCrossCheckData,
  DeepReportData,
  PhaseV5,
  PhaseIcon,
  StrategySynthesisData,
  SynthesisRecommendation,
  Readiness,
} from './data';

// Sticky offset accounts for the sticky tab bar above.
const STICKY_TABS_HEIGHT = 124;

// ═════════════════════════════════════════════════════════════════════════
// TOP-LEVEL
// ═════════════════════════════════════════════════════════════════════════

export function DeepReportV5({ runId: _runId }: { runId: string }) {
  const data: DeepReportData = COMPETITOR_SPY_V5.deepReport;

  // Build the journey items — 6 phases + context cross-check.
  const journeyItems = useMemo<JourneyTile[]>(() => {
    const phaseTiles: JourneyTile[] = data.phases.map((p) => ({
      slug: p.slug,
      iconId: p.iconId,
      shortName: p.shortName,
      keyStat: p.keyStat,
    }));
    phaseTiles.push({
      slug: 'context-cross-check',
      iconId: 'context',
      shortName: 'Context',
      keyStat: `${data.context.used.length} dimensions`,
    });
    return phaseTiles;
  }, [data]);

  const [activeSlug, setActiveSlug] = useState<string>(journeyItems[0].slug);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // Track active phase based on scroll position.
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const slug = visible.target.id.replace('phase-section-', '');
          setActiveSlug(slug);
        }
      },
      {
        rootMargin: `-${STICKY_TABS_HEIGHT + 240}px 0px -50% 0px`,
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    journeyItems.forEach((item) => {
      const el = sectionRefs.current[item.slug];
      if (el) obs.observe(el);
    });

    return () => obs.disconnect();
  }, [journeyItems]);

  const onTileClick = (slug: string) => {
    const el = sectionRefs.current[slug];
    if (el) {
      const y =
        el.getBoundingClientRect().top + window.scrollY - STICKY_TABS_HEIGHT - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] pb-16">
      <DeepReportIntro
        intro={data.overviewHeadline}
        body={data.overviewIntro}
        scopeReviewed={data.scopeReviewed}
        sourcesUsed={data.sourcesUsed}
        footerSummary={data.footerSummary}
      />

      <section className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[260px_1fr]">
        <JourneyRail
          items={journeyItems}
          activeSlug={activeSlug}
          onTileClick={onTileClick}
        />

        <div className="flex min-w-0 flex-col gap-6">
          {data.phases.map((phase) => (
            <PhaseCard
              key={phase.slug}
              phase={phase}
              sectionRef={(el) => (sectionRefs.current[phase.slug] = el)}
            />
          ))}

          <ContextCrossCheckCard
            context={data.context}
            sectionRef={(el) =>
              (sectionRefs.current['context-cross-check'] = el)
            }
          />
        </div>
      </section>

      <StrategySynthesisCard synthesis={data.synthesis} />
    </div>
  );
}

interface JourneyTile {
  slug: string;
  iconId: PhaseIcon;
  shortName: string;
  keyStat: string;
}

// ═════════════════════════════════════════════════════════════════════════
// DEEP REPORT INTRO  (dark card — sits above the rail + content)
// ═════════════════════════════════════════════════════════════════════════

function DeepReportIntro({
  intro,
  body,
  scopeReviewed,
  sourcesUsed,
  footerSummary,
}: {
  intro: string;
  body: string;
  scopeReviewed: string[];
  sourcesUsed: string;
  footerSummary: string;
}) {
  return (
    <section
      className="relative overflow-hidden rounded-[24px] text-white"
      style={{
        background: 'linear-gradient(180deg, #0F0A1E 0%, #07050D 100%)',
        boxShadow:
          '0 1px 0 rgba(255,255,255,0.06) inset, 0 30px 60px -30px rgba(15,10,30,0.55)',
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          top: '-140px',
          right: '-100px',
          width: '460px',
          height: '340px',
          background:
            'radial-gradient(ellipse, rgba(127,90,240,0.26) 0%, transparent 65%)',
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative px-12 py-12">
        <header className="mb-6 flex items-center gap-3">
          <span
            className="inline-flex h-[36px] w-[36px] items-center justify-center rounded-[10px]"
            style={{
              background: 'rgba(127,90,240,0.16)',
              boxShadow: 'inset 0 0 0 1px rgba(127,90,240,0.32)',
            }}
          >
            <Path size={16} weight="bold" style={{ color: '#A88CFF' }} />
          </span>
          <span
            className="text-[13px] font-semibold"
            style={{ color: '#C9B5FF', letterSpacing: '-0.005em' }}
          >
            Data dive · The agent journey
          </span>
        </header>

        <h2
          className="font-display font-black text-white"
          style={{
            fontSize: 'clamp(40px, 5vw, 56px)',
            letterSpacing: '-0.035em',
            lineHeight: '0.96',
          }}
        >
          {intro.replace(/\.$/, '')}
          <span style={{ color: '#7F5AF0' }}>.</span>
        </h2>

        <p
          className="mt-5 text-[16px] leading-[1.65]"
          style={{ color: 'rgba(184,174,218,0.95)', maxWidth: '780px' }}
        >
          {body}
        </p>

        <div
          aria-hidden
          className="my-8 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.10) 50%, transparent 100%)',
          }}
        />

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <div>
            <h5
              className="mb-3 text-[14px] font-semibold"
              style={{ color: '#C9B5FF' }}
            >
              Scope reviewed
            </h5>
            <div className="flex flex-wrap gap-2">
              {scopeReviewed.map((s) => (
                <span
                  key={s}
                  className="rounded-[10px] px-[12px] py-[6px] text-[13px] font-medium tabular-nums"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    color: 'rgba(255,255,255,0.92)',
                    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.10)',
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h5
              className="mb-3 text-[14px] font-semibold"
              style={{ color: '#C9B5FF' }}
            >
              Sources used
            </h5>
            <p
              className="text-[14.5px] leading-[1.6]"
              style={{ color: 'rgba(255,255,255,0.85)' }}
            >
              {sourcesUsed}
            </p>
          </div>
        </div>

        <div
          aria-hidden
          className="my-8 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.10) 50%, transparent 100%)',
          }}
        />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <span
            className="text-[13px]"
            style={{ color: 'rgba(184,174,218,0.7)' }}
          >
            {footerSummary}
          </span>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-[12px] px-[14px] py-[9px] text-[13px] font-semibold transition-colors"
            style={{
              color: 'rgba(255,255,255,0.92)',
              background: 'rgba(255,255,255,0.06)',
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.12)',
            }}
          >
            <DownloadSimple size={13} weight="bold" />
            Download audit log
          </button>
        </div>
      </div>
    </section>
  );
}

// ═════════════════════════════════════════════════════════════════════════
// JOURNEY RAIL  (vertical, sticky, on the LEFT of the phase stack)
// ═════════════════════════════════════════════════════════════════════════

function JourneyRail({
  items,
  activeSlug,
  onTileClick,
}: {
  items: JourneyTile[];
  activeSlug: string;
  onTileClick: (slug: string) => void;
}) {
  return (
    <aside
      className="lg:sticky lg:self-start"
      style={{ top: `${STICKY_TABS_HEIGHT + 16}px` }}
    >
      <p
        className="mb-4 text-[11.5px] font-bold uppercase"
        style={{ letterSpacing: '0.12em', color: '#534AB7' }}
      >
        Investigation path
      </p>

      <ol className="relative flex flex-col gap-1.5">
        {/* Connecting vertical line */}
        <span
          aria-hidden
          className="absolute w-[2px]"
          style={{
            left: '23px',
            top: '24px',
            bottom: '24px',
            background: '#e6e1ef',
          }}
        />

        {items.map((tile) => {
          const active = tile.slug === activeSlug;
          return (
            <li key={tile.slug}>
              <button
                type="button"
                onClick={() => onTileClick(tile.slug)}
                aria-current={active ? 'step' : undefined}
                className="relative flex w-full items-center gap-3 rounded-[12px] px-2.5 py-2.5 text-left transition-colors"
                style={{
                  background: active ? '#EEEDFE' : 'transparent',
                  boxShadow: active
                    ? 'inset 0 0 0 1px rgba(127,90,240,0.30)'
                    : 'none',
                }}
              >
                <span
                  aria-hidden
                  className="relative z-10 inline-flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full transition-all"
                  style={{
                    background: active
                      ? '#7F5AF0'
                      : 'white',
                    boxShadow: active
                      ? '0 0 0 4px rgba(127,90,240,0.18)'
                      : 'inset 0 0 0 1px #d9d4ec',
                  }}
                >
                  {iconForPhase(tile.iconId, active, true)}
                </span>
                <div className="min-w-0 flex-1">
                  <div
                    className="text-[13.5px] font-bold leading-[1.25]"
                    style={{
                      color: active ? '#1a1625' : '#3c3849',
                      letterSpacing: '-0.005em',
                    }}
                  >
                    {tile.shortName}
                  </div>
                  <div
                    className="mt-0.5 text-[11.5px] leading-[1.3] tabular-nums"
                    style={{
                      color: active ? '#534AB7' : '#85819a',
                    }}
                  >
                    {tile.keyStat}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}

function iconForPhase(id: PhaseIcon, active: boolean, onLight = false) {
  const color = active
    ? '#FFFFFF'
    : onLight
    ? '#7F5AF0'
    : '#C9B5FF';
  const size = 17;
  const weight = 'bold' as const;
  switch (id) {
    case 'discovery': return <MagnifyingGlass size={size} weight={weight} color={color} />;
    case 'auction':   return <ChartBar size={size} weight={weight} color={color} />;
    case 'copy':      return <TextAa size={size} weight={weight} color={color} />;
    case 'pages':     return <Browser size={size} weight={weight} color={color} />;
    case 'spend':     return <CurrencyDollar size={size} weight={weight} color={color} />;
    case 'gaps':      return <PuzzlePiece size={size} weight="fill" color={color} />;
    case 'context':   return <ShieldCheck size={size} weight="fill" color={color} />;
  }
}

// ═════════════════════════════════════════════════════════════════════════
// PHASE CARD
// ═════════════════════════════════════════════════════════════════════════

function PhaseCard({
  phase,
  sectionRef,
}: {
  phase: PhaseV5;
  sectionRef: (el: HTMLElement | null) => void;
}) {
  // Raw data defaults to open. Deep Report is for the skeptical operator
  // (and for Google Ads API reviewers) — they expect to see the underlying
  // tables, not click a "Show me" button to reveal them. The collapse stays
  // as a polite-fold for users who want to hide it, but it's not the default.
  const [dataOpen, setDataOpen] = useState(true);

  return (
    <article
      id={`phase-section-${phase.slug}`}
      ref={sectionRef}
      className="relative overflow-hidden rounded-[20px] bg-white scroll-mt-32"
      style={{
        boxShadow:
          '0 0 0 1px #e8e2f0, 0 1px 0 rgba(15,10,30,0.02), 0 24px 40px -28px rgba(15,10,30,0.14)',
      }}
    >
      <div className="relative px-10 py-9 sm:px-12 sm:py-10">
        {/* Eyebrow: phase pill + agent name */}
        <header className="mb-5 flex flex-wrap items-center gap-3">
          <span
            className="inline-flex items-center gap-[8px] rounded-[10px] px-[12px] py-[6px] text-[12px] font-bold tabular-nums"
            style={{
              background: 'rgba(127,90,240,0.10)',
              color: '#534AB7',
              letterSpacing: '0.04em',
            }}
          >
            <span
              aria-hidden
              className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full"
              style={{ background: '#7F5AF0', color: 'white' }}
            >
              {iconForPhase(phase.iconId, true)}
            </span>
            Phase {String(phase.rank).padStart(2, '0')}
          </span>
          <span style={{ color: '#d9d4ec' }}>·</span>
          <span className="text-[14px] font-semibold" style={{ color: '#534AB7' }}>
            {phase.agent}
          </span>
        </header>

        {/* Title */}
        <h3
          className="font-display font-extrabold text-ppc-ink"
          style={{
            fontSize: 'clamp(28px, 3.2vw, 34px)',
            letterSpacing: '-0.024em',
            lineHeight: 1.15,
            maxWidth: '900px',
          }}
        >
          {phase.title.replace(/\.$/, '')}
          <span style={{ color: '#7F5AF0' }}>.</span>
        </h3>

        {/* Four fields in a clean 2x2 — same restraint as the discovery
            card's DiscoverySectionField. No icon chips, no rainbow accents.
            Typography does the hierarchy work. */}
        <div className="mt-9 grid grid-cols-1 gap-x-14 gap-y-9 md:grid-cols-2">
          <PhaseField label="What it checked" body={phase.checked} />
          <PhaseField label="What it found" body={phase.found} emphasis />
          <PhaseField label="Reasoning" body={phase.reasoning} />
          <PhaseField label="Passed forward" body={phase.passedForward} />
        </div>

        {/* Data drawer — toggle on the left, Export CSV on the right */}
        <div className="mt-10 border-t border-ppc-card-border pt-7">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setDataOpen((v) => !v)}
              aria-expanded={dataOpen}
              className="flex flex-1 items-center justify-between gap-4 text-left transition-colors hover:text-ppc-purple-500"
            >
              <span className="flex items-center gap-3">
                <span
                  className="inline-flex h-[40px] w-[40px] items-center justify-center rounded-[12px]"
                  style={{
                    background: dataOpen
                      ? 'rgba(127,90,240,0.14)'
                      : 'rgba(127,90,240,0.06)',
                    color: '#7F5AF0',
                  }}
                >
                  <Stack size={18} weight="bold" />
                </span>
                <span>
                  <span className="block text-[16px] font-bold text-ppc-ink">
                    Raw data
                  </span>
                  <span className="mt-0.5 block text-[13.5px] text-ppc-text-muted">
                    {phase.dataPointsLabel} · {phase.toolCallCount} tool calls
                  </span>
                </span>
              </span>
              <CaretDown
                size={16}
                weight="bold"
                className="shrink-0 text-ppc-text-faint transition-transform"
                style={{
                  transform: dataOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
            </button>

            <ExportCsvButton phaseSlug={phase.slug} />
          </div>

          {dataOpen && (
            <div className="mt-6">
              <ToolsUsedRow tools={phase.toolsUsed} />
              <DataPreviewTable preview={phase.dataPreview} />
              <p
                className="mt-4 flex items-start gap-[8px] text-[13px] leading-[1.55]"
                style={{ color: '#6b6480' }}
              >
                <span
                  aria-hidden
                  className="mt-[5px] inline-block h-[6px] w-[6px] shrink-0 rounded-full"
                  style={{ background: '#A88CFF' }}
                />
                <span>
                  <span className="font-semibold" style={{ color: '#3c3849' }}>
                    Source ·
                  </span>{' '}
                  {phase.dataSource}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function PhaseField({
  label,
  body,
  emphasis,
}: {
  label: string;
  body: string;
  emphasis?: boolean;
}) {
  return (
    <div>
      <h5
        className="mb-3 text-[15px] font-bold text-ppc-ink"
        style={{ letterSpacing: '-0.008em' }}
      >
        {label}
      </h5>
      <p
        className="text-[16px] leading-[1.7]"
        style={{
          color: emphasis ? '#1a1625' : '#3c3849',
          fontWeight: emphasis ? 500 : 400,
          letterSpacing: '-0.005em',
        }}
      >
        {body}
      </p>
    </div>
  );
}

// Export CSV — mock action for the mockup, but visually a real export
// affordance. Mirrors the convention of Stripe Dashboard / Linear / GA4
// where data tables ship with a download button at the top-right. Critical
// for Google Ads API Standard Access RMF: "if providing CSV/PDF download,
// link must be prominently displayed."
function ExportCsvButton({ phaseSlug }: { phaseSlug: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        // Mock: in production this hits the export endpoint for `phaseSlug`.
        // Acknowledge in the UI so the action feels real on the mockup.
        setDone(true);
        setTimeout(() => setDone(false), 1800);
      }}
      aria-label={`Export ${phaseSlug} data as CSV`}
      className="inline-flex shrink-0 items-center gap-2 rounded-[12px] px-[14px] py-[10px] text-[13.5px] font-semibold transition-colors"
      style={{
        color: done ? '#1F6F4F' : '#3c3849',
        background: done ? 'rgba(93,202,165,0.12)' : '#FFFFFF',
        boxShadow: `inset 0 0 0 1px ${done ? 'rgba(93,202,165,0.32)' : '#d9d4ec'}`,
        letterSpacing: '-0.005em',
      }}
    >
      {done ? (
        <Check size={14} weight="bold" />
      ) : (
        <DownloadSimple size={14} weight="bold" />
      )}
      {done ? 'Exported' : 'Export CSV'}
    </button>
  );
}

function ToolsUsedRow({ tools }: { tools: string[] }) {
  return (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      <span className="text-[13px] font-semibold text-ppc-text-muted">
        Tools used
      </span>
      {tools.map((t) => (
        <span
          key={t}
          className="rounded-[8px] px-[10px] py-[5px] text-[12.5px] font-medium"
          style={{
            background: '#EEEDFE',
            color: '#3C3489',
            fontFamily:
              '"SF Mono", "JetBrains Mono", ui-monospace, Menlo, Consolas, monospace',
          }}
        >
          {t}
        </span>
      ))}
    </div>
  );
}

// Data preview table — the forensic surface for skeptical operators (and for
// Google Ads API reviewers checking RMF reporting compliance). Per Jose:
// numbers must be easy to spot. Treatment:
//   • Numeric columns: 16px Figtree 600 tabular-nums in ink — full contrast,
//     heavier weight than the label column so the data is what the eye lands on.
//   • Label column (typically first): 15.5px ink regular — readable but quieter
//     than the data it describes.
//   • Headers: 13.5px semibold dark gray, Title Case (not uppercase-tracked).
//   • Generous row height (py-4) — operators read these, not skim them.
//   • Resting tint on canvas, hover surface flips to white.

function DataPreviewTable({
  preview,
}: {
  preview: PhaseV5['dataPreview'];
}) {
  return (
    <div
      className="overflow-hidden rounded-[14px] bg-ppc-canvas"
      style={{ boxShadow: '0 0 0 1px #d9d4ec' }}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid #d9d4ec' }}>
              {preview.headers.map((h, j) => (
                <th
                  key={h}
                  className="px-5 py-4 text-[13.5px] font-bold"
                  style={{
                    color: '#3c3849',
                    letterSpacing: '-0.005em',
                    textAlign: j === 0 ? 'left' : 'right',
                  }}
                  scope="col"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.rows.map((row, i) => (
              <tr
                key={i}
                style={{
                  borderBottom:
                    i === preview.rows.length - 1
                      ? 'none'
                      : '1px solid #ece6f3',
                }}
                className="transition-colors hover:bg-white"
              >
                {row.map((cell, j) => (
                  <td
                    key={j}
                    className="px-5 py-4"
                    style={{
                      fontSize: j === 0 ? '15.5px' : '16px',
                      fontWeight: j === 0 ? 500 : 600,
                      color: '#1a1625',
                      fontVariantNumeric: 'tabular-nums',
                      textAlign: j === 0 ? 'left' : 'right',
                      letterSpacing: '-0.008em',
                    }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {preview.moreCount && preview.moreLabel && (
        <div
          className="border-t bg-white px-5 py-3.5 text-[13.5px]"
          style={{ borderColor: '#ece6f3', color: '#6b6480' }}
        >
          Showing {preview.rows.length} of{' '}
          {preview.rows.length + preview.moreCount} {preview.moreLabel}.{' '}
          <button
            type="button"
            className="font-semibold text-ppc-purple-500 hover:text-ppc-purple-600"
          >
            View full table
          </button>
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════
// CONTEXT CROSS-CHECK
// ═════════════════════════════════════════════════════════════════════════

function ContextCrossCheckCard({
  context,
  sectionRef,
}: {
  context: ContextCrossCheckData;
  sectionRef: (el: HTMLElement | null) => void;
}) {
  return (
    <section
      id="phase-section-context-cross-check"
      ref={sectionRef}
      className="relative overflow-hidden rounded-[20px] bg-white scroll-mt-32"
      style={{
        boxShadow:
          '0 0 0 1px #e8e2f0, 0 1px 0 rgba(15,10,30,0.02), 0 24px 40px -28px rgba(15,10,30,0.14)',
      }}
    >
      <div className="relative px-10 py-9 sm:px-12 sm:py-10">
        <header className="mb-5 flex flex-wrap items-center gap-3">
          <span
            className="inline-flex items-center gap-[8px] rounded-[10px] px-[12px] py-[6px] text-[12px] font-bold tabular-nums"
            style={{
              background: 'rgba(127,90,240,0.10)',
              color: '#534AB7',
              letterSpacing: '0.04em',
            }}
          >
            <span
              aria-hidden
              className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full"
              style={{ background: '#7F5AF0', color: 'white' }}
            >
              <ShieldCheck size={11} weight="fill" />
            </span>
            Cross-check
          </span>
          <span style={{ color: '#d9d4ec' }}>·</span>
          <span className="text-[14px] font-semibold" style={{ color: '#534AB7' }}>
            Business context
          </span>
        </header>

        <h3
          className="font-display font-extrabold text-ppc-ink"
          style={{
            fontSize: 'clamp(28px, 3.2vw, 34px)',
            letterSpacing: '-0.024em',
            lineHeight: 1.15,
            maxWidth: '900px',
          }}
        >
          The agent didn't read Google Ads in a vacuum
          <span style={{ color: '#7F5AF0' }}>.</span>
        </h3>

        <p
          className="mt-5 text-[16px] leading-[1.65] text-ppc-text-muted"
          style={{ maxWidth: '740px' }}
        >
          Before passing anything to the Strategy Agent, the specialist
          findings were pressure-tested against what we know about Boulder
          Care specifically. Some findings got upgraded. Others got held back
          because the data wasn't there.
        </p>

        <div className="mt-10">
          <h4
            className="mb-5 text-[18px] font-bold text-ppc-ink"
            style={{ letterSpacing: '-0.012em' }}
          >
            What we used
          </h4>
          <div className="flex flex-col gap-4">
            {context.used.map((c) => (
              <div
                key={c.name}
                className="rounded-[14px] px-6 py-5"
                style={{ boxShadow: 'inset 0 0 0 1px #ece6f3' }}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h5 className="text-[16px] font-semibold text-ppc-ink">
                    {c.name}
                  </h5>
                  <span
                    className="inline-flex items-center gap-[6px] text-[12.5px] font-semibold"
                    style={{ color: '#2A7E5E' }}
                  >
                    <ArrowUp size={11} weight="bold" />
                    Used
                  </span>
                </div>
                <p className="mt-1 text-[13.5px] text-ppc-text-muted">
                  {c.source}
                </p>
                <p className="mt-3 text-[14.5px] leading-[1.6] text-ppc-text-muted">
                  {c.appliedWhere}
                </p>
              </div>
            ))}
          </div>
        </div>

        {context.missing.length > 0 && (
          <div className="mt-10">
            <h4
              className="mb-5 text-[18px] font-bold text-ppc-ink"
              style={{ letterSpacing: '-0.012em' }}
            >
              What was missing
            </h4>
            <div className="flex flex-col gap-4">
              {context.missing.map((c) => (
                <div
                  key={c.name}
                  className="rounded-[14px] px-6 py-5"
                  style={{
                    boxShadow: 'inset 0 0 0 1px rgba(215,181,122,0.45)',
                    background: 'rgba(215,181,122,0.06)',
                  }}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <h5
                      className="text-[16px] font-semibold"
                      style={{ color: '#7a4a0e' }}
                    >
                      {c.name}
                    </h5>
                    <span
                      className="inline-flex items-center gap-[6px] text-[12.5px] font-semibold"
                      style={{ color: '#915214' }}
                    >
                      <ArrowDown size={11} weight="bold" />
                      Missing
                    </span>
                  </div>
                  <p
                    className="mt-2 text-[14.5px] leading-[1.6]"
                    style={{ color: '#6b6480' }}
                  >
                    {c.consequence}
                  </p>
                  <a
                    href={c.fixHref}
                    className="mt-3 inline-flex items-center gap-1 text-[13.5px] font-semibold text-ppc-purple-500 hover:text-ppc-purple-600"
                  >
                    Add to project
                    <CaretRight size={11} weight="bold" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10 rounded-[16px] bg-ppc-panel-soft px-7 py-6">
          <h4
            className="mb-4 text-[15px] font-semibold"
            style={{ color: '#534AB7' }}
          >
            What changed because of context
          </h4>
          <ul className="flex flex-col gap-3">
            {context.changedBecauseOfContext.map((line, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-[15px] leading-[1.65]"
                style={{ color: '#1a1625' }}
              >
                <Sparkle
                  size={14}
                  weight="fill"
                  className="mt-[7px] shrink-0"
                  style={{ color: '#7F5AF0' }}
                />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

// ═════════════════════════════════════════════════════════════════════════
// STRATEGY SYNTHESIS  (dark climax)
// ═════════════════════════════════════════════════════════════════════════

// Synthesis card — DEMOTED from a dark hero "Final synthesis" climax to a
// small white traceability footer. The prose ("This is what produced your
// AI Summary", intro paragraph, context recap, Final-Strategy quote) is
// redundant with the AI Summary tab and the ContextCrossCheckCard above.
// What remains: the audit trail of which specialist findings made the
// verdict, and which got held back + why. Useful for the skeptical operator
// and for Google API reviewers; not a second hero card.

function StrategySynthesisCard({
  synthesis,
}: {
  synthesis: StrategySynthesisData;
}) {
  const acceptedCount = synthesis.accepted.length;
  const downgradedCount = synthesis.downgraded.length;

  return (
    <section
      className="relative mt-10 overflow-hidden rounded-[20px] bg-white"
      style={{
        boxShadow:
          '0 0 0 1px #e8e2f0, 0 1px 0 rgba(15,10,30,0.02), 0 24px 40px -28px rgba(15,10,30,0.10)',
      }}
    >
      <div className="relative px-10 py-9 sm:px-12 sm:py-10">
        <header className="mb-5">
          <h3
            className="font-display text-[26px] font-extrabold text-ppc-ink sm:text-[30px]"
            style={{ letterSpacing: '-0.022em', lineHeight: 1.15 }}
          >
            How the AI Summary was assembled
            <span style={{ color: '#7F5AF0' }}>.</span>
          </h3>
          <p
            className="mt-3 text-[16px] leading-[1.6] text-ppc-text-muted"
            style={{ maxWidth: '780px' }}
          >
            The Strategy Agent reconciled the specialist findings against
            your business context. {acceptedCount}{' '}
            {acceptedCount === 1 ? 'made the verdict' : 'made the verdict'};
            {' '}{downgradedCount}{' '}
            {downgradedCount === 1 ? 'was held back' : 'were held back'}.
          </p>
        </header>

        <div className="mt-7 grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2">
          <div>
            <h4
              className="mb-4 flex items-center gap-[10px] text-[14px] font-bold text-ppc-ink"
              style={{ letterSpacing: '-0.005em' }}
            >
              <span
                aria-hidden
                className="inline-block h-[8px] w-[8px] rounded-full"
                style={{
                  background: '#5DCAA5',
                  boxShadow: '0 0 0 3px rgba(93,202,165,0.18)',
                }}
              />
              Made the verdict
              <span
                className="tabular-nums font-semibold"
                style={{ color: '#85819a' }}
              >
                · {acceptedCount}
              </span>
            </h4>
            <div className="flex flex-col gap-2">
              {synthesis.accepted.map((rec) => (
                <SynthesisRow key={rec.rank} rec={rec} />
              ))}
            </div>
          </div>

          <div>
            <h4
              className="mb-4 flex items-center gap-[10px] text-[14px] font-bold text-ppc-ink"
              style={{ letterSpacing: '-0.005em' }}
            >
              <span
                aria-hidden
                className="inline-block h-[8px] w-[8px] rounded-full"
                style={{
                  background: '#B07820',
                  boxShadow: '0 0 0 3px rgba(186,117,23,0.18)',
                }}
              />
              Held back
              <span
                className="tabular-nums font-semibold"
                style={{ color: '#85819a' }}
              >
                · {downgradedCount}
              </span>
            </h4>
            <div className="flex flex-col gap-2">
              {synthesis.downgraded.map((rec) => (
                <SynthesisRow key={rec.rank} rec={rec} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SynthesisRow({ rec }: { rec: SynthesisRecommendation }) {
  const meta = SYNTHESIS_STATE_META[rec.state];
  const body = (
    <article
      className="rounded-[12px] px-4 py-3 transition-colors"
      style={{ background: '#FAFAFD', boxShadow: 'inset 0 0 0 1px #ece6f3' }}
    >
      <div className="flex items-baseline gap-[10px]">
        <span
          className="tabular-nums font-bold text-ppc-ink"
          style={{ fontSize: '14px', letterSpacing: '-0.005em' }}
        >
          {String(rec.rank).padStart(2, '0')}
        </span>
        <span
          className="text-[11.5px] font-semibold uppercase"
          style={{ letterSpacing: '0.06em', color: meta.text }}
        >
          {meta.label}
        </span>
      </div>
      <p
        className="mt-1 text-[15px] font-semibold leading-[1.4] text-ppc-ink"
        style={{ letterSpacing: '-0.008em' }}
      >
        {rec.title}
      </p>
      {rec.whyNote && (
        <p
          className="mt-1.5 text-[13.5px] leading-[1.55]"
          style={{ color: '#6b6480' }}
        >
          {rec.whyNote}
        </p>
      )}
    </article>
  );
  if (rec.discoveryHref) {
    return (
      <a
        href={rec.discoveryHref}
        className="block transition-transform hover:-translate-y-[0.5px] focus:outline-none focus-visible:ring-2 focus-visible:ring-ppc-purple-500/60"
      >
        {body}
      </a>
    );
  }
  return body;
}

const SYNTHESIS_STATE_META: Record<
  Readiness,
  { label: string; text: string }
> = {
  ready:     { label: 'Ready to act',   text: '#1F6F4F' },
  review:    { label: 'Needs review',   text: '#915214' },
  open:      { label: 'Open question',  text: '#534AB7' },
  watchlist: { label: 'Watchlist',      text: '#5b5575' },
};

// Silence unused — kept for future affordances.
void Check;
void Database;
void Target;
void Warning;
