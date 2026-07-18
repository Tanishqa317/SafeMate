import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  Waves,
  Layers3,
  History,
  Brain,
  Map,
  BellOff,
  Link2,
  ClipboardCheck,
} from 'lucide-react';

const routes = [
  { to: '/', label: 'Core Vitals', icon: Activity, code: 'VIT' },
  { to: '/vibration-dna', label: 'Vibration DNA', icon: Waves, code: 'VIB' },
  { to: '/swiss-cheese', label: 'Swiss Cheese', icon: Layers3, code: 'SWC' },
  { to: '/replay', label: 'Counterfactual', icon: History, code: 'RPL' },
  { to: '/oracle-swarm', label: 'Oracle Swarm', icon: Brain, code: 'ORA' },
  { to: '/evacuation', label: 'Evacuation', icon: Map, code: 'EVC' },
  { to: '/alarm-fatigue', label: 'Alarm Fatigue', icon: BellOff, code: 'ALM' },
  { to: '/evidence-chain', label: 'Evidence Chain', icon: Link2, code: 'EVD' },
  { to: '/compliance', label: 'Compliance', icon: ClipboardCheck, code: 'CMP' },
];

export default function Sidebar() {
  return (
    <aside className="relative z-30 flex w-[68px] flex-col items-center gap-1 border-r border-edge bg-panel py-4 backdrop-blur-md">
      {routes.map((r) => (
        <NavLink key={r.to} to={r.to} end={r.to === '/'}>
          {({ isActive }) => (
            <motion.div
              whileHover={{ x: 1 }}
              transition={{ stiffness: 100, damping: 15 }}
              className="group relative flex h-12 w-12 flex-col items-center justify-center rounded-md"
              style={{
                color: isActive ? '#ffffff' : 'rgba(255,255,255,0.3)',
                background: isActive ? 'rgba(0,255,170,0.06)' : 'transparent',
              }}
            >
              {isActive && (
                <motion.span
                  layoutId="active-route-bar"
                  className="absolute left-[-12px] top-1/2 h-7 w-[2px] -translate-y-1/2 rounded-full bg-mint"
                  style={{ boxShadow: '0 0 10px rgba(0,255,170,0.8)' }}
                  transition={{ stiffness: 100, damping: 15 }}
                />
              )}
              <r.icon size={18} className={isActive ? 'glow-mint' : ''} />
              <span className="hud-mono mt-1 text-[8px] tracking-wider">{r.code}</span>
              <div className="pointer-events-none absolute left-[60px] top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded border border-edge bg-obsidian/95 px-2.5 py-1 text-[10px] font-medium tracking-wider text-white opacity-0 shadow-lg backdrop-blur-md transition-opacity duration-200 group-hover:opacity-100">
                {r.label}
              </div>
            </motion.div>
          )}
        </NavLink>
      ))}
    </aside>
  );
}
