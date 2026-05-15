import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  House, Robot, ChartLineUp, ChatCircle,
  MagnifyingGlass, SidebarSimple, Plus, SquaresFour,
  CaretRight, DotsThree,
} from '@phosphor-icons/react';
import { PROJECTS, ACCOUNTS } from '../mock/projects';
import { SIDEBAR_REPORT_PAGES } from '../mock/reports';

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
  { label: 'Catalog',         to: '/agents' },
  { label: 'Detail · Launch', to: '/agents/competitor-spy' },
  { label: 'Loading',         to: '/agents/competitor-spy/loading/run-competitor-spy-running' },
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
   *  - /agents/:slug/loading|run/:runId              → tighter gutter (the run page owns its rhythm)
   *  - everything else (v1 canonical)                → padded max-w-[1240px] wrapper
   *
   * v1 pages were authored against the standard wrapper, so removing it breaks
   * their spacing. The agent-run route gets its own breathing room because the
   * dark mission-feed card already provides internal padding, and a wide outer
   * gutter pushes the headline too far from the sidebar. */
  const isChat = pathname === '/chat' || pathname.startsWith('/chat/')
              || pathname === '/v2/chat' || pathname.startsWith('/v2/chat/');
  const isV2 = pathname === '/v2' || pathname.startsWith('/v2/');
  const isAgentRun = /^\/agents\/[^/]+\/(loading|run)\//.test(pathname);
  const fullBleed = isChat || isV2 || isAgentRun;

  return (
    <div className="flex min-h-screen w-full font-sans text-ppc-black">
      <Sidebar collapsed={collapsed} onToggle={toggle} />
      <main className="flex min-w-0 flex-1 flex-col">
        {fullBleed ? (
          <Outlet />
        ) : (
          <div className="mx-auto w-full max-w-[1240px] px-8 py-10 lg:px-12 lg:py-12">
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
          <MainNavItem to="/" icon={House} label="Dashboard" collapsed={collapsed} end />
          <MainNavItem to="/chat" icon={ChatCircle} label="Chat" collapsed={collapsed} badge="2" />
          <ItemGroup
            icon={Robot}
            label="Agents"
            basePath="/agents"
            pages={AGENT_PAGES}
            collapsed={collapsed}
            runningCount={4}
          />
          <ItemGroup
            icon={ChartLineUp}
            label="Reports"
            basePath="/reports"
            pages={REPORT_PAGES}
            collapsed={collapsed}
          />
          <ProjectsSection collapsed={collapsed} />
        </nav>

        <SidebarFooter collapsed={collapsed} />
      </div>
    </aside>
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
  to, icon: Icon, label, collapsed, end, badge, dot, activeMatch,
}: {
  to: string;
  icon: typeof House;
  label: string;
  collapsed: boolean;
  end?: boolean;
  badge?: string;
  dot?: 'red' | 'green' | 'yellow';
  activeMatch?: (pathname: string) => boolean;
}) {
  const { pathname } = useLocation();
  const overrideActive = activeMatch ? activeMatch(pathname) : null;

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
}: {
  icon: typeof House;
  label: string;
  basePath: string;
  pages: SubPage[];
  collapsed: boolean;
  runningCount?: number;
}) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const inSection = pathname.startsWith(basePath);
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
  if (collapsed) {
    return (
      <div className="mt-3 flex flex-col items-center gap-1.5 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {PROJECTS.map((p) => {
          const status = projectStatus(p.id);
          const chip = projectChip(p.id);
          return (
            <NavLink
              key={p.id}
              to={`/projects/${p.id}`}
              title={p.name}
              className="group relative"
            >
              {({ isActive }) => (
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
              )}
            </NavLink>
          );
        })}
      </div>
    );
  }

  return (
    <div className="mt-5">
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
          return (
            <li key={p.id}>
              <NavLink
                to={`/projects/${p.id}`}
                end
                className={({ isActive }) =>
                  `group relative flex items-center gap-2.5 overflow-hidden rounded-[9px] px-3 py-[7px] text-[13px] transition-colors duration-150 ${
                    isActive
                      ? 'font-semibold text-white'
                      : 'font-medium text-white/80 hover:bg-white/[0.05] hover:text-white'
                  }`
                }
                style={({ isActive }) =>
                  isActive
                    ? {
                        background:
                          'linear-gradient(90deg, rgba(127,90,240,0.18) 0%, rgba(127,90,240,0.05) 60%, rgba(127,90,240,0) 100%)',
                        boxShadow: 'inset 0 0 0 1px rgba(127,90,240,0.32)',
                      }
                    : undefined
                }
              >
                {({ isActive }) => (
                  <>
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
                  </>
                )}
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
