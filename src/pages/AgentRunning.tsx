import { useParams, Navigate, Link } from 'react-router-dom';
import { ArrowLeft, X } from '@phosphor-icons/react';
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
//   - Actions: Cancel
export function AgentRunning() {
  const { runId } = useParams();
  const run = runId ? RUNS[runId] : undefined;

  if (!run) {
    // Generic stub run when we don't have showcase data for this agent —
    // keeps the click-through path unbroken across all 28 agents.
    return <Navigate to="/reports/run-competitor-spy-completed" replace />;
  }

  return (
    <div className="mx-auto max-w-[820px] space-y-6">
      {/* Top breadcrumb + page actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-ppc-neutral-500">
          <Link to="/agents" className="transition-colors hover:text-ppc-purple-700">
            All agents
          </Link>
          <span className="text-ppc-neutral-300">/</span>
          <Link to={`/agents/${run.agentSlug}`} className="transition-colors hover:text-ppc-purple-700">
            {run.parentAgent.name}
          </Link>
          <span className="text-ppc-neutral-300">/</span>
          <span className="text-ppc-black">Live</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="inline-flex items-center gap-1.5 rounded-md border border-ppc-neutral-200 bg-white px-3 py-1.5 text-[12px] font-semibold tracking-tight text-ppc-neutral-700 transition-colors hover:border-ppc-purple-300 hover:text-ppc-black"
            type="button"
          >
            <X size={11} weight="bold" /> Cancel run
          </button>
        </div>
      </div>

      {/* Page heading — anchors the dark canvas as a section of this page */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="flex items-center gap-3 font-display text-[34px] font-bold leading-[1.05] tracking-[-0.022em] text-ppc-black">
          <span>
            Live run<span className="text-ppc-purple-500">.</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-ppc-purple-200 bg-ppc-purple-50 px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-ppc-purple-700">
            <span className="ppcio-live-dot inline-block h-1.5 w-1.5 rounded-full bg-ppc-purple-500" />
            Stage {run.stage.current} of {run.stage.total}
          </span>
        </h1>
        <div className="text-[12px] font-medium text-ppc-neutral-500">
          {run.parentAgent.name} working in real time
        </div>
      </div>

      <StagePage run={run} />

      {/* Footer — quiet back link */}
      <div className="pt-2">
        <Link
          to="/agents"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-ppc-neutral-500 transition-colors hover:text-ppc-purple-700"
        >
          <ArrowLeft size={12} weight="bold" /> Back to library
        </Link>
      </div>
    </div>
  );
}
