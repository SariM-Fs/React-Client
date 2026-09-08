import { useState } from "react";
import { api } from "../api.js";
import { Toast } from "../components/UI.jsx";

const SPOT_STATUSES = ["Available", "Occupied", "OutOfOrder"];

export function AdminScreen({ token, stations, loading, onReload }) {
  const [toast, setToast] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [expandedStationId, setExpandedStationId] = useState(null);
  const [spotsByStation, setSpotsByStation] = useState({});
  const [spotsLoading, setSpotsLoading] = useState(false);
  const [spotBusyId, setSpotBusyId] = useState(null);

  const toggleStation = async (station) => {
    setBusyId(station.id);
    const { ok, data } = await api(`/stations/${station.id}/status`, {
      method: "PATCH", token, body: { isActive: !station.isActive },
    });
    setBusyId(null);
    if (ok) {
      setToast({ kind: "success", message: `${station.name} is now ${data.isActive ? "Active" : "Inactive"}.` });
      onReload();
    } else {
      setToast({ kind: "error", message: data?.message || "Could not update station." });
    }
  };

  const toggleExpand = async (station) => {
    if (expandedStationId === station.id) {
      setExpandedStationId(null);
      return;
    }
    setExpandedStationId(station.id);
    setSpotsLoading(true);
    const { ok, data } = await api(`/spots?stationId=${station.id}&page=1&pageSize=50`, { token });
    setSpotsLoading(false);
    if (ok) {
      setSpotsByStation((prev) => ({ ...prev, [station.id]: data.items }));
    }
  };

  const changeSpotStatus = async (stationId, spot, newStatus) => {
    setSpotBusyId(spot.id);
    const { ok, data } = await api(`/spots/${spot.id}/status`, {
      method: "PATCH", token, body: { status: newStatus },
    });
    setSpotBusyId(null);
    if (ok) {
      setToast({ kind: "success", message: `Spot #${spot.spotNumber} is now ${newStatus}.` });
      const refreshed = await api(`/spots?stationId=${stationId}&page=1&pageSize=50`, { token });
      if (refreshed.ok) {
        setSpotsByStation((prev) => ({ ...prev, [stationId]: refreshed.data.items }));
      }
      onReload();
    } else {
      setToast({ kind: "error", message: data?.message || "Could not update spot." });
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Admin — Manage Stations & Spots</h2>

      {loading ? (
        <div style={{ color: "var(--text-dim)" }}>Loading…</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {stations.map((s) => {
            const isActive = s.isActive === true;
            const isExpanded = expandedStationId === s.id;
            return (
              <div key={s.id} style={{ background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16 }}>
                  <div onClick={() => toggleExpand(s)} style={{ cursor: "pointer", flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11, color: "var(--text-dim)" }}>{isExpanded ? "▾" : "▸"}</span>
                      <div style={{ fontWeight: 600 }}>{s.name}</div>
                      <span style={{
                        background: isActive ? "var(--green-dim)" : "var(--red-dim)",
                        color: isActive ? "var(--green)" : "var(--red)",
                        fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 999,
                      }}>
                        {isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-dim)", marginLeft: 16 }}>{s.location} · {s.availableSpots} of {s.totalSpots} available</div>
                  </div>
                  <button
                    onClick={() => toggleStation(s)}
                    disabled={busyId === s.id}
                    style={{
                      padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: "1px solid var(--border)",
                      background: isActive ? "var(--red-dim)" : "var(--green-dim)",
                      color: isActive ? "var(--red)" : "var(--green)",
                    }}
                  >
                    {busyId === s.id ? "…" : isActive ? "Deactivate" : "Activate"}
                  </button>
                </div>

                {isExpanded && (
                  <div style={{ borderTop: "1px solid var(--border)", padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                    {spotsLoading ? (
                      <div style={{ color: "var(--text-dim)", fontSize: 13 }}>Loading spots…</div>
                    ) : (
                      (spotsByStation[s.id] || []).map((spot) => (
                        <div key={spot.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 13 }}>Spot #{String(spot.spotNumber).padStart(2, "0")}</span>
                          <select
                            value={spot.status}
                            disabled={spotBusyId === spot.id}
                            onChange={(e) => changeSpotStatus(s.id, spot, e.target.value)}
                            style={{ padding: "5px 9px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--panel-2)", color: "var(--text)", fontSize: 13 }}
                          >
                            {SPOT_STATUSES.map((st) => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                          </select>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}