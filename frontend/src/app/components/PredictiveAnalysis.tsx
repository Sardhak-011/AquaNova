import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Activity, TrendingUp, TrendingDown, ArrowRight, AlertTriangle } from "lucide-react";

interface PredictiveAnalysisProps {
    history: any[];
}

export function PredictiveAnalysis({ history }: PredictiveAnalysisProps) {
    const [forecasts, setForecasts] = useState<any>(null);
    const [insights, setInsights] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (history.length < 5) return;

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

        // Throttle calls - only call if we have enough new data, but for now just call on changes
        const timeoutId = setTimeout(fetchForecast, 1000);
        return () => clearTimeout(timeoutId);

    }, [history]);

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

        // Connect the lines
        if (historical.length > 0 && prediction.length > 0) {
            prediction[0].actual = historical[lastIdx].actual; // Start prediction where history ends
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
                            <YAxis
                                stroke="#94a3b8"
                                fontSize={10}
                                domain={['auto', 'auto']}
                                tickFormatter={(val) => val.toFixed(1)}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                                labelStyle={{ display: 'none' }}
                                formatter={(val: number) => [val?.toFixed(2), "Value"]}
                            />
                            {/* Actual Data Line */}
                            <Line
                                type="monotone"
                                dataKey="actual"
                                stroke={color}
                                strokeWidth={2}
                                dot={false}
                            />
                            {/* Forecast Data Line (Dashed) */}
                            <Line
                                type="monotone"
                                dataKey="predicted"
                                stroke={color}
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                dot={false}
                                opacity={0.7}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-teal-500/20 flex items-center justify-center border border-teal-500/30">
                    <Activity className="w-6 h-6 text-teal-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Predictive Analysis</h1>
                    <p className="text-slate-400 text-sm">AI-Driven Future Projections (Next 5 Mins)</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Insights Panel */}
                <Card className="lg:col-span-3 bg-gradient-to-r from-indigo-900/40 to-slate-900/40 border-indigo-500/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-indigo-300">
                            <TrendingUp className="w-5 h-5" />
                            AI Insights & Alerts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {insights.length > 0 ? (
                            <div className="space-y-3">
                                {insights.map((insight, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                        <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                        <p className="text-sm text-red-100">{insight}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                <TrendingUp className="w-5 h-5 text-emerald-400" />
                                <p className="text-sm text-emerald-100">
                                    All parameters are trending within safe limits. No immediate risks detected in the near future.
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
        </div>
    );
}
