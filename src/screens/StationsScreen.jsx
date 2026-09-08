import { StationCard } from "../components/StationCard.jsx";

export function StationsScreen({ stations, loading, onSelectStation }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>
        Stations <span style={{ color: "var(--text-dim)", fontWeight: 400 }}>({stations.length})</span>
      </h2>

      {loading ? (
        <div style={{ color: "var(--text-dim)" }}>Loading stations…</div>
      ) : stations.length === 0 ? (
        <div style={{ color: "var(--text-dim)", background: "var(--panel)", border: "1px dashed var(--border)", borderRadius: 14, padding: 20 }}>
          No stations yet — seed some in the database.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
          {stations.map((s) => (
            <StationCard key={s.id} station={s} onSelect={onSelectStation} />
          ))}
        </div>
      )}
    </div>
  );
}