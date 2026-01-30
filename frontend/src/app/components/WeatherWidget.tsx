import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Cloud, CloudRain, Sun, Wind, AlertTriangle, CheckCircle2, CloudLightning, Info, Droplets, Thermometer, Gauge, Eye, Zap } from 'lucide-react';
import { Button } from "@/app/components/ui/button";

interface WeatherData {
    weather: {
        temp: number | null;
        description: string;
        access: string;
        icon: string | null;
        humidity: number | null;
        pressure: number | null;
        wind_speed: number | null;
        aqi: number | null;
    };
    impact_analysis: any[];
    digital_twin_location: string;
}

export function WeatherWidget() {
    const [data, setData] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [abnormal, setAbnormal] = useState(false);

    const fetchWeather = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8000/api/weather-impact?abnormal=${abnormal}`);
            const result = await response.json();
            if (!result.error) {
                setData(result);
            }
        } catch (error) {
            console.error("Failed to fetch weather:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWeather();
        const interval = setInterval(fetchWeather, 600000); // 10 mins
        return () => clearInterval(interval);
    }, [abnormal]);

    // Re-fetch when toggling abnormality
    const toggleAbnormal = () => {
        setAbnormal(!abnormal);
    };

    const getWeatherIcon = (desc: string) => {
        if (!desc) return <Cloud className="w-8 h-8 text-slate-400" />;
        if (desc.includes('rain') || desc.includes('storm')) return <CloudRain className="w-8 h-8 text-blue-400 animate-bounce" />;
        if (desc.includes('clear')) return <Sun className="w-8 h-8 text-yellow-400 animate-spin-slow" />;
        if (desc.includes('cloud')) return <Cloud className="w-8 h-8 text-slate-400" />;
        if (desc.includes('thunder')) return <CloudLightning className="w-8 h-8 text-purple-400 animate-pulse" />;
        return <Cloud className="w-8 h-8 text-slate-400" />;
    };

    if (loading && !data) return <div className="animate-pulse h-32 bg-slate-900/40 rounded-xl"></div>;

    if (!data || !data.weather.temp) {
        return (
            <Card className="bg-slate-900/40 border-white/10 backdrop-blur-xl">
                <CardContent className="pt-6 flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-slate-400">Weather Integration</h3>
                        <p className="text-xs text-red-400 mt-1">
                            {data?.weather?.access || "Connection Failed (Check API Key)"}
                        </p>
                    </div>
                    <Cloud className="w-8 h-8 text-slate-600" />
                </CardContent>
            </Card>
        );
    }

    const { temp, humidity, pressure, wind_speed, aqi, description } = data.weather;

    return (
        <Card className={`relative transition-all duration-500 overflow-hidden ${abnormal ? 'bg-red-950/20 border-red-500/50' : 'bg-gradient-to-r from-blue-900/20 to-slate-900/40 border-blue-500/20'} backdrop-blur-xl`}>
            {/* Background glow for abnormal state */}
            {abnormal && <div className="absolute inset-0 bg-red-500/5 animate-pulse z-0 pointer-events-none" />}

            <CardHeader className="pb-2 relative z-10">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className={`${abnormal ? 'text-red-300' : 'text-blue-300'} text-lg flex items-center gap-2`}>
                            {getWeatherIcon(description)}
                            Digital Twin Environment
                        </CardTitle>
                        <p className={`text-xs ${abnormal ? 'text-red-400' : 'text-blue-400/70'} mt-1 flex items-center gap-1`}>
                            <Info className="w-3 h-3" />
                            Live from {data.digital_twin_location}
                        </p>
                    </div>
                    <div className="text-right">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={toggleAbnormal}
                            className={`mb-2 text-xs h-7 border-dashed ${abnormal ? 'border-red-500 text-red-400 hover:bg-red-950/50' : 'border-slate-500 text-slate-400 hover:bg-slate-800'}`}
                        >
                            {abnormal ? <Zap className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                            {abnormal ? 'End Simulation' : 'Simulate Abnormality'}
                        </Button>
                        <div className="text-3xl font-bold text-white tracking-tighter">{Math.round(temp!)}°C</div>
                        <p className="text-xs text-slate-400 capitalize">{description}</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="relative z-10">

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-slate-900/40 p-3 rounded-lg border border-white/5 flex items-center gap-3">
                        <Droplets className="w-5 h-5 text-blue-400" />
                        <div>
                            <p className="text-xs text-slate-400">Humidity</p>
                            <p className="font-bold text-white">{humidity}%</p>
                        </div>
                    </div>
                    <div className="bg-slate-900/40 p-3 rounded-lg border border-white/5 flex items-center gap-3">
                        <Wind className="w-5 h-5 text-teal-400" />
                        <div>
                            <p className="text-xs text-slate-400">Wind Speed</p>
                            <p className="font-bold text-white">{wind_speed} m/s</p>
                        </div>
                    </div>
                    <div className="bg-slate-900/40 p-3 rounded-lg border border-white/5 flex items-center gap-3">
                        <Gauge className="w-5 h-5 text-indigo-400" />
                        <div>
                            <p className="text-xs text-slate-400">Pressure</p>
                            <p className="font-bold text-white">{pressure} hPa</p>
                        </div>
                    </div>
                    <div className="bg-slate-900/40 p-3 rounded-lg border border-white/5 flex items-center gap-3">
                        <div className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold ${aqi! <= 2 ? 'bg-emerald-500 text-black' :
                                aqi! <= 4 ? 'bg-orange-500 text-black' :
                                    'bg-red-500 text-white'
                            }`}>
                            AQI
                        </div>
                        <div>
                            <p className="text-xs text-slate-400">Air Quality</p>
                            <p className={`font-bold ${aqi! > 4 ? 'text-red-400' : 'text-white'}`}>
                                {aqi === 1 ? 'Good' : aqi === 2 ? 'Fair' : aqi === 3 ? 'Moderate' : aqi === 4 ? 'Poor' : 'Hazardous'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-3 mt-2">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Early Warning System</h4>
                    {data.impact_analysis.map((impact: any, idx: number) => (
                        <div
                            key={idx}
                            className={`p-3 rounded-lg border flex items-start gap-3 transition-colors duration-500 ${impact.type === 'RISK' ? 'bg-red-500/10 border-red-500/30' :
                                    impact.type === 'WARNING' ? 'bg-orange-500/10 border-orange-500/30' :
                                        impact.type === 'INFO' ? 'bg-blue-500/10 border-blue-500/30' :
                                            'bg-emerald-500/10 border-emerald-500/30'
                                }`}
                        >
                            {impact.type === 'RISK' || impact.type === 'WARNING' ? (
                                <AlertTriangle className={`w-5 h-5 shrink-0 ${impact.type === 'RISK' ? 'text-red-400 animate-pulse' : 'text-orange-400'
                                    }`} />
                            ) : impact.type === 'INFO' ? (
                                <Wind className="w-5 h-5 shrink-0 text-blue-400" />
                            ) : (
                                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
                            )}

                            <div>
                                <p className={`text-sm font-medium ${impact.type === 'RISK' ? 'text-red-200' :
                                        impact.type === 'WARNING' ? 'text-orange-200' :
                                            impact.type === 'INFO' ? 'text-blue-200' :
                                                'text-emerald-200'
                                    }`}>
                                    {impact.message}
                                </p>
                                {impact.action && (
                                    <p className="text-xs text-slate-400 mt-1 font-mono flex items-center gap-1">
                                        <Zap className="w-3 h-3" /> Action: {impact.action}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
