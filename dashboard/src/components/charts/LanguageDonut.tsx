import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { Language } from '../../types/metrics';

interface Props {
  data: Language[];
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="custom-tooltip">
      <div className="flex items-center gap-2">
        <div className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
        <span className="text-xs font-semibold text-dark-100">{d.language}</span>
      </div>
      <p className="text-xs text-dark-300 mt-1 font-mono">{d.percentage}%</p>
    </div>
  );
}

export default function LanguageDonut({ data }: Props) {
  return (
    <div className="flex items-center gap-6">
      <div className="w-40 h-40 flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={70}
              paddingAngle={2}
              dataKey="percentage"
              stroke="none"
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} className="transition-opacity hover:opacity-80" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex-1 space-y-2">
        {data.map((lang) => (
          <div key={lang.language} className="flex items-center gap-3">
            <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: lang.color }} />
            <span className="text-xs text-dark-200 flex-1 truncate">{lang.language}</span>
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 rounded-full bg-dark-700/50 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${lang.percentage}%`, background: lang.color }}
                />
              </div>
              <span className="text-[11px] font-mono text-dark-300 w-10 text-right">{lang.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

