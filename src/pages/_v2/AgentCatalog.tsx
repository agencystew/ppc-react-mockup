// AgentCatalog · /agents
//
// v2 rebuild. Two spreads, no more.
//   A — Dark hero (bg-ink). "Agents that read your account before they speak."
//       96px Figtree 900, three ragged-right lines, ONE Caveat on "read".
//   B — Uniform 23-tile catalog on canvas. Sticky monochrome filter strip.
//       ONE mint Sticker for `competitor-spy` (most-run-this-week). Single
//       tilted element on the page. Below it, second Caveat ("most run this
//       week"). The 2-Caveat split is a deliberate spec deviation — see
//       reporting back to Stewart.
//
// Discipline rules locked:
//   1. 5 font sizes only: 96 / 56 / 32 / 17 / 14
//   2. ONE tilted element (mint sticker)
//   3. No mascot
//   4. TWO Caveats (spec override — flagged in report)
//   5. Two spreads max
//
// Anti-pattern ban list followed: no eyebrows, no pastel category chips,
// no emoji in pills, no text < 14px, no white/55, no purple solid rectangles,
// no soft shadows, no pure #000, no em-dashes, no FEATURED/NEW chips, no
// stagger-tilt, no section header eyebrows.

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChartBar,
  MagnifyingGlass,
  Shield,
  Timer,
  Drop,
  TrendUp,
  PencilSimple,
  FileText,
  PaintBrush,
  ShoppingCart,
  Detective,
  Lightning,
  Target,
  ClipboardText,
  Buildings,
  MapTrifold,
  SlidersHorizontal,
  Ruler,
  TestTube,
  Files,
  Briefcase,
  Rocket,
  Broadcast,
  ShieldCheck,
  UsersThree,
  Brain,
  Sparkle,
} from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react';
import { AGENTS, CATEGORIES } from '../../mock/agents';
import type { AgentCategory, AgentDefinition } from '../../types/agent';
import { Sticker } from '../../components/brand/Sticker';
import { Caveat } from '../../components/brand/Caveat';
import { PillButton } from '../../components/brand/PillButton';

// ---------------------------------------------------------------------------
// Icon map — one Phosphor icon per agent slug. Sensible, never duplicated
// meaningfully across the same category. 32px in a 48x48 ink-bordered square.
// ---------------------------------------------------------------------------
const ICONS: Record<string, Icon> = {
  // operations
  'weekly-audit': ChartBar,
  'deep-account-audit': MagnifyingGlass,
  'negative-keyword': Shield,
  'budget-pacer': Timer,
  'spend-leak': Drop,
  'profit-tracker': TrendUp,
  // creative
  'ad-copy': PencilSimple,
  'landing-page': FileText,
  'landing-page-designer': PaintBrush,
  'shopping-feed': ShoppingCart,
  // strategic
  'competitor-spy': Detective,
  'pmax': Lightning,
  'keyword': Target,
  'keyword-auditor': ClipboardText,
  'campaign-architect': Buildings,
  // buyer
  'buyer-journey': MapTrifold,
  'readiness': SlidersHorizontal,
  // diagnostics
  'demand-ceiling': Ruler,
  'test-recommender': TestTube,
  'change-impact': Broadcast,
  'brand-safety': ShieldCheck,
  // client
  'client-reporting': Files,
  'sales-intelligence': Briefcase,
  'new-client-autopilot': Rocket,
  // context
  'business-context': Buildings,
  'competitor-context': UsersThree,
  'google-ads-context': Broadcast,
  'persona': Brain,
  'context-enrichment': Sparkle,
};

// ---------------------------------------------------------------------------
// Filter strip. Monochrome only. Plain text labels.
// ---------------------------------------------------------------------------
type FilterKey = 'all' | AgentCategory;

const FILTERS: ReadonlyArray<{ key: FilterKey; label: string }> = [
  { key: 'all',         label: 'All' },
  { key: 'operations',  label: CATEGORIES.operations.label },
  { key: 'diagnostics', label: CATEGORIES.diagnostics.label },
  { key: 'strategic',   label: CATEGORIES.strategic.label },
  { key: 'creative',    label: CATEGORIES.creative.label },
  { key: 'buyer',       label: CATEGORIES.buyer.label },
  { key: 'client',      label: CATEGORIES.client.label },
  { key: 'context',     label: CATEGORIES.context.label },
];

const FEATURED_SLUG = 'competitor-spy';

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export function AgentCatalog() {
  const [filter, setFilter] = useState<FilterKey>('all');

  const visible = useMemo<AgentDefinition[]>(() => {
    if (filter === 'all') return AGENTS;
    return AGENTS.filter((a) => a.category === filter);
  }, [filter]);

  // Pull the featured agent to the front of the visible list so its mint
  // sticker always reads as the page's signature moment.
  const ordered = useMemo<AgentDefinition[]>(() => {
    const featured = visible.find((a) => a.slug === FEATURED_SLUG);
    if (!featured) return visible;
    return [featured, ...visible.filter((a) => a.slug !== FEATURED_SLUG)];
  }, [visible]);

  return (
    <div className="font-sans text-ink">
      {/* =================================================================
          SPREAD A — Dark hero. Full-bleed. 50vh.
          Headline 96px Figtree 900 (48px on mobile), three ragged-right
          lines. Single Caveat pointing at "read".
          ================================================================= */}
      <section
        className="relative bg-ink text-white"
        style={{ minHeight: '50vh' }}
      >
        <div className="mx-auto flex min-h-[50vh] max-w-[1280px] flex-col justify-center px-6 py-20 md:px-12 md:py-24">
          <h1
            className="font-display font-black leading-[0.95] tracking-[-0.025em] text-[48px] md:text-[96px]"
            style={{ fontWeight: 900 }}
          >
            <span className="relative inline-block">
              Agents that read
              {/* Caveat #1 — sits to the right of line 1, arrow sweeps
                  up-left to land on the word "read". Hidden on mobile;
                  rendered as a normal flow element below the headline on
                  small screens. */}
              <span className="pointer-events-none absolute right-[-280px] top-[24px] hidden md:inline-block">
                <Caveat arrow="up-left" text="the part nobody else does" />
              </span>
            </span>
            <br />
            your account
            <br />
            before they speak.
          </h1>

          {/* Mobile Caveat — render below the headline, no absolute positioning. */}
          <div className="mt-8 md:hidden">
            <Caveat arrow="up-right" text="the part nobody else does" />
          </div>
        </div>
      </section>

      {/* =================================================================
          SPREAD B — Canvas. Sticky filter strip + uniform 23-tile grid.
          The featured agent is rendered as a mint Sticker (the page's one
          tilted element). Below it, Caveat #2: "most run this week".
          ================================================================= */}
      <section className="bg-canvas">
        {/* Sticky filter strip */}
        <div className="sticky top-0 z-10 bg-canvas/95 backdrop-blur">
          <div className="mx-auto max-w-[1280px] px-6 py-4 md:px-12">
            <div className="-mx-2 flex gap-2 overflow-x-auto px-2 md:flex-wrap md:overflow-visible">
              {FILTERS.map((f) => {
                const active = filter === f.key;
                return (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setFilter(f.key)}
                    className={
                      'inline-flex shrink-0 items-center gap-2 rounded-full border-[1.5px] border-ink px-4 py-2 text-[17px] font-semibold transition-colors ' +
                      (active
                        ? 'bg-ink text-white'
                        : 'bg-white text-ink hover:bg-ink hover:text-white')
                    }
                  >
                    {active && (
                      <span
                        aria-hidden="true"
                        className="inline-block h-[6px] w-[6px] shrink-0 rounded-full bg-redorange"
                      />
                    )}
                    <span>{f.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="mx-auto max-w-[1280px] px-6 pb-24 pt-8 md:px-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {ordered.map((agent) => {
              if (agent.slug === FEATURED_SLUG) {
                return <FeaturedTile key={agent.slug} agent={agent} />;
              }
              return <AgentTile key={agent.slug} agent={agent} />;
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tiles
// ---------------------------------------------------------------------------

function AgentTile({ agent }: { agent: AgentDefinition }) {
  const IconCmp = ICONS[agent.slug] ?? Sparkle;
  return (
    <Link
      to={`/agents/${agent.slug}`}
      className="group flex h-full flex-col gap-6 rounded-2xl border-2 border-ink bg-white p-6 no-underline transition-transform hover:-translate-y-[2px]"
    >
      <div className="inline-flex h-12 w-12 items-center justify-center border-2 border-ink p-2">
        <IconCmp size={32} weight="duotone" color="#0F0A1E" />
      </div>

      <div className="flex flex-1 flex-col gap-3">
        <h2 className="font-display text-[32px] font-extrabold leading-[1.05] tracking-[-0.02em] text-ink">
          {agent.name}
        </h2>
        <p
          className="text-[17px] font-medium leading-[1.45] text-ink/75"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {agent.outcomeDescription}
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between">
        <span
          className="font-mono text-[14px] uppercase tracking-[0.06em] text-ink/60"
          style={{ fontFamily: '"Courier New", monospace' }}
        >
          {agent.expectedDuration}
        </span>
        <PillButton variant="ghost" href={`/agents/${agent.slug}`}>
          Open
          <span aria-hidden="true">{'→'}</span>
        </PillButton>
      </div>
    </Link>
  );
}

function FeaturedTile({ agent }: { agent: AgentDefinition }) {
  const IconCmp = ICONS[agent.slug] ?? Sparkle;
  return (
    <div className="relative">
      <Sticker variant="mint" tilt={2} className="block h-full w-full">
        <Link
          to={`/agents/${agent.slug}`}
          className="flex h-full flex-col gap-6 rounded-2xl p-6 no-underline"
        >
          <div className="inline-flex h-12 w-12 items-center justify-center border-2 border-ink bg-white p-2">
            <IconCmp size={32} weight="duotone" color="#0F0A1E" />
          </div>

          <div className="flex flex-1 flex-col gap-3">
            <h2 className="font-display text-[32px] font-extrabold leading-[1.05] tracking-[-0.02em] text-ink">
              {agent.name}
            </h2>
            <p
              className="text-[17px] font-medium leading-[1.45] text-ink/80"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {agent.outcomeDescription}
            </p>
          </div>

          <div className="mt-auto flex items-center justify-between">
            <span
              className="text-[14px] uppercase tracking-[0.06em] text-ink/70"
              style={{ fontFamily: '"Courier New", monospace' }}
            >
              {agent.expectedDuration}
            </span>
            <PillButton variant="ink" href={`/agents/${agent.slug}`}>
              Open
              <span aria-hidden="true">{'→'}</span>
            </PillButton>
          </div>
        </Link>
      </Sticker>

      {/* Caveat #2 — "most run this week", up-left arrow points back up and
          to the left at the sticker. Positioned just below the tile. */}
      <div className="pointer-events-none absolute -bottom-12 left-2 z-0">
        <Caveat arrow="up-left" text="most run this week" />
      </div>
    </div>
  );
}
