import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts';
import type { MetricsData } from '../types/metrics';
import PageWrapper, { fadeInUp } from '../components/layout/PageWrapper';
import GlassCard from '../components/dashboard/GlassCard';
import StatCard from '../components/dashboard/StatCard';
import { formatNumber } from '../services/dataService';

interface Props {
  data: MetricsData;
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <p className="text-xs font-semibold text-dark-100 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-xs">
          <div className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-dark-300">{p.name}</span>
          <span className="ml-auto font-mono font-semibold text-dark-100">{formatNumber(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

export default function CodeVelocity({ data }: Props) {
  const { weekly_activity, commits, summary, repositories } = data;

  const totalAdded = summary.code_additions;
  const totalDeleted = summary.code_deletions;
  const netLines = totalAdded - totalDeleted;
  const churnRate = totalAdded > 0 ? Math.round((totalDeleted / totalAdded) * 100) : 0;

  // Weekly code volume
  const weeklyCode = useMemo(() =>
    weekly_activity.map(w => ({
      week: new Date(w.week_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      additions: w.additions,
      deletions: w.deletions,
      net: w.additions - w.deletions,
    }))
  , [weekly_activity]);

  // Commits per repo
  const commitsByRepo = useMemo(() => {
    const map: Record<string, number> = {};
    commits.forEach(c => { map[c.repo] = (map[c.repo] || 0) + 1; });
    return Object.entries(map)
      .map(([repo, count]) => ({ repo, count }))
      .sort((a, b) => b.count - a.count);
  }, [commits]);

  // File change hotspots (commits by files_changed ranges)
  const sizeRanges = [
    { label: '1-3 files', min: 1, max: 3 },
    { label: '4-10 files', min: 4, max: 10 },
    { label: '11-20 files', min: 11, max: 20 },
    { label: '20+ files', min: 21, max: Infinity },
  ];
  const commitSizeDistribution = sizeRanges.map(range => ({
    range: range.label,
    count: commits.filter(c => c.files_changed >= range.min && c.files_changed <= range.max).length,
  }));
  const sizeColors = ['#10b981', '#06b6d4', '#f59e0b', '#ef4444'];

  // Commits by day of week
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const commitsByDay = useMemo(() => {
    const counts = Array(7).fill(0);
    commits.forEach(c => { counts[new Date(c.date).getDay()]++; });
    return dayNames.map((day, i) => ({ day, commits: counts[i] }));
  }, [commits]);

  const repoColors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#f97316'];

  return (
    <PageWrapper
      title="Code Velocity"
      subtitle="Lines of code, churn rate, and commit patterns"
    >
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Lines Added" value={totalAdded} icon="+" color="green" delay={0} />
        <StatCard label="Lines Deleted" value={totalDeleted} icon="-" color="pink" delay={0.05} />
        <StatCard label="Net Lines" value={netLines > 0 ? '+' + formatNumber(netLines) : formatNumber(netLines)} icon="=" color="cyan" delay={0.1} />
        <StatCard label="Churn Rate" value={churnRate + '%'} icon="~" color="yellow" delay={0.15} />
      </div>

      {/* Code volume over time */}
      <motion.div variants={fadeInUp} className="mb-6">
        <GlassCard title="Code Volume Over Time" subtitle="Weekly lines added vs deleted" className="p-5" delay={0.1}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={weeklyCode} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradAdd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradDel" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#8b949e' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#8b949e' }} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="additions" name="Added" stroke="#10b981" strokeWidth={2} fill="url(#gradAdd)" dot={false} />
              <Area type="monotone" dataKey="deletions" name="Deleted" stroke="#ef4444" strokeWidth={2} fill="url(#gradDel)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-5 mt-3 px-2">
            <div className="flex items-center gap-1.5 text-[10px] text-dark-400">
              <div className="h-2 w-2 rounded-full bg-accent-green" /> Added
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-dark-400">
              <div className="h-2 w-2 rounded-full bg-accent-red" /> Deleted
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Commits by repo */}
        <motion.div variants={fadeInUp}>
          <GlassCard title="Commits by Repository" className="p-5" delay={0.15}>
            <div className="space-y-3">
              {commitsByRepo.map((r, i) => (
                <div key={r.repo} className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: repoColors[i % repoColors.length] }} />
                  <span className="text-xs text-dark-200 flex-1 truncate font-mono">{r.repo}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 rounded-full bg-dark-700/50 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${(r.count / commitsByRepo[0].count) * 100}%`, background: repoColors[i % repoColors.length] }}
                      />
                    </div>
                    <span className="text-[11px] font-mono text-dark-400 w-8 text-right">{r.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Commit size distribution */}
        <motion.div variants={fadeInUp}>
          <GlassCard title="Commit Size" subtitle="Files changed per commit" className="p-5" delay={0.2}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={commitSizeDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                <XAxis dataKey="range" tick={{ fontSize: 9, fill: '#8b949e' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#8b949e' }} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" name="Commits" radius={[6, 6, 0, 0]} maxBarSize={36}>
                  {commitSizeDistribution.map((_, i) => <Cell key={i} fill={sizeColors[i]} fillOpacity={0.8} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>

        {/* Commits by day of week */}
        <motion.div variants={fadeInUp}>
          <GlassCard title="Commit Patterns" subtitle="Commits by day of week" className="p-5" delay={0.25}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={commitsByDay} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#8b949e' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#8b949e' }} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="commits" name="Commits" radius={[6, 6, 0, 0]} maxBarSize={36} fill="#8b5cf6" fillOpacity={0.7} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
