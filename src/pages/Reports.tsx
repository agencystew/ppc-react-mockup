import { Link } from 'react-router-dom';
import {
  MagnifyingGlass, CaretDown, ArrowRight, ArrowUp, ArrowDown, Sparkle,
  Check, PaperPlaneTilt, PushPin, Rows, SquaresFour, Lightning,
  Compass, ArrowUpRight, Plus,
} from '@phosphor-icons/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  NEEDS_TODAY, READY_FOR_CLIENT, FYI_REPORTS,
  ACTIONED_THIS_MONTH, SPECIALISTS_RUNNING, ACCOUNTS_COVERED,
  type NeedsReport, type ReadyReport, type FyiReport, type ReportStatus,
  type SubFinding,
} from '../mock/reports';
import { PROJECTS } from '../mock/projects';

/* Reports · /reports
 *
 * Inbox surface — designed as the sibling of /projects. Same hand:
 * bright KPI moment up top, elegant ledger card, one earned-dark
 * footer that pays off the work with a "go open this" CTA.
 *
 * Three personas, one switcher:
 *   · Operator     — daily triage. KPI quartet + inbox + "most urgent" footer
 *   · Leadership   — agency rollup. KPI quartet + project heat-map
 *   · Client-ready — approval queue with batch send
 *
 * v5 brand: lavender canvas, italic purple period accents, Figtree,
 * "Courier New" mono eyebrows, no pretend-live UI on static data.
 */

type Persona = 'operator' | 'leadership' | 'client';
type Density = 'compact' | 'comfortable';

interface FlatReport {
  id: string;
  runId: string;
  agentName: string;
  agentEmoji: string;
  projectId: string;
  projectName: string;
  headline: string;
  subline: string;
  finishedLabel: string;
  bucket: 'needs' | 'ready' | 'fyi';
  status?: ReportStatus;
  primaryMetric?: string;
  primaryMetricLabel?: string;
  whyNow?: string;
  pinned?: boolean;
  subFindings: SubFinding[];
}

export function Reports() {
  const [persona, setPersona]   = useState<Persona>('operator');
  const [density, setDensity]   = useState<Density>('compact');
  const [query, setQuery]       = useState('');
  const [projectId, setProject] = useState<string>('all');

  /* ─── Flatten ──────────────────────────────────────────────────── */
  const all: FlatReport[] = useMemo(() => {
    const needs: FlatReport[] = NEEDS_TODAY.map((r: NeedsReport) => ({
      id: r.id, runId: r.runId, agentName: r.agentName, agentEmoji: r.agentEmoji,
      projectId: r.projectId, projectName: r.projectName,
      headline: r.headline, subline: r.secondaryMetric, finishedLabel: r.finishedLabel,
      bucket: 'needs',
      primaryMetric: r.primaryMetric.value,
      primaryMetricLabel: r.primaryMetric.label,
      whyNow: r.whyNow,
      pinned: r.pinned,
      subFindings: r.subFindings,
    }));
    const ready: FlatReport[] = READY_FOR_CLIENT.map((r: ReadyReport) => ({
      id: r.id, runId: r.runId, agentName: r.agentName, agentEmoji: r.agentEmoji,
      projectId: r.projectId, projectName: r.projectName,
      headline: r.headline, subline: r.subline, finishedLabel: r.finishedLabel,
      bucket: 'ready', status: r.status,
      subFindings: r.subFindings,
    }));
    const fyi: FlatReport[] = FYI_REPORTS.map((r: FyiReport) => ({
      id: r.id, runId: r.runId, agentName: r.agentName, agentEmoji: r.agentEmoji,
      projectId: r.projectId, projectName: r.projectName,
      headline: r.headline, subline: r.subline, finishedLabel: r.finishedLabel,
      bucket: 'fyi',
      subFindings: r.subFindings,
    }));
    return [...needs, ...ready, ...fyi];
  }, []);

  const counts = useMemo(() => ({
    all:      all.length,
    needs:    all.filter((r) => r.bucket === 'needs').length,
    ready:    all.filter((r) => r.bucket === 'ready').length,
    fyi:      all.filter((r) => r.bucket === 'fyi').length,
    wins:     all.reduce((acc, r) => acc + r.subFindings.filter((f) => f.impact === 'healthy').length, 0),
    actioned: ACTIONED_THIS_MONTH,
  }), [all]);

  /* Pinned "most urgent" report — surfaces in the dark footer payoff */
  const urgent = useMemo(() => {
    const pool = all.filter((r) => r.bucket === 'needs');
    return pool.find((r) => r.pinned) ?? pool[0];
  }, [all]);

  /* Rows in the inbox — filtered + sorted (pinned first, then mock order
   * which already reflects intended recency). No workflow-state sort —
   * the inbox is "stuff to scan and dig into", not a chore queue. */
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all
      .filter((r) => projectId === 'all' || r.projectId === projectId)
      .filter((r) => {
        if (!q) return true;
        return (
          r.headline.toLowerCase().includes(q) ||
          r.agentName.toLowerCase().includes(q) ||
          r.projectName.toLowerCase().includes(q) ||
          r.subline.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return 0;
      });
  }, [all, query, projectId]);

  return (
    <div className="space-y-7 pb-6">
      <style>{PAGE_STYLES}</style>

      {/* ═══════════════════════════════════════════════════════════════
          1 · HEADER — clean. No fake-live count chips. Headline +
              persona switcher pinned right. Mirrors /projects spacing. */}
      <header className="reveal flex flex-wrap items-end justify-between gap-5" style={{ animationDelay: '0ms' }}>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-[46px] font-extrabold leading-[0.96] tracking-[-0.030em] text-ppc-ink">
            Reports<span className="text-ppc-purple-500">.</span>
          </h1>
        </div>
        <PersonaSwitch persona={persona} onChange={setPersona} />
      </header>

      {/* ═══════════════════════════════════════════════════════════════
          2 · BODY — switched by persona                                  */}
      {persona === 'leadership' ? (
        <LeadershipView all={all} counts={counts} />
      ) : persona === 'client' ? (
        <ClientReadyView all={all} />
      ) : (
        <OperatorView
          counts={counts}
          rows={rows}
          density={density} setDensity={setDensity}
          query={query} setQuery={setQuery}
          projectId={projectId} setProject={setProject}
          urgent={urgent}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PERSONA SWITCH                                                       */

function PersonaSwitch({ persona, onChange }: { persona: Persona; onChange: (p: Persona) => void }) {
  return (
    <div
      className="reveal inline-flex items-center rounded-[12px] border border-[#d9d4ec] bg-white p-[3px]"
      style={{
        animationDelay: '60ms',
        boxShadow: '0 1px 0 rgba(255,255,255,0.7) inset, 0 2px 4px rgba(15,10,30,0.02)',
      }}
    >
      <PersonaButton active={persona === 'operator'}   onClick={() => onChange('operator')}   label="Operator"     tagline="what I do today" />
      <PersonaButton active={persona === 'leadership'} onClick={() => onChange('leadership')} label="Leadership"   tagline="agency rollup"   />
      <PersonaButton active={persona === 'client'}     onClick={() => onChange('client')}     label="Client-ready" tagline="approval queue"  />
    </div>
  );
}

function PersonaButton({
  active, onClick, label, tagline,
}: { active: boolean; onClick: () => void; label: string; tagline: string }) {
  return (
    <button
      onClick={onClick}
      className={[
        'group relative flex items-baseline gap-2 rounded-[9px] px-3.5 py-[8px] text-[12.5px] font-semibold tracking-tight transition-all duration-200',
        active
          ? 'text-white'
          : 'text-ppc-ink hover:bg-[#F3F0FF]',
      ].join(' ')}
      style={active ? {
        background: 'linear-gradient(180deg, #8E6BF5 0%, #7F5AF0 50%, #6E47E0 100%)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.22) inset, 0 0 0 1px rgba(127,90,240,0.55), 0 10px 22px -10px rgba(127,90,240,0.65)',
      } : undefined}
    >
      <span>{label}</span>
      <span className={`text-[10.5px] font-medium ${active ? 'text-white/70' : 'text-ppc-text-faint'}`}>
        {tagline}
      </span>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   OPERATOR VIEW — daily triage                                        */

interface OperatorProps {
  counts: { all: number; needs: number; ready: number; fyi: number; wins: number; actioned: number };
  rows: FlatReport[];
  density: Density; setDensity: (d: Density) => void;
  query: string; setQuery: (q: string) => void;
  projectId: string; setProject: (id: string) => void;
  urgent?: FlatReport;
}

/* ReportsHero — the editorial dark hero card at the top of the Operator
 * view. Same hand as the verdict card on individual reports (sandwich
 * layout, ◆ kicker, italic-period headline, dot-separated stats shelf).
 * Replaces the previous 4-card KPI quartet, which felt generic.
 *
 * Anatomy, top → bottom, all centered:
 *   1. ◆ Reports · ✓ Live · Last 7 days
 *   2. Sparkle decoration with thin flanking lines
 *   3. "Your inbox of findings." (mega headline, italic-purple period)
 *   4. Sub-line — where the findings come from
 *   5. Stats row — all post-run roll-ups, no pre-run $ claims */
function ReportsHero({
  counts,
}: {
  counts: { all: number; needs: number; ready: number; fyi: number; wins: number; actioned: number };
}) {
  return (
    <section
      className="reveal relative overflow-hidden rounded-[22px] text-white"
      style={{
        animationDelay: '120ms',
        background: 'linear-gradient(180deg, #0F0A1E 0%, #07050D 100%)',
        boxShadow:
          'inset 0 1px 0 rgba(255,255,255,0.05), 0 30px 60px -32px rgba(15,10,30,0.45)',
        padding: 'clamp(28px, 3.2vw, 44px) clamp(28px, 3.4vw, 48px)',
      }}
    >
      {/* Top-right purple bloom — same recipe as the verdict card */}
      <span
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          top: '-130px',
          right: '-110px',
          width: '460px',
          height: '300px',
          background:
            'radial-gradient(ellipse, rgba(127,90,240,0.18) 0%, transparent 62%)',
        }}
      />

      <div className="relative flex flex-col items-center text-center">
        {/* TOP META — ◆ Reports · ✓ Live · Last 7 days */}
        <div className="flex flex-wrap items-center justify-center gap-x-[14px] gap-y-2 text-[14.5px]">
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
            Reports
          </span>

          <span aria-hidden style={{ color: 'rgba(184,174,218,0.30)' }}>·</span>

          {/* ✓ Live pill — green dot + label */}
          <span
            className="inline-flex items-center gap-[8px] rounded-full px-[12px] py-[5px] font-semibold"
            style={{
              background: 'rgba(93,202,165,0.14)',
              color: '#9CE5C5',
              boxShadow: 'inset 0 0 0 1px rgba(93,202,165,0.32)',
              letterSpacing: '-0.005em',
              fontSize: '13.5px',
            }}
          >
            <span
              aria-hidden
              className="live-pulse h-[6px] w-[6px] rounded-full"
              style={{ background: '#5DCAA5' }}
            />
            Live
          </span>

          <span aria-hidden style={{ color: 'rgba(184,174,218,0.30)' }}>·</span>

          <span style={{ color: 'rgba(184,174,218,0.85)' }}>Last 7 days</span>
        </div>

        {/* Sparkle decoration — smaller than the verdict card's to signal
            this is an INBOX moment, not the payoff moment. */}
        <div aria-hidden className="my-[18px] flex items-center gap-[14px]">
          <span
            style={{
              width: '32px',
              height: '1px',
              background:
                'linear-gradient(90deg, transparent 0%, rgba(168,140,255,0.55) 100%)',
            }}
          />
          <Sparkle
            size={16}
            weight="fill"
            style={{
              color: '#A88CFF',
              filter: 'drop-shadow(0 0 12px rgba(127,90,240,0.55))',
            }}
          />
          <span
            style={{
              width: '32px',
              height: '1px',
              background:
                'linear-gradient(90deg, rgba(168,140,255,0.55) 0%, transparent 100%)',
            }}
          />
        </div>

        {/* Headline — slightly smaller than verdict card (this is the inbox,
            not the moment of arrival). Same italic-purple period motif. */}
        <h2
          className="font-display font-black text-white"
          style={{
            fontSize: 'clamp(30px, 3.4vw, 44px)',
            letterSpacing: '-0.028em',
            lineHeight: 1.06,
          }}
        >
          Your inbox of{' '}
          <span
            className="font-serif italic"
            style={{ color: '#A88CFF', fontWeight: 600 }}
          >
            findings
          </span>
          <span style={{ color: '#A88CFF' }}>.</span>
        </h2>

        <p
          className="mt-3 text-[14.5px]"
          style={{ color: 'rgba(184,174,218,0.85)' }}
        >
          What your agents found across {ACCOUNTS_COVERED} accounts.
        </p>

        {/* Bottom stats row — value(bold-tabular-white) + noun(muted-lavender)
            pairs, dot-separated at 0.30 alpha. All post-run roll-ups; no
            chore framing — total volume, positive signal, historical impact. */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-[14px] gap-y-2 text-[14px]">
          <HeroStat value={counts.all.toString()}      label="reports this week" />
          <HeroDot />
          <HeroStat value={counts.wins.toString()}     label="wins surfaced" />
          <HeroDot />
          <HeroStat value={counts.actioned.toString()} label="actioned this month" />
        </div>
      </div>
    </section>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <span
      className="inline-flex items-baseline gap-[6px]"
      style={{ color: 'rgba(184,174,218,0.85)' }}
    >
      <span
        className="tabular-nums font-bold"
        style={{ color: 'rgba(255,255,255,0.94)', letterSpacing: '-0.005em' }}
      >
        {value}
      </span>
      <span>{label}</span>
    </span>
  );
}

function HeroDot() {
  return <span aria-hidden style={{ color: 'rgba(184,174,218,0.30)' }}>·</span>;
}

function OperatorView({
  counts, rows, density, setDensity, query, setQuery,
  projectId, setProject,
}: OperatorProps) {
  return (
    <>
      {/* Editorial dark hero — same family as the verdict card on individual
          reports. Sandwich layout: identity + status on top, headline +
          subline in the middle, rollup stats on the bottom. Replaces the
          generic KPI quartet that used to sit here. */}
      <ReportsHero counts={counts} />

      {/* SEARCH + FILTER CHIPS — mirrors /projects exactly.
          relative + z-40 keeps the ProjectPicker dropdown above the
          inbox card (which would otherwise win on stacking-context). */}
      <section className="reveal relative z-40 space-y-3" style={{ animationDelay: '180ms' }}>
        <div className="relative">
          <MagnifyingGlass
            size={15}
            weight="bold"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ppc-text-faint"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by headline, client, or specialist…"
            className="w-full rounded-[12px] border border-[#d9d4ec] bg-white py-[12px] pl-11 pr-4 text-[13.5px] font-medium tracking-tight text-ppc-ink outline-none transition-all placeholder:text-ppc-text-faint focus:border-ppc-purple-500/55 focus:shadow-[0_0_0_4px_rgba(127,90,240,0.10)]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ProjectPicker value={projectId} onChange={setProject} />
          <FilterChip label="All specialists" />
          <FilterChip label="Last 30 days" />
          <div className="ml-auto" />
          <DensityToggle density={density} onChange={setDensity} />
        </div>
      </section>

      {/* INBOX TABLE — same ledger card pattern as /projects */}
      <section
        className="reveal overflow-hidden rounded-[16px] bg-white"
        style={{
          animationDelay: '240ms',
          border: '0.5px solid #d9d4ec',
          boxShadow: '0 1px 0 rgba(255,255,255,0.6) inset, 0 1px 2px rgba(15,10,30,0.025)',
        }}
      >
        <div className="flex items-center justify-between border-b border-[#ECEAFA] px-6 py-4">
          <div className="flex items-baseline gap-3">
            <span className="inline-flex items-center gap-2">
              <Sparkle size={15} weight="fill" className="text-ppc-purple-500" />
              <span className="font-display text-[17px] font-bold tracking-[-0.012em] text-ppc-ink">
                Inbox
              </span>
            </span>
            <span className="text-[12.5px] text-ppc-text-muted">
              Last 30 days
            </span>
          </div>
          <span className="text-[12.5px] text-ppc-text-muted">
            <span className="tabular-nums font-semibold text-ppc-ink">{rows.length}</span>
            <span className="text-ppc-text-faint/55"> / {counts.all}</span>
          </span>
        </div>

        <ul>
          {rows.map((r, i) => (
            density === 'compact'
              ? <CompactRow key={r.id} report={r} index={i} />
              : <ComfortableRow key={r.id} report={r} index={i} />
          ))}
          {rows.length === 0 && (
            <li className="px-7 py-16 text-center text-[13.5px] text-ppc-text-muted">
              Nothing matches your filters.
            </li>
          )}
        </ul>
      </section>

      {/* PATTERNS CTA — slim sister-link to the cross-portfolio synthesis.
          Reports = the raw firehose. Patterns = the synthesis layer that
          compiles every finding across every project into the patterns
          that span them. The banner lives here because once you're done
          triaging the inbox, the natural next step is "show me the
          bigger picture across the roster". */}
      <PatternsCta />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   ROWS — expandable inbox rows

   Each row is the headline finding of a report. The chevron at the
   right toggles an inline expansion that shows the other 3 findings
   inside the same report — bullet-dotted by impact, each a deep-link
   into its anchor on the report's AI Summary tab. Lets the operator
   scan a report's full slate of findings without leaving the inbox.

   Anatomy:
     [Link to report (covers main content)] [chevron button (toggles)]
     ── expanded panel (only when open) ──
       ● sub-finding 1
       ● sub-finding 2
       ● sub-finding 3
       → Open full report                    Deep Report ↗

   The Link and the chevron button are siblings so the chevron click
   doesn't navigate. Hover treatment fires off the outer `group` so the
   whole row reads as one hoverable unit even though it's two click
   targets internally.                                                  */

function CompactRow({ report, index }: { report: FlatReport; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const winsCount = report.subFindings.filter((f) => f.impact === 'healthy').length;
  return (
    <li className="reveal-row" style={{ animationDelay: `${300 + index * 26}ms` }}>
      <article className={`row group ${expanded ? 'row-expanded' : ''}`}>
        <div className="flex items-stretch">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="grid min-w-0 flex-1 cursor-pointer grid-cols-[190px_1fr_100px] items-center gap-3 px-6 py-[18px] text-left"
          >
            <ProjectTag id={report.projectId} name={report.projectName} />
            <div className="min-w-0">
              <div className="flex items-center gap-2 truncate">
                <span className="text-[16px] leading-none">{report.agentEmoji}</span>
                <span className="truncate text-[15px] font-semibold tracking-[-0.008em] text-ppc-ink group-hover:text-ppc-purple-700">
                  {report.headline}
                </span>
                {winsCount > 0 && <WinsMarker count={winsCount} />}
                {report.pinned && <PushPin size={12} weight="fill" className="shrink-0 text-ppc-purple-400" />}
              </div>
              <div className="mt-[3px] truncate text-[12.5px] text-ppc-text-muted">
                {report.agentName} <span className="text-ppc-text-faint/60">·</span> {report.subline}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[12.5px] tabular-nums text-ppc-text-muted">{report.finishedLabel}</span>
            </div>
          </button>
          <ExpandToggle
            count={report.subFindings.length}
            expanded={expanded}
            onToggle={() => setExpanded((v) => !v)}
          />
        </div>
        {expanded && <ExpandedFindings findings={report.subFindings} runId={report.runId} />}
      </article>
    </li>
  );
}

function ComfortableRow({ report, index }: { report: FlatReport; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const winsCount = report.subFindings.filter((f) => f.impact === 'healthy').length;
  return (
    <li className="reveal-row" style={{ animationDelay: `${300 + index * 26}ms` }}>
      <article className={`row group ${expanded ? 'row-expanded' : ''}`}>
        <div className="flex items-stretch">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="block min-w-0 flex-1 cursor-pointer px-6 py-[18px] text-left"
          >
            <div className="flex items-center justify-between gap-3">
              <ProjectTag id={report.projectId} name={report.projectName} />
              <span className="text-[11.5px] tabular-nums text-ppc-text-muted">{report.finishedLabel}</span>
            </div>
            <div className="mt-2.5 flex items-center gap-2.5">
              <span className="text-base leading-none">{report.agentEmoji}</span>
              <span className="text-[15px] font-semibold tracking-[-0.008em] text-ppc-ink group-hover:text-ppc-purple-700">
                {report.headline}
              </span>
              {winsCount > 0 && <WinsMarker count={winsCount} />}
              {report.pinned && <PushPin size={11} weight="fill" className="text-ppc-purple-400" />}
            </div>
            <div className="mt-1 text-[12px] text-ppc-text-muted">
              {report.agentName} <span className="text-ppc-text-faint/60">·</span> {report.subline}
            </div>
          </button>
          <ExpandToggle
            count={report.subFindings.length}
            expanded={expanded}
            onToggle={() => setExpanded((v) => !v)}
          />
        </div>
        {expanded && <ExpandedFindings findings={report.subFindings} runId={report.runId} />}
      </article>
    </li>
  );
}

/* WinsMarker — a small inline chip that appears next to the headline when
 * the report contains any healthy findings. Wins-first signal at the
 * inbox level: even before you open the report, you know it has good
 * news inside, not just "fix this." Green matches the healthy impact dot
 * inside ExpandedFindings. Hidden when count is 0 — no zero-state noise. */
function WinsMarker({ count }: { count: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center gap-[3px] text-[11.5px] font-semibold tabular-nums tracking-[-0.005em]"
      style={{ color: '#1F8458' }}
      title={`${count} ${count === 1 ? 'win' : 'wins'} inside`}
    >
      <Sparkle size={10} weight="fill" />
      {count} {count === 1 ? 'win' : 'wins'}
    </span>
  );
}

/* ExpandToggle — the chevron button on the right edge of each row.
 * Lives outside the row's Link so clicking it doesn't navigate. Shows
 * a visible lavender chip with the count of additional findings, so the
 * affordance reads as clickable at rest, not only on hover. Caret flips
 * 180° when expanded. */
function ExpandToggle({
  count, expanded, onToggle,
}: { count: number; expanded: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      aria-label={expanded ? `Hide ${count} findings` : `Show ${count} more findings`}
      title={expanded ? 'Collapse' : `${count} more findings`}
      className="group/toggle flex shrink-0 items-center gap-2 self-stretch border-l border-[#ECEAFA] px-4 transition-colors hover:bg-[#F3F0FF]"
    >
      <span
        className="inline-flex items-center gap-1 rounded-full px-2.5 py-[3px] text-[11.5px] font-semibold tabular-nums tracking-[-0.005em]"
        style={{
          background: '#F0EBFF',
          color: '#534AB7',
          boxShadow: 'inset 0 0 0 0.5px rgba(127,90,240,0.18)',
        }}
      >
        <Plus size={9} weight="bold" />
        {count}
        <span className="ml-[2px] hidden font-medium opacity-70 sm:inline">
          more
        </span>
      </span>
      <CaretDown
        size={13}
        weight="bold"
        className={`text-ppc-purple-500 transition-transform duration-200 ${
          expanded ? 'rotate-180' : ''
        }`}
      />
    </button>
  );
}

/* ExpandedFindings — the inline panel that appears below a row when
 * the chevron is clicked. Indents past the project chip column so it
 * reads as belonging to its parent row. Each sub-finding is a deep
 * link into its anchor on the report's AI Summary tab. Footer carries
 * the "Open full report" + "Deep Report" affordances side by side. */
function ExpandedFindings({
  findings, runId,
}: { findings: SubFinding[]; runId: string }) {
  const impactStyle: Record<SubFinding['impact'], { dot: string; halo: string }> = {
    critical: { dot: '#E24B4A', halo: 'rgba(226,75,74,0.18)' },
    warning:  { dot: '#D49021', halo: 'rgba(212,144,33,0.18)' },
    healthy:  { dot: '#3FB58C', halo: 'rgba(63,181,140,0.18)' },
  };
  return (
    <div
      className="row-expansion border-t border-[#ECEAFA] bg-[#FBFAFF] px-6 py-4"
    >
      <ul className="flex flex-col gap-[2px] pl-[22px]">
        {findings.map((f) => {
          const s = impactStyle[f.impact];
          return (
            <li key={f.id}>
              <Link
                to={`/reports/${runId}#discovery-${f.id}`}
                className="group/sub flex items-start gap-3 rounded-[8px] px-2 py-[9px] transition-colors hover:bg-white"
              >
                <span
                  aria-hidden
                  className="mt-[8px] h-[7px] w-[7px] shrink-0 rounded-full"
                  style={{ background: s.dot, boxShadow: `0 0 0 3px ${s.halo}` }}
                />
                <span className="min-w-0 flex-1 text-[13.5px] leading-[1.55] text-ppc-ink/85 group-hover/sub:text-ppc-ink">
                  {f.body}
                </span>
                <ArrowRight
                  size={12}
                  weight="bold"
                  className="mt-[5px] shrink-0 text-ppc-text-faint opacity-0 transition-all group-hover/sub:translate-x-[2px] group-hover/sub:text-ppc-purple-500 group-hover/sub:opacity-100"
                />
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-3 flex items-center justify-between border-t border-dashed border-[#E2DCF0] pl-[22px] pt-3">
        <Link
          to={`/reports/${runId}`}
          className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-ppc-purple-700 transition-colors hover:text-ppc-purple-500"
        >
          Open full report
          <ArrowRight size={11} weight="bold" />
        </Link>
        <Link
          to={`/reports/${runId}?tab=deep`}
          className="inline-flex items-center gap-1 text-[11.5px] font-medium text-ppc-text-muted transition-colors hover:text-ppc-ink"
        >
          Deep Report
          <ArrowUpRight size={10} weight="bold" />
        </Link>
      </div>
    </div>
  );
}

function ProjectTag({ id, name }: { id: string; name: string }) {
  const chip = projectChip(id);
  return (
    <span className="inline-flex items-center gap-2.5 truncate">
      <span
        className="grid h-[24px] w-[24px] shrink-0 place-items-center rounded-[6px] text-[10.5px] font-bold leading-none"
        style={{
          background: chip.bg,
          color: chip.fg,
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.32), inset 0 -1px 0 rgba(0,0,0,0.10)',
        }}
      >
        {name.charAt(0)}
      </span>
      <span className="truncate text-[12.5px] font-semibold tracking-[-0.005em] text-ppc-ink">{name}</span>
    </span>
  );
}

function projectChip(id: string): { bg: string; fg: string } {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const hue = h % 360;
  return {
    bg: `linear-gradient(155deg, hsl(${hue}, 65%, 90%) 0%, hsl(${hue}, 55%, 84%) 100%)`,
    fg: `hsl(${hue}, 55%, 26%)`,
  };
}

function BucketPill({ bucket, status }: { bucket: 'needs' | 'ready' | 'fyi'; status?: ReportStatus }) {
  if (bucket === 'needs') {
    return <Pill bg="#FBE6E5" fg="#9F2624" dot="#E24B4A">Needs you</Pill>;
  }
  if (bucket === 'ready') {
    const map: Record<ReportStatus, { bg: string; fg: string; dot: string; label: string }> = {
      'draft-ready':  { bg: '#F0EBFF', fg: '#5742A8', dot: '#7F5AF0', label: 'Draft ready'  },
      'approved':     { bg: '#E2F4EC', fg: '#1F8458', dot: '#3FB58C', label: 'Approved'     },
      'needs-review': { bg: '#FAEFDD', fg: '#82500A', dot: '#D49021', label: 'Needs review' },
      'sent':         { bg: '#EFEEF6', fg: '#5C5773', dot: '#8a8398', label: 'Sent'         },
    };
    const s = map[status ?? 'draft-ready'];
    return <Pill bg={s.bg} fg={s.fg} dot={s.dot}>{s.label}</Pill>;
  }
  return <Pill bg="#F3F0FF" fg="#534AB7" dot="#7F5AF0">FYI</Pill>;
}

function Pill({ bg, fg, dot, children }: { bg: string; fg: string; dot: string; children: React.ReactNode }) {
  return (
    <span
      className="tabular-nums inline-flex items-center gap-1.5 rounded-[7px] px-[9px] py-[4px] text-[11.5px] font-bold tracking-tight"
      style={{ background: bg, color: fg }}
    >
      <span className="h-[5px] w-[5px] rounded-full" style={{ background: dot }} />
      {children}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PATTERNS BANNER — slim editorial invitation under the inbox

   Reports surfaces every individual finding. Patterns is the next layer
   up — synthesis across findings from every project. The banner sits at
   the bottom of /reports because that's where the operator finishes
   triage and wants the bigger picture. Slim, single-line — the inbox is
   the page's weight, this banner is a quiet sister-link, not a hero.   */

function PatternsCta() {
  return (
    <Link
      to="/patterns"
      className="reveal group relative block overflow-hidden rounded-[14px] transition-all hover:-translate-y-[1px]"
      style={{
        animationDelay: '320ms',
        background: 'linear-gradient(180deg, #FFFFFF 0%, #FAF7FF 100%)',
        border: '0.5px solid #d9d4ec',
        boxShadow: '0 1px 0 rgba(255,255,255,0.7) inset, 0 6px 20px -16px rgba(127,90,240,0.18)',
      }}
    >
      {/* Whisper of purple from the right on hover — atmosphere, not chrome */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-12 h-[180px] w-[260px] rounded-full opacity-40 transition-opacity duration-500 group-hover:opacity-90"
        style={{ background: 'radial-gradient(circle, rgba(127,90,240,0.10) 0%, transparent 65%)' }}
      />

      <div className="relative flex items-center gap-4 px-5 py-[14px] sm:px-6">
        {/* Compass tile */}
        <span
          className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-[9px]"
          style={{
            background: 'linear-gradient(155deg, #E9E3FF 0%, #D3C6FF 100%)',
            boxShadow: 'inset 0 0 0 0.5px rgba(127,90,240,0.28)',
          }}
        >
          <Compass size={14} weight="duotone" className="text-ppc-purple-700" />
        </span>

        {/* Copy — eyebrow + headline on one line */}
        <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="mono-eyebrow text-ppc-purple-700">Step back</span>
          <span
            className="text-[14px] font-semibold tracking-[-0.005em] text-ppc-ink"
          >
            See this week's patterns across your roster
            <span className="ml-px font-serif italic text-ppc-purple-500">.</span>
          </span>
          <span className="text-[12.5px] text-ppc-text-muted">
            The forest, not the trees.
          </span>
        </div>

        {/* Arrow */}
        <ArrowRight
          size={13}
          weight="bold"
          className="shrink-0 text-ppc-purple-500 transition-transform duration-200 group-hover:translate-x-[3px]"
        />
      </div>
    </Link>
  );
}


/* ═══════════════════════════════════════════════════════════════════
   KPI CARD — copy-cat of /projects KpiCard for visual continuity      */

function KpiCard({
  label, value, delta, spark, accent,
}: {
  label: string;
  value: string;
  delta: { tone: 'up' | 'down'; pct: number; good?: boolean };
  spark: number[];
  accent: string;
}) {
  /* Brand-correct: WHITE cards, mirrors /projects KpiCard byte-for-byte
   * for visual continuity. Earlier dark variant was off-brand — Reports
   * lives in the same lavender canvas family as Projects. */
  const semantic = delta.good ? (delta.tone === 'down' ? 'up' : 'down') : delta.tone;
  const palette = semantic === 'up'
    ? { fg: '#1F8458', bg: '#E2F4EC', Icon: ArrowUp }
    : { fg: '#C5301B', bg: '#FBE6E5', Icon: ArrowDown };
  return (
    <div
      className="kpi-card group relative overflow-hidden rounded-[14px] bg-white px-5 pb-4 pt-4"
      style={{ border: '0.5px solid #d9d4ec', boxShadow: '0 1px 0 rgba(255,255,255,0.7) inset' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="mono-eyebrow text-ppc-text-faint">{label}</div>
        <span
          className="tabular-nums inline-flex items-center gap-[3px] rounded-[6px] px-[7px] py-[2px] text-[11px] font-semibold"
          style={{ color: palette.fg, background: palette.bg }}
        >
          <palette.Icon size={9} weight="bold" />
          {delta.pct.toFixed(1)}%
        </span>
      </div>
      <div className="mt-2.5 font-display text-[30px] font-extrabold leading-[1.0] tracking-[-0.024em] tabular-nums text-ppc-ink">
        {value}
      </div>
      <div className="mt-3 -mb-1">
        <KpiSparkline points={spark} accent={accent} />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 bottom-0 h-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `linear-gradient(90deg, transparent 0%, ${accent}80 50%, transparent 100%)` }}
      />
    </div>
  );
}

function KpiSparkline({ points, accent }: { points: number[]; accent: string }) {
  const w = 300, h = 32, max = 22;
  const stepX = w / (points.length - 1);
  const linePath = points.map((y, i) => `${i === 0 ? 'M' : 'L'}${(i * stepX).toFixed(2)},${y.toFixed(2)}`).join(' ');
  const fillPath = `${linePath} L${w},${max} L0,${max} Z`;
  const id = Math.abs([...points.join(','), accent].join('').split('').reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 0));
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${max}`} className="block" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`kpi-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.32" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill={`url(#kpi-${id})`} stroke="none" />
      <path d={linePath} fill="none" stroke={accent} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   FILTER CHIPS — exact copy of /projects                              */

function FilterChip({ label }: { label: string }) {
  return (
    <button className="inline-flex items-center gap-1.5 rounded-[10px] border border-[#d9d4ec] bg-white px-3 py-[8px] text-[12.5px] font-medium tracking-tight text-ppc-ink transition-all duration-150 hover:-translate-y-px hover:border-ppc-purple-300/55 hover:bg-[#FBFAFF]">
      {label}
      <CaretDown size={10} weight="bold" className="text-ppc-text-faint" />
    </button>
  );
}

/* Project filter — properly working popover. Click-outside closes it,
 * Escape closes it. Avatar chips up front mirror the sidebar so a glance
 * tells you which client you've narrowed to. Active chip turns purple. */
function ProjectPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const current = PROJECTS.find((p) => p.id === value);
  const active = value !== 'all';

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={[
          'inline-flex items-center gap-2 rounded-[10px] px-3 py-[8px] text-[12.5px] font-medium tracking-tight transition-all duration-150 hover:-translate-y-px',
          active
            ? 'border border-ppc-purple-300/55 bg-[#F3F0FF] text-ppc-purple-700 hover:bg-[#EDE7FF]'
            : 'border border-[#d9d4ec] bg-white text-ppc-ink hover:border-ppc-purple-300/55 hover:bg-[#FBFAFF]',
        ].join(' ')}
      >
        {active && current && (
          <AvatarPip id={current.id} name={current.name} size={18} />
        )}
        <span className="mono-eyebrow text-ppc-text-faint">Project</span>
        <span className="font-semibold">{current ? current.name : 'All'}</span>
        <CaretDown
          size={10}
          weight="bold"
          className={`text-ppc-text-faint transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          className="absolute left-0 top-full mt-2 w-[300px] overflow-hidden rounded-[12px] bg-white font-sans"
          style={{
            zIndex: 50,
            border: '0.5px solid #d9d4ec',
            boxShadow: '0 18px 36px -18px rgba(15,10,30,0.22), 0 2px 6px rgba(15,10,30,0.06)',
          }}
        >
          <div className="border-b border-[#ECEAFA] px-4 pb-2 pt-3">
            <span className="text-[12.5px] font-semibold text-ppc-ink">Filter by project</span>
          </div>

          <button
            type="button"
            onClick={() => { onChange('all'); setOpen(false); }}
            className={[
              'flex w-full items-center gap-3 px-4 py-[10px] text-left text-[14px] font-semibold tracking-[-0.005em] transition-colors',
              value === 'all' ? 'bg-[#F3F0FF] text-ppc-purple-700' : 'text-ppc-ink hover:bg-[#F8F5FF]',
            ].join(' ')}
          >
            <span
              className="grid h-[26px] w-[26px] shrink-0 place-items-center rounded-[7px] text-[12px] font-bold text-ppc-purple-700"
              style={{ background: '#E9E3FF', boxShadow: 'inset 0 0 0 0.5px rgba(127,90,240,0.20)' }}
            >
              ★
            </span>
            <span className="flex-1">All projects</span>
            <span className="tabular-nums text-[12px] font-semibold text-ppc-text-muted">{PROJECTS.length}</span>
            {value === 'all' && <Check size={13} weight="bold" className="text-ppc-purple-500" />}
          </button>

          <div className="h-px bg-[#ECEAFA]" />

          <ul className="max-h-[340px] overflow-y-auto py-1">
            {PROJECTS.map((p) => {
              const isActive = value === p.id;
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => { onChange(p.id); setOpen(false); }}
                    className={[
                      'flex w-full items-center gap-3 px-4 py-[9px] text-left transition-colors',
                      isActive ? 'bg-[#F3F0FF]' : 'hover:bg-[#F8F5FF]',
                    ].join(' ')}
                  >
                    <AvatarPip id={p.id} name={p.name} size={26} />
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate text-[14px] font-semibold tracking-[-0.005em] ${isActive ? 'text-ppc-purple-700' : 'text-ppc-ink'}`}>
                        {p.name}
                      </span>
                      {p.industry && (
                        <span className="mt-[2px] block truncate text-[11.5px] text-ppc-text-muted">
                          {p.industry}
                        </span>
                      )}
                    </span>
                    {isActive && <Check size={13} weight="bold" className="text-ppc-purple-500" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

/* Small project chip — colored avatar with the first letter. Same hash-
 * based hue palette used in the /projects ledger + AppShell sidebar so
 * Boulder Care looks identical wherever it shows up. */
function AvatarPip({ id, name, size = 22 }: { id: string; name: string; size?: number }) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const hue = h % 360;
  return (
    <span
      className="grid shrink-0 place-items-center rounded-[6px] font-bold leading-none"
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.5),
        background: `linear-gradient(155deg, hsl(${hue}, 65%, 92%) 0%, hsl(${hue}, 55%, 84%) 100%)`,
        color: `hsl(${hue}, 60%, 25%)`,
        boxShadow: `inset 0 0 0 0.5px hsla(${hue}, 50%, 55%, 0.30)`,
      }}
    >
      {name.charAt(0)}
    </span>
  );
}

function DensityToggle({ density, onChange }: { density: Density; onChange: (d: Density) => void }) {
  return (
    <div className="inline-flex items-center rounded-[10px] border border-[#d9d4ec] bg-white p-[3px]">
      <button
        onClick={() => onChange('compact')}
        title="Compact rows"
        className={`grid h-[28px] w-[30px] place-items-center rounded-[7px] transition-colors ${density === 'compact' ? 'bg-ppc-ink text-white' : 'text-ppc-text-faint hover:text-ppc-ink'}`}
      >
        <Rows size={12} weight="bold" />
      </button>
      <button
        onClick={() => onChange('comfortable')}
        title="Comfortable rows"
        className={`grid h-[28px] w-[30px] place-items-center rounded-[7px] transition-colors ${density === 'comfortable' ? 'bg-ppc-ink text-white' : 'text-ppc-text-faint hover:text-ppc-ink'}`}
      >
        <SquaresFour size={12} weight="bold" />
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   LEADERSHIP VIEW                                                     */

function LeadershipView({ all, counts }: { all: FlatReport[]; counts: { needs: number; ready: number; fyi: number; wins: number; actioned: number; all: number } }) {
  const byProject = useMemo(() => {
    const map: Record<string, { name: string; total: number; needs: number }> = {};
    for (const r of all) {
      if (!map[r.projectId]) map[r.projectId] = { name: r.projectName, total: 0, needs: 0 };
      map[r.projectId].total += 1;
      if (r.bucket === 'needs') map[r.projectId].needs += 1;
    }
    return Object.entries(map).map(([id, v]) => ({ id, ...v })).sort((a, b) => b.total - a.total);
  }, [all]);
  const maxTotal = Math.max(...byProject.map((p) => p.total), 1);
  void counts;

  return (
    <>
      {/* KPI quartet — leadership flavour */}
      <section
        className="reveal grid gap-4"
        style={{ animationDelay: '120ms', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}
      >
        <KpiCard
          label="Reports this week"
          value="12"
          delta={{ tone: 'up', pct: 32.0 }}
          spark={[4, 5, 6, 7, 8, 9, 10, 11, 12, 11, 13, 12]}
          accent="#7F5AF0"
        />
        <KpiCard
          label="Revenue surfaced"
          value="$19.4K"
          delta={{ tone: 'up', pct: 18.0 }}
          spark={[10, 12, 11, 14, 13, 16, 15, 18, 17, 19, 18, 20]}
          accent="#3FB58C"
        />
        <KpiCard
          label="Blocked on you"
          value="1"
          delta={{ tone: 'down', pct: 50.0, good: true }}
          spark={[6, 5, 5, 4, 4, 3, 3, 2, 2, 1, 1, 1]}
          accent="#D49021"
        />
        <KpiCard
          label="Specialists active"
          value={SPECIALISTS_RUNNING.toString()}
          delta={{ tone: 'up', pct: 25.0 }}
          spark={[1, 2, 2, 1, 2, 3, 3, 2, 3, 3, 3, 3]}
          accent="#7F5AF0"
        />
      </section>

      {/* Heat-map table — same ledger card pattern */}
      <section
        className="reveal overflow-hidden rounded-[16px] bg-white"
        style={{
          animationDelay: '200ms',
          border: '0.5px solid #d9d4ec',
          boxShadow: '0 1px 0 rgba(255,255,255,0.6) inset, 0 1px 2px rgba(15,10,30,0.025)',
        }}
      >
        <div className="flex items-center justify-between border-b border-[#ECEAFA] px-6 py-3.5">
          <div className="flex items-center gap-2.5">
            <Sparkle size={13} weight="fill" className="text-ppc-purple-500" />
            <span className="font-display text-[14.5px] font-semibold tracking-[-0.012em] text-ppc-ink">
              Volume by client
            </span>
            <span className="mono-eyebrow text-ppc-text-faint">
              · last 30 days · heat = attention demand
            </span>
          </div>
          <span className="mono-eyebrow text-ppc-text-faint">
            <span className="tabular-nums font-semibold text-ppc-ink">{byProject.length}</span> clients
          </span>
        </div>
        <ul>
          {byProject.map((p, i) => (
            <li key={p.id} className="row reveal-row" style={{ animationDelay: `${240 + i * 32}ms` }}>
              <div className="grid grid-cols-[200px_1fr_120px] items-center gap-4 px-6 py-[14px]">
                <ProjectTag id={p.id} name={p.name} />
                <div className="relative h-[8px] overflow-hidden rounded-full bg-[#F3F0FF]">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{
                      width: `${(p.total / maxTotal) * 100}%`,
                      background: 'linear-gradient(90deg, #534AB7 0%, #7F5AF0 60%, #A88CFF 100%)',
                    }}
                  />
                </div>
                <div className="text-right text-[12px] text-ppc-text-muted">
                  <span className="tabular-nums font-semibold text-ppc-ink">{p.total}</span> reports
                  {p.needs > 0 && <>
                    <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-medium text-[#9F2624]">
                      <span className="h-[5px] w-[5px] rounded-full bg-[#E24B4A]" /> {p.needs}
                    </span>
                  </>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div
        className="reveal rounded-[12px] border border-dashed border-[#d9d4ec] bg-white px-5 py-4 text-[12.5px] text-ppc-text-muted"
        style={{ animationDelay: '320ms' }}
      >
        <span className="mono-eyebrow text-ppc-text-faint">Coming next</span>{' '}
        · specialist hit-rate over time · per-client SLA · time-to-approval trend · weekly digest export.
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CLIENT-READY VIEW                                                    */

function ClientReadyView({ all }: { all: FlatReport[] }) {
  const queue = all.filter((r) => r.bucket === 'ready');
  const draftReady = queue.filter((r) => r.status === 'draft-ready' || r.status === 'approved');

  return (
    <>
      {/* KPI duo — quieter than the operator quartet (this view is narrower) */}
      <section
        className="reveal grid gap-4"
        style={{ animationDelay: '120ms', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}
      >
        <KpiCard
          label="Awaiting your sign-off"
          value={queue.length.toString()}
          delta={{ tone: 'up', pct: 14.0 }}
          spark={[2, 3, 2, 3, 4, 3, 4, 5, 4, 5, 6, 7]}
          accent="#7F5AF0"
        />
        <KpiCard
          label="Approved & ready to send"
          value={draftReady.length.toString()}
          delta={{ tone: 'up', pct: 50.0 }}
          spark={[1, 1, 2, 2, 3, 2, 3, 3, 4, 3, 4, 5]}
          accent="#3FB58C"
        />
        <KpiCard
          label="Avg time to approval"
          value="2.4d"
          delta={{ tone: 'down', pct: 12.0, good: true }}
          spark={[5, 5, 4, 5, 4, 4, 3, 4, 3, 3, 3, 2]}
          accent="#D49021"
        />
        <KpiCard
          label="Sent this month"
          value="16"
          delta={{ tone: 'up', pct: 23.0 }}
          spark={[6, 7, 8, 9, 10, 11, 12, 13, 13, 14, 15, 16]}
          accent="#7F5AF0"
        />
      </section>

      {/* Approval queue — ledger card */}
      <section
        className="reveal overflow-hidden rounded-[16px] bg-white"
        style={{
          animationDelay: '200ms',
          border: '0.5px solid #d9d4ec',
          boxShadow: '0 1px 0 rgba(255,255,255,0.6) inset, 0 1px 2px rgba(15,10,30,0.025)',
        }}
      >
        <div className="flex items-center justify-between border-b border-[#ECEAFA] px-6 py-3.5">
          <div className="flex items-center gap-2.5">
            <Sparkle size={13} weight="fill" className="text-ppc-purple-500" />
            <span className="font-display text-[14.5px] font-semibold tracking-[-0.012em] text-ppc-ink">
              Approval queue
            </span>
            <span className="mono-eyebrow text-ppc-text-faint">
              · awaiting your sign-off
            </span>
          </div>
          <button
            className="inline-flex items-center gap-2 rounded-[10px] px-3.5 py-[7px] text-[12.5px] font-semibold text-white transition-all hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              background: 'linear-gradient(180deg, #8E6BF5 0%, #7F5AF0 50%, #6E47E0 100%)',
              boxShadow: '0 1px 0 rgba(255,255,255,0.22) inset, 0 0 0 1px rgba(127,90,240,0.55), 0 10px 22px -10px rgba(127,90,240,0.65)',
            }}
            disabled={draftReady.length === 0}
          >
            <PaperPlaneTilt size={12} weight="bold" />
            Send all approved
            <span className="tabular-nums opacity-75">({draftReady.length})</span>
          </button>
        </div>
        <ul>
          {queue.map((r, i) => (
            <li key={r.id} className="row reveal-row group" style={{ animationDelay: `${240 + i * 32}ms` }}>
              <div className="flex items-center gap-3 px-6 py-[14px]">
                <input
                  type="checkbox"
                  defaultChecked={r.status === 'draft-ready' || r.status === 'approved'}
                  className="h-[15px] w-[15px] shrink-0 accent-ppc-purple-500"
                />
                <Link to={`/reports/${r.runId}`} className="grid min-w-0 flex-1 grid-cols-[180px_1fr_140px_90px] items-center gap-3">
                  <ProjectTag id={r.projectId} name={r.projectName} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-[14px] leading-none">{r.agentEmoji}</span>
                      <span className="truncate text-[14px] font-semibold tracking-[-0.005em] text-ppc-ink group-hover:text-ppc-purple-700">
                        {r.headline}
                      </span>
                    </div>
                    <div className="mt-[2px] truncate text-[11.5px] text-ppc-text-muted">
                      {r.agentName} <span className="text-ppc-text-faint/60">·</span> {r.subline}
                    </div>
                  </div>
                  <BucketPill bucket="ready" status={r.status} />
                  <div className="text-right text-[11.5px] tabular-nums text-ppc-text-muted">{r.finishedLabel}</div>
                </Link>
              </div>
            </li>
          ))}
          {queue.length === 0 && (
            <li className="px-7 py-14 text-center text-[13.5px] text-ppc-text-muted">
              No reports awaiting approval.
            </li>
          )}
        </ul>
      </section>

      <div
        className="reveal rounded-[12px] border border-dashed border-[#d9d4ec] bg-white px-5 py-4 text-[12.5px] text-ppc-text-muted"
        style={{ animationDelay: '320ms' }}
      >
        <Lightning size={13} weight="duotone" className="mr-1 inline align-text-bottom text-ppc-purple-500" />
        Pin to a client&rsquo;s email-on-Friday schedule and approved reports auto-send.
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PAGE STYLES                                                          */

const PAGE_STYLES = `
  .mono-eyebrow {
    font-family: 'Courier New', ui-monospace, monospace;
    font-size: 10.5px;
    font-weight: 600;
    line-height: 1;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  @keyframes rp-reveal {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .reveal { opacity: 0; animation: rp-reveal 0.55s cubic-bezier(0.22, 0.9, 0.32, 1) forwards; }

  @keyframes rp-row-reveal {
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .reveal-row { opacity: 0; animation: rp-row-reveal 0.42s cubic-bezier(0.22, 0.9, 0.32, 1) forwards; }

  .row {
    position: relative;
    transition: background-color 0.2s ease;
    border-bottom: 1px solid #ECEAFA;
  }
  .row:last-child { border-bottom: none; }
  /* Hover applies only to the top half of the row (not the expansion). The
   * subtree selector targets the first child div, which carries the Link +
   * chevron. Keeps the hover whisper focused on the headline area. */
  .row > div:first-child {
    transition: background-color 0.2s ease;
  }
  .row:hover > div:first-child {
    background: linear-gradient(90deg, rgba(127,90,240,0.055) 0%, rgba(127,90,240,0.018) 38%, transparent 100%);
  }

  /* Expanded state: keep the row border but make the expansion's own top
   * border carry the seam visually. The .row-expansion class already adds
   * its own border-top in the markup, so we just suppress the row-bottom
   * border when expanded to avoid a double-line. */
  .row-expanded {
    border-bottom-color: transparent;
  }
  .row-expanded + .row {
    border-top: 1px solid #ECEAFA;
  }

  @keyframes rp-expand {
    from { opacity: 0; transform: translateY(-2px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .row-expansion {
    animation: rp-expand 0.28s cubic-bezier(0.22, 0.9, 0.32, 1);
  }

  /* KPI card — gentle hover lift (matches /projects) */
  .kpi-card {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .kpi-card:hover {
    transform: translateY(-1px);
    box-shadow: 0 1px 0 rgba(255,255,255,0.7) inset, 0 12px 28px -16px rgba(127,90,240,0.20);
  }
`;
