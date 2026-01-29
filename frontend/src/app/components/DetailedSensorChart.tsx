import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

interface DetailedSensorChartProps {
  title: string;
  data: Array<{ time: string; value: number }>;
  color: string;
  unit: string;
}

export function DetailedSensorChart({ title, data, color, unit }: DetailedSensorChartProps) {
  return (
    <div className="relative bg-slate-900/40 backdrop-blur-xl border border-teal-500/20 rounded-xl p-6 overflow-hidden">
      {/* Glass effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-sm text-slate-400">Last 24 hours</p>
        </div>

        {/* Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis
                dataKey="time"
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                label={{ value: unit, angle: -90, position: "insideLeft", style: { fill: "#64748b" } }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                labelStyle={{ color: "#94a3b8" }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                fill={`url(#gradient-${title})`}
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-teal-500/20">
          <div>
            <div className="text-xs text-slate-400 mb-1">Min</div>
            <div className="text-sm font-semibold text-white">
              {Math.min(...data.map(d => d.value)).toFixed(1)} {unit}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">Avg</div>
            <div className="text-sm font-semibold text-white">
              {(data.reduce((sum, d) => sum + d.value, 0) / data.length).toFixed(1)} {unit}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">Max</div>
            <div className="text-sm font-semibold text-white">
              {Math.max(...data.map(d => d.value)).toFixed(1)} {unit}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
