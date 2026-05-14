import { Link } from 'react-router-dom';
import {
  ArrowRight, Plus, MagnifyingGlass, CaretDown, ArrowDown, ArrowUp, Minus,
} from '@phosphor-icons/react';
import { useMemo, useState } from 'react';
import { PROJECTS } from '../mock/projects';

/* Projects list · /projects · Surface 04 (light work surface)
 *
 * "The Roster." — an agency reading desk. Two acts:
 *
 *   ACT I  — Dark instrument panel pinned to the top. The KPI rollup and
 *            its sparklines sit on ink with a soft purple bloom. Dark is
 *            earned here because luminous data-viz on ink reads as the
 *            moment of the page.
 *
 *   ACT II — Light ledger on lavender. White card, hairline lavender row
 *            dividers, status communicates via a 3px left strip per the
 *            v5 status-strip pattern (not a full row tint).
 *
 * Per the v5 source artifact, headlines close with the canonical purple
 * period. Tabular numbers are Figtree with -0.018em tracking.
 */

type Tone = 'critical' | 'warning' | 'clear';

interface ProjectMetrics {
  spend: number;
  conv: number;
  cpa: number;
  findings: number;
  tone: Tone;
  spark: number[];
  trend: 'up' | 'down' | 'flat';
  trendPct?: number;
  avatarBg: string;
  avatarFg: string;
}

const METRICS: Record<string, ProjectMetrics> = {
  'boulder-care':       { spend: 83_280, conv: 1068, cpa: 77.95,  findings: 4, tone: 'critical', trend: 'up',   trendPct: 12.4, spark: [17,14,15,11,13,9,10,6,8],   avatarBg: '#22C55E', avatarFg: '#052E16' },
  'the-hoth':           { spend: 12_783, conv: 16,   cpa: 798.95, findings: 1, tone: 'critical', trend: 'down', trendPct: 18.7, spark: [6,9,7,11,9,13,11,15,14],    avatarBg: '#EF4444', avatarFg: '#450A0A' },
  'durable':            { spend: 20_373, conv: 1217, cpa: 16.74,  findings: 2, tone: 'warning',  trend: 'up',   trendPct: 6.2,  spark: [12,9,13,7,11,8,6,10,5],     avatarBg: '#14B8A6', avatarFg: '#042F2C' },
  'linkbuilder':        { spend: 1_256,  conv: 7,    cpa: 179.51, findings: 2, tone: 'warning',  trend: 'flat',                 spark: [10,8,12,7,13,8,11,7,12],    avatarBg: '#65D6A1', avatarFg: '#053723' },
  'livingyoung':        { spend: 8_414,  conv: 28,   cpa: 296.95, findings: 1, tone: 'warning',  trend: 'up',   trendPct: 3.1,  spark: [13,11,14,9,12,7,10,5,8],    avatarBg: '#3B82F6', avatarFg: '#0B1F4F' },
  'authority-builders': { spend: 6_846,  conv: 43,   cpa: 159.20, findings: 0, tone: 'clear',    trend: 'up',   trendPct: 4.6,  spark: [14,11,13,9,11,7,9,5,7],     avatarBg: '#5B7CF8', avatarFg: '#0E1A4D' },
  'edwin-novel':        { spend: 6_949,  conv: 18,   cpa: 395.65, findings: 0, tone: 'clear',    trend: 'flat',                 spark: [11,9,12,10,9,12,10,8,11],   avatarBg: '#D946A8', avatarFg: '#3F0D2E' },
  'flock':              { spend: 517,    conv: 17,   cpa: 30.39,  findings: 0, tone: 'clear',    trend: 'up',   trendPct: 8.1,  spark: [12,10,13,9,11,8,10,7,9],    avatarBg: '#C08A2E', avatarFg: '#3A2406' },
};

const TONE = {
  critical: { strip: '#E24B4A', dot: '#E24B4A', soft: '#FBEAEA', text: '#9F2624', label: 'Critical' },
  warning:  { strip: '#BA7517', dot: '#D4901F', soft: '#FAEFDD', text: '#82500A', label: 'Warning' },
  clear:    { strip: '#5DCAA5', dot: '#5DCAA5', soft: '#E6F6EE', text: '#1F6F4F', label: 'Healthy' },
} as const;

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
    <div className="space-y-6">
      <style>{PAGE_STYLES}</style>

      {/* ════════════════════════════════════════════════════════════════
          HEADER — eyebrow + display H1 + new-project CTA
          The headline closes with the canonical purple period.        */}
      <header className="reveal flex items-end justify-between gap-6" style={{ animationDelay: '0ms' }}>
        <div>
          <div className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ppc-text-faint">
            Projects <span className="mx-1.5 text-ppc-text-faint/60">/</span> Last 30 days
          </div>
          <h1 className="mt-2 font-display text-[44px] font-extrabold leading-[1.0] tracking-[-0.028em] text-ppc-ink">
            The roster<span className="text-ppc-purple-500">.</span>
          </h1>
          <p className="mt-2 text-[13px] text-ppc-text-muted">
            {PROJECTS.length} active accounts ·{' '}
            <span className="text-ppc-ink">{attentionCount}</span> need attention ·{' '}
            <span className="text-ppc-ink">{clearCount}</span> all clear
          </p>
        </div>

        <button
          className="group inline-flex items-center gap-2 rounded-[11px] bg-ppc-ink px-4 py-[10px] text-[13px] font-medium text-white shadow-[0_8px_24px_-12px_rgba(127,90,240,0.6)] ring-1 ring-inset ring-white/10 transition-all hover:-translate-y-[1px] hover:shadow-[0_14px_36px_-12px_rgba(127,90,240,0.85)]"
          style={{
            background: 'linear-gradient(135deg, #2a1f4a 0%, #1a1330 55%, #120a24 100%)',
          }}
        >
          <Plus size={13} weight="bold" className="text-ppc-purple-300 transition-transform group-hover:rotate-90" />
          New project
        </button>
      </header>

      {/* ════════════════════════════════════════════════════════════════
          ACT I — DARK INSTRUMENT PANEL
          The KPI moment. Ink card with a purple bloom top-right, hairline
          divider grid, luminous sparklines. This is where dark earns it. */}
      <section
        className="reveal relative overflow-hidden rounded-[20px]"
        style={{
          animationDelay: '70ms',
          background: 'radial-gradient(140% 100% at 50% 0%, #1A1030 0%, #0F0A1E 55%, #0A0617 100%)',
        }}
      >
        {/* Top-right bloom */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-44 h-[440px] w-[440px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(127,90,240,0.32) 0%, rgba(127,90,240,0.06) 40%, transparent 70%)' }}
        />
        {/* Bottom-left dim bloom */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-28 -bottom-44 h-[360px] w-[360px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(127,90,240,0.10) 0%, transparent 65%)' }}
        />
        {/* Grain */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.55]"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)',
            backgroundSize: '3px 3px',
            mixBlendMode: 'overlay',
          }}
        />
        {/* Sheen line at the very top */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-12 top-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(127,90,240,0.55) 45%, rgba(127,90,240,0.85) 50%, rgba(127,90,240,0.55) 55%, transparent 100%)' }}
        />

        <div className="relative grid gap-px bg-white/[0.04]" style={{ gridTemplateColumns: '1.55fr 1fr 1fr 1.2fr' }}>
          {/* Total spend */}
          <KpiCell>
            <KpiEyebrow>Total spend · 30D</KpiEyebrow>
            <div className="mt-3 flex items-baseline gap-2.5">
              <div className="tabular-nums font-display text-[40px] font-bold leading-none tracking-[-0.028em] text-white">
                ${totals.spend.toLocaleString()}
              </div>
              <DeltaPill tone="down" pct={8.2} />
            </div>
            <Sparkline
              points={[16, 13, 15, 11, 13, 10, 12, 8, 11, 7, 10, 6, 8]}
              w={300} h={42} accent="#A88CFF" fill glow
              className="mt-5"
            />
          </KpiCell>

          {/* Conversions */}
          <KpiCell>
            <KpiEyebrow>Conversions</KpiEyebrow>
            <div className="tabular-nums mt-3 font-display text-[32px] font-bold leading-none tracking-[-0.022em] text-white">
              {totals.conv.toLocaleString()}
            </div>
            <div className="mt-5 flex items-baseline gap-2">
              <div className="tabular-nums text-[13px] font-medium text-white/85">
                {Math.round(totals.conv / PROJECTS.length).toLocaleString()}
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/45">
                avg / account
              </div>
            </div>
          </KpiCell>

          {/* Open findings */}
          <KpiCell>
            <KpiEyebrow>Open findings</KpiEyebrow>
            <div className="tabular-nums mt-3 font-display text-[32px] font-bold leading-none tracking-[-0.022em] text-white">
              {totals.findings}
            </div>
            <div className="mt-5 flex items-center gap-3 text-[11.5px]">
              <span className="inline-flex items-center gap-1.5">
                <Dot color="#F87171" size={6} glow />
                <span className="tabular-nums font-medium text-[#fca5a5]">{totals.critFindings}</span>
                <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-white/40">crit</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Dot color="#FBBF24" size={6} glow />
                <span className="tabular-nums font-medium text-[#fde68a]">{totals.warnFindings}</span>
                <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-white/40">warn</span>
              </span>
            </div>
          </KpiCell>

          {/* Account state — dist bars */}
          <KpiCell>
            <KpiEyebrow>Account state</KpiEyebrow>
            <div className="mt-3 flex items-end gap-1.5" style={{ height: 40 }}>
              <DistBar count={totals.stateCounts.critical} max={Math.max(...Object.values(totals.stateCounts))} color="#F87171" label="crit" />
              <DistBar count={totals.stateCounts.warning}  max={Math.max(...Object.values(totals.stateCounts))} color="#FBBF24" label="warn" />
              <DistBar count={totals.stateCounts.clear}    max={Math.max(...Object.values(totals.stateCounts))} color="#5DCAA5" label="clear" />
              <div className="ml-3 flex flex-col justify-end gap-[5px] pb-[3px] text-[10px]">
                <span className="font-mono uppercase tracking-[0.12em] text-white/50">
                  <span className="tabular-nums font-semibold text-white">{totals.stateCounts.critical}</span> crit
                </span>
                <span className="font-mono uppercase tracking-[0.12em] text-white/50">
                  <span className="tabular-nums font-semibold text-white">{totals.stateCounts.warning}</span> warn
                </span>
                <span className="font-mono uppercase tracking-[0.12em] text-white/50">
                  <span className="tabular-nums font-semibold text-white">{totals.stateCounts.clear}</span> clear
                </span>
              </div>
            </div>
          </KpiCell>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          ACT II — LIGHT LEDGER (Surface 04)
          White card on lavender. Status communicates via 3px left strip,
          NEVER a full tint. Hairline lavender row dividers.            */}
      <section
        className="reveal overflow-hidden rounded-[16px] bg-ppc-card"
        style={{
          animationDelay: '140ms',
          border: '0.5px solid #d9d4ec',
        }}
      >
        {/* Filter row */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ppc-canvas px-6 py-4">
          <div className="flex items-center gap-1">
            <FilterTab active={tab === 'attention'} onClick={() => setTab('attention')} label="Needs attention" count={attentionCount} />
            <FilterTab active={tab === 'clear'}     onClick={() => setTab('clear')}     label="All clear"       count={clearCount} />
            <FilterTab active={tab === 'all'}       onClick={() => setTab('all')}       label="All"             count={PROJECTS.length} />
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <MagnifyingGlass size={13} weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-ppc-text-faint" />
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Search clients"
                className="w-[180px] rounded-[9px] border border-ppc-canvas bg-[#FAF9FD] py-[8px] pl-9 pr-3 text-[12.5px] font-medium tracking-tight text-ppc-ink outline-none transition-all placeholder:text-ppc-text-faint focus:border-ppc-purple-500/45 focus:bg-white focus:ring-[3px] focus:ring-ppc-purple-500/10"
              />
            </div>
            <button className="inline-flex items-center gap-1.5 rounded-[9px] border border-ppc-canvas bg-[#FAF9FD] px-3.5 py-[8px] text-[12.5px] font-medium tracking-tight text-ppc-ink transition-colors hover:border-ppc-purple-300/50 hover:bg-white">
              Last 30d
              <CaretDown size={11} weight="bold" className="text-ppc-text-faint" />
            </button>
          </div>
        </div>

        {/* Table */}
        <table className="w-full table-fixed border-collapse">
          <colgroup>
            <col style={{ width: '38%' }} />
            <col style={{ width: '14%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '11%' }} />
            <col style={{ width: '12%' }} />
          </colgroup>
          <thead>
            <tr className="border-b border-ppc-canvas bg-[#FBFAFE]">
              <Th align="left" first>Client</Th>
              <Th align="left">30D trend</Th>
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
              const tone = TONE[m.tone];
              return (
                <tr
                  key={p.id}
                  className={`row reveal-row group tone-${m.tone}`}
                  style={{ animationDelay: `${220 + i * 36}ms` }}
                >
                  {/* Client cell — status strip is implemented via inset
                      box-shadow on this td so colgroup width math stays
                      stable across browsers. */}
                  <Td first last={isLast}>
                    <Link to={`/projects/${p.id}`} className="relative flex items-center gap-3.5">
                      <Avatar bg={m.avatarBg} fg={m.avatarFg}>{p.name.charAt(0)}</Avatar>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14.5px] font-medium tracking-[-0.005em] text-ppc-ink">
                          {p.name}
                        </span>
                        <span className="mt-[2px] flex items-center gap-1.5 text-[11.5px] text-ppc-text-muted">
                          <span>{p.industry}</span>
                          <span className="text-ppc-text-faint/60">·</span>
                          <span>{p.accountCount} {p.accountCount === 1 ? 'account' : 'accts'}</span>
                          {m.tone !== 'clear' && (
                            <>
                              <span className="text-ppc-text-faint/60">·</span>
                              <span
                                className="inline-flex items-center gap-1 rounded-[5px] px-[6px] py-[2px] font-mono text-[9.5px] font-semibold uppercase tracking-[0.1em]"
                                style={{ background: tone.soft, color: tone.text }}
                              >
                                <Dot color={tone.dot} size={5} />
                                {tone.label}
                              </span>
                            </>
                          )}
                        </span>
                      </span>
                    </Link>
                  </Td>

                  <Td last={isLast}>
                    <div className="flex items-center gap-2">
                      <Sparkline points={m.spark} w={84} h={26} accent="#7F5AF0" stroke={1.4} />
                      <TrendChip trend={m.trend} pct={m.trendPct} />
                    </div>
                  </Td>

                  <Td align="right" last={isLast}>
                    <div className="tabular-nums text-[14.5px] font-medium text-ppc-ink">
                      ${m.spend.toLocaleString()}
                    </div>
                    <div className="ml-auto mt-[5px] h-[3px] w-[110px] overflow-hidden rounded-full bg-ppc-canvas">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.max(4, (m.spend / maxSpend) * 100)}%`,
                          background: 'linear-gradient(90deg, #534AB7 0%, #7F5AF0 60%, #A88CFF 100%)',
                        }}
                      />
                    </div>
                  </Td>

                  <Td align="right" last={isLast}>
                    <div className="tabular-nums text-[14.5px] font-medium text-ppc-ink">
                      {m.conv.toLocaleString()}
                    </div>
                  </Td>

                  <Td align="right" last={isLast}>
                    <div className="tabular-nums text-[14.5px] font-medium text-ppc-ink">
                      ${m.cpa.toFixed(2)}
                    </div>
                  </Td>

                  <Td align="right" last={isLast}>
                    {m.findings > 0 ? (
                      <span
                        className="tabular-nums inline-flex items-center gap-[7px] rounded-[6px] px-2 py-[3px] text-[13px] font-semibold"
                        style={{ background: tone.soft, color: tone.text }}
                      >
                        {m.findings}
                        <ArrowRight size={11} weight="bold" className="transition-transform duration-200 group-hover:translate-x-[2px]" />
                      </span>
                    ) : (
                      <span className="text-[12px] text-ppc-text-faint">— Clear</span>
                    )}
                  </Td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-7 py-14 text-center text-[13.5px] text-ppc-text-muted">
                  No clients match &ldquo;{filter}&rdquo;.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-ppc-canvas bg-[#FBFAFE] px-6 py-3">
          <p className="text-[11.5px] text-ppc-text-muted">
            Showing <span className="tabular-nums font-medium text-ppc-ink">{filtered.length}</span> of <span className="tabular-nums font-medium text-ppc-ink">{PROJECTS.length}</span> ·{' '}
            <span className="font-mono uppercase tracking-[0.1em] text-ppc-text-faint">sorted by attention</span>
          </p>
          <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ppc-text-faint">
            ⌘K to search
          </span>
        </div>
      </section>
    </div>
  );
}

/* ─── Subcomponents ─────────────────────────────────────────────────── */

function KpiCell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative bg-[#0F0A1E] px-7 py-7">{children}</div>
  );
}

function KpiEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-white/45">
      {children}
    </div>
  );
}

function DeltaPill({ tone, pct }: { tone: 'up' | 'down' | 'flat'; pct: number }) {
  const palette = tone === 'down'
    ? { fg: '#FCA5A5', bg: 'rgba(248,113,113,0.12)', Icon: ArrowDown }
    : tone === 'up'
    ? { fg: '#86EFAC', bg: 'rgba(134,239,172,0.12)', Icon: ArrowUp }
    : { fg: '#CBD5E1', bg: 'rgba(203,213,225,0.10)', Icon: Minus };
  return (
    <span
      className="tabular-nums inline-flex items-center gap-1 rounded-[6px] px-[7px] py-[3px] text-[11px] font-semibold"
      style={{ color: palette.fg, background: palette.bg }}
    >
      <palette.Icon size={10} weight="bold" />
      {pct.toFixed(1)}%
    </span>
  );
}

function TrendChip({ trend, pct }: { trend: 'up' | 'down' | 'flat'; pct?: number }) {
  if (trend === 'flat' || pct === undefined) {
    return (
      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ppc-text-faint">flat</span>
    );
  }
  const palette = trend === 'up'
    ? { fg: '#1F6F4F', Icon: ArrowUp }
    : { fg: '#9F2624', Icon: ArrowDown };
  return (
    <span
      className="tabular-nums inline-flex items-center gap-0.5 text-[11px] font-semibold"
      style={{ color: palette.fg }}
    >
      <palette.Icon size={9} weight="bold" />
      {pct.toFixed(1)}%
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
        'inline-flex items-center gap-2 rounded-[9px] px-3 py-[7px] text-[12.5px] font-medium tracking-tight transition-all duration-200',
        active
          ? 'bg-ppc-ink text-white'
          : 'text-ppc-text-muted hover:bg-ppc-canvas hover:text-ppc-ink',
      ].join(' ')}
    >
      {label}
      <span
        className={[
          'tabular-nums rounded-[4px] px-[6px] py-px text-[10.5px] font-semibold leading-none',
          active ? 'bg-white/15 text-white' : 'text-ppc-text-faint',
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
        'font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ppc-text-faint',
        align === 'right' ? 'text-right' : 'text-left',
        first ? 'pl-6 pr-2' : '',
        lastCol ? 'pl-2 pr-6' : '',
        !first && !lastCol ? 'px-2' : '',
        'pb-3 pt-3',
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
      className="grid h-[32px] w-[32px] shrink-0 place-items-center rounded-[8px] text-[13.5px] font-semibold leading-none"
      style={{
        background: bg,
        color: fg,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -1px 0 rgba(0,0,0,0.14)',
      }}
    >
      {children}
    </span>
  );
}

function Dot({ color, size = 5, glow = false }: { color: string; size?: number; glow?: boolean }) {
  return (
    <span
      className="inline-block rounded-full"
      style={{
        width: size,
        height: size,
        background: color,
        boxShadow: glow ? `0 0 6px ${color}80` : undefined,
      }}
    />
  );
}

/* Sparkline — stroke path, optional soft fill area, optional glow.
 * `glow` adds an inner drop-shadow to make the line read on dark ink. */
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
            <stop offset="0%" stopColor={accent} stopOpacity="0.42" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </linearGradient>
        )}
        {glow && (
          <filter id={glowId} x="-20%" y="-50%" width="140%" height="200%">
            <feGaussianBlur stdDeviation="0.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>
      {fill && <path d={fillPath} fill={`url(#${gradId})`} stroke="none" />}
      <path
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

function DistBar({ count, max, color, label }: { count: number; max: number; color: string; label: string }) {
  const h = max === 0 ? 6 : Math.max(8, (count / max) * 40);
  return (
    <div
      className="w-[22px] rounded-[3px]"
      style={{
        height: `${h}px`,
        background: count === 0
          ? `${color}26`
          : `linear-gradient(180deg, ${color} 0%, ${color}cc 100%)`,
        boxShadow: count > 0 ? `0 0 14px -2px ${color}55` : 'none',
        opacity: count === 0 ? 0.5 : 1,
      }}
      title={`${count} ${label}`}
    />
  );
}

/* ─── Page styles ──────────────────────────────────────────────────────
 * Reveal animations + the status strip on rows (implemented as a 3px
 * inset box-shadow on the first cell — colgroup math stays stable). */
const PAGE_STYLES = `
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

  .row {
    transition: background-color 0.18s ease;
    border-bottom: 1px solid #ECEAFA;
  }
  .row:last-child { border-bottom: none; }
  .row > td:first-child {
    transition: box-shadow 0.25s cubic-bezier(0.22, 0.9, 0.32, 1);
  }

  .row.tone-critical > td:first-child { box-shadow: inset 3px 0 0 #E24B4A; }
  .row.tone-warning  > td:first-child { box-shadow: inset 3px 0 0 #BA7517; }
  .row.tone-clear    > td:first-child { box-shadow: inset 3px 0 0 transparent; }

  .row.tone-critical { background-color: rgba(226, 75, 74, 0.025); }
  .row.tone-warning  { background-color: rgba(186, 117, 23, 0.020); }

  .row:hover { background-color: rgba(127, 90, 240, 0.04); }
  .row.tone-critical:hover { background-color: rgba(226, 75, 74, 0.06); }
  .row.tone-warning:hover  { background-color: rgba(186, 117, 23, 0.05); }

  .row:hover > td:first-child {
    box-shadow: inset 3px 0 0 #7F5AF0;
  }
  .row.tone-critical:hover > td:first-child {
    box-shadow: inset 3px 0 0 #E24B4A, inset 14px 0 28px -18px rgba(226, 75, 74, 0.35);
  }
  .row.tone-warning:hover > td:first-child {
    box-shadow: inset 3px 0 0 #BA7517, inset 14px 0 28px -18px rgba(186, 117, 23, 0.30);
  }
`;
