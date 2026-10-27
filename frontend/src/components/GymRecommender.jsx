import { useState } from "react";
import { getJSON } from "../api.js";

const SUPPORTED_CITIES = [
  "Pune",
  "Mumbai",
  "Nagpur",
  "Nashik",
  "Bengaluru",
  "Hyderabad",
  "Chennai",
  "Delhi",
  "Kolkata",
  "Ahmedabad",
  "Surat",
  "Jaipur",
  "Lucknow",
  "Indore",
  "Bhopal",
];

export default function GymRecommender() {
  const [city, setCity] = useState("Pune");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!SUPPORTED_CITIES.includes(city)) {
      setError("Please choose one of the 15 supported cities.");
      return;
    }

    setError("");
    setLoading(true);
    setResult(null);
    try {
      const data = await getJSON(
        `/gym-finder/search?city=${encodeURIComponent(city)}&limit=50`
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
          <h1>City Gym Finder</h1>
          <p>Find mapped gyms in 15 selected cities across India.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mod-row">
          <div className="mod-field">
            <label htmlFor="gym-finder-city">Select city</label>
            <select
              id="gym-finder-city"
              className="mod-input"
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setResult(null);
                setError("");
              }}
            >
              {SUPPORTED_CITIES.map((location) => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          type="submit"
          className="mod-btn mod-btn-full"
          disabled={loading}
          style={{ background: "linear-gradient(135deg, #006080, var(--neon-cyan))" }}
        >
          {loading ? <><span className="spin" /> Searching gyms in {city}...</> : "📍 Find Gyms"}
        </button>
      </form>

      {error && <div className="mod-error" role="alert">⚠ {error}</div>}

      {result && (
        <section style={{ marginTop: 24 }} aria-live="polite">
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ marginBottom: 6 }}>
             {result.service_status === "temporarily_unavailable"
                 ? `Gym search temporarily unavailable in ${result.city}`
                 : `${result.count} mapped ${
                 result.count === 1 ? "gym" : "gyms"
                 } found in ${result.city}`}
            </h2>
            <p style={{ opacity: 0.75, fontSize: 13 }}>
              {result.matched_location}
            </p>
          </div>

          {result.service_status === "temporarily_unavailable" ? (
            <div className="mod-result" role="status">
              {result.notice}{" "}
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`gyms in ${result.city}, India`)}`} target="_blank" rel="noreferrer">Search {result.city} gyms on Google Maps ↗</a>
            </div>
          ) : result.gyms.length > 0 ? (
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
              No mapped gyms were found in {result.city}. Try again later; community-mapped data may be incomplete.
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
