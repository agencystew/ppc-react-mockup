import { Link } from 'react-router-dom';
import {
  ArrowRight, Plus, MagnifyingGlass, CaretDown, ArrowDown,
} from '@phosphor-icons/react';
import { useMemo, useState } from 'react';
import { PROJECTS } from '../mock/projects';

/* Projects list · /projects
 *
 * The agency roster surface. Pure dark "ink" canvas matching the source
 * mockup: atmospheric radial glow top-right, hairline rule grid, tabular
 * numbers, staggered row reveals. One signature moment per screen —
 * here, the soft purple bloom and the spotlit critical row.
 *
 * Status communicates via:
 *   · 7px status dot (critical row gets a halo pulse)
 *   · Tonal letter avatar (Linear-style chip)
 *   · Spend mini-bar (purple gradient, glowing) under the spend number
 *   · Sparkline (stroke + 18%-opacity fill area)
 */

type Tone = 'critical' | 'warning' | 'clear';

interface ProjectMetrics {
  spend: number;
  conv: number;
  cpa: number;
  findings: number;
  tone: Tone;
  spark: number[];          // y-values, 0-22 range (lower y = higher on screen)
  trend: 'up' | 'down' | 'flat';
  avatarBg: string;
  avatarFg: string;
}

const METRICS: Record<string, ProjectMetrics> = {
  'boulder-care':       { spend: 83_280, conv: 1068, cpa: 77.95,  findings: 4, tone: 'critical', trend: 'up',   spark: [17,14,15,11,13,9,10,6,8],   avatarBg: '#22C55E', avatarFg: '#052E16' },
  'the-hoth':           { spend: 12_783, conv: 16,   cpa: 798.95, findings: 1, tone: 'critical', trend: 'down', spark: [6,9,7,11,9,13,11,15,14],    avatarBg: '#EF4444', avatarFg: '#450A0A' },
  'durable':            { spend: 20_373, conv: 1217, cpa: 16.74,  findings: 2, tone: 'warning',  trend: 'up',   spark: [12,9,13,7,11,8,6,10,5],     avatarBg: '#14B8A6', avatarFg: '#042F2C' },
  'linkbuilder':        { spend: 1_256,  conv: 7,    cpa: 179.51, findings: 2, tone: 'warning',  trend: 'flat', spark: [10,8,12,7,13,8,11,7,12],    avatarBg: '#65D6A1', avatarFg: '#053723' },
  'livingyoung':        { spend: 8_414,  conv: 28,   cpa: 296.95, findings: 1, tone: 'warning',  trend: 'up',   spark: [13,11,14,9,12,7,10,5,8],    avatarBg: '#3B82F6', avatarFg: '#0B1F4F' },
  'authority-builders': { spend: 6_846,  conv: 43,   cpa: 159.20, findings: 0, tone: 'clear',    trend: 'up',   spark: [14,11,13,9,11,7,9,5,7],     avatarBg: '#5B7CF8', avatarFg: '#0E1A4D' },
  'edwin-novel':        { spend: 6_949,  conv: 18,   cpa: 395.65, findings: 0, tone: 'clear',    trend: 'flat', spark: [11,9,12,10,9,12,10,8,11],   avatarBg: '#D946A8', avatarFg: '#3F0D2E' },
  'flock':              { spend: 517,    conv: 17,   cpa: 30.39,  findings: 0, tone: 'clear',    trend: 'up',   spark: [12,10,13,9,11,8,10,7,9],    avatarBg: '#C08A2E', avatarFg: '#3A2406' },
};

const TONE_COLOR: Record<Tone, { dot: string; glow: string; ring: string }> = {
  critical: { dot: '#EF4444', glow: 'rgba(239,68,68,0.32)', ring: 'rgba(239,68,68,0.18)' },
  warning:  { dot: '#FBBF24', glow: 'rgba(251,191,36,0.28)', ring: 'rgba(251,191,36,0.16)' },
  clear:    { dot: '#22C55E', glow: 'rgba(34,197,94,0.26)',  ring: 'rgba(34,197,94,0.14)'  },
};

type TabId = 'attention' | 'clear' | 'all';

export function Projects() {
  const [filter, setFilter] = useState('');
  const [tab, setTab] = useState<TabId>('all');

  // ─── KPI rollups ──────────────────────────────────────────────────────
  const totals = useMemo(() => {
    const spend = PROJECTS.reduce((a, p) => a + (METRICS[p.id]?.spend ?? 0), 0);
    const conv  = PROJECTS.reduce((a, p) => a + (METRICS[p.id]?.conv  ?? 0), 0);
    const findings = PROJECTS.reduce((a, p) => a + (METRICS[p.id]?.findings ?? 0), 0);
    const critFindings = PROJECTS
      .filter((p) => METRICS[p.id]?.tone === 'critical')
      .reduce((a, p) => a + (METRICS[p.id]?.findings ?? 0), 0);
    const warnFindings = PROJECTS
      .filter((p) => METRICS[p.id]?.tone === 'warning')
      .reduce((a, p) => a + (METRICS[p.id]?.findings ?? 0), 0);
    const stateCounts = PROJECTS.reduce(
      (acc, p) => {
        const k = METRICS[p.id]?.tone ?? 'clear';
        acc[k] = (acc[k] ?? 0) + 1;
        return acc;
      },
      { critical: 0, warning: 0, clear: 0 } as Record<Tone, number>,
    );
    return { spend, conv, findings, critFindings, warnFindings, stateCounts };
  }, []);

  const attentionCount = totals.stateCounts.critical + totals.stateCounts.warning;
  const clearCount = totals.stateCounts.clear;

  // ─── Filter + sort ────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return PROJECTS
      .filter((p) => {
        if (tab === 'attention') return METRICS[p.id]?.tone !== 'clear';
        if (tab === 'clear')     return METRICS[p.id]?.tone === 'clear';
        return true;
      })
      .filter((p) => {
        if (!q) return true;
        return (
          p.name.toLowerCase().includes(q) ||
          (p.industry ?? '').toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const order: Record<Tone, number> = { critical: 0, warning: 1, clear: 2 };
        const da = order[METRICS[a.id]?.tone ?? 'clear'];
        const db = order[METRICS[b.id]?.tone ?? 'clear'];
        if (da !== db) return da - db;
        return (METRICS[b.id]?.spend ?? 0) - (METRICS[a.id]?.spend ?? 0);
      });
  }, [filter, tab]);

  const maxSpend = useMemo(
    () => Math.max(...PROJECTS.map((p) => METRICS[p.id]?.spend ?? 0)),
    [],
  );

  return (
    <div className="-mx-8 -my-10 lg:-mx-12 lg:-my-12">
      {/* Inject CSS once for the page (animations + pulse keyframes). */}
      <style>{PAGE_STYLES}</style>

      <div className="projects-shell relative overflow-hidden">
        {/* Atmospheric radial bloom — top-right, soft purple. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 -top-56 h-[520px] w-[520px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(127,90,240,0.18) 0%, rgba(127,90,240,0.04) 38%, transparent 70%)',
          }}
        />
        {/* Companion bloom bottom-left, dimmer, for vertical weight. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-40 bottom-[-260px] h-[440px] w-[440px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(127,90,240,0.10) 0%, transparent 65%)',
          }}
        />

        <div className="relative px-10 pt-10 pb-12 lg:px-14 lg:pt-12 lg:pb-14">
          {/* ─── Header ─────────────────────────────────────────────── */}
          <header className="flex items-end justify-between gap-6 reveal" style={{ animationDelay: '0ms' }}>
            <div>
              <h1 className="text-white text-[34px] font-medium leading-[1.05] tracking-[-0.028em]">
                Projects
              </h1>
              <p className="mt-2 text-[12.5px] text-[#7a7a86]">
                {PROJECTS.length} active accounts <Sep /> Last 30 days
              </p>
            </div>
            <button
              className="group inline-flex items-center gap-2 rounded-[10px] px-4 py-[10px] text-[13px] font-medium text-white shadow-[0_8px_24px_-8px_rgba(127,90,240,0.55)] ring-1 ring-inset ring-white/10 transition-all hover:-translate-y-[1px] hover:shadow-[0_12px_32px_-8px_rgba(127,90,240,0.75)]"
              style={{
                background: 'linear-gradient(135deg, #8E78FF 0%, #7c6dff 55%, #6852E8 100%)',
              }}
            >
              <Plus size={14} weight="bold" className="transition-transform group-hover:rotate-90" />
              New project
            </button>
          </header>

          {/* ─── KPI strip ──────────────────────────────────────────── */}
          <section
            className="mt-9 border-y border-[#1a1a22] reveal"
            style={{ animationDelay: '60ms' }}
          >
            <div
              className="grid gap-x-10 py-7"
              style={{ gridTemplateColumns: '1.45fr 1fr 1.05fr 1.1fr' }}
            >
              {/* Total spend */}
              <div>
                <Eyebrow>Total spend</Eyebrow>
                <div className="mt-3 flex items-baseline gap-2.5">
                  <div className="tabular-nums text-[34px] font-medium leading-none tracking-[-0.025em] text-white">
                    ${totals.spend.toLocaleString()}
                  </div>
                  <Pill tone="down">
                    <ArrowDown size={10} weight="bold" />
                    8.2%
                  </Pill>
                </div>
                <Sparkline
                  points={[16, 13, 15, 11, 13, 10, 12, 8, 11, 7, 10, 6, 8]}
                  w={240} h={32} accent="#9c8aff" fill
                  className="mt-4"
                />
              </div>

              {/* Conversions */}
              <div>
                <Eyebrow>Conversions</Eyebrow>
                <div className="tabular-nums mt-3 text-[28px] font-medium leading-none tracking-[-0.018em] text-white">
                  {totals.conv.toLocaleString()}
                </div>
                <div className="mt-4 text-[11px] text-[#7a7a86]">
                  across {PROJECTS.length} accounts
                </div>
              </div>

              {/* Open findings */}
              <div>
                <Eyebrow>Open findings</Eyebrow>
                <div className="tabular-nums mt-3 text-[28px] font-medium leading-none tracking-[-0.018em] text-white">
                  {totals.findings}
                </div>
                <div className="mt-4 flex items-center gap-3 text-[11px] text-[#9a929e]">
                  <span className="inline-flex items-center gap-1.5">
                    <Dot color="#EF4444" />
                    <span className="tabular-nums text-[#fca5a5]">{totals.critFindings}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Dot color="#FBBF24" />
                    <span className="tabular-nums text-[#fde68a]">{totals.warnFindings}</span>
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#5a5a66]">
                    crit · warn
                  </span>
                </div>
              </div>

              {/* Account state */}
              <div>
                <Eyebrow>Account state</Eyebrow>
                <div className="mt-3 flex items-end gap-1" style={{ height: 32 }}>
                  <Bar count={totals.stateCounts.critical} max={Math.max(totals.stateCounts.critical, totals.stateCounts.warning, totals.stateCounts.clear)} color="#EF4444" />
                  <Bar count={totals.stateCounts.warning}  max={Math.max(totals.stateCounts.critical, totals.stateCounts.warning, totals.stateCounts.clear)} color="#FBBF24" />
                  <Bar count={totals.stateCounts.clear}    max={Math.max(totals.stateCounts.critical, totals.stateCounts.warning, totals.stateCounts.clear)} color="#22C55E" />
                </div>
                <div className="mt-3 text-[11px] text-[#9a929e]">
                  <span className="tabular-nums font-medium text-white">{totals.stateCounts.critical}</span> critical
                  <span className="mx-1.5 text-[#3e3e48]">·</span>
                  <span className="tabular-nums font-medium text-white">{totals.stateCounts.warning}</span> warn
                  <span className="mx-1.5 text-[#3e3e48]">·</span>
                  <span className="tabular-nums font-medium text-white">{totals.stateCounts.clear}</span> clear
                </div>
              </div>
            </div>
          </section>

          {/* ─── Filter row ─────────────────────────────────────────── */}
          <div
            className="mt-7 mb-4 flex flex-wrap items-center justify-between gap-3 reveal"
            style={{ animationDelay: '120ms' }}
          >
            <div className="flex items-center gap-1">
              <FilterTab active={tab === 'attention'} onClick={() => setTab('attention')} label="Needs attention" count={attentionCount} />
              <FilterTab active={tab === 'clear'}     onClick={() => setTab('clear')}     label="All clear"       count={clearCount} />
              <FilterTab active={tab === 'all'}       onClick={() => setTab('all')}       label="All"             count={PROJECTS.length} />
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <MagnifyingGlass size={13} weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a5a66]" />
                <input
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Search"
                  className="w-[160px] rounded-[9px] border border-[#1a1a22] bg-transparent py-[8px] pl-9 pr-3 text-[12.5px] font-medium tracking-tight text-[#e8e8ee] outline-none transition-colors placeholder:text-[#5a5a66] focus:border-[#7c6dff]/45 focus:bg-white/[0.02]"
                />
              </div>
              <button className="inline-flex items-center gap-1.5 rounded-[9px] border border-[#1a1a22] bg-transparent px-3.5 py-[8px] text-[12.5px] font-medium tracking-tight text-[#b8b8c0] transition-colors hover:border-[#2a2a32] hover:text-white">
                Last 30d
                <CaretDown size={11} weight="bold" className="text-[#5a5a66]" />
              </button>
            </div>
          </div>

          {/* ─── Table ──────────────────────────────────────────────── */}
          <section className="reveal" style={{ animationDelay: '180ms' }}>
            <table className="w-full table-fixed border-collapse">
              <colgroup>
                <col style={{ width: '42%' }} />
                <col style={{ width: '11%' }} />
                <col style={{ width: '17%' }} />
                <col style={{ width: '9%' }} />
                <col style={{ width: '11%' }} />
                <col style={{ width: '10%' }} />
              </colgroup>
              <thead>
                <tr className="border-b border-[#1a1a22]">
                  <Th align="left" first>Project</Th>
                  <Th align="left">30D</Th>
                  <Th align="right">Spend</Th>
                  <Th align="right">Conv</Th>
                  <Th align="right">CPA</Th>
                  <Th align="right" lastCol>Findings</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => {
                  const m = METRICS[p.id];
                  const isLast = i === filtered.length - 1;
                  const highlight = m.tone === 'critical' && i === 0;
                  const dim = m.tone === 'clear';
                  const tone = TONE_COLOR[m.tone];
                  return (
                    <tr
                      key={p.id}
                      className={`row reveal-row group ${highlight ? 'row-highlight' : ''} ${dim ? 'row-dim' : ''}`}
                      style={{ animationDelay: `${260 + i * 38}ms` }}
                    >
                      {/* Project cell */}
                      <Td first last={isLast}>
                        <Link to={`/projects/${p.id}`} className="relative flex items-center gap-3">
                          {/* Status dot with pulsing halo on critical */}
                          <span
                            className={`relative inline-flex h-[7px] w-[7px] shrink-0 items-center justify-center rounded-full ${m.tone === 'critical' ? 'pulse-dot' : ''}`}
                            style={{
                              background: tone.dot,
                              boxShadow: m.tone === 'critical'
                                ? `0 0 0 3px ${tone.ring}, 0 0 12px ${tone.glow}`
                                : `0 0 0 2px ${tone.ring}`,
                            }}
                          />
                          <Avatar bg={m.avatarBg} fg={m.avatarFg}>{p.name.charAt(0)}</Avatar>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[14.5px] font-medium tracking-[-0.005em] text-white">
                              {p.name}
                            </span>
                            <span className="mt-[2px] block truncate text-[11.5px] text-[#7a7a86]">
                              {p.industry} <Sep /> {p.accountCount} {p.accountCount === 1 ? 'account' : 'accounts'}
                            </span>
                          </span>
                        </Link>
                      </Td>

                      <Td last={isLast}>
                        <Sparkline points={m.spark} w={72} h={24} accent="#9c8aff" />
                      </Td>

                      <Td align="right" last={isLast}>
                        <div className="tabular-nums text-[14.5px] font-medium text-white">
                          ${m.spend.toLocaleString()}
                        </div>
                        <div className="ml-auto mt-[6px] h-[2.5px] w-[96px] overflow-hidden rounded-[1.5px] bg-[#15151c]">
                          <div
                            className="h-full rounded-[1.5px]"
                            style={{
                              width: `${Math.max(3, (m.spend / maxSpend) * 100)}%`,
                              background: 'linear-gradient(90deg, #6852E8 0%, #9c8aff 100%)',
                              boxShadow: '0 0 6px rgba(127,90,240,0.45)',
                            }}
                          />
                        </div>
                      </Td>

                      <Td align="right" last={isLast}>
                        <div className="tabular-nums text-[14.5px] font-medium text-white">
                          {m.conv.toLocaleString()}
                        </div>
                      </Td>

                      <Td align="right" last={isLast}>
                        <div className="tabular-nums text-[14.5px] font-medium text-white">
                          ${m.cpa.toFixed(2)}
                        </div>
                      </Td>

                      <Td align="right" last={isLast}>
                        {m.findings > 0 ? (
                          <span className="tabular-nums inline-flex items-center gap-[6px] text-[13.5px] font-medium text-white">
                            <Dot color={tone.dot} size={6} />
                            {m.findings}
                            <ArrowRight size={11} weight="bold" className="ml-0.5 text-[#3e3e48] transition-all duration-200 group-hover:translate-x-[2px] group-hover:text-[#9c8aff]" />
                          </span>
                        ) : (
                          <span className="text-[12px] text-[#5a5a66]">Clear</span>
                        )}
                      </Td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-7 py-14 text-center text-[13.5px] text-[#7a7a86]">
                      No clients match &ldquo;{filter}&rdquo;.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>

          {/* ─── Footer ─────────────────────────────────────────────── */}
          <div className="mt-7 flex items-center justify-between reveal" style={{ animationDelay: '480ms' }}>
            <p className="text-[11px] text-[#5a5a66]">
              Showing {filtered.length} of {PROJECTS.length} <Sep /> Sorted by attention needed
            </p>
            <button
              title="Scroll for more"
              aria-label="Scroll down"
              className="grid h-7 w-7 place-items-center rounded-full border border-[#1a1a22] bg-white/[0.02] text-[#7a7a86] transition-all hover:-translate-y-[1px] hover:border-[#2a2a32] hover:bg-white/[0.04] hover:text-white"
            >
              <ArrowDown size={11} weight="bold" />
            </button>
            <span className="w-0 lg:w-[140px]" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Subcomponents ────────────────────────────────────────────────────

function Sep() {
  return <span className="mx-1 text-[#3e3e48]">·</span>;
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[#6a6a76]">
      {children}
    </div>
  );
}

function Pill({ children, tone }: { children: React.ReactNode; tone: 'up' | 'down' }) {
  const color = tone === 'down' ? '#f87171' : '#86efac';
  return (
    <span
      className="tabular-nums inline-flex items-center gap-0.5 rounded-[5px] px-[6px] py-[2px] text-[11px] font-semibold"
      style={{
        color,
        background: tone === 'down' ? 'rgba(239,68,68,0.10)' : 'rgba(34,197,94,0.10)',
      }}
    >
      {children}
    </span>
  );
}

function FilterTab({
  active, onClick, label, count,
}: { active: boolean; onClick: () => void; label: string; count: number }) {
  return (
    <button
      onClick={onClick}
      className={[
        'inline-flex items-center gap-2 rounded-[8px] px-3 py-[7px] text-[12.5px] font-medium tracking-tight transition-all duration-200',
        active
          ? 'border border-[rgba(127,90,240,0.35)] bg-[rgba(127,90,240,0.10)] text-[#c9c1ff] shadow-[0_0_0_1px_rgba(127,90,240,0.05)_inset]'
          : 'border border-[#1a1a22] text-[#7a7a86] hover:border-[#2a2a32] hover:text-white',
      ].join(' ')}
    >
      {label}
      <span
        className={[
          'tabular-nums rounded-[4px] px-[6px] py-px text-[10.5px] font-semibold leading-none',
          active ? 'bg-[rgba(127,90,240,0.28)] text-white' : 'text-[#5a5a66]',
        ].join(' ')}
      >
        {count}
      </span>
    </button>
  );
}

function Th({
  children, align = 'left', first = false, lastCol = false,
}: {
  children: React.ReactNode;
  align?: 'left' | 'right';
  first?: boolean;
  lastCol?: boolean;
}) {
  return (
    <th
      scope="col"
      className={[
        'font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[#6a6a76]',
        align === 'right' ? 'text-right' : 'text-left',
        first ? 'pl-1 pr-2' : '',
        lastCol ? 'pl-2 pr-1' : '',
        !first && !lastCol ? 'px-2' : '',
        'pb-3 pt-4',
      ].join(' ')}
    >
      {children}
    </th>
  );
}

function Td({
  children, align = 'left', first = false, last = false,
}: {
  children: React.ReactNode;
  align?: 'left' | 'right';
  first?: boolean;
  last?: boolean;
}) {
  return (
    <td
      className={[
        'align-middle relative',
        align === 'right' ? 'text-right' : 'text-left',
        first ? 'pl-1 pr-2' : 'px-2',
        'py-[18px]',
        last ? '' : 'border-b border-[#14141a]',
      ].join(' ')}
    >
      {children}
    </td>
  );
}

function Avatar({ bg, fg, children }: { bg: string; fg: string; children: React.ReactNode }) {
  return (
    <span
      className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-[8px] text-[13px] font-semibold leading-none"
      style={{
        background: bg,
        color: fg,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.18)',
      }}
    >
      {children}
    </span>
  );
}

function Dot({ color, size = 5 }: { color: string; size?: number }) {
  return (
    <span
      className="inline-block rounded-full"
      style={{ width: size, height: size, background: color }}
    />
  );
}

/* Sparkline — single-line path with optional gradient fill area.
 * Stroke is the accent color; the fill (when enabled) is a soft purple
 * gradient that fades toward the baseline. */
function Sparkline({
  points, w, h, className = '', accent = '#9c8aff', fill = false,
}: { points: number[]; w: number; h: number; className?: string; accent?: string; fill?: boolean }) {
  const max = 22;
  const stepX = w / (points.length - 1);
  const linePath = points
    .map((y, i) => `${i === 0 ? 'M' : 'L'}${(i * stepX).toFixed(2)},${y.toFixed(2)}`)
    .join(' ');
  const fillPath = `${linePath} L${w},${max} L0,${max} Z`;
  const gradId = `spark-${Math.abs(hashStr(points.join('-') + accent))}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${max}`} className={`block ${className}`} preserveAspectRatio="none">
      {fill && (
        <>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accent} stopOpacity="0.28" />
              <stop offset="100%" stopColor={accent} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={fillPath} fill={`url(#${gradId})`} stroke="none" />
        </>
      )}
      <path d={linePath} fill="none" stroke={accent} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

function Bar({ count, max, color }: { count: number; max: number; color: string }) {
  const h = max === 0 ? 6 : Math.max(8, (count / max) * 32);
  return (
    <div
      className="w-[20px] rounded-[3px] transition-all"
      style={{
        height: `${h}px`,
        background: count === 0
          ? `${color}33`
          : `linear-gradient(180deg, ${color} 0%, ${color}cc 100%)`,
        boxShadow: count > 0 ? `0 0 12px -2px ${color}66` : 'none',
        opacity: count === 0 ? 0.45 : 1,
      }}
      title={`${count}`}
    />
  );
}

/* ─── Page styles ─────────────────────────────────────────────────────
 * Scoped to .projects-shell. Animations are CSS-only (no Motion lib).
 *
 *   .projects-shell  — page card surface (ink bg + hairline + grain)
 *   .reveal          — fade-up section reveal
 *   .reveal-row      — fade-up row reveal (longer travel, dim start)
 *   .row             — table-row hover treatment (left accent + tint)
 *   .row-highlight   — emphasized top-critical row
 *   .row-dim         — clear rows render slightly recessed
 *   .pulse-dot       — soft halo pulse for critical status dots
 */
const PAGE_STYLES = `
  .projects-shell {
    background: #0a0a0f;
    border: 1px solid #1a1a22;
    border-radius: 16px;
  }
  .projects-shell::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 16px;
    pointer-events: none;
    background-image:
      radial-gradient(rgba(255,255,255,0.022) 1px, transparent 1px);
    background-size: 3px 3px;
    mix-blend-mode: overlay;
    opacity: 0.6;
  }

  @keyframes pj-reveal {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .reveal {
    opacity: 0;
    animation: pj-reveal 0.55s cubic-bezier(0.22, 0.9, 0.32, 1) forwards;
  }

  @keyframes pj-row-reveal {
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .reveal-row {
    opacity: 0;
    animation: pj-row-reveal 0.45s cubic-bezier(0.22, 0.9, 0.32, 1) forwards;
  }

  /* Left accent uses box-shadow inset on the first <td>, NOT a ::before
     pseudo-element on <tr>. Pseudo-elements on table rows render as anonymous
     cells in some browsers, shifting the colgroup mapping. */
  .row { transition: background-color 0.18s ease; }
  .row > td:first-child {
    transition: box-shadow 0.25s cubic-bezier(0.22, 0.9, 0.32, 1);
  }
  .row:hover { background-color: rgba(127, 90, 240, 0.045); }
  .row:hover > td:first-child {
    box-shadow: inset 2px 0 0 #7F5AF0, inset 12px 0 24px -16px rgba(127, 90, 240, 0.55);
  }

  .row-highlight { background-color: rgba(127, 90, 240, 0.05); }
  .row-highlight > td:first-child {
    box-shadow: inset 2px 0 0 rgba(127, 90, 240, 0.85), inset 14px 0 28px -18px rgba(127, 90, 240, 0.45);
  }
  .row-highlight:hover { background-color: rgba(127, 90, 240, 0.08); }
  .row-highlight:hover > td:first-child {
    box-shadow: inset 2.5px 0 0 #C7B0FF, inset 16px 0 32px -18px rgba(127, 90, 240, 0.65);
  }

  .row-dim { opacity: 0.74; }
  .row-dim:hover { opacity: 1; }

  @keyframes pj-pulse {
    0%   { box-shadow: 0 0 0 3px rgba(239,68,68,0.18), 0 0 12px rgba(239,68,68,0.32); }
    50%  { box-shadow: 0 0 0 5px rgba(239,68,68,0.05), 0 0 18px rgba(239,68,68,0.45); }
    100% { box-shadow: 0 0 0 3px rgba(239,68,68,0.18), 0 0 12px rgba(239,68,68,0.32); }
  }
  .pulse-dot {
    animation: pj-pulse 2.4s ease-in-out infinite;
  }
`;
