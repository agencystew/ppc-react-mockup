// v5 report page · world-class redesign
//
// Chrome flow:
//   Breadcrumbs   →   ReportOpener (slim editorial strip)   →   Tab bar
//   The "payoff" moment now lives INSIDE the AI Summary verdict card
//   (StrategyVerdictCard, dark refined surface). The page chrome stays calm.
//
// Routes:
//   /reports/:runId      →  canonical v5 (this page)
//   /v1/reports/:runId   →  v1 preserved for comparison
//
// Tab model: AI Summary | Deep Report.
//
// Design doc: docs/plans/2026-05-16-agent-results-v5-design.md

import { useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { Sparkle, Path } from '@phosphor-icons/react';

import { Breadcrumbs } from '../AgentResults';
import { RUNS } from '../../mock/runs';
import { PROJECTS } from '../../mock/projects';

import { SummaryV5 } from './SummaryV5';
import { DeepReportV5 } from './DeepReportV5';
import { ReportOpener } from './ReportOpener';
import { COMPETITOR_SPY_V5 } from './data';

type V5Tab = 'summary' | 'deep';

const V5_TABS: Array<{
  id: V5Tab;
  label: string;
  subtitle: string;
  icon: React.ReactNode;
}> = [
  {
    id: 'summary',
    label: 'AI Summary',
    subtitle: 'The strategist verdict',
    icon: <Sparkle size={20} weight="fill" />,
  },
  {
    id: 'deep',
    label: 'Deep Report',
    subtitle: 'The agent journey',
    icon: <Path size={20} weight="bold" />,
  },
];

export function AgentResultsV5() {
  const { runId } = useParams();
  const run = runId ? RUNS[runId] : undefined;
  if (!run) return <Navigate to="/" replace />;

  const completedRun = { ...run, status: 'completed' as const };
  const project = PROJECTS.find((p) => p.id === completedRun.projectId);
  const projectName = project?.name ?? '';

  const [tab, setTab] = useState<V5Tab>('summary');

  // Only Competitor Spy fixture is authored for v5 in this iteration.
  // Other runs fall back to a placeholder note so the route doesn't blow up.
  const hasV5Data = completedRun.runId === 'run-competitor-spy-completed';

  return (
    <div className="font-sans text-ppc-ink">
      <Breadcrumbs trail={['Reports', run.parentAgent.name, projectName]} />

      {hasV5Data && (
        <div className="mx-auto w-full max-w-[1200px]">
          <ReportOpener data={COMPETITOR_SPY_V5.hero} />
        </div>
      )}

      <V5TabBar active={tab} onChange={setTab} />

      {hasV5Data ? (
        <>
          {tab === 'summary' && <SummaryV5 data={COMPETITOR_SPY_V5} />}
          {tab === 'deep'    && <DeepReportV5 runId={completedRun.runId} />}
        </>
      ) : (
        <V5EmptyNote runId={completedRun.runId} />
      )}
    </div>
  );
}

function V5TabBar({
  active,
  onChange,
}: {
  active: V5Tab;
  onChange: (t: V5Tab) => void;
}) {
  return (
    <div
      className="sticky top-0 z-30 -mx-6 mb-6 px-6 py-5 sm:-mx-10 sm:px-10"
      style={{
        background: 'rgba(236,234,250,0.85)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        boxShadow: '0 1px 0 rgba(15,10,30,0.04)',
      }}
    >
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-3 sm:flex-row">
      {V5_TABS.map(({ id, label, subtitle, icon }) => {
        const on = id === active;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-pressed={on}
            className="group relative flex flex-1 items-center gap-4 rounded-[18px] px-7 py-5 text-left transition-all"
            style={{
              background: on ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
              boxShadow: on
                ? '0 0 0 2px #7F5AF0, 0 24px 40px -28px rgba(127,90,240,0.45)'
                : '0 0 0 1px #d9d4ec',
            }}
          >
            <span
              aria-hidden
              className="inline-flex h-[44px] w-[44px] items-center justify-center rounded-[12px] transition-colors"
              style={{
                background: on ? '#EEEDFE' : 'rgba(127,90,240,0.06)',
                color: on ? '#7F5AF0' : '#85819a',
              }}
            >
              {icon}
            </span>
            <span className="flex flex-col">
              <span
                className="text-[18px] font-bold leading-[1.15]"
                style={{
                  color: on ? '#1a1625' : '#3c3849',
                  letterSpacing: '-0.018em',
                }}
              >
                {label}
              </span>
              <span
                className="mt-1 text-[13.5px] leading-[1.3]"
                style={{ color: on ? '#534AB7' : '#85819a' }}
              >
                {subtitle}
              </span>
            </span>
          </button>
        );
      })}
      </div>
    </div>
  );
}

function V5EmptyNote({ runId }: { runId: string }) {
  return (
    <section
      className="mb-7 rounded-[16px] bg-white px-7 py-7 text-[14px] leading-[1.55] text-ppc-text-muted"
      style={{
        boxShadow: '0 0 0 1px #e7e2ef, 0 1px 0 rgba(15,10,30,0.02)',
      }}
    >
      <p className="mb-2 text-[15px] font-semibold text-ppc-ink">
        No v5 data authored for this run yet.
      </p>
      <p>
        Only{' '}
        <code className="font-mono text-[13px]">run-competitor-spy-completed</code>{' '}
        has v5 mock data so far. To preview the redesign, visit{' '}
        <Link
          to="/v5/reports/run-competitor-spy-completed"
          className="font-semibold text-ppc-purple-500 hover:text-ppc-purple-600"
        >
          /v5/reports/run-competitor-spy-completed
        </Link>
        {' · '}or open the v1 version of this run at{' '}
        <Link
          to={`/reports/${runId}`}
          className="font-semibold text-ppc-purple-500 hover:text-ppc-purple-600"
        >
          /reports/{runId}
        </Link>
        .
      </p>
    </section>
  );
}
