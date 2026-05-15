// Audit-TimelineNode. A single node on the chronological spine.
//
// Two visual registers, chosen by `isEvidence`:
//   - schema lookup (isEvidence=false): small grey 14px dot, light caption row,
//     no chip. Sits inline like a margin note.
//   - evidence (isEvidence=true): larger 28px purple dot with a soft ring,
//     a displayName chip beside it, a heavier caption row. The dot for the
//     primaryEvidenceRef of a Finding sprouts an anchor stub (the connector
//     line that the finding card on the right docks into).
//
// Clicking any node toggles its inline expanded panel showing args (GAQL if
// applicable), narrative, latency, and the first rows of the result.
//
// All copy uses operator vocabulary: "gaql query", "schema lookup", "rows",
// "started", "elapsed". No thematic words.

import { useState } from 'react';
import type { ToolInvocation } from '../../../mock/competitor-spy-evidence';
import { formatNodeTime, toolKindLabel, formatLatency } from './Audit-utils';

interface Props {
  inv: ToolInvocation;
  runStart: string;
  isAnchor: boolean;          // is this the primary ref for a finding?
  isSupporting: boolean;      // is this referenced as a supporting ref?
  defaultOpen?: boolean;
}

export function AuditTimelineNode({ inv, runStart, isAnchor, isSupporting, defaultOpen }: Props) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const { clock, offset } = formatNodeTime(inv.startedAt, runStart);
  const isSchema = inv.toolName === 'google_ads.explore_schema';

  // Two completely different visual tracks. Schema nodes stay small and grey,
  // evidence nodes get the big purple dot + chip + heavier caption.
  if (isSchema) {
    return (
      <div className="relative pl-[60px] pr-4">
        {/* Tiny grey dot on the spine */}
        <span
          aria-hidden
          className="absolute left-[26px] top-[10px] h-[10px] w-[10px] rounded-full"
          style={{
            background: '#C8C2DC',
            boxShadow: '0 0 0 3px #ECEAFA',
          }}
        />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="group flex w-full items-center gap-3 py-2 text-left"
        >
          <span
            className="font-mono text-[10.5px] uppercase tracking-[0.10em]"
            style={{ color: '#8A82A5' }}
          >
            schema
          </span>
          <span
            className="font-mono text-[12px]"
            style={{ color: '#8A82A5', letterSpacing: '0.01em' }}
          >
            {inv.displayName}
          </span>
          <span
            className="ml-auto font-mono text-[10.5px]"
            style={{ color: '#B5B0C8' }}
          >
            {clock} {offset}
          </span>
        </button>

        {open && (
          <div
            className="ml-1 mb-2 rounded-md px-3 py-2 text-[12.5px]"
            style={{
              background: '#F6F4FC',
              border: '1px solid #E0DAEF',
              color: '#3E3856',
              lineHeight: 1.5,
            }}
          >
            <div className="mb-1 font-mono text-[10.5px] uppercase tracking-[0.10em]" style={{ color: '#8A82A5' }}>
              resource
            </div>
            <div className="font-mono text-[12.5px]" style={{ color: '#0F0A1E' }}>
              {inv.args.resource}
            </div>
            {inv.result.schemaMarkdown && (
              <pre
                className="mt-2 whitespace-pre-wrap font-mono text-[11.5px]"
                style={{ color: '#4D4666', lineHeight: 1.55 }}
              >
                {inv.result.schemaMarkdown}
              </pre>
            )}
            <div className="mt-2 font-mono text-[10.5px]" style={{ color: '#8A82A5' }}>
              elapsed {formatLatency(inv.latencyMs)}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Evidence node
  return (
    <div className="relative pl-[60px] pr-4">
      {/* Anchor stub: a horizontal line out from the dot toward the right side */}
      {isAnchor && (
        <span
          aria-hidden
          className="absolute top-[26px] hidden lg:block"
          style={{
            left: 'calc(100% - 4px)',
            width: '28px',
            height: '2px',
            background:
              'linear-gradient(90deg, rgba(127,90,240,0.55) 0%, rgba(127,90,240,0.10) 100%)',
          }}
        />
      )}

      {/* Big purple dot on the spine */}
      <span
        aria-hidden
        className="absolute left-[20px] top-[14px] h-[22px] w-[22px] rounded-full"
        style={{
          background: isAnchor
            ? 'radial-gradient(circle at 30% 30%, #A88CFF 0%, #7F5AF0 70%, #5A3FBE 100%)'
            : 'radial-gradient(circle at 30% 30%, #B7A1FF 0%, #7F5AF0 75%)',
          boxShadow: isAnchor
            ? '0 0 0 4px #ECEAFA, 0 0 0 6px rgba(127,90,240,0.28), 0 6px 14px rgba(127,90,240,0.30)'
            : '0 0 0 4px #ECEAFA, 0 0 0 5px rgba(127,90,240,0.18)',
        }}
      />
      {/* Supporting badge: small ring on the dot */}
      {isSupporting && !isAnchor && (
        <span
          aria-hidden
          className="absolute left-[16px] top-[10px] h-[30px] w-[30px] rounded-full"
          style={{ border: '1.5px dashed rgba(127,90,240,0.45)' }}
        />
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="group block w-full rounded-lg py-2 text-left transition-colors"
        style={{
          // Subtle background lift on hover, never a chunky purple block
          background: open ? 'rgba(127,90,240,0.06)' : 'transparent',
        }}
      >
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span
            className="font-mono text-[10.5px] uppercase tracking-[0.10em]"
            style={{ color: '#7F5AF0' }}
          >
            {toolKindLabel(inv.toolName)}
          </span>
          <span
            className="rounded-full px-2 py-[2px] font-mono text-[11.5px]"
            style={{
              background: '#EEEDFE',
              color: '#3C3489',
              border: '1px solid #DAD3F4',
            }}
          >
            {inv.displayName}
          </span>
          <span
            className="ml-auto font-mono text-[10.5px]"
            style={{ color: '#8A82A5' }}
          >
            {clock} {offset}
          </span>
        </div>
        <div
          className="mt-1.5 text-[13px]"
          style={{ color: '#2A2540', lineHeight: 1.5 }}
        >
          {inv.narrative}
        </div>
        {isAnchor && (
          <div
            className="mt-1.5 inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.10em]"
            style={{ color: '#7F5AF0' }}
          >
            <span
              aria-hidden
              className="inline-block h-[6px] w-[6px] rounded-full"
              style={{ background: '#7F5AF0' }}
            />
            anchors finding on the right
          </div>
        )}
      </button>

      {open && (
        <div
          className="mb-3 ml-1 mt-1 overflow-hidden rounded-md"
          style={{ border: '1px solid #E0DAEF' }}
        >
          {/* args row */}
          {inv.args.gaql && <ExpandedGaqlBlock gaql={inv.args.gaql} />}
          {inv.args.url && (
            <div
              className="px-3 py-2 font-mono text-[12px]"
              style={{ background: '#0F0A1E', color: '#E9E3FF' }}
            >
              <span style={{ color: '#A88CFF' }}>url</span>{' '}
              <span>{inv.args.url}</span>
            </div>
          )}
          {inv.args.query && !inv.args.gaql && !inv.args.url && (
            <div
              className="px-3 py-2 font-mono text-[12px]"
              style={{ background: '#0F0A1E', color: '#E9E3FF' }}
            >
              <span style={{ color: '#A88CFF' }}>query</span>{' '}
              <span>{inv.args.query}</span>
            </div>
          )}

          {/* result row */}
          {inv.result.columns && inv.result.rows && (
            <ExpandedTable
              columns={inv.result.columns}
              rows={inv.result.rows}
              totalRows={inv.result.totalRows}
            />
          )}
          {inv.result.sample && !inv.result.columns && (
            <pre
              className="m-0 whitespace-pre-wrap px-3 py-2 font-mono text-[12px]"
              style={{ background: '#FAF8FF', color: '#2A2540', lineHeight: 1.55 }}
            >
              {JSON.stringify(inv.result.sample, null, 2)}
            </pre>
          )}

          {/* footer row */}
          <div
            className="flex items-center justify-between px-3 py-1.5 font-mono text-[10.5px]"
            style={{ background: '#F6F4FC', color: '#6B6480' }}
          >
            <span>id {inv.id}</span>
            <span>elapsed {formatLatency(inv.latencyMs)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function ExpandedGaqlBlock({ gaql }: { gaql: string }) {
  return (
    <pre
      className="m-0 overflow-x-auto px-3 py-2.5 font-mono text-[11.5px]"
      style={{
        background:
          'radial-gradient(120% 90% at 88% -10%, #1B0F39 0%, #0A0814 55%, #050310 100%)',
        color: '#E9E3FF',
        lineHeight: 1.55,
      }}
    >
      <span
        style={{ color: '#A88CFF', letterSpacing: '0.05em' }}
      >{`gaql\n`}</span>
      {gaql}
    </pre>
  );
}

function ExpandedTable({
  columns,
  rows,
  totalRows,
}: {
  columns: string[];
  rows: string[][];
  totalRows?: number;
}) {
  // Show the first 5 rows max, with a "+N more" footer.
  const visible = rows.slice(0, 5);
  const moreCount = (totalRows ?? rows.length) - visible.length;
  return (
    <div style={{ background: '#FFFFFF' }}>
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
                  background: '#FAF8FF',
                }}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visible.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="px-3 py-1.5 font-mono text-[12px]"
                  style={{
                    color: '#1a1625',
                    borderBottom: i < visible.length - 1 ? '1px solid #F0EBFA' : 'none',
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {moreCount > 0 && (
        <div
          className="px-3 py-1.5 font-mono text-[10.5px]"
          style={{
            background: '#FAF8FF',
            color: '#8A82A5',
            borderTop: '1px solid #E0DAEF',
          }}
        >
          plus {moreCount} more {moreCount === 1 ? 'row' : 'rows'} in result
        </div>
      )}
    </div>
  );
}
