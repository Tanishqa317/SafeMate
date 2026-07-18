import { motion } from 'framer-motion';

export default function PageHeader({
  code,
  title,
  subtitle,
  right,
}: {
  code: string;
  title: string;
  subtitle: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-6 mt-4 flex items-end justify-between gap-6">
      <div>
        <div className="hud-mono mb-2 text-[10px] tracking-[0.3em] text-mint glow-mint">{code}</div>
        <motion.h1
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ stiffness: 100, damping: 15 }}
          className="font-display text-[26px] font-semibold tracking-tight text-white"
        >
          {title}
        </motion.h1>
        <p className="mt-1 max-w-2xl text-[13px] font-light text-slate-400">{subtitle}</p>
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}
