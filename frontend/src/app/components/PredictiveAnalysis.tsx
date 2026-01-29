import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Button } from "@/app/components/ui/button";
import { AlertTriangle, CheckCircle2, Activity, Loader2 } from "lucide-react";

interface PredictionResult {
    disease_level: number;
    risk_status: string;
    confidence: number;
    recommendation: string;
}

export function PredictiveAnalysis() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<PredictionResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        temperature: 28.5,
        ph: 7.2,
        dissolved_oxygen: 6.8,
        turbidity: 12.3
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: parseFloat(value) || 0
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch('http://localhost:8000/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch prediction');
            }

            const data = await response.json();
            if (data.error) {
                throw new Error(data.error);
            }

            setResult(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-lg bg-teal-500/20 flex items-center justify-center border border-teal-500/30">
                    <Activity className="w-6 h-6 text-teal-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white">Predictive Analysis</h1>
                    <p className="text-slate-400">AI-Powered Disease Risk Assessment</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Form */}
                <Card className="bg-slate-900/40 border-white/10 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-white">Water Parameters</CardTitle>
                        <CardDescription className="text-slate-400">
                            Enter current water quality metrics to analyze disease risk.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="temperature" className="text-slate-300">Temperature (°C)</Label>
                                    <Input
                                        id="temperature"
                                        name="temperature"
                                        type="number"
                                        step="0.1"
                                        value={formData.temperature}
                                        onChange={handleInputChange}
                                        className="bg-slate-800/50 border-white/10 text-white focus:border-teal-500/50"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="ph" className="text-slate-300">pH Level</Label>
                                    <Input
                                        id="ph"
                                        name="ph"
                                        type="number"
                                        step="0.1"
                                        value={formData.ph}
                                        onChange={handleInputChange}
                                        className="bg-slate-800/50 border-white/10 text-white focus:border-teal-500/50"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="dissolved_oxygen" className="text-slate-300">Dissolved Oxygen (mg/L)</Label>
                                    <Input
                                        id="dissolved_oxygen"
                                        name="dissolved_oxygen"
                                        type="number"
                                        step="0.1"
                                        value={formData.dissolved_oxygen}
                                        onChange={handleInputChange}
                                        className="bg-slate-800/50 border-white/10 text-white focus:border-teal-500/50"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="turbidity" className="text-slate-300">Turbidity (NTU)</Label>
                                    <Input
                                        id="turbidity"
                                        name="turbidity"
                                        type="number"
                                        step="0.1"
                                        value={formData.turbidity}
                                        onChange={handleInputChange}
                                        className="bg-slate-800/50 border-white/10 text-white focus:border-teal-500/50"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-400 hover:to-blue-400 text-white font-semibold py-6"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Analyzing Data...
                                    </>
                                ) : (
                                    "Run Health Analysis"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Results Display */}
                <div className="space-y-6">
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
                        <Card className={`border-white/10 backdrop-blur-xl transition-all duration-500 ${result.risk_status === 'HIGH'
                                ? 'bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/30'
                                : 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/30'
                            }`}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-white">Analysis Result</CardTitle>
                                    <div className={`px-4 py-1 rounded-full text-sm font-bold border ${result.risk_status === 'HIGH'
                                            ? 'bg-red-500/20 text-red-300 border-red-500/30'
                                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                        }`}>
                                        {result.risk_status} RISK
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 ${result.risk_status === 'HIGH'
                                            ? 'border-red-500/30 text-red-400 bg-red-500/10'
                                            : 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                                        }`}>
                                        <span className="text-lg font-bold">{result.confidence}%</span>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-sm">Model Confidence</p>
                                        <p className="text-white font-medium">Random Forest Classifier</p>
                                    </div>
                                </div>

                                <div className="bg-slate-900/50 rounded-lg p-4 border border-white/5">
                                    <p className="text-sm text-slate-400 mb-2">Recommendation</p>
                                    <div className="flex items-start gap-3">
                                        {result.risk_status === 'HIGH' ? (
                                            <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                                        ) : (
                                            <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5" />
                                        )}
                                        <p className="text-white leading-relaxed">{result.recommendation}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {!result && !loading && (
                        <div className="h-full flex flex-col items-center justify-center p-12 border-2 border-dashed border-white/10 rounded-xl text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center">
                                <Activity className="w-8 h-8 text-slate-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-slate-300">Ready to Analyze</h3>
                                <p className="text-sm text-slate-500 max-w-xs mx-auto mt-2">
                                    Enter water parameters and click "Run Health Analysis" to get AI-powered insights.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
