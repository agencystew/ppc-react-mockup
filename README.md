# PPC.io · React app mockup

Vite + React + TypeScript + Tailwind. Design-iteration mockup for the rebuilt
PPC.io app (Jose is replacing Flux components with plain React inside Laravel).

Built so Mike + Jose can click through the full happy path before any Laravel
work starts. Components are organised so they can be lifted into the real app.

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Dashboard — agency control room (attention queue, runs, suggested next) |
| `/agents` | Agent catalog — 28 agents across 7 categories |
| `/agents/:slug` | Agent detail + launch config |
| `/agents/:slug/run/:runId` | Agent running (the StagePage narrative canvas) |
| `/reports/:runId` | Agent results (completed StagePage with "Audit the work" reveal) |
| `/projects/:id` | Project page — connected accounts, campaigns, recent runs |

The Home page has a dev-only "Jump to" strip linking to every showcase route.

## Run locally

```
npm install
npm run dev
```

## Brand

Uses canonical PPC.io tokens (`src/styles/colors_and_type.css`,
`src/styles/ppc-snippets.css`) — same Figtree / Outfit / Space Mono stack and
`#8057FF` purple as ppc.io. Soft lavender page background, white cards, dark
editorial blocks on hero moments.

## Design philosophy

Three things sold per page: **MONEY · TIME · APPROVAL.** Agents are the
vehicle, the outcomes are the sell. Never pre-run dollar figures on
Catalog/Detail/Launch. Storytelling antidote to "AI confidently rambles" —
methodical named stages on the running page, "Audit the work" reveal on the
results page exposing every tool call and source table.
