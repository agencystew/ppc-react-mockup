// Custom inline-SVG spy mascot — Stewart's PPC.io purple, treated as a
// beveled 3D fedora sitting on top of binoculars. Used in the dark hero
// card on both the Competitor Spy detail page and the completed report.
// Keep the rendering identical across surfaces so the agent feels like
// the same character doing the work.

export function SpyMascot({
  size = 280,
}: {
  size?: number;
}) {
  const height = Math.round((size / 280) * 240);
  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 280 240"
      aria-hidden
      className="pointer-events-none drop-shadow-[0_24px_28px_rgba(127,90,240,0.35)]"
    >
      <defs>
        <radialGradient id="spy-hat-top" cx="0.42" cy="0.30" r="0.85">
          <stop offset="0%"  stopColor="#B59CFF" />
          <stop offset="35%" stopColor="#7F5AF0" />
          <stop offset="100%" stopColor="#3E2A8E" />
        </radialGradient>
        <radialGradient id="spy-hat-brim" cx="0.50" cy="0.30" r="0.95">
          <stop offset="0%"  stopColor="#9C7BFA" />
          <stop offset="55%" stopColor="#5C3FCB" />
          <stop offset="100%" stopColor="#2E1E68" />
        </radialGradient>
        <radialGradient id="spy-hat-band" cx="0.50" cy="0.50" r="0.50">
          <stop offset="0%"  stopColor="#3D2A8C" />
          <stop offset="100%" stopColor="#1C1240" />
        </radialGradient>
        <linearGradient id="spy-binoc-body" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%"  stopColor="#26203A" />
          <stop offset="55%" stopColor="#0F0A22" />
          <stop offset="100%" stopColor="#05030F" />
        </linearGradient>
        <radialGradient id="spy-binoc-lens" cx="0.45" cy="0.40" r="0.65">
          <stop offset="0%"  stopColor="#D7C6FF" />
          <stop offset="35%" stopColor="#9F7BF7" />
          <stop offset="75%" stopColor="#5A3FE0" />
          <stop offset="100%" stopColor="#1C1240" />
        </radialGradient>
        <radialGradient id="spy-binoc-pupil" cx="0.50" cy="0.50" r="0.50">
          <stop offset="0%"  stopColor="#0A0716" />
          <stop offset="100%" stopColor="#070310" />
        </radialGradient>
        <radialGradient id="spy-ground" cx="0.50" cy="0.50" r="0.50">
          <stop offset="0%"  stopColor="rgba(127,90,240,0.45)" />
          <stop offset="100%" stopColor="rgba(127,90,240,0)" />
        </radialGradient>
      </defs>

      <ellipse cx="140" cy="220" rx="92" ry="12" fill="url(#spy-ground)" />

      <ellipse cx="140" cy="88" rx="118" ry="20" fill="url(#spy-hat-brim)" />
      <ellipse cx="140" cy="84" rx="118" ry="20" fill="#231752" opacity="0.55" />
      <path
        d="M52 84
           C52 50 90 28 140 28
           C190 28 228 50 228 84
           L228 86
           C228 90 220 96 140 96
           C60 96 52 90 52 86 Z"
        fill="url(#spy-hat-top)"
      />
      <path
        d="M82 50
           C108 32 172 32 198 50"
        fill="none"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <ellipse cx="140" cy="82" rx="118" ry="8" fill="url(#spy-hat-band)" />
      <path
        d="M22 88
           C22 102 60 110 140 110
           C220 110 258 102 258 88"
        fill="rgba(10,5,28,0.65)"
      />

      <g>
        <rect
          x="124" y="142" width="32" height="14" rx="3"
          fill="#1C1340"
          stroke="rgba(127,90,240,0.32)" strokeWidth="1"
        />
        <rect
          x="58" y="118" width="74" height="70" rx="14"
          fill="url(#spy-binoc-body)"
          stroke="rgba(255,255,255,0.05)" strokeWidth="1"
        />
        <rect
          x="148" y="118" width="74" height="70" rx="14"
          fill="url(#spy-binoc-body)"
          stroke="rgba(255,255,255,0.05)" strokeWidth="1"
        />
        <circle cx="95"  cy="154" r="32" fill="#1C1340" />
        <circle cx="95"  cy="154" r="28" fill="url(#spy-binoc-lens)" />
        <circle cx="95"  cy="154" r="14" fill="url(#spy-binoc-pupil)" />
        <circle cx="89"  cy="148" r="4"  fill="rgba(255,255,255,0.55)" />
        <circle cx="185" cy="154" r="32" fill="#1C1340" />
        <circle cx="185" cy="154" r="28" fill="url(#spy-binoc-lens)" />
        <circle cx="185" cy="154" r="14" fill="url(#spy-binoc-pupil)" />
        <circle cx="179" cy="148" r="4"  fill="rgba(255,255,255,0.55)" />
        <rect x="62"  y="174" width="20" height="10" rx="3" fill="#0B0719" />
        <rect x="198" y="174" width="20" height="10" rx="3" fill="#0B0719" />
        <path
          d="M62 132 C76 124, 116 124, 130 132"
          fill="none"
          stroke="rgba(255,255,255,0.10)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M152 132 C166 124, 206 124, 220 132"
          fill="none"
          stroke="rgba(255,255,255,0.10)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
