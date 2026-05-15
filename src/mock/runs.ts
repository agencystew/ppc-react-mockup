// Showcase-grade mock run data.
//
// Two anchor agents fully fleshed out:
//   - competitor-spy      (Stewart's existing JSX showcase content)
//   - negative-keyword    (the other JSX showcase content)
//
// Both run states (running + completed) live here, keyed by `runId`.
// Other agents fall back to a generic stub run when needed.

import type { AgentRun } from '../types/agent';

// ─── COMPETITOR SPY · RUNNING ─────────────────────────────────────────────
const COMPETITOR_SPY_RUNNING: AgentRun = {
  runId: 'run-competitor-spy-running',
  agentSlug: 'competitor-spy',
  projectId: 'boulder-care',
  status: 'running',
  parentAgent: { icon: '🕵️', name: 'Competitor Spy' },
  stage: { current: 5, total: 11 },
  headline: 'Sizing their spend.',
  description:
    "A live read on every competitor in your auction: their angles, their spend trajectory, " +
    "their funnels, and the gaps they're exploiting.",
  activeAgent: {
    initial: 'S',
    role: 'Sizing their spend',
    task: 'Analyzing spend signals across 8 rival accounts',
    elapsed: '3m 47s',
    progressPct: 60,
  },
  recentMissionSteps: [
    {
      time: '3m 46s',
      title: '912 new ad variations collected',
      description: 'Across 8 rival accounts in the last 7 days',
    },
    {
      time: '3m 28s',
      title: '15 auction snapshots parsed',
      description: '120 data points · 100% match against your top keywords',
    },
    {
      time: '2m 12s',
      title: '48 active competitors identified',
      description: 'All ranked top-4 on at least one of your core terms',
    },
    {
      time: '1m 48s',
      title: '387 landing pages captured',
      description: 'Mobile + desktop snapshots ready to diff against yours',
    },
    // ── below the fold (revealed via "+ N more tasks complete") ──────────
    {
      time: '1m 12s',
      title: '2,400 ads cross-referenced in ad library',
      description: 'Confirmed rivals are running everything we surfaced live',
    },
    {
      time: '0m 54s',
      title: '8 rival domains spend-modelled',
      description: 'SimilarWeb + auction insights triangulated · ±20% band',
    },
    {
      time: '0m 28s',
      title: '90 days of CPC history ingested',
      description: 'Anchored every estimate to your real CPC ceiling',
    },
    {
      time: '0m 00s',
      title: 'Mission started',
      description: 'Initializing Competitor Spy',
    },
  ],
  progressPct: 60,
  completedStages: [
    { title: 'Mapping the field',     agent: 'Competitor Discovery',  time: '2m 12s' },
    { title: 'Reading the auction',   agent: 'Auction Intelligence',  time: '3m 28s' },
    { title: 'Decoding their copy',   agent: 'Copy Analyst',          time: '5m 04s' },
    { title: 'Walking their funnels', agent: 'Page Detective',        time: '4m 51s' },
  ],
  upcomingStages: [
    { title: 'Pressure-test the overlap', agent: 'Overlap Scanner' },
    { title: 'Spotting the threats',      agent: 'Auction Intelligence' },
    { title: 'Budget pacer',              agent: 'Budget Forecaster' },
  ],
  moreUpcomingCount: 3,
  liveSignalsLabel: "We're analyzing live signals across 8 rival accounts.",
};

// ─── SPEND LEAK · RUNNING (single-step demo) ─────────────────────────────
//
// Counterpart to the multi-step Competitor Spy view. Most agents in
// PPC.io are a single self-contained operation rather than a stage tree,
// so this view drops the stage-level Completed / Up next sections and
// leaves the user with just the live mission card + the lavender signals
// callout at the bottom.
const SPEND_LEAK_RUNNING: AgentRun = {
  runId: 'run-spend-leak-running',
  agentSlug: 'spend-leak',
  projectId: 'boulder-care',
  status: 'running',
  parentAgent: { icon: '🔍', name: 'Spend Leak Detector' },
  stage: { current: 1, total: 1 },
  headline: 'Hunting wasted spend.',
  description:
    'Scanning 90 days of search terms across 8 campaigns to flag zero-conversion spend.',
  activeAgent: {
    initial: 'L',
    role: 'Spend Leak Detector',
    task: 'Scanning 90 days of search terms across 8 campaigns for zero-conversion spend',
    elapsed: '2m 12s',
    progressPct: 45,
  },
  recentMissionSteps: [
    {
      time: '2m 10s',
      title: '14,233 search terms pulled',
      description: 'Last 90 days · 8 active search campaigns',
    },
    {
      time: '1m 24s',
      title: '12 months of conversion history loaded',
      description: 'Every converting query in the last year cross-referenced',
    },
    {
      time: '0m 38s',
      title: '2,847 candidate terms isolated',
      description: 'Zero-conversion + $5+ spend floor applied',
    },
    {
      time: '0m 00s',
      title: 'Mission started',
      description: 'Initializing Spend Leak Detector',
    },
  ],
  // NB: no completedStages / upcomingStages — single-step view.
  liveSignalsLabel: 'Surfacing zero-conversion terms in real time.',
};

// ─── COMPETITOR SPY · COMPLETED ───────────────────────────────────────────
const COMPETITOR_SPY_COMPLETED: AgentRun = {
  runId: 'run-competitor-spy-completed',
  agentSlug: 'competitor-spy',
  projectId: 'boulder-care',
  status: 'completed',
  parentAgent: { icon: '🕵️', name: 'Competitor Spy' },
  stage: { current: 11, total: 11 },
  totalDuration: '47 min',
  headline: '11 gaps your rivals are exploiting.',
  description:
    "Eight rivals analyzed across copy, funnels, spend, and auction overlap. Here's where they're winning and what you can take back.",
  stats: [
    { value: '3',         label: 'Quick wins ready to deploy' },
    { value: '$8.2K/mo',  label: 'Estimated upside if all 11 are applied' },
    { value: '+18%',      label: "Top rival's spend growth (30 days)" },
  ],
  findings: [
    {
      agent: 'Competitor Discovery',
      priority: 'high',
      finding:
        "Three of the eight active rivals weren't on your radar. Smith & Associates and Cleveland Injury Group are the most consistent bidders on your top terms, both growing month-over-month.",
      impact: 'Track 3 unmonitored rivals',
      action: 'Add to watchlist',
    },
    {
      agent: 'Auction Intelligence',
      priority: 'high',
      finding:
        "Top three rivals control 64% of impression share on your core terms. You're absent from 41% of those auctions, losing on ad rank rather than bid. Quality score, not budget, is the bottleneck.",
      impact: '14% impression share at stake',
      action: 'Fix ad rank',
    },
    {
      agent: 'Gap Analysis',
      priority: 'high',
      finding:
        'No rival is running "same-day case review" angles. Three rivals run adjacent timeline-based copy at 0.4%+ CTR. This is the strongest unclaimed positioning territory in your market.',
      impact: 'Est. +15% CTR on top 3 keywords',
      action: 'Build this campaign',
    },
    {
      agent: 'Copy Analyst',
      priority: 'medium',
      finding:
        'All eight rivals lead with "no fee unless we win." None mention recent settlement amounts or case timelines. Both are unclaimed positioning territory worth testing in your top campaign.',
      impact: 'Two untested angles',
      action: 'Draft ad variants',
    },
  ],
  dataSources: [
    {
      agent: 'Competitor Discovery',
      tools: ['serp_api.search', 'web.scrape', 'domain.lookup'],
      toolCallCount: 47,
      dataPointsLabel: '8 rivals · 12 keywords · 7-day window',
      summary:
        'We searched Google for your top 12 keywords across personal injury terms and recorded every advertiser appearing in the top 4 positions over a 7-day window. Cross-referenced each domain against public ad libraries to confirm active campaigns and rule out one-off appearances.',
      dataPreview: {
        headers: ['Rival', 'Domain', 'Est. spend', 'Active since'],
        rows: [
          ['Smith & Associates',     'smithlaw.com',     '$12K/mo', '2019'],
          ['Cleveland Injury Group', 'clevelandig.com',  '$9K/mo',  '2017'],
          ['Ohio Personal Injury',   'ohiopi.com',       '$7K/mo',  '2021'],
          ['Hartman Legal',          'hartmanlaw.com',   '$5K/mo',  '2020'],
        ],
        moreCount: 4,
        moreLabel: 'rivals',
      },
    },
    {
      agent: 'Auction Intelligence',
      tools: ['google_ads.auction_insights', 'google_ads.report'],
      toolCallCount: 18,
      dataPointsLabel: '120 data points · 8 rivals × 15 keywords',
      summary:
        'Pulled auction insights from your Google Ads account for your top 15 highest-spend keywords. For each, we recorded which rivals appeared, their impression share, overlap rate, position above rate, and outranking share over the last 30 days.',
      dataPreview: {
        headers: ['Rival', 'Impr. share', 'Overlap', 'Outrank'],
        rows: [
          ['Smith & Associates',     '28.4%', '64.1%', '41%'],
          ['Cleveland Injury Group', '21.2%', '52.7%', '38%'],
          ['Ohio Personal Injury',   '17.8%', '48.3%', '29%'],
          ['Hartman Legal',          '12.1%', '34.6%', '22%'],
        ],
        moreCount: 4,
        moreLabel: 'rivals',
      },
    },
    {
      agent: 'Copy Analyst',
      tools: ['serp_api.ads', 'ad_library.fetch'],
      toolCallCount: 32,
      dataPointsLabel: '47 ad variants captured across 8 rivals',
      summary:
        'Scraped Google SERPs for your top 12 keywords daily over the last 7 days, capturing every rival ad shown. Recorded headlines, descriptions, callouts, sitelinks, and structured snippets. Deduplicated against ad rotation history to identify variant strategies.',
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
      agent: 'Page Detective',
      tools: ['web.scrape', 'screenshot.capture', 'lighthouse.audit'],
      toolCallCount: 33,
      dataPointsLabel: '11 landing pages · form fields · social proof inventory',
      summary:
        'Visited every landing page rivals were sending paid traffic to. For each, we recorded the offer structure, form fields, social proof elements, page speed, mobile experience, and trust signals (review counts, certifications, settlement badges).',
      dataPreview: {
        headers: ['Landing page', 'Form fields', 'Reviews shown', 'Page speed'],
        rows: [
          ['smithlaw.com/injury',     '3', '847', '2.1s'],
          ['clevelandig.com/free-eval','4','312', '3.8s'],
          ['ohiopi.com/contact',      '6', '156', '4.2s'],
        ],
        moreCount: 8,
        moreLabel: 'landing pages',
      },
    },
    {
      agent: 'Spend Tracker',
      tools: ['similarweb.api', 'google_ads.auction_insights', 'cpc.estimate'],
      toolCallCount: 22,
      dataPointsLabel: 'spend estimates · 30 / 90 / 180 day windows',
      summary:
        "Combined three signals to model rival spend: SimilarWeb's paid traffic estimates, your auction insights weighted by your CPCs, and category CPC benchmarks. Estimates have a ±20% confidence band; we flag rivals where signals disagree by more than that.",
      dataPreview: {
        headers: ['Rival', '30-day est.', 'Trend', 'Confidence'],
        rows: [
          ['Smith & Associates',     '$12,400', '↑ 14%',  'High'],
          ['Cleveland Injury Group', '$9,100',  '↑ 18%',  'High'],
          ['Ohio Personal Injury',   '$7,300',  '→ flat', 'Med'],
          ['Hartman Legal',          '$5,200',  '↓ 6%',   'Med'],
        ],
        moreCount: 4,
        moreLabel: 'rivals',
      },
    },
    {
      agent: 'Gap Hunter',
      tools: ['compare.matrix', 'ctr.benchmark'],
      toolCallCount: 9,
      dataPointsLabel: '11 unclaimed angles with CTR benchmarks',
      summary:
        "Compared rivals' ad copy themes against your account's active ad copy. Surfaced angles rivals are running that you aren't, ranked by average CTR among rivals using them. Filtered out angles that don't apply to your service area.",
      dataPreview: {
        headers: ['Unclaimed angle', 'Rivals running', 'Best rival CTR'],
        rows: [
          ['Same-day case review',       '3 of 8', '0.81%'],
          ['Spanish-speaking attorneys', '2 of 8', '0.62%'],
          ['Veteran-owned firm',         '1 of 8', '0.54%'],
          ['Recent settlement amounts',  '4 of 8', '0.49%'],
        ],
        moreCount: 7,
        moreLabel: 'gap angles',
      },
    },
  ],
  actions: [
    { label: 'Apply recommendations', primary: true },
    { label: 'Export findings' },
    { label: 'Generate client report' },
    { label: 'Schedule rerun' },
  ],
};

export const RUNS: Record<string, AgentRun> = {
  [COMPETITOR_SPY_RUNNING.runId]:   COMPETITOR_SPY_RUNNING,
  [COMPETITOR_SPY_COMPLETED.runId]: COMPETITOR_SPY_COMPLETED,
  [SPEND_LEAK_RUNNING.runId]:       SPEND_LEAK_RUNNING,
};

// Recent runs across all projects, for the Dashboard rollup.
export const RECENT_RUNS_SUMMARY = [
  {
    runId: COMPETITOR_SPY_COMPLETED.runId,
    agentName: 'Competitor Spy',
    projectName: 'Smith Law Group',
    headline: '11 gaps your rivals are exploiting',
    finishedAt: '2 hours ago',
    duration: '47 min',
    upside: '$8.2K/mo',
  },
  {
    runId: 'run-spend-leak-rocket',
    agentName: 'Spend Leak Detector',
    projectName: 'Rocket Pet Insurance',
    headline: '6 dead campaigns burning $3.4K/mo',
    finishedAt: 'Yesterday',
    duration: '14 min',
    upside: '$3.4K/mo',
  },
];
