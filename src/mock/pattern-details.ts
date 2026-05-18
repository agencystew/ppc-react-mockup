/* Per-pattern detail mock for /patterns/:id.
 *
 * The list page (mock/patterns.ts) is the source of truth for the spine
 * (headline / whatWeFound / drivenBy / affected / recommended). This file
 * adds the second-layer detail content the detail page needs — the read,
 * the recognised signal timeline, the meaning paragraphs, the caveat
 * panel, the cited evidence, and the suggested follow-up questions.
 *
 * Each detail entry is intentionally short — these are mock fixtures, not
 * production prose. The shape is what matters: the detail page reads from
 * here, falls back to derive sensibly from PATTERNS where a field is
 * missing. */

export interface TimelineSignal {
  /** Short numeric / qualitative tag rendered above each dot.
   *  e.g. "CPC +18%", "CVR -11%", "proof below fold". */
  label: string;
}

export type FindingIcon =
  | 'traffic'
  | 'proof'
  | 'cvr'
  | 'follow-up'
  | 'spend'
  | 'auction'
  | 'cohort'
  | 'ad-copy'
  | 'attribution'
  | 'budget'
  | 'shopping';

export interface PatternFinding {
  icon: FindingIcon;
  title: string;
  body: string;
}

export interface EvidenceItem {
  source: string;
  body: string;
}

export interface PatternDetail {
  /** Slot for the icon shown in the hero. Picked from a small set in the
   *  detail page so we don't carry component references through the mock. */
  iconKey: 'magnifier' | 'wrench' | 'calendar' | 'users' | 'trend';
  /** Optional override of the list-page headline when the detail page
   *  needs a more specific framing (e.g. "Leaky landing pages…" instead of
   *  "Trust proof gaps across high-ticket lead gen"). */
  altHeadline?: string;
  /** Receipts count rendered in the hero meta row. drivenBy counts give a
   *  reasonable derivation but this lets us hand-pin a number. */
  receiptsCount: number;
  /** Date string rendered in the hero meta row. */
  surfacedOn: string;
  /** The diagnosis paragraph — the PPC.io read panel body. */
  read: string;
  /** The 5 signal labels above the timeline dots. */
  timeline: TimelineSignal[];
  /** The 4 finding tiles below the timeline. */
  findings: PatternFinding[];
  /** The "What it means" paragraphs (1-3 short paragraphs). */
  meaning: string[];
  /** The orange "Still soft" caveat panel. */
  caveat: {
    title: string;
    body: string[];
  };
  /** The 5 numbered receipts in the sidebar. */
  evidence: EvidenceItem[];
  /** 3 suggested follow-up questions in the Ask PPC.io sidebar card. */
  questions: string[];
}

export const PATTERN_DETAILS: Record<string, PatternDetail> = {
  /* p-01 — Three SEO-tool accounts hit by the same paid-auction shift. */
  'p-01': {
    iconKey: 'magnifier',
    receiptsCount: 4,
    surfacedOn: '2026-05-16',
    read: 'Two dominant paid bidders pulled back ~30% in your SEO-tool vertical. The read is strongest on shared non-brand queries, where CPC has softened 10–15% before agency advertisers start filling the gap on brand terms.',
    timeline: [
      { label: 'budget cut -30%' },
      { label: 'CPC -12%' },
      { label: 'shared queries' },
      { label: '14-day window' },
      { label: 'brand bid risk' },
    ],
    findings: [
      { icon: 'spend',      title: 'Budget pullback', body: 'Two dominant bidders cut paid-search spend ~30% over the last 21 days.' },
      { icon: 'auction',    title: 'Softer CPC',      body: 'Shared non-brand auctions are clearing 10–15% cheaper across all three accounts.' },
      { icon: 'traffic',    title: 'Opportunity window', body: 'Roughly 14 days before smaller agency bidders move in on brand queries.' },
      { icon: 'attribution', title: 'Brand defence',   body: 'Day-14 impression share is the canary — watch it before the window closes.' },
    ],
    meaning: [
      'When dominant paid bidders retreat in a vertical, the auction softens before competitors fill the void. Mid-tier accounts in the same auction see a temporary CPC dip on shared queries.',
      'The window typically closes inside two weeks — once smaller agency advertisers notice, brand-bidding pressure starts on protected brand queries.',
    ],
    caveat: {
      title: 'Still soft',
      body: [
        'Treat this as a 14-day opportunity, not a structural shift.',
        'Watch brand impression share on day 14 — that is the leading signal that the cheap window is closing.',
      ],
    },
    evidence: [
      { source: 'Competitor Spy',     body: 'Three runs flagged the same auction-share shift independently.' },
      { source: 'Google Ads',         body: 'CPC fell 10–15% on the affected non-brand queries.' },
      { source: 'Search terms',       body: 'Auction overlap is concentrated on three head terms.' },
      { source: 'Audit history',      body: 'Similar pullback happened in this vertical last winter.' },
      { source: 'Business context',   body: 'SEO-tool brands compete on the same evergreen non-brand queries.' },
    ],
    questions: [
      'Which queries got cheaper?',
      'When did the pullback start?',
      'How should I sequence bid lifts?',
    ],
  },

  /* p-02 — Weekend daypart leak across three verticals. */
  'p-02': {
    iconKey: 'calendar',
    receiptsCount: 5,
    surfacedOn: '2026-05-15',
    read: 'Three unrelated accounts are all paying a weekend premium for empty auctions. Weekend CPA is running 22–35% above weekday, with the same competitors bidding the same hours every Sat–Sun.',
    timeline: [
      { label: 'Sat/Sun CPA +28%' },
      { label: 'flat CVR' },
      { label: 'same competitors' },
      { label: 'every weekend' },
      { label: '~$1.2K/mo leak' },
    ],
    findings: [
      { icon: 'budget',     title: 'CPA divergence',   body: 'Weekend CPA running 22–35% above the weekday baseline.' },
      { icon: 'cvr',        title: 'CVR holds',        body: 'Conversion rate steady — this is an auction-price problem, not a demand one.' },
      { icon: 'cohort',     title: 'Same competitors', body: 'The same advertisers bid up every Saturday and Sunday.' },
      { icon: 'spend',      title: 'Recoverable spend', body: 'Conservative dayparting clawback ~$1,200/mo across the three accounts.' },
    ],
    meaning: [
      'Weekend lifts here are predictable demand, but the auction is too — the same advertisers bid up every weekend window.',
      'A –15% Sat/Sun bid modifier on one account, run for two weeks, gives you a clean read before scaling to the other two.',
    ],
    caveat: {
      title: 'Still soft',
      body: [
        'Two of the three accounts are inferred from spend-curve shape, not confirmed by Change Impact.',
        'Test on one before generalising — verticals can hide structural weekend demand that you do not want to suppress.',
      ],
    },
    evidence: [
      { source: 'Change Impact',  body: 'Edinburgh confirmed directly; the others share the same spend-curve shape.' },
      { source: 'Spend Leak',     body: 'Weekend CPA elevated across all three accounts in the cross-reference.' },
      { source: 'Audit history',  body: 'Pattern was not visible at 7-day granularity — only emerged on 30-day rolling.' },
      { source: 'Business context', body: 'Travel and personal-care verticals have predictable weekend demand cycles.' },
      { source: 'Auction insights', body: 'Same three competitors top the auction every Sat/Sun.' },
    ],
    questions: [
      'Which competitors bid up the most?',
      'What time window is safest to discount?',
      'How would CPA shift if we cut 20% on Sundays?',
    ],
  },

  /* p-03 — PMAX intent drift across two SaaS accounts. */
  'p-03': {
    iconKey: 'wrench',
    receiptsCount: 5,
    surfacedOn: '2026-05-14',
    read: 'PMAX is matching research-stage queries on both SaaS accounts and spending on "free", "how to", and "tutorial" terms that converted at 0%. The same root cause is showing up twice — a missing shared negative library.',
    timeline: [
      { label: '$300+ spent' },
      { label: '0% CVR queries' },
      { label: 'research intent' },
      { label: 'same vertical' },
      { label: 'shared negatives gap' },
    ],
    findings: [
      { icon: 'spend',       title: 'Intent leakage',   body: 'PMAX spent >$300/account on free / how-to / tutorial queries.' },
      { icon: 'cvr',         title: '0% conversion',    body: 'Every matched research-stage query converted at zero.' },
      { icon: 'cohort',      title: 'Same vertical',    body: 'Both accounts sit in your SaaS book — this is a posture issue, not an account issue.' },
      { icon: 'attribution', title: 'No shared library', body: 'PMAX is aggressive without a cross-account negatives baseline.' },
    ],
    meaning: [
      'PMAX behaves like broad match when there is no shared negative library. Two accounts in the same vertical hitting the same pattern is the signal — fix it once at the vertical level, not twice per account.',
      'Future SaaS clients will inherit the same problem on day one unless the negatives become part of the SaaS onboarding template.',
    ],
    caveat: {
      title: 'Still soft',
      body: [
        'Validate that the queries are genuinely research-stage and not branded long-tail for the products themselves.',
        'Some "tutorial" queries do convert for free-trial SaaS — read the search-term report account by account before excluding wholesale.',
      ],
    },
    evidence: [
      { source: 'Deep Account Audit',   body: 'Both Durable and Flock flagged the same intent drift on PMAX.' },
      { source: 'Spend Leak',           body: 'Cross-reference confirmed the affected query patterns are identical.' },
      { source: 'Search terms',         body: 'Free / how-to / tutorial terms dominate the matched-queries list.' },
      { source: 'Audit history',        body: 'Two earlier audits flagged this on individual accounts without joining the dots.' },
      { source: 'Business context',     body: 'Both SaaS accounts have free trials — research intent looks similar to evaluation intent.' },
    ],
    questions: [
      'Which queries should we exclude first?',
      'How would a shared negative library affect impressions?',
      'Do free-trial queries convert on the second touch?',
    ],
  },

  /* p-04 — Leaky landing pages / proof gaps. The showcase pattern in the screenshot. */
  'p-04': {
    iconKey: 'magnifier',
    altHeadline: 'Leaky landing pages are showing up across lead-gen accounts',
    receiptsCount: 6,
    surfacedOn: '2026-05-18',
    read: 'Several accounts are paying for qualified clicks, but the pages are not carrying enough proof above the fold. The read is strongest where CPCs rose and conversion rate softened after traffic volume increased.',
    timeline: [
      { label: 'CPC +18%' },
      { label: 'CVR -11%' },
      { label: 'proof below fold' },
      { label: 'comparison queries' },
      { label: 'prior reviews' },
    ],
    findings: [
      { icon: 'traffic',    title: 'Traffic lift',       body: 'Paid traffic increased across these accounts.' },
      { icon: 'proof',      title: 'Proof gap',          body: 'Key proof is below the first viewport.' },
      { icon: 'cvr',        title: 'CVR softens',        body: 'Conversion rate drops vs prior period.' },
      { icon: 'follow-up',  title: 'Follow-up intent',   body: 'More comparison + trust queries appear.' },
    ],
    meaning: [
      'High-intent visitors need trust proof earlier to convert. When proof lives below the fold, visitors bounce or delay — both hurt conversion rate even when traffic quality is strong.',
      'Weak hero sections, delayed testimonials, and vague credibility are causing paid clicks to leak before form intent forms.',
    ],
    caveat: {
      title: 'Still soft',
      body: [
        'Treat this as a pattern worth reviewing, not a declared cause.',
        'CRM lead quality and recent page edits may change the read.',
      ],
    },
    evidence: [
      { source: 'Landing page agent', body: '5 pages have proof below first viewport.' },
      { source: 'Google Ads',         body: 'CPC rose while CVR softened.' },
      { source: 'Search terms',       body: 'Comparison and trust queries increased.' },
      { source: 'Audit history',      body: 'Similar pattern appeared in prior reviews.' },
      { source: 'Business context',   body: 'High-ticket offers need proof early.' },
    ],
    questions: [
      'Which pages are most exposed?',
      'What proof is missing?',
      'Show account split.',
    ],
  },

  /* p-05 — Competitor pullback opened non-brand auctions. */
  'p-05': {
    iconKey: 'trend',
    receiptsCount: 5,
    surfacedOn: '2026-05-12',
    read: 'A major competitor cut paid budget on three of your accounts in adjacent verticals, opening up cheaper non-brand auctions for the next two weeks. The pattern shows up cleanly in auction insights and CPC distribution.',
    timeline: [
      { label: 'competitor -40%' },
      { label: 'IS +12%' },
      { label: 'CPC -8%' },
      { label: 'non-brand only' },
      { label: '14-day window' },
    ],
    findings: [
      { icon: 'auction',    title: 'Auction softens',     body: 'Impression share on shared non-brand queries up 12% week over week.' },
      { icon: 'spend',      title: 'CPC drops',           body: 'Average non-brand CPC down 8% on the affected queries.' },
      { icon: 'cohort',     title: 'Adjacent verticals',  body: 'Three accounts in adjacent verticals all touched by the same competitor pullback.' },
      { icon: 'traffic',    title: 'Brand unaffected',    body: 'Brand auction is steady — the opportunity is on non-brand only.' },
    ],
    meaning: [
      'When a major competitor cuts paid spend, the auction softens for the next sprint but the gap closes quickly. Acting in the first 14 days is what matters.',
      'Use the window for non-brand expansion — brand auctions remain untouched and do not benefit from lifting bids there.',
    ],
    caveat: {
      title: 'Still soft',
      body: [
        'Auction insights lag by 24-48 hours — the window may already be narrower than it appears.',
        'Three accounts share the same vertical — if you lift on all three, you become the new competitor.',
      ],
    },
    evidence: [
      { source: 'Competitor Spy',  body: 'Direct auction-share confirmation across all three accounts.' },
      { source: 'Google Ads',      body: 'CPC distribution shifted cleanly the same week the competitor pulled back.' },
      { source: 'Search terms',    body: 'Non-brand head terms are the ones with the biggest softening.' },
      { source: 'Audit history',   body: 'Same competitor pulled back briefly six months ago — gap closed in 18 days.' },
      { source: 'Business context', body: 'These three accounts sit in adjacent verticals with overlapping non-brand intent.' },
    ],
    questions: [
      'Which non-brand queries soft enough to bid harder on?',
      'How long did the last pullback last?',
      'Should I push all three accounts at once?',
    ],
  },
};
