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
    <div className="toast" style={{
      background: "var(--panel)", border: `1px solid ${colors[kind]}`,
      borderRadius: 12, padding: "12px 16px", color: "var(--text)", fontSize: 14, boxShadow: "0 8px 24px rgba(0,0,0,.4)"
    }}>
      {message}
    </div>
  );
}

// In-app replacement for window.confirm, styled to match the rest of the UI.
export function ConfirmDialog({ title, message, confirmLabel = "Confirm", busyLabel = "Deleting…", busy, onConfirm, onCancel }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const buttonStyle = { flex: 1, padding: "11px 0", borderRadius: 10, fontSize: 14, fontWeight: 600, border: "1px solid var(--border)" };
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" role="alertdialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--red-dim)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon.trash style={{ width: 18, height: 18, color: "var(--red)" }} />
          </div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{title}</h3>
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.5, color: "var(--text-dim)", marginBottom: 20 }}>{message}</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onCancel} disabled={busy} style={{ ...buttonStyle, background: "var(--panel-2)", color: "var(--text)" }}>
            Cancel
          </button>
          <button onClick={onConfirm} disabled={busy} style={{ ...buttonStyle, background: "var(--red-dim)", color: "var(--red)", opacity: busy ? 0.6 : 1 }}>
            {busy ? busyLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function Sidebar({ activeView = "dashboard", onNavigate, role }) {
  // `duplicate` items and disabled (key: null) items are hidden in the phone tab bar.
  const items = [
    { icon: Icon.grid, label: "Dashboard", key: "dashboard" },
    { icon: Icon.stations, label: "Stations", key: "dashboard", duplicate: true },
    { icon: Icon.message, label: "Messages", key: "messages" },
    role === "Admin"
      ? { icon: Icon.star, label: "Review Approvals", short: "Approvals", key: "reviewApprovals" }
      : { icon: Icon.star, label: "Write a Review", short: "Review", key: "reviews" },
    ...(role === "Admin" ? [{ icon: Icon.settings, label: "Setting", key: "admin" }] : []),
    { icon: Icon.drivers, label: "Drivers", key: null },
    { icon: Icon.reports, label: "Reports", key: null },
  ];
  return (
    <nav className="sidebar">
      <div className="sidebar-logo" style={{ display: "flex", alignItems: "center", gap: 9, padding: "0 8px", marginBottom: 26 }}>
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
            className={`sidebar-item${clickable ? "" : " disabled"}${it.duplicate ? " duplicate" : ""}`}
            onClick={() => clickable && onNavigate?.(it.key)}
            style={{
              color: isActive ? "var(--green)" : "var(--text-dim)",
              background: isActive ? "var(--green-dim)" : "transparent",
              fontWeight: isActive ? 600 : 500,
              cursor: clickable ? "pointer" : "default",
              opacity: clickable ? 1 : 0.5,
            }}
          >
            <it.icon style={{ width: 17, height: 17, flexShrink: 0 }} />
            <span className="sidebar-label-full">{it.label}</span>
            <span className="sidebar-label-short">{it.short || it.label}</span>
          </div>
        );
      })}

      <div className="sidebar-footer" style={{ marginTop: "auto", paddingTop: 16, textAlign: "center", fontSize: 10.5, color: "var(--text-dim)", opacity: 0.7 }}>
        BUILD WITH NET CORE / REACT BY S.M
      </div>
    </nav>
  );
}

export function StatCard({ icon: IconEl, label, value, delta, tint }) {
  return (
    <div className="stat-card" style={{ flex: 1, minWidth: 0, background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: tint + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
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
