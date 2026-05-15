// Audit-FindingCard. The right-hand annotation pinned to a timeline node.
//
// Reads as a lab-notebook margin note: claim, metric, brief body, judgment,
// resource chips derived from invocations, and an optional summary table.
// The card itself never re-renders the GAQL query (that lives on the
// timeline node, click to expand). Instead it cites the primary node id so
// the eye can follow the connector line back to the spine.

import type { Finding, ToolInvocation } from '../../../mock/competitor-spy-evidence';
import { chipsForFinding } from './Audit-utils';

interface Props {
  finding: Finding;
  invocationsById: Record<string, ToolInvocation>;
}

export function AuditFindingCard({ finding, invocationsById }: Props) {
  const chips = chipsForFinding(finding, invocationsById);
  const impactBadge = impactStyle(finding.impact);

  return (
    <article
      className="relative rounded-xl"
      style={{
        background: '#FFFFFF',
        border: '1px solid #E0DAEF',
        boxShadow: '0 1px 2px rgba(15,10,30,0.04), 0 12px 24px rgba(15,10,30,0.04)',
      }}
    >
      {/* Soft purple corner glow to echo the connector */}
      <span
        aria-hidden
        className="pointer-events-none absolute hidden lg:block"
        style={{
          left: -10,
          top: 18,
          width: 10,
          height: 24,
          background:
            'linear-gradient(90deg, rgba(127,90,240,0) 0%, rgba(127,90,240,0.18) 100%)',
        }}
      />

      <div className="px-6 pt-5 pb-4">
        {/* impact + cite row */}
        <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span
            className="font-mono text-[10px] uppercase tracking-[0.10em]"
            style={impactBadge}
          >
            {finding.impact} impact
          </span>
          <span
            className="font-mono text-[10px] uppercase tracking-[0.10em]"
            style={{ color: '#8A82A5' }}
          >
            cites {finding.primaryEvidenceRef}
            {finding.supportingEvidenceRefs.length > 0 &&
              ` plus ${finding.supportingEvidenceRefs.length}`}
          </span>
        </div>

        {/* Two-column body: title + body left, metric right */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-[1fr_auto] sm:items-start">
          <div>
            <h3
              className="font-display text-[20px] font-extrabold"
              style={{
                color: '#0F0A1E',
                letterSpacing: '-0.020em',
                lineHeight: 1.18,
              }}
            >
              {finding.title}
            </h3>
            <p
              className="mt-2 text-[14px]"
              style={{ color: '#3E3856', lineHeight: 1.55 }}
            >
              {finding.body}
            </p>
          </div>

          {finding.metric && (
            <div
              className="rounded-lg px-4 py-3 sm:min-w-[140px]"
              style={{
                background: '#F6F4FC',
                border: '1px solid #E0DAEF',
              }}
            >
              <div
                className="font-display text-[34px] font-extrabold"
                style={{
                  color: '#7F5AF0',
                  letterSpacing: '-0.025em',
                  lineHeight: 1.0,
                }}
              >
                {finding.metric.value}
              </div>
              <div
                className="mt-1.5 font-mono text-[10.5px] uppercase tracking-[0.10em]"
                style={{ color: '#6B6480' }}
              >
                {finding.metric.label}
              </div>
            </div>
          )}
        </div>

        {/* Resource chips, derived from displayName via unique() */}
        {chips.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {chips.map((c) => (
              <span
                key={c}
                className="rounded-full px-2.5 py-[3px] font-mono text-[11px]"
                style={{
                  background: '#EEEDFE',
                  color: '#3C3489',
                  border: '1px solid #DAD3F4',
                }}
              >
                {c}
              </span>
            ))}
          </div>
        )}

        {/* Optional evidence summary (agent-derived). Labelled per fixture note. */}
        {finding.evidenceSummary && (
          <EvidenceSummary
            columns={finding.evidenceSummary.columns}
            rows={finding.evidenceSummary.rows}
            note={finding.evidenceSummary.note}
          />
        )}

        {/* judgment line, italics off (banned), Figtree 500, slightly indented */}
        <div
          className="mt-4 rounded-lg px-4 py-3"
          style={{
            background: '#FAF8FF',
            borderLeft: '3px solid #7F5AF0',
          }}
        >
          <div
            className="mb-1 font-mono text-[10px] uppercase tracking-[0.10em]"
            style={{ color: '#7F5AF0' }}
          >
            agent judgment
          </div>
          <p
            className="text-[13.5px]"
            style={{ color: '#2A2540', lineHeight: 1.55, margin: 0 }}
          >
            {finding.judgment}
          </p>
        </div>
      </div>
    </article>
  );
}

function EvidenceSummary({
  columns,
  rows,
  note,
}: {
  columns: string[];
  rows: string[][];
  note: string;
}) {
  return (
    <div
      className="mt-4 overflow-hidden rounded-lg"
      style={{ border: '1px solid #E0DAEF' }}
    >
      <div
        className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.10em]"
        style={{
          background: '#FAF8FF',
          color: '#6B6480',
          borderBottom: '1px solid #E0DAEF',
        }}
      >
        {note}
      </div>
      <table className="w-full" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c}
                className="px-3 py-1.5 text-left font-mono text-[10.5px] uppercase tracking-[0.08em]"
                style={{
                  color: '#8A82A5',
                  borderBottom: '1px solid #E0DAEF',
                  background: '#FFFFFF',
                }}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="px-3 py-1.5 font-mono text-[12px]"
                  style={{
                    color: '#1a1625',
                    borderBottom: i < rows.length - 1 ? '1px solid #F0EBFA' : 'none',
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
  );
}

function impactStyle(impact: Finding['impact']): React.CSSProperties {
  // Soft tint, no chunky purple solid. Three distinct hues for legibility.
  switch (impact) {
    case 'high':
      return { color: '#B43A21', background: '#FBEFEC', padding: '2px 8px', borderRadius: 999 };
    case 'medium':
      return { color: '#7C5A19', background: '#FBF4E4', padding: '2px 8px', borderRadius: 999 };
    case 'low':
      return { color: '#3E3856', background: '#EEEDFE', padding: '2px 8px', borderRadius: 999 };
  }
}
