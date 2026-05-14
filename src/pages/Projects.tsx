// v2 — Projects (gallery) · route /projects
//
// TWO spreads, no more:
//   A — Dark hero on bg-ink. H1 56px (NOT display — this page is the index, the
//       individual Project page gets the display treatment). One Caveat
//       annotation ("ranked by spend"), down-left.
//   B — 8-tile orderly gallery on bg-canvas. No tilt, no stagger, no shadow
//       drama. Each tile is a 2px ink-bordered white card with a hue-hashed
//       project mark, monochrome status pill, one mono "Last audit" line, and
//       a ghost PillButton bottom-pinned.
//
// Five sizes: DISPLAY (unused) / H1 56px / H2 32px / BODY 17px / MONO 14px.
// Sorted by spend desc, matching the Caveat hint. Spend mock data lives here
// because mock/projects.ts only carries identity fields; the canonical IDs
// stay untouched.

import { Caveat } from '../components/brand/Caveat';
import { PillButton } from '../components/brand/PillButton';
import { PROJECTS, ACCOUNTS } from '../mock/projects';
import type { Project } from '../types/agent';

/* ─── Mock data living alongside the page ───────────────────────────────
 * Spend and "last audit" aren't on the canonical Project type. Keeping them
 * here keeps mock/projects.ts pure (identity only) while still letting this
 * page sort by spend and label each tile. */

interface TileData {
  spend: number;       // last-30d, USD
  lastAudit: string;   // ISO yyyy-mm-dd
}

const TILE: Record<string, TileData> = {
  'boulder-care':       { spend: 83_280, lastAudit: '2026-05-12' },
  'durable':            { spend: 20_373, lastAudit: '2026-05-11' },
  'the-hoth':           { spend: 12_783, lastAudit: '2026-05-08' },
  'livingyoung':        { spend:  8_414, lastAudit: '2026-05-09' },
  'edwin-novel':        { spend:  6_949, lastAudit: '2026-05-07' },
  'authority-builders': { spend:  6_846, lastAudit: '2026-05-10' },
  'linkbuilder':        { spend:  1_256, lastAudit: '2026-05-06' },
  'flock':              { spend:    517, lastAudit: '2026-05-10' },
};

/* ─── projectChip — hue-hashed mark, lifted from AppShell.tsx:654 ───────
 * Each project hashes to a hue, rendered at low saturation so the 8 tiles
 * live in the same dark family rather than reading as a crayon box. */
function projectChip(id: string): { bg: string; fg: string } {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const hue = h % 360;
  return {
    bg: `linear-gradient(155deg, hsl(${hue}, 40%, 22%) 0%, hsl(${hue}, 32%, 14%) 100%)`,
    fg: `hsl(${hue}, 60%, 82%)`,
  };
}

/* ─── Status derived from the canonical ACCOUNTS roster ─────────────────
 * Worst account in a project wins. attention → critical (red); warning →
 * needs attention (yellow); else healthy (green). Monochrome status is a
 * single ink-bordered pill with a coloured 8px dot — no pastel fills. */
type StatusKey = 'critical' | 'attention' | 'healthy';

function projectStatus(projectId: string): StatusKey {
  const accounts = ACCOUNTS.filter((a) => a.projectId === projectId);
  if (accounts.some((a) => a.health === 'attention')) return 'critical';
  if (accounts.some((a) => a.health === 'warning')) return 'attention';
  return 'healthy';
}

const STATUS_LABEL: Record<StatusKey, string> = {
  critical:  'Critical',
  attention: 'Needs attention',
  healthy:   'Healthy',
};

const STATUS_DOT: Record<StatusKey, string> = {
  critical:  '#F24A2E', // red-orange — same hue as the Caveat
  attention: '#D4901F', // amber
  healthy:   '#2E9B6E', // mint-strong
};

/* ─── Date formatter — "2026-05-12" → "May 12" ─────────────────────────── */

function formatAudit(iso: string): string {
  // Parse explicitly to avoid TZ surprises.
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[m - 1]} ${d}`;
}

/* ─── Page ──────────────────────────────────────────────────────────────── */

export function Projects() {
  // Sort by spend desc — matches the Caveat hint in the hero.
  const ordered: Project[] = [...PROJECTS].sort(
    (a, b) => (TILE[b.id]?.spend ?? 0) - (TILE[a.id]?.spend ?? 0),
  );

  return (
    <div className="bg-canvas">
      {/* ════════════════════════════════════════════════════════════════
          SPREAD A — DARK HERO
          40vh, bg-ink, full-bleed. H1 56px Figtree 900 white. ONE Caveat,
          down-left arrow, pointing toward the first tile in spread B.
          No CTA. No eyebrow. No tilted anything. Discipline > decoration. */}
      <section className="relative w-full bg-ink text-white">
        <div className="mx-auto flex min-h-[40vh] max-w-[1280px] flex-col justify-end px-6 py-16 sm:px-10 sm:py-20 lg:px-16">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <h1
              className="font-display font-black leading-[0.98] tracking-[-0.02em] text-white"
              style={{ fontSize: 'clamp(32px, 6vw, 56px)' }}
            >
              Eight projects.
              <br />
              Twenty-three agents.
            </h1>

            {/* Caveat lives on dark — Caveat colour is red-orange against ink,
                which is the brand's intended high-contrast pairing. */}
            <div className="flex shrink-0 items-end pb-1 sm:pb-2">
              <Caveat arrow="down-left" text="ranked by spend" />
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          SPREAD B — 8-TILE GALLERY
          bg-canvas. 4-across on lg+, 2-across on sm, 1-col on mobile. No
          tilt. No staggered shadow. Order = sort by spend desc. */}
      <section className="mx-auto max-w-[1280px] px-6 py-16 sm:px-10 sm:py-20 lg:px-16">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {ordered.map((p) => (
            <ProjectTile key={p.id} project={p} />
          ))}
        </div>
      </section>
    </div>
  );
}

/* ─── ProjectTile ──────────────────────────────────────────────────────── */

function ProjectTile({ project }: { project: Project }) {
  const chip = projectChip(project.id);
  const status = projectStatus(project.id);
  const tile = TILE[project.id];
  const auditLabel = tile ? `Last audit / ${formatAudit(tile.lastAudit)}` : 'No audit yet';

  return (
    <div className="flex h-[320px] flex-col gap-4 border-2 border-ink bg-white p-6">
      {/* Project mark — hue-hashed square, ink border, H2 first letter. */}
      <div
        className="grid h-12 w-12 shrink-0 place-items-center border-[1.5px] border-ink"
        style={{ background: chip.bg, color: chip.fg }}
      >
        <span className="font-display text-[32px] font-black leading-none">
          {project.name.charAt(0)}
        </span>
      </div>

      {/* Name + status — H2 32px, then a single monochrome status pill. */}
      <div className="flex flex-col gap-3">
        <h2 className="font-display text-[32px] font-extrabold leading-[1.04] tracking-[-0.01em] text-ink">
          {project.name}
        </h2>

        <StatusPill status={status} />
      </div>

      {/* Mono line — the ONE mono use on the tile. 14px, ink at 65% (rendered
          via inline rgba on #0F0A1E to avoid the banned text-white/55-style
          opacity tokens). */}
      <div
        className="font-mono text-[14px] leading-none"
        style={{ color: 'rgba(15, 10, 30, 0.65)' }}
      >
        {auditLabel}
      </div>

      {/* Bottom — ghost PillButton, pushed via mt-auto. PillButton ships at
          body 17px by default, so it slots into the 5-size rule cleanly.
          Padding tightened so the pill sits proportionally inside a 300×320
          tile without overflowing. */}
      <div className="mt-auto">
        <PillButton href={`/projects/${project.id}`} variant="ghost" className="!px-5 !py-2.5">
          Open project →
        </PillButton>
      </div>
    </div>
  );
}

/* ─── StatusPill — ink-bordered, white fill, coloured dot, body 17px ─────
 * Monochrome rule: the pill itself is white-on-ink-border. Status colour
 * lives ONLY in the 8px dot, never as a fill or as the label text. */

function StatusPill({ status }: { status: StatusKey }) {
  return (
    <span className="inline-flex w-fit items-center gap-2 border-[1.5px] border-ink bg-white px-3 py-1.5 text-ink">
      <span
        aria-hidden="true"
        className="inline-block h-2 w-2 rounded-full"
        style={{ background: STATUS_DOT[status] }}
      />
      <span className="font-sans text-[17px] font-medium leading-none">
        {STATUS_LABEL[status]}
      </span>
    </span>
  );
}

