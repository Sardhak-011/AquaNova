import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, TrendingUp, History } from "lucide-react";

// Mock historical data
const generateTrendData = () => {
    return Array.from({ length: 30 }, (_, i) => ({
        day: `Day ${i + 1}`,
        healthScore: 85 + Math.random() * 10 - 5,
        riskLevel: Math.random() > 0.8 ? 2 : 0
    }));
};

const data = generateTrendData();

export function PredictiveAnalysis() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-lg bg-teal-500/20 flex items-center justify-center border border-teal-500/30">
                    <Activity className="w-6 h-6 text-teal-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white">Predictive Analysis</h1>
                    <p className="text-slate-400">Historical Trends & Disease Pattern Recognition</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Trend Chart */}
                <Card className="lg:col-span-2 bg-slate-900/40 border-white/10 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-teal-400" />
                            30-Day Health Trend
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            Water health score fluctuation over the last month.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data}>
                                    <defs>
                                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                                        itemStyle={{ color: '#2dd4bf' }}
                                    />
                                    <Area type="monotone" dataKey="healthScore" stroke="#2dd4bf" fillOpacity={1} fill="url(#colorScore)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Sidebar Stats */}
                <div className="space-y-6">
                    <Card className="bg-slate-900/40 border-white/10 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="text-white text-lg">Monthly Insights</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                <History className="w-5 h-5 text-emerald-400" />
                                <div>
                                    <p className="text-xs text-emerald-300 font-bold">AVG HEALTH SCORE</p>
                                    <p className="text-2xl font-bold text-white">92.4</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                                <Activity className="w-5 h-5 text-indigo-400" />
                                <div>
                                    <p className="text-xs text-indigo-300 font-bold">PREDICTIONS MADE</p>
                                    <p className="text-2xl font-bold text-white">720</p>
                                </div>
                            </div>

                            <div className="p-4 rounded-lg bg-slate-800/50 border border-white/5">
                                <p className="text-sm text-slate-300 leading-relaxed">
                                    Overall water quality has been stable this month.
                                    Minor dip observed on Day 12 due to temporary temperature fluctuation.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 border border-white/10 text-center">
                        <h3 className="text-white font-bold text-lg mb-2">Want to Run Simulations?</h3>
                        <p className="text-indigo-100 text-sm mb-4">
                            Test hypothetical scenarios with our new interactive tool.
                        </p>
                        <p className="text-xs bg-white/20 inline-block px-3 py-1 rounded-full text-white">
                            Go to "What-if Simulation" Tab
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
