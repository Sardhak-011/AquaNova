import React, { useState, useEffect } from 'react';
import {
  Waves,
  Activity,
  Brain,
  Settings,
  Droplets,
  Thermometer,
  Wind,
  Eye,
  Gauge,
  AlertTriangle,
  MessageCircle,
  Camera,
  ChevronDown,
  CheckCircle2,
  Target,
  X
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { PredictiveAnalysis } from './components/PredictiveAnalysis';


// Mock sensor data generator
const generateSensorData = (baseValue: number, variance: number) => {
  return Array.from({ length: 20 }, (_, i) => ({
    time: i,
    value: baseValue + (Math.random() - 0.5) * variance
  }));
};

// Calculate Water Health Score based on parameters
const calculateWaterHealthScore = (temp: number, ph: number, ammonia: number) => {
  // Ideal ranges: Temp (26-30°C), pH (6.5-8.5), Ammonia (0-0.02 ppm)
  let score = 100;

  // Temperature scoring (ideal: 26-30)
  if (temp < 20 || temp > 35) score -= 30;
  else if (temp < 24 || temp > 32) score -= 15;
  else if (temp < 26 || temp > 30) score -= 5;

  // pH scoring (ideal: 6.5-8.5)
  if (ph < 5 || ph > 10) score -= 40;
  else if (ph < 6 || ph > 9) score -= 20;
  else if (ph < 6.5 || ph > 8.5) score -= 8;

  // Ammonia scoring (ideal: 0-0.02)
  if (ammonia > 0.1) score -= 40;
  else if (ammonia > 0.05) score -= 20;
  else if (ammonia > 0.02) score -= 10;

  return Math.max(0, Math.min(100, score));
};

// Calculate disease risk
const calculateDiseaseRisk = (temp: number, ph: number, ammonia: number) => {
  const healthScore = calculateWaterHealthScore(temp, ph, ammonia);
  return Math.max(0, Math.min(100, 100 - healthScore + Math.random() * 10));
};

// Get health score color
const getHealthScoreColor = (score: number) => {
  if (score >= 71) return 'text-emerald-400';
  if (score >= 41) return 'text-yellow-400';
  return 'text-red-400';
};

const getHealthScoreGradient = (score: number) => {
  if (score >= 71) return 'from-emerald-500 to-teal-400';
  if (score >= 41) return 'from-yellow-500 to-orange-400';
  return 'from-red-500 to-rose-400';
};

export default function App() {
  const [activeNav, setActiveNav] = useState('Live Monitor');
  const [selectedSpecies, setSelectedSpecies] = useState('Tilapia');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', text: 'Hello! I\'m AquaGPT. How can I assist you with your aquaculture monitoring today?' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Generate particle positions once
  const [particles] = useState(() =>
    Array.from({ length: 20 }, () => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 15 + Math.random() * 10
    }))
  );

  // What-If Simulator states
  const [simTemp, setSimTemp] = useState(28);
  const [simPH, setSimPH] = useState(7.5);
  const [simAmmonia, setSimAmmonia] = useState(0.01);

  // Real-time sensor data
  const [sensorData, setSensorData] = useState({
    ph: 7.2,
    temperature: 28.5,
    dissolvedOxygen: 6.8,
    turbidity: 12.3,
    salinity: 15.2,
    ammonia: 0.015
  });

  // Historical data for charts
  const [phData] = useState(generateSensorData(7.2, 0.4));
  const [tempData] = useState(generateSensorData(28.5, 1.5));
  const [doData] = useState(generateSensorData(6.8, 0.8));
  const [turbidityData] = useState(generateSensorData(12.3, 2));
  const [salinityData] = useState(generateSensorData(15.2, 1));
  const [ammoniaData] = useState(generateSensorData(0.015, 0.005));

  // Calculate scores
  const waterHealthScore = Math.round(calculateWaterHealthScore(sensorData.temperature, sensorData.ph, sensorData.ammonia));
  const simHealthScore = Math.round(calculateWaterHealthScore(simTemp, simPH, simAmmonia));
  const simDiseaseRisk = Math.round(calculateDiseaseRisk(simTemp, simPH, simAmmonia));

  // Simulate live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSensorData(prev => ({
        ph: Math.max(6, Math.min(9, prev.ph + (Math.random() - 0.5) * 0.1)),
        temperature: Math.max(24, Math.min(32, prev.temperature + (Math.random() - 0.5) * 0.3)),
        dissolvedOxygen: Math.max(5, Math.min(8, prev.dissolvedOxygen + (Math.random() - 0.5) * 0.2)),
        turbidity: Math.max(8, Math.min(20, prev.turbidity + (Math.random() - 0.5) * 0.5)),
        salinity: Math.max(12, Math.min(18, prev.salinity + (Math.random() - 0.5) * 0.3)),
        ammonia: Math.max(0, Math.min(0.05, prev.ammonia + (Math.random() - 0.5) * 0.002))
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    setChatMessages(prev => [...prev, { role: 'user', text: chatInput }]);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        'Based on your current water parameters, everything looks optimal. Keep monitoring the dissolved oxygen levels.',
        'I recommend checking the filtration system. Turbidity levels are slightly elevated.',
        'The temperature is within ideal range for Tilapia. Water health score is excellent.',
        'Consider testing ammonia levels more frequently. I\'ve detected a slight upward trend.'
      ];
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        text: responses[Math.floor(Math.random() * responses.length)]
      }]);
    }, 1000);

    setChatInput('');
  };

  return (
    <div className="min-h-screen bg-[#0a0e27] text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0f1729]" />

        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-cyan-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />
        <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-6000" />

        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(20,184,166,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />

        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(20,184,166,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(59,130,246,0.15),transparent_50%)]" />

        {/* Floating particles */}
        <div className="absolute inset-0">
          {particles.map((p, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-teal-400/40 rounded-full animate-float"
              style={{
                left: `${p.left}%`,
                top: `${p.top}%`,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Content with z-index to appear above background */}
      <div className="relative z-10">
        {/* Sidebar */}
        <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900/60 backdrop-blur-2xl border-r border-teal-500/20 shadow-2xl z-50">
          <div className="p-6 border-b border-teal-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center shadow-lg shadow-teal-500/50">
                <Waves className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-teal-300 to-blue-400 bg-clip-text text-transparent">AquaNova</h2>
                <p className="text-xs text-teal-300">Smart Aquaculture</p>
              </div>
            </div>
          </div>

          <nav className="p-4 space-y-2">
            {[
              { name: 'Live Monitor', icon: Activity },
              { name: 'Predictive Analytics', icon: Brain },
              { name: 'Fish Health AI', icon: Eye },
              { name: 'Settings', icon: Settings }
            ].map((item) => (
              <button
                key={item.name}
                onClick={() => setActiveNav(item.name)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeNav === item.name
                    ? 'bg-gradient-to-r from-teal-500/30 to-blue-500/30 border border-teal-400/50 shadow-lg shadow-teal-500/20'
                    : 'hover:bg-white/5 border border-transparent'
                  }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm">{item.name}</span>
              </button>
            ))}
          </nav>

          {/* SDG-14 Badge */}
          <div className="absolute bottom-6 left-6 right-6">
            <div className="bg-gradient-to-r from-blue-500/30 to-teal-500/30 border border-blue-400/40 rounded-lg p-4 backdrop-blur-sm shadow-xl">
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-xs text-blue-200">Supporting</p>
                  <p className="font-bold text-sm">SDG-14</p>
                  <p className="text-xs text-teal-300">Life Below Water</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="ml-64 min-h-screen">
          {/* Header */}
          <header className="bg-slate-900/60 backdrop-blur-2xl border-b border-teal-500/20 sticky top-0 z-40 shadow-lg">
            <div className="px-8 py-4 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 px-4 py-2 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-sm text-emerald-300">System Status: Online</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400">Species:</span>
                  <div className="relative">
                    <select
                      value={selectedSpecies}
                      onChange={(e) => setSelectedSpecies(e.target.value)}
                      className="bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2 pr-10 appearance-none cursor-pointer text-sm backdrop-blur-sm"
                    >
                      <option>Tilapia</option>
                      <option>Catla</option>
                      <option>Shrimp</option>
                      <option>Salmon</option>
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <div className="p-8 space-y-6">
            {activeNav === 'Live Monitor' ? (
              <>
                {/* Top Row - Main Gauge and Oracle Alerts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* The Pulse - Water Health Score */}
                  <div className="lg:col-span-2 bg-gradient-to-br from-slate-900/60 via-slate-800/40 to-slate-900/60 backdrop-blur-2xl border border-teal-500/30 rounded-2xl p-8 shadow-2xl shadow-teal-500/10 hover:shadow-teal-500/20 transition-all">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-2xl font-bold mb-1 bg-gradient-to-r from-teal-300 to-blue-400 bg-clip-text text-transparent">The Pulse</h3>
                        <p className="text-sm text-slate-400">Real-time Water Health Assessment</p>
                      </div>
                      <Gauge className="w-6 h-6 text-teal-400" />
                    </div>

                    <div className="flex items-center justify-center py-8">
                      <div className="relative">
                        {/* Circular gauge */}
                        <svg className="w-64 h-64 transform -rotate-90 drop-shadow-2xl">
                          <circle
                            cx="128"
                            cy="128"
                            r="110"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="16"
                            fill="none"
                          />
                          <circle
                            cx="128"
                            cy="128"
                            r="110"
                            stroke="url(#healthGradient)"
                            strokeWidth="16"
                            fill="none"
                            strokeDasharray={`${(waterHealthScore / 100) * 691} 691`}
                            strokeLinecap="round"
                            className="transition-all duration-1000 drop-shadow-lg"
                          />
                          <defs>
                            <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" className={waterHealthScore >= 71 ? 'text-emerald-500' : waterHealthScore >= 41 ? 'text-yellow-500' : 'text-red-500'} stopColor="currentColor" />
                              <stop offset="100%" className={waterHealthScore >= 71 ? 'text-teal-400' : waterHealthScore >= 41 ? 'text-orange-400' : 'text-rose-400'} stopColor="currentColor" />
                            </linearGradient>
                          </defs>
                        </svg>

                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className={`text-6xl font-bold ${getHealthScoreColor(waterHealthScore)} drop-shadow-lg`}>
                            {waterHealthScore}
                          </div>
                          <div className="text-sm text-slate-400 mt-2">Health Score</div>
                          <div className="mt-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs backdrop-blur-sm">
                            {waterHealthScore >= 71 ? '✓ Optimal' : waterHealthScore >= 41 ? '⚠ Moderate' : '⚠ Critical'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* The Oracle - Predictive Alerts */}
                  <div className="bg-gradient-to-br from-slate-900/60 via-slate-800/40 to-slate-900/60 backdrop-blur-2xl border border-orange-500/30 rounded-2xl p-6 shadow-2xl shadow-orange-500/10 hover:shadow-orange-500/20 transition-all">
                    <div className="flex items-center gap-2 mb-6">
                      <AlertTriangle className="w-5 h-5 text-orange-400 animate-pulse" />
                      <h3 className="text-xl font-bold">The Oracle</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-400/30 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse mt-1.5" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-red-300 mb-1">Ich Disease Risk</p>
                            <p className="text-2xl font-bold text-red-400 mb-2">82%</p>
                            <p className="text-xs text-slate-300">Immediate Action Recommended</p>
                            <p className="text-xs text-slate-400 mt-2">Monitor temperature fluctuations closely</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-400/30 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse mt-1.5" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-yellow-300 mb-1">Fin Rot Risk</p>
                            <p className="text-2xl font-bold text-yellow-400 mb-2">45%</p>
                            <p className="text-xs text-slate-300">Monitor Closely</p>
                            <p className="text-xs text-slate-400 mt-2">Check water quality parameters</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-400/30 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-green-300">Fungal Risk</p>
                            <p className="text-xl font-bold text-green-400">Low (12%)</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Sensor Grid */}
                <div>
                  <h3 className="text-xl font-bold mb-4">Live Sensor Grid</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* pH Sensor */}
                    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <Droplets className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">pH Level</p>
                            <p className="text-2xl font-bold">{sensorData.ph.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="h-16">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={phData}>
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke="#60a5fa"
                              strokeWidth={2}
                              dot={false}
                              animationDuration={300}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Temperature Sensor */}
                    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                            <Thermometer className="w-5 h-5 text-orange-400" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">Temperature</p>
                            <p className="text-2xl font-bold">{sensorData.temperature.toFixed(1)}°C</p>
                          </div>
                        </div>
                      </div>
                      <div className="h-16">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={tempData}>
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke="#fb923c"
                              strokeWidth={2}
                              dot={false}
                              animationDuration={300}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Dissolved Oxygen */}
                    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center">
                            <Wind className="w-5 h-5 text-teal-400" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">Dissolved O₂</p>
                            <p className="text-2xl font-bold">{sensorData.dissolvedOxygen.toFixed(1)}<span className="text-sm text-slate-400 ml-1">mg/L</span></p>
                          </div>
                        </div>
                      </div>
                      <div className="h-16">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={doData}>
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke="#2dd4bf"
                              strokeWidth={2}
                              dot={false}
                              animationDuration={300}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Turbidity */}
                    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                            <Eye className="w-5 h-5 text-purple-400" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">Turbidity</p>
                            <p className="text-2xl font-bold">{sensorData.turbidity.toFixed(1)}<span className="text-sm text-slate-400 ml-1">NTU</span></p>
                          </div>
                        </div>
                      </div>
                      <div className="h-16">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={turbidityData}>
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke="#c084fc"
                              strokeWidth={2}
                              dot={false}
                              animationDuration={300}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Salinity */}
                    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                            <Droplets className="w-5 h-5 text-cyan-400" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">Salinity</p>
                            <p className="text-2xl font-bold">{sensorData.salinity.toFixed(1)}<span className="text-sm text-slate-400 ml-1">ppt</span></p>
                          </div>
                        </div>
                      </div>
                      <div className="h-16">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={salinityData}>
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke="#22d3ee"
                              strokeWidth={2}
                              dot={false}
                              animationDuration={300}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Ammonia */}
                    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-rose-400" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">Ammonia</p>
                            <p className="text-2xl font-bold">{sensorData.ammonia.toFixed(3)}<span className="text-sm text-slate-400 ml-1">ppm</span></p>
                          </div>
                        </div>
                      </div>
                      <div className="h-16">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={ammoniaData}>
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke="#fb7185"
                              strokeWidth={2}
                              dot={false}
                              animationDuration={300}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Row - What-If Simulator and CV Diagnoser */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* What-If Simulator */}
                  <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <Brain className="w-5 h-5 text-purple-400" />
                      <h3 className="text-xl font-bold">What-If Simulator</h3>
                    </div>

                    <div className="space-y-6">
                      {/* Temperature Slider */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm text-slate-300">Temperature (°C)</label>
                          <span className="text-sm font-bold text-orange-400">{simTemp}°C</span>
                        </div>
                        <input
                          type="range"
                          min="20"
                          max="35"
                          step="0.5"
                          value={simTemp}
                          onChange={(e) => setSimTemp(parseFloat(e.target.value))}
                          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                        />
                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                          <span>20°C</span>
                          <span>35°C</span>
                        </div>
                      </div>

                      {/* pH Slider */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm text-slate-300">pH Level</label>
                          <span className="text-sm font-bold text-blue-400">{simPH.toFixed(1)}</span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="10"
                          step="0.1"
                          value={simPH}
                          onChange={(e) => setSimPH(parseFloat(e.target.value))}
                          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                          <span>5.0</span>
                          <span>10.0</span>
                        </div>
                      </div>

                      {/* Ammonia Slider */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm text-slate-300">Ammonia (ppm)</label>
                          <span className="text-sm font-bold text-rose-400">{simAmmonia.toFixed(3)}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="0.2"
                          step="0.001"
                          value={simAmmonia}
                          onChange={(e) => setSimAmmonia(parseFloat(e.target.value))}
                          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
                        />
                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                          <span>0.000</span>
                          <span>0.200</span>
                        </div>
                      </div>

                      {/* Predicted Results */}
                      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/10 rounded-xl p-4 mt-6">
                        <p className="text-xs text-slate-400 mb-3">Predicted Outcomes</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-slate-400 mb-1">Health Score</p>
                            <p className={`text-3xl font-bold ${getHealthScoreColor(simHealthScore)}`}>
                              {simHealthScore}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400 mb-1">Disease Risk</p>
                            <p className={`text-3xl font-bold ${simDiseaseRisk > 70 ? 'text-red-400' : simDiseaseRisk > 40 ? 'text-yellow-400' : 'text-green-400'}`}>
                              {simDiseaseRisk}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CV Diagnoser */}
                  <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <Camera className="w-5 h-5 text-teal-400" />
                      <h3 className="text-xl font-bold">CV Diagnoser</h3>
                    </div>

                    <div className="border-2 border-dashed border-white/20 rounded-xl p-12 text-center hover:border-teal-400/50 transition-colors cursor-pointer group">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-teal-500/20 to-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Camera className="w-10 h-10 text-teal-400" />
                      </div>
                      <p className="text-sm text-slate-300 mb-2">Drop fish image here or click to upload</p>
                      <p className="text-xs text-slate-500">AI-powered disease detection</p>
                      <button className="mt-4 px-6 py-2 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg text-sm font-semibold hover:from-teal-400 hover:to-blue-400 transition-all">
                        Select Image
                      </button>
                    </div>

                    <div className="mt-6 space-y-3">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        <span>Supports: JPG, PNG (Max 10MB)</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        <span>Detects 15+ common fish diseases</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        <span>95% accuracy rate</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : activeNav === 'Predictive Analytics' ? (
              <PredictiveAnalysis />
            ) : (
              <div className="flex items-center justify-center h-64 text-slate-400">
                <p>Section under construction</p>
              </div>
            )}
          </div>
        </main>

        {/* AquaGPT Chatbot */}
        {!chatOpen && (
          <button
            onClick={() => setChatOpen(true)}
            className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-500 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-50 group"
          >
            <MessageCircle className="w-7 h-7 text-white group-hover:scale-110 transition-transform" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-slate-900 animate-pulse" />
          </button>
        )}

        {chatOpen && (
          <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl flex flex-col z-50">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-teal-500/20 to-blue-500/20 border-b border-white/10 p-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold">AquaGPT Assistant</h3>
                  <p className="text-xs text-teal-300">AI-Powered Support</p>
                </div>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="w-8 h-8 hover:bg-white/10 rounded-lg flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${msg.role === 'user'
                        ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white'
                        : 'bg-slate-800/50 border border-white/10'
                      }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="border-t border-white/10 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask about your aquaculture..."
                  className="flex-1 bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2 text-sm outline-none focus:border-teal-400/50 transition-colors"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg hover:from-teal-400 hover:to-blue-400 transition-all"
                >
                  <MessageCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}