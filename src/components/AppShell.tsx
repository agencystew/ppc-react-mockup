import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  House, Robot, ChartLineUp, ChatCircle,
  MagnifyingGlass, SidebarSimple, Plus, SquaresFour,
  CaretRight, DotsThree, X, ArrowsLeftRight,
} from '@phosphor-icons/react';
import { PROJECTS, ACCOUNTS } from '../mock/projects';
import { SIDEBAR_REPORT_PAGES } from '../mock/reports';

/* Path-prefix scope: anything under /projects/<id>/... (or /projects/<id>) is
 * project-scoped — the cockpit, agents, reports, runs. Plain /projects (the
 * index) stays workspace mode. The ScopePill, sidebar active-state mirror, and
 * any future scoped surface all read from this single helper. */
function getScopedProjectId(pathname: string): string | null {
  const m = pathname.match(/^\/projects\/([^/]+)(?:\/|$)/);
  if (!m) return null;
  const id = m[1];
  return PROJECTS.some((p) => p.id === id) ? id : null;
}

/* AppShell — "Inhabited Dark" sidebar.
 *
 * Replaces the previous chunky purple-fill active state (which felt like a
 * generic SaaS template) with an atmospheric rail: subtle radial top-glow,
 * tonal project chips, and a soft-tint + 2px gradient accent-bar treatment
 * for the active row. The sidebar now reads as the same world as the main
 * content's dark hero card, not a different product.
 *
 * One signature moment: the lowercase "ppc" wordmark gets a single italic
 * serif period — echoing the hero card's italic period in "Google Ads."
 */

interface SubPage { label: string; to: string; }
const AGENT_PAGES: SubPage[] = [
  { label: 'Catalog',                to: '/agents' },
  { label: 'Detail · Launch',        to: '/agents/competitor-spy' },
  { label: 'Loading · multi-step',   to: '/agents/competitor-spy/loading/run-competitor-spy-running' },
  { label: 'Loading · single-step',  to: '/agents/spend-leak/loading/run-spend-leak-running' },
];

// Reports dropdown — index + every individual report keyed by runId.
// Source: SIDEBAR_REPORT_PAGES in mock/reports.ts (single source of truth).
const REPORT_PAGES: SubPage[] = [
  { label: 'All reports', to: '/reports' },
  ...SIDEBAR_REPORT_PAGES.map((r) => ({
    label: truncate(r.label, 32),
    to: `/reports/${r.runId}`,
  })),
];

function truncate(s: string, max: number) {
  return s.length > max ? s.slice(0, max - 1).trimEnd() + '…' : s;
}

const STORAGE_KEY = 'ppcio-sidebar-collapsed';

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) setCollapsed(saved === 'true');
  }, []);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  };

  /* Layout posture per route family:
   *  - /chat, /chat/:id and /v2/chat, /v2/chat/:id  → full-bleed (chat surface owns its own 3-col)
   *  - /v2/*                                         → full-bleed (v2 pages own their own bands)
   *  - everything else (v1 canonical)                → padded max-w-[1240px] wrapper
   *
   * v1 pages were authored against this wrapper, so removing it breaks their spacing. */
  const isChat = pathname === '/chat' || pathname.startsWith('/chat/')
              || pathname === '/v2/chat' || pathname.startsWith('/v2/chat/');
  const isV2 = pathname === '/v2' || pathname.startsWith('/v2/');
  const fullBleed = isChat || isV2;

  return (
    <div className="flex min-h-screen w-full font-sans text-ppc-black">
      <Sidebar collapsed={collapsed} onToggle={toggle} />
      <main className="flex min-w-0 flex-1 flex-col">
        {fullBleed ? (
          <Outlet />
        ) : (
          <div className="mx-auto w-full max-w-[1240px] px-8 pt-6 pb-10 lg:px-12 lg:pb-12">
            <ScopePill />
            <Outlet />
          </div>
        )}
      </main>
    </div>
  );
}

/* ─── Sidebar shell ─────────────────────────────────────────────────────── */

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { pathname } = useLocation();
  // In project mode, Agents + Reports rebind to their project-scoped equivalents
  // so clicking them stays in the project rather than ejecting back to global.
  // Dashboard + Chat stay global — clicking them is an explicit exit (Dashboard
  // IS the cross-account portfolio; chat is workspace-level v1).
  // Only the ScopePill's "× exit" chip explicitly drops the project context.
  const scopedId = getScopedProjectId(pathname);
  const inProjectMode = !!scopedId;
  const projectPrefix = scopedId ? `/projects/${scopedId}` : '';
  const rebindAgentPages = inProjectMode
    ? AGENT_PAGES.map((p) => ({ ...p, to: p.to.replace(/^\/agents/, `${projectPrefix}/agents`) }))
    : AGENT_PAGES;
  const rebindReportPages = inProjectMode
    ? REPORT_PAGES.map((p) => ({ ...p, to: p.to.replace(/^\/reports/, `${projectPrefix}/reports`) }))
    : REPORT_PAGES;

  return (
    <aside
      className={`relative sticky top-0 flex h-screen shrink-0 flex-col transition-[width] duration-200 ${
        collapsed ? 'w-[72px]' : 'w-[264px]'
      }`}
      style={{
        background:
          'linear-gradient(180deg, #07050D 0%, #050308 55%, #030206 100%)',
        boxShadow: 'inset -1px 0 0 rgba(255,255,255,0.05)',
      }}
    >
      {/* Subtle purple bloom only at the very top, blending into deep black */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[240px]"
        style={{
          background:
            'radial-gradient(60% 55% at 28% -10%, rgba(127,90,240,0.12) 0%, transparent 65%)',
        }}
      />

      <div className="relative flex h-full flex-col">
        <BrandRow collapsed={collapsed} onToggle={onToggle} />
        <SearchRow collapsed={collapsed} />

        <nav className="flex flex-1 flex-col gap-[2px] overflow-y-auto px-3 pb-3">
          {!collapsed && <SectionLabel>Workspace</SectionLabel>}
          <MainNavItem to="/" icon={House} label="Dashboard" collapsed={collapsed} end forceInactive={inProjectMode} />
          <MainNavItem to="/chat" icon={ChatCircle} label="Chat" collapsed={collapsed} badge="2" forceInactive={inProjectMode} />
          <ItemGroup
            icon={Robot}
            label="Agents"
            basePath={inProjectMode ? `${projectPrefix}/agents` : '/agents'}
            pages={rebindAgentPages}
            collapsed={collapsed}
            runningCount={4}
          />
          <ItemGroup
            icon={ChartLineUp}
            label="Reports"
            basePath={inProjectMode ? `${projectPrefix}/reports` : '/reports'}
            pages={rebindReportPages}
            collapsed={collapsed}
          />
          <ProjectsSection collapsed={collapsed} />
        </nav>

        <SidebarFooter collapsed={collapsed} />
      </div>
    </aside>
  );
}

/* Mono uppercase eyebrow used to label sidebar zones (Workspace / Projects).
 * Same Courier New + 0.16em tracking as the existing Projects label. */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-1 px-3 pt-1">
      <span
        className="text-[10px] font-semibold uppercase leading-none text-white/55"
        style={{
          fontFamily: '"Courier New", ui-monospace, monospace',
          letterSpacing: '0.16em',
        }}
      >
        {children}
      </span>
    </div>
  );
}

/* ─── Brand row ─────────────────────────────────────────────────────────── */

function BrandRow({ collapsed, onToggle }: SidebarProps) {
  return (
    <div className={`relative flex items-center pt-5 pb-4 ${collapsed ? 'justify-center px-2' : 'justify-between px-4'}`}>
      {!collapsed && (
        <NavLink to="/" className="group flex items-center gap-2.5">
          <span
            className="relative grid h-[28px] w-[28px] place-items-center overflow-hidden rounded-[8px] text-[13px] font-extrabold leading-none text-white"
            style={{
              background: 'linear-gradient(155deg, #A88CFF 0%, #7F5AF0 55%, #534AB7 100%)',
              boxShadow:
                '0 1px 0 rgba(255,255,255,0.18) inset, 0 0 0 1px rgba(127,90,240,0.55), 0 6px 14px -6px rgba(127,90,240,0.55)',
            }}
          >
            <span
              aria-hidden
              className="absolute inset-0 opacity-50"
              style={{
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 55%)',
              }}
            />
            <span className="relative">ɪ</span>
          </span>
          <span className="flex items-baseline text-[15px] font-bold tracking-[-0.02em] text-white">
            ppc
            <span
              className="ml-[1px] font-serif italic font-bold leading-none text-[#B08EF4]"
              style={{ fontFamily: 'PF-Marlet-Display, "Playfair Display", Georgia, serif' }}
            >
              .
            </span>
            io
          </span>
        </NavLink>
      )}
      <button
        onClick={onToggle}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="grid h-8 w-8 place-items-center rounded-md text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white"
      >
        <SidebarSimple
          size={16}
          weight="duotone"
          className={`transition-transform ${collapsed ? 'rotate-180' : ''}`}
        />
      </button>
    </div>
  );
}

/* ─── Search ────────────────────────────────────────────────────────────── */

function SearchRow({ collapsed }: { collapsed: boolean }) {
  if (collapsed) {
    return (
      <div className="flex justify-center px-2 pb-3">
        <button
          title="Search"
          className="grid h-9 w-9 place-items-center rounded-lg text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          <MagnifyingGlass size={15} />
        </button>
      </div>
    );
  }
  return (
    <div className="px-3 pb-4">
      <div className="group relative">
        <MagnifyingGlass
          size={13.5}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/45 transition-colors group-hover:text-white/80"
        />
        <input
          readOnly
          placeholder="Search or jump to"
          className="w-full cursor-pointer rounded-[10px] border border-white/[0.07] bg-white/[0.03] py-[8.5px] pl-[34px] pr-14 text-[13px] text-white outline-none placeholder:text-white/50 transition-colors hover:border-white/[0.12] hover:bg-white/[0.05]"
        />
        <kbd
          className="pointer-events-none absolute right-2.5 top-1/2 flex h-[18px] -translate-y-1/2 items-center rounded-[5px] border border-white/[0.10] bg-white/[0.04] px-[6px] font-mono text-[10px] leading-none text-white/65"
          style={{ fontFamily: '"Courier New", ui-monospace, Menlo, monospace' }}
        >
          ⌘K
        </kbd>
      </div>
    </div>
  );
}

/* ─── Main nav item ─────────────────────────────────────────────────────── */

function MainNavItem({
  to, icon: Icon, label, collapsed, end, badge, dot, activeMatch, forceInactive,
}: {
  to: string;
  icon: typeof House;
  label: string;
  collapsed: boolean;
  end?: boolean;
  badge?: string;
  dot?: 'red' | 'green' | 'yellow';
  activeMatch?: (pathname: string) => boolean;
  forceInactive?: boolean;
}) {
  const { pathname } = useLocation();
  const overrideActive = forceInactive ? false : (activeMatch ? activeMatch(pathname) : null);

  return (
    <NavLink
      to={to}
      end={end}
      title={collapsed ? label : undefined}
      className={({ isActive }) => {
        const active = overrideActive ?? isActive;
        return `group relative flex items-center rounded-[9px] text-[13.5px] transition-colors duration-150 ${
          collapsed ? 'justify-center px-2 py-[9px]' : 'gap-2.5 px-3 py-[8px]'
        } ${
          active
            ? 'font-semibold text-white'
            : 'font-medium text-white/80 hover:bg-white/[0.05] hover:text-white'
        }`;
      }}
      style={({ isActive }) => {
        const active = overrideActive ?? isActive;
        return active
          ? {
              background:
                'linear-gradient(90deg, rgba(127,90,240,0.48) 0%, rgba(127,90,240,0.18) 55%, rgba(127,90,240,0) 100%)',
              boxShadow: 'inset 0 0 0 1px rgba(127,90,240,0.32)',
            }
          : undefined;
      }}
    >
      {({ isActive }) => {
        const active = overrideActive ?? isActive;
        return (
          <>
            {active && !collapsed && <ActiveAccent />}
            <Icon
              size={17}
              weight={active ? 'fill' : 'duotone'}
              className={
                active
                  ? 'text-[#D3C6FF]'
                  : 'text-white transition-colors group-hover:text-white'
              }
            />
            {!collapsed && (
              <>
                <span className="flex-1 tracking-[-0.005em]">{label}</span>
                {badge && (
                  <span
                    className={`ml-auto inline-flex h-[18px] min-w-[20px] items-center justify-center rounded-[5px] px-[5px] text-[10.5px] font-semibold leading-none tabular-nums ${
                      active
                        ? 'bg-white/15 text-white'
                        : 'bg-white/[0.07] text-white/70'
                    }`}
                  >
                    {badge}
                  </span>
                )}
                {dot && <StatusDot tone={dot} />}
              </>
            )}
          </>
        );
      }}
    </NavLink>
  );
}

/* Left edge accent: 2px vertical pill with a soft purple gradient + glow.
 * Replaces the chunky background fill the previous active state used. */
function ActiveAccent() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute left-0 top-1/2 h-[18px] w-[2.5px] -translate-y-1/2 rounded-r-full"
      style={{
        background: 'linear-gradient(180deg, #C7B0FF 0%, #7F5AF0 100%)',
        boxShadow: '0 0 10px 0 rgba(127,90,240,0.55)',
      }}
    />
  );
}

/* ─── ItemGroup (expandable section) ────────────────────────────────────── */

function ItemGroup({
  icon: Icon,
  label,
  basePath,
  pages,
  collapsed,
  runningCount,
  forceInactive,
}: {
  icon: typeof House;
  label: string;
  basePath: string;
  pages: SubPage[];
  collapsed: boolean;
  runningCount?: number;
  forceInactive?: boolean;
}) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const inSection = !forceInactive && pathname.startsWith(basePath);
  const [open, setOpen] = useState(inSection);
  useEffect(() => {
    if (inSection) setOpen(true);
  }, [inSection]);

  if (collapsed) {
    return (
      <button
        onClick={() => navigate(pages[0].to)}
        title={label}
        className={`group relative flex w-full items-center justify-center rounded-[9px] px-2 py-[9px] transition-colors ${
          inSection
            ? 'font-semibold text-white'
            : 'text-white/80 hover:bg-white/[0.05] hover:text-white'
        }`}
        style={
          inSection
            ? {
                background:
                  'linear-gradient(90deg, rgba(127,90,240,0.48) 0%, rgba(127,90,240,0.18) 100%)',
                boxShadow: 'inset 0 0 0 1px rgba(127,90,240,0.32)',
              }
            : undefined
        }
      >
        <Icon
          size={17}
          weight={inSection ? 'fill' : 'duotone'}
          className={
            inSection
              ? 'text-[#D3C6FF]'
              : 'text-white transition-colors group-hover:text-white'
          }
        />
      </button>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`group relative flex w-full items-center gap-2.5 rounded-[9px] px-3 py-[8px] text-left text-[13.5px] transition-colors duration-150 ${
          inSection
            ? 'font-semibold text-white'
            : 'font-medium text-white/80 hover:bg-white/[0.05] hover:text-white'
        }`}
        style={
          inSection
            ? {
                background:
                  'linear-gradient(90deg, rgba(127,90,240,0.48) 0%, rgba(127,90,240,0.18) 55%, rgba(127,90,240,0) 100%)',
                boxShadow: 'inset 0 0 0 1px rgba(127,90,240,0.32)',
              }
            : undefined
        }
      >
        {inSection && <ActiveAccent />}
        <Icon
          size={17}
          weight={inSection ? 'fill' : 'duotone'}
          className={
            inSection
              ? 'text-[#D3C6FF]'
              : 'text-white transition-colors group-hover:text-white'
          }
        />
        <span className="flex-1 tracking-[-0.005em]">{label}</span>
        {runningCount !== undefined && <RunningIndicator count={runningCount} />}
        <CaretRight
          size={10}
          weight="bold"
          className={`shrink-0 ${
            inSection ? 'text-white/55' : 'text-white/45'
          } transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
        />
      </button>

      {open && (
        <ul
          className="relative mb-1 ml-[24px] mt-1 flex flex-col gap-[1px] pl-3"
          style={{
            background:
              'linear-gradient(180deg, rgba(127,90,240,0.30) 0%, rgba(127,90,240,0.06) 100%)',
            backgroundSize: '1px 100%',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'left top',
          }}
        >
          {pages.map((sp) => (
            <li key={sp.to}>
              <NavLink
                to={sp.to}
                end
                className={({ isActive }) =>
                  `block rounded-[7px] px-2.5 py-[6px] text-[12.5px] transition-colors duration-150 ${
                    isActive
                      ? 'font-semibold text-white'
                      : 'font-medium text-white/65 hover:bg-white/[0.05] hover:text-white'
                  }`
                }
                style={({ isActive }) =>
                  isActive
                    ? {
                        background:
                          'linear-gradient(90deg, rgba(127,90,240,0.42) 0%, rgba(127,90,240,0.10) 100%)',
                      }
                    : undefined
                }
              >
                {sp.label}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ─── Projects section ──────────────────────────────────────────────────── */

function ProjectsSection({ collapsed }: { collapsed: boolean }) {
  const { pathname } = useLocation();
  // Chip stays highlighted across the project sub-app (cockpit, scoped agents,
  // scoped runs, scoped reports) — not just the cockpit URL. NavLink's `end`
  // can't express that, so we drive active state from getScopedProjectId.
  const scopedId = getScopedProjectId(pathname);

  if (collapsed) {
    return (
      <div className="mt-3 flex flex-col items-center gap-1.5 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {PROJECTS.map((p) => {
          const status = projectStatus(p.id);
          const chip = projectChip(p.id);
          const isActive = scopedId === p.id;
          return (
            <NavLink
              key={p.id}
              to={`/projects/${p.id}`}
              title={p.name}
              className="group relative"
            >
              <span
                className={`grid h-8 w-8 place-items-center rounded-[7px] text-[11px] font-semibold transition-all ${
                  isActive ? '' : 'opacity-90 group-hover:opacity-100'
                }`}
                style={{
                  background: chip.bg,
                  color: chip.fg,
                  boxShadow: isActive
                    ? `inset 0 0 0 1px ${chip.ring}, 0 0 0 2px rgba(127,90,240,0.45)`
                    : `inset 0 0 0 1px ${chip.ring}`,
                }}
              >
                {p.name.charAt(0)}
                <StatusOrb tone={status} />
              </span>
            </NavLink>
          );
        })}
      </div>
    );
  }

  return (
    <div className="mt-5 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center justify-between px-3 pb-2">
        <div className="flex items-center gap-[7px]">
          <span
            className="text-[10px] font-semibold uppercase leading-none text-white/55"
            style={{
              fontFamily: '"Courier New", ui-monospace, monospace',
              letterSpacing: '0.16em',
            }}
          >
            Projects
          </span>
          <span
            className="text-[10px] tabular-nums leading-none text-white/40"
            style={{ fontFamily: '"Courier New", ui-monospace, monospace' }}
          >
            {PROJECTS.length}
          </span>
        </div>
        <button
          title="New project"
          className="grid h-[18px] w-[18px] place-items-center rounded-[4px] text-white/50 transition-colors hover:bg-white/[0.08] hover:text-white"
        >
          <Plus size={11} weight="bold" />
        </button>
      </div>

      <MainNavItem
        to="/projects"
        icon={SquaresFour}
        label="All projects"
        collapsed={false}
        end
      />

      <ul className="mt-px flex flex-col gap-[1px]">
        {PROJECTS.map((p) => {
          const status = projectStatus(p.id);
          const chip = projectChip(p.id);
          const isActive = scopedId === p.id;
          return (
            <li key={p.id}>
              <NavLink
                to={`/projects/${p.id}`}
                className={`group relative flex items-center gap-2.5 overflow-hidden rounded-[9px] px-3 py-[7px] text-[13px] transition-colors duration-150 ${
                  isActive
                    ? 'font-semibold text-white'
                    : 'font-medium text-white/80 hover:bg-white/[0.05] hover:text-white'
                }`}
                style={
                  isActive
                    ? {
                        background:
                          'linear-gradient(90deg, rgba(127,90,240,0.18) 0%, rgba(127,90,240,0.05) 60%, rgba(127,90,240,0) 100%)',
                        boxShadow: 'inset 0 0 0 1px rgba(127,90,240,0.32)',
                      }
                    : undefined
                }
              >
                {isActive && <ActiveAccent />}
                <span
                  className="relative grid h-[22px] w-[22px] shrink-0 place-items-center rounded-[6px] text-[10.5px] font-semibold leading-none"
                  style={{
                    background: chip.bg,
                    color: chip.fg,
                    boxShadow: `inset 0 0 0 1px ${chip.ring}`,
                  }}
                >
                  {p.name.charAt(0)}
                </span>
                <span className="min-w-0 flex-1 truncate tracking-[-0.005em]">{p.name}</span>
                <StatusDot tone={status} />
              </NavLink>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ─── Atoms ─────────────────────────────────────────────────────────────── */

function StatusDot({ tone }: { tone: 'red' | 'yellow' | 'green' }) {
  const palette = {
    red:    { bg: '#E0524F', glow: 'rgba(224,82,79,0.30)' },
    yellow: { bg: '#D69A35', glow: 'rgba(214,154,53,0.28)' },
    green:  { bg: '#5DC2A2', glow: 'rgba(93,194,162,0.28)' },
  }[tone];
  return (
    <span
      className="h-[6px] w-[6px] shrink-0 rounded-full"
      style={{ background: palette.bg, boxShadow: `0 0 0 2px ${palette.glow}` }}
    />
  );
}

/* Inner status orb used inside collapsed project chips */
function StatusOrb({ tone }: { tone: 'red' | 'yellow' | 'green' }) {
  const palette = {
    red:    '#E0524F',
    yellow: '#D69A35',
    green:  '#5DC2A2',
  }[tone];
  return (
    <span
      aria-hidden
      className="absolute -right-[2px] -top-[2px] h-[7px] w-[7px] rounded-full"
      style={{
        background: palette,
        boxShadow: '0 0 0 1.5px #120C26',
      }}
    />
  );
}

/* Refined "running" indicator — pulse dot + Courier label, not a bright pill. */
function RunningIndicator({ count }: { count: number }) {
  return (
    <span
      className="inline-flex items-center gap-[5px] text-[10px] font-semibold leading-none text-[#A6E3C6]"
      style={{
        fontFamily: '"Courier New", ui-monospace, monospace',
        letterSpacing: '0.04em',
      }}
    >
      <span
        className="relative h-[5px] w-[5px] rounded-full"
        style={{
          background: '#5DC2A2',
          boxShadow: '0 0 0 2px rgba(93,194,162,0.24), 0 0 8px rgba(93,194,162,0.55)',
        }}
      />
      <span className="tabular-nums">{count}</span>
    </span>
  );
}

/* Project chip — desaturated tonal squares (Linear-style), not crayons.
 * Each project hashes to a hue, but we render at low saturation over a dark
 * base so every chip lives in the same dark family. */
function projectChip(id: string): { bg: string; fg: string; ring: string } {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const hue = h % 360;
  return {
    bg:   `linear-gradient(155deg, hsl(${hue}, 40%, 22%) 0%, hsl(${hue}, 32%, 14%) 100%)`,
    fg:   `hsl(${hue}, 60%, 82%)`,
    ring: `hsla(${hue}, 55%, 55%, 0.25)`,
  };
}

function projectStatus(projectId: string): 'red' | 'yellow' | 'green' {
  const accounts = ACCOUNTS.filter((a) => a.projectId === projectId);
  if (accounts.some((a) => a.health === 'attention')) return 'red';
  if (accounts.some((a) => a.health === 'warning')) return 'yellow';
  return 'green';
}

/* ─── Footer ────────────────────────────────────────────────────────────── */

function SidebarFooter({ collapsed }: { collapsed: boolean }) {
  if (collapsed) {
    return (
      <div className="flex justify-center px-2 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          title="Stewart Dunlop"
          className="grid h-9 w-9 place-items-center rounded-full text-[12px] font-bold text-white"
          style={{
            background: 'linear-gradient(135deg, #C7B0FF 0%, #7F5AF0 100%)',
            boxShadow:
              '0 0 0 1px rgba(127,90,240,0.45), 0 4px 12px -4px rgba(127,90,240,0.45)',
          }}
        >
          SD
        </button>
      </div>
    );
  }
  return (
    <div className="px-3 pb-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <button
        className="mb-3 flex w-full items-center gap-2.5 rounded-[11px] border border-white/[0.06] bg-white/[0.025] px-2.5 py-[8px] text-left transition-colors hover:border-white/[0.12] hover:bg-white/[0.05]"
      >
        <span
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[11.5px] font-bold text-white"
          style={{
            background: 'linear-gradient(135deg, #C7B0FF 0%, #7F5AF0 100%)',
            boxShadow:
              '0 0 0 1px rgba(127,90,240,0.40), 0 3px 10px -4px rgba(127,90,240,0.50)',
          }}
        >
          SD
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12.5px] font-semibold leading-tight tracking-[-0.005em] text-white">
            Stewart Dunlop
          </span>
          <span className="mt-[2px] block truncate text-[11px] leading-tight text-white/55">
            stewart@ppc.io
          </span>
        </span>
        <DotsThree size={15} weight="bold" className="text-white/45" />
      </button>
    </div>
  );
}

/* ─── ScopePill — the orientation answer ────────────────────────────────────
 * Persistent indicator at the top of every workspace/project content area.
 *  - Workspace: mono eyebrow "PORTFOLIO · ALL ACCOUNTS"  (low weight)
 *  - Project:   pill with project chip + name + Project label, plus a Switch
 *               popover and an Exit chip back to the workspace sibling.
 * The pill is the loudest "where am I" cue. Sidebar mirrors mode but eyes
 * go to the page first.                                                     */
function ScopePill() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!switcherOpen) return;
    const onClick = (e: MouseEvent) => {
      if (switcherRef.current && !switcherRef.current.contains(e.target as Node)) {
        setSwitcherOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [switcherOpen]);

  const scopedId = getScopedProjectId(pathname);
  const project = scopedId ? PROJECTS.find((p) => p.id === scopedId) : null;

  // Workspace mode — small mono eyebrow, intentionally low weight.
  if (!project) {
    return (
      <div className="mb-5 flex items-center gap-2">
        <span
          className="h-[6px] w-[6px] rounded-full"
          style={{ background: '#a1a1aa', boxShadow: '0 0 0 2px rgba(161,161,170,0.18)' }}
        />
        <span
          className="text-[10.5px] font-semibold uppercase leading-none text-ppc-black/55"
          style={{
            fontFamily: '"Courier New", ui-monospace, monospace',
            letterSpacing: '0.16em',
          }}
        >
          Portfolio · All accounts
        </span>
      </div>
    );
  }

  const chip = projectChip(project.id);
  // Exit lands you on the workspace sibling of the current page rather than
  // blanket-redirecting to Dashboard. /projects/hoth/reports → /reports.
  const tail = pathname.startsWith(`/projects/${project.id}/`)
    ? '/' + pathname.slice(`/projects/${project.id}/`.length).split('/')[0]
    : '/';

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      <div
        ref={switcherRef}
        className="relative flex items-center rounded-full border bg-white"
        style={{
          borderColor: 'rgba(127,90,240,0.28)',
          boxShadow: '0 1px 0 rgba(127,90,240,0.06), 0 4px 14px -8px rgba(127,90,240,0.30)',
        }}
      >
        <NavLink
          to={`/projects/${project.id}`}
          title={`${project.name} cockpit`}
          className="flex items-center gap-2 pl-[3px] pr-2"
        >
          <span
            className="grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full text-[10.5px] font-semibold leading-none"
            style={{ background: chip.bg, color: chip.fg, boxShadow: `inset 0 0 0 1px ${chip.ring}` }}
          >
            {project.name.charAt(0)}
          </span>
          <span className="text-[12.5px] font-semibold tracking-[-0.005em] text-ppc-black">
            {project.name}
          </span>
        </NavLink>
        <span
          className="text-[10.5px] font-semibold uppercase text-ppc-black/45"
          style={{ fontFamily: '"Courier New", ui-monospace, monospace', letterSpacing: '0.14em' }}
        >
          Project
        </span>
        <button
          type="button"
          onClick={() => setSwitcherOpen((v) => !v)}
          title="Switch project"
          className="ml-1 grid h-[22px] w-[22px] place-items-center rounded-full text-ppc-black/55 transition-colors hover:bg-black/[0.04] hover:text-ppc-black"
        >
          <ArrowsLeftRight size={11} weight="bold" />
        </button>
        <button
          type="button"
          onClick={() => navigate(tail)}
          title="Exit to workspace"
          className="mr-[3px] grid h-[22px] w-[22px] place-items-center rounded-full text-ppc-black/55 transition-colors hover:bg-black/[0.04] hover:text-ppc-black"
        >
          <X size={11} weight="bold" />
        </button>

        {switcherOpen && (
          <div
            className="absolute left-0 top-full z-20 mt-1.5 w-[230px] overflow-hidden rounded-[10px] border bg-white"
            style={{
              borderColor: 'rgba(0,0,0,0.08)',
              boxShadow: '0 12px 30px -12px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.06)',
            }}
          >
            <div
              className="px-3 pt-2.5 pb-1.5 text-[10px] font-semibold uppercase text-ppc-black/45"
              style={{ fontFamily: '"Courier New", ui-monospace, monospace', letterSpacing: '0.14em' }}
            >
              Switch project
            </div>
            <ul className="max-h-[240px] overflow-y-auto pb-1">
              {PROJECTS.map((p) => {
                const c = projectChip(p.id);
                const isCurrent = p.id === project.id;
                const target = pathname.replace(`/projects/${project.id}`, `/projects/${p.id}`);
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      disabled={isCurrent}
                      onClick={() => {
                        setSwitcherOpen(false);
                        if (!isCurrent) navigate(target);
                      }}
                      className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12.5px] transition-colors ${
                        isCurrent ? 'cursor-default text-ppc-black/45' : 'text-ppc-black hover:bg-black/[0.03]'
                      }`}
                    >
                      <span
                        className="grid h-[20px] w-[20px] shrink-0 place-items-center rounded-[5px] text-[10px] font-semibold leading-none"
                        style={{ background: c.bg, color: c.fg, boxShadow: `inset 0 0 0 1px ${c.ring}` }}
                      >
                        {p.name.charAt(0)}
                      </span>
                      <span className="flex-1 truncate font-medium tracking-[-0.005em]">{p.name}</span>
                      {isCurrent && (
                        <span
                          className="text-[9.5px] font-semibold uppercase text-ppc-black/40"
                          style={{ fontFamily: '"Courier New", ui-monospace, monospace', letterSpacing: '0.14em' }}
                        >
                          Active
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
