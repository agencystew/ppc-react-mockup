import { useMemo, useState } from 'react';
import { Link, NavLink, useParams } from 'react-router-dom';
import {
  ArrowUp, ArrowRight, CaretDown, ChatCircle,
  DotsThree, MagnifyingGlass, NotePencil, Robot, Sparkle, TrendUp,
  ChartBar, Coins, Users, Info, Plus,
  CalendarBlank, Brain, ClockCounterClockwise, ShieldCheck,
} from '@phosphor-icons/react';
import { CHAT_HISTORY, SPECIALIST_CHIPS, findChatThread } from '../mock/chats';
import type {
  ChatActionChip, ChatChart, ChatFactorsCard, ChatMessage,
  ChatRunningCard, ChatThread,
} from '../mock/chats';
import { PROJECTS, CURRENT_PROJECT_ID } from '../mock/projects';
import { AGENTS } from '../mock/agents';

/* /chat       — pre-chat hero (project pill · "Ask anything…" · explore grid)
 * /chat/:id   — active conversation (single focused column, no inner rail)
 *
 * Active-chat surface is a centered editorial column ≤680px wide:
 *
 *     [ Header: < Back · centered title · ⋯ ]
 *     [ User bubble · right-aligned · lavender wash ]
 *     [ AI message · "io" avatar · body · nested chart card ·
 *       bullets · nested factors card · action chips ]
 *     [ White reply dock · + · grow · purple send ]
 *     [ "Answers are grounded in your Google Ads + GA4 data." ]
 *
 * Same v5 hand as Dashboard / Project / AgentCatalog: lavender canvas,
 * white cards w/ 0.5px ppc-card-border, Figtree body, Courier mono for
 * data, single italic purple period as the title accent. The chat surface
 * is intentionally restrained — the only "moment" of colour tension is
 * the red spike bar in the CPA chart. Reference: Stewart 2026-05-15. */

/* DO NOT add a Navigate redirect from /chat → first thread. Stewart wants
 * PreChat to render at /chat (the "Ask anything…" hero + Trust strip +
 * Popular grid + Specialist row) WITH the rail on the left. Redirect was
 * tried twice (82d2172, 45d87f9) and reverted both times. Stewart 2026-05-15:
 * "i wanted /chat to show the lovely pre chat area we built". */
export function Chat() {
  const { chatId } = useParams<{ chatId?: string }>();
  const activeThread = findChatThread(chatId);
  return (
    <div className="flex min-h-screen w-full">
      <ChatHistoryRail activeId={activeThread?.id} />
      <div className="flex min-w-0 flex-1 flex-col">
        {activeThread
          ? <ActiveChat thread={activeThread} />
          : <PreChat />}
      </div>
    </div>
  );
}

/* ═══ INNER LEFT RAIL · chat history ═══════════════════════════════════════
 *
 * Sits flush against the dark AppShell sidebar (which goes full-bleed on
 * /chat routes). White card column at 296px wide on desktop; hidden on
 * mobile (where users fall through to the in-page Recent Chats strip).
 *
 * Same v5 hand as the rest: 0.5px ppc-card-border, Figtree, Courier mono
 * timestamps, single italic purple period on the title. Active thread gets
 * a low-alpha purple wash + bold title. Live threads carry a status orb. */

function ChatHistoryRail({ activeId }: { activeId?: string }) {
  return (
    <aside
      className="sticky top-0 hidden h-screen w-[296px] shrink-0 flex-col border-r-[0.5px] border-ppc-card-border bg-white md:flex"
    >
      <div className="px-5 pt-[22px] pb-3">
        <h2 className="text-[19px] font-bold tracking-[-0.012em] text-ppc-ink">
          Chat<span className="font-serif italic text-ppc-purple-500">.</span>
        </h2>
      </div>

      <div className="px-4 pb-[14px]">
        <NavLink
          to="/chat"
          end
          className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-[10px] px-3 py-[10px] text-[13.5px] font-semibold text-white transition-transform hover:-translate-y-[0.5px]"
          style={{
            background: 'linear-gradient(180deg, #8B68F2 0%, #7F5AF0 55%, #6B47E0 100%)',
            boxShadow:
              '0 1px 0 rgba(255,255,255,0.18) inset, 0 0 0 1px rgba(127,90,240,0.55), 0 6px 18px -6px rgba(127,90,240,0.55)',
          }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 55%)',
            }}
          />
          <NotePencil size={14} weight="bold" className="relative" />
          <span className="relative">New chat</span>
        </NavLink>
      </div>

      <div className="flex items-center justify-between px-5 pb-2.5">
        <button
          type="button"
          className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-ppc-ink transition-colors hover:text-ppc-purple-700"
        >
          Recent
          <CaretDown size={10} weight="bold" className="text-ppc-text-faint" />
        </button>
        <button
          type="button"
          title="Search chats"
          className="grid h-[22px] w-[22px] place-items-center rounded-[6px] text-ppc-text-muted transition-colors hover:bg-ppc-canvas hover:text-ppc-purple-700"
        >
          <MagnifyingGlass size={12} weight="bold" />
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-[2px] overflow-y-auto px-3 pb-3">
        {CHAT_HISTORY.map((t) => (
          <ChatHistoryRow key={t.id} thread={t} active={t.id === activeId} />
        ))}
      </nav>

      <div className="border-t-[0.5px] border-ppc-card-border px-5 py-3">
        <Link
          to="/chat"
          className="inline-flex items-center gap-1 text-[12px] font-medium text-ppc-purple-700 transition-colors hover:text-ppc-purple-500"
        >
          View all chats
          <ArrowRight size={11} weight="bold" />
        </Link>
      </div>
    </aside>
  );
}

function ChatHistoryRow({ thread, active }: { thread: ChatThread; active: boolean }) {
  const avatar = avatarForLabel(thread.projectLabel);
  return (
    <Link
      to={`/chat/${thread.id}`}
      className={`group flex items-start gap-2.5 rounded-[10px] px-2.5 py-[10px] transition-colors ${
        active ? 'bg-ppc-purple-500/10' : 'hover:bg-ppc-canvas/70'
      }`}
    >
      <span className="min-w-0 flex-1">
        <p className={`line-clamp-2 text-[12.5px] leading-[1.35] tracking-[-0.003em] ${
          active ? 'font-semibold text-ppc-ink' : 'font-medium text-ppc-ink'
        }`}>
          {thread.title}
        </p>
        <span className="mt-[7px] flex items-center gap-1.5">
          <span
            aria-hidden
            className="grid h-[16px] w-[16px] shrink-0 place-items-center rounded-[4px] text-[9px] font-bold leading-none"
            style={{
              background: avatar.bg,
              color: avatar.fg,
              boxShadow: `inset 0 0 0 0.5px ${avatar.ring}`,
            }}
          >
            {thread.projectLabel.charAt(0)}
          </span>
          <span className="truncate text-[10.5px] font-medium text-ppc-text-muted">
            {thread.projectLabel}
          </span>
        </span>
      </span>
      {thread.live ? (
        <span className="ppcio-live-dot mt-[6px] inline-block h-[6px] w-[6px] shrink-0 rounded-full bg-ppc-status-healthy" />
      ) : (
        <span
          className="shrink-0 pt-[1px] text-[10px] font-medium uppercase tracking-[0.04em] text-ppc-text-faint"
          style={{ fontFamily: '"Courier New", ui-monospace, monospace' }}
        >
          {compactTime(thread.relativeTime)}
        </span>
      )}
    </Link>
  );
}

function compactTime(rel: string): string {
  switch (rel) {
    case 'just now':   return '10:24';
    case '2h ago':     return '2h';
    case 'yesterday':  return 'Tue';
    case '2 days ago': return 'Mon';
    case '3 days ago': return 'Sun';
    case 'last week':  return 'Apr 27';
    default:           return rel;
  }
}

/* ═══ PROJECT AVATAR PALETTE ═══════════════════════════════════════════════
 *
 * Reused for the history-row letter chip + the top-bar project selector +
 * the active-chat header monogram. Mirrors the Dashboard's PROJECT_META
 * avatar fills so the same project reads as the same colour everywhere.
 * Threads whose projectLabel doesn't map (Smith Law, Mason & Co. …) fall
 * back to the neutral lavender wash. */

interface AvatarToken { bg: string; ring: string; fg: string; }

const PROJECT_AVATARS: Record<string, AvatarToken> = {
  'boulder-care':       { bg: 'linear-gradient(155deg, #5DCAA5 0%, #10A36C 100%)', ring: 'rgba(16,163,108,0.32)',  fg: '#fff' },
  'the-hoth':           { bg: 'linear-gradient(155deg, #F87171 0%, #DC2626 100%)', ring: 'rgba(220,38,38,0.32)',   fg: '#fff' },
  'durable':            { bg: 'linear-gradient(155deg, #2DD4BF 0%, #0E9488 100%)', ring: 'rgba(14,148,136,0.32)',  fg: '#fff' },
  'linkbuilder':        { bg: 'linear-gradient(155deg, #86EFAC 0%, #16A34A 100%)', ring: 'rgba(22,163,74,0.32)',   fg: '#fff' },
  'livingyoung':        { bg: 'linear-gradient(155deg, #A88CFF 0%, #7F5AF0 100%)', ring: 'rgba(127,90,240,0.32)',  fg: '#fff' },
  'authority-builders': { bg: 'linear-gradient(155deg, #FB923C 0%, #EA580C 100%)', ring: 'rgba(234,88,12,0.32)',   fg: '#fff' },
  'edwin-novel':        { bg: 'linear-gradient(155deg, #E879F9 0%, #A21CAF 100%)', ring: 'rgba(162,28,175,0.32)',  fg: '#fff' },
  'flock':              { bg: 'linear-gradient(155deg, #38BDF8 0%, #0284C7 100%)', ring: 'rgba(2,132,199,0.32)',   fg: '#fff' },
};

const NEUTRAL_AVATAR: AvatarToken = {
  bg:   'linear-gradient(155deg, #EEEDFE 0%, #D3C6FF 100%)',
  ring: 'rgba(127,90,240,0.18)',
  fg:   '#534AB7',
};

function avatarForId(id: string | undefined): AvatarToken {
  if (!id) return NEUTRAL_AVATAR;
  return PROJECT_AVATARS[id] ?? NEUTRAL_AVATAR;
}

function avatarForLabel(label: string): AvatarToken {
  const project = PROJECTS.find((p) => p.name === label);
  if (!project) return NEUTRAL_AVATAR;
  return PROJECT_AVATARS[project.id] ?? NEUTRAL_AVATAR;
}

/* ═══ PRE-CHAT STATE ═══════════════════════════════════════════════════════ */

function PreChat() {
  const [projectId, setProjectId] = useState<string>(CURRENT_PROJECT_ID);
  const project = PROJECTS.find((p) => p.id === projectId) ?? PROJECTS[0];

  return (
    <div className="relative flex min-h-screen flex-col">
      <TopBar project={project} onChangeProject={setProjectId} />

      <div className="mx-auto w-full max-w-[860px] flex-1 px-6 pb-20 pt-10 lg:px-10 lg:pt-14">
        <Hero project={project} />

        <TrustStrip />

        <PopularGrid />

        <SpecialistRow />
      </div>
    </div>
  );
}

/* ─── Top bar: project selector (left) + "How Chat works" (right) ───────── */

function TopBar({
  project, onChangeProject,
}: {
  project: typeof PROJECTS[number];
  onChangeProject: (id: string) => void;
}) {
  return (
    <header className="sticky top-0 z-10 border-b-[0.5px] border-ppc-card-border bg-ppc-canvas/85 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[860px] items-center justify-between px-6 py-3.5 lg:px-10">
        <ProjectSelector project={project} onChange={onChangeProject} />
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full border-[0.5px] border-ppc-card-border bg-white px-3 py-[7px] text-[12px] font-medium text-ppc-text-muted transition-colors hover:border-ppc-purple-300 hover:text-ppc-ink"
        >
          <Info size={12} weight="duotone" />
          How Chat works
        </button>
      </div>
    </header>
  );
}

function ProjectSelector({
  project, onChange,
}: {
  project: typeof PROJECTS[number];
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const avatar = avatarForId(project.id);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full border-[0.5px] border-ppc-card-border bg-white py-[6px] pl-[6px] pr-3 text-[12.5px] font-semibold text-ppc-ink transition-colors hover:border-ppc-purple-300"
      >
        <span
          aria-hidden
          className="grid h-[20px] w-[20px] shrink-0 place-items-center rounded-[5px] text-[10px] font-bold leading-none"
          style={{
            background: avatar.bg,
            color: avatar.fg,
            boxShadow: `inset 0 0 0 0.5px ${avatar.ring}`,
          }}
        >
          {project.name.charAt(0)}
        </span>
        {project.name}
        <CaretDown size={10} weight="bold" className="text-ppc-text-faint" />
      </button>

      {open && (
        <div
          className="absolute left-0 top-full z-20 mt-1.5 w-[256px] overflow-hidden rounded-[12px] border-[0.5px] border-ppc-card-border bg-white"
          style={{ boxShadow: '0 12px 32px -12px rgba(15,10,30,0.18)' }}
        >
          <div className="px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ppc-text-faint">
            Scope to project
          </div>
          <ul className="max-h-[320px] overflow-y-auto pb-1.5">
            {PROJECTS.map((p) => {
              const a = avatarForId(p.id);
              const isActive = p.id === project.id;
              return (
                <li key={p.id}>
                  <button
                    onClick={() => { onChange(p.id); setOpen(false); }}
                    className={`flex w-full items-center gap-2.5 px-3 py-[7px] text-left text-[12.5px] transition-colors ${
                      isActive
                        ? 'bg-ppc-purple-50 font-semibold text-ppc-ink'
                        : 'font-medium text-ppc-ink hover:bg-ppc-canvas'
                    }`}
                  >
                    <span
                      className="grid h-[20px] w-[20px] shrink-0 place-items-center rounded-[5px] text-[10px] font-bold leading-none"
                      style={{
                        background: a.bg,
                        color: a.fg,
                        boxShadow: `inset 0 0 0 0.5px ${a.ring}`,
                      }}
                    >
                      {p.name.charAt(0)}
                    </span>
                    <span className="flex-1 truncate">{p.name}</span>
                    {isActive && <span className="h-[5px] w-[5px] rounded-full bg-ppc-purple-500" />}
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="border-t-[0.5px] border-ppc-card-border px-3 py-2">
            <Link
              to="/projects"
              className="inline-flex items-center gap-1 text-[11.5px] font-medium text-ppc-purple-700 hover:text-ppc-purple-500"
            >
              <Plus size={10} weight="bold" />
              New project
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Hero: H1 · subtitle · dark input ──────────────────────────────────── */

function Hero({ project }: { project: typeof PROJECTS[number] }) {
  return (
    <section className="pt-8 lg:pt-12">
      <h1 className="text-center font-display text-[40px] font-extrabold leading-[1.05] tracking-[-0.025em] text-ppc-ink sm:text-[44px]">
        Ask anything about your<br />
        PPC <PerformanceWord />
      </h1>
      <p className="mt-4 text-center text-[14.5px] leading-[1.55] text-ppc-text-muted">
        Get answers, uncover insights, and take action.
      </p>

      <DarkInput project={project} />
    </section>
  );
}

/** "performance" with a purple gradient and a single italic purple period. */
function PerformanceWord() {
  return (
    <span className="relative inline-block">
      <span
        className="bg-clip-text text-transparent"
        style={{
          backgroundImage: 'linear-gradient(96deg, #7F5AF0 0%, #A88CFF 55%, #534AB7 100%)',
        }}
      >
        performance
      </span>
    </span>
  );
}

function DarkInput({ project }: { project: typeof PROJECTS[number] }) {
  const avatar = avatarForId(project.id);
  return (
    <div className="mx-auto mt-10 max-w-[720px]">
      <div
        className="group relative overflow-hidden rounded-[16px]"
        style={{
          background: 'linear-gradient(180deg, #15101F 0%, #0F0A1E 55%, #0A0617 100%)',
          boxShadow:
            '0 1px 0 rgba(255,255,255,0.06) inset, 0 18px 38px -18px rgba(15,10,30,0.55), 0 0 0 1px rgba(127,90,240,0.12)',
        }}
      >
        {/* Subtle top-right purple bloom */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-20 h-[220px] w-[260px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(127,90,240,0.22) 0%, transparent 65%)',
          }}
        />

        {/* Top: textarea-style placeholder + ⌘K kbd */}
        <div className="relative flex items-start gap-3 px-5 pt-[18px] pb-4">
          <input
            type="text"
            placeholder="Ask a question or describe what you need…"
            className="flex-1 bg-transparent text-[14.5px] text-white outline-none placeholder:text-white/45"
          />
          <kbd
            className="mt-[1px] inline-flex h-[20px] items-center rounded-[5px] border border-white/[0.10] bg-white/[0.05] px-[7px] font-mono text-[10.5px] leading-none text-white/65"
            style={{ fontFamily: '"Courier New", ui-monospace, Menlo, monospace' }}
          >
            ⌘K
          </kbd>
        </div>

        {/* Bottom: chips · send */}
        <div
          className="relative flex items-center justify-between gap-2 px-3 pb-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.045)' }}
        >
          <div className="flex flex-wrap items-center gap-1.5 pt-2.5">
            <DarkChip
              icon={
                <span
                  aria-hidden
                  className="grid h-[14px] w-[14px] place-items-center rounded-[4px] text-[8px] font-bold leading-none"
                  style={{ background: avatar.bg, color: avatar.fg }}
                >
                  {project.name.charAt(0)}
                </span>
              }
              label={project.name}
            />
            <DarkChip
              icon={<Robot size={11} weight="duotone" className="text-white/65" />}
              label="Any specialist"
            />
          </div>

          <button
            type="button"
            title="Send"
            className="mt-2.5 grid h-[34px] w-[34px] place-items-center rounded-[10px] text-white transition-transform hover:-translate-y-[1px]"
            style={{
              background: 'linear-gradient(180deg, #8B68F2 0%, #7F5AF0 60%, #6B47E0 100%)',
              boxShadow:
                '0 1px 0 rgba(255,255,255,0.20) inset, 0 0 0 1px rgba(127,90,240,0.55), 0 6px 18px -4px rgba(127,90,240,0.55)',
            }}
          >
            <ArrowUp size={15} weight="bold" />
          </button>
        </div>
      </div>
    </div>
  );
}

function DarkChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.10] bg-white/[0.05] px-2.5 py-[5px] text-[11.5px] font-medium text-white/85 transition-colors hover:bg-white/[0.09]"
    >
      {icon}
      <span>{label}</span>
      <CaretDown size={9} weight="bold" className="text-white/55" />
    </button>
  );
}

/* ─── Memory moment ─────────────────────────────────────────────────────
 *
 * Replaces the old 3-card trust strip ("Live data / Sources / Built for
 * action"). One dark editorial card with the "io" purple roundel + a
 * memory-themed promise. Three quiet pillars run along the bottom — they
 * still carry the trust beats (live data, sourced, action-ready) but
 * framed as facets of one capability: memory. */

function TrustStrip() {
  return (
    <section className="mt-14">
      <div
        className="relative overflow-hidden rounded-[20px]"
        style={{
          background: 'linear-gradient(180deg, #15101F 0%, #0F0A1E 55%, #0A0617 100%)',
          boxShadow:
            '0 1px 0 rgba(255,255,255,0.06) inset, 0 22px 48px -22px rgba(15,10,30,0.55), 0 0 0 1px rgba(127,90,240,0.14)',
        }}
      >
        {/* Top-right purple bloom — same recipe as DarkInput */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-24 h-[320px] w-[360px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(127,90,240,0.28) 0%, transparent 65%)',
          }}
        />

        {/* Hero row: roundel + headline + counter */}
        <div className="relative grid grid-cols-1 items-center gap-6 px-7 pt-8 pb-6 md:grid-cols-[auto_1fr_auto] md:gap-8 md:px-9 md:pt-9 md:pb-7">
          <span
            aria-hidden
            className="grid h-[60px] w-[60px] place-items-center rounded-full text-white"
            style={{
              background: 'linear-gradient(180deg, #8E6BF5 0%, #7F5AF0 60%, #6E47E0 100%)',
              boxShadow:
                '0 1px 0 rgba(255,255,255,0.22) inset, 0 0 0 1px rgba(127,90,240,0.55), 0 18px 36px -14px rgba(127,90,240,0.55)',
            }}
          >
            <Brain size={24} weight="duotone" />
          </span>

          <div className="min-w-0">
            <div
              className="font-mono text-[10.5px] font-semibold uppercase"
              style={{ color: '#A89BFF', letterSpacing: '0.14em' }}
            >
              io has a long memory
            </div>
            <h2 className="mt-2 font-display text-[26px] font-extrabold leading-[1.1] tracking-[-0.022em] text-white">
              Every chat builds on the last
              <span className="font-serif italic text-ppc-purple-300">.</span>
            </h2>
            <p
              className="mt-2 max-w-[52ch] text-[13.5px] leading-[1.6]"
              style={{ color: 'rgba(255,255,255,0.65)' }}
            >
              io remembers your accounts, your decisions, your brand voice, and what every agent has surfaced —
              and pulls from it before answering. You never start from zero.
            </p>
          </div>

          <div
            className="hidden flex-col items-end gap-1 rounded-[14px] bg-white/[0.05] px-4 py-3 md:flex"
            style={{ boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.10)' }}
          >
            <span
              className="tabular text-[24px] font-extrabold leading-none text-white"
              style={{ letterSpacing: '-0.02em' }}
            >
              1,247
            </span>
            <span
              className="font-mono text-[10px] font-semibold uppercase"
              style={{ color: '#A89BFF', letterSpacing: '0.14em' }}
            >
              memories so far
            </span>
          </div>
        </div>

        {/* Bottom row: three quiet pillars */}
        <div
          className="relative grid grid-cols-1 gap-0 border-t border-white/[0.06] px-5 sm:grid-cols-3"
        >
          <MemoryPillar
            icon={<ClockCounterClockwise size={13} weight="duotone" />}
            title="Always current"
            body="Reads your latest Google Ads + GA4 numbers before answering."
          />
          <MemoryPillar
            icon={<ShieldCheck size={13} weight="duotone" />}
            title="Cites every claim"
            body="Every answer shows the data, the date range, the GAQL it pulled."
            divider
          />
          <MemoryPillar
            icon={<Sparkle size={13} weight="duotone" />}
            title="Gets sharper weekly"
            body="Patterns from across your roster compound into smarter answers."
            divider
          />
        </div>
      </div>
    </section>
  );
}

function MemoryPillar({
  icon, title, body, divider = false,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  divider?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-1.5 py-5 sm:px-5 ${divider ? 'sm:border-l sm:border-white/[0.06]' : ''}`}
    >
      <span
        className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase"
        style={{ color: '#A89BFF', letterSpacing: '0.14em' }}
      >
        {icon}
        {title}
      </span>
      <p
        className="text-[12.5px] leading-[1.55]"
        style={{ color: 'rgba(255,255,255,0.6)' }}
      >
        {body}
      </p>
    </div>
  );
}

/* ─── Popular to explore — 6-card grid ──────────────────────────────────── */

interface ExploreItem {
  icon: React.ReactNode;
  title: string;
  body: string;
  prompt: string;   // dropped into the input on click
}
const EXPLORE: ExploreItem[] = [
  {
    icon:  <ChartBar size={14} weight="fill" />,
    title: 'Performance overview',
    body:  'How is account performance overall?',
    prompt:'Give me a performance overview across the account.',
  },
  {
    icon:  <TrendUp size={14} weight="fill" />,
    title: 'Biggest changes',
    body:  'What changed the most in the last 7 days?',
    prompt:'What changed the most in the last 7 days?',
  },
  {
    icon:  <Coins size={14} weight="fill" />,
    title: 'Budget efficiency',
    body:  'Where is my budget being underused or wasted?',
    prompt:'Where is my budget being underused or wasted?',
  },
  {
    icon:  <Sparkle size={14} weight="fill" />,
    title: 'Top performing assets',
    body:  'Which ads and assets are driving the best results?',
    prompt:'Which ads and assets are driving the best results?',
  },
  {
    icon:  <MagnifyingGlass size={14} weight="bold" />,
    title: 'Search term insights',
    body:  'What search terms are worth targeting?',
    prompt:'What search terms are worth targeting?',
  },
  {
    icon:  <Users size={14} weight="fill" />,
    title: 'Competitor comparison',
    body:  'How do we compare to our competitors?',
    prompt:'How do we compare to our competitors?',
  },
];

function PopularGrid() {
  return (
    <section className="mt-12">
      <h2 className="mb-4 text-[13px] font-semibold tracking-[-0.003em] text-ppc-ink">
        Popular to explore
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {EXPLORE.map((c) => (
          <ExploreCard key={c.title} card={c} />
        ))}
      </div>
    </section>
  );
}

function ExploreCard({ card }: { card: ExploreItem }) {
  return (
    <button
      type="button"
      className="group flex flex-col items-start gap-2.5 rounded-[14px] border-[0.5px] border-ppc-card-border bg-white px-4 py-[16px] text-left transition-all hover:-translate-y-[1px] hover:border-ppc-purple-300"
    >
      <span
        aria-hidden
        className="grid h-[30px] w-[30px] place-items-center rounded-[8px] transition-colors group-hover:scale-[1.04]"
        style={{
          background: 'linear-gradient(155deg, #F3F0FF 0%, #E9E3FF 100%)',
          color: '#534AB7',
          boxShadow: 'inset 0 0 0 0.5px rgba(127,90,240,0.18)',
        }}
      >
        {card.icon}
      </span>
      <p className="text-[13.5px] font-semibold leading-tight tracking-[-0.005em] text-ppc-ink">
        {card.title}
      </p>
      <p className="text-[12px] leading-[1.5] text-ppc-text-muted">
        {card.body}
      </p>
    </button>
  );
}

/* ─── Specialist row (bottom) ───────────────────────────────────────────── */

function SpecialistRow() {
  return (
    <section className="mt-12">
      <h2 className="mb-3 text-[13px] font-semibold tracking-[-0.003em] text-ppc-ink">
        Or connect with a specialist
      </h2>
      <div className="flex flex-wrap items-center gap-2">
        {SPECIALIST_CHIPS.map((c) => (
          <Link
            key={c.slug}
            to={`/agents/${c.slug}`}
            className="inline-flex items-center gap-1.5 rounded-full border-[0.5px] border-ppc-card-border bg-white px-3.5 py-[7px] text-[12.5px] font-medium text-ppc-ink transition-colors hover:border-ppc-purple-300 hover:bg-ppc-purple-50/40"
          >
            <span aria-hidden className="text-[13px] leading-none">{c.emoji}</span>
            {c.label}
          </Link>
        ))}
        <Link
          to="/agents"
          className="ml-auto inline-flex items-center gap-1 text-[12.5px] font-medium text-ppc-purple-700 transition-colors hover:text-ppc-purple-500"
        >
          All {AGENTS.length} agents
          <ArrowRight size={11} weight="bold" />
        </Link>
      </div>
    </section>
  );
}

/* ═══ ACTIVE CHAT ══════════════════════════════════════════════════════════
 *
 * Single focused column (≤680px), no inner history rail. Editorial spacing,
 * one moment of colour tension (red spike bar). Reference 2026-05-15. */

function ActiveChat({ thread }: { thread: ChatThread }) {
  /* Let the page <body> own the scroll. Header is `sticky top-0`, dock is
   *  `sticky bottom-0` — both pin against the body scroll context, which is
   *  reliable inside AppShell's `flex min-h-screen` wrapper. The internal
   *  `overflow-y-auto` approach didn't work because AppShell's <main> has
   *  no definite height, so `flex-1` on the middle didn't bound the scroll
   *  and content overflowed behind the dock. */
  return (
    <div className="flex min-h-screen flex-col">
      <ActiveChatHeader title={thread.title} />
      <div className="flex-1 px-5 pt-8 sm:px-7">
        <div className="mx-auto w-full max-w-[680px] space-y-7 pb-10">
          {thread.messages.length === 0
            ? <EmptyThreadHint thread={thread} />
            : thread.messages.map((m) => (
                <MessageRow
                  key={m.id}
                  message={m}
                  timestamp={m.timestamp ?? ''}
                />
              ))
          }
        </div>
      </div>
      <ReplyDock />
    </div>
  );
}

/* ─── Header · centered title · ⋯ (rail owns thread navigation) ────────── */

function ActiveChatHeader({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-10 bg-ppc-canvas/85 px-4 pt-4 pb-3 backdrop-blur-md sm:px-7">
      <div className="mx-auto flex w-full max-w-[680px] items-center justify-between gap-3">
        <h1 className="min-w-0 flex-1 truncate text-[14px] font-semibold tracking-[-0.005em] text-ppc-ink">
          {title}
        </h1>
        <button
          type="button"
          title="More"
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full border-[0.5px] border-ppc-card-border bg-white text-ppc-text-muted transition-colors hover:border-ppc-purple-300 hover:text-ppc-purple-500"
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
        Pick up where you left off<span className="font-serif italic text-ppc-purple-500">.</span>
      </p>
      <p className="mt-2 max-w-[420px] text-[13px] leading-[1.6] text-ppc-text-muted">
        This thread is anchored to <span className="font-medium text-ppc-ink">{thread.projectLabel}</span>. Ask anything, or hand it to a specialist.
      </p>
    </div>
  );
}

/* ─── Message router ────────────────────────────────────────────────────── */

function MessageRow({ message, timestamp }: { message: ChatMessage; timestamp: string }) {
  return message.role === 'user'
    ? <UserBubble body={message.body ?? ''} timestamp={timestamp} />
    : <AssistantBlock message={message} timestamp={timestamp} />;
}

/* ─── User · right-aligned lavender bubble + timestamp ──────────────────── */

function UserBubble({ body, timestamp }: { body: string; timestamp: string }) {
  return (
    <div className="flex flex-col items-end">
      <div
        className="max-w-[82%] rounded-[18px] bg-[#EBE6FB] px-[18px] py-[11px]"
      >
        <p className="text-[14px] leading-[1.55] text-ppc-ink">{body}</p>
      </div>
      <p className="mt-1.5 pr-1 text-[11px] text-ppc-text-faint">{timestamp}</p>
    </div>
  );
}

/* ─── Assistant · avatar + outer card (body, chart, bullets, factors) ──── */

function AssistantBlock({ message, timestamp }: { message: ChatMessage; timestamp: string }) {
  return (
    <div className="flex gap-3">
      <IoAvatar />
      <div className="min-w-0 flex-1">
        <article className="rounded-[18px] border-[0.5px] border-ppc-card-border bg-white px-5 py-[18px] sm:px-6 sm:py-5">
          {message.body && (
            <p className="text-[14px] leading-[1.6] text-ppc-ink">
              {renderInlineMarkdown(message.body)}
            </p>
          )}
          <p className="mt-2 text-right text-[11px] text-ppc-text-faint">{timestamp}</p>

          {message.chart && (
            <div className="mt-4">
              <ChartCard chart={message.chart} />
            </div>
          )}

          {message.bullets && (
            <ul className="mt-4 flex flex-col gap-2.5">
              {message.bullets.map((b, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-[8px] h-[5px] w-[5px] shrink-0 rounded-full bg-ppc-purple-500" />
                  <p className="text-[13.5px] leading-[1.55] text-ppc-ink">
                    {b.lead && <span className="font-semibold">{b.lead}</span>}
                    {b.lead && b.rest ? ' ' : ''}
                    {b.rest}
                  </p>
                </li>
              ))}
            </ul>
          )}

          {message.factors && (
            <div className="mt-4">
              <FactorsCard factors={message.factors} />
            </div>
          )}

          {message.followUp && (
            <p className="mt-4 text-[13.5px] leading-[1.6] text-ppc-ink">
              {message.followUp}
            </p>
          )}

          {message.running && (
            <div className="mt-4">
              <InlineRunningCard run={message.running} />
            </div>
          )}
        </article>

        {message.chips && message.chips.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.chips.map((c, i) => (
              <ActionChip key={i} chip={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── "io" avatar — solid purple roundel ────────────────────────────────── */

function IoAvatar() {
  return (
    <span
      aria-hidden
      className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ppc-purple-500 text-white shadow-[0_4px_14px_-4px_rgba(127,90,240,0.45)]"
    >
      <span className="text-[12px] font-bold leading-none tracking-[-0.01em]">io</span>
    </span>
  );
}

function renderInlineMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**')
      ? <span key={i} className="font-semibold">{p.slice(2, -2)}</span>
      : <span key={i}>{p}</span>
  );
}

/* ─── Chart card — 14 bars on lavender, last one red ────────────────────── */

function ChartCard({ chart }: { chart: ChatChart }) {
  const maxValue = useMemo(
    () => Math.max(...chart.bars.map((b) => b.value)) || 100,
    [chart.bars],
  );
  return (
    <div className="rounded-[14px] border-[0.5px] border-ppc-card-border bg-white px-5 py-[18px]">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <p className="text-[13px] font-semibold tracking-[-0.005em] text-ppc-ink">
          {chart.label}
        </p>
        <p
          className="text-[11.5px] font-medium tabular-nums text-ppc-status-critical"
          style={{ fontFamily: '"Courier New", ui-monospace, monospace' }}
        >
          {chart.delta}
        </p>
      </div>
      <div className="relative">
        <div className="flex h-[88px] items-end gap-[6px]">
          {chart.bars.map((b, i) => {
            const heightPct = Math.max(14, (b.value / maxValue) * 100);
            return (
              <div
                key={i}
                className={`flex-1 rounded-t-[3px] ${b.spike ? 'bg-[#E24B4A]' : 'bg-[#E7E0F5]'}`}
                style={{ height: `${heightPct}%` }}
              />
            );
          })}
        </div>
      </div>
      <div
        className="mt-2 flex justify-between text-[10.5px] tabular-nums text-ppc-text-faint"
        style={{ fontFamily: '"Courier New", ui-monospace, monospace', letterSpacing: '0.04em' }}
      >
        <span>{chart.axisLeft}</span>
        <span>{chart.axisRight}</span>
      </div>
    </div>
  );
}

/* ─── Factors card — Top contributing factors table ─────────────────────── */

function FactorsCard({ factors }: { factors: ChatFactorsCard }) {
  return (
    <div className="rounded-[14px] border-[0.5px] border-ppc-card-border bg-white px-5 py-[18px]">
      <p className="text-[13px] font-semibold tracking-[-0.005em] text-ppc-ink">
        {factors.title}
      </p>
      <ul className="mt-3 divide-y divide-[#F0EDF8]">
        {factors.rows.map((r, i) => (
          <li key={i} className="flex items-center justify-between py-[11px]">
            <span className="text-[13.5px] text-ppc-ink">{r.label}</span>
            <span
              className={`text-[13px] tabular-nums ${
                r.tone === 'muted'
                  ? 'text-ppc-text-faint'
                  : 'font-medium text-ppc-status-critical'
              }`}
              style={
                r.tone === 'muted'
                  ? undefined
                  : { fontFamily: '"Courier New", ui-monospace, monospace' }
              }
            >
              {r.value}
            </span>
          </li>
        ))}
      </ul>
      {factors.linkLabel && (
        <div className="mt-2 flex justify-end">
          <Link
            to={factors.linkHref ?? '#'}
            className="inline-flex items-center gap-1 text-[12.5px] font-medium text-ppc-purple-700 transition-colors hover:text-ppc-purple-500"
          >
            {factors.linkLabel}
            <ArrowRight size={11} weight="bold" />
          </Link>
        </div>
      )}
    </div>
  );
}

/* ─── Action chips — follow-up suggestions below the AI card ────────────── */

const ACTION_ICONS: Record<NonNullable<ChatActionChip['icon']>, React.ComponentType<{ size?: number; weight?: 'regular' | 'bold' | 'duotone' | 'fill' }>> = {
  'magnifying-glass': MagnifyingGlass,
  'chart-bar':        ChartBar,
  'calendar':         CalendarBlank,
  'sparkle':          Sparkle,
  'users':            Users,
};

function ActionChip({ chip }: { chip: ChatActionChip }) {
  const Icon = chip.icon ? ACTION_ICONS[chip.icon] : null;
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 rounded-full border-[0.5px] border-ppc-card-border bg-white px-3.5 py-[8px] text-[12.5px] font-medium text-ppc-ink transition-colors hover:border-ppc-purple-300 hover:bg-ppc-purple-50/60"
    >
      {Icon
        ? <Icon size={13} weight="regular" />
        : chip.emoji
          ? <span aria-hidden className="text-[12.5px] leading-none">{chip.emoji}</span>
          : null}
      {chip.label}
    </button>
  );
}

/* ─── Running card — kept as a dark "moment" inside the assistant card ─── */

function InlineRunningCard({ run }: { run: ChatRunningCard }) {
  return (
    <div className="relative overflow-hidden rounded-[14px] bg-ppc-ink px-5 py-[18px]">
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
          to="/agents/deep-account-audit/loading/run-deep-account-audit-running"
          className="inline-flex items-center gap-1 text-[11.5px] font-medium text-ppc-purple-300 transition-colors hover:text-white"
        >
          Watch live <ArrowRight size={11} weight="bold" />
        </Link>
      </div>
    </div>
  );
}

/* ─── Reply dock — WHITE composer, + and purple send, footer disclaimer ── */

function ReplyDock() {
  return (
    <div className="sticky bottom-0 z-20 border-t-[0.5px] border-ppc-card-border bg-ppc-canvas/85 px-5 pb-5 pt-3 backdrop-blur-md sm:px-7">
      <div className="mx-auto w-full max-w-[680px]">
        <div className="rounded-[18px] border-[0.5px] border-ppc-card-border bg-white px-5 pt-4 pb-3 shadow-[0_4px_24px_-12px_rgba(15,10,30,0.10)]">
          <input
            type="text"
            placeholder="Reply or ask something else…"
            className="w-full bg-transparent text-[14px] text-ppc-ink outline-none placeholder:text-ppc-text-faint"
          />
          <div className="mt-3 flex items-center justify-between">
            <button
              type="button"
              title="Attach"
              className="grid h-9 w-9 place-items-center rounded-[10px] border-[0.5px] border-ppc-card-border bg-white text-ppc-text-muted transition-colors hover:border-ppc-purple-300 hover:text-ppc-purple-500"
            >
              <Plus size={14} weight="bold" />
            </button>
            <button
              type="button"
              title="Send"
              className="grid h-9 w-9 place-items-center rounded-[10px] bg-ppc-purple-500 text-white transition-transform hover:-translate-y-[1px]"
              style={{
                boxShadow:
                  '0 1px 0 rgba(255,255,255,0.20) inset, 0 6px 18px -6px rgba(127,90,240,0.55)',
              }}
            >
              <ArrowUp size={15} weight="bold" />
            </button>
          </div>
        </div>
        <p className="mt-3 text-center text-[11px] text-ppc-text-faint">
          <ChatCircle size={10} weight="duotone" className="-mt-px mr-1 inline" />
          Answers are grounded in your Google Ads + GA4 data.
        </p>
      </div>
    </div>
  );
}
