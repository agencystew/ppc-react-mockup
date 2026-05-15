# Project Detail page redesign — design doc

> Date: 2026-05-15 · Author: Stewart + Claude · Route: `/projects/:id`
> Status: approved, ready for implementation plan

## Why

Current page composition fights the data story. Three problems:

1. **"Today's brief" is split into two unrelated blocks** (section heading + flat findings list). Stewart's reference unifies them inside one dark hero card with a purple wave chart, narrative prose, primary CTA, and findings nested inside. The dark card is the page's visual centrepiece.
2. **Mid-page "Run an agent" triple dark cards fight the brief.** They belong on the agent catalog, not the project detail. They also create a competing dark surface that drains attention from the brief.
3. **Bottom dark "Ask" command bar is redundant.** AppShell's top-right Cmd+K already covers it; a second dark band closes the page on a flat note.

Plus two missing pieces Stewart asked for: visible **campaigns** (the agency user needs to see top/bottom performers at a glance) and **agent schedule** (so the project feels actively watched, even when the user isn't looking).

## Approved page rhythm

```
1. Breadcrumb + Run agent  (unchanged)
2. Hero (avatar + name + meta chips, unchanged)
3. Tabs (unchanged)
4. Today's brief — UNIFIED dark hero card
5. Performance (KPI quad + daily trend, polished)
6. On the schedule  +  Recent activity   (2-up)
7. Top performers  +  Needs attention     (2-up campaigns)
```

No mid-page dark agent CTAs. No bottom Ask bar. The `Run agent` button top-right is the launch surface; tabs cover deeper context. Less is more.

## Section design

### 4 · Today's brief (unified dark hero)

One card replaces the old heading + table pair. Treatment lifts directly from the Dashboard activity hero so the design language stays one hand:

- Black-led background (`#07050D` → `#0C0A14` vertical), radial purple bloom at top (`rgba(127,90,240,0.18)`) faded with the same `radial-gradient(ellipse 90% 70% at 50% 0%, black 25%, transparent 80%)` mask used in Dashboard.
- Left column (≈55% width):
  - Eyebrow row: tiny "Today's brief" with italic purple period dot · "Updated 2h ago" mono caption.
  - **Narrative line** in Figtree, 17px, white/90: one sentence that reads like a person wrote it. e.g. _"Search inefficiencies are driving up CPA. We found $5,400/mo in recoverable spend across 47 keywords and 3 campaigns."_
  - Primary CTA pill: "Run all audits →" (purple, white text, soft glow).
- Right column: smoothed purple wave chart (re-uses the existing `DailyTrendChart` smoothPath logic, single colour stroke + gradient fill, no axis). Pure decoration here — it signals "we're watching" without being interactive.
- Below both columns: 3 findings nested inside the same card, separated by hairline `rgba(255,255,255,0.06)`. Each row: status dot (red has soft halo), title, source meta, right-aligned $ + descriptor, caret. Same content the current FINDINGS array carries.

The card is the page's signature moment.

### 5 · Performance

Keep the existing KPI quad (Spend / Conversions / CPA / CTR) and daily trend chart — they're already close to the reference. Tweaks:

- KPI sparkline thickens to 1.8px and gets a faint gradient under it (matches the trend chart's gradient family).
- Trend chart adds dotted gridlines (3 horizontal) for legibility.
- Section heading retains the italic purple period dot.

### 6 · On the schedule  +  Recent activity (2-up)

Two equal columns. Both light cards, no dark surfaces here.

**On the schedule (left)** — small editorial card:
- Eyebrow: "On the schedule" + italic purple period.
- 3 rows max, each row: cadence chip (mono uppercase, e.g. `MON 9AM`, `EVERY FRI`, `DAILY`), agent emoji + name, next-run relative time (e.g. "in 2 days"), a hairline separator.
- Footer link: "Adjust schedule →" (purple, semibold, ArrowRight).
- If empty state: suggest the 3 most-relevant agents for this project's industry (this is the only place we surface suggestions).

**Recent activity (right)** — existing timeline component, lightly tightened. Green dots, hairline rail, 3 rows.

### 7 · Top performers  +  Needs attention (2-up)

The existing `CampaignCard` is already good — keep it, just make it the closing section instead of being buried under other blocks. Section heading: "Campaigns" with eyebrow sub "152 total · 8 types" and "View all →" link to a future `/projects/:id/campaigns` route.

## What gets cut

- The mid-page `Run an agent` triple dark cards (lines 306-349 of Project.tsx). Removed entirely.
- The bottom `Ask command bar` (lines 433-450). Removed entirely.
- The `AGENT_CARDS` const array, the unused `Detective/Microscope/Drop` imports.

## What gets added

- `SCHEDULE` mock array in `src/mock/projects.ts` (or co-located in Project.tsx for now): 3 scheduled-agent rows per project, keyed by project id. For unscheduled projects, surface 3 industry-suggested agents.
- `TodaysBriefCard` component (could stay inline given it's used once on this page).

## Consistency check

- ✅ Italic purple period dots in every section heading (already there).
- ✅ Black-led dark surface with subtle purple bloom (matches Dashboard activity hero exactly).
- ✅ Figtree display, Courier mono eyebrows, tabular numbers (existing tokens).
- ✅ No pre-run $ figures or duration claims anywhere — every $ shown is anchored to post-run findings or actual account spend. Schedule chips show cadence, not duration estimates.
- ✅ White icons on dark surfaces (`text-white/78` for muted, white for active) per `feedback_dark_surfaces_black_led_white_icons.md`.

## Out of scope

- Tabs (Business context / Competitors / AI instructions / Settings) — these stay as decorative tabs in this redesign. Wiring them is a separate task.
- A real `/projects/:id/campaigns` route — "View all" is a placeholder.
- Adjusting the schedule (the "Adjust schedule" link is a placeholder).
- Empty-state UX polish — for now boulder-care has a populated schedule; empty-project handling can be done in a follow-up.
