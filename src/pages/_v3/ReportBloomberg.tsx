// V2 Bloomberg dashboard variant of the competitor-spy report.
//
// Brief: docs/plans/2026-05-15-report-evidence-parallel-design.md (section 4.V2)
// Fixture: src/mock/competitor-spy-evidence.ts (locked)
//
// Composition:
// - Single visual register throughout: lavender canvas, white cards, ink text.
// - One ticker at top, then four section header strips (horizontal dashboard),
//   each followed by a 2-column grid of compact finding cards.
// - Receipts are always visible: every finding's primary GAQL is a one-line
//   truncated receipt with hover/click popover; sample table renders 3 rows
//   with tabular numerics and magnitude bars on the numeric column.
// - Audit trail surface: right-side slide-over panel triggered by clicking
//   each section's tool-call counter. Lists every invocation chronologically
//   with filter chips and a timestamp scrubber. Schema-explore invocations
//   appear here ONLY, never in evidence blocks.

import { useMemo, useState, type ReactNode } from 'react';
import {
  ArrowLeft,
  CaretRight,
  Clock,
  Database,
  Globe,
  ListBullets,
  MagnifyingGlass,
  Tag,
} from '@phosphor-icons/react';

import {
  COMPETITOR_SPY_REPORT,
  type Section,
  type ToolInvocation,
  type ToolName,
} from '../../mock/competitor-spy-evidence';

import { BloombergHeaderStrip } from './components/Bloomberg-HeaderStrip';
import { BloombergFindingCard } from './components/Bloomberg-FindingCard';
import { BloombergAuditDrawer } from './components/Bloomberg-AuditDrawer';
import { BloombergSparkline } from './components/Bloomberg-Sparkline';

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

function fmtDurationMs(ms: number) {
  if (ms < 1000) return `${ms}ms`;
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)}s`;
  const m = Math.floor(s / 60);
  const r = Math.round(s - m * 60);
  return `${m}m ${String(r).padStart(2, '0')}s`;
}

function fmtCompletedAt(iso: string) {
  // 2026-05-15 09:14:50 UTC, no fancy dash anywhere.
  const m = iso.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})/);
  if (!m) return iso;
  return `${m[1]} ${m[2]} UTC`;
}

export function ReportBloomberg() {
  const report = COMPETITOR_SPY_REPORT;
  const [auditSection, setAuditSection] = useState<Section | null>(null);

  // Totals are all computed, never hardcoded.
  const totals = useMemo(() => {
    const allInv: ToolInvocation[] = report.sections.flatMap((s) => s.invocations);
    const evidence = allInv.filter((i) => i.isEvidence).length;
    const schema = allInv.length - evidence;
    const findings = report.sections.reduce((acc, s) => acc + s.findings.length, 0);
    const highImpact = report.sections.reduce(
      (acc, s) => acc + s.findings.filter((f) => f.impact === 'high').length,
      0,
    );
    const byTool: Record<string, number> = {};
    for (const inv of allInv) byTool[inv.toolName] = (byTool[inv.toolName] || 0) + 1;

    const sectionLatencies = report.sections.map((s) =>
      s.invocations.reduce((a, b) => a + b.latencyMs, 0),
    );

    return { total: allInv.length, evidence, schema, findings, highImpact, byTool, sectionLatencies };
  }, [report]);

  return (
    <div className="min-h-full bg-ppc-canvas">
      {/* ─── Top ticker / report header ─────────────────────────────────── */}
      <div className="border-b border-ppc-card-border bg-white">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-4 px-5 py-4 lg:px-8 lg:py-5">
          {/* Breadcrumb / route */}
          <div className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.10em] text-ppc-text-muted">
            <a
              href="/reports"
              className="inline-flex items-center gap-1 hover:text-ppc-purple-700"
            >
              <ArrowLeft weight="bold" size={11} /> reports
            </a>
            <CaretRight weight="bold" size={10} className="text-ppc-text-faint" />
            <span className="text-ppc-text-faint">{report.runId}</span>
            <CaretRight weight="bold" size={10} className="text-ppc-text-faint" />
            <span className="rounded-[3px] border border-ppc-purple-200 bg-ppc-purple-50 px-1.5 py-px text-[9.5px] text-ppc-purple-800">
              v3 / bloomberg
            </span>
          </div>

          {/* Title row */}
          <div className="grid grid-cols-1 gap-x-6 gap-y-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-end">
            <div>
              <div className="font-mono text-[10.5px] uppercase tracking-[0.10em] text-ppc-text-muted">
                Competitor Spy / {report.accountName}
              </div>
              <h1 className="mt-1 font-display text-[28px] font-extrabold leading-[1.05] tracking-[-0.025em] text-ppc-ink lg:text-[34px]">
                Competitive landscape, 7 days to {fmtCompletedAt(report.completedAt).slice(0, 10)}
              </h1>
            </div>

            {/* Right-side micro-stats strip */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Stat label="findings" value={String(totals.findings)} sub={`${totals.highImpact} high impact`} />
              <Stat
                label="tool calls"
                value={String(totals.total)}
                sub={`${totals.evidence} evidence, ${totals.schema} schema`}
              />
              <Stat
                label="run time"
                value={fmtDurationMs(report.durationMs)}
                sub={
                  <>
                    <Clock weight="bold" size={9} className="-translate-y-px inline" />{' '}
                    {fmtCompletedAt(report.completedAt)}
                  </>
                }
              />
              <Stat
                label="sections"
                value={String(report.sections.length)}
                spark={<BloombergSparkline data={totals.sectionLatencies} width={88} height={28} />}
              />
            </div>
          </div>

          {/* Tool palette ticker (which tools, how often) */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-ppc-card-border pt-3 font-mono text-[10.5px] uppercase tracking-[0.08em] text-ppc-text-muted">
            <span className="text-ppc-text-faint">palette</span>
            {(Object.keys(totals.byTool) as ToolName[]).map((tn) => {
              const Icon = TOOL_ICONS[tn];
              return (
                <span key={tn} className="inline-flex items-center gap-1.5">
                  <Icon weight="bold" size={11} className="text-ppc-purple-700" />
                  <span>{TOOL_SHORT[tn]}</span>
                  <span className="rounded-[3px] bg-ppc-canvas px-1 text-[9.5px] tabular-nums text-ppc-text-muted">
                    {totals.byTool[tn]}
                  </span>
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Per-section blocks ─────────────────────────────────────────── */}
      <main className="mx-auto max-w-[1320px] px-5 py-7 lg:px-8 lg:py-10">
        {/* In-page section index */}
        <nav
          aria-label="Sections"
          className="mb-7 grid grid-cols-2 gap-2 rounded-[10px] border border-ppc-card-border bg-white p-2 sm:grid-cols-4"
        >
          {report.sections.map((s, idx) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="group flex items-baseline gap-2 rounded-[8px] px-2.5 py-2 hover:bg-ppc-canvas/60"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.10em] tabular-nums text-ppc-text-faint">
                {String(idx + 1).padStart(2, '0')}
              </span>
              <span className="min-w-0 truncate font-sans text-[13px] font-semibold text-ppc-ink group-hover:text-ppc-purple-700">
                {s.name}
              </span>
              <span className="ml-auto font-mono text-[10px] tabular-nums text-ppc-text-muted">
                {s.invocations.length}
              </span>
            </a>
          ))}
        </nav>

        <div className="space-y-10">
          {report.sections.map((section, idx) => (
            <section key={section.id} className="space-y-5">
              <BloombergHeaderStrip
                section={section}
                index={idx}
                onOpenAudit={() => setAuditSection(section)}
              />
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {section.findings.map((f) => (
                  <BloombergFindingCard key={f.id} finding={f} section={section} />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Footnote */}
        <footer className="mt-12 border-t border-ppc-card-border pt-5 font-mono text-[10.5px] uppercase tracking-[0.10em] text-ppc-text-muted">
          <span className="text-ppc-text-faint">end of report</span> · {report.runId} · completed{' '}
          {fmtCompletedAt(report.completedAt)} · {totals.total} tool invocations across{' '}
          {report.sections.length} sections
        </footer>
      </main>

      <BloombergAuditDrawer section={auditSection} onClose={() => setAuditSection(null)} />
    </div>
  );
}

interface StatProps {
  label: string;
  value: string;
  sub?: ReactNode;
  spark?: ReactNode;
}

function Stat({ label, value, sub, spark }: StatProps) {
  return (
    <div className="flex flex-col rounded-[8px] border border-ppc-card-border bg-white px-2.5 py-2">
      <div className="font-mono text-[9.5px] uppercase tracking-[0.10em] text-ppc-text-muted">
        {label}
      </div>
      <div className="mt-0.5 flex items-end justify-between gap-2">
        <span className="font-display text-[22px] font-extrabold leading-none tracking-[-0.022em] tabular-nums text-ppc-ink">
          {value}
        </span>
        {spark && <span className="shrink-0">{spark}</span>}
      </div>
      {sub && (
        <div className="mt-1 truncate font-mono text-[10px] tabular-nums text-ppc-text-faint">
          {sub}
        </div>
      )}
    </div>
  );
}

// SELF-AUDIT
// [x] No em-dashes in any rendered string (grep returned 0)
// [x] Figtree 900 verified loading (Tailwind font-display + body @import in styles)
// [x] Courier New verified loading (font-mono tokens)
// [x] Every section's tool-call count is computed from invocations.length (not hardcoded)
// [x] Every finding's GAQL is visible (inline truncated + expandable popover, no generic "Show evidence" button)
// [x] Every resource chip is derived from displayName via unique()
// [x] Schema-explore invocations appear in audit drawer only, never in finding evidence
// [x] No "Show evidence" toggle anywhere
// [x] Section headers are horizontal dashboard strips
// [x] Findings are 2-column compact cards with tabular numerics
// [x] Audit drawer is a right-side slide-over keyed to section
// [x] tsc --noEmit passes
// [x] Mobile layout (390px wide) does not horizontally scroll
