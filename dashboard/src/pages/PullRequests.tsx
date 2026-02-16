import { motion } from "framer-motion";
import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell,
} from "recharts";
import Header from "../components/layout/Header";
import StatCard from "../components/dashboard/StatCard";
import type { MetricsData } from "../types/metrics";
import { timeAgo, formatHours } from "../services/dataService";

interface PullRequestsProps {
  data: MetricsData;
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <div className="glass-card p-3 shadow-xl border border-dark-600">
      <p className="text-xs text-dark-100 font-medium mb-1">{d.title || d.name}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span className="text-dark-300">{entry.name}:</span>
          <span className="font-semibold text-dark-50">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function PullRequests({ data }: PullRequestsProps) {
  const [filter, setFilter] = useState<"all" | "open" | "merged" | "closed">("all");
  const prs = data.pull_requests;
  const s = data.summary;

  const filtered = filter === "all" ? prs : prs.filter((pr) => pr.state === filter);

  // Merge time distribution
  const mergedPRs = prs.filter((p) => p.time_to_merge_hours != null);
  const buckets = [
    { range: "< 1h", min: 0, max: 1 },
    { range: "1-4h", min: 1, max: 4 },
    { range: "4-12h", min: 4, max: 12 },
    { range: "12-24h", min: 12, max: 24 },
    { range: "1-3d", min: 24, max: 72 },
    { range: "3d+", min: 72, max: Infinity },
  ];

  const mergeDistribution = buckets.map((b) => ({
    name: b.range,
    count: mergedPRs.filter(
      (p) => p.time_to_merge_hours! >= b.min && p.time_to_merge_hours! < b.max
    ).length,
  }));

  // Scatter: PR size vs merge time
  const scatterData = mergedPRs.map((p) => ({
    size: p.additions + p.deletions,
    hours: p.time_to_merge_hours,
    title: p.title,
    comments: p.comments + p.review_comments,
  }));

  const stateColors: Record<string, string> = {
    open: "#10B981",
    merged: "#8B5CF6",
    closed: "#EF4444",
  };

  return (
    <div>
      <Header
        title="Pull Requests"
        subtitle={`${s.total_prs} total · ${s.total_prs_merged} merged · ${formatHours(s.avg_pr_merge_time_hours)} avg merge time`}
        generatedAt={data.generated_at}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon="🔀" label="Total PRs" value={s.total_prs} color="purple" delay={0} />
        <StatCard icon="✅" label="Merged" value={s.total_prs_merged} color="green" delay={100} />
        <StatCard icon="⏱️" label="Avg Merge Time" value={s.avg_pr_merge_time_hours} suffix="h" color="cyan" delay={200} animate={false} />
        <StatCard icon="👀" label="Avg Review Time" value={s.avg_time_to_first_review_hours} suffix="h" color="yellow" delay={300} animate={false} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Merge Time Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <h3 className="text-base font-semibold text-dark-50 mb-4">
            Merge Time Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={mergeDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262D" />
              <XAxis dataKey="name" stroke="#484F58" fontSize={10} tickLine={false} />
              <YAxis stroke="#484F58" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="PRs" fill="#8B5CF6" radius={[4, 4, 0, 0]} opacity={0.85}>
                {mergeDistribution.map((_, i) => (
                  <Cell key={i} fill={i < 2 ? "#10B981" : i < 4 ? "#F59E0B" : "#EF4444"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* PR Size vs Merge Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <h3 className="text-base font-semibold text-dark-50 mb-4">
            PR Size vs Merge Time
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <ScatterChart margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262D" />
              <XAxis
                dataKey="size"
                name="Lines Changed"
                stroke="#484F58"
                fontSize={10}
                tickLine={false}
              />
              <YAxis
                dataKey="hours"
                name="Merge Time (h)"
                stroke="#484F58"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <ZAxis dataKey="comments" range={[30, 200]} name="Comments" />
              <Tooltip content={<CustomTooltip />} />
              <Scatter name="PRs" data={scatterData} fill="#8B5CF6" opacity={0.7} />
            </ScatterChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* PR List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-dark-50">
            Pull Requests
          </h3>
          <div className="flex gap-1">
            {(["all", "open", "merged", "closed"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filter === f
                    ? "bg-accent-purple/20 text-accent-purple"
                    : "text-dark-400 hover:text-dark-200 hover:bg-dark-700/50"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          {filtered.slice(0, 15).map((pr, i) => (
            <motion.div
              key={`${pr.repo}-${pr.number}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.03 }}
              className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-dark-700/30 transition-colors"
            >
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: stateColors[pr.state] }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-dark-100 truncate">{pr.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-dark-500">#{pr.number}</span>
                  <span className="text-dark-600">·</span>
                  <span className="text-[11px] text-dark-400">@{pr.author}</span>
                  <span className="text-dark-600">·</span>
                  <span className="text-[11px] text-dark-500 font-mono">{pr.repo}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-[11px] font-mono text-accent-green">
                  +{pr.additions}
                </span>
                <span className="text-[11px] font-mono text-accent-red">
                  -{pr.deletions}
                </span>
                {pr.time_to_merge_hours && (
                  <span className="text-[11px] text-dark-400">
                    {formatHours(pr.time_to_merge_hours)}
                  </span>
                )}
                <span className="text-[11px] text-dark-500">
                  {timeAgo(pr.created_at)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

