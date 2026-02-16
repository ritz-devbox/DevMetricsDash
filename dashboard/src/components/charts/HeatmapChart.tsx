import { motion } from "framer-motion";
import { useState } from "react";
import type { HeatmapData } from "../../types/metrics";

interface HeatmapChartProps {
  data: HeatmapData[];
}

const COLORS = ["#161B22", "#0E4429", "#006D32", "#26A641", "#39D353"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function HeatmapChart({ data }: HeatmapChartProps) {
  const [hoveredCell, setHoveredCell] = useState<HeatmapData | null>(null);

  const cellSize = 12;
  const cellGap = 3;
  const totalSize = cellSize + cellGap;
  const weeks = Math.ceil(data.length / 7);
  const offsetX = 30;
  const offsetY = 25;
  const width = offsetX + weeks * totalSize + 20;
  const height = offsetY + 7 * totalSize + 30;

  // Month labels
  const monthLabels: { label: string; x: number }[] = [];
  let lastMonth = -1;
  data.forEach((d, i) => {
    const month = new Date(d.date).getMonth();
    if (month !== lastMonth) {
      lastMonth = month;
      monthLabels.push({ label: MONTHS[month], x: offsetX + Math.floor(i / 7) * totalSize });
    }
  });

  const totalContribs = data.reduce((s, d) => s + d.count, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-dark-50">
          Contribution Heatmap
        </h3>
        <span className="text-sm text-dark-300">
          <span className="font-bold text-accent-green">
            {totalContribs.toLocaleString()}
          </span>{" "}
          contributions in the last year
        </span>
      </div>

      <div className="overflow-x-auto pb-2">
        <svg width={width} height={height} className="mx-auto">
          {/* Month labels */}
          {monthLabels.map((m, i) => (
            <text
              key={i}
              x={m.x}
              y={15}
              fill="#484F58"
              fontSize={10}
              fontFamily="system-ui"
            >
              {m.label}
            </text>
          ))}

          {/* Day labels */}
          {["Mon", "Wed", "Fri"].map((day, i) => (
            <text
              key={day}
              x={4}
              y={offsetY + [1, 3, 5][i] * totalSize + cellSize - 1}
              fill="#484F58"
              fontSize={9}
              fontFamily="system-ui"
            >
              {day}
            </text>
          ))}

          {/* Cells */}
          {data.map((d, i) => {
            const weekIdx = Math.floor(i / 7);
            const dayIdx = i % 7;
            const x = offsetX + weekIdx * totalSize;
            const y = offsetY + dayIdx * totalSize;

            return (
              <rect
                key={d.date}
                x={x}
                y={y}
                width={cellSize}
                height={cellSize}
                rx={2}
                fill={COLORS[d.level]}
                className="transition-all duration-150 cursor-pointer"
                style={{
                  stroke:
                    hoveredCell?.date === d.date ? "#E6EDF3" : "transparent",
                  strokeWidth: hoveredCell?.date === d.date ? 1 : 0,
                }}
                onMouseEnter={() => setHoveredCell(d)}
                onMouseLeave={() => setHoveredCell(null)}
              />
            );
          })}

          {/* Legend */}
          <text
            x={width - 150}
            y={height - 8}
            fill="#484F58"
            fontSize={9}
            fontFamily="system-ui"
          >
            Less
          </text>
          {COLORS.map((color, i) => (
            <rect
              key={i}
              x={width - 118 + i * 16}
              y={height - 18}
              width={12}
              height={12}
              rx={2}
              fill={color}
            />
          ))}
          <text
            x={width - 30}
            y={height - 8}
            fill="#484F58"
            fontSize={9}
            fontFamily="system-ui"
          >
            More
          </text>
        </svg>
      </div>

      {/* Tooltip */}
      {hoveredCell && (
        <div className="text-center mt-2">
          <span className="text-xs text-dark-300 font-mono">
            <span className="font-bold text-dark-100">
              {hoveredCell.count} contributions
            </span>{" "}
            on{" "}
            {new Date(hoveredCell.date).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      )}
    </motion.div>
  );
}

