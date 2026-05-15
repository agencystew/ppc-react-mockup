// Discovery data + types for the v4 summary redesign.
//
// One Discovery = one self-contained finding + its paired recommendation.
// Replaces v1's split of FindingTiles[] + RecRow[] (two disconnected sections)
// with a single stacked feed where each row is the full atom.
//
// This file is the canonical source for the Discovery shape — SummaryV4.tsx
// imports both the types and the demo data from here. Authored by hand to
// demonstrate the four headline shapes (verdict / fact / gap / pattern) the
// agent should produce in production.
//
// Headline discipline: every headline either names a number, names a specific
// thing, or takes a position. The shape flexes by what kind of finding it is —
// see docs/plans/2026-05-15-summary-section-v4-design.md.

export type HeadlineShape = 'verdict' | 'fact' | 'gap' | 'pattern';

export interface Discovery {
  id: string;
  shape: HeadlineShape;
  severity: 'high' | 'medium' | 'low';

  // The claim + its proof. Numbers in `body` auto-highlight inside
  // SummaryV4's ProofProse renderer — no markup needed in the string.
  headline: string;
  body: string;

  // The paired recommendation — every Discovery has all three.
  do: string;          // specific action with target
  expect: string;      // quantified outcome
  effort: string;      // time + scope hint
  cta: string;         // verb on the primary button

  // Provenance — matters when this same card is later re-rendered
  // inside the Key Discoveries cross-report aggregator.
  agent: string;
  projectName: string;
  finishedLabel: string;     // "14d ago"
  toolCalls: number;
  dataPointsLabel: string;   // "120 data points · 8 rivals × 15 keywords"
}

export const COMPETITOR_SPY_DISCOVERIES: Discovery[] = [
  // ─── VERDICT shape ───────────────────────────────────────────────────
  // Finding diagnoses the cause (QS, not budget). Takes a position.
  {
    id: 'd-1',
    shape: 'verdict',
    severity: 'high',
    headline: 'Quality Score is the bottleneck — not your budget.',
    body:
      "Top 3 rivals control 64% of impression share on your core terms. " +
      "You're absent from 41% of those auctions, but bid analysis shows " +
      "you're losing on ad rank — not on bid ceiling.",
    do: 'Raise QS on 14 keywords by tightening ad → keyword alignment across your 3 top-spending ad groups.',
    expect: '+14% impression share · ~$1.8K/mo recovered',
    effort: '~2h · one structural change',
    cta: 'Apply',
    agent: 'Competitor Spy',
    projectName: 'Boulder Care',
    finishedLabel: '14d ago',
    toolCalls: 18,
    dataPointsLabel: '120 data points · 8 rivals × 15 keywords',
  },

  // ─── GAP shape ───────────────────────────────────────────────────────
  // Finding is whitespace — the strongest unclaimed angle in the market.
  {
    id: 'd-2',
    shape: 'gap',
    severity: 'high',
    headline: 'No rival owns "same-day case review" — the strongest unclaimed angle in your market.',
    body:
      '3 rivals run adjacent timeline-based copy at 0.4%+ CTR. ' +
      'The same-day angle itself is empty — no advertiser is leading with it on any of your top 12 keywords.',
    do: 'Build 3 RSAs around "same-day case review" across your top 3 keyword themes (personal injury, accident, workers comp).',
    expect: '+15% CTR on top 3 keywords · ~$2.1K/mo new headroom',
    effort: '~4h · 3 new ad variants',
    cta: 'Draft variants',
    agent: 'Competitor Spy',
    projectName: 'Boulder Care',
    finishedLabel: '14d ago',
    toolCalls: 9,
    dataPointsLabel: '11 unclaimed angles · CTR benchmarks',
  },

  // ─── FACT shape ──────────────────────────────────────────────────────
  // Finding IS the number — confirmed, no diagnosis layer needed.
  {
    id: 'd-3',
    shape: 'fact',
    severity: 'medium',
    headline: "3 of your 8 active rivals weren't on your radar.",
    body:
      'Smith & Associates and Cleveland Injury Group are the most consistent bidders on your top terms, ' +
      'both growing month-over-month. Ohio PI joined the auction in the last 90 days.',
    do: 'Add Smith, Cleveland Injury Group, and Ohio PI to your tracked competitor list. Weekly snapshot kicks in Monday.',
    expect: 'Continuous visibility into 3 new rivals · weekly drift alerts',
    effort: '~5 min · one-time setup',
    cta: 'Add to watchlist',
    agent: 'Competitor Spy',
    projectName: 'Boulder Care',
    finishedLabel: '14d ago',
    toolCalls: 47,
    dataPointsLabel: '8 rivals · 12 keywords · 84 SERPs',
  },

  // ─── PATTERN shape ───────────────────────────────────────────────────
  // Finding is a recurring theme across all rivals — position is exhausted.
  {
    id: 'd-4',
    shape: 'pattern',
    severity: 'medium',
    headline: 'All 8 rivals lead with "no fee unless we win" — the position is exhausted.',
    body:
      'None of the 8 rivals mention recent settlement amounts or case timelines in their headlines. ' +
      'Both are unclaimed differentiators worth A/B testing against your "no fee" control.',
    do: 'Spin up an A/B test in your top campaign: 2 control RSAs ("no fee unless we win") vs 2 variant RSAs ("$2.4M recovered this year").',
    expect: 'Baseline CTR 2.8% → ?  ·  test result in 14d',
    effort: '~3h setup · 14d run',
    cta: 'Spin up test',
    agent: 'Competitor Spy',
    projectName: 'Boulder Care',
    finishedLabel: '14d ago',
    toolCalls: 32,
    dataPointsLabel: '47 ad variants · 8 rivals',
  },
];
