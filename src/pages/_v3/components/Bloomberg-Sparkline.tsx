// Bloomberg-Sparkline , compact inline trend rendered as SVG path.
//
// Derives a smooth polyline from a numeric series. Used in the header strip
// alongside each section's headline metric. No axes, no labels , pure shape.

interface BloombergSparklineProps {
  data: number[];
  width?: number;
  height?: number;
  stroke?: string;
  fill?: string;
  ariaLabel?: string;
}

export function BloombergSparkline({
  data,
  width = 120,
  height = 40,
  stroke = '#7F5AF0',
  fill = 'rgba(127,90,240,0.10)',
  ariaLabel = 'trend',
}: BloombergSparklineProps) {
  if (data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = data.length > 1 ? width / (data.length - 1) : width;

  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return [x, y] as const;
  });

  const linePath = points
    .map(([x, y], i) => (i === 0 ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : `L ${x.toFixed(2)} ${y.toFixed(2)}`))
    .join(' ');

  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;

  const [lastX, lastY] = points[points.length - 1];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={ariaLabel}
      className="block"
    >
      <path d={areaPath} fill={fill} />
      <path d={linePath} fill="none" stroke={stroke} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={lastX} cy={lastY} r={2.25} fill={stroke} />
    </svg>
  );
}
