import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  House, Robot, Lightning, ChartLineUp, ChatCircle,
  TrendUp, MagnifyingGlass, SidebarSimple, Plus, SquaresFour,
  CaretDown, Clock, DotsThree,
} from '@phosphor-icons/react';
import { PROJECTS, ACCOUNTS } from '../mock/projects';

// Dev-visibility nav: every page variation listed under its parent so the
// team can jump to any state. The `pages` arrays here are the source of
// truth — add a route, add a sub-page entry.
interface SubPage { label: string; to: string; }
// "Report" lives under Reports main-nav, not Agents — having it in both
// places lit two sections at once on /reports/* URLs.
const AGENT_PAGES: SubPage[] = [
  { label: 'Catalog',         to: '/agents' },
  { label: 'Detail · Launch', to: '/agents/competitor-spy' },
  { label: 'Loading',         to: '/agents/competitor-spy/loading/run-competitor-spy-running' },
];
// Projects don't get a variant dropdown — the project tiles below ARE the
// detail variants. /projects (catalog) is what "All projects" itself points
// to. Listing variants here would only re-introduce the triple-highlight bug.

// AppShell — dark sidebar (workshop chrome), light page canvas.
// The sidebar is the operator's cockpit so it carries the AI/agent dark
// language; pages stay in the light system. Page-variant dropdowns under
// Agents and Projects let the team jump to any state during the build.

const STORAGE_KEY = 'ppcio-sidebar-collapsed';

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) setCollapsed(saved === 'true');
  }, []);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  };

  return (
    <div className="flex min-h-screen w-full font-sans text-ppc-black">
      <Sidebar collapsed={collapsed} onToggle={toggle} />
      <main className="flex min-w-0 flex-1 flex-col">
        <div className="mx-auto w-full max-w-[1240px] px-8 py-10 lg:px-12 lg:py-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={`sticky top-0 flex h-screen shrink-0 flex-col border-r border-[#1a1a22] bg-[#0a0a0f] transition-[width] duration-200 ${
        collapsed ? 'w-[72px]' : 'w-[284px]'
      }`}
    >
      <BrandRow collapsed={collapsed} onToggle={onToggle} />
      <SearchRow collapsed={collapsed} />

      <nav className="flex flex-1 flex-col gap-px overflow-y-auto px-2.5 pb-3">
        <MainNavItem to="/" icon={House} label="Dashboard" collapsed={collapsed} end />
        <MainNavItem to="/chat" icon={ChatCircle} label="Chat" collapsed={collapsed} badge="2" />
        <ItemGroup
          icon={Robot}
          label="Agents"
          basePath="/agents"
          pages={AGENT_PAGES}
          collapsed={collapsed}
          status={<RunningPill count={4} />}
        />
        <MainNavItem
          to="/reports/run-competitor-spy-completed"
          icon={ChartLineUp}
          label="Reports"
          collapsed={collapsed}
          activeMatch={(p) => p.startsWith('/reports')}
        />
        <MainNavItem
          to="/runs"
          icon={Lightning}
          label="Mission control"
          collapsed={collapsed}
          dot="red"
          activeMatch={(p) => p.startsWith('/runs')}
        />

        <ProjectsSection collapsed={collapsed} />
      </nav>

      <SidebarFooter collapsed={collapsed} />
    </aside>
  );
}

// ─── Brand row ────────────────────────────────────────────────────────────

function BrandRow({ collapsed, onToggle }: SidebarProps) {
  return (
    <div className={`flex items-center pt-3.5 pb-2.5 ${collapsed ? 'justify-center px-2' : 'justify-between px-3.5'}`}>
      {!collapsed && (
        <NavLink to="/" className="flex items-center gap-2">
          <span className="grid h-[24px] w-[24px] place-items-center rounded-[6px] bg-ppc-purple-500 text-white">
            <TrendUp size={13} weight="bold" />
          </span>
          <span className="text-[14px] font-medium tracking-[-0.01em] text-white">ppc.io</span>
        </NavLink>
      )}
      <button
        onClick={onToggle}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="grid h-7 w-7 place-items-center rounded-md text-[#5a5a66] hover:bg-[#15151c] hover:text-white"
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

// ─── Search ───────────────────────────────────────────────────────────────

function SearchRow({ collapsed }: { collapsed: boolean }) {
  if (collapsed) {
    return (
      <div className="flex justify-center px-2 pb-3">
        <button
          title="Search"
          className="grid h-9 w-9 place-items-center rounded-md text-[#7a7a86] hover:bg-[#15151c] hover:text-white"
        >
          <MagnifyingGlass size={15} />
        </button>
      </div>
    );
  }
  return (
    <div className="px-3 pb-2.5">
      <div className="relative">
        <MagnifyingGlass
          size={13}
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#5a5a66]"
        />
        <input
          readOnly
          placeholder="Search or jump to"
          className="w-full cursor-pointer rounded-lg border border-[#1a1a22] bg-transparent py-[7px] pl-7 pr-11 text-[12px] text-[#e8e8ee] outline-none placeholder:text-[#5a5a66] hover:border-[#26262f] focus:border-ppc-purple-500/60"
        />
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-[#1f1f28] px-[5px] py-[1px] font-mono text-[10px] text-[#5a5a66]">
          ⌘K
        </kbd>
      </div>
    </div>
  );
}

// ─── Main nav item (flat) ─────────────────────────────────────────────────

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
  // Custom predicate so e.g. Reports stays active across every /reports/:runId,
  // not just the one we navigate to.
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
        return `group flex items-center rounded-md text-[13px] transition-colors ${
          collapsed ? 'justify-center px-2 py-[7px]' : 'gap-2 px-2.5 py-[6px]'
        } ${
          active
            ? 'bg-ppc-purple-500/20 font-medium text-white'
            : 'text-[#b8b8c0] hover:bg-[#15151c] hover:text-white'
        }`;
      }}
    >
      {({ isActive }) => {
        const active = overrideActive ?? isActive;
        return (
          <>
            <Icon
              size={15}
              weight={active ? 'fill' : 'duotone'}
              className={active ? 'text-ppc-purple-300' : 'text-[#7a7a86] group-hover:text-white'}
            />
            {!collapsed && (
              <>
                <span className="flex-1">{label}</span>
                {badge && (
                  <span className="ml-auto rounded bg-ppc-purple-500/18 px-1.5 py-[1px] text-[10px] font-medium text-[#c9c1ff]">
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

// ─── ItemGroup (page-variant dropdown — preserved from light sidebar) ────

function ItemGroup({
  icon: Icon,
  label,
  basePath,
  pages,
  collapsed,
  status,
  tintActiveMatch,
}: {
  icon: typeof House;
  label: string;
  basePath: string;
  pages: SubPage[];
  collapsed: boolean;
  status?: React.ReactNode;
  // Optional override for when to TINT the parent. Auto-open still keys off
  // basePath. Used so /projects/clear-skies opens the section without also
  // tinting "All projects" — the project tile already owns that highlight.
  tintActiveMatch?: (pathname: string) => boolean;
}) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const inSection = pathname.startsWith(basePath);
  const groupActive = tintActiveMatch ? tintActiveMatch(pathname) : inSection;
  const [open, setOpen] = useState(inSection);
  useEffect(() => {
    if (inSection) setOpen(true);
  }, [inSection]);

  if (collapsed) {
    return (
      <button
        onClick={() => navigate(pages[0].to)}
        title={label}
        className={`group flex w-full items-center justify-center rounded-lg px-2 py-2 transition-colors ${
          groupActive
            ? 'bg-ppc-purple-500/20 text-white'
            : 'text-[#b8b8c0] hover:bg-[#15151c] hover:text-white'
        }`}
      >
        <Icon
          size={15}
          weight={groupActive ? 'fill' : 'duotone'}
          className={groupActive ? 'text-ppc-purple-300' : 'text-[#7a7a86] group-hover:text-white'}
        />
      </button>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`group flex w-full items-center gap-2 rounded-md px-2.5 py-[6px] text-left text-[13px] transition-colors ${
          groupActive
            ? 'bg-ppc-purple-500/20 font-medium text-white'
            : 'text-[#b8b8c0] hover:bg-[#15151c] hover:text-white'
        }`}
      >
        <Icon
          size={15}
          weight={groupActive ? 'fill' : 'duotone'}
          className={groupActive ? 'text-ppc-purple-300' : 'text-[#7a7a86] group-hover:text-white'}
        />
        <span className="flex-1">{label}</span>
        {status}
        <CaretDown
          size={10}
          weight="bold"
          className={`text-[#5a5a66] transition-transform ${open ? '' : '-rotate-90'}`}
        />
      </button>

      {open && (
        <ul className="mb-0.5 ml-[25px] mt-px flex flex-col">
          {pages.map((sp) => (
            <li key={sp.to}>
              <NavLink
                to={sp.to}
                end
                className={({ isActive }) =>
                  `block rounded-md px-2 py-[4px] text-[12px] transition-colors ${
                    isActive
                      ? 'bg-ppc-purple-500/12 font-medium text-white'
                      : 'text-[#7a7a86] hover:text-[#e8e8ee]'
                  }`
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

// ─── Projects section (inline list — replaces the old dropdown switcher) ──

function ProjectsSection({ collapsed }: { collapsed: boolean }) {
  if (collapsed) {
    // In collapsed mode, just show project avatars as a stack.
    return (
      <div className="mt-3 flex flex-col items-center gap-1.5 border-t border-[#1a1a22] pt-3">
        {PROJECTS.map((p) => (
          <NavLink
            key={p.id}
            to={`/projects/${p.id}`}
            title={p.name}
            className={({ isActive }) =>
              `grid h-7 w-7 place-items-center rounded-md text-[11px] font-medium ${
                isActive ? 'ring-2 ring-ppc-purple-500/40' : ''
              }`
            }
            style={{ background: projectColor(p.id).bg, color: projectColor(p.id).fg }}
          >
            {p.name.charAt(0)}
          </NavLink>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between px-2.5 pb-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#5a5a66]">
            Projects
          </span>
          <span className="text-[10px] tabular-nums text-[#5a5a66]">{PROJECTS.length}</span>
        </div>
        <button
          title="New project"
          className="grid h-5 w-5 place-items-center rounded text-[#5a5a66] hover:bg-[#15151c] hover:text-white"
        >
          <Plus size={12} weight="bold" />
        </button>
      </div>

      <MainNavItem
        to="/projects"
        icon={SquaresFour}
        label="All projects"
        collapsed={false}
        end
      />

      <ul className="mt-px flex flex-col">
        {PROJECTS.map((p) => {
          const status = projectStatus(p.id);
          const color = projectColor(p.id);
          return (
            <li key={p.id}>
              <NavLink
                to={`/projects/${p.id}`}
                end
                className={({ isActive }) =>
                  `group flex items-center gap-2 overflow-hidden rounded-md px-2.5 py-[6px] text-[13px] transition-colors ${
                    isActive
                      ? 'bg-ppc-purple-500/20 font-medium text-white'
                      : 'text-[#b8b8c0] hover:bg-[#15151c] hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`grid h-[20px] w-[20px] shrink-0 place-items-center rounded text-[10.5px] font-medium ${
                        isActive ? 'ring-2 ring-ppc-purple-500/40' : ''
                      }`}
                      style={{ background: color.bg, color: color.fg }}
                    >
                      {p.name.charAt(0)}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{p.name}</span>
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

// ─── Atoms ────────────────────────────────────────────────────────────────

function StatusDot({ tone }: { tone: 'red' | 'yellow' | 'green' }) {
  const palette = {
    red:    { bg: '#ef4444', ring: 'rgba(239,68,68,0.18)' },
    yellow: { bg: '#fbbf24', ring: 'rgba(251,191,36,0.18)' },
    green:  { bg: '#22c55e', ring: 'rgba(34,197,94,0.2)' },
  }[tone];
  return (
    <span
      className="h-[6px] w-[6px] shrink-0 rounded-full"
      style={{ background: palette.bg, boxShadow: `0 0 0 2px ${palette.ring}` }}
    />
  );
}

function RunningPill({ count }: { count: number }) {
  return (
    <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-[#86efac]">
      <span
        className="h-[5px] w-[5px] rounded-full bg-[#22c55e]"
        style={{ boxShadow: '0 0 0 2px rgba(34,197,94,0.2)' }}
      />
      {count} running
    </span>
  );
}

// Deterministic per-project avatar color. Matches the eight-color palette in
// the attached design — varied enough to read at a glance, all on a dark BG.
const AVATAR_PALETTE: { bg: string; fg: string }[] = [
  { bg: '#22c55e', fg: '#052e16' }, // green
  { bg: '#ef4444', fg: '#450a0a' }, // red
  { bg: '#14b8a6', fg: '#042f2c' }, // teal
  { bg: '#10b981', fg: '#022c22' }, // emerald
  { bg: '#60a5fa', fg: '#172554' }, // sky
  { bg: '#3b82f6', fg: '#172554' }, // blue
  { bg: '#ec4899', fg: '#500724' }, // pink
  { bg: '#f59e0b', fg: '#451a03' }, // amber
];
function projectColor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length];
}

// Roll project status up from its accounts: any 'attention' → red,
// any 'warning' → yellow, else green. Keeps the dot honest.
function projectStatus(projectId: string): 'red' | 'yellow' | 'green' {
  const accounts = ACCOUNTS.filter((a) => a.projectId === projectId);
  if (accounts.some((a) => a.health === 'attention')) return 'red';
  if (accounts.some((a) => a.health === 'warning')) return 'yellow';
  return 'green';
}

// ─── Footer ───────────────────────────────────────────────────────────────

function SidebarFooter({ collapsed }: { collapsed: boolean }) {
  if (collapsed) {
    return (
      <div className="flex justify-center border-t border-[#1a1a22] px-2 py-3">
        <button
          title="Stewart Dunlop"
          className="grid h-[26px] w-[26px] place-items-center rounded-full bg-ppc-purple-500 text-[11px] font-medium text-white"
        >
          SD
        </button>
      </div>
    );
  }
  return (
    <div className="border-t border-[#1a1a22] px-2.5 pt-2.5 pb-2.5">
      <button className="mb-1.5 flex w-full items-center gap-2 rounded-lg border border-[#1a1a22] bg-[#0f0f17] px-2 py-[7px] text-left">
        <span className="grid h-[24px] w-[24px] shrink-0 place-items-center rounded-full bg-ppc-purple-500 text-[10.5px] font-medium text-white">
          SD
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12px] font-medium leading-tight text-white">
            Stewart Dunlop
          </span>
          <span className="mt-px block truncate text-[10px] text-[#7a7a86]">stewart@ppc.io</span>
        </span>
        <DotsThree size={14} weight="bold" className="text-[#5a5a66]" />
      </button>
      <div className="flex items-center justify-between px-1 text-[10px]">
        <span className="inline-flex items-center gap-1.5 text-[#c9c1ff]">
          <span
            className="h-[5px] w-[5px] rounded-full bg-ppc-purple-500"
            style={{ boxShadow: '0 0 0 2px rgba(124,109,255,0.2)' }}
          />
          <span className="font-medium tracking-[0.02em]">Beta</span>
        </span>
        <span className="inline-flex items-center gap-1.5 text-[#7a7a86]">
          <Clock size={11} weight="duotone" />
          <span className="tabular-nums">Saves ~22 h/wk</span>
        </span>
      </div>
    </div>
  );
}
