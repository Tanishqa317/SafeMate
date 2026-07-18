import { useEffect, useRef } from 'react';

/**
 * Master Plant Pulse Vector — a thin, hypnotic, continuously animated
 * ECG-style line drawn on a canvas. Used in the header HUD.
 */
export default function PulseVector({
  height = 40,
  stroke = 'rgba(0,255,170,0.4)',
  speed = 0.004,
}: {
  height?: number;
  stroke?: string;
  speed?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1;
      ctx.strokeStyle = stroke;
      ctx.beginPath();

      const mid = h / 2;
      const amp = h * 0.32;
      for (let x = 0; x <= w; x += 1) {
        const phase = tRef.current + x * 0.03;
        // Combine sines for organic rhythm + occasional spike
        const spike = Math.sin(phase * 0.3) > 0.97 ? Math.sin(phase * 8) * amp * 0.9 : 0;
        const y =
          mid +
          Math.sin(phase) * amp * 0.35 +
          Math.sin(phase * 2.3) * amp * 0.18 +
          Math.sin(phase * 0.7) * amp * 0.12 +
          spike;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      tRef.current += speed;
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [stroke, speed]);

  return <canvas ref={canvasRef} className="w-full" style={{ height }} />;
}
