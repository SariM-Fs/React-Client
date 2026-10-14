import { useState } from "react";
import { api } from "../api.js";
import { Icon } from "../components/Icon.jsx";

const MIN_PASSWORD = 6;

function Field({ label, optional, value, onChange, type = "text", placeholder, hint, hintColor, error }) {
  return (
    <label style={{ display: "block", marginBottom: 12 }}>
      <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 5 }}>
        {label}
        {optional && <span style={{ opacity: 0.7 }}> (optional)</span>}
      </div>
      <input
        type={type} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%", padding: "9px 11px", borderRadius: 9, background: "var(--panel-2)", color: "var(--text)", outline: "none",
          border: `1px solid ${error ? "var(--red)" : "var(--border)"}`,
        }}
      />
      {(error || hint) && (
        <div style={{ fontSize: 11.5, marginTop: 5, color: error ? "var(--red)" : hintColor || "var(--text-dim)" }}>
          {error || hint}
        </div>
      )}
    </label>
  );
}

function validate(mode, form) {
  const errors = {};
  if (mode === "register" && form.name.trim().length < 2) errors.name = "Please enter your name.";
  if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errors.email = "Enter a valid email address.";
  if (mode === "register" && form.password.length < MIN_PASSWORD) errors.password = `Password must be at least ${MIN_PASSWORD} characters.`;
  if (mode === "login" && !form.password) errors.password = "Enter your password.";
  return errors;
}

export function LoginScreen({ onLoggedIn }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", licensePlate: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const update = (key) => (v) => {
    setForm({ ...form, [key]: v });
    if (fieldErrors[key]) setFieldErrors({ ...fieldErrors, [key]: undefined });
  };

  const switchMode = (m) => { setMode(m); setFieldErrors({}); setError(""); };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const errors = validate(mode, form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setBusy(true);
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

  // Live password hint while registering: counts down, then turns green.
  const missing = MIN_PASSWORD - form.password.length;
  const passwordHint = mode !== "register" ? null
    : form.password.length === 0 ? `At least ${MIN_PASSWORD} characters`
    : missing > 0 ? `${missing} more character${missing === 1 ? "" : "s"}`
    : "✓ Looks good";

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: 16 }}>
      <form onSubmit={submit} noValidate style={{ width: 340, maxWidth: "100%", background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 16, padding: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "var(--green-dim)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon.bolt style={{ width: 18, height: 18, color: "var(--green)" }} />
          </div>
          <div className="display" style={{ fontSize: 17, fontWeight: 700 }}>EV Charging</div>
        </div>

        {mode === "register" && (
          <>
            <Field label="Full name" placeholder="Israel Israeli" value={form.name} onChange={update("name")} error={fieldErrors.name} />
            <Field
              label="License plate" optional placeholder="12-345-67"
              value={form.licensePlate} onChange={update("licensePlate")}
              hint="Your car's plate number"
            />
          </>
        )}
        <Field label="Email" type="email" placeholder="name@example.com" value={form.email} onChange={update("email")} error={fieldErrors.email} />
        <Field
          label="Password" type="password"
          placeholder={mode === "register" ? `At least ${MIN_PASSWORD} characters` : ""}
          value={form.password} onChange={update("password")}
          error={fieldErrors.password}
          hint={passwordHint}
          hintColor={mode === "register" && missing <= 0 ? "var(--green)" : undefined}
        />

        {error && <div style={{ color: "var(--red)", fontSize: 13, marginBottom: 12 }}>{error}</div>}

        <button type="submit" disabled={busy} style={{ width: "100%", padding: "10px 0", borderRadius: 10, border: "none", background: "var(--green)", color: "#06110c", fontWeight: 700 }}>
          {busy ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
        </button>

        <div style={{ marginTop: 14, fontSize: 13, color: "var(--text-dim)", textAlign: "center" }}>
          {mode === "login" ? (
            <>No account? <a onClick={() => switchMode("register")} style={{ color: "var(--blue)", cursor: "pointer" }}>Register</a></>
          ) : (
            <>Have an account? <a onClick={() => switchMode("login")} style={{ color: "var(--blue)", cursor: "pointer" }}>Log in</a></>
          )}
        </div>
      </form>
    </div>
  );
}
