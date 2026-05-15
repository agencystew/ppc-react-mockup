# Project Navigation Design — 2026-05-15

> **Origin:** Jose flagged the question on 2026-05-15: should sidebar project links always go to the project dashboard, or should we force the user to ALWAYS select a project scope? "It's an infrastructure we must solve. Most SaaS scope by project."
>
> **Decision driver from Stewart (this session):**
> 1. PPC.io is **cross-account-first**. Operator opens app to triage across ALL clients first; drops INTO a single project only when something needs deeper work. Closer to Stripe / AWS Console than Linear / Vercel.
> 2. The friction that's actually biting is **orientation** ("am I in Hoth or am I just looking at Hoth?"), not launch ambiguity.

---

## The unifying principle

> **You're either in Workspace mode (cross-account, your home) or inside one Project (a client's cockpit). The URL says which, the layout says which, the breadcrumb says which. No ambient toggle, no half-modes, no silently-stuck filter.**

The **project chip is the ONLY way into project scope**. The **workspace nav is the ONLY way out**. There is no persistent dropdown picker, no ambient filter, no shared "current project" state across pages.

---

## Why not the obvious alternatives

### Why not "force project scope always" (Linear / Vercel model)
PPC.io is bimodal by job. Daily monitoring ("what fires today?") and cross-account learning ("show me every account where the negative-kw agent flagged > $500") are first-class jobs. Forcing project scope creates a hidden "All projects" mode that contradicts the promise. Stewart confirmed: cross-account-first.

### Why not "persistent scope picker at the top" (Stripe multi-org model)
Ambient scope state is the #1 UX leak in Stripe. "Why is my catalog empty? Oh, I'm still scoped to Edwin Novel from last Tuesday." Mode is invisible until it bites. Bookmarks and shared URLs lose context. Stewart's pain is orientation — a hidden mode would make orientation worse, not better.

### Why not "two parallel surfaces with project sub-nav"
Heaviest IA. Two paths to every agent. Reports duplicated (global vs project). Overbuilds for an app where the portfolio view is the actual home. Worth revisiting if per-project deep work grows beyond what the cockpit page can hold.

---

## Five concrete moves

### 1. Sidebar splits into two labelled zones

- **`WORKSPACE`** header → Dashboard, Chat, Agents, Reports. All cross-account, all unscoped URLs.
- **`PROJECTS`** header → 8 client chips, each routes to `/projects/:id` (the cockpit). Plus "All projects".

The split is visual and headed, so it's obvious at a glance: workspace items are global; project items are scoped destinations. Today this distinction exists in the code (`AppShell.tsx` already has a `ProjectsSection` component) but not as a visible category boundary — the chips sit under projects but read as more nav.

### 2. The "where am I" affordance lives in the page, not the sidebar

A persistent scope indicator at the **top-left of the content area**:

- **Workspace pages:** eyebrow reads `PORTFOLIO · All Accounts` over the page title.
- **Project pages:** a pill `🏢 The Hoth · Cockpit` with:
  - A tiny `↗ switch` quick-picker (drops a popover of the other 7 clients to swap to without going back to the sidebar).
  - An `× exit to workspace` chip (drops back to Dashboard).

The pill is the orientation answer. You can't lose track of mode because it's the loudest thing on the page.

### 3. Sidebar active-state mirrors mode (no half-active)

- **Workspace mode:** a workspace nav item gets the soft-tint + 2px gradient bar. Zero project chips highlighted.
- **Project mode:** the active project chip gets the bar. Zero workspace items highlighted (because you're not in any of them).
- Clicking a workspace nav item while in a project = explicit exit. The pill disappears. No "ghost scope" left over.

This is enforceable via route prefix: any path starting with `/projects/:id/...` is project mode; everything else is workspace mode. The active-state logic keys off path prefix, not React state.

### 4. URL = scope (so sharing always carries context)

| Intent | URL |
|---|---|
| Global catalog discovery | `/agents/lp-audit` |
| Project-scoped catalog detail | `/projects/hoth/agents/lp-audit` |
| The run itself (always project-scoped) | `/projects/hoth/runs/abc123` |
| Project cockpit | `/projects/hoth` |
| Project reports filtered | `/projects/hoth/reports` |
| Global reports (cross-account) | `/reports` |

Same `AgentDetail` component, two render modes:
- **Unscoped:** "Run on…" button → opens client picker (single OR multi-select for parallelizable agents) → resolves to `/projects/:id/runs/:runId`.
- **Scoped:** "Run on Hoth" button → one click → resolves to `/projects/hoth/runs/:runId`.

Both end at the same canonical run URL. The launch path is just the entry into it.

### 5. Project page earns its destination status

If clicking a chip just lands on a thin page, the IA feels pointless. The Project cockpit needs:

- That client's **running agents** (live status, time remaining).
- **Recent reports** for this client (last 5–10).
- **Account health glance** (red/yellow/green orb + delta vs last week).
- **"Launch on Hoth" panel** that opens a project-scoped catalog filter at `/projects/hoth/agents`.
- **Recent activity timeline** (runs, alerts, manual notes).

`Project.tsx` is already reaching for this — the IA change just means the cockpit must visibly reward the user for landing there. If it doesn't, they'll go back to global Catalog every time and the chip becomes vestigial.

---

## Edge cases

| Case | Resolution |
|---|---|
| User clicks "Catalog" while inside a project | Goes to global `/agents`. Pill disappears. They explicitly left the project; that's fine and visible. |
| User wants to browse agents while staying scoped | Use the in-cockpit "Launch on Hoth" panel, which routes to `/projects/hoth/agents`. The breadcrumb pill stays. |
| Agent run is cross-account (e.g. portfolio scan) | Launches from global Catalog with multi-select; spawns N child runs (one per client) visible in each cockpit, plus an aggregate parent at `/runs/parent-:id`. v1 can defer aggregate view; the per-client runs work today. |
| Teammate shares a URL | Always reproducible because URL = scope. No "you need to switch to Hoth first" dance. |
| User bookmarks a project view | Bookmark lands them in project mode immediately. Pill appears. Sidebar chip highlighted. |
| Sidebar chip click while already in a different project | Switches projects. Pill updates. URL prefix changes. No interstitial. |

---

## What this changes in the codebase

Roughly scoped (mockup, not production):

1. **`AppShell.tsx`** — add visual `WORKSPACE` and `PROJECTS` section headers in the sidebar. Already has the structure; just needs the labels and a divider.
2. **New component: `ScopePill`** — renders at the top of the content area. Two states (Portfolio / Project). Project state includes switch popover + exit chip. Reads scope from `useLocation()` path prefix.
3. **`AppShell.tsx` active-state logic** — make project chip active iff `path.startsWith('/projects/' + p.id)`. Make workspace nav items inactive whenever in project mode.
4. **`App.tsx` routes** — add nested project routes:
   - `/projects/:id/agents` — project-scoped catalog filter (reuses `AgentCatalog` with a `projectId` prop or context).
   - `/projects/:id/agents/:slug` — project-scoped agent detail (reuses `AgentDetail` in scoped mode).
   - `/projects/:id/runs/:runId` — project-scoped run (canonical run URL).
   - `/projects/:id/reports` — project-scoped reports filter.
5. **`AgentDetail.tsx`** — add `scopedProjectId` prop. If present, hide the account picker and pre-fill the launch button text. Otherwise show the picker step.
6. **`Project.tsx`** — flesh out the cockpit per move #5. Likely a separate follow-up after the IA lands.

---

## Out of scope for this design

- Per-project permissions (the chip-as-only-entry-point makes this trivial later, but not now).
- Multi-workspace / multi-agency (one operator = one workspace right now).
- Team member presence indicators on project chips.
- Aggregate parent-run view for cross-account agent fan-out.

---

## Open questions to revisit after Jose's diagnosis of the other 3 pages

- Does Reports need both a global and per-project view, or does the Reports page accept an optional `?project=hoth` filter? (Current design says nested route, but a query param is cheaper.)
- Does Chat get project-scoped threads (`/projects/hoth/chat`), or stay workspace-only? Probably workspace-only for v1 — chat is a tool, not a per-client artifact.
- Does the `↗ switch` quick-picker on the project pill need search? With 8 clients, no. With 50, yes.

---

## Adjacent memory

- `[reference_ppc_react_mockup_deploy.md]` — repo / deploy / 8-client roster.
- `[project_ppcio_app_react_rebuild_2026_05_14.md]` — Jose dropping Flux, designing all pages from scratch. This design is one of the infrastructure decisions feeding into that.
- `[feedback_dark_surfaces_black_led_white_icons.md]` — sidebar treatment rules; the WORKSPACE / PROJECTS headers and the active-state bar must follow this language.
- `[feedback_fix_dont_remove_element_complaints.md]` — when implementing, fix the named element, don't kill the architectural pattern around it.
