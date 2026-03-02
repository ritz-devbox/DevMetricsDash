import { motion } from 'framer-motion';
import type { MetricsData } from '../types/metrics';
import PageWrapper, { fadeInUp } from '../components/layout/PageWrapper';
import GlassCard from '../components/dashboard/GlassCard';
import { formatNumber, formatHours } from '../services/dataService';

interface Props {
  data: MetricsData;
}

const langColors: Record<string, string> = {
  TypeScript: '#3178C6',
  JavaScript: '#F7DF1E',
  Python: '#3572A5',
  Go: '#00ADD8',
  HCL: '#844FBA',
  CSS: '#563D7C',
  Other: '#6B7280',
};

export default function Repositories({ data }: Props) {
  const { repositories } = data;

  return (
    <PageWrapper
      title="Repositories"
      subtitle={`${repositories.length} active repositories tracked`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {repositories.map((repo, i) => (
          <motion.div key={repo.name} variants={fadeInUp}>
            <GlassCard className="p-5" hover delay={i * 0.05}>
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-3 w-3 rounded-full" style={{ background: langColors[repo.language] || '#6B7280' }} />
                    <h3 className="text-base font-semibold text-dark-50 truncate">{repo.name}</h3>
                  </div>
                  <p className="text-xs text-dark-400 leading-relaxed">{repo.description}</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  { label: 'Commits', value: repo.total_commits, icon: '📝' },
                  { label: 'PRs', value: repo.total_prs, icon: '🔀' },
                  { label: 'Stars', value: repo.stars, icon: '⭐' },
                  { label: 'Forks', value: repo.forks, icon: '🍴' },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <p className="text-xs text-dark-500 mb-0.5">{s.icon}</p>
                    <p className="text-sm font-bold text-dark-100 font-mono">{formatNumber(s.value)}</p>
                    <p className="text-[9px] text-dark-500 uppercase tracking-wider">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Merge Time + Contributors */}
              <div className="flex items-center justify-between text-xs mb-4">
                <div className="flex items-center gap-1.5">
                  <span className="text-dark-500">⏱</span>
                  <span className="text-dark-300">Avg merge: <span className="text-dark-100 font-semibold">{formatHours(repo.avg_pr_merge_time_hours)}</span></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-dark-500">👥</span>
                  <span className="text-dark-300">{repo.contributors_count} contributors</span>
                </div>
              </div>

              {/* Language Bar */}
              <div>
                <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
                  {Object.entries(repo.languages).map(([lang, pct]) => (
                    <motion.div
                      key={lang}
                      className="h-full rounded-full"
                      style={{ background: langColors[lang] || '#6B7280' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.3 + i * 0.05, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                    />
                  ))}
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-2">
                  {Object.entries(repo.languages)
                    .filter(([, pct]) => pct >= 5)
                    .map(([lang, pct]) => (
                      <div key={lang} className="flex items-center gap-1">
                        <div className="h-1.5 w-1.5 rounded-full" style={{ background: langColors[lang] || '#6B7280' }} />
                        <span className="text-[10px] text-dark-400">{lang} <span className="font-mono">{pct}%</span></span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Open Issues Badge */}
              {repo.open_issues > 0 && (
                <div className="mt-3 flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-accent-yellow animate-pulse" />
                  <span className="text-[10px] text-dark-400">{repo.open_issues} open issues</span>
                </div>
              )}
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </PageWrapper>
  );
}

