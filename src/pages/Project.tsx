// v2 Project page — portfolio spread.
//
// THREE spreads (no eyebrows, no chips, no metric strip):
//   A · Photographic hero — 96px client name + abstract typographic
//       composition in a 480px ink-bordered square + peek mascot.
//   B · Most-used here — three dark agent cards (signature).
//   C · Verdict history — vertical-rule audit timeline.
//
// Discipline:
//   · 5 font sizes only — DISPLAY 96 / H2 32 / BODY 17 / MONO 14 / (no others).
//   · No tilted elements (portfolio order, not crayon energy).
//   · ONE mascot (pose="peek"), in Spread A.
//   · Zero Caveat (H1 client name carries the emphasis).
//   · 3 spreads max.
//
// The named export is ProjectPage (App.tsx imports that name).

import { Link, useParams } from 'react-router-dom';
import { PROJECTS, ACCOUNTS } from '../mock/projects';
import {
  NEEDS_TODAY,
  READY_FOR_CLIENT,
  FYI_REPORTS,
  type NeedsReport,
  type ReadyReport,
  type FyiReport,
} from '../mock/reports';
import { AGENTS } from '../mock/agents';
import { PillButton } from '../components/brand/PillButton';
import { Mascot } from '../components/brand/Mascot';

/* ---------- helpers ---------- */

/* Per-project tonal palette, hue-hashed off the project id.
 * Mirrors AppShell's `projectChip` system so the abstract composition
 * in Spread A inherits a client-specific feel without going crayon. */
function projectPalette(id: string): { primary: string; tint: string } {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const hue = h % 360;
  return {
    primary: `hsl(${hue}, 62%, 38%)`,
    tint:    `hsl(${hue}, 55%, 92%)`,
  };
}

function clientInitials(name: string): string {
  const parts = name.split(/[\s.&-]+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface TimelineRow {
  id: string;
  date: string;
  headline: string;
  runId: string;
}

/* Combine the three report buckets for this project into a single
 * date-ordered timeline. Real ordering would use timestamps; we use
 * source-bucket priority (needs → ready → fyi) which corresponds to
 * "most recent first" in the mock copy. */
function projectTimeline(projectId: string): TimelineRow[] {
  const needs: NeedsReport[] = NEEDS_TODAY.filter(r => r.projectId === projectId);
  const ready: ReadyReport[] = READY_FOR_CLIENT.filter(r => r.projectId === projectId);
  const fyi:   FyiReport[]   = FYI_REPORTS.filter(r => r.projectId === projectId);
  return [
    ...needs.map(r => ({ id: r.id, date: r.finishedLabel, headline: r.headline, runId: r.runId })),
    ...ready.map(r => ({ id: r.id, date: r.finishedLabel, headline: r.headline, runId: r.runId })),
    ...fyi.map(r =>   ({ id: r.id, date: r.finishedLabel, headline: r.headline, runId: r.runId })),
  ];
}

/* The 3 signature agents shown in Spread B.
 * Industry-hinted defaults so a D2C client doesn't lead with shopping-feed
 * for a SaaS-style account. Kept short — Stewart's spec asked for sensible. */
function signatureAgentSlugs(industry: string | undefined): string[] {
  const ecomm = ['D2C Jewelry'].includes(industry ?? '');
  const med   = ['Med Spa', 'Addiction Recovery'].includes(industry ?? '');
  if (ecomm) return ['shopping-feed', 'weekly-audit', 'competitor-spy'];
  if (med)   return ['competitor-spy', 'landing-page', 'weekly-audit'];
  // Default — SaaS / SEO software / travel / link-building lean on these three.
  return ['competitor-spy', 'weekly-audit', 'landing-page'];
}

/* Per-client one-liner for the dark agent cards.
 * Concrete-but-fictional, post-context (this is a project page so the
 * agent already "knows" the account).  No $ figures — see
 * feedback_no_pre_run_dollar_figures.md. */
function agentBlurb(slug: string, projectName: string): string {
  switch (slug) {
    case 'competitor-spy':
      return `Last run flagged 11 angles ${projectName}'s rivals were running that you weren't. Re-runs weekly against the live SERP.`;
    case 'weekly-audit':
      return `Reads the week against everything we know about ${projectName} and queues next week's plays in priority order.`;
    case 'landing-page':
      return `Audits the page real visitors land on, scored against intent, friction, and offer clarity. Writes the rewrite.`;
    case 'shopping-feed':
      return `Walks the feed against the catalog. Surfaces titles, attributes, and disapprovals that quietly tank ROAS.`;
    case 'negative-keyword':
      return `Theme-clusters waste from the last 90 days. Stress-tests every candidate against converting queries before it lands.`;
    case 'deep-account-audit':
      return `Top-to-bottom alignment audit. Client-ready output you can hand to the next review meeting without reformatting.`;
    default:
      return `Tuned for ${projectName}. Runs against live account context every time you launch it.`;
  }
}

/* ---------- page ---------- */

export function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const project = PROJECTS.find(p => p.id === id);

  if (!project) {
    return (
      <div className="grid min-h-[60vh] place-items-center bg-canvas px-8 text-center font-sans text-ink">
        <div>
          <p className="text-[32px] font-display font-extrabold">Project not found</p>
          <p className="mt-3 text-[17px] text-ink/70">
            That client isn't in this workspace.
          </p>
          <Link
            to="/projects"
            className="mt-8 inline-flex items-center rounded-full border-[1.5px] border-ink bg-white px-6 py-3 text-[17px] font-display font-bold text-ink shadow-btn transition hover:-translate-y-[1px]"
          >
            ← Back to projects
          </Link>
        </div>
      </div>
    );
  }

  const accounts = ACCOUNTS.filter(a => a.projectId === project.id);
  const palette = projectPalette(project.id);
  const initials = clientInitials(project.name);
  const timeline = projectTimeline(project.id);
  const agentSlugs = signatureAgentSlugs(project.industry);
  const agents = agentSlugs
    .map(slug => AGENTS.find(a => a.slug === slug))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));

  const accountCountLabel = accounts.length === 1 ? '1 account' : `${accounts.length} accounts`;
  const agentCountLabel = `${AGENTS.length} agents available`;

  return (
    <div className="bg-canvas text-ink">
      {/* ════════════════════════════════════════════════════════════════
          SPREAD A · Photographic hero
          ════════════════════════════════════════════════════════════════ */}
      <section className="relative w-full overflow-hidden bg-canvas">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col items-start gap-12 px-8 py-20 md:flex-row md:items-center md:gap-16 md:py-28">
          {/* LEFT — name + dek */}
          <div className="flex-1 md:max-w-[640px]">
            <h1
              className="font-display font-black leading-[0.92] tracking-[-0.035em] text-ink text-[48px] md:text-[96px]"
            >
              {project.name}
            </h1>
            <p className="mt-8 max-w-[36ch] font-sans text-[17px] font-medium leading-[1.5] text-ink/70">
              Audited monthly since 2023. {accountCountLabel} live. {agentCountLabel}.
            </p>
            <p className="mt-2 max-w-[36ch] font-sans text-[17px] font-medium leading-[1.5] text-ink/70">
              {project.industry}.
            </p>
          </div>

          {/* RIGHT — 480×480 abstract typographic composition + peek mascot */}
          <div className="relative">
            {/* Mascot peeks from BEHIND the square's right edge.
                Negative right offset + z-0 places it behind; the square
                sits at z-10. */}
            <div className="pointer-events-none absolute -right-16 top-6 z-0 hidden md:block">
              <Mascot pose="peek" size={280} />
            </div>

            <div
              className="relative z-10 h-[280px] w-[280px] overflow-hidden border-[2px] border-ink bg-white shadow-sticker md:h-[480px] md:w-[480px]"
              aria-label={`${project.name} mark`}
            >
              {/* Big initials filling the square — Figtree 900, tight tracking */}
              <div
                className="absolute inset-0 grid place-items-center font-display font-black leading-[0.78] tracking-[-0.05em] text-[180px] md:text-[300px]"
                style={{ color: palette.primary }}
              >
                {initials}
              </div>

              {/* Geometry layer — ink circle bottom-left, mint square top-right,
                  redorange line slicing through. Each is small enough to read
                  as ornament against the dominant initials. */}
              <div
                className="absolute bottom-[8%] left-[6%] h-[88px] w-[88px] rounded-full border-[2px] border-ink md:h-[140px] md:w-[140px]"
                style={{ backgroundColor: 'transparent' }}
              />
              <div className="absolute right-[8%] top-[10%] h-[64px] w-[64px] border-[2px] border-ink bg-mint md:h-[108px] md:w-[108px]" />
              <div
                className="absolute left-0 right-0 top-[58%] h-[6px] bg-redorange"
                style={{ transform: 'rotate(-7deg)', transformOrigin: 'center' }}
              />
              {/* A second smaller redorange dot, anchored bottom-right, ties
                  back to the brand's red-orange period-dot motif. */}
              <div className="absolute bottom-[12%] right-[12%] h-[18px] w-[18px] rounded-full bg-redorange md:h-[26px] md:w-[26px]" />
              {/* Faint hairline tint wash behind everything, hue-hashed off the
                  client id — same hue as the initials, just at 8% alpha. */}
              <div
                className="absolute inset-0 -z-10"
                style={{ backgroundColor: palette.tint }}
              />
            </div>

            {/* Mobile mascot — render once, smaller, BELOW the square. */}
            <div className="mt-6 block md:hidden">
              <Mascot pose="peek" size={160} />
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          SPREAD B · Most-used here — three dark signature cards
          ════════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-canvas">
        <div className="mx-auto w-full max-w-[1440px] px-8 py-20 md:py-24">
          <h2 className="text-[32px] font-display font-extrabold leading-[1.05] tracking-[-0.020em] text-ink">
            Most-used here
          </h2>

          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
            {agents.map(agent => (
              <article
                key={agent.slug}
                className="flex h-[320px] w-full flex-col justify-between border-[2px] border-ink bg-ink p-7 shadow-sticker"
              >
                <div>
                  <h3 className="text-[32px] font-display font-extrabold leading-[1.05] tracking-[-0.020em] text-white">
                    {agent.name}
                  </h3>
                  <p className="mt-4 text-[17px] font-sans font-medium leading-[1.5] text-white/80">
                    {agentBlurb(agent.slug, project.name)}
                  </p>
                </div>

                {/* Dark-card "Launch →" — white pill, ink text, ink border,
                    4px ink offset shadow. Defined inline because
                    PillButton's three variants all read poorly on dark. */}
                <Link
                  to={`/agents/${agent.slug}?project=${project.id}`}
                  className="inline-flex w-fit items-center gap-2 rounded-full border-[2px] border-ink bg-white px-6 py-2.5 text-[17px] font-display font-bold text-ink shadow-[4px_4px_0_#0F0A1E] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#0F0A1E]"
                >
                  Launch →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          SPREAD C · Verdict history
          ════════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-canvas">
        <div className="mx-auto w-full max-w-[1440px] px-8 pb-28 pt-12">
          <h2 className="text-[32px] font-display font-extrabold leading-[1.05] tracking-[-0.020em] text-ink">
            Verdict history
          </h2>

          <div className="relative mt-10">
            {/* Vertical ink rule down the left margin — desktop only.
                On mobile we drop the rule + dots, the rows pack tighter. */}
            <div className="pointer-events-none absolute bottom-0 left-12 top-0 hidden w-[1.5px] bg-ink/40 md:block" />

            {timeline.length === 0 ? (
              <p className="py-12 text-[17px] font-sans font-medium text-ink/65">
                No audits yet. Launch one of the agents above to start the record.
              </p>
            ) : (
              <ul className="m-0 list-none p-0">
                {timeline.map(row => (
                  <li
                    key={row.id}
                    className="relative border-b border-ink/10 py-6 md:pl-20"
                  >
                    {/* Ink dot on the rule (desktop). */}
                    <span
                      className="pointer-events-none absolute left-[44px] top-7 hidden h-3 w-3 rounded-full bg-ink md:block"
                      aria-hidden
                    />

                    {/* Date — the page's ONE mono use. */}
                    <p className="font-mono text-[14px] leading-none text-ink/65">
                      {row.date}
                    </p>

                    {/* Headline */}
                    <p className="mt-2 max-w-[60ch] pr-32 text-[17px] font-display font-bold leading-[1.4] text-ink md:pr-40">
                      {row.headline}
                    </p>

                    {/* Open → button, absolute right-aligned on desktop,
                        stacked under headline on mobile. */}
                    <div className="mt-4 md:absolute md:right-0 md:top-6 md:mt-0">
                      <PillButton variant="ghost" href={`/reports/${row.runId}`}>
                        Open →
                      </PillButton>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
