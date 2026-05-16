// v5 Report Opener — slim editorial strip above the tabs.
//
// Replaces the prior dark "InvestigationHero" slab. The payoff moment lives
// inside the verdict card (StrategyVerdictCard). This strip is grounding
// only: project identity and completion stamp. Receipts (tool calls / SERPs
// / phases) intentionally do NOT live here — they belong in the Deep Report
// tab where they have room to breathe, not in a corner whisper.
//
// All text on this strip is legible — minimum 15px. No 11px mono receipts
// that disappear into the canvas.

import { Check } from '@phosphor-icons/react';
import type { ReportOpenerData } from './data';

export function ReportOpener({ data }: { data: ReportOpenerData }) {
  return (
    <section className="mb-7">
      <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-5">
        {/* Identity — project avatar + agent / project */}
        <div className="flex items-center gap-[16px]">
          <span
            aria-hidden
            className="inline-flex h-[44px] w-[44px] items-center justify-center rounded-[12px] text-[17px] font-bold text-white"
            style={{
              background: data.projectAvatarBg,
              boxShadow:
                '0 1px 0 rgba(255,255,255,0.18) inset, 0 10px 22px -10px rgba(15,10,30,0.30)',
            }}
          >
            {data.projectAvatarLetter}
          </span>
          <div className="flex flex-col">
            <span
              className="font-display text-[26px] font-extrabold text-ppc-ink"
              style={{ letterSpacing: '-0.024em', lineHeight: 1.08 }}
            >
              {data.agentName}
            </span>
            <span
              className="mt-[3px] text-[15px]"
              style={{ color: '#6b6480', fontWeight: 500 }}
            >
              {data.projectName}
            </span>
          </div>
        </div>

        {/* Completion stamp + duration — both legible, both readable */}
        <div className="flex flex-wrap items-center gap-[16px]">
          <span
            className="inline-flex items-center gap-[10px] rounded-full px-[16px] py-[9px] text-[15px] font-semibold"
            style={{
              background: 'rgba(93,202,165,0.14)',
              color: '#1F6F4F',
              boxShadow: 'inset 0 0 0 1px rgba(93,202,165,0.34)',
              letterSpacing: '-0.005em',
            }}
          >
            <span
              aria-hidden
              className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full"
              style={{ background: '#5DCAA5' }}
            >
              <Check size={11} weight="bold" style={{ color: '#FFFFFF' }} />
            </span>
            Completed
          </span>

          <span
            className="text-[17px]"
            style={{ color: '#3c3849', letterSpacing: '-0.008em' }}
          >
            <span
              className="font-display tabular-nums font-bold text-ppc-ink"
              style={{ letterSpacing: '-0.012em' }}
            >
              {data.duration}
            </span>
            <span style={{ margin: '0 10px', color: '#c9c2dd' }}>·</span>
            <span style={{ fontWeight: 500 }}>{data.window}</span>
          </span>
        </div>
      </div>

      {/* Hairline below — fades at the edges so it reads quiet, not boxy */}
      <div
        className="mt-7"
        style={{
          height: '1px',
          background:
            'linear-gradient(90deg, rgba(217,212,236,0) 0%, #d9d4ec 14%, #d9d4ec 86%, rgba(217,212,236,0) 100%)',
        }}
      />
    </section>
  );
}
