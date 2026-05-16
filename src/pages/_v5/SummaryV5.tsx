// v5 AI Summary tab.
//
// Layout (the ReportOpener strip lives one level up in AgentResultsV5):
//   1. StrategyVerdictCard      — dark refined surface, the page's payoff
//   2. DiscoverySection         — linear-vertical cards, each with a dark
//                                  Action callout as the visual beat
//   3. AskTheAgentBar           — run-specific suggestion chips
//
// Design doc: docs/plans/2026-05-16-agent-results-v5-design.md

import { useState } from 'react';
import {
  ChatCircle,
  PaperPlaneTilt,
  Sparkle,
  ArrowRight,
  X,
  Check,
  Target,
  MagnifyingGlass,
  Lightbulb,
  Warning,
} from '@phosphor-icons/react';

import { SpyMascot } from '../../components/SpyMascot';
import type {
  AgentResultsV5Data,
  DiscoveryV5,
  Impact,
  Readiness,
  StrategyVerdictData,
} from './data';

// ═════════════════════════════════════════════════════════════════════════
// TOP-LEVEL
// ═════════════════════════════════════════════════════════════════════════

export function SummaryV5({ data }: { data: AgentResultsV5Data }) {
  const [activeAction, setActiveAction] = useState<DiscoveryV5 | null>(null);

  return (
    <>
      <div className="mx-auto w-full max-w-[1200px] pb-16">
        <StrategyVerdictCard
          data={data.verdict}
          discoveries={data.discoveries}
          duration={data.hero.duration}
          window={data.hero.window}
        />
        <DiscoverySection
          discoveries={data.discoveries}
          projectName={data.hero.projectName}
          onAction={setActiveAction}
        />
        <AskTheAgentBar data={data.ask} />
      </div>

      {activeAction && (
        <ActionDrawer
          discovery={activeAction}
          agentName={data.ask.agentName}
          onClose={() => setActiveAction(null)}
        />
      )}
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════════
// STRATEGY VERDICT  (dark refined surface — slim arrival moment, not a text monolith)
// ═════════════════════════════════════════════════════════════════════════
//
// Previously a maximalist hero card with H1 + lede + body paragraph + 4
// bullets + 2 CTAs that duplicated the discoveries below. Stewart's call:
// "massive and a text monolith." Redesigned to a tight arrival surface
// that previews the findings instead of restating them in prose.
//
// Anatomy:
//   1. Small kicker     — "◆ Competitor Spy"
//   2. Tight headline   — "Agent complete." (purple period)
//   3. Completion meta  — ✓ Completed · 7m 12s · 7-day window
//   4. 4 action cards   — one per discovery, click → smooth scroll
//   5. Scroll nudge     — quiet "↓" cue, no purple-button CTA

function StrategyVerdictCard({
  data,
  discoveries,
  duration,
  window: timeWindow,
}: {
  data: StrategyVerdictData;
  discoveries: DiscoveryV5[];
  duration: string;
  window: string;
}) {
  return (
    <section
      className="relative overflow-hidden rounded-[24px] text-white"
      style={{
        background: 'linear-gradient(180deg, #0F0A1E 0%, #07050D 100%)',
        boxShadow:
          'inset 0 1px 0 rgba(255,255,255,0.05), 0 30px 60px -28px rgba(15,10,30,0.55)',
        padding: 'clamp(28px, 3.4vw, 44px) clamp(28px, 3.6vw, 48px)',
      }}
    >
      {/* Top-right purple bloom */}
      <span
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          top: '-140px',
          right: '-120px',
          width: '500px',
          height: '320px',
          background:
            'radial-gradient(ellipse, rgba(127,90,240,0.20) 0%, transparent 62%)',
        }}
      />

      {/* Header row — kicker + completion meta on one tight line */}
      <div className="relative flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3">
        <p
          className="flex items-baseline gap-[10px]"
          style={{
            fontSize: '16px',
            letterSpacing: '-0.005em',
            color: 'rgba(201,181,255,0.90)',
            fontWeight: 600,
          }}
        >
          <span
            aria-hidden
            style={{
              color: '#A88CFF',
              fontSize: '14px',
              textShadow: '0 0 12px rgba(168,140,255,0.55)',
            }}
          >
            ◆
          </span>
          {data.agentName}
        </p>

        <div className="flex flex-wrap items-center gap-[12px] text-[14px]">
          <span
            className="inline-flex items-center gap-[8px] rounded-full px-[12px] py-[5px] font-semibold"
            style={{
              background: 'rgba(93,202,165,0.14)',
              color: '#9CE5C5',
              boxShadow: 'inset 0 0 0 1px rgba(93,202,165,0.32)',
              letterSpacing: '-0.005em',
            }}
          >
            <span
              aria-hidden
              className="inline-flex h-[14px] w-[14px] items-center justify-center rounded-full"
              style={{ background: '#5DCAA5' }}
            >
              <Check size={9} weight="bold" style={{ color: '#0F0A1E' }} />
            </span>
            Completed
          </span>
          <span style={{ color: 'rgba(184,174,218,0.85)' }}>
            <span
              className="tabular-nums font-bold"
              style={{ color: 'rgba(255,255,255,0.92)' }}
            >
              {duration}
            </span>
            <span style={{ margin: '0 8px', color: 'rgba(184,174,218,0.40)' }}>
              ·
            </span>
            {timeWindow}
          </span>
        </div>
      </div>

      {/* Tight headline — arrival moment, not a verdict statement */}
      <h2
        className="relative mt-4 font-display font-extrabold text-white"
        style={{
          fontSize: 'clamp(28px, 2.8vw, 36px)',
          letterSpacing: '-0.024em',
          lineHeight: 1.1,
        }}
      >
        Agent run complete
        <span style={{ color: '#A88CFF' }}>.</span>
      </h2>
      <p
        className="relative mt-2 text-[15px]"
        style={{ color: 'rgba(184,174,218,0.85)' }}
      >
        {discoveries.length} findings ready —{' '}
        <span style={{ color: 'rgba(255,255,255,0.92)' }}>
          click any card to dive in.
        </span>
      </p>

      {/* 4 action cards — one per discovery, click → smooth-scroll to it */}
      <div className="relative mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {discoveries.map((d) => (
          <VerdictDiscoveryCard key={d.id} discovery={d} />
        ))}
      </div>

      {/* Subtle scroll nudge — no big purple CTA */}
      <a
        href={`#discovery-${discoveries[0]?.id ?? ''}`}
        className="relative mx-auto mt-7 flex w-fit items-center gap-[8px] text-[13px] transition-colors hover:text-white"
        style={{
          color: 'rgba(184,174,218,0.70)',
          letterSpacing: '0.02em',
        }}
      >
        Findings below
        <span
          aria-hidden
          style={{
            color: '#A88CFF',
            fontSize: '12px',
            transform: 'translateY(1px)',
            display: 'inline-block',
          }}
        >
          ↓
        </span>
      </a>
    </section>
  );
}

// ─── Verdict discovery card — preview of one finding inside the verdict ───
// Lives on the dark verdict surface. White-tint-on-dark, with a soft hover
// lift. Click smooth-scrolls to the matching DiscoveryCardV5 below.

function VerdictDiscoveryCard({ discovery }: { discovery: DiscoveryV5 }) {
  const meta = READINESS_META[discovery.readiness];

  return (
    <a
      href={`#discovery-${discovery.id}`}
      className="group relative flex flex-col rounded-[14px] p-[18px] transition-all hover:-translate-y-[1px]"
      style={{
        background: 'rgba(255,255,255,0.04)',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.10)',
        minHeight: '128px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
        e.currentTarget.style.boxShadow =
          'inset 0 0 0 1px rgba(168,140,255,0.40)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
        e.currentTarget.style.boxShadow =
          'inset 0 0 0 1px rgba(255,255,255,0.10)';
      }}
    >
      {/* Top meta row: rank + readiness */}
      <div className="mb-3 flex items-center gap-[8px] text-[12.5px]">
        <span
          aria-hidden
          className="inline-block h-[7px] w-[7px] rounded-full"
          style={{
            background: meta.dot,
            boxShadow: `0 0 0 2.5px ${meta.dot}26`,
          }}
        />
        <span
          className="tabular-nums font-bold"
          style={{ color: 'rgba(255,255,255,0.92)' }}
        >
          {String(discovery.rank).padStart(2, '0')}
        </span>
        <span style={{ color: 'rgba(184,174,218,0.45)' }}>·</span>
        <span
          className="font-semibold"
          style={{ color: 'rgba(255,255,255,0.85)' }}
        >
          {meta.label}
        </span>
      </div>

      {/* Title — the action, 2–3 lines */}
      <p
        className="flex-1 text-[15px] leading-[1.35]"
        style={{
          color: 'rgba(255,255,255,0.96)',
          fontWeight: 600,
          letterSpacing: '-0.01em',
        }}
      >
        {discovery.headline}
      </p>

      {/* Arrow — bottom-right, subtle, animates on hover */}
      <span
        aria-hidden
        className="mt-3 flex justify-end transition-transform group-hover:translate-x-[2px]"
        style={{ color: 'rgba(168,140,255,0.70)' }}
      >
        <ArrowRight size={14} weight="bold" />
      </span>
    </a>
  );
}

// ═════════════════════════════════════════════════════════════════════════
// DISCOVERY CARDS  (icon-led labels, bigger than body)
// ═════════════════════════════════════════════════════════════════════════

function DiscoverySection({
  discoveries,
  projectName,
  onAction,
}: {
  discoveries: DiscoveryV5[];
  projectName: string;
  onAction: (d: DiscoveryV5) => void;
}) {
  return (
    <section className="mb-14 mt-16">
      {/* The findings. — aesthetic moment */}
      <header className="mb-10">
        <h3
          className="font-display font-black text-ppc-ink"
          style={{
            fontSize: 'clamp(56px, 7vw, 88px)',
            letterSpacing: '-0.038em',
            lineHeight: '0.95',
          }}
        >
          The{' '}
          <span
            style={{
              position: 'relative',
              display: 'inline-block',
              transform: 'rotate(-2deg)',
              padding: '0 18px 4px 18px',
            }}
          >
            <span
              aria-hidden
              className="absolute inset-0 rounded-[14px]"
              style={{
                background:
                  'linear-gradient(135deg, #7F5AF0 0%, #6A45E2 100%)',
                boxShadow: '0 16px 30px -16px rgba(127,90,240,0.55)',
                zIndex: 0,
              }}
            />
            <span style={{ position: 'relative', color: 'white', zIndex: 1 }}>
              findings
            </span>
          </span>
          <span style={{ color: '#3C3489' }}>.</span>
        </h3>
        <p className="mt-5 text-[17px] leading-[1.55] text-ppc-text-muted">
          {discoveries.length} in priority order — pick one to act on, or scan
          the lot.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[220px_1fr]">
        <FindingsRail discoveries={discoveries} />

        <div className="flex min-w-0 flex-col gap-10">
          {discoveries.map((d) => (
            <DiscoveryCardV5
              key={d.id}
              discovery={d}
              projectName={projectName}
              onAction={onAction}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function FindingsRail({ discoveries }: { discoveries: DiscoveryV5[] }) {
  return (
    <aside className="hidden lg:sticky lg:top-[200px] lg:block lg:self-start">
      <p
        className="mb-4 text-[13px] font-bold uppercase"
        style={{ letterSpacing: '0.08em', color: '#85819a' }}
      >
        Findings
      </p>
      <ol className="relative flex flex-col gap-1">
        <span
          aria-hidden
          className="absolute left-[15px] top-3 bottom-3 w-[1.5px]"
          style={{ background: '#e0dbed' }}
        />
        {discoveries.map((d) => (
          <li key={d.id}>
            <a
              href={`#discovery-${d.id}`}
              className="relative flex items-start gap-3 rounded-[10px] px-2 py-2.5 text-left transition-colors hover:bg-white/60"
            >
              <span
                aria-hidden
                className="relative z-10 inline-flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full"
                style={{
                  background: '#FFFFFF',
                  boxShadow: '0 0 0 2px #ECEAFA, inset 0 0 0 1px #d9d4ec',
                }}
              >
                <span
                  className="text-[11.5px] font-bold tabular-nums"
                  style={{ color: '#534AB7' }}
                >
                  {String(d.rank).padStart(2, '0')}
                </span>
              </span>
              <span
                className="text-[14px] font-medium leading-[1.4] text-ppc-ink"
                style={{ letterSpacing: '-0.005em' }}
              >
                {shortenHeadline(d.headline)}
              </span>
            </a>
          </li>
        ))}
      </ol>
    </aside>
  );
}

function shortenHeadline(s: string): string {
  // First clause before the em-dash or first 60 chars.
  const dashIdx = s.indexOf(' — ');
  const slice = dashIdx > 0 ? s.slice(0, dashIdx) : s;
  if (slice.length > 64) return slice.slice(0, 60).trimEnd() + '…';
  return slice;
}

function DiscoveryCardV5({
  discovery,
  projectName,
  onAction,
}: {
  discovery: DiscoveryV5;
  projectName: string;
  onAction: (d: DiscoveryV5) => void;
}) {
  return (
    <article
      id={`discovery-${discovery.id}`}
      className="relative overflow-hidden rounded-[24px] bg-white"
      style={{
        boxShadow:
          '0 0 0 1px #e8e2f0, 0 1px 0 rgba(15,10,30,0.02), 0 24px 40px -28px rgba(15,10,30,0.14)',
      }}
    >
      <div className="relative px-10 py-10 sm:px-14 sm:py-12">
        {/* Universal finding marker — a single purple Target glyph above
            the headline. Same icon on every card so the page reads with
            visual rhythm; one accent colour, no rainbow. Soft drop-shadow
            gives it lift without a chip/box. */}
        <div className="mb-5" aria-hidden>
          <Target
            size={28}
            weight="duotone"
            style={{
              color: '#7F5AF0',
              filter: 'drop-shadow(0 0 14px rgba(127,90,240,0.32))',
            }}
          />
        </div>

        {/* Headline — pure editorial opener. */}
        <h4
          className="font-display text-[30px] font-extrabold text-ppc-ink sm:text-[34px]"
          style={{
            letterSpacing: '-0.026em',
            lineHeight: 1.12,
            maxWidth: '900px',
          }}
        >
          {discovery.headline}
        </h4>

        <DiscoverySectionField
          label="What we found"
          body={discovery.whatWeFound}
          icon={<MagnifyingGlass size={17} weight="regular" />}
        />
        <DiscoverySectionField
          label={`Why it matters for ${projectName}`}
          body={discovery.whyItMatters}
          icon={<Lightbulb size={17} weight="regular" />}
        />

        <ActionCallout discovery={discovery} />

        <DiscoverySectionField
          label="Expected outcome"
          body={discovery.expectedOutcome}
          icon={<Sparkle size={17} weight="regular" />}
        />
        <DiscoverySectionField
          label="Risk"
          body={discovery.tradeoffRisk}
          icon={<Warning size={17} weight="regular" />}
        />

        {/* CTAs — restrained. No eyebrow, no subtitle, no tool-calls metadata. */}
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onAction(discovery)}
            className="inline-flex items-center justify-center gap-2 rounded-[14px] px-7 py-4 text-[16px] font-bold text-white transition-transform hover:-translate-y-[1px]"
            style={{
              background: 'linear-gradient(180deg, #8767F3 0%, #6A45E2 100%)',
              boxShadow:
                '0 1px 0 rgba(255,255,255,0.22) inset, 0 12px 24px -10px rgba(127,90,240,0.65)',
              letterSpacing: '-0.012em',
            }}
          >
            {discovery.primaryCta}
            <ArrowRight size={16} weight="bold" />
          </button>
          <button
            type="button"
            onClick={() => onAction(discovery)}
            className="inline-flex items-center gap-2 rounded-[14px] px-[18px] py-[14px] text-[15px] font-semibold text-ppc-text-muted transition-colors hover:bg-ppc-panel-soft hover:text-ppc-ink"
            style={{ boxShadow: 'inset 0 0 0 1px #d9d4ec' }}
          >
            <ChatCircle size={15} weight="bold" />
            Ask the agent
          </button>
        </div>
      </div>
    </article>
  );
}

// ─── Discovery section field — label + body with an optional subtle purple
//     accent icon. ONE purple, never tinted backgrounds, all icons the same
//     size + weight so they read as accent marks not chips.

function DiscoverySectionField({
  label,
  body,
  icon,
}: {
  label: string;
  body: string;
  icon?: React.ReactNode;
}) {
  return (
    <section className="mt-9">
      <h5
        className="flex items-center gap-[10px] text-[17px] font-bold text-ppc-ink"
        style={{ letterSpacing: '-0.012em' }}
      >
        {icon && (
          <span
            aria-hidden
            className="inline-flex shrink-0"
            style={{ color: '#7F5AF0' }}
          >
            {icon}
          </span>
        )}
        {label}
      </h5>
      <p
        className="mt-3 text-[17px] leading-[1.7]"
        style={{ color: '#3c3849', maxWidth: '820px' }}
      >
        {body}
      </p>
    </section>
  );
}

// ─── Action callout — dark refined surface, the card's signature beat ─────
// Identity (rank · readiness · impact) lives inside the callout, not above.
// One ◆ Action kicker. Same surface language as the verdict card.

function ActionCallout({ discovery }: { discovery: DiscoveryV5 }) {
  const meta = READINESS_META[discovery.readiness];
  const impactLabel = IMPACT_STYLES[discovery.impact].label;

  return (
    <section
      className="relative mt-10 overflow-hidden rounded-[22px] text-white"
      style={{
        background: 'linear-gradient(180deg, #0F0A1E 0%, #07050D 100%)',
        boxShadow:
          'inset 0 1px 0 rgba(255,255,255,0.05), 0 24px 40px -28px rgba(15,10,30,0.55)',
      }}
    >
      {/* Top-right purple bloom — atmosphere, not chrome */}
      <span
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          top: '-100px',
          right: '-80px',
          width: '420px',
          height: '260px',
          background:
            'radial-gradient(ellipse, rgba(127,90,240,0.20) 0%, transparent 62%)',
        }}
      />

      <div className="relative px-9 py-9 sm:px-10 sm:py-10">
        {/* Header — ONE line: ◆ Action (larger anchor) on the left,
            identity meta (rank · readiness · impact) on the right. */}
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3">
          <p
            className="flex items-baseline gap-[12px] font-display"
            style={{
              color: 'rgba(255,255,255,0.96)',
              fontWeight: 800,
              fontSize: '26px',
              letterSpacing: '-0.022em',
              lineHeight: 1,
            }}
          >
            <span
              aria-hidden
              style={{
                color: '#A88CFF',
                fontSize: '20px',
                textShadow: '0 0 14px rgba(168,140,255,0.55)',
                transform: 'translateY(-1px)',
                display: 'inline-block',
              }}
            >
              ◆
            </span>
            Action
          </p>

          <div
            className="flex flex-wrap items-center gap-[8px] text-[14px]"
            style={{
              color: 'rgba(184,174,218,0.80)',
              letterSpacing: '-0.005em',
            }}
          >
            <span
              aria-hidden
              className="inline-block h-[8px] w-[8px] rounded-full"
              style={{
                background: meta.dot,
                boxShadow: `0 0 0 3px ${meta.dot}26`,
              }}
            />
            <span
              className="tabular-nums font-bold"
              style={{ color: 'rgba(255,255,255,0.92)' }}
            >
              {String(discovery.rank).padStart(2, '0')}
            </span>
            <span style={{ color: 'rgba(184,174,218,0.40)' }}>·</span>
            <span style={{ fontWeight: 600, color: 'rgba(255,255,255,0.92)' }}>
              {meta.label}
            </span>
            <span style={{ color: 'rgba(184,174,218,0.40)' }}>·</span>
            <span>{impactLabel}</span>
          </div>
        </div>

        {/* Action body — what to do next, in editorial prose, white-on-dark */}
        <p
          className="mt-5 text-[17px] leading-[1.7]"
          style={{
            color: 'rgba(255,255,255,0.92)',
            fontWeight: 500,
            letterSpacing: '-0.005em',
            maxWidth: '820px',
          }}
        >
          {discovery.whatToDoNext}
        </p>
      </div>
    </section>
  );
}

// ═════════════════════════════════════════════════════════════════════════
// ASK THE AGENT
// ═════════════════════════════════════════════════════════════════════════

function AskTheAgentBar({ data }: { data: AgentResultsV5Data['ask'] }) {
  const [value, setValue] = useState('');
  return (
    <section
      className="rounded-[24px] px-10 py-9"
      style={{ background: '#EEEDFE', boxShadow: '0 0 0 1px #d9d4ec' }}
    >
      <h3
        className="mb-2 font-display font-bold text-ppc-ink"
        style={{ fontSize: '22px', letterSpacing: '-0.018em' }}
      >
        Ask {data.agentName}.
      </h3>
      <p className="mb-5 text-[14.5px] leading-[1.55] text-ppc-text-muted">
        Want to sense-check anything before you act?
      </p>

      <div
        className="mb-5 flex items-center gap-2 rounded-[14px] bg-white px-5 py-3"
        style={{ boxShadow: '0 0 0 1px #d9d4ec' }}
      >
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={data.placeholder}
          className="flex-1 bg-transparent text-[15px] text-ppc-ink placeholder:text-ppc-text-faint focus:outline-none"
        />
        <button
          type="button"
          className="inline-flex h-[32px] w-[32px] items-center justify-center rounded-[10px] text-ppc-purple-500 hover:bg-ppc-purple-50"
          aria-label="Send"
        >
          <PaperPlaneTilt size={15} weight="bold" />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {data.suggestedPrompts.map((prompt, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setValue(prompt)}
            className="rounded-full bg-white px-[16px] py-[9px] text-[13px] font-medium text-ppc-purple-700 transition-colors hover:bg-ppc-purple-50"
            style={{ boxShadow: '0 0 0 0.5px #d9d4ec' }}
          >
            {prompt}
          </button>
        ))}
      </div>
    </section>
  );
}

// ═════════════════════════════════════════════════════════════════════════
// ACTION DRAWER  (side panel for the per-Discovery CTA)
// ═════════════════════════════════════════════════════════════════════════

function ActionDrawer({
  discovery,
  agentName,
  onClose,
}: {
  discovery: DiscoveryV5;
  agentName: string;
  onClose: () => void;
}) {
  const isOpen = discovery.readiness === 'open';

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(15,10,30,0.45)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-[560px] flex-col bg-white shadow-2xl"
        style={{ boxShadow: '-30px 0 60px -20px rgba(15,10,30,0.45)' }}
      >
        {/* Header */}
        <header
          className="relative overflow-hidden px-8 py-6 text-white"
          style={{
            background: 'linear-gradient(180deg, #0F0A1E 0%, #1A1030 100%)',
          }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute"
            style={{
              top: '-80px',
              right: '-60px',
              width: '280px',
              height: '200px',
              background:
                'radial-gradient(ellipse, rgba(127,90,240,0.28) 0%, transparent 65%)',
            }}
          />

          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span
                aria-hidden
                className="inline-flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[10px]"
                style={{
                  background: 'rgba(127,90,240,0.20)',
                  boxShadow: 'inset 0 0 0 1px rgba(127,90,240,0.40)',
                }}
              >
                {isOpen ? (
                  <ChatCircle size={18} weight="fill" style={{ color: '#C9B5FF' }} />
                ) : (
                  <Sparkle size={18} weight="fill" style={{ color: '#C9B5FF' }} />
                )}
              </span>
              <div>
                <p
                  className="text-[11.5px] font-bold uppercase"
                  style={{ letterSpacing: '0.12em', color: '#C9B5FF' }}
                >
                  {isOpen ? `Discuss with ${agentName}` : 'Take action'}
                </p>
                <h3
                  className="mt-1 font-display text-[20px] font-extrabold leading-[1.25]"
                  style={{ letterSpacing: '-0.018em' }}
                >
                  {discovery.headline}
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="inline-flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full transition-colors hover:bg-white/10"
              style={{ color: 'rgba(255,255,255,0.85)' }}
            >
              <X size={16} weight="bold" />
            </button>
          </div>
        </header>

        {/* Body — different per readiness */}
        <div className="flex-1 overflow-y-auto px-8 py-7">
          {isOpen ? (
            <ChatBody discovery={discovery} agentName={agentName} />
          ) : (
            <ApplyBody discovery={discovery} />
          )}
        </div>

        {/* Footer CTA */}
        <footer
          className="flex items-center justify-between gap-3 px-8 py-5"
          style={{ borderTop: '1px solid #ece6f3' }}
        >
          <button
            type="button"
            onClick={onClose}
            className="text-[13.5px] font-semibold text-ppc-text-muted transition-colors hover:text-ppc-ink"
          >
            Cancel
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-[12px] px-[18px] py-[12px] text-[14px] font-bold text-white transition-transform hover:-translate-y-[0.5px]"
            style={{
              background: 'linear-gradient(180deg, #8767F3 0%, #6A45E2 100%)',
              boxShadow:
                '0 1px 0 rgba(255,255,255,0.18) inset, 0 8px 18px -8px rgba(127,90,240,0.65)',
            }}
          >
            {isOpen ? (
              <>
                <PaperPlaneTilt size={14} weight="bold" />
                Send to {agentName}
              </>
            ) : (
              <>
                <Check size={14} weight="bold" />
                {discovery.primaryCta}
              </>
            )}
          </button>
        </footer>
      </aside>
    </>
  );
}

function ApplyBody({ discovery }: { discovery: DiscoveryV5 }) {
  return (
    <div>
      <p
        className="mb-2 text-[12px] font-bold uppercase"
        style={{ letterSpacing: '0.12em', color: '#534AB7' }}
      >
        What will happen
      </p>
      <p className="mb-7 text-[15.5px] leading-[1.65] text-ppc-ink" style={{ fontWeight: 500 }}>
        {discovery.whatToDoNext}
      </p>

      <div
        className="mb-6 rounded-[14px] px-6 py-5"
        style={{
          background: '#F8F5FE',
          boxShadow: 'inset 0 0 0 1px #ece6f3',
        }}
      >
        <p
          className="mb-1 text-[11.5px] font-bold uppercase"
          style={{ letterSpacing: '0.10em', color: '#534AB7' }}
        >
          Expected outcome
        </p>
        <p className="text-[14.5px] leading-[1.6] text-ppc-text-muted">
          {discovery.expectedOutcome}
        </p>
      </div>

      <div
        className="rounded-[14px] px-6 py-5"
        style={{
          background: 'rgba(215,181,122,0.08)',
          boxShadow: 'inset 0 0 0 1px rgba(215,181,122,0.32)',
        }}
      >
        <p
          className="mb-1 text-[11.5px] font-bold uppercase"
          style={{ letterSpacing: '0.10em', color: '#915214' }}
        >
          Tradeoff / risk
        </p>
        <p className="text-[14.5px] leading-[1.6]" style={{ color: '#6b6480' }}>
          {discovery.tradeoffRisk}
        </p>
      </div>

      <p className="mt-7 text-[13px] text-ppc-text-faint">
        This is a mock preview. In production, this is where you'd see the
        exact ad copy, keyword list, or campaign change being applied —
        with confirm / cancel before anything ships.
      </p>
    </div>
  );
}

function ChatBody({
  discovery,
  agentName,
}: {
  discovery: DiscoveryV5;
  agentName: string;
}) {
  const suggestedPrompts = [
    `Why can't you call this without the lead-to-sale rate?`,
    `What would change if I added it?`,
    `Show me the data you used to flag this.`,
  ];
  return (
    <div>
      <div className="mb-6 flex items-start gap-3">
        <div
          className="relative shrink-0"
          style={{ width: '52px', height: '52px' }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute"
            style={{
              top: '50%',
              left: '50%',
              width: '72px',
              height: '72px',
              transform: 'translate(-50%, -50%)',
              background:
                'radial-gradient(circle, rgba(127,90,240,0.30) 0%, transparent 65%)',
            }}
          />
          <div className="relative" style={{ transform: 'scale(0.22)', transformOrigin: 'top left' }}>
            <SpyMascot size={240} />
          </div>
        </div>
        <div>
          <p className="text-[15px] font-semibold text-ppc-ink">{agentName}</p>
          <p
            className="mt-2 rounded-[16px] bg-ppc-panel-soft px-5 py-4 text-[14.5px] leading-[1.6] text-ppc-ink"
            style={{ maxWidth: '380px' }}
          >
            This one's an open question. I flagged it because{' '}
            <span style={{ fontWeight: 600 }}>{discovery.contextMissingItem ?? 'a key piece of business context'}</span>{' '}
            isn't in your Boulder Care profile yet — without it I can't tell
            whether your branded CPC is profitable defence or wasteful
            coverage. Want to add the data, or talk through it?
          </p>
        </div>
      </div>

      <p
        className="mb-2 text-[11.5px] font-bold uppercase"
        style={{ letterSpacing: '0.12em', color: '#534AB7' }}
      >
        Try a question
      </p>
      <div className="flex flex-wrap gap-2">
        {suggestedPrompts.map((p, i) => (
          <button
            key={i}
            type="button"
            className="rounded-full bg-white px-[14px] py-[8px] text-[13px] font-medium text-ppc-purple-700 transition-colors hover:bg-ppc-purple-50"
            style={{ boxShadow: '0 0 0 1px #d9d4ec' }}
          >
            {p}
          </button>
        ))}
      </div>

      <div
        className="mt-6 flex items-center gap-2 rounded-[14px] bg-white px-5 py-3"
        style={{ boxShadow: '0 0 0 1px #d9d4ec' }}
      >
        <input
          type="text"
          placeholder={`Ask ${agentName}...`}
          className="flex-1 bg-transparent text-[15px] text-ppc-ink placeholder:text-ppc-text-faint focus:outline-none"
        />
      </div>
    </div>
  );
}




// ═════════════════════════════════════════════════════════════════════════
// PALETTES
// ═════════════════════════════════════════════════════════════════════════

const READINESS_META: Record<
  Readiness,
  {
    label: string;
    bg: string;
    text: string;
    dot: string;
    impactCopy: (impact: Impact) => string;
  }
> = {
  ready: {
    label: 'Ready to act',
    bg: 'rgba(93,202,165,0.12)',
    text: '#2A7E5E',
    dot: '#5DCAA5',
    impactCopy: (impact) => `${IMPACT_STYLES[impact].label} · low risk`,
  },
  review: {
    label: 'Needs review',
    bg: 'rgba(186,117,23,0.12)',
    text: '#915214',
    dot: '#BA7517',
    impactCopy: (impact) => `${IMPACT_STYLES[impact].label} · judgment call`,
  },
  open: {
    label: 'Open question',
    bg: 'rgba(127,90,240,0.12)',
    text: '#534AB7',
    dot: '#7F5AF0',
    impactCopy: (impact) => `${IMPACT_STYLES[impact].label} · needs context`,
  },
  watchlist: {
    label: 'Watchlist',
    bg: 'rgba(145,138,178,0.16)',
    text: '#5b5575',
    dot: '#918AB2',
    impactCopy: (impact) => `${IMPACT_STYLES[impact].label} · monitor`,
  },
};

const IMPACT_STYLES: Record<
  Impact,
  { label: string; bg: string; text: string; dot: string }
> = {
  high:   { label: 'High impact',   bg: 'rgba(242,74,46,0.10)',  text: '#a8311c', dot: '#F24A2E' },
  medium: { label: 'Medium impact', bg: 'rgba(226,165,54,0.12)', text: '#915214', dot: '#E2A536' },
  low:    { label: 'Low impact',    bg: 'rgba(176,169,194,0.18)',text: '#5b5575', dot: '#9F98B6' },
};
