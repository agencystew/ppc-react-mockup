// V2 Bloomberg dashboard — stub.
//
// REPLACE THIS FILE with your variant per:
//   docs/plans/2026-05-15-report-evidence-parallel-design.md
//
// You are building V2 (Bloomberg dashboard). See section 4.V2 of the brief
// for the design axis and composition cues. Import data from the fixture.
// Do not modify the fixture. Self-audit checklist goes at the bottom.

import { COMPETITOR_SPY_REPORT } from '../../mock/competitor-spy-evidence';

export function ReportBloomberg() {
  const report = COMPETITOR_SPY_REPORT;
  return (
    <div className="p-12">
      <h1 className="text-2xl">V2 Bloomberg stub for {report.accountName}</h1>
      <p className="mt-2 text-sm opacity-60">
        Replace this stub. Read docs/plans/2026-05-15-report-evidence-parallel-design.md first.
      </p>
    </div>
  );
}
