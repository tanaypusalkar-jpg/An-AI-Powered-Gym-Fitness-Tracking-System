const API_BASE =
  import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

/**
 * Generic POST helper used by the existing components.
 */
export async function postJSON(path, payload) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const contentType = response.headers.get("content-type") || "";

  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "object" && data?.detail
        ? data.detail
        : typeof data === "string"
          ? data
          : `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return data;
}


/**
 * Generic GET helper.
 */
export async function getJSON(path) {
  const response = await fetch(`${API_BASE}${path}`);

  const contentType = response.headers.get("content-type") || "";

  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "object" && data?.detail
        ? data.detail
        : typeof data === "string"
          ? data
          : `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return data;
}


/**
 * Workout analysis.
 */
export function analyzeWorkout(payload) {
  return postJSON("/workout/analyze", payload);
}


/**
 * Performance analysis.
 */
export function calculatePerformance(payload) {
  return postJSON("/performance/analyze", payload);
}


/**
 * Analytics.
 */
export function getAnalytics() {
  return getJSON("/analytics/summary");
}


/**
 * Export API base URL if another component needs it.
 */
export { API_BASE };
