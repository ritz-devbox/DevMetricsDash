import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { LanguageBreakdown } from "../../types/metrics";

interface LanguageChartProps {
  data: LanguageBreakdown[];
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <div className="glass-card p-3 shadow-xl border border-dark-600">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
        <span className="text-sm font-medium text-dark-50">{d.language}</span>
      </div>
      <p className="text-xs text-dark-300 mt-1">{d.percentage}% of codebase</p>
    </div>
  );
}

export default function LanguageChart({ data }: LanguageChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass-card p-6"
    >
      <h3 className="text-base font-semibold text-dark-50 mb-4">Languages</h3>

      <div className="flex items-center gap-6">
        {/* Donut Chart */}
        <div className="w-40 h-40 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                dataKey="percentage"
                stroke="none"
                animationBegin={300}
                animationDuration={1000}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} opacity={0.85} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2.5">
          {data.map((lang, i) => (
            <motion.div
              key={lang.language}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.05 }}
              className="flex items-center gap-3"
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: lang.color }}
              />
              <span className="text-sm text-dark-200 flex-1">{lang.language}</span>
              <div className="flex-1 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: lang.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${lang.percentage}%` }}
                  transition={{ duration: 1, delay: 0.5 + i * 0.05 }}
                />
              </div>
              <span className="text-xs text-dark-400 font-mono w-12 text-right">
                {lang.percentage}%
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

