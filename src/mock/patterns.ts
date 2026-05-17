/* Cross-project pattern synthesis data.
 *
 * Shared between /patterns (full editorial spread) and the
 * dashboard's PatternsLiveStrip (top-3 preview). Single source so
 * the two surfaces never disagree on what's been spotted.
 *
 * `spotted` is optional and only populated on the top patterns the
 * strip surfaces; the full /patterns shelf does not render it. */

export interface AffectedProject {
  id: string;
  name: string;
}

export interface PatternDriver {
  agentName: string;
  agentEmoji: string;
  findingsCount: number;
  modifier?: string;
}

export interface Pattern {
  id: string;
  rank: number;
  category: string;
  headline: string;
  whatWeFound: string;
  whyItMatters: string;
  affected: AffectedProject[];
  drivenBy: PatternDriver[];
  recommendedAction: string;
  recommendedActionCta: string;
  spotted?: string; // e.g. "12 min ago", "Tue", "today"
}

export const PATTERNS: Pattern[] = [
  {
    id: 'p-01',
    rank: 1,
    category: 'Paid auction shift',
    headline: "Three SEO-tool accounts hit by the same paid-auction shift.",
    whatWeFound:
      "Both SEMrush and Ahrefs cut their paid-search budgets by ~30% over the last 21 days. The HOTH, LinkBuilder.io, and Authority Builders all bid against the same paid queries — three Competitor Spy runs surfaced the dynamic across the three accounts independently.",
    whyItMatters:
      "When dominant paid bidders pull back, mid-tier accounts in the same auction see a brief CPC dip (10–15% downwind on shared queries) followed by smaller agency advertisers filling the gap with brand-bidding. The window to capture cheaper non-brand traffic is roughly 14 days; after that the agency-bid pressure starts on brand queries.",
    affected: [
      { id: 'the-hoth',           name: 'The HOTH' },
      { id: 'linkbuilder',        name: 'LinkBuilder.io' },
      { id: 'authority-builders', name: 'Authority Builders' },
    ],
    drivenBy: [
      { agentName: 'Competitor Spy',     agentEmoji: '🕵️', findingsCount: 3 },
      { agentName: 'Google Ads Context', agentEmoji: '🩺', findingsCount: 1 },
    ],
    recommendedAction:
      "Lift non-brand Search bids 10–15% across all three accounts for the next 14 days while CPCs are soft. Set a calendar reminder to check brand-search impression share on day 14 — that's when agency-bid pressure typically starts.",
    recommendedActionCta: 'Lift non-brand bids across all three',
    spotted: '12 min ago',
  },
  {
    id: 'p-02',
    rank: 2,
    category: 'Weekend daypart leak',
    headline: 'Three accounts pay extra to advertise into empty weekends.',
    whatWeFound:
      "Flock-Edinburgh, Edwin Novel Jewelry, and LivingYoung Center all show 30-day weekend CPA running 22–35% above weekday. Change Impact confirmed Edinburgh's pattern explicitly; the other two are inferred from spend curves with the same shape.",
    whyItMatters:
      "Weekend lifts on these verticals are predictable demand, but the auction is too — the same competitors bid up every Sat–Sun. Dayparting Sat/Sun at −15% would conservatively recover ~$1,200/mo across the three without touching conversion volume. Worth running on one first.",
    affected: [
      { id: 'flock',       name: 'Flock' },
      { id: 'edwin-novel', name: 'Edwin Novel Jewelry' },
      { id: 'livingyoung', name: 'LivingYoung Center' },
    ],
    drivenBy: [
      { agentName: 'Change Impact', agentEmoji: '🔬', findingsCount: 3, modifier: '1 confirmed · 2 inferred' },
      { agentName: 'Spend Leak',    agentEmoji: '💧', findingsCount: 1, modifier: 'cross-reference' },
    ],
    recommendedAction:
      "Test a −15% Sat/Sun bid modifier on one account for two weeks, then expand if the conversion curve holds.",
    recommendedActionCta: 'Set up the daypart test',
    spotted: 'today',
  },
  {
    id: 'p-03',
    rank: 3,
    category: 'PMAX intent drift',
    headline: 'PMAX is feeding both your SaaS accounts queries far from buyer intent.',
    whatWeFound:
      "Durable and Flock PMAX campaigns both spent >$300 in the last 30 days on 'free' / 'how to' / 'tutorial' queries that converted at 0%. The Deep Account Audit on each flagged it as a single-account issue — but it's the same root cause showing up twice.",
    whyItMatters:
      "PMAX's broad-match equivalent gets aggressive when there's no shared negative library. Two accounts in your SaaS book hitting the same pattern is a posture problem, not a one-off — likely worth a shared-list approach across the whole vertical.",
    affected: [
      { id: 'durable', name: 'Durable' },
      { id: 'flock',   name: 'Flock' },
    ],
    drivenBy: [
      { agentName: 'Deep Account Audit', agentEmoji: '🔎', findingsCount: 2 },
      { agentName: 'Spend Leak',         agentEmoji: '💧', findingsCount: 1 },
    ],
    recommendedAction:
      "Propose a shared negative-keyword library for your SaaS clients — both accounts inherit it, future clients in the vertical inherit it on day one.",
    recommendedActionCta: 'Draft the shared negative library',
    spotted: 'Mon',
  },
  {
    id: 'p-04',
    rank: 4,
    category: 'Vertical-wide brand erosion',
    headline: 'Paid brand impression share is slipping across both health-vertical accounts.',
    whatWeFound:
      "Weekly Audit ran for Boulder Care and LivingYoung Center this week. Both saw paid brand-search impression share drop 6–9% MoM, both with Quality Scores holding steady. Different accounts, different competitors — identical curve.",
    whyItMatters:
      "When two unrelated accounts in the same vertical show simultaneous brand-paid erosion with no audit-side cause, it's usually a market signal — a category trend, a competitor entering the brand-bidding game, or seasonal demand. One cross-account investigation will resolve it faster than two separate.",
    affected: [
      { id: 'boulder-care', name: 'Boulder Care' },
      { id: 'livingyoung',  name: 'LivingYoung Center' },
    ],
    drivenBy: [
      { agentName: 'Weekly Audit', agentEmoji: '📈', findingsCount: 2, modifier: 'same week, both accounts' },
    ],
    recommendedAction:
      "Run a single cross-account brand auction-insights pull on both. If a new competitor is bidding on both brands, defensive brand campaigns become the next move.",
    recommendedActionCta: 'Run cross-account auction insights',
    spotted: 'Sun',
  },
  {
    id: 'p-05', rank: 5, category: 'PMAX intent drift',
    headline: 'Both SaaS accounts spent on "free" / "how to" queries this week.',
    whatWeFound: "Durable and Flock PMAX both spent $300+ on top-of-funnel education queries (\"free website builder\", \"how does SaaS pricing work\") that converted at 0% in the last 30 days.",
    whyItMatters: "Two accounts hitting the same broad-match drift suggests it's a PMAX posture issue, not random. A shared negative-keyword library across the SaaS book solves both at once.",
    affected: [{ id: 'durable', name: 'Durable' }, { id: 'flock', name: 'Flock' }],
    drivenBy: [{ agentName: 'Deep Account Audit', agentEmoji: '🔎', findingsCount: 2 }, { agentName: 'Spend Leak', agentEmoji: '💧', findingsCount: 1 }],
    recommendedAction: "Build a shared negative-keyword list for SaaS clients and apply to both PMAX campaigns.",
    recommendedActionCta: 'Draft the shared negative list',
  },
  {
    id: 'p-06', rank: 6, category: 'Weekend daypart leak',
    headline: 'Three accounts pay extra to advertise into empty weekends.',
    whatWeFound: "Flock-Edinburgh, Edwin Novel Jewelry, and LivingYoung Center all show 30-day weekend CPA running 22–35% above weekday. Change Impact confirmed Edinburgh explicitly; the other two inferred from spend curves with the same shape.",
    whyItMatters: "Weekend lifts are predictable demand but the auction is too. A −15% Sat/Sun bid modifier conservatively recovers ~$1,200/mo across the three without touching conversion volume.",
    affected: [{ id: 'flock', name: 'Flock' }, { id: 'edwin-novel', name: 'Edwin Novel Jewelry' }, { id: 'livingyoung', name: 'LivingYoung Center' }],
    drivenBy: [{ agentName: 'Change Impact', agentEmoji: '🔬', findingsCount: 3, modifier: '1 confirmed · 2 inferred' }, { agentName: 'Spend Leak', agentEmoji: '💧', findingsCount: 1 }],
    recommendedAction: "Run a −15% Sat/Sun bid modifier on Flock first for two weeks. Expand to the other two if the conversion curve holds.",
    recommendedActionCta: 'Set up the daypart test',
  },
  {
    id: 'p-07', rank: 7, category: 'Conversion tracking gap',
    headline: 'Five accounts have GCLID drop-off above 14% — attribution is leaking.',
    whatWeFound: "Boulder Care, Durable, LinkBuilder, LivingYoung, and Edwin Novel all show 14–22% of conversions arriving without a GCLID in the last 30 days. Industry baseline sits around 6–8%.",
    whyItMatters: "Lost GCLIDs starve Smart Bidding of signal. Five accounts at the same loss rate looks like a tag-template problem, not five independent bugs — probably a consent-mode mis-configuration.",
    affected: [{ id: 'boulder-care', name: 'Boulder Care' }, { id: 'durable', name: 'Durable' }, { id: 'linkbuilder', name: 'LinkBuilder.io' }, { id: 'livingyoung', name: 'LivingYoung Center' }, { id: 'edwin-novel', name: 'Edwin Novel Jewelry' }],
    drivenBy: [{ agentName: 'Google Ads Context', agentEmoji: '🩺', findingsCount: 5 }],
    recommendedAction: "Audit the shared GTM consent-mode template. Fix once, propagate to all five accounts.",
    recommendedActionCta: 'Audit shared GTM template',
  },
  {
    id: 'p-08', rank: 8, category: 'Bid strategy regression',
    headline: 'Two accounts auto-shifted from Target CPA to Max Conversions and CPA jumped.',
    whatWeFound: "The HOTH and Boulder Care both got Google's recommendation banner accepted on May 10 — bid strategy moved from tCPA to Max Conversions. Both saw CPA up 18–38% in the following 7 days.",
    whyItMatters: "The recommendation banner is often clicked on autopilot. Two accounts caught in the same week suggests a team-wide habit, not isolated mistakes. Worth a written rule before approving any future bid-strategy nudges.",
    affected: [{ id: 'the-hoth', name: 'The HOTH' }, { id: 'boulder-care', name: 'Boulder Care' }],
    drivenBy: [{ agentName: 'Change Impact', agentEmoji: '🚨', findingsCount: 2 }],
    recommendedAction: "Revert both to tCPA at the prior target. Add to AI Instructions: never accept bid-strategy nudges without manual review.",
    recommendedActionCta: 'Revert both bid strategies',
  },
  {
    id: 'p-09', rank: 9, category: 'Quality Score erosion',
    headline: 'Quality Score on shared non-brand keywords dropped on two SEO accounts in 48 hours.',
    whatWeFound: "The HOTH and LinkBuilder.io share several non-brand keywords ('seo services', 'backlink builder'). Both saw QS on those keywords drop 7.8 → 6.9 between May 14 and May 16 — same 48-hour window.",
    whyItMatters: "Simultaneous QS drops on shared keywords usually mean Google reweighted expected-CTR for those queries (a market shift), not landing-page issues on either account. Look for the auction-side cause before touching LPs.",
    affected: [{ id: 'the-hoth', name: 'The HOTH' }, { id: 'linkbuilder', name: 'LinkBuilder.io' }],
    drivenBy: [{ agentName: 'Weekly Audit', agentEmoji: '📈', findingsCount: 2 }],
    recommendedAction: "Pull auction insights on the shared keywords for May 14–16. Is a new bidder driving down expected-CTR signals?",
    recommendedActionCta: 'Investigate shared-keyword auctions',
  },
  {
    id: 'p-10', rank: 10, category: 'New competitor entry',
    headline: 'A new advertiser is bidding on three of your brand terms this week.',
    whatWeFound: "Auction insights show a new domain (joinpathway.com) appearing in the top-4 positions for Boulder Care, LivingYoung, and Authority Builders brand queries — all in the last 7 days.",
    whyItMatters: "Same advertiser, three of your accounts, same week — they're running a targeted competitive campaign. They'll either fade or commit; either way, defensive brand campaigns on all three are now the conservative move.",
    affected: [{ id: 'boulder-care', name: 'Boulder Care' }, { id: 'livingyoung', name: 'LivingYoung Center' }, { id: 'authority-builders', name: 'Authority Builders' }],
    drivenBy: [{ agentName: 'Competitor Spy', agentEmoji: '🕵️', findingsCount: 3 }],
    recommendedAction: "Spin up defensive brand-bid campaigns on all three accounts. Monitor for 14 days — if joinpathway holds position, raise brand bids; if they fade, dial back.",
    recommendedActionCta: 'Set up defensive brand bids',
  },
  {
    id: 'p-11', rank: 11, category: 'Match-type drift',
    headline: 'Four accounts are seeing broad-match expansion eat exact-match traffic.',
    whatWeFound: "Search-term reports for Boulder Care, Durable, Flock, and Edwin Novel show 18–34% of paid clicks now coming from broad-match-routed queries that historically converted on exact-match. Same pattern across four verticals.",
    whyItMatters: "Google's been quietly expanding broad-match reach across the board since Q1. Exact-match keywords are still in the campaign, but Google is increasingly routing the click through broad. The CPA tax on the routing is real.",
    affected: [{ id: 'boulder-care', name: 'Boulder Care' }, { id: 'durable', name: 'Durable' }, { id: 'flock', name: 'Flock' }, { id: 'edwin-novel', name: 'Edwin Novel Jewelry' }],
    drivenBy: [{ agentName: 'Negative Keyword', agentEmoji: '🧹', findingsCount: 4 }, { agentName: 'Spend Leak', agentEmoji: '💧', findingsCount: 2 }],
    recommendedAction: "Mass-add broad-match keyword negatives for the queries that should route exact. Build the shared list once across the four accounts.",
    recommendedActionCta: 'Build the cross-account negatives list',
  },
  {
    id: 'p-12', rank: 12, category: 'RSA fatigue',
    headline: 'Top-rated RSAs are stale on five accounts — CTRs flattening 0.4pp month-over-month.',
    whatWeFound: "Ad Copy agent ran across Boulder Care, The HOTH, Durable, LinkBuilder, and Authority Builders. All five have 'BEST' rated RSAs that haven't had a headline swap in 90+ days. CTRs on the stale RSAs are 0.3–0.5pp below the account average over the last 30 days.",
    whyItMatters: "RSAs decay. Five accounts in the same window suggests it's a roster-wide refresh cadence problem, not five individual oversights. A quarterly RSA refresh built into the schedule fixes the pattern, not the symptom.",
    affected: [{ id: 'boulder-care', name: 'Boulder Care' }, { id: 'the-hoth', name: 'The HOTH' }, { id: 'durable', name: 'Durable' }, { id: 'linkbuilder', name: 'LinkBuilder.io' }, { id: 'authority-builders', name: 'Authority Builders' }],
    drivenBy: [{ agentName: 'Ad Copy', agentEmoji: '✍️', findingsCount: 5 }],
    recommendedAction: "Add a quarterly Ad Copy run to the schedule on every account. Backfill the five flagged here with fresh headline variants this week.",
    recommendedActionCta: 'Refresh RSAs on all five',
  },
  {
    id: 'p-13', rank: 13, category: 'Audience signal opportunity',
    headline: 'Three PMAX campaigns have unused first-party audience signals.',
    whatWeFound: "Durable, Flock, and Boulder Care all have customer-match lists (1k+ users each) imported but not attached as audience signals to their PMAX campaigns.",
    whyItMatters: "PMAX uses audience signals as seed data — without them, the algorithm wanders longer before finding converters. Three accounts with the same gap = a setup-checklist problem, not random.",
    affected: [{ id: 'durable', name: 'Durable' }, { id: 'flock', name: 'Flock' }, { id: 'boulder-care', name: 'Boulder Care' }],
    drivenBy: [{ agentName: 'PMAX', agentEmoji: '🎯', findingsCount: 3 }],
    recommendedAction: "Attach the existing customer-match lists as audience signals on all three PMAX campaigns. 10-minute fix, multi-week payoff.",
    recommendedActionCta: 'Attach audience signals',
  },
  {
    id: 'p-14', rank: 14, category: 'Budget pacing imbalance',
    headline: 'Two accounts will overshoot monthly budget by Wednesday at current pace.',
    whatWeFound: "Budget Pacer flagged The HOTH and Edwin Novel Jewelry both pacing 11% above plan as of May 16. At current spend velocity, both hit their May caps by May 20.",
    whyItMatters: "Two accounts at the same overshoot pace this week probably trace to a shared event — either a verticals-wide CPC lift or a sale window where bids got pushed up across the book.",
    affected: [{ id: 'the-hoth', name: 'The HOTH' }, { id: 'edwin-novel', name: 'Edwin Novel Jewelry' }],
    drivenBy: [{ agentName: 'Budget Pacer', agentEmoji: '⏱️', findingsCount: 2 }],
    recommendedAction: "Dial daily caps down 12% on both for the rest of May. Diagnose the upstream cause next week.",
    recommendedActionCta: 'Adjust daily caps on both',
  },
  {
    id: 'p-15', rank: 15, category: 'Search lost impression share',
    headline: 'Four accounts lost 8–14% paid Search impression share to budget caps.',
    whatWeFound: "Boulder Care, Durable, LivingYoung, and Authority Builders all show Search IS Lost (budget) above 8% for the first time in 12 weeks. Same week.",
    whyItMatters: "Simultaneous budget-lost-IS across four unrelated accounts likely means CPCs lifted across multiple verticals — Google's auction is hotter this week than last. Worth a portfolio-level decision before raising budgets piecemeal.",
    affected: [{ id: 'boulder-care', name: 'Boulder Care' }, { id: 'durable', name: 'Durable' }, { id: 'livingyoung', name: 'LivingYoung Center' }, { id: 'authority-builders', name: 'Authority Builders' }],
    drivenBy: [{ agentName: 'Weekly Audit', agentEmoji: '📈', findingsCount: 4 }],
    recommendedAction: "Pull CPC trends across all four for the last 14 days. If lifting budgets, lift on the highest-ROAS account first.",
    recommendedActionCta: 'Pull CPC trends across all four',
  },
  {
    id: 'p-16', rank: 16, category: 'Mobile vs Desktop divergence',
    headline: 'Mobile CPA on three accounts is now 40%+ above desktop.',
    whatWeFound: "Boulder Care, LivingYoung, and Edwin Novel all show mobile CPA running 40–58% above desktop CPA in the last 30 days. Desktop conversion rates held; mobile dropped 0.4–0.7pp on each.",
    whyItMatters: "Mobile traffic is converting worse across all three. Three accounts, three verticals, same direction = probably an LP issue (mobile load time, form friction) that traces to a shared LP framework.",
    affected: [{ id: 'boulder-care', name: 'Boulder Care' }, { id: 'livingyoung', name: 'LivingYoung Center' }, { id: 'edwin-novel', name: 'Edwin Novel Jewelry' }],
    drivenBy: [{ agentName: 'Landing Page', agentEmoji: '🌐', findingsCount: 3 }],
    recommendedAction: "Run Mobile PageSpeed audits on all three LPs. If load time is the issue, ship one fix that benefits all three.",
    recommendedActionCta: 'Audit mobile LPs',
  },
  {
    id: 'p-17', rank: 17, category: 'Geo over-spend',
    headline: 'Three accounts spent 20%+ of budget on geos that converted at half the account rate.',
    whatWeFound: "Flock spent 23% of last 30-day budget on Manchester (CPA $89 vs account $52); Durable spent 21% on Florida (CPA $124 vs $74); LivingYoung 28% on outlying ZIPs (CPA 60% above account average).",
    whyItMatters: "Geo over-spend on poorly-converting regions is usually a location-bid-adjustment that hasn't been touched since campaign launch. Three accounts at once suggests it's a setup-pattern, not a per-account oversight.",
    affected: [{ id: 'flock', name: 'Flock' }, { id: 'durable', name: 'Durable' }, { id: 'livingyoung', name: 'LivingYoung Center' }],
    drivenBy: [{ agentName: 'Spend Leak', agentEmoji: '💧', findingsCount: 3 }],
    recommendedAction: "Apply −25% location bid adjustments to the under-performing geos on all three. Recover the saved budget into core conversion regions.",
    recommendedActionCta: 'Apply geo bid adjustments',
  },
  {
    id: 'p-18', rank: 18, category: 'Negative-keyword gap',
    headline: 'Same six negative keywords would save five accounts $4K/mo combined.',
    whatWeFound: "Negative Keyword agent ran across Durable, Flock, LinkBuilder, LivingYoung, and Edwin Novel. All five show paid spend on 'free', 'jobs', 'careers', 'salary', 'login', 'pricing crashed' — six terms that converted at 0% across every account in the last 60 days.",
    whyItMatters: "Five accounts with the same negative gap = the negative-keyword playbook on this book is missing an account-level baseline. One shared list saves $4K/mo combined and prevents future drift.",
    affected: [{ id: 'durable', name: 'Durable' }, { id: 'flock', name: 'Flock' }, { id: 'linkbuilder', name: 'LinkBuilder.io' }, { id: 'livingyoung', name: 'LivingYoung Center' }, { id: 'edwin-novel', name: 'Edwin Novel Jewelry' }],
    drivenBy: [{ agentName: 'Negative Keyword', agentEmoji: '🧹', findingsCount: 5 }],
    recommendedAction: "Build a shared account-level negative-keyword baseline and apply across the five flagged. Backfill remaining accounts next week.",
    recommendedActionCta: 'Build the baseline negatives list',
  },
  {
    id: 'p-19', rank: 19, category: 'CTR cliff',
    headline: 'Two accounts saw CTR drop 0.6pp+ on the same day with no campaign changes.',
    whatWeFound: "The HOTH and Authority Builders both saw account-wide CTR drop 0.6–0.9pp on May 13 with no campaign changes on either side. No QS changes. No bid changes. No new competitors.",
    whyItMatters: "Two accounts in the same vertical, same-day CTR drop, no internal cause = likely a SERP-layout change from Google (a new module pushed paid lower on the page). Worth confirming before changing anything.",
    affected: [{ id: 'the-hoth', name: 'The HOTH' }, { id: 'authority-builders', name: 'Authority Builders' }],
    drivenBy: [{ agentName: 'Change Impact', agentEmoji: '🚨', findingsCount: 2 }],
    recommendedAction: "Spot-check the SERP layout for shared keywords on both accounts. If Google added a new module, document for the team and hold actions.",
    recommendedActionCta: 'Spot-check SERPs',
  },
  {
    id: 'p-20', rank: 20, category: 'Auction insights — new entrant',
    headline: 'Bicycle Health appeared in three of your accounts\' auction insights this week.',
    whatWeFound: "Bicycle Health (a telehealth-recovery competitor) now appears in the top-10 auction insights for Boulder Care, LivingYoung, and one of Flock's wellness ad groups — all in the last 7 days.",
    whyItMatters: "Bicycle Health has historically only competed with Boulder Care. Their expansion into adjacent verticals (med spa, wellness travel) is a clear strategic move. Watch for it to spread.",
    affected: [{ id: 'boulder-care', name: 'Boulder Care' }, { id: 'livingyoung', name: 'LivingYoung Center' }, { id: 'flock', name: 'Flock' }],
    drivenBy: [{ agentName: 'Competitor Spy', agentEmoji: '🕵️', findingsCount: 3 }],
    recommendedAction: "Tag Bicycle Health as a tracked competitor on all three accounts. Set up a weekly auction-insights check.",
    recommendedActionCta: 'Add Bicycle Health to watchlist',
  },
  {
    id: 'p-21', rank: 21, category: 'Asset rating drift',
    headline: 'PMAX asset ratings dropped to "Poor" on three accounts in one week.',
    whatWeFound: "PMAX Asset Review flagged Durable, Flock, and Boulder Care all with new \"Poor\" rated assets this week. Each account has 2–3 assets that were \"Best\" 30 days ago and rotated to \"Poor\" without changes on our side.",
    whyItMatters: "Asset ratings drift downward when Google's matching is no longer firing well with those assets. Three accounts at once usually means Google's PMAX algorithm shifted weight to other signals — refresh the assets, don't wait for ratings to recover.",
    affected: [{ id: 'durable', name: 'Durable' }, { id: 'flock', name: 'Flock' }, { id: 'boulder-care', name: 'Boulder Care' }],
    drivenBy: [{ agentName: 'PMAX', agentEmoji: '🎯', findingsCount: 3 }],
    recommendedAction: "Refresh the \"Poor\" rated headlines + descriptions on all three. New variants force re-evaluation against the current algorithm.",
    recommendedActionCta: 'Refresh PMAX assets',
  },
  {
    id: 'p-22', rank: 22, category: 'Brand competitor expansion',
    headline: 'A direct competitor is brand-bidding on two accounts simultaneously.',
    whatWeFound: "MeasureLab.io launched brand campaigns targeting both The HOTH brand and LinkBuilder.io brand on the same day (May 12). Top-3 position on both, no defensive brand campaigns running on either side.",
    whyItMatters: "Coordinated competitive brand-bidding on two unrelated accounts in your book = MeasureLab built a customer-poaching playbook and is running it across the SEO-software vertical.",
    affected: [{ id: 'the-hoth', name: 'The HOTH' }, { id: 'linkbuilder', name: 'LinkBuilder.io' }],
    drivenBy: [{ agentName: 'Competitor Spy', agentEmoji: '🕵️', findingsCount: 2 }],
    recommendedAction: "Spin up defensive brand-bidding on both accounts. Tag MeasureLab as a primary competitor in account context.",
    recommendedActionCta: 'Set up defensive brand bids',
  },
  {
    id: 'p-23', rank: 23, category: 'Conversion delay extension',
    headline: 'Conversion lag stretched 1.2 days on three accounts since May 1.',
    whatWeFound: "Boulder Care, Flock, and Authority Builders all show median click-to-conversion lag extending from 2.1 days to 3.3 days since May 1. Bid strategies are still optimising on the old lag.",
    whyItMatters: "Smart Bidding looks at recent conversion attribution windows. If lag has stretched but the bid algo doesn't know yet, it'll under-bid converting clicks (because they haven't attributed yet) and over-bid slow ones.",
    affected: [{ id: 'boulder-care', name: 'Boulder Care' }, { id: 'flock', name: 'Flock' }, { id: 'authority-builders', name: 'Authority Builders' }],
    drivenBy: [{ agentName: 'Change Impact', agentEmoji: '🔬', findingsCount: 3 }],
    recommendedAction: "Extend the conversion window on all three campaigns from 30 to 45 days. Give bidding visibility into the longer lag.",
    recommendedActionCta: 'Extend conversion windows',
  },
  {
    id: 'p-24', rank: 24, category: 'Shopping feed staleness',
    headline: 'Edwin Novel\'s Shopping feed has 23% disapproved items — pattern unique to the account.',
    whatWeFound: "Edwin Novel Jewelry's Shopping feed shows 23% of products in disapproved state this week (vs <5% account average for the last 6 months). Reasons skew toward GTIN missing.",
    whyItMatters: "Single-account pattern but high severity — flagged here for visibility, not for cross-account synthesis. Worth surfacing on the Patterns page because the cost is significant.",
    affected: [{ id: 'edwin-novel', name: 'Edwin Novel Jewelry' }],
    drivenBy: [{ agentName: 'Shopping Feed', agentEmoji: '🛒', findingsCount: 1 }],
    recommendedAction: "Re-pull the master GTIN file from the merchant's PIM. Re-feed to Merchant Center; disapprovals usually clear within 24h.",
    recommendedActionCta: 'Re-feed Merchant Center',
  },
  {
    id: 'p-25', rank: 25, category: 'Click fraud',
    headline: 'Three accounts show invalid-click rates 3x baseline this week.',
    whatWeFound: "Durable, LinkBuilder, and Authority Builders all show invalid-click percentage running 12–18% this week (vs ~4% account averages). Same three IP ranges flagged across all three accounts.",
    whyItMatters: "Same-IP invalid clicks across three of your accounts = a coordinated bot or scraper hitting your paid traffic. Google's auto-refund won't catch all of it; manual exclusion lists protect spend going forward.",
    affected: [{ id: 'durable', name: 'Durable' }, { id: 'linkbuilder', name: 'LinkBuilder.io' }, { id: 'authority-builders', name: 'Authority Builders' }],
    drivenBy: [{ agentName: 'Spend Leak', agentEmoji: '💧', findingsCount: 3 }],
    recommendedAction: "Add the three flagged IP ranges to the IP exclusion list on all three accounts. Set up auto-monitoring for similar patterns.",
    recommendedActionCta: 'Add IP exclusions',
  },
  {
    id: 'p-26', rank: 26, category: 'New-customer cohort decay',
    headline: 'New-customer LTV down 11% across the SaaS book this quarter.',
    whatWeFound: "Durable and Flock both report new-customer 90-day LTV down 9–13% compared to Q1 cohorts. Conversion volume held; revenue-per-converter softened.",
    whyItMatters: "If LTV is sliding but CPA is steady, the algorithm is buying lower-value customers — your tCPA targets are now over-paying for what each customer is worth. Worth recalibrating tCPA down across both accounts.",
    affected: [{ id: 'durable', name: 'Durable' }, { id: 'flock', name: 'Flock' }],
    drivenBy: [{ agentName: 'Profit Tracker', agentEmoji: '💸', findingsCount: 2 }],
    recommendedAction: "Lower tCPA targets 8–10% on both accounts to re-align with current LTV. Re-evaluate in 60 days.",
    recommendedActionCta: 'Lower tCPA on both',
  },
  {
    id: 'p-27', rank: 27, category: 'Bid-strategy regression',
    headline: 'Max Conversion Value beat tCPA on three accounts — strategy hasn\'t been updated.',
    whatWeFound: "A/B-style backtest across Boulder Care, The HOTH, and Authority Builders shows Max Conversion Value would have outperformed the current tCPA strategy on revenue terms over the last 90 days. Conversion counts equal; revenue 7–14% higher.",
    whyItMatters: "tCPA optimises for cost; Max Conv Value optimises for revenue. Three accounts where revenue beats CPA by enough to matter = the strategy fit has shifted.",
    affected: [{ id: 'boulder-care', name: 'Boulder Care' }, { id: 'the-hoth', name: 'The HOTH' }, { id: 'authority-builders', name: 'Authority Builders' }],
    drivenBy: [{ agentName: 'Deep Account Audit', agentEmoji: '🔎', findingsCount: 3 }],
    recommendedAction: "Switch to Max Conversion Value on one account first (most volume), monitor for 30 days, then propagate if it holds.",
    recommendedActionCta: 'Test Max Conv Value',
  },
  {
    id: 'p-28', rank: 28, category: 'PMAX channel attribution',
    headline: 'PMAX is taking credit for Search-driven conversions on two accounts.',
    whatWeFound: "On Durable and Boulder Care, PMAX shows 30%+ of its reported conversions also having a Search-keyword path within 7 days of conversion. Search campaigns aren't getting credit for clicks they earned.",
    whyItMatters: "PMAX cannibalises Search attribution unless you exclude branded queries from PMAX. Two accounts with the same overlap = the brand-exclusion setting is probably missing on both.",
    affected: [{ id: 'durable', name: 'Durable' }, { id: 'boulder-care', name: 'Boulder Care' }],
    drivenBy: [{ agentName: 'PMAX', agentEmoji: '🎯', findingsCount: 2 }],
    recommendedAction: "Add brand-keyword exclusions to PMAX on both accounts. Watch Search performance pick up over the following 14 days.",
    recommendedActionCta: 'Exclude brand from PMAX',
  },
  {
    id: 'p-29', rank: 29, category: 'Landing page experience',
    headline: 'Landing page experience dropped from "Above average" to "Average" on three accounts.',
    whatWeFound: "The HOTH, LinkBuilder, and Authority Builders all saw the LP-experience component of Quality Score drop a tier this week with no LP changes on our side.",
    whyItMatters: "Three accounts dropping at once on a metric you didn't change = a Google evaluation criteria shift, not three LP regressions. Worth surfacing before tactical LP changes get attempted.",
    affected: [{ id: 'the-hoth', name: 'The HOTH' }, { id: 'linkbuilder', name: 'LinkBuilder.io' }, { id: 'authority-builders', name: 'Authority Builders' }],
    drivenBy: [{ agentName: 'Weekly Audit', agentEmoji: '📈', findingsCount: 3 }],
    recommendedAction: "Hold tactical LP changes. Wait two weeks to see if it's a temporary recalibration. If sticky, run PageSpeed audits across all three.",
    recommendedActionCta: 'Hold LP changes for 2 weeks',
  },
  {
    id: 'p-30', rank: 30, category: 'Audience overlap leak',
    headline: 'Customer-match audiences overlap 38% between Durable and Flock.',
    whatWeFound: "Audience composition shows 38% overlap in customer-match lists between Durable and Flock. Both run separate prospecting campaigns; both are bidding against each other's customer list in the auction.",
    whyItMatters: "Two of your own accounts in the same auction = paying twice for the same eyeballs. Worth either excluding each other's customer lists from prospecting, or coordinating ad scheduling.",
    affected: [{ id: 'durable', name: 'Durable' }, { id: 'flock', name: 'Flock' }],
    drivenBy: [{ agentName: 'Buyer Journey', agentEmoji: '🛤️', findingsCount: 2 }],
    recommendedAction: "Exclude each account's customer-match list from the other's prospecting campaigns. 5-minute fix, ends the self-cannibalisation.",
    recommendedActionCta: 'Set cross-account exclusions',
  },
];
