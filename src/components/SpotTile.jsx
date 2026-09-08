import { Gauge } from "./Gauge.jsx";
import { StatusBadge } from "./UI.jsx";

export function SpotTile({ spot, onStart, onEnd, starting, ending }) {
  const isAvailable = spot.status === "Available";
  const isOccupied = spot.status === "Occupied";
  const color = isAvailable ? "var(--green)" : isOccupied ? "var(--blue)" : "var(--red)";

  return (
    <div style={{ background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 14, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontWeight: 600, fontSize: 14 }}>SPOT #{String(spot.spotNumber).padStart(2, "0")}</span>
        <StatusBadge status={spot.status} />
      </div>
      <div style={{ display: "flex", justifyContent: "center", padding: "4px 0 10px" }}>
        <Gauge
          percent={isAvailable ? 1 : 0.55}
          color={color}
          label={isAvailable ? "Ready" : isOccupied ? "~2kW" : "—"}
          sublabel={isAvailable ? "" : isOccupied ? "Power" : "Fault"}
        />
      </div>
      <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 8 }}>Actions</div>
      <div style={{ display: "flex", gap: 8 }}>
        {isOccupied ? (
          <button
            disabled={!spot.activeSessionId || ending}
            onClick={() => onEnd(spot)}
            style={{
              flex: 1, padding: "7px 0", borderRadius: 8, fontSize: 13, fontWeight: 600, border: "1px solid var(--border)",
              background: "var(--red)", color: "#2a0a0a",
              cursor: spot.activeSessionId && !ending ? "pointer" : "not-allowed",
            }}
          >
            {ending ? "…" : "End"}
          </button>
        ) : (
          <button
            disabled={!isAvailable || starting}
            onClick={() => onStart(spot)}
            style={{
              flex: 1, padding: "7px 0", borderRadius: 8, fontSize: 13, fontWeight: 600, border: "1px solid var(--border)",
              background: isAvailable ? "var(--green)" : "var(--panel-2)",
              color: isAvailable ? "#06110c" : "var(--text-dim)",
              cursor: isAvailable && !starting ? "pointer" : "not-allowed",
            }}
          >
            {starting ? "…" : isAvailable ? "Start" : "—"}
          </button>
        )}
        <button disabled style={{ flex: 1, padding: "7px 0", borderRadius: 8, fontSize: 13, fontWeight: 600, border: "1px solid var(--border)", background: "var(--panel-2)", color: "var(--text-dim)" }}>
          Details
        </button>
      </div>
    </div>
  );
}