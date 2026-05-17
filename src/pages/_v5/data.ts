// v5 report summary — data shape + Competitor Spy / Boulder Care fixture.
//
// Approach A from the v5 design brief: extends v4's Discovery card with four
// new trust layers (Investigation hero · Strategy Verdict · Business Context
// cell · Checks Before Export). The Discovery card body refactors to a
// Finding ↔ Next Step two-column grid with six paired fields.
//
// Naming rule for headlines & quotes: name a specific entity, take a
// position, or report a measured number. Never a count of activities.
//
// Money rule: only post-run, anchored, observed dollars. No "recoverable",
// no "potential upside", no "estimated savings". Outcomes are measurable
// metrics (impression share, CTR, CPA) — never projected dollar recovery.
//
// Design doc: docs/plans/2026-05-16-agent-results-v5-design.md

// ─── Types ───────────────────────────────────────────────────────────────

export type Readiness = 'ready' | 'review' | 'open' | 'watchlist';
export type Impact = 'high' | 'medium' | 'low';
export type Shape = 'verdict' | 'fact' | 'gap' | 'pattern';
export type ContextStatus = 'upgraded' | 'complete' | 'downgraded';

// ReportOpenerData replaces the old InvestigationHeroData. The page no longer
// opens with a dark slab + mascot + power stats; that maximalist moment was
// retired in favour of a slim editorial strip (this data) + a dark refined
// verdict card (StrategyVerdictData.h1 + headline + body). Receipts that used
// to be three power-stat boxes now whisper as a single mono caption.
export interface ReportOpenerData {
  agentName: string;
  agentSlug: string;
  projectName: string;
  projectAvatarLetter: string;
  projectAvatarBg: string;
  duration: string;             // "7m 12s" — post-run elapsed
  window: string;               // "7-day window"
  receipts: string;             // "161 tool calls · 84 SERPs · 6 phases"
}

export interface TriageRow {
  state: Readiness;
  count: number;
  label: string;                   // "READY TO ACT"
  description: string;             // one-liner
}

export interface StrategyVerdictData {
  agentName: string;               // for the eyebrow byline
  h1?: string;                     // short imposing punch — "The gap to press." (falls back to headline if absent)
  headline: string;                // longer dek/lede line directly under the h1
  body: string;                    // 2–3 sentences of judgment
  bullets: string[];               // action-oriented strategic moves, 3–4 bullets

  // Kept for data continuity (used in Deep Report synthesis); UI doesn't
  // render Main Risk in v5+ — risk is folded into body + bullets.
  mainRiskTitle?: string;
  mainRiskBody?: string;
  triage?: TriageRow[];
  whyDowngraded?: string;

  primaryCta: string;
  secondaryCta: string;
}

// A win mirrors a finding's depth but reports an observed advantage instead
// of a gap. Context-led: every win names a specific entity, cites real
// business context, and proposes a concrete way to amplify or protect it.
// No "Risk" field — wins are reality, not predictions.
export interface WinV5 {
  id: string;
  rank: number;

  headline: string;                // names the win, cites a measured number

  // Left column — what's working
  whatsWorking: string;
  whyItMatters: string;
  businessContextUsed: string;
  contextStatus: ContextStatus;

  // Right column — how to amplify
  howToScale: string;
  expectedOutcome: string;

  toolCalls: number;
  dataPoints: string;
  primaryCta: string;              // e.g. "Set up watchlist", "Draft variant"
}

export interface DiscoveryV5 {
  id: string;
  rank: number;                    // 01, 02, etc.
  readiness: Readiness;            // colors the rail
  impact: Impact;                  // shown as eyebrow chip
  shape: Shape;                    // VERDICT / FACT / GAP / PATTERN dot label

  headline: string;                // the claim — makes a position, never a count

  // Left column — the finding
  whatWeFound: string;
  whyItMatters: string;
  businessContextUsed: string;
  contextStatus: ContextStatus;
  contextMissingItem?: string;     // only when contextStatus === 'downgraded'

  // Right column — the next step
  whatToDoNext: string;
  expectedOutcome: string;         // measured metrics, NEVER projected $ recovery
  tradeoffRisk: string;

  // Footer
  toolCalls: number;
  dataPoints: string;              // "120 data points · 8 rivals × 15 keywords"
  primaryCta: string;              // "Apply now", "Review 4 terms", "Resolve question"
}

export interface CheckItem {
  title: string;
  body: string;
  linkLabel: string;
  linkHref: string;                // anchor or external
}

export interface AskTheAgentData {
  agentName: string;
  placeholder: string;
  suggestedPrompts: string[];      // 3 run-specific chips
}

export interface AgentResultsV5Data {
  hero: ReportOpenerData;
  verdict: StrategyVerdictData;
  // Wins lead — the strengths the agent verified before getting into gaps.
  wins: WinV5[];
  discoveries: DiscoveryV5[];
  checks: CheckItem[];
  ask: AskTheAgentData;
  deepReport: DeepReportData;
}

// ─── Deep Report types ───────────────────────────────────────────────────

export interface PhaseDataPreview {
  headers: string[];
  rows: string[][];
  moreCount?: number;     // "Showing 4 of 8 rivals" — render below table
  moreLabel?: string;     // "rivals" / "keywords"
}

export type PhaseIcon =
  | 'discovery'
  | 'auction'
  | 'copy'
  | 'pages'
  | 'spend'
  | 'gaps'
  | 'context';

export interface PhaseV5 {
  rank: number;                  // 01–06 for specialists
  slug: string;                  // for anchor links
  iconId: PhaseIcon;             // tile icon in the journey strip
  shortName: string;             // "Discovery" — what shows under the journey-strip tile
  title: string;                 // "Mapping the field" — full phase headline
  agent: string;                 // "Competitor Discovery"
  keyStat: string;               // "8 rivals" — tile subtitle in the strip
  checked: string;               // sentence: what this phase looked at
  found: string;                 // headline conclusion (the punchline)
  reasoning: string;             // 1–2 sentences of interpretation
  passedForward: string;         // what handed off to Strategy Agent
  toolsUsed: string[];           // ["serp_api.search", "web.scrape", "domain.lookup"]
  toolCallCount: number;
  dataPointsLabel: string;       // "8 rivals · 12 keywords · 84 SERPs"
  dataSource: string;            // Human-readable provenance under the table —
                                 // "Pulled via Google Ads API (Auction Insights)
                                 // · 30-day window". Required for Google Ads
                                 // API Standard Access RMF — reporting tools
                                 // must clearly label data sources.
  dataPreview: PhaseDataPreview;
}

export interface ContextDimension {
  name: string;                  // "Boulder Care ICP"
  source: string;                // where the agent pulled it from
  appliedWhere: string;          // which finding(s) used it
}

export interface MissingContextDimension {
  name: string;
  consequence: string;           // what it would have unlocked
  fixHref: string;
}

export interface ContextCrossCheckData {
  used: ContextDimension[];
  missing: MissingContextDimension[];
  changedBecauseOfContext: string[];   // sentences naming specific deltas
}

export interface SynthesisRecommendation {
  rank: number;
  state: Readiness;
  title: string;                 // mirrors a Discovery card headline
  discoveryHref?: string;        // anchor to the Discovery card in Summary
  whyNote?: string;              // brief justification (especially for downgrades)
}

export interface StrategySynthesisData {
  agent: string;                 // "Strategy Agent"
  intro: string;                 // 2-sentence framing
  contextUsedSummary: string;    // one-line restatement
  missingSummary: string;        // one-line restatement
  accepted: SynthesisRecommendation[];   // → ready
  downgraded: SynthesisRecommendation[]; // → review / open / watchlist
  finalStrategy: string;         // the punchline that became the verdict headline
  backToSummaryLabel: string;
}

export interface DeepReportData {
  overviewHeadline: string;          // Figtree 900 + purple period moment
  overviewIntro: string;
  scopeReviewed: string[];           // chip labels: "84 SERPs", "8 rivals", etc.
  sourcesUsed: string;               // single sentence with bullet separators
  footerSummary: string;             // "161 tool invocations · 6 phases · 0 account changes"

  phases: PhaseV5[];
  context: ContextCrossCheckData;
  synthesis: StrategySynthesisData;
}

// ─── Competitor Spy · Boulder Care fixture ───────────────────────────────

export const COMPETITOR_SPY_V5: AgentResultsV5Data = {
  hero: {
    agentName: 'Competitor Spy',
    agentSlug: 'competitor-spy',
    projectName: 'Boulder Care',
    projectAvatarLetter: 'B',
    projectAvatarBg: '#3FB985',
    duration: '7m 12s',
    window: '7-day window',
    receipts: '161 reasoning steps · 84 SERPs analysed · 6 phases',
  },

  verdict: {
    agentName: 'Competitor Spy',
    h1: 'The gap to press.',
    headline: "Outflank Aspen where they're thinnest — not where they're saturated.",
    body:
      "You're not losing to a generalist. You're losing to a specialist who's decided Boulder Care's market is profitable. Aspen sits top-3 on every high-intent recovery keyword you bid on, but rotates to position 4 on exactly 4 of them. That's the gap to press.",
    bullets: [
      'Run head-to-head copy A/B on the 4 keywords where Aspen drops to position 4 — copy lift before any bid moves.',
      'Add Mountain View Wellness, Rocky Mountain Recovery, and Front Range Treatment Co to your tracked competitor list.',
      'Confirm bidding strategy on Brand and Generic Search before exporting bid changes — Smart Bidding ignores manual keyword bids.',
      'Hold the branded-CPC question until lead-to-sale rate is in your Boulder Care project profile.',
    ],
    triage: [
      {
        state: 'ready',
        count: 3,
        label: 'READY TO ACT',
        description: 'Safe, low-risk, you can move on today.',
      },
      {
        state: 'review',
        count: 6,
        label: 'NEEDS REVIEW',
        description: 'Strong evidence, but a judgment call to confirm.',
      },
      {
        state: 'open',
        count: 2,
        label: 'OPEN QUESTION',
        description: "Need business context the agent doesn't have.",
      },
    ],
    whyDowngraded:
      "Without lead-to-sale rate per campaign, Competitor Spy can't confirm whether your $42 branded CPC is profitable defence or wasteful coverage. Add that to Boulder Care's project profile and 2 of the open questions resolve themselves.",
    primaryCta: 'Review the 3 ready-to-act moves',
    secondaryCta: 'Ask the agent',
  },

  wins: [
    // ─── 01 · Brand defensibility — Aspen has stopped contesting your name
    {
      id: 'w-1',
      rank: 1,
      headline: "Brand defensibility intact — Aspen can't displace you on direct intent.",

      whatsWorking:
        "Boulder Care holds 96% Search Impression Share on direct brand queries. Aspen's brand-bid coverage sits at 4%, and their ad-day count on Boulder branded terms dropped 32% quarter-over-quarter.",
      whyItMatters:
        "Direct brand intent converts at 4.2x non-brand rates in your account. Aspen has effectively stopped pushing on your name — which means the budget you'd otherwise be spending to defend brand is freed up for non-brand contests where the actual fight is happening.",
      businessContextUsed:
        "Brand-vs-non-brand conversion ratios from Boulder Care's Google Ads account. Aspen brand-bid history pulled across the 30-day window.",
      contextStatus: 'complete',

      howToScale:
        "Stand up a watchlist alert: notify if any rival's brand IS rises above 5%. Don't relax this — formalise the moat so any encroachment surfaces within 24 hours instead of at month-end review.",
      expectedOutcome:
        "Defensive posture maintained without ongoing manual monitoring. Brand campaign budget can be reduced 15–20% and reallocated to non-brand contests.",

      toolCalls: 7,
      dataPoints: '30-day brand IS · 8 rivals × brand keyword set',
      primaryCta: 'Set up watchlist',
    },

    // ─── 02 · Telehealth-first copy — the only rival promising evenings ──
    {
      id: 'w-2',
      rank: 2,
      headline: "You're the only rival promising evening intake — and 41% of converters search after 5pm.",

      whatsWorking:
        "Across 84 SERPs analysed, Boulder Care is the only advertiser in the recovery space leading with 'evening appointments' and 'same-week availability'. 7 of 8 rivals — including Aspen — advertise weekday hours only.",
      whyItMatters:
        "Your ICP notes 64% of intake calls happen outside business hours; 41% of paid-search converters click after 5pm. Your copy aligns with the moment of decision while rivals advertise to who's free during the day, which isn't who's actually searching.",
      businessContextUsed:
        "Boulder Care intake-time data (64% off-hours) and paid-search hourly conversion breakdown. SERP scrape across 12 keywords.",
      contextStatus: 'upgraded',

      howToScale:
        "Lean harder on the evening hook. Test 'Same-week intake — evenings and weekends' as a pinned headline 1 against current control across your top 3 ad groups. Match landing-page hero copy.",
      expectedOutcome:
        "5–12% CTR lift on after-hours-weighted impressions. Read results in 10–14 days.",

      toolCalls: 12,
      dataPoints: '84 SERPs · 8 rivals × 12 keywords · hour-of-day conversion data',
      primaryCta: 'Draft pinned headline variant',
    },

    // ─── 03 · Zero-paywall funnel — the friction advantage ────────────────
    {
      id: 'w-3',
      rank: 3,
      headline: "Boulder Care is the only player offering a no-card initial assessment.",

      whatsWorking:
        "5 of 8 mapped rivals — including Aspen and Recovery Direct — require credit-card details before the first appointment. Boulder Care's funnel offers a free assessment with zero commitment.",
      whyItMatters:
        "High-intent searchers in addiction recovery skew evidence-first; they evaluate before they commit. Your ICP confirms 'low-friction first step' as the highest-rated funnel attribute. Aspen's paywall is leaving the early-stage evaluation segment uncontested.",
      businessContextUsed:
        "Funnel mapping across 8 rival domains. Boulder Care ICP attribute ranking.",
      contextStatus: 'complete',

      howToScale:
        "Make this concrete on the LP hero. A/B test 'No credit card — assessment is free' against the current 'Book a free assessment' control. Mirror the no-commitment line into your ad copy A/B candidate list too.",
      expectedOutcome:
        "3–8% lift in LP conversion on cold non-brand traffic. Aspen comparison ad-copy candidate validated.",

      toolCalls: 9,
      dataPoints: '8 rival funnel maps · ICP attribute weights',
      primaryCta: 'Set up LP A/B test',
    },
  ],

  discoveries: [
    // ─── 01 · READY · GAP · the unclaimed angle ──────────────────────────
    {
      id: 'd-1',
      rank: 1,
      readiness: 'ready',
      impact: 'high',
      shape: 'gap',
      headline: 'Build 3 RSAs around "same-day intake".',

      whatWeFound:
        '3 rivals run adjacent timeline copy at 0.4%+ CTR. The same-day intake angle itself is empty — no advertiser is leading with it on any of the 12 keywords tested.',
      whyItMatters:
        "For Boulder Care, hours matter. Your ICP notes 64% of intake calls happen outside business hours — patients searching at 11pm aren't comparing five providers, they're trying one. Owning \"same-day intake\" is the difference between being found and being chosen, and it's the rare angle no rival has claimed yet.",
      businessContextUsed:
        "Boulder Care's ICP notes 64% of intake calls happen outside business hours. The unclaimed positioning matches your operational reality.",
      contextStatus: 'upgraded',

      whatToDoNext:
        'Build 3 RSAs around "same-day intake" across your top 3 keyword themes (outpatient, suboxone, alcohol). Pin the angle to headline position 1 only — don\'t let it rotate into description.',
      expectedOutcome:
        '8–15% CTR lift on those 3 keywords without raising bids account-wide. Read results in ~14 days.',
      tradeoffRisk:
        "If your intake team can't honor the same-day promise on weekends, this becomes a brand-trust risk. Confirm staffing capacity before launching.",

      toolCalls: 9,
      dataPoints: '11 unclaimed angles · CTR benchmarks across 8 rivals',
      primaryCta: 'Draft 3 ad variants',
    },

    // ─── 02 · REVIEW · VERDICT · Aspen saturation ────────────────────────
    {
      id: 'd-2',
      rank: 2,
      readiness: 'review',
      impact: 'high',
      shape: 'verdict',
      headline: 'Outflank Aspen on the 4 keywords where they go thin.',

      whatWeFound:
        '$12K/mo estimated spend, active since 2019, 312 active ad days last year. Aspen appears in the top 3 paid positions on all 12 keywords we tested — and rotates to position 4 on exactly 4 of them.',
      whyItMatters:
        "Aspen has decided Boulder Care's market is profitable, and they're not testing — they're saturating. Per your ICP, you have direct overlap with Aspen on 9 of your 12 core recovery keywords, and they sit top-3 on every one. The strategic question isn't whether to contest, it's where: the 4 keywords where they rotate to position 4 are the gap to press.",
      businessContextUsed:
        'Boulder Care ICP confirms outpatient addiction recovery is your core service, which Aspen also targets. Direct overlap on 9 of 12 keywords.',
      contextStatus: 'upgraded',

      whatToDoNext:
        "Outflank where they're thinnest. Run a head-to-head copy A/B on the 4 keywords where Aspen drops to position 4 — copy lift before any bid moves.",
      expectedOutcome:
        '8–12% impression-share recovery on those 4 keywords. ~14 days to read results.',
      tradeoffRisk:
        "If Aspen is also on Smart Bidding, your keyword bid increase may not apply directly — which is why we lead with copy testing, not bids. Confirm your campaign's bidding strategy before any bid changes.",

      toolCalls: 18,
      dataPoints: '120 data points · 8 rivals × 15 keywords',
      primaryCta: 'Review the 4 keywords',
    },

    // ─── 03 · READY · FACT · unmonitored rivals ──────────────────────────
    {
      id: 'd-3',
      rank: 3,
      readiness: 'ready',
      impact: 'medium',
      shape: 'fact',
      headline: 'Add 3 untracked rivals to your Boulder Care watchlist.',

      whatWeFound:
        'Mountain View Wellness and Rocky Mountain Recovery are the most consistent bidders on your top recovery terms, both growing month-over-month. Front Range Treatment Co joined the auction in the last 90 days.',
      whyItMatters:
        "Boulder Care's tracked-competitor list was last updated 6 months ago, so Mountain View Wellness and Rocky Mountain Recovery — both growing month-over-month — have been pressuring your CPCs without ever showing up in your weekly snapshots. Front Range Treatment Co joined the auction in the last 90 days. You were blaming Aspen for spend you couldn't fully explain.",
      businessContextUsed:
        "Boulder Care's tracked-competitor list was last updated 6 months ago. The agent cross-checked the live auction against your project profile.",
      contextStatus: 'upgraded',

      whatToDoNext:
        'Add Mountain View, Rocky Mountain Recovery, and Front Range Treatment to your tracked competitor list. The weekly snapshot picks them up automatically.',
      expectedOutcome:
        'Continuous visibility into 3 new rivals · weekly drift alerts if their bidding behavior changes.',
      tradeoffRisk:
        "None — adding to the watchlist doesn't change spend or campaigns. Purely visibility.",

      toolCalls: 47,
      dataPoints: '8 rivals · 12 keywords · 84 SERPs',
      primaryCta: 'Add 3 to watchlist',
    },

    // ─── 04 · OPEN · FACT · branded CPC question ─────────────────────────
    {
      id: 'd-4',
      rank: 4,
      readiness: 'open',
      impact: 'high',
      shape: 'fact',
      headline: 'Add lead-to-sale rate before judging the $42 branded CPC.',

      whatWeFound:
        'Branded search "boulder care" averages $42 CPC over the last 30 days. 4 rivals bid on your name, including Aspen Recovery. Branded impression share is 78% — meaning 22% of branded searches see a competitor first.',
      whyItMatters:
        "Branded spend is either Boulder Care's most efficient channel (intent is highest) or its most wasteful (these patients would convert organically). Your $42 branded CPC and 78% impression share are facts, but the right answer depends on lead-to-sale rate by source — which isn't in your project profile yet. Acting without it is exactly the move that creates \"we cut brand spend and conversions tanked\" stories.",
      businessContextUsed:
        'Boulder Care ICP and target CPA were considered. Lead-to-sale rate per campaign is missing — this finding is therefore an open question, not an action.',
      contextStatus: 'downgraded',
      contextMissingItem: 'lead-to-sale rate',

      whatToDoNext:
        'Either add lead-to-sale rate per campaign to your project profile, or pull it manually and re-run the agent. Both unblock the recommendation.',
      expectedOutcome:
        'A clear yes/no on whether branded spend should be reduced or held. Currently unanswerable on Google Ads data alone.',
      tradeoffRisk:
        'Acting on this without lead-to-sale data is exactly the move that creates "we cut brand spend and conversions tanked" stories. The agent is asking you to slow down here for a reason.',

      toolCalls: 12,
      dataPoints: 'Branded search report · 30-day window · 4 rivals bidding on brand',
      primaryCta: 'Add lead-to-sale rate',
    },
  ],

  checks: [
    {
      title: 'Resolve 2 open questions',
      body:
        "The agent flagged 2 findings as needing business context it doesn't have. Resolve them in the cards above, or set them aside for the next run.",
      linkLabel: 'Jump to open questions',
      linkHref: '#discovery-d-4',
    },
    {
      title: "Add lead-to-sale rate to Boulder Care's project profile",
      body:
        "Would let Competitor Spy confirm whether the $42 branded CPC is profitable defence or wasteful coverage. Tightens 2 open questions and may upgrade 1 watchlist item on the next run.",
      linkLabel: 'Add now',
      linkHref: '/projects/boulder-care/context',
    },
    {
      title: 'Confirm bidding strategy on Brand and Generic Search campaigns',
      body:
        'Smart Bidding may invalidate the keyword-bid changes proposed in Card 02. Review the strategy in Google Ads before applying anything that touches bids.',
      linkLabel: 'Check in Google Ads',
      linkHref: 'https://ads.google.com/',
    },
  ],

  ask: {
    agentName: 'Competitor Spy',
    placeholder: 'Ask a follow-up question about this run…',
    suggestedPrompts: [
      "Why aren't all the gaps ready to act?",
      'What if I had the lead-to-sale rate?',
      'Explain this to a Boulder Care stakeholder',
    ],
  },

  deepReport: {
    overviewHeadline: 'Reading the rivals.',
    overviewIntro:
      "Competitor Spy ran six specialist phases before passing its findings to the Strategy Agent. Each phase below shows what it checked, what it found, and the data it pulled — expand any phase to see the raw records the agent worked from.",
    scopeReviewed: [
      '84 SERPs',
      '8 rivals',
      '12 keywords',
      '7-day window',
    ],
    sourcesUsed:
      'Google SERPs · Google Ads auction insights · public ad libraries · SimilarWeb · Boulder Care project context · prior account notes',
    footerSummary:
      '161 tool invocations · 6 phases in sequence · 0 account changes made (export-first)',

    phases: [
      {
        rank: 1,
        slug: 'discovery',
        iconId: 'discovery',
        shortName: 'Discover',
        keyStat: '8 rivals',
        title: 'Mapping the field.',
        agent: 'Competitor Discovery',
        checked:
          "Searched Google for Boulder Care's top 12 recovery keywords and recorded every advertiser appearing in the top 4 paid positions over a 7-day window.",
        found:
          "8 active rivals confirmed — 3 of them weren't on Boulder Care's tracked competitor list.",
        reasoning:
          "Cross-referenced each domain against public ad libraries to filter one-off appearances and confirm sustained campaigns. Aspen Recovery Group appeared on every keyword we sampled — a signal of strategic saturation, not opportunistic testing.",
        passedForward:
          "Verified roster of 8 rivals with active-since dates and first-pass spend estimates.",
        toolsUsed: ['serp_api.search', 'web.scrape', 'domain.lookup'],
        toolCallCount: 47,
        dataPointsLabel: '8 rivals · 12 keywords · 84 SERPs',
        dataSource:
          'Pulled via Google SERP API + domain lookup · 7-day window (2026-05-09 → 2026-05-16)',
        dataPreview: {
          headers: ['Rival', 'Domain', 'Est. spend', 'Active since'],
          rows: [
            ['Aspen Recovery Group',      'aspenrecovery.com',     '$12K/mo', '2019'],
            ['Mountain View Wellness',    'mountainviewwell.com',  '$9K/mo',  '2017'],
            ['Rocky Mountain Recovery',   'rockymtnrec.com',       '$7K/mo',  '2021'],
            ['Front Range Treatment Co',  'frontrangetx.com',      '$5K/mo',  '2024'],
          ],
          moreCount: 4,
          moreLabel: 'rivals',
        },
      },
      {
        rank: 2,
        slug: 'auction-intelligence',
        iconId: 'auction',
        shortName: 'Auction',
        keyStat: '120 data points',
        title: 'Reading the auction.',
        agent: 'Auction Intelligence',
        checked:
          "Pulled Google Ads auction insights for Boulder Care's 15 highest-spend recovery keywords. For each, recorded impression share, overlap rate, position above rate, and outranking share over the last 30 days.",
        found:
          "Top 3 rivals control 64% of impression share on core recovery terms. Boulder Care is absent from 41% of those auctions, losing on ad rank — not on bid ceiling.",
        reasoning:
          "Quality Score, not budget, is the constraint. Aspen Recovery beats Boulder Care on outranking share by 8 points despite a similar bid floor — the difference is ad relevance and landing page experience.",
        passedForward:
          "Auction overlap matrix flagging the 8 keywords where Boulder Care is outranked + the 4 keywords where Aspen rotates to position 4 (the thin-spot opportunity).",
        toolsUsed: ['google_ads.auction_insights', 'google_ads.report'],
        toolCallCount: 18,
        dataPointsLabel: '120 data points · 8 rivals × 15 keywords',
        dataSource:
          'Pulled via Google Ads API · Auction Insights + Reports · 30-day window (2026-04-16 → 2026-05-16)',
        dataPreview: {
          headers: ['Rival', 'Impr. share', 'Overlap', 'Outrank'],
          rows: [
            ['Aspen Recovery Group',      '28.4%', '64.1%', '41%'],
            ['Mountain View Wellness',    '21.2%', '52.7%', '38%'],
            ['Rocky Mountain Recovery',   '17.8%', '48.3%', '29%'],
            ['Front Range Treatment Co',  '12.1%', '34.6%', '22%'],
          ],
          moreCount: 4,
          moreLabel: 'rivals',
        },
      },
      {
        rank: 3,
        slug: 'copy-analysis',
        iconId: 'copy',
        shortName: 'Copy',
        keyStat: '47 ad variants',
        title: 'Decoding their copy.',
        agent: 'Copy Analyst',
        checked:
          "Scraped Google SERPs for Boulder Care's top 12 keywords daily over 7 days. Captured every rival ad shown — headlines, descriptions, callouts, sitelinks, structured snippets. Deduplicated against ad rotation history.",
        found:
          'All 8 rivals lead with "no fee unless we win" framing. None mention same-day intake or recent settlement amounts — both are unclaimed positioning territory.',
        reasoning:
          "The market is converging on one angle. That makes whitespace easy to find: any opinionated alternative that holds up against Boulder Care's ICP will out-CTR the consensus.",
        passedForward:
          "Ranked unclaimed-angle list with best-rival CTR benchmarks. \"Same-day intake\" surfaced as the strongest match against Boulder Care's operational reality (64% of intake calls outside business hours).",
        toolsUsed: ['serp_api.ads', 'ad_library.fetch'],
        toolCallCount: 32,
        dataPointsLabel: '47 ad variants captured across 8 rivals',
        dataSource:
          'Pulled via Google SERP API (ads) + Google Ads Transparency Center · daily snapshots over 7 days',
        dataPreview: {
          headers: ['Angle', 'Rivals using', 'Avg. CTR'],
          rows: [
            ['"No fee unless we win"',  '8 of 8', '3.2%'],
            ['"Free case evaluation"',  '6 of 8', '2.8%'],
            ['"24/7 availability"',     '4 of 8', '2.1%'],
            ['"Decades of experience"', '5 of 8', '1.9%'],
          ],
          moreCount: 23,
          moreLabel: 'angles',
        },
      },
      {
        rank: 4,
        slug: 'page-detective',
        iconId: 'pages',
        shortName: 'Pages',
        keyStat: '11 landing pages',
        title: 'Walking their funnels.',
        agent: 'Page Detective',
        checked:
          "Visited every landing page rivals were sending paid traffic to. Recorded offer structure, form fields, social proof inventory, page speed, mobile experience, and trust signals (review counts, certifications, settlement badges).",
        found:
          "Aspen Recovery's intake page loads 2.1s on mobile and shows 847 visible reviews above the fold. Boulder Care's intake page loads 3.8s and shows none.",
        reasoning:
          "Speed and social proof are the two highest-leverage levers for converting bottom-funnel traffic. The Strategy Agent flagged this as out of Competitor Spy's scope — a separate Landing Page Designer run should pick it up.",
        passedForward:
          'Landing-page audit log for the 3 highest-spending rivals + handoff note recommending a Landing Page Designer run.',
        toolsUsed: ['web.scrape', 'screenshot.capture', 'lighthouse.audit'],
        toolCallCount: 33,
        dataPointsLabel: '11 landing pages · form fields · social proof inventory',
        dataSource:
          'Pulled via headless browser scrape + Google Lighthouse audit · captured 2026-05-15',
        dataPreview: {
          headers: ['Landing page', 'Form fields', 'Reviews shown', 'Page speed'],
          rows: [
            ['aspenrecovery.com/intake',       '3', '847', '2.1s'],
            ['mountainviewwell.com/free-eval', '4', '312', '3.8s'],
            ['rockymtnrec.com/contact',        '6', '156', '4.2s'],
          ],
          moreCount: 8,
          moreLabel: 'landing pages',
        },
      },
      {
        rank: 5,
        slug: 'spend-tracker',
        iconId: 'spend',
        shortName: 'Spend',
        keyStat: '30/90 day trend',
        title: 'Sizing their spend.',
        agent: 'Spend Tracker',
        checked:
          "Triangulated rival spend from three signals: SimilarWeb's paid traffic estimates, Boulder Care's auction insights weighted by CPC, and category CPC benchmarks. Estimates carry a ±20% confidence band.",
        found:
          "Aspen Recovery is up 14% MoM. Mountain View Wellness is up 18% — the fastest-growing rival in the set.",
        reasoning:
          "Rising rivals are pre-committing budget, not testing. Boulder Care has roughly 90 days before Mountain View becomes a top-3 share threat on its core keywords.",
        passedForward:
          'Rolling 30/90/180-day spend trajectory per rival, flagged for the watchlist sync that the Strategy Agent recommends.',
        toolsUsed: ['similarweb.api', 'google_ads.auction_insights', 'cpc.estimate'],
        toolCallCount: 22,
        dataPointsLabel: 'Spend estimates · 30 / 90 / 180 day windows',
        dataSource:
          'Pulled via SimilarWeb API + Google Ads Auction Insights + category CPC benchmarks · ±20% confidence band',
        dataPreview: {
          headers: ['Rival', '30-day est.', 'Trend', 'Confidence'],
          rows: [
            ['Aspen Recovery Group',      '$12,400', '↑ 14%',  'High'],
            ['Mountain View Wellness',    '$9,100',  '↑ 18%',  'High'],
            ['Rocky Mountain Recovery',   '$7,300',  '→ flat', 'Med'],
            ['Front Range Treatment Co',  '$5,200',  '↓ 6%',   'Med'],
          ],
          moreCount: 4,
          moreLabel: 'rivals',
        },
      },
      {
        rank: 6,
        slug: 'gap-hunter',
        iconId: 'gaps',
        shortName: 'Gaps',
        keyStat: '11 unclaimed angles',
        title: 'Hunting the whitespace.',
        agent: 'Gap Hunter',
        checked:
          "Compared rivals' active ad copy themes against Boulder Care's own copy. Surfaced angles rivals run that Boulder Care doesn't — ranked by average CTR among rivals using them. Filtered against Boulder Care's service area to remove non-applicable angles.",
        found:
          "11 unclaimed or under-claimed angles, but \"same-day intake\" is the standout — adjacent timeline copy runs at 0.4%+ CTR for rivals, and the explicit phrase is empty.",
        reasoning:
          "Whitespace + business-context match is the rare combination. Most unclaimed angles fail one or the other; same-day intake clears both because Boulder Care's intake team already operates outside business hours.",
        passedForward:
          'Top-3 ranked angle list with CTR benchmarks and ICP-fit scores — fed into the Discovery #1 recommendation.',
        toolsUsed: ['compare.matrix', 'ctr.benchmark'],
        toolCallCount: 9,
        dataPointsLabel: '11 unclaimed angles with CTR benchmarks',
        dataSource:
          'Synthesized from Copy Analysis phase (47 rival ad variants) + Boulder Care ICP from project profile · 7-day window',
        dataPreview: {
          headers: ['Unclaimed angle', 'Rivals running', 'Best rival CTR'],
          rows: [
            ['Same-day intake',             '0 of 8', '— (empty)'],
            ['Spanish-speaking clinicians', '2 of 8', '0.62%'],
            ['Veteran-owned program',       '1 of 8', '0.54%'],
            ['Recent recovery outcomes',    '4 of 8', '0.49%'],
          ],
          moreCount: 7,
          moreLabel: 'unclaimed angles',
        },
      },
    ],

    context: {
      used: [
        {
          name: 'Boulder Care ICP',
          source: 'Project profile · last updated 12 days ago',
          appliedWhere: 'Filtered the unclaimed-angle list (Phase 6) and confirmed Aspen as a direct competitor (Phase 1).',
        },
        {
          name: 'Target CPA',
          source: 'Google Ads conversion goals · live',
          appliedWhere: 'Bounded the branded-CPC question (Discovery #4) against profitability thresholds.',
        },
        {
          name: 'Priority Colorado geos',
          source: 'Project profile · last updated 12 days ago',
          appliedWhere: 'Scoped the SERP scan (Phase 1) and weighted spend estimates (Phase 5) to Front Range markets.',
        },
        {
          name: 'Operational hours (intake)',
          source: 'Project profile · operations notes',
          appliedWhere: 'Upgraded the same-day-intake angle (Phase 6) from "interesting" to "Discovery #1".',
        },
      ],
      missing: [
        {
          name: 'Lead-to-sale rate per campaign',
          consequence:
            "Would let the agent decide whether Boulder Care's $42 branded CPC is profitable or wasteful. Currently held as an open question.",
          fixHref: '/projects/boulder-care/context',
        },
        {
          name: 'Weekend intake capacity',
          consequence:
            'Would tighten the watch-for on Discovery #1 (the same-day intake recommendation) from "confirm before launching" to "launch confidently".',
          fixHref: '/projects/boulder-care/context',
        },
      ],
      changedBecauseOfContext: [
        'Same-day intake angle upgraded from "interesting whitespace" to "ready-to-act, low risk" because operational hours confirmed Boulder Care can honour the promise.',
        'Branded CPC question downgraded from "reduce spend" to "open question" because lead-to-sale rate is missing.',
        'Aspen Recovery flagged as a direct rival (not a generalist) after cross-checking against the Boulder Care ICP.',
      ],
    },

    synthesis: {
      agent: 'Strategy Agent',
      intro:
        "After reviewing the 6 specialist outputs and cross-checking each one against Boulder Care's business context, the Strategy Agent produced the AI Summary you read at the top of this report.",
      contextUsedSummary:
        'Boulder Care ICP · target CPA · priority Colorado geos · operational intake hours',
      missingSummary:
        'Lead-to-sale rate per campaign · weekend intake capacity',
      accepted: [
        {
          rank: 1,
          state: 'ready',
          title: 'Build 3 RSAs around "same-day intake".',
          discoveryHref: '#discovery-d-1',
          whyNote:
            "Whitespace cleared the business-context cross-check: operational hours confirm Boulder Care can deliver.",
        },
        {
          rank: 3,
          state: 'ready',
          title: 'Add 3 untracked rivals to your Boulder Care watchlist.',
          discoveryHref: '#discovery-d-3',
          whyNote: 'Pure visibility add — no spend or campaign changes required.',
        },
      ],
      downgraded: [
        {
          rank: 2,
          state: 'review',
          title: 'Outflank Aspen on the 4 keywords where they go thin.',
          discoveryHref: '#discovery-d-2',
          whyNote:
            "Held in review because the bid-strategy lever depends on whether Brand and Generic Search campaigns are on Smart Bidding — the agent can't verify this from auction insights alone.",
        },
        {
          rank: 4,
          state: 'open',
          title: 'Add lead-to-sale rate before judging the $42 branded CPC.',
          discoveryHref: '#discovery-d-4',
          whyNote:
            'Held as an open question because lead-to-sale rate per campaign is missing. Acting without it would be exactly the move that creates "we cut brand spend and conversions tanked" stories.',
        },
      ],
      finalStrategy:
        "Three moves to make this week. Two questions to answer first. Move on same-day intake, the unmonitored-rival watchlist, and the Aspen copy A/B. Hold the branded-CPC question and the bidding-strategy confirmation until you have the data the agent flagged as missing.",
      backToSummaryLabel: 'Back to the AI Summary',
    },
  },
};
