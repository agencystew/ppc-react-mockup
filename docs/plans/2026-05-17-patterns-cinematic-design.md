# Patterns  -  Cinematic Re-think

**Date:** 2026-05-17
**Scope:** `src/pages/Patterns.tsx` only. No backend. No other files touched.
**Status:** Design locked, ready for implementation plan.

---

## The posture (read this first)

Patterns is the **flagging surface**, not the verdict surface. The honest frame is: *"We don't always have full context. We can't always tell what's causing things. But here's some stuff we noticed showing up across your work that looks like it might matter, and a few signals we're still watching but can't promote yet."*

This vulnerability **is the differentiation**. Every AI dashboard pretends omniscience. We don't. Same posture as the rest of the reports.

**Important: this rule is not delivered through paragraph-length hero subtitles** (boring, skippable). It's encoded in the design choices themselves:
- Confidence indicators visible on every pattern card at rest
- A dedicated "Still watching" zone for tentative signals that aren't ready to be patterns yet
- Pattern card labels say "What we noticed" / "What we'd try", not "What we found" / "Recommended action"
- The empty-state when filters yield zero reads "Nothing here yet - we're still reading" not "No results"
- Stats strip occasionally swaps the count for a self-observation ("Edwin Novel's data is thin this week - one new run")
- A quiet footer line invites correction: "Spotted something we missed? Tell us at feedback@ppc.io"

The user picks up the posture over multiple visits. Telling them once in a subtitle does nothing.

## Audience

The page is one surface for two audiences:

- **Agency owners / COOs** opening their book in the morning - read the hero + featured triplet in 30 seconds, close the laptop, know what's going on.
- **In-house marketers** managing campaigns inside a single advertiser - scroll past the hero, hit the lens pills, filter to Wins, dispatch specific moves.

The "node" in the constellation isn't an "account" or a "client" - it's just whatever the user has named as a `project` in their workspace. Could be a client (agency), a brand (parent advertiser), a campaign group (in-house). The component is data-agnostic. All chrome avoids "roster"/"client" framing - we use "projects" or "across your work."

---

## Why we're re-thinking

Patterns is the flagship cross-account synthesis surface  -  the place where the app reads across all of a user's projects (clients, brands, or campaigns) and surfaces threads that span them. Today it isn't earning that promise:

1. **Hero apologises for itself.** Plain "Patterns. Experimental" on lavender, then a "What this is" explainer card. The original spec deliberately avoided a dark editorial hero. That decision is being reversed  -  this should feel like the strategic briefing surface, not a list view.
2. **The shelf is 29 identical rows.** Same black mono badge, same purple eyebrow, same headline weight, same chevron. No severity, no dollar impact, no grouping. By PATTERN 08 the eye has nowhere to land.
3. **No headline thesis.** The page just lists outputs. There's no single sentence at the top that captures what's actually happening across the work this week.
4. **No project map.** Patterns is about *connections* across projects  -  the page never visualises them as a connected system.
5. **No triage.** "Here's 30 patterns, scroll for yourself" is the opposite of a world-class AI app. The default view should BE the recommendation, not the full database.

---

## The five sections of the new page

### 1. Cinematic dark hero (560px tall)

Full-bleed, black-led gradient (`#07050D → #0F0A1E` vertical) with a soft purple bloom radiating from top-center (~`rgba(127,90,240,0.18)`, existing v5 token).

**Anatomy, top to bottom:**

- **Top strip.** Mono Courier eyebrow `PATTERNS` top-left. Right side: `Last sweep · 2h ago` with the live-pulse mint dot. Below the eyebrow, the page H1: `Cross-account synthesis.` in Figtree 900 white with italic-purple period. **No prose subtitle.** The vulnerability isn't introduced here - it lives in design micro-choices below (confidence badges, "Still watching" zone, label vocabulary). The hero stays clean.
- **Atmosphere layer (behind the constellation).** 40-60 slow-drifting purple particles, very low opacity (0.05-0.12), pure CSS via a single SVG layer with a `dp-drift` keyframe animation. Each particle is a 2-3px circle with a slow upward translate over ~14-20s, randomised stagger. Coffee-ad afternoon-light feel. Disabled under `prefers-reduced-motion`. Cost: ~6kb of SVG, no JS.
- **Centerpiece: project constellation.** 8 project nodes (Boulder Care, The HOTH, Durable, LinkBuilder, LivingYoung, Authority Builders, Edwin Novel, Flock) arranged organically across the canvas  -  not a grid, more like a star map. Each node uses the project's existing chip color from `projectChipColor()`. Lines drawn between projects that share patterns; opacity scales to the count of shared patterns between that pair. Top 3 edges (representing the top 3 patterns) pulse softly every 4s. Hovering a node lights its threads brighter and dims others.
- **Thesis line overlay (lower-third, centered).** White Figtree 900, ~38px, with italic-purple period. Typewriter-and-backspace cycle through the existing `pattern.headline` strings (30 of them, already authored in clean declarative voice). Pace: ~50ms/char typing, 25ms/char backspace, 1.5s pause at full string, ~5s per full cycle. **Pauses on hover** so people can read what catches their eye. Sample headlines from the data:
  > *"Three SEO-tool accounts hit by the same paid-auction shift."*
  > *"Five accounts have GCLID drop-off above 14%  -  attribution is leaking."*
  > *"PMAX is feeding both your SaaS accounts queries far from buyer intent."*

  No invented voice. The typewriter rotates through the same headlines that appear on the cards below. The effect is "here's a glimpse of what's surfaced this week, one at a time."
- **Bottom stats strip.** Mono Courier, white at 70% opacity: `92 findings · 31 runs · 8 projects · 30 patterns surfaced`. Real numbers, computed from data.

**Animation budget:**
- Constellation dots fade in staggered, ~600ms total.
- Edges draw with `stroke-dasharray` from 0 to full length, ~400ms.
- Edge pulse loop: 4s, only the top 3 edges animate.
- Typewriter cycle: ~5s per thesis, infinite, pauses on hover.
- All CSS + SVG. No canvas, no D3.

**Constellation interaction (reactive mode):** Hovering a node lights its threads (current spec). **Clicking a node does more than filter** - the constellation REFLOWS:
- The clicked node animates to the canvas center (200ms ease-out).
- Its connected edges thicken to 1.8px and brighten to ~0.85 opacity.
- Unconnected nodes fade to ~0.30 opacity and shrink by 25%.
- Patterns touching that node fly into the shelf below with a stagger (40ms between rows).
- Clicking the same node again, clicking empty canvas, or pressing Esc returns the constellation to its star-map position with a spring-ease (300ms).

This is the moment that makes someone show their friend the page. CSS transforms + a single `transform: translate()` per node, all driven by the same `selectedProjectId` state already used by the lens "By project" pill.

**Stats strip mode rotation:** Every ~12s the strip swaps between two modes (no announcement, no fade-out chrome - just a 400ms crossfade):
- Mode A (default): `92 findings · 31 runs · 8 projects · 30 patterns surfaced`
- Mode B (self-observation): A short string sampled from a list of 4-5 honest observations about THIS week's data. Examples:
  > "Edwin Novel's data is the thinnest this week - one new run."
  > "No new runs on Authority Builders in the last 7 days."
  > "PMAX patterns are the densest cluster this week - 4 of 30."
  > "We haven't seen Boulder Care for 3 days."

  These read as the app owning the gaps. Authored by hand alongside the patterns, sampled in rotation. Computed from the data at module load time when possible (e.g., "no new runs in X days" can be derived from `surfacedAt`).

### 2. Featured triplet (replaces single featured card)

Three cards in a row, ~16px gap.

- **Lead card** (left, 2x wider): the current `FeaturedPatternCard` editorial spread, slightly slimmer padding so the triplet fits at 1280px+. PATTERN 01 lives here.
- **Two flank cards** (right, stacked or side-by-side depending on viewport): compressed format  -  `PatternRankBadge`, severity dots, headline, impact tag, single CTA button. PATTERN 02 and PATTERN 03 live here.

On viewports <1024px, collapses to a single column (lead first, then flanks stacked).

### 3. The triage bar (the big shelf fix)

Right under the triplet, a horizontal row of lens pills. Pills use the existing v5 pill pattern (lavender bg for active, ink fg, mono Courier for the count).

```
[ Recommended · 6 ]   [ Wins · 5 ]   [ Defend · 11 ]   [ Shifts · 5 ]   [ Infrastructure · 9 ]   [ By project ▾ ]   [ All 30 ]
```

**These are categorical lenses, not impact rankings.** The AI can't honestly quantify dollar impact from cross-account inferences, so we don't pretend to. Lenses surface different *kinds* of pattern.

- **Recommended** (DEFAULT, ~6 patterns). The app's curated front page. Composite of three honest signals:
  - **Breadth:** number of projects touched (≥3 ranks above 2 ranks above 1)
  - **Novelty:** surfaced in the last 7 days
  - **Decidability:** the move is actionable now, not "wait and see"
  
  Recommended deliberately mixes lens types  -  one Win, two Threats, one Shift, etc  -  so the operator sees the full picture in the default view. Each row in this tab gets a small italic caption explaining the pick: *"3 projects · new this week · single decisive move"*.

- **Wins** (5 patterns). Opportunities to ship: bid levers, audience signals, strategy tests, freshly-soft auctions. The upside lens. Examples in current data: `p-01` lift non-brand bids while CPCs are soft · `p-13` attach unused customer-match audiences · `p-27` test Max Conv Value strategy.

- **Defend** (11 patterns = threats + risks merged). New competitors, brand-bidding incursions, degrading metrics, runaway budgets. The defensive lens. Examples: `p-10` new competitor in 3 brand auctions · `p-22` direct competitor brand-bidding on two accounts · `p-26` new-customer LTV decay.

- **Shifts** (5 patterns). Market or Google-side changes the operator absorbs but didn't cause. Critical because they reframe what looks like "our problem" as "an industry problem". Examples: `p-09` Google reweighted QS · `p-19` SERP layout change · `p-29` LP-experience tier recalibrated.

- **Infrastructure** (9 patterns). The highest-leverage lens  -  one fix lands across N accounts. Shared tag templates, baseline negative lists, PMAX brand exclusions, audience overlap. Examples: `p-07` GCLID drop-off on 5 accounts (one consent-mode fix) · `p-18` six negatives missing from 5 accounts ($4K combined recovery from one shared list) · `p-30` Durable & Flock customer-match overlap (cross-account exclusion).

- **By project ▾.** Dropdown of the 8 projects. Selecting one filters to its patterns. **Also driven by clicking a node in the constellation hero  -  single source of truth for project-filter state.**

- **All 30.** Falls back to the categorical-theme grouping (see §4).

Active pill: lavender-filled, ink text. Inactive: white bg with thin border. Standard v5 chip pattern.

### 4. The shelf itself

**Default view (Recommended and most lens tabs):** flat list of `CompactPatternCard` instances, but with two visual upgrades over today's monotone row:

- **Lens-color strip on the left edge.** 4px vertical bar running the full card height, color-keyed to the pattern's primary lens:
  - Wins: green `#16A34A`
  - Defend: red `#DC2626`
  - Shifts: amber `#D97706`
  - Infrastructure: indigo `#534AB7`
  
  This is the new visual rhythm. Scrolling the shelf, the operator sees a vertical color sequence that already communicates the mix of what's happening. No more 29 identical rows  -  the eye lands on color clusters.

- **Move-type tag visible at rest**, sits in the right-side cluster between the driver-emoji pill and the chevron. Lifted from each pattern's existing `recommendedActionCta`, truncated to ~4 words. Examples: `Lift non-brand bids` · `Defensive brand campaigns` · `Shared negatives list` · `Refresh PMAX assets` · `Audit shared GTM`. Mono Courier, 11.5px, slate ink. **No invented dollar figures.** This tells the operator the move, not a fabricated impact.

  A few patterns in the source data DO carry a real, source-attributed dollar estimate (e.g. `p-02` "$1,200/mo" lifted from `whyItMatters` prose, `p-18` "$4K combined"). When and only when the pattern's own copy quotes a figure, an optional small `~$X` suffix is allowed on the tag. Default is no dollar.

**The "All 30" view** keeps the categorical-theme grouping for readers who want the full atlas:
- `AUCTION & COMPETITION` (4)
- `ATTRIBUTION & TRACKING` (3)
- `SPEND EFFICIENCY` (5)
- `KEYWORDS & MATCH` (4)
- `BID STRATEGY` (3)
- `CREATIVE & LP` (4)
- `AUDIENCE & DEMAND` (2)
- `FEED & COHORT` (5)

Each group: mono Courier header (`AUCTION & COMPETITION`, ink at 60%), thin gradient rule, count chip on the right, compact cards beneath. Patterns within a group sort by lens (Wins first, then Infra, then Defend, then Shifts) then by breadth.

**Accordion behavior preserved.** Click a row to expand inline (current `pattern-expansion` body).

**Confidence indicator on every row, visible at rest.** A tiny 3-dot scale rendered next to the moveTag:

```
●●○  78% conf
```

Three dots: filled count = confidence tier (1/3 low, 2/3 medium, 3/3 high). A subtle `XX% conf` label in mono Courier next to it. Hovering shows a tooltip explaining the basis: *"Based on 4 corroborating signals across 3 runs."* On dark surfaces and on light, the dots use slate ink at 78% / 40% opacity. This is the vulnerability surfaced everywhere, not just in the explainer.

**Pattern card section label vocabulary** (inside the expansion):
- `What we found` → `What we noticed`
- `Why it matters across your roster` → `Why it matters`
- `Recommended action` → `What we'd try`

These read as observation and suggestion, not as verdict. Subtle but cumulative.

---

### 4b. "Still watching" zone (the vulnerability layer made concrete)

Below the main shelf, a dedicated section for tentative observations that aren't ready to be patterns yet. The whole point of this surface is that the AI admits uncertainty - this is where that admission lives.

**Header:** Mono Courier `STILL WATCHING · 4` followed by a thin gradient rule. No explanation paragraph - the title and the cards inside speak for themselves.

**Cards (~4 candidates, hand-authored):**

Each candidate card is visually distinct from a Pattern card:
- Dashed border (1px, `#cdc6dd`), no shadow, white background at 60% opacity.
- Smaller padding than pattern cards (px-5 py-4 vs px-6 py-5).
- Compact: project chips, a one-line observation, a "needs more data" caption.

Example candidate:

```
┌─────────────────────────────────────────────────────────────────┐
│  [the-hoth] [linkbuilder]                                       │
│  Both have CTR slipping ~0.3pp over the last 5 days.           │
│  Could be a SERP layout test or a slow QS drift - too early     │
│  to tell. Watching for another week.                            │
└─────────────────────────────────────────────────────────────────┘
```

These are mock-authored as a separate `CANDIDATE_SIGNALS` array alongside `PATTERNS`. Same data shape as Pattern minus `recommendedAction` / `recommendedActionCta` (because we don't recommend anything yet).

No CTAs. The point is to acknowledge, not to act.

### 4c. Empty-state + correction footer

When filters yield zero results:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Nothing here yet  -  we're still reading.                      │
│                                                                 │
│            [ Clear filters ]                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

Soft language ("still reading") over "no results." Reinforces posture.

**Footer correction invite.** The existing `PatternsReturnBanner` (link back to /reports) gets a sibling line above it:

> *"Spotted something we missed? Tell us at feedback@ppc.io"*

Quiet 12.5px slate ink. The invitation is the entire mechanism by which the page admits it's flawed and asks for help. CEO and in-house user both see it.

---

### 5. What we don't touch

- The `PATTERNS` data shape (we add derived fields: `severity`, `impact`, `surfacedAt`, `firstSeenAt`, `categoryGroup`  -  all mocked alongside the array).
- `AffectedChip`, `DriverRow`, `PatternField` components (reused as-is).
- `PatternsReturnBanner` at the bottom of the page (stays).
- The lavender canvas behind everything below the hero.
- Routes, mock `PROJECTS`, brand tokens.
- The Experimental flag  -  it moves to a small chip below the hero, no longer top-of-page.

The explainer ("What this is  -  cross-account synthesis") is **removed**. The hero now does that job  -  the H1, the constellation, and the cycling pattern headlines.

---

## Voice & copy house rules

The page never refers to the app in first or third person. No fictional persona. No "io thinks…" / "I'm watching…" / "we found…" framing in the chrome itself.

What IS allowed (and is what the page mostly does):
- Declarative observations on the cards: *"Three SEO-tool accounts hit by the same paid-auction shift."* (existing pattern headlines)
- Functional labels: `RECOMMENDED`, `WINS`, `DEFEND`, `SHIFTS`, `INFRASTRUCTURE`, `BY PROJECT`, `ALL`
- Plain captions on Recommended rows: *"3 projects · new this week · single decisive move"*

What is NOT allowed:
- Anthropomorphising the app ("io's brief", "I'm seeing", "we're watching")
- Marketing-funnel words ("unlock", "leverage", "supercharge", "maximize")
- Exclamation marks
- Em-dashes
- Invented dollar figures the source data doesn't quote

---

## Derived data we add to the PATTERNS array

Each pattern gets these additional fields (mock-authored alongside existing ones):

| Field | Type | Notes |
|---|---|---|
| `lens` | `'win' \| 'defend' \| 'shift' \| 'infrastructure'` | Categorical bucket. Drives the left-edge color and the lens filter. Hand-classified once across all 30 patterns. |
| `breadth` | `number` | Count of `affected` projects. Already in the data; just expose as a top-level field for sort/filter. |
| `surfacedAt` | ISO string | Mocked. Used for "new this week" signal on Recommended captions. |
| `firstSeenAt` | ISO string | Mocked. Same value or earlier than `surfacedAt`. Used to detect persistent (>7d unactioned) patterns. |
| `categoryGroup` | one of 8 group strings | Used for "All 30" grouped view. |
| `moveTag` | string | The 3-5 word move label rendered on the right side of each row. Lifted from `recommendedActionCta` and shortened. |
| `recommended` | boolean | True for the ~6 patterns selected for the default tab. |
| `recommendedReason` | string \| null | The italic caption explaining the pick ("3 projects · new this week · single decisive move"). |
| `dollarSuffix` | string \| null | OPTIONAL real dollar quote ONLY when the pattern's own `whatWeFound` or `whyItMatters` prose explicitly states a figure. Default `null`. The render layer surfaces it as a small `~$1.2K` suffix on the moveTag. Never fabricated. |
| `confidence` | `number` (0-100) | Honest confidence percentage. Hand-authored per pattern based on signal density (number of findings × number of corroborating agents). Surfaced as a 3-dot scale + `XX% conf` label on every card. |
| `confidenceBasis` | string | Short tooltip string explaining the confidence: e.g., `"4 corroborating signals across 3 runs"`, `"2 agents agree, 1 inferred"`, `"single account, single agent - low confidence"`. |

These are authored once at the top of `Patterns.tsx` alongside the existing PATTERNS array as a parallel enrichment object  -  kept separate so the existing pattern prose stays the source of truth and the derived classification stays editable.

---

## Out of scope (for this PR)

- Real backend / live data  -  still mocked.
- Persisting "actioned" state across reloads.
- Mobile constellation (collapses to a stacked node list <768px).
- Keyboard navigation through the constellation.
- Animation reduced-motion fallbacks (will add `prefers-reduced-motion` gate; pulse and typewriter both disable).

---

## File map

| File | Change |
|---|---|
| `src/pages/Patterns.tsx` | Full rewrite of render tree. PATTERNS data extended with the derived classification fields. New components: `PatternsHero`, `RosterConstellation`, `HeadlineTypewriter`, `FeaturedTriplet`, `LensTriageBar`, `LensColorStrip`, `GroupedShelf`. |

No new files. Everything lives in `Patterns.tsx` to preserve the "one page = one file" pattern the rest of the mockup follows.
