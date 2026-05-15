import { useMemo, useState } from 'react';
import { Link, NavLink, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowUp, ArrowRight, CaretDown, CaretRight, ChatCircle,
  DotsThree, MagnifyingGlass, NotePencil, Robot, ShareNetwork,
  Sparkle, TrendUp, ChartBar, Coins, Users, Info, Broadcast,
  Files, Target, Plus,
} from '@phosphor-icons/react';
import { CHAT_HISTORY, SPECIALIST_CHIPS, findChatThread } from '../mock/chats';
import type {
  ChatActionChip, ChatChart, ChatMessage, ChatRunningCard, ChatThread,
} from '../mock/chats';
import { PROJECTS, CURRENT_PROJECT_ID } from '../mock/projects';
import { AGENTS } from '../mock/agents';

/* /chat       — empty state (centered hero · trust strip · explore grid)
 * /chat/:id   — active conversation
 *
 * Surface owns its own three-column posture:
 *
 *   [ AppShell sidebar ] [ inner chat-history rail ] [ chat workspace ]
 *
 * AppShell flips to full-bleed for /chat routes so the inner rail can sit
 * flush against the dark sidebar without the global 1240px wrapper.
 *
 * Brand language: lavender canvas, white cards w/ 0.5px ppc-card-border,
 * Figtree display, Courier eyebrows, single italic purple period accent in
 * each title — same hand as Dashboard + Project + AgentCatalog. Reference
 * Stewart provided 2026-05-15. */

export function Chat() {
  const { chatId } = useParams<{ chatId?: string }>();
  const activeThread = findChatThread(chatId);

  return (
    <div className="flex min-h-screen w-full">
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

function avatarForLabel(label: string): AvatarToken {
  const project = PROJECTS.find((p) => p.name === label);
  if (!project) return NEUTRAL_AVATAR;
  return PROJECT_AVATARS[project.id] ?? NEUTRAL_AVATAR;
}

function avatarForId(id: string | undefined): AvatarToken {
  if (!id) return NEUTRAL_AVATAR;
  return PROJECT_AVATARS[id] ?? NEUTRAL_AVATAR;
}

/* ═══ INNER LEFT RAIL · chat history ═══════════════════════════════════════ */

function ChatHistoryRail({ activeId }: { activeId?: string }) {
  return (
    <aside
      className="sticky top-0 hidden h-screen w-[296px] shrink-0 flex-col border-r-[0.5px] border-ppc-card-border bg-white md:flex"
    >
      {/* Header — just the word, no count chatter */}
      <div className="px-5 pt-[22px] pb-3">
        <h2 className="text-[19px] font-bold tracking-[-0.012em] text-ppc-ink">
          Chat<span className="font-serif italic text-ppc-purple-500">.</span>
        </h2>
      </div>

      {/* New chat — full-width primary CTA */}
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

      {/* Recent + search row */}
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

      {/* List */}
      <nav className="flex flex-1 flex-col gap-[2px] overflow-y-auto px-3 pb-3">
        {CHAT_HISTORY.map((t) => (
          <ChatHistoryRow key={t.id} thread={t} active={t.id === activeId} />
        ))}
      </nav>

      {/* Footer — view-all link */}
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
        active
          ? 'bg-ppc-purple-50'
          : 'hover:bg-ppc-canvas/70'
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
      <span
        className="shrink-0 pt-[1px] text-[10px] font-medium uppercase tracking-[0.04em] text-ppc-text-faint"
        style={{ fontFamily: '"Courier New", ui-monospace, monospace' }}
      >
        {compactTime(thread.relativeTime)}
      </span>
    </Link>
  );
}

/** Shorten the human "2 days ago" / "last week" labels into the right-aligned
 *  date stamps the reference uses ("Tue", "Mon", "Apr 27", "10:24 AM"). */
function compactTime(rel: string): string {
  switch (rel) {
    case 'just now':   return '10:24 AM';
    case '2h ago':     return 'Yesterday';
    case 'yesterday':  return 'Tue';
    case '2 days ago': return 'Mon';
    case '3 days ago': return 'Mon';
    case 'last week':  return 'Apr 27';
    default:           return rel;
  }
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
        Google Ads <PerformanceWord />
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

/* ─── Trust strip ───────────────────────────────────────────────────────── */

interface TrustItem { icon: React.ReactNode; title: string; body: string; }
const TRUST: TrustItem[] = [
  {
    icon: <Broadcast size={15} weight="duotone" />,
    title: 'Live data. Always current',
    body:  'Answers are based on your latest Google Ads data.',
  },
  {
    icon: <Files size={15} weight="duotone" />,
    title: 'Sources you can trust',
    body:  'We show the data and logic behind every answer.',
  },
  {
    icon: <Target size={15} weight="duotone" />,
    title: 'Built for action',
    body:  'From insight to action in just a few clicks.',
  },
];

function TrustStrip() {
  return (
    <section className="mt-12 grid gap-4 sm:grid-cols-3">
      {TRUST.map((item) => (
        <div
          key={item.title}
          className="flex flex-col gap-2"
        >
          <span
            aria-hidden
            className="grid h-[34px] w-[34px] place-items-center rounded-[9px]"
            style={{
              background: 'linear-gradient(155deg, #F3F0FF 0%, #E9E3FF 100%)',
              color: '#534AB7',
              boxShadow: 'inset 0 0 0 0.5px rgba(127,90,240,0.18)',
            }}
          >
            {item.icon}
          </span>
          <p className="text-[13.5px] font-semibold tracking-[-0.005em] text-ppc-ink">
            {item.title}<span className="font-serif italic text-ppc-purple-500">.</span>
          </p>
          <p className="text-[12.5px] leading-[1.55] text-ppc-text-muted">
            {item.body}
          </p>
        </div>
      ))}
    </section>
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

/* ═══ ACTIVE CHAT ══════════════════════════════════════════════════════════ */

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
  const avatar = avatarForLabel(thread.projectLabel);
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
          className="grid h-8 w-8 shrink-0 place-items-center rounded-[7px] text-[12px] font-semibold"
          style={{
            background: avatar.bg,
            color: avatar.fg,
            boxShadow: `inset 0 0 0 0.5px ${avatar.ring}`,
          }}
        >
          {thread.monogram}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13.5px] font-semibold leading-tight tracking-[-0.005em] text-ppc-ink">
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
        Pick up where you left off<span className="font-serif italic text-ppc-purple-500">.</span>
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

/* ─── Active-chat reply dock — same dark input language as the pre-chat ── */

function ReplyDock({ thread }: { thread: ChatThread }) {
  const avatar = avatarForLabel(thread.projectLabel);
  return (
    <div className="sticky bottom-0 border-t-[0.5px] border-ppc-card-border bg-ppc-canvas/85 px-6 pb-6 pt-4 backdrop-blur-md lg:px-10">
      <div className="mx-auto w-full max-w-[780px]">
        <div
          className="relative overflow-hidden rounded-[14px]"
          style={{
            background: 'linear-gradient(180deg, #15101F 0%, #0F0A1E 55%, #0A0617 100%)',
            boxShadow:
              '0 1px 0 rgba(255,255,255,0.06) inset, 0 14px 30px -16px rgba(15,10,30,0.55), 0 0 0 1px rgba(127,90,240,0.12)',
          }}
        >
          <div className="flex items-center gap-3 px-4 pt-3.5 pb-3">
            <input
              type="text"
              placeholder="Reply or ask something else…"
              className="flex-1 bg-transparent text-[13.5px] text-white outline-none placeholder:text-white/45"
            />
            <kbd
              className="inline-flex h-[20px] items-center rounded-[5px] border border-white/[0.10] bg-white/[0.05] px-[7px] font-mono text-[10.5px] leading-none text-white/65"
              style={{ fontFamily: '"Courier New", ui-monospace, Menlo, monospace' }}
            >
              ⌘↵
            </kbd>
          </div>
          <div
            className="flex items-center justify-between gap-2 px-3 pb-2.5"
            style={{ borderTop: '1px solid rgba(255,255,255,0.045)' }}
          >
            <div className="flex flex-wrap items-center gap-1.5 pt-2">
              <DarkChip
                icon={
                  <span
                    aria-hidden
                    className="grid h-[14px] w-[14px] place-items-center rounded-[4px] text-[8px] font-bold leading-none"
                    style={{ background: avatar.bg, color: avatar.fg }}
                  >
                    {thread.projectLabel.charAt(0)}
                  </span>
                }
                label={thread.projectLabel}
              />
              <DarkChip
                icon={<Robot size={11} weight="duotone" className="text-white/65" />}
                label="General"
              />
            </div>
            <button
              type="button"
              title="Send"
              className="mt-2 grid h-[30px] w-[30px] place-items-center rounded-[8px] text-white transition-transform hover:-translate-y-[1px]"
              style={{
                background: 'linear-gradient(180deg, #8B68F2 0%, #7F5AF0 60%, #6B47E0 100%)',
                boxShadow:
                  '0 1px 0 rgba(255,255,255,0.20) inset, 0 0 0 1px rgba(127,90,240,0.55), 0 6px 18px -4px rgba(127,90,240,0.55)',
              }}
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
