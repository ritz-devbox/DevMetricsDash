import { motion } from 'framer-motion';
import type { HeatmapDay } from '../../types/metrics';

interface Props {
  data: HeatmapDay[];
}

const levelColors = [
  'bg-dark-700/40',
  'bg-accent-purple/20',
  'bg-accent-purple/40',
  'bg-accent-purple/60',
  'bg-accent-purple/90',
];

const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

export default function ContributionHeatmap({ data }: Props) {
  // Group data into weeks (columns of 7 days)
  const weeks: HeatmapDay[][] = [];
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7));
  }

  // Show last 52 weeks
  const displayWeeks = weeks.slice(-52);

  // Get month labels
  const monthLabels: { label: string; col: number }[] = [];
  let lastMonth = '';
  displayWeeks.forEach((week, i) => {
    if (week[0]) {
      const month = new Date(week[0].date).toLocaleDateString('en-US', { month: 'short' });
      if (month !== lastMonth) {
        monthLabels.push({ label: month, col: i });
        lastMonth = month;
      }
    }
  });

  return (
    <div className="overflow-x-auto">
      {/* Month labels */}
      <div className="flex ml-8 mb-1 gap-0">
        {monthLabels.map((m, i) => (
          <div
            key={i}
            className="text-[10px] text-dark-400 font-medium"
            style={{ position: 'relative', left: m.col * 14 - (i > 0 ? monthLabels[i - 1].col * 14 + 30 : 0) }}
          >
            {m.label}
          </div>
        ))}
      </div>

      <div className="flex gap-0.5">
        {/* Day labels */}
        <div className="flex flex-col gap-0.5 pr-1.5">
          {dayLabels.map((d, i) => (
            <div key={i} className="h-[12px] w-6 text-[9px] text-dark-500 flex items-center justify-end">
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex gap-[3px]">
          {displayWeeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day, di) => (
                <motion.div
                  key={`${wi}-${di}`}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: wi * 0.008 + di * 0.01, duration: 0.2 }}
                  className={`h-[12px] w-[12px] rounded-sm ${levelColors[day.level]} cursor-pointer transition-all duration-150 hover:ring-1 hover:ring-dark-300 hover:scale-125`}
                  title={`${day.date}: ${day.count} contributions`}
                />
              ))}
              {/* Pad if incomplete week */}
              {Array(7 - week.length).fill(0).map((_, i) => (
                <div key={`pad-${i}`} className="h-[12px] w-[12px]" />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1.5 mt-3 ml-8">
        <span className="text-[10px] text-dark-500">Less</span>
        {levelColors.map((c, i) => (
          <div key={i} className={`h-[10px] w-[10px] rounded-sm ${c}`} />
        ))}
        <span className="text-[10px] text-dark-500">More</span>
      </div>
    </div>
  );
}

