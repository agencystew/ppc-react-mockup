import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  House, Robot, ChartLineUp, ChatCircle, Compass,
  MagnifyingGlass, SidebarSimple, SquaresFour,
  CaretRight, DotsThree, X, PushPin, Plus,
} from '@phosphor-icons/react';
import { PROJECTS, ACCOUNTS } from '../mock/projects';
import { SIDEBAR_REPORT_PAGES } from '../mock/reports';
import type { Project } from '../types/agent';

/* Path-prefix scope: anything under /projects/<id>/... (or /projects/<id>) is
 * project-scoped — the cockpit, agents, reports, runs. Plain /projects (the
 * index) stays workspace-level. Used by the sidebar to (a) anchor the current
 * project chip and (b) rebind Agents/Reports to their scoped equivalents. */
function getScopedProjectId(pathname: string): string | null {
  const m = pathname.match(/^\/projects\/([^/]+)(?:\/|$)/);
  if (!m) return null;
  const id = m[1];
  return PROJECTS.some((p) => p.id === id) ? id : null;
}

/* AppShell — "Inhabited Dark" sidebar, v2 confident-scale.
 *
 *  - 17px Figtree bold nav items (was 14px / mostly mono eyebrows).
 *  - No "WORKSPACE" / "PROJECTS" Courier eyebrows — direct hierarchy by
 *    spacing and a single hairline.
 *  - Active = soft white/[0.06] tint + a 2.5px purple gradient bar bleeding
 *    in from the rail's left edge, with a faint purple glow. No chunky
 *    purple fill blocks.
 *  - Projects collapse to a single `All projects · 8` row that opens a
 *    380px slide-over switcher (search, pinned, filter chips, status dots).
 *  - When inside a project route, a quiet bordered "current project" chip
 *    anchors above the All Projects row so context isn't lost.
 *  - Width 280px (was 264).
 *
 * Layout posture per route family is unchanged: /chat*, /v2/chat*, /v2/* are
 * full-bleed; everything else uses the centered max-w-[1240px] wrapper. */

interface SubPage { label: string; to: string; }
const AGENT_PAGES: SubPage[] = [
  { label: 'Catalog',                to: '/agents' },
  { label: 'Detail · Launch',        to: '/agents/competitor-spy' },
  { label: 'Loading · multi-step',   to: '/agents/competitor-spy/loading/run-competitor-spy-running' },
  { label: 'Loading · single-step',  to: '/agents/spend-leak/loading/run-spend-leak-running' },
];

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
const PINNED_KEY = 'ppcio-projects-pinned-v2';
const SIDEBAR_FONT = 'Figtree, ui-sans-serif, system-ui, sans-serif';
const ACCENT_GRAD = 'linear-gradient(180deg, #B8A0FF 0%, #7F5AF0 55%, #5742C7 100%)';
const ACCENT_GLOW = '0 0 12px rgba(127,90,240,0.40)';

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) setCollapsed(saved === 'true');
  }, []);

  // Close switcher when the route changes (covers row clicks + back/forward).
  useEffect(() => { setSwitcherOpen(false); }, [pathname]);

  // ESC closes the switcher.
  useEffect(() => {
    if (!switcherOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSwitcherOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [switcherOpen]);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  };

  const isChat = pathname === '/chat' || pathname.startsWith('/chat/')
              || pathname === '/v2/chat' || pathname.startsWith('/v2/chat/');
  const isV2 = pathname === '/v2' || pathname.startsWith('/v2/');
  const fullBleed = isChat || isV2;

  return (
    <div className="flex min-h-screen w-full font-sans text-ppc-black">
      <Sidebar
        collapsed={collapsed}
        onToggle={toggle}
        onOpenSwitcher={() => setSwitcherOpen(true)}
      />
      <main className="flex min-w-0 flex-1 flex-col">
        {fullBleed ? (
          <Outlet />
        ) : (
          <div className="mx-auto w-full max-w-[1240px] px-8 py-10 lg:px-12 lg:py-12">
            <Outlet />
          </div>
        )}
      </main>
      <ProjectSwitcher open={switcherOpen} onClose={() => setSwitcherOpen(false)} />
    </div>
  );
}

/* ─── Sidebar shell ─────────────────────────────────────────────────────── */

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onOpenSwitcher: () => void;
}

function Sidebar({ collapsed, onToggle, onOpenSwitcher }: SidebarProps) {
  const { pathname } = useLocation();
  // Inside a project, Agents + Reports rebind to project-scoped equivalents
  // so clicking them stays in the project. Dashboard + Chat stay global.
  const scopedId = getScopedProjectId(pathname);
  const projectPrefix = scopedId ? `/projects/${scopedId}` : '';
  const rebindAgentPages = scopedId
    ? AGENT_PAGES.map((p) => ({ ...p, to: p.to.replace(/^\/agents/, `${projectPrefix}/agents`) }))
    : AGENT_PAGES;
  const rebindReportPages = scopedId
    ? REPORT_PAGES.map((p) => ({ ...p, to: p.to.replace(/^\/reports/, `${projectPrefix}/reports`) }))
    : REPORT_PAGES;

  const projectsActive = pathname === '/projects' || pathname.startsWith('/projects/');
  const currentProject = scopedId ? PROJECTS.find((p) => p.id === scopedId) ?? null : null;

  return (
    <aside
      className={`relative sticky top-0 flex h-screen shrink-0 flex-col transition-[width] duration-200 ${
        collapsed ? 'w-[72px]' : 'w-[280px]'
      }`}
      style={{
        background:
          'linear-gradient(180deg, #07050D 0%, #050308 55%, #030206 100%)',
        boxShadow: 'inset -1px 0 0 rgba(255,255,255,0.05)',
      }}
    >
      {/* Subtle purple bloom only at the very top */}
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

        <nav className="flex flex-1 flex-col gap-[2px] overflow-y-auto px-2 pb-3">
          <MainNavItem to="/" icon={House} label="Dashboard" collapsed={collapsed} end />
          <MainNavItem to="/chat" icon={ChatCircle} label="Chat" collapsed={collapsed} badge="2" />
          <ItemGroup
            icon={Robot}
            label="Agents"
            basePath={scopedId ? `${projectPrefix}/agents` : '/agents'}
            pages={rebindAgentPages}
            collapsed={collapsed}
            runningCount={4}
          />
          <ItemGroup
            icon={ChartLineUp}
            label="Reports"
            basePath={scopedId ? `${projectPrefix}/reports` : '/reports'}
            pages={rebindReportPages}
            collapsed={collapsed}
          />
          <MainNavItem to="/patterns" icon={Compass} label="Patterns" collapsed={collapsed} />

          <div className={`my-3 h-px ${collapsed ? 'mx-3' : 'mx-2'} bg-white/[0.06]`} />

          {!collapsed && currentProject && <CurrentProjectChip project={currentProject} />}

          <AllProjectsRow
            collapsed={collapsed}
            active={projectsActive}
            onClick={onOpenSwitcher}
          />

          {collapsed && <CollapsedProjectStrip scopedId={scopedId} />}
        </nav>

        <SidebarFooter collapsed={collapsed} />
      </div>
    </aside>
  );
}

/* ─── Brand row ─────────────────────────────────────────────────────────── */

function BrandRow({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <div className={`relative flex items-center pt-5 pb-5 ${collapsed ? 'justify-center px-2' : 'justify-between px-4'}`}>
      {!collapsed && (
        <NavLink to="/" className="group flex items-center gap-2.5">
          <span
            className="relative grid h-[36px] w-[36px] place-items-center overflow-hidden rounded-[10px] text-[16px] font-extrabold leading-none text-white"
            style={{
              background: 'linear-gradient(155deg, #A88CFF 0%, #7F5AF0 55%, #5742C7 100%)',
              boxShadow:
                '0 1px 0 rgba(255,255,255,0.22) inset, 0 0 0 1px rgba(127,90,240,0.55), 0 8px 22px -8px rgba(127,90,240,0.65)',
            }}
          >
            <span
              aria-hidden
              className="absolute inset-0 opacity-55"
              style={{
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.22) 0%, transparent 55%)',
              }}
            />
            <span className="relative">P</span>
          </span>
          <span
            className="text-[18px] font-extrabold leading-none tracking-[-0.018em] text-white"
            style={{ fontFamily: SIDEBAR_FONT }}
          >
            PPC.IO
          </span>
        </NavLink>
      )}
      <button
        onClick={onToggle}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="grid h-8 w-8 place-items-center rounded-md text-white/65 transition-colors hover:bg-white/[0.06] hover:text-white"
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
          className="grid h-9 w-9 place-items-center rounded-lg text-white/65 transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          <MagnifyingGlass size={16} />
        </button>
      </div>
    );
  }
  return (
    <div className="px-3 pb-4">
      <div className="group relative">
        <MagnifyingGlass
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/50 transition-colors group-hover:text-white/85"
        />
        <input
          readOnly
          placeholder="Search..."
          className="w-full cursor-pointer rounded-[10px] border border-white/[0.07] bg-white/[0.035] py-[10px] pl-[34px] pr-14 text-[14px] text-white outline-none placeholder:text-white/55 transition-colors hover:border-white/[0.12] hover:bg-white/[0.05]"
        />
        <kbd
          className="pointer-events-none absolute right-2.5 top-1/2 flex h-[20px] -translate-y-1/2 items-center rounded-[5px] border border-white/[0.10] bg-white/[0.04] px-[6px] font-mono text-[11px] leading-none text-white/70"
          style={{ fontFamily: '"Courier New", ui-monospace, Menlo, monospace' }}
        >
          ⌘K
        </kbd>
      </div>
    </div>
  );
}

/* ─── Active bar (left-edge gradient indicator) ─────────────────────────── */

function ActiveBar() {
  return (
    <span
      aria-hidden
      className="absolute left-0 top-[8px] bottom-[8px] w-[2.5px]"
      style={{
        background: ACCENT_GRAD,
        borderRadius: '0 4px 4px 0',
        boxShadow: ACCENT_GLOW,
      }}
    />
  );
}

/* ─── Main nav item ─────────────────────────────────────────────────────── */

function MainNavItem({
  to, icon: Icon, label, collapsed, end, badge,
}: {
  to: string;
  icon: typeof House;
  label: string;
  collapsed: boolean;
  end?: boolean;
  badge?: string;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        `group relative flex items-center rounded-[11px] transition-colors duration-150 ${
          collapsed ? 'justify-center px-2 py-[11px]' : 'gap-3 pl-[14px] pr-[12px] py-[12px]'
        } ${
          isActive
            ? 'bg-white/[0.06] text-white'
            : 'text-white/[0.82] hover:bg-white/[0.035] hover:text-white'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && !collapsed && <ActiveBar />}
          <Icon
            size={collapsed ? 20 : 22}
            weight={isActive ? 'fill' : 'duotone'}
            className={`shrink-0 ${isActive ? 'text-white' : 'text-white/[0.78]'}`}
          />
          {!collapsed && (
            <>
              <span
                className={`flex-1 text-[17px] leading-none tracking-[-0.012em] ${
                  isActive ? 'font-extrabold' : 'font-bold'
                }`}
                style={{ fontFamily: SIDEBAR_FONT }}
              >
                {label}
              </span>
              {badge && <NavBadge active={isActive}>{badge}</NavBadge>}
            </>
          )}
        </>
      )}
    </NavLink>
  );
}

function NavBadge({ children, active }: { children: React.ReactNode; active: boolean }) {
  return (
    <span
      className={`inline-flex h-[21px] min-w-[24px] items-center justify-center rounded-[6px] px-[7px] text-[11.5px] font-bold leading-none tabular-nums ${
        active ? 'bg-white/15 text-white' : 'bg-white/[0.07] text-white/70'
      }`}
    >
      {children}
    </span>
  );
}

/* ─── ItemGroup (expandable Agents/Reports) ─────────────────────────────── */

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
  useEffect(() => { if (inSection) setOpen(true); }, [inSection]);

  if (collapsed) {
    return (
      <button
        onClick={() => navigate(pages[0].to)}
        title={label}
        className={`group relative flex w-full items-center justify-center rounded-[11px] px-2 py-[11px] transition-colors ${
          inSection
            ? 'bg-white/[0.06] text-white'
            : 'text-white/[0.82] hover:bg-white/[0.035] hover:text-white'
        }`}
      >
        <Icon
          size={20}
          weight={inSection ? 'fill' : 'duotone'}
          className={inSection ? 'text-white' : 'text-white/[0.78]'}
        />
      </button>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`group relative flex w-full items-center gap-3 rounded-[11px] pl-[14px] pr-[12px] py-[12px] text-left transition-colors duration-150 ${
          inSection
            ? 'bg-white/[0.06] text-white'
            : 'text-white/[0.82] hover:bg-white/[0.035] hover:text-white'
        }`}
      >
        {inSection && <ActiveBar />}
        <Icon
          size={22}
          weight={inSection ? 'fill' : 'duotone'}
          className={`shrink-0 ${inSection ? 'text-white' : 'text-white/[0.78]'}`}
        />
        <span
          className={`flex-1 text-[17px] leading-none tracking-[-0.012em] ${
            inSection ? 'font-extrabold' : 'font-bold'
          }`}
          style={{ fontFamily: SIDEBAR_FONT }}
        >
          {label}
        </span>
        {runningCount !== undefined && <RunningIndicator count={runningCount} />}
        <CaretRight
          size={12}
          weight="bold"
          className={`shrink-0 ${inSection ? 'text-white/65' : 'text-white/45'} transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
        />
      </button>

      {open && (
        <ul
          className="relative mb-1 ml-[36px] mt-[3px] flex flex-col gap-[2px] pl-3"
          style={{
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.02) 100%)',
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
                  `relative block rounded-[8px] px-[10px] py-[7px] text-[13.5px] transition-colors duration-150 ${
                    isActive
                      ? 'bg-white/[0.05] font-bold text-white'
                      : 'font-semibold text-white/60 hover:bg-white/[0.035] hover:text-white'
                  }`
                }
                style={{ fontFamily: SIDEBAR_FONT, letterSpacing: '-0.005em' }}
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

/* ─── All projects row (slide-over trigger) ─────────────────────────────── */

function AllProjectsRow({
  collapsed, active, onClick,
}: { collapsed: boolean; active: boolean; onClick: () => void }) {
  if (collapsed) {
    return (
      <button
        onClick={onClick}
        title="All projects"
        className={`group relative flex w-full items-center justify-center rounded-[11px] px-2 py-[11px] transition-colors ${
          active
            ? 'bg-white/[0.06] text-white'
            : 'text-white/[0.82] hover:bg-white/[0.035] hover:text-white'
        }`}
      >
        <SquaresFour
          size={20}
          weight={active ? 'fill' : 'duotone'}
          className={active ? 'text-white' : 'text-white/[0.78]'}
        />
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      className={`group relative flex w-full items-center gap-3 rounded-[11px] pl-[14px] pr-[12px] py-[12px] text-left transition-colors duration-150 ${
        active
          ? 'bg-white/[0.06] text-white'
          : 'text-white/[0.82] hover:bg-white/[0.035] hover:text-white'
      }`}
    >
      {active && <ActiveBar />}
      <SquaresFour
        size={22}
        weight={active ? 'fill' : 'duotone'}
        className={`shrink-0 ${active ? 'text-white' : 'text-white/[0.78]'}`}
      />
      <span
        className={`flex-1 text-[17px] leading-none tracking-[-0.012em] ${
          active ? 'font-extrabold' : 'font-bold'
        }`}
        style={{ fontFamily: SIDEBAR_FONT }}
      >
        All projects
      </span>
      <NavBadge active={active}>{PROJECTS.length.toString()}</NavBadge>
      <CaretRight
        size={12}
        weight="bold"
        className={`shrink-0 transition-colors ${
          active ? 'text-white/65' : 'text-white/40 group-hover:text-white/65'
        }`}
      />
    </button>
  );
}

/* ─── Current project anchor chip ───────────────────────────────────────── */

function CurrentProjectChip({ project }: { project: Project }) {
  const status = projectStatus(project.id);
  return (
    <NavLink
      to={`/projects/${project.id}`}
      end
      className="group relative mx-[2px] mb-1 flex items-center gap-3 rounded-[10px] border border-white/[0.07] bg-white/[0.022] pl-[10px] pr-[12px] py-[9px] transition-all hover:border-white/[0.15] hover:bg-white/[0.04]"
    >
      <span
        className="relative grid h-[28px] w-[28px] shrink-0 place-items-center rounded-[7px] text-[12px] font-bold leading-none text-white/90"
        style={{
          background:
            'linear-gradient(155deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.035) 100%)',
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.10)',
        }}
      >
        {project.name.charAt(0)}
      </span>
      <span
        className="min-w-0 flex-1 truncate text-[14px] font-bold leading-none tracking-[-0.008em] text-white/95"
        style={{ fontFamily: SIDEBAR_FONT }}
      >
        {project.name}
      </span>
      <StatusDot tone={status} />
    </NavLink>
  );
}

/* ─── Collapsed-mode project strip ──────────────────────────────────────── */

function CollapsedProjectStrip({ scopedId }: { scopedId: string | null }) {
  return (
    <div className="flex flex-col items-center gap-1.5 pt-2">
      {PROJECTS.slice(0, 6).map((p) => {
        const status = projectStatus(p.id);
        const isActive = scopedId === p.id;
        return (
          <NavLink key={p.id} to={`/projects/${p.id}`} title={p.name} className="group relative">
            <span
              className={`grid h-8 w-8 place-items-center rounded-[7px] text-[11px] font-bold transition-all ${
                isActive ? '' : 'opacity-90 group-hover:opacity-100'
              }`}
              style={{
                background:
                  'linear-gradient(155deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.035) 100%)',
                color: 'rgba(255,255,255,0.85)',
                boxShadow: isActive
                  ? 'inset 0 0 0 1px rgba(255,255,255,0.18), 0 0 0 1.5px rgba(127,90,240,0.28)'
                  : 'inset 0 0 0 1px rgba(255,255,255,0.10)',
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

/* ─── Project switcher (slide-over) ─────────────────────────────────────── */

function ProjectSwitcher({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'attention'>('all');
  const [pinned, setPinned] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(PINNED_KEY);
      return raw ? (JSON.parse(raw) as string[]) : ['boulder-care', 'flock'];
    } catch {
      return ['boulder-care', 'flock'];
    }
  });

  useEffect(() => { if (!open) setQuery(''); }, [open]);

  const togglePin = (id: string) => {
    setPinned((prev) => {
      const next = prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id];
      localStorage.setItem(PINNED_KEY, JSON.stringify(next));
      return next;
    });
  };

  const filtered = useMemo(() => {
    let list = PROJECTS;
    if (filter === 'attention') list = list.filter((p) => projectStatus(p.id) === 'red');
    else if (filter === 'active') list = list.filter((p) => projectStatus(p.id) !== 'red');
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || (p.industry ?? '').toLowerCase().includes(q),
      );
    }
    return list;
  }, [filter, query]);

  const pinnedProjects = filtered.filter((p) => pinned.includes(p.id));
  const otherProjects = filtered.filter((p) => !pinned.includes(p.id));
  const showSections = pinnedProjects.length > 0 && filter === 'all' && !query.trim();

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/55 transition-opacity duration-200 ${
          open ? 'opacity-100 backdrop-blur-[2px]' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[380px] flex-col transition-transform duration-[260ms] ease-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: 'linear-gradient(180deg, #0F0A1E 0%, #0A0716 100%)',
          boxShadow:
            '24px 0 80px -20px rgba(0,0,0,0.7), inset -1px 0 0 rgba(255,255,255,0.07)',
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[220px]"
          style={{
            background:
              'radial-gradient(60% 55% at 28% -8%, rgba(127,90,240,0.16) 0%, transparent 70%)',
          }}
        />

        <div className="relative flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-[22px] pb-3">
            <div className="flex items-baseline gap-[7px]">
              <h2
                className="text-[22px] font-extrabold leading-none tracking-[-0.022em] text-white"
                style={{ fontFamily: SIDEBAR_FONT }}
              >
                Projects
              </h2>
              <span className="text-[14px] font-bold leading-none text-white/40 tabular-nums">
                {PROJECTS.length}
              </span>
            </div>
            <button
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-md text-white/65 transition-colors hover:bg-white/[0.06] hover:text-white"
              title="Close (Esc)"
            >
              <X size={16} weight="bold" />
            </button>
          </div>

          {/* Search */}
          <div className="px-5 pb-3">
            <div className="relative">
              <MagnifyingGlass
                size={15}
                className="pointer-events-none absolute left-[13px] top-1/2 -translate-y-1/2 text-white/55"
              />
              <input
                autoFocus={open}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search projects, industries..."
                className="w-full rounded-[10px] border border-white/[0.08] bg-white/[0.035] py-[11px] pl-[36px] pr-3 text-[14px] text-white outline-none placeholder:text-white/45 transition-colors focus:border-white/[0.18] focus:bg-white/[0.05]"
                style={{ fontFamily: SIDEBAR_FONT }}
              />
            </div>
          </div>

          {/* Filter chips */}
          <div className="flex gap-1.5 px-5 pb-4">
            {([
              { key: 'all', label: 'All' },
              { key: 'active', label: 'Active' },
              { key: 'attention', label: 'Needs attention' },
            ] as const).map((chip) => (
              <button
                key={chip.key}
                onClick={() => setFilter(chip.key)}
                className={`rounded-full px-[11px] py-[5.5px] text-[12px] font-bold leading-none transition-colors ${
                  filter === chip.key
                    ? 'bg-white text-[#0F0A1E]'
                    : 'bg-white/[0.05] text-white/70 hover:bg-white/[0.09] hover:text-white'
                }`}
                style={{ fontFamily: SIDEBAR_FONT }}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="relative flex-1 overflow-y-auto px-2 pb-3">
            {showSections && (
              <>
                <SwitcherSectionLabel>Pinned</SwitcherSectionLabel>
                <ul className="mb-2 flex flex-col gap-[1px]">
                  {pinnedProjects.map((p) => (
                    <SwitcherRow
                      key={p.id}
                      project={p}
                      pinned
                      onTogglePin={togglePin}
                      onActivate={() => { navigate(`/projects/${p.id}`); onClose(); }}
                      isActive={pathname.startsWith(`/projects/${p.id}`)}
                    />
                  ))}
                </ul>
                <SwitcherSectionLabel>All projects</SwitcherSectionLabel>
              </>
            )}
            {otherProjects.length > 0 && (
              <ul className="flex flex-col gap-[1px]">
                {otherProjects.map((p) => (
                  <SwitcherRow
                    key={p.id}
                    project={p}
                    pinned={pinned.includes(p.id)}
                    onTogglePin={togglePin}
                    onActivate={() => { navigate(`/projects/${p.id}`); onClose(); }}
                    isActive={pathname.startsWith(`/projects/${p.id}`)}
                  />
                ))}
              </ul>
            )}
            {!showSections && pinnedProjects.length > 0 && (
              <ul className="flex flex-col gap-[1px]">
                {pinnedProjects.map((p) => (
                  <SwitcherRow
                    key={p.id}
                    project={p}
                    pinned
                    onTogglePin={togglePin}
                    onActivate={() => { navigate(`/projects/${p.id}`); onClose(); }}
                    isActive={pathname.startsWith(`/projects/${p.id}`)}
                  />
                ))}
              </ul>
            )}
            {filtered.length === 0 && (
              <div
                className="px-4 py-10 text-center text-[13px] text-white/45"
                style={{ fontFamily: SIDEBAR_FONT }}
              >
                No projects match {query.trim() ? `“${query.trim()}”` : 'this filter'}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-white/[0.06] px-4 py-3">
            <button
              className="inline-flex items-center gap-1.5 rounded-[8px] px-2 py-[6px] text-[13px] font-bold text-white/85 transition-colors hover:bg-white/[0.05] hover:text-white"
              style={{ fontFamily: SIDEBAR_FONT }}
            >
              <Plus size={14} weight="bold" />
              New project
            </button>
            <NavLink
              to="/projects"
              onClick={onClose}
              className="inline-flex items-center gap-1 text-[12.5px] font-bold text-white/55 transition-colors hover:text-white"
              style={{ fontFamily: SIDEBAR_FONT }}
            >
              Manage all
              <CaretRight size={10} weight="bold" />
            </NavLink>
          </div>
        </div>
      </aside>
    </>
  );
}

function SwitcherSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 pb-[6px] pt-1">
      <span
        className="text-[11.5px] font-bold leading-none text-white/45 tracking-[-0.004em]"
        style={{ fontFamily: SIDEBAR_FONT }}
      >
        {children}
      </span>
    </div>
  );
}

function SwitcherRow({
  project, pinned, onTogglePin, onActivate, isActive,
}: {
  project: Project;
  pinned: boolean;
  onTogglePin: (id: string) => void;
  onActivate: () => void;
  isActive: boolean;
}) {
  const accounts = ACCOUNTS.filter((a) => a.projectId === project.id);
  const status = projectStatus(project.id);
  return (
    <li>
      <div
        onClick={onActivate}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onActivate(); } }}
        className={`group relative flex cursor-pointer items-center gap-3 rounded-[10px] px-[10px] py-[9px] transition-colors ${
          isActive
            ? 'bg-white/[0.06] text-white'
            : 'text-white/85 hover:bg-white/[0.04] hover:text-white'
        }`}
      >
        {isActive && (
          <span
            aria-hidden
            className="absolute left-0 top-[10px] bottom-[10px] w-[2.5px]"
            style={{
              background: ACCENT_GRAD,
              borderRadius: '0 4px 4px 0',
              boxShadow: ACCENT_GLOW,
            }}
          />
        )}
        <span
          className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-[8px] text-[13px] font-bold leading-none text-white/90"
          style={{
            background:
              'linear-gradient(155deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.035) 100%)',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.10)',
          }}
        >
          {project.name.charAt(0)}
        </span>
        <span className="min-w-0 flex-1">
          <span
            className="block truncate text-[14.5px] font-bold leading-tight tracking-[-0.008em]"
            style={{ fontFamily: SIDEBAR_FONT }}
          >
            {project.name}
          </span>
          <span
            className="mt-[2px] block truncate text-[11.5px] font-semibold leading-tight text-white/45"
            style={{ fontFamily: SIDEBAR_FONT }}
          >
            {[project.industry, `${accounts.length} ${accounts.length === 1 ? 'account' : 'accounts'}`]
              .filter(Boolean)
              .join(' · ')}
          </span>
        </span>
        <StatusDot tone={status} />
        <button
          onClick={(e) => { e.stopPropagation(); onTogglePin(project.id); }}
          title={pinned ? 'Unpin' : 'Pin'}
          className={`grid h-7 w-7 place-items-center rounded-md transition-all ${
            pinned
              ? 'text-white/80 hover:bg-white/[0.08] hover:text-white'
              : 'text-white/55 opacity-0 hover:bg-white/[0.08] hover:text-white group-hover:opacity-100'
          }`}
        >
          <PushPin size={13} weight={pinned ? 'fill' : 'bold'} />
        </button>
      </div>
    </li>
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
      style={{ background: palette, boxShadow: '0 0 0 1.5px #120C26' }}
    />
  );
}

function RunningIndicator({ count }: { count: number }) {
  return (
    <span
      className="inline-flex items-center gap-[5px] text-[10.5px] font-bold leading-none text-[#A6E3C6]"
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
        className="mb-1 flex w-full items-center gap-2.5 rounded-[11px] border border-white/[0.06] bg-white/[0.025] px-[10px] py-[9px] text-left transition-colors hover:border-white/[0.12] hover:bg-white/[0.05]"
      >
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[12px] font-bold text-white"
          style={{
            background: 'linear-gradient(135deg, #C7B0FF 0%, #7F5AF0 100%)',
            boxShadow:
              '0 0 0 1px rgba(127,90,240,0.40), 0 3px 10px -4px rgba(127,90,240,0.50)',
          }}
        >
          SD
        </span>
        <span className="min-w-0 flex-1">
          <span
            className="block truncate text-[13.5px] font-extrabold leading-tight tracking-[-0.008em] text-white"
            style={{ fontFamily: SIDEBAR_FONT }}
          >
            Stewart Dunlop
          </span>
          <span
            className="mt-[2px] block truncate text-[11.5px] font-semibold leading-tight text-white/50"
            style={{ fontFamily: SIDEBAR_FONT }}
          >
            stewart@ppc.io
          </span>
        </span>
        <DotsThree size={16} weight="bold" className="text-white/45" />
      </button>
    </div>
  );
}
