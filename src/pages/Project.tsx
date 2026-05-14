import { useParams, Link, Navigate } from 'react-router-dom';
import {
  ArrowRight, ArrowLeft, Clock, Sparkle, FileText, TrendUp, TrendDown,
} from '@phosphor-icons/react';
import { PROJECTS, ACCOUNTS } from '../mock/projects';
import { RECENT_RUNS_SUMMARY } from '../mock/runs';
import { AGENTS } from '../mock/agents';
import { PageHero, SectionHeader, PrimaryCTA, SecondaryButton } from '../components/PageHero';

// Project page · /projects/:id
//
// Editorial rhythm. Simplified per Jose's note: keep ONLY the things
// that earn their real estate, every section pointing at MONEY / TIME /
// APPROVAL for this specific client.

export function ProjectPage() {
  const { id } = useParams();
  const project = PROJECTS.find((p) => p.id === id);
  if (!project) return <Navigate to="/" replace />;

  const accounts = ACCOUNTS.filter((a) => a.projectId === project.id);
  const recentRuns = RECENT_RUNS_SUMMARY.filter((r) => r.projectName === project.name);
  const suggested = [AGENTS[0], AGENTS[2], AGENTS[10]];

  return (
    <div className="space-y-10">
      <Link to="/" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ppc-neutral-500 hover:text-ppc-purple-500">
        <ArrowLeft size={13} /> Dashboard
      </Link>

      <PageHero
        eyebrow={`Client · ${project.industry}`}
        headline={`${project.name}.`}
        description={`${accounts.length} ${accounts.length === 1 ? 'account' : 'accounts'} connected. Your agents are watching, surfacing waste, and queueing recommendations every week.`}
        actions={
          <>
            <PrimaryCTA>
              <Sparkle size={16} weight="fill" /> Run an agent
            </PrimaryCTA>
            <SecondaryButton>
              <FileText size={16} weight="duotone" /> Client report
            </SecondaryButton>
          </>
        }
      />

      {/* This-week rollup — editorial 3-column, not card-grid */}
      <section className="grid gap-x-12 gap-y-8 border-y border-ppc-neutral-100 py-8 sm:grid-cols-3">
        <Stat eyebrow="Surfaced this week" value="$8.2K" sub="of upside across this client" trend="+22% wow" />
        <Stat eyebrow="Time saved" value="~9h" sub="of analyst time" trend="vs manual baseline" />
        <Stat eyebrow="Active campaigns" value="14" sub="across this client's accounts" trend="2 testing now" />
      </section>

      {/* Business context — compact editorial block */}
      <section>
        <SectionHeader eyebrow="Business context" title="What every agent knows about this client." />
        <p className="max-w-[760px] text-[16.5px] leading-relaxed text-ppc-neutral-700">
          Personal injury law firm based in Ohio. Offer: contingency-fee representation
          ("no fee unless we win"). ICP: post-accident claimants aged 25–55 within 48 hours
          of incident. Trust signals lean on settlement history and senior-attorney photos.
          Weakest point in the alignment chain right now: landing page form length (6 fields)
          vs the 3 fields most rivals use.
        </p>
        <button className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-ppc-purple-500 hover:underline">
          Edit context <ArrowRight size={12} weight="bold" />
        </button>
      </section>

      {/* Connected accounts — editorial table */}
      <section>
        <SectionHeader eyebrow="Connected accounts" title={`${accounts.length} live ${accounts.length === 1 ? 'account' : 'accounts'}.`} />
        <div className="overflow-hidden rounded-2xl border border-ppc-neutral-100 bg-white">
          <table className="w-full">
            <thead className="border-b border-ppc-neutral-100 bg-ppc-neutral-25">
              <tr>
                <Th>Account</Th>
                <Th>Customer ID</Th>
                <Th>Health</Th>
                <Th>30d spend</Th>
                <Th>Trend</Th>
                <Th>{''}</Th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((acc, i) => (
                <tr key={acc.id} className={i < accounts.length - 1 ? 'border-b border-ppc-neutral-100' : ''}>
                  <td className="px-6 py-4 text-[14.5px] font-medium text-ppc-black">{acc.name}</td>
                  <td className="tabular px-6 py-4 font-mono text-[12.5px] text-ppc-neutral-500">{acc.customerId}</td>
                  <td className="px-6 py-4">
                    <HealthPill health={acc.health} />
                  </td>
                  <td className="tabular px-6 py-4 text-[14px] font-semibold text-ppc-black">$8,420</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-ppc-success">
                      <TrendUp size={13} weight="bold" /> 12%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-[13px] font-semibold text-ppc-purple-500 hover:underline">
                      Open →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Campaigns at a glance — same editorial table style */}
      <section>
        <SectionHeader eyebrow="Campaigns at a glance" title="Where the budget is going." />
        <div className="overflow-hidden rounded-2xl border border-ppc-neutral-100 bg-white">
          <table className="w-full">
            <thead className="border-b border-ppc-neutral-100 bg-ppc-neutral-25">
              <tr>
                <Th>Campaign</Th>
                <Th>Budget</Th>
                <Th>30d spend</Th>
                <Th>CPA</Th>
                <Th>7d trend</Th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Brand — Smith Law',         '$2,500/d', '$74,200', '$48',  'up'],
                ['Non-brand — Injury types',  '$3,800/d', '$98,400', '$112', 'up'],
                ['Local services — Cleveland','$1,200/d', '$32,100', '$96',  'flat'],
                ['Settlement angle test',     '$800/d',   '$11,800', '$74',  'up'],
                ['Spanish-speaking buyers',   '$600/d',   '$6,400',  '$132', 'down'],
              ].map((row, i, arr) => (
                <tr key={i} className={i < arr.length - 1 ? 'border-b border-ppc-neutral-100' : ''}>
                  <td className="px-6 py-4 text-[14.5px] font-medium text-ppc-black">{row[0]}</td>
                  <td className="tabular px-6 py-4 text-[14px] text-ppc-neutral-700">{row[1]}</td>
                  <td className="tabular px-6 py-4 text-[14px] font-semibold text-ppc-black">{row[2]}</td>
                  <td className="tabular px-6 py-4 text-[14px] text-ppc-neutral-700">{row[3]}</td>
                  <td className="px-6 py-4">
                    {row[4] === 'up' && (
                      <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-ppc-success">
                        <TrendUp size={13} weight="bold" /> up
                      </span>
                    )}
                    {row[4] === 'down' && (
                      <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-ppc-error">
                        <TrendDown size={13} weight="bold" /> down
                      </span>
                    )}
                    {row[4] === 'flat' && (
                      <span className="text-[13px] font-semibold text-ppc-neutral-500">→ flat</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recent runs for this client */}
      {recentRuns.length > 0 && (
        <section>
          <SectionHeader eyebrow="Recent runs · this client" title="What's been on this account's desk." />
          <ul className="divide-y divide-ppc-neutral-100 rounded-2xl border border-ppc-neutral-100 bg-white">
            {recentRuns.map((r) => (
              <li key={r.runId}>
                <Link
                  to={`/reports/${r.runId}`}
                  className="group flex items-center gap-6 px-8 py-6 hover:bg-ppc-purple-50/30"
                >
                  <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-ppc-purple-500 sm:w-44">
                    {r.agentName}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[16px] font-semibold tracking-tight text-ppc-black">
                      {r.headline}
                    </div>
                    <div className="mt-0.5 flex items-center gap-3 text-[12.5px] text-ppc-neutral-500">
                      <span className="tabular">{r.duration}</span>
                      <span className="text-ppc-neutral-300">·</span>
                      <span>{r.finishedAt}</span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-ppc-success">
                    <TrendUp size={13} weight="bold" />
                    <span className="tabular">{r.upside}</span>
                  </span>
                  <ArrowRight size={14} weight="bold" className="text-ppc-neutral-300 group-hover:text-ppc-purple-500" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Suggested next agents */}
      <section>
        <SectionHeader eyebrow="What's worth running next" title="Three plays for this client." />
        <ul className="divide-y divide-ppc-neutral-100 rounded-2xl border border-ppc-neutral-100 bg-white">
          {suggested.map((a) => (
            <li key={a.slug}>
              <Link
                to={`/agents/${a.slug}`}
                className="group flex items-center gap-6 px-8 py-6 hover:bg-ppc-purple-50/30"
              >
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-ppc-purple-50 text-[20px]">
                  {a.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[17px] font-bold tracking-tight text-ppc-black">{a.name}</div>
                  <div className="mt-1 max-w-[640px] text-[14px] leading-snug text-ppc-neutral-600">{a.headline}</div>
                </div>
                <div className="hidden text-right sm:block">
                  <div className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ppc-neutral-500">
                    <Clock size={12} weight="duotone" /> {a.expectedDuration}
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-ppc-purple-500 group-hover:gap-2 transition-[gap]">
                  Launch <ArrowRight size={13} weight="bold" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Stat({ eyebrow, value, sub, trend }: {
  eyebrow: string; value: string; sub: string; trend: string;
}) {
  return (
    <div>
      <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ppc-neutral-500">
        {eyebrow}
      </div>
      <div className="tabular mt-3 text-[44px] font-extrabold leading-none tracking-[-0.035em] text-ppc-black">
        {value}
      </div>
      <div className="mt-2.5 text-[13px] text-ppc-neutral-600">{sub}</div>
      <div className="mt-1 font-mono text-[11px] uppercase tracking-wider text-ppc-purple-500">{trend}</div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-6 py-3 text-left font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ppc-neutral-500">
      {children}
    </th>
  );
}

function HealthPill({ health }: { health: 'good' | 'warning' | 'attention' }) {
  const map = {
    good:      { dot: 'bg-ppc-success', text: 'text-ppc-success', label: 'Healthy' },
    warning:   { dot: 'bg-ppc-warning', text: 'text-ppc-warning', label: 'Watch' },
    attention: { dot: 'bg-ppc-error',   text: 'text-ppc-error',   label: 'Needs attention' },
  }[health];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[13px] font-semibold ${map.text}`}>
      <span className={`h-2 w-2 rounded-full ${map.dot}`} />
      {map.label}
    </span>
  );
}
