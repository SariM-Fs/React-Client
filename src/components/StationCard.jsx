import { Icon } from "./Icon.jsx";
import { CHARGING_PRICE } from "../api.js";

export function StationCard({ station, onSelect }) {
  const pct = station.totalSpots > 0 ? station.availableSpots / station.totalSpots : 0;
  const isActive = station.isActive === true;

  return (
    <div
      onClick={() => onSelect(station)}
      style={{
        background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 14,
        padding: 18, cursor: "pointer", transition: "border-color .15s ease",
        opacity: isActive ? 1 : 0.6,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--green)")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{station.name}</div>
        <span style={{
          background: isActive ? "var(--green-dim)" : "var(--red-dim)",
          color: isActive ? "var(--green)" : "var(--red)",
          fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 999,
        }}>
          {isActive ? "Active" : "Inactive"}
        </span>
      </div>
      <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 10 }}>{station.location}</div>

      <div style={{
        display: "inline-flex", alignItems: "center", gap: 5, background: "var(--green-dim)", color: "var(--green)",
        fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 999, marginBottom: 12,
      }}>
        <Icon.dollar style={{ width: 12, height: 12 }} />
        {CHARGING_PRICE.toFixed(2)} <span style={{ fontWeight: 500, opacity: 0.85 }}>/ session</span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-dim)", marginBottom: 6 }}>
        <span>{station.availableSpots} of {station.totalSpots} available</span>
        <span>{station.connectorType} · {station.powerKw}kW</span>
      </div>
      <div style={{ height: 6, borderRadius: 999, background: "var(--panel-2)", overflow: "hidden" }}>
        <div style={{ width: `${pct * 100}%`, height: "100%", background: isActive ? "var(--green)" : "var(--red)", transition: "width .3s ease" }} />
      </div>
    </div>
  );
}