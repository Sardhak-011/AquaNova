import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Activity, TrendingUp, TrendingDown, ArrowRight, AlertTriangle, Stethoscope, Droplets, Thermometer, Wind, Eye, FlaskConical } from "lucide-react";

interface PredictiveAnalysisProps {
    history: any[];
    currentData: any;
}

export function PredictiveAnalysis({ history, currentData }: PredictiveAnalysisProps) {
    const [forecasts, setForecasts] = useState<any>(null);
    const [insights, setInsights] = useState<string[]>([]);
    const [solutions, setSolutions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch Forecasts (Existing Logic)
        if (history.length >= 5) {
            const fetchForecast = async () => {
                setLoading(true);
                try {
                    const response = await fetch('http://localhost:8000/api/forecast', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ history })
                    });
                    const data = await response.json();
                    if (data.projections) {
                        setForecasts(data.projections);
                        setInsights(data.insights);
                    }
                } catch (error) {
                    console.error("Forecast error:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchForecast();
        }

        // Fetch Detailed Solutions (New Logic for current state)
        const fetchSolutions = async () => {
            try {
                // We use the /predict endpoint as it already runs ExpertRules.evaluate -> get_detailed_solutions
                const response = await fetch('http://localhost:8000/predict', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        temperature: currentData.temperature,
                        ph: currentData.ph,
                        dissolved_oxygen: currentData.dissolved_oxygen || currentData.dissolvedOxygen,
                        turbidity: currentData.turbidity,
                        ammonia: currentData.ammonia || 0.02
                    })
                });
                const data = await response.json();
                if (data.detailed_solutions) {
                    setSolutions(data.detailed_solutions);
                }
            } catch (error) {
                console.error("Solutions error:", error);
            }
        };
        fetchSolutions();

    }, [history, currentData]);

    // Helper to merge history and forecast for a parameter
    const getChartData = (param: string) => {
        if (!forecasts || !forecasts[param]) return [];

        const historical = history.map((h, i) => ({
            time: i,
            actual: h[param],
            predicted: null
        }));

        const lastIdx = historical.length - 1;

        // Append forecast
        const prediction = forecasts[param].map((val: number, i: number) => ({
            time: lastIdx + i + 1,
            actual: null,
            predicted: val
        }));

        if (historical.length > 0 && prediction.length > 0) {
            prediction[0].actual = historical[lastIdx].actual; // Connect lines
        }

        return [...historical, ...prediction];
    };

    const renderChart = (title: string, param: string, unit: string, color: string) => (
        <Card className="bg-slate-900/40 border-white/10 backdrop-blur-xl">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-300 flex justify-between">
                    {title}
                    <span className="text-xs text-slate-500">{unit}</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={getChartData(param)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                            <XAxis hide />
                            <YAxis stroke="#94a3b8" fontSize={10} domain={['auto', 'auto']} tickFormatter={(val) => val.toFixed(1)} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} formatter={(val: number) => [val?.toFixed(2), "Value"]} labelStyle={{ display: 'none' }} />
                            <Line type="monotone" dataKey="actual" stroke={color} strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="predicted" stroke={color} strokeWidth={2} strokeDasharray="5 5" dot={false} opacity={0.7} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">

            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-teal-500/20 flex items-center justify-center border border-teal-500/30">
                    <Activity className="w-6 h-6 text-teal-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Predictive Analysis</h1>
                    <p className="text-slate-400 text-sm">AI-Driven Future Projections & Risk Mitigation</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Insights Panel */}
                <Card className="lg:col-span-3 bg-gradient-to-r from-indigo-900/40 to-slate-900/40 border-indigo-500/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-indigo-300">
                            <TrendingUp className="w-5 h-5" />
                            Trend Forecasts (Next 5 Mins)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {insights.length > 0 ? (
                            <div className="space-y-3">
                                {insights.map((insight, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                                        <ArrowRight className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                                        <p className="text-sm text-orange-100">{insight}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                <TrendingUp className="w-5 h-5 text-emerald-400" />
                                <p className="text-sm text-emerald-100">
                                    Trends appear stable. No rapid declines calculated.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Charts Grid */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderChart("Dissolved Oxygen Forecast", "dissolved_oxygen", "mg/L", "#2dd4bf")}
                    {renderChart("pH Level Forecast", "ph", "pH", "#60a5fa")}
                    {renderChart("Temperature Forecast", "temperature", "°C", "#fb923c")}
                    {renderChart("Turbidity Forecast", "turbidity", "NTU", "#c084fc")}
                </div>
            </div>

            {/* Simulation Risk Analysis - MOVED TO BOTTOM */}
            {solutions.length > 0 && (
                <div className="space-y-4 pt-8 border-t border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-6 h-6 text-red-400 animate-pulse" />
                        <h2 className="text-xl font-bold text-red-100">Simulation Risk Analysis & Solutions</h2>
                    </div>

                    {/* Scrollable Container */}
                    <div className="max-h-[600px] overflow-y-auto pr-2 space-y-6 custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {solutions.map((sol, i) => (
                                <Card key={i} className={`border-l-4 ${sol.severity === 'critical' ? 'border-l-red-500 bg-red-950/20' : 'border-l-orange-500 bg-orange-950/20'} border-white/10 backdrop-blur-xl shrink-0`}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className={`text-lg ${sol.severity === 'critical' ? 'text-red-300' : 'text-orange-300'} flex items-center gap-2`}>
                                                {sol.param === 'Temperature' && <Thermometer className="w-5 h-5" />}
                                                {sol.param === 'Dissolved Oxygen' && <Wind className="w-5 h-5" />}
                                                {sol.param === 'pH' && <FlaskConical className="w-5 h-5" />}
                                                {sol.param === 'Ammonia' && <FlaskConical className="w-5 h-5" />}
                                                {sol.param === 'Turbidity' && <Eye className="w-5 h-5" />}
                                                {sol.issue}
                                            </CardTitle>
                                            <span className="text-xs uppercase px-2 py-1 rounded bg-black/30 font-bold tracking-wider">{sol.severity}</span>
                                        </div>
                                        <CardDescription className="text-slate-300 mt-2 font-medium">
                                            Possible Outcome: {sol.risk}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="bg-slate-900/50 p-4 rounded-lg border border-white/5">
                                            <h4 className="text-sm font-bold text-emerald-400 mb-2 flex items-center gap-2">
                                                <Stethoscope className="w-4 h-4" /> Recommended Solution
                                            </h4>
                                            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                                                {sol.solution.replace(/\. (\d)/g, '.\n$1')}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
