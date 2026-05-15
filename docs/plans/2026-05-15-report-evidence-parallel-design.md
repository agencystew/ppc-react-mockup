# Report Evidence Redesign · Parallel Design Brief

> **Date:** 2026-05-15
> **Owner:** Stewart Dunlop
> **Target route:** `/reports/run-competitor-spy-completed`
> **Variants:** 3 (V1 Magazine, V2 Bloomberg, V3 Audit-first chronological)
> **Output:** Three live routes in this mockup repo for side-by-side comparison.

This brief is the contract every parallel agent reads before touching code. Treat the data model, fixture, tokens, and bans as locked. The variant axis is the only meaningful difference between agents.

---

## 1. Why this redesign exists

The current `/reports/run-competitor-spy-completed` page passes every technical check and feels flat to read. Specifically:

- One visual register everywhere. Every section is the same white card with the same metric tile and the same dark expandable evidence panel. There is no pacing.
- The receipts are hidden. The GAQL query and the supporting tool invocations are gated behind a junior-SaaS "Show evidence" toggle, which treats PPC experts (the actual paying audience) as a second-class reader.
- The "47 tool calls" line is dead text, not a navigable surface. The audit trail exists conceptually and is not buildable from the UI.

The report is supposed to be the payoff for waiting on an agent run and the payoff for a paid subscription. It should reward study, not feel like a slog.

---

## 2. Who you are designing for

The primary reader is a senior PPC operator at an agency. They see five or more accounts a week, they have been burned by tools that hide methodology, and they will not trust a number they cannot verify.

**Their scan order on any new report:**

1. What is the headline number for each section.
2. What method produced it. Specifically: which Google Ads resource, what window, what filter.
3. How big is the underlying dataset and where can I sample it.
4. What does the recommendation imply for spend and structure.

**Their skepticism reflex:**

- "Did this thing actually query my account, or is it bluffing from a generic playbook?"
- "Show me the WHERE clause. If it does not match how I would have written it, the number is meaningless."
- "If I show this to my client, can I defend every claim line-by-line?"

The variant that wins is the one a PPC operator would forward into their agency Slack with the words "look at this." The one that loses is the one a PPC operator skims, closes, and never reopens.

---

## 3. The locked data model

This shape is the architecture Jose has agreed with Stewart and is non-negotiable. Build all three variants against this exact contract. Do not invent fields. Do not flatten.

```ts
type ToolInvocation = {
  id: string                     // 'ti_abc123', stable and citable
  specialistId: string           // 'competitor-discovery' | 'auction-intelligence' | ...
  toolName:
    | 'google_ads.query'
    | 'google_ads.explore_schema'
    | 'serp_api.search'
    | 'web.scrape'
    | 'domain.lookup'
  displayName: string            // derived from GAQL FROM clause: 'google_ads.auction_insights'
  args: {                        // tool inputs, verbatim
    gaql?: string                // for google_ads.query
    resource?: string            // for explore_schema
    url?: string                 // for scrape/serp
    query?: string               // for serp_api
  }
  result: {                      // tool outputs, persisted
    columns?: string[]
    rows?: string[][]
    totalRows?: number
    sample?: unknown
    schemaMarkdown?: string      // for explore_schema only
  }
  narrative: string              // human-readable: "Pulled auction insights for 12 keywords over 7 days"
  isEvidence: boolean            // false for explore_schema lookups, true for evidence queries
  startedAt: string              // ISO timestamp
  finishedAt: string
  latencyMs: number
}

type Finding = {
  id: string
  title: string                  // the claim, 1 line
  body: string                   // 2–3 sentence explanation
  metric?: { value: string; label: string }
  impact: 'high' | 'medium' | 'low'
  primaryEvidenceRef: string     // the one invocation that owns the headline number
  supportingEvidenceRefs: string[]   // additional citations
  evidenceSummary?: {            // optional agent-derived table, labelled clearly
    columns: string[]
    rows: string[][]
    note: string                 // 'Derived from primary: top 4 rivals by IS%'
  } | null
  judgment: string               // the AI's quote about what this means
}

type Section = {
  id: string
  icon: 'target' | 'binoculars' | 'chart' | 'flag'
  name: string                   // 'Competitor Discovery'
  meta: {
    toolCallsCount: number       // count of invocations for this specialist
    headlineMetric: { value: string; label: string }   // '8 rivals identified'
    window: string               // '7-day window'
  }
  findings: Finding[]
  invocations: ToolInvocation[]  // full chronological log, includes schema-explore
}

type Report = {
  runId: string
  agentName: string              // 'Competitor Spy'
  accountName: string            // 'Cleveland Personal Injury Group'
  completedAt: string
  durationMs: number
  sections: Section[]
}
```

**Critical behaviours all variants must implement:**

- The "X tool calls" count in each section header **must equal** `section.invocations.length` exactly. Never an LLM-emitted number.
- Resource chips for a finding **must be derived** from `unique(displayName for ref in [primary, ...supporting])`. Never a flat hand-written array.
- `isEvidence: false` invocations (schema-explore) **must appear in the audit timeline** but **must never appear in evidence blocks**. They support reasoning, not claims.
- The GAQL query for the primary evidence ref **must be visible** in the finding's evidence surface. Not behind a click, not summarised, not paraphrased. The actual query string.
- The audit timeline **must be reachable** from each section header. The exact UI is yours to design (rail, drawer, sticky, inline) but the surface must exist.

The fixture file at [src/mock/competitor-spy-evidence.ts](../../src/mock/competitor-spy-evidence.ts) holds the canonical data all three variants import. Do not modify the fixture. If you need additional data shape to render your variant, add a derived selector, not a fixture mutation.

---

## 4. The variant axis you are building

Each agent gets exactly one variant. The variant axis is the only thing that distinguishes you from the other two agents. Tokens, fixture, data model, bans, and evaluation criteria are identical.

### V1 · Magazine longform

**The bet:** PPC operators read a report like a research document when the design earns the attention. Visual rhythm (alternating chapter registers, hero typography, deliberate pacing) turns a "slog" into a "study."

**The reading model:** Top-to-bottom narrative. Each section is a "chapter" with its own visual register. The reader expects to slow down and study. Evidence is integrated into the body of the finding, not gated behind interaction.

**Composition cues:**

- Each section opens with a chapter title page: section name in Figtree 900 at 64–80px, the `headlineMetric.value` as a single huge number (120–160px Figtree 900 with the unit in Courier caption underneath), and `window` + `toolCallsCount` as small structured chips. No flat concatenated meta string.
- Sections alternate visual registers in a deliberate rhythm: Discovery on the canonical dark sidebar surface (`#0F0A1E` radial, purple bloom, mono numerics on dark), Auction on the lavender canvas (`#ECEAFA`, light-on-light, sparkline rows), Position on an ivory accent moment, Recommendations returning to dark. Like a magazine alternating photo spreads with text essays.
- Each finding is laid out as a two-column reading composition: body (45ch reading column, left) and receipts (GAQL block + primary table + judgment quote, right). No "Show evidence" button. Receipts are always visible.
- The audit timeline is the section footer: a horizontal time-rail with schema-explore steps as small grey dots and query steps as larger purple dots. Clicking a dot expands that invocation inline above the rail.

**Risk to manage:** Verbose. Could feel like an essay when the operator wanted a dashboard. Avoid this by making the headline number absolutely dominant in every chapter opener and keeping body prose under 70 words per finding.

### V2 · Bloomberg dashboard

**The bet:** PPC operators scan dashboards, not essays. Data-density signals seriousness. The page rewards a 30-second scan and a 5-minute deep dive equally.

**The reading model:** Above-the-fold scanning. Each section opens with a dense headline strip: huge metric, inline sparkline, the primary GAQL query rendered as a one-line receipt, one supporting chart. Body prose is the secondary layer the operator reaches for when they want depth.

**Composition cues:**

- Single visual register throughout (no chapter alternation). The page reads as one tool, not four chapters. Achieve rhythm through data density, not surface treatment.
- Every section header is a horizontal dashboard strip: `[headlineMetric.value, 72px Figtree 900]` `[sparkline, 120×40px]` `[GAQL one-liner with `…` truncation and a hover-to-expand]` `[supporting chart]` `[audit count button]`. All in one row at desktop.
- Findings render as compact data cards in a 2-column grid, not full-width rows. Each card has: metric + label + body + a 3-row sample table + a "GAQL" pill that opens a popover with the full query + a "+ N supporting refs" link.
- Use tabular numerics and right-alignment ruthlessly. Magnitude bars in the primary column. Sparklines wherever a time series exists in the data.
- The audit timeline is a slide-over panel (right side, narrow, full-height) keyed to the section. Clicking "47 tool calls" opens it. List view with filtering by tool name and timestamp.

**Risk to manage:** Can read as generic SaaS-dashboard if the typographic restraint slips. Avoid Roboto Mono fallbacks. Verify Courier New loads. Keep the metric typography in Figtree 900, never the body font.

### V3 · Audit-first chronological

**The bet:** PPC operators trust the work, not the conclusion. Make the audit trail the primary visual element on the page, not a footer. The "47 tool calls" is the page's spine, and findings are summaries pinned to that spine.

**The reading model:** Chronological. The reader sees what the agent actually did, in order, and the findings annotate the work. Like a lab notebook with conclusions in the margins.

**Composition cues:**

- The page's primary structural element is a vertical timeline running down the left third of the screen. Each invocation is a node on the timeline with timestamp, tool name, display name, and narrative. Schema-explore nodes are small and grey; evidence nodes are larger and purple.
- Findings render to the right of the timeline, anchored to their primary evidence node. A subtle line connects the finding's left edge to the timeline node, like a thread of provenance. Supporting refs render as smaller secondary nodes branching off the primary.
- Section dividers run horizontally across the page, breaking the timeline into named segments (Competitor Discovery, Auction Intelligence, Position & Spend, Creative & Landing Page). Each segment header carries the structured meta (count, headline, window).
- GAQL queries render inline at the timeline node when expanded. The query is the receipt; clicking the node turns the node into a full panel showing args + result table.
- No "Show evidence" pattern anywhere. Evidence is the page.

**Risk to manage:** This is the most opinionated layout and the highest tone risk. Do not use case-file, evidence-locker, detective, or investigation language anywhere in copy or UI labels. The metaphor is structural, not thematic. Words on the page should be plain operator vocabulary: "tool calls," "queries," "schema lookups," "sample data."

---

## 5. The locked design tokens

**Use only.** Do not introduce new colors, fonts, radii, or shadows. If you need something not in the system, find the closest sibling in [src/components/AppShell.tsx](../../src/components/AppShell.tsx) or [src/components/StagePage.tsx](../../src/components/StagePage.tsx) and borrow.

| Token | Value | Use |
|---|---|---|
| Primary purple | `#7F5AF0` | CTAs, active states, evidence accents |
| Sidebar dark | `#0F0A1E` | Dark surface backgrounds, hero |
| Canvas lavender | `#ECEAFA` | Page background, light surfaces |
| Ink | `#0C0C0E` | Body text on light |
| Display | Figtree 900 | All large display type, all metrics |
| Body / UI | Figtree 400/500/600 | Everything readable |
| Mono | Courier New | GAQL, narrative captions, timestamps, eyebrows |

Canonical dark-radial gradient (already in `EvidenceExpand`):

```css
background: radial-gradient(120% 90% at 88% -10%, #1B0F39 0%, #0A0814 55%, #050310 100%);
```

Purple bloom (top-right accent on dark surfaces):

```css
background: radial-gradient(circle, rgba(127,90,240,0.20) 0%, rgba(127,90,240,0.06) 40%, transparent 70%);
```

---

## 6. The locked bans

These are Stewart's slop catalog. Hit any of them and the variant is dead on arrival regardless of how clever the layout is.

- No em-dashes anywhere. Use commas, periods, colons, parens, semicolons. Never the long horizontal dash character.
- No Fraunces, Outfit, Playfair, DM Serif, Instrument Serif. No italic-accent phrases in H1.
- No Roboto Mono. No JetBrains Mono. Verify Courier New loads. If a fallback is hitting, it counts as a failure.
- No oversized typographic interstitials (80–152px italic phrase between sections).
- No clip-path mask-reveal hero animations.
- No aphoristic section-closer punchlines: "The receipts are the argument," "X is the bet," etc.
- No mystical-corporate phrases: "the keystone we are building toward," "X is the X."
- No template intros: "Most PPC tools have the same problem."
- No hard-counted nouns: "Twelve specialists," "Five reasons." Use "a team of" / "a roster of."
- No `bg-ppc-purple-700` chunky solid active states. Active states whisper via soft tint + accent bar.
- No `#000000`. Use `#0C0C0E` for ink.
- No cream `#F6F1EA`-ish canvases. The app surface is `#ECEAFA` lavender.
- No fake testimonials, no fake company logos, no demo modes.
- No "Show evidence" expand/collapse buttons. Receipts are always visible (V1, V2 inline) or are the page (V3).

---

## 7. The output contract

Each variant ships:

1. **A new route** in [src/App.tsx](../../src/App.tsx) at one of:
   - V1: `/v3/reports/run-competitor-spy-magazine`
   - V2: `/v3/reports/run-competitor-spy-bloomberg`
   - V3: `/v3/reports/run-competitor-spy-audit`
2. **A new page component** at one of:
   - V1: `src/pages/_v3/ReportMagazine.tsx`
   - V2: `src/pages/_v3/ReportBloomberg.tsx`
   - V3: `src/pages/_v3/ReportAudit.tsx`
3. **Imports the canonical fixture** from `src/mock/competitor-spy-evidence.ts`. Never inlines data.
4. **Self-screenshots** at desktop 1440×900 and mobile 390×844 into `docs/plans/2026-05-15-screenshots/<variant>-{desktop,mobile}.png` using the Playwright dev tooling.
5. **Self-audit checklist** completed at the bottom of the page component as a comment block:

```
// SELF-AUDIT
// [x] No em-dashes in any rendered string
// [x] Figtree 900 verified loading (network tab, not fallback)
// [x] Courier New verified loading
// [x] Every section's tool-call count equals invocations.length
// [x] Every finding's GAQL is visible without interaction (V1, V2) or via timeline node (V3)
// [x] Every resource chip is derived from displayName, not hand-written
// [x] Schema-explore invocations appear in timeline, not in evidence
// [x] Audit timeline reachable from section header
// [x] No "Show evidence" toggle anywhere
// [x] Mobile layout does not horizontally scroll
```

---

## 8. The evaluation criteria

Stewart will compare the three live routes side-by-side using these tests, in order. Highest-scoring variant wins.

1. **The 3-second test.** Open the page cold. Can the reader identify the headline finding for the first section in under 3 seconds.
2. **The 5-second verify test.** Pick any finding. Can the reader find the GAQL query that produced it in under 5 seconds.
3. **The 20-second audit test.** Can the reader see the full chronological list of tool calls for a section, including schema lookups, in under 20 seconds.
4. **The flat test.** Scroll the whole page. Does it feel like one visual register (flat) or does it have deliberate rhythm.
5. **The receipts test.** Do the receipts feel like a feature (proudly displayed, prominent) or a footnote (hidden, apologetic).
6. **The Slack-forward test.** Would a PPC operator paste this URL into their agency Slack with the words "look at this." This is the highest bar and the deciding factor when scores are close.

---

## 9. Operational pattern for dispatch

This section is for Stewart, not for the agents.

```bash
# 1. Clear any orphaned Chrome processes from prior Playwright runs
pkill -9 -f "ms-playwright/mcp-chrome"

# 2. Spawn three Agent calls in one message
#    isolation: 'worktree'
#    each agent gets a different dev port: 8803, 8804, 8805
#    each agent gets the brief above + the variant axis only

# 3. After all three return, copy each variant's files
#    from the worktree into main repo at the routes named above

# 4. Push as one PR with three routes live
#    Vercel auto-deploys three preview URLs

# 5. Compare side-by-side at the three preview URLs
```

Brief is locked when Stewart approves it. Fixture is locked when Stewart approves it. Dispatch follows.
