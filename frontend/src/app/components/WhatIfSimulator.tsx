import { Slider } from "@/app/components/ui/slider";
import { Beaker, AlertCircle } from "lucide-react";

interface WhatIfSimulatorProps {
  temperature: number;
  pH: number;
  ammonia: number;
  onTemperatureChange: (value: number) => void;
  onPHChange: (value: number) => void;
  onAmmoniaChange: (value: number) => void;
  predictedScore: number;
  diseaseRisk: number;
}

export function WhatIfSimulator({
  temperature,
  pH,
  ammonia,
  onTemperatureChange,
  onPHChange,
  onAmmoniaChange,
  predictedScore,
  diseaseRisk,
}: WhatIfSimulatorProps) {
  return (
    <div className="relative bg-slate-900/40 backdrop-blur-xl border border-teal-500/20 rounded-xl p-6 overflow-hidden">
      {/* Glass effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <Beaker className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">What-If Simulator</h3>
            <p className="text-sm text-slate-400">Adjust parameters to predict outcomes</p>
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-6 mb-6">
          {/* Temperature */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm text-slate-300">Temperature</label>
              <span className="text-sm font-semibold text-white">{temperature}°C</span>
            </div>
            <Slider
              value={[temperature]}
              onValueChange={(values) => onTemperatureChange(values[0])}
              min={15}
              max={35}
              step={0.5}
              className="[&_[role=slider]]:bg-teal-500 [&_[role=slider]]:border-teal-400"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>15°C</span>
              <span>35°C</span>
            </div>
          </div>

          {/* pH */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm text-slate-300">pH Level</label>
              <span className="text-sm font-semibold text-white">{pH.toFixed(1)}</span>
            </div>
            <Slider
              value={[pH]}
              onValueChange={(values) => onPHChange(values[0])}
              min={4}
              max={10}
              step={0.1}
              className="[&_[role=slider]]:bg-teal-500 [&_[role=slider]]:border-teal-400"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>4.0</span>
              <span>10.0</span>
            </div>
          </div>

          {/* Ammonia */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm text-slate-300">Ammonia Level</label>
              <span className="text-sm font-semibold text-white">{ammonia.toFixed(2)} mg/L</span>
            </div>
            <Slider
              value={[ammonia]}
              onValueChange={(values) => onAmmoniaChange(values[0])}
              min={0}
              max={5}
              step={0.05}
              className="[&_[role=slider]]:bg-teal-500 [&_[role=slider]]:border-teal-400"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>0 mg/L</span>
              <span>5 mg/L</span>
            </div>
          </div>
        </div>

        {/* Predictions */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-teal-500/20">
          {/* Predicted Water Health Score */}
          <div className="bg-slate-800/50 rounded-lg p-4 border border-teal-500/20">
            <div className="text-xs text-slate-400 mb-1">Predicted Score</div>
            <div className={`text-2xl font-bold ${
              predictedScore >= 71 ? 'text-emerald-400' : 
              predictedScore >= 41 ? 'text-yellow-400' : 
              'text-red-400'
            }`}>
              {predictedScore}
            </div>
          </div>

          {/* Disease Risk */}
          <div className="bg-slate-800/50 rounded-lg p-4 border border-red-500/20">
            <div className="text-xs text-slate-400 mb-1">Disease Risk</div>
            <div className="flex items-center gap-2">
              <div className={`text-2xl font-bold ${
                diseaseRisk >= 70 ? 'text-red-400' : 
                diseaseRisk >= 40 ? 'text-yellow-400' : 
                'text-emerald-400'
              }`}>
                {diseaseRisk}%
              </div>
              {diseaseRisk >= 70 && <AlertCircle className="w-4 h-4 text-red-400" />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
