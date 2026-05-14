// v2 — Reports inbox.
//
// "Every verdict. Every account. One page." The verdict archive: a single
// vertical column of full-width verdict rows, most recent at top, unread
// rows marked by a 4px red-orange left edge. Distinct from Dashboard's
// 2-row "Verdicts waiting" spread — this is the full archive.
//
// Discipline:
//   • 2 spreads only — dark hero + canvas archive.
//   • 1 Caveat ("filter by client").
//   • No mascot. No stickers. No tilts. No drop shadows on rows.
//   • Inbox is a single column, not a grid.
//   • Font sizes: H1 56 / H2 32 / BODY 17 / MONO 14.

import { useMemo, useState } from 'react';
import { Caveat } from '../components/brand/Caveat';
import { PillButton } from '../components/brand/PillButton';
import {
  NEEDS_TODAY,
  READY_FOR_CLIENT,
  FYI_REPORTS,
  type NeedsReport,
  type ReadyReport,
  type FyiReport,
} from '../mock/reports';

/* ─── Row model ─────────────────────────────────────────────────────────── */

type FilterKey = 'all' | 'client' | 'agent' | 'unread';

interface Row {
  id: string;
  runId: string;
  agent: string;
  client: string;
  dateLabel: string;
  // sortKey is a synthetic ordinal — smaller = more recent. Driven off the
  // ordering in the mock arrays so the inbox renders newest-first without
  // hand-coded timestamps.
  sortKey: number;
  verdict: string;
  unread: boolean;
}

function toRow(
  report: NeedsReport | ReadyReport | FyiReport,
  bucketOffset: number,
  index: number,
): Row {
  return {
    id: report.id,
    runId: report.runId,
    agent: report.agentName,
    client: report.projectName,
    dateLabel: report.finishedLabel,
    sortKey: bucketOffset + index,
    verdict: report.headline,
    // Hardcode the first 3 rows of the inbox as unread so the red-orange
    // edge accent shows up. The mock data doesn't carry a real `unread`
    // field — see the brief.
    unread: bucketOffset + index < 3,
  };
}

const ALL_ROWS: Row[] = [
  ...NEEDS_TODAY.map((r, i) => toRow(r, 0, i)),
  ...READY_FOR_CLIENT.map((r, i) => toRow(r, NEEDS_TODAY.length, i)),
  ...FYI_REPORTS.map((r, i) =>
    toRow(r, NEEDS_TODAY.length + READY_FOR_CLIENT.length, i),
  ),
];

/* ─── Page ──────────────────────────────────────────────────────────────── */

export function Reports() {
  const [filter, setFilter] = useState<FilterKey>('all');

  // Counts for the hero stat line.
  const totals = useMemo(() => {
    const projects = new Set(ALL_ROWS.map((r) => r.client));
    const agents = new Set(ALL_ROWS.map((r) => r.agent));
    return {
      reports: ALL_ROWS.length,
      projects: projects.size,
      agents: agents.size,
    };
  }, []);

  const visibleRows = useMemo(() => {
    const filtered =
      filter === 'unread' ? ALL_ROWS.filter((r) => r.unread) : ALL_ROWS;
    // sortKey already encodes newest-first ordering across buckets.
    return [...filtered].sort((a, b) => a.sortKey - b.sortKey);
  }, [filter]);

  return (
    <div className="-mx-6 -my-6 md:-mx-10 md:-my-8">
      <HeroSpread totals={totals} />
      <ArchiveSpread
        rows={visibleRows}
        filter={filter}
        onFilterChange={setFilter}
      />
    </div>
  );
}

/* ─── Spread A — Hero ───────────────────────────────────────────────────── */

function HeroSpread({
  totals,
}: {
  totals: { reports: number; projects: number; agents: number };
}) {
  return (
    <section
      className="relative w-full bg-ink text-white"
      style={{ minHeight: '40vh' }}
    >
      <div className="mx-auto flex max-w-[1240px] flex-col justify-center gap-6 px-6 py-16 md:px-10 md:py-20">
        <h1
          className="font-sans font-black tracking-tight text-white text-[32px] leading-[1.02] md:text-[56px]"
          style={{ fontWeight: 900 }}
        >
          Every verdict. Every account. One page.
        </h1>

        <p className="font-mono text-[14px] leading-none text-white/65">
          {totals.reports} reports · {totals.projects} projects ·{' '}
          {totals.agents} agents
        </p>

        {/* Caveat — singleton on this page. Sits to the right of the H1
            block and arrows down-right toward the sticky filter strip
            immediately below. */}
        <div className="pointer-events-none absolute right-10 bottom-10 hidden md:block">
          <Caveat arrow="down-right" text="filter by client" />
        </div>
      </div>
    </section>
  );
}

/* ─── Spread B — Verdict archive ────────────────────────────────────────── */

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'client', label: 'By client' },
  { key: 'agent', label: 'By agent' },
  { key: 'unread', label: 'Unread' },
];

function ArchiveSpread({
  rows,
  filter,
  onFilterChange,
}: {
  rows: Row[];
  filter: FilterKey;
  onFilterChange: (key: FilterKey) => void;
}) {
  const [visibleCount, setVisibleCount] = useState(20);
  const shown = rows.slice(0, visibleCount);
  const canLoadMore = visibleCount < rows.length;

  return (
    <section className="w-full bg-canvas">
      <div className="mx-auto max-w-[1240px] px-6 pb-20 md:px-10">
        {/* Sticky filter strip */}
        <div className="sticky top-0 z-10 bg-canvas/95 py-4 backdrop-blur">
          <div className="-mx-2 flex gap-2 overflow-x-auto px-2 md:overflow-visible">
            {FILTERS.map((f) => (
              <FilterPill
                key={f.key}
                label={f.label}
                active={filter === f.key}
                onClick={() => onFilterChange(f.key)}
              />
            ))}
          </div>
        </div>

        {/* Vertical inbox column */}
        <ul className="mt-6 flex flex-col gap-3">
          {shown.map((row) => (
            <li key={row.id}>
              <VerdictRow row={row} />
            </li>
          ))}
        </ul>

        {/* Load more */}
        {canLoadMore && (
          <div className="mt-10 flex justify-center">
            <PillButton
              variant="ghost"
              onClick={() => setVisibleCount((c) => c + 20)}
            >
              Load 20 more →
            </PillButton>
          </div>
        )}
      </div>
    </section>
  );
}

/* ─── Filter pill ───────────────────────────────────────────────────────── */

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex shrink-0 items-center gap-2 rounded-full border-2 border-ink bg-white px-4 py-2 font-sans text-[17px] font-bold leading-none text-ink transition-transform hover:-translate-y-[1px]"
    >
      {active && (
        <span
          aria-hidden
          className="inline-block h-2 w-2 rounded-full bg-redorange"
        />
      )}
      {label}
    </button>
  );
}

/* ─── Verdict row ───────────────────────────────────────────────────────── */

function VerdictRow({ row }: { row: Row }) {
  return (
    <a
      href={`/reports/${row.runId}`}
      className="group flex items-stretch border-2 border-ink bg-white transition-transform hover:-translate-y-[1px]"
    >
      {/* Unread edge accent — 4px red-orange flush against the ink border.
          Pattern lifted from AppShell's ActiveAccent (lines 312-323) but
          inline-flow rather than absolute. */}
      {row.unread && (
        <span
          aria-hidden
          className="w-1 self-stretch shrink-0 bg-redorange"
        />
      )}

      <div className="flex flex-1 flex-col gap-4 p-6 md:flex-row md:items-center md:gap-6">
        {/* Left: agent / client / date — the row's single mono block */}
        <div className="flex shrink-0 flex-col gap-1 md:w-48">
          <span className="font-mono text-[14px] leading-tight text-ink">
            {row.agent}
          </span>
          <span className="font-mono text-[14px] leading-tight text-ink/65">
            {row.client}
          </span>
          <span className="font-mono text-[14px] leading-tight text-ink/65">
            {row.dateLabel}
          </span>
        </div>

        {/* Middle: verdict headline — H2 32px Figtree 800 */}
        <h2
          className="flex-1 font-sans text-[24px] leading-[1.15] text-ink md:text-[32px]"
          style={{ fontWeight: 800 }}
        >
          {row.verdict}
        </h2>

        {/* Right: ghost CTA */}
        <div className="shrink-0">
          <PillButton variant="ghost" href={`/reports/${row.runId}`}>
            Open verdict →
          </PillButton>
        </div>
      </div>
    </a>
  );
}
