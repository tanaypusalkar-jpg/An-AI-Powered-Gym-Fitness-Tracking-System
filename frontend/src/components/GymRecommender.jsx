import { useState } from "react";
import { getJSON } from "../api.js";

const MAHARASHTRA_LOCATIONS = [
  "Ahmednagar", "Akola", "Amravati", "Beed", "Bhandara", "Buldhana",
  "Chandrapur", "Chhatrapati Sambhajinagar", "Dharashiv", "Dhule",
  "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur",
  "Latur", "Mumbai", "Nagpur", "Nanded", "Nandurbar", "Nashik",
  "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli",
  "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim",
  "Yavatmal"
];

export default function GymRecommender() {
  const [city, setCity] = useState("Pune");
  const [customCity, setCustomCity] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const location = (customCity.trim() || city).trim();
    if (!location) {
      setError("Choose or enter a city or district in Maharashtra.");
      return;
    }

    setError("");
    setLoading(true);
    setResult(null);
    try {
      const data = await getJSON(
        `/gym-finder/search?city=${encodeURIComponent(location)}&limit=50`
      );
      setResult(data);
    } catch (err) {
      setError(err.message || "Couldn't load gyms. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mod-card">
      <div className="mod-header">
        <div
          className="mod-icon-wrap"
          style={{ background: "rgba(0,212,255,0.1)", borderColor: "rgba(0,212,255,0.3)" }}
        >
          🗺️
        </div>
        <div className="mod-header-text">
          <h1>Maharashtra Gym Finder</h1>
          <p>Discover mapped gyms by city or district across Maharashtra.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mod-row">
          <div className="mod-field">
            <label htmlFor="gym-finder-city">City or district</label>
            <select
              id="gym-finder-city"
              className="mod-input"
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setCustomCity("");
              }}
            >
              {MAHARASHTRA_LOCATIONS.map((location) => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>
          <div className="mod-field">
            <label htmlFor="gym-finder-custom">Or enter another location</label>
            <input
              id="gym-finder-custom"
              className="mod-input"
              value={customCity}
              onChange={(e) => setCustomCity(e.target.value)}
              placeholder="e.g. Hinjawadi, Pune"
              maxLength={100}
            />
          </div>
        </div>
        <button
          type="submit"
          className="mod-btn mod-btn-full"
          disabled={loading}
          style={{ background: "linear-gradient(135deg, #006080, var(--neon-cyan))" }}
        >
          {loading ? <><span className="spin" /> Searching mapped gyms...</> : "📍 Find Gyms Near This Location"}
        </button>
      </form>

      {error && <div className="mod-error" role="alert">⚠ {error}</div>}

      {result && (
        <section style={{ marginTop: 24 }} aria-live="polite">
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ marginBottom: 6 }}>
              {result.count} mapped {result.count === 1 ? "gym" : "gyms"} found
            </h2>
            <p style={{ opacity: 0.75, fontSize: 13 }}>
              {result.matched_location}
            </p>
          </div>

          {result.gyms.length > 0 ? (
            <div className="gym-cards">
              {result.gyms.map((gym) => (
                <article className="gym-card" key={gym.id}>
                  <h4>{gym.name}</h4>
                  <p>📍 {gym.address}</p>
                  {gym.phone && <p>☎ {gym.phone}</p>}
                  {gym.opening_hours && <p>🕒 {gym.opening_hours}</p>}
                  {gym.website && (
                    <p>
                      <a href={gym.website} target="_blank" rel="noreferrer">Website ↗</a>
                    </p>
                  )}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 12 }}>
                    <a href={gym.map_url} target="_blank" rel="noreferrer">View on map ↗</a>
                    <a href={gym.directions_url} target="_blank" rel="noreferrer">Directions ↗</a>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mod-result">
              No mapped gyms were found for this location. Try a nearby city or a more specific locality.
            </div>
          )}

          <p style={{ marginTop: 16, fontSize: 12, opacity: 0.7, lineHeight: 1.6 }}>
            {result.notice} Data source: OpenStreetMap contributors.
          </p>
        </section>
      )}
    </div>
  );
}
