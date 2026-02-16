import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface StatCardProps {
  icon: string;
  label: string;
  value: number | string;
  suffix?: string;
  trend?: { value: number; label: string };
  color: "purple" | "cyan" | "green" | "yellow" | "pink" | "orange";
  delay?: number;
  animate?: boolean;
}

const colorMap = {
  purple: { text: "text-accent-purple", bg: "bg-accent-purple/10" },
  cyan: { text: "text-accent-cyan", bg: "bg-accent-cyan/10" },
  green: { text: "text-accent-green", bg: "bg-accent-green/10" },
  yellow: { text: "text-accent-yellow", bg: "bg-accent-yellow/10" },
  pink: { text: "text-accent-pink", bg: "bg-accent-pink/10" },
  orange: { text: "text-accent-orange", bg: "bg-accent-orange/10" },
};

export default function StatCard({
  icon,
  label,
  value,
  suffix,
  trend,
  color,
  delay = 0,
  animate = true,
}: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(animate ? 0 : value);
  const colors = colorMap[color];

  useEffect(() => {
    if (!animate || typeof value !== "number") {
      setDisplayValue(value);
      return;
    }

    const duration = 1500;
    const steps = 60;
    const stepDuration = duration / steps;
    let current = 0;

    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        current++;
        const progress = current / steps;
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        setDisplayValue(Math.round(eased * (value as number)));

        if (current >= steps) {
          clearInterval(interval);
          setDisplayValue(value);
        }
      }, stepDuration);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay, animate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay / 1000 }}
      className={`stat-card ${color}`}
    >
      <div className="flex items-start justify-between">
        <div
          className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center text-xl`}
        >
          {icon}
        </div>
        {trend && (
          <span
            className={`text-xs font-medium ${
              trend.value >= 0 ? "text-accent-green" : "text-accent-red"
            }`}
          >
            {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}%
            <span className="text-dark-400 ml-1">{trend.label}</span>
          </span>
        )}
      </div>
      <div className="mt-4">
        <div className={`text-3xl font-bold ${colors.text} tracking-tight`}>
          {typeof displayValue === "number"
            ? displayValue.toLocaleString()
            : displayValue}
          {suffix && (
            <span className="text-lg text-dark-400 ml-1">{suffix}</span>
          )}
        </div>
        <p className="text-sm text-dark-300 mt-1 font-medium">{label}</p>
      </div>
    </motion.div>
  );
}

