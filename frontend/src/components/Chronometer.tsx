import { useEffect, useState } from 'react';

/** Live ticking system chronometer with millisecond precision. */
export default function Chronometer() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      setNow(Date.now());
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const d = new Date(now);
  const pad = (n: number, l = 2) => String(n).padStart(l, '0');
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(
    d.getMilliseconds(),
    3,
  )}`;
  const date = `${d.getUTCFullYear()}.${pad(d.getUTCMonth() + 1)}.${pad(d.getUTCDate())} UTC`;

  return (
    <div className="flex flex-col items-end leading-none">
      <div className="hud-mono text-[18px] font-medium tracking-wider text-white glow-mint">
        {time}
      </div>
      <div className="hud-mono mt-1 text-[9px] tracking-[0.2em] text-slate-500">{date}</div>
    </div>
  );
}
