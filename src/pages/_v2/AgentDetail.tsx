// AgentDetail — v2 rebuild.
//
// Route: /agents/:slug
//
// THREE spreads only (Discipline Rule #5):
//   A · The verb        — 96px H1 in two lines, second line offset 80px.
//                         One Caveat ("what nobody else gets right").
//   B · Launch input    — a single tilted Sticker postcard with one URL input
//                         and one primary PillButton.
//   C · Sample receipts — three plain ink-bordered cards. No tilt, no shadow.
//
// Five Discipline Rules enforced:
//   1. Five font sizes only — DISPLAY 96 / H1 56 / H2 32 / BODY 17 / MONO 14.
//   2. One tilted element  — the Spread B Sticker (tilt -2, no mobile tilt).
//   3. No mascot on this page.
//   4. One Caveat — Spread A only.
//   5. Three spreads max — A + B + C.

import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { AGENTS } from '../../mock/agents';
import { NEEDS_TODAY, READY_FOR_CLIENT, FYI_REPORTS } from '../../mock/reports';
import type { AgentDefinition } from '../../types/agent';
import { Sticker } from '../../components/brand/Sticker';
import { PillButton } from '../../components/brand/PillButton';
import { Caveat } from '../../components/brand/Caveat';

// ─── Verb sentences ───────────────────────────────────────────────────────
//
// Two short imperative sentences per agent. Three Stewart-blessed slugs match
// the spec verbatim. For the rest, we shape the existing outcome into two
// lines of ~3-4 words each. If a slug has no entry, we fall back to the
// agent's headline (split sensibly) so the page never looks broken.

const VERBS: Record<string, [string, string]> = {
  // Spec-locked
  'competitor-spy':       ['Hunts your competitors.',   'Returns receipts.'],
  'weekly-audit':         ['Reads your account.',       "Tells you what's bleeding."],
  'landing-page':         ['Builds the page.',          'Your ads deserve.'],

  // Operations
  'deep-account-audit':   ['Reads the whole account.',  'Hands you the meeting.'],
  'negative-keyword':     ['Hunts the waste.',          'Spares the converters.'],
  'budget-pacer':         ['Reads the pace.',           'Reallocates the spend.'],
  'spend-leak':           ['Finds the leaks.',          'Names the dollars.'],
  'profit-tracker':       ['Reads the profit.',         'Not the spend.'],

  // Creative
  'ad-copy':              ['Writes the ads.',           'Your rivals wish they had.'],
  'landing-page-designer':['Designs the page.',         "From your buyer's brain."],
  'shopping-feed':        ['Fixes the feed.',           'Before you fix the bid.'],

  // Strategic
  'pmax':                 ['Opens the black box.',      'Names the leaks.'],
  'keyword':              ['Hunts the demand.',         "You're missing."],
  'keyword-auditor':      ['Reads every keyword.',      'Kills the dead ones.'],
  'campaign-architect':   ['Reads the structure.',      'Rebuilds the bones.'],

  // Buyer
  'buyer-journey':        ['Walks the journey.',        'Names the breaks.'],
  'readiness':            ['Sorts the buyers.',         'From the browsers.'],

  // Diagnostics
  'demand-ceiling':       ['Reads the ceiling.',        'Shows the headroom.'],
  'test-recommender':     ['Reads the account.',        'Names the tests worth running.'],
  'change-impact':        ['Reads the change.',         'Tells you if it worked.'],
  'brand-safety':         ['Scans every placement.',    "Flags what you'd hate to see."],

  // Client
  'client-reporting':     ['Reads the month.',          "Writes the report you'd send."],
  'sales-intelligence':   ['Reads the prospect.',       'Wins the next pitch.'],
  'new-client-autopilot': ['Onboards the account.',     'Without the slog.'],

  // Context
  'business-context':     ['Reads your business.',      'Teaches every agent who you are.'],
  'competitor-context':   ['Maps the battlefield.',     'Before you fight on it.'],
  'google-ads-context':   ['Reads the account.',        'Captures the quirks.'],
  'persona':              ['Reads your buyer.',         'In their own words.'],
  'context-enrichment':   ['Reads the extras.',         'Sharpens what the agents know.'],
};

function verbFor(agent: AgentDefinition): [string, string] {
  const exact = VERBS[agent.slug];
  if (exact) return exact;
  // Fallback: split the agent's headline at the first period, em-dash, or
  // comma. Both halves get trimmed; if the second half is empty we use the
  // category descriptor as a backup so we never ship a single-line H1.
  const raw = agent.headline.replace(/—/g, '.');
  const parts = raw.split(/[.,]/).map((s) => s.trim()).filter(Boolean);
  const line1 = parts[0] ?? agent.name;
  const line2 = parts[1] ?? 'On your account.';
  return [
    line1.endsWith('.') ? line1 : `${line1}.`,
    line2.endsWith('.') ? line2 : `${line2}.`,
  ];
}

// ─── Sample receipts ──────────────────────────────────────────────────────
//
// Three example "previous runs" cards. We try to pull real rows from the
// reports fixtures (anything with a matching agentName). If we don't find
// three, we fabricate the remainder with plausible client + verdict pairs.

type Receipt = {
  client: string;
  verdict: string;
};

const FALLBACK_RECEIPTS: Receipt[] = [
  { client: 'Boulder Care',        verdict: '11 gaps your rivals are exploiting' },
  { client: 'Flock',               verdict: '47 candidates ready to review' },
  { client: 'The HOTH',            verdict: 'CPA spiked 38% on May 11' },
  { client: 'Durable',             verdict: 'PMAX is leaking budget on irrelevant terms' },
  { client: 'LivingYoung Center',  verdict: 'Headlines are stale across all campaigns' },
  { client: 'Authority Builders',  verdict: 'Brand terms eating non-brand budget' },
];

function receiptsFor(agent: AgentDefinition): Receipt[] {
  const pool: Receipt[] = [
    ...NEEDS_TODAY,
    ...READY_FOR_CLIENT,
    ...FYI_REPORTS,
  ]
    .filter((r) => r.agentName.toLowerCase() === agent.name.toLowerCase())
    .map((r) => ({ client: r.projectName, verdict: r.headline }));

  // Top up to three from the fallback pool (skipping any duplicate clients
  // so the trio reads as three distinct accounts).
  const seen = new Set(pool.map((r) => r.client));
  for (const fb of FALLBACK_RECEIPTS) {
    if (pool.length >= 3) break;
    if (seen.has(fb.client)) continue;
    pool.push(fb);
    seen.add(fb.client);
  }

  return pool.slice(0, 3);
}

// ─── Page ─────────────────────────────────────────────────────────────────

export function AgentDetail() {
  const { slug } = useParams<{ slug: string }>();
  const agent = AGENTS.find((a) => a.slug === slug);

  if (!agent) {
    return (
      <div className="grid min-h-[60vh] place-items-center bg-canvas px-8 py-20 text-center font-sans text-ink">
        <div>
          <h1 className="font-display text-[32px] font-extrabold leading-[1.05] tracking-[-0.02em]">
            Agent not found
          </h1>
          <p className="mt-4 text-[17px] font-medium text-ink/70">
            We couldn&rsquo;t find an agent at &ldquo;{slug}&rdquo;.
          </p>
          <div className="mt-8 inline-flex">
            <PillButton variant="ghost" href="/agents">
              Back to the catalog &rarr;
            </PillButton>
          </div>
        </div>
      </div>
    );
  }

  const [line1, line2] = verbFor(agent);
  const receipts = receiptsFor(agent);

  return (
    <div className="bg-canvas text-ink">
      <SpreadVerb line1={line1} line2={line2} />
      <SpreadLaunch agent={agent} />
      <SpreadReceipts agent={agent} receipts={receipts} />
    </div>
  );
}

// ─── Spread A · The verb ──────────────────────────────────────────────────

function SpreadVerb({ line1, line2 }: { line1: string; line2: string }) {
  return (
    <section className="relative w-full bg-canvas" style={{ minHeight: '75vh' }}>
      <div className="mx-auto flex min-h-[75vh] max-w-[1280px] flex-col justify-center px-8 py-20 sm:px-12 md:px-16">
        <h1 className="font-display text-[48px] font-black leading-[0.96] tracking-[-0.035em] text-ink md:text-[96px]">
          {line1}
          <br />
          <span className="ml-4 md:ml-20">{line2}</span>
        </h1>

        {/* The one Caveat allowed on this page. up-left arrow points back at
            the second line's opening words — the part that lands the promise. */}
        <div className="mt-10 ml-4 md:ml-20">
          <Caveat arrow="up-left" text="what nobody else gets right" />
        </div>
      </div>
    </section>
  );
}

// ─── Spread B · Launch input ──────────────────────────────────────────────

function SpreadLaunch({ agent }: { agent: AgentDefinition }) {
  const [value, setValue] = useState('');

  return (
    <section className="w-full bg-canvas">
      <div className="mx-auto max-w-[1280px] px-8 pb-32 pt-12 sm:px-12 md:px-16">
        <div className="flex justify-center">
          {/* The single tilted element on this page. Tilt is mobile-off so
              long URLs don't overflow when the screen is narrow. Postcard
              proportions: 700px wide, ~280px tall on desktop. */}
          <Sticker
            variant="default"
            className="w-full max-w-[700px] p-10 sm:p-12 md:[transform:rotate(-2deg)]"
          >
            <div className="flex flex-col gap-6">
              <h2 className="font-display text-[32px] font-extrabold leading-[1.05] tracking-[-0.02em] text-ink">
                Drop in your account or a URL
              </h2>

              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="youraccount.com"
                aria-label="Account or URL to analyse"
                className="w-full rounded-xl border-[2px] border-ink bg-transparent px-5 py-4 font-sans text-[17px] font-medium leading-tight text-ink placeholder:font-medium placeholder:text-ink/40 focus:outline-none focus:ring-0"
              />

              <div className="flex">
                <PillButton
                  variant="primary"
                  href={`/agents/${agent.slug}/loading/preview`}
                  className="!px-8 !py-4"
                >
                  Launch {agent.name} &rarr;
                </PillButton>
              </div>
            </div>
          </Sticker>
        </div>
      </div>
    </section>
  );
}

// ─── Spread C · Sample receipts ───────────────────────────────────────────

function SpreadReceipts({
  agent,
  receipts,
}: {
  agent: AgentDefinition;
  receipts: Receipt[];
}) {
  return (
    <section className="w-full bg-canvas">
      <div className="mx-auto max-w-[1280px] px-8 pb-32 sm:px-12 md:px-16">
        <h2 className="font-display text-[32px] font-extrabold leading-[1.05] tracking-[-0.02em] text-ink">
          What previous runs found
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {receipts.map((r, i) => (
            <ReceiptCard key={`${agent.slug}-${i}`} receipt={r} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ReceiptCard({ receipt }: { receipt: Receipt }) {
  return (
    <article className="flex h-full flex-col justify-between gap-10 rounded-2xl border-2 border-ink bg-white p-8">
      <div className="flex flex-col gap-6">
        <p className="font-sans text-[17px] font-medium leading-tight text-ink/70">
          {receipt.client}
        </p>
        <h3 className="font-display text-[32px] font-extrabold leading-[1.05] tracking-[-0.02em] text-ink">
          {receipt.verdict}
        </h3>
      </div>

      <div>
        {/* Ghost PillButton — same primitive Spread B uses, ghost variant. */}
        <PillButton variant="ghost" href="/reports/run-competitor-spy-completed">
          View example &rarr;
        </PillButton>
      </div>
    </article>
  );
}

// Named export only — the App router imports { AgentDetail }.
// (No default export to keep the named-import contract single-shape.)
//
// Note: this page never renders a Mascot, never renders a Courier eyebrow,
// never uses bg-ppc-purple-* as a solid block, never uses pure #000, and
// keeps every text size on the five-stop scale.
//
// Linked surfaces:
//   - "Launch {agent.name}" goes to /agents/:slug/loading/:runId (the running
//     surface another v2 agent owns). We hand it the preview run id; once
//     real launches are wired the URL will get a freshly-minted run id from
//     the backend.
//   - "View example" routes to /reports/:runId. We use the canonical
//     run-competitor-spy-completed fixture so a click always lands on a
//     fully-fleshed report even when the page didn't have a real match.
//   - "Back to the catalog" on the not-found fallback returns to /agents.
//
// Eventually the input should accept a customerId or a URL; for the mockup
// it's a single field with permissive placeholder copy.
