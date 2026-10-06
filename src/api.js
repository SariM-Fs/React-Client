// ---------------------------------------------------------------
// Point this at your running API. Locally that's the `dotnet run`
// default; a deployed build sets VITE_API_BASE (e.g. on Render) to
// the hosted API, like https://<your-api>.onrender.com/api
// ---------------------------------------------------------------
export const API_BASE = import.meta.env.VITE_API_BASE || "https://localhost:7051/api";

// Flat rate shown to drivers on every station — not yet backed by a per-station
// price field on the server, so it's a single shared constant for now.
export const CHARGING_PRICE = 23;

export async function api(path, { method = "GET", body, token } = {}) {
  let res;
  try {
    res = await fetch(API_BASE + path, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: "Bearer " + token } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (networkError) {
    // Fetch throws (rather than resolving with a bad status) on CORS blocks,
    // an untrusted HTTPS cert, or the server being unreachable. Without this
    // catch, callers would hang forever waiting on this promise.
    return {
      ok: false,
      status: 0,
      data: { message: "Could not reach the API. Check that it's running, and check the browser console for a CORS or certificate error." },
    };
  }

  let data = null;
  try { data = await res.json(); } catch (e) { /* empty body */ }
  return { ok: res.ok, status: res.status, data };
}
