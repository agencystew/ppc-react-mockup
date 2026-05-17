// Catalog of agents shown on /agents.
//
// All copy here is PRE-RUN copy — compelling unspecific outcome language only.
// See: feedback_no_pre_run_dollar_figures.md
//
// Source-of-truth for agent list: ppc-io-saas/agents/README.md
// 23 launch agents + 5 context agents = 28 total. Stewart's CLAUDE.md.

import type { AgentDefinition } from '../types/agent';

export const AGENTS: AgentDefinition[] = [
  // === OPERATIONS (6) ====================================================
  {
    slug: 'weekly-audit',
    name: 'Weekly Audit',
    emoji: '📊',
    category: 'operations',
    headline: 'Find what changed this week.',
    outcomeDescription:
      "A senior-strategist-grade rundown of every meaningful shift across your accounts. Surface the wins, flag the leaks, and queue next week's plays.",
    expectedDuration: '~12 min',
    thinkingSteps: [
      'Reads the week against business context',
      'Checks alignment before performance',
      'Surfaces what actually matters, not noise',
    ],
    inspects: [
      { title: 'Spend leaks',           desc: 'Reads cost against converted revenue across every keyword and ad group.' },
      { title: 'Negative gaps',         desc: 'Stress-tests every search term against twelve months of converting intent.' },
      { title: 'Search term drift',     desc: 'Flags terms that converted last quarter but stopped this one.' },
      { title: 'Quality score outliers',desc: 'Surfaces ad relevance and landing experience gaps inflating CPC.' },
      { title: 'Bid cap interference',  desc: 'Detects budgets and tCPA settings throttling profitable campaigns.' },
      { title: 'Ad copy fatigue',       desc: 'Identifies headlines whose CTR has slipped since the last refresh.' },
      { title: 'Auction shifts',        desc: 'Catches new competitor entries and lost-impression-share movements.' },
      { title: 'Pacing risk',           desc: 'Reads month-to-date burn against historical pace and remaining demand.' },
    ],
  },
  {
    slug: 'deep-account-audit',
    name: 'Deep Account Audit',
    emoji: '🔍',
    category: 'operations',
    headline: 'The audit you keep meaning to do.',
    outcomeDescription:
      'A top-to-bottom audit covering structure, alignment, waste, and growth ceilings. Client-ready output you can hand straight to the meeting.',
    expectedDuration: '~30 min',
    thinkingSteps: [
      'Maps account against business context',
      'Walks alignment chain end-to-end',
      'Prioritises by impact, not by metric',
    ],
  },
  {
    slug: 'negative-keyword',
    name: 'Negative Keyword',
    emoji: '🛡️',
    category: 'operations',
    headline: 'Time to plug the leaks.',
    outcomeDescription:
      'A brand-safe negatives list grouped by theme, with the converting traffic you almost killed already filtered out.',
    expectedDuration: '~18 min',
    thinkingSteps: [
      'Classifies every term by intent',
      'Clusters waste by theme, not single terms',
      'Stress-tests against 12 months of converting queries',
    ],
  },
  {
    slug: 'budget-pacer',
    name: 'Budget Pacer',
    emoji: '⏱️',
    category: 'operations',
    headline: 'Spend smoother. Spend smarter.',
    outcomeDescription:
      'A daily pacing plan with budget reallocation per campaign, weighted by recent performance and forecasted demand.',
    expectedDuration: '~8 min',
    thinkingSteps: [
      'Reads month-to-date pace + remaining demand',
      'Reallocates against profit signal, not spend signal',
      'Flags campaigns to throttle or unleash',
    ],
  },
  {
    slug: 'spend-leak',
    name: 'Spend Leak Detector',
    emoji: '💧',
    category: 'operations',
    headline: 'Find the money you forgot you were losing.',
    outcomeDescription:
      'Every place your budget is bleeding without conversions: dead keywords, broken funnels, drained dayparts, misfiring placements.',
    expectedDuration: '~14 min',
    thinkingSteps: [
      'Reads cost data against converted revenue',
      'Surfaces sources of zero-return spend',
      'Ranks fixes by recoverable dollars per hour',
    ],
  },
  {
    slug: 'profit-tracker',
    name: 'Profit Tracker',
    emoji: '📈',
    category: 'operations',
    headline: 'Stop optimising for spend. Optimise for profit.',
    outcomeDescription:
      'A profit-weighted view of every campaign with LTV-aware CAC, so you stop killing winners and feeding losers.',
    expectedDuration: '~16 min',
    thinkingSteps: [
      'Pulls revenue and margin data',
      'Reframes performance through LTV vs CAC',
      'Recommends scale / hold / cut per campaign',
    ],
  },

  // === CREATIVE & CONTENT (4) ============================================
  {
    slug: 'ad-copy',
    name: 'Ad Copy',
    emoji: '✍️',
    category: 'creative',
    headline: 'Write ads your competitors wish they had.',
    outcomeDescription:
      'Ad variants grounded in your real buyer language and the competitive gap, not generic best-practice templates.',
    expectedDuration: '~10 min',
    thinkingSteps: [
      'Reads buyer persona + offer context',
      'Compares against active competitor angles',
      'Drafts variants by angle, not by character count',
    ],
  },
  {
    slug: 'landing-page',
    name: 'Landing Page Audit',
    emoji: '📄',
    category: 'creative',
    headline: 'See the page the way your customer does.',
    outcomeDescription:
      'A page-by-page critique scored against your offer, your buyer persona, and the alignment chain — with concrete fixes.',
    expectedDuration: '~12 min',
    thinkingSteps: [
      'Reads the page against business context',
      'Checks alignment: ad ↔ page ↔ offer',
      'Surfaces fixes in priority order',
    ],
  },
  {
    slug: 'landing-page-designer',
    name: 'Landing Page Designer',
    emoji: '🎨',
    category: 'creative',
    headline: 'Hand your client something they\'ve never seen before.',
    outcomeDescription:
      'A full landing-page concept tailored to your buyer persona and competitive set — wireframe, copy, and rationale.',
    expectedDuration: '~22 min',
    thinkingSteps: [
      'Synthesises buyer + competitor evidence',
      'Designs against alignment chain, not aesthetics',
      'Delivers concept + rationale you can defend',
    ],
  },
  {
    slug: 'shopping-feed',
    name: 'Shopping Feed Doctor',
    emoji: '🛒',
    category: 'creative',
    headline: 'Fix the feed before you fix the bid.',
    outcomeDescription:
      'Title rewrites, attribute gaps, taxonomy fixes, and disapprovals worked through against your category-specific buyer behavior.',
    expectedDuration: '~14 min',
    thinkingSteps: [
      'Audits feed quality + completeness',
      'Reads against category-specific search intent',
      'Prioritises fixes by likely impression lift',
    ],
  },

  // === STRATEGIC DEEP-DIVE (5) ===========================================
  {
    slug: 'competitor-spy',
    name: 'Competitor Spy',
    emoji: '🕵️',
    category: 'strategic',
    headline: 'See what your rivals are actually doing.',
    outcomeDescription:
      'A live read on every competitor in your auction: their angles, their spend trajectory, their funnels, and the gaps they\'re exploiting.',
    expectedDuration: '~45 min',
    thinkingSteps: [
      'Maps the actual competitive set',
      'Walks every rival landing page and ad',
      'Surfaces unclaimed positioning territory',
    ],
  },
  {
    slug: 'pmax',
    name: 'Performance Max Auditor',
    emoji: '⚡',
    category: 'strategic',
    headline: 'See inside the black box.',
    outcomeDescription:
      'Asset-group-level breakdown of where Pmax is winning, where it\'s burning, and which signals to feed it next.',
    expectedDuration: '~20 min',
    thinkingSteps: [
      'Reads asset group performance against goals',
      'Identifies signal vs noise per channel',
      'Recommends signal tuning, not blind exclusions',
    ],
  },
  {
    slug: 'keyword',
    name: 'Keyword Hunter',
    emoji: '🎯',
    category: 'strategic',
    headline: 'Find the demand you\'re missing.',
    outcomeDescription:
      'A prioritized expansion list grounded in your buyer persona, your offer, and the keywords your competitors are quietly winning on.',
    expectedDuration: '~18 min',
    thinkingSteps: [
      'Anchors against persona + offer',
      'Cross-references competitor coverage',
      'Ranks by intent quality, not search volume',
    ],
  },
  {
    slug: 'keyword-auditor',
    name: 'Keyword Auditor',
    emoji: '📋',
    category: 'strategic',
    headline: 'Find the keywords that should be dead.',
    outcomeDescription:
      'A diagnosis of every keyword that\'s eating budget without earning it, with action per keyword (pause / lower / retarget).',
    expectedDuration: '~12 min',
    thinkingSteps: [
      'Reads cost + conversion per keyword',
      'Reframes through profitability lens',
      'Recommends targeted action, never blanket pauses',
    ],
  },
  {
    slug: 'campaign-architect',
    name: 'Campaign Architect',
    emoji: '🏗️',
    category: 'strategic',
    headline: 'Rebuild the structure that\'s holding you back.',
    outcomeDescription:
      'A target campaign + ad group structure mapped to your real offers, with the migration plan to get there safely.',
    expectedDuration: '~28 min',
    thinkingSteps: [
      'Reads current structure against business context',
      'Designs target structure for alignment',
      'Plans migration to protect learnings',
    ],
  },

  // === BUYER UNDERSTANDING (2) ===========================================
  {
    slug: 'buyer-journey',
    name: 'Buyer Journey',
    emoji: '🗺️',
    category: 'buyer',
    headline: 'Walk in your buyer\'s shoes.',
    outcomeDescription:
      'The journey your highest-value buyers actually take: first touch, hesitation points, decision triggers — and what your funnel is missing.',
    expectedDuration: '~16 min',
    thinkingSteps: [
      'Synthesises persona + conversion data',
      'Maps stages from intent to purchase',
      'Surfaces the moments your funnel breaks',
    ],
  },
  {
    slug: 'readiness',
    name: 'Buyer Readiness',
    emoji: '🎚️',
    category: 'buyer',
    headline: 'Sort the buyers from the browsers.',
    outcomeDescription:
      'A readiness model for your traffic — who\'s ready now, who needs nurturing, who\'s wasting your spend — applied at the campaign level.',
    expectedDuration: '~14 min',
    thinkingSteps: [
      'Scores intent signal per cohort',
      'Distinguishes investigation from purchase intent',
      'Recommends bid + creative strategy per readiness',
    ],
  },

  // === STRATEGIC DIAGNOSTICS (2) =========================================
  {
    slug: 'demand-ceiling',
    name: 'Demand Ceiling',
    emoji: '📐',
    category: 'diagnostics',
    headline: 'Find out how much room is left.',
    outcomeDescription:
      'A realistic demand model for your market: where you are vs the ceiling, what saturation looks like, what new demand to chase.',
    expectedDuration: '~22 min',
    thinkingSteps: [
      'Sizes addressable demand from auction data',
      'Models your share + headroom',
      'Surfaces expansion paths worth testing',
    ],
  },
  {
    slug: 'test-recommender',
    name: 'Test Recommender',
    emoji: '🧪',
    category: 'diagnostics',
    headline: 'Run the tests that actually matter.',
    outcomeDescription:
      'A prioritized test queue with hypothesis, expected lift, and statistical-power-aware design — no more vanity A/Bs.',
    expectedDuration: '~14 min',
    thinkingSteps: [
      'Reads current state against business goals',
      'Identifies highest-leverage test hypotheses',
      'Sizes tests for statistical confidence',
    ],
  },

  // === CLIENT & SALES (2) ================================================
  {
    slug: 'client-reporting',
    name: 'Client Reporting',
    emoji: '📑',
    category: 'client',
    headline: 'Build the report your client will actually read.',
    outcomeDescription:
      "A narrative report grounded in this month's wins, leaks, and next moves — written in your voice, ready to hand over.",
    expectedDuration: '~10 min',
    thinkingSteps: [
      'Reads month\'s data against business context',
      'Frames wins + losses honestly',
      'Closes with concrete next moves',
    ],
  },
  {
    slug: 'sales-intelligence',
    name: 'Sales Intelligence',
    emoji: '🎯',
    category: 'client',
    headline: 'Win the next pitch.',
    outcomeDescription:
      "A pitch-ready briefing on a prospect: their site, their ads, their competitors, their gaps — and exactly how you'd add value.",
    expectedDuration: '~22 min',
    thinkingSteps: [
      'Reads their site + offer + persona',
      'Maps their competitive battlefield',
      'Surfaces concrete value-add hooks',
    ],
  },

  // === ONBOARDING (1) ====================================================
  {
    slug: 'new-client-autopilot',
    name: 'New Client Autopilot',
    emoji: '🚀',
    category: 'client',
    headline: 'Onboard a new account without the slog.',
    outcomeDescription:
      'Business context, persona inference, competitor scan, and a 30-day plan — all from a URL and an MCC link.',
    expectedDuration: '~35 min',
    thinkingSteps: [
      'Infers business context from the live site',
      'Pulls account history + competitor set',
      'Outputs 30-day plan grounded in evidence',
    ],
  },

  // === CHANGE TRACKING (1) ===============================================
  {
    slug: 'change-impact',
    name: 'Change Impact',
    emoji: '📡',
    category: 'diagnostics',
    headline: 'See if your last change actually worked.',
    outcomeDescription:
      'A before/after read on every meaningful change in the account, with attribution-aware impact — not just date-ranged metrics.',
    expectedDuration: '~9 min',
    thinkingSteps: [
      'Identifies meaningful changes by signal, not noise',
      'Reads pre vs post against confound',
      'Reports impact with confidence band',
    ],
  },

  // === ENTERPRISE TIER (1) ===============================================
  {
    slug: 'brand-safety',
    name: 'Brand Safety',
    emoji: '🛡️',
    category: 'diagnostics',
    headline: 'Find the placements you\'d hate to see in the press.',
    outcomeDescription:
      'A scan of every placement, search term, and partner site for brand-risk content — with severity and recommended action.',
    expectedDuration: '~12 min',
    thinkingSteps: [
      'Pulls placement + search-term inventory',
      'Scores brand risk per surface',
      'Prioritises action by exposure × severity',
    ],
  },

  // === CONTEXT (5, run during onboarding) ================================
  {
    slug: 'business-context',
    name: 'Business Context',
    emoji: '🏢',
    category: 'context',
    headline: 'Teach the agents who you actually are.',
    outcomeDescription:
      "A structured read of your business — offer, value props, ICP, brand voice — that every other agent reasons against.",
    expectedDuration: '~7 min',
    thinkingSteps: [
      'Reads your site + offer',
      'Synthesises positioning + value',
      'Stores context every agent inherits',
    ],
  },
  {
    slug: 'competitor-context',
    name: 'Competitor Context',
    emoji: '👥',
    category: 'context',
    headline: 'Know your battlefield before you fight on it.',
    outcomeDescription:
      'A working set of competitors, their angles, their offers, and their funnels — kept fresh and inherited by every agent.',
    expectedDuration: '~12 min',
    thinkingSteps: [
      'Identifies real competitors, not name-checked ones',
      'Reads their positioning + funnels',
      'Stores competitive context for downstream agents',
    ],
  },
  {
    slug: 'google-ads-context',
    name: 'Google Ads Context',
    emoji: '📡',
    category: 'context',
    headline: 'Bring the account up to speed.',
    outcomeDescription:
      'Account hierarchy, naming conventions, history, conversions, and gotchas — distilled so every agent walks in informed.',
    expectedDuration: '~6 min',
    thinkingSteps: [
      'Reads MCC + account hierarchy',
      'Inventories conversions + signals',
      'Captures account quirks for context',
    ],
  },
  {
    slug: 'persona',
    name: 'Buyer Persona',
    emoji: '🧠',
    category: 'context',
    headline: 'Stop targeting "anyone with money".',
    outcomeDescription:
      'A 5-dimension buyer persona built from your site, your traffic, and the language your real customers use.',
    expectedDuration: '~9 min',
    thinkingSteps: [
      'Reads site + traffic + reviews',
      'Builds 5-dimension persona model',
      'Captures language buyers actually use',
    ],
  },
  {
    slug: 'context-enrichment',
    name: 'Context Enrichment',
    emoji: '✨',
    category: 'context',
    headline: 'Sharpen what the agents know about you.',
    outcomeDescription:
      "Optional deeper dive — case studies, internal docs, sales notes — fed into the context layer so agents reason like an insider.",
    expectedDuration: '~10 min',
    thinkingSteps: [
      'Ingests supplemental context',
      'Reconciles with existing business context',
      'Tightens reasoning for downstream agents',
    ],
  },
];

export const CATEGORIES: Record<string, { label: string; description: string }> = {
  operations:  { label: 'Operations',  description: 'Run the account.' },
  creative:    { label: 'Creative',    description: 'Make it convert.' },
  strategic:   { label: 'Strategic',   description: 'See the bigger picture.' },
  buyer:       { label: 'Buyer',       description: 'Know who you\'re selling to.' },
  diagnostics: { label: 'Diagnostics', description: 'Find what\'s broken.' },
  client:      { label: 'Client',      description: 'Win + keep clients.' },
  context:     { label: 'Context',     description: 'What the agents know about you.' },
};
