import { Link } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, Clock, Sparkle, TrendUp, Warning,
  CheckCircle, Lightning, Rocket, ListBullets, FileText, Buildings,
} from '@phosphor-icons/react';
import { AGENTS } from '../mock/agents';
import { RECENT_RUNS_SUMMARY } from '../mock/runs';
import { PROJECTS } from '../mock/projects';
import { SectionHeader, PrimaryCTA } from '../components/PageHero';

// Dashboard · /
//
// Agency control room. NOT a SaaS marketing landing page. Three jobs:
//   1. What needs my attention TODAY (high-priority unactioned findings)
//   2. What's running in the background right now
//   3. What just finished + which client / what's next
//
// Tight spacing, no filler KPI tiles, hero copy is concrete-not-marketing.

export function Dashboard() {
  const featuredRun = RECENT_RUNS_SUMMARY[0]; // Competitor Spy showcase
  const otherRuns = RECENT_RUNS_SUMMARY.slice(1);
  const suggested = [
    AGENTS.find((a) => a.slug === 'weekly-audit')!,
    AGENTS.find((a) => a.slug === 'spend-leak')!,
    AGENTS.find((a) => a.slug === 'sales-intelligence')!,
  ];

  return (
    <div className="space-y-10">
      {/* Quiet hero — eyebrow with date, headline framed around action,
          one CTA. No marketing prose. */}
      <header className="flex flex-wrap items-end justify-between gap-6 pb-1">
        <div>
          <div className="font-mono text-[11.5px] font-semibold uppercase tracking-[0.08em] text-ppc-neutral-500">
            Thursday · 14 May
          </div>
          <h1 className="mt-3 font-display text-[42px] font-extrabold leading-[1.02] tracking-[-0.025em] text-ppc-black sm:text-[48px]">
            3 things need your eyes<span className="text-ppc-purple-500">.</span>
          </h1>
        </div>
        <PrimaryCTA>
          <Sparkle size={16} weight="fill" />
          Run an agent
          <ArrowRight size={14} weight="bold" />
        </PrimaryCTA>
      </header>

      {/* Dev jump-strip — quick access to every showcase route for
          Mike / Jose / Stewart while reviewing the mockup. */}
      <section className="rounded-2xl border border-ppc-purple-200 bg-white/60 px-5 py-4 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5">
          <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ppc-purple-500">
            Jump to
          </div>
          <JumpChip to="/agents/competitor-spy" icon={Rocket} label="Agent launch" sub="Competitor Spy" />
          <JumpChip to="/agents/competitor-spy/run/run-competitor-spy-running" icon={Lightning} label="Agent running" sub="Stage 5 of 11" />
          <JumpChip to="/reports/run-competitor-spy-completed" icon={FileText} label="Agent results" sub="Competitor Spy · completed" />
          <JumpChip to="/reports/run-negative-keyword-completed" icon={FileText} label="Results · $12K waste" sub="Negative Keyword" />
          <JumpChip to="/projects/smith-law" icon={Buildings} label="Project page" sub="Smith Law Group" />
          <JumpChip to="/agents" icon={ListBullets} label="All agents" sub="28 in catalog" />
        </div>
      </section>

      {/* Needs attention — the actual top-3 priority findings.
          Specific, account-anchored, one-click actionable. */}
      <section>
        <SectionHeader
          eyebrow="Needs your attention"
          title="Three calls to make today."
        />
        <ul className="divide-y divide-ppc-neutral-100 rounded-2xl border border-ppc-neutral-100 bg-white">
          <AttentionRow
            tone="urgent"
            agent="Spend Leak Detector"
            project="Rocket Pet Insurance"
            finding="Quote form misfiring on /quote/ca — 0 conversions in 6 days while spend continues."
            impact="$3,400 burned this week"
            cta="Pause campaign"
            href="/reports/run-spend-leak-rocket"
          />
          <AttentionRow
            tone="opportunity"
            agent="Competitor Spy"
            project="Smith Law Group"
            finding='Unclaimed "same-day case review" angle — 3 rivals on adjacent timeline copy at 0.81% CTR.'
            impact="Build this campaign"
            cta="Draft variants"
            href="/reports/run-competitor-spy-completed"
          />
          <AttentionRow
            tone="opportunity"
            agent="Negative Keyword"
            project="Smith Law Group"
            finding="187 brand-safe negatives ready to deploy — blocks 24% of zero-conversion spend across 8 campaigns."
            impact="Deploy in one click"
            cta="Apply 187 negatives"
            href="/reports/run-negative-keyword-completed"
          />
        </ul>
      </section>

      {/* Mission control — what's running right now */}
      <section>
        <SectionHeader
          eyebrow="Running right now"
          title="Two agents working in the background."
          action={
            <Link to="/runs" className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-ppc-purple-500 hover:underline">
              Mission control <ArrowRight size={13} weight="bold" />
            </Link>
          }
        />
        <ul className="divide-y divide-ppc-neutral-100 rounded-2xl border border-ppc-neutral-100 bg-white">
          <RunningRow
            agent="Competitor Spy"
            project="Smith Law Group"
            stage="Sizing their spend · Stage 5 of 11"
            elapsed="11m 21s"
            href="/agents/competitor-spy/run/run-competitor-spy-running"
          />
          <RunningRow
            agent="Weekly Audit"
            project="Northstar Dental"
            stage="Walking the alignment chain · Stage 3 of 7"
            elapsed="4m 02s"
            href="/agents/weekly-audit/run/run-weekly-audit"
          />
        </ul>
      </section>

      {/* Just finished — the latest report, then thin list of others */}
      <section>
        <SectionHeader
          eyebrow="Just finished"
          title="Latest report."
          action={
            <Link
              to="/reports/run-competitor-spy-completed"
              className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-ppc-purple-500 hover:underline"
            >
              All reports <ArrowRight size={13} weight="bold" />
            </Link>
          }
        />
        <Link
          to={`/reports/${featuredRun.runId}`}
          className="group block rounded-2xl border border-ppc-neutral-100 bg-white p-8 transition-all hover:border-ppc-purple-300 hover:shadow-ppc-md sm:p-10"
        >
          <div className="flex flex-wrap items-center gap-3 text-[11.5px]">
            <span className="font-mono font-semibold uppercase tracking-[0.08em] text-ppc-purple-500">
              {featuredRun.agentName}
            </span>
            <span className="text-ppc-neutral-300">·</span>
            <span className="text-ppc-neutral-500">{featuredRun.projectName}</span>
            <span className="text-ppc-neutral-300">·</span>
            <span className="tabular text-ppc-neutral-500">{featuredRun.finishedAt}</span>
          </div>
          <h3 className="mt-4 max-w-[700px] font-display text-[36px] font-bold leading-[1.05] tracking-[-0.022em] text-ppc-black">
            {featuredRun.headline}
            <span className="text-ppc-purple-500">.</span>
          </h3>
          <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 text-[14px]">
            <span className="inline-flex items-center gap-1.5 text-ppc-neutral-700">
              <Clock size={13} weight="duotone" className="text-ppc-neutral-400" />
              <span className="tabular">{featuredRun.duration}</span>
              <span className="text-ppc-neutral-500">run</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-ppc-success">
              <TrendUp size={13} weight="bold" />
              <span className="tabular font-semibold">{featuredRun.upside}</span>
              <span className="font-normal text-ppc-neutral-500">est. upside</span>
            </span>
            <span className="ml-auto inline-flex items-center gap-1.5 text-[13px] font-semibold text-ppc-purple-500 group-hover:gap-2.5 transition-[gap]">
              Open report <ArrowUpRight size={13} weight="bold" />
            </span>
          </div>
        </Link>

        {otherRuns.length > 0 && (
          <ul className="mt-2.5 divide-y divide-ppc-neutral-100 rounded-2xl border border-ppc-neutral-100 bg-white">
            {otherRuns.map((r) => (
              <li key={r.runId}>
                <Link
                  to={`/reports/${r.runId}`}
                  className="group flex items-center gap-5 px-6 py-4 hover:bg-ppc-purple-50/30"
                >
                  <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-ppc-purple-500 sm:w-44">
                    {r.agentName}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[15px] font-semibold tracking-tight text-ppc-black">
                      {r.headline}
                    </div>
                    <div className="mt-0.5 text-[12px] text-ppc-neutral-500">
                      {r.projectName} · {r.finishedAt}
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-ppc-success">
                    <TrendUp size={12} weight="bold" />
                    <span className="tabular">{r.upside}</span>
                  </span>
                  <ArrowRight size={13} weight="bold" className="text-ppc-neutral-300 group-hover:text-ppc-purple-500" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Suggested next — slim wide list */}
      <section>
        <SectionHeader
          eyebrow="What's worth running next"
          title="Three plays for this week."
          action={
            <Link to="/agents" className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-ppc-purple-500 hover:underline">
              All agents <ArrowRight size={13} weight="bold" />
            </Link>
          }
        />
        <ul className="divide-y divide-ppc-neutral-100 rounded-2xl border border-ppc-neutral-100 bg-white">
          {suggested.map((a) => (
            <li key={a.slug}>
              <Link
                to={`/agents/${a.slug}`}
                className="group flex items-center gap-5 px-6 py-5 hover:bg-ppc-purple-50/30"
              >
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ppc-purple-50 text-[20px]">
                  {a.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[16px] font-bold tracking-tight text-ppc-black">{a.name}</div>
                  <div className="mt-0.5 max-w-[560px] truncate text-[13.5px] text-ppc-neutral-600">
                    {a.headline}
                  </div>
                </div>
                <div className="hidden text-right sm:block">
                  <div className="inline-flex items-center gap-1.5 text-[12px] font-medium text-ppc-neutral-500">
                    <Clock size={11} weight="duotone" /> {a.expectedDuration}
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-ppc-purple-500 group-hover:gap-2 transition-[gap]">
                  Launch <ArrowRight size={12} weight="bold" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Client roll — tight 2-col list */}
      <section>
        <SectionHeader eyebrow="Your clients" title="6 projects, 11 accounts." />
        <ul className="grid gap-x-3 sm:grid-cols-2">
          {PROJECTS.map((p) => (
            <li key={p.id}>
              <Link
                to={`/projects/${p.id}`}
                className="group flex items-center justify-between gap-3 border-b border-ppc-neutral-100 py-4"
              >
                <div className="min-w-0">
                  <div className="truncate text-[15px] font-semibold tracking-tight text-ppc-black">
                    {p.name}
                  </div>
                  <div className="mt-0.5 truncate text-[12px] text-ppc-neutral-500">{p.industry}</div>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-[12px]">
                  <span className="font-mono text-ppc-neutral-400">
                    {p.accountCount} {p.accountCount === 1 ? 'acct' : 'accts'}
                  </span>
                  <ArrowRight size={12} weight="bold" className="text-ppc-neutral-300 transition-colors group-hover:text-ppc-purple-500" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

// ─── Row primitives ───────────────────────────────────────────────────────

function JumpChip({
  to, icon: Icon, label, sub,
}: {
  to: string;
  icon: typeof Sparkle;
  label: string;
  sub: string;
}) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-2.5 rounded-xl border border-ppc-neutral-100 bg-white px-3.5 py-2 transition-colors hover:border-ppc-purple-300"
    >
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-ppc-purple-50 text-ppc-purple-500">
        <Icon size={13} weight="duotone" />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-[12.5px] font-semibold tracking-tight text-ppc-black">
          {label}
        </span>
        <span className="text-[10.5px] text-ppc-neutral-500">{sub}</span>
      </span>
    </Link>
  );
}


function AttentionRow({
  tone, agent, project, finding, impact, cta, href,
}: {
  tone: 'urgent' | 'opportunity';
  agent: string; project: string; finding: string; impact: string;
  cta: string; href: string;
}) {
  const toneCls = tone === 'urgent'
    ? { wrap: 'text-ppc-error', icon: Warning,      bg: 'bg-ppc-error/10' }
    : { wrap: 'text-ppc-success', icon: CheckCircle, bg: 'bg-ppc-success/10' };
  const Icon = toneCls.icon;
  return (
    <li>
      <Link
        to={href}
        className="group flex items-start gap-5 px-6 py-5 hover:bg-ppc-purple-50/30"
      >
        <div className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl ${toneCls.bg} ${toneCls.wrap}`}>
          <Icon size={16} weight="fill" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="font-mono font-semibold uppercase tracking-[0.08em] text-ppc-purple-500">
              {agent}
            </span>
            <span className="text-ppc-neutral-300">·</span>
            <span className="text-ppc-neutral-500">{project}</span>
          </div>
          <div className="mt-1.5 text-[15px] font-medium leading-snug tracking-tight text-ppc-black">
            {finding}
          </div>
          <div className={`mt-1.5 text-[12.5px] font-semibold ${toneCls.wrap}`}>
            {impact}
          </div>
        </div>
        <div className="inline-flex shrink-0 items-center gap-1.5 self-center rounded-pill border border-ppc-neutral-200 bg-white px-3.5 py-1.5 text-[12.5px] font-semibold text-ppc-black group-hover:border-ppc-purple-300 group-hover:text-ppc-purple-500">
          {cta} <ArrowRight size={12} weight="bold" />
        </div>
      </Link>
    </li>
  );
}

function RunningRow({
  agent, project, stage, elapsed, href,
}: {
  agent: string; project: string; stage: string; elapsed: string; href: string;
}) {
  return (
    <li>
      <Link
        to={href}
        className="group flex items-center gap-5 px-6 py-4 hover:bg-ppc-purple-50/30"
      >
        <span className="ppcio-live-dot inline-block h-2 w-2 shrink-0 rounded-full bg-ppc-purple-500" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[11px]">
            <span className="font-mono font-semibold uppercase tracking-[0.08em] text-ppc-purple-500">
              {agent}
            </span>
            <span className="text-ppc-neutral-300">·</span>
            <span className="text-ppc-neutral-500">{project}</span>
          </div>
          <div className="mt-1 truncate text-[14.5px] font-medium tracking-tight text-ppc-black">
            {stage}
          </div>
        </div>
        <span className="tabular hidden text-[12.5px] font-medium text-ppc-neutral-500 sm:block">
          {elapsed}
        </span>
        <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-ppc-purple-500 group-hover:gap-2 transition-[gap]">
          <Lightning size={12} weight="fill" /> Watch
        </span>
      </Link>
    </li>
  );
}
