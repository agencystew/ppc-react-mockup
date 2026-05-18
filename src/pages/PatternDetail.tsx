import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, ArrowSquareOut, ArrowUpRight,
  BookmarkSimple, CalendarBlank, CaretRight,
  ChatCircleText, ChatCircle, CheckCircle, DotsThree,
  FileText, Lightbulb, MagnifyingGlass, Question,
  Sparkle, TrendUp, UsersThree, Wrench, ShieldCheck,
  CurrencyDollar, Gauge, GoogleLogo, ClockCounterClockwise,
} from '@phosphor-icons/react';
import { PATTERNS, type Pattern } from '../mock/patterns';
import {
  PATTERN_DETAILS,
  type PatternDetail as Detail,
  type FindingIcon,
} from '../mock/pattern-details';

/* /patterns/:id — detail page.
 *
 * Anatomy (top → bottom, left → right):
 *   - Header row     : Back link · breadcrumb · sweep status · row of icon
 *                       actions (Save · Ask follow-up · Open evidence · …)
 *   - Hero           : icon tile · headline + purple period · meta row
 *   - PPC.io's read  : lavender panel — the diagnosis
 *   - Pattern recog. : timeline SVG of 5 signals + 4 finding tiles + chip
 *                      row of affected accounts
 *   - What it means  : plain-english explanation
 *   - Recommended +  : two-up — recommended move (purple CTA) + Still soft
 *     Still soft       (amber caveat)
 *   - Sticky sidebar : Evidence cited (5 numbered receipts + notebook link)
 *                      then Ask PPC.io (3 suggested follow-ups)
 *
 * Scrolls vertically; the sidebar uses position:sticky so it tracks
 * alongside the main column on desktop. */

export function PatternDetail() {
  const { id } = useParams<{ id: string }>();
  const pattern = id ? PATTERNS.find((p) => p.id === id) : undefined;
  const detail = id ? PATTERN_DETAILS[id] : undefined;

  // Scroll to top on route change.
  useEffect(() => { window.scrollTo({ top: 0 }); }, [id]);

  if (!pattern || !detail) {
    return (
      <div className="min-h-screen bg-ppc-canvas px-6 py-12 text-center text-ppc-text-muted">
        Pattern not found.{' '}
        <Link to="/patterns" className="text-ppc-purple-700 underline">
          Back to patterns
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ppc-canvas px-3 pb-6 pt-3 lg:px-5 lg:pb-8 lg:pt-5">
      <div className="overflow-hidden rounded-[28px] border border-ppc-card-border bg-white">
        <PageHeader pattern={pattern} detail={detail} />

        <div className="grid grid-cols-1 gap-8 px-6 pb-12 pt-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10 lg:px-10 lg:pb-14 lg:pt-9">
          <main className="min-w-0">
            <Hero pattern={pattern} detail={detail} />
            <PPCRead body={detail.read} />
            <PatternRecognized pattern={pattern} detail={detail} />
            <WhatItMeans paragraphs={detail.meaning} />
            <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
              <RecommendedMove pattern={pattern} />
              <StillSoft caveat={detail.caveat} />
            </div>
          </main>

          <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <EvidenceCited items={detail.evidence} />
            <AskPPCio questions={detail.questions} />
          </aside>
        </div>
      </div>
    </div>
  );
}

// ─── Header ──────────────────────────────────────────────────────────────

function PageHeader({ pattern, detail }: { pattern: Pattern; detail: Detail }) {
  const breadcrumbHeadline = detail.altHeadline ?? pattern.headline;
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EDE8F5] px-6 py-4 lg:px-10">
      <div className="flex flex-wrap items-center gap-3 text-[13px]">
        <Link
          to="/patterns"
          className="inline-flex items-center gap-1.5 font-semibold text-ppc-purple-700 hover:text-ppc-purple-500"
        >
          <ArrowLeft size={13} weight="bold" />
          Back to patterns
        </Link>
        <CaretRight size={12} weight="bold" className="text-ppc-text-faint" />
        <Link to="/patterns" className="font-medium text-ppc-text-muted hover:text-ppc-ink">
          Patterns
        </Link>
        <CaretRight size={12} weight="bold" className="text-ppc-text-faint" />
        <span className="line-clamp-1 max-w-[420px] font-semibold text-ppc-ink">
          {truncate(breadcrumbHeadline, 40)}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden items-center gap-1.5 pr-2 text-[12.5px] text-ppc-text-muted lg:inline-flex">
          <span className="h-1.5 w-1.5 rounded-full bg-[#5DCAA5]" />
          Last sweep · 2h ago
        </span>
        <HeaderAction icon={BookmarkSimple} label="Save" />
        <HeaderAction icon={ChatCircleText} label="Ask follow-up" />
        <HeaderAction icon={ArrowSquareOut} label="Open evidence" />
        <HeaderAction icon={DotsThree} label="More" iconOnly />
      </div>
    </header>
  );
}

function HeaderAction({
  icon: Icon,
  label,
  iconOnly = false,
}: {
  icon: typeof BookmarkSimple;
  label: string;
  iconOnly?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={iconOnly ? label : undefined}
      className={`inline-flex items-center gap-1.5 rounded-full border border-ppc-card-border bg-white text-[13px] font-medium text-ppc-ink transition-colors hover:bg-[#FAF8FE] ${
        iconOnly ? 'h-9 w-9 justify-center' : 'px-3.5 py-2'
      }`}
    >
      <Icon size={14} weight="duotone" className="text-ppc-text-muted" />
      {!iconOnly && label}
    </button>
  );
}

// ─── Hero ────────────────────────────────────────────────────────────────

const HERO_ICON: Record<Detail['iconKey'], typeof MagnifyingGlass> = {
  magnifier: MagnifyingGlass,
  wrench: Wrench,
  calendar: CalendarBlank,
  users: UsersThree,
  trend: TrendUp,
};

function Hero({ pattern, detail }: { pattern: Pattern; detail: Detail }) {
  const Icon = HERO_ICON[detail.iconKey];
  const heroHeadline = detail.altHeadline ?? pattern.headline.replace(/\.$/, '');
  return (
    <section>
      <div className="flex items-start gap-5">
        <span className="grid h-[68px] w-[68px] shrink-0 place-items-center rounded-[18px] border border-ppc-card-border bg-white text-ppc-purple-700 shadow-[0_2px_8px_rgba(127,90,240,0.08)]">
          <Icon size={30} weight="duotone" />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-[30px] font-bold leading-[1.12] -tracking-[0.02em] text-ppc-ink lg:text-[36px]">
            {heroHeadline}
            <span className="text-ppc-purple-500">.</span>
          </h1>
          <ul className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-ppc-text-muted">
            <MetaItem icon={Sparkle} text="Experimental" tint="purple" />
            <MetaSeparator />
            <MetaItem icon={UsersThree} text={`${pattern.affected.length} accounts`} />
            <MetaSeparator />
            <MetaItem icon={FileText} text={`${detail.receiptsCount} receipts`} />
            <MetaSeparator />
            <MetaItem icon={CalendarBlank} text={`Surfaced ${formatDate(detail.surfacedOn)}`} />
          </ul>
        </div>
      </div>
    </section>
  );
}

function MetaItem({
  icon: Icon,
  text,
  tint = 'muted',
}: {
  icon: typeof Sparkle;
  text: string;
  tint?: 'purple' | 'muted';
}) {
  return (
    <li className="inline-flex items-center gap-1.5">
      <Icon
        size={12}
        weight={tint === 'purple' ? 'fill' : 'duotone'}
        className={tint === 'purple' ? 'text-ppc-purple-500' : 'text-ppc-text-faint'}
      />
      {text}
    </li>
  );
}

function MetaSeparator() {
  return <li className="text-ppc-text-faint">·</li>;
}

// ─── PPC.io's read ───────────────────────────────────────────────────────

function PPCRead({ body }: { body: string }) {
  return (
    <div className="mt-7 rounded-[18px] border border-[#E6DEFA] bg-[#F4F1FA] p-5 lg:p-6">
      <header className="flex items-center gap-2.5">
        <Sparkle size={18} weight="fill" className="text-ppc-purple-500" />
        <h2 className="text-[15px] font-bold text-ppc-ink">PPC.io's read</h2>
      </header>
      <p className="mt-3 text-[14px] leading-[1.6] text-ppc-ink/85">{body}</p>
    </div>
  );
}

// ─── Pattern recognized ──────────────────────────────────────────────────

const FINDING_ICON: Record<FindingIcon, typeof MagnifyingGlass> = {
  traffic:     TrendUp,
  proof:       MagnifyingGlass,
  cvr:         ShieldCheck,
  'follow-up': UsersThree,
  spend:       CurrencyDollar,
  auction:     Gauge,
  cohort:      UsersThree,
  'ad-copy':   FileText,
  attribution: ShieldCheck,
  budget:      CurrencyDollar,
  shopping:    GoogleLogo,
};

function PatternRecognized({
  pattern,
  detail,
}: {
  pattern: Pattern;
  detail: Detail;
}) {
  return (
    <div className="mt-5 rounded-[18px] border border-ppc-card-border bg-white p-5 lg:p-6">
      <header className="flex items-center gap-2.5">
        <Sparkle size={18} weight="fill" className="text-ppc-purple-500" />
        <h2 className="text-[15px] font-bold text-ppc-ink">Pattern recognized</h2>
      </header>

      <SignalTimeline signals={detail.timeline} />

      <div className="mt-7 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
        {detail.findings.map((f) => (
          <FindingTile key={f.title} {...f} />
        ))}
      </div>

      <AccountsRow pattern={pattern} />
    </div>
  );
}

function SignalTimeline({
  signals,
}: {
  signals: Array<{ label: string }>;
}) {
  // viewBox is tuned so 5 dots breathe — labels above, arrow below.
  // preserveAspectRatio=none lets the line stretch with container.
  const dotPositions = signals.map((_, i) => {
    // 5 dots spread across viewBox 40..680 (5 -> 4 gaps of 160)
    const x = 40 + (i * (640 / (signals.length - 1)));
    return x;
  });

  return (
    <div className="relative mt-7">
      <svg
        viewBox="0 0 720 130"
        className="w-full"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Recognized signals for this pattern"
      >
        <defs>
          <linearGradient id="tlLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#A88CFF" stopOpacity="0.45" />
            <stop offset="50%"  stopColor="#7F5AF0" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#7F5AF0" stopOpacity="0.95" />
          </linearGradient>
          <marker
            id="tlArrow"
            markerWidth="10"
            markerHeight="10"
            refX="8"
            refY="5"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M 0 0 L 10 5 L 0 10 Z" fill="#7F5AF0" />
          </marker>
        </defs>

        {/* labels above each dot */}
        {signals.map((s, i) => (
          <text
            key={`label-${i}`}
            x={dotPositions[i]}
            y={32}
            textAnchor="middle"
            fontSize="13"
            fontWeight="500"
            fontFamily="Figtree, sans-serif"
            fill="#1a1625"
          >
            {s.label}
          </text>
        ))}

        {/* dotted droppers from label to line */}
        {dotPositions.map((x, i) => (
          <line
            key={`drop-${i}`}
            x1={x}
            y1={42}
            x2={x}
            y2={78}
            stroke="#B0A9C2"
            strokeWidth="1"
            strokeDasharray="1.5 2.5"
          />
        ))}

        {/* main horizontal line with arrowhead at the end */}
        <line
          x1="20" y1="92" x2="690" y2="92"
          stroke="url(#tlLine)"
          strokeWidth="1.75"
          markerEnd="url(#tlArrow)"
        />

        {/* dots */}
        {dotPositions.map((x, i) => (
          <g key={`dot-${i}`}>
            <circle cx={x} cy={92} r={8} fill="#FFFFFF" stroke="#7F5AF0" strokeWidth={1.5} />
            <circle cx={x} cy={92} r={3.5} fill="#7F5AF0" />
          </g>
        ))}
      </svg>
    </div>
  );
}

function FindingTile({ icon, title, body }: { icon: FindingIcon; title: string; body: string }) {
  const Icon = FINDING_ICON[icon];
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#F4F0FB] text-ppc-purple-700">
        <Icon size={20} weight="duotone" />
      </span>
      <div className="min-w-0">
        <h3 className="text-[14.5px] font-bold leading-tight text-ppc-ink">{title}</h3>
        <p className="mt-1 text-[12.5px] leading-[1.5] text-ppc-text-muted">{body}</p>
      </div>
    </div>
  );
}

function AccountsRow({ pattern }: { pattern: Pattern }) {
  return (
    <div className="mt-7 border-t border-[#EDE8F5] pt-5">
      <div className="flex flex-wrap items-center gap-4">
        <span className="shrink-0 text-[11.5px] leading-tight text-ppc-text-faint">
          Accounts
          <br />
          in pattern
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {pattern.affected.map((a) => (
            <span
              key={a.id}
              className="grid h-7 min-w-[40px] place-items-center rounded-[8px] border border-ppc-card-border bg-white px-2 text-[11px] font-bold text-ppc-ink"
              title={a.name}
            >
              {initialsOf(a.name)}
            </span>
          ))}
        </div>
      </div>
      <p className="mt-3 text-center text-[12px] text-ppc-text-muted">
        {pattern.affected.length} {pattern.affected.length === 1 ? 'account' : 'accounts'} showing this pattern
      </p>
    </div>
  );
}

// ─── What it means ───────────────────────────────────────────────────────

function WhatItMeans({ paragraphs }: { paragraphs: string[] }) {
  return (
    <div className="mt-5 rounded-[18px] border border-ppc-card-border bg-white p-5 lg:p-6">
      <header className="flex items-center gap-2.5">
        <Lightbulb size={18} weight="duotone" className="text-ppc-purple-700" />
        <h2 className="text-[15px] font-bold text-ppc-ink">What it means</h2>
      </header>
      <div className="mt-3 space-y-3 text-[13.5px] leading-[1.6] text-ppc-text-muted">
        {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
      </div>
    </div>
  );
}

// ─── Recommended move + Still soft ───────────────────────────────────────

function RecommendedMove({ pattern }: { pattern: Pattern }) {
  return (
    <div className="rounded-[18px] border border-ppc-card-border bg-white p-5 lg:p-6">
      <header className="flex items-center gap-2.5">
        <CheckCircle size={18} weight="duotone" className="text-ppc-purple-700" />
        <h2 className="text-[15px] font-bold text-ppc-ink">Recommended move</h2>
      </header>
      <p className="mt-3 text-[13.5px] leading-[1.55] text-ppc-text-muted">
        {pattern.recommendedAction}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full bg-grad-cta px-4 py-2 text-[13px] font-semibold text-white shadow-[0_2px_10px_rgba(83,74,183,0.30)] hover:opacity-95"
        >
          {pattern.recommendedActionCta}
          <ArrowRight size={13} weight="bold" />
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full border border-ppc-card-border bg-white px-4 py-2 text-[13px] font-medium text-ppc-ink hover:bg-[#FAF8FE]"
        >
          <FileText size={13} weight="duotone" className="text-ppc-text-muted" />
          Draft client note
        </button>
      </div>
    </div>
  );
}

function StillSoft({ caveat }: { caveat: Detail['caveat'] }) {
  return (
    <div className="rounded-[18px] border border-[#F4D9B9] bg-[#FFF6E8] p-5 lg:p-6">
      <header className="flex items-center gap-2.5">
        <Question size={18} weight="duotone" className="text-[#B97515]" />
        <h2 className="text-[15px] font-bold text-[#8A5A12]">{caveat.title}</h2>
      </header>
      <div className="mt-3 space-y-2.5 text-[13px] leading-[1.55] text-[#8A5A12]/95">
        {caveat.body.map((p, i) => <p key={i}>{p}</p>)}
      </div>
    </div>
  );
}

// ─── Sticky sidebar ──────────────────────────────────────────────────────

function EvidenceCited({ items }: { items: Detail['evidence'] }) {
  return (
    <section className="rounded-[18px] border border-ppc-card-border bg-white p-5">
      <header className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#F4F0FB] text-ppc-purple-700">
          <FileText size={20} weight="duotone" />
        </span>
        <div>
          <h2 className="text-[15px] font-bold leading-tight text-ppc-ink">Evidence cited</h2>
          <p className="mt-0.5 text-[12px] leading-tight text-ppc-text-muted">
            Receipts behind the read
          </p>
        </div>
      </header>

      <ol className="mt-5 space-y-4">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-4">
            <span className="w-[20px] shrink-0 text-[13px] font-semibold tabular-nums text-ppc-text-faint">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="min-w-0">
              <div className="text-[13.5px] font-bold leading-tight text-ppc-ink">
                {item.source}
              </div>
              <p className="mt-1 text-[12.5px] leading-[1.5] text-ppc-text-muted">
                {item.body}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <button
        type="button"
        className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-ppc-purple-400 bg-white px-4 py-2.5 text-[13px] font-semibold text-ppc-purple-700 transition-colors hover:bg-[#FAF8FE]"
      >
        Open evidence notebook
        <ArrowUpRight size={13} weight="bold" />
      </button>
    </section>
  );
}

function AskPPCio({ questions }: { questions: string[] }) {
  return (
    <section className="rounded-[18px] border border-ppc-card-border bg-white p-5">
      <header className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#F4F0FB] text-ppc-purple-700">
          <ChatCircle size={20} weight="duotone" />
        </span>
        <h2 className="text-[15px] font-bold text-ppc-ink">Ask PPC.io</h2>
      </header>

      <ul className="mt-4 divide-y divide-[#EDE8F5]">
        {questions.map((q) => (
          <li key={q}>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-3 py-3 text-left text-[13.5px] font-medium text-ppc-purple-700 transition-colors hover:text-ppc-purple-500"
            >
              <span>{q}</span>
              <ArrowRight size={13} weight="bold" className="shrink-0" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ─── Utils ───────────────────────────────────────────────────────────────

function initialsOf(name: string): string {
  return name
    .replace(/[—–-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();
}

function truncate(s: string, max: number) {
  return s.length > max ? s.slice(0, max - 1).trimEnd() + '…' : s;
}

function formatDate(iso: string): string {
  // "2026-05-18" → "May 18". Keeps locale-stable output.
  const [, m, d] = iso.split('-');
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${months[Number(m) - 1]} ${Number(d)}`;
}
