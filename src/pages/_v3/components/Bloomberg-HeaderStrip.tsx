// Bloomberg-HeaderStrip , horizontal dashboard strip rendered once per section.
//
// Composition (one row at desktop):
//   [section index] [name + window] [HUGE METRIC] [sparkline] [primary GAQL line]
//   [supporting count] [tool-call counter button]
//
// The metric is Figtree 900 at ~72px. The sparkline (120 x 40) is built from
// the section's primary numeric series, derived inline. The GAQL one-liner
// renders the primary evidence query as an inline truncated receipt with a
// hover-to-expand popover. The tool-call counter triggers the audit drawer.

import { Crosshair, Binoculars, ChartLine, Flag, Clock, ListChecks } from '@phosphor-icons/react';
import type { Section, ToolInvocation } from '../../../mock/competitor-spy-evidence';
import { BloombergSparkline } from './Bloomberg-Sparkline';
import { BloombergGaqlPopover } from './Bloomberg-GaqlPopover';

const ICONS = {
  target: Crosshair,
  binoculars: Binoculars,
  chart: ChartLine,
  flag: Flag,
};

function deriveSparkSeries(section: Section): { data: number[]; label: string } {
  // Pick a meaningful numeric series from the primary evidence row of the
  // section's first finding when possible, falling back to per-invocation
  // latency for shape.
  const primaryRef = section.findings[0]?.primaryEvidenceRef;
  const primary = section.invocations.find((i) => i.id === primaryRef);

  if (primary?.result?.rows && primary.result.rows.length > 1) {
    // Try the last numeric column (often a percent / spend / value).
    const cols = primary.result.columns || [];
    const lastIdx = cols.length - 1;
    if (lastIdx >= 0) {
      const series = primary.result.rows
        .map((r) => {
          const cell = r[lastIdx] ?? '';
          const m = cell.replace(/[$,%]/g, '').replace(/,/g, '');
          const n = parseFloat(m);
          return Number.isFinite(n) ? n : null;
        })
        .filter((v): v is number => v !== null);
      if (series.length >= 2) {
        return { data: series, label: cols[lastIdx] || 'series' };
      }
    }
  }

  // Fallback: latency-of-evidence-only invocations.
  const lats = section.invocations.filter((i) => i.isEvidence).map((i) => i.latencyMs);
  return { data: lats.length >= 2 ? lats : [1, 1.5, 1.2, 1.8, 2.1], label: 'latency' };
}

function primaryEvidenceFor(section: Section): ToolInvocation | null {
  const ref = section.findings[0]?.primaryEvidenceRef;
  if (!ref) return null;
  return section.invocations.find((i) => i.id === ref) || null;
}

interface BloombergHeaderStripProps {
  section: Section;
  index: number;
  onOpenAudit: () => void;
}

export function BloombergHeaderStrip({ section, index, onOpenAudit }: BloombergHeaderStripProps) {
  const Icon = ICONS[section.icon];
  const { data: sparkData } = deriveSparkSeries(section);
  const primary = primaryEvidenceFor(section);

  // Critical invariant: the rendered count equals invocations.length.
  const computedCount = section.invocations.length;
  const evidenceCount = section.invocations.filter((i) => i.isEvidence).length;
  const schemaCount = computedCount - evidenceCount;

  // Distinct evidence resources for the section, for the supporting strip.
  const resources = Array.from(
    new Set(section.invocations.filter((i) => i.isEvidence).map((i) => i.displayName)),
  );

  return (
    <header
      id={section.id}
      className="grid scroll-mt-6 grid-cols-1 gap-x-6 gap-y-4 rounded-[14px] border border-ppc-card-border bg-white px-5 py-5 lg:grid-cols-[minmax(260px,1.05fr)_minmax(0,2.4fr)_minmax(0,1.5fr)_auto] lg:items-center lg:px-7 lg:py-6"
    >
      {/* Col 1: section identity */}
      <div className="flex items-start gap-3 lg:items-center">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-ppc-purple-50 text-ppc-purple-700">
          <Icon weight="bold" size={18} />
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ppc-text-muted">
            <span className="tabular-nums">{String(index + 1).padStart(2, '0')}</span>
            <span className="text-ppc-text-faint">/</span>
            <span>section</span>
            <span className="text-ppc-text-faint">/</span>
            <span>{section.meta.window.replace(' window', '')}</span>
          </div>
          <h2 className="mt-1 font-display text-[20px] font-extrabold leading-tight tracking-[-0.020em] text-ppc-ink">
            {section.name}
          </h2>
        </div>
      </div>

      {/* Col 2: HUGE METRIC + sparkline + label */}
      <div className="flex items-end gap-4 lg:gap-6">
        <div className="min-w-0">
          <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-ppc-text-muted">
            headline
          </div>
          <div className="mt-0.5 flex items-baseline gap-3">
            <span
              className="font-display font-black leading-[0.92] tracking-[-0.035em] text-ppc-ink"
              style={{ fontSize: 'clamp(48px, 8.5vw, 72px)' }}
            >
              {section.meta.headlineMetric.value}
            </span>
            <span className="hidden sm:inline-block">
              <BloombergSparkline data={sparkData} width={120} height={40} />
            </span>
          </div>
          <div className="mt-1 font-sans text-[12.5px] font-medium leading-snug text-ppc-text-muted">
            {section.meta.headlineMetric.label}
          </div>
        </div>
      </div>

      {/* Col 3: primary GAQL one-liner */}
      <div className="min-w-0">
        <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-ppc-text-muted">
          primary query
        </div>
        {primary?.args.gaql ? (
          <div className="mt-1.5">
            <BloombergGaqlPopover
              gaql={primary.args.gaql}
              resource={primary.displayName}
              toolCallId={primary.id}
            />
          </div>
        ) : primary ? (
          <div className="mt-1.5 font-mono text-[11.5px] leading-[1.5] text-ppc-text-muted">
            {primary.displayName} ({primary.toolName})
          </div>
        ) : (
          <div className="mt-1.5 font-mono text-[11.5px] text-ppc-text-faint">no primary query</div>
        )}
        {resources.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1">
            {resources.slice(0, 4).map((r) => (
              <span
                key={r}
                className="rounded-[3px] border border-ppc-card-border bg-ppc-canvas/40 px-1.5 py-px font-mono text-[10px] tracking-[0.02em] text-ppc-text-muted"
              >
                {r}
              </span>
            ))}
            {resources.length > 4 && (
              <span className="font-mono text-[10px] text-ppc-text-faint">+{resources.length - 4}</span>
            )}
          </div>
        )}
      </div>

      {/* Col 4: tool-call counter button (opens audit drawer) */}
      <div className="flex items-stretch lg:justify-end">
        <button
          type="button"
          onClick={onOpenAudit}
          className="group inline-flex w-full items-center gap-3 rounded-[10px] border border-ppc-card-border bg-ppc-canvas/60 px-3.5 py-2.5 text-left transition-colors hover:border-ppc-purple-400 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ppc-purple-500 lg:w-auto"
          aria-label={`Open audit trail for ${section.name}, ${computedCount} tool invocations`}
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] bg-white text-ppc-purple-700 group-hover:bg-ppc-purple-50">
            <ListChecks weight="bold" size={15} />
          </span>
          <span className="flex flex-col">
            <span className="font-display text-[18px] font-extrabold leading-none tabular-nums tracking-[-0.020em] text-ppc-ink">
              {computedCount}
            </span>
            <span className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-ppc-text-muted">
              tool calls / audit
            </span>
            <span className="mt-1 font-mono text-[10px] tabular-nums text-ppc-text-faint">
              <span className="text-ppc-purple-700">{evidenceCount}</span> evidence
              <span className="px-1 text-ppc-text-faint">,</span>
              <span>{schemaCount}</span> schema
              <Clock weight="bold" size={9} className="ml-1 inline -translate-y-px" />
            </span>
          </span>
        </button>
      </div>
    </header>
  );
}
