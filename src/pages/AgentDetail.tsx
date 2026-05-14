import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Clock, Check, Sparkle,
  Brain, Lightning, ChartBar,
} from '@phosphor-icons/react';
import { AGENTS } from '../mock/agents';
import { PROJECTS, ACCOUNTS, CURRENT_PROJECT_ID } from '../mock/projects';
import type { LaunchLevel } from '../types/agent';

// Agent Detail · /agents/:slug
//
// Editorial rhythm:
//   - Eyebrow (agent name) → 56-64px display H1 (the agent's headline,
//     with purple-period flourish) → 1-line outcome description
//   - Memoji "Stew built this" byline in editorial form (no card around it)
//   - "How this agent thinks" — 3 wide horizontal slats, not 3 small cards
//   - "What you'll get back" — clean enumerated list, no checkboxes-in-cards
//   - Configure & launch card sits on the right, stays sticky
//
// Pre-run surface — TIME + APPROVAL cues only. NEVER pre-run $ figures.

const LAUNCH_LEVELS: Array<{ value: LaunchLevel; label: string; sub: string }> = [
  { value: 'account',  label: 'Account-wide', sub: 'Across selected accounts' },
  { value: 'project',  label: 'Project',      sub: 'This client only' },
  { value: 'campaign', label: 'Campaign',     sub: 'Selected campaigns' },
  { value: 'adgroup',  label: 'Ad group',     sub: 'Narrowest scope' },
];

type RunMode = 'once' | 'recurring' | 'schedule-only' | 'custom';

export function AgentDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const agent = AGENTS.find((a) => a.slug === slug);

  const [selectedProject, setSelectedProject] = useState(CURRENT_PROJECT_ID);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [launchLevel, setLaunchLevel] = useState<LaunchLevel>('account');
  const [runMode, setRunMode] = useState<RunMode>('once');
  const [steer, setSteer] = useState('');
  const [dateRange, setDateRange] = useState('last_30d');

  const projectAccounts = useMemo(
    () => ACCOUNTS.filter((a) => a.projectId === selectedProject),
    [selectedProject],
  );

  if (!agent) {
    return (
      <div className="rounded-2xl border border-ppc-neutral-100 bg-white p-12 text-center">
        <div className="font-display text-[24px] font-bold tracking-tight">Agent not found.</div>
        <Link to="/agents" className="mt-3 inline-flex items-center gap-1 text-ppc-purple-500 hover:underline">
          <ArrowLeft size={14} /> Back to library
        </Link>
      </div>
    );
  }

  const headlineBody = agent.headline.endsWith('.')
    ? agent.headline.slice(0, -1)
    : agent.headline;

  const toggleAccount = (id: string) => {
    setSelectedAccounts((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleLaunch = () => {
    if (agent.slug === 'competitor-spy') {
      navigate('/agents/competitor-spy/run/run-competitor-spy-running');
    } else if (agent.slug === 'negative-keyword') {
      navigate('/reports/run-negative-keyword-completed');
    } else {
      navigate(`/agents/${agent.slug}/run/run-${agent.slug}`);
    }
  };

  return (
    <div className="space-y-10">
      <Link
        to="/agents"
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ppc-neutral-500 hover:text-ppc-purple-500"
      >
        <ArrowLeft size={13} /> All agents
      </Link>

      <div className="grid gap-10 lg:grid-cols-[1fr_420px]">
        {/* LEFT — editorial column */}
        <div className="space-y-12 min-w-0">
          {/* Hero — eyebrow + huge H1 + description */}
          <section>
            <div className="flex items-center gap-3 font-mono text-[11.5px] font-semibold uppercase tracking-[0.08em] text-ppc-neutral-500">
              <span className="text-[18px]">{agent.emoji}</span>
              <span>{agent.name}</span>
            </div>
            <h1 className="mt-5 max-w-[720px] font-display text-[56px] font-extrabold leading-[0.96] tracking-[-0.035em] text-ppc-black sm:text-[64px]">
              {headlineBody}
              <span className="text-ppc-purple-500">.</span>
            </h1>
            <p className="mt-7 max-w-[640px] text-[18px] leading-[1.55] tracking-tight text-ppc-neutral-700">
              {agent.outcomeDescription}
            </p>
          </section>

          {/* Stew built this — editorial byline, no card wrapper */}
          <section className="border-y border-ppc-neutral-100 py-8">
            <div className="flex items-start gap-5">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-ppc-purple-300 to-ppc-purple-500 text-[24px]">
                👨
              </div>
              <div className="text-[15.5px] leading-relaxed tracking-tight text-ppc-neutral-700">
                <div className="text-[13px] font-semibold text-ppc-black">
                  Stew built this <span className="font-normal text-ppc-neutral-500">/ founder, PPC.io</span>
                </div>
                <p className="mt-2 max-w-[640px]">
                  After scaling an agency to 100+ client accounts with a team of 50, I saw the same thing every agency owner sees: the gap between "we know what to do" and "we have time to do it for every single account" gets wider every month. This agent closes that gap.
                </p>
              </div>
            </div>
          </section>

          {/* How this agent thinks — wide horizontal slats, not tiles */}
          <section>
            <div className="font-mono text-[11.5px] font-semibold uppercase tracking-[0.08em] text-ppc-neutral-500">
              How this agent thinks
            </div>
            <h2 className="mt-3 font-display text-[28px] font-bold leading-tight tracking-[-0.02em] text-ppc-black">
              Like a senior strategist, not a script.
            </h2>
            <ol className="mt-8 space-y-3">
              {[
                { icon: Brain,     label: agent.thinkingSteps[0], step: '01' },
                { icon: Lightning, label: agent.thinkingSteps[1], step: '02' },
                { icon: ChartBar,  label: agent.thinkingSteps[2], step: '03' },
              ].map((s, i) => (
                <li
                  key={i}
                  className="flex items-center gap-6 rounded-2xl border border-ppc-neutral-100 bg-white px-7 py-5"
                >
                  <div className="font-mono text-[13px] font-semibold tabular text-ppc-purple-500">
                    {s.step}
                  </div>
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-ppc-purple-50 text-ppc-purple-500">
                    <s.icon size={18} weight="duotone" />
                  </div>
                  <div className="flex-1 text-[15.5px] font-semibold leading-snug tracking-tight text-ppc-black">
                    {s.label}
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* What you'll get back — clean list */}
          <section>
            <div className="font-mono text-[11.5px] font-semibold uppercase tracking-[0.08em] text-ppc-neutral-500">
              What you'll get back
            </div>
            <h2 className="mt-3 font-display text-[28px] font-bold leading-tight tracking-[-0.02em] text-ppc-black">
              Client-ready, audit-ready.
            </h2>
            <ul className="mt-7 space-y-4 text-[15.5px] leading-relaxed text-ppc-neutral-700">
              {[
                <>A <strong className="font-semibold text-ppc-black">{agent.expectedDuration}</strong> run in the background. You'll get an email when it's done.</>,
                <>A prioritized findings list with <strong className="font-semibold text-ppc-black">reasoning and impact estimate</strong> per finding.</>,
                <>A <strong className="font-semibold text-ppc-black">"Generate client report"</strong> path so the output is ready to hand to your client.</>,
                <>Full audit trail: every tool call, every source, every AI judgment — <strong className="font-semibold text-ppc-black">defensible methodology</strong>, not vibes.</>,
              ].map((line, i) => (
                <li key={i} className="flex items-start gap-3.5">
                  <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-ppc-success/15 text-ppc-success">
                    <Check size={11} weight="bold" />
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* RIGHT — Configure & launch (sticky) */}
        <aside className="lg:sticky lg:top-10 lg:h-fit">
          <div className="rounded-2xl border border-ppc-neutral-100 bg-white p-7 shadow-ppc-sm">
            <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-ppc-neutral-500">
              Configure & launch
            </div>
            <div className="mt-2 font-display text-[24px] font-bold tracking-[-0.02em] text-ppc-black">
              Pick where this runs<span className="text-ppc-purple-500">.</span>
            </div>

            <div className="mt-6 space-y-5">
              <Field label="Project (client)">
                <select
                  value={selectedProject}
                  onChange={(e) => { setSelectedProject(e.target.value); setSelectedAccounts([]); }}
                  className="ppc-select"
                >
                  {PROJECTS.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </Field>

              <Field label={`Accounts (${selectedAccounts.length || 'all'} selected)`}>
                <div className="max-h-44 overflow-y-auto rounded-xl border border-ppc-neutral-100 p-1">
                  {projectAccounts.map((acc) => {
                    const checked = selectedAccounts.includes(acc.id);
                    return (
                      <label
                        key={acc.id}
                        className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] transition-colors ${
                          checked ? 'bg-ppc-purple-50' : 'hover:bg-ppc-neutral-25'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleAccount(acc.id)}
                          className="h-4 w-4 accent-ppc-purple-500"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium text-ppc-black">{acc.name}</div>
                          <div className="font-mono text-[11px] text-ppc-neutral-400">{acc.customerId}</div>
                        </div>
                        <HealthDot health={acc.health} />
                      </label>
                    );
                  })}
                </div>
              </Field>

              <Field label="Launch level">
                <div className="grid grid-cols-2 gap-2">
                  {LAUNCH_LEVELS.map((l) => (
                    <button
                      key={l.value}
                      onClick={() => setLaunchLevel(l.value)}
                      className={`rounded-xl border px-3 py-2.5 text-left text-[12.5px] transition-colors ${
                        launchLevel === l.value
                          ? 'border-ppc-purple-500 bg-ppc-purple-50'
                          : 'border-ppc-neutral-100 hover:border-ppc-purple-300'
                      }`}
                    >
                      <div className="font-semibold text-ppc-black">{l.label}</div>
                      <div className="mt-0.5 text-[11.5px] text-ppc-neutral-500">{l.sub}</div>
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Date range">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="ppc-select"
                >
                  <option value="last_7d">Last 7 days</option>
                  <option value="last_30d">Last 30 days</option>
                  <option value="last_90d">Last 90 days</option>
                  <option value="this_month">This month so far</option>
                  <option value="last_month">Last month</option>
                </select>
              </Field>

              <Field label="Steer the agent (optional)">
                <textarea
                  value={steer}
                  onChange={(e) => setSteer(e.target.value)}
                  rows={2}
                  placeholder='e.g. "focus on settlement positioning, ignore brand"'
                  className="ppc-textarea"
                />
              </Field>

              <Field label="Run mode">
                <div className="grid grid-cols-2 gap-2">
                  {([
                    ['once',          'Once now'],
                    ['recurring',     'Now + recurring'],
                    ['schedule-only', 'Schedule only'],
                    ['custom',        'Custom cron'],
                  ] as Array<[RunMode, string]>).map(([v, l]) => (
                    <button
                      key={v}
                      onClick={() => setRunMode(v)}
                      className={`rounded-xl border px-3 py-2 text-[12.5px] font-semibold transition-colors ${
                        runMode === v
                          ? 'border-ppc-purple-500 bg-ppc-purple-50 text-ppc-black'
                          : 'border-ppc-neutral-100 text-ppc-neutral-700 hover:border-ppc-purple-300'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </Field>

              <button
                onClick={handleLaunch}
                className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-pill bg-grad-cta px-6 py-3.5 text-[15px] font-bold tracking-tight text-white shadow-ppc-cta transition-transform hover:-translate-y-[1px]"
              >
                <Sparkle size={16} weight="fill" />
                Launch agent
                <ArrowRight size={15} weight="bold" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11.5px] text-ppc-neutral-500">
                <Clock size={11} weight="duotone" />
                {agent.expectedDuration} · runs in background · email when ready
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ppc-neutral-500">
        {label}
      </div>
      {children}
    </div>
  );
}

function HealthDot({ health }: { health: 'good' | 'warning' | 'attention' }) {
  const cls = {
    good:      'bg-ppc-success',
    warning:   'bg-ppc-warning',
    attention: 'bg-ppc-error',
  }[health];
  return <span className={`h-2 w-2 shrink-0 rounded-full ${cls}`} />;
}
