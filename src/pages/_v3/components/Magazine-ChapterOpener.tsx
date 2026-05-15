// V1 Magazine, chapter opener (the "title page" of each section).
//
// Anatomy:
//   eyebrow (mono caps)
//   chapter number (mono caps, large)
//   section name (Figtree 900, 64–80px)
//   one huge headline metric (Figtree 900, 120–160px) with mono unit underneath
//   structured chips: window + tool calls count (always equal to invocations.length)

import type { Section } from '../../../mock/competitor-spy-evidence';
import type { RegisterStyle } from './Magazine-types';

interface Props {
  section: Section;
  register: RegisterStyle;
  chapterNumber: string;
  agentName: string;
  accountName: string;
}

export function MagazineChapterOpener({
  section,
  register,
  chapterNumber,
  agentName,
  accountName,
}: Props) {
  // Tool calls count is computed, never hardcoded. This is the contract.
  const computedToolCalls = section.invocations.length;
  const evidenceCalls = section.invocations.filter((i) => i.isEvidence).length;
  const schemaLookups = computedToolCalls - evidenceCalls;

  return (
    <div className="relative mx-auto w-full max-w-[1200px] px-6 pt-24 pb-16 md:px-10 lg:px-16">
      {/* Eyebrow rail */}
      <div
        className="flex flex-wrap items-baseline gap-x-6 gap-y-1"
        style={{
          fontFamily: '"Courier New", monospace',
          fontSize: 11,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: register.eyebrow,
        }}
      >
        <span>Chapter {chapterNumber}</span>
        <span style={{ color: register.inkFaint }}>{section.meta.window}</span>
        <span style={{ color: register.inkFaint }}>
          {computedToolCalls} tool invocations on the record
        </span>
      </div>

      {/* Section name as the chapter title. Figtree 900. */}
      <h2
        className="mt-5 max-w-[14ch]"
        style={{
          fontFamily: 'Figtree, sans-serif',
          fontWeight: 900,
          fontSize: 'clamp(48px, 6.4vw, 76px)',
          letterSpacing: '-0.03em',
          lineHeight: 0.94,
          color: register.ink,
        }}
      >
        {section.name}
        <span style={{ color: '#7F5AF0' }}>.</span>
      </h2>

      {/* Two-column hero: metric (left, dominant) + structured meta (right, restrained). */}
      <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-8">
          <div
            style={{
              fontFamily: '"Courier New", monospace',
              fontSize: 11,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: register.eyebrow,
              marginBottom: 14,
            }}
          >
            Headline finding
          </div>
          <div
            className="flex items-end gap-6"
            style={{
              fontFamily: 'Figtree, sans-serif',
              fontWeight: 900,
              letterSpacing: '-0.04em',
              lineHeight: 0.9,
              color: register.metricColor,
            }}
          >
            <span style={{ fontSize: 'clamp(96px, 14vw, 152px)' }}>
              {section.meta.headlineMetric.value}
            </span>
            <span style={{ color: '#7F5AF0', fontSize: 'clamp(96px, 14vw, 152px)' }}>.</span>
          </div>
          <div
            style={{
              fontFamily: '"Courier New", monospace',
              fontSize: 12,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: register.inkSoft,
              marginTop: 18,
              maxWidth: '48ch',
            }}
          >
            {section.meta.headlineMetric.label}
          </div>
        </div>

        {/* Right rail: structured chips. No flat concatenated meta string. */}
        <div className="md:col-span-4">
          <div
            className="grid gap-3"
            style={{
              borderTop: `1px solid ${register.ruleColor}`,
              paddingTop: 24,
            }}
          >
            <MagazineMetaChip
              label="Agent"
              value={agentName}
              register={register}
            />
            <MagazineMetaChip
              label="Account"
              value={accountName}
              register={register}
            />
            <MagazineMetaChip
              label="Window"
              value={section.meta.window}
              register={register}
            />
            <MagazineMetaChip
              label="Tool calls"
              value={`${computedToolCalls} on record`}
              register={register}
            />
            <MagazineMetaChip
              label="Composition"
              value={`${evidenceCalls} evidence, ${schemaLookups} schema`}
              register={register}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function MagazineMetaChip({
  label,
  value,
  register,
}: {
  label: string;
  value: string;
  register: RegisterStyle;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span
        style={{
          fontFamily: '"Courier New", monospace',
          fontSize: 10,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: register.inkFaint,
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: 'Figtree, sans-serif',
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: '-0.005em',
          color: register.ink,
          textAlign: 'right',
        }}
      >
        {value}
      </span>
    </div>
  );
}
