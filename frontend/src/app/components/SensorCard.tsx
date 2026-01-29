import { LucideIcon } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface SensorCardProps {
  title: string;
  value: number;
  unit: string;
  icon: LucideIcon;
  data: number[];
  status: "normal" | "warning" | "critical";
}

export function SensorCard({ title, value, unit, icon: Icon, data, status }: SensorCardProps) {
  const statusColors = {
    normal: "border-emerald-500/30 bg-emerald-500/5",
    warning: "border-yellow-500/30 bg-yellow-500/5",
    critical: "border-red-500/30 bg-red-500/5",
  };

  const chartColors = {
    normal: "#22c55e",
    warning: "#eab308",
    critical: "#ef4444",
  };

  const sparklineData = data.map((val, idx) => ({ value: val }));

  return (
    <div className={`relative bg-slate-900/40 backdrop-blur-xl border rounded-xl p-4 ${statusColors[status]} overflow-hidden`}>
      {/* Glass effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center">
              <Icon className="w-4 h-4 text-teal-400" />
            </div>
            <span className="text-sm text-slate-400">{title}</span>
          </div>
        </div>

        {/* Value */}
        <div className="mb-3">
          <span className="text-2xl font-bold text-white">{value.toFixed(1)}</span>
          <span className="text-sm text-slate-400 ml-2">{unit}</span>
        </div>

        {/* Sparkline */}
        <div className="h-12 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparklineData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={chartColors[status]}
                strokeWidth={2}
                dot={false}
                animationDuration={500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
