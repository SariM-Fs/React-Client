import { useState, useEffect, useCallback } from "react";
import { api } from "../api.js";
import { Toast, Stars } from "../components/UI.jsx";

export function ReviewApprovalsScreen({ token, onReviewsChange }) {
  const [pendingReviews, setPendingReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [decidingId, setDecidingId] = useState(null);
  const [toast, setToast] = useState(null);

  const loadPendingReviews = useCallback(async () => {
    setLoading(true);
    const { ok, data } = await api("/reviews/pending", { token });
    if (ok) setPendingReviews(data);
    setLoading(false);
  }, [token]);

  useEffect(() => { loadPendingReviews(); }, [loadPendingReviews]);

  const decideReview = async (id, action) => {
    setDecidingId(id);
    const { ok, data } = await api(`/reviews/${id}/${action}`, { method: "POST", token });
    setDecidingId(null);
    if (ok) {
      setPendingReviews((prev) => prev.filter((r) => r.id !== id));
      setToast({ kind: "success", message: `Review ${action === "approve" ? "approved" : "rejected"}.` });
      onReviewsChange?.();
    } else {
      setToast({ kind: "error", message: data?.message || "Could not update review." });
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>
        Review Approvals <span style={{ color: "var(--text-dim)", fontWeight: 400 }}>({pendingReviews.length} pending)</span>
      </h2>

      {loading ? (
        <div style={{ color: "var(--text-dim)" }}>Loading…</div>
      ) : pendingReviews.length === 0 ? (
        <div style={{ color: "var(--text-dim)", background: "var(--panel)", border: "1px dashed var(--border)", borderRadius: 14, padding: 20 }}>
          No reviews waiting for approval.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {pendingReviews.map((r) => (
            <div key={r.id} style={{ background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 12, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, gap: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{r.stationName}</div>
                <Stars value={r.rating} size={14} />
              </div>
              <div style={{ fontSize: 13, color: "var(--text)", marginBottom: 6, whiteSpace: "pre-wrap" }}>{r.content}</div>
              <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 12 }}>{r.driverName} · {new Date(r.createdAt).toLocaleString()}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => decideReview(r.id, "approve")}
                  disabled={decidingId === r.id}
                  style={{ flex: 1, padding: "7px 0", borderRadius: 8, fontSize: 13, fontWeight: 600, border: "1px solid var(--border)", background: "var(--green-dim)", color: "var(--green)", cursor: "pointer", opacity: decidingId === r.id ? 0.6 : 1 }}
                >
                  Approve
                </button>
                <button
                  onClick={() => decideReview(r.id, "reject")}
                  disabled={decidingId === r.id}
                  style={{ flex: 1, padding: "7px 0", borderRadius: 8, fontSize: 13, fontWeight: 600, border: "1px solid var(--border)", background: "var(--red-dim)", color: "var(--red)", cursor: "pointer", opacity: decidingId === r.id ? 0.6 : 1 }}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
