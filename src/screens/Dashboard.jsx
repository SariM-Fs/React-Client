import { useState, useEffect, useCallback } from "react";
import { api, API_BASE } from "../api.js";
import { Icon } from "../components/Icon.jsx";
import { Sidebar, StatCard, Toast } from "../components/UI.jsx";
import { SpotTile } from "../components/SpotTile.jsx";
import { MiniAreaChart, MiniBarChart } from "../components/Charts.jsx";

export function Dashboard({ token, name, onLogout }) {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [startingId, setStartingId] = useState(null);

  const loadSpots = useCallback(async () => {
    const { ok, data } = await api("/spots", { token });
    if (ok) setSpots(data);
    setLoading(false);
  }, [token]);

  useEffect(() => { loadSpots(); }, [loadSpots]);

  const startSession = async (spot) => {
    setStartingId(spot.id);
    const { ok, status, data } = await api("/sessions", {
      method: "POST", token, body: { spotId: spot.id },
    });
    setStartingId(null);
    if (ok) {
      setToast({ kind: "success", message: `Session started on spot #${spot.spotNumber}.` });
      loadSpots();
    } else if (status === 409) {
      // The concurrency case from the assignment: someone else took it first.
      setToast({ kind: "error", message: data?.message || "This spot was just taken by another driver." });
      loadSpots();
    } else {
      setToast({ kind: "error", message: data?.message || "Could not start the session." });
    }
  };

  const available = spots.filter((s) => s.status === "Available").length;
  const occupied = spots.filter((s) => s.status === "Occupied").length;

  // Illustrative only — wire to a real analytics endpoint later.
  const energySeries = [40, 65, 50, 90, 70, 110, 95, 130];
  const utilSeries = [3, 6, 4, 7, 5, 8, 6, 4];

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <div style={{ flex: 1, padding: "22px 26px", display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 className="display" style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>EV Charging Management</h1>
          <div onClick={onLogout} title="Log out" style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--panel-2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
            {(name || "?").slice(0, 1).toUpperCase()}
          </div>
        </div>

        <div style={{ display: "flex", gap: 14 }}>
          <StatCard icon={Icon.stations} label="Total Stations" value={new Set(spots.map(s => s.stationId)).size} delta="1.2" tint="#4f9eff" />
          <StatCard icon={Icon.pin} label="Spots in Use" value={occupied} delta="0.5" tint="#34d399" />
          <StatCard icon={Icon.user} label="Active Sessions" value={occupied} delta="2.5" tint="#4f9eff" />
          <StatCard icon={Icon.bolt} label="Spots Available" value={available} delta="1.5" tint="#34d399" />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Charging Spot Tiles <span style={{ color: "var(--text-dim)", fontWeight: 400 }}>({spots.length} total)</span></h2>
          <button onClick={loadSpots} style={{ fontSize: 13, color: "var(--blue)", background: "transparent", border: "none" }}>Refresh</button>
        </div>

        {loading ? (
          <div style={{ color: "var(--text-dim)" }}>Loading spots…</div>
        ) : spots.length === 0 ? (
          <div style={{ color: "var(--text-dim)", background: "var(--panel)", border: "1px dashed var(--border)", borderRadius: 14, padding: 20 }}>
            No spots yet — seed a station/spot in the database, or check that {API_BASE} is reachable.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
            {spots.map((s) => (
              <SpotTile key={s.id} spot={s} onStart={startSession} starting={startingId === s.id} />
            ))}
          </div>
        )}
      </div>

      <div style={{ width: 288, flexShrink: 0, borderLeft: "1px solid var(--border)", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 14, padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Current Activity</div>
          <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 4 }}>Energy Consumed (Last 24h)</div>
          <MiniAreaChart points={energySeries} color="#4f9eff" />
          <div style={{ fontSize: 11, color: "var(--text-dim)", margin: "10px 0 4px" }}>Spot Utilization</div>
          <MiniBarChart values={utilSeries} color="#34d399" />
        </div>

        <div style={{ background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 14, padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Filter</div>
          {["Station", "Connector Type", "Status"].map((l) => (
            <label key={l} style={{ display: "block", marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 4 }}>{l}</div>
              <select style={{ width: "100%", padding: "7px 9px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--panel-2)", color: "var(--text)" }}>
                <option>All</option>
              </select>
            </label>
          ))}
        </div>

        <div style={{ background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 14, padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Recent Sessions</div>
          <div style={{ fontSize: 12, color: "var(--text-dim)" }}>
            Hook this up to a future <code>GET /api/sessions/recent</code> endpoint — not built yet.
          </div>
        </div>
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
