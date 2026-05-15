// Bloomberg-MagBar , horizontal magnitude bar rendered next to a numeric value.
//
// Used inside compact data tables. The bar width is proportional to value / max,
// drawn as a subtle purple fill behind the right-aligned numeric text.

interface BloombergMagBarProps {
  value: number;
  max: number;
  width?: number;
  height?: number;
  intent?: 'positive' | 'neutral' | 'negative';
}

export function BloombergMagBar({
  value,
  max,
  width = 56,
  height = 6,
  intent = 'neutral',
}: BloombergMagBarProps) {
  const pct = max <= 0 ? 0 : Math.max(0, Math.min(1, value / max));
  const palette: Record<string, string> = {
    positive: '#7F5AF0',
    neutral: '#7F5AF0',
    negative: '#E24B4A',
  };

  return (
    <span
      className="inline-block align-middle rounded-[2px]"
      style={{
        width,
        height,
        background: 'rgba(127,90,240,0.10)',
      }}
      aria-hidden
    >
      <span
        className="block rounded-[2px]"
        style={{
          width: `${pct * 100}%`,
          height: '100%',
          background: palette[intent],
          opacity: intent === 'negative' ? 0.85 : 0.65,
        }}
      />
    </span>
  );
}
