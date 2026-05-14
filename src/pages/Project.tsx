import { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import {
  ArrowRight, ArrowUp, ArrowDown, Lightning, Sun, Moon, DotsThree,
  ClipboardText, FunnelSimple, Target, Crosshair, Broadcast,
  ShoppingCartSimple, PencilSimple, FileText, ChatCircleDots,
  ArrowUpRight, Command,
} from '@phosphor-icons/react';
import { PROJECTS } from '../mock/projects';

// Project detail · /projects/:id
//
// Faithful port of Stewart's reference mockup. Six sections, top to bottom:
//   1. Breadcrumb + connection status + run-agent CTA
//   2. Hero — avatar + name + industry + critical/warn pill
//   3. Tabs row (Overview default; others stubbed)
//   4. "What should we work on?" — agent grid (8 specialists)
//   5. Recent activity — 5 findings rows w/ money + status
//   6. Performance KPI quad + Daily spend trend chart
//   7. Campaigns — Top performers vs Needs attention
//   8. "Ask about X" command bar
//
// Theme: light + dark toggle at top-right, same pattern as /projects.

type Theme = 'light' | 'dark';

// ─── Mock data ─────────────────────────────────────────────────────────
const AGENT_CARDS = [
  { slug: 'account-audit',     icon: ClipboardText,      title: 'Account audit',     sub: 'Full 312-point sweep' },
  { slug: 'negative-keyword',  icon: FunnelSimple,       title: 'Negative keywords', sub: 'Search term mining' },
  { slug: 'landing-page',      icon: Target,             title: 'Landing pages',     sub: 'CRO + message match' },
  { slug: 'pmax',              icon: Crosshair,          title: 'PMAX advisor',      sub: 'Asset group tuning' },
  { slug: 'competitor-spy',    icon: Broadcast,          title: 'Competitive intel', sub: 'Track competitor shifts' },
  { slug: 'shopping-feed',     icon: ShoppingCartSimple, title: 'Shopping audit',    sub: 'Feed + structure' },
  { slug: 'ad-copy',           icon: PencilSimple,       title: 'Ad copy analyst',   sub: 'RSA strength check' },
  { slug: 'client-reporting',  icon: FileText,           title: 'Client briefing',   sub: 'Weekly summary' },
] as const;

type FindingTone = 'critical' | 'warning' | 'idle';
interface Finding {
  tone: FindingTone;
  title: string;
  source: string;
  meta: string;
  rightTop: string;
  rightTopColor: string;
  rightBottom: string;
  failedBadge?: boolean;
}
const FINDINGS: Finding[] = [
  {
    tone: 'critical',
    title: 'ROAS reading 0.00x across all 152 campaigns',
    source: 'Tracking Audit',
    meta: '4h ago · GA4 value imports stopped Apr 27',
    rightTop: 'Critical fix',
    rightTopColor: 'text-[#f87171]',
    rightBottom: 'tracking broken',
  },
  {
    tone: 'warning',
    title: 'Wasted spend in non-converting search terms',
    source: 'Search Term Audit',
    meta: '2h ago · 47 negative candidates surfaced',
    rightTop: '$4,200/mo',
    rightTopColor: 'text-[#22c55e]',
    rightBottom: 'recoverable',
  },
  {
    tone: 'warning',
    title: 'CPA up 43% in or_sud_search',
    source: 'CPA Monitor',
    meta: '1d ago · $76 to $109 week over week',
    rightTop: '$1,200/mo',
    rightTopColor: 'text-[#fbbf24]',
    rightBottom: 'at risk',
  },
  {
    tone: 'warning',
    title: '3 PMAX assets rated "Poor"',
    source: 'PMAX Asset Review',
    meta: '5h ago · headline and description swaps recommended',
    rightTop: 'CTR uplift',
    rightTopColor: '',
    rightBottom: 'est. 0.4–0.8pp',
  },
  {
    tone: 'idle',
    title: 'Wasted Spend Finder',
    source: '',
    meta: '5d ago · conversion data returned 0 results · retry available',
    rightTop: 'Retry',
    rightTopColor: 'text-[#7c6dff]',
    rightBottom: '',
    failedBadge: true,
  },
];

interface KpiCard {
  label: string;
  value: string;
  delta: string;
  deltaTone: 'down-good' | 'up-good' | 'up-bad' | 'flat';
  spark: number[];
  sparkColor: string;
}
const KPI_CARDS: KpiCard[] = [
  { label: 'Spend',       value: '$87,575', delta: '132.8%', deltaTone: 'up-bad',   spark: [12,10,14,10,9,8,11,9,8,7], sparkColor: '#8a7dff' },
  { label: 'Conversions', value: '1,118',   delta: '193.1%', deltaTone: 'up-good',  spark: [16,15,13,12,11,10,9,8,7,6], sparkColor: '#8a7dff' },
  { label: 'CPA',         value: '$78.27',  delta: '20.5%',  deltaTone: 'down-good',spark: [8,9,10,11,12,13,14,15,16,17], sparkColor: '#8a7dff' },
  { label: 'CTR',         value: '3.42%',   delta: '-0.3%',  deltaTone: 'flat',     spark: [12,12,11,12,12,11,12,11,12,11], sparkColor: '#8a7dff' },
];

// 28-point daily series for the Daily spend trend chart.
const SPEND_TREND = [
  4000, 4600, 5200, 5600, 5400, 5300, 5500, 5400, 5100, 4700, 4400, 4500, 5000, 5300,
  5500, 5400, 5300, 5500, 5800, 6200, 6800, 7200, 7000, 6500, 5800, 5200, 4700, 4300,
];

interface Campaign {
  name: string; spend: string; conv: string; cpa: string; cpaTone: 'good' | 'bad' | 'neutral';
  is: string;
  spark: number[]; sparkColor: string;
}
const TOP_CAMPAIGNS: Campaign[] = [
  { name: 'oh_brand_search', spend: '$5,274', conv: '126 conv', cpa: '$42',  cpaTone: 'good',    is: '18% IS', spark: [10,9,8,9,7,8,6,7],  sparkColor: '#22C55E' },
  { name: 'or_brand_search', spend: '$4,810', conv: '56 conv',  cpa: '$86',  cpaTone: 'neutral', is: '93% IS', spark: [11,10,9,8,7,6,6,5], sparkColor: '#22C55E' },
  { name: 'wa_brand_search', spend: '$5,453', conv: '55 conv',  cpa: '$99',  cpaTone: 'neutral', is: '85% IS', spark: [10,9,10,8,9,7,8,6], sparkColor: '#22C55E' },
  { name: 'oh_sud_search',   spend: '$5,362', conv: '87 conv',  cpa: '$62',  cpaTone: 'neutral', is: '15% IS', spark: [9,10,8,9,7,9,7,8],  sparkColor: '#8057FF' },
];
const BAD_CAMPAIGNS: Campaign[] = [
  { name: 'nm_sud_search',   spend: '$2,603', conv: '9 conv',  cpa: '$289', cpaTone: 'bad',     is: '41% IS',      spark: [6,7,8,9,10,11,12,13],  sparkColor: '#EF4444' },
  { name: 'nc_brand_search', spend: '$5,043', conv: '28 conv', cpa: '$180', cpaTone: 'bad',     is: '84% IS',      spark: [7,8,9,10,11,11,12,12], sparkColor: '#EF4444' },
  { name: 'co_sud_search',   spend: '$2,990', conv: '19 conv', cpa: '$157', cpaTone: 'bad',     is: '19% IS',      spark: [9,10,10,11,12,12,13,13], sparkColor: '#EF4444' },
  { name: 'wa_sud_video',    spend: '$1,926', conv: '33 conv', cpa: '$58',  cpaTone: 'neutral', is: '13k clicks',  spark: [8,9,9,10,11,12,13,14], sparkColor: '#FBBF24' },
];

// ─── Theme tokens ──────────────────────────────────────────────────────
function tokens(theme: Theme) {
  const dark = theme === 'dark';
  return {
    dark,
    pageBg:     dark ? 'bg-[#0a0a0f]'     : 'bg-transparent',
    pageRing:   dark ? 'border border-[#1a1a22]' : '',
    pageRadius: dark ? 'rounded-[14px]'   : '',
    pagePad:    dark ? 'px-7 py-7'        : '',

    fgPrimary:  dark ? 'text-white'       : 'text-ppc-black',
    fgBody:     dark ? 'text-[#b8b8c0]'   : 'text-ppc-neutral-700',
    fgMuted:    dark ? 'text-[#7a7a86]'   : 'text-ppc-neutral-500',
    fgDim:      dark ? 'text-[#5a5a66]'   : 'text-ppc-neutral-400',
    fgEyebrow:  dark ? 'text-[#6a6a76]'   : 'text-ppc-neutral-500',

    cardBg:       dark ? 'bg-[#101016]'                 : 'bg-white',
    cardBorder:   dark ? 'border-[#1a1a22]'             : 'border-ppc-neutral-100',
    rowBorder:    dark ? 'border-[#14141a]'             : 'border-ppc-neutral-100',
    cardHover:    dark ? 'hover:border-[#2a2a36]'       : 'hover:border-ppc-purple-200',

    rowHover:     dark ? 'hover:bg-white/[0.02]'        : 'hover:bg-ppc-neutral-25',
    rowHighlight: dark ? 'bg-[rgba(124,109,255,0.05)]'  : 'bg-ppc-purple-50/40',

    iconChipBg: dark ? 'bg-[rgba(124,109,255,0.12)]' : 'bg-ppc-purple-50',
    iconChipFg: dark ? 'text-[#a89fff]'              : 'text-ppc-purple-500',

    purpleLink: dark ? 'text-[#a89fff]' : 'text-ppc-purple-500',

    kbdBg:     dark ? 'bg-[rgba(255,255,255,0.06)]' : 'bg-ppc-neutral-50',
    kbdBorder: dark ? 'border-[#2a2a36]'             : 'border-ppc-neutral-200',
    kbdFg:     dark ? 'text-[#b8b8c0]'              : 'text-ppc-neutral-600',

    segmentBg:        dark ? 'bg-[rgba(255,255,255,0.04)]' : 'bg-ppc-neutral-50',
    segmentActiveBg:  dark ? 'bg-[#1f1f28]'                : 'bg-white',
    segmentActiveFg:  dark ? 'text-white'                  : 'text-ppc-black',
    segmentInactiveFg:dark ? 'text-[#7a7a86]'              : 'text-ppc-neutral-500',
    segmentBorder:    dark ? 'border-[#2a2a36]'            : 'border-ppc-neutral-200',

    tabActiveFg:   dark ? 'text-white'      : 'text-ppc-black',
    tabInactiveFg: dark ? 'text-[#7a7a86]'  : 'text-ppc-neutral-500',
    tabBorder:     dark ? 'border-[#1a1a22]' : 'border-ppc-neutral-100',

    pillCritBg:     dark ? 'bg-[rgba(239,68,68,0.12)]'      : 'bg-ppc-error/10',
    pillCritFg:     dark ? 'text-[#fca5a5]'                 : 'text-ppc-error',
    pillCritBorder: dark ? 'border-[rgba(239,68,68,0.25)]'  : 'border-ppc-error/20',

    statusOk:    dark ? 'text-[#7a7a86]' : 'text-ppc-neutral-500',

    chartGrid:  dark ? '#1a1a22' : '#E5E5F9',
    chartAxis:  dark ? '#5a5a66' : '#80809C',
    chartLine:  dark ? '#8a7dff' : '#8057FF',
  };
}

// ─── Page ──────────────────────────────────────────────────────────────
export function ProjectPage() {
  const { id } = useParams();
  const project = PROJECTS.find((p) => p.id === id);
  const [theme, setTheme] = useState<Theme>('light');
  const t = tokens(theme);

  if (!project) return <Navigate to="/projects" replace />;

  const avatarMap: Record<string, { bg: string; fg: string }> = {
    'boulder-care':       { bg: '#22C55E', fg: '#052E16' },
    'the-hoth':           { bg: '#EF4444', fg: '#450A0A' },
    'durable':            { bg: '#14B8A6', fg: '#042F2C' },
    'linkbuilder':        { bg: '#65D6A1', fg: '#053723' },
    'livingyoung':        { bg: '#3B82F6', fg: '#0B1F4F' },
    'authority-builders': { bg: '#5B7CF8', fg: '#0E1A4D' },
    'edwin-novel':        { bg: '#D946A8', fg: '#3F0D2E' },
    'flock':              { bg: '#C08A2E', fg: '#3A2406' },
  };
  const avatar = avatarMap[project.id] ?? { bg: '#8057FF', fg: '#FFFFFF' };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <ThemeToggle theme={theme} onChange={setTheme} />
      </div>

      <div className={`${t.pageBg} ${t.pageRing} ${t.pageRadius} ${t.pagePad}`}>
        {/* ─── 1. Breadcrumb + connection + dots ───────────────────── */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-[13px]">
            <span className="grid h-7 w-7 place-items-center rounded-[6px] bg-ppc-purple-500 text-[12px] font-bold text-white">io</span>
            <Link to="/projects" className={`font-medium ${t.fgMuted}`}>Projects</Link>
            <span className={t.fgDim}>/</span>
            <span className={`font-medium ${t.fgPrimary}`}>{project.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 text-[12px] ${t.statusOk}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
              Connected
              <span className={t.fgDim}>·</span>
              synced 4m
            </span>
            <button className={`grid h-7 w-7 place-items-center rounded-[6px] ${t.fgMuted} ${t.rowHover}`}>
              <DotsThree size={16} weight="bold" />
            </button>
          </div>
        </div>

        {/* ─── 2. Hero ──────────────────────────────────────────────── */}
        <header className="mt-6 flex items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div
              className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-[12px] text-[34px] font-medium"
              style={{ background: avatar.bg, color: avatar.fg }}
            >
              {project.name.charAt(0)}
            </div>
            <div className="pt-1">
              <h1 className={`text-[36px] font-bold leading-[1] tracking-[-0.02em] ${t.fgPrimary}`}>
                {project.name}
              </h1>
              <div className={`mt-2 flex flex-wrap items-center gap-3 text-[13.5px] ${t.fgMuted}`}>
                <span>{project.industry}</span>
                <span className={t.fgDim}>·</span>
                <span>Lead gen</span>
                <span
                  className={`ml-1 inline-flex items-center gap-1.5 rounded-pill border ${t.pillCritBorder} ${t.pillCritBg} px-2.5 py-1 text-[12px] font-medium ${t.pillCritFg}`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#ef4444]" />
                  1 critical
                  <span className="text-[#7a7a86]">·</span>
                  3 warnings
                </span>
              </div>
            </div>
          </div>
          <button className={`inline-flex items-center gap-2 rounded-[10px] border px-4 py-2.5 text-[13.5px] font-medium ${t.cardBorder} ${t.fgPrimary} ${t.cardHover}`}>
            <Lightning size={14} weight="fill" className={t.iconChipFg} />
            Run agent
          </button>
        </header>

        {/* ─── 3. Tabs ──────────────────────────────────────────────── */}
        <div className={`mt-7 border-b ${t.tabBorder}`}>
          <nav className="flex items-center gap-7 text-[13.5px]">
            <Tab t={t} active>Overview</Tab>
            <Tab t={t}>Business context</Tab>
            <Tab t={t}>Competitors</Tab>
            <Tab t={t}>AI instructions</Tab>
            <Tab t={t}>Reports</Tab>
            <Tab t={t}>Settings</Tab>
          </nav>
        </div>

        {/* ─── 4. What should we work on? ──────────────────────────── */}
        <section className="mt-9">
          <h2 className={`text-[26px] font-bold leading-none tracking-[-0.015em] ${t.fgPrimary}`}>
            What should we work on?
          </h2>
          <p className={`mt-2 flex items-center gap-2 text-[13px] ${t.fgMuted}`}>
            Launch a specialist, or hit
            <Kbd t={t}><Command size={10} weight="bold" />K</Kbd>
            to ask anything
          </p>

          <div className="mt-6 flex items-end justify-between">
            <div className={`font-mono text-[10.5px] font-medium uppercase tracking-[0.16em] ${t.fgEyebrow}`}>
              Agents
            </div>
            <Link to="/agents" className={`inline-flex items-center gap-1 text-[12.5px] font-semibold ${t.purpleLink}`}>
              All 14 agents <ArrowRight size={11} weight="bold" />
            </Link>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
            {AGENT_CARDS.map((a) => {
              const Icon = a.icon;
              return (
                <Link
                  key={a.slug}
                  to={`/agents/${a.slug}`}
                  className={`group rounded-[12px] border ${t.cardBorder} ${t.cardBg} p-4 transition-colors ${t.cardHover}`}
                >
                  <div className={`flex h-9 w-9 items-center justify-center rounded-[8px] ${t.iconChipBg}`}>
                    <Icon size={17} weight="duotone" className={t.iconChipFg} />
                  </div>
                  <div className={`mt-7 text-[14.5px] font-semibold leading-tight tracking-tight ${t.fgPrimary}`}>
                    {a.title}
                  </div>
                  <div className={`mt-1 text-[12px] ${t.fgMuted}`}>
                    {a.sub}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ─── 5. Recent activity ──────────────────────────────────── */}
        <section className="mt-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className={`text-[22px] font-bold leading-none tracking-[-0.015em] ${t.fgPrimary}`}>
                Recent activity
              </h2>
              <p className={`mt-2 text-[12.5px] ${t.fgMuted}`}>
                <span className="tabular">4</span> open findings · est.
                <span className="tabular ml-1 font-medium text-[#22c55e]">$5,400/mo</span>
                <span className="ml-1">recoverable</span>
              </p>
            </div>
            <Link to="/reports/run-competitor-spy-completed" className={`inline-flex items-center gap-1 text-[12.5px] font-semibold ${t.purpleLink}`}>
              View all <ArrowRight size={11} weight="bold" />
            </Link>
          </div>

          <div className={`mt-4 overflow-hidden rounded-[12px] border ${t.cardBorder} ${t.cardBg}`}>
            {FINDINGS.map((f, i) => {
              const dotColor =
                f.tone === 'critical' ? '#ef4444' :
                f.tone === 'warning'  ? '#fbbf24' :
                                        '#5a5a66';
              const isLast = i === FINDINGS.length - 1;
              const highlight = i === 0;
              return (
                <div
                  key={i}
                  className={[
                    'flex items-center gap-4 px-5 py-4',
                    !isLast ? `border-b ${t.rowBorder}` : '',
                    highlight ? t.rowHighlight : '',
                  ].join(' ')}
                >
                  <span
                    className="h-[7px] w-[7px] shrink-0 rounded-full"
                    style={{
                      background: dotColor,
                      boxShadow: f.tone === 'critical' ? '0 0 0 3px rgba(239,68,68,0.18)' : 'none',
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className={`flex items-center gap-2 text-[14px] font-semibold ${t.fgPrimary}`}>
                      <span className="truncate">{f.title}</span>
                      {f.failedBadge && (
                        <span className={`rounded-[5px] border ${t.pillCritBorder} ${t.pillCritBg} px-1.5 py-px text-[10.5px] font-medium ${t.pillCritFg}`}>
                          Failed
                        </span>
                      )}
                    </div>
                    <div className={`mt-1 text-[12px] ${t.fgMuted}`}>
                      {f.source && <span>{f.source}</span>}
                      {f.source && <span className={`mx-1.5 ${t.fgDim}`}>·</span>}
                      {f.meta}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`tabular text-[13.5px] font-semibold ${f.rightTopColor || t.fgPrimary}`}>
                      {f.rightTop}
                    </div>
                    {f.rightBottom && (
                      <div className={`text-[11.5px] ${t.fgMuted}`}>{f.rightBottom}</div>
                    )}
                  </div>
                  <ArrowRight size={12} weight="bold" className={t.fgDim} />
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── 6. Performance ──────────────────────────────────────── */}
        <section className="mt-12">
          <div className="flex items-end justify-between gap-4">
            <h2 className={`text-[22px] font-bold leading-none tracking-[-0.015em] ${t.fgPrimary}`}>
              Performance
            </h2>
            <span className={`text-[12px] ${t.fgMuted}`}>last 30 days vs prior</span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            {KPI_CARDS.map((k) => {
              const deltaColor =
                k.deltaTone === 'down-good' ? 'text-[#22c55e]' :
                k.deltaTone === 'up-good'   ? 'text-[#22c55e]' :
                k.deltaTone === 'up-bad'    ? 'text-[#f87171]' :
                                              t.fgMuted;
              return (
                <div key={k.label} className={`rounded-[12px] border ${t.cardBorder} ${t.cardBg} px-4 py-4`}>
                  <div className={`font-mono text-[10px] font-medium uppercase tracking-[0.12em] ${t.fgEyebrow}`}>
                    {k.label}
                  </div>
                  <div className={`tabular mt-2.5 text-[26px] font-bold leading-none tracking-[-0.015em] ${t.fgPrimary}`}>
                    {k.value}
                  </div>
                  <div className={`tabular mt-2 inline-flex items-center gap-1 text-[12px] font-medium ${deltaColor}`}>
                    {k.deltaTone === 'up-good' || k.deltaTone === 'up-bad'   ? <ArrowUp size={10} weight="bold" /> :
                     k.deltaTone === 'down-good'                              ? <ArrowDown size={10} weight="bold" /> :
                                                                                <ArrowRight size={10} weight="bold" />}
                    {k.delta}
                  </div>
                  <Sparkline points={k.spark} w={170} h={26} accent={k.sparkColor} className="mt-3" />
                </div>
              );
            })}
          </div>

          <DailyTrendChart t={t} theme={theme} data={SPEND_TREND} />
        </section>

        {/* ─── 7. Campaigns ────────────────────────────────────────── */}
        <section className="mt-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className={`text-[22px] font-bold leading-none tracking-[-0.015em] ${t.fgPrimary}`}>
                Campaigns
              </h2>
              <p className={`mt-2 text-[12.5px] ${t.fgMuted}`}>
                <span className="tabular">152</span> total · <span className="tabular">8</span> types
              </p>
            </div>
            <Link to="#" className={`inline-flex items-center gap-1 text-[12.5px] font-semibold ${t.purpleLink}`}>
              View all <ArrowRight size={11} weight="bold" />
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
            <CampaignCard t={t} title="Top performers" tone="good" items={TOP_CAMPAIGNS} />
            <CampaignCard t={t} title="Needs attention" tone="bad" items={BAD_CAMPAIGNS} />
          </div>
        </section>

        {/* ─── 8. Command bar ──────────────────────────────────────── */}
        <div className={`mt-10 flex items-center gap-3 rounded-[12px] border ${t.cardBorder} ${t.cardBg} px-4 py-3.5`}>
          <ChatCircleDots size={16} weight="duotone" className={t.iconChipFg} />
          <span className={`flex-1 text-[13.5px] ${t.fgMuted}`}>
            Ask about <span className={t.fgBody}>{project.name}</span> · try "where am I wasting spend?"
          </span>
          <Kbd t={t}><Command size={10} weight="bold" />K</Kbd>
        </div>
      </div>
    </div>
  );
}

// ─── Subcomponents ─────────────────────────────────────────────────────

type Tokens = ReturnType<typeof tokens>;

function ThemeToggle({ theme, onChange }: { theme: Theme; onChange: (t: Theme) => void }) {
  const isDark = theme === 'dark';
  return (
    <div className="inline-flex items-center gap-1 rounded-pill border border-ppc-neutral-200 bg-white p-[3px] shadow-ppc-sm">
      <button
        onClick={() => onChange('light')}
        className={`inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-[11px] font-semibold tracking-tight transition-colors ${
          !isDark ? 'bg-ppc-black text-white' : 'text-ppc-neutral-500 hover:text-ppc-black'
        }`}
      >
        <Sun size={11} weight="bold" /> Light
      </button>
      <button
        onClick={() => onChange('dark')}
        className={`inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-[11px] font-semibold tracking-tight transition-colors ${
          isDark ? 'bg-ppc-black text-white' : 'text-ppc-neutral-500 hover:text-ppc-black'
        }`}
      >
        <Moon size={11} weight="bold" /> Dark
      </button>
    </div>
  );
}

function Tab({ children, active = false, t }: { children: React.ReactNode; active?: boolean; t: Tokens }) {
  return (
    <button
      className={`relative -mb-px border-b-2 pb-3 pt-1 text-[13.5px] font-medium transition-colors ${
        active
          ? `${t.tabActiveFg} border-[#7c6dff]`
          : `${t.tabInactiveFg} border-transparent`
      }`}
    >
      {children}
    </button>
  );
}

function Kbd({ t, children }: { t: Tokens; children: React.ReactNode }) {
  return (
    <kbd className={`inline-flex items-center gap-[2px] rounded-[5px] border ${t.kbdBorder} ${t.kbdBg} px-1.5 py-0.5 font-mono text-[10.5px] font-medium ${t.kbdFg}`}>
      {children}
    </kbd>
  );
}

function Sparkline({
  points, w, h, accent, className = '',
}: { points: number[]; w: number; h: number; accent: string; className?: string }) {
  const max = 22;
  const stepX = w / (points.length - 1);
  const path = points
    .map((y, i) => `${i === 0 ? 'M' : 'L'}${(i * stepX).toFixed(2)},${y.toFixed(2)}`)
    .join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${max}`} className={`block ${className}`} preserveAspectRatio="none">
      <path d={path} fill="none" stroke={accent} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DailyTrendChart({ t, theme, data }: { t: Tokens; theme: Theme; data: number[] }) {
  const [metric, setMetric] = useState<'spend' | 'conv' | 'cpa' | 'ctr'>('spend');
  const W = 1100;
  const H = 240;
  const padL = 36;
  const padR = 12;
  const padT = 18;
  const padB = 30;
  const maxY = 8000;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const pts = data.map((v, i) => ({
    x: padL + (i / (data.length - 1)) * innerW,
    y: padT + innerH - (v / maxY) * innerH,
  }));

  function smoothPath(p: { x: number; y: number }[]) {
    if (p.length < 2) return '';
    let d = `M ${p[0].x.toFixed(2)} ${p[0].y.toFixed(2)}`;
    for (let i = 0; i < p.length - 1; i++) {
      const p0 = p[i - 1] ?? p[i];
      const p1 = p[i];
      const p2 = p[i + 1];
      const p3 = p[i + 2] ?? p2;
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
    }
    return d;
  }

  const line = smoothPath(pts);
  const area = `${line} L ${pts[pts.length - 1].x.toFixed(2)} ${(padT + innerH).toFixed(2)} L ${pts[0].x.toFixed(2)} ${(padT + innerH).toFixed(2)} Z`;
  const fillId = theme === 'dark' ? 'projectChartFillDark' : 'projectChartFillLight';

  const xTicks = [
    { label: '14 Apr', i: 0 },
    { label: '22 Apr', i: Math.round(data.length / 3) },
    { label: '30 Apr', i: Math.round((2 * data.length) / 3) },
    { label: '8 May',  i: data.length - 1 },
  ];

  const segments = [
    { id: 'spend', label: 'Spend' },
    { id: 'conv',  label: 'Conv' },
    { id: 'cpa',   label: 'CPA' },
    { id: 'ctr',   label: 'CTR' },
  ] as const;

  return (
    <div className={`mt-3 rounded-[12px] border ${t.cardBorder} ${t.cardBg}`}>
      <div className="flex items-center justify-between px-5 pt-4">
        <div className={`text-[13.5px] font-semibold ${t.fgPrimary}`}>Daily spend trend</div>
        <div className={`inline-flex gap-px rounded-[8px] border ${t.segmentBorder} ${t.segmentBg} p-[2px]`}>
          {segments.map((s) => (
            <button
              key={s.id}
              onClick={() => setMetric(s.id)}
              className={`rounded-[6px] px-3 py-1 text-[12px] font-medium transition-colors ${
                metric === s.id ? `${t.segmentActiveBg} ${t.segmentActiveFg}` : t.segmentInactiveFg
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-2 pb-3 pt-2">
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" style={{ height: H }} preserveAspectRatio="none">
          <defs>
            <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"  stopColor={t.chartLine} stopOpacity={theme === 'dark' ? 0.22 : 0.18} />
              <stop offset="100%" stopColor={t.chartLine} stopOpacity={0} />
            </linearGradient>
          </defs>

          {[0, 0.5, 1].map((p, idx) => {
            const y = padT + innerH * p;
            const value = Math.round((1 - p) * maxY);
            return (
              <g key={idx}>
                <line x1={padL} x2={W - padR} y1={y} y2={y} stroke={t.chartGrid} strokeWidth={1} strokeDasharray={p === 1 ? '0' : '3 3'} />
                <text x={padL - 8} y={y + 4} textAnchor="end" fontSize={10} fill={t.chartAxis}>
                  {value === 0 ? '0' : `${value / 1000}k`}
                </text>
              </g>
            );
          })}

          <path d={area} fill={`url(#${fillId})`} />
          <path d={line} fill="none" stroke={t.chartLine} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

          {xTicks.map((tk) => (
            <text
              key={tk.label}
              x={padL + (tk.i / (data.length - 1)) * innerW}
              y={H - 8}
              textAnchor={tk.i === 0 ? 'start' : tk.i === data.length - 1 ? 'end' : 'middle'}
              fontSize={11}
              fill={t.chartAxis}
            >
              {tk.label}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}

function CampaignCard({
  t, title, tone, items,
}: { t: Tokens; title: string; tone: 'good' | 'bad'; items: Campaign[] }) {
  const dotColor = tone === 'good' ? '#22c55e' : '#ef4444';
  const titleColor = tone === 'good' ? 'text-[#22c55e]' : 'text-[#ef4444]';
  return (
    <div className={`rounded-[12px] border ${t.cardBorder} ${t.cardBg} px-5 py-5`}>
      <div className="flex items-center gap-2">
        <span className="h-[7px] w-[7px] rounded-full" style={{ background: dotColor }} />
        <span className={`text-[13.5px] font-semibold ${titleColor}`}>{title}</span>
      </div>
      <ul className="mt-4 space-y-3.5">
        {items.map((c) => (
          <li key={c.name} className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <div className={`text-[14px] font-semibold tracking-tight ${t.fgPrimary}`}>
                {c.name}
              </div>
              <div className={`mt-0.5 text-[12px] ${t.fgMuted}`}>
                <span className="tabular">{c.spend}</span>
                <span className={`mx-1.5 ${t.fgDim}`}>·</span>
                <span className="tabular">{c.conv}</span>
                <span className={`mx-1.5 ${t.fgDim}`}>·</span>
                <span className={`tabular ${
                  c.cpaTone === 'bad'  ? 'text-[#f87171]' :
                  c.cpaTone === 'good' ? 'text-[#22c55e]' : ''
                }`}>{c.cpa}</span>
                <span className="ml-1">CPA</span>
                <span className={`mx-1.5 ${t.fgDim}`}>·</span>
                <span className="tabular">{c.is}</span>
              </div>
            </div>
            <Sparkline points={c.spark} w={64} h={20} accent={c.sparkColor} />
            <ArrowUpRight size={12} weight="bold" className={t.fgDim} />
          </li>
        ))}
      </ul>
    </div>
  );
}
