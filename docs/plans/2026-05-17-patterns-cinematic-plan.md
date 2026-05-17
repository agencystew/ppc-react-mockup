# Patterns Cinematic Rewrite Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** Replace the current 30-row monotone Patterns page with a cinematic dark hero (project constellation + cycling pattern headlines + drifting particles), featured triplet with confidence badges, a categorical-lens triage bar, a "Still watching" zone for tentative signals, and a soft-language posture throughout. The page must work seamlessly for both agency operators (with multiple clients) and in-house marketers (with a single advertiser's campaigns).

**Architecture:** Single-file rewrite of `src/pages/Patterns.tsx`. Existing `PATTERNS` array stays; we extend it with a parallel `ENRICHMENT` object (lens, moveTag, surfacedAt, recommended). All new components live in the same file, matching the mockup's "one page = one file" convention. Brand v5 tokens only - black-led dark surfaces, purple bloom max 0.18 opacity, Figtree display, italic-serif period motif.

**Tech Stack:** React 19, TypeScript, Vite 8, Tailwind, Phosphor icons, react-router-dom. No new dependencies.

**Companion design doc:** [`2026-05-17-patterns-cinematic-design.md`](2026-05-17-patterns-cinematic-design.md).

---

## Pre-flight check

**Task 0.1: Confirm baseline renders**

```bash
cd "/Users/stew/PPC CLAUDE WORKSPACE/ppc-io-saas/_react-mockup"
npm run dev
```

Open `http://localhost:5173/patterns`. Confirm the current page loads with the lavender hero + 1 featured card + 29 compact rows. This is the "before" state. Take a screenshot for the eventual before/after.

**Task 0.2: Confirm clean tsc baseline**

```bash
npx tsc --noEmit
```

Expected: no errors. If errors exist, they are PRE-EXISTING and not from this work. Note them in a comment so the executor doesn't blame us.

---

## Phase 1: Data enrichment (zero visual change)

Goal: extend the data model. Page still renders identically at the end of this phase. Commit isolates the data model from the rendering rewrite.

### Task 1.1: Add the enrichment types

**Files:**
- Modify: `src/pages/Patterns.tsx` (add types after the existing `Pattern` interface, ~line 62)

**Code to add:**

```typescript
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
  /** Optional real dollar suffix - ONLY when the source prose (whatWeFound
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
```

**Step 2: Verify tsc still passes.**

```bash
npx tsc --noEmit
```

Expected: same baseline. New types are unused so far; that's fine.

### Task 1.2: Author the enrichment table

**Files:**
- Modify: `src/pages/Patterns.tsx` (add `ENRICHMENT` constant after the PATTERNS array, ~line 414)

This is **editorial work** - one entry per pattern. Use this table verbatim:

```typescript
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

// "Still watching" candidate signals - things io is tracking but hasn't
// promoted to a pattern yet. Embodies the vulnerability layer.
interface CandidateSignal {
  id: string;
  affected: AffectedProject[];
  observation: string;
  whyNotPromoted: string; // why we're watching, not acting
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

// Self-observation strings that rotate into the hero's stats strip.
// Authored to own the gaps in our data.
const STATS_OBSERVATIONS: string[] = [
  "Edwin Novel's data is the thinnest this week - one new run.",
  "No new runs on Authority Builders in the last 7 days.",
  "PMAX patterns are the densest cluster this week - 4 of 30.",
  "We haven't seen Boulder Care for 3 days.",
  "Most patterns this week cluster around the SEO-software vertical.",
];
```

**Step 2: Verify counts.**

Add this temporary console.log at the bottom of the file (remove before committing):

```typescript
console.log({
  total: Object.keys(ENRICHMENT).length,
  win: Object.values(ENRICHMENT).filter(e => e.lens === 'win').length,
  defend: Object.values(ENRICHMENT).filter(e => e.lens === 'defend').length,
  shift: Object.values(ENRICHMENT).filter(e => e.lens === 'shift').length,
  infrastructure: Object.values(ENRICHMENT).filter(e => e.lens === 'infrastructure').length,
  recommended: Object.values(ENRICHMENT).filter(e => e.recommended).length,
});
```

Expected output (in browser console): `{ total: 30, win: 6, defend: 10, shift: 4, infrastructure: 10, recommended: 6 }`.

Remove the console.log after confirming. tsc must still pass.

### Task 1.3: Add helpers + the merged accessor

**Files:**
- Modify: `src/pages/Patterns.tsx` (add after the ENRICHMENT constant)

```typescript
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
```

`TOTAL_RUNS` is mocked because we don't have run-level data in the mockup. The stats strip in the hero will read these.

**Step 2: Verify tsc.**

```bash
npx tsc --noEmit
```

Expected: clean. If `enrich` throws on import, you missed a pattern in ENRICHMENT.

### Task 1.4: Commit Phase 1

```bash
git add src/pages/Patterns.tsx
git commit -m "$(cat <<'EOF'
patterns: add enrichment data layer (lens, moveTag, recommended)

Authors a parallel ENRICHMENT object alongside the existing PATTERNS
array, classifying each of 30 patterns into one of 4 lenses (Wins,
Defend, Shifts, Infrastructure) with move tags, surfaced timestamps,
and 6 hand-picked Recommended entries with reasoning captions.

No visual changes - data only. Sets up the cinematic rewrite landing
in subsequent commits.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

**End-of-phase gate.** Page renders identically to baseline. tsc clean. Counts confirmed via console.log (then removed). Single clean commit.

---

## Phase 2: Cinematic hero (the kill-shot)

Goal: replace the current lavender header + explainer card with the dark hero (560px). After this phase, Stewart should be able to load the page and see the cinematic moment in isolation - the shelf below is unchanged.

### Task 2.1: Stub the dark hero shell

**Files:**
- Modify: `src/pages/Patterns.tsx` (the `Patterns()` page function, currently uses `<PatternsPageHeader />` + `<PatternsExplainer />`)

Replace the first two children of the return value:

```typescript
// BEFORE:
<PatternsPageHeader patternCount={PATTERNS.length} projectCount={totalProjects} findingCount={totalFindings} />
<PatternsExplainer />

// AFTER:
<PatternsHero
  patternCount={ENRICHED_PATTERNS.length}
  projectCount={PROJECT_COUNT}
  findingCount={TOTAL_FINDINGS}
  runCount={TOTAL_RUNS}
  patterns={ENRICHED_PATTERNS}
/>
```

Add the `PatternsHero` component shell at the end of the file (we'll fill in the constellation + typewriter next):

```typescript
function PatternsHero({
  patternCount, projectCount, findingCount, runCount, patterns,
}: {
  patternCount: number;
  projectCount: number;
  findingCount: number;
  runCount: number;
  patterns: EnrichedPattern[];
}) {
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
      {/* Top strip  -  eyebrow + last-sweep meta */}
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

      {/* Centerpiece will be the RosterConstellation  -  placeholder for now */}
      <div className="relative mt-4 h-[300px]">
        <div className="grid h-full place-items-center text-[12px]" style={{ color: 'rgba(255,255,255,0.30)' }}>
          [constellation goes here]
        </div>
      </div>

      {/* Thesis-line typewriter overlay  -  placeholder for now */}
      <div className="relative px-8 pb-6 text-center sm:px-10">
        <div className="text-[12px]" style={{ color: 'rgba(255,255,255,0.30)' }}>[typewriter goes here]</div>
      </div>

      {/* Stats strip */}
      <div
        className="relative flex items-center justify-center gap-x-5 gap-y-1 border-t px-8 py-4 text-[11.5px] tabular-nums sm:px-10"
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
```

**Step 2: Run dev server, visit `/patterns`.** Expect: a dark hero card (560px tall) at the top with the H1, the live-pulse, and the stats strip. Two placeholder zones in the middle where constellation + typewriter will go. The shelf below stays unchanged.

### Task 2.2: Build the roster constellation SVG

**Files:**
- Modify: `src/pages/Patterns.tsx` (add `RosterConstellation` component, replace the constellation placeholder in `PatternsHero`)

Use these hardcoded coordinates (viewBox 1200×360, organic star-map layout):

```typescript
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
  pulsing: boolean; // true if this edge is part of the top-3 patterns' affected set
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
```

```typescript
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
      aria-label="Roster constellation showing connections between projects sharing patterns"
    >
      {/* Edges drawn first so nodes paint on top */}
      <g>
        {edges.map((edge) => {
          const a = NODE_COORDS[edge.from];
          const b = NODE_COORDS[edge.to];
          if (!a || !b) return null;
          const opacity = Math.min(0.7, 0.15 + edge.sharedCount * 0.12);
          const isHighlighted =
            hoveredNodeId && (edge.from === hoveredNodeId || edge.to === hoveredNodeId);
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

      {/* Nodes */}
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
              {/* Halo on hover */}
              <circle
                r={isHovered ? 22 : 0}
                fill="#A88CFF"
                opacity={isHovered ? 0.20 : 0}
                style={{ transition: 'r 200ms ease, opacity 200ms ease' }}
              />
              {/* Node body */}
              <circle r={isHovered ? 11 : 9} fill={chip.fg} stroke="#FFFFFF" strokeOpacity={0.85} strokeWidth={isHovered ? 1.5 : 1} style={{ transition: 'r 200ms ease' }} />
              {/* Name label */}
              <text
                y={26}
                textAnchor="middle"
                fontSize="11"
                fontWeight="600"
                fill={isHovered ? '#FFFFFF' : 'rgba(255,255,255,0.70)'}
                fontFamily="Figtree, system-ui, sans-serif"
                style={{ pointerEvents: 'none', transition: 'fill 200ms ease' }}
              >
                {project.name}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
```

Replace the constellation placeholder in `PatternsHero` with:

```typescript
{/* Centerpiece  -  roster constellation */}
<div className="relative mt-4 h-[300px] px-4">
  <RosterConstellation
    patterns={patterns}
    hoveredNodeId={hoveredNodeId}
    onNodeHover={setHoveredNodeId}
    onNodeClick={(id) => { /* wired to filter in Phase 4 */ }}
  />
</div>
```

Add `useState` for `hoveredNodeId` at the top of `PatternsHero`:

```typescript
const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
```

Add the pulse animation to `PAGE_STYLES` (at the bottom of the file):

```css
@keyframes dp-constellation-pulse {
  0%, 100% { stroke-opacity: 0.6; }
  50%      { stroke-opacity: 0.95; }
}
.constellation-pulse {
  animation: dp-constellation-pulse 4s ease-in-out infinite;
}
```

**Step 2: Visual check.**

Open `/patterns`. Expect: 8 colored dots laid out across the dark hero, connected by faint purple lines. Hovering a dot brightens its connected lines, dims the rest, and shows a soft halo. The 3 edges connected to the top-3 patterns pulse softly.

If lines overlap node labels awkwardly, adjust `NODE_COORDS` slightly. Coordinates are just aesthetic guesses - feel free to tune.

### Task 2.3: Build the headline typewriter

**Files:**
- Modify: `src/pages/Patterns.tsx` (add `HeadlineTypewriter` component, replace placeholder in `PatternsHero`)

```typescript
function HeadlineTypewriter({ headlines, paused }: { headlines: string[]; paused: boolean }) {
  const [idx, setIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [phase, setPhase] = useState<'typing' | 'holding' | 'deleting'>('typing');

  useEffect(() => {
    if (paused) return;
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
    } else if (phase === 'deleting') {
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
  }, [displayed, phase, idx, headlines, paused]);

  // Strip trailing punctuation so we own the italic-purple period
  const visible = displayed.replace(/[.!?]+$/, '');
  const hasContent = visible.length > 0;

  return (
    <div
      className="relative mx-auto max-w-[820px] text-center"
      style={{ minHeight: '88px' }}
      aria-live="polite"
    >
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
        {hasContent && (
          <span className="font-serif italic" style={{ color: '#A88CFF' }}>.</span>
        )}
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
```

Replace the typewriter placeholder in `PatternsHero` with:

```typescript
{/* Cycling thesis line  -  typewriter cycles existing pattern.headline strings */}
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
```

Add the state hook + the cursor-blink animation:

```typescript
// inside PatternsHero
const [typewriterPaused, setTypewriterPaused] = useState(false);
```

```css
/* in PAGE_STYLES */
@keyframes dp-cursor-blink {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0; }
}
```

**Step 2: Visual check.**

Open `/patterns`. Expect: the dark hero now types a pattern headline (~50ms per char), holds for 1.5s, backspaces, moves to the next. The italic purple period appears at the full string. The cursor blinks. Hovering anywhere over the typewriter region pauses the cycle.

### Task 2.3b: Drifting particle atmosphere

**Files:**
- Modify: `src/pages/Patterns.tsx` (add `ParticleField` component, mount in `PatternsHero` between the gradient bg and the constellation)

Add this component. 50 particles, deterministic positions (so it doesn't reflow on re-render), pure CSS animation.

```typescript
function ParticleField() {
  // Deterministic: seed from a stable per-particle index so SSR/CSR match
  // and the field doesn't reposition between renders.
  const particles = Array.from({ length: 50 }, (_, i) => {
    const x = (i * 37) % 100;
    const y = (i * 73) % 100;
    const r = 1.5 + ((i * 13) % 20) / 10; // 1.5 - 3.5px
    const delay = -((i * 0.7) % 14);      // negative delay starts mid-animation
    const duration = 12 + ((i * 11) % 10); // 12 - 22s
    const opacity = 0.06 + ((i * 17) % 10) / 100; // 0.06 - 0.16
    return { x, y, r, delay, duration, opacity };
  });
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
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
```

Add to PAGE_STYLES:

```css
@keyframes dp-particle-drift {
  0%   { transform: translateY(8%) translateX(0) scale(0.8); opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { transform: translateY(-8%) translateX(3%) scale(1.2); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  svg circle[style*="dp-particle-drift"] { animation: none !important; opacity: 0.10 !important; }
}
```

Mount in `PatternsHero` BEFORE the constellation block:

```typescript
<div className="absolute inset-0">
  <ParticleField />
</div>
```

Visual check: open `/patterns`. Look at the dark hero for ~30 seconds. Faint purple dust motes should drift upward at multiple speeds, fading in and out at the edges of their lifetimes. Subliminal but warm.

### Task 2.4: Reduced-motion safety + responsive checks

**Files:**
- Modify: `src/pages/Patterns.tsx` (`PAGE_STYLES` block)

Add at the end of `PAGE_STYLES`:

```css
@media (prefers-reduced-motion: reduce) {
  .constellation-pulse { animation: none !important; }
  .live-pulse { animation: none !important; }
}
```

For the typewriter, gate the cycle:

```typescript
// at the top of HeadlineTypewriter, after the useState hooks:
const prefersReducedMotion = typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

useEffect(() => {
  if (prefersReducedMotion) {
    setDisplayed(headlines[0]?.replace(/[.!?]+$/, '') || '');
  }
}, [headlines, prefersReducedMotion]);

// And in the useEffect that drives typing: early-return when prefersReducedMotion is true.
```

**Responsive:** at viewport <640px the constellation aspect-ratio should still hold (it uses `preserveAspectRatio="xMidYMid meet"`). Check at iPhone-13 width (390px) - if labels overflow, reduce node label fontSize from 11 to 10 conditionally OR hide labels under 768px.

### Task 2.5: Delete the old `PatternsPageHeader` and `PatternsExplainer`

**Files:**
- Modify: `src/pages/Patterns.tsx`

Now that `PatternsHero` is in and the page renders correctly, delete the two old components and their imports. Search and remove:

- `function PatternsPageHeader(...)`  (lines around 480-522 in the current file)
- `function PatternsExplainer(...)`  (lines around 531-583)
- `function PersonaNote(...)`  (lines around 585-599)

The `countUniqueProjects` helper can stay or go; it's only referenced by the old `Patterns()` body. If it becomes unused, delete it too.

**Step 2: Verify tsc.**

```bash
npx tsc --noEmit
```

Expected: clean. Any "unused" warnings on deleted helpers should now be gone.

### Task 2.6: Move the Experimental flag below the hero

**Files:**
- Modify: `src/pages/Patterns.tsx` (the `Patterns()` page function)

Insert a small flag chip between the hero and the (still-existing for now) `FeaturedPatternCard`:

```typescript
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
```

### Task 2.7: Commit Phase 2

```bash
git add src/pages/Patterns.tsx
git commit -m "$(cat <<'EOF'
patterns: cinematic dark hero with roster constellation

Replaces the light-canvas PatternsPageHeader and PatternsExplainer
with a single 560px dark hero. Centerpiece is an SVG constellation
of 8 project nodes connected by edges weighted by shared-pattern
count; top-3 edges pulse softly. Hovering a node highlights its
threads. A typewriter cycles the existing pattern headlines below
the constellation, pausing on hover. Stats strip computed live.

Experimental flag relocated to a small chip below the hero.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

**End-of-phase gate.** Visit `/patterns`. The hero is the new cinematic moment. The featured card and the 29-row shelf below are still the old code - they'll be replaced in subsequent phases. **PAUSE FOR STEWART REVIEW HERE** - he should see the hero in isolation before more changes land.

---

## Phase 3: Featured triplet (lead + 2 flanks)

Goal: replace the single `FeaturedPatternCard` with a 3-up arrangement showing the top 3 patterns. Lead retains the editorial spread; flanks are compressed.

### Task 3.1: Build the `FlankCard` component

**Files:**
- Modify: `src/pages/Patterns.tsx` (add after `FeaturedPatternCard`)

```typescript
function FlankCard({ pattern }: { pattern: EnrichedPattern }) {
  return (
    <article
      className="relative overflow-hidden rounded-[16px] bg-white"
      style={{
        boxShadow:
          '0 0 0 1px #e8e2f0, 0 1px 0 rgba(15,10,30,0.02), 0 14px 28px -22px rgba(15,10,30,0.12)',
      }}
    >
      {/* Lens color strip  -  vertical, left edge */}
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
```

### Task 3.2: Build the `FeaturedTriplet` wrapper

```typescript
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
```

### Task 3.3: Wire FeaturedTriplet into `Patterns()`

**Files:**
- Modify: `src/pages/Patterns.tsx` (the `Patterns()` function body)

Replace:

```typescript
const [featured, ...rest] = PATTERNS;
// ...
<FeaturedPatternCard pattern={featured} />
```

With:

```typescript
const [lead, flank1, flank2, ...rest] = ENRICHED_PATTERNS;
const featuredTrio = [lead, flank1, flank2].filter(Boolean);
// ...
<FeaturedTriplet patterns={featuredTrio} />
```

`FeaturedPatternCard` is now typed `EnrichedPattern` not `Pattern`. Update its signature: `function FeaturedPatternCard({ pattern }: { pattern: EnrichedPattern })`. The extra fields are unused inside it for now - that's fine.

### Task 3.4: Verify + commit

```bash
npx tsc --noEmit
npm run build  # surface any prod-build warnings
```

Visit `/patterns`. Expect: dark hero → small Experimental flag → THREE featured cards (lead on left at 2x width, two flanks stacked on the right). The shelf below is still the old 27 compact rows (we removed 3 from the shelf because they're now in the triplet).

```bash
git add src/pages/Patterns.tsx
git commit -m "patterns: featured triplet replaces single featured card

Lead + 2 flank cards in a 2:1 grid. Flank cards are compressed
PATTERN N · lens chip · headline · count + moveTag · CTA. Lens
color strip on left edge. Shelf below now contains 27 patterns
instead of 29 - patterns 02 and 03 surface here.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Phase 4: Triage lens bar + shelf upgrades

Goal: the pill row that lets the user filter by lens. The shelf rows gain a lens-color left edge and the moveTag visible at rest. Constellation node click filters the shelf.

### Task 4.1: Add the filter state

**Files:**
- Modify: `src/pages/Patterns.tsx` (the `Patterns()` function)

```typescript
type LensFilter = 'recommended' | Lens | 'all';

const [lensFilter, setLensFilter] = useState<LensFilter>('recommended');
const [projectFilter, setProjectFilter] = useState<string | null>(null);
```

`projectFilter` is set both by clicking a constellation node AND by selecting from the "By project" dropdown.

### Task 4.2: Compute the filtered shelf

Add a helper function above the `Patterns()` function:

```typescript
function filterPatterns(
  patterns: EnrichedPattern[],
  lensFilter: LensFilter,
  projectFilter: string | null,
): EnrichedPattern[] {
  let result = patterns;

  if (projectFilter) {
    result = result.filter(p => p.affected.some(a => a.id === projectFilter));
  }

  if (lensFilter === 'recommended') {
    result = result.filter(p => p.recommended);
  } else if (lensFilter !== 'all') {
    result = result.filter(p => p.lens === lensFilter);
  }

  return result;
}
```

In `Patterns()`, replace `rest` with:

```typescript
const shelfPatterns = filterPatterns(rest, lensFilter, projectFilter);
```

Wire `projectFilter` into the hero by passing a callback to `PatternsHero`:

```typescript
<PatternsHero
  // ... existing props
  onNodeClick={(id) => setProjectFilter(prev => prev === id ? null : id)}
  selectedProjectId={projectFilter}
/>
```

In `PatternsHero`, add `onNodeClick` and `selectedProjectId` to the prop signature and pass them to `RosterConstellation`. In `RosterConstellation`, when `selectedProjectId === id`, render the node 30% larger with a permanent halo.

### Task 4.3: Build the `LensTriageBar`

**Files:**
- Modify: `src/pages/Patterns.tsx` (add after `FeaturedTriplet`)

```typescript
function LensTriageBar({
  patterns, lensFilter, projectFilter, onLensChange, onProjectChange,
}: {
  patterns: EnrichedPattern[]; // pass ENRICHED_PATTERNS (full set), not rest
  lensFilter: LensFilter;
  projectFilter: string | null;
  onLensChange: (lens: LensFilter) => void;
  onProjectChange: (projectId: string | null) => void;
}) {
  const counts = {
    recommended: patterns.filter(p => p.recommended).length,
    win: patterns.filter(p => p.lens === 'win').length,
    defend: patterns.filter(p => p.lens === 'defend').length,
    shift: patterns.filter(p => p.lens === 'shift').length,
    infrastructure: patterns.filter(p => p.lens === 'infrastructure').length,
    all: patterns.length,
  };

  const pills: Array<{ key: LensFilter; label: string; count: number; color?: string }> = [
    { key: 'recommended',    label: 'Recommended',    count: counts.recommended },
    { key: 'win',            label: 'Wins',           count: counts.win,            color: LENS_COLOR.win },
    { key: 'defend',         label: 'Defend',         count: counts.defend,         color: LENS_COLOR.defend },
    { key: 'shift',          label: 'Shifts',         count: counts.shift,          color: LENS_COLOR.shift },
    { key: 'infrastructure', label: 'Infrastructure', count: counts.infrastructure, color: LENS_COLOR.infrastructure },
    { key: 'all',            label: 'All',            count: counts.all },
  ];

  return (
    <div className="reveal flex flex-wrap items-center gap-2" style={{ animationDelay: '420ms' }}>
      {pills.map((pill) => {
        const isActive = lensFilter === pill.key;
        return (
          <button
            key={pill.key}
            type="button"
            onClick={() => onLensChange(pill.key)}
            className="group inline-flex items-center gap-2 rounded-full px-4 py-[7px] text-[12.5px] font-semibold transition-all"
            style={{
              background: isActive ? '#0F0A1E' : '#FFFFFF',
              color: isActive ? '#FFFFFF' : '#1a1625',
              boxShadow: isActive
                ? '0 1px 0 rgba(255,255,255,0.10) inset, 0 8px 16px -10px rgba(15,10,30,0.40)'
                : 'inset 0 0 0 1px #e8e2f0',
              letterSpacing: '-0.005em',
            }}
          >
            {pill.color && (
              <span
                aria-hidden
                className="h-[7px] w-[7px] rounded-full"
                style={{ background: pill.color }}
              />
            )}
            {pill.label}
            <span
              className="tabular-nums"
              style={{
                fontFamily: '"Courier New", ui-monospace, monospace',
                fontSize: '11px',
                color: isActive ? 'rgba(255,255,255,0.65)' : '#85819a',
              }}
            >
              {pill.count}
            </span>
          </button>
        );
      })}

      <ProjectFilterDropdown
        projects={PROJECTS}
        selected={projectFilter}
        onChange={onProjectChange}
      />
    </div>
  );
}

function ProjectFilterDropdown({
  projects, selected, onChange,
}: {
  projects: { id: string; name: string }[];
  selected: string | null;
  onChange: (id: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const selectedProject = projects.find(p => p.id === selected);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-2 rounded-full px-4 py-[7px] text-[12.5px] font-semibold transition-all"
        style={{
          background: selected ? '#F5F2FF' : '#FFFFFF',
          color: '#1a1625',
          boxShadow: selected
            ? 'inset 0 0 0 1px rgba(127,90,240,0.30)'
            : 'inset 0 0 0 1px #e8e2f0',
          letterSpacing: '-0.005em',
        }}
      >
        {selectedProject ? selectedProject.name : 'By project'}
        <CaretDown size={11} weight="bold" className={open ? 'rotate-180 transition-transform' : 'transition-transform'} />
      </button>
      {open && (
        <div
          className="absolute left-0 top-[110%] z-20 min-w-[200px] rounded-xl bg-white p-1 shadow-xl"
          style={{ boxShadow: '0 0 0 1px #e8e2f0, 0 14px 28px -14px rgba(15,10,30,0.20)' }}
        >
          {selected && (
            <button
              type="button"
              onClick={() => { onChange(null); setOpen(false); }}
              className="block w-full rounded-lg px-3 py-2 text-left text-[13px] hover:bg-[#FBFAFF]"
              style={{ color: '#85819a' }}
            >
              Clear filter
            </button>
          )}
          {projects.map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => { onChange(p.id); setOpen(false); }}
              className={`block w-full rounded-lg px-3 py-2 text-left text-[13px] hover:bg-[#FBFAFF] ${selected === p.id ? 'bg-[#F5F2FF] font-semibold' : ''}`}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Task 4.4: Insert the triage bar above the shelf

In `Patterns()`:

```typescript
<LensTriageBar
  patterns={ENRICHED_PATTERNS}
  lensFilter={lensFilter}
  projectFilter={projectFilter}
  onLensChange={setLensFilter}
  onProjectChange={setProjectFilter}
/>

<div className="space-y-3">
  {shelfPatterns.map((p, i) => (
    <CompactPatternCard
      key={p.id}
      pattern={p}
      index={i}
      open={openId === p.id}
      onToggle={() => setOpenId(openId === p.id ? null : p.id)}
    />
  ))}
  {shelfPatterns.length === 0 && (
    <div
      className="rounded-2xl border border-dashed bg-white px-6 py-8 text-center"
      style={{ borderColor: '#e8e2f0', color: '#85819a' }}
    >
      <p className="text-[13px]">
        No patterns match this combination of filters.
      </p>
      <button
        type="button"
        className="mt-2 text-[12px] font-semibold text-ppc-purple-500 hover:underline"
        onClick={() => { setLensFilter('all'); setProjectFilter(null); }}
      >
        Clear filters
      </button>
    </div>
  )}
</div>
```

`ShelfDivider` can be removed - the lens pills replace it.

### Task 4.5: Add lens color strip + moveTag to `CompactPatternCard`

**Files:**
- Modify: `src/pages/Patterns.tsx` (`CompactPatternCard`)

Update the `pattern` prop type to `EnrichedPattern`. Inside, add the left-edge strip at the very top of the `<article>`:

```typescript
<span
  aria-hidden
  className="absolute inset-y-0 left-0 w-[4px]"
  style={{ background: LENS_COLOR[pattern.lens] }}
/>
```

(Article needs `relative` and `overflow-hidden` - it already has them.)

In the right-side icon cluster, between the project-dots and the driver-emoji pill, insert the moveTag:

```typescript
<span
  className="hidden md:inline-flex items-center gap-1 rounded-[6px] px-2 py-[3px] text-[11px] font-semibold tabular-nums"
  style={{
    fontFamily: '"Courier New", ui-monospace, monospace',
    background: '#F5F2FF',
    color: '#534AB7',
    boxShadow: 'inset 0 0 0 0.5px rgba(127,90,240,0.18)',
    letterSpacing: '-0.005em',
  }}
  title={pattern.recommendedActionCta}
>
  {pattern.moveTag}
  {pattern.dollarSuffix && (
    <span className="ml-1 font-normal" style={{ color: '#1F8458' }}>{pattern.dollarSuffix}</span>
  )}
</span>
```

Also bump the card's `pl-6` so content doesn't overlap the new 4px strip.

### Task 4.6: Recommended-tab caption

In `CompactPatternCard`, when `pattern.recommended && lensFilter === 'recommended'` (you'll need to pass the filter or just check `recommendedReason`), render a small italic caption beneath the headline:

```typescript
{pattern.recommended && pattern.recommendedReason && (
  <div className="mt-1 text-[11.5px] italic" style={{ color: '#85819a' }}>
    {pattern.recommendedReason}
  </div>
)}
```

Show this UNCONDITIONALLY when `recommendedReason` is set - it's useful regardless of filter, since it's a curated explanation.

### Task 4.7: Verify + commit

```bash
npx tsc --noEmit
npm run build
```

Manual checks (open `/patterns`):

1. Default lens is "Recommended" - shelf shows ~3-4 rows (6 recommended minus the 3 in the featured triplet, depending on which ones got picked into the featured trio).
2. Click "Wins" pill - shelf shows the 6 win patterns.
3. Click "Defend" - 10.
4. Click "Shifts" - 4.
5. Click "Infrastructure" - 10.
6. Click "All" - 27 (30 minus the 3 in featured).
7. Click a constellation node (e.g. Boulder Care) - shelf filters to Boulder's patterns. Click again - clears.
8. "By project" dropdown - same behavior, in sync with constellation click.
9. Each shelf row has a colored left strip matching its lens.
10. Each shelf row shows its moveTag in the right cluster.
11. Shelf shows empty state if filter combo yields zero.

```bash
git add src/pages/Patterns.tsx
git commit -m "patterns: triage lens bar + shelf upgrades

Adds the LensTriageBar above the shelf with 6 lens pills
(Recommended / Wins / Defend / Shifts / Infrastructure / All)
plus a By-project dropdown. CompactPatternCard gains a 4px
lens-color left edge and a moveTag chip in the right cluster.
Constellation node clicks share state with the project filter.
Empty-state shown when filters yield zero.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Phase 4b: Confidence badges + soft labels + reactive constellation

Goal: the three soul-bearing additions land here. After Phase 4 the page works functionally; this phase makes it FEEL like a flagging surface, not a verdict surface.

### Task 4b.1: Confidence dots on every CompactPatternCard

**Files:**
- Modify: `src/pages/Patterns.tsx` (`CompactPatternCard`, `FlankCard`)

Add a small `ConfidenceBadge` component:

```typescript
function ConfidenceBadge({ confidence, basis, onDark = false }: { confidence: number; basis: string; onDark?: boolean }) {
  const tier = confidence >= 80 ? 3 : confidence >= 65 ? 2 : 1;
  const filledColor = onDark ? 'rgba(255,255,255,0.85)' : '#475569';
  const emptyColor  = onDark ? 'rgba(255,255,255,0.18)' : '#cbd5e1';
  return (
    <span
      className="inline-flex items-center gap-1.5"
      title={basis}
      aria-label={`Confidence ${confidence}%: ${basis}`}
    >
      <span className="flex gap-[2px]">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="block h-[5px] w-[5px] rounded-full"
            style={{ background: i < tier ? filledColor : emptyColor }}
          />
        ))}
      </span>
      <span
        className="tabular-nums text-[10.5px]"
        style={{
          fontFamily: '"Courier New", ui-monospace, monospace',
          color: onDark ? 'rgba(255,255,255,0.55)' : '#85819a',
          letterSpacing: '0.04em',
        }}
      >
        {confidence}% conf
      </span>
    </span>
  );
}
```

In `CompactPatternCard`'s right cluster, add the badge BEFORE the moveTag chip:

```typescript
<ConfidenceBadge confidence={pattern.confidence} basis={pattern.confidenceBasis} />
<span className="hidden md:inline-flex ...">{pattern.moveTag}...</span>
```

In `FlankCard`, place the badge under the count-and-moveTag row.

In `FeaturedPatternCard`, place it in the metadata strip near the affected/driven-by panel.

### Task 4b.2: Soft labels on the pattern card expansion

**Files:**
- Modify: `src/pages/Patterns.tsx` (`CompactPatternCard`, `FeaturedPatternCard`)

In every `PatternField` call inside the expansion bodies:

```typescript
// Before:
<PatternField label="What we found" ... />
<PatternField label="Why it matters across your roster" ... />
<PatternField label="Recommended action" ... />

// After:
<PatternField label="What we noticed" ... />
<PatternField label="Why it matters" ... />
<PatternField label="What we'd try" ... />
```

Update both the featured card and the compact card expansion. The vocabulary is the message.

### Task 4b.3: Reactive constellation (click to reflow)

**Files:**
- Modify: `src/pages/Patterns.tsx` (`RosterConstellation`)

When `selectedProjectId` is set, animate:
- The selected node toward canvas center (600, 180).
- Its connected edges to 1.8px stroke-width and 0.85 opacity.
- Unconnected nodes scale by 0.75 and fade to 0.30 opacity.

Implementation:

```typescript
function RosterConstellation({
  patterns, hoveredNodeId, selectedNodeId, onNodeHover, onNodeClick,
}: {
  patterns: EnrichedPattern[];
  hoveredNodeId: string | null;
  selectedNodeId: string | null;
  onNodeHover: (id: string | null) => void;
  onNodeClick: (id: string) => void;
}) {
  const edges = computeConstellationEdges(patterns);
  const CENTER = { x: 600, y: 180 };

  // Compute the destination position for each node given the selection.
  // Selected node goes to center; others stay put but scale + fade.
  const nodePos = (id: string) => {
    if (selectedNodeId === id) return CENTER;
    return NODE_COORDS[id];
  };
  const connectedToSelected = (id: string) => {
    if (!selectedNodeId) return true;
    return id === selectedNodeId || edges.some(e =>
      (e.from === selectedNodeId && e.to === id) || (e.to === selectedNodeId && e.from === id)
    );
  };

  return (
    <svg viewBox="0 0 1200 360" preserveAspectRatio="xMidYMid meet" className="h-full w-full">
      <g>
        {edges.map((edge) => {
          const a = nodePos(edge.from);
          const b = nodePos(edge.to);
          if (!a || !b) return null;
          const involvedInSelection = selectedNodeId && (edge.from === selectedNodeId || edge.to === selectedNodeId);
          const isHighlighted = involvedInSelection || (hoveredNodeId && (edge.from === hoveredNodeId || edge.to === hoveredNodeId));
          const dimmed = selectedNodeId && !involvedInSelection;
          const baseOpacity = Math.min(0.7, 0.15 + edge.sharedCount * 0.12);
          return (
            <line
              key={`${edge.from}-${edge.to}`}
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke={isHighlighted ? '#FFFFFF' : '#A88CFF'}
              strokeOpacity={dimmed ? 0.08 : (isHighlighted ? 0.85 : baseOpacity)}
              strokeWidth={isHighlighted ? 1.8 : 1}
              className={edge.pulsing && !selectedNodeId ? 'constellation-pulse' : ''}
              style={{ transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)' }}
            />
          );
        })}
      </g>
      <g>
        {Object.entries(NODE_COORDS).map(([id]) => {
          const project = PROJECTS.find(p => p.id === id);
          if (!project) return null;
          const pos = nodePos(id);
          const connected = connectedToSelected(id);
          const isSelected = selectedNodeId === id;
          const isHovered = hoveredNodeId === id;
          const chip = projectChipColor(id);
          const r = isSelected ? 14 : (isHovered ? 11 : (connected ? 9 : 7));
          const opacity = connected ? 1 : 0.30;
          return (
            <g
              key={id}
              transform={`translate(${pos.x}, ${pos.y})`}
              style={{ cursor: 'pointer', transition: 'transform 600ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms' }}
              opacity={opacity}
              onMouseEnter={() => onNodeHover(id)}
              onMouseLeave={() => onNodeHover(null)}
              onClick={() => onNodeClick(id)}
            >
              <circle r={isHovered || isSelected ? 22 : 0} fill="#A88CFF" opacity={isSelected ? 0.30 : (isHovered ? 0.20 : 0)} style={{ transition: 'r 200ms ease, opacity 200ms ease' }} />
              <circle r={r} fill={chip.fg} stroke="#FFFFFF" strokeOpacity={0.85} strokeWidth={isSelected ? 2 : 1} style={{ transition: 'r 300ms ease' }} />
              <text y={26} textAnchor="middle" fontSize="11" fontWeight={isSelected ? 700 : 600} fill={isSelected || isHovered ? '#FFFFFF' : 'rgba(255,255,255,0.70)'} fontFamily="Figtree, system-ui, sans-serif" style={{ pointerEvents: 'none', transition: 'fill 200ms ease' }}>
                {project.name}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
```

In `PatternsHero`, pass both `selectedProjectId` (from page state) and `hoveredNodeId` (local state) to RosterConstellation. Wire `onNodeClick` to toggle: if same node clicked, deselect; else select.

Add an Esc-key handler on the page:

```typescript
useEffect(() => {
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && projectFilter) setProjectFilter(null);
  };
  window.addEventListener('keydown', onKey);
  return () => window.removeEventListener('keydown', onKey);
}, [projectFilter]);
```

### Task 4b.4: Stats strip rotation

In `PatternsHero`, replace the static stats strip with a rotating one:

```typescript
const [statsMode, setStatsMode] = useState<'count' | 'observation'>('count');
const [obsIdx, setObsIdx] = useState(0);

useEffect(() => {
  const t = setInterval(() => {
    setStatsMode(m => m === 'count' ? 'observation' : 'count');
    if (statsMode === 'observation') setObsIdx(i => (i + 1) % STATS_OBSERVATIONS.length);
  }, 12000);
  return () => clearInterval(t);
}, [statsMode]);
```

Render with a 400ms crossfade between modes. The mode B string sources from `STATS_OBSERVATIONS`.

### Task 4b.5: Empty-state language

In the `shelfPatterns.length === 0` branch, replace `"No patterns match this combination of filters."` with `"Nothing here yet  -  we're still reading."`.

### Task 4b.6: Footer correction invite

Above `PatternsReturnBanner`, add:

```typescript
<p className="text-center text-[12.5px]" style={{ color: '#85819a' }}>
  Spotted something we missed?{' '}
  <a href="mailto:feedback@ppc.io" className="font-semibold text-ppc-purple-500 hover:underline">
    Tell us at feedback@ppc.io
  </a>
</p>
```

### Task 4b.7: Verify + commit

```bash
npx tsc --noEmit
```

Manual checks:
- Every pattern card shows a 3-dot confidence indicator + percent at rest.
- Expansion labels read "What we noticed" / "Why it matters" / "What we'd try".
- Click a constellation node - it animates to center, others fade, edges thicken on its threads.
- Press Esc - constellation snaps back.
- Wait 12s on the page - stats strip swaps to a self-observation.
- Apply an impossible filter combo - empty-state reads soft language.
- Footer correction invite visible above the return banner.

```bash
git add src/pages/Patterns.tsx
git commit -m "patterns: soul layer - confidence, soft labels, reactive map

Adds the vulnerability-as-design-choice layer:
- 3-dot confidence indicator + percent on every pattern card
- Soft labels: 'What we noticed' / 'Why it matters' / 'What we would try'
- Reactive constellation: click a node and it reflows to center
- Stats strip rotates between count mode and self-observation mode
- Empty state reads soft ('Nothing here yet - we are still reading')
- Footer invites correction at feedback@ppc.io

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Phase 4c: Still watching zone

Goal: 4-5 candidate signals that aren't promoted patterns yet. Where the vulnerability layer becomes a discrete UI block.

### Task 4c.1: Build `StillWatchingZone`

**Files:**
- Modify: `src/pages/Patterns.tsx` (add `StillWatchingZone` + `CandidateCard`)

```typescript
function StillWatchingZone({ signals }: { signals: CandidateSignal[] }) {
  return (
    <section className="reveal" style={{ animationDelay: '780ms' }}>
      <div className="mb-3 flex items-baseline gap-3 px-1">
        <span
          className="text-[10.5px] font-bold uppercase tracking-[0.14em]"
          style={{ fontFamily: '"Courier New", ui-monospace, monospace', color: 'rgba(15,10,30,0.62)' }}
        >
          STILL WATCHING
        </span>
        <span aria-hidden className="h-px flex-1" style={{ background: 'linear-gradient(90deg, rgba(127,90,240,0.22) 0%, transparent 100%)' }} />
        <span className="tabular-nums text-[12px]" style={{ color: '#85819a' }}>{signals.length}</span>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {signals.map(s => <CandidateCard key={s.id} signal={s} />)}
      </div>
    </section>
  );
}

function CandidateCard({ signal }: { signal: CandidateSignal }) {
  return (
    <article
      className="rounded-[14px] px-5 py-4"
      style={{
        background: 'rgba(255,255,255,0.60)',
        border: '1px dashed #cdc6dd',
      }}
    >
      <div className="flex flex-wrap gap-1.5">
        {signal.affected.map(a => (
          <span
            key={a.id}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-[3px] text-[11px] font-semibold"
            style={{ background: '#F0EBFF', color: '#534AB7' }}
          >
            {a.name}
          </span>
        ))}
      </div>
      <p className="mt-3 text-[14px] font-semibold leading-[1.4] text-ppc-ink">
        {signal.observation}
      </p>
      <p className="mt-2 text-[12.5px] italic leading-[1.5]" style={{ color: '#85819a' }}>
        {signal.whyNotPromoted}
      </p>
    </article>
  );
}
```

### Task 4c.2: Mount in `Patterns()`

Insert between the main shelf and the footer return banner:

```typescript
<StillWatchingZone signals={CANDIDATE_SIGNALS} />
```

### Task 4c.3: Verify + commit

Visit `/patterns`. Scroll past the shelf. The "Still watching" zone is visible with 4 candidate cards in a 2-column grid (1 column on mobile). Each has projects, an observation, and a "why not promoted" italic caption. Dashed border, no shadow.

```bash
git add src/pages/Patterns.tsx
git commit -m "patterns: still watching zone for tentative signals

Adds CANDIDATE_SIGNALS authored data + StillWatchingZone component.
4 signals mock-authored - things io is watching but has not promoted
to patterns yet. Cards have dashed borders, no CTAs, captioned with
why each is still being watched. The vulnerability layer made into
a discrete UI block.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Phase 5: 'All' grouped view (the atlas fallback)

Goal: when the user clicks "All", patterns are grouped under categorical-theme banners instead of streaming in rank order. Gives the atlas its rhythm without losing the lens-color cue.

### Task 5.1: Build `GroupedShelf`

```typescript
function GroupedShelf({
  patterns, openId, onToggle,
}: {
  patterns: EnrichedPattern[];
  openId: string | null;
  onToggle: (id: string) => void;
}) {
  const groups: Record<CategoryGroup, EnrichedPattern[]> = {
    'AUCTION & COMPETITION': [],
    'ATTRIBUTION & TRACKING': [],
    'SPEND EFFICIENCY': [],
    'KEYWORDS & MATCH': [],
    'BID STRATEGY': [],
    'CREATIVE & LP': [],
    'AUDIENCE & DEMAND': [],
    'FEED & COHORT': [],
  };
  patterns.forEach(p => groups[p.categoryGroup].push(p));

  // Within each group, sort by lens priority (win > infra > defend > shift) then rank
  const lensOrder: Record<Lens, number> = { win: 0, infrastructure: 1, defend: 2, shift: 3 };
  Object.keys(groups).forEach(k => {
    groups[k as CategoryGroup].sort((a, b) => {
      const lensDiff = lensOrder[a.lens] - lensOrder[b.lens];
      return lensDiff !== 0 ? lensDiff : a.rank - b.rank;
    });
  });

  return (
    <div className="space-y-7">
      {(Object.entries(groups) as Array<[CategoryGroup, EnrichedPattern[]]>)
        .filter(([, items]) => items.length > 0)
        .map(([group, items], gi) => (
          <div key={group}>
            <div className="mb-3 flex items-baseline gap-3">
              <span
                className="text-[10.5px] font-bold uppercase tracking-[0.14em]"
                style={{ fontFamily: '"Courier New", ui-monospace, monospace', color: 'rgba(15,10,30,0.62)' }}
              >
                {group}
              </span>
              <span aria-hidden className="h-px flex-1" style={{ background: 'linear-gradient(90deg, rgba(127,90,240,0.22) 0%, transparent 100%)' }} />
              <span className="tabular-nums text-[12px]" style={{ color: '#85819a' }}>
                {items.length}
              </span>
            </div>
            <div className="space-y-3">
              {items.map((p, i) => (
                <CompactPatternCard
                  key={p.id}
                  pattern={p}
                  index={gi * 10 + i}
                  open={openId === p.id}
                  onToggle={() => onToggle(p.id)}
                />
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}
```

### Task 5.2: Wire it conditionally

In `Patterns()`:

```typescript
{lensFilter === 'all' && !projectFilter ? (
  <GroupedShelf
    patterns={rest}
    openId={openId}
    onToggle={(id) => setOpenId(openId === id ? null : id)}
  />
) : (
  <div className="space-y-3">
    {shelfPatterns.map((p, i) => (
      <CompactPatternCard ... />
    ))}
    {/* empty state */}
  </div>
)}
```

Note: `GroupedShelf` ignores the projectFilter combo for simplicity. When the user filters by project, fall back to the flat shelf.

### Task 5.3: Verify + commit

Click "All". Expect: 8 category-grouped sections, each with mono Courier header and count, patterns sorted Wins-first within each group. Lens color strips still visible on rows. Toggle to "Recommended" - flat shelf returns.

```bash
git add src/pages/Patterns.tsx
git commit -m "patterns: grouped All view (the atlas)

The 'All' lens shows patterns under 8 categorical theme banners
(AUCTION & COMPETITION, ATTRIBUTION & TRACKING, etc) with mono
Courier headers and counts. Patterns within each group sort by
lens priority (Wins first, then Infrastructure, Defend, Shifts).
Atlas rhythm without losing the lens-color cue.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Phase 6: Polish + parallel review

Goal: catch the regressions before Stewart does.

### Task 6.1: Brand-token grep

Per the smoke-test-means-brand-test memory rule, run this grep before claiming the work is shippable:

```bash
cd "/Users/stew/PPC CLAUDE WORKSPACE/ppc-io-saas/_react-mockup"

# Retired tokens that should NOT appear in our changes
grep -nE "Roboto Mono|JetBrains Mono|Geist Mono|PP Mondwest|Fraunces|#000000|#000\b" src/pages/Patterns.tsx
```

Expected: zero hits. If any hit, replace with the v5 equivalent (Courier New for mono, #0F0A1E or #07050D for "black", Outfit retired in favor of Figtree-display).

```bash
# Spaces of em-dashes accidentally introduced
grep -n " - " src/pages/Patterns.tsx
```

Expected: zero hits. If any, replace with " - " or rephrase.

### Task 6.2: Animation gates

Confirm `prefers-reduced-motion` disables:
- The `.constellation-pulse` animation
- The `.live-pulse` animation
- The typewriter cycle

Open Chrome DevTools → Rendering → Emulate CSS media feature `prefers-reduced-motion: reduce`. Reload `/patterns`. All three should be static.

### Task 6.3: Visual regression - manual screenshot pass

Open `/patterns` at three widths and verify each:

| Width | What to check |
|---|---|
| 1440px (laptop) | Hero 560px tall, constellation centered, typewriter centered. Triplet 2:1. Pills wrap clean. |
| 1280px (smaller laptop) | Triplet still 2:1 but tighter. |
| 768px (tablet) | Triplet collapses to single column. Constellation labels still legible (or hide labels under 768px). |

Save screenshots into `docs/plans/2026-05-17-screenshots/` for the PR description.

### Task 6.4: Dispatch parallel review agents

Per Stewart's `atomic_pr_with_parallel_review` pattern, dispatch THREE Explore agents in parallel on the current branch to catch what I missed:

1. **Visual / Brand review.** Prompt: "Read `src/pages/Patterns.tsx` start-to-end. Compare against `docs/design-system/DESIGN-SYSTEM.md` v5. Flag any token use that drifts from v5 (font, color, radius, shadow). Flag any retired tokens. Flag any anthropomorphising language ('io', 'we found', 'I'm watching') in user-facing strings. Quote line numbers."

2. **Architecture / Dead-code review.** Prompt: "Read `src/pages/Patterns.tsx`. List any helpers, components, or imports that became unused as a result of the rewrite (PatternsPageHeader, PatternsExplainer, PersonaNote, ShelfDivider, countUniqueProjects). Flag any obvious memoisation gaps (Patterns array sorts running every render). Quote line numbers."

3. **Empty-state / Interaction review.** Prompt: "Read `src/pages/Patterns.tsx`. Walk through every interactive flow: typewriter on hover; constellation node hover, click, click again; each of the 6 lens pills; the project dropdown; empty-state when filters yield zero. Flag any path that breaks, loops, or shows stale state."

Run them in a single message via Agent tool. Read each summary, fix anything substantive, re-run tsc.

### Task 6.5: Final tsc + build

```bash
npx tsc --noEmit
npm run build
```

Both must pass. If `npm run build` emits ANY warning that didn't exist on the baseline (Task 0.2), fix it before committing.

### Task 6.6: Final commit

```bash
git add src/pages/Patterns.tsx docs/plans/2026-05-17-screenshots/
git commit -m "patterns: polish, reduced-motion gates, review fixes

- Confirmed no retired tokens or em-dashes
- prefers-reduced-motion disables all 3 animations
- Visual regression checked at 1440 / 1280 / 768
- Three parallel review agents dispatched on the branch; their
  findings folded back into this commit

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

### Task 6.7: Hand back to Stewart

Present the diff and the screenshots. Honest framing if anything isn't visually verified ("I haven't manually exercised the prefers-reduced-motion gate" - if true). Don't claim success on anything not actually checked.

---

## Appendix A: Pattern → Lens map (full table)

| ID | Lens | Move tag | Recommended | Category group |
|---|---|---|---|---|
| p-01 | Win | Lift non-brand bids | ✓ | AUCTION & COMPETITION |
| p-02 | Win | Set up daypart test | | SPEND EFFICIENCY |
| p-03 | Infrastructure | Shared negatives list | ✓ | KEYWORDS & MATCH |
| p-04 | Defend | Cross-account audit | ✓ | AUCTION & COMPETITION |
| p-05 | Infrastructure | Shared negatives list | | KEYWORDS & MATCH |
| p-06 | Win | Set up daypart test | | SPEND EFFICIENCY |
| p-07 | Infrastructure | Audit shared GTM | ✓ | ATTRIBUTION & TRACKING |
| p-08 | Defend | Revert bid strategy | | BID STRATEGY |
| p-09 | Shift | Pull auction insights | | KEYWORDS & MATCH |
| p-10 | Defend | Defensive brand bids | ✓ | AUCTION & COMPETITION |
| p-11 | Infrastructure | Build cross-acct negs | | KEYWORDS & MATCH |
| p-12 | Infrastructure | Refresh RSAs on five | | CREATIVE & LP |
| p-13 | Win | Attach audience signals | ✓ | AUDIENCE & DEMAND |
| p-14 | Defend | Adjust daily caps | | SPEND EFFICIENCY |
| p-15 | Shift | Pull CPC trends | | SPEND EFFICIENCY |
| p-16 | Infrastructure | Audit mobile LPs | | CREATIVE & LP |
| p-17 | Win | Apply geo bid adj | | SPEND EFFICIENCY |
| p-18 | Infrastructure | Baseline negatives list | | KEYWORDS & MATCH |
| p-19 | Shift | Spot-check SERPs | ✓ | CREATIVE & LP |
| p-20 | Defend | Add to watchlist | | AUCTION & COMPETITION |
| p-21 | Defend | Refresh PMAX assets | | CREATIVE & LP |
| p-22 | Defend | Defensive brand bids | | AUCTION & COMPETITION |
| p-23 | Infrastructure | Extend conv windows | | ATTRIBUTION & TRACKING |
| p-24 | Defend | Re-feed Merchant | | FEED & COHORT |
| p-25 | Defend | Add IP exclusions | | SPEND EFFICIENCY |
| p-26 | Defend | Lower tCPA | | FEED & COHORT |
| p-27 | Win | Test Max Conv Value | | BID STRATEGY |
| p-28 | Infrastructure | Exclude brand from PMAX | | ATTRIBUTION & TRACKING |
| p-29 | Shift | Hold LP changes | | CREATIVE & LP |
| p-30 | Infrastructure | Cross-account exclusions | | AUDIENCE & DEMAND |

Totals: **Win 6 · Defend 10 · Shift 4 · Infrastructure 10 = 30**. **Recommended 6**.

---

## Appendix B: Constellation coordinates

8 nodes in a 1200×360 SVG viewBox:

| Project | (x, y) |
|---|---|
| boulder-care | (220, 110) |
| the-hoth | (430, 280) |
| durable | (640, 60) |
| linkbuilder | (980, 200) |
| livingyoung | (350, 340) |
| authority-builders | (1080, 90) |
| edwin-novel | (760, 320) |
| flock | (820, 160) |

These are aesthetic guesses. Tune if labels collide.

---

## Appendix C: Tokens and rules to honor

- **Black-led dark surfaces.** `#0F0A1E → #07050D` vertical, purple bloom max 0.18 opacity at top center. Never pure `#000000`. (From memory: `feedback_dark_surfaces_black_led_white_icons`.)
- **Inactive light text on dark = `rgba(255,255,255,0.55–0.78)`.** Never lavender hex like `#7A7388`.
- **Mono = Courier New.** Not Roboto Mono, not JetBrains Mono, not Geist Mono.
- **Display = Figtree 900.** Not Outfit on app surfaces.
- **Eyebrow / micro-mono = Courier New with tracking 0.10–0.18em.**
- **Headlines end with an italic-serif purple period** (font-serif italic, `#7F5AF0` on light, `#A88CFF` on dark).
- **No em-dashes** in any user-facing string.
- **No anthropomorphising the app.** No "io thinks", "we found", "I'm watching" in chrome. Pattern cards quote the existing declarative `whatWeFound` / `whyItMatters` prose - that's fine, it's authored as observations not as a character speaking.
- **No fabricated dollar figures.** `dollarSuffix` is set only when the source `whatWeFound` or `whyItMatters` prose quotes a figure. Default `null`.
