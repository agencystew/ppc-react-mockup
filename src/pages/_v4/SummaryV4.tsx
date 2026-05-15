// V4 Summary section — Discovery cards.
//
// One Discovery = one self-contained finding + paired recommendation. Replaces
// the v1 split of FindingTiles + RecommendationsSection (see
// AgentResults.tsx:458-630).
//
// Each card carries:
//  - A headline in one of four shapes (verdict / fact / gap / pattern)
//  - Proof prose with numbers auto-highlighted as inline stats
//  - A divider, then the recommendation: → DO · EXPECT · EFFORT
//  - Source attribution (agent · project · age) for Key Discoveries reuse
//  - Evidence eyebrow (tool calls · data points)
//  - Apply / Defer CTAs
//
// Design doc: docs/plans/2026-05-15-summary-section-v4-design.md

import { ArrowRight, Sparkle, MagnifyingGlass, Clock } from '@phosphor-icons/react';
import { ImpactChip } from '../AgentResults';
import type { Discovery, HeadlineShape } from './data';

// ─── Public component ────────────────────────────────────────────────────

export function SummaryV4({ discoveries }: { discoveries: Discovery[] }) {
  const highImpact = discoveries.filter((d) => d.severity === 'high').length;

  return (
    <section className="mb-10">
      <SectionHeader count={discoveries.length} highImpact={highImpact} />
      <div className="flex flex-col gap-5">
        {discoveries.map((d) => (
          <DiscoveryCard key={d.id} discovery={d} />
        ))}
      </div>
      <FooterLink />
    </section>
  );
}

// ─── Section header ──────────────────────────────────────────────────────

function SectionHeader({ count, highImpact }: { count: number; highImpact: number }) {
  return (
    <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
      <div className="flex items-baseline gap-3">
        <h3 className="text-[20px] font-semibold tracking-[-0.01em] text-ppc-ink">
          What we found
        </h3>
        <span
          className="text-[11.5px] font-semibold uppercase leading-none text-ppc-text-muted"
          style={{
            fontFamily: '"Courier New", ui-monospace, monospace',
            letterSpacing: '0.10em',
          }}
        >
          {count} discoveries · {highImpact} high impact
        </span>
      </div>
      <a
        href="#full-report"
        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ppc-purple-500 transition-colors hover:text-ppc-purple-600"
      >
        See full report
        <ArrowRight size={12} weight="bold" />
      </a>
    </div>
  );
}

// ─── Discovery card ──────────────────────────────────────────────────────

function DiscoveryCard({ discovery }: { discovery: Discovery }) {
  const { shape, severity, headline, body, agent, projectName, finishedLabel, toolCalls, dataPointsLabel, do: doText, expect, effort, cta } = discovery;
  const rail = SEVERITY_RAIL[severity];

  return (
    <article
      className="relative overflow-hidden rounded-[18px] bg-white"
      style={{
        boxShadow:
          '0 0 0 1px #e8e2f0, 0 1px 0 rgba(15,10,30,0.02), 0 24px 40px -28px rgba(15,10,30,0.14)',
      }}
    >
      {/* Severity left rail */}
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-[4px]"
        style={{ background: rail.gradient }}
      />

      <div className="relative pb-6 pl-8 pr-7 pt-6 sm:pl-10 sm:pr-9">
        {/* Eyebrow row: impact chip + shape · source attribution */}
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <ImpactChip impact={severity} />
            <ShapeLabel shape={shape} />
          </div>
          <SourceAttribution agent={agent} project={projectName} age={finishedLabel} />
        </header>

        {/* Headline — the claim */}
        <h4 className="font-display text-[24px] font-extrabold leading-[1.18] tracking-[-0.018em] text-ppc-ink sm:text-[26px]">
          {headline}
        </h4>

        {/* Proof prose with auto-highlighted stats */}
        <p className="mt-3 max-w-[680px] text-[14.5px] leading-[1.6] text-ppc-text-muted">
          <ProofProse text={body} />
        </p>

        {/* Divider — soft, signals cause→effect bridge */}
        <div
          className="mb-5 mt-6 h-px w-full"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, #ece6f3 18%, #ece6f3 82%, transparent 100%)',
          }}
        />

        {/* Recommendation block */}
        <RecommendationBlock do={doText} expect={expect} effort={effort} />

        {/* Footer row: evidence eyebrow (left) + actions (right) */}
        <footer className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <EvidenceEyebrow calls={toolCalls} dataPoints={dataPointsLabel} />
          <div className="flex items-center gap-2">
            <DeferButton />
            <ApplyButton label={cta} />
          </div>
        </footer>
      </div>
    </article>
  );
}

// ─── Shape label (small mono eyebrow) ────────────────────────────────────

function ShapeLabel({ shape }: { shape: HeadlineShape }) {
  const meta = SHAPES[shape];
  return (
    <span
      className="inline-flex items-center gap-[6px] text-[11px] font-semibold uppercase leading-none text-ppc-text-muted"
      style={{
        fontFamily: '"Courier New", ui-monospace, monospace',
        letterSpacing: '0.12em',
      }}
      title={meta.tooltip}
    >
      <span
        aria-hidden
        className="h-[5px] w-[5px] rounded-full"
        style={{ background: meta.dot }}
      />
      {meta.label}
    </span>
  );
}

const SHAPES: Record<HeadlineShape, { label: string; dot: string; tooltip: string }> = {
  verdict: { label: 'VERDICT', dot: '#7F5AF0', tooltip: 'Diagnoses a cause' },
  fact:    { label: 'FACT',    dot: '#3FB985', tooltip: 'Quantified observation' },
  gap:     { label: 'GAP',     dot: '#E2A536', tooltip: 'Whitespace / opportunity' },
  pattern: { label: 'PATTERN', dot: '#5288DA', tooltip: 'Recurring theme' },
};

// ─── Source attribution (top-right eyebrow) ──────────────────────────────

function SourceAttribution({
  agent,
  project,
  age,
}: {
  agent: string;
  project: string;
  age: string;
}) {
  return (
    <span
      className="text-[11.5px] leading-none text-ppc-text-muted"
      style={{
        fontFamily: '"Courier New", ui-monospace, monospace',
        letterSpacing: '0.02em',
      }}
    >
      <span className="font-semibold text-ppc-ink">{agent}</span>
      <span className="mx-[6px] text-ppc-text-faint">·</span>
      {project}
      <span className="mx-[6px] text-ppc-text-faint">·</span>
      {age}
    </span>
  );
}

// ─── Proof renderer: auto-highlights numbers, %, $ amounts ───────────────

// Matches: percentages, $K/M amounts, plain numbers (with optional units like
// "/mo"), and "N of N" patterns. Highlighted in lavender to make the proof
// structural rather than decorative.
const STAT_PATTERN =
  /(\$[\d,]+(?:\.\d+)?[KMB]?(?:\/\w+)?|\d+(?:\.\d+)?%|\d+ of \d+|\d+(?:,\d{3})*(?:\.\d+)?(?:%|x|×)?)/g;

function ProofProse({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  // Reset lastIndex (regex with /g flag is stateful per instance).
  STAT_PATTERN.lastIndex = 0;
  while ((m = STAT_PATTERN.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(
      <span
        key={m.index}
        className="font-semibold text-ppc-ink"
        style={{
          background:
            'linear-gradient(180deg, transparent 62%, rgba(127,90,240,0.20) 62%)',
          padding: '0 2px',
        }}
      >
        {m[0]}
      </span>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

// ─── Recommendation block ────────────────────────────────────────────────

function RecommendationBlock({
  do: doText,
  expect,
  effort,
}: {
  do: string;
  expect: string;
  effort: string;
}) {
  return (
    <div
      className="rounded-[12px] px-5 py-4"
      style={{
        background: 'linear-gradient(180deg, #FBF9FD 0%, #F6F2FB 100%)',
        boxShadow: 'inset 0 0 0 1px #ece6f3',
      }}
    >
      <RecRow
        label="DO"
        labelColor="#7F5AF0"
        icon={<ArrowRight size={11} weight="bold" />}
      >
        <span className="font-semibold text-ppc-ink">{doText}</span>
      </RecRow>
      <RecRow
        label="EXPECT"
        labelColor="#3FB985"
        icon={<Sparkle size={11} weight="fill" />}
      >
        {expect}
      </RecRow>
      <RecRow
        label="EFFORT"
        labelColor="#915214"
        icon={<Clock size={11} weight="bold" />}
        last
      >
        {effort}
      </RecRow>
    </div>
  );
}

function RecRow({
  label,
  labelColor,
  icon,
  children,
  last,
}: {
  label: string;
  labelColor: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className={`flex items-start gap-3 ${last ? '' : 'mb-[10px]'}`}>
      <span
        className="mt-[2px] inline-flex shrink-0 items-center gap-[5px] text-[10.5px] font-bold uppercase leading-none"
        style={{
          fontFamily: '"Courier New", ui-monospace, monospace',
          letterSpacing: '0.12em',
          color: labelColor,
          minWidth: '68px',
        }}
      >
        <span aria-hidden className="opacity-80">
          {icon}
        </span>
        {label}
      </span>
      <span className="text-[13.5px] leading-[1.55] text-ppc-text-muted">{children}</span>
    </div>
  );
}

// ─── Evidence eyebrow ────────────────────────────────────────────────────

function EvidenceEyebrow({ calls, dataPoints }: { calls: number; dataPoints: string }) {
  return (
    <span
      className="inline-flex items-center gap-[8px] text-[11.5px] leading-none text-ppc-text-muted"
      style={{
        fontFamily: '"Courier New", ui-monospace, monospace',
        letterSpacing: '0.04em',
      }}
    >
      <MagnifyingGlass size={12} weight="bold" className="text-ppc-text-faint" />
      <span className="tabular-nums">{calls} tool calls</span>
      <span className="text-ppc-text-faint">·</span>
      <span>{dataPoints}</span>
      <span className="text-ppc-text-faint">·</span>
      <a
        href="#methodology"
        className="font-semibold text-ppc-purple-500 transition-colors hover:text-ppc-purple-600"
      >
        Methodology
      </a>
    </span>
  );
}

// ─── Buttons ─────────────────────────────────────────────────────────────

function ApplyButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 rounded-[10px] px-[14px] py-[9px] text-[12.5px] font-semibold text-white transition-transform hover:-translate-y-[0.5px]"
      style={{
        background: 'linear-gradient(180deg, #8767F3 0%, #6A45E2 100%)',
        boxShadow:
          '0 1px 0 rgba(255,255,255,0.18) inset, 0 6px 14px -6px rgba(127,90,240,0.55)',
      }}
    >
      {label}
      <ArrowRight size={11} weight="bold" />
    </button>
  );
}

function DeferButton() {
  return (
    <button
      type="button"
      className="inline-flex items-center rounded-[10px] border border-ppc-card-border bg-white px-[12px] py-[8px] text-[12.5px] font-medium text-ppc-text-muted transition-colors hover:bg-ppc-panel-soft hover:text-ppc-ink"
    >
      Defer
    </button>
  );
}

// ─── Footer link below the stack ─────────────────────────────────────────

function FooterLink() {
  return (
    <div className="mt-7 flex justify-center">
      <a
        href="#full-report"
        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ppc-purple-500 transition-colors hover:text-ppc-purple-600"
      >
        Read the full report with evidence
        <ArrowRight size={12} weight="bold" />
      </a>
    </div>
  );
}

// ─── Severity rail palette ───────────────────────────────────────────────

const SEVERITY_RAIL = {
  high:   { gradient: 'linear-gradient(180deg, #F24A2E 0%, #B7321E 100%)' },
  medium: { gradient: 'linear-gradient(180deg, #E2A536 0%, #B07820 100%)' },
  low:    { gradient: 'linear-gradient(180deg, #A88CFF 0%, #7F5AF0 100%)' },
} as const;
