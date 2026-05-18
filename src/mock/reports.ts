// Reports list — the inbox surface at /reports.
//
// Triaged by what NEEDS the operator, not chronologically. Four buckets:
//   1 · needs       — urgent, money-on-the-line, hero cards
//   2 · ready       — drafted/approved, awaiting sign-off before sending
//   3 · fyi         — informational, no action
//   4 · actioned    — already shipped; collapsed by default
//
// All copy is post-run, so concrete $ figures are allowed here
// (see feedback_no_pre_run_dollar_figures.md).
//
// Mock-data note: every row's runId currently routes into the one
// canonical completed-run fixture in mock/runs.ts (competitor-spy), so a
// click from any row in the list lands on a real report screen.

export type ReportStatus =
  | 'draft-ready'
  | 'approved'
  | 'needs-review'
  | 'sent';

/* A sub-finding is the second-to-Nth finding inside a report (the first
 * one is surfaced as the row's headline). Each one is a DATA-BACKED
 * OBSERVATION paired with a marketer action or open question — never
 * just a stat, never just an observation. Concrete values are post-run,
 * so $ figures are allowed (see feedback_no_pre_run_dollar_figures.md). */
export type SubFindingImpact = 'critical' | 'warning' | 'healthy';
export interface SubFinding {
  id: string;             // anchor on the report's AI Summary tab
  impact: SubFindingImpact;
  body: string;           // "Observation backed by data — action or open question?"
}

export interface NeedsReport {
  id: string;
  runId: string;
  agentName: string;
  agentEmoji: string;
  projectId: string;
  projectName: string;
  headline: string;
  primaryMetric: { value: string; label: string };
  secondaryMetric: string;
  whyNow: string;
  finishedLabel: string;
  pinned?: boolean;
  cta: string;
  subFindings: SubFinding[];
}

export interface ReadyReport {
  id: string;
  runId: string;
  agentName: string;
  agentEmoji: string;
  projectId: string;
  projectName: string;
  headline: string;
  subline: string;
  status: ReportStatus;
  finishedLabel: string;
  subFindings: SubFinding[];
}

export interface FyiReport {
  id: string;
  runId: string;
  agentName: string;
  agentEmoji: string;
  projectId: string;
  projectName: string;
  headline: string;
  subline: string;
  finishedLabel: string;
  subFindings: SubFinding[];
}

// Every list row currently routes into the one canonical completed run.
// (The negative-keyword fixture was retired 2026-05-15; rows that used to
// point at it now land on the competitor-spy report.)
const RUN_COMPETITOR = 'run-competitor-spy-completed';

export const NEEDS_TODAY: NeedsReport[] = [
  {
    id: 'r-needs-1',
    runId: RUN_COMPETITOR,
    agentName: 'Competitor Spy',
    agentEmoji: '🕵️',
    projectId: 'boulder-care',
    projectName: 'Boulder Care',
    headline: '11 gaps your rivals are exploiting',
    primaryMetric: { value: '$8.2K/mo', label: 'upside if applied' },
    secondaryMetric: '3 quick wins · 8 follow-ups',
    whyNow:
      "$8.2K/mo at stake. Competitor activity up 34% this week and the account hasn't been reviewed in 14 days.",
    finishedLabel: '12 min ago',
    pinned: true,
    cta: 'Open report',
    subFindings: [
      { id: 'sf-1a', impact: 'critical', body: "Bicycle Health takes position 1 on 8 of your 11 highest-CPC keywords — accept they own that surface and double down bottom-funnel, or contest?" },
      { id: 'sf-1b', impact: 'critical', body: "3 rivals testing Substack-style top-of-funnel content; combined organic traffic up 47% in 30 days — gap to plug before they monetise the audience?" },
      { id: 'sf-1c', impact: 'warning',  body: "Workit Health dropped LP price to $99/mo while brand impression share fell 14% over 30 days — repositioning, or a short acquisition push?" },
      { id: 'sf-1d', impact: 'warning',  body: "Aspen Recovery rotates to position 4 on 4 branded recovery queries — is this the gap to press, or auction noise we'd burn budget chasing?" },
      { id: 'sf-1e', impact: 'healthy',  body: "Brand impression share climbed 62% → 74% over 14 days — defensive position strongest in 18 months. Worth redirecting some confidence into non-brand?" },
      { id: 'sf-1f', impact: 'healthy',  body: "Boulder ranks #1 on 6 of 8 'recovery near me' geo queries at QS 9 — the local moat is real, what's the next geo to press?" },
    ],
  },
  {
    id: 'r-needs-2',
    runId: RUN_COMPETITOR,
    agentName: 'Negative Keyword',
    agentEmoji: '🧹',
    projectId: 'flock',
    projectName: 'Flock',
    headline: '47 candidates ready to review',
    primaryMetric: { value: '$4,200/mo', label: 'wasted spend caught' },
    secondaryMetric: '12 high-confidence · 35 to review',
    whyNow:
      'High-confidence batch hit your auto-apply threshold. Approve in bulk or review individually.',
    finishedLabel: '2 hours ago',
    pinned: true,
    cta: 'Review batch',
    subFindings: [
      { id: 'sf-2a', impact: 'critical', body: "12 candidates above 95% confidence burning $1,840/mo — auto-apply the batch, or vet one-by-one?" },
      { id: 'sf-2b', impact: 'critical', body: "'Edinburgh tourism jobs' single-handedly burns £67/week with 0 conversions in 90 days — strongest single noise term in the account." },
      { id: 'sf-2c', impact: 'warning',  body: "8 candidates cluster around 'travel agent jobs' / 'tour guide jobs' — promote 'jobs' and 'careers' to account-level negatives?" },
      { id: 'sf-2d', impact: 'warning',  body: "Edinburgh has 6× more job-related candidates than London (47 vs 8) — geographic bias in how the campaigns are matching?" },
      { id: 'sf-2e', impact: 'healthy',  body: "Auto-applied negatives caught & retired 23 noise terms last month — saved an estimated $1,200 on travel-agent and tour-guide variants alone." },
    ],
  },
];

export const READY_FOR_CLIENT: ReadyReport[] = [
  {
    id: 'r-ready-1',
    runId: RUN_COMPETITOR,
    agentName: 'Client Reporting',
    agentEmoji: '📝',
    projectId: 'boulder-care',
    projectName: 'Boulder Care',
    headline: 'April monthly summary',
    subline: '12-page exec recap',
    status: 'draft-ready',
    finishedLabel: '5h ago',
    subFindings: [
      { id: 'sf-3a', impact: 'healthy',  body: "Conv-value up 18% MoM ($72.4K → $85.6K) — mainly from Brand · Recovery Centers. Lead the recap with this?" },
      { id: 'sf-3b', impact: 'healthy',  body: "PMAX picked up 3 new high-converting placements in April — worth featuring as 'algorithm did the work' moments?" },
      { id: 'sf-3c', impact: 'healthy',  body: "Click-to-call rate up 24% in April after the new mobile CTA test — recommend rolling out to the full geo set in May?" },
      { id: 'sf-3d', impact: 'critical', body: "Non-Brand NM Treatment hit $289 CPA against $184 target — flag for client and propose the 7-day pause?" },
    ],
  },
  {
    id: 'r-ready-2',
    runId: RUN_COMPETITOR,
    agentName: 'Deep Account Audit',
    agentEmoji: '🔎',
    projectId: 'durable',
    projectName: 'Durable',
    headline: 'PMAX is leaking budget on irrelevant terms',
    subline: 'Spend, ROAS, and device-mix flagged',
    status: 'approved',
    finishedLabel: 'Yesterday',
    subFindings: [
      { id: 'sf-4a', impact: 'critical', body: "PMAX matched 'how to build a website free' 247 times — 0 conversions, $312 spent. Add as account-level negative?" },
      { id: 'sf-4b', impact: 'critical', body: "Sitelink CTR collapsed 38% on the 'Restaurants' campaign after Apr 22 — feature update, or did the seasonal calendar miss?" },
      { id: 'sf-4c', impact: 'warning',  body: "Asset group 'Local Restaurants' draws 38% of spend but only 11% of conversions — split or rebalance the budget split?" },
      { id: 'sf-4d', impact: 'warning',  body: "Mobile CPC inflated 19% over 21 days while desktop held flat — device-bid adjustment review?" },
      { id: 'sf-4e', impact: 'healthy',  body: "Top placement 'restaurant.com' drove 23% of conv-value last 30d — feed this signal back into bidding as an audience seed?" },
      { id: 'sf-4f', impact: 'healthy',  body: "Local Restaurants ROAS climbed to 4.2 (vs 2.8 portfolio average) — strongest signal in 90 days; protect this budget envelope?" },
    ],
  },
  {
    id: 'r-ready-3',
    runId: RUN_COMPETITOR,
    agentName: 'Change Impact',
    agentEmoji: '🚨',
    projectId: 'the-hoth',
    projectName: 'The HOTH',
    headline: 'CPA spiked 38% on May 11',
    subline: 'root cause identified',
    status: 'needs-review',
    finishedLabel: '2 days ago',
    subFindings: [
      { id: 'sf-5a', impact: 'critical', body: "Spike coincides with Google nudging the campaign from tCPA to Max Conv on May 10 — accept the new strategy, or revert?" },
      { id: 'sf-5b', impact: 'warning',  body: "Same day, SEMrush launched a 24-hour promo — did we get caught in their auction wake, or is this a structural shift?" },
      { id: 'sf-5c', impact: 'warning',  body: "Quality Score on 'seo services' dropped 7.8 → 6.9 in 48 hours — landing page issue, or relevance signal change?" },
    ],
  },
  {
    id: 'r-ready-4',
    runId: RUN_COMPETITOR,
    agentName: 'Ad Copy',
    agentEmoji: '✍️',
    projectId: 'livingyoung',
    projectName: 'LivingYoung Center',
    headline: 'Headlines are stale across all campaigns',
    subline: '14 RSAs refreshed',
    status: 'draft-ready',
    finishedLabel: '3 days ago',
    subFindings: [
      { id: 'sf-6a', impact: 'warning',  body: "14 RSAs have 'BEST' rated headlines untouched in 90+ days; top one 'Botox in Plano' at 0.84% CTR — refresh against benefit-led variants, or leave the proven winners?" },
      { id: 'sf-6b', impact: 'healthy',  body: "3 angles never tested: same-day appointment · weekend hours · insurance accepted. Worth a controlled test against the incumbent?" },
    ],
  },
];

export const FYI_REPORTS: FyiReport[] = [
  {
    id: 'r-fyi-1',
    runId: RUN_COMPETITOR,
    agentName: 'Google Ads Context',
    agentEmoji: '🩺',
    projectId: 'durable',
    projectName: 'Durable',
    headline: 'GA4 imports verified, all clear',
    subline: 'no anomalies detected this week',
    finishedLabel: '1 week ago',
    subFindings: [
      { id: 'sf-7a', impact: 'healthy', body: "GA4 ↔ Google Ads link confirmed across both accounts · no drift in 7 days. Drop the verification cadence to monthly?" },
      { id: 'sf-7b', impact: 'healthy', body: "Conversion attribution model still data-driven on both · 14 audience lists fresh · 0 stale. Watchlist or de-prioritise?" },
    ],
  },
  {
    id: 'r-fyi-2',
    runId: RUN_COMPETITOR,
    agentName: 'Competitor Spy',
    agentEmoji: '🕵️',
    projectId: 'the-hoth',
    projectName: 'The HOTH',
    headline: 'B2B SaaS rivals shifting to ABM',
    subline: '4 rivals, 9 angles flagged',
    finishedLabel: '1 week ago',
    subFindings: [
      { id: 'sf-8a', impact: 'warning',  body: "SEMrush and Ahrefs both cut self-serve search spend ~30% in the last 21 days — pivoting to ABM/enterprise, or just a quarterly reset?" },
      { id: 'sf-8b', impact: 'warning',  body: "4 new agency-named brand campaigns spotted in 14 days (SEMrush bidding on 'ahrefs vs', etc.) — they're fishing for switchers." },
      { id: 'sf-8c', impact: 'warning',  body: "LinkedIn ad spend up 41% in 21 days as their search spend dropped — confirms the ABM pivot, or just channel-shifting?" },
      { id: 'sf-8d', impact: 'healthy',  body: "Worth checking: are we on their 'compete' lists too? An awareness opportunity if not — they're paying the impressions cost." },
    ],
  },
  {
    id: 'r-fyi-3',
    runId: RUN_COMPETITOR,
    agentName: 'Change Impact',
    agentEmoji: '🔬',
    projectId: 'flock',
    projectName: 'Flock',
    headline: 'Weekend CPA jump explained',
    subline: 'auction pressure ↑22% on Edinburgh',
    finishedLabel: '2 weeks ago',
    subFindings: [
      { id: 'sf-9a', impact: 'warning', body: "Edinburgh auction pressure rose +22% over the weekend (vs +6% London) — local tourism board ran weekend ads." },
      { id: 'sf-9b', impact: 'healthy', body: "Cleared by Tuesday morning, no lasting impact on weekly CPA — the algorithm handled it without intervention. Worth documenting as 'no action needed' so we don't reflexively daypart next time?" },
      { id: 'sf-9c', impact: 'warning', body: "Pattern likely to recur (tourism board has ~monthly weekend spikes) — daypart Edinburgh weekends or bid down -15% on Sat/Sun?" },
    ],
  },
  {
    id: 'r-fyi-4',
    runId: RUN_COMPETITOR,
    agentName: 'Weekly Audit',
    agentEmoji: '📈',
    projectId: 'boulder-care',
    projectName: 'Boulder Care',
    headline: 'Quality Score holding steady at 7.8 avg',
    subline: 'no degradation detected',
    finishedLabel: '2 weeks ago',
    subFindings: [
      { id: 'sf-10a', impact: 'healthy', body: "No keyword fell below QS 5 this week (previous low was 7) — landing page experience 'Above average' on all 8 campaigns. Push more budget into the top-QS ad groups?" },
      { id: 'sf-10b', impact: 'warning', body: "Expected CTR still 'Average' (not 'Above') on 3 ad groups — could a fresh RSA push them up, or is this the structural ceiling for the vertical?" },
    ],
  },
];

// Sidebar dropdown — short and focused. One entry per canonical run fixture,
// labelled with its hero headline so the operator can jump straight in.
export interface SidebarReportEntry {
  runId: string;
  label: string;
}

export const SIDEBAR_REPORT_PAGES: SidebarReportEntry[] = [
  { runId: RUN_COMPETITOR, label: 'Competitor Spy · Boulder Care' },
];

export const REPORT_TOTAL = 47;
export const ACTIONED_THIS_MONTH = 28;
export const ACCOUNTS_COVERED = 8;
export const SPECIALISTS_RUNNING = 3;
