import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { DailyActivity } from "../../types/metrics";

interface ActivityChartProps {
  data: DailyActivity[];
  title?: string;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null;

  return (
    <div className="glass-card p-3 shadow-xl border border-dark-600">
      <p className="text-xs text-dark-300 font-mono mb-2">
        {new Date(label).toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        })}
      </p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-dark-300">{entry.name}:</span>
          <span className="font-semibold text-dark-50">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function ActivityChart({ data, title = "Activity Overview" }: ActivityChartProps) {
  const last30 = data.slice(-30);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card p-6"
    >
      <h3 className="text-base font-semibold text-dark-50 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={last30} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
          <defs>
            <linearGradient id="gradCommits" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradPRs" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradIssues" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#21262D" />
          <XAxis
            dataKey="date"
            tickFormatter={(d) =>
              new Date(d).toLocaleDateString("en", { month: "short", day: "numeric" })
            }
            stroke="#484F58"
            fontSize={10}
            tickLine={false}
            interval={4}
          />
          <YAxis stroke="#484F58" fontSize={10} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
            iconType="circle"
            iconSize={8}
          />
          <Area
            type="monotone"
            dataKey="commits"
            name="Commits"
            stroke="#8B5CF6"
            strokeWidth={2.5}
            fill="url(#gradCommits)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0, fill: "#8B5CF6" }}
          />
          <Area
            type="monotone"
            dataKey="prs_merged"
            name="PRs Merged"
            stroke="#06B6D4"
            strokeWidth={2}
            fill="url(#gradPRs)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0, fill: "#06B6D4" }}
          />
          <Area
            type="monotone"
            dataKey="issues_closed"
            name="Issues Closed"
            stroke="#10B981"
            strokeWidth={2}
            fill="url(#gradIssues)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0, fill: "#10B981" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

