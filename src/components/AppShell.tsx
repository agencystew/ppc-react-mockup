import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
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

/* AppShell — "Inhabited Dark" sidebar, v3 (slide-indicator + tightened scale).
 *
 *  - 17px Figtree bold nav items, no mono Courier eyebrows.
 *  - 240px wide (was 280) — tighter, Linear-aligned.
 *  - No numeric badges in the rail (Chat unread count, Agents running
 *    count, All projects total — all gone). Agents keeps a pure green
 *    pulse when something's running, no digit.
 *  - 24px Phosphor icons with a duotone weight that springs on press
 *    (300ms cubic-bezier overshoot), lifts on hover, and picks up a soft
 *    purple drop-shadow when its row goes active.
 *  - Active state is a SHARED pill+bar at the <nav> level that slides
 *    between rows over 280ms when you navigate. Manual refs + CSS
 *    transition — no animation library. Pre-paint measurement via
 *    useLayoutEffect so the first paint never animates.
 *  - Projects collapse to a single `All projects ›` row that opens a
 *    380px slide-over switcher.
 *  - When inside a project route, a quiet bordered "current project" chip
 *    anchors above the All Projects row so context isn't lost.
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
const ICON_TRANSITION =
  'transition-[transform,filter,color] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]';
const SLIDE_EASE = 'cubic-bezier(0.22, 0.61, 0.36, 1)';

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) setCollapsed(saved === 'true');
  }, []);

  useEffect(() => { setSwitcherOpen(false); }, [pathname]);

  // Scroll-to-top on route change. Without this, the browser preserves
  // the previous scroll position and an Agent Detail route opens partway
  // down the page (e.g. landing on /agents/landing-page after scrolling
  // the catalog). Each route transition resets to (0, 0).
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

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
  const isPatterns = pathname === '/patterns' || pathname.startsWith('/patterns/');
  const isHome = pathname === '/';
  const fullBleed = isChat || isV2 || isPatterns || isHome;

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
          <div className="mx-auto w-full max-w-[1240px] px-6 py-8 lg:px-8 lg:py-10">
            <Outlet />
          </div>
        )}
      </main>
      <ProjectSwitcher open={switcherOpen} onClose={() => setSwitcherOpen(false)} />
    </div>
  );
}

/* ─── Sidebar shell ─────────────────────────────────────────────────────── */

type NavKey = 'dashboard' | 'chat' | 'agents' | 'reports' | 'patterns' | 'all-projects';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onOpenSwitcher: () => void;
}

function Sidebar({ collapsed, onToggle, onOpenSwitcher }: SidebarProps) {
  const { pathname } = useLocation();
  const scopedId = getScopedProjectId(pathname);
  const projectPrefix = scopedId ? `/projects/${scopedId}` : '';
  const rebindAgentPages = scopedId
    ? AGENT_PAGES.map((p) => ({ ...p, to: p.to.replace(/^\/agents/, `${projectPrefix}/agents`) }))
    : AGENT_PAGES;
  const rebindReportPages = scopedId
    ? REPORT_PAGES.map((p) => ({ ...p, to: p.to.replace(/^\/reports/, `${projectPrefix}/reports`) }))
    : REPORT_PAGES;

  const agentsBase = scopedId ? `${projectPrefix}/agents` : '/agents';
  const reportsBase = scopedId ? `${projectPrefix}/reports` : '/reports';
  const projectsActive = pathname === '/projects' || pathname.startsWith('/projects/');
  const currentProject = scopedId ? PROJECTS.find((p) => p.id === scopedId) ?? null : null;

  // Which top-level row owns the slide indicator right now.
  const activeKey: NavKey | null = useMemo(() => {
    if (pathname === '/') return 'dashboard';
    if (pathname === '/chat' || pathname.startsWith('/chat/')) return 'chat';
    if (pathname.startsWith(agentsBase)) return 'agents';
    if (pathname.startsWith(reportsBase)) return 'reports';
    if (pathname === '/patterns') return 'patterns';
    if (projectsActive) return 'all-projects';
    return null;
  }, [pathname, agentsBase, reportsBase, projectsActive]);

  // Refs for each measurable row (the visible button/anchor itself).
  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Record<NavKey, HTMLElement | null>>({
    dashboard: null,
    chat: null,
    agents: null,
    reports: null,
    patterns: null,
    'all-projects': null,
  });
  const [indicator, setIndicator] = useState<{ top: number; height: number } | null>(null);

  // Per-tab click celebration: marks which key just became active so the
  // matching row plays a one-shot punch + bloom for ~480ms. Cleared after the
  // window so the class is removed and the keyframe animation can re-fire on
  // the next navigation.
  const [justActivatedKey, setJustActivatedKey] = useState<NavKey | null>(null);
  useEffect(() => {
    if (!activeKey) {
      setJustActivatedKey(null);
      return;
    }
    setJustActivatedKey(activeKey);
    const t = setTimeout(() => setJustActivatedKey(null), 480);
    return () => clearTimeout(t);
  }, [activeKey]);

  const measure = () => {
    if (collapsed || !activeKey || !navRef.current) {
      setIndicator(null);
      return;
    }
    const el = itemRefs.current[activeKey];
    if (!el) {
      setIndicator(null);
      return;
    }
    const navRect = navRef.current.getBoundingClientRect();
    const itemRect = el.getBoundingClientRect();
    setIndicator({
      top: itemRect.top - navRect.top + navRef.current.scrollTop,
      height: itemRect.height,
    });
  };

  // Measure pre-paint on route/collapse change so the first paint sits at the
  // right position with no flash; subsequent changes animate via CSS transition.
  useLayoutEffect(measure, [activeKey, collapsed]);

  // Remeasure when the surrounding layout might have reflowed (window resize,
  // ItemGroup expand/collapse below the active row, etc.).
  useEffect(() => {
    const handler = () => measure();
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey, collapsed]);

  const setItemRef = (key: NavKey) => (el: HTMLElement | null) => {
    itemRefs.current[key] = el;
  };

  return (
    <aside
      className={`relative sticky top-0 flex h-screen shrink-0 flex-col transition-[width] duration-200 ${
        collapsed ? 'w-[72px]' : 'w-[240px]'
      }`}
      style={{
        background:
          'linear-gradient(180deg, #07050D 0%, #050308 55%, #030206 100%)',
        boxShadow: 'inset -1px 0 0 rgba(255,255,255,0.05)',
      }}
    >
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

        <nav
          ref={navRef}
          className="relative flex flex-1 flex-col gap-[2px] overflow-y-auto px-2 pb-3"
        >
          {/* Sliding active indicator — bg pill + left-edge accent bar.
           *  Base pill is NOT keyed so the `top`/`height` CSS transitions
           *  fire as it glides between rows. A separate `<FlashOverlay>` is
           *  rendered above when justActivatedKey is set; it's keyed by the
           *  key so React remounts it on each activation and the
           *  sidebar-pill-flash keyframe re-fires. */}
          {indicator && !collapsed && (
            <>
              <span
                aria-hidden
                className="pointer-events-none absolute rounded-[11px]"
                style={{
                  left: 8,
                  right: 8,
                  top: indicator.top,
                  height: indicator.height,
                  background: 'rgba(127,90,240,0.13)',
                  boxShadow: 'inset 0 0 0 1px rgba(127,90,240,0.18)',
                  transition: `top 280ms ${SLIDE_EASE}, height 220ms ${SLIDE_EASE}`,
                }}
              />
              {justActivatedKey && (
                <span
                  key={`flash-${justActivatedKey}`}
                  aria-hidden
                  className="pointer-events-none absolute rounded-[11px] sidebar-pill-flash"
                  style={{
                    left: 8,
                    right: 8,
                    top: indicator.top,
                    height: indicator.height,
                  }}
                />
              )}
              <span
                aria-hidden
                className="pointer-events-none absolute"
                style={{
                  left: 0,
                  top: indicator.top + 8,
                  height: Math.max(0, indicator.height - 16),
                  width: 2.5,
                  background: ACCENT_GRAD,
                  borderRadius: '0 4px 4px 0',
                  boxShadow: ACCENT_GLOW,
                  transition: `top 280ms ${SLIDE_EASE}, height 220ms ${SLIDE_EASE}`,
                }}
              />
            </>
          )}

          <MainNavItem
            to="/"
            icon={House}
            label="Dashboard"
            collapsed={collapsed}
            end
            itemRef={setItemRef('dashboard')}
            justActivated={justActivatedKey === 'dashboard'}
          />
          <MainNavItem
            to="/chat"
            icon={ChatCircle}
            label="Chat"
            collapsed={collapsed}
            itemRef={setItemRef('chat')}
            justActivated={justActivatedKey === 'chat'}
          />
          <ItemGroup
            icon={Robot}
            label="Agents"
            basePath={agentsBase}
            pages={rebindAgentPages}
            collapsed={collapsed}
            running
            itemRef={setItemRef('agents')}
            justActivated={justActivatedKey === 'agents'}
          />
          <ItemGroup
            icon={ChartLineUp}
            label="Reports"
            basePath={reportsBase}
            pages={rebindReportPages}
            collapsed={collapsed}
            itemRef={setItemRef('reports')}
            justActivated={justActivatedKey === 'reports'}
          />
          <MainNavItem
            to="/patterns"
            icon={Compass}
            label="Patterns"
            collapsed={collapsed}
            itemRef={setItemRef('patterns')}
            justActivated={justActivatedKey === 'patterns'}
          />

          <div className={`my-3 h-px ${collapsed ? 'mx-3' : 'mx-2'} bg-white/[0.06]`} />

          {!collapsed && currentProject && <CurrentProjectChip project={currentProject} />}

          <AllProjectsRow
            collapsed={collapsed}
            active={projectsActive}
            onClick={onOpenSwitcher}
            itemRef={setItemRef('all-projects')}
            justActivated={justActivatedKey === 'all-projects'}
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
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 flex h-[20px] -translate-y-1/2 items-center rounded-[5px] border border-white/[0.10] bg-white/[0.04] px-[6px] text-[11px] font-semibold leading-none text-white/70">
          ⌘K
        </kbd>
      </div>
    </div>
  );
}

/* ─── Nav icon (animated) ───────────────────────────────────────────────── */

function NavIcon({
  Icon, isActive, justActivated, collapsed,
}: { Icon: typeof House; isActive: boolean; justActivated?: boolean; collapsed: boolean }) {
  const size = collapsed ? 20 : 24;
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center ${ICON_TRANSITION} group-hover:scale-[1.08] group-active:scale-90 ${
        justActivated ? 'sidebar-just-activated' : ''
      }`}
      style={{ width: size, height: size }}
    >
      {/* Halo ring — conditionally mounted so the keyframe re-fires every
       *  activation. Sibling element (not ::before) so its scale animation
       *  is independent of the wrapper's punch transform. */}
      {justActivated && !collapsed && (
        <span aria-hidden className="sidebar-halo-ring" />
      )}
      <Icon
        size={size}
        weight="duotone"
        className={`absolute inset-0 transition-opacity duration-[180ms] ${
          isActive ? 'opacity-0' : 'opacity-100 text-white/[0.78]'
        }`}
      />
      <Icon
        size={size}
        weight="fill"
        className={`absolute inset-0 transition-opacity duration-[180ms] ${
          isActive
            ? 'opacity-100 text-white drop-shadow-[0_0_8px_rgba(127,90,240,0.45)]'
            : 'opacity-0'
        } ${justActivated && isActive ? 'sidebar-icon-flash' : ''}`}
      />
    </span>
  );
}

/* ─── Main nav item ─────────────────────────────────────────────────────── */

function MainNavItem({
  to, icon: Icon, label, collapsed, end, itemRef, justActivated,
}: {
  to: string;
  icon: typeof House;
  label: string;
  collapsed: boolean;
  end?: boolean;
  itemRef?: (el: HTMLAnchorElement | null) => void;
  justActivated?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      ref={itemRef}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        `group relative z-[1] flex items-center rounded-[11px] transition-colors duration-200 ${
          collapsed ? 'justify-center px-2 py-[11px]' : 'gap-3 pl-[14px] pr-[12px] py-[12px]'
        } ${
          collapsed
            ? isActive
              ? 'bg-[rgba(127,90,240,0.13)] text-white shadow-[inset_0_0_0_1px_rgba(127,90,240,0.18)]'
              : 'text-white/[0.82] hover:bg-[rgba(127,90,240,0.07)] hover:text-white'
            : isActive
              ? 'text-white'
              : 'text-white/[0.82] hover:bg-[rgba(127,90,240,0.06)] hover:text-white'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <NavIcon
            Icon={Icon}
            isActive={isActive}
            justActivated={justActivated}
            collapsed={collapsed}
          />
          {!collapsed && (
            <span
              className="flex-1 text-[15px] leading-none tracking-[-0.01em]"
              style={{
                fontFamily: SIDEBAR_FONT,
                fontWeight: isActive ? 900 : 700,
                transition: 'font-weight 240ms ease',
              }}
            >
              {label}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

/* ─── ItemGroup (expandable Agents/Reports) ─────────────────────────────── */

function ItemGroup({
  icon: Icon,
  label,
  basePath,
  pages,
  collapsed,
  running,
  itemRef,
  justActivated,
}: {
  icon: typeof House;
  label: string;
  basePath: string;
  pages: SubPage[];
  collapsed: boolean;
  running?: boolean;
  itemRef?: (el: HTMLButtonElement | null) => void;
  justActivated?: boolean;
}) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const inSection = pathname.startsWith(basePath);
  const [open, setOpen] = useState(inSection);
  useEffect(() => { if (inSection) setOpen(true); }, [inSection]);

  if (collapsed) {
    return (
      <button
        ref={itemRef}
        onClick={() => navigate(pages[0].to)}
        title={label}
        className={`group relative z-[1] flex w-full items-center justify-center rounded-[11px] px-2 py-[11px] transition-colors ${
          inSection
            ? 'bg-[rgba(127,90,240,0.13)] text-white shadow-[inset_0_0_0_1px_rgba(127,90,240,0.18)]'
            : 'text-white/[0.82] hover:bg-[rgba(127,90,240,0.07)] hover:text-white'
        }`}
      >
        <NavIcon Icon={Icon} isActive={inSection} justActivated={justActivated} collapsed />
      </button>
    );
  }

  return (
    <div>
      <button
        ref={itemRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`group relative z-[1] flex w-full items-center gap-3 rounded-[11px] pl-[14px] pr-[12px] py-[12px] text-left transition-colors duration-200 ${
          inSection
            ? 'text-white'
            : 'text-white/[0.82] hover:bg-[rgba(127,90,240,0.06)] hover:text-white'
        }`}
      >
        <NavIcon
          Icon={Icon}
          isActive={inSection}
          justActivated={justActivated}
          collapsed={false}
        />
        <span
          className="flex-1 text-[15px] leading-none tracking-[-0.01em]"
          style={{
            fontFamily: SIDEBAR_FONT,
            fontWeight: inSection ? 900 : 700,
            transition: 'font-weight 240ms ease',
          }}
        >
          {label}
        </span>
        {running && <RunningPulse />}
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
  collapsed, active, onClick, itemRef, justActivated,
}: {
  collapsed: boolean;
  active: boolean;
  onClick: () => void;
  itemRef?: (el: HTMLButtonElement | null) => void;
  justActivated?: boolean;
}) {
  if (collapsed) {
    return (
      <button
        ref={itemRef}
        onClick={onClick}
        title="All projects"
        className={`group relative z-[1] flex w-full items-center justify-center rounded-[11px] px-2 py-[11px] transition-colors ${
          active
            ? 'bg-[rgba(127,90,240,0.13)] text-white shadow-[inset_0_0_0_1px_rgba(127,90,240,0.18)]'
            : 'text-white/[0.82] hover:bg-[rgba(127,90,240,0.07)] hover:text-white'
        }`}
      >
        <NavIcon
          Icon={SquaresFour}
          isActive={active}
          justActivated={justActivated}
          collapsed
        />
      </button>
    );
  }
  return (
    <button
      ref={itemRef}
      onClick={onClick}
      className={`group relative z-[1] flex w-full items-center gap-3 rounded-[11px] pl-[14px] pr-[12px] py-[12px] text-left transition-colors duration-200 ${
        active
          ? 'text-white'
          : 'text-white/[0.82] hover:bg-[rgba(127,90,240,0.06)] hover:text-white'
      }`}
    >
      <NavIcon
        Icon={SquaresFour}
        isActive={active}
        justActivated={justActivated}
        collapsed={false}
      />
      <span
        className="flex-1 text-[15px] leading-none tracking-[-0.01em]"
        style={{
          fontFamily: SIDEBAR_FONT,
          fontWeight: active ? 900 : 700,
          transition: 'font-weight 240ms ease',
        }}
      >
        All projects
      </span>
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
      className="group relative z-[1] mx-[2px] mb-1 flex items-center gap-3 rounded-[10px] border border-white/[0.07] bg-white/[0.022] pl-[10px] pr-[12px] py-[9px] transition-all hover:border-white/[0.15] hover:bg-white/[0.04]"
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
          <div className="flex items-center justify-between px-5 pt-[22px] pb-3">
            <h2
              className="text-[22px] font-extrabold leading-none tracking-[-0.022em] text-white"
              style={{ fontFamily: SIDEBAR_FONT }}
            >
              Projects
            </h2>
            <button
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-md text-white/65 transition-colors hover:bg-white/[0.06] hover:text-white"
              title="Close (Esc)"
            >
              <X size={16} weight="bold" />
            </button>
          </div>

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
            ? 'bg-[rgba(127,90,240,0.13)] text-white shadow-[inset_0_0_0_1px_rgba(127,90,240,0.18)]'
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

/* "Running" indicator pulse — no number, just a green halo'd dot. */
function RunningPulse() {
  return (
    <span className="relative inline-flex shrink-0 items-center" aria-label="agents running">
      <span
        className="relative h-[6px] w-[6px] rounded-full"
        style={{
          background: '#5DC2A2',
          boxShadow: '0 0 0 2px rgba(93,194,162,0.22), 0 0 10px rgba(93,194,162,0.55)',
        }}
      />
      <span
        aria-hidden
        className="absolute inset-0 m-auto h-[6px] w-[6px] rounded-full"
        style={{
          background: '#5DC2A2',
          animation: 'sidebar-pulse 1.8s ease-out infinite',
        }}
      />
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
