/* AgentMascot — friendly glowing astronaut-helmet character used as the
 * right-column anchor on the Dashboard activity hero.
 *
 * Pure SVG. Renders a soft purple halo, a 3D-shaded helmet with bright
 * outer rim, dark visor with a violet inner rim glow, two big pink-violet
 * eyes with specular highlights, a tiny mouth dot, and a chin antenna
 * glow. No animation by default — sits still and friendly.
 *
 * Design reference: the cute robot mascot from the portfolio dashboard
 * Stewart pulled in 2026-05-15. Not the SpyMascot (that's the
 * fedora+binoculars character used inside competitor-spy). */

export function AgentMascot({ size = 220 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 240 240"
      aria-hidden
      className="pointer-events-none drop-shadow-[0_24px_28px_rgba(127,90,240,0.45)]"
    >
      <defs>
        <radialGradient id="mascot-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%"  stopColor="#A88CFF" stopOpacity="0.55" />
          <stop offset="50%" stopColor="#7F5AF0" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#7F5AF0" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="mascot-helmet" cx="40%" cy="32%" r="78%">
          <stop offset="0%"  stopColor="#D5C2FF" />
          <stop offset="35%" stopColor="#9C7BFA" />
          <stop offset="75%" stopColor="#5A3FCB" />
          <stop offset="100%" stopColor="#2E1E68" />
        </radialGradient>
        <radialGradient id="mascot-visor" cx="50%" cy="35%" r="60%">
          <stop offset="0%"   stopColor="#241544" />
          <stop offset="60%"  stopColor="#10082A" />
          <stop offset="100%" stopColor="#08041A" />
        </radialGradient>
        <radialGradient id="mascot-visor-rim" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#7F5AF0" stopOpacity="0" />
          <stop offset="80%"  stopColor="#A88CFF" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#A88CFF" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="mascot-eye" cx="35%" cy="35%" r="55%">
          <stop offset="0%"   stopColor="#FFE5F8" />
          <stop offset="35%"  stopColor="#E0AEFA" />
          <stop offset="100%" stopColor="#7F5AF0" />
        </radialGradient>
        <linearGradient id="mascot-chin" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%"   stopColor="#A88CFF" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#A88CFF" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Outer halo */}
      <circle cx="120" cy="120" r="120" fill="url(#mascot-halo)" />

      {/* Helmet body */}
      <ellipse cx="120" cy="120" rx="80" ry="86" fill="url(#mascot-helmet)" />
      {/* Helmet outer rim */}
      <ellipse
        cx="120" cy="120" rx="80" ry="86"
        fill="none"
        stroke="#C7B0FF"
        strokeOpacity="0.6"
        strokeWidth="1.6"
      />
      {/* Top-left highlight on the helmet */}
      <ellipse cx="92" cy="78" rx="22" ry="14" fill="#E5D6FF" opacity="0.30" />

      {/* Visor */}
      <ellipse cx="120" cy="120" rx="58" ry="50" fill="url(#mascot-visor)" />
      {/* Visor rim glow */}
      <ellipse
        cx="120" cy="120" rx="60" ry="52"
        fill="none"
        stroke="url(#mascot-visor-rim)"
        strokeWidth="1.8"
      />
      {/* Visor top sheen */}
      <ellipse cx="120" cy="100" rx="42" ry="6" fill="#5C3FCB" opacity="0.30" />

      {/* Eye glow halos */}
      <circle cx="100" cy="120" r="16" fill="#7F5AF0" opacity="0.32" />
      <circle cx="140" cy="120" r="16" fill="#7F5AF0" opacity="0.32" />

      {/* Eyes */}
      <circle cx="100" cy="120" r="9" fill="url(#mascot-eye)" />
      <circle cx="140" cy="120" r="9" fill="url(#mascot-eye)" />
      {/* Eye specular highlights */}
      <circle cx="97"  cy="117" r="2.5" fill="#FFFFFF" opacity="0.85" />
      <circle cx="137" cy="117" r="2.5" fill="#FFFFFF" opacity="0.85" />

      {/* Mouth glow */}
      <ellipse cx="120" cy="148" rx="6" ry="1.6" fill="#B08EF4" opacity="0.7" />

      {/* Chin antenna glow */}
      <rect x="118" y="200" width="4" height="20" rx="2" fill="url(#mascot-chin)" />
    </svg>
  );
}
