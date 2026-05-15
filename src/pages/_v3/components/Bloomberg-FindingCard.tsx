// Bloomberg-FindingCard , compact data card for one Finding.
//
// Layout:
//   [impact dot + metric + label]   [body text]
//   [3-row sample table from primary evidence (right-aligned numerics with
//    magnitude bars on the numeric column where applicable)]
//   [judgment, italicized small caption]
//   [GAQL pill (popover) | +N supporting refs]
//
// All receipts visible. No "Show evidence" toggle.

import { ArrowUpRight } from '@phosphor-icons/react';
import type { Finding, Section, ToolInvocation } from '../../../mock/competitor-spy-evidence';
import { BloombergGaqlPopover } from './Bloomberg-GaqlPopover';
import { BloombergMagBar } from './Bloomberg-MagBar';

interface BloombergFindingCardProps {
  finding: Finding;
  section: Section;
}

const IMPACT_TOKEN: Record<Finding['impact'], { dot: string; label: string; chipBg: string; chipText: string }> = {
  high: {
    dot: '#E24B4A',
    label: 'high impact',
    chipBg: 'rgba(226,75,74,0.10)',
    chipText: '#A23534',
  },
  medium: {
    dot: '#BA7517',
    label: 'medium impact',
    chipBg: 'rgba(186,117,23,0.10)',
    chipText: '#8B560E',
  },
  low: {
    dot: '#5DCAA5',
    label: 'low impact',
    chipBg: 'rgba(93,202,165,0.12)',
    chipText: '#2F7960',
  },
};

function findInvocation(section: Section, id: string): ToolInvocation | null {
  return section.invocations.find((i) => i.id === id) || null;
}

function parseNumeric(cell: string): number | null {
  if (cell == null) return null;
  const cleaned = cell.replace(/[$,%]/g, '').replace(/,/g, '');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}

function detectNumericColumn(invocation: ToolInvocation): number | null {
  // The right-most column with at least 2 numeric values in the rows is our
  // candidate for the magnitude bar overlay.
  const rows = invocation.result.rows || [];
  const cols = invocation.result.columns || [];
  for (let c = cols.length - 1; c >= 0; c--) {
    let numericHits = 0;
    for (const r of rows) {
      if (parseNumeric(r[c] ?? '') !== null) numericHits++;
    }
    if (numericHits >= 2) return c;
  }
  return null;
}

export function BloombergFindingCard({ finding, section }: BloombergFindingCardProps) {
  const primary = findInvocation(section, finding.primaryEvidenceRef);

  // Sample table: prefer the evidenceSummary if provided (agent-derived table,
  // labelled with a note). Otherwise fall back to the first 3 rows of the
  // primary invocation result. Either way, schema-explore is never used.
  const useSummary = finding.evidenceSummary != null;
  const tableCols = useSummary ? finding.evidenceSummary!.columns : primary?.result.columns || [];
  const tableRows = (useSummary ? finding.evidenceSummary!.rows : primary?.result.rows || []).slice(0, 3);
  const tableNote = useSummary
    ? finding.evidenceSummary!.note
    : primary
    ? `Sample: first 3 of ${primary.result.totalRows ?? tableRows.length} rows · from ${primary.displayName}`
    : 'No primary evidence rows.';

  // Numeric magnitude column (only when not using a summary , summary tables
  // are agent-derived and already curated).
  const numericColIdx = !useSummary && primary ? detectNumericColumn(primary) : null;
  let numericMax = 1;
  if (numericColIdx !== null && primary) {
    const all = (primary.result.rows || [])
      .map((r) => parseNumeric(r[numericColIdx] ?? ''))
      .filter((v): v is number => v !== null);
    if (all.length > 0) numericMax = Math.max(...all);
  }

  // Resource chips MUST be derived from displayName via unique().
  const resourceChips = Array.from(
    new Set(
      [finding.primaryEvidenceRef, ...finding.supportingEvidenceRefs]
        .map((id) => findInvocation(section, id))
        .filter((inv): inv is ToolInvocation => inv != null && inv.isEvidence)
        .map((inv) => inv.displayName),
    ),
  );

  const supportingCount = finding.supportingEvidenceRefs.length;

  const impact = IMPACT_TOKEN[finding.impact];

  return (
    <article className="flex h-full flex-col gap-3 rounded-[12px] border border-ppc-card-border bg-white p-4 lg:p-5">
      {/* Impact chip + title */}
      <div className="flex items-start justify-between gap-3">
        <span
          className="inline-flex shrink-0 items-center gap-1.5 rounded-pill px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em]"
          style={{ background: impact.chipBg, color: impact.chipText }}
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: impact.dot }} />
          {impact.label}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-ppc-text-faint tabular-nums">
          {finding.id}
        </span>
      </div>

      {/* Metric + title row , title left, big metric right (so eye lands on the number first on scan). */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <h3 className="order-2 font-display text-[15.5px] font-extrabold leading-snug tracking-[-0.015em] text-ppc-ink sm:order-1">
          {finding.title}
        </h3>
        {finding.metric && (
          <div className="order-1 text-right sm:order-2">
            <div
              className="font-display font-black leading-none tracking-[-0.025em] text-ppc-ink"
              style={{ fontSize: 'clamp(34px, 4vw, 44px)' }}
            >
              {finding.metric.value}
            </div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.08em] text-ppc-text-muted">
              {finding.metric.label}
            </div>
          </div>
        )}
      </div>

      {/* Body */}
      <p className="font-sans text-[13px] leading-[1.55] text-ppc-text-muted">
        {finding.body}
      </p>

      {/* Sample table */}
      {tableRows.length > 0 && (
        <div className="overflow-hidden rounded-[8px] border border-ppc-card-border bg-ppc-canvas/30">
          <table className="w-full border-collapse text-left font-mono text-[11px] leading-tight">
            <thead>
              <tr className="border-b border-ppc-card-border bg-white">
                {tableCols.map((c, idx) => {
                  const isNumericCol = !useSummary && idx === numericColIdx;
                  return (
                    <th
                      key={c + idx}
                      scope="col"
                      className={`px-2.5 py-1.5 text-[9.5px] uppercase tracking-[0.10em] text-ppc-text-muted ${
                        isNumericCol ? 'text-right' : ''
                      } ${idx > 0 && !isNumericCol ? 'text-right' : ''}`}
                    >
                      {c}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? 'bg-white/60' : 'bg-white'}>
                  {row.map((cell, ci) => {
                    const isNumericCol = !useSummary && ci === numericColIdx;
                    const numericVal = isNumericCol ? parseNumeric(cell) : null;
                    return (
                      <td
                        key={ci}
                        className={`px-2.5 py-1.5 ${
                          isNumericCol || (ci > 0 && !useSummary && parseNumeric(cell) !== null)
                            ? 'text-right tabular-nums'
                            : ''
                        } text-ppc-ink`}
                      >
                        {isNumericCol && numericVal !== null ? (
                          <span className="inline-flex items-center gap-2">
                            <BloombergMagBar value={numericVal} max={numericMax} />
                            <span className="tabular-nums">{cell}</span>
                          </span>
                        ) : (
                          cell
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-ppc-card-border bg-white px-2.5 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.08em] text-ppc-text-faint">
            {tableNote}
          </div>
        </div>
      )}

      {/* Judgment */}
      <div className="rounded-[8px] border-l-[3px] border-ppc-purple-500 bg-ppc-canvas/40 px-3 py-2 font-sans text-[12.5px] leading-[1.5] text-ppc-ink">
        {finding.judgment}
      </div>

      {/* Footer: GAQL pill + supporting refs + resource chips */}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-ppc-card-border/80 pt-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {primary?.args.gaql ? (
            <BloombergGaqlPopover
              gaql={primary.args.gaql}
              resource={primary.displayName}
              toolCallId={primary.id}
              variant="pill"
            />
          ) : primary ? (
            <span className="inline-flex items-center gap-1.5 rounded-[6px] border border-ppc-card-border bg-white px-2 py-1 font-mono text-[10.5px] uppercase tracking-[0.08em] text-ppc-text-muted">
              {primary.toolName.replace('_', '.')}
            </span>
          ) : null}
          {resourceChips.slice(0, 3).map((r) => (
            <span
              key={r}
              className="rounded-[6px] border border-ppc-card-border bg-ppc-canvas/40 px-1.5 py-1 font-mono text-[10px] tracking-[0.02em] text-ppc-text-muted"
            >
              {r}
            </span>
          ))}
          {resourceChips.length > 3 && (
            <span className="font-mono text-[10px] text-ppc-text-faint">+{resourceChips.length - 3}</span>
          )}
        </div>
        {supportingCount > 0 && (
          <a
            href={`#${section.id}`}
            className="inline-flex items-center gap-1 font-mono text-[10.5px] uppercase tracking-[0.08em] text-ppc-purple-700 hover:text-ppc-purple-500"
          >
            +{supportingCount} supporting ref{supportingCount === 1 ? '' : 's'}
            <ArrowUpRight weight="bold" size={11} />
          </a>
        )}
      </div>
    </article>
  );
}
