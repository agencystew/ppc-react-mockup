import { Link } from 'react-router-dom';
import {
  Sparkle, Bookmark, ArrowRight, ArrowsClockwise,
  MagnifyingGlass, Briefcase, ShieldCheck,
  FileText, ClockCounterClockwise, Target, UsersThree,
  Wrench, CalendarBlank, Flask, FolderSimple, Info,
  GoogleLogo, CheckCircle,
} from '@phosphor-icons/react';

/* /patterns — pixel-rebuilt 2026-05-18 to match Stewart's screenshot reference.
 *
 * Editorial in posture, calm in palette. The page reads top-to-bottom:
 *   1. Header strip  — title + experimental pill + sweep meta + Run-sweep
 *   2. Hero          — italic-accent headline + lens diagram (inputs → lens → outputs)
 *   3. How it works  — three dark step cards + one white stats panel
 *   4. Top patterns  — 2×2 grid of pattern cards with sources + linked-by tags
 *   5. Footer row    — curation context + experimental marker
 *
 * No mono eyebrows. No bullet-listicle "what you walk away with" panels.
 * Lavender canvas inherits from body bg (#ECEAFA, set in styles/index.css). */

// ─── Page ────────────────────────────────────────────────────────────────

export function Patterns() {
  return (
    <div className="space-y-14 pb-6">
      <HeaderStrip />
      <Hero />
      <HowItWorks />
      <TopPatterns />
      <FooterRow />
    </div>
  );
}

// ─── Header strip ────────────────────────────────────────────────────────

function HeaderStrip() {
  return (
    <header className="flex flex-wrap items-start justify-between gap-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="font-display text-[34px] font-bold leading-none tracking-display text-ppc-ink">
            Patterns
          </h1>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E3F4E0] px-2.5 py-1 text-[12px] font-medium text-[#2F7C49]">
            <Flask size={13} weight="fill" />
            Experimental
          </span>
        </div>
        <p className="mt-2 max-w-[640px] text-[14px] leading-[1.45] text-ppc-text-muted">
          Ideas PPC.io noticed across projects, data, and agent runs.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-ppc-text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#5DCAA5]" />
          Last sweep <span className="text-ppc-text-faint">·</span> 2h ago
        </span>
        <span>
          Next sweep <span className="text-ppc-text-faint">·</span> Monday
        </span>
        <Link to="#" className="text-ppc-text-muted underline-offset-4 hover:text-ppc-ink hover:underline">
          Sweep history
        </Link>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full border border-ppc-purple-500/40 bg-white px-3.5 py-2 text-[13px] font-medium text-ppc-purple-700 transition-colors hover:border-ppc-purple-500 hover:text-ppc-purple-500"
        >
          <ArrowsClockwise size={14} weight="bold" />
          Run sweep
        </button>
      </div>
    </header>
  );
}

// ─── Hero ────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-10">
      <HeroCopy />
      <LensDiagram />
    </section>
  );
}

function HeroCopy() {
  return (
    <div className="flex flex-col justify-center">
      <h2 className="font-display text-[58px] font-black leading-[0.97] -tracking-[0.025em] text-ppc-ink xl:text-[64px]">
        Ideas that{' '}
        <span className="italic font-medium text-ppc-purple-500">rhyme</span>
        <br />
        across clients.
      </h2>
      <p className="mt-7 max-w-[480px] text-[16px] leading-[1.55] text-ppc-text-muted">
        We scan your roster for repeated situations, shared mechanisms, and
        strategic threads worth exploring.
      </p>
      <div className="mt-7 inline-flex items-center gap-2 text-[13px] text-ppc-text-muted">
        <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-ppc-purple-700">
          <UsersThree size={12} weight="fill" />
        </span>
        Human judgment recommended.
      </div>
    </div>
  );
}

// ─── Lens diagram ────────────────────────────────────────────────────────

interface SourceChip {
  icon: typeof MagnifyingGlass;
  label: string;
  caption: string;
}

const SOURCE_CHIPS: SourceChip[] = [
  { icon: Briefcase,             label: 'Business context', caption: 'CRM, notes, intake' },
  { icon: GoogleLogo,            label: 'Google Ads',       caption: 'Campaign data' },
  { icon: MagnifyingGlass,       label: 'Search terms',     caption: 'Query behavior' },
  { icon: ShieldCheck,           label: 'Audit agent',      caption: 'Account audits' },
  { icon: FileText,              label: 'Landing pages',    caption: 'LP analysis' },
  { icon: ClockCounterClockwise, label: 'Historical runs',  caption: 'Past patterns' },
];

interface OutputCard {
  tag: 'Mechanism' | 'Cohort' | 'Operator';
  icon: typeof MagnifyingGlass;
  title: string;
}

const OUTPUTS: OutputCard[] = [
  { tag: 'Mechanism', icon: MagnifyingGlass, title: 'Research intent leakage after PMAX expansion' },
  { tag: 'Cohort',    icon: UsersThree,     title: 'Trust proof gaps across high-ticket lead gen' },
  { tag: 'Operator',  icon: Wrench,         title: 'Same tracking fix reappearing in audits' },
];

function LensDiagram() {
  // SVG viewBox coordinates that match the chip layout (24 → 568 horizontal).
  // Inputs sit at x=20…220, lens at ~340, outputs at 460…720. Y values chosen
  // to align with each chip's vertical center inside the flex columns below.
  const inputY = [56, 132, 208, 284, 360, 436]; // 6 inputs
  const outputY = [120, 248, 376];              // 3 outputs

  return (
    <div className="relative h-[500px] w-full">
      {/* connecting lines + lens — SVG sits underneath the chips */}
      <svg
        viewBox="0 0 720 500"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <radialGradient id="lensGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"  stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="35%" stopColor="#D6CBFA" stopOpacity="0.9"  />
            <stop offset="70%" stopColor="#9B82F2" stopOpacity="0.5"  />
            <stop offset="100%" stopColor="#7F5AF0" stopOpacity="0"   />
          </radialGradient>
          <linearGradient id="lineIn" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"  stopColor="#C8BCEF" stopOpacity="0.0" />
            <stop offset="40%" stopColor="#B7A8EC" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#7F5AF0" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="lineOut" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"  stopColor="#7F5AF0" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#B7A8EC" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#C8BCEF" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* input → lens lines (curve toward 340,250) */}
        {inputY.map((y, i) => (
          <path
            key={`in-${i}`}
            d={`M 230 ${y} C 290 ${y}, 300 250, 340 250`}
            stroke="url(#lineIn)"
            strokeWidth="1"
            fill="none"
          />
        ))}

        {/* lens → output lines */}
        {outputY.map((y, i) => (
          <path
            key={`out-${i}`}
            d={`M 340 250 C 400 250, 410 ${y}, 460 ${y}`}
            stroke="url(#lineOut)"
            strokeWidth="1"
            fill="none"
          />
        ))}

        {/* the lens — concentric soft ring with central glow */}
        <circle cx="340" cy="250" r="62" fill="url(#lensGlow)" />
        <circle cx="340" cy="250" r="44" fill="none" stroke="#A88CFF" strokeOpacity="0.55" strokeWidth="1" />
        <circle cx="340" cy="250" r="30" fill="none" stroke="#A88CFF" strokeOpacity="0.35" strokeWidth="1" />

        {/* sparkles scattered around the lens */}
        <Spark x={300} y={208} size={5} />
        <Spark x={384} y={216} size={4} />
        <Spark x={302} y={300} size={4} />
        <Spark x={376} y={296} size={6} />
        <Spark x={344} y={186} size={3} />
        <Spark x={400} y={258} size={3} />
      </svg>

      {/* center sparkle glyph — sits on top of the SVG */}
      <Sparkle
        size={22}
        weight="fill"
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-ppc-purple-500"
        style={{ left: 'calc(340 / 720 * 100%)', top: '50%' }}
      />

      {/* chips — two flex columns separated by the lens gutter */}
      <div className="relative z-[1] grid h-full grid-cols-[minmax(0,1fr)_56px_minmax(0,1fr)] items-center gap-0">
        <div className="flex h-full flex-col justify-between py-1.5">
          {SOURCE_CHIPS.map((c) => <SourceChipRow key={c.label} {...c} />)}
        </div>
        <div /> {/* gutter for the lens */}
        <div className="flex h-full flex-col justify-around py-1.5">
          {OUTPUTS.map((o) => <OutputCardRow key={o.title} {...o} />)}
        </div>
      </div>
    </div>
  );
}

function Spark({ x, y, size }: { x: number; y: number; size: number }) {
  return (
    <g transform={`translate(${x} ${y})`} opacity="0.7">
      <path
        d={`M 0 -${size} L ${size * 0.18} -${size * 0.18} L ${size} 0 L ${size * 0.18} ${size * 0.18} L 0 ${size} L -${size * 0.18} ${size * 0.18} L -${size} 0 L -${size * 0.18} -${size * 0.18} Z`}
        fill="#A88CFF"
      />
    </g>
  );
}

function SourceChipRow({ icon: Icon, label, caption }: SourceChip) {
  return (
    <div className="flex items-center gap-3 rounded-[10px] border border-ppc-card-border bg-white px-3 py-2.5 shadow-[0_1px_0_rgba(15,10,30,0.02)]">
      <span className="grid h-8 w-8 place-items-center rounded-[8px] bg-[#F1ECFD] text-ppc-purple-700">
        <Icon size={16} weight="duotone" />
      </span>
      <div className="min-w-0">
        <div className="truncate text-[13px] font-semibold leading-tight text-ppc-ink">{label}</div>
        <div className="truncate text-[11.5px] leading-tight text-ppc-text-muted">{caption}</div>
      </div>
    </div>
  );
}

function OutputCardRow({ tag, icon: Icon, title }: OutputCard) {
  const tagStyles: Record<OutputCard['tag'], string> = {
    Mechanism: 'bg-[#E3F4E0] text-[#2F7C49]',
    Cohort:    'bg-[#E3F4E0] text-[#2F7C49]',
    Operator:  'bg-[#FBEAD0] text-[#A06B19]',
  };
  return (
    <div className="rounded-[12px] border border-ppc-card-border bg-white px-3.5 py-3 shadow-[0_1px_0_rgba(15,10,30,0.02)]">
      <span className={`mb-1.5 inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-medium ${tagStyles[tag]}`}>
        {tag}
      </span>
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-[8px] bg-[#F1ECFD] text-ppc-purple-700">
          <Icon size={16} weight="duotone" />
        </span>
        <div className="text-[13px] font-semibold leading-snug text-ppc-ink">
          {title}
        </div>
      </div>
    </div>
  );
}

// ─── How it works ────────────────────────────────────────────────────────

interface Step {
  num: '01' | '02' | '03';
  title: 'Sweep' | 'Group' | 'Surface';
  body: string;
  icon: typeof CalendarBlank;
  iconBg: string;
  iconColor: string;
}

const STEPS: Step[] = [
  { num: '01', title: 'Sweep',   body: 'Scan context, data, and agent runs.',     icon: CalendarBlank, iconBg: 'bg-[#3B2C66]', iconColor: 'text-[#C6B7FF]' },
  { num: '02', title: 'Group',   body: 'Find situations that rhyme across niches.', icon: UsersThree,    iconBg: 'bg-[#1F3A33]', iconColor: 'text-[#7BD6A8]' },
  { num: '03', title: 'Surface', body: 'Show ideas with evidence attached.',       icon: Sparkle,       iconBg: 'bg-[#2C2A55]', iconColor: 'text-[#9C8DFF]' },
];

interface StatCell {
  icon: typeof CalendarBlank;
  value: string;
  label: string;
  iconBg: string;
  iconColor: string;
}

const SWEEP_STATS: StatCell[] = [
  { icon: FolderSimple,    value: '102', label: 'projects scanned',      iconBg: 'bg-[#E3F4E0]', iconColor: 'text-[#2F7C49]' },
  { icon: Briefcase,       value: '416', label: 'agent runs considered', iconBg: 'bg-[#F1ECFD]', iconColor: 'text-ppc-purple-700' },
  { icon: Sparkle,         value: '5',   label: 'new ideas',             iconBg: 'bg-[#F1ECFD]', iconColor: 'text-ppc-purple-700' },
  { icon: ArrowsClockwise, value: '3',   label: 'seen again',            iconBg: 'bg-[#F1ECFD]', iconColor: 'text-ppc-purple-700' },
];

function HowItWorks() {
  return (
    <section>
      <h3 className="font-display text-[22px] font-bold leading-tight tracking-h2 text-ppc-ink">
        How Patterns works
      </h3>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s) => <StepCard key={s.num} {...s} />)}
        <StatsCard />
      </div>
      <p className="mt-4 inline-flex items-center gap-2 text-[13px] text-ppc-text-muted">
        <Sparkle size={14} weight="fill" className="text-ppc-purple-500" />
        Quiet ideas fade into archive unless reinforced.
      </p>
    </section>
  );
}

function StepCard({ num, title, body, icon: Icon, iconBg, iconColor }: Step) {
  return (
    <div className="relative overflow-hidden rounded-[14px] bg-[radial-gradient(120%_120%_at_50%_-10%,#1A1030_0%,#0F0A1E_55%,#07050D_100%)] p-5 text-white">
      <div className={`mb-7 grid h-11 w-11 place-items-center rounded-full ${iconBg} ${iconColor}`}>
        <Icon size={20} weight="duotone" />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-[14px] font-medium text-white/45">{num}</span>
        <span className="text-[17px] font-bold tracking-tight text-white">{title}</span>
      </div>
      <p className="mt-1 text-[13.5px] leading-[1.45] text-white/65">
        {body}
      </p>
    </div>
  );
}

function StatsCard() {
  return (
    <div className="rounded-[14px] border border-ppc-card-border bg-white p-4">
      <div className="grid h-full grid-cols-2 gap-3">
        {SWEEP_STATS.map((s) => (
          <div key={s.label} className="flex items-start gap-2.5">
            <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-[8px] ${s.iconBg} ${s.iconColor}`}>
              <s.icon size={18} weight="duotone" />
            </span>
            <div className="min-w-0">
              <div className="text-[20px] font-bold leading-tight text-ppc-ink">{s.value}</div>
              <div className="text-[11.5px] leading-tight text-ppc-text-muted">{s.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Top patterns ────────────────────────────────────────────────────────

type Status = 'New' | 'Seen again' | 'Developing';
type Family = 'Mechanism' | 'Cohort' | 'Operator';

interface TopPattern {
  id: string;
  icon: typeof MagnifyingGlass;
  iconBg: string;
  iconColor: string;
  status: Status;
  family: Family;
  clients: number;
  initials: string[];
  extraClients: number; // 0 hides the +N pill
  title: string;
  body: string;
  linked: string[];
}

const TOP_PATTERNS: TopPattern[] = [
  {
    id: 'tp-01',
    icon: MagnifyingGlass,
    iconBg: 'bg-[#F4ECE0]',
    iconColor: 'text-[#8A6F3D]',
    status: 'New',
    family: 'Mechanism',
    clients: 8,
    initials: ['D', 'F', 'B', 'LC'],
    extraClients: 4,
    title: 'Research intent leakage after PMAX expansion',
    body: 'PMAX is matching research-stage queries and spending on "how to" terms and weaker CVR.',
    linked: ['Query drift', 'Campaign expansion', 'Weaker CVR'],
  },
  {
    id: 'tp-02',
    icon: Target,
    iconBg: 'bg-[#DBF1E0]',
    iconColor: 'text-[#2F7C49]',
    status: 'Seen again',
    family: 'Mechanism',
    clients: 8,
    initials: ['BC', 'LS', 'PC', 'BA'],
    extraClients: 4,
    title: 'Trust proof gaps across high-ticket lead gen',
    body: 'Landing pages lack strong proof above the fold, impacting conversion rates.',
    linked: ['Buyer risk', 'Proof gap', 'Paid intent mismatch'],
  },
  {
    id: 'tp-03',
    icon: Wrench,
    iconBg: 'bg-[#FBE3D6]',
    iconColor: 'text-[#A05A2A]',
    status: 'Developing',
    family: 'Operator',
    clients: 11,
    initials: ['TH', 'DB', 'AB', 'WS'],
    extraClients: 7,
    title: 'Same tracking fix keeps reappearing in audits',
    body: 'The same conversion tracking issue is flagged across accounts and audit runs.',
    linked: ['Repeated audit finding', 'Attribution gap'],
  },
  {
    id: 'tp-04',
    icon: CalendarBlank,
    iconBg: 'bg-[#DBF1E0]',
    iconColor: 'text-[#2F7C49]',
    status: 'New',
    family: 'Cohort',
    clients: 3,
    initials: ['HF', 'SP', 'KB'],
    extraClients: 0,
    title: 'Weekend inventory is quietly overfunded',
    body: 'Weekend spend is high while CVR is low compared to weekdays.',
    linked: ['Low weekend CVR', 'Spend drift'],
  },
];

const STATUS_STYLES: Record<Status, string> = {
  'New':         'bg-[#FFEBC4] text-[#9C6B0A]',
  'Seen again':  'bg-[#ECE6FD] text-[#5946B9]',
  'Developing':  'bg-[#FBE0CF] text-[#A0521E]',
};

const FAMILY_STYLES: Record<Family, string> = {
  Mechanism: 'bg-[#E3F4E0] text-[#2F7C49]',
  Cohort:    'bg-[#E3F4E0] text-[#2F7C49]',
  Operator:  'bg-[#FBEAD0] text-[#A06B19]',
};

function TopPatterns() {
  return (
    <section>
      <div className="flex items-start justify-between">
        <h3 className="font-display text-[22px] font-bold leading-tight tracking-h2 text-ppc-ink">
          Top patterns this sweep
        </h3>
        <div className="text-right">
          <Link
            to="#"
            className="inline-flex items-center gap-1 text-[13px] font-medium text-ppc-purple-700 hover:text-ppc-purple-500"
          >
            View all patterns
            <ArrowRight size={13} weight="bold" />
          </Link>
          <div className="text-[11.5px] text-ppc-text-faint">50 total</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {TOP_PATTERNS.map((p) => <PatternCard key={p.id} {...p} />)}
      </div>
    </section>
  );
}

function PatternCard(p: TopPattern) {
  return (
    <article className="rounded-[14px] border border-ppc-card-border bg-white p-5">
      {/* top meta row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${p.iconBg} ${p.iconColor}`}>
            <p.icon size={20} weight="duotone" />
          </span>
          <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-medium ${STATUS_STYLES[p.status]}`}>
              {p.status}
            </span>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-medium ${FAMILY_STYLES[p.family]}`}>
              {p.family}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-ppc-text-muted">{p.clients} clients</span>
            <button type="button" className="text-ppc-text-faint hover:text-ppc-purple-500" aria-label="Save pattern">
              <Bookmark size={16} weight="regular" />
            </button>
          </div>
          <div className="flex items-center gap-1">
            {p.initials.map((init) => (
              <span
                key={init}
                className="grid h-[22px] min-w-[22px] place-items-center rounded-md bg-[#F4F0FB] px-1.5 text-[10px] font-semibold text-ppc-purple-800"
              >
                {init}
              </span>
            ))}
            {p.extraClients > 0 && (
              <span className="grid h-[22px] min-w-[28px] place-items-center rounded-md bg-[#F4F0FB] px-1.5 text-[10px] font-semibold text-ppc-purple-800">
                +{p.extraClients}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* title + body */}
      <h4 className="mt-4 text-[16px] font-bold leading-snug text-ppc-ink">
        {p.title}
      </h4>
      <p className="mt-1.5 text-[13.5px] leading-[1.5] text-ppc-text-muted">
        {p.body}
      </p>

      {/* linked + sources */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-y-2 border-t border-[#EDE8F5] pt-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[11.5px] text-ppc-text-faint">Why linked</span>
          {p.linked.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-md bg-[#F4F0FB] px-2 py-1 text-[11px] font-medium text-ppc-purple-800"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="mr-1 text-[11.5px] text-ppc-text-faint">Sources</span>
          <SourceIcon Icon={Briefcase} tint="green" />
          <SourceIcon Icon={GoogleLogo} tint="purple" />
          <SourceIcon Icon={FileText} tint="purple" />
          <SourceIcon Icon={ShieldCheck} tint="green" />
          <SourceIcon Icon={ClockCounterClockwise} tint="purple" />
        </div>
      </div>
    </article>
  );
}

function SourceIcon({ Icon, tint }: { Icon: typeof MagnifyingGlass; tint: 'purple' | 'green' }) {
  const cls =
    tint === 'green'
      ? 'bg-[#E3F4E0] text-[#2F7C49]'
      : 'bg-[#F1ECFD] text-ppc-purple-700';
  return (
    <span className={`grid h-[22px] w-[22px] place-items-center rounded-[6px] ${cls}`}>
      <Icon size={12} weight="duotone" />
    </span>
  );
}

// ─── Footer row ──────────────────────────────────────────────────────────

function FooterRow() {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-3">
      <p className="inline-flex items-center gap-2 text-[12.5px] text-ppc-text-muted">
        <Info size={14} weight="duotone" className="text-ppc-text-faint" />
        Showing curated patterns from the last 45 days.
        <span className="ml-3 text-ppc-text-muted">Saved ideas stay pinned.</span>
        <span className="ml-3 text-ppc-text-muted">
          Archived patterns live in{' '}
          <Link to="#" className="font-medium text-ppc-purple-700 underline-offset-4 hover:underline">
            All patterns.
          </Link>
        </span>
      </p>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FBE9C9] px-3 py-1 text-[12px] font-medium text-[#8B6312]">
        <CheckCircle size={13} weight="fill" />
        Experimental
      </span>
    </footer>
  );
}
