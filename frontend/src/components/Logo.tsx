import { motion } from 'framer-motion';

export default function Logo({ size = 36 }: { size?: number }) {
  return (
    <div className="flex items-center gap-3">
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ stiffness: 100, damping: 15 }}
      >
        {/* Wireframe shield */}
        <motion.path
          d="M24 3 L42 10 V24 C42 34 34 42 24 45 C14 42 6 34 6 24 V10 Z"
          stroke="#00ffaa"
          strokeWidth="1"
          fill="rgba(0,255,170,0.04)"
          style={{ filter: 'drop-shadow(0 0 6px rgba(0,255,170,0.35))' }}
        />
        <path
          d="M24 7 L38 12 V24 C38 31 32 38 24 41 C16 38 10 31 10 24 V12 Z"
          stroke="rgba(0,255,170,0.25)"
          strokeWidth="0.5"
          fill="none"
        />
        {/* ECG heartbeat wave inside shield */}
        <motion.path
          d="M12 25 L18 25 L20 19 L22 31 L25 14 L28 35 L30 25 L36 25"
          stroke="#00ffaa"
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: 'drop-shadow(0 0 4px rgba(0,255,170,0.6))' }}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.6, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }}
        />
      </motion.svg>
      <div className="flex flex-col leading-none">
        <span className="font-display text-[15px] font-semibold tracking-[0.18em] text-white">
          SAFE<span className="text-mint">MATE</span>
        </span>
        <span className="mt-1 text-[9px] font-light tracking-[0.2em] text-slate-500">
          WATCHING OVER EVERY SHIFT.
        </span>
      </div>
    </div>
  );
}
