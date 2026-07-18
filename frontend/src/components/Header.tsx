import { Activity, ShieldCheck } from 'lucide-react';
import Logo from './Logo';
import PulseVector from './PulseVector';
import Chronometer from './Chronometer';
import { motion } from 'framer-motion';

export default function Header() {
  return (
    <header className="relative z-20 flex h-[72px] items-center justify-between gap-6 border-b border-edge bg-panel px-6 backdrop-blur-md">
      <Logo />
      <div className="flex flex-1 items-center gap-4 px-8">
        <span className="hud-label hidden whitespace-nowrap md:inline">MASTER PLANT PULSE</span>
        <div className="relative h-10 flex-1 overflow-hidden rounded">
          <PulseVector />
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            preserveAspectRatio="none"
            viewBox="0 0 400 40"
            fill="none"
          >
            <motion.path
              d="M0 20 L60 20 L70 20 L76 8 L82 32 L88 14 L94 20 L150 20 L160 20 L166 6 L172 34 L178 12 L184 20 L240 20 L250 20 L256 10 L262 30 L268 16 L274 20 L330 20 L340 20 L346 8 L352 32 L358 14 L364 20 L400 20"
              stroke="rgba(0,255,170,0.4)"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.4 }}
              transition={{ duration: 3, ease: 'easeInOut', repeat: Infinity, repeatType: 'loop' }}
            />
          </svg>
        </div>
        <div className="hidden items-center gap-2 lg:flex">
          <span className="hud-mono text-[10px] text-mint glow-mint">SYS·NOMINAL</span>
          <span className="h-1.5 w-1.5 rounded-full bg-mint glow-mint" />
        </div>
      </div>
      <div className="flex items-center gap-5">
        <div className="hidden items-center gap-2 border-r border-edge pr-5 md:flex">
          <ShieldCheck size={14} className="text-mint glow-mint" />
          <span className="hud-label text-slate-400">CHAIN·SEALED</span>
        </div>
        <Activity size={14} className="text-mint glow-mint" />
        <Chronometer />
      </div>
    </header>
  );
}
