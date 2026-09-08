import { useEffect } from "react";
import { Icon } from "./Icon.jsx";

export function StatusBadge({ status }) {
  const map = {
    Available: { bg: "var(--green-dim)", fg: "var(--green)" },
    Occupied: { bg: "var(--blue-dim)", fg: "var(--blue)" },
    OutOfOrder: { bg: "var(--red-dim)", fg: "var(--red)" },
  };
  const s = map[status] || map.Occupied;
  return (
    <span style={{ background: s.bg, color: s.fg, fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 999 }}>
      {status}
    </span>
  );
}

export function Stars({ value = 0, onChange, size = 16 }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          onClick={onChange ? () => onChange(n) : undefined}
          style={{ cursor: onChange ? "pointer" : "default", lineHeight: 0 }}
        >
          <Icon.star style={{
            width: size, height: size,
            color: n <= value ? "var(--green)" : "var(--border)",
            fill: n <= value ? "var(--green)" : "none",
          }} />
        </span>
      ))}
    </div>
  );
}

export function Toast({ message, kind, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  const colors = { error: "var(--red)", success: "var(--green)", info: "var(--blue)" };
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, background: "var(--panel)", border: `1px solid ${colors[kind]}`,
      borderRadius: 12, padding: "12px 16px", color: "var(--text)", fontSize: 14, maxWidth: 320, boxShadow: "0 8px 24px rgba(0,0,0,.4)"
    }}>
      {message}
    </div>
  );
}

export function Sidebar({ activeView = "dashboard", onNavigate, role }) {
  const items = [
    { icon: Icon.grid, label: "Dashboard", key: "dashboard" },
    { icon: Icon.stations, label: "Stations", key: "dashboard" },
    { icon: Icon.message, label: "Messages", key: "messages" },
    role === "Admin"
      ? { icon: Icon.star, label: "Review Approvals", key: "reviewApprovals" }
      : { icon: Icon.star, label: "Write a Review", key: "reviews" },
    ...(role === "Admin" ? [{ icon: Icon.settings, label: "Setting", key: "admin" }] : []),
    { icon: Icon.drivers, label: "Drivers", key: null },
    { icon: Icon.reports, label: "Reports", key: null },
  ];
  return (
    <div style={{ width: 208, flexShrink: 0, borderRight: "1px solid var(--border)", padding: "22px 14px", display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "0 8px", marginBottom: 26 }}>
        <div style={{ width: 30, height: 30, borderRadius: 9, background: "var(--green-dim)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon.bolt style={{ width: 16, height: 16, color: "var(--green)" }} />
        </div>
        <span className="display" style={{ fontWeight: 700, fontSize: 14 }}>EV Charging</span>
      </div>
      {items.map((it) => {
        const isActive = it.key === activeView;
        const clickable = it.key !== null;
        return (
          <div
            key={it.label}
            onClick={() => clickable && onNavigate?.(it.key)}
            style={{
              display: "flex", alignItems: "center", gap: 11, padding: "9px 12px", borderRadius: 10, fontSize: 14,
              color: isActive ? "var(--green)" : "var(--text-dim)",
              background: isActive ? "var(--green-dim)" : "transparent",
              fontWeight: isActive ? 600 : 500,
              cursor: clickable ? "pointer" : "default",
              opacity: clickable ? 1 : 0.5,
            }}
          >
            <it.icon style={{ width: 17, height: 17 }} />
            {it.label}
          </div>
        );
      })}

      <div style={{ marginTop: "auto", paddingTop: 16, textAlign: "center", fontSize: 10.5, color: "var(--text-dim)", opacity: 0.7 }}>
        BUILD WITH NET CORE / REACT BY S.M
      </div>
    </div>
  );
}

export function StatCard({ icon: IconEl, label, value, delta, tint }) {
  return (
    <div style={{ flex: 1, background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 14, padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: tint + "22", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <IconEl style={{ width: 15, height: 15, color: tint }} />
        </div>
        <span style={{ fontSize: 13, color: "var(--text-dim)" }}>{label}</span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span className="display" style={{ fontSize: 26, fontWeight: 700 }}>{value}</span>
        <span style={{ fontSize: 12, color: "var(--green)" }}>↑ {delta}</span>
      </div>
    </div>
  );
}
