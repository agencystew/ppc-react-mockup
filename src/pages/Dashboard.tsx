import { Link } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, Clock, Sparkle, TrendUp, Warning,
  CheckCircle, Lightning, Rocket, ListBullets, FileText, Buildings,
  Check,
} from '@phosphor-icons/react';
import { AGENTS } from '../mock/agents';
import { RECENT_RUNS_SUMMARY } from '../mock/runs';
import { PROJECTS } from '../mock/projects';

// Dashboard · /
//
// The agency control room. Lifted into StagePage register so the app
// reads as one product: same 68px purple-period display, same Space
// Mono eyebrow, same editorial rhythm, same dark-canvas focal moment.
//
// Three jobs, in priority order:
//   1. Hero  — what TODAY is (date · 3 callouts · live pulse · CTA).
//   2. Calls — the three findings that need a human decision now.
//   3. Pulse — what's running and what just landed, as one stream.
// Below that, dimmer support surfaces: suggested plays + client roll.
//
// Spacing: space-y-14 between thematic groups (not 10), tighter within
// each so the page reads as ONE surface not seven disconnected cards.

export function Dashboard() {
  const featuredRun = RECENT_RUNS_SUMMARY[0]; // Competitor Spy showcase
  const otherRuns = RECENT_RUNS_SUMMARY.slice(1);
  const suggested = [
    AGENTS.find((a) => a.slug === 'weekly-audit')!,
    AGENTS.find((a) => a.slug === 'spend-leak')!,
    AGENTS.find((a) => a.slug === 'sales-intelligence')!,
  ];

  return (
    <div className="space-y-14">
      {/* ── Hero · the focal dark moment ─────────────────────────────────
          Smoky-black canvas + purple radial glow + 68px display headline
          with the signature purple-period flourish. Carries the StagePage
          register straight into the dashboard so the app reads as one
          product. Pulse strip beneath the headline shows the live state
          of the agency at a glance. */}
      <section className="ppc-dark ppc-dark--hero relative overflow-hidden rounded-3xl px-10 pb-9 pt-12 sm:px-14 sm:pb-10 sm:pt-14">
        <div className="relative">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 font-mono text-[11.5px] font-semibold uppercase tracking-[0.08em] text-white/65">
              <span>Thursday · 14 May</span>
              <span className="opacity-40">·</span>
              <span className="inline-flex items-center gap-2">
                <span className="ppcio-live-dot inline-block h-1.5 w-1.5 rounded-full bg-ppc-purple-500" />
                <span>2 agents running</span>
              </span>
            </div>
            <div className="inline-flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-white/55">
              <Buildings size={12} weight="duotone" /> 6 clients
              <span className="opacity-40">·</span>
              <span className="tabular">11 accounts</span>
            </div>
          </div>

          <h1 className="mt-6 font-display text-[60px] font-extrabold leading-[0.96] tracking-[-0.035em] text-white sm:text-[68px]">
            3 things need your eyes<span className="text-ppc-purple-500">.</span>
          </h1>
          <p className="mt-6 max-w-[560px] text-[18px] leading-[1.55] tracking-tight text-white/70">
            One spend leak burning today, two angles ready to take. Your background
            agents are still running on the rest.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              to="/agents"
              className="ppcio-cta"
            >
              <Sparkle size={16} weight="fill" />
              Run an agent
              <ArrowRight size={14} weight="bold" />
            </Link>
            <Link
              to="/runs"
              className="inline-flex items-center gap-2 rounded-md border border-white/15 px-4 py-3 text-[14px] font-semibold tracking-tight text-white transition-colors hover:bg-white/5"
            >
              Mission control <ArrowRight size={13} weight="bold" />
            </Link>
          </div>
        </div>

        {/* Pulse strip — agency vital signs anchored to the hero so the
            page never feels like a stack of disconnected cards. */}
        <div className="relative mt-12 grid grid-cols-2 gap-x-8 gap-y-5 border-t border-white/10 pt-7 sm:grid-cols-4">
          <PulseStat label="Calls to make today" value="3" tone="alert" />
          <PulseStat label="Agents running" value="2" tone="live" />
          <PulseStat label="Reports this week" value="14" />
          <PulseStat label="Hours of analysis saved" value="22h" />
        </div>
      </section>

      {/* ── Jump strip · dev shortcuts ───────────────────────────────────
          For Stewart / Mike / Jose while reviewing the mockup. Visually
          attached to the hero rather than floating: same flow, quieter
          chrome. Real users will never see this strip. */}
      <section aria-label="Dev shortcuts" className="-mt-8">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 rounded-2xl border border-ppc-purple-200 bg-white/70 px-5 py-3.5 backdrop-blur-sm">
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

      {/* ── Calls to make · the work for today ──────────────────────────
          Tighter rhythm than the rest of the page. Numbered rows on a
          single white slab so the three findings read as one decision
          surface, not three independent cards. */}
      <section>
        <SectionEyebrow eyebrow="Calls to make today" count={3} />
        <ul className="overflow-hidden rounded-2xl border border-ppc-neutral-100 bg-white">
          <AttentionRow
            num="01"
            tone="urgent"
            agent="Spend Leak Detector"
            project="Rocket Pet Insurance"
            finding="Quote form misfiring on /quote/ca, 0 conversions in 6 days while spend continues."
            impact="$3,400 burned this week"
            cta="Pause campaign"
            href="/reports/run-spend-leak-rocket"
          />
          <AttentionRow
            num="02"
            tone="opportunity"
            agent="Competitor Spy"
            project="Smith Law Group"
            finding='Unclaimed "same-day case review" angle, 3 rivals on adjacent timeline copy at 0.81% CTR.'
            impact="Build this campaign"
            cta="Draft variants"
            href="/reports/run-competitor-spy-completed"
          />
          <AttentionRow
            num="03"
            tone="opportunity"
            agent="Negative Keyword"
            project="Smith Law Group"
            finding="187 brand-safe negatives ready to deploy, blocks 24% of zero-conversion spend across 8 campaigns."
            impact="Deploy in one click"
            cta="Apply 187 negatives"
            href="/reports/run-negative-keyword-completed"
          />
        </ul>
      </section>

      {/* ── Activity stream · running + just-finished, one surface ──────
          The two used to be separate sections. Connecting them as one
          stream tells a clearer story: this is the work-in-flight + the
          freshest receipts. The featured run keeps its hero card, but
          everything else sits in one tight rail. */}
      <section>
        <SectionEyebrow
          eyebrow="The work in flight"
          right={
            <Link to="/runs" className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-ppc-purple-600 hover:underline">
              Mission control <ArrowRight size={11} weight="bold" />
            </Link>
          }
        />

        {/* Running */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-ppc-neutral-100 bg-white">
          <div className="flex items-center justify-between border-b border-ppc-neutral-100 bg-ppc-purple-50/40 px-6 py-2.5">
            <span className="inline-flex items-center gap-2 font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ppc-purple-700">
              <span className="ppcio-live-dot inline-block h-1.5 w-1.5 rounded-full bg-ppc-purple-500" />
              Running now
            </span>
            <span className="tabular text-[11.5px] font-medium text-ppc-purple-700">2</span>
          </div>
          <RunningRow
            agent="Competitor Spy"
            project="Smith Law Group"
            stage="Sizing their spend · Stage 5 of 11"
            elapsed="11m 21s"
            progress={45}
            href="/agents/competitor-spy/run/run-competitor-spy-running"
          />
          <RunningRow
            agent="Weekly Audit"
            project="Northstar Dental"
            stage="Walking the alignment chain · Stage 3 of 7"
            elapsed="4m 02s"
            progress={28}
            href="/agents/weekly-audit/run/run-weekly-audit"
          />
        </div>

        {/* Featured just-finished run — the latest report given hero treatment */}
        <Link
          to={`/reports/${featuredRun.runId}`}
          className="group block rounded-2xl border border-ppc-neutral-100 bg-white p-7 transition-all hover:border-ppc-purple-300 hover:shadow-ppc-md sm:p-9"
        >
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-ppc-success/10 px-2 py-0.5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ppc-success">
              <Check size={9} weight="bold" /> Just finished
            </span>
            <span className="font-mono font-semibold uppercase tracking-[0.08em] text-ppc-purple-600">
              {featuredRun.agentName}
            </span>
            <span className="text-ppc-neutral-300">·</span>
            <span className="text-ppc-neutral-500">{featuredRun.projectName}</span>
            <span className="text-ppc-neutral-300">·</span>
            <span className="tabular text-ppc-neutral-500">{featuredRun.finishedAt}</span>
          </div>
          <h3 className="mt-4 max-w-[720px] font-display text-[34px] font-bold leading-[1.04] tracking-[-0.025em] text-ppc-black sm:text-[38px]">
            {featuredRun.headline}
            <span className="text-ppc-purple-500">.</span>
          </h3>
          <div className="mt-5 flex flex-wrap items-center gap-x-7 gap-y-2.5 text-[13.5px]">
            <span className="inline-flex items-center gap-1.5 text-ppc-neutral-600">
              <Clock size={13} weight="duotone" className="text-ppc-neutral-400" />
              <span className="tabular font-medium text-ppc-black">{featuredRun.duration}</span>
              <span className="text-ppc-neutral-500">run</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-ppc-success">
              <TrendUp size={13} weight="bold" />
              <span className="tabular font-semibold">{featuredRun.upside}</span>
              <span className="font-normal text-ppc-neutral-500">est. upside</span>
            </span>
            <span className="ml-auto inline-flex items-center gap-1.5 text-[13px] font-semibold text-ppc-purple-600 transition-[gap] group-hover:gap-2.5">
              Open report <ArrowUpRight size={13} weight="bold" />
            </span>
          </div>
        </Link>

        {otherRuns.length > 0 && (
          <ul className="mt-3 divide-y divide-ppc-neutral-100 rounded-2xl border border-ppc-neutral-100 bg-white">
            {otherRuns.map((r) => (
              <li key={r.runId}>
                <Link
                  to={`/reports/${r.runId}`}
                  className="group flex items-center gap-5 px-6 py-3.5 hover:bg-ppc-purple-50/30"
                >
                  <span className="inline-grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full bg-ppc-success/10 text-ppc-success">
                    <Check size={10} weight="bold" />
                  </span>
                  <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ppc-purple-600 sm:w-40">
                    {r.agentName}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14.5px] font-semibold tracking-tight text-ppc-black">
                      {r.headline}
                    </div>
                    <div className="mt-0.5 text-[11.5px] text-ppc-neutral-500">
                      {r.projectName} · {r.finishedAt}
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-ppc-success">
                    <TrendUp size={11} weight="bold" />
                    <span className="tabular">{r.upside}</span>
                  </span>
                  <ArrowRight size={12} weight="bold" className="text-ppc-neutral-300 group-hover:text-ppc-purple-500" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Two-column bottom rail · plays + clients ────────────────────
          Below the fold. Suggested plays on the left, client roll on the
          right. Both are quieter than the surfaces above, which is the
          point: the eye lands on the hero + the calls + the stream first,
          then drops to these context layers. */}
      <section className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <SectionEyebrow
            eyebrow="Worth running next"
            right={
              <Link to="/agents" className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-ppc-purple-600 hover:underline">
                All agents <ArrowRight size={11} weight="bold" />
              </Link>
            }
          />
          <ul className="divide-y divide-ppc-neutral-100 rounded-2xl border border-ppc-neutral-100 bg-white">
            {suggested.map((a) => (
              <li key={a.slug}>
                <Link
                  to={`/agents/${a.slug}`}
                  className="group flex items-center gap-4 px-5 py-4 hover:bg-ppc-purple-50/30"
                >
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ppc-purple-50 text-[18px]">
                    {a.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[15px] font-bold tracking-tight text-ppc-black">
                      {a.name}
                    </div>
                    <div className="mt-0.5 truncate text-[12.5px] text-ppc-neutral-600">
                      {a.headline}
                    </div>
                  </div>
                  <div className="hidden text-right sm:block">
                    <div className="inline-flex items-center gap-1 text-[11px] font-medium tabular text-ppc-neutral-500">
                      <Clock size={11} weight="duotone" /> {a.expectedDuration}
                    </div>
                  </div>
                  <ArrowRight size={12} weight="bold" className="text-ppc-neutral-300 transition-colors group-hover:text-ppc-purple-500" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <SectionEyebrow
            eyebrow="Your clients"
            right={
              <span className="font-mono text-[11px] font-medium tabular text-ppc-neutral-500">
                6 projects · 11 accounts
              </span>
            }
          />
          <ul className="divide-y divide-ppc-neutral-100 rounded-2xl border border-ppc-neutral-100 bg-white">
            {PROJECTS.map((p) => (
              <li key={p.id}>
                <Link
                  to={`/projects/${p.id}`}
                  className="group flex items-center justify-between gap-3 px-5 py-3 hover:bg-ppc-purple-50/30"
                >
                  <div className="min-w-0">
                    <div className="truncate text-[14px] font-semibold tracking-tight text-ppc-black">
                      {p.name}
                    </div>
                    <div className="mt-0.5 truncate text-[11.5px] text-ppc-neutral-500">{p.industry}</div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-[11px]">
                    <span className="font-mono tabular text-ppc-neutral-400">
                      {p.accountCount} {p.accountCount === 1 ? 'acct' : 'accts'}
                    </span>
                    <ArrowRight size={11} weight="bold" className="text-ppc-neutral-300 transition-colors group-hover:text-ppc-purple-500" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

// ─── Inline section header · StagePage-rhythm eyebrow ─────────────────────
// Editorial label, no big H2, no heavy chrome. Just the eyebrow strip with
// an optional count or right-aligned action. Matches the SectionLabel in
// StagePage so headers across the app read at one volume.
function SectionEyebrow({
  eyebrow, count, right,
}: { eyebrow: string; count?: number; right?: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-ppc-neutral-500">
        <span>{eyebrow}</span>
        {typeof count === 'number' && (
          <span className="inline-grid h-[18px] min-w-[18px] place-items-center rounded-full bg-ppc-purple-100 px-1.5 text-[10.5px] font-bold tabular text-ppc-purple-700">
            {count}
          </span>
        )}
      </div>
      {right}
    </div>
  );
}

// ─── Pulse stat (dark hero) ───────────────────────────────────────────────
// Inline vital sign in the hero pulse strip. Big tabular number + tiny
// label. Optional alert/live tone for the orange + purple variants.
function PulseStat({
  value, label, tone,
}: { value: string; label: string; tone?: 'alert' | 'live' }) {
  const dot = tone === 'alert'
    ? 'bg-ppc-warning shadow-[0_0_0_4px_rgba(253,176,34,0.18)]'
    : tone === 'live'
    ? 'ppcio-live-dot bg-ppc-purple-500'
    : null;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline gap-2">
        {dot && <span className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />}
        <span className="tabular font-display text-[34px] font-bold leading-none tracking-[-0.025em] text-white">
          {value}
        </span>
      </div>
      <div className="text-[12px] leading-snug tracking-tight text-white/55">{label}</div>
    </div>
  );
}

// ─── Jump chip · dev shortcut ─────────────────────────────────────────────
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
      className="group flex items-center gap-2.5 rounded-xl border border-ppc-neutral-100 bg-white px-3 py-1.5 transition-colors hover:border-ppc-purple-300"
    >
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-ppc-purple-50 text-ppc-purple-500">
        <Icon size={12} weight="duotone" />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-[12px] font-semibold tracking-tight text-ppc-black">
          {label}
        </span>
        <span className="text-[10px] text-ppc-neutral-500">{sub}</span>
      </span>
    </Link>
  );
}

// ─── Attention row · numbered call-to-action ──────────────────────────────
function AttentionRow({
  num, tone, agent, project, finding, impact, cta, href,
}: {
  num: string;
  tone: 'urgent' | 'opportunity';
  agent: string; project: string; finding: string; impact: string;
  cta: string; href: string;
}) {
  const toneCls = tone === 'urgent'
    ? { fg: 'text-ppc-error', icon: Warning,      bg: 'bg-ppc-error/10' }
    : { fg: 'text-ppc-success', icon: CheckCircle, bg: 'bg-ppc-success/10' };
  const Icon = toneCls.icon;
  return (
    <li className="border-b border-ppc-neutral-100 last:border-b-0">
      <Link
        to={href}
        className="group flex items-start gap-5 px-6 py-5 hover:bg-ppc-purple-50/30"
      >
        <div className="mt-0.5 flex items-center gap-3 shrink-0">
          <span className="font-mono text-[12px] font-semibold tabular text-ppc-neutral-400">
            {num}
          </span>
          <div className={`grid h-8 w-8 place-items-center rounded-xl ${toneCls.bg} ${toneCls.fg}`}>
            <Icon size={14} weight="fill" />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-[10.5px]">
            <span className="font-mono font-semibold uppercase tracking-[0.08em] text-ppc-purple-600">
              {agent}
            </span>
            <span className="text-ppc-neutral-300">·</span>
            <span className="text-ppc-neutral-500">{project}</span>
          </div>
          <div className="mt-1.5 text-[15px] font-medium leading-snug tracking-tight text-ppc-black">
            {finding}
          </div>
          <div className={`mt-1.5 inline-flex items-center gap-1.5 text-[12px] font-semibold ${toneCls.fg}`}>
            {tone === 'urgent'
              ? <span className="text-[13px] leading-none">↓</span>
              : <TrendUp size={11} weight="bold" />}
            {impact}
          </div>
        </div>
        <div className="inline-flex shrink-0 items-center gap-1.5 self-center rounded-pill border border-ppc-neutral-200 bg-white px-3.5 py-1.5 text-[12.5px] font-semibold text-ppc-black transition-colors group-hover:border-ppc-purple-300 group-hover:text-ppc-purple-600">
          {cta} <ArrowRight size={12} weight="bold" />
        </div>
      </Link>
    </li>
  );
}

// ─── Running row · live agent with inline progress ────────────────────────
// Adds a thin shimmer-bar at the bottom of each row so a glance shows
// where each agent is in its run. Keeps the StagePage live-pulse muscle.
function RunningRow({
  agent, project, stage, elapsed, progress, href,
}: {
  agent: string; project: string; stage: string; elapsed: string;
  progress: number; href: string;
}) {
  return (
    <Link
      to={href}
      className="group relative block border-b border-ppc-neutral-100 px-6 py-4 last:border-b-0 hover:bg-ppc-purple-50/30"
    >
      <div className="flex items-center gap-5">
        <span className="ppcio-live-dot inline-block h-2 w-2 shrink-0 rounded-full bg-ppc-purple-500" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[10.5px]">
            <span className="font-mono font-semibold uppercase tracking-[0.08em] text-ppc-purple-600">
              {agent}
            </span>
            <span className="text-ppc-neutral-300">·</span>
            <span className="text-ppc-neutral-500">{project}</span>
          </div>
          <div className="mt-1 truncate text-[14.5px] font-medium tracking-tight text-ppc-black">
            {stage}
          </div>
        </div>
        <span className="tabular hidden text-[12px] font-medium text-ppc-neutral-500 sm:block">
          {elapsed}
        </span>
        <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-ppc-purple-600 transition-[gap] group-hover:gap-2">
          <Lightning size={12} weight="fill" /> Watch
        </span>
      </div>
      {/* Inline progress shimmer — narrow, sits flush with the row bottom */}
      <div className="absolute inset-x-6 -bottom-px h-px overflow-hidden bg-ppc-purple-100/60">
        <div
          className="ppcio-live-bar h-full"
          style={{ width: `${progress}%` }}
        />
      </div>
    </Link>
  );
}
