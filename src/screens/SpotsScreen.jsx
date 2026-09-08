import { useState, useEffect, useCallback } from "react";
import { api, CHARGING_PRICE } from "../api.js";
import { SpotTile } from "../components/SpotTile.jsx";
import { Toast } from "../components/UI.jsx";
import { PaymentModal } from "../components/PaymentModal.jsx";
import { Icon } from "../components/Icon.jsx";

const PAGE_SIZE = 6;

export function SpotsScreen({ token, station, onBack }) {
  const [spots, setSpots] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [startingId, setStartingId] = useState(null);
  const [endingId, setEndingId] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [payProcessing, setPayProcessing] = useState(false);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const loadSpots = useCallback(async () => {
    setLoading(true);
    const { ok, data } = await api(
      `/spots?stationId=${station.id}&page=${page}&pageSize=${PAGE_SIZE}`,
      { token }
    );
    if (ok) {
      setSpots(data.items);
      setTotalCount(data.totalCount);
    }
    setLoading(false);
  }, [token, station.id, page]);

  useEffect(() => { loadSpots(); }, [loadSpots]);

  const claimSpot = async (spot) => {
    setStartingId(spot.id);
    const { ok, status, data } = await api("/sessions", {
      method: "POST", token, body: { spotId: spot.id },
    });
    setStartingId(null);

    if (ok) {
      setActiveSession({ spot, sessionId: data.id });
    } else if (status === 409) {
      setToast({ kind: "error", message: data?.message || "This spot was just taken by another driver." });
      loadSpots();
    } else {
      setToast({ kind: "error", message: data?.message || "Could not start the session." });
    }
  };

  const endSession = async (spot) => {
    setEndingId(spot.id);
    const energyDeliveredKwh = Math.round((Math.random() * 15 + 2) * 10) / 10; // demo: 2–17 kWh
    const { ok, data } = await api(`/sessions/${spot.activeSessionId}`, {
      method: "PATCH", token, body: { energyDeliveredKwh },
    });
    setEndingId(null);

    if (ok) {
      setToast({ kind: "success", message: `Session ended. ${energyDeliveredKwh} kWh delivered.` });
    } else {
      setToast({ kind: "error", message: data?.message || "Could not end the session." });
    }
    loadSpots();
  };

  const confirmPayment = async (paymentDetails) => {
    setPayProcessing(true);
    const { ok } = await api("/payments", {
      method: "POST", token, body: { sessionId: activeSession.sessionId, ...paymentDetails },
    });
    setPayProcessing(false);
    setActiveSession(null);

    if (ok) {
      setToast({ kind: "success", message: "Payment accepted. Charging session is active." });
    } else {
      setToast({ kind: "error", message: "Session is active, but payment could not be recorded." });
    }
    loadSpots();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <button onClick={onBack} style={{ background: "transparent", border: "none", color: "var(--blue)", fontSize: 13, padding: 0, marginBottom: 10 }}>
          ← Back to stations
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{station.name}</h2>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 5, background: "var(--green-dim)", color: "var(--green)",
            fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 999,
          }}>
            <Icon.dollar style={{ width: 12, height: 12 }} />
            {CHARGING_PRICE.toFixed(2)} <span style={{ fontWeight: 500, opacity: 0.85 }}>/ session</span>
          </span>
        </div>
        <div style={{ fontSize: 13, color: "var(--text-dim)" }}>{station.location} · {station.connectorType} · {station.powerKw}kW</div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>
          Charging Spot Tiles <span style={{ color: "var(--text-dim)", fontWeight: 400 }}>({totalCount} total)</span>
        </h3>
        <button onClick={loadSpots} style={{ fontSize: 13, color: "var(--blue)", background: "transparent", border: "none" }}>Refresh</button>
      </div>

      {loading ? (
        <div style={{ color: "var(--text-dim)" }}>Loading spots…</div>
      ) : spots.length === 0 ? (
        <div style={{ color: "var(--text-dim)", background: "var(--panel)", border: "1px dashed var(--border)", borderRadius: 14, padding: 20 }}>
          This station has no spots yet.
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
            {spots.map((s) => (
              <SpotTile
                key={s.id}
                spot={s}
                onStart={claimSpot}
                onEnd={endSession}
                starting={startingId === s.id}
                ending={endingId === s.id}
              />
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 14, marginTop: 4 }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--panel-2)", color: page <= 1 ? "var(--text-dim)" : "var(--text)" }}
            >
              ← Prev
            </button>
            <span style={{ fontSize: 13, color: "var(--text-dim)" }}>Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--panel-2)", color: page >= totalPages ? "var(--text-dim)" : "var(--text)" }}
            >
              Next →
            </button>
          </div>
        </>
      )}

      {activeSession && (
        <PaymentModal spot={activeSession.spot} busy={payProcessing} onClose={() => {}} onConfirm={confirmPayment} />
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}