import { Link } from 'react-router-dom';
import {
  ArrowRight, Plus, MagnifyingGlass, CaretDown, ArrowUp, ArrowDown,
  Funnel, Sparkle,
} from '@phosphor-icons/react';
import { useMemo, useState } from 'react';
import { PROJECTS } from '../mock/projects';

/* Projects · /projects · "The roster"
 *
 * Joyful agency portfolio. The page agency teams will WANT to live in.
 *
 *   1 · Greeting strip      Eyebrow + display H1 with purple period
 *   2 · Filter & search     Pill chips + search field
 *   3 · KPI quartet         Four light cards w/ sparklines (the reference)
 *   4 · The ledger          White card · status dot · priority word ·
 *                           spend · trend sparkline · findings chip
 *   5 · AI insight (dark)   THE earned-dark moment — recoverable revenue
 *                           with a luminous purple sparkline payoff.
 *
 * Light-forward, single dark moment at the bottom. The dark moment is the
 * payoff — "$5,400/mo recoverable across 8 projects" — not the welcome.
 */

type Tone = 'critical' | 'warning' | 'clear';
type Priority = 'high' | 'medium' | 'low';

interface ProjectMetrics {
  spend: number;
  conv: number;
  cpa: number;
  findings: number;
  tone: Tone;
  priority: Priority;
  spark: number[];
  trend: 'up' | 'down' | 'flat';
  trendPct?: number;
  avatarBg: string;
  avatarFg: string;
}

const METRICS: Record<string, ProjectMetrics> = {
  'boulder-care':       { spend: 83_280, conv: 1068, cpa: 77.95,  findings: 4, tone: 'critical', priority: 'high',   trend: 'up',   trendPct: 12.4, spark: [9,11,8,12,10,14,12,17,15],  avatarBg: '#22C55E', avatarFg: '#052E16' },
  'the-hoth':           { spend: 12_783, conv: 16,   cpa: 798.95, findings: 1, tone: 'critical', priority: 'high',   trend: 'down', trendPct: 18.7, spark: [6,9,7,11,9,13,11,15,14],    avatarBg: '#EF4444', avatarFg: '#450A0A' },
  'durable':            { spend: 20_373, conv: 1217, cpa: 16.74,  findings: 2, tone: 'warning',  priority: 'medium', trend: 'up',   trendPct: 6.2,  spark: [12,9,13,7,11,8,6,10,5],     avatarBg: '#14B8A6', avatarFg: '#042F2C' },
  'livingyoung':        { spend: 8_414,  conv: 28,   cpa: 296.95, findings: 2, tone: 'warning',  priority: 'medium', trend: 'up',   trendPct: 3.1,  spark: [13,11,14,9,12,7,10,5,8],    avatarBg: '#3B82F6', avatarFg: '#0B1F4F' },
  'linkbuilder':        { spend: 1_256,  conv: 7,    cpa: 179.51, findings: 2, tone: 'warning',  priority: 'medium', trend: 'flat',                 spark: [10,8,12,7,13,8,11,7,12],    avatarBg: '#65D6A1', avatarFg: '#053723' },
  'authority-builders': { spend: 6_846,  conv: 43,   cpa: 159.20, findings: 0, tone: 'clear',    priority: 'low',    trend: 'up',   trendPct: 4.6,  spark: [14,11,13,9,11,7,9,5,7],     avatarBg: '#5B7CF8', avatarFg: '#0E1A4D' },
  'edwin-novel':        { spend: 6_949,  conv: 18,   cpa: 395.65, findings: 0, tone: 'clear',    priority: 'low',    trend: 'flat',                 spark: [11,9,12,10,9,12,10,8,11],   avatarBg: '#D946A8', avatarFg: '#3F0D2E' },
  'flock':              { spend: 517,    conv: 17,   cpa: 30.39,  findings: 0, tone: 'clear',    priority: 'low',    trend: 'up',   trendPct: 8.1,  spark: [12,10,13,9,11,8,10,7,9],    avatarBg: '#C08A2E', avatarFg: '#3A2406' },
};

const TONE = {
  critical: { dot: '#E24B4A', soft: '#FBE6E5', text: '#9F2624', label: 'Critical' },
  warning:  { dot: '#D49021', soft: '#FAEFDD', text: '#82500A', label: 'Warning' },
  clear:    { dot: '#3FB58C', soft: '#E2F4EC', text: '#1F6F4F', label: 'Clear' },
} as const;

const PRIORITY = {
  high:   { color: '#C5301B', label: 'High',   weight: 700, italic: true  },
  medium: { color: '#946112', label: 'Medium', weight: 600, italic: false },
  low:    { color: '#7B7589', label: 'Low',    weight: 500, italic: false },
} as const;
/* Note: "High" leans on Figtree italic + 700 weight + red, not a serif
 * face. Earlier rev tried Playfair italic — it read off-brand sitting
 * next to Figtree everywhere else. Sans italic is enough emphasis. */

type TabId = 'attention' | 'clear' | 'all';

export function Projects() {
  const [filter, setFilter] = useState('');
  const [tab, setTab] = useState<TabId>('all');

  // ─── KPI rollups ──────────────────────────────────────────────────────
  const totals = useMemo(() => {
    const spend = PROJECTS.reduce((a, p) => a + (METRICS[p.id]?.spend ?? 0), 0);
    const conv  = PROJECTS.reduce((a, p) => a + (METRICS[p.id]?.conv  ?? 0), 0);
    const findings = PROJECTS.reduce((a, p) => a + (METRICS[p.id]?.findings ?? 0), 0);
    const cpa = conv > 0 ? spend / conv : 0;
    const stateCounts = PROJECTS.reduce(
      (acc, p) => {
        const k = METRICS[p.id]?.tone ?? 'clear';
        acc[k] = (acc[k] ?? 0) + 1;
        return acc;
      },
      { critical: 0, warning: 0, clear: 0 } as Record<Tone, number>,
    );
    return { spend, conv, cpa, findings, stateCounts };
  }, []);

  const attentionCount = totals.stateCounts.critical + totals.stateCounts.warning;
  const clearCount = totals.stateCounts.clear;
  const recoverable = useMemo(() => {
    // "Recoverable" is a back-of-envelope per the design brief: ~$1,350 per
    // critical finding + ~$200 per warning finding. Used only in the AI
    // insight card to give the dark moment a concrete dollar payoff.
    const crit = PROJECTS.filter((p) => METRICS[p.id]?.tone === 'critical').reduce((a, p) => a + METRICS[p.id].findings, 0);
    const warn = PROJECTS.filter((p) => METRICS[p.id]?.tone === 'warning').reduce((a, p) => a + METRICS[p.id].findings, 0);
    return crit * 1350 + warn * 200;
  }, []);

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
        const order: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
        const da = order[METRICS[a.id]?.priority ?? 'low'];
        const db = order[METRICS[b.id]?.priority ?? 'low'];
        if (da !== db) return da - db;
        return (METRICS[b.id]?.spend ?? 0) - (METRICS[a.id]?.spend ?? 0);
      });
  }, [filter, tab]);

  return (
    <div className="space-y-7 pb-4">
      <style>{PAGE_STYLES}</style>

      {/* ════════════════════════════════════════════════════════════════
          1 · GREETING + ACTIONS
          Eyebrow runs the breadcrumb. Display H1 closes with the purple
          period. Filters button + New-project CTA pinned right.        */}
      <header className="reveal flex items-end justify-between gap-6" style={{ animationDelay: '0ms' }}>
        <div className="min-w-0 flex-1">
          <h1 className="ppc-h1 text-ppc-ink">
            All projects<span className="ppc-period">.</span>
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button className="inline-flex items-center gap-2 rounded-[10px] border border-[#d9d4ec] bg-white px-3.5 py-[10px] text-[13px] font-medium tracking-tight text-ppc-ink transition-all hover:-translate-y-px hover:border-ppc-purple-300/60 hover:bg-[#FBFAFF]">
            <Funnel size={13} weight="duotone" className="text-ppc-text-muted" />
            Filters
            <CaretDown size={10} weight="bold" className="text-ppc-text-faint" />
          </button>
          <button
            className="group inline-flex items-center gap-2 rounded-[10px] px-4 py-[10px] text-[13px] font-semibold tracking-tight text-white transition-all hover:-translate-y-px"
            style={{
              background: 'linear-gradient(180deg, #8E6BF5 0%, #7F5AF0 50%, #6E47E0 100%)',
              boxShadow:
                '0 1px 0 rgba(255,255,255,0.20) inset, 0 0 0 1px rgba(127,90,240,0.55), 0 10px 22px -10px rgba(127,90,240,0.65)',
            }}
          >
            <Plus size={13} weight="bold" className="text-white transition-transform group-hover:rotate-90" />
            New project
          </button>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════════════
          2 · SEARCH + FILTER CHIPS
          Wide search above narrow chip row. The Sort chip leads with the
          purple bracket icon so the eye locks onto sort first.          */}
      <section className="reveal space-y-3" style={{ animationDelay: '60ms' }}>
        <div className="relative">
          <MagnifyingGlass
            size={15}
            weight="bold"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ppc-text-faint"
          />
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search projects, clients, industries…"
            className="w-full rounded-[12px] border border-[#d9d4ec] bg-white py-[12px] pl-11 pr-4 text-[13.5px] font-medium tracking-tight text-ppc-ink outline-none transition-all placeholder:text-ppc-text-faint focus:border-ppc-purple-500/55 focus:shadow-[0_0_0_4px_rgba(127,90,240,0.10)]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SegmentChip active={tab === 'all'}        onClick={() => setTab('all')}        label="All projects" count={PROJECTS.length} />
          <SegmentChip active={tab === 'attention'}  onClick={() => setTab('attention')}  label="Needs attention" count={attentionCount} tone="critical" />
          <SegmentChip active={tab === 'clear'}      onClick={() => setTab('clear')}      label="All clear" count={clearCount} tone="clear" />
          <span className="mx-1.5 hidden h-5 w-px bg-[#d9d4ec] sm:inline-block" />
          <FilterChip label="All owners" />
          <FilterChip label="All tags" />
          <div className="ml-auto">
            <FilterChip label="Priority" prefix="Sort:" purple />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          3 · KPI QUARTET
          Four light cards in a row. Big tabular numbers, tiny delta pill,
          a sparkline floats underneath in soft purple. Matches reference. */}
      <section
        className="reveal grid gap-4"
        style={{ animationDelay: '120ms', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}
      >
        <KpiCard
          label="Total spend"
          value={`$${totals.spend.toLocaleString()}`}
          delta={{ tone: 'down', pct: 8.2 }}
          spark={[15, 13, 16, 12, 14, 11, 13, 10, 12, 9, 11, 8]}
          accent="#7F5AF0"
        />
        <KpiCard
          label="Conversions"
          value={totals.conv.toLocaleString()}
          delta={{ tone: 'up', pct: 12.4 }}
          spark={[9, 11, 10, 13, 12, 15, 14, 17, 16, 18, 17, 19]}
          accent="#3FB58C"
        />
        <KpiCard
          label="Open findings"
          value={totals.findings.toLocaleString()}
          delta={{ tone: 'down', pct: 4.0, good: true }}
          spark={[16, 15, 17, 14, 13, 12, 13, 11, 12, 10, 11, 9]}
          accent="#C5301B"
        />
        <KpiCard
          label="Recoverable / mo"
          value={`$${recoverable.toLocaleString()}`}
          delta={{ tone: 'up', pct: 22.0 }}
          spark={[8, 10, 9, 11, 10, 13, 12, 15, 14, 17, 16, 19]}
          accent="#7F5AF0"
        />
      </section>

      {/* ════════════════════════════════════════════════════════════════
          4 · THE LEDGER
          White card, hairline lavender row dividers. Status & priority
          read as words (with a dot for status). Spend right-aligned.
          Trend is a quiet sparkline. Findings chip pops in tone.        */}
      <section
        className="reveal overflow-hidden rounded-[16px] bg-white"
        style={{
          animationDelay: '180ms',
          border: '0.5px solid #d9d4ec',
          boxShadow: '0 1px 0 rgba(255,255,255,0.6) inset, 0 1px 2px rgba(15,10,30,0.025)',
        }}
      >
        <div className="flex items-center justify-between border-b border-[#ECEAFA] px-6 py-3.5">
          <div className="flex items-center gap-2.5">
            <Sparkle size={13} weight="fill" className="text-ppc-purple-500" />
            <span className="ppc-h4 text-ppc-ink">
              The roster
            </span>
            <span className="mono-eyebrow text-ppc-text-faint">
              · last 30 days · sorted by priority
            </span>
          </div>
          <span className="mono-eyebrow text-ppc-text-faint">
            <span className="tabular-nums font-semibold text-ppc-ink">{filtered.length}</span>
            <span className="text-ppc-text-faint/60"> / {PROJECTS.length}</span>
          </span>
        </div>

        <table className="w-full table-fixed border-collapse">
          <colgroup>
            <col style={{ width: '32%' }} />
            <col style={{ width: '13%' }} />
            <col style={{ width: '11%' }} />
            <col style={{ width: '14%' }} />
            <col style={{ width: '18%' }} />
            <col style={{ width: '12%' }} />
          </colgroup>
          <thead>
            <tr style={{ borderBottom: '1px solid #ECEAFA' }}>
              <Th align="left" first>Project</Th>
              <Th align="left">Status</Th>
              <Th align="left">Priority</Th>
              <Th align="right">Spend</Th>
              <Th align="left">Trend</Th>
              <Th align="right" lastCol>Findings</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => {
              const m = METRICS[p.id];
              const isLast = i === filtered.length - 1;
              const tone = TONE[m.tone];
              const pri = PRIORITY[m.priority];
              return (
                <tr
                  key={p.id}
                  className="row reveal-row group"
                  style={{ animationDelay: `${260 + i * 32}ms` }}
                >
                  <Td first last={isLast}>
                    <Link to={`/projects/${p.id}`} className="flex items-center gap-3.5">
                      <Avatar bg={m.avatarBg} fg={m.avatarFg}>{p.name.charAt(0)}</Avatar>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14.5px] font-semibold tracking-[-0.008em] text-ppc-ink transition-colors group-hover:text-ppc-purple-700">
                          {p.name}
                        </span>
                        <span className="mt-[2px] block truncate text-[12px] text-ppc-text-muted">
                          {p.industry}
                          {p.accountCount > 1 && (
                            <>
                              <span className="text-ppc-text-faint/55"> · </span>
                              <span className="tabular-nums">{p.accountCount} accounts</span>
                            </>
                          )}
                        </span>
                      </span>
                    </Link>
                  </Td>

                  <Td last={isLast}>
                    <span className="inline-flex items-center gap-2 text-[13px] font-medium" style={{ color: tone.text }}>
                      <span
                        className="h-[7px] w-[7px] rounded-full"
                        style={{ background: tone.dot, boxShadow: `0 0 0 3px ${tone.soft}` }}
                      />
                      {tone.label}
                    </span>
                  </Td>

                  <Td last={isLast}>
                    <span
                      className="text-[13.5px] tracking-[-0.005em]"
                      style={{
                        color: pri.color,
                        fontWeight: pri.weight,
                        fontStyle: pri.italic ? 'italic' : 'normal',
                      }}
                    >
                      {pri.label}
                    </span>
                  </Td>

                  <Td align="right" last={isLast}>
                    <div className="tabular-nums text-[14.5px] font-semibold tracking-[-0.012em] text-ppc-ink">
                      ${m.spend.toLocaleString()}
                    </div>
                  </Td>

                  <Td last={isLast}>
                    <div className="flex items-center gap-2.5">
                      <Sparkline
                        points={m.spark}
                        w={92} h={28}
                        accent={m.trend === 'down' ? '#C5301B' : m.trend === 'up' ? '#3FB58C' : '#7F5AF0'}
                        stroke={1.5}
                        glow
                      />
                      <TrendChip trend={m.trend} pct={m.trendPct} />
                    </div>
                  </Td>

                  <Td align="right" last={isLast}>
                    {m.findings > 0 ? (
                      <span
                        className="tabular-nums inline-flex items-center gap-[6px] rounded-[7px] px-[9px] py-[4px] text-[13px] font-bold transition-transform group-hover:-translate-y-[1px]"
                        style={{
                          background: tone.soft,
                          color: tone.text,
                          boxShadow: `inset 0 0 0 1px ${tone.dot}1A`,
                        }}
                      >
                        {m.findings}
                        <ArrowRight size={10} weight="bold" className="opacity-0 transition-all duration-200 group-hover:translate-x-[1px] group-hover:opacity-100" />
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-ppc-text-faint">
                        Clear
                      </span>
                    )}
                  </Td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-7 py-16 text-center text-[13.5px] text-ppc-text-muted">
                  No projects match &ldquo;{filter}&rdquo;.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          5 · AI INSIGHT — the earned-dark payoff
          The page's one luminous moment. Purple radial bloom, starfield
          grain, luminous fill sparkline. Echoes the cockpit hero card. */}
      <section
        className="reveal relative overflow-hidden rounded-[20px]"
        style={{
          animationDelay: '320ms',
          background: 'radial-gradient(120% 90% at 78% 0%, #1F1340 0%, #120B26 55%, #0A0617 100%)',
          boxShadow:
            '0 1px 0 rgba(127,90,240,0.10) inset, 0 16px 36px -22px rgba(127,90,240,0.45), 0 1px 0 rgba(255,255,255,0.06) inset',
        }}
      >
        {/* Right-side purple bloom */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-32 h-[420px] w-[420px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(127,90,240,0.40) 0%, rgba(127,90,240,0.10) 38%, transparent 70%)',
          }}
        />
        {/* Bottom-left dim bloom */}
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-20 h-[340px] w-[340px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(127,90,240,0.10) 0%, transparent 65%)' }}
        />
        {/* Starfield grain */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.024) 1px, transparent 1px)',
            backgroundSize: '3px 3px',
            mixBlendMode: 'overlay',
          }}
        />
        {/* Sheen line */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-14 top-0 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(127,90,240,0.55) 45%, rgba(127,90,240,0.85) 50%, rgba(127,90,240,0.55) 55%, transparent 100%)',
          }}
        />

        <div className="relative grid grid-cols-[1.35fr_1fr] items-center gap-6 px-9 py-9">
          {/* Left — the insight */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.04] px-3 py-[5px] mono-eyebrow text-white/65">
              <Sparkle size={11} weight="fill" className="text-[#C7B0FF]" />
              AI insight
            </div>
            <h2 className="ppc-h2 mt-4 text-white">
              {totals.stateCounts.critical} accounts need <em
                className="font-serif italic font-bold not-italic"
                style={{
                  fontFamily: 'PF-Marlet-Display, "Playfair Display", Georgia, serif',
                  fontStyle: 'italic',
                  background: 'linear-gradient(90deg, #E8DDFF 0%, #C7B0FF 60%, #A88CFF 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                immediate attention
              </em>
              <span className="text-ppc-purple-400">.</span>
            </h2>
            <p className="mt-3 max-w-[560px] text-[13.5px] leading-[1.55] text-white/65">
              Boulder Care and The HOTH have critical issues impacting performance.
              Together they hold the largest recoverable revenue across the roster.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <button
                className="group inline-flex items-center gap-2 rounded-[11px] px-4 py-[10px] text-[13px] font-semibold tracking-tight text-white transition-all hover:-translate-y-px"
                style={{
                  background: 'linear-gradient(180deg, #9676F7 0%, #7F5AF0 50%, #6543DA 100%)',
                  boxShadow:
                    '0 1px 0 rgba(255,255,255,0.25) inset, 0 0 0 1px rgba(127,90,240,0.7), 0 12px 28px -10px rgba(127,90,240,0.65)',
                }}
              >
                Review now
                <ArrowRight size={12} weight="bold" className="transition-transform group-hover:translate-x-[2px]" />
              </button>
              <button className="text-[12.5px] font-medium text-white/65 transition-colors hover:text-white">
                Dismiss until tomorrow
              </button>
            </div>
          </div>

          {/* Right — recoverable payoff */}
          <div className="relative">
            <div
              className="rounded-[14px] px-6 py-5"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.015) 100%)',
                border: '0.5px solid rgba(255,255,255,0.10)',
              }}
            >
              <div className="mono-eyebrow text-white/55">Total recoverable</div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="ppc-h1 tabular-nums text-white">
                  ${recoverable.toLocaleString()}
                </span>
                <span className="text-[14px] font-medium text-white/55">/ mo</span>
              </div>
              <div className="mt-1.5 flex items-center gap-2 text-[11.5px] text-white/55">
                <span className="tabular-nums">Across {PROJECTS.length} projects</span>
                <span className="text-white/30">·</span>
                <span className="tabular-nums font-medium text-[#A6E3C6]">+22% vs last month</span>
              </div>
              <div className="mt-4">
                <Sparkline
                  points={[16, 13, 15, 11, 13, 9, 11, 7, 9, 6, 8, 4]}
                  w={340} h={48}
                  accent="#C7B0FF"
                  fill glow
                  stroke={1.75}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─── Subcomponents ─────────────────────────────────────────────────── */

function KpiCard({
  label, value, delta, spark, accent,
}: {
  label: string;
  value: string;
  delta: { tone: 'up' | 'down' | 'flat'; pct: number; good?: boolean };
  spark: number[];
  accent: string;
}) {
  // `good` flips the semantic color when down-is-good (e.g. falling CPA).
  const semantic = delta.good
    ? (delta.tone === 'down' ? 'up' : 'down')
    : delta.tone;
  const palette = semantic === 'up'
    ? { fg: '#1F8458', bg: '#E2F4EC', Icon: ArrowUp }
    : { fg: '#C5301B', bg: '#FBE6E5', Icon: ArrowDown };
  return (
    <div
      className="kpi-card group relative overflow-hidden rounded-[14px] bg-white px-5 pb-4 pt-4"
      style={{
        border: '0.5px solid #d9d4ec',
        boxShadow: '0 1px 0 rgba(255,255,255,0.7) inset',
      }}
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
      <div className="ppc-h2 mt-2.5 tabular-nums text-ppc-ink">
        {value}
      </div>
      <div className="mt-3 -mb-1">
        <Sparkline points={spark} w={300} h={32} accent={accent} stroke={1.6} fill />
      </div>
      {/* Bottom soft glow — appears on hover */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 bottom-0 h-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${accent}80 50%, transparent 100%)`,
        }}
      />
    </div>
  );
}

function SegmentChip({
  active, onClick, label, count, tone,
}: { active: boolean; onClick: () => void; label: string; count: number; tone?: 'critical' | 'clear' }) {
  const dot = tone === 'critical' ? '#E24B4A' : tone === 'clear' ? '#3FB58C' : null;
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
        boxShadow:
          '0 1px 0 rgba(255,255,255,0.22) inset, 0 0 0 1px rgba(127,90,240,0.55), 0 10px 22px -10px rgba(127,90,240,0.65)',
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

function FilterChip({ label, prefix, purple }: { label: string; prefix?: string; purple?: boolean }) {
  return (
    <button
      className={[
        'inline-flex items-center gap-1.5 rounded-[10px] border px-3 py-[8px] text-[12.5px] font-medium tracking-tight transition-all duration-150 hover:-translate-y-px',
        purple
          ? 'border-ppc-purple-300/50 bg-[#F8F5FF] text-ppc-purple-700 hover:bg-[#F3EEFF]'
          : 'border-[#d9d4ec] bg-white text-ppc-ink hover:border-ppc-purple-300/55 hover:bg-[#FBFAFF]',
      ].join(' ')}
    >
      {prefix && (
        <span className="mono-eyebrow text-ppc-text-faint">{prefix}</span>
      )}
      {label}
      <CaretDown size={10} weight="bold" className={purple ? 'text-ppc-purple-500' : 'text-ppc-text-faint'} />
    </button>
  );
}

function TrendChip({ trend, pct }: { trend: 'up' | 'down' | 'flat'; pct?: number }) {
  if (trend === 'flat' || pct === undefined) {
    return (
      <span className="mono-eyebrow text-ppc-text-faint">flat</span>
    );
  }
  const palette = trend === 'up'
    ? { fg: '#1F8458', Icon: ArrowUp }
    : { fg: '#C5301B', Icon: ArrowDown };
  return (
    <span
      className="tabular-nums inline-flex items-center gap-0.5 text-[11.5px] font-semibold"
      style={{ color: palette.fg }}
    >
      <palette.Icon size={9} weight="bold" />
      {pct.toFixed(1)}%
    </span>
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
        'text-[11px] font-semibold text-ppc-text-faint',
        align === 'right' ? 'text-right' : 'text-left',
        first ? 'pl-6 pr-2' : '',
        lastCol ? 'pl-2 pr-6' : '',
        !first && !lastCol ? 'px-2' : '',
        'pb-[11px] pt-[13px]',
      ].join(' ')}
      style={{ background: '#FBFAFE' }}
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
        'align-middle',
        align === 'right' ? 'text-right' : 'text-left',
        first ? 'pl-6 pr-2' : 'px-2',
        last ? 'pr-6' : '',
        'py-[18px]',
      ].join(' ')}
    >
      {children}
    </td>
  );
}

function Avatar({ bg, fg, children }: { bg: string; fg: string; children: React.ReactNode }) {
  return (
    <span
      className="grid h-[36px] w-[36px] shrink-0 place-items-center rounded-[9px] text-[14.5px] font-bold leading-none transition-transform duration-200 group-hover:-translate-y-[1px] group-hover:scale-[1.03]"
      style={{
        background: bg,
        color: fg,
        boxShadow:
          'inset 0 1px 0 rgba(255,255,255,0.28), inset 0 -1px 0 rgba(0,0,0,0.16), 0 1px 0 rgba(15,10,30,0.04)',
      }}
    >
      {children}
    </span>
  );
}

/* Sparkline — stroke path, optional soft fill, optional glow. */
function Sparkline({
  points, w, h, className = '', accent = '#7F5AF0', fill = false, glow = false, stroke = 1.4,
}: {
  points: number[];
  w: number;
  h: number;
  className?: string;
  accent?: string;
  fill?: boolean;
  glow?: boolean;
  stroke?: number;
}) {
  const max = 22;
  const stepX = w / (points.length - 1);
  const linePath = points
    .map((y, i) => `${i === 0 ? 'M' : 'L'}${(i * stepX).toFixed(2)},${y.toFixed(2)}`)
    .join(' ');
  const fillPath = `${linePath} L${w},${max} L0,${max} Z`;
  const seed = Math.abs(hashStr(points.join('-') + accent));
  const gradId = `spk-grad-${seed}`;
  const glowId = `spk-glow-${seed}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${max}`} className={`block ${className}`} preserveAspectRatio="none">
      <defs>
        {fill && (
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.32" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </linearGradient>
        )}
        {glow && (
          <filter id={glowId} x="-20%" y="-50%" width="140%" height="200%">
            <feGaussianBlur stdDeviation="0.7" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>
      {fill && <path d={fillPath} fill={`url(#${gradId})`} stroke="none" />}
      <path
        className="spark-path"
        d={linePath}
        fill="none"
        stroke={accent}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={glow ? `url(#${glowId})` : undefined}
      />
    </svg>
  );
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

/* ─── Page styles ──────────────────────────────────────────────────────
 * Reveal motion + sparkline draw-in + row hover lift. No status strip on
 * rows — the reference reads as a calm ledger, not a triage board. The
 * priority word + status dot already carry the urgency cue. */
const PAGE_STYLES = `
  /* Survivor eyebrow — legacy class name kept, swept off mono uppercase
     to mixed-case Figtree per the 2026-05-18 type pass. */
  .mono-eyebrow {
    font-family: var(--font-sans);
    font-size: 11px;
    font-weight: 600;
    line-height: 1.2;
    letter-spacing: 0;
    text-transform: none;
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
    animation: pj-row-reveal 0.42s cubic-bezier(0.22, 0.9, 0.32, 1) forwards;
  }

  @keyframes pj-spark-draw {
    from { stroke-dashoffset: 320; }
    to   { stroke-dashoffset: 0; }
  }
  .spark-path {
    stroke-dasharray: 320;
    animation: pj-spark-draw 1.2s cubic-bezier(0.22, 0.9, 0.32, 1) 0.2s both;
  }

  /* Row hover — quiet lift, purple wash from the left edge */
  .row {
    transition: background-color 0.2s ease;
    border-bottom: 1px solid #ECEAFA;
  }
  .row:last-child { border-bottom: none; }
  .row:hover {
    background: linear-gradient(90deg, rgba(127,90,240,0.055) 0%, rgba(127,90,240,0.018) 38%, transparent 100%);
  }

  /* KPI card — gentle hover lift */
  .kpi-card {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .kpi-card:hover {
    transform: translateY(-1px);
    box-shadow: 0 1px 0 rgba(255,255,255,0.7) inset, 0 12px 28px -16px rgba(127,90,240,0.20);
  }
`;
