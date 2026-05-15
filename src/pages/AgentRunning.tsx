import { useParams, Navigate } from 'react-router-dom';
import { StagePage } from '../components/StagePage';
import { RUNS } from '../mock/runs';

// Agent Running · /agents/:slug/run/:runId  (and /loading/:runId)
//
// Renders inside the standard AppShell wrapper (max-w-[1240px] centered,
// px-12 lg:px-12 py-12) — same posture as /reports/:runId so both surfaces
// breathe identically. Page identity (agent name + RUNNING · Stage N of M)
// sits on the canvas, then the headline, then a dark "Live mission feed"
// card, stage-level Completed + Up next sections, and a lavender callout.
export function AgentRunning() {
  const { runId } = useParams();
  const run = runId ? RUNS[runId] : undefined;

  if (!run) {
    return <Navigate to="/reports/run-competitor-spy-completed" replace />;
  }

  return (
    <div className="font-sans text-ppc-ink">
      <TopBar icon={run.parentAgent.icon} name={run.parentAgent.name} />
      <StagePage run={run} />
    </div>
  );
}

function TopBar({ icon, name }: { icon: string; name: string }) {
  return (
    <div className="mb-9 flex items-center gap-3">
      <span
        className="grid h-9 w-9 place-items-center rounded-full text-[17px] leading-none"
        style={{ background: '#E9E3FF' }}
      >
        {icon}
      </span>
      <span className="text-[18px] font-semibold tracking-[-0.012em] text-ppc-ink">
        {name}
      </span>
    </div>
  );
}
