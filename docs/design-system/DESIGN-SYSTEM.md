# PPC.io app — Design System v5

> **"Moments, not modes."** Four surface types. Each gets one treatment. No theme toggle, no exceptions.
>
> Source artifacts (the canonical reference renderings): [v5-source-artifacts/](v5-source-artifacts/)
> - [01-agent-configure.html](v5-source-artifacts/01-agent-configure.html) — Surface 02 (light + dark hero) anatomy
> - [02-display-typography.html](v5-source-artifacts/02-display-typography.html) — Figtree 900 display reference
> - [03-surface-taxonomy.html](v5-source-artifacts/03-surface-taxonomy.html) — The 4 surfaces with rules + briefing block

This is the design system for the PPC.io app surfaces (`_react-mockup/`). It supersedes the prior canonical brand tokens (`#8057FF`, `#0C0C0E`) for app pages. Marketing site (`~/ppc-frontend/`) is a separate decision.

---

## 1 · The 4 surface types

| # | Surface | Treatment | Pages |
|---|---|---|---|
| **01** | **Always dark** | `#0F0A1E` sidebar with purple active state. The only persistent dark element. | Sidebar, mobile bottom nav |
| **02** | **Light canvas + dark hero** | Lavender canvas, dark hero block holds the headline + primary CTA, white cards underneath | Agent catalog, project overview, dashboard home, account creation |
| **03** | **Light canvas + dark drama** | Full content area goes dark. Giant headlines. Progress, not data tables. | Agent loading, agent running, mission control live, success states |
| **04** | **Pure light work surface** | White cards on lavender. Status via 3px left-border strips, never full backgrounds. | Projects table, findings, audit results, settings, AI instructions, business context, reports |

Map page → surface:

| Route | Surface | Notes |
|---|---|---|
| `AppShell` (sidebar chrome) | 01 | Persistent dark rail |
| `/` Dashboard | 02 | Dark hero card with "this week" rollup, white project cards below |
| `/agents` Catalog | 02 | Dark hero introducing the agent roster, white agent cards underneath |
| `/agents/:slug` Detail/Launch | 02 | Dark hero with agent name + sticky dark CTA bar, white "How it thinks" + "Tune it" cards |
| `/agents/:slug/loading/:runId` | 03 | Full dark drama, giant headlines step through "Sizing their spend." |
| `/agents/:slug/run/:runId` Running | 03 | Full dark drama, StagePage cinema |
| `/reports/:runId` Results | 04 | Pure light work surface, status strips on findings |
| `/projects` List | 04 | Pure light work surface, white client cards on lavender |
| `/projects/:id` Detail | 02 | Dark hero summarizing the client, white card grid |

---

## 2 · Foundation tokens

### Color
| Role | Token | Value |
|---|---|---|
| Sidebar bg | `--ppc-sidebar` | `#0F0A1E` |
| Canvas bg | `--ppc-canvas` | `#ECEAFA` |
| Card bg | `--ppc-card` | `#FFFFFF` |
| Card border | `--ppc-card-border` | `0.5px solid #d9d4ec` |
| Soft purple panel | `--ppc-panel-soft` | `#EEEDFE` |
| Primary purple | `--ppc-purple-500` | `#7F5AF0` |
| Accent purple (text/icons) | `--ppc-purple-700` | `#534AB7` |
| Deep purple (chip text) | `--ppc-purple-800` | `#3C3489` |
| Ink (primary text) | `--ppc-ink` | `#1a1625` |
| Muted text | `--ppc-text-muted` | `#6b6480` |
| Faint text (stage nums, timing) | `--ppc-text-faint` | `#b0a9c2` |
| On-dark muted text | `--ppc-text-on-dark` | `#b8aeda` |

**Status strips (3px left border on white cards — Surface 04):**
| Status | Color |
|---|---|
| Critical | `#E24B4A` |
| Warning | `#BA7517` |
| Healthy | `#5DCAA5` |

**Hero radial glow (Surface 02 + 03 dark hero blocks):**
```css
position: absolute; top: -50px; right: -50px;
width: 220px; height: 220px;
background: radial-gradient(circle, rgba(127, 90, 240, 0.3) 0%, transparent 60%);
border-radius: 50%;
```

### Typography
| Role | Family | Weight | Size | Tracking | Leading | Notes |
|---|---|---|---|---|---|---|
| Display moment | Figtree | 900 | 88px (64px when long) | `-0.035em` | `0.92` | Used in Surface 03 cinema headlines. **Always** ends with purple period. |
| Section H1 | Figtree | 800 | 38px | `-0.025em` | `1.0` | "How [agent] thinks." |
| Section H2 | Figtree | 700 | 36px | `-0.02em` | `1.05` | Page-level title in Surface 02 hero |
| Card label | Figtree | 500 | 15–17px | `-0.005em` | inherit | Phase title, "Tune it" |
| Body | Figtree | 400 | 13–14px | inherit | `1.5–1.6` | Stage descriptions, supporting text |
| Stage row name | Figtree | 500 | 13px | inherit | `1.5` | |
| Eyebrow / timing / nums | Courier New | 400 | 10–11px | `1.2–1.4px` | inherit | All-caps for eyebrows; mixed-case for stage numbers and timing |

**Brand motif:** trailing purple period (`<span style="color: #7f5af0;">.</span>`) closes every headline. Non-negotiable.

### Radii
| Role | Value |
|---|---|
| Page-section card | `14px` |
| Generic card | `12px` |
| Phase badge | `4px` |
| Chip | `12px` (pill) |
| Segmented control track | `8px` |
| Segmented control active chip | `6px` |

### Shadow
- Cards on lavender: no drop shadow. The `0.5px solid #d9d4ec` border is the only edge.
- Sticky dark CTA bar: no shadow. The radial glow is the depth cue.

---

## 3 · Component patterns

### Phase badge
```html
<span class="phase-badge">PHASE 01</span>            <!-- dark, default -->
<span class="phase-badge-accent">PHASE 03</span>     <!-- purple, the highlighted phase -->
```
- Dark variant: `background: #1a1625; color: white;`
- Purple variant: `background: #7f5af0; color: white;`
- Both: 10px Figtree 500, `padding: 4px 9px`, `border-radius: 4px`, `letter-spacing: 0.8px`

### Stage row
```
[stage_num · 18px][stage_name · 160px][stage_desc · flex][stage_time]
```
Separated by `border-bottom: 0.5px solid #ECEAFA`. 9px vertical padding. Stage number uses Courier New 11px `#b0a9c2`. Timing uses Courier New 11px `#b0a9c2` aligned right.

### Phase rail
Wraps all stages within a phase. `border-left: 1.5px solid #ECEAFA` (or `#EEEDFE` for the highlighted purple phase). 16px left padding. 6px left margin.

### "You walk away with" panel
- `background: #EEEDFE`, `border-radius: 12px`, `padding: 20px 22px`
- Bullet dots: 5px × 5px circle in `#534AB7`, `margin-top: 8px`
- Two-line item: bold ink title (13px Figtree 500) + purple-700 subtitle (12px, `line-height: 1.55`)

### Tune-it segmented control
```
[ inactive · #6b6480 ][ ACTIVE · white card · #1a1625 ][ inactive ]
```
Track: `background: #ECEAFA`, `border-radius: 8px`, `padding: 3px`, `gap: 2px`
Chip: `padding: 5px 10px`, `font-size: 12px`
Active chip: `background: white`, `border-radius: 6px`, `font-weight: 500`

### Competitor / tag chip
- Standard: `background: #EEEDFE`, `color: #3C3489`, `padding: 4px 10px`, `border-radius: 12px`, 12px font
- "Add" chip: `background: white`, `border: 1px dashed #b0a9c2`, `color: #6b6480`

### Sticky dark CTA bar (Surface 02 footer)
- `background: #0F0A1E`, `border-radius: 14px`, `padding: 22px 24px`
- Radial purple glow top-right (see snippet above), `overflow: hidden`
- Left side: agent name + run summary (`color: #b8aeda` for the sub-line)
- Right side: `#7f5af0` solid button, `padding: 11px 22px`, `border-radius: 8px`, 13px Figtree 500

### Status strip card (Surface 04)
- White card on lavender. 3px left-border in status color. NEVER full-color background.
- Body uses ink primary + muted secondary text.

### Breadcrumb
```
[client_chip] / Agents / 🕵️ Competitor Spy           Last run 2d ago
```
- Client chip: 18×18 colored square with single-letter monogram, 4px radius, 9px white text 500-weight
- Separators: `color: #b0a9c2`
- Final segment: `color: #1a1625`, `font-weight: 500`
- Right-aligned timestamp: 11px `#6b6480`

---

## 4 · Hard rules

1. **Bright purple is rationed.** `#7F5AF0` appears at most **once per screen** — the top recommendation or the primary CTA. Not on every section.
2. **Canvas is never pure white.** Always `#ECEAFA` lavender. Pure white is reserved for cards.
3. **No drop-shadows on cards on lavender.** The `0.5px #d9d4ec` border is the only edge.
4. **No theme toggle.** Surface type is a property of the page, not a user preference.
5. **Status communicated via 3px left strips, never full-color backgrounds.** Red/orange/green-tinted card backgrounds are AI-slop tells.
6. **Trailing purple period closes every headline.** Display, H1, H2 all get the period. Not on body text.
7. **Eyebrows are Courier New.** Display + section headlines are Figtree. Don't mix.
8. **Big fonts for moments, regular weight for work.** Surface 03 (running) gets 88px. Surface 04 (results) stays at body sizes.

---

## 5 · The briefing block (paste into AI design agents)

```
PPC.io uses a "moments not modes" design system. Sidebar is always dark
(#0F0A1E). Main canvas is always lavender (#ECEAFA), never pure white.
Work surfaces use white cards (#FFFFFF) with 0.5px solid #d9d4ec borders.
Status communicated via 3px left-border strips, never full-color backgrounds.
Decision pages use dark hero blocks inside the lavender canvas. Live agent
states take over the full content area with dark backgrounds + giant
headlines. Bright purple (#7F5AF0) is used once per screen, max, for the top
recommendation or primary CTA. There is no dark mode toggle. Typography:
large bold headlines for moments, regular weight for work. Trailing purple
period (.) is a brand motif on headings.
```

---

## 6 · Source-of-truth flow

1. **Visual reference renderings** live as standalone HTML in `v5-source-artifacts/` — open these in a browser to see the literal target.
2. **Tokens** live in [tailwind.config.js](../../tailwind.config.js) and [src/styles/colors_and_type.css](../../src/styles/colors_and_type.css).
3. **This doc** describes the rules and patterns. When tokens change, update both this doc and the artifact rendering metadata at the top of each `.html`.
4. **Don't invent new colors, fonts, radii, or shadows.** If the need isn't covered above, find the closest sibling pattern and reuse its language.
