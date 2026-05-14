// v2 Agent Running — the hushed flight tracker.
//
// Single centred column on canvas. Rocket mascot drifts. Stage label is the
// page's ONE mono use. H1 stage name. One thin ink progress line. 11-stage
// list with check / pulse-dot / outline glyphs. ONE Caveat for the time
// estimate. One ghost cancel button. Nothing else.
//
// Discipline rules upheld:
//   1. Five font sizes used — H1 56px, BODY 17px, MONO 14px (the rest live
//      on other pages). No drift, no 12px, no 13px.
//   2. No tilted elements. Pure centred symmetry.
//   3. ONE mascot — rocket, dead centre, gentle float.
//   4. ONE Caveat — the "about 6 minutes left" margin note.
//   5. ONE spread max — single focused moment.
//
// Routes: /agents/:slug/loading/:runId and /agents/:slug/run/:runId.

import { useParams, Link } from 'react-router-dom';
import { Check, Circle } from '@phosphor-icons/react';
import { Mascot } from '../../components/brand/Mascot';
import { PillButton } from '../../components/brand/PillButton';
import { Caveat } from '../../components/brand/Caveat';
import { RUNS } from '../../mock/runs';
import { AGENTS } from '../../mock/agents';

// ─── Stage shape used by this page only ────────────────────────────────────
type Stage = { title: string };

/**
 * Build the 11-stage list for a given run. If the run already carries
 * completed + upcoming stages (showcase data shape), splice them around
 * the current stage. Otherwise fall back to a plausible competitor-spy
 * default — keeps the click-through path unbroken for every agent.
 */
function stagesForRun(runId: string | undefined): {
  stages: Stage[];
  currentIndex: number;
} {
  const fallback: Stage[] = [
    { title: 'Fetching competitor URLs' },
    { title: 'Reading the auction landscape' },
    { title: 'Decoding their ad copy' },
    { title: 'Scraping competitor pages' },
    { title: 'Walking their funnels' },
    { title: 'Sizing their spend' },
    { title: 'Finding the gaps' },
    { title: 'Spotting the threats' },
    { title: 'Comparing positioning' },
    { title: 'Drafting the verdict' },
    { title: 'Packaging the findings' },
  ];

  if (!runId) return { stages: fallback, currentIndex: 3 };
  const run = RUNS[runId];
  if (!run) return { stages: fallback, currentIndex: 3 };

  // If the run carries showcase stage data, use it. Otherwise fall back.
  const completed =
    'completedStages' in run && run.completedStages
      ? run.completedStages.map((s) => ({ title: s.title }))
      : [];
  const active =
    'activeAgent' in run && run.activeAgent
      ? [{ title: run.activeAgent.task }]
      : [];
  const upcoming =
    'upcomingStages' in run && run.upcomingStages
      ? run.upcomingStages.map((s) => ({ title: s.title }))
      : [];
  const moreCount =
    'moreUpcomingCount' in run && typeof run.moreUpcomingCount === 'number'
      ? run.moreUpcomingCount
      : 0;
  const moreFiller: Stage[] = Array.from({ length: moreCount }, (_, i) => ({
    title: `Follow-on step ${i + 1}`,
  }));

  const total = run.stage?.total ?? 11;
  const currentIndex =
    typeof run.stage?.current === 'number'
      ? Math.max(0, run.stage.current - 1)
      : completed.length;

  // Compose to exactly `total` stages — pad / trim if shapes don't line up.
  const assembled = [...completed, ...active, ...upcoming, ...moreFiller];
  const stages: Stage[] =
    assembled.length >= total
      ? assembled.slice(0, total)
      : [
          ...assembled,
          ...fallback.slice(assembled.length, total),
        ];

  return { stages, currentIndex };
}

/**
 * Two-digit zero-pad for the "Stage 04 of 11" mono label.
 */
function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export function AgentRunning() {
  const { slug, runId } = useParams();
  const run = runId ? RUNS[runId] : undefined;
  const agentDef = slug ? AGENTS.find((a) => a.slug === slug) : undefined;
  const { stages, currentIndex } = stagesForRun(runId);

  // ─── Empty state: run not found, render a calm centred fallback ─────────
  if (runId && !run) {
    return (
      <div className="min-h-screen bg-canvas font-sans text-ink">
        <div className="mx-auto flex max-w-[720px] flex-col items-center justify-center px-6 py-16 text-center">
          <h1 className="font-display text-[36px] font-black md:text-[56px]">
            Run not found
          </h1>
          <p className="mt-4 text-[17px] text-ink/65">
            That run id doesn't match anything we have on file.
          </p>
          <div className="mt-8">
            <Link to="/agents">
              <PillButton variant="ghost">Back to agents</PillButton>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentStage = stages[currentIndex] ?? stages[0];
  const total = stages.length;
  const progressPct =
    run && 'progressPct' in run && typeof run.progressPct === 'number'
      ? run.progressPct
      : Math.round(((currentIndex + 0.5) / Math.max(total, 1)) * 100);
  const stageLabel = `Stage ${pad2(currentIndex + 1)} of ${pad2(total)}`;
  const agentName = agentDef?.name ?? run?.parentAgent.name ?? 'Agent';

  return (
    <div className="min-h-screen bg-canvas font-sans text-ink">
      {/* Local keyframes — float on the mascot, pulse-ring on the active dot. */}
      <style>{`
        @keyframes ac-float {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-8px); }
        }
        @keyframes ac-pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(127, 90, 240, 0.5); }
          100% { box-shadow: 0 0 0 12px rgba(127, 90, 240, 0); }
        }
      `}</style>

      <div className="mx-auto flex min-h-screen max-w-[720px] flex-col items-center justify-center gap-8 px-6 py-16">
        {/* Rocket mascot — drifts gently. */}
        <div
          aria-hidden="true"
          style={{ animation: 'ac-float 3s ease-in-out infinite' }}
          className="flex justify-center"
        >
          <span className="block md:hidden">
            <Mascot pose="rocket" size={160} />
          </span>
          <span className="hidden md:block">
            <Mascot pose="rocket" size={240} />
          </span>
        </div>

        {/* Stage X of Y — the page's one mono use. */}
        <div className="text-center">
          <div className="font-mono text-[14px] uppercase tracking-wider text-ink/65">
            {stageLabel}
          </div>

          {/* Stage name — H1 56px, centred. */}
          <h1 className="mt-3 font-display text-[36px] font-black leading-tight md:text-[56px]">
            {currentStage.title}
          </h1>

          <p className="mt-3 text-[17px] text-ink/65">
            {agentName} working in real time.
          </p>
        </div>

        {/* One thin ink progress line — no text label, the bar IS the answer. */}
        <div
          className="w-[280px] overflow-hidden rounded-full bg-ink/15 md:w-[480px]"
          style={{ height: '6px' }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progressPct}
          aria-label={`${stageLabel} progress`}
        >
          <div
            className="h-full bg-mint transition-[width] duration-700 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
          />
        </div>

        {/* The 11-stage list. */}
        <ol className="w-full max-w-[480px] space-y-3 pt-2" aria-label="Run stages">
          {stages.map((stage, i) => {
            const state =
              i < currentIndex
                ? 'done'
                : i === currentIndex
                  ? 'current'
                  : 'upcoming';

            return (
              <li
                key={`${i}-${stage.title}`}
                className="flex items-center gap-3 text-[17px]"
              >
                {/* Glyph slot — fixed width keeps text aligned. */}
                <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                  {state === 'done' && (
                    <Check
                      size={18}
                      weight="bold"
                      aria-label="Completed"
                      className="text-ink/70"
                    />
                  )}
                  {state === 'current' && (
                    <span
                      aria-label="In progress"
                      className="inline-block h-2 w-2 rounded-full bg-mint"
                      style={{
                        boxShadow: '0 0 0 0 rgba(127, 90, 240, 0.5)',
                        animation: 'ac-pulse-ring 1.6s ease-out infinite',
                      }}
                    />
                  )}
                  {state === 'upcoming' && (
                    <Circle
                      size={14}
                      weight="regular"
                      aria-label="Upcoming"
                      className="text-ink/40"
                    />
                  )}
                </span>

                <span
                  className={
                    state === 'done'
                      ? 'text-ink/70'
                      : state === 'current'
                        ? 'font-semibold text-ink'
                        : 'text-ink/40'
                  }
                >
                  {stage.title}
                </span>
              </li>
            );
          })}
        </ol>

        {/* The single Caveat + ghost cancel. */}
        <div className="flex flex-col items-center gap-5 pt-2">
          <Caveat arrow="none" text="about 6 minutes left, give or take" />
          <Link to="/agents">
            <PillButton variant="ghost">Cancel</PillButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
