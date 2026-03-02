import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import type { WeeklyActivity } from '../../types/metrics';

interface Props {
  data: WeeklyActivity[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <p className="text-xs font-semibold text-dark-100 mb-2">
        Week of {new Date(label).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-xs">
          <div className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-dark-300 capitalize">{p.dataKey.replace(/_/g, ' ')}</span>
          <span className="ml-auto font-mono font-semibold text-dark-100">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function ActivityChart({ data }: Props) {
  const chartData = data.map(d => ({
    ...d,
    week: new Date(d.week_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="gradCommits" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradPRs" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradReviews" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
        <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#8b949e' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 10, fill: '#8b949e' }} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="commits" stroke="#8b5cf6" strokeWidth={2} fill="url(#gradCommits)" dot={false} activeDot={{ r: 4, fill: '#8b5cf6', stroke: '#0d1117', strokeWidth: 2 }} />
        <Area type="monotone" dataKey="prs_merged" stroke="#06b6d4" strokeWidth={2} fill="url(#gradPRs)" dot={false} activeDot={{ r: 4, fill: '#06b6d4', stroke: '#0d1117', strokeWidth: 2 }} />
        <Area type="monotone" dataKey="issues_closed" stroke="#10b981" strokeWidth={2} fill="url(#gradReviews)" dot={false} activeDot={{ r: 4, fill: '#10b981', stroke: '#0d1117', strokeWidth: 2 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

