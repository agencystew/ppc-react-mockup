// V1 Magazine, finding spread (two-column reading composition).
//
// LEFT column (45ch reading column): impact tag, title, body prose (<= ~70 words),
// resource chips derived from unique(displayName) over [primary, ...supporting].
//
// RIGHT column (receipts): the permanent GAQL block (or scrape/serp/domain
// equivalent), the primary evidence table, and the judgment quote rule.
// No "Show evidence" button. Receipts are always visible.

import type { Finding, ToolInvocation } from '../../../mock/competitor-spy-evidence';
import type { RegisterStyle } from './Magazine-types';
import {
  deriveResourceChips,
  getPrimaryReceipt,
  getPrimaryTable,
} from './Magazine-types';

interface Props {
  finding: Finding;
  register: RegisterStyle;
  invocations: ToolInvocation[];
  findingIndex: number;
  totalInChapter: number;
}

export function MagazineFindingSpread({
  finding,
  register,
  invocations,
  findingIndex,
  totalInChapter,
}: Props) {
  const chips = deriveResourceChips(finding, invocations);
  const receipt = getPrimaryReceipt(finding, invocations);
  const table = getPrimaryTable(finding, invocations);
  const supportingCount = finding.supportingEvidenceRefs.length;
  const findingLabel = `Finding ${findingIndex + 1} of ${totalInChapter}`;

  return (
    <article
      className="relative mx-auto w-full max-w-[1200px] px-6 py-14 md:px-10 lg:px-16"
      style={{
        borderTop: `1px solid ${register.ruleColor}`,
      }}
    >
      <div className="grid grid-cols-1 gap-x-14 gap-y-10 md:grid-cols-12">
        {/* LEFT column: reading column. Strict 45ch. */}
        <div className="md:col-span-6">
          <div
            className="flex flex-wrap items-baseline gap-x-5 gap-y-1"
            style={{
              fontFamily: '"Courier New", monospace',
              fontSize: 11,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: register.eyebrow,
            }}
          >
            <span>{findingLabel}</span>
            <ImpactBadge impact={finding.impact} register={register} />
          </div>

          {finding.metric && (
            <div className="mt-7 flex items-baseline gap-3">
              <span
                style={{
                  fontFamily: 'Figtree, sans-serif',
                  fontWeight: 900,
                  fontSize: 'clamp(56px, 7vw, 88px)',
                  letterSpacing: '-0.035em',
                  lineHeight: 0.9,
                  color: register.metricColor,
                }}
              >
                {finding.metric.value}
              </span>
              <span style={{ color: '#7F5AF0', fontSize: 'clamp(56px, 7vw, 88px)', fontWeight: 900, lineHeight: 0.9 }}>
                .
              </span>
            </div>
          )}
          {finding.metric && (
            <div
              className="mt-3"
              style={{
                fontFamily: '"Courier New", monospace',
                fontSize: 11,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: register.inkSoft,
              }}
            >
              {finding.metric.label}
            </div>
          )}

          <h3
            className="mt-9 max-w-[22ch]"
            style={{
              fontFamily: 'Figtree, sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(28px, 3vw, 38px)',
              letterSpacing: '-0.024em',
              lineHeight: 1.05,
              color: register.ink,
            }}
          >
            {finding.title}
          </h3>

          <p
            className="mt-6"
            style={{
              fontFamily: 'Figtree, sans-serif',
              fontWeight: 500,
              fontSize: 16,
              lineHeight: 1.6,
              color: register.inkSoft,
              maxWidth: '45ch',
            }}
          >
            {finding.body}
          </p>

          {chips.length > 0 && (
            <div className="mt-7 flex flex-wrap gap-2">
              <span
                style={{
                  fontFamily: '"Courier New", monospace',
                  fontSize: 10,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: register.inkFaint,
                  alignSelf: 'center',
                  marginRight: 6,
                }}
              >
                Resources queried
              </span>
              {chips.map((chip) => (
                <span
                  key={chip}
                  style={{
                    fontFamily: '"Courier New", monospace',
                    fontSize: 11,
                    letterSpacing: '0.06em',
                    background: register.chipBg,
                    color: register.chipInk,
                    border: `1px solid ${register.chipBorder}`,
                    borderRadius: 999,
                    padding: '4px 10px',
                  }}
                >
                  {chip}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT column: receipts. GAQL block + primary table + judgment quote. */}
        <div className="md:col-span-6">
          <div
            style={{
              background: register.receiptBg,
              border: `1px solid ${register.receiptRule}`,
              borderRadius: 14,
              overflow: 'hidden',
            }}
          >
            {/* Receipt header. Identifies the primary evidence + supporting count. */}
            <div
              className="flex items-baseline justify-between gap-3 px-5 py-4"
              style={{ borderBottom: `1px solid ${register.receiptRule}` }}
            >
              <div className="min-w-0">
                <div
                  style={{
                    fontFamily: '"Courier New", monospace',
                    fontSize: 10,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: register.receiptCaption,
                  }}
                >
                  Primary evidence · {receipt.kind.toUpperCase()}
                </div>
                <div
                  className="mt-1 truncate"
                  style={{
                    fontFamily: '"Courier New", monospace',
                    fontSize: 13,
                    letterSpacing: '0.02em',
                    color: register.receiptInk,
                  }}
                >
                  {receipt.resource}
                </div>
              </div>
              {supportingCount > 0 && (
                <div
                  style={{
                    fontFamily: '"Courier New", monospace',
                    fontSize: 10,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: register.receiptCaption,
                    textAlign: 'right',
                    flexShrink: 0,
                  }}
                >
                  + {supportingCount} supporting
                </div>
              )}
            </div>

            {/* GAQL / scrape / serp / domain body, permanently visible. */}
            <pre
              className="m-0 overflow-x-auto px-5 py-5"
              style={{
                fontFamily: '"Courier New", monospace',
                fontSize: 12.5,
                lineHeight: 1.5,
                letterSpacing: '0.012em',
                color: register.receiptInk,
                whiteSpace: 'pre',
                background: 'transparent',
                borderBottom: table ? `1px solid ${register.receiptRule}` : 'none',
              }}
            >
              {receipt.body}
            </pre>

            {/* Primary evidence table (always visible). */}
            {table && (
              <div className="px-5 py-5">
                <div
                  style={{
                    fontFamily: '"Courier New", monospace',
                    fontSize: 10,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: register.receiptCaption,
                    marginBottom: 10,
                  }}
                >
                  {table.caption}
                </div>
                <div className="overflow-x-auto">
                  <table
                    className="w-full"
                    style={{
                      borderCollapse: 'collapse',
                      fontFamily: 'Figtree, sans-serif',
                      fontSize: 13,
                      color: register.receiptInk,
                    }}
                  >
                    <thead>
                      <tr>
                        {table.columns.map((col, idx) => (
                          <th
                            key={col}
                            style={{
                              fontFamily: '"Courier New", monospace',
                              fontSize: 10,
                              letterSpacing: '0.14em',
                              textTransform: 'uppercase',
                              color: register.receiptCaption,
                              textAlign: idx === 0 ? 'left' : 'right',
                              padding: '8px 10px 8px 0',
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
                      {table.rows.map((row, ri) => (
                        <tr key={ri}>
                          {row.map((cell, ci) => (
                            <td
                              key={ci}
                              style={{
                                padding: '10px 10px 10px 0',
                                borderBottom:
                                  ri === table.rows.length - 1
                                    ? 'none'
                                    : `1px solid ${register.receiptRule}`,
                                fontFamily:
                                  ci === 0
                                    ? 'Figtree, sans-serif'
                                    : '"Courier New", monospace',
                                fontWeight: ci === 0 ? 600 : 400,
                                textAlign: ci === 0 ? 'left' : 'right',
                                color: register.receiptInk,
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
                </div>
              </div>
            )}
          </div>

          {/* Judgment pulled out of the body, anchored to a purple rule. */}
          <blockquote
            className="mt-7 pl-5"
            style={{
              borderLeft: `2px solid ${register.judgmentRule}`,
            }}
          >
            <div
              style={{
                fontFamily: '"Courier New", monospace',
                fontSize: 10,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: register.inkFaint,
                marginBottom: 8,
              }}
            >
              Operator judgment
            </div>
            <p
              style={{
                fontFamily: 'Figtree, sans-serif',
                fontWeight: 500,
                fontSize: 16,
                lineHeight: 1.55,
                color: register.ink,
                letterSpacing: '-0.005em',
              }}
            >
              {finding.judgment}
            </p>
          </blockquote>
        </div>
      </div>
    </article>
  );
}

function ImpactBadge({
  impact,
  register,
}: {
  impact: 'high' | 'medium' | 'low';
  register: RegisterStyle;
}) {
  const label = impact === 'high' ? 'High impact' : impact === 'medium' ? 'Medium impact' : 'Low impact';
  // Use a tiny tinted dot. Whisper. Don't shout.
  const dot = impact === 'high' ? '#E24B4A' : impact === 'medium' ? '#BA7517' : '#5DCAA5';
  return (
    <span
      className="inline-flex items-center gap-2"
      style={{
        fontFamily: '"Courier New", monospace',
        fontSize: 11,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: register.ink,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: dot,
          display: 'inline-block',
        }}
      />
      {label}
    </span>
  );
}
