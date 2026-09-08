export function Gauge({ percent, color, label, sublabel }) {
  const r = 34, c = 2 * Math.PI * r;
  const dash = Math.max(0, Math.min(1, percent)) * c;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={r} fill="none" stroke="#1e2740" strokeWidth="7" />
        <circle
          cx="44" cy="44" r={r} fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={`${dash} ${c}`} strokeLinecap="round"
          transform="rotate(-90 44 44)"
          style={{ transition: "stroke-dasharray .5s ease" }}
        />
        <text x="44" y="41" textAnchor="middle" fontSize="15" fontWeight="600" fill="var(--text)">{label}</text>
        {sublabel && <text x="44" y="56" textAnchor="middle" fontSize="9" fill="var(--text-dim)">{sublabel}</text>}
      </svg>
    </div>
  );
}
