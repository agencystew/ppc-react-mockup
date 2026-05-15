import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  CaretRight, CaretDown, ArrowRight, Clock, Sparkle,
  MapTrifold, Path, Flag, Check, ShieldCheck, EnvelopeSimple,
  PaperPlaneTilt,
} from '@phosphor-icons/react';
import { AGENTS } from '../mock/agents';
import { PROJECTS, ACCOUNTS, CURRENT_PROJECT_ID } from '../mock/projects';
import { SpyMascot } from '../components/SpyMascot';
import type { LaunchLevel, AgentDefinition } from '../types/agent';

// Agent Detail · /agents/:slug
//
// The agent's "front of house" — same world as the completed report
// (/reports/:runId): breadcrumb, big bold title, dark hero card with a
// signature mascot (the SAME spy that runs the report — continuity is
// the point), and clean white cards underneath.
//
// Hard rules: TIME + APPROVAL cues only. NEVER pre-run $ figures.

const LAUNCH_LEVELS: Array<{ value: LaunchLevel; label: string; sub: string }> = [
  { value: 'account',  label: 'Account-wide', sub: 'Selected accounts' },
  { value: 'project',  label: 'Project',      sub: 'This client only' },
  { value: 'campaign', label: 'Campaign',     sub: 'Specific campaigns' },
  { value: 'adgroup',  label: 'Ad group',     sub: 'Narrowest scope' },
];

type RunMode = 'once' | 'recurring' | 'schedule-only' | 'custom';
const RUN_MODES: Array<{ value: RunMode; label: string; sub: string }> = [
  { value: 'once',          label: 'Run once now',       sub: 'Single launch, this run only' },
  { value: 'recurring',     label: 'Run now + schedule', sub: 'Run today, then on a cadence' },
  { value: 'schedule-only', label: 'Schedule only',      sub: 'Queue for a future run' },
  { value: 'custom',        label: 'Custom cron',        sub: 'Power-user cadence' },
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
    return <NotFound />;
  }

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
    <div className="font-sans text-ppc-ink">
      <Breadcrumbs trail={['Agents', agent.name]} />
      <TitleRow agent={agent} />
      <HeroCard agent={agent} onLaunch={handleLaunch} />
      <BuiltBy />
      <HowItThinks steps={agent.thinkingSteps} />
      <WhatYouGet expectedDuration={agent.expectedDuration} />
      <ConfigurePanel
        agent={agent}
        selectedProject={selectedProject}
        setSelectedProject={(id) => { setSelectedProject(id); setSelectedAccounts([]); }}
        projectAccounts={projectAccounts}
        selectedAccounts={selectedAccounts}
        toggleAccount={toggleAccount}
        launchLevel={launchLevel}
        setLaunchLevel={setLaunchLevel}
        runMode={runMode}
        setRunMode={setRunMode}
        steer={steer}
        setSteer={setSteer}
        dateRange={dateRange}
        setDateRange={setDateRange}
        onLaunch={handleLaunch}
      />
    </div>
  );
}

function NotFound() {
  return (
    <div className="rounded-2xl border border-ppc-neutral-100 bg-white p-12 text-center">
      <div className="font-display text-[24px] font-bold tracking-tight">Agent not found.</div>
      <Link to="/agents" className="mt-3 inline-flex items-center gap-1 text-ppc-purple-500 hover:underline">
        Back to library
      </Link>
    </div>
  );
}

// ─── Breadcrumb ──────────────────────────────────────────────────────────

function Breadcrumbs({ trail }: { trail: string[] }) {
  return (
    <nav className="mb-4 flex flex-wrap items-center gap-[6px] text-[13px] text-ppc-text-muted">
      <Link to="/agents" className="transition-colors hover:text-ppc-ink">
        {trail[0]}
      </Link>
      <CaretRight size={10} weight="bold" className="text-ppc-text-faint" />
      <span className="font-medium text-ppc-ink">{trail[1]}</span>
    </nav>
  );
}

// ─── Title row ───────────────────────────────────────────────────────────

const CATEGORY_LABEL: Record<string, string> = {
  operations:  'Operations',
  creative:    'Creative',
  strategic:   'Strategic',
  buyer:       'Buyer',
  diagnostics: 'Diagnostics',
  client:      'Client',
  context:     'Context',
};

function TitleRow({ agent }: { agent: AgentDefinition }) {
  return (
    <div className="mb-7 flex flex-wrap items-center gap-3">
      <h1 className="font-display text-[40px] font-extrabold leading-none tracking-[-0.025em] text-ppc-ink">
        {agent.name}
      </h1>
      <CategoryChip label={CATEGORY_LABEL[agent.category] ?? agent.category} />
    </div>
  );
}

function CategoryChip({ label }: { label: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-[11px] py-[5px] text-[12px] font-semibold"
      style={{
        background: '#EFEAFB',
        color: '#534AB7',
        boxShadow: 'inset 0 0 0 1px rgba(83,74,183,0.18)',
      }}
    >
      {label}
    </span>
  );
}

// ─── Dark hero card with mascot + launch button ──────────────────────────

function HeroCard({
  agent,
  onLaunch,
}: {
  agent: AgentDefinition;
  onLaunch: () => void;
}) {
  const hasPeriod = agent.headline.endsWith('.');
  const body = hasPeriod ? agent.headline.slice(0, -1) : agent.headline;

  return (
    <section
      className="relative mb-12 overflow-hidden rounded-[20px] text-white"
      style={{
        background:
          'radial-gradient(120% 90% at 88% -10%, #1B0F39 0%, #0A0814 55%, #050310 100%)',
        boxShadow:
          '0 1px 0 rgba(255,255,255,0.04) inset, 0 30px 60px -30px rgba(15,10,30,0.55)',
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-[460px] w-[460px] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(127,90,240,0.30) 0%, rgba(127,90,240,0.10) 35%, transparent 65%)',
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-24 left-[8%] h-[280px] w-[280px] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(127,90,240,0.10) 0%, transparent 65%)',
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'radial-gradient(rgba(255,255,255,0.55) 1px, transparent 1px)',
          backgroundSize: '3px 3px',
          mixBlendMode: 'screen',
        }}
      />

      <div className="relative grid gap-8 px-10 py-11 sm:grid-cols-[1fr_minmax(220px,300px)] sm:gap-12 sm:px-12 sm:py-14">
        {/* Copy column */}
        <div className="min-w-0">
          <h2 className="font-display text-[44px] font-extrabold leading-[1.04] tracking-[-0.025em] text-white sm:text-[52px]">
            {body}
            {hasPeriod && <span style={{ color: '#9F86FF' }}>.</span>}
          </h2>
          <p className="mt-5 max-w-[560px] text-[15.5px] leading-[1.6] text-white/65">
            {agent.outcomeDescription}
          </p>

          <HeroMeta expectedDuration={agent.expectedDuration} />

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onLaunch}
              className="group inline-flex items-center gap-2 rounded-[10px] px-[20px] py-[14px] text-[14.5px] font-semibold text-white transition-transform hover:-translate-y-[0.5px]"
              style={{
                background: 'linear-gradient(180deg, #8767F3 0%, #6A45E2 100%)',
                boxShadow:
                  '0 1px 0 rgba(255,255,255,0.18) inset, 0 8px 20px -6px rgba(127,90,240,0.65)',
              }}
            >
              <Sparkle size={15} weight="fill" />
              Launch agent
              <ArrowRight
                size={14}
                weight="bold"
                className="transition-transform group-hover:translate-x-[2px]"
              />
            </button>

            <a
              href="#configure"
              className="inline-flex items-center gap-2 rounded-[10px] border border-white/[0.12] bg-white/[0.04] px-[18px] py-[12px] text-[13.5px] font-medium text-white/85 transition-colors hover:bg-white/[0.08] hover:text-white"
            >
              Configure options
              <CaretDown size={11} weight="bold" />
            </a>
          </div>
        </div>

        {/* Mascot column */}
        <div className="relative flex items-end justify-end sm:items-center">
          <SpyMascot />
        </div>
      </div>
    </section>
  );
}

function HeroMeta({ expectedDuration }: { expectedDuration: string }) {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-2.5">
      <MetaPill icon={<Clock size={13} weight="bold" />}>
        <span className="tabular-nums">{expectedDuration}</span> background run
      </MetaPill>
      <MetaPill icon={<EnvelopeSimple size={13} weight="bold" />}>
        Email when ready
      </MetaPill>
      <MetaPill icon={<ShieldCheck size={13} weight="bold" />}>
        Client-ready output
      </MetaPill>
    </div>
  );
}

function MetaPill({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span
      className="inline-flex items-center gap-[7px] rounded-full px-[11px] py-[6px] text-[12.5px] font-medium text-white/80"
      style={{
        background: 'rgba(255,255,255,0.04)',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
      }}
    >
      <span className="text-white/75">{icon}</span>
      {children}
    </span>
  );
}

// ─── Built by Stew ───────────────────────────────────────────────────────

function BuiltBy() {
  return (
    <section className="mb-12 flex flex-wrap items-start gap-5">
      <span
        className="grid h-[54px] w-[54px] shrink-0 place-items-center overflow-hidden rounded-full text-[18px] font-bold text-white"
        style={{
          background: 'linear-gradient(135deg, #C7B0FF 0%, #7F5AF0 60%, #5A3FE0 100%)',
          boxShadow:
            '0 0 0 4px #ECEAFA, 0 0 0 5px rgba(127,90,240,0.30), 0 8px 18px -8px rgba(127,90,240,0.45)',
        }}
        aria-hidden
      >
        SD
      </span>
      <div className="min-w-0 max-w-[640px]">
        <p className="text-[13px] font-mono uppercase tracking-[0.12em] text-ppc-text-muted">
          Built by Stew
          <span className="ml-2 normal-case tracking-normal text-ppc-text-faint">
            Founder, PPC.io
          </span>
        </p>
        <p className="mt-2 text-[15px] leading-[1.65] text-ppc-ink/80">
          After scaling an agency to 100+ accounts with a team of 50, I saw the same
          gap every operator sees: <span className="font-semibold text-ppc-ink">we know what to do</span> and
          {' '}<span className="font-semibold text-ppc-ink">we have time to do it for every account</span> grow
          further apart every month. This agent closes that gap.
        </p>
      </div>
    </section>
  );
}

// ─── How this agent thinks ───────────────────────────────────────────────

const THINKING_KICKERS = ['Context', 'Alignment', 'Recommendation'];
const THINKING_ICONS = [MapTrifold, Path, Flag];

function HowItThinks({ steps }: { steps: [string, string, string] }) {
  return (
    <section className="mb-12">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-display text-[28px] font-extrabold leading-[1.05] tracking-[-0.02em] text-ppc-ink">
            How this agent thinks<span style={{ color: '#7F5AF0' }}>.</span>
          </h3>
          <p className="mt-2 text-[14px] text-ppc-text-muted">
            Three moves, in order. A senior strategist on tap.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {steps.map((label, i) => (
          <ThinkingCard
            key={i}
            index={i + 1}
            kicker={THINKING_KICKERS[i]}
            label={label}
            Icon={THINKING_ICONS[i]}
          />
        ))}
      </div>
    </section>
  );
}

function ThinkingCard({
  index,
  kicker,
  label,
  Icon,
}: {
  index: number;
  kicker: string;
  label: string;
  Icon: typeof MapTrifold;
}) {
  return (
    <div
      className="group relative flex flex-col gap-5 overflow-hidden rounded-[16px] bg-white px-6 pb-6 pt-7 transition-transform hover:-translate-y-[2px]"
      style={{
        boxShadow:
          '0 0 0 1px #e7e2ef, 0 1px 0 rgba(15,10,30,0.02), 0 18px 32px -24px rgba(15,10,30,0.12)',
      }}
    >
      {/* Step number top-right, large, faint */}
      <span
        aria-hidden
        className="pointer-events-none absolute right-5 top-3 font-display text-[60px] font-extrabold leading-none tracking-[-0.04em]"
        style={{ color: 'rgba(127,90,240,0.08)' }}
      >
        0{index}
      </span>

      <div className="flex items-center gap-3">
        <span
          className="grid h-[42px] w-[42px] place-items-center rounded-[10px]"
          style={{
            background: 'linear-gradient(155deg, #A88CFF 0%, #7F5AF0 60%, #5A3FE0 100%)',
            boxShadow:
              '0 1px 0 rgba(255,255,255,0.35) inset, 0 6px 14px -6px rgba(127,90,240,0.45)',
          }}
        >
          <Icon size={20} weight="bold" className="text-white" />
        </span>
        <p
          className="font-mono text-[11px] font-bold uppercase tracking-[0.14em]"
          style={{ color: '#7C45CB' }}
        >
          {kicker}
        </p>
      </div>

      <p className="text-[15.5px] font-semibold leading-[1.4] tracking-[-0.005em] text-ppc-ink">
        {label}
      </p>
    </div>
  );
}

// ─── What you walk away with ─────────────────────────────────────────────

interface Deliverable {
  title: string;
  sub: string;
}

function WhatYouGet({ expectedDuration }: { expectedDuration: string }) {
  const items: Deliverable[] = [
    {
      title: `${expectedDuration} background run`,
      sub: "You get an email when it's ready. No watching a loader.",
    },
    {
      title: 'Prioritized findings with impact',
      sub: 'Every finding is ranked, reasoned, and sized.',
    },
    {
      title: 'Client-ready report',
      sub: 'Hand it over as-is. No re-editing required.',
    },
    {
      title: 'Full audit trail',
      sub: 'Every tool call, every source, every judgment.',
    },
  ];

  return (
    <section
      className="relative mb-12 overflow-hidden rounded-[16px] px-7 py-7"
      style={{
        background: '#F2EEFB',
        boxShadow: 'inset 0 0 0 1px #e1d8f0',
      }}
    >
      <div className="mb-5 flex items-center gap-3">
        <span
          className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-[12px]"
          style={{
            background: 'linear-gradient(155deg, #C9B5FF 0%, #8B6CF5 60%, #5A3FE0 100%)',
            boxShadow:
              '0 1px 0 rgba(255,255,255,0.35) inset, 0 6px 14px -6px rgba(127,90,240,0.45)',
          }}
        >
          <PaperPlaneTilt size={20} weight="fill" className="text-white" />
        </span>
        <div>
          <h3 className="text-[18px] font-semibold tracking-[-0.01em] text-ppc-ink">
            What you walk away with
          </h3>
          <p className="mt-[2px] text-[13px] text-ppc-text-muted">
            What lands in your inbox. Every time.
          </p>
        </div>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((it, i) => (
          <li
            key={i}
            className="flex items-start gap-3 rounded-[12px] bg-white px-5 py-4"
            style={{ boxShadow: 'inset 0 0 0 1px #ece6f3' }}
          >
            <span
              className="mt-[2px] grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full"
              style={{
                background: 'linear-gradient(155deg, #6FE0AC 0%, #3FB985 100%)',
                boxShadow:
                  '0 1px 0 rgba(255,255,255,0.45) inset, 0 3px 8px -4px rgba(63,185,133,0.45)',
              }}
            >
              <Check size={12} weight="bold" className="text-white" />
            </span>
            <div className="min-w-0">
              <p className="text-[14px] font-semibold tracking-[-0.005em] text-ppc-ink">
                {it.title}
              </p>
              <p className="mt-1 text-[12.5px] leading-[1.55] text-ppc-text-muted">
                {it.sub}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ─── Configure & launch (inline section, no longer sticky right rail) ────

interface ConfigureProps {
  agent: AgentDefinition;
  selectedProject: string;
  setSelectedProject: (id: string) => void;
  projectAccounts: typeof ACCOUNTS;
  selectedAccounts: string[];
  toggleAccount: (id: string) => void;
  launchLevel: LaunchLevel;
  setLaunchLevel: (l: LaunchLevel) => void;
  runMode: RunMode;
  setRunMode: (m: RunMode) => void;
  steer: string;
  setSteer: (s: string) => void;
  dateRange: string;
  setDateRange: (s: string) => void;
  onLaunch: () => void;
}

function ConfigurePanel(props: ConfigureProps) {
  const {
    agent, selectedProject, setSelectedProject, projectAccounts,
    selectedAccounts, toggleAccount, launchLevel, setLaunchLevel,
    runMode, setRunMode, steer, setSteer, dateRange, setDateRange,
    onLaunch,
  } = props;

  const project = PROJECTS.find((p) => p.id === selectedProject);
  const accountSummary =
    selectedAccounts.length === 0
      ? `All ${projectAccounts.length} accounts`
      : `${selectedAccounts.length} of ${projectAccounts.length} accounts`;

  return (
    <section
      id="configure"
      className="mb-8 rounded-[20px] bg-white px-8 pb-8 pt-8 sm:px-10 sm:pb-10"
      style={{
        boxShadow:
          '0 0 0 1px #e7e2ef, 0 1px 0 rgba(15,10,30,0.02), 0 18px 32px -24px rgba(15,10,30,0.12)',
      }}
    >
      <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-display text-[28px] font-extrabold leading-[1.05] tracking-[-0.02em] text-ppc-ink">
            Configure &amp; launch<span style={{ color: '#7F5AF0' }}>.</span>
          </h3>
          <p className="mt-2 text-[14px] text-ppc-text-muted">
            Defaults are tuned. Override only what you want different.
          </p>
        </div>
        <div className="hidden items-center gap-2 text-[12.5px] text-ppc-text-muted sm:flex">
          <Clock size={13} weight="bold" className="text-ppc-text-faint" />
          <span className="tabular-nums">{agent.expectedDuration}</span>
          <span className="text-ppc-text-faint">·</span>
          background run
        </div>
      </div>

      {/* Row 1 — Project + Date range */}
      <div className="grid gap-5 sm:grid-cols-2">
        <FieldBlock label="Project (client)" hint={project?.industry}>
          <SelectControl
            value={selectedProject}
            onChange={setSelectedProject}
            options={PROJECTS.map((p) => ({ value: p.id, label: p.name }))}
          />
        </FieldBlock>
        <FieldBlock label="Date range">
          <SelectControl
            value={dateRange}
            onChange={setDateRange}
            options={[
              { value: 'last_7d',     label: 'Last 7 days' },
              { value: 'last_30d',    label: 'Last 30 days' },
              { value: 'last_90d',    label: 'Last 90 days' },
              { value: 'this_month',  label: 'This month so far' },
              { value: 'last_month',  label: 'Last month' },
            ]}
          />
        </FieldBlock>
      </div>

      {/* Row 2 — Accounts */}
      <FieldBlock
        className="mt-5"
        label="Accounts"
        hint={accountSummary}
      >
        <div className="flex flex-wrap gap-2">
          {projectAccounts.map((acc) => {
            const checked = selectedAccounts.includes(acc.id);
            return (
              <button
                key={acc.id}
                type="button"
                onClick={() => toggleAccount(acc.id)}
                className={`group inline-flex items-center gap-2.5 rounded-[10px] px-3.5 py-[10px] text-left text-[13px] transition-all ${
                  checked
                    ? 'bg-[#F0EBFA] text-ppc-ink'
                    : 'bg-white text-ppc-ink hover:bg-[#FBF9FD]'
                }`}
                style={{
                  boxShadow: checked
                    ? 'inset 0 0 0 1.5px #7F5AF0'
                    : 'inset 0 0 0 1px #e7e2ef',
                }}
              >
                <span
                  className="grid h-[16px] w-[16px] shrink-0 place-items-center rounded-[4px]"
                  style={{
                    background: checked ? '#7F5AF0' : 'transparent',
                    boxShadow: checked
                      ? 'none'
                      : 'inset 0 0 0 1.5px #c9c1da',
                  }}
                >
                  {checked && <Check size={10} weight="bold" className="text-white" />}
                </span>
                <span className="flex flex-col leading-tight">
                  <span className="font-semibold tracking-[-0.005em]">{acc.name}</span>
                  <span className="mt-[2px] font-mono text-[10.5px] text-ppc-text-faint">
                    {acc.customerId}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </FieldBlock>

      {/* Row 3 — Launch level */}
      <FieldBlock className="mt-5" label="Launch level">
        <div className="grid gap-2 sm:grid-cols-4">
          {LAUNCH_LEVELS.map((l) => {
            const active = l.value === launchLevel;
            return (
              <button
                key={l.value}
                type="button"
                onClick={() => setLaunchLevel(l.value)}
                className={`rounded-[12px] px-4 py-[10px] text-left transition-colors ${
                  active ? 'bg-[#F0EBFA]' : 'bg-white hover:bg-[#FBF9FD]'
                }`}
                style={{
                  boxShadow: active
                    ? 'inset 0 0 0 1.5px #7F5AF0'
                    : 'inset 0 0 0 1px #e7e2ef',
                }}
              >
                <span className="block text-[13px] font-semibold text-ppc-ink">
                  {l.label}
                </span>
                <span className="mt-[3px] block text-[11.5px] text-ppc-text-muted">
                  {l.sub}
                </span>
              </button>
            );
          })}
        </div>
      </FieldBlock>

      {/* Row 4 — Steer */}
      <FieldBlock className="mt-5" label="Steer the agent" hint="Optional">
        <textarea
          value={steer}
          onChange={(e) => setSteer(e.target.value)}
          rows={2}
          placeholder='e.g. "focus on settlement positioning, ignore brand terms"'
          className="w-full resize-y rounded-[12px] border-none bg-white px-4 py-3 text-[13.5px] text-ppc-ink outline-none placeholder:text-ppc-text-faint focus:bg-[#FBF9FD]"
          style={{ boxShadow: 'inset 0 0 0 1px #e7e2ef' }}
        />
      </FieldBlock>

      {/* Row 5 — Run mode */}
      <FieldBlock className="mt-5" label="Run mode">
        <div className="grid gap-2 sm:grid-cols-2">
          {RUN_MODES.map((m) => {
            const active = m.value === runMode;
            return (
              <button
                key={m.value}
                type="button"
                onClick={() => setRunMode(m.value)}
                className={`flex items-center gap-3 rounded-[12px] px-4 py-[11px] text-left transition-colors ${
                  active ? 'bg-[#F0EBFA]' : 'bg-white hover:bg-[#FBF9FD]'
                }`}
                style={{
                  boxShadow: active
                    ? 'inset 0 0 0 1.5px #7F5AF0'
                    : 'inset 0 0 0 1px #e7e2ef',
                }}
              >
                <span
                  className="grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full"
                  style={{
                    boxShadow: active
                      ? 'inset 0 0 0 1.5px #7F5AF0'
                      : 'inset 0 0 0 1.5px #c9c1da',
                  }}
                >
                  {active && (
                    <span
                      className="h-[8px] w-[8px] rounded-full"
                      style={{ background: '#7F5AF0' }}
                    />
                  )}
                </span>
                <span className="flex flex-col leading-tight">
                  <span className="text-[13px] font-semibold text-ppc-ink">
                    {m.label}
                  </span>
                  <span className="mt-[2px] text-[11.5px] text-ppc-text-muted">
                    {m.sub}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </FieldBlock>

      {/* Launch CTA */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[#efeaf4] pt-7">
        <div className="text-[12.5px] text-ppc-text-muted">
          <Clock size={12} weight="bold" className="mr-1 inline-block text-ppc-text-faint" />
          <span className="tabular-nums">{agent.expectedDuration}</span> background run.
          We email you when it's ready.
        </div>
        <button
          type="button"
          onClick={onLaunch}
          className="group inline-flex items-center gap-2 rounded-[12px] px-[24px] py-[14px] text-[15px] font-semibold text-white transition-transform hover:-translate-y-[0.5px]"
          style={{
            background: 'linear-gradient(180deg, #8767F3 0%, #6A45E2 100%)',
            boxShadow:
              '0 1px 0 rgba(255,255,255,0.18) inset, 0 10px 22px -8px rgba(127,90,240,0.55)',
          }}
        >
          <Sparkle size={15} weight="fill" />
          Launch agent
          <ArrowRight
            size={14}
            weight="bold"
            className="transition-transform group-hover:translate-x-[2px]"
          />
        </button>
      </div>
    </section>
  );
}

function FieldBlock({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <p className="text-[12.5px] font-semibold tracking-[-0.005em] text-ppc-ink">
          {label}
        </p>
        {hint && (
          <p className="text-[11.5px] text-ppc-text-muted">{hint}</p>
        )}
      </div>
      {children}
    </div>
  );
}

function SelectControl<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full appearance-none rounded-[12px] bg-white px-4 py-[11px] pr-10 text-[13.5px] font-medium text-ppc-ink outline-none focus:bg-[#FBF9FD]"
        style={{ boxShadow: 'inset 0 0 0 1px #e7e2ef' }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <CaretDown
        size={12}
        weight="bold"
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ppc-text-muted"
      />
    </div>
  );
}
