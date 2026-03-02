import { motion } from 'framer-motion';
import { formatNumber } from '../../services/dataService';
import { useCountUp } from '../../hooks/useCountUp';

interface Props {
  label: string;
  value: number | string;
  icon: string;
  color: 'purple' | 'cyan' | 'green' | 'yellow' | 'pink' | 'orange';
  suffix?: string;
  trend?: number;
  delay?: number;
}

const colorMap = {
  purple: 'text-accent-purple bg-accent-purple/10',
  cyan: 'text-accent-cyan bg-accent-cyan/10',
  green: 'text-accent-green bg-accent-green/10',
  yellow: 'text-accent-yellow bg-accent-yellow/10',
  pink: 'text-accent-pink bg-accent-pink/10',
  orange: 'text-accent-orange bg-accent-orange/10',
};

export default function StatCard({ label, value, icon, color, suffix, trend, delay = 0 }: Props) {
  const numericValue = typeof value === 'number' ? value : 0;
  const animatedValue = useCountUp(numericValue, 1200, delay * 1000 + 200);
  const displayValue = typeof value === 'number' ? formatNumber(animatedValue) : value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] }}
      className={`stat-card ${color}`}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-wider text-dark-400 mb-2">
            {label}
          </p>
          <div className="flex items-baseline gap-1.5">
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: delay + 0.2, duration: 0.4, type: 'spring', stiffness: 200 }}
              className="text-2xl font-bold tracking-tight text-dark-50"
            >
              {displayValue}
            </motion.span>
            {suffix && (
              <span className="text-xs text-dark-400 font-medium">{suffix}</span>
            )}
          </div>
          {trend !== undefined && (
            <div className={`mt-2 flex items-center gap-1 text-xs font-medium ${trend >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
              <span>{trend >= 0 ? '↑' : '↓'}</span>
              <span>{Math.abs(trend)}%</span>
              <span className="text-dark-500 ml-1">vs last period</span>
            </div>
          )}
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colorMap[color]} flex-shrink-0`}>
          <span className="text-lg">{icon}</span>
        </div>
      </div>
    </motion.div>
  );
}

