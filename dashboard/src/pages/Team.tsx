import { motion } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import type { MetricsData } from '../types/metrics';
import PageWrapper, { fadeInUp } from '../components/layout/PageWrapper';
import GlassCard from '../components/dashboard/GlassCard';
import { formatNumber, timeAgo } from '../services/dataService';

interface Props {
  data: MetricsData;
}

export default function Team({ data }: Props) {
  const { contributors } = data;

  // Sort by total activity
  const sorted = [...contributors].sort((a, b) =>
    (b.total_commits + b.total_prs + b.total_reviews) - (a.total_commits + a.total_prs + a.total_reviews)
  );

  // Calculate max values for normalization
  const maxCommits = Math.max(...contributors.map(c => c.total_commits));
  const maxPRs = Math.max(...contributors.map(c => c.total_prs));
  const maxReviews = Math.max(...contributors.map(c => c.total_reviews));
  const maxIssues = Math.max(...contributors.map(c => c.total_issues));
  const maxActiveDays = Math.max(...contributors.map(c => c.active_days));

  function getRadarData(c: typeof contributors[0]) {
    return [
      { skill: 'Commits', value: (c.total_commits / maxCommits) * 100 },
      { skill: 'PRs', value: (c.total_prs / maxPRs) * 100 },
      { skill: 'Reviews', value: (c.total_reviews / maxReviews) * 100 },
      { skill: 'Issues', value: (c.total_issues / (maxIssues || 1)) * 100 },
      { skill: 'Active', value: (c.active_days / maxActiveDays) * 100 },
    ];
  }

  const colors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#f97316'];

  return (
    <PageWrapper
      title="Team"
      subtitle={`${contributors.length} contributors active in the last ${data.config.lookback_days} days`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {sorted.map((contributor, i) => {
          const color = colors[i % colors.length];
          const radarData = getRadarData(contributor);

          return (
            <motion.div key={contributor.username} variants={fadeInUp}>
              <GlassCard className="p-5" hover delay={i * 0.06}>
                {/* Header */}
                <div className="flex items-center gap-4 mb-5">
                  <div className="relative">
                    <img
                      src={contributor.avatar_url}
                      alt={contributor.username}
                      className="h-14 w-14 rounded-full ring-2 ring-dark-600/50"
                    />
                    <div
                      className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-dark-800 flex items-center justify-center text-[8px]"
                      style={{ background: color }}
                    >
                      {i + 1}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-dark-50 truncate">{contributor.username}</h3>
                    <p className="text-[11px] text-dark-400">
                      Active {contributor.active_days} days · Last active {timeAgo(contributor.last_commit_date)}
                    </p>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[
                    { label: 'Commits', value: contributor.total_commits },
                    { label: 'PRs', value: contributor.total_prs },
                    { label: 'Reviews', value: contributor.total_reviews },
                    { label: 'Issues', value: contributor.total_issues },
                  ].map(s => (
                    <div key={s.label} className="bg-dark-700/30 rounded-lg p-2 text-center">
                      <p className="text-sm font-bold text-dark-50 font-mono">{formatNumber(s.value)}</p>
                      <p className="text-[9px] text-dark-500 uppercase tracking-wider mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Radar Chart */}
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                      <PolarGrid stroke="#21262d" />
                      <PolarAngleAxis
                        dataKey="skill"
                        tick={{ fontSize: 9, fill: '#8b949e' }}
                        tickLine={false}
                      />
                      <Radar
                        dataKey="value"
                        stroke={color}
                        fill={color}
                        fillOpacity={0.15}
                        strokeWidth={2}
                        dot={{ r: 3, fill: color, stroke: '#0d1117', strokeWidth: 1 }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Code Impact */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-dark-600/20">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-accent-green font-mono font-semibold">+{formatNumber(contributor.additions)}</span>
                    <span className="text-accent-red font-mono font-semibold">-{formatNumber(contributor.deletions)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-dark-400">
                    <span>Net:</span>
                    <span className={`font-mono font-semibold ${contributor.additions - contributor.deletions >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                      {contributor.additions - contributor.deletions >= 0 ? '+' : ''}{formatNumber(contributor.additions - contributor.deletions)}
                    </span>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </PageWrapper>
  );
}

