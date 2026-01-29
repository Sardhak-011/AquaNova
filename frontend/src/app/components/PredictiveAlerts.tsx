import { AlertTriangle, TrendingUp, Shield } from "lucide-react";

interface Alert {
  id: string;
  disease: string;
  risk: number;
  recommendation: string;
  severity: "high" | "medium" | "low";
}

interface PredictiveAlertsProps {
  alerts: Alert[];
}

export function PredictiveAlerts({ alerts }: PredictiveAlertsProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "border-red-500/30 bg-red-500/10 text-red-400";
      case "medium":
        return "border-yellow-500/30 bg-yellow-500/10 text-yellow-400";
      case "low":
        return "border-blue-500/30 bg-blue-500/10 text-blue-400";
      default:
        return "border-slate-500/30 bg-slate-500/10 text-slate-400";
    }
  };

  return (
    <div className="relative bg-slate-900/40 backdrop-blur-xl border border-teal-500/20 rounded-xl p-6 overflow-hidden">
      {/* Glass effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
      
      <div className="relative z-10">
        {/* Header with pulse animation */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            {/* Pulse effect */}
            <div className="absolute inset-0 bg-red-500 rounded-lg animate-ping opacity-20"></div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">The Oracle</h3>
            <p className="text-sm text-slate-400">Predictive Disease Alerts</p>
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`border rounded-lg p-4 ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-semibold text-white">{alert.disease}</div>
                  <div className="text-xs mt-1 opacity-80">Risk Assessment</div>
                </div>
                <div className="text-2xl font-bold">{alert.risk}%</div>
              </div>
              <div className="flex items-start gap-2 mt-3 pt-3 border-t border-white/10">
                <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p className="text-xs">{alert.recommendation}</p>
              </div>
            </div>
          ))}
        </div>

        {/* AI Confidence */}
        <div className="mt-4 pt-4 border-t border-teal-500/20 flex items-center gap-2 text-xs text-slate-400">
          <TrendingUp className="w-4 h-4" />
          <span>AI Confidence: 94.2% • Updated 2 minutes ago</span>
        </div>
      </div>
    </div>
  );
}
