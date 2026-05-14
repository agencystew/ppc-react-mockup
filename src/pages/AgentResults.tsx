import { useParams, Navigate } from 'react-router-dom';
import { StagePage } from '../components/StagePage';
import { RUNS } from '../mock/runs';

// Agent Results · /reports/:runId
//
// Completed-state view of the StagePage. The headline finding IS the $
// figure (post-run, account-anchored — safe per
// feedback_no_pre_run_dollar_figures.md). "Audit the work" reveal exposes
// every tool call + source table = the receipts that earn APPROVAL.
export function AgentResults() {
  const { runId } = useParams();
  const run = runId ? RUNS[runId] : undefined;

  if (!run) return <Navigate to="/" replace />;

  // Force completed status — Results view should always show the
  // completed treatment even if we stuck in a running fixture.
  const completedRun = { ...run, status: 'completed' as const };

  return (
    <div className="mx-auto max-w-[820px]">
      <StagePage run={completedRun} />
    </div>
  );
}
