import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  CaretRight, CaretDown, ArrowRight, Sparkle,
  MapTrifold, Path, Flag, Check, ShieldCheck, EnvelopeSimple,
  PaperPlaneTilt, Coffee, Tag, CurrencyDollar,
} from '@phosphor-icons/react';
import { AGENTS } from '../mock/agents';
import { PROJECTS, ACCOUNTS, CURRENT_PROJECT_ID } from '../mock/projects';
import { SpyMascot } from '../components/SpyMascot';
import type { AgentDefinition } from '../types/agent';

// Agent Detail · /agents/:slug
//
// Same world as the completed report: breadcrumb, big bold title,
// dark hero card with a signature mascot (the SAME spy that runs the
// report — continuity is the point), and clean white cards underneath.
//
// 2-column page layout: editorial LEFT, sticky LAUNCH PANEL RIGHT — the
// right rail is the muscle memory once you've used the app a few times.
//
// Launch panel (post 2026-05-15 Jose feedback):
//   - Launch level removed — implicit by Project + Campaigns
//   - Accounts → Campaigns (with type tags + monthly spend)
//   - Ad group toggle expands the form with ad groups under selected campaigns
//   - Custom cron removed (same as Schedule only)
//
// Hard rules: TIME + APPROVAL cues only. NEVER pre-run $ figures in left rail.

// ─── Campaigns + ad groups mock (per project) ────────────────────────────

interface MockCampaign {
  id: string;
  name: string;
  type: 'SEARCH' | 'PMAX' | 'SHOPPING' | 'DISPLAY';
  labels?: string[];
  monthlySpend: number;
}

interface MockAdGroup {
  id: string;
  campaignId: string;
  name: string;
  monthlySpend: number;
}

const CAMPAIGNS_BY_PROJECT: Record<string, MockCampaign[]> = {
  'boulder-care': [
    { id: 'c-bc-1', name: 'Brand · Recovery Centers',  type: 'SEARCH', labels: ['Brand', 'Top-perf'], monthlySpend: 4280 },
    { id: 'c-bc-2', name: 'Non-Brand · Drug Rehab',    type: 'SEARCH', labels: ['Non-brand'],         monthlySpend: 8740 },
    { id: 'c-bc-3', name: 'PMax · Treatment Locator',  type: 'PMAX',   labels: ['Test'],              monthlySpend: 2110 },
    { id: 'c-bc-4', name: 'Search · Detox Programs',   type: 'SEARCH', labels: ['Non-brand'],         monthlySpend: 5630 },
    { id: 'c-bc-5', name: 'Display · Family Support',  type: 'DISPLAY',                               monthlySpend: 980 },
  ],
  'the-hoth': [
    { id: 'c-hoth-1', name: 'Brand · HOTH SEO',          type: 'SEARCH', labels: ['Brand'],     monthlySpend: 3120 },
    { id: 'c-hoth-2', name: 'Non-Brand · Link Building', type: 'SEARCH', labels: ['Non-brand'], monthlySpend: 7860 },
    { id: 'c-hoth-3', name: 'PMax · SEO Services',       type: 'PMAX',                          monthlySpend: 4210 },
  ],
  'durable': [
    { id: 'c-dur-1', name: 'Brand · Durable.co',          type: 'SEARCH', labels: ['Brand', 'Top-perf'], monthlySpend: 6120 },
    { id: 'c-dur-2', name: 'Non-Brand · AI Site Builder', type: 'SEARCH', labels: ['Non-brand'],         monthlySpend: 12480 },
    { id: 'c-dur-3', name: 'PMax · SMB Acquisition',      type: 'PMAX',                                  monthlySpend: 8210 },
    { id: 'c-dur-4', name: 'Display · Retargeting',       type: 'DISPLAY',                               monthlySpend: 1640 },
  ],
  'linkbuilder': [
    { id: 'c-lb-1', name: 'Brand · LinkBuilder.io',  type: 'SEARCH', labels: ['Brand'],     monthlySpend: 2210 },
    { id: 'c-lb-2', name: 'Non-Brand · Backlinks',   type: 'SEARCH', labels: ['Non-brand'], monthlySpend: 4580 },
  ],
  'livingyoung': [
    { id: 'c-ly-1', name: 'Brand · LivingYoung Center',  type: 'SEARCH', labels: ['Brand'],     monthlySpend: 1830 },
    { id: 'c-ly-2', name: 'Non-Brand · Med Spa Local',   type: 'SEARCH', labels: ['Non-brand'], monthlySpend: 3260 },
    { id: 'c-ly-3', name: 'PMax · Aesthetic Treatments', type: 'PMAX',                          monthlySpend: 2480 },
  ],
  'authority-builders': [
    { id: 'c-ab-1', name: 'Brand · Authority Builders', type: 'SEARCH', labels: ['Brand'],     monthlySpend: 2680 },
    { id: 'c-ab-2', name: 'Non-Brand · Link Service',   type: 'SEARCH', labels: ['Non-brand'], monthlySpend: 5120 },
  ],
  'edwin-novel': [
    { id: 'c-en-1', name: 'Brand · Edwin Novel',          type: 'SEARCH',   labels: ['Brand'], monthlySpend: 1980 },
    { id: 'c-en-2', name: 'Shopping · Engagement Rings',  type: 'SHOPPING',                    monthlySpend: 6240 },
    { id: 'c-en-3', name: 'PMax · D2C Jewelry',           type: 'PMAX',     labels: ['Test'],  monthlySpend: 4810 },
  ],
  'flock': [
    { id: 'c-fl-1', name: 'Brand · Flock Edinburgh',      type: 'SEARCH', labels: ['Brand'],     monthlySpend: 3420 },
    { id: 'c-fl-2', name: 'Brand · Flock London',         type: 'SEARCH', labels: ['Brand'],     monthlySpend: 4180 },
    { id: 'c-fl-3', name: 'Non-Brand · Travel Booking',   type: 'SEARCH', labels: ['Non-brand'], monthlySpend: 7920 },
    { id: 'c-fl-4', name: 'PMax · Group Travel',          type: 'PMAX',                          monthlySpend: 5680 },
  ],
};

const AD_GROUPS_BY_CAMPAIGN: Record<string, MockAdGroup[]> = {
  'c-bc-1':  [
    { id: 'ag-bc-1a', campaignId: 'c-bc-1', name: 'Brand / Direct',        monthlySpend: 1840 },
    { id: 'ag-bc-1b', campaignId: 'c-bc-1', name: 'Brand / Detox Centers', monthlySpend: 1320 },
    { id: 'ag-bc-1c', campaignId: 'c-bc-1', name: 'Brand / Sober Living',  monthlySpend: 1120 },
  ],
  'c-bc-2':  [
    { id: 'ag-bc-2a', campaignId: 'c-bc-2', name: 'Drug Rehab / Inpatient',    monthlySpend: 3210 },
    { id: 'ag-bc-2b', campaignId: 'c-bc-2', name: 'Drug Rehab / Outpatient',   monthlySpend: 2780 },
    { id: 'ag-bc-2c', campaignId: 'c-bc-2', name: 'Drug Rehab / Insurance',    monthlySpend: 2750 },
  ],
  'c-bc-3':  [
    { id: 'ag-bc-3a', campaignId: 'c-bc-3', name: 'Asset Group · Locator',    monthlySpend: 2110 },
  ],
  'c-bc-4':  [
    { id: 'ag-bc-4a', campaignId: 'c-bc-4', name: 'Detox / Alcohol',  monthlySpend: 2820 },
    { id: 'ag-bc-4b', campaignId: 'c-bc-4', name: 'Detox / Opioid',   monthlySpend: 2810 },
  ],
  'c-dur-2': [
    { id: 'ag-dur-2a', campaignId: 'c-dur-2', name: 'AI Site Builder / Small Biz', monthlySpend: 5240 },
    { id: 'ag-dur-2b', campaignId: 'c-dur-2', name: 'AI Site Builder / Creators',  monthlySpend: 4120 },
    { id: 'ag-dur-2c', campaignId: 'c-dur-2', name: 'AI Site Builder / Agencies',  monthlySpend: 3120 },
  ],
};

const LAUNCH_LEVELS_REMOVED = true; // documentation flag — see header note

type RunMode = 'once' | 'recurring' | 'schedule-only';
const RUN_MODES: Array<{ value: RunMode; label: string; sub: string }> = [
  { value: 'once',          label: 'Run once now',       sub: 'Single launch, this run only' },
  { value: 'recurring',     label: 'Run now + schedule', sub: 'Run today, then on a cadence' },
  { value: 'schedule-only', label: 'Schedule only',      sub: 'Queue for a future run' },
];

export function AgentDetail() {
  void LAUNCH_LEVELS_REMOVED;
  const { slug } = useParams();
  const navigate = useNavigate();
  const agent = AGENTS.find((a) => a.slug === slug);

  const [selectedProject, setSelectedProject] = useState(CURRENT_PROJECT_ID);
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [adGroupMode, setAdGroupMode] = useState(false);
  const [selectedAdGroups, setSelectedAdGroups] = useState<string[]>([]);
  const [runMode, setRunMode] = useState<RunMode>('once');
  const [steer, setSteer] = useState('');
  const [dateRange, setDateRange] = useState('last_30d');

  const projectCampaigns = useMemo(
    () => CAMPAIGNS_BY_PROJECT[selectedProject] ?? [],
    [selectedProject],
  );

  const adGroupsForSelected = useMemo(() => {
    const targetCampaigns = selectedCampaigns.length ? selectedCampaigns : projectCampaigns.map((c) => c.id);
    return targetCampaigns.flatMap((cid) => AD_GROUPS_BY_CAMPAIGN[cid] ?? []);
  }, [selectedCampaigns, projectCampaigns]);

  if (!agent) {
    return <NotFound />;
  }

  const toggleCampaign = (id: string) => {
    setSelectedCampaigns((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
    setSelectedAdGroups((prev) =>
      prev.filter((agId) => {
        const ag = Object.values(AD_GROUPS_BY_CAMPAIGN).flat().find((a) => a.id === agId);
        return ag && ag.campaignId !== id;
      }),
    );
  };

  const toggleAdGroup = (id: string) => {
    setSelectedAdGroups((prev) =>
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

  void ACCOUNTS; // legacy mock kept for other surfaces; not used here

  return (
    <div className="font-sans text-ppc-ink">
      <Breadcrumbs trail={['Agents', agent.name]} />
      <TitleRow agent={agent} />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-start">
        {/* ═══ LEFT — editorial story ═══════════════════════════════════════ */}
        <div className="min-w-0 space-y-12">
          <HeroCard agent={agent} />
          <HowItThinks steps={agent.thinkingSteps} />
          <WhatYouGet />
        </div>

        {/* ═══ RIGHT — sticky launch rail ═══════════════════════════════════ */}
        <aside className="lg:sticky lg:top-8 lg:h-fit">
          <LaunchPanel
            selectedProject={selectedProject}
            setSelectedProject={(id) => {
              setSelectedProject(id);
              setSelectedCampaigns([]);
              setSelectedAdGroups([]);
            }}
            projectCampaigns={projectCampaigns}
            selectedCampaigns={selectedCampaigns}
            toggleCampaign={toggleCampaign}
            adGroupMode={adGroupMode}
            setAdGroupMode={(v) => {
              setAdGroupMode(v);
              if (!v) setSelectedAdGroups([]);
            }}
            adGroupsForSelected={adGroupsForSelected}
            selectedAdGroups={selectedAdGroups}
            toggleAdGroup={toggleAdGroup}
            runMode={runMode}
            setRunMode={setRunMode}
            steer={steer}
            setSteer={setSteer}
            dateRange={dateRange}
            setDateRange={setDateRange}
            onLaunch={handleLaunch}
          />
        </aside>
      </div>
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

// ─── Dark hero card with mascot ──────────────────────────────────────────

function HeroCard({ agent }: { agent: AgentDefinition }) {
  const hasPeriod = agent.headline.endsWith('.');
  const body = hasPeriod ? agent.headline.slice(0, -1) : agent.headline;

  return (
    <section
      className="relative overflow-hidden rounded-[20px] text-white"
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

      <div className="relative grid gap-8 px-9 py-11 sm:grid-cols-[1fr_minmax(180px,240px)] sm:gap-8 sm:px-10 sm:py-12">
        <div className="min-w-0">
          <h2 className="font-display text-[40px] font-extrabold leading-[1.04] tracking-[-0.025em] text-white sm:text-[46px]">
            {body}
            {hasPeriod && <span style={{ color: '#9F86FF' }}>.</span>}
          </h2>
          <p className="mt-5 max-w-[500px] text-[15px] leading-[1.6] text-white/65">
            {agent.outcomeDescription}
          </p>

          <HeroMeta />
        </div>

        <div className="relative flex items-end justify-end sm:items-center">
          <SpyMascot size={220} />
        </div>
      </div>
    </section>
  );
}

function HeroMeta() {
  return (
    <div className="mt-7 flex flex-wrap items-center gap-2.5">
      <MetaPill icon={<Coffee size={13} weight="bold" />}>
        Make a coffee, come back to the report
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

// ─── How this agent thinks ───────────────────────────────────────────────

const THINKING_KICKERS = ['Context', 'Alignment', 'Recommendation'];
const THINKING_ICONS = [MapTrifold, Path, Flag];

function HowItThinks({ steps }: { steps: [string, string, string] }) {
  return (
    <section>
      <div className="mb-6">
        <h3 className="font-display text-[28px] font-extrabold leading-[1.05] tracking-[-0.02em] text-ppc-ink">
          How this agent thinks<span style={{ color: '#7F5AF0' }}>.</span>
        </h3>
        <p className="mt-2 text-[14px] text-ppc-text-muted">
          Three moves, in order. A senior strategist on tap.
        </p>
      </div>

      <div className="relative grid gap-4 sm:grid-cols-3">
        {steps.map((label, i) => (
          <div key={i} className="relative">
            <ThinkingCard
              index={i + 1}
              kicker={THINKING_KICKERS[i]}
              label={label}
              Icon={THINKING_ICONS[i]}
            />
            {i < steps.length - 1 && (
              <span
                aria-hidden
                className="pointer-events-none absolute right-[-22px] top-1/2 hidden -translate-y-1/2 items-center sm:flex"
                style={{ color: '#B6A8DC' }}
              >
                <span
                  className="mr-[3px] h-px w-[10px]"
                  style={{
                    background:
                      'repeating-linear-gradient(to right, currentColor 0, currentColor 2px, transparent 2px, transparent 4px)',
                  }}
                />
                <ArrowRight size={11} weight="bold" />
              </span>
            )}
          </div>
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
      className="group relative flex h-full flex-col gap-5 overflow-hidden rounded-[16px] bg-white px-6 pb-6 pt-7 transition-transform hover:-translate-y-[2px]"
      style={{
        boxShadow:
          '0 0 0 1px #e7e2ef, 0 1px 0 rgba(15,10,30,0.02), 0 18px 32px -24px rgba(15,10,30,0.12)',
      }}
    >
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
// Pixel-matched to Stewart's reference (2026-05-15):
//   2-column layout — DARK editorial card LEFT + LIGHT 2x2 grid RIGHT.

interface Deliverable {
  title: string;
  sub: string;
}

function WhatYouGet() {
  const items: Deliverable[] = [
    {
      title: 'Coffee-break delivery',
      sub: "Runs in the background. We email you when the report's ready.",
    },
    {
      title: 'Prioritized findings with impact',
      sub: 'Every finding is ranked, reasoned, and sized by opportunity.',
    },
    {
      title: 'Client-ready report',
      sub: 'Polished, structured, and branded. Zero re-editing required.',
    },
    {
      title: 'Full audit trail',
      sub: 'Every source, screenshot, and tool call logged for full transparency.',
    },
  ];

  return (
    <section className="grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      {/* LEFT — dark editorial */}
      <div
        className="relative overflow-hidden rounded-[16px] px-7 py-7 text-white"
        style={{
          background:
            'radial-gradient(120% 90% at 88% -10%, #1B0F39 0%, #0A0814 55%, #050310 100%)',
          boxShadow:
            '0 1px 0 rgba(255,255,255,0.04) inset, 0 18px 32px -24px rgba(15,10,30,0.4)',
        }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-[260px] w-[260px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(127,90,240,0.22) 0%, rgba(127,90,240,0.06) 40%, transparent 70%)',
          }}
        />

        <div className="relative flex items-center gap-3">
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
          <div className="min-w-0">
            <h3 className="text-[18px] font-semibold leading-tight tracking-[-0.01em] text-white">
              What you walk away with<span style={{ color: '#9F86FF' }}>.</span>
            </h3>
            <p className="mt-[3px] text-[13px] leading-snug text-white/55">
              What lands in your inbox. Every time.
            </p>
          </div>
        </div>

        <div
          aria-hidden
          className="relative mt-6 h-px w-full"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        />

        <p className="relative mt-5 text-[14px] leading-[1.6] text-white/75">
          We handle the heavy lifting end-to-end&mdash;so you get sharp, client-ready insights without lifting a finger.
        </p>

        <div className="relative mt-7 flex items-center gap-2">
          <Sparkle size={14} weight="fill" style={{ color: '#9F86FF' }} />
          <span
            className="text-[13px] font-semibold tracking-[-0.005em]"
            style={{ color: '#B6A0FF' }}
          >
            Runs while you focus on what matters.
          </span>
        </div>
      </div>

      {/* RIGHT — 2x2 check grid */}
      <div
        className="rounded-[16px] px-6 py-6"
        style={{
          background: '#FFFFFF',
          boxShadow:
            '0 0 0 1px #e7e2ef, 0 1px 0 rgba(15,10,30,0.02), 0 18px 32px -24px rgba(15,10,30,0.12)',
        }}
      >
        <ul className="grid h-full gap-x-6 gap-y-5 sm:grid-cols-2">
          {items.map((it, i) => (
            <li key={i} className="flex items-start gap-3">
              <span
                className="mt-[2px] grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full"
                style={{
                  background: 'linear-gradient(155deg, #A88CFF 0%, #7F5AF0 60%, #5A3FE0 100%)',
                  boxShadow:
                    '0 1px 0 rgba(255,255,255,0.45) inset, 0 3px 8px -4px rgba(127,90,240,0.45)',
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
      </div>
    </section>
  );
}

// ─── Sticky launch panel (right rail) ────────────────────────────────────

interface LaunchPanelProps {
  selectedProject: string;
  setSelectedProject: (id: string) => void;
  projectCampaigns: MockCampaign[];
  selectedCampaigns: string[];
  toggleCampaign: (id: string) => void;
  adGroupMode: boolean;
  setAdGroupMode: (v: boolean) => void;
  adGroupsForSelected: MockAdGroup[];
  selectedAdGroups: string[];
  toggleAdGroup: (id: string) => void;
  runMode: RunMode;
  setRunMode: (m: RunMode) => void;
  steer: string;
  setSteer: (s: string) => void;
  dateRange: string;
  setDateRange: (s: string) => void;
  onLaunch: () => void;
}

function LaunchPanel(props: LaunchPanelProps) {
  const {
    selectedProject, setSelectedProject, projectCampaigns,
    selectedCampaigns, toggleCampaign,
    adGroupMode, setAdGroupMode,
    adGroupsForSelected, selectedAdGroups, toggleAdGroup,
    runMode, setRunMode, steer, setSteer, dateRange, setDateRange,
    onLaunch,
  } = props;

  const campaignSummary =
    selectedCampaigns.length === 0
      ? `All ${projectCampaigns.length}`
      : `${selectedCampaigns.length} of ${projectCampaigns.length}`;

  const adGroupSummary =
    selectedAdGroups.length === 0
      ? `All ${adGroupsForSelected.length}`
      : `${selectedAdGroups.length} of ${adGroupsForSelected.length}`;

  return (
    <div
      className="overflow-hidden rounded-[20px] bg-white"
      style={{
        boxShadow:
          '0 0 0 1px #e7e2ef, 0 1px 0 rgba(15,10,30,0.02), 0 24px 48px -28px rgba(15,10,30,0.16)',
      }}
    >
      <div className="border-b border-[#efeaf4] px-7 pb-5 pt-7">
        <h3 className="font-display text-[22px] font-extrabold leading-[1.05] tracking-[-0.02em] text-ppc-ink">
          Configure &amp; launch<span style={{ color: '#7F5AF0' }}>.</span>
        </h3>
        <p className="mt-1.5 text-[13px] text-ppc-text-muted">
          Defaults are tuned. Override only what you want different.
        </p>
      </div>

      <div className="space-y-6 px-7 py-7">
        <FieldBlock label="Project (client)">
          <SelectControl
            value={selectedProject}
            onChange={setSelectedProject}
            options={PROJECTS.map((p) => ({ value: p.id, label: p.name }))}
          />
        </FieldBlock>

        <FieldBlock label="Campaigns" hint={`${campaignSummary} selected`}>
          <div
            className="max-h-[240px] overflow-y-auto rounded-[12px] bg-white p-1"
            style={{ boxShadow: 'inset 0 0 0 1px #e7e2ef' }}
          >
            {projectCampaigns.map((c) => {
              const checked = selectedCampaigns.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleCampaign(c.id)}
                  className={`flex w-full items-start gap-3 rounded-[8px] px-3 py-[10px] text-left transition-colors ${
                    checked ? 'bg-[#F0EBFA]' : 'hover:bg-[#FBF9FD]'
                  }`}
                >
                  <span
                    className="mt-[3px] grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[5px]"
                    style={{
                      background: checked ? '#7F5AF0' : 'transparent',
                      boxShadow: checked
                        ? 'none'
                        : 'inset 0 0 0 1.5px #c9c1da',
                    }}
                  >
                    {checked && <Check size={11} weight="bold" className="text-white" />}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-[5px] leading-tight">
                    <span className="truncate text-[13.5px] font-semibold text-ppc-ink">
                      {c.name}
                    </span>
                    <span className="flex flex-wrap items-center gap-[6px]">
                      <CampaignTypeChip type={c.type} />
                      {c.labels?.map((label) => (
                        <LabelChip key={label}>{label}</LabelChip>
                      ))}
                      <span className="inline-flex items-center gap-[3px] font-mono text-[10.5px] text-ppc-text-muted">
                        <CurrencyDollar size={9} weight="bold" />
                        {formatSpend(c.monthlySpend)}/mo
                      </span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </FieldBlock>

        {/* Ad group toggle — Jose 2026-05-15 */}
        <FieldBlock label="Target ad groups" hint={adGroupMode ? 'On' : 'Off'}>
          <button
            type="button"
            onClick={() => setAdGroupMode(!adGroupMode)}
            className={`flex w-full items-center justify-between gap-3 rounded-[10px] px-3.5 py-[11px] text-left transition-colors ${
              adGroupMode ? 'bg-[#F0EBFA]' : 'bg-white hover:bg-[#FBF9FD]'
            }`}
            style={{
              boxShadow: adGroupMode
                ? 'inset 0 0 0 1.5px #7F5AF0'
                : 'inset 0 0 0 1px #e7e2ef',
            }}
          >
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="text-[13px] font-semibold text-ppc-ink">
                {adGroupMode ? 'Narrowing to specific ad groups' : 'Use entire campaigns'}
              </span>
              <span className="mt-[2px] text-[11.5px] text-ppc-text-muted">
                {adGroupMode
                  ? 'Pick ad groups inside the selected campaigns'
                  : 'Toggle on to pick specific ad groups'}
              </span>
            </span>
            <ToggleSwitch on={adGroupMode} />
          </button>

          {adGroupMode && (
            <div className="mt-3">
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <p className="text-[11.5px] font-semibold tracking-[-0.005em] text-ppc-ink">
                  Ad groups
                </p>
                <p className="text-[11.5px] text-ppc-text-muted">
                  {adGroupSummary} selected
                </p>
              </div>

              {adGroupsForSelected.length === 0 ? (
                <div
                  className="rounded-[10px] px-3.5 py-3 text-[12px] text-ppc-text-muted"
                  style={{ boxShadow: 'inset 0 0 0 1px #e7e2ef', background: '#FBF9FD' }}
                >
                  Select campaigns above to see their ad groups.
                </div>
              ) : (
                <div
                  className="max-h-[180px] overflow-y-auto rounded-[12px] bg-white p-1"
                  style={{ boxShadow: 'inset 0 0 0 1px #e7e2ef' }}
                >
                  {adGroupsForSelected.map((ag) => {
                    const checked = selectedAdGroups.includes(ag.id);
                    return (
                      <button
                        key={ag.id}
                        type="button"
                        onClick={() => toggleAdGroup(ag.id)}
                        className={`flex w-full items-center gap-3 rounded-[8px] px-3 py-[9px] text-left transition-colors ${
                          checked ? 'bg-[#F0EBFA]' : 'hover:bg-[#FBF9FD]'
                        }`}
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
                        <span className="flex min-w-0 flex-1 items-center justify-between gap-3 leading-tight">
                          <span className="truncate text-[12.5px] font-medium text-ppc-ink">
                            {ag.name}
                          </span>
                          <span className="inline-flex items-center gap-[3px] font-mono text-[10.5px] text-ppc-text-muted">
                            <CurrencyDollar size={9} weight="bold" />
                            {formatSpend(ag.monthlySpend)}/mo
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
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

        <FieldBlock label="Steer the agent" hint="Optional">
          <textarea
            value={steer}
            onChange={(e) => setSteer(e.target.value)}
            rows={3}
            placeholder='e.g. "focus on settlement positioning, ignore brand terms"'
            className="w-full resize-y rounded-[12px] border-none bg-white px-3.5 py-3 text-[13.5px] text-ppc-ink outline-none placeholder:text-ppc-text-faint focus:bg-[#FBF9FD]"
            style={{ boxShadow: 'inset 0 0 0 1px #e7e2ef' }}
          />
        </FieldBlock>

        <FieldBlock label="Run mode">
          <div className="space-y-2">
            {RUN_MODES.map((m) => {
              const active = m.value === runMode;
              return (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setRunMode(m.value)}
                  className={`flex w-full items-center gap-3 rounded-[10px] px-3.5 py-[10px] text-left transition-colors ${
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
      </div>

      <div
        className="border-t border-[#efeaf4] px-7 py-5"
        style={{ background: '#FBF9FD' }}
      >
        <button
          type="button"
          onClick={onLaunch}
          className="group inline-flex w-full items-center justify-center gap-2 rounded-[12px] px-5 py-[14px] text-[15px] font-semibold text-white transition-transform hover:-translate-y-[0.5px]"
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
        <p className="mt-3 flex items-center justify-center gap-1.5 text-[12px] text-ppc-text-muted">
          <Coffee size={12} weight="bold" className="text-ppc-text-faint" />
          Make a coffee. We'll email when the report's ready.
        </p>
      </div>
    </div>
  );
}

function ToggleSwitch({ on }: { on: boolean }) {
  return (
    <span
      className="relative inline-block h-[20px] w-[36px] shrink-0 rounded-full transition-colors"
      style={{
        background: on ? '#7F5AF0' : '#dcd5e9',
        boxShadow: on
          ? '0 1px 0 rgba(255,255,255,0.25) inset, 0 4px 10px -4px rgba(127,90,240,0.45)'
          : 'inset 0 0 0 1px #c9c1da',
      }}
    >
      <span
        className="absolute top-[2px] h-[16px] w-[16px] rounded-full bg-white transition-transform"
        style={{
          transform: on ? 'translateX(18px)' : 'translateX(2px)',
          boxShadow: '0 1px 2px rgba(15,10,30,0.18)',
        }}
      />
    </span>
  );
}

const CAMPAIGN_TYPE_STYLES: Record<MockCampaign['type'], { bg: string; fg: string }> = {
  SEARCH:   { bg: '#E6E0FA', fg: '#534AB7' },
  PMAX:     { bg: '#FDE9D7', fg: '#9C5A1A' },
  SHOPPING: { bg: '#DAF3E5', fg: '#1F7A4F' },
  DISPLAY:  { bg: '#FCE0E4', fg: '#A12A3A' },
};

function CampaignTypeChip({ type }: { type: MockCampaign['type'] }) {
  const s = CAMPAIGN_TYPE_STYLES[type];
  return (
    <span
      className="inline-flex items-center rounded-[4px] px-[5px] py-[1px] font-mono text-[9.5px] font-bold uppercase tracking-[0.06em]"
      style={{ background: s.bg, color: s.fg }}
    >
      {type}
    </span>
  );
}

function LabelChip({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-[3px] rounded-[4px] px-[5px] py-[1px] text-[10px] font-medium"
      style={{
        background: '#F2EEFB',
        color: '#6B6480',
        boxShadow: 'inset 0 0 0 1px #e1d8f0',
      }}
    >
      <Tag size={8} weight="bold" />
      {children}
    </span>
  );
}

function formatSpend(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return `${n}`;
}

function FieldBlock({
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
