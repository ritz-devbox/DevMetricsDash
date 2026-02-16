import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { WeeklyActivity } from "../../types/metrics";

interface WeeklyChartProps {
  data: WeeklyActivity[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null;
  return (
    <div className="glass-card p-3 shadow-xl border border-dark-600">
      <p className="text-xs text-dark-300 font-mono mb-2">
        Week of {new Date(label).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
      </p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: entry.color }} />
          <span className="text-dark-300">{entry.name}:</span>
          <span className="font-semibold text-dark-50">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function WeeklyChart({ data }: WeeklyChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
      className="glass-card p-6"
    >
      <h3 className="text-base font-semibold text-dark-50 mb-4">
        Weekly Breakdown
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#21262D" />
          <XAxis
            dataKey="week_start"
            tickFormatter={(d) =>
              new Date(d).toLocaleDateString("en", { month: "short", day: "numeric" })
            }
            stroke="#484F58"
            fontSize={10}
            tickLine={false}
          />
          <YAxis stroke="#484F58" fontSize={10} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
            iconType="circle"
            iconSize={8}
          />
          <Bar
            dataKey="commits"
            name="Commits"
            fill="#8B5CF6"
            radius={[3, 3, 0, 0]}
            opacity={0.85}
          />
          <Bar
            dataKey="prs_merged"
            name="PRs Merged"
            fill="#06B6D4"
            radius={[3, 3, 0, 0]}
            opacity={0.85}
          />
          <Bar
            dataKey="issues_closed"
            name="Issues Closed"
            fill="#10B981"
            radius={[3, 3, 0, 0]}
            opacity={0.85}
          />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

