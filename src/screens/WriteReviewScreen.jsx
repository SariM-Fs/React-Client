import { useState, useEffect, useCallback } from "react";
import { api } from "../api.js";
import { Toast, Stars } from "../components/UI.jsx";

const STATUS_STYLE = {
  Pending: { bg: "var(--blue-dim)", fg: "var(--blue)" },
  Approved: { bg: "var(--green-dim)", fg: "var(--green)" },
  Rejected: { bg: "var(--red-dim)", fg: "var(--red)" },
};

export function WriteReviewScreen({ token, stations }) {
  const [myReviews, setMyReviews] = useState([]);
  const [loadingMine, setLoadingMine] = useState(true);
  const [toast, setToast] = useState(null);

  const [stationId, setStationId] = useState("");
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);

  const loadMine = useCallback(async () => {
    const { ok, data } = await api("/reviews/mine", { token });
    if (ok) setMyReviews(data);
    setLoadingMine(false);
  }, [token]);

  useEffect(() => { loadMine(); }, [loadMine]);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!stationId || !rating || !content.trim()) return;
    setPosting(true);
    const { ok, data } = await api("/reviews", {
      method: "POST", token, body: { stationId: Number(stationId), rating, content: content.trim() },
    });
    setPosting(false);
    if (ok) {
      setStationId(""); setRating(0); setContent("");
      setToast({ kind: "success", message: "Review submitted — waiting for admin approval." });
      loadMine();
    } else {
      setToast({ kind: "error", message: data?.message || "Could not submit review." });
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Write a Review</h2>

      <form onSubmit={submitReview} style={{ background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 14, padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>Share your experience</div>
        <select
          value={stationId}
          onChange={(e) => setStationId(e.target.value)}
          style={{ padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--panel-2)", color: "var(--text)", fontSize: 13 }}
        >
          <option value="">Select a station…</option>
          {(stations || []).map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <Stars value={rating} onChange={setRating} size={22} />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="How was your charging experience?"
          maxLength={1000}
          rows={3}
          style={{ padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--panel-2)", color: "var(--text)", fontSize: 13, resize: "vertical", fontFamily: "inherit" }}
        />
        <div>
          <button
            type="submit"
            disabled={posting || !stationId || !rating || !content.trim()}
            style={{
              padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: "1px solid var(--border)",
              background: "var(--green-dim)", color: "var(--green)", cursor: "pointer",
              opacity: posting || !stationId || !rating || !content.trim() ? 0.6 : 1,
            }}
          >
            {posting ? "Submitting…" : "Submit review"}
          </button>
        </div>
      </form>

      <div style={{ fontSize: 13, fontWeight: 600 }}>Your reviews</div>
      {loadingMine ? (
        <div style={{ color: "var(--text-dim)" }}>Loading…</div>
      ) : myReviews.length === 0 ? (
        <div style={{ color: "var(--text-dim)", background: "var(--panel)", border: "1px dashed var(--border)", borderRadius: 14, padding: 20 }}>
          You haven't written any reviews yet.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {myReviews.map((r) => {
            const st = STATUS_STYLE[r.status] || STATUS_STYLE.Pending;
            return (
              <div key={r.id} style={{ background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 12, padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{r.stationName}</div>
                  <span style={{ background: st.bg, color: st.fg, fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 999 }}>{r.status}</span>
                </div>
                <Stars value={r.rating} size={14} />
                <div style={{ fontSize: 13, color: "var(--text)", marginTop: 6, whiteSpace: "pre-wrap" }}>{r.content}</div>
                <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 8 }}>{new Date(r.createdAt).toLocaleString()}</div>
              </div>
            );
          })}
        </div>
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
