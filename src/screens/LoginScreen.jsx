import { useState } from "react";
import { api } from "../api.js";
import { Icon } from "../components/Icon.jsx";

function Field({ label, value, onChange, type = "text" }) {
  return (
    <label style={{ display: "block", marginBottom: 12 }}>
      <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 5 }}>{label}</div>
      <input
        type={type} value={value} required
        onChange={(e) => onChange(e.target.value)}
        style={{ width: "100%", padding: "9px 11px", borderRadius: 9, border: "1px solid var(--border)", background: "var(--panel-2)", color: "var(--text)", outline: "none" }}
      />
    </label>
  );
}

export function LoginScreen({ onLoggedIn }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", licensePlate: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const path = mode === "login" ? "/auth/login" : "/auth/register";
    const { ok, data } = await api(path, { method: "POST", body: form });
    setBusy(false);
    if (ok && data?.token) {
      localStorage.setItem("ev_token", data.token);
      localStorage.setItem("ev_name", data.name);
      localStorage.setItem("ev_role", data.role);
      onLoggedIn(data.token, data.name, data.role);
    } else {
      // ASP.NET validation failures (400) put the reasons in `errors`, not `message`.
      const validationErrors = data?.errors ? Object.values(data.errors).flat().join(" ") : "";
      setError(data?.message || validationErrors || "Something went wrong. Is the API running?");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: 16 }}>
      <form onSubmit={submit} style={{ width: 340, maxWidth: "100%", background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 16, padding: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "var(--green-dim)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon.bolt style={{ width: 18, height: 18, color: "var(--green)" }} />
          </div>
          <div className="display" style={{ fontSize: 17, fontWeight: 700 }}>EV Charging</div>
        </div>

        {mode === "register" && (
          <>
            <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <Field label="License plate" value={form.licensePlate} onChange={(v) => setForm({ ...form, licensePlate: v })} />
          </>
        )}
        <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
        <Field label="Password" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} />

        {error && <div style={{ color: "var(--red)", fontSize: 13, marginBottom: 12 }}>{error}</div>}

        <button type="submit" disabled={busy} style={{ width: "100%", padding: "10px 0", borderRadius: 10, border: "none", background: "var(--green)", color: "#06110c", fontWeight: 700 }}>
          {busy ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
        </button>

        <div style={{ marginTop: 14, fontSize: 13, color: "var(--text-dim)", textAlign: "center" }}>
          {mode === "login" ? (
            <>No account? <a onClick={() => setMode("register")} style={{ color: "var(--blue)", cursor: "pointer" }}>Register</a></>
          ) : (
            <>Have an account? <a onClick={() => setMode("login")} style={{ color: "var(--blue)", cursor: "pointer" }}>Log in</a></>
          )}
        </div>
      </form>
    </div>
  );
}
