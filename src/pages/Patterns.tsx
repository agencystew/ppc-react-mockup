import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, Compass, Sparkle,
  Target, Lightbulb, TrendUp, CaretDown,
} from '@phosphor-icons/react';
import { PROJECTS } from '../mock/projects';
import { PATTERNS, type Pattern, type AffectedProject, type PatternDriver } from '../mock/patterns';

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
// PATTERNS, Pattern, AffectedProject, PatternDriver imported from ../mock/patterns.
// The strip on /dashboard reads from the same source, so the two surfaces stay in sync.


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
