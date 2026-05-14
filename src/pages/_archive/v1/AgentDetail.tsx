import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Clock, Sparkle,
  Brain, Lightning, ChartLineUp, EnvelopeSimple, ShieldCheck,
} from '@phosphor-icons/react';
import { AGENTS } from '../mock/agents';
import { PROJECTS, ACCOUNTS, CURRENT_PROJECT_ID } from '../mock/projects';
import type { LaunchLevel } from '../types/agent';

// Agent Detail · /agents/:slug
//
// LIGHT magazine-feature page with ONE dark focal moment (the
// "How this agent thinks" block — the editorial smoky-black canvas
// that mirrors the StagePage). Left = editorial story. Right = sticky
// Configure & Launch card.
//
// Hard rules: TIME + APPROVAL cues only. NEVER pre-run $ figures.

const LAUNCH_LEVELS: Array<{ value: LaunchLevel; label: string; sub: string }> = [
  { value: 'account',  label: 'Account-wide', sub: 'Selected accounts' },
  { value: 'project',  label: 'Project',      sub: 'This client only' },
  { value: 'campaign', label: 'Campaign',     sub: 'Specific campaigns' },
  { value: 'adgroup',  label: 'Ad group',     sub: 'Narrowest scope' },
];

type RunMode = 'once' | 'recurring' | 'schedule-only' | 'custom';
const RUN_MODES: Array<[RunMode, string, string]> = [
  ['once',          'Run once now',       'Single launch, this run only'],
  ['recurring',     'Run now + schedule', 'Run today, then on a cadence'],
  ['schedule-only', 'Schedule only',      'Queue for a future run'],
  ['custom',        'Custom cron',        'Power-user cadence'],
];

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

  const categoryLabel = agent.category.charAt(0).toUpperCase() + agent.category.slice(1);

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
        className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ppc-neutral-500 transition-colors hover:text-ppc-purple-500"
      >
        <ArrowLeft size={12} weight="bold" /> All agents
      </Link>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_420px]">
        {/* ═══ LEFT — editorial column ═══════════════════════════════════ */}
        <div className="min-w-0 space-y-12">
          {/* HERO */}
          <section>
            <div className="flex items-center gap-3 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-ppc-neutral-500">
              <span className="tabular text-ppc-text-faint">
                {String(AGENTS.findIndex((a) => a.slug === agent.slug) + 1).padStart(2, '0')}
              </span>
              <span className="h-px w-7 bg-ppc-neutral-200" />
              <span>{categoryLabel} agent</span>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <span
                className="grid h-11 w-11 place-items-center rounded-2xl border border-ppc-neutral-100 bg-white text-[20px] shadow-ppc-sm"
                aria-hidden
              >
                {agent.emoji}
              </span>
              <div className="font-display text-[17px] font-semibold tracking-tight text-ppc-black">
                {agent.name}
              </div>
            </div>

            <h1 className="mt-6 max-w-[720px] font-display text-[52px] font-extrabold leading-[0.98] tracking-[-0.03em] text-ppc-black sm:text-[60px]">
              {headlineBody}
              <span className="text-ppc-purple-500">.</span>
            </h1>

            <p className="mt-6 max-w-[620px] text-[17px] leading-[1.55] tracking-tight text-ppc-neutral-700">
              {agent.outcomeDescription}
            </p>

            {/* Quiet meta row — TIME + APPROVAL cues */}
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] uppercase tracking-[0.12em] text-ppc-neutral-500">
              <span className="inline-flex items-center gap-1.5">
                <Clock size={12} weight="duotone" className="text-ppc-neutral-400" />
                <span className="tabular">{agent.expectedDuration}</span>
                <span className="text-ppc-neutral-400">· background</span>
              </span>
              <span className="h-3 w-px bg-ppc-neutral-200" />
              <span className="inline-flex items-center gap-1.5">
                <EnvelopeSimple size={12} weight="duotone" className="text-ppc-neutral-400" />
                Email when ready
              </span>
              <span className="h-3 w-px bg-ppc-neutral-200" />
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck size={12} weight="duotone" className="text-ppc-neutral-400" />
                Client-ready output
              </span>
            </div>
          </section>

          {/* BUILT BY — light editorial byline */}
          <section className="border-y border-ppc-neutral-100 py-7">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-ppc-purple-300 to-ppc-purple-500 text-[22px]">
                👨
              </div>
              <div className="text-[14.5px] leading-relaxed tracking-tight">
                <div className="text-[12.5px] font-semibold text-ppc-black">
                  Stew built this <span className="font-normal text-ppc-neutral-500">/ founder, PPC.io</span>
                </div>
                <p className="mt-2 max-w-[600px] text-ppc-neutral-700">
                  After scaling an agency to 100+ client accounts with a team of 50, I saw the same thing every agency owner sees: the gap between <span className="font-semibold text-ppc-black">we know what to do</span> and <span className="font-semibold text-ppc-black">we have time to do it for every single account</span> gets wider every month. This agent closes that gap.
                </p>
              </div>
            </div>
          </section>

          {/* HOW THIS AGENT THINKS — DARK focal moment */}
          <section className="ppc-dark ppc-dark--hero relative overflow-hidden rounded-3xl px-8 py-9 sm:px-10 sm:py-10">
            <div className="relative">
              <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">
                How this agent thinks
              </div>
              <h2 className="mt-3 max-w-[560px] font-display text-[30px] font-bold leading-[1.05] tracking-[-0.022em] text-white">
                Like a senior strategist, not a script<span className="text-ppc-purple-500">.</span>
              </h2>
              <ol className="mt-7 space-y-3">
                {[
                  { icon: Brain,         step: '01', kicker: 'Context',        label: agent.thinkingSteps[0] },
                  { icon: Lightning,     step: '02', kicker: 'Alignment',      label: agent.thinkingSteps[1] },
                  { icon: ChartLineUp,   step: '03', kicker: 'Recommendation', label: agent.thinkingSteps[2] },
                ].map((s, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-5 rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4"
                  >
                    <div className="tabular font-mono text-[12px] font-semibold text-ppc-purple-300">
                      {s.step}
                    </div>
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-ppc-purple-500/15 text-ppc-purple-300">
                      <s.icon size={17} weight="duotone" />
                    </div>
                    <div className="flex-1">
                      <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-white/55">
                        {s.kicker}
                      </div>
                      <div className="mt-1 text-[14.5px] font-medium leading-snug tracking-tight text-white">
                        {s.label}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* WHAT YOU'LL GET BACK — v5 "You walk away with" soft-purple panel */}
          <section>
            <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-ppc-neutral-500">
              What you'll get back
            </div>
            <h2 className="mt-3 font-display text-[26px] font-bold leading-[1.05] tracking-[-0.02em] text-ppc-black">
              Client-ready, audit-ready<span className="text-ppc-purple-500">.</span>
            </h2>

            <div className="mt-6 rounded-card bg-ppc-panel-soft px-7 py-6">
              <div className="text-[15px] font-semibold text-ppc-ink">You walk away with</div>
              <ul className="mt-4 space-y-3.5">
                {[
                  { title: `${agent.expectedDuration} in the background`, sub: "You'll get an email when it's done." },
                  { title: 'Prioritized findings with impact',            sub: 'Reasoning and estimated impact per finding.' },
                  { title: 'Generate client report',                      sub: 'Hand it to your client as-is. No editing.' },
                  { title: 'Full audit trail',                            sub: 'Every tool call, every source, every AI judgment.' },
                ].map((row, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-2 h-[5px] w-[5px] shrink-0 rounded-full bg-ppc-purple-700" />
                    <div>
                      <div className="text-[13.5px] font-semibold text-ppc-ink">{row.title}</div>
                      <div className="mt-0.5 text-[12.5px] leading-[1.55] text-ppc-purple-700">{row.sub}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>

        {/* ═══ RIGHT — Configure & launch (sticky light card) ═══════════════ */}
        <aside className="lg:sticky lg:top-10 lg:h-fit">
          <div className="rounded-2xl border border-ppc-neutral-100 bg-white p-7 shadow-ppc-sm">
            <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-ppc-neutral-500">
              Configure & launch
            </div>
            <div className="mt-2 font-display text-[22px] font-bold tracking-[-0.02em] text-ppc-black">
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
                    <option key={p.id} value={p.id}>
                      {p.name}{p.industry ? ` — ${p.industry}` : ''}
                    </option>
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
                <div className="space-y-1.5">
                  {RUN_MODES.map(([v, l, sub]) => {
                    const active = runMode === v;
                    return (
                      <button
                        key={v}
                        onClick={() => setRunMode(v)}
                        className={`flex w-full items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                          active
                            ? 'border-ppc-purple-500 bg-ppc-purple-50'
                            : 'border-ppc-neutral-100 hover:border-ppc-purple-300'
                        }`}
                      >
                        <span className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border-2 ${
                          active ? 'border-ppc-purple-500' : 'border-ppc-neutral-300'
                        }`}>
                          {active && <span className="h-1.5 w-1.5 rounded-full bg-ppc-purple-500" />}
                        </span>
                        <span>
                          <span className="block text-[12.5px] font-semibold text-ppc-black">{l}</span>
                          <span className="block text-[11.5px] text-ppc-neutral-500">{sub}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Field>

              <button
                onClick={handleLaunch}
                className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-md bg-ppc-purple-500 px-6 py-3.5 text-[14.5px] font-bold tracking-tight text-white shadow-[0_4px_14px_-4px_rgba(128,87,255,0.55)] transition-transform hover:-translate-y-[1px]"
              >
                <Sparkle size={15} weight="fill" />
                Launch agent
                <ArrowRight size={14} weight="bold" />
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
      <div className="mb-1.5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ppc-neutral-500">
        {label}
      </div>
      {children}
    </div>
  );
}
