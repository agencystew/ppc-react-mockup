import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  CaretRight, CaretDown, ArrowRight, Sparkle, Check,
  Coffee, Tag, CurrencyDollar,
  Clock, CalendarBlank, Minus, Plus,
  // Per-agent hero icons — Phosphor duotone, one per slug.
  ChartLineUp, MagnifyingGlassPlus, Shield, ClockClockwise,
  Drop, TrendUp, PencilLine, Browser, PaintBrushBroad,
  ShoppingCart, Binoculars, Lightning, MagnifyingGlass,
  Compass, MapTrifold, Gauge, ChartBar, Flask,
  FileText, Briefcase, Rocket, ShieldCheck, Books,
  // Expedition-map per-territory icons.
  Funnel, Lock, BatteryLow, ChartLine, ClockCountdown,
  type Icon as PhosphorIcon,
} from '@phosphor-icons/react';
import { AGENTS } from '../mock/agents';
import { PROJECTS, ACCOUNTS, CURRENT_PROJECT_ID } from '../mock/projects';
import type { AgentDefinition, InspectionItem } from '../types/agent';

// One Phosphor icon per agent slug — used in the hero spotlight.
// Add new agents here as they ship.
const SLUG_TO_ICON: Record<string, PhosphorIcon> = {
  'weekly-audit':          ChartLineUp,
  'deep-account-audit':    MagnifyingGlassPlus,
  'negative-keyword':      Shield,
  'budget-pacer':          ClockClockwise,
  'spend-leak':            Drop,
  'profit-tracker':        TrendUp,
  'ad-copy':               PencilLine,
  'landing-page':          Browser,
  'landing-page-designer': PaintBrushBroad,
  'shopping-feed':         ShoppingCart,
  'competitor-spy':        Binoculars,
  'pmax':                  Lightning,
  'keyword':               Books,
  'keyword-auditor':       MagnifyingGlass,
  'campaign-architect':    Compass,
  'buyer-journey':         MapTrifold,
  'readiness':             Gauge,
  'demand-ceiling':        ChartBar,
  'test-recommender':      Flask,
  'client-reporting':      FileText,
  'sales-intelligence':    Briefcase,
  'new-client-autopilot':  Rocket,
  'change-impact':         Lightning,
  'brand-safety':          ShieldCheck,
};

// "Watch it work" reasoning trace per agent slug. Each line names a
// specific check with a real scope (1,284 search terms, 8 LPs, etc.)
// so the depth lands as scale, not a generic claim. Only populated
// agents render the panel — others fall back to nothing.
const LIVE_TRACES: Record<string, string[]> = {
  'weekly-audit': [
    'Reading 1,284 search terms across 6 campaigns',
    'Cross-referencing Quality Scores against last quarter',
    'Detecting lost-impression-share movements over 12 months',
    'Scanning bid cap interference on profitable campaigns',
    'Checking landing-page experience signals on 8 LPs',
    'Comparing this week vs the 4-week converting-intent baseline',
    'Stress-testing ad copy fatigue across 47 keywords',
    'Compiling priority-ranked findings with evidence',
  ],
};

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
//   - Schedule form EXPANDS inline below Run mode when 'recurring' or 'schedule-only'
//     is picked — Daily / Weekly / Monthly each has its own dedicated fields.
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

// ─── Schedule config (expands inline when runMode != 'once') ─────────────
//
// Three dedicated frequency variants per Jose 2026-05-15:
//   Daily   → 'Every N days'   + time + ends
//   Weekly  → 'Every N weeks'  + weekdays + time + ends
//   Monthly → 'Every N months' + day-of-month + time + ends
//
// Ends: never / on a date / after N runs.

type ScheduleFrequency = 'daily' | 'weekly' | 'monthly';
type ScheduleEndType   = 'never' | 'on_date' | 'after_runs';

interface ScheduleConfig {
  frequency: ScheduleFrequency;
  interval:  number;             // every N [unit]
  weekdays:  number[];           // 0=Mon … 6=Sun (display order)
  monthDay:  number;             // 1..31
  time:      string;             // 'HH:MM' 24h
  ends:      ScheduleEndType;
  endsDate:  string;             // 'YYYY-MM-DD'
  endsAfter: number;             // run count
}

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

const DEFAULT_SCHEDULE: ScheduleConfig = {
  frequency: 'weekly',
  interval:  1,
  weekdays:  [2],     // Wed (Mon=0)
  monthDay:  1,
  time:      '09:00',
  ends:      'never',
  endsDate:  '',
  endsAfter: 10,
};

export function AgentDetail() {
  void LAUNCH_LEVELS_REMOVED;
  // `id` is present when arriving via /projects/:id/agents/:slug — that route
  // pre-scopes the launch panel to the project. Otherwise we're in the global
  // catalog (/agents/:slug) and the user picks a project in the launch panel.
  const { slug, id: scopedProjectId } = useParams();
  const navigate = useNavigate();
  const agent = AGENTS.find((a) => a.slug === slug);
  const scopedProject = scopedProjectId
    ? PROJECTS.find((p) => p.id === scopedProjectId) ?? null
    : null;

  const [selectedProject, setSelectedProject] = useState(
    scopedProject?.id ?? CURRENT_PROJECT_ID,
  );
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [adGroupMode, setAdGroupMode] = useState(false);
  const [selectedAdGroups, setSelectedAdGroups] = useState<string[]>([]);
  const [runMode, setRunMode] = useState<RunMode>('once');
  const [steer, setSteer] = useState('');
  const [dateRange, setDateRange] = useState('last_30d');
  const [schedule, setSchedule] = useState<ScheduleConfig>(DEFAULT_SCHEDULE);

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
    // Project-scoped launches stay scoped (URL preserves the project context).
    const prefix = scopedProject ? `/projects/${scopedProject.id}` : '';
    if (agent.slug === 'competitor-spy') {
      navigate(`${prefix}/agents/competitor-spy/run/run-competitor-spy-running`);
    } else {
      navigate(`${prefix}/agents/${agent.slug}/run/run-${agent.slug}`);
    }
  };

  void ACCOUNTS; // legacy mock kept for other surfaces; not used here

  return (
    <div className="font-sans text-ppc-ink">
      <Breadcrumbs trail={['Agents', agent.name]} />

      {/* HERO — full width so the H1 has room to breathe. */}
      <EditorialHero agent={agent} />

      <div className="mt-14 grid gap-8 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-start">
        {/* ═══ LEFT — editorial story ═══════════════════════════════════════ */}
        <div className="min-w-0 space-y-8">
          <ExpeditionMap agent={agent} />
          <LiveInvestigationLog slug={agent.slug} />
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
            schedule={schedule}
            setSchedule={setSchedule}
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

// ─── Editorial hero ──────────────────────────────────────────────────────
//
// Classic v5 hero: huge Figtree 900 H1 + italic PF-Marlet-Display subhead
// in purple, body prose underneath, big duotone Phosphor icon on the right
// haloed by a soft lavender bloom (mirrors the AgentCatalog MascotBench
// composition — same hand, single icon instead of mascot photo).

const CATEGORY_LABEL: Record<string, string> = {
  operations:  'Operations',
  creative:    'Creative',
  strategic:   'Strategic',
  buyer:       'Buyer',
  diagnostics: 'Diagnostics',
  client:      'Client',
  context:     'Context',
};

function EditorialHero({ agent }: { agent: AgentDefinition }) {
  const hasPeriod = agent.headline.endsWith('.');
  const headlineBody = hasPeriod ? agent.headline.slice(0, -1) : agent.headline;

  return (
    <section className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(420px,520px)] lg:gap-16">
      <div className="flex flex-col">
        <CategoryChip label={CATEGORY_LABEL[agent.category] ?? agent.category} />

        <h1 className="mt-5 font-display font-black leading-[0.94] tracking-[-0.038em] text-ppc-ink text-[52px] sm:text-[64px] lg:text-[80px]">
          {agent.name}
        </h1>

        <p
          className="mt-3 font-serif font-bold italic leading-[1.05] tracking-[-0.025em] text-ppc-purple-500 text-[28px] sm:text-[34px] lg:text-[42px]"
          style={{ fontFamily: 'PF-Marlet-Display, "Playfair Display", Georgia, serif' }}
        >
          {headlineBody}
          {hasPeriod && <span className="text-ppc-purple-700">.</span>}
        </p>

        <p className="mt-7 max-w-[520px] text-[16px] leading-[1.65] text-ppc-text-muted">
          {agent.outcomeDescription}
        </p>
      </div>

      <IconSpotlight Icon={SLUG_TO_ICON[agent.slug] ?? Sparkle} />
    </section>
  );
}

function CategoryChip({ label }: { label: string }) {
  return (
    <span
      className="inline-flex w-fit items-center rounded-full px-[11px] py-[5px] text-[12px] font-semibold"
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

// ─── (Report peek + Peek card components removed 2026-05-17.)
// Stewart's call: weekly-audit's preview deck was too busy. budget-pacer's
// simpler IconSpotlight pattern is the one he loves — use it for every
// agent. If/when we want a real "what came back" peek, build it as a
// dedicated post-hero section, not crammed beside the H1.

function IconSpotlight({ Icon }: { Icon: PhosphorIcon }) {
  return (
    <div className="relative hidden aspect-square w-full max-w-[360px] place-self-center lg:block">
      {/* Inline keyframes for the bloom breathing — ambient, very gentle.
          7s cycle, scales 0.96→1.05 and opacity 0.75→1, so the eye reads
          it as life, not motion. */}
      <style>{`
        @keyframes spotlight-bloom-pulse {
          0%, 100% { opacity: 0.78; transform: scale(0.97); }
          50%      { opacity: 1;    transform: scale(1.05); }
        }
        @keyframes spotlight-icon-float {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-4px); }
        }
      `}</style>

      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(55% 60% at 50% 52%, rgba(127,90,240,0.30) 0%, rgba(127,90,240,0.10) 45%, transparent 75%)',
          animation: 'spotlight-bloom-pulse 7s ease-in-out infinite',
          transformOrigin: '50% 52%',
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-[12%] rounded-full opacity-[0.35]"
        style={{
          backgroundImage:
            'radial-gradient(rgba(127,90,240,0.30) 1px, transparent 1px)',
          backgroundSize: '14px 14px',
          mask: 'radial-gradient(circle at 50% 50%, black 40%, transparent 75%)',
          WebkitMask: 'radial-gradient(circle at 50% 50%, black 40%, transparent 75%)',
        }}
      />
      <div
        className="relative grid h-full place-items-center"
        style={{ animation: 'spotlight-icon-float 7s ease-in-out infinite' }}
      >
        <Icon size={220} weight="duotone" className="text-ppc-purple-500" />
      </div>
    </div>
  );
}

// Per-territory icons for the expedition map. Keys match the inspect
// `title` strings in mock/agents.ts. Falls back to Sparkle if a title
// hasn't been mapped yet.
const INSPECT_ICONS: Record<string, PhosphorIcon> = {
  'Spend leaks':            Drop,
  'Negative gaps':          Funnel,
  'Search term drift':      Compass,
  'Quality score outliers': Gauge,
  'Bid cap interference':   Lock,
  'Ad copy fatigue':        BatteryLow,
  'Auction shifts':         ChartLine,
  'Pacing risk':            ClockCountdown,
};

// ─── Expedition map (the territory the agent inspects) ──────────────────
//
// Dark surface (Surface 03), full-width inside the editorial column.
// Numbered list of the places this agent looks — works for single-prompt
// agents (dimensions) and multi-stage agents (stages) without changing
// shape. Falls back to thinkingSteps if `inspects` isn't populated yet.

function ExpeditionMap({ agent }: { agent: AgentDefinition }) {
  const items: InspectionItem[] =
    agent.inspects && agent.inspects.length > 0
      ? agent.inspects
      : agent.thinkingSteps.map((s) => ({ title: s, desc: '' }));

  return (
    <section
      className="relative overflow-hidden rounded-[24px] text-white"
      style={{
        background:
          'radial-gradient(120% 80% at 50% 0%, #1A1030 0%, #0F0A1E 60%, #0A0814 100%)',
        boxShadow:
          '0 1px 0 rgba(255,255,255,0.04) inset, 0 30px 60px -30px rgba(15,10,30,0.55)',
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-[460px] w-[460px] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(127,90,240,0.22) 0%, rgba(127,90,240,0.08) 35%, transparent 65%)',
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'radial-gradient(rgba(255,255,255,0.55) 1px, transparent 1px)',
          backgroundSize: '3px 3px',
          mixBlendMode: 'screen',
        }}
      />

      <div className="relative px-9 py-11 sm:px-11 sm:py-12">
        <h2 className="font-display text-[34px] font-black leading-[0.98] tracking-[-0.028em] text-white sm:text-[42px]">
          The territory
          <span
            className="ml-2 font-serif font-bold italic text-ppc-purple-400"
            style={{ fontFamily: 'PF-Marlet-Display, "Playfair Display", Georgia, serif' }}
          >
            it covers.
          </span>
        </h2>
        <p className="mt-4 max-w-[560px] text-[15px] leading-[1.65] text-white/65">
          Every place this agent looks. Read it once and you'll know
          exactly what's coming back in the report.
        </p>

        <ol className="mt-10 grid gap-x-12 gap-y-8 sm:grid-cols-2">
          {items.map((it, i) => {
            const Icon = INSPECT_ICONS[it.title] ?? Sparkle;
            return (
              <li key={i} className="flex items-start gap-5">
                <span
                  aria-hidden
                  className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-[14px]"
                  style={{
                    background:
                      'linear-gradient(155deg, rgba(168,140,255,0.18) 0%, rgba(127,90,240,0.10) 60%, rgba(90,63,224,0.06) 100%)',
                    boxShadow:
                      '0 0 0 1px rgba(168,140,255,0.18) inset, 0 8px 18px -10px rgba(127,90,240,0.45)',
                  }}
                >
                  <Icon
                    size={26}
                    weight="duotone"
                    className="text-ppc-purple-300"
                  />
                </span>
                <div className="min-w-0 pt-[4px]">
                  <p className="text-[17px] font-bold leading-[1.25] tracking-[-0.012em] text-white">
                    {it.title}
                  </p>
                  {it.desc && (
                    <p className="mt-1.5 text-[13.5px] leading-[1.6] text-white/60">
                      {it.desc}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

// ─── Watch it work — animated reasoning-trace preview ──────────────────
//
// Sits below the ExpeditionMap. Cycles through the agent's reasoning
// trace on a slow loop so the user can SEE what's about to happen when
// they launch — depth via narration. Honest framing: it's a preview of
// the agent's voice, not a live process.

const TRACE_TICK_MS = 1300;
const TRACE_PAUSE_MS = 1600;

function LiveInvestigationLog({ slug }: { slug: string }) {
  const trace = LIVE_TRACES[slug];
  // 0..trace.length-1: that step is active.
  // === trace.length: all done, pause before reset.
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (!trace) return;
    let cancelled = false;

    const cycle = () => {
      if (cancelled) return;
      setActiveIdx((i) => {
        if (i >= trace.length) {
          // Pause complete — reset.
          return 0;
        }
        return i + 1;
      });
    };

    const interval = window.setInterval(cycle, TRACE_TICK_MS);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [trace]);

  // When all steps are done, hold the "all check" state for the pause
  // duration before the next tick resets. Handled by adjusting the tick
  // interval — but the simplest way is to just let the cycle keep going
  // and clamp at trace.length, then reset on the next tick after pause.
  // Since the interval runs every 1.3s, the "all done" pause is one
  // extra tick (1.3s) — close enough to TRACE_PAUSE_MS.
  void TRACE_PAUSE_MS;

  if (!trace) return null;

  return (
    <section
      className="relative overflow-hidden rounded-[24px] text-white"
      style={{
        background:
          'radial-gradient(120% 80% at 100% 0%, #1A1030 0%, #0F0A1E 60%, #0A0814 100%)',
        boxShadow:
          '0 1px 0 rgba(255,255,255,0.04) inset, 0 30px 60px -30px rgba(15,10,30,0.55)',
      }}
    >
      <style>{`
        @keyframes log-step-pulse {
          0%, 100% { opacity: 0.55; transform: scale(0.95); }
          50%      { opacity: 1;    transform: scale(1.15); }
        }
        @keyframes log-title-pulse {
          0%, 100% { opacity: 0.55; box-shadow: 0 0 0 0 rgba(168,140,255,0.55); }
          50%      { opacity: 1;    box-shadow: 0 0 0 6px rgba(168,140,255,0); }
        }
      `}</style>

      <span
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-[320px] w-[320px] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(127,90,240,0.20) 0%, rgba(127,90,240,0.06) 40%, transparent 70%)',
        }}
      />

      <div className="relative px-9 py-9 sm:px-11 sm:py-10">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="block h-[10px] w-[10px] rounded-full"
            style={{
              background: '#A88CFF',
              animation: 'log-title-pulse 2.6s ease-in-out infinite',
            }}
          />
          <h3 className="font-display text-[26px] font-black leading-[1.05] tracking-[-0.025em] text-white sm:text-[30px]">
            Watch it work
            <span
              className="font-serif font-bold italic text-ppc-purple-400"
              style={{ fontFamily: 'PF-Marlet-Display, "Playfair Display", Georgia, serif' }}
            >
              .
            </span>
          </h3>
        </div>
        <p className="mt-3 max-w-[560px] text-[14px] leading-[1.65] text-white/60">
          A peek at the reasoning trace — what's happening behind the
          scenes while it builds your report.
        </p>

        <ul className="mt-7 space-y-[14px]">
          {trace.map((line, i) => {
            const status: 'pending' | 'active' | 'done' =
              i < activeIdx ? 'done' : i === activeIdx ? 'active' : 'pending';
            return (
              <li key={i} className="flex items-center gap-3.5">
                <LogStatusDot status={status} />
                <span
                  className="text-[14.5px] leading-[1.55] transition-colors duration-300"
                  style={{
                    color:
                      status === 'active'
                        ? 'rgba(255,255,255,0.96)'
                        : status === 'done'
                          ? 'rgba(255,255,255,0.55)'
                          : 'rgba(255,255,255,0.30)',
                  }}
                >
                  {line}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function LogStatusDot({ status }: { status: 'pending' | 'active' | 'done' }) {
  if (status === 'done') {
    return (
      <span
        aria-hidden
        className="grid h-[20px] w-[20px] shrink-0 place-items-center rounded-full transition-colors"
        style={{
          background: 'rgba(93,202,165,0.18)',
          boxShadow: 'inset 0 0 0 1px rgba(93,202,165,0.45)',
        }}
      >
        <Check size={11} weight="bold" style={{ color: '#5DCAA5' }} />
      </span>
    );
  }
  if (status === 'active') {
    return (
      <span
        aria-hidden
        className="relative grid h-[20px] w-[20px] shrink-0 place-items-center"
      >
        <span
          className="absolute inset-0 rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(168,140,255,0.45) 0%, transparent 70%)',
            animation: 'log-step-pulse 1.3s ease-in-out infinite',
          }}
        />
        <span
          className="relative h-[7px] w-[7px] rounded-full"
          style={{
            background: '#A88CFF',
            boxShadow: '0 0 10px rgba(168,140,255,0.85)',
          }}
        />
      </span>
    );
  }
  // pending
  return (
    <span
      aria-hidden
      className="block h-[20px] w-[20px] shrink-0 rounded-full"
      style={{ boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.16)' }}
    />
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
  schedule: ScheduleConfig;
  setSchedule: (s: ScheduleConfig) => void;
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
    runMode, setRunMode,
    schedule, setSchedule,
    steer, setSteer, dateRange, setDateRange,
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

          {runMode !== 'once' && (
            <SchedulePanel value={schedule} onChange={setSchedule} />
          )}
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

// ─── Schedule panel (expands when Run mode != 'once') ────────────────────
//
// Soft purple-tinted container nested inside the Run mode FieldBlock so it
// visually belongs to the cadence choice (vs. floating as a sibling field).
// Frequency segmented control on top, then per-variant body. Common controls
// (At / Ends) stack below all variants so muscle memory stays intact when
// switching between Daily / Weekly / Monthly.

const FREQ_TABS: Array<{ value: ScheduleFrequency; label: string; unit: string; unitPlural: string }> = [
  { value: 'daily',   label: 'Daily',   unit: 'day',   unitPlural: 'days'   },
  { value: 'weekly',  label: 'Weekly',  unit: 'week',  unitPlural: 'weeks'  },
  { value: 'monthly', label: 'Monthly', unit: 'month', unitPlural: 'months' },
];

function SchedulePanel({
  value,
  onChange,
}: {
  value: ScheduleConfig;
  onChange: (s: ScheduleConfig) => void;
}) {
  const patch = (p: Partial<ScheduleConfig>) => onChange({ ...value, ...p });
  const activeFreq = FREQ_TABS.find((f) => f.value === value.frequency) ?? FREQ_TABS[1];
  const unitLabel = value.interval === 1 ? activeFreq.unit : activeFreq.unitPlural;

  const summary = buildScheduleSummary(value);

  return (
    <div
      className="mt-3 rounded-[14px] px-4 py-4"
      style={{
        background: '#FAF7FE',
        boxShadow: 'inset 0 0 0 1px #ECE5F8',
      }}
    >
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <p
          className="font-mono text-[10px] font-bold uppercase tracking-[0.12em]"
          style={{ color: '#7C45CB' }}
        >
          Schedule
        </p>
        <p className="text-[11px] text-ppc-text-muted">{summary}</p>
      </div>

      {/* Frequency segmented control */}
      <div
        className="mb-4 grid grid-cols-3 gap-1 rounded-[10px] p-1"
        style={{
          background: '#EFE7FB',
          boxShadow: 'inset 0 0 0 1px #E4D9F5',
        }}
      >
        {FREQ_TABS.map((f) => {
          const active = f.value === value.frequency;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => patch({ frequency: f.value })}
              className="rounded-[7px] py-[7px] text-[12.5px] font-semibold transition-all"
              style={{
                background: active ? '#FFFFFF' : 'transparent',
                color: active ? '#5A3FE0' : '#7B6F94',
                boxShadow: active
                  ? '0 1px 0 rgba(255,255,255,0.6) inset, 0 4px 10px -6px rgba(90,63,224,0.35), 0 0 0 1px rgba(127,90,240,0.18)'
                  : 'none',
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Every N [unit] */}
      <div className="mb-4 flex items-center gap-3">
        <p className="shrink-0 text-[12px] font-semibold text-ppc-ink">Every</p>
        <IntervalStepper
          value={value.interval}
          onChange={(n) => patch({ interval: n })}
        />
        <p className="text-[12.5px] text-ppc-text-muted">{unitLabel}</p>
      </div>

      {/* Variant-specific body */}
      {value.frequency === 'weekly' && (
        <WeekdayPicker
          selected={value.weekdays}
          onChange={(weekdays) => patch({ weekdays })}
        />
      )}

      {value.frequency === 'monthly' && (
        <MonthDayPicker
          value={value.monthDay}
          onChange={(monthDay) => patch({ monthDay })}
        />
      )}

      {/* Common: At time + Ends */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <p className="mb-1.5 text-[11.5px] font-semibold text-ppc-ink">At</p>
          <TimeInput
            value={value.time}
            onChange={(time) => patch({ time })}
          />
        </div>
        <div>
          <p className="mb-1.5 text-[11.5px] font-semibold text-ppc-ink">Ends</p>
          <EndsControl
            value={value.ends}
            onChange={(ends) => patch({ ends })}
          />
        </div>
      </div>

      {value.ends === 'on_date' && (
        <div className="mt-3">
          <p className="mb-1.5 text-[11.5px] font-semibold text-ppc-ink">End date</p>
          <input
            type="date"
            value={value.endsDate}
            onChange={(e) => patch({ endsDate: e.target.value })}
            className="w-full rounded-[10px] bg-white px-3 py-[9px] text-[13px] text-ppc-ink outline-none"
            style={{ boxShadow: 'inset 0 0 0 1px #e7e2ef' }}
          />
        </div>
      )}

      {value.ends === 'after_runs' && (
        <div className="mt-3 flex items-center gap-3">
          <p className="shrink-0 text-[11.5px] font-semibold text-ppc-ink">After</p>
          <IntervalStepper
            value={value.endsAfter}
            onChange={(n) => patch({ endsAfter: n })}
            max={365}
          />
          <p className="text-[12px] text-ppc-text-muted">runs</p>
        </div>
      )}
    </div>
  );
}

// Compact -/+ stepper with a centered number, matching the soft purple skin.

function IntervalStepper({
  value,
  onChange,
  min = 1,
  max = 99,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
}) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  return (
    <div
      className="inline-flex items-center rounded-[10px] bg-white"
      style={{ boxShadow: 'inset 0 0 0 1px #e7e2ef' }}
    >
      <button
        type="button"
        onClick={() => onChange(clamp(value - 1))}
        className="grid h-[32px] w-[28px] place-items-center rounded-l-[10px] text-ppc-text-muted transition-colors hover:bg-[#F4EFFB] hover:text-ppc-ink"
        aria-label="Decrease"
      >
        <Minus size={12} weight="bold" />
      </button>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(clamp(parseInt(e.target.value || '1', 10)))}
        className="h-[32px] w-[44px] border-0 bg-transparent text-center text-[13px] font-semibold text-ppc-ink outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        onClick={() => onChange(clamp(value + 1))}
        className="grid h-[32px] w-[28px] place-items-center rounded-r-[10px] text-ppc-text-muted transition-colors hover:bg-[#F4EFFB] hover:text-ppc-ink"
        aria-label="Increase"
      >
        <Plus size={12} weight="bold" />
      </button>
    </div>
  );
}

// Mon-Sun chips. Multi-select.

function WeekdayPicker({
  selected,
  onChange,
}: {
  selected: number[];
  onChange: (days: number[]) => void;
}) {
  const toggle = (i: number) => {
    onChange(
      selected.includes(i)
        ? selected.filter((d) => d !== i)
        : [...selected, i].sort((a, b) => a - b),
    );
  };
  return (
    <div>
      <p className="mb-2 text-[11.5px] font-semibold text-ppc-ink">On days</p>
      <div className="flex flex-wrap gap-[6px]">
        {WEEKDAY_LABELS.map((label, i) => {
          const active = selected.includes(i);
          return (
            <button
              key={label}
              type="button"
              onClick={() => toggle(i)}
              className="grid h-[34px] min-w-[42px] place-items-center rounded-[8px] px-2 text-[12px] font-semibold transition-all"
              style={{
                background: active ? '#FFFFFF' : 'transparent',
                color: active ? '#5A3FE0' : '#6F6585',
                boxShadow: active
                  ? 'inset 0 0 0 1.5px #7F5AF0, 0 2px 6px -3px rgba(127,90,240,0.35)'
                  : 'inset 0 0 0 1px #DFD4F0',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Day-of-month picker. 1-31 grid. Single-select.

function MonthDayPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (d: number) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-[11.5px] font-semibold text-ppc-ink">
        On day <span className="font-mono text-[11px] text-ppc-text-muted">of the month</span>
      </p>
      <div className="grid grid-cols-7 gap-[5px]">
        {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => {
          const active = d === value;
          return (
            <button
              key={d}
              type="button"
              onClick={() => onChange(d)}
              className="grid h-[30px] place-items-center rounded-[7px] text-[11.5px] font-semibold transition-all"
              style={{
                background: active ? '#FFFFFF' : 'transparent',
                color: active ? '#5A3FE0' : '#6F6585',
                boxShadow: active
                  ? 'inset 0 0 0 1.5px #7F5AF0, 0 2px 6px -3px rgba(127,90,240,0.35)'
                  : 'inset 0 0 0 1px #DFD4F0',
              }}
            >
              {d}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-[11px] text-ppc-text-muted">
        If the month has fewer days, runs on the last day.
      </p>
    </div>
  );
}

// Pill-style time input — native picker on click. Clock icon as affordance.

function TimeInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label
      className="flex items-center gap-2 rounded-[10px] bg-white px-3 py-[9px] transition-colors focus-within:bg-[#FBF9FD]"
      style={{ boxShadow: 'inset 0 0 0 1px #e7e2ef' }}
    >
      <Clock size={13} weight="bold" className="text-ppc-text-muted" />
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border-0 bg-transparent text-[13px] font-medium text-ppc-ink outline-none"
      />
    </label>
  );
}

// "Ends" dropdown — Never / On date / After N runs.

function EndsControl({
  value,
  onChange,
}: {
  value: ScheduleEndType;
  onChange: (v: ScheduleEndType) => void;
}) {
  return (
    <div className="relative">
      <CalendarBlank
        size={13}
        weight="bold"
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ppc-text-muted"
      />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as ScheduleEndType)}
        className="w-full appearance-none rounded-[10px] bg-white pl-8 pr-8 py-[9px] text-[13px] font-medium text-ppc-ink outline-none focus:bg-[#FBF9FD]"
        style={{ boxShadow: 'inset 0 0 0 1px #e7e2ef' }}
      >
        <option value="never">Never</option>
        <option value="on_date">On date</option>
        <option value="after_runs">After N runs</option>
      </select>
      <CaretDown
        size={10}
        weight="bold"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ppc-text-muted"
      />
    </div>
  );
}

// Human-readable summary for the schedule header chip.

function buildScheduleSummary(s: ScheduleConfig): string {
  const time = formatTime(s.time);
  if (s.frequency === 'daily') {
    return s.interval === 1
      ? `Every day at ${time}`
      : `Every ${s.interval} days at ${time}`;
  }
  if (s.frequency === 'weekly') {
    const days =
      s.weekdays.length === 0
        ? '—'
        : s.weekdays.length === 7
          ? 'every day'
          : s.weekdays.map((i) => WEEKDAY_LABELS[i]).join(', ');
    const cadence = s.interval === 1 ? 'Weekly' : `Every ${s.interval} weeks`;
    return `${cadence}, ${days} · ${time}`;
  }
  const ord = ordinal(s.monthDay);
  const cadence = s.interval === 1 ? 'Monthly' : `Every ${s.interval} months`;
  return `${cadence}, ${ord} · ${time}`;
}

function formatTime(t: string): string {
  const [hStr, mStr] = t.split(':');
  const h = parseInt(hStr || '9', 10);
  const m = mStr ?? '00';
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${m} ${period}`;
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
