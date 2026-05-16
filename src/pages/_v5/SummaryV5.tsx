// v5 AI Summary tab.
//
// Layout (Hero lives one level up in AgentResultsV5, ABOVE the tabs):
//   1. StrategyVerdictCard      — punchy strategist take, no filler triage list
//   2. DiscoveryCardV5 stack    — 6 paired fields with icon-led labels
//   3. ChecksBeforeExport       — operational pre-flight
//   4. AskTheAgentBar           — run-specific suggestion chips
//
// Design doc: docs/plans/2026-05-16-agent-results-v5-design.md

import { useState } from 'react';
import {
  CaretRight,
  ChatCircle,
  MagnifyingGlass,
  PaperPlaneTilt,
  Target,
  Compass,
  Lightning,
  Sparkle,
  Warning,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  X,
  Check,
} from '@phosphor-icons/react';

import { SpyMascot } from '../../components/SpyMascot';
import type {
  AgentResultsV5Data,
  ContextStatus,
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
        <StrategyVerdictCard data={data.verdict} />
        <DiscoverySection
          discoveries={data.discoveries}
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
// STRATEGY VERDICT  (no triage filler, no "why downgraded" panel)
// ═════════════════════════════════════════════════════════════════════════

function StrategyVerdictCard({ data }: { data: StrategyVerdictData }) {
  return (
    <section
      className="relative overflow-hidden rounded-[24px] bg-white"
      style={{
        padding: '48px 56px 44px',
        boxShadow:
          '0 0 0 1px #e8e2f0, 0 24px 48px -28px rgba(15,10,30,0.18)',
      }}
    >
      {/* Eyebrow + headline collapsed into one moderately-large line */}
      <h2
        className="font-display font-bold text-ppc-ink"
        style={{
          fontSize: 'clamp(24px, 2.6vw, 30px)',
          letterSpacing: '-0.022em',
          lineHeight: 1.3,
          maxWidth: '980px',
        }}
      >
        <span style={{ color: '#7F5AF0', marginRight: '10px' }}>◆</span>
        <span style={{ color: '#534AB7', fontWeight: 600 }}>
          {data.agentName}'s verdict —
        </span>{' '}
        {data.headline}
      </h2>

      <p
        className="mt-6 text-[17px] leading-[1.7] text-ppc-text-muted"
        style={{ maxWidth: '760px' }}
      >
        {data.body}
      </p>

      {data.bullets && data.bullets.length > 0 && (
        <ul className="mt-9 flex flex-col gap-4" style={{ maxWidth: '820px' }}>
          {data.bullets.map((b, i) => (
            <VerdictBullet key={i} text={b} />
          ))}
        </ul>
      )}

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <PrimaryButton
          label={data.primaryCta}
          icon={<ArrowRight size={12} weight="bold" />}
        />
        <SecondaryButton
          label={data.secondaryCta}
          icon={<ChatCircle size={13} weight="bold" />}
        />
      </div>
    </section>
  );
}

function VerdictBullet({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-4">
      <span
        aria-hidden
        className="mt-[10px] inline-flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-full"
        style={{
          background: 'rgba(127,90,240,0.12)',
        }}
      >
        <span
          aria-hidden
          className="inline-block h-[8px] w-[8px] rounded-full"
          style={{ background: '#7F5AF0' }}
        />
      </span>
      <span
        className="text-[16px] leading-[1.65]"
        style={{
          color: '#1a1625',
          fontWeight: 500,
          letterSpacing: '-0.008em',
        }}
      >
        {text}
      </span>
    </li>
  );
}

// ═════════════════════════════════════════════════════════════════════════
// DISCOVERY CARDS  (icon-led labels, bigger than body)
// ═════════════════════════════════════════════════════════════════════════

function DiscoverySection({
  discoveries,
  onAction,
}: {
  discoveries: DiscoveryV5[];
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
        <p className="mt-5 text-[16px] leading-[1.55] text-ppc-text-muted">
          {discoveries.length} in priority order — pick one to act on, or scan
          the lot.
        </p>
      </header>

      {/* Two-column: mini findings rail + stacked cards */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[200px_1fr]">
        <FindingsRail discoveries={discoveries} />

        <div className="flex min-w-0 flex-col gap-6">
          {discoveries.map((d) => (
            <DiscoveryCardV5 key={d.id} discovery={d} onAction={onAction} />
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
        className="mb-4 text-[11.5px] font-bold uppercase"
        style={{ letterSpacing: '0.12em', color: '#534AB7' }}
      >
        Key findings
      </p>
      <ol className="relative flex flex-col gap-1">
        <span
          aria-hidden
          className="absolute left-[15px] top-3 bottom-3 w-[2px]"
          style={{ background: '#e6e1ef' }}
        />
        {discoveries.map((d) => {
          const meta = RAIL_READINESS_META[d.readiness];
          return (
            <li key={d.id}>
              <a
                href={`#discovery-${d.id}`}
                className="relative flex items-start gap-3 rounded-[10px] px-2 py-2.5 text-left transition-colors hover:bg-white/60"
              >
                <span
                  aria-hidden
                  className="relative z-10 inline-flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: meta.dotBg,
                    boxShadow: '0 0 0 2px #ECEAFA',
                  }}
                >
                  <span
                    className="text-[10.5px] font-bold tabular-nums"
                    style={{ color: meta.dot }}
                  >
                    {String(d.rank).padStart(2, '0')}
                  </span>
                </span>
                <span
                  className="text-[13px] font-medium leading-[1.35] text-ppc-ink"
                  style={{ letterSpacing: '-0.005em' }}
                >
                  {shortenHeadline(d.headline)}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}

const RAIL_READINESS_META: Record<
  Readiness,
  { dot: string; dotBg: string }
> = {
  ready:     { dot: '#1F6F4F', dotBg: 'rgba(93,202,165,0.18)' },
  review:    { dot: '#915214', dotBg: 'rgba(186,117,23,0.18)' },
  open:      { dot: '#534AB7', dotBg: 'rgba(127,90,240,0.18)' },
  watchlist: { dot: '#5b5575', dotBg: 'rgba(145,138,178,0.20)' },
};

function shortenHeadline(s: string): string {
  // First clause before the em-dash or first 60 chars.
  const dashIdx = s.indexOf(' — ');
  const slice = dashIdx > 0 ? s.slice(0, dashIdx) : s;
  if (slice.length > 64) return slice.slice(0, 60).trimEnd() + '…';
  return slice;
}

function DiscoveryCardV5({
  discovery,
  onAction,
}: {
  discovery: DiscoveryV5;
  onAction: (d: DiscoveryV5) => void;
}) {
  const railGradient = READINESS_RAIL[discovery.readiness];
  const readinessMeta = READINESS_META[discovery.readiness];
  const impactDot = IMPACT_STYLES[discovery.impact].dot;

  return (
    <article
      id={`discovery-${discovery.id}`}
      className="relative overflow-hidden rounded-[20px] bg-white"
      style={{
        boxShadow:
          '0 0 0 1px #e8e2f0, 0 1px 0 rgba(15,10,30,0.02), 0 24px 40px -28px rgba(15,10,30,0.14)',
      }}
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-[4px]"
        style={{ background: railGradient }}
      />

      <div className="relative px-10 py-9 sm:px-12 sm:py-10">
        <header className="mb-5 flex items-center gap-3">
          <ReadinessChip readiness={discovery.readiness} />
          <span
            aria-hidden
            className="inline-block h-[5px] w-[5px] rounded-full"
            style={{ background: impactDot }}
          />
          <span className="text-[12.5px] font-medium text-ppc-text-muted">
            {readinessMeta.impactCopy(discovery.impact)}
          </span>
        </header>

        <h4
          className="font-display text-[28px] font-extrabold text-ppc-ink sm:text-[32px]"
          style={{
            letterSpacing: '-0.024em',
            lineHeight: 1.15,
            maxWidth: '900px',
          }}
        >
          {discovery.headline}
        </h4>

        {/* Split: LEFT (grounding) → squiggly arrow → RIGHT (action, dark) */}
        <div className="mt-10 grid grid-cols-1 gap-y-8 md:grid-cols-[1fr_72px_1fr] md:items-stretch">
          {/* LEFT — grounding */}
          <div className="flex flex-col gap-7">
            <Field
              label="What we found"
              icon={<MagnifyingGlass size={15} weight="bold" />}
              labelColor="#534AB7"
              body={discovery.whatWeFound}
            />
            <Field
              label="Why it matters"
              icon={<Lightning size={15} weight="fill" />}
              labelColor="#2A7E5E"
              body={discovery.whyItMatters}
            />
            <BusinessContextField
              value={discovery.businessContextUsed}
              status={discovery.contextStatus}
              missing={discovery.contextMissingItem}
            />
          </div>

          {/* Squiggly arrow — playful purple bridge from analysis to action */}
          <div className="hidden items-center justify-center md:flex">
            <SquigglyArrow />
          </div>

          {/* RIGHT — dark action panel */}
          <aside
            className="relative overflow-hidden rounded-[20px] p-7"
            style={{
              background:
                'radial-gradient(120% 80% at 50% 0%, #1A1030 0%, #0F0A1E 60%)',
              boxShadow: '0 24px 40px -28px rgba(15,10,30,0.45)',
            }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute"
              style={{
                top: '-60px',
                right: '-60px',
                width: '220px',
                height: '180px',
                background:
                  'radial-gradient(ellipse, rgba(127,90,240,0.30) 0%, transparent 60%)',
              }}
            />
            <p
              className="relative mb-5 text-[11.5px] font-bold uppercase"
              style={{ letterSpacing: '0.12em', color: '#C9B5FF' }}
            >
              The move
            </p>

            <div className="relative flex flex-col gap-6">
              <DarkField
                label="What to do next"
                icon={<Compass size={15} weight="bold" />}
                body={discovery.whatToDoNext}
                emphasis
              />
              <DarkField
                label="Expected outcome"
                icon={<Sparkle size={15} weight="fill" />}
                body={discovery.expectedOutcome}
              />
              <DarkField
                label="Tradeoff / risk"
                icon={<Warning size={15} weight="fill" />}
                body={discovery.tradeoffRisk}
              />
            </div>
          </aside>
        </div>

        {/* BIG action band — closes the "what next" loop */}
        <ActionBand
          discovery={discovery}
          onAction={() => onAction(discovery)}
        />
      </div>
    </article>
  );
}

function ActionBand({
  discovery,
  onAction,
}: {
  discovery: DiscoveryV5;
  onAction: () => void;
}) {
  const isOpen = discovery.readiness === 'open';
  const ctaLabel = isOpen
    ? 'Discuss with the agent'
    : discovery.primaryCta;
  const ctaSubtitle = isOpen
    ? 'Chat about the missing context with Competitor Spy'
    : (() => {
        if (discovery.readiness === 'ready')
          return 'Preview the change before anything ships';
        if (discovery.readiness === 'review')
          return 'Walk through the items before approving';
        return 'Pick up where the agent left off';
      })();
  const ctaIcon = isOpen ? (
    <ChatCircle size={18} weight="fill" />
  ) : (
    <ArrowRight size={18} weight="bold" />
  );

  return (
    <div
      className="relative mt-10 overflow-hidden rounded-[20px]"
      style={{
        background:
          'linear-gradient(135deg, #F6F0FF 0%, #ECE5FF 50%, #F4ECFF 100%)',
        boxShadow: 'inset 0 0 0 1px rgba(127,90,240,0.16)',
      }}
    >
      {/* Soft purple bloom */}
      <span
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          top: '-60px',
          right: '-60px',
          width: '240px',
          height: '180px',
          background:
            'radial-gradient(ellipse, rgba(127,90,240,0.25) 0%, transparent 65%)',
        }}
      />

      <div className="relative flex flex-col items-stretch gap-5 px-7 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <p
            className="mb-1 text-[11.5px] font-bold uppercase"
            style={{ letterSpacing: '0.12em', color: '#534AB7' }}
          >
            What next
          </p>
          <p
            className="text-[15px] leading-[1.45]"
            style={{ color: '#1a1625', fontWeight: 500 }}
          >
            {ctaSubtitle}
          </p>
          <div className="mt-2 flex items-center gap-3 text-[12px] text-ppc-text-muted">
            <Target size={11} weight="bold" />
            <span className="tabular-nums">{discovery.toolCalls} tool calls</span>
            <span style={{ color: '#c9c2dd' }}>·</span>
            <button
              type="button"
              className="font-semibold text-ppc-purple-700 transition-colors hover:text-ppc-purple-500"
            >
              Show working
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center justify-center gap-2.5 rounded-[14px] px-7 py-4 text-[16px] font-bold text-white transition-transform hover:-translate-y-[1px]"
          style={{
            background: 'linear-gradient(180deg, #8767F3 0%, #6A45E2 100%)',
            boxShadow:
              '0 1px 0 rgba(255,255,255,0.22) inset, 0 12px 24px -10px rgba(127,90,240,0.65)',
            letterSpacing: '-0.012em',
            minWidth: '260px',
          }}
        >
          {ctaIcon}
          {ctaLabel}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  icon,
  labelColor,
  body,
  emphasis,
}: {
  label: string;
  icon: React.ReactNode;
  labelColor: string;
  body: string;
  emphasis?: boolean;
}) {
  return (
    <div>
      <h5
        className="mb-3 flex items-center gap-[8px] text-[16px] font-bold"
        style={{
          color: labelColor,
          letterSpacing: '-0.012em',
        }}
      >
        <span
          aria-hidden
          className="inline-flex h-[28px] w-[28px] items-center justify-center rounded-[8px]"
          style={{
            background: hexToTint(labelColor, 0.1),
            color: labelColor,
          }}
        >
          {icon}
        </span>
        {label}
      </h5>
      <p
        className="text-[15px] leading-[1.7]"
        style={{
          color: emphasis ? '#1a1625' : '#6b6480',
          fontWeight: emphasis ? 500 : 400,
        }}
      >
        {body}
      </p>
    </div>
  );
}

function DarkField({
  label,
  icon,
  body,
  emphasis,
}: {
  label: string;
  icon: React.ReactNode;
  body: string;
  emphasis?: boolean;
}) {
  return (
    <div>
      <h5
        className="mb-3 flex items-center gap-[8px] text-[15.5px] font-bold"
        style={{ color: '#C9B5FF', letterSpacing: '-0.012em' }}
      >
        <span
          aria-hidden
          className="inline-flex h-[28px] w-[28px] items-center justify-center rounded-[8px]"
          style={{
            background: 'rgba(168,140,255,0.18)',
            color: '#C9B5FF',
          }}
        >
          {icon}
        </span>
        {label}
      </h5>
      <p
        className="text-[14.5px] leading-[1.7]"
        style={{
          color: emphasis
            ? 'rgba(255,255,255,0.95)'
            : 'rgba(184,174,218,0.92)',
          fontWeight: emphasis ? 500 : 400,
        }}
      >
        {body}
      </p>
    </div>
  );
}

function SquigglyArrow() {
  return (
    <svg
      width="72"
      height="48"
      viewBox="0 0 72 48"
      aria-hidden
      className="overflow-visible"
    >
      <path
        d="M 4 24 C 14 8, 22 40, 36 22 L 52 22"
        fill="none"
        stroke="#7F5AF0"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M 47 16 L 56 22 L 47 28"
        fill="none"
        stroke="#7F5AF0"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BusinessContextField({
  value,
  status,
  missing,
}: {
  value: string;
  status: ContextStatus;
  missing?: string;
}) {
  const labelColor = '#915214';
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h5
          className="flex items-center gap-[8px] text-[16px] font-bold"
          style={{ color: labelColor, letterSpacing: '-0.012em' }}
        >
          <span
            aria-hidden
            className="inline-flex h-[28px] w-[28px] items-center justify-center rounded-[8px]"
            style={{
              background: hexToTint(labelColor, 0.1),
              color: labelColor,
            }}
          >
            <PuzzlePiece size={15} weight="fill" />
          </span>
          Business context used
        </h5>
        <ContextStatusBadge status={status} />
      </div>
      <p className="text-[15px] leading-[1.7] text-ppc-text-muted">{value}</p>
      {status === 'downgraded' && missing && (
        <p className="mt-2 text-[14px] leading-[1.55]">
          <span style={{ color: labelColor, fontWeight: 600 }}>Missing: </span>
          <span style={{ color: labelColor }}>{missing}</span>{' '}
          <a
            href="/projects/boulder-care/context"
            className="inline-flex items-center gap-1 font-semibold text-ppc-purple-500 hover:text-ppc-purple-600"
          >
            Add to project
            <CaretRight size={11} weight="bold" />
          </a>
        </p>
      )}
    </div>
  );
}

function ContextStatusBadge({ status }: { status: ContextStatus }) {
  if (status === 'complete') return null;
  const isUp = status === 'upgraded';
  return (
    <span
      className="inline-flex items-center gap-1 align-middle text-[12px] font-semibold"
      style={{ color: isUp ? '#2A7E5E' : '#915214' }}
    >
      {isUp ? (
        <ArrowUp size={11} weight="bold" />
      ) : (
        <ArrowDown size={11} weight="bold" />
      )}
      {isUp ? 'Upgraded' : 'Confidence reduced'}
    </span>
  );
}

function EvidenceEyebrow({
  toolCalls,
  dataPoints,
}: {
  toolCalls: number;
  dataPoints: string;
}) {
  return (
    <span className="inline-flex items-center gap-[8px] text-[12.5px] text-ppc-text-faint">
      <Target size={12} weight="bold" />
      <span className="tabular-nums">{toolCalls} tool calls</span>
      <span>·</span>
      <span>{dataPoints}</span>
    </span>
  );
}

// ═════════════════════════════════════════════════════════════════════════
// CHECKS BEFORE EXPORT
// ═════════════════════════════════════════════════════════════════════════

function ChecksBeforeExport({
  checks,
}: {
  checks: AgentResultsV5Data['checks'];
}) {
  return (
    <section className="mb-12">
      <header className="mb-6">
        <h3
          className="mb-2 font-display font-bold text-ppc-ink"
          style={{ fontSize: '22px', letterSpacing: '-0.018em' }}
        >
          Checks before export.
        </h3>
        <p className="text-[14.5px] leading-[1.55] text-ppc-text-muted">
          A few things to confirm before acting on the ready-to-go findings.
        </p>
      </header>

      <div className="flex flex-col gap-3">
        {checks.map((check, i) => (
          <CheckCard key={i} {...check} />
        ))}
      </div>
    </section>
  );
}

function CheckCard({
  title,
  body,
  linkLabel,
  linkHref,
}: {
  title: string;
  body: string;
  linkLabel: string;
  linkHref: string;
}) {
  return (
    <article
      className="rounded-[16px] bg-white px-6 py-5"
      style={{ boxShadow: '0 0 0 1px #ece6f3, 0 1px 0 rgba(15,10,30,0.02)' }}
    >
      <div className="flex items-start gap-4">
        <Square
          size={18}
          weight="regular"
          className="mt-[3px] shrink-0 text-ppc-text-faint"
          aria-hidden
        />
        <div className="flex-1">
          <h4 className="text-[15.5px] font-semibold text-ppc-ink">{title}</h4>
          <p className="mt-1.5 text-[14px] leading-[1.6] text-ppc-text-muted">
            {body}
          </p>
          <a
            href={linkHref}
            className="mt-3 inline-flex items-center gap-1 text-[13.5px] font-semibold text-ppc-purple-500 transition-colors hover:text-ppc-purple-600"
          >
            {linkLabel}
            <CaretRight size={11} weight="bold" />
          </a>
        </div>
      </div>
    </article>
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
// SHARED PRIMITIVES
// ═════════════════════════════════════════════════════════════════════════

function ReadinessChip({ readiness }: { readiness: Readiness }) {
  const meta = READINESS_META[readiness];
  return (
    <span
      className="inline-flex items-center gap-[7px] rounded-full px-[12px] py-[5px] text-[12.5px] font-semibold"
      style={{ background: meta.bg, color: meta.text }}
    >
      <span
        aria-hidden
        className="inline-block h-[7px] w-[7px] rounded-full"
        style={{ background: meta.dot }}
      />
      {meta.label}
    </span>
  );
}

function PrimaryButton({
  label,
  icon,
}: {
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 rounded-[12px] px-[16px] py-[11px] text-[13.5px] font-semibold text-white transition-transform hover:-translate-y-[0.5px]"
      style={{
        background: 'linear-gradient(180deg, #8767F3 0%, #6A45E2 100%)',
        boxShadow:
          '0 1px 0 rgba(255,255,255,0.18) inset, 0 6px 14px -6px rgba(127,90,240,0.55)',
      }}
    >
      {label}
      {icon}
    </button>
  );
}

function SecondaryButton({
  label,
  icon,
}: {
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 rounded-[12px] border border-ppc-card-border bg-white px-[14px] py-[10px] text-[13.5px] font-medium text-ppc-text-muted transition-colors hover:bg-ppc-panel-soft hover:text-ppc-ink"
    >
      {icon}
      {label}
    </button>
  );
}

function GhostButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 rounded-[10px] px-[12px] py-[8px] text-[13px] font-medium text-ppc-text-muted transition-colors hover:bg-ppc-panel-soft hover:text-ppc-ink"
    >
      {label}
    </button>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────

function hexToTint(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ═════════════════════════════════════════════════════════════════════════
// PALETTES
// ═════════════════════════════════════════════════════════════════════════

const READINESS_RAIL: Record<Readiness, string> = {
  ready:     'linear-gradient(180deg, #6FD9B0 0%, #4FB892 100%)',
  review:    'linear-gradient(180deg, #E2A536 0%, #B07820 100%)',
  open:      'linear-gradient(180deg, #A88CFF 0%, #7F5AF0 100%)',
  watchlist: 'linear-gradient(180deg, #C7C0DE 0%, #918AB2 100%)',
};

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
