interface WaterHealthGaugeProps {
  score: number;
}

export function WaterHealthGauge({ score }: WaterHealthGaugeProps) {
  // Determine color based on score
  const getColor = (score: number) => {
    if (score <= 40) return { primary: "#ef4444", secondary: "#dc2626", text: "Critical" };
    if (score <= 70) return { primary: "#eab308", secondary: "#ca8a04", text: "Moderate" };
    return { primary: "#22c55e", secondary: "#16a34a", text: "Optimal" };
  };

  const color = getColor(score);
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
        {/* Background circle */}
        <circle
          cx="100"
          cy="100"
          r="90"
          fill="none"
          stroke="rgba(15, 23, 42, 0.5)"
          strokeWidth="12"
        />
        
        {/* Progress circle with gradient */}
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color.primary} />
            <stop offset="100%" stopColor={color.secondary} />
          </linearGradient>
        </defs>
        <circle
          cx="100"
          cy="100"
          r="90"
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-5xl font-bold text-white mb-2">{score}</div>
        <div className="text-sm text-slate-400 mb-1">Water Health Score</div>
        <div className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: `${color.primary}20`, color: color.primary }}>
          {color.text}
        </div>
      </div>
    </div>
  );
}
