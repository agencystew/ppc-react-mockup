import { Link } from 'react-router-dom';
import {
  MagnifyingGlass, CaretDown, ArrowRight, Sparkle, Coffee, CircleDashed,
  Check, PaperPlaneTilt, PushPin, Rows, SquaresFour, Lightning,
} from '@phosphor-icons/react';
import { useMemo, useState } from 'react';
import {
  NEEDS_TODAY, READY_FOR_CLIENT, FYI_REPORTS,
  SPECIALISTS_RUNNING,
  type NeedsReport, type ReadyReport, type FyiReport, type ReportStatus,
} from '../mock/reports';
import { PROJECTS } from '../mock/projects';

/* Reports · /reports
 *
 * Inbox rebuild 2026-05-15. Old page treated reports as a feed of cards —
 * at 50+/day that's a doomscroll. New shape is an INBOX with persona
 * switcher up top:
 *
 *   · Operator     — what I need to do today. ONE hero, then dense rows.
 *   · Leadership   — agency rollup. Throughput, blockers, $ surfaced.
 *   · Client-ready — approval queue, optimized for batch send-off.
 *
 * The hero card stays so we don't lose the "wow your AI did this" moment.
 * Everything else collapses to scannable one-line rows the eye can sweep
 * down — project chip leftmost so triage-by-client is instant.
 *
 * v5 brand: lavender canvas, italic purple period, Figtree everywhere,
 * one dark moment per page (the hero), restrained colour.
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
  pinned?: boolean;
}

export function Reports() {
  const [persona, setPersona]   = useState<Persona>('operator');
  const [density, setDensity]   = useState<Density>('compact');
  const [query, setQuery]       = useState('');
  const [projectId, setProject] = useState<string>('all');
  const [bucket, setBucket]     = useState<'all' | 'needs' | 'ready' | 'fyi'>('all');

  /* ─── Flatten + sort ────────────────────────────────────────────── */
  const all: FlatReport[] = useMemo(() => {
    const needs: FlatReport[] = NEEDS_TODAY.map((r: NeedsReport) => ({
      id: r.id, runId: r.runId, agentName: r.agentName, agentEmoji: r.agentEmoji,
      projectId: r.projectId, projectName: r.projectName,
      headline: r.headline, subline: r.secondaryMetric, finishedLabel: r.finishedLabel,
      bucket: 'needs', primaryMetric: r.primaryMetric.value, pinned: r.pinned,
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
    all:   all.length,
    needs: all.filter((r) => r.bucket === 'needs').length,
    ready: all.filter((r) => r.bucket === 'ready').length,
    fyi:   all.filter((r) => r.bucket === 'fyi').length,
  }), [all]);

  /* The hero = the most urgent unpinned-or-pinned NEED, by recency. */
  const hero: FlatReport | undefined = useMemo(() => {
    const pool = all.filter((r) => r.bucket === 'needs');
    return pool.find((r) => r.pinned) ?? pool[0];
  }, [all]);

  /* Filtered rest — hero excluded from the row list. */
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all
      .filter((r) => !hero || r.id !== hero.id)
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
      });
  }, [all, hero, query, projectId, bucket]);

  return (
    <div className="space-y-6 pb-8">
      <style>{PAGE_STYLES}</style>

      {/* ═══════════════════════════════════════════════════════════════
          1 · HEADER — tight. Headline + counts. Persona switcher right. */}
      <header className="rp-reveal flex flex-wrap items-end justify-between gap-5" style={{ animationDelay: '0ms' }}>
        <div>
          <h1 className="font-display text-[44px] font-extrabold leading-[0.96] tracking-[-0.030em] text-ppc-ink">
            Reports
            <span
              className="rp-period ml-[2px] font-serif italic font-bold leading-none text-ppc-purple-500"
              style={{ fontFamily: 'PF-Marlet-Display, "Playfair Display", Georgia, serif' }}
            >
              .
            </span>
          </h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-ppc-text-muted">
            <CountChip label="needs you" value={counts.needs} tone="critical" />
            <CountChip label="ready"     value={counts.ready} tone="warning"  />
            <CountChip label="fyi"       value={counts.fyi}   tone="neutral"  />
            <span className="text-ppc-text-faint/60">·</span>
            <span className="inline-flex items-center gap-1.5">
              <LiveDot />
              <span className="font-medium text-ppc-ink">{SPECIALISTS_RUNNING}</span>
              <span className="text-ppc-text-muted">specialists running now</span>
            </span>
          </p>
        </div>

        {/* Persona pill switcher — the "for who" decision */}
        <PersonaSwitch persona={persona} onChange={setPersona} />
      </header>

      {/* ═══════════════════════════════════════════════════════════════
          2 · PERSONA-DRIVEN BODY                                       */}
      {persona === 'leadership' ? (
        <LeadershipView all={all} />
      ) : persona === 'client' ? (
        <ClientReadyView all={all} />
      ) : (
        <>
          {/* HERO — only when nothing has been filtered out */}
          {hero && projectId === 'all' && bucket === 'all' && !query && (
            <HeroCard report={hero} />
          )}

          {/* FILTER STRIP */}
          <FilterStrip
            query={query} onQuery={setQuery}
            projectId={projectId} onProject={setProject}
            bucket={bucket} onBucket={setBucket}
            density={density} onDensity={setDensity}
            counts={counts}
          />

          {/* ROWS */}
          <InboxList rows={rows} density={density} totalShown={rows.length} totalAll={counts.all - (hero ? 1 : 0)} />
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PERSONA SWITCH — the top-right who-am-I-today control            */

function PersonaSwitch({ persona, onChange }: { persona: Persona; onChange: (p: Persona) => void }) {
  return (
    <div
      className="rp-reveal inline-flex items-center rounded-[12px] border border-[#d9d4ec] bg-white p-[3px] shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_2px_4px_rgba(15,10,30,0.02)]"
      style={{ animationDelay: '60ms' }}
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
          ? 'text-white shadow-[0_6px_18px_-10px_rgba(127,90,240,0.7)]'
          : 'text-ppc-ink hover:bg-[#F3F0FF]',
      ].join(' ')}
      style={active ? {
        background: 'linear-gradient(180deg, #8E6BF5 0%, #7F5AF0 50%, #6E47E0 100%)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.22) inset, 0 0 0 1px rgba(127,90,240,0.5), 0 10px 22px -10px rgba(127,90,240,0.6)',
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
   HERO CARD — the one earned-dark moment. The most urgent thing.   */

function HeroCard({ report }: { report: FlatReport }) {
  return (
    <Link
      to={`/reports/${report.runId}`}
      className="rp-reveal group relative block overflow-hidden rounded-[18px] transition-transform hover:-translate-y-[1px]"
      style={{
        animationDelay: '120ms',
        background: 'radial-gradient(125% 90% at 18% 0%, #1B1138 0%, #0F0A1E 55%, #0A0617 100%)',
      }}
    >
      {/* Top-right bloom — breathes */}
      <div
        aria-hidden
        className="rp-bloom pointer-events-none absolute -right-32 -top-44 h-[440px] w-[440px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(127,90,240,0.42) 0%, rgba(127,90,240,0.08) 40%, transparent 70%)' }}
      />
      {/* Bottom-left dim */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 -bottom-44 h-[380px] w-[380px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(127,90,240,0.12) 0%, transparent 65%)' }}
      />
      {/* Sheen + grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-12 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(127,90,240,0.6) 45%, rgba(199,176,255,0.95) 50%, rgba(127,90,240,0.6) 55%, transparent 100%)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.45]"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.022) 1px, transparent 1px)',
          backgroundSize: '3px 3px',
          mixBlendMode: 'overlay',
        }}
      />

      <div className="relative grid gap-7 px-8 py-7 md:grid-cols-[1.4fr_1fr] md:px-10 md:py-8">
        {/* Left — the verdict */}
        <div>
          <div className="flex items-center gap-2">
            <Sparkle size={13} weight="fill" className="text-ppc-purple-300" />
            <span
              className="text-[10.5px] font-semibold uppercase text-white/65"
              style={{ fontFamily: '"Courier New", ui-monospace, monospace', letterSpacing: '0.18em' }}
            >
              Most urgent today
            </span>
            <span className="text-white/30">·</span>
            <span className="inline-flex items-center gap-1.5 text-[11.5px] text-white/65">
              <span className="text-base leading-none">{report.agentEmoji}</span>
              <span className="font-medium text-white/85">{report.agentName}</span>
              <span className="text-white/30">·</span>
              <span>{report.projectName}</span>
            </span>
          </div>

          <h2 className="mt-3 font-display text-[28px] font-extrabold leading-[1.05] tracking-[-0.022em] text-white md:text-[32px]">
            {report.headline}
            <span
              className="rp-period ml-[2px] font-serif italic font-bold leading-none text-ppc-purple-300"
              style={{ fontFamily: 'PF-Marlet-Display, "Playfair Display", Georgia, serif' }}
            >
              .
            </span>
          </h2>
          <p className="mt-2.5 max-w-[52ch] text-[13px] leading-relaxed text-white/65">
            {report.subline}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span
              className="inline-flex items-center gap-2 rounded-[11px] px-[16px] py-[10px] text-[13px] font-semibold text-white shadow-[0_12px_28px_-12px_rgba(127,90,240,0.8)] ring-1 ring-inset ring-white/20"
              style={{ background: 'linear-gradient(135deg, #A88CFF 0%, #7F5AF0 55%, #6843D9 100%)' }}
            >
              Open report
              <ArrowRight size={12} weight="bold" className="transition-transform duration-300 group-hover:translate-x-[3px]" />
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11.5px] text-white/55">
              <Coffee size={12} weight="duotone" />
              Finished {report.finishedLabel.toLowerCase()}
            </span>
          </div>
        </div>

        {/* Right — the dollar payoff */}
        <div className="relative md:border-l md:border-white/[0.07] md:pl-10">
          <div
            className="text-[10.5px] font-semibold uppercase text-white/55"
            style={{ fontFamily: '"Courier New", ui-monospace, monospace', letterSpacing: '0.18em' }}
          >
            Upside if applied
          </div>
          <div className="mt-2 tabular-nums font-display text-[44px] font-extrabold leading-none tracking-[-0.030em] text-white">
            {report.primaryMetric}
          </div>
          <div className="mt-2 text-[12px] text-white/55">
            Per month · across this account
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   FILTER STRIP — search · project chip · bucket pills · density     */

interface FilterStripProps {
  query: string; onQuery: (q: string) => void;
  projectId: string; onProject: (id: string) => void;
  bucket: 'all' | 'needs' | 'ready' | 'fyi'; onBucket: (b: 'all' | 'needs' | 'ready' | 'fyi') => void;
  density: Density; onDensity: (d: Density) => void;
  counts: { all: number; needs: number; ready: number; fyi: number };
}

function FilterStrip({
  query, onQuery, projectId, onProject, bucket, onBucket, density, onDensity, counts,
}: FilterStripProps) {
  return (
    <section className="rp-reveal space-y-2.5" style={{ animationDelay: '180ms' }}>
      {/* Search */}
      <div className="relative">
        <MagnifyingGlass size={14} weight="bold" className="absolute left-4 top-1/2 -translate-y-1/2 text-ppc-text-faint" />
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search by headline, client, or specialist…"
          className="w-full rounded-[12px] border border-[#d9d4ec] bg-white py-[11px] pl-11 pr-4 text-[13.5px] tracking-tight text-ppc-ink outline-none transition-all placeholder:text-ppc-text-faint hover:border-ppc-purple-300/55 focus:border-ppc-purple-500/55 focus:shadow-[0_0_0_4px_rgba(127,90,240,0.10)]"
        />
        <kbd
          className="pointer-events-none absolute right-4 top-1/2 hidden h-[20px] -translate-y-1/2 items-center rounded-[5px] border border-[#d9d4ec] bg-[#FBFAFE] px-[6px] text-[10.5px] font-medium text-ppc-text-faint sm:inline-flex"
          style={{ fontFamily: '"Courier New", ui-monospace, monospace' }}
        >⌘K</kbd>
      </div>

      {/* Pill row */}
      <div className="flex flex-wrap items-center gap-2">
        <BucketChip active={bucket === 'all'}   onClick={() => onBucket('all')}   label="All"        count={counts.all}   />
        <BucketChip active={bucket === 'needs'} onClick={() => onBucket('needs')} label="Needs you"  count={counts.needs} dot="#E24B4A" />
        <BucketChip active={bucket === 'ready'} onClick={() => onBucket('ready')} label="Ready"      count={counts.ready} dot="#D49021" />
        <BucketChip active={bucket === 'fyi'}   onClick={() => onBucket('fyi')}   label="FYI"        count={counts.fyi}   dot="#7F5AF0" />
        <span className="mx-1.5 hidden h-5 w-px bg-[#d9d4ec] md:inline-block" />
        <ProjectPicker value={projectId} onChange={onProject} />
        <PassiveChip label="All specialists" />
        <PassiveChip label="Last 30 days" />
        <div className="ml-auto" />
        <DensityToggle density={density} onChange={onDensity} />
      </div>
    </section>
  );
}

function BucketChip({
  active, onClick, label, count, dot,
}: { active: boolean; onClick: () => void; label: string; count: number; dot?: string }) {
  return (
    <button
      onClick={onClick}
      className={[
        'inline-flex items-center gap-2 rounded-[10px] px-3 py-[7px] text-[12.5px] font-semibold tracking-tight transition-all duration-200',
        active
          ? 'bg-ppc-ink text-white shadow-[0_6px_16px_-10px_rgba(15,10,30,0.55)]'
          : 'border border-[#d9d4ec] bg-white text-ppc-ink hover:-translate-y-[1px] hover:border-ppc-purple-300/55 hover:bg-[#FBFAFF]',
      ].join(' ')}
    >
      {dot && <span className="h-[6px] w-[6px] shrink-0 rounded-full" style={{ background: dot, boxShadow: `0 0 0 2px ${dot}22` }} />}
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

function ProjectPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const current = PROJECTS.find((p) => p.id === value);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-[10px] border border-[#d9d4ec] bg-white px-3 py-[7px] text-[12.5px] font-medium tracking-tight text-ppc-ink transition-all hover:-translate-y-px hover:border-ppc-purple-300/55"
      >
        <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ppc-text-faint">Project</span>
        <span className="font-semibold">{current ? current.name : 'All'}</span>
        <CaretDown size={11} weight="bold" className={`text-ppc-text-faint transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div
          className="absolute left-0 top-full z-20 mt-2 w-[240px] overflow-hidden rounded-[10px] border border-[#d9d4ec] bg-white py-1"
          style={{ boxShadow: '0 12px 30px -12px rgba(15,10,30,0.18), 0 2px 6px rgba(15,10,30,0.06)' }}
        >
          <button
            onClick={() => { onChange('all'); setOpen(false); }}
            className={`flex w-full items-center justify-between px-3 py-[7px] text-left text-[12.5px] font-medium hover:bg-[#F3F0FF] ${value === 'all' ? 'text-ppc-purple-700' : 'text-ppc-ink'}`}
          >
            All projects
            {value === 'all' && <Check size={12} weight="bold" className="text-ppc-purple-500" />}
          </button>
          <div className="my-1 h-px bg-[#ECEAFA]" />
          {PROJECTS.map((p) => (
            <button
              key={p.id}
              onClick={() => { onChange(p.id); setOpen(false); }}
              className={`flex w-full items-center justify-between px-3 py-[7px] text-left text-[12.5px] font-medium hover:bg-[#F3F0FF] ${value === p.id ? 'text-ppc-purple-700' : 'text-ppc-ink'}`}
            >
              {p.name}
              {value === p.id && <Check size={12} weight="bold" className="text-ppc-purple-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PassiveChip({ label }: { label: string }) {
  return (
    <button className="inline-flex items-center gap-1.5 rounded-[10px] border border-[#d9d4ec] bg-white px-3 py-[7px] text-[12.5px] font-medium tracking-tight text-ppc-ink transition-all hover:-translate-y-px hover:border-ppc-purple-300/55 hover:bg-[#FBFAFF]">
      {label}
      <CaretDown size={11} weight="bold" className="text-ppc-text-faint" />
    </button>
  );
}

function DensityToggle({ density, onChange }: { density: Density; onChange: (d: Density) => void }) {
  return (
    <div className="inline-flex items-center rounded-[9px] border border-[#d9d4ec] bg-white p-[2px]">
      <button
        onClick={() => onChange('compact')}
        title="Compact rows"
        className={`grid h-[26px] w-[28px] place-items-center rounded-[7px] transition-colors ${density === 'compact' ? 'bg-ppc-ink text-white' : 'text-ppc-text-faint hover:text-ppc-ink'}`}
      >
        <Rows size={12} weight="bold" />
      </button>
      <button
        onClick={() => onChange('comfortable')}
        title="Comfortable cards"
        className={`grid h-[26px] w-[28px] place-items-center rounded-[7px] transition-colors ${density === 'comfortable' ? 'bg-ppc-ink text-white' : 'text-ppc-text-faint hover:text-ppc-ink'}`}
      >
        <SquaresFour size={12} weight="bold" />
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   INBOX LIST — dense rows that scale to 500/day                    */

function InboxList({
  rows, density, totalShown, totalAll,
}: { rows: FlatReport[]; density: Density; totalShown: number; totalAll: number }) {
  return (
    <section
      className="rp-reveal overflow-hidden rounded-[14px] bg-white"
      style={{
        animationDelay: '240ms',
        border: '0.5px solid #d9d4ec',
        boxShadow: '0 1px 0 rgba(255,255,255,0.6) inset, 0 1px 2px rgba(15,10,30,0.02)',
      }}
    >
      {/* Sub-eyebrow */}
      <div className="flex items-center justify-between border-b border-[#ECEAFA] px-5 py-2.5">
        <span
          className="text-[10.5px] font-semibold uppercase text-ppc-text-faint"
          style={{ fontFamily: '"Courier New", ui-monospace, monospace', letterSpacing: '0.16em' }}
        >
          Inbox <span className="mx-1 text-ppc-text-faint/55">·</span>
          <span className="tabular-nums font-bold text-ppc-ink">{totalShown}</span> of <span className="tabular-nums">{totalAll}</span>
        </span>
        <span
          className="text-[10.5px] font-semibold uppercase text-ppc-text-faint"
          style={{ fontFamily: '"Courier New", ui-monospace, monospace', letterSpacing: '0.16em' }}
        >
          ↑/↓ to navigate · Enter to open
        </span>
      </div>

      {/* Rows */}
      <ul className="divide-y divide-[#ECEAFA]">
        {rows.map((r, i) => (
          density === 'compact'
            ? <CompactRow key={r.id} report={r} index={i} />
            : <ComfortableRow key={r.id} report={r} index={i} />
        ))}
        {rows.length === 0 && (
          <li className="px-6 py-14 text-center text-[13px] text-ppc-text-muted">
            Nothing matches your filters.
          </li>
        )}
      </ul>
    </section>
  );
}

function CompactRow({ report, index }: { report: FlatReport; index: number }) {
  return (
    <li
      className="rp-row rp-row-reveal group"
      style={{ animationDelay: `${300 + index * 26}ms` }}
    >
      <Link
        to={`/reports/${report.runId}`}
        className="grid grid-cols-[170px_1fr_140px_100px_28px] items-center gap-3 px-5 py-[11px]"
      >
        {/* Project chip */}
        <ProjectTag id={report.projectId} name={report.projectName} />

        {/* Headline + subline */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 truncate">
            <span className="text-[14px] leading-none">{report.agentEmoji}</span>
            <span className="truncate text-[13.5px] font-semibold tracking-[-0.005em] text-ppc-ink group-hover:text-ppc-purple-700">
              {report.headline}
            </span>
            {report.pinned && <PushPin size={11} weight="fill" className="shrink-0 text-ppc-purple-400" />}
          </div>
          <div className="mt-[2px] truncate text-[11.5px] text-ppc-text-muted">
            {report.agentName} <span className="text-ppc-text-faint/60">·</span> {report.subline}
          </div>
        </div>

        {/* Status / bucket pill */}
        <BucketPill bucket={report.bucket} status={report.status} />

        {/* Time */}
        <div className="text-right">
          <span className="text-[11.5px] tabular-nums text-ppc-text-muted">{report.finishedLabel}</span>
        </div>

        {/* Chevron */}
        <ArrowRight size={12} weight="bold" className="justify-self-end text-ppc-text-faint transition-transform duration-200 group-hover:translate-x-[2px] group-hover:text-ppc-purple-500" />
      </Link>
    </li>
  );
}

function ComfortableRow({ report, index }: { report: FlatReport; index: number }) {
  return (
    <li
      className="rp-row rp-row-reveal group"
      style={{ animationDelay: `${300 + index * 26}ms` }}
    >
      <Link to={`/reports/${report.runId}`} className="block px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <ProjectTag id={report.projectId} name={report.projectName} />
          <div className="flex items-center gap-3">
            <BucketPill bucket={report.bucket} status={report.status} />
            <span className="text-[11.5px] tabular-nums text-ppc-text-muted">{report.finishedLabel}</span>
          </div>
        </div>
        <div className="mt-2.5 flex items-center gap-2.5">
          <span className="text-base leading-none">{report.agentEmoji}</span>
          <span className="text-[14.5px] font-semibold tracking-[-0.008em] text-ppc-ink group-hover:text-ppc-purple-700">
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
    <span className="inline-flex items-center gap-2 truncate">
      <span
        className="grid h-[22px] w-[22px] shrink-0 place-items-center rounded-[6px] text-[10.5px] font-bold leading-none"
        style={{ background: chip.bg, color: chip.fg, boxShadow: `inset 0 0 0 1px ${chip.ring}` }}
      >
        {name.charAt(0)}
      </span>
      <span className="truncate text-[12.5px] font-medium tracking-[-0.005em] text-ppc-ink">{name}</span>
    </span>
  );
}

function projectChip(id: string): { bg: string; fg: string; ring: string } {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const hue = h % 360;
  return {
    bg:   `linear-gradient(155deg, hsl(${hue}, 65%, 92%) 0%, hsl(${hue}, 50%, 86%) 100%)`,
    fg:   `hsl(${hue}, 55%, 28%)`,
    ring: `hsla(${hue}, 50%, 55%, 0.25)`,
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
      'sent':         { bg: '#E5E6EE', fg: '#5C5773', dot: '#8a8398', label: 'Sent'         },
    };
    const s = map[status ?? 'draft-ready'];
    return <Pill bg={s.bg} fg={s.fg} dot={s.dot}>{s.label}</Pill>;
  }
  return <Pill bg="#F3F0FF" fg="#534AB7" dot="#7F5AF0">FYI</Pill>;
}

function Pill({ bg, fg, dot, children }: { bg: string; fg: string; dot: string; children: React.ReactNode }) {
  return (
    <span
      className="tabular-nums inline-flex items-center gap-1.5 rounded-[6px] px-[8px] py-[3px] text-[11px] font-bold tracking-tight"
      style={{ background: bg, color: fg }}
    >
      <span className="h-[5px] w-[5px] rounded-full" style={{ background: dot }} />
      {children}
    </span>
  );
}

function CountChip({ value, label, tone }: { value: number; label: string; tone: 'critical' | 'warning' | 'neutral' }) {
  const t = tone === 'critical'
    ? { fg: '#9F2624', dot: '#E24B4A' }
    : tone === 'warning'
    ? { fg: '#82500A', dot: '#D49021' }
    : { fg: '#534AB7', dot: '#7F5AF0' };
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-[6px] w-[6px] rounded-full" style={{ background: t.dot, boxShadow: `0 0 0 2px ${t.dot}22` }} />
      <span className="tabular-nums font-semibold" style={{ color: t.fg }}>{value}</span>
      <span className="text-ppc-text-muted">{label}</span>
    </span>
  );
}

function LiveDot() {
  return (
    <span className="relative inline-flex h-[7px] w-[7px]">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3FB58C] opacity-60" />
      <span className="relative inline-flex h-[7px] w-[7px] rounded-full bg-[#3FB58C]" />
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   LEADERSHIP VIEW — agency rollup. Throughput, blockers, $ surfaced. */

function LeadershipView({ all }: { all: FlatReport[] }) {
  const byProject = useMemo(() => {
    const map: Record<string, { name: string; total: number; needs: number; ready: number }> = {};
    for (const r of all) {
      if (!map[r.projectId]) map[r.projectId] = { name: r.projectName, total: 0, needs: 0, ready: 0 };
      map[r.projectId].total += 1;
      if (r.bucket === 'needs') map[r.projectId].needs += 1;
      if (r.bucket === 'ready') map[r.projectId].ready += 1;
    }
    return Object.entries(map).map(([id, v]) => ({ id, ...v })).sort((a, b) => b.total - a.total);
  }, [all]);

  const maxTotal = Math.max(...byProject.map((p) => p.total), 1);
  const recoverable = 19_400; // $ value all needs-you reports surface this week (mock)
  const shippedThisWeek = 12;
  const blockedCount    = all.filter((r) => r.status === 'needs-review').length;

  return (
    <div className="rp-reveal space-y-5" style={{ animationDelay: '100ms' }}>
      {/* Top stat strip */}
      <section className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        <LeadershipStat eyebrow="Reports this week"   value={`${shippedThisWeek}`}                accent="#7F5AF0" hint="↑ 32% vs last week" hintTone="good" />
        <LeadershipStat eyebrow="Revenue surfaced"    value={`$${recoverable.toLocaleString()}`}  accent="#3FB58C" hint="across 8 accounts" />
        <LeadershipStat eyebrow="Blocked on you"      value={`${blockedCount}`}                   accent="#D49021" hint="needs review · 2d avg age" hintTone="warn" />
        <LeadershipStat eyebrow="Specialists running" value={`${SPECIALISTS_RUNNING}`}            accent="#7F5AF0" hint="2 audits · 1 negative kw" />
      </section>

      {/* Project heat-map */}
      <section
        className="overflow-hidden rounded-[14px] bg-white"
        style={{ border: '0.5px solid #d9d4ec', boxShadow: '0 1px 0 rgba(255,255,255,0.6) inset' }}
      >
        <div className="flex items-center justify-between border-b border-[#ECEAFA] px-5 py-2.5">
          <span
            className="text-[10.5px] font-semibold uppercase text-ppc-text-faint"
            style={{ fontFamily: '"Courier New", ui-monospace, monospace', letterSpacing: '0.16em' }}
          >
            Report volume by client · last 30 days
          </span>
          <span className="text-[10.5px] font-semibold uppercase text-ppc-text-faint" style={{ fontFamily: '"Courier New", ui-monospace, monospace', letterSpacing: '0.16em' }}>
            heat = attention demand
          </span>
        </div>
        <ul className="divide-y divide-[#ECEAFA]">
          {byProject.map((p) => (
            <li key={p.id} className="grid grid-cols-[1fr_220px_100px] items-center gap-4 px-5 py-3">
              <ProjectTag id={p.id} name={p.name} />
              <div className="relative h-[8px] overflow-hidden rounded-full bg-[#F3F0FF]">
                <div
                  className="absolute inset-y-0 left-0"
                  style={{
                    width: `${(p.total / maxTotal) * 100}%`,
                    background: 'linear-gradient(90deg, #534AB7 0%, #7F5AF0 60%, #A88CFF 100%)',
                  }}
                />
              </div>
              <div className="text-right text-[12px] text-ppc-text-muted">
                <span className="tabular-nums font-semibold text-ppc-ink">{p.total}</span> reports
                {p.needs > 0 && <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-medium text-[#9F2624]">
                  <span className="h-[5px] w-[5px] rounded-full bg-[#E24B4A]" /> {p.needs}
                </span>}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="rounded-[12px] border border-dashed border-[#d9d4ec] bg-[#FBFAFE] px-5 py-4 text-[12.5px] text-ppc-text-muted">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ppc-text-faint">Coming next</span>{' '}
        — specialist hit-rate over time · per-client SLA · time-to-approval trend · weekly digest export.
      </div>
    </div>
  );
}

function LeadershipStat({
  eyebrow, value, accent, hint, hintTone,
}: { eyebrow: string; value: string; accent: string; hint?: string; hintTone?: 'good' | 'warn' }) {
  const hintColor = hintTone === 'good' ? '#1F8458' : hintTone === 'warn' ? '#82500A' : '#6b6480';
  return (
    <div
      className="rp-stat group relative overflow-hidden rounded-[14px] bg-white p-5"
      style={{ border: '0.5px solid #d9d4ec' }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-60 transition-opacity group-hover:opacity-100"
        style={{ background: `radial-gradient(circle, ${accent}26 0%, transparent 70%)` }}
      />
      <div
        className="relative text-[10.5px] font-semibold uppercase text-ppc-text-faint"
        style={{ fontFamily: '"Courier New", ui-monospace, monospace', letterSpacing: '0.16em' }}
      >
        {eyebrow}
      </div>
      <div className="relative mt-2.5 tabular-nums font-display text-[30px] font-extrabold leading-none tracking-[-0.024em] text-ppc-ink">
        {value}
      </div>
      {hint && (
        <div className="relative mt-2 text-[11.5px] font-medium" style={{ color: hintColor }}>
          {hint}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CLIENT-READY VIEW — approval queue, batch send-off                */

function ClientReadyView({ all }: { all: FlatReport[] }) {
  const queue = all.filter((r) => r.bucket === 'ready');
  const draftReady = queue.filter((r) => r.status === 'draft-ready' || r.status === 'approved');

  return (
    <div className="rp-reveal space-y-4" style={{ animationDelay: '100ms' }}>
      {/* Queue header */}
      <section
        className="overflow-hidden rounded-[14px] bg-white"
        style={{ border: '0.5px solid #d9d4ec', boxShadow: '0 1px 0 rgba(255,255,255,0.6) inset' }}
      >
        <div className="flex items-center justify-between border-b border-[#ECEAFA] px-5 py-3">
          <div>
            <div
              className="text-[10.5px] font-semibold uppercase text-ppc-text-faint"
              style={{ fontFamily: '"Courier New", ui-monospace, monospace', letterSpacing: '0.16em' }}
            >
              Approval queue
            </div>
            <div className="mt-[3px] text-[13.5px] font-semibold tracking-[-0.005em] text-ppc-ink">
              <span className="tabular-nums">{queue.length}</span> reports awaiting your sign-off
            </div>
          </div>
          <button
            className="inline-flex items-center gap-2 rounded-[10px] px-4 py-[8px] text-[12.5px] font-semibold text-white shadow-[0_8px_20px_-10px_rgba(127,90,240,0.65)] ring-1 ring-inset ring-white/15 transition-all hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #8C6CFF 0%, #7F5AF0 55%, #6843D9 100%)' }}
            disabled={draftReady.length === 0}
          >
            <PaperPlaneTilt size={12} weight="bold" />
            Send all approved <span className="tabular-nums opacity-75">({draftReady.length})</span>
          </button>
        </div>

        <ul className="divide-y divide-[#ECEAFA]">
          {queue.map((r, i) => (
            <li key={r.id} className="rp-row rp-row-reveal group" style={{ animationDelay: `${180 + i * 26}ms` }}>
              <div className="flex items-center gap-3 px-5 py-3">
                <input type="checkbox" defaultChecked={r.status === 'draft-ready' || r.status === 'approved'} className="h-[15px] w-[15px] shrink-0 accent-ppc-purple-500" />
                <Link to={`/reports/${r.runId}`} className="grid min-w-0 flex-1 grid-cols-[180px_1fr_140px_90px] items-center gap-3">
                  <ProjectTag id={r.projectId} name={r.projectName} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-[14px] leading-none">{r.agentEmoji}</span>
                      <span className="truncate text-[13.5px] font-semibold tracking-[-0.005em] text-ppc-ink group-hover:text-ppc-purple-700">
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
            <li className="px-6 py-14 text-center text-[13px] text-ppc-text-muted">
              No reports awaiting approval. <CircleDashed size={13} weight="bold" className="ml-1 inline align-text-bottom text-ppc-text-faint" />
            </li>
          )}
        </ul>
      </section>

      <div className="rounded-[12px] border border-dashed border-[#d9d4ec] bg-[#FBFAFE] px-5 py-4 text-[12.5px] text-ppc-text-muted">
        <Lightning size={13} weight="duotone" className="mr-1 inline align-text-bottom text-ppc-purple-500" />
        Pro tip — pin to a client's email-on-Friday schedule so Approved reports auto-send.
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PAGE STYLES                                                        */

const PAGE_STYLES = `
  @keyframes rp-reveal {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .rp-reveal { opacity: 0; animation: rp-reveal 0.6s cubic-bezier(0.22, 0.9, 0.32, 1) forwards; }

  @keyframes rp-row-reveal {
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .rp-row-reveal { opacity: 0; animation: rp-row-reveal 0.4s cubic-bezier(0.22, 0.9, 0.32, 1) forwards; }

  .rp-row { transition: background-color 0.18s ease; }
  .rp-row:hover {
    background: linear-gradient(90deg, rgba(127,90,240,0.05) 0%, rgba(127,90,240,0.012) 60%, transparent 100%);
  }

  @keyframes rp-period-pulse {
    0%, 100% { text-shadow: 0 0 0 rgba(127,90,240,0); }
    50%      { text-shadow: 0 0 14px rgba(127,90,240,0.6); }
  }
  .rp-period { display: inline-block; animation: rp-period-pulse 3.6s ease-in-out infinite; }

  @keyframes rp-bloom-breathe {
    0%, 100% { opacity: 0.95; transform: scale(1); }
    50%      { opacity: 1;    transform: scale(1.06); }
  }
  .rp-bloom { animation: rp-bloom-breathe 7s ease-in-out infinite; }

  .rp-stat { transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease; }
  .rp-stat:hover { transform: translateY(-1px); border-color: rgba(127, 90, 240, 0.35); box-shadow: 0 12px 28px -16px rgba(127, 90, 240, 0.30); }
`;
