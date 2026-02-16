import { motion } from "framer-motion";
import Header from "../components/layout/Header";
import type { MetricsData } from "../types/metrics";
import { getRatingColor, getRatingBadgeClass } from "../services/dataService";

interface DORAProps {
  data: MetricsData;
}

interface GaugeProps {
  value: number;
  max: number;
  label: string;
  displayValue: string;
  rating: string;
  description: string;
  benchmarks: { elite: string; high: string; medium: string; low: string };
  delay: number;
}

function Gauge({ value, max, label, displayValue, rating, description, benchmarks, delay }: GaugeProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const color = getRatingColor(rating);
  const badgeClass = getRatingBadgeClass(rating);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card-hover p-6"
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-dark-50">{label}</h3>
          <p className="text-xs text-dark-400 mt-1">{description}</p>
        </div>
        <span className={`badge ${badgeClass}`}>{rating.toUpperCase()}</span>
      </div>

      {/* Circular gauge */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-36 h-36">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="#21262D"
              strokeWidth="8"
            />
            {/* Progress arc */}
            <motion.circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${percentage * 2.64} ${264}`}
              initial={{ strokeDasharray: "0 264" }}
              animate={{ strokeDasharray: `${percentage * 2.64} 264` }}
              transition={{ duration: 1.5, delay: delay + 0.3, ease: "easeOut" }}
              opacity={0.8}
            />
            {/* Glow effect */}
            <motion.circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${percentage * 2.64} ${264}`}
              filter="blur(4px)"
              initial={{ strokeDasharray: "0 264" }}
              animate={{ strokeDasharray: `${percentage * 2.64} 264` }}
              transition={{ duration: 1.5, delay: delay + 0.3, ease: "easeOut" }}
              opacity={0.3}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold" style={{ color }}>
              {displayValue}
            </span>
          </div>
        </div>
      </div>

      {/* Benchmarks */}
      <div className="space-y-1.5">
        <p className="text-[10px] text-dark-500 uppercase tracking-wider font-medium mb-2">
          Industry Benchmarks
        </p>
        {Object.entries(benchmarks).map(([level, desc]) => (
          <div
            key={level}
            className={`flex items-center justify-between py-1.5 px-2.5 rounded-md text-xs ${
              rating === level ? "bg-dark-700/50" : ""
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: getRatingColor(level) }}
              />
              <span
                className={`font-medium ${
                  rating === level ? "text-dark-100" : "text-dark-500"
                }`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </span>
            </div>
            <span className={rating === level ? "text-dark-200" : "text-dark-600"}>
              {desc}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function DORA({ data }: DORAProps) {
  const dora = data.dora;

  return (
    <div>
      <Header
        title="DORA Metrics"
        subtitle="DevOps Research and Assessment — Industry-standard engineering performance metrics"
        generatedAt={data.generated_at}
      />

      {/* DORA Overview Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 mb-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-glow-purple opacity-30" />
        <div className="relative z-10">
          <h3 className="text-lg font-bold text-dark-50 mb-2">
            What are DORA Metrics?
          </h3>
          <p className="text-sm text-dark-300 max-w-3xl leading-relaxed">
            DORA metrics are the gold standard for measuring software delivery performance. 
            Developed by the DevOps Research and Assessment team (now part of Google Cloud), 
            these four key metrics predict software delivery performance and organizational performance.
            Teams are rated as <span className="text-accent-green font-medium">Elite</span>,{" "}
            <span className="text-accent-cyan font-medium">High</span>,{" "}
            <span className="text-accent-yellow font-medium">Medium</span>, or{" "}
            <span className="text-accent-red font-medium">Low</span> performers.
          </p>
        </div>
      </motion.div>

      {/* Gauge Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Gauge
          value={dora.deployment_frequency.value}
          max={10}
          label="🚀 Deployment Frequency"
          displayValue={`${dora.deployment_frequency.value}/wk`}
          rating={dora.deployment_frequency.rating}
          description="How often your team deploys code to production"
          benchmarks={{
            elite: "On-demand (multiple/day)",
            high: "1x per day to 1x per week",
            medium: "1x per week to 1x per month",
            low: "Less than 1x per month",
          }}
          delay={0.1}
        />

        <Gauge
          value={48 - Math.min(dora.lead_time_for_changes.value_hours, 48)}
          max={48}
          label="⏱️ Lead Time for Changes"
          displayValue={`${dora.lead_time_for_changes.value_hours}h`}
          rating={dora.lead_time_for_changes.rating}
          description="Time from code commit to running in production"
          benchmarks={{
            elite: "Less than 1 hour",
            high: "1 day to 1 week",
            medium: "1 week to 1 month",
            low: "More than 1 month",
          }}
          delay={0.2}
        />

        <Gauge
          value={20 - Math.min(dora.change_failure_rate.value_percent, 20)}
          max={20}
          label="💥 Change Failure Rate"
          displayValue={`${dora.change_failure_rate.value_percent}%`}
          rating={dora.change_failure_rate.rating}
          description="Percentage of deployments causing failures in production"
          benchmarks={{
            elite: "0% - 5%",
            high: "5% - 10%",
            medium: "10% - 15%",
            low: "More than 15%",
          }}
          delay={0.3}
        />

        <Gauge
          value={24 - Math.min(dora.mean_time_to_recovery.value_hours, 24)}
          max={24}
          label="🔧 Mean Time to Recovery"
          displayValue={`${dora.mean_time_to_recovery.value_hours}h`}
          rating={dora.mean_time_to_recovery.rating}
          description="How quickly your team recovers from failures"
          benchmarks={{
            elite: "Less than 1 hour",
            high: "Less than 1 day",
            medium: "1 day to 1 week",
            low: "More than 1 week",
          }}
          delay={0.4}
        />
      </div>
    </div>
  );
}

