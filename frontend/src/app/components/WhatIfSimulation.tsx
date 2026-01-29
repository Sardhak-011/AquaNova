
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Label } from "@/app/components/ui/label";
import { Brain, RefreshCw, AlertTriangle, CheckCircle2, Info } from "lucide-react";

interface PredictionResult {
    disease_name?: string;
    disease_level: number;
    risk_status: string;
    confidence: number;
    recommendation: string;
    triggers: string[];
    suggestions?: string[];
    suggestions_map?: Record<string, string>;
    health_score: number;
}

export function WhatIfSimulation() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<PredictionResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [params, setParams] = useState({
        temperature: 28.5,
        ph: 7.2,
        dissolved_oxygen: 6.8,
        turbidity: 12.3,
        ammonia: 0.01
    });

    // Debounce the API call
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchPrediction();
        }, 500);

        return () => clearTimeout(timer);
    }, [params]);

    const fetchPrediction = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:8000/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params),
            });

            if (!response.ok) throw new Error('Failed to fetch prediction');
            const data = await response.json();
            if (data.error) throw new Error(data.error);

            setResult(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Simulation failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSliderChange = (name: string, value: number) => {
        setParams(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-400';
        if (score >= 50) return 'text-yellow-400';
        return 'text-red-400';
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                    <Brain className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white">What-if Simulation</h1>
                    <p className="text-slate-400">Interactive Logic-Based Water Quality assessment</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Control Panel */}
                <Card className="lg:col-span-1 bg-slate-900/40 border-white/10 backdrop-blur-xl h-fit">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center justify-between">
                            Parameters
                            {loading && <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />}
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            Adjust sliders to simulate different water conditions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        {/* Temperature */}
                        <div className="space-y-3 relative group/temp">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Label className="text-slate-300">Temperature (°C)</Label>
                                    {result?.suggestions_map?.temperature && (
                                        <div className="group/info relative">
                                            <Info className="w-4 h-4 text-orange-400 cursor-help animate-pulse" />
                                            <div className="absolute left-0 bottom-6 w-64 p-3 text-xs text-white bg-slate-900/95 border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all z-50 backdrop-blur-md">
                                                {result.suggestions_map.temperature}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <span className="font-mono text-indigo-300">{params.temperature.toFixed(1)}</span>
                            </div>
                            <input
                                type="range"
                                min="15"
                                max="40"
                                step="0.5"
                                value={params.temperature}
                                onChange={(e) => handleSliderChange('temperature', parseFloat(e.target.value))}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                            <div className="flex justify-between text-xs text-slate-500">
                                <span>15°C</span>
                                <span>Optimal: 20-34</span>
                                <span>40°C</span>
                            </div>
                        </div>

                        {/* pH */}
                        <div className="space-y-3 relative group/ph">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Label className="text-slate-300">pH Level</Label>
                                    {result?.suggestions_map?.ph && (
                                        <div className="group/info relative">
                                            <Info className="w-4 h-4 text-orange-400 cursor-help animate-pulse" />
                                            <div className="absolute left-0 bottom-6 w-64 p-3 text-xs text-white bg-slate-900/95 border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all z-50 backdrop-blur-md">
                                                {result.suggestions_map.ph}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <span className="font-mono text-purple-300">{params.ph.toFixed(1)}</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="14"
                                step="0.1"
                                value={params.ph}
                                onChange={(e) => handleSliderChange('ph', parseFloat(e.target.value))}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                            />
                            <div className="flex justify-between text-xs text-slate-500">
                                <span>0</span>
                                <span>Optimal: 7.0-8.0</span>
                                <span>14</span>
                            </div>
                        </div>

                        {/* Dissolved Oxygen */}
                        <div className="space-y-3 relative group/do">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Label className="text-slate-300">Dissolved Oxygen (mg/L)</Label>
                                    {result?.suggestions_map?.dissolved_oxygen && (
                                        <div className="group/info relative">
                                            <Info className="w-4 h-4 text-orange-400 cursor-help animate-pulse" />
                                            <div className="absolute left-0 bottom-6 w-64 p-3 text-xs text-white bg-slate-900/95 border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all z-50 backdrop-blur-md">
                                                {result.suggestions_map.dissolved_oxygen}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <span className="font-mono text-teal-300">{params.dissolved_oxygen.toFixed(1)}</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="15"
                                step="0.1"
                                value={params.dissolved_oxygen}
                                onChange={(e) => handleSliderChange('dissolved_oxygen', parseFloat(e.target.value))}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
                            />
                            <div className="flex justify-between text-xs text-slate-500">
                                <span>0</span>
                                <span>Target: &gt; 6.0</span>
                                <span>15</span>
                            </div>
                        </div>

                        {/* Turbidity */}
                        <div className="space-y-3 relative group/turb">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Label className="text-slate-300">Turbidity (NTU)</Label>
                                    {result?.suggestions_map?.turbidity && (
                                        <div className="group/info relative">
                                            <Info className="w-4 h-4 text-orange-400 cursor-help animate-pulse" />
                                            <div className="absolute left-0 bottom-6 w-64 p-3 text-xs text-white bg-slate-900/95 border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all z-50 backdrop-blur-md">
                                                {result.suggestions_map.turbidity}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <span className="font-mono text-orange-300">{params.turbidity.toFixed(1)}</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="50"
                                step="0.5"
                                value={params.turbidity}
                                onChange={(e) => handleSliderChange('turbidity', parseFloat(e.target.value))}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                            />
                            <div className="flex justify-between text-xs text-slate-500">
                                <span>0</span>
                                <span>Target: &lt; 15</span>
                                <span>50</span>
                            </div>
                        </div>

                        {/* Ammonia */}
                        <div className="space-y-3 relative group/ammonia">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Label className="text-slate-300">Ammonia (ppm)</Label>
                                    {result?.suggestions_map?.ammonia && (
                                        <div className="group/info relative">
                                            <Info className="w-4 h-4 text-orange-400 cursor-help animate-pulse" />
                                            <div className="absolute left-0 bottom-6 w-64 p-3 text-xs text-white bg-slate-900/95 border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all z-50 backdrop-blur-md">
                                                {result.suggestions_map.ammonia}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <span className="font-mono text-rose-300">{params.ammonia?.toFixed(2) || "0.00"}</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="1.0"
                                step="0.01"
                                value={params.ammonia || 0}
                                onChange={(e) => handleSliderChange('ammonia', parseFloat(e.target.value))}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
                            />
                            <div className="flex justify-between text-xs text-slate-500">
                                <span>0</span>
                                <span>Target: &lt; 0.02</span>
                                <span>1.0</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Results Panel */}
                <div className="lg:col-span-2 space-y-6">
                    {error && (
                        <Card className="bg-red-500/10 border-red-500/30">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3 text-red-400">
                                    <AlertTriangle className="w-5 h-5" />
                                    <p>{error}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {result && (
                        <>
                            {/* Health Score & Status Header */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="bg-slate-900/40 border-white/10 backdrop-blur-xl">
                                    <CardHeader>
                                        <CardTitle className="text-slate-400 text-sm font-medium">Predicted Health Score</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-baseline gap-2">
                                            <span className={`text-5xl font-bold ${getScoreColor(result.health_score)}`}>
                                                {result.health_score}
                                            </span>
                                            <span className="text-slate-500">/ 100</span>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className={`${result.risk_status === 'RISK' ? 'bg-red-500/10 border-red-500/30' :
                                    result.risk_status === 'WARNING' ? 'bg-orange-500/10 border-orange-500/30' :
                                        'bg-emerald-500/10 border-emerald-500/30'
                                    }`}>
                                    <CardHeader>
                                        <CardTitle className="text-slate-400 text-sm font-medium">Risk Assessment</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-3">
                                            {result.risk_status === 'RISK' ? <AlertTriangle className="w-8 h-8 text-red-400" /> :
                                                result.risk_status === 'WARNING' ? <AlertTriangle className="w-8 h-8 text-orange-400" /> :
                                                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />}
                                            <div>
                                                <div className={`text-3xl font-bold ${result.risk_status === 'RISK' ? 'text-red-400' :
                                                    result.risk_status === 'WARNING' ? 'text-orange-400' :
                                                        'text-emerald-400'
                                                    }`}>
                                                    {result.risk_status}
                                                </div>
                                                {result.disease_name && result.disease_name !== 'Healthy' && (
                                                    <p className="text-sm text-red-300 mt-1 font-semibold">
                                                        Potential Issue: {result.disease_name} ({result.confidence}%)
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Detailed Analysis */}
                            <Card className="bg-slate-900/40 border-white/10 backdrop-blur-xl">
                                <CardHeader>
                                    <CardTitle className="text-white">Expert Analysis</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="text-sm font-medium text-slate-400 mb-2">Smart Suggestions</h4>
                                            <ul className="space-y-2">
                                                {result.suggestions && result.suggestions.length > 0 ? (
                                                    result.suggestions.map((suggestion, idx) => (
                                                        <li key={idx} className="flex items-start gap-2 text-sm text-indigo-300">
                                                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                                                            {suggestion}
                                                        </li>
                                                    ))
                                                ) : (
                                                    <li className="text-sm text-emerald-300">Parameters are optimal.</li>
                                                )}
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-slate-400 mb-2">Active Triggers</h4>
                                            {result.triggers.length > 0 ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {result.triggers.map((trigger, idx) => (
                                                        <span key={idx} className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-sm">
                                                            {trigger}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-sm">
                                                    No active risk triggers
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-lg bg-slate-800/50 border border-white/5">
                                        <h4 className="text-sm font-medium text-slate-400 mb-2">General Recommendation</h4>
                                        <p className="text-white leading-relaxed">
                                            {result.recommendation}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
