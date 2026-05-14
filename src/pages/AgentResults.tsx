import { useParams, Navigate, Link } from 'react-router-dom';
import { ArrowLeft, Export, ArrowsClockwise, Share } from '@phosphor-icons/react';
import { StagePage } from '../components/StagePage';
import { RUNS } from '../mock/runs';

// Agent Results · /reports/:runId
//
// The storytelling-with-receipts canvas in its COMPLETED state. Headline
// finding IS the $ figure (post-run, account-anchored — safe per
// feedback_no_pre_run_dollar_figures.md). "Audit the work" reveal exposes
// every tool call + source table — the receipts that earn APPROVAL.
//
// Page identity for REPORT:
//   - Eyebrow: "Agent report"
//   - Breadcrumb: All agents / [agent name] / Report
//   - Actions: Export · Share · Rerun
export function AgentResults() {
  const { runId } = useParams();
  const run = runId ? RUNS[runId] : undefined;

  if (!run) return <Navigate to="/" replace />;

  // Force completed status — Results view should always show the
  // completed treatment even if we stuck in a running fixture.
  const completedRun = { ...run, status: 'completed' as const };

  return (
    <div className="mx-auto max-w-[820px] space-y-7">
      {/* Identity strip — eyebrow + breadcrumb + page actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 font-mono text-[11px] font-semibold uppercase tracking-[0.16em]">
          <span className="inline-flex items-center gap-1.5 text-ppc-success">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-ppc-success" />
            Agent report
          </span>
          <span className="h-px w-7 bg-white/15" />
          <Link to="/agents" className="text-white/55 transition-colors hover:text-white">
            All agents
          </Link>
          <span className="text-white/30">/</span>
          <Link to={`/agents/${run.agentSlug}`} className="text-white/55 transition-colors hover:text-white">
            {run.parentAgent.name}
          </Link>
          <span className="text-white/30">/</span>
          <span className="text-white">Report</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="inline-flex items-center gap-1.5 rounded-md border border-white/15 px-3 py-1.5 text-[12px] font-semibold tracking-tight text-white transition-colors hover:bg-white/5"
            type="button"
          >
            <Export size={12} weight="bold" /> Export
          </button>
          <button
            className="inline-flex items-center gap-1.5 rounded-md border border-white/15 px-3 py-1.5 text-[12px] font-semibold tracking-tight text-white transition-colors hover:bg-white/5"
            type="button"
          >
            <Share size={12} weight="bold" /> Share
          </button>
          <Link
            to={`/agents/${run.agentSlug}`}
            className="inline-flex items-center gap-1.5 rounded-md border border-white/15 px-3 py-1.5 text-[12px] font-semibold tracking-tight text-white transition-colors hover:bg-white/5"
          >
            <ArrowsClockwise size={12} weight="bold" /> Rerun
          </Link>
        </div>
      </div>

      <StagePage run={completedRun} />

      {/* Footer — quiet back link */}
      <div className="pt-2">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-white/55 transition-colors hover:text-ppc-purple-300"
        >
          <ArrowLeft size={12} weight="bold" /> Back to dashboard
        </Link>
      </div>
    </div>
  );
}
