import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import type { PullRequest } from '../../types/metrics';

interface Props {
  data: PullRequest[];
}

function CustomTooltip({ active, payload, label }: any) {
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

export default function PRChart({ data }: Props) {
  // Group PRs by merge time ranges
  const ranges = [
    { label: '<1h', max: 1 },
    { label: '1-4h', max: 4 },
    { label: '4-12h', max: 12 },
    { label: '12-24h', max: 24 },
    { label: '1-3d', max: 72 },
    { label: '3d+', max: Infinity },
  ];

  const merged = data.filter(pr => pr.state === 'merged');
  const chartData = ranges.map((range, i) => {
    const prev = i > 0 ? ranges[i - 1].max : 0;
    const count = merged.filter(pr => pr.time_to_merge_hours > prev && pr.time_to_merge_hours <= range.max).length;
    return { range: range.label, count };
  });

  const colors = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#f97316', '#ef4444'];

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
        <XAxis dataKey="range" tick={{ fontSize: 10, fill: '#8b949e' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 10, fill: '#8b949e' }} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="count" name="PRs" radius={[6, 6, 0, 0]} maxBarSize={40}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={colors[i]} fillOpacity={0.8} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

