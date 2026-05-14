import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  House, Robot, Folder, Lightning, ChartLineUp, BookOpen, Gear,
  Sparkle, MagnifyingGlass, SidebarSimple,
  Buildings, CaretDown, Clock,
} from '@phosphor-icons/react';
import { PROJECTS, CURRENT_PROJECT_ID } from '../mock/projects';

// AppShell — classic SaaS layout on a dark canvas.
//
//   ┌──────────────┬─────────────────────────────┐
//   │  Sidebar     │  Main content               │
//   │  bg #15151A  │  bg #0C0C0E (Smoky Black)   │
//   └──────────────┴─────────────────────────────┘
//
// Whole app reads at the StagePage register: dark page bg, white type,
// purple-400 active accents, white/8 dividers. Sidebar is bg-2 (#15151A),
// content slot is bg-1 (#0C0C0E from body). Sidebar collapse persists in
// localStorage.

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
    <div className="flex min-h-screen w-full bg-ppc-black font-sans text-white">
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
      className={`sticky top-0 flex h-screen shrink-0 flex-col border-r border-white/8 bg-[#15151A] transition-[width] duration-200 ${
        collapsed ? 'w-[72px]' : 'w-[240px]'
      }`}
    >
      <BrandRow collapsed={collapsed} onToggle={onToggle} />
      <ProjectSwitcher collapsed={collapsed} />
      <SearchRow collapsed={collapsed} />

      <nav className="flex-1 overflow-y-auto px-3 pb-3">
        <NavSection eyebrow="App" collapsed={collapsed}>
          <Item to="/"               icon={House}        label="Dashboard"      collapsed={collapsed} end />
          <Item to="/agents"         icon={Robot}        label="Agents"         collapsed={collapsed} />
          <Item to="/projects" icon={Folder} label="Projects" collapsed={collapsed} />
          <Item to="/reports/run-competitor-spy-completed" icon={ChartLineUp} label="Reports" collapsed={collapsed} />
          <Item to="/runs"           icon={Lightning}    label="Mission Control" collapsed={collapsed} />
        </NavSection>

        <NavSection eyebrow="Library" collapsed={collapsed}>
          <Item to="/resources"  icon={BookOpen} label="Resources" collapsed={collapsed} />
        </NavSection>

        <NavSection eyebrow="Workspace" collapsed={collapsed}>
          <Item to="/settings" icon={Gear} label="Settings" collapsed={collapsed} />
        </NavSection>
      </nav>

      <SidebarFooter collapsed={collapsed} />
    </aside>
  );
}

// ─── Sidebar pieces ───────────────────────────────────────────────────────

function BrandRow({ collapsed, onToggle }: SidebarProps) {
  return (
    <div className={`flex h-14 items-center border-b border-white/8 ${collapsed ? 'justify-center px-2' : 'justify-between px-4'}`}>
      {!collapsed && (
        <NavLink to="/" className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-ppc-purple-500 text-[12px] font-extrabold leading-none text-white">
            ɪ
          </span>
          <span className="text-[14.5px] font-bold tracking-tight text-white">ppc.io</span>
        </NavLink>
      )}
      <button
        onClick={onToggle}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="grid h-8 w-8 place-items-center rounded-md text-white/45 hover:bg-white/5 hover:text-white"
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

function ProjectSwitcher({ collapsed }: { collapsed: boolean }) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const navigate = useNavigate();
  const current = PROJECTS.find((p) => p.id === CURRENT_PROJECT_ID) ?? PROJECTS[0];
  const filtered = PROJECTS.filter((p) =>
    p.name.toLowerCase().includes(filter.toLowerCase()),
  );

  if (collapsed) {
    return (
      <div className="flex justify-center border-b border-white/8 px-2 py-3">
        <button
          onClick={() => setOpen(!open)}
          title={current.name}
          className="grid h-9 w-9 place-items-center rounded-lg bg-ppc-purple-500/15 text-ppc-purple-300 hover:bg-ppc-purple-500/25"
        >
          <Buildings size={16} weight="duotone" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative border-b border-white/8 px-3 py-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5 text-left transition-colors hover:border-ppc-purple-500/40 hover:bg-white/[0.05]"
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-ppc-purple-500/15 text-ppc-purple-300">
            <Buildings size={14} weight="duotone" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13.5px] font-semibold leading-tight text-white">
              {current.name}
            </span>
            <span className="block truncate text-[11.5px] text-white/45">
              {current.accountCount} {current.accountCount === 1 ? 'account' : 'accounts'}
            </span>
          </span>
        </span>
        <CaretDown
          size={12}
          weight="bold"
          className={`shrink-0 text-white/40 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute left-3 right-3 top-full z-20 mt-1.5 overflow-hidden rounded-xl border border-white/10 bg-[#1E1E24] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.7)]">
          <div className="flex items-center gap-2 border-b border-white/8 px-3 py-2.5">
            <MagnifyingGlass size={14} className="text-white/40" />
            <input
              autoFocus
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search clients..."
              className="w-full bg-transparent text-[13px] text-white outline-none placeholder:text-white/40"
            />
          </div>
          <ul className="max-h-72 overflow-y-auto py-1.5">
            {filtered.map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => { setOpen(false); navigate(`/projects/${p.id}`); }}
                  className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[13px] hover:bg-ppc-purple-500/10 ${
                    p.id === CURRENT_PROJECT_ID ? 'bg-ppc-purple-500/10' : ''
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-white">{p.name}</span>
                    <span className="block truncate text-[11.5px] text-white/45">{p.industry}</span>
                  </span>
                  <span className="font-mono text-[11px] text-white/40">
                    {p.accountCount}
                  </span>
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-3 py-5 text-center text-[12px] text-white/40">
                No clients match "{filter}"
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

function SearchRow({ collapsed }: { collapsed: boolean }) {
  if (collapsed) return null;
  return (
    <div className="border-b border-white/8 px-3 py-3">
      <div className="relative">
        <MagnifyingGlass
          size={14}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
        />
        <input
          readOnly
          placeholder="Search..."
          className="w-full cursor-pointer rounded-lg border border-white/8 bg-white/[0.03] py-2 pl-8 pr-12 text-[13px] text-white outline-none placeholder:text-white/40 hover:border-ppc-purple-500/40"
        />
        <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-white/10 bg-white/[0.05] px-1.5 py-0.5 font-mono text-[10px] text-white/55">
          ⌘K
        </kbd>
      </div>
    </div>
  );
}

function NavSection({
  eyebrow, collapsed, children,
}: {
  eyebrow: string; collapsed: boolean; children: React.ReactNode;
}) {
  return (
    <div className="mt-4 first:mt-3">
      {!collapsed && (
        <div className="mb-1.5 px-3 font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-white/40">
          {eyebrow}
        </div>
      )}
      <ul className="flex flex-col gap-0.5">{children}</ul>
    </div>
  );
}

function Item({
  to, icon: Icon, label, collapsed, end,
}: {
  to: string;
  icon: typeof House;
  label: string;
  collapsed: boolean;
  end?: boolean;
}) {
  return (
    <li>
      <NavLink
        to={to}
        end={end}
        title={collapsed ? label : undefined}
        className={({ isActive }) =>
          `group flex items-center rounded-lg text-[13.5px] transition-colors ${
            collapsed ? 'justify-center px-2 py-2' : 'gap-2.5 px-3 py-2'
          } ${
            isActive
              ? 'bg-ppc-purple-500/15 font-semibold text-ppc-purple-300'
              : 'font-medium text-white/70 hover:bg-white/5 hover:text-white'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <Icon
              size={16}
              weight={isActive ? 'fill' : 'duotone'}
              className={isActive ? 'text-ppc-purple-300' : 'text-white/45 group-hover:text-ppc-purple-300'}
            />
            {!collapsed && <span>{label}</span>}
          </>
        )}
      </NavLink>
    </li>
  );
}

function SidebarFooter({ collapsed }: { collapsed: boolean }) {
  if (collapsed) {
    return (
      <div className="flex justify-center border-t border-white/8 px-2 py-3">
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
    <div className="border-t border-white/8 px-3 py-3">
      <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-ppc-purple-300 to-ppc-purple-500 text-[11.5px] font-bold text-white">
          SD
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-semibold leading-tight text-white">
            Stewart Dunlop
          </span>
          <span className="block truncate text-[11.5px] text-white/45">stewart@ppc.io</span>
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between px-1 text-[11px] text-white/40">
        <span className="inline-flex items-center gap-1">
          <Sparkle size={11} weight="duotone" /> Beta
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock size={11} /> Saves ~22 h/wk
        </span>
      </div>
    </div>
  );
}
