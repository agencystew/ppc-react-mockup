// Shared types + utilities for the V1 Magazine variant.
//
// All visual logic lives in the .tsx files; this module just centralizes the
// register palette and derived helpers so each chapter component reads cleanly.

import type { Finding, Section, ToolInvocation } from '../../../mock/competitor-spy-evidence';

export type Register = 'dark' | 'lavender' | 'ivory' | 'dark2';

export interface RegisterStyle {
  pageBg: string;
  ink: string;
  inkSoft: string;
  inkFaint: string;
  ruleColor: string;
  metricColor: string;
  chipBg: string;
  chipInk: string;
  chipBorder: string;
  receiptBg: string;
  receiptInk: string;
  receiptRule: string;
  receiptCaption: string;
  judgmentRule: string;
  timelineDotIdle: string;
  timelineDotEvidence: string;
  timelineConnector: string;
  timelineTrackBg: string;
  timelineActiveCardBg: string;
  timelineActiveCardInk: string;
  timelineActiveCardCaption: string;
  eyebrow: string;
}

// The four registers. Discovery and Creative ride the dark radial. Auction
// sits on the lavender canvas (light-on-light). Position takes the ivory
// accent moment. The page reads like a magazine pacing dark-light-warm-dark.
export const REGISTERS: Record<Register, RegisterStyle> = {
  // Surface dark with the canonical radial. Ink is near-white on this.
  dark: {
    pageBg: 'radial-gradient(120% 90% at 88% -10%, #1B0F39 0%, #0A0814 55%, #050310 100%)',
    ink: '#F5F1FF',
    inkSoft: '#B8AEDA',
    inkFaint: '#6E6390',
    ruleColor: 'rgba(184, 174, 218, 0.18)',
    metricColor: '#FFFFFF',
    chipBg: 'rgba(127, 90, 240, 0.14)',
    chipInk: '#D6C9FF',
    chipBorder: 'rgba(127, 90, 240, 0.40)',
    receiptBg: '#0A0612',
    receiptInk: '#E9E3FF',
    receiptRule: 'rgba(127, 90, 240, 0.22)',
    receiptCaption: '#9C8FC4',
    judgmentRule: '#7F5AF0',
    timelineDotIdle: 'rgba(184, 174, 218, 0.30)',
    timelineDotEvidence: '#7F5AF0',
    timelineConnector: 'rgba(184, 174, 218, 0.18)',
    timelineTrackBg: 'rgba(127, 90, 240, 0.06)',
    timelineActiveCardBg: '#15102A',
    timelineActiveCardInk: '#F5F1FF',
    timelineActiveCardCaption: '#9C8FC4',
    eyebrow: '#A88CFF',
  },
  // Light-on-light lavender canvas. Whisper purple as accent.
  lavender: {
    pageBg: '#ECEAFA',
    ink: '#1a1625',
    inkSoft: '#6b6480',
    inkFaint: '#b0a9c2',
    ruleColor: '#d9d4ec',
    metricColor: '#1a1625',
    chipBg: '#EEEDFE',
    chipInk: '#3C3489',
    chipBorder: '#d9d4ec',
    receiptBg: '#FFFFFF',
    receiptInk: '#1a1625',
    receiptRule: '#d9d4ec',
    receiptCaption: '#6b6480',
    judgmentRule: '#7F5AF0',
    timelineDotIdle: '#b0a9c2',
    timelineDotEvidence: '#7F5AF0',
    timelineConnector: '#d9d4ec',
    timelineTrackBg: '#EEEDFE',
    timelineActiveCardBg: '#FFFFFF',
    timelineActiveCardInk: '#1a1625',
    timelineActiveCardCaption: '#6b6480',
    eyebrow: '#534AB7',
  },
  // Warm ivory accent moment. The chapter that breaks the cool cadence.
  ivory: {
    pageBg: '#FAF7F0',
    ink: '#1a1625',
    inkSoft: '#6b6480',
    inkFaint: '#b0a9c2',
    ruleColor: '#E8E1D0',
    metricColor: '#1a1625',
    chipBg: '#F2EBDB',
    chipInk: '#3C3489',
    chipBorder: '#E8E1D0',
    receiptBg: '#FFFFFF',
    receiptInk: '#1a1625',
    receiptRule: '#E8E1D0',
    receiptCaption: '#6b6480',
    judgmentRule: '#7F5AF0',
    timelineDotIdle: '#C7BFA7',
    timelineDotEvidence: '#7F5AF0',
    timelineConnector: '#E8E1D0',
    timelineTrackBg: '#F2EBDB',
    timelineActiveCardBg: '#FFFFFF',
    timelineActiveCardInk: '#1a1625',
    timelineActiveCardCaption: '#6b6480',
    eyebrow: '#534AB7',
  },
  // Same anatomy as dark, slightly different bloom angle to mark closing chapter.
  dark2: {
    pageBg: 'radial-gradient(110% 80% at 18% -10%, #1B0F39 0%, #0A0814 60%, #050310 100%)',
    ink: '#F5F1FF',
    inkSoft: '#B8AEDA',
    inkFaint: '#6E6390',
    ruleColor: 'rgba(184, 174, 218, 0.18)',
    metricColor: '#FFFFFF',
    chipBg: 'rgba(127, 90, 240, 0.14)',
    chipInk: '#D6C9FF',
    chipBorder: 'rgba(127, 90, 240, 0.40)',
    receiptBg: '#0A0612',
    receiptInk: '#E9E3FF',
    receiptRule: 'rgba(127, 90, 240, 0.22)',
    receiptCaption: '#9C8FC4',
    judgmentRule: '#7F5AF0',
    timelineDotIdle: 'rgba(184, 174, 218, 0.30)',
    timelineDotEvidence: '#7F5AF0',
    timelineConnector: 'rgba(184, 174, 218, 0.18)',
    timelineTrackBg: 'rgba(127, 90, 240, 0.06)',
    timelineActiveCardBg: '#15102A',
    timelineActiveCardInk: '#F5F1FF',
    timelineActiveCardCaption: '#9C8FC4',
    eyebrow: '#A88CFF',
  },
};

// Resource chips for a finding are derived from the unique displayName values
// across [primaryEvidenceRef, ...supportingEvidenceRefs]. Schema-explore
// invocations are never folded into a finding's chip list.
export function deriveResourceChips(
  finding: Finding,
  invocations: ToolInvocation[],
): string[] {
  const refIds = [finding.primaryEvidenceRef, ...finding.supportingEvidenceRefs];
  const byId = new Map(invocations.map((inv) => [inv.id, inv]));
  const names: string[] = [];
  for (const id of refIds) {
    const inv = byId.get(id);
    if (!inv) continue;
    if (!inv.isEvidence) continue;
    if (!names.includes(inv.displayName)) names.push(inv.displayName);
  }
  return names;
}

// Pull the GAQL string for the primary evidence ref. If the primary isn't a
// GAQL query (e.g. domain lookup, scrape) we fall back to a structured
// argument summary so the receipt is still permanently visible.
export function getPrimaryReceipt(
  finding: Finding,
  invocations: ToolInvocation[],
): { kind: 'gaql' | 'scrape' | 'serp' | 'domain'; body: string; resource: string } {
  const inv = invocations.find((i) => i.id === finding.primaryEvidenceRef);
  if (!inv) return { kind: 'gaql', body: '', resource: '' };
  if (inv.args.gaql) {
    return { kind: 'gaql', body: inv.args.gaql, resource: inv.displayName };
  }
  if (inv.toolName === 'web.scrape' && inv.args.url) {
    return { kind: 'scrape', body: `GET ${inv.args.url}`, resource: inv.displayName };
  }
  if (inv.toolName === 'serp_api.search' && inv.args.query) {
    return { kind: 'serp', body: `query: ${inv.args.query}`, resource: inv.displayName };
  }
  if (inv.toolName === 'domain.lookup' && inv.args.url) {
    return { kind: 'domain', body: `lookup: ${inv.args.url}`, resource: inv.displayName };
  }
  return { kind: 'gaql', body: '', resource: inv.displayName };
}

// Get the primary evidence table for rendering alongside the finding body.
// Falls back to the agent-derived evidenceSummary when the primary evidence
// is not tabular (scrapes return a sample object, not columns/rows).
export function getPrimaryTable(
  finding: Finding,
  invocations: ToolInvocation[],
): { columns: string[]; rows: string[][]; caption: string } | null {
  if (finding.evidenceSummary) {
    return {
      columns: finding.evidenceSummary.columns,
      rows: finding.evidenceSummary.rows,
      caption: finding.evidenceSummary.note,
    };
  }
  const inv = invocations.find((i) => i.id === finding.primaryEvidenceRef);
  if (!inv) return null;
  if (inv.result.columns && inv.result.rows) {
    return {
      columns: inv.result.columns,
      rows: inv.result.rows.slice(0, 5),
      caption: `Primary evidence: ${inv.displayName}${
        inv.result.totalRows && inv.result.totalRows > 5
          ? ` (showing 5 of ${inv.result.totalRows})`
          : ''
      }`,
    };
  }
  // Last resort: render the sample object as a 2-column key-value table.
  if (inv.result.sample && typeof inv.result.sample === 'object') {
    const sample = inv.result.sample as Record<string, unknown>;
    const rows = Object.entries(sample).map(([k, v]) => [k, String(v)]);
    return {
      columns: ['Field', 'Value'],
      rows,
      caption: `Primary evidence: ${inv.displayName}`,
    };
  }
  return null;
}

export interface ChapterContent {
  section: Section;
  register: Register;
  number: string; // 'I', 'II', 'III', 'IV'
}

export function getRegisterFor(index: number): Register {
  const sequence: Register[] = ['dark', 'lavender', 'ivory', 'dark2'];
  return sequence[index % sequence.length];
}

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI'];
export function getChapterNumber(index: number): string {
  return ROMAN[index] ?? String(index + 1);
}

// HH:MM:SS in UTC. Mono-friendly, no locale variance.
export function timestamp(iso: string): string {
  const d = new Date(iso);
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  const ss = String(d.getUTCSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

export function durationLabel(ms: number): string {
  const s = Math.round(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}m ${String(r).padStart(2, '0')}s`;
}
