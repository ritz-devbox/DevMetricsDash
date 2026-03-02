import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import type { MetricsData } from '../types/metrics';
import PageWrapper, { fadeInUp } from '../components/layout/PageWrapper';
import GlassCard from '../components/dashboard/GlassCard';
import StatCard from '../components/dashboard/StatCard';
import { formatHours, timeAgo } from '../services/dataService';

interface Props {
  data: MetricsData;
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <p className="text-xs font-semibold text-dark-100 mb-1">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-xs">
          <div className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-dark-300">{p.name}</span>
          <span className="ml-auto font-mono font-semibold text-dark-100">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function Issues({ data }: Props) {
  const { issues, summary } = data;
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return issues;
    return issues.filter(i => i.state === filter);
  }, [issues, filter]);

  const closedIssues = issues.filter(i => i.state === 'closed');
  const avgCloseTime = closedIssues.length
    ? closedIssues.reduce((s, i) => s + (i.time_to_close_hours || 0), 0) / closedIssues.length
    : 0;

  // Close time distribution
  const closeRanges = [
    { label: '<1h', max: 1 },
    { label: '1-8h', max: 8 },
    { label: '8-24h', max: 24 },
    { label: '1-3d', max: 72 },
    { label: '3-7d', max: 168 },
    { label: '7d+', max: Infinity },
  ];
  const closeDistribution = closeRanges.map((range, i) => {
    const prev = i > 0 ? closeRanges[i - 1].max : 0;
    const count = closedIssues.filter(issue =>
      (issue.time_to_close_hours || 0) > prev && (issue.time_to_close_hours || 0) <= range.max
    ).length;
    return { range: range.label, count };
  });
  const closeColors = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#f97316', '#ef4444'];

  // Label breakdown
  const labelMap: Record<string, number> = {};
  issues.forEach(i => i.labels.forEach(l => { labelMap[l] = (labelMap[l] || 0) + 1; }));
  const topLabels = Object.entries(labelMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }));
  const labelColors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#f97316', '#ef4444', '#3b82f6'];

  // Issues by repo
  const repoMap: Record<string, { open: number; closed: number }> = {};
  issues.forEach(i => {
    if (!repoMap[i.repo]) repoMap[i.repo] = { open: 0, closed: 0 };
    repoMap[i.repo][i.state === 'closed' ? 'closed' : 'open']++;
  });
  const issuesByRepo = Object.entries(repoMap).map(([repo, counts]) => ({
    repo, ...counts, total: counts.open + counts.closed,
  })).sort((a, b) => b.total - a.total);

  return (
    <PageWrapper
      title="Issue Analytics"
      subtitle={`${issues.length} issues across all repositories`}
    >
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Issues" value={summary.total_issues} icon="I" color="purple" delay={0} />
        <StatCard label="Closed" value={summary.total_issues_closed} icon="C" color="green" delay={0.05} />
        <StatCard label="Open" value={summary.total_issues - summary.total_issues_closed} icon="O" color="yellow" delay={0.1} />
        <StatCard label="Avg Close Time" value={formatHours(avgCloseTime)} icon="T" color="cyan" delay={0.15} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Close time distribution */}
        <motion.div variants={fadeInUp}>
          <GlassCard title="Time to Close Distribution" subtitle="How fast issues get resolved" className="p-5" delay={0.1}>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={closeDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                <XAxis dataKey="range" tick={{ fontSize: 10, fill: '#8b949e' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#8b949e' }} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" name="Issues" radius={[6, 6, 0, 0]} maxBarSize={40}>
                  {closeDistribution.map((_, i) => (
                    <Cell key={i} fill={closeColors[i]} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>

        {/* Labels breakdown */}
        <motion.div variants={fadeInUp}>
          <GlassCard title="Label Breakdown" subtitle="Most common issue labels" className="p-5" delay={0.15}>
            {topLabels.length > 0 ? (
              <div className="flex items-center gap-6">
                <div className="w-36 h-36 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={topLabels} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={2} dataKey="count" stroke="none">
                        {topLabels.map((_, i) => <Cell key={i} fill={labelColors[i % labelColors.length]} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2">
                  {topLabels.map((l, i) => (
                    <div key={l.name} className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: labelColors[i % labelColors.length] }} />
                      <span className="text-xs text-dark-200 flex-1 truncate">{l.name}</span>
                      <span className="text-[11px] font-mono text-dark-400">{l.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-dark-500 text-center py-8">No labels found</p>
            )}
          </GlassCard>
        </motion.div>
      </div>

      {/* Issues by repo */}
      <motion.div variants={fadeInUp} className="mb-6">
        <GlassCard title="Issues by Repository" className="p-5" delay={0.2}>
          <div className="space-y-3">
            {issuesByRepo.map((r) => (
              <div key={r.repo} className="flex items-center gap-4">
                <span className="text-xs text-dark-200 w-32 truncate font-mono">{r.repo}</span>
                <div className="flex-1 flex h-3 rounded-full overflow-hidden bg-dark-700/30 gap-0.5">
                  {r.closed > 0 && (
                    <div className="h-full rounded-l-full bg-accent-green/70" style={{ width: `${(r.closed / r.total) * 100}%` }} />
                  )}
                  {r.open > 0 && (
                    <div className="h-full rounded-r-full bg-accent-yellow/70" style={{ width: `${(r.open / r.total) * 100}%` }} />
                  )}
                </div>
                <div className="flex items-center gap-3 text-[10px] w-32 justify-end">
                  <span className="text-accent-green font-mono">{r.closed} closed</span>
                  <span className="text-accent-yellow font-mono">{r.open} open</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Filters + Issue List */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center gap-1 bg-dark-700/30 rounded-lg p-1">
          {(['all', 'open', 'closed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 capitalize ${
                filter === f ? 'bg-accent-purple/20 text-accent-purple shadow-sm' : 'text-dark-400 hover:text-dark-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <span className="text-xs text-dark-500 ml-auto">{filtered.length} results</span>
      </div>

      <motion.div variants={fadeInUp}>
        <GlassCard className="overflow-hidden" hover={false} delay={0.25}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-600/30">
                  <th className="text-left text-[10px] uppercase tracking-wider text-dark-500 font-medium p-4 pb-3">Issue</th>
                  <th className="text-left text-[10px] uppercase tracking-wider text-dark-500 font-medium p-4 pb-3">Repo</th>
                  <th className="text-left text-[10px] uppercase tracking-wider text-dark-500 font-medium p-4 pb-3">State</th>
                  <th className="text-left text-[10px] uppercase tracking-wider text-dark-500 font-medium p-4 pb-3">Labels</th>
                  <th className="text-right text-[10px] uppercase tracking-wider text-dark-500 font-medium p-4 pb-3">Close Time</th>
                  <th className="text-right text-[10px] uppercase tracking-wider text-dark-500 font-medium p-4 pb-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 25).map((issue, i) => (
                  <motion.tr
                    key={`${issue.repo}-${issue.number}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-dark-600/10 hover:bg-dark-700/20 transition-colors"
                  >
                    <td className="p-4 py-3">
                      <div className="flex items-start gap-2 min-w-0">
                        <span className="text-[10px] text-dark-500 font-mono mt-0.5">#{issue.number}</span>
                        <span className="text-xs text-dark-200 truncate max-w-xs">{issue.title}</span>
                      </div>
                    </td>
                    <td className="p-4 py-3">
                      <span className="text-xs text-dark-400 font-mono">{issue.repo}</span>
                    </td>
                    <td className="p-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ring-1 capitalize ${
                        issue.state === 'closed'
                          ? 'bg-accent-green/15 text-accent-green ring-accent-green/20'
                          : 'bg-accent-yellow/15 text-accent-yellow ring-accent-yellow/20'
                      }`}>
                        {issue.state}
                      </span>
                    </td>
                    <td className="p-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {issue.labels.slice(0, 3).map(l => (
                          <span key={l} className="px-1.5 py-0.5 rounded text-[9px] bg-dark-700/50 text-dark-300">{l}</span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 py-3 text-right">
                      <span className="text-xs text-dark-300 font-mono">
                        {issue.time_to_close_hours ? formatHours(issue.time_to_close_hours) : '\u2014'}
                      </span>
                    </td>
                    <td className="p-4 py-3 text-right">
                      <span className="text-[11px] text-dark-400">{timeAgo(issue.created_at)}</span>
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
