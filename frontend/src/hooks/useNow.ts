import { useEffect, useState } from 'react';

/** Returns Date.now() updated on an interval. */
export function useNow(intervalMs = 50) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

/** Returns a smoothly drifting numeric value seeded by `seed`. */
export function useDrift(seed: number, amp = 1, speed = 0.5) {
  const [v, setV] = useState(seed);
  useEffect(() => {
    let raf = 0;
    let t = 0;
    const tick = () => {
      t += 0.016 * speed;
      setV(seed + Math.sin(t) * amp + Math.sin(t * 1.7) * amp * 0.4);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seed, amp, speed]);
  return v;
}
