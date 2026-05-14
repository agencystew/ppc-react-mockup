import { useMemo } from 'react';
import { Link, NavLink, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowUp, ArrowRight, CaretDown, CaretRight, ChatCircle,
  Coins, DotsThree, Folder, Lightning, MagnifyingGlass,
  NotePencil, Pulse, Robot, ShareNetwork, Sparkle, TrendUp,
  CalendarBlank,
} from '@phosphor-icons/react';
import {
  CHAT_HISTORY, SPECIALIST_CHIPS, STARTER_PROMPTS, findChatThread,
} from '../mock/chats';
import { AGENTS } from '../mock/agents';
import type {
  ChatActionChip, ChatChart, ChatMessage, ChatRunningCard, ChatThread, StarterPrompt,
} from '../mock/chats';

// /chat       — pre-chat (empty state, dark hero)
// /chat/:id   — active chat (conversation playback)
//
// The chat surface ships its own inner left rail (CHAT_HISTORY list). The
// main AppShell sidebar still rides on the far left, so the user sees:
//
//   [ dark app sidebar ] [ inner chat-history rail ] [ chat surface ]
//
// Layout breaks out of the AppShell's 1240px cap via the /chat full-width
// branch in AppShell.tsx.

export function Chat() {
  const { chatId } = useParams<{ chatId?: string }>();
  const activeThread = findChatThread(chatId);

  return (
    <div className="flex min-h-[calc(100vh-0px)] w-full">
      <ChatHistoryRail activeId={activeThread?.id} />
      <div className="flex min-w-0 flex-1 flex-col">
        {activeThread
          ? <ActiveChat thread={activeThread} />
          : <PreChat />
        }
      </div>
    </div>
  );
}

// ═══ INNER LEFT RAIL · chat history ═══════════════════════════════════════

function ChatHistoryRail({ activeId }: { activeId?: string }) {
  return (
    <aside className="sticky top-0 hidden h-screen w-[300px] shrink-0 flex-col border-r-[0.5px] border-ppc-card-border bg-ppc-canvas/60 backdrop-blur-sm md:flex">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-[18px]">
        <div>
          <p className="text-[15px] font-semibold tracking-[-0.01em] text-ppc-ink">
            Chats<span className="text-ppc-purple-500">.</span>
          </p>
          <p className="mt-[1px] font-mono text-[10px] uppercase tracking-[0.12em] text-ppc-text-faint">
            {CHAT_HISTORY.length} threads
          </p>
        </div>
        <NavLink
          to="/chat"
          end
          className={({ isActive }) =>
            `inline-flex items-center gap-1.5 rounded-[8px] px-3 py-[7px] text-[12px] font-medium transition-colors ${
              isActive
                ? 'bg-ppc-purple-500 text-white shadow-[0_4px_14px_-4px_rgba(127,90,240,0.55)]'
                : 'border-[0.5px] border-ppc-card-border bg-white text-ppc-ink hover:border-ppc-purple-300'
            }`
          }
          title="Start a new chat"
        >
          <NotePencil size={13} weight="bold" />
          New
        </NavLink>
      </div>

      {/* Search row */}
      <div className="flex items-center gap-2 px-4 pb-3">
        <div className="relative flex-1">
          <MagnifyingGlass
            size={13}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ppc-text-faint"
          />
          <input
            readOnly
            placeholder="Search chats"
            className="w-full cursor-pointer rounded-[8px] border-[0.5px] border-ppc-card-border bg-white py-[7px] pl-8 pr-3 text-[12.5px] text-ppc-ink outline-none placeholder:text-ppc-text-faint hover:border-ppc-purple-300"
          />
        </div>
        <button
          className="inline-flex items-center gap-1 rounded-[8px] border-[0.5px] border-ppc-card-border bg-white px-2.5 py-[7px] text-[11px] font-medium text-ppc-text-muted hover:border-ppc-purple-300"
          title="Filter by project"
        >
          <Folder size={12} weight="duotone" />
          All
          <CaretDown size={9} weight="bold" />
        </button>
      </div>

      {/* List */}
      <nav className="flex flex-1 flex-col overflow-y-auto px-3 pb-4">
        {CHAT_HISTORY.map((t) => (
          <ChatHistoryRow key={t.id} thread={t} active={t.id === activeId} />
        ))}
      </nav>

      {/* Footer hint */}
      <div className="border-t-[0.5px] border-ppc-card-border px-4 py-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-ppc-text-faint">
          Last 7 days
        </p>
      </div>
    </aside>
  );
}

function ChatHistoryRow({ thread, active }: { thread: ChatThread; active: boolean }) {
  return (
    <Link
      to={`/chat/${thread.id}`}
      className={`group flex items-start gap-2.5 rounded-[10px] px-3 py-2.5 transition-colors ${
        active
          ? 'bg-ppc-purple-100/80'
          : 'hover:bg-white'
      }`}
    >
      <span
        aria-hidden
        className="grid h-[26px] w-[26px] shrink-0 place-items-center rounded-[7px] bg-white text-[15px] leading-none shadow-[0_1px_0_rgba(15,10,30,0.04)]"
      >
        {thread.emoji}
      </span>
      <div className="min-w-0 flex-1">
        <p className={`truncate text-[12.5px] leading-tight ${
          active ? 'font-semibold text-ppc-ink' : 'font-medium text-ppc-ink'
        }`}>
          {thread.title}
        </p>
        <p className="mt-[2px] truncate text-[10.5px] text-ppc-text-muted">
          {thread.projectLabel} · {thread.relativeTime}
        </p>
      </div>
      {thread.live && (
        <span
          className="ppcio-live-dot mt-2 inline-block h-[6px] w-[6px] shrink-0 rounded-full bg-ppc-purple-500"
          aria-label="Live"
        />
      )}
    </Link>
  );
}

// ═══ PRE-CHAT STATE ═══════════════════════════════════════════════════════

function PreChat() {
  return (
    <div className="mx-auto w-full max-w-[820px] px-6 py-10 lg:px-10 lg:py-14">
      <DarkHero />

      <Section heading="Try one of these." sub="Four prompts your team asks every week.">
        <div className="grid gap-2.5 sm:grid-cols-2">
          {STARTER_PROMPTS.map((p) => (
            <StarterCard key={p.label} prompt={p} />
          ))}
        </div>
      </Section>

      <Section heading="Or send a specialist in." sub="Hand the job to one of 28 named agents.">
        <div className="flex flex-wrap gap-2">
          {SPECIALIST_CHIPS.map((c) => (
            <Link
              key={c.slug}
              to={`/agents/${c.slug}`}
              className="inline-flex items-center gap-1.5 rounded-full border-[0.5px] border-ppc-card-border bg-white px-3.5 py-[7px] text-[12.5px] font-medium text-ppc-ink transition-colors hover:border-ppc-purple-300 hover:bg-ppc-purple-50"
            >
              <span aria-hidden className="text-[13px] leading-none">{c.emoji}</span>
              {c.label}
            </Link>
          ))}
          <Link
            to="/agents"
            className="inline-flex items-center gap-1.5 rounded-full bg-ppc-purple-500/12 px-3.5 py-[7px] text-[12.5px] font-medium text-ppc-purple-700 transition-colors hover:bg-ppc-purple-500/20"
          >
            All {AGENTS.length}
            <ArrowRight size={11} weight="bold" />
          </Link>
        </div>
      </Section>

      {/* Schedule affordance — the non-screenshot addition Stewart asked for. */}
      <ScheduleCard />
    </div>
  );
}

function DarkHero() {
  return (
    <section className="relative overflow-hidden rounded-[20px] bg-black px-9 pb-9 pt-14 sm:px-11 sm:pt-16">
      {/* Two radial glows — matches the home hero pattern */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-32 h-[440px] w-[440px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(127,90,240,0.28) 0%, transparent 60%)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 left-[18%] h-[260px] w-[260px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(127,90,240,0.08) 0%, transparent 65%)' }}
      />

      <div className="relative">
        <h1 className="font-display text-[52px] font-black leading-[0.94] tracking-[-0.035em] text-white sm:text-[64px]">
          What do you<br />wanna know<span className="text-ppc-purple-500">?</span>
        </h1>

        <p className="mt-5 max-w-[460px] text-[14.5px] leading-[1.55] text-white/60">
          Ask anything about your accounts. Answers come back grounded in your live data, with the working shown.
        </p>

        <ChatInput />
      </div>
    </section>
  );
}

function ChatInput() {
  return (
    <div className="mt-8 overflow-hidden rounded-[14px] border border-white/10 bg-white/[0.05] backdrop-blur-sm">
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-3.5">
        <Sparkle size={16} weight="fill" className="text-white/55" />
        <span className="flex-1 text-[14px] text-white/55">
          Ask about your campaigns, or send a specialist in
        </span>
        <kbd className="rounded-[5px] border border-white/10 bg-white/[0.08] px-2 py-[3px] font-mono text-[10.5px] text-ppc-text-on-dark">
          ⌘K
        </kbd>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-white/[0.06] px-3 py-2.5">
        <div className="flex flex-wrap gap-1.5">
          <InputChip icon={<Folder size={12} weight="duotone" />} label="All projects" />
          <InputChip icon={<Robot size={12} weight="duotone" />} label="Any specialist" />
          <InputChip
            icon={<Lightning size={12} weight="fill" className="text-ppc-purple-300" />}
            label="Run now"
            accent
          />
        </div>
        <button
          className="grid h-8 w-8 place-items-center rounded-[8px] bg-ppc-purple-500 text-white shadow-[0_4px_14px_-4px_rgba(127,90,240,0.65)] transition-transform hover:-translate-y-[1px]"
          title="Send"
        >
          <ArrowUp size={15} weight="bold" />
        </button>
      </div>
    </div>
  );
}

function InputChip({
  icon, label, accent,
}: { icon: React.ReactNode; label: string; accent?: boolean }) {
  return (
    <button
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[5px] text-[11.5px] transition-colors ${
        accent
          ? 'border-ppc-purple-500/30 bg-ppc-purple-500/[0.10] text-white hover:bg-ppc-purple-500/[0.16]'
          : 'border-white/10 bg-white/[0.04] text-ppc-text-on-dark hover:bg-white/[0.08]'
      }`}
    >
      {icon}
      <span>{label}</span>
      <CaretDown size={9} weight="bold" className="opacity-70" />
    </button>
  );
}

function Section({
  heading, sub, children,
}: { heading: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2 className="text-[15px] font-semibold tracking-[-0.005em] text-ppc-ink">
          {heading.endsWith('.') ? (
            <>
              {heading.slice(0, -1)}
              <span className="text-ppc-purple-500">.</span>
            </>
          ) : heading}
        </h2>
        {sub && <p className="text-[11.5px] text-ppc-text-muted">{sub}</p>}
      </div>
      {children}
    </section>
  );
}

function StarterCard({ prompt }: { prompt: StarterPrompt }) {
  const Icon =
    prompt.icon === 'lightning' ? Lightning
  : prompt.icon === 'coins'     ? Coins
  : prompt.icon === 'trend'     ? TrendUp
  : Pulse;
  return (
    <button className="group flex items-center gap-3 rounded-[12px] border-[0.5px] border-ppc-card-border bg-white px-3.5 py-[14px] text-left transition-colors hover:border-ppc-purple-300 hover:bg-ppc-purple-50/40">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-[8px] bg-ppc-panel-soft text-ppc-purple-700 transition-colors group-hover:bg-ppc-purple-200/60">
        <Icon size={14} weight="fill" />
      </span>
      <span className="flex-1 text-[13px] font-medium leading-snug text-ppc-ink">
        {prompt.label}
      </span>
      <ArrowRight size={12} weight="bold" className="text-ppc-text-faint transition-colors group-hover:text-ppc-purple-500" />
    </button>
  );
}

function ScheduleCard() {
  return (
    <section className="mt-10">
      <Link
        to="/agents"
        className="group flex items-center gap-4 overflow-hidden rounded-[14px] border-[0.5px] border-ppc-card-border bg-white px-5 py-[18px] transition-colors hover:border-ppc-purple-300 hover:bg-ppc-purple-50/40"
      >
        <span className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-[10px] bg-ppc-ink text-white">
          <div
            aria-hidden
            className="absolute inset-0"
            style={{ background: 'radial-gradient(circle at 70% 25%, rgba(127,90,240,0.55) 0%, transparent 60%)' }}
          />
          <CalendarBlank size={20} weight="duotone" className="relative text-ppc-purple-200" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-[13.5px] font-semibold text-ppc-ink">
              Or schedule agents to run for you<span className="text-ppc-purple-500">.</span>
            </p>
            <span className="rounded-[4px] bg-ppc-panel-soft px-1.5 py-[2px] font-mono text-[9.5px] font-semibold uppercase tracking-[0.1em] text-ppc-purple-700">
              New
            </span>
          </div>
          <p className="mt-0.5 text-[12px] leading-snug text-ppc-text-muted">
            Set a routine. Account Audit every Monday, Negative Keywords every Friday, Competitor Spy monthly. Wake up to reports.
          </p>
        </div>
        <ArrowRight size={14} weight="bold" className="text-ppc-text-faint transition-colors group-hover:text-ppc-purple-500" />
      </Link>
    </section>
  );
}

// ═══ ACTIVE CHAT ══════════════════════════════════════════════════════════

function ActiveChat({ thread }: { thread: ChatThread }) {
  return (
    <div className="flex min-h-screen flex-col">
      <ActiveChatHeader thread={thread} />
      <div className="flex-1 overflow-y-auto px-6 pb-40 pt-6 lg:px-10">
        <div className="mx-auto w-full max-w-[780px] space-y-7">
          {thread.messages.length === 0
            ? <EmptyThreadHint thread={thread} />
            : thread.messages.map((m) => (
                <MessageRow key={m.id} message={m} />
              ))
          }
        </div>
      </div>
      <ReplyDock thread={thread} />
    </div>
  );
}

function ActiveChatHeader({ thread }: { thread: ChatThread }) {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-10 border-b-[0.5px] border-ppc-card-border bg-ppc-canvas/85 px-6 py-3.5 backdrop-blur-md lg:px-10">
      <div className="mx-auto flex w-full max-w-[780px] items-center gap-3">
        <button
          onClick={() => navigate('/chat')}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-[8px] border-[0.5px] border-ppc-card-border bg-white text-ppc-text-muted transition-colors hover:border-ppc-purple-300 hover:text-ppc-purple-500 md:hidden"
          title="Back to chats"
        >
          <CaretRight size={14} weight="bold" className="rotate-180" />
        </button>
        <span
          aria-hidden
          className="grid h-8 w-8 shrink-0 place-items-center rounded-[7px] text-[12px] font-semibold text-white"
          style={{ background: thread.monogramBg }}
        >
          {thread.monogram}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13.5px] font-medium leading-tight text-ppc-ink">
            {thread.title}
          </p>
          <p className="mt-[1px] truncate text-[11px] text-ppc-text-muted">
            {thread.projectLabel} · <span className="font-mono tracking-[0.04em]">{thread.model}</span>
          </p>
        </div>
        <button
          title="Share thread"
          className="grid h-8 w-8 place-items-center rounded-[8px] border-[0.5px] border-ppc-card-border bg-white text-ppc-text-muted transition-colors hover:border-ppc-purple-300 hover:text-ppc-purple-500"
        >
          <ShareNetwork size={13} weight="duotone" />
        </button>
        <button
          title="More"
          className="grid h-8 w-8 place-items-center rounded-[8px] border-[0.5px] border-ppc-card-border bg-white text-ppc-text-muted transition-colors hover:border-ppc-purple-300 hover:text-ppc-purple-500"
        >
          <DotsThree size={14} weight="bold" />
        </button>
      </div>
    </header>
  );
}

function EmptyThreadHint({ thread }: { thread: ChatThread }) {
  return (
    <div className="flex flex-col items-center pt-16 text-center">
      <span
        aria-hidden
        className="grid h-14 w-14 place-items-center rounded-[14px] bg-white text-[28px] leading-none shadow-[0_1px_0_rgba(15,10,30,0.04)]"
      >
        {thread.emoji}
      </span>
      <p className="mt-5 text-[20px] font-semibold tracking-[-0.012em] text-ppc-ink">
        Pick up where you left off<span className="text-ppc-purple-500">.</span>
      </p>
      <p className="mt-2 max-w-[420px] text-[13px] leading-[1.6] text-ppc-text-muted">
        This thread is anchored to <span className="font-medium text-ppc-ink">{thread.projectLabel}</span>. Ask anything, or hand it to a specialist.
      </p>
    </div>
  );
}

function MessageRow({ message }: { message: ChatMessage }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[78%] rounded-[16px] rounded-tr-[6px] border-[0.5px] border-ppc-purple-500/22 bg-ppc-purple-500/14 px-4 py-2.5">
          <p className="text-[13.5px] leading-[1.55] text-ppc-ink">{message.body}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-3">
      <span
        aria-hidden
        className="grid h-7 w-7 shrink-0 place-items-center rounded-[7px] bg-ppc-purple-500 text-[10.5px] font-bold text-white shadow-[0_4px_14px_-4px_rgba(127,90,240,0.55)]"
      >
        io
      </span>
      <div className="min-w-0 flex-1 pt-px">
        {message.body && (
          <p className="text-[14px] leading-[1.65] text-ppc-ink">
            {renderInlineMarkdown(message.body)}
          </p>
        )}

        {message.bullets && (
          <ul className="mt-3 flex flex-col gap-2.5">
            {message.bullets.map((b, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-[9px] h-[5px] w-[5px] shrink-0 rounded-full bg-ppc-purple-700" />
                <p className="text-[13px] leading-[1.6] text-ppc-ink">
                  <span className="font-semibold">{b.lead}</span> {b.rest}
                </p>
              </li>
            ))}
          </ul>
        )}

        {message.chart && (
          <div className="mt-4">
            <ChartCard chart={message.chart} />
          </div>
        )}

        {message.followUp && (
          <p className="mt-4 text-[14px] leading-[1.65] text-ppc-ink">{message.followUp}</p>
        )}

        {message.chips && (
          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {message.chips.map((c, i) => (
              <FollowUpChip key={i} chip={c} />
            ))}
          </div>
        )}

        {message.running && (
          <div className="mt-4">
            <InlineRunningCard run={message.running} />
          </div>
        )}
      </div>
    </div>
  );
}

function renderInlineMarkdown(text: string): React.ReactNode {
  // Lightweight **bold** parser. Handles a single pair per substring.
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**')
      ? <span key={i} className="font-semibold">{p.slice(2, -2)}</span>
      : <span key={i}>{p}</span>
  );
}

function ChartCard({ chart }: { chart: ChatChart }) {
  const maxValue = useMemo(() => Math.max(...chart.bars.map((b) => b.value)) || 100, [chart.bars]);
  return (
    <div className="rounded-[12px] border-[0.5px] border-ppc-card-border bg-white px-5 py-4">
      <div className="mb-3.5 flex items-baseline justify-between">
        <p className="text-[12px] font-semibold tracking-[-0.005em] text-ppc-ink">{chart.label}</p>
        <p className="font-mono text-[11px] tabular-nums text-ppc-status-critical">{chart.delta}</p>
      </div>
      <div className="flex h-[64px] items-end gap-1">
        {chart.bars.map((b, i) => {
          const heightPct = Math.max(8, (b.value / maxValue) * 100);
          return (
            <div
              key={i}
              className={`flex-1 rounded-t-[2px] ${b.spike ? 'bg-ppc-status-critical' : 'bg-ppc-panel-soft'}`}
              style={{ height: `${heightPct}%` }}
            />
          );
        })}
      </div>
      <div className="mt-2 flex justify-between font-mono text-[10px] tabular-nums text-ppc-text-faint">
        <span>{chart.axisLeft}</span>
        <span>{chart.axisRight}</span>
      </div>
    </div>
  );
}

function FollowUpChip({ chip }: { chip: ChatActionChip }) {
  const schedule = chip.variant === 'schedule';
  return (
    <button
      className={`inline-flex items-center gap-1.5 rounded-full border-[0.5px] px-3 py-[7px] text-[12px] font-medium transition-colors ${
        schedule
          ? 'border-ppc-purple-500/35 bg-ppc-purple-500/10 text-ppc-purple-700 hover:bg-ppc-purple-500/16'
          : 'border-ppc-card-border bg-white text-ppc-ink hover:border-ppc-purple-300 hover:bg-ppc-purple-50/60'
      }`}
    >
      <span aria-hidden className="text-[13px] leading-none">{chip.emoji}</span>
      {chip.label}
      {schedule && (
        <ArrowRight size={10} weight="bold" className="opacity-80" />
      )}
    </button>
  );
}

function InlineRunningCard({ run }: { run: ChatRunningCard }) {
  return (
    <div className="relative overflow-hidden rounded-[14px] bg-ppc-ink px-5 py-[18px]">
      {/* Top-right radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 h-[200px] w-[200px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(127,90,240,0.32) 0%, transparent 65%)' }}
      />

      <div className="relative flex items-start gap-3">
        <span
          aria-hidden
          className="grid h-9 w-9 shrink-0 place-items-center rounded-[9px] bg-white/8 text-[20px] leading-none"
        >
          {run.agentEmoji}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-[14px] font-semibold tracking-[-0.005em] text-white">{run.agentName}</p>
            <span className="ppcio-live-dot inline-block h-[6px] w-[6px] rounded-full bg-ppc-status-healthy" />
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ppc-text-on-dark">Running</span>
          </div>
          <p className="mt-[3px] truncate text-[12px] text-white/60">{run.description}</p>
        </div>
        <span className="hidden font-mono text-[11px] tabular-nums text-ppc-text-on-dark sm:inline">
          {run.elapsed}
        </span>
      </div>

      <div className="relative mt-3.5 h-[3px] w-full overflow-hidden rounded-full bg-ppc-purple-500/18">
        <div
          className="ppcio-live-bar absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${run.progressPct}%` }}
        />
      </div>

      <div className="relative mt-3 flex items-center justify-between gap-3">
        <p className="text-[11.5px] text-white/55">
          Stage {run.stageCurrent} of {run.stageTotal} · {run.stageDescription}
        </p>
        <Link
          to="/agents/competitor-spy/loading/run-competitor-spy-running"
          className="inline-flex items-center gap-1 text-[11.5px] font-medium text-ppc-purple-300 transition-colors hover:text-white"
        >
          Watch live <ArrowRight size={11} weight="bold" />
        </Link>
      </div>
    </div>
  );
}

// ─── Sticky reply input pinned at the bottom of the active chat ───────────

function ReplyDock({ thread }: { thread: ChatThread }) {
  return (
    <div className="sticky bottom-0 border-t-[0.5px] border-ppc-card-border bg-ppc-canvas/85 px-6 pb-6 pt-4 backdrop-blur-md lg:px-10">
      <div className="mx-auto w-full max-w-[780px]">
        <div className="overflow-hidden rounded-[14px] border-[0.5px] border-ppc-card-border bg-white">
          <div className="flex items-center gap-2.5 px-4 pt-3.5 pb-3">
            <Sparkle size={15} weight="fill" className="text-ppc-purple-500" />
            <span className="flex-1 text-[13.5px] text-ppc-text-faint">
              Reply or ask something else
            </span>
            <kbd className="rounded-[5px] border-[0.5px] border-ppc-card-border bg-ppc-canvas px-2 py-[3px] font-mono text-[10.5px] text-ppc-text-muted">
              ⌘↵
            </kbd>
          </div>
          <div className="flex items-center justify-between gap-2 border-t-[0.5px] border-ppc-canvas px-3 py-2">
            <div className="flex flex-wrap gap-1.5">
              <ReplyChip
                icon={<Folder size={11} weight="duotone" />}
                label={thread.projectLabel}
              />
              <ReplyChip
                icon={<Robot size={11} weight="duotone" />}
                label="General"
              />
              <ReplyChip
                icon={<CalendarBlank size={11} weight="duotone" />}
                label="Schedule"
                accent
              />
            </div>
            <button
              className="grid h-7 w-7 place-items-center rounded-[7px] bg-ppc-purple-500 text-white shadow-[0_4px_14px_-4px_rgba(127,90,240,0.55)] transition-transform hover:-translate-y-[1px]"
              title="Send"
            >
              <ArrowUp size={13} weight="bold" />
            </button>
          </div>
        </div>
        <p className="mt-2 text-center text-[10.5px] text-ppc-text-faint">
          <ChatCircle size={10} weight="duotone" className="-mt-px mr-1 inline" />
          Answers are grounded in your Google Ads + GA4 data. Verify before changing budgets.
        </p>
      </div>
    </div>
  );
}

function ReplyChip({
  icon, label, accent,
}: { icon: React.ReactNode; label: string; accent?: boolean }) {
  return (
    <button
      className={`inline-flex items-center gap-1.5 rounded-full border-[0.5px] px-2.5 py-[5px] text-[11.5px] transition-colors ${
        accent
          ? 'border-ppc-purple-500/30 bg-ppc-purple-500/10 text-ppc-purple-700 hover:bg-ppc-purple-500/16'
          : 'border-ppc-card-border bg-ppc-canvas text-ppc-text-muted hover:border-ppc-purple-300 hover:text-ppc-ink'
      }`}
    >
      {icon}
      <span>{label}</span>
      <CaretDown size={9} weight="bold" className="opacity-70" />
    </button>
  );
}
