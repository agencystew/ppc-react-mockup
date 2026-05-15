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
      title: 'Collected 912 new ad variations',
      description: 'Signal capture complete',
    },
    {
      time: '3m 28s',
      title: 'Parsed auction data across Google Ads',
      description: 'Auction data parsed successfully',
    },
    {
      time: '2m 12s',
      title: 'Identified 48 active competitors',
      description: 'Competitor set confirmed',
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

// ─── NEGATIVE KEYWORD · COMPLETED ─────────────────────────────────────────
const NEGATIVE_KEYWORD_COMPLETED: AgentRun = {
  runId: 'run-negative-keyword-completed',
  agentSlug: 'negative-keyword',
  projectId: 'boulder-care',
  status: 'completed',
  parentAgent: { icon: '🛡️', name: 'Negative Keyword' },
  stage: { current: 8, total: 8 },
  totalDuration: '18 min',
  headline: 'Found $12K/month in waste.',
  description:
    'Across 14,233 search terms from the last 90 days. 187 negatives drafted, brand-safe, and ready to deploy.',
  stats: [
    { value: '$12K/mo', label: 'Wasted spend you can recover this week' },
    { value: '187',     label: 'Brand-safe negatives ready to deploy' },
    { value: '24%',     label: 'Of total ad spend was leaking' },
  ],
  findings: [
    {
      agent: 'Term Classifier',
      priority: 'high',
      finding:
        "2,847 of your 14,233 search terms over the last 90 days spent money with zero conversions. That's 24% of your total spend with nothing to show for it.",
      impact: '$12K/mo recoverable',
      action: 'Deploy negatives',
    },
    {
      agent: 'Theme Clustering',
      priority: 'high',
      finding:
        'Three themes account for 67% of the waste: "free [service]", "DIY [topic]", and "[competitor] alternative". Each blockable with 3-5 broad-match negatives.',
      impact: 'Cut 67% of waste with 11 negatives',
      action: 'Deploy 11 negatives',
    },
    {
      agent: 'Intent Classification',
      priority: 'medium',
      finding:
        '31% of waste is informational intent ("how to", "what is"). 12% is job-seeker traffic ("law firm careers"). Both are bottomless wells until negated.',
      impact: 'Stop $5.7K/mo bleed',
      action: 'Add intent filters',
    },
    {
      agent: 'Brand Safety Check',
      priority: 'low',
      finding:
        '4 proposed negatives were flagged and removed because they would have killed converting traffic. "free consultation" alone would have blocked 12 conversions worth $4,200 in the last 90 days.',
      impact: '$4,200 in conversions protected',
      action: 'Review removed list',
    },
  ],
  dataSources: [
    {
      agent: 'Term Classifier',
      tools: ['google_ads.search_terms_report'],
      toolCallCount: 6,
      dataPointsLabel: '14,233 search terms · last 90 days · 8 campaigns',
      summary:
        'Pulled the search terms report from your Google Ads account covering the last 90 days across all active search campaigns. Filtered to terms with $5+ in spend and zero conversions, leaving 2,847 candidates for negation.',
      dataPreview: {
        headers: ['Search term', 'Spend', 'Clicks', 'Conv.'],
        rows: [
          ['how to file insurance claim','$342', '47', '0'],
          ['diy will template free',    '$287', '38', '0'],
          ['law school requirements',   '$231', '29', '0'],
          ['free legal advice forum',   '$198', '24', '0'],
        ],
        moreCount: 2843,
        moreLabel: 'zero-conversion terms',
      },
    },
    {
      agent: 'Theme Tagger',
      tools: ['embeddings.create', 'cluster.hdbscan'],
      toolCallCount: 4,
      dataPointsLabel: '2,847 wasteful terms · 14 themes · semantic clustering',
      summary:
        'Generated embeddings for each zero-conversion term and clustered them by semantic similarity. Filtered out clusters below 12 terms (too sparse to negate confidently). Each cluster gets a theme label.',
      dataPreview: {
        headers: ['Theme', 'Example terms', '% of waste'],
        rows: [
          ['"free [service]"',          '187 terms', '32%'],
          ['"DIY [topic]"',             '141 terms', '22%'],
          ['"[competitor] alternative"','94 terms',  '13%'],
          ['"[location] courthouse"',   '67 terms',  '8%'],
        ],
        moreCount: 10,
        moreLabel: 'themes',
      },
    },
    {
      agent: 'Brand Protector',
      tools: ['google_ads.search_terms_report (12mo)', 'negative.simulate'],
      toolCallCount: 7,
      dataPointsLabel: '187 negatives checked against 12 months of converting terms',
      summary:
        'For each proposed negative, simulated which converting search terms from the last 12 months would have been blocked. Flagged any negative that would have killed 2 or more converting queries and removed them from the deploy list.',
      dataPreview: {
        headers: ['Removed negative', 'Would have blocked', 'Conversions at risk'],
        rows: [
          ['free consultation', '4 converting queries',  '12 conv. ($4,200)'],
          ['advice',            '6 converting queries',  '8 conv. ($2,900)'],
          ['help',              '11 converting queries', '6 conv. ($2,100)'],
          ['talk to lawyer',    '3 converting queries',  '4 conv. ($1,400)'],
        ],
        moreCount: 0,
        moreLabel: 'rows',
      },
    },
  ],
  actions: [
    { label: 'Apply 187 negatives', primary: true },
    { label: 'Export as CSV' },
    { label: 'Generate client report' },
    { label: 'Schedule weekly run' },
  ],
};

export const RUNS: Record<string, AgentRun> = {
  [COMPETITOR_SPY_RUNNING.runId]:   COMPETITOR_SPY_RUNNING,
  [COMPETITOR_SPY_COMPLETED.runId]: COMPETITOR_SPY_COMPLETED,
  [NEGATIVE_KEYWORD_COMPLETED.runId]: NEGATIVE_KEYWORD_COMPLETED,
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
    runId: NEGATIVE_KEYWORD_COMPLETED.runId,
    agentName: 'Negative Keyword',
    projectName: 'Smith Law Group',
    headline: 'Found $12K/month in waste',
    finishedAt: 'Yesterday',
    duration: '18 min',
    upside: '$12K/mo',
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
