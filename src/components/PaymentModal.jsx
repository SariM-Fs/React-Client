import { useState } from "react";

export function PaymentModal({ spot, onClose, onConfirm, busy }) {
  const [method, setMethod] = useState(null); // "CreditCard" | "Bit"
  const [cardNumber, setCardNumber] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");

  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear + 1, currentYear + 2, currentYear + 3];

  const submit = (e) => {
    e.preventDefault();
    setError("");

    if (method === "CreditCard") {
      if (!/^\d{13,19}$/.test(cardNumber)) {
        setError("Enter a valid card number (13-19 digits).");
        return;
      }
      if (!expiryMonth || !expiryYear) {
        setError("Select an expiry date.");
        return;
      }
      if (!/^\d{5,9}$/.test(nationalId)) {
        setError("Enter a valid ID number.");
        return;
      }
      onConfirm({ method: "CreditCard", cardNumber, nationalId });
    } else if (method === "Bit") {
      if (!/^0\d{8,9}$/.test(phoneNumber)) {
        setError("Enter a valid phone number.");
        return;
      }
      onConfirm({ method: "Bit", phoneNumber });
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.6)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
    }}>
      <div style={{ width: 360, background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 16, padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Pay for spot #{spot.spotNumber}</h3>
        </div>

        {!method ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button onClick={() => setMethod("CreditCard")} style={payMethodBtnStyle}>💳 Credit Card</button>
            <button onClick={() => setMethod("Bit")} style={payMethodBtnStyle}>📱 Bit</button>
          </div>
        ) : (
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {method === "CreditCard" ? (
              <>
                <Field label="Card number" value={cardNumber} onChange={setCardNumber} placeholder="4580123456789012" />
                <div style={{ display: "flex", gap: 8 }}>
                  <label style={{ flex: 1 }}>
                    <div style={labelStyle}>Month</div>
                    <select value={expiryMonth} onChange={(e) => setExpiryMonth(e.target.value)} style={inputStyle}>
                      <option value="">MM</option>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <option key={m} value={m}>{String(m).padStart(2, "0")}</option>
                      ))}
                    </select>
                  </label>
                  <label style={{ flex: 1 }}>
                    <div style={labelStyle}>Year</div>
                    <select value={expiryYear} onChange={(e) => setExpiryYear(e.target.value)} style={inputStyle}>
                      <option value="">YYYY</option>
                      {years.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <Field label="National ID" value={nationalId} onChange={setNationalId} placeholder="123456789" />
              </>
            ) : (
              <Field label="Phone number" value={phoneNumber} onChange={setPhoneNumber} placeholder="0501234567" />
            )}

            {error && <div style={{ color: "var(--red)", fontSize: 13 }}>{error}</div>}

            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button type="button" onClick={() => setMethod(null)} style={{ ...payMethodBtnStyle, flex: 1 }}>Back</button>
              <button type="submit" disabled={busy} style={{ ...payMethodBtnStyle, flex: 1, background: "var(--green)", color: "#06110c", border: "none" }}>
                {busy ? "Processing…" : "Confirm payment"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <label>
      <div style={labelStyle}>{label}</div>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} />
    </label>
  );
}

const labelStyle = { fontSize: 12, color: "var(--text-dim)", marginBottom: 5 };
const inputStyle = { width: "100%", padding: "9px 11px", borderRadius: 9, border: "1px solid var(--border)", background: "var(--panel-2)", color: "var(--text)", outline: "none" };
const payMethodBtnStyle = { padding: "11px 0", borderRadius: 10, border: "1px solid var(--border)", background: "var(--panel-2)", color: "var(--text)", fontWeight: 600, fontSize: 14 };