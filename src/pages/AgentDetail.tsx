import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Clock, CheckCircle,
  Brain, Lightning, ChartLineUp, EnvelopeSimple,
  ShieldCheck, FileText, Sparkle,
} from '@phosphor-icons/react';
import { AGENTS } from '../mock/agents';
import { PROJECTS, ACCOUNTS, CURRENT_PROJECT_ID } from '../mock/projects';
import { PrimaryCTA } from '../components/PageHero';
import type { LaunchLevel } from '../types/agent';

// Agent Detail · /agents/:slug
//
// Editorial rhythm — premium product story before launching the agent.
// Reads top-to-bottom like a feature profile in a magazine.
//
//   Eyebrow (00 · category + agent name)
//   → 64px display H1 with purple period
//   → 1-line outcome lede
//   → editorial byline ("Stew built this")
//   → DARK "How this agent thinks" block (the smoky-black moment)
//   → "What you'll get back" — clean editorial bullets w/ duotone glyphs
//
// Right column: sticky configure & launch card. Marquee CTA = <PrimaryCTA>
// (the same ppc.io subscribe-button pulse glow).
//
// Pre-run surface — TIME + APPROVAL cues only. NEVER pre-run $ figures.

const LAUNCH_LEVELS: Array<{ value: LaunchLevel; label: string; sub: string }> = [
  { value: 'account',  label: 'Account-wide', sub: 'Selected accounts' },
  { value: 'project',  label: 'Project',      sub: 'This client only' },
  { value: 'campaign', label: 'Campaign',     sub: 'Specific campaigns' },
  { value: 'adgroup',  label: 'Ad group',     sub: 'Narrowest scope' },
];

type RunMode = 'once' | 'recurring' | 'schedule-only' | 'custom';

const RUN_MODES: Array<[RunMode, string, string]> = [
  ['once',          'Run once now',     'Single launch, this run only'],
  ['recurring',     'Run now + schedule', 'Run today, then on a cadence'],
  ['schedule-only', 'Schedule only',     'Queue for a future run'],
  ['custom',        'Custom cron',       'Power-user cadence'],
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

  // Pretty category label (no fancy mapping — use whatever AGENTS exposes)
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

  // Selection summary for the launch footer.
  const launchScope = (() => {
    const level = LAUNCH_LEVELS.find((l) => l.value === launchLevel)?.label ?? '';
    const accountSummary =
      selectedAccounts.length === 0
        ? `all ${projectAccounts.length} accounts`
        : `${selectedAccounts.length} of ${projectAccounts.length} accounts`;
    return `${level} · ${accountSummary}`;
  })();

  return (
    <div className="space-y-12">
      {/* Back link — quiet, editorial */}
      <Link
        to="/agents"
        className="inline-flex items-center gap-1.5 text-[12.5px] font-medium tracking-tight text-ppc-neutral-500 transition-colors hover:text-ppc-purple-500"
      >
        <ArrowLeft size={13} weight="bold" /> All agents
      </Link>

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_440px]">
        {/* ═══════════════════════════════════════════════════════════════
            LEFT — editorial column
            ═══════════════════════════════════════════════════════════════ */}
        <div className="space-y-16 min-w-0">

          {/* HERO ───────────────────────────────────────────────────── */}
          <section>
            {/* Eyebrow: ordinal + category + agent name */}
            <div className="flex items-center gap-3 font-mono text-[11.5px] font-semibold uppercase tracking-[0.16em] text-ppc-neutral-500">
              <span className="tabular text-ppc-purple-500">00{Math.min(AGENTS.findIndex((a) => a.slug === agent.slug) + 1, 99)}</span>
              <span className="h-px w-7 bg-ppc-neutral-200" />
              <span>{categoryLabel} agent</span>
            </div>

            {/* Agent identity row — emoji tile + name */}
            <div className="mt-7 flex items-center gap-3.5">
              <span
                className="grid h-11 w-11 place-items-center rounded-2xl border border-ppc-neutral-100 bg-white text-[22px] leading-none shadow-ppc-sm"
                aria-hidden
              >
                {agent.emoji}
              </span>
              <div className="font-display text-[18px] font-semibold tracking-tight text-ppc-black">
                {agent.name}
              </div>
            </div>

            {/* Display H1 with purple period */}
            <h1 className="mt-7 max-w-[760px] font-display text-[58px] font-extrabold leading-[0.95] tracking-[-0.035em] text-ppc-black sm:text-[68px]">
              {headlineBody}
              <span className="text-ppc-purple-500">.</span>
            </h1>

            {/* Lede */}
            <p className="mt-7 max-w-[640px] text-[18px] leading-[1.55] tracking-tight text-ppc-neutral-700">
              {agent.outcomeDescription}
            </p>

            {/* Quiet meta row — TIME + APPROVAL cues, never $ */}
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11.5px] uppercase tracking-[0.12em] text-ppc-neutral-500">
              <span className="inline-flex items-center gap-1.5">
                <Clock size={13} weight="duotone" className="text-ppc-purple-500" />
                <span className="tabular">{agent.expectedDuration}</span>
                <span className="text-ppc-neutral-400">· background</span>
              </span>
              <span className="h-3 w-px bg-ppc-neutral-200" />
              <span className="inline-flex items-center gap-1.5">
                <EnvelopeSimple size={13} weight="duotone" className="text-ppc-purple-500" />
                Email when ready
              </span>
              <span className="h-3 w-px bg-ppc-neutral-200" />
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck size={13} weight="duotone" className="text-ppc-purple-500" />
                Client-ready output
              </span>
            </div>
          </section>

          {/* SHEEN — quiet section divider */}
          <hr className="ppc-sheen" />

          {/* STEW BUILT THIS ────────────────────────────────────────── */}
          <section>
            <div className="font-mono text-[11.5px] font-semibold uppercase tracking-[0.16em] text-ppc-neutral-500">
              Built by
            </div>
            <div className="mt-5 flex items-start gap-5">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-ppc-purple-300 to-ppc-purple-600 text-[28px] leading-none shadow-[0_8px_22px_-8px_rgba(128,87,255,0.55),inset_0_1px_0_rgba(255,255,255,0.35)]">
                <span aria-hidden>👨</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13.5px] font-semibold tracking-tight text-ppc-black">
                  Stew Dunlop{' '}
                  <span className="font-normal text-ppc-neutral-500">/ Founder, PPC.io</span>
                </div>
                <p className="mt-3 max-w-[640px] text-[16px] leading-[1.62] tracking-tight text-ppc-neutral-700">
                  After scaling an agency to 100+ client accounts with a team of 50, I saw the same thing every agency owner sees: the gap between <em className="font-serif italic text-ppc-purple-600">&ldquo;we know what to do&rdquo;</em> and <em className="font-serif italic text-ppc-purple-600">&ldquo;we have time to do it for every single account&rdquo;</em> gets wider every month. This agent closes that gap.
                </p>
              </div>
            </div>
          </section>

          {/* HOW THIS AGENT THINKS — DARK EDITORIAL BLOCK ──────────── */}
          <section
            className="relative overflow-hidden rounded-3xl bg-ppc-black px-10 py-12 text-white shadow-[0_30px_80px_-40px_rgba(12,12,14,0.55),inset_0_1px_0_rgba(255,255,255,0.04)] sm:px-12 sm:py-14"
            style={{
              backgroundImage:
                'radial-gradient(120% 80% at 20% 0%, rgba(128,87,255,0.12) 0%, transparent 55%)',
            }}
          >
            {/* sheen line at the top */}
            <span className="pointer-events-none absolute left-10 right-10 top-0 h-px bg-grad-sheen" />

            <div className="font-mono text-[11.5px] font-semibold uppercase tracking-[0.16em] text-white/55">
              How this agent thinks
            </div>
            <h2 className="mt-3 max-w-[520px] font-display text-[34px] font-bold leading-[1.04] tracking-[-0.025em] text-white sm:text-[38px]">
              Like a senior strategist, not a script
              <span className="text-ppc-purple-400">.</span>
            </h2>
            <p className="mt-4 max-w-[520px] text-[15px] leading-[1.6] tracking-tight text-white/65">
              Three reasoning beats, in order. You can audit every tool call, every source, every judgment after it runs.
            </p>

            {/* The three beats — generous editorial slats */}
            <ol className="mt-10 space-y-4">
              {[
                { icon: Brain,        step: '01', label: agent.thinkingSteps[0], kicker: 'Context' },
                { icon: Lightning,    step: '02', label: agent.thinkingSteps[1], kicker: 'Alignment' },
                { icon: ChartLineUp,  step: '03', label: agent.thinkingSteps[2], kicker: 'Recommendation' },
              ].map((s, i) => (
                <li
                  key={i}
                  className="flex items-center gap-5 rounded-2xl border border-white/10 bg-white/[0.035] px-6 py-5 sm:gap-6 sm:px-7"
                >
                  <div className="tabular font-mono text-[12px] font-semibold tracking-[0.06em] text-ppc-purple-400">
                    {s.step}
                  </div>
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/10 bg-ppc-purple-500/15 text-ppc-purple-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                    <s.icon size={20} weight="duotone" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.16em] text-white/45">
                      {s.kicker}
                    </div>
                    <div className="mt-1 text-[15.5px] font-medium leading-snug tracking-tight text-white">
                      {s.label}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* WHAT YOU'LL GET BACK ─────────────────────────────────── */}
          <section>
            <div className="font-mono text-[11.5px] font-semibold uppercase tracking-[0.16em] text-ppc-neutral-500">
              What you&rsquo;ll get back
            </div>
            <h2 className="mt-3 max-w-[640px] font-display text-[34px] font-bold leading-[1.05] tracking-[-0.02em] text-ppc-black sm:text-[38px]">
              Client-ready, audit-ready
              <span className="text-ppc-purple-500">.</span>
            </h2>
            <p className="mt-4 max-w-[600px] text-[16px] leading-[1.6] tracking-tight text-ppc-neutral-600">
              The output is the deliverable. Not raw data, not a model dump. Hand it straight to the meeting.
            </p>

            <ul className="mt-10 space-y-5">
              {([
                {
                  icon: Clock,
                  title: <>A <span className="tabular font-semibold text-ppc-black">{agent.expectedDuration}</span> background run</>,
                  body: "Runs while you do other work. Email when it's done.",
                },
                {
                  icon: ChartLineUp,
                  title: <>Prioritized findings with <span className="font-semibold text-ppc-black">reasoning + impact</span></>,
                  body: 'Every recommendation backed by data + a confidence read. Nothing vibes-based.',
                },
                {
                  icon: FileText,
                  title: <><span className="font-semibold text-ppc-black">&ldquo;Generate client report&rdquo;</span> path</>,
                  body: 'Output formatted to hand to your client. No copy-paste reshuffle.',
                },
                {
                  icon: ShieldCheck,
                  title: <>Full audit trail of <span className="font-semibold text-ppc-black">defensible methodology</span></>,
                  body: 'Every tool call. Every source. Every AI judgment. Open the receipts.',
                },
              ] as Array<{ icon: typeof Clock; title: React.ReactNode; body: string }>).map((row, i) => (
                <li key={i} className="flex items-start gap-5">
                  <div className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-ppc-neutral-100 bg-white text-ppc-purple-500 shadow-ppc-sm">
                    <row.icon size={18} weight="duotone" />
                  </div>
                  <div className="min-w-0 flex-1 leading-relaxed">
                    <div className="text-[16px] tracking-tight text-ppc-neutral-800">
                      {row.title}
                    </div>
                    <div className="mt-1 text-[14px] leading-relaxed tracking-tight text-ppc-neutral-500">
                      {row.body}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            RIGHT — Configure & launch (sticky)
            ═══════════════════════════════════════════════════════════════ */}
        <aside className="lg:sticky lg:top-10 lg:h-fit">
          <div className="relative overflow-hidden rounded-3xl border border-ppc-neutral-100 bg-white p-8 shadow-ppc-lg">
            {/* sheen along the top edge */}
            <span className="pointer-events-none absolute left-8 right-8 top-0 h-px bg-grad-sheen" />

            <div className="font-mono text-[11.5px] font-semibold uppercase tracking-[0.16em] text-ppc-neutral-500">
              Configure &amp; launch
            </div>
            <div className="mt-3 font-display text-[28px] font-bold leading-[1.05] tracking-[-0.025em] text-ppc-black">
              Pick where this runs<span className="text-ppc-purple-500">.</span>
            </div>

            <div className="mt-8 space-y-6">
              <Field label="Project · client">
                <select
                  value={selectedProject}
                  onChange={(e) => { setSelectedProject(e.target.value); setSelectedAccounts([]); }}
                  className="ppc-select"
                >
                  {PROJECTS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}{p.industry ? ` · ${p.industry}` : ''}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                label="Accounts"
                hint={
                  selectedAccounts.length === 0
                    ? `All ${projectAccounts.length} selected by default`
                    : `${selectedAccounts.length} of ${projectAccounts.length} selected`
                }
              >
                <div className="max-h-48 overflow-y-auto rounded-xl border border-ppc-neutral-100 bg-ppc-neutral-25/40 p-1.5">
                  {projectAccounts.map((acc) => {
                    const checked = selectedAccounts.includes(acc.id);
                    return (
                      <label
                        key={acc.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] transition-colors ${
                          checked ? 'bg-ppc-purple-50/70' : 'hover:bg-white'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleAccount(acc.id)}
                          className="h-4 w-4 accent-ppc-purple-500"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium tracking-tight text-ppc-black">
                            {acc.name}
                          </div>
                          <div className="tabular font-mono text-[10.5px] tracking-tight text-ppc-neutral-400">
                            {acc.customerId}
                          </div>
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
                      className={`group rounded-xl border px-3.5 py-3 text-left transition-all ${
                        launchLevel === l.value
                          ? 'border-ppc-purple-500 bg-ppc-purple-50/80 shadow-[inset_0_0_0_1px_rgba(128,87,255,0.25)]'
                          : 'border-ppc-neutral-100 bg-white hover:border-ppc-purple-300'
                      }`}
                    >
                      <div className="text-[13px] font-semibold tracking-tight text-ppc-black">
                        {l.label}
                      </div>
                      <div className="mt-0.5 text-[11.5px] leading-snug tracking-tight text-ppc-neutral-500">
                        {l.sub}
                      </div>
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

              <Field
                label="Steer the agent"
                hint="Optional · one sentence is plenty"
              >
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
                  {RUN_MODES.map(([v, label, sub]) => {
                    const active = runMode === v;
                    return (
                      <button
                        key={v}
                        onClick={() => setRunMode(v)}
                        className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-all ${
                          active
                            ? 'border-ppc-purple-500 bg-ppc-purple-50/80'
                            : 'border-ppc-neutral-100 bg-white hover:border-ppc-purple-300'
                        }`}
                      >
                        <span
                          className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border-2 ${
                            active ? 'border-ppc-purple-500 bg-ppc-purple-500' : 'border-ppc-neutral-300 bg-white'
                          }`}
                        >
                          {active && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[13px] font-semibold tracking-tight text-ppc-black">
                            {label}
                          </span>
                          <span className="block text-[11.5px] tracking-tight text-ppc-neutral-500">
                            {sub}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Field>
            </div>

            {/* Launch — the marquee moment */}
            <div className="mt-9 border-t border-ppc-neutral-100 pt-6">
              <div className="flex justify-center">
                <PrimaryCTA size="lg" onClick={handleLaunch}>
                  <Sparkle size={17} weight="fill" />
                  Launch agent
                  <ArrowRight size={16} weight="bold" />
                </PrimaryCTA>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ppc-neutral-500">
                <span className="inline-flex items-center gap-1.5">
                  <Clock size={11} weight="duotone" className="text-ppc-purple-500" />
                  <span className="tabular">{agent.expectedDuration}</span>
                </span>
                <span className="h-2.5 w-px bg-ppc-neutral-200" />
                <span>{launchScope}</span>
              </div>

              <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-ppc-neutral-400">
                <CheckCircle size={11} weight="duotone" />
                Runs in background · email when ready
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ppc-neutral-500">
          {label}
        </div>
        {hint && (
          <div className="text-[11px] tracking-tight text-ppc-neutral-400">
            {hint}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

function HealthDot({ health }: { health: 'good' | 'warning' | 'attention' }) {
  const { bg, ring } = {
    good:      { bg: 'bg-ppc-success', ring: 'ring-ppc-success/20' },
    warning:   { bg: 'bg-ppc-warning', ring: 'ring-ppc-warning/20' },
    attention: { bg: 'bg-ppc-error',   ring: 'ring-ppc-error/20' },
  }[health];
  return <span className={`h-2 w-2 shrink-0 rounded-full ring-4 ${bg} ${ring}`} />;
}
