// v2 Chat — Full-bleed 3-column conversation surface.
//
// AppShell.tsx (line 61) already routes /chat outside the content wrapper, so
// this page owns the entire main column edge-to-edge. No spreads. No bubbles.
// No avatars on rows. 3-column structure is the discipline.
//
// Columns (desktop, >= md):
//   1. Conversation list   320px · h-screen · 1px ink right rule
//   2. Conversation thread flex-1 · h-screen · composer band fixed bottom
//   3. Context panel       320px or 48px collapsed · 1px ink left rule
//
// Mobile (< md):
//   Just the thread + composer. Hamburger opens the list as a drawer.
//   Context panel is hidden entirely below md.
//
// Discipline:
//   5 font sizes only: 96 / 56 / 32 / 17 / 14
//   Zero tilts on this page.
//   One mascot — wave, in column 2 empty state only.
//   One Caveat — hover-timestamp annotation (same component, not multiple).

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowUp,
  List as HamburgerIcon,
  X as CloseIcon,
  CaretLeft,
  CaretRight,
  Folder,
  Robot,
  FileText,
  Sparkle,
} from '@phosphor-icons/react';
import { PillButton } from '../components/brand/PillButton';
import { Caveat } from '../components/brand/Caveat';
import { Mascot } from '../components/brand/Mascot';
import { CHAT_HISTORY, findChatThread, type ChatThread, type ChatMessage } from '../mock/chats';
import { PROJECTS, ACCOUNTS, CURRENT_PROJECT_ID } from '../mock/projects';

const CONTEXT_COLLAPSED_KEY = 'ppcio-chat-context-collapsed';

/* ─── Canvas variant of AppShell's ActiveAccent ─────────────────────────────
 * Lifted from src/components/AppShell.tsx line 312-323. Ported from the
 * dark-sidebar palette to a canvas-friendly ink+purple gradient: the gradient
 * runs from ink (#0F0A1E) at the top into the canonical purple (#7F5AF0) at
 * the bottom, with a soft purple bloom — readable on ivory/canvas. */
function ActiveAccent() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute left-0 top-1/2 h-[22px] w-[2.5px] -translate-y-1/2 rounded-r-full"
      style={{
        background: 'linear-gradient(180deg, #0F0A1E 0%, #7F5AF0 100%)',
        boxShadow: '0 0 10px 0 rgba(127,90,240,0.32)',
      }}
    />
  );
}

/* ─── Format helpers ──────────────────────────────────────────────────────── */

function formatRelative(input: string): string {
  // The mock already provides human strings ("just now", "2h ago"). Pass through.
  return input;
}

function fullTimestampFor(thread: ChatThread, msg: ChatMessage): string {
  // Deterministic mock — derives from thread + message id so hover values
  // don't jitter on rerender.
  const base = `${thread.relativeTime} · ${msg.id.toUpperCase()}`;
  const tail = msg.role === 'user' ? '10:42:18' : '10:42:24';
  return `${base} · ${tail}`;
}

/* ─── Column 1 — Conversation list ────────────────────────────────────────── */

function ConversationList({
  activeId,
  onSelect,
  onNew,
  onClose,
}: {
  activeId: string | undefined;
  onSelect: (id: string) => void;
  onNew: () => void;
  onClose?: () => void;
}) {
  return (
    <aside
      className="flex h-screen w-[320px] shrink-0 flex-col bg-canvas"
      style={{ borderRight: '1px solid #0F0A1E' }}
    >
      {/* Top: H2 title + New chat ghost pill + (mobile) close */}
      <div className="flex items-start justify-between px-6 pt-8 pb-6">
        <h2
          className="font-sans font-bold text-ink"
          style={{ fontSize: 32, lineHeight: 1.05, letterSpacing: '-0.02em' }}
        >
          Conversations
        </h2>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close conversation list"
            className="grid h-8 w-8 place-items-center rounded-md text-ink/70 hover:bg-ink/[0.06] hover:text-ink md:hidden"
          >
            <CloseIcon size={16} weight="bold" />
          </button>
        )}
      </div>

      <div className="px-6 pb-4">
        <PillButton variant="ghost" onClick={onNew}>
          New chat
        </PillButton>
      </div>

      {/* List */}
      <nav className="flex-1 overflow-y-auto px-3 pb-6">
        <ul className="flex flex-col">
          {CHAT_HISTORY.map((thread) => {
            const active = thread.id === activeId;
            return (
              <li key={thread.id}>
                <button
                  type="button"
                  onClick={() => onSelect(thread.id)}
                  className={[
                    'group relative flex w-full flex-col items-start gap-1 rounded-[10px] px-3 py-3 text-left transition-colors duration-150',
                    active
                      ? 'text-ink'
                      : 'text-ink/80 hover:bg-ink/[0.04] hover:text-ink',
                  ].join(' ')}
                  style={
                    active
                      ? {
                          background:
                            'linear-gradient(90deg, rgba(127,90,240,0.16) 0%, rgba(127,90,240,0.04) 60%, rgba(127,90,240,0) 100%)',
                          boxShadow: 'inset 0 0 0 1px rgba(127,90,240,0.28)',
                        }
                      : undefined
                  }
                >
                  {active && <ActiveAccent />}
                  <span
                    className={[
                      'font-sans truncate w-full',
                      active ? 'font-bold' : 'font-semibold',
                    ].join(' ')}
                    style={{ fontSize: 17, lineHeight: 1.3, letterSpacing: '-0.01em' }}
                  >
                    {thread.title}
                  </span>
                  <span
                    className="font-mono text-ink/55"
                    style={{ fontSize: 14, letterSpacing: '0.012em' }}
                  >
                    {formatRelative(thread.relativeTime)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

/* ─── User & assistant message rows ───────────────────────────────────────── */

function MessageBlock({
  thread,
  msg,
}: {
  thread: ChatThread;
  msg: ChatMessage;
}) {
  const isUser = msg.role === 'user';
  // The Caveat hover annotation is the SAME component re-used on hover for
  // any row — only one is visible at once because only one row is hovered.
  return (
    <div
      className={[
        'group relative flex w-full',
        isUser ? 'justify-end' : 'justify-start',
      ].join(' ')}
    >
      <div
        className={[
          'relative w-full',
          isUser ? 'flex justify-end' : 'flex justify-start',
        ].join(' ')}
      >
        <div className={['relative max-w-[640px]', isUser ? 'pr-1' : 'pl-1'].join(' ')}>
          {/* Hover-only Caveat timestamp annotation — singleton-by-hover.
           * Positioned in the margin opposite the message edge. */}
          <span
            aria-hidden
            className={[
              'pointer-events-none absolute top-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100',
              isUser
                ? 'right-full mr-6 origin-top-right'
                : 'left-full ml-6 origin-top-left',
            ].join(' ')}
          >
            <Caveat
              text={fullTimestampFor(thread, msg)}
              arrow={isUser ? 'down-right' : 'down-left'}
            />
          </span>

          {isUser ? (
            <p
              className="font-sans text-ink text-right"
              style={{ fontSize: 17, lineHeight: 1.55, fontWeight: 500, letterSpacing: '-0.005em' }}
            >
              {msg.body}
            </p>
          ) : (
            <AssistantBody msg={msg} />
          )}
        </div>
      </div>
    </div>
  );
}

function AssistantBody({ msg }: { msg: ChatMessage }) {
  // Renders plain body + optional bullets + optional code-style frame for
  // chart/running surrogates. Discipline: no bubble; flat ink/85 on canvas.
  return (
    <div
      className="font-sans"
      style={{ color: 'rgba(15,10,30,0.85)', fontSize: 17, lineHeight: 1.55, fontWeight: 500, letterSpacing: '-0.005em' }}
    >
      {msg.body && (
        <p className="whitespace-pre-wrap">
          {renderInlineEmphasis(msg.body)}
        </p>
      )}

      {msg.bullets && msg.bullets.length > 0 && (
        <ul className="mt-4 space-y-3">
          {msg.bullets.map((b, i) => (
            <li key={i} className="flex gap-3">
              <span
                aria-hidden
                className="mt-[10px] block h-[6px] w-[6px] shrink-0 rounded-full bg-ink"
              />
              <span>
                <strong className="font-bold text-ink">{b.lead}</strong>{' '}
                {b.rest}
              </span>
            </li>
          ))}
        </ul>
      )}

      {msg.chart && (
        <pre
          className="mt-5 border-[2px] border-ink p-4 font-mono text-ink overflow-x-auto whitespace-pre"
          style={{ fontSize: 14, lineHeight: 1.5, letterSpacing: '0.012em', background: 'transparent' }}
        >
{renderChart(msg.chart)}
        </pre>
      )}

      {msg.followUp && (
        <p className="mt-5 whitespace-pre-wrap">
          {renderInlineEmphasis(msg.followUp)}
        </p>
      )}

      {msg.running && (
        <pre
          className="mt-5 border-[2px] border-ink p-4 font-mono text-ink overflow-x-auto whitespace-pre"
          style={{ fontSize: 14, lineHeight: 1.5, letterSpacing: '0.012em', background: 'transparent' }}
        >
{`AGENT  ${msg.running.agentName.toUpperCase()}
STAGE  ${msg.running.stageCurrent} of ${msg.running.stageTotal}  ${msg.running.stageDescription}
TIME   ${msg.running.elapsed}
${renderProgress(msg.running.progressPct)}`}
        </pre>
      )}
    </div>
  );
}

/* Replace **bold** markers with <strong>. Leaves everything else alone. */
function renderInlineEmphasis(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-ink">
          {p.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{p}</span>;
  });
}

/* ASCII chart — keeps the discipline (mono 14px in ink frame). */
function renderChart(chart: NonNullable<ChatMessage['chart']>) {
  const max = Math.max(...chart.bars.map((b) => b.value));
  const ROWS = 6;
  const lines: string[] = [];
  lines.push(`${chart.label.toUpperCase()}     ${chart.delta}`);
  lines.push('');
  for (let r = ROWS; r >= 1; r--) {
    const threshold = (r / ROWS) * max;
    let row = '';
    for (const b of chart.bars) {
      row += b.value >= threshold ? '  █ ' : '    ';
    }
    lines.push(row);
  }
  lines.push('  ' + chart.bars.map(() => '── ').join(''));
  lines.push(`  ${chart.axisLeft.padEnd(chart.bars.length * 2)}${chart.axisRight}`);
  return lines.join('\n');
}

function renderProgress(pct: number): string {
  const WIDTH = 32;
  const filled = Math.round((pct / 100) * WIDTH);
  return `[${'█'.repeat(filled)}${'·'.repeat(WIDTH - filled)}] ${pct}%`;
}

/* ─── Column 2 — Thread ────────────────────────────────────────────────────── */

function ConversationThread({
  thread,
  onOpenList,
  contextOpen,
  onToggleContext,
}: {
  thread: ChatThread | undefined;
  onOpenList: () => void;
  contextOpen: boolean;
  onToggleContext: () => void;
}) {
  // Empty state — centred in column 2 when no :chatId.
  if (!thread) {
    return (
      <section className="flex h-screen flex-1 flex-col bg-canvas">
        <ThreadHeader
          title={undefined}
          onOpenList={onOpenList}
          contextOpen={contextOpen}
          onToggleContext={onToggleContext}
        />
        <EmptyState />
      </section>
    );
  }

  return (
    <section className="flex h-screen flex-1 flex-col bg-canvas">
      <ThreadHeader
        title={thread.title}
        onOpenList={onOpenList}
        contextOpen={contextOpen}
        onToggleContext={onToggleContext}
      />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[820px] px-6 py-10 sm:px-10 md:px-14">
          {thread.messages.length === 0 ? (
            <EmptyThreadState title={thread.title} />
          ) : (
            <div className="space-y-8">
              {thread.messages.map((msg) => (
                <MessageBlock key={msg.id} thread={thread} msg={msg} />
              ))}
            </div>
          )}
        </div>
      </div>
      <Composer />
    </section>
  );
}

function ThreadHeader({
  title,
  onOpenList,
  contextOpen,
  onToggleContext,
}: {
  title: string | undefined;
  onOpenList: () => void;
  contextOpen: boolean;
  onToggleContext: () => void;
}) {
  return (
    <header
      className="flex items-center gap-3 px-6 pt-8 pb-6 sm:px-10 md:px-14"
      style={{ borderBottom: '1px solid rgba(15,10,30,0.10)' }}
    >
      {/* Mobile: hamburger to open conversation list drawer */}
      <button
        type="button"
        onClick={onOpenList}
        aria-label="Open conversation list"
        className="grid h-9 w-9 place-items-center rounded-md text-ink/75 hover:bg-ink/[0.06] hover:text-ink md:hidden"
      >
        <HamburgerIcon size={18} weight="bold" />
      </button>

      <h2
        className="flex-1 truncate font-sans font-bold text-ink"
        style={{ fontSize: 32, lineHeight: 1.05, letterSpacing: '-0.02em' }}
      >
        {title ?? 'Conversation'}
      </h2>

      {title && (
        <PillButton variant="ghost" onClick={() => {}}>
          Rename
        </PillButton>
      )}

      {/* Desktop-only context-panel toggle (mobile hides the panel entirely) */}
      <button
        type="button"
        onClick={onToggleContext}
        aria-label={contextOpen ? 'Collapse context panel' : 'Expand context panel'}
        className="hidden h-9 w-9 place-items-center rounded-md text-ink/75 hover:bg-ink/[0.06] hover:text-ink md:grid"
      >
        {contextOpen ? <CaretRight size={16} weight="bold" /> : <CaretLeft size={16} weight="bold" />}
      </button>
    </header>
  );
}

function EmptyState() {
  // Empty state: /chat with no :chatId. Single mascot, single H1, primary CTA.
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-canvas px-6 text-center">
      <Mascot pose="wave" size={200} />
      <h1
        className="mt-8 font-sans font-bold text-ink max-w-[760px]"
        style={{ fontSize: 56, lineHeight: 1.0, letterSpacing: '-0.025em' }}
      >
        Pick a conversation or start a new one.
      </h1>
      <p
        className="mt-5 font-sans text-ink/70 max-w-[560px]"
        style={{ fontSize: 17, lineHeight: 1.5, fontWeight: 500 }}
      >
        Ask anything about your accounts. Send a specialist agent in.
        Pin a thread for daily check-ins.
      </p>
      <div className="mt-8">
        <PillButton variant="primary">
          New chat →
        </PillButton>
      </div>
    </div>
  );
}

function EmptyThreadState({ title }: { title: string }) {
  // Used when a thread exists in the list but has no messages yet (mock stubs).
  return (
    <div className="flex h-full min-h-[60vh] flex-col items-center justify-center text-center">
      <h1
        className="font-sans font-bold text-ink max-w-[640px]"
        style={{ fontSize: 56, lineHeight: 1.0, letterSpacing: '-0.025em' }}
      >
        {title}
      </h1>
      <p
        className="mt-5 font-sans text-ink/65 max-w-[520px]"
        style={{ fontSize: 17, lineHeight: 1.5, fontWeight: 500 }}
      >
        No messages yet. Say something to kick this thread off.
      </p>
    </div>
  );
}

/* ─── Composer band ──────────────────────────────────────────────────────── */

function Composer() {
  const [value, setValue] = useState('');
  const currentProject = useMemo(
    () => PROJECTS.find((p) => p.id === CURRENT_PROJECT_ID) ?? PROJECTS[0],
    [],
  );
  const currentAccount = useMemo(
    () => ACCOUNTS.find((a) => a.projectId === currentProject.id) ?? ACCOUNTS[0],
    [currentProject.id],
  );

  return (
    <div className="bg-canvas" style={{ borderTop: '1px solid #0F0A1E' }}>
      <div className="mx-auto w-full max-w-[820px] px-6 pb-6 pt-5 sm:px-10 md:px-14">
        {/* Context chips row — monochrome ink-bordered pills */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <ContextChip icon={<Folder size={14} weight="bold" />} label={currentProject.name} />
          <ContextChip icon={<Robot size={14} weight="bold" />} label={currentAccount.name} />
        </div>

        {/* Input field + send pill */}
        <div className="flex items-center gap-3 border-[2px] border-ink bg-ivory/40 px-4 py-3">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Ask anything about your account"
            className="flex-1 bg-transparent font-sans text-ink placeholder:text-ink/40 outline-none"
            style={{ fontSize: 17, fontWeight: 500, letterSpacing: '-0.005em' }}
          />
          <PillButton variant="primary" onClick={() => setValue('')}>
            Send
            <ArrowUp size={16} weight="bold" />
          </PillButton>
        </div>
      </div>
    </div>
  );
}

function ContextChip({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-ink bg-canvas px-3 py-1 font-mono text-ink"
      style={{ fontSize: 14, letterSpacing: '0.012em' }}
    >
      <span className="text-ink/75">{icon}</span>
      {label}
    </span>
  );
}

/* ─── Column 3 — Context panel ────────────────────────────────────────────── */

interface ContextSource {
  kind: 'PROJECT' | 'AGENT' | 'REPORT';
  name: string;
  icon: typeof Folder;
}

function deriveContext(thread: ChatThread | undefined): ContextSource[] {
  if (!thread) {
    return [
      { kind: 'PROJECT', name: 'All projects', icon: Folder },
      { kind: 'AGENT',   name: 'No agent active', icon: Robot },
    ];
  }
  return [
    { kind: 'PROJECT', name: thread.projectLabel, icon: Folder },
    { kind: 'AGENT',   name: thread.model, icon: Sparkle },
    { kind: 'REPORT',  name: `${thread.title.slice(0, 36)}${thread.title.length > 36 ? '…' : ''}`, icon: FileText },
  ];
}

function ContextPanel({
  thread,
  collapsed,
  onToggle,
}: {
  thread: ChatThread | undefined;
  collapsed: boolean;
  onToggle: () => void;
}) {
  const sources = deriveContext(thread);

  if (collapsed) {
    return (
      <aside
        className="hidden h-screen w-[48px] shrink-0 flex-col items-center gap-3 bg-canvas py-6 md:flex"
        style={{ borderLeft: '1px solid #0F0A1E' }}
      >
        <button
          type="button"
          onClick={onToggle}
          aria-label="Expand context panel"
          className="grid h-8 w-8 place-items-center rounded-md text-ink/75 hover:bg-ink/[0.06] hover:text-ink"
        >
          <CaretLeft size={16} weight="bold" />
        </button>
        <div className="flex flex-col items-center gap-3 pt-2">
          {sources.map((s, i) => {
            const Icon = s.icon;
            return (
              <span
                key={i}
                title={`${s.kind} · ${s.name}`}
                className="grid h-8 w-8 place-items-center text-ink/75"
              >
                <Icon size={18} weight="duotone" />
              </span>
            );
          })}
        </div>
      </aside>
    );
  }

  return (
    <aside
      className="hidden h-screen w-[320px] shrink-0 flex-col bg-canvas md:flex"
      style={{ borderLeft: '1px solid #0F0A1E' }}
    >
      <div className="flex items-start justify-between px-6 pt-8 pb-6">
        <h2
          className="font-sans font-bold text-ink"
          style={{ fontSize: 32, lineHeight: 1.05, letterSpacing: '-0.02em' }}
        >
          What I'm reading
        </h2>
        <button
          type="button"
          onClick={onToggle}
          aria-label="Collapse context panel"
          className="grid h-8 w-8 place-items-center rounded-md text-ink/70 hover:bg-ink/[0.06] hover:text-ink"
        >
          <CaretRight size={16} weight="bold" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-8">
        <ul className="flex flex-col gap-4">
          {sources.map((s, i) => (
            <li key={i} className="border-[2px] border-ink bg-canvas p-4">
              <div
                className="font-mono text-ink/65"
                style={{ fontSize: 14, letterSpacing: '0.012em' }}
              >
                {s.kind}
              </div>
              <div
                className="mt-2 font-sans font-bold text-ink"
                style={{ fontSize: 17, lineHeight: 1.3, letterSpacing: '-0.005em' }}
              >
                {s.name}
              </div>
              <div className="mt-4">
                <PillButton variant="ghost">Open</PillButton>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

/* ─── Page export ─────────────────────────────────────────────────────────── */

export function Chat() {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();

  const thread = useMemo(() => findChatThread(chatId), [chatId]);

  // Context-panel collapse state, persisted to localStorage.
  const [contextCollapsed, setContextCollapsed] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem(CONTEXT_COLLAPSED_KEY);
    if (saved !== null) setContextCollapsed(saved === 'true');
  }, []);
  const toggleContext = () => {
    setContextCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(CONTEXT_COLLAPSED_KEY, String(next));
      return next;
    });
  };

  // Mobile drawer for the conversation list.
  const [listOpen, setListOpen] = useState(false);
  // Close drawer on chat selection (mobile).
  useEffect(() => {
    setListOpen(false);
  }, [chatId]);

  const handleSelect = (id: string) => navigate(`/chat/${id}`);
  const handleNew = () => {
    // Mock — would create a new chat record and route to its id. No-op for now.
    navigate('/chat');
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-canvas font-sans text-ink">
      {/* Desktop column 1 */}
      <div className="hidden md:flex">
        <ConversationList
          activeId={chatId}
          onSelect={handleSelect}
          onNew={handleNew}
        />
      </div>

      {/* Mobile drawer — opens above the thread when hamburger is tapped */}
      {listOpen && (
        <>
          <button
            type="button"
            aria-label="Close conversation list"
            onClick={() => setListOpen(false)}
            className="fixed inset-0 z-40 bg-ink/40 md:hidden"
          />
          <div className="fixed inset-y-0 left-0 z-50 md:hidden">
            <ConversationList
              activeId={chatId}
              onSelect={handleSelect}
              onNew={handleNew}
              onClose={() => setListOpen(false)}
            />
          </div>
        </>
      )}

      {/* Column 2 — thread */}
      <ConversationThread
        thread={thread}
        onOpenList={() => setListOpen(true)}
        contextOpen={!contextCollapsed}
        onToggleContext={toggleContext}
      />

      {/* Column 3 — context panel (desktop only) */}
      <ContextPanel
        thread={thread}
        collapsed={contextCollapsed}
        onToggle={toggleContext}
      />
    </div>
  );
}
