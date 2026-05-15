// Canonical fixture for the report evidence redesign (2026-05-15).
//
// All three parallel design variants (V1 Magazine, V2 Bloomberg, V3 Audit-first)
// import this file and render the same data through different compositions.
// The brief at docs/plans/2026-05-15-report-evidence-parallel-design.md is the
// controlling contract; this file is the controlled fixture. Do not mutate.

// ─── Types ────────────────────────────────────────────────────────────────

export type ToolName =
  | 'google_ads.query'
  | 'google_ads.explore_schema'
  | 'serp_api.search'
  | 'web.scrape'
  | 'domain.lookup';

export interface ToolInvocation {
  id: string;
  specialistId: string;
  toolName: ToolName;
  displayName: string;
  args: {
    gaql?: string;
    resource?: string;
    url?: string;
    query?: string;
  };
  result: {
    columns?: string[];
    rows?: string[][];
    totalRows?: number;
    sample?: unknown;
    schemaMarkdown?: string;
  };
  narrative: string;
  isEvidence: boolean;
  startedAt: string;
  finishedAt: string;
  latencyMs: number;
}

export interface Finding {
  id: string;
  title: string;
  body: string;
  metric?: { value: string; label: string };
  impact: 'high' | 'medium' | 'low';
  primaryEvidenceRef: string;
  supportingEvidenceRefs: string[];
  evidenceSummary?: {
    columns: string[];
    rows: string[][];
    note: string;
  } | null;
  judgment: string;
}

export interface Section {
  id: string;
  icon: 'target' | 'binoculars' | 'chart' | 'flag';
  name: string;
  meta: {
    toolCallsCount: number;
    headlineMetric: { value: string; label: string };
    window: string;
  };
  findings: Finding[];
  invocations: ToolInvocation[];
}

export interface Report {
  runId: string;
  agentName: string;
  accountName: string;
  completedAt: string;
  durationMs: number;
  sections: Section[];
}

// ─── Helper: GAQL formatter (multi-line strings without indentation noise) ─

const gaql = (s: TemplateStringsArray) => s.join('').trim();

// ─── Section 1: Competitor Discovery ──────────────────────────────────────

const discoveryInvocations: ToolInvocation[] = [
  {
    id: 'ti_d01',
    specialistId: 'competitor-discovery',
    toolName: 'google_ads.explore_schema',
    displayName: 'schema: auction_insights',
    args: { resource: 'auction_insights' },
    result: {
      schemaMarkdown:
        'Resource: auction_insights\nKey fields: customer.id, auction_insight_domain, metrics.search_impression_share, metrics.search_top_impression_share, metrics.search_outranking_share, metrics.search_rank_lost_impression_share, metrics.search_overlap_rate, metrics.search_position_above_rate. Segmentable by date, ad_group, keyword.',
    },
    narrative: 'Looked up the auction_insights resource schema to confirm which competitive metrics are available.',
    isEvidence: false,
    startedAt: '2026-05-15T09:12:01Z',
    finishedAt: '2026-05-15T09:12:02Z',
    latencyMs: 840,
  },
  {
    id: 'ti_d02',
    specialistId: 'competitor-discovery',
    toolName: 'google_ads.explore_schema',
    displayName: 'schema: keyword_view',
    args: { resource: 'keyword_view' },
    result: {
      schemaMarkdown:
        'Resource: keyword_view\nKey fields: ad_group_criterion.keyword.text, ad_group_criterion.keyword.match_type, metrics.cost_micros, metrics.impressions, metrics.clicks, metrics.conversions. Segmentable by date, device, network.',
    },
    narrative: 'Looked up keyword_view fields to identify the 12 highest-spend terms for SERP investigation.',
    isEvidence: false,
    startedAt: '2026-05-15T09:12:03Z',
    finishedAt: '2026-05-15T09:12:04Z',
    latencyMs: 690,
  },
  {
    id: 'ti_d03',
    specialistId: 'competitor-discovery',
    toolName: 'google_ads.query',
    displayName: 'google_ads.keyword_view',
    args: {
      gaql: gaql`
        SELECT
          ad_group_criterion.keyword.text,
          ad_group_criterion.keyword.match_type,
          metrics.cost_micros,
          metrics.impressions,
          metrics.clicks
        FROM keyword_view
        WHERE segments.date BETWEEN '2026-05-08' AND '2026-05-14'
          AND campaign.advertising_channel_type = 'SEARCH'
          AND metrics.cost_micros > 50000000
        ORDER BY metrics.cost_micros DESC
        LIMIT 12
      `,
    },
    result: {
      columns: ['Keyword', 'Match', 'Spend', 'Impressions', 'Clicks'],
      rows: [
        ['personal injury lawyer cleveland', 'EXACT', '$2,840', '4,120', '187'],
        ['car accident attorney', 'PHRASE', '$2,310', '3,840', '162'],
        ['slip and fall lawyer ohio', 'EXACT', '$1,980', '2,650', '141'],
        ['workers comp attorney cleveland', 'PHRASE', '$1,740', '2,210', '118'],
        ['injury lawyer near me', 'BROAD', '$1,510', '5,290', '94'],
      ],
      totalRows: 12,
    },
    narrative: 'Pulled the 12 highest-spend keywords over the 7-day window to drive SERP investigation.',
    isEvidence: true,
    startedAt: '2026-05-15T09:12:05Z',
    finishedAt: '2026-05-15T09:12:09Z',
    latencyMs: 3920,
  },
  {
    id: 'ti_d04',
    specialistId: 'competitor-discovery',
    toolName: 'serp_api.search',
    displayName: 'serp_api.search',
    args: { query: 'personal injury lawyer cleveland' },
    result: {
      columns: ['Position', 'Advertiser', 'Domain', 'Ad headline'],
      rows: [
        ['1', 'Smith & Associates', 'smithlaw.com', 'Cleveland Injury Attorney · No Win, No Fee'],
        ['2', 'Cleveland Injury Group', 'clevelandig.com', 'Hurt? We Fight Insurance Companies'],
        ['3', 'Ohio Personal Injury', 'ohiopi.com', 'Free Case Review · 24/7 Hotline'],
        ['4', 'Hartman Legal', 'hartmanlaw.com', 'Cleveland Injury Lawyers Since 1998'],
      ],
      totalRows: 4,
    },
    narrative: 'Scraped Google SERP for the top keyword. Captured paid ad positions 1 through 4.',
    isEvidence: true,
    startedAt: '2026-05-15T09:12:10Z',
    finishedAt: '2026-05-15T09:12:13Z',
    latencyMs: 2740,
  },
  {
    id: 'ti_d05',
    specialistId: 'competitor-discovery',
    toolName: 'serp_api.search',
    displayName: 'serp_api.search',
    args: { query: 'car accident attorney cleveland' },
    result: {
      columns: ['Position', 'Advertiser', 'Domain', 'Ad headline'],
      rows: [
        ['1', 'Smith & Associates', 'smithlaw.com', 'Car Accident? Call Now for Free Review'],
        ['2', 'Lakeside Injury Lawyers', 'lakesideinjury.com', 'Maximum Compensation · Cleveland Area'],
        ['3', 'Cleveland Injury Group', 'clevelandig.com', 'Aggressive Cleveland Car Accident Lawyers'],
      ],
      totalRows: 3,
    },
    narrative: 'Scraped Google SERP for car accident attorney. Three paid advertisers, two seen before.',
    isEvidence: true,
    startedAt: '2026-05-15T09:12:14Z',
    finishedAt: '2026-05-15T09:12:17Z',
    latencyMs: 2810,
  },
  {
    id: 'ti_d06',
    specialistId: 'competitor-discovery',
    toolName: 'serp_api.search',
    displayName: 'serp_api.search',
    args: { query: 'slip and fall lawyer ohio' },
    result: {
      columns: ['Position', 'Advertiser', 'Domain', 'Ad headline'],
      rows: [
        ['1', 'Ohio Personal Injury', 'ohiopi.com', 'Slipped or Fell? Get Compensation'],
        ['2', 'Hartman Legal', 'hartmanlaw.com', 'Slip and Fall Specialists Cleveland'],
        ['3', 'Brennan Injury Firm', 'brennaninjury.com', 'Free Consultation · No Recovery, No Fee'],
      ],
      totalRows: 3,
    },
    narrative: 'Scraped SERP for slip and fall ohio. Surfaced a new advertiser (Brennan Injury Firm).',
    isEvidence: true,
    startedAt: '2026-05-15T09:12:18Z',
    finishedAt: '2026-05-15T09:12:21Z',
    latencyMs: 2910,
  },
  {
    id: 'ti_d07',
    specialistId: 'competitor-discovery',
    toolName: 'serp_api.search',
    displayName: 'serp_api.search',
    args: { query: 'workers comp attorney cleveland' },
    result: {
      columns: ['Position', 'Advertiser', 'Domain', 'Ad headline'],
      rows: [
        ['1', 'Cleveland Injury Group', 'clevelandig.com', 'Denied Workers Comp? We Win Appeals'],
        ['2', 'Northcoast Comp Lawyers', 'northcoastcomp.com', 'Cleveland Workers Compensation Help'],
        ['3', 'Hartman Legal', 'hartmanlaw.com', 'Cleveland Workers Compensation Attorneys'],
      ],
      totalRows: 3,
    },
    narrative: 'Scraped SERP for workers comp cleveland. Northcoast Comp Lawyers added to the rival roster.',
    isEvidence: true,
    startedAt: '2026-05-15T09:12:22Z',
    finishedAt: '2026-05-15T09:12:24Z',
    latencyMs: 2410,
  },
  {
    id: 'ti_d08',
    specialistId: 'competitor-discovery',
    toolName: 'domain.lookup',
    displayName: 'domain.lookup',
    args: { url: 'smithlaw.com' },
    result: {
      sample: {
        domain: 'smithlaw.com',
        firstSeen: '2019-04-12',
        estimatedMonthlyAdSpend: '$12,400',
        adActiveDays365: 312,
      },
    },
    narrative: 'Domain lookup for Smith & Associates. Active since 2019, estimated $12K monthly ad spend.',
    isEvidence: true,
    startedAt: '2026-05-15T09:12:25Z',
    finishedAt: '2026-05-15T09:12:26Z',
    latencyMs: 1180,
  },
  {
    id: 'ti_d09',
    specialistId: 'competitor-discovery',
    toolName: 'domain.lookup',
    displayName: 'domain.lookup',
    args: { url: 'clevelandig.com' },
    result: {
      sample: {
        domain: 'clevelandig.com',
        firstSeen: '2017-08-22',
        estimatedMonthlyAdSpend: '$9,100',
        adActiveDays365: 298,
      },
    },
    narrative: 'Domain lookup for Cleveland Injury Group. Long-running campaign since 2017.',
    isEvidence: true,
    startedAt: '2026-05-15T09:12:27Z',
    finishedAt: '2026-05-15T09:12:28Z',
    latencyMs: 1090,
  },
  {
    id: 'ti_d10',
    specialistId: 'competitor-discovery',
    toolName: 'domain.lookup',
    displayName: 'domain.lookup',
    args: { url: 'brennaninjury.com' },
    result: {
      sample: {
        domain: 'brennaninjury.com',
        firstSeen: '2024-11-04',
        estimatedMonthlyAdSpend: '$2,300',
        adActiveDays365: 124,
      },
    },
    narrative: 'Domain lookup for Brennan Injury Firm. New entrant, started late 2024, modest spend.',
    isEvidence: true,
    startedAt: '2026-05-15T09:12:29Z',
    finishedAt: '2026-05-15T09:12:30Z',
    latencyMs: 1140,
  },
  {
    id: 'ti_d11',
    specialistId: 'competitor-discovery',
    toolName: 'google_ads.query',
    displayName: 'google_ads.auction_insights',
    args: {
      gaql: gaql`
        SELECT
          auction_insight_domain,
          metrics.search_impression_share,
          metrics.search_position_above_rate,
          metrics.search_overlap_rate
        FROM auction_insights
        WHERE segments.date BETWEEN '2026-05-08' AND '2026-05-14'
          AND campaign.advertising_channel_type = 'SEARCH'
        ORDER BY metrics.search_impression_share DESC
      `,
    },
    result: {
      columns: ['Rival domain', 'IS%', 'Position above rate', 'Overlap rate'],
      rows: [
        ['smithlaw.com', '24.1%', '61%', '52%'],
        ['clevelandig.com', '18.7%', '54%', '47%'],
        ['ohiopi.com', '13.4%', '49%', '38%'],
        ['hartmanlaw.com', '11.0%', '44%', '34%'],
        ['lakesideinjury.com', '7.2%', '38%', '29%'],
        ['northcoastcomp.com', '5.4%', '31%', '24%'],
        ['brennaninjury.com', '3.8%', '22%', '18%'],
        ['shapirolaw.com', '2.9%', '19%', '14%'],
      ],
      totalRows: 8,
    },
    narrative: 'Pulled auction insights for the full 7-day window. Eight distinct rivals appearing in head-to-head auctions.',
    isEvidence: true,
    startedAt: '2026-05-15T09:12:31Z',
    finishedAt: '2026-05-15T09:12:36Z',
    latencyMs: 4720,
  },
  {
    id: 'ti_d12',
    specialistId: 'competitor-discovery',
    toolName: 'web.scrape',
    displayName: 'web.scrape',
    args: { url: 'https://smithlaw.com' },
    result: {
      sample: {
        title: 'Cleveland Personal Injury Attorneys · Smith & Associates',
        h1: 'Cleveland Injury Lawyers · No Win, No Fee',
        primaryCta: 'Get My Free Case Review',
        socialProof: 'Recovered $250M for Cleveland clients since 1998',
      },
    },
    narrative: 'Scraped smithlaw.com homepage. Lead with no-win-no-fee, $250M recovery total as social proof.',
    isEvidence: true,
    startedAt: '2026-05-15T09:12:37Z',
    finishedAt: '2026-05-15T09:12:39Z',
    latencyMs: 2120,
  },
];

// ─── Section 2: Auction Intelligence ──────────────────────────────────────

const auctionInvocations: ToolInvocation[] = [
  {
    id: 'ti_a01',
    specialistId: 'auction-intelligence',
    toolName: 'google_ads.explore_schema',
    displayName: 'schema: bid_simulator',
    args: { resource: 'bid_simulator' },
    result: {
      schemaMarkdown:
        'Resource: bid_simulator\nKey fields: bid_simulator.start_date, bid_simulator.cpc_bid_point_list, bid_simulator.target_cpa_point_list. Provides projected impressions, clicks, conversions, cost at simulated bid points.',
    },
    narrative: 'Looked up bid_simulator to evaluate whether rank gaps are bid-driven or budget-driven.',
    isEvidence: false,
    startedAt: '2026-05-15T09:13:02Z',
    finishedAt: '2026-05-15T09:13:03Z',
    latencyMs: 720,
  },
  {
    id: 'ti_a02',
    specialistId: 'auction-intelligence',
    toolName: 'google_ads.query',
    displayName: 'google_ads.auction_insights',
    args: {
      gaql: gaql`
        SELECT
          auction_insight_domain,
          ad_group_criterion.keyword.text,
          metrics.search_impression_share,
          metrics.search_top_impression_share,
          metrics.search_outranking_share
        FROM auction_insights
        WHERE segments.date BETWEEN '2026-05-08' AND '2026-05-14'
          AND ad_group_criterion.keyword.text IN (
            'personal injury lawyer cleveland',
            'car accident attorney',
            'slip and fall lawyer ohio'
          )
        ORDER BY metrics.search_impression_share DESC
      `,
    },
    result: {
      columns: ['Rival', 'Keyword', 'IS%', 'Top IS%', 'Outranking%'],
      rows: [
        ['smithlaw.com', 'personal injury lawyer cleveland', '31.4%', '24.1%', '68%'],
        ['clevelandig.com', 'personal injury lawyer cleveland', '22.1%', '17.8%', '54%'],
        ['smithlaw.com', 'car accident attorney', '28.7%', '21.2%', '62%'],
        ['lakesideinjury.com', 'car accident attorney', '19.3%', '14.9%', '47%'],
        ['ohiopi.com', 'slip and fall lawyer ohio', '34.2%', '27.1%', '71%'],
      ],
      totalRows: 24,
    },
    narrative: 'Pulled auction insights segmented by keyword. Reveals which rivals dominate which terms.',
    isEvidence: true,
    startedAt: '2026-05-15T09:13:04Z',
    finishedAt: '2026-05-15T09:13:10Z',
    latencyMs: 5840,
  },
  {
    id: 'ti_a03',
    specialistId: 'auction-intelligence',
    toolName: 'google_ads.query',
    displayName: 'google_ads.keyword_view',
    args: {
      gaql: gaql`
        SELECT
          ad_group_criterion.keyword.text,
          metrics.search_impression_share,
          metrics.search_rank_lost_impression_share,
          metrics.search_budget_lost_impression_share
        FROM keyword_view
        WHERE segments.date BETWEEN '2026-05-08' AND '2026-05-14'
          AND campaign.advertising_channel_type = 'SEARCH'
        ORDER BY metrics.search_rank_lost_impression_share DESC
        LIMIT 12
      `,
    },
    result: {
      columns: ['Keyword', 'IS%', 'Lost (rank)%', 'Lost (budget)%'],
      rows: [
        ['personal injury lawyer cleveland', '18.2%', '74.1%', '7.7%'],
        ['car accident attorney', '21.4%', '68.9%', '9.7%'],
        ['slip and fall lawyer ohio', '12.8%', '79.4%', '7.8%'],
        ['workers comp attorney cleveland', '24.7%', '64.2%', '11.1%'],
        ['injury lawyer near me', '14.3%', '71.8%', '13.9%'],
      ],
      totalRows: 12,
    },
    narrative: 'Pulled lost impression share by reason. Rank loss dwarfs budget loss across all 12 keywords.',
    isEvidence: true,
    startedAt: '2026-05-15T09:13:11Z',
    finishedAt: '2026-05-15T09:13:16Z',
    latencyMs: 4920,
  },
  {
    id: 'ti_a04',
    specialistId: 'auction-intelligence',
    toolName: 'google_ads.query',
    displayName: 'google_ads.auction_insights',
    args: {
      gaql: gaql`
        SELECT
          auction_insight_domain,
          SUM(metrics.search_impression_share) AS total_is
        FROM auction_insights
        WHERE segments.date BETWEEN '2026-05-08' AND '2026-05-14'
        GROUP BY auction_insight_domain
        ORDER BY total_is DESC
        LIMIT 4
      `,
    },
    result: {
      columns: ['Rival', 'Combined IS%'],
      rows: [
        ['smithlaw.com', '24.1%'],
        ['clevelandig.com', '18.7%'],
        ['ohiopi.com', '13.4%'],
        ['hartmanlaw.com', '11.0%'],
      ],
      totalRows: 4,
    },
    narrative: 'Aggregated impression share across the top 4 rivals. They control 67.2% combined.',
    isEvidence: true,
    startedAt: '2026-05-15T09:13:17Z',
    finishedAt: '2026-05-15T09:13:20Z',
    latencyMs: 3120,
  },
  {
    id: 'ti_a05',
    specialistId: 'auction-intelligence',
    toolName: 'google_ads.query',
    displayName: 'google_ads.keyword_view',
    args: {
      gaql: gaql`
        SELECT
          ad_group_criterion.keyword.text,
          metrics.average_cpc,
          metrics.top_impression_percentage,
          metrics.absolute_top_impression_percentage
        FROM keyword_view
        WHERE segments.date BETWEEN '2026-05-08' AND '2026-05-14'
          AND metrics.cost_micros > 50000000
        ORDER BY metrics.average_cpc DESC
        LIMIT 12
      `,
    },
    result: {
      columns: ['Keyword', 'Avg CPC', 'Top imp%', 'Abs top imp%'],
      rows: [
        ['personal injury lawyer cleveland', '$15.20', '41%', '12%'],
        ['car accident attorney', '$14.30', '47%', '17%'],
        ['workers comp attorney cleveland', '$14.70', '52%', '21%'],
        ['slip and fall lawyer ohio', '$14.10', '38%', '9%'],
      ],
      totalRows: 12,
    },
    narrative: 'Pulled CPC and position metrics. Absolute top placement is rare; you sit mid-page on most queries.',
    isEvidence: true,
    startedAt: '2026-05-15T09:13:21Z',
    finishedAt: '2026-05-15T09:13:26Z',
    latencyMs: 4640,
  },
];

// ─── Section 3: Position & Spend Analysis ─────────────────────────────────

const positionInvocations: ToolInvocation[] = [
  {
    id: 'ti_p01',
    specialistId: 'position-spend',
    toolName: 'google_ads.explore_schema',
    displayName: 'schema: search_term_view',
    args: { resource: 'search_term_view' },
    result: {
      schemaMarkdown:
        'Resource: search_term_view\nKey fields: search_term_view.search_term, ad_group_criterion.keyword.text, metrics.cost_micros, metrics.impressions, metrics.clicks, metrics.conversions, segments.search_term_match_type. Useful for finding queries where you spent but did not convert.',
    },
    narrative: 'Looked up search_term_view to identify high-spend non-converting queries.',
    isEvidence: false,
    startedAt: '2026-05-15T09:13:48Z',
    finishedAt: '2026-05-15T09:13:49Z',
    latencyMs: 760,
  },
  {
    id: 'ti_p02',
    specialistId: 'position-spend',
    toolName: 'google_ads.query',
    displayName: 'google_ads.search_term_view',
    args: {
      gaql: gaql`
        SELECT
          search_term_view.search_term,
          ad_group_criterion.keyword.text,
          metrics.cost_micros,
          metrics.impressions,
          metrics.conversions
        FROM search_term_view
        WHERE segments.date BETWEEN '2026-05-08' AND '2026-05-14'
          AND metrics.cost_micros > 80000000
          AND metrics.conversions = 0
        ORDER BY metrics.cost_micros DESC
        LIMIT 25
      `,
    },
    result: {
      columns: ['Search term', 'Triggered by', 'Spend', 'Impressions', 'Convs'],
      rows: [
        ['injury lawyer free', 'injury lawyer near me', '$340', '124', '0'],
        ['personal injury lawsuit settlement amounts', 'personal injury lawyer cleveland', '$280', '94', '0'],
        ['how much can i sue for', 'injury lawyer near me', '$210', '88', '0'],
        ['lawyer that takes 10 percent', 'personal injury lawyer cleveland', '$190', '71', '0'],
      ],
      totalRows: 25,
    },
    narrative: 'Pulled non-converting search terms over $80 spend. Strong signal of intent mismatch.',
    isEvidence: true,
    startedAt: '2026-05-15T09:13:50Z',
    finishedAt: '2026-05-15T09:13:54Z',
    latencyMs: 4280,
  },
  {
    id: 'ti_p03',
    specialistId: 'position-spend',
    toolName: 'google_ads.query',
    displayName: 'google_ads.keyword_view',
    args: {
      gaql: gaql`
        SELECT
          ad_group_criterion.keyword.text,
          metrics.search_rank_lost_top_impression_share,
          metrics.cost_micros,
          metrics.conversions_value
        FROM keyword_view
        WHERE segments.date BETWEEN '2026-05-08' AND '2026-05-14'
          AND metrics.search_rank_lost_top_impression_share > 0.5
        ORDER BY metrics.cost_micros DESC
        LIMIT 12
      `,
    },
    result: {
      columns: ['Keyword', 'Lost top IS (rank)%', 'Spend', 'Conv value'],
      rows: [
        ['personal injury lawyer cleveland', '74%', '$2,840', '$18,400'],
        ['car accident attorney', '69%', '$2,310', '$14,200'],
        ['slip and fall lawyer ohio', '79%', '$1,980', '$9,800'],
        ['workers comp attorney cleveland', '64%', '$1,740', '$11,200'],
        ['cleveland accident lawyer', '71%', '$1,420', '$7,400'],
        ['ohio injury attorney', '68%', '$1,260', '$6,900'],
        ['cleveland personal injury attorney', '74%', '$1,180', '$5,800'],
        ['injury law firm cleveland', '67%', '$980', '$4,200'],
      ],
      totalRows: 8,
    },
    narrative: 'Pulled keywords where rank loss exceeds 50%. Eight terms losing top placement on rank, not budget.',
    isEvidence: true,
    startedAt: '2026-05-15T09:13:55Z',
    finishedAt: '2026-05-15T09:14:00Z',
    latencyMs: 4910,
  },
  {
    id: 'ti_p04',
    specialistId: 'position-spend',
    toolName: 'google_ads.query',
    displayName: 'google_ads.hourly_view',
    args: {
      gaql: gaql`
        SELECT
          segments.hour,
          metrics.impressions,
          metrics.search_rank_lost_impression_share
        FROM keyword_view
        WHERE segments.date BETWEEN '2026-05-08' AND '2026-05-14'
        ORDER BY segments.hour
      `,
    },
    result: {
      columns: ['Hour', 'Impressions', 'Lost IS (rank)%'],
      rows: [
        ['08:00', '1,240', '52%'],
        ['12:00', '2,180', '64%'],
        ['17:00', '3,720', '81%'],
        ['20:00', '2,840', '79%'],
        ['22:00', '1,420', '68%'],
      ],
      totalRows: 24,
    },
    narrative: 'Pulled hour-of-day rank loss. Peak hours (5–10pm) show worst rank position despite highest demand.',
    isEvidence: true,
    startedAt: '2026-05-15T09:14:01Z',
    finishedAt: '2026-05-15T09:14:04Z',
    latencyMs: 3220,
  },
  {
    id: 'ti_p05',
    specialistId: 'position-spend',
    toolName: 'google_ads.query',
    displayName: 'google_ads.ad_group',
    args: {
      gaql: gaql`
        SELECT
          ad_group.name,
          metrics.search_budget_lost_impression_share,
          metrics.cost_micros
        FROM ad_group
        WHERE segments.date BETWEEN '2026-05-08' AND '2026-05-14'
          AND metrics.search_budget_lost_impression_share > 0.1
        ORDER BY metrics.search_budget_lost_impression_share DESC
      `,
    },
    result: {
      columns: ['Ad group', 'Lost IS (budget)%', 'Spend'],
      rows: [
        ['Auto - Cleveland Exact', '23%', '$3,840'],
        ['Slip & Fall - Ohio Exact', '18%', '$2,210'],
        ['Workers Comp - Cleveland', '14%', '$1,720'],
      ],
      totalRows: 3,
    },
    narrative: 'Pulled ad groups losing share to budget. Three ad groups capped despite strong intent.',
    isEvidence: true,
    startedAt: '2026-05-15T09:14:05Z',
    finishedAt: '2026-05-15T09:14:08Z',
    latencyMs: 2840,
  },
];

// ─── Section 4: Creative & Landing Page Intelligence ──────────────────────

const creativeInvocations: ToolInvocation[] = [
  {
    id: 'ti_c01',
    specialistId: 'creative-lp',
    toolName: 'google_ads.explore_schema',
    displayName: 'schema: ad_group_ad',
    args: { resource: 'ad_group_ad' },
    result: {
      schemaMarkdown:
        'Resource: ad_group_ad\nKey fields: ad_group_ad.ad.responsive_search_ad.headlines, ad_group_ad.ad.responsive_search_ad.descriptions, ad_group_ad.ad.final_urls. Useful for comparing your live ad copy against scraped competitor headlines.',
    },
    narrative: 'Looked up ad_group_ad to pull your live ad headlines for comparison against rival creative.',
    isEvidence: false,
    startedAt: '2026-05-15T09:14:30Z',
    finishedAt: '2026-05-15T09:14:31Z',
    latencyMs: 690,
  },
  {
    id: 'ti_c02',
    specialistId: 'creative-lp',
    toolName: 'web.scrape',
    displayName: 'web.scrape',
    args: { url: 'https://smithlaw.com' },
    result: {
      sample: {
        url: 'https://smithlaw.com',
        h1: 'Cleveland Injury Lawyers · No Win, No Fee',
        primaryCta: 'Get My Free Case Review',
        offer: 'Free consultation · No fees unless we win',
        socialProof: 'Over $250M recovered for Cleveland clients',
        urgency: '24/7 hotline · Speak to a lawyer today',
      },
    },
    narrative: 'Scraped smithlaw.com landing page. Headline-CTA-offer trio fully visible above fold.',
    isEvidence: true,
    startedAt: '2026-05-15T09:14:32Z',
    finishedAt: '2026-05-15T09:14:35Z',
    latencyMs: 3120,
  },
  {
    id: 'ti_c03',
    specialistId: 'creative-lp',
    toolName: 'web.scrape',
    displayName: 'web.scrape',
    args: { url: 'https://clevelandig.com' },
    result: {
      sample: {
        url: 'https://clevelandig.com',
        h1: 'Cleveland Injury Group · Free Consultation',
        primaryCta: 'Schedule My Free Consultation',
        offer: 'Free case review · No win, no fee',
        socialProof: '4.9★ on Google · 1,200+ reviews',
        urgency: 'Available now · Call or text',
      },
    },
    narrative: 'Scraped clevelandig.com. Free consultation framing, review-count social proof.',
    isEvidence: true,
    startedAt: '2026-05-15T09:14:36Z',
    finishedAt: '2026-05-15T09:14:38Z',
    latencyMs: 2410,
  },
  {
    id: 'ti_c04',
    specialistId: 'creative-lp',
    toolName: 'web.scrape',
    displayName: 'web.scrape',
    args: { url: 'https://ohiopi.com' },
    result: {
      sample: {
        url: 'https://ohiopi.com',
        h1: 'Ohio Personal Injury Lawyers',
        primaryCta: 'Get Free Consultation',
        offer: 'Free case review · Pay nothing unless we win',
        socialProof: 'Featured in Cleveland Magazine, Plain Dealer',
        urgency: '24/7 phone · Text us anytime',
      },
    },
    narrative: 'Scraped ohiopi.com. Free consultation again, press-mention social proof.',
    isEvidence: true,
    startedAt: '2026-05-15T09:14:39Z',
    finishedAt: '2026-05-15T09:14:41Z',
    latencyMs: 2340,
  },
  {
    id: 'ti_c05',
    specialistId: 'creative-lp',
    toolName: 'web.scrape',
    displayName: 'web.scrape',
    args: { url: 'https://hartmanlaw.com' },
    result: {
      sample: {
        url: 'https://hartmanlaw.com',
        h1: 'Cleveland Injury Lawyers Since 1998',
        primaryCta: 'Start My Claim',
        offer: 'No win, no fee · Free claim review',
        socialProof: '25+ years serving Cleveland families',
        urgency: 'Same-day callback guaranteed',
      },
    },
    narrative: 'Scraped hartmanlaw.com. Tenure-based positioning. No free-consultation framing.',
    isEvidence: true,
    startedAt: '2026-05-15T09:14:42Z',
    finishedAt: '2026-05-15T09:14:44Z',
    latencyMs: 2210,
  },
  {
    id: 'ti_c06',
    specialistId: 'creative-lp',
    toolName: 'google_ads.query',
    displayName: 'google_ads.ad_group_ad',
    args: {
      gaql: gaql`
        SELECT
          ad_group_ad.ad.responsive_search_ad.headlines,
          ad_group_ad.ad.responsive_search_ad.descriptions,
          metrics.impressions,
          metrics.ctr
        FROM ad_group_ad
        WHERE segments.date BETWEEN '2026-05-08' AND '2026-05-14'
          AND ad_group_ad.status = 'ENABLED'
        ORDER BY metrics.impressions DESC
        LIMIT 8
      `,
    },
    result: {
      columns: ['Headline 1', 'Headline 2', 'Impressions', 'CTR'],
      rows: [
        ['Cleveland Injury Lawyers', 'Trusted Local Law Firm', '4,210', '3.8%'],
        ['Personal Injury Attorneys', 'Cleveland Office', '3,840', '3.2%'],
        ['Hurt? Talk to a Lawyer', 'Cleveland Personal Injury', '2,910', '4.1%'],
      ],
      totalRows: 8,
    },
    narrative: 'Pulled your live ad headlines. None mention "free consultation" or "no win, no fee."',
    isEvidence: true,
    startedAt: '2026-05-15T09:14:45Z',
    finishedAt: '2026-05-15T09:14:49Z',
    latencyMs: 3820,
  },
];

// ─── Findings ─────────────────────────────────────────────────────────────

const discoveryFindings: Finding[] = [
  {
    id: 'f_d1',
    title: '8 active rivals identified, 5 more than you were tracking',
    body:
      'We searched Google for your top 12 keywords across personal injury terms and recorded every advertiser appearing in the top 4 paid positions over a 7-day window. We then cross-referenced each domain against public ad-spend data to filter one-off advertisers and confirm sustained campaigns.',
    metric: { value: '8', label: 'Active rivals' },
    impact: 'high',
    primaryEvidenceRef: 'ti_d11',
    supportingEvidenceRefs: ['ti_d04', 'ti_d05', 'ti_d06', 'ti_d07', 'ti_d08', 'ti_d09', 'ti_d10'],
    judgment:
      'Five of these eight rivals are not in your current competitive-set list. Two (Smith & Associates and Cleveland Injury Group) appear on every keyword we sampled, indicating saturated bidding rather than experimental campaigns.',
  },
  {
    id: 'f_d2',
    title: 'Smith & Associates is the dominant rival across every keyword',
    body:
      'Smith & Associates appears in the top 3 paid positions on all four high-spend keywords we tested. Their $12K monthly spend and 312 active ad days in the last year mark them as the most committed competitor in the market.',
    metric: { value: '$12K', label: 'Est. monthly spend (Smith)' },
    impact: 'high',
    primaryEvidenceRef: 'ti_d08',
    supportingEvidenceRefs: ['ti_d04', 'ti_d05', 'ti_d11', 'ti_d12'],
    judgment:
      'Smith is not a generalist; they are running a Cleveland-specific saturation strategy. Beating them requires either bid escalation on the contested terms or differentiation on offer (they lead with no-win-no-fee + 250M recovery).',
  },
];

const auctionFindings: Finding[] = [
  {
    id: 'f_a1',
    title: 'Top 4 rivals control 67% of available impression share',
    body:
      'Auction insights show four advertisers absorbing the majority of impressions across your target keywords. Smith & Associates alone holds 24.1% combined IS; the bottom four rivals split the remaining 33%.',
    metric: { value: '67.2%', label: 'IS held by top 4 rivals' },
    impact: 'high',
    primaryEvidenceRef: 'ti_a04',
    supportingEvidenceRefs: ['ti_a02', 'ti_d11'],
    evidenceSummary: {
      columns: ['Rival', 'Combined IS%'],
      rows: [
        ['smithlaw.com', '24.1%'],
        ['clevelandig.com', '18.7%'],
        ['ohiopi.com', '13.4%'],
        ['hartmanlaw.com', '11.0%'],
        ['Sum', '67.2%'],
      ],
      note: 'Derived from primary evidence: top 4 rivals aggregated.',
    },
    judgment:
      'Concentration is the story here. When share is this top-heavy, lifting bids on the contested keywords moves the needle faster than expanding to long-tail terms.',
  },
  {
    id: 'f_a2',
    title: 'Rank loss dwarfs budget loss across all 12 keywords',
    body:
      'Lost impression share due to rank averages 71% across your top 12 keywords, while budget-driven loss averages just 9%. You are not capped by spend; you are capped by bid and quality score.',
    metric: { value: '8x', label: 'Rank loss vs budget loss' },
    impact: 'high',
    primaryEvidenceRef: 'ti_a03',
    supportingEvidenceRefs: ['ti_a05'],
    judgment:
      'Adding budget will not move position. The lever is bid strategy plus quality-score work on the underperforming keywords.',
  },
];

const positionFindings: Finding[] = [
  {
    id: 'f_p1',
    title: 'Outranked on 8 of 12 high-spend keywords',
    body:
      'Eight of your highest-spend keywords have rank-driven lost top impression share above 50%. You spent $14,400 on these eight terms in the last 7 days while sitting below position 2 most of the time.',
    metric: { value: '8 / 12', label: 'Keywords losing top placement' },
    impact: 'high',
    primaryEvidenceRef: 'ti_p03',
    supportingEvidenceRefs: ['ti_p04'],
    judgment:
      'These are the bids worth raising. They have demonstrated conversion value ($77,900 in conversion value last 7 days) and the rank gap is the only reason they are not absolute-top-placed.',
  },
  {
    id: 'f_p2',
    title: '$1,020 wasted on irrelevant search terms in 7 days',
    body:
      'Twenty-five search terms above $80 spend produced zero conversions. The pattern is "free" and "lawsuit settlement amounts" queries pulling broad-match traffic that does not convert.',
    metric: { value: '$1,020', label: 'Zero-conversion spend' },
    impact: 'medium',
    primaryEvidenceRef: 'ti_p02',
    supportingEvidenceRefs: [],
    judgment:
      'Add 12–18 negative keywords (free, lawsuit settlement, how much can i sue). This buys back budget for the rank-loss keywords identified above.',
  },
  {
    id: 'f_p3',
    title: 'Peak-hour rank position is your worst time slot',
    body:
      'Between 5pm and 10pm (your highest-demand hours by impression volume) rank-driven lost share peaks at 81%. Competitors are bidding harder when intent is highest.',
    metric: { value: '81%', label: 'Lost IS at 5pm peak' },
    impact: 'medium',
    primaryEvidenceRef: 'ti_p04',
    supportingEvidenceRefs: [],
    judgment:
      'Dayparting bid adjustment (+25% to +40% on 5–10pm window) would close the gap. Currently uniform bidding across hours leaves the peak hours under-defended.',
  },
];

const creativeFindings: Finding[] = [
  {
    id: 'f_c1',
    title: 'Three rivals lead with "free consultation"; you do not',
    body:
      'Three of four top rivals (Smith, Cleveland Injury Group, Ohio Personal Injury) put "free consultation" or "free case review" as the primary offer above the fold. Your live ads emphasise local presence and tenure, not the offer.',
    metric: { value: '3 / 4', label: 'Rivals leading with free consult' },
    impact: 'high',
    primaryEvidenceRef: 'ti_c06',
    supportingEvidenceRefs: ['ti_c02', 'ti_c03', 'ti_c04', 'ti_c05'],
    evidenceSummary: {
      columns: ['Rival', 'Primary offer'],
      rows: [
        ['Smith & Associates', 'Free case review · No win, no fee'],
        ['Cleveland Injury Group', 'Free consultation · No win, no fee'],
        ['Ohio Personal Injury', 'Free consultation · Pay nothing unless we win'],
        ['Hartman Legal', 'Same-day callback (tenure-based positioning)'],
        ['Your live ads', 'Cleveland Injury Lawyers · Trusted Local Law Firm'],
      ],
      note: 'Derived from scraped LP H1+CTA+offer triads and live ad headlines.',
    },
    judgment:
      'Your ads compete on identity; rivals compete on offer. The CTR delta you would gain from adding "Free Consultation" to headline rotation is probably worth more than any bid increase.',
  },
];

// ─── Assembled report ─────────────────────────────────────────────────────

export const COMPETITOR_SPY_REPORT: Report = {
  runId: 'run-competitor-spy-completed',
  agentName: 'Competitor Spy',
  accountName: 'Cleveland Personal Injury Group',
  completedAt: '2026-05-15T09:14:50Z',
  durationMs: 169000,
  sections: [
    {
      id: 'sec-discovery',
      icon: 'target',
      name: 'Competitor Discovery',
      meta: {
        toolCallsCount: discoveryInvocations.length,
        headlineMetric: { value: '8', label: 'rivals identified' },
        window: '7-day window',
      },
      findings: discoveryFindings,
      invocations: discoveryInvocations,
    },
    {
      id: 'sec-auction',
      icon: 'binoculars',
      name: 'Auction Intelligence',
      meta: {
        toolCallsCount: auctionInvocations.length,
        headlineMetric: { value: '67.2%', label: 'IS held by top 4 rivals' },
        window: '7-day window',
      },
      findings: auctionFindings,
      invocations: auctionInvocations,
    },
    {
      id: 'sec-position',
      icon: 'chart',
      name: 'Position & Spend Analysis',
      meta: {
        toolCallsCount: positionInvocations.length,
        headlineMetric: { value: '8', label: 'keywords losing top placement' },
        window: '7-day window',
      },
      findings: positionFindings,
      invocations: positionInvocations,
    },
    {
      id: 'sec-creative',
      icon: 'flag',
      name: 'Creative & Landing Page Intelligence',
      meta: {
        toolCallsCount: creativeInvocations.length,
        headlineMetric: { value: '3 / 4', label: 'rivals lead with free consult' },
        window: '7-day window',
      },
      findings: creativeFindings,
      invocations: creativeInvocations,
    },
  ],
};

// Convenience selector: every invocation across every section, chronological.
export const ALL_INVOCATIONS: ToolInvocation[] = COMPETITOR_SPY_REPORT.sections
  .flatMap((s) => s.invocations)
  .sort((a, b) => a.startedAt.localeCompare(b.startedAt));
