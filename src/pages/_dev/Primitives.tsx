// Hidden QA route for the four v2 brand primitives.
// Mounted at /_dev/primitives. Used by page-rebuild agents to verify the
// primitives in isolation before composing them into real pages.

import { Sticker } from '../../components/brand/Sticker';
import { PillButton } from '../../components/brand/PillButton';
import { Caveat } from '../../components/brand/Caveat';
import { Mascot } from '../../components/brand/Mascot';

export function DevPrimitives() {
  return (
    <div className="min-h-screen bg-canvas px-12 py-16 font-sans text-ink">
      <header className="mb-12">
        <h1 className="text-[56px] font-[900] leading-[1.00] tracking-[-0.025em]">
          v2 brand primitives
        </h1>
        <p className="mt-3 text-[17px] font-medium opacity-70">
          Hidden QA route. Rendered for the page-rebuild agents to verify the
          foundation before composing real pages.
        </p>
      </header>

      {/* ── Sticker ───────────────────────────────────────────────────── */}
      <section className="mb-20">
        <h2 className="mb-8 text-[32px] font-[800] leading-[1.05] tracking-[-0.020em]">
          Sticker
        </h2>
        <div className="flex flex-wrap items-end gap-12">
          <Sticker className="px-6 py-4">
            <span className="text-[17px] font-bold">default · white fill</span>
          </Sticker>
          <Sticker variant="mint" tilt={-2} className="px-6 py-4">
            <span className="text-[17px] font-bold">mint · tilt -2°</span>
          </Sticker>
        </div>
      </section>

      {/* ── PillButton ────────────────────────────────────────────────── */}
      <section className="mb-20">
        <h2 className="mb-8 text-[32px] font-[800] leading-[1.05] tracking-[-0.020em]">
          PillButton
        </h2>
        <div className="flex flex-wrap items-center gap-6">
          <PillButton variant="primary">Primary action →</PillButton>
          <PillButton variant="ink">Ink action →</PillButton>
          <PillButton variant="ghost">Ghost action →</PillButton>
          <PillButton variant="primary" href="#">
            Primary as link →
          </PillButton>
        </div>
      </section>

      {/* ── Caveat ────────────────────────────────────────────────────── */}
      <section className="mb-20">
        <h2 className="mb-8 text-[32px] font-[800] leading-[1.05] tracking-[-0.020em]">
          Caveat
        </h2>
        <div className="grid grid-cols-2 gap-8">
          <div className="rounded-2xl border-[1.5px] border-ink/15 bg-white p-8">
            <Caveat text="no arrow" arrow="none" />
          </div>
          <div className="rounded-2xl border-[1.5px] border-ink/15 bg-white p-8">
            <Caveat text="down-left" arrow="down-left" />
          </div>
          <div className="rounded-2xl border-[1.5px] border-ink/15 bg-white p-8">
            <Caveat text="down-right" arrow="down-right" />
          </div>
          <div className="rounded-2xl border-[1.5px] border-ink/15 bg-white p-8">
            <Caveat text="up-left" arrow="up-left" />
          </div>
          <div className="rounded-2xl border-[1.5px] border-ink/15 bg-white p-8">
            <Caveat text="up-right" arrow="up-right" />
          </div>
        </div>
      </section>

      {/* ── Mascot ────────────────────────────────────────────────────── */}
      <section className="mb-20">
        <h2 className="mb-8 text-[32px] font-[800] leading-[1.05] tracking-[-0.020em]">
          Mascot
        </h2>
        <div className="flex flex-wrap items-end gap-12 rounded-2xl border-[1.5px] border-ink/15 bg-white p-8">
          <figure className="flex flex-col items-center gap-2">
            <Mascot pose="wave" size={160} />
            <figcaption className="font-mono text-[14px]">wave</figcaption>
          </figure>
          <figure className="flex flex-col items-center gap-2">
            <Mascot pose="rocket" size={160} />
            <figcaption className="font-mono text-[14px]">rocket</figcaption>
          </figure>
          <figure className="flex flex-col items-center gap-2">
            <Mascot pose="receipt" size={160} />
            <figcaption className="font-mono text-[14px]">receipt</figcaption>
          </figure>
          <figure className="flex flex-col items-center gap-2">
            <Mascot pose="peek" size={160} />
            <figcaption className="font-mono text-[14px]">peek</figcaption>
          </figure>
        </div>
      </section>
    </div>
  );
}
