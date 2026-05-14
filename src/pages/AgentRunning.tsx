import { useParams, Navigate } from 'react-router-dom';
import { StagePage } from '../components/StagePage';
import { RUNS } from '../mock/runs';

// Agent Running · /agents/:slug/run/:runId
//
// The storytelling-with-receipts canvas. Methodical stages, per-stage
// duration, live progress shimmer. The differentiator against ChatGPT/
// Claude rambling.
export function AgentRunning() {
  const { runId } = useParams();
  const run = runId ? RUNS[runId] : undefined;

  if (!run) {
    // Generic stub run when we don't have showcase data for this agent
    // — keeps the click-through path unbroken across all 28 agents.
    return <Navigate to="/reports/run-competitor-spy-completed" replace />;
  }

  return (
    <div className="mx-auto max-w-[820px]">
      <StagePage run={run} />
    </div>
  );
}
