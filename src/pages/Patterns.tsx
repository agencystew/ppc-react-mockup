import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, Compass, Sparkle,
  Target, Lightbulb, TrendUp, CaretRight,
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
    category: 'Competitive expansion',
    headline: "Your SEO clients are caught in SEMrush and Ahrefs' retreat.",
    whatWeFound:
      "Both SEMrush and Ahrefs cut self-serve search spend by ~30% in the last 21 days. The HOTH, LinkBuilder.io, and Authority Builders all sit in their auction wake — three Competitor Spy runs flagged the same dynamic across the three accounts independently.",
    whyItMatters:
      "When the giants pull back, mid-tier SEO tools usually see a brief CPC dip (10–15% downwind) followed by competitor agencies filling the gap with brand-named campaigns. The window to grab CPC savings is roughly 14 days; after that the agency-bid pressure starts.",
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
      "Pull defensive brand-share data across all three accounts before May 31 — see whether agency-bid pressure has already started, or whether you've still got runway to lift bids on non-brand.",
    recommendedActionCta: 'Pull cross-account brand-share data',
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
    headline: 'Brand share is slipping across both your health-vertical accounts — same week, same shape.',
    whatWeFound:
      "Weekly Audit ran for Boulder Care and LivingYoung Center this week. Both saw brand-search impression share drop 6–9% MoM, both with Quality Scores holding steady. Different accounts, different competitors — but identical pattern.",
    whyItMatters:
      "When two unrelated accounts in the same vertical show simultaneous brand erosion with no audit-side cause, it's usually a market-wide signal — a category trend, a Google ranking shift, or seasonal demand. One cross-account investigation will resolve it faster than two separate.",
    affected: [
      { id: 'boulder-care', name: 'Boulder Care' },
      { id: 'livingyoung',  name: 'LivingYoung Center' },
    ],
    drivenBy: [
      { agentName: 'Weekly Audit', agentEmoji: '📈', findingsCount: 2, modifier: 'same week, both accounts' },
    ],
    recommendedAction:
      "Run a single cross-account brand-search investigation across both — is the erosion a vertical demand signal, a Google update, or both?",
    recommendedActionCta: 'Open the cross-account investigation',
  },
];

// ─── Page ──────────────────────────────────────────────────────────────

export function Patterns() {
  // The first pattern is rendered as the FEATURED card — full editorial,
  // magazine-cover energy. Everything else lives in the compact shelf
  // below — scannable, expand-on-demand. Scales linearly to 40+ patterns
  // because the shelf is just a flat list of compact cards.
  const [featured, ...rest] = PATTERNS;
  return (
    <div className="space-y-7 pb-8">
      <style>{PAGE_STYLES}</style>

      {/* Page H1 — clean, no persona switcher (single mode for now) */}
      <header className="reveal" style={{ animationDelay: '0ms' }}>
        <h1 className="font-display text-[46px] font-extrabold leading-[0.96] tracking-[-0.030em] text-ppc-ink">
          Patterns<span className="text-ppc-purple-500">.</span>
        </h1>
      </header>

      {/* Editorial dark hero — same family as the verdict card + reports hero */}
      <PatternsHero patternCount={PATTERNS.length} />

      {/* THE FEATURED PATTERN — full editorial spread, the spotlight */}
      <FeaturedPatternCard pattern={featured} />

      {/* Section divider — quiet shift from spotlight to shelf */}
      <ShelfDivider count={rest.length} />

      {/* THE SHELF — compact, scannable, expand-on-demand. Scales to 40+. */}
      <div className="space-y-3">
        {rest.map((p, i) => (
          <CompactPatternCard key={p.id} pattern={p} index={i} />
        ))}
      </div>

      {/* Footer return — "back to the trees" */}
      <PatternsReturnBanner />
    </div>
  );
}

// ─── Section divider between featured and shelf ───────────────────────

function ShelfDivider({ count }: { count: number }) {
  return (
    <div
      className="reveal flex items-center gap-3 px-1"
      style={{ animationDelay: '320ms' }}
    >
      <span
        className="font-mono text-[10.5px] font-semibold uppercase"
        style={{ color: '#534AB7', letterSpacing: '0.14em' }}
      >
        More patterns this week
      </span>
      <span
        aria-hidden
        className="h-px flex-1"
        style={{ background: 'linear-gradient(90deg, rgba(127,90,240,0.28) 0%, transparent 100%)' }}
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

// ─── Hero ──────────────────────────────────────────────────────────────

function PatternsHero({ patternCount }: { patternCount: number }) {
  const verticalCount = countUniqueVerticals(PATTERNS);
  const sourceFindings = PATTERNS.reduce(
    (sum, p) => sum + p.drivenBy.reduce((s, d) => s + d.findingsCount, 0),
    0,
  );
  return (
    <section
      className="reveal relative overflow-hidden rounded-[22px] text-white"
      style={{
        animationDelay: '120ms',
        background: 'linear-gradient(180deg, #0F0A1E 0%, #07050D 100%)',
        boxShadow:
          'inset 0 1px 0 rgba(255,255,255,0.05), 0 30px 60px -32px rgba(15,10,30,0.45)',
        padding: 'clamp(32px, 3.4vw, 48px) clamp(28px, 3.6vw, 52px)',
      }}
    >
      {/* Top-right purple bloom */}
      <span
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          top: '-130px',
          right: '-110px',
          width: '500px',
          height: '320px',
          background:
            'radial-gradient(ellipse, rgba(127,90,240,0.20) 0%, transparent 62%)',
        }}
      />

      <div className="relative flex flex-col items-center text-center">
        {/* TOP META — ◆ Patterns · ✨ Weekly · Week of May 17 */}
        <div className="flex flex-wrap items-center justify-center gap-x-[14px] gap-y-2 text-[14.5px]">
          <span
            className="inline-flex items-baseline gap-[10px]"
            style={{
              letterSpacing: '-0.008em',
              color: 'rgba(214,200,255,0.95)',
              fontWeight: 600,
            }}
          >
            <span
              aria-hidden
              style={{
                color: '#A88CFF',
                fontSize: '13px',
                textShadow: '0 0 14px rgba(168,140,255,0.65)',
              }}
            >
              ◆
            </span>
            Patterns
          </span>

          <HeroSep />

          {/* Live pill — io's pattern engine always reflects current state,
              not a frozen weekly snapshot. Patterns refresh as the
              underlying per-project briefings update. */}
          <span
            className="inline-flex items-center gap-[8px] rounded-full px-[12px] py-[5px] font-semibold"
            style={{
              background: 'rgba(93,202,165,0.14)',
              color: '#9CE5C5',
              boxShadow: 'inset 0 0 0 1px rgba(93,202,165,0.32)',
              letterSpacing: '-0.005em',
              fontSize: '13.5px',
            }}
          >
            <span
              aria-hidden
              className="live-pulse h-[6px] w-[6px] rounded-full"
              style={{ background: '#5DCAA5' }}
            />
            Live
          </span>

          <HeroSep />

          <span style={{ color: 'rgba(184,174,218,0.85)' }}>Updated 2h ago</span>
        </div>

        {/* Sparkle decoration with flanking lines */}
        <div aria-hidden className="my-[20px] flex items-center gap-[14px]">
          <span
            style={{
              width: '36px',
              height: '1px',
              background:
                'linear-gradient(90deg, transparent 0%, rgba(168,140,255,0.55) 100%)',
            }}
          />
          <Sparkle
            size={20}
            weight="fill"
            style={{
              color: '#A88CFF',
              filter: 'drop-shadow(0 0 14px rgba(127,90,240,0.60))',
            }}
          />
          <span
            style={{
              width: '36px',
              height: '1px',
              background:
                'linear-gradient(90deg, rgba(168,140,255,0.55) 0%, transparent 100%)',
            }}
          />
        </div>

        {/* Headline — slightly tighter than the verdict card, on-brand italic period */}
        <h2
          className="font-display font-black text-white"
          style={{
            fontSize: 'clamp(36px, 4.2vw, 56px)',
            letterSpacing: '-0.032em',
            lineHeight: 1.04,
            maxWidth: '720px',
          }}
        >
          The forest,{' '}
          <span
            className="font-serif italic"
            style={{ color: '#A88CFF', fontWeight: 600 }}
          >
            not the trees
          </span>
          <span style={{ color: '#A88CFF' }}>.</span>
        </h2>

        <p
          className="mt-4 max-w-[58ch] text-[15.5px] leading-[1.55]"
          style={{ color: 'rgba(184,174,218,0.85)' }}
        >
          io looks across every finding from every report and surfaces what
          connects them. <span className="font-bold text-white">{patternCount}</span> patterns are alive across your roster this week.
        </p>

        {/* Bottom stats row */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-[14px] gap-y-2 text-[14px]">
          <HeroStat value={patternCount.toString()} label="patterns" />
          <HeroSep />
          <HeroStat value={verticalCount.toString()} label="verticals touched" />
          <HeroSep />
          <HeroStat value={sourceFindings.toString()} label="source findings" />
          <HeroSep />
          <HeroStat value="" label="auto-detected" />
        </div>
      </div>
    </section>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <span
      className="inline-flex items-baseline gap-[6px]"
      style={{ color: 'rgba(184,174,218,0.85)' }}
    >
      {value && (
        <span
          className="tabular-nums font-bold"
          style={{ color: 'rgba(255,255,255,0.94)', letterSpacing: '-0.005em' }}
        >
          {value}
        </span>
      )}
      <span>{label}</span>
    </span>
  );
}

function HeroSep() {
  return <span aria-hidden style={{ color: 'rgba(184,174,218,0.30)' }}>·</span>;
}

function countUniqueVerticals(patterns: Pattern[]): number {
  // Each pattern carries a category, which roughly maps to a vertical.
  // De-duping by category gives a rough vertical count.
  const set = new Set<string>();
  patterns.forEach((p) => set.add(p.category));
  return set.size;
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
        {/* Rank + category eyebrow row + Featured badge */}
        <div className="flex items-center gap-3">
          <PatternRankBadge rank={pattern.rank} />
          {/* Featured chip — kept on the v5 palette (lavender fill + deep
              purple text). Distinct from the primary purple CTA gradient
              below so we don't double-up #7F5AF0 on the same screen. */}
          <span
            className="inline-flex items-center gap-[6px] rounded-full px-[10px] py-[3px] text-[10.5px] font-bold uppercase"
            style={{
              background: 'linear-gradient(155deg, #E9E3FF 0%, #D3C6FF 100%)',
              color: '#3C3489',
              letterSpacing: '0.12em',
              fontFamily: '"Courier New", ui-monospace, monospace',
              boxShadow: 'inset 0 0 0 1px rgba(127,90,240,0.28)',
            }}
          >
            <Sparkle size={9} weight="fill" />
            Featured
          </span>
          <span
            aria-hidden
            className="h-px flex-1"
            style={{ background: 'linear-gradient(90deg, #ECEAFA 0%, transparent 100%)' }}
          />
          <span
            className="font-mono text-[11px] font-semibold uppercase"
            style={{ color: '#534AB7', letterSpacing: '0.14em' }}
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

        {/* What we found / Why it matters — labelled sections,
            same hand as the Discovery card on individual reports */}
        <PatternField
          label="What io found"
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
            primary copy. */}
        <div
          className="mt-9 grid gap-6 rounded-[14px] px-5 py-5 md:grid-cols-2"
          style={{
            background: '#F5F2FF',
            boxShadow: 'inset 0 0 0 0.5px rgba(127,90,240,0.18)',
          }}
        >
          <div>
            <div
              className="mb-3 font-mono text-[10.5px] font-semibold uppercase"
              style={{ color: '#534AB7', letterSpacing: '0.14em' }}
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
              className="mb-3 font-mono text-[10.5px] font-semibold uppercase"
              style={{ color: '#534AB7', letterSpacing: '0.14em' }}
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

        {/* Recommended action — italic-period editorial framing.
            CTA below is the bridge from "this is what io thinks" to
            "this is what you do next." */}
        <PatternField
          label="Recommended action"
          body={pattern.recommendedAction}
          icon={<Target size={17} weight="regular" />}
        />

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
          <Link
            to={`/reports?pattern=${pattern.id}`}
            className="inline-flex items-center gap-1.5 rounded-[12px] px-4 py-[10px] text-[13px] font-semibold text-ppc-text-muted transition-colors hover:bg-[#F3F0FF] hover:text-ppc-ink"
          >
            Trace to source findings
            <ArrowUpRight size={11} weight="bold" />
          </Link>
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

function CompactPatternCard({ pattern, index }: { pattern: Pattern; index: number }) {
  const [open, setOpen] = useState(false);
  const totalFindings = pattern.drivenBy.reduce((s, d) => s + d.findingsCount, 0);
  return (
    <article
      id={`pattern-${pattern.id}`}
      className={`reveal compact-pattern relative overflow-hidden rounded-[16px] bg-white transition-all hover:-translate-y-[1px] ${
        open ? 'compact-pattern-open' : ''
      }`}
      style={{
        animationDelay: `${360 + index * 60}ms`,
        boxShadow:
          '0 0 0 1px #e8e2f0, 0 1px 0 rgba(15,10,30,0.02), 0 10px 24px -22px rgba(15,10,30,0.10)',
      }}
    >
      {/* Header row — rank · category · headline · affected dots ·
          driver-emoji cluster · chevron. Scannable at 40+ patterns because
          everything except the headline is compact iconography. */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="group/cp w-full text-left"
      >
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-5 px-6 py-5">
          <PatternRankBadge rank={pattern.rank} />

          <div className="min-w-0">
            <div
              className="font-mono text-[10.5px] font-semibold uppercase"
              style={{ color: '#534AB7', letterSpacing: '0.14em' }}
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
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px]" style={{ color: '#85819a' }}>
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
                  className="grid h-[22px] min-w-[22px] place-items-center rounded-[5px] px-1 text-[10px] font-bold tabular-nums"
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
            <span
              aria-hidden
              className="grid h-[28px] w-[28px] place-items-center rounded-[8px] transition-colors group-hover/cp:bg-[#F3F0FF]"
            >
              <CaretRight
                size={12}
                weight="bold"
                className={`text-ppc-text-faint transition-all duration-200 group-hover/cp:text-ppc-purple-700 ${
                  open ? 'rotate-90' : ''
                }`}
              />
            </span>
          </div>
        </div>
      </button>

      {/* Expanded body — What / Why / Affected & Drivers / Recommendation */}
      {open && (
        <div className="pattern-expansion border-t border-[#ECEAFA] px-6 py-6">
          <PatternField
            label="What io found"
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
                className="mb-2 font-mono text-[10px] font-semibold uppercase"
                style={{ color: '#534AB7', letterSpacing: '0.14em' }}
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
                className="mb-2 font-mono text-[10px] font-semibold uppercase"
                style={{ color: '#534AB7', letterSpacing: '0.14em' }}
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
            <Link
              to={`/reports?pattern=${pattern.id}`}
              className="inline-flex items-center gap-1 rounded-[10px] px-3 py-[8px] text-[12.5px] font-semibold text-ppc-text-muted transition-colors hover:bg-[#F3F0FF] hover:text-ppc-ink"
            >
              Trace to source findings
              <ArrowUpRight size={10} weight="bold" />
            </Link>
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
          <span
            className="text-[11px] italic text-ppc-text-faint"
            style={{ fontFamily: '"Courier New", ui-monospace, monospace' }}
          >
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
            className="font-mono text-[10.5px] font-semibold uppercase"
            style={{ color: '#534AB7', letterSpacing: '0.14em' }}
          >
            Back to the trees
          </span>
          <span
            className="text-[14px] font-semibold tracking-[-0.005em] text-ppc-ink"
          >
            Triage today's individual reports
            <span className="ml-px font-serif italic text-ppc-purple-500">.</span>
          </span>
          <span className="text-[12.5px] text-ppc-text-muted">
            The firehose, sorted by what needs you.
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
