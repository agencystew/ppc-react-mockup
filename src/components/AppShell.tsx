import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  House, Robot, Folder, Lightning, ChartLineUp, BookOpen, Gear,
  Sparkle, MagnifyingGlass, SidebarSimple,
  Buildings, CaretDown, Clock,
} from '@phosphor-icons/react';
import { PROJECTS, CURRENT_PROJECT_ID } from '../mock/projects';

// AppShell — classic SaaS layout. LIGHT workshop, dark moments live INSIDE
// pages (the StagePage canvas, the Dashboard hero card, etc.).
//
//   ┌──────────────┬─────────────────────────────┐
//   │  Sidebar     │  Main content               │
//   │  white       │  lavender (#F3F0FF, body)   │
//   └──────────────┴─────────────────────────────┘
//
// Per Stewart's design principle (see memory:
//   feedback_ppcio_app_hybrid_light_dark_design_system.md):
//   "Dark content surfaces are for AI work and its outputs. Everything
//    else stays in the light system."
// AppShell + sidebar are workshop = LIGHT. Page-level dark moments come
// from .ppc-dark blocks inside pages.

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
      className={`sticky top-0 flex h-screen shrink-0 flex-col border-r border-ppc-neutral-100 bg-white transition-[width] duration-200 ${
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
          <Item to="/projects"       icon={Folder}       label="Projects"       collapsed={collapsed} />
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
    <div className={`flex h-14 items-center border-b border-ppc-neutral-100 ${collapsed ? 'justify-center px-2' : 'justify-between px-4'}`}>
      {!collapsed && (
        <NavLink to="/" className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-ppc-purple-500 text-[12px] font-extrabold leading-none text-white">
            ɪ
          </span>
          <span className="text-[14.5px] font-bold tracking-tight text-ppc-black">ppc.io</span>
        </NavLink>
      )}
      <button
        onClick={onToggle}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="grid h-8 w-8 place-items-center rounded-md text-ppc-neutral-500 hover:bg-ppc-neutral-50 hover:text-ppc-black"
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
      <div className="flex justify-center border-b border-ppc-neutral-100 px-2 py-3">
        <button
          onClick={() => setOpen(!open)}
          title={current.name}
          className="grid h-9 w-9 place-items-center rounded-lg bg-ppc-purple-50 text-ppc-purple-500 hover:bg-ppc-purple-100"
        >
          <Buildings size={16} weight="duotone" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative border-b border-ppc-neutral-100 px-3 py-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-ppc-neutral-100 bg-ppc-neutral-25 px-3 py-2.5 text-left transition-colors hover:border-ppc-purple-300"
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-ppc-purple-50 text-ppc-purple-500">
            <Buildings size={14} weight="duotone" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13.5px] font-semibold leading-tight text-ppc-black">
              {current.name}
            </span>
            <span className="block truncate text-[11.5px] text-ppc-neutral-500">
              {current.accountCount} {current.accountCount === 1 ? 'account' : 'accounts'}
            </span>
          </span>
        </span>
        <CaretDown
          size={12}
          weight="bold"
          className={`shrink-0 text-ppc-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute left-3 right-3 top-full z-20 mt-1.5 overflow-hidden rounded-xl border border-ppc-neutral-100 bg-white shadow-ppc-lg">
          <div className="flex items-center gap-2 border-b border-ppc-neutral-100 px-3 py-2.5">
            <MagnifyingGlass size={14} className="text-ppc-neutral-400" />
            <input
              autoFocus
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search clients..."
              className="w-full bg-transparent text-[13px] outline-none placeholder:text-ppc-neutral-400"
            />
          </div>
          <ul className="max-h-72 overflow-y-auto py-1.5">
            {filtered.map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => { setOpen(false); navigate(`/projects/${p.id}`); }}
                  className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[13px] hover:bg-ppc-purple-50 ${
                    p.id === CURRENT_PROJECT_ID ? 'bg-ppc-purple-50/60' : ''
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-ppc-black">{p.name}</span>
                    <span className="block truncate text-[11.5px] text-ppc-neutral-500">{p.industry}</span>
                  </span>
                  <span className="font-mono text-[11px] text-ppc-neutral-400">
                    {p.accountCount}
                  </span>
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-3 py-5 text-center text-[12px] text-ppc-neutral-400">
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
    <div className="border-b border-ppc-neutral-100 px-3 py-3">
      <div className="relative">
        <MagnifyingGlass
          size={14}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ppc-neutral-400"
        />
        <input
          readOnly
          placeholder="Search..."
          className="w-full cursor-pointer rounded-lg border border-ppc-neutral-100 bg-ppc-neutral-25 py-2 pl-8 pr-12 text-[13px] outline-none placeholder:text-ppc-neutral-400 hover:border-ppc-purple-300"
        />
        <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-ppc-neutral-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-ppc-neutral-500">
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
        <div className="mb-1.5 px-3 font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ppc-neutral-400">
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
              ? 'bg-ppc-purple-50 font-semibold text-ppc-purple-700'
              : 'font-medium text-ppc-neutral-700 hover:bg-ppc-neutral-25 hover:text-ppc-black'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <Icon
              size={16}
              weight={isActive ? 'fill' : 'duotone'}
              className={isActive ? 'text-ppc-purple-500' : 'text-ppc-neutral-400 group-hover:text-ppc-purple-500'}
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
      <div className="flex justify-center border-t border-ppc-neutral-100 px-2 py-3">
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
    <div className="border-t border-ppc-neutral-100 px-3 py-3">
      <div className="flex items-center gap-3 rounded-xl border border-ppc-neutral-100 bg-ppc-neutral-25 px-3 py-2.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-ppc-purple-300 to-ppc-purple-500 text-[11.5px] font-bold text-white">
          SD
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-semibold leading-tight text-ppc-black">
            Stewart Dunlop
          </span>
          <span className="block truncate text-[11.5px] text-ppc-neutral-500">stewart@ppc.io</span>
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between px-1 text-[11px] text-ppc-neutral-400">
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
