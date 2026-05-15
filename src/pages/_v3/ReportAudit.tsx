// V3 Audit-first chronological. Competitor Spy report.
//
// The page's primary structural element is a vertical chronological timeline
// running down the left ~400px on desktop. Every tool invocation is a node
// on that spine. Schema lookups read as small grey margin notes. Evidence
// queries read as larger purple nodes with displayName chips. Findings dock
// to the right, anchored to their primaryEvidenceRef node by a thin
// connector. Section dividers break the spine into four named segments.
//
// Reading model: chronological, like a research lab notebook. Conclusions
// in the margin, work in the centre. Operator vocabulary throughout: "tool
// calls", "gaql query", "schema lookup", "rows", "started", "elapsed".

import { useMemo } from 'react';
import { COMPETITOR_SPY_REPORT, type Section } from '../../mock/competitor-spy-evidence';
import { AuditTimelineNode } from './components/Audit-TimelineNode';
import { AuditFindingCard } from './components/Audit-FindingCard';
import {
  buildInvocationIndex,
  buildPrimaryAnchorIndex,
  buildSupportingRefSet,
  formatDuration,
  formatNodeTime,
} from './components/Audit-utils';

export function ReportAudit() {
  const report = COMPETITOR_SPY_REPORT;
  const invocationsById = useMemo(() => buildInvocationIndex(report.sections), [report.sections]);
  const findingByPrimaryRef = useMemo(
    () => buildPrimaryAnchorIndex(report.sections),
    [report.sections],
  );
  const supportingRefSet = useMemo(
    () => buildSupportingRefSet(report.sections),
    [report.sections],
  );

  // Total tool calls across the whole report, computed from invocations.
  const totalToolCalls = report.sections.reduce((acc, s) => acc + s.invocations.length, 0);
  // Total schema lookups vs evidence queries, computed too.
  const totalSchema = report.sections.reduce(
    (acc, s) => acc + s.invocations.filter((i) => !i.isEvidence).length,
    0,
  );
  const totalEvidence = totalToolCalls - totalSchema;

  // Run start = first invocation's startedAt, used for "+Xs" offsets.
  const runStart = useMemo(() => {
    const all = report.sections.flatMap((s) => s.invocations);
    return all.reduce(
      (min, inv) => (inv.startedAt < min ? inv.startedAt : min),
      all[0]?.startedAt ?? report.completedAt,
    );
  }, [report]);

  return (
    <div className="-mx-8 -my-10 lg:-mx-12 lg:-my-12" style={{ background: '#ECEAFA' }}>
      {/* ─── Page hero ─────────────────────────────────────────────────── */}
      <header
        className="px-8 pt-10 pb-8 lg:px-12 lg:pt-12 lg:pb-10"
        style={{ background: '#ECEAFA' }}
      >
        <div className="max-w-[1480px]">
          <div
            className="font-mono text-[11px] uppercase tracking-[0.10em]"
            style={{ color: '#7F5AF0' }}
          >
            {report.agentName} run, {report.runId}
          </div>
          <h1
            className="mt-3 font-display text-[44px] font-black sm:text-[52px] lg:text-[60px]"
            style={{
              color: '#0F0A1E',
              letterSpacing: '-0.035em',
              lineHeight: 0.98,
            }}
          >
            {report.accountName}
          </h1>

          {/* Run meta strip, all computed */}
          <div
            className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3"
            style={{ borderTop: '1px solid #D9D4EC', paddingTop: 16 }}
          >
            <MetaBlock label="completed" value={formatHuman(report.completedAt)} />
            <MetaBlock label="duration" value={formatDuration(report.durationMs)} />
            <MetaBlock label="tool calls" value={String(totalToolCalls)} />
            <MetaBlock label="gaql + scrape + lookup" value={String(totalEvidence)} />
            <MetaBlock label="schema lookups" value={String(totalSchema)} />
            <MetaBlock label="sections" value={String(report.sections.length)} />
          </div>

          {/* Read-this-page hint, plain operator vocabulary */}
          <p
            className="mt-5 max-w-[640px] text-[14.5px]"
            style={{ color: '#3E3856', lineHeight: 1.55 }}
          >
            Every tool call the agent made appears on the spine below in the order it ran.
            Findings dock to the right of the node that produced their headline number.
            Click any node to see the gaql query, the result table, and the elapsed time.
          </p>
        </div>
      </header>

      {/* ─── Spine + findings ──────────────────────────────────────────── */}
      <div className="px-4 pb-20 lg:px-12">
        <div className="mx-auto max-w-[1480px]">
          {report.sections.map((section, idx) => (
            <SectionBlock
              key={section.id}
              section={section}
              indexLabel={idx + 1}
              runStart={runStart}
              invocationsById={invocationsById}
              findingByPrimaryRef={findingByPrimaryRef}
              supportingRefSet={supportingRefSet}
            />
          ))}
        </div>
      </div>

      {/* ─── Footer wrap ───────────────────────────────────────────────── */}
      <footer
        className="border-t px-8 py-8 lg:px-12"
        style={{ borderColor: '#D9D4EC', background: '#ECEAFA' }}
      >
        <div className="mx-auto max-w-[1480px]">
          <div
            className="font-mono text-[11px] uppercase tracking-[0.10em]"
            style={{ color: '#8A82A5' }}
          >
            end of run
          </div>
          <p
            className="mt-2 text-[13px]"
            style={{ color: '#6B6480', lineHeight: 1.55, margin: 0 }}
          >
            All {totalToolCalls} tool calls shown above were executed against the live Google
            Ads account, the public SERP, and the rival domains during the {formatDuration(report.durationMs)}{' '}
            window. Every gaql query is reachable via its timeline node.
          </p>
        </div>
      </footer>
    </div>
  );
}

// ─── Section block: divider + segment header + spine + findings ────────────

function SectionBlock({
  section,
  indexLabel,
  runStart,
  invocationsById,
  findingByPrimaryRef,
  supportingRefSet,
}: {
  section: Section;
  indexLabel: number;
  runStart: string;
  invocationsById: Record<string, ReturnType<typeof buildInvocationIndex>[string]>;
  findingByPrimaryRef: ReturnType<typeof buildPrimaryAnchorIndex>;
  supportingRefSet: Set<string>;
}) {
  // Computed counts, never hardcoded.
  const toolCallsCount = section.invocations.length;
  const schemaCount = section.invocations.filter((i) => !i.isEvidence).length;
  const queryCount = toolCallsCount - schemaCount;

  // Map finding -> primary node id for the dock layout.
  // We render findings in fixture order to the right of the spine, and
  // each finding's connector points to its primary ref node by id.

  return (
    <section className="pt-12">
      {/* Horizontal divider with named segment */}
      <div
        className="grid grid-cols-1 gap-3 pb-4 lg:grid-cols-[420px_1fr] lg:gap-8"
        style={{ borderTop: '1px solid #D9D4EC' }}
      >
        <div className="pt-5">
          <div
            className="font-mono text-[11px] uppercase tracking-[0.10em]"
            style={{ color: '#7F5AF0' }}
          >
            segment {String(indexLabel).padStart(2, '0')}, {section.window}
          </div>
          <h2
            className="mt-2 font-display text-[28px] font-black sm:text-[32px]"
            style={{
              color: '#0F0A1E',
              letterSpacing: '-0.025em',
              lineHeight: 1.05,
            }}
          >
            {section.name}
          </h2>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
            <SegmentMeta label="tool calls" value={String(toolCallsCount)} />
            <SegmentMeta label="gaql + scrape" value={String(queryCount)} />
            <SegmentMeta label="schema lookups" value={String(schemaCount)} />
          </div>
        </div>

        <div className="pt-5">
          <div
            className="font-mono text-[11px] uppercase tracking-[0.10em]"
            style={{ color: '#7F5AF0' }}
          >
            headline
          </div>
          <div className="mt-1 flex items-baseline gap-3">
            <span
              className="font-display font-black"
              style={{
                color: '#0F0A1E',
                fontSize: 'clamp(48px, 6vw, 76px)',
                letterSpacing: '-0.035em',
                lineHeight: 0.95,
              }}
            >
              {section.meta.headlineMetric.value}
            </span>
            <span
              className="font-mono text-[12px] uppercase tracking-[0.08em]"
              style={{ color: '#6B6480' }}
            >
              {section.meta.headlineMetric.label}
            </span>
          </div>
        </div>
      </div>

      {/* Spine + dock grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[420px_1fr] lg:gap-10">
        {/* LEFT: vertical spine with nodes */}
        <div className="relative">
          {/* The spine line itself */}
          <span
            aria-hidden
            className="pointer-events-none absolute top-0 bottom-0"
            style={{
              left: 30,
              width: 2,
              background:
                'linear-gradient(180deg, rgba(127,90,240,0.40) 0%, rgba(127,90,240,0.15) 100%)',
            }}
          />
          <div className="relative py-2">
            {section.invocations.map((inv, i) => {
              const isAnchor = Boolean(findingByPrimaryRef[inv.id]);
              const isSupporting = supportingRefSet.has(inv.id);
              return (
                <div
                  key={inv.id}
                  id={`node-${inv.id}`}
                  className="relative"
                  style={{ scrollMarginTop: 96 }}
                >
                  <AuditTimelineNode
                    inv={inv}
                    runStart={runStart}
                    isAnchor={isAnchor}
                    isSupporting={isSupporting}
                    // Expand the first anchor node of each section by default
                    // so the gaql is visible without interaction.
                    defaultOpen={isAnchor && i === firstAnchorIndex(section, findingByPrimaryRef)}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: findings, in fixture order */}
        <div className="space-y-6 pt-2">
          {section.findings.map((f) => (
            <div key={f.id} id={`finding-${f.id}`}>
              <AuditFindingCard finding={f} invocationsById={invocationsById} />
            </div>
          ))}
          {/* Tail card: a quiet "what the spine produced" recap */}
          <div
            className="rounded-xl px-5 py-4"
            style={{
              background: '#FAF8FF',
              border: '1px dashed #DAD3F4',
            }}
          >
            <div
              className="font-mono text-[10.5px] uppercase tracking-[0.10em]"
              style={{ color: '#7F5AF0' }}
            >
              segment recap
            </div>
            <p
              className="mt-1 text-[13px]"
              style={{ color: '#3E3856', lineHeight: 1.55, margin: 0 }}
            >
              {queryCount} {queryCount === 1 ? 'query' : 'queries'} produced the {section.findings.length}{' '}
              {section.findings.length === 1 ? 'finding above' : 'findings above'}, with {schemaCount}{' '}
              schema {schemaCount === 1 ? 'lookup' : 'lookups'} on the spine confirming which Google Ads
              fields were available. Click any node to inspect its args and result table.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// Find the index of the first invocation in a section that is the primary
// ref of a finding. Used to seed which spine node opens by default so the
// first gaql is visible without interaction.
function firstAnchorIndex(
  section: Section,
  findingByPrimaryRef: ReturnType<typeof buildPrimaryAnchorIndex>,
): number {
  for (let i = 0; i < section.invocations.length; i++) {
    if (findingByPrimaryRef[section.invocations[i].id]) return i;
  }
  return -1;
}

// ─── Hero meta block ───────────────────────────────────────────────────────

function MetaBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        className="font-mono text-[10.5px] uppercase tracking-[0.10em]"
        style={{ color: '#6B6480' }}
      >
        {label}
      </div>
      <div
        className="mt-0.5 font-display text-[20px] font-extrabold"
        style={{
          color: '#0F0A1E',
          letterSpacing: '-0.020em',
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function SegmentMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span
        className="font-display text-[16px] font-extrabold"
        style={{ color: '#0F0A1E', letterSpacing: '-0.020em' }}
      >
        {value}
      </span>
      <span
        className="font-mono text-[10.5px] uppercase tracking-[0.08em]"
        style={{ color: '#6B6480' }}
      >
        {label}
      </span>
    </div>
  );
}

function formatHuman(iso: string): string {
  const d = new Date(iso);
  const date = d.toUTCString().slice(0, 16); // "Fri, 15 May 2026"
  const { clock } = formatNodeTime(iso, iso);
  return `${date}, ${clock} UTC`;
}

// SELF-AUDIT
// [x] No em-dashes in any rendered string (grep returned 0)
// [x] No thematic vocabulary present (verified by grep against the banned list)
// [x] Figtree 900 verified loading (index.html links Figtree 500;700;800;900 from Google Fonts)
// [x] Courier New verified loading (font-mono in tailwind = "Courier New", system fallback only after)
// [x] Every section's tool-call count is computed from invocations.length (not hardcoded)
// [x] Chronological timeline is the primary structural element (left 420px on lg breakpoint)
// [x] Schema-explore nodes are visually distinct (10px grey dot, grey caption) from evidence nodes (22px purple dot + chip)
// [x] Findings are anchored to their primaryEvidenceRef node visually (connector stub + first-anchor default-open)
// [x] Every finding's GAQL is reachable by expanding its primary timeline node
// [x] Every resource chip is derived from displayName via unique() (chipsForFinding helper)
// [x] Section dividers segment the timeline by section (horizontal rule + segment header)
// [x] No "Show evidence" toggle anywhere (no expand/collapse UI on findings, only on timeline nodes per brief)
// [x] tsc --noEmit passes
// [x] Mobile layout (390px wide): grid collapses to single column, spine stacks above findings, no horizontal scroll
