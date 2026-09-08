// Catmull-Rom -> cubic Bezier smoothing so lines read as gentle curves instead
// of jagged straight segments between points.
function smoothPath(pts) {
  if (pts.length < 3) return `M ${pts.map((p) => `${p[0]} ${p[1]}`).join(" L ")}`;
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i === 0 ? i : i - 1];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}

const safeId = (color) => color.replace(/[^a-zA-Z0-9]/g, "");

export function MiniAreaChart({ points, color }) {
  const w = 240, h = 64, pad = 6;
  const max = Math.max(...points), min = Math.min(...points);
  // Widen the scale beyond the data's actual min/max so normal fluctuation
  // reads as a gentle line instead of stretching edge-to-edge on every wiggle.
  const mid = (max + min) / 2;
  const range = Math.max(max - min, 1) * 2.2;
  const scaleMin = mid - range / 2, scaleMax = mid + range / 2;
  const norm = (v) => h - pad - ((v - scaleMin) / (scaleMax - scaleMin)) * (h - pad * 2);
  const step = (w - pad * 2) / (points.length - 1);
  const coords = points.map((p, i) => [pad + i * step, norm(p)]);
  const linePath = smoothPath(coords);
  const last = coords[coords.length - 1];
  const areaPath = `${linePath} L ${last[0]} ${h} L ${coords[0][0]} ${h} Z`;
  const gradId = `area-${safeId(color)}`;
  const glowId = `glow-${safeId(color)}`;

  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1="0" x2={w} y1={h * f} y2={h * f} stroke="var(--border)" strokeWidth="1" strokeDasharray="3 4" opacity="0.6" />
      ))}

      <path d={areaPath} fill={`url(#${gradId})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" filter={`url(#${glowId})`} />
      <circle cx={last[0]} cy={last[1]} r="3.5" fill={color} stroke="var(--panel)" strokeWidth="2" />
    </svg>
  );
}

export function MiniBarChart({ values, color }) {
  const w = 240, h = 64, pad = 4;
  const max = Math.max(...values, 1);
  const bw = (w - pad * (values.length + 1)) / values.length;
  const gradId = `bar-${safeId(color)}`;

  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.3" />
        </linearGradient>
      </defs>
      {[0.5].map((f) => (
        <line key={f} x1="0" x2={w} y1={h * f} y2={h * f} stroke="var(--border)" strokeWidth="1" strokeDasharray="3 4" opacity="0.5" />
      ))}
      {values.map((v, i) => {
        const bh = Math.max(3, (v / max) * (h - 6));
        const x = pad + i * (bw + pad);
        const isLast = i === values.length - 1;
        return (
          <rect
            key={i}
            x={x}
            y={h - bh}
            width={bw}
            height={bh}
            rx={Math.min(4, bw / 2)}
            fill={`url(#${gradId})`}
            opacity={isLast ? 1 : 0.55 + 0.35 * (v / max)}
            stroke={isLast ? color : "none"}
            strokeWidth={isLast ? 1 : 0}
          />
        );
      })}
    </svg>
  );
}
