// Audit-utils. Pure helpers shared by Audit-* components.
//
// Keeps the variant's logic in one place so we never hardcode counts or
// hand-roll a chip list. Everything here is derived from the fixture.

import type { Finding, Section, ToolInvocation } from '../../../mock/competitor-spy-evidence';

// Resource chips for a finding: unique(displayName) across [primary, ...supporting].
export function chipsForFinding(
  finding: Finding,
  byId: Record<string, ToolInvocation>,
): string[] {
  const refs = [finding.primaryEvidenceRef, ...finding.supportingEvidenceRefs];
  const names = refs
    .map((r) => byId[r]?.displayName)
    .filter((s): s is string => Boolean(s));
  const seen = new Set<string>();
  const out: string[] = [];
  for (const n of names) {
    if (!seen.has(n)) {
      seen.add(n);
      out.push(n);
    }
  }
  return out;
}

// Map every invocation by id, across all sections.
export function buildInvocationIndex(sections: Section[]): Record<string, ToolInvocation> {
  const idx: Record<string, ToolInvocation> = {};
  for (const s of sections) {
    for (const inv of s.invocations) {
      idx[inv.id] = inv;
    }
  }
  return idx;
}

// Map every finding by its primaryEvidenceRef, so a timeline node can
// know whether a finding is anchored to it.
export function buildPrimaryAnchorIndex(sections: Section[]): Record<string, Finding> {
  const idx: Record<string, Finding> = {};
  for (const s of sections) {
    for (const f of s.findings) {
      idx[f.primaryEvidenceRef] = f;
    }
  }
  return idx;
}

// Build a set of supporting-ref ids (anywhere on the page) so we can
// visually mark those nodes as branches.
export function buildSupportingRefSet(sections: Section[]): Set<string> {
  const set = new Set<string>();
  for (const s of sections) {
    for (const f of s.findings) {
      for (const r of f.supportingEvidenceRefs) set.add(r);
    }
  }
  return set;
}

// Format ISO timestamp as a short clock string + relative offset from the
// run start. Returns mono-friendly strings (no em-dashes).
export function formatNodeTime(iso: string, runStart: string): { clock: string; offset: string } {
  const d = new Date(iso);
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  const ss = String(d.getUTCSeconds()).padStart(2, '0');
  const offsetMs = d.getTime() - new Date(runStart).getTime();
  const offsetS = Math.max(0, Math.round(offsetMs / 1000));
  return {
    clock: `${hh}:${mm}:${ss}`,
    offset: `+${offsetS}s`,
  };
}

// Short tool-name label suitable for a mono caption. Mirrors the fixture
// toolName values 1:1 so we never invent vocabulary.
export function toolKindLabel(toolName: ToolInvocation['toolName']): string {
  switch (toolName) {
    case 'google_ads.query':
      return 'gaql query';
    case 'google_ads.explore_schema':
      return 'schema lookup';
    case 'serp_api.search':
      return 'serp scrape';
    case 'web.scrape':
      return 'web scrape';
    case 'domain.lookup':
      return 'domain lookup';
  }
}

// Format ms as a short Courier-ready latency caption.
export function formatLatency(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

// Format the overall run duration (ms) as a friendly string.
export function formatDuration(ms: number): string {
  const totalS = Math.round(ms / 1000);
  const m = Math.floor(totalS / 60);
  const s = totalS % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${String(s).padStart(2, '0')}s`;
}
