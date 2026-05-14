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
// Mock-data note: every row's runId points to one of the two fully-fleshed
// fixtures in mock/runs.ts (competitor-spy / negative-keyword completed),
// so a click from any row in the list lands on a real report screen.

export type ReportStatus =
  | 'draft-ready'
  | 'approved'
  | 'needs-review'
  | 'sent';

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
}

// The two canonical run fixtures every list row currently routes into.
const RUN_COMPETITOR = 'run-competitor-spy-completed';
const RUN_NEGATIVES = 'run-negative-keyword-completed';

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
  },
  {
    id: 'r-needs-2',
    runId: RUN_NEGATIVES,
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
  },
  {
    id: 'r-ready-2',
    runId: RUN_COMPETITOR,
    agentName: 'Deep Account Audit',
    agentEmoji: '🔎',
    projectId: 'durable',
    projectName: 'Durable',
    headline: 'PMAX is leaking budget on irrelevant terms',
    subline: '3 critical fixes proposed',
    status: 'approved',
    finishedLabel: 'Yesterday',
  },
  {
    id: 'r-ready-3',
    runId: RUN_NEGATIVES,
    agentName: 'Change Impact',
    agentEmoji: '🚨',
    projectId: 'the-hoth',
    projectName: 'The HOTH',
    headline: 'CPA spiked 38% on May 11',
    subline: 'root cause identified',
    status: 'needs-review',
    finishedLabel: '2 days ago',
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
  },
];

export const FYI_REPORTS: FyiReport[] = [
  {
    id: 'r-fyi-1',
    runId: RUN_NEGATIVES,
    agentName: 'Google Ads Context',
    agentEmoji: '🩺',
    projectId: 'durable',
    projectName: 'Durable',
    headline: 'GA4 imports verified, all clear',
    subline: 'no anomalies detected this week',
    finishedLabel: '1 week ago',
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
  },
  {
    id: 'r-fyi-3',
    runId: RUN_NEGATIVES,
    agentName: 'Change Impact',
    agentEmoji: '🔬',
    projectId: 'flock',
    projectName: 'Flock',
    headline: 'Weekend CPA jump explained',
    subline: 'auction pressure ↑22% on Edinburgh',
    finishedLabel: '2 weeks ago',
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
  { runId: RUN_NEGATIVES,  label: 'Negative Keyword · Flock' },
];

export const REPORT_TOTAL = 47;
export const ACTIONED_THIS_MONTH = 28;
export const ACCOUNTS_COVERED = 8;
export const SPECIALISTS_RUNNING = 3;
