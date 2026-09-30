import DonutChart from "../components/dashboard/DonutChart";

/**
 * Weekly activity breakdown — modeled on the "Storage Details" reference
 * mock, repurposed for workout time instead of disk usage.
 *
 * Colors come from the validated categorical palette in the dataviz skill
 * (references/palette.md), used in ring order so every adjacent wedge pair
 * clears the colorblind-safety gate. Swap `SEGMENTS` for real numbers from
 * your backend (e.g. GET /analytics/weekly) whenever that endpoint exists.
 */

const SEGMENTS = [
  { key: "strength", label: "Strength Training", sub: "5 sessions", value: 3.5, color: "var(--viz-series-1)" },
  { key: "cardio", label: "Cardio", sub: "4 sessions", value: 2, color: "var(--viz-series-2)" },
  { key: "habit", label: "Habit Streaks", sub: "12 check-ins", value: 1.5, color: "var(--viz-series-3)" },
  { key: "diet", label: "Diet Logged", sub: "18 meals", value: 1, color: "var(--viz-series-4)" },
  { key: "other", label: "Other Activity", sub: "Stretching, walks", value: 0.5, color: "var(--viz-series-5)" },
];

export default function ProgressDetails({ onBack }) {
  const totalHours = SEGMENTS.reduce((sum, s) => sum + s.value, 0);
  const goalHours = 10;

  return (
    <div
      className="viz-root min-h-screen pb-10"
      style={{ background: "var(--viz-page)" }}
    >
      {/* Palette slots scoped to this screen — see dataviz skill references/palette.md */}
      <style>{`
        .viz-root {
          color-scheme: light;
          --viz-page: #f9f9f7;
          --viz-surface-1: #fcfcfb;
          --viz-text-primary: #0b0b0b;
          --viz-text-secondary: #52514e;
          --viz-series-1: #2a78d6; /* blue */
          --viz-series-2: #eb6834; /* orange */
          --viz-series-3: #1baf7a; /* aqua */
          --viz-series-4: #eda100; /* yellow */
          --viz-series-5: #e87ba4; /* magenta */
        }
        @media (prefers-color-scheme: dark) {
          :root:where(:not([data-theme="light"])) .viz-root {
            color-scheme: dark;
            --viz-page: #0d0d0d;
            --viz-surface-1: #1a1a19;
            --viz-text-primary: #ffffff;
            --viz-text-secondary: #c3c2b7;
            --viz-series-1: #3987e5;
            --viz-series-2: #d95926;
            --viz-series-3: #199e70;
            --viz-series-4: #c98500;
            --viz-series-5: #d55181;
          }
        }
        :root[data-theme="dark"] .viz-root {
          color-scheme: dark;
          --viz-page: #0d0d0d;
          --viz-surface-1: #1a1a19;
          --viz-text-primary: #ffffff;
          --viz-text-secondary: #c3c2b7;
          --viz-series-1: #3987e5;
          --viz-series-2: #d95926;
          --viz-series-3: #199e70;
          --viz-series-4: #c98500;
          --viz-series-5: #d55181;
        }
      `}</style>

      <div className="mx-auto max-w-md px-5 pt-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
          >
            ‹
          </button>
          <h1
            className="text-lg font-bold"
            style={{ color: "var(--viz-text-primary)" }}
          >
            Progress Details
          </h1>
        </div>

        {/* Donut */}
        <div className="mb-8 flex flex-col items-center">
          <DonutChart
            segments={SEGMENTS}
            centerLabel="This week"
            centerValue={`${totalHours} hrs`}
            centerSub={`of ${goalHours} hr goal`}
          />
        </div>

        {/* Legend / breakdown list */}
        <ul className="space-y-4">
          {SEGMENTS.map((s) => (
            <li key={s.key} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className="mt-0.5 h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: s.color }}
                  aria-hidden="true"
                />
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--viz-text-primary)" }}
                  >
                    {s.label}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "var(--viz-text-secondary)" }}
                  >
                    {s.sub}
                  </p>
                </div>
              </div>
              <span
                className="text-sm font-semibold"
                style={{ color: "var(--viz-text-primary)" }}
              >
                {s.value} hr
              </span>
            </li>
          ))}
        </ul>

        {/* Table-view fallback for accessibility, hidden visually */}
        <table className="sr-only">
          <caption>Weekly activity breakdown by category</caption>
          <thead>
            <tr>
              <th>Category</th>
              <th>Detail</th>
              <th>Hours</th>
            </tr>
          </thead>
          <tbody>
            {SEGMENTS.map((s) => (
              <tr key={s.key}>
                <td>{s.label}</td>
                <td>{s.sub}</td>
                <td>{s.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}