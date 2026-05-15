import { useParams, Navigate } from 'react-router-dom';
import { StagePage } from '../components/StagePage';
import { RUNS } from '../mock/runs';

// Agent Running · /agents/:slug/run/:runId  (and /loading/:runId)
//
// The light-surface running view. Page identity (agent name + RUNNING ·
// Stage N of M) sits on the canvas, then a giant headline, then a dark
// "Live mission feed" card, then stage-level Completed + Up next sections,
// then a soft lavender signals callout.
//
// Layout note: AppShell skips its 1240/lg:px-12 wrapper for this route
// (isAgentRun) so the headline starts closer to the sidebar — the dark
// mission-feed card carries its own internal breathing room.
export function AgentRunning() {
  const { runId } = useParams();
  const run = runId ? RUNS[runId] : undefined;

  if (!run) {
    return <Navigate to="/reports/run-competitor-spy-completed" replace />;
  }

  return (
    <div className="w-full max-w-[960px] pl-6 pr-8 pt-7 pb-16 lg:pl-8 lg:pr-10">
      <TopBar
        icon={run.parentAgent.icon}
        name={run.parentAgent.name}
        current={run.stage.current}
        total={run.stage.total}
      />
      <StagePage run={run} />
    </div>
  );
}

function TopBar({
  icon, name, current, total,
}: {
  icon: string;
  name: string;
  current: number;
  total: number;
}) {
  return (
    <div className="mb-9 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
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
      <div
        className="inline-flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-ppc-text-muted"
        style={{ fontFamily: '"Courier New", ui-monospace, Menlo, monospace' }}
      >
        <span
          className="ppcio-live-dot inline-block h-[7px] w-[7px] rounded-full"
          style={{ background: '#7F5AF0' }}
        />
        <span>Running</span>
        <span aria-hidden className="opacity-40">·</span>
        <span className="tabular-nums">Stage {current} of {total}</span>
      </div>
    </div>
  );
}
