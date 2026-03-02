import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { MetricsData } from '../types/metrics';
import PageWrapper, { fadeInUp } from '../components/layout/PageWrapper';
import StatCard from '../components/dashboard/StatCard';
import GlassCard from '../components/dashboard/GlassCard';
import FilterBar from '../components/dashboard/FilterBar';
import ActivityChart from '../components/charts/ActivityChart';
import ContributionHeatmap from '../components/charts/ContributionHeatmap';
import LanguageDonut from '../components/charts/LanguageDonut';
import { formatHours, timeAgo } from '../services/dataService';

interface Props {
  data: MetricsData;
}

export default function Overview({ data }: Props) {
  const [repoFilter, setRepoFilter] = useState('all');
  const [contributorFilter, setContributorFilter] = useState('all');

  const repoNames = useMemo(() => data.repositories.map(r => r.name), [data]);
  const contributorNames = useMemo(() => data.contributors.map(c => c.username), [data]);

  const filteredCommits = useMemo(() => {
    return data.commits.filter(c => {
      if (repoFilter !== 'all' && c.repo !== repoFilter) return false;
      if (contributorFilter !== 'all' && c.author !== contributorFilter) return false;
      return true;
    });
  }, [data, repoFilter, contributorFilter]);

  const filteredPRs = useMemo(() => {
    return data.pull_requests.filter(pr => {
      if (repoFilter !== 'all' && pr.repo !== repoFilter) return false;
      if (contributorFilter !== 'all' && pr.author !== contributorFilter) return false;
      return true;
    });
  }, [data, repoFilter, contributorFilter]);

  const hasFilter = repoFilter !== 'all' || contributorFilter !== 'all';

  const summary = hasFilter ? {
    ...data.summary,
    total_commits: filteredCommits.length,
    total_prs: filteredPRs.length,
    total_prs_merged: filteredPRs.filter(p => p.state === 'merged').length,
    total_reviews: filteredPRs.reduce((s, p) => s + p.reviews, 0),
    code_additions: filteredCommits.reduce((s, c) => s + c.additions, 0),
    code_deletions: filteredCommits.reduce((s, c) => s + c.deletions, 0),
  } : data.summary;

  const { weekly_activity, heatmap, languages, contributors, commits } = data;
  const topContributors = [...contributors].sort((a, b) => b.total_commits - a.total_commits).slice(0, 5);
  const recentCommits = (hasFilter ? filteredCommits : commits).slice(0, 8);

  return (
    <PageWrapper
      title="Overview"
      subtitle={`Tracking ${summary.total_repositories} repositories · ${summary.total_contributors} contributors · ${data.config.lookback_days} day window`}
    >
      <FilterBar
        repos={repoNames}
        contributors={contributorNames}
        selectedRepo={repoFilter}
        selectedContributor={contributorFilter}
        onRepoChange={setRepoFilter}
        onContributorChange={setContributorFilter}
      />

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatCard label="Commits" value={summary.total_commits} icon="📝" color="purple" delay={0} />
        <StatCard label="PRs Merged" value={summary.total_prs_merged} icon="🔀" color="cyan" delay={0.05} />
        <StatCard label="Issues Closed" value={summary.total_issues_closed} icon="✅" color="green" delay={0.1} />
        <StatCard label="Reviews" value={summary.total_reviews} icon="👁" color="yellow" delay={0.15} />
        <StatCard label="Avg Merge Time" value={formatHours(summary.avg_pr_merge_time_hours)} icon="⏱" color="orange" delay={0.2} />
        <StatCard label="Releases" value={summary.total_releases} icon="🚀" color="pink" delay={0.25} />
      </div>

      {/* Activity Chart + Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div variants={fadeInUp}>
          <GlassCard title="Activity Trends" subtitle="Weekly commit, PR & issue activity" className="p-5" delay={0.1}>
            <ActivityChart data={weekly_activity} />
            <div className="flex items-center gap-5 mt-3 px-2">
              <div className="flex items-center gap-1.5 text-[10px] text-dark-400">
                <div className="h-2 w-2 rounded-full bg-accent-purple" /> Commits
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-dark-400">
                <div className="h-2 w-2 rounded-full bg-accent-cyan" /> PRs Merged
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-dark-400">
                <div className="h-2 w-2 rounded-full bg-accent-green" /> Issues Closed
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <GlassCard title="Contribution Heatmap" subtitle="Daily contribution activity" className="p-5" delay={0.15}>
            <ContributionHeatmap data={heatmap} />
          </GlassCard>
        </motion.div>
      </div>

      {/* Languages + Top Contributors + Recent Commits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Languages */}
        <motion.div variants={fadeInUp}>
          <GlassCard title="Language Breakdown" subtitle="Across all repositories" className="p-5" delay={0.2}>
            <LanguageDonut data={languages} />
          </GlassCard>
        </motion.div>

        {/* Top Contributors */}
        <motion.div variants={fadeInUp}>
          <GlassCard title="Top Contributors" subtitle="By commit count" className="p-5" delay={0.25}>
            <div className="space-y-3">
              {topContributors.map((c, i) => (
                <div key={c.username} className="flex items-center gap-3 group">
                  <span className="text-xs font-mono text-dark-500 w-4 text-right">{i + 1}</span>
                  <img
                    src={c.avatar_url}
                    alt={c.username}
                    className="h-8 w-8 rounded-full ring-2 ring-dark-600/50 group-hover:ring-accent-purple/30 transition-all"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-dark-100 truncate group-hover:text-dark-50 transition-colors">{c.username}</p>
                    <p className="text-[10px] text-dark-400">{c.total_commits} commits · {c.total_prs} PRs</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-16 h-1.5 rounded-full bg-dark-700/50 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-accent-purple to-accent-cyan"
                        initial={{ width: 0 }}
                        animate={{ width: `${(c.total_commits / topContributors[0].total_commits) * 100}%` }}
                        transition={{ delay: 0.5 + i * 0.1, duration: 0.6 }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Recent Commits */}
        <motion.div variants={fadeInUp}>
          <GlassCard title="Recent Activity" subtitle="Latest commits" className="p-5" delay={0.3}>
            <div className="space-y-2.5">
              {recentCommits.map((c) => (
                <div key={c.sha} className="flex items-start gap-3 group">
                  <div className="mt-1 h-6 w-6 rounded-full bg-dark-700/50 flex items-center justify-center flex-shrink-0 ring-1 ring-dark-600/30">
                    <span className="text-[10px]">
                      {c.message.startsWith('feat') ? '✨' : c.message.startsWith('fix') ? '🐛' : c.message.startsWith('refactor') ? '♻️' : c.message.startsWith('perf') ? '⚡' : c.message.startsWith('test') ? '🧪' : '📦'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-dark-200 truncate leading-relaxed group-hover:text-dark-50 transition-colors">
                      {c.message}
                    </p>
                    <p className="text-[10px] text-dark-500 mt-0.5">
                      <span className="text-dark-400">{c.author}</span> · {c.repo} · {timeAgo(c.date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] flex-shrink-0">
                    <span className="text-accent-green font-mono">+{c.additions}</span>
                    <span className="text-accent-red font-mono">-{c.deletions}</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </PageWrapper>
  );
}

