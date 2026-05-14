// Page hero primitive.
//
// The app canvas is dark (#0C0C0E Smoky Black). Both variants render light
// type on dark — the difference is presence:
//
//   variant="light"  → inline hero, sits flush on the page canvas.
//                      Used by every working surface page.
//   variant="dark"   → boxed editorial block with radial glow + sheen.
//                      Use sparingly — for the catalog hero and the
//                      occasional "moment" surface.
//
// Eyebrow → 56-68px display H1 with single purple-period flourish → 1-line
// description. Same typographic muscle memory as the StagePage hero, so
// the app reads as one product.

interface PageHeroProps {
  eyebrow: string;
  // Headline. A trailing period is automatically rendered in purple.
  headline: string;
  // 1-2 line description. Sits at max-width 640 for readability.
  description?: string;
  // Optional right-aligned actions (buttons, links).
  actions?: React.ReactNode;
  variant?: 'light' | 'dark';
}

export function PageHero({ eyebrow, headline, description, actions, variant = 'light' }: PageHeroProps) {
  const hasPeriod = headline.endsWith('.');
  const headlineBody = hasPeriod ? headline.slice(0, -1) : headline;

  if (variant === 'dark') {
    return (
      <section className="ppc-dark ppc-dark--hero relative overflow-hidden rounded-3xl px-10 py-12 sm:px-14 sm:py-14">
        <div className="relative">
          <div className="font-mono text-[11.5px] font-semibold uppercase tracking-[0.08em] text-white/60">
            {eyebrow}
          </div>
          <h1 className="mt-4 max-w-[820px] font-display text-[60px] font-extrabold leading-[0.96] tracking-[-0.035em] text-white sm:text-[72px]">
            {headlineBody}
            {hasPeriod && <span className="text-ppc-purple-400">.</span>}
          </h1>
          {description && (
            <p className="mt-7 max-w-[600px] text-[18px] leading-[1.55] tracking-tight text-white/70">
              {description}
            </p>
          )}
          {actions && <div className="mt-9 flex flex-wrap gap-2.5">{actions}</div>}
        </div>
      </section>
    );
  }

  // light variant — sits inline on the page's smoky-black canvas
  return (
    <section className="flex flex-wrap items-end justify-between gap-6">
      <div className="max-w-[820px]">
        <div className="font-mono text-[11.5px] font-semibold uppercase tracking-[0.08em] text-white/55">
          {eyebrow}
        </div>
        <h1 className="mt-4 font-display text-[56px] font-extrabold leading-[0.96] tracking-[-0.035em] text-white sm:text-[64px]">
          {headlineBody}
          {hasPeriod && <span className="text-ppc-purple-400">.</span>}
        </h1>
        {description && (
          <p className="mt-6 max-w-[640px] text-[18px] leading-[1.55] tracking-tight text-white/70">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2.5">{actions}</div>}
    </section>
  );
}

// Subsection header — same rhythm at smaller scale. Use to introduce
// non-hero blocks below the page hero. Eyebrow + tightish H2.
export function SectionHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
}) {
  const hasPeriod = title.endsWith('.');
  const body = hasPeriod ? title.slice(0, -1) : title;
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="font-mono text-[11.5px] font-semibold uppercase tracking-[0.08em] text-white/55">
          {eyebrow}
        </div>
        <h2 className="mt-2 font-display text-[34px] font-bold leading-[1.05] tracking-[-0.02em] text-white">
          {body}
          {hasPeriod && <span className="text-ppc-purple-400">.</span>}
        </h2>
      </div>
      {action}
    </div>
  );
}

// CTA primitive — the "subscribe" marquee button from ppc.io. Purple-500
// fill, 2px purple-300 border, two-layer shadow, continuous pulse glow,
// scaleY hover. Use ONCE per page as the primary action.
export function PrimaryCTA({
  children,
  onClick,
  size = 'md',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  size?: 'md' | 'lg';
}) {
  return (
    <button
      onClick={onClick}
      className={`ppcio-cta ${size === 'lg' ? 'ppcio-cta--lg' : ''}`}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  onClick,
  // `variant` is kept for source-compatibility with older call sites but the
  // app is dark-canvas-only — both values render the same outline pill.
  variant: _variant,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'light' | 'dark';
}) {
  void _variant;
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-pill border border-white/15 px-5 py-3 text-[14px] font-semibold tracking-tight text-white transition-colors hover:bg-white/5"
    >
      {children}
    </button>
  );
}
