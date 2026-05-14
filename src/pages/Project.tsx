import { useParams, Link, Navigate } from 'react-router-dom';
import {
  ArrowRight, ArrowLeft, Clock, Sparkle, FileText, TrendUp, TrendDown,
  Minus,
} from '@phosphor-icons/react';
import { PROJECTS, ACCOUNTS } from '../mock/projects';
import { RECENT_RUNS_SUMMARY } from '../mock/runs';
import { AGENTS } from '../mock/agents';
import { PageHero, SectionHeader, PrimaryCTA, SecondaryButton } from '../components/PageHero';

// Project page · /projects/:id
//
// Editorial dossier on the client. Same rhythm as StagePage:
//   eyebrow → huge display H1 (purple period flourish) → calm sections.
// Every block points at MONEY / TIME / APPROVAL for THIS client.
// Promoted accounts + campaigns from dense tables to "editorial rows"
// (calmer rhythm, matches StagePage's recent-runs list cadence).

// ─── Account-level spend signal (mock; in prod this comes from the API) ───
const ACCOUNT_METRICS: Record<string, { spend30d: string; trendPct: number; campaigns: number }> = {
  a1:  { spend30d: '$74,200', trendPct: 12,  campaigns: 6 },
  a2:  { spend30d: '$98,400', trendPct: 8,   campaigns: 8 },
  a3:  { spend30d: '$42,100', trendPct: -4,  campaigns: 3 },
  a4:  { spend30d: '$58,300', trendPct: 14,  campaigns: 5 },
  a5:  { spend30d: '$31,800', trendPct: 9,   campaigns: 4 },
  a6:  { spend30d: '$22,900', trendPct: -2,  campaigns: 3 },
  a7:  { spend30d: '$68,500', trendPct: 18,  campaigns: 6 },
  a8:  { spend30d: '$41,200', trendPct: 22,  campaigns: 4 },
  a9:  { spend30d: '$54,700', trendPct: -7,  campaigns: 5 },
  a10: { spend30d: '$28,400', trendPct: 6,   campaigns: 3 },
  a11: { spend30d: '$36,800', trendPct: 4,   campaigns: 4 },
};

// ─── Campaign editorial rollup ────────────────────────────────────────────
type Trend = 'up' | 'down' | 'flat';
const CAMPAIGNS: { name: string; account: string; budget: string; spend30d: string; cpa: string; trend: Trend }[] = [
  { name: 'Brand defence',           account: 'Smith Law · Brand',     budget: '$2,500/d', spend30d: '$74,200', cpa: '$48',  trend: 'up' },
  { name: 'Non-brand injury types',  account: 'Smith Law · Non-brand', budget: '$3,800/d', spend30d: '$98,400', cpa: '$112', trend: 'up' },
  { name: 'Local services Cleveland',account: 'Smith Law · Brand',     budget: '$1,200/d', spend30d: '$32,100', cpa: '$96',  trend: 'flat' },
  { name: 'Settlement angle test',   account: 'Smith Law · Non-brand', budget: '$800/d',   spend30d: '$11,800', cpa: '$74',  trend: 'up' },
  { name: 'Spanish-speaking buyers', account: 'Smith Law · Non-brand', budget: '$600/d',   spend30d: '$6,400',  cpa: '$132', trend: 'down' },
];

export function ProjectPage() {
  const { id } = useParams();
  const project = PROJECTS.find((p) => p.id === id);
  if (!project) return <Navigate to="/" replace />;

  const accounts = ACCOUNTS.filter((a) => a.projectId === project.id);
  const recentRuns = RECENT_RUNS_SUMMARY.filter((r) => r.projectName === project.name);
  const suggested = [AGENTS[0], AGENTS[2], AGENTS[10]];

  // Pre-computed roll-ups so the hero numbers feel grounded in real data.
  const totalCampaigns = accounts.reduce(
    (sum, a) => sum + (ACCOUNT_METRICS[a.id]?.campaigns ?? 0), 0,
  );

  return (
    <div className="space-y-12">
      {/* Back rail */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-white/55 transition-colors hover:text-ppc-purple-500"
      >
        <ArrowLeft size={13} weight="bold" /> Dashboard
      </Link>

      {/* HERO — client name is the moment. Period in purple, breathable. */}
      <PageHero
        eyebrow={`Client dossier · ${project.industry} · ${accounts.length} ${accounts.length === 1 ? 'account' : 'accounts'} connected`}
        headline={`${project.name}.`}
        description="Your agents are watching every account, every week. What's surfaced this week is below. Then who this client is, what they're running, and what's worth doing next."
        actions={
          <>
            <PrimaryCTA>
              <Sparkle size={16} weight="fill" /> Run an agent
            </PrimaryCTA>
            <SecondaryButton>
              <FileText size={16} weight="duotone" /> Generate client report
            </SecondaryButton>
          </>
        }
      />

      {/* THIS-WEEK SURFACED — money/time moment, anchored to real run data */}
      <section className="grid gap-x-14 gap-y-10 border-y border-white/8 py-12 sm:grid-cols-3">
        <Stat
          eyebrow="Surfaced this week"
          value="$20.2K"
          sub={`of upside across ${project.name}'s ${accounts.length} accounts`}
          trend="From 2 agent runs"
        />
        <Stat
          eyebrow="Time given back"
          value="~9h"
          sub="of analyst desk-time, replaced"
          trend="vs manual baseline"
        />
        <Stat
          eyebrow="Live across"
          value={String(totalCampaigns)}
          sub="campaigns, two in active test"
          trend={`${accounts.length} ${accounts.length === 1 ? 'account' : 'accounts'} watched`}
        />
      </section>

      {/* BUSINESS CONTEXT — what every agent knows */}
      <section>
        <SectionHeader
          eyebrow="Business context"
          title="What every agent already knows."
          action={
            <button className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ppc-purple-500 transition-colors hover:text-ppc-purple-700">
              Edit context <ArrowRight size={12} weight="bold" />
            </button>
          }
        />
        <div className="grid gap-8 sm:grid-cols-[1.4fr_1fr]">
          <p className="max-w-[640px] text-[16.5px] leading-relaxed text-white/70">
            Personal injury law firm based in Ohio. Offer: contingency-fee representation
            (&ldquo;no fee unless we win&rdquo;). ICP: post-accident claimants aged 25 to 55
            within 48 hours of incident. Trust signals lean on settlement history and
            senior-attorney photos. Weakest point in the alignment chain right now:
            landing page form length (6 fields) vs the 3 fields most rivals use.
          </p>
          <div className="grid gap-3 self-start">
            <ContextPill label="Offer"        value="Contingency fee" />
            <ContextPill label="ICP"          value="Post-accident, 25 to 55" />
            <ContextPill label="Weakest link" value="LP form length" warn />
          </div>
        </div>
      </section>

      {/* CONNECTED ACCOUNTS — editorial rows, not dense table */}
      <section>
        <SectionHeader
          eyebrow="Connected accounts"
          title={`${accounts.length} live ${accounts.length === 1 ? 'account' : 'accounts'}.`}
        />
        <ul className="divide-y divide-white/8 rounded-2xl border border-white/8 bg-white/[0.04]">
          {accounts.map((acc) => {
            const m = ACCOUNT_METRICS[acc.id] ?? { spend30d: '—', trendPct: 0, campaigns: 0 };
            return (
              <li key={acc.id}>
                <button
                  type="button"
                  className="group flex w-full items-center gap-6 px-8 py-6 text-left transition-colors hover:bg-ppc-purple-500/15/30"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[16px] font-semibold tracking-tight text-white">
                      {acc.name}
                    </div>
                    <div className="mt-1 flex items-center gap-3 font-mono text-[11.5px] text-white/55">
                      <span className="tabular">{acc.customerId}</span>
                      <span className="text-white/25">·</span>
                      <span className="tabular">{m.campaigns} campaigns</span>
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <HealthPill health={acc.health} />
                  </div>
                  <div className="hidden text-right md:block">
                    <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-white/55">
                      30d spend
                    </div>
                    <div className="tabular mt-1 text-[15px] font-bold text-white">
                      {m.spend30d}
                    </div>
                  </div>
                  <TrendBadge pct={m.trendPct} />
                  <ArrowRight
                    size={14}
                    weight="bold"
                    className="text-white/25 transition-colors group-hover:text-ppc-purple-500"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* CAMPAIGNS AT A GLANCE — same editorial-row rhythm */}
      <section>
        <SectionHeader
          eyebrow="Campaigns at a glance"
          title="Where the budget is going."
        />
        <ul className="divide-y divide-white/8 rounded-2xl border border-white/8 bg-white/[0.04]">
          {CAMPAIGNS.map((c) => (
            <li key={c.name}>
              <div className="flex items-center gap-6 px-8 py-5">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[15.5px] font-semibold tracking-tight text-white">
                    {c.name}
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-[12.5px] text-white/55">
                    <span>{c.account}</span>
                    <span className="text-white/25">·</span>
                    <span className="tabular font-mono text-[11.5px]">{c.budget}</span>
                  </div>
                </div>
                <div className="hidden text-right sm:block">
                  <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-white/55">
                    30d spend
                  </div>
                  <div className="tabular mt-1 text-[14.5px] font-bold text-white">
                    {c.spend30d}
                  </div>
                </div>
                <div className="hidden text-right md:block">
                  <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-white/55">
                    CPA
                  </div>
                  <div className="tabular mt-1 text-[14.5px] font-semibold text-white/70">
                    {c.cpa}
                  </div>
                </div>
                <CampaignTrend trend={c.trend} />
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* RECENT RUNS · for this client */}
      {recentRuns.length > 0 && (
        <section>
          <SectionHeader
            eyebrow="Recent runs · this client"
            title="What's been on this account's desk."
          />
          <ul className="divide-y divide-white/8 rounded-2xl border border-white/8 bg-white/[0.04]">
            {recentRuns.map((r) => (
              <li key={r.runId}>
                <Link
                  to={`/reports/${r.runId}`}
                  className="group flex items-center gap-6 px-8 py-6 transition-colors hover:bg-ppc-purple-500/15/30"
                >
                  <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-ppc-purple-500 sm:w-44">
                    {r.agentName}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[16px] font-semibold tracking-tight text-white">
                      {r.headline}
                    </div>
                    <div className="mt-0.5 flex items-center gap-3 text-[12.5px] text-white/55">
                      <span className="tabular">{r.duration}</span>
                      <span className="text-white/25">·</span>
                      <span>{r.finishedAt}</span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-ppc-success">
                    <TrendUp size={13} weight="bold" />
                    <span className="tabular">{r.upside}</span>
                  </span>
                  <ArrowRight
                    size={14}
                    weight="bold"
                    className="text-white/25 transition-colors group-hover:text-ppc-purple-500"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* WHAT'S WORTH RUNNING NEXT */}
      <section>
        <SectionHeader
          eyebrow="What's worth running next"
          title="Three plays for this client."
        />
        <ul className="divide-y divide-white/8 rounded-2xl border border-white/8 bg-white/[0.04]">
          {suggested.map((a) => (
            <li key={a.slug}>
              <Link
                to={`/agents/${a.slug}`}
                className="group flex items-center gap-6 px-8 py-6 transition-colors hover:bg-ppc-purple-500/15/30"
              >
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-ppc-purple-500/15 text-[20px]">
                  {a.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[17px] font-bold tracking-tight text-white">{a.name}</div>
                  <div className="mt-1 max-w-[640px] text-[14px] leading-snug text-white/65">
                    {a.headline}
                  </div>
                </div>
                <div className="hidden text-right sm:block">
                  <div className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-white/55">
                    <Clock size={12} weight="duotone" /> {a.expectedDuration}
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-ppc-purple-500 transition-[gap] group-hover:gap-2">
                  Launch <ArrowRight size={13} weight="bold" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

// ─── Stat primitive — editorial 3-column ──────────────────────────────────
function Stat({ eyebrow, value, sub, trend }: {
  eyebrow: string; value: string; sub: string; trend: string;
}) {
  return (
    <div>
      <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-white/55">
        {eyebrow}
      </div>
      <div className="tabular mt-4 text-[52px] font-extrabold leading-none tracking-[-0.035em] text-white">
        {value}
      </div>
      <div className="mt-3 text-[13.5px] leading-snug text-white/65">{sub}</div>
      <div className="mt-1.5 font-mono text-[11px] uppercase tracking-wider text-ppc-purple-500">
        {trend}
      </div>
    </div>
  );
}

// ─── Context pill — small label/value card for the context grid ───────────
function ContextPill({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-5 py-4">
      <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-white/55">
        {label}
      </div>
      <div className={`mt-1.5 text-[15px] font-semibold tracking-tight ${warn ? 'text-ppc-warning' : 'text-white'}`}>
        {value}
      </div>
    </div>
  );
}

// ─── Health pill — semantic dot + label ───────────────────────────────────
function HealthPill({ health }: { health: 'good' | 'warning' | 'attention' }) {
  const map = {
    good:      { dot: 'bg-ppc-success', text: 'text-ppc-success', label: 'Healthy' },
    warning:   { dot: 'bg-ppc-warning', text: 'text-ppc-warning', label: 'Watch' },
    attention: { dot: 'bg-ppc-error',   text: 'text-ppc-error',   label: 'Needs attention' },
  }[health];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[13px] font-semibold ${map.text}`}>
      <span className={`h-2 w-2 rounded-full ${map.dot}`} />
      {map.label}
    </span>
  );
}

// ─── TrendBadge — signed % with semantic color ────────────────────────────
function TrendBadge({ pct }: { pct: number }) {
  if (pct === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-white/55">
        <Minus size={13} weight="bold" /> flat
      </span>
    );
  }
  const positive = pct > 0;
  const Icon = positive ? TrendUp : TrendDown;
  const cls = positive ? 'text-ppc-success' : 'text-ppc-error';
  return (
    <span className={`inline-flex items-center gap-1 text-[13px] font-semibold ${cls}`}>
      <Icon size={13} weight="bold" />
      <span className="tabular">{positive ? '+' : ''}{pct}%</span>
    </span>
  );
}

// ─── CampaignTrend — same vocabulary as TrendBadge but label-only ─────────
function CampaignTrend({ trend }: { trend: Trend }) {
  if (trend === 'up') {
    return (
      <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-ppc-success">
        <TrendUp size={13} weight="bold" /> up
      </span>
    );
  }
  if (trend === 'down') {
    return (
      <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-ppc-error">
        <TrendDown size={13} weight="bold" /> down
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-white/55">
      <Minus size={13} weight="bold" /> flat
    </span>
  );
}
