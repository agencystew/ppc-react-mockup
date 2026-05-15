# Summary Section v4 — Discovery Cards · Design

> **Date:** 2026-05-15
> **Owner:** Stewart Dunlop
> **Target route (new):** `/v4/reports/:runId`
> **Target route (current):** `/reports/:runId` (Summary tab — to replace, once v4 is approved)
> **Scope:** Just the Summary tab. Full Report + Methodology tabs are unchanged.
> **Why now:** Jose flagged the current summary "doesn't answer 'now what?'" Findings lack data, recommendations aren't specific. Atomic unit must be tight before the Key Discoveries aggregator can be built on top of it.

---

## 1. What's broken in v1

Current Summary at [src/pages/AgentResults.tsx:458-630](../../src/pages/AgentResults.tsx) has two visually disconnected sections:

| Element | Bug |
|---|---|
| `FindingTile` titles ("Bidding gaps on core terms") | Generic categories, not claims. Chapter headings, not findings. |
| Prose descriptions under each title | Paraphrase the title. No proof embedded. |
| 2-stat row (`$3.1K/mo · 8 Affected`) | Decorative. Stat doesn't *belong* to the claim it sits under. |
| 3-up grid of findings | Visually disconnected from the recommendations below. |
| `RecRow` ("Raise bids on 8 high-intent keywords") | No target (which keywords?), no expected outcome, no effort hint. |
| Big colored icon tiles (↑ ↻ ⚑) | Visual padding, no information value. |
| Two separate "See full report" links | Duplicated CTA. |

**Fundamental sin:** findings and recommendations live in two different sections, when in reality every finding has exactly one paired recommendation (`finding.action` in the data model at [mock/runs.ts:157](../../src/mock/runs.ts)). The cause→effect link is on the reader to construct.

---

## 2. The new atomic unit

A **Discovery** = one self-contained finding+recommendation card. The Summary section is just a stack of 3-5 Discovery cards. The "Top recommendations" section is **deleted** because each recommendation lives inside its own Discovery.

### Card anatomy

```
┌─────────────────────────────────────────────────────────────────┐
│ [SHAPE EYEBROW]  IMPACT CHIP            [agent · project · age] │
│                                                                  │
│  HEADLINE (the claim — verdict / fact / gap / pattern shape)    │
│                                                                  │
│  PROOF (1-2 sentences, numbers embedded inline as bold stats)   │
│                                                                  │
│  ─── divider ─────────────────────────────────────────────────  │
│                                                                  │
│  → DO       [specific action with target]                       │
│  EXPECT     [quantified outcome]                                │
│  EFFORT     [time estimate · scope hint]                        │
│                                                                  │
│                                          [ Apply ] [ Defer ]    │
│                                                                  │
│  🔍 evidence eyebrow (N tool calls · N data points)              │
└─────────────────────────────────────────────────────────────────┘
```

### Four headline shapes

Every headline must either name a number, name a specific thing, or take a position. The *shape* flexes by what kind of finding it is:

| Shape | When | Example headline |
|---|---|---|
| **VERDICT** | Finding diagnoses a cause | "Quality Score is the bottleneck — not your budget." |
| **FACT** | Finding is the number | "47 search terms burned $4,233 over 90 days." |
| **GAP** | Finding is whitespace / opportunity | "No rival owns 'same-day case review' — strongest unclaimed angle in your market." |
| **PATTERN** | Finding is a recurring theme | "All 8 rivals lead with 'no fee unless we win' — the position is exhausted." |

The shape is a label in the eyebrow (small monospace, uppercase). It primes the reader for the *kind* of claim they're about to read. Solves the "they all sound the same" problem when stacked.

### Every recommendation has three lines

| Line | Job | Example |
|---|---|---|
| **→ DO** | Specific action with target | "Raise QS on 14 keywords by tightening ad→keyword alignment in 3 ad groups." |
| **EXPECT** | Quantified outcome | "+14% impression share · ~$1.8K/mo recovered" |
| **EFFORT** | Time + scope hint | "~2h · one structural change" |

No recommendation ships without all three. If the agent can't produce them, the finding doesn't earn its place on the Summary.

### Card chrome

- **Severity left rail**: 3px gradient bar, red (high) / amber (medium) / lavender (low) — visible peripheral signal when stacking 4-5 cards
- **Agent · project · age eyebrow** (top right): `Competitor Spy · Boulder Care · 14d` — matters so cards stay legible when promoted to the Key Discoveries aggregator
- **Evidence eyebrow** (bottom): `🔍 18 calls · 120 data points · See methodology →` — micro-trust signal that the work was real

---

## 3. What changes in the data model

Existing `AgentRun.findings[]` shape is fine, just under-populated. The v4 demo data extends each `finding` with three additional fields (authored by hand for now, agent-output in production):

```diff
 interface Finding {
   agent: string
   priority: 'high' | 'medium' | 'low'
   finding: string          // 1-2 sentences of proof prose
   impact: string           // short outcome line — promotes to "EXPECT" in v4
   action: string           // promotes to "DO" line in v4
+  headline?: string        // the verdict/fact/gap/pattern claim (v4 only)
+  headlineShape?: 'verdict' | 'fact' | 'gap' | 'pattern'
+  expect?: string          // quantified outcome
+  effort?: string          // time + scope hint
+  evidenceCount?: { calls: number; dataPoints: string }
 }
```

For the v4 mockup, the new fields are populated inline in `_v4/data.ts` derived from the existing `RUNS['run-competitor-spy-completed']`. No mutation of canonical RUNS.

---

## 4. What's preserved from v1

The page chrome (Breadcrumbs → TitleRow → MetaLine → HeroCard → Tabs) stays identical. v4 ships the existing helpers as exports from `AgentResults.tsx` and reuses them. Only the SummaryView is replaced; FullReportView and MethodologyView are unchanged.

This means: visit `/v4/reports/run-competitor-spy-completed` and the page looks identical to v1 above the Summary tab content. Below it, the Discovery cards replace the FindingTiles + RecommendationsSection.

---

## 5. Route + reachability

- New route: `/v4/reports/run-competitor-spy-completed` (the canonical fixture)
- Sidebar entry: under Reports group, second item, label "V4: Summary redesign"
- No change to v1 route — sits alongside for side-by-side comparison

---

## 6. Out of scope (deferred)

- Key Discoveries aggregator surface (`/discoveries` or `/projects/:id/discoveries`) — locked once v4 atomic unit is approved
- Promotion to v1 (rename `_v4` to canonical, retire v1 Summary) — happens after Stewart approves the Vercel preview
- Agent prompt changes to output the new fields (`headlineShape`, `expect`, `effort`) — separate work; not in this PR
- Full Report / Methodology tab redesigns (already covered by parallel v3 effort)
- Apply/Defer button behavior — visual only in v4; no actual mutation

---

## 7. Success criteria

A senior PPC operator opens `/v4/reports/run-competitor-spy-completed`, reads the 4 Discovery cards, and:

1. Can state in one sentence what was found and what to do about it — for every card.
2. Can predict expected outcome and time cost before clicking Apply.
3. Can tell at a glance which 2 cards are highest impact (severity rail).
4. Sees no decorative stat — every number is load-bearing.
5. Forwards the page into agency Slack with the words "look at this."

If any of these fail, the design is wrong, not the implementation.
