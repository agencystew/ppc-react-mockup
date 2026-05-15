// Bloomberg-AuditDrawer , right-side slide-over panel listing every
// tool_invocation chronologically for a single section. Includes filter
// chips by tool name and a timestamp scrubber.
//
// Triggered by clicking the section header's tool-call counter button.

import { useEffect, useMemo, useState } from 'react';
import { X, FunnelSimple, Database, Globe, MagnifyingGlass, ListBullets, Tag } from '@phosphor-icons/react';
import type { ToolInvocation, ToolName, Section } from '../../../mock/competitor-spy-evidence';

interface BloombergAuditDrawerProps {
  section: Section | null;
  onClose: () => void;
}

const TOOL_ICONS: Record<ToolName, typeof Database> = {
  'google_ads.query': Database,
  'google_ads.explore_schema': ListBullets,
  'serp_api.search': MagnifyingGlass,
  'web.scrape': Globe,
  'domain.lookup': Tag,
};

const TOOL_SHORT: Record<ToolName, string> = {
  'google_ads.query': 'gads.query',
  'google_ads.explore_schema': 'gads.schema',
  'serp_api.search': 'serp.search',
  'web.scrape': 'web.scrape',
  'domain.lookup': 'domain',
};

const TOOL_TINT: Record<ToolName, string> = {
  'google_ads.query': '#7F5AF0',
  'google_ads.explore_schema': '#9E9CB8',
  'serp_api.search': '#7C45CB',
  'web.scrape': '#534AB7',
  'domain.lookup': '#3C3489',
};

function fmtTime(iso: string) {
  // 09:12:01 from the ISO timestamp.
  const m = iso.match(/T(\d{2}):(\d{2}):(\d{2})/);
  if (!m) return iso;
  return `${m[1]}:${m[2]}:${m[3]}`;
}

function fmtLatency(ms: number) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function BloombergAuditDrawer({ section, onClose }: BloombergAuditDrawerProps) {
  const [activeFilter, setActiveFilter] = useState<ToolName | 'all'>('all');
  const [scrubIdx, setScrubIdx] = useState<number | null>(null);

  // Reset filter when section changes (drawer reopens with a different section).
  useEffect(() => {
    setActiveFilter('all');
    setScrubIdx(null);
  }, [section?.id]);

  // ESC closes the drawer.
  useEffect(() => {
    if (!section) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [section, onClose]);

  const filterCounts = useMemo(() => {
    if (!section) return {} as Record<string, number>;
    const out: Record<string, number> = { all: section.invocations.length };
    for (const inv of section.invocations) {
      out[inv.toolName] = (out[inv.toolName] || 0) + 1;
    }
    return out;
  }, [section]);

  const filtered: ToolInvocation[] = useMemo(() => {
    if (!section) return [];
    if (activeFilter === 'all') return section.invocations;
    return section.invocations.filter((inv) => inv.toolName === activeFilter);
  }, [section, activeFilter]);

  // Distinct tool names present in this section, in the order they first appear.
  const toolsInSection = useMemo(() => {
    if (!section) return [] as ToolName[];
    const seen = new Set<ToolName>();
    const out: ToolName[] = [];
    for (const inv of section.invocations) {
      if (!seen.has(inv.toolName)) {
        seen.add(inv.toolName);
        out.push(inv.toolName);
      }
    }
    return out;
  }, [section]);

  if (!section) return null;

  return (
    <>
      {/* Scrim */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close audit drawer"
        className="fixed inset-0 z-40 bg-[#0F0A1E]/30 backdrop-blur-[1px]"
      />
      {/* Panel */}
      <aside
        className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-[480px] flex-col border-l border-ppc-card-border bg-white shadow-[-24px_0_48px_-12px_rgba(15,10,30,0.30)]"
        role="dialog"
        aria-label={`Audit trail for ${section.name}`}
      >
        {/* Header */}
        <header className="flex items-start justify-between gap-3 border-b border-ppc-card-border px-5 py-4">
          <div className="min-w-0">
            <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-ppc-text-muted">
              Audit trail / {section.name.toLowerCase()}
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-display text-[28px] font-black leading-none tracking-[-0.025em] text-ppc-ink">
                {section.invocations.length}
              </span>
              <span className="font-mono text-[11px] text-ppc-text-muted">
                tool invocations, chronological
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[8px] p-1.5 text-ppc-text-muted hover:bg-ppc-canvas hover:text-ppc-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ppc-purple-500"
            aria-label="Close"
          >
            <X weight="bold" size={16} />
          </button>
        </header>

        {/* Filter chips */}
        <div className="border-b border-ppc-card-border bg-ppc-canvas/40 px-5 py-3">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.10em] text-ppc-text-muted">
            <FunnelSimple weight="bold" size={11} />
            <span>filter</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`rounded-pill border px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.08em] transition-colors ${
                activeFilter === 'all'
                  ? 'border-ppc-purple-500 bg-ppc-purple-50 text-ppc-purple-800'
                  : 'border-ppc-card-border bg-white text-ppc-text-muted hover:border-ppc-purple-300 hover:text-ppc-ink'
              }`}
            >
              all <span className="opacity-60">({filterCounts.all || 0})</span>
            </button>
            {toolsInSection.map((tn) => (
              <button
                key={tn}
                type="button"
                onClick={() => setActiveFilter(tn)}
                className={`rounded-pill border px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.08em] transition-colors ${
                  activeFilter === tn
                    ? 'border-ppc-purple-500 bg-ppc-purple-50 text-ppc-purple-800'
                    : 'border-ppc-card-border bg-white text-ppc-text-muted hover:border-ppc-purple-300 hover:text-ppc-ink'
                }`}
              >
                {TOOL_SHORT[tn]} <span className="opacity-60">({filterCounts[tn] || 0})</span>
              </button>
            ))}
          </div>

          {/* Timestamp scrubber */}
          {filtered.length > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.10em] text-ppc-text-muted">
                <span>scrub</span>
                <span>
                  {scrubIdx === null
                    ? `${fmtTime(filtered[0].startedAt)} → ${fmtTime(filtered[filtered.length - 1].startedAt)}`
                    : fmtTime(filtered[scrubIdx].startedAt)}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={Math.max(0, filtered.length - 1)}
                step={1}
                value={scrubIdx ?? 0}
                onChange={(e) => setScrubIdx(Number(e.target.value))}
                onMouseLeave={() => setScrubIdx(null)}
                className="mt-1.5 w-full accent-ppc-purple-500"
                aria-label="Timestamp scrubber"
              />
            </div>
          )}
        </div>

        {/* Invocation list */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {filtered.length === 0 ? (
            <div className="font-mono text-[11px] text-ppc-text-muted">No invocations match this filter.</div>
          ) : (
            <ol className="space-y-2.5">
              {filtered.map((inv, idx) => {
                const Icon = TOOL_ICONS[inv.toolName];
                const isHighlighted = scrubIdx !== null && idx === scrubIdx;
                const isSchema = !inv.isEvidence;
                return (
                  <li
                    key={inv.id}
                    className={`rounded-[10px] border bg-white p-3 transition-colors ${
                      isHighlighted
                        ? 'border-ppc-purple-500 shadow-[0_0_0_2px_rgba(127,90,240,0.12)]'
                        : isSchema
                        ? 'border-dashed border-ppc-card-border'
                        : 'border-ppc-card-border'
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px]"
                          style={{
                            background: isSchema ? 'rgba(127,90,240,0.06)' : 'rgba(127,90,240,0.10)',
                            color: TOOL_TINT[inv.toolName],
                          }}
                        >
                          <Icon weight="bold" size={11} />
                        </span>
                        <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-ppc-text-muted">
                          {TOOL_SHORT[inv.toolName]}
                        </span>
                        {isSchema && (
                          <span className="rounded-[3px] border border-ppc-card-border px-1.5 py-px font-mono text-[9.5px] uppercase tracking-[0.10em] text-ppc-text-faint">
                            schema
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[10.5px] text-ppc-text-faint tabular-nums">
                        {fmtTime(inv.startedAt)}
                      </span>
                    </div>

                    <div className="mt-1.5 font-mono text-[11.5px] leading-[1.45] text-ppc-ink">
                      {inv.displayName}
                    </div>
                    <div className="mt-1 font-sans text-[12px] leading-[1.5] text-ppc-text-muted">
                      {inv.narrative}
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-2 border-t border-ppc-card-border/60 pt-2 font-mono text-[10px] tabular-nums text-ppc-text-faint">
                      <span>
                        {inv.id} / {inv.result.totalRows !== undefined ? `${inv.result.totalRows} rows` : 'no table'}
                      </span>
                      <span>{fmtLatency(inv.latencyMs)}</span>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </aside>
    </>
  );
}
