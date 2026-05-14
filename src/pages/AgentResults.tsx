import { useParams, Navigate } from 'react-router-dom';
import { StagePage } from '../components/StagePage';
import { RUNS } from '../mock/runs';

// Agent Results · /reports/:runId
//
// v5 — the dark report card stands alone. Identity (icon + agent name)
// sits inside the card header; primary actions (Apply / Export / Schedule
// rerun) live in the card footer. No outer chrome required.
//
// Source artifact: docs/design-system/v5-source-artifacts/05-agent-report.html
export function AgentResults() {
  const { runId } = useParams();
  const run = runId ? RUNS[runId] : undefined;

  if (!run) return <Navigate to="/" replace />;

  // Force completed status — the Results view always shows the completed
  // treatment, even if a running fixture is loaded by mistake.
  const completedRun = { ...run, status: 'completed' as const };

  return (
    <div className="mx-auto max-w-[860px]">
      <StagePage run={completedRun} />
    </div>
  );
}
