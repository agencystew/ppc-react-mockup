// v5 Report Opener — slim editorial strip above the tabs.
//
// Replaces the prior dark "InvestigationHero" slab. The payoff moment now
// lives inside the verdict card (StrategyVerdictCard, dark refined surface),
// not in the page chrome. This component is grounding only: project identity,
// completion stamp, and a quiet receipts caption.
//
// Lives ABOVE the tabs and is shared by AI Summary + Deep Report.

import { Check } from '@phosphor-icons/react';
import type { ReportOpenerData } from './data';

export function ReportOpener({ data }: { data: ReportOpenerData }) {
  return (
    <section className="mb-7">
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
        {/* Identity — project avatar + agent / project */}
        <div className="flex items-center gap-[14px]">
          <span
            aria-hidden
            className="inline-flex h-[40px] w-[40px] items-center justify-center rounded-[11px] text-[15px] font-bold text-white"
            style={{
              background: data.projectAvatarBg,
              boxShadow:
                '0 1px 0 rgba(255,255,255,0.18) inset, 0 8px 18px -10px rgba(15,10,30,0.30)',
            }}
          >
            {data.projectAvatarLetter}
          </span>
          <div className="flex flex-col">
            <span
              className="font-display text-[22px] font-extrabold text-ppc-ink"
              style={{ letterSpacing: '-0.022em', lineHeight: 1.1 }}
            >
              {data.agentName}
            </span>
            <span
              className="mt-[2px] text-[13.5px]"
              style={{ color: '#85819a', fontWeight: 500 }}
            >
              {data.projectName}
            </span>
          </div>
        </div>

        {/* Completion stamp + receipts whisper */}
        <div className="flex flex-col items-end gap-[8px]">
          <div className="flex flex-wrap items-center justify-end gap-[14px]">
            <span
              className="inline-flex items-center gap-[8px] rounded-full px-[13px] py-[6px] text-[12.5px] font-semibold"
              style={{
                background: 'rgba(93,202,165,0.12)',
                color: '#1F6F4F',
                boxShadow: 'inset 0 0 0 1px rgba(93,202,165,0.30)',
                letterSpacing: '0.02em',
              }}
            >
              <span
                aria-hidden
                className="inline-flex h-[14px] w-[14px] items-center justify-center rounded-full"
                style={{ background: '#5DCAA5' }}
              >
                <Check size={8} weight="bold" style={{ color: '#FFFFFF' }} />
              </span>
              Completed
            </span>

            <span
              className="text-[13px]"
              style={{
                fontFamily: '"Courier New", ui-monospace, monospace',
                color: '#85819a',
                letterSpacing: '0.02em',
              }}
            >
              <span
                className="tabular-nums"
                style={{ color: '#1a1625', fontWeight: 700 }}
              >
                {data.duration}
              </span>
              <span style={{ margin: '0 8px', color: '#c9c2dd' }}>·</span>
              {data.window}
            </span>
          </div>

          <span
            className="text-[11.5px]"
            style={{
              fontFamily: '"Courier New", ui-monospace, monospace',
              color: '#a09bb5',
              letterSpacing: '0.04em',
            }}
          >
            {data.receipts}
          </span>
        </div>
      </div>

      {/* Hairline under the strip — fades at the edges so it reads quiet */}
      <div
        className="mt-7"
        style={{
          height: '1px',
          background:
            'linear-gradient(90deg, rgba(217,212,236,0) 0%, #d9d4ec 12%, #d9d4ec 88%, rgba(217,212,236,0) 100%)',
        }}
      />
    </section>
  );
}
