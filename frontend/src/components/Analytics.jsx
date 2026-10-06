import { useEffect, useState } from "react";
import { getAnalytics } from "../api";

export default function Analytics() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const result = await getAnalytics();
        setData(result);
      } catch (err) {
        setError(err.message);
      }
    }

    loadAnalytics();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        Analytics
      </h1>

      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-6">
          {error}
        </div>
      )}

      {!data && !error && (
        <p className="text-slate-400">Loading analytics...</p>
      )}

      {data && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <pre className="whitespace-pre-wrap overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}