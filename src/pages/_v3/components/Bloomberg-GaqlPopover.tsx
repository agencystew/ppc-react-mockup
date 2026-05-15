// Bloomberg-GaqlPopover , a one-line truncated GAQL receipt with hover/click
// popover. Used inline next to section header metrics, and inside finding
// cards. The full query renders in a fixed-position popover above the trigger.
//
// The trigger is keyboard-focusable. Hover or focus opens the popover.
// Clicking toggles. No external state management.

import { useEffect, useRef, useState } from 'react';
import { ArrowsOutSimple, X } from '@phosphor-icons/react';

interface BloombergGaqlPopoverProps {
  gaql: string;
  resource: string;
  toolCallId: string;
  variant?: 'inline' | 'pill';
}

export function BloombergGaqlPopover({
  gaql,
  resource,
  toolCallId,
  variant = 'inline',
}: BloombergGaqlPopoverProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement | null>(null);

  // One-line preview: SELECT col, col, col FROM resource WHERE ...
  const oneLine = gaql.replace(/\s+/g, ' ').trim();
  const preview = oneLine.length > 96 ? oneLine.slice(0, 96) + '...' : oneLine;

  // Close on outside click / escape.
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const triggerCls =
    variant === 'pill'
      ? 'inline-flex items-center gap-1.5 rounded-[6px] border border-ppc-card-border bg-white px-2 py-1 font-mono text-[10.5px] uppercase tracking-[0.08em] text-ppc-ink hover:border-ppc-purple-500 hover:text-ppc-purple-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ppc-purple-500'
      : 'group inline-flex items-baseline gap-2 max-w-full text-left font-mono text-[11.5px] leading-[1.5] text-ppc-text-muted hover:text-ppc-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ppc-purple-500';

  return (
    <span ref={containerRef} className="relative inline-block max-w-full align-middle">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={triggerCls}
        aria-expanded={open}
        aria-controls={`gaql-pop-${toolCallId}`}
        title="View full GAQL query"
      >
        {variant === 'pill' ? (
          <>
            <span>GAQL</span>
            <ArrowsOutSimple weight="bold" size={11} />
          </>
        ) : (
          <>
            <span
              className="truncate max-w-[420px] sm:max-w-[520px] md:max-w-[640px] inline-block align-bottom"
              style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {preview}
            </span>
            <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.10em] text-ppc-purple-700 group-hover:text-ppc-purple-500">
              expand
            </span>
          </>
        )}
      </button>

      {open && (
        <div
          id={`gaql-pop-${toolCallId}`}
          role="dialog"
          className="absolute left-0 top-full z-40 mt-2 w-[min(640px,86vw)] rounded-[10px] border border-ppc-card-border bg-white shadow-[0_24px_48px_-12px_rgba(15,10,30,0.30)]"
        >
          <div className="flex items-center justify-between border-b border-ppc-card-border px-3.5 py-2">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.10em] text-ppc-text-muted">
              <span>GAQL</span>
              <span className="text-ppc-text-faint">/</span>
              <span className="text-ppc-purple-700">{resource}</span>
              <span className="text-ppc-text-faint">/</span>
              <span>{toolCallId}</span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-[6px] p-1 text-ppc-text-muted hover:bg-ppc-canvas hover:text-ppc-ink"
              aria-label="Close"
            >
              <X weight="bold" size={12} />
            </button>
          </div>
          <pre className="m-0 max-h-[300px] overflow-auto p-3.5 font-mono text-[11.5px] leading-[1.55] text-ppc-ink whitespace-pre">
            {gaql}
          </pre>
        </div>
      )}
    </span>
  );
}
