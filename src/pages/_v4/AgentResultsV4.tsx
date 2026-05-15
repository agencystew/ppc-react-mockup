// v4 report page · summary redesign preview
//
// Reuses the v1 page chrome (Breadcrumbs, TitleRow, MetaLine, HeroCard, Tabs)
// exported from ../AgentResults so the page looks identical to /reports/:runId
// above the Summary tab. On the Summary tab, swaps the v1 FindingTiles +
// RecommendationsSection for the v4 Discovery cards stack.
//
// Routes:
//   /v4/reports/:runId   →  this page
//   /reports/:runId      →  canonical v1 (unchanged)
//
// Design doc: docs/plans/2026-05-15-summary-section-v4-design.md

import { useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { ArrowLeft } from '@phosphor-icons/react';

import {
  Breadcrumbs,
  TitleRow,
  MetaLine,
  HeroCard,
  Tabs,
  REPORT_CONFIGS,
  type ReportTab,
} from '../AgentResults';
import { RUNS } from '../../mock/runs';
import { PROJECTS } from '../../mock/projects';

import { SummaryV4 } from './SummaryV4';
import { COMPETITOR_SPY_DISCOVERIES } from './data';

export function AgentResultsV4() {
  const { runId } = useParams();
  const run = runId ? RUNS[runId] : undefined;
  if (!run) return <Navigate to="/" replace />;

  const completedRun = { ...run, status: 'completed' as const };
  const config = REPORT_CONFIGS[completedRun.runId];
  const project = PROJECTS.find((p) => p.id === completedRun.projectId);
  const projectName = project?.name ?? '';

  const [tab, setTab] = useState<ReportTab>('summary');

  // If the run has no config in REPORT_CONFIGS, v4 has nothing extra to add —
  // we fall through to the v1 route by redirect rather than scaffold an empty page.
  if (!config) return <Navigate to={`/reports/${completedRun.runId}`} replace />;

  // Currently only the competitor-spy fixture has authored v4 discoveries.
  // Other runs fall back to a placeholder note inside the summary tab so the
  // route doesn't blow up while we author more demo data.
  const discoveries =
    completedRun.runId === 'run-competitor-spy-completed' ? COMPETITOR_SPY_DISCOVERIES : [];

  return (
    <div className="font-sans text-ppc-ink">
      <V4Badge runId={completedRun.runId} />
      <Breadcrumbs trail={['Reports', run.parentAgent.name, projectName]} />
      <TitleRow agentName={run.parentAgent.name} onJumpToAudit={() => setTab('full')} />
      <MetaLine date={config.generated.date} time={config.generated.time} />
      <HeroCard run={completedRun} mascot={config.mascot()} />
      <Tabs active={tab} onChange={setTab} />

      {tab === 'summary' && (
        discoveries.length > 0 ? (
          <SummaryV4 discoveries={discoveries} />
        ) : (
          <V4EmptySummaryNote runId={completedRun.runId} />
        )
      )}

      {/* Full report + methodology — v4 doesn't touch these tabs.
         Send users back to v1 for the unchanged content. */}
      {(tab === 'full' || tab === 'methodology') && (
        <V4TabPassthrough runId={completedRun.runId} tab={tab} />
      )}
    </div>
  );
}

// ─── V4 surface markers ─────────────────────────────────────────────────

function V4Badge({ runId }: { runId: string }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <span
        className="inline-flex items-center gap-2 rounded-full px-[12px] py-[5px] text-[11px] font-bold uppercase tracking-[0.10em]"
        style={{
          background: 'linear-gradient(135deg, #1A0D38 0%, #2D1B5A 100%)',
          color: '#C9B5FF',
          fontFamily: '"Courier New", ui-monospace, monospace',
          boxShadow: 'inset 0 0 0 1px rgba(127,90,240,0.32)',
        }}
      >
        <span
          aria-hidden
          className="h-[5px] w-[5px] rounded-full"
          style={{
            background: '#A88CFF',
            boxShadow: '0 0 0 2px rgba(127,90,240,0.32)',
          }}
        />
        V4 · Summary redesign preview
      </span>
      <Link
        to={`/reports/${runId}`}
        className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-ppc-text-muted transition-colors hover:text-ppc-purple-500"
      >
        <ArrowLeft size={12} weight="bold" />
        Compare v1
      </Link>
    </div>
  );
}

function V4EmptySummaryNote({ runId }: { runId: string }) {
  return (
    <section
      className="mb-7 rounded-[16px] bg-white px-7 py-7 text-[14px] leading-[1.55] text-ppc-text-muted"
      style={{
        boxShadow: '0 0 0 1px #e7e2ef, 0 1px 0 rgba(15,10,30,0.02)',
      }}
    >
      <p className="mb-2 text-[15px] font-semibold text-ppc-ink">
        No v4 discoveries authored for this run yet.
      </p>
      <p>
        Only <code className="font-mono text-[13px]">run-competitor-spy-completed</code> has v4 Discovery
        data so far. To see the redesigned summary, visit{' '}
        <Link
          to="/v4/reports/run-competitor-spy-completed"
          className="font-semibold text-ppc-purple-500 hover:text-ppc-purple-600"
        >
          /v4/reports/run-competitor-spy-completed
        </Link>
        {' · '}
        or open the v1 version of this run at{' '}
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

function V4TabPassthrough({ runId, tab }: { runId: string; tab: 'full' | 'methodology' }) {
  return (
    <section
      className="mb-7 rounded-[16px] bg-white px-7 py-7 text-[14px] leading-[1.55] text-ppc-text-muted"
      style={{
        boxShadow: '0 0 0 1px #e7e2ef, 0 1px 0 rgba(15,10,30,0.02)',
      }}
    >
      <p className="mb-2 text-[15px] font-semibold text-ppc-ink">
        v4 only redesigns the Summary tab.
      </p>
      <p>
        The <strong>{tab === 'full' ? 'Full Report' : 'Methodology'}</strong> tab is unchanged from v1.
        Open the canonical version at{' '}
        <Link
          to={`/reports/${runId}`}
          className="font-semibold text-ppc-purple-500 hover:text-ppc-purple-600"
        >
          /reports/{runId}
        </Link>
        {' '}to see it.
      </p>
    </section>
  );
}
