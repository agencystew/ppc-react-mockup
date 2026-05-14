import { useParams, Navigate, Link } from 'react-router-dom';
import { ArrowLeft, Lightning, X } from '@phosphor-icons/react';
import { StagePage } from '../components/StagePage';
import { RUNS } from '../mock/runs';

// Agent Running · /agents/:slug/run/:runId
//
// The storytelling-with-receipts canvas in its LIVE state. Per Stewart
// 2026-05-14: the running and report pages share the StagePage component,
// but each gets a distinct page identity (breadcrumb + actions) so the
// user instantly knows which state they're on.
//
// Page identity for RUNNING:
//   - Eyebrow: "Agent loading"
//   - Breadcrumb: All agents / [agent name] / Live
//   - Actions: Cancel · Open mission control
export function AgentRunning() {
  const { runId } = useParams();
  const run = runId ? RUNS[runId] : undefined;

  if (!run) {
    // Generic stub run when we don't have showcase data for this agent —
    // keeps the click-through path unbroken across all 28 agents.
    return <Navigate to="/reports/run-competitor-spy-completed" replace />;
  }

  return (
    <div className="mx-auto max-w-[820px] space-y-7">
      {/* Identity strip — eyebrow + breadcrumb + page actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 font-mono text-[11px] font-semibold uppercase tracking-[0.16em]">
          <span className="inline-flex items-center gap-1.5 text-ppc-purple-300">
            <span className="ppcio-live-dot inline-block h-1.5 w-1.5 rounded-full bg-ppc-purple-500" />
            Agent loading
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
          <span className="text-white">Live</span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/runs"
            className="inline-flex items-center gap-1.5 rounded-md border border-white/15 px-3 py-1.5 text-[12px] font-semibold tracking-tight text-white transition-colors hover:bg-white/5"
          >
            <Lightning size={12} weight="fill" /> Mission control
          </Link>
          <button
            className="inline-flex items-center gap-1.5 rounded-md border border-white/15 px-3 py-1.5 text-[12px] font-semibold tracking-tight text-white/70 transition-colors hover:bg-white/5 hover:text-white"
            type="button"
          >
            <X size={11} weight="bold" /> Cancel run
          </button>
        </div>
      </div>

      <StagePage run={run} />

      {/* Footer — quiet back link */}
      <div className="pt-2">
        <Link
          to="/agents"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-white/55 transition-colors hover:text-ppc-purple-300"
        >
          <ArrowLeft size={12} weight="bold" /> Back to library
        </Link>
      </div>
    </div>
  );
}
