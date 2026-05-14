import { Link } from 'react-router-dom';
import {
  MagnifyingGlass,
  CaretRight,
  CaretDown,
  Funnel,
  Sparkle,
  PushPin,
  ArrowRight,
  Folder,
  User,
  Calendar,
} from '@phosphor-icons/react';
import {
  NEEDS_TODAY,
  READY_FOR_CLIENT,
  FYI_REPORTS,
  REPORT_TOTAL,
  ACTIONED_THIS_MONTH,
  ACCOUNTS_COVERED,
  SPECIALISTS_RUNNING,
  type NeedsReport,
  type ReadyReport,
  type FyiReport,
  type ReportStatus,
} from '../mock/reports';

/* Reports · /reports
 *
 * The "inbox" surface — everything the operator's specialists have produced,
 * ranked by what needs them, not when it arrived. Four buckets stacked:
 *
 *   1 · Needs you today    — hero cards, the "act now" pile
 *   2 · Ready for client   — drafted/approved, awaiting sign-off
 *   3 · For your information — informational, no action
 *   4 · Actioned           — collapsed by default
 *
 * v5 aesthetic: lavender canvas, italic serif period accents, soft-tinted
 * "WHY NOW" callouts, restraint on color (one accent green for $-impact,
 * everything else lives in the ink + purple family). */

export function Reports() {
  return (
    <div className="space-y-9 pb-6">
      <Header />
      <LiveActivity />
      <SearchBar />
      <FilterBar />

      <NeedsSection />
      <ReadySection />
      <FyiSection />
      <ActionedSection />
      <KeyboardHints />
    </div>
  );
}

/* ─── Header ────────────────────────────────────────────────────────────── */

function Header() {
  return (
    <header className="space-y-5 pt-1">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-ppc-purple-500/10 px-3 py-[5px] text-[11.5px] font-medium text-ppc-purple-700">
        <span className="h-[5px] w-[5px] rounded-full bg-ppc-purple-500" />
        All projects
      </span>

      <h1
        className="font-display font-extrabold leading-[0.92] tracking-[-0.04em] text-ppc-purple-700"
        style={{ fontSize: 'clamp(56px, 9vw, 104px)', fontWeight: 800 }}
      >
        Reports
        <span
          className="font-serif italic font-bold text-ppc-purple-500"
          style={{
            fontFamily: 'PF-Marlet-Display, "Playfair Display", Georgia, serif',
          }}
        >
          .
        </span>
      </h1>

      <p
        className="max-w-[680px] text-[17px] leading-[1.45] text-ppc-text-muted"
        style={{ fontWeight: 400 }}
      >
        <span className="font-semibold text-ppc-ink">{REPORT_TOTAL} findings</span>{' '}
        across <span className="font-semibold text-ppc-ink">{ACCOUNTS_COVERED} accounts</span>, sorted by{' '}
        <SerifAccent>what needs you</SerifAccent>, not when they arrived.
      </p>
    </header>
  );
}

/* ─── Live activity ─────────────────────────────────────────────────────── */

function LiveActivity() {
  return (
    <div className="inline-flex items-center gap-2.5 rounded-full bg-white/55 px-4 py-[10px] text-[13.5px] text-ppc-text-muted backdrop-blur-sm">
      <span className="relative h-[8px] w-[8px] rounded-full bg-ppc-status-healthy">
        <span
          aria-hidden
          className="absolute inset-0 -m-[3px] rounded-full bg-ppc-status-healthy/35"
          style={{ animation: 'reports-live-pulse 2s ease-in-out infinite' }}
        />
      </span>
      <span>
        <span className="font-semibold text-ppc-ink">{SPECIALISTS_RUNNING} specialists</span>{' '}
        running now
      </span>
      <span className="h-[14px] w-px bg-ppc-text-faint/40" />
      <span className="text-[13px] text-ppc-text-faint">
        Negative Keyword Auditor on Flock · ~4m
      </span>
      <style>{`
        @keyframes reports-live-pulse {
          0%, 100% { transform: scale(1); opacity: 0.35; }
          50% { transform: scale(1.55); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

/* ─── Search ────────────────────────────────────────────────────────────── */

function SearchBar() {
  return (
    <div className="flex h-[54px] items-center gap-3 rounded-[14px] border-[0.5px] border-ppc-card-border bg-white px-4">
      <MagnifyingGlass size={18} className="text-ppc-text-faint" />
      <input
        readOnly
        placeholder="Search by headline, finding, client, or specialist"
        className="flex-1 cursor-pointer bg-transparent text-[15px] text-ppc-ink outline-none placeholder:text-ppc-text-faint"
      />
      <kbd
        className="rounded-[6px] bg-ppc-purple-50 px-2 py-[4px] text-[11px] font-medium text-ppc-text-muted"
        style={{ fontFamily: '"Courier New", ui-monospace, monospace', letterSpacing: '0.02em' }}
      >
        ⌘K
      </kbd>
    </div>
  );
}

/* ─── Filter chips + sort ───────────────────────────────────────────────── */

function FilterBar() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-1.5">
        <Chip active label="All" count={REPORT_TOTAL} icon={Sparkle} />
        <Chip label="Project" icon={Folder} />
        <Chip label="Specialist" icon={User} />
        <Chip label="Last 30 days" icon={Calendar} />
        <Chip label="Pinned" icon={PushPin} />
      </div>
      <button
        type="button"
        className="inline-flex items-center gap-1.5 rounded-[8px] px-3 py-2 text-[13.5px] text-ppc-text-muted transition-colors hover:bg-white/60"
      >
        <Funnel size={13} weight="fill" className="text-ppc-purple-500" />
        <span>
          Sort: <span className="font-medium text-ppc-ink">Needs you</span>
        </span>
        <CaretDown size={11} weight="bold" className="text-ppc-text-faint" />
      </button>
    </div>
  );
}

function Chip({
  active,
  label,
  count,
  icon: Icon,
}: {
  active?: boolean;
  label: string;
  count?: number;
  icon?: typeof Sparkle;
}) {
  return (
    <button
      type="button"
      className={`group inline-flex items-center gap-1.5 rounded-full px-3.5 py-[8px] text-[13px] transition-all ${
        active
          ? 'bg-ppc-purple-500 font-medium text-white shadow-[0_2px_8px_-2px_rgba(127,90,240,0.45)]'
          : 'border-[0.5px] border-transparent bg-white text-ppc-ink hover:-translate-y-[1px] hover:border-ppc-card-border'
      }`}
    >
      {Icon && (
        <Icon
          size={12}
          weight={active ? 'fill' : 'regular'}
          className={active ? 'text-white/90' : 'text-ppc-text-faint'}
        />
      )}
      {label}
      {count !== undefined && (
        <span
          className={`-mr-1 inline-flex h-[18px] min-w-[20px] items-center justify-center rounded-full px-[6px] text-[11px] font-medium leading-none ${
            active ? 'bg-white/22 text-white' : 'bg-ppc-purple-50 text-ppc-text-muted'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

/* ─── Needs you today ───────────────────────────────────────────────────── */

function NeedsSection() {
  return (
    <section>
      <SectionHead
        title="Needs you today"
        count={NEEDS_TODAY.length}
        description={
          <>
            What your specialists flagged as <SerifAccent>urgent</SerifAccent>. Triaged by impact,
            freshness, and account state.
          </>
        }
        action="Snooze all"
      />
      <div className="grid gap-3.5 md:grid-cols-2">
        {NEEDS_TODAY.map((r) => (
          <NeedsCard key={r.id} report={r} />
        ))}
      </div>
    </section>
  );
}

function NeedsCard({ report }: { report: NeedsReport }) {
  return (
    <Link
      to={`/reports/${report.runId}`}
      className="group relative block rounded-[18px] border-[0.5px] border-transparent bg-white p-6 transition-all duration-200 hover:-translate-y-[3px] hover:border-ppc-purple-300/50 hover:shadow-[0_12px_36px_-12px_rgba(127,90,240,0.18)]"
    >
      <div className="mb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span aria-hidden className="text-[22px] leading-none">
            {report.agentEmoji}
          </span>
          <ProjectChip projectId={report.projectId} name={report.projectName} />
          <span className="text-[14.5px] font-medium tracking-[-0.005em] text-ppc-ink">
            {report.projectName}
          </span>
        </div>
        {report.pinned && (
          <span
            className="h-[8px] w-[8px] rounded-full bg-ppc-purple-500"
            title="Pinned"
            style={{ boxShadow: '0 0 0 3px rgba(127,90,240,0.18)' }}
          />
        )}
      </div>

      <h3
        className="mb-3.5 text-[25px] font-semibold leading-[1.12] tracking-[-0.028em] text-ppc-ink"
      >
        {report.headline}
        <span
          className="font-serif italic text-ppc-purple-500"
          style={{
            fontFamily: 'PF-Marlet-Display, "Playfair Display", Georgia, serif',
          }}
        >
          .
        </span>
      </h3>

      <div className="text-[14.5px] text-ppc-ink">
        <span className="text-[15px] font-semibold text-[#1D9E4F]">
          {report.primaryMetric.value}
        </span>{' '}
        <span className="text-ppc-ink">{report.primaryMetric.label}</span>
      </div>
      <div className="mt-1 text-[13px] text-ppc-text-muted">{report.secondaryMetric}</div>

      <div
        className="mt-4 rounded-[10px] border-[0.5px] border-ppc-purple-500/15 bg-ppc-purple-50 px-3.5 py-3"
      >
        <div className="mb-1 flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.10em] text-ppc-purple-700">
          <Sparkle size={11} weight="fill" className="text-ppc-purple-500" />
          Why now
        </div>
        <p className="text-[13px] leading-[1.45] text-ppc-purple-900/85">{report.whyNow}</p>
      </div>

      <div className="mt-4 flex items-center justify-between border-t-[0.5px] border-ppc-card-border pt-3.5 text-[13px] text-ppc-text-faint">
        <span>
          {report.agentName} <span className="text-ppc-text-faint">·</span> {report.finishedLabel}
        </span>
        <span className="inline-flex items-center gap-1 font-medium text-ppc-purple-500 transition-all group-hover:gap-1.5">
          {report.cta}
          <ArrowRight size={12} weight="bold" />
        </span>
      </div>
    </Link>
  );
}

/* ─── Ready for client ──────────────────────────────────────────────────── */

function ReadySection() {
  return (
    <section>
      <SectionHead
        title="Ready for client"
        count={READY_FOR_CLIENT.length}
        description={
          <>
            Reviewed and waiting for your <SerifAccent>sign-off</SerifAccent> before they go out.
          </>
        }
        action="Send all approved"
      />
      <div className="overflow-hidden rounded-[18px] border-[0.5px] border-ppc-card-border bg-white">
        {READY_FOR_CLIENT.map((r, i) => (
          <ReadyRow key={r.id} report={r} divider={i < READY_FOR_CLIENT.length - 1} />
        ))}
      </div>
    </section>
  );
}

function ReadyRow({ report, divider }: { report: ReadyReport; divider: boolean }) {
  return (
    <Link
      to={`/reports/${report.runId}`}
      className={`group flex items-center gap-4 px-6 py-4 transition-colors hover:bg-ppc-purple-50/60 ${
        divider ? 'border-b-[0.5px] border-ppc-card-border' : ''
      }`}
    >
      <span aria-hidden className="text-[20px] leading-none">
        {report.agentEmoji}
      </span>
      <ProjectChip projectId={report.projectId} name={report.projectName} size="md" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[15px] font-semibold tracking-[-0.012em] text-ppc-ink">
          {report.headline}
          <span
            className="font-serif italic text-ppc-purple-500"
            style={{
              fontFamily: 'PF-Marlet-Display, "Playfair Display", Georgia, serif',
            }}
          >
            .
          </span>
        </div>
        <div className="mt-[2px] truncate text-[12.5px] text-ppc-text-muted">
          <span className="font-medium text-ppc-ink">{report.agentName}</span>
          <span className="text-ppc-text-faint"> · </span>
          {report.projectName}
          <span className="text-ppc-text-faint"> · </span>
          {report.subline}
        </div>
      </div>
      <StatusPill status={report.status} />
      <span className="hidden min-w-[80px] text-right text-[12.5px] text-ppc-text-faint sm:inline">
        {report.finishedLabel}
      </span>
      <CaretRight
        size={14}
        weight="bold"
        className="text-ppc-text-faint transition-all group-hover:translate-x-[2px] group-hover:text-ppc-purple-500"
      />
    </Link>
  );
}

function StatusPill({ status }: { status: ReportStatus }) {
  const map: Record<ReportStatus, { label: string; bg: string; fg: string }> = {
    'draft-ready': {
      label: 'Draft ready',
      bg: 'rgba(127,90,240,0.10)',
      fg: 'var(--ppc-purple-700)',
    },
    approved: {
      label: 'Approved',
      bg: 'rgba(29,158,79,0.10)',
      fg: '#1D9E4F',
    },
    'needs-review': {
      label: 'Needs your review',
      bg: 'rgba(217,119,6,0.10)',
      fg: '#D97706',
    },
    sent: {
      label: 'Sent',
      bg: 'rgba(14,14,16,0.06)',
      fg: 'var(--ppc-text-muted)',
    },
  };
  const tone = map[status];
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-[4px] text-[11.5px] font-medium"
      style={{ background: tone.bg, color: tone.fg }}
    >
      <span
        className="h-[5px] w-[5px] rounded-full"
        style={{ background: 'currentColor', opacity: 0.7 }}
      />
      {tone.label}
    </span>
  );
}

/* ─── FYI ──────────────────────────────────────────────────────────────── */

function FyiSection() {
  return (
    <section>
      <SectionHead
        title="For your information"
        count={12}
        description={
          <>
            Informational only. No action needed, just <SerifAccent>background</SerifAccent>.
          </>
        }
      />
      <div className="overflow-hidden rounded-[18px] border-[0.5px] border-ppc-card-border bg-ppc-panel-soft/65">
        {FYI_REPORTS.map((r, i) => (
          <FyiRow key={r.id} report={r} divider={i < FYI_REPORTS.length - 1} />
        ))}
      </div>
    </section>
  );
}

function FyiRow({ report, divider }: { report: FyiReport; divider: boolean }) {
  return (
    <Link
      to={`/reports/${report.runId}`}
      className={`group flex items-center gap-3.5 px-6 py-3 transition-colors hover:bg-white/60 ${
        divider ? 'border-b-[0.5px] border-ppc-card-border/60' : ''
      }`}
    >
      <span aria-hidden className="text-[17px] leading-none">
        {report.agentEmoji}
      </span>
      <ProjectChip projectId={report.projectId} name={report.projectName} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14px] font-medium text-ppc-text-muted">
          {report.headline}
        </div>
        <div className="mt-[1px] truncate text-[12px] text-ppc-text-faint">
          <span className="font-medium text-ppc-text-muted">{report.agentName}</span>
          <span> · </span>
          {report.projectName}
          <span> · </span>
          {report.subline}
        </div>
      </div>
      <span className="hidden min-w-[70px] text-right text-[12px] text-ppc-text-faint sm:inline">
        {report.finishedLabel}
      </span>
      <CaretRight
        size={13}
        weight="bold"
        className="text-ppc-text-faint/70 transition-all group-hover:translate-x-[2px] group-hover:text-ppc-purple-500"
      />
    </Link>
  );
}

/* ─── Actioned ─────────────────────────────────────────────────────────── */

function ActionedSection() {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-between rounded-[14px] border-[0.5px] border-ppc-card-border bg-ppc-panel-soft/65 px-6 py-[18px] text-left transition-all hover:bg-white"
    >
      <span className="text-[14px] text-ppc-text-muted">
        <span className="font-semibold text-ppc-ink">
          {ACTIONED_THIS_MONTH} reports actioned
        </span>{' '}
        this month. Nice work.
      </span>
      <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ppc-purple-500">
        Expand
        <CaretRight size={11} weight="bold" />
      </span>
    </button>
  );
}

/* ─── Keyboard hints ───────────────────────────────────────────────────── */

function KeyboardHints() {
  const hints: { keys: string[]; label: string }[] = [
    { keys: ['J', 'K'], label: 'navigate' },
    { keys: ['␣'], label: 'peek' },
    { keys: ['↵'], label: 'open' },
    { keys: ['P'], label: 'pin' },
    { keys: ['S'], label: 'send' },
    { keys: ['X'], label: 'archive' },
    { keys: ['?'], label: 'all shortcuts' },
  ];
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 rounded-[14px] bg-white/55 px-5 py-3.5 text-[12.5px] backdrop-blur-sm">
      {hints.map((h) => (
        <span key={h.label} className="inline-flex items-center gap-1.5 text-ppc-text-faint">
          {h.keys.map((k) => (
            <kbd
              key={k}
              className="grid h-[18px] min-w-[18px] place-items-center rounded-[5px] border-[0.5px] border-ppc-card-border bg-white px-1.5 text-[10px] font-semibold leading-none text-ppc-text-muted"
            >
              {k}
            </kbd>
          ))}
          <span className="font-medium text-ppc-ink">{h.label}</span>
        </span>
      ))}
    </div>
  );
}

/* ─── Section head ──────────────────────────────────────────────────────── */

function SectionHead({
  title,
  count,
  description,
  action,
}: {
  title: string;
  count: number;
  description: React.ReactNode;
  action?: string;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-6 px-1">
      <div className="flex-1">
        <h2 className="flex items-baseline gap-2.5 text-[22px] font-semibold tracking-[-0.025em] text-ppc-ink">
          {title}
          <span className="text-[13.5px] font-medium text-ppc-text-faint">{count} reports</span>
        </h2>
        <div className="mt-[3px] text-[13.5px] leading-[1.5] text-ppc-text-muted">
          {description}
        </div>
      </div>
      {action && (
        <button
          type="button"
          className="shrink-0 pt-1 text-[13px] text-ppc-text-faint transition-colors hover:text-ppc-purple-500"
        >
          {action} <ArrowRight size={11} weight="bold" className="inline" />
        </button>
      )}
    </div>
  );
}

/* ─── Atoms ─────────────────────────────────────────────────────────────── */

/* Inline serif italic accent — same tone as the brand "what needs you"
 * treatment used in the source mockup. */
function SerifAccent({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="font-serif italic text-ppc-purple-700"
      style={{
        fontFamily: 'PF-Marlet-Display, "Playfair Display", Georgia, serif',
        fontSize: '1.08em',
        fontWeight: 500,
      }}
    >
      {children}
    </span>
  );
}

/* Per-project letter chip. Hashes the projectId to a hue so each project
 * has a consistent color across the app (matches the AppShell pattern). */
function ProjectChip({
  projectId,
  name,
  size = 'md',
}: {
  projectId: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const dims = {
    sm: { box: 22, font: 10.5, radius: 6 },
    md: { box: 26, font: 12, radius: 7 },
    lg: { box: 30, font: 13, radius: 8 },
  }[size];
  const palette = projectPalette(projectId);
  return (
    <span
      className="grid shrink-0 place-items-center font-semibold leading-none"
      style={{
        height: dims.box,
        width: dims.box,
        background: palette.bg,
        color: palette.fg,
        borderRadius: dims.radius,
        fontSize: dims.font,
        boxShadow: `inset 0 0 0 1px ${palette.ring}`,
      }}
      title={name}
    >
      {name.charAt(0)}
    </span>
  );
}

/* Specific palette per canonical project — keeps avatar color stable across
 * the app rather than re-hashing on every render. */
function projectPalette(id: string): { bg: string; fg: string; ring: string } {
  const map: Record<string, { bg: string; fg: string; ring: string }> = {
    'boulder-care':       { bg: '#0E0E10', fg: '#FFFFFF', ring: 'rgba(255,255,255,0.10)' },
    'flock':              { bg: '#F58F6E', fg: '#FFFFFF', ring: 'rgba(245,143,110,0.35)' },
    'the-hoth':           { bg: '#22C7A4', fg: '#0A2A22', ring: 'rgba(34,199,164,0.30)' },
    'durable':            { bg: '#4A8FE3', fg: '#FFFFFF', ring: 'rgba(74,143,227,0.30)' },
    'livingyoung':        { bg: '#7C5CFA', fg: '#FFFFFF', ring: 'rgba(124,92,250,0.30)' },
    'linkbuilder':        { bg: '#65D6A1', fg: '#0A2A22', ring: 'rgba(101,214,161,0.30)' },
    'authority-builders': { bg: '#5B7CF8', fg: '#FFFFFF', ring: 'rgba(91,124,248,0.30)' },
    'edwin-novel':        { bg: '#D946A8', fg: '#FFFFFF', ring: 'rgba(217,70,168,0.30)' },
  };
  return map[id] ?? { bg: '#7F5AF0', fg: '#FFFFFF', ring: 'rgba(127,90,240,0.30)' };
}
