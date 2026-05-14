import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  House, Robot, Lightning, ChartLineUp, ChatCircle,
  MagnifyingGlass, SidebarSimple, Plus, SquaresFour,
  CaretDown, Clock, DotsThree,
} from '@phosphor-icons/react';
import { PROJECTS, ACCOUNTS } from '../mock/projects';

// AppShell — DARK sidebar chrome (dark-mode of the same structure that was
// in the white version: same sizes, same paddings, same components). Active
// state inverts pale-purple-chip-on-white into solid-purple-chip-on-dark so
// "click highlights purple" reads loudly. Page canvas stays light.

interface SubPage { label: string; to: string; }
const AGENT_PAGES: SubPage[] = [
  { label: 'Catalog',         to: '/agents' },
  { label: 'Detail · Launch', to: '/agents/competitor-spy' },
  { label: 'Loading',         to: '/agents/competitor-spy/loading/run-competitor-spy-running' },
];

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
      className={`sticky top-0 flex h-screen shrink-0 flex-col border-r border-[#1E1830] bg-ppc-sidebar transition-[width] duration-200 ${
        collapsed ? 'w-[72px]' : 'w-[260px]'
      }`}
    >
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
    <div className={`flex items-center pt-4 pb-3 ${collapsed ? 'justify-center px-2' : 'justify-between px-4'}`}>
      {!collapsed && (
        <NavLink to="/" className="flex items-center gap-2.5">
          <span className="grid h-[28px] w-[28px] place-items-center rounded-[7px] bg-ppc-purple-500 text-[14px] font-extrabold leading-none text-white">
            ɪ
          </span>
          <span className="text-[15px] font-bold tracking-[-0.01em] text-white">ppc.io</span>
        </NavLink>
      )}
      <button
        onClick={onToggle}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="grid h-8 w-8 place-items-center rounded-md text-[#7A7A86] hover:bg-[#15101F] hover:text-white"
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
          className="grid h-9 w-9 place-items-center rounded-md text-[#7A7A86] hover:bg-[#15101F] hover:text-white"
        >
          <MagnifyingGlass size={15} />
        </button>
      </div>
    );
  }
  return (
    <div className="px-3 pb-3">
      <div className="relative">
        <MagnifyingGlass
          size={14}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6A6A78]"
        />
        <input
          readOnly
          placeholder="Search or jump to"
          className="w-full cursor-pointer rounded-lg border border-[#1E1830] bg-[#15101F] py-[8px] pl-8 pr-12 text-[13px] text-white outline-none placeholder:text-[#6A6A78] hover:border-white/14"
        />
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-white/14 bg-[#15101F] px-[5px] py-[1px] font-mono text-[10.5px] text-[#7A7A86]">
          ⌘K
        </kbd>
      </div>
    </div>
  );
}

// ─── Main nav item ────────────────────────────────────────────────────────

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
        return `group flex items-center rounded-lg text-[14px] transition-colors ${
          collapsed ? 'justify-center px-2 py-2' : 'gap-2.5 px-3 py-[8px]'
        } ${
          active
            ? 'bg-ppc-purple-700 font-semibold text-white shadow-[0_1px_0_rgba(255,255,255,0.06)_inset]'
            : 'font-medium text-[#CFCFD9] hover:bg-[#15101F] hover:text-white'
        }`;
      }}
    >
      {({ isActive }) => {
        const active = overrideActive ?? isActive;
        return (
          <>
            <Icon
              size={17}
              weight={active ? 'fill' : 'duotone'}
              className={active ? 'text-ppc-purple-200' : 'text-[#6A6A78] group-hover:text-ppc-purple-300'}
            />
            {!collapsed && (
              <>
                <span className="flex-1">{label}</span>
                {badge && (
                  <span className={`ml-auto rounded px-1.5 py-[1px] text-[11px] font-semibold tabular-nums ${
                    active
                      ? 'bg-white/20 text-white'
                      : 'bg-[#1A1A22] text-[#9A9AA5]'
                  }`}>
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

// ─── ItemGroup (page-variant dropdown) ────────────────────────────────────

function ItemGroup({
  icon: Icon,
  label,
  basePath,
  pages,
  collapsed,
  status,
}: {
  icon: typeof House;
  label: string;
  basePath: string;
  pages: SubPage[];
  collapsed: boolean;
  status?: React.ReactNode;
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
        className={`group flex w-full items-center justify-center rounded-lg px-2 py-2 transition-colors ${
          inSection
            ? 'bg-ppc-purple-700 text-white'
            : 'text-[#CFCFD9] hover:bg-[#15101F] hover:text-white'
        }`}
      >
        <Icon
          size={17}
          weight={inSection ? 'fill' : 'duotone'}
          className={inSection ? 'text-ppc-purple-200' : 'text-[#6A6A78] group-hover:text-ppc-purple-300'}
        />
      </button>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`group flex w-full items-center gap-2.5 rounded-lg px-3 py-[8px] text-left text-[14px] transition-colors ${
          inSection
            ? 'bg-ppc-purple-700 font-semibold text-white shadow-[0_1px_0_rgba(255,255,255,0.06)_inset]'
            : 'font-medium text-[#CFCFD9] hover:bg-[#15101F] hover:text-white'
        }`}
      >
        <Icon
          size={17}
          weight={inSection ? 'fill' : 'duotone'}
          className={inSection ? 'text-ppc-purple-200' : 'text-[#6A6A78] group-hover:text-ppc-purple-300'}
        />
        <span className="flex-1">{label}</span>
        {status}
        <CaretDown
          size={11}
          weight="bold"
          className={`${inSection ? 'text-white/70' : 'text-[#6A6A78]'} transition-transform ${open ? '' : '-rotate-90'}`}
        />
      </button>

      {open && (
        <ul className="mb-1 ml-[26px] mt-0.5 flex flex-col gap-px border-l border-[#1E1830] pl-2">
          {pages.map((sp) => (
            <li key={sp.to}>
              <NavLink
                to={sp.to}
                end
                className={({ isActive }) =>
                  `block rounded-md px-2 py-[6px] text-[13px] transition-colors ${
                    isActive
                      ? 'bg-ppc-purple-700 font-semibold text-white'
                      : 'font-medium text-[#9A9AA5] hover:bg-[#15101F] hover:text-white'
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

// ─── Projects section (inline list) ───────────────────────────────────────

function ProjectsSection({ collapsed }: { collapsed: boolean }) {
  if (collapsed) {
    return (
      <div className="mt-3 flex flex-col items-center gap-1.5 border-t border-[#1E1830] pt-3">
        {PROJECTS.map((p) => (
          <NavLink
            key={p.id}
            to={`/projects/${p.id}`}
            title={p.name}
            className={({ isActive }) =>
              `grid h-8 w-8 place-items-center rounded-md text-[12px] font-semibold ${
                isActive ? 'ring-2 ring-ppc-purple-400/70 ring-offset-2 ring-offset-ppc-sidebar' : ''
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
    <div className="mt-4">
      <div className="flex items-center justify-between px-3 pb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[#7A7A86]">
            Projects
          </span>
          <span className="font-mono text-[10.5px] tabular-nums text-[#7A7A86]">{PROJECTS.length}</span>
        </div>
        <button
          title="New project"
          className="grid h-5 w-5 place-items-center rounded text-[#7A7A86] hover:bg-[#15101F] hover:text-white"
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
                  `group flex items-center gap-2.5 overflow-hidden rounded-lg px-3 py-[7px] text-[13.5px] transition-colors ${
                    isActive
                      ? 'bg-ppc-purple-700 font-semibold text-white shadow-[0_1px_0_rgba(255,255,255,0.06)_inset]'
                      : 'font-medium text-[#CFCFD9] hover:bg-[#15101F] hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`grid h-[22px] w-[22px] shrink-0 place-items-center rounded text-[11px] font-semibold ${
                        isActive ? 'ring-2 ring-ppc-purple-200/60' : ''
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
    red:    { bg: '#ef4444', ring: 'rgba(239,68,68,0.22)' },
    yellow: { bg: '#fbbf24', ring: 'rgba(251,191,36,0.22)' },
    green:  { bg: '#22c55e', ring: 'rgba(34,197,94,0.22)' },
  }[tone];
  return (
    <span
      className="h-[6px] w-[6px] shrink-0 rounded-full"
      style={{ background: palette.bg, boxShadow: `0 0 0 2.5px ${palette.ring}` }}
    />
  );
}

function RunningPill({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-[#22C55E]">
      <span
        className="h-[5px] w-[5px] rounded-full bg-[#22C55E]"
        style={{ boxShadow: '0 0 0 2px rgba(34,197,94,0.22)' }}
      />
      {count} running
    </span>
  );
}

const AVATAR_PALETTE: { bg: string; fg: string }[] = [
  { bg: '#22c55e', fg: '#052e16' },
  { bg: '#ef4444', fg: '#450a0a' },
  { bg: '#14b8a6', fg: '#042f2c' },
  { bg: '#10b981', fg: '#022c22' },
  { bg: '#60a5fa', fg: '#172554' },
  { bg: '#3b82f6', fg: '#172554' },
  { bg: '#ec4899', fg: '#500724' },
  { bg: '#f59e0b', fg: '#451a03' },
];
function projectColor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length];
}

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
      <div className="flex justify-center border-t border-[#1E1830] px-2 py-3">
        <button
          title="Stewart Dunlop"
          className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-ppc-purple-300 to-ppc-purple-500 text-[12px] font-bold text-white"
        >
          SD
        </button>
      </div>
    );
  }
  return (
    <div className="border-t border-[#1E1830] px-3 pt-3 pb-3">
      <button className="mb-2 flex w-full items-center gap-2.5 rounded-xl border border-[#1E1830] bg-[#15101F] px-2.5 py-2 text-left transition-colors hover:border-white/14">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-ppc-purple-300 to-ppc-purple-500 text-[11.5px] font-bold text-white">
          SD
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-semibold leading-tight text-white">
            Stewart Dunlop
          </span>
          <span className="mt-px block truncate text-[11px] text-[#7A7A86]">stewart@ppc.io</span>
        </span>
        <DotsThree size={15} weight="bold" className="text-[#6A6A78]" />
      </button>
      <div className="flex items-center justify-between px-1 text-[10.5px]">
        <span className="inline-flex items-center gap-1.5 font-semibold text-ppc-purple-300">
          <span
            className="h-[5px] w-[5px] rounded-full bg-ppc-purple-400"
            style={{ boxShadow: '0 0 0 2px rgba(127,90,240,0.30)' }}
          />
          Beta
        </span>
        <span className="inline-flex items-center gap-1.5 text-[#7A7A86]">
          <Clock size={11} weight="duotone" />
          <span className="tabular-nums">Saves ~22 h/wk</span>
        </span>
      </div>
    </div>
  );
}
