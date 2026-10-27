import { useEffect, useRef, useState } from "react";

/**
 * Animates a number from its previous value to the new one.
 * Usage: <CountUp value={2046} />
 */
export default function CountUp({ value, duration = 700, decimals = 0 }) {
  const [shown, setShown] = useState(0);
  const from = useRef(0);

  useEffect(() => {
    const target = Number(value) || 0;
    const start = performance.now();
    const begin = from.current;
    let raf;

    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out
      const current = begin + (target - begin) * eased;
      setShown(current);
      if (t < 1) raf = requestAnimationFrame(tick);
      else from.current = target;
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <>{shown.toFixed(decimals)}</>;
}