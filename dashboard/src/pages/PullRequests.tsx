import { useState } from 'react';
import { motion } from 'framer-motion';
import type { MetricsData } from '../types/metrics';
import PageWrapper, { fadeInUp } from '../components/layout/PageWrapper';
import GlassCard from '../components/dashboard/GlassCard';
import StatCard from '../components/dashboard/StatCard';
import PRChart from '../components/charts/PRChart';
import { formatHours, timeAgo } from '../services/dataService';

interface Props {
  data: MetricsData;
}

export default function PullRequests({ data }: Props) {
  const { pull_requests, summary } = data;
  const [filter, setFilter] = useState<'all' | 'merged' | 'open' | 'closed'>('all');
  const [repoFilter, setRepoFilter] = useState<string>('all');

  const repos = [...new Set(pull_requests.map(pr => pr.repo))];

  const filtered = pull_requests.filter(pr => {
    if (filter !== 'all' && pr.state !== filter) return false;
    if (repoFilter !== 'all' && pr.repo !== repoFilter) return false;
    return true;
  });

  const merged = pull_requests.filter(pr => pr.state === 'merged');
  const avgMergeTime = merged.length
    ? merged.reduce((sum, pr) => sum + pr.time_to_merge_hours, 0) / merged.length
    : 0;

  const stateColors: Record<string, string> = {
    merged: 'bg-accent-purple/15 text-accent-purple ring-accent-purple/20',
    open: 'bg-accent-green/15 text-accent-green ring-accent-green/20',
    closed: 'bg-accent-red/15 text-accent-red ring-accent-red/20',
  };

  return (
    <PageWrapper
      title="Pull Requests"
      subtitle={`${pull_requests.length} pull requests across all repositories`}
    >
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total PRs" value={summary.total_prs} icon="🔀" color="purple" delay={0} />
        <StatCard label="Merged" value={summary.total_prs_merged} icon="✅" color="green" delay={0.05} />
        <StatCard label="Avg Merge Time" value={formatHours(avgMergeTime)} icon="⏱" color="cyan" delay={0.1} />
        <StatCard label="Avg First Review" value={formatHours(summary.avg_time_to_first_review_hours)} icon="👁" color="yellow" delay={0.15} />
      </div>

      {/* Chart */}
      <motion.div variants={fadeInUp} className="mb-6">
        <GlassCard title="Merge Time Distribution" subtitle="How fast PRs get merged" className="p-5" delay={0.1}>
          <PRChart data={pull_requests} />
        </GlassCard>
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center gap-1 bg-dark-700/30 rounded-lg p-1">
          {(['all', 'merged', 'open', 'closed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 capitalize ${
                filter === f
                  ? 'bg-accent-purple/20 text-accent-purple shadow-sm'
                  : 'text-dark-400 hover:text-dark-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <select
          value={repoFilter}
          onChange={(e) => setRepoFilter(e.target.value)}
          className="bg-dark-700/30 border border-dark-600/30 rounded-lg px-3 py-1.5 text-xs text-dark-200 outline-none focus:border-accent-purple/40 transition-colors"
        >
          <option value="all">All Repositories</option>
          {repos.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <span className="text-xs text-dark-500 ml-auto">{filtered.length} results</span>
      </motion.div>

      {/* PR List */}
      <motion.div variants={fadeInUp}>
        <GlassCard className="overflow-hidden" hover={false} delay={0.2}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-600/30">
                  <th className="text-left text-[10px] uppercase tracking-wider text-dark-500 font-medium p-4 pb-3">PR</th>
                  <th className="text-left text-[10px] uppercase tracking-wider text-dark-500 font-medium p-4 pb-3">Author</th>
                  <th className="text-left text-[10px] uppercase tracking-wider text-dark-500 font-medium p-4 pb-3">Repo</th>
                  <th className="text-left text-[10px] uppercase tracking-wider text-dark-500 font-medium p-4 pb-3">State</th>
                  <th className="text-right text-[10px] uppercase tracking-wider text-dark-500 font-medium p-4 pb-3">Changes</th>
                  <th className="text-right text-[10px] uppercase tracking-wider text-dark-500 font-medium p-4 pb-3">Merge Time</th>
                  <th className="text-right text-[10px] uppercase tracking-wider text-dark-500 font-medium p-4 pb-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 20).map((pr, i) => (
                  <motion.tr
                    key={pr.number}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-dark-600/10 hover:bg-dark-700/20 transition-colors group"
                  >
                    <td className="p-4 py-3">
                      <div className="flex items-start gap-2 min-w-0">
                        <span className="text-[10px] text-dark-500 font-mono mt-0.5">#{pr.number}</span>
                        <span className="text-xs text-dark-200 truncate max-w-xs group-hover:text-dark-50 transition-colors">{pr.title}</span>
                      </div>
                    </td>
                    <td className="p-4 py-3">
                      <div className="flex items-center gap-2">
                        <img src={pr.author_avatar} alt={pr.author} className="h-5 w-5 rounded-full" />
                        <span className="text-xs text-dark-300">{pr.author}</span>
                      </div>
                    </td>
                    <td className="p-4 py-3">
                      <span className="text-xs text-dark-400 font-mono">{pr.repo}</span>
                    </td>
                    <td className="p-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ring-1 capitalize ${stateColors[pr.state] || ''}`}>
                        {pr.state}
                      </span>
                    </td>
                    <td className="p-4 py-3 text-right">
                      <span className="text-[10px] font-mono text-accent-green">+{pr.additions}</span>
                      <span className="text-dark-600 mx-1">/</span>
                      <span className="text-[10px] font-mono text-accent-red">-{pr.deletions}</span>
                    </td>
                    <td className="p-4 py-3 text-right">
                      <span className="text-xs text-dark-300 font-mono">
                        {pr.time_to_merge_hours ? formatHours(pr.time_to_merge_hours) : '—'}
                      </span>
                    </td>
                    <td className="p-4 py-3 text-right">
                      <span className="text-[11px] text-dark-400">{timeAgo(pr.created_at)}</span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </motion.div>
    </PageWrapper>
  );
}

