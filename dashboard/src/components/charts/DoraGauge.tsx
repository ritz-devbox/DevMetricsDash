import { motion } from 'framer-motion';
import { getDoraRatingColor, getDoraRatingLabel } from '../../services/dataService';

interface Props {
  label: string;
  value: string;
  rating: string;
  icon: string;
  delay?: number;
}

const ratingPercent: Record<string, number> = {
  elite: 100,
  high: 75,
  medium: 50,
  low: 25,
};

export default function DoraGauge({ label, value, rating, icon, delay = 0 }: Props) {
  const color = getDoraRatingColor(rating);
  const pct = ratingPercent[rating] || 50;
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="glass-card-hover p-6 flex flex-col items-center text-center"
    >
      {/* Gauge */}
      <div className="relative w-24 h-24 mb-4">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Background ring */}
          <circle cx="50" cy="50" r="40" fill="none" stroke="#21262d" strokeWidth="6" />
          {/* Progress ring */}
          <motion.circle
            cx="50" cy="50" r="40"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ delay: delay + 0.3, duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
            style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl">{icon}</span>
        </div>
      </div>

      {/* Label */}
      <h4 className="text-xs font-medium text-dark-300 uppercase tracking-wider mb-1">{label}</h4>
      <p className="text-lg font-bold text-dark-50 mb-1.5">{value}</p>
      <span
        className="badge"
        style={{
          background: `${color}15`,
          color: color,
          boxShadow: `0 0 0 1px ${color}30`,
        }}
      >
        {getDoraRatingLabel(rating)}
      </span>
    </motion.div>
  );
}

