# Agent Results v5 — World-Class Summary Redesign

**Status:** Shipped (Summary tab) · Deep Report = placeholder (Chunk 3 pending)
**Author:** Stewart + Claude session 2026-05-16
**Routes:** `/v5/reports/:runId` · canonical fixture is `run-competitor-spy-completed`
**Compare:** v4 (`/v4/reports/...`) is the previous Discovery-card iteration

---

## The product feeling we are designing for

When an agent completes, the user should not feel *"a report has loaded."* They should feel *"a senior PPC analyst just went away, did the boring investigation work, checked it against business context, and came back with a tight plan."*

Three emotions in order, every time:
1. **Relief** — the agent did the heavy lifting
2. **Trust** — the data and reasoning are visible, business context is named
3. **Control** — actions are review-able, exportable, questionable; never auto-applied

We sell agents. Every section reinforces the agent as protagonist — agent byline at the top of every dark surface, agent-named CTAs, agent-attributed quote in the hero.

---

## What v4 had — what was missing

v4 nailed:
- Severity rails on cards
- Mono-eyebrow shape labels (VERDICT / FACT / GAP / PATTERN)
- Auto-stat highlighting via regex
- DO / EXPECT / EFFORT recommendation block
- Source attribution byline per card

v4 was missing (the reason Stewart called past attempts "AI slop"):
1. **No completion moment** that conveys joy/relief
2. **No Strategy Verdict** — the senior-partner one-liner that compresses the report
3. **Business context invisible** — never shown on a card, never named in a hero
4. **No Checks Before Export** — no operational pre-flight
5. **Information hierarchy passive** — Findings → Recommendations as separate sections instead of paired claim → action

v5 ships those five fixes without throwing away v4's chrome.

---

## The five sections of the AI Summary tab

### 1 · Investigation-complete hero (dark)

Replaces v4's `HeroCard`. Sits at the top of the Summary tab only — Deep Report tab gets its own Data-dive overview when Chunk 3 ships.

**Container:** vertical gradient `#0F0A1E` → `#07050D`, `radius: 24px`, dot-grid texture, top-right purple bloom anchored off-canvas, padding `36px 40px 28px`.

**Anatomy:**
- **Eyebrow byline** — project avatar tile + agent name + project name on the left; green-dot Completed + duration + window on the right (mono Courier). This is the *byline pattern* from the Dashboard activity cards — agent identity as protagonist.
- **Figtree 900 headline** + purple period — *"Competitor Spy went deep."* — Past-tense, agent-as-subject verb. Brand signature move.
- **Subhead narrative** — one sentence describing the work in Figtree 400 with the specific numbers that recur in the methodology line below ("Mapped 8 rivals across 84 SERPs…").
- **Agent quote** — the **payoff inside the hero**. Pull-quote with a 56px Phosphor `Quotes` glyph in 32% purple, a 3px purple rail, and a Courier byline attribution. Names a specific entity (Aspen Recovery Group), makes a judgment ("they're not a generalist"), and ties to client context ("Boulder Care competitor specifically"). Replaces the stat-chip row entirely.
- **Three trust receipts** (mono label-value rows, 132px label column):
  - `INVESTIGATION  84 SERPs · 8 rivals confirmed · 12 keywords · 7-day window`
  - `CONTEXT USED   Boulder Care ICP · target CPA · priority Colorado geos`
  - `MISSING        lead-to-sale rate (would tighten 2 recommendations)`
- **Scroll hook** centered at the bottom — *"The strategist's verdict"* in Courier + Phosphor `CaretDown` glyph.

**Mascot:** `SpyMascot` 180px on the right with a 260px purple radial bloom behind it.

### 2 · Strategy Verdict card

White card with `margin-top: -28px` so it visually peeks above the hero's bottom edge. `box-shadow: 0 -12px 32px rgba(15,10,30,0.18)` lifts the top edge above the dark.

**Anatomy:**
- **Eyebrow** — `◆ Competitor Spy · Strategist verdict` (agent owns the verdict).
- **Headline** — confident strategist sentence, **not a dollar figure**. *"Three moves to make this week. Two questions to answer first."* Figtree 800 at clamp(26–32px).
- **Body** — 2-sentence judgment. Names the strategic mistake to avoid ("bid more on everything").
- **Main Risk pane** — right column, 3px amber `#BA7517` rail, label + 13.5px body. Specific technical risk ("Smart Bidding ignores manual keyword bids"), never generic CYA.
- **Triage list** — 3 rows: READY TO ACT (green dot · `#5DCAA5`), NEEDS REVIEW (amber · `#BA7517`), OPEN QUESTION (lavender · `#7F5AF0`). Each row has count + status + one-line description in an aligned 3-column grid.
- **Why-downgraded block** — lavender panel-soft background with the specific missing data point named, and what it would unlock.
- **Two CTAs** — primary gradient purple (`Review the 3 ready-to-act moves`) + ghost secondary (`Ask the agent`).

### 3 · Discovery cards (Finding ↔ Next Step)

White cards with **readiness-coloured 4px left rail** (replaces v4's impact rail — readiness is more actionable than impact when scanning).

**Eyebrow:** rank · ImpactChip · ShapeLabel · ReadinessChip — four chips in a row.

**Body — 2×3 grid:**

| | Left column (the finding) | Right column (the next step) |
|--|---|---|
| Row 1 (purple labels) | `WHAT WE FOUND` | `WHAT TO DO NEXT` |
| Row 2 (green labels) | `WHY IT MATTERS` | `EXPECTED OUTCOME` |
| Row 3 (brown labels) | `BUSINESS CONTEXT USED` | `TRADEOFF / RISK` |

Color-paired labels so the eye can track field-pairs across cards. On mobile, the grid collapses to one column with pair-preserving order.

**Business Context cell — special rules:**
- `↑ Upgraded` badge (green) if business context strengthened the recommendation
- `↓ Confidence reduced` badge (amber) if missing context downgraded it, with `Missing: lead-to-sale rate · Add to project ▸` link inline

**Footer:** evidence eyebrow (tool calls · data points) + `Show working` ghost + `Ask` ghost + readiness-specific primary CTA.

**No "recoverable" or "potential upside" dollar projections anywhere.** Outcomes are measured (impression share, CTR lift, CPA), never projected dollar recovery. The branded-CPC card is an OPEN QUESTION specifically because the agent declares it can't tell from Google Ads data alone.

### 4 · Checks Before Export

Three calm checklist cards, not warnings. White on lavender, hairline border, empty `Square` icon at left. Each item names a specific reason (links to the card or missing data point that triggered it).

Tone rule: never use the word *"warning."* Always *"confirm,"* *"resolve,"* *"add."*

### 5 · Ask the Agent prompt bar

Lavender `#EEEDFE` panel. Agent-named eyebrow (`ASK COMPETITOR SPY`, not generic). White input + paper-plane send. Three **run-specific** suggestion chips that reference findings from *this* run, not generic AI prompts.

---

## Anti-AI-slop rules locked into v5

These are encoded as patterns in `data.ts` and `SummaryV5.tsx`. Future authoring must respect them.

1. **Counts are not headlines.** A headline must name a specific entity, take a position, or report a measured number. Never *"N gaps surfaced."*
2. **No projected dollar recovery.** Observed dollars (competitor spend, current CPC, current ad spend) are fine. *"Recover $X/mo"* is forbidden.
3. **Methodology is a footnote, not stat tiles.** One Courier line: `INVESTIGATION 84 SERPs · 8 rivals · 12 keywords · 7-day window`.
4. **Agent is the protagonist** of every dark surface. Byline first, headline as agent's action statement, CTAs reference the agent by name.
5. **Business context is on every card, always.** If it's complete, the cell says so. If it's missing, the cell names the missing item and the consequence.
6. **No emoji in body copy.** No "✨", no "AI-powered" badges, no gradient text.
7. **Black-led dark surfaces, purple as bloom only.** Never purple-led gradients.
8. **No pre-run promises.** Specific $ only post-run, anchored to observed account data.
9. **"Open question" is a valid outcome.** If the agent can't tell, it says so — and tells you what data would unlock the answer.
10. **No "warnings."** Operational checks are framed as confirmations, never as alarms.

---

## Files

```
_react-mockup/src/pages/_v5/
├── AgentResultsV5.tsx     # Page shell · Breadcrumbs · V5 badge · AI Summary | Deep Report tabs
├── SummaryV5.tsx           # All five Summary sections (~750 lines, single file by design)
├── DeepReportV5.tsx        # Placeholder stub — Chunk 3 of the design brief
└── data.ts                 # Types + Competitor Spy / Boulder Care fixture
```

Route wired in `App.tsx`:
```tsx
<Route path="v5/reports/:runId" element={<AgentResultsV5 />} />
```

---

## Chunk 3 — Deep Report tab (shipped 2026-05-16)

The Deep Report is the **agent journey**: the user scrolls through what the agent actually did, what it found at each phase, and how the Strategy Agent synthesised those findings into the AI Summary. Linear narrative, no sticky rail (chose vertical scroll over a navigation rail because the journey is the point — let the user read it like a memo).

### Vertical order

```
1. Data Dive Overview         (light card — "Here's how the agent got there.")
2. Six specialist phase cards (white, expandable data drawers per phase)
3. Context Cross-Check card   (what context was used / missing / changed)
4. Strategy Synthesis card    (dark climax — links back to Summary)
```

### 1 · Data Dive Overview

Light white card. Eyebrow `Path` icon + "Deep Report · The agent journey" purple Courier-color label (Figtree, not mono). Figtree bold display headline *"Here's how the agent got there."* with purple period. Two-sentence intro. Four big Figtree 700 stats laid out as a 4-up grid (no chip chrome): `6 Specialist phases · 161 Tool invocations · 7-day Lookback window · 4 Business-context dimensions used`.

### 2 · Phase cards

One per investigation phase. Six phases for Competitor Spy:
1. Competitor Discovery — *"Mapping the field."*
2. Auction Intelligence — *"Reading the auction."*
3. Copy Analyst — *"Decoding their copy."*
4. Page Detective — *"Walking their funnels."*
5. Spend Tracker — *"Sizing their spend."*
6. Gap Hunter — *"Hunting the whitespace."*

Each card:
- Eyebrow: `Phase 01 · Competitor Discovery` in Figtree (number in faint, agent name in purple)
- Figtree 800 title (~28-32px)
- Four-field grid: **What it checked · What it found · Reasoning · Passed forward** — same Field component pattern as Summary discoveries, *"What it found"* gets `emphasis` (ink color, Figtree 500)
- **Expandable data drawer** at the bottom — button with `Stack` icon + "See the data the agent worked from" + dataPointsLabel/toolCallCount line. Click expands inline to show:
  - **Tools used** row (small pill chips with monospace font for tool names — only place mono appears in the tab; tool names ARE code identifiers, so mono is meaningful, not decorative)
  - **DataPreviewTable** — beautiful table on lavender background, hairline borders, Figtree headers (semi-bold), Figtree body cells with `tabular-nums` for numeric columns, hover rows, "Showing N of M" footer with "View full table" link

### 3 · Context Cross-Check card

Dedicated phase between the specialists and the synthesis. Three sub-sections:

- **What we used** — list of `ContextUsedRow` cards. Each shows the dimension name (Boulder Care ICP, target CPA, etc.), source line (where it came from), and where it was applied. `↑ Used` badge top-right in green.
- **What was missing** — list of `MissingContextRow` cards. Same structure but amber-tinted background (`rgba(215,181,122,0.06)`), with `↓ Missing` badge top-right in brown. Each includes an "Add to project" deep-link.
- **What changed because of context** — lavender panel-soft callout with 3 sentences, each prefixed by a small purple `Sparkle` icon. These are the specific deltas the cross-check produced ("Same-day intake angle upgraded from interesting to ready-to-act", etc).

### 4 · Strategy Synthesis (dark climax)

Mirrors the Investigation Hero's dark treatment but quieter (smaller purple bloom, no mascot). The closing moment of the entire report.

Layout:
- Eyebrow: `Strategy Agent · Final synthesis` with a `Sparkle` icon
- Figtree 900 display headline + purple period: *"This is what produced your AI Summary."*
- Two-column context recap: "Context the agent used" (in C9B5FF light purple) + "Context that was missing" (in D7B57A desaturated amber)
- Horizontal divider
- **Recommendations that survived the cross-check** — list of `SynthesisRow` cards, each clickable, linking to the relevant Discovery card in the Summary tab (via `#discovery-d-N` anchor). Each row shows the readiness-coloured dot, the recommendation rank + readiness label, the headline, and a `whyNote`
- **Recommendations that got downgraded** — same structure, distinct items
- **Final strategy** — quote-style panel with `rgba(255,255,255,0.04)` background, Figtree 500 19px body, max-width 760px. This sentence is the seed the Strategy Verdict headline grew from
- **CTA** — primary purple gradient button "Back to the AI Summary" with a rotated arrow that scrolls the page to top

### Design rules enforced in Chunk 3

(Same anti-AI-slop rules as the Summary tab, plus:)

11. **No mono Courier mid-content.** The only mono in Deep Report is the `ToolsUsedRow` chips — where tool names are literal code identifiers, so monospace is semantic, not decorative.
12. **Data drawers default closed.** The user opts into the raw data. Keeps the journey readable.
13. **Synthesis recommendations are clickable.** They link back to the Discovery card in the Summary tab. The two tabs are explicitly bridged.
14. **The synthesis is the climax, not the start.** Reading the Deep Report top-to-bottom should feel like reading an investigation memo with the verdict at the end.

---

## What's still deliberately deferred

**Additional agent fixtures.** Only `run-competitor-spy-completed` has v5 mock data. Negative-Keyword, Account-Audit, and Spend-Leak fixtures author next when we know the design holds.

**Drawer interactions on Summary cards.** `Show working` and `Ask` buttons on the Summary Discovery cards are not wired yet — the Deep Report phase drawers ship that pattern; can borrow when ready.

**Full-table modal.** The "View full table" link inside expanded phase data is a placeholder. Opens a side drawer in a follow-up.

**Animated scroll-down chevron.** Removed the bouncing animation for the first build (kept the static glyph). Add a 2.4s subtle bounce with `prefers-reduced-motion` guard in a polish pass.

---

## How to review

1. Visit `/v5/reports/run-competitor-spy-completed`
2. Compare against `/v4/reports/run-competitor-spy-completed` (v4) and `/reports/run-competitor-spy-completed` (v1 canonical)
3. Top-right "Compare v4" link in the V5 badge swaps between them
