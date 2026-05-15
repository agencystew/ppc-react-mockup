import { Link } from 'react-router-dom';
import {
  MagnifyingGlass, CaretDown, ArrowRight, ArrowUp, ArrowDown, Sparkle,
  Coffee, Check, PaperPlaneTilt, PushPin, Rows, SquaresFour, Lightning,
} from '@phosphor-icons/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  NEEDS_TODAY, READY_FOR_CLIENT, FYI_REPORTS,
  ACTIONED_THIS_MONTH, SPECIALISTS_RUNNING,
  type NeedsReport, type ReadyReport, type FyiReport, type ReportStatus,
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
}

export function Reports() {
  const [persona, setPersona]   = useState<Persona>('operator');
  const [density, setDensity]   = useState<Density>('compact');
  const [query, setQuery]       = useState('');
  const [projectId, setProject] = useState<string>('all');
  const [bucket, setBucket]     = useState<'all' | 'needs' | 'ready' | 'fyi'>('all');

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
    }));
    const ready: FlatReport[] = READY_FOR_CLIENT.map((r: ReadyReport) => ({
      id: r.id, runId: r.runId, agentName: r.agentName, agentEmoji: r.agentEmoji,
      projectId: r.projectId, projectName: r.projectName,
      headline: r.headline, subline: r.subline, finishedLabel: r.finishedLabel,
      bucket: 'ready', status: r.status,
    }));
    const fyi: FlatReport[] = FYI_REPORTS.map((r: FyiReport) => ({
      id: r.id, runId: r.runId, agentName: r.agentName, agentEmoji: r.agentEmoji,
      projectId: r.projectId, projectName: r.projectName,
      headline: r.headline, subline: r.subline, finishedLabel: r.finishedLabel,
      bucket: 'fyi',
    }));
    return [...needs, ...ready, ...fyi];
  }, []);

  const counts = useMemo(() => ({
    all:      all.length,
    needs:    all.filter((r) => r.bucket === 'needs').length,
    ready:    all.filter((r) => r.bucket === 'ready').length,
    fyi:      all.filter((r) => r.bucket === 'fyi').length,
    actioned: ACTIONED_THIS_MONTH,
  }), [all]);

  /* Pinned "most urgent" report — surfaces in the dark footer payoff */
  const urgent = useMemo(() => {
    const pool = all.filter((r) => r.bucket === 'needs');
    return pool.find((r) => r.pinned) ?? pool[0];
  }, [all]);

  /* Rows in the inbox — filtered + sorted (needs first, then ready, then fyi) */
  const rows = useMemo(() => {
    const order: Record<FlatReport['bucket'], number> = { needs: 0, ready: 1, fyi: 2 };
    const q = query.trim().toLowerCase();
    return all
      .filter((r) => projectId === 'all' || r.projectId === projectId)
      .filter((r) => bucket === 'all' || r.bucket === bucket)
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
        const d = order[a.bucket] - order[b.bucket];
        if (d !== 0) return d;
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return 0;
      });
  }, [all, query, projectId, bucket]);

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
          bucket={bucket} setBucket={setBucket}
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
  counts: { all: number; needs: number; ready: number; fyi: number; actioned: number };
  rows: FlatReport[];
  density: Density; setDensity: (d: Density) => void;
  query: string; setQuery: (q: string) => void;
  projectId: string; setProject: (id: string) => void;
  bucket: 'all' | 'needs' | 'ready' | 'fyi'; setBucket: (b: 'all' | 'needs' | 'ready' | 'fyi') => void;
  urgent?: FlatReport;
}

function OperatorView({
  counts, rows, density, setDensity, query, setQuery,
  projectId, setProject, bucket, setBucket, urgent,
}: OperatorProps) {
  return (
    <>
      {/* KPI QUARTET — bright dashboard moment, same hand as /projects */}
      <section
        className="reveal grid gap-4"
        style={{ animationDelay: '120ms', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}
      >
        <KpiCard
          label="Needs your decision"
          value={counts.needs.toString()}
          delta={{ tone: 'up', pct: 50.0 }}
          spark={[3, 2, 4, 3, 5, 4, 6, 5, 6, 7, 6, 8]}
          accent="#C5301B"
        />
        <KpiCard
          label="Ready for client"
          value={counts.ready.toString()}
          delta={{ tone: 'up', pct: 33.3 }}
          spark={[2, 3, 2, 3, 4, 3, 4, 5, 4, 5, 6, 7]}
          accent="#D49021"
        />
        <KpiCard
          label="Auto-shipped this week"
          value="9"
          delta={{ tone: 'up', pct: 28.5 }}
          spark={[2, 3, 2, 4, 3, 5, 4, 6, 5, 7, 6, 9]}
          accent="#A88CFF"
        />
        <KpiCard
          label="Actioned this month"
          value={counts.actioned.toString()}
          delta={{ tone: 'up', pct: 14.2 }}
          spark={[12, 14, 13, 15, 17, 18, 19, 22, 23, 25, 27, 28]}
          accent="#3FB58C"
        />
      </section>

      {/* SEARCH + FILTER CHIPS — mirrors /projects exactly */}
      <section className="reveal space-y-3" style={{ animationDelay: '180ms' }}>
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
          <SegmentChip active={bucket === 'all'}   onClick={() => setBucket('all')}   label="All reports" count={counts.all} />
          <SegmentChip active={bucket === 'needs'} onClick={() => setBucket('needs')} label="Needs you"   count={counts.needs} tone="critical" />
          <SegmentChip active={bucket === 'ready'} onClick={() => setBucket('ready')} label="Ready"       count={counts.ready} tone="warning"  />
          <SegmentChip active={bucket === 'fyi'}   onClick={() => setBucket('fyi')}   label="FYI"         count={counts.fyi}   tone="info"     />
          <span className="mx-1.5 hidden h-5 w-px bg-[#d9d4ec] sm:inline-block" />
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
        <div className="flex items-center justify-between border-b border-[#ECEAFA] px-6 py-3.5">
          <div className="flex items-center gap-2.5">
            <Sparkle size={13} weight="fill" className="text-ppc-purple-500" />
            <span className="font-display text-[14.5px] font-semibold tracking-[-0.012em] text-ppc-ink">
              Inbox
            </span>
            <span className="mono-eyebrow text-ppc-text-faint">
              · last 30 days · sorted by what needs you
            </span>
          </div>
          <span className="mono-eyebrow text-ppc-text-faint">
            <span className="tabular-nums font-semibold text-ppc-ink">{rows.length}</span>
            <span className="text-ppc-text-faint/60"> / {counts.all}</span>
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

      {/* AI INSIGHT — the earned-dark footer payoff, matches /projects */}
      {urgent && <MostUrgentFooter report={urgent} />}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   ROWS                                                                */

function CompactRow({ report, index }: { report: FlatReport; index: number }) {
  return (
    <li className="row reveal-row group" style={{ animationDelay: `${300 + index * 26}ms` }}>
      <Link
        to={`/reports/${report.runId}`}
        className="grid grid-cols-[180px_1fr_140px_92px_28px] items-center gap-3 px-6 py-[14px]"
      >
        <ProjectTag id={report.projectId} name={report.projectName} />
        <div className="min-w-0">
          <div className="flex items-center gap-2 truncate">
            <span className="text-[14px] leading-none">{report.agentEmoji}</span>
            <span className="truncate text-[14px] font-semibold tracking-[-0.005em] text-ppc-ink group-hover:text-ppc-purple-700">
              {report.headline}
            </span>
            {report.pinned && <PushPin size={11} weight="fill" className="shrink-0 text-ppc-purple-400" />}
          </div>
          <div className="mt-[2px] truncate text-[11.5px] text-ppc-text-muted">
            {report.agentName} <span className="text-ppc-text-faint/60">·</span> {report.subline}
          </div>
        </div>
        <BucketPill bucket={report.bucket} status={report.status} />
        <div className="text-right">
          <span className="text-[11.5px] tabular-nums text-ppc-text-muted">{report.finishedLabel}</span>
        </div>
        <ArrowRight
          size={12}
          weight="bold"
          className="justify-self-end text-ppc-text-faint transition-transform duration-200 group-hover:translate-x-[2px] group-hover:text-ppc-purple-500"
        />
      </Link>
    </li>
  );
}

function ComfortableRow({ report, index }: { report: FlatReport; index: number }) {
  return (
    <li className="row reveal-row group" style={{ animationDelay: `${300 + index * 26}ms` }}>
      <Link to={`/reports/${report.runId}`} className="block px-6 py-[18px]">
        <div className="flex items-center justify-between gap-3">
          <ProjectTag id={report.projectId} name={report.projectName} />
          <div className="flex items-center gap-3">
            <BucketPill bucket={report.bucket} status={report.status} />
            <span className="text-[11.5px] tabular-nums text-ppc-text-muted">{report.finishedLabel}</span>
          </div>
        </div>
        <div className="mt-2.5 flex items-center gap-2.5">
          <span className="text-base leading-none">{report.agentEmoji}</span>
          <span className="text-[15px] font-semibold tracking-[-0.008em] text-ppc-ink group-hover:text-ppc-purple-700">
            {report.headline}
          </span>
          {report.pinned && <PushPin size={11} weight="fill" className="text-ppc-purple-400" />}
        </div>
        <div className="mt-1 text-[12px] text-ppc-text-muted">
          {report.agentName} <span className="text-ppc-text-faint/60">·</span> {report.subline}
        </div>
      </Link>
    </li>
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
   FOOTER — "Most urgent today" earned-dark payoff (mirrors /projects)  */

function MostUrgentFooter({ report }: { report: FlatReport }) {
  return (
    <Link
      to={`/reports/${report.runId}`}
      className="reveal group relative block overflow-hidden rounded-[20px]"
      style={{
        animationDelay: '320ms',
        background: 'radial-gradient(120% 90% at 78% 0%, #1F1340 0%, #120B26 55%, #0A0617 100%)',
        boxShadow: '0 1px 0 rgba(127,90,240,0.10) inset, 0 16px 36px -22px rgba(127,90,240,0.45), 0 1px 0 rgba(255,255,255,0.06) inset',
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-32 h-[420px] w-[420px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(127,90,240,0.40) 0%, rgba(127,90,240,0.10) 38%, transparent 70%)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-20 h-[340px] w-[340px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(127,90,240,0.10) 0%, transparent 65%)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.024) 1px, transparent 1px)',
          backgroundSize: '3px 3px',
          mixBlendMode: 'overlay',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-14 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(127,90,240,0.55) 45%, rgba(127,90,240,0.85) 50%, rgba(127,90,240,0.55) 55%, transparent 100%)' }}
      />

      <div className="relative grid grid-cols-[1.35fr_1fr] items-center gap-6 px-9 py-9">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.04] px-3 py-[5px] mono-eyebrow text-white/65">
            <Sparkle size={11} weight="fill" className="text-[#C7B0FF]" />
            Most urgent today
            <span className="text-white/30">·</span>
            <span className="text-base leading-none">{report.agentEmoji}</span>
            <span className="font-medium text-white/85">{report.agentName}</span>
            <span className="text-white/30">·</span>
            <span>{report.projectName}</span>
          </div>
          <h2 className="mt-4 font-display text-[34px] font-extrabold leading-[1.06] tracking-[-0.024em] text-white">
            {report.headline}
            <em
              className="font-serif italic font-bold not-italic ml-[2px]"
              style={{
                fontFamily: 'PF-Marlet-Display, "Playfair Display", Georgia, serif',
                fontStyle: 'italic',
                background: 'linear-gradient(90deg, #E8DDFF 0%, #C7B0FF 60%, #A88CFF 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              .
            </em>
          </h2>
          {report.whyNow && (
            <p className="mt-3 max-w-[560px] text-[13.5px] leading-[1.55] text-white/65">
              {report.whyNow}
            </p>
          )}
          <div className="mt-6 flex items-center gap-3">
            <span
              className="group/btn inline-flex items-center gap-2 rounded-[11px] px-4 py-[10px] text-[13px] font-semibold tracking-tight text-white transition-all"
              style={{
                background: 'linear-gradient(180deg, #9676F7 0%, #7F5AF0 50%, #6543DA 100%)',
                boxShadow: '0 1px 0 rgba(255,255,255,0.25) inset, 0 0 0 1px rgba(127,90,240,0.7), 0 12px 28px -10px rgba(127,90,240,0.65)',
              }}
            >
              Open report
              <ArrowRight size={12} weight="bold" className="transition-transform group-hover:translate-x-[2px]" />
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11.5px] text-white/55">
              <Coffee size={12} weight="duotone" />
              Finished {report.finishedLabel.toLowerCase()}
            </span>
          </div>
        </div>

        <div className="relative">
          <div
            className="rounded-[14px] px-6 py-5"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.015) 100%)',
              border: '0.5px solid rgba(255,255,255,0.10)',
            }}
          >
            <div className="mono-eyebrow text-white/55">
              {report.primaryMetricLabel ?? 'Upside if applied'}
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="tabular-nums font-display text-[44px] font-extrabold leading-none tracking-[-0.028em] text-white">
                {report.primaryMetric}
              </span>
            </div>
            <div className="mt-1.5 text-[11.5px] text-white/55">
              Across this account
            </div>
            <div className="mt-4">
              <FooterSparkline />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function FooterSparkline() {
  return (
    <svg width="340" height="48" viewBox="0 0 340 22" className="block" preserveAspectRatio="none">
      <defs>
        <linearGradient id="rp-footer-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C7B0FF" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#C7B0FF" stopOpacity="0" />
        </linearGradient>
        <filter id="rp-footer-glow" x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="0.7" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path d="M0,18 L28,15 L56,17 L85,13 L113,14 L141,9 L170,11 L198,7 L227,9 L255,5 L283,7 L312,3 L340,5 L340,22 L0,22 Z" fill="url(#rp-footer-grad)" stroke="none" />
      <path d="M0,18 L28,15 L56,17 L85,13 L113,14 L141,9 L170,11 L198,7 L227,9 L255,5 L283,7 L312,3 L340,5" fill="none" stroke="#C7B0FF" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" filter="url(#rp-footer-glow)" />
    </svg>
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
  const semantic = delta.good ? (delta.tone === 'down' ? 'up' : 'down') : delta.tone;
  const palette = semantic === 'up'
    ? { fg: '#86EFAC', bg: 'rgba(134,239,172,0.12)', Icon: ArrowUp }
    : { fg: '#FCA5A5', bg: 'rgba(248,113,113,0.12)', Icon: ArrowDown };
  return (
    <div
      className="kpi-card group relative overflow-hidden rounded-[14px] px-5 pb-4 pt-4"
      style={{
        background: 'radial-gradient(130% 100% at 90% 0%, #1B1138 0%, #0F0A1E 55%, #0A0617 100%)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.06) inset, 0 14px 30px -20px rgba(127,90,240,0.40)',
      }}
    >
      {/* Top-right purple bloom — soft, brighter on hover */}
      <div
        aria-hidden
        className="kpi-bloom pointer-events-none absolute -right-16 -top-20 h-[180px] w-[180px] rounded-full"
        style={{ background: `radial-gradient(circle, ${accent}40 0%, ${accent}10 40%, transparent 70%)` }}
      />
      {/* Sheen line at the very top */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent 0%, ${accent}66 50%, transparent 100%)` }}
      />
      {/* Grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.022) 1px, transparent 1px)',
          backgroundSize: '3px 3px',
          mixBlendMode: 'overlay',
        }}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="mono-eyebrow text-white/55">{label}</div>
        <span
          className="tabular-nums inline-flex items-center gap-[3px] rounded-[6px] px-[7px] py-[2px] text-[11px] font-semibold"
          style={{ color: palette.fg, background: palette.bg }}
        >
          <palette.Icon size={9} weight="bold" />
          {delta.pct.toFixed(1)}%
        </span>
      </div>
      <div className="relative mt-2.5 font-display text-[30px] font-extrabold leading-[1.0] tracking-[-0.024em] tabular-nums text-white">
        {value}
      </div>
      <div className="relative mt-3 -mb-1">
        <KpiSparkline points={spark} accent={accent} />
      </div>
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
          <stop offset="0%" stopColor={accent} stopOpacity="0.55" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </linearGradient>
        <filter id={`kpi-g-${id}`} x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="0.6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path d={fillPath} fill={`url(#kpi-${id})`} stroke="none" />
      <path
        d={linePath}
        fill="none"
        stroke={accent}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#kpi-g-${id})`}
      />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   FILTER CHIPS — exact copy of /projects                              */

function SegmentChip({
  active, onClick, label, count, tone,
}: { active: boolean; onClick: () => void; label: string; count: number; tone?: 'critical' | 'warning' | 'info' }) {
  const dot = tone === 'critical' ? '#E24B4A' : tone === 'warning' ? '#D49021' : tone === 'info' ? '#7F5AF0' : null;
  return (
    <button
      onClick={onClick}
      className={[
        'inline-flex items-center gap-2 rounded-[10px] px-3 py-[8px] text-[12.5px] font-medium tracking-tight transition-all duration-150',
        active
          ? 'text-white shadow-[0_8px_18px_-12px_rgba(127,90,240,0.7)]'
          : 'border border-[#d9d4ec] bg-white text-ppc-ink hover:-translate-y-px hover:border-ppc-purple-300/55 hover:bg-[#FBFAFF]',
      ].join(' ')}
      style={active ? {
        background: 'linear-gradient(180deg, #8E6BF5 0%, #7F5AF0 50%, #6E47E0 100%)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.22) inset, 0 0 0 1px rgba(127,90,240,0.55), 0 10px 22px -10px rgba(127,90,240,0.65)',
      } : undefined}
    >
      {dot && !active && (
        <span className="h-[6px] w-[6px] rounded-full" style={{ background: dot }} />
      )}
      {label}
      <span
        className={[
          'tabular-nums rounded-[5px] px-[6px] py-px text-[10.5px] font-bold leading-none',
          active ? 'bg-white/20 text-white' : 'bg-[#F3F0FF] text-ppc-purple-700',
        ].join(' ')}
      >
        {count}
      </span>
    </button>
  );
}

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
          className="absolute left-0 top-full mt-2 w-[260px] overflow-hidden rounded-[12px] bg-white"
          style={{
            zIndex: 50,
            border: '0.5px solid #d9d4ec',
            boxShadow: '0 18px 36px -18px rgba(15,10,30,0.22), 0 2px 6px rgba(15,10,30,0.06)',
          }}
        >
          <div className="px-3 pb-1.5 pt-2.5">
            <span className="mono-eyebrow text-ppc-text-faint">Filter by project</span>
          </div>

          <button
            type="button"
            onClick={() => { onChange('all'); setOpen(false); }}
            className={[
              'flex w-full items-center gap-2.5 px-3 py-[8px] text-left text-[13px] font-semibold tracking-[-0.005em] transition-colors',
              value === 'all'
                ? 'bg-[#F3F0FF] text-ppc-purple-700'
                : 'text-ppc-ink hover:bg-[#F8F5FF]',
            ].join(' ')}
          >
            <span
              className="grid h-[22px] w-[22px] shrink-0 place-items-center rounded-[6px] text-[11px] font-bold text-ppc-purple-700"
              style={{ background: '#E9E3FF', boxShadow: 'inset 0 0 0 0.5px rgba(127,90,240,0.20)' }}
            >
              ★
            </span>
            <span className="flex-1">All projects</span>
            <span className="mono-eyebrow text-ppc-text-faint">{PROJECTS.length}</span>
            {value === 'all' && <Check size={12} weight="bold" className="text-ppc-purple-500" />}
          </button>

          <div className="my-1 h-px bg-[#ECEAFA]" />

          <ul className="max-h-[300px] overflow-y-auto pb-1.5">
            {PROJECTS.map((p) => {
              const isActive = value === p.id;
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => { onChange(p.id); setOpen(false); }}
                    className={[
                      'flex w-full items-center gap-2.5 px-3 py-[8px] text-left text-[13px] font-medium tracking-[-0.005em] transition-colors',
                      isActive
                        ? 'bg-[#F3F0FF] text-ppc-purple-700'
                        : 'text-ppc-ink hover:bg-[#F8F5FF]',
                    ].join(' ')}
                  >
                    <AvatarPip id={p.id} name={p.name} size={22} />
                    <span className="flex-1 truncate">{p.name}</span>
                    {p.industry && (
                      <span className="hidden truncate text-[10.5px] text-ppc-text-faint sm:inline-block">
                        {p.industry}
                      </span>
                    )}
                    {isActive && <Check size={12} weight="bold" className="text-ppc-purple-500" />}
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

function LeadershipView({ all, counts }: { all: FlatReport[]; counts: { needs: number; ready: number; fyi: number; actioned: number; all: number } }) {
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
    transition: background-color 0.2s ease;
    border-bottom: 1px solid #ECEAFA;
  }
  .row:last-child { border-bottom: none; }
  .row:hover {
    background: linear-gradient(90deg, rgba(127,90,240,0.055) 0%, rgba(127,90,240,0.018) 38%, transparent 100%);
  }

  /* Dark KPI cards — gentle lift + brighter bloom on hover */
  .kpi-card {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .kpi-card:hover {
    transform: translateY(-1px);
    box-shadow:
      0 1px 0 rgba(255,255,255,0.08) inset,
      0 0 0 1px rgba(127,90,240,0.35),
      0 18px 36px -18px rgba(127,90,240,0.55);
  }
  .kpi-bloom { transition: opacity 0.35s ease, transform 0.35s ease; opacity: 0.85; }
  .kpi-card:hover .kpi-bloom { opacity: 1; transform: scale(1.08); }
`;
