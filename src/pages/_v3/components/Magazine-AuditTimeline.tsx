// V1 Magazine, audit timeline footer. Horizontal time-rail.
//
// schema-explore (isEvidence: false) → small grey dots
// query / scrape / serp / domain (isEvidence: true) → larger purple dots
//
// Clicking a dot reveals the invocation inline above the rail (args + result
// columns + narrative + latency). No drawer, no modal, no expand toggle on the
// finding evidence itself. The audit trail is the chapter's footer.

import { useState } from 'react';
import type { Section } from '../../../mock/competitor-spy-evidence';
import type { RegisterStyle } from './Magazine-types';
import { durationLabel, timestamp } from './Magazine-types';

interface Props {
  section: Section;
  register: RegisterStyle;
  chapterNumber: string;
}

export function MagazineAuditTimeline({ section, register, chapterNumber }: Props) {
  // The contract: this number is computed from invocations.length, never literal.
  const computedToolCalls = section.invocations.length;
  const evidenceCalls = section.invocations.filter((i) => i.isEvidence).length;
  const schemaLookups = computedToolCalls - evidenceCalls;
  const totalMs = section.invocations.reduce((acc, i) => acc + i.latencyMs, 0);

  // Default: first evidence node, fallback to first invocation overall.
  const firstEvidence = section.invocations.find((i) => i.isEvidence);
  const [selectedId, setSelectedId] = useState<string>(
    firstEvidence?.id ?? section.invocations[0]?.id ?? '',
  );
  const selected = section.invocations.find((i) => i.id === selectedId);

  return (
    <section
      id={`timeline-${section.id}`}
      className="relative mx-auto w-full max-w-[1200px] px-6 pt-10 pb-20 md:px-10 lg:px-16"
      style={{
        borderTop: `1px solid ${register.ruleColor}`,
      }}
    >
      <header
        className="mb-7 flex flex-wrap items-baseline justify-between gap-y-3"
        style={{
          fontFamily: '"Courier New", monospace',
          fontSize: 11,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
        }}
      >
        <div style={{ color: register.eyebrow }}>
          Chapter {chapterNumber} · audit trail
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-1" style={{ color: register.inkFaint }}>
          <span>{computedToolCalls} invocations</span>
          <span>{evidenceCalls} evidence</span>
          <span>{schemaLookups} schema lookups</span>
          <span>{durationLabel(totalMs)} elapsed</span>
        </div>
      </header>

      {/* Active invocation card (expanded inline above the rail). */}
      {selected && (
        <div
          className="mb-10 grid gap-6 p-5 md:grid-cols-12"
          style={{
            background: register.timelineActiveCardBg,
            border: `1px solid ${register.receiptRule}`,
            borderRadius: 14,
          }}
        >
          <div className="md:col-span-4">
            <div
              style={{
                fontFamily: '"Courier New", monospace',
                fontSize: 10,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: register.timelineActiveCardCaption,
              }}
            >
              {timestamp(selected.startedAt)} · {selected.toolName}
            </div>
            <div
              className="mt-1"
              style={{
                fontFamily: '"Courier New", monospace',
                fontSize: 13,
                letterSpacing: '0.02em',
                color: register.timelineActiveCardInk,
              }}
            >
              {selected.displayName}
            </div>
            <div
              className="mt-3 inline-flex items-center gap-2"
              style={{
                fontFamily: '"Courier New", monospace',
                fontSize: 10,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: selected.isEvidence ? '#7F5AF0' : register.timelineDotIdle,
                  display: 'inline-block',
                }}
                aria-hidden
              />
              <span style={{ color: selected.isEvidence ? register.eyebrow : register.inkFaint }}>
                {selected.isEvidence ? 'Evidence' : 'Schema lookup'}
              </span>
              <span style={{ color: register.inkFaint }}>· {selected.latencyMs}ms</span>
            </div>
            <p
              className="mt-4"
              style={{
                fontFamily: 'Figtree, sans-serif',
                fontWeight: 500,
                fontSize: 14,
                lineHeight: 1.55,
                color: register.timelineActiveCardInk,
                opacity: 0.85,
              }}
            >
              {selected.narrative}
            </p>
          </div>
          <div className="md:col-span-8">
            {selected.args.gaql ? (
              <pre
                className="m-0 overflow-x-auto"
                style={{
                  fontFamily: '"Courier New", monospace',
                  fontSize: 12.5,
                  lineHeight: 1.5,
                  letterSpacing: '0.012em',
                  color: register.timelineActiveCardInk,
                  whiteSpace: 'pre',
                  background: 'transparent',
                  margin: 0,
                }}
              >
                {selected.args.gaql}
              </pre>
            ) : selected.result.schemaMarkdown ? (
              <pre
                className="m-0 overflow-x-auto"
                style={{
                  fontFamily: '"Courier New", monospace',
                  fontSize: 12.5,
                  lineHeight: 1.6,
                  letterSpacing: '0.012em',
                  color: register.timelineActiveCardInk,
                  whiteSpace: 'pre-wrap',
                  background: 'transparent',
                  margin: 0,
                }}
              >
                {selected.result.schemaMarkdown}
              </pre>
            ) : (
              <pre
                className="m-0 overflow-x-auto"
                style={{
                  fontFamily: '"Courier New", monospace',
                  fontSize: 12.5,
                  lineHeight: 1.6,
                  letterSpacing: '0.012em',
                  color: register.timelineActiveCardInk,
                  whiteSpace: 'pre-wrap',
                  background: 'transparent',
                  margin: 0,
                }}
              >
                {JSON.stringify(selected.args, null, 2)}
              </pre>
            )}

            {selected.result.columns && selected.result.rows && (
              <div className="mt-5 overflow-x-auto">
                <table
                  className="w-full"
                  style={{
                    borderCollapse: 'collapse',
                    fontFamily: 'Figtree, sans-serif',
                    fontSize: 12.5,
                    color: register.timelineActiveCardInk,
                  }}
                >
                  <thead>
                    <tr>
                      {selected.result.columns.map((col, idx) => (
                        <th
                          key={col}
                          style={{
                            fontFamily: '"Courier New", monospace',
                            fontSize: 10,
                            letterSpacing: '0.14em',
                            textTransform: 'uppercase',
                            color: register.timelineActiveCardCaption,
                            textAlign: idx === 0 ? 'left' : 'right',
                            padding: '6px 10px 6px 0',
                            borderBottom: `1px solid ${register.receiptRule}`,
                            fontWeight: 500,
                          }}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selected.result.rows.slice(0, 5).map((row, ri) => (
                      <tr key={ri}>
                        {row.map((cell, ci) => (
                          <td
                            key={ci}
                            style={{
                              padding: '7px 10px 7px 0',
                              fontFamily:
                                ci === 0
                                  ? 'Figtree, sans-serif'
                                  : '"Courier New", monospace',
                              fontWeight: ci === 0 ? 600 : 400,
                              textAlign: ci === 0 ? 'left' : 'right',
                              color: register.timelineActiveCardInk,
                              fontVariantNumeric: 'tabular-nums',
                            }}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {selected.result.totalRows && selected.result.totalRows > 5 && (
                  <div
                    className="mt-3"
                    style={{
                      fontFamily: '"Courier New", monospace',
                      fontSize: 10,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: register.timelineActiveCardCaption,
                    }}
                  >
                    Showing 5 of {selected.result.totalRows} rows
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* The horizontal rail. */}
      <div className="relative overflow-x-auto pb-3">
        <div
          className="relative flex items-end"
          style={{
            minWidth: Math.max(640, section.invocations.length * 64),
            gap: 0,
          }}
        >
          {/* Track */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              left: 14,
              right: 14,
              bottom: 22,
              height: 2,
              background: register.timelineConnector,
            }}
          />
          {section.invocations.map((inv, idx) => {
            const isSelected = inv.id === selectedId;
            const dotSize = inv.isEvidence ? 16 : 8;
            return (
              <button
                key={inv.id}
                type="button"
                onClick={() => setSelectedId(inv.id)}
                className="group relative flex flex-1 flex-col items-center"
                style={{
                  minWidth: 56,
                  paddingBottom: 4,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  outline: 'none',
                }}
                aria-pressed={isSelected}
                aria-label={`${inv.isEvidence ? 'Evidence' : 'Schema lookup'}: ${inv.displayName} at ${timestamp(inv.startedAt)}`}
              >
                {/* Step number, mono */}
                <span
                  style={{
                    fontFamily: '"Courier New", monospace',
                    fontSize: 10,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: isSelected ? register.eyebrow : register.inkFaint,
                    marginBottom: 6,
                  }}
                >
                  {String(idx + 1).padStart(2, '0')}
                </span>
                {/* Optional resource caption (only on evidence nodes when space allows) */}
                {inv.isEvidence && (
                  <span
                    className="hidden md:inline"
                    style={{
                      fontFamily: '"Courier New", monospace',
                      fontSize: 9,
                      letterSpacing: '0.10em',
                      textTransform: 'uppercase',
                      color: isSelected ? register.ink : register.inkFaint,
                      maxWidth: 88,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      marginBottom: 6,
                    }}
                  >
                    {inv.displayName.replace(/^google_ads\./, '')}
                  </span>
                )}
                {/* The dot */}
                <span
                  aria-hidden
                  style={{
                    width: dotSize,
                    height: dotSize,
                    borderRadius: '50%',
                    background: inv.isEvidence
                      ? register.timelineDotEvidence
                      : register.timelineDotIdle,
                    boxShadow: isSelected
                      ? `0 0 0 4px ${register.timelineTrackBg}, 0 0 0 5px ${inv.isEvidence ? register.timelineDotEvidence : register.timelineDotIdle}`
                      : 'none',
                    transition: 'box-shadow 120ms ease',
                    position: 'relative',
                    zIndex: 2,
                  }}
                />
                {/* Timestamp */}
                <span
                  style={{
                    fontFamily: '"Courier New", monospace',
                    fontSize: 10,
                    letterSpacing: '0.06em',
                    color: isSelected ? register.eyebrow : register.inkFaint,
                    marginTop: 8,
                  }}
                >
                  {timestamp(inv.startedAt).slice(3)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div
        className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2"
        style={{
          fontFamily: '"Courier New", monospace',
          fontSize: 10,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: register.inkFaint,
        }}
      >
        <span className="inline-flex items-center gap-2">
          <span
            aria-hidden
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: register.timelineDotEvidence,
              display: 'inline-block',
            }}
          />
          Evidence query
        </span>
        <span className="inline-flex items-center gap-2">
          <span
            aria-hidden
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: register.timelineDotIdle,
              display: 'inline-block',
            }}
          />
          Schema lookup
        </span>
        <span>Tap a step to inspect the invocation</span>
      </div>
    </section>
  );
}
