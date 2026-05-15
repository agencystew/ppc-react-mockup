// V1 Magazine longform — stub.
//
// REPLACE THIS FILE with your variant per:
//   docs/plans/2026-05-15-report-evidence-parallel-design.md
//
// You are building V1 (Magazine longform). See section 4.V1 of the brief
// for the design axis and composition cues. Import data from the fixture.
// Do not modify the fixture. Self-audit checklist goes at the bottom.

import { COMPETITOR_SPY_REPORT } from '../../mock/competitor-spy-evidence';

export function ReportMagazine() {
  const report = COMPETITOR_SPY_REPORT;
  return (
    <div className="p-12">
      <h1 className="text-2xl">V1 Magazine stub for {report.accountName}</h1>
      <p className="mt-2 text-sm opacity-60">
        Replace this stub. Read docs/plans/2026-05-15-report-evidence-parallel-design.md first.
      </p>
    </div>
  );
}
