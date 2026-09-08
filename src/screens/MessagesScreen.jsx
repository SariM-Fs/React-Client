import { useState, useEffect, useCallback } from "react";
import { api } from "../api.js";
import { Icon } from "../components/Icon.jsx";
import { Toast } from "../components/UI.jsx";

export function MessagesScreen({ token, role }) {
  const isAdmin = role === "Admin";
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const loadMessages = useCallback(async () => {
    const { ok, data } = await api("/announcements", { token });
    if (ok) setMessages(data);
    setLoading(false);
  }, [token]);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  const postMessage = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setPosting(true);
    const { ok, data } = await api("/announcements", {
      method: "POST", token, body: { title: title.trim(), content: content.trim() },
    });
    setPosting(false);
    if (ok) {
      setTitle("");
      setContent("");
      setToast({ kind: "success", message: "Message posted." });
      loadMessages();
    } else {
      setToast({ kind: "error", message: data?.message || "Could not post message." });
    }
  };

  const deleteMessage = async (id) => {
    setDeletingId(id);
    const { ok, data } = await api(`/announcements/${id}`, { method: "DELETE", token });
    setDeletingId(null);
    if (ok) {
      setMessages((prev) => prev.filter((m) => m.id !== id));
      setToast({ kind: "success", message: "Message removed." });
    } else {
      setToast({ kind: "error", message: data?.message || "Could not remove message." });
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>
        Messages <span style={{ color: "var(--text-dim)", fontWeight: 400 }}>({messages.length})</span>
      </h2>

      {isAdmin && (
        <form onSubmit={postMessage} style={{ background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 14, padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Post a new update</div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            maxLength={100}
            style={{ padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--panel-2)", color: "var(--text)", fontSize: 13 }}
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What do drivers need to know?"
            maxLength={2000}
            rows={3}
            style={{ padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--panel-2)", color: "var(--text)", fontSize: 13, resize: "vertical", fontFamily: "inherit" }}
          />
          <div>
            <button
              type="submit"
              disabled={posting || !title.trim() || !content.trim()}
              style={{
                padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: "1px solid var(--border)",
                background: "var(--green-dim)", color: "var(--green)", cursor: "pointer",
                opacity: posting || !title.trim() || !content.trim() ? 0.6 : 1,
              }}
            >
              {posting ? "Posting…" : "Post message"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div style={{ color: "var(--text-dim)" }}>Loading messages…</div>
      ) : messages.length === 0 ? (
        <div style={{ color: "var(--text-dim)", background: "var(--panel)", border: "1px dashed var(--border)", borderRadius: 14, padding: 20 }}>
          No messages yet.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {messages.map((m) => (
            <div key={m.id} style={{ background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 12, padding: 16, display: "flex", gap: 12, justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: 12, flex: 1, minWidth: 0 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--blue-dim)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon.message style={{ width: 16, height: 16, color: "var(--blue)" }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{m.title}</div>
                  <div style={{ fontSize: 13, color: "var(--text)", marginTop: 4, whiteSpace: "pre-wrap" }}>{m.content}</div>
                  <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 8 }}>
                    {m.createdByName} · {new Date(m.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
              {isAdmin && (
                <button
                  onClick={() => deleteMessage(m.id)}
                  disabled={deletingId === m.id}
                  title="Remove message"
                  style={{
                    width: 32, height: 32, flexShrink: 0, borderRadius: 8, border: "1px solid var(--border)",
                    background: "var(--red-dim)", color: "var(--red)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                    opacity: deletingId === m.id ? 0.6 : 1,
                  }}
                >
                  <Icon.trash style={{ width: 15, height: 15 }} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
