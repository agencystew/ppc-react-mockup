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
  TrendUp,
} from '@phosphor-icons/react';

import { SpyMascot } from '../../components/SpyMascot';
import type {
  AgentResultsV5Data,
  DiscoveryV5,
  WinV5,
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
          receipts={data.hero.receipts}
        />
        {/* Wins lead, then findings — one shared rail, one section.
            Start with what's working, then move into what needs thought. */}
        <DiscoverySection
          wins={data.wins}
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
  receipts,
}: {
  data: StrategyVerdictData;
  discoveries: DiscoveryV5[];
  duration: string;
  window: string;
  receipts: string;
}) {
  // Parse "161 reasoning steps · 84 SERPs analysed · 6 phases" into chips.
  // Each chip splits the first numeric prefix from the label so the value
  // can be rendered bold-tabular and the noun whispered next to it.
  const stats = receipts
    .split('·')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((entry) => {
      const m = entry.match(/^([\d,.]+)\s+(.*)$/);
      return m ? { value: m[1], label: m[2] } : { value: '', label: entry };
    });

  return (
    <section
      className="relative overflow-hidden rounded-[24px] text-white"
      style={{
        background: 'linear-gradient(180deg, #0F0A1E 0%, #07050D 100%)',
        boxShadow:
          'inset 0 1px 0 rgba(255,255,255,0.05), 0 30px 60px -28px rgba(15,10,30,0.55)',
        padding: 'clamp(32px, 3.6vw, 52px) clamp(28px, 3.6vw, 48px)',
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

      {/* Centered arrival moment — sandwich layout.
          Top → bottom, all centered:
            1. TopMetaRow — ◆ Competitor Spy · ✓ Completed pill · 7m 12s run time
            2. Sparkle decoration with thin flanking lines
            3. "Explore your findings." mega headline
            4. Sub-line counting the findings
            5. ReceiptsRow — 161 reasoning steps · 84 SERPs analysed · 6 phases · 7-day window
            6. Playful down arrow as the scroll cue.

          The two meta rows (what happened, then what it took) sandwich the
          headline so the eye lands on the moment first and finds the proof
          on either side. */}
      <div className="relative flex flex-col items-center text-center">
        {/* Top meta row — what happened */}
        <TopMetaRow agentName={data.agentName} duration={duration} />

        {/* Decorative sparkle with thin flanking lines */}
        <div
          aria-hidden
          className="mb-5 mt-5 flex items-center gap-[14px]"
        >
          <span
            style={{
              width: '36px',
              height: '1px',
              background:
                'linear-gradient(90deg, transparent 0%, rgba(168,140,255,0.55) 100%)',
            }}
          />
          <Sparkle
            size={20}
            weight="fill"
            style={{
              color: '#A88CFF',
              filter: 'drop-shadow(0 0 14px rgba(127,90,240,0.60))',
            }}
          />
          <span
            style={{
              width: '36px',
              height: '1px',
              background:
                'linear-gradient(90deg, rgba(168,140,255,0.55) 0%, transparent 100%)',
            }}
          />
        </div>

        {/* Bold sans + serif italic mix — same energy as "Hold tight." */}
        <h2
          className="font-display font-black text-white"
          style={{
            fontSize: 'clamp(38px, 4.4vw, 60px)',
            letterSpacing: '-0.032em',
            lineHeight: 1.04,
          }}
        >
          Explore your{' '}
          <span
            className="font-serif italic"
            style={{ color: '#A88CFF', fontWeight: 600 }}
          >
            findings
          </span>
          <span style={{ color: '#A88CFF' }}>.</span>
        </h2>

        <p
          className="mt-4 text-[16px]"
          style={{ color: 'rgba(184,174,218,0.85)' }}
        >
          {discoveries.length} high-impact moves waiting below.
        </p>

        {/* Bottom meta row — what it took (the receipts) */}
        <ReceiptsRow stats={stats} window={timeWindow} />

        {/* Playful downward arrow — sinuous S-curve, clickable scroll-jump */}
        <a
          href={`#discovery-${discoveries[0]?.id ?? ''}`}
          aria-label="Scroll to findings"
          className="mt-7 inline-block transition-transform hover:translate-y-[3px]"
        >
          <PlayfulDownArrow />
        </a>
      </div>
    </section>
  );
}

/* TopMetaRow — first half of the sandwich. Sits ABOVE the headline.
 * Carries: ◆ Competitor Spy · ✓ Completed · 7m 12s run time. The
 * agent byline and the completion pill flank the run time so the user
 * lands on what happened before reading the moment. */
function TopMetaRow({ agentName, duration }: { agentName: string; duration: string }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-[14px] gap-y-3 text-[15px]">
      {/* ◆ Competitor Spy */}
      <span
        className="inline-flex items-baseline gap-[10px]"
        style={{
          letterSpacing: '-0.008em',
          color: 'rgba(214,200,255,0.95)',
          fontWeight: 600,
        }}
      >
        <span
          aria-hidden
          style={{
            color: '#A88CFF',
            fontSize: '13px',
            textShadow: '0 0 14px rgba(168,140,255,0.65)',
          }}
        >
          ◆
        </span>
        {agentName}
      </span>

      <span aria-hidden style={{ color: 'rgba(184,174,218,0.30)' }}>·</span>

      {/* ✓ Completed pill */}
      <span
        className="inline-flex items-center gap-[8px] rounded-full px-[14px] py-[6px] font-semibold"
        style={{
          background: 'rgba(93,202,165,0.14)',
          color: '#9CE5C5',
          boxShadow: 'inset 0 0 0 1px rgba(93,202,165,0.32)',
          letterSpacing: '-0.005em',
          fontSize: '14px',
        }}
      >
        <span
          aria-hidden
          className="inline-flex h-[15px] w-[15px] items-center justify-center rounded-full"
          style={{ background: '#5DCAA5' }}
        >
          <Check size={10} weight="bold" style={{ color: '#0F0A1E' }} />
        </span>
        Completed
      </span>

      <span aria-hidden style={{ color: 'rgba(184,174,218,0.30)' }}>·</span>

      {/* Run time */}
      <span
        className="inline-flex items-baseline gap-[6px]"
        style={{ color: 'rgba(184,174,218,0.85)' }}
      >
        <span
          className="tabular-nums font-bold"
          style={{ color: 'rgba(255,255,255,0.94)', letterSpacing: '-0.005em' }}
        >
          {duration}
        </span>
        <span>run time</span>
      </span>
    </div>
  );
}

/* ReceiptsRow — second half of the sandwich. Sits BELOW the headline.
 * Carries the proof of work: reasoning steps · datasets analysed · phases
 * · the time window. Same value(bold-tabular-white) + noun(muted-lavender)
 * pattern as the top row, dots interspersed at 0.30 alpha. */
function ReceiptsRow({
  stats,
  window: timeWindow,
}: {
  stats: Array<{ value: string; label: string }>;
  window: string;
}) {
  const slots: Array<{ value: string; label: string }> = [
    ...stats,
    { value: '', label: timeWindow },
  ];
  return (
    <div className="mt-7 flex flex-wrap items-center justify-center gap-x-[14px] gap-y-3 text-[14.5px]">
      {slots.map((s, i) => (
        <span key={i} className="inline-flex items-baseline gap-[8px]">
          <span
            className="inline-flex items-baseline gap-[6px]"
            style={{ color: 'rgba(184,174,218,0.85)' }}
          >
            {s.value && (
              <span
                className="tabular-nums font-bold"
                style={{ color: 'rgba(255,255,255,0.94)', letterSpacing: '-0.005em' }}
              >
                {s.value}
              </span>
            )}
            <span>{s.label}</span>
          </span>
          {i < slots.length - 1 && (
            <span aria-hidden style={{ color: 'rgba(184,174,218,0.30)' }}>·</span>
          )}
        </span>
      ))}
    </div>
  );
}

// ─── Playful downward arrow ──────────────────────────────────────────────
// Sinuous S-curve drawn left-right-left then tipped with a small chevron.
// Lives at the bottom of the verdict card and invites the eye downward.

function PlayfulDownArrow() {
  return (
    <svg
      width="56"
      height="76"
      viewBox="0 0 56 76"
      fill="none"
      aria-hidden
      style={{
        color: '#A88CFF',
        filter: 'drop-shadow(0 0 14px rgba(127,90,240,0.45))',
      }}
    >
      <path
        d="M 28 4 C 12 14, 44 28, 28 42 C 12 56, 44 60, 28 68"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M 21 62 L 28 70 L 35 62"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ═════════════════════════════════════════════════════════════════════════
// DISCOVERY CARDS  (icon-led labels, bigger than body)
// ═════════════════════════════════════════════════════════════════════════

// ═════════════════════════════════════════════════════════════════════════
// DISCOVERY SECTION — single list. The first "finding" is the Wins card.
// Same rail, same flow, no separate group. Start with what's working,
// then move into what needs thought.
// ═════════════════════════════════════════════════════════════════════════

const WIN_GREEN_INK = '#2F8F6E';
const WIN_GREEN_LINE = '#cce8d7';

function DiscoverySection({
  wins,
  discoveries,
  projectName,
  onAction,
}: {
  wins: WinV5[];
  discoveries: DiscoveryV5[];
  projectName: string;
  onAction: (d: DiscoveryV5) => void;
}) {
  return (
    <section className="mb-14 mt-12">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[220px_1fr]">
        <FindingsRail discoveries={discoveries} />

        <div className="flex min-w-0 flex-col gap-10">
          <WinsCard wins={wins} />
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

// One rail, one list. Wins is the first entry (green check, no number),
// then findings 01–N follow. Reads as one thread, not two.
function FindingsRail({ discoveries }: { discoveries: DiscoveryV5[] }) {
  return (
    <aside className="hidden lg:sticky lg:top-[200px] lg:block lg:self-start">
      <ol className="relative flex flex-col gap-1">
        <span
          aria-hidden
          className="absolute left-[15px] top-3 bottom-3 w-[1.5px]"
          style={{ background: '#e0dbed' }}
        />
        <li>
          <a
            href="#wins-card"
            className="relative flex items-start gap-3 rounded-[10px] px-2 py-2.5 text-left transition-colors hover:bg-white/60"
          >
            <span
              aria-hidden
              className="relative z-10 inline-flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full"
              style={{
                background: '#FFFFFF',
                boxShadow: `0 0 0 2px #ECEAFA, inset 0 0 0 1.5px ${WIN_GREEN_LINE}`,
              }}
            >
              <Check size={13} weight="bold" style={{ color: WIN_GREEN_INK }} />
            </span>
            <span
              className="text-[14px] font-semibold leading-[1.4] text-ppc-ink"
              style={{ letterSpacing: '-0.005em' }}
            >
              What's working
            </span>
          </a>
        </li>
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

// Wins card — sits as the FIRST card in the findings list. Same card
// chrome as a DiscoveryCardV5 so it reads as one entry in the same flow.
// Green left accent + TrendUp glyph distinguishes it as the positive lead.
function WinsCard({ wins }: { wins: WinV5[] }) {
  return (
    <article
      id="wins-card"
      className="relative overflow-hidden rounded-[24px] bg-white"
      style={{
        boxShadow:
          '0 0 0 1px #e8e2f0, 0 1px 0 rgba(15,10,30,0.02), 0 24px 40px -28px rgba(15,10,30,0.14)',
      }}
    >
      <span
        aria-hidden
        className="absolute left-0 top-0 h-full w-[3px]"
        style={{ background: WIN_GREEN_INK }}
      />
      <div className="px-10 py-9 sm:px-14 sm:py-10">
        <div className="mb-7 flex items-center gap-3">
          <TrendUp
            size={22}
            weight="duotone"
            style={{
              color: WIN_GREEN_INK,
              filter: 'drop-shadow(0 0 12px rgba(93,202,165,0.32))',
            }}
          />
          <h3
            className="font-display text-[22px] font-extrabold text-ppc-ink"
            style={{ letterSpacing: '-0.02em' }}
          >
            What's working
          </h3>
        </div>

        <ol className="flex flex-col gap-5">
          {wins.map((w) => (
            <li key={w.id} className="flex gap-4">
              <span
                aria-hidden
                className="mt-[3px] inline-flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full"
                style={{
                  background: '#FFFFFF',
                  boxShadow: `inset 0 0 0 1.5px ${WIN_GREEN_LINE}`,
                }}
              >
                <Check size={13} weight="bold" style={{ color: WIN_GREEN_INK }} />
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className="text-[16.5px] font-bold leading-[1.35] text-ppc-ink"
                  style={{ letterSpacing: '-0.012em' }}
                >
                  {w.headline}
                </p>
                <p className="mt-1.5 text-[14.5px] leading-[1.55] text-ppc-text-muted">
                  {w.whatsWorking}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </article>
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
