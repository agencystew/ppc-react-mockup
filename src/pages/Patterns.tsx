import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, Compass, Sparkle,
  Target, Lightbulb, TrendUp, CaretDown,
} from '@phosphor-icons/react';
import { PROJECTS } from '../mock/projects';

/* /patterns — cross-project / cross-time pattern synthesis
 *
 * Reports surface what each agent run found in isolation. Patterns is
 * the next zoom level up — io looks across every Finding across every
 * Project (and the per-project weekly briefings that roll those findings
 * up) and surfaces the patterns that span them. Always-on, refreshes
 * whenever the underlying briefings update — not a strict weekly snapshot.
 *
 * Mental model for the user:
 *    Findings  = atomic insight from one report
 *    Patterns  = synthesis across many findings + many briefings (this page)
 *
 * Page anatomy, top → bottom:
 *    1. PatternsHero          — dark editorial card, sandwich layout
 *    2. FeaturedPatternCard   — the spotlight pattern, full editorial spread
 *    3. ShelfDivider          — quiet transition from spotlight to shelf
 *    4. CompactPatternCard×N  — scannable shelf, click-to-expand inline.
 *                                Scales to 40+ patterns when the agency book
 *                                gets big — flat list, no pagination needed
 *                                until volumes exceed a screenful.
 *    5. PatternsReturnBanner  — slim sister of /reports' Patterns banner.
 *
 * Page family: shares the verdict-card / reports-hero hand exactly —
 * black-led dark hero with top-right purple bloom, italic-purple period
 * motif, Courier mono eyebrows. White cards on the lavender canvas; the
 * featured spread + magazine-shelf rhythm is what distinguishes this
 * surface from /reports (which is a flat inbox of individual reports). */

// ─── Data ──────────────────────────────────────────────────────────────

interface AffectedProject {
  id: string;
  name: string;
}

interface PatternDriver {
  agentName: string;
  agentEmoji: string;
  findingsCount: number;
  modifier?: string; // e.g. "(2 confirmed, 1 inferred)"
}

interface Pattern {
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
}

const PATTERNS: Pattern[] = [
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
  },
  // ─── Lower-ranked patterns (scale demo) ────────────────────────────────
  // Briefer authoring than the featured + top-tier patterns above. Each
  // is a plausible cross-account paid-ads observation grounded in the
  // existing 8-project mock. Demonstrates how the shelf reads at scale.
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

// ─── Page ──────────────────────────────────────────────────────────────

export function Patterns() {
  // Accordion mode: only one compact card open at a time. At 40+ patterns
  // an independent-state shelf becomes a chaotic checkerboard; accordion
  // keeps the eye moving down the page cleanly.
  const [openId, setOpenId] = useState<string | null>(null);
  const [featured, ...rest] = PATTERNS;
  const totalProjects = countUniqueProjects(PATTERNS);
  const totalFindings = PATTERNS.reduce(
    (sum, p) => sum + p.drivenBy.reduce((s, d) => s + d.findingsCount, 0),
    0,
  );
  return (
    <div className="space-y-8 pb-8">
      <style>{PAGE_STYLES}</style>

      {/* Page header — LIGHT surface, deliberately different from /reports'
          dark editorial hero. Patterns is a synthesis read; the surface
          stays clean and explanatory rather than dramatic. */}
      <PatternsPageHeader
        patternCount={PATTERNS.length}
        projectCount={totalProjects}
        findingCount={totalFindings}
      />

      {/* Explainer — what this view is + dual-persona breakdown. Sits
          immediately under the H1 so first-time users have context before
          the patterns themselves start. */}
      <PatternsExplainer />

      {/* THE FEATURED PATTERN — full editorial spread, the spotlight */}
      <FeaturedPatternCard pattern={featured} />

      {/* Section divider — quiet shift from spotlight to shelf */}
      <ShelfDivider count={rest.length} />

      {/* THE SHELF — accordion mode (one open at a time). Scales to 40+. */}
      <div className="space-y-3">
        {rest.map((p, i) => (
          <CompactPatternCard
            key={p.id}
            pattern={p}
            index={i}
            open={openId === p.id}
            onToggle={() => setOpenId(openId === p.id ? null : p.id)}
          />
        ))}
      </div>

      {/* Footer return — back to the inbox of individual reports */}
      <PatternsReturnBanner />
    </div>
  );
}

// ─── Page header (LIGHT surface, distinct from /reports' dark hero) ───
//
// Plain H1 + Experimental flag + live-state caption + at-a-glance stats.
// No dark gradient card here on purpose — the page family Patterns
// belongs to is "synthesis + explanation," not "moment of arrival" like
// the verdict card on individual reports. Visually distinct so users
// can feel the surface-type shift.

function PatternsPageHeader({
  patternCount, projectCount, findingCount,
}: { patternCount: number; projectCount: number; findingCount: number }) {
  return (
    <header className="reveal" style={{ animationDelay: '0ms' }}>
      <div className="flex flex-wrap items-baseline gap-3">
        <h1 className="font-display text-[46px] font-extrabold leading-[0.96] tracking-[-0.030em] text-ppc-ink">
          Patterns<span className="text-ppc-purple-500">.</span>
        </h1>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-[5px] text-[11.5px] font-semibold"
          style={{
            background: 'linear-gradient(155deg, #FDF4D2 0%, #F8E5A0 100%)',
            color: '#7A4E12',
            boxShadow: 'inset 0 0 0 1px rgba(168,120,38,0.25)',
            letterSpacing: '-0.005em',
          }}
        >
          <span aria-hidden>🧪</span>
          Experimental
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px]" style={{ color: '#6b6480' }}>
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden
            className="live-pulse h-[6px] w-[6px] rounded-full"
            style={{ background: '#5DCAA5' }}
          />
          <span style={{ color: '#1F8458', fontWeight: 600 }}>Live</span>
        </span>
        <span aria-hidden style={{ color: '#d9d4ec' }}>·</span>
        <span><span className="tabular-nums font-semibold text-ppc-ink">{patternCount}</span> active patterns</span>
        <span aria-hidden style={{ color: '#d9d4ec' }}>·</span>
        <span><span className="tabular-nums font-semibold text-ppc-ink">{projectCount}</span> projects touched</span>
        <span aria-hidden style={{ color: '#d9d4ec' }}>·</span>
        <span><span className="tabular-nums font-semibold text-ppc-ink">{findingCount}</span> source findings</span>
        <span aria-hidden style={{ color: '#d9d4ec' }}>·</span>
        <span>Updated 2h ago</span>
      </div>
    </header>
  );
}

// ─── Explainer / dual-persona note ─────────────────────────────────────
//
// Plain editorial card on the lavender canvas. Explains what this view
// is and who it's for — agency vs in-house. Deliberately light-weight
// (no fancy gradient, no oversized illustration) so it reads as "a note
// from the team," not as the page's main visual moment.

function PatternsExplainer() {
  return (
    <article
      className="reveal relative overflow-hidden rounded-[16px]"
      style={{
        animationDelay: '80ms',
        background: 'linear-gradient(180deg, #FFFFFF 0%, #FBFAFF 100%)',
        boxShadow: '0 0 0 1px #e8e2f0, 0 1px 0 rgba(255,255,255,0.7) inset',
      }}
    >
      {/* Quiet purple accent strip on the left — signals this is editorial
          guidance, not a finding to act on. Whisper, not chrome. */}
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{ background: 'linear-gradient(180deg, #7F5AF0 0%, #A88CFF 100%)' }}
      />

      <div className="relative px-7 py-6 sm:px-8 sm:py-7">
        <div className="flex items-baseline gap-2">
          <span
            className="text-[11.5px] font-semibold tracking-[-0.005em]"
            style={{ color: '#534AB7' }}
          >
            What this is
          </span>
        </div>
        <h2
          className="mt-1.5 font-display text-[20px] font-bold leading-[1.2] tracking-[-0.012em] text-ppc-ink sm:text-[22px]"
        >
          Cross-account synthesis. When the same problem shows up in more than one place at once, it surfaces here
          <span className="font-serif italic text-ppc-purple-500">.</span>
        </h2>
        <p className="mt-2.5 max-w-[68ch] text-[14px] leading-[1.6]" style={{ color: '#52525b' }}>
          Patterns reads across every Finding produced by every agent run, plus the per-project weekly briefings,
          and surfaces what connects them. It refreshes whenever the underlying briefings update — not a strict
          weekly snapshot.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 sm:gap-6">
          <PersonaNote
            label="For agency teams"
            body="A single view onto the trends spanning your whole client roster — competitive moves, vertical-wide auction shifts, repeated audit findings. Read it like a COO briefing across the book."
          />
          <PersonaNote
            label="For in-house teams"
            body="The recurring themes showing up across your campaigns or over time — the same problem appearing in three ad groups, the same auction shift across your accounts. A sanity check on the patterns in your data."
          />
        </div>
      </div>
    </article>
  );
}

function PersonaNote({ label, body }: { label: string; body: string }) {
  return (
    <div>
      <div
        className="text-[12.5px] font-bold tracking-[-0.005em]"
        style={{ color: '#3C3489' }}
      >
        {label}
      </div>
      <p className="mt-1.5 text-[13px] leading-[1.6]" style={{ color: '#52525b' }}>
        {body}
      </p>
    </div>
  );
}

function countUniqueProjects(patterns: Pattern[]): number {
  const set = new Set<string>();
  patterns.forEach((p) => p.affected.forEach((a) => set.add(a.id)));
  return set.size;
}

// ─── Section divider between featured and shelf ───────────────────────

function ShelfDivider({ count }: { count: number }) {
  return (
    <div
      className="reveal flex items-baseline gap-3 px-1"
      style={{ animationDelay: '320ms' }}
    >
      <span
        className="text-[13px] font-semibold tracking-[-0.005em]"
        style={{ color: '#1a1625' }}
      >
        More patterns this week
        <span className="font-serif italic text-ppc-purple-500">.</span>
      </span>
      <span
        aria-hidden
        className="h-px flex-1 self-center"
        style={{ background: 'linear-gradient(90deg, rgba(127,90,240,0.22) 0%, transparent 100%)' }}
      />
      <span
        className="tabular-nums text-[12px]"
        style={{ color: '#85819a' }}
      >
        {count} more
      </span>
    </div>
  );
}

// ─── Featured pattern card ─────────────────────────────────────────────
//
// The headline story of the week. One per page. Full editorial spread —
// generous padding, big headline, labelled fields, affected/drivers
// soft-panel, dual CTA. This is the JOY moment of the page.

function FeaturedPatternCard({ pattern }: { pattern: Pattern }) {
  return (
    <article
      id={`pattern-${pattern.id}`}
      className="reveal relative overflow-hidden rounded-[20px] bg-white"
      style={{
        animationDelay: `200ms`,
        boxShadow:
          '0 0 0 1px #e8e2f0, 0 1px 0 rgba(15,10,30,0.02), 0 22px 38px -28px rgba(15,10,30,0.14)',
      }}
    >
      {/* Featured marker — a thin purple ribbon at the very top to signal
          "this is the headline story." Whisper, not chrome. */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{
          background: 'linear-gradient(90deg, #7F5AF0 0%, #A88CFF 50%, #7F5AF0 100%)',
        }}
      />
      <div className="relative px-8 py-9 sm:px-10 sm:py-11">
        {/* Rank + Featured chip on the left, category on the right. Only the
            PATTERN 01 system stamp keeps the Courier-mono treatment; the
            Featured chip and category eyebrow read as mixed-case Figtree so
            the card doesn't feel like a debug template. */}
        <div className="flex items-center gap-3">
          <PatternRankBadge rank={pattern.rank} />
          <span
            className="inline-flex items-center gap-[6px] rounded-full px-[10px] py-[3px] text-[11.5px] font-semibold"
            style={{
              background: 'linear-gradient(155deg, #E9E3FF 0%, #D3C6FF 100%)',
              color: '#3C3489',
              letterSpacing: '-0.005em',
              boxShadow: 'inset 0 0 0 1px rgba(127,90,240,0.28)',
            }}
          >
            <Sparkle size={10} weight="fill" />
            Featured
          </span>
          <span
            aria-hidden
            className="h-px flex-1"
            style={{ background: 'linear-gradient(90deg, #ECEAFA 0%, transparent 100%)' }}
          />
          <span
            className="text-[12.5px] font-semibold tracking-[-0.005em]"
            style={{ color: '#534AB7' }}
          >
            {pattern.category}
          </span>
        </div>

        {/* Compass glyph — pattern marker. Different from the Target glyph on
            atomic Discovery cards so the user can feel the level shift. */}
        <div className="mt-7" aria-hidden>
          <Compass
            size={28}
            weight="duotone"
            style={{
              color: '#7F5AF0',
              filter: 'drop-shadow(0 0 14px rgba(127,90,240,0.32))',
            }}
          />
        </div>

        {/* Pattern headline — pure editorial opener. Italic-purple period
            motif applies here as on every H1/H2 in the v5 brand. We add
            it after stripping any trailing punctuation from the source
            string so we don't end up with double periods. */}
        <h3
          className="mt-4 font-display font-extrabold text-ppc-ink"
          style={{
            fontSize: 'clamp(26px, 2.6vw, 32px)',
            letterSpacing: '-0.024em',
            lineHeight: 1.15,
            maxWidth: '840px',
          }}
        >
          {pattern.headline.replace(/[.!?]$/, '')}
          <span className="font-serif italic" style={{ color: '#7F5AF0' }}>.</span>
        </h3>

        {/* What we found / Why it matters — labelled editorial sections.
            Headers are mixed-case Figtree (not Courier mono) so they
            read as journalistic body labels, not template stamps. */}
        <PatternField
          label="What we found"
          body={pattern.whatWeFound}
          icon={<Sparkle size={17} weight="regular" />}
        />
        <PatternField
          label="Why it matters across your roster"
          body={pattern.whyItMatters}
          icon={<Lightbulb size={17} weight="regular" />}
        />

        {/* Affected projects + driven-by audit trail in a single neat row.
            Lavender soft panel so it reads as supporting metadata, not as
            primary copy. Labels are mixed-case Figtree. */}
        <div
          className="mt-9 grid gap-6 rounded-[14px] px-5 py-5 md:grid-cols-2"
          style={{
            background: '#F5F2FF',
            boxShadow: 'inset 0 0 0 0.5px rgba(127,90,240,0.18)',
          }}
        >
          <div>
            <div
              className="mb-3 text-[12px] font-bold tracking-[-0.005em]"
              style={{ color: '#3C3489' }}
            >
              Affected projects
            </div>
            <div className="flex flex-wrap gap-2">
              {pattern.affected.map((p) => (
                <AffectedChip key={p.id} project={p} />
              ))}
            </div>
          </div>

          <div>
            <div
              className="mb-3 text-[12px] font-bold tracking-[-0.005em]"
              style={{ color: '#3C3489' }}
            >
              Driven by
            </div>
            <ul className="flex flex-col gap-2">
              {pattern.drivenBy.map((d, i) => (
                <DriverRow key={i} driver={d} />
              ))}
            </ul>
          </div>
        </div>

        {/* Recommended action — the bridge from observation to next move. */}
        <PatternField
          label="Recommended action"
          body={pattern.recommendedAction}
          icon={<Target size={17} weight="regular" />}
        />

        {/* Single primary CTA. The previous "Trace to source findings"
            secondary link was removed — it broke on multi-project patterns
            (no good single destination), and the Affected chips above
            already deep-link to each project's Memory tab where source
            findings live. */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-[12px] px-5 py-3 text-[14px] font-bold text-white transition-transform hover:-translate-y-[1px]"
            style={{
              background: 'linear-gradient(180deg, #8767F3 0%, #6A45E2 100%)',
              boxShadow:
                '0 1px 0 rgba(255,255,255,0.22) inset, 0 12px 24px -10px rgba(127,90,240,0.65)',
              letterSpacing: '-0.008em',
            }}
          >
            {pattern.recommendedActionCta}
            <ArrowRight size={14} weight="bold" />
          </button>
        </div>
      </div>
    </article>
  );
}

// ─── Compact pattern card ──────────────────────────────────────────────
//
// The shelf unit. Scannable by default — rank · category · headline ·
// affected chips · driver summary · expand chevron. Click chevron to
// reveal the full What/Why/Recommendation inline (same vocabulary as
// the Reports inbox row-expand, by intent — one expand pattern across
// the whole product). Scales linearly to 40+ patterns because the page
// just keeps adding more compact cards.

function CompactPatternCard({
  pattern, index, open, onToggle,
}: {
  pattern: Pattern;
  index: number;
  open: boolean;
  onToggle: () => void;
}) {
  const totalFindings = pattern.drivenBy.reduce((s, d) => s + d.findingsCount, 0);
  return (
    <article
      id={`pattern-${pattern.id}`}
      className={`reveal compact-pattern relative overflow-hidden rounded-[16px] bg-white transition-all hover:-translate-y-[1px] ${
        open ? 'compact-pattern-open' : ''
      }`}
      style={{
        animationDelay: `${360 + index * 30}ms`,
        boxShadow:
          '0 0 0 1px #e8e2f0, 0 1px 0 rgba(15,10,30,0.02), 0 10px 24px -22px rgba(15,10,30,0.10)',
      }}
    >
      {/* Header row — rank · headline · affected dots · driver-emoji cluster
          · chevron. Mixed-case category eyebrow (no mono uppercase). At 40+
          patterns the row stays compact because everything past the
          headline is iconography. */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="group/cp w-full text-left"
      >
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-5 px-6 py-5">
          <PatternRankBadge rank={pattern.rank} />

          <div className="min-w-0">
            <div
              className="text-[12px] font-semibold tracking-[-0.005em]"
              style={{ color: '#534AB7' }}
            >
              {pattern.category}
            </div>
            <h3
              className="mt-1 text-[18px] font-bold tracking-[-0.012em] text-ppc-ink group-hover/cp:text-ppc-purple-700"
              style={{ lineHeight: 1.28 }}
            >
              {pattern.headline.replace(/[.!?]$/, '')}
              <span className="font-serif italic" style={{ color: '#7F5AF0' }}>.</span>
            </h3>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px]" style={{ color: '#85819a' }}>
              <span>
                <span className="font-semibold text-ppc-ink">{pattern.affected.length}</span>{' '}
                projects
              </span>
              <span aria-hidden style={{ color: '#cdc6dd' }}>·</span>
              <span>
                <span className="font-semibold text-ppc-ink tabular-nums">{totalFindings}</span>{' '}
                findings
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            {/* Affected-project dots (preview cluster) — first 3, then a "+N"
                slug if there's more. Scales for any number of projects. */}
            <div className="hidden flex-wrap items-center gap-1 md:flex">
              {pattern.affected.slice(0, 3).map((p) => (
                <CompactAffectedDot key={p.id} project={p} />
              ))}
              {pattern.affected.length > 3 && (
                <span
                  className="grid h-[22px] min-w-[22px] place-items-center rounded-[5px] px-1 text-[10.5px] font-bold tabular-nums"
                  style={{
                    background: '#F0EBFF',
                    color: '#534AB7',
                    boxShadow: 'inset 0 0 0 1px rgba(127,90,240,0.18)',
                  }}
                >
                  +{pattern.affected.length - 3}
                </span>
              )}
            </div>
            {/* Driver emojis — pure icons, no text. Scans cleanly at 40+. */}
            <div
              className="hidden items-center gap-[3px] rounded-[6px] px-1.5 py-0.5 lg:flex"
              title={pattern.drivenBy.map((d) => d.agentName).join(' · ')}
              style={{ background: '#FBFAFF', boxShadow: 'inset 0 0 0 0.5px #ECEAFA' }}
            >
              {pattern.drivenBy.map((d, i) => (
                <span
                  key={i}
                  aria-hidden
                  className="text-[12px] leading-none"
                  title={d.agentName}
                >
                  {d.agentEmoji}
                </span>
              ))}
            </div>
            {/* Visible chevron — lavender pill that rotates 180° on expand.
                Discoverable at rest (not hover-only). */}
            <span
              aria-hidden
              className="grid h-[28px] w-[28px] place-items-center rounded-full transition-colors group-hover/cp:bg-[#F0EBFF]"
              style={{ background: open ? '#F0EBFF' : 'transparent' }}
            >
              <CaretDown
                size={13}
                weight="bold"
                className={`text-ppc-purple-500 transition-transform duration-200 ${
                  open ? 'rotate-180' : ''
                }`}
              />
            </span>
          </div>
        </div>
      </button>

      {/* Expanded body — What / Why / Affected & Drivers / Recommendation.
          Labels are mixed-case Figtree, not mono uppercase. */}
      {open && (
        <div className="pattern-expansion border-t border-[#ECEAFA] px-6 py-6">
          <PatternField
            label="What we found"
            body={pattern.whatWeFound}
            icon={<Sparkle size={15} weight="regular" />}
            compact
          />
          <PatternField
            label="Why it matters across your roster"
            body={pattern.whyItMatters}
            icon={<Lightbulb size={15} weight="regular" />}
            compact
          />

          <div
            className="mt-6 grid gap-5 rounded-[12px] px-4 py-4 md:grid-cols-2"
            style={{
              background: '#F5F2FF',
              boxShadow: 'inset 0 0 0 0.5px rgba(127,90,240,0.18)',
            }}
          >
            <div>
              <div
                className="mb-2 text-[12px] font-bold tracking-[-0.005em]"
                style={{ color: '#3C3489' }}
              >
                Affected projects
              </div>
              <div className="flex flex-wrap gap-1.5">
                {pattern.affected.map((p) => (
                  <AffectedChip key={p.id} project={p} />
                ))}
              </div>
            </div>
            <div>
              <div
                className="mb-2 text-[12px] font-bold tracking-[-0.005em]"
                style={{ color: '#3C3489' }}
              >
                Driven by
              </div>
              <ul className="flex flex-col gap-1.5">
                {pattern.drivenBy.map((d, i) => (
                  <DriverRow key={i} driver={d} />
                ))}
              </ul>
            </div>
          </div>

          <PatternField
            label="Recommended action"
            body={pattern.recommendedAction}
            icon={<Target size={15} weight="regular" />}
            compact
          />

          {/* Single primary CTA. The previous "Trace to source findings"
              secondary link was removed — broken on multi-project patterns. */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-1.5 rounded-[10px] px-4 py-[10px] text-[13px] font-bold text-white transition-transform hover:-translate-y-[1px]"
              style={{
                background: 'linear-gradient(180deg, #8767F3 0%, #6A45E2 100%)',
                boxShadow:
                  '0 1px 0 rgba(255,255,255,0.22) inset, 0 10px 20px -10px rgba(127,90,240,0.55)',
                letterSpacing: '-0.008em',
              }}
            >
              {pattern.recommendedActionCta}
              <ArrowRight size={12} weight="bold" />
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

// CompactAffectedDot — tiny stacked-letter chip for the compact row's
// right-side preview of affected projects. Three dots side by side give
// a glance signal without listing all the project names in the header.
function CompactAffectedDot({ project }: { project: AffectedProject }) {
  const chip = projectChipColor(project.id);
  return (
    <span
      title={project.name}
      aria-label={project.name}
      className="grid h-[22px] w-[22px] place-items-center rounded-[5px] text-[10px] font-bold leading-none"
      style={{
        background: chip.bg,
        color: chip.fg,
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.32), inset 0 -1px 0 rgba(0,0,0,0.10)',
      }}
    >
      {project.name.charAt(0)}
    </span>
  );
}

// PatternRankBadge — the black mono `PATTERN 01` chip used on both the
// featured card AND the compact shelf cards. Keeps the visual identity
// consistent across density levels.
function PatternRankBadge({ rank }: { rank: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-[8px] px-[10px] py-[5px] font-bold tabular-nums"
      style={{
        background: '#0F0A1E',
        color: '#FFFFFF',
        fontSize: '11px',
        letterSpacing: '0.08em',
        fontFamily: '"Courier New", ui-monospace, monospace',
      }}
    >
      PATTERN {String(rank).padStart(2, '0')}
    </span>
  );
}

function PatternField({
  label,
  body,
  icon,
  compact = false,
}: {
  label: string;
  body: string;
  icon?: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <section className={compact ? 'mt-5' : 'mt-8'}>
      <h4
        className={`flex items-center gap-[10px] font-bold text-ppc-ink ${
          compact ? 'text-[14px]' : 'text-[16px]'
        }`}
        style={{ letterSpacing: '-0.012em' }}
      >
        {icon && (
          <span aria-hidden style={{ color: '#7F5AF0' }} className="inline-flex shrink-0">
            {icon}
          </span>
        )}
        {label}
      </h4>
      <p
        className={`mt-2 leading-[1.6] ${compact ? 'text-[14px]' : 'mt-2.5 text-[15.5px] leading-[1.65]'}`}
        style={{ color: '#3c3849', maxWidth: '820px' }}
      >
        {body}
      </p>
    </section>
  );
}

function AffectedChip({ project }: { project: AffectedProject }) {
  // Resolve the project's color from the master PROJECTS list if it exists;
  // otherwise fall back to a neutral lavender. Deep-links to the project's
  // Memory tab (where the per-project weekly briefing lives) via the
  // ?tab=memory query — once Project.tsx wires URL state, that param will
  // pre-select the Memory tab so the drill-down lands the user exactly
  // where they expect: this project's running record of what io found.
  const inRoster = PROJECTS.find((p) => p.id === project.id);
  const chip = projectChipColor(project.id);
  return (
    <Link
      to={inRoster ? `/projects/${project.id}?tab=memory` : '#'}
      className="group/chip inline-flex items-center gap-2 rounded-[10px] px-3 py-[7px] transition-colors"
      style={{
        background: '#FFFFFF',
        boxShadow: 'inset 0 0 0 0.5px rgba(127,90,240,0.18)',
      }}
    >
      <span
        aria-hidden
        className="grid h-[20px] w-[20px] shrink-0 place-items-center rounded-[5px] text-[10px] font-bold leading-none"
        style={{
          background: chip.bg,
          color: chip.fg,
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.32), inset 0 -1px 0 rgba(0,0,0,0.10)',
        }}
      >
        {project.name.charAt(0)}
      </span>
      <span
        className="text-[13px] font-semibold tracking-[-0.005em] text-ppc-ink transition-colors group-hover/chip:text-ppc-purple-700"
      >
        {project.name}
      </span>
      <ArrowUpRight
        size={10}
        weight="bold"
        className="text-ppc-text-faint transition-colors group-hover/chip:text-ppc-purple-500"
      />
    </Link>
  );
}

function projectChipColor(id: string): { bg: string; fg: string } {
  // Mirrors the hash used in Reports.tsx's projectChip helper so the same
  // project reads as the same colour across surfaces. Slightly softened
  // saturation here so the dot-cluster preview in compact pattern cards
  // doesn't read as candy — the full-name AffectedChip stays brighter so
  // identity is still legible at the editorial scale.
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const hue = h % 360;
  return {
    bg: `linear-gradient(155deg, hsl(${hue}, 55%, 91%) 0%, hsl(${hue}, 45%, 86%) 100%)`,
    fg: `hsl(${hue}, 50%, 28%)`,
  };
}

function DriverRow({ driver }: { driver: PatternDriver }) {
  return (
    <li className="flex items-baseline gap-2.5">
      <span aria-hidden className="text-[15px] leading-none">{driver.agentEmoji}</span>
      <span className="text-[13px] font-semibold text-ppc-ink">{driver.agentName}</span>
      <span aria-hidden className="text-ppc-text-faint/60">·</span>
      <span
        className="tabular-nums text-[12.5px] text-ppc-text-muted"
      >
        {driver.findingsCount} {driver.findingsCount === 1 ? 'finding' : 'findings'}
      </span>
      {driver.modifier && (
        <>
          <span aria-hidden className="text-ppc-text-faint/60">·</span>
          <span className="text-[11.5px] italic text-ppc-text-faint">
            {driver.modifier}
          </span>
        </>
      )}
    </li>
  );
}

// ─── Return banner ─────────────────────────────────────────────────────
//
// Mirrors the slim banner on /reports that points HERE — gives the user
// a one-click trip back to the firehose when they're done with the
// synthesis read.

function PatternsReturnBanner() {
  return (
    <Link
      to="/reports"
      className="reveal group relative block overflow-hidden rounded-[14px] transition-all hover:-translate-y-[1px]"
      style={{
        animationDelay: `${200 + PATTERNS.length * 80 + 60}ms`,
        background: 'linear-gradient(180deg, #FFFFFF 0%, #FAF7FF 100%)',
        border: '0.5px solid #d9d4ec',
        boxShadow: '0 1px 0 rgba(255,255,255,0.7) inset, 0 6px 20px -16px rgba(127,90,240,0.18)',
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-12 h-[180px] w-[260px] rounded-full opacity-40 transition-opacity duration-500 group-hover:opacity-90"
        style={{ background: 'radial-gradient(circle, rgba(127,90,240,0.10) 0%, transparent 65%)' }}
      />

      <div className="relative flex items-center gap-4 px-5 py-[14px] sm:px-6">
        <span
          className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-[9px]"
          style={{
            background: 'linear-gradient(155deg, #E9E3FF 0%, #D3C6FF 100%)',
            boxShadow: 'inset 0 0 0 0.5px rgba(127,90,240,0.28)',
          }}
        >
          <TrendUp size={13} weight="duotone" className="text-ppc-purple-700" />
        </span>

        <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-3 gap-y-1">
          <span
            className="text-[14px] font-semibold tracking-[-0.005em] text-ppc-ink"
          >
            Back to the individual reports
            <span className="ml-px font-serif italic text-ppc-purple-500">.</span>
          </span>
          <span className="text-[12.5px] text-ppc-text-muted">
            The full inbox, sorted by what needs you.
          </span>
        </div>

        <ArrowRight
          size={13}
          weight="bold"
          className="shrink-0 text-ppc-purple-500 transition-transform duration-200 group-hover:translate-x-[3px]"
        />
      </div>
    </Link>
  );
}

// ─── Animations ────────────────────────────────────────────────────────

const PAGE_STYLES = `
  @keyframes dp-reveal {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .reveal { opacity: 0; animation: dp-reveal 0.55s cubic-bezier(0.22, 0.9, 0.32, 1) forwards; }

  @keyframes dp-pattern-expand {
    from { opacity: 0; transform: translateY(-4px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .pattern-expansion {
    animation: dp-pattern-expand 0.32s cubic-bezier(0.22, 0.9, 0.32, 1);
  }

  /* Live pulse — soft breathing dot used in the hero's Live pill */
  @keyframes dp-live-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(93,202,165,0.55); }
    50%      { box-shadow: 0 0 0 6px rgba(93,202,165,0); }
  }
  .live-pulse {
    animation: dp-live-pulse 2.2s ease-in-out infinite;
  }

  /* When a compact card is open, lift it slightly above its neighbours
   * and tint the header so the expanded state reads as "anchored." */
  .compact-pattern {
    transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
  }
  .compact-pattern-open {
    box-shadow: 0 0 0 1px #d3c6ff, 0 1px 0 rgba(255,255,255,0.7) inset, 0 14px 32px -22px rgba(127,90,240,0.20);
  }
  .compact-pattern-open > button {
    background: linear-gradient(180deg, #FBFAFF 0%, #FFFFFF 100%);
  }
`;
