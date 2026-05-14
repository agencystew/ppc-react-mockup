import { Link } from 'react-router-dom';
import { CaretRight, Sparkle } from '@phosphor-icons/react';
import { PROJECTS, ACCOUNTS } from '../mock/projects';
import { AGENTS } from '../mock/agents';
import { RECENT_RUNS_SUMMARY } from '../mock/runs';

// Dashboard · /
//
// v5 home — "What do you wanna work on?"
// Source artifact: docs/design-system/v5-source-artifacts/04-home-dashboard.html
//
//   1 · Greeting strip       Morning, Stewy · THU · 14 MAY
//   2 · Black hero card      Giant question + chat input + 6 specialist chips
//                            (+ "All N →" purple chip linking to /agents)
//   3 · Your accounts panel  2×2 grid of client cards with status dots
//   4 · While you were away  Mixed feed of completed + live runs

const TODAY = 'THU · 14 MAY';

// Quick-action chips — six headline specialists. Emojis match the v5 source
// artifact (intentionally distinct from the mock-agent emojis on /agents).
const QUICK_CHIPS: { slug: string; emoji: string; label: string }[] = [
  { slug: 'competitor-spy',     emoji: '🕵️',  label: 'Spy on competitors' },
  { slug: 'negative-keyword',   emoji: '🧹',  label: 'Mine negatives' },
  { slug: 'deep-account-audit', emoji: '📊',  label: 'Audit an account' },
  { slug: 'pmax',               emoji: '🎯',  label: 'Tune PMAX' },
  { slug: 'ad-copy',            emoji: '✍️',  label: 'Write copy' },
  { slug: 'shopping-feed',      emoji: '🛒',  label: 'Audit shopping feed' },
];

// Per-project home-dashboard meta. Kept local to the dashboard so the canonical
// PROJECTS mock stays minimal. Avatar bg uses the same color rhythm as the v5
// source artifact (green / orange / blue / purple).
const ACCOUNT_META: Record<string, { industry: string; spend: string; bg: string }> = {
  'smith-law':   { industry: 'Personal Injury', spend: '$34k/mo', bg: '#5DCAA5' },
  'clear-skies': { industry: 'Home Services',   spend: '$12k/mo', bg: '#F0997B' },
  'northstar':   { industry: 'Dental',          spend: '$68k/mo', bg: '#378ADD' },
  'lemon-leaf':  { industry: 'D2C Sleep',       spend: '$42k/mo', bg: '#534AB7' },
  'rocket-pet':  { industry: 'Pet Insurance',   spend: '$28k/mo', bg: '#E24B4A' },
  'ironclad':    { industry: 'Home Services',   spend: '$18k/mo', bg: '#BA7517' },
};

// One live run for the bottom of the "While you were away" stream.
const LIVE_RUN = {
  runId: 'run-deep-account-audit-northstar',
  agentName: 'Account Audit',
  emoji: '📊',
  projectName: 'Northstar Dental',
  stageCurrent: 8,
  stageTotal: 12,
  stageDescription: 'Currently auditing PMAX asset groups',
};

export function Dashboard() {
  const visibleAccounts = PROJECTS.slice(0, 4);

  return (
    <div className="space-y-4">
      {/* ═══ 1 · GREETING STRIP ════════════════════════════════════════════ */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="grid h-[22px] w-[22px] place-items-center rounded-[5px] bg-ppc-purple-500 text-[10px] font-semibold text-white">
            io
          </span>
          <span className="text-[13px] text-ppc-text-muted">Morning, Stewy</span>
        </div>
        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-ppc-text-muted">
          {TODAY}
        </span>
      </div>

      {/* ═══ 2 · BLACK HERO ═══════════════════════════════════════════════
          The "moment" that anchors the home view. Pure black (not the
          ppc-sidebar tint) per source artifact. Two radial purple glows. */}
      <section className="relative overflow-hidden rounded-[18px] bg-black px-10 pt-16 pb-12 sm:px-12">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-32 h-[440px] w-[440px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(127,90,240,0.28) 0%, transparent 60%)' }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 left-[15%] h-[260px] w-[260px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(127,90,240,0.08) 0%, transparent 65%)' }}
        />

        <div className="relative">
          <h1 className="font-display text-[56px] font-black leading-[0.92] tracking-[-0.035em] text-white sm:text-[72px]">
            What do you<br />wanna work on<span className="text-ppc-purple-500">?</span>
          </h1>

          <div className="mt-9 flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3.5">
            <Sparkle size={17} weight="fill" className="text-ppc-text-on-dark" />
            <span className="flex-1 text-[14px] text-white/55">Ask anything, or send a specialist in</span>
            <kbd className="rounded-[5px] border border-white/10 bg-white/[0.08] px-2 py-[3px] font-mono text-[11px] text-ppc-text-on-dark">
              ⌘K
            </kbd>
          </div>

          <div className="mt-5 flex flex-wrap gap-1.5">
            {QUICK_CHIPS.map((chip) => (
              <Link
                key={chip.slug}
                to={`/agents/${chip.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-[7px] text-[12px] text-white transition-colors hover:bg-white/[0.10]"
              >
                <span aria-hidden className="text-[13px]">{chip.emoji}</span>
                {chip.label}
              </Link>
            ))}
            <Link
              to="/agents"
              className="inline-flex items-center gap-1.5 rounded-full border border-ppc-purple-500/40 bg-ppc-purple-500/20 px-3.5 py-[7px] text-[12px] font-medium text-white transition-colors hover:bg-ppc-purple-500/30"
            >
              All {AGENTS.length} →
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ 3 · YOUR ACCOUNTS ════════════════════════════════════════════
          White card on lavender. Status dot is the v5 Surface 04 cue
          (critical / warning / healthy from --ppc-status-*). */}
      <section className="rounded-card border-[0.5px] border-ppc-card-border bg-ppc-card px-5 py-[18px]">
        <div className="mb-3.5 flex items-center justify-between">
          <h2 className="text-[16px] font-medium text-ppc-ink">
            Your accounts<span className="text-ppc-purple-500">.</span>
          </h2>
          <Link
            to="/projects"
            className="text-[12px] font-medium text-ppc-purple-500 hover:underline"
          >
            All {PROJECTS.length} →
          </Link>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2">
          {visibleAccounts.map((p) => {
            const meta = ACCOUNT_META[p.id];
            return (
              <Link
                key={p.id}
                to={`/projects/${p.id}`}
                className="flex items-center gap-2.5 rounded-[10px] border-[0.5px] border-ppc-canvas px-3.5 py-3 transition-colors hover:border-ppc-purple-300"
              >
                <span
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-[8px] text-[13px] font-medium text-white"
                  style={{ background: meta?.bg ?? '#7F5AF0' }}
                >
                  {p.name.charAt(0)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-medium text-ppc-ink">{p.name}</div>
                  <div className="truncate text-[11px] text-ppc-text-muted">
                    {meta?.industry ?? p.industry} · {meta?.spend ?? '—'}
                  </div>
                </div>
                <StatusDot health={projectHealth(p.id)} />
              </Link>
            );
          })}
        </div>
      </section>

      {/* ═══ 4 · WHILE YOU WERE AWAY ══════════════════════════════════════
          Mixed feed: completed runs (from RECENT_RUNS_SUMMARY) + one live
          run pinned at the bottom. Watch-live is the only purple in-row. */}
      <section className="overflow-hidden rounded-card border-[0.5px] border-ppc-card-border bg-ppc-card">
        <div className="flex items-center justify-between border-b-[0.5px] border-ppc-canvas px-5 py-4">
          <h2 className="text-[16px] font-medium text-ppc-ink">
            While you were away<span className="text-ppc-purple-500">.</span>
          </h2>
          <Link
            to="/runs"
            className="text-[12px] font-medium text-ppc-purple-500 hover:underline"
          >
            See all →
          </Link>
        </div>

        {RECENT_RUNS_SUMMARY.slice(0, 2).map((r) => (
          <CompletedRow key={r.runId} run={r} />
        ))}
        <LiveRow run={LIVE_RUN} />
      </section>
    </div>
  );
}

// ─── Atoms ───────────────────────────────────────────────────────────────

function StatusDot({ health }: { health: 'good' | 'warning' | 'attention' }) {
  const bg =
    health === 'attention' ? 'bg-ppc-status-critical'
  : health === 'warning'   ? 'bg-ppc-status-warning'
  : 'bg-ppc-status-healthy';
  return <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${bg}`} />;
}

function projectHealth(projectId: string): 'good' | 'warning' | 'attention' {
  const accounts = ACCOUNTS.filter((a) => a.projectId === projectId);
  if (accounts.some((a) => a.health === 'attention')) return 'attention';
  if (accounts.some((a) => a.health === 'warning'))   return 'warning';
  return 'good';
}

function CompletedRow({ run }: { run: typeof RECENT_RUNS_SUMMARY[number] }) {
  const agent = AGENTS.find((a) => a.name === run.agentName);
  return (
    <Link
      to={`/reports/${run.runId}`}
      className="group flex items-center gap-3.5 border-b-[0.5px] border-ppc-canvas px-5 py-3.5 transition-colors hover:bg-ppc-canvas/50 last:border-b-0"
    >
      <span aria-hidden className="text-[22px] leading-none">{agent?.emoji ?? '✨'}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] text-ppc-ink">
          <span className="font-medium">{run.agentName}</span> wrapped on {run.projectName}
        </p>
        <p className="mt-0.5 truncate text-[12px] text-ppc-text-muted">{run.headline}</p>
      </div>
      <span className="hidden text-[11px] text-ppc-text-muted sm:inline">{run.finishedAt}</span>
      <CaretRight size={14} weight="bold" className="text-ppc-text-faint" />
    </Link>
  );
}

function LiveRow({ run }: { run: typeof LIVE_RUN }) {
  return (
    <Link
      to={`/agents/competitor-spy/run/${run.runId}`}
      className="group flex items-center gap-3.5 px-5 py-3.5 transition-colors hover:bg-ppc-canvas/50"
    >
      <span aria-hidden className="text-[22px] leading-none">{run.emoji}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] text-ppc-ink">
          <span className="font-medium">{run.agentName}</span> running on {run.projectName} · stage {run.stageCurrent} of {run.stageTotal}
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 truncate text-[12px] text-ppc-text-muted">
          <span className="ppcio-live-dot inline-block h-[5px] w-[5px] rounded-full bg-ppc-status-healthy" />
          {run.stageDescription}
        </p>
      </div>
      <span className="text-[11px] font-medium text-ppc-purple-500">Watch live</span>
      <CaretRight size={14} weight="bold" className="text-ppc-text-faint" />
    </Link>
  );
}
