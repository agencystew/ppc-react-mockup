// STUB — v3 single-rebuild Report variant is being authored by a parallel
// agent (see .claude/worktrees/). This placeholder keeps the build green on
// the summary-v4 branch; replace with the real implementation when the
// parallel work lands on main.

export function ReportV3() {
  return (
    <div className="font-sans text-ppc-ink">
      <h1 className="font-display text-[32px] font-extrabold text-ppc-ink">
        ReportV3 (pending)
      </h1>
      <p className="mt-3 max-w-[640px] text-[14px] leading-[1.55] text-ppc-text-muted">
        The v3 reports-evidence redesign is being authored in a parallel
        worktree. This stub exists so the summary-v4 preview branch builds.
      </p>
    </div>
  );
}
