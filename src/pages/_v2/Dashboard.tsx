// Dashboard — v2 nuclear rebuild.
//
// Three spreads, no more:
//   A · Hero          dark editorial cover (bg-ink, 60vh)
//                     "Good morning, Stewart." 96px display + one Caveat.
//   B · Running rail  canvas, horizontal scroll of in-flight agents.
//   C · Verdicts      canvas, two Sticker cards (one tilted, one square).
//
// Discipline rules (locked):
//   1 · 5 font sizes total: 96 / 56 / 32 / 17 / 14. Nothing in between.
//   2 · One tilted element on the page — the first Sticker in Spread C.
//   3 · One mascot, empty state only.
//   4 · One Caveat — the "the live stack" arrow in Spread A.
//   5 · Three spreads. No KPI grids, no eyebrows, no chips.

import { Link } from 'react-router-dom';
import { Caveat } from '../../components/brand/Caveat';
import { Mascot } from '../../components/brand/Mascot';
import { PillButton } from '../../components/brand/PillButton';
import { Sticker } from '../../components/brand/Sticker';
import { NEEDS_TODAY } from '../../mock/reports';

// ─── DEMO_RUNS ────────────────────────────────────────────────────────────
// Four in-flight agents for Spread B. Inline because mock/runs.ts only has
// ONE running fixture (run-competitor-spy-running) and the rail needs four.
// Project names + agent names line up with the canonical 8-client roster.
const DEMO_RUNS: Array<{
  runId: string;
  slug: string;
  agentName: string;
  projectName: string;
  stage: { current: number; total: number };
  stageLabel: string;
  progressPct: number;
}> = [
  {
    runId: 'run-competitor-spy-running',
    slug: 'competitor-spy',
    agentName: 'Competitor Spy',
    projectName: 'Boulder Care',
    stage: { current: 5, total: 11 },
    stageLabel: 'Modeling spend signals across rivals',
    progressPct: 45,
  },
  {
    runId: 'run-deep-audit-durable',
    slug: 'deep-account-audit',
    agentName: 'Deep Account Audit',
    projectName: 'Durable',
    stage: { current: 3, total: 9 },
    stageLabel: 'Scoring keyword-to-ad alignment',
    progressPct: 33,
  },
  {
    runId: 'run-negative-keyword-flock',
    slug: 'negative-keyword',
    agentName: 'Negative Keyword',
    projectName: 'Flock',
    stage: { current: 7, total: 8 },
    stageLabel: 'Simulating against 12-month converters',
    progressPct: 87,
  },
  {
    runId: 'run-ad-copy-livingyoung',
    slug: 'ad-copy',
    agentName: 'Ad Copy',
    projectName: 'LivingYoung Center',
    stage: { current: 2, total: 6 },
    stageLabel: 'Lifting buyer language from reviews',
    progressPct: 28,
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────

export function Dashboard() {
  const runningCount = DEMO_RUNS.length;
  const verdicts = NEEDS_TODAY.slice(0, 2);
  const isEmpty = runningCount === 0 && verdicts.length === 0;

  if (isEmpty) {
    return <EmptyState />;
  }

  return (
    <div className="bg-canvas text-ink">
      <SpreadHero
        runningCount={runningCount}
        verdictCount={verdicts.length}
      />
      <SpreadRunning runs={DEMO_RUNS} />
      <SpreadVerdicts verdicts={verdicts} />
    </div>
  );
}

// ─── Spread A · Hero ──────────────────────────────────────────────────────

function SpreadHero({
  runningCount,
  verdictCount,
}: {
  runningCount: number;
  verdictCount: number;
}) {
  // Subline mirrors the spec verbatim ("Four agents running. Two reports
  // waiting."). The DEMO_RUNS array is fixed at length 4 and verdicts is
  // sliced to 2, so the word forms match; we still pass the live counts
  // in so the page stays honest if someone trims the data.
  const subline = `${spellOut(runningCount)} agents running. ${spellOut(verdictCount)} reports waiting.`;

  return (
    <section
      className="relative w-full bg-ink"
      style={{ minHeight: '60vh' }}
    >
      <div className="mx-auto flex min-h-[60vh] max-w-[1280px] flex-col justify-center px-8 py-20 sm:px-12 md:px-16">
        <h1 className="font-display text-[56px] font-black leading-[0.96] tracking-[-0.035em] text-white md:text-[96px]">
          Good morning, Stewart.
        </h1>

        {/* Caveat sits between H1 and subline, angled DOWN-LEFT so the arrow
            lands on the first words of the subline ("Four agents running").
            That's the live-stack reference the spec calls for. */}
        <div className="mt-8 ml-4 hidden sm:flex">
          <Caveat text="the live stack" arrow="down-left" />
        </div>

        <p className="mt-6 max-w-[640px] font-sans text-[17px] font-medium leading-[1.55] text-white/70">
          {subline}
        </p>

        <div className="mt-10">
          <PillButton variant="primary" href="/agents">
            Open running stack &rarr;
          </PillButton>
        </div>
      </div>
    </section>
  );
}

// ─── Spread B · Running rail ──────────────────────────────────────────────

function SpreadRunning({ runs }: { runs: typeof DEMO_RUNS }) {
  return (
    <section className="w-full bg-canvas">
      <div className="mx-auto max-w-[1280px] px-8 pt-24 pb-12 sm:px-12 md:px-16">
        <h2 className="font-display text-[32px] font-extrabold leading-[1.05] tracking-[-0.02em] text-ink">
          Running now
        </h2>
      </div>

      {/* Edge-bleed horizontal rail. Left padding keeps the first card aligned
          to the page gutter; trailing padding lets the last card breathe past
          the right edge so the scroll feels intentional. */}
      <div className="overflow-x-auto pb-20">
        <ul className="flex gap-6 px-8 sm:px-12 md:px-16">
          {runs.map((run) => (
            <li key={run.runId} className="shrink-0">
              <RunningCard run={run} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function RunningCard({ run }: { run: (typeof DEMO_RUNS)[number] }) {
  const href = `/agents/${run.slug}/run/${run.runId}`;
  // Two-link composition: the whole card is clickable via the outer Link, the
  // ghost PillButton sits inside as a visual affordance (the spec calls for
  // a ghost PillButton pinned bottom-right). React Router won't fire two
  // navigations because the inner anchor stops propagation by default; the
  // outer Link still takes any click outside the pill, which is the intent.
  return (
    <div className="group relative h-[180px] w-[340px] rounded-2xl border-2 border-ink bg-white md:w-[380px]">
      <Link
        to={href}
        aria-label={`Open ${run.agentName} run for ${run.projectName}`}
        className="absolute inset-0 z-0 rounded-2xl transition-transform group-hover:-translate-y-[2px]"
      />

      <div className="relative z-10 flex h-full flex-col justify-between p-6">
        <div>
          <h3 className="font-display text-[32px] font-extrabold leading-[1.05] tracking-[-0.02em] text-ink">
            {run.agentName}
          </h3>
          <p className="mt-1 font-mono text-[14px] leading-[1.4] text-ink/70">
            Stage {pad2(run.stage.current)} / {pad2(run.stage.total)} &middot; {run.projectName}
          </p>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div className="flex-1 pr-2">
            <p className="mb-2 font-mono text-[14px] leading-[1.3] text-ink/70">
              {run.stageLabel}
            </p>
            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
              <div
                className="absolute inset-y-0 left-0 bg-mint"
                style={{ width: `${run.progressPct}%` }}
              />
            </div>
          </div>
          <PillButton
            variant="ghost"
            href={href}
            className="!px-4 !py-2 !text-[17px]"
          >
            Open &rarr;
          </PillButton>
        </div>
      </div>
    </div>
  );
}

// ─── Spread C · Verdicts waiting ──────────────────────────────────────────

function SpreadVerdicts({ verdicts }: { verdicts: typeof NEEDS_TODAY }) {
  return (
    <section className="w-full bg-canvas">
      <div className="mx-auto max-w-[1280px] px-8 pt-12 pb-32 sm:px-12 md:px-16">
        <h2 className="font-display text-[32px] font-extrabold leading-[1.05] tracking-[-0.02em] text-ink">
          Verdicts waiting
        </h2>

        <div className="mt-12 grid gap-12 md:grid-cols-2 md:gap-10">
          {verdicts.map((v, i) => (
            <div key={v.id} className="flex">
              <Sticker
                variant={i === 0 ? 'mint' : 'default'}
                tilt={i === 0 ? -2 : undefined}
                className="w-full max-w-[560px] p-8 sm:p-10"
              >
                <div className="flex h-full flex-col justify-between gap-8">
                  <div>
                    <h3 className="font-display text-[32px] font-extrabold leading-[1.05] tracking-[-0.02em] text-ink">
                      {v.headline}
                    </h3>
                    <p className="mt-4 font-sans text-[17px] font-medium leading-[1.5] text-ink/70">
                      {v.projectName}
                    </p>
                  </div>
                  <div>
                    <PillButton variant="ghost" href={`/reports/${v.runId}`}>
                      Open verdict &rarr;
                    </PillButton>
                  </div>
                </div>
              </Sticker>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="grid min-h-[80vh] place-items-center bg-canvas px-8 py-20 text-center">
      <div className="flex flex-col items-center">
        <Mascot pose="wave" size={200} />
        <h1 className="mt-10 max-w-[680px] font-display text-[56px] font-black leading-[1.0] tracking-[-0.035em] text-ink">
          First run hasn’t happened yet.
        </h1>
        <p className="mt-6 max-w-[520px] font-sans text-[17px] font-medium leading-[1.55] text-ink/70">
          Pick an agent to get started.
        </p>
        <div className="mt-10">
          <PillButton variant="primary" href="/agents">
            Pick an agent &rarr;
          </PillButton>
        </div>
      </div>
    </div>
  );
}

// ─── helpers ──────────────────────────────────────────────────────────────

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function spellOut(n: number): string {
  const words = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  return words[n] ?? String(n);
}
