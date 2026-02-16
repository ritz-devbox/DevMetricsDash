import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Legend,
} from "recharts";
import Header from "../components/layout/Header";
import type { MetricsData } from "../types/metrics";

interface TeamProps {
  data: MetricsData;
}

const COLORS = ["#8B5CF6", "#06B6D4", "#10B981", "#F59E0B", "#EC4899", "#F97316"];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null;
  return (
    <div className="glass-card p-3 shadow-xl border border-dark-600">
      <p className="text-xs text-dark-300 font-mono mb-2">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-dark-300">{entry.name}:</span>
          <span className="font-semibold text-dark-50">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function Team({ data }: TeamProps) {
  const contributors = data.contributors;

  // Radar chart data
  const maxCommits = Math.max(...contributors.map((c) => c.total_commits));
  const maxPRs = Math.max(...contributors.map((c) => c.total_prs));
  const maxReviews = Math.max(...contributors.map((c) => c.total_reviews));
  const maxAdditions = Math.max(...contributors.map((c) => c.additions));
  const maxDays = Math.max(...contributors.map((c) => c.active_days));

  const radarData = [
    { metric: "Commits", ...Object.fromEntries(contributors.slice(0, 4).map((c) => [c.username, Math.round((c.total_commits / maxCommits) * 100)])) },
    { metric: "PRs", ...Object.fromEntries(contributors.slice(0, 4).map((c) => [c.username, Math.round((c.total_prs / maxPRs) * 100)])) },
    { metric: "Reviews", ...Object.fromEntries(contributors.slice(0, 4).map((c) => [c.username, Math.round((c.total_reviews / (maxReviews || 1)) * 100)])) },
    { metric: "Code Volume", ...Object.fromEntries(contributors.slice(0, 4).map((c) => [c.username, Math.round((c.additions / maxAdditions) * 100)])) },
    { metric: "Active Days", ...Object.fromEntries(contributors.slice(0, 4).map((c) => [c.username, Math.round((c.active_days / maxDays) * 100)])) },
  ];

  // Bar chart data
  const barData = contributors.map((c) => ({
    name: c.username,
    commits: c.total_commits,
    prs: c.total_prs,
    reviews: c.total_reviews,
  }));

  return (
    <div>
      <Header
        title="Team"
        subtitle={`${contributors.length} contributors active`}
        generatedAt={data.generated_at}
      />

      {/* Contributor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
        {contributors.map((c, i) => (
          <motion.div
            key={c.username}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card-hover p-5"
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-lg font-bold"
                style={{
                  backgroundColor: `${COLORS[i % COLORS.length]}20`,
                  color: COLORS[i % COLORS.length],
                }}
              >
                {c.username[0].toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-dark-50">@{c.username}</h3>
                <p className="text-[11px] text-dark-400">
                  Active {c.active_days} days
                </p>
              </div>
              <div className="ml-auto text-right">
                <span className="text-xs font-mono text-dark-500">
                  #{i + 1}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-3">
              {[
                { label: "Commits", value: c.total_commits, color: "#8B5CF6" },
                { label: "PRs", value: c.total_prs, color: "#06B6D4" },
                { label: "Reviews", value: c.total_reviews, color: "#10B981" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p
                    className="text-lg font-bold"
                    style={{ color: stat.color }}
                  >
                    {stat.value}
                  </p>
                  <p className="text-[10px] text-dark-500">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Code impact bar */}
            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-accent-green font-mono">
                +{(c.additions / 1000).toFixed(1)}k
              </span>
              <div className="flex-1 h-1.5 bg-dark-700 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-accent-green rounded-l-full"
                  style={{
                    width: `${
                      (c.additions / (c.additions + c.deletions)) * 100
                    }%`,
                  }}
                />
                <div
                  className="h-full bg-accent-red rounded-r-full"
                  style={{
                    width: `${
                      (c.deletions / (c.additions + c.deletions)) * 100
                    }%`,
                  }}
                />
              </div>
              <span className="text-accent-red font-mono">
                -{(c.deletions / 1000).toFixed(1)}k
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contribution Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <h3 className="text-base font-semibold text-dark-50 mb-4">
            Contribution Comparison
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262D" />
              <XAxis
                dataKey="name"
                stroke="#484F58"
                fontSize={10}
                tickLine={false}
                tickFormatter={(v) => `@${v}`}
              />
              <YAxis stroke="#484F58" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "11px" }} iconType="circle" iconSize={8} />
              <Bar dataKey="commits" name="Commits" fill="#8B5CF6" radius={[3, 3, 0, 0]} opacity={0.85} />
              <Bar dataKey="prs" name="PRs" fill="#06B6D4" radius={[3, 3, 0, 0]} opacity={0.85} />
              <Bar dataKey="reviews" name="Reviews" fill="#10B981" radius={[3, 3, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Radar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6"
        >
          <h3 className="text-base font-semibold text-dark-50 mb-4">
            Skill Radar
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#21262D" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: "#8B949E", fontSize: 11 }} />
              {contributors.slice(0, 4).map((c, i) => (
                <Radar
                  key={c.username}
                  name={`@${c.username}`}
                  dataKey={c.username}
                  stroke={COLORS[i]}
                  fill={COLORS[i]}
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              ))}
              <Legend wrapperStyle={{ fontSize: "11px" }} iconType="circle" iconSize={8} />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}

