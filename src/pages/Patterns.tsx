import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, Compass, Sparkle,
  Target, Lightbulb, TrendUp, CaretDown,
} from '@phosphor-icons/react';
import { PROJECTS } from '../mock/projects';
import { PATTERNS, type Pattern, type AffectedProject, type PatternDriver } from '../mock/patterns';

/* /patterns — cross-project / cross-time pattern synthesis
 *
 * Reports surface what each agent run found in isolation. Patterns is
 * the next zoom level up — io looks across every Finding across every
 * Project (and the per-project weekly briefings that roll those findings
 * up) and surfaces the patterns that span them. Always-on, refreshes
 * whenever the underlying briefings update — not a strict weekly snapshot.
 *
 * Mental model for the user:
 *    Findings  = atomic insight from one report
 *    Patterns  = synthesis across many findings + many briefings (this page)
 *
 * Page anatomy, top → bottom:
 *    1. PatternsHero          — dark editorial card, sandwich layout
 *    2. FeaturedPatternCard   — the spotlight pattern, full editorial spread
 *    3. ShelfDivider          — quiet transition from spotlight to shelf
 *    4. CompactPatternCard×N  — scannable shelf, click-to-expand inline.
 *                                Scales to 40+ patterns when the agency book
 *                                gets big — flat list, no pagination needed
 *                                until volumes exceed a screenful.
 *    5. PatternsReturnBanner  — slim sister of /reports' Patterns banner.
 *
 * Page family: shares the verdict-card / reports-hero hand exactly —
 * black-led dark hero with top-right purple bloom, italic-purple period
 * motif, Courier mono eyebrows. White cards on the lavender canvas; the
 * featured spread + magazine-shelf rhythm is what distinguishes this
 * surface from /reports (which is a flat inbox of individual reports). */

// ─── Data ──────────────────────────────────────────────────────────────
// PATTERNS, Pattern, AffectedProject, PatternDriver imported from ../mock/patterns.
// The strip on /dashboard reads from the same source, so the two surfaces stay in sync.

// ─── Enrichment layer (Phase 1) ────────────────────────────────────────
// Editorial overlay on top of the raw PATTERNS array. Classifies each
// pattern into one of 4 lenses, attaches a hand-written move tag, a
// surfaced timestamp, a Recommended flag (with caption), an optional
// dollar suffix (only where the source prose quotes a real figure), and
// a category-group for the "All 30" fallback view.
//
// Kept here (page-local) intentionally — `../mock/patterns` is shared
// with the dashboard strip, which doesn't need this surface's editorial
// classification. When the rewrite stabilises this may graduate to a
// dedicated mock file, but during the cinematic rebuild the data + the
// surface that consumes it stay co-located.

type Lens = 'win' | 'defend' | 'shift' | 'infrastructure';

interface PatternEnrichment {
  /** Categorical lens. Drives the left-edge color and the lens-filter pill. */
  lens: Lens;
  /** Short move label rendered on the right side of each row. Lifted from
   *  recommendedActionCta. ~4 words max so it fits next to the chevron. */
  moveTag: string;
  /** ISO timestamp of first surfacing. Mock value. Used for 'new this week'
   *  signals on Recommended captions. */
  surfacedAt: string;
  /** True for the 6 patterns shown by default in the Recommended lens. */
  recommended: boolean;
  /** Italic caption shown beneath the headline ONLY when this pattern appears
   *  in the Recommended lens. Explains the pick: '3 projects · new this
   *  week · single decisive move'. Null otherwise. */
  recommendedReason: string | null;
  /** Optional real dollar suffix — ONLY when the source prose (whatWeFound
   *  or whyItMatters) quotes a figure. Never fabricated. */
  dollarSuffix: string | null;
  /** Categorical theme group for the 'All 30' fallback view. */
  categoryGroup: CategoryGroup;
}

type CategoryGroup =
  | 'AUCTION & COMPETITION'
  | 'ATTRIBUTION & TRACKING'
  | 'SPEND EFFICIENCY'
  | 'KEYWORDS & MATCH'
  | 'BID STRATEGY'
  | 'CREATIVE & LP'
  | 'AUDIENCE & DEMAND'
  | 'FEED & COHORT';

const LENS_COLOR: Record<Lens, string> = {
  win:            '#16A34A', // green
  defend:         '#DC2626', // red
  shift:          '#D97706', // amber
  infrastructure: '#534AB7', // indigo
};

const LENS_LABEL: Record<Lens, string> = {
  win:            'Wins',
  defend:         'Defend',
  shift:          'Shifts',
  infrastructure: 'Infrastructure',
};

const ENRICHMENT: Record<string, PatternEnrichment> = {
  // ── WINS (6) ──────────────────────────────────────────────────────
  'p-01': { lens: 'win',            moveTag: 'Lift non-brand bids',     surfacedAt: '2026-05-16T08:00:00Z', recommended: true,  recommendedReason: '3 projects · new this week · 14-day window',  dollarSuffix: null,         categoryGroup: 'AUCTION & COMPETITION' },
  'p-02': { lens: 'win',            moveTag: 'Set up daypart test',     surfacedAt: '2026-05-15T14:00:00Z', recommended: false, recommendedReason: null,                                          dollarSuffix: '~$1.2K/mo',  categoryGroup: 'SPEND EFFICIENCY' },
  'p-06': { lens: 'win',            moveTag: 'Set up daypart test',     surfacedAt: '2026-05-14T11:00:00Z', recommended: false, recommendedReason: null,                                          dollarSuffix: '~$1.2K/mo',  categoryGroup: 'SPEND EFFICIENCY' },
  'p-13': { lens: 'win',            moveTag: 'Attach audience signals', surfacedAt: '2026-05-16T10:00:00Z', recommended: true,  recommendedReason: '3 PMAX campaigns · 10-min fix · pure upside', dollarSuffix: null,         categoryGroup: 'AUDIENCE & DEMAND' },
  'p-17': { lens: 'win',            moveTag: 'Apply geo bid adj',       surfacedAt: '2026-05-13T09:00:00Z', recommended: false, recommendedReason: null,                                          dollarSuffix: null,         categoryGroup: 'SPEND EFFICIENCY' },
  'p-27': { lens: 'win',            moveTag: 'Test Max Conv Value',     surfacedAt: '2026-05-12T16:00:00Z', recommended: false, recommendedReason: null,                                          dollarSuffix: null,         categoryGroup: 'BID STRATEGY' },

  // ── DEFEND (10) ───────────────────────────────────────────────────
  'p-04': { lens: 'defend',         moveTag: 'Cross-account audit',     surfacedAt: '2026-05-16T07:00:00Z', recommended: true,  recommendedReason: 'Same vertical · same week · investigate before acting', dollarSuffix: null, categoryGroup: 'AUCTION & COMPETITION' },
  'p-08': { lens: 'defend',         moveTag: 'Revert bid strategy',     surfacedAt: '2026-05-12T08:00:00Z', recommended: false, recommendedReason: null,                                          dollarSuffix: null,         categoryGroup: 'BID STRATEGY' },
  'p-10': { lens: 'defend',         moveTag: 'Defensive brand bids',    surfacedAt: '2026-05-16T12:00:00Z', recommended: true,  recommendedReason: '3 brand auctions · new entrant · defensive move clear', dollarSuffix: null,    categoryGroup: 'AUCTION & COMPETITION' },
  'p-14': { lens: 'defend',         moveTag: 'Adjust daily caps',       surfacedAt: '2026-05-16T15:00:00Z', recommended: false, recommendedReason: null,                                          dollarSuffix: null,         categoryGroup: 'SPEND EFFICIENCY' },
  'p-20': { lens: 'defend',         moveTag: 'Add to watchlist',        surfacedAt: '2026-05-13T13:00:00Z', recommended: false, recommendedReason: null,                                          dollarSuffix: null,         categoryGroup: 'AUCTION & COMPETITION' },
  'p-21': { lens: 'defend',         moveTag: 'Refresh PMAX assets',     surfacedAt: '2026-05-14T10:00:00Z', recommended: false, recommendedReason: null,                                          dollarSuffix: null,         categoryGroup: 'CREATIVE & LP' },
  'p-22': { lens: 'defend',         moveTag: 'Defensive brand bids',    surfacedAt: '2026-05-12T11:00:00Z', recommended: false, recommendedReason: null,                                          dollarSuffix: null,         categoryGroup: 'AUCTION & COMPETITION' },
  'p-24': { lens: 'defend',         moveTag: 'Re-feed Merchant',        surfacedAt: '2026-05-15T08:00:00Z', recommended: false, recommendedReason: null,                                          dollarSuffix: null,         categoryGroup: 'FEED & COHORT' },
  'p-25': { lens: 'defend',         moveTag: 'Add IP exclusions',       surfacedAt: '2026-05-13T17:00:00Z', recommended: false, recommendedReason: null,                                          dollarSuffix: null,         categoryGroup: 'SPEND EFFICIENCY' },
  'p-26': { lens: 'defend',         moveTag: 'Lower tCPA',              surfacedAt: '2026-05-10T14:00:00Z', recommended: false, recommendedReason: null,                                          dollarSuffix: null,         categoryGroup: 'FEED & COHORT' },

  // ── SHIFTS (4) ────────────────────────────────────────────────────
  'p-09': { lens: 'shift',          moveTag: 'Pull auction insights',   surfacedAt: '2026-05-15T16:00:00Z', recommended: false, recommendedReason: null,                                          dollarSuffix: null,         categoryGroup: 'KEYWORDS & MATCH' },
  'p-15': { lens: 'shift',          moveTag: 'Pull CPC trends',         surfacedAt: '2026-05-14T15:00:00Z', recommended: false, recommendedReason: null,                                          dollarSuffix: null,         categoryGroup: 'SPEND EFFICIENCY' },
  'p-19': { lens: 'shift',          moveTag: 'Spot-check SERPs',        surfacedAt: '2026-05-13T18:00:00Z', recommended: true,  recommendedReason: 'No internal cause · names the market shift · hold actions', dollarSuffix: null, categoryGroup: 'CREATIVE & LP' },
  'p-29': { lens: 'shift',          moveTag: 'Hold LP changes',         surfacedAt: '2026-05-11T12:00:00Z', recommended: false, recommendedReason: null,                                          dollarSuffix: null,         categoryGroup: 'CREATIVE & LP' },

  // ── INFRASTRUCTURE (10) ───────────────────────────────────────────
  'p-03': { lens: 'infrastructure', moveTag: 'Shared negatives list',   surfacedAt: '2026-05-16T09:00:00Z', recommended: true,  recommendedReason: '2 PMAX campaigns · one fix lands on both', dollarSuffix: null,         categoryGroup: 'KEYWORDS & MATCH' },
  'p-05': { lens: 'infrastructure', moveTag: 'Shared negatives list',   surfacedAt: '2026-05-14T13:00:00Z', recommended: false, recommendedReason: null,                                          dollarSuffix: null,         categoryGroup: 'KEYWORDS & MATCH' },
  'p-07': { lens: 'infrastructure', moveTag: 'Audit shared GTM',        surfacedAt: '2026-05-16T11:00:00Z', recommended: true,  recommendedReason: '5 accounts · one tag template · single fix',  dollarSuffix: null,         categoryGroup: 'ATTRIBUTION & TRACKING' },
  'p-11': { lens: 'infrastructure', moveTag: 'Build cross-acct negs',   surfacedAt: '2026-05-13T15:00:00Z', recommended: false, recommendedReason: null,                                          dollarSuffix: null,         categoryGroup: 'KEYWORDS & MATCH' },
  'p-12': { lens: 'infrastructure', moveTag: 'Refresh RSAs on five',    surfacedAt: '2026-05-12T10:00:00Z', recommended: false, recommendedReason: null,                                          dollarSuffix: null,         categoryGroup: 'CREATIVE & LP' },
  'p-16': { lens: 'infrastructure', moveTag: 'Audit mobile LPs',        surfacedAt: '2026-05-11T14:00:00Z', recommended: false, recommendedReason: null,                                          dollarSuffix: null,         categoryGroup: 'CREATIVE & LP' },
  'p-18': { lens: 'infrastructure', moveTag: 'Baseline negatives list', surfacedAt: '2026-05-14T08:00:00Z', recommended: false, recommendedReason: null,                                          dollarSuffix: '~$4K/mo combined', categoryGroup: 'KEYWORDS & MATCH' },
  'p-23': { lens: 'infrastructure', moveTag: 'Extend conv windows',     surfacedAt: '2026-05-13T11:00:00Z', recommended: false, recommendedReason: null,                                          dollarSuffix: null,         categoryGroup: 'ATTRIBUTION & TRACKING' },
  'p-28': { lens: 'infrastructure', moveTag: 'Exclude brand from PMAX', surfacedAt: '2026-05-12T13:00:00Z', recommended: false, recommendedReason: null,                                          dollarSuffix: null,         categoryGroup: 'ATTRIBUTION & TRACKING' },
  'p-30': { lens: 'infrastructure', moveTag: 'Cross-account exclusions',surfacedAt: '2026-05-11T16:00:00Z', recommended: false, recommendedReason: null,                                          dollarSuffix: null,         categoryGroup: 'AUDIENCE & DEMAND' },
};

// Confidence values per pattern. Hand-authored from signal density.
// Format: [confidencePercent, oneLineBasis]
const CONFIDENCE: Record<string, [number, string]> = {
  'p-01': [88, '3 Competitor Spy runs + 1 Google Ads Context finding all confirm'],
  'p-02': [76, '1 confirmed via Change Impact, 2 inferred from spend-curve shape'],
  'p-03': [82, '2 Deep Account Audit findings + 1 Spend Leak cross-reference'],
  'p-04': [71, '2 Weekly Audit findings, same vertical, same week'],
  'p-05': [68, 'Same finding pattern as p-03 - duplicate signal'],
  'p-06': [76, 'Same evidence chain as p-02 - duplicate signal'],
  'p-07': [91, '5 Google Ads Context findings - GCLID loss at same rate across 5 accounts'],
  'p-08': [85, '2 Change Impact findings, identical timing + outcome'],
  'p-09': [62, 'Inferred from QS drop window; no direct auction confirmation'],
  'p-10': [89, 'Direct auction-insights data confirms on all 3 accounts'],
  'p-11': [73, '4 Negative Keyword findings + 2 Spend Leak cross-references'],
  'p-12': [80, '5 Ad Copy findings, identical CTR-decay shape'],
  'p-13': [94, 'Direct config check - audiences exist but unattached'],
  'p-14': [85, '2 Budget Pacer findings, same overshoot pace'],
  'p-15': [70, '4 Weekly Audit findings on Search IS Lost - 12-week-first occurrence'],
  'p-16': [66, '3 Landing Page findings, same direction but different LP frameworks'],
  'p-17': [78, '3 Spend Leak findings on geo CPA divergence'],
  'p-18': [92, '5 Negative Keyword findings - same 6 terms, 0% conv across all'],
  'p-19': [54, 'Same-day CTR drop on 2 accounts, no internal cause confirmed'],
  'p-20': [86, '3 Competitor Spy findings - direct auction insights data'],
  'p-21': [74, '3 PMAX findings - asset rotations on accounts we did not touch'],
  'p-22': [90, '2 Competitor Spy findings - direct auction insights, same launch day'],
  'p-23': [69, '3 Change Impact findings, conversion-lag drift confirmed'],
  'p-24': [83, 'Direct feed health check on Edwin Novel - single account but high signal'],
  'p-25': [77, '3 Spend Leak findings - same IP ranges flagged across accounts'],
  'p-26': [65, '2 Profit Tracker findings, LTV vs Q1 cohort comparison'],
  'p-27': [72, '3 Deep Account Audit backtests, revenue lift consistent'],
  'p-28': [81, '2 PMAX findings - same Search-to-PMAX attribution overlap'],
  'p-29': [58, '3 Weekly Audit findings - LP-experience tier change, no internal cause'],
  'p-30': [87, '2 Buyer Journey findings - direct audience composition overlap'],
};

interface CandidateSignal {
  id: string;
  affected: AffectedProject[];
  observation: string;
  whyNotPromoted: string;
}

const CANDIDATE_SIGNALS: CandidateSignal[] = [
  {
    id: 'cs-01',
    affected: [{ id: 'the-hoth', name: 'The HOTH' }, { id: 'linkbuilder', name: 'LinkBuilder.io' }],
    observation: 'Both have CTR slipping ~0.3pp over the last 5 days.',
    whyNotPromoted: 'Could be a SERP layout test or slow QS drift - too early to tell. Watching for another week.',
  },
  {
    id: 'cs-02',
    affected: [{ id: 'durable', name: 'Durable' }, { id: 'flock', name: 'Flock' }, { id: 'edwin-novel', name: 'Edwin Novel Jewelry' }],
    observation: 'Shopping/PMAX impression share is up 8-12% week-over-week without budget changes.',
    whyNotPromoted: 'Could be a Google holiday-window expansion or a genuine seasonal lift. Need 7 more days of CPC data.',
  },
  {
    id: 'cs-03',
    affected: [{ id: 'authority-builders', name: 'Authority Builders' }],
    observation: 'Single-account observation: average position on non-brand keywords moved 1.2 spots without bid changes.',
    whyNotPromoted: 'No corroborating signal on other accounts yet. If it repeats on a sister account next week we promote it.',
  },
  {
    id: 'cs-04',
    affected: [{ id: 'boulder-care', name: 'Boulder Care' }, { id: 'livingyoung', name: 'LivingYoung Center' }],
    observation: 'Mobile vs desktop conversion gap is widening but only on weekends.',
    whyNotPromoted: 'Sample size too small (8 weekends of data). Recheck once we hit 16.',
  },
];

const STATS_OBSERVATIONS: string[] = [
  "Edwin Novel's data is the thinnest this week - one new run.",
  "No new runs on Authority Builders in the last 7 days.",
  "PMAX patterns are the densest cluster this week - 4 of 30.",
  "We haven't seen Boulder Care for 3 days.",
  "Most patterns this week cluster around the SEO-software vertical.",
];

// ─── Constellation geometry (Phase 2) ──────────────────────────────────
// Hand-laid coordinates for the 8 roster nodes in the hero centerpiece.
// Plotted against a 1200x360 viewBox so the layout reads at any width.
const NODE_COORDS: Record<string, { x: number; y: number }> = {
  'boulder-care':       { x: 220,  y: 110 },
  'the-hoth':           { x: 430,  y: 280 },
  'durable':            { x: 640,  y: 60  },
  'linkbuilder':        { x: 980,  y: 200 },
  'livingyoung':        { x: 350,  y: 340 },
  'authority-builders': { x: 1080, y: 90  },
  'edwin-novel':        { x: 760,  y: 320 },
  'flock':              { x: 820,  y: 160 },
};

interface ConstellationEdge {
  from: string;
  to: string;
  sharedCount: number;
  pulsing: boolean; // true if this edge is part of any top-3 pattern's affected set
}

function computeConstellationEdges(patterns: EnrichedPattern[]): ConstellationEdge[] {
  const pairMap = new Map<string, { count: number; topRank: number }>();
  const key = (a: string, b: string) => [a, b].sort().join('|');
  patterns.forEach((p) => {
    const ids = p.affected.map(a => a.id);
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const k = key(ids[i], ids[j]);
        const existing = pairMap.get(k);
        if (existing) {
          existing.count += 1;
          existing.topRank = Math.min(existing.topRank, p.rank);
        } else {
          pairMap.set(k, { count: 1, topRank: p.rank });
        }
      }
    }
  });
  return Array.from(pairMap.entries()).map(([k, v]) => {
    const [from, to] = k.split('|');
    return { from, to, sharedCount: v.count, pulsing: v.topRank <= 3 };
  });
}

type EnrichedPattern = Pattern & PatternEnrichment & {
  confidence: number;
  confidenceBasis: string;
};

function enrich(pattern: Pattern): EnrichedPattern {
  const e = ENRICHMENT[pattern.id];
  const c = CONFIDENCE[pattern.id];
  if (!e) throw new Error(`Pattern ${pattern.id} missing ENRICHMENT entry`);
  if (!c) throw new Error(`Pattern ${pattern.id} missing CONFIDENCE entry`);
  return { ...pattern, ...e, confidence: c[0], confidenceBasis: c[1] };
}

const ENRICHED_PATTERNS: EnrichedPattern[] = PATTERNS.map(enrich);

const TOTAL_FINDINGS = ENRICHED_PATTERNS.reduce(
  (sum, p) => sum + p.drivenBy.reduce((s, d) => s + d.findingsCount, 0),
  0,
);
const TOTAL_RUNS = new Set(
  ENRICHED_PATTERNS.flatMap(p => p.drivenBy.map(d => d.agentName))
).size * 4; // mocked: assume ~4 runs per agent across the book

const PROJECT_COUNT = 8;


// ─── Page ──────────────────────────────────────────────────────────────

export function Patterns() {
  // Accordion mode: only one compact card open at a time. At 40+ patterns
  // an independent-state shelf becomes a chaotic checkerboard; accordion
  // keeps the eye moving down the page cleanly.
  const [openId, setOpenId] = useState<string | null>(null);
  const [lead, flank1, flank2, ...rest] = ENRICHED_PATTERNS;
  const featuredTrio = [lead, flank1, flank2].filter(Boolean) as EnrichedPattern[];
  return (
    <div className="space-y-8 pb-8">
      <style>{PAGE_STYLES}</style>

      {/* Dark cinematic hero — full-bleed, 560px tall, replaces the older
          PatternsPageHeader + PatternsExplainer pair. Centerpiece is the
          roster constellation; cycling thesis line below it. */}
      <PatternsHero
        patternCount={ENRICHED_PATTERNS.length}
        projectCount={PROJECT_COUNT}
        findingCount={TOTAL_FINDINGS}
        runCount={TOTAL_RUNS}
        patterns={ENRICHED_PATTERNS}
      />

      {/* Experimental flag relocated to a small chip below the hero.
          Synthesis logic is still being tuned. */}
      <div className="reveal flex items-center gap-2" style={{ animationDelay: '180ms' }}>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-[5px] text-[11.5px] font-semibold"
          style={{
            background: 'linear-gradient(155deg, #FDF4D2 0%, #F8E5A0 100%)',
            color: '#7A4E12',
            boxShadow: 'inset 0 0 0 1px rgba(168,120,38,0.25)',
            letterSpacing: '-0.005em',
          }}
        >
          <span aria-hidden>🧪</span>
          Experimental
        </span>
        <span className="text-[12.5px]" style={{ color: '#85819a' }}>
          This surface is in beta. Synthesis logic still being tuned.
        </span>
      </div>

      {/* THE FEATURED TRIPLET — lead spread + 2 flank cards (top 3 patterns) */}
      <FeaturedTriplet patterns={featuredTrio} />

      {/* Section divider — quiet shift from spotlight to shelf */}
      <ShelfDivider count={rest.length} />

      {/* THE SHELF — accordion mode (one open at a time). Scales to 40+. */}
      <div className="space-y-3">
        {rest.map((p, i) => (
          <CompactPatternCard
            key={p.id}
            pattern={p}
            index={i}
            open={openId === p.id}
            onToggle={() => setOpenId(openId === p.id ? null : p.id)}
          />
        ))}
      </div>

      {/* Footer return — back to the inbox of individual reports */}
      <PatternsReturnBanner />
    </div>
  );
}

// ─── Cinematic dark hero (Phase 2) ─────────────────────────────────────
//
// Replaces the older light PatternsPageHeader + PatternsExplainer pair.
// One 560px black-led card with a purple bloom, a roster constellation
// centerpiece, a typewriter that cycles pattern headlines, drifting
// particles for atmosphere, and a mono Courier stats strip at the foot.

function PatternsHero({
  patternCount, projectCount, findingCount, runCount, patterns,
}: {
  patternCount: number;
  projectCount: number;
  findingCount: number;
  runCount: number;
  patterns: EnrichedPattern[];
}) {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [typewriterPaused, setTypewriterPaused] = useState(false);

  return (
    <section
      className="reveal relative overflow-hidden rounded-[20px]"
      style={{
        animationDelay: '0ms',
        minHeight: '560px',
        background:
          'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(127,90,240,0.18) 0%, transparent 60%), linear-gradient(180deg, #0F0A1E 0%, #07050D 100%)',
        boxShadow: '0 0 0 1px rgba(127,90,240,0.20), 0 24px 48px -32px rgba(15,10,30,0.50)',
      }}
    >
      {/* Atmosphere layer — drifting particles, mounted first so it paints behind */}
      <div className="absolute inset-0">
        <ParticleField />
      </div>

      {/* Top strip — eyebrow + last-sweep meta */}
      <div className="relative flex items-start justify-between px-8 pt-7 sm:px-10 sm:pt-8">
        <div>
          <div
            className="text-[10.5px] font-bold uppercase tabular-nums tracking-[0.18em]"
            style={{ fontFamily: '"Courier New", ui-monospace, monospace', color: 'rgba(255,255,255,0.55)' }}
          >
            PATTERNS
          </div>
          <h1
            className="mt-2 font-display font-black text-white"
            style={{
              fontSize: 'clamp(36px, 4.2vw, 52px)',
              lineHeight: 0.98,
              letterSpacing: '-0.030em',
            }}
          >
            Cross-account synthesis<span className="font-serif italic" style={{ color: '#A88CFF' }}>.</span>
          </h1>
        </div>
        <div className="hidden items-center gap-2 sm:flex" style={{ color: 'rgba(255,255,255,0.55)' }}>
          <span
            aria-hidden
            className="live-pulse h-[6px] w-[6px] rounded-full"
            style={{ background: '#5DCAA5' }}
          />
          <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.75)' }}>Last sweep · 2h ago</span>
        </div>
      </div>

      {/* Centerpiece — roster constellation */}
      <div className="relative mt-4 h-[300px] px-4">
        <RosterConstellation
          patterns={patterns}
          hoveredNodeId={hoveredNodeId}
          onNodeHover={setHoveredNodeId}
          onNodeClick={() => { /* wired up in Phase 4 */ }}
        />
      </div>

      {/* Cycling thesis line — pauses on hover */}
      <div
        className="relative px-8 pb-6 sm:px-10"
        onMouseEnter={() => setTypewriterPaused(true)}
        onMouseLeave={() => setTypewriterPaused(false)}
      >
        <HeadlineTypewriter
          headlines={patterns.map(p => p.headline)}
          paused={typewriterPaused}
        />
      </div>

      {/* Stats strip — mono Courier, four counts */}
      <div
        className="relative flex flex-wrap items-center justify-center gap-x-5 gap-y-1 border-t px-8 py-4 text-[11.5px] tabular-nums sm:px-10"
        style={{
          borderColor: 'rgba(168,140,255,0.18)',
          fontFamily: '"Courier New", ui-monospace, monospace',
          color: 'rgba(255,255,255,0.70)',
          letterSpacing: '0.04em',
        }}
      >
        <span><span className="font-bold text-white">{findingCount}</span> findings</span>
        <span aria-hidden style={{ color: 'rgba(255,255,255,0.20)' }}>·</span>
        <span><span className="font-bold text-white">{runCount}</span> runs</span>
        <span aria-hidden style={{ color: 'rgba(255,255,255,0.20)' }}>·</span>
        <span><span className="font-bold text-white">{projectCount}</span> projects</span>
        <span aria-hidden style={{ color: 'rgba(255,255,255,0.20)' }}>·</span>
        <span><span className="font-bold text-white">{patternCount}</span> patterns surfaced</span>
      </div>
    </section>
  );
}

// ─── Roster constellation ──────────────────────────────────────────────
//
// SVG centerpiece. 8 project nodes connected by edges weighted by how
// many patterns share them. Top-3 edges pulse softly; hovering a node
// highlights its threads and dims the rest.

function RosterConstellation({
  patterns, hoveredNodeId, onNodeHover, onNodeClick,
}: {
  patterns: EnrichedPattern[];
  hoveredNodeId: string | null;
  onNodeHover: (id: string | null) => void;
  onNodeClick: (id: string) => void;
}) {
  const edges = computeConstellationEdges(patterns);
  return (
    <svg
      viewBox="0 0 1200 360"
      preserveAspectRatio="xMidYMid meet"
      className="h-full w-full"
      role="img"
      aria-label="Project constellation showing connections between accounts sharing patterns"
    >
      <g>
        {edges.map((edge) => {
          const a = NODE_COORDS[edge.from];
          const b = NODE_COORDS[edge.to];
          if (!a || !b) return null;
          const opacity = Math.min(0.7, 0.15 + edge.sharedCount * 0.12);
          const isHighlighted = hoveredNodeId && (edge.from === hoveredNodeId || edge.to === hoveredNodeId);
          return (
            <line
              key={`${edge.from}-${edge.to}`}
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke={isHighlighted ? '#FFFFFF' : '#A88CFF'}
              strokeOpacity={isHighlighted ? 0.85 : (hoveredNodeId ? opacity * 0.35 : opacity)}
              strokeWidth={isHighlighted ? 1.4 : 1}
              className={edge.pulsing ? 'constellation-pulse' : ''}
              style={{ transition: 'stroke-opacity 240ms ease, stroke 240ms ease, stroke-width 240ms ease' }}
            />
          );
        })}
      </g>
      <g>
        {Object.entries(NODE_COORDS).map(([id, pos]) => {
          const project = PROJECTS.find(p => p.id === id);
          if (!project) return null;
          const chip = projectChipColor(id);
          const isHovered = hoveredNodeId === id;
          return (
            <g
              key={id}
              transform={`translate(${pos.x}, ${pos.y})`}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => onNodeHover(id)}
              onMouseLeave={() => onNodeHover(null)}
              onClick={() => onNodeClick(id)}
            >
              <circle r={isHovered ? 22 : 0} fill="#A88CFF" opacity={isHovered ? 0.20 : 0} style={{ transition: 'r 200ms ease, opacity 200ms ease' }} />
              <circle r={isHovered ? 11 : 9} fill={chip.fg} stroke="#FFFFFF" strokeOpacity={0.85} strokeWidth={isHovered ? 1.5 : 1} style={{ transition: 'r 200ms ease' }} />
              <text y={26} textAnchor="middle" fontSize="11" fontWeight="600" fill={isHovered ? '#FFFFFF' : 'rgba(255,255,255,0.70)'} fontFamily="Figtree, system-ui, sans-serif" style={{ pointerEvents: 'none', transition: 'fill 200ms ease' }}>
                {project.name}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

// ─── Typewriter that cycles pattern headlines ──────────────────────────
//
// Types each headline at 38ms/char, holds 1.5s, deletes at 18ms/char,
// pauses 250ms, then advances. Honours prefers-reduced-motion by
// freezing on the first headline. Pauses while the user hovers the
// container in PatternsHero.

function HeadlineTypewriter({ headlines, paused }: { headlines: string[]; paused: boolean }) {
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const [idx, setIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [phase, setPhase] = useState<'typing' | 'holding' | 'deleting'>('typing');

  // Reduced-motion: lock to first headline, no animation
  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayed((headlines[0] ?? '').replace(/[.!?]+$/, ''));
    }
  }, [headlines, prefersReducedMotion]);

  useEffect(() => {
    if (paused || prefersReducedMotion) return;
    const current = headlines[idx];
    if (!current) return;
    let t: ReturnType<typeof setTimeout>;
    if (phase === 'typing') {
      if (displayed.length < current.length) {
        t = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 38);
      } else {
        t = setTimeout(() => setPhase('holding'), 1500);
      }
    } else if (phase === 'holding') {
      t = setTimeout(() => setPhase('deleting'), 1500);
    } else {
      if (displayed.length > 0) {
        t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 18);
      } else {
        t = setTimeout(() => {
          setIdx((idx + 1) % headlines.length);
          setPhase('typing');
        }, 250);
      }
    }
    return () => clearTimeout(t);
  }, [displayed, phase, idx, headlines, paused, prefersReducedMotion]);

  const visible = displayed.replace(/[.!?]+$/, '');
  const hasContent = visible.length > 0;

  return (
    <div className="relative mx-auto max-w-[820px] text-center" style={{ minHeight: '88px' }} aria-live="polite">
      <p
        className="font-display font-black text-white"
        style={{
          fontSize: 'clamp(22px, 2.4vw, 32px)',
          lineHeight: 1.18,
          letterSpacing: '-0.022em',
          minHeight: '1.18em',
        }}
      >
        {visible}
        {hasContent && <span className="font-serif italic" style={{ color: '#A88CFF' }}>.</span>}
        <span
          aria-hidden
          className="ml-[2px] inline-block w-[2px] align-middle"
          style={{
            height: '0.85em',
            background: 'rgba(255,255,255,0.65)',
            animation: 'dp-cursor-blink 1s steps(2) infinite',
          }}
        />
      </p>
    </div>
  );
}

// ─── Particle field ────────────────────────────────────────────────────
//
// 50 deterministic purple motes drifting behind the constellation.
// Coordinates and timings are i-derived so the field looks organic but
// stays identical across renders.

function ParticleField() {
  const particles = Array.from({ length: 50 }, (_, i) => {
    const x = (i * 37) % 100;
    const y = (i * 73) % 100;
    const r = 1.5 + ((i * 13) % 20) / 10;
    const delay = -((i * 0.7) % 14);
    const duration = 12 + ((i * 11) % 10);
    const opacity = 0.06 + ((i * 17) % 10) / 100;
    return { x, y, r, delay, duration, opacity };
  });
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
      {particles.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={p.r / 4}
          fill="#C7B0FF"
          opacity={p.opacity}
          style={{
            animation: `dp-particle-drift ${p.duration}s linear ${p.delay}s infinite`,
            transformOrigin: `${p.x}% ${p.y}%`,
          }}
        />
      ))}
    </svg>
  );
}

// ─── Section divider between featured and shelf ───────────────────────

function ShelfDivider({ count }: { count: number }) {
  return (
    <div
      className="reveal flex items-baseline gap-3 px-1"
      style={{ animationDelay: '320ms' }}
    >
      <span
        className="text-[13px] font-semibold tracking-[-0.005em]"
        style={{ color: '#1a1625' }}
      >
        More patterns this week
        <span className="font-serif italic text-ppc-purple-500">.</span>
      </span>
      <span
        aria-hidden
        className="h-px flex-1 self-center"
        style={{ background: 'linear-gradient(90deg, rgba(127,90,240,0.22) 0%, transparent 100%)' }}
      />
      <span
        className="tabular-nums text-[12px]"
        style={{ color: '#85819a' }}
      >
        {count} more
      </span>
    </div>
  );
}

// ─── Featured triplet (Phase 3) ────────────────────────────────────────
//
// The top 3 patterns live at full visibility instead of just one. Lead
// card (2x wider) on the left, two compressed flank cards stacked on
// the right. Sourced from ENRICHED_PATTERNS[0..2].

function FeaturedTriplet({ patterns }: { patterns: EnrichedPattern[] }) {
  const [lead, flank1, flank2] = patterns;
  if (!lead) return null;
  return (
    <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
      <FeaturedPatternCard pattern={lead} />
      <div className="grid gap-4 lg:grid-rows-2">
        {flank1 && <FlankCard pattern={flank1} />}
        {flank2 && <FlankCard pattern={flank2} />}
      </div>
    </div>
  );
}

// ─── Flank card ────────────────────────────────────────────────────────
//
// Compressed pattern card used in the flank slots of the FeaturedTriplet.
// Lens-color left edge + rank badge + lens chip + headline with italic
// purple period + count + moveTag (+ optional dollar suffix) + single CTA.

function FlankCard({ pattern }: { pattern: EnrichedPattern }) {
  return (
    <article
      className="relative overflow-hidden rounded-[16px] bg-white"
      style={{
        boxShadow:
          '0 0 0 1px #e8e2f0, 0 1px 0 rgba(15,10,30,0.02), 0 14px 28px -22px rgba(15,10,30,0.12)',
      }}
    >
      {/* Lens color strip — vertical, left edge */}
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-[4px]"
        style={{ background: LENS_COLOR[pattern.lens] }}
      />

      <div className="relative px-5 py-5 pl-6">
        <div className="flex items-center gap-2">
          <PatternRankBadge rank={pattern.rank} />
          <span
            className="text-[10.5px] font-bold uppercase tracking-[0.10em]"
            style={{ fontFamily: '"Courier New", ui-monospace, monospace', color: LENS_COLOR[pattern.lens] }}
          >
            {LENS_LABEL[pattern.lens]}
          </span>
        </div>

        <h4
          className="mt-3 font-display font-bold text-ppc-ink"
          style={{ fontSize: '17px', letterSpacing: '-0.015em', lineHeight: 1.25 }}
        >
          {pattern.headline.replace(/[.!?]$/, '')}
          <span className="font-serif italic" style={{ color: '#7F5AF0' }}>.</span>
        </h4>

        <div className="mt-3 flex items-center gap-2 text-[12px]" style={{ color: '#85819a' }}>
          <span><span className="font-semibold text-ppc-ink">{pattern.affected.length}</span> projects</span>
          <span aria-hidden style={{ color: '#cdc6dd' }}>·</span>
          <span
            className="font-semibold"
            style={{ fontFamily: '"Courier New", ui-monospace, monospace', color: '#534AB7', fontSize: '11.5px' }}
          >
            {pattern.moveTag}
            {pattern.dollarSuffix && (
              <span className="ml-1.5 font-normal" style={{ color: '#1F8458' }}>{pattern.dollarSuffix}</span>
            )}
          </span>
        </div>

        <button
          type="button"
          className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-[10px] px-4 py-[9px] text-[12.5px] font-bold text-white transition-transform hover:-translate-y-[1px]"
          style={{
            background: 'linear-gradient(180deg, #8767F3 0%, #6A45E2 100%)',
            boxShadow: '0 1px 0 rgba(255,255,255,0.22) inset, 0 8px 16px -8px rgba(127,90,240,0.55)',
            letterSpacing: '-0.005em',
          }}
        >
          {pattern.recommendedActionCta}
          <ArrowRight size={11} weight="bold" />
        </button>
      </div>
    </article>
  );
}

// ─── Featured pattern card ─────────────────────────────────────────────
//
// The headline story of the week. One per page. Full editorial spread —
// generous padding, big headline, labelled fields, affected/drivers
// soft-panel, dual CTA. This is the JOY moment of the page.

function FeaturedPatternCard({ pattern }: { pattern: EnrichedPattern }) {
  return (
    <article
      id={`pattern-${pattern.id}`}
      className="reveal relative overflow-hidden rounded-[20px] bg-white"
      style={{
        animationDelay: `200ms`,
        boxShadow:
          '0 0 0 1px #e8e2f0, 0 1px 0 rgba(15,10,30,0.02), 0 22px 38px -28px rgba(15,10,30,0.14)',
      }}
    >
      {/* Featured marker — a thin purple ribbon at the very top to signal
          "this is the headline story." Whisper, not chrome. */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{
          background: 'linear-gradient(90deg, #7F5AF0 0%, #A88CFF 50%, #7F5AF0 100%)',
        }}
      />
      <div className="relative px-8 py-9 sm:px-10 sm:py-11">
        {/* Rank + Featured chip on the left, category on the right. Only the
            PATTERN 01 system stamp keeps the Courier-mono treatment; the
            Featured chip and category eyebrow read as mixed-case Figtree so
            the card doesn't feel like a debug template. */}
        <div className="flex items-center gap-3">
          <PatternRankBadge rank={pattern.rank} />
          <span
            className="inline-flex items-center gap-[6px] rounded-full px-[10px] py-[3px] text-[11.5px] font-semibold"
            style={{
              background: 'linear-gradient(155deg, #E9E3FF 0%, #D3C6FF 100%)',
              color: '#3C3489',
              letterSpacing: '-0.005em',
              boxShadow: 'inset 0 0 0 1px rgba(127,90,240,0.28)',
            }}
          >
            <Sparkle size={10} weight="fill" />
            Featured
          </span>
          <span
            aria-hidden
            className="h-px flex-1"
            style={{ background: 'linear-gradient(90deg, #ECEAFA 0%, transparent 100%)' }}
          />
          <span
            className="text-[12.5px] font-semibold tracking-[-0.005em]"
            style={{ color: '#534AB7' }}
          >
            {pattern.category}
          </span>
        </div>

        {/* Compass glyph — pattern marker. Different from the Target glyph on
            atomic Discovery cards so the user can feel the level shift. */}
        <div className="mt-7" aria-hidden>
          <Compass
            size={28}
            weight="duotone"
            style={{
              color: '#7F5AF0',
              filter: 'drop-shadow(0 0 14px rgba(127,90,240,0.32))',
            }}
          />
        </div>

        {/* Pattern headline — pure editorial opener. Italic-purple period
            motif applies here as on every H1/H2 in the v5 brand. We add
            it after stripping any trailing punctuation from the source
            string so we don't end up with double periods. */}
        <h3
          className="mt-4 font-display font-extrabold text-ppc-ink"
          style={{
            fontSize: 'clamp(26px, 2.6vw, 32px)',
            letterSpacing: '-0.024em',
            lineHeight: 1.15,
            maxWidth: '840px',
          }}
        >
          {pattern.headline.replace(/[.!?]$/, '')}
          <span className="font-serif italic" style={{ color: '#7F5AF0' }}>.</span>
        </h3>

        {/* What we found / Why it matters — labelled editorial sections.
            Headers are mixed-case Figtree (not Courier mono) so they
            read as journalistic body labels, not template stamps. */}
        <PatternField
          label="What we found"
          body={pattern.whatWeFound}
          icon={<Sparkle size={17} weight="regular" />}
        />
        <PatternField
          label="Why it matters across your roster"
          body={pattern.whyItMatters}
          icon={<Lightbulb size={17} weight="regular" />}
        />

        {/* Affected projects + driven-by audit trail in a single neat row.
            Lavender soft panel so it reads as supporting metadata, not as
            primary copy. Labels are mixed-case Figtree. */}
        <div
          className="mt-9 grid gap-6 rounded-[14px] px-5 py-5 md:grid-cols-2"
          style={{
            background: '#F5F2FF',
            boxShadow: 'inset 0 0 0 0.5px rgba(127,90,240,0.18)',
          }}
        >
          <div>
            <div
              className="mb-3 text-[12px] font-bold tracking-[-0.005em]"
              style={{ color: '#3C3489' }}
            >
              Affected projects
            </div>
            <div className="flex flex-wrap gap-2">
              {pattern.affected.map((p) => (
                <AffectedChip key={p.id} project={p} />
              ))}
            </div>
          </div>

          <div>
            <div
              className="mb-3 text-[12px] font-bold tracking-[-0.005em]"
              style={{ color: '#3C3489' }}
            >
              Driven by
            </div>
            <ul className="flex flex-col gap-2">
              {pattern.drivenBy.map((d, i) => (
                <DriverRow key={i} driver={d} />
              ))}
            </ul>
          </div>
        </div>

        {/* Recommended action — the bridge from observation to next move. */}
        <PatternField
          label="Recommended action"
          body={pattern.recommendedAction}
          icon={<Target size={17} weight="regular" />}
        />

        {/* Single primary CTA. The previous "Trace to source findings"
            secondary link was removed — it broke on multi-project patterns
            (no good single destination), and the Affected chips above
            already deep-link to each project's Memory tab where source
            findings live. */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-[12px] px-5 py-3 text-[14px] font-bold text-white transition-transform hover:-translate-y-[1px]"
            style={{
              background: 'linear-gradient(180deg, #8767F3 0%, #6A45E2 100%)',
              boxShadow:
                '0 1px 0 rgba(255,255,255,0.22) inset, 0 12px 24px -10px rgba(127,90,240,0.65)',
              letterSpacing: '-0.008em',
            }}
          >
            {pattern.recommendedActionCta}
            <ArrowRight size={14} weight="bold" />
          </button>
        </div>
      </div>
    </article>
  );
}

// ─── Compact pattern card ──────────────────────────────────────────────
//
// The shelf unit. Scannable by default — rank · category · headline ·
// affected chips · driver summary · expand chevron. Click chevron to
// reveal the full What/Why/Recommendation inline (same vocabulary as
// the Reports inbox row-expand, by intent — one expand pattern across
// the whole product). Scales linearly to 40+ patterns because the page
// just keeps adding more compact cards.

function CompactPatternCard({
  pattern, index, open, onToggle,
}: {
  pattern: Pattern;
  index: number;
  open: boolean;
  onToggle: () => void;
}) {
  const totalFindings = pattern.drivenBy.reduce((s, d) => s + d.findingsCount, 0);
  return (
    <article
      id={`pattern-${pattern.id}`}
      className={`reveal compact-pattern relative overflow-hidden rounded-[16px] bg-white transition-all hover:-translate-y-[1px] ${
        open ? 'compact-pattern-open' : ''
      }`}
      style={{
        animationDelay: `${360 + index * 30}ms`,
        boxShadow:
          '0 0 0 1px #e8e2f0, 0 1px 0 rgba(15,10,30,0.02), 0 10px 24px -22px rgba(15,10,30,0.10)',
      }}
    >
      {/* Header row — rank · headline · affected dots · driver-emoji cluster
          · chevron. Mixed-case category eyebrow (no mono uppercase). At 40+
          patterns the row stays compact because everything past the
          headline is iconography. */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="group/cp w-full text-left"
      >
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-5 px-6 py-5">
          <PatternRankBadge rank={pattern.rank} />

          <div className="min-w-0">
            <div
              className="text-[12px] font-semibold tracking-[-0.005em]"
              style={{ color: '#534AB7' }}
            >
              {pattern.category}
            </div>
            <h3
              className="mt-1 text-[18px] font-bold tracking-[-0.012em] text-ppc-ink group-hover/cp:text-ppc-purple-700"
              style={{ lineHeight: 1.28 }}
            >
              {pattern.headline.replace(/[.!?]$/, '')}
              <span className="font-serif italic" style={{ color: '#7F5AF0' }}>.</span>
            </h3>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px]" style={{ color: '#85819a' }}>
              <span>
                <span className="font-semibold text-ppc-ink">{pattern.affected.length}</span>{' '}
                projects
              </span>
              <span aria-hidden style={{ color: '#cdc6dd' }}>·</span>
              <span>
                <span className="font-semibold text-ppc-ink tabular-nums">{totalFindings}</span>{' '}
                findings
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            {/* Affected-project dots (preview cluster) — first 3, then a "+N"
                slug if there's more. Scales for any number of projects. */}
            <div className="hidden flex-wrap items-center gap-1 md:flex">
              {pattern.affected.slice(0, 3).map((p) => (
                <CompactAffectedDot key={p.id} project={p} />
              ))}
              {pattern.affected.length > 3 && (
                <span
                  className="grid h-[22px] min-w-[22px] place-items-center rounded-[5px] px-1 text-[10.5px] font-bold tabular-nums"
                  style={{
                    background: '#F0EBFF',
                    color: '#534AB7',
                    boxShadow: 'inset 0 0 0 1px rgba(127,90,240,0.18)',
                  }}
                >
                  +{pattern.affected.length - 3}
                </span>
              )}
            </div>
            {/* Driver emojis — pure icons, no text. Scans cleanly at 40+. */}
            <div
              className="hidden items-center gap-[3px] rounded-[6px] px-1.5 py-0.5 lg:flex"
              title={pattern.drivenBy.map((d) => d.agentName).join(' · ')}
              style={{ background: '#FBFAFF', boxShadow: 'inset 0 0 0 0.5px #ECEAFA' }}
            >
              {pattern.drivenBy.map((d, i) => (
                <span
                  key={i}
                  aria-hidden
                  className="text-[12px] leading-none"
                  title={d.agentName}
                >
                  {d.agentEmoji}
                </span>
              ))}
            </div>
            {/* Visible chevron — lavender pill that rotates 180° on expand.
                Discoverable at rest (not hover-only). */}
            <span
              aria-hidden
              className="grid h-[28px] w-[28px] place-items-center rounded-full transition-colors group-hover/cp:bg-[#F0EBFF]"
              style={{ background: open ? '#F0EBFF' : 'transparent' }}
            >
              <CaretDown
                size={13}
                weight="bold"
                className={`text-ppc-purple-500 transition-transform duration-200 ${
                  open ? 'rotate-180' : ''
                }`}
              />
            </span>
          </div>
        </div>
      </button>

      {/* Expanded body — What / Why / Affected & Drivers / Recommendation.
          Labels are mixed-case Figtree, not mono uppercase. */}
      {open && (
        <div className="pattern-expansion border-t border-[#ECEAFA] px-6 py-6">
          <PatternField
            label="What we found"
            body={pattern.whatWeFound}
            icon={<Sparkle size={15} weight="regular" />}
            compact
          />
          <PatternField
            label="Why it matters across your roster"
            body={pattern.whyItMatters}
            icon={<Lightbulb size={15} weight="regular" />}
            compact
          />

          <div
            className="mt-6 grid gap-5 rounded-[12px] px-4 py-4 md:grid-cols-2"
            style={{
              background: '#F5F2FF',
              boxShadow: 'inset 0 0 0 0.5px rgba(127,90,240,0.18)',
            }}
          >
            <div>
              <div
                className="mb-2 text-[12px] font-bold tracking-[-0.005em]"
                style={{ color: '#3C3489' }}
              >
                Affected projects
              </div>
              <div className="flex flex-wrap gap-1.5">
                {pattern.affected.map((p) => (
                  <AffectedChip key={p.id} project={p} />
                ))}
              </div>
            </div>
            <div>
              <div
                className="mb-2 text-[12px] font-bold tracking-[-0.005em]"
                style={{ color: '#3C3489' }}
              >
                Driven by
              </div>
              <ul className="flex flex-col gap-1.5">
                {pattern.drivenBy.map((d, i) => (
                  <DriverRow key={i} driver={d} />
                ))}
              </ul>
            </div>
          </div>

          <PatternField
            label="Recommended action"
            body={pattern.recommendedAction}
            icon={<Target size={15} weight="regular" />}
            compact
          />

          {/* Single primary CTA. The previous "Trace to source findings"
              secondary link was removed — broken on multi-project patterns. */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-1.5 rounded-[10px] px-4 py-[10px] text-[13px] font-bold text-white transition-transform hover:-translate-y-[1px]"
              style={{
                background: 'linear-gradient(180deg, #8767F3 0%, #6A45E2 100%)',
                boxShadow:
                  '0 1px 0 rgba(255,255,255,0.22) inset, 0 10px 20px -10px rgba(127,90,240,0.55)',
                letterSpacing: '-0.008em',
              }}
            >
              {pattern.recommendedActionCta}
              <ArrowRight size={12} weight="bold" />
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

// CompactAffectedDot — tiny stacked-letter chip for the compact row's
// right-side preview of affected projects. Three dots side by side give
// a glance signal without listing all the project names in the header.
function CompactAffectedDot({ project }: { project: AffectedProject }) {
  const chip = projectChipColor(project.id);
  return (
    <span
      title={project.name}
      aria-label={project.name}
      className="grid h-[22px] w-[22px] place-items-center rounded-[5px] text-[10px] font-bold leading-none"
      style={{
        background: chip.bg,
        color: chip.fg,
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.32), inset 0 -1px 0 rgba(0,0,0,0.10)',
      }}
    >
      {project.name.charAt(0)}
    </span>
  );
}

// PatternRankBadge — the black mono `PATTERN 01` chip used on both the
// featured card AND the compact shelf cards. Keeps the visual identity
// consistent across density levels.
function PatternRankBadge({ rank }: { rank: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-[8px] px-[10px] py-[5px] font-bold tabular-nums"
      style={{
        background: '#0F0A1E',
        color: '#FFFFFF',
        fontSize: '11px',
        letterSpacing: '0.08em',
        fontFamily: '"Courier New", ui-monospace, monospace',
      }}
    >
      PATTERN {String(rank).padStart(2, '0')}
    </span>
  );
}

function PatternField({
  label,
  body,
  icon,
  compact = false,
}: {
  label: string;
  body: string;
  icon?: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <section className={compact ? 'mt-5' : 'mt-8'}>
      <h4
        className={`flex items-center gap-[10px] font-bold text-ppc-ink ${
          compact ? 'text-[14px]' : 'text-[16px]'
        }`}
        style={{ letterSpacing: '-0.012em' }}
      >
        {icon && (
          <span aria-hidden style={{ color: '#7F5AF0' }} className="inline-flex shrink-0">
            {icon}
          </span>
        )}
        {label}
      </h4>
      <p
        className={`mt-2 leading-[1.6] ${compact ? 'text-[14px]' : 'mt-2.5 text-[15.5px] leading-[1.65]'}`}
        style={{ color: '#3c3849', maxWidth: '820px' }}
      >
        {body}
      </p>
    </section>
  );
}

function AffectedChip({ project }: { project: AffectedProject }) {
  // Resolve the project's color from the master PROJECTS list if it exists;
  // otherwise fall back to a neutral lavender. Deep-links to the project's
  // Memory tab (where the per-project weekly briefing lives) via the
  // ?tab=memory query — once Project.tsx wires URL state, that param will
  // pre-select the Memory tab so the drill-down lands the user exactly
  // where they expect: this project's running record of what io found.
  const inRoster = PROJECTS.find((p) => p.id === project.id);
  const chip = projectChipColor(project.id);
  return (
    <Link
      to={inRoster ? `/projects/${project.id}?tab=memory` : '#'}
      className="group/chip inline-flex items-center gap-2 rounded-[10px] px-3 py-[7px] transition-colors"
      style={{
        background: '#FFFFFF',
        boxShadow: 'inset 0 0 0 0.5px rgba(127,90,240,0.18)',
      }}
    >
      <span
        aria-hidden
        className="grid h-[20px] w-[20px] shrink-0 place-items-center rounded-[5px] text-[10px] font-bold leading-none"
        style={{
          background: chip.bg,
          color: chip.fg,
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.32), inset 0 -1px 0 rgba(0,0,0,0.10)',
        }}
      >
        {project.name.charAt(0)}
      </span>
      <span
        className="text-[13px] font-semibold tracking-[-0.005em] text-ppc-ink transition-colors group-hover/chip:text-ppc-purple-700"
      >
        {project.name}
      </span>
      <ArrowUpRight
        size={10}
        weight="bold"
        className="text-ppc-text-faint transition-colors group-hover/chip:text-ppc-purple-500"
      />
    </Link>
  );
}

function projectChipColor(id: string): { bg: string; fg: string } {
  // Mirrors the hash used in Reports.tsx's projectChip helper so the same
  // project reads as the same colour across surfaces. Slightly softened
  // saturation here so the dot-cluster preview in compact pattern cards
  // doesn't read as candy — the full-name AffectedChip stays brighter so
  // identity is still legible at the editorial scale.
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const hue = h % 360;
  return {
    bg: `linear-gradient(155deg, hsl(${hue}, 55%, 91%) 0%, hsl(${hue}, 45%, 86%) 100%)`,
    fg: `hsl(${hue}, 50%, 28%)`,
  };
}

function DriverRow({ driver }: { driver: PatternDriver }) {
  return (
    <li className="flex items-baseline gap-2.5">
      <span aria-hidden className="text-[15px] leading-none">{driver.agentEmoji}</span>
      <span className="text-[13px] font-semibold text-ppc-ink">{driver.agentName}</span>
      <span aria-hidden className="text-ppc-text-faint/60">·</span>
      <span
        className="tabular-nums text-[12.5px] text-ppc-text-muted"
      >
        {driver.findingsCount} {driver.findingsCount === 1 ? 'finding' : 'findings'}
      </span>
      {driver.modifier && (
        <>
          <span aria-hidden className="text-ppc-text-faint/60">·</span>
          <span className="text-[11.5px] italic text-ppc-text-faint">
            {driver.modifier}
          </span>
        </>
      )}
    </li>
  );
}

// ─── Return banner ─────────────────────────────────────────────────────
//
// Mirrors the slim banner on /reports that points HERE — gives the user
// a one-click trip back to the firehose when they're done with the
// synthesis read.

function PatternsReturnBanner() {
  return (
    <Link
      to="/reports"
      className="reveal group relative block overflow-hidden rounded-[14px] transition-all hover:-translate-y-[1px]"
      style={{
        animationDelay: `${200 + PATTERNS.length * 80 + 60}ms`,
        background: 'linear-gradient(180deg, #FFFFFF 0%, #FAF7FF 100%)',
        border: '0.5px solid #d9d4ec',
        boxShadow: '0 1px 0 rgba(255,255,255,0.7) inset, 0 6px 20px -16px rgba(127,90,240,0.18)',
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-12 h-[180px] w-[260px] rounded-full opacity-40 transition-opacity duration-500 group-hover:opacity-90"
        style={{ background: 'radial-gradient(circle, rgba(127,90,240,0.10) 0%, transparent 65%)' }}
      />

      <div className="relative flex items-center gap-4 px-5 py-[14px] sm:px-6">
        <span
          className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-[9px]"
          style={{
            background: 'linear-gradient(155deg, #E9E3FF 0%, #D3C6FF 100%)',
            boxShadow: 'inset 0 0 0 0.5px rgba(127,90,240,0.28)',
          }}
        >
          <TrendUp size={13} weight="duotone" className="text-ppc-purple-700" />
        </span>

        <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-3 gap-y-1">
          <span
            className="text-[14px] font-semibold tracking-[-0.005em] text-ppc-ink"
          >
            Back to the individual reports
            <span className="ml-px font-serif italic text-ppc-purple-500">.</span>
          </span>
          <span className="text-[12.5px] text-ppc-text-muted">
            The full inbox, sorted by what needs you.
          </span>
        </div>

        <ArrowRight
          size={13}
          weight="bold"
          className="shrink-0 text-ppc-purple-500 transition-transform duration-200 group-hover:translate-x-[3px]"
        />
      </div>
    </Link>
  );
}

// ─── Animations ────────────────────────────────────────────────────────

const PAGE_STYLES = `
  @keyframes dp-reveal {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .reveal { opacity: 0; animation: dp-reveal 0.55s cubic-bezier(0.22, 0.9, 0.32, 1) forwards; }

  @keyframes dp-pattern-expand {
    from { opacity: 0; transform: translateY(-4px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .pattern-expansion {
    animation: dp-pattern-expand 0.32s cubic-bezier(0.22, 0.9, 0.32, 1);
  }

  /* Live pulse — soft breathing dot used in the hero's Live pill */
  @keyframes dp-live-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(93,202,165,0.55); }
    50%      { box-shadow: 0 0 0 6px rgba(93,202,165,0); }
  }
  .live-pulse {
    animation: dp-live-pulse 2.2s ease-in-out infinite;
  }

  /* When a compact card is open, lift it slightly above its neighbours
   * and tint the header so the expanded state reads as "anchored." */
  .compact-pattern {
    transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
  }
  .compact-pattern-open {
    box-shadow: 0 0 0 1px #d3c6ff, 0 1px 0 rgba(255,255,255,0.7) inset, 0 14px 32px -22px rgba(127,90,240,0.20);
  }
  .compact-pattern-open > button {
    background: linear-gradient(180deg, #FBFAFF 0%, #FFFFFF 100%);
  }

  /* Constellation edge — soft, slow pulse used on top-3 patterns' edges */
  @keyframes dp-constellation-pulse {
    0%, 100% { stroke-opacity: 0.6; }
    50%      { stroke-opacity: 0.95; }
  }
  .constellation-pulse {
    animation: dp-constellation-pulse 4s ease-in-out infinite;
  }

  /* Typewriter caret blink */
  @keyframes dp-cursor-blink {
    0%, 100% { opacity: 1; }
    50%      { opacity: 0; }
  }

  /* Drifting purple motes behind the constellation — coffee-ad atmosphere */
  @keyframes dp-particle-drift {
    0%   { transform: translateY(8%) translateX(0) scale(0.8); opacity: 0; }
    10%  { opacity: 1; }
    90%  { opacity: 1; }
    100% { transform: translateY(-8%) translateX(3%) scale(1.2); opacity: 0; }
  }

  @media (prefers-reduced-motion: reduce) {
    .constellation-pulse { animation: none !important; }
    .live-pulse { animation: none !important; }
    svg circle[style*="dp-particle-drift"] { animation: none !important; opacity: 0.10 !important; }
  }
`;
