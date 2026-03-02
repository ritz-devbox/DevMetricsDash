import { motion } from 'framer-motion';
import type { MetricsData } from '../types/metrics';
import PageWrapper, { fadeInUp } from '../components/layout/PageWrapper';
import GlassCard from '../components/dashboard/GlassCard';
import DoraGauge from '../components/charts/DoraGauge';
import { getDoraRatingColor } from '../services/dataService';

interface DoraPageProps {
  data: MetricsData;
}

export default function DoraMetrics({ data }: DoraPageProps) {
  const { dora } = data;

  const metrics = [
    {
      label: 'Deployment Frequency',
      value: dora.deployment_frequency.value + '/week',
      rating: dora.deployment_frequency.rating,
      icon: 'DF',
      description: 'How often your team deploys code to production.',
      benchmarks: { elite: 'Multiple/day', high: '1-7/week', medium: '1-4/month', low: 'Less than 1/month' },
    },
    {
      label: 'Lead Time for Changes',
      value: dora.lead_time_for_changes.value_hours + 'h',
      rating: dora.lead_time_for_changes.rating,
      icon: 'LT',
      description: 'Time from code commit to running in production.',
      benchmarks: { elite: 'Under 1 hour', high: '1 day - 1 week', medium: '1-6 months', low: 'Over 6 months' },
    },
    {
      label: 'Change Failure Rate',
      value: dora.change_failure_rate.value_percent + '%',
      rating: dora.change_failure_rate.rating,
      icon: 'CF',
      description: 'Percentage of deployments causing a failure in production.',
      benchmarks: { elite: '0-5%', high: '5-10%', medium: '10-15%', low: 'Over 15%' },
    },
    {
      label: 'Mean Time to Recovery',
      value: dora.mean_time_to_recovery.value_hours + 'h',
      rating: dora.mean_time_to_recovery.rating,
      icon: 'MR',
      description: 'How quickly your team can recover from a production failure.',
      benchmarks: { elite: 'Under 1 hour', high: 'Under 1 day', medium: 'Under 1 week', low: 'Over 1 week' },
    },
  ];

  return (
    <PageWrapper
      title="DORA Metrics"
      subtitle="Industry-standard engineering performance metrics"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {metrics.map((m, i) => (
          <DoraGauge
            key={m.label}
            label={m.label}
            value={m.value}
            rating={m.rating}
            icon={m.icon}
            delay={i * 0.1}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {metrics.map((m, i) => (
          <motion.div key={m.label} variants={fadeInUp}>
            <GlassCard className="p-6" delay={0.3 + i * 0.08}>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-dark-700/50 text-sm font-bold text-accent-purple flex-shrink-0">
                  {m.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-dark-100">{m.label}</h3>
                    <span
                      className="badge"
                      style={{
                        background: getDoraRatingColor(m.rating) + '15',
                        color: getDoraRatingColor(m.rating),
                        boxShadow: '0 0 0 1px ' + getDoraRatingColor(m.rating) + '30',
                      }}
                    >
                      {m.rating}
                    </span>
                  </div>
                  <p className="text-xs text-dark-400 leading-relaxed mb-4">{m.description}</p>

                  <div className="space-y-1.5">
                    <p className="text-[10px] text-dark-500 uppercase tracking-wider font-medium">Benchmarks</p>
                    {Object.entries(m.benchmarks).map(([level, benchmark]) => {
                      const isActive = level === m.rating;
                      const color = getDoraRatingColor(level);
                      return (
                        <div key={level} className="flex items-center gap-3">
                          <div
                            className={'h-1.5 w-1.5 rounded-full transition-all ' + (isActive ? 'ring-2 ring-offset-1 ring-offset-dark-800' : '')}
                            style={{ background: color }}
                          />
                          <span className={'text-[11px] capitalize w-14 ' + (isActive ? 'text-dark-100 font-semibold' : 'text-dark-500')}>
                            {level}
                          </span>
                          <span className={'text-[11px] font-mono ' + (isActive ? 'text-dark-200' : 'text-dark-500')}>
                            {benchmark}
                          </span>
                          {isActive && (
                            <motion.span
                              initial={{ opacity: 0, x: -5 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="text-[9px] font-medium ml-auto px-1.5 py-0.5 rounded"
                              style={{ background: color + '20', color: color }}
                            >
                              YOU
                            </motion.span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </PageWrapper>
  );
}

