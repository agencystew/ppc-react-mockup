// Client briefing — the amalgamation surface at /projects/:id/brief.
//
// A briefing is what one project's worth of agent runs (over the period) looks
// like when stitched into a single editorial recap for the client. Every win
// and every needs-attention row carries a `source` ref back to the real run
// that produced the finding, so the brief is auditable end-to-end.
//
// The narrative paragraph in the dark hero is composed from the same facts the
// rows below cite — no invented copy, no editorial filler.
//
// Author note: for ship-quality, only `boulder-care` has both Week and Month
// fully fleshed. Other projects fall through to a minimal weekly stub so the
// page never breaks when you navigate to one. Easy to add more later.

export type BriefPeriod = 'week' | 'month';

export interface BriefSourceRef {
  runId: string;
  agentName: string;
  agentEmoji: string;
  whenLabel: string;         // "Mon · 12h ago"
}

export interface BriefRow {
  impact: 'healthy' | 'critical' | 'warning';
  headline: string;          // Named entity + concrete number
  body: string;              // One-line context, post-run actuals
  source: BriefSourceRef;
}

export interface BriefNumber {
  label: string;
  value: string;
  delta: string;             // "+12.4%" or "$32 → $42"
  deltaTone: 'good' | 'bad' | 'neutral';
  spark: number[];           // 12 points, directional
}

export interface BriefReceipt {
  runId: string;
  agentName: string;
  agentEmoji: string;
  finishedLabel: string;     // "Mon May 12"
  findingsCount: number;     // 3 findings inside the run
}

export interface ProjectBrief {
  projectId: string;
  period: BriefPeriod;
  periodLabel: string;       // "Week of May 11–17"
  prevPeriodLabel: string;   // "vs. May 4–10"
  generatedAt: string;       // "Updated this morning"
  narrative: string;         // The dark-hero paragraph (stitched from real facts)
  numbers: BriefNumber[];    // 4 KPIs
  wins: BriefRow[];
  needs: BriefRow[];
  receipts: BriefReceipt[];  // Every run that fed into the brief
}

// ─── Run IDs the rows route into ──────────────────────────────────────────
// All boulder-care report rows in mock/reports.ts currently land on the
// canonical competitor-spy completed-run fixture. Mirror that here so a
// click from any row in the brief opens a real report screen.
const RUN_COMPETITOR = 'run-competitor-spy-completed';

// ─── Boulder Care · WEEK ─────────────────────────────────────────────────
const BOULDER_WEEK: ProjectBrief = {
  projectId: 'boulder-care',
  period: 'week',
  periodLabel: 'Week of May 11–17',
  prevPeriodLabel: 'vs. May 4–10',
  generatedAt: 'Updated this morning',
  narrative:
    "Strong week on the conversion side. Conv-value climbed 18% week over week ($72.4K → $85.6K), led by Brand · Recovery Centers, and Quality Score is holding at 7.8 across all 8 campaigns. One issue still leaking: Non-Brand NM Treatment hit $289 CPA against the $184 target on Thursday. Eleven competitor gaps surfaced Friday are worth a longer conversation.",
  numbers: [
    {
      label: 'Conv-value',
      value: '$85.6K',
      delta: '+18.2%',
      deltaTone: 'good',
      spark: [54, 56, 58, 62, 64, 67, 70, 72, 76, 79, 82, 86],
    },
    {
      label: 'Conversions',
      value: '1,118',
      delta: '+9.4%',
      deltaTone: 'good',
      spark: [82, 86, 88, 92, 94, 97, 100, 103, 106, 110, 114, 118],
    },
    {
      label: 'CPA',
      value: '$78',
      delta: '−8.2%',
      deltaTone: 'good',
      spark: [92, 90, 88, 87, 86, 85, 84, 82, 81, 80, 79, 78],
    },
    {
      label: 'Spend',
      value: '$87.5K',
      delta: '+2.1%',
      deltaTone: 'neutral',
      spark: [80, 82, 84, 83, 85, 86, 85, 86, 87, 87, 88, 87],
    },
  ],
  wins: [
    {
      impact: 'healthy',
      headline: 'Conv-value up 18% week over week',
      body: '$72.4K → $85.6K. Brand · Recovery Centers drove most of the lift.',
      source: {
        runId: RUN_COMPETITOR,
        agentName: 'Client Reporting',
        agentEmoji: '📝',
        whenLabel: 'Thu · 5h ago',
      },
    },
    {
      impact: 'healthy',
      headline: 'Quality Score holding at 7.8 average',
      body: 'No keyword fell below QS 5 this week. Landing-page experience rated "Above average" on all 8 campaigns.',
      source: {
        runId: RUN_COMPETITOR,
        agentName: 'Weekly Audit',
        agentEmoji: '📈',
        whenLabel: 'Tue · 2d ago',
      },
    },
    {
      impact: 'healthy',
      headline: 'PMAX picked up 3 new high-converting placements',
      body: 'Worth featuring in the recap as the "algorithm did the work" moment.',
      source: {
        runId: RUN_COMPETITOR,
        agentName: 'Client Reporting',
        agentEmoji: '📝',
        whenLabel: 'Thu · 5h ago',
      },
    },
    {
      impact: 'healthy',
      headline: 'Ad relevance "Above average" across every active ad',
      body: 'Strongest signal we\'ve seen in six weeks of data.',
      source: {
        runId: RUN_COMPETITOR,
        agentName: 'Weekly Audit',
        agentEmoji: '📈',
        whenLabel: 'Tue · 2d ago',
      },
    },
  ],
  needs: [
    {
      impact: 'critical',
      headline: 'Non-Brand NM Treatment at $289 CPA against $184 target',
      body: 'Flagged Thursday. Propose the 7-day pause or move budget to Brand · Recovery.',
      source: {
        runId: RUN_COMPETITOR,
        agentName: 'Client Reporting',
        agentEmoji: '📝',
        whenLabel: 'Thu · 5h ago',
      },
    },
    {
      impact: 'warning',
      headline: '11 competitor gaps with $8.2K/mo upside',
      body: 'Bicycle Health holds position 1 on 8 of your 11 highest-CPC keywords. Decide: contest or concede.',
      source: {
        runId: RUN_COMPETITOR,
        agentName: 'Competitor Spy',
        agentEmoji: '🕵️',
        whenLabel: 'Fri · 12 min ago',
      },
    },
    {
      impact: 'warning',
      headline: 'Expected CTR still "Average" on 3 ad groups',
      body: 'A fresh RSA push could lift them, or this is the structural ceiling for the vertical.',
      source: {
        runId: RUN_COMPETITOR,
        agentName: 'Weekly Audit',
        agentEmoji: '📈',
        whenLabel: 'Tue · 2d ago',
      },
    },
  ],
  receipts: [
    {
      runId: RUN_COMPETITOR,
      agentName: 'Competitor Spy',
      agentEmoji: '🕵️',
      finishedLabel: 'Fri May 17',
      findingsCount: 11,
    },
    {
      runId: RUN_COMPETITOR,
      agentName: 'Client Reporting',
      agentEmoji: '📝',
      finishedLabel: 'Thu May 16',
      findingsCount: 3,
    },
    {
      runId: RUN_COMPETITOR,
      agentName: 'Weekly Audit',
      agentEmoji: '📈',
      finishedLabel: 'Tue May 14',
      findingsCount: 3,
    },
    {
      runId: RUN_COMPETITOR,
      agentName: 'Negative Keyword',
      agentEmoji: '🧹',
      finishedLabel: 'Mon May 13',
      findingsCount: 4,
    },
    {
      runId: RUN_COMPETITOR,
      agentName: 'CPA Monitor',
      agentEmoji: '🎯',
      finishedLabel: 'Sun May 12',
      findingsCount: 2,
    },
    {
      runId: RUN_COMPETITOR,
      agentName: 'PMAX',
      agentEmoji: '🎯',
      finishedLabel: 'Sat May 11',
      findingsCount: 2,
    },
  ],
};

// ─── Boulder Care · MONTH ────────────────────────────────────────────────
const BOULDER_MONTH: ProjectBrief = {
  projectId: 'boulder-care',
  period: 'month',
  periodLabel: 'April 2026',
  prevPeriodLabel: 'vs. March 2026',
  generatedAt: 'Updated 3 days ago',
  narrative:
    "April was the strongest month of the year. Conv-value finished at $312K, up 24% MoM, and CPA closed the month at $74, the lowest since November. Brand campaigns carried the win; non-brand is still the soft surface and the place to spend April's gains. Competitor activity intensified late-month, which is the next thing to watch.",
  numbers: [
    {
      label: 'Conv-value',
      value: '$312K',
      delta: '+24.1%',
      deltaTone: 'good',
      spark: [60, 62, 65, 68, 72, 76, 80, 85, 90, 94, 98, 100],
    },
    {
      label: 'Conversions',
      value: '4,212',
      delta: '+12.6%',
      deltaTone: 'good',
      spark: [70, 72, 74, 78, 81, 84, 88, 91, 95, 98, 100, 100],
    },
    {
      label: 'CPA',
      value: '$74',
      delta: '−14.3%',
      deltaTone: 'good',
      spark: [100, 98, 96, 94, 92, 90, 87, 84, 80, 78, 76, 74],
    },
    {
      label: 'Spend',
      value: '$311K',
      delta: '+8.4%',
      deltaTone: 'neutral',
      spark: [80, 82, 83, 84, 85, 87, 88, 90, 92, 93, 94, 95],
    },
  ],
  wins: [
    {
      impact: 'healthy',
      headline: 'Conv-value up 24% month over month',
      body: '$251K → $312K. Brand · Recovery Centers contributed two-thirds of the lift.',
      source: {
        runId: RUN_COMPETITOR,
        agentName: 'Client Reporting',
        agentEmoji: '📝',
        whenLabel: 'Apr 30',
      },
    },
    {
      impact: 'healthy',
      headline: 'CPA closed at $74, lowest in six months',
      body: 'Down from $87 in March. Bidding strategy held through the volatility late-month.',
      source: {
        runId: RUN_COMPETITOR,
        agentName: 'Weekly Audit',
        agentEmoji: '📈',
        whenLabel: 'Apr 29',
      },
    },
    {
      impact: 'healthy',
      headline: 'PMAX added 14 new converting placements in April',
      body: '"Algorithm did the work" — strong narrative for the client recap.',
      source: {
        runId: RUN_COMPETITOR,
        agentName: 'PMAX',
        agentEmoji: '🎯',
        whenLabel: 'Apr 28',
      },
    },
    {
      impact: 'healthy',
      headline: 'Quality Score average ticked up 7.4 → 7.8',
      body: 'Ad relevance rated "Above average" on every active ad by month-end.',
      source: {
        runId: RUN_COMPETITOR,
        agentName: 'Weekly Audit',
        agentEmoji: '📈',
        whenLabel: 'Apr 22',
      },
    },
  ],
  needs: [
    {
      impact: 'critical',
      headline: 'Non-Brand NM Treatment at $289 CPA, 57% over target',
      body: 'Persistent through April. Recommended: 7-day pause and rebuild keyword pool around proven converters.',
      source: {
        runId: RUN_COMPETITOR,
        agentName: 'Client Reporting',
        agentEmoji: '📝',
        whenLabel: 'Apr 30',
      },
    },
    {
      impact: 'warning',
      headline: 'Competitor activity up 34% in the last 14 days',
      body: 'Bicycle Health, Workit Health, and Aspen all increased spend. Eleven gaps to discuss.',
      source: {
        runId: RUN_COMPETITOR,
        agentName: 'Competitor Spy',
        agentEmoji: '🕵️',
        whenLabel: 'Apr 26',
      },
    },
  ],
  receipts: [
    {
      runId: RUN_COMPETITOR,
      agentName: 'Client Reporting',
      agentEmoji: '📝',
      finishedLabel: 'Apr 30',
      findingsCount: 9,
    },
    {
      runId: RUN_COMPETITOR,
      agentName: 'Weekly Audit',
      agentEmoji: '📈',
      finishedLabel: 'Apr 29',
      findingsCount: 5,
    },
    {
      runId: RUN_COMPETITOR,
      agentName: 'Competitor Spy',
      agentEmoji: '🕵️',
      finishedLabel: 'Apr 26',
      findingsCount: 11,
    },
    {
      runId: RUN_COMPETITOR,
      agentName: 'PMAX',
      agentEmoji: '🎯',
      finishedLabel: 'Apr 22',
      findingsCount: 4,
    },
    {
      runId: RUN_COMPETITOR,
      agentName: 'Negative Keyword',
      agentEmoji: '🧹',
      finishedLabel: 'Apr 18',
      findingsCount: 6,
    },
    {
      runId: RUN_COMPETITOR,
      agentName: 'Deep Account Audit',
      agentEmoji: '🔎',
      finishedLabel: 'Apr 12',
      findingsCount: 8,
    },
    {
      runId: RUN_COMPETITOR,
      agentName: 'Spend Leak',
      agentEmoji: '💧',
      finishedLabel: 'Apr 8',
      findingsCount: 3,
    },
    {
      runId: RUN_COMPETITOR,
      agentName: 'Buyer Journey',
      agentEmoji: '🧭',
      finishedLabel: 'Apr 4',
      findingsCount: 4,
    },
  ],
};

// ─── Fallback stub — every other project, weekly only ─────────────────────
// Keeps the route working when navigated from any other project's brief link.
// Numbers are illustrative; replace with real data when adopting per-project.
function stub(projectId: string, name: string): ProjectBrief {
  return {
    projectId,
    period: 'week',
    periodLabel: 'Week of May 11–17',
    prevPeriodLabel: 'vs. May 4–10',
    generatedAt: 'Updated this morning',
    narrative:
      `${name} ran a steady week. Performance held against the prior period and the team has a small backlog of action items waiting on a decision. Pull the full reports below for the specifics.`,
    numbers: [
      { label: 'Conv-value',  value: '—',  delta: '—', deltaTone: 'neutral', spark: [50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50] },
      { label: 'Conversions', value: '—',  delta: '—', deltaTone: 'neutral', spark: [50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50] },
      { label: 'CPA',         value: '—',  delta: '—', deltaTone: 'neutral', spark: [50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50] },
      { label: 'Spend',       value: '—',  delta: '—', deltaTone: 'neutral', spark: [50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50] },
    ],
    wins: [],
    needs: [],
    receipts: [],
  };
}

// ─── Public API ───────────────────────────────────────────────────────────
export function getBrief(projectId: string, period: BriefPeriod, projectName: string): ProjectBrief {
  if (projectId === 'boulder-care') {
    return period === 'month' ? BOULDER_MONTH : BOULDER_WEEK;
  }
  // Other projects only have a weekly stub for now.
  return stub(projectId, projectName);
}
