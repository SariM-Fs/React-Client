import { useState, useEffect, useCallback } from "react";
import { api } from "../api.js";
import { Icon } from "../components/Icon.jsx";
import { Sidebar, StatCard, Stars, Toast, ConfirmDialog } from "../components/UI.jsx";
import { StationsScreen } from "./StationsScreen.jsx";
import { SpotsScreen } from "./SpotsScreen.jsx";
import { AdminScreen } from "./AdminScreen.jsx";
import { MessagesScreen } from "./MessagesScreen.jsx";
import { WriteReviewScreen } from "./WriteReviewScreen.jsx";
import { ReviewApprovalsScreen } from "./ReviewApprovalsScreen.jsx";

export function Shell({ token, name, role, onLogout }) {
  const [selectedStation, setSelectedStation] = useState(null);
  const [stations, setStations] = useState([]);
  const [loadingStations, setLoadingStations] = useState(true);

  const loadStations = useCallback(async () => {
    const { ok, data } = await api("/stations", { token });
    if (ok) setStations(data);
    setLoadingStations(false);
  }, [token]);

  useEffect(() => { loadStations(); }, [loadStations]);

  // Approved reviews, shown in the right-hand panel for everyone.
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const loadReviews = useCallback(async () => {
    const { ok, data } = await api("/reviews", { token });
    if (ok) setReviews(data);
    setLoadingReviews(false);
  }, [token]);

  useEffect(() => { loadReviews(); }, [loadReviews]);

  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [deletingReview, setDeletingReview] = useState(false);
  const [toast, setToast] = useState(null);

  const deleteReview = async () => {
    const id = reviewToDelete.id;
    setDeletingReview(true);
    const { ok, data } = await api(`/reviews/${id}`, { method: "DELETE", token });
    setDeletingReview(false);
    setReviewToDelete(null);
    if (ok) {
      setReviews((prev) => prev.filter((r) => r.id !== id));
      setToast({ kind: "success", message: "Review deleted." });
    } else {
      setToast({ kind: "error", message: data?.message || "Could not delete review." });
    }
  };

  const [view, setView] = useState("stations");

  const totalStations = stations.length;
  const totalSpots = stations.reduce((sum, s) => sum + s.totalSpots, 0);
  const availableSpots = stations.reduce((sum, s) => sum + s.availableSpots, 0);
  const occupiedSpots = totalSpots - availableSpots;

  return (
    <div className="shell">
      <Sidebar activeView={view} role={role} onNavigate={(v) => { setView(v); setSelectedStation(null); window.scrollTo(0, 0); }} />
      <div className="shell-content">
      <div className="shell-main">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <div className="shell-brand" style={{ width: 30, height: 30, borderRadius: 9, background: "var(--green-dim)", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon.bolt style={{ width: 16, height: 16, color: "var(--green)" }} />
            </div>
            <h1 className="display shell-title">EV Charging Management</h1>
          </div>
          <div onClick={onLogout} title="Log out" style={{ width: 34, height: 34, flexShrink: 0, borderRadius: "50%", background: "var(--panel-2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
            {(name || "?").slice(0, 1).toUpperCase()}
          </div>
        </div>

        {!selectedStation && (
          <div className="stat-row">
            <StatCard icon={Icon.stations} label="Total Stations" value={loadingStations ? "…" : totalStations} delta="1.2" tint="#4f9eff" />
            <StatCard icon={Icon.pin} label="Spots in Use" value={loadingStations ? "…" : occupiedSpots} delta="0.5" tint="#34d399" />
            <StatCard icon={Icon.user} label="Active Sessions" value={loadingStations ? "…" : occupiedSpots} delta="2.5" tint="#4f9eff" />
            <StatCard icon={Icon.bolt} label="Spots Available" value={loadingStations ? "…" : availableSpots} delta="1.5" tint="#34d399" />
          </div>
        )}
        {view === "admin" ? (
          <AdminScreen token={token} stations={stations} loading={loadingStations} onReload={loadStations} />) : view === "messages" ? (
          <MessagesScreen token={token} role={role} />) : view === "reviews" ? (
          <WriteReviewScreen token={token} stations={stations} />) : view === "reviewApprovals" ? (
          <ReviewApprovalsScreen token={token} onReviewsChange={loadReviews} />) : selectedStation ? (
            <SpotsScreen
              token={token}
              station={selectedStation}
              onBack={() => { setSelectedStation(null); loadStations(); }}
            />
          ) : (
          <StationsScreen
            stations={stations}
            loading={loadingStations}
            onSelectStation={setSelectedStation}
          />
        )}
      </div>

      <aside className="shell-aside">
        <div style={{ background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 14, padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Reviews</div>

          {loadingReviews ? (
            <div style={{ color: "var(--text-dim)", fontSize: 13 }}>Loading…</div>
          ) : reviews.length === 0 ? (
            <div style={{ color: "var(--text-dim)", fontSize: 13 }}>No reviews yet.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 420, overflowY: "auto" }}>
              {reviews.map((r) => (
                <div key={r.id} style={{ borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4, gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 12 }}>{r.stationName}</span>
                    <Stars value={r.rating} size={12} />
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text)", marginBottom: 4, whiteSpace: "pre-wrap" }}>{r.content}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <div style={{ fontSize: 10, color: "var(--text-dim)" }}>{r.driverName} · {new Date(r.createdAt).toLocaleDateString()}</div>
                    {role === "Admin" && (
                      <button
                        onClick={() => setReviewToDelete(r)}
                        title="Delete review"
                        onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-dim)"; }}
                        style={{ padding: 2, border: "none", background: "transparent", color: "var(--text-dim)", display: "flex", alignItems: "center", cursor: "pointer" }}
                      >
                        <Icon.trash style={{ width: 13, height: 13 }} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 14, padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Recent Sessions</div>
          <div style={{ fontSize: 12, color: "var(--text-dim)" }}>
            Hook this up to a future <code>GET /api/sessions/recent</code> endpoint — not built yet.
          </div>
        </div>
      </aside>
      </div>

      {reviewToDelete && (
        <ConfirmDialog
          title="Delete review?"
          message={<>
            <span style={{ color: "var(--text)", fontWeight: 600 }}>{reviewToDelete.driverName}</span>'s review of{" "}
            <span style={{ color: "var(--text)", fontWeight: 600 }}>{reviewToDelete.stationName}</span> will be removed permanently.
            This can't be undone.
          </>}
          confirmLabel="Delete"
          busy={deletingReview}
          onConfirm={deleteReview}
          onCancel={() => { if (!deletingReview) setReviewToDelete(null); }}
        />
      )}
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}