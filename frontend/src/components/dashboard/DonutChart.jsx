import { useId } from "react";

/**
 * Generic donut chart built from conic-gradient — no chart library needed.
 *
 * segments: [{ label, value, color }]
 * centerLabel / centerValue / centerSub: text shown in the middle of the ring
 */
export default function DonutChart({
  segments,
  centerLabel,
  centerValue,
  centerSub,
  size = 220,
  thickness = 34,
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  const uid = useId();

  let cursor = 0;
  const stops = segments
    .map((s) => {
      const start = (cursor / total) * 360;
      cursor += s.value;
      const end = (cursor / total) * 360;
      return `${s.color} ${start}deg ${end}deg`;
    })
    .join(", ");

  return (
    <div
      role="img"
      aria-label={`${centerLabel}: ${centerValue}${centerSub ? " " + centerSub : ""}. ${segments
        .map((s) => `${s.label} ${s.value}`)
        .join(", ")}`}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `conic-gradient(${stops})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        flexShrink: 0,
      }}
    >
      {/* 2px surface ring separating adjacent fills from the hole */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          boxShadow: "inset 0 0 0 2px var(--viz-surface-1)",
        }}
        aria-hidden="true"
      />
      <div
        style={{
          width: size - thickness * 2,
          height: size - thickness * 2,
          borderRadius: "50%",
          background: "var(--viz-surface-1)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          boxShadow: "0 2px 10px rgba(11,11,11,0.06)",
        }}
      >
        {centerLabel && (
          <span className="text-xs font-medium text-[var(--viz-text-secondary)]">
            {centerLabel}
          </span>
        )}
        {centerValue && (
          <span className="text-xl font-bold text-[var(--viz-text-primary)] leading-tight">
            {centerValue}
          </span>
        )}
        {centerSub && (
          <span className="text-[11px] text-[var(--viz-text-secondary)]">
            {centerSub}
          </span>
        )}
      </div>
    </div>
  );
}